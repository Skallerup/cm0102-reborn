import { Fragment, type ReactNode } from 'react';
import { compName, dateFmt, has, money, natName, t } from '../../i18n';
import { useNav } from '../core';
import { ClubLink, PlayerLink } from '../components';
import type { NewsItem } from '../../game/types';
import { gs } from '../../game/state';
import { requestBodyKind, requestReasons } from '../../game/cmTransferList';
import type { GameState } from '../../game/types';
import { isRetro } from '../theme';
import { ClassicHead } from '../classic';

/** action: kun klassisk tema – fx en Action-menu i titelbjælkens højre hjørne */
export function Head({ title, children, action, menu }: { title: ReactNode; children?: ReactNode; action?: ReactNode; menu?: boolean }) {
  const { back, canBack } = useNav();
  // klassisk tema: titelbjælke + hub-faner (Tilbage ligger i den brede bundbjælke)
  if (isRetro()) return <ClassicHead title={title} action={action} menu={menu}>{children}</ClassicHead>;
  return (
    <div className="screen-head">
      {canBack && <button className="back small" onClick={back}>‹ {t('common.back')}</button>}
      <h2>{title}</h2>
      <div className="grow" />
      {children}
    </div>
  );
}

export function newsParams(n: NewsItem): Record<string, string | number> {
  const p: Record<string, string | number> = { ...n.params };
  if (typeof p.injury === 'string') { p.injury = t(`injury.${p.injury}`); p.injuryLc = String(p.injury).toLowerCase(); }
  // originalens skadenyhed: periodens ord ("about three weeks") og skaden med lille forbogstav i brødteksten
  if (typeof p.range === 'string' && p.range.startsWith('injury.r.')) p.range = t(p.range);
  if (n.key.startsWith('injury.o.')) p.injury = p.injuryLc;
  if (typeof p.comp === 'string') p.comp = compName(p.comp) ?? p.comp;
  // spillerens grunde til at afvise et skifte (cmWhy): "k:argument|k" → "han vil ikke … og …"
  if (typeof p.why === 'string' && p.why) {
    const parts = p.why.split('|').map((w) => {
      const i = w.indexOf(':'), k = i < 0 ? w : w.slice(0, i), a = i < 0 ? '' : w.slice(i + 1);
      return t(`cm.why.${k}`, { club: a, nation: a, comp: compName(a) ?? a, continent: k === 'continent' ? t(`cm.why.cont.${a}`) : a });
    });
    p.reasons = parts.join(` ${t('cm.why.and')} `);
  }
  // månedens priser (CM 01/02: "<spiller> wins February award"): måneden før nyhedens dato
  if (n.key.startsWith('award.month') && p.month === undefined) {
    const d = new Date(`${n.date.slice(0, 7)}-15T00:00:00Z`); d.setUTCMonth(d.getUTCMonth() - 1);
    try { p.month = d.toLocaleDateString(t('cl.locale'), { month: 'long', timeZone: 'UTC' }); } catch { p.month = d.toISOString().slice(5, 7); }
  }
  if (typeof p.tour === 'string') p.tour = t(`intl.name.${p.tour}`);
  // Discipline Player: grunden med små bogstaver som originalens 0x5a73a0(…, 1)
  if (n.key.startsWith('cmfine.') && typeof p.why === 'number') p.reason = t(`cmfine.why.${p.why}`);
  if (n.key === 'eur.request' && typeof p.phase === 'string') p.phase = t(`eur.phase.${p.phase}`);
  // "Four players from Man Utd …" (uden navneliste)
  if ((n.key === 'intl.selN' || n.key === 'intl.tourSel') && !n.params?.names && typeof p.n === 'number' && has(`num.${p.n}`)) p.n = t(`num.${p.n}`);
  // andre klubbers handler (CM 01/02): "The fee may be increased to £6,750,000 depending on appearances." og "… from Tottenham"
  if (n.key.startsWith('transfer.o')) {
    p.more = typeof p.fee2 === 'number' ? `\n\n${t('transfer.o.more', { fee2: money(p.fee2) })}` : '';
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
  if (n.key.startsWith('staffrep.')) for (const k of ['prone', 'cond', 'inj', 'now', 'future']) if (typeof p[k] === 'string' && p[k]) p[k] = t(String(p[k]));
  if (n.key.startsWith('intl.')) { if (typeof p.nation === 'string') p.nation = natName(p.nation); if (typeof p.runnerUp === 'string') p.runnerUp = natName(p.runnerUp); if (typeof p.opp === 'string' && p.opp) p.opp = natName(p.opp); }
  // "Ryan Giggs and Matthew Williams" (navnene gemmes med & imellem)
  if (typeof p.names === 'string' && p.names.includes(' & ')) { const ns = p.names.split(' & '); p.names = `${ns.slice(0, -1).join(', ')} ${t('common.and')} ${ns.at(-1)}`; }
  // scoutrapporten (CM 01/02): hvor han blev set, dommen og bemærkningerne sættes sammen af nøglerne
  if (n.key === 'scout.report') {
    p.where = p.ctx === 'weeks' ? t('scout.ctx.weeks', { age: p.age, pos: t(`role.${p.pos}`).toLowerCase() }) : t(`scout.ctx.${p.ctx}`, { club: p.club, score: p.score, opp: p.opp });
    p.verdict = t(`scout.v.${p.verdict}`, { club: p.myClub });
    p.extras = [p.strength ? t('scout.x.strength', { what: t(`scout.str.${p.strength}`) }) : '', p.skill ? t('scout.x.skill', { what: t(`scout.skill.${p.skill}`) }) : '',
      p.weakness ? t('scout.x.weakness', { what: t(`scout.weak.${p.weakness}`) }) : '', p.permit ? t('scout.x.permit') : ''].filter(Boolean).join(' ');
  }
  return p;
}

export function newsTitle(n: NewsItem) {
  return t(n.key, newsParams(n));
}

/** Hvilken skabelon brødteksten bruger (nogle nyheder har varianter efter indholdet) */
function bodyKey(n: NewsItem): string {
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
  const o = g.offers.find((x) => x.id === Number(n.link!.id));
  if (!o || o.seller !== g.userClub || o.status === 'pending') return '';
  const club = g.clubs[g.userClub]?.short ?? '';
  const k = o.status === 'rejected' ? 'transfer.ans.rejected' : o.status === 'countered' ? 'transfer.ans.countered' : o.status === 'negotiating' || o.status === 'accepted' || o.status === 'completed' ? 'transfer.ans.accepted' : '';
  return k ? `\n\n${t(k, { club, fee: money(o.counter ?? o.fee) })}` : '';
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
  if (n.key === 'cm.req') return cmRequestBody(n);
  const k = bodyKey(n);
  if (!has(k)) return '';
  const body = t(k, newsParams(n)) + offerAnswer(n);
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
    else if (l.kind === 'awards') nav({ name: 'awards' });
    else if (l.kind === 'press') nav({ name: 'press', id: l.id });
    else if (l.kind === 'chat') nav({ name: 'managers', id: l.id });
  };
}

