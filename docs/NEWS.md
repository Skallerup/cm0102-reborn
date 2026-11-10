# Nyheder: CM 01/02 mod CM Reborn

Samlet oversigt over originalens 523 nyhedsoverskrifter (fra ejerens Bosman-projekt, `news/NEWS_LIST.md`, udtrukket af
egen kopi af cm0102.exe 3.9.68) sammenholdt med spillets egne nyheder (`addNews` i `src/game/`). Gælder begge
databaser. Originalens brødtekster bruges som spec – teksterne i `src/i18n` er vores egne formuleringer.

## Bygget 2026-11-06 (fra listen "EASY")

| Nøgle(r) | Originalens overskrift | Hvor |
|---|---|---|
| `ban.red`, `ban.yellows`, `ban.oneAway` | [spiller] banned for [n] matches / one match, One yellow card away … | sim.ts:applyMatchResult |
| `media.redCostly` | [spiller] indiscipline costs [klub] dear | sim.ts:applyMatchResult |
| `youth.debut`, `media.youngsterPraised` | Talented [spiller] given boost, Youngster [spiller] praised | sim.ts:applyMatchResult |
| `comp.through`, `comp.throughEurope`, `comp.playoffThrough` | [klub] march on / through to next round / fly the flag | competitions.ts:tieNews |
| `comp.out`, `comp.lostFinal`, `comp.playoffLost` | [klub] knocked out of …, lose [turnering] final, fail to win promotion | competitions.ts:tieNews |
| `comp.final` | [klub] through to final / qualify for Final | competitions.ts:createFinal |
| `comp.groupThrough`, `comp.groupOut` | [klub] qualify from / fail to qualify from [turnering] group | competitions.ts:checkGroupsDone, checkLeaguePhaseDone |
| `comp.playoffReached` | [klub] reach playoffs / qualify for playoff | competitions.ts:setupPlayoff |
| `comp.qualified` | [klub] qualify for [turnering] | newgame.ts:setupSeasonComps |
| `comp.avoidRelegation`, `comp.missedPromotion` | [klub] avoid relegation, [klub] fail to win promotion | season.ts:promotionRelegation |
| `media.preview.<forventning>` (7) | tipped for glory/promotion, expected to challenge, tipped as outsiders, expected to last pace, Press write off … | board.ts:setBoardExpectation |
| `fans.moodUp`, `fans.moodDown`, `fans.concern` | Fans' happy with / unhappy with / concern over [person] | fans.ts:fansMonthly |
| `transfer.listedByYou`, `transfer.requestGranted` | [manager] puts [spiller] on transfer list / grants transfer request | transfers.ts:listedNews |
| `transfer.loanEnded` | [person]'s loan finishes | season.ts:contractsAndLoans |
| `board.financialMess` | [klub] financial mess | finance.ts:monthlyIncome |
| `media.questionPurchase`, `board.surprisedDeparture` | Media question purchase of …, Board surprised at [person] departure | transfers.ts:completeTransfer |

| `react.*` (9) | Board back/defend [person], [formand] concerned/pleased by your handling of the media, Board fury at [manager] silence, Media question [spiller]'s attitude … | press.ts:applyPress (én pr. pressemøde) |
| `react.firmHandling`, `react.fineProtest`, `react.fineFallout` | Fans pleased by firm handling of [spiller], Players protest over [person]'s fine | personality.ts:interact |
| `column.climbing/slipping/titleCredentials` | [klub] climbing to safety, slip nearer relegation, Press discuss [klub] title credentials | media.ts:monthlyColumn |
| `column.signingImpresses/ratedHighly/underFire` | [spiller] impresses at [klub], rated highly, under fire | media.ts:monthlyColumn |
| `injury.lightTraining` | [spiller] resumes light training | sim.ts:newDay |
| `youth.regen` | (regens – egen tilføjelse) | season.ts:youthIntake |

Rettet samtidig (fletning, afsnit 4): spejdernes tre nyheder går nu gennem `addNews` (dæmpning og multiplayer virker),
og ungdomsårgangen giver én samlet nyhed (`youth.intakeDay`) i stedet for én pr. spiller. Test: tests/newsTypes.test.ts.

## Næste skridt

1. Pressereaktioner (~35, `press.ts:applyPress`), spillersamtaler/disciplin (~15, `personality.ts:interact`), mediespalten
   (~15, `media.ts:monthlyColumn`) – se afsnit 5 nedenfor.
2. Fletninger i afsnit 4 (budkrige, trofæ-ophobning, "vil væk", "bestyrelsen siger nej").
3. Ny mekanik (afsnit "Missing systems"): landshold/landsholdsturneringer, arbejdstilladelser, ankesager, AWOL, PLC.

---

# CM 01/02 news headlines vs. CM Reborn – mapping

Generated 2026-11-06 from `NEWS_LIST.md` (523 headlines, 17 groups) and a full AST scan of every `addNews(...)` call in `src/` (194 call sites + 3 direct `g.news.unshift` in `src/game/scouting.ts`). Machine-readable twin: `news-map.json`.

Classes: **COVERED** = we already send an equivalent item (our key given) · **EASY** = the event/state exists, only the news item is missing (trigger = file:function in `src/game/`) · **NEEDS-MECHANIC** = needs a game system we lack · **SKIP** = not a real headline for us (labels, text fragments, history-table lines, country quirks, debug).

Note: `talk.r.*` / `complaint.r.*` keys are *dialog replies* shown immediately in the player-talk UI (`personality.ts:interact`, `will.ts:answerComplaint`), not inbox items; rows mapped to them are COVERED in substance but could additionally become inbox items.

## Summary

| Group | Total | COVERED | EASY | NEEDS-MECHANIC | SKIP |
|---|---|---|---|---|---|
| Fra bestyrelsen og om klubbens økonomi (Board & club finances) | 39 | 11 | 20 | 7 | 1 |
| Om dig som manager og managerjob (You as manager & manager jobs) | 68 | 21 | 24 | 15 | 8 |
| Fra medierne og fansene (Media & fans) | 120 | 41 | 66 | 6 | 7 |
| Om spillere: skader og kondition (Players: injuries & fitness) | 6 | 3 | 3 | 0 | 0 |
| Om spillere: kontrakter og løn (Players: contracts & wages) | 47 | 26 | 3 | 3 | 15 |
| Om spillere: transfers, lån og bud fra andre klubber (Players: transfers, loans & bids) | 51 | 39 | 0 | 11 | 1 |
| Om spillere: disciplin, karantæner og bøder (Players: discipline, bans & fines) | 22 | 4 | 10 | 3 | 5 |
| Om spillere: udeblivelser og opførsel (Players: absences & behaviour) | 7 | 4 | 0 | 3 | 0 |
| Om spillere: landsholdet (Players: national team) | 7 | 0 | 0 | 6 | 1 |
| Om spillere: unge talenter og karrierestop (Players: youth & retirement) | 6 | 3 | 2 | 1 | 0 |
| Om spillere: priser og kåringer (Players: awards) | 12 | 11 | 1 | 0 | 0 |
| Fra trænerstaben og scouts (Coaching staff & scouts) | 8 | 4 | 2 | 0 | 2 |
| Fra forbundet: regler og transfervinduer (FA: rules & windows) | 6 | 0 | 4 | 2 | 0 |
| Landshold og landsholdsturneringer (National teams & tournaments) | 28 | 1 | 7 | 15 | 5 |
| Klubturneringer i Europa og verden (Club competitions (Europe/world)) | 20 | 7 | 8 | 5 | 0 |
| Ligaer, pokaler, lodtrækninger og kampprogram (Leagues, cups, draws & fixtures) | 38 | 5 | 23 | 3 | 7 |
| Rekorder og historie (Records & history) | 38 | 8 | 2 | 1 | 27 |
| **Total** | **523** | **188** | **175** | **81** | **79** |

Of the 444 relevant headlines (excluding SKIP): 42 % covered, 39 % easy, 18 % need a new mechanic.

### Missing systems (NEEDS-MECHANIC, by headline count)

| Missing system | Headlines |
|---|---|
| International tournaments | 13 |
| National team squads / call-ups | 6 |
| National team squads | 6 |
| Work permits | 5 |
| Time-based bans | 5 |
| National team management | 4 |
| Competition squad registration | 3 |
| Contract disputes / tribunal outcome | 2 |
| Player-manager role | 2 |
| Ban appeals | 2 |
| Loan cancellation / termination | 2 |
| Player feuds / relationships | 2 |
| Owner/benefactor investment (cash injections into the club) | 1 |
| Club ownership model (PLC flotation / shares) | 1 |
| Board ultimatum (concrete target over next N matches) | 1 |
| Contract disputes / tribunal (dispute.cpp) | 1 |
| Club takeovers / ownership changes | 1 |
| AI manager ageing / retirement | 1 |
| AI manager resignations (AI only leave via sack/poach) | 1 |
| Manager media comments about other clubs' players | 1 |
| FA discipline of managers (charges for comments) | 1 |
| Post-match FA misconduct charges | 1 |
| Retrospective video bans | 1 |
| AI managers commenting on your players in the media | 1 |
| Players able to refuse a trial | 1 |
| Early loan termination / recall | 1 |
| Loan recall | 1 |
| Board veto of transfers (we block in UI only) | 1 |
| Part-exchange player withdrawal | 1 |
| Deferred transfer completion (medicals / paperwork) | 1 |
| Deferred transfer completion | 1 |
| Player leave / AWOL | 1 |
| Player AWOL | 1 |
| Return after AWOL | 1 |
| Career-ending injuries | 1 |
| International tournaments (3rd/4th place games) | 1 |
| International tournaments (3rd place games) | 1 |
| Training/development compensation for young players | 1 |
| FA club fines for misconduct (ffp.sanction is related) | 1 |
| Staff morale / role complaints | 1 |
| International matches | 1 |

## 1. Inventory: news our game can produce today (310 distinct keys)

Key, category, call site(s) (`src/` relative, line, enclosing function), trigger condition and English headline from `src/i18n/en.ts` (`.body` = a body text exists as `<key>.body`). Template-literal and variable keys are expanded to the concrete keys present in en.ts.

