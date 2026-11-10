# Kan den originale CM 01/02-kampmotor integreres 1:1 via Bosman Edition?

*Research 2026-11-10. Kilde: `github.com/maxevans60/cm0102-bosman-edition` (klonet `--depth 50`, HEAD `30f79f6`, tags op til
v0.6.1) samt vores egne `docs/ENGINE.md`, `docs/GRID_ENGINE.md` og `docs/QUESTIONS_FOR_BOSMAN.md`. Intet i vores kode er rørt.
Stier uden præfiks er i Bosman-repoet.*

## Resumé

- **Teknisk:** Bosman Edition er ikke en motor, man kan linke til. Det er en *statisk rekompilering* af hele `cm0102.exe`
  (x86 → C, ~11.700 funktioner) oven på en emuleret CPU/x87 og én flad 32-bit hukommelse med originalens PE-billede på
  originalens adresser. Kampmotoren (`CM3_MATCH_ENGINE`) kører på originalens globale objekter (database, Staff, Club,
  Fixture, Injury, taktikblok, tilfældighedspulje) og har ingen API. Den kan kun køre som *hele spillet* – headless er muligt.
- **Determinisme:** Selv originalen er ikke deterministisk (maskinhastighed og kommentarhastighed flytter tilfældighedstallene;
  resultater afhænger af hukommelseslayout). Bosman retter det bevidst (`match_numbers.c`, `layout_reads.c`). "1:1 med
  originalen" er derfor kun veldefineret som "1:1 med Bosman-buildet ved et givet frø", og repoet har ingen test, der
  sammenligner kampresultater med Windows-exe'en – kun same-save-tests mellem egne builds og Unicorn-diff af opstarten.
- **Jura:** Den genererede C er en oversættelse af Eidos/SI's program og er **ikke** dækket af GPLv3 (Max siger det selv).
  Et offentligt serverbaseret eller WASM-baseret spil bygget på den kræver tilladelse fra rettighedshaverne (SEGA/Sports
  Interactive, Square Enix). Det kan ikke gøres juridisk forsvarligt uden licens.
- **Anbefaling:** Integrér ikke motoren. Brug i stedet Bosman-buildet headless på ejerens egen maskine som *orakel*
  (målinger, logning af motorens interne tal via `RT_WRAP`-kroge) til at færdiggøre vores egen gittermotor
  (`docs/GRID_ENGINE.md`). Det er lovligt (studium af et program, man selv har), og det svarer på de åbne spørgsmål i
  `QUESTIONS_FOR_BOSMAN.md`. Fase 4-prototypen er ikke bygget: originalens filer og byggeværktøjerne findes ikke på
  denne maskine, og en offentlig integration er ikke forsvarlig. En konkret opskrift til ejerens maskine står i afsnit 6.

---

## 1. Fase 1 – teknisk undersøgelse

### 1.1 Hvad repoet er

