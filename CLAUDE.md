# CM Reborn – projektnoter til Claude

Delt hukommelse for alle sessioner. **Opdatér denne fil (og den lokale memory) hver gang noget skydes live**,
og læg ændringen i samme push.

## Arbejdsgang
- Svar på dansk. Ejeren sender skærmbilleder fra CM 01/02 som spec (nogle gange som filer på skrivebordet).
- **Staging først:** udvikl på branchen `staging` → push → https://staging.cm0102reborn.com (Vercel Preview, kræver
  login på Vercel). Når ejeren har godkendt det på staging: merge `staging` → `main`.
- "Skyd live" = merge/push til `main`. Vercel udgiver cm0102reborn.com; GitHub Actions kører kun test og build.
- Node: `export PATH="$HOME/.local/node/bin:$PATH"`. Tjek altid `npm run build` og `npx vitest run` før push.
- Tjek `git log` ved start – der arbejdes ofte på projektet i andre sessioner.

## Arkitektur i korte træk
- React/Vite PWA i `src/`, spilmotoren i `src/game/`, Vercel-funktioner i `api/` (Upstash Redis, Vercel Blob, Resend).
  Relative imports i `api/` skal have `.js`-endelse (ESM).
- Redis oprettes altid med `makeRedis()` fra `api/_lib/redis.ts`. På staging (VERCEL_ENV=preview) får alle nøgler
  præfikset `stg:`, så staging deler databasen uden at røre produktionens data. Brug aldrig `new Redis()` direkte,
  og hverken `pipeline`/`multi`/`eval` (understøttes ikke med præfiks). Staging har sin egen `ADMIN_TOKEN` (Preview);
  login-mails, Discord og den ugentlige mail er kun sat op i produktionen.
- Alt er gratis: betaling/Stripe/supportere er fjernet (2026-11-05). `season.ts` kalder stadig `rng.chance(0.04)` for
  supporter-regens, så tilfældighederne i gamle spil er uændrede – lad det stå.
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
- 2026-11-05 – (staging) Betaling fjernet helt – alt er gratis; staging-miljø på staging.cm0102reborn.com med `stg:`-præfiks i Redis.
- 2026-11-05 – `CLAUDE.md` oprettet som delt projekthukommelse.
- 2026-11-04 – Klassisk tema med CM 01/02-skærme, baggrunde og spilindstillinger; stadionkapacitet rettet.
  Senere samme dag (andre sessioner): managermenu, Find, taktik, staff search, fællesskabets hub, 8 sprog,
  konti med skygemte spil, SEO/GA, nyt domæne, CI uden GitHub Pages.
