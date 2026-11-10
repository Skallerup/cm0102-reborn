# CM Reborn – projektnoter til Claude

Delt hukommelse for alle sessioner. **Opdatér denne fil (og den lokale memory) hver gang noget skydes live**,
og læg ændringen i samme push.

## Arbejdsgang
- Svar på dansk. Ejeren sender skærmbilleder fra CM 01/02 som spec (nogle gange som filer på skrivebordet).
- **Staging først:** udvikl på branchen `staging` → push → https://staging.cm0102reborn.com (Vercel Preview, kræver
  login på Vercel). Når ejeren har godkendt det på staging: merge `staging` → `main`.
- "Skyd live" = merge/push til `main`. Vercel udgiver cm0102reborn.com; GitHub Actions kører kun test og build.
- Redis oprettes altid med `makeRedis()` fra `api/_lib/redis.ts`. På staging (VERCEL_ENV=preview) får alle nøgler
  præfikset `stg:`, så staging deler databasen uden at røre produktionens data. Brug aldrig `new Redis()` direkte,
  og hverken `pipeline`/`multi`/`eval` (understøttes ikke med præfiks). Staging har sin egen `ADMIN_TOKEN` (Preview);
  login-mails, Discord og den ugentlige mail er kun sat op i produktionen.
- Alt er gratis: betaling/Stripe/supportere er fjernet (2026-11-05). `season.ts` kalder stadig `rng.chance(0.04)` for
  supporter-regens, så tilfældighederne i gamle spil er uændrede – lad det stå.
- Node: `export PATH="$HOME/.local/node/bin:$PATH"`. Tjek altid `npm run build` og `npx vitest run` før push.
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
- SEO: `scripts/build-seo.ts` (kører i `prebuild` – også på Vercel; outputtet er i .gitignore) laver guiderne (`pages`) og
  via `scripts/seo/db.ts` databasesiderne `/cm-01-02/` og `/2026-27/` (spillere/klubber/ligaer/lande/lister/A-Z + search.json),
  fælles skabelon `scripts/seo/layout.ts` (+ public/seo.css), sitemap-indeks `sitemap.xml` → `sitemap-<gruppe>.xml`, `llms.txt`.
  Hvem der får en spillerside: `keep` i build-seo.ts (~13k sider, ~190 MB HTML). `CONTENT_DATE` = lastmod – hæv ved mærkbare
  ændringer. Url'erne skal være stabile (navn → slug; dubletter + klub). Nye stier: SW `globIgnores` + `navigateFallbackDenylist`.
- Den originale database og den moderne må ikke dele økonomi: alt 2001-specifikt ligger bag `g.econ` (kun original).
- Prisniveau: `src/game/econ.ts`. Nye spil med den originale database får `GameState.econ` (faktor pr. liga, målt i
  newgame.ts) – faste beløb ganges med `econ(liga)`, og `valueFromCA` bruger originalens værdikurve. Nye faste beløb
  i økonomien skal ganges med `econ(...)`. Mål med `scripts/econ-run.ts`.
- Tjek `git log` ved start – der arbejdes ofte på projektet i andre sessioner.

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
- Data: kildezip'er i GitHub-release'n `data-sources` (`npm run data:fetch`). Byg med
  `npx tsx scripts/build-cm-data.mts <Data-mappe> <out.json> <sæson>` → `public/data/world.json` (2026/27) og
  `world-original.json` (2001/02, 3.9.68).

## Kendte faldgruber
- `stadium.dat`: kapaciteten står på byte 60 (ikke 59) – ellers får alle klubber 120.000 pladser
  (regressionstest i `tests/stadiums.test.ts`; gemte spil rettes ved indlæsning i `game/save.ts`).
- I det klassiske tema må DOM'en ikke ændres i selve `dragstart` (Chrome afbryder trækket).
- Rullemenuer i en kolonne, der kan rulle, skal bruge `CxDrop fixed`, ellers skæres de af.