| Spørgsmål | Svar | Belæg |
|---|---|---|
| Rekompilering eller dekompilering? | **Statisk rekompilering instruktion for instruktion** (x86 → C), ikke Ghidra-C. "The output is exact by construction." | `docs/specs/2026-10-14-recompile-spec.md` (Decisions), `tools/recomp/translate.py:1-6` |
| Sprog/runtime | C11; runtime i `src/recomp_rt/` emulerer registre, flags, x87 (som `double`, CW 0x27f) og én flad hukommelse `g_mem`. Windows-importer (user32, ddraw, dsound, kernel32, wsock32 …) er erstattet med SDL2-kode i `src/recomp_rt/win/*.c` (312 filer). | `src/recomp_rt/rt.h:1-30, 130-160`, `CMakeLists.txt:552-604` |
| Hvor er originalens kode? | **Ikke i repoet.** `tools/recomp/recomp.py` læser spillerens egen `cm0102.exe` (3.9.68) ved build og skriver `build/recomp/gen/fn_000.c … fn_127.c` (128 shards). "The generated C is a translation of the original. It goes into the build folder and is not committed." | `tools/recomp/recomp.py:1-22`, `CMakeLists.txt:552-583`, `CONTRIBUTING.md` |
| Omfang | 9.241 kendte funktioner + 2.506 fundet via datapointere = 11.706 oversatte; 6.609 er spilkode, resten CRT/unwind-stubs. | `docs/research/2026-10-16-function-map-estimate.md` |
| Hukommelseslayout | `host_reserve(4 GB + 64 KB)` med `MAP_NORESERVE`; PE-sektioner på originalens VA'er; spilstak 16 MB ved `0x10000000`; heap fra `0x70000000`, arena 2032 MB til `0xEF000000`; `RT_RETURN_ADDR 0x40000000`. Pointere forbliver 32-bit. | `src/recomp_rt/rt.c:25-56`, `src/recomp_rt/host/posix.c:22-26`, `src/recomp_rt/win/main.c:35-37`, `src/recomp_rt/rt_host.h:13-15`, `src/recomp_rt/heap.c:1-21` |
| Tråde | Ingen. Én global `cpu`, `fpu`, `g_mem`; CreateThread er ikke importeret. Én spilinstans pr. proces. | `src/recomp_rt/rt.c:11-13`, grep i `src/recomp_rt/win` |
| CRT | MSVC-CRT'en rekompileres med spillet, så `rand`, `qsort`, `sprintf` er originalens. SEH/C++-exceptions emuleres over `fs:[0]`-kæden i C. | recompile-spec "Decisions", `src/recomp_rt/win/seh.c:1-8` |
| Kroge | `RT_REPLACE(addr)` erstatter en funktion, `RT_WRAP(addr)` omslutter den (`o_<addr>` = originalen), `RT_IMPORT(name)` erstatter en import. Buildet stopper, hvis de første 8 bytes på adressen ikke matcher. | `src/recomp_rt/rt.h:287-291`, `tools/recomp/callbacks.py:1-12` |

### 1.2 Kampmotoren – funktioner og datastrukturer

Funktionskortet (`docs/research/function-map/*.cpp.md`, CC BY 4.0, 398 filer) placerer motoren i fem kildefiler fra
originalen. Navnene er modelgenererede første bud ("Treat a low or medium name as a hint"); adresserne er sikre.

| Område | Funktion (adresse) | Noter | Belæg |
|---|---|---|---|
| Motorobjekt | `CM3_MATCH_ENGINE::CM3_MATCH_ENGINE` 0x6b7e50, `init_match` 0x6b7f20 `(this, FIXTURE*, quick_simulate, commentary_obj_or_null, watched)`, `run_match_steps` 0x6b98c0 `(this, step_count; -1 = til slut)`, destruktor 0x6b97a0 | thiscall på et objekt af ca. 0xf600 bytes (sidemål ved +0xf5bd/+0xf5f3, minut ved +0x8ed0, fixture-kopi ved +0x4792) | `function-map/match_eng.cpp.md`, `src/recomp_rt/win/tier_a.c:42-60` |
| Hurtigmotor | `quick_simulate_match` 0x6beeb0 – statistisk simulering pr. minut for baggrundskampe; `match_day_can_quick_simulate` 0x6b66a0 afgør hvem (aldrig menneskeklubber) | Der er altså **to** motorer i originalen | `match_eng.cpp.md`, `match_day.cpp.md` |
| Tik-løkke | rækkefølge `build_action_order` 0x6bd760, målfelt `get_player_target_cell` 0x6c2be0, pres 0x6bd6b0 | Vores `GRID_ENGINE.md` porterer disse | `match_eng.cpp.md` |
| Sider/taktik/AI | `MATCH_MAN::init` 0x6db500 (10 argumenter: engine, Staff* manager, Staff** squad, MATCH_PLAYER*, side, Club*, Club* opponent, Fixture*, out_count), `pick_team` 0x6dbc50, `set_computer_instructions` 0x6ddab0, `make_substitutions` 0x6e1090, `reassign_positions` 0x6e1aa0, `assign_players_to_positions` 0x6e2000 | Taktikblokken er 0x18e3 bytes kopieret fra managerens record (`FUN_005fbd00`) | `match_man.cpp.md`, `docs/research/2026-10-14-assistant-and-days-inventory.md:18-26` |
| Spillere | `MATCH_PLAYER::calc_match_attributes` 0x6ec010 (3.139 bytes), `roll_current_ratings` 0x6f44a0, `pass` 0x6fad40 (6.876 bytes), `take_shot` 0x702050 (10.263 bytes), `recover_condition_at_break` 0x6f5810 | 99 funktioner | `match_pl.cpp.md` |
| Dommer | `MATCH_OFFICIAL::init` 0x6e9470, `judge_tackle` 0x6e9820, `decide_foul_punishment` 0x6ea4e0 | | `match_official.cpp.md` |
| Skader | i kampen: knocks 0x6cfe10/0x6d0980; efter kampen `Injury::apply_match_effects` 0x62c080, `record_match_injury` 0x62be00, `add_injury` 0x62d250 | Injury-objektet er globalt og gemmes i `injury.dat` | `injury.cpp.md` |
| Kommentar | `Match_Events::add_event` 0x6d6f70 (12-posts ring), `get_next_event` 0x6d78b0, `show_event_text` 0x6d7b00, `match_events_read_config` 0x6d9e50 læser `Data/events_<lang>.cfg` (id 8000–8676) | Teksterne er originalens data | `match_events.cpp.md`, `docs/research/2026-10-15-commentary-speed-inventory.md` |
| Kampdag | `MATCH_DAY::play_matches` 0x6b4360, `step_live_match` 0x6b55c0, `start_next_background_match` 0x6b5a70, `step_background_match` 0x6b5ce0, `apply_match_result` 0x6b5f00 (tabel, økonomi, kontrakter, skader, rekorder) | Motoren kaldes kun herfra | `match_day.cpp.md` |

