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

Den originale 2001/02-database kalibreres mod **det originale CM 01/02** og ikke mod virkeligheden. Ejeren spillede en hel sæson 2001/02 i originalen på ferie. `scripts/original-stats.ts` læser originalens egne filer (`~/Library/Application Support/cm0102`), og Premier League-tallene er bekræftet mod originalens printede tabel. Profilen `ORIGINAL` i `sim.ts` har fire knapper: afslutning, hjemmebane, afslutterkvalitet og dæmpning af niveauforskelle. Den måles med `npx tsx scripts/original-lab.ts [sæsoner] [finish] [homeAdv] [finSlope] [squash] [squashAtt] [ease] [squashDef] [seed] [close] [closeSlope]` (0 = profilens værdi) (England aktiv, cirka 15 sekunder pr. sæson).

| Premier League (original database) | Originalen 2001/02 | Motor før | Motor nu (2 × 9 sæsoner) |
|---|---|---|---|
| Mål pr. kamp | 2,87 | 2,57 | 2,85 |
| Hjemme / uafgjort / ude | 51 / 23 / 26 % | 45 / 23 / 33 % | 51 / 25 / 24 % |
| 0-0 | 5,3 % | 8,4 % | 7,5 % |
| 1-0 / 2-1 / 2-0 / 1-1 | 14,7 / 15,5 / 15,5 / 10,3 % | 20,5 / 12,1 / 14,2 / 10,3 % | 17,1 / 15,3 / 12,2 / 10,3 % |
| Mester / sidst | 84 / 25 p | 83–87 / 20 p | 80 / 26 p |
| Topscorer | 23 | 34–42 | ~31 |
| Spredning i scorede / indladte mål (sd) | 9 / 16 | 18 / 14 | 10,9 / 11,2 |
| Gule kort / røde kort pr. kamp | 1,70 / 0,14 | 3,3 / 0,19 | 1,63 / 0,12 |
| Hjørnespark pr. kamp | 5,0 | 8,5 | 5,3 |
| Skud / på mål pr. kamp | 17,2 / 10,3 | 29 / 9,8 | 16,5 / 10,6 |

NB: før 2026-11-05 (aften) læste `original-lab.ts` tabellen fra første sæson igen hver sæson (turneringsobjektet skiftes ved
sæsonskiftet). Mester/sidst/spredning i ældre målinger er derfor fra én sæson. Rettet mål for den forrige profil: spredning
12,5 / 9,9, topscorer 33,5.

Knapperne i `ORIGINAL`:
- `finish`: afslutningsniveauet.
- `homeAdv`: hjemmebanefordelen.
- `squash`: dæmpning af niveauforskelle, med de særskilte `squashAtt` og `squashDef` (neutrale indtil videre).
- `ease`: et hold, der fører med 2+ mål, slapper af.
- `cards`: andelen af advarslerne, der gives.
- `corners`: andelen af hjørnesparkene, der gives (resten bliver målspark).
- `countBlocked: false`: blokerede skud tæller ikke som skud.
- `close` / `closeSlope`: forsvareren lukker chancen før afslutningen (bliver til erobring). Sandsynligheden afhænger kun af forsvarerens markering, placering, overblik og tackling – gode forsvar forhindrer chancer, uden at de bedste angribere får mere.
- `onTarget`: tillæg til andelen af afslutninger på mål (originalen: 60 % af skuddene på mål).
- `squashAtt: 0.45` + `finSlope: 20`: angrebene ligger tættere, og afslutterens kvalitet betyder mindre (topscoreren).

Den moderne database bruger ingen af dem.

Den vigtigste knap var `ease`. Et hold, der fører med 2 mål eller mere, slapper af gennem hele kampen, så topholdene vinder 2-0 og ikke 5-0. I originalen er der lille forskel på holdenes scorede mål og stor forskel på de indladte, fordi de gode hold vinder på forsvaret.

