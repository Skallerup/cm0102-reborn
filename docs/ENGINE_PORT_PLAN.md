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
| `tacticalCell` | 0x6c2be0 + 0x715f50 + 0x6c2a40 | 359 + 136 + 112 | afkodes |
| `runTarget` | 0x6bce80 | 566 | afkodes |
| `zonalPick` | 0x6bc030 | 910 | afkodes |
| `canSee`/lane | 0x6f9f90 + 0x6cbc00 | 137 + 371 | afkodes |
| `spaceAhead`, `freeRun` | 0x6cbad0, 0x6cb780 | 89, 135 | afkodes |
| offside-udvalg/linjevogter | 0x6cfd70 → 0x6ea760 | 11 + ? | afkodes |
| `challenge` (duel/dribling/forseelse) | 0x6f09f0 | 4.489 | afkodes |
| `preShot` | 0x6c87e0 | 1.390 | afkodes |
| `passResult`/`contestP` (afleveringen) | 0x6fad40 | 6.876 | venter |
| indlæg: landing, blokering, loftet | 0x6c9cd0, 0x70dfd0, 0x6fa490, 0x6f6c00 | 1.872, 986, 678, 4.036 | venter |
| `pickTaker` | 0x6ceb90 | 832 | venter |
| dommer: tackling, kort | 0x6e9820, 0x6ea4e0 | 941, 184 | venter |
| skud (sikker, allerede porteret) | 0x702050, 0x700bd0, 0x700420 | 10.263, 1.572, 539 | ✓ |
| boldholderens valg, afleveringsmuligheder, kampværdier, rul | 0x7109f0, 0x6c6a30, 0x6ec010, 0x6f44a0 | ✓ (GRID_ENGINE.md) |
| tik-løkke, rækkefølge | 0x6b98c0, 0x6bd760 | 1.375, 61 | ✓ delvist – gennemgås mod C'en |

## Sæsontal (380 kampe, Premier League 3.9.60, pr. kamp for begge hold)

| | Mål | H/U/B | Skud | På mål | Hjørner | Frispark | Offside | Gule/røde |
|---|---|---|---|---|---|---|---|---|
| Originalen | 2,87 | 51/23/26 | 17,2 | 10,3 | 5,0 | ~16 | 7,4 | 1,70/0,14 |
| Gittermotoren før porten (10/11, frø 1) | 3,74 | 50/16/34 | 14,9 | 7,0 | 4,1 | 17,6 | 4,5 | 1,19/0,05 |

## Log

- 2026-11-10 – exe'en verificeret, rekompileret (36 indgange, 1.307 funktioner fulgt, 32 MB C), funktionerne klippet ud,
  offset-ordbog samlet, fire afkodere sat på tacticalCell, runTarget/zonalPick, syn/plads/offside og challenge/preShot.
