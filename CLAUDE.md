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
  mærkes i spillet, og hæv versionen i `package.json`/`package-lock.json` ved en ny version (testet i tests/changelog.test.ts).
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
