import { Fragment, type ReactNode } from 'react';
import { compName, dateFmt, getLang, has, money, moneyCm, moneyWage, natName, t } from '../../i18n';
import { useNav, type Route } from '../core';
import { ClubLink, PlayerLink } from '../components';
import type { NewsItem } from '../../game/types';
import { offerAnswerFee } from '../../game/offerFee';
import { gs, onGameSwitch } from '../../game/state';
import { cmScoutReportBody } from '../cmScoutNews';
import { cmScoutAsgParams } from '../cmScoutAsgNews';
import { cmBanAnswerBody, cmBanBody, cmBanParams, cmLongDate } from '../cmBanText';
import { requestBodyKind, requestReasons } from '../../game/cmTransferList';
import { boardCmText } from '../../game/cmBoardText';
import { appointBody } from '../../game/cmBoardGame';
import type { GameState } from '../../game/types';
import { isRetro } from '../theme';
import { ClassicHead, clubRoute, cxLongDate, nationRoute } from '../classic';
import { cmRumBody, cmRumTitle } from '../cmRumText';
import { cmCompShort, cmFixtureName, cmFixtureNameInText } from '../../game/cmRoundName';

/** spillerens grunde (cmTransferTalks.ts cmWhy, "k:argument|k") som tekst: "… og …" (0x8e4ae0) */
export function cmWhyText(why: string): string {
  return why.split('|').map((w) => {
    const i = w.indexOf(':'), k = i < 0 ? w : w.slice(0, i), a = i < 0 ? '' : w.slice(i + 1);
    return t(`cm.why.${k}`, { club: a, nation: a, comp: compName(a) ?? a, continent: k === 'continent' ? t(`cm.why.cont.${a}`) : a });
  }).join(` ${t('cm.why.and')} `);
}

/** action: kun klassisk tema – fx en Action-menu i titelbjælkens højre hjørne */
export function Head({ title, children, action, menu, club }: { title: ReactNode; children?: ReactNode; action?: ReactNode; menu?: boolean; club?: number }) {
  const { back, canBack } = useNav();
  // klassisk tema: titelbjælke + hub-faner (Tilbage ligger i den brede bundbjælke)
  if (isRetro()) return <ClassicHead title={title} action={action} menu={menu} club={club}>{children}</ClassicHead>;
  return (
    <div className="screen-head">
      {canBack && <button className="back small" onClick={back}>‹ {t('common.back')}</button>}
      <h2>{title}</h2>
      <div className="grow" />
      {children}
    </div>
  );
}

/** 0x8d5420: grundene i "They <reasons>." – 0x200 indispensible, ellers 0x400 valuable; 0x100 recently purchased; 0x800 rival, ellers 0x1000
 *  same division ({comp}); 0x2000 future (kun uden 0x200/0x400); højst to ("A and B"). Grund 10 (& 0xa i den lave byte) har ingen. */
export function cmRejWhy(why: number, comp: string): string {
  const r: string[] = [];
  if (why & 0xa) return '';
  if (why & 0x200) r.push(t('transfer.rejWhy.200'));
  else if (why & 0x400) r.push(t('transfer.rejWhy.400'));
  if (r.length < 2 && why & 0x100) r.push(t('transfer.rejWhy.100'));
  if (r.length < 2 && why & 0x800) r.push(t('transfer.rejWhy.800'));
  else if (r.length < 2 && why & 0x1000) r.push(t('transfer.rejWhy.1000', { comp }));
  if (r.length < 2 && why & 0x2000 && !(why & 0x600)) r.push(t('transfer.rejWhy.2000'));
  return r.length === 2 ? t('transfer.rejWhy.and', { a: r[0], b: r[1] }) : r[0] ?? '';
}