| Key | Cat | Call site(s) | Trigger | English headline |
|---|---|---|---|---|
| `bet.acceptedByThem` | ? | game/rivalry.ts:31 tell<br>game/rivalry.ts:90 proposeBet | Multiplayer press jabs and bets between humans | {name} accepts the bet of {fee} |
| `bet.declinedByThem` | ? | game/rivalry.ts:31 tell<br>game/rivalry.ts:90 proposeBet | Multiplayer press jabs and bets between humans | {name} declines the bet |
| `bet.lost` | ? | game/rivalry.ts:31 tell | Multiplayer press jabs and bets between humans | You lost the bet against {name}: −{fee} |
| `bet.proposed` | ? | game/rivalry.ts:31 tell | Multiplayer press jabs and bets between humans | {from} wants to bet {fee} on the match against you *(+body)* |
| `bet.void` | ? | game/rivalry.ts:31 tell | Multiplayer press jabs and bets between humans | A draw – the bet of {fee} is void |
| `bet.won` | ? | game/rivalry.ts:31 tell | Multiplayer press jabs and bets between humans | You won the bet against {name}: +{fee} |
| `ffp.sanction` | ? | game/finance.ts:336 ffpReview | Season end: club breaches FFP (fine) – big/human clubs only | {club} sanctioned for breaching Financial Fair Play (fine {fee}) |
| `jab.backfired` | ? | game/rivalry.ts:31 tell | Multiplayer press jabs and bets between humans | Embarrassing for {from} – the jab backfired *(+body)* |
| `jab.draw` | ? | game/rivalry.ts:31 tell | Multiplayer press jabs and bets between humans | A draw in the press war between {from} and {to} *(+body)* |
| `jab.news` | ? | game/rivalry.ts:31 tell | Multiplayer press jabs and bets between humans | Press war: {from} has a go at {to} *(+body)* |
| `jab.received` | ? | game/rivalry.ts:31 tell | Multiplayer press jabs and bets between humans | {from} has a go at you in the press! *(+body)* |
| `jab.right` | ? | game/rivalry.ts:31 tell | Multiplayer press jabs and bets between humans | {from} was right! The jab at {to} held up *(+body)* |
| `news.retired` | ? | game/season.ts:204 retirements<br>game/season.ts:205 retirements | July 1: player retires (big name or own club) | {player} retires at {age} |
| `transfer.bosmanDone` | ? | game/season.ts:179 contractsAndLoans<br>game/season.ts:180 contractsAndLoans | July 1: Bosman moves complete / contract expired, player leaves | {player} moves from {from} to {to} on a Bosman |
| `transfer.done` | ? | game/transfers.ts:604 completeTransfer | Any transfer involving the user's club completes (others go to the weekly digest) | {player} moves from {from} to {to} for {fee} |
| `transfer.freeDone` | ? | game/transfers.ts:604 completeTransfer | Any transfer involving the user's club completes (others go to the weekly digest) | {player} signs for {to} on a free transfer |
| `transfer.loanDone` | ? | game/transfers.ts:604 completeTransfer | Any transfer involving the user's club completes (others go to the weekly digest) | {player} joins {to} on loan from {from} |
| `ach.unlocked` | award | game/achievements.ts:31 unlock | Achievement unlocked for the first time | {icon} Achievement unlocked: {name} |
| `award.ballonDor` | award | game/awards.ts:146 seasonGala | Season end gala: Ballon d'Or, manager of the year, gala summary | Ballon d'Or: {player} ({club}) is the world player of the year |
| `award.gala` | award | game/awards.ts:152 seasonGala | Season end gala: Ballon d'Or, manager of the year, gala summary | Awards night for the {season} season *(+body)* |
| `award.managerOfYearMe` | award | game/awards.ts:150 seasonGala | Season end gala: Ballon d'Or, manager of the year, gala summary | You are manager of the year! 🏆 |
| `award.monthManager` | award | game/awards.ts:80 monthlyAwards | 1st of each month (and end of June): league player/manager of the month in active leagues | {comp} manager of the month: {manager} ({club}) |
| `award.monthManagerMe` | award | game/awards.ts:79 monthlyAwards | 1st of each month (and end of June): league player/manager of the month in active leagues | You are {comp} manager of the month! ({pts} points) |
| `award.monthPlayer` | award | game/awards.ts:76 monthlyAwards | 1st of each month (and end of June): league player/manager of the month in active leagues | {comp} player of the month: {player} ({club}) |
| `award.playerOfYear` | award | game/season.ts:83 seasonAwards | Season end: league player of the year, top scorer | {player} is named {comp} player of the year |
| `award.topScorer` | award | game/season.ts:84 seasonAwards | Season end: league player of the year, top scorer | {player} finished {comp} top scorer with {goals} goals |
| `ba.no.confidenceVote` | board | game/board.ts:760 boardAsk | User request in the board room (lower target, vote of confidence, youth drive, camp) | The board refuses a vote of confidence |
| `ba.no.lowerExp` | board | game/board.ts:760 boardAsk | User request in the board room (lower target, vote of confidence, youth drive, camp) | The board sticks to its target |
| `ba.no.short` | board | game/board.ts:760 boardAsk | User request in the board room (lower target, vote of confidence, youth drive, camp) | The board said no. |
| `ba.no.trainingCamp` | board | game/board.ts:760 boardAsk | User request in the board room (lower target, vote of confidence, youth drive, camp) | The board says no to a training camp |
| `ba.no.youthDrive` | board | game/board.ts:760 boardAsk | User request in the board room (lower target, vote of confidence, youth drive, camp) | The board says no to extra youth recruitment |
| `ba.yes.confidenceVote` | board | game/board.ts:775 boardAsk | User request in the board room (lower target, vote of confidence, youth drive, camp) | The board gives the manager its full backing |
| `ba.yes.lowerExp` | board | game/board.ts:769 boardAsk | User request in the board room (lower target, vote of confidence, youth drive, camp) | The board lowers the target: new goal is position {pos} |
| `ba.yes.youthDrive` | board | game/board.ts:781 boardAsk | User request in the board room (lower target, vote of confidence, youth drive, camp) | The board pays {cost} for extra youth recruitment |
| `board.c.badLoss` | board | game/board.ts:113 boardMatchComment | After user match (via boardAfterMatch): notable result or form streak, with probability p | The board are unhappy with the defeat to {opp} *(+body)* |
| `board.c.cupShock` | board | game/board.ts:113 boardMatchComment | After user match (via boardAfterMatch): notable result or form streak, with probability p | The board are shocked by the cup exit against {opp} *(+body)* |
| `board.c.dropped` | board | game/board.ts:113 boardMatchComment | After user match (via boardAfterMatch): notable result or form streak, with probability p | The board expected a win over {opp} *(+body)* |
| `board.c.europeWin` | board | game/board.ts:113 boardMatchComment | After user match (via boardAfterMatch): notable result or form streak, with probability p | The board are proud of the European win against {opp} *(+body)* |
| `board.c.goodWin` | board | game/board.ts:113 boardMatchComment | After user match (via boardAfterMatch): notable result or form streak, with probability p | The board praise the {score} win over {opp} *(+body)* |
| `board.c.humiliation` | board | game/board.ts:113 boardMatchComment | After user match (via boardAfterMatch): notable result or form streak, with probability p | The board are furious about the {score} defeat to {opp} *(+body)* |
| `board.c.lossStreak` | board | game/board.ts:113 boardMatchComment | After user match (via boardAfterMatch): notable result or form streak, with probability p | The board are deeply concerned by the losing run *(+body)* |
| `board.c.noWins` | board | game/board.ts:113 boardMatchComment | After user match (via boardAfterMatch): notable result or form streak, with probability p | The board want to see wins *(+body)* |
| `board.c.survivalWin` | board | game/board.ts:113 boardMatchComment | After user match (via boardAfterMatch): notable result or form streak, with probability p | The board are pleased with the vital points against {opp} *(+body)* |
| `board.c.thrashing` | board | game/board.ts:113 boardMatchComment | After user match (via boardAfterMatch): notable result or form streak, with probability p | The board enjoyed the {score} win over {opp} *(+body)* |
| `board.c.upsetWin` | board | game/board.ts:113 boardMatchComment | After user match (via boardAfterMatch): notable result or form streak, with probability p | The board are thrilled with the {score} win over {opp} *(+body)* |
| `board.c.winStreak` | board | game/board.ts:113 boardMatchComment | After user match (via boardAfterMatch): notable result or form streak, with probability p | The board are delighted with the winning run *(+body)* |
| `board.delighted` | board | game/board.ts:225 boardSeasonEnd | Season end: board verdict vs expectation (delighted/satisfied/disappointed) | The board are delighted – your transfer budget has been increased |
| `board.disappointed` | board | game/board.ts:228 boardSeasonEnd | Season end: board verdict vs expectation (delighted/satisfied/disappointed) | The board are disappointed with the season |
| `board.exp.mid` | board | game/board.ts:65 setBoardExpectation | Season start / new job: board sets the season target | The board expect a mid-table finish |
| `board.exp.playoffs` | board | game/board.ts:65 setBoardExpectation | Season start / new job: board sets the season target | The board expect at least a play-off place |
| `board.exp.promotion` | board | game/board.ts:65 setBoardExpectation | Season start / new job: board sets the season target | The board expect promotion |
| `board.exp.survive` | board | game/board.ts:65 setBoardExpectation | Season start / new job: board sets the season target | The board expect you to avoid relegation |
| `board.exp.title` | board | game/board.ts:65 setBoardExpectation | Season start / new job: board sets the season target | The board expect the title *(+body)* |
| `board.exp.top3` | board | game/board.ts:65 setBoardExpectation | Season start / new job: board sets the season target | The board expect a top 3 finish |
| `board.exp.tophalf` | board | game/board.ts:65 setBoardExpectation | Season start / new job: board sets the season target | The board expect a top-half finish |
| `board.meeting` | board | game/fans.ts:135 boardMeeting | Periodic board meeting summary (confidence, position, fans, balance) | Board meeting: confidence {conf}%, position {pos} (expected {expected}) *(+body)* |
| `board.overWage` | board | game/board.ts:167 badContracts | Monthly board check: well-paid player hardly playing / wage bill over budget | The board is worried about the wage bill *(+body)* |
| `board.project.approved` | board | game/board.ts:644 requestProject | User asks board for stadium/facility/youth project | The board have approved the project ({kind}) for {cost} *(+body)* |
| `board.project.done` | board | game/board.ts:661 completeProjects | Daily: a building project finishes | The building project is complete ({kind}) *(+body)* |
| `board.project.noConfidence` | board | game/board.ts:632 requestProject | User asks board for stadium/facility/youth project | The board will not invest until results improve |
| `board.project.noMoney` | board | game/board.ts:636 requestProject | User asks board for stadium/facility/youth project | The board say no: the club does not have {cost} for the project |
| `board.requestNo` | board | game/board.ts:309 requestBudget | User asks board for more transfer/wage budget | The board have turned down your request ({kind}) |
| `board.requestOk` | board | game/board.ts:301 requestBudget<br>game/board.ts:322 answerBudgetCounter | User asks board for more transfer/wage budget | The board have raised the {kind} by {pct}% |
| `board.satisfied` | board | game/board.ts:228 boardSeasonEnd | Season end: board verdict vs expectation (delighted/satisfied/disappointed) | The board are satisfied with the season |
| `board.warning` | board | game/board.ts:138 boardMonthly | Monthly: board confidence low -> warning; below sack threshold -> sackUser | The board are unhappy with results *(+body)* |
| `board.wasteWage` | board | game/board.ts:161 badContracts | Monthly board check: well-paid player hardly playing / wage bill over budget | The board wonders: {player} earns {wage} a week but hardly plays *(+body)* |
| `camp.approved` | board | game/camp.ts:65 planCamp | User plans a training camp (board approves/declines) | The board approves the training camp: {dest} from {date} ({cost}) |
| `camp.noConfidence` | board | game/camp.ts:63 planCamp | User plans a training camp (board approves/declines) | The board will not pay for a training camp right now |
| `camp.noMoney` | board | game/camp.ts:62 planCamp | User plans a training camp (board approves/declines) | The board says no to the training camp – no money ({cost}) |
| `transfer.releaseBlocked` | board | game/transfers.ts:644 releasePlayer | User releases a player (or board blocks it) | Board block {player} departure *(+body)* |
| `trophy.board.cup` | board | game/fans.ts:171 celebrateTrophy | User club wins league/cup/Europe: press, captain, fans and board items | The board congratulates you on the {comp}! *(+body)* |
| `trophy.board.cupAgain` | board | game/fans.ts:171 celebrateTrophy | User club wins league/cup/Europe: press, captain, fans and board items | The board: the {comp} again – title no. {n} under {manager}! *(+body)* |
| `trophy.board.europe` | board | game/fans.ts:171 celebrateTrophy | User club wins league/cup/Europe: press, captain, fans and board items | European triumph! The board is ecstatic about the {comp} *(+body)* |
| `trophy.board.europeAgain` | board | game/fans.ts:171 celebrateTrophy | User club wins league/cup/Europe: press, captain, fans and board items | The board: the {comp} again – {manager} is a legend! *(+body)* |
| `trophy.board.league` | board | game/fans.ts:171 celebrateTrophy | User club wins league/cup/Europe: press, captain, fans and board items | The board salutes {manager}: {club} are champions! *(+body)* |
| `trophy.board.leagueAgain` | board | game/fans.ts:171 celebrateTrophy | User club wins league/cup/Europe: press, captain, fans and board items | The board: {manager} does it again – title no. {n}! *(+body)* |
| `clause.promotedWage` | contract | game/clauses.ts:158 seasonWageClauses | Season start: relegation wage cut / promotion wage rise clauses | {player} gets a wage rise after promotion: {wage}/week (was {old}) |
| `clause.relegatedWage` | contract | game/clauses.ts:152 seasonWageClauses | Season start: relegation wage cut / promotion wage rise clauses | {player} takes a pay cut after relegation *(+body)* |
| `contract.expiring` | contract | game/transfers.ts:1226 contractReminders | Reminder: contract expires this summer / player agreed Bosman move | {player}'s contract expires this summer *(+body)* |
| `contract.leavingBosman` | contract | game/transfers.ts:1226 contractReminders<br>game/transfers.ts:1246 aiBosman | Reminder: contract expires this summer / player agreed Bosman move | {player} has agreed to join {club} in the summer |
| `contract.left` | contract | game/season.ts:182 contractsAndLoans | July 1: Bosman moves complete / contract expired, player leaves | {player} has left the club (contract expired) |
| `contract.renewed` | contract | game/transfers.ts:699 renewContract | User renews a contract | {player} has signed a {years}-year extension |
| `pers.brokenPromise` | contract | game/personality.ts:109 monthlyPersonality | Monthly per human club: broken promise, ambitious star wants away, troublemaker incident | {player} feels cheated – the promise was broken *(+body)* |
| `pers.wantsAway` | contract | game/personality.ts:118 monthlyPersonality | Monthly per human club: broken promise, ambitious star wants away, troublemaker incident | {player} wants to leave the club *(+body)* |
| `reject.r.contract.2` | contract | game/will.ts:314 blockedMoveReaction | User rejects a bid with a reason: player's reply | {player}: Sounds good! If the club shows it believes in me, I'm happy to stay. I look forward to the offer. |
| `reject.r.future.0` | contract | game/will.ts:314 blockedMoveReaction | User rejects a bid with a reason: player's reply | {player}: The future? I don't quite believe that – I can see who's playing. |
| `reject.r.future.0Calm` | contract | game/will.ts:314 blockedMoveReaction | User rejects a bid with a reason: player's reply | {player}: Okay… I wasn't that interested in {club} anyway. |
| `reject.r.future.1` | contract | game/will.ts:314 blockedMoveReaction | User rejects a bid with a reason: player's reply | {player}: Nice to hear. But then I want my chance on the pitch too. |
| `reject.r.future.1Calm` | contract | game/will.ts:314 blockedMoveReaction | User rejects a bid with a reason: player's reply | {player}: Thanks, boss. I wasn't in a hurry to join {club} anyway. |
| `reject.r.future.2` | contract | game/will.ts:314 blockedMoveReaction | User rejects a bid with a reason: player's reply | {player}: Wow, thanks boss. That means everything to me. I'll stay and prove you right. |
| `reject.r.key.0` | contract | game/will.ts:314 blockedMoveReaction | User rejects a bid with a reason: player's reply | {player}: Key player? I barely play. That doesn't add up – I'm disappointed. |
| `reject.r.key.0Calm` | contract | game/will.ts:314 blockedMoveReaction | User rejects a bid with a reason: player's reply | {player}: Key player? I haven't noticed much of that. But {club} doesn't appeal to me much either. |
| `reject.r.key.1` | contract | game/will.ts:314 blockedMoveReaction | User rejects a bid with a reason: player's reply | {player}: Okay, I hear what you're saying. But then I want to feel it on the pitch. |
| `reject.r.key.1Calm` | contract | game/will.ts:314 blockedMoveReaction | User rejects a bid with a reason: player's reply | {player}: Nice to hear. I wasn't planning on moving to {club} anyway. |
| `reject.r.key.2` | contract | game/will.ts:314 blockedMoveReaction | User rejects a bid with a reason: player's reply | {player}: Thanks, boss. It means a lot that you're building the team around me. {club} is forgotten – I'll give everything for us. |
| `reject.r.low.0` | contract | game/will.ts:314 blockedMoveReaction | User rejects a bid with a reason: player's reply | {player}: Too low? That was a huge offer! I feel the club is standing in my way. |
| `reject.r.low.0Calm` | contract | game/will.ts:314 blockedMoveReaction | User rejects a bid with a reason: player's reply | {player}: It was a good offer, but fine – I wasn't keen on moving. |
| `reject.r.low.1` | contract | game/will.ts:314 blockedMoveReaction | User rejects a bid with a reason: player's reply | {player}: Maybe… but it was a decent offer. I hope you listen if they come back with more. |
| `reject.r.low.1Calm` | contract | game/will.ts:314 blockedMoveReaction | User rejects a bid with a reason: player's reply | {player}: Understood. I'm happy here anyway. |
| `reject.r.low.2` | contract | game/will.ts:314 blockedMoveReaction | User rejects a bid with a reason: player's reply | {player}: That's right – I'm worth more than that. Good that the club stands firm. |
| `transfer.released` | contract | game/transfers.ts:655 releasePlayer | User releases a player (or board blocks it) | {player} has been released |
| `trophy.captain.cup` | contract | game/fans.ts:169 celebrateTrophy | User club wins league/cup/Europe: press, captain, fans and board items | {player}: “You gave us belief in the final” *(+body)* |
| `trophy.captain.europe` | contract | game/fans.ts:169 celebrateTrophy | User club wins league/cup/Europe: press, captain, fans and board items | {player}: “The greatest night of my life – thank you, boss” *(+body)* |
| `trophy.captain.league` | contract | game/fans.ts:169 celebrateTrophy | User club wins league/cup/Europe: press, captain, fans and board items | {player}: “This is for you and the fans, boss” *(+body)* |
| `will.complain.blocked` | contract | game/will.ts:109 playerComplains | Player complaint opened (renewal/time/morale/press/blocked move) | {player} is disappointed you turned down {club} *(+body)* |
| `will.complain.morale` | contract | game/will.ts:109 playerComplains | Player complaint opened (renewal/time/morale/press/blocked move) | {player} is struggling and would like to talk *(+body)* |
| `will.complain.press` | contract | game/will.ts:109 playerComplains | Player complaint opened (renewal/time/morale/press/blocked move) | {player} is upset about your comments to the press *(+body)* |
| `will.complain.renewal` | contract | game/will.ts:109 playerComplains | Player complaint opened (renewal/time/morale/press/blocked move) | {player} does not want to extend his contract *(+body)* |
| `will.complain.time` | contract | game/will.ts:109 playerComplains | Player complaint opened (renewal/time/morale/press/blocked move) | {player} wants to talk to you about his playing time *(+body)* |
| `will.contractDemand` | contract | game/will.ts:60 monthlyWill | Monthly: contract demand, leak, wants away, clique unrest | {player}'s agent demands a new contract *(+body)* |
| `will.demandWantsAway` | contract | game/will.ts:74 monthlyWill | Monthly: contract demand, leak, wants away, clique unrest | {player} wants to leave after being ignored |
| `will.praise.contract` | contract | game/will.ts:119 playerPraises | Player thanks manager (form, press, contract) | {player} is happy with his new contract *(+body)* |
| `will.praise.contractLeader` | contract | game/will.ts:119 playerPraises | Player thanks manager (form, press, contract) | {player} is happy with his new contract – and it shows *(+body)* |
| `will.praise.form` | contract | game/will.ts:119 playerPraises | Player thanks manager (form, press, contract) | {player}: “Thanks for the trust, boss” *(+body)* |
| `will.praise.formLeader` | contract | game/will.ts:119 playerPraises | Player thanks manager (form, press, contract) | {player} praises you in front of the whole squad *(+body)* |
| `will.praise.press` | contract | game/will.ts:119 playerPraises | Player thanks manager (form, press, contract) | {player} thanks you for backing him in the press *(+body)* |
| `will.praise.pressLeader` | contract | game/will.ts:119 playerPraises | Player thanks manager (form, press, contract) | {player} thanks you for the backing – and the squad listens *(+body)* |
| `will.promiseBrokenTime` | contract | game/will.ts:136 weeklyPlayerContact | Weekly: playing-time promise kept/broken | {player} wants to leave: you broke your promise of playing time |
| `will.promiseKept` | contract | game/will.ts:135 weeklyPlayerContact | Weekly: playing-time promise kept/broken | {player} is happy – you kept your promise of playing time |
| `budget.january` | finance | game/finance.ts:186 januaryBudgetTopUp | January window opens: board tops up transfer budget | The window opens: the board tops up the transfer budget by {fee} to {budget} |
| `clause.addOnOwed` | finance | game/clauses.ts:132 afterAppearance | Add-on clause hits N appearances | {player} has played {n} games – {fee} to {club} *(+body)* |
| `clause.addOnPaid` | finance | game/clauses.ts:133 afterAppearance | Add-on clause hits N appearances | Add-on: {fee} from {club} *(+body)* |
| `clause.sellOnOwed` | finance | game/clauses.ts:113 settleSellOn | A sold player with sell-on clause is sold again | Sell-on clause: {fee} to {club} *(+body)* |
| `clause.sellOnPaid` | finance | game/clauses.ts:112 settleSellOn | A sold player with sell-on clause is sold again | Sell-on: {fee} from {club} for {player} *(+body)* |
| `sponsor.bonusMissed` | finance | game/finance.ts:285 sponsorSeasonBonus | Season end: sponsor trophy bonus paid or missed | Target missed – no sponsor bonus ({fee}) |
| `sponsor.bonusPaid` | finance | game/finance.ts:285 sponsorSeasonBonus | Season end: sponsor trophy bonus paid or missed | The sponsor pays the season bonus: {fee} |
| `sponsor.offers` | finance | game/newgame.ts:329 createGame<br>game/season.ts:530 seasonRollover | New game: welcome, window open, sponsor offers | New sponsorship offers are ready *(+body)* |
| `sponsor.signed` | finance | game/finance.ts:261 chooseSponsor | User picks a sponsor | Sponsorship deal signed |
| `camp.departed` | general | game/camp.ts:88 campDaily | Daily: squad departs for training camp | ✈️ The squad has left for a training camp: {dest} (home {date}) |
| `camp.report` | general | game/camp.ts:127 finishCamp | Training camp ends: report on morale/condition/bonding | 📋 Training camp report ({dest}): {mood} *(+body)* |
| `challenge.lost` | general | game/season.ts:536 seasonRollover | July 1: reserves promoted, sponsor offers, challenge result, new season | Challenge failed: {id} |
| `challenge.won` | general | game/season.ts:536 seasonRollover | July 1: reserves promoted, sponsor offers, challenge result, new season | Challenge complete: {id} 🏆 |
| `chat.news` | general | game/chat.ts:50 botSay | Multiplayer bot sends a chat message | {name} sent you a message *(+body)* |
| `column.month` | general | game/media.ts:63 monthlyColumn | Monthly (not July): newspaper column on the league race | Column: {leader} lead the {comp} *(+body)* |
| `draft.news.final` | general | game/draft.ts:538 draftLeagueDone | Draft mode: playoff semis/final set | Playoff final: {a} v {b} |
| `draft.news.over` | general | game/draft.ts:572 draftSeasonCheck | Draft mode: season over | Season {n} is over – {club} are champions! *(+body)* |
| `draft.news.season` | general | game/draft.ts:422 buildDraftGame | Draft mode season start | Season {n} kicks off for {club} *(+body)* |
| `draft.news.semis` | general | game/draft.ts:538 draftLeagueDone | Draft mode: playoff semis/final set | Playoff: the top four meet in the semi-finals |
| `fans.leave.free2` | general | game/fans.ts:90 fansOnDeparture | User sells/releases/loses on a free a popular player | Disappointment among the fans: {player} is leaving {club} on a free. "Why didn't the club get him to extend?" |
| `fans.leave.free3` | general | game/fans.ts:90 fansOnDeparture | User sells/releases/loses on a free a popular player | The fans are shocked: {player} is leaving {club} without the club getting a penny. The criticism of the board is fierce. |
| `fans.leave.released2` | general | game/fans.ts:90 fansOnDeparture | User sells/releases/loses on a free a popular player | The fans don't understand why {player} has been released. "One of our best – and we don't even get money for him?" |
| `fans.leave.released3` | general | game/fans.ts:90 fansOnDeparture | User sells/releases/loses on a free a popular player | Fury among the fans: {club} have released {player}, the team's biggest name. Many demand an explanation from the manager. |
| `fans.leave.sold2` | general | game/fans.ts:90 fansOnDeparture | User sells/releases/loses on a free a popular player | The fans are sad about the sale of {player}. "Who will carry the team now?" they ask in the fan forum. |
| `fans.leave.sold3` | general | game/fans.ts:90 fansOnDeparture | User sells/releases/loses on a free a popular player | Anger among the fans: {club} have sold {player}, the team's biggest name. Many don't understand the decision. |
| `fans.renew2` | general | game/fans.ts:76 fansOnRenewal | User renews a fan favourite (hype >= 2) | The fans are relieved: {player} has extended his contract with {club}. "Finally some good news from the office," they say in the stands. |
| `fans.renew3` | general | game/fans.ts:76 fansOnRenewal | User renews a fan favourite (hype >= 2) | Delight among the fans: {player} has signed a new contract with {club}! The club's biggest name is staying – and the fan forum is celebrating. |
| `fans.signing2` | general | game/fans.ts:50 fansOnSigning | User signs a player with signing hype >= 2 | The fans are thrilled: {player} has arrived at {club}! The ticket office phones are ringing, and the board is visibly pleased. |
| `fans.signing3` | general | game/fans.ts:50 fansOnSigning | User signs a player with signing hype >= 2 | Sensation! {player} joins {club}, and the whole town is buzzing. Fans are queuing for shirts and season tickets, and the board is rubbing its hands. |
| `jab.botBack.1` | general | game/rivalry.ts:61 sendJab | User jabs another manager; bot hits back | {to} hits back: “{from} should mind his own team” |
| `jab.botBack.2` | general | game/rivalry.ts:61 sendJab | User jabs another manager; bot hits back | {to} laughs at {from}: “See you on the pitch – then we can talk” |
| `jab.botBack.3` | general | game/rivalry.ts:61 sendJab | User jabs another manager; bot hits back | {to} to the paper: “Big words from {from}” |
| `jab.sent` | general | game/rivalry.ts:54 sendJab | User jabs another manager; bot hits back | You have a go at {to} in the press *(+body)* |
| `mp.autopilot` | general | online/client.ts:563 process | Multiplayer: autopilot played the last turn | Your assistant took over last turn *(+body)* |
| `mp.joined` | general | game/actions.ts:249 applyActionAs | Multiplayer: a human joins/takes over a club | {manager} has taken over {club} |
| `mp.removed` | general | game/board.ts:675 removeHooks.news | Multiplayer: a human leaves the game | {manager} has left the game – {club} gets a new manager |
| `news.champions` | general | game/competitions.ts:498 checkLeagueProgress | League round done: split into groups / champions decided | {club} are {comp} champions! |
| `news.cupWin` | general | game/competitions.ts:640 advance | Cup/playoff/continental final decided (winner) | {club} win the {comp}! |
| `news.newSeason` | general | game/season.ts:539 seasonRollover | July 1: reserves promoted, sponsor offers, challenge result, new season | The {season} season begins |
| `news.playoffWin` | general | game/competitions.ts:640 advance | Cup/playoff/continental final decided (winner) | {club} win the {comp} |
| `news.promoted` | general | game/season.ts:152 promotionRelegation | Season end: user/relevant club promoted or relegated | {club} are promoted to {comp} |
| `news.relegated` | general | game/season.ts:152 promotionRelegation | Season end: user/relevant club promoted or relegated | {club} are relegated to {comp} |
| `news.split` | general | game/competitions.ts:492 checkLeagueProgress | League round done: split into groups / champions decided | {comp} has split into championship and relegation groups |
| `news.trainingAdvice` | general | game/sim.ts:396 newDay | Daily: injury recovered; quarterly training advice | {coach} thinks {n} players should change their training *(+body)* |
| `news.ueclQualified` | general | game/save.ts:112 upgradeLoaded | Save upgrade: club placed in Conference League | {club} will play in the Conference League! *(+body)* |
| `news.welcome` | general | game/actions.ts:248 applyActionAs<br>game/newgame.ts:326 createGame | Multiplayer: a human joins/takes over a club | Welcome to {club}, {manager}! *(+body)* |
| `onb.briefing` | general | game/onboarding.ts:81 briefing | Onboarding: assistant's plan | 📋 The assistant's plan: start with {weak} and play {style} |
| `pers.incident.fight` | general | game/personality.ts:129 monthlyPersonality | Monthly per human club: broken promise, ambitious star wants away, troublemaker incident | {player} got into a fight with a team-mate |
| `pers.incident.late` | general | game/personality.ts:129 monthlyPersonality | Monthly per human club: broken promise, ambitious star wants away, troublemaker incident | {player} was late for training again |
| `pers.incident.media` | general | game/personality.ts:129 monthlyPersonality | Monthly per human club: broken promise, ambitious star wants away, troublemaker incident | {player} criticised the team in the media |
| `pers.incident.nightclub` | general | game/personality.ts:129 monthlyPersonality | Monthly per human club: broken promise, ambitious star wants away, troublemaker incident | {player} was spotted at a nightclub the night before a game |
| `press.invitePost` | general | game/press.ts:295 invitePress | Day before user match / after match: press conference invitation | The press want to talk after the match against {opp} *(+body)* |
| `press.invitePre` | general | game/press.ts:295 invitePress | Day before user match / after match: press conference invitation | Press conference before the match against {opp} *(+body)* |
| `press.promiseBroken` | general | game/press.ts:405 resolvePressPromise | Match after a press 'promise' tone: promise kept/broken | Promise broken: no win over {opp} *(+body)* |
| `press.promiseKept` | general | game/press.ts:400 resolvePressPromise | Match after a press 'promise' tone: promise kept/broken | Promise kept: the win over {opp} you promised *(+body)* |
| `press.report` | general | game/press.ts:383 applyPress | User answers a press conference | {headline} *(+body)* |
| `press.reportPlain` | general | game/press.ts:383 applyPress | User answers a press conference | The manager faced the press ({opp}) |
| `recb.news.apps` | general | game/records.ts:32 recordsAfterMatch>news | After user match: club legend, appearance/goal records, biggest win, record attendance | New club record: {player} now has the most appearances for the club ({n}) |
| `recb.news.att` | general | game/records.ts:32 recordsAfterMatch>news | After user match: club legend, appearance/goal records, biggest win, record attendance | Record attendance: {att} v {opp} |
| `recb.news.bigWin` | general | game/records.ts:32 recordsAfterMatch>news | After user match: club legend, appearance/goal records, biggest win, record attendance | Club record! {score} v {opp} is the club's biggest win |
| `recb.news.goals` | general | game/records.ts:32 recordsAfterMatch>news | After user match: club legend, appearance/goal records, biggest win, record attendance | New club record: {player} is now the club's all-time top scorer ({n} goals) |
| `recb.news.legend` | general | game/records.ts:32 recordsAfterMatch>news | After user match: club legend, appearance/goal records, biggest win, record attendance | {player} is now a club legend: {apps} games and {goals} goals |
| `recb.news.legendStaff` | general | game/records.ts:154 retireIntoStaff | Club legend retires and joins staff | Club legend {player} retires – and wants to stay at the club as {role}. Find him under Staff. |
| `reform.news.calm` | general | game/personality.ts:181 reformStep | Monthly: hot-headed player's reform reaches 100 | {player} has calmed down completely and is no longer hot-headed |
| `reform.news.noLongerTrouble` | general | game/personality.ts:181 reformStep | Monthly: hot-headed player's reform reaches 100 | {player} has turned it around – he is no longer a troublemaker! |
| `reform.news.progress` | general | game/personality.ts:181 reformStep | Monthly: hot-headed player's reform reaches 100 | {player} is starting to calm down – the staff notice a difference |
| `staff.bidFailed` | general | game/staff.ts:151 resolveStaffBids | Daily: staff picks among offers | {name} could not be hired after all |
| `staff.bidLost` | general | game/staff.ts:151 resolveStaffBids | Daily: staff picks among offers | {name} chose {club} instead of you |
| `staff.bidSent` | general | game/staff.ts:53 hireStaff | User offers staff a job (bidding war if several clubs) | You have offered {name} a job – answer tomorrow |
| `staff.bidWon` | general | game/staff.ts:153 resolveStaffBids | Daily: staff picks among offers | {name} accepts your offer – {n} clubs bid |
| `staff.hired` | general | game/staff.ts:94 doHire | Staff joins (possibly bought out) | {name} has joined as {role} |
| `staff.poached` | general | game/staff.ts:92 doHire | Staff joins (possibly bought out) | {name} bought out from {club} for {fee} |
| `story.ready` | general | game/story.ts:76 storySeasonEnd | Season end: season card ready | 📖 The season card for {season} is ready under History |
| `trophy.fans.cup` | general | game/fans.ts:170 celebrateTrophy | User club wins league/cup/Europe: press, captain, fans and board items | The fans celebrate the {comp} win all night *(+body)* |
| `trophy.fans.europe` | general | game/fans.ts:170 celebrateTrophy | User club wins league/cup/Europe: press, captain, fans and board items | The whole country celebrates {club}'s European triumph *(+body)* |
| `trophy.fans.league` | general | game/fans.ts:170 celebrateTrophy | User club wins league/cup/Europe: press, captain, fans and board items | The city goes wild – thousands of fans celebrate the title *(+body)* |
| `trophy.press.cup` | general | game/fans.ts:168 celebrateTrophy | User club wins league/cup/Europe: press, captain, fans and board items | The paper: {manager} delivers silverware to {club} *(+body)* |
| `trophy.press.europe` | general | game/fans.ts:168 celebrateTrophy | User club wins league/cup/Europe: press, captain, fans and board items | Europe salutes {manager} *(+body)* |
| `trophy.press.league` | general | game/fans.ts:168 celebrateTrophy | User club wins league/cup/Europe: press, captain, fans and board items | The paper: {manager} – the architect of {club}'s title *(+body)* |
| `war.headline` | general | game/transfers.ts:1433 warHeadline | Bidding war headline | 📰 Transfer war: {a} and {b} battle for {player} *(+body)* |
| `war.result` | general | game/transfers.ts:1443 warReveal | Bidding war result | 📰 {a} win the transfer war for {player} *(+body)* |
| `war.staffHeadline` | general | game/staff.ts:68 hireStaff | User offers staff a job (bidding war if several clubs) | 📰 {a} and {b} battle for {name} *(+body)* |
| `war.staffLost` | general | game/staff.ts:138 resolveStaffBids | Daily: staff picks among offers | 💔 {name} chose {a} *(+body)* |
| `war.staffResult` | general | game/staff.ts:139 resolveStaffBids | Daily: staff picks among offers | 📰 {a} win the race for {name} *(+body)* |
| `war.staffStarted` | general | game/staff.ts:64 hireStaff | User offers staff a job (bidding war if several clubs) | ⚔️ Bidding war for {name}! *(+body)* |
| `war.staffWon` | general | game/staff.ts:138 resolveStaffBids | Daily: staff picks among offers | 🏆 {name} chose you! *(+body)* |
| `week.summary` | general | game/sim.ts:697 weeklySummary | Weekly: week in review | 📋 Week in review: {results} *(+body)* |
| `will.cliqueUnrest.nation` | general | game/will.ts:93 monthlyWill | Monthly: contract demand, leak, wants away, clique unrest | Dressing-room unrest: {player} and the {n} other players from {nation} *(+body)* |
| `will.cliqueUnrest.veterans` | general | game/will.ts:93 monthlyWill | Monthly: contract demand, leak, wants away, clique unrest | Unrest among the veterans: {player} and {n} others are unhappy *(+body)* |
| `will.cliqueUnrest.youngsters` | general | game/will.ts:93 monthlyWill | Monthly: contract demand, leak, wants away, clique unrest | Unrest among the youngsters: {player} and {n} others are unhappy *(+body)* |
| `will.leak` | general | game/will.ts:68 monthlyWill | Monthly: contract demand, leak, wants away, clique unrest | Sources: {player} unhappy with his contract at {club} *(+body)* |
| `will.unsettled` | general | game/transfers.ts:1088 aiPursuits | AI club returns with a new bid; player unsettled | {player} has been unsettled by the interest from {club} *(+body)* |
| `draft.news.replaced` | injury | game/draft.ts:511 replacePlayer | Draft mode: injured player replaced | {club}: {inn} replaces the injured {out} |
| `news.injury` | injury | game/sim.ts:295 userMatchResult | After every user match: result + injuries | {player} is injured: {injury} ({days} days) |
| `news.recovered` | injury | game/sim.ts:344 newDay | Daily: injury recovered; quarterly training advice | {player} has recovered from injury |
| `board.sacked` | job | game/board.ts:175 sackUser | User sacked (mid-season by boardMonthly or after season by boardSeasonEnd) | You have been sacked by {club} *(+body)* |
| `board.sackedSeason` | job | game/board.ts:175 sackUser | User sacked (mid-season by boardMonthly or after season by boardSeasonEnd) | You have been sacked by {club} after a disappointing season |
| `job.applied` | job | game/board.ts:509 applyForJob | User applies for a vacant job | You have applied for the manager's job at {club} – they will get back to you within a few days |
| `job.filled` | job | game/board.ts:523 processJobTalks | Daily: pending applications answered (filled / rejected / invited) | {club} have appointed another manager |
| `job.invite` | job | game/board.ts:537 processJobTalks | Daily: pending applications answered (filled / rejected / invited) | {club} want you as their manager – see their offer *(+body)* |
| `job.resigned` | job | game/board.ts:195 resignJob | User resigns (action 'resign') | You have resigned as manager of {club} *(+body)* |
| `job.resignedMid` | job | game/board.ts:195 resignJob | User resigns (action 'resign') | You have resigned as manager of {club} mid-season *(+body)* |
| `job.withdrawn` | job | game/board.ts:560 negotiateJob | User negotiates job terms; club withdraws offer | {club} have withdrawn the job offer |
| `mgr.poached` | job | game/careers.ts:39 pickManager | AI club poaches a manager from another club | {to} appoint {manager} from {from} *(+body)* |
| `news.applyRejected` | job | game/board.ts:531 processJobTalks | Daily: pending applications answered (filled / rejected / invited) | {club} have rejected your application |
| `news.jobOffer` | job | game/board.ts:454 fillVacancies | Vacant club offers job to user / appoints AI manager | {club} offer you the manager job |
| `news.managerHired` | job | game/board.ts:473 fillVacancies | Vacant club offers job to user / appoints AI manager | {club} have appointed {manager} as manager |
| `news.managerSacked` | job | game/board.ts:367 aiSackings<br>game/board.ts:379 aiSackings<br>game/board.ts:400 summerManagerChanges | Monthly Sep-Apr: AI club sacks its manager (relevant clubs only) | {club} have sacked {manager} |
| `news.newJob` | job | game/board.ts:589 acceptJob | User accepts a job | You are the new manager of {club} |
| `friendly.arranged` | match | game/friendlies.ts:62 arrangeFriendly | User arranges a friendly | 🤝 Friendly arranged against {opp} on {date} |
| `friendly.result.draw` | match | game/friendlies.ts:99 friendliesDaily | Friendly played: result | 🤝 Friendly: {score} against {opp} *(+body)* |
| `friendly.result.loss` | match | game/friendlies.ts:99 friendliesDaily | Friendly played: result | 🤝 Friendly: {score} defeat against {opp} *(+body)* |
| `friendly.result.win` | match | game/friendlies.ts:99 friendliesDaily | Friendly played: result | 🤝 Friendly: {score} win against {opp} *(+body)* |
| `match.drew` | match | game/sim.ts:291 userMatchResult | After every user match: result + injuries | Drew {score} v {opp} ({comp}) |
| `match.lost` | match | game/sim.ts:291 userMatchResult | After every user match: result + injuries | Lost {score} v {opp} ({comp}) |
| `match.won` | match | game/sim.ts:291 userMatchResult | After every user match: result + injuries | Won {score} v {opp} ({comp}) |
| `news.scoutDone` | scout | game/scouting.ts:121 scoutDaily | Daily: scout completes a player report (direct g.news.unshift) | {scout} has completed his report on {player} |
| `news.scoutReturned` | scout | game/scouting.ts:170 scoutReturns | Scout returns from an assignment (direct g.news.unshift) | {scout} is back from {target} *(+body)* |
| `news.scoutTalent` | scout | game/scouting.ts:187 scoutKnowledge | Scout finds a big talent (direct g.news.unshift) | {scout} has found a big talent: {player} |
| `trial.signedElsewhere` | scout | game/trials.ts:47 trialsDaily | Daily: trial ends (verdict) or player signs elsewhere | {player} signed for {club} during his trial |
| `trial.started` | scout | game/trials.ts:24 inviteTrial | User invites player on trial | 🧪 {player} has started a {days}-day trial |
| `trial.verdict.good` | scout | game/trials.ts:59 trialsDaily | Daily: trial ends (verdict) or player signs elsewhere | 🧪 Trial over: {player} could be part of the squad *(+body)* |
| `trial.verdict.notGood` | scout | game/trials.ts:59 trialsDaily | Daily: trial ends (verdict) or player signs elsewhere | 🧪 Trial over: {player} is not good enough *(+body)* |
| `trial.verdict.prospect` | scout | game/trials.ts:59 trialsDaily | Daily: trial ends (verdict) or player signs elsewhere | 🧪 Trial over: {player} is not ready yet, but has potential *(+body)* |
| `trial.verdict.star` | scout | game/trials.ts:59 trialsDaily | Daily: trial ends (verdict) or player signs elsewhere | 🧪 Trial over: {player} is better than most of the squad – sign him! *(+body)* |
| `auction.won` | transfer | game/transfers.ts:1483 resolveAuctions | Daily: user won bidding round | You won the bidding round for {player} *(+body)* |
| `clause.releaseDeclined` | transfer | game/transfers.ts:1383 aiReleaseClauses | AI club pays (or wanted to pay) a release clause | {club} wanted to pay {player}'s release clause *(+body)* |
| `clause.releaseTriggered` | transfer | game/transfers.ts:1388 aiReleaseClauses | AI club pays (or wanted to pay) a release clause | {club} have paid the release clause for {player} *(+body)* |
| `enquiry.listed` | transfer | game/transfers.ts:328 enquire | User enquires about a player's price | {club} on {player}: He is for sale, and the price is {fee} |
| `enquiry.nfs` | transfer | game/transfers.ts:328 enquire | User enquires about a player's price | {club} on {player}: He is not for sale – only an exceptional offer of at least {fee} would make us listen. |
| `enquiry.price` | transfer | game/transfers.ts:328 enquire | User enquires about a player's price | {club} on {player}: We will consider offers around {fee} |
| `recb.news.buy` | transfer | game/records.ts:97 recordsAfterMove | User club record sale/purchase | Club record: {player} signed for {fee} – the club's record signing |
| `recb.news.sale` | transfer | game/records.ts:88 recordsAfterMove | User club record sale/purchase | Club record: {player} sold for {fee} – the club's record sale |
| `rumour.interest` | transfer | game/media.ts:49 weeklyRumours | Weekly: rumour that a club is watching a player | Rumour: {club} are watching {player} *(+body)* |
| `signing.gone` | transfer | game/transfers.ts:514 resolveSignings | Daily: player chooses between competing offers | {player} is no longer available |
| `signing.lost` | transfer | game/transfers.ts:514 resolveSignings | Daily: player chooses between competing offers | {player} chose {club} instead of you |
| `signing.pending` | transfer | game/transfers.ts:445 negotiate | User negotiates personal terms with a target | {player} is considering your offer and will answer tomorrow |
| `signing.won` | transfer | game/transfers.ts:508 resolveSignings | Daily: player chooses between competing offers | {player} chose you out of {n} offers! |
| `transfer.aiFinalOffer` | transfer | game/transfers.ts:397 respondToOffer | User/other human responds to an incoming offer; AI buyer reacts | {club}: {fee} for {player} is our final offer |
| `transfer.aiNoSellOn` | transfer | game/transfers.ts:381 respondToOffer | User/other human responds to an incoming offer; AI buyer reacts | {club} will pay {fee} for {player}, but no sell-on *(+body)* |
| `transfer.aiRaised` | transfer | game/transfers.ts:397 respondToOffer | User/other human responds to an incoming offer; AI buyer reacts | {club} raise their offer for {player} to {fee} |
| `transfer.aiWithdrew` | transfer | game/transfers.ts:389 respondToOffer | User/other human responds to an incoming offer; AI buyer reacts | {club} have withdrawn their offer for {player} |
| `transfer.bidAccepted` | transfer | game/transfers.ts:365 respondToOffer<br>game/transfers.ts:813 aiAnswerBid | User/other human responds to an incoming offer; AI buyer reacts | {club} have accepted your {fee} offer for {player} *(+body)* |
| `transfer.bidCountered` | transfer | game/transfers.ts:360 respondToOffer<br>game/transfers.ts:817 aiAnswerBid | User/other human responds to an incoming offer; AI buyer reacts | {club} want {fee} for {player} |
| `transfer.biddingWar` | transfer | game/transfers.ts:808 aiAnswerBid | AI club answers user's bid/loan request | Bidding war for {player}: {club} have offered {fee} *(+body)* |
| `transfer.bidRejected` | transfer | game/transfers.ts:352 respondToOffer<br>game/transfers.ts:821 aiAnswerBid | User/other human responds to an incoming offer; AI buyer reacts | {club} have rejected your offer for {player} |
| `transfer.digest` | transfer | game/transfers.ts:1401 weeklyTransferDigest | Weekly: other clubs' deals | Transfer round-up: {n} deals this week *(+body)* |
| `transfer.digestOne` | transfer | game/transfers.ts:1401 weeklyTransferDigest | Weekly: other clubs' deals | Transfer round-up: {player} joins {to} *(+body)* |
| `transfer.incomingBid` | transfer | game/transfers.ts:307 makeBid<br>game/transfers.ts:1038 aiClubTurn<br>game/transfers.ts:1082 aiPursuits<br>game/transfers.ts:1353 aiBidsForListed | Another human bids for user's player | {club} offer {fee} for {player} *(+body)* |
| `transfer.incomingLoan` | transfer | game/transfers.ts:1353 aiBidsForListed | Daily: AI bid/loan bid for a listed / not-needed user player | {club} want to take {player} on loan *(+body)* |
| `transfer.loanAccepted` | transfer | game/transfers.ts:787 aiAnswerBid | AI club answers user's bid/loan request | {club} will loan you {player} |
| `transfer.loanOptionBid` | transfer | game/transfers.ts:1123 aiLoanOptions | Weekly: AI club wants loan-with-option for user player | {club} want to loan {player} with an option to buy for {fee} *(+body)* |
| `transfer.loanRejected` | transfer | game/transfers.ts:791 aiAnswerBid | AI club answers user's bid/loan request | {club} will not loan out {player} |
| `transfer.lostBiddingWar` | transfer | game/transfers.ts:765 processOffers | Daily: user lost a bidding war | {player} joins {club} for {fee} – you lost the bidding war |
| `transfer.notForSale` | transfer | game/transfers.ts:821 aiAnswerBid | AI club answers user's bid/loan request | {club}: {player} is not for sale! |
| `transfer.optionExercised` | transfer | game/transfers.ts:1149 exerciseLoanOption | Loan option exercised | {club} trigger the option: {player} joins permanently for {fee} |
| `transfer.playerRefusedMove` | transfer | game/transfers.ts:404 respondToOffer | User/other human responds to an incoming offer; AI buyer reacts | {player} does not want to join {club} |
| `transfer.preContract` | transfer | game/transfers.ts:485 completePreContract | Pre-contract signed | {player} has signed a pre-contract with {club} for the summer |
| `transfer.pursuitReturn` | transfer | game/transfers.ts:1082 aiPursuits | AI club returns with a new bid; player unsettled | {club} return with an improved {fee} bid for {player} *(+body)* |
| `transfer.refuseAbroad` | transfer | game/transfers.ts:430 negotiate | User negotiates personal terms with a target | {player}'s agent turns down {club}: he must go to a bigger league |
| `transfer.refuseHappy` | transfer | game/transfers.ts:430 negotiate | User negotiates personal terms with a target | {player} is happy where he is and turns down {club} |
| `transfer.refuseRep` | transfer | game/transfers.ts:430 negotiate | User negotiates personal terms with a target | {player} isn't interested in joining a club of {club}'s stature |
| `transfer.releaseMet` | transfer | game/transfers.ts:799 aiAnswerBid | AI club answers user's bid/loan request | Release clause met: {player} may talk to you *(+body)* |
| `transfer.swapPart` | transfer | game/transfers.ts:573 completeTransfer | Any transfer involving the user's club completes (others go to the weekly digest) | {player} moves from {from} to {to} as part of the swap deal |
| `transfer.talksCollapsed` | transfer | game/transfers.ts:471 negotiate | User negotiates personal terms with a target | Talks with {player} have collapsed |
| `transfer.talksOver` | transfer | game/transfers.ts:1633 rebid | AI seller breaks off talks after user's rebid | {club} break off talks about {player} |
| `war.revealLost` | transfer | game/transfers.ts:1442 warReveal | Bidding war result | 💔 You lost the bidding war for {player} *(+body)* |
| `war.revealLostWage` | transfer | game/transfers.ts:1442 warReveal | Bidding war result | 💔 {player} chose {a} *(+body)* |
| `war.revealWon` | transfer | game/transfers.ts:1442 warReveal | Bidding war result | 🏆 You won the bidding war for {player}! *(+body)* |
| `war.revealWonWage` | transfer | game/transfers.ts:1442 warReveal | Bidding war result | 🏆 {player} chose you! *(+body)* |
| `war.started` | transfer | game/transfers.ts:1424 startAuction | Bidding war starts for user target | ⚔️ Bidding war for {player}! *(+body)* |
| `war.startedWage` | transfer | game/transfers.ts:456 negotiate | User negotiates personal terms with a target | ⚔️ Bidding war for {player}! *(+body)* |
| `will.targetRequest` | transfer | game/will.ts:339 targetReaction | User rejects bid: player asks to be listed / is upset | {player} has asked to be transfer listed *(+body)* |
| `will.targetUpset` | transfer | game/will.ts:339 targetReaction | User rejects bid: player asks to be listed / is upset | {player} is disappointed {club} said no *(+body)* |
| `window.bosman` | transfer | game/transfers.ts:1604 windowNews | Daily: window opens/closes/countdown/Bosman date | 📝 Bosman pre-contracts are now possible *(+body)* |
| `window.closed` | transfer | game/transfers.ts:1596 windowNews | Daily: window opens/closes/countdown/Bosman date | 🔴 The transfer window is closed – the next window opens {date} *(+body)* |
| `window.closing` | transfer | game/transfers.ts:1602 windowNews | Daily: window opens/closes/countdown/Bosman date | ⏳ The transfer window closes in {n} days ({date}) *(+body)* |
| `window.closingTomorrow` | transfer | game/transfers.ts:1602 windowNews | Daily: window opens/closes/countdown/Bosman date | ⏰ The transfer window closes tomorrow ({date})! *(+body)* |
| `window.deadlineDay` | transfer | game/transfers.ts:1601 windowNews | Daily: window opens/closes/countdown/Bosman date | 🚨 DEADLINE DAY – the transfer window closes today! *(+body)* |
| `window.opened` | transfer | game/newgame.ts:328 createGame<br>game/transfers.ts:1594 windowNews | New game: welcome, window open, sponsor offers | 🟢 THE TRANSFER WINDOW IS OPEN – you can buy, sell and loan players until {date} *(+body)* |
| `news.reservesPromoted` | youth | game/season.ts:520 seasonRollover | July 1: reserves promoted, sponsor offers, challenge result, new season | The squad was too small – {n} players promoted from the reserves *(+body)* |
| `news.youth` | youth | game/season.ts:313 youthIntake | Youth intake day: each new player, summary, press release | New youth player: {player} ({pos}) *(+body)* |
| `youth.intakeDay` | youth | game/season.ts:319 youthIntake | Youth intake day: each new player, summary, press release | Youth intake day: {n} new academy players *(+body)* |
| `youth.press.average` | youth | game/season.ts:323 youthIntake | Youth intake day: each new player, summary, press release | Press release: {club} present this year's youth players *(+body)* |
| `youth.press.golden` | youth | game/season.ts:323 youthIntake | Youth intake day: each new player, summary, press release | Press release: {club} present "the golden generation" – led by {player} ({pos}) *(+body)* |
| `youth.press.good` | youth | game/season.ts:323 youthIntake | Youth intake day: each new player, summary, press release | Press release: {club} welcome a promising intake *(+body)* |
| `youth.press.poor` | youth | game/season.ts:323 youthIntake | Youth intake day: each new player, summary, press release | Press release: a thin intake at {club} *(+body)* |
| `youth.preview.average` | youth | game/season.ts:281 youthPreview | Before intake: youth coach's preview of the intake | Youth report: an average intake *(+body)* |
| `youth.preview.golden` | youth | game/season.ts:281 youthPreview | Before intake: youth coach's preview of the intake | Youth report: a golden generation is coming! *(+body)* |
| `youth.preview.good` | youth | game/season.ts:281 youthPreview | Before intake: youth coach's preview of the intake | Youth report: a promising intake *(+body)* |
| `youth.preview.poor` | youth | game/season.ts:281 youthPreview | Before intake: youth coach's preview of the intake | Youth report: a weak intake *(+body)* |

