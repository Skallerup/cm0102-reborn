# CM Reborn – projektnoter til Claude

Delt hukommelse for alle sessioner – hold den KORT (den indlæses i hver session og hos hver agent). **Ved hver udgivelse: tilføj en linje
øverst i `docs/RELEASE_LOG.md`** (udgivelsesloggen; søg dér efter tidligere beslutninger, moduler og adresser) i samme push. Her står kun
regler, arkitektur og faldgruber.

## Arbejdsgang
- Svar på dansk. Ejeren sender skærmbilleder fra CM 01/02 som spec (nogle gange som filer på skrivebordet).
- **Staging først:** udvikl på branchen `staging` → push → https://staging.cm0102reborn.com (Vercel Preview, kræver
  login på Vercel). Når ejeren har godkendt det på staging: merge `staging` → `main`.
- **Udgivelse (fra 16/11 eftermiddag, ejerens ønske): staging er sat på pause.** Der arbejdes direkte på `main` – push til `main` =
  live (Vercel udgiver cm0102reborn.com med det samme). Lokalt før push: `npx tsc --noEmit -p tsconfig.app.json` + de berørte
  testfiler (+ én e2e ved UI-ændringer). `.github/workflows/ci.yml` kører hele testpakken efter hvert push til main som kontrol –
  tjek `gh run list -w ci.yml`, og ret med det samme, hvis den fejler. (`release.yml` staging → main bruges igen, når staging genoptages.)
- Redis oprettes altid med `makeRedis()` fra `api/_lib/redis.ts`. På staging (VERCEL_ENV=preview) får alle nøgler
  præfikset `stg:`, så staging deler databasen uden at røre produktionens data. Brug aldrig `new Redis()` direkte,
  og hverken `pipeline`/`multi`/`eval` (understøttes ikke med præfiks). Staging har sin egen `ADMIN_TOKEN` (Preview);
  login-mails, Discord og den ugentlige mail er kun sat op i produktionen.
- **1:1-reglen:** det klassiske spil skal være 1:1 med CM 01/02 (plan: docs/ORIGINAL_PARITY.md). Eneste undtagelse er menuen
  Game Options: CM Reborns egne tilføjelser (features, konto, fællesskab, senere støtte/køb af pakker) ligger dér, adskilt fra
  originalens punkter – aldrig på originalens skærme.
- Alt er gratis: betaling/Stripe/supportere er fjernet (2026-11-05). `season.ts` kalder stadig `rng.chance(0.04)` for
  supporter-regens, så tilfældighederne i gamle spil er uændrede – lad det stå.
- Node (Mac mini fra 17/11): `export PATH="$HOME/.local/share/node/bin:$PATH"` (Node 24). Før push: `npx tsc --noEmit -p tsconfig.app.json` og de berørte testfiler; CI tager resten.
- **Kun de berørte tests:** `npx vitest related --run --dir tests <ændrede filer>` (finder testene, der importerer filerne) – aldrig hele pakken lokalt.
  Agenter kører ikke e2e; den kører én gang ved udgivelsen.
