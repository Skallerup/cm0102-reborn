# Altid originalens logik (ejerens regel 18/11)

Spillets logik skal altid være CM 01/02's 1:1, på alle databaser og uanset tilstand. CM Reborns egne afvigelser må kun findes som valg under
Game Options. Dette dokument kortlægger, hvad `g.options.mode = 'extended'` ændrer i dag, og giver en plan i den rækkefølge, trinene kan
udgives. (Kun kortlægning: der er ikke kørt målinger.)

## 1. Kontakterne i dag

| Kontakt | Hvor | Betydning |
|---|---|---|
| `g.options.mode` | types.ts:1136, sat i `createGame` (newgame.ts:148) | **standard `'extended'`**, hvis `o.mode` mangler |
| `setMode`-handlingen | actions.ts:121/335 | skifter tilstanden midt i et spil (og sætter `rules='classic'`) |
| `authentic()` / `extended()` | rules.ts:16-20 | `mode==='authentic'` **og det klassiske tema i DOM'en** (`data-skin='retro'`; i Node/Web Worker altid sandt) |
| `cmLogic(g)` | cmPlayerData.ts:29 | `dbKind==='cm0102' && mode==='authentic'` – roden under alle originalens porte |
| `cmActive(g)` | cmPlayerData.ts:22 | `cmLogic` + database før 2020 (2001-verdenen) |
| afledte | `cmBodyOn`, `cmMarketOn`, `cmBoardLogic`, `cmRetireOn`, `cmCalendarOn`, `cmFinOn`, `cmScoutOn`, `cmDiscOn`, `cmIntlOn`, `cmCmOn`, `cmResOn`, `cmWxOn`, `cmFriendlyOn`, `cmPrerunMatchesOn`, `cmShortlistOn`, `cmEuroOn`, `cmSeasonOn` … | alle bygger på `cmActive`/`cmLogic` (+ `!g.draft` og spilstartens poster: `g.cmFitStart`, `g.cmPlan`, `g.cmBoard`, `g.cmFin`, `g.cmRet`) |
| `gridEngineOn(g)` | sim.ts:268 | kampmotoren: `cmLogic && authentic()` (+ udviklerkontakten `cm0102.engine`) |
| `g.options.rules` | rules.ts:9, `setRules` (actions.ts:333), Options.tsx:78 | 3/5 (classic) eller 5/9 (modern) udskiftninger/bænk – valgbart i det moderne Options |
| `g.options.transferWindows` | finance.ts:260/277, `setWindows` | 'classic' = intet vintervindue (kun spillets egen model) |
| `modernOn()`/`MODERN_ENABLED=false` | ui/modernFlag.ts | det moderne udseende er skjult (kun `/?modern=1`); `setSavedModern` åbner gamle udvidede spil i det moderne udseende |
| `forceMultiplayerAuthentic` | save.ts:177 | fællesspil tvinges til ægte tilstand |
| `saveKindOf` + `cmConvert.ts` | saveKind.ts, cmConvert.ts:151 | gamle spil med den originale database i udvidet tilstand ('oldOriginal') kan konverteres til ægte |

Alle tre databaser, man kan starte i dag (original 3.9.60/65/68, 2026/27 i `world.json`, egne databaser), har `dbKind='cm0102'` – så
`cmLogic` dækker allerede "alle databaser", så snart tilstanden er ægte. Kun meget gamle gemte spil (transfermarkt-databasen) mangler `dbKind`.

### Hvor tilstanden vælges
- **Nyt spil, moderne start** (`ui/Start.tsx:225/300-329`): valget "Ægte CM 01/02 / Udvidet" vises kun med `modernOn()`; ellers altid 'authentic'.
- **Nyt spil, klassisk start** (`ui/ClassicStart.tsx:284/322`): altid 'authentic'. `cmConvert.ts:103/112`: altid 'authentic'.
- **Undervejs:** temaskiftet i Settings (`classicOptions.tsx:172`) og i det moderne Options (`screens/Options.tsx:55`) kalder `setMode` (retro = ægte, ellers udvidet).
  Det moderne Options har også `setRules` og `setWindows`.
