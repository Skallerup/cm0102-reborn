# Championship Manager 01/02 – Reborn ⚽

En moderne genopførelse af det legendariske managerspil **Championship Manager: Season 01/02**. Spillet kører i browseren som PWA og virker derfor også offline og på iPad/mobil. Databasen har **20.000+ rigtige spillere fra sæsonen 2025/26**.

> Uofficiel fan-hyldest. Indeholder hverken kode, data eller grafik fra det originale spil (© Sports Interactive / Eidos).

**Spil det her:** https://skallerup.github.io/cm0102-reborn/

## Features

Alt det, vi husker fra CM 01/02:

- **Rigtige spillere og klubber:** 38 ligaer, 662 klubber, 20.492 spillere. Alle 33 førstedivisioner fra datasættet er med, plus 2. divisioner i England, Danmark, Tyskland, Italien, Spanien og Frankrig
- **CM 01/02-attributter:** 1–20-skala med tekniske, mentale, fysiske og målmandsattributter. Dertil skjulte attributter (CA/PA, Consistency, Important Matches, Injury Proneness …) og positionsratings (GK/SW/D/DM/M/AM/F/WB + højre/venstre/central)
- **Tekstkommentar** linje for linje i valgfri hastighed. Mål blinker, og du kan følge vidiprinteren med de andre kampe
- **Taktik:** 12 formationer og drag-and-drop på banen. Holdinstruktioner (mentalitet, afleveringer, tempo, bredde, presspil, tacklinger, markering, offsidefælde, kontra), individuelle instruktioner og dødboldsskytter
- **Udskiftninger og taktikændringer** midt i kampen
- **Turneringer:** ligaer med op-/nedrykning, split-format (Superligaen, Skotland, Østrig), playoffs (Championship, Serie B, LaLiga 2, Bundesliga-relegation), nationale pokalturneringer, **Champions League** (gruppespil + knockout) og **UEFA Cup**. Udebanemål, forlænget spilletid og straffesparkskonkurrence er med
- **Transfers:** bud, modbud, "ikke til salg", kontraktforhandling, lejeaftaler, fri transfers, **Bosman-aftaler**, transferliste og ophævelse af kontrakter
- **Træning:** træningsprogrammer pr. spiller. Udviklingen afhænger af alder, potentiale, trænere, faciliteter, spilletid og spillerens vilje/professionalisme
- **Bestyrelse:** forventninger, tillid, advarsler, fyring og budgetanmodninger
- **Jobmarked:** AI-managere fyres og ansættes, og du får jobtilbud eller kan søge ledige stillinger
- **Staff:** assistent, trænere, fysioterapeuter og scouts. Ansættelse og fyring
- **Økonomi:** billetindtægter, TV-penge, sponsorer, præmiepenge, lønbudget og transferbudget
- **Ungdom og regens:** årlig ungdomsårgang med sjældne wonderkids. Spillerne går på pension
- **Historik:** mestre, topscorere, årets spiller, årets talent, trofæskab og managerkarriere
- **Gem/indlæs** i browseren (IndexedDB) og **eksport/import** af save-filer mellem enheder

## De 10 forbedringsforslag

Før byggeriet blev der stillet 10 forslag til forbedringer. De 8 valgte er implementeret:

| # | Forbedring | Status |
|---|---|---|
| 1 | To databaser (moderne + importer til ægte CM 01/02-data) | ⏸️ Ikke valgt |
| 2 | **Browser/PWA**: offline, iPad/mobil, gemmer lokalt | ✅ |
| 3 | **Gennemsigtig matchmotor**: xG, momentum-graf, zone-heatmap, skudkort og assistentens dom over kampen | ✅ |
| 4 | **Assistent-analyse**: modstanderrapport med vinderchancer (Monte Carlo), holdforslag, radar-sammenligning | ✅ |
| 5 | **Scouting med usikkerhed**: attributter vises som intervaller (fx 11–15), der indsnævres med scouting | ✅ |
| 6 | Moderne regler som valgfrit (5 udskiftninger, ny CL-ligafase) | ⏸️ Ikke valgt – klassiske 2001-regler |
| 7 | **Smartere AI-klubber**: behovsanalyse pr. position, budget- og omdømmestyrede køb | ✅ |
| 8 | **Exploit-sikret motor + taktik-benchmark** i en Web Worker | ✅ |
| 9 | **Hurtig simulering**: "Næste kamp", ferie til dato, spring kamp over | ✅ |
| 10 | **Challenges + dansk/engelsk + delbar seed** | ✅ |

## Spillerdatabasen

Data kommer fra **[dcaribou/transfermarkt-datasets](https://github.com/dcaribou/transfermarkt-datasets)** (CC0 / public domain). Transfermarkt har ingen 1–20-attributter, så de beregnes deterministisk i `src/game/data/generate.ts`:

- **Current Ability** ← markedsværdi (log-skala) korrigeret for alder
- **Potential Ability** ← alder + tilfældighed (med sjældne wonderkids)
- **Attributprofil** ← position (målmand, stopper, back, kant, angriber …) vægtet efter rollen
- **Finjustering** ← mål/90 og assists/90 (afslutning, kreativitet), kort (aggression, snavsethed), højde (hovedstød, spring), fod og landskampe

Opdatér databasen med `npm run data`. Kommandoen henter de nyeste CSV-filer og skriver `public/data/world.json`.

## Kom i gang

```bash
npm install
npm run dev        # http://localhost:5173/cm0102-reborn/ (på Vercel bruges roden /)
npm test           # motorkalibrering, exploit-test, kampprogram, scouting
npm run build
```

Værktøjer:

```bash
npx tsx scripts/calibrate.ts 2000 GB1        # kalibrér motoren mod rigtige statistikker
npx tsx scripts/simulate-season.ts 1 190     # simulér en hel sæson headless (FC København)
node scripts/smoke.mjs                       # end-to-end-test i browser (kræver npm run dev)
```

## Arkitektur

```
scripts/build-data.py     Transfermarkt CSV → public/data/world.json
src/game/                 Ren TypeScript-spilmotor (ingen UI-afhængigheder)
  engine/match.ts         Zonebaseret matchmotor (CM3-inspireret)
  competitions.ts         Kalender, ligaer, split, pokaler, CL/UEFA, playoffs
  transfers.ts            Bud, kontrakter, Bosman, AI-transfermarked
  training.ts             Udvikling og træning
  season.ts               Sæsonskifte, priser, op/nedrykning, regens
  sim.ts                  Dag-for-dag-løkke
  analysis.ts             Assistent og kampanalyse
src/worker/               Web Worker til taktik-benchmark
src/ui/                   React-brugerflade (CM 01/02-inspireret)
src/i18n/                 Dansk og engelsk
```

Læs mere i [docs/RESEARCH.md](docs/RESEARCH.md) (research om originalspillet) og [docs/ENGINE.md](docs/ENGINE.md) (matchmotoren).

## Licens

Koden er MIT-licenseret. Spillerdata er CC0 (transfermarkt-datasets). "Championship Manager" er et varemærke tilhørende dets ejere, og projektet er ikke tilknyttet dem.
