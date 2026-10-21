// Spillets versioner og ændringer (nyeste først). Versionen skal matche package.json (se tests/changelog.test.ts).

export interface ChangelogEntry {
  version: string;
  date: string;
  title: { da: string; en: string };
  items: { da: string; en: string }[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '0.7.77',
    date: '2026-10-21',
    title: { da: 'Ny udviklingsgraf på spillersiden', en: 'New development chart on the player page' },
    items: [
      { da: 'Udvikling og største ændringer er samlet i ét panel: den samlede fremgang som stort tal, bløde kurver med navn, niveau og ændring ved hver kurve, og ændringerne som bjælker', en: 'Development and biggest changes are combined in one panel: total progress as a big number, smooth curves with name, level and change next to each, and the changes as bars' },
      { da: 'Hold musen over grafen for at se alle værdier på en dato, eller over et område for at fremhæve det', en: 'Hover the chart to see every value on a date, or an area to highlight it' },
    ],
  },
  {
    version: '0.7.76',
    date: '2026-10-21',
    title: { da: 'Bliv på siden, når du genindlæser', en: 'Stay on the page when you reload' },
    items: [
      { da: 'Genindlæser du browseren, kommer du tilbage til den side, du var på – med faner, filtre, scroll og Tilbage-historikken', en: 'If you reload the browser, you return to the page you were on – with tabs, filters, scroll and the Back history' },
      { da: 'Optakten og kamprapporten viser ikke længere klublogoet to gange', en: 'The preview and match report no longer show the club crest twice' },
    ],
  },
  {
    version: '0.7.75',
    date: '2026-10-21',
    title: { da: 'Problembørn kan rehabiliteres, holdkemi forklaret og ny startmenu', en: 'Troublemakers can be rehabilitated, chemistry explained and a new start menu' },
    items: [
      { da: 'Problembørn og hidsige spillere kan nu falde til ro over tid: spillersiden viser rehabiliteringen med det, der hjælper (ledere, trænere med disciplin, spilletid, god moral, fair straf efter episoder) og det, der trækker ned', en: 'Troublemakers and hot-headed players can now calm down over time: the player page shows their rehabilitation with what helps (leaders, coaches with discipline, playing time, good morale, fair punishment after incidents) and what holds them back' },
      { da: 'Holdkemi: "Hvad giver ekstra?" forklarer hver faktor, hvor meget den kan give, og hvordan du forbedrer den – og hvad effekten på præstationen betyder', en: 'Team chemistry: "What gives extra?" explains each factor, how much it can give and how to improve it – and what the effect on performance means' },
      { da: 'Træning: filtrér truppen på position, alder og træning, vis kun spillere hvor assistenten foreslår andet, og sortér', en: 'Training: filter the squad by position, age and schedule, show only players where the assistant suggests otherwise, and sort' },
      { da: 'Indbakke: ⚙ Nyheder vælger hvilke klubber og kategorier du får nyheder om (flyttet fra Indstillinger)', en: 'Inbox: ⚙ News chooses which clubs and categories you get news about (moved from Options)' },
      { da: 'Kamprapporten har nu altid kommentar – også for kampe, der blev simuleret', en: 'The match report now always has commentary – also for simulated matches' },
      { da: 'Statistik og momentum viser modstanderen i sin egen klubfarve, og målikonerne ligger ikke længere oven i holdnavnene', en: 'Statistics and momentum show the opponent in their own club colour, and the goal icons no longer cover the team names' },
      { da: 'Landenavne er på dansk i den danske udgave, og AI-tekster skrives på det sprog, spillet står på', en: 'Country names are translated, and AI texts are written in the language the game is set to' },
      { da: 'Startmenuen har fået forsidens udseende, og "Spil gratis nu" bliver ikke længere blå ved hover', en: 'The start menu now matches the front page, and "Play free now" no longer turns blue on hover' },
      { da: '"Tilbyd kontrakt" er slået fra, når transfervinduet er lukket, og holdmødet er fjernet fra trupsiden', en: '"Offer contract" is disabled when the transfer window is closed, and the team meeting has been removed from the squad page' },
    ],
  },
  {
    version: '0.7.74',
    date: '2026-10-21',
    title: { da: 'Straffesparkskonkurrence live og bedre kampvisning på mobil', en: 'Live penalty shoot-outs and a better match view on mobile' },
    items: [
      { da: 'Pokalkampe, der står lige efter forlænget spilletid, afgøres nu i en straffesparkskonkurrence, du kan følge spark for spark – i 2D står spillerne i midtercirklen, skytten går frem til pletten, og målmanden kaster sig', en: 'Cup ties level after extra time now go to a penalty shoot-out you can follow kick by kick – in 2D the players wait in the centre circle, the taker walks up to the spot and the keeper dives' },
      { da: 'En tavle på banen viser hvert holds spark (✓/✕), stillingen i straffesparkskonkurrencen står ved minuttet, og kamprapporten viser alle skytter med redninger og forbiskud', en: 'A board on the pitch shows each side\'s kicks (✓/✕), the shoot-out score sits next to the minute, and the match report lists every taker with saves and misses' },
      { da: 'Konkurrencen følger reglerne: fem spark hver, afgjort så snart det ene hold ikke kan indhente det andet, derefter sudden death med lige mange skytter på hver side', en: 'The shoot-out follows the rules: five kicks each, decided as soon as one side can no longer catch up, then sudden death with the same number of takers on each side' },
      { da: 'Mobil: resultattavlen er én kompakt række, der bliver stående øverst, fanerne er én række, du kan rulle sidelæns, og 2D-banen har større spillere – kampen kan ses uden at rulle ned, og siden flyder ikke længere ud over kanten', en: 'Mobile: the scoreboard is one compact row that stays at the top, the tabs are a single row you can swipe, and the 2D pitch has bigger players – the match is visible without scrolling and the page no longer overflows sideways' },
      { da: 'Mobil: optakten og kamprapporten viser holdnavnene uden at de løber ind i hinanden, og kommentaren fylder hele bredden', en: 'Mobile: the preview and match report show team names without overlapping, and the commentary uses the full width' },
    ],
  },
  {
    version: '0.7.73',
    date: '2026-10-19',
    title: { da: 'Pressemøder med 56 slags spørgsmål og egne svar', en: 'Press conferences with 56 kinds of questions and tailored answers' },
    items: [
      { da: '33 nye spørgsmålstyper (56 i alt): sene sejrsmål, comebacks, dommeren, målmandsfejl, boldbesiddelse uden sejr, transfervinduet og deadline day, kontraktforhandlinger, veteraner, lejespillere, skadeskrise, tæt kampprogram, pokalen, underdog-kampe, økonomien, jobrygter, sæsonstart, oprykningskamp, karantæner, jeres spillestil (defensiv/offensiv/højt pres/lange bolde), træthed og stemningen i omklædningsrummet', en: '33 new question types (56 in total): late winners, comebacks, the referee, goalkeeper errors, possession without winning, the transfer window and deadline day, contract talks, veterans, loan players, injury crises, fixture congestion, the cup, underdog games, finances, job rumours, season start, promotion races, suspensions, your playing style (defensive/attacking/high press/long balls), fatigue and the dressing-room mood' },
      { da: 'Hvert spørgsmål har sine egne 3–4 svar som rigtige citater – og effekten (trup, fans, bestyrelse, presse, spiller, modstander) står under hvert svar, før du vælger', en: 'Each question has its own 3–4 answers as real quotes – and the effect (squad, fans, board, press, player, opponent) is shown under each answer before you choose' },
      { da: 'Samme spørgsmål kommer sjældnere igen ved de næste pressemøder, så der er mere variation', en: 'The same question comes back less often at the next press conferences, for more variety' },
    ],
  },
  {
    version: '0.7.72',
    date: '2026-10-19',
    title: { da: '10 nye højdepunkter styret af attributter og taktik', en: '10 new highlights driven by attributes and tactics' },
    items: [
      { da: 'Nye situationer i kampene, hver med sin egen 2D-afspilning og kommentar: kontraangreb (kontra + fart), gennembrudsaflevering (instruktion + kreativitet/løb), indlæg og hovedstød, driblingssolo (løb med bolden + dribling/flair), langskud, direkte frispark med mur, cutback fra baglinjen, højt pres (presspil "Ofte" + arbejdsrate/aggression), redningstackling (tackling/fart – med hårde tacklinger risiko for straffe og kort) og stolpe/overligger med returbold', en: 'New match situations, each with its own 2D replay and commentary: counter-attacks (counter + pace), through balls (instruction + creativity/runs), crosses and headers, solo dribbles (run with ball + dribbling/flair), long shots, direct free kicks with a wall, cutbacks from the byline, high press (closing down "Often" + work rate/aggression), last-ditch tackles (tackling/pace – with hard tackling a risk of penalties and cards) and woodwork with rebounds' },
      { da: 'Transfersøgning: "Kun klubløse", "Kun til salg" og "Udløbende kontrakt" lægges nu sammen (fx klubløse og spillere med udløbende kontrakt) – de øvrige filtre skal stadig alle være opfyldt', en: 'Transfer search: "Free agents only", "Listed only" and "Expiring contract" now combine (e.g. free agents and players with expiring contracts) – the other filters must still all match' },
      { da: 'Højdepunkterne er mærket med typen (KONTRA, GENNEMBRUD, INDLÆG …), så du kan se, hvad din taktik skaber', en: 'Highlights are labelled by type (COUNTER, THROUGH BALL, CROSS …) so you can see what your tactics create' },
    ],
  },
  {
    version: '0.7.71',
    date: '2026-10-19',
    title: { da: 'Budkrig mellem managere', en: 'Bidding wars between managers' },
    items: [
      { da: 'Byder to managere på samme spiller eller staff, starter en ⚔️ budkrig: begge får besked og kan hæve deres bud én gang – blindt – direkte i beskeden. Derefter kommer afsløringen med begge bud side om side', en: 'If two managers bid for the same player or staff member, a ⚔️ bidding war starts: both are told and can raise their bid once – blind – directly in the message. Then comes the reveal with both bids side by side' },
      { da: 'Pressen dækker det: alle managere får overskriften "Transferkrig: A og B slås om X" – og resultatet bagefter', en: 'The press covers it: all managers get the headline "Transfer war: A and B battle for X" – and the result afterwards' },
    ],
  },
  {
    version: '0.7.70',
    date: '2026-10-19',
    title: { da: 'Vælg selv tempoet i kampe mellem managere', en: 'Choose the pace in matches between managers' },
    items: [
      { da: 'I kampe mellem to managere vælger I hver jeres tempo (1×, 2× eller 4×) – kampen kører med det langsomste af de to valg, så ingen bliver presset', en: 'In matches between two managers you each pick a pace (1×, 2× or 4×) – the match runs at the slower of the two, so nobody is rushed' },
      { da: 'Standard er nu 3 min. pr. halvleg ved 1× (værten kan vælge 1–10 min.)', en: 'The default is now 3 min. per half at 1× (the host can pick 1–10 min.)' },
    ],
  },
  {
    version: '0.7.69',
    date: '2026-10-19',
    title: { da: 'Kampen mod en anden manager kører videre', en: 'The match against another manager keeps running' },
    items: [
      { da: 'Rettet: klikkede hjemmeholdets manager rundt i spillet under en kamp mod en anden manager, gik kampen i stå. Nu kører den videre i baggrunden (udeholdet ser den stadig live), og du kan vende tilbage når som helst via "Til kampen"', en: 'Fixed: if the home manager clicked around the game during a match against another manager, the match stalled. Now it keeps running in the background (the away side still sees it live), and you can return at any time via "To the match"' },
    ],
  },
  {
    version: '0.7.68',
    date: '2026-10-19',
    title: { da: 'Advarsel mod at genindlæse under kampen', en: 'Warning against reloading during a match' },
    items: [
      { da: 'Browseren advarer, hvis du prøver at genindlæse eller lukke siden under en kamp, og kampskærmen skriver konsekvensen (kampen starter forfra – i en kamp mod en anden manager for jer begge)', en: 'The browser warns you if you try to reload or close the page during a match, and the match screen states the consequence (the match starts over – for both of you in a match against another manager)' },
      { da: 'Rettet: genindlæste hjemmeholdet under en kamp mod en anden manager, hang kampen på "Venter på Klar til kamp". Udeholdet melder nu automatisk klar igen', en: 'Fixed: if the home side reloaded during a match against another manager, the match got stuck on "Waiting for Ready for kick-off". The away side now automatically reports ready again' },
    ],
  },
  {
    version: '0.7.67',
    date: '2026-10-19',
    title: { da: 'Skader og røde kort pauser kampen', en: 'Injuries and red cards pause the match' },
    items: [
      { da: 'Bliver en af dine spillere skadet eller udvist, pauses kampen, og du sendes til Taktik, så du selv kan skifte ud og justere formationen. Assistenten skifter ikke længere skadede spillere ud for dig', en: 'If one of your players is injured or sent off, the match pauses and you are taken to Tactics so you can substitute and adjust the formation yourself. The assistant no longer substitutes injured players for you' },
      { da: 'Boldbesiddelse vises altid i procent (100 % i alt) – også under kampen', en: 'Possession is always shown as a percentage (100% in total) – also during the match' },
      { da: 'Online: "Til kampen"/Klar og "Alle venter på dig" vises ikke i topbjælken, mens du spiller din kamp', en: 'Online: "To the match"/Ready and "Everyone is waiting for you" are not shown in the top bar while you play your match' },
    ],
  },
  {
    version: '0.7.66',
    date: '2026-10-19',
    title: { da: 'Live-kampe mellem to managere', en: 'Live matches between two managers' },
    items: [
      { da: 'Når to managere mødes, spiller begge live: begge trykker "Klar til kamp", der tælles ned 3-2-1, og kampen kører i fast tempo (værten vælger 2–15 min. pr. halvleg, standard 4) – ingen kan pause eller skrue op', en: 'When two managers meet, both play live: both press "Ready for kick-off", there is a 3-2-1 countdown, and the match runs at a fixed pace (the host picks 2–15 min. per half, default 4) – nobody can pause or speed up' },
      { da: 'Begge har fuld kontrol: hele taktiktavlen, udskiftninger og en fælles pause på 60 sek. med peptalk', en: 'Both have full control: the whole tactics board, substitutions and a shared 60-second half-time break with team talk' },
      { da: 'Falder udeholdet fra, tager dets assistent over. Dukker modstanderen ikke op, kan hjemmeholdet starte uden ham efter et minut, og udeholdet kan lade assistenten tage kampen', en: 'If the away side drops out, its assistant takes over. If the opponent does not show up, the home side can start without them after a minute, and the away side can let the assistant take the match' },
    ],
  },
  {
    version: '0.7.65',
    date: '2026-10-19',
    title: { da: 'Online: følg kampen mod en anden manager live', en: 'Online: follow the match against another manager live' },
    items: [
      { da: 'Kampe mellem to managere: hjemmeholdets manager spiller kampen, og udeholdets manager følger den live (2D, kommentar, karakterer, stilling) og kan skifte ud og ændre mentalitet undervejs', en: 'Matches between two managers: the home manager plays the match, and the away manager follows it live (2D, commentary, ratings, score) and can make substitutions and change mentality along the way' },
      { da: 'Transfervinduerne er fælles i online-spil og kan kun ændres af værten', en: 'Transfer windows are shared in online games and can only be changed by the host' },
    ],
  },
  {
    version: '0.7.64',
    date: '2026-10-19',
    title: { da: 'Online: spil dine kampe live', en: 'Online: play your matches live' },
    items: [
      { da: 'Online-spil stopper nu på kampdagen før kampene: Klar-knappen bliver til "Til kampen", og du spiller din kamp live med 2D, taktik og udskiftninger – præcis som i singleplayer. Resultatet sendes til værten. Vil du ikke se den, kan du tage et hurtigt resultat', en: 'Online games now stop on match day before the matches: the Ready button becomes "To the match", and you play your match live with 2D, tactics and substitutions – exactly like single player. The result is sent to the host. If you do not want to watch, take a quick result' },
      { da: 'Kampe mellem to managere spilles af hjemmeholdets manager. Når ingen når at spille, tager assistenten kampen', en: 'Matches between two managers are played by the home manager. If nobody plays, the assistant takes the match' },
      { da: 'Trækkene stopper nu efter samme regel som Fortsæt i singleplayer: så snart en manager får bud, pressemøder, bestyrelsesmøder eller andet at forholde sig til', en: 'Turns now stop by the same rule as Continue in single player: as soon as a manager gets bids, press conferences, board meetings or anything else to deal with' },
    ],
  },
  {
    version: '0.7.63',
    date: '2026-10-19',
    title: { da: 'Rettelser: klubfarver og online-værten', en: 'Fixes: club colours and the online host' },
    items: [
      { da: 'Rettet: de nye Superliga-farver blev læst forkert, så menuen blev hvid. Nu får fx FC København blå menu og Vejle rød', en: 'Fixed: the new Superliga colours were read incorrectly, so the menu turned white. Now e.g. FC København gets a blue menu and Vejle a red one' },
      { da: 'Rettet: værten fik to simuleringsvisninger oven i hinanden', en: 'Fixed: the host got two simulation screens on top of each other' },
      { da: 'Rettet: værten kunne ende i en lokal kopi af online-spillet (uden de andre spillere) efter en genindlæsning. Online-spil gemmes nu aldrig lokalt, og en gammel kopi springes over til fordel for online-spillet', en: 'Fixed: the host could end up in a local copy of the online game (without the other players) after a reload. Online games are never saved locally now, and an old copy is skipped in favour of the online game' },
    ],
  },
  {
    version: '0.7.62',
    date: '2026-10-19',
    title: { da: 'Simuleringsvisning i online-spil', en: 'Simulation screen in online games' },
    items: [
      { da: 'Online: så snart alle er klar, vises en simuleringsvisning for alle spillere – hvem der simulerer (værten), hvor langt der spilles frem, og næste kamp. Den forsvinder af sig selv, når det nye træk er klar (og kan skjules)', en: 'Online: as soon as everyone is ready, a simulation screen is shown to all players – who is simulating (the host), how far ahead it plays, and the next match. It disappears by itself when the new turn is ready (and can be hidden)' },
    ],
  },
  {
    version: '0.7.61',
    date: '2026-10-19',
    title: { da: 'Værten simulerer, og rigtige Superliga-farver', en: 'The host simulates, and proper Superliga colours' },
    items: [
      { da: 'Online: det er nu værten, der simulerer trækket. De andre tager kun over, hvis værten ikke er online efter 45 sekunder', en: 'Online: the host now simulates the turn. Others only take over if the host is not online after 45 seconds' },
      { da: 'Superliga-klubberne har fået deres rigtige farver (fx FC København blå/hvid, Viborg grøn/hvid) – før blev de gættet ud fra logoet', en: 'Superliga clubs now have their real colours (e.g. FC København blue/white, Viborg green/white) – previously they were guessed from the crest' },
    ],
  },
  {
    version: '0.7.60',
    date: '2026-10-19',
    title: { da: 'Tydeligere invitation og egne farver i lobbyen', en: 'Clearer invite and own colours in the lobby' },
    items: [
      { da: 'Online: "🔗 Invitér" åbner nu en boks med den store kode, linket, Kopiér link og Del…', en: 'Online: "🔗 Invite" now opens a box with the big code, the link, Copy link and Share…' },
      { da: 'Rettet: mens man venter i lobbyen på at komme med, blev værtens klubfarver vist – nu bruges farverne fra den klub, du selv har valgt', en: 'Fixed: while waiting in the lobby to join, the host\'s club colours were shown – now the colours of the club you picked are used' },
    ],
  },
  {
    version: '0.7.59',
    date: '2026-10-19',
    title: { da: 'Klubfarver uden fejlfarver', en: 'Club colours without wrong colours' },
    items: [
      { da: 'Rettet: "Slet" under Mine online spil gjorde ikke noget synligt – nu forsvinder spillet fra listen (efter en bekræftelse)', en: 'Fixed: "Delete" under My online games did nothing visible – the game now disappears from the list (after a confirmation)' },
      { da: 'Rettet: når klublogoet ikke var hentet endnu (fx i et nyt spil), kunne menuen få forkerte tilfældige farver (Vejle blev blå). Nu vises det neutrale tema, indtil de rigtige farver er klar, og der prøves automatisk igen', en: 'Fixed: if the club crest had not loaded yet (e.g. in a new game), the menu could get random wrong colours (Vejle turned blue). Now the neutral theme is shown until the real colours are ready, with automatic retries' },
    ],
  },
  {
    version: '0.7.58',
    date: '2026-10-19',
    title: { da: 'Individuelle instruktioner i nyt design', en: 'Individual instructions redesigned' },
    items: [
      { da: 'Individuelle instruktioner bruger nu samme knapgrupper som holdinstruktionerne (Med bolden / Uden bolden / Rolle) med korte forklaringer', en: 'Individual instructions now use the same button groups as team instructions (In possession / Out of possession / Role) with short explanations' },
      { da: 'Mentalitet står på én linje (kortere navne), og kolonnerne lægger sig under hinanden, når der ikke er plads', en: 'Mentality fits on one line (shorter labels), and columns stack when space is tight' },
    ],
  },
  {
    version: '0.7.57',
    date: '2026-10-19',
    title: { da: 'Jubel – og så VAR', en: 'Celebrations – then VAR' },
    items: [
      { da: 'Annullerede mål er nu et rigtigt drama: først "MÅL!" og stillingen går op, så "VAR tjekker…" (eller linjedommerens flag), og så bliver målet taget fra jer igen. Både på 2D-banen og i kommentaren', en: 'Disallowed goals are now real drama: first "GOAL!" and the score goes up, then "VAR is checking…" (or the linesman\'s flag), and then the goal is taken away again. On the 2D pitch and in the commentary' },
      { da: 'Offside-mål sker oftere – cirka i hver tredje kamp bliver et mål annulleret', en: 'Offside goals happen more often – roughly every third match has a goal ruled out' },
    ],
  },
  {
    version: '0.7.56',
    date: '2026-10-19',
    title: { da: 'Fortryd og pænere holdinstruktioner', en: 'Undo and nicer team instructions' },
    items: [
      { da: 'Taktik: ny Fortryd-knap (og Cmd/Ctrl+Z) – klik dig tilbage gennem de seneste ændringer af opstilling, formation og instruktioner', en: 'Tactics: new Undo button (and Cmd/Ctrl+Z) – step back through recent changes to lineup, formation and instructions' },
      { da: 'Holdinstruktionerne er nu knapgrupper delt i "Med bolden" og "Uden bolden", med en kort forklaring af hver', en: 'Team instructions are now button groups split into "In possession" and "Out of possession", each with a short explanation' },
    ],
  },
  {
    version: '0.7.55',
    date: '2026-10-19',
    title: { da: 'Hjørnespark i 2D', en: 'Corners in 2D' },
    items: [
      { da: 'Hjørnespark vises nu på 2D-banen: skytten ved flaget, spillerne samles i feltet med markering, indlægget slås ind – og så ser du udfaldet: hovedstød/skud (mål, redning, forbi) eller at forsvaret rydder', en: 'Corners are now shown on the 2D pitch: the taker at the flag, players gathering in the box with markers, the delivery – and then the outcome: header/shot (goal, save, wide) or the defence clearing' },
    ],
  },
  {
    version: '0.7.54',
    date: '2026-10-19',
    title: { da: 'Tydelige udskiftere under kampen', en: 'Clear substitutes during the match' },
    items: [
      { da: 'Fanen "Mit hold" er væk – alt samles under "Taktik", der viser hvor mange udskiftninger du har tilbage', en: 'The "My team" tab is gone – everything is under "Tactics", which shows how many substitutions you have left' },
      { da: 'Øverst under Taktik står bænken som kort med position og kondition. Vælg "Skift ind for…" og se hvem der er på banen med position, kondition, gule kort og karakter', en: 'At the top of Tactics the bench is shown as cards with position and condition. Pick "Bring on for…" and see who is on the pitch with position, condition, yellow cards and rating' },
      { da: 'U (udskiftninger) åbner nu Taktik', en: 'U (substitutions) now opens Tactics' },
    ],
  },
  {
    version: '0.7.53',
    date: '2026-10-19',
    title: { da: 'Mellemrum starter og pauser kampen', en: 'Space plays and pauses the match' },
    items: [
      { da: 'Under kampen starter og pauser mellemrumstasten kampen (ligesom P). Før kampen giver den kick-off, og efter slutfløjt går den videre', en: 'During the match the space bar plays and pauses (like P). Before the match it kicks off, and after full time it moves on' },
    ],
  },
  {
    version: '0.7.52',
    date: '2026-10-19',
    title: { da: 'Ryddeligere topbjælke under kampen', en: 'Cleaner top bar during matches' },
    items: [
      { da: 'Rettet: beløb i nyheder (fx det nye transferbudget i januar) blev vist som et rå tal – nu formateres de som beløb, og over en milliard vises som "mia."', en: 'Fixed: amounts in news (e.g. the new transfer budget in January) were shown as raw numbers – they are now formatted, and amounts over a billion show as "bn"' },
      { da: 'På kampskærmen skjules "Til kampen", "Næste kamp" og "Næste: …" i topbjælken – kampen styres inde på skærmen, og efter slutfløjt fører Fortsæt (eller mellemrum) videre', en: 'On the match screen, "To the match", "Next match" and "Next: …" are hidden from the top bar – the match is controlled on the screen, and after full time Continue (or space) moves on' },
    ],
  },
  {
    version: '0.7.51',
    date: '2026-10-19',
    title: { da: 'Offside, VAR og bedre 2D-højdepunkter', en: 'Offside, VAR and better 2D highlights' },
    items: [
      { da: 'Nyt: mål kan blive annulleret for offside. Linjedommeren kan tage fejl – men i ligaer og turneringer med VAR (de store ligaer, Superligaen, Europa og pokalfinaler) bliver tætte situationer tjekket og rettet', en: 'New: goals can be ruled out for offside. The linesman can get it wrong – but in leagues and competitions with VAR (the big leagues, the Danish Superliga, Europe and cup finals) close calls are checked and corrected' },
      { da: '2D: teksten følger nu billederne (opspil → aflevering → afslutning → udfald), og udfaldet og stillingen afsløres først, når bolden er i nettet', en: '2D: the text now follows the frames (build-up → pass → shot → outcome), and the outcome and score are only revealed when the ball is in the net' },
      { da: '2D: straffespark vises rigtigt – skytten ved pletten, målmanden på stregen, alle andre uden for feltet', en: '2D: penalties are shown properly – taker at the spot, keeper on the line, everyone else outside the box' },
      { da: 'Pausen kommer først, når et højdepunkt er færdigt', en: 'Half-time only starts once a highlight has finished' },
      { da: 'Rettet: efter et jobskifte kunne den gamle klubs kamp stadig vises – nu kommer du til indbakken', en: 'Fixed: after changing jobs the old club\'s match could still be shown – you now go to the inbox' },
    ],
  },
  {
    version: '0.7.50',
    date: '2026-10-19',
    title: { da: 'Jobskifte på en kampdag', en: 'Changing jobs on a match day' },
    items: [
      { da: 'Rettet: skiftede du job (eller sagde op) på en kampdag, skulle du stadig spille den gamle klubs kamp. Nu spilles den automatisk, og du starter rent i den nye klub', en: 'Fixed: if you changed jobs (or resigned) on a match day, you still had to play the old club\'s match. Now it is played automatically, and you start fresh at the new club' },
      { da: 'Saves med en hængende kamp fra en tidligere klub repareres automatisk, næste gang du trykker Fortsæt', en: 'Saves with a stuck match from a previous club are repaired automatically the next time you press Continue' },
    ],
  },
  {
    version: '0.7.49',
    date: '2026-10-19',
    title: { da: '2D-højdepunkter', en: '2D highlights' },
    items: [
      { da: '2D-banen viser nu højdepunkter: ved mål, store chancer, frispil og straffespark stopper kampen, og aktionen afspilles – opspil, aflevering og afslutning – med præcis det udfald, der skete (mål, redning, forbi)', en: 'The 2D pitch now shows highlights: for goals, big chances, one-on-ones and penalties the match pauses and the move is replayed – build-up, pass and shot – with exactly the outcome that happened (goal, save, wide)' },
      { da: 'Mellem højdepunkterne står holdene i ro i deres formation, og kommentaren kører i den gule bjælke', en: 'Between highlights the teams stand still in their formation, and the commentary runs in the yellow bar' },
      { da: 'Efter peptalken i pausen kommer du tilbage til den visning, du kom fra', en: 'After the half-time team talk you return to the view you came from' },
    ],
  },
  {
    version: '0.7.48',
    date: '2026-10-19',
    title: { da: 'Andre kampe fra samme liga', en: 'Other matches from the same league' },
    items: [
      { da: 'Under kampen viser "Andre kampe" kun kampe fra samme turnering som din egen', en: 'During the match, "Other matches" only shows matches from the same competition as your own' },
    ],
  },
  {
    version: '0.7.47',
    date: '2026-10-19',
    title: { da: 'Bedre taktiktavle', en: 'Better tactics board' },
    items: [
      { da: 'Træk en spiller ud på en tom plet på banen for at flytte hans plads (fx en angriber ned som offensiv midtbane) – slip ham oven på en anden for at bytte', en: 'Drag a player onto an empty spot on the pitch to move his position (e.g. a striker back to attacking midfield) – drop him on another player to swap' },
      { da: 'Pilene: offensiv = pil frem, balanceret = ingen pil, defensiv = gul pil tilbage', en: 'Arrows: attacking = arrow forward, balanced = no arrow, defensive = yellow arrow back' },
      { da: 'Rettet: den valgte spiller på tavlen fik en grå boks omkring sig, og trækbilledet er nu et rent navneskilt', en: 'Fixed: the selected player on the board got a grey box around him, and the drag image is now a clean name tag' },
    ],
  },
  {
    version: '0.7.46',
    date: '2026-10-19',
    title: { da: 'Kampskærm i CM-stil', en: 'CM-style match screen' },
    items: [
      { da: 'Store holdbjælker i holdenes farver med stor score og minuttet i en boks – som i det klassiske spil', en: 'Big team bars in the teams\' colours with a big score and the minute in a box – like the classic game' },
      { da: 'Ny fane "Spillerkarakterer": begge hold side om side med trøjenummer, karakter, mål, kort og ind/ud-minut; reserver står nedtonet', en: 'New "Player ratings" tab: both teams side by side with shirt number, rating, goals, cards and on/off minute; substitutes are dimmed' },
      { da: 'Faner til andre kampe og stillingen under kampen, og stadion står nederst', en: 'Tabs for other matches and the table during the match, and the stadium is shown at the bottom' },
    ],
  },
  {
    version: '0.7.45',
    date: '2026-10-19',
    title: { da: 'Taktiktavle som i det rigtige spil', en: 'Tactics board like the real game' },
    items: [
      { da: '"Flyt pladser": træk spillerne rundt på tavlen og lav din egen formation – pladsens rolle (D, WB, DM, M, AM, ANG) følger, hvor den står, og kampmotoren bruger de nye placeringer', en: '"Move positions": drag players around the board to make your own formation – the position\'s role (D, WB, DM, M, AM, ST) follows where it stands, and the match engine uses the new positions' },
      { da: 'Stiplede pile viser, hvor meget hver spiller går med frem', en: 'Dashed arrows show how much each player gets forward' },
      { da: 'Højreklik (langt tryk på mobil) på en spiller: defensiv/balanceret/offensiv rolle, langskud, indlæg, løb med bolden, gennembrudsafleveringer, tæt markering og fri rolle', en: 'Right-click (long press on mobile) a player: defensive/balanced/attacking role, long shots, crosses, run with ball, through balls, tight marking and free role' },
    ],
  },
  {
    version: '0.7.44',
    date: '2026-10-19',
    title: { da: 'Mere ægte 2D-bevægelser', en: 'More realistic 2D movement' },
    items: [
      { da: '2D-banen: bolden er altid ved en spiller – boldholderen eller, efter et boldtab, holdkammeraten nærmest bolden', en: '2D pitch: the ball is always with a player – the ball carrier or, after losing the ball, the teammate nearest to it' },
      { da: 'Spillerne holder sig tættere på deres pladser i formationen, bevæger sig roligere og står ikke længere oven i hinanden', en: 'Players stay closer to their positions in the formation, move more calmly and no longer stand on top of each other' },
    ],
  },
  {
    version: '0.7.43',
    date: '2026-10-19',
    title: { da: 'Stabile klubfarver', en: 'Stable club colours' },
    items: [
      { da: 'Rettet: klubtemaet kunne skifte farve mellem indlæsninger (fx Manchester United sort i stedet for rød), når logoet ikke var hentet endnu', en: 'Fixed: the club theme could change colour between loads (e.g. Manchester United black instead of red) when the crest had not loaded yet' },
      { da: 'Klubfarverne huskes i browseren, så det rigtige tema vises med det samme uden at blinke', en: 'The club colours are remembered in the browser, so the right theme is shown immediately without flickering' },
    ],
  },
  {
    version: '0.7.42',
    date: '2026-10-19',
    title: { da: '2D-kampvisning', en: '2D match view' },
    items: [
      { da: 'Se kampen på en klassisk 2D-bane: spillerne bevæger sig mellem deres forsvars- og angrebspositioner fra taktikken, holdet trækker sig sammen mod bolden, og den nærmeste modspiller presser boldholderen', en: 'Watch the match on a classic 2D pitch: players move between their defensive and attacking positions from the tactics, the team shifts towards the ball, and the nearest opponent presses the ball carrier' },
      { da: 'Ændrer du mentalitet, bredde eller løb under kampen, kan du se det på banen. Boldholderen vises med navn, og kommentaren kører i den gule bjælke', en: 'Change mentality, width or runs during the match and you can see it on the pitch. The ball carrier is shown by name, and the commentary runs in the yellow bar' },
      { da: 'Vælg mellem 2D-bane og kommentar – spillet husker dit valg', en: 'Choose between 2D pitch and commentary – the game remembers your choice' },
    ],
  },
  {
    version: '0.7.41',
    date: '2026-10-19',
    title: { da: 'Notifikationer med ét klik', en: 'Notifications in one click' },
    items: [
      { da: 'Ny 🔔-knap i topbjælken slår browser-notifikationer til med ét klik (vises kun, indtil de er slået til)', en: 'New 🔔 button in the top bar turns on browser notifications in one click (only shown until they are on)' },
      { da: 'Når browseren tillader det, er der også en "Installér app"-knap – så kører spillet i sit eget vindue, og notifikationer virker på mobilen', en: 'When the browser allows it, there is also an "Install app" button – the game then runs in its own window, and notifications work on mobile' },
    ],
  },
  {
    version: '0.7.40',
    date: '2026-10-19',
    title: { da: 'Agenter, dårlige kontrakter, notifikationer og mobil', en: 'Agents, bad contracts, notifications and mobile' },
    items: [
      { da: 'Hver spiller har en agent med personlighed: grisk (højere lønkrav), hård, venlig (accepterer lidt under kravet), loyal (billig at forlænge) eller "vil til en storliga" (afviser skifter i samme land eller til mindre ligaer). Agenten står på spillerprofilen', en: 'Every player has an agent with a personality: greedy (higher wage demands), tough, friendly (accepts a little below the demand), loyal (cheap to extend) or "wants a bigger league" (rejects moves within the country or to smaller leagues). The agent is shown on the player profile' },
      { da: 'Bestyrelsen kommenterer dyre spillere, der ikke spiller, og en lønsum over budget – det koster lidt tillid', en: 'The board comments on expensive players who don\'t play and on a wage bill over budget – it costs a little confidence' },
      { da: 'Browser-notifikationer (slå til under Indstillinger): når det er din tur i multiplayer, og ved bud, jobtilbud og andet vigtigt, mens spillet ligger i en anden fane', en: 'Browser notifications (turn on in Options): when it\'s your turn in multiplayer, and for offers, job offers and other important things while the game is in another tab' },
      { da: 'Mobil: kompakt topbjælke og en fast bundmenu med Indbakke, Trup, Taktik, Transfers og Mere', en: 'Mobile: compact top bar and a fixed bottom menu with Inbox, Squad, Tactics, Transfers and More' },
    ],
  },
  {
    version: '0.7.39',
    date: '2026-10-19',
    title: { da: 'Rigtige klubfarver', en: 'Real club colours' },
    items: [
      { da: 'Klubtemaet bruger klubbens officielle farver (fra Wikidata) for ca. 250 klubber – fx Manchester United rød/hvid, Juventus sort/hvid – med den præcise nuance fra logoet', en: 'The club theme uses the club\'s official colours (from Wikidata) for about 250 clubs – e.g. Manchester United red/white, Juventus black/white – with the exact shade from the crest' },
      { da: 'Rettet: klubtemaet kunne falde tilbage på tilfældige farver, hvis logoerne ikke var hentet endnu', en: 'Fixed: the club theme could fall back to random colours if the crests had not loaded yet' },
      { da: 'Hvid tekst på farvede flader – mørk tekst kun på rigtig lyse farver som gul og hvid', en: 'White text on coloured surfaces – dark text only on really light colours such as yellow and white' },
    ],
  },
  {
    version: '0.7.38',
    date: '2026-10-19',
    title: { da: 'Klubtema i to farver', en: 'Two-colour club theme' },
    items: [
      { da: 'Klubtemaet bruger klubbens to farver: menuen i den ene, topbjælken i den anden (fx Brøndby blå/gul, Vejle rød/hvid) – tekst og ikoner skifter automatisk til hvid eller mørk, så kontrasten altid er skarp', en: 'The club theme uses the club\'s two colours: the menu in one, the top bar in the other (e.g. Brøndby blue/yellow, Vejle red/white) – text and icons switch automatically to white or dark so the contrast is always sharp' },
      { da: 'Links og knapper på den hvide flade får en klubfarve med god kontrast, og trøjerne på taktiktavlen er i klubbens farver', en: 'Links and buttons on the white surface get a club colour with good contrast, and the shirts on the tactics board are in the club\'s colours' },
      { da: 'Lyst tema: spillernavne på banen, mærkater, attributter og karakterer har fået farver, der kan læses på lys baggrund', en: 'Light theme: player names on the pitch, tags, attributes and ratings now have colours that are readable on a light background' },
    ],
  },
  {
    version: '0.7.37',
    date: '2026-10-19',
    title: { da: 'Opsig jobbet', en: 'Resign' },
    items: [
      { da: 'Ny knap "Opsig jobbet" i Jobcenter: du bliver arbejdsløs og kan søge nye job. Siger du op midt i sæsonen, koster det lidt omdømme', en: 'New "Resign" button in the Job centre: you become unemployed and can apply for new jobs. Resigning mid-season costs a little reputation' },
    ],
  },
  {
    version: '0.7.36',
    date: '2026-10-19',
    title: { da: 'Mere luft i topbjælken', en: 'More room in the top bar' },
    items: [
      { da: 'Hjælpeteksten om Fortsæt i online-spil er fjernet, og topbjælkens elementer holdes på én linje', en: 'The help text about Continue in online games has been removed, and the top bar items stay on one line' },
    ],
  },
  {
    version: '0.7.35',
    date: '2026-10-19',
    title: { da: 'Klubbens farver som standard', en: 'Club colours by default' },
    items: [
      { da: 'Spillet bruger nu som standard klubbens farver på lys baggrund – farverne holdes tro mod logoet (fx Vejles røde i stedet for en lyserød)', en: 'The game now uses the club\'s colours on a light background by default – the colours stay true to the crest (e.g. Vejle\'s red instead of a pink)' },
      { da: 'Er en af logoets farver hvid, bruges klubbens hovedfarve; klubfarver på mørk baggrund kan stadig vælges under Indstillinger', en: 'If one of the crest\'s colours is white, the club\'s main colour is used; club colours on a dark background can still be chosen in Options' },
    ],
  },
  {
    version: '0.7.34',
    date: '2026-10-19',
    title: { da: 'Værtens kontrolpanel', en: 'Host controls' },
    items: [
      { da: 'Den der startede et online-spil, har en 👑 Vært-knap: se hvem der er klar, tving et træk igennem (assistenten passer holdene for dem, der ikke er klar) eller fjern spillere, der er gået offline', en: 'Whoever started an online game has a 👑 Host button: see who is ready, force a turn through (the assistant looks after the teams of those who aren\'t ready) or remove players who have gone offline' },
      { da: 'En fjernet spillers klub overtages af en AI-manager fra næste træk', en: 'A removed player\'s club is taken over by an AI manager from the next turn' },
    ],
  },
  {
    version: '0.7.33',
    date: '2026-10-19',
    title: { da: 'Lønforhandling med staff og mellemrumstasten', en: 'Staff wage talks and the space bar' },
    items: [
      { da: 'Når du ansætter staff, vælger du selv lønnen ud fra deres krav. I multiplayer vælger de dagen efter det bedste tilbud – klubbens omdømme tæller lidt med', en: 'When you hire staff, you choose the wage based on their demand. In multiplayer they pick the best offer the next day – the club\'s reputation counts a little' },
      { da: 'Mellemrumstasten trykker ikke længere på en knap, der har fokus (fx Indbakke), og online melder den dig ikke fra igen, når du allerede er klar', en: 'The space bar no longer presses a focused button (e.g. Inbox), and online it no longer un-readies you when you are already ready' },
    ],
  },
  {
    version: '0.7.32',
    date: '2026-10-19',
    title: { da: 'Kamp om spillere og staff i multiplayer', en: 'Competition for players and staff in multiplayer' },
    items: [
      { da: 'Multiplayer: frie spillere, Bosman-spillere og staff ansættes ikke længere med det samme – alle kan give et tilbud, og dagen efter vælger de, hvor de vil hen', en: 'Multiplayer: free agents, Bosman players and staff are no longer signed instantly – everyone can make an offer, and the next day they choose where to go' },
      { da: 'Spillere vælger det bedste tilbud i forhold til hvad de kræver (og klubbens omdømme); staff vælger klubben med størst omdømme', en: 'Players choose the best offer relative to their demands (and the club\'s reputation); staff choose the club with the highest reputation' },
      { da: 'Når alle andre er klar, blinker et stort rødt banner "ALLE VENTER PÅ DIG", og Klar-knappen blinker rødt', en: 'When everyone else is ready, a big red banner "EVERYONE IS WAITING FOR YOU" flashes, and the Ready button flashes red' },
    ],
  },
  {
    version: '0.7.31',
    date: '2026-10-19',
    title: { da: 'Du bliver ventet på', en: 'They\'re waiting for you' },
    items: [
      { da: 'Online: når alle de andre er klar, pulserer Klar-knappen, og fanen i browseren blinker "Din tur!" – også når du er i en anden fane', en: 'Online: when everyone else is ready, the Ready button pulses and the browser tab blinks "Your turn!" – also when you are in another tab' },
    ],
  },
  {
    version: '0.7.30',
    date: '2026-10-19',
    title: { da: 'Farvetemaer', en: 'Colour themes' },
    items: [
      { da: 'Vælg farvetema under Indstillinger: mørkt, lyst eller klubbens farver', en: 'Choose a colour theme in Options: dark, light or club colours' },
      { da: 'Klubtemaet henter farverne fra logoet på den klub, du styrer (fx blå og gul for Brøndby), og skifter med, når du skifter klub', en: 'The club theme takes the colours from the crest of the club you manage (e.g. blue and yellow for Brøndby) and changes when you change club' },
    ],
  },
  {
    version: '0.7.29',
    date: '2026-10-19',
    title: { da: 'Byttehandler', en: 'Swap deals' },
    items: [
      { da: 'Når du byder, kan du tilbyde op til 3 af dine egne spillere som en del af handlen – listen viser kun spillere, den sælgende klub kunne være interesseret i', en: 'When you bid, you can offer up to 3 of your own players as part of the deal – the list only shows players the selling club might be interested in' },
      { da: 'Byttespillerne tæller med i buddets værdi (mere, hvis de dækker et behov hos klubben), og budvinduet viser kontant + spillere i alt', en: 'Swap players count towards the value of the offer (more if they fill a need at the club), and the offer window shows cash + players in total' },
      { da: 'Byttehandler står i budoversigten og i spillernes karriere', en: 'Swap deals are shown in the offers overview and in the players\' careers' },
    ],
  },
  {
    version: '0.7.28',
    date: '2026-10-19',
    title: { da: 'Farvede karakterer', en: 'Coloured ratings' },
    items: [
      { da: 'Kampkarakterer og snit er farvet overalt: grøn for gode præstationer (7,0+), orange for svage (under 6,5) og rød for dårlige (under 6,0)', en: 'Match ratings and averages are coloured everywhere: green for good performances (7.0+), orange for weak (below 6.5) and red for poor (below 6.0)' },
    ],
  },
  {
    version: '0.7.27',
    date: '2026-10-19',
    title: { da: 'Rivalisering mellem managere', en: 'Rivalry between managers' },
    items: [
      { da: 'Stikpiller i pressen: lang ud efter en anden manager – vinder du jeres næste kamp, fik du ret (fans og medier jubler), taber du, rammer den dig selv. Modstanderens spillere bliver ekstra tændte', en: 'Jabs in the press: have a go at another manager – win your next match and you were right (fans and media cheer), lose and it backfires. The opponent\'s players get extra fired up' },
      { da: 'Prestige-væddemål om næste indbyrdes kamp: taberen betaler vinderen fra klubkassen, uafgjort går lige op. AI-managere tager imod, hvis de tror på deres hold', en: 'Prestige bets on your next match against each other: the loser pays the winner from the club account, a draw is void. AI managers accept if they believe in their team' },
      { da: 'Spiller- og klubnavne i chatten kan klikkes, og AI-managere svarer igen på fornærmelser', en: 'Player and club names in the chat are clickable, and AI managers fire back at insults' },
      { da: 'Online: Fortsæt/Klar viser først de ulæste beskeder (også med mellemrumstasten), og menuen viser, at spillet gemmes automatisk', en: 'Online: Continue/Ready first shows unread messages (also with the space bar), and the menu shows that the game is saved automatically' },
    ],
  },
  {
    version: '0.7.26',
    date: '2026-10-19',
    title: { da: 'Ferie fjernet', en: 'Holiday removed' },
    items: [
      { da: 'Knappen "Ferie…" er fjernet – brug "Næste kamp" eller Fortsæt', en: 'The "Holiday…" button has been removed – use "Next match" or Continue' },
    ],
  },
  {
    version: '0.7.25',
    date: '2026-10-19',
    title: { da: 'Målscorere i kamprapporten', en: 'Scorers in the match report' },
    items: [
      { da: 'Målscorere og røde kort i kamprapporten kan klikkes, og assisten står i parentes', en: 'Scorers and red cards in the match report are clickable, and the assist is shown in brackets' },
    ],
  },
  {
    version: '0.7.24',
    date: '2026-10-19',
    title: { da: '"Du er fremtiden"', en: '"You\'re the future"' },
    items: [
      { da: 'Afviser du et bud på et talent (23 år eller yngre), kan du sige "Du er fremtiden" – det virker, hvis han har potentiale til at blive en af holdets bedste', en: 'When you reject an offer for a talent (23 or younger), you can say "You\'re the future" – it works if he has the potential to become one of the team\'s best' },
      { da: 'Samme besked kan gives i samtalen med spilleren – den løfter moralen og motivationen, men gentager du den for tit, vil han se det på banen', en: 'The same message can be given in the player conversation – it lifts morale and motivation, but repeat it too often and he wants to see it on the pitch' },
    ],
  },
  {
    version: '0.7.23',
    date: '2026-10-19',
    title: { da: 'Trofæer bliver fejret', en: 'Trophies are celebrated' },
    items: [
      { da: 'Vinder du ligaen, pokalen eller en europæisk turnering, hylder bestyrelsen, fansene, anføreren og pressen dig i indbakken', en: 'When you win the league, the cup or a European competition, the board, the fans, the captain and the press salute you in the inbox' },
      { da: 'Trofæet giver et løft i bestyrelsens tillid, fanstemningen, truppens moral og dit manager-omdømme – mest for mesterskaber og Europa', en: 'The trophy boosts board confidence, fan mood, squad morale and your manager reputation – most for league titles and Europe' },
      { da: 'Vinder du igen, kan bestyrelsen godt huske det', en: 'Win it again and the board remembers' },
    ],
  },
  {
    version: '0.7.22',
    date: '2026-10-19',
    title: { da: 'Klubskifter i karrieren og interesse i truppen', en: 'Club moves in the career and interest in the squad' },
    items: [
      { da: 'Karrieren viser klubskifterne med transfersum – også de virkelige skifter før spilstart (fra transfermarkt-datasets), "Fri" for gratis skifter og "?" hvor beløbet ikke er kendt', en: 'The career shows club moves with transfer fees – including real moves before the game started (from transfermarkt-datasets), "Free" for free moves and "?" where the fee is unknown' },
      { da: 'Den nuværende klub vises altid i karrieren, også før spilleren har spillet en kamp, og karrieren fylder nu hele bredden', en: 'The current club is always shown in the career, also before the player has played a match, and the career now uses the full width' },
      { da: 'Et øje-ikon i truppen viser, hvor mange klubber der holder øje med en spiller – hold musen over for at se hvilke', en: 'An eye icon in the squad shows how many clubs are watching a player – hover to see which' },
    ],
  },
  {
    version: '0.7.21',
    date: '2026-10-19',
    title: { da: 'Spillere, der ikke vil forlænge', en: 'Players who won\'t extend' },
    items: [
      { da: 'I sidste kontraktår kan en spiller sige, at han ikke vil forlænge – fordi han vil videre, mangler spilletid eller er underbetalt – og beder om en samtale', en: 'In the last year of his contract a player may say he won\'t extend – because he wants to move on, lacks playing time or is underpaid – and asks for a talk' },
      { da: 'Du kan overbevise ham (større rolle, bedre løn eller ambitioner), respektere det, holde ham til kontrakten eller sælge ham, så klubben får noget for ham', en: 'You can persuade him (bigger role, better wage or ambitions), respect it, hold him to his contract or sell him so the club gets something' },
      { da: 'En spiller, der nægter, forhandler ikke før han er overtalt, og er langt mere åben for Bosman-tilbud; en tøvende spiller vil have højere løn', en: 'A player who refuses won\'t negotiate until persuaded and is far more open to Bosman offers; a hesitant player wants a higher wage' },
    ],
  },
  {
    version: '0.7.20',
    date: '2026-10-19',
    title: { da: 'Ikoner i indbakken', en: 'Inbox icons' },
    items: [
      { da: 'Hver slags besked har sit eget ikon og sin egen farve: kampe (grøn sejr, rød nederlag, grå uafgjort), skader, bud, handler, rygter, pressemøder, spillersamtaler, bestyrelse, økonomi, priser, ungdom, scouting, job og fans', en: 'Each kind of message has its own icon and colour: matches (green win, red defeat, grey draw), injuries, bids, deals, rumours, press conferences, player talks, board, finances, awards, youth, scouting, jobs and fans' },
    ],
  },
  {
    version: '0.7.19',
    date: '2026-10-19',
    title: { da: 'Ligastatistik', en: 'League stats' },
    items: [
      { da: 'Ny fane "Statistik" under ligaen: holdenes xG, xG imod, skud, boldbesiddelse, clean sheets og kort – sortérbar', en: 'New "Stats" tab in the league: teams\' xG, xG against, shots, possession, clean sheets and cards – sortable' },
      { da: 'Toplister for bedste gennemsnitsrating, assists, mål + assists, kampens spiller og kort', en: 'Leaderboards for best average rating, assists, goals + assists, player of the match and cards' },
      { da: 'Holdstatistikken samles fra den første ligakamp efter opdateringen', en: 'Team stats are collected from the first league match after the update' },
    ],
  },
  {
    version: '0.7.18',
    date: '2026-10-19',
    title: { da: 'Stjernerne forklaret', en: 'Stars explained' },
    items: [
      { da: 'Hold musen over stjernerne for at se, hvad de betyder: de er i forhold til dit hold (2½ ★ = holdets niveau), mens attributterne er absolutte', en: 'Hover over the stars to see what they mean: they are relative to your team (2½ ★ = the team\'s level), while attributes are absolute' },
    ],
  },
  {
    version: '0.7.17',
    date: '2026-10-19',
    title: { da: '5 stjerner også for storklubber', en: '5 stars for big clubs too' },
    items: [
      { da: 'Stjerneskalaen presses sammen over dit holds niveau, så verdens bedste spillere og største talenter kan få 5 stjerner – også når du styrer en topklub', en: 'The star scale is compressed above your team\'s level, so the world\'s best players and biggest talents can get 5 stars – also when you manage a top club' },
    ],
  },
  {
    version: '0.7.16',
    date: '2026-10-19',
    title: { da: 'Januarbudget og mere interesse', en: 'January budget and more interest' },
    items: [
      { da: 'Når vinduet åbner i januar, fylder bestyrelsen dit transferbudget op til halvdelen af et nyt sæsonbudget, hvis klubben har pengene', en: 'When the window opens in January, the board tops up your transfer budget to half a new season budget if the club has the money' },
      { da: 'Økonomi viser, hvornår transferbudgettet fornyes, og cirka hvor stort det bliver', en: 'Finances show when the transfer budget is renewed and roughly how big it will be' },
      { da: 'Spillere i de største klubber får også interesse fra jævnbyrdige rivaler, og flere klubber kan holde øje med den samme spiller', en: 'Players at the biggest clubs also attract interest from rivals of the same size, and more clubs can watch the same player' },
      { da: 'En klub, der byder på en spiller, står nu altid blandt de interesserede klubber', en: 'A club that bids for a player now always appears among the interested clubs' },
    ],
  },
  {
    version: '0.7.15',
    date: '2026-10-19',
    title: { da: 'Du følger din egen liga', en: 'You follow your own league' },
    items: [
      { da: 'Indbakken følger som standard kun den liga, du er manager i – de andre valgte ligaer spiller kampe og handler videre i baggrunden', en: 'By default the inbox only follows the league you manage in – the other chosen leagues keep playing and trading in the background' },
      { da: 'Op- og nedrykninger vises kun, når de berører din liga. Under Indstillinger kan du stadig vælge hele landet eller hele verden', en: 'Promotions and relegations are only shown when they affect your league. In Options you can still choose the whole country or the whole world' },
    ],
  },
  {
    version: '0.7.14',
    date: '2026-10-19',
    title: { da: 'Jobsamtaler', en: 'Job talks' },
    items: [
      { da: 'Søger du et job, svarer klubben efter et par dage – med et afslag eller et tilbud', en: 'When you apply for a job, the club replies after a few days – with a rejection or an offer' },
      { da: 'Tilbuddet viser bestyrelsens forventninger, transfer- og lønbudget, saldo og omdømme, før du siger ja', en: 'The offer shows the board\'s expectations, transfer and wage budgets, balance and reputation before you say yes' },
      { da: 'Du kan forhandle én gang om et større transferbudget og én gang om lavere forventninger – men pas på, klubben kan trække tilbuddet tilbage', en: 'You can negotiate once for a bigger transfer budget and once for lower expectations – but careful, the club may withdraw the offer' },
    ],
  },
  {
    version: '0.7.13',
    date: '2026-10-19',
    title: { da: 'Job i en ny liga virker', en: 'A job in a new league works' },
    items: [
      { da: 'Tager du et job i et land, der ikke var valgt fra start, sættes landets ligaer op med det samme – de kampe, der allerede er spillet, simuleres, og resten af sæsonen spilles normalt (pokalen fra næste sæson)', en: 'If you take a job in a country that was not chosen at the start, its leagues are set up straight away – matches already due are simulated, and the rest of the season is played normally (the cup from next season)' },
      { da: 'Eksisterende saves rettes automatisk, næste gang du trykker Fortsæt', en: 'Existing saves are fixed automatically the next time you press Continue' },
      { da: 'Beskeden om mesterskabs- og nedrykningsspil kommer kun til managere i den pågældende liga', en: 'The message about the championship and relegation rounds only goes to managers in that league' },
    ],
  },
  {
    version: '0.7.12',
    date: '2026-10-19',
    title: { da: 'Fansene følger med i kontrakterne', en: 'The fans follow contracts' },
    items: [
      { da: 'Fansene jubler, når en profil forlænger – jo vigtigere spilleren er (og jo længere han har været i klubben), jo gladere', en: 'The fans celebrate when a key player extends – the more important he is (and the longer he has been at the club), the happier they are' },
      { da: 'De bliver skuffede, når en profil bliver solgt, og endnu mere, når han forlader klubben gratis eller bliver fritstillet. En stor transfersum lindrer', en: 'They are disappointed when a key player is sold, and even more so when he leaves for free or is released. A big fee softens the blow' },
    ],
  },
  {
    version: '0.7.11',
    date: '2026-10-19',
    title: { da: 'Forklar spilleren, hvorfor du siger nej', en: 'Tell the player why you said no' },
    items: [
      { da: 'Når du afviser et bud, kan du give spilleren en begrundelse: nøglespiller, for lavt bud eller en ny kontrakt', en: 'When you reject an offer, you can give the player a reason: key player, offer too low or a new contract' },
      { da: 'Passer begrundelsen til virkeligheden, bliver han glad for at blive – tror han ikke på den, bliver han mere skuffet', en: 'If the reason fits reality, he is happy to stay – if he doesn\'t believe it, he is more disappointed' },
      { da: 'Spillerens svar vises med det samme og kommer i indbakken', en: 'The player\'s reply is shown straight away and arrives in the inbox' },
    ],
  },
  {
    version: '0.7.10',
    date: '2026-10-19',
    title: { da: 'Spillersøgning uden budgetfilter', en: 'Player search without a budget filter' },
    items: [
      { da: 'Spillere med udløbende kontrakt (Bosman) vurderes ikke længere efter transfersum – de koster ikke noget', en: 'Players with an expiring contract (Bosman) are no longer judged on transfer fee – they cost nothing' },
      { da: 'Spillere over dit transferbudget står som "måske" i stedet for "urealistisk", så de stadig vises under "Realistiske + måske"', en: 'Players above your transfer budget are marked "maybe" instead of "unrealistic", so they still show under "Realistic + maybe"' },
    ],
  },
  {
    version: '0.7.9',
    date: '2026-10-19',
    title: { da: 'Ingen ventetid på AI', en: 'No waiting for the AI' },
    items: [
      { da: 'Pressemødet afsluttes med det samme – kommer journalisternes AI-overskrift senere, skiftes den ind bagefter', en: 'The press conference ends straight away – if the journalists\' AI headline arrives later, it is swapped in afterwards' },
      { da: 'Kamprapporter og andre AI-artikler skrives i baggrunden, så de er klar, når du åbner beskeden', en: 'Match reports and other AI articles are written in the background, so they are ready when you open the message' },
      { da: 'I kontraktforhandlinger ser du agentens svar med det samme i stedet for den gamle replik', en: 'In contract talks you see the agent\'s answer straight away instead of the old line' },
    ],
  },
  {
    version: '0.7.8',
    date: '2026-10-19',
    title: { da: 'Ingen dobbelte bud', en: 'No duplicate offers' },
    items: [
      { da: 'En klub byder ikke igen på den samme spiller, mens dens bud stadig venter på svar – kommer den tilbage efter et afslag, er det med et højere bud', en: 'A club no longer bids again for the same player while its offer is still awaiting a reply – if it returns after a rejection, it is with a higher offer' },
      { da: 'Gamle dobbeltbud i eksisterende saves ryddes op, så kun det højeste står tilbage', en: 'Old duplicate offers in existing saves are cleaned up so only the highest remains' },
    ],
  },
  {
    version: '0.7.7',
    date: '2026-10-19',
    title: { da: 'Store køb begejstrer', en: 'Big signings excite' },
    items: [
      { da: 'Fans og bestyrelse jubler, når et stort navn kommer til klubben – jo større navnet er i forhold til klubben, jo gladere bliver de', en: 'Fans and the board celebrate when a big name joins the club – the bigger the name compared with the club, the happier they are' },
      { da: 'Stjernekøb og sensationer får deres egen nyhed i indbakken; gode forstærkninger glæder også fansene lidt', en: 'Star signings and sensations get their own news item in the inbox; good reinforcements also please the fans a little' },
      { da: 'Lejemål og veteraner over 33 begejstrer lidt mindre', en: 'Loans and veterans over 33 cause a little less excitement' },
    ],
  },
  {
    version: '0.7.6',
    date: '2026-10-19',
    title: { da: 'Forespørgsler og budslider', en: 'Enquiries and an offer slider' },
    items: [
      { da: 'Forespørg på en spiller i stedet for at byde: klubben svarer med sin pris – eller at han ikke er til salg under et bestemt beløb', en: 'Enquire about a player instead of bidding: the club replies with its price – or that he is not for sale below a certain fee' },
      { da: 'Beløbet i budvinduet styres med en slider som lønnen, og du ser med det samme, hvordan buddet ligger i forhold til klubbens pris', en: 'The fee in the offer window is set with a slider like the wage, and you see straight away how the offer compares with the club\'s price' },
    ],
  },
  {
    version: '0.7.5',
    date: '2026-10-19',
    title: { da: 'Mere fair bestyrelse og jobtilbud', en: 'Fairer board and job offers' },
    items: [
      { da: 'Bestyrelsens forventning til hver kamp passer med, hvad et bedre hold reelt får – før mistede favoritter tillid selv ved fine resultater', en: 'The board\'s expectation for each match matches what a stronger side really gets – favourites used to lose confidence even with decent results' },
      { da: 'Ingen fyring midt i sæsonen, hvis holdet ligger på (eller tæt på) målet, og advarsler trækkes tilbage, når tilliden kommer igen', en: 'No mid-season sacking while the team is on (or close to) target, and warnings are withdrawn when confidence returns' },
      { da: 'En klub, der har fyret dig, tilbyder dig ikke jobbet igen, og et afvist tilbud kommer ikke igen det næste år', en: 'A club that sacked you won\'t offer you the job again, and a declined offer won\'t return for a year' },
    ],
  },
  {
    version: '0.7.4',
    date: '2026-10-19',
    title: { da: 'Realistisk potentiale og rigtig sortering', en: 'Realistic potential and correct sorting' },
    items: [
      { da: 'Potentialet viser, hvad spilleren realistisk kan nå i sin alder – fra 29 år er det lig med evnen', en: 'Potential shows what the player can realistically reach at his age – from 29 it equals his ability' },
      { da: 'Sortering efter evne og potentiale følger de sikre (fyldte) stjerner, så rækkefølgen passer med det, du ser', en: 'Sorting by ability and potential follows the certain (filled) stars, so the order matches what you see' },
    ],
  },
  {
    version: '0.7.3',
    date: '2026-10-19',
    title: { da: 'Rigtige transfervinduer og færre bud', en: 'Real transfer windows and fewer bids' },
    items: [
      { da: 'Transfervinduer som i dag: 15. juni – 31. august og januar (CM 01/02-stilen kan vælges under Indstillinger)', en: 'Transfer windows like today: 15 June – 31 August and January (the CM 01/02 style can be chosen in Options)' },
      { da: 'Højst 3 ubesvarede bud fra AI-klubber ad gangen, og efter et afslag venter andre klubber et par uger', en: 'At most 3 unanswered bids from AI clubs at a time, and after a rejection other clubs wait a couple of weeks' },
      { da: 'Færre af dine spillere kommer i søgelyset på én gang', en: 'Fewer of your players attract attention at the same time' },
    ],
  },
  {
    version: '0.7.2',
    date: '2026-10-18',
    title: { da: 'Flere gode spillere over tid', en: 'More good players over time' },
    items: [
      { da: 'Ungdomsspillere udvikler sig hurtigere og når tæt på deres potentiale omkring 22-23 år', en: 'Youth players develop faster and get close to their potential around 22-23' },
      { da: 'Lidt flere og bedre ungdomsspillere hvert år, så spillere på mellemniveau ikke slipper op', en: 'Slightly more and better youth players each year, so mid-level players do not run out' },
      { da: 'Spillere topper midt i 20\'erne og begynder at dale fra 30 år', en: 'Players peak in their mid-20s and start to decline from 30' },
    ],
  },
  {
    version: '0.7.1',
    date: '2026-10-18',
    title: { da: 'Spillere reagerer på afviste bud', en: 'Players react to rejected bids' },
    items: [
      { da: 'Afviser du et bud på en spiller fra en større klub, kan han blive skuffet og bede om en samtale – lov en bedre kontrakt, sig at han er for vigtig, lad ham gå eller lyt', en: 'If you turn down a bid for a player from a bigger club, he may be disappointed and ask to talk – promise a better contract, say he is too important, let him go or listen' },
      { da: 'Spillere du byder på, kan kontakte dig, når deres klub siger nej – de ambitiøse beder om at blive sat til salg, så du kan prøve igen', en: 'Players you bid for may contact you when their club says no – ambitious ones ask to be transfer listed so you can try again' },
    ],
  },
  {
    version: '0.7.0',
    date: '2026-10-18',
    title: { da: 'Conference League og pokalvindere i Europa', en: 'Conference League and cup winners in Europe' },
    items: [
      { da: 'Ny europæisk turnering: Conference League med 32 hold – mellemstore lande som Danmark får to pladser (typisk nr. 3 og 4)', en: 'New European competition: the Conference League with 32 teams – mid-sized countries like Denmark get two places (usually 3rd and 4th)' },
      { da: 'Pokalvinderen kvalificerer sig til UEFA Cup (er den allerede med, går pladsen videre i tabellen)', en: 'The cup winner qualifies for the UEFA Cup (if already qualified, the place passes down the table)' },
      { da: 'Gemte spil får Conference League med det samme, hvis sæsonens første europæiske runde ikke er spillet endnu', en: 'Saved games get the Conference League straight away if the first European round of the season has not been played yet' },
      { da: 'Præmiepenge, tilskuere og omdømme for at gå langt i Conference League', en: 'Prize money, attendances and reputation for going far in the Conference League' },
    ],
  },
  {
    version: '0.6.2',
    date: '2026-10-18',
    title: { da: 'Scouts finder realistiske spillere', en: 'Scouts find realistic players' },
    items: [
      { da: 'Scouterne bruger ikke tid på spillere, du ikke kan hente (vil ikke komme, sælges ikke eller langt over budget)', en: 'Scouts do not waste time on players you cannot get (will not come, not for sale or far over budget)' },
      { da: 'Talent-meldinger og scoutrapporter handler kun om realistiske spillere – langt færre beskeder', en: 'Talent alerts and scout reports only cover realistic players – far fewer messages' },
      { da: 'Scouten anbefaler aldrig "Køb ham!" for urealistiske handler, og urealistiske fund er skjult som standard', en: 'The scout never recommends "Buy him!" for unrealistic deals, and unrealistic finds are hidden by default' },
    ],
  },
  {
    version: '0.6.1',
    date: '2026-10-18',
    title: { da: 'Interesserede klubber', en: 'Interested clubs' },
    items: [
      { da: 'Alle klubber har nu en shortliste, og spillerprofilen viser hvilke klubber der holder øje med spilleren', en: 'All clubs now have a shortlist, and the player profile shows which clubs are keeping an eye on him' },
      { da: 'Klubbernes shortliste bruges, når de byder – og rygterne om dine spillere kommer fra klubber, der faktisk er interesserede', en: 'Clubs use their shortlist when bidding – and rumours about your players come from clubs that are actually interested' },
      { da: 'AI-klubber ser nu kandidater fra hele deres niveau (før kun de svageste)', en: 'AI clubs now consider candidates across their whole level (previously only the weakest)' },
    ],
  },
  {
    version: '0.6.0',
    date: '2026-10-18',
    title: { da: 'Rivalisering, budrunder og frist pr. træk', en: 'Rivalries, bidding rounds and turn deadlines' },
    items: [
      { da: 'Indbyrdes regnskab mellem managere: sejre, uafgjorte, nederlag, mål, største sejr og seneste kamp', en: 'Head-to-head record between managers: wins, draws, losses, goals, biggest win and latest match' },
      { da: 'Lukkede budrunder: byder flere managere på samme spiller, vinder det højeste bud ved en fælles frist', en: 'Sealed bidding rounds: when several managers bid for the same player, the highest bid wins at a shared deadline' },
      { da: 'Online: frist pr. træk – når den udløber, tager assistenten over for dem, der ikke er klar', en: 'Online: turn deadline – when it passes, the assistant takes over for anyone who is not ready' },
    ],
  },
  {
    version: '0.5.5',
    date: '2026-10-18',
    title: { da: 'Modbud over budgettet', en: 'Counter-offers above budget' },
    items: [
      { da: '"Acceptér modbud" gjorde ingenting, når modbuddet var over transferbudgettet – nu forklares det, og du kan flytte penge fra lønbudgettet med ét klik', en: '"Accept counter-offer" did nothing when the counter was above the transfer budget – it is now explained, and you can move money from the wage budget with one click' },
    ],
  },
  {
    version: '0.5.4',
    date: '2026-10-18',
    title: { da: 'Flere realistiske spillere', en: 'More realistic players' },
    items: [
      { da: 'Realisme-vurderingen regner med, at løn kan dækkes ved at omdisponere fra transferbudgettet', en: 'The realism rating accounts for wages being covered by moving money from the transfer budget' },
      { da: 'Siger bestyrelsen nej pga. lønbudgettet, kan du flytte penge og tilbyde igen med ét klik', en: 'If the board refuses because of the wage budget, you can move money and offer again with one click' },
      { da: 'Lidt mere luft i lønbudgettet ved sæsonstart (10 % over lønsummen)', en: 'A bit more room in the wage budget at the start of the season (10% above the wage bill)' },
    ],
  },
  {
    version: '0.5.3',
    date: '2026-10-18',
    title: { da: 'Omdømme følger placeringen', en: 'Reputation follows league position' },
    items: [
      { da: 'Klubomdømme ændres løbende hver måned ud fra tabelplaceringen og tager et større skridt ved sæsonslut', en: 'Club reputation changes every month based on league position and takes a bigger step at the end of the season' },
      { da: 'En høj placering er værd det omdømme, klubberne på den plads normalt har – fx giver en 3. plads til en lille klub et stort hop', en: 'A high finish is worth the reputation clubs in that position usually have – e.g. 3rd place gives a small club a big jump' },
      { da: 'Pil ved omdømmet på klubsiden viser, om det er på vej op eller ned', en: 'An arrow next to reputation on the club page shows whether it is rising or falling' },
    ],
  },
  {
    version: '0.5.2',
    date: '2026-10-18',
    title: { da: 'Roligere indbakke', en: 'Calmer inbox' },
    items: [
      { da: 'Andre klubbers handler samles i ét ugentligt transferoverblik med links', en: "Other clubs' deals are collected in one weekly transfer round-up with links" },
      { da: 'Færre rygter (højst ét hver tredje uge) og færre lejetilbud på dine spillere', en: 'Fewer rumours (at most one every three weeks) and fewer loan offers for your players' },
    ],
  },
  {
    version: '0.5.1',
    date: '2026-10-18',
    title: { da: 'Tydeligere online-træk', en: 'Clearer online turns' },
    items: [
      { da: 'Online alene (evt. med AI-managere): knappen hedder nu Fortsæt, så det er tydeligt at spillet venter på dig', en: 'Online on your own (optionally with AI managers): the button is now called Continue, so it is clear the game is waiting for you' },
      { da: 'Dine bud viser, hvornår klubben senest svarer – online behandles de ved næste træk', en: 'Your bids show when the club will answer by – online they are processed on the next turn' },
    ],
  },
  {
    version: '0.5.0',
    date: '2026-10-18',
    title: { da: 'Multiplayer mod AI, beskeder og økonomioverblik', en: 'Multiplayer vs AI, messages and finance overview' },
    items: [
      { da: 'AI-managere der spiller som mennesker: de handler, byder på dine spillere, holder pressemøder og skifter job', en: 'AI managers who play like humans: they trade, bid for your players, hold press conferences and change jobs' },
      { da: 'Beskeder mellem managere – AI-managere svarer med det samme og kan forhandle om spillere', en: 'Messages between managers – AI managers reply instantly and can negotiate about players' },
      { da: 'Andre manageres klubber markeres overalt (initialer eller AI)', en: "Other managers' clubs are marked everywhere (initials or AI)" },
      { da: 'Økonomi: nye faner for tilskuere & billetter, faciliteter og sæsonhistorik', en: 'Finance: new tabs for attendance & tickets, facilities and season history' },
      { da: 'Røde kort mærkes i resten af kampen, og der kommer færre andet-gule-kort', en: 'Red cards matter for the rest of the match, and fewer second yellows' },
      { da: 'Træningsforslag passer til spillerens position', en: "Training suggestions fit the player's position" },
      { da: 'Jobtilbud kun fra større klubber, og sjældnere mens du er i job', en: 'Job offers only from bigger clubs, and less often while employed' },
      { da: 'Mellemrum trykker altid Fortsæt (pause i kampen er nu P)', en: 'Space always presses Continue (pause during matches is now P)' },
      { da: 'Bosman: forklaring når fri kontrakt først kan tilbydes fra 1. januar', en: 'Bosman: explanation when a pre-contract can only be offered from 1 January' },
      { da: 'Changelog og version i menuen', en: 'Changelog and version in the menu' },
    ],
  },
  {
    version: '0.4.0',
    date: '2026-10-17',
    title: { da: 'Kontraktklausuler, holdsnak og levende spillere', en: 'Contract clauses, team talks and living players' },
    items: [
      { da: 'Kontraktklausuler: frikøbsklausul, lønstigning, bonusser, videresalgsprocent og add-ons', en: 'Contract clauses: release clause, wage rises, bonuses, sell-on percentage and add-ons' },
      { da: 'Holdsnak før kampen, i pausen og efter kampen med reaktion fra hver spiller', en: 'Team talks before the match, at half-time and after, with a reaction from every player' },
      { da: 'Ungdomschefens rapport om den kommende årgang', en: "Head of youth's report on the coming intake" },
      { da: 'Spillere henvender sig, når de er utilfredse – eller vil rose dig', en: 'Players come to you when they are unhappy – or want to praise you' },
      { da: 'Dynamiske pressemøder med opfølgende spørgsmål og løfter', en: 'Dynamic press conferences with follow-up questions and promises' },
      { da: 'Fortsæt kører, indtil der sker noget, og læser ældste ulæste besked først', en: 'Continue runs until something happens and reads the oldest unread message first' },
    ],
  },
  {
    version: '0.3.0',
    date: '2026-10-17',
    title: { da: 'Mere AI, ranglister og CM 01/02-databasen', en: 'More AI, rankings and the CM 01/02 database' },
    items: [
      { da: 'Mere AI: fritekst-samtaler, agenter, medier, fans, taktisk modspil, transferstrategier og trænerkarrierer', en: 'More AI: free-text talks, agents, media, fans, tactical counter-play, transfer strategies and manager careers' },
      { da: 'Manager Score og globale ranglister for singleplayer', en: 'Manager Score and global rankings for single-player' },
      { da: 'Vælg mellem den moderne database og den originale CM 01/02 fra din egen installation', en: 'Choose between the modern database and the original CM 01/02 from your own installation' },
      { da: 'Ny forside, hjælp til spillets mekanikker og pæne søgbare dropdowns', en: 'New landing page, help on game mechanics and neat searchable dropdowns' },
      { da: 'Transfersøgning med mange flere filtre, scouts med kriterier og hjemkaldelse', en: 'Transfer search with many more filters, scouts with criteria and recall' },
      { da: 'Forhandling med bestyrelsen om budgetter, karrierehistorik på spillerprofilen', en: 'Budget negotiations with the board, career history on player profiles' },
    ],
  },
  {
    version: '0.2.0',
    date: '2026-10-16',
    title: { da: 'Personligheder, økonomi og online multiplayer', en: 'Personalities, finances and online multiplayer' },
    items: [
      { da: 'Online multiplayer: flere managere i samme verden', en: 'Online multiplayer: several managers in the same world' },
      { da: 'Personligheder, holdkemi, spillersamtaler og holdmøder', en: 'Personalities, team chemistry, player talks and team meetings' },
      { da: 'Sponsoraftaler, Financial Fair Play, merchandise, stadion- og anlægsprojekter', en: 'Sponsorship deals, Financial Fair Play, merchandise, stadium and facility projects' },
      { da: 'Udlejning, prisforhandling, autogem og tastaturgenveje', en: 'Loans, price negotiation, autosave and keyboard shortcuts' },
      { da: 'Nyt design, klublogoer og valutavalg', en: 'New design, club crests and currency choice' },
    ],
  },
  {
    version: '0.1.0',
    date: '2026-10-16',
    title: { da: 'Første version', en: 'First version' },
    items: [
      { da: 'Championship Manager 01/02 genskabt i browseren: ligaer, kampmotor, transfers, taktik og træning', en: 'Championship Manager 01/02 recreated in the browser: leagues, match engine, transfers, tactics and training' },
    ],
  },
];

export const APP_VERSION = CHANGELOG[0].version;