// ---------- nyheder med links til spillere og klubber ----------

const CLUB_PARAMS = new Set(['club', 'from', 'to', 'opp', 'leader', 'buyer', 'seller']);
const MONEY_PARAMS = new Set(['fee', 'fee2', 'wage', 'balance', 'budget', 'bill', 'missing', 'amount', 'bid2', 'wage2']);

let nameIndex: { g: GameState; date: string; players: Map<string, number[]>; clubs: Map<string, number> } | null = null;

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
  nameIndex = { g, date: g.date, players, clubs };
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

function NewsLink({ kind, id, text }: { kind: 'player' | 'club'; id: number; text: string }) {
  const { nav } = useNav();
  return <a className="link" onClick={(e) => { e.stopPropagation(); nav({ name: kind, id }); }}>{text}</a>;
}

/** Oversæt en nyhedsskabelon, hvor spiller- og klubnavne bliver til links */
function linked(n: NewsItem, key: string): ReactNode {
  const tpl = t(key);
  const params = newsParams(n);
  const parts = tpl.split(/\{(\w+)\}/);
  return parts.map((part, i) => {
    if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>;
    const v = params[part];
    if (v === undefined) return <Fragment key={i}></Fragment>;
    if (typeof v === 'number' && MONEY_PARAMS.has(part)) return <Fragment key={i}>{money(v)}</Fragment>;
    const text = String(v);
    if (part === 'player') {
      const id = playerFor(n, text);
      if (id) return <NewsLink key={i} kind="player" id={id} text={text} />;
    } else if (CLUB_PARAMS.has(part)) {
      const id = names().clubs.get(text);
      if (id) return <NewsLink key={i} kind="club" id={id} text={text} />;
    }
    return <Fragment key={i}>{text}</Fragment>;
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
  if (n.key === 'board.update' && n.params?.lvl) return <>{boardUpdate(n)}</>;
  if (n.key === 'cm.req') return <>{cmRequestBody(n)}</>;
  const k = bodyKey(n);
  return has(k) ? <>{linked(n, k)}{offerAnswer(n)}</> : null;
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
