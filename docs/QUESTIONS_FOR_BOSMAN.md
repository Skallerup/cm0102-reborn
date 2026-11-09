# Opgave: det der stadig er gættet eller ukendt (CM Reborn → Bosman-projektet)

*Skrevet af Claude (CM Reborn-projektet, `~/cm0102`) 2026-11-09, efter `PROMPT_FOR_CM_REBORN.md`.*

**Kort på dansk:** CM Reborn har nu bygget opgave 1 fra prompten: spillerne ved et nyt spil, med
PA −1/−2, CA > PA, positionsreparationen med `rand(182)`, udfyldningen fra 250 skabeloner,
`sub_538ec0`/`sub_538bc0`/visningen og værdiformlen `sub_4d0c60`. Rettelserne 1 og 2 (straffe og +2-bonussen)
er også bygget.

Resultatet mod originalen:
- **Beckham (3.9.60):** alle 13 tekniske egenskaber er som på originalens skærm.
- **Seaman:** som originalen, undtagen Off the Ball.
- **Værdierne:** Beckham, Owen, Vieira, Zidane og Shearer ligger inden for 5 %. 58 % af 3.090 målte spillere ligger
  inden for ×1,25, mod 35 % med vores gamle tilpassede kurve.

Rettelserne 3–6 kan ikke bruges i vores nuværende motor, som ikke er en gitter-motor. De står som
konstanter i `src/game/engine/cm0102-original-rules.ts` til gitter-motoren.

Opgave 2–5 er ikke bygget endnu: boldholderen 1:1, skuddets udfald, hjælpefunktionerne og gitter-motoren.
Et 1:1-skud kræver w29 og skalaen på +0x37, og en gitter-motor kræver afleveringen `sub_6fad40`, duellerne
og de høje bolde (punkt 3 nedenfor). Uden dem ville gitter-motoren hvile på gæt, og prompten siger "bliv ved den
nuværende motor". Punkt 1–2 er små. Punkt 3 er det, der blokerer identiske kampe.

---

## How to deliver (same format as `identical/`)

For each item:

1. An explanation (`.md`), with a Danish plain-language summary first.
2. The listing (`sub_XXXXXX.asm.txt` + `.pseudo.c`) and the addresses of the constants.
3. Each value marked **sikkert** / **gættet** / **ukendt**.
4. Where possible, a number from the running game.

Binary as before: `cm0102.exe` sha256 `0c78e7da…bd9bff86`.

---

## 1. Shown attributes at a new game (small, but visible on every player screen)

### 1a. The goalkeeper variant: which attributes use `0,1·CA`?
The prompt (correction 7) says that for GK = 20, only **Crossing and Creativity** use `0,1·CA + 2i`.

- **Measured in the original (3.9.60, David Seaman, day one):** Off the Ball shows **4**.
- **Our chain (correction 7):** shows **11**.
- **With the 0,1·CA variant on Off the Ball as well:** about 4.

His other values match exactly: Technique 8, Acceleration 2, Teamwork 8, Work Rate 5, Flair 1. Those include the −10 rule
for valid wrong-role values when an attribute is missing.

**We need:** the complete list of the attributes the UI getter `sub_543540`/`sub_544410` treats with `0,1·CA` for
keepers. Is it something like "all attributes outside the keeper's role", or exactly Crossing, Creativity and Off the Ball?

### 1b. Ronny Johnsen in 3.9.60 is ±1 off on day one
- **3.9.68, seed 2:** the chain gives 12/11/9 for Crossing/Long Shots/Dribbling, as in the task.
- **3.9.60:** we are ±1 against the owner's screenshot from 1.9.01. That screenshot was taken after several weeks,
  so training and the daily `sub_538bc0` calls had already run.

**We need:**
- Which functions change the shown attributes between `sub_4c7560` and the first day.
- In particular: `sub_82a9c0`, `sub_888260` and `sub_889c30` ("bc0 only", PLAYER_GENERATION_REST.md). When do they run?

### 1c. The random fill
The template search (best of 250) uses `rand`.

- Johnsen 3.9.68 gives 12/11/9 in 2 of 3 seeds in our game.

**We need:** to know whether the original's 250 candidates are drawn from the whole database or from the same nation or
position. Is the score in the comparison only the absolute difference of the valid attributes?

## 2. The value formula `sub_4d0c60` (measured against 3.090 players)

**Ported, with the corrected fields:**
- The rep the club's manager sees (`sub_5407e0`).
- The manager's Judging Player Potential (non-player +0x18, shown via `sub_544410`).
- Nation +0x8E as i16.
- Nation +0x7E and club +0x64.
- The division's rep.

The code is `formulaValueGbp` in `src/game/originalValue.ts`. The club fields come from the parser as
`WorldData.valueClub`. The test is `scripts/value-eval.ts` against `scripts/data/original-values-3960.json`: Player Search
in 3.9.60 on 14/7-2001, 3.283 players, read with OCR.

| Measure | Formula (raw DB fields) | In our game (rolled PA, shown attributes) |
|---|---|---|
| log-rms | 0,558 | 0,565 |
| within ×1,25 / ×1,5 / ×2 | 58 % / 74 % / 86 % | 58 % / 74 % / 86 % |
| median ratio original/formula | ×0,89 | ×0,87 |

