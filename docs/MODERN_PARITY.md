# Originalens logik på 2026/27 (MODERN_PARITY)

Undersøgelse 17/11-2026 (ingen kodeændringer). Ejeren: "Kig ind i alle de ting vi har fixet og tilføjet til de originale databaser – vi bør få
dem på 2026/2027." Regel (CLAUDE.md): 2001-specifikke **tal** (priser, lønniveau, g.econ-kalibreringer) må ikke overføres; originalens **logik**
(regler, beslutninger, AI, motor) bør gælde for begge databaser, hvor dataene tillader det.

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
| Arbejdstilladelse, leje, 3/5-regler | cmPermit.ts, rules2001.ts, rules.ts `classicRules` | før Brexit, 3 udsk./5 bænk | ingen tilladelse, 5/9 | – | V |
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
| 13 | Stab (stabssøgning, stabsskifter, stabsprofil) | staff.ts | staff_manager, Staff Search 0x7afa70 | F0 + staffX (25k – egen fil) + B for løn | middel | Middel |
| – | IKKE overføre: kalender/sæsonskifte/forkørsel, Europas 2001-format, Liga Cup/Charity Shield, landsholdenes 2001-slutrunder/FIFA-liste, arbejdstilladelse (før Brexit), 3/5-reglerne, g.econ-priserne | moderne | 2001-verden | – | – | – |

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