export function newsParams(n: NewsItem): Record<string, string | number> {
  const p: Record<string, string | number> = { ...n.params };
  // bestyrelsens nyheder (cmBoardText.ts) og ansættelsen: teksten bygges igen på det valgte sprog (ældre nyheder uden `bd`/`full` beholder den gemte)
  if (n.key === 'board.cm' && typeof p.bd === 'string') { try { const r = boardCmText(JSON.parse(p.bd)); p.title = r.title; p.body = r.body; } catch { /* den gemte tekst bruges */ } }
  // reservekampenes nyhed (0x7e6f70, exe 31862-31870): klubnavnene står som "X Reserves" i pladserne
  if (n.key.startsWith('res.')) { p.teamR = t('res.club', { club: String(p.team ?? '') }); p.oppR = t('res.club', { club: String(p.opp ?? '') }); }
  if (n.key === 'news.cmAppoint' && typeof p.full === 'string') p.body = appointBody(p.full, String(p.manager), String(p.prev ?? ''));
  // CM 01/02's rygte 0xfbc (cmRumours.ts): overskriften 0x756e51
  if (n.key === 'cm.rum') p.title = cmRumTitle(n);
  // kampprogrammet 0x77bc80 type 0xd: "Vejle will start with games against B 1909 (home), … on Sunday 5th August 2001, … respectively."
  if (n.key === 'comp.fixturesOut' && typeof p.o1 === 'number') {
    const g = gs();
    for (const i of [1, 2, 3]) {
      const o = Number(p[`o${i}`]);
      p[`g${i}`] = t(p[`h${i}`] ? 'comp.fixturesOut.home' : 'comp.fixturesOut.away', { club: g.clubs[o]?.short ?? '' });
      p[`d${i}`] = cxLongDate(String(p[`fd${i}`]));
    }
  }
  // budet på menneskets stab (0x8d3520, 0xa91afc): "… a job as {job}" – jobnavnet uden artikel
  if (n.key === 'cm.stBid' && typeof p.job === 'number') p.job = t(`cm.stm.j.${p.job}`);
  // kontrakttilbuddet til menneskets spiller (0x8d3520) og aftalen (0xfb3, 0xa9bbec): originalens datoform "10th November 1998"
  if ((n.key === 'transfer.cm7' || n.key === 'transfer.cmAgreed') && typeof p.date === 'string') p.date = cmLongDate(p.date);
  // PLAYER_REGEN (cmRetire.ts): stabsjobbet i brødteksten – 0x53ac40 ("Coach") eller 0x53ad00 ("coach", jl)
  if (n.key.startsWith('cmret.') && typeof p.job === 'number') p.job = t(`cmret.${p.jl ? 'jl' : 'j'}.${p.job}`);
  if (n.key.startsWith('cm.stm.') && typeof p.job === 'number') { const jn = t(`cm.stm.j.${p.job}`); p.job = getLang() === 'en' ? `${/^[aeiou]/i.test(jn) ? 'an' : 'a'} ${jn}` : jn; }
  if (typeof p.injury === 'string') { p.injury = t(`injury.${p.injury}`); p.injuryLc = String(p.injury).toLowerCase(); }
  // originalens skadenyhed: periodens ord ("about three weeks") og skaden med lille forbogstav i brødteksten
  if (typeof p.range === 'string' && p.range.startsWith('injury.r.')) p.range = t(p.range);
  if (n.key.startsWith('injury.o.')) p.injury = p.injuryLc;
  if (typeof p.comp === 'string') p.comp = compName(p.comp) ?? p.comp;
  // spillerens grunde til at afvise et skifte (cmWhy): "k:argument|k" → "han vil ikke … og …"
  if (typeof p.why === 'string' && p.why) p.reasons = cmWhyText(p.why);
  // månedens priser (CM 01/02: "<spiller> wins February award"): måneden før nyhedens dato
  if (n.key.startsWith('award.month') && p.month === undefined) {
    const d = new Date(`${n.date.slice(0, 7)}-15T00:00:00Z`); d.setUTCMonth(d.getUTCMonth() - 1);
    try { p.month = d.toLocaleDateString(t('cl.locale'), { month: 'long', timeZone: 'UTC' }); } catch { p.month = d.toISOString().slice(5, 7); }
  }
  if (typeof p.tour === 'string') p.tour = t(`intl.name.${p.tour}`);
  // CM 01/02's priser (cmAwards.ts): månedens navn, positionsordet og antallet som ord
  if (n.key.startsWith('cmaw.')) {
    if (typeof p.mon === 'number') { try { p.month = new Date(Date.UTC(2001, p.mon - 1, 15)).toLocaleDateString(t('cl.locale'), { month: 'long', timeZone: 'UTC' }); } catch { p.month = String(p.mon); } }
    if (typeof p.pos === 'string') p.posw = t(`cmaw.pos.${p.pos}`);
    if (typeof p.num === 'number') p.numw = has(`num.${p.num}`) ? t(`num.${p.num}`) : String(p.num);
  }
  // CM 01/02's karantæner (cmDiscipline.ts): længden i overskriften (0x7e5780), "Keane's" og forbundets nationalitetsord
  if (n.key.startsWith('cmban.')) cmBanParams(n, p);
  // egen stabs kontrakt (cmStaff.ts cmRenewNews / cmOwnStaffContractsDaily – 0x4d4fb0/0x4daa00): genitiven, beløbet og grundene
  if (n.key.startsWith('cm.staffRenew') || n.key === 'cm.staffExpires') {
    for (const k of ['club', 'clubFull', 'name'] as const) if (typeof p[k] === 'string') p[`${k}S`] = possessiveName(String(p[k]));
    if (typeof p.worth === 'number') p.worth = money(p.worth);
    const r = [p.r1, p.r2].filter((x) => typeof x === 'string' && x).map((x) => t(`cm.rn.r.${x}`, p));
    p.reasons = r.length > 1 ? t('cm.rn.r.and', { a: r[0], b: r[1] }) : r[0] ?? '';
  }
  // klubøkonomiens begivenheder: beløbene (€) i den viste valuta, antallet af pladser
  if (n.key.startsWith('cmfe.')) {
    if (typeof p.amt === 'number') p.amt = money(p.amt);
    if (typeof p.funds === 'number') p.funds = money(p.funds);
    if (typeof p.n === 'number') p.n = p.n.toLocaleString(t('cl.locale'));
  }
  // Discipline Player: grunden med små bogstaver som originalens 0x5a73a0(…, 1)
  if (n.key.startsWith('cmfine.') && typeof p.why === 'number') p.reason = t(`cmfine.why.${p.why}`);
  if (n.key === 'eur.request' && typeof p.phase === 'string') p.phase = t(`eur.phase.${p.phase}`);
  // "Four players from Man Utd …" (uden navneliste)
  if ((n.key === 'intl.selN' || n.key === 'intl.tourSel') && !n.params?.names && typeof p.n === 'number' && has(`num.${p.n}`)) p.n = t(`num.${p.n}`);
  // andre klubbers handler (CM 01/02): "The fee may be increased to £6,750,000 depending on appearances." og "… from Tottenham"
  if (n.key.startsWith('transfer.o')) {
    p.more = typeof p.fee2 === 'number' ? `\n\n${t('transfer.o.more', { fee2: moneyCm(p.fee2, 6) })}` : ''; // 0x8dc370: flag 6
    p.fromFree = p.from ? ` ${t('transfer.o.fromClub', { from: String(p.from) })}` : '';
  }
  // navnelister ("A & B & C") som i originalen: "A, B and C"
  if (typeof p.names === 'string' && p.names.includes(' & ')) { const x = p.names.split(' & '); p.names = `${x.slice(0, -1).join(', ')} ${t('common.and')} ${x.at(-1)}`; }
  // placering som ordenstal ("1st", "1.")
  if (typeof p.place === 'number') { const n = p.place; p.place = t('cl.locale').startsWith('en') ? `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}` : `${n}.`; }
  // ældre nyheder uden efternavn (fx "Irwin resumes full training"): det sidste ord i navnet
  if (p.last === undefined && typeof p.player === 'string') p.last = p.player.split(' ').at(-1) ?? p.player;
  // brødtekster (CM 01/02-stil): varighed og resultat som ord
  if (typeof p.days === 'number') p.dur = p.days <= 10 ? t('news.dur.days', { n: p.days }) : t('news.dur.weeks', { n: Math.max(2, Math.round(p.days / 7)) });
  if (typeof p.res === 'string') p.resWord = t(`news.res.${p.res}`);
  if (typeof p.ha === 'string') p.haWord = t(p.ha === 'h' ? 'news.ha.h' : 'news.ha.a');
  if (typeof p.lane === 'string') p.lane = t(`lane.${p.lane}`);
  if (p.kind === 'transfer' || p.kind === 'wage') p.kind = t(`board.kind.${p.kind}`);
  if (p.kind === 'stadium' || p.kind === 'training' || p.kind === 'youth') p.kind = t(`proj.kind.${p.kind}`);
  if (typeof p.done === 'string') p.done = dateFmt(p.done);
  if (typeof p.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(p.date)) p.date = dateFmt(p.date);
  if (typeof p.cost === 'number') p.cost = money(p.cost);
  if (n.key === 'onb.briefing') { p.weak = t(`onb.need.${p.weak}`).toLowerCase(); p.style = t(`onb.style.${p.style}`).toLowerCase(); }
  if (n.key.startsWith('camp.') && typeof p.dest === 'string') p.dest = t(`camp.dest.${p.dest}`);
  if (n.key === 'camp.report' && typeof p.mood === 'string') p.mood = t(`camp.mood.${p.mood}`);
  if ((n.key === 'staff.hired' || n.key === 'recb.news.legendStaff' || n.key === 'recb.news.roleStaff') && typeof p.role === 'string' && ['assistant', 'coach', 'physio', 'scout'].includes(p.role)) p.role = t(`role.staff.${p.role}`);
  if (typeof p.id === 'string' && n.key.startsWith('challenge.')) p.id = t(`challenge.${p.id}.title`);
  if (typeof p.round === 'string' && n.key.startsWith('comp.')) p.round = t(`stage.${p.round}`).toLowerCase();
  if (typeof p.targetKey === 'string') p.target = t(p.targetKey);
  // CM 01/02 0x8d5420: sælgerens afvisning – grundene af bittene (højst 2)
  if (n.key === 'transfer.cmBidRej' && typeof p.why === 'number') p.reasons = cmRejWhy(p.why, String(p.comp ?? ''));
  if (n.key.startsWith('staffrep.')) for (const k of ['prone', 'cond', 'inj', 'now', 'future']) if (typeof p[k] === 'string' && p[k]) p[k] = t(String(p[k]));
  if (n.key.startsWith('intl.')) { if (typeof p.nation === 'string') p.nation = natName(p.nation); if (typeof p.runnerUp === 'string') p.runnerUp = natName(p.runnerUp); if (typeof p.opp === 'string' && p.opp) p.opp = natName(p.opp); }
  // "Ryan Giggs and Matthew Williams" (navnene gemmes med & imellem)
  if (typeof p.names === 'string' && p.names.includes(' & ')) { const ns = p.names.split(' & '); p.names = `${ns.slice(0, -1).join(', ')} ${t('common.and')} ${ns.at(-1)}`; }
  // scoutrapporten (CM 01/02): hvor han blev set, dommen og bemærkningerne sættes sammen af nøglerne
  // CM 01/02's spejderrapport 0x138e (cmScout.ts): brødteksten 0x7f9d10
  if (n.key.startsWith('cmsr.')) p.body = cmScoutReportBody(gs(), n);
  // CM 01/02's spejderopgaver 0x1389/0x138a/0x138b (cmScoutAsg.ts): navnene og brødteksten
  if (n.key.startsWith('cmsn.')) cmScoutAsgParams(gs(), n, p);
  if (n.key === 'scout.report') {
    p.where = p.ctx === 'weeks' ? t('scout.ctx.weeks', { age: p.age, pos: t(`role.${p.pos}`).toLowerCase() }) : t(`scout.ctx.${p.ctx}`, { club: p.club, score: p.score, opp: p.opp });
    p.verdict = t(`scout.v.${p.verdict}`, { club: p.myClub });
    p.extras = [p.strength ? t('scout.x.strength', { what: t(`scout.str.${p.strength}`) }) : '', p.skill ? t('scout.x.skill', { what: t(`scout.skill.${p.skill}`) }) : '',
      p.weakness ? t('scout.x.weakness', { what: t(`scout.weak.${p.weakness}`) }) : '', p.permit ? t('scout.x.permit') : ''].filter(Boolean).join(' ');
  }
  // landsholdenes nyheder som originalen (cmIntlSquad.ts: 0x76e3b0, 0x76f370, 0x770d20)
  if (n.key.startsWith('cmint.')) cmIntParams(n, p);
  // originalens kalender (cmCalendar.ts): tv-flytningen og den flyttede kamp (0x77bc80 type 3/1)
  if (n.key.startsWith('cmcal.')) cmCalParams(n, p);
  // pokalpræmien (cmFinance.ts, 0x48e590)
  if (n.key.startsWith('cmprize.')) {
    if (typeof p.amt === 'number') p.amt = moneyCm(p.amt, 6); // 0x48e590: flag 6
    const fc = String(n.params?.fc ?? '');
    p.comp = fc;
    p.round = cmFixtureName(fc, 0, Number(n.params?.fr ?? 0), 1, compName);
  }
  return p;
}

