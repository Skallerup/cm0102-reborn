# Originalens logik på 2026/27 (MODERN_PARITY)

Undersøgelse 17/11-2026 (ingen kodeændringer). Ejeren: "Kig ind i alle de ting vi har fixet og tilføjet til de originale databaser – vi bør få
dem på 2026/2027." Regel (CLAUDE.md): 2001-specifikke **tal** (priser, lønniveau, g.econ-kalibreringer) må ikke overføres; originalens **logik**
(regler, beslutninger, AI, motor) bør gælde for begge databaser, hvor dataene tillader det.

## 0. Kontakterne og hvad de bygger på (kortlagt 20/11)

Regel (CLAUDE.md "Altid som originalen", 18/11): en port gates aldrig på 2001-databasen (`cmActive`/`isOriginal2001`/`cmDatabase === 'original'`),
men på en databaseuafhængig markør sat af newgame.ts for nye spil (cmLogic + markør; ældre gemte spil uændrede). Grundprædikater: `origLogic`
(ægte tilstand), `cmLogic` = CM-format + ægte tilstand, `cmActive` = cmLogic + år < 2020 (2001-verdenen). Status = nyt 2026/27-spil i ægte tilstand.

| Kontakt (fil) | Afhænger af | Moduler | 2026/27 |
|---|---|---|---|
| `cmCalendarOn` (cmCalendar.ts) | cmActive **eller cmLogic + `g.cmCal`** (20/11) | ligaernes skemaer create_schedule/add_fixture/tv-flytningerne, pokalernes rundetabeller (cmCups.ts), Liga Cup/Charity Shield, spilstarten 0x830520 | **til (20/11)** |
| `cmEuroOn` (cmEurope.ts) | = cmCalendarOn | CL/UEFA Cup/Intertoto/Super Cup, UefaSeeding (pladser, koefficienter, euro.cfg), lodtrækningerne, Europa-flytningerne 0x5ae9d0 | **til (20/11)** – data: world-cm.json `euro` |
| `cmSeasonOn` (cmSeason.ts) | = cmCalendarOn | sæsonskiftet pr. land 0x5d5ae0 (Europa 20/6, Norge 27/11 …), kontrakter/lejer dagligt, kampene før starten | **til (20/11)** |
| `cmIntlOn` (cmIntl.ts) + 11 × `cmActive` i international.ts | kun cmActive | landsholdenes kalender, trupper, U21, slutrunder, FIFA-listen | fra – åbent punkt A |
| `cmPrerunMatchesOn` (cmPrerunMatches.ts) | kun cmActive (+ PRERUN_YEAR 2001) | forkørslens landskampe (VM-kval. Oceanien, Copa América 2001), Europas kampe dag for dag | fra – 2001-kampe (Europas kampe før starten: cmEuroCatchUp) |
| `cmCmOn` (cmContractManager.ts) | cmActive **eller cmLogic + `g.cmCmMgr`** (20/11) | CONTRACT_MANAGER: startkontrakterne 0x4c7560 (cmContractEnd), 0x4c7ac0 dagligt (computerklubbernes udløb, forlængelser, frigivelser); spillets aiRenewals/udløbet 1/7 kun uden for området | **til (20/11)** – punkt B |
| `cmMarketOn` / `cmShortlistOn` | cmLogic + `g.cmPlan` | trupplan, ønskelister, bud, svar, budskærmen | til (18/11) |
| `cmBoardLogic` / `cmBoardOn` | cmLogic + `g.cmBoard` | MANAGER_MANAGER, managerjob, bestyrelsens loft | til (landstrænerdelen kun 2001) |
| `cmMediaOn` | cmLogic + `g.cmMedia` | forhold, medier, rygter, moral, nyhedsomfang | til |
| `cmScoutLogic` / `cmScoutOn` / `cmKnowOn` | cmLogic + `g.cmScoutStart` | kendskab, SCOUT_MANAGER, spejderopgaver | til |
| `cmDiscLogic` / `cmDiscOn` | cmLogic + `g.cmDiscStart` | karantæner, appel, bøder | til |
| `cmStaffOn` | cmLogic + `g.cmStaffMem` | Staff Search, stabskontrakter, stabsskifter | til |
| `cmFinOn` | cmLogic + `g.cmFin` | finance.cpp, bonusser, Transfer Funds | til |
| `cmBodyOn` / `cmFitOn` / `cmTrainOn` | cmLogic + `g.cmFitStart` (+ `p.cmInt`) | kondition, skader, udvikling, træning | til |
| `cmResOn` / `bTeamsOn` / `cmWxOn` / `cmFriendlyOn` / `cmAwOn` / `cmRetireOn` | cmLogic + `g.cmRes`/`cmBTeams`/`cmWxTab`/`cmNationFr`/`cmAw`/`cmRet` | baggrundskampe, B-hold, vejr, venskabskampe, priser, pensioneringer | til |
| `cmPermitOn` | `g.cmWp` | arbejdstilladelser | til |
| `cmTalksOn`, `gridEngineOn` | cmLogic (+ `options.engine`) | transferforhandlingen, gittermotoren | til |
| `classicRules` (rules.ts) | `options.rules` + (dbYear < 2020 **eller `g.cmMatch`**) (20/11) | 3 udskiftninger/5 på bænken | **til (20/11)** – punkt C |
| `isOriginal2001` (rules2001.ts, season.ts, transfers.ts) | dbYear < 2020 (ikke tilstanden) | kun udvidet tilstands egne tilføjelser (udeblivelse, bestyrelsens pengebegivenheder, appel) og databasens navne/data i UI'et; afbrudt leje → `loanRecallOn` (cmLogic) | punkt D lukket (20/11) |
| `cmDatabase === 'original'` (save.ts, saveKind.ts) / `origMatch` (sim.ts) | dbYear < 2020 / original **eller `g.cmMatch`** | world-filen ved indlæsning (data); zonemotorens kampkonstanter ORIGINAL/ORIGINAL_LOWER | data (world-filen) – kampkonstanterne **til (20/11)** |
| `g.econ` (newgame.ts 17 ×, finance.ts, training.ts …) | sat kun for dbYear < 2020 | 2001-priser/lønniveau/kalibreringer | data (2001-tal – skal ikke overføres; beløb via cmMoney) |

Løse `cmActive(`-kald uden for en kontakt (agentens optælling 20/11, 84 i alt): international.ts 11 (punkt A), transfers.ts 10 (vinduerne pr. klubs
land `cmWindowClub`, inPlayedNation, interestedClubs, vinduesnyhederne – punkt E), season.ts 6 (klubomdømmet fra cm, regens, klubstatus, achievements,
fyldspillere – punkt E), cmVirtual.ts 6 (fyldspillere 0x90dc66), cmPermit.ts/cmScoutAsg.ts (2001-tabellerne – 2026 har nation7f/76), training.ts 3 og
cmValueGame.ts 2 (værdien +0x52), cmBudget.ts 3, newgame.ts 3 (markørerne, vinduesnyheden, startformationen), aiTeam.ts:345 (AI-taktik),
state.ts:306 (nyhedsfilteret), competitions.ts (split-nyheden), cmOfferCheck.ts:116, cmPlayerData.ts:830 (cmStaffStateMove), cmConvert.ts.

Åbne punkter (egne opgaver – hver kræver data/markør + måling på 2001 og 2026/27):
- **A. Landsholdene** (cmIntlOn + international.ts): originalens landsholdskalender/-trupper/slutrunder/FIFA-liste på 2026/27 – kræver databasens
  landshold (nationalTeams kun i world-original), 2026's slutrunder (VM 2026 i USA – originalen kender kun sine egne år: hvad exe'en gør med
  året 2026, skal afkodes) og FIFA_RANKINGS' data.
- **B. CONTRACT_MANAGER – lukket 20/11.** Ny markør `g.cmCmMgr` (newgame.ts, nye spil med en CM-database i ægte tilstand; `g.cmCm` er portens
  tilstand) → cmCmOn: startkontrakterne 0x4c7560 (cmContractEnd: databasens dato, trukket hvis den mangler, +52 uger hvis før [0xae2330]) og
  0x4c7ac0 dagligt for computerklubberne i de spilbare lande (cmCmScope) – forlængelsestilbud/beslutninger, udløb (type 1: bliver med den udløbne
  kontrakt), frigivelser/fri transfer, Signing On Fee (£ via cmGbp); spillets aiRenewals (150 dages udsyn) og udløbet gælder kun dem uden for
  området. Ingen nye data krævet: kontraktfelter, løn (99 %) og udløb (74 %) står allerede i world.json, omdømme/trupplan/klubstatus i
  world-cm.json (buildWantMem kørte allerede på 2026/27 for markedet). Målt (`scripts/cm-contracts-2026.ts`, frø 1, England + Danmark):
  2001-fingeraftrykket uændret (perf-fingerprint 2001-08-20 samlet 438b6c8c376734d0 før/efter – measure 85e65e4dcc00 / edbf66aa3fc5). 2026/27
  Brentford til 2/7-2027 (før 57486b34d3a2 / efter 461cfd503bd7): intet nedbrud; forlængelser 464 (kun jan–maj, spillets) → 765 (CONTRACT_MANAGER
  770 underskrifter; toppe juli 151, dec 67, jan 167, apr 181, jun 113 – samme mønster som 2001: juli 404, dec 460, jan 299, apr 217, jun 99),
  klubløse 328 (312 den 1/7) → 182 (159 frigivet af porten), 165 med udløbet kontrakt i klubben 2/7 (2001: 409); lønsum pr. uge 2/7-2027 Premier
  League £13,4M (før £12,9M), Championship £4,2M (£4,0M), Superligaen £0,54M (£0,55M) – 2001 til 2/7-2002 (5df1536fa85d): PL £7,3M, Div 1 £3,3M,
  Superligaen £0,29M (forholdet PL/Superliga 2001 25, 2026 25). Vejle til 31/12 (7a2294e18d92): 236 forlængelser, intet nedbrud. Kræver et nyt
  spil. **Rest:** de *estimerede* dele i cmContractManager.ts' hoved ([0xae2330]'s opdatering, TRANSFER_MANAGER-tjekkene) gælder nu også 2026/27.
