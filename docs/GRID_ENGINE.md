# Gittermotoren (9 × 12) – laboratorium ved siden af MatchSim

*2026-11-09, Bosman-prompten (PROMPT_FOR_CM_REBORN.md) opgave 5, med opgave 2–4 som byggesten.*
Motoren er **ikke** koblet ind i spillet. `sim.ts` og `engine/match.ts` er uændrede.

## Filer

| Fil | Indhold | Status |
|---|---|---|
| `src/game/engine/grid/loop.ts` | tik-løkken `sub_6b98c0`, rækkefølge `sub_6bd760`, rul `sub_6f44a0`, offsidelinjer, markering, spillerens tur `sub_7103e0`, bevægelse uden bold (`sub_713fc0`/`sub_714d40`), løs bold, bold ud, `sub_6fa250` | sikkert (Bosmans port) |
| `src/game/engine/grid/ballCarrier.ts` | boldholderens valg `sub_7109f0` (dødbolde, plads, pass/løb/hold/skud) | sikkert |
| `src/game/engine/grid/passOptions.ts` | afleveringsmulighederne `sub_6c6a30` (modtager, vægt, type, stil, nationsfaktor K) | sikkert |
| `src/game/engine/grid/shot.ts` | skudpoint `sub_700bd0`, keeperværdi `sub_700420`, udfald `sub_702050` | sikkert |
| `src/game/engine/grid/helpers.ts` | pres, nære modstandere, blokerende, indlægsposition, fod, keeper dækker, positionstilpasning, `sub_6ec010` | sikkert |
| `src/game/engine/grid/gridMatch.ts` | limen: `runGridMatch(home, away, rand)` + `GRID_UNKNOWN` | kroge *estimeret* |
| `scripts/grid-stats.ts` | en sæson (380 kampe, 3.9.60-trupperne) mod originalens tal | – |
| `tests/gridEngine.test.ts` | kampen kører færdig, deterministisk, endelige tal | – |

Portene er kopieret fra `cm-01-02-bosman-edition/app/` og kun ændret, hvor vores strenge tsconfig krævede det, plus kommentarer for rettelse 1, 3 og 6. Rettelse 1–6 er tjekket:
- straffe `rand(5v)+150`
- +2-bonussen ved ≤ 68
- tilstand 5 trækker skudpoint fra ved føring
- `sub_6cb9b0` = indlægsposition
- `sub_713e90` = fod
- +0x37 = positionstilpasning: `form` beregnes med `positionFit` (`sub_6eecb0`)

## Krogene i `GRID_UNKNOWN` (alle *estimeret*)

| Krog | Erstatter | Bud |
|---|---|---|
| `tacticalCell` (`shiftY`, `shiftX`, `possForward`, `defBack`) | `sub_6c2be0` + `sub_715f50` (+ `sub_6c2a40`) | formationens plads forskudt mod bolden; frem med bold, tilbage uden |
| `runTarget` | `sub_6bce80` | angribere/midtbane 1–2 rækker frem |
| `zonalPick` | `sub_6bc030` | nærmeste umarkerede modstander inden for 2 felter |
| `canSee`, `spaceAhead`, `freeRun` | `sub_6f9f90`/`sub_6cbc00`, `sub_6cbad0`, `sub_6cb780` | altid synlig (lane = antal i vejen), intet i feltet foran, forsvarer i søjlen ±1 |
| `passResult` (`passK`, `interceptP`) | `sub_6fad40` efter 0x6fae79 | fejltermerne fra `passErrorStart`, opsnapning pr. forsvarer på linjen |
| `contestP` | første berøring i `sub_6fad40` | modstander i modtagerens felt vinder bolden |
| `challenge` (`tackleP`, `foulP`) | `sub_6f09f0` fra 0x6f0e58 + `sub_6c87e0` | tackling mod dribling, frispark efter aggression |
| `preShotP`, `preShotReach` | udfordringen før skuddet (`sub_6c87e0`, SHOT.md §7) | forsvarer inden for 1 felt stopper skuddet |
| `lofted` (`crossWin`) | `sub_6fa490` + `sub_6c9cd0` / `sub_6f6c00` | indlæg: hovedstødsduel i feltet; ellers 4–7 rækker frem |
| `pickTaker` | `sub_6ceb90` | taktikkens skytter, ellers den bedste/nærmeste |
| `cardShare` | udfordringstypen i `sub_6e9820`/`sub_6ea4e0` | 11 % af frisparkene går gennem kortreglen (type 42) |
| `blockP`, `deflectP` | `sub_70dfd0` | pr. forsvarer på skudlinjen |
| `b8eaa` | match+0x8eaa | 0 |

**Desuden i limen (også estimeret):**
- Bolden rejser i `ceil(D/4)` tik.
- Offside dømmes kun på modtageren (`offsideFlag` med v = +0x107).
- Ingen udskiftninger, skader, træthed i kampen eller straffesparkskonkurrence.
- Dommerens Discipline er 10.
- Halvleg ved 495 tik + tillægstid.
- Sikkerhedsloft: 2.000 tik.

## Sæsontal (380 kampe, Premier League 3.9.60, pr. kamp for begge hold)

| | Mål | H/U/B | Skud | På mål | Hjørner | Frispark | Offside | Gule/røde | Rigtige afl. |
|---|---|---|---|---|---|---|---|---|---|
| Originalen | 2,87 | 51/23/26 | 17,2 | 10,3 | 5,0 | ~16 | 7,4 | 1,70/0,14 | 72 % |
| Første kørsel (afleveringer uden `poss = −1`) | 0,0 | – | 0,1 | 0,0 | 0 | 3,3 | 0,1 | 2,1/0,1 | 1 % |
| Ukalibreret (efter limrettelser) | 6,53 | 50/14/36 | 39,7 | 18,3 | 5,7 | 22,1 | 3,4 | 1,51/0,08 | 52 % |
| Kalibreret, frø 1 | 5,45 | 47/18/35 | 19,6 | 9,9 | 2,3 | 19,7 | 0,8 | 1,40/0,09 | 69 % |
| Kalibreret, frø 2 | 5,36 | 47/17/36 | 19,4 | 9,9 | 2,2 | 19,4 | 0,8 | 1,32/0,07 | 69 % |

**Det dominerende problem:** over halvdelen af skuddene på mål går ind. I originalen er det 28 %. De fleste skud
tages fra højst ét felt foran mål, hvor skudpointene er ca. 400 mod en keeperværdi K' på ca. 220.
- Skud- og keeperformlen er sikre, så fejlen er, at angriberne kommer for tæt på.
- Bag det ligger det taktiske felt, løbemålet, zonevalget, duellerne og udfordringen før skuddet. Alle er ukendte.

**De andre afvigelser:**
- **Hjørnespark og offside:** for få. Kun modtageren kan blive dømt offside, og afbøjninger og keeperparader til hjørne er grove.
- **Hjemmebane:** ingen fordel i limen. H/U/B kommer alene fra holdstyrken.

## Kør

```
npx tsx scripts/grid-stats.ts [kampe=380] [frø=1]
GRID_JSON='{"preShotP":0.7}' npx tsx scripts/grid-stats.ts   # prøv andre bud på krogene
DEBUG=1 npx tsx scripts/grid-stats.ts 60                      # tællere (beslutninger, afleveringer, skud pr. felt, keeper)
```

En sæson tager ca. 15 sekunder.
