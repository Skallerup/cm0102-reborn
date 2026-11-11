# Port af originalens kampmotor – plan og status

*2026-11-10. Ejeren har (som Bosman Editions forfatter) tilladelse til at bruge så meget af originalens motor som muligt.
Målet er en så præcis motor som muligt. Baggrund: `ORIGINAL-ENGINE-RESEARCH.md`, byggestenene: `GRID_ENGINE.md`.*

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