- **Uafbrudt arbejde (ejerens ønske 17/11):** når en agent melder færdig – udgiv den og start straks næste opgave fra køen "Vejen til mål" i docs/ORIGINAL_PARITY.md (og agenternes forslag i ~/cm0102-engine/notes/*-plan.md). Hold 3–5 agenter i gang inden for RAM-reglen; stop kun, hvis ejeren siger stop.
- **Beslutninger (ejerens ønske 17/11):** spørg ikke ejeren – vælg selv den anbefalede løsning, når den er tro mod 1:1-målet, og nævn kort valget i rapporten. Spørg kun ved irreversible/udadvendte ting uden for normal udgivelse.
- **Agenttyper** (`.claude/agents/`): `port` (Opus – exe-kode/motor), `ui` (Sonnet – skærme/tekster/tests), `maaling` (Sonnet – bisect/målinger). De faste regler (RAM, measure.mjs, NOTES.md i worktree'en, ingen polling, rapportformat) står i filerne – gentag dem ikke i opgaven.
- **Udgivelse af en agents arbejde:** `scripts/ship.sh <worktree-gren|commit> "<da-linje>" "<en-linje>" [--new-game]` – cherry-picker, lægger
  ændringslogslinjen i dagens version (ny version pr. dag), typetjekker, kører de berørte tests + K3/K5/ændringslog, én e2e, committer, pusher og
  rydder worktree'en. `--no-e2e` kun ved ren motor/data uden UI. Stopper ved første fejl uden at pushe.
- **Dag for dag mod originalen (vigtigste værktøj):** `scripts/cm-day-lockstep.ts` (WORLD = world bygget med CM_DBSIZE=2, REPORT=fil.md, STEP=7 = ugentligt) sammenligner hver dag 14/7-01 → 30/6-02 med oraklets dagsbilleder (`~/cm0102-engine/oracle/daysnap/s1-3.9.60-e1`, `scripts/oracle-day-snaps.py`, nyheder `scripts/oracle-news.ts`); første afvigelse pr. felt + ejer = én opgave.
- **Find det hurtigt:** `npx tsx scripts/where.ts <0xadresse|emne>` viser porten i src/, noterne/C-filen i ~/cm0102-engine, tests, scripts og
  udgivelsesloggen på én gang – brug den før grep-rundture. Flere ord = alle skal matche.
- **Orakelkørsler:** `npx tsx scripts/oracle-catalog.ts [ord|--json]` – katalog `~/cm0102-engine/oracle/CATALOG.md` (frø, datoer, målinger, størrelse
  pr. kørsel/udtræk); slå op dér før en ny orakelkørsel (≈4 min + 200 MB–1 GB).
- **Snapshots (IKKE klar):** `scripts/lib/snapshot.ts` + `scripts/snap-check.ts` gemmer GameState, men en kørsel fra snapshot er IKKE bit-identisk med
  fra bunden (modulhukommelse uden for GameState: staleSev, lastDiv, WeakMap-caches …) – brug ikke til målinger; ingen `--snap` i soak/grid-season.
- `npm run e2e` (scripts/e2e.mjs) klikker igennem klassisk og moderne udseende i Chromium: alle hovedskærme, taktik
  (byt, flyt pladser, instruktioner, skift udseende) og en hel kamp. Kører også i CI. Nye skærme/knapper: udvid testen.
- Ejeren spiller originalen lokalt ("CM 01-02 Bosman Edition.app"). Claude kan selv tage billeder af vinduet med
  `screencapture -x -o -l <vindues-id>` (id via Swift `CGWindowListCopyWindowInfo`), også når det ligger bagved.
  Og styre det: `swiftc -O scripts/cmctl.swift -o <scratchpad>/cmctl`, så `cmctl shot f.png`, `cmctl click x y` (pixels i
  billedet, 2560×1664), `rclick`, `dclick`, `drag`, `key return|escape|…`, `type tekst`. Cursor har Tilgængelighed (7/11).
  Klik flytter ejerens mus og lægger spillet forrest – spørg før lange rundture, og spil ikke videre i hans karriere uden lov.
- Spillernes ændringslog: `src/ui/changelogData.ts` (da+en, nyeste først) – tilføj punkter ved hver udgivelse, der kan
  mærkes i spillet, og hæv versionen i `package.json`/`package-lock.json` ved en ny version (ny version pr. udgivelsesdag – ellers ses
  ændringerne ikke som nye i spillet). Kræver noget et nyt spil, så skriv det i en "⚠ Kræver et nyt spil"-linje øverst i versionen (testet i tests/changelog.test.ts).
- Langtidstest: `npx tsx scripts/soak.ts <sæsoner> <world-fil> [klub]` (motorens invarianter pr. sæson),
  `npx tsx scripts/features.ts <world-fil> [klub]` (20 funktioner gennem actions) og `node scripts/e2e-soak.mjs <modern|original>
  <moderne|klassisk> [sæsoner] [klub]` (5 sæsoner i browseren, alle skærme). Ret IKKE i `src/` mens e2e-soak kører (Vite
  genindlæser siden). Kør dem før større udgivelser.
- **Målinger (regler fra 17/11, ejerens ønske – spar tid):** (1) billigste kontrol først: lockstep/fingeraftryk med fast frø
  (`grid-lockstep.ts`, `grid-stats.ts 60 1`, tests) – er uddata bit for bit som før ændringen, kan sæsontallene ikke have flyttet sig,
  og en hel sæson er spild; (2) alle tunge målinger (sæsoner, soak, oraklet, bisect) går gennem `node scripts/measure.mjs [--oracle]
  -- <kommando>`: samme kommando på samme kode (også i andre worktrees) køres kun én gang (gemt i `~/.cache/cm-measure`, `--list`/
  `--show`), og tunge målinger står i kø – 2 ad gangen, 3 når Chrome er lukket og ≥ 6 GB er ledigt (`scripts/ram-budget.mjs`; `MEASURE_SLOTS` overstyrer; vitest lokalt 3 workers, 5 uden Chrome); (3) oraklets tal med fast frø ændrer sig aldrig:
  kør dem med `--oracle`, så måles de kun én gang; (4) mål kort, hvor det er nok: mål/kamp = halv sæson × 2 frø, hel sæson/flere
  sæsoner kun for økonomi, kontrakter og udvikling over tid; `--light` kun til målinger under 1 min.
- SEO: `scripts/build-seo.ts` (kører i `prebuild` – også på Vercel; outputtet er i .gitignore) laver guiderne (`pages`) og
  via `scripts/seo/db.ts` databasesiderne `/cm-01-02/` og `/2026-27/` (spillere/klubber/ligaer/lande/lister/A-Z + search.json),
  fælles skabelon `scripts/seo/layout.ts` (+ public/seo.css), sitemap-indeks `sitemap.xml` → `sitemap-<gruppe>.xml`, `llms.txt`.
  Hvem der får en spillerside: `keep` i build-seo.ts (~13k sider, ~190 MB HTML). `CONTENT_DATE` = lastmod – hæv ved mærkbare
  ændringer. Url'erne skal være stabile (navn → slug; dubletter + klub). Nye stier: SW `globIgnores` + `navigateFallbackDenylist`.
- Den originale database og den moderne må ikke dele økonomi: alt 2001-specifikt ligger bag `g.econ` (kun original).
- Prisniveau: `src/game/econ.ts`. Nye spil med den originale database får `GameState.econ` (faktor pr. liga, målt i
  newgame.ts) – faste beløb ganges med `econ(liga)`, og `valueFromCA` bruger originalens værdikurve. Nye faste beløb
  i økonomien skal ganges med `econ(...)`. Mål med `scripts/econ-run.ts`.
- 1:1-kontroller i CI (docs/ORIGINAL_PARITY.md): `tests/textParity.test.ts` (K3 – engelske tekster mod exe-strengene; `npx tsx scripts/text-parity.ts [--list <præfiks>|--top]`) og `tests/estimateBudget.test.ts` (K5 – antal `estimeret` i src/game). Begge fejler kun, hvis tallet STIGER. Sænk baseline, når tallet er faldet: K3 `npx tsx scripts/text-parity.ts --update` (skriver `scripts/data/text-parity-baseline.json`), K5 ret `count` i `tests/estimateBudget.baseline.json`. Nye ikke-originale tekster: ret teksten til originalens, eller tilføj området til `scripts/data/text-parity-allow.json` med begrundelse (kun CM Reborn-områder/Game Options/udvidet).
- Tjek `git log` ved start – der arbejdes ofte på projektet i andre sessioner.
- Ny computer: docs/NEW_MACHINE.md. Motor-arbejdsmappen `~/cm0102-engine` er det PRIVATE repo `Skallerup/cm0102-engine` (noter, værktøjer, orakel,
  Claudes hukommelse i `claude-memory/`); exe, rekompileret C og gemte spil genskabes med `tools/regen.sh` og kommer aldrig i git.

## Arkitektur i korte træk
- React/Vite PWA i `src/`, spilmotoren i `src/game/`, Vercel-funktioner i `api/` (Upstash Redis, Vercel Blob, Resend).
  Relative imports i `api/` skal have `.js`-endelse (ESM).
- Klassisk CM 01/02-tema (`data-skin='retro'`): `src/ui/classic.tsx` (hubs, faner, `CxDrop`, `CxLink`, `clubRoute`),
  `classic.css`, `classicOptions.tsx` (Game Options/Settings) og `src/ui/screens/*Classic.tsx`.
- Forsiden og bundlen: `ui/App.tsx` tegner forsiden (Landing) fra en lille bundle (≈630 KB); spillet (`ui/AppPage.tsx`: motor, skærme,
  draft, admin, fællesskab, ConfirmHost) hentes lazy ved Spil/url-parametre/genoptag. Moduler, forsiden bruger (theme, online/rank,
  account, notify, errors, i18n), må ikke importere motoren (game/sim, competitions …) eller `changelogData` – brug `src/version.ts`
  og dynamiske imports. Tjek med `npx vite build --sourcemap` + sourcemap-analyse, at hovedchunken ikke vokser.
- i18n: 10 sprog (sv/nb fra 2026-11-07). Kun `en` ligger i hovedfilen – `da` og resten hentes ved behov (ensureLang før første tegning). Nye tekster skal i både `en.ts` og `da.ts`
  (øvrige sprog falder tilbage til engelsk).
- SEO-siderne (`scripts/build-seo.ts`, ≈17.500 statiske sider): CSS inline; ægte `lastmod` pr. side via indholdsfingeraftryk i
  `scripts/seo/lastmod.json` – filen opdateres af `npm run build` lokalt og SKAL med i samme commit; `/about/`; enhedsguider på
  9 sprog (`scripts/seo/i18nDevices.ts`, hreflang til `/cm-01-02-windows-11/`); skærmbilleder fra `public/landing/<sprog>/` på
  indgangssiderne. IndexNow sendes automatisk efter hvert push til main (`.github/workflows/indexnow.yml` venter på, at `/build.json` på
  cm0102reborn.com viser commit'en – Vercel laver ingen GitHub-deployments – og sender kun url'er med lastmod inden for 3 dage). Google Search Console er sat op af ejeren (verificeret uden for repoet; `VITE_GSC_TOKEN` behøves ikke) – bed ejeren
  om et udtræk, når effekten skal måles. Vercel Web Analytics bruges IKKE (koster penge – ejerens beslutning 2026-11-10); GA4 findes.
- **Originalens kampmotor (projekt fra 2026-11-10):** Ejeren har tilladelse (som Bosman Editions forfatter) til at bruge så meget af
  originalens motor som muligt. Målet er en så præcis motor som muligt: en TypeScript-port af den rekompilerede kampmotor
  (`CM3_MATCH_ENGINE`: `init_match` 0x6b7f20, `run_match_steps` 0x6b98c0, MATCH_MAN/MATCH_PLAYER/Match_Events/Injury, RNG-puljen
  0xaa2454) i et nyt modul `src/game/engine/original/` bag et flag, med Bosman headless som orakel (RECOMP_SCRIPT, -seed,
  RECOMP_FIXED_CLOCK) og reproducerbare sammenligningstests. Kræver originalens filer (`CM0102.iso` + `cm0102_3968.exe`
  eller en ren `cm0102.exe` 3.9.68). Fundet 10/11 i `/Applications/CM 01-02 Bosman Edition.app/Contents/Resources/game/` –
  rekompileret til `~/cm0102-engine/` (uden for repoet: `hooks/<adr>.c` pr. funktion, `notes/` med pseudokode og offsets,
  README med kommandoen). Plan, funktionsliste og sæsontal: docs/ENGINE_PORT_PLAN.md. Vehiklet er gittermotoren
  (docs/GRID_ENGINE.md): de *estimerede* kroge i `GRID_UNKNOWN` erstattes af præcise porte. Bosman-binæren kan køre
  scriptet (`RECOMP_SCRIPT`, `RECOMP_FIXTURE_RECORD`, `-seed`) som orakel. Baggrund: docs/ORIGINAL-ENGINE-RESEARCH.md.
- Data: kildezip'er i GitHub-release'n `data-sources` (`npm run data:fetch`). Byg med
  `npx tsx scripts/build-cm-data.mts <Data-mappe> <out.json> <sæson>` → `public/data/world.json` (2026/27) og
  `world-original.json` (2001/02, 3.9.68).

## Kendte faldgruber
- `stadium.dat`: kapaciteten står på byte 60 (ikke 59) – ellers får alle klubber 120.000 pladser
  (regressionstest i `tests/stadiums.test.ts`; gemte spil rettes ved indlæsning i `game/save.ts`).
- I det klassiske tema må DOM'en ikke ændres i selve `dragstart` (Chrome afbryder trækket).
- Rullemenuer i en kolonne, der kan rulle, skal bruge `CxDrop fixed`, ellers skæres de af.
- World-filerne må ikke rettes i hånden – genbyg med `scripts/build-cm-data.mts` (skriver sha256 i `scripts/data/world-builds.json`;
  `tests/worldBuild.test.ts` fanger håndrettede filer). `npx tsx scripts/world-repro.ts [3965|3968]` genbygger fra kilderne og viser forskellen.
  Kilder: 3.9.60 = `.orig-db/…-3.9.60-Database-Swedish_fixed`, 3.9.65 = appens officielle `game/Data-3.9.65`, 3.9.68 = `.orig-db/…-3.9.68-Database` + `NO_LEGACY=1`.

## Udgivelseslog
Se `docs/RELEASE_LOG.md` (nyeste først) – `grep -n <emne> docs/RELEASE_LOG.md` før du leder i koden.