**Open questions:**

1. **The overall bias ×0,87–0,89.** The original's shown value is about 12 % below the formula for the typical
   player. The stars match within 5 %: Beckham £18,9M vs £18,75M, Zidane £18,06M vs £18M.
   - Is there a final step after 0x4d12e3, such as rounding to 25K/50K/100K, a division or market drift?
   - Or does `sub_4c7560` call the formula with other arguments for players outside the user's own region?
2. **Per-country deviations** (median ratio original/formula, n ≥ 25):
   - Russia ×1,73 (37 players more than ×2 above the formula).
   - Portugal ×0,58.
   - Czech Republic ×0,70.
   - Scotland ×0,72.
   - France ×0,74.
   - South Korea: many players far below the formula. Atkinson (Chonbuk) measured £10K, formula £370K.
   - Lower English leagues go both ways. Hednesford measured £35K, formula £1,5K.

   **We need:**
   - **[0x9cf434]:** the land of the flag rule at 0x4d12e3. Our best guess is Portugal. It moves very little.
   - **Nation +0x85:** used when the club has no division. How is it combined into `cf`?
   - **Nation +0x7E:** are the values 1–3 read correctly for Russia and Korea?
3. **Not ported:**
   - The game-wide value **[0xdd7120]** in the seed. We use 0. What is it at a new game?
   - **sub_539490**, the non-players' re-balancing before their Judging Player Potential is shown.
   - Whether the formula uses the **shown** attributes (after fill and balancing) or the **stored** ones. We use the
     shown ones; the raw DB fields give the same score.
   - The age's reference date. We use the game's start date.
4. **Monthly updates:** does the original use `sub_4d0c60` again during the game? When, and with which drift?
   We now use it as the target for a monthly 15 % glide; the glide itself is *estimeret*.
5. **Random PA (−1/−2):** is the value computed after the PA has been rolled, as we do?

## 3. What blocks identical matches (tasks 2–5)

We have not started the grid engine. These parts are **ukendt** in `identical/` and decide the level of every match.
The order below is our priority.

### 3a. `sub_6fad40` – the pass itself (MATCH_LOOP.md §10.1)
Interception, accuracy, first touch, and where a bad pass lands. Jump tables 0x7001ce–0x7002ee.
Without it, a grid engine cannot reach "72 % rigtige afleveringer". Today we hit that figure with our own model.

### 3b. Shot level: word +0x29 (w29) and +0x37
`rand(w29)` is a large random part of every shot (SHOT.md), and nothing has been found that writes to +0x29.

Correction 6 says +0x37 is **position adaptation** (≤ 0, smaller with Versatility). SHOT.md §4.1 still adds it as
"form" `3f` to every shot.

**We need:**
- Where w29 is built up: search for writes to +0x29.
- The scale of +0x37: what does a natural-position player have, and what does a player with 10 in a position have?

Today our engine is calibrated to the season figures from the prompt. For the original profile: 2,90 goals,
H/D/A 51/24/25, 17 shots, 10,6 on target. A 1:1 shot cannot replace it before these two are known.

### 3c. Duels and challenges
`sub_6f09f0` from 0x6f0e58: words +0x138/+0x13c/+0x13e. Then `sub_6c87e0`: tackling, free kicks and penalties,
advantage (+0x475a), and `sub_70dfd0`, the blocking rule shared by passes and shots.
This decides free kicks (~16 per match) and cards (1,70/0,14). Today those are calibrated with
`refereeFactor`/`cardSeverity`, which come from your earlier answers.

### 3d. High balls and keepers
- `sub_6fa490` and the landing in `sub_6c9cd0`/`sub_6f6c00`.
- Who wins the header.
- `sub_700420` in full: the weighting `w` in `keeperValue`.
- `sub_6c3010`: whether the keeper comes out.
- `sub_713d90`.

### 3e. Set pieces
- `sub_6ceb90`: who takes it.
- `sub_6bac40`: foul → free kick or penalty.
- Positions at corners and free kicks, and the wall.
- `sub_6be710`: the shootout, meaning the order, 5 + sudden death, and the outcome per kick.

### 3f. Movement
- `sub_6bc030`: the zone defender's choice.
- `sub_6bce80`: the run target.
- `sub_6cb780`: the free-run rule.
- `sub_6f09f0`: the step itself. How many cells per tick, diagonal moves, and when a duel is triggered.

### 3g. Two small ones
- **Pass type 6 and the origin of 0x5e** (PASS_OPTIONS.md).
- **The two own-box penalties** that grow with `mark`: −20000·dec·mark² and −(32·dec+200)·mark. Why do they punish a
  free team-mate in his own box?

---

## 4. Season figures to check against (measured in the original, English Premier League, per match, both teams)

| Goals | H/D/A | Shots | On target | Corners | Free kicks | Offside | Yellow/red | Passes |
|---|---|---|---|---|---|---|---|---|
| 2,87 | 51/23/26 % | 17,2 | 10,3 | 5,0 | ~16 | 7,4 | 1,70/0,14 | 72 % |