### 1.3 Tilfældighedstal (RNG)

`utils_random` 0x90cfc0 tager hvert tal fra en **pulje på 51.000 dwords ved 0xaa2454 i exe'ens datasektion**; pointeren
`[0xde1f60]` rykker ét ord pr. kald, offset `[0xde1f5c]` lægges til, og ved puljens ende hentes nyt offset fra MSVC
`rand()` 0x946a04 (frø ved 0xad6c30). Frøet sættes af `rnd_seed` 0x90d0a0 fra `time()` eller `-seed` på kommandolinjen.
(`docs/research/2026-10-14-start-screen-helpers.md` §6, `src/recomp_rt/win/match_numbers.c:1-50`.)

Konsekvenser:
- Puljen er originalens data. "The project rule forbids copying it into the repo, so a port that wants the same sequence
  must read it from the user's cm0102.exe at run time." (samme dok, §"Open")
- Alle dele af spillet deler én strøm: menneskets kamp, baggrundskampe, skærmbaggrunde (3 kald pr. nyt billede) og de daglige
  opdateringer. Antallet af skærmløkke-pas mellem to klik afgør, hvilke tal kampen får. "In the original, a match result
  already depends on the commentary speed and on the machine speed." (commentary-speed-inventory §"inference")
- Bosman giver baggrundskampe en **egen** pointer/offset/CRT-frø pr. kampdag (`match_numbers.c`), og tests kører med
  `RECOMP_FIXED_CLOCK=1` og `-seed`. Dette er en bevidst afvigelse fra originalen (`RECOMP_ORIGINAL_FAULTS=keep:match_numbers`
  slår den fra).

### 1.4 Kan motoren køre uafhængigt af hovedløkken?

Nej, ikke som bibliotek:
- `init_match` tager en `FIXTURE*` og bygger siderne med `MATCH_MAN::init` fra `Staff`, `Club`, managerens taktikrecord,
  `Injury`-objektet og klubbens gemte udvalg `[0xde1d08]`; kampdagen ligger i `[0xb67a50]`. Alt dette er originalens
  in-memory database, indlæst af `Database.cpp` fra `Data/*.dat`.
- Resultatet skrives tilbage af `apply_match_result` 0x6b5f00 til turnering, økonomi, kontrakter, skader og rekorder.
- Originalen læser steder i hukommelsen, "that nothing set", så spillet "followed the memory layout" (åbent punkt 138b).
  Bosman giver nu 11 grupper af sådanne læsninger definerede værdier (`src/recomp_rt/win/layout_reads.c`, slås fra med
  `RECOMP_LAYOUT_FIXES=keep`). Dvs. adfærden afhænger af heapens tilstand, som igen afhænger af alt, hvad spillet har
  gjort før kampen.
- Der findes ingen entry, der kører én kamp fra "rene" input. Det nærmeste er Tier A-krogen, der *erstatter*
  `quick_simulate_match` med et omdømmebaseret resultat (`tier_a.c:42-63`) – det viser, at man kan omslutte motorfunktioner
  med `RT_WRAP`, men også at hele spillet skal køre udenom.

