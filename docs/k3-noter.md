# K3-noter – tekster uden exe-modstykke (19/11)

Status: 173 → 162 ikke-originale. Resten er undersøgt og **ikke** fjernet, fordi den originale ordlyd ikke ligger i exe'ens
strenge (skærmtekster i originalens datafiler/grafik) eller fordi teksten dækker en funktion på en original skærm.
Næste skridt for hver gruppe: tag et billede af originalskærmen (cmctl) og ret teksten dér.

## Rettet (exe-ordlyd fundet)
- `comp.groupOut` ("{} fail to qualify from {} group"), `comp.final` ("{} through to final"), `injury.awol` ("Absent without permission"),
  `cl.pl.injDays`/`injWeeks` ("<n> days" / "about <n> weeks"), `cl.mt.subDone` (to linjer: "…brought on to replace…." / "Return to the match ?").
- Allow-listet som CM Reborn-område: `info.title`, `authentic`, `career.source`, `career.sourceCm`, `sqn.dragHint` (hover-titlen er nu også bag hjælpetekster).

## Uløst – kolonne-/knapetiketter fra originalens datafiler (ikke i exe; kræver skærmbillede)
`cl.sq.*` (Assistant Picks, Int. Caps / Goals, First XI, Overall Stats, Lge Apps/Gls), `cl.at.*` (Pas, Tck, Drb …), `cl.tag.*`, `attr.*`/`group.*`
(Natural Fitness, Hidden, Technical …), `inbox.*`, `nav.inbox`, `navg.market`, `cl.menu`, `cl.fl.title`/`cl.sf.title` (exe har kun "Filters for <søgenavn>"),
`cl.tac.run.*`/`cl.tac.v.*`, `cl.mt.*` (Kick Off Match, Pause/Resume, Commentary Speed, sp.8), `cl.ms.poss`, `cl.mh.*`, `cl.na.applied`, `cl.ts.noFiles`,
`cl.pl.callUp`/`bonus.app`/`grp.technical`, `cm.sc.*`, `stage.*`/`cl.toR16`/`cl.toPlayoff`/`cl.out` (Champions League-ligafasen 2024+ findes ikke i originalen).

## Uløst – nyheder/beskeder, hvor vores sætning afviger fra exe'ens skabelon (ændring kræver alle 10 sprog + parametre)
- `transfer.bidAccepted`/`bidRejected` (exe: "{klub} have accepted/rejected the offer."), `transfer.loanNonEu` (exe: "{klub} are not allowed to loan non-EU players." – kræver klubparameter), `transfer.windowClosed` (exe: "The next transfer window opens on {dato}.").
- `staffrep.*` (fysio-/trænerrapport: originalen bruger sætningsskabeloner "In his report, physio … believes …"), `staff.hired*`, `cm.staffAccepts`, `contract.renewed`, `awol.back`, `job.resignedMid`, `cl.job.*`.
- `comp.playoffThrough` (exe: "through to playoff phase" betyder gruppe→slutspil, ikke samme situation).

## Funktioner uden originalmodstykke på en original skærm (bevares – forstå skærmen først)
- `cmaw.notPorted` (Awards-skærmen: stemmer til de internationale priser mangler), `cl.sq.assistant`, `intl.myTeam`/`myRecord`/`nationInfo`/`tab.fifa`/`knockout`/`decline`, `intl.kind.*`, `cl.cm.wcq|euroq|ofc|interam`.
- `eur.max`, `blocked`, `top.*`, `common.free`, `club.*`, `exp.*` – generiske moderne tekster; kontrolleres, når de tilsvarende klassiske skærme er sammenlignet.

## Moderne udseende/udvidet (slået fra i ægte tilstand; allow-liste mangler kun hvis de bliver synlige)
`player.*`, `neg.pendingMp`, `transfer.overBudget|alreadyBidding|noLoanClub|loanTermsRejected|noWorkPermit`, `fix.*`, `tbl.playoff`, `role.*`.