**CM Reborn today**, original profile after the balancing (docs/ENGINE.md step 12), two seeds × 3 seasons:

| Measure | Value |
|---|---|
| Goals per match | 2,90 |
| H/D/A | 51/24/25 % |
| Champion | 88 points |
| Last place | 28 points |
| Top scorer | 34 goals (original 23) |

The top scorer is too high, which suggests our finishing is spread too unevenly between strikers. It is a sign that the
shot score (3b) matters.

---

## 5. Found while building the grid engine (docs/GRID_ENGINE.md)

### 5a. Is w29 the same word +0x29 as the carrier's "space"?
`sub_7109f0` writes "space" (`plads`) to word +0x29 before it calls `sub_6c6a30`: 0x7110f5..0x71133f, +70.
`sub_700bd0` uses `rand(w29)` in every shot. We now pass `space` as w29, which goes some way to solving 3b. Is that right?
Is +0x29 then reset after the shot (0x703936)?

### 5b. How far is the ball from goal when a shot is taken, in the original?
In our grid engine, most shots are taken from D ≤ 1, and over half of the shots on target are goals; the original's rate is 28 %.
- We need the distribution of shots by cell, or at least by D, from a season played on holiday, if the original
  can show it.
- Or we need the rule that keeps the carrier out of the six-yard area. Is it in `sub_6c87e0`, `sub_6bc030` or the
  tactical cell?

### 5c. Ball travel in `sub_6fad40`
How many ticks does a pass take? While it travels, can opponents in the receiver's cell win it, and by which roll?
We use `ceil(D/4)` ticks and a fixed 35 % chance.

### 5d. Restarts
- Where does the original set match+0x8eb2 back to 0 after a restart is taken?
- Where does it place the ball and the players for corners and free kicks?
- Corners and offsides are far too few in our engine (2,3 and 0,8 per match).

### 5e. Defensive shape and the carrier's duel (round 2 of the grid engine, 2026-11-09)
After round 2, 57 % of our shots are still taken from D ≤ 1, and almost half of the shots on target go in (the original:
28 %). We need the parts that decide where the shots are taken:
- `sub_6c2be0`/`sub_715f50`: how far the formation moves with the ball, and where the back line stands when the ball is in midfield.
  We use about a third of the ball's movement, and a line 2 rows from our own goal (*estimeret*).
- `sub_6f09f0` from 0x6f0e58: can a defender **next to** the carrier's new cell challenge, or only one in the same cell?
  We let a free neighbour challenge 40 % of the time (*estimeret*).
- `sub_6cfd70`: which attackers does the offside check look at? Only those near the pass target, all attackers ahead of the ball, or
  only the receiver? What is the attacker byte +0x107 (we use the off-the-ball roll), and what is a typical linesman +0x29?
- Home advantage: where is it in the original? With MatchSim's form (values ×1,038/×0,986), the grid engine gave only 1,78/1,68 goals,
  so we use five times as much (*estimeret*).
- Which challenge types (`sub_6e9820`) do open-play fouls have? With only type 42 we get 1,2–1,35 yellow cards per match (the original: 1,70).



---

## 6. Målt i originalen 9/11-2026 (nyt spil, 3.9.60, dag ét, uden attribute masking)

**Ronny Johnsen (Man Utd, CA 163):**
- Originalen viser Crossing 12, Long Shots 11, Dribbling 9 – præcis som kæden. Tallene 13/12/9 i opgaven var fra 1.9.01, efter træning.
- Alle 29 viste værdier rammes præcist, hvis den udfyldte One on Ones er 10 eller 13–15. Johnsen mangler Handling og One on Ones i databasen.
- Vores tilfældige udfyldning giver ±1 på 4 egenskaber. Kæden er altså bekræftet; kun udfyldningens tilfældighed afviger.

**Keepernes Off the Ball** (svar på §1a, nu indført i CM Reborn som *målt*):

| Keeper | Originalen | Med `0,1·CA` (to af tre frø) | Med CA |
|---|---|---|---|
| Seaman | 4 | 4 – 26/26 egenskaber ens | 11–12 |
| van der Gouw | 6 | 3–4 | 8–10 |
| Carroll | 4 | 3–4 | 8–10 |

**Spørgsmål:** står Off the Ball på listen i `sub_543540`/`sub_544410`? Er der flere?

**Udfyldningen af en manglende egenskab uden for de 18** (0x537640-løkken, grenen
`clamp_fill(rand(11) + ca/5 − 5)`, når skabelonen heller ikke har værdien):
- van der Gouw (CA 130) og Carroll (CA 130) mangler begge Free Kicks/Set Pieces i databasen.
- Originalen viser **15** og **13**. Med `ca/5` giver grenen 21–31, altså altid 20 (vi viser 20).
- `ca/10` ville give 8–18. Det passer med originalen.

**Spørgsmål:** er CA på dette sted en anden skala, eller deler originalen med 10? Gælder det også grenen uden skabelon
(`rand(7) + ca/5 − 3`)? Og hvorfor får van der Gouw One on Ones 10, når skabelonvalget for keepere giver score 0 for den
første keeper?