- **C. Udskiftningsreglerne – lukket 20/11.** Originalen tager ikke tallene fra databasen: hver turnerings konstruktør sætter dem fast i koden
  (konkurrenceobjektets +0x49 = bænk, +0x4a = udskiftninger; 0x5bb100/0x48f2d0 kopierer dem til kampens +0x4d – lav nibble bænk, høj
  udskiftninger; 0x6dbac0 bruger min(+0x4d >> 4, bænkens antal)). Ny markør `g.cmMatch` (newgame.ts, nye spil med en CM-database i ægte tilstand)
  → classicRules: 2026/27 spiller 3/5 som 2001; ældre 2026/27-spil beholder 5/9. Intet valg i Game Options (standard = originalens; et moderne
  5/9-valg kan lægges dér, hvis ejeren ønsker det). **Rest:** værdierne pr. turnering er ikke porteret – konstruktørerne sætter bænk 7 (88
  steder), 5 (39), 4 (7), 6 (5) og udskiftninger 3 (57) eller 5 (2: 0x56d3ed, 0x63ad25); begge databaser bruger i dag 3/5 overalt. At porte dem
  ændrer 2001-fingeraftrykket (kræver turnering → konstruktør-afbildning og en måling mod oraklet).
- **D. isOriginal2001 / kampkonstanterne – lukket 20/11.** sim.ts' ORIGINAL/ORIGINAL_LOWER (zonemotoren: Europa uden mennesket, de ikke-aktive
  landes kampe, venskabs-/landskampe) gælder nu `origMatch()` = den originale database eller `g.cmMatch` – 2026/27 får originalens konstanter i
  stedet for MODERN (kalibreret mod virkeligheden). isOriginal2001: awolMonthly/boardEventsSeason/appealBan er udvidet tilstands egne
  tilføjelser (vender om ved cmActive – originalens modstykker er cmFine/cmFinEvents/cmDiscipline med egne markører), needsWorkPermit har
  cmPermitOn først, originalRegens har cmRetireOn, transfers.ts' cmRep-sti har !cmLogic; UI'ets setCompEra/kitBrand/compLine/'INTER' er
  databasens navne (data). "Recall from loan" (originalens strenge "… recalled from loan") → `loanRecallOn` = 2001 eller cmLogic.
  Målt 20/11: 2001-fingeraftrykket uændret (perf-fingerprint 2001-08-20 ad5335f7de084fef før/efter, measure 745ee6b414e5/8a013f7340fa).
  2026/27 til 31/12-2026, frø 1 (`scripts/cm-match-2026.ts`; measure 7431b0354952 Brentford, 90453b2a253d Leeds): 3/5, ingen nedbrud; ligaen
  (gitter) 2,77/2,79 mål, 1,93/2,07 gule, 0,13/0,19 røde, 0,54/0,58 skader pr. kamp; Europa (zone, nu ORIGINAL) 3,36/3,18 mål – 2001 Brentford
  (c7fcd1105ac4): liga 3,06 mål, 1,34 gule, 0,12 røde, 0,62 skader; Europa 3,24.
  **Rest:** recallLoan's frist (28 dage) er stadig *estimeret* (originalen: "cannot be recalled until 15th November", vinduet, samme land).
- **E. De løse cmActive-kald** i transfers.ts/season.ts/cmVirtual.ts/training.ts/cmValueGame.ts/aiTeam.ts – hver flyttes til den kontakt, modulet
  hører til (cmMarketOn, cmRetireOn, cmBodyOn …), eller en ny markør.
- **F. Kalenderens rester på 2026/27**: spilstarten 0x830520 er kun afkodet for England (Date(10, 7, år, 5)); de øvrige nøglelandes +0x2a bruger
  2001's målte dag i året. Liga Cup'en kræver de 92 ligaklubber (world.json har kun Premier League og Championship → ingen Liga Cup på 2026/27, som
  før). Forkørslens landskampe (cmPrerunMatches) er 2001-kampe.
- **G. Europas pladser fra lande uden klubber i world.json** – løst med data 20/11: world.json har kun ~24 europæiske lande, så cmEurope.ts'
  `spare()` (*afvigelse* fra 13/11) gav de manglende landes pladser til de næste klubber efter rang (England 28 af CL's 71 hold, Brentford i CL Q1,
  Italien 36 af UEFA Cup'ens 118). Nu bygger build-cm-data.mts de manglende landes klubber ind i world-cm.json (`euroClubs`: 247 klubber, 5.357
  spillere i 31 lande – landene med koefficienter uden liga i world.json, øverste klubber i euro.cfg-rækkefølgen og så omdømmet, højst 8 pr. land,
  trupper ≤ 22 spillere ≤ 40 år; en ekstra indlæsning med allClubs, så world.json er bit for bit uændret), og newgame.ts lægger dem på verdenen
  som skjulte klubber (`HE<nation>`, ingen kampe) i ægte tilstand – som originalens hukommelse. euro.cfg's klubber findes også under et andet land
  (FC Vaduz står for Liechtenstein, i databasen schweizisk). Rest (åben): Liechtenstein har ingen brugbar klub (Vaduz tages af Schweiz først;
  de fire klubber fra "Lower Division" har ingen trup), og UEFA Cup'ens 1. runde har en plads mere end båndene – de to pladser går stadig til den
  næste klub efter rang (England: 3 egne + 2). At give dem til de nærmeste lavere lande (Intertoto-reglen) ændrer 2001-fingeraftrykket (målt: 2001
  bruger også `spare()`, fordi spilstarten fjerner de skjulte klubber uden spillere i hukommelsen) – kræver en beslutning og en måling mod oraklets
  2001-deltagere.
- **H. Venskabskampe på Europa-dage**: add_fixture 0x5aa680 flytter her kun ligakampe med originalens skema (`meta.cmSched`), ikke venskabskampe
  (målt: 2–3 klubber pr. sæson med venskabskamp og CL samme dag) – 0x5abc30/0x5ab510 for de øvrige kamptyper.

## Bosman 0.7.2-tjekliste (20/11)

Bosman Edition 0.7.2 (17/11-2026) rettede fem ting for Update Team-sæsondatabaserne. Vores 2026/27 er netop sådan en database ("October 2026
Data Update"), så punkterne er gået igennem for world.json/world-cm.json (kontrollen `scripts/bosman-check-2026.ts`, frø 1 – measure d45664da3476
England, bea75e718d81 alle lande til 5/8; ffdf20d57ff3 alle lande til 30/9: 2.987 kampe, intet nedbrud, 1.483 lejede – men 425 venskabskampe
før 30/9 står uspillede, bør undersøges for sig). Bosmans egne tabeller (appens `Seasons/rules.tsv`, `clubs.tsv` – virkelighedens regler pr. sæson 2001–2027)
er CM Reborn-fremmede *virkelighedsregler*; vi følger originalens logik + databasens data ("Altid som originalen") og bruger dem kun som kontrol.