### Other inbox-like / message systems (not `addNews`)

- **Direct `g.news.unshift`** in `src/game/scouting.ts` (`scoutDaily`, `scoutReturns`, `scoutKnowledge`): `news.scoutDone`, `news.scoutReturned`, `news.scoutTalent`. These bypass `addNews`, so they ignore `options.mutedNews` and are never copied to other humans (`opts.all`). Should be switched to `addNews`.
- **Press conferences** – `src/game/press.ts` (`invitePress` creates `g.press` + invitation news, `applyPress` applies answers, `expirePress`), UI `src/ui/screens/Press.tsx`; question texts `press.q.*`, answers in `pressAnswers.ts`. Result posted as `press.report`/`press.reportPlain`.
- **Player talks / discipline** – `personality.ts:talkToPlayer`, `personality.ts:interact` (praise, criticise, encourage, warning, fine, fineHeavy, drop, demand, chat, future) return `talk.r.*` replies shown in a dialog only.
- **Team talks** – `personality.ts:teamTalk` (`team.r.*`), match talks `teamtalk.ts:giveTalk`/`evaluateTalk` (`g.matchTalk`).
- **Player complaints & renewals** – `will.ts:playerComplains` opens `p.complaint` (inbox item `will.complain.*`), answered via `will.ts:answerComplaint` (`complaint.r.*` dialog); `will.ts:answerRenewal`, `will.ts:answerBlocked`.
- **Board room** – `board.ts:boardAsk`, `requestBudget`, `requestProject`, `camp.ts:planCamp`; answers come back as news (`ba.*`, `board.request*`, `board.project.*`, `camp.*`) plus UI state (`Board.tsx`).
- **Offers & job offers** – `g.offers` (Transfers screen, offers tab, news links `kind:'offer'`), `g.jobOffers` (Jobs screen).
- **Weekly transfer digest** – `NewsItem.deals` filled from `g.transferDigest` (`transfers.ts:weeklyTransferDigest`).
- **Season story** – `story.ts:storyAdd` collects events (fan mood swings etc.) for the season card (`story.ready`).
- **Multiplayer** – chat (`chat.ts`, `RoomChat.tsx`, news `chat.news`), jabs and bets (`rivalry.ts`, delivered via `tell` → `addNews` per human).