**Åbent:** spredningen i indladte mål er stadig for lille (11 mod 16), og topscoreren er ~31 mod 23. `close` hjalp lidt på begge spredninger, men forskellene er tæt på støjen mellem frø (mål altid med to frø, fx 2001 og 77). Mesteren ligger nu lidt lavt (80 mod 84).

Originalens kampstatistik pr. kamp (begge hold, Premier League): 17,2 skud, 10,3 på mål, 5,0 hjørnespark, cirka 16 frispark og 8,6 frispark begået, 7,4 offside, 1,70 gule og 0,14 røde kort, 72 % lykkede afleveringer og 54 % vundne tacklinger. Kun ligaerne i de lande, der vælges ved spilstart, spilles i originalen, så de andre ligaer kræver en ny ferie-sæson.

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

## Originalens regler – trin for trin (`rules: 'original'`)

Kilde: `src/game/engine/cm0102-original-rules.ts`. Reglerne er læst fra `cm0102.exe` 3.9.68 og Mac-oversættelsen `cm0102_recomp`, og hver regel har adressen på originalens funktion. Reglerne indføres én ad gangen bag motorens valg `rules` (`'current'` er standard). Hvert trin måles mod originalens egen Premier League-sæson 2001/02. Tal, der ikke kommer fra originalen, er markeret som skønnede.

### Trin 0 – baseline (2026-11-05, før ændringer)

| Måling | Originalen | Original database (frø 2001 / 77) | Moderne database |
|---|---|---|---|
| Mål pr. kamp (9 sæsoner PL) | 2,87 | 2,87 / 2,83 | 2,67 (benchmark, topligaer) |
| Hjemme / uafgjort / ude | 51 / 23 / 26 % | 52 / 24 / 24 – 51 / 25 / 25 % | 44 / 24 / 32 % |
| 0-0 | 5,3 % | 7,1 / 7,8 % | 8,5 % |
| Mester / sidst (point) | 84 / 25 | 78 / 28 – 82 / 24 | PL 76 / 24 |
| Topscorer | 23 | 31,2 / 30,8 | 29 (snit) |
| Spredning scorede / indladte (sd) | 9 / 16 | 9,8 / 11,5 – 11,9 / 10,8 | – |
| Skud / på mål pr. kamp (match-stats, 1500) | 17,2 / 10,3 | 16,5 / 10,6 | 27,8 / 9,7 |
| Hjørnespark / offside | 5,0 / 7,4 | 5,3 / 4,3 | 8,2 / 3,9 |
| Gule / røde | 1,70 / 0,14 | 1,63 / 0,12 | 3,49 / 0,17 |
| Tillægstid efter 90' | – | 4,3 min | 4,4 min |
| Uafgjort / ét måls føring holdt efter 75' (draw-diag) | – | – | 24,4 % / 82 % |

Taktik-laboratoriet (1500 kampe) har samme udslag som før, fx at bytte angriber og midtstopper koster −0,50 point pr. kamp og at bytte målmand og angriber koster −0,89.

### Trin 1 – valg og test

- `rules?: 'current' | 'original'` i `EngineOptions` (match.ts) og i `prepareMatch` (sim.ts). Standard er `'current'`, så motoren er uændret.
- `tests/original-rules.test.ts` tjekker regelfilen med de samme påstande som `check.ts`.

### Trin 2 – karakterer (regel 1; begge databaser)

Kilde: sub_6eaea0, _f_006eada0, sub_702050, sub_6ea4e0 og sub_6ce460.

- Start: 6,1 for startelleveren og 6,4 for indskiftere. Før var det 6,2 for alle.
- Mål: +0,65 (før +1,0). Assist: +0,275 (før +0,5).
- Redning: +0,35, stor redning +0,60. Før var det 0,22 + 0,8 × xG.
- Frispark uden kort: −0,025 (før −0,05). Et kort erstatter frisparkets fradrag.
- Gult kort: −0,225, efter 45' ganget med 45/minut (før −0,3).
- Rødt kort: −1,0, og −0,75 for et professionelt frispark (før −1,5).
- Korte indhop trækkes mod deres egen startværdi.
- Motorens egne små plusser og minusser (afleveringer, tacklinger, dueller) og tillæggene ved slutfløjt (resultat ±0,25, holdt nullet +0,35) er bevaret. Originalens tal for dem er ikke kendt.
- Computerens udskiftning ved lav karakter: tærsklen følger starten (`RATING.start − 0,1` = 6,0). Før var den 6,1 med start 6,2.

