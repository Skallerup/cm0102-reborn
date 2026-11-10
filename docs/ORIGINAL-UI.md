# CM 01/02 – originalens skærme (noter fra rundtur med scripts/cmctl.swift)

Billeder i fuld opløsning ligger lokalt i `orig-shots/` (ikke i git). Noterne her er det, der skal efterlignes i det klassiske tema.

## Sidebjælken – managermenuen (klik på managerens navn)
Man Utd Squad · Man Utd Reserves · Control Reserve Team · Board Confidence · Resign from Club · — · News ·
Player & Staff Search · Compare two chosen players · Manager Stats · Job Information · Transfers · History ·
Go on Holiday · Holiday until next match · — · Retire. (Grøn menu ved siden af knappen.)

## Klubbens trup (Squad)
- Titel: ▸ til venstre (klub-menu), **Print ▾** til højre (rød kant).
- Faner: Squad · Transfers · Next Match · Fixtures · Finances & Info.
- Værktøjer: View ▾ · Sort By ▾ (venstre) – Assistant ▾ · Filter ▾ (højre).
- "Position(s)" + grønne knapper GK DL DR DC DC ML MR MC MC FC FC SB1-SB5, SB6-SB9 grå (ubrugte).
- To kolonner: blå positionsknap, mærke (fx rød "Sus"), navn "Efternavn, F", positioner i gult.
- Nederste faner med ▸ (menuer): **Tactics ▸ · Training ▸ · Last Match ▸ · "1st in PL" ▸ (placering) · History ▸**.

## Taktik (uden for kamp)
- Titel "Manchester United Tactics" i klubbens farver (i kamp: hvid titel).
- Venstre: **Tactics ▾** · **View ▾**; højre: **Last Match** (knap) · **Edit ▾**. Faner over banen: Overview · With Ball · Without Ball.
- Liste: blå nummerknap, navn, "capt", position (gul), kondition (grøn %, orange når lav). Startere hvide, resten grå.
- Banen: prikker i **holdets trøjefarve** (Man Utd: rød m. hvidt nummer; målmand grøn), efternavn i gult under.
- **Tactics-menu:** Team Instructions · Penalty Takers · Set To Default ▸ · — · Load · Save (grå når uændret) · Save As · Delete.
- **View-menu:** Position(s) · Condition ✓ · Goals · Form · Average Rating · — · Passing · Tackling · Pressing · Pass To ·
  Set Pieces (A) · Set Pieces (D) · Free Role · Forward Runs · Run With Ball · Hold Up Ball · Long Shots · Try Through Balls ·
  Cross Ball · Marking.
- **Edit-menu** (pladser på banen): Undo · Copy · Copy All · Paste · Reflect · Show Runs (grå uden valgt spiller).
- Nederst: Cancel · Ok.
- **With Ball / Without Ball:** banen delt i felter (stiplede linjer, 3 kolonner); det valgte boldfelt har gul stiplet ramme;
  prikkerne (kun numre, ingen navne) viser, hvor spillerne står, når bolden er i feltet – With Ball spredt, Without Ball samlet.
- **Penalty Takers:** egen skærm "Man Utd Penalty Takers" (som truppen) med nummererede pladser 1-25 øverst og 26-50 nederst
  (lilla knapper) = rækkefølgen; værktøjer View · Sort By · Clear Squad · Filter.

## Træning (Tactics ▸/Training ▸ fører direkte til skærmen – ▸ er ikke en menu)
- "Man Utd Training": faner Overview · No Training (1) · General (41) · Fitness (0) · Shooting (0); nederst Skill (0) · Tactics (0) ·
  Gk (6) · Unused · Unused. Værktøjer: Schedule (grå) · View ▾ · Coaches · Filter ▾.
- Tabel: blå programknap (Gk/General), Inf (Loa/Inj), Name "Efternavn, Fornavn", Position (cyan), Age, Form (5 karakterer gul),
  Morale (farvet ord), Cond. (grøn % / "Inj" orange), Value (lilla kasse). Cancel · Ok nederst.

## Klubbens øvrige faner
- **Transfers:** << Season · Season >> · View ▾; "Players In - Season 2001/02"; beløb i lilla kasse øverst til højre.
- **Next Match:** << Date · Date >> · Progress · Past Meetings; "Leeds (Away)"; orange understreget turnering "FA Premier League";
  Date "Saturday 11th May (today)" · Venue · Match Rules (2 linjer: "No player restrictions" / "5 subs named, maximum 3 used") ·
  Last Meeting "Man Utd 2-0 Leeds, FA Premier League 4.11.01" · Weather "Wet, 8°C" · Pitch Condition · Referee · "Man Utd News".
- **Finances & Info:** View ▾; General Info (Nation, Status, Finances "Secure", Stadium, Facilities "67800 all seater with
  under-soil heating", Training Ground) + orange "Non-Playing Staff" (navn · rolle).
- **Last Match ▸:** kampens resultattavle (Roma 2 – Man Utd 0, "Agg 3-0") med Player Ratings: nummer, navn, gult kort som
  gul firkant, "sub 67"/"on 67", karakter (cyan), mål (gul tal yderst). Nederst: Roma Stats · Player Ratings · Man Utd Stats.

## Sidebjælkens menuer
- **Competitions:** World Cup ▸ · International ▸ · Worldwide Club ▸ · European ▸ · England ▸ (grøn, undermenuer).
- **Nations & Clubs:** Nations ▸ · Under-21s ▸ · Major Clubs ▸ · League ▸ · Non-League ▸ · Other ▸.
- **Game Options:** Save Game · Add Manager · Manager Status · Game Settings · Bosman Edition Options · Selected Leagues ·
  Hall of Fame · Game Credits · Web Sites · Restart Game · Exit Game (Save/Restart/Exit grå i denne tilstand).

## Endnu ikke efterlignet (fra rundturen 7/11)
- Taktik uden for kamp har ingen klubfaner; prikkerne i holdets trøjefarve; Tactics-menu med Penalty Takers/Set To Default ▸/
  Save As; Edit = Undo/Copy/Copy All/Paste/Reflect/Show Runs; View har mange flere instruktionskolonner.
- Penalty Takers som egen skærm med rækkefølge 1-50. Træningsskærmen med program-faner og tabel (se ovenfor).
- Undermenuer (Set To Default ▸) åbner ikke ved museflyt i cmctl – kræver nok flere move-events.

## Mål og farver (målt 7/11 i 30-news.png, logiske px i et 1280×804-vindue)
Sidebjælke 144 px (bg #00006e→#00000f), knapper 127×57 px med 3 px imellem, fyld #00005e, kant #000085 (op/venstre) / #00003e;
dato/pile #000076. Indhold starter 16 px fra sidebjælken. Titel 81 px (#a52116, kant #ea3323 / #520b06), faner 48 px #1c025e,
valgt fane gul tekst + 1 px gul kant (#fffe54), 12 px mellem titel og faner. Back/Next 48 px #838183, bredde 3:1.
Skrift: normal vægt overalt (kun titlen kraftig). Fotoet ligger bag hele højre side (også titel og fod).