## 2. Original headlines by group

### Fra bestyrelsen og om klubbens økonomi – Board & club finances (39)

| Original headline | Class | Our key(s) / trigger / missing system |
|---|---|---|
| [beløb] Cash Injection | NEEDS-MECHANIC | Missing: Owner/benefactor investment (cash injections into the club) |
| [klub] become a PLC | NEEDS-MECHANIC | Missing: Club ownership model (PLC flotation / shares) |
| [klub] board consider [person]'s position | COVERED | `board.warning` — board.ts:boardMonthly |
| [klub] board give [person] vote of confidence | COVERED | `ba.yes.confidenceVote` — board.ts:boardAsk — _Only on request; unsolicited vote is EASY in board.ts:boardMonthly_ |
| [klub] manager given ultimatum by board | NEEDS-MECHANIC | Missing: Board ultimatum (concrete target over next N matches) (related: `board.warning`) |
| [klub] match pleases board | COVERED | `board.c.goodWin`, `board.c.upsetWin`, `board.c.thrashing` — board.ts:boardMatchComment |
| [spiller] attempts to tear up his contract | NEEDS-MECHANIC | Missing: Contract disputes / tribunal (dispute.cpp) |
| [spiller] free to leave [klub] | NEEDS-MECHANIC | Missing: Contract disputes / tribunal outcome |
| [spiller] told to remain at [klub] | NEEDS-MECHANIC | Missing: Contract disputes / tribunal outcome |
| [spiller] withdraws complaint about [klub] | EASY | will.ts:answerComplaint — params: player, club (P2) |
| Board back [person] | EASY | press.ts:applyPress (tone backPlayer, fx.brd>0) — params: player, manager (P2) |
| Board block [person] departure | COVERED | `transfer.releaseBlocked` — transfers.ts:releasePlayer |
| Board concern over [person] | EASY | press.ts:applyPress (tone pressurePlayer / fx.brd<0) — params: player, manager (P3) |
| Board concerned by [person] revelations | EASY | press.ts:applyPress (fx.brd<0) — params: player, manager (P3) |
| Board confident of [person]'s loyalty | EASY | press.ts:applyPress (topic jobLinked, loyal answer) — params: manager, club (P2) |
| Board defend [person] | EASY | press.ts:applyPress (tone backPlayer) — params: player (P3) |
| Board delighted after [klub] game | COVERED | `board.c.upsetWin`, `board.c.thrashing` — board.ts:boardMatchComment |
| Board delighted by [turnering] success | COVERED | `trophy.board.cup`, `trophy.board.europe`, `trophy.board.league` — fans.ts:celebrateTrophy |
| Board delighted with [person] backing | EASY | press.ts:applyPress (tone backPlayer, fx.brd>0) — params: player (P3) |
| Board fine with [person] backing | EASY | press.ts:applyPress (tone backPlayer) — params: player (P3) |
| Board fury at [klub] performance | COVERED | `board.c.humiliation`, `board.c.cupShock` — board.ts:boardMatchComment |
| Board fury at [manager] silence | EASY | press.ts:applyPress (tone deflect, fx.brd<0) — params: manager (P2) |
| Board happy at [person] verdict | EASY | press.ts:applyPress (fx.brd>0) — params: player (P3) |
| Board happy with [manager] silence | EASY | press.ts:applyPress (tone deflect, fx.brd>=0) — params: manager (P3) |
| Board leap to [person]'s defence | EASY | press.ts:applyPress (tone backPlayer) — params: player (P3) |
| Board pleased by [turnering] success | COVERED | `trophy.board.cup`, `trophy.board.europe`, `trophy.board.league` — fans.ts:celebrateTrophy |
| Board pleased by media recognition of [person] | EASY | awards.ts:monthlyAwards (award.monthManagerMe) / awards.ts:seasonGala (managerOfYearMe) — params: manager, comp (P2) |
| Board pleased by your handling of [person] | EASY | personality.ts:interact (fine/warning, misbehaved=true) — params: player (P2) |
| Board reaction to [klub] game | COVERED | `board.c.goodWin`, `board.c.badLoss`, `board.c.dropped` — board.ts:boardMatchComment |
| Board shocked by release of [person] | EASY | transfers.ts:releasePlayer (player among top-5 value / high CA) — params: player, fee (P2) |
| Board slam [person] | EASY | press.ts:applyPress (tone pressurePlayer, fx.brd<0) — params: player (P3) |
| Board surprised at [person] departure | EASY | transfers.ts:completeTransfer (user sells a top-3 player) — params: player, club, fee (P2) |
| Board surprised by [manager]'s silence | EASY | press.ts:applyPress (tone deflect) — params: manager (P3) |
| Board surprised by comments about [person] | EASY | press.ts:applyPress (tone pressurePlayer) — params: player (P3) |
| Board unhappy after [klub] defeat | COVERED | `board.c.badLoss` — board.ts:boardMatchComment |
| Board unhappy with [person] | COVERED | `board.warning` — board.ts:boardMonthly |
| Board upset by release of [person] | EASY | transfers.ts:releasePlayer (compensation > threshold) — params: player, fee (P3) |
| New Board take control of [klub] | NEEDS-MECHANIC | Missing: Club takeovers / ownership changes |
| The [klub] board of directors | SKIP | Sender/source label, not a headline |

### Om dig som manager og managerjob – You as manager & manager jobs (68)

| Original headline | Class | Our key(s) / trigger / missing system |
|---|---|---|
| [antal] days | SKIP | Text fragment (duration) |
| [formand] backs manager | COVERED | `ba.yes.confidenceVote`, `board.meeting` — board.ts:boardAsk / fans.ts:boardMeeting — _We have no named chairman – board speaks_ |
| [formand] disappointed by [manager] reaction | EASY | press.ts:applyPress (fx.brd<0) — params: manager (P3) |
| [formand] fury at [manager] silence | EASY | press.ts:applyPress (tone deflect, topic board) — params: manager (P3) |
| [formand] fury at [manager] verdict | EASY | press.ts:applyPress (fx.brd<0) — params: manager (P3) |
| [formand] mystified by [manager] reaction | EASY | press.ts:applyPress (tone fiery, fx.brd<0) — params: manager (P3) |
| [formand] slams manager | COVERED | `board.warning`, `board.c.humiliation` — board.ts:boardMonthly / board.ts:boardMatchComment |
| [formand] stands by manager over [person] | EASY | press.ts:applyPress (tone backPlayer, fx.brd>=0) — params: manager, player (P3) |
| [formand] surprised by [manager]'s silence | EASY | press.ts:applyPress (tone deflect) — params: manager (P3) |
| [formand] surprised by [manager]'s verdict | EASY | press.ts:applyPress — params: manager (P3) |
| [formand] unhappy with [manager] | COVERED | `board.warning` — board.ts:boardMonthly |
| [klub] acknowledge your job application | COVERED | `job.applied` — board.ts:applyForJob |
| [klub] appoint [person] as manager | COVERED | `news.managerHired`, `mgr.poached` — board.ts:fillVacancies / careers.ts:pickManager |
| [klub] dismiss your job application | COVERED | `news.applyRejected`, `job.filled` — board.ts:processJobTalks |
| [klub] fans respond to speculation | EASY | board.ts:processJobTalks (job.invite for user while employed) — params: club, other (P2) |
| [klub] manager [person] retires | NEEDS-MECHANIC | Missing: AI manager ageing / retirement |
| [klub] manager [person] sacked | COVERED | `news.managerSacked` — board.ts:aiSackings / board.ts:summerManagerChanges |
| [klub] manager [person] told to stop the rot | EASY | board.ts:aiSackings (AI club in danger zone but not sacked) — params: club, manager (P2) |
| [klub] offer [person] the position of manager | COVERED | `mgr.poached` — careers.ts:pickManager |
| [klub] offer you the position of manager | COVERED | `news.jobOffer`, `job.invite` — board.ts:fillVacancies / board.ts:processJobTalks |
| [klub] squad numbers to be decided | EASY | season.ts:seasonRollover (players without Player.number after ensureNumbers / new signings) — params: club (P3) |
| [klub] to register players for later stages | NEEDS-MECHANIC | Missing: Competition squad registration |
| [klub] to register players for next phase | NEEDS-MECHANIC | Missing: Competition squad registration |
| [klub] to register players for qualifying phase | NEEDS-MECHANIC | Missing: Competition squad registration |
| [klub]'s [person] is sacked as manager | COVERED | `news.managerSacked` — board.ts:aiSackings |
| [klub]'s [person] is sacked as player-manager | NEEDS-MECHANIC | Missing: Player-manager role |
| [klub]'s [person] resigns as manager | NEEDS-MECHANIC | Missing: AI manager resignations (AI only leave via sack/poach) |
| [klub]'s [person] resigns as player-manager | NEEDS-MECHANIC | Missing: Player-manager role |
| [land] FA consider [person]'s position | NEEDS-MECHANIC | Missing: National team management |
| [land] FA give [person] vote of confidence | NEEDS-MECHANIC | Missing: National team management |
| [land] FA performance assessment | NEEDS-MECHANIC | Missing: National team management |
| [manager] attacks referee conspiracy | EASY | press.ts:applyPress (topic referee, tone fiery) — params: manager, opp (P2) |
| [manager] clutches at straws | EASY | press.ts:applyPress (post-match after loss, tone deflect) — params: manager, opp (P3) |
| [manager] criticises poor refereeing standards | EASY | press.ts:applyPress (topic referee) — params: manager, opp (P2) |
| [manager] defends [spiller] | COVERED | `press.report` — press.ts:applyPress — _Headline built from answers_ |
| [manager] grants [spiller] transfer request | EASY | transfers.ts:toggleListed (p.wantsAway or after will.targetRequest) — params: player (P1) |
| [manager] puts [spiller] on transfer list | EASY | transfers.ts:toggleListed — params: player, fee (P1) |
| [person] is an invaluable member of the team | EASY | personality.ts:interact (praise) — params: player, manager (P3) |
| [person] linked with [klub] job | EASY | board.ts:fillVacancies / board.ts:openVacancy (user on candidate list) — params: manager, club (P2) |
| [person] resigned as manager | COVERED | `job.resigned` — board.ts:resignJob |
| [person] resigns as manager of [klub] | COVERED | `job.resigned`, `job.resignedMid` — board.ts:resignJob |
| [person] shouldn't be a member of our squad | EASY | personality.ts:interact (criticise) — params: player, manager (P3) |
| [person] will achieve great things at the club | EASY | personality.ts:interact (future) — params: player, manager (P3) |
| [person] would be a useful addition to the squad | NEEDS-MECHANIC | Missing: Manager media comments about other clubs' players |
| [rival manager name] questions purchase of [spiller] | EASY | transfers.ts:completeTransfer (fee >= 1.5x value, user buyer) — params: manager, player, fee (P2) |
| [spiller] acknowledges his manager's contribution | COVERED | `will.praise.form`, `trophy.captain.league` — will.ts:playerPraises / fans.ts:celebrateTrophy |
| [spiller] blast at manager | COVERED | `will.complain.press`, `pers.incident.media` — will.ts:playerComplains / personality.ts:monthlyPersonality |
| [spiller] interview | SKIP | Generic container headline |
| [spiller] reacts to manager | COVERED | `will.complain.press`, `will.praise.press` — will.ts:playerComplains / will.ts:playerPraises |
| [spiller] thanks his manager | COVERED | `will.praise.form`, `will.praise.contract` — will.ts:playerPraises |
| [spiller] thanks manager | COVERED | `will.praise.press` — will.ts:playerPraises |
| [spiller] unconvinced by his manager | COVERED | `reject.r.future.0`, `reject.r.key.0` — will.ts:blockedMoveReaction — _Also talk.r.futureDoubt (dialog)_ |
| FA fine [klub] over [manager]'s outburst | NEEDS-MECHANIC | Missing: FA discipline of managers (charges for comments) |
| FA reduce [person]'s ban | NEEDS-MECHANIC | Missing: Ban appeals |
| FA revoke [person]'s ban | NEEDS-MECHANIC | Missing: Ban appeals |
| FA rumoured to be losing patience with [manager] | NEEDS-MECHANIC | Missing: National team management |
| Fans surprised by manager's comments on [person] | EASY | press.ts:applyPress (tone pressurePlayer, fx.fan<0) — params: player (P3) |
| Fans surprised by manager's defence of [person] | EASY | press.ts:applyPress (tone backPlayer, fx.fan<0) — params: player (P3) |
| Hired [person] as manager | SKIP | Staff history line (staff_records.cpp) |
| Hired [spiller] as [job] | COVERED | `staff.hired`, `recb.news.legendStaff` — staff.ts:doHire / records.ts:retireIntoStaff |
| Hired as [klub] manager | SKIP | Manager history line |
| Manager optimism delights [formand] | EASY | press.ts:applyPress (tone confident, topic board) — params: manager (P3) |
| Resigned as manager of [klub] | SKIP | Manager history line |
| Sacked [person] | EASY | staff.ts:fireStaff — params: name, role (P2) |
| Sacked [person] as manager | SKIP | Staff history line |
| Sacked as manager of [klub] | COVERED | `board.sacked`, `board.sackedSeason` — board.ts:sackUser |
| Signed by [klub] as [job] | SKIP | Staff history line |
| The [land] Football Association | SKIP | Sender/source label |