| `scripts/ratings-diag.ts`, 1000 kampe | Før (original / moderne) | Efter (original / moderne) |
|---|---|---|
| Snitkarakter | 6,60 / 6,54 | 6,53 / 6,50 |
| Målmænd | 7,13 / 7,13 | 7,26 / 7,31 |
| Målscorere | 7,70 / 7,65 | 7,24 / 7,24 |
| Indskiftere | 6,22 / 6,21 | 6,41 / 6,41 |
| Kampens spiller scorede | 60,7 / 55,7 % | 33,4 / 28,8 % |

Original-lab med 9 sæsoner:

| Frø | Mål før → efter | Topscorer før → efter |
|---|---|---|
| 2001 | 2,87 → 2,79 | 31,2 → 33,2 |
| 77 | 2,83 → 2,82 | 30,8 → 36,8 |
| 5 | 2,96 → 2,94 | 33,1 → 31,3 |
| 11 | 2,90 → 2,75 | 34,0 → 29,7 |

Topscorerens udsving er støj (±3), og der er ingen systematisk retning. Moderne benchmark: 2,68 mål, 43,5 / 24,2 / 32,3 %, topscorer 27 (før 28,8).

### Trin 3 – dommeren (regel 2; begge databaser, 2026-11-06)

Kilde: sub_6e9820 og officials.dat (43 bytes pr. post: navne-id 4/8, nation byte 22, omdømme 26, Discipline 0x25, 0x27).

- Kampene dømmes af hjemmelandets rigtige dommere fra databasen (fx Paul Alcock, Graham Barber i 2001/02). Topligaerne får
  de 20 mest anerkendte (omdømme, byte 26 – *estimeret* tolkning), de lavere rækker hele landets liste.
- Strenghed F = Discipline > 10 ? D × 0,1 : 1 + (D − 10) × 0,05; D = 0 (ikke vurderet, 80 % af posterne) behandles som 10
  (`refereeFactor` i cm0102-original-rules.ts). Byte 0x27 gemmes i `referee.limit` til trin 4.
- Ingen dommere i databasen (ældre gemte spil, draft): motorens tilfældige strenghed som før.
- ORIGINAL-profilens `cards` 0,47 → 0,44, så de gule kort holder originalens niveau med de nye dommere.

| `scripts/match-stats.ts`, 3000 kampe | Før | Rigtige dommere | + cards 0,44 |
|---|---|---|---|
| Original: gule / røde pr. kamp | 1,69 / 0,11 | 1,80 / 0,11 | 1,71 / 0,11 (orig 1,70 / 0,14) |
| Original: dommernes strenghed i snit | ~1,0 (tilfældig) | 1,08 | 1,08 |
| Moderne: gule / røde pr. kamp | 3,43 / 0,18 | 3,51 / 0,19 | – (mål ~3,6) |

### Trin 4 – frispark og kort (regel 3-4; kun den originale database, 2026-11-06)

Kilde: sub_6e9820 (alvorlighed) og sub_6ea4e0 (kort), `cardSeverity`/`cardFor` i cm0102-original-rules.ts.

- ORIGINAL-profilen kører nu med `rules: 'original'`: kortet afgøres af originalens formel (alvorlighed = rand(spillerens
  frispark + a) + b + dommerens skævhed fra Discipline, mildere for en advaret spiller og før 10'; rødt hvis > rand(15) + 7,
  gult hvis > rand(6)). Aggression/Dirtiness påvirker kun, hvor ofte der begås frispark – ikke kortet.