Det, der kan lade sig gøre: **hele spillet headless.** `SDL_VIDEODRIVER=dummy SDL_AUDIODRIVER=dummy RECOMP_NO_BOX=1
RECOMP_USER_DIR=… RECOMP_SCRIPT="<ms> click x y; …; quit"` styrer spillet uden person (`src/recomp_rt/win/user32.c:6-18`,
`CMakeLists.txt:609-626`), og feriefunktionen spiller sæsoner automatisk (`tests/seasons/soak_run.py`).

### 1.5 Afhængigheder

- Spillerens egen `cm0102.exe` 3.9.68 (kodebytes, RNG-pulje, ressourcer) og `Data/` (database `.dat`, `events_<lang>.cfg`,
  `.lng`, `pics.cfg`). `tools/clean_files/make_clean_files.py` laver dem fra `CM0102.iso` (2008-frigivelsen) +
  `cm0102_3968.exe` og tjekker hashes (`manifest.tsv`).
- Build: CMake ≥ 3.20, C-compiler, Python 3 + `capstone`, SDL2; mbedTLS 3.6 hentes af CMake (online-spil). Linux-release
  bygges i en Ubuntu 22.04-container; rekompileringen af hele spillet brugte 8,3–8,9 GB RAM, før den blev strømlinet
  (`tools/recomp/recomp.py:160-170`).
- Kørsel: SDL2 (11 runtime-filer bruger det; dummy-drivere til headless), 4 GB virtuelt adresserum pr. proces, reelt
  163–380 MB heap for et "Select All"-spil efter én sæson (`heap.c:10-12`), voksende ~9 MB/år i Tier A.
- Hastighed (M5 Max, alle nationer): et normalt spilår ≈ 7 × Tier A's 4–6 minutter, dvs. ca. 30–40 minutter pr. sæson med
  fuld motor i baggrundskampene (`docs/TESTING.md` "Tier A runs"). Tiden pr. enkeltkamp er ikke målt i repoet.

### 1.6 Eksisterende tests og save-sammenligninger

- **Same-save checks** (`tests/smoke/smoke_run.py --same-save`/`--match`): samme klik med en option til/fra, så
  byte-sammenligning af gemte spil; `--match` indlæser `prematch.sav` og spiller 5 dage (16.–21.7.01).
  **Det sammenligner Bosman-builds med hinanden, ikke med Windows-originalen.** Testspillene er ikke i repoet
  ("Never commit … saved games").
- **Differentiel test** (`tests/diff/run.py`, `original.py`) mod en Unicorn-kørsel af originalen – kun for databaseindlæsning,
  skærme og opstart ("after the database load, after game creation, after each game day" er målet i spec'en; `cases_*.py`
  dækker area/font/input/leagues/select/start). Ingen kampmotor-case.
- `match_timing_run.py` viser, at *uden* `match_numbers`-rettelsen gav to langsomme kørsler andre kampe (6.11.2026).
- Konklusion: Belægget for "samme adfærd som originalen" er oversættelsesmetoden (instruktionsniveau, CRT inkluderet,
  x87 som 53-bit double) plus Unicorn-diffen af opstarten – ikke reproducerede kampresultater. Det er sandsynligt, men ikke
  bevist, at en kamp med samme frø og samme hukommelsestilstand giver samme resultat som Windows-exe'en.

---

## 2. Fase 2 – integration

Fælles forudsætning for A og B: man kan ikke "kalde motoren" med vores spiltilstand. Enten (1) bliver originalen *hele
simuleringen* (database, transfers, skader, kontrakter …) og vores UI en front-end – hvorved vores motor, vores
`world.json`, vores features og vores gemte spil skal erstattes – eller (2) man bygger en **tilstandsbro**, der skriver
vores spillere, klubber, taktikker (0x18e3-byte-blok), skader, dommere og fixture ind i originalens strukturer før
`init_match` og læser begivenhedsloggen ud bagefter. Broen kræver datakortet for hundredvis af felter, hvoraf mange er
"medium/low confidence" i `docs/research/data-map/`, og den ville stadig ikke give samme tal som originalen, fordi heapens
layout og RNG-strømmen er anderledes.

### A. Isoleret Linux-backend-proces med API