### Fra medierne og fansene – Media & fans (120)

| Original headline | Class | Our key(s) / trigger / missing system |
|---|---|---|
| [formand] concerned by your handling of the media | EASY | press.ts:applyPress (g.manager.media falls below threshold) — params: manager (P2) |
| [formand] defends [person] | EASY | press.ts:applyPress (tone backPlayer) — params: player (P3) |
| [formand] leaps to [person]'s defence | EASY | press.ts:applyPress — params: player (P3) |
| [formand] pleased by your handling of the media | EASY | press.ts:applyPress (g.manager.media rises above threshold) — params: manager (P2) |
| [formand] surprised by attack on [person] | EASY | press.ts:applyPress (tone pressurePlayer) — params: player (P3) |
| [klub] beaten | COVERED | `match.lost` — sim.ts:userMatchResult |
| [klub] climbing to safety | EASY | media.ts:monthlyColumn (user club leaves drop zone) — params: club, pos, comp (P2) |
| [klub] expected to challenge | EASY | season.ts:seasonRollover (after setBoardExpectation; new preview item in media.ts) — params: club, comp (P1) |
| [klub] expected to last pace | EASY | season.ts:seasonRollover (preview, expectation mid) — params: club, comp (P2) |
| [klub] financial mess | EASY | finance.ts:monthlyFigures (balance < 0 two months) — params: club, balance (P1) |
| [klub] fly the flag | EASY | competitions.ts:resolveTie (continental tie won by user club) — params: club, comp, opp (P2) |
| [klub] halt slide | EASY | sim.ts:userMatchResult (win after 3+ games without a win) — params: club, opp, score (P2) |
| [klub] in the spotlight | EASY | media.ts:monthlyColumn — params: club, comp (P3) |
| [klub] make their mark on [verdensdel] | EASY | competitions.ts:checkGroupsDone / competitions.ts:checkLeaguePhaseDone (user club qualifies) — params: club, comp (P2) |
| [klub] march on | EASY | competitions.ts:resolveTie (user club wins cup tie) — params: club, comp, stage, opp (P1) |
| [klub] slump continues | COVERED | `board.c.lossStreak` — board.ts:boardMatchComment — _Media version EASY in sim.ts:userMatchResult_ |
| [klub] struggling | COVERED | `board.c.noWins`, `column.month` — board.ts:boardMatchComment / media.ts:monthlyColumn |
| [klub] supporters fury | COVERED | `fans.leave.sold3`, `fans.leave.released3` — fans.ts:fansOnDeparture |
| [klub] tipped as outsiders | EASY | season.ts:seasonRollover (preview, expectation top3/tophalf for weaker club) — params: club, comp (P2) |
| [klub] tipped for glory | EASY | season.ts:seasonRollover (preview, expectation title) — params: club, comp (P1) |
| [klub] tipped for promotion | EASY | season.ts:seasonRollover (preview, expectation promotion) — params: club, comp (P1) |
| [klub] title challenge in spotlight | EASY | media.ts:monthlyColumn (user club within 3 pts of top) — params: club, comp, gap (P2) |
| [land] local newspaper | SKIP | Media outlet name (we use rumour.interest {outlet}) |
| [land] local radio station | SKIP | Media outlet name |
| [land] magazine | SKIP | Media outlet name |
| [land] national newspaper | SKIP | Media outlet name |
| [land] radio station | SKIP | Media outlet name |
| [land] sports paper | SKIP | Media outlet name |
| [land] website | SKIP | Media outlet name |
| [person] banned for gesture | NEEDS-MECHANIC | Missing: Post-match FA misconduct charges |
| [person] caught on camera | NEEDS-MECHANIC | Missing: Retrospective video bans |
| [person] desperate to play | COVERED | `will.complain.time` — will.ts:playerComplains |
| [person] lashes out | COVERED | `pers.incident.media`, `will.complain.press` — personality.ts:monthlyPersonality / will.ts:playerComplains |
| [person] should be put on a leash | NEEDS-MECHANIC | Missing: AI managers commenting on your players in the media |
| [person] tips [klub] for glory | EASY | season.ts:seasonRollover (preview, pundit quote) — params: club, comp (P3) |
| [person] verdict gets boardroom support | EASY | press.ts:applyPress (fx.brd>0) — params: player (P3) |
| [person] verdict gets fans' backing | EASY | press.ts:applyPress (fx.fan>0) — params: player (P3) |
| [person] wants first team football | COVERED | `will.complain.time` — will.ts:playerComplains |
| [person] writes off [klub] chances | EASY | season.ts:seasonRollover (preview, expectation survive) — params: club, comp (P3) |
| [sold player name] sale causes unrest | COVERED | `fans.leave.sold2`, `fans.leave.sold3` — fans.ts:fansOnDeparture |
| [spiller] a 'future international' | EASY | training.ts:monthlyDevelopment (age<=21, CA jump, pa high) — params: player, club (P2) |
| [spiller] accepts your decision | COVERED | `talk.r.dropDeserved`, `complaint.r.renewal.listen` — personality.ts:interact / will.ts:answerComplaint — _Dialog reply, not inbox_ |
| [spiller] accused of complacency | EASY | media.ts:monthlyColumn (star with avg form < 6.3) — params: player, club (P3) |
| [spiller] acknowledges support | COVERED | `will.praise.press` — will.ts:playerPraises |
| [spiller] admits his mistake | COVERED | `talk.r.critAccepts`, `talk.r.warnAccepted` — personality.ts:interact — _Dialog reply_ |
| [spiller] agent request | COVERED | `will.contractDemand` — will.ts:monthlyWill |
| [spiller] agent responds to criticism | EASY | personality.ts:interact (criticise, critUnfair/critExplodes) — params: player, agent (P3) |
| [spiller] apologises | COVERED | `talk.r.critAccepts`, `talk.r.warnAccepted` — personality.ts:interact — _Dialog reply_ |
| [spiller] attitude praised | COVERED | `talk.r.praiseDeserved` — personality.ts:interact — _Dialog reply_ |
| [spiller] blasts lack of service | EASY | will.ts:monthlyWill (striker, no goals in 5+ starts) — params: player (P3) |
| [spiller] concerned by transfer rumour | EASY | media.ts:weeklyRumours (rumour about user's own player) — params: player, club (P2) |
| [spiller] demands support | COVERED | `will.complain.press` — will.ts:playerComplains |
| [spiller] disheartened | COVERED | `will.complain.morale` — will.ts:playerComplains |
| [spiller] eyes [klub] move | COVERED | `will.unsettled`, `will.leak` — transfers.ts:aiPursuits / will.ts:monthlyWill |
| [spiller] fuels transfer talk | COVERED | `will.unsettled` — transfers.ts:aiPursuits |
| [spiller] impresses at [klub] | EASY | media.ts:monthlyColumn (new signing, avg rating >= 7.2) — params: player, club (P2) |
| [spiller] indicates he will fight for his place in the team | COVERED | `talk.r.critFiredUp`, `talk.r.dropDeserved` — personality.ts:interact — _Dialog reply_ |
| [spiller] indiscipline costs [klub] dear | EASY | sim.ts:applyMatchResult (line.red && team lost) — params: player, club, opp (P2) |
| [spiller] lights up [comp name eg world cup] | NEEDS-MECHANIC | Missing: International tournaments |
| [spiller] on the rise | EASY | training.ts:monthlyDevelopment (CA +5 in a month, age<=23) — params: player (P2) |
| [spiller] out of favour | COVERED | `will.complain.time` — will.ts:playerComplains |
| [spiller] praised | COVERED | `press.report`, `talk.r.praiseDeserved` — press.ts:applyPress / personality.ts:interact |
| [spiller] questions boss | COVERED | `will.complain.time`, `talk.r.critUnfair` — will.ts:playerComplains / personality.ts:interact |
| [spiller] quoted in media | COVERED | `pers.incident.media` — personality.ts:monthlyPersonality |
| [spiller] rated highly | EASY | media.ts:monthlyColumn (player with best avg rating in league) — params: player, club, comp (P3) |
| [spiller] receives criticism | COVERED | `press.report` — press.ts:applyPress |
| [spiller] requests backing | EASY | will.ts:monthlyWill (poor form + low morale, star) — params: player (P3) |
| [spiller] responds to criticism | COVERED | `talk.r.critAccepts`, `talk.r.critUnfair` — personality.ts:interact — _Dialog reply_ |
| [spiller] rumour | COVERED | `rumour.interest` — media.ts:weeklyRumours |
| [spiller] rumours | COVERED | `rumour.interest` — media.ts:weeklyRumours |
| [spiller] shows promise | COVERED | `trial.verdict.prospect`, `news.scoutTalent` — trials.ts:trialsDaily / scouting.ts:scoutKnowledge |
| [spiller] stars in [comp name eg world cup] | NEEDS-MECHANIC | Missing: International tournaments |
| [spiller] tipped to shine on world stage | NEEDS-MECHANIC | Missing: International tournaments |
| [spiller] touted | COVERED | `rumour.interest` — media.ts:weeklyRumours |
| [spiller] transfer speculation | COVERED | `rumour.interest` — media.ts:weeklyRumours |
| [spiller] under fire | EASY | media.ts:monthlyColumn (regular with avg rating < 6.0) — params: player, club (P2) |
| [spiller] unsettled | COVERED | `will.unsettled` — transfers.ts:aiPursuits |
| [spiller] world class talent | EASY | training.ts:monthlyDevelopment (age<=21, CA>=150) — params: player (P3) |
| [spiller] worried by sale of [sold player name] | EASY | transfers.ts:completeTransfer (seller=user, same clique/nation as sold player, see will.ts:cliques) — params: player, sold (P3) |
| [spiller]'s blast at club | COVERED | `pers.incident.media`, `will.complain.blocked` — personality.ts:monthlyPersonality / will.ts:playerComplains |
| [spokesman short name] celebrates signing of [person] | COVERED | `fans.signing2`, `fans.signing3` — fans.ts:fansOnSigning |
| Agent demands support for [spiller] | EASY | personality.ts:interact (criticise of player with agent, agents.ts:agentOf) — params: player, agent (P3) |
| Boring [klub] | EASY | media.ts:monthlyColumn (fewest goals in league) — params: club, comp (P3) |
| Criticism of [spiller] | COVERED | `press.report` — press.ts:applyPress |
| Discontent at [klub] | COVERED | `will.cliqueUnrest.nation`, `will.cliqueUnrest.veterans`, `will.cliqueUnrest.youngsters` — will.ts:monthlyWill |
| Fans celebrate signing of [person] | COVERED | `fans.signing2`, `fans.signing3` — fans.ts:fansOnSigning |
| Fans celebrate winning the [turnering] | COVERED | `trophy.fans.league`, `trophy.fans.cup`, `trophy.fans.europe` — fans.ts:celebrateTrophy |
| Fans defend [person] | EASY | press.ts:applyPress (tone pressurePlayer on popular player) — params: player (P3) |
| Fans delighted by [person] criticism | EASY | press.ts:applyPress (fx.fan>0 on pressurePlayer) — params: player (P3) |
| Fans disgusted by [person]'s behaviour | EASY | personality.ts:monthlyPersonality (pers.incident.*) — params: player (P2) |
| Fans leap to [person]'s defence | EASY | press.ts:applyPress — params: player (P3) |
| Fans pay tribute to [person] | COVERED | `recb.news.legend`, `fans.leave.free3` — records.ts:recordsAfterMatch / fans.ts:fansOnDeparture |
| Fans pleased by [person] praise | EASY | press.ts:applyPress (tone backPlayer, fx.fan>0) — params: player (P3) |
| Fans pleased by firm handling of [spiller] | EASY | personality.ts:interact (fine/warning deserved) — params: player (P2) |
| Fans pleased by your praise of [spiller] | EASY | personality.ts:interact (praise, praiseDeserved) — params: player (P3) |
| Fans pleased your defence of [person] | EASY | press.ts:applyPress (tone backPlayer) — params: player (P3) |
| Fans slam [person] | EASY | fans.ts:fansAfterMatch (heavy home defeat) / fans.ts:bumpFans large negative — params: player, club (P2) |
| Fans unhappy with [person] | EASY | fans.ts:fansMonthly (fanMood drop >= 10, already detected for story) — params: manager, mood (P1) |
| Fans worried by your praise of [spiller] | EASY | personality.ts:interact (praise, praiseUndeserved) — params: player (P3) |
| Fans' concern over [person] | EASY | fans.ts:fansMonthly (fanMood < 35) — params: manager, mood (P2) |
| Fans' happy with [person] | EASY | fans.ts:fansMonthly (fanMood rise >= 10) — params: manager, mood (P1) |
| Financial trouble at [klub] | EASY | finance.ts:monthlyFigures (AI/other club balance deeply negative) — params: club, balance (P3) |
| Media attack [spiller] | EASY | media.ts:monthlyColumn (regular with avg rating < 6.0) — params: player (P3) |
| Media disappointed in [spiller] this season | EASY | season.ts:seasonAwards (big signing/star with poor season avg) — params: player (P3) |
| Media question [spiller]'s ability | EASY | media.ts:monthlyColumn — params: player (P3) |
| Media question [spiller]'s attitude | EASY | personality.ts:monthlyPersonality (incident) — params: player (P3) |
| Media question [spiller]'s contribution | EASY | media.ts:monthlyColumn — params: player (P3) |
| Media question purchase of [spiller] | EASY | transfers.ts:completeTransfer (fee >= 1.5x value) — params: player, fee, club (P2) |
| Players celebrate signing of [person] | EASY | fans.ts:fansOnSigning (hype 3) — params: player, club (P3) |
| Press discuss [klub] title credentials | EASY | media.ts:monthlyColumn (user top-2 after Jan) — params: club, comp (P2) |
| Press tip [klub] as contenders | EASY | season.ts:seasonRollover (preview) — params: club, comp (P2) |
| Press tip [klub] for glory | EASY | season.ts:seasonRollover (preview) — params: club, comp (P2) |
| Press write off [klub] chances | EASY | season.ts:seasonRollover (preview, expectation survive) — params: club, comp (P2) |
| Pressure gets to [spiller] | EASY | sim.ts:applyMatchResult (rating < 5.5 in big match/final, low composure) — params: player, opp (P3) |
| Pundit tips [klub] for glory | EASY | season.ts:seasonRollover (preview) — params: club, comp (P3) |
| Speculation over [spiller] future | COVERED | `contract.expiring`, `will.leak` — transfers.ts:contractReminders / will.ts:monthlyWill |
| Speculation over [spiller]'s commitment | COVERED | `will.leak`, `pers.wantsAway` — will.ts:monthlyWill / personality.ts:monthlyPersonality |
| Talented [spiller] given boost | EASY | sim.ts:applyMatchResult (first senior appearance, age<=19) — params: player, club (P2) |
| Unrest reported at [klub] | COVERED | `will.cliqueUnrest.nation`, `will.cliqueUnrest.veterans`, `will.cliqueUnrest.youngsters` — will.ts:monthlyWill |
| Youngster [spiller] praised | EASY | sim.ts:applyMatchResult (age<=20, rating>=8) — params: player, club, opp (P2) |

### Om spillere: skader og kondition – Players: injuries & fitness (6)

| Original headline | Class | Our key(s) / trigger / missing system |
|---|---|---|
| [spiller] fitness worry | EASY | sim.ts:newDay (injured regular, injury.days<=3 before next fixture) — params: player, days (P2) |
| [spiller] lacking fitness | EASY | sim.ts:newDay (regular with condition < 80 the day before a match) — params: player, condition (P2) |
| [spiller] misses training | COVERED | `pers.incident.late` — personality.ts:monthlyPersonality |
| [spiller] resumes full training | COVERED | `news.recovered` — sim.ts:newDay |
| [spiller] resumes light training | EASY | sim.ts:newDay (injury.days === 7 for injuries >= 21 days) — params: player, days (P2) |
| [spiller] training report | COVERED | `news.trainingAdvice` — sim.ts:newDay |

### Om spillere: kontrakter og løn – Players: contracts & wages (47)

| Original headline | Class | Our key(s) / trigger / missing system |
|---|---|---|
| [grund] and [grund] | SKIP | Text fragment (list of reasons) |
| [grund], [grund] and [grund] | SKIP | Text fragment |
| [klub] tie up [person] contract | COVERED | `contract.renewed` — transfers.ts:renewContract — _AI side EASY in transfers.ts:aiRenewals_ |
| [person] accepts [klub] offer | COVERED | `signing.won`, `transfer.done` — transfers.ts:resolveSignings / transfers.ts:completeTransfer |
| [person] accepts contract offer | COVERED | `contract.renewed`, `signing.won` — transfers.ts:renewContract / transfers.ts:resolveSignings |
| [person] accepts trial offer | COVERED | `trial.started` — trials.ts:inviteTrial |
| [person] leaves [klub] | COVERED | `contract.left`, `transfer.released` — season.ts:contractsAndLoans / transfers.ts:releasePlayer |
| [person] leaves club | COVERED | `contract.left` — season.ts:contractsAndLoans |
| [person] rejects [klub] offer | COVERED | `transfer.refuseRep`, `transfer.refuseAbroad`, `transfer.refuseHappy` — transfers.ts:negotiate |
| [person] rejects contract offer | COVERED | `transfer.talksCollapsed`, `will.complain.renewal` — transfers.ts:negotiate / will.ts:playerComplains |
| [person] rejects new [no of years eg 4] year [klub] deal | COVERED | `will.complain.renewal` — will.ts:playerComplains — _renewContract refusal only shown in dialog_ |
| [person] rejects trial offer | NEEDS-MECHANIC | Missing: Players able to refuse a trial |
| [person] signs new [klub] deal | COVERED | `contract.renewed` — transfers.ts:renewContract |
| [person] signs new [no of years eg 4] year [klub] deal | COVERED | `contract.renewed` — transfers.ts:renewContract |
| [person] snubs new deal | COVERED | `will.complain.renewal` — will.ts:playerComplains |
| [person] turns down latest [klub] deal | COVERED | `will.complain.renewal`, `transfer.talksCollapsed` — will.ts:playerComplains / transfers.ts:negotiate |
| [person]'s contract expires | COVERED | `contract.expiring`, `contract.left` — transfers.ts:contractReminders / season.ts:contractsAndLoans |
| [person]'s loan finishes | EASY | season.ts:contractsAndLoans (p.loan.until < today, setClub back) — params: player, from, to (P1) |
| [person]'s trial finishes | COVERED | `trial.verdict.star`, `trial.verdict.good`, `trial.verdict.prospect`, `trial.verdict.notGood` — trials.ts:trialsDaily |
| [spiller] contract offer cancelled | COVERED | `signing.gone` — transfers.ts:resolveSignings |
| [spiller] happy to stay | COVERED | `reject.r.key.2`, `reject.r.future.2`, `reject.r.contract.2` — will.ts:blockedMoveReaction |
| [spiller] loan terminated | NEEDS-MECHANIC | Missing: Early loan termination / recall |
| [spiller] on the move | COVERED | `transfer.done`, `transfer.digest` — transfers.ts:completeTransfer / transfers.ts:weeklyTransferDigest |
| [spiller] put up for sale | EASY | transfers.ts:toggleListed (user) / AI listing in transfers.ts:aiClubTurn — params: player, club, fee (P1) |
| [spiller] recalled from loan | NEEDS-MECHANIC | Missing: Loan recall |
| [spiller] requests move | COVERED | `will.targetRequest`, `pers.wantsAway` — will.ts:targetReaction / personality.ts:monthlyPersonality |
| [spiller] seeks assurances | COVERED | `will.complain.renewal`, `will.complain.time` — will.ts:playerComplains |
| [spiller] set to leave [klub] | COVERED | `contract.leavingBosman` — transfers.ts:contractReminders / transfers.ts:aiBosman |
| [spiller] to join [klub] | COVERED | `transfer.preContract`, `contract.leavingBosman` — transfers.ts:completePreContract / transfers.ts:aiBosman |
| [spiller] to leave club | COVERED | `contract.expiring` — transfers.ts:contractReminders |
| [spiller] trial cancelled | COVERED | `trial.signedElsewhere` — trials.ts:trialsDaily |
| [spiller] wants new contract | COVERED | `will.contractDemand` — will.ts:monthlyWill |
| [spiller]'s contract | SKIP | Sub-heading fragment |
| Apr [år] | SKIP | Month label |
| Aug [år] | SKIP | Month label |
| Contract rebel [person] turns down latest offer | COVERED | `will.demandWantsAway`, `will.complain.renewal` — will.ts:monthlyWill / will.ts:playerComplains |
| Dec [år] | SKIP | Month label |
| Feb [år] | SKIP | Month label |
| Jan [år] | SKIP | Month label |
| Jul [år] | SKIP | Month label |
| Jun [år] | SKIP | Month label |
| Mar [år] | SKIP | Month label |
| May [år] | SKIP | Month label |
| Nov [år] | SKIP | Month label |
| Oct [år] | SKIP | Month label |
| Sep [år] | SKIP | Month label |
| Unhappy [spiller] transfer listed | EASY | transfers.ts:toggleListed (p.wantsAway) / will.ts:answerComplaint (choice list) — params: player, fee (P1) |

### Om spillere: transfers, lån og bud fra andre klubber – Players: transfers, loans & bids (51)

| Original headline | Class | Our key(s) / trigger / missing system |
|---|---|---|
| [antal] players | SKIP | Text fragment |
| [klub] get [spiller] | COVERED | `transfer.done` — transfers.ts:completeTransfer |
| [klub] get cut of [spiller] transfer fee | COVERED | `clause.sellOnPaid` — clauses.ts:settleSellOn |
| [klub] give up on [spiller] | COVERED | `transfer.aiWithdrew`, `transfer.talksOver` — transfers.ts:respondToOffer / transfers.ts:rebid |
| [klub] loan offer for [spiller] | COVERED | `transfer.incomingLoan`, `transfer.loanOptionBid` — transfers.ts:aiBidsForListed / transfers.ts:aiLoanOptions |
| [klub] negotiation over [spiller] | COVERED | `transfer.bidCountered`, `transfer.aiRaised` — transfers.ts:aiAnswerBid / transfers.ts:respondToOffer |
| [klub] seal [spiller] deal | COVERED | `transfer.done` — transfers.ts:completeTransfer |
| [klub] set to buy [spiller] | COVERED | `transfer.bidAccepted` — transfers.ts:aiAnswerBid |
| [klub] set to sign [spiller] | COVERED | `transfer.bidAccepted`, `signing.pending` — transfers.ts:aiAnswerBid / transfers.ts:negotiate |
| [klub] sign [spiller] | COVERED | `transfer.done`, `transfer.digest` — transfers.ts:completeTransfer / transfers.ts:weeklyTransferDigest |
| [klub] to sign [spiller] | COVERED | `transfer.preContract` — transfers.ts:completePreContract |
| [klub] transfer bid for [spiller] | COVERED | `transfer.incomingBid` — transfers.ts:makeBid / transfers.ts:aiClubTurn / transfers.ts:aiBidsForListed |
| [spiller] accepts [klub] offer | COVERED | `signing.won` — transfers.ts:resolveSignings |
| [spiller] accepts loan contract | COVERED | `transfer.loanDone` — transfers.ts:completeTransfer |
| [spiller] agrees to contract discussion | COVERED | `transfer.bidAccepted`, `transfer.releaseMet` — transfers.ts:aiAnswerBid |
| [spiller] deal falls through | COVERED | `transfer.talksCollapsed` — transfers.ts:negotiate |
| [spiller] deal vetoed | NEEDS-MECHANIC | Missing: Board veto of transfers (we block in UI only) |
| [spiller] fails to get work permit | NEEDS-MECHANIC | Missing: Work permits |
| [spiller] given free transfer | COVERED | `transfer.released` — transfers.ts:releasePlayer |
| [spiller] going nowhere | COVERED | `transfer.notForSale`, `enquiry.nfs` — transfers.ts:aiAnswerBid / transfers.ts:enquire |
| [spiller] granted work permit | NEEDS-MECHANIC | Missing: Work permits |
| [spiller] loan bid rejected | COVERED | `transfer.loanRejected` — transfers.ts:aiAnswerBid |
| [spiller] loan bid withdrawn | COVERED | `transfer.aiWithdrew` — transfers.ts:respondToOffer |
| [spiller] loan cancelled | NEEDS-MECHANIC | Missing: Loan cancellation / termination |
| [spiller] loan offer accepted | COVERED | `transfer.loanAccepted` — transfers.ts:aiAnswerBid |
| [spiller] loan offer negotiation | COVERED | `transfer.bidCountered` — transfers.ts:aiAnswerBid |
| [spiller] loan to [klub] cancelled | NEEDS-MECHANIC | Missing: Loan cancellation / termination |
| [spiller] move to [klub] cancelled | COVERED | `signing.gone` — transfers.ts:resolveSignings |
| [spiller] moves to [klub] | COVERED | `transfer.done`, `transfer.bosmanDone` — transfers.ts:completeTransfer / season.ts:contractsAndLoans |
| [spiller] rejects [klub] | COVERED | `transfer.refuseHappy`, `transfer.refuseRep` — transfers.ts:negotiate |
| [spiller] rejects loan offer from [klub] | COVERED | `transfer.playerRefusedMove` — transfers.ts:respondToOffer |
| [spiller] rejects move to [klub] | COVERED | `transfer.playerRefusedMove` — transfers.ts:respondToOffer |
| [spiller] release clause activated | COVERED | `clause.releaseTriggered`, `transfer.releaseMet` — transfers.ts:aiReleaseClauses / transfers.ts:aiAnswerBid |
| [spiller] removed from transfer deal | NEEDS-MECHANIC | Missing: Part-exchange player withdrawal |
| [spiller] set for [klub] | COVERED | `transfer.bidAccepted` — transfers.ts:aiAnswerBid |
| [spiller] set for [klub] loan deal | COVERED | `transfer.loanAccepted` — transfers.ts:aiAnswerBid |
| [spiller] set for [klub] role | COVERED | `recb.news.legendStaff`, `staff.hired` — records.ts:retireIntoStaff / staff.ts:doHire |
| [spiller] snubs [klub] | COVERED | `transfer.refuseRep` — transfers.ts:negotiate |
| [spiller] transfer bid rejected | COVERED | `transfer.bidRejected` — transfers.ts:aiAnswerBid / transfers.ts:respondToOffer |
| [spiller] transfer bid withdrawn | COVERED | `transfer.aiWithdrew` — transfers.ts:respondToOffer |
| [spiller] transfer cancelled | COVERED | `transfer.talksOver` — transfers.ts:rebid |
| [spiller] transfer delayed | NEEDS-MECHANIC | Missing: Deferred transfer completion (medicals / paperwork) |
| [spiller] transfer delayed due to work permit | NEEDS-MECHANIC | Missing: Work permits |
| [spiller] transfer offer accepted | COVERED | `transfer.bidAccepted` — transfers.ts:aiAnswerBid |
| [spiller] transfer to [klub] falls through | COVERED | `signing.lost`, `transfer.talksCollapsed` — transfers.ts:resolveSignings / transfers.ts:negotiate |
| [spiller] transfer to [klub] put on hold | NEEDS-MECHANIC | Missing: Deferred transfer completion |
| [spiller]'s work permit expires | NEEDS-MECHANIC | Missing: Work permits |
| [spiller]'s work permit renewed | NEEDS-MECHANIC | Missing: Work permits |
| A new offer was made by [klub] | COVERED | `transfer.pursuitReturn`, `transfer.aiRaised` — transfers.ts:aiPursuits / transfers.ts:respondToOffer |
| Negotiate [klub] bid for [spiller] | COVERED | `transfer.incomingBid` — transfers.ts:aiClubTurn |
| Offer contract to [spiller] | COVERED | `transfer.bidAccepted`, `transfer.releaseMet` — transfers.ts:aiAnswerBid |

### Om spillere: disciplin, karantæner og bøder – Players: discipline, bans & fines (22)

| Original headline | Class | Our key(s) / trigger / missing system |
|---|---|---|
| 1 match [scope] ban | EASY | sim.ts:applyMatchResult (p.banned set from 0 to 1) — params: player, n, reason (P1) |
| 1 match [scope] ban ( starts [dato] ) | EASY | sim.ts:applyMatchResult — params: player, n, date (P2) |
| [antal] match [scope] ban | EASY | sim.ts:applyMatchResult (red card: banned = rng.int(1,3)) — params: player, n, reason (P1) |
| [antal] match [scope] ban ( starts [dato] ) | EASY | sim.ts:applyMatchResult — params: player, n, date (P2) |
| [antal] points | SKIP | Text fragment (disciplinary points) |
| [antal] red cards | SKIP | Text fragment (ban reason) |
| [antal] successive yellow cards | SKIP | Text fragment (ban reason) |
| [antal] yellow cards | SKIP | Text fragment (ban reason) |
| [fine period] Week Fine | SKIP | Text fragment (fine size) |
| [person] accepts his fine | COVERED | `talk.r.fineAccepted` — personality.ts:interact — _Dialog reply, not inbox_ |
| [person] accepts his warning | COVERED | `talk.r.warnAccepted` — personality.ts:interact — _Dialog reply_ |
| [person] feels fine was unfair | COVERED | `talk.r.fineUnjust`, `talk.r.fineWantsAway` — personality.ts:interact — _Dialog reply_ |
| [person] feels warning was harsh | COVERED | `talk.r.warnUnjust` — personality.ts:interact — _Dialog reply_ |
| [spiller] banned for [antal] matches | EASY | sim.ts:applyMatchResult (line.red) — params: player, n (P1) |
| [spiller] banned for [length] | NEEDS-MECHANIC | Missing: Time-based bans |
| [spiller] banned for one match | EASY | sim.ts:applyMatchResult (yellowCount reaches 5) — params: player (P1) |
| [spiller] pleased by [spiller]'s reaction | EASY | personality.ts:interact (fine accepted; captain/leader comments) — params: player, captain (P3) |
| [spiller] thinks [spiller] can't handle the pressure | EASY | personality.ts:interact (fine, fineWantsAway; teammate comment) — params: player, mate (P3) |
| [time length] [scope] ban | NEEDS-MECHANIC | Missing: Time-based bans |
| [time length] [scope] ban ( starts [dato] ) | NEEDS-MECHANIC | Missing: Time-based bans |
| Players protest over [person]'s fine | EASY | personality.ts:interact (fine/fineHeavy with fineUnjust) — params: player (P2) |
| Players protest over [person]'s warning | EASY | personality.ts:interact (warning with warnUnjust) — params: player (P3) |

### Om spillere: udeblivelser og opførsel – Players: absences & behaviour (7)

| Original headline | Class | Our key(s) / trigger / missing system |
|---|---|---|
| [person] absent from training | COVERED | `pers.incident.late` — personality.ts:monthlyPersonality |
| [person] disciplined by club | COVERED | `talk.r.fineAccepted` — personality.ts:interact — _Dialog only; inbox item EASY in same function_ |
| [person] rumoured to have missed training | COVERED | `pers.incident.late` — personality.ts:monthlyPersonality |
| [spiller] fails to return from leave | NEEDS-MECHANIC | Missing: Player leave / AWOL |
| [spiller] goes AWOL | NEEDS-MECHANIC | Missing: Player AWOL |
| [spiller] in transfer row | COVERED | `will.targetUpset`, `will.complain.blocked` — will.ts:targetReaction / will.ts:playerComplains |
| [spiller] returns to [klub] | NEEDS-MECHANIC | Missing: Return after AWOL |

### Om spillere: landsholdet – Players: national team (7)

| Original headline | Class | Our key(s) / trigger / missing system |
|---|---|---|
| [spiller] and [spiller] | SKIP | Text fragment |
| [spiller] brought in to [land] squad | NEEDS-MECHANIC | Missing: National team squads / call-ups |
| [spiller] removed from [land] squad | NEEDS-MECHANIC | Missing: National team squads / call-ups |
| [spiller] selected for [land] match | NEEDS-MECHANIC | Missing: National team squads / call-ups |
| [spiller] selected in [land] 'B' squad | NEEDS-MECHANIC | Missing: National team squads / call-ups |
| [spiller] selected in [land] squad | NEEDS-MECHANIC | Missing: National team squads / call-ups |
| [spiller] selected in [land] Under 21 squad | NEEDS-MECHANIC | Missing: National team squads / call-ups |

### Om spillere: unge talenter og karrierestop – Players: youth & retirement (6)

| Original headline | Class | Our key(s) / trigger / missing system |
|---|---|---|
| [person] announces decision to retire | EASY | season.ts:retirements (pre-decide in spring via sim.ts:newDay monthly hook, store flag on Player) — params: player, age (P2) |
| [person] promoted from youth academy | COVERED | `news.youth`, `youth.intakeDay` — season.ts:youthIntake |
| [person] promoted to reserve squad | COVERED | `news.reservesPromoted` — season.ts:seasonRollover |
| [person] retires | COVERED | `news.retired` — season.ts:retirements |
| [person] retires due to injury | NEEDS-MECHANIC | Missing: Career-ending injuries |
| Shock retirement of [person] | EASY | season.ts:retirements (age <= 32) — params: player, age (P3) |

### Om spillere: priser og kåringer – Players: awards (12)

| Original headline | Class | Our key(s) / trigger / missing system |
|---|---|---|
| [pris] award decided | COVERED | `award.gala` — awards.ts:seasonGala |
| [pris] decided | COVERED | `award.gala`, `award.playerOfYear` — awards.ts:seasonGala / season.ts:seasonAwards |
| [pris] shortlist decided | EASY | awards.ts:seasonGala (pre-announce shortlist in May via sim.ts:newDay) — params: award, players (P3) |
| [spiller] named as [pris] | COVERED | `award.playerOfYear`, `award.ballonDor` — season.ts:seasonAwards / awards.ts:seasonGala |
| [spiller] scoops big prize | COVERED | `award.ballonDor` — awards.ts:seasonGala |
| [spiller] scoops prize | COVERED | `award.playerOfYear` — season.ts:seasonAwards |
| [spiller] takes award | COVERED | `award.playerOfYear`, `award.topScorer` — season.ts:seasonAwards |
| [spiller] takes top award | COVERED | `award.ballonDor` — awards.ts:seasonGala |
| [spiller] wins [dato] award | COVERED | `award.monthPlayer` — awards.ts:monthlyAwards |
| [spiller] wins [month name] award | COVERED | `award.monthPlayer` — awards.ts:monthlyAwards |
| Award for [spiller] | COVERED | `award.playerOfYear`, `award.monthPlayer` — season.ts:seasonAwards / awards.ts:monthlyAwards |
| Major award for [spiller] | COVERED | `award.ballonDor` — awards.ts:seasonGala |

### Fra trænerstaben og scouts – Coaching staff & scouts (8)

| Original headline | Class | Our key(s) / trigger / missing system |
|---|---|---|
| [klub] drop into playoffs | EASY | sim.ts:weeklySummary (user club moves into play-off/relegation-playoff zone) — params: club, pos, comp (P3) |
| [klub] reach playoffs | EASY | competitions.ts:setupPlayoff (user club among seeds) — params: club, comp (P1) |
| [klub] Training | COVERED | `news.trainingAdvice` — sim.ts:newDay |
| [scout name1] and [scout name2] | SKIP | Text fragment |
| [spiller] impresses scout | COVERED | `news.scoutTalent`, `news.scoutDone` — scouting.ts:scoutKnowledge / scouting.ts:scoutDaily |
| Scout #[antal] | SKIP | Label |
| Scouts impressed by [spiller] | COVERED | `news.scoutTalent` — scouting.ts:scoutKnowledge |
| Scouts watch [spiller] | COVERED | `rumour.interest` — media.ts:weeklyRumours |

### Fra forbundet: regler og transfervinduer – FA: rules & windows (6)

| Original headline | Class | Our key(s) / trigger / missing system |
|---|---|---|
| 1 match [scope] ban  ([grund]) | EASY | sim.ts:applyMatchResult — params: player, n, reason (P1) |
| [antal] match [scope] ban  ([grund]) | EASY | sim.ts:applyMatchResult — params: player, n, reason (P1) |
| [time length] [scope] ban  ([grund]) | NEEDS-MECHANIC | Missing: Time-based bans |
| One yellow card away from [scope] 1 match ban | EASY | sim.ts:applyMatchResult (p.yellowCount === 4) — params: player (P1) |
| One yellow card away from [scope] [antal] day ban | NEEDS-MECHANIC | Missing: Time-based bans |
| One yellow card away from [scope] [antal] match ban | EASY | sim.ts:applyMatchResult (p.yellowCount === 4) — params: player, n (P2) |

### Landshold og landsholdsturneringer – National teams & tournaments (28)

| Original headline | Class | Our key(s) / trigger / missing system |
|---|---|---|
| [antal] countries qualify for [år] | NEEDS-MECHANIC | Missing: International tournaments |
| [klub] and [klub] | SKIP | Text fragment |
| [klub] finish fourth place in [turnering] | NEEDS-MECHANIC | Missing: International tournaments (3rd/4th place games) |
| [klub] finish runners-up in [turnering] | EASY | competitions.ts:advance (final decided, comp.meta.runnerUp === user club) — params: club, comp, winner (P1) |
| [klub] finish third place in [turnering] | NEEDS-MECHANIC | Missing: International tournaments (3rd place games) |
| [klub] knocked out of [turnering] | EASY | competitions.ts:resolveTie (tie.winner !== user club) — params: club, comp, opp, stage (P1) |
| [klub] out of [turnering] | EASY | competitions.ts:resolveTie / competitions.ts:checkGroupsDone (user club eliminated) — params: club, comp (P1) |
| [klub] players selected in [land] 'B' squad | NEEDS-MECHANIC | Missing: National team squads |
| [klub] players selected in [land] match | NEEDS-MECHANIC | Missing: National team squads |
| [klub] players selected in [land] squad | NEEDS-MECHANIC | Missing: National team squads |
| [klub] players selected in [land] Under 21 squad | NEEDS-MECHANIC | Missing: National team squads |
| [klub] qualify for [turnering] | EASY | newgame.ts:setupSeasonComps (europeanQualifiers result includes user club) — params: club, comp (P1) |
| [klub] qualify for quarter finals | EASY | competitions.ts:advance (stage QF created, user club in pool) — params: club, comp (P2) |
| [klub] qualify for semi-finals | EASY | competitions.ts:advance — params: club, comp (P2) |
| [klub] through to next round in [turnering] | EASY | competitions.ts:resolveTie (tie.winner === user club) — params: club, comp, opp, stage (P1) |
| [klub] win [turnering] | COVERED | `news.cupWin`, `news.playoffWin` — competitions.ts:advance |
| [klub], [klub] and [klub] | SKIP | Text fragment |
| [land] and [land] qualify for finals | NEEDS-MECHANIC | Missing: International tournaments |
| [land] head for [host country eg australia] [år] | NEEDS-MECHANIC | Missing: International tournaments |
| [land] lead qualifiers for [år] | NEEDS-MECHANIC | Missing: International tournaments |
| [land] qualify for [år] finals | NEEDS-MECHANIC | Missing: International tournaments |
| [land] ready for [år] | NEEDS-MECHANIC | Missing: International tournaments |
| [land] squad chosen for [turnering] | NEEDS-MECHANIC | Missing: National team squads |
| [land] squad to be decided | NEEDS-MECHANIC | Missing: National team squads |
| [turnering] [år] qualifiers | NEEDS-MECHANIC | Missing: International tournaments |
| Add Player To [squad name] Squad | SKIP | UI action label |
| Move Player To [squad name] Squad | SKIP | UI action label |
| Remove Player From [squad name] Squad | SKIP | UI action label |

### Klubturneringer i Europa og verden – Club competitions (Europe/world) (20)

| Original headline | Class | Our key(s) / trigger / missing system |
|---|---|---|
| [klub] compensated for loss of [spiller] | NEEDS-MECHANIC | Missing: Training/development compensation for young players |
| [klub] dismiss [spiller] transfer | COVERED | `transfer.notForSale`, `enquiry.nfs` — transfers.ts:aiAnswerBid / transfers.ts:enquire |
| [klub] finish third placed in [turnering] | EASY | competitions.ts:checkLeagueProgress (league finished, user club 3rd) — params: club, pos, comp (P2) |
| [klub] qualify for semi final | EASY | competitions.ts:advance — params: club, comp (P2) |
| [klub] through to quarter finals | EASY | competitions.ts:advance — params: club, comp (P2) |
| [klub] through to second round | EASY | competitions.ts:resolveTie — params: club, comp (P2) |
| [klub] through to semi finals | EASY | competitions.ts:advance — params: club, comp (P2) |
| [land] FA impose fine on [klub] | NEEDS-MECHANIC | Missing: FA club fines for misconduct (ffp.sanction is related) (related: `ffp.sanction`) |
| [person] and [person] settle differences | NEEDS-MECHANIC | Missing: Player feuds / relationships |
| [person] in training ground bust-up | COVERED | `pers.incident.fight` — personality.ts:monthlyPersonality |
| [person] speaks out on feud | NEEDS-MECHANIC | Missing: Player feuds / relationships |
| [person] unhappy with role | NEEDS-MECHANIC | Missing: Staff morale / role complaints |
| [person] unhappy with training | EASY | will.ts:playerComplains (new kind; training.ts:trainingAdvice mismatch) — params: player (P3) |
| [person] voices concern | COVERED | `will.complain.time`, `will.complain.morale` — will.ts:playerComplains |
| [person] voices his concern | COVERED | `will.complain.morale` — will.ts:playerComplains |
| [spiller] ecstatic at turn of fortune | EASY | sim.ts:applyMatchResult (first start after 6+ games unused) — params: player (P3) |
| [spiller] pleased to have his chance | EASY | sim.ts:applyMatchResult (first start for club / debut) — params: player (P3) |
| [spiller] thanks boss | COVERED | `will.praise.form` — will.ts:playerPraises |
| [spiller] watched | COVERED | `rumour.interest` — media.ts:weeklyRumours |
| Training report from [coach name] | COVERED | `news.trainingAdvice` — sim.ts:newDay |

### Ligaer, pokaler, lodtrækninger og kampprogram – Leagues, cups, draws & fixtures (38)

| Original headline | Class | Our key(s) / trigger / missing system |
|---|---|---|
| [klub] avoid relegation | EASY | season.ts:promotionRelegation (user club finished just above drop zone) — params: club, comp, pos (P1) |
| [klub] awarded [beløb] | EASY | finance.ts:addPrize (caller: competitions.ts:compPrize / finance.ts:seasonPrizeMoney) — params: club, fee, comp (P2) |
| [klub] defeat in [turnering] | COVERED | `match.lost` — sim.ts:userMatchResult |
| [klub] fail to qualify from [turnering] group | EASY | competitions.ts:checkGroupsDone / competitions.ts:checkLeaguePhaseDone — params: club, comp, pos (P1) |
| [klub] fail to win promotion | EASY | season.ts:promotionRelegation / competitions.ts:advance (playoff loser) — params: club, comp (P1) |
| [klub] given [beløb] | EASY | finance.ts:addPrize — params: club, fee (P3) |
| [klub] knocked out in 1st round qualifier | EASY | competitions.ts:resolveTie (qualifying stage) — params: club, comp, opp (P2) |
| [klub] knocked out in World Cup playoff | NEEDS-MECHANIC | Missing: International tournaments |
| [klub] knocked out of World Cup qualifying | NEEDS-MECHANIC | Missing: International tournaments |
| [klub] lose [turnering] final | EASY | competitions.ts:advance (comp.meta.runnerUp) — params: club, comp, winner (P1) |
| [klub] miss out on promotion | EASY | season.ts:promotionRelegation (finished just outside promotion places) — params: club, comp, pos (P2) |
| [klub] not promoted | EASY | season.ts:promotionRelegation — params: club, comp (P3) |
| [klub] qualify for 2nd round in qualifiers | EASY | competitions.ts:resolveTie — params: club, comp (P3) |
| [klub] qualify for Final | EASY | competitions.ts:advance (createFinal with user club) — params: club, comp, opp, date (P1) |
| [klub] qualify for Oceania playoff | SKIP | World Cup qualifying format (national teams only) |
| [klub] qualify for playoff | EASY | competitions.ts:setupPlayoff — params: club, comp (P1) |
| [klub] qualify for Second Promotion | SKIP | Country-specific league format |
| [klub] qualify for second round | EASY | competitions.ts:resolveTie — params: club, comp (P2) |
| [klub] qualify for semi finals | EASY | competitions.ts:advance — params: club, comp (P2) |
| [klub] qualify for Third Promotion | SKIP | Country-specific league format |
| [klub] qualify for third round | EASY | competitions.ts:resolveTie — params: club, comp (P3) |
| [klub] qualify for World Cup | NEEDS-MECHANIC | Missing: International tournaments |
| [klub] qualify from [turnering] group | EASY | competitions.ts:checkGroupsDone / competitions.ts:checkLeaguePhaseDone — params: club, comp, pos (P1) |
| [klub] relegated | COVERED | `news.relegated` — season.ts:promotionRelegation |
| [klub] relegated from [turnering] | COVERED | `news.relegated` — season.ts:promotionRelegation |
| [klub] slip nearer relegation | EASY | media.ts:monthlyColumn (user club in drop zone) — params: club, pos, comp (P2) |
| [klub] through to final | EASY | competitions.ts:advance (createFinal) — params: club, comp (P1) |
| [klub] through to first round | EASY | competitions.ts:resolveTie (qualifier won) — params: club, comp (P3) |
| [klub] through to group phase | EASY | competitions.ts:resolveTie (qualifier won into group stage) — params: club, comp (P2) |
| [klub] through to playoff phase | EASY | competitions.ts:checkLeaguePhaseDone — params: club, comp (P2) |
| [klub] through to semi final | EASY | competitions.ts:advance — params: club, comp (P2) |
| [klub] win first stage | SKIP | Country-specific league format (apertura/clausura) |
| [klub] win in [turnering] | COVERED | `match.won` — sim.ts:userMatchResult |
| [klub] win promotion | COVERED | `news.promoted` — season.ts:promotionRelegation |
| [klub] win second stage | SKIP | Country-specific league format |
| [start year]/[end year] European qualifiers decided | EASY | newgame.ts:setupSeasonComps (after europeanQualifiers) — params: season, cl, uefa (P2) |
| Debug Info: [file debug info] | SKIP | Debug text |
| Unkown event token "[token]" in match event config | SKIP | Debug text |

### Rekorder og historie – Records & history (38)

| Original headline | Class | Our key(s) / trigger / missing system |
|---|---|---|
| [antal] months | SKIP | Text fragment |
| [antal] weeks | SKIP | Text fragment |
| [beløb] p/x - [spiller] from [klub] - [dato] | SKIP | Record table line |
| [klub] [fans player of the year award name)] decided | EASY | season.ts:seasonAwards (per human club, best avg rating / most mom) — params: club, player (P2) |
| [klub] draw | COVERED | `match.drew` — sim.ts:userMatchResult |
| [klub] lose | COVERED | `match.lost` — sim.ts:userMatchResult |
| [klub] win | COVERED | `match.won` — sim.ts:userMatchResult |
| [person] resigned | SKIP | History line |
| [pris] for [month name] | COVERED | `award.monthPlayer`, `award.monthManager` — awards.ts:monthlyAwards |
| [turnering] champions | COVERED | `news.champions` — competitions.ts:checkLeagueProgress |
| [turnering] runners up | SKIP | History table line (EASY news via competitions.ts:advance runnerUp) |
| [turnering] third placed | SKIP | History table line |
| [turnering] winners | COVERED | `news.cupWin` — competitions.ts:advance |
| [år] [pris] runner up | SKIP | Award history line |
| [år] [pris] third placed | SKIP | Award history line |
| Bought [spiller] from [klub] (part exchange) | SKIP | Transfer history line (Player.moves) |
| Bought by [klub] for [money value] | SKIP | Transfer history line |
| Bought by [klub] for [money value] (part exchange) | SKIP | Transfer history line |
| Bought by [klub] in part exchange | SKIP | Transfer history line |
| Failed to qualify from [turnering] | SKIP | Club history line |
| Finished [placering] in [turnering] | SKIP | Club history line |
| First international cap against [land] aged [age] | NEEDS-MECHANIC | Missing: International matches |
| Hired [person] | SKIP | Staff history line |
| Knocked out in [turnering] | SKIP | Club history line |
| Loaned [spiller] from [klub] | SKIP | Transfer history line |
| Loaned from [klub] | SKIP | Transfer history line |
| Named in [år] [pris] | EASY | season.ts:seasonAwards (teamOfYear computed in season.ts, no news) — params: player, comp, season (P2) |
| New [klub] club record | COVERED | `recb.news.apps`, `recb.news.goals`, `recb.news.bigWin`, `recb.news.att`, `recb.news.sale`, `recb.news.buy` — records.ts:recordsAfterMatch / records.ts:recordsAfterMove |
| New [klub] record | COVERED | `recb.news.bigWin`, `recb.news.att` — records.ts:recordsAfterMatch |
| Promotion from [turnering] | SKIP | Club history line |
| Qualified for [turnering] | SKIP | Club history line |
| Released [spiller] on free transfer | SKIP | Transfer history line |
| Released [spiller] to [klub] in free transfer | SKIP | Transfer history line |
| Relegation from [turnering] | SKIP | Club history line |
| Signed [spiller] from [klub] in free transfer | SKIP | Transfer history line |
| Signed [spiller] in free transfer | SKIP | Transfer history line |
| Signed by [klub] on free transfer | SKIP | Transfer history line |
| Sold [spiller] to [klub] (part exchange) | SKIP | Transfer history line |

