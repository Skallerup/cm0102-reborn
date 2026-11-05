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

## Elementer fra CM 01/02

Vi har studeret den originale installation (`events_eng.cfg` med 677 kampsituationer, taktikfilerne `*.pct` og tekster i `cm0102.exe`). Ud fra det har motoren fået:

- **Positioner efter boldens placering.** I originalen er en spillers position en tabel efter, hvor bolden er. Hos os glider forsvaret mod boldsiden (`defL`, én opstilling pr. boldbane). Det sker mest for spillere med godt holdspil og god placering. I angreb trækker de centrale spillere mod boldsiden, mens kantspillerne holder bredden (`attL`). Derfor kan det betale sig at skifte spillet til den anden side.
- **Banens tilstand** (`pitchFor` i `weather.ts`) følger vejr, årstid og land: fugtig, mudret, vandmættet, frossen, snedækket eller hård. Den påvirker afleveringer, driblinger, førsteberøring og træthed. **Dagens dommer** (`refereeFor`) er en navngiven dommer fra landets faste dommergruppe, hver med sin egen strenghed. Begge vises i optakten og rapporten.
- **Afgjorte kampe:** et hold der fører med 3 eller flere, slapper af, og holdet bagud giver op. Det giver færre urealistiske kæmpesejre.
- **Sen kampvilje (uafgjorte):** fra det 75. minut kæmper holdet, der er bagud med ét mål, med alt (`urgency`: +3–6 %, mest for beslutsomme hold), og føreren trækker sig nervøst. Føreren lukker højst ét trin, og der er mindre tidsspild. `scripts/draw-diag.ts` måler effekten: en føring på ét mål efter 75 minutter holdes 82 % af gangene (virkelighed ~75–80 %), og 17 % ender uafgjort (~20 %). I alt bliver 24 % af kampene uafgjort (~25 %).
- **Dommeren** er tilfældigt streng eller mild (`ref`). Det påvirker kort, filmning og protester. Der er også fordel, professionelle frispark (sidste mand ⇒ rødt), filmning (snyder dommeren eller får gult) og afviste straffesparksappeller.
- **Målmanden** griber eller slår bolden ud efter grebssikkerhed og vejr. Slår han den ud, kommer der returbolde.
- **Afslutninger** kan komme på det svage ben (tobenede spillere har ingen svaghed). Mod indgår i hovedstød og blokeringer.
- **Indlæg** er lave eller høje. Holdet vælger lave indlæg, når det taber i luften. Forsvarere kan heade eller sparke bolden i eget net (selvmål).
- **Dødbolde:** korte hjørnespark, hjørnespark til kanten af feltet, mure ved frispark og lange indkast (indkast-evnen). Spillerordren "Dødbolde" (går frem / normal / bliver hjemme) styrer, hvem der går med op. Midtstoppere og angribere går som standard frem.
- **Førsteberøring:** en fremadrettet bold skal tages ned under pres (teknik, smidighed).
- **Roller:** en *boldfordeler* får bolden oftere på midtbanen. En *target-angriber* og spillere med "Hold bolden" holder bolden op, så medspillerne kan komme frem.
- **Spillerens egne indstillinger** for afleveringer, tacklinger og pres, ellers bruges holdets. *Mænd bag bolden* som holdordre.
- **Kampens situation:** i en dobbeltkamp ser AI'en på den samlede stilling og udebanemål (`aggregate`). Et hold i front sent i kampen trækker tiden (tidsspild, og gult kort for det). Tillægstiden beregnes ud fra afbrydelserne.
- **Egenskaber der før var ubrugte:** mod, indflydelse (anføreren), beslutsomhed (et hold med vilje tager modgang bedre), pres (udeholdet i vigtige kampe), indkast og fairplay (filmning).
- **Kalibrering pr. database:** den originale 2001/02-database har bedre afsluttere og får `finish = 0,87` (`ORIGINAL_FINISH` i `sim.ts`).

`npx tsx scripts/match-stats.ts 1500` måler tal pr. kamp:

| Pr. kamp | Motor | Virkelighed |
|---|---|---|
| Frispark | ~22 | ~21 |
| Gule kort | ~3,6 | ~3,6 |
| Røde kort | ~0,16 | ~0,13 |
| Straffespark | ~0,33 | ~0,28 |
| Selvmål | ~2,5 % af målene | ~2,5 % |
| Hovedstødsmål | ~16 % af målene | ~17 % |
| Mål efter hjørnespark | ~8 % af målene | ~10 % |
| Tillægstid | ~4,7 minutter | 4–5 minutter |
| Offside | ~4 | ~4 |

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
