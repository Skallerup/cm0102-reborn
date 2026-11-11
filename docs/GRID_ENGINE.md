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
| `src/game/engine/grid/challenge.ts` | evnetabellen `sub_6eecb0`, udfordringen `sub_6c87e0`/`sub_70d690`, moral og kondition | sikkert (11/11) |
| `src/game/engine/grid/pass.ts` | afleveringen `sub_6fad40`, opsnapning `sub_6ccb60`/`sub_6f5c30`, modtagelsen `sub_6f6c00`, landingen `sub_6c9cd0`, løftet bold `sub_6fa490`, blokeringen `sub_70dfd0`, løs bold `sub_6cd770` | sikkert (11/11) |
| `src/game/engine/grid/gridMatch.ts` | limen: `runGridMatch(home, away, rand)` + `GRID_UNKNOWN` | resterende kroge *estimeret* |
| `scripts/grid-stats.ts` | en sæson (380 kampe, 3.9.60-trupperne) mod originalens tal | – |
| `tests/gridEngine.test.ts` | kampen kører færdig, deterministisk, endelige tal | – |

Portene er kopieret fra `cm-01-02-bosman-edition/app/` og kun ændret, hvor vores strenge tsconfig krævede det, plus kommentarer for rettelse 1, 3 og 6. Rettelse 1–6 er tjekket:
- straffe `rand(5v)+150`
- +2-bonussen ved ≤ 68
- tilstand 5 trækker skudpoint fra ved føring
- `sub_6cb9b0` = indlægsposition
- `sub_713e90` = fod
- +0x37 = positionstilpasning: `form` beregnes med `positionFit` (`sub_6eecb0`)

## Krogene i `GRID_UNKNOWN`

Siden 11/11 er de fleste kroge erstattet af porte (se `ENGINE_PORT_PLAN.md`): det taktiske felt og opstillingen (`tacticTable.ts`), løbemålet,
syn/plads/frit løb/offside, udfordringen og dommeren (`challenge.ts`, `cm0102-original-rules.ts`), og afleveringen, opsnapningen,
modtagelsen, landingen, den løftede bold, blokeringen og den løse bold (`pass.ts`). Tilbage som *estimeret*:

| Krog | Erstatter | Bud |
|---|---|---|
| `zonalPick` | `sub_6bc030` (afkodet) | nærmeste umarkerede modstander inden for 2 felter |
| `official29` 10 | linjevogterens +0x29 | rand(35) = 0 overser alt |
| `ref24`/`ref28`/`refDiscipline`/`ref27` 10 | dommerens officials-bytes | vi vælger ikke en dommer i laboratoriet |
| `homeAdv` 10 | hjemmebanen (ukendt i originalen) | kampværdierne ×(1 + 0,019·h) hjemme, ×(1 − 0,007·h) ude |
| `weather` 3, `byte1` 0, `nationOk` nej | match+0x4756, match+1, sub_600a50 | ukendt i laboratoriet |

**Desuden i limen (også estimeret):** mandsopdækning (`manMarkTarget` = null), markørens følg-test (`canFollow`: afstand ≤ 1,5), holdebolden
0x70ec80 (som move_to uden skridt), bolden i mål fra en aflevering/løs bold (sub_70a910/sub_70c040 → over linjen), retningen efter et skridt
uden bold, ingen udskiftninger/skader/straffesparkskonkurrence, halvleg ved 495 tik + tillægstid, sikkerhedsloft 2.000 tik.

## Sæsontal (380 kampe, Premier League 3.9.60, pr. kamp for begge hold)

| | Mål | H/U/B | Skud | På mål | Hjørner | Frispark | Offside | Gule/røde | Rigtige afl. |
|---|---|---|---|---|---|---|---|---|---|
| Originalen | 2,87 | 51/23/26 | 17,2 | 10,3 | 5,0 | ~16 | 7,4 | 1,70/0,14 | 72 % |
| Første kørsel (afleveringer uden `poss = −1`) | 0,0 | – | 0,1 | 0,0 | 0 | 3,3 | 0,1 | 2,1/0,1 | 1 % |
| Ukalibreret (efter limrettelser) | 6,53 | 50/14/36 | 39,7 | 18,3 | 5,7 | 22,1 | 3,4 | 1,51/0,08 | 52 % |
| Kalibreret, frø 1 | 5,45 | 47/18/35 | 19,6 | 9,9 | 2,3 | 19,7 | 0,8 | 1,40/0,09 | 69 % |
| Kalibreret, frø 2 | 5,36 | 47/17/36 | 19,4 | 9,9 | 2,2 | 19,4 | 0,8 | 1,32/0,07 | 69 % |
| **Runde 2 (9/11), frø 1** | **3,75** | **47/21/31** | **15,4** | **7,4** | **4,1** | **17,8** | **4,3** | **1,23/0,04** | **70 %** |
| **Runde 2 (9/11), frø 2** | **3,62** | **52/16/32** | **15,2** | **7,3** | **4,4** | **18,2** | **4,3** | **1,35/0,09** | **70 %** |