## 3. Our keys not in the original (169)

Keys no original headline maps to: **99 genuinely new** (CM Reborn features) and **70 sibling variants** of a key family that *is* mapped (finer splits of the same event).

### Genuinely new (99)

- **ach.*** – `ach.unlocked`
- **auction.*** – `auction.won`
- **ba.*** – `ba.no.confidenceVote`, `ba.no.lowerExp`, `ba.no.short`, `ba.no.trainingCamp`, `ba.no.youthDrive`
- **bet.*** – `bet.acceptedByThem`, `bet.declinedByThem`, `bet.lost`, `bet.proposed`, `bet.void`, `bet.won`
- **board.*** – `board.exp.mid`, `board.exp.playoffs`, `board.exp.promotion`, `board.exp.survive`, `board.exp.title`, `board.exp.top3`, `board.exp.tophalf`, `board.project.approved`, `board.project.done`, `board.project.noConfidence`, `board.project.noMoney`
- **budget.*** – `budget.january`
- **camp.*** – `camp.approved`, `camp.noConfidence`, `camp.noMoney`, `camp.departed`, `camp.report`
- **challenge.*** – `challenge.lost`, `challenge.won`
- **chat.*** – `chat.news`
- **draft.*** – `draft.news.final`, `draft.news.over`, `draft.news.season`, `draft.news.semis`, `draft.news.replaced`
- **friendly.*** – `friendly.arranged`, `friendly.result.draw`, `friendly.result.loss`, `friendly.result.win`
- **jab.*** – `jab.backfired`, `jab.draw`, `jab.news`, `jab.received`, `jab.right`, `jab.botBack.1`, `jab.botBack.2`, `jab.botBack.3`, `jab.sent`
- **mp.*** – `mp.autopilot`, `mp.joined`, `mp.removed`
- **onb.*** – `onb.briefing`
- **reform.*** – `reform.news.calm`, `reform.news.noLongerTrouble`, `reform.news.progress`
- **reject.*** – `reject.r.low.0`, `reject.r.low.0Calm`, `reject.r.low.1`, `reject.r.low.1Calm`, `reject.r.low.2`
- **sponsor.*** – `sponsor.bonusMissed`, `sponsor.bonusPaid`, `sponsor.offers`, `sponsor.signed`
- **story.*** – `story.ready`
- **trophy.*** – `trophy.press.cup`, `trophy.press.europe`, `trophy.press.league`
- **war.*** – `war.headline`, `war.result`, `war.staffHeadline`, `war.staffLost`, `war.staffResult`, `war.staffStarted`, `war.staffWon`, `war.revealLost`, `war.revealLostWage`, `war.revealWon`, `war.revealWonWage`, `war.started`, `war.startedWage`
- **week.*** – `week.summary`
- **window.*** – `window.bosman`, `window.closed`, `window.closing`, `window.closingTomorrow`, `window.deadlineDay`, `window.opened`
- **youth.*** – `youth.press.average`, `youth.press.golden`, `youth.press.good`, `youth.press.poor`, `youth.preview.average`, `youth.preview.golden`, `youth.preview.good`, `youth.preview.poor`

