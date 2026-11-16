# 1:1 med det originale CM 01/02 – metode og arbejdsliste

Mål (ejeren 16/11): "Der må ikke være forskel på det vi bygger og det originale." Gælder ægte tilstand med den originale
database (`cmActive(g)`), classic look. Udvidet spil/2026/27 er uden for målet.

**Undtagelse – Game Options (ejeren 16/11):** menuen Game Options er CM Reborns eget område. Her ligger tilføjelser, der gerne
må afvige fra originalen: nye features, konto/bruger, fællesskab, rangliste og på sigt støtte og køb af pakker. De skal
holdes adskilt fra originalens egne Game Options-punkter (tydeligt som CM Reborn) og undtages fra K3/K4. Nye ikke-originale
funktioner placeres her – aldrig på originalens skærme.

## Sådan sikrer vi det (kontroller, der skal køre hele tiden)

| # | Kontrol | Hvad den fanger | Status |
|---|---|---|---|
| K1 | **Kampmotor lockstep** mod oraklet (scripts/lockstep.ts, tests/gridLockstep) | enhver afvigelse i kampen, tal for tal | findes (20 PL-kampe, pokal, straffe identiske) |
| K2 | **Spil-lockstep pr. dag**: oraklet (Bosman headless, fast frø) gemmer hukommelsesbilleder pr. dag; vi kører samme start og sammenligner spillere/klubber/kontrakter/økonomi/nyheder/tabeller dag for dag | afvigelser i ALT uden for kampen (transfers, økonomi, bestyrelse, udvikling, skader, kalender) | mangler – største opgave |
| K3 | **Tekst-tjek i CI**: alle engelske tekster, der kan vises i ægte tilstand, skal findes i exe'ens strenge (eller være markeret som CM Reborn-tilføjelse: Rankings, konto, fællesskab) | opfundne tekster/nyheder/knapper | **bygget 16/11**: `scripts/text-parity.ts` + `tests/textParity.test.ts` (exe-strenge i `scripts/data/cm0102-strings.txt.gz`, undtagelser i `scripts/data/text-parity-allow.json`, baseline `text-parity-baseline.json` – 1.401 → 1.260 (nyhedsfilter) → 949 → 797 (16/11 runde 3: `cl.*` 187 → ~75 – originalens ordlyd for Team Selection/ferie/filbokse/Training Ground/finansstatus, forklaringer og tomme-liste-tekster slået fra i ægte tilstand, døde nøgler fjernet, `help.*` allow-listet, tekster set på originalens skærm allow-listet med billedhenvisning; indlæsningen i text-parity.ts samler nu også pladsholdere skrevet `< %s`; runde 2: kode der kun nås fra det moderne udseende udelades automatisk, `Modern*` + funktioner kun kaldt derfra; allow-liste for slåede-fra systemer; originalens ordlyd; exe-strenge med linjeskift i pladsholdere, genitiv "{x}'s", tal som %d); fejler kun hvis tallet stiger). Afgrænsningen er statisk (præfiks-allowlist), så tallet er en øvre grænse; skærmtekster i originalens datafiler og ikke i exe'en (fx Continue Game) tæller som ikke-originale, til en anden kilde findes |
| K2 | **Spil-lockstep pr. dag**: oraklet (Bosman headless, fast frø) gemmer hukommelsesbilleder pr. dag; vi kører samme start og sammenligner spillere/klubber/kontrakter/økonomi/nyheder/tabeller dag for dag | afvigelser i ALT uden for kampen (transfers, økonomi, bestyrelse, udvikling, skader, kalender) | **bygget 16/11**: `scripts/cm-day-lockstep.ts` – 4 dage med billeder (se afsnittet K2 nedenfor); nyheder mangler (listen ikke afkodet) |
| K3 | **Tekst-tjek i CI**: alle engelske tekster, der kan vises i ægte tilstand, skal findes i exe'ens strenge (eller være markeret som CM Reborn-tilføjelse: Rankings, konto, fællesskab) | opfundne tekster/nyheder/knapper | **bygget 16/11**: `scripts/text-parity.ts` + `tests/textParity.test.ts` (exe-strenge i `scripts/data/cm0102-strings.txt.gz`, undtagelser i `scripts/data/text-parity-allow.json`, baseline `text-parity-baseline.json` = 1.401 ikke-originale; fejler kun hvis tallet stiger). Afgrænsningen er statisk (præfiks-allowlist), så tallet er en øvre grænse; skærmtekster i originalens datafiler og ikke i exe'en (fx Continue Game) tæller som ikke-originale, til en anden kilde findes |
| K4 | **Skærm-paritet**: liste over originalens skærme (exe'ens skærm-funktioner) ↔ vores; skærmbilleder af originalen (testspil via cmctl, aldrig ejerens karriere) side om side med e2e-billeder | manglende/forkerte skærme, layout, menuer | delvis (ejerens billeder i ~/cm0102-engine/work-ui) |
| K5 | **\*estimeret\*-budget i CI**: antallet af `estimeret`-markeringer i src/game må ikke stige (nu 240 forekomster) | nye gæt sniger sig ind | **bygget 16/11**: `tests/estimateBudget.test.ts`, baseline `tests/estimateBudget.baseline.json` |
| K6 | **Funktionskort**: alle exe-funktioner, spillet kalder, med status porteret/oversat/estimeret/mangler | huller i dækningen | delvis (ENGINE_PORT_PLAN.md, ~1.300 kortlagte) |
| K7 | **Langtidstest mod oraklet**: 3–5 sæsoner – sammenlign fordelinger (mål, transfers, økonomi, klubber i minus, udløbne kontrakter, regens, udvikling af CA) | drift over tid | delvis (soak.ts uden orakel-sammenligning) |
| K8 | **Data-tjek**: hver spillers/klubs/stabs felter i world-filen mod originalens hukommelse ved spilstart (fødselsdato, fod, nationalitet, kontrakt, løn, omdømme) | parserfejl (fx Stuart Edwards' fødselsdato/fod) | findes: `scripts/cm-data-check.ts` + tests/cmDataCheck.test.ts (spillere/klubber/stab mod pre-0/pre-194; fordelinger for tilfældige felter) – kør efter hver ændring af parser/newgame |

## K2 – spil-lockstep pr. dag (16/11)

**Kørsel** (~6–10 min, én node-proces):
```
CM_DBSIZE=2 npx tsx scripts/build-cm-data.mts .orig-db/Original-3.9.60-Database-Swedish_fixed <scratch>/world-dbs2.json 2001
WORLD=<scratch>/world-dbs2.json EX=3 JSON=<scratch>/k2.json npx tsx scripts/cm-day-lockstep.ts [til-dato]
```
Spillet startes som oraklet (England, Arsenal, frø 1, ægte tilstand; world-filen med databasestørrelse 2 – scriptet advarer ellers) og
spilles frem; på hver dag med et billede sammenlignes spillere (parret på navn+fødselsår+nation+dato: 4.728, heraf ~3.560 i engelske
klubber), de 92 ligaklubber, bestyrelsen, Premier Leagues kampprogram/tabel (oraklets `out/season-s1a.json`, samme kørsel) og originalens
afsluttede handler (TRANSFER_MANAGER +0x862). Felter, som originalen trækker med tilfældige tal (manglende CA/PA/egenskaber/løn/udløb/
omdømme i databasen), mærkes `[tilfældige inddata]` og læses som fordeling; spillets talrække er ikke originalens, så alt tilfældigt
divergerer fra første trækning – eksakte afvigelser i deterministiske felter er det vigtige.

**Billeder, der findes** (frø 1, 3.9.60, England/Arsenal, størrelse 2; `pre` = lige før CONTRACT_MANAGER::daily_update 0x4c7ac0 i dagens
tidspunkt 2 – dagens kampe er spillet, kontrakternes dag ikke): 14/7-2001 (`work-r3/snap-start/pre-194-2001.bin` = spilstarten), 20/7-2001,
1/2-2002, 30/6-2002 (`oracle/runs/xfer3-snap/pre-200-2001/pre-31-2002/pre-180-2002.bin`). Spillet sammenlignes færdigt med dagen før
(spilstarten lige efter createGame). Ingen nyheder: nyhedslisten i hukommelsen er ikke afkodet (0x784100/nyhedsmanageren) – næste skridt.

**Flere dage** (sporbinæren `~/cm0102-engine/.bosman-ct/build/cm0102_recomp` findes, bygget 13/11; uden sandkasse, aldrig mod
~/Library/Application Support/cm0102 – run_season_ct.py sætter RECOMP_USER_DIR/HOME under runs/<navn>; sig det til ejeren først):
```
cd ~/cm0102-engine && RECOMP_SNAP=$HOME/cm0102-engine/oracle/runs/k2-snap RECOMP_SNAP_DAYS=196:2001,203:2001,212:2001,243:2001,273:2001 \
  python3 -I tools/ct/run_season_ct.py --seed 1 --days 356 --database 3.9.60 --run ~/cm0102-engine/oracle/runs/k2 \
  --program ~/cm0102-engine/.bosman-ct/build/cm0102_recomp
SNAPS=<fil>:<iso>,… WORLD=… npx tsx scripts/cm-day-lockstep.ts
```
Dag = dag i året fra 0. Højst 64 dage pr. kørsel; hvert billede ~93 MB ×2 (pre+post) + log (70–300 MB) – med 23 GB fri disk højst ~40 dage
ad gangen (eller ret sn_trace.c til kun at skrive `pre` og ingen log).

**Fund (første afvigelse pr. system, tidligst først)** – tal = afvigelser/tjekket på 14/7 · 20/7 · 1/2 · 30/6:
| System | Første dag | Hvad | Tal |
|---|---|---|---|
| lån | 14/7 | originalen har 40 engelske spillere udlejet allerede ved spilstarten (fx 4 Arsenal-unge i KSK Beveren) – i databasen (pre-0) ingen: forkørslens marked 1/1–13/7 laver dem; vi har 0 lejeaftaler fra engelske klubber HELE sæsonen (originalen 40 · 40 · 101 · 20, 226 lejehandler) | udlejet 40 · 40 · 101 · 20 |
| trupstatus | 14/7 | +0x4f: klubber uden for de fire ligaer får ingen status hos os (0x83a1b0 springer skjulte klubber over, *estimeret*) – originalen sætter den for alle | 267/267; ligaklubberne 976/3286 |
| værdi | 14/7 | (rettet 16/11, punkt 17) staff +0x52 med kendte inddata 56 % inden for ±10 % (før 28 %), 20/7 53 %; snit £599K mod £607K (før £789K), tilfældige inddata 38 % – resten er 0x6e86d0's id-hash, trupplanens +0x3d og forkørslens kontrakter | 552/1251 · 591/1255 |
| skader | 14/7 | startskader 6 % mod 4 % af spillerne | andel 0,06/0,04 |
| økonomi | 14/7 | (timing) Intertoto 14/7 er spillet i billedet; saldo inden for 0,92–1,08 som den skal. Senere: sæsonposterne Prize 0 (originalen £231K snit 1/2: pokal-/Europapræmier), TV 88K/193K, Investments 34K/4,8M (begivenhederne 0x59ed70 – porteret 16/11, punkt 11), Interest ud 222K/119K, saldo 1/2 1,37M/3,02M og 30/6 0,76M/7,64M, nye sæsons tv-penge betales i originalen før 30/6 (create_table efter 20/6) | se scriptet |
| moral | 20/7 | +0x45 skilles allerede efter 6 dage (2.295/3.559; snit 10,7/11,2, originalen spreder mere – fx 5–16 i forsæsonen) | 60 · 2295 · 3160 · 3122 |
| klubomdømme | 20/7 | +0x80 ændrer sig i originalen i forsæsonen (fx +1/+2 efter venskabskampe), vores står stille | 2 · 71 · 91 · 92 |
| kondition | 20/7 | kampkondition snit 9.316/9.444 (20/7), 9.873/9.408 (1/2); Fitness med kendte inddata 85/134 | |
| kontrakt | 20/7 | +0x44 tilfredshed 2.509/3.558 efter 6 dage; db-kendte udløb ens ved start (1/2352) men 961 afviger 1/2 (forlængelserne) | |
| transfers | 20/7 | 14/7–19/7: vi 66 køb med sum, originalen 38 + 15 klubløse skriver under; sæsonen: vi 346 køb / 1 klubløs / 0 leje / 0 frigivne, originalen 621 / 95 / 226 / 65 (+139 lejer slut); 0 af originalens 662 handler (parrede spillere) sker hos os. Klubløse i hukommelsen 1/2: vi 347, originalen 229 | |
| bestyrelse | 14/7 | tillidsværdierne +6/+8/+0xa/+0xc trækkes med rand (fordelingen tæt: 7.009/6.898); 1/2–30/6 har 41 %/44 % af vores klubber skiftet manager mod originalens 25 %/34 %; Exeter City er ledig ved originalens spilstart, hos os har Joey Pike jobbet | 41/25 % |
| kampprogram | sæsonen | samme 380 hjemme/ude-par, men tv-flytningerne 0x685640 giver færre søndagskampe (61 mod 91; lørdag 227/196) – 44 af 106 datoer har et andet antal kampe | 44/106 |
| CA/udvikling | 1/2 | CA snit 78,2/77,3 (1/2) og 80,0/77,5 (30/6) – vores spillere udvikler sig hurtigere; interne egenskaber med kendte inddata ens ved start (0/133), gns. |forskel| 3,8 i februar | |
| Arsenal | – | mennesket: originalens assistent handler på ferien (Arsenal køber for £844K i første uge, ugeløn 976K/576K 30/6) – vores ferie overlader ikke klubben til computeren | |

**Rettet 16/11 (små, sikre):** køb/salg/signing on fee/bonusser bogføres nu i originalens blokke (`bookBlock` i cmFinance.ts: Finance::add_bought
0x599890, add_sold 0x599800, add_signing_on 0x5998e0, add_bonus 0x599960) – før stod Bought/Sold/Signing On/Bonuses på 0 i blokkene, og
View Finances (der læser Bonuses fra blokken) viste 0 bonusser, selv om pengene blev trukket. Test i tests/cmFinance.test.ts.

### K2 – prioriteret liste (porte/rettelser)
1. **Lejeaftaler for computerklubber** og **klubløse, der skriver under** – ønskelisterne er SLÅET TIL 16/11 (Web Worker, ENGINE_PORT_PLAN.md):
   sæsonen (Maximum, scripts/sl-season.ts) 441 køb / 162 leje / 200 klubløse mod originalens 621 / 226 / 95 (før 346 / 0 / 1). Tilbage: for mange
   klubløse skriver under (Maximum-hukommelsen har ~6× oraklets engelske klubløse – kør cm-day-lockstep med størrelse 2), for få køb/lån,
   frigivne tælles ikke i Player.moves (0 mod 65).
2. **Forkørslens marked 1/1–13/7** (0x5cc850 med transfer-/lejemarkedet): 40 lejeaftaler og trupændringer ved spilstarten (Arsenal 48 mod 43).
3. ~~**Værdien +0x52 ved start**~~ – gjort 16/11 (punkt 17): `p.value` = 0x4d0c60 som 0x4c7ec5 (cmValueGame.ts).
4. **Trupstatus for klubber uden for ligaerne** (0x83a1b0 for alle indlæste klubber – fjern *estimeret* spring) og de 976 ligaspillere med anden status.
5. **Moral i forsæsonen** (+0x45 skilles på 6 dage) og **klubomdømmet** +0x80 (ændres dagligt/efter venskabskampe i originalen).
6. **Managerskifter**: for mange fyringer/skifter (41 % mod 25 % af klubberne til 1/2) – 0x697c40/0x69aba0 på spillets data.
7. **Pokal-/Europapræmier** (Cup::pay_round_prize_money 0x522240), **tv-pengene** (88K/193K til 1/2) og **næste sæsons tv-rettigheder før 1/7**.
8. **Tv-flytningerne** 0x685640: 61 søndagskampe mod 91.
9. **Udvikling**: CA vokser 2,5 point for meget over sæsonen (cmDevelop/cmTraining).
10. **Startskader** 6 % mod 4 % (0x62a920).
11. **Ferie = computeren styrer klubben** (assistentens handler) – ellers er Arsenal aldrig sammenlignelig.
12. **Nyheder i K2**: afkod nyhedslisten i hukommelsen, så antal/typer kan sammenlignes; flere billeder (ugentlige) så første afvigelse kan dateres præcist.

## Arbejdsliste – skal undersøges / rettes

### 1. Spilsystemer der stadig er vores egne eller estimerede
1. Ønskelisterne (Shortlist_Manager) – SLÅET TIL 16/11 (dagene i en Web Worker, ~2–4 s pr. dag; spillets egne computer-transfers slået fra). Historik: porteret, men slået fra (`SL_ON`): hastighed ~2,5–4,5 s/dag med Maximum-hukommelsen (`tm`, runde 12 – runde 11's 0,6 s var uden `tm`) → 0,3 s/dag kræver genudfyldningen 0x843e10 → 0x83f3a0 og 0x84a020 i TS uden x86-emulering (ENGINE_PORT_PLAN.md, runde 12); derefter computerens interesse/bud/handler fra originalen og vores `cmInterested`, `aiPursuits`, `weeklyRumours`, `aiBosman`, `aiReleaseClauses`, `aiFillSquads`, `freeAgentDrift` slået fra.
2. Transferbudget/lønbudget: 0x598800 bygget (`cmBudget.ts`) men giver 33,6M mod originalens 24M for Man Utd – mangler et input (fin+0xc m.fl.).
3. Arbejdstilladelse: tildelingen 0x8c7950 ikke porteret (kun "skal have").
4. Landsholdsfodbold – **etape 1 delvis 16/11** (`src/game/cmIntl.ts`, noter ~/cm0102-engine/notes/international.md, `scripts/cm-intl-check.ts`,
   tests/cmIntl.test.ts). Oraklet (crowd1) viser for 2001/02: ingen VM-kvalifikation uden for Oceanien (forkørslen), 142 A-venskabskampe på 19 datoer,
   136 U21-kampe dagen før, 3 'B' International, Copa 2001 (12 hold), Afrikamesterskabet feb.–mar. 2002 (32 kampe).
   **Porteret:** landskampdatoerne 0x5ca4f0/0x5cc510 (110 poster, verdensdel + kvalifikation, firårscyklus), 0x5cbb00 (12 dage før, også i forkørslen,
   1/1 nulstilling og omdømmesortering), parringen 0x5cbdf0 (±4 dage optaget, rand(500)/+rand(1000), +0x88 ≥ 5, februar uden Afrika, forbudte par
   0x5cc2d0, ingen gentagelse i året, hjemmebane rand(2)), U21-spejlingen 0x7e6720 (omdømme ≥ 2500, ikke 1/3–1/9 i år % 4 = 0), EM 2004-kvalifikationens
   grupper 0x57dab0 og rundedatoer 0x57d190 (31/8-2002 … 4/10-2003), cyklusserne for Copa (ulige år) og Asian Cup ((år − 1996) % 4) – vores VM 2002-
   kvalifikation og de fire vinduer for de 64 stærkeste er slået fra i ægte tilstand. ***Estimeret*:** kampenes rækkefølge i EM-kval.-grupperne
   (runde-robin), playoff (datoer 15/19-11-2003, lodtrækning, bedste toer), lodtrækningsdagen, U21-fyldspillere, at truppen kaldes ind ved kampens
   oprettelse (originalen: 0x76bab0 14 dage før). **Mangler:** 'B' International (B-grenen i 0x7e6720), NationalTeams 0x76b100/udtagelsen 0x76bab0/
   0x76c120 og originalens nyheder (0x76e0b0 …), FIFA_RANKINGS 0x58cf70, HostCountry (slutrundernes datoer ±35 dage, værter), VM 2002-/ACN-/Copa-
   datoer og felter (Copa 2001 = 12 faste hold), Confederations Cup 2003, OFC Nations Cup, OL 2004, VM-zonerne fra 2004, landskampe i gittermotoren
   (stadig zonemotoren), landsholdenes fyldspillere 0x90dc66, landstrænerjob/fyring.
   **Måling** (`scripts/cm-intl-check.ts`, frø 1, Maximum, 14/7-2001 → 30/4-2002 ~10 min): Europas datoer 25/22 (A/U21) mod oraklets 20/20 (1/9, 6/10),
   30/27 mod 24/24 (14/11), 25/21 mod 20/18 (23/3) – resten er databasestørrelsen (oraklet: størrelse 2) og tilfældighederne. Åbent: Afrikas og
   CONCACAFs datoer (22/7, 19/8, 30/9, 20/10, 18/11) giver 9–24 kampe mod oraklets 2–3 – i originalen er landene optaget af VM-zonernes
   2000-kampagne (0x90f210/0x9149f0 "kører" i 2001, men oraklet logger ingen kampe i 391/394); ikke porteret.
5. Sæsonskiftet og pensioneringer (0x7a7f20, INT_RETIREMENT), end_season pr. nation.
6. ~~Reservekampe (fixtures −2, 0x84be20)~~ – **porteret 16/11** (cmReserves.ts, noter ~/cm0102-engine/notes/reserve-matches.md): originalen har
   INGEN reservekampe for klubber i de spilbare ligaer ("Reserve"-turneringen [0x9cf684] har ingen klubber/kampe; reserveskærmene viser altid
   "There are no forthcoming reserve matches to be played." / "No recent reserve matches have been played."). 0x84be20 spiller i stedet
   baggrundskampe for alle klubber UDEN for de spilbare divisioner: grupper à 15–16 efter omdømme (0x84b940, ved nyt spil og sæsonopdateringen),
   gruppe i på dage med dag-i-året mod 7 = i mod 7, ikke juni/juli, ikke ±2/3 dage om klubbens kampe, parret efter klare spillere; kampen med
   fyldspillere + motoren og kun PlayerStats (rand(9) ? liga : pokal), kontrakt/bonusser 0x4ca6d0, kondition/skader 0x62c080 og tilladelsen
   0x8c39f0 – ingen tabel/økonomi/karantæner/nyheder. England: 1.622 klubber, 102 grupper, ~110 kampe pr. kampdag (+0,7–0,9 s pr. dag i tsx).
   Spillets egne reservekampe (reserves.ts, nyhederne "X Reserves win" findes ikke i exe'en) kun i udvidet spil. *Estimeret*: talrækken
   (cmRand), zonemotoren i stedet for gittermotoren (CM_RES_GRID=1), landsholdsophold 0x7757d0. Mangler: reserveholdets Fixtures/Last Match-
   skærme med originalens tomme tekster, "Control Reserve Team" (0x75ebd5/0x7615d0), B-hold 0x540a50.
4. Landsholdsfodbold: NationalTeams 0x76b100, udtagelse 0x7757d0, kvalifikation/VM/EM/OL-format, landstrænere – hele `international.ts` er vores eget.
5. Sæsonskiftet og pensioneringer. **Pensioneringerne porteret 16/11** (`src/game/cmRetire.ts`, PLAYER_REGEN): listen ved indlæsningen 0x7a58f0/0x7a79c0
   (databasens dato 1/1), nye kandidater på dag 0/80/173/250 (0x5d6250 → 0x7a5790: check_retirement 0x7a7310 – grænse 34 målmand/30 angriber/31 andre,
   −1/−2 for manglende kontrakt/status 7/høj løn, v = (1 − (alder − T)·0,075)·omdømme, CA ≤ 100/v < 1500/spilletid +0x3d < 0 i kørende ligaer,
   rand(3)/v < 3500 udenfor; check_unemployed 0x7a8050), dagligt process_retirements 0x7a59e0 (sorteret 0x7ae2a0, melding dagen efter meldingsdatoen
   0xbbb 0x7aa340/0x7aa4c0, pension dagen efter stopdatoen 0xbba 0x7a92e0/0x7a9650 – kun når klubben er menneskets 0x7875e0, aflyst ved leje, bud
   eller nyt klubskifte), datoerne efter sæsontabellen 0xb63d60 +0x15/+0x1d (England: stop 20/6 + rand(30) året efter), skadens pension 0x7a7f20,
   regen-køen 0x7a87d0 (under 30 samme dag, ellers 1 + rand(65) dage – `spawnDueRegens`). season.ts' `retirements()` og prune's klubløse gælder kun
   udenfor ægte tilstand. **Målt** (`scripts/cm-retire-season.ts`, world-dbs2, synlige engelske ligaer): listen 14/7 **54 = 54** (samme aldre;
   `scripts/cm-retire-diff.ts`: 76/76 af oraklets engelske, vi har, er med – oraklets øvrige 180 er i engelske klubber, som world-filen ikke har),
   1/2 141 (meldt 54) mod 137 (53), 30/6 151 (44) mod 155 (36); pensioneret til 30/6 20 mod oraklets ≥ 31, til 21/7 81 mod ≥ 97 (oraklets tal = poster
   i billederne med stopdato i perioden). Aldre 31–40, flest 33–35, som oraklet. Ikke porteret: stabens pensioneringer (årsag 0x20 – 0x7aaeb0/0x7ab340),
   "spilleren bliver træner" (puljen [this+0x20] er 2 fra dag 1 i oraklet, så grenen er død; 0x7a65d0's tildeling ikke porteret), forsikringen 0x58a980.
   **Sæsonskiftet pr. nation (fundet, ikke porteret):** game_season_update_pass 0x5d5ae0 kører hver nøglerække på dens +0x15-dag (Europa 20/6, Norge 27/11,
   Sverige/Finland/Rusland 27/12, Japan 25/1, Sydkorea 20/1, USA 20/2, Argentina/Australien 31/7): dagen før arkiveres Club_Records 0x447880,
   PlayerStats 0x7c1350, Finance 0x59cdd0 og Staff_Records 0x86d6e0 (end_season_for_nation); på dagen rulles rækkens start/slut (+0x2a/+0x39, +0x1d år),
   ligaerne får ny sæson (tilskuere 0x5d6280, Discipline 0x556210, reserveligaerne 0x84b940). Kontrakterne udløber dagligt efter datoen (CONTRACT_MANAGER,
   allerede porteret). Spillets seasonRollover kører stadig 1/7 for alle lande – næste skridt: flyt arkivering/tabeller/op-nedrykning til landets +0x15-dag.
6. Reservekampe (fixtures −2, 0x84be20) og B-hold 0x540a50.
7. Venskabskampe for mennesket: **porteret 16/11** (cmFriendlyOffers.ts, FriendlyClassic.tsx – Home/Away Friendly, Tour, Choose Friendly Teams, Invite Club, svaret 0x5c5f40 efter omdømmet, også for computerens egne; noter ~/cm0102-engine/notes/friendly-human.md). Mangler: Friendly Cup/League (Tournament).
8. Priser: Team of the Week (hvornår), Fans Player of the Year, internationale priser, andre landes priser.
9. Økonomi for ikke-valgte lande: klubber i minus 150 → ~450 over 3 år.
10. Spejdere/kendskab: **kendskabet porteret 16/11** (`src/game/cmKnow.ts`, fog_of_war: oprettelsen 0x5aff00/startniveauet 0x5b03e0, dagligt 0x5afce0 → 0x5b0260 med gulvet 0x5b06e0 og glemsel efter 540 dage, opslaget 0x5b02f0, "set" 0x5b09d0 fra spejdere/kampe 0x5afe00, attribute masking 0x543280 – tabellen i `GameState.knowledge` som 0/33/66/100, datoerne i `manager.cmKnowSeen`; tests/cmKnow.test.ts). Bruges af budskærmens loft og linje (0x598800/0x8ea327), profilens og Player Search' "-" og spejdernes fremskridt. Tilbage: spejdermanagerens egne opgaver/tider (0x7f8750 → 0x7b5be0/0x7b3e20/0x7bd310) er stadig `scoutDaily`'s – kun deres "set" er originalens; B-hold-kæden 0x540a50 i opslaget/gulvet (ingen B-hold hos os); historikkens årstal i 0x7c6e30. Rec-stjernernes tilfældige tal er faste hash-værdier.
11. Bestyrelsens/økonomiens begivenheder – **0x59ed70 porteret 16/11** (`src/game/cmFinEvents.ts`, tests/cmFinEvents.test.ts): FinanceTable::
   process_club_finance_events ved månedens udgang (0x59cbfd, alle aktive klubber) og dagligt for klubber i krise (0x59cd4d, +0x165 ∈ {1,2}, flag
   rand(max(10,(11000 − omdømme)/250)) = 0). Krisetilstanden +0x165 efter formuebåndet 0x5986b0: −2 → betalingsstandsning (0x177b "Receivers called
   in"/"Club in financial crisis", PLC ophører, menneskets spillere sat ned til 0x4d0c60(…, 0, −1, 1) og egen udbudspris væk), −1 → gæld, 0–2 →
   normal ("Receivers appeased" 0x1783 ved udgang af 1). Begivenhederne i originalens rækkefølge pr. bånd: kapitalindskud 0x59dd40 (type 4, 150/300/
   450·omdømme), investering 0x59e050 (typerne 1/5/6/7 – transferpenge, aktier, sponsor, PLC; formandens Business/Resources/Ambition, ikke Wales/Irland/
   Nordirland/Norge/Danmark/Sverige/Belgien, ikke semi/amatør), gældsbetaling 0x59e5a0 (type 3, omdømme ≥ 4750, ikke PLC, loft 4M) og overtagelsen
   0x59e940 (type 2, (omdømme+1000)·1000 + gælden, ny formand: Patience/Business/Interference/Resources rand(20)+1, landet). Forsømmelsen +0x166 > 50 i
   en kørende liga: undervarmen væk (0x177d) eller en tiendedel af stadionet lukket (0x177a), træningsanlægget falder. Beløbene bogføres som
   Investments; transferbudgettet 0x598800 bagefter (med fortegn) står i nyheden og bliver Club.transferBudget. Nyhederne: type 2 og 7 til landets
   managere (0x7863f0), resten til klubbens egen (0x7861e0), amatørklubber ingen. **Ikke porteret:** formandens nye navn, B-holdene 0x540a50, reglen
   om at menneskets klub i betalingsstandsning ikke kan afvise rimelige bud (kontrakt +0x4e & 4 i budvurderingen), den dybe gælds månedlige
   mediehistorie/salgsønsker 0x59c212 (0x74ae60 "Financial trouble at …", 0x867700), AWOL 0x41a360, appel. Sæderne +0x40/+0x44 kommer fra stadium.dat
   +64/+68 (`cmRaw.seats`, parseren); world-filerne er ikke genbygget, så sæderne står indtil da som kapaciteten.
12. Kalendere – **delvis gjort 16/11**: Norge 1. division (NorFirst::create_schedule 0x790040 tæller ligaens klubber: 16 → 30 runder, ellers 26) og USA (UsaMls 0x9072d0 stage −1: 32 runder for 12 klubber; spillet spiller en tredobbelt turnering, der stopper efter 32 runder – `CM_LEAGUE_CUT`, *estimeret*: originalens egen kampfordeling 0x908xxx er ikke porteret) har originalens skema (36 klasser, fixture-test 352 nøgler mod emulatoren; `tools/sched/gen_all.py` har en `PRE`-krog, der lægger 16 klubber i hukommelsen). Tilbage: **Australien** (AusNsl 0x4111a0: 24 rækker til 14 klubbers 26 spillerunder – rundefølgen 0x68a030 genbruger rækker med rand(4) – og 10 rækker slutspil i stage 0, som spillet ikke har) og **Polen** (PolFirst 0x7c8df0: stage −1/0 = to grupper à 8 med 14 runder, stage 1/2 = mesterskabs-/nedrykningsgrupper à 14 – kræver grupper før splittet i spillets liga). **Tjekkiet/Østrig/Mexico/Schweiz** findes ikke i originalen (exe'ens `comp\leagues\*.cpp` har ingen aut/cze/swi/mex, og landene har ingen række i nøglelandstabellen 0xb63d60) – spillets egen kalender.
13. ~~Næste sæsons europæiske turneringer synlige i slutningen af juni (ejerens fund B12)~~ – **gjort 16/11** (`cmEuroNextSeason` i cmEurope.ts): på dagen for næste sæsons første lodtrækning (CL-kvalifikationen 26/6-2002, Intertoto 28/6) oprettes CL/UEFA/Intertoto/Super Cup for den nye sæson med seedingen af de afsluttede ligaer og pokalvindere; den gamle sæsons turneringer ligger i `g.cmEuroPrev` og lægges tilbage ved sæsonskiftet (`cmEuroRolloverStart`), så priser, omdømme, historik og trofæer regnes af dem, mens de nye og deres kampe (Intertoto 29/6, CL Q1 10/7) holdes til side og lægges ind igen i setupSeasonComps (`cmEuroRestoreNext`). Skærmene filtrerer turneringens kampe på `meta.cmFrom`. *Estimeret*: hvornår originalen opretter dem (tidligst landenes sæsonopdatering 20/6, senest lodtrækningen). Test i tests/cmEurope.test.ts (27/6 og 2/7-2002).
14. Menneskeligt styret hold: managertillægget (ferie bruger en *estimeret* managerpost).
14b. **Stabsskifter mellem klubber – porteret 16/11** (`src/game/cmStaffMove.ts`, ejerens billede 153.png "Fulham sign Collier"): trupplanens hale
   0x83ebfb–0x83f32b (stabens 15 pladser: 1 assistent, 1 reserveholdsmanager, 5 trænere, 1 fysioterapeut, 7 spejdere; grænsen min(0x7bca90/5, 5000);
   indehaveren vurderet med 0x69d1b0), budgettet 0x83b6e0 (kun helt ledige pladser i professionelle klubber: B/(10n) assistent/træner, B/(20n)
   spejder/fysioterapeut), målet 0x83f3a0's stabsgren (restkontrakten under pladsens budget og højst (omdømme + 500)·10, landet/verdensdelen,
   omdømmet set af manageren ≥ rand(2000) + 3250), vurderingen 0x69d1b0 for jobbene 6–10 (`cmBoard.ts` scoreStaffForJob: jobblokkene 0x69db39/
   0x69deb6/0x69e22d/0x69e4e7 med managerens taktiske syn, egenskaber og personlighed og den fælles hale – før kun job 5), buddet med kompensationen
   0x8d0780 (ftol(dage til udløb · ugeløn / 7), £1.000–£1.000.000; sælgeren siger ja straks 0x8c8160), bogført som køb/salg, nyheden 0x8dbef0/0x8dc370
   (overskrift get/moves to/seal … deal/sign, brødtekst "have appointed … as a/an <job>"; modtagerne efter 0x8d1130 med ikke-spillerpostens omdømme,
   ×0,25 for træner/spejder/fysioterapeut). Menneskets eget tilbud til en ansat i en anden klub bruger nu 0x8d0780 (Offer Contract: "X will be due £Y
   in compensation." kun når beløbet er over 0). *Estimeret*: målets mindstekrav (grænsen T), n i budgettet, budtidspunktet (straks i stedet for
   0x84a020's uge), personens svar (viljen 0x844780 for jobbet ≥ 0,75, svar efter 1–5 dage – kontrakttilbuddet 0x4cda70/0x864550 ikke porteret),
   kontrakten (lønkrav, 2 år), overskriftens variant (id mod 4; originalen (arg0 + arg4·arg15) mod 4), kun klubber i de valgte lande. **Ikke porteret:**
   bud på menneskets stab (originalen sender buddet til mennesket med 28 tidsenheders frist 0x8be884 – mennesket mister ikke stab hos os), fyringen
   ved et managerskifte (0x690890, første kørsel med +4 = 2), reserveholdets manager (rolle 7), arbejdstilladelser for stab. **Målt**
   (`scripts/cm-staff-moves.ts`, frø 1, Arsenal, 14/7–12/8-2001): 446 bud ved spilstarten i England, 13 skifter (11 spejdere, 2 trænere; 3 fra en anden
   klub), resten sagde nej; ingen nåede Arsenals nyheder (originalen viste Man Utd "Fulham sign Collier" – modtagerreglen for stab bør kontrolleres
   mod oraklet).
15. Konvertering af gamle originale gemte spil (afventer ejerens 4 svar).

### 2. Data
16. Parserfejl: fødselsdato/fod/nationalitetsord (Stuart Edwards) – kontrollér alle felter mod originalens hukommelse (K8).
17. **Spillerværdier – gjort 16/11** (`src/game/cmValueGame.ts`): `Player.value` er originalens +0x52 = 0x4d0c60 (håndporteret i cmValue.ts) som
    CONTRACT_MANAGER's 0x4c7ec5 – ved spilstarten, menneskets spillere hver dag, computerens på ulige dage (de valgte landes klubber; resten den 1. i
    måneden – *estimeret* for hastigheden: ~22 ms/dag + ~0,4 s/måned), klemt af en aktiv frikøbsklausul; menneskets udbudspris (`cmAsk`) står som +0x52,
    formlen ved siden af (`cmAsk.f`, valueTarget). Posterne er buildWantMem's med tre rettelser: menneskets manager er en person i klubben (kendskab 0,
    oraklets ikke-spillerpost), managere uden for originalens hukommelse (`Staff.cmMem`) er ingen manager, landets +0x8e fra nation.dat. Kontrol:
    tests/cmValueGame.test.ts (0x4d0c60 på oraklets egne bytes = +0x52 for Beckham, Stuart Edwards, Cherno Samba, Pires, Dixon, Carlos Edwards) og
    `scripts/cm-value-diff.ts` (inddata felt for felt mod oraklets spilstart; `SUBST=1` = hvor meget hver gruppe inddata betyder).
    **Tal:** K8 kendte inddata 27 % → 49 % inden for ±10 % (median vores/oraklet 1,01, p10/p90 0,76/1,95); K2 14/7 28 % → 56 %, 20/7 53 %. Stuart Edwards
    £1,3M → £124K (originalen £80.500 – databasen mangler hans PA, originalens træk gav 55, vores 97), Beckham £18,95M (£18,83M), Samba £481K (£617K, PA −2).
    **Hvorfor ikke 90 %:** 0x4d0c60 på originalens hukommelse giver +0x52 for 2.366/2.372, så resten er inddata: (1) 0x6e86d0's spredning er en hash af
    personens og managerens hukommelses-id + frø – id'erne er rækkefølgen af de indlæste efter 0x524d70's terningslag og kan ikke genskabes (vi bruger
    stabile id'er); med oraklets bedømmelse 48 % → 68 %; (2) trupplanens kontrakt +0x3d (menneskets klub har 50 i originalen, vores 70–77; computerklubberne
    efter forkørslen), (3) forkørslens forlængelser (restløbetiden), (4) udfyldte egenskaber/PA. Alle inddata fra oraklet: 85 % (med oraklets managere for
    størrelse 2: 90 %). Ikke koblet: ønskelisternes og ønskekontraktens egne 0x4d0c60-kald (cmSlMem/cmContractGame `valueOf` – formulaValueGbp).
18. Klubbernes korte navne i resultatlister og ligafarver (dansk liga rød).

### 3. Skærme og tekster
19. Gennemgå alle skærme mod originalen (K4) – især International/VM/EM/OL, turneringshistorik fra databasen, Manager-hubben, Awards-skærmen (opstilling gættet), fællesspil (lobby, join, spillerhistorik), Job Information/jobtilbud.
20. Alle nyheder: overskrift, brødtekst, modtagere og dato mod exe'ens nyhedskode (523 overskrifter kortlagt i docs/NEWS.md) – fjern alle uden modstykke (K3).
21. Spillerprofilen: originalens kampstatistik pr. turnering (Non Competitive/League/Cup/Continental/International/Senior Club) og positionslinjen ("Defender (Right)").

### 4. Kampmotor
22. De 33 *estimerede* steder i gridMatch.ts + matchSubs/adapter/aiTeam/pass: erstat med porte.
23. Live-kampen (set kamp) vs hurtigkamp: samme motor og samme inddata – mål forskellen.
24. Kampe i ikke-valgte lande/Europa/venskabskampe/landskampe kører stadig zonemotoren.


### Småting (ejerens fund, lav prioritet)
- ~~Kendskabssystemet (ejerens fund 16/11)~~ – **porteret 16/11** (se punkt 10): Harris (Millwall) niveau 3 "will allow", Koch (Kaiserslautern) niveau 0 med loft 0,32 × værdien (originalen 11/33 = 0,33). Budskærmen: tre flader og sælgerens korte navn som ejerens billeder 143/144.
- News-skærmen (ejerens billede 16/11, images/153.png) – **rettet 16/11**: datoen med tidspunktet ("Fri 24th Aug EVE" – `NewsItem.tod`, sat ved
  oprettelsen af cmTimeOfDay), datoen i listens skriftstørrelse, "Filter :" i originalens grå boks fra ~43 % til Next Unread, Next Unread med hvid tekst,
  større overskrift (22 px) og brødtekst (21 px), overskriften ikke understreget. Tilbage: originalens liste viser altid rullebjælken med pile (vores
  kun når listen kan rulle), og skrifttypen (originalens er kommerciel – se Design Kit-noten i CLAUDE.md).
- Kendskabssystemet (ejerens fund 16/11): originalens kendskab afgør bestyrelsens loft ved bud – startniveau ud fra nation/klub/division/omdømme, daglig opdatering og spejdernes løft. Vi gætter i dag.
- Spillerprofilens statistiktabel som originalen: rækkerne Non Competitive/League/Cup/Continental/International/Senior Club og kolonnerne Apps/Con | Gls/Asts/MoM/Pass/Tck/Drb/Sh Tar/Av R – kræver kampstatistik pr. spiller (afleveringer, tacklinger, driblinger, skud på mål).
- Player & Staff Search (og øvrige spillerlister): shortlistede spillere står med GULT navn (og bud-mærket "Bid" i Inf-kolonnen, grå), som i originalen (ejerens billede 16/11, images/148.png).
- Økonomien: kontraktbonusser (mål-/assist-/clean sheet-bonus efter kamp, 0x4ca6d0) og signing on fees skal bogføres i originalens poster (View Finances: Bonuses/Signing On Fees) og trækkes fra saldoen som originalen – tjek mod oraklet (K2: cm-day-lockstep.ts sammenligner de 18 sæsonposter). Ejerens billede 16/11 (images/150.png: Fortune, 1.700DKr Assist Bonus). Delvist gjort 16/11 (K2-agenten: køb/salg/signing-on/bonusser bogføres via bookBlock), mangler kontrol.