- *Estimeret* oversættelse af tacklingstyper: almindelig = 42; 3 % af frisparkene (30 % ved instruksen "hårde tacklinger")
  er type 44, heraf 8 % type 48. *Estimeret/kalibreret*: kun 11 % af frisparkene er af en type, der kan give kort
  (`ORIGINAL.cards` = 0,11 – betyder nu andelen, ikke en reduktion).
- Den moderne database bruger stadig den nuværende kortregel.

| `scripts/match-stats.ts`, 2000 kampe, original DB | Før (trin 3) | Efter |
|---|---|---|
| Gule / røde pr. kamp | 1,71 / 0,11 | 1,72 / 0,15 (orig 1,70 / 0,14) |
| Frispark pr. kamp | 21,7 | 21,7 |


### Trin 5 – tillægstid (regel 5; kun den originale database, 2026-11-06)

Kilde: _f_006b98c0 ved 0x6b9f5f (`deadBall`/`addedMinutes`).

- Hver død bold i 2. halvleg giver rand(trunc(0,8 × rand(10))) tik; tillægstiden = ceil(tik / 11) minutter.
- Vores døde bolde: frispark, hjørnespark, offside, afslutninger forbi/over, mål (×2), kort (rødt ×2) og udskiftninger.
  Originalen har flere afbrydelser (indkast, målspark efter redninger …), så antallet ganges med `DEAD_BALL_K` = 1,55
  (*estimeret*, kalibreret).
- Den moderne database beholder den nuværende tillægstid.

| `scripts/match-stats.ts`, 3000 kampe, original DB | Før | Efter |
|---|---|---|
| Tillægstid efter 90' | ~4,7 (faste tillæg) | 4,65 (originalens regel) |
| Mål / gule / røde pr. kamp | 2,98 / 1,72 / 0,15 | 3,04 / 1,74 / 0,14 |


### Trin 6 – træthed (regel 6; kun den originale database, 2026-11-06)

Kilde: sub_6f56c0 (`staminaFactor`/`fatigueDrain`). Stamina-leddet i motorens træthed følger originalens form
200 − 8,5 × (0,65 × Stamina + aldersled) (under 20: 6,75 · 20-23: 7,25 · 24-29: 7,5 · 30-33: 7,0 · 34+: 5,75), normeret
til samme niveau som før for en typisk professionel (Stamina 14, 26 år – *estimeret* reference). Motorens øvrige led
(tempo, pres, arbejdsrate, vejr) er uændrede.

| `scripts/match-stats.ts`, 2000 kampe, original DB | Før | Efter |
|---|---|---|
| Kondition ved slutfløjt (spillet hele kampen) | 74,1 % | 78,7 % |
| Udskiftninger pr. hold | 2,20 | 2,48 |
| Mål pr. kamp | 3,06 | 3,02 |


### Trin 7 – pausen (regel 7; kun den originale database, 2026-11-06) + genkalibrering

Kilde: sub_6f5810 (`halfTimeRecovery`): kondition += (Natural Fitness + 15) × 10 af 10000 (1,6-3,5 %) i stedet for faste 4 %.
Aldersfaktoren er ikke kendt og udelades.

Trin 3-7 løftede tilsammen målene i den originale database (sæson: 3,01-3,11). `ORIGINAL.finish` 1,4 → 1,33 bringer dem tilbage.

| `scripts/original-lab.ts`, 2 sæsoner | Frø 2001 | Frø 77 | Originalen |
|---|---|---|---|
| Mål pr. kamp før / efter genkalibrering | 3,11 / 2,88 | 3,01 / 2,84 | 2,87 |
| H/U/B efter | 55,4 / 19,3 / 25,3 | 51,2 / 22,2 / 26,6 | 51,1 / 22,6 / 26,3 |
| Mester / sidst (point) efter | 86,0 / 27,5 | 79,5 / 24,0 | 84 / 25 |
| Topscorer efter | 33,5 | 30,0 | 23 |

`scripts/match-stats.ts` (2000 kampe): kondition ved slutfløjt 77,9 %, 2,73 udskiftninger pr. hold.


### Trin 8 – knocks (regel 8; kun den originale database, 2026-11-06)