- Visning: `ui/gameInfo.ts:44`, `Admin.tsx:387/434`, `online/account.ts:150`, `online/notify.ts:28` (statistik).

## 2. Hvad 'extended' ændrer

### (a) Spillogik – skal altid være originalens (kontakten skal ignorere tilstanden)
Alt her ændrer tilstand eller trækker tilfældige tal, så det er logik:

- **Hele porten:** alt under `cmLogic`/`cmActive` (kampmotor, kalender, Europa, landshold, økonomi, transfers, kontrakter, bestyrelse/job,
  udvikling/træning/kondition/skader, spejdere/kendskab, disciplin, medier/forhold, karrierestop/regens, reserver, vejr, venskabskampe).
- **Spilstarten** (newgame.ts): originalens startdato `cmStartDate` (130), `cmRawLogic` for 2026/27 (182), `cmStartGame`-lagene (243:
  reserveposterne, de interne egenskaber, trupplan, bestyrelse, økonomi …), `rules='classic'` (148), startnyhederne (641-659: sponsortilbud
  i udvidet; ansættelse/bestyrelse/kampprogram i ægte), starttaktikken (778: bedste formation med udtagelse vs. ingen udtagelse), `options.engine='original'` (662).
- **`extended()` i motoren:** pressemøder `invitePress` (sim.ts:541/708), fans efter kamp og pr. måned `fansAfterMatch`/`fansMonthly` (542/742),
  træningslejr og prøvetræning `campDaily`/`trialsDaily` (713), lejetilbud `aiLoanOptions` (719), ugentlig transferoversigt/opsummering/spillerkontakt
  (729), `monthlyPersonality`/`monthlyWill` (742), bestyrelsesmøder `boardMeeting` (744), januar-budget `januaryBudgetTopUp` (767), FFP `ffpReview`
  (season.ts:751), sponsortilbud ved sæsonstart (season.ts:853), budkrige `startAuction` (transfers.ts:441), merchandise efter stjernekøb
  (finance.ts:379), originalens regens `originalRegens` (season.ts:305).
- **`authentic()` i motoren:** ingen VAR (sim.ts:187), `ORIGINAL_LOWER` (sim.ts:219), kampmotoren (sim.ts:269), originalens transfernyheder
  (transfers.ts:868/871/1415), forkontrakt spærrer forlængelse (transfers.ts:2297), FA-henvendelser (board.ts:902/952).
- **Spærrede handlinger** (actions.ts:183/192, `EXTENDED_ONLY`): matchTalk, teamTalk, talk, trial, camp, campCancel, sponsor, ticket, project,
  boardAsk, budgetShift, raiseBid, bidNow, rebid, press, onboard; spillersamtaler ud over warning/fine/fineHeavy/drop.
- **Valg i det moderne Options, der er logik:** `setRules` (5 udskiftninger i 2001), `setWindows` ('classic'), og selve `setMode`.
- **Fejl i dag:** `authentic()` læser DOM'ens tema. Et ægte spil i det moderne udseende kører altså udvidet logik og zonemotoren i hovedtråden,
  men originalens i Web Workeren (intet `document`). Logikken må ikke afhænge af udseendet.

### (b) Ægte CM Reborn-tilføjelser – kan blive valg under Game Options
Kun ting uden virkning på spiltilstand og tilfældighed (visning, hjælp, meta):
- Præstationer: nyheden `ach.unlocked` (achievements.ts:31) – præstationerne udregnes allerede i begge tilstande; kun nyheden er tilvalg.
- Ekstra visninger: xG og analysefanen i kamprapporten (Match.tsx:1261, Report.tsx:24-66), FirstDay-guiden, `aiArticle`, `opt.ai`-artikler,
  menupunkterne Awards/Help/koefficienter (classicOptions.tsx:118/120/325), "Vælg alle" i menuerne (classic.tsx:501-512), søgeforudindstillinger og
  realisme (TransfersClassic.tsx:166/468, classicOptions.tsx:42), hjælpetekster og "ingen data"-tekster på originalens skærme
  (`cx-empty`/`*-hint`, ca. 30 steder i src/ui).
