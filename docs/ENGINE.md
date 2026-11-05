# Matchmotoren

`src/game/engine/match.ts` er en zonebaseret event-simulation inspireret af CM3-motoren bag CM 01/02.

## Model

- **Banen** er 5 bånd (længde) × 3 baner (bredde) = 15 zoner i absolutte koordinater. Hjemmeholdet angriber mod x = 100.
- **Hver spiller** har en angrebs- og en forsvarsposition. De afledes af formationspladsen, mentalitet, bredde, presspil og individuelle instruktioner (løb fremad, fri rolle …). Spilleren dækker zonerne med en gaussisk vægt.
- **Et moment** (~240 pr. kamp): holdet med bolden vælger en boldholder i zonen. Ud fra bånd, bane og instruktioner vælges en handling: aflevering, lang bold, dribling, gennembrudsbold, indlæg eller skud.
- **Hver handling** er en duel mellem angriberens og en forsvarers sammensatte evner (fx afleveringer + beslutninger + teknik mod forudseenhed + positionering + presspil). Overtal i zonen indgår i duellen.
- **Skud** får en xG ud fra type og position (felt, distance, hovedstød, alene med målmanden, straffe, frispark) og presset i zonen. Om bolden går ind, afgøres af skytte mod målmand.
- **Kondition** falder løbende (udholdenhed, naturlig form, tempo, presspil) og sænker de effektive attributter.
- **Moral, form, hjemmebane, stabilitet og store kampe** modulerer spillernes niveau i kampen.
- **Dueller** kan give frispark, kort, straffespark og skader.

## Taktik: svagheder, modtræk og instruktioner med en pris

- **Boldholderen søger svagheder.** Ved hver aflevering frem vægtes banerne efter overtal, forsvarernes kvalitet og fartforskellen i zonen (`zoneEdge`), ganget med spillerens overblik (beslutninger, kreativitet, holdspil). En langsom back eller en tom kant bliver derfor fundet.
- **Dueller er mand mod mand.** Forsvareren i en duel er den, der står i zonen (vægtet efter position). Det er ikke automatisk holdets bedste. Små midtstoppere taber derfor luftduellerne, og indlæg bliver farlige.
- **Indlæg og gennembrud tilpasses.** Holdet slår flere indlæg, når det vinder i luften, og flere stikninger, når angriberne er hurtigere end forsvaret. Overtal på kanten giver tid til indlægget.
- **Chancekvalitet** afhænger af forholdet mellem angribere og forsvarere i zonen (aftagende værdi). En tredje midtstopper hjælper mod to angribere, men er næsten spildt mod én.
- **Backer og wingbacks der går frem**, efterlader plads bag sig på kanten.
- **Instruktioner har en pris:**
  - Kontra virker kun, når modstanderen har folk med frem (mentalitet og pres). Holdet ligger selv dybere.
  - Højt pres koster kræfter. Det kan spilles igennem, og det efterlader plads til bolde bag kæden.
  - Korte afleveringer kræver teknik og straffes af pres i egen ende.
  - Lange bolde virker med en stærk target-angriber, mod et hold der presser højt og mod en høj kæde.
- **AI-trænere** læser både modstanderens formation og spillere (`weaknessPlan` i `aitactics.ts`): langsom bagkæde, svag i luften, meget offensiv stil.
- **Dagsform:** hele holdet har en dagsform (±5 %), så favoritter også taber. Hold på uafgjort sent i kampen tager gerne det ene point.

## Kalibrering

`npx tsx scripts/benchmark.ts 2` spiller hele sæsoner i seks ligaer. `npx tsx scripts/tactics-lab.ts 1500` måler hver taktisk effekt i point pr. sæson.

| Målepunkt (topligaer, 3 sæsoner, moderne database) | Motor | Virkelighed |
|---|---|---|
| Mål pr. kamp | 2,66 | ~2,7 |
| Hjemme / uafgjort / ude | 44 / 23 / 33 % | 44 / 25 / 31 % |
| 0-0 | 8 % | ~7 % |
| Mesterens målforskel | +52 | ~+55 |
| Topscorer | 30 | ~27 |
| Favorit (top 2) bliver mester | 72 % | ~75 % |
| Rangkorrelation trup → tabel | 0,75 | ~0,75 |
| Top 3 taber til bund 5 | 14 % | ~12 % |

Den originale 2001/02-database giver cirka 2,9 mål pr. kamp.

Hver spillers zonedækning er normaliseret (`ATT_COVER`/`DEF_COVER`). Uden normaliseringen dækker en central spiller flere zoner end en kantspiller, og smalle formationer får reelt flere spillere. Formationerne ligger nu inden for få point pr. sæson af hinanden og har modtræk mod hinanden. `scripts/formation-diag.ts` viser skud og mål efter type for to formationer.

Spillernes tilbagegang begynder ved 30 år, for midtstoppere ved 31 og for målmænd ved 32. Den er individuel (`training.ts`).

## Exploit-sikring (forbedring #8)

I det originale CM 01/02 kunne visse formationer (fx 4-2-4 med pile) vinde næsten alt. Her findes ingen særregler. Formationens form afgør alene, hvor holdet har overtal i zonerne:

- Fire angribere giver tomme midtbanezoner. Modstanderen vinder derfor flere dueller og mere boldbesiddelse.
- En spiller uden for sin position får en **fit-faktor**, der sænker de effektive attributter.

`tests/engine.test.ts` sikrer, at 4-2-4 med samme trup ikke kan hente mere end 1,75 point pr. kamp mod 4-4-2. I spillet kan du selv teste din taktik under **Assistent → Taktik-benchmark**. Benchmarken kører i en Web Worker.

## Gennemsigtighed (forbedring #3)

Hver kamp gemmer:

- xG og skudkort
- momentum pr. 5 minutter
- boldbesiddelse pr. zone (heatmap)
- zonekontrol

Assistenten bruger tallene til at forklare *hvorfor* kampen gik, som den gik.