/** 0x54bef0(…, 0xff): "Saturday 10th February" (ugedag, dag og måned – uden år) */
function cmDayMonth(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`), loc = t('cl.locale');
  if (!loc.startsWith('en')) return d.toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
  const n = d.getUTCDate(), suf = n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th';
  return `${d.toLocaleDateString(loc, { weekday: 'long', timeZone: 'UTC' })} ${n}${suf} ${d.toLocaleDateString(loc, { month: 'long', timeZone: 'UTC' })}`;
}
function cmCalParams(n: NewsItem, p: Record<string, string | number>): void {
  const q = n.params ?? {};
  // kampens navn 0x4bfa30(turneringen, +0x32, +0x30, 2): det korte turneringsnavn + etape/runde; "Friendly"/"Reserve" med lille forbogstav
  p.fix = cmFixtureNameInText(cmFixtureName(String(q.fc ?? ''), Number(q.fs ?? 0), Number(q.fr ?? 0), 2, compName));
  if (typeof q.d1 === 'string') p.date = cmDayMonth(q.d1);
  if (typeof q.d2 === 'string') p.date2 = cmDayMonth(q.d2);
  if (typeof q.c2 === 'string') p.comp2 = compName(cmCompShort(q.c2));
  if (typeof q.tod === 'number') p.tod = t(`cmcal.tod.${q.tod}`);
}

export function newsTitle(n: NewsItem) {
  return t(n.key, newsParams(n));
}

/** Hvilken skabelon brødteksten bruger (nogle nyheder har varianter efter indholdet) */
const SCOUT_EXP: Record<number, string> = { 365: '12m', 182: '6m', 91: '3m', 61: '2m', 30: '1m', 7: '1w' };
/** "A & B & C" → "A, B and C" (navne og lande) */
const andList = (s: string, f: (x: string) => string = (x) => x) => { const x = s.split(' & ').filter(Boolean).map(f); return x.length > 1 ? `${x.slice(0, -1).join(', ')} ${t('common.and')} ${x.at(-1)}` : x[0] ?? ''; };
const numWord = (v: number) => { const w = has(`num.${v}`) ? t(`num.${v}`) : String(v); return w.charAt(0).toUpperCase() + w.slice(1); };
function cmIntParams(n: NewsItem, p: Record<string, string | number>): void {
  for (const k of ['nation', 'opp'] as const) if (typeof p[k] === 'string' && p[k]) p[k] = natName(String(p[k]));
  if (typeof p.opps === 'string') p.opps = andList(p.opps, natName);
  for (const k of ['list', 'others'] as const) if (typeof p[k] === 'string') p[k] = andList(String(p[k]));
  if (typeof n.params?.n === 'number') p.num = numWord(n.params.n);
  if (typeof n.params?.n1 === 'number') p.num1 = numWord(n.params.n1);
  if (typeof p.fix === 'string') p.fix = t(`cmint.fix.${p.fix}`);
  if (n.key.startsWith('cmint.r.') && typeof p.body === 'string') {
    p.main = t(`cmint.r.${p.body}`, p);
    p.more = typeof p.tail === 'string' && p.tail ? t(`cmint.r.${p.tail}`, p) : '';
  }
}

/** originalens genitiv efter et navn: engelsk 's (' efter s), de nordiske sprog og tysk s (' efter s/x/z), ellers navnet selv */
export function possessiveName(x: string): string {
  const l = getLang();
  if (l === 'en') return /s$/i.test(x) ? `${x}'` : `${x}'s`;
  if (l === 'da' || l === 'nb' || l === 'sv' || l === 'de') return /[sxz]$/i.test(x) ? `${x}'` : `${x}s`;
  return x;
}