- Udseendet (moderne/klassisk) – et rent visningsvalg, når det ikke længere styrer logikken.
- Fællesskab, konto, multiplayer-indstillinger (h2h-tid) – allerede CM Reborn-zoner.

Pressemøder, holdsnakke, træningslejr, sponsorvalg, budkrige, FFP osv. er **ikke** (b): de ændrer moral, penge og transfers. Skal de nogensinde
tilbydes igen, er det en ny "ikke-original" spilvariant, ikke et Game Options-valg i et originalt spil – anbefaling: tilbydes ikke i nye spil.

### (c) Kan ikke flyttes uden at ødelægge igangværende spil
- **Gemte spil i udvidet tilstand** mangler spilstartens poster (`cmFin`, `cmBoard`, `cmPlan`, `cmFitStart`, `cmInt`, `cmClubRep`, originalens
  dato, reserveposter …). Slås `cmLogic` til på dem, kører originalens moduler på manglende data. De skal beholde deres kodeveje.
  - Original database: konverteringen findes (`cmConvert.ts`, saveKind 'oldOriginal') – tilbydes allerede.
  - 2026/27 (`dbYear ≥ 2020`) og gamle spil uden `dbKind`: ingen konvertering – kører videre som de er.
- **Draft-ligaer** (`g.draft`): alle cm-kontakter har `!g.draft`; draft er en CM Reborn-spiltype uden original. Beholdes som de er (egen spiltype).
- **Udfordringer** (`challenge`) bruger 2026/27-databasen og den valgte tilstand – nye udfordringer starter ægte; igangværende beholdes.
- Ægte spil, der har været skiftet til udvidet og tilbage via `setMode`, har blandede poster – kan ikke repareres; behandles som deres nuværende tilstand.

## 3. Plan (i udgivelsesrækkefølge)

Princip: **`'extended'` bliver en arvet tilstand, der kun findes i gamle gemte spil.** Ingen ny kode læser den; nye spil kan ikke få den.
2001-fingeraftrykket (`scripts/perf-fingerprint.ts`, ægte tilstand, Node) går gennem præcis samme kodeveje i hvert trin – det kontrolleres
med `node scripts/measure.mjs -- npx tsx scripts/perf-fingerprint.ts …` før/efter (forventet `02ec66f5a29512d1`) og `grid-lockstep.ts`.

**Trin 1 – logikken løsrives fra udseendet (ingen adfærd i Node ændres).**
- Ny funktion i `src/game/rules.ts`: `legacyExtended(g) = g.options.mode === 'extended'` (eneste sted, der læser tilstanden) og
  `origLogic(g) = !legacyExtended(g)` – uden DOM.
- `cmLogic` (cmPlayerData.ts:29) → `g.dbKind === 'cm0102' && !legacyExtended(g)`; `gridEngineOn` (sim.ts:269) dropper `authentic()`.
- Alle `authentic()`/`extended()` i `src/game` (actions, board, sim, transfers, season, finance) og `g.options.mode`-test i achievements,
  newgame (641/643/778), saveKind skiftes til `origLogic(gs())`/`legacyExtended(gs())`.
- `authentic()` bliver et rent UI-begreb ("originalens skærme": `origLogic && klassisk udseende`) og må kun bruges i `src/ui` – test, der
  fejler, hvis `src/game` importerer det.
- Fingeraftryk: uændret (Node har intet tema; `mode==='authentic'` giver samme svar). Kun ægte spil i det moderne udseende ændrer sig
  (de får nu originalens logik i hovedtråden som i arbejderen) – rettelse af en fejl. Intet nyt spil kræves.

**Trin 2 – nye spil er altid originale.**
- `createGame` (newgame.ts:148): standard `'authentic'`; `o.mode` fjernes fra `NewGameOptions` (cmRawLogic/cmStart/cmStartGame afhænger
  så kun af databasen).
