# CM Reborn – projektnoter til Claude

Delt hukommelse for alle sessioner. **Opdatér denne fil (og den lokale memory) hver gang noget skydes live**,
og læg ændringen i samme push.

## Arbejdsgang
- Svar på dansk. Ejeren sender skærmbilleder fra CM 01/02 som spec (nogle gange som filer på skrivebordet).
- "Skyd live" = commit + push til `main`. Vercel udgiver cm0102reborn.com; GitHub Actions kører kun test og build.
- Node: `export PATH="$HOME/.local/node/bin:$PATH"`. Tjek altid `npm run build` og `npx vitest run` før push.
- `npm run e2e` (scripts/e2e.mjs) klikker igennem klassisk og moderne udseende i Chromium: alle hovedskærme, taktik
  (byt, flyt pladser, instruktioner, skift udseende) og en hel kamp. Kører også i CI. Nye skærme/knapper: udvid testen.
- Ejeren spiller originalen lokalt ("CM 01-02 Bosman Edition.app"). Claude kan selv tage billeder af vinduet med
  `screencapture -x -o -l <vindues-id>` (id via Swift `CGWindowListCopyWindowInfo`), også når det ligger bagved.
- Spillernes ændringslog: `src/ui/changelogData.ts` (da+en, nyeste først) – tilføj punkter ved hver udgivelse, der kan
  mærkes i spillet, og hæv versionen i `package.json`/`package-lock.json` ved en ny version (ny version pr. udgivelsesdag – ellers ses
  ændringerne ikke som nye i spillet) (testet i tests/changelog.test.ts).
- Langtidstest: `npx tsx scripts/soak.ts <sæsoner> <world-fil> [klub]` (motorens invarianter pr. sæson),
  `npx tsx scripts/features.ts <world-fil> [klub]` (20 funktioner gennem actions) og `node scripts/e2e-soak.mjs <modern|original>
  <moderne|klassisk> [sæsoner] [klub]` (5 sæsoner i browseren, alle skærme). Ret IKKE i `src/` mens e2e-soak kører (Vite
  genindlæser siden). Kør dem før større udgivelser.
- SEO: `scripts/build-seo.ts` (kører i `prebuild`) laver statiske guides i `public/<slug>/index.html` (wonderkids, bedste
  spillere, taktik, 2026/27, Mac/iPad, FAQ, spil online) fra world-JSON'erne + `sitemap.xml` og `llms.txt`. Forsiden har
  læsbar tekst i `#root` til crawlere uden JS. Nye guides: tilføj i `pages` og i SW-`navigateFallbackDenylist`.
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
