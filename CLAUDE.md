# CM Reborn – projektnoter til Claude

Delt hukommelse for alle sessioner. **Opdatér denne fil (og den lokale memory) hver gang noget skydes live**,
og læg ændringen i samme push.

## Arbejdsgang
- Svar på dansk. Ejeren sender skærmbilleder fra CM 01/02 som spec (nogle gange som filer på skrivebordet).
- "Skyd live" = commit + push til `main`. Vercel udgiver cm0102reborn.com; GitHub Actions kører kun test og build.
- Node: `export PATH="$HOME/.local/node/bin:$PATH"`. Tjek altid `npm run build` og `npx vitest run` før push.
- Tjek `git log` ved start – der arbejdes ofte på projektet i andre sessioner.

## Arkitektur i korte træk
- React/Vite PWA i `src/`, spilmotoren i `src/game/`, Vercel-funktioner i `api/` (Upstash Redis, Vercel Blob, Resend).
  Relative imports i `api/` skal have `.js`-endelse (ESM).
- Klassisk CM 01/02-tema (`data-skin='retro'`): `src/ui/classic.tsx` (hubs, faner, `CxDrop`, `CxLink`, `clubRoute`),
  `classic.css`, `classicOptions.tsx` (Game Options/Settings) og `src/ui/screens/*Classic.tsx`.
- i18n: 8 sprog. `da`/`en` ligger i hovedfilen, resten hentes ved behov. Nye tekster skal i både `en.ts` og `da.ts`
  (øvrige sprog falder tilbage til engelsk).
- Data: kildezip'er i GitHub-release'n `data-sources` (`npm run data:fetch`). Byg med
  `npx tsx scripts/build-cm-data.mts <Data-mappe> <out.json> <sæson>` → `public/data/world.json` (2026/27) og
  `world-original.json` (2001/02, 3.9.68).

## Kendte faldgruber
- `stadium.dat`: kapaciteten står på byte 60 (ikke 59) – ellers får alle klubber 120.000 pladser
  (regressionstest i `tests/stadiums.test.ts`; gemte spil rettes ved indlæsning i `game/save.ts`).
- I det klassiske tema må DOM'en ikke ændres i selve `dragstart` (Chrome afbryder trækket).
- Rullemenuer i en kolonne, der kan rulle, skal bruge `CxDrop fixed`, ellers skæres de af.

## Udgivelseslog (nyeste først)
- 2026-11-05 – Klassisk taktik: spillernes pladser kan flyttes (træk til tom plet, eller klik spiller → klik plet), som i den moderne.
- 2026-11-05 – Matchmotoren: taktik der betyder noget (svage zoner søges, dueller mand mod mand, instruktioner med pris,
  AI læser modstanderens spillere), normaliseret zonedækning, kalibreret til 2,7 mål/44 % hjemmesejre, dagsform og
  individuel aldring. Mål med `scripts/benchmark.ts` og `scripts/tactics-lab.ts` (se docs/ENGINE.md).
- 2026-11-05 – Ingen mail ved nye karrierer længere: `api/notify.ts` logger i Redis (`nc:*`), vises i admin under "New careers".
- 2026-11-05 – `CLAUDE.md` oprettet som delt projekthukommelse.
- 2026-11-04 – Klassisk tema med CM 01/02-skærme, baggrunde og spilindstillinger; stadionkapacitet rettet.
  Senere samme dag (andre sessioner): managermenu, Find, taktik, staff search, fællesskabets hub, 8 sprog,
  konti med skygemte spil, SEO/GA, nyt domæne, CI uden GitHub Pages.
