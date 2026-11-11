# Port af originalens kampmotor – plan og status

*2026-11-10. Ejeren har (som Bosman Editions forfatter) tilladelse til at bruge så meget af originalens motor som muligt.
Målet er en så præcis motor som muligt. Baggrund: `ORIGINAL-ENGINE-RESEARCH.md`, byggestenene: `GRID_ENGINE.md`.*

## Næste skridt (overdragelse 2026-11-11 – start her i en ny session)

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