| # | Bosman 0.7.2 | Vores 2026/27 | Rettet (20/11) / rest |
|---|---|---|---|
| 4 | ~14.800 rækker turneringshistorik ét år forskudt i Update Team-filerne | Opdateringens club_comp_history.dat (14.689 rækker) følger originalens konvention (3.9.60: sæsonens slutår, PL 2000/01 = 2001; kalenderårsligaer = året) – stikprøver PL, CL, FA Cup, Serie A, La Liga, Eliteserien, Allsvenskan, MLS, Brasilien, Argentina passer med +25 år (PL 2026 Arsenal, 2025 Liverpool; Norge 2025 Viking). Fejlen var en anden: **2026/27-spil fik slet ingen databasehistorik** (compHist kun for 2001), og prisernes historik (staff_comp_history.dat) stod i databasens ur (2025/26 som "2001") | **Rettet:** world-cm.json `compHist` (74 turneringer, 5.805 rækker, år + 25) + `histNames`, nye spil i ægte tilstand → `g.cmCompHist` ("History" → Winners); `awHist` + 25 år. Rest: J1 2024 står som Sanfrecce (databasens egen fejl, ikke en forskydning); staff_history.dat (karriererne, startår) passer allerede |
| 3 | Nyt spil starter med databasens lejer, karantæner og skader | player_setup.cfg (opdateringens): 141 INJURY var porteret (MODERN_PARITY 6: 106 fundet); 8.490 LOAN var ikke med; 119 MISCONDUCT, 8 DRUGS, 6 FALSE_PASSPORT, 346 FUTURE_TRANSFER, 107 INT_RETIREMENT ikke porteret (heller ikke for 2001) | **Rettet:** LOAN-linjerne (0x7a4d24 → 0x8bf400, cmSetupLoans) også på 2026/27: build-preseason.mts finder 1.502 i world.json/euroClubs (datoerne fra 2001/02-uret + 25 år), nye spil i ægte tilstand (`g.cmCal`) – målt 1.483 lejede ved start. Rest: MISCONDUCT/DRUGS/FALSE_PASSPORT (karantænerne, 0x7a30c0's grene 0x1000/0x100/0x800 → Discipline), FUTURE_TRANSFER, INT_RETIREMENT – exe-port, rører også 2001 (3.9.68's cfg har 1 MISCONDUCT, 49 INT_RETIREMENT) |
| 1 | Hver liga spiller sin rigtige sæsons klubber, møder og datoer | Klubber: divisions-2026.json (17/11) retter 15 ligaer til 2026/27 (Serie A/B 20, Eliteserien/Allsvenskan 16, J1 20, Argentina 30, Kroatien 10, Danmarks 1./2. division 12 …). Møder: databasens runder + originalens CM_ROUND_RULES (Superliga 3 × 11, Skotland 33 + 5 split, Korea 3 runder). Datoer: originalens skema (cmLeagueSchedule), når rundetallet passer – PL, Championship, Bundesliga 1/2, Serie B, La Liga 1/2, Portugal, Holland, Belgien, Tyrkiet, Skotland, Superligaen, Rusland (kalenderår 28/3–15/11 som originalen), MLS (32 runder 21/3–5/9) | **Rettet (20/11):** originalen har ingen skabeloner pr. klubtal – hver ligaklasse har ét fast klubtal +0x3e i sin opsætning (Belgien 0x41e8b0 18, Frankrig 1 0x5bc2b0 18 i 2001 ellers 20, Italien 0x641510 18, Brasilien 0x42a480 28, J1 0x6634e0 16, Korea 0x66bba0 10, Kroatien 0x5147b0 16, DK 1. div 0x552290 16, Norge 0x7925e0 14; kun NorFirst 0x7909a0/0x790040 tæller) og ét skema; et andet klubtal i databasen afkorter/afviser ligaen dér (ikke porteret). League::create_fixtures 0x6835c0 sammenligner ikke rækker med runder: 0x68a030 går rundt efter sidste række (flag 3), og add_fixture 0x5aa680 flytter de genbrugte datoer. Nu bruges klassens skema med det (competitions.ts setupLeaguePort, g.cmCal). Målt (`scripts/cm-leagues-2026.ts`, alle lande, frø 1; measure 8f4661015378 før / de8808a6a969 efter), se tabellen nedenfor. Rest: MLS har 12 klubber i databasen (virkeligheden 30); Polen/Australien uden skema |
| 2 | Hvert lands pokaler tager klubberne fra de rigtige divisioner | Pokalerne tager landets ligaklubber i spillet (FA Cup 44 = PL + Championship, Danish Cup 36 = de tre rækker, Copa del Rey 42, DFB-Pokal 36 …); divisions-2026.json flytter kun klubber mellem databasens egne divisioner, så pokalerne følger med | Ingen fejl som Bosmans (ingen nye divisioner). Rest: de lavere rækkers deltagere mangler (world.json har kun 1–3 rækker – data-omfang); Liga Cup'en kræver de 92 ligaklubber (punkt F) |
| 5 | Regler for Ekstraklasa, Allsvenskan, Norges andethold, Kroatien, Portugal, MLS, Asian Cup, UEFA Cup-nyhederne, bænk/udskiftninger i EFL Cup og pokaler | Ekstraklasa 18/34, Allsvenskan 16/30, Kroatien 10/36 (4 runder), Portugal 18/34 som 2026/27; Norges andethold: kun Eliteserien i spillet; MLS: 12 klubber (database); Asian Cup: landsholdene er fra på 2026/27 (punkt A); UEFA Cup-nyhederne: cmEurope er til (20/11); bænk/udskiftninger: 3/5 overalt (punkt C) | Rest: Ekstraklasa-splittet (PolFirst 0x7c8df0) ikke porteret; konstruktørernes bænk/udskiftninger pr. turnering (punkt C's rest – ændrer 2001); landsholdene (punkt A) |

Ligaerne uden passende skema før/efter (runder = højeste skemarække; kampe/hold; første → sidste kamp; dobbeltbookinger i landet ved sæsonens slut; alle kampe spillet før og efter):

| Liga | Klubber × møder | Skema | Før (spillets kalender) | Efter (originalens skema) |
|---|---|---|---|---|
| Serie A (CM24) | 20 × 2 = 38 | 34 | 8/8-26 → 22/5-27 | 30/8-26 → 9/5-27, 38 kampe/hold (4 runder flyttet af 0x5ab510) |
| Ligue 1 (CM11) | 18 × 2 = 34 | 38 | 8/8 → 22/5, 27 dobbelt | 1/8 → 22/5, 0 dobbelt (række 20 = sidste dato, 0x80-ombytningen) |
| Ligue 2 (CM12) | 18 × 2 = 34 | 38 | 8/8 → 22/5, 27 dobbelt | 1/8 → 22/5, 0 dobbelt |
| Allsvenskan (CM38) | 16 × 2 = 30 | 26 | 8/8-26 → 22/5-27; næste sæson 14/8-27 → 27/5-28 | kalenderår 5/4 → 8/11-2026; næste 4/4 → 7/11-2027 |
| Eliteserien (CM315) | 16 × 2 = 30 | 26 | 8/8-26 → 22/5-27; næste 14/8-27 → | kalenderår 5/4 → 18/10-2026; næste 11/4 → 17/10-2027 |
| Brasilien (CM65) | 20 × 2 = 38 | 27 | 8/8-26 → 22/5-27 | 2/8 → 29/11-2026 |
| J1 (CM69) | 20 × 2 = 38 | 30 | 8/8-26 → 22/5-27 | kalenderår 14/3 → 29/11-2026; næste 13/3 → 28/11-2027 |
| Korea (CM229) | 12 × 3 = 33 | 27 | 8/8-26 → 22/5-27, 8 dobbelt | 13/6 → 24/10-2026, 0 dobbelt; næste 19/6 → 30/10-2027 |
| Argentina (CM63) | 30 × 1 = 29 | 38 | 8/8-26 → 22/5-27 | 9/8-26 → 28/3-27 |
| Kroatien (CM138) | 10 × 4 = 36 | 30 | 8/8-26 → 22/5-27 | 25/7-26 → 8/5-27 |
| DK 1. division (CM5) | 12 × 3 = 33 | 30 | 8/8-26 → 22/5-27 | 2/8-26 → 6/6-27 |

Kampene før spilstarten 5/8-2026 (Sverige, Norge, J1, Korea) spilles ved nyt spil som i 2001 (cmPlayStartOverdue).

2001: uændret pr. konstruktion (compHist/awHist kun world-cm.json; cmSetupLoans' 2001-lister bit for bit ens) – målt med perf-fingerprint 2001-08-20
(samlet 438b6c8c376734d0 før/efter – measure 85e65e4dcc00 origin/main 025fa7b1, 89064dbea66b med rettelserne). world.json, careers-cm.json og world-cm-staff.json er bit for bit uændrede; kun world-cm.json er genbygget. Kræver et nyt spil.

## Status kalender og Europa (20/11): originalens kalender på 2026/27

Ny markør `g.cmCal` (newgame.ts, nye spil med en CM-database i ægte tilstand); `cmCalendarOn` = cmActive eller cmLogic + g.cmCal, og dermed
cmEuroOn/cmSeasonOn: ligaernes skemaer (Premier League, Championship, Superligaen), FA Cup/Danish Cup's rundetabeller, Charity Shield, spilstarten
(England 11/7-2026 = lørdagen nærmest 10/8 − 4 uger), sæsonskiftet pr. land (20/6) og CL/UEFA Cup/Intertoto/Super Cup i originalens format.
Nationernes id'er: originalens tabeller bruger 3.9.60's id'er (England 60) – 2026/27 og 3.9.65/3.9.68 har England 61, så de findes nu på navnet
(`nation01`, cmFitness.ts); det retter også FA Cup/Liga Cup/Charity Shield for 3.9.65/3.9.68-spil. Data (build-cm-data.mts → world-cm.json `euro`,
world.json bit for bit uændret): nation.dat +0xe0..+0x108 (54 lande), opdateringens euro.cfg (55 lande) og club_comp_history.dat's seneste sæson
(titelforsvarerne PSG/Aston Villa, mester Arsenal/FA Cup Manchester City). Præmiepengene som finance.cpp i £ (cmGbp).
Målt (`scripts/cm-europe-2026.ts`, England + Danmark, frø 1, til 31/12-2026; measure 9e5ea3bc8be1 Brentford, Vejle med Danmark som hovedland):
CL 71 hold (Q1 18, Q2 19, Q3 18, gruppespil 16; efter G: England 4 – Arsenal, Man City i gruppespillet, Man Utd, Aston Villa i Q3 – før 28),
UEFA Cup 118 (Q 82, R1 36; England 5 før 16, Italien 3 før 36), Intertoto 60 (40/12/8; England 1 – Newcastle), Super Cup PSG–Aston Villa (21/8, PSG);
Brentford ikke i Europa (før: CL Q1); measure 9698ca378d1d. Før G:
Danmark: Aarhus GF (CL Q2), Midtjylland (UEFA R1), København/Brøndby (UEFA Q), Viborg/Nordsjælland (Intertoto). Runderne: Intertoto 27/6 → 25/8 (OGC Nice),
CL Q1 15/7, Q2 29/7, Q3 12/8, 1. gruppespil 15/9–11/11, 2. gruppespil fra 24/11; UEFA Q 13/8, R1 17/9, R2 22/10, R3 26/11, R4 4/3-27. Dobbeltbookinger
(alle klubber i de to lande): 2 samme dag (venskabskamp + CL – punkt H), 9 dage efter hinanden (venskabskampe og Championship-skemaets 30/31-8).
Præmiepenge i Europa til 31/12: £100,6M til 107 klubber, højst £4,5M (Arsenal ≈ €25,9M). Hel sæson (frø 2, til 20/8-2027, measure 820580117e56):
intet nedbrud, sæsonskiftet 20/6 og næste sæsons Europa (Intertoto 26/6-27, CL Q1 14/7-27) som i 2001. 2001 bit for bit uændret (perf-fingerprint
2001-08-20 samlet 6e768861dad2bb37 før/efter på 2730b9d0 – measure 219443b36a7f / a8d563413ed4; d7b1a9c891bcaaf3 før/efter på bf8ffd6a med G –
6366c1eb0948 / 5dc5736dd66e). Kræver et nyt spil.

## 1. Det vigtigste fund: 2026/27 ER allerede en CM 01/02-database – dataene smides bare væk

- `public/data/world.json` er bygget af "October 2026 Data Update", som er i **CM 01/02-format** (`kind: 'cm0102'`, `attrScale: 'stored'`).
  Et nyt 2026/27-spil får derfor `g.dbKind = 'cm0102'` og `g.dbYear = 2026` (newgame.ts:174).
- `parseCM0102` læser for 2026-dataene præcis de samme rå felter som for 2001 (målt med en probe på `.data-update/October 2026 Data Update`
  med `cmMem: true`): `cmRaw` med clubRep (0–10000-skala, Vejle 3000, Valencia 6500, Bayern 10000), nationRep, clubStat, compRep, crowd, seats,
  cities, nation7e/85/76, fin, chair, chairBoard, nationBoard, nationCont, city33, prefs (9.370 personer), clubPrefs; stabens hele ikke-spillerpost
  (`staff[11]`/`[12]`, 10.447 af 10.447), staffX (25.159), ratings med omdømmetripletten (`rep`, fx Javi Guerra [100,145,125]), lønninger
  (99 % udfyldt – mod 11 % i 2001-dataene) og kontraktudløb (74 %).
- **Byggescriptet sletter dem** for alt andet end 2001 (`scripts/build-cm-data.mts`):
  - l. 68: `parseCM0102(files, ORIGINAL ? { maxTiers: 4, allClubs: true, cmMem: true } : {})` – uden `cmMem` for 2026;
  - l. 243: `if (!ORIGINAL) delete w.cmRaw`;
  - l. 249–252: `staff[11]`–`[16]` (ikke-spillerposten, skjulte egenskaber, landshold, hukommelse) kun `ORIGINAL`;
  - l. 269/286: `staffX`/`clubNames` kun `ORIGINAL`;
  - l. 295: nationernes sprog (`lang`) slettes; l. 306: `clubFinance` slettes; l. 299: landsholdene (`nationalTeams`) kun `ORIGINAL`.
  - Beskåret til world.jsons klubber (målt på 641 klubber/22.673 spillere før genbygningen 17/11) fylder hele `cmRaw` ≈ 0,48 MB (prefs 0,22 MB) – world.json er nu 9,1 MB (656 klubber), SW-grænsen
    er 10 MB (vite.config.ts:54). staffX (25k poster) passer ikke uden at blive en separat fil, der hentes ved behov.
- **Spilstarten springer dem over** for 2026: newgame.ts har ~15 betingelser `season < 2020` (l. 177 g.econ, 179–192 g.cm*-felterne, 220
  `cmStartGame`, 241 fødselsdag, 278–298 `cmRepMem`/`cmFree`/`cmNation2`/`cmJoined`/`cmInt`, 320 sprog, 479 stabens spilstart, 520 compHist,
  554 `cmRelNewGame`).
- **Køretiden springer dem over**: én funktion styrer næsten alt –

  ```ts
  // src/game/cmPlayerData.ts:22
  export function cmActive(g) { if (g.dbKind !== 'cm0102' || g.options.mode !== 'authentic') return false;
    return (g.dbYear ?? g.seasonHistory?.[0]?.season ?? g.season) < 2020; }
  ```

  Plus `isOriginal2001()` (rules2001.ts:13), `cmDatabase(g) === 'original'` (newgame.ts:113; gittermotoren sim.ts:267, newgame.ts:624),
  `classicRules()` (rules.ts:7) og `g.econ` (kun sat for season < 2020).

Konsekvens: 2026/27 kører i dag **hele den gamle "skøn"-motor** (transfers.ts, will.ts, training.ts, finance.ts/econ26.ts, zonemotoren …) –
også i ægte tilstand. Og reference-tallene for en 1:1-port findes: cm0102.exe med "October 2026 Data Update" i Data-mappen er netop originalens
opførsel på 2026-dataene (Bosman headless kan i princippet køre den som orakel på en KOPI af Data-mappen – ikke afprøvet her).

## 2. Punkt 1: "Interesseret i at komme" i spillersøgningen (ejerens skærmbillede, Vejle 2026/27)

Skærmbilledet: filteret "Interesseret" fjerner kun 5.043 af 24.617 spillere; tilbage står bl.a. Javi Guerra (Valencia), Sacha Boey (Bayern),
Kobbie Mainoo (Man Utd) – unge spillere med høj CA hos store klubber.

**Præcis årsag (to led):**
1. `src/ui/screens/Transfers.tsx:186` kalder `cmSearchInterested(g, p, me.id) ?? playerInterest(p, me) === 'yes'`.
   `cmSearchInterestValue` (cmSearchInterest.ts:27) returnerer `null`, fordi `cmActive(g)` er falsk for dbYear 2026 (og i udvidet tilstand
   for alle databaser). Originalens filter 0x807450 → 0x846920 ≥ 3,15 bruges derfor aldrig på 2026/27.
2. Reserven `playerInterest` (transfers.ts:305) er et skøn, der kun sammenligner spillerens `p.rep` med den købende klubs `club.rep`:
   `gap = p.rep − club.rep`, afvis hvis `gap > 24 − (ambition − 10)·1,2 (+4/+10 for 30+)`. Men `p.rep` er ikke databasens omdømme – den regnes
   af CA i `makePlayer` (data/generate.ts:233: `(ca − 40)·0,55 + min(15, caps/4)`), og spillerens **nuværende klubs** omdømme indgår kun i
   'happy'-reglen (nøglespiller og loyalitet > 13). Guerra: CA 155 → p.rep ≈ 63+, Vejle `club.rep` 42 → gap ≈ 21 < 24 → "yes". Unge spillere
   med få landskampe hos store klubber får lavt `p.rep` og slipper derfor igennem; de etablerede stjerner (høj CA + mange landskampe) filtreres fra.
   Originalen tager derimod hensyn til spillerens omdømme (+0xd, ×50 fra databasens triplet), nuværende klub, løn, rolle og ønskelister (0x846920).

**Hvad der skal til (præcist, ikke et nyt skøn):** 0x846920 kører på ønskelisternes hukommelse (`buildSlMem` → cmSlMem.ts), som bygges af
spiltilstandens `p.cmRep`, `p.cmRepMem`, `p.cmContract`, `p.cmRel`, `p.cmNation2`, `p.cmJoined`, `g.cmFin`/`cmFinRaw`, `g.cmClubStat`,
`g.cmBoard`, `g.cmCrowd`, `g.cmCompRep`, `g.cmNation7e/76/85`, `g.cmCity33`, `g.cmTargetRep`, stabens `cmNp`/`cmHid`/`cmPa` og lønporten
(cmWageGame.ts). Altså: data (afsnit 1) + spilstartens cm-felter + den ægte tilstands kontrakt-/økonomilag. 0x846920 regner med lønkrav og
klubbens økonomi, så pengene i hukommelsen skal være i originalens enheder (afsnit 4). Forkontrollen 0x807e57 (spillerens +0xd > klubbens
+0x80 + 5000) kan i sig selv portes med kun clubRep + omdømmetripletten, men den fjerner ikke Guerra-sagen (≈ 5000–7250 mod 3000 + 5000) –
det er 0x846920, der gør. **Størrelse: stor** (den er porten til hele transfer-/kontraktlaget, punkt 3–4 i listen). Midlertidigt kan
"Interesseret" skjules/slås fra på 2026/27, indtil porten er der (UI-beslutning for ejeren – ingen ny formel).

## 3. Kort over forgreningerne

Forkortelser: **L** = logik (bør kunne gælde 2026/27), **V** = 2001-verden (formater, regler, kalender – bør IKKE overføres), **P** = penge
(logik, men kræver beslutning om valuta/skala, afsnit 4).

| Område | Kode (port / gate) | Original gren | 2026/27 i dag | Data mangler i world.json | Type |
|---|---|---|---|---|---|
| Spillerens vilje / Interested / skifte-vilje | cmSearchInterest.ts, cmPlayerWill.ts (0x846920), transfers.ts:636 `cmMoveInterest` | 0x807450/0x846920 | `playerInterest` (skøn, se §2) | cmRaw, cmRepMem, np, kontraktlag | L+P |
| Computerens ønskelister og bud | cmShortlistGame.ts, cmSlEval.ts, cmAiBid.ts, transfers.ts (30 × cmActive) | Shortlist_Manager, 0x8e5d60 | `aiTransfers`/`findTarget` (skøn) | som ovenfor + cmPlan | L+P |
| Transferbud, svar, forhandling, klausuler | cmTransferBid.ts, cmTransferTalks.ts, cmOfferCheck.ts, cmAskingPrice.ts | 0x8c8090, 0x8cfc90, 0x4d1600 | transfers.ts' egne svar | kontraktlag, fin | P |
| Transferliste, trupstatus, utilfredshed | cmTransferList.ts, cmSquadPlan(Game).ts, will.ts:332 | 0x87dd80, 0x83cb40 | will.ts (eget system) | clubStat, kontrakt +0x3d… | L |
| Kontrakter (krav, forlængelse, udløb, start) | cmContract*.ts, cmContractEnd.ts | 0x4c7ac0, 0x85fc50, 0x85e960 | transfers.ts/contracts | DB-lønninger (findes, kasseres), kontraktdatoer | P |
| Løn og lønloft | cmWage.ts, cmWageGame.ts, cmWageFill.ts, cmMaxWage.ts | 0x864550, 0x5968d0 | econ26.ts (Deloitte-kalibreret) | fin, clubFinance | P |
| Værdi | cmValue.ts, cmValueGame.ts, training.ts:186–222 | 0x4d0c60 | `valueTarget` (CA/alder) | rep-triplet (findes), fin | P |
| Klubøkonomi, budget, begivenheder | cmFinance.ts, cmBudget.ts, cmFinEvents.ts, finance.ts | finance.cpp | econ26.ts (m26) | fin, clubFinance | P (bevidst adskilt) |
| Bestyrelse, managerjob, ultimatum, jobvilje | cmBoard*.ts (cmBoardOn) | MANAGER_MANAGER, 0x844780 | board.ts (skøn) | chair, chairBoard, nationBoard, staff[11/12] | L(+P i forventninger) |
| Spillerudvikling, træning, interne egenskaber | cmDevelop.ts, cmTraining.ts (cmTrainOn), training.ts:82 | 0x5ce2d0, TRAINING_MANAGER | training.ts `develop()` | p.cmInt (kan laves af `stored`-dataene; newgame.ts:298 gater), cmCompRep | L (ingen penge) |
| Kampmotor (gittermotoren) | sim.ts:266 `gridEngineOn`, newgame.ts:624, engine/grid/* | CM3_MATCH_ENGINE | zonemotoren | cmInt, cmCompRep, cmCrowd, nation7e, vejr, relationer | L – men se risici (5 udskiftninger/9 på bænken) |
| Computerens holdudtagelse/taktik | engine/grid/aiTeam.ts:341, cmPlayerData.ts | 0x6e2f20 | aiTactic (skøn) | cmRepMem, PlayerStats | L |
| Kondition og skader | cmFitness.ts, cmFitnessGame.ts (cmFitOn) | injury.cpp | sim.ts' egen model | cmClubRep | L (ingen penge) |
| Vejr | cmWeather.ts (cmWxOn) | weather.cpp | intet | cities, city33 | L (ingen penge) |
| Kendskab (fog of war) | cmKnow.ts (cmKnowOn) | fog_of_war.cpp | scouting.ts | cmFinRaw, cmRepMem | L |
| Spejdere | cmScout.ts (cmScoutOn), scouting.ts:362 | SCOUT_MANAGER | scouting.ts | cmRepMem | L |
| Forhold mellem personer/klubber | cmRelations.ts, newgame.ts:554 | relations | intet | prefs, clubPrefs | L (ingen penge) |
| Karantæner/appel, bøder | cmDiscipline.ts, cmFine.ts, rules2001.ts:108 | discipline.cpp, Fine.cpp | personality.ts | cmChair, cmBoard | L (bøder i ugeløn) |
| Pensioneringer, fyldspillere | cmRetire.ts, cmVirtual.ts | PLAYER_REGEN, virtual_staff | season.ts `retirements()` | cmFinRaw, nation85 | L |
| Stabsskifter, stabssøgning, stabsprofil | cmStaffMove.ts, cmStaff.ts, cmStaffInit.ts | staff_manager | staff.ts | staff[11–16], staffX | L+P |
| Medier, rygter, nyhedsomfang, moral | cmMedia.ts, cmRumours.ts, cmNewsScope.ts, media.ts, state.ts:252 | media/morale | media.ts | cmCrowd, cmCompRep, nation85 | L |
| Priser (awards) | cmAwards.ts (cmAwOn) | award/*.cpp | achievements | cmCompRep | L |
| Reserve-/B-hold, venskabskampe | cmReserves.ts, cmBTeam.ts, cmFriendly*.ts | 0x84b940, friendly.cpp | intet / egne | cmCrowd | L |
| Sprog | cmLanguage.ts | player_stats | intet | nations.lang (slettes l. 253) | L |
| Kalender, sæsonskifte pr. land, forkørsel | cmCalendar.ts, cmSeason.ts, cmPrerun*.ts | 2001/02-datoer | spillets kalender | – | V |
| Europas turneringer, Liga Cup, Charity Shield | cmEurope.ts, cmCups.ts | 2001/02-formatet | moderne format (Swiss-liga, Conference League) | – | V |
| Landshold, FIFA-rangliste, slutrunder | cmIntl*.ts, cmFifa.ts, cmNatTeams.ts, international.ts | 2001/02 (VM 2002) | international.ts | nationalTeams | V (udtagelsen cmIntlSquad = L) |
| Arbejdstilladelse (0x8c7560/0x8c7950 + historik) | cmPermit.ts, rules2001.ts | De Britiske Øer (+0x76 = 0xe), ikke EU (+0x7f = 2), 0x8c7950 | **som originalen for nye spil (19/11)** – databasens nation.dat +0x76/+0x7f, FIFA-resultatlisten g.cmWp.res | – | L |
| Leje, 3/5-regler | rules2001.ts, rules.ts `classicRules` | 3 udsk./5 bænk | 5/9 | – | V |
| Priser/løn-niveau | g.econ, econ.ts, newgame.ts:357–421, finance.ts:102/148 | 2001-£ | econ26.ts | – | V (må ikke deles) |
| UI-forgreninger | src/ui: `authentic()` (≈ 200 steder – tema/tilstand, ikke database) og `cmActive` i Shell, classic.tsx, PlayerClassic, Transfers(Classic), TransferStatusClassic, Inbox, Staff, Board, NegotiationClassic, TrainingClassic | | | | følger motoren |

`authentic()` (rules.ts:16) afhænger kun af tilstand + tema, ikke af database – den del gælder allerede 2026/27. `playerInit.ts` (PA-reglerne,
CA over PA, `shownFromStored`) bruges allerede af 2026/27 (newgame.ts:256–296 kører for alle CM-databaser).

## 4. Pengene – den eneste svære beslutning

Næsten alle transfer-/kontraktporte (0x846920, 0x85fc50, 0x4d1600, 0x4d0c60, 0x5968d0, finance.cpp) regner i originalens £ og læser klubbens
finanspost. Tre muligheder:

- **A. Som exe'en med dataopdateringen:** hukommelsen fyldes med opdateringens egne beløb (`cmRaw.fin`, `clubFinance`, DB-lønninger) og
  originalens konstanter. Det er præcis det, cm0102.exe gør med "October 2026 Data Update" (kan kontrolleres mod oraklet), men så er spillets
  priser 2001-agtige (≈ det, CLAUDE.md forbyder at dele) – og econ26.ts' Deloitte-økonomi skal væk eller køre ved siden af.
- **B. Moderne beløb i spillet, originalens enheder i hukommelsen:** hukommelsesbyggerne (cmSlMem.ts, cmWageGame.ts, cmContractGame.ts)
  omregner spiltilstandens € til hukommelsens £ med en faktor pr. liga, målt ved spilstart som `g.econ` er det i dag (forholdet mellem
  opdateringens CM-lønninger og m26-lønningerne), og svarene (lønkrav, værdi, udbudspris) omregnes tilbage. Beslutningerne (ja/nej, rækkefølger)
  bliver originalens; beløbene moderne. Skalainvariant, hvor exe'en sammenligner beløb med beløb; ikke, hvor den sammenligner med faste
  £-konstanter (fx lønloft, minimumsløn, afrundinger) – de steder skal listes og omregnes med samme faktor.
- **C. Kun den pengefrie logik** (punkt 5–12 i listen nedenfor) – ingen valutabeslutning nødvendig.

Anbefaling: C først (stor gevinst, ingen økonomirisiko), derefter B for vilje/transfers/kontrakter. Faktoren i B er en måling af dataene, ikke en
kalibrering af logikken – men ejeren skal godkende princippet, før nogen bygger det.

## 5. Prioriteret liste (mest mærkbart for spillerne først)

Fællesforudsætning for alt nedenfor (**F0, let – dag 1**): (a) byggescriptet beholder `cmRaw` (beskåret), `staff[11]`–`[14]`, `nations.lang`
og `clubFinance` for 2026 og kalder `parseCM0102` med `cmMem: true` (world.json +≈ 0,5–1 MB – tæt på SW-grænsen 10 MB, så cm-felterne bør ligge i en separat fil, der hentes ved ægte tilstand; staffX som separat fil eller senere); genbyg
world.json med `scripts/build-cm-data.mts` (sha i world-builds.json, `tests/worldBuild.test.ts`). (b) En ny gate, fx `cmLogic(g)` = CM-format +
ægte tilstand (uanset år), adskilt fra `cmActive`/`isOriginal2001` (= 2001-verden); i newgame.ts deles `season < 2020` i "har cmRaw" og
"2001-verden". Selve skiftet kræver et **nyt spil** (felterne sættes ved spilstart; eksisterende 2026-spil kunne evt. konverteres som cmConvert.ts).
Kontrol: oraklet med opdateringens Data-mappe (kopi!) som reference.

| # | Område | 2026/27 i dag | Originalens logik ville give | Hvad der skal til | Risiko | Størrelse |
|---|---|---|---|---|---|---|
| 1 | Spillersøgning "Interesseret" + spillerens vilje til at skifte | `playerInterest`: p.rep fra CA, ignorerer nuværende klub → unge stjerner "vil" til Vejle (§2) | 0x807450/0x846920: realistiske kandidater | F0 + cm-spilstarten (cmRepMem, kontraktlag, cmFin) + hukommelsen (cmSlMem) + pengeprincip B | B's valuta; hastighed (buildSlMem én gang pr. dag/klub – målt ok på 2001 med flere spillere) | **Stor** (hænger sammen med 3–4) |
| 2 | Kampmotoren (gittermotoren) | zonemotoren | originalens kampmotor, computerens holdudtagelse/taktik (0x6e2f20) | F0 + `cmInt` (newgame.ts:298) + `gridEngineOn` på cmLogic; 2026-reglerne 5 udskiftninger/9 på bænken skal afprøves i motoren (originalens kampregler understøtter et antal pr. turnering – skal verificeres i exe'en) | middel: udskiftningsregler, hastighed som 2001 | Middel |
| 3 | Computerens transfers (ønskelister, bud, svar, transferliste, trupplan) | transfers.ts' skøn | originalens markedsadfærd | F0 + B + cmShortlistGame/cmAiBid/cmTransferBid/cmTransferList/cmSquadPlanGame på cmLogic; vinduerne pr. land (`windowOpen(g.date, club)`) med moderne datoer | økonomi (B), sæsontal skal måles (halv sæson × 2 frø) | **Stor** |
| 4 | Kontrakter og løn (krav, forlængelser, udløb, startkontrakter, lønfyld) | econ26/transfers | originalens krav og forløb | F0 + B; DB-lønningerne findes allerede i 2026-dataene (99 %) | økonomi-kalibrering (m26 vs. originalens lønkurve) – højest | **Stor** |
| 5 | Spillerudvikling og træning (interne egenskaber) | training.ts `develop()` (rettet 14/11 for drift) | 0x5ce2d0/TRAINING_MANAGER | F0 + `p.cmInt` (data findes: attrScale 'stored') + `cmCompRep`, `cmRatingAvg`; gate i training.ts:82 | lav (pengefri); spillerudvikling over flere sæsoner skal måles | Middel–let |
| 6 | Kondition og skader | sim.ts' model | injury.cpp | F0 (cmClubRep) + cmFitnessGame-spilstarten; `cmFitOn` på cmLogic | lav | **Let–middel** |
| 7 | Bestyrelse og managerjob | board.ts | MANAGER_MANAGER, jobvilje 0x844780 | F0 (chair/chairBoard/nationBoard, staff[11/12]); forventningerne læser økonomi → B for den del | middel (fyringer) | Middel |
| 8 | Forhold (prefs), medier/rygter/moral, nyhedsomfang | media.ts/will.ts | relations, cmMedia, cmRumours, cmNewsScope | F0 (prefs 0,22 MB) + `cmRelNewGame` | lav | Middel |
| 9 | Kendskab og spejdere | scouting.ts | fog_of_war.cpp, SCOUT_MANAGER | F0 + cmRepMem | lav | Let–middel |
| 10 | Karantæner/appel og bøder | personality.ts | discipline.cpp, Fine.cpp | F0 (cmChair/cmBoard); bøder er i ugeløn (skalafri) | lav | Middel |
| 11 | Pensioneringer og fyldspillere | season.ts `retirements()` | PLAYER_REGEN, virtual_staff | F0 (nation85, cmFinRaw → B for den del) | middel (regens' antal over tid) | Middel |
| 12 | Vejr, priser (awards), reserve-/B-hold, venskabskampe, sprog | intet/egne | weather.cpp, award/*.cpp, 0x84b940, friendly.cpp, cmLanguage | F0 (cities/city33, compRep, crowd, nations.lang) | lav; venskabskampe afhænger af kalenderen | **Lette** hver for sig |
| 13 ✓ | Stab (stabssøgning, stabsskifter, stabsprofil) | staff.ts | staff_manager, Staff Search 0x7afa70 | F0 + staffX (25k – egen fil) + B for løn | middel | Middel |
| – | IKKE overføre: kalender/sæsonskifte/forkørsel, Europas 2001-format, Liga Cup/Charity Shield, landsholdenes 2001-slutrunder/FIFA-liste, 3/5-reglerne, g.econ-priserne | moderne | 2001-verden | – | – | – |

"Let" betyder: når F0 er på plads, er det en gate (`cmActive` → `cmLogic`) + spilstartens felter for modulet + en måling; ingen ny port.
Alle punkter er porte, der allerede findes – der skal ikke oversættes ny exe-kode, kun data og gates (plus pengeprincip B for 1, 3, 4, 7, 13).

## 6. Risici og forbehold

- **Udvidet tilstand:** `cmActive` kræver også ægte tilstand. Skal originalens logik også gælde i udvidet 2026/27, er det en separat beslutning
  (udvidet har egne tilføjelser – pressemøder, xG, sponsorer – der læser de nuværende systemer).
- **Datakvalitet i opdateringen:** markedsværdierne er næsten tomme (1.666 af 139k) – originalen regner dem selv (0x4d0c60), så det er ikke en
  hindring. Lønningerne er udfyldt i opdateringens enheder (skal kontrolleres mod exe'ens forventede skala).
- **Hastighed:** ægte tilstand på 2001 (~54k spillere i world-original.json) er målt hurtig nok; world.json har 23k – samme eller bedre.
- **Gemte spil:** alle punkter kræver et nyt spil (eller en konvertering à la cmConvert.ts, som i dag afviser 2026/27).
- **Orakel:** referencen for 1:1 på 2026/27 er cm0102.exe med opdateringens Data-mappe. Kør kun på en kopi – aldrig ejerens
  `~/Library/Application Support/cm0102`.
- Sæsontal skal måles efter CLAUDE.md "Målinger" (lockstep først, så halv sæson × 2 frø, hel sæson kun for økonomi/kontrakter/udvikling).

## 7. Rækkefølge (forslag)

1. F0: data i world.json + `cmLogic`-gate + newgame-opdeling (lille, ingen adfærd ændres, før modulerne slås til).
2. Pengefrie moduler: 6 (kondition), 12 (vejr/priser/reserver/sprog), 9 (kendskab/spejdere), 8 (forhold/medier), 5 (udvikling), 10 (disciplin).
3. Kampmotoren (2) – efter verifikation af udskiftningsreglerne.
4. Ejerens beslutning om pengeprincip (A/B) → 1 (Interesseret/vilje), 4 (kontrakter/løn), 3 (transfers), 7 (bestyrelse), 11, 13.

## Status punkt 3 (18/11): computerens transfers på 2026/27

Ny gate `cmMarketOn(g)` (cmPlayerData.ts) = cmActive, eller cmLogic + spil, hvis spilstart kørte trupplanen 0x83a1b0 (`g.cmPlan` – cmSquadPlanStart
kører nu på cmLogic). Den slår trupplanen 0x83cb40, ønskelisterne 0x83b6e0/0x84a020/0x8e5d60, computer → computer-svarene 0x8c63a0/0x8c8090/0x8c0810,
raterne 0x8caee0 og spilstartens listning til; spillets eget marked (aiClubTurn, jagt, aiFillSquads, freeAgentDrift …) er slået fra som i 2001.
Pengene: buddenes beløb med køberens €→£-faktor (cmMoney.ts), værdien/saldoen med spillerens/sælgerens (`ValueCtx.k`, `toK/fromK` i transfers.ts).
Menneskets egne handler (18/11, fortsat) følger nu også originalens forløb på cmMarketOn: budskærmen 0x8e9760/0x8ec420 (vilkår, rater, klausuler,
bytte 0x47c180, Withdraw/Change), computerens svar på menneskets bud 0x8c8090, modbuddet og computerkøberens vurdering 0x8c0810, menneskets svar
0x8f06f0 (Reject med begrundelse/Reject All/Negotiate), Set Transfer Status 0x8f7f08 og transferlisten 0x8f8450, handlen 0x8ca8a0/0x8cb0f0;
spillets egne bud på menneskets spillere (aiBidsForListed) og Offers/Deals-fanerne er slået fra som i 2001. Budskærmens beløb (Cash 0x43f4e0/
0x43f580, listen 0x8e981e, grænserne) i køberens £ (cmMoney). Bestyrelsens loft på budskærmen 0x598800 (cmBidBudget) er stadig 2001-verdenens
(punkt 7) – på 2026/27 står transferbudgettet. 2001 bit for bit uændret.
Videresalg (Lautaro/Foster købt og solgt igen inden for få dage): originalen har ingen spærre i buddet 0x84a020/0x8e5d60 eller svarene 0x8c8090/
0x8c63a0 (ingen datokontrol); den eneste er i ønskelisten 0x83b6e0 (0x83bc56: kontraktens start +0x25 skal ligge mere end 30 + rand(100) dage
tilbage, 0x54c8e0 = dato − n), som er mekanisk porteret og får +0x25 fra Player.joined. Et mål, der kom på listen før købet, kan derfor bydes på
hos den nye klub som i originalen. Ikke porteret: 0x842b00 i handlen 0x8cb9a0 (de interesserede klubbers tæller +8 = 100 → ny plan).
Målt (`scripts/cm-market-2026.ts`, England, Brentford, frø 1, 1/7-26 → 30/6-27): computer → computer 1.110 → 159, PL-køb 25 for €569M (median
€18,0M) → 37 for €417M (median €8,1M), Championship 30 for €108M → 63 for €164M; klubber i minus 132 → 109 af 656; klubløse 759 → 3.135 før,
759 → 816 nu. 2001 bit for bit uændret (02ec66f5a29512d1). Kræver et nyt spil.

## Status punkt 7 (18/11): bestyrelse og managerjob på 2026/27

Ny gate `cmBoardLogic(g)` (cmPlayerData.ts) = cmLogic + spil, hvis spilstart kørte 0x68f130 (g.cmBoard – cmBoardInit kører nu på cmLogic, på 2026/27
kun med formændene/nationerne fra world-cm.json). `cmBoardOn` = den; for den originale database uændret (cmActive && g.cmBoard). Dermed kører
MANAGER_MANAGER (0x68f130/0x68f9c0/0x6951e0/0x68aa80, forkørslen), viljen 0x844780, menneskets job (ansøgning, tilbud, fyring, Meet with Board,
ultimatum) og bestyrelsens loft på budskærmen 0x598800 (cmBidBudget, beløbet i køberens £) på nye 2026/27-spil; board.ts' aiSackings/
summerManagerChanges/fillVacancies er slået fra som i 2001. Pengene i bestyrelsen (saldo, formuebånd, transferbudget, anmodning 3/4) med
cmMoney-faktoren for klubben. Data: world-cm.json får `staffBx` (staff[12] omdømmer + skjulte egenskaber, [13] ankomstdatoen, [14] landsholdet)
og `natOff` (nat_club.dat's første id = 12.868); world.json uændret. Landsholdene er ikke i bestyrelsen på 2026/27 (landskampene følger spillets
regler – IKKE-overføre-listen): databasens landstrænere (job 5/12) står i `g.cmBoard.nd`, så viljen/0x69f9b8 springer dem over som i originalen.
Spilstarten sætter også nation +0x71/"Europe"/byernes +0x33 (cmNationCont/cmEurope/cmCity33) – byernes +0x33 læses også af kontraktlaget.
Målt (`scripts/cm-board-2026.ts`, PL frø 1, Brentford, 1/7-26 → 30/6-27, før → efter): managerafgange blandt computerklubberne 19 (PL 9, Ch 10)
→ 11 (PL 4, Ch 7), ledige klubdage 431 → 100 (højst 5 → 2 på én dag); menneskets tillid 65 → 54 (forventning mid/16) før, 63 → 27 i februar og
fyret i foråret efter (forventning øverste halvdel/8); budskærmens loft = transferbudgettet 48,85m før, 0x598800 30,0m (start) → 5,4m (april,
følger saldoen 66,6m → 42m) efter. Databasen har Nagelsmann/Deschamps/Clarke ledige uden landshold – de ansættes i klubber. 2001 bit for bit
uændret (02ec66f5a29512d1). Kræver et nyt spil.
Kontrol af forventningen/fyringen (measure fb7e818da43c): 0x6a3770 regner ikke ud fra omdømmerangen, men fra sidste sæsons placering (club.dat
+0x5f, Brentford 9 i opdateringen) − formuebåndet (bånd 1: −2) + 1 (manageren under et år) = 8 → 0x40 "øverste halvdel" (8 ≤ 20/2). Båndet
1 gælder både spillets saldo i £ (€66,6m × 0,1721 = £11,5m) og databasens club.dat-saldo (£15m) – grænsen er 1000 · 6500 + 3,5m = £10m.
Brentford lå 17. (dec.), 19. (jan.–mar.) og 18. (april) i kørslen – formen (tabsserier) og placeringen mod forventningen (0x699950) tog tilliden
63 → 27, og fyringen 25/4 følger originalens regler. Ingen fejl i data eller port.

## Status punkt 8 (18/11): forhold, medier, rygter, moral og nyhedsomfang på 2026/27

Ny gate `cmMediaOn(g)` (cmPlayerData.ts) = cmActive, eller cmLogic + spil startet med modulerne (`g.cmMedia = 1` – newgame.ts, nye 2026/27-spil i
ægte tilstand). Dermed kører på 2026/27: forholdene 0x5d6d10 og relationsflagene 0x867820 (cmRelations.ts – præferencerne fra world-cm.json lå der
allerede via cmRelNewGame), Staff_Records og sign_contract 0x4cf720's +20 (cmMedia.ts), mediets rygter 0x754a30 med "Select Media Response"
(cmRumours.ts; den interesserede klubs vindue = spillets windowOpen, loftet £50M med klubbens cmMoney-faktor), nyhedsomfanget 0x8dbef0/0x8d1130
(cmNewsScope.ts; beløbene med køberens faktor), moralen (spilstartens +0x45 = 10, 0x5ce2d0's kontraktdel inkl. 0x5cf4c8 og transferønskerne
0x4d8610/"requests move", 0x5ce0b0, kampenes moral/PlayerStats/kontrakttællere i cmAfterMatch) og nyhedsfilteret (newsFilter.ts; `KEEP_2026` beholder
vores nyheder, hvor originalens modul endnu kun kører i 2001-verdenen: priser, karantæner, spejdere, reserver, landshold, sponsorer/econ26).
media.ts' klumme/"Rumour:", will.ts' reaktion, fans.ts' trofæpresse, debut-/resultat-/træningsrådsnyhederne er slået fra som i 2001.
Målt (`scripts/cm-media-2026.ts`, PL frø 1, Brentford, 1/7-26 → 30/6-27, før measure 1623053efe3f → efter 0f8e7a07ab8d; 2001-sammenligning
`WORLD=original … 2002-06-30` c2897cfb2070): menneskets nyheder 428 → 232 (transfer.o.* 103 → 6: originalens omdømme-/divisionsregel for en
PL-klub – sælgers division kræver C > 350·20; window.*, match.*, contract.expiring og column.month filtreret som i 2001), rygter cm.rum 0 → 14 (køen 20–37;
2001: 268 og ~500 – køen fødes af buddene, og 2026/27-markedet har langt færre), moral PL snit 13,0 → 13,4 før (10–14: 80–99 %), efter 10,1 → 13,5
(aug.) → 8,8 (juni; 1–5 17 %, 15–20 4 %); 2001: 10,0 → 14,0 (sep.) → 10,4 (juni; 1–5 8 %). 2001 bit for bit uændret (02ec66f5a29512d1).
Kræver et nyt spil.

## Status punkt 12 (18/11): vejr, priser, reserve-/B-hold, venskabskampe og sprog på 2026/27

Nye 2026/27-spil i ægte tilstand (cmLogic + markøren i g; ældre 2026-spil og udvidet tilstand uændrede) – data fra world-cm.json (build-cm-data.mts):
vejret (cmWxOn: g.cmWxTab = opdateringens egen weather.cfg – 29 områder, 3.9.68 har 44 – og hjemmeholdets by/område/stadion), priserne (cmAwOn: g.cmAw
fra spilstarten, prisskærmen med opdateringens staff_comp_history.dat → g.cmAwHist), baggrundskampene 0x84b940/0x84be20 (cmResOn: g.cmRes) og
B-holdene/reserveholdet 0x540a50/0x542740/0x541e60 (g.cmBTeams – exe'ens navneliste giver Celta B og Real Sociedad B), venskabskampene (cmFriendlyOn:
g.cmNationFr = opdateringens nation.dat-felter; nation-id = indeks, England 61) og sproget (g.nations[].lang fra `nationLang`; 0x7bfd50 med spillets
startdato som [0xdd6ec8]). Spillets egne priser/gallaaften og res.*-reservekampe kører ikke på de nye spil (som 2001).
Målt (`scripts/cm-misc-2026.ts`, PL frø 1, Brentford, 1/7-26 → 30/6-27; før 0fa91a34633b, efter d44e52ca9a64): priser 20 af spillets månedspriser →
68 originale (60 måned, 4 år, 4 hold); reservekampe 33 res.*-nyheder → 12.675 baggrundskampe (fixture −2) og ingen for de spilbare ligaer; venskabskampe
0 → 88; vejret i de engelske ligakampe: nedbør 0/1/2/3 = 160/465/228/79, temperatur mest 0–14 °C (før: spillets eget skøn); sprogtabel 0 → 15.075
spillere; B-hold-par 0 → 2. 2001 bit for bit uændret (02ec66f5a29512d1, measure 6457cff7ef4c). Kræver et nyt spil.

## Status punkt 9 og 10 (18/11): kendskab/spejdere og karantæner/appel/bøder på 2026/27

Nye gates (cmPlayerData.ts): `cmScoutLogic(g)` = cmActive, eller cmLogic + spil startet med modulerne (g.cmScoutStart), og `cmDiscLogic(g)` = cmActive,
eller cmLogic + g.cmDiscStart – begge sat af newgame.ts for nye 2026/27-spil i ægte tilstand. cmScoutLogic slår kendskabet (fog_of_war.cpp 0x5aff00/
0x5b03e0/0x5b06e0/0x5b09d0, cmKnow.ts – med Attribute Masking), SCOUT_MANAGER (Scout Player 0x7f8ff0/0x7f9290/0x7f8750/0x7f8c00) og spejderopgaverne
(0x7ae9c0/0x7b3e20, cmScoutAsg.ts) samt Scout #n-skærmene til; scouting.ts' egne fund/talentnyheder slås fra som i 2001. cmDiscLogic slår RulingBody/
discipline.cpp (karantæner, appel 0x6ab800/0x6abef0) og Fine.cpp (Discipline Player 0x5a5980, dagligt 0x5a5820) til; sim.ts' gule-/røde-model og
personality.ts' bøder slås fra. Data: world-cm.json får `nation7f` (nation.dat +0x7f, EU/EØS; build-cm-data.mts – world.json uændret); spejdernes
region er databasens nation +0x76 (g.cmNation76 – opdateringen har Italien/Spanien/Portugal i region 13), EU-flaget g.cmNation7f. Spejdernes saldogrænse
0x7f9190 og klubniveauet 0x7bca90 regner i £ med cmGbp (2001 uændret · 0,86). Arbejdstilladelser (19/11, "Altid som originalen"): originalens exe anvender
0x8c7560/0x8c7950 på enhver CM-database – med 2026/27-databasen gælder reglen for britiske klubber (nation +0x76 = 0xe) og spillere uden EU-flag
(+0x7f = 2) efter databasens egne data (ingen Brexit – det kender originalen ikke). Nye spil med en CM-database i ægte tilstand får porten (g.cmWp,
cmPermit.ts); 0x58d710 tæller FIFA_RANKINGS' resultatliste, som 2026/27 fører i g.cmWp.res efter 0x58cf70/0x58d460's regler (originalens FIFA-liste
g.intl.cmFifa findes kun i 2001). Rapporternes tilladelses-/EU-pas-linje følger med. Gamle 2026/27-spil uden g.cmWp er uændrede (ingen tilladelse). Bøderne flytter ingen penge (som originalen) – dialogens beløb er ugelønnen.
Målt (`scripts/cm-scout-disc-2026.ts`, PL frø 1, Brentford, 1/7-26 → 1/1-27; OLD=1 = før, measure 60672e44fab4 / 951396103977): karantæner (alle
klubber) 173 (316 kampe) → 236 (326 kampe), menneskets 1 → 2; appeller 0 (fandtes ikke) → 2 (begge afvist, "FA dismiss ban appeal"); Discipline Player
1 (personality.ts) → 2 (originalens nyhed cmfine.f2); spejderrapporter 10 + 6 talentnyheder (spillets) → 9 originale (0x138e); kendskab (spillere uden for
klubben) snit 4,3 % → 4,9 % før, 25,3 % → 25,8 % efter (niveau 3: 0 → 56 før, 5.991 → 6.083 efter; engelske klubber 26,7 % → 78,7 % ved start).
2001 bit for bit uændret (02ec66f5a29512d1, measure b8bbbd78832e). Kræver et nyt spil.

## Status punkt 13 (18/11): stab på 2026/27

Ny gate `cmStaffOn(g)` (cmPlayerData.ts) = cmActive, eller cmLogic + spil, hvis spilstart byggede stabens hukommelse 0x524d70 (`g.cmStaffMem`). Den slår
Staff Search 0x7afa70 (hukommelsen), den klassiske stabsprofil, menneskets kontrakttilbud 0x4e06e0/svarene, startkontrakterne 0x4c7560/0x83a1b0
(cmStaffWagePrepare/cmStaffWageNewGame) og computerens stabsskifter (trupplanens hale 0x83ebfb, målet 0x83f3a0, buddet 0x84a020, fyringen efter
managerskiftet) til. Data (build-cm-data.mts, world.json bit for bit uændret): parseCM0102 `staffMem` (kun stabens 0x524d70 – uden cmMem's øvrige følger),
world-cm.json `cmRaw.staffMem` (hukommelsen pr. person-id) og en ny fil `world-cm-staff.json` (staffX 28.520 ikke-spillere + clubNames, 5,4 MB – ikke i
offline-cachen, NetworkFirst; mangler den, står kun spillets egen stab i søgningen). Spilstarten på 2026: person-id (Staff.cmId), databasens ugeløn
(staff.dat +78 = staffBx[0][11], £) → startkontrakten med klubbens cmMoney-faktor; kompensationen 0x8d0780 (cmStaffRestGbp) med cmGbp i stedet for 0,86.
Målt (`scripts/cm-staff-2026.ts`, PL frø 1, Brentford, 1/7-26 → 30/6-27; før measure 2424256869f1 → efter 2c5671ba9b41): stabsskifter til computerklubber
0 → 37 (ledig → klub 36, klub → klub 1), fyret efter managerskifte 0 → 81; ledige stabspladser 96 hele sæsonen → 96 (start) / 134 (slut); stabens
ugeløn PL sum €1.533k → €1.093k (median €4.950 → €1.598 = £275), Championship €875k → €437k (median €2.900 → €1.245); Staff Search 0 → 9.984
(heraf 7.967 øvrige ikke-spillere). Åbent som på 2001: for få genansættelser mod fyringerne (2001: 61/12 mod oraklets 173/151 – ORIGINAL_PARITY).
2001 bit for bit uændret (02ec66f5a29512d1, measure 3db81ff9f1ae). Kræver et nyt spil.

## Status punkt 4 – økonomien (18/11): originalens klubøkonomi på 2026/27

`cmFinOn(g)` (cmFinance.ts) = cmLogic + ikke draft + spil, hvis spilstart byggede posterne (g.cmFin – cmFinanceNewGame kører nu på cmLogic); for den
originale database uændret. Dermed kører finance.cpp (init_for_club 0x5961d0, lønsum 0x598370, merchandise/sæsonkort, månedens poster, renter,
Other, Investments, Ground Maintenance, kampens billet-/tv-penge 0x59a5d0, ligapræmie 0x682e10, tv-rettigheder 0x683010, udbytte 0x59cfa0,
begivenhederne 0x59ed70), bonusserne 0x4ca6d0 og Transfer Funds 0x598800 (cmRefreshTransferBudgets) på nye 2026/27-spil; spillets weeklyWages/
monthlyIncome/udbytte/budget er slået fra som i 2001. Pengene: posterne i £, omregnet med klubbens cmGbp-faktor (cmMoney.ts) i stedet for 0,86
overalt (book, saldoen, bookBlockEur for køb/salg/signing on, Finance-skærmen, nyhederne); spillets egne UEFA-præmier (2026-formatet) bogføres i
Prize Money (addPrize). Data: world-cm.json får `cmRaw.clubFin` (club.dat saldo/tilskuere/træningsanlæg, £); world.json uændret. Startsaldoen er
nu originalens (club.dat ± rand) og træningsanlægget databasens. Ligatabellen LEAGUE_MONEY passer (2026-dataenes turnerings-id'er = 3.9.68's).
Målt (`scripts/cm-finance-2026.ts`, PL frø 1, Brentford, 1/7-26 → 30/6-27, før measure 4b00b0f6a586 → efter 83bb7199b6ff): klubber i minus
(alle 656) start 0 → 25, slut 97 → 110; PL i minus 0 → 3 af 20 (saldo-median €71,7m → €58,3m), Championship 7 → 1 af 24 (€2,4m → €12,2m);
PL omsætning €7,42 mia. → €3,77 mia., løn 60 % → 127 %; Championship 97 % → 82 %; tv PL €2,45 mia. → €52m (første sæson: ingen tv-rettigheder
– FinanceTable findes ikke ved create_table, som i originalen), præmier PL €444m → €771m, udbytte PL 0 → €420m. 2001 bit for bit uændret
(9e533ca1b89331df, measure 84dd659f8e7f). Kræver et nyt spil.