**Runde 2, trin for trin (frø 1):**

| Trin | Mål | H/U/B | Skud | På mål | Hjørner | Frispark | Offside | Skud fra D ≤ 1 |
|---|---|---|---|---|---|---|---|---|
| Før | 5,45 | 47/18/35 | 19,6 | 9,9 | 2,3 | 19,7 | 0,8 | 81 % |
| 1. Offside på alle angribere | 5,44 | 48/16/36 | 19,7 | 10,1 | 2,3 | 19,6 | 1,6 | 81 % |
| 3a. Formationen holder formen, forsvarslinje, onside-loft | 4,50 | 47/15/38 | 16,6 | 8,4 | 1,9 | 22,0 | 4,0 | 61 % |
| 2+3c. Hjørner fra afværgninger/blokeringer, udfordring før skuddet også skråt, `foulP` 0,08 | 3,50 | 44/19/37 | 13,1 | 6,5 | 2,8 | 17,0 | 4,0 | 62 % |
| 4+5. `homeAdv` 2, dommerens sikre regler, `foulP` 0,095 | 3,47 | 42/22/36 | 13,1 | 6,5 | 2,7 | 16,6 | 3,9 | 62 % |
| `homeAdv` 10, `preShotP` 0,4, hjørneandele 0,5/0,6 | 3,58 | 50/18/32 | 15,9 | 7,5 | 4,4 | 15,7 | 4,1 | 62 % |
| 3b. `runChallengeP` 0,4 (endelig) | 3,75 | 47/21/31 | 15,4 | 7,4 | 4,1 | 17,8 | 4,3 | 58 % |

Skuddenes afstand D (felter til målet, pr. kamp, frø 1): før D0 3,2 · D1 12,6 · D2 2,9 · D3 0,8; efter D0 0,8 · D1 8,0 · D2 5,4 · D3 1,1.

**Stadig for mange mål:** knap halvdelen af skuddene på mål går ind (originalen 28 %), og 57–58 % af skuddene tages fra D ≤ 1, hvor
keeperen ingen afstandsbonus har (`far()` kræver D > 2,1). Samtidig er der for få skud på mål (7,4 mod 10,3). Skudpointene S og
keeperværdien K' er sikre, så niveauet hænger på (a) hvor skuddene tages – de ukendte kroge for bevægelse og dueller – og (b) w29,
som limen sætter til boldholderens "plads" (*gættet*, Bosman 5a). Gule kort er for få (1,2–1,35), fordi kun type 42 bruges.

**Før runde 2 – det dominerende problem:** over halvdelen af skuddene på mål går ind. I originalen er det 28 %. De fleste skud
tages fra højst ét felt foran mål, hvor skudpointene er ca. 400 mod en keeperværdi K' på ca. 220.
- Skud- og keeperformlen er sikre, så fejlen er, at angriberne kommer for tæt på.
- Bag det ligger det taktiske felt, løbemålet, zonevalget, duellerne og udfordringen før skuddet. Alle er ukendte.

**De andre afvigelser før runde 2:**
- **Hjørnespark og offside:** for få. Kun modtageren kan blive dømt offside, og afbøjninger og keeperparader til hjørne er grove.
- **Hjemmebane:** ingen fordel i limen. H/U/B kommer alene fra holdstyrken.

## Kør

```
npx tsx scripts/grid-stats.ts [kampe=380] [frø=1]
GRID_JSON='{"preShotP":0.7}' npx tsx scripts/grid-stats.ts   # prøv andre bud på krogene
DEBUG=1 npx tsx scripts/grid-stats.ts 60                      # tællere (beslutninger, afleveringer, skud pr. felt, keeper)
```

En sæson tager ca. 15 sekunder.