## Udgivelseslog (nyeste først)
- 2026-11-10 – Moderne taktik: højreklik og træk fra en spiller tegner en løbepil (`individual[i].run`, snappet med `runTarget` som i klassisk); højreklik uden træk åbner menuen som før, som også kan fjerne pilen.
- 2026-11-10 – Nyt spil: spiltilstandens kort (Ægte CM 01/02 / Udvidet) viser ikke længere skærmbilleder – de viste det klassiske og det moderne udseende og kunne forveksles med udseende-valget, som har sine egne billeder.
- 2026-11-10 – Klubtema (moderne, lyst): en meget lys hovedfarve med en mørk anden farve bytter plads (menu = den mørke, topbjælke = den lyse). Brøndby fik olivengrøn menu, fordi gul blev mørknet; nu blå menu og gul topbjælke (`theme.ts`).
- 2026-11-10 – Målt, ikke rettet (ejeren: "måske senere"): forsvarere scorer 16 % af målene (virkeligheden ~11 %), hovedstødsmål 24 % (~17 %) – indlæg i åbent spil, ikke hjørnespark (11 %, ok). 8 forsvarere med 10+ mål på en sæson (Materazzi 19). Rettelse: skru hovedstødsafslutninger ned til ~17 % af målene uden at ændre det samlede antal mål (`scripts/match-stats.ts` måler det).
- 2026-11-10 – Spillerprofil (klassisk): Liga- og Pokal-rækkerne viser assists, kampens spiller og karaktersnit (`SeasonStats.lgAssists/lgMom/lgRatingSum/lgRatingCount`, valgfrie felter – ældre gemte spil viser "-" indtil næste kamp). Landshold har stadig intet snit (landskampe giver ingen karakterer).
- 2026-11-10 – Match Report (klassisk) vises løbende under kampen (før "Der er ingen kamprapport" indtil slutfløjt – ejeren oplevede det som forsvundet).
- 2026-11-10 – Stabssøgning (klassisk): knappen Filtre (job, status ledig/ansat, nationalitet, omdømme mindst, alder højst) som i spillersøgningen – `StaffFilterDialog` i TransfersClassic.tsx; Søg-menuens forvalg virker stadig oven i.
- 2026-11-10 – v0.22.0: ændringsloggen i spillet samler dagens brugerønsker og rettelser (spillet kamp som kampskærm, baggrunde, Til kampen via truppen, mål på én linje, målblink, kolonner, You Have News, gruppetabeller, feriebjælke, gule landsholdsspillere, utilfredshed/bud ved klubskift, ingen auto-genindlæsning, in-app-banner, hurtigere forside).
- 2026-11-10 – Landsholdstrup (klassisk): egne spillere står i gult (`.cx-sq-name.mine`), som i originalen.
- 2026-11-10 – Match Overview (klassisk): flere mål af samme spiller står på én linje med minutterne adskilt af komma ("Nordstrøm 53, 64"), som i originalen.
- 2026-11-10 – Klassisk: "Til kampen"/Continue Game på kampdagen går først til truppen; derfra giver næste tryk "Proceed to the match ?" (som i CM 01/02). `onContinue` i Shell.tsx.
- 2026-11-10 – AI-klubber byder ikke på en menneskelig klubs nyindkøbte spiller (`recentlyJoined`: 120 dage, eller samme sæson hvis ikke sat til salg) – hverken i `aiBidsForListed` (bød også på ikke-listede med faktor 0,4) eller via `canBidOnHuman`. Sat til salg = bud tilladt.
- 2026-11-10 – `setClub` nulstiller `p.unhappy` ved klubskift: en nyindkøbt spiller tog utilfredsheden med fra den gamle klub og stod som "utilfreds med sin spilletid" samme dag (Mark Kerr, Vejle).
- 2026-11-10 – Klassisk: sidebjælkens menuer (`.cx-gameopt .cx-drop-pop`, z 80) ligger nu over de faste bokse (`.cx-dlg`, z 70 – Tilbyd kontrakt m.fl.); før blev menuen gemt bag boksen.
- 2026-11-10 – PWA: service workeren er i prompt-tilstand (før autoUpdate, som genindlæste siden lige efter åbning første gang efter hver udgivelse). Ny version tages i brug ved næste besøg, eller via `ui/UpdateToast.tsx` ("En ny version af spillet er klar – Genindlæs nu"). Siden genindlæser aldrig af sig selv.
- 2026-11-10 – Forsidens rangliste viser kun rigtige managere (de fiktive AI-managere i `ui/aiManagers.ts` er fjernet; tom liste viser `land.rankEmpty`).
- 2026-11-10 – (staging) `ui/InAppBanner.tsx`: i en apps indbyggede browser (Android WebView "; wv)", Facebook/Instagram/Messenger/Discord/TikTok/Line/Snapchat …) vises et banner øverst: gemte spil kan forsvinde, spillet kan ikke installeres – Android får knappen "Open in Chrome" (intent-link), iOS en vejledning til del-menuen. Vises højst én gang pr. 7 dage (`cm0102.inapp.seen`). Wallet-/Firefox-fejlene får ingen besked (de rammer ikke spillet).
- 2026-11-10 – Skudt live: IndexNow-workflow, e2e tåler PA-omslag, online-markering i admin, fejlfilter for udvidelsesstøj.
- 2026-11-10 – (staging) Fejlrapporten (online/errors.ts) ignorerer støj fra browserudvidelser og indlejrede browsere: `window.ethereum`/`selectedAddress` (krypto-wallets i Safari), `__firefox__` (Firefox på iOS), "Java object is gone" (Android WebView), `safari-web-extension:`. De 4 fejl i admin 10/11 var alle den slags – ingen spilfejl.
- 2026-11-10 – (staging) Admin → New careers: grøn prik ved manageren, hvis browseren er online (puls inden for 5 min), og "● N online now" er en knap, der filtrerer listen til de online (viser også hvor mange af de online, der har en karriere i listen).
- 2026-11-10 – Skudt live (merge staging → main): You Have News → næste besked, skiftevise kolonner, Goal flash, tredje midterforsvarer, kampens spiller i lyseblå, spillet kamp som kampskærm.
- 2026-11-10 – (staging) Klassisk: en spillet kamp (rapport-ruten og "match" med resultat) vises som kampskærmen efter slutfløjt – `screens/PlayedMatchClassic.tsx` bygger Match Overview/Stats/Action Zones/Report, Team Stats, Player Ratings, Latest Scores og League Table af `MatchReport` (kommentar, events, heat, players) med samme sidebjælke (taktik-knapperne viser holdets Team Stats, Continue går tilbage). Match.tsx eksporterer fanekomponenterne; CxReport/CxTeamStats/CxRatings tager data i stedet for `sim`.
- 2026-11-10 – (staging) Taktik: en spiller, der slippes på en optaget plads, lander på rækkens nærmeste ledige plads (`snapFreeSlot`) – så en tredje midterforsvarer kan slippes oven i de to andre (før skete der intet). Kampens spiller: navnet i lyseblå (#6fe3ff) i Player Ratings som i originalen; tekstlinjen "Man of the match – …" er fjernet.
- 2026-11-10 – (staging) Klassisk trup/taktik: de to kolonner fyldes skiftevis (nr. 1 venstre, nr. 2 højre …), så sorteringen læses række for række.
  Spilindstillinger: "Goal flash" 2/5½/8/12 s (`goalFlashMs`, `cm-goal-flash`) – hvor længe et mål blinker på kampskærmen.
- 2026-11-10 – (staging) "You Have News" (klassisk) åbner den ældste ulæste besked og går videre til den næste ved hvert klik (`showOldestUnread`) – før åbnede den kun indbakken.
- 2026-11-10 – Skudt live (merge staging → main, `15bc2fb`): alt nedenfor fra 2026-11-05 til 2026-11-10 (staging).
- 2026-11-10 – (staging) Brugerønsker: (1) klubskærme uden foto udefra og uden klubbillede får et stadion udefra fra pakken
  (`genericClubUrl`), kampdage uden stadionfoto får et kampbillede med tribuner (`genericMatchdayUrl`, også finaler) – `backgrounds.ts`;
  (2) aftenkampe (midtuge og europæiske kampe, `eveningFixture`) får nat-look i CSS (`.cx-night`/`.mbg-night`: mørkt, koldt,
  projektørfelt) – pakken har ingen nattefotos. Fejl: (3) europæiske gruppetabeller i det klassiske tema vises nu sorteret efter point
  (`CupClassic.tsx`, rækkerne lå i lodtrækningens rækkefølge); (4) feriebjælken siger "On holiday – click here to return" (stop fandtes,
  men ingen fandt den). Målt, ikke rettet: assists er ~2× for koncentrerede (topassister 22 % af holdets mål i snit, op til 47 i en sæson;
  73 % af mål har assist, hvilket er fint) – årsagen er boldholderens valg (playmaker-vægten 2,6 i `engine/match.ts` linje ~802), samme
  sted som målscorer-afvigelsen (ENGINE.md trin 15). En kortere assist-vindue (≤1 øjeblik) hjalp kun lidt og er ikke taget med.
- 2026-11-10 – (staging) SEO, 10 opgaver: (1) forsidens hovedbundle 2,6 MB → 0,6 MB (spillet lazy, dansk og Blob-klienten
  hentes ved behov), (2) Google Fonts uden at blokere, (3) hero-billeder eager/fetchpriority + width/height (LCP/CLS), (4) ægte
  lastmod pr. side + sitemap uden `?draft=1`/`?community=1`, (5) enhedsguider (cd/Windows 11/Android/iPhone/Mac) på 9 sprog med
  hreflang, (6) skærmbilleder + og:image på play-online-siderne (alle sprog) og enhedsguiderne, (7) titler over 65 tegn 61 → 8 og
  forsidens titel 77 → 61, (8) `/about/` (E-E-A-T) med link i sidefoden og på forsiden, (9) IndexNow efter produktionsudgivelse i
  GitHub Actions (`.github/workflows/indexnow.yml`, committet 10/11 efter `gh auth refresh -s workflow`), (10) CSS inline på alle statiske sider (ingen blokerende seo.css).
- 2026-11-10 – (staging) main (237 commits, bl.a. alle SEO-siderne) flettet ind i staging; betaling fjernet igen oven på main, Redis via `makeRedis` i alle serverfunktioner.
- 2026-11-05 – (staging) Betaling fjernet helt – alt er gratis; staging-miljø på staging.cm0102reborn.com med `stg:`-præfiks i Redis.
- 2026-11-10 – Spillerudviklingen målt i originalen: originalens gemte spil kan nu læses (`scripts/orig-save-dev.py` – indeks 268 bytes/fil, RLE: byte > 0x80 = gentag næste byte (b&0x7F) gange, ellers literal; player.dat 70 bytes +5 CA/+7 PA, staff.dat 110 bytes +18 fødselsår/+57 klub/+97 spillerreference). Testspillet gemt 31/8-01 og 25/9-02 ("CLAUDE DEV A/B" i ~/Library/Application Support/cm0102; ejerens karriere urørt). Fund: op til 31 år trækkes CA mod PA − 13 (på PA → −15/år), fra 32 år −5…−9/år, udsving ±9; CA 150+ står stille (495 → 495). `develop()` (training.ts) har nu `DEV` (ceil 13, pull 0,035, fald fra 32, decline 4,5, noise 0,8 …), mål med `scripts/dev-cal.ts` (`DEV_JSON`). 5 sæsoner: CA 150+ 495 → 683 (før 979), moderne 475 → 606 (før 1.090). docs/ENGINE.md "Udvikling".
- 2026-11-10 – v0.21.0. Langtidstestens fund (original DB: −17 % spillere og 63 → ~450 klubber i minus på 5 sæsoner; toppen blev stærkere – CA 150+ 495 → 1.207). Årsager: (1) ungdomsårgange (3-4 pr. klub/år) OG regens af PA 120+ gav dobbelt talenttilgang, og frie agenter forsvandt uden afløser; (2) stabens løn (makeStaff) kostede i små klubber det samme som truppen. Rettet: `originalRegens()` (season.ts; original DB + ægte tilstand) = originalens model fra Bosman-projektets player_generation/PLAYER_GENERATION.md (player_regen.cpp sub_7abac0): ALLE der forlader fodbolden (`leaveFootball` – pension, prune, freeAgentDrift) genfødes med samme PA, alder/CA efter "sti 2" (`originalRegenAgeCa`), lige efter pensioneringen (`spawnRegenQueue` i rollover/drift), også i skjulte klubber under 16 spillere; ingen `youthIntake`/`youthPreview`. Udvidet spil uændret. `createClubStaff`: stabens løn højst 20 % af spillernes lønsum (*estimeret*, nye spil). Målt 5 sæsoner (ægte, original): spillere 39.863 → 39.863, skjulte 13.560 → 12.470, minus 63 → 194, CA 150+ 495 → 995 (resten er databasens unge, der vokser mod PA). `scripts/soak.ts` tager `MODE=authentic`. tests/originalRegens.test.ts.
- 2026-11-09 – SEO-revision efter nattens sider: titler over 65 tegn 284 → 61 (stabsprofilerne vælger den første af tre former, der kan stå; `fit(...)` i db.ts til wonderkid-/cheap-/egenskabslisterne), 0 beskrivelser over 160, 0 brudte links.
- 2026-11-09 – Rettet (set i browseren): klassisk nyhedsoverskrift uden link mistede mellemrummet efter et klubnavn ("Man Utdto register …" – `.cx-nhead` er flex, så tekststykkerne blev egne elementer; nu i et `<span>`), og `eur.request` sender turneringens navn (compName tager navnet, ikke id'et: "the CL" → "the Champions League").
- 2026-11-09 – SEO: afsnittet "Attribute masking" i hidden-attributes-guiden (originalens "( - )", Sct, Scouted Only – fra Bosman-projektets SCOUTS.md) og titlen "Hidden Attributes & Attribute Masking"; taktikguiden nævner "team instructions" i beskrivelse og overskrift.
- 2026-11-09 – SEO: `/cm-01-02-money-cheat/` ("money cheat", "unlimited money", "money editor", "dinheiro infinito"): databaseeditor/save game editor i originalen, CM Reborns indbyggede Editor (Clubs → Balance at start → New game) og lovlige veje til penge.
- 2026-11-09 – SEO: regens-guiden har "The regens to look out for" (de ældste stjerner med PA 150+ og deres land – regen arver PA og nationalitet; `DbOut.nationName`).
- 2026-11-09 – SEO: `/cm-01-02-best-signings/` ("best signings", "must sign players", "players to buy": billige stjerner ≤ £1,5m, billige wonderkids, Bosman 2002, frie agenter fra `dbO.kept`), titlerne "Best Tactics & Formations" og "Best Training Schedule".
- 2026-11-09 – SEO: guiden `/cm-01-02-3960-database/` (3.9.60 = ODB: top 50, pr. position, wonderkids, tilfældigt PA, spillere kun i 3.9.60 – matcher 3.9.68 på navn eller efternavn + fødselsår) og 18 sider på 9 sprog (`scripts/seo/i18nGuides.ts`: bedste spillere/wonderkids i 3.9.60 og 2026/27-databasen – fx /tr/cm-01-02-en-iyi-oyuncular/, /pt/cm-01-02-atualizado-2026/, /it/cm-01-02-aggiornamento-2026/) med hreflang til de engelske sider (`LG.altBest`/`altUpd`), link fra sprogets landingsside (`toPage(…, local)`). Søgeordene fra autoforslag på tr/pt/es/de/it. Linktjek: 0 brudte.
- 2026-11-09 – Stab fra databasen i spillet: parseren giver `CMWorld.staff` ([klub (0 = ledig), fornavn, efternavn, nation, dob, job 5/6/8/9/10, [Coaching, JPA, JPP, Physio, Motivating, Discipline, Tactics], CA, omdømme, id]; ikke-spillerposten +16/+23/+24/+30/+27/+20/+33), byggescriptet beskærer til synlige klubber (andre klubbers folk med CA 100+ bliver ledige, højst 600 ledige) og skubber datoerne. `createClubStaff` bruger databasens folk først (højst 1 assistent/7 trænere/3 fysioterapeuter/7 spejdere; manageren kun hvis navnet passer med clubs[7]/Wikipedia, Wikipedias nationalitet går forud) og genererer resten; `addDbStaff`: 1 = ikke sat (*estimeret*). Alle fire world-filer genbygget (3.9.65/3.9.68/2026 fik også `valueClub`). `workbox.maximumFileSizeToCacheInBytes` 10 MB (world.json 7,9 MB). tests/dbStaff.test.ts.
- 2026-11-09 – European Squad som i originalen (målt 31/8-2001 i testspillet): `src/game/euroSquad.ts` – `euroSquadDaily` (newDay) sender `eur.request` 31/8 og 1/2 (*estimeret*) til klubber i en europæisk turnering (`Club.euroDue`), `submitEuroSquad` (action `euroSquad`, højst 25) → `Club.euroSquad` {season, ids} og "N players were registered."; `tacticFor(…, comp)` bruger kun de tilmeldte i europæiske kampe (`userTactic(auto, only)` gemmer ikke taktikken; under 11 spilleklare tilmeldte → tilmeldingen gælder ikke). Klassisk: Respond → `ClassicEuroSquad` (EuroSquad.tsx: In-felter, tæller, Auto = 3 GK + 22, Clear, Submit → "Submit the current European squad ?"), Continue venter, Team Selection-gruppen `unreg`. Uden svar: auto før første europæiske kamp/ferie. tests/euroSquad.test.ts.
- 2026-11-09 – SEO: stabssider fra databasen (`scripts/build-staff.mts` <Data-mappe> <out> [world] → `scripts/seo/staff-3968.json`/`staff-2026.json`; ikke-spillerposten: 21 egenskaber alfabetisk fra +14, jobkoden personpost +61 – 1 Chairman, 2 Managing Director, 4 Director Of Football, 5 Manager, 6 Assistant Manager, 8 Coach, 9 Scout, 10 Physio bekræftet i originalens Non-Playing Staff; Meulensteen/Jimmy Ryan målt – nogle vises anderledes, QUESTIONS_FOR_BOSMAN §7). `scripts/seo/staff.ts`: `/{db}/staff/` (8 lister: coaches, GK coaches, youth coaches, physios, scouts, assistants, managers, free staff + ~800 profiler pr. DB), stabsafsnit på klubsiderne, guiden `/cm-01-02-staff-guide/` (DbOut.staffTop). Nye lister: `cheap-<position>` (≤ £1m / £8m), `free-players-by-position`, `free-transfers-lower-league`, `sleeping-giants`; landesidernes titel "Best <Brazilian> Players & Wonderkids" (`scripts/seo/demonyms.ts`). Linktjek: 17.500 sider, 0 brudte. Squad Numbers før kamp (klassisk): spillere uden nummer → `squad` med `sqnMissing` (kun dem, kun ledige numre), "Submit new squad number changes ?" → "Proceed to the match ?" (målt i originalen før Man Utd-Liverpool). e2e-soak original/klassisk 5 sæsoner: 0 problemer.
- 2026-11-09 – Squad Numbers som i originalen (målt i testspillet 4/8-2001, 3.9.68): `src/game/squadNumbers.ts` – `squadNumbersDaily` (sim.ts newDay) sender `sqn.request` 4/8 til hver menneskeklub (`Club.sqnDue` = sæsonen, `sqnDone`), `submitSquadNumbers` (action `squadNumbers`, nums: pid → nummer/0) sætter numrene og giver beskeden `params.done` → "The list has been submitted." (offerAnswer i common.tsx). Klassisk: Respond i indbakken → `ClassicSquadNumbers` (talrækker 1-25/26-50, ledige lyse; træk nummer → spiller, klik nummer = ledigt; Auto *estimeret*, Clear, Back, Submit → "Submit Squad Numbers" Yes), også trupvisningen `tbl:numbers`; Continue Game viser beskeden, mens listen mangler (originalen gør Continue grå). Ferie/moderne/kampdag: sendes automatisk. e2e: `answerSquadNumbers`. Langtidstest fandt nedbrud: `activateNation` spillede de forpassede kampe på én dag, og skaderne helede aldrig (Morton 21/22 skadet → MatchSim uden spillere) – skader/karantæner/kondition rulles tilbage pr. kamp (tests/addNation.test.ts). soak (5 sæsoner, begge DB'er) og features (20/20, original med Arsenal) uden fejl.
- 2026-11-09 – ENGINE.md trin 15 (kun målinger, motoren uændret): målscorerne i originalens ferie-sæson (`original-stats.ts`) mod vores (`original-lab.ts`, `labHooks.report` i sim.ts trækker ingen tal; `KINDS=1` = skudtyper). Positionsfordeling og afslutning passer; afvigelsen er, at de bedste hold scorer 83-85 mål (orig 68) og deres angriber får ~4 skud/kamp (orig 3) – boldholderens valg i angrebszonen (sub_7109f0), ikke en parameter.
- 2026-11-09 – Udfyldningens CA-led `FILL_CA` = 10 (playerInit.ts; Bosman læste ca/5): målt i originalen på Man Utds 6 keepere uden Set Pieces (12/15/13/8/5/6 ved CA 180-65) – ca/5 gav altid ~20. ENGINE.md trin 14: ORIGINAL ease 0,12, finish 2,1, homeAdv 2,2, oneOnOneK 0,5 → 2,88 mål, 23,9 % uafgjort, 2-0 12,6 % (orig 15,5), mester 86-88, topscorer 27-31 (orig 23).
- 2026-11-09 – Målt i ejerens original (nyt testspil Arsenal/Man Utd, 3.9.60, dag ét, uden masking – hans karriere ikke rørt): Johnsen 12/11/9 = kæden (±1 kun fra den tilfældige udfyldning af hans manglende One on Ones); keepernes Off the Ball bruger `0,1·CA` som Crossing/Creativity (*målt*, Seaman 4 → 26/26). Keepernes manglende Set Pieces bliver 20 hos os (grenen `rand(11)+ca/5−5`), originalen 13/15 → spørgsmål i QUESTIONS_FOR_BOSMAN.md §6. Topscorere (docs/ENGINE.md trin 13): ORIGINAL `oneOnOneK` 0,55, `shotSpread` 0,25, squash 0,48, ease 0,25, finish 1,9 → topscorer 26-28 (før 29-37), mester 84-88.
- 2026-11-09 – Gittermotorens kroge kalibreret (kun lim/`GRID_UNKNOWN`): offside via `offsideFlag`/`linesmanMisses` for alle angribere, hjørner fra afværgede indlæg/blokerede skud, formationen følger bolden med 1/3 og forsvarslinje 2 rækker fra mål, `runChallengeP`/`preShotP`, `homeAdv` 10, dommerreglerne `foulGiven`/`cardSeverity`/`cardFor`. 380 kampe: 3,6-3,75 mål, 47-52/16-21/31-32, 15,3 skud, 7,4 på mål, 4,1-4,4 hjørner, 18 frispark, 4,3 offside, 1,3/0,07 kort, 70 %. Stadig for mange mål (57 % af skuddene fra D ≤ 1). Se docs/GRID_ENGINE.md.
- 2026-11-09 – Bosman-prompten opgave 5 (+2–4): gittermotoren (9×12) i `src/game/engine/grid/` ved SIDEN AF MatchSim (ikke koblet ind i spillet). Bosmans porte kopieret (ballCarrier/passOptions/shot/helpers/loop.ts, kun typerettelser), limen `gridMatch.ts` (`runGridMatch`) med alle ukendte dele som estimerede kroge i `GRID_UNKNOWN`. `npx tsx scripts/grid-stats.ts [kampe] [frø]` (`GRID_JSON` overstyrer krogene): 5,45 mål, 47/18/35, 19,6 skud, 2,3 hjørner, 0,8 offside, 69 % afleveringer – for mange mål, fordi skuddene tages for tæt på (taktisk felt/løbemål/zonevalg/dueller er ukendte). docs/GRID_ENGINE.md, tests/gridEngine.test.ts, nye spørgsmål i QUESTIONS_FOR_BOSMAN.md §5.
- 2026-11-09 – Bosman-prompten opgave 1b: originalens værdiformel `sub_4d0c60` = `formulaValueGbp` (originalValue.ts) ved nyt spil og som mål i `monthlyValues` (kun `g.econ` + klub med `Club.vc`). Parseren giver `WorldData.valueClub[cid]` = [cf, nation +0x8E, managerens viste Judging Player Potential (ikke-spiller +0x18 via referencen i personposten, fundet som spillerreferencen), manager-id]; uden felterne bruges den tilpassede `originalValueGbp`. Målt mod `scripts/data/original-values-3960.json` (3.283 spillere fra originalens Player Search) med `scripts/value-eval.ts`: 58 % inden for ×1,25 (før 35 %), stjernerne ±5 %, bias ×0,87. Rettelser: straffe altid på mål med rules 'original' (`penaltyShotScore`), +2-bonussen kun ved ≤ 68; rettelse 3-6 som konstanter i cm0102-original-rules.ts. Åbne spørgsmål: `docs/QUESTIONS_FOR_BOSMAN.md`.
- 2026-11-09 – Bosman-prompten (PROMPT_FOR_CM_REBORN.md) opgave 1a: world-filerne gemmer nu databasens rå egenskaber (`attrScale: 'stored'`, `CMRatings.feet`); newgame kører originalens kæde i `playerInit.ts`: `repairPositions` (0x536f01, tabellen rand(182), sider), `fillMissing` på gemt skala, fødder, `shownFromStored` (intern → sub_538ec0 → sub_538bc0 → display; GK-variant for Crossing/Creativity). SEO viser spillets værdier (`attrs` = gp.attrs, 0 = udfyldt). Alle fire world-filer + SEO-filen genbygget. `ORIGINAL` finish 1,58/squash 0,55/0,3/0,72 (docs/ENGINE.md trin 12). Tests: Beckham 13/13, Seaman (−10-reglen), Johnsen 3.9.68 12/11/9.
- 2026-11-09 – SEO efter søgeordsanalysen (docs/SEO-KEYWORDS.md): 8 nye sider (26/27-trupper i build-seo.ts; Android, iPhone/iPad, Windows 11/CD/Steam Deck, cheat tactics + cheat players, work permit, training, multiplayer i seo/guides.ts), nye titler på indgangs- og sprogsider, `fitTitle` sætter "| CM 01/02 Reborn", når titlen kan bære det ("CM Reborn" kolliderer med reborn-dukker), forsidens `<title>`. "Championship Manager" kun beskrivende (varemærke).
- 2026-11-09 – Standarddatabasen ved nyt spil er nu den originale 01/02 (3.9.60) og står først; `cm0102.db` = 'modern'/custom huskes, udfordringer bruger stadig 2026/27. "(standard)" flyttet fra `db.modern` til `db.original` på 10 sprog. e2e sætter selv `cm0102.db` = 'modern' (klub-id'erne er 2026/27's).
- 2026-11-09 – LookPicker: klassisk CM 01/02 først (til venstre), moderne derefter; spiltilstanden havde allerede ægte CM 01/02 først.
- 2026-11-09 – Start.tsx: managernavnets `autoFocus` kun ved udfordringer (feltet står under database/udseende/spiltilstand, og autofokus scrollede forbi databasevalget – også ved hvert databaseskift, fordi feltet genopbygges); `window.scrollTo(0, 0)` ved åbning.
- 2026-11-09 – SEO, 10 opgaver mere: guiderne `/cm-01-02-regens/` (originalens regen-regler fra player_generation/) og `/cm-01-02-player-values/` (sub_4d0c60 + vores måling), `/{db}/referees/` (officials: Discipline, stil, kortbias; link fra hubben), lister `youngest-players`/`oldest-players`, spillerprofilerne viser CA/PA i 3.9.60 (`DbConf.in60`), klubsiderne "<klub> in 3.9.60 vs 3.9.68" (til-/afgange, `squad60`, match på efternavn + fødselsår), ligasidernes intro (stærkeste trup, største stadion, rigeste klub), RSS `/changelog/feed.xml` (+ link i index.html, id-ankre på versionerne), "Related guides" nederst på guiderne.
- 2026-11-09 – SEO, 10 opgaver mere: Bosman-guiden med 3.9.60's udløbende kontrakter (`VersionData.bosman60`), VM 2002-afsnit på de 32 landes sider, saldo-rang i ligaen på klubsiderne (top 3, link til richest-clubs), link til PA-reglerne for tilfældig PA, guideoversigten i grupper med beskrivelser, brødkrummen Guides på alle guider (build-seo `guideCrumb`), synlig "Updated"-dato på artikelsider (layout.ts), FAQ om databaseudgaverne på de 9 sprogsider, `Organization` med `sameAs` (GitHub) i index.html.
- 2026-11-09 – SEO, 10 opgaver: `/changelog/` (fra changelogData, 12 versioner; SW-denylist + globIgnores), VM 2002-guiden `/cm-01-02-world-cup-2002/` (`WC2002` eksporteret fra international.ts; trupper fra 3.9.60, trænerne fra spillets landsholdsdata – delvis 2002-opdateret), `/cm-01-02-richest-clubs/` (3.9.60-saldo, 70 % transferbudget, 3.9.68 ved siden af), `public/404.html` (noindex; i .gitignore), flyttede sider via `MOVED` i build-seo.ts (meta refresh + noindex, Thabet → Tunesien; Vercel-opsætningen røres ikke), `noindex`/`redirect` i layout.ts' Page, `SearchAction` i index.html (databasesøgningen læser `?q=`), guide-sektion på hubberne, Manager-kolonne på ligasiderne, "<land> managers" på landesiderne, billed-sitemap for stadionfotos (`DbOut.images`, 409 billeder).
- 2026-11-09 – SEO: `/2026-27/kits/` (trøjeleverandører fra `CLUB_INFO_2026`, pr. mærke og pr. liga, link fra 2026/27-hubben), sprogsiderne (9 sprog) har en sektion med links til de engelske guider (`GUIDES_H`/`GUIDE_LINKS` i seo/i18n.ts), forsidens statiske tekst (index.html) nævner de tre udgaver og linker til de nye guider. IndexNow: alle 15.709 url'er sendt efter titelrevisionen.
- 2026-11-09 – SEO-revision af alle ~15.700 sider: `fitTitle` (dropper " | CM Reborn", sæsonen og " & Attributes" over 65 tegn) og `fitDesc` (≤ 160 tegn ved ordskifte) i layout.ts; kortere spiller-/klubskabeloner; `gameSeason`/`seasonTag` (ingen "2026/27 2026/27"); ens navne får klubbens korte navn (+ fødselsår), ens liganavne landet. Titler > 65: 11.081 → 70, beskrivelser > 160: 15.425 → 1. `FOOT_GUIDES` i sidefoden + guide-links ved spillernes egenskaber.
- 2026-11-09 – SEO: guiden `/cm-01-02-match-engine/` (originalens kampmotor fra Bosman-projektets MECHANICS.md: tik, gitter, boldholderens valg, mål, dommer/kort, træthed, knocks, karakterer, AI-udskiftninger + hvad CM Reborn bruger) og taktikguidens afsnit "What the instructions do in the original's code".
- 2026-11-09 – SEO: guiden `/cm-01-02-attributes-explained/` (hvad hver egenskab gør i originalens kampmotor – fra Bosman-projektets BALL_CARRIER.md/MECHANICS.md, markeret "from the code" – med top 5 pr. egenskab via `topIn`/`tops` i seo/guides.ts). IndexNow sendt for database-versions og managersiderne.
- 2026-11-09 – SEO: FAQ-siden (databaseudgaverne, egenskaberne som i originalen), `llms.txt` (managersiderne), klubsidernes Manager-felt linker til managerlisten.
- 2026-11-09 – SEO udvidet: spillerprofilerne (01/02) viser klubben i 3.9.60/3.9.65, når den afviger fra 3.9.68 (`DbConf.otherVersions`, `verRows`/`otherVersions` i build-seo.ts; 2.539 profiler), managersider `/cm-01-02/managers/` og `/2026-27/managers/` (link fra hubben), afsnittet "Wonderkids in 3.9.60" i wonderkids-guiden (`O60`), PA-teksterne på spillersiderne følger originalens regler.
- 2026-11-09 – SEO: ny guide `/cm-01-02-database-versions/` (3.9.60 vs 3.9.65 vs 3.9.68; `versionData()` i build-seo.ts sammenligner på navn + fødselsår – datoerne er rettet ±1 dag mellem udgaverne, og tvetydige navne springes over; `VersionData`/`moveTable` i seo/guides.ts). CA/PA-guiden har originalens præcise PA-regler (−2 snit 153, −1 snit 118, omslag i hvert spil) og omregningen af de 18 egenskaber (tabel 1→7 … 20→20, +1 pr. 10 CA); PA-tekster på liste-/spillersider (`paText`/`paCell`: "R −2"/"R −1").
- 2026-11-09 – SEO: `scripts/seo/world-original-3968.json` genbygget med de rettede egenskaber (stadig 3.9.68 + legenderne, så url'erne er stabile – kun Tarek Thabet forsvandt: Espérance er en skjult klub med 16 spillere, og DOB-rettelsen gav flere spillere). Klubsiderne: Manager (+ nationalitet; 2026/27 fra `CLUB_INFO_2026`, ellers `clubs[7]`), Kit manufacturer (2026/27), `coach` i SportsTeam-ld og et FAQ-spørgsmål (`managerOf` i seo/db.ts). Teksterne (forsiden, llms.txt, download-guiden med afsnittet "Which database version", landingssiderne på 9 sprog) nævner nu 3.9.60/3.9.65/3.9.68. `CONTENT_DATE` 2026-11-09. Byg SEO-filen: `npx tsx scripts/build-cm-data.mts .orig-db/Original-3.9.68-Database scripts/seo/world-original-3968.json 2001` (uden NO_LEGACY; flyt careers-filen væk – den bruges ikke).
- 2026-11-09 – Egenskaberne rettet (docs/ENGINE.md trin 11): databasen gemmer ALLE egenskaber 1-20 (0 = mangler); `convert` i cm0102.ts = originalens intrinsisk (10·v − CA)/2 → sub_544380 (før blev den gemte værdi brugt som intrinsisk → 17-20 overalt). Bekræftet i originalen (Beckham/Johnsen). `src/game/playerInit.ts` (sub_535a80 fra Bosman-projektets player_generation/): `initialisePA` (−2/−1/0 + tilfældige omslag), `capCA`, `fillMissing` (skabelon af 250 tilfældige; regner de 18 tilbage med `storedFromShown`), kaldt i newgame for alle CM-verdener; `CMRatings.paRaw` = databasens PA, når `pa` er et skøn. Alle fire world-filer genbygget (2026/27 fra `.data-update/October 2026 Data Update`, nu også med managere – `CLUB_INFO_2026` går forud). Ny kalibrering: `ORIGINAL` finish 1,92/squash 0,75/0,4/0,85, `MODERN` (sim.ts, `MODERN_JSON` i benchmark.ts) finish 1,1/squash 1. AI-fritstillinger springer nyindkøbte over. tests/originalAttributes.test.ts, potential.test.ts.
- 2026-11-09 – Ejerens ønske: 3.9.60 og 3.9.65 bygges nu fra fællesskabets "Swedish_fixed"-udgaver (`.orig-db/Original-3.9.60-Database-Swedish_fixed` fra ejerens download, `.orig-db/Original-3.9.65-Database-Swedish_fixed`); 3.9.68 har ingen svensk rettelse. Byg: `npx tsx scripts/build-cm-data.mts .orig-db/Original-3.9.60-Database-Swedish_fixed public/data/world-original.json 2001` (og 3.9.65 → world-original-3965.json; 3.9.68 med `NO_LEGACY=1`). Rettelsen ændrer kun ~30 klubbers division (mest lavere svenske) – i world-filerne kun 3 skjulte svenske klubber og 2 spilleres historik; samme id'er og trupper.
- 2026-11-09 – Managernes nationalitet: original DB `clubs[7]` = "fornavn|efternavn|nation" (staff.dat 26 → world.nations-indeks), 2026/27 `CLUB_INFO_2026[id][2]` = landets navn i world.json (fra Wikipedias flag; Luís Pinto mangler → klubbens land). `createClubStaff` bruger dem.
- 2026-11-09 – Valg af officiel 01/02-database ved nyt spil (Start.tsx `ver`, localStorage `cm0102.dbver`, `.db-ver-opt`): `ORIGINAL_VERSIONS`/`originalFile`/`loadOriginalWorld(v)` i ui/world.ts → `world-original.json` (3.9.60), `world-original-3965.json` (fra appens `game/Data-3.9.65` – IKKE .orig-db's Swedish_fixed), `world-original-3968.json` (bygget med `NO_LEGACY=1`, så legenderne fra 3.9.65 ikke kommer med) + `careers-original-<ver>.json`. `GameState.dbVersion` (fra world.source). Fællesskabets rettelser kun på 3.9.60. Managere fra databasen: club.dat 207 = managerens staff-id (Bosman-projektets db.rs) → `clubs[7]` som "fornavn|efternavn" (newgame deler ved |). tests/originalVersions.test.ts. SW: `world-original*.json` NetworkFirst.
- 2026-11-09 – v0.20.0. Spillerfejl (Kulusevski 3 skifter i ét vindue): `recentlyJoined(p)` i transfers.ts (skiftet < 120 dage, eller < 300 dage og ikke transferlistet) gælder nu både `rankTargets` og AI-klubbernes shortlist i `findTarget` (den sprang spærren over); `aiClubTurn` sætter ikke nyindkøbte til salg. 29 → 0 spillere med 2+ skifter i sommervinduet (tests/oneMovePerWindow.test.ts). Forsvarere med 17+ afslutning er originalens egen formel (`convert` = sub_544380: t = CA/20 + intrinsisk/10 + 10) – ikke ændret.
- 2026-11-08 – Kamptaktikkens Ok skriver IKKE længere til `g.tactic` (ejerens ønske – ændringer gælder kun kampen). `src/game/data/clubInfo2026.ts` (`CLUB_INFO_2026`: world.json-id → [cheftræner, trøjeleverandør], fra Wikipedias 2026–27-sider, 10 ligaer, hentet 8/11): `createClubStaff` bruger træneren, når world.season ≥ 2026 og `clubs[7]` er tom (tests/clubInfo2026.test.ts). `KitBrand` (ui/kitBrand.tsx; Simple Icons + Wikimedia Commons ved kørsel, ellers tekst) i ClassicHead ved klubbens logo (ikke original DB, skjult ≤760px). `COMP_LINE` i Match.tsx: Premier League-lilla for linjer uden hold (ikke 2001).
- 2026-11-08 – Spillerfejl fra en tester: kampdage bruger stadionet (`matchdayBgUrl`) før fællesskabets klubpakke (`homePack` – Chelseas pakke var Cobham). Klassisk + `extended()`: `postTalk` i Match.tsx åbner fanen Team Talk (stage 'post') én gang ved slutfløjt (`L.postShown`). VAR-linjer (`k` 'var-*') får `VAR_STYLE` i `cxLineStyle` (også Shell-foden).
- 2026-11-08 – Turneringslogo i klassisk titelbjælke også på kampdagen (`matchday`: den viste turnering = `matchDayComps(...).comps[mdi]`), med UEFA-reserve som CompBadge. Kun når `titleLogo()` er slået til.
- 2026-11-08 – Motorplanens trin 10 (docs/ENGINE.md): `ORIGINAL` = finish 1,62, squash 0,45/0,35/0,62, ny `offside` 1,8 (MatchOpts.offside ganger offside-fælderne; videreført i sim.ts' fire MatchSim-kald). Målt på 3.9.60: 2,76 mål, H/U/B 52/23/25, mester 87/sidst 22,5, topscorer 32 (orig 23), offside 7,2. Regel 10 (skudscore) og 12 (taktikvægte) kan ikke indføres – ukendte dele.
- 2026-11-08 – Den originale database er nu **3.9.60** (ejerens CM 01/02 kører 2001/02 på `game/Data-3.9.60`; 3.9.68 er 02/03-data med 01/02-startdato – Ferdinand i Man Utd, Owen £50K). Kilde: `.orig-db/Original-3.9.60-Database` (kopieret fra `/Applications/CM 01-02 Bosman Edition.app/Contents/Resources/game/Data-3.9.60`, ikke i data-sources-release'n) → `npx tsx scripts/build-cm-data.mts .orig-db/Original-3.9.60-Database public/data/world-original.json 2001` (legender fra 3.9.65 springes over – 3.9.60 har dem). Parseren bruger fødselsåret (staff 24), når datoen har år 1900 (Cherno Samba, Tsigalko m.fl.). SEO-siderne bygger stadig på 3.9.68: `scripts/seo/world-original-3968.json` (`SEO_ORIGINAL` i build-seo.ts). Legender slås op på navn (Shell `onLegend`). `repairStadiums` bruger kun klubber med samme navn.
- 2026-11-08 – Månedsøkonomi i den originale database målt (Man Utd aug. 2001 i originalen: Gate £773K, TV £16K, Merchandising £1,54M, Interest £77K, Wages £3,36M, Ground Maintenance £225K, ingen sponsor): `monthlyFigures` skalerer tv ×0,01, merch ×19, upkeep ×0,7, sponsor 0, og `ClubFinance.interest` = 0,25 %/md. af positiv saldo (kun `g.econ` + cm0102; andre klubber *estimeret*). Originalen kræver også Squad Numbers (4/8) og European Squad (31/8) via Respond – ikke bygget endnu.
- 2026-11-08 – Spillerværdier i den originale database: `originalValueGbp` (src/game/originalValue.ts) tilpasset 3.134 spilleres værdier fra originalens Player Search (OCR af 319 sider med macOS Vision) – evne, alder, klubomdømme, løn, databasens omdømme (`CMRatings.rep` = spillerpost byte 9/11/13 → `Player.cmRep`) og liga (log-rms 0,51; før 0,94). Bruges ved start (3.9.60 har ingen værdier) og i `monthlyValues` (`g.econ` + cm0102). Zidane ≈ £18M som i originalen. Ægte CM 01/02 starter med originalens tre nyheder (ansættelsen, `board.exp.*`, `comp.fixturesOut`).
- 2026-11-08 – Originalens økonomi målt (13 klubber, Add Manager): saldo = club.dat 101 × 0,92-1,08 (0 → 35 ugers lønsum), Transfer Funds = `originalTransferFunds` (70 % af saldoen i hele £250K/£25K, *estimeret*). Ægte CM 01/02: ingen sponsornyheder, januar-tillæg eller merchandise-løft. Klassisk økonomiskærm = originalens View Finances/Income/Expenditure/Stats (`ClassicFinances` i Finance.tsx) med This Month/Last Month/This Year/Last Year (`snapshotFinanceMonth`/`financePeriod`, `Club.finMonths`/`lastFinance`); nye poster `ClubFinance.bonuses/signOn/dividends/maintenance`. Målingerne: memory original-economy-findings.
- 2026-11-08 – Mobilrettelser (klassisk, ejerens iPhone-billeder): Action Zones' streger/etiket ligger nu absolut i alle bredder (på mobil blev de gitterceller), `.cx-mo-goal` uden min-width, titelbjælken med plads til ▸+logo og en 34 px Action-knap (pilen i `currentColor`), nyhedslisten 82 px dato + to linjer (kant i stedet for polstring, så linje 3 ikke kigger frem). Blokken står sidst i classic.css.
- 2026-11-08 – Admin-preview: fanen Saves (`SavesTab`, op `saves` = alle `saves:*` + `support:list`) og 👁 Open i New careers (rækker med `gid` = gemt spil). `openPreview` (save.ts) + `previewInfo()`/`setPreview` (state.ts, nulstilles af setGame): saveGame gemmer intet, rank/sync/puls/new-career/fejlrapporter slået fra, `PreviewBar` i App.tsx (skift udseende, Exit → ?admin=1). Spillere uden konto: "Send mit spil til udvikleren" (`SendToDev`, Options + nedbrudsskærmen; `sendGameToDeveloper` i online/account.ts → Blob `support/…` via op=upload med `{ support: 1 }`, 5/time pr. IP → op=support → `support:list`, højst 200). Admin POST `support-delete`. Nøgler `sendDev.*` (dev.* er spillerudvikling).
- 2026-11-08 – Mobilgennemgang: `holdDrag`/`coarse` i runs.tsx (langt tryk ~0,4 s + træk = løbepil, uden træk = menuen; touchmove preventDefault først efter tryk-tiden, så siden ellers ruller), `useRunDrag().touch`, TacticsClassic `onTouchStart` + Løb-knap ved valgt plads (`.cx-run-btn`), HTML5-træk slået fra på touch (`draggable={… && !coarse()}`). Kampens OppTactics: `pick` (tryk → tryk = udskift/byt/flyt, `drop(target, from)`), hint `cl.mt.tapHint/tapPicked`. Moderne Tactics: to tryk på banen bytter, `.pitch.editing { touch-action: none }`. Klassisk ≤760px: `.cx-side` brydes over i linjer (flex-wrap), CompBadge skjult, `.cm-board.cx-board` med to kolonner (modernes mobilregel lagde begge hold i kolonne 1). Kontekstmenuer holdes inden for skærmen.
- 2026-11-08 – `addNation`-action (kun eget spil, ikke fællesspil/draft) + `addableNations()` i sim.ts → `activateNation`. UI: Selected League(s) som originalens skærm (klassisk: `.cx-sl-cell` SELECTED/BACKGROUND/laveste division med gul ramme om det valgte; klik SELECTED = tilføj; `cl.sl.hint`) og panelet `PlayableNations` i Options (moderne). tests/addNation.test.ts. Cherno Samba findes kun i den originale database (2026/27 er standard).
- 2026-11-08 – Nyt spil: standard = klassisk udseende (`initialLook()` i LookPicker: ingen gemt `cm-theme` → classic) og ægte CM 01/02 (`cm0102.mode` ≠ 'extended'). Authentic var altid grå, fordi `isRetro()` kræver et kørende spil – nu `look`-state i Start.tsx (LookPicker styret med `value`). `ShotPreview` (faner + ⤢-fremviser) til udseende og spiltilstand; nøgler `start.prev*`.
- 2026-11-08 – AI-teksterne slået fra (AI Gateway-kreditten brugt op): `AI_OFF` i api/ai.ts → GET svarer enabled:false, så klienten bruger de faste skabeloner uden at kalde. Slå til med miljøvariablen `AI_ENABLED=1`. Standardmodel nu `google/gemini-2.5-flash-lite` (billigst), Haiku som reserve.
- 2026-11-08 – Forsiden: `News` (Landing.tsx; henter changelogData med dynamisk import, når sektionen nærmer sig; 3 versioner ad gangen, 5 punkter + "+N mere"; da/en, øvrige sprog får en note) og `Database` (DB_CARDS → statiske SEO-sider). Tekster `land.news.*`/`land.db.*` på alle 10 sprog, nav-link `land.nav.news`.
- 2026-11-08 – Reddit-feedback: pausen ligger nu på kampen (`L.paused` i Match.tsx; før useState → nulstillet når skærmen blev forladt, så kampen kørte videre), moderne Tactics-fane pauser. `SlotGuides` (runs.tsx; `GRID_X/GRID_Y` eksporteret fra tactics.ts) viser de 30 faste pladser + den fremhævede under flytning i TacticsClassic og kampens taktik. e2e tjekker begge.
- 2026-11-08 – v0.19.0. Sprogvalget alfabetisk (`LANGS` i i18n/index.ts, efter sprogets eget navn). Forsiden: 10 sprog, tal 1.375 klubber/81 ligaer (spilbare i begge databaser), funktionskortet `authentic` i stedet for `ranking` (har egen sektion), FAQ q7/q8 (original database, databasesiderne), links i foden (`land.foot.*`) til /cm-01-02/, /2026-27/, guiderne og /faq/, `land.footerData` = CM-databaserne (ikke transfermarkt).
- 2026-11-07 – Forsidebilleder på svensk og norsk: `public/landing/sv|nb/*.webp` (screenshots-i18n.mjs CLUBS sv = Malmö FF/Hammarby, nb = Bodø/Glimt/Rosenborg; scriptet venter nu på det lazy-hentede sprog). IndexNow: `public/<nøgle>.txt` + `scripts/indexnow.ts` (kør efter udgivelser med nye url'er).
- 2026-11-07 – SEO-guider: `scripts/seo/guides.ts` (download, Bosman, skjulte egenskaber, CA/PA, bedste hold at styre, tips, gratis managerspil i browseren + indeks /cm-01-02-guides/) med tal fra `buildDb` (`kept`, `clubSum`). NAV: Tactics → Guides. Forsidens statiske tekst linker til guider og sprogsider.
- 2026-11-07 – SEO på 9 sprog: `scripts/seo/i18n.ts` (landingssider /da/spil-cm-01-02-online/, /sv/, /no/, /de/, /es/, /fr/, /it/, /pt/, /tr/ – håndskrevne tekster, hreflang til hinanden og /play-cm-01-02-online/ = en + x-default). Listen `legends` (kultspillerne i cult-players.json-rækkefølge, `DbConf.cult`). Sprogmapperne står i SW globIgnores/denylist og .gitignore.
- 2026-11-07 – SEO-databasesider: `scripts/seo/db.ts` (`buildDb` pr. database: createGame for værdier, egenskaber fra world.ratings – 0 = genereret, vises i kursiv med *), 2001/02-ligaer med datidens navne (`ERA_2001`), stadionfoto kun når billedet er af det stadion (pakken bruger Emirates for Highbury), arbejdstilladelse via `EU_EEA` (eksporteret fra rules2001). `setLogoData` i logos.ts. De gamle guider er fjernet fra git (bygges i prebuild). tests/seo.test.ts.
- 2026-11-07 – `playerInterest` (transfers.ts): omdømmegrænsen brugte attrs[41] (tilpasningsevne) – nu `24 − (ambition − 10) × 1,2 (+4 ved 30+, +10 ved 32+)` (*estimeret*); 'happy' bruger `A.loyalty`. Herfølge (rep 60) kan nu hente 2 af verdens 40 bedste (før 8), Man Utd/Real 32-38. multiplayer-testens turgrænse 200 → 300 (simuleringen tager en anden vej).
- 2026-11-07 – Fejllog: `src/online/errors.ts` (window error/unhandledrejection + `ErrorBoundary` i main.tsx; kun på det rigtige site, højst 3 pr. besked/20 pr. side) → api/notify.ts op `error` (err:list + err:{sha1(besked|første kodelinje)} med count/first/last/ver) → admin-fanen Errors (op `errors`, `error-delete`).
- 2026-11-07 – Svensk (`sv`) og norsk bokmål (`nb`): `src/i18n/sv.ts`/`nb.ts` (6.109 nøgler, oversat af Claude fra dansk, lazy), `scripts/match-texts-i18n/sv.json`/`nb.json` (kommentaren), Lang-typen, LANGS, LOCALE, UNITS, LangMenu-flag, LANG_NATION, nations.ts UK-navne, cup-navne i comps.ts, login-/opdateringsmails. Valuta SEK (11,1) og NOK (11,6) *estimeret*, sprogets standard. Nye nøgler: læg dem også i sv/nb (ellers engelsk).
- 2026-11-07 – Reservehold: `splitReserves(cid)` (reserves.ts; `FIRST_TEAM` 25, mindst 2 GK) i newgame (alle synlige klubber), seasonRollover (AI-klubber) og engangsrettelsen `reserveSplit` i save.ts (springer klubber med egne reserver over; renser g.tactic). `promoteIfShort` i tacticFor (AI) holder 18 ledige på førsteholdet. match-stats: mål 2,79.
- 2026-11-07 – Opdateringsmails: `api/_lib/mail.ts` (news:subs/unsubs/prompt/sent/secret, afmeldingslink med HMAC, Resend-batch med
  List-Unsubscribe), account.ts ops `news` (login krævet), `prompt` (tællere), `unsub` (GET-side + POST one-click). Admin: fanen
  E-mail (`MailTab`; op `mail`, `mail-preview`, `mail-send` med test = NOTIFY_EMAIL). Spillet: `useNewsPrompt`/`NewsPrompt` i Login.tsx
  (efter `g.manager.history.length >= 1`, ikke fællesspil/kamp; localStorage `cm0102.newsPrompt` yes/no/later:<sæsoner>), samtykke er et
  separat flueben (ikke forvalgt), `NewsToggle` i AccountBar. e2e: `cm0102.forceLogin` (kun DEV) + efterlignet /api/account.
- 2026-11-07 – Valutaer: `Currency` + BRL (6,2) og TRY (46) (*estimerede* faste kurser), sprogets standard pt → BRL (oversættelsen er pt-BR), tr → TRY. Klassisk Game Settings viser kun symbolerne. tests/currency.test.ts.
- 2026-11-07 – Klubpakker: `SkinPack.club` (skin-create `club`, admin:skin med kun `club` retter feltet), `loadClubPacks`/`clubPackUrl`/`normClub` i backgrounds.ts (pakker uden felt matches på titlen; tomt felt = almindelig pakke) – `clubBgUrl` og hjemmekampe (`homePack` i Shell) bruger dem først. tests/clubPacks.test.ts. "Om spillet" nævner ikke længere CM3 (motoren er vores egen efter CM 01/02).
- 2026-11-07 – `screenBackground` returnerer null ved en valgt fællesskabspakke (`bgPack()`), så `backgroundUrl` viser pakken (før blev pakken altid overtrumfet af skærmbillederne). Kampdagens stadion går stadig først.
- 2026-11-07 – Admin `unrank` fjerner nu karrieren fra ALLE lister (lb:career + sæsonens medlemmer `<career>:<sæson>` fra lb:season/lb:month:*/lb:league:*, fundet via `sub:<career>:*`) og lægger den i `lb:blocked` – rank.ts submit springer blokerede karrierer over. ✕ pr. række i Overview → Top careers.
- 2026-11-07 – Team Selection (selectionProblems i Shell): OK → `{ name: 'squad' }` (før taktikken). `.cx-dlg` starter ved 144 px på skrivebordet (sidebjælkens bredde; før 112 px, så menuen blev skåret af). e2e tjekker begge.
- 2026-11-07 – Designerens "CM0102 Reborn Design Kit" (zip i ejerens Overførsler; nyhedsskærm + tokens): blokken "CM0102 Reborn
  Design Kit" sidst i classic.css (farver/affasninger fra design-tokens.json, `--tb` = titlens klubfarve sat i Hub, nyhedsliste 5 × 24,4 px
  med grå webkit-rullebjælke – NB: `scrollbar-color` slår `::-webkit-scrollbar` fra i Chrome), "Filter :" = fritekst i Inbox.tsx,
  fotoet næsten uden slør. Fontvalget `original` (CM0102Text/CM0102Heading via `local()` – Eras Demi ITC og Handel Gothic BT er
  kommercielle; fontfilerne er IKKE lagt i public/ uden ejerens ja). Skærmbilleder til designeren: ~/Downloads/CM0102-skaermbilleder-til-designer.zip.
- 2026-11-07 – Løbepile som i CM 01/02 (målt i originalen): `PlayerInstructions.run` (gitterpunkt), `runTarget` i tactics.ts
  (nærmeste punkt i GRID_X×GRID_Y, også skråt; samme punkt + tydeligt træk = ét trin; < 4 = fjern). Pilen hører til pladsen (bytter
  man to spillere på banen, bliver pilen). Motoren: med bold går spilleren mod pilen, frem = runs 2 (*estimeret*). TacticsClassic:
  højre-træk via pointer-events, højreklik uden træk = menu (touchpad). Listen: `swapPlayers` (klik/træk bænk ↔ de 11).
  Kampens taktik (OppTactics): samme pile via `ui/screens/runs.tsx` (useRunDrag/RunArrows), listen i `cxRows`-rækkefølge (originalen:
  udskiftede grå "sub N", indskiftede hvide med orange "on N" på bænkpladsen). I originalen kræver træk fra listen at knappen holdes.
  cmctl: `rdrag`, `down/to/up`, browservinduer udelukkes (en Chrome-fane hed også "Championship Manager 01/02").
- 2026-11-07 – Træthed med rules 'original': `ORIG_FATIGUE` 0,7 i tickFatigue (målt i originalen: Man Utd-Blackburn 18/9-2002,
  markspillere 97 → 91 % ved pausen → ~80 % ved slutfløjt). match-stats.ts: kondition ved slutfløjt 78 → 84 %, AI-udskiftninger
  3,2 → 1,3, mål 2,84 med `ORIGINAL.finish` 1,33 → 1,27. Pause/slutfløjt: CxOverview `quiet`; MatchEvent.pen (pen foran minuttet).
- 2026-11-07 – Admin New careers: POST op `nc-delete` (vids eller at+manager; omskriver nc:list og trækker fra nc:total/nc:d:*), knappen "Remove my careers" (denne browsers `cm0102.visitor`) og ✕ pr. række. Taktik: højreklik-menu for løb (`Pitch onRuns`).
- 2026-11-07 – `Staff.coachAreas` (action coachAreas, `CoachesPanel`): weeklyDevelopment bruger kun trænerne for programmets område (`AREA_OF`), når klubben har fordelt dem – ellers som før.
- 2026-11-07 – `repairInjuryWave` i upgradeLoaded (save.ts, `g.fixes` = kørte engangsrettelser). Reserver (`p.reserves`) filtreres fra
  ClassicFirstSquad og ClassicTactics. UEFA-præfiks i Competitions-menuen. Hall of Fame: `ClassicHallOfFame` (rute ranking i retro).
- 2026-11-07 – Turneringslogoer: `scripts/build-comp-badges.py` (TheSportsDB-id'er → logos.json `comps`, nøgle = rigtigt navn fra
  `realCompName` eller CL/UEFA/UECL/wc/euro), `compLogoUrl`, `CompBadge` i kampens sidebjælke (MatchSide.comp). Jobtilbud: `JobOfferPanel`
  (TransferStatusClassic) via Respond i indbakken; Job Information bruger `g.manager.nation` og 'all' uden klub.
- 2026-11-07 – Originalens kamplyde: `scripts/build-match-sounds.py` (ejerens …/match_sounds/lyde → public/sounds/*.m4a, AAC 40 kbit/s,
  5,4 MB; ikke de 10 ubrugte eller intro), build-match-texts.py lægger variantens lyd i række[5] (række[4] = rapport eller 0).
  `originalSounds`/`lineSounds` vælger samme variant som teksten; matchSound.ts afspiller samples (prio: mål 3 > fløjt/kort 2 >
  normal 1 > spark 0; lange lyde afløser hinanden, `chant` i eget lag). SW cacher /sounds/ ved kørsel.
- 2026-11-07 – Nations & Clubs: rute `nations` (`ClassicNations`, route-state nctab/ncreg/ncnat); menuens verdensdele og League → land åbner den. REGIONS/regionOfNation eksporteres fra classicOptions.
- 2026-11-07 – Klubhistorik: `game/clubHistory.ts` (`seasonRec(cid)` af kampprogrammet; `storeSeasonRecords` i prune() før
  g.fixtures ryddes → `Club.seasonRecs[sæson]`, kun menneskeklubber). Skærm `ClassicClubHistory` (rute `clubhistory`, knappen History ▸).
  GOAL!-blink: `L.goalTeam` → CSS-variablerne --g1/--g2 (klubbens farver); 'own-goal' tæller nu som mål (cls 'goal').
- 2026-11-07 – v0.18.0: dagens senere punkter (kampdag, transfers, lyd, baggrunde …) flyttet fra 0.17.0 til en ny version, så spillerne ser dem som nye.
- 2026-11-07 – Spillerfejl: kamptaktikkens Ok skriver nu holdinstruktioner/formation/skytter/anfører tilbage til `g.tactic` (ikke
  udskiftninger). `TeamInstrDialog` eksporteres fra Match.tsx og bruges også af Tactics → Team Instructions i TacticsClassic.
  CxOverview `reds` (røde kort under holdet).
- 2026-11-07 – `game/reserves.ts` (reservesDaily fra newDay, onsdage i sæsonen, eget frø via hash01 – rører ikke `rng`), nyheder
  res.win/draw/loss (INFO_KEYS). `MatchResultShort.cards` ([gule, røde]) → `RefereeStats` i Competitions.tsx (karakter *estimeret*).
  Edit → Copy/Copy All/Paste i TacticsClassic (modul-variablen `clip`). Landsholdslogoer: 228 lande.
- 2026-11-07 – Baggrunde pr. skærm: `scripts/build-screen-bg.py` (Naydav's pakke, kun naydav/-mappen; klubber matches på navn/kortnavn
  med `loose`) → public/screens/*.jpg (44 MB) + public/data/screen-bg.json. `screenBackground`/`specificBackground` sidst i Shell.tsx
  (club/player → `clubBgUrl` = stadion udefra eller klubbillede; competitions/fixtures → `compBgUrl` med pakkens CM-navne;
  training/board/transfers → `miscBgUrl`; øvrige → ugens rotation). Kampdage: `matchdayBgUrl` (indefra). Sunday League kun med
  pref `cm-bg-set`=sunday. SW cacher /screens/ ved kørsel.
- 2026-11-07 – `Tactic.penOrder` (Penalty Takers, `PenaltyTakers` i TacticsClassic.tsx, route-state `tpens`): motoren `penTaker(T)` og
  startShootout sorterer efter rækkefølgen (uden penOrder: som før – ingen ekstra tilfældige tal). UEFA Coefficients: rute
  `coefficients` (`UefaCoefficients` i Competitions.tsx, koefficient *estimeret*). `compAbbr` i classic.tsx.
- 2026-11-07 – `ui/matchSound.ts` (Web Audio, ingen filer; pref `cm-match-sound`): SOUND_OF i Match.tsx (kommentar → lyd i pull,
  ikke ved Instant), tilskuerbrus via `crowdOn`. Klassisk mål: `L.goalUntil` (5,5 s blink `.cx-goal-flash`, kampen står stille).
  `classicRules()` kræver nu 2001-DB (dbKind cm0102 og år < 2020) – world.json er CM-format 2026/27 og fik før 5/3. Engelske
  turneringsnavne: `setCompEra(isOriginal2001())` i Shell; ellers LEAGUES_DA's rigtige navne (comps.ts). Valuta uden eget valg
  følger sproget (en → GBP). `.cx-sq-cols` ruller (max-height). Landsholdslogoer: `scripts/build-nation-badges.py` →
  logos.json `nations`, `NationCrest`/`nationLogoUrl`, Hub `nation` (international).
- 2026-11-07 – Slutrundedage: `intlDayResults(date)` (international.ts) – slutrundekampe spilles i newDay, så runUntil(watchDays)
  stopper med 'dayStart' (kun resultater; 'dayEnd' gælder kun klubdage) → rute `intlday` (`IntlDay` i MatchDayClassic.tsx, hub
  guldfarvet). Venues for VM-kampe har vi ikke (originalen viser stadion under hjemmeholdet).
- 2026-11-07 – Klassisk indbakke: knappen Respond (`.cx-respond`) ved en nyhed med link til et ventende bud på egen spiller →
  `IncomingBidPanel` (TransferStatusClassic.tsx, action `respond` accept/reject/counter). e2e "svar på et bud (Respond)".
- 2026-11-07 – Nyhedsbrødtekst: `bodyKey(n)` i common.tsx vælger skabelonen for både `newsBody` og `NewsBody` (før brugte
  NewsBody altid `<key>.body`, så varianter som intl.sel1.noOpp aldrig blev vist). Nye varianter: læg dem i bodyKey.
  Ægte tilstand: `originalTransferNews` (transfers.ts) → `transfer.o.<0-3>`/`transfer.oFree.<0-3>` i stedet for transferDigest.
- 2026-11-07 – Bestyrelsen: `boardStatementCodes()` (board.ts → lvl/fin/fans, grænser *estimeret*) bruges af ClassicBoard og af
  nyheden `board.update` (boardSeasonEnd, brødtekst sat sammen i newsBody). board.satisfied/disappointed sendes ikke længere.
- 2026-11-07 – Nyheder: `callUpNews(…, tour)` → `intl.tourSel` (slutrunder; brødtekst i newsBody), `names` med " & " vises som
  "A, B and C" (newsParams), `leagueManagerOfYear` (awards.ts, *estimeret*: placering mod omdømme + mesterbonus) → `award.lgManagerMe`/
  `award.lgManager` for brugerens liga ved gallaen.
- 2026-11-07 – Sæsonslut efter originalen: `fin.awarded` (finance.ts, ligapræmien som nyhed via asOwner; `place` → ordenstal og
  `comp` → compName i newsParams), `news.recovered` = "{last} resumes full training" (params last/injury; ældre nyheder får `last`
  fra navnet). `compColors` (classic.tsx): CL sort/rød, UEFA blå, resten hvid – hubs `competitions` og `matchday`
  (`matchDayComps` eksporteret fra MatchDayClassic, også brugt til kampdagens turneringsfilter).
- 2026-11-07 – Klassisk dagsrytme: `watchedDay(date)` (sim.ts; egen liga, turneringer med klubben, finaler i landet/Europa, ikke dage
  med egen kamp), `continueGame(pauseBefore)` → `{ stop: 'dayStart' }` efter newDay (dayDone=false), `runUntil({ watchDays })` →
  `'dayEnd'` når den fulgte dag er spillet. Shell (kun cmNav) viser `matchday` for begge og spiller dagen ved Continue, når
  `!g.dayDone`. Test: tests/watchedDays.test.ts + e2e "Continue Game til næste kamp". Mærket `Yel` = `yellowCount === 4`.
- 2026-11-07 – Klassisk transfer: `BidPanel` (TransferStatusClassic.tsx) = originalens budskærm; svaret kommer som nyhed (udvidet:
  `bidNow` + BidModal i svar-tilstand). `loanBlocked` (rules2001.ts, britisk klub + spiller uden for EU/EØS) → makeBid
  'transfer.loanNonEu'. Kælenavn/managernote til enhver spiller (ikke andre menneskers i fællesspil). `ClubTacticsView`
  (TacticsClassic.tsx, rute `tactics` med id ≠ egen klub) bruger `aiTactic` mod seneste modstander. `moneyFull` i i18n.
  NB: `tsc --noEmit -p .` tjekker intet (rod-tsconfig har `files: []`) – brug `-p tsconfig.app.json`.
- 2026-11-07 – Klassisk kamp mod originalen (Leeds-Man Utd spillet i ejerens karriere): `CxLiveTable` (trækker dagens andre
  resultater ud af tabellen og lægger stillingen i minuttet ind), `MatchStatsSide.throwIns/tackles/tacklesWon/headers/headersWon` og
  `PlayerMatchLine.tckA/hea/heaW/on` (motoren tæller uden at trække tilfældige tal; indkast/tacklinger *estimeret*), Free Kicks =
  modstanderens frispark + offside (passer med originalen). Match Report først efter slutfløjt med originalens rapportlinjer i datid:
  matchTexts.json-rækken har nu `[vægt, en, da, {sprog}, [rapport en, da]?]`, `originalReport`/`reportLines` vælger samme variant som
  kommentaren (`L.lines[].ci`). `MatchSide.line` = kommentaren i Shell-foden på andre faner. Kampdag: `useClassicContinue` (classic.tsx)
  lader en skærm tage Continue Game (MatchDay bladrer turneringer), titler `cl.md.res1/resN/fix1/fixN` + afternoon/evening, placering
  i ligakampe. NB: matchTexts-bundtet er nu ~150 KB gzip.
- 2026-11-07 – Landsholdsudtagelser: `planWindow` (international.ts) trækker vinduets venskabskampe 2 dage før og gemmer dem i
  `IntlState.plan`, så `callUpNews` kan sende én nyhed pr. landshold (`intl.sel1`/`intl.selN`, brødteksten vælges i `newsBody`:
  navne ≤ 3, ellers `num.N`, med/uden modstander). Klassisk indbakke: `.cx-inbox .cx-nrow` (NB: `.cx-nrow` bruges også af
  nationsskærmene med et andet grid), datoen med ordenstal på engelsk, ingen knapper (overskriften er link).
- 2026-11-07 – Kommentaren på alle 8 sprog: `scripts/match-texts-i18n/<sprog>.json` (de/es/fr/it/pt/tr, oversat af Claude, kun de 121
  begivenheder i `scripts/match-text-events.json`) flettes ind af build-match-texts.py (række = [vægt, en, da, {sprog}]). Nye
  begivenheder i MAP skal oversættes dertil. Skader: originalens knock (< 40 % = sikkert knock) eksploderede, fordi restitutionen
  (+4 + NF/4 pr. dag) var for lav → nu +9 + NF/2 (*estimeret*); mål med `scripts/injury-stats.ts` (COND=65 giver 11 skader/kamp).
  Klassisk kamp: resultattavle `classic` (kort navn, ingen minut/logo), stadion i foden (`MatchSide.venue`), halvleg uden holdsnak
  (`L.atHalf`, Re-start Match, "/ HT 0-1"). Spillersiden: `Frame` = `.cx-ruled` (12 rækker), Injuries/Contract/Transfer/History
  som originalen, `game/languages.ts` (Fluent Languages via Intl.DisplayNames), `Player.injuryLog/banLog`, `Contract.partTime`.
  AI-managere ved nyt spil skjult (`BOTS_ENABLED` i Start.tsx). tests/ai-systems: vinduestesten venter nu på et helt vindue.
- 2026-11-07 – Originalens kommentar: `scripts/build-match-texts.py` (ejerens `…/bosman-edition/app/match_texts/match_texts.json`
  → `src/ui/data/matchTexts.json`, eget bundt ~66 KB gzip), `ui/matchTexts.ts` (MAP: motorens linjetype → originalens begivenheder,
  p1/p2/other, pladsholdere; kun en/da), `commentaryText` prøver den først. Motoren: `opts.playByPlay` (kun live-kampen i klassisk)
  giver 'pl-'-linjer (afleveringer/opsnapninger/målspark) via `pbp()` – må ALDRIG trække tilfældige tal (tjek: `npx tsx
  scripts/commentary-stats.ts`), filtreres fra i rapporten. Pause/taktik venter på DEAD_BALL; `cm-cx-speed` (localStorage);
  mellemrum = skjult `[data-space]`-knap. `g.lastMatchTactic` (gemmes i done()) → `LastMatchView`, Shell-fod Back/Next ved `lastView`.
- 2026-11-07 – v0.17.0. Klassisk kamptaktik efter originalen: `TeamInstrDialog` (grøn boks, TI_CHOICES, ◂-lister), `Tactic.freeKicksR/
  cornersR` (motoren bruger dem fra højre side), faste pladser `snapSlot`/`slotTaken` i game/tactics.ts, Cancel/Ok i Shells fod ved
  `matchSide.s.editing`, `L.wantTactics` (taktikken åbner ved DEAD_BALL-linjer, højst 3 min.), askConfirm `title`, `askNotice` +
  `selectionProblems` (Team Selection i Shell). Start.tsx: spiltilstanden under udseendet (LookPicker `onPick`). Last Match = taktikken
  ved kampstart og Edit-menuens indhold er *estimeret*.
- 2026-11-06 – Landshold: `IntlState.qual` (startQualification 20/8 i ulige år, qualRound i vinduerne, pladser pr. verdensdel
  *estimeret*), `cont` (afcon jan. lige år, copa/asian juli år ≡ 0 mod 3 fra 2004; 16/8/4 hold), U21 (`u21Squad`, kind 'u21').
  NB: et hold uden målmand får MatchSim til at hænge/crashe – nationStrength og u21Squad kræver en GK; 10-mands-reglen i
  `injure` gælder kun hold med aiSubs=false og aldrig GK. `isInternational` → Int. `jobRole` → stab ved pension.
- 2026-11-06 – Klassisk spillerside: TitleMenu `playerId` (holdkammerater), Set Role At Club i NegotiationClassic (`expectedStatus`,
  `Player.jobRole` – bruges ikke af motoren endnu), `ContractClauses.signOn` (signOnDemand *estimeret*, betales ved underskrift,
  kræves i renewContract), `Player.reserves` (available() = false, action reserves, mærke Res), NotePanel.
- 2026-11-06 – Klassisk kamptaktik: `OppTactics` med draft/setDraft/base (LiveMatch `draft`, `live.baseTactic`), sidebjælken
  `editing` → Ok (sim.setTactic)/Cancel. `aggText`, tilskuere via estimateGate, hastigheder 8/4/2/1/0,6/0,35. `authentic()` kræver
  nu data-skin='retro' (Node: altid sand). NB: klassen `.cx-opt` er tekstvalg – Game Options-knappen hedder `.cx-gopt`.
- 2026-11-06 – Ferie (klassisk managermenu): `HolidayPanel` i Shell.tsx, `manager.holiday` (HolidaySettings), `holidayDaily` i sim.ts
  (afvis/accepter bud, søg job i større klubber). Varer til klik på bjælken + "Return from holiday ?" (`onHolidayRef` i Shell, højst 365 dage). `--cx-photo` sættes på :root, så `.cx-dlg` har baggrund.
- 2026-11-06 – Klassisk Action: actions `nickname` (Player.realName gemmer det rigtige navn) og `staffReport` (nyheder staffrep.*,
  oversat i newsParams), `setCompareSlot` i ui/compare.ts, NicknamePanel/StaffReportPanel i PlayerClassic.tsx.
- 2026-11-06 – Klassisk kontraktforlængelse: action `renewLater` → `g.pendingRenewals`, besvares i `answerPendingRenewals` (sim.ts
  dagligt; nyheder contract.offerRejected/offerBudget). Admin New careers: kolonnen Mode (notify sender `mode`) i stedet for Challenge.
- 2026-11-06 – Klassisk kampskærm: Cx*-komponenter sidst i Match.tsx (cxRows, CxMatchStats, CxZones via `live.zones`, CxReport,
  CxTeamStats, CxRatings, CxScores); ingen Head i klassisk; sidebjælkens `cont` → done → `matchday` (Evening Results, a/p i
  MatchDayClassic). e2e klikker `.cx-side .cx-continue` ved slutfløjt.
- 2026-11-06 – Klassisk kamptaktik: `OppTactics` i Match.tsx (begge hold; `editable` = eget hold, træk udskifter ↔ spiller →
  `sim.substitute`). Scoreboard skjules på taktikfanerne. Mangler: View-kolonner, højreklik-løb, Penalty Takers, Load/Save.
- 2026-11-06 – Klassisk kampdag: Shell viser "Hjem v Ude" i datoboksen ved `pendingFixture`, Continue → askConfirm(head) →
  match (ingen PreMatch i klassisk, undtagen online). LiveMatch `classic`/`waiting` (`live.kicked`), sidebjælken via
  `useClassicMatchSide` (classic.tsx) → Shell. Faner: Overview, Stats, Ratings, Scores, Commentary, Table + `oppTactics`.
  e2e: klassisk kamp = bekræft (.cx-confirm) → Kick Off Match → tasten E.
- 2026-11-06 – Klassisk = originalens skærme: board.ts `meetBoard`/`faRequest` (MEET_BOARD, FA_REQUESTS, actions meetBoard/
  faRequest, også i authentic), `ClassicBoard`+`MeetPanel`, `NegotiationClassic.tsx` (Offer Contract), confirm.tsx klassisk
  helskærm, `useClassicDialog()` gør Continue Game grå (brug den i alle bokse), `.cx-opt` (grå/hvid tekstvalg), `.cx-dlg`.
  Fælles CSS sidst i classic.css giver Select/panel/grid/kv originalens stil. Moderne funktioner skjules i klassisk med
  `isRetro() || authentic()` (Finance, Scouting-prøvespillere, PlayerClassic-samtale/stjerner/udvikling).
- 2026-11-06 – v0.16.0. Klassisk: `CompetitionsMenu` (classicOptions.tsx) i sidebjælken med undermenuer – `DropItem` har nu
  `{ sub: DropItem[] }` (▸, åbnes ved hover, fast placeret). International fodbold klassisk (`ClassicInternational`): cx-tbl
  med blå rækkeknapper, Past winners pr. turnering (`ihist`, PastFinal.t = nr. 3), gylden titelbjælke.
- 2026-11-06 – Klassisk landshold (`ClassicNationTeam` i International.tsx): hub `international` med `colors` (NATION_COLORS i
  classic.tsx), truppen via `ClassicClubSquad cid={0} players={…}`.
- 2026-11-06 – Landshold efter ejerens `…/bosman-edition/app/national_teams/NATIONAL_TEAMS.md`: `scripts/build-national.py` →
  `scripts/national-original.json` → `world-original.json.nationalTeams` (stadion, FIFA-koefficient, landstræner, titler,
  slutrunder ≤ 2001). `IntlState.info/past/fifa`, `fifaRanking` (Elo, *estimeret*), landstræner: `national.picks`
  (selectNationalSquad 20-24), fyring ved form ≤ 3 point i 5 kampe (*estimeret*), nyheder intl.p.*. B/U21-hold ikke lavet.
- 2026-11-06 – Spiltilstand `options.mode` ('authentic' | 'extended', NewGameOptions.mode, action setMode; authentic sætter
  rules 'classic'). `authentic()`/`extended()` i rules.ts. Gates: sim.ts newDay/userMatchResult, actions.ts `EXTENDED_ONLY` +
  interact kun warning/fine/fineHeavy/drop, VAR, FFP, startAuction, UI (TeamTalk, FirstDay, AiArticle, BoardAsks, CampPanel,
  Report-analyse/xG, Match-xG, billetpanel). Nye ekstra funktioner: spørg `extended()`. Test: tests/authentic.test.ts.
  `nationRoute` → `{ name: 'international', id: nation }` (landsholdets side `NationTeam`), `Nat` er klikbar.
- 2026-11-06 – Landshold (`src/game/international.ts`, begge databaser): vinduer 5/9, 9/10, 13/11, 26/3 (venskabskampe for de
  64 stærkeste), VM (år ≡ 2 mod 4; 2002 = de rigtige grupper) og EM (år ≡ 0 mod 4) fra 1. juni, kampene i MatchSim med de
  23 bedste; caps/intGoals/skader. `GameState.intl`, skærm `international`. Landstrænerjob: `manager.national`/`nationalOffer`, `nationalOffers` (10/7 og 2/1, omdømme 55+), actions nationalOffer/resignNational.
- 2026-11-06 – rules2001.ts (kun original DB): `recallLoan` (28 dage, *estimeret*), `awolMonthly` (skade-key 'awol'),
  `boardEventsSeason` (cash injection/PLC/overtagelse). Test: tests/rules2001.test.ts. Bemærk: rules2001 må IKKE importere
  newgame (cirkulær import via scouting/transfers gav TDZ-fejl).
- 2026-11-06 – Spejdere efter ejerens `…/bosman-edition/app/scouts/SCOUTS.md` (alle databaser): ScoutAssignment-typerne club,
  nextOpp, region, youth; `startScoutAssignment` (nyhed scout.started), scout.update/doneNone/doneOne/clubDone/oppReport,
  `scoutReport` (originalens 12 domme `scout.v.1-12`, ctx, styrke/evne/svaghed, arbejdstilladelse kun original DB – sættes
  sammen i newsParams), scout.spotted, kontraktpåmindelser, STAFF_LIMITS.scout 7, filter `scouted` + Sct. Test: tests/scouts.test.ts.
- 2026-11-06 – 2001-regler kun for original DB i `src/game/rules2001.ts` (`isOriginal2001`). Arbejdstilladelse: britisk klub +
  spiller uden for EU/EØS → `playerInterest` = 'permit' medmindre 15+ landskampe, omdømme 70+ eller 5+ kampe og CA 140+ (*estimeret*).
- 2026-11-06 – Motorplanens trin 8-9: `knockCheck` (`KNOCK_K` 1,4) og `aiManageOriginal` (5/15-minutters spærrer, "knackered"),
  kun med rules 'original'. match-stats.ts: SUBS=3 for 2001-reglerne. Trin 10 (skudresultat m.m.) er valgfrit og ikke lavet.
- 2026-11-06 – Motorplanens trin 5-7 (tillægstid `DEAD_BALL_K` 1,55, træthed med alder, pause efter Natural Fitness) kun
  med rules 'original'; ORIGINAL.finish 1,4 → 1,33 (mål 2,84-2,88). original-lab måler ikke længere kort (rapporter gemmes
  ikke for AI-kampe) – brug match-stats.ts med REF=1.
- 2026-11-06 – Motorplanens trin 4: `MatchSim.originalCard` (rules 'original'), ORIGINAL = { …, cards: 0,11 (andel af
  korttyper), rules: 'original' }, `HARD_SHARE` 0,03. match-stats.ts: REF=1/RULES/CARDS som miljøvariabler.
- 2026-11-06 – Regens: `g.regenQueue` (RegenSeed) fyldes ved pension, `spawnRegen` i youthIntake (marts) arver positioner,
  egenskabsprofil og skjulte egenskaber, nyhed `youth.regen`. Stjerner: `attrAbility` (CA ≈ 27 + 6,7 × roleScore) løfter
  evnen, når egenskaberne er bedre end CA (potentiale +½ løft). PA -1 = 100-150, -2 = 150-200 bekræftet (champman0102.net t=5715).
- 2026-11-06 – Motorplanens trin 3 (dommeren): `officials` i world-JSON (parser + build), `GameState.officials`,
  `refereeFor` vælger hjemmelandets dommere og strenghed via `refereeFactor(Discipline)`. ORIGINAL.cards 0,44. Se docs/ENGINE.md.
- 2026-11-06 – Stjerner for ukendte spillere: `scoutStars` lægger usikkerheden symmetrisk om den sande værdi, og `Stars`
  fylder op til midten (spejderens bud). Før var de fyldte stjerner intervallets bund → ukendte spillere så for dårlige ud.
- 2026-11-06 – `Crest` uden logo returnerer intet (ejerens ønske: ingen farvet firkant/"kit" som reserve).
- 2026-11-06 – v0.15.0. Forbedringer efter 5-sæsoners testen: udbytte ved sæsonstart (`lastDividend`, buffer 60 % af
  omsætningen, halvdelen af overskydende saldo), AI-fornyelser efter spilletid, `freeAgentDrift` (2/9 og 2/2, kun det
  puljen er over 6 %), regens (`spawnRegen` ved pension af PA≥120), ung målmand i `aiFillSquads`, nyhedsloft 700.
  `scripts/compat.mts` indlæser gamle saves (testet med gårsdagens kode: OK). Trupperne falder fra ~36 (databasens
  reserver) til ~28 i snit – det er tilsigtet.
- 2026-11-06 – 5-sæsoners test af alle fire kombinationer (2026/27 + 01/02 × moderne/klassisk): fyring gav blank skærm
  (FirstDay.tsx uden klub) – rettet; "Min klub" uden klub → `NoClub`. Skjulte klubber: ingen ungdomsårgang, ingen
  lejeaftaler (loanSuitors/aiBidsForListed). Frie agenter, ingen vil have, går på pension (retirements). Nu 0 problemer.
- 2026-11-06 – Legender fjernet i 3.9.68 hentes fra 3.9.65 (`scripts/legacy-players.json`, efternavn+fødselsdato; kræver
  `.orig-db/Original-3.9.65-Database-Swedish_fixed` lokalt): Tó Madeira (Gouveia), id 8.000.000 + 3.9.65-id. Kultlisten
  matcher nu også hele navnet (kælenavne står som efternavn uden fornavn, fx "João Paiva"). Marajó, Tallan Martin,
  Georcelin m.fl. findes kun i 3.9.60, som vi ikke har.
- 2026-11-06 – Nyheder fra CM 01/02: `docs/NEWS.md` (+ `docs/news-map.json`) kortlægger originalens 523 overskrifter mod vores
  `addNews`-nøgler (188 dækket, 175 lette, 81 kræver mekanik, 79 irrelevante). Bygget: `ban.*`, `comp.*` (tieNews,
  createFinal, gruppespil, playoff, kvalificeret, op/ned-marginer), `media.preview.*`, `fans.mood*`, transferliste,
  lejeslut, `board.financialMess` (`Club.negMonths`), dyre køb/stjernesalg, debut. Parametret `round` (stage-kode)
  oversættes i newsParams for `comp.*`. Nye nyheder til en klub: `asOwner(club, () => addNews(...))`.
- 2026-11-06 – Navnesøgning `src/ui/search.ts` (`nameQuery`: alle ord, ingen accenter, h ignoreres) i Find, Transfers, editor,
  draft. SW: world-original.json er nu NetworkFirst (StaleWhileRevalidate gav første nye spil efter en opdatering den gamle DB).
- 2026-11-06 – Originalens økonomi fra databasen (ejerens Bosman-projekt, `…/cm-01-02-bosman-edition/app/finances/README.md`):
  parseren læser ugeløn (staff.dat 78, playerField `wage`, £) og `clubFinance` [saldo club.dat 101, gns. tilskuere 115,
  træningsanlæg 127]. Nye spil med original DB: løn/saldo/anlæg direkte fra databasen (£→€ /0,86), lønkurve
  `econ.wageFit` (log løn = a[liga] + b·log værdi + c·klubomdømme, tilpasset ved spilstart) til nye kontrakter,
  indtægtsfaktor `econ.income` (`ORIGINAL_INCOME` 0,55 → løn ≈ 60 % af omsætningen som PL 2001/02) via `econIncome()`.
  Moderne database: ingen `econ` (tests/originalEconomy.test.ts). Spillerværdierne venter stadig på Player Search-prints.
- 2026-11-06 – Kontraktforlængelse (fejlrapport #1, De Bruyne): `renewalExpiry` i transfers.ts – sep-jun regnes årene fra
  næste sæson, jul-aug tæller den startende sæson, aldrig kortere end nu (tests/renewal.test.ts).
- 2026-11-06 – Database-editor (trin 1): startmenuen → Editor (`src/ui/Editor.tsx`). "Min database" = diff oven på
  original/moderne (`game/dbEdit.ts`: `CustomDb` med `players`/`clubs`/`added`, `applyDb`, `sanitizeDb` for importerede
  filer), gemt i IndexedDB (`ui/customDb.ts`, nøgle `cm-dbs`) og som `.cmdb.json`. Vælges ved nyt spil som
  `custom:<id>`. Nye spillere har id fra `NEW_ID0` (9.000.000). Klubsaldo/omdømme via `WorldData.clubBalance`/
  `clubRepEdited` i newgame.ts. Test: tests/dbEdit.test.ts + editor-flow i e2e. Næste trin: deling i hubben, editor i
  kørende spil.
- 2026-11-06 – Original database udvidet (18.7k → 35k spillere): parseren har `allClubs`/`maxTiers` (kun i
  build-cm-data.mts; browserens egen import er uændret). Klubber uden for de spilbare ligaer kommer med, hvis de har en
  spiller med PA -2/≥150, CA ≥120, PA -1 og ≤21 år, eller står i `scripts/cult-players.json` (133 kultspillere fra
  fansenes lister, research 6/11). De ligger i skjulte ligaer (`hidden: true`, tier 9, id `H…`): spilles aldrig, kan
  ikke vælges ved start, ingen jobs, ingen AI-indkøb/opfyldning, højst 16 spillere pr. klub. England/Skotland 4 rækker,
  Holland/Portugal/Argentina/Mexico/Norge 2. Tó Madeira m.fl. findes kun i 3.9.60, ikke i 3.9.68. Ydelse: `ageOn` på
  strenge, `loanedOutWages`, stab pr. klub i `weeklyDevelopment` (sæson 15 s med original DB, 8 s moderne).
- 2026-11-06 – Tilfældigt PA som i originalen: `paRaw` -2 = 150-200, -1 = 100-150, rullet i newgame.ts pr. spil
  (tests/potential.test.ts). Værdierne i 2001-priser bygger på databasefeltet (byte 82), som IKKE er det, originalen
  viser (Totti 54 mio. i feltet, £18 mio. i spillet) – kurven skal tilpasses originalens viste værdier (Prints).
- 2026-11-05 – SEO/AI-søgning: 7 statiske guides med data fra databaserne, llms.txt, sitemap med lastmod, crawlbar
  forside. `paRaw` (originalens -1/-2 = tilfældigt PA) gemmes i ratings, bruges kun af guiden indtil videre.
- 2026-11-05 – Admin "New careers": kolonnen Progress (sæson nr., spildato, ny klub, ligaplacering). Pulsen sender
  `prog` (gid, dato, klub, placering) → Redis-hash `prog`; karrieren gemmer `gid`/`start` ved start. Kun nye karrierer.
- 2026-11-05 – Admin "New careers": land (flag) pr. karriere fra Vercels `x-vercel-ip-country` (kun landekoden gemmes,
  ikke IP'en) og en landeoversigt. Gælder karrierer startet herfra.
- 2026-11-05 – Squad Numbers: `Player.number`, læst fra CM-databaserne (byte 4 i spillerposten, felt `number` i
  world-JSON). `setClub` giver nyt nummer ved klubskifte (`pickNumber`), `ensureNumbers` gør dem unikke (nyt spil og
  ved indlæsning). Action `squadNumber` bytter med holdkammeraten. Skærm `SquadNumbers.tsx`. Test: tests/squadNumbers.test.ts.
- 2026-11-05 – Moderne udseende: baggrundsfotos (`.main.mbg`, `--m-photo`, pref `cm-modern-bg`) og stadion på kampdage
  (`mbg-stadium`, samme pref `cm-stadium-bg` som klassisk). Begge kan slås fra i Options.
- 2026-11-05 – 2D-opgradering: ShotRecord har `save` (hold/parry/spill/corner), `blocker`, `og`, `setup`/`setupBy`
  (layoff, knockdown, lowcross, longthrow, shortcorner, edge – kun til passende skudtyper, `SETUP_KINDS`), og
  highlights `closedDown`. Pitch2D tegner dem (`reboundFrames`, `closedDownFrames`). Moderne: stadionfoto i
  kampkortet (`useStadiumPhoto` i Match.tsx).
- 2026-11-05 – Stadionbaggrunde på kampdage (matchday/match/report = hjemmeholdets stadion, ikke finaler): Naydav's
  CM0102 Background Image Pack (credit i CommunityHub), konverteret med `scripts/build-stadium-bg.py` → `public/stadiums/*.jpg`
  + `public/data/stadium-bg.json` (stadionnavn → billeder). Klubbernes rigtige stadionnavne læses nu fra stadium.dat
  (byte 4, 51 tegn); gemte spil rettes ved indlæsning (`repairStadiums`). Indstilling `cm-stadium-bg`.
- 2026-11-05 – Klassisk kamp: målscorere i Match Overview, Next → Continue ved slutfløjt (`useClassicNext` i classic.tsx –
  en skærm kan overtage Next-knappen). 2D: mål/annulleret mål vælges før andre skud i samme opdatering. Turneringsvælgeren
  virker, når ruten har et id.
- 2026-11-05 – Logoer for engelske klubber, logopakken mangler (Blackburn m.fl.): `named` i `public/data/logos.json`
  (klubnavn → TheSportsDB-url, matches på navn i `logos.ts` og går forud for pakken; bevares af build-logos.py).
  Mangler kun Wimbledon (2001/02) – AFC Wimbledon er en anden klub.
- 2026-11-05 – Ændringsloggen i spillet var ikke opdateret siden 0.11.0 (22/10): 0.12.0, 0.13.0 og 0.14.0 tilføjet.
- 2026-11-05 – Original database: forsvaret lukker chancer før skuddet (`close`/`closeSlope`, kun forsvarerens kvalitet),
  flere skud på mål (`onTarget`), tættere angreb (`squashAtt 0.45`, `finSlope 20`): 16,5 skud/10,6 på mål som originalen.
  `original-lab.ts` læste tabellen fra 1. sæson hver gang – rettet; mål altid med to frø. Se docs/ENGINE.md.
- 2026-11-05 – Original database også for kort (`cards`), hjørnespark (`corners`) og skudtælling (`countBlocked`):
  1,7 gule og 5 hjørnespark pr. kamp som i originalen. Moderne database følger stadig virkeligheden.
- 2026-11-05 – Original database: føreren slapper af ved 2+ måls forspring (`ease` i ORIGINAL-profilen) – topholdene
  vinder 2-0/2-1 som i originalen, spredningen i scorede mål 18 → 12,5. Se tabellen i docs/ENGINE.md.
- 2026-11-05 – Klassisk (fællesskabets ønske): klubbens logo i titelbjælken og fire skrifttyper (Futuristisk, Tahoma,
  Verdana, Sporty) under Game Options → Settings (`classicFont`/`titleLogo` i classicOptions.tsx).
- 2026-11-05 – Den originale database kalibreret mod det ORIGINALE CM 01/02 (en hel sæson spillet på ferie, læst med
  `scripts/original-stats.ts`): profilen `ORIGINAL` i sim.ts (afslutning, hjemmebane, `squash`), målt med
  `scripts/original-lab.ts`. Moderne database uændret. Stabsprofil med Action-menu; Funds åbner økonomien.
- 2026-11-05 – Klassisk live-kamp: fanen "Match Overview" (standard) som i CM 01/02 – kommentarbjælke i farverne på holdet
  med bolden, boldbesiddelse sidste 5 min., dommer og vejr (`CxOverview` i Match.tsx). 2D-banen er stadig en fane.
- 2026-11-05 – Discipline Player (Action): officiel advarsel eller bøde + begrundelse (`interact(pid, kind, reason)`);
  begrundelsen skal passe (rødt kort, episode, dårlig form) – ellers er straffen uretfærdig. Fritstilling: kompensation
  vises, og bestyrelsen blokerer de 5 mest værdifulde (`releaseBlocked`).
- 2026-11-05 – "Set Staff Transfer Status" (Action på egen spiller): udbudspris, status i truppen (`squadStatus`,
  game/squadStatus.ts) og udlejningsliste (`loanListed`). Status styrer, hvor hurtigt spilleren bliver sur over bænken
  (`unhappyMult` i sim.ts); "ikke nødvendig"/udlejningslistet giver AI-bud (lejebud) i `aiBidsForListed`.
- 2026-11-05 – Klassisk cup/Europa (`CupClassic.tsx`): Rounds · Results · Fixtures · Schedule + Seedings · Team Stats ·
  Player Stats · History, som i CM 01/02. Managermenuen åbner Manager Stats/Job Information/Transfers.
- 2026-11-05 – Klassisk: nationens skærme (▸ ved en klub → landet): Manager Stats (omdømme i landet), Job Information og
  Transfers pr. måned (bygget af spillernes `moves`). Bygget efter skærmbilleder af ejerens kørende CM 01/02 (se Arbejdsgang).
- 2026-11-05 – Admin "New careers": udseende (classic/modern) og online-status. Browseren sender en puls hvert 2. minut
  (`startPresence` i online/notify.ts → Redis-sættet `seen`), "Online now" = set inden for 5 minutter.
- 2026-11-05 – Ende-til-ende-test (`npm run e2e`) i CI for klassisk og moderne udseende.
- 2026-11-05 – Uafgjorte 21 → 24 %: sen kampvilje for holdet bagud (`urgency`), blødere lukning af kampe, mindre tidsspild.
  NB: `moraleMult` bages ind i spillernes værdier ved kampstart – ændringer i kampen skal gå via `urge`.
- 2026-11-05 – Banens tilstand, navngivne dommere (optakt/rapport), angrebet flytter med bolden, afgjorte kampe slapper af;
  røde kort og offside kalibreret.
- 2026-11-05 – Motoren har fået elementer fra CM 01/02 (studeret fra den installerede original): dommer, selvmål, tillægstid,
  målmandsreturer, svagt ben, lave indlæg, dødboldsvarianter, positioner efter bolden, boldfordeler/target-angriber,
  spillerordrer pr. spiller, samlet stilling i dobbeltkampe. Kalibrering pr. database (`ORIGINAL_FINISH`). Se docs/ENGINE.md.
- 2026-11-05 – Klassisk taktik: spillernes pladser kan flyttes (træk til tom plet, eller klik spiller → klik plet), som i den moderne.
- 2026-11-05 – Matchmotoren: taktik der betyder noget (svage zoner søges, dueller mand mod mand, instruktioner med pris,
  AI læser modstanderens spillere), normaliseret zonedækning, kalibreret til 2,7 mål/44 % hjemmesejre, dagsform og
  individuel aldring. Mål med `scripts/benchmark.ts` og `scripts/tactics-lab.ts` (se docs/ENGINE.md).
- 2026-11-05 – Ingen mail ved nye karrierer længere: `api/notify.ts` logger i Redis (`nc:*`), vises i admin under "New careers".
- 2026-11-05 – `CLAUDE.md` oprettet som delt projekthukommelse.
- 2026-11-04 – Klassisk tema med CM 01/02-skærme, baggrunde og spilindstillinger; stadionkapacitet rettet.
  Senere samme dag (andre sessioner): managermenu, Find, taktik, staff search, fællesskabets hub, 8 sprog,
  konti med skygemte spil, SEO/GA, nyt domæne, CI uden GitHub Pages.
