import { Fragment, type ReactNode } from 'react';
import { dateFmt, has, money, t } from '../../i18n';
import { useNav } from '../core';
import { ClubLink, PlayerLink } from '../components';
import type { NewsItem } from '../../game/types';
import { gs } from '../../game/state';
import type { GameState } from '../../game/types';

export function Head({ title, children }: { title: ReactNode; children?: ReactNode }) {
  const { back, canBack } = useNav();
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
  if (typeof p.injury === 'string') p.injury = t(`injury.${p.injury}`);
  if (typeof p.lane === 'string') p.lane = t(`lane.${p.lane}`);
  if (p.kind === 'transfer' || p.kind === 'wage') p.kind = t(`board.kind.${p.kind}`);
  if (p.kind === 'stadium' || p.kind === 'training' || p.kind === 'youth') p.kind = t(`proj.kind.${p.kind}`);
  if (typeof p.done === 'string') p.done = dateFmt(p.done);
  if (typeof p.cost === 'number') p.cost = money(p.cost);
  if (n.key === 'staff.hired' && typeof p.role === 'string' && ['assistant', 'coach', 'physio', 'scout'].includes(p.role)) p.role = t(`role.staff.${p.role}`);
  if (typeof p.id === 'string' && n.key.startsWith('challenge.')) p.id = t(`challenge.${p.id}.title`);
  return p;
}

export function newsTitle(n: NewsItem) {
  return t(n.key, newsParams(n));
}

export function newsBody(n: NewsItem) {
  const k = `${n.key}.body`;
  return has(k) ? t(k, newsParams(n)) : '';
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
const MONEY_PARAMS = new Set(['fee', 'wage', 'balance']);

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

export function NewsTitle({ n }: { n: NewsItem }) {
  return <>{linked(n, n.key)}</>;
}

export function NewsBody({ n }: { n: NewsItem }) {
  const k = `${n.key}.body`;
  const body = has(k) ? <>{linked(n, k)}</> : null;
  if (!n.deals?.length) return body;
  const g = gs();
  // ugens transferoverblik: alle handlerne i en lille tabel
  return (
    <>
      {body}
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