### Variants of mapped families (70)

`transfer.freeDone`, `award.managerOfYearMe`, `award.monthManagerMe`, `ba.yes.lowerExp`, `ba.yes.youthDrive`, `board.c.europeWin`, `board.c.survivalWin`, `board.c.winStreak`, `board.delighted`, `board.disappointed`, `board.overWage`, `board.requestNo`, `board.requestOk`, `board.satisfied`, `board.wasteWage`, `trophy.board.cupAgain`, `trophy.board.europeAgain`, `trophy.board.leagueAgain`, `clause.promotedWage`, `clause.relegatedWage`, `pers.brokenPromise`, `reject.r.future.0Calm`, `reject.r.future.1`, `reject.r.future.1Calm`, `reject.r.key.0Calm`, `reject.r.key.1`, `reject.r.key.1Calm`, `trophy.captain.cup`, `trophy.captain.europe`, `will.praise.contractLeader`, `will.praise.formLeader`, `will.praise.pressLeader`, `will.promiseBrokenTime`, `will.promiseKept`, `clause.addOnOwed`, `clause.addOnPaid`, `clause.sellOnOwed`, `fans.leave.free2`, `fans.leave.released2`, `fans.renew2`, `fans.renew3`, `news.newSeason`, `news.split`, `news.ueclQualified`, `news.welcome`, `pers.incident.nightclub`, `press.invitePost`, `press.invitePre`, `press.promiseBroken`, `press.promiseKept`, `press.reportPlain`, `staff.bidFailed`, `staff.bidLost`, `staff.bidSent`, `staff.bidWon`, `staff.poached`, `news.injury`, `job.withdrawn`, `news.newJob`, `news.scoutReturned`, `clause.releaseDeclined`, `enquiry.listed`, `enquiry.price`, `transfer.aiFinalOffer`, `transfer.aiNoSellOn`, `transfer.biddingWar`, `transfer.digestOne`, `transfer.lostBiddingWar`, `transfer.optionExercised`, `transfer.swapPart`

## 4. Merge candidates among our own keys