function bodyKey(n: NewsItem): string {
  if (n.key === 'transfer.cmBidRej') return `transfer.cmBidRej.b${n.params?.body ?? ''}`;
  // pokalvinderen (competitions.ts finalBodyParams): comp_util.cpp 0x99f324 – med resultatet, samlet resultat eller blot "championship"
  if (n.key === 'news.cupWin' || n.key === 'news.playoffWin') return n.params?.body === 'win' ? 'news.cupWin.body' : n.params?.body === 'agg' ? 'news.cupWin.bodyAgg' : 'news.cupWin.bodyPlain';
  if ((n.key === 'cm.staffRenewOk' || n.key === 'cm.staffRenewNo') && typeof n.params?.body === 'string') return `cm.rn.${n.params.body}`;
  if (n.key.startsWith('cmsr.')) return 'cmsr.body';
  // uden stadion: exe'ens korte brødtekst (31865-31867)
  if (n.key.startsWith('res.') && !n.params?.venue) return `${n.key}.body0`;
  if (n.key.startsWith('cmsn.')) return 'cmsr.body';
  // landsholdenes nyheder (cmIntlSquad.ts): brødteksten er valgt i spillet
  if (n.key.startsWith('cmint.') && typeof n.params?.body === 'string') return n.key.startsWith('cmint.r.') ? 'cmint.r.body' : `cmint.b.${n.params.body}`;
  // CM 01/02 (0x5982 ff.): "Kim Rømer's contract is due to expire in twelve months time." – efter dagene til udløbet (ældre nyheder uden days: datoen)
  // spillerne (CONTRACT_MANAGER 0x4d6790 → 0x4d6a00): pladsen 7 (Bosman, pv b) eller 8 (spiller, pv t) giver sætningen efter; kode 7 = 0x9aad3c
  if (n.key === 'scout.contractReminder' && n.params?.prot) return 'scout.contractReminder.prot';
  if (n.key === 'scout.contractReminder' && typeof n.params?.days === 'number' && SCOUT_EXP[n.params.days]) return `scout.contractReminder.d${SCOUT_EXP[n.params.days]}${n.params.pv === 'b' || n.params.pv === 't' ? `.${n.params.pv}` : ''}`;
  // CM 01/02's priser (cmAwards.ts): brødteksten er valgt i spillet (0x767580 / 0x930880)
  if (n.key.startsWith('cmaw.mh.') && typeof n.params?.body === 'string') return `cmaw.mb.${n.params.body}`;
  if (n.key.startsWith('cmaw.yh.') && typeof n.params?.body === 'string') return `cmaw.yb.${n.params.body}`;
  // landsholdsudtagelse: navnene (højst tre) eller "Four players from Man Utd", med eller uden modstanderen
  if (n.key === 'intl.sel1' || n.key === 'intl.selN') {
    const many = n.key === 'intl.selN' && !n.params?.names, noOpp = !!n.params?.noOpp;
    return n.key === 'intl.sel1' ? (noOpp ? 'intl.sel1.noOpp' : 'intl.sel1.body') : many ? (noOpp ? 'intl.selN.manyNoOpp' : 'intl.selN.many') : noOpp ? 'intl.selN.noOpp' : 'intl.selN.body';
  }
  // slutrunde: "Michaël Silvestre and Fabien Barthez have been selected in the France squad for the FIFA World Cup."
  // CM 01/02 0xfa4: "However, he is willing to negotiate terms." mens han kan få et nyt tilbud
  // 0x8d84e0: "… has rejected the move to {Club} because he <grunde>." (0x8e4ae0)
  if (n.key === 'transfer.cmRejectsMove' && typeof n.params?.why === 'string' && n.params.why) return 'transfer.cmRejectsMove.because';
  if (n.key === 'transfer.cmRejects') return n.params?.again ? 'transfer.cmRejects.again' : 'transfer.cmRejects.body';
  if (n.key === 'intl.tourSel') return !n.params?.names ? 'intl.tourSel.many' : n.params?.n === 1 ? 'intl.tourSel.body1' : 'intl.tourSel.bodyN';
  // Discipline Player (cmFine.ts): originalens brødtekst er valgt i spillet (0x5a76e0/0x5a7ed0/0x5a8090)
  if (n.key.startsWith('cmfine.') && typeof n.params?.body === 'string') return `cmfine.b.${n.params.body}`;
  // PLAYER_REGEN (cmRetire.ts): originalens brødtekst er valgt i spillet (0x7a9650/0x7aa4c0)
  if (n.key.startsWith('cmret.') && typeof n.params?.body === 'string') return `cmret.b.${n.params.body}`;
  // tv-flytningen (cmCalendar.ts): dagen, tidspunktet eller "chosen" (0x77c5ab/0x77c675); pokalpræmien (cmFinance.ts, 0x48e590)
  if (n.key === 'cmcal.tv' && typeof n.params?.body === 'string') return `cmcal.tvb.${n.params.body}`;
  if (n.key.startsWith('cmprize.') && typeof n.params?.body === 'string') return `cmprize.b.${n.params.body}`;
  // klubøkonomiens begivenheder (cmFinEvents.ts): originalens brødtekst er valgt i spillet (0x59f3e0 m.fl.)
  if (n.key.startsWith('cmfe.') && typeof n.params?.body === 'string') return `cmfe.b.${n.params.body}`;
  // venskabskampens tilbud til mennesket (0x77ce44): arrangøren hjemme "have offered …", ellers "have challenged …"
  if (n.key === 'cmfr.proposal') return `cmfr.proposal.${n.params?.body === 'challenged' ? 'challenged' : 'offered'}`;
  // stabsskifter (cmStaffMove.ts, 0x8dc370): én brødtekst til de fire overskrifter
  if (n.key.startsWith('cm.stm.')) return n.params?.from ? 'cm.stm.bodyFrom' : 'cm.stm.body';
  // budet på menneskets stab: kompensationslinjen 0xa8f6ec kun med et beløb (+0x1b ≠ 0)
  if (n.key === 'cm.stBid') return n.params?.fee ? 'cm.stBid.body' : 'cm.stBid.body0';
  // build_bid's kontrakttilbud til menneskets spiller (tilstand 7, 0x8d3520): brødteksten er valgt i spillet; aftalen 0xfb3 med/uden beløb
  if (n.key === 'transfer.cm7') return `transfer.cm7.b.${String(n.params?.body ?? 'plain')}`;
  // 0x8e2570: lejen annulleret – brødteksten pr. grund (med "{klub}'s" når modtageren ikke styrer spillerens klub)
  if (n.key === 'transfer.cmLoanCancelled') return `transfer.cmLoanCancelled.b.${String(n.params?.body ?? 'deadline')}`;
  // 0xfb3 (0x8e08e0): uden kontraktklub (den klubløse) 0xa9be10 "The transfer of X to Y has been agreed."
  if (n.key === 'transfer.cmAgreed') return n.params?.fee ? 'transfer.cmAgreed.bodyFee' : n.params?.free ? 'transfer.cmAgreed.bodyFree' : 'transfer.cmAgreed.body';
  // "<Player> to join {Club}" (0xbbe, 0x4d6ee0): 0x9ab2ec "… has decided to leave {A} and join {B} … when his contract has expired." (ældre
  // nyheder uden den nuværende klub har ingen)
  if (n.key === 'transfer.preContract' && !n.params?.from) return '';
  // 0xfaf (0x8d8af0): "The transfer fee will be adjusted to …" kun, når beløbet steg
  if (n.key === 'transfer.cmSwapOut') return n.params?.adj ? 'transfer.cmSwapOut.bodyFee' : 'transfer.cmSwapOut.body';
  // 0xfbb (0x8e3780): byttespilleren uden arbejdstilladelse – beløbslinjen kun, når beløbet steg; 0xfb9 (0x8e2cd0): byttespillernes varianter
  if (n.key === 'transfer.cmPermitSwap') return n.params?.adj ? 'transfer.cmPermitSwap.bodyFee' : 'transfer.cmPermitSwap.body';
  if (n.key === 'transfer.cmPermitWait' && (n.params?.w === 'all' || n.params?.w === 'for')) return `transfer.cmPermitWait.${n.params.w}`;
  return `${n.key}.body`;
}