Kilde: sub_6cfe10/sub_6d0980 (`knock`, `knockSeverity`, `knockAllowed`). I stedet for en fast skadeschance pr. frispark
tjekkes knocks for alle spillere hvert moment (originalen: hvert bevægelsestrin – vores moment svarer til `KNOCK_K` = 1,4
tjek, *estimeret*/kalibreret til samme skadesniveau som før) og efter frispark. Risiko = 4 (6 med skade) × 10000 /
(0,5 × kondition + 5000) × skadesudsathed/10. Alvorlighed > 50 = skade; ellers koster knocken kondition, og spilleren må
ud under 50 % eller 71 % + 0,25 % × skadesudsathed (AI-hold skifter ud). Efter 6 tvungne udskiftninger ingen flere knocks.

| `scripts/match-stats.ts`, 2000 kampe, original DB | Før | Efter |
|---|---|---|
| Skader pr. kamp | 0,31 | 0,30 |
| Udskiftninger pr. hold | 2,70 | 2,92 |
| Mål pr. kamp | 3,02 | 2,95 |


### Trin 9 – computerens udskiftninger (regel 9; kun den originale database, 2026-11-06)

Kilde: sub_6c54a0/sub_6e0fe0. AI-holdet overvejer et skift, når minuttet > 10 + rand(50) (nyt slag hver gang) og mere end
5 minutter efter sidste skift; kandidaterne sorteres stigende efter int(karakter × 1000 + kondition). Det endelige valg
(sub_6e2000) kendes ikke, så motorens egen regel (kondition < 72 % eller karakter < 6,0) afgør det. Taktikskift har en
15-minutters spærre. Ny kommentar "knackered" (event 655), når en markspiller er under 67,5 % efter 60' – kun en linje.

| `scripts/match-stats.ts`, 2000 kampe, original DB, 3 udskiftninger (2001-regler) | Efter |
|---|---|
| Udskiftninger pr. hold | 2,58 |
| Kondition ved slutfløjt / skader pr. kamp | 77,8 % / 0,32 |
| Mål pr. kamp | 2,86 |


### Trin 10 – 3.9.60, dæmpning og offside (kun den originale database, 2026-11-08)

Databasen er nu 3.9.60 (den, originalen selv bruger til 2001/02). Originalens skudresultat (regel 10) kan ikke indføres 1:1
(blandingen af egenskaber i skudscoren sub_700bd0 og målmandens w-led kendes ikke), og en højere `finSlope` (afslutteren
betyder mindre) flyttede intet ud over støjen. I stedet er niveauforskellene dæmpet mere (`squash` 0,58 → 0,45, `squashAtt`
0,45 → 0,35, `squashDef` 0,58 → 0,62, `finish` 1,27 → 1,62) og offside-fælden fanger oftere (`offside` 1,8, *estimeret*,
originalen: 7,4 pr. kamp). Taktikvægtene (regel 12) er ikke indført: originalens tillæg (−1000/+1000 osv.) lægges til
basisvægte, der ikke kendes.

| `scripts/original-lab.ts`, 3 sæsoner × frø 2001/77 | Originalen | Før | Efter |
|---|---|---|---|
| Mål pr. kamp | 2,87 | 2,68 | 2,76 |
| Hjemme / uafgjort / ude | 51 / 23 / 26 % | 53 / 22 / 25 | 52 / 23 / 25 |
| Mester / sidst (point) | 84 / 25 | 87 / 20,5 | 86,7 / 22,5 |
| Topscorer | 23 | 33,7 | 31,7 |
| Spredning scorede mål (sd) | 9 | 13,0 | 12,2 |
| Offside / gule / røde pr. kamp (match-stats, 2000) | 7,4 / 1,70 / 0,14 | 4,2 / 1,7 / 0,13 | 7,2 / 1,72 / 0,13 |

Tilbage: topscoreren (afhænger af boldholderens valg, sub_7109f0 – ukendt) og spredningen i indladte mål (originalen 16).