| | Vurdering |
|---|---|
| Form | Én `cm0102_recomp`-proces pr. gemt spil (container/sandbox), egen `RECOMP_USER_DIR`, `-seed`, `RECOMP_FIXED_CLOCK`. Styring via nye `RT_WRAP`-kroge på dagsløkken (0x5cccd0) og `MATCH_DAY::play_matches`, der læser kommandoer fra en socket/fil og skriver begivenheder (JSONL) ud. |
| Sikkerhed/flere spil | Fint: ingen tråde, ingen delt tilstand; 4 GB virtuel reservation er gratis på Linux (`MAP_NORESERVE`); reelt 200–500 MB RSS pr. spil. Vercel-funktioner kan ikke køre det (langlevende, SDL, 4 GB adresserum); det kræver en egen server/VM. |
| Determinisme | God *inden for* Bosman-buildet: samme binær, frø, klik og tempo ⇒ samme save (det er netop same-save-testens præmis). Kræver at *alle* kampe spilles med fuld motor eller med Bosmans regler for hurtigmotor, og at ingen skærm åbnes anderledes (skærme flytter heap-blokke, jf. "Five files can differ only when the option opens a screen"). |
| Indsats | Build-pipeline med ejerens clean files på serveren (1 uge); styreprotokol i runtime (2–4 uger); bro til vores spiltilstand (måneder, aldrig færdig) **eller** fuld udskiftning af vores simulering (meget større). |
| Risici | Juridisk (afsnit 3): originalens kode og data skal ligge på en offentlig server. Teknisk: dagsløkken er UI-drevet (skærmløkke, holiday-hold 2 s), så et "API" er reelt en scriptet UI. Fejl i originalen (assert-bokse, item 188) stopper processer. |

### B. WebAssembly i browseren