/** "Board Confidence Update": bestyrelsens udtalelse, som den stod på dagen */
const boardUpdate = (n: NewsItem) => [t(`cl.ba.conf.${n.params.lvl}`, { club: String(n.params.club ?? '') }), t(`cl.ba.fin.${n.params.fin}`), t(`cl.ba.fans.${n.params.fans}`)].join('\n\n');

/** Bud på egen spiller (CM 01/02): når man har svaret, står svaret under nyheden – "Man Utd have rejected the offer." */
function offerAnswer(n: NewsItem): string {
  // Squad Numbers: "The list has been submitted."
  if (n.key === 'sqn.request') return n.params?.done ? `\n\n${t('sqn.submitted')}` : '';
  // European Squad: "25 players were registered."
  if (n.key === 'eur.request') return n.params?.done !== undefined ? `\n\n${t('eur.registered', { n: Number(n.params.done) })}` : '';
  if (n.link?.kind !== 'offer') return '';
  const g = gs();
  // CM 01/02 "Offer contract to X" (0x8d7fb0): tilbuddets +0x10 læst levende – 1 "have offered a contract", 4 "have decided to withdraw the transfer bid"
  if (n.key === 'transfer.cmTalks') {
    const o = g.offers.find((x) => x.id === Number(n.link!.id));
    const st = !o ? 0 : (o.cmTalks?.state === 1 || o.cmTalks?.state === 5) && (o.status === 'negotiating' || o.status === 'completed') ? 1 : o.cmTalks?.state === 4 || o.status === 'collapsed' || o.status === 'withdrawn' ? 4 : 0;
    return st === 1 ? `\n\n${t('transfer.cmTalks.offered', { buyer: String(n.params.buyer ?? '') })}` : st === 4 ? `\n\n${t('transfer.cmTalks.withdrawn', { buyer: String(n.params.buyer ?? '') })}` : '';
  }
  // bytte-spilleren (flaget 0xa = 1): 1 "have offered a contract", 4 (handlen lukket uden tilbud) "have decided not to offer a contract" (0xa94b98)
  if (n.key === 'transfer.cmSwapTalks') {
    const o = g.offers.find((x) => x.id === Number(n.link!.id));
    const tk = o?.cmSwapTalks?.[Number(n.params.pid ?? -1)];
    const st = tk && tk.state !== 0 ? 1 : !o || o.status !== 'negotiating' || !tk ? (o?.status === 'completed' ? 0 : 4) : 0;
    return st === 1 ? `\n\n${t('transfer.cmSwapTalks.offered', { buyer: String(n.params.buyer ?? '') })}` : st === 4 ? `\n\n${t('transfer.cmSwapTalks.notOffered', { buyer: String(n.params.buyer ?? '') })}` : '';
  }
  const o = g.offers.find((x) => x.id === Number(n.link!.id));
  if (!o || o.seller !== g.userClub || o.status === 'pending') return '';
  const club = g.clubs[g.userClub]?.short ?? '';
  const k = o.status === 'rejected' ? 'transfer.ans.rejected' : o.status === 'countered' ? 'transfer.ans.countered' : o.status === 'negotiating' || o.status === 'accepted' || o.status === 'completed' ? 'transfer.ans.accepted' : '';
  return k ? `\n\n${t(k, { club, fee: moneyCm(offerAnswerFee(o), 6) })}` : ''; // 0x8d3520: flag 6
}

