// Spillets versioner og ændringer (nyeste først). Versionen skal matche package.json (se tests/changelog.test.ts).

export interface ChangelogEntry {
  version: string;
  date: string;
  title: { da: string; en: string };
  items: { da: string; en: string }[];
}

export const CHANGELOG: ChangelogEntry[] = [
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
