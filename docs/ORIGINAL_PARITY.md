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
| værdi | 14/7 | staff +0x52 med kendte inddata (CA/PA/omdømme/dato i databasen) kun 28 % inden for ±10 %; snit £789K mod £607K (+30 %) – spillets `p.value` er ikke originalens +0x52 ved start | 901/1251 |
| skader | 14/7 | startskader 6 % mod 4 % af spillerne | andel 0,06/0,04 |
| økonomi | 14/7 | (timing) Intertoto 14/7 er spillet i billedet; saldo inden for 0,92–1,08 som den skal. Senere: sæsonposterne Prize 0 (originalen £231K snit 1/2: pokal-/Europapræmier), TV 88K/193K, Investments 34K/4,8M (PLC-begivenheder 0x59ed70), Interest ud 222K/119K, saldo 1/2 1,37M/3,02M og 30/6 0,76M/7,64M, nye sæsons tv-penge betales i originalen før 30/6 (create_table efter 20/6) | se scriptet |
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
1. **Lejeaftaler for computerklubber** (0 i hele sæsonen mod 226) og **klubløse, der skriver under** (1 mod 95) – ønskelisterne/markedet
   (`SL_ON`, arbejdsliste 1.1) + udløbne kontrakter, der frigives (0 mod 65).
2. **Forkørslens marked 1/1–13/7** (0x5cc850 med transfer-/lejemarkedet): 40 lejeaftaler og trupændringer ved spilstarten (Arsenal 48 mod 43).
3. **Værdien +0x52 ved start** (+30 % med kendte inddata) – find hvem der skriver +0x52 i create_game (0x8ce0e0/0x4d1600?) og brug det til `p.value`.
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
1. Ønskelisterne (Shortlist_Manager) – porteret, men slået fra (`SL_ON`): hastighed ~2,5–4,5 s/dag med Maximum-hukommelsen (`tm`, runde 12 – runde 11's 0,6 s var uden `tm`) → 0,3 s/dag kræver genudfyldningen 0x843e10 → 0x83f3a0 og 0x84a020 i TS uden x86-emulering (ENGINE_PORT_PLAN.md, runde 12); derefter computerens interesse/bud/handler fra originalen og vores `cmInterested`, `aiPursuits`, `weeklyRumours`, `aiBosman`, `aiReleaseClauses`, `aiFillSquads`, `freeAgentDrift` slået fra.
2. Transferbudget/lønbudget: 0x598800 bygget (`cmBudget.ts`) men giver 33,6M mod originalens 24M for Man Utd – mangler et input (fin+0xc m.fl.).
3. Arbejdstilladelse: tildelingen 0x8c7950 ikke porteret (kun "skal have").
4. Landsholdsfodbold: NationalTeams 0x76b100, udtagelse 0x7757d0, kvalifikation/VM/EM/OL-format, landstrænere – hele `international.ts` er vores eget.
5. Sæsonskiftet og pensioneringer (0x7a7f20, INT_RETIREMENT), end_season pr. nation.
6. Reservekampe (fixtures −2, 0x84be20) og B-hold 0x540a50.
7. Venskabskampe for mennesket: originalens menuer (Arrange Friendly At Home/Away/Tour/League/Cup, invitationer, svar 0x5c5570/0x5c5f40), billetindtægt.
8. Priser: Team of the Week (hvornår), Fans Player of the Year, internationale priser, andre landes priser.
9. Økonomi for ikke-valgte lande: klubber i minus 150 → ~450 over 3 år.
10. Spejdere/kendskab: `scoutDaily`/knowledge-modellen er vores; Rec-stjernernes tilfældige tal er faste hash-værdier.
11. Bestyrelsens/økonomiens begivenheder: process_club_finance_events 0x59ed70, AWOL 0x41a360, appel.
12. Kalendere: Australien, Polen, Norge 2, USA, Tjekkiet/Østrig/Mexico/Schweiz.
13. Næste sæsons europæiske turneringer synlige i slutningen af juni (ejerens fund B12).
14. Menneskeligt styret hold: managertillægget (ferie bruger en *estimeret* managerpost).
15. Konvertering af gamle originale gemte spil (afventer ejerens 4 svar).

### 2. Data
16. Parserfejl: fødselsdato/fod/nationalitetsord (Stuart Edwards) – kontrollér alle felter mod originalens hukommelse (K8).
17. Spillerværdier: originalen viser Edwards £80K, vi £1,3M – værdiformel/inddata.
18. Klubbernes korte navne i resultatlister og ligafarver (dansk liga rød).

### 3. Skærme og tekster
19. Gennemgå alle skærme mod originalen (K4) – især International/VM/EM/OL, turneringshistorik fra databasen, Manager-hubben, Awards-skærmen (opstilling gættet), fællesspil (lobby, join, spillerhistorik), Job Information/jobtilbud.
20. Alle nyheder: overskrift, brødtekst, modtagere og dato mod exe'ens nyhedskode (523 overskrifter kortlagt i docs/NEWS.md) – fjern alle uden modstykke (K3).
21. Spillerprofilen: originalens kampstatistik pr. turnering (Non Competitive/League/Cup/Continental/International/Senior Club) og positionslinjen ("Defender (Right)").

### 4. Kampmotor
22. De 33 *estimerede* steder i gridMatch.ts + matchSubs/adapter/aiTeam/pass: erstat med porte.
23. Live-kampen (set kamp) vs hurtigkamp: samme motor og samme inddata – mål forskellen.
24. Kampe i ikke-valgte lande/Europa/venskabskampe/landskampe kører stadig zonemotoren.