/** CM 01/02's transferanmodning (0xbbf, 0x4d8990): brødteksten af grundene i nyhedens pladser, og svaret under den */
function cmRequestBody(n: NewsItem): string {
  const p = n.params;
  const flags = Number(p.flags) >>> 0, sid = Number(p.sid), agent = !!p.agent;
  const words = requestReasons(flags, agent, Number(p.crep ?? 0), true, !!p.old)
    .map((k) => t(`cm.req.r.${k}`, { nation: natName(String(k === 'adapt' ? p.cnat ?? '' : p.nat ?? '')) }));
  const k = requestBodyKind(words.length, sid, flags, agent);
  const reasons = k.join === 'one' ? words[0] : k.join === 'two' ? t('cm.req.j.two', { a: words[0], b: words[1] })
    : k.join === 'three' ? t('cm.req.j.three', { a: words[0], b: words[1], c: words[2] })
    : k.join === 'some' ? t('cm.req.j.some', { a: words[k.pick![0]], b: words[k.pick![1]] }) : k.join === 'nightmare' ? t('cm.req.j.nightmare') : '';
  const body = t(`cm.req.b.${k.body}`, { player: String(p.player), full: String(p.full), club: String(p.club), reasons });
  return p.ans ? `${body}\n\n${t(p.ans === 1 ? 'cm.req.granted' : 'cm.req.turnedDown')}` : body;
}

export function newsBody(n: NewsItem) {
  if (n.key === 'board.update' && n.params?.lvl) return boardUpdate(n);
  if (n.key.startsWith('cmban.h')) return cmBanBody(n);
  if (n.key.startsWith('cmban.fa.')) return cmBanAnswerBody(n);
  if (n.key === 'cm.req') return cmRequestBody(n);
  if (n.key === 'cm.rum') return cmRumBody(n);
  const k = bodyKey(n);
  if (!has(k)) return '';
  // 0x8d4dd0: kompensationslinjen 0xa8f6ec, når +0x2f ≠ 0 og +0x1b ≠ 0
  const comp = n.key === 'transfer.cm7' && n.params?.fee ? t('transfer.cm7.comp', newsParams(n)) : '';
  const body = t(k, newsParams(n)) + comp + offerAnswer(n);
  // ældre nyheder uden de felter, brødteksten bruger: ingen brødtekst frem for {pladsholdere}
  return /\{[a-zA-Z]+\}/.test(body) ? '' : body;
}

export function useOpenLink() {
  const { nav } = useNav();
  return (n: NewsItem) => {
    const l = n.link;
    if (!l) return;
    if (l.kind === 'player') nav({ name: 'player', id: l.id });
    else if (l.kind === 'club') nav({ name: gs().jobOffers.includes(Number(l.id)) ? 'jobs' : 'club', id: l.id });
    else if (l.kind === 'fixture') nav(gs().reports[Number(l.id)] ? { name: 'report', id: l.id } : { name: 'fixtures' });
    else if (l.kind === 'offer') nav({ name: 'transfers', tab: 'offers' });
    else if (l.kind === 'comp') nav({ name: 'competitions', id: l.id });
    else if (l.kind === 'awards') nav({ name: 'awards', state: { awId: Number(l.id) } });
    else if (l.kind === 'press') nav({ name: 'press', id: l.id });
    else if (l.kind === 'chat') nav({ name: 'managers', id: l.id });
  };
}

// ---------- nyheder med links til spillere og klubber ----------

const CLUB_PARAMS = new Set(['club', 'from', 'to', 'opp', 'leader', 'buyer', 'seller']);
const PERSON_PARAMS = new Set(['manager', 'coach', 'scout', 'staff', 'name', 'runner', 'winner', 'who', 'person', 'applicant', 'candidate', 'sacked', 'successor', 'old', 'new', 'captain', 'physio', 'assistant']);
const MONEY_PARAMS = new Set(['fee', 'fee2', 'wage', 'balance', 'budget', 'bill', 'missing', 'amount', 'bid2', 'wage2']);

