// Spillets versioner og ændringer (nyeste først). Versionen skal matche package.json (se tests/changelog.test.ts).

export interface ChangelogEntry {
  version: string;
  date: string;
  title: { da: string; en: string };
  items: { da: string; en: string }[];
}

export const CHANGELOG: ChangelogEntry[] = [
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
