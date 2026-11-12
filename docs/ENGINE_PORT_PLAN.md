# Port af originalens kampmotor – plan og status

*2026-11-10. Ejeren har (som Bosman Editions forfatter) tilladelse til at bruge så meget af originalens motor som muligt.
Målet er en så præcis motor som muligt. Baggrund: `ORIGINAL-ENGINE-RESEARCH.md`, byggestenene: `GRID_ENGINE.md`.*

## Næste skridt (overdragelse 2026-11-12, efter låsetrinets syvende runde – start her i en ny session)

**Låsetrinet (syvende runde): alle 20 Premier League-kampe i `~/cm0102-engine/oracle/runs/ls20.txt`, pokalkampen (`cup4.txt` kamp 42) og en
kamp med forlænget spilletid OG straffesparkskonkurrence (`pen1.txt` kamp 17, turnering 352, 1311–574) kører identisk med originalen hele kampen –
alle motorens tal er brugt; originalens næste tal er kamprapportens sub_6d26b0 efter slutfløjtet** (`npx tsx scripts/grid-lockstep.ts <spor> <kamp>`
viser det som "originalens næste tal 3@6d30b5"). Testen `tests/gridLockstep.test.ts` kører 9 af dem som hele kampe (fixturer pl2/3/6/7/14/16/19,
cup, pen).