let nameIndex: { g: GameState; date: string; players: Map<string, number[]>; clubs: Map<string, number>; staff: Map<string, number[]>; nations: Map<string, number>; comps: Map<string, string> } | null = null;
onGameSwitch(() => { nameIndex = null; });

/** Opslag fra navn til id (nyhederne gemmer navne) – bygges én gang pr. spildag */
function names() {
  const g = gs();
  if (nameIndex && nameIndex.g === g && nameIndex.date === g.date) return nameIndex;
  const players = new Map<string, number[]>();
  for (const p of Object.values(g.players)) {
    const k = `${p.first} ${p.last}`.trim();
    const arr = players.get(k);
    if (arr) arr.push(p.id); else players.set(k, [p.id]);
  }
  const clubs = new Map<string, number>();
  for (const c of Object.values(g.clubs)) { clubs.set(c.name, c.id); if (!clubs.has(c.short)) clubs.set(c.short, c.id); }
  const staff = new Map<string, number[]>();
  for (const x of Object.values(g.staff)) { const k = `${x.first} ${x.last}`.trim(); const arr = staff.get(k); if (arr) arr.push(x.id); else staff.set(k, [x.id]); }
  const nations = new Map<string, number>();
  g.nations.forEach((nt, i) => { if (nt?.name) { nations.set(nt.name, i); const l = natName(nt.name); if (!nations.has(l)) nations.set(l, i); } });
  const comps = new Map<string, string>();
  for (const c of Object.values(g.comps)) { if (c.name) { comps.set(c.name, c.id); const l = compName(c.name); if (!comps.has(l)) comps.set(l, c.id); } }
  nameIndex = { g, date: g.date, players, clubs, staff, nations, comps };
  return nameIndex;
}

/** Find spilleren bag et navn: nyhedens eget link først, ellers et entydigt navn */
function playerFor(n: NewsItem, name: string): number | undefined {
  const g = gs();
  if (n.link?.kind === 'player') {
    const p = g.players[Number(n.link.id)];
    if (p && `${p.first} ${p.last}`.trim() === name) return p.id;
  }
  const ids = names().players.get(name);
  if (!ids?.length) return undefined;
  if (ids.length === 1) return ids[0];
  // flere med samme navn: foretræk den i ens egen klub
  return ids.find((id) => g.players[id]?.club === g.userClub);
}

function NewsLink({ kind, id, text }: { kind: 'player' | 'club' | 'staff' | 'nation' | 'comp'; id: number | string; text: string }) {
  const { nav } = useNav();
  const to: Route = kind === 'club' ? clubRoute(Number(id)) : kind === 'nation' ? nationRoute(Number(id)) : kind === 'comp' ? { name: 'competitions', id } as Route : { name: kind, id } as Route;
  return <a className="link" onClick={(e) => { e.stopPropagation(); nav(to); }}>{text}</a>;
}

/** Slå en tekstbid op som spiller / stabsperson / klub / nation / turnering (nyhedens eget link og entydige navne først) */
function entityFor(n: NewsItem, label: string): { kind: 'player' | 'club' | 'staff' | 'nation' | 'comp'; id: number | string } | undefined {
  const x = names();
  const pid = playerFor(n, label);
  if (pid) return { kind: 'player', id: pid };
  const sid = x.staff.get(label);
  if (sid?.length === 1) return { kind: 'staff', id: sid[0] };
  const cid = x.clubs.get(label);
  if (cid !== undefined) return { kind: 'club', id: cid };
  const nid = x.nations.get(label);
  if (nid !== undefined) return { kind: 'nation', id: nid };
  const comp = x.comps.get(label);
  if (comp !== undefined) return { kind: 'comp', id: comp };
  return undefined;
}

/**
 * Gør kendte navne i en færdig tekst (overskrift/brødtekst) til links: spillere og stab (fulde navne), klubber (navn/kortnavn),
 * nationer og turneringer – længste match først (op til fem ord), også med genitiv ("Coventry City's"). Teksten ændres ikke.
 */