| | Vurdering |
|---|---|
| Compiler | Emscripten kan i princippet oversætte gen/*.c + runtime: ren C11, `memcpy`-baserede læs/skriv, ingen tråde, SEH i C. `rt_unwinding`-mekanismen (resume-entries) og `_setjmp3` kræver `-sSUPPORT_LONGJMP`. SDL2 findes i Emscripten, men ville blive stubbet. |
| Hukommelse | **Det afgørende problem.** Programmet forudsætter faste 32-bit adresser: stak ved 0x10000000, heap fra 0x70000000 til 0xEF000000. wasm32's lineære hukommelse er sammenhængende fra 0 og *committes* ved vækst, så blot at nå heapbasen kræver ≥ 1,8 GB lineær hukommelse; fuld arena ≈ 3,75 GB (wasm32-loft 4 GB, kun nyere Chrome/Firefox; iOS Safari tillader langt mindre pr. fane). Vores spil er en mobil PWA. At flytte heapen ned (nye konstanter i `rt_host.h`) ændrer alle pointere og dermed sorteringer og layout-afhængige læsninger ⇒ ikke længere samme adfærd som Bosman, og ingen test dækker det. |
| Størrelse/ydelse | 11.706 funktioner ved `-O1` giver skønsmæssigt 20–60 MB wasm (ikke målt – intet build muligt her). Flagemuleringen koster 15–20 % selv nativt (`rt.h:63-66`). |
| Determinisme | wasm er IEEE-deterministisk og single-threaded, så *givet* samme hukommelseslayout ville den være lige så deterministisk som A. |
| Data | `cm0102.exe` (RNG-pulje, kodebytes læses ikke ved kørsel, men ressourcer og `rt_exe_data`), `Data/*.dat` og `events_*.cfg` skulle sendes til browseren. |
| Indsats/risiko | 1–2 måneder for et bevis-af-koncept; høj teknisk risiko (hukommelse), og juridisk den værste variant: den oversatte exe *distribueres* til alle brugere. |

### C. Originalen som orakel (anbefalet)

Bosman-buildet køres headless på ejerens egen maskine. `RT_WRAP`-kroge logger motorens indre tal (tik, boldholderens valg
`sub_7109f0`, afleveringsudfald `sub_6fad40`, skudpoint/w29 i `sub_700bd0`/`sub_702050`, dueller `sub_6c87e0`,
udskiftningsvalg `sub_6e2000`) til JSONL. Vores egen gittermotor kalibreres mod de målte fordelinger, og reglerne
gen-implementeres som i dag (`cm0102-original-rules.ts`). Ingen originalkode eller data forlader ejerens maskine.
Indsats: 1 uge build + 2–3 uger instrumentering. Juridisk forsvarligt (afsnit 3.5).

---

## 3. Fase 3 – jura

*Ikke juridisk rådgivning; en struktureret vurdering, der peger på, hvad der kræver en advokat.*

### 3.1 Hvad er ophavsretligt beskyttet, og af hvem

| Komponent | Rettighedshaver | Status |
|---|---|---|
| `cm0102.exe` (programkode, inkl. RNG-puljen i datasektionen) | Sports Interactive (nu ejet af SEGA) som udvikler; Eidos (nu Square Enix) som udgiver af 2001/02-udgaven | Beskyttet. 2008-frigivelsen var *gratis at hente*, ikke en kildelicens; den giver ingen ret til oversættelse/bearbejdning. |
| Den genererede C (`gen/fn_*.c`) og enhver binær/WASM bygget af den | Afledt værk (bearbejdning/oversættelse) af exe'en | **Ikke open source.** README: "The licence covers only the code written for this project, not the original game." Bosman undgår problemet ved aldrig at committe den – men *distribuerer* den i downloads sammen med spilfilerne. |
| `Data/*.dat`, `events_*.cfg`, `.lng`, billeder, logo | SI/Eidos; databaser fra Update Team (champman0102.co.uk) | Beskyttet (data og tekster). Vores `world.json` er allerede afledt af disse data – en eksisterende eksponering i samme kategori som fan-sider. |
| Runtime (`src/recomp_rt`), rekompiler (`tools/recomp`), kroge, sæsontabeller, server | Max Evans m.fl. | **GPLv3 fra 0.6.0**; CC0 1.0 til og med v0.5.0 (tag `v0.5.0`: `LICENSE` = CC0, README: "released under CC0 1.0"). |
| Function map / data map (`docs/research/function-map`, `data-map`) | Projektet | CC BY 4.0 (kildehenvisning kræves). |
| mbedTLS | Arm/Mbed | Apache-2.0 eller GPL-2.0+ (`packaging/licences`). |
| Navnet "Championship Manager" | Square Enix (varemærke) | Kun nominativ brug. |

### 3.2 Hvad lovgivningen tillader (EU/DK, softwaredirektivet 2009/24/EF, ophavsretsloven §§ 36–37)

- Oversættelse og bearbejdning af et program kræver rettighedshaverens samtykke (art. 4(1)(b)). En rekompilering af exe'en
  er netop det.
- Undtagelser: art. 5(3) (observere, studere og afprøve programmet, man lovligt bruger, for at finde idéer og principper) og
  art. 6 (dekompilering, men *kun* for interoperabilitet med et selvstændigt udviklet program, og resultatet må ikke bruges
  til et program, der i det væsentlige svarer til originalen). Ingen af dem dækker at køre en oversat kopi af motoren som
  motor i et andet produkt. Idéer, algoritmer og regler er derimod *ikke* beskyttet (art. 1(2)) – det er grundlaget for vores
  nuværende fremgangsmåde (mål, læs reglerne, gen-implementér).
- "Freeware" fra 2008: Eidos gjorde spillet gratis at hente; der er ingen offentlig licenstekst, der tillader bearbejdning
  eller videredistribution. Fællesskabets 20 års tolerance er ikke en licens.

### 3.3 GPLv3-forpligtelser

- **Server (A):** GPLv3 har ingen netværksklausul (det er AGPL's § 13). At køre Bosmans runtime på en server uden at
  *convey* binærer udløser ingen kildekrav. GPL § 13 gælder kun, hvis AGPL-kode kombineres ind. Vores egne kroge i
  runtime'en ville være afledte af GPL-kode; det forpligter først ved distribution.
- **WASM (B):** at sende .wasm til browsere er *conveying*. Så skal den tilsvarende kildekode til GPL-delene (runtime,
  kroge og vores lim, der linkes ind) stilles til rådighed under GPLv3, med licensnotits. Det er håndterbart – men den
  oversatte exe-kode i samme .wasm kan vi *ikke* licensere, hverken GPL eller andet; GPL-kompatibilitet er irrelevant, for
  det er ulicenseret tredjepartskode.
- Hvis man ville undgå GPL: v0.5.0-snapshottet er CC0 (ældre rekompiler/runtime uden sæsonlogik og online), men det ændrer
  intet ved exe-problemet.

### 3.4 Hvad en offentlig drift ville kræve

- En *licens* fra SEGA/Sports Interactive (koden) og formentlig Square Enix (udgiverrettigheder, varemærke) til at bearbejde og
  køre spillet som tjeneste. Uden den: reproduktion på server + tilrådighedsstillelse af en tjeneste bygget på en ulovlig
  bearbejdning; ved WASM desuden distribution. Risiko: takedown mod cm0102reborn.com, Vercel-kontoen og GitHub-repoet samt
  erstatningskrav. At tjenesten er gratis mindsker, men fjerner ikke, risikoen.
- Update Team-databaser: egen tilladelse (de er ikke frie).
- Kommentartekster (`events_*.cfg`, 677/2.118 linjer) er sproglige værker; brug i vores spil kræver også tilladelse (vi
  har i dag kun *studeret* dem, jf. ENGINE.md).

### 3.5 Hvad er forsvarligt uden advokat

- Privat kørsel af Bosman-buildet på ejerens egen maskine med ejerens egen kopi, til at studere og måle spillet (art. 5(3)).
- Gen-implementering af observerede regler, konstanter og fordelinger i vores egen kode (idé/princip, ikke udtryk). Jo
  mere vores gittermotor nærmer sig en *linje-for-linje* port af dekompilerede funktioner (`GRID_ENGINE.md`: "Portene er
  kopieret fra cm-01-02-bosman-edition/app/"), desto tættere kommer den på udtrykket. Det bør vurderes – korte formler og
  tærskler er uproblematiske, lange 1:1-porte (fx `sub_6fad40` på 6.876 bytes) er en gråzone, der kræver rådgivning.
- Alt, der lægger originalens kode eller data på en offentlig server eller i browseren, kræver tilladelse eller rådgivning.

---

## 4. Fase 4 – prototype

**Ikke udført.** Betingelsen "teknisk OG juridisk forsvarligt" er ikke opfyldt for integrationen (afsnit 2–3). Desuden mangler
forudsætningerne på denne maskine: ingen `cm0102.exe`, ingen `~/Library/Application Support/cm0102`, ingen tidligere
Bosman-build, ingen `cmake`, `capstone` eller `emcc` (tjekket med `which`, `mdfind`, `ls`). Jeg har ikke hentet ISO'en
eller patchen – det ville være at kopiere originalens filer, som vi ikke har her, og at redistribuere dem er udelukket.

Det, der *er* undersøgt uden build, og de uløste afhængigheder en prototype ville møde:

| Afhængighed | Status |
|---|---|
| Rene filer (`clean-3968/`) fra ejerens ISO + 3.9.68-patch, hash-tjekket af `make_clean_files.py` | Findes kun hos ejeren |
| `cmake -S . -B build -DCM0102_EXE=… -DRECOMP_PYTHON=…` + `--target cm0102_recomp` | Kræver capstone, SDL2, ~9 GB RAM første gang |
| Et testgemt spil før en kamp (`prematch.sav`) | Ikke i repoet; laves med `RECOMP_SCRIPT` |
| Reproducerbarhed | `-seed N` + `RECOMP_FIXED_CLOCK=1` + samme script og tempo ⇒ samme save (Bosmans egen testpræmis) |
| Sammenligning med Windows-originalen | Ingen eksisterende metode for kampe; ville kræve samme save kørt i Windows-exe'en med samme `-seed` og identisk klikfølge – og selv da flytter maskinhastigheden RNG-strømmen i originalen |

Konklusionen "aldrig påstå 1:1 uden reproducerbare tests" står: en sådan test findes ikke i dag, og originalen gør den
svær at lave.

---

## 5. Foreslået arkitektur (C – orakel, ikke integration)

```
Ejerens Mac (privat)                                   CM Reborn (offentligt)
┌───────────────────────────────────────────┐          ┌───────────────────────────┐
│ clean-3968/ (egen kopi)                   │          │ src/game/engine/grid/     │
│ cm0102_recomp (Bosman, headless, GPLv3)   │  JSONL   │   loop.ts, ballCarrier.ts │
│  + research-kroge (RT_WRAP) → log         │ ───────► │   shot.ts, passOptions.ts │
│  RECOMP_SCRIPT / ferie / -seed            │ (tal,    │ tests/gridEngine.test.ts  │
│ scripts/orig-save-dev.py, original-stats  │ ikke     │ docs/GRID_ENGINE.md       │
│                                           │ kode)    │ cm0102-original-rules.ts  │
└───────────────────────────────────────────┘          └───────────────────────────┘
```

- Krogene lægges i en *lokal* gren af Bosman-repoet (GPLv3-kompatibelt; intet distribueres). Kun målinger (fordelinger,
  tællere, konstanter) krydser grænsen – aldrig kodebytes, puljen eller datafiler.
- Vores motor forbliver vores egen implementering; "original-profilen" kalibreres mod oraklets tal, som i `ENGINE.md` trin 0–15,
  men nu med tal fra *motorens indre* og ikke kun sæsonstatistik.

## 6. Faseopdelt plan med indsatsestimater

| Fase | Indhold | Indsats | Betingelse |
|---|---|---|---|
| 0. Beslutning | Ejeren vælger C (orakel) frem for A/B. Eventuelt uformel kontakt til SI/SEGA om et kommende spørgsmål om licens – til orientering, ikke som forudsætning for C. | 1 dag | – |
| 1. Headless build | På ejerens Mac: `pip install capstone`, `make_clean_files.py CM0102.iso cm0102_3968.exe ../clean-3968`, `cmake … --target cm0102_recomp`. Verificér reproducerbarhed: to kørsler med `-seed 2001`, `RECOMP_FIXED_CLOCK=1`, `SDL_VIDEODRIVER=dummy`, samme `RECOMP_SCRIPT` ⇒ byte-ens save (`tests/smoke/smoke_run.py --same-save`). | 3–5 dage | Ejerens egne filer |
| 2. Orakel-sæsoner | Script: nyt spil (England), ferie en hel sæson, gem hver 1/7. Læs med `scripts/orig-save-dev.py` og `scripts/original-stats.ts`. Giver målscorere, skud, kort, offside pr. kamp for *flere* frø (i dag kun én feriesæson). | 1 uge | Fase 1 |
| 3. Instrumentering | `RT_WRAP` på 0x6b98c0 (tik), 0x7109f0 (boldholder), 0x6fad40 (aflevering: type, afstand, udfald), 0x700bd0/0x702050 (skudpoint, w29, +0x37, keeperværdi, udfald), 0x6c87e0/0x6e9820 (dueller/frispark), 0x6e2000/0x6e1090 (udskiftning), 0x6cfe10 (knocks). Log celle, minut, spiller-id, tal → JSONL. Besvarer QUESTIONS_FOR_BOSMAN 3a–3g og 5a–5e med målinger i stedet for gæt. | 2–3 uger | Fase 1 |
| 4. Kalibrering | Gittermotorens ukendte kroge (`GRID_UNKNOWN`) erstattes af målte fordelinger; `scripts/grid-stats.ts` mod oraklets sæsontal; tests. | 2–4 uger, løbende | Fase 3 |
| 5. (Kun hvis licens opnås) Server A | Styreprotokol i runtime, container pr. spil, bro eller fuld udskiftning af simulering. | 2–3 måneder + | Skriftlig licens fra rettighedshaverne |

## 7. Åbne spørgsmål

1. **Licens:** Vil SEGA/SI/Square Enix give en skriftlig tilladelse til serverdrift af en rekompileret CM 01/02? Uden den er
   A og B lukkede. (Kræver advokat at formulere.)
2. **Vores gittermotor:** Hvor tæt på dekompileret udtryk er porterne i `src/game/engine/grid/`? Bør vurderes af en jurist,
   og porte bør omskrives til egne formuleringer, hvor de er lange.
3. **1:1 mod Windows:** Har Bosman eller nogen anden nogensinde vist, at `cm0102_recomp` og `cm0102.exe` giver samme
   kampresultat fra samme save og frø? Repoet indeholder ingen sådan test. Spørg Max.
4. **Tid pr. kamp** i fuld motor (ikke målt i repoet) – afgør om orakel-sæsoner med fuld motor for alle kampe er praktiske.
5. **Hurtigmotoren:** originalen spiller baggrundskampe uden menneskeklub med `quick_simulate_match` 0x6beeb0, når
   `match_day_can_quick_simulate` tillader det. Vores "originalens tal" (ENGINE.md) blander derfor to motorer. Skal
   kalibreringen skelne?
6. **Update Team-databaser** (2026/27): tilladelse til vores `world.json` bør afklares uafhængigt af denne rapport.
7. **Kommentartekster:** vores 677 kampsituationer er "studeret" fra `events_eng.cfg` – hvor meget tekst er genbrugt ordret?
