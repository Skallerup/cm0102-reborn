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
| K3 | **Tekst-tjek i CI**: alle engelske tekster, der kan vises i ægte tilstand, skal findes i exe'ens strenge (eller være markeret som CM Reborn-tilføjelse: Rankings, konto, fællesskab) | opfundne tekster/nyheder/knapper | mangler |
| K4 | **Skærm-paritet**: liste over originalens skærme (exe'ens skærm-funktioner) ↔ vores; skærmbilleder af originalen (testspil via cmctl, aldrig ejerens karriere) side om side med e2e-billeder | manglende/forkerte skærme, layout, menuer | delvis (ejerens billeder i ~/cm0102-engine/work-ui) |
| K5 | **\*estimeret\*-budget i CI**: antallet af `estimeret`-markeringer i src/game må ikke stige (nu 237) | nye gæt sniger sig ind | mangler |
| K6 | **Funktionskort**: alle exe-funktioner, spillet kalder, med status porteret/oversat/estimeret/mangler | huller i dækningen | delvis (ENGINE_PORT_PLAN.md, ~1.300 kortlagte) |
| K7 | **Langtidstest mod oraklet**: 3–5 sæsoner – sammenlign fordelinger (mål, transfers, økonomi, klubber i minus, udløbne kontrakter, regens, udvikling af CA) | drift over tid | delvis (soak.ts uden orakel-sammenligning) |
| K8 | **Data-tjek**: hver spillers/klubs/stabs felter i world-filen mod originalens hukommelse ved spilstart (fødselsdato, fod, nationalitet, kontrakt, løn, omdømme) | parserfejl (fx Stuart Edwards' fødselsdato/fod) | mangler |

## Arbejdsliste – skal undersøges / rettes

### 1. Spilsystemer der stadig er vores egne eller estimerede
1. Ønskelisterne (Shortlist_Manager) – porteret, men slået fra (`SL_ON`): hastighed 0,6 → 0,3 s/dag; derefter computerens interesse/bud/handler fra originalen og vores `cmInterested`, `aiPursuits`, `weeklyRumours`, `aiBosman`, `aiReleaseClauses`, `aiFillSquads`, `freeAgentDrift` slået fra.
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
