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
| `runTarget` | 0x6bce80 | 566 | afkodet (notes/6bce80-run-target.md) |
| `zonalPick` | 0x6bc030 | 910 | afkodet (notes/6bc030-zonal-pick.md) – kræver kampstatistik pr. spiller, rå Dribbling, mandsopdækning |
| `canSee`/lane | 0x6f9f90 + 0x6cbc00 | 137 + 371 | afkodet (notes/vision-space-offside.md §6) – klar til port |
| `spaceAhead`, `freeRun` | 0x6cbad0, 0x6cb780 | 89, 135 | afkodet – `freeRun` giver aldrig 1 for markspillere (egen løkke tæller spilleren selv) |
| offside-udvalg/linjevogter | 0x6cfd70 → 0x6ea760 | 11 + 184 | afkodet – rækkereglerne = `offsideFlag`; også ved skud (skytten som `excl`) |
| `challenge` (duel/dribling/forseelse) | 0x6f09f0 | 4.489 | afkodes |
| `preShot` | 0x6c87e0 | 1.390 | afkodes |
| `passResult`/`contestP` (afleveringen) | 0x6fad40 | 6.876 | venter |
| indlæg: landing, blokering, loftet, modtagelse | 0x6c9cd0, 0x70dfd0, 0x6fa490, 0x6f6c00 | 1.872, 986, 678, 4.036 | afkodet (notes/crosses-blocks.md) – afbøjning findes ikke i 3.9.68 |
| `pickTaker` | 0x6ceb90 | 832 | afkodet (notes/referee-taker.md) |
| dommer: tackling, kort | 0x6e9820, 0x6ea4e0 | 941, 184 | afkodet – `FOUL_FK_CAP` er et gulv, `cardFor(professional)` er vendt om |
| taktikkens positionstabel | 0x5b5d10 (loader) + 0x5b7160 | 862 + 173 | afkodet (notes/5b7160-tactic-table.md); tabellerne for de 40 `.pct`-filer i `notes/pct-tables.json` |
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