export function autoLink(text: string, n: NewsItem, keyBase: string | number = 'a'): ReactNode {
  if (!text || !/\p{Lu}/u.test(text)) return text;
  const tokens = text.split(/( +|\n+)/); // ord og skilletegn skiftevis
  const out: ReactNode[] = [];
  let buf = '';
  const flush = () => { if (buf) { out.push(buf); buf = ''; } };
  for (let i = 0; i < tokens.length; ) {
    let hit: { kind: 'player' | 'club' | 'staff' | 'nation' | 'comp'; id: number | string; span: number; label: string; rest: string } | null = null;
    if (i % 2 === 0 && /^[\p{Lu}\p{N}]/u.test(tokens[i])) {
      for (let k = 5; k >= 1 && !hit; k--) {
        const sl = tokens.slice(i, i + k * 2 - 1);
        if (sl.length < k * 2 - 1 || sl.some((x, j) => j % 2 === 1 && x !== ' ')) continue;
        const raw = sl.join('');
        const m = /^(.*?)((?:'s|’s|'|’)?[.,!?:;"”)]*)$/su.exec(raw);
        const label = m ? m[1] : raw;
        if (label.length < 4 && k === 1) continue;
        if (!label) continue;
        const e = entityFor(n, label);
        if (e) hit = { ...e, span: k * 2 - 1, label, rest: raw.slice(label.length) };
      }
    }
    if (hit) {
      flush();
      out.push(<NewsLink key={`${keyBase}${i}`} kind={hit.kind} id={hit.id} text={hit.label} />);
      buf = hit.rest;
      i += hit.span;
    } else { buf += tokens[i]; i++; }
  }
  flush();
  return <Fragment key={keyBase}>{out.map((o, j) => (typeof o === 'string' ? <Fragment key={j}>{o}</Fragment> : o))}</Fragment>;
}

/** Oversæt en nyhedsskabelon, hvor spiller- og klubnavne bliver til links */
function linked(n: NewsItem, key: string): ReactNode {
  const tpl = t(key);
  const params = newsParams(n);
  const parts = tpl.split(/\{(\w+)\}/);
  return parts.map((part, i) => {
    if (i % 2 === 0) return <Fragment key={i}>{autoLink(part, n, `t${i}`)}</Fragment>;
    const v = params[part];
    if (v === undefined) return <Fragment key={i}></Fragment>;
    // klassisk: originalens nyheder (transfers 0x8d3520…0x8e51d0, kontrakter 0x4d4fb0, bøder 0x758fe0) viser beløbet fuldt + rundet (flag 6),
    // lønninger via 0x85e750 (flag 0xA)
    if (typeof v === 'number' && MONEY_PARAMS.has(part)) return <Fragment key={i}>{part.startsWith('wage') ? moneyWage(v) : moneyCm(v, 6)}</Fragment>;
    const text = String(v);
    if (part === 'player') {
      const id = playerFor(n, text);
      if (id) return <NewsLink key={i} kind="player" id={id} text={text} />;
    } else if (CLUB_PARAMS.has(part)) {
      const id = names().clubs.get(text);
      if (id) return <NewsLink key={i} kind="club" id={id} text={text} />;
    } else if (part === 'last' && typeof params.player === 'string') {
      // overskrifter med efternavn ("Kim Rømer's contract expires"): linket går til spilleren i brødtekstens {player}
      const id = playerFor(n, params.player);
      if (id) return <NewsLink key={i} kind="player" id={id} text={text} />;
    } else if (PERSON_PARAMS.has(part)) {
      // øvrige personer (managere, trænere, spejdere, ansøgere …): spiller først, ellers stab/manager med entydigt navn
      const id = playerFor(n, text);
      if (id) return <NewsLink key={i} kind="player" id={id} text={text} />;
      const sid = names().staff.get(text);
      if (sid?.length === 1) return <NewsLink key={i} kind="staff" id={sid[0]} text={text} />;
    }
    return <Fragment key={i}>{typeof v === 'number' ? text : autoLink(text, n, `v${i}`)}</Fragment>;
  });
}

/**
 * Fritekst (chat) hvor spiller- og klubnavne bliver til links. Fulde navne slås op i hele verden;
 * et efternavn alene kun blandt spillerne i de klubber, samtalen handler om.
 */
export function LinkedText({ text, clubs = [] }: { text: string; clubs?: number[] }) {
  const g = gs();
  const idx = names();
  const local = new Map<string, number>();
  for (const c of clubs) for (const p of Object.values(g.players)) if (p.club === c && p.last.length >= 3) local.set(p.last.toLowerCase(), local.has(p.last.toLowerCase()) ? -1 : p.id);
  const tokens = text.split(/(\s+)/);
  const out: ReactNode[] = [];
  for (let i = 0; i < tokens.length; ) {
    let hit: { kind: 'player' | 'club'; id: number; span: number; label: string } | null = null;
    // længste match først: op til fire ord
    for (let n = 4; n >= 1 && !hit; n--) {
      const parts = tokens.slice(i, i + n * 2 - 1);
      if (parts.length < n * 2 - 1 || /^\s/.test(parts[0])) continue;
      const raw = parts.join('');
      const label = raw.replace(/[.,!?:;"'”“)]+$/u, '');
      const ids = idx.players.get(label);
      const pid = ids?.length === 1 ? ids[0] : ids?.find((id) => clubs.includes(g.players[id]?.club));
      if (pid) hit = { kind: 'player', id: pid, span: n * 2 - 1, label };
      else if (n >= 2 || label.length >= 4) { const cid = idx.clubs.get(label); if (cid) hit = { kind: 'club', id: cid, span: n * 2 - 1, label }; }
      if (!hit && n === 1 && /^\p{Lu}/u.test(label)) { const l = local.get(label.toLowerCase()); if (l && l > 0) hit = { kind: 'player', id: l, span: 1, label }; }
    }
    if (hit) {
      const raw = tokens.slice(i, i + hit.span).join('');
      out.push(<NewsLink key={i} kind={hit.kind} id={hit.id} text={hit.label} />);
      if (raw.length > hit.label.length) out.push(<Fragment key={`${i}t`}>{raw.slice(hit.label.length)}</Fragment>);
      i += hit.span;
    } else { out.push(<Fragment key={i}>{tokens[i]}</Fragment>); i++; }
  }
  return <>{out}</>;
}

export function NewsTitle({ n }: { n: NewsItem }) {
  return <>{linked(n, n.key)}</>;
}

export function NewsBody({ n }: { n: NewsItem }) {
  if (n.key === 'board.update' && n.params?.lvl) return <>{autoLink(boardUpdate(n), n)}</>;
  if (n.key.startsWith('cmban.h')) return <>{autoLink(cmBanBody(n), n)}</>;
  if (n.key.startsWith('cmban.fa.')) return <>{autoLink(cmBanAnswerBody(n), n)}</>;
  if (n.key === 'cm.req') return <>{autoLink(cmRequestBody(n), n)}</>;
  if (n.key === 'cm.rum') return <>{autoLink(cmRumBody(n), n)}</>;
  const k = bodyKey(n);
  return has(k) ? <>{linked(n, k)}{autoLink(offerAnswer(n), n, 'oa')}</> : null;
}

/** Ugens transferoverblik: alle handlerne i en lille tabel (vises under brødteksten) */
export function NewsDeals({ n }: { n: NewsItem }) {
  if (!n.deals?.length) return null;
  const g = gs();
  return (
    <>
      <table className="grid deals" style={{ marginTop: 8 }}>
        <tbody>
          {n.deals.map((d, i) => (
            <tr key={i}>
              <td><PlayerLink p={g.players[d.player]} /></td>
              <td>{d.from ? <ClubLink id={d.from} /> : <span className="muted">{t('common.free')}</span>} → <ClubLink id={d.to} /></td>
              <td className="num">{d.loan ? t('tr.loan') : d.fee ? money(d.fee) : t('transfer.digestFree')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