Herfra (i rækkefølge):
1. **Spillets egne inddata (opgave 3, ikke begyndt i syvende runde).** Låsetrinet beviser motoren med originalens inddata; sæsontallene
   (`npx tsx scripts/grid-stats.ts 380 <frø>`: 2,17–2,44 mål, 45–52 % hjemmesejre mod originalens 2,75–2,98 / 51–53 %) afgøres nu af inddataene:
   (a) kampstartens kampværdier – limens egen sub_6ec010-udgave i `makeGP` (gridMatch.ts ~l. 780: workRate/versatility m.fl. er skøn) skal
   erstattes af `matchValues6ec010` med en `MatchValuesEnv` bygget af spillets tilstand (kontrakt 0x4cf5f0 → `cmPlayerData`/`Contract`, klub,
   anfører 0x897590, forhold RP → `Player`-data, `staffState` [0xae2d0c], manager np+0xe/0x544410) – og samme env sendes som
   `ctx.matchValuesEnv`, så genberegningerne i kampen sker (i dag kun i låsetrinet); (b) 0x6e2f20-værdierne i genvalget (LOCKF viser forskellen);
   (c) tabelrækkerne 0x4a4850 (`teamRuns`, aiMode's `league`) og 0x48f150 af spillets tabel/kampprogram; (d) pick_teams rotation (hold+0x16/+0x1a);
   (e) `fixtureInfo` (ny i ctx: liga/europæisk turnering pr. side, word +0x30, første ben, +0x38) fra spillets fixture i `adapter.ts` – i dag
   ligakamp-standarden; (f) computerens taktik (grid-stats bruger `aiTactic`, originalen 0x6e0230/0x6ddab0).
2. **Efter slutfløjtet:** kamprapporten sub_6d26b0 (0x6d26b0–0x6d360f, første tal 0x6d30b5/0x6d317f), 0x6d0f80 (kampens spiller) og 0x6d1cc0 – de
   bruger kampens tilfældige tal efter 0x6ce460 og bestemmer karakterer/kampens spiller i spillet.
3. **Ikke dækket af sporene:** golden goal (+0x1a8, 0x6bdfed), MLS-straffe (mode 4, fixture+0x38 & 0x20), to-benede opgør med udebanemål i
   0x6bd930 (`needsWinner` i låsetrinet er kun "lige ved stillingen + første ben"), 0x6ce9c0's dødboldsskytte-tal (0x897990 → rand(1000)/rand(500)).
   Lav et spor med en to-benet pokalrunde (turnering 352's 2. runde eller Europa) og et med golden goal, hvis spillet har det.
4. Integrationen (se den tidligere overdragelse nedenfor, punkt 2–3).

### Tidligere overdragelse (2026-11-11)

**Status:** kampens kerne er porteret i gittermotoren (`src/game/engine/grid/`), ikke koblet ind i spillet. 380 kampe frø 1:
2,87 mål · 50/19/31 · skud 19,5 · på mål 9,0 · hjørner 4,3 · begåede frispark 6,1 (orakel 8,7) · offside 1,1 (orakel ~6) ·
gule 1,40 (orakel ~1,7). Mål: `npx tsx scripts/grid-stats.ts 380 1` (viser porten mod orakel frø 1/2 og ejerens Man Utd-sæson;
NB kolonnen "frisp." sammenligner vores begåede med oraklets tildelte – oraklets begåede er 8,7).

**Rammen i spillet er på plads (ingen adfærdsændring):** `src/game/engine/liveSim.ts` (`LiveSim`-interfacet, som `MatchSim` opfylder,
og `setGridFactory`), `makeMatch`/`makeQuickMatch` i sim.ts (createLiveMatch, simulateFixture, quickPlayUserMatch, quickReport),
`gridEngineOn(g)` = original database + ægte tilstand + (`g.options.engine === 'original'` eller localStorage `cm0102.engine`).

**Rækkefølgen herfra:**
1. Motoren: optøjer (test), genstarten sub_6c54a0 (AI-taktik og -udskiftninger), behandling af skadede 0x6d0b60, hvorfor
   forsvarslinjen står så dybt (offside), tærsklen for "dårlig dag", kommentarens rand (sub_6d6f70: ét rand kun ved > 1 variant,
   sub_6d60b0 kombinationer) – tabellen id → begivenhed: `~/cm0102-engine/notes/commentary-ids.json/.md`.
2. Integration (plan fra kortlægningen 11/11): (a) trinvis kerne `createGridMatch` med `tick()` (runGridMatch som indpakning,
   samme tal), dbg kun ved DEBUG; (b) hændelseskrog uden rand (mål/assist/kort/skade/skud/hjørne/offside, spillertællere);
   (c) `GridSim` i `grid/adapter.ts` med LiveSim-fladen – step ≈ 240 øjeblikke, minute = floor(clock/11)+1, pitch() i zonemotorens
   15 zoner og ax/ay, lister der kun vokser, `teams[i].stats`/`all[].line` = samme genstande som i report(), `opts.aiSubs` læses
   løbende, kommentar med zonemotorens `k`-typer (+ `orig:<EVENT>`), `report().engine = 'original'`; registreres med
   `setGridFactory`; (d) setTactic/substitute/applyTalk midt i kampen; (e) forlænget spilletid og straffe; (f) ydelse – i dag
   ~60 ms pr. kamp mod MatchSims 3,6 ms (mål ≤ 10 ms; ellers kun menneskets kampe og liga på gittermotoren – ejerens beslutning).
3. Udgivelseskrav: tsc, vitest, `npm run build`, `npm run e2e` (også med `cm0102.engine` = original), `scripts/soak.ts`/`features.ts`
   med MODE=authentic, `node scripts/e2e-soak.mjs original klassisk 5`, sæsontal inden for oraklets – derefter staging til ejerens
   godkendelse, først så main.

**Oraklet:** `~/cm0102-engine/oracle/` (README). Kør det kun med ejerens viden, med sandkassen slået fra og altid med egen
`RECOMP_USER_DIR`/`HOME` – aldrig mod `~/Library/Application Support/cm0102` (ejerens gemte spil; backup i `~/cm0102-engine/backup/`).

## Metode

1. **Kilde:** ejerens egen `cm0102.exe` (3.9.68, matcher Bosmans manifest) rekompileret med Bosmans `tools/recomp/recomp.py`
   til register-niveau C. Ligger lokalt i `~/cm0102-engine/` (`out-match/gen/*.c`, én funktion pr. fil i `hooks/<adr>.c`,
   læsning i `notes/`). **Committes ikke** – kun porten (TypeScript) og denne dokumentation er i repoet.
2. **Afkodning:** hver funktion læses blok for blok til pseudokode (signatur, offsets, konstanter, alle `rand(n)`-kald i
   rækkefølge) – `~/cm0102-engine/notes/<adr>-*.md`. Offsets samles i `notes/offsets.md`.
3. **Port:** gittermotoren (`src/game/engine/grid/`) er vehiklet. De *estimerede* kroge i `GRID_UNKNOWN` (gridMatch.ts)
   erstattes én ad gangen af præcise porte. Hver port: unit-test på kendte input, `scripts/grid-stats.ts` før/efter.
4. **Orakel:** Bosman headless på ejerens maskine (`/Applications/CM 01-02 Bosman Edition.app`) med fast frø, når
   binæren understøtter det (`RECOMP_*`-kontakter – se status). Ingen påstand om 1:1 uden reproducerbare tests.
5. **Indkobling** i spillet sker først, når sæsontallene matcher originalens (mål 2,87, H/U/B 51/23/26, skud 17,2,
   på mål 10,3, hjørner 5,0, offside 7,4, kort 1,70/0,14) og oraklet – bag et flag, moderne og klassisk uændret indtil da.

## Funktionerne (originalens adresser, størrelse i instruktioner)

| Krog i `GRID_UNKNOWN` | Original | Instr. | Status |
|---|---|---|---|
| `tacticalCell` | 0x6c2be0 + 0x715f50 + 0x6c2a40 | 359 + 136 + 112 | afkodet (notes/6c2be0-tactical-cell.md) – pladserne er et tabelopslag `TBL[side][plads][med/uden bold][bx][by]` i taktikken (+0x5eb/+0xf33, 2376 bytes), bygget af 0x5b7160 fra taktikfilens grove gitter (+0x164) – afkodes sammen med de 40 `.pct`-filer |
| `runTarget` | 0x6bce80 | 566 | ✓ porteret 11/11 |
| `zonalPick` | 0x6bc030 | 910 | ✓ porteret 11/11 (`grid/zonal.ts`) |
| markering: runden, følg-testen, mandsopdækningen | 0x6ba140 (i 0x6b98c0), 0x6bce20 + 0x6f4600, 0x7160f0 | 130 + 23 + 70 | ✓ porteret 11/11 (`loop.ts` assignMarking/canFollow/manMarkTarget) |
| skridtet uden bold: markers_follow, synstesten, kondition, vending | 0x6f09f0 (0x6f0a62–0x6f0cbd, 0x6f3a67–0x6f42b6), 0x6fa140, 0x6f56c0(−1) | – | ✓ porteret 11/11 (`offBallMove` i gridMatch.ts) |
| holdflag, individuelle instruktioner, taktikbytes | 0x5b27c0, 0x5b50d0, 0x5b5290, 0x5b5d10, 0x6db8a2 | – | ✓ porteret 11/11 (`tacticTable.ts` teamFlagsOf/instrOf; forudindstillingernes værdier i presetTactics.ts) – vores trin → originalens valg er *estimeret* |
| spillerbytes: agitation, +0xff, boldhændelsen +0x8eb1 | 0x6eaea0, 0x6f4aa0, 0x6f55c0, 0x716450, 0x6c2ca5 | – | ✓ porteret 11/11 (motivationen +0x100 og +0x31's start ikke – 0) |
| holdebolden | 0x70ec80 | 1.792 | ✓ porteret 11/11 (`holdBall`) |
| fordelsreglen | 0x6bb9a0, 0x6bab90, 0x6bac40, 0x6bba80, 0x6b9cb1 | – | ✓ porteret 11/11 (alle 12 kaldere; kommentarer udeladt) |
| knock/skade | 0x6cfe10, 0x6d0980 | – | ✓ porteret 11/11 (ingen skadedatabase; behandlingen 0x6d0b60 kun som rydning af +0x1d) |
| pladsernes gitter | 0x5b7e60, 0x5b2ba0 | – | ✓ porteret 11/11 (`canon`/`canonGrid`/`mapTactic`: forudindstilling ved præcis samme masker, ellers kanonisk) |
| `canSee`/lane | 0x6f9f90 + 0x6cbc00 | 137 + 371 | ✓ porteret 11/11 |
| `spaceAhead`, `freeRun` | 0x6cbad0, 0x6cb780 | 89, 135 | afkodet – `freeRun` giver aldrig 1 for markspillere (egen løkke tæller spilleren selv) |
| offside-udvalg/linjevogter | 0x6cfd70 → 0x6ea760 | 11 + 184 | afkodet – rækkereglerne = `offsideFlag`; også ved skud (skytten som `excl`) |
| `challenge` (duel/dribling/forseelse) | 0x6f09f0 | 4.489 | ✓ porteret 11/11 – boldholderens del (`carrierMove` i gridMatch.ts); knock-tjek og skridtets konditionstab med fra 11/11, kommentarer og banens byte ikke |
| `preShot` → udfordringen | 0x6c87e0 + 0x70d690 + 0x6eecb0 (evnerne) | 1.390 + … | ✓ porteret 11/11 (`grid/challenge.ts`); kaldt fra skridtet (0xf/0x11/0x12), skuddet (0x6d) og afleveringens kilde (0x6c) |
| `passResult`/`contestP` (afleveringen) | 0x6fad40 + 0x6ccb60/0x6cd330 + 0x6f5c30 | 6.876 + 400 + 1.197 | ✓ porteret 11/11 (`grid/pass.ts`: fejlled, grundtal S, V, præcision, højde/fart, opsnapning på vejen, rejsetid) |
| indlæg: landing, blokering, loftet, modtagelse, løs bold | 0x6c9cd0, 0x70dfd0 (+0x6cc540/0x6cd3d0), 0x6fa490, 0x6f6c00, 0x6cd770 | 1.872, 986, 678, 4.036, 220 | ✓ porteret 11/11 (`grid/pass.ts`) – afbøjning findes ikke i 3.9.68 |
| `pickTaker` | 0x6ceb90 | 832 | ✓ porteret 11/11 (én taktik-skytte pr. kategori; alder/omdømme "?") |
| dommer: tackling, kort | 0x6e9820, 0x6ea4e0 | 941, 184 | ✓ porteret 11/11 (`judgeTackle`/`decideFoulPunishment` i cm0102-original-rules.ts); gulvet `FOUL_FK_FLOOR` og `cardFor(professional)` rettet |
| taktikkens positionstabel | 0x5b5d10 (loader) + 0x5b7160 | 862 + 173 | ✓ porteret 11/11 (`tacticTable.ts`); tabellerne for de 40 `.pct`-filer i `notes/pct-tables.json` |
| skud (sikker, allerede porteret) | 0x702050, 0x700bd0, 0x700420 | 10.263, 1.572, 539 | ✓ |
| boldholderens valg, afleveringsmuligheder, kampværdier, rul | 0x7109f0, 0x6c6a30, 0x6ec010, 0x6f44a0 | ✓ (GRID_ENGINE.md) |
| tik-løkke, rækkefølge | 0x6b98c0, 0x6bd760 | 1.375, 61 | ✓ delvist – gennemgås mod C'en |

## Sæsontal (380 kampe, Premier League 3.9.60, pr. kamp for begge hold)

| | Mål | H/U/B | Skud | På mål | Hjørner | Frispark | Offside | Gule/røde |
|---|---|---|---|---|---|---|---|---|
| Originalen | 2,87 | 51/23/26 | 17,2 | 10,3 | 5,0 | ~16 | 7,4 | 1,70/0,14 |
| Gittermotoren før porten (10/11, frø 1) | 3,74 | 50/16/34 | 14,9 | 7,0 | 4,1 | 17,6 | 4,5 | 1,19/0,05 |
| + syn/bane/plads/frit løb/offside/retning/afstand (11/11) | 2,63 | 45/27/27 | 9,6 | 5,3 | 2,6 | 18,1 | 0,3 | 1,22/0,06 |
| + taktisk felt fra originalens positionstabeller (11/11) | 2,68 | 49/26/24 | 8,8 | 5,1 | 2,4 | 24,8 | 0,7 | 1,74/0,12 |
| + løbemål 0x6bce80 (11/11) | 2,79 | 46/25/29 | 8,7 | 5,3 | 2,5 | 21,3 | 0,7 | 1,45/0,08 |
| + udfordringen 0x6f09f0/0x6c87e0 og dommeren 0x6e9820/0x6ea4e0 (11/11) | 6,58 | 59/13/28 | 44,2 | 25,2 | 15,3 | 0,7 | 0,9 | 0,23/0,01 |
| + afleveringen 0x6fad40, opsnapning, modtagelse 0x6f6c00, landing 0x6c9cd0, blokering 0x70dfd0, løs bold 0x6cd770, evnetabellens efterbehandling (11/11) | 7,29 | 54/11/34 | 40,9 | 23,9 | 10,0 | 2,7 | 2,9 | 0,40/0,01 |
| + zonevalget 0x6bc030 (11/11) | 6,70 | 54/12/35 | 40,5 | 22,3 | 10,4 | 2,9 | 2,5 | 0,49/0,02 |
| + markeringen: markers_follow i skridtet, følg-testen 0x6bce20, runden 0x6ba140, mandsopdækning 0x7160f0, skridtets kondition/vending (11/11) | 3,55 | 63/16/22 | 21,7 | 11,1 | 5,3 | 3,0 | 1,0 | 0,44/0,02 |
| + holdflag +0x584, instruktioner +0x188b, taktikbytes +0x5b4 (11/11) | 3,01 | 54/20/26 | 19,7 | 9,6 | 4,8 | 3,0 | 0,8 | 0,52/0,01 |
| + agitation/+0xff og boldhændelsen +0x8eb1 (11/11) | 3,05 | 56/19/24 | 20,3 | 10,1 | 5,0 | 5,3 | 0,8 | 1,17/0,05 |
| + holdebolden 0x70ec80, fordelsreglen, knock 0x6cfe10/0x6d0980 (11/11) | 3,30 | 58/17/25 | 20,1 | 10,3 | 4,8 | 5,1 | 1,5 | 1,22/0,03 |
| + kanonisk gitter 0x5b7e60/0x5b2ba0 for vilkårlige pladser (11/11; frø 2: 2,62 · 53/24/23) | 2,87 | 55/18/27 | 19,1 | 9,1 | 4,5 | 5,0 | 0,9 | 1,15/0,06 |
| + hjemmebanen: publikums-bytene 0x6b871a, nervøsiteten 0x6ec4cd, dommerens holdbyte (11/11; frø 2: 2,80 · 47/21/31) | 2,81 | 50/19/31 | 19,3 | 8,9 | 4,4 | 5,3 | 1,1 | 1,19/0,08 |
| + offside ved skud 0x7038a2, dommerpostens +0x29 (11/11) | 2,81 | 52/20/27 | 19,3 | 8,8 | 4,2 | 5,1 | 1,1 | 1,03/0,07 |
| + motivationen 0x6eb502, +0x31 (derby), advantage_foul 0x716c90 / sub_6eab60, dommerbytes fra officials.dat, optøjer ved død bold 0x6d1210/0x716630 (11/11, i gang; frø 2 uden optøjerne: 2,76 · 52/22/26) | 2,87 | 50/19/31 | 19,5 | 9,0 | 4,3 | 6,1 | 1,1 | 1,40/0,08 |
| Orakel frø 1 / frø 2 / ejerens Man Utd-sæson (grid-stats-tabellen) | 2,75 / 2,98 / 2,86 | 53/25 · 53/21 · 52/22 (H/U) | 17,0 / 17,8 / 17,0 | 9,9 / 10,5 / 10,0 | 4,9 / 5,3 / 5,1 | 14,5 / 15,3 / 14,3 | 6,1 / 6,9 / 6,0 | 1,79/0,12 · 1,66/0,14 · 1,66/0,17 |

## Log

- 2026-11-10 – exe'en verificeret, rekompileret (36 indgange, 1.307 funktioner fulgt, 32 MB C), funktionerne klippet ud,
  offset-ordbog samlet, fire afkodere sat på tacticalCell, runTarget/zonalPick, syn/plads/offside og challenge/preShot.
- 2026-11-11 – **Porteret (sikker):** `canSee` (0x6f9f90 + banen 0x6cbc00 = `H.laneBlockers`), `facingGoal` (0x6f4650), `spaceAhead`
  (0x6cbad0), `freeRun` (0x6cb780 – giver aldrig 1 for markspillere), offside ved afleveringer via `L.passWrapper` → `offsidePlayer`
  (0x6cfd70 → 0x6ea760; fordelsreglen 0x6bab90 er ikke modelleret), retningen `H.bearing` (tabellen 0xb67c30, ftol) og afstanden
  `H.cellDist` = originalens tabel. tests/gridVision.test.ts. Sæsontallene faldt (skud 9,6, offside 0,3): de præcise porte møder
  stadig estimerede løbemål og taktiske felter, så angriberne står sjældent forbi linjen – tallene vurderes først, når
  tacticalCell (tabellerne er nu fundet) og runTarget er porteret. Afkodet samme dag: tabeludvidelsen 0x5b7160, indlæg/blokering/
  modtagelse, dommer og skytter.
- 2026-11-11 – **Porteret (sikker):** det taktiske felt `tacticalCell` (0x6c2be0) og opstillingen ved død bold `formationCell`
  (0x6c2a40) slår op i taktikkens positionstabel; søjledriften 0x715f50 køres efter hvert opslag. Tabellen bygges som 0x5b7160 af
  de 17 forudindstillede taktikfilers grove gitre (`grid/presetTactics.ts`, genereret af `~/cm0102-engine/tools/gen_presets_ts.py`;
  TS-udvidelsen = afkoderens Python-tabeller for alle 17 × 2 sider). *Estimeret:* spillets taktik kortlægges til nærmeste
  forudindstilling (rolle/side, så placering; ungarsk tildeling i `grid/tacticTable.ts`) – originalen genberegner gitteret for
  flyttede pladser (0x5b3560/0x5b7e60, ikke afkodet); boldhændelsen +0x8eb1 er ikke modelleret. tests/tacticTable.test.ts.
  Næste: runTarget (0x6bce80) – angribernes løb forbi linjen mangler (skud 8,8, offside 0,7), og udfordringen (0x6f09f0;
  frispark 24,8).
- 2026-11-11 – **Porteret (sikker):** løbemålet `runTarget` (0x6bce80) med alle fire flag og originalens tre kaldere (uden bold
  mode 4/12 med formationsfeltet som io, afleveringsvalget flags 0, boldholderen flags 2 med det taktiske felt; boldholder-bit 1
  fra [esp+0x68] er ikke afkodet → 0). Måling af offside-kæden (60 kampe): 261 vurderinger/kamp, 126 er ikke fremad, 121 når ikke
  linjen, 14 når linjen, 3,6 flages, 0,75 dømmes; kun 1,4 gange pr. kamp står en angriber forbi linjen. Linjen (0x6c3aa0) og
  rækkereglerne er originalens – det, der mangler, er afleveringens udførelse/modtagelse (0x6fad40/0x6f6c00) og udfordringen.
- 2026-11-11 – **Porteret (sikker):** udfordringen – `grid/challenge.ts`: handlingsevnerne +0x11a (0x6eecb0), `getOppositionChallenge`
  (0x6c87e0: kun modstandere i boldens felt, multiplikator, gå-ind-rul pr. handling, klar chance, styrkerul, typevalg), værdien og
  ventetiderne (0x70d690), konditionstabet (0x6f56c0) og moralen (0x7172d0); boldholderens skridt `carrierMove` (0x6f09f0 fra 0x6f0ccf:
  V_c mod V_d, KEEPS/LOST/WIN, momentum, karakterer, FOUL-grenen) og skuddets udfordring (0x702050 0x70244e–: handling 0x6d, dommeren når
  V_d ≥ momentum, udfordreren vinder når S ≤ V_d) samt afleveringens kildeduel (0x6fad40 §5, handling 0x6c). Dommeren `judgeTackle`
  (0x6e9820) og `decideFoulPunishment` (0x6ea4e0) helt efter noten; `foulGiven` har nu gulvet 50/100, `cardFor(professional)` er rettet
  (MatchSim kalder den ikke professionelt – uændret), `cardSeverity` er MatchSims forenklede form og er ikke ændret. `pickTaker` (0x6ceb90).
  Udgået: `challenge`/`tackleP`/`foulP`/`runChallengeP`/`preShotP`/`preShotReach`/`cardShare` og duellen, når en forsvarer går ind i
  boldholderens felt (findes ikke i originalen). Rettelse til noten: boks-kommentaren ved WIN kræver hård type, hurt eller rand(w31) < −10
  (0x6f1f39 – noten havde ≥). *Estimeret/udeladt:* holdebolden 0x10 (0x70ec80 ikke læst – afgøres som move_to uden skridt), den løse bold
  0x6cd770 (bliver i feltet), afleveringens værdi V i kildeduellen, knock-tjekket 0x6cfe10, fordelsreglen 0x6bb9a0, kommentarernes rand,
  ukendte bytes (+0xff, +0x1d, +0x31, agitation) = 0, dommerens bytes +0x24/+0x27/+0x28 = 10. Fundet: 0x6f55c0 lader kun +0xff falde mod
  (b100/2 + Dirtiness + 10)/4 pr. minut – startværdien er ukendt. tests/gridChallenge.test.ts.
  Tallene (380 kampe, frø 1) faldt langt væk fra originalen: 6,58 mål, 44 skud, 0,7 frispark. Den præcise udfordring går næsten kun ind
  nær mål (D > 5 → ×0,05 – bekræftet i exe'en), så boldtab på midtbanen må komme fra afleveringens rejse/opsnapning og modtagelsen
  (0x6fad40/0x6ccb60/0x6f5c30/0x6f6c00), som stadig er skøn; den estimerede nabo-duel og skud-stopperen holdt før tallene nede.
  Frispark kræver opbygget +0xff/agitation (startværdier ukendte). Næste: afleveringen 0x6fad40 og modtagelsen 0x6f6c00.
- 2026-11-11 – **Porteret (sikker):** `grid/pass.ts` – afleveringen sub_6fad40 (fejlled R1–R4, grundtal S pr. type, V = momentum − rand(træthed)
  + rand(S) + plads, kildeduellen med den rigtige V, dyk-grenen, moralrullet, præcisionen `passScatter` (målet flyttes), karaktererne,
  højde/fart, retning/berøring, io_flag), banevandringen 0x6ccb60/0x6cd330 (Bresenham fra afleverens felt inkl. til målfeltet ekskl., rand(2)
  for siden pr. felt) og `try_intercept` 0x6f5c30 (helt: arbejdsvilje-filter, T-tabellen og keeper i feltet, holdkammerat 1/(T+100), hands,
  kontrolleret/løs med grænsen max(160, 1500 − 100d² + 100s)), rejsetiden ftol(2D / max(1, s + 0,2) + 0,5) i SPILLERTURE (tælles ned efter
  hver tur i tik-løkken 0x6ba427 – nu i loop.ts), modtagelsen 0x6f6c00, landingen 0x6c9cd0, den løftede bold 0x6fa490, skudlinjen
  0x6cc540/0x6cd3d0 og blokeringen 0x70dfd0, den løse bold 0x6cd770, vendingen 0x6f4920, dommerens hands 0x6e9540/0x6e9630, take_ball 0x6f0630
  (afleverens karakter, keeperen i feltet holder bolden ved −1 uden egen aflevering i luften, boldhøjden ændres ikke), opsamlingen efter skridtet
  (0x6f3f7d) og hjælperne 0x6bd5b0/0x6c41b0/0x70d630/0x6fa1e0. Udgået: `passK`, `interceptP`, `passResult`, `contestP`, `crossWin`,
  `crossCornerP`, `blockCornerP`, `blockP`, `deflectP`, `lofted`, `b8eaa` og `arrive`/`ceil(D/4)`.
  **Rettelser til noterne (kontrolleret i asm):** 0x6f6c00 vælger 0x2e (bryst) når rand(n) > rand(70 + 80·gule + 1500·felt) (vendt – med
  noten blev næsten hver høj bold en frispark-type: 11 frispark/kamp fra modtageren), nedtagningens evne + 2·(agility-rul − 20) (ikke 10·), R's
  forseelse tjekkes når R er FORAN (Rscore > Cscore) eller rand(5) = 0, et overset C-frispark springer R's tjek over, C's kommentargren kræver
  også rand(w31) < −10; 0x6fad40 hjørne/frispark er høje (h = 4) når rand(40) ≠ 0 (vendt), karakterfradraget −110/−100 gælder afleveringer i
  EGEN halvdel, dyk-grenens agitation er max(…); 0x6f5c30 giver ikke-keepere kode 0x24 (keeperen 1/0x29), og T for radius 5 er et ord
  (rand(500000) + 200 slår om); 0x70dfd0 bruger d = afstanden fra skytten (ikke skudtypen) og hands-evnen ×2; 0x6cc540 prøver begge sider i
  tilfældig rækkefølge (ikke forsvarerne først) og tager skyttens og målets felt med; 0x6e9540: forseelse kun ved rand(155) = 0 og boldhøjde > 1
  (hands 0x25: medmindre rand(20) = 0); 0x6cd770 spreder over sidelinjen når keep = 0 (ikke spread = 0); 0x70d630 = afstand til EGET mål.
  **Fejl fundet i tidligere porte:** evnetabellen sub_6eecb0 manglede efterbehandlingen 0x6f0426–0x6f05ac (alle 63 koder: fx 5(f+45) + 0,5v,
  2,1v + 2,5f + 75, 3,5v) – nu `rawActionSkills` + `postSkill` i challenge.ts, også for udfordringen; offside i `passWrapper` er rand(2d²)
  (0x6fa2ec), ikke rand(d²); limens `ballOut` lagde bolden ind på banen FØR sub_6cd490, så der aldrig kom indkast (nu 11,8/kamp).
  *Estimeret/udeladt:* sub_70a910/sub_70c040 (bolden i mål fra en aflevering/løs bold) → bolden går over linjen (ingen mål ad den vej),
  vejret 3 (som skuddet), match+1 = 0, sub_600a50 (indlæggets nationstillæg) = nej, individuel instruktion bit 4 = 0, sub_6f0970 = kun
  boldholderen slippes, knock-tjekket 0x6cfe10, fordelsreglen 0x6bb9a0, sub_716e10/sub_6bb8d0 og alle kommentar-rand. Limen bruger nu
  skudtypen fra sub_700bd0 (hovedstød ved boldhøjde 4) i stedet for altid lavt skud. tests/gridPass.test.ts.
  Tallene (380 kampe, frø 1/2): 7,29/7,19 mål, 54/11/34, 40,9 skud, 23,9 på mål, 10,0 hjørner, 2,7 frispark, 2,9 offside, 0,40/0,01 kort.
  **Hvor boldtabene mangler (instrumenteret, 60 kampe):** 355 modtagelser/kamp, men 77 % har ingen modstander i modtagerens felt og kun
  11 % får en udfordrer (sub_6c87e0 kræver samme felt) – 23 vundne af forsvaret. Opsnapning på linjen 19/kamp (5 kontrollerede, 14 løse), 85
  upræcise afleveringer, 25 af 31 løftede bolde lander uden nogen i feltet, 193 besiddelsesskift i alt. 69 % af skuddene tages fra D = 1.
  Forsvarerne står altså sjældent i angribernes felter: det peger på det, der stadig er skøn i positioneringen – zonevalget 0x6bc030
  (`zonalPick`, afkodet, ikke porteret), mandsopdækningen (`manMarkTarget` = null), markørens følg-test 0x6bce20 (`canFollow`), holdebolden
  0x70ec80 og kortlægningen af vores taktik til forudindstillingerne. Næste: zonalPick og canFollow.
- 2026-11-11 – **Porteret (sikker): markeringen og forsvarernes bevægelse.** Instrumenteret (scratch-kopi af grid-stats): kun 12 % af
  angriberne havde en markør, markørerne stod i snit 1,49 felter fra deres mand, og opfølgningen kom kun fra boldholderens skridt. Årsagen var
  limen, ikke tik-løkken: `moveTo` (sub_6f09f0 for spillere uden bold) kaldte ikke markers_follow (0x6f3bf9) – markørerne springer deres egen
  tur over (0x6ba37c), så de stod stille, når deres mand løb. Rettet sammen med følg-testen 0x6bce20 (ingen afstandsgrænse; markeringsrullet,
  eller positioneringsrullet med taktikbyte bit 2 – sub_6f4600), markeringsrunden (zonevalget for alle, når BOLDEN er i eget felt – ikke
  spilleren; +0x1aa sættes også, når manden har 3 markører), mandsopdækningen 0x7160f0, synstesten 0x6fa140 (samme felt → nej), skridtets
  konditionstab 0x6f3c88 (bane/vejr/position/instruktion, sub_6f56c0 med −1: ×12/10/8/6 / 11) og vendingen 0x6f4143 (en tredjedel af vejen
  mellem bold, spiller og mål). Efter: 20 % markeret, 1,08 felter, 30 % i samme felt; kondition ved slutfløjt 80/76 % (hjemme/ude).
  Tik-løkkens rækkefølge (0x6ba100–0x6ba6a7) er gennemgået i asm og passer (kontraflaget kommer EFTER 0x6bd760 – team-flags.md §6 sagde før).
  **Holdflag og instruktioner:** standardtaktikken 0x5b27c0 (0x22a91, 0x15552221/0xa, taktikbyte 0x12 – bit 2 = følg med positioneringsrul,
  bit 0x10), forudindstillingernes værdier læst af .pct-filerne med loaderens efterbehandling (gamle filer: høj dword 0xa; 0x2000 uden 0x4000;
  0x20000 under 0x98ec5d). Angriberne i forudindstillingerne har taktikbyte 0x11 (ingen zonemarkering). Grupperne fra 0x5b50d0/0x5b5290;
  vores trin → bits er *estimeret* (tacticTable.ts). Situationens runWithBall/holdUp/longShots/crossBall læses nu af instruktionerne.
  **Rettelse til team-flags.md:** mentaliteten læses i kampen – sub_6c2be0 tester 0x10000/0x8000 i samme register (0x6c2e5b/0x6c2e92).
  **Spillerbytes:** agitation = gulvet 2·(25 − Temperament), ×0,85 pr. tik; +0xff = trunc((Dirtiness + 10)/4) (motivationen 0 – *estimeret*),
  henfald i 0x6f55c0; dommerens ophidselse af offeret var min(…) – nu max(ag·f, gulv) som noten. Boldhændelsen +0x8eb1 (3 hjørne, 7/−1 frispark,
  6 skud, 0 når bolden tages på egen halvdel) styrer det taktiske felts "bliv stående"-gren.
  **Holdebolden, fordelen, knock:** sub_70ec80 helt (uden kommentarer); den ventende hændelse lægges af alle 12 kaldere af 0x6bb9a0 (også
  overset offside, 8), dommeren/linjevogteren/hands dømmer intet, mens den venter (0x6bab90), 1/7 pr. tik i spil og 1/5 ved død bold for at
  dømme (0x6bac40, tikket slutter), skuddet 0x6bba80 og målet rydder den. Knock 0x6cfe10/0x6d0980 i skridtet, boldholderens duel og holdebolden
  (8,5 knocks/kamp; ingen skadedatabase – kun rand-tabellerne). Ikke porteret: behandlingen/udskiftningen 0x6d0b60 (kun rydningen af +0x1d,
  *estimeret*), advantage_foul 0x716c90, afleveringens knock-kald.
  **Pladsernes gitter:** spillets plads → nærmeste af de 31 masker (taktikskærmens tilstand 1), kanonisk gitter 0x5b7e60/0x5b2ba0; præcis samme
  masker som en forudindstilling → dens fil (navnet afgør ved ens masker, fx 4-4-2/4-4-2 Attacking). Positionsordene er nu pladsens masker
  (sub_6c38f0 = masks2 "?"). tests/gridMarking, gridTeamFlags, gridPlayerState, gridAdvantage og tacticTable.
  **Stadig væk fra originalen:** frispark 5 (orig 14–15), offside ~1 (6–7), gule 1,15 (1,7), røde 0,06 (0,15); skud 19 (17). Frisparkene kræver
  sandsynligvis motivationen +0x100 (→ +0xff) og +0x31's start (yndling/had/derby), som vi sætter til 0, samt kommentarernes rand (sub_6d6f70
  bruger ét tal pr. kommentar – rækkefølgen af tilfældige tal er derfor ikke originalens). Offside: sub_6cfd70's udvalg og den løftede bolds
  offside er stadig skøn (`offsideReach`). Hjemmebanen (`homeAdv`, ganger også Stamina-floaten) er *estimeret* og forstærkes nu af
  skridtets konditionstab (hjemme 2,0 mål mod ude 1,1 i frø 1).
- 2026-11-11 (eftermiddag, afbrudt – ejeren slukkede) – **Porteret:** hjemmebanen (`crowdBytes` = init_match 0x6b871a–0x6b882f:
  engine+0x1ad/+0x1ae af tilskuertallet; `nervesOf` = sub_6ec010 0x6ec4cd–0x6ec647, trækkes fra kamp-CA'en; holdbyten i judge_tackle's F).
  Skønnet `homeAdv` er væk; tilskuertallet (sub_85cba0, uden for motoren) er input i `GridMatchCtx.crowd` – standard = oraklets snit 35.428 med
  8 % udebanefans (*estimeret*), comp+0x69 = 18 (club_comp.dat). Fyldt stadion: hjemmeholdet 0, udeholdet 5 → nervøsitet ≈ 35 CA-point.
  Hjemme/ude-mål 1,71/1,09 (orakel 1,71/1,04). Kondition ved slutfløjt 75/75 % (før 80/76 – homeAdv gangede Stamina; målet ~80 for begge
  er ikke nået). Offside ved skud (0x7038a2–0x703a28: skytten som excl, rand(500) = overset → fordel og param 2). `sub_6cfd70` er kun en thunk
  til sub_6ea760 – `offsideReach` brugtes ikke og er fjernet; +0x29 læses af dommerposten ([official+4]), median 0. Offside tælles nu på den
  rigtige side (før fik side 0 næsten alle). Motivationen +0x100 (`initMotivation`, 0x6eb502–0x6ebcda; formRoll/dårlig dag-rullene trækkes, men
  dårlig dag-tærsklen er ikke porteret) → +0xff og kamp-CA'en; +0x31 = −10 i derby (`ctx.derby`, yndling/had findes ikke i data). `cardWithoutVictim`
  (sub_6eab60) og `advantageFoul` (sub_716c90) i move_to's tabte bold. Dommerbytes = medianen af de 21 engelske dommere (D 11, +0x24 0, +0x27 0,
  +0x28 19). Optøjer ved død bold (run_match_steps 0x6b9aea–0x6b9cab → sub_6d1210/sub_716630/temperCheck 0x7164b0, afgørelsen med sub_6ea4e0) er
  porteret, men **ikke testet og ikke målt færdigt** (0,0 pr. kamp i den første måling – forventet sjældent, ag ≈ 30 giver ~0,3 % pr. modstander).
  **Rettelse til grid-stats:** kolonnen "frisp." sammenligner vores begåede frispark med oraklets *tildelte* (`free_kicks` = modstanderens
  frispark + offside). Oraklets begåede (`fouls`) er 8,7 (3,9 hjemme/4,8 ude); vi har 6,1 (2,9/3,2). Gule 1,40 (orakel 0,74/1,05).
  **Hvor frisparkene mangler (instrumenteret, CH=1 i en scratch-kopi):** ~194 udfordringer/kamp går ind, ~11 vælger en frisparktype, ~5 bliver
  udfordreren; sub_6c87e0's afstandsled (D > 5 → ×0,05, verificeret i asm) holder dem væk fra midtbanen. Alle kaldere af judge_tackle er porteret.
  **Offside-kæden:** 395 vurderinger/kamp, kun 13 er afleveringer til rækker ≥ linjen; forsvarets bageste markspiller står på række 10–12 (målt
  mod det angrebne mål) i 64 % af tikkene med bold, og en angriber er forbi linjen i 1,5 % af dem – positioneringen (markering/taktisk felt)
  holder linjen for dybt. **Næste:** test af optøjerne og måling; sub_6c54a0 (genstartens AI-skift/udskiftninger, læser også +0x1ad);
  behandlingen 0x6d0b60; kommentar-rand (sub_6d6f70 trækker rand(sum af vægte) kun ved > 1 variant, og sub_6d60b0 kan omskrive/sluge kommentarer
  med egne rand – vægtene står i events_eng.cfg); hvorfor forsvarslinjen står så dybt; dårlig dag-tærsklen (sub_53ce90, mentalleddet bl).
- 2026-11-11 (den første Mac – overtaget her; `~/cm0102-engine` klonet, `regen.sh` kørt: 55 funktioner i hooks/) – **Offside-sporet indkredset
  (ingen ændring i motoren):** grundlinjen gengivet (380 kampe frø 1: 2,87 mål, offside 1,09). (1) Originalens positionstabel er *ikke* for dyb:
  442_default uden bold med bolden på række 6–8 stiller forsvarerne (plads 1–4) på række 3, og angriberne (plads 8–9) står med bold på række 10 –
  tabellen lægger op til offsidestillinger. (2) Tælling i `defendOffBall` (60 kampe): når modstanderen har bolden, går forsvarerne efter deres
  mand (`p.marks` fra `zonalPick`) i 45 % og til zonen i 53 % – en følger står altid på målsiden af manden, så han kan aldrig blive offside.
  Kun offsidefælden (holdflag 0x400) får følgeren til at holde linjen (`hold`, 0x7153f9). (3) **Med fælden tvunget til for begge hold
  stiger offside 1,29 → 5,10 pr. kamp (120 kampe; orakel 6,1–6,9)**, mål 2,99 → 3,38, skud 19,7 → 20,7, på mål 9,1 → 10,9. (4) Vores
  computerhold spiller aldrig med fælden (`aitactics.ts`/`tactics.ts`: `offside: false`), og kun 1 af originalens 40 .pct-forudindstillinger
  har 0x400 (343_default). (5) Computerens skift ved genstart `sub_6c54a0` sætter via 0x5b50d0 kun 0x20000/0x8000 (mentalitet), 0x800/0x1000
  (kontra) og 0x2000/0x4000 (mænd bag bolden) – aldrig 0x400/0x200.
  **Computerens taktik før kampen = sub_6ddab0** (eneste sted, der sætter 0x400 via 0x5b50d0; `edi+0x2b` taktikken, `+0x2f`/`+0x33` egen/modstanderens
  klub, `+0x1f` = **managerens ikke-spillerpost** (21 egenskaber alfabetisk fra +14, jf. staff-noten): +0x0e Attacking (faktor
  `1 − (v − 10)·(1/30)` på mentaliteten), +0x13 Directness (≤ 8 → 0x2, ≤ 14 → 0x1, ≤ 18 → 0x4, ≤ 20 → 0x8), +0x1f Pressing (≥ 15 → 0x100,
  ≤ 5 → 0x80), +0x1c **Offside: fælden 0x400, når Offside > 19 − 0,0003·klubbens omdømme (club.dat +0x80, 0–10000)** og taktikkens
  +0x187b ikke har bit 8 (0x6ddc2a–0x6ddc6b; konstanterne 0x96d4f0 = 19,0, 0x96d4f8 = 0,0003 læst i exe'en). Også 0x20 ved 0x6ddb9e
  (klubbernes omdømmeforskel mod rand(2000) + rand(−4000): ukendt flag). **Men** ingen af de 20 Premier League-managere i 3.9.60 når grænsen
  (højeste Offside: Wenger 15 mod 16,3; Ferguson 4) – oraklets 6–7 offside pr. kamp kommer altså ikke fra fælden. (3) viser kun, at fælden
  er én vej til offside. **Næste:** hvorfor angriberne aldrig står forbi følgerne – sammenlign `zonalPick`-kandidaterne (3×3 om markørens
  taktiske felt) og følge-reglen (0x715499–0x71546a) med C'en; angribernes løb (runTarget) i forhold til følgernes skridt; porter
  sub_6ddab0's flag (Directness/Pressing/Attacking/Offside) til computerens taktik, når gittermotoren kobles ind (kræver managerens
  +14/+19/+28/+31 i world-filen).
- 2026-11-11 – **Kontrolleret mod C'en (sikre):** forsvarets følgeregel og fælde-hold 0x7153cf–0x71558d (holdflag-byte +0x9767 & 4 = 0x400;
  `[esp+0x14]`/`[esp+0x20]` = boldens række/søjle), "step up" 0x714e87, dødbold → opstillingsfeltet 0x714e43, offside-linjerne sub_6c3aa0
  (bageste markspiller + 1, målmand og udskiftede udenfor), angribernes fremadløb/træk-tilbage/tilbage-onside 0x714643–0x71497d.
  **Rettet:** N i fremadløbet 0x714643 er 0 (ikke 16) for pladser med 0x200 uden 0x8/0x4 – byten nulstilles ved 0x71464a lige efter
  `push esi`. Målt (380 kampe frø 1): 2,78 mål · 49/22/29 · skud 19,5 · på mål 8,8 · offside 1,13.
  **Linjens højde (40 kampe):** den bageste forsvarers *tabelmål* (min over forsvarerne) med bolden på egen række 3–5 / 6–8 / 9–11 er
  1,3 / 2,35 / 3,4, og han står 0,4 dybere (0,9 / 2,1 / 3,0–3,9); 59–63 % af forsvarerne har en markering med bolden på række 3–5. Linjen
  står altså, hvor taktiktabellen sætter den – afvigelsen fra oraklets offside skal findes i angribernes løb/afleveringer (runTarget-mål
  er linjen selv, d = 0 → offsidestilling) eller i linjevogterens udvalg, ikke i forsvarets placering.
- 2026-11-11 – **Integration (trin 2a–c, f) – gittermotoren spiller nu i spillet bag flaget:** (a) `createGridMatch` (tik for tik, `{ m, tick(),
  result() }`) med `runGridMatch` som indpakning – byte-identiske sæsontal (100 kampe frø 3); fejlsøgningstællerne kun med `setGridDebug(true)`
  (grid-stats DEBUG=1, gridAdvantage-testen). (b) `GridListener` (`ctx.on`: mål med assist/straffe, skud, kort 2–6, knock, hjørne, offside,
  halvleg) uden rand – tallene uændrede. (c) `grid/adapter.ts` `GridSim implements LiveSim` (step = ét tik, minut = floor(tik/11)+1 og 0 før
  kampstart, pitch() i zonemotorens 15 zoner/ax·ay 0–100, rapporten med `engine: 'original'`), registreret i sim.ts (`setGridFactory`).
  *estimeret*: assisten = den sidste medspiller, der afleverede (+0x478a ikke afkodet); skade i rapporten = knock med +0x1c sat og kondition
  < 50 % (0,43/kamp mod zonemotorens 0,30); straffesparkskonkurrence 75 % pr. spark, når en kamp skal have en vinder (sub_6be710 ikke porteret);
  ingen udskiftninger (`substitute` giver false), ingen holdsnak. (f) **Ydelse:** 38–40 ms pr. kamp bundtet (zonemotoren ~4 ms) – fordelt over
  hele motoren, intet enkelt varmt punkt; derfor `gridFixture` i sim.ts: gittermotoren spiller kun menneskets kampe og kampene i
  menneskets egen liga, resten zonemotoren. Soak 2 sæsoner (MODE=authentic ENGINE=original): 0 fejl, ~58 s/sæson. e2e: `E2E_ENGINE=original
  node scripts/e2e.mjs klassisk` (original DB, Arsenal, cm0102.engine = original; spoler til første kamp) – alle trin grønne.
  **Mangler til "klar":** udskiftninger og AI-taktik i kampen (sub_6c54a0/sub_6d0b60), setTactic/holdsnak midt i kampen, forlænget
  spilletid/straffe som originalen, kommentar fra originalens tekster (sub_6d6f70), og sæsontallene (offside 1,1, frispark 6 mod oraklets 6–7/8,7).
- 2026-11-11 – **Facit pr. tik fra originalen.** (1) Match Stats-felterne bekræftet på originalens skærm (ejerens karriere, Ipswich–Man Utd
  1-1: offside 9/2 = H+0x11, indkast 8/7 = H+0x0F) – oraklets offside 6–7 pr. kamp er rigtigt. (2) **Instrumenteret original:** Bosman-værktøjet
  bygget lokalt (`~/cm0102-engine/tools/build_trace.sh`; cmake + sdl2 + venv med capstone) med `tools/match_trace.c` (RT_WRAP af offside-linjerne
  0x6c3aa0, kun kaldet fra tikkets top 0x6ba01e/retur 0x6ba023): `RECOMP_MATCH_TRACE=<fil>` skriver pr. tik bold, besiddelse, linjer, boldholder og
  for hver spiller side/plads/x/y/rul +0x107/+0x10a/+0x37/handling +0x198/markering +0x1aa. NB: sub_6b98c0 er HELE kampen (løkken indeni), ikke ét
  tik. `oracle/tools/trace_stats.py` = gittermotorens `line:L`/`line:max`. Første spor (40 dage, frø 1, 60 kampe, 50.664 tik):
  * angribernes afstand til linjen (−1/0/+1): orig 43,6/12,0/1,8 %, porten 46,7/10,0/1,6 % – ens;
  * markering pr. boldbånd (forsvarende markspillere med +0x1aa): orig 46/24/12/10 %, porten 44/23/12/9 % – ens; "følg manden" 39/21/10/8 mod 40/22/11/7;
  * rullet +0x107: jævnt 0..~14 (P(0) 7 %); +0x37 er 0 (71 %) eller negativ – som porten (`form = min(0, positionFit)`);
  * **forsvarslinjen står for dybt i porten:** linjen på række 12 (bageste på mållinjen, ingen kan være offside) i 33,6 % af tikkene mod 18,5 %;
    bageste markspiller med bolden på egen række 4/5/7/8: orig 1,46/1,71/2,75/2,90, porten 0,92/0,93/2,09/2,21 (originalen rykker også frem
    *inden for* et tabelbånd – porten står fladt).
  (3) Over halvdelen af vores computerholds taktikker ender på det **kanoniske** gitter (3-4-3, 4-2-3-1, 4-3-3, 3-5-2, 5-3-2); originalens hold
  bruger forudindstillinger. Med alle på originalens 4-4-2 (`FORCE_FORMATION=4-4-2 scripts/grid-stats.ts`): offside 1,1 → 3,94, men mål 5,44 og
  skud 30 – forudindstillingernes instruktioner/flag afslører en anden afvigelse. **Næste:** spor med plads → x/y pr. tik sammen med
  tabelfeltet (TBL fra taktikken i hukommelsen, engine+0xf56e) for at se, hvor positionerne afviger; computerens taktikvalg før kampen (sub_6ddab0).
- 2026-11-11 – **Hvorfor forudindstillingerne giver for mange mål, og hvad computeren gør før kampen.** (1) Sporets tabeller (P) er alle .pct-
  forudindstillinger (120 af 120; mest 442_v1/442_default/532-varianter) – og *samme klub skifter forudindstilling fra kamp til kamp* → valget sker
  pr. kamp i computerens holdudtagelse **0x6dbb80** (2.343 instr.: formationsordet af masker 0xca0ca/0x20100/0x100 ud fra klubbernes omdømme
  +0x80 og rand(2000)/rand(−4000)/rand(3000); spilleropstillingen 0x896a90, anføreren 0x897760; så sub_6ddab0). (2) Afstanden række − tabelmål
  for forsvarere: orig −1/0/+1..+4 = 15,7/35,6/40,1 %; porten med vores AI-taktik (mest kanonisk) 30,9/29,9/30,3; med 4-4-2-forudindstilling
  9,2/44,2/40,6 → det kanoniske gitter holder forsvaret en række for dybt; forudindstillingerne ligner originalen. (3) Med forudindstilling: kun
  tabellen → 3,83 mål/offside 3,01; + forudindstillingens instruktioner → 5,44 mål; holdflagene ingen forskel (`PRESET_ONLY=table|noflags`, midlertidigt).
  (4) **Originalens instruktioner i hukommelsen ≠ .pct-filens** (`scripts/grid-trace-instr.ts` mod sporets I-linjer): lo afviger i 333/451
  pladser, hi i 180/451, taktikbytes 0, holdflag i 41/41 – fx 4-4-2 backs 0x55984221 → 0x55584221 (0x800000 → 0x400000), hi 0xa → 0x5.
  **sub_6ddab0 omskriver hver spillers instruktioner** (via 0x5b5290/0x5b50d0) ud fra managerens egenskaber og spillerne. **Næste:** port sub_6ddab0
  helt (holdflag + individuelle instruktioner) og test den mod sporets I-linjer (facit pr. plads); derefter forudindstillingsvalget i 0x6dbb80.
- 2026-11-11 – **sub_6c54a0's justering ved dødbold porteret (§5 i notes/team-flags.md):** `aiRetune` i gridMatch.ts (via `restartTick`) – kun
  computerstyrede hold (`ctx.ai`, adapteren sender `opts.aiSubs`); ved skift eller i første minut: mentalitet normal, kontra nej, MBB nej og
  instruktionen 0x400000 for alle spillere (fremadløbet 0x800000 slås fra – som kampsporets I-linjer viser). *estimeret*: tilstanden er altid 2
  (0x6df460 ikke afkodet), managerens Attacking/Directness ikke med (world-filen har dem ikke endnu). 380 kampe frø 1: **2,96 mål · 52/23/26
  (orig 51/23/26) · skud 19,9 · på mål 9,8 · hjørner 4,9 · offside 1,95** · gule 1,43/røde 0,07. Med 4-4-2-forudindstilling: 3,73 mål.
  **Næste:** sub_6ddab0's ændringer af hi-ordet pr. spiller (0xa → 0x5/0x6/0x9 m.m.; 15 kald af 0x5b5290 ud fra spilleregenskaber 0x5431e0),
  computerens forudindstillingsvalg 0x6e0230 (forsvaret står en række for dybt med det kanoniske gitter), 0x6df460 (tilstand 1–5), offside.
- 2026-11-11 – **sub_6ddab0 porteret (aiPrematch.ts, underagent):** computerens holdflag, individuelle instruktioner og masker pr. plads før
  kampen; testet mod kampsporets I-linjer (trace4, 41 hold): lo 449/451 (99,6 %), hi 448/451 (99,3 %), holdflag 39/41 – noten
  `~/cm0102-engine/notes/6ddab0-ai-prematch.md`. NB: oraklet kører den almindelige 3.9.60 (ikke Swedish_fixed), og spillet omnummererer klubber
  og stab i hukommelsen. Koblet ind i `createGridMatch` for computerhold (efter hvert holds opstilling, før side 1 – originalens rand-rækkefølge):
  *estimeret* ingen manager (world-filen mangler managerens egenskaber), omdømme fra `ctx.rep` (standard 5000), `compType` fra ctx. 380 kampe
  frø 1: 3,22 mål · 52/21/27 · skud 19,9 · på mål 9,9 · hjørner 4,9 · offside 1,81. Mangler: taktikvalget 0x6e0230 (mange hold er stadig på det
  kanoniske gitter), managerdata i world-filen.
- 2026-11-11 – **0x6df460 porteret (aiMode.ts, underagent):** computerens tilstand og r – 249.606 af 249.607 kald som originalen (tre spor,
  `~/cm0102-engine/tools/aimode_trace.c`, noten `notes/6df460-ai-mode.md`). **Ikke koblet ind endnu:** et første forsøg (styrke = CA, ingen
  ligatabel/manager, kamptype 33, publikumsbytene fra crowdBytes) gav udeholdet tilstand 4 i 45 % af tikkene (orig 15 %) og 64 % hjemmesejre –
  mistanke: publikumsbytene (r ×(1 − 0,07·crowd[side])) eller styrken. Næste: sammenlign inputtene med aimode-sporene, så kobles den ind
  (opskriften står i agentens rapport: begge sider ved hver dødbold, tidsspild i 3/4, tilstandsreglerne for computerhold).
  Stadig i gang ved afbrydelsen: taktikvalget 0x6e0230 (aiTacticChoice.ts) og udskiftningerne (subs.ts) – ikke committet.
- 2026-11-11 – **0x6df460 koblet ind bag `GRID_UNKNOWN.aiMode` (fra):** begge sider ved hver dødbold, før-kamp-kaldet, tidsspild i 3/4,
  "uden mgr"-reglerne. Publikumsbytene: adapteren sender intet tilskuertal, så standarden blev 17 % udebanetilhængere (byte 2–3 som sporene;
  før 8 % → byte 5, og udeholdet stod i tilstand 3–4). Med tilstanden: 58/22/20 (orig 51/23/26) – porten får bolden for sjældent ind i
  hjemmeholdets tredjedel (række ≤ 3: 18,5 % af tikkene mod originalens 27,2 %; 4–7: 59,1/50,2; ≥ 8: 22,5/22,6), og tilstanden forstærker det
  gennem territoriet Q. Uden tilstanden (standard): 2,98 mål · 50/21/29. **Næste:** find hvorfor udeholdet sjældent når hjemmeholdets tredjedel
  (hjemmebanens bytes, motivationen, passOptions?) med sporet.
- 2026-11-11 – **Udskiftninger porteret (subs.ts, underagent):** 0x6c54a0's port, genvalget 0x6e1090 (MSVC-qsort), 0x6e2000, omrokeringen
  0x6e1aa0, 0x6d0b60 (skadede), 0x6cdd50, 0x6cda20 (rødt kort) – styringen som originalen i alle sporets kald (subs2, 160 kampe); spillerens
  øjebliksværdi 0x6e2f20 delvist (*estimeret* `estimatedQuality`, samme indskiftning i 77 %). Noten `notes/6d0b60-substitutions.md` har
  koblingsopskriften (bænken som GP'er i createGridMatch, dødboldskrogen, treatInjured, rødt kort). **Ikke koblet ind endnu.**
- 2026-11-11 – **0x6e0230 porteret (aiTacticChoice.ts, underagent):** 109/157 (69 %) præcist, 137/157 top 3 mod sporet. Originalen vælger
  mellem 45 forudindstillinger (17 + 28 CM3_TACTICS); de 28 mangler i presetTactics.ts; managerens yndlingsformation (stab +0x43) m.fl. mangler i
  world-filen. **Ikke koblet ind endnu.**
- 2026-11-11 – **Premier League-spor:** `RECOMP_MATCH_TRACE_COMP=7` (fixture+0 = turneringen; 7 = Premier League) – `oracle/runs/tpl.txt`, 364
  PL-kampe (frø 1, hele sæsonen). Boldens række (når nogen har bolden), orig → porten: 0: 5,3 → **0,0** · 1: 4,9 → 3,2 · 2: 6,3 → 4,2 ·
  3: 9,7 → 7,8 · 4: 11,1 → 12,4 · 5: 11,9 → 15,7 · 6: 12,8 → **22,2** · 7: 12,2 → 14,0 · 8: 10,4 → 8,5 · 9: 6,1 → 4,7 · 10: 4,7 → 3,7 ·
  11: 4,6 → 3,6 (%). Tredjedele 26,2/48,0/25,7 mod 18,5/59,1/22,5. Fund: **målmændene holder bolden for kort** (orig har hjemme-/udemålmanden
  bolden i 2,90/2,28 % af tikkene, porten ~0,4/0,65 %), og bolden hænger ved afsparkspladsen (række 6). Målmændenes rækker: orig side 0 på
  række 0/1/2 i 75/20/5 %, porten 57/33/10 (side 1 som originalen). Linje-statistik i PL: line:L 7–12 = 8,7/12,6/20,2/23,8/16,2/18,5 %,
  line:max −1/0/+1 = 50,1/14,9/2,8 %. **Næste:** målmanden med bolden i hænderne (boldhøjde −1: hvor længe venter han, sub_7109f0's GK-gren
  0x711aba/0x70ec80) og afsparket; derefter territoriet igen og så GRID_UNKNOWN.aiMode til.

- 2026-11-11 – **Dødboldenes opstilling, målmandsflaget, boldholderens løb og rand (underagent; noten `notes/6c54a0-restarts.md`).**
  Sporet `oracle/runs/tpl2.txt` (364 PL-kampe; match_trace.c udvidet bagudkompatibelt: state i A-tokenet, facing/busy/momentum pr. spiller)
  og `scripts/grid-trace-port.ts` (porten i samme format, læst samme sted i tikket – `ctx.onTop` efter 0x6ba01e; boldholderen som
  `pslot`). NB: de tidligere porttal (række 0 = 0,0, målmand 0,4/0,65 %) var målt efter tikket, hvor målsparkets opstilling og spark
  allerede er sket. Målmanden holder IKKE bolden for kort (1–2 tik som originalen) – han får den for sjældent. Fund og rettelser:
  (1) **sub_6c54a0's nulstilling og opstillingerne** var ikke porteret: boldhøjden er 0 ved genstart (porten −1 → alle blev teleporteret
  til formationsfeltet), og 0x6c4290 indkast, 0x6c4470 hjørne, 0x6c4ec0 målspark (bolden i (4, 0)/(4, 11), alle i tabelfeltet for (4, 6),
  målmanden tager bolden), 0x6c50d0 straffe, 0x6c4820 frispark og 0x6c51e0 afspark (tabelfeltet for (4, 2)/(4, 10), sparkeren = nærmeste,
  retningen fra den sidst placerede spiller, sic – 364/364) er porteret; i de første 150 tik står 100 % af spillerne som originalen.
  (2) **sub_6c3010** (målmanden er jager, +0x8eac/+0x8ead) blev aldrig sat; nu som originalen, og jagerne regnes kun igen, når bolden har
  flyttet sig (0x6ba5a5). sub_6f5b80 (tilbage onside) i løkken er et skridt, ikke en teleport. (3) **Boldholderens løb**: uden løbemål
  skriver sub_6bce80 −1, −1 → målet (0, 0) (0x7139f1 – side 0 løber skråt tilbage, side 1 skråt frem: sporet 17/20 % af løbene, porten
  16/17 %; før løb porten på stedet – 101 løb pr. kamp på egen række 6, 87 % uden skridt, nu 29 og 3 %, orig 19 og 4 %); vendingen før løbet
  (0x713a89) og "vend og løb" på eget felt (0x713941) manglede; skridtet ændrer ikke boldholderens retning; 0x7134d8's tredjedel var vendt;
  kun PASS uden modtager sætter handling 9; skytten får 0x6d (0x70388a). (4) **rand = sub_90cfc0**: n < 0 giver n+1..0 (0x90d026), ikke 0 –
  `randOf` rettet (rammer bl.a. 0x7110f5's plads under pres, zonevalget, tempo-rullet, skudvalget). (5) **Pausen** (sub_6bd930): ikke under
  et ventende straffe, uret FORBI 495/990 + tillægstid, uret sættes til 495, afsparket til +0x8eb6 (init_match 0x6b974d: rand(2) ≠ 0 → side 0
  starter), og tikket slutter. **Tal** (samme arbejdstræ uden → med mine ændringer, orig): boldens række 0–11 = 3,7/4,1/4,5/8,0/11,8/15,6/
  19,3/11,9/8,3/4,8/4,2/3,7 → 5,6/4,4/5,3/9,3/10,7/13,0/13,7/12,2/10,4/6,1/5,3/3,8 (5,3/4,9/6,3/9,7/11,1/11,9/12,8/12,2/10,4/6,1/4,7/4,6);
  tredjedele 20,3/58,6/21,1 → 24,7/49,6/25,7 (26,2/48,0/25,7); målmand med bolden 1,00/0,92 → 2,08/1,53 % (2,90/2,28), hans rækker 0/1/2
  side 0 42/55/1 → 67/25/7 (64/28/7), side 1 51/47/1 → 70/22/6 (74/23/3); målmanden får bolden 13,0 → 22,5 gange pr. kamp (30,8; målspark
  7,6 → 8,3, orig 10,2). 380 kampe frø 1: 3,14 → 2,91 mål, H/U/B 48/22/30 → 39/22/39, skud 19,8 → 19,2, på mål 9,9 → 9,0, offside 1,97 → 2,57;
  med `aiMode`: 2,74 → 2,71 mål, 55/24/21 → 46/24/30 (orig 51/23/26; før rand-rettelsen 49/25/27), tredjedele 22,3/49,6/28,1, besiddelse
  57,9/42,1 (orig 54,4/45,6). Hjemmebanefordelen uden tilstanden hvilede på løbene på stedet. **Mangler:** målspark 8,3 mod 10,2 – skud går
  for sjældent forbi og blokeres for ofte (skud → målspark 2,6/5,2, → modstander 3,2/2,0; skudpositionerne passer), målmandens afleveringer
  med modtager 3,3 mod 8,1; boldholderen HOLDER for meget på egen halvdel (række 3–5: 0x10 i 26–31 % af turene mod 7–12 %; også før) og LØBER
  for meget på modstanderens (række 9–11: 27/20/17 løb pr. kamp mod 12/7/4) – sub_7109f0's input; pausens restitution sub_6f5810 og
  +0x1a7-karakteren/returbolden 0x713aed er ikke porteret. Værktøjer: `~/cm0102-engine/tools/{rows,rows_own,gk_stats,gk_how,gk_next,
  run_stall,run_dir,shot_out,shot_pos,setup_check,setpiece_check}.py`.
- 2026-11-11 – **Computerens holdopsætning koblet ind (`GRID_UNKNOWN.aiTeam`, til) og tilstanden slået til (`GRID_UNKNOWN.aiMode`, til):** computerhold
  vælger en af de 45 faste taktikker (0x6e0230; tilstanden før kampen fra 0x6df460; managerens Staff.tac fra world-filen) og fordeler truppen
  (uden skadede/udelukkede/reserver) på dens pladser (0x6e2000); motoren får taktikkens masker, flag, instruktioner og tabel direkte
  (`maskSlot` laver kun målmand/grundposition). 380 kampe frø 1: **3,32 mål · 51/23/26 (= originalen) · skud 24,3 (17,2) · på mål 10,6 (10,3) ·
  hjørner 5,5 (5,0) · frispark (begåede) 6,0 (8,7) · offside 3,9 (6–7) · gule 1,56/røde 0,08 (1,70/0,14) · afleveringer 71 % (72 %)**.
  Næste: for mange skud/mål, frisparkene, offside; udskiftningerne; forlænget spilletid/straffe.

- 2026-11-11 – **Udskiftninger, forlænget spilletid, straffe og menneskets taktik midt i kampen koblet ind (underagent).**
  (1) **Udskiftningerne** (`grid/matchSubs.ts` om subs.ts): bænken er GP'er (plads −1, MATCH_PLAYER::init for alle 20 – samme motivation/rand,
  lige efter starterne; computerens bænk *estimeret*: taktikkens + de ubrugte startere), hold+0x17 = min(ctx.subs, bænken) (0x6dbac0; adapteren
  giver `opts.subs`, standard 3). `restartTick`: menneskets kø/taktik → rand(6) efter minut 60 (0x6c55ce – manglede) → aiRetune → genvalget
  0x6c581f (rand(50) pr. computerhold, 0x6e1090 + 0x6e1aa0) → opstillingen. `treatInjured` = 0x6d0b60 side for side; alle fem udvisninger
  går gennem 0x6cda20 (plads −3, 0x6cdd50 – en markspiller i mål, genvalg med keeperOut). Pladsens masker/instruktioner/tabelplads følger
  pladsen; den indskiftede står på (8, 6) (0x6cdd00). Menneskets hold skifter aldrig selv. 60 PL-kampe: 1,9 skift pr. hold (orig 2,3 – den
  estimerede kvalitet s), median minut 62, båret ud 0,37/kamp. (2) **Forlænget spilletid** (0x6bd930, noten `notes/6bd930-6be710-extra-time-
  shootout.md`): +0x8ed4 = 495/990/1155/1320 (`m.periodEnd`), uret sættes til 990/1155, afsparket skifter, retur 2/3 afslutter tikket (loop.ts);
  `ctx.needsWinner` står for fixture+0x38 (& 2 forlænget, & 1 straffe). (3) **Straffesparkskonkurrencen** (`grid/shootout.ts`, 0x6be520 +
  0x6be710 mode 3): siden = rand(2), skytterne (menneskets liste / 0x6ceb90 med "har sparket", ryddes efter 10), presset v = 2·(200 −
  rand(One on Ones)·(tilbage + 4)) (+rand(2,25v) skal score / +rand(0,75v) kan vinde), S = 0x700bd0(0x33) − rand(v) → 0x702050(…, 3), sudden
  death, slutreglen. **Kontrolleret** mod den instrumenterede original (`match_trace.c` + E-linjen ved 0x6bd930's retur; `oracle/runs/tcup1.txt`,
  88 Liga Cup-kampe frø 1): fixture+0x38 = 0x0403/0x0203/0x0003 (forlænget + straffe), alle 14 konkurrencer med +0x8eb3 = 4 (mode 3, param 3,
  type 0x33), første side 8/6; 21 forlængede, 14 straffe; K i snit 152 (porten 151), S 627 (porten 814 med PL-hold), mål ~69 % (porten 73 %).
  (4) **Menneskets taktik** (`GridMatch.setTactic`, ved næste dødbold *estimeret*): mapTactic → positionstabel, masker, instruktioner,
  taktikbyte og holdflag +0x584 som ved kampstart; 0x6eecb0 for hver. Adapteren: `substitute()` (grænser, kø), `live()` med bænk/subsLeft/gone,
  'sub'/'injury'-begivenheder, minutter for udskiftede, `et`, `pens`, `shootout`. Holdsnak findes ikke i originalen (applyTalk gør intet).
  380 kampe frø 1: 3,46 mål · 53/23/24 · skud 23,9 · på mål 11,0 · hjørner 5,6 · offside 4,25 · gule 1,48/røde 0,11. Soak 2 sæsoner og
  `E2E_ENGINE=original node scripts/e2e.mjs klassisk` grønne. **Mangler:** 0x6e2f20's kvalitet s (resten), 0x6bbb60/0x6bbf60 efter et skift,
  0x6e0230 i omrokeringen, computerens bænkvalg 0x6dbb80, mode 4 (MLS' spillede straffe), golden goal, kommentarerne.
- **2026-11-11 – Kommentaren som originalen (Match_Events).** `grid/matchEvents.ts`: add_event 0x6d6f70, combine_with_previous_event
  0x6d60b0, pick_weather_variant 0x6d5d80, add_event_at_front 0x6d5d00 og opfølgerne (8639/8640/8675) linje for linje – køen på 12
  poster, loggen, tilbagerulningen, flagtabellen engine+0x21e. Tabellen `grid/eventTable.ts` (prioritet, follow-on, report count,
  no rollback, varianternes eff-vægte og navne) genereres af `scripts/build-grid-events.py` fra events_eng.cfg. **Kommentaren er en del af
  kampens tilfældige tal:** hvert kald trækker 0–1 tal i kombinationen, rand(3) for vejret og rand(S) for varianten (> 1 variant) –
  oraklet kalder add_event ≈ 1.430 gange og trækker ≈ 2.850 tal pr. kamp (også i kampe, ingen ser). Verificeret: sporet `cmt2`
  (match_trace.c's nye c/z/C-linjer) afspillet med originalens tal (`scripts/grid-comment-replay.ts`): 51.454 kald, 102.421 tal – alle
  rand(n), indlejrede kald og køens tilstand ens; `tests/gridCommentary.test.ts` (500 kald + motoren). Kaldsteder porteret i motoren
  (`Hooks.comment(id, p1, side1, p2, side2, extra)`): kampstart/afspark 0x6b9b64 (+0x1ca), indkast/målspark/hjørne 0x6cd490, offside
  0x6fa3db, opsamling 0x715a59 og målmandens, "knackered" 0x6c55ce, tillægstid 0x6c587d (mellem holdenes udskiftningsporte –
  `subs.gate(entry, between)`), pausefløjt 0x6bd9c9, 90 minutter 0x6bdc67, slutfløjt 0x6be4cd, +0x8d4c/+0x8d4e i skuddet. GridSim
  (`adapter.ts`) læser køen efter hvert tik (`events.drain()`, passivt – skærmens get_next_event 0x6d78b0 kaldes ikke, som i kampe man
  ikke ser) og laver linjer med `CommentaryLine.ev/v/t2/x`; `ui/matchTexts.ts` viser præcis den variant (ingen egen vælger, `<d>/<N>` =
  extra, `<t2>` = side2/modstanderen). Spil-for-spil (`k: 'pl-o'`) kun med playByPlay (klassisk live-kamp). **Mangler (261 kaldsteder i
  alt, liste med hyppighed: `~/cm0102-engine/notes/6d6f70-commentary-sites.txt`):** afleveringens begivenhed 0x6ffabc (36 % af kaldene) og
  resten af pass/move_to/receive/hold/intercept, skuddet (skudtypen fra 0x700bd0, udfaldet, mål 0x70750b/0x707213 og historierne
  0x717470 i 0x704xxx–0x70axxx, der selv trækker tal), frispark og kort, udskiftninger 0x6e170a/0x6e18be, holdstilen 0x6c5c1c–0x6c6206,
  straffesparkskonkurrencen – de får stadig adapterens *estimerede* linjer (MAP). Vejrets dword engine+0x4756 er `GRID_UNKNOWN.weatherWord`
  = 0 (*estimeret*; oraklets ligakampe har 0 i de to lave bytes). Noter: `~/cm0102-engine/notes/6d6f70-commentary.md`.
- 2026-11-11 – **Skud, blokeringer, boldholderens værdier (underagent; noten `~/cm0102-engine/notes/702050-shot.md`).** match_trace.c har fået
  linjerne H (indgangen til sub_702050), K (keeperværdien 0x700420), B (skudlinjen 0x6cc540 + blokeren +0xf5ae), L (hvert blokeringsforsøg
  0x70dfd0; `RECOMP_MATCH_TRACE_BLOCKRAND=1` giver rand-kaldene indeni som Z-linjer), Q (boldholderens P/R/H/S efter støjen, 0x7133bd via
  rand-krogen) og O (afleveringsmuligheden 0x6c6a30 fra 0x7109f0); `scripts/grid-trace-port.ts` skriver de samme (`ctx.onShot`) og nu også
  facing/busy/momentum pr. spiller. Spor: `oracle/runs/tshot4.txt` (H/B/K/L), `tshot9.txt` (+Q), `tshot10.txt` (+O, 200 kampe).
  Værktøjer: `~/cm0102-engine/tools/{shot_s,shot_line,block_l,shot_rate,carrier_q,passopt,mom_trans,carrier_changes,shot_stop,shot_facing}.py`.
  Fejl fundet og rettet: (1) **blokeringen 0x70e2e2**: `[esp+0x18]` læses, mens rand-argumentet ligger på stakken, så der trækkes
  `r = rand(n)/(d+1)` fra (ikke handlingskoden) – bekræftet med rand-sporet; blokeringer pr. forsøg 34 % → 17 % (orig 22 %), pr. afstand
  0/1/2: 12/19/32 % (orig 13/22/37). (2) **momentum ved driblingen 0x6f29a9**: `fld 0,0; fcomp; je` = min(x, 0) – momentum kan kun falde
  (porten havde max(0, …)): boldholdere med momentum 200 36 % → 13 % af tikkene (orig 16 %), Δ-fordelingen som originalen. (3) **W i
  afleveringsmulighederne 0x6c6eb2**: (kondition + **karakteren +0x35** − 15000)·0,25 – visningens `w35` var 0, så alle vægte var ~1.600
  for lave (median med modtager række 3–5: 333–543 → 1.633–1.952, orig 1.836–2.054; modtager fundet 75–81 % → 79–85 %, orig 83–87 %).
  (4) **den forkerte fod 0x7021d5–0x702258** (sub_713e90, S −= rand(12·(20 − fod))) manglede, og highFlag rulles nu før keeperværdien
  (0x7023a6). (5) **w29 i skudscoren**: sub_700bd0 bruger boldholderens +0x29, som sub_7109f0 lige har skrevet (kan være negativ:
  rand(w29) i 0x7016fc); limen sendte max(0, skøn) – nu boldholderens `space` (q10 for 0x16 48 → −101, orig −54). Tal (380 kampe frø 1,
  før → efter): **mål 3,32 → 2,67 · skud 24,3 → 17,3 · på mål 10,6 → 8,7 · hjørner 5,5 → 4,65 · offside 3,9 → 4,5 · gule 1,56 → 1,19 ·
  H/U/B 51/23/26 → 56/20/23**; frø 2/3: 2,57/2,61 mål, 17,1/17,3 skud, 8,6/8,5 på mål, 56/22/22 og 52/24/23. Spor (200 kampe): skud (H)
  29,2 → 21,5 (orig 21,8), blokeret 10,2 → 4,2 (3,9), S ved skudlinjen snit 325 → 286 (288), boldholderskift til medspiller/modstander
  267/171 (277/186). Tilbage: på mål 8,6 mod 10,3 (porten stopper flere skud i udfordringen 0x6c87e0: 2,1 mod 1,6 pr. kamp; færre
  hovedstød/volleys 0x3/0x18: 4,2/1,6 mod 4,8/2,1), boldholderens P i feltet (række 0 centralt median 519 mod 2.097) og R (−8.190 mod
  −11.951), hjemmebanen (56/20/23).

- 2026-11-11 – **Computerens holdudtagelse som originalen (underagent):** udvælgelsesværdien **0x6e2f20 hele** for klubkampenes flag
  (`grid/roleScore.ts`: omdømme med ankomstfaktor, den opfattede evne/potentiale **0x6e86d0** med spillets frø [0xdd7120] = GameState.seed,
  formen 0x7c1950, kampkaraktererne 0x7c1e30, moral, instruktionerne (første gruppe tester holdflagene, ikke taktikbyten), kondition/skade,
  anfører, dødboldsskytter, trupstatus, genererede spillere, egen klub), **pick_team 0x6dbc50** (`grid/pickTeam.ts`: flagene og deres rand,
  anføreren 0x6e1940/0x6e1cf0, dødboldsskytterne, bænkpladserne med rand(10) og målmanden på plads 12, **0x6e2000 med bænken** – rekursionen
  for de ubrugte, n < k-grenen og ombytningerne med bænken) og `aiTeam.ts` (vores Player → spillerpost/opslag). createGridMatch bruger
  computerens bænk fra udtagelsen og trækker flagenes rand også for menneskets hold (pick_team(…, 1)); adapteren giver dato/frø/managerens
  viste Judging Ability/Potential (Staff.ca fra databasen). Udskiftningernes genvalg/omrokering (matchSubs.ts) bruger nu samme 0x6e2f20
  (`aiTeam.ts` matchRoleScore med kampspilleren, anfører og skytter) i stedet for `estimatedQuality`. **Kontrolleret** mod den instrumenterede original (`match_trace.c`: RECOMP_PICK_TRACE;
  `scripts/pick-trace-eval.ts`, `pick-trace-check.ts`, `tests/roleScore.test.ts`; 400 PL-udtagelser frø 1): 0x6e2f20 **1.415.898/1.415.898**
  kald ens, 0x6e0230 **400/400** samme taktik, de 11 **400/400** og bænken 399/400 ens af originalens egne værdier. Med vores *estimerede*
  opslag (kampstatistik pr. kategori, træningsbelastning 0x62c3d0, kontraktens +0x44/+0x45/+0x3e/+0x3f, 0x8c7260) på originalens spillerposter:
  samme 11 kun 137/400 – de systemer findes ikke i vores spil og afgør meget. 380 kampe frø 1 (med de andre agenters samtidige ændringer):
  2,56 mål · 57/22/21 · skud 17,1 (frø 2 før skiftet: 52/28/21 – H/U/B svinger ±4 mellem frø). **Mangler:** 0x6e1aa0's 0x6e0230 (computeren vælger taktik igen efter hvert skift med 11 på banen og kopierer
  den – også positionstabellen – + 0x6ddab0; 0x6e0230 returnerer altid 0, så kommentaren 0x2007 vises aldrig), 0x6bbb60/0x6bbf60 efter et skift,
  rotationen før vigtigere kampe (+0x1a ≠ 3), 0x8cf880 (udtagelsesregler), omdømmets omregning ved spilstart (*estimeret* ×50), 1:1-parring af
  vores spillere med oraklets. Noten: `~/cm0102-engine/notes/6dbc50-pick-team.md`.
- 2026-11-11 – **Keeperens udfordringstype, Work Rate-floaten, dommer/offside-spor (underagent, fortsat).** Nye linjer i match_trace.c:
  J (dommeren 0x6cfc60 → 0x6e9820 med kalderen), G (straffen 0x6cfcd0), D (udfordringen 0x6c87e0: handling, modstandere i boldens felt,
  fundet/værdi/type), N (offside 0x6cfd70 med kalderen: 0x6fa2b6 aflevering, 0x6fab89 sub_6fa490, 0x7038cd skud); porten skriver dem
  med `ctx.onShot` (kalderen som 0/2/1). Spor `oracle/runs/tfoul1.txt` (J/G), `tfoul2.txt` (+D), `toff1.txt` (+N), `tq2.txt` (Q med
  blokerere og +0x29). Værktøjer `~/cm0102-engine/tools/{judge_j,duel_d,offside_n}.py`. Rettet: (6) **sub_70d690 0x70d9be**: keeperen i
  eget felt får type **1 ved boldhøjde 4, ellers 0x29** (porten og noten havde det vendt; sporet: type 41 ved 0xd/0xc, 1 ved 0x15) –
  testen i tests/gridChallenge.test.ts rettet. (7) **Work Rate-floaten +0xf5 (sub_6ec010 0x6ee1ca–0x6ee231)** = Work Rate + motivationen
  +0x100 − dårlig dag-fradraget/(trunc(Professionalism/2) + 10) + 0,5·X (X = anfører-/trænerleddet, `GRID_UNKNOWN.workRateX` 4,5
  *estimeret* fra R-linjerne); porten brugte den rå værdi, så workRate-loftet +0x116 var ~10 for lavt (median 14 → 25, orig 23); rullet
  bruges i udfordringen (pw), blokeringen og løbene. Gangene 0,9/0,95/1,1 (0x6ee065–0x6ee491) og 0,75 fra 36 år er ikke med.
  **Tal** (380 kampe, frø 1/2/3): mål 2,52/2,63/2,66 · skud 17,1/17,0/17,1 · på mål 8,6/8,6/8,5 · hjørner 4,6/4,4/4,7 · frispark
  (begåede) 6,7/6,8/6,6 · offside 4,5/4,6/4,7 · gule 1,36/1,35/1,32 · røde 0,11/0,10/0,08 · H/U/B 53/24/23, 53/26/21, 57/23/20;
  hjemme/ude-mål 1,56/0,96 (orig frø 1: 1,71/1,04); **afleveringer 692/kamp (orig 688), 74 % rigtige (71 %)** – før W-rettelsen 490.
  **Hvad der mangler:** (a) *på mål* 8,6 mod 9,9–10,5: porten tager lidt færre skud (H) og udfordringen før skuddet stopper flere
  (2,0 mod 1,6 pr. kamp) – skytterne står i tættere felter (3+ modstandere i feltet 33 % mod 16 % ved 0x6d); (b) *frispark* 6,7 mod 8,7:
  dommeren vurderer 100 gange pr. kamp mod 131 – næsten alt i modtagelsen (0x6f7974/0x6f7acc): ved 0xd (bold på jorden) står der en
  modstander i modtagerens felt i 22 % af kaldene mod 33 %, og udfordreren går ind i 18 % mod 24 % (positioner uden bold; konditionen i
  laboratoriet er 10000 mod oraklets ~8400); (c) *offside* 4,5 mod 6–7: linjevogteren dømmer som originalen pr. afleveringer forbi linjen
  (26–27 %), men porten afleverer sjældnere forbi linjen (9,2 mod 16,2 pr. kamp ved almindelige afleveringer, sub_6fa490 15,1 mod 21,1) –
  forsvarslinjen står 0,15–0,25 række dybere ved samme boldrække; (d) *kort* følger frisparkene (gule pr. frispark 0,20 som originalen);
  (e) boldholderens P i feltet er stadig lavere (afleveringsvægt med modtager række 0 centralt 426 mod 1.021, modtager fundet 73 % mod 79 %).
- 2026-11-11 – **Udtagelsens input fra spiltilstanden + omrokeringens taktikvalg (underagent; noten `~/cm0102-engine/notes/cm-player-data.md`).**
  `src/game/cmPlayerData.ts` (kun original DB i ægte tilstand, egen deterministisk talrække – spillets rng og zonemotoren røres ikke) holder
  originalens data, som 0x6e2f20 læser: **PlayerStats 0x7c0d70** (kategori 1–6 pr. spiller: venskab/liga/pokal/Europa/landskamp/klub i alt,
  32-bytes posterne som `Player.cmStats`, formens fem nibbles `Player.cmForm`, spillets karaktersnit `GameState.cmRatingAvg` fra 680/100),
  snittene **0x7c2150/0x7c1e30** (karakter trukket mod standarden under 20 kampe, point pr. kamp), arkiv/nulstilling **0x7c5fe0** ved klubskifte
  (state.ts setClub) og sæsonslut (season.ts); **kontraktens tællere 0x4ca6d0** (+0x3d, +0x3e/+0x3f kampe i træk uden/med tilfredsstillende
  spilletid med originalens rand(30)·2, +0x44 via 0x4cb0a0/0x4cb250 og ±3 med rand(21 − Ambition); `Player.cmContract`, ny kontrakt 0x4cf720);
  **spilstartens omdømme sub_535a80 0x536270–0x536ec6** (manglende omdømme udfyldes, ×50 – bekræftet, `Player.cmRepMem`); Free Role fra databasen
  (`CMRatings.fr` → `Player.cmFree`, spillerpost +0x1a; positionerne beholder 1 som i originalens spor); klubbernes/landenes rå omdømme
  (`world.cmRaw`, alle tre world-filer genbygget, +58 KB); Loyalty/Professionalism i anførervalget; **taktiklistens statistik 0x896290**
  (`GameState.aiTacticStats`, efter gittermotorens kampe mellem to computerhold, springes over med et menneske; listen bruges af 0x6e0230).
  Matchsubs: **0x6e1aa0** med 11 på banen vælger computeren taktik igen (0x6e0230, flag 0x8c1, uden kampspiller), kopierer den (masker,
  instruktioner, taktikbyte, holdflag, positionstabel) og kører 0x6ddab0 før 0x6e2000; **0x6bbb60** (samspillet engine+0x1ce med originalens
  rand(20)/rand(7000)/rand(6)/rand(Professionalism), 0x6ebd70 = `captainBase`) og **0x6bbf60** (mandsopdækningens mål) efter genvalget, udvisningen
  og behandlingen. **Kontrol** mod den instrumenterede original (match_trace.c: `RECOMP_PD_TRACE=1` → PW/PS/PF/PX/PR-linjer; kørsel
  `oracle/runs/pd2-pick.txt`; `scripts/pd-trace-check.ts`): posterne efter 0x7c0d70 **103.692/103.696** ens, udvælgelsens opslag 0x7c1e30
  **3.712.901/3.728.313** (resten: arkiveringer, sporet ikke viser), formen 0x7c1950 **1.242.771/1.242.771**, kontraktens +0x3d/+0x3e/+0x3f for
  dem, der spillede, **145.088/152.312** (resten: venskabskampenes omdømmespring 0x4ca7bc og kamptruppen uden for de 50) og for de øvrige
  135.341/146.522. **Udtagelsen** (pick4, 400 PL-udtagelser, `EST_KEEP` i pick-trace-check.ts): med de estimerede input 137 samme 11 →
  med statistikken som originalen **199** → + kontraktens tællere **240**; tilbage er træningsbelastningen/skaden (med dem: 334), kontraktens
  flag/+0x44 og arbejdstilladelsen (kun belastningen estimeret: 282; kun historikken: 382, alt ens 375). **Mangler:** fitness-modulet
  0x62c3d0/0x62c590/0x62ed70 (31-bytes post, dagligt, 0x62c680), kontraktflagene +0x45 og +0x44's startværdi (0x5ce2d0 m.fl.), trupstatus for
  computerens spillere, −2-kampene (reserver, kategori 2/3 med rand(9)), landskampenes statistik (international.ts går ikke gennem applyMatchResult),
  0x8c7260; samspillet bruges endnu ikke af kamp-CA'en 0x6ec010, og init_match kalder ikke 0x6bbb60/0x6bbf60 i porten.
- 2026-11-11 – **Kommentarkøens kaldsteder (sub_6d6f70) koblet til motoren.** Før 11 af 261 kaldsteder (≈ 800 kald/1.550 køtal pr. kamp),
  nu ≈ 1.376 kald og 2.747 køtal pr. kamp mod originalens 1.428/2.841 (40 PL-kampe, frø 1; `npx tsx scripts/grid-comment-freq.ts 40 1
  <udtræk.json>` med `~/cm0102-engine/tools/cmt_extract.py` på et nyt spor `oracle/runs/cmt3.txt` – identisk med cmt2, oraklet er
  reproducerbart). Koblet med originalens argumenter og på originalens sted i kontrolflowet (og de tilfældige tal, der kun vælger kommentar):
  afleveringen sub_6fad40 §5.7–5.9 (0x6fce73–0x6ffae3: "i venstre forsvar …" med rand(20)/rand(3)/rand(2), retningsflagene, typens begivenhed
  for alle 16 typer i springtabellen 0x700250, rand(4) for 9/0x5b, E+0x54 = 0x211f) og buh 0x6fca63; boldholderens løb sub_6f09f0 (området
  0x6f0e7a, TAKE_ON 0x6f1291, hele 0xf/0x11/0x12-træet 0x6f2ba2–0x6f39aa med rand(dribling)/rand(30)/rand(3)/rand(2), tabt bold 0x6f3a27,
  opsamlingen 0x6f402e/0x6f40d9 med engine+0x1cd, buh 0x6f2912), forseelsen i løbet (0x6f145d–0x6f1e21: kortenes tabel 0x6f4354, straffeappel,
  skytte/frisparkschance, offerets reaktion) og sub_716e10 react_to_foul_decision (temperCheck 5/4/2/2/1, kort uden offer) + sub_716c90;
  udfordreren vinder i løbet/afleveringen/skuddet med hver sin kopi (feltappel rand(50) i tre tabeller, typens begivenhed med rand(6) i
  afleveringen/skuddet, "flot forsvarsspil" rand(20) i løb/aflevering/modtagelse/holdebold/opsnapning, BALL_GOES_LOOSE rand(7)); modtagelsen
  sub_6f6c00 (C vinder, hovedstødsduellen efter Jumping +0x2e, brystet, MOVE_ONTO_PASS m.fl., +0x1a7 "første gang", buh); holdebolden
  sub_70ec80 (WAIT/HOLD_OFF/hjørneflaget, buh); opsnapningen sub_6f5c30 (SCATTER/GOOD_INTERCEPT/GOALIE_CATCH/KEEPER_PUNCHES/SEMI_INTERCEPT/
  HEAD_IT); GREAT_FIRST_TOUCH 0x713acd; computerens udskiftninger sub_6e1090 0x6e1691–0x6e18be; holdstilen sub_6c54a0 0x6c5b71–0x6c6212 (med
  engine+0x1d2/+0x1d4); fordelen 0x6b9da1/0x6bad01/0x6bad31. Rettet på vejen: +0x198 sættes efter løbet (0x713961), sub_6f09f0 får arg4 =
  frit løb og arg5 (0x713b67), sub_6cb650 i pass.ts stod vendt (= {0x25, 0x2a–0x32, 0x60, 0x61}), +7/+8/+9 (hovedstødsdueller) tælles,
  ×0,85/+300-bonussen kun i løbet, afleveringens udgave kun +6. Adapteren: kort fra de koblede steder og computerens udskiftninger har ikke
  længere den *estimerede* linje (YELLOW_CARD/…/SUBSTITUTION står i køen). **Sæsontal** (380 kampe frø 1/2/3, før → efter): mål 2,52/2,63/2,66 →
  2,60/2,52/2,61 · H/U/B 53/24/23, 53/26/21, 57/23/20 → 52/26/22, 50/25/24, 51/26/23 · skud 17,1 → 17,5 · på mål 8,6 → 8,7 · hjørner 4,6 → 4,8 ·
  frispark 6,7 → 7,1 · offside 4,6 → 4,3 · gule 1,34 → 1,47. Rækkefølgen pr. tik mod originalen (SEQ=<kamp>, samme hold): kickoffens
  START_MATCH/START_GAME_* er ens, derefter skilles kampene ved første beslutning (originalen TURN, porten et løb/en aflevering) – en
  tilstandsforskel, ikke kommentarens. **Mangler:** skuddet sub_702050 (skudtypen 0x700bd0's begivenhed [esp+0x6a0], udfald, mål, redninger,
  0x717470-historierne – ≈ 45 kald/kamp), straffesparkskonkurrencen, forseelserne i afleveringen/modtagelsen/skuddet/holdebolden/opsnapningen
  og resten af sub_6bac40 (fodret som 'other' uden kommentar), hands-grenene, 0x2168-appellerne og buh/klapsalver ved udskiftning (kræver
  engine+0x8ebb ≠ 0), dykindberetningen og "10 yards"-reglen. Ydelse: ~180 ms pr. kamp mod ~100 ms (alle ændringer i arbejdsmappen).
- 2026-11-11 – **Originalens konditionsmodul injury.cpp porteret (underagent; noten `~/cm0102-engine/notes/cm-fitness.md`).** `src/game/cmFitness.ts`
  (funktionerne) og `cmFitnessGame.ts` (koblingen) – kun original DB i ægte tilstand, egen deterministisk talrække (spillets rng og zonemotoren
  uændrede). Posten pr. spiller `Player.cmFit` (31 bytes: dato, Fitness +8, kampkondition +0xa, træthed +0xc, skaden 48 bytes, tilbagevendende
  type/niveau, seneste type, træningsbelastning), `GameState.cmFitStart`/`cmOutbreaks`. Porteret: **0x62c680** (dagens opdatering, doven: skadet/
  genoptræning/fuld træning/sommerpause med ferie og genoptræning efter landets sæsondatoer 0x669bd0 – tabellen 0xb63d60 målt i oraklet, blødt
  loft over 7000/9000/9850, kampkonditionen +500/dag dæmpet af trætheden), aflæsningerne **0x62c590/0x62c510/0x62c400/0x62c3d0/0x62ed70**,
  **0x62c2f0** (trætheden −13/−rand(13) om dagen, 0x5ce2d0), **0x62bd10/0x62c080** (efter kampen: kampkonditionen = slutkonditionen, trætheden +
  (10000 − kondition)/100 + minutter, ½ i venskabskampe, ·1,25/·2 efter alderen; de ubrugte udskiftere med), **0x62be00** (kampens knocks –
  gittermotorens 0x6d0980 kalder `globalThis.cmKnockHook`, én linje i gridMatch.ts), **0x62d140/0x62d250/0x62e500/0x62e700/0x62e820/0x62e9e0**
  (skadetypen af 82 typer, længden efter fysioterapeut/alder/Injury Proneness, tilbagevendende skader og deres behandling, karrierens slut,
  sygdomsudbrud), **0x62b7b0** (dagligt: træningsskader på hverdage for max(10, spillere/150) tilfældige, med tab af Acceleration/Pace/Agility),
  spilstarten **0x62cf70 → 0x5cc850 (fra databasens 1/1) → 0x62a920**. Spillets egen kondition (+9 + NF/2 om dagen) og skader (sim.ts injure,
  landskampe, venskabskampe) bruges ikke længere i de spil: `Player.condition`/`Player.injury` (nøglen `cm<type>`, i18n `injury.cm0..81` på en/da)
  sættes af posten (0x62c590/0x62c400) før kampene, efter kampene og dagligt for menneskets og de skadede. Computerens udtagelse (aiTeam.ts
  roleDataOf) læser 0x62c590/0x62c3d0/0x62ed70 af posten. **Kontrol** (`scripts/fit-trace-check.ts` mod `oracle/runs/fit1.txt`, ny
  `RECOMP_FIT_TRACE` i match_trace.c, frø 1, 330 dage): 0x62c680 **1.255.873/1.255.873** (+ skadede 83.002/83.002, landsholdsspillere i sæsonen
  306.824/306.824, i sommerpausen 42.853/46.903 – landsholdsopholdet staff +0x24 er ikke porteret), 0x62c2f0 **2.230.772/2.230.772**, 0x62bd10
  **220.372/220.372**, 0x62c080's tillæg **217.226/217.226**, 0x62be00 **23.211/23.211**, 0x62d140 6.620/6.698, skadens længde 6.886/6.890.
  **Udtagelsen** (pick4, 400 PL-udtagelser, samme 11): de estimerede input 137 → statistikken 199 → kontraktens tællere 240 → **trætheden og skaden
  som originalen 334** (bænken 257, alt ens 237); tilbage er kontraktens +0x44/+0x45 (med dem 382, alene estimeret: 290) og 0x8c7260 (343 med
  historikken, 400 med begge). Langtidstest 2 sæsoner (original, ægte): ingen fejl. **Mangler:** landsholdsopholdet (+0x24 → 0x76e040), club
  +0x1db, menneskets træningsskemaer (standard 68/48), byten 0xae2d0c +0xa; gittermotoren starter stadig med `100·max(60, Player.condition)`
  (originalen 0x62c590 rå i MATCH_PLAYER::setup 0x6eb026 – motorens fil), adapterens slutkondition er i hele procent; zonemotorens kampe har
  ingen knockliste (en skadet får en *estimeret* knock). Kontraktflagene +0x45/+0x44's start (0x5ce2d0), trupstatus for computerens spillere,
  reservekampe og 0x8c7260 er ikke lavet.
- 2026-11-11 – **Skuddet sub_702050 hele vejen (takeShot.ts + shotParts/R2–R7, story.ts), forseelserne uden for løbet, straffesparkskonkurrencen,
  den sete kamp (engine+0x8ebb) og adapterens sidste *estimerede* linjer.** Noten `~/cm0102-engine/notes/702050-shot-commentary.md` (+ fouls-outside-run.md,
  4782-4786-counters.md, 717470-stories-block.md, 6be710-8ebb-tenyards.md). **Skuddet** er oversat instruktion for instruktion fra 0x702050 til 0x70a5a8
  (prologen, den forkerte fod, keeperen 0x700420, udfordringen 0x6c87e0 med flag9 = keeperens tilstand, knock-tjekket 0x6cfe10, skuddets egen
  forseelseskopi 0x7026c2–0x702f1a, FINDS_A_GAP/IN_CENTRAL_ATTACK 0x70354d, skudtypens kommentar med fod-/keepervarianterne 0x70362d–0x703883,
  offside på en anden angriber – **rand(500) = 0 giver straks offside, ellers venter hændelse 8 (porten havde det vendt)**, skudlinjen med
  blokeringens kommentarer 0x70dfd0 (BLOCK_SHOT/RICHOCHET/WALL/CLEARED_OFF_LINE …), resultatkoden, karaktererne og tællerne +0xa/+0xb/+0xd,
  langskuddets spillerture 0x7103e0, keeperen ude af position, spændingen engine+0x4786, afbrænderne med pres-/historiekæderne, målet med
  GOAL_SCORED/GOAL_ONE/SCORED_PENALTY/WINNING/EQUALISER …, ILLEGAL_*/GOAL_DISALLOWED (mål med param 2 annulleres), stillingen +0xf5bd tælles i
  skuddet 0x708a31, holdhistorierne 0x6d4b70, SILENT_* (klub +0x53 → land +0x77 = 8: de engelsktalende lande), redningerne PARRY/TIPPED/HELD
  med keeperens busy og RESTART_CORNER, omspark param 5/6). sub_700bd0 giver nu skudtypens begivenhed (a3) og frisparkets rand(3). sub_717470
  (bytetabellen 0x717c4c) og 0x6d4b70: mediehistorikken spørges med nyhedstypen −1 og er altid tom – tallene trækkes stadig. **Limen:**
  +0x198 sættes ikke før skuddet, GREAT_FIRST_TOUCH før skudscoren (0x713bf9), param = sub_6bba80 (1/2), a5/a6 = sub_6bcbd0's to største
  pressere; engine+0x1a7 nulstilles efter boldholderens valg (0x71065f) og i sub_6f0970 – **GREAT_FIRST_TOUCH 32 → 9,3 (orig 8,8)**;
  engine+0x4782/+0x4786 og +0xf5aa/+0xf5a6 i alle skrivere (take_ball, løbet, opsnapningen, modtagelsen, afleveringen, sub_6c54a0, konkurrencen).
  **Forseelserne** ('pass', 'receive', 'receiveR', 'hold', 'shot' i foul(), handsFoul for modtagelsen/opsnapningen/blokeringen, sub_6bac40
  som originalen med *_PAST_TENSE, sub_6bb8d0 agitateTeam overalt; TICKING_OFF bruger sværheden, ikke arten), avisens udvisningshistorie
  0x6f17c2/0x6fb8bd (ingen kommentar), **"10 yards"** 0x717144 (engelske turneringer). **Straffesparkskonkurrencen**: 0x2005/0x2006/0x2004,
  køens +0 gemt i engine+0x8ea4, skuddet via takeShot med param 3. **Den sete kamp** (engine+0x8ebb = ctx.watched, adapteren: menneskets kamp med
  kommentar): straffeappellen 0x2168 på seks steder, buh/klapsalver ved udskiftning (+0x33), BOO_OFF_PITCH/SILENT_WON_MATCH ved slutfløjt,
  territoriet ved poss −1; usete kampe er bit-identiske med før. **Adapteren**: mål-, rednings-, afbrænder-, blokerings- og straffesparkslinjerne
  kommer fra køen (SEM: goal/save/wide/shot-blocked/shootout-end), ingen *estimerede* oveni. **Kampstart**: samspillet 0x6bbb60(0/1) og
  mandsopdækningen 0x6bbf60 (init_match 0x6b8bc5–0x6b8bd5, matchSubs.ts kickoffSetup) og konditionen fra 0x62c590 (cmFitness.ts), når spillet har
  konditionsmodulet. Limens rand(8) i tillægstid efter mål er væk (skuddet skriver ikke +0x8eb7). **Ydelse** (samme resultater): buildOrder slår
  pladserne op én gang, zonevalget bygger feltlisten én gang – 100 kampe 14 s → 12–13 s (tsx). **Kommentaren** (40 PL-kampe frø 1): 1.383 kald/2.763
  tal pr. kamp (orig 1.428/2.841); skudtypens kommentarer 15,6 (20,1), GOAL_SCORED 2,7 (2,9), GOAL_ONE 1,6 (1,9), SHOT_HEADER 4,2 (4,8), RICHOCHET 2,5 (3,3),
  FINDS_A_GAP 1,5 (2,9), GOOD_SAVE_NOT_HELD 1,9 (2,6), PARRY 1,9 (2,0), HELD 0,9 (0,9), TIPPED 0,7 (0,9), HAND_BALL 1,8 (1,7), YELLOW_CARD 1,8 (1,6),
  RESTART_FREEKICK 6,7 (7,5), RESTART_CORNER 4,2 (5,3). **Sæsontal** (380 kampe frø 1/2/3, før → efter): mål 2,60/2,52/2,61 → 2,78/2,69/2,76 · skud
  17,5/17,4/17,5 → 17,3/17,4/17,5 · på mål 8,7/8,6/8,7 → 9,7/9,5/9,8 · hjørner 4,9/4,8/4,7 → 4,7/4,9/4,8 · frispark 7,2/7,0/7,1 → 7,1/6,9/6,7 · offside
  4,3/4,4/4,3 → 3,8/3,9/3,6 · gule 1,44/1,52/1,46 → 1,47/1,41/1,41 · H/U/B 52/26/22, 50/25/24, 51/26/23 → 51/25/24, 52/22/26, 52/22/27. **Mangler:**
  målenes tællere +0x3d…+0x45/debut +0x30 fra PlayerStats (MATCH_PLAYER::init 0x6eb1b4–0x6eb41a; nu −1000/0), +0x1/+0x2, klubtype-kommentaren 0x20f5
  i forseelserne, Comp_Stats-løbene (8619–8623), tilskuernes sange 0x6c6279 (klub-id'er/regioner), samspillets læsning i kamp-CA'en 0x6ec010
  (0x6ec3c1 ganger kaptajnsleddet [esp+0x18] – det led findes ikke i portens matchCa), landingens tre forseelsesblokke sub_6c9cd0 (stadig 'other'),
  straffepletten (originalen lader bolden ligge på forseelsens felt), WINS_BLOCK_TACKLE 13 (20) og PICK_UP_FREE_BALL 131 (148) er tilstandsforskelle.
- 2026-11-12 – **Kontraktens klager/tilfredshed og arbejdstilladelsens historik (underagent; noten `~/cm0102-engine/notes/cm-permit-contract.md`).**
  Nyt spor `RECOMP_CT_TRACE` i match_trace.c (kontrakterne før/efter 0x5ce2d0, 0x867700/0x8674e0/0x867520 med kaldested, rand i kontraktdelen,
  historikken, 0x4cb250's input og resultat), kørsler `oracle/runs/ct1–ct3`. **0x4cb250 porteret helt** (`unhappyCore`, flagene 4/0x10 og alle
  udgange): **152.131/152.131 kald ens** (`scripts/ct-trace-check.ts`); fejl rettet i både 0x4cb250 og 0x4cb0a0 – `fdivp st(1)` efter `fxch` giver
  (+0x3e + 4)/G og (+0x3f + 5)/x, ikke omvendt. 0x867700/0x8674e0 (`cmFlagSet/Clear`, uden transferønsket). 0x5ce2d0's kontraktdel: +5 om dagen
  for professionelle uden klager (R1 – forsæsonens hop til 100), skade > 14 dage, status 7 → −50 og 0x10, rydningen efter +0x3f, klubtabellen
  [0xae2d14]+5 ugentligt (`cmContractDaily`, sim.ts newDay). **Arbejdstilladelsen 0x8c7260** (`src/game/cmPermit.ts`): 0x8c7560/0x53d740 (britiske
  lande, EU = nation.dat +0x7f = 2 + Schweiz [0x9cf4ac]), spilstarten 0x8c6e60 (89 poster i oraklet, 83 hos os), kampene 0x8c39f0, klubskifte
  0x8c7e20 (setClub), naturalisering 0x8c7330 → roleScore's historik (aiTeam.ts). World-filerne (3.9.60/65/68) har nu staff +0x1e (`n2`, anden
  nationalitet) og +0x3e (`j`, kom til klubben) → `Player.cmNation2/cmJoined`. **Udtagelsen** (pick4, originalens input, `EST_KEEP`): 334 →
  historik 343 → kontrakt 382 → begge 400 (uændret; de nye porte er kontrolleret funktion for funktion). Med originalens input men én ting ændret:
  trupstatus = 2 for alle 154/400, +0x45 = 0 343, +0x44 = 0 361. **Mangler (størst først):** trupstatus for computerens spillere 0x83cb40
  (Shortlist_Manager – 40 pladser, 0x6e2000, transferlistning; vi bruger Player.squadStatus), resten af 0x5ce2d0's klager (kontraktforlængelse,
  løn, medier, relationer, stemningen +4), transferønsket 0x4d8610, historikkens ældre sæsoner, reservekampe (−2) i historikken. Opgave 3's
  konditionsdele (landsholdsopholdet +0x24, club +0x1db, fysioterapeutens tre pladser, menneskets træningsskemaer, 14/7) er ikke nået.
- 2026-11-12 – **Låsetrin (lockstep) mod den instrumenterede original + 23 oversættelsesfejl rettet.** Værktøjet: `match_trace.c` har fået nye
  linjer (kun tilføjelser): `RECOMP_MATCH_TRACE_RAND=1` → hvert `rand` 0x90cfc0 i en sporet kamp som `r <n> <returadresse> = <resultat>`, ved
  M-dumpet `EN` (hele motoren, 0xf700 bytes), `RS`/`RN` (staffpost + land), `KN` (landene i 0x6c6a60), `RL` (playmaker/target man via
  sub_897dc0), `OF` (dommerposten [engine+0xf5b6]), `FX`/`CP`/`CL` (kamp, turnering, klubber); `RECOMP_MATCH_TRACE_FULL=<K>` → `XE` (hele
  motoren efter T-linjen i de første K tik); `RECOMP_MATCH_TRACE_PO=1` → `PO` (afleveringsmulighedens W/kort/lang + rammen ved 0x6c82c2). Kørsler
  `oracle/runs/ls1…ls7.txt` (frø 1, 45 dage, de første 4–8 PL-kampe; samme tal med og uden instrumentering). `scripts/lockstep.ts` (+ CLI
  `scripts/grid-lockstep.ts <spor> [kamp] [tik]`): bygger spillerne af originalens poster (`playerOf`, postbytes = Player.attrs, `recRaw`), sætter
  hele MATCH_PLAYER-tilstanden, taktiktabellerne (P/I), mandsopdækningens mål (+0x5bf), holdflag, motorens felter, dommer, vejr (engine+0x4756),
  banen (engine+1), turneringens omdømme, roller og lande ind i toppen af tik 0 (`ctx.expose` giver limens lokale tilstand) og fodrer originalens
  tal: hvert kald skal have originalens n (rand(|n| > 0xffff) med det indre kald 0x90d073 forbrugt), alle tikkets tal skal bruges, T-linjen
  og (LOCKXE=1) alle spillerfelter mod XE-dumpet sammenlignes efter hvert tik, PO-linjerne pr. kandidat. Ved afvigelsen: originalens
  kaldsted, portens stak (LOCKHIST=n) og forskellene. `tests/gridLockstep.test.ts` med `tests/fixtures/lockstep-pl1.txt.gz` (53 KB, kampen
  299–1873, tik 0–10). **Rettet (adresse):** rand(|n| > 0xffff) med det indre kald (0x90d00d–0x90d09c, randOf); markeringens "egen halvdel"
  er BOLDENS (0x6ba28e sub_714d00); zonen: k-testen før det taktiske felt (0x71558d–0x715873); rul-loftet ftol(kond·float32 0,0025)
  (0x6f44a7); hele sub_6f4aa0 (busy < 0 → 0, karakterens vedligehold med rand(1500)/rand(75)/rand(500)/rand(1000)/rand(150)/keeperens –
  før kun busy og agitation); søjledriften læste en gammel visning (sub_715f50, +0x10a); afleveringsfejlen D⁴ (0x6fadf3, før D³); knock-tjekket
  ved afleveringens kilde altid (0x6fb512) og ved modtagelsen (0x6f72fe, med `face` som kode, sic); udfordringens multiplikator i float32
  (0x6c8964–0x6c8b3c) og D (0x6c88ae); sub_6f4600's taktikbit 2 i presset (sub_6bcbd0, visningen var altid false); boldholderens +0x29
  skrives af sub_7109f0 selv (0x711150/0x7111e9, limens udgave uden mellem-ftol/rand og ved dødbolde fjernet); +0x1 = afleveringer forsøgt
  (0x6fcac5, −1 ved offside 0x6fa42c; sub_6f55c0's "> 50" læser den – ikke en skade), +0x2 nåede frem (0x6f06dc), +0x13 offside (0x6fa424),
  engine+0x1a4 i take_ball (0x6f0690); sub_6f55c0's grundværdi med aktuel motivation og Dirtiness; float32-felterne +0x4d/+0x59/+0x1a2
  (alle skrivninger afrundes) og afstandstabellen 0xa15e44 som float32; konditionsdrænets konstanter 6/11, 4,2/11, 1,8/11 (0x6f5756–0x6f57b7);
  modtageren vender sig ikke ved boldhøjde ≥ 4 (0x6f6e22); afleveringsmulighederne: turneringens omdømme (0x6c6fc6, før null), K i float32 og
  efter staffpostens land (0x6c6a54, før holdets), keeperleddet −2000 − 5000·d (0x6c79a2, før 25000·d), modtagerens busy > 1: −50·(cr+4)·b²
  (0x6c821f, før et aldrig sat felt og 10·), playmaker/target man (0x6c7032, ctx.roles); de dovne situationsfelter (freeRun, facingGoal,
  runTarget trækker tal først, når sub_7109f0 bruger dem); udfordringens ord [esp+0x70] klemmes til 0 (0x711162); spillerpostens interne
  egenskaber med fortegn (sub_6bce80 0x6bd188: rand(dribling) kan være negativ – recByte giver den interne værdi, i spillet *estimeret* af den
  viste); den angribende stå-eller-løb-regel (0x7149a1–0x7149f5, var vendt); "længst fremme" +0xf596/+0xf59a (sub_6cd660 i toppen af tikket,
  kun opad ved skridt 0x6f3b8f) i forsvarets step-up (før de aktuelle positioner); randS kalder rand med det negative n. **Låsetrin:** kamp 0
  (299–1873) er identisk i **9 tik / 7.147 tal** (tilstand, T-linjer, XE-dump og afleveringsmuligheder), kamp 1 3 tik; kamp 2–7 skilles i tik 0
  efter 80–500 tal. **Tilbage (første afvigelser):** kamp 0 tik 9: step-up'ens "længst fremme"-angriber står i originalen på række ≥ 10
  (en positionsforskel uden tal-forskel tidligere i tikket); kamp 3/7: knock-tjekket 0x6cfeb8 slår spillerens aktuelle skade op i
  konditionsmodulet (0x62ed70 → K = 6, 0x62ec00, rand(25) fordobler sværheden) – ikke i porten; kamp 2/4/5/6 ikke undersøgt. Spillets data
  (ikke motorens): vejret engine+0x4756 er 0 i de fleste af oraklets kampe (GRID_UNKNOWN.weather = 3), de interne postværdier, roller og
  spillernes lande findes ikke præcist i spillet. Testene gridChallenge (randS' yderpunkt), gridMarking (boldens halvdel) og gridVision
  (float32-tabel) rettet, fordi de kodede de gamle regler.
  **Sæsontal** (380 kampe frø 1/2/3; mine motorrettelser alene oven på 0ef596e, uden den anden agents spilændringer): mål 2,78/2,69/2,76 →
  2,14/2,10/2,21 · skud 17,3/17,4/17,5 → 14,8/14,6/14,5 · på mål 9,7/9,5/9,8 → 7,7/7,6/7,7 · hjørner 4,7/4,9/4,8 → 4,5/4,3/4,3 · frispark
  7,1/6,9/6,7 → 7,0/6,5/6,5 · offside 3,8/3,9/3,6 → 3,9/3,8/3,7 · H/U/B 51/25/24, 52/22/26, 52/22/27 → 52/25/22, 47/25/28, 46/27/27. Rettelserne
  er verificeret mod originalens tal, men laboratoriets input er stadig skøn – de interne postværdier alene tager 0,26 mål (med den viste
  værdi 2,40); vejret (3 mod oraklets typiske 0), roller, lande og skaderne i knock-tjekket er de næste kandidater, før tallene kan vurderes.
- 2026-11-12 – **Computerens trupplan 0x83cb40 (trupstatus), 0x6e6340, managerblokken 0x1000, konditionens sidste dele og de interne værdier
  (noterne `~/cm0102-engine/notes/83cb40-squad-plan.md`, `6e6340-plan-score.md`, `cm-fitness.md`, `cm-internal-attrs.md`).** **0x83cb40 porteret**
  (`src/game/cmSquadPlan.ts`: pladserne 0x83c090 – 40 pr. klub, maskerne pr. formation 1..9 – grupperne, truppens filtre, 0x6e2000 for gruppe A/B/C
  med 0x6e2f20, de øvriges lån/salg/fritstilling, nøglespilleren af 0x6e6340 mod de andre, pladsernes indehavere og vurderingen; 0x7bca90
  styrkemålet, 0x5986b0 økonomien, 0x5cccd0's daglige port) med `cmSquadPlanGame.ts` (spilstarten 0x83a1b0 for alle klubber i aktive ligaer,
  dagligt efter datoskiftet, managerskiftet 0x84abe0 i board.ts). Trupstatus står nu i kontraktens +0x4f (`Player.cmContract.b4f`, som
  roleScore/0x4cb250/0x5ce2d0 læser via `statusCode`) og i `Player.squadStatus` for computerens klubber; menneskets valg skriver også +0x4f.
  World-filerne har `cmRaw.clubStat` (club.dat +100 status, +119) og `cmRaw.compRep` (club_comp.dat +105) – kun tilføjet, resten byte-ens.
  **0x6e6340** (`engine/grid/planScore.ts`, underagent) 75.752/75.752 og 400.000/400.000 kald; **0x6e2f20's managerblok 0x1000** (`roleScore.ts`)
  – planlæggerens 0x6e2f20 379.124/379.124 for computerens klubber. Nyt spor `RECOMP_SQ_TRACE` (match_trace.c, SA/SP/SV/SJ/SR/SB/SQ/SZ) og
  `RECOMP_PS_TRACE`; **0x83cb40: 4.472/4.474 kald helt ens** (sq4, 60 dage; trupstatus 23.213/23.234) af originalens input (`scripts/sq-trace-check.ts`);
  de to er menneskets klub i overtagelsens kald. **Udtagelsen** (pick4, 400 PL-udtagelser, `scripts/pick-trace-check.ts`, alt andet fra originalen,
  én ting estimeret): trupstatus 154/400 (= 2 for alle; med porten lig originalens → 400), +0x44 361, +0x45 343, historikken 382, kontraktens tællere
  330, kampstatistikken 213, belastningen/skaden 282; alt fra originalen 400/400 (bænk 399). **Konditionen** (underagent): landsholdsopholdet
  staff +0x24 (= landsholdets *klub*; slutdatoen fra 0x76e040's række, sat af 0x76bab0 – `onIntlDuty` i international.ts) → sommerpausen
  46.903/46.903; club +0x1db = Europa-turneringen (326 CL, 328 UEFA, 330 Inter-Toto; −1 ingen – `cmClubEuro`); fysioterapeuten = bedste af club
  +0x1cf's tre; træningsbelastningen 0x8b4f60 (skema → 68/80/48/0; computerens 50). **Player.cmInt** (underagent): originalens 18 interne
  egenskaber (s8, spillerpostens rækkefølge +0x1e … +0x43, `CM_INT_OFFSETS`) – præcist ved spilstarten (163/163 spillere mod sporet); i sæsonen
  holdes de faste og de viste regnes af dem (`cmIntSync`) – originalens træning (TRAINING_MANAGER 0x8b1750/0x8b2be0) og udvikling (0x5ce2d0
  0x5d38f9–0x5d578d) er ikke porteret; playerRecord (aiTeam.ts) bruger cmInt. **Mangler (størst først):** transferlistningen fra planen (0x842320
  skriver kun +0x4e; transfers.ts' egen AI-listning `aiClubTurn`/sæsonslutningens udsalg skal slås fra i ægte tilstand med den originale database,
  og +0x4e bit 1/2 skal drive Player.listed/loanListed – men will.ts' transferønsker bruger også Player.listed, så de skal skilles ad først),
  reserve/førsteholdet 0x4cc0b0/0x4cc0f0 (staff +0x5e → Player.reserves; originalens pick_team udelukker ikke reserverne), B-holdene 0x540a50,
  ønskelisten/målene (+0xf/+0x17, 0x844540, 0x83b6e0, halen 0x83e9bd–0x83f32b), managerens ikke-spillerpost i hukommelsen (afviger fra databasens
  rå værdier – staff-initialiseringen ikke porteret), 0x7c6830 (sproget), reservekampene 0x84be20 (fixture −2 i gittermotoren; statistik/
  kontrakt/kondition/arbejdstilladelse). **Opgave 2 (0x5ce2d0's øvrige klager) ikke nået** – afkodet til videre arbejde: R2 0x5cf923 (+0x44 + 5 når
  klubbens stemning [0xae2d14]+4 > 2 og Loyalty > 10), stemningen 0x5cd61d–0x5cd75f (ligatabellens række 0x4a4850: +4 kampe > 8, (+0x72 −
  +0x73)·22/hold, ganget med ((omd − 500·liga+0x69) + (omd − 5000))·0,0002 + 1)^1,5 for store klubber, −1-loftet for bunden), begivenhederne +0x40
  (0x8676f0/0x8676d0/0x867560), transferønsket 0x867700 → 0x866f60 → 0x4d8610 (ikke manager/assistent, +0x44 ≥ 0, +0x49 = 0, ingen bud, ikke
  listet/ønsket (+0x4e & 9), ikke i 0x8c1870, over 20 år eller nuv. omdømme > 4250; menneskets manager +0x59 −1 ved rand(5) = 0, flag & 0x16288),
  kontraktforlængelsen 0x5d11aa/0x5d1448 (flag 1/2), lønnen 0x5d0e47 (flag 8), relationerne 0x5d24e7.
- 2026-11-12 – **Originalens spillerudvikling og træning, klubbens stemning, transferønsket og trupplanens listning i spillet (noten
  `~/cm0102-engine/notes/cm-development.md`).** Nyt spor `RECOMP_DV_TRACE` i match_trace.c (D0/Dh/Dr/D1/D2 for udviklingsblokken, T0/Ts/Tc/Tt/Tr/T1 for
  0x8b1750, DA for stemningen; indsat ét kald i sub_rand_hook, pick_trace_fit/injury/avg og aimode_trace_row), kørsler `oracle/runs/dv1` (75 dage) og
  `dv2` (125 dage). **Udviklingsblokken 0x5d38f9–0x5d5777 porteret** (`src/game/cmDevelop.ts` developCore: personligheden, toppen, omdømmet, spilletid
  og karakterer → tabellen 0x9cd21c, trætheden, skaden, klub/trænere/division ganger T, Professionalism og alderen, CA += rand(T) med divisionens
  loft og PA, fysikken/de mentale efter toppen, før toppen og i midten, aldringen 30–32/33–34/35–37/38+) med **0x538bc0 + 0x8b3640** omkring
  (`cmTraining.ts` normaliseRec, `playerInit.ts` normaliseInternals): **6.970/6.970 udviklinger helt ens** (alle tal, hele spillerposten og
  personligheden; dv1 4.188/4.188), **0x538bc0 6.970/6.970**. To fejl fundet undervejs: D = (karakteren − snittet)·4,5 skrives oven i A ([esp+0x60],
  push 0xa forskyder stakken), og rand(3L) deles med 10 (0x66666667 + sar 2), ikke 5. **TRAINING_MANAGER porteret** (trainCore 0x8b1750 uden
  menneskets skemavalg/positionstræning, applyTraining 0x8b2be0, posten på 6 bytes `Player.cmTrain`, ugetælleren `GameState.cmTrainWeek` 0x8b1730):
  **89.990/89.990 træninger ens** (effekterne, posten og egenskaberne). I spillet (kun original DB i ægte tilstand): `cmDevDaily` efter
  kontraktdelen (sim.ts newDay; training.ts develop() kører ikke), træningen ved kampopsætningen (prepareMatch → `cmTrainSquads`, begge
  kamptrupper) og ved nye skader (cmFitness.ts addInjury → FitCtx.train); de viste egenskaber regnes af de interne (cmIntSync). Spillere uden cmInt
  får dem skønnet af de viste (playerInit.ts intrinsicOf, *estimeret*). **Klubbens stemning +4 (0x5cd61d–0x5cd75f)**: formlen 1.648/1.648 uger
  af oraklets input (`moodValue`); +0x72 = udgangsrækkefølgen af club.dat +0x5b/+0x5f (world-filerne har nu `cmRaw.clubStat[id][2..3]`, kun
  tilføjet; sæsonslut skriver den afsluttede tabel – season.ts) og R2 0x5cf923 (+5 ved stemning > 2 og Loyalty > 10). **Transferønsket**:
  0x867700 → 0x866f60 (`wantsToLeave`, helt) → 0x4d8610 (`handleTransferRequest`: computerens klub giver lov – +0x4e bit 8 – eller afslår med
  flag 0x10000 og +0x44 += s8(5·Loyalty + 56); menneskets klub får en henvendelse via will.ts). **Trupplanens listning** (0x842320 → +0x4e):
  computerens klubber sætter kun spillere til salg/leje efter +0x4e bit 1/2 (cmSquadPlanGame.ts); transfers.ts' egen AI-listning (aiClubTurn,
  initialTransferList), nedrykningens udsalg (season.ts) er slået fra med den originale database i ægte tilstand, will.ts' anmodninger bliver +0x4e
  bit 8 (ikke Player.listed), 0x544520 = Player.listed eller +0x4e & 9; 0x4cc0b0/0x4cc0f0 → `Player.cmPlace` (staff +0x5e – ikke Player.reserves,
  originalens udtagelse udelukker ikke reserverne); 0x8c16b0 → fritstilling straks (*estimeret* – køen +0x92c er ikke afkodet). Planens "aktive liga" kræver nu, at ligaen spilles (g.comps) – lande uden simulerede ligaer blev planlagt og listet som aktive, og deres trupper kunne tømmes, før activateNation spillede de forpassede kampe (soak: MatchSim uden spillere).
  **Fejl i spillets talrække rettet:** cmRand gav 0 for negative grænser – originalens 0x90cfc0 giver −(0..|n|−1) (udviklingens rand(T)/rand(L) for
  ældre spillere; påvirker også kontrakt-/konditions-/plankoden, hvis de trak med negativt n). **Målt i spillet** (`scripts/dev-cal.ts` frø 11, 31/8-01 →
  31/8-02, CA ≥ 100, median (p10, p90)): ≤18 +10 (0, 22) · 19–20 +6 (0, 18) · 21–23 +5 (0, 15) · 24–28 +4 (0, 12) · 29–31 0 (−7, 7) · 32+ −11 (−20, −4)
  (de gemte spil: +7/+2,5/+2/0/−3/−9); CA150+ 552 → 1.113 (gemte spil 495 → 495). Pr. udviklingsdag (14/7–22/10, CA ≥ 100) spillet/oraklet: 24–28
  +1,97/+4,67, 29–31 +0,54/+2,87, 32+ −4,11/−3,43 – oraklets egen sæsonstart vokser altså hurtigere end de gemte spils år; forskellen mellem år og
  dage (noget andet i originalen sænker CA, eller populationerne – oraklet har ~6.800 spillere, vi 39.863) er ikke undersøgt.
  **Mangler / *estimeret*:** trænernes Coaching GK/Man Management/Youngsters og ikke-spillerpostens værdier i hukommelsen (hos os de interne, der vises
  som databasens 1–20), menneskets
  trænerfaktor 0x8b41d0/0x8b2880 (læser en uinitialiseret stakplads ved fem områder – oraklet: Arsenal 80/102/91/97/91; hos os 100) og
  skemavalg, positionstræningen, træningen fra skærmene, træningsnyheden 0x5d499a, relationerne 0x547d90/0x547f50/0x547f90, prisen 0x4d1600 i
  0x4d8610 (vores udbudspris), managerens forhold i 0x867700, rækkefølgen for oprykkede i +0x72, ligaernes virtuelle 0x98 (hos os: under øverste
  niveau), 0x5ce2d0's lønklage 0x5d0e47 (flag 8), kontraktforlængelsen 0x5d11aa/0x5d1448 (flag 1/2), mediehistorierne 0x5d0041 og begivenhederne +0x40.
- 2026-11-12 – **Låsetrin, anden runde: 31 oversættelsesfejl rettet; kamp 0 identisk i 22 tik (16.890 tal), kamp 2/3 i 14–16 tik.** Nye linjer i
  `match_trace.c` (kun tilføjet): `RF` (konditionsmodulets post 31 b + skaden 48 b), `HU <side> <0x600a50(klub,0,fx+0x40,0,0)> <0x600a50(klub,0,1,0,0)>`,
  `TU`/`TV` (indgang/udgang af hver tur sub_7103e0: side plads x y [handling]). Kørsler `oracle/runs/ls8…ls12` (ls12 + `ls12-aimode.txt` fra
  RECOMP_AIMODE_TRACE i samme kørsel). **Værktøjet** (`scripts/lockstep.ts`): turene sammenlignes én for én, gittercellerne engine+0x215e
  injiceres og sammenlignes med XE, holdflag og instruktioner sammenlignes med XE, 0x6df460's spildata (styrke 0x6e86d0, tabelrækker, manager,
  kamptype) tages fra `<spor>-aimode.txt`, mens motorens egne felter (ur, mål, publikum, territorium, tilstand, r) sammenlignes; `LOCKWATCH=side,idx,felt`
  viser hver ændring af et felt med stak; arrays injiceres på stedet (limens lukninger beholder dem). **Rettet (adresse):** knock-tjekket
  0x6cfe10 med spillerens skade (0x62ed70 → f = 6, kropsdelen 0x62ec00 = INJ_TYPES-kategorien, sværheden ×2 medmindre rand(25) = 0, 0x62ece0's
  ×min(s/2 + 1,5, 3), float32-f, byte-sværheder, kropsdelens returgrene, faktorerne 5/9 og 10/21) og 0x6d0980 med 0x62be00's flettede sværhed
  (`GP.inj` fra konditionsmodulet via cmFitRead.update + Player.cmFit); handlingsrækkefølgen sub_6bd760 (spillerblokkens INDEKS + plads ≥ 0,
  CRT-qsort 0x945333/0x945487 – ustabil, `msvcQsort` i loop.ts); **gittercellernes lister** (`cells.ts`: indsættelsesorden, "byt med den sidste"
  ved udtagning – 0x6f46b0, skridtet 0x6f3a67, 0x6cdd50, indskiftningen 0x6cdd00) brugt i 0x6c87e0, opsnapningen/skudlinjen (pass.ts),
  0x716630, presset og zonevalget; 0x6f0cff (arg4 ≠ 0 → momentum + ftol(finishing + 20)), 0x6f0d4c (+0x13c også for 0x10), banen engine+1 i
  boldholderens skridt (0x6f0d90, tabellen 0x6f42d4); Free Role = spillerpost +0x1a (0x714286, før 1); egen tredjedel i markeringen 0x714830/0x7154e9
  (sub_6cb930(side == 0) – før modstanderens); 0x6d42a0 ("hold føringen", før altid nej); sub_5407e0/0x5408c0 (boldholderens omdømme set fra
  udfordreren, 0x6c95df – før 0); sub_6cd660/0x6cd5f0 (bageste mand registreres i toppen af tikket, før de aktuelle positioner);
  **CRT-pow** (`engine/crtMath.ts`: 0x945ff0 = 2^(y·log2 x) via frndint/f2xm1/fscale – 9^1,5 = 26,999…, 13^3 = 2196,99…; brugt alle 27 steder
  motoren kalder pow); +0x39 skrives ikke ved skudscorens fejl/straffe (0x701fbe/0x700d20); 0x6cd770 slipper bolden med hele sub_6f0970
  (momentum/+0x29 = 0); bolden følger boldholderens skridt EFTER markørerne og drænet (0x6f3f83/0x6f40f9); sub_6cb700 tæller ikke boldholderen;
  indlæggets instruktionsbit er det HØJE ord (0x6fb260) og "på mållinjen" giver altid +0x19 (0x6fb33c); afleveringsmulighederne regnes, før +0x29
  får sine 70 (0x711296/0x711309 før 0x711342), og ikke i tilstand 4; det taktiske felt slås først op i det åbne spil (0x710f8b, efter
  dødboldenes gren) og [esp+0x90] er tabelafstanden til feltet (før rækkerne); sub_6bcbd0 kun ved boldhøjde ≠ −1 (0x711102 – presset ellers 0);
  sub_6cb6c0 i samme felt = boldens retning +0x8ed8 (footForTarget); optøjer ved død bold vælger INDEKSET i blokken (0x6b9c13) med temperCheck
  på bænkens egen agitation og ftol(pow(ag, 2)); rand(D < 2 ? 100 : 10) i hovedduellen (0x6c8c0a, var vendt); territoriet tælles i tikket
  (0x6b9fd3) også ved dødbold. Glemt minuteOn i indskiftningen (min fejl undervejs) rettet. Coordinatorens `Player.cmInt` bruges nu i
  spillerpostens interne værdier (recByte) og kampværdierne (sub_6ec010), når de findes. **Test:** `tests/gridLockstep.test.ts` med fire fixturer
  (lockstep-pl1 11 tik, pl0 19, pl2 14, pl3 14; uden XE-dumpene, *-aimode.txt ved siden af). **Sæsontal** (380 kampe frø 1/2/3 – NB oven i andre
  agenters spilændringer siden sidste måling): mål 2,14/2,10/2,21 → 2,16/2,02/2,19 · skud 14,8/14,6/14,5 → 13,8/14,0/13,9 · på mål 7,7/7,6/7,7 →
  7,6/7,5/7,4 · hjørner 4,5/4,3/4,3 → 4,1/4,0/4,1 · frispark 7,0/6,5/6,5 → 7,1/7,4/7,3 · offside 3,9/3,8/3,7 → 4,2/4,3/4,1 · gule 1,59/1,64/1,63 ·
  H/U 52/25, 47/25, 46/27 → 41/33, 46/26, 44/27. **Tilbage (første afvigelser i ls12):** kamp 0 tik 22 og kamp 3 tik 14 (sub_6bce80's løbemål
  vælger et andet felt – samme tal, så en deterministisk forskel i feltscoren), kamp 1 tik 10 (0x7014a4), kamp 2/5/6 (modtagelsen 0x6f6c00:
  boldhøjden [esp+0x10] er 2/3 i originalen, 0/1 i porten – og grenen for højde 2/3 0x6f7123–0x6f71db er forenklet i porten), kamp 4 tik 11
  (0x6c8c89 rand(28)/30 = 30 − beslutningsrul), kamp 7 tik 10 (0x700dd0 – skuddets "must score"), PO-forskelle i W (kamp 1/3/7: (kondition +
  karakter)-leddet målt på et andet tidspunkt i tikket).
- 2026-11-12 – **Låsetrin, tredje runde: 14 oversættelsesfejl rettet; identiske tik (ls12) kamp 0 22→51, 1 10→10, 2 16→86, 3 14→26, 4 11→27,
  5 13→36, 6 10→65, 7 10→101 (kamp 2 og 7 med mål, afspark efter mål og landingens domme).** **Rettet (adresse):** modtagelsen 0x6f6ff0
  (brystet: skill + 10·(agility − 20), før 2·) og 0x6f9aed (efter CONTROL_BALL_WITH_CHEST springes momentum over; momentum lægges til i
  16 bit, 0x6f9c07); 0x6f91be/0x6f9275/0x6f9290 (løs bold/vending efter den AKTUELLE boldhøjde efter sub_6f0630 – −1 ved keepergreb – og
  side 0 med højde −1 vender mod y − 3, sic); hovedduellen 0x6c8c70 (+0xad = Jumping, før Heading); sub_6bce80 (scoren på FPU-stakken i
  double fra 0x6bd2e2 til fcom/fstp mod det bedste float, Teamwork-floaten +0xe1); `inBoxAt` = sub_6cb960 (y afgrænset, så et mål bag
  mållinjen ikke er i feltet – afleveringskommentarens bit 0x10, 0x6fd3fe); afleveringsmuligheden 0x6c8167/0x6c819e (sub_6bd5b0 med
  MODTAGERENS eget felt, før boldholderens); **landingen sub_6c9cd0 helt efter koden** (knock-tjekket 0x6c9e72, overset forseelse som
  ventende hændelse, hands for begge og alene, de tre egne straffekopier 0x6ca18a/0x6ca839/0x6cad5d med kommentartabellerne 0x6cb4c0/
  0x6cb4f0/0x6cb5f0, 0x20f5 uden klubtype, ingen skytte, +0x16, sub_6bb8d0/sub_716e10; hovedstødsduellens kommentar 0x2164/0x214f/0x1f5d
  og +7/+8/+9; `landFoul` i gridMatch); +0x1ae[0] er en gammel peger (tælleren +0x101 nulstilles, pegerne ikke – 0x6f37eb/0x6f30e5 læser
  den uden tæller: `marker0`); **sub_6eecb0 trækker rullene sub_6f44a0** (0x6f05b9) – `recompute` (evner, lofter, rul) ved alle 32
  kaldsteder, også det ubetingede 0x703f32 og de manglende 0x6fcaa2/0x6fcb08/0x6f974e/0x6f9a7c/0x6f231c/0x6f27de/0x6f2b77/0x6f3a62/0x70d5ee;
  0x6c5564 (aiR = −1000 ved afsparket); 0x6c569b–0x6c57af (tidsspildet også ved straffe, modstanderne i tilstand 1 ophidses r/9 + 1) og
  holdflag/stilkommentar FØRST efter udskiftningsportene (0x6c5a1c); skudtypen 0x711596/0x713c64 (begge kald deler [esp+0x88], så det sidste
  kald får det førstes type som forvalg, 0x700f58). Værktøj: LOCKMWATCH=felt (motorfelt), LOCKC=1 (portens 0x6d6f70-kald). **Test:**
  fixturerne pl0 51 tik, pl2 85, pl3 25 og ny pl7 101 (uden XE, aimode klippet). **Sæsontal** (380 kampe frø 1/2/3): mål 2,16/2,02/2,19 →
  2,10/2,07/2,33 · skud 13,8/14,0/13,9 → 13,9/14,3/14,1 · på mål 7,6/7,5/7,4 → 7,4/7,6/7,5 · hjørner 4,1/4,0/4,1 → 3,9/4,0/3,8 · frispark
  7,1/7,4/7,3 → 7,5/7,4/7,3 · offside 4,2/4,3/4,1 → 4,1/4,2/4,3 · gule 1,65/1,69/1,65 · H/U 41/33, 46/26, 44/27 → 44/27, 45/28, 49/22.
  **Afvigelse tilbage i recompute:** kampværdierne sub_6ec010 regnes ikke igen (limens 6ec010 er ufuldstændig; moralen indgår i kamp-CA'en
  0x6ec890 og har 3 betingede rand-kald 0x6ee2e8/0x6ee59e/0x6ee6af). **Tilbage (første afvigelser):** kamp 1 tik 10 sub_70c040 (bolden mod
  eget mål, ikke porteret – limens intoGoal er en stub; også sub_70a910), kamp 0 tik 51/7 tik 101/4 tik 27 (turens slutfelt – et skridt i
  0x6f09f0), kamp 5 tik 36 (sub_713fc0: porten står i sit taktiske felt, originalen ikke – 0x6c2be0/0x715f50/0x6c4180), kamp 2 tik 85/6 tik 64
  (en spillers +0x2b efter tikket), kamp 3 tik 25 (boldholder/linje efter tikket).
- 2026-11-12 – **Låsetrin, fjerde runde: sub_70a910/sub_70c040, sub_6ec010 og 15 oversættelsesfejl; identiske tik (ls16, 20 PL-kampe – 1. og 2. spillerunde)
  kamp 0 51→158, 1 10→186, 2 86→193, 3 26→39, 4 27→108, 5 36→116, 6 65→196, 7 101→158, 8 25→98, 9 24→155, 10 46→101, 11 13→44, 12 31→79,
  13 14→36, 14 35→80, 15 25→164, 16 2→236, 17 30→175, 18 105→251, 19 39→119.** **Nyt:** `grid/intoGoal.ts` = sub_70a910 (bolden mod modstandernes
  mål fra en løs bold/aflevering: skudscoren (rand(1000) − rand(2000))·(fart + 1)/afstand, keeperværdien, resultatkoden, mål med debut/jubilæum/
  hattrick-kommentarer, annulleret mål, stillingskommentarerne, redning/parade/hjørne/grebet) og sub_70c040 (mod eget mål: selvmål – `GridListener.ownGoal`,
  adapteren). `grid/matchValues.ts` (underagent) = hele sub_6ec010 (kamp-CA +0x3b og de 34 kampfloats; 28.905/28.905 kald bit for bit mod oraklet,
  `scripts/mv-check.ts`, tests/matchValues.test.ts), kaldt først i limens recompute (sub_6eecb0 0x6eecb9) med spillets data fra
  `GridMatchCtx.matchValuesEnv` og motorens dynamiske felter (publikumsbyten, samspillet engine+0x1ce, taktikkens positionsord, anføreren) –
  *uden env (spillet i dag) regnes kampværdierne ikke igen i kampen*. **Rettet (adresse):** keeperværdien 0x700420 helt (grundværdien = handlingsevnen
  +0x168/+0x16a, afstanden til BOLDEN 0x70045e – flad tabel med bytes efter tabellen for bolden uden for banen, mål imod = keeperens +0xf 0x700a5d,
  ftol-overløb); vejrets skudled 0x701911–0x70195a (det store rul først); skud tæller ikke +0x2b op (0x713cc0); +0x8eb1 = 6 kun ved direkte frispark
  (0x710e9d – før alle skud, så det taktiske felt 0x6c2ca5 lod spillere "blive stående"); sub_7172d0 (moralen: delta 0 med karakter > 7500, hele delta
  når rullet fejler 0x717373); sub_6eecb0 trækker ALTID rullene (argumentet bruges ikke) – også i holdets samspil 0x6bbb60 og omrokeringen 0x6e1aa0
  (hver fordelt spiller); samspillets klub/kontrakt 0x4cf5a0/0x4cf5f0 (klubposten = [0xae23b4] + 581·[r+4]) og anføreren 0x897590; genvalgets
  ligagren 0x6e1312 (hold+0x1a = 3); sub_6c54a0 0x6c5a1c–0x6c6258 (computerens holdflag pr. tilstand 1–5 med managerens Attacking +0xe/Directness
  +0x13, publikumsbyten, aiR og taktiknavnet; tilstand 1 → sub_6d10a0 fremadløbet 0x800000 ved > 8500, ellers 0x400000 kun for pladserne på banen;
  stilkommentaren med sub_6ce310's svar); sub_6bd6b0 (kontraflaget fra cellelisterne); pick_taker 0x6ceb90 (indlægsfrisparket ved d < 6,1 – noten
  havde ≥; keeperen kun med BOLDEN i eget felt 0x6cec81); boldholderens moral (+0x17, før 10), +0x11 og modstanderne med gult kort i feltet (0x713058,
  før 0); +0x1a8 er ÉN byte (golden goal = loop.ts paused). **Sporet** (`match_trace.c`, kun nye linjer): DT (dato, fixture), MG (managerblokken
  +0x904b/+0x904d/+0x9051/+0x905d), CP/RC (anfører, klub/kontrakt/0x6ebd70 pr. spiller), ZP/ZR (zonevalget og dets kandidater), MV/MVr/MVO
  (sub_6ec010's indgange og udgange – underagenten). Låsetrinet sammenligner ZP og MVO (LOCKZP=1/LOCKMV=1 viser dem), injicerer samspillet
  engine+0x1ce. **Test:** fixturerne pl0 158 tik, pl2 193, pl7 158 og ny pl16 236 (2. spillerunde: rødt kort og omrokering). **Sæsontal** (380 kampe
  frø 1/2/3): mål 2,10/2,07/2,33 → 2,15/2,17/2,33 · skud 13,9/14,3/14,1 → 15,7/15,0/15,2 · på mål 7,4/7,6/7,5 → 8,1/7,7/7,9 · hjørner 3,9/4,0/3,8 →
  4,2/4,0/3,9 · frispark 7,5/7,4/7,3 → 7,5/7,0/7,3 · offside 4,1/4,2/4,3 → 4,3/4,3/4,4 · gule 1,65/1,69/1,65 → 1,72/1,51/1,68 · H/U 44/27, 45/28, 49/22 →
  46/27, 45/27, 46/26. **Pokalkamp** med forlænget spilletid (spor `oracle/runs/cup1.txt`, turnering 72, kamp 42 = 11–1873, 1.615 tik): afviger i tik 0
  (knock-tjekket 0x6cfe10/0x6d0125 for en spiller med skadepost type −1 – 0x62ec00 læser 0x9e7ad9 − 13 = 65; låsetrinet sætter kategorien, men
  porten tager stadig rand(25)-vejen). **Tilbage (første afvigelser):** genvalget 0x6e1090 (porten skifter ud, hvor originalen ikke gør – kamp 1/2/4/8/9/15;
  spillerværdierne 0x6e2f20 i låsetrinet er spillets skøn), omrokeringen efter rødt kort (kamp 13: pladsen og taktikkens ord – 0x6cdd50/0x6e1aa0), det
  taktiske felt for forsvareren (kamp 10/11 tik 101/44: porten flytter, originalen bliver – 0x6c2be0), kommentarens kombination (kamp 3/5/14: rand(370)
  ≠ rand(270) 0x6d71be, 0x6d5d8f), zonevalget (kamp 17 tik 175), kampværdierne efter omrokering (kamp 0/18: rullenes lofter 0x6f4506).
- 2026-11-12 – **Låsetrin, femte runde: genvalget med originalens 0x6e2f20-værdier, pausen, hvile og 24 oversættelsesfejl; identiske tik (ls19, samme
  20 PL-kampe) kamp 0 158→218, 1 145→233, 2 193→458, 3 39→195, 4 108→514, 5 116→121, 6 196→435, 7 158→232, 8 98→120, 9 155→529, 10 101→263,
  11 44→115, 12 79→79, 13 36→59, 14 80→181, 15 164→271, 16 236→468, 17 165→175, 18 251→489, 19 119→190 (i alt 2.641 → 5.345 tik); pokalkampen
  (cup3, venskabsturnering 72, kamp 42) 0→382.** **Sporet** (`match_trace.c`, kun tilføjelser): `TK` (klubbernes dødboldsskytter sub_897990 – alle 0
  for computerens klubber), `SC` ([0xae2364]: id ≥ = genereret spiller), `FS`/`FT` (holdet og taktiklistens statistik ved genvalg/omrokering), `FG`/`Fh`
  (0x6e2f20's spiller og opslag inde i genvalget/omrokeringen – som pick-sporets g/h), F-linjerne også i omrokeringen uden for genvalget, `WB`
  (RECOMP_MATCH_TRACE_WATCH=side,idx,off[,n]: et kampspillerfelt ændret siden sidste rand), `RECOMP_MATCH_TRACE_FULL_FROM` (XE-vindue); begge nye
  miljøvariabler står i run_season.py's liste. **Værktøjet:** F-linjernes 0x6e2f20-værdi injiceres i genvalget, omrokeringen og 0x6e1aa0's taktikvalg
  (`GridMatchCtx.subScore`; LOCKF=1 viser portens egne afvigelser, LOCKF=port bruger portens), hold+0x16/+0x17/+0x1a fra motorens dump (rotationen
  pick_team 0x6dbdc4–0x6dc59f er ikke porteret), klubbernes omdømme/+0x53 fra CL, managerens CA (ikke-spillerpost +4), udtagelsens anfører/skytter fra
  FS, regens fra SC, skadeposter der er helet til i dag (0x62ed70 → 0x62c680), træthed (+0xc) fra RF, 0x6df460-kald over flere M-blokke, turen ved
  afvigelsen i meddelelsen. **Rettet (adresse):** engine+1 er banens byte, ikke turneringstypen (0x706cfc: +2 til redningsforholdet kun ved banetype
  2/8); float-konstanter (x87 regner med floatens værdi): indlæggets 0,1f 0x96afc4 (0x6c7b0d), 1,05f 0x96d3b8 i agitationen (0x6f2899/0x6f9d2f/
  0x6fc9ea/0x710055) og i skridtets vejrled (0x6f3d0a, 1,1f 0x6f3cfe), −0,2f 0x7130f3; sub_716450's faktor er et float-argument (også 0x6ea3c5's
  sev·0,2 + 1); keeperens greb 0x70d430 (GOALKEEPER_CATCHES 0x1fe2 / FUMBLES 0x1fe3 / 0x216f – kommentarerne manglede, signeret ord-sammenligning);
  behandlingen 0x6d0b60 (0x1f56/0x1f57/0x1f58/0x20f6 pr. spiller mellem rand(4)-kaldene); afleveringens fordel 0x6fb662 → 0x6fc0e5 (udfordreren vinder
  bolden, afleveringen fortsætter ikke) og [esp+0x2c] 0x6fc0dd; pick_taker 0x6ceb90 (skytterne fra taktiklisten k·2+j, alder staff+0x18, omdømme
  post+0xb, post+0x29, signeret ord-score, første kandidat altid); tilstand 5's motivation 0x711721 (rand manglede); målmandsdækningen 0x71590f kræver
  også målet i eget felt; **hvilen 0x710408: rand(10) + kondition·0,0078125 ≤ rand(65)** (siderne var byttet – trætte spillere hvilede aldrig);
  **pausen 0x6bd930**: 0x6ce460(990) (karakterbyten +0x1b og holdblokken) og 0x6f5810(0) for alle 40 (restitution (12·NF + 325)·k / (NF + 15)·10·k,
  k = 1,4 − 0,0004·træthed > 1000 – før ikke porteret); genvalgets flag 0x6e1312/0x6e1359 (hold+0x1a/+0x16); 0x6e0230 kalder selv 0x6df460 (0x6e025d);
  0x6ddab0's J bruger spillerpostens id (+0) og managerens CA, egenskaberne er de viste (sub_5431e0); rand(−4000) direkte (0x6ddb7a – testen krævede
  −rand(4000)); zonevalgets omdømme 0x6bc539 sammenligner klubbernes +0x53. Spillet (uden for motoren, minimalt): aiTeam.ts/adapter.ts giver
  managerens CA (Staff.ca) i stedet for omdømme·2. **Test:** fixturerne pl16 468 tik, nye pl9 529, pl10 263, cup 382 (uden XE/PO/Q/FG). **Sæsontal**
  (380 kampe frø 1/2/3): mål 2,15/2,17/2,33 → 2,41/2,31/2,38 · skud 15,7/15,0/15,2 → 15,5/15,7/15,3 · på mål 8,1/7,7/7,9 → 8,0/8,1/8,0 · hjørner
  4,2/4,0/3,9 → 4,1/4,1/4,1 · frispark 7,5/7,0/7,3 → 7,2/7,2/7,2 · offside 4,3/4,3/4,4 → 4,3/4,3/4,3 · gule 1,72/1,51/1,68 → 1,74/1,62/1,56 · H/U
  46/27, 45/27, 46/26 → 48/26, 47/25, 47/26. **Tilbage (første afvigelser, ls19):** 0x712ef1 (kamp 4/7/9: boldholderens trick-score, P eller +0x29
  ±2), 0x711b8c (kamp 10/19), afleveringsmulighedens værdier efter en udskiftning (PO-forskel kamp 19 tik 122), 0x6d5d8f/0x6d5887 (kommentaren,
  kamp 0/1/2), 0x6f49ac (kamp 3), 0x6bc838 (zonevalget, kamp 8/17), tilstanden efter tik (kamp 5/6/11/12/15), 0x6fae18 (kamp 13), 0x6ba6b9 (kamp 14),
  0x6f4975 (kamp 16), 0x6c8262 (kamp 18), pokalkampen tik 382 0x716578. I spillet: kampværdierne sub_6ec010 regnes stadig ikke igen i kampen (env'en
  mangler – kontrakt/klub/anfører fra cmPlayerData), pick_teams rotation (+0x16/+0x1a) og 0x48f150 er ikke porteret, og spillerpostens id kendes
  ikke (0x6ddab0's J bruger stab-id'et).
- 2026-11-12 – **Låsetrin, sjette runde: 14 af 20 PL-kampe er identiske HELE kampen (tal for tal, tik for tik); identiske tik (ls19 → ls20, samme 20
  kampe) kamp 0 218→753 (hele), 1 233→756 (hele), 2 458→655, 3 195→601, 4 514→829 (hele), 5 121→801 (hele), 6 435→552, 7 232→820 (hele),
  8 120→777 (hele), 9 529→793 (hele), 10 263→840 (hele), 11 115→822 (hele), 12 79→795 (hele), 13 59→769 (hele), 14 181→530, 15 271→796 (hele),
  16 468→468, 17 175→778 (hele), 18 489→772 (hele), 19 190→790 (i alt 5.345 → 14.697 tik); pokalkampen (venskabsturnering 72, 11–1873) 382→582.**
  **Sporet** (`match_trace.c`, kun tilføjelser): `RP` (spillerens forhold staff+0x65 → +0x1c..+0x30: 3 yndlingspersoner/3 uvenner som staff-id'er),
  `CN` (klubbernes lands sprog club+0x53 → nation +0x77), `CB` (dommerens turneringsbias sub_5c6710). Nye spor `oracle/runs/ls20.txt` (frø 1, 45 dage,
  XE for tik 420–859, + ls20-aimode.txt) og `oracle/runs/cup4.txt` (RECOMP_MATCH_TRACE_COMP=72, N=60, kamp 42 = 11–1873, uden XE; cup3 slettet).
  **Værktøjet:** RP → GP.favoured/disliked, CN → ctx.clubLang, CB → ctx.compBias, nationens sprog fra 3.9.60's nation.dat (indbygget id-liste uden
  den lokale database); anføreren under kampen (sub_6ec010's anførerdata og 0x6e1cf0 for en vilkårlig spiller af RC/rec/staff); kampstartens
  MV-blok kun den sidste før kampen (med COMP-filteret står andre kampes blokke i sporet). **Rettet (adresse):** kampfloats i visningen efter
  sub_6ec010 (afleveringsmulighederne 0x6c70f7 læste kampstartens Creativity hele kampen – kamp 4/7/9 0x712ef1); holdhistoriernes tabelrække
  sub_6d4b70 0x6d4c5f (0x4a4850 – stimerne +0x19/+0x2d/+0x41/+0x55, `teamRuns`); gengældelsen sub_716630: kommentaren 0x716a98 (0x20e3/0x2108/0x20e4/
  0x20e1/0x20e5/0x20e2/0x210b, 0x210c), holdets ophidselse sub_6bb950 (×2,25/2,5/2,0/1,15f) og modstanderens ag·(4 − 0,16·T) i double (ikke
  sub_716450's float-faktor), engelsk land → rand(1000) (nation +0x77 == 8, `nationLanguage.ts`); optøjernes afgørelse sub_6d1210 helt
  (0x2109/0x20f5/kortlinjerne, tabellen 0x6d1724, rand(9)/0x20df/0x20e0/0x20d9, sub_6bb8d0 med F, sub_716e10(d, 0/1), udvisningen venter (0x6cdb85:
  engine+0x1a3 ≠ 0 → ingen omrokering), udvist keeper → genvalg 0x6d1591); sub_716e10 kalder sub_6bb8d0(d, 0,75/0,85f/0,5/0,95f) (0x71704c) og
  sender flaget til 0x6cfd40, modstanderklubbens engelske land → 0x20f5 (0x7170bd); 0x6bac40's kortlinje 0x20f5 ved rand(sværhed) > rand(20)
  (manglede); landingens TICKING_OFF sammenligner sværheden (0x6ca333/0x6ca9de/0x6cadf8: [esp+0x24] med push 7 ventende = [esp+0x20]), og
  ophidselsen/protesten kun ved bløde koder (tabellerne 0x6cb50c/0x6cb5b0/0x6cb60c); offsidehændelsen tæller spillerens +0x13 (0x6bad63);
  frisparket dybt på egen halvdel flytter modstandere ud af boldens felt (0x6c4905); 6cdd50 regner ikke +0x37/handlingsevnerne for den, der
  overtager pladsen (0x6ce0a5); pladsens taktik gemmes, før pladsen tømmes (instruktionerne ændres i kampen af 0x6c54a0); engine+0xaf+side
  (0x6eecb0(p, 1) 0x6ef33e–0x6ef4d4: angrebsposition AM +1 / F +2 med side) – mandsopdækningen 0x7161f5 slipper manden; genvalget vælger ny anfører
  (0x6e18d0–0x6e1927: 0x6e1cf0 over de 20, 0x897760) – både samspillet og sub_6ec010 bruger klubbens aktuelle; spillemageren 0x6df346–0x6df432
  (0x6ddab0 nulstiller rollerne 0x6ddc83/0x6ddc9b og sætter rolle 0 = en dødboldsskytte med Creativity + Flair + Passing > 30·J + omdømme/500 –
  afleveringsmulighederne 0x6c6a30 læser den, så computerens nye taktik flytter rollen); skudscoren ganger med 1/3 som double (0x71163c – 182²/3
  gav 5008 mod originalens 5007; også 0x7019f1 og 0x6b8748/0x6b87d9), longRange ×1/6 (0x6c8396); afleveringens busy-fradrag før afleveringen (et
  knock sætter busy absolut 0x7160e0); boldholderen springer knock/vending over i 0x6f09f0 (0x6f0afd/0x6f0b17); målstregsdækningen 0x71590f
  tester BOLDENS felt ([esp+0x20]/[esp+0x14] = 0x714e2a), ikke målet; dommerens turneringsbias (−1, 0x6e9bb0). Spillet: selvmål giver nu en
  målbegivenhed i rapporten (adapter.ts `ownGoal` – manglede; gridSim-testen fangede det). **Test:** fixturerne pl7 820 tik (HELE kampen), nye
  pl1 300, pl12 520, pl18 700, cup 582 (cup4) – mkfix: scratchpad/mkfix.py-mønsteret (kampstartblokken + M-blokken til tik N+1 uden
  XE/ZR/FG/Fh/WB/PO/Q/O/D/N/J/c/C/z/H/L/B/K; aimode over alle M-blokke for parret). **Sæsontal** (380 kampe frø 1/2/3): mål 2,41/2,31/2,38 →
  2,29/2,27/2,33 · skud 15,5/15,7/15,3 → 15,3/15,6/15,7 · på mål 8,0/8,1/8,0 → 7,9/8,2/8,0 · hjørner 4,1 → 4,1/4,2/4,0 · frispark 7,2 → 7,4/7,2/7,3
  · offside 4,3 → 4,2/4,5/4,5 · gule 1,74/1,62/1,56 → 1,67/1,57/1,65 · H/U 48/26, 47/25, 47/26 → 44/29, 46/31, 46/25 (originalen 2,75–2,98 mål,
  52–53 % hjemmesejre – spillets egne kampe: holdene, 0x6e2f20-skønnet, forholdene og tabelrækkerne mangler stadig uden for låsetrinet). **Tilbage
  (første afvigelser, ls20):** kamp 2 tik 655 0x717929 (rand(3)/rand(25)), kamp 3 tik 601 0x71189b, kamp 6 tik 552 (tur: keeperen 0,0 → (3,3)
  handling 0x103 mod portens (4,1) 0x71), kamp 14 tik 530 (tur 1,9 → (3,2) mod (2,2)), kamp 16 tik 468 (gensidig markering: 0,6 ↔ 1,2 – originalens
  tredje vending har nul-retning, rand(360) 0x6f4975; portens markersFollow-rækkefølge i 0x6f3bf9 er ikke den samme), kamp 19 tik 790 0x6c8c9d,
  pokalkampen tik 582 0x6f4506 (rullenes loft efter en genberegning). Uden for låsetrinet: spillets 0x6e2f20 (genvalgets værdier) er stadig et skøn
  langt fra originalens (LOCKF), forholdene/tabelrækkerne/turneringsbias findes ikke i spillets data (tomme/0), og sub_6ec010 regnes ikke i kampen
  i spillet.

- 2026-11-12 – **Låsetrin, syvende runde: ALLE 20 PL-kampe (ls20) er identiske hele kampen – før 14; de seks resterende kamp 2 655→781, 3 601→768,
  6 552→762, 14 530→790, 16 468→748, 19 790→806 (i alt 14.697 → 15.734 identiske tik); pokalkampen (cup4, 72) 582→775 (hele); ny kamp med forlænget
  spilletid og straffesparkskonkurrence (pen1, turnering 352, 1311–574, 1-1 efter 120 min., 9 spark) identisk hele vejen (1.078 tik + konkurrencen,
  847.438 tal).** Alle motorens tal bruges – efter slutfløjtet er originalens næste tal kamprapportens sub_6d26b0 (0x6d30b5/0x6d317f) i alle 22.
  **Rettet (adresse):** slutvendingen 0x6f4143 sigter mod skridtets felt (lokalerne [esp+0x14]/[esp+0x12] = nx/ny), ikke den nuværende plads (gensidig
  markering flytter spilleren igen – kamp 16); boldholderens løbemål 0x6bce80 får flag 2 + (frit løb sub_6cb780 ≠ 0) (0x7122a2 – kamp 14);
  keeperens "nærmeste modstander" sub_6c3950 scannede eget hold (krogen filtrerede `side !==` – kamp 6); skuddets presserliste (sub_6bcbd0 →
  0x68d0d0/0x68cfc0) er KOPIER af spillerblokkene, så 0x705c86 "cmp edi, ebx" er aldrig sand – UNABLE_TO_SHAKE_MARKER 0x21c6 sendes aldrig (kamp 2);
  alene med keeperen trækker rand(Finishing·10) før rand(Dribbling·10) (0x711884 – kamp 3); keeperens hovedstødsdyst-grænse er 16 bit (0x6c8c8e
  movsx ecx, di – rand(−24902), kamp 19); positionstilpasningen 0x6eecb0 bruger Free Role +0x1a (posR.free var altid 1; 0x6ef00e – pokal);
  klubbens land til publikumshistorien 0x708e1f (ctx.clubLang, ikke spillernes navneliste – pokal); momentum klemmes som word (0x6f2333/
  0x6fc515/0x70a890); skuddets udfordring bruger rammens S efter 0x70224d (S − r), ikke indgangens (0x7032ec); forlænget spilletid: sub_6ce460(990)
  ved 90 min. (0x6bdc8f), HALF_TIME_EXTRA_TIME 0x20f3 ved 1155, ved 1320 sub_6ce460(1) og – med straffe – ingen FINAL_WHISTLE, uret rundet ned til
  30 tik og PENALTY_SHOOT_OUT 0x2002 (0x6ba9af–0x6baa0b); sub_6ce460(0/1) ved enhver slutfløjt (rand(7)+3, rand(7)+3, rand(5)+mål → +0xf628/+0xf62c/
  +0xf630, `endRolls`); straffekonkurrencens pres bruger spillerpostens One on Ones +0x35 (movsx – kan være negativ, 0x6be9dd).
  **Værktøjet:** `match_trace.c` glemmer fixturen ved slutfløjt uden ventende konkurrence (turneringer med genbrugte fixture-poster, fx 407, fik
  ingen M-blok); `lockstep.ts` giver `fixtureInfo` (DT/CL: fixture+0x14, club+0x57/+0x1db, +0x30, +0x4b/+0x4c, +0x38) og `needsWinner` (+0x38 & 3),
  og rapporterer originalens første ubrugte tal efter slutfløjtet. Nyt spor `pen1.txt` (+ `pen1-aimode.txt`; RECOMP_MATCH_TRACE_COMP=352, N=18, 40 dage,
  uden XE, 0,9 GB; fundet med en 40-dages skanning uden RAND – den første konkurrence er turnering 352's 18. kamp). **Spillet:** `GridMatchCtx.fixtureInfo`
  (adapteren sætter den ikke endnu). **Test:** hele kampe pl2/3/6/14/16/19 (ls20), cup (775), pen (forlænget + straffe), og for hele kampe tjekkes
  det, at originalens næste tal ligger i sub_6d26b0. **Sæsontal** (380 kampe, `grid-stats.ts`): frø 1 2,32 mål · 52/24/24 · skud 15,2 · på mål 7,9;
  frø 2 2,17 · 45/28/27; frø 3 2,44 · 48/26/27 (før 2,27–2,33 / 44–46 %; originalen 2,75–2,98 / 51–53 %) – resten er spillets inddata (Næste skridt 1).