- `Start.tsx`: valget `modePicker` og `cm0102.mode` i localStorage fjernes; mode sendes ikke mere (Start.tsx:329, ClassicStart.tsx, cmConvert.ts).
- `setMode` fjernes fra handlingerne; temaskiftet (classicOptions.tsx:172, Options.tsx:55) skifter kun udseendet.
- `setRules`/`setWindows` vises kun i gamle udvidede spil (Options.tsx:76-90 bag `legacyExtended`); `rules` sættes kun af spilstarten.
- Tests/scripts uden `mode` (26 testfiler + `tests/helpers/legacySave.ts`): de, der tester den gamle model, får eksplicit `mode: 'extended'`
  (arvet tilstand), så deres forventninger ikke ændres; resten skal være grønne med originalen. `savedMode.test.ts`, `engineFlag.test.ts`,
  `cmConvert.test.ts` dækker de arvede spil.
- Fingeraftryk: uændret (scriptet sender allerede `'authentic'`). Kræver ikke nyt spil (kun nye spil berøres).

**Trin 3 – CM Reborn-valg under Game Options (gruppe (b)).**
- Ny sektion "CM Reborn" i Game Options (classicOptions.tsx / GameOptionsClassic.tsx), adskilt fra originalens punkter, gemt i
  `g.options.reborn = { achievements?, matchExtras?, helpTexts?, … }` eller localStorage (rene visningsvalg). Standard: alt fra.
- `authentic()`-tjek i UI'en for (b)-punkterne erstattes af det enkelte valg. Ingen motorændring → fingeraftryk uændret.

**Trin 4 – gamle udvidede spil.**
- Listen over gemte spil: udvidede spil mærkes "Udvidet (gammel tilstand)". Original database → konverteringsknappen (findes). 2026/27/uden
  dbKind → "Start forfra med originalens logik" (som saveKind 'modern' i dag). De kører videre via `legacyExtended`, intet tvinges.
- `setSavedModern` (state.ts:45) beholdes, så de åbnes som før.
- Senere/valgfrit: en konvertering for 2026/27 svarende til `cmConvert` (spilstartens poster fra world-cm.json) – egen opgave.

**Trin 5 – oprydning (først når ejeren vil droppe de gamle udvidede spil).**
- Kode bag `legacyExtended` (pressemøder, lejr, sponsor, budkrige, FFP, fans …) kan slettes; indtil da ligger den urørt.

### Filer pr. trin
- Trin 1: `src/game/rules.ts`, `cmPlayerData.ts`, `sim.ts`, `actions.ts`, `board.ts`, `transfers.ts`, `season.ts`, `finance.ts`, `achievements.ts`,
  `newgame.ts`, `saveKind.ts`, ny test (fx `tests/originalGate.test.ts`).
- Trin 2: `newgame.ts`, `actions.ts`, `ui/Start.tsx`, `ui/ClassicStart.tsx`, `cmConvert.ts`, `ui/classicOptions.tsx`, `ui/screens/Options.tsx`,
  testfilerne uden `mode`, `tests/helpers/legacySave.ts`, i18n `mode.*` (en+da).
- Trin 3: `ui/classicOptions.tsx`, `ui/screens/GameOptionsClassic.tsx`, de (b)-skærme, der er nævnt ovenfor, `types.ts` (options), i18n.
- Trin 4: listen over gemte spil (bruger `saveKind.ts`), i18n.

### Åbne spørgsmål (ikke tilstandsafhængige, men samme regel)
- `classicRules()` giver 5/9 på 2026/27 også i ægte tilstand (rules.ts:5-9) – originalen tager reglerne fra databasens turneringer; tjekkes mod
  exe/database som egen opgave.
- `g.m26` (2026/27-økonomien, newgame.ts:458, training.ts:121/144) og draft/udfordringer er CM Reborn-modeller uden for `mode` – hører under
  MODERN_PARITY (penge) og draft-spiltypen.
