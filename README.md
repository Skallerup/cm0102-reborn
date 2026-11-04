# CM Reborn ⚽

**CM Reborn** er et moderne fodboldmanagerspil inspireret af de klassiske **Championship Manager**-spil – med mange nye idéer oveni. Spillet kører i browseren som PWA og virker derfor også offline og på iPad/mobil. Standarddatabasen er **October 2026-opdateringen** med ~22.700 rigtige spillere og de aktuelle trupper til **sæsonen 2026/27**.

> Uofficiel fan-hyldest uden kode fra det originale spil. Databaserne er Championship Manager 01/02-data (den originale 3.9.68-database og fællesskabets October 2026-opdatering), og det klassiske tema bruger baggrundsbilleder fra fællesskabets *Sunday League Pack*. Championship Manager © Sports Interactive / Eidos.

**Spil det her:** https://cm0102reborn.com (spejl uden server: https://skallerup.github.io/cm0102-reborn/)

## Features

Alt det, vi husker fra de klassiske managerspil:

- **Rigtige spillere og klubber:** standarddatabasen har 38 ligaer, 641 klubber og ~22.700 spillere med aktuelle trupper til 2026/27. Den originale 01/02-database (2001/02) har 33 ligaer, 559 klubber og ~18.700 spillere
- **Draft-liga:** fiktive klubber drafter 16 spillere hver fra databasens 500 bedste, enten med snake-draft eller auktion. Draften styres af serveren, og bagefter følger ekspertens karakterer, sæsonprognose og et delbart draftkort. Ingen økonomi eller transfers, kun fodbold
- **Klassisk CM 01/02-tema** (vælges i Indstillinger → Farvetema): klubfarvet titelbjælke, sidebar, faner og bundlinje med Tilbage/Frem, klassiske skærme for trup, spillerprofil, træning, transfers og kampdag samt skiftende baggrundsbilleder
- **CM 01/02-attributter:** 1–20-skala med tekniske, mentale, fysiske og målmandsattributter. Dertil skjulte attributter (CA/PA, Consistency, Important Matches, Injury Proneness …) og positionsratings (GK/SW/D/DM/M/AM/F/WB + højre/venstre/central)
- **Tekstkommentar** linje for linje i valgfri hastighed. Mål blinker, og du kan følge vidiprinteren med de andre kampe
- **Taktik:** 12 formationer og drag-and-drop på banen. Holdinstruktioner (mentalitet, afleveringer, tempo, bredde, presspil, tacklinger, markering, offsidefælde, kontra), individuelle instruktioner og dødboldsskytter
- **Udskiftninger og taktikændringer** midt i kampen
- **Turneringer:** ligaer med op-/nedrykning, split-format (Superligaen, Skotland, Østrig), playoffs (Championship, Serie B, LaLiga 2, Bundesliga-relegation), nationale pokalturneringer og de europæiske turneringer i det **nye UEFA-format (2024/25-)**: **Champions League**, **Europa League** og **Conference League** spiller en 36-holds ligafase (én samlet tabel, 8 kampe i CL/EL og 6 i Conference), hvorefter nr. 1-8 går direkte i 1/8-finalen, nr. 9-24 i en knockout-playoff og nr. 25-36 er ude. Forlænget spilletid og straffesparkskonkurrence er med
- **Transfers:** bud, modbud, "ikke til salg", kontraktforhandling, lejeaftaler, fri transfers, **Bosman-aftaler**, transferliste og ophævelse af kontrakter
- **Træning:** træningsprogrammer pr. spiller. Udviklingen afhænger af alder, potentiale, trænere, faciliteter, spilletid og spillerens vilje/professionalisme
- **Bestyrelse:** forventninger, tillid, advarsler, fyring og budgetanmodninger
- **Jobmarked:** AI-managere fyres og ansættes, og du får jobtilbud eller kan søge ledige stillinger
- **Staff:** assistent, trænere, fysioterapeuter og scouts. Ansættelse og fyring
- **Økonomi:** billetindtægter, TV-penge, sponsorer, præmiepenge, lønbudget og transferbudget
- **Ungdom og regens:** årlig ungdomsårgang med sjældne wonderkids. Spillerne går på pension
- **Historik:** mestre, topscorere, årets spiller, årets talent, trofæskab og managerkarriere
- **Gem/indlæs** i browseren (IndexedDB) og **eksport/import** af save-filer mellem enheder
- **Online multiplayer** (2–8 managere): opret et spil og send invitationslinket, så styrer hver sit hold i samme verden. Alle laver deres ændringer og trykker "Klar". Når alle er klar, spilles der frem til efter næste kampdag
- **Klublogoer** for de europæiske ligaer. De hentes ved kørsel fra [luukhopman/football-logos](https://github.com/luukhopman/football-logos) via jsDelivr og ligger ikke i repo'et
- **Valuta:** euro, danske kroner eller britiske pund
- **Stadion og anlæg:** udvid stadion, byg bedre træningsanlæg eller ungdomsakademi (bestyrelsen skal godkende, og byggeriet tager måneder). Billetpris-hjælper viser forventede tilskuere og indtægter ved forskellige priser
- **Scouting:** scouternes fund med dato og "Ny"-mærke. Scouterne vurderer kort, om de anbefaler en spiller, og hvorfor
- **Træning:** udviklingsgraf på spillerprofiler, og assistenten foreslår træning
- **Bestyrelsen** kommenterer kampe og sejrs- og nederlagsrækker og kan fyre dig. AI-klubber fyrer deres managere, og du kan søge ledige jobs
- **Langtidstestet:** `npx tsx scripts/long-run.ts 6` kører 6 sæsoner og måler regens, pensioner, truppe og økonomi

## De 10 forbedringsforslag

Før byggeriet blev der stillet 10 forslag til forbedringer. De 8 valgte er implementeret:

| # | Forbedring | Status |
|---|---|---|
| 1 | To databaser (moderne + ægte CM 01/02-data) | ✅ Kom senere: CM 2026/27 og den originale 01/02 (3.9.68) |
| 2 | **Browser/PWA**: offline, iPad/mobil, gemmer lokalt | ✅ |
| 3 | **Gennemsigtig matchmotor**: xG, momentum-graf, zone-heatmap, skudkort og assistentens dom over kampen | ✅ |
| 4 | **Assistent-analyse**: modstanderrapport med vinderchancer (Monte Carlo), holdforslag, radar-sammenligning | ✅ |
| 5 | **Scouting med usikkerhed**: attributter vises som intervaller (fx 11–15), der indsnævres med scouting | ✅ |
| 6 | Moderne regler: ny CL/EL/Conference-ligafase (2024/25-) samt 5 udskiftninger | ✅ Ligafasen er indført; udskiftningsregler følger databasen (klassisk for CM-data) |
| 7 | **Smartere AI-klubber**: behovsanalyse pr. position, budget- og omdømmestyrede køb | ✅ |
| 8 | **Exploit-sikret motor + taktik-benchmark** i en Web Worker | ✅ |
| 9 | **Hurtig simulering**: "Næste kamp", spring kamp over | ✅ |
| 10 | **Challenges + dansk/engelsk + delbar seed** | ✅ |

## Databaser

Ved nyt spil vælger man database:

- **CM 2026/27 (standard)** – fællesskabets *October 2026-opdatering* til Championship Manager 01/02 med
  aktuelle trupper (`public/data/world.json`). Parseren (`src/game/data/cm0102.ts`) læser `index.dat`,
  `club.dat`, `nation.dat`, `stadium.dat` m.fl., og alle datoer skubbes +25 år, så sæsonen bliver 2026/27 med
  korrekte aldre (dataopdateringen holder originalens 2001-ur). Databasen trimmes til 38 ligaer, 641 klubber og
  ~22.700 spillere, så den er let nok til mobil/PWA.
- **Original CM 01/02 (3.9.68)** – den klassiske database spillet som 2001/02 uden datoforskydning
  (`public/data/world-original.json`).
- **Draft-liga** – bruger altid 2026/27-databasen.

Den tidligere moderne transfermarkt-database (CC0) ligger stadig i repoet som `public/data/world-modern.json`
og bygges med `npm run data` (se *Den moderne database* nedenfor).

### Genbyg databaserne

Kildefilerne (zip) ligger ikke i git, men i GitHub-release'n
[`data-sources`](https://github.com/Skallerup/cm0102-reborn/releases/tag/data-sources):

```bash
npm run data:fetch   # henter og pakker ud til .data-update/, .orig-db/ og .sources/
npm run data:cm      # October 2026 → public/data/world.json
npx tsx scripts/build-cm-data.mts ".orig-db/Original-3.9.68-Database" public/data/world-original.json 2001
```

Release'n indeholder også *Sunday League Pack 800x600*, som baggrundene i `public/bg/` er konverteret fra
(`.RGN` → JPEG).

## AI i spillet

Spillet har to slags AI:

**Spil-AI (altid aktiv, deterministisk)**
- *Taktisk modspil*: AI-trænere scouter din opstilling (fx 4-2-4 → lav blok og kontra, smal diamant → angreb på kanterne) og reagerer på stillingen undervejs (jagter udligning med ekstra angriber, lukker en føring ned). Taktisk dygtige trænere tilpasser sig oftere.
- *Transferstrategier*: klubber er topklubber, udviklingsklubber, sælgerklubber eller balancerede. De jagter dine spillere og vender tilbage med højere bud, starter budkrige om spillere du byder på og tilbyder leje med købsoption.
- *Spillernes vilje*: kontraktkrav efter gode perioder, utilfredshed der lækkes til pressen, og grupperinger i omklædningsrummet hvor lederens humør smitter.
- *Trænerkarrierer*: historik, trofæer og form; storklubber headhunter overpræsterende trænere, og du får indbyrdes opgør mod AI-trænere og tidligere klubber.
- *Fans og bestyrelse*: fansenes humør påvirker tilskuertal og bestyrelsens tillid; kvartalsvise bestyrelsesmøder.

**Sprogmodel (valgfri, kun tekst)** – `api/ai.ts` via Vercel AI Gateway
- Pressemøder før/efter kampe (spørgsmål ud fra situationen, fritekstsvar), spillersamtaler i fri tekst, agentreplikker i kontraktforhandlinger, kamprapporter, rygter, klummer, bestyrelsesreferater og fanforum.
- Modellen skriver kun tekst og klassificerer fritekst til spillets faste udfald – reglerne afgør alle effekter, så spillet er retfærdigt og multiplayer forbliver deterministisk.
- Uden AI (offline, GitHub Pages, slået fra i Indstillinger) bruges faste skabeloner og nøgleordstolkning.
- Model: `AI_MODEL` (standard Claude Haiku 4.5) med automatisk fallback til `AI_FALLBACK_MODEL` (standard Gemini 2.5 Flash Lite), hvis kontoen ikke har adgang. Dagligt loft `AI_DAILY_CAP` (standard 4000 kald) og 40 kald/min pr. IP via Upstash.
- Alle journalister, medier og agenter i spillet er opfundne.

## Ranglister (singleplayer)

Hver sæson giver en **Manager Score** ud fra opgaven: ligaplacering og forventning (vægtet efter ligaens styrke), mesterskab (mere for underdogs), op-/nedrykning, pokaler, Europa, bestyrelsens tillid, fyringer, økonomi og spilletid til unge spillere. Se fanen *Sådan gives point* i spillet.

Scorerne sendes automatisk til globale ranglister (`api/rank.ts`, Upstash Redis): karriere i alt, bedste sæson, denne måned og pr. liga. Profilen er et unikt managernavn med et hemmeligt token i browseren; kun den første indsendelse af hver sæson tæller (ingen gevinst ved at genindlæse), og serveren validerer linjer, grænser og sum. Spillet kører i browseren, så ranglisten er tillidsbaseret ud over disse kontroller.

## Den moderne database (transfermarkt)

Den ældre moderne database (`world-modern.json`) bygger på **[dcaribou/transfermarkt-datasets](https://github.com/dcaribou/transfermarkt-datasets)** (CC0 / public domain). Transfermarkt har ingen 1–20-attributter, så de beregnes deterministisk i `src/game/data/generate.ts`:

- **Current Ability** ← markedsværdi (log-skala) korrigeret for alder
- **Potential Ability** ← alder + tilfældighed (med sjældne wonderkids)
- **Attributprofil** ← position (målmand, stopper, back, kant, angriber …) vægtet efter rollen
- **Finjustering** ← mål/90 og assists/90 (afslutning, kreativitet), kort (aggression, snavsethed), højde (hovedstød, spring), fod og landskampe

Opdatér den med `npm run data`. Kommandoen henter de nyeste CSV-filer. Bemærk, at datasættet stopper ved 6. juli 2026 og derfor ikke har 2026/27-trupperne.

## Kom i gang

```bash
npm install
npm run dev        # http://localhost:5173/cm0102-reborn/ (på Vercel bruges roden /)
npm test           # motorkalibrering, exploit-test, kampprogram, scouting
npm run build
```

Værktøjer:

```bash
npx tsx scripts/calibrate.ts 2000 GB1        # kalibrér motoren mod rigtige statistikker
npx tsx scripts/simulate-season.ts 1 190     # simulér en hel sæson headless (FC København)
node scripts/smoke.mjs                       # end-to-end-test i browser (kræver npm run dev)
```

## Online multiplayer – sådan virker det

Online-spil findes kun på https://cm0102reborn.com (Vercel), fordi de kræver en server.

```
Klient A ─┐                         ┌─ Upstash Redis: rum, spillere, "klar", handlinger, lås
Klient B ─┼── /api/mp (Vercel Fn) ──┤
Klient C ─┘                         └─ Vercel Blob: øjebliksbilleder af spillet (gzip, ~4-5 MB)
```

1. Hver ændring en manager laver, er en serialiserbar **handling** (`src/game/actions.ts`). Den anvendes lokalt med det samme og sendes til serveren.
2. Når alle har trykket **Klar**, tager én klient en lås. Den henter det uberørte øjebliksbillede, afspiller alle handlinger i rækkefølge og simulerer frem til efter næste kampdag (`mpAdvance`). Derefter uploader den en ny version.
3. De andre klienter opdager den nye version, henter den og genanvender egne handlinger, der ikke nåede med.
4. Hver menneskelig manager har sin egen "slot" med indbakke, taktik, bestyrelse, kendskab osv. (`src/game/humans.ts`).

Begrænsninger:
- Kampene kan ikke ses live i multiplayer. De simuleres med fuld kommentar og kan ses bagefter som kamprapport.
- Spillet venter på, at alle trykker Klar.

Lokal udvikling af online-delen: `vercel dev --listen 3000` og derefter `node scripts/smoke-mp.mjs` (to browsere spiller mod hinanden).

## Arkitektur

```
scripts/build-cm-data.mts CM 01/02 .dat-filer → public/data/world.json / world-original.json
scripts/build-data.py     Transfermarkt CSV → public/data/world-modern.json
src/game/                 Ren TypeScript-spilmotor (ingen UI-afhængigheder)
  engine/match.ts         Zonebaseret matchmotor (CM3-inspireret)
  competitions.ts         Kalender, ligaer, split, pokaler, CL/UEFA, playoffs
  transfers.ts            Bud, kontrakter, Bosman, AI-transfermarked
  training.ts             Udvikling og træning
  season.ts               Sæsonskifte, priser, op/nedrykning, regens
  sim.ts                  Dag-for-dag-løkke
  analysis.ts             Assistent og kampanalyse
  actions.ts              Alle managerhandlinger (bruges også til multiplayer)
  humans.ts               Flere menneskelige managere i samme verden
src/online/client.ts      Online-klient: synkronisering, træk og upload
api/mp.ts                 Multiplayer-server (Vercel Function + Upstash Redis + Vercel Blob)
src/worker/               Web Worker til taktik-benchmark
src/ui/                   React-brugerflade
src/i18n/                 Dansk og engelsk
```

Læs mere i [docs/RESEARCH.md](docs/RESEARCH.md) (research om originalspillet) og [docs/ENGINE.md](docs/ENGINE.md) (matchmotoren).

## Licens

Koden er MIT-licenseret. Den moderne database er CC0 (transfermarkt-datasets). CM 01/02-databaserne og Sunday League Pack er fællesskabets/originalens data og er ikke omfattet af MIT-licensen. "Championship Manager" er et varemærke tilhørende dets ejere, og projektet er ikke tilknyttet dem.