Same event, several keys or several inbox items at once – candidates for one key with a param, or one combined item.

1. **Bidding wars – three parallel key sets for "you won/lost the race".** `war.revealWon`/`war.revealLost` (fee war, `transfers.ts:warReveal`), `war.revealWonWage`/`war.revealLostWage` (wage war), `signing.won`/`signing.lost`/`signing.gone` (`transfers.ts:resolveSignings`), `auction.won` (`transfers.ts:resolveAuctions`), `transfer.lostBiddingWar` (`transfers.ts:processOffers`), `transfer.biddingWar` (`aiAnswerBid`). Staff has a mirror set: `war.staffWon`/`war.staffLost`/`staff.bidWon`/`staff.bidLost`/`staff.bidFailed` (`staff.ts:resolveStaffBids`). Proposal: `war.won`/`war.lost` with `{subject: player|staff, kind: fee|wage}`.
2. **Bidding-war headlines and results:** `war.headline` + `war.staffHeadline`, `war.result` + `war.staffResult`, `war.started` + `war.startedWage` + `war.staffStarted` – same text with a different subject.
3. **Trophy pile-up:** one trophy sends up to 5 items on the same day: `news.cupWin`/`news.champions` + `trophy.press.*`, `trophy.captain.*`, `trophy.fans.*`, `trophy.board.*(Again)` (`fans.ts:celebrateTrophy`). Merge into one item with sections (headline = cupWin/champions, body = press/captain/fans/board quotes).
4. **Youth intake day:** `news.youth` (one per player!) + `youth.intakeDay` + `youth.press.*` from `season.ts:youthIntake` on the same day. Keep `youth.intakeDay` with the list in the body; fold `youth.press.*` into it.
5. **Incoming AI bids:** `transfer.incomingBid` (5 call sites: `makeBid`, `aiClubTurn`, `aiPursuits`, `aiBidsForListed`), `transfer.pursuitReturn`, `transfer.aiRaised`, `transfer.aiFinalOffer`, `transfer.aiNoSellOn` – one key `transfer.incomingBid` with `{round, final, noSellOn}` would do.
6. **Talks ended:** `transfer.talksCollapsed`, `transfer.talksOver`, `transfer.aiWithdrew`, `signing.gone`, `staff.bidFailed` – all "deal is off".
7. **Player refuses:** `transfer.refuseRep`, `transfer.refuseAbroad`, `transfer.refuseHappy`, `transfer.playerRefusedMove` – one key + `{reason}`.
8. **Wants to leave (5 keys):** `pers.wantsAway`, `pers.brokenPromise` (personality.ts), `will.demandWantsAway`, `will.promiseBrokenTime`, `will.targetRequest` (will.ts). Same state change (`p.wantsAway`); merge into `player.wantsAway` + `{reason}`.
9. **Media outbursts:** `pers.incident.media` (troublemaker criticises team) vs `will.complain.press` (upset by your press comments) – both read as "[player] blast at manager".
10. **Contract running out:** `contract.expiring` vs `will.leak` vs `will.contractDemand` vs `will.complain.renewal` – four different items about the same expiring contract can arrive within weeks.
11. **Bosman:** `contract.leavingBosman` sent from both `transfers.ts:contractReminders` and `transfers.ts:aiBosman` (possible duplicate for the same player) and later `transfer.bosmanDone`.
12. **Board match comments vs board warnings:** `board.c.noWins`, `board.c.lossStreak`, `board.warning` overlap; `board.c.thrashing`/`board.c.goodWin`/`board.c.upsetWin` are three tiers of the same reaction.
13. **Board season verdict:** `board.delighted`/`board.satisfied`/`board.disappointed` vs `board.meeting` (fans.ts) – could be one "board meeting" item with the verdict.
14. **Sackings / resignations:** `board.sacked` vs `board.sackedSeason`, `job.resigned` vs `job.resignedMid` → one key + `{when}`.
15. **Job offers:** `news.jobOffer` (`fillVacancies`) vs `job.invite` (`processJobTalks`); `news.applyRejected` vs `job.filled`; `news.managerHired` vs `mgr.poached`.
16. **Board says no:** `ba.no.*` (5), `board.project.noConfidence`, `camp.noConfidence`, `camp.noMoney`, `board.project.noMoney`, `board.requestNo` – one "board refuses" key + `{what, reason}`. `ba.no.trainingCamp` and `camp.noConfidence` describe the same refusal.
17. **Match results:** `friendly.result.*` and `match.won/drew/lost` – same shape, could share keys with `{friendly:true}`.
18. **Release clauses:** `clause.releaseTriggered` (AI pays it for your player) vs `transfer.releaseMet` (you meet it) – fine as a pair, but `clause.releaseDeclined` is a 3rd variant.
19. **Window countdown:** `window.closing`, `window.closingTomorrow`, `window.deadlineDay` – three items in the last days; could replace each other (update the same item) instead of stacking.
20. **Duplicate call sites with identical keys:** `news.welcome` (actions.ts:248 + newgame.ts:326), `sponsor.offers` (newgame.ts:329 + season.ts:530), `board.requestOk` (board.ts:301 + 322), `news.managerSacked` (3 sites), `bet.acceptedByThem`/`bet.declinedByThem` (rivalry.ts:90 direct + :106 via `tell`), `transfer.bidAccepted`/`bidCountered`/`bidRejected` (human-to-human in `respondToOffer` and AI in `aiAnswerBid`). Not bugs, but worth one helper each.
21. **Scout news bypass:** `news.scoutDone`/`news.scoutReturned`/`news.scoutTalent` are pushed with `g.news.unshift` instead of `addNews` (no muting, no multiplayer copy).

## 5. Top 80 EASY items (prioritised)

P1 = high player value, single obvious trigger; P2 = good flavour; P3 = nice-to-have. Many rows share one trigger and should be built as one *family* (see notes after the table). All functions are in `src/game/` and were verified to exist.

| # | P | Original headline | Trigger (file:function + condition) | Params |
|---|---|---|---|---|
| 1 | 1 | [manager] grants [spiller] transfer request | transfers.ts:toggleListed (p.wantsAway or after will.targetRequest) | player |
| 2 | 1 | [manager] puts [spiller] on transfer list | transfers.ts:toggleListed | player, fee |
| 3 | 1 | [klub] expected to challenge | season.ts:seasonRollover (after setBoardExpectation; new preview item in media.ts) | club, comp |
| 4 | 1 | [klub] financial mess | finance.ts:monthlyFigures (balance < 0 two months) | club, balance |
| 5 | 1 | [klub] march on | competitions.ts:resolveTie (user club wins cup tie) | club, comp, stage, opp |
| 6 | 1 | [klub] tipped for glory | season.ts:seasonRollover (preview, expectation title) | club, comp |
| 7 | 1 | [klub] tipped for promotion | season.ts:seasonRollover (preview, expectation promotion) | club, comp |
| 8 | 1 | Fans unhappy with [person] | fans.ts:fansMonthly (fanMood drop >= 10, already detected for story) | manager, mood |
| 9 | 1 | Fans' happy with [person] | fans.ts:fansMonthly (fanMood rise >= 10) | manager, mood |
| 10 | 1 | [person]'s loan finishes | season.ts:contractsAndLoans (p.loan.until < today, setClub back) | player, from, to |
| 11 | 1 | [spiller] put up for sale | transfers.ts:toggleListed (user) / AI listing in transfers.ts:aiClubTurn | player, club, fee |
| 12 | 1 | Unhappy [spiller] transfer listed | transfers.ts:toggleListed (p.wantsAway) / will.ts:answerComplaint (choice list) | player, fee |
| 13 | 1 | 1 match [scope] ban | sim.ts:applyMatchResult (p.banned set from 0 to 1) | player, n, reason |
| 14 | 1 | [antal] match [scope] ban | sim.ts:applyMatchResult (red card: banned = rng.int(1,3)) | player, n, reason |
| 15 | 1 | [spiller] banned for [antal] matches | sim.ts:applyMatchResult (line.red) | player, n |
| 16 | 1 | [spiller] banned for one match | sim.ts:applyMatchResult (yellowCount reaches 5) | player |
| 17 | 1 | [klub] reach playoffs | competitions.ts:setupPlayoff (user club among seeds) | club, comp |
| 18 | 1 | 1 match [scope] ban  ([grund]) | sim.ts:applyMatchResult | player, n, reason |
| 19 | 1 | [antal] match [scope] ban  ([grund]) | sim.ts:applyMatchResult | player, n, reason |
| 20 | 1 | One yellow card away from [scope] 1 match ban | sim.ts:applyMatchResult (p.yellowCount === 4) | player |
| 21 | 1 | [klub] finish runners-up in [turnering] | competitions.ts:advance (final decided, comp.meta.runnerUp === user club) | club, comp, winner |
| 22 | 1 | [klub] knocked out of [turnering] | competitions.ts:resolveTie (tie.winner !== user club) | club, comp, opp, stage |
| 23 | 1 | [klub] out of [turnering] | competitions.ts:resolveTie / competitions.ts:checkGroupsDone (user club eliminated) | club, comp |
| 24 | 1 | [klub] qualify for [turnering] | newgame.ts:setupSeasonComps (europeanQualifiers result includes user club) | club, comp |
| 25 | 1 | [klub] through to next round in [turnering] | competitions.ts:resolveTie (tie.winner === user club) | club, comp, opp, stage |
| 26 | 1 | [klub] avoid relegation | season.ts:promotionRelegation (user club finished just above drop zone) | club, comp, pos |
| 27 | 1 | [klub] fail to qualify from [turnering] group | competitions.ts:checkGroupsDone / competitions.ts:checkLeaguePhaseDone | club, comp, pos |
| 28 | 1 | [klub] fail to win promotion | season.ts:promotionRelegation / competitions.ts:advance (playoff loser) | club, comp |
| 29 | 1 | [klub] lose [turnering] final | competitions.ts:advance (comp.meta.runnerUp) | club, comp, winner |
| 30 | 1 | [klub] qualify for Final | competitions.ts:advance (createFinal with user club) | club, comp, opp, date |
| 31 | 1 | [klub] qualify for playoff | competitions.ts:setupPlayoff | club, comp |
| 32 | 1 | [klub] qualify from [turnering] group | competitions.ts:checkGroupsDone / competitions.ts:checkLeaguePhaseDone | club, comp, pos |
| 33 | 1 | [klub] through to final | competitions.ts:advance (createFinal) | club, comp |
| 34 | 2 | [spiller] withdraws complaint about [klub] | will.ts:answerComplaint | player, club |
| 35 | 2 | Board back [person] | press.ts:applyPress (tone backPlayer, fx.brd>0) | player, manager |
| 36 | 2 | Board confident of [person]'s loyalty | press.ts:applyPress (topic jobLinked, loyal answer) | manager, club |
| 37 | 2 | Board fury at [manager] silence | press.ts:applyPress (tone deflect, fx.brd<0) | manager |
| 38 | 2 | Board pleased by media recognition of [person] | awards.ts:monthlyAwards (award.monthManagerMe) / awards.ts:seasonGala (managerOfYearMe) | manager, comp |
| 39 | 2 | Board pleased by your handling of [person] | personality.ts:interact (fine/warning, misbehaved=true) | player |
| 40 | 2 | Board shocked by release of [person] | transfers.ts:releasePlayer (player among top-5 value / high CA) | player, fee |
| 41 | 2 | Board surprised at [person] departure | transfers.ts:completeTransfer (user sells a top-3 player) | player, club, fee |
| 42 | 2 | [klub] fans respond to speculation | board.ts:processJobTalks (job.invite for user while employed) | club, other |
| 43 | 2 | [klub] manager [person] told to stop the rot | board.ts:aiSackings (AI club in danger zone but not sacked) | club, manager |
| 44 | 2 | [manager] attacks referee conspiracy | press.ts:applyPress (topic referee, tone fiery) | manager, opp |
| 45 | 2 | [manager] criticises poor refereeing standards | press.ts:applyPress (topic referee) | manager, opp |
| 46 | 2 | [person] linked with [klub] job | board.ts:fillVacancies / board.ts:openVacancy (user on candidate list) | manager, club |
| 47 | 2 | [rival manager name] questions purchase of [spiller] | transfers.ts:completeTransfer (fee >= 1.5x value, user buyer) | manager, player, fee |
| 48 | 2 | Sacked [person] | staff.ts:fireStaff | name, role |
| 49 | 2 | [formand] concerned by your handling of the media | press.ts:applyPress (g.manager.media falls below threshold) | manager |
| 50 | 2 | [formand] pleased by your handling of the media | press.ts:applyPress (g.manager.media rises above threshold) | manager |
| 51 | 2 | [klub] climbing to safety | media.ts:monthlyColumn (user club leaves drop zone) | club, pos, comp |
| 52 | 2 | [klub] expected to last pace | season.ts:seasonRollover (preview, expectation mid) | club, comp |
| 53 | 2 | [klub] fly the flag | competitions.ts:resolveTie (continental tie won by user club) | club, comp, opp |
| 54 | 2 | [klub] halt slide | sim.ts:userMatchResult (win after 3+ games without a win) | club, opp, score |
| 55 | 2 | [klub] make their mark on [verdensdel] | competitions.ts:checkGroupsDone / competitions.ts:checkLeaguePhaseDone (user club qualifies) | club, comp |
| 56 | 2 | [klub] tipped as outsiders | season.ts:seasonRollover (preview, expectation top3/tophalf for weaker club) | club, comp |
| 57 | 2 | [klub] title challenge in spotlight | media.ts:monthlyColumn (user club within 3 pts of top) | club, comp, gap |
| 58 | 2 | [spiller] a 'future international' | training.ts:monthlyDevelopment (age<=21, CA jump, pa high) | player, club |
| 59 | 2 | [spiller] concerned by transfer rumour | media.ts:weeklyRumours (rumour about user's own player) | player, club |
| 60 | 2 | [spiller] impresses at [klub] | media.ts:monthlyColumn (new signing, avg rating >= 7.2) | player, club |
| 61 | 2 | [spiller] indiscipline costs [klub] dear | sim.ts:applyMatchResult (line.red && team lost) | player, club, opp |
| 62 | 2 | [spiller] on the rise | training.ts:monthlyDevelopment (CA +5 in a month, age<=23) | player |
| 63 | 2 | [spiller] under fire | media.ts:monthlyColumn (regular with avg rating < 6.0) | player, club |
| 64 | 2 | Fans disgusted by [person]'s behaviour | personality.ts:monthlyPersonality (pers.incident.*) | player |
| 65 | 2 | Fans pleased by firm handling of [spiller] | personality.ts:interact (fine/warning deserved) | player |
| 66 | 2 | Fans slam [person] | fans.ts:fansAfterMatch (heavy home defeat) / fans.ts:bumpFans large negative | player, club |
| 67 | 2 | Fans' concern over [person] | fans.ts:fansMonthly (fanMood < 35) | manager, mood |
| 68 | 2 | Media question purchase of [spiller] | transfers.ts:completeTransfer (fee >= 1.5x value) | player, fee, club |
| 69 | 2 | Press discuss [klub] title credentials | media.ts:monthlyColumn (user top-2 after Jan) | club, comp |
| 70 | 2 | Press tip [klub] as contenders | season.ts:seasonRollover (preview) | club, comp |
| 71 | 2 | Press tip [klub] for glory | season.ts:seasonRollover (preview) | club, comp |
| 72 | 2 | Press write off [klub] chances | season.ts:seasonRollover (preview, expectation survive) | club, comp |
| 73 | 2 | Talented [spiller] given boost | sim.ts:applyMatchResult (first senior appearance, age<=19) | player, club |
| 74 | 2 | Youngster [spiller] praised | sim.ts:applyMatchResult (age<=20, rating>=8) | player, club, opp |
| 75 | 2 | [spiller] fitness worry | sim.ts:newDay (injured regular, injury.days<=3 before next fixture) | player, days |
| 76 | 2 | [spiller] lacking fitness | sim.ts:newDay (regular with condition < 80 the day before a match) | player, condition |
| 77 | 2 | [spiller] resumes light training | sim.ts:newDay (injury.days === 7 for injuries >= 21 days) | player, days |
| 78 | 2 | 1 match [scope] ban ( starts [dato] ) | sim.ts:applyMatchResult | player, n, date |
| 79 | 2 | [antal] match [scope] ban ( starts [dato] ) | sim.ts:applyMatchResult | player, n, date |
| 80 | 2 | Players protest over [person]'s fine | personality.ts:interact (fine/fineHeavy with fineUnjust) | player |

### Implementation families (build once, covers many rows)

- **Press-reaction family** (~35 EASY rows: "Board back/defend/slam [person]", "[formand] … silence/verdict", "Fans pleased by your defence of …", "[manager] criticises refereeing", "Board confident of loyalty"): one hook at the end of `press.ts:applyPress`, per answered topic, using `topic.kind`, `ans.tone`, `ans.fx.brd`/`fx.fan`/`fx.med` and `topic.pid`; pick sender (board / fans / media) by the largest effect. Params: `player`, `manager`, `opp`, `club`. Keys e.g. `press.react.board.<up|down>.<tone>`, `press.react.fans.<…>`.
- **Player-talk reaction family** (~15 rows: fines/warnings, "Players protest over fine", "Fans pleased by firm handling", "[person] will achieve great things", "Agent demands support"): `personality.ts:interact` already computes `misbehaved`, the reply key and the squad effect – post the reply (and the squad/fan reaction) as an inbox item. Params: `player`, `kind`, `reason`.
- **Bans & cards** (8 rows): `sim.ts:applyMatchResult` where `p.banned` and `p.yellowCount` are set; only for `isHumanClub(p.club)`. Params: `player`, `n` (matches), `reason` (`red`/`yellows`), optional `date` (next fixture).
- **Cup/European progress** (~25 rows): `competitions.ts:resolveTie` (tie winner/loser, `tie.stage`), `competitions.ts:advance` (next round / final created via `createFinal`, `comp.meta.runnerUp`), `competitions.ts:checkGroupsDone` and `competitions.ts:checkLeaguePhaseDone` (qualified / eliminated). Filter on user club (or `newsRelevant`). Params: `club`, `comp`, `stage`, `opp`.
- **Season preview** (~12 rows: "tipped for glory/promotion", "expected to challenge", "Press write off chances"): one item from `season.ts:seasonRollover` right after `setBoardExpectation()` (also `newgame.ts:createGame`), using `g.board.expectation` and `strengthRank` from board.ts. Params: `club`, `comp`, `exp`.
- **Media column extensions** (~15 rows: "climbing to safety", "slip nearer relegation", "title credentials", "[spiller] under fire/rated highly", "Boring [klub]"): extend `media.ts:monthlyColumn` with variants chosen from table position, form and player average ratings (`stats.ratingSum/ratingCount`).
- **Fan mood** (4 rows): `fans.ts:fansMonthly` already detects |Δmood| >= 10 for the story – emit `fans.mood.up/down` and a low-mood item. Params: `manager`, `mood`.
- **Transfer-list & loans** (5 rows): `transfers.ts:toggleListed` (put on list / grants request / unhappy listed) and `season.ts:contractsAndLoans` (loan finished).
- **Promotion/playoff outcomes** (~8 rows): `season.ts:promotionRelegation` (avoided relegation, missed promotion), `competitions.ts:setupPlayoff` (reached playoffs), `competitions.ts:advance` for playoff final loser.
