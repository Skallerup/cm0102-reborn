import { useMemo, useState } from 'react';
import { naturalRole } from '../../game/attributes';
import { ageOn } from '../../game/dates';
import { knowledgeOf, scoutStars } from '../../game/scouting';
import { notify } from '../../game/state';
import { acceptCounter, respondToOffer, transferRealism } from '../../game/transfers';
import type { Player, Role, TransferOffer } from '../../game/types';
import { currencySymbol, dateFmt, fromCur, money, t, toCur } from '../../i18n';
import { ClubLink, Nat, Panel, PlayerLink, Stars, Table, Tabs, posStr, type Col } from '../components';
import { useGame, useNav } from '../core';
import { Head } from './common';
import { NegotiationModal } from './Negotiation';

const ROLES: (Role | '')[] = ['', 'GK', 'CB', 'FB', 'DM', 'CM', 'WM', 'AM', 'W', 'ST'];

export function Transfers({ tab: initial }: { tab?: string }) {
  const [tab, setTab] = useState(initial ?? 'search');
  const g = useGame()!;
  const pending = g.offers.filter((o) => o.status === 'pending' && o.seller === g.userClub).length;
  return (
    <div>
      <Head title={t('nav.transfers')}>
        <Tabs tabs={[['search', t('tr.search')], ['shortlist', `${t('tr.shortlist')} (${g.shortlist.length})`], ['offers', `${t('tr.offers')}${pending ? ` (${pending})` : ''}`], ['listed', t('tr.listed')]]} value={tab} onChange={setTab} />
      </Head>
      {tab === 'search' && <Search />}
      {tab === 'shortlist' && <PlayerList players={g.shortlist.map((id) => g.players[id]).filter(Boolean)} />}
      {tab === 'offers' && <Offers />}
      {tab === 'listed' && <PlayerList players={Object.values(g.players).filter((p) => p.listed && p.club !== g.userClub).slice(0, 400)} />}
    </div>
  );
}

function RealismTag({ p }: { p: Player }) {
  const r = transferRealism(p);
  const cls = r.level === 0 ? 'good' : r.level === 1 ? 'warn' : 'bad';
  return <span className={`tag ${cls}`} title={r.reasons.map((k) => t(k)).join('\n')}>{t(`real.level${r.level}`)}</span>;
}

function PlayerList({ players, initialSort = 'val' }: { players: Player[]; initialSort?: string }) {
  const g = useGame()!;
  const { nav } = useNav();
  const cols: Col<Player>[] = [
    ...(g.userClub ? [{ key: 'real', label: t('real.col'), render: (p: Player) => <RealismTag p={p} />, sort: (p: Player) => { const r = transferRealism(p); return -r.level * 100 + r.score; }, title: t('real.hint') }] : []),
    { key: 'name', label: t('col.name'), render: (p) => <PlayerLink p={p} />, sort: (p) => p.last },
    { key: 'pos', label: t('col.pos'), render: (p) => posStr(p) },
    { key: 'age', label: t('col.age'), render: (p) => ageOn(p.dob, g.date), sort: (p) => ageOn(p.dob, g.date), className: 'num' },
    { key: 'nat', label: t('col.nat'), render: (p) => <Nat n={p.nation} /> },
    { key: 'club', label: t('col.club'), render: (p) => (p.club ? <ClubLink id={p.club} /> : <span className="muted">{t('common.free')}</span>) },
    { key: 'ab', label: t('player.ability'), render: (p) => <Stars range={scoutStars(p).ability} />, sort: (p) => { const s = scoutStars(p).ability; return s[0] + s[1]; } },
    { key: 'pot', label: t('player.potential'), render: (p) => <Stars range={scoutStars(p).potential} />, sort: (p) => { const s = scoutStars(p).potential; return s[0] + s[1]; } },
    { key: 'val', label: t('col.value'), render: (p) => money(p.value), sort: (p) => p.value, className: 'num' },
    { key: 'exp', label: t('col.expires'), render: (p) => (p.contract ? p.contract.expires.slice(0, 4) : '-'), sort: (p) => p.contract?.expires ?? '' },
    { key: 'k', label: t('tr.known'), render: (p) => `${Math.round(knowledgeOf(p))}%`, sort: (p) => knowledgeOf(p), className: 'num' },
  ];
  return <Table rows={players} cols={cols} rowKey={(p) => p.id} onRow={(p) => nav({ name: 'player', id: p.id })} initialSort={initialSort} limit={250} />;
}

function Search() {
  const g = useGame()!;
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role | ''>('');
  const [minAge, setMinAge] = useState(15);
  const [maxAge, setMaxAge] = useState(40);
  const [maxValue, setMaxValue] = useState(0);
  const [nation, setNation] = useState(-1);
  const [league, setLeague] = useState('');
  const [onlyFree, setOnlyFree] = useState(false);
  const [onlyListed, setOnlyListed] = useState(false);
  const [expiring, setExpiring] = useState(false);
  const [onlyKnown, setOnlyKnown] = useState(false);
  const [realism, setRealism] = useState(0); // 0 alle, 1 realistiske, 2 realistiske + måske
  const nations = useMemo(() => [...new Set(Object.values(g.players).map((p) => p.nation))].sort((a, b) => g.nations[a].name.localeCompare(g.nations[b].name)), [g]);
  const seasonEnd = `${Number(g.date.slice(0, 4)) + (Number(g.date.slice(5, 7)) >= 7 ? 1 : 0)}-06-30`;
  const results = useMemo(() => {
    const q = name.trim().toLowerCase();
    const out: Player[] = [];
    for (const p of Object.values(g.players)) {
      if (p.club === g.userClub) continue;
      if (q && !`${p.first} ${p.last}`.toLowerCase().includes(q)) continue;
      const a = ageOn(p.dob, g.date);
      if (a < minAge || a > maxAge) continue;
      if (maxValue && p.value > maxValue) continue;
      if (nation >= 0 && p.nation !== nation) continue;
      if (league && g.clubs[p.club]?.league !== league) continue;
      if (onlyFree && p.club) continue;
      if (onlyListed && !p.listed) continue;
      if (expiring && (!p.contract || p.contract.expires > seasonEnd)) continue;
      if (onlyKnown && knowledgeOf(p) < 50) continue;
      if (role && naturalRole(p) !== role) continue;
      if (realism) {
        const r = transferRealism(p);
        if (r.level > (realism === 1 ? 0 : 1)) continue;
      }
      out.push(p);
      if (out.length > 3000) break;
    }
    return out;
  }, [g, name, role, minAge, maxAge, maxValue, nation, league, onlyFree, onlyListed, expiring, onlyKnown, seasonEnd, realism]);
  return (
    <div>
      <Panel title={t('tr.filters')}>
        <div className="row">
          <input placeholder={t('tr.name')} value={name} onChange={(e) => setName(e.target.value)} />
          <select value={role} onChange={(e) => setRole(e.target.value as Role | '')}>{ROLES.map((r) => <option key={r} value={r}>{r ? t(`role.${r}`) : t('tr.anyPos')}</option>)}</select>
          <label>{t('col.age')} <input type="number" value={minAge} onChange={(e) => setMinAge(Number(e.target.value))} style={{ width: 50 }} />–<input type="number" value={maxAge} onChange={(e) => setMaxAge(Number(e.target.value))} style={{ width: 50 }} /></label>
          <select value={maxValue} onChange={(e) => setMaxValue(Number(e.target.value))}>
            <option value={0}>{t('tr.anyValue')}</option>
            {[250_000, 500_000, 1_000_000, 2_500_000, 5_000_000, 10_000_000, 25_000_000, 50_000_000].map((v) => <option key={v} value={v}>≤ {money(v)}</option>)}
          </select>
          <select value={nation} onChange={(e) => setNation(Number(e.target.value))}>
            <option value={-1}>{t('tr.anyNation')}</option>
            {nations.map((n) => <option key={n} value={n}>{g.nations[n].name}</option>)}
          </select>
          <select value={league} onChange={(e) => setLeague(e.target.value)}>
            <option value="">{t('tr.anyLeague')}</option>
            {g.leagueOrder.filter((l) => g.leagues[l]).map((l) => <option key={l} value={l}>{g.nations[g.leagues[l].nation]?.name} – {g.leagues[l].name}</option>)}
          </select>
        </div>
        <div className="row" style={{ marginTop: 6 }}>
          {g.userClub > 0 && (
            <select value={realism} onChange={(e) => setRealism(Number(e.target.value))} title={t('real.hint')}>
              <option value={0}>{t('real.all')}</option>
              <option value={1}>{t('real.only')}</option>
              <option value={2}>{t('real.maybe')}</option>
            </select>
          )}
          <label className="row"><input type="checkbox" checked={onlyFree} onChange={(e) => setOnlyFree(e.target.checked)} />{t('tr.free')}</label>
          <label className="row"><input type="checkbox" checked={onlyListed} onChange={(e) => setOnlyListed(e.target.checked)} />{t('tr.listedOnly')}</label>
          <label className="row"><input type="checkbox" checked={expiring} onChange={(e) => setExpiring(e.target.checked)} />{t('tr.expiring')}</label>
          {g.options.masking && <label className="row"><input type="checkbox" checked={onlyKnown} onChange={(e) => setOnlyKnown(e.target.checked)} />{t('tr.knownOnly')}</label>}
          <span className="muted">{results.length > 3000 ? '3000+' : results.length} {t('tr.results')}</span>
        </div>
      </Panel>
      <PlayerList players={results} initialSort={realism ? 'real' : 'val'} />
    </div>
  );
}

function Offers() {
  const g = useGame()!;
  const [neg, setNeg] = useState<TransferOffer | null>(null);
  const [counter, setCounter] = useState<Record<number, number>>({});
  const incoming = g.offers.filter((o) => o.seller === g.userClub && o.buyer !== g.userClub).slice().reverse();
  const outgoing = g.offers.filter((o) => o.buyer === g.userClub).slice().reverse();
  const status = (o: TransferOffer) => <span className={`tag ${o.status === 'completed' ? 'good' : ['rejected', 'collapsed', 'withdrawn'].includes(o.status) ? 'bad' : 'warn'}`}>{t(`offer.${o.status}`)}</span>;
  return (
    <div className="cols2">
      <Panel title={t('tr.incoming')} className="flush">
        <table className="grid">
          <tbody>
            {incoming.length === 0 && <tr><td className="muted">{t('common.none')}</td></tr>}
            {incoming.map((o) => (
              <tr key={o.id}>
                <td><PlayerLink p={g.players[o.player]} /></td>
                <td><ClubLink id={o.buyer} /></td>
                <td className="num">{money(o.fee)}</td>
                <td>{status(o)}</td>
                <td>
                  {o.status === 'pending' && (
                    <div className="row">
                      <button className="small primary" onClick={() => { respondToOffer(o.id, 'accept'); notify(); }}>{t('offer.accept')}</button>
                      <button className="small" onClick={() => { respondToOffer(o.id, 'reject'); notify(); }}>{t('offer.reject')}</button>
                      <input type="number" style={{ width: 100 }} placeholder={`${t('offer.counterAmount')} (${currencySymbol()})`} value={counter[o.id] ? toCur(counter[o.id]) : ''} onChange={(e) => setCounter({ ...counter, [o.id]: fromCur(Number(e.target.value)) })} />
                      <button className="small" disabled={!counter[o.id]} onClick={() => { respondToOffer(o.id, 'counter', counter[o.id]); notify(); }}>{t('offer.counter')}</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
      <Panel title={t('tr.outgoing')} className="flush">
        <table className="grid">
          <tbody>
            {outgoing.length === 0 && <tr><td className="muted">{t('common.none')}</td></tr>}
            {outgoing.map((o) => (
              <tr key={o.id}>
                <td><PlayerLink p={g.players[o.player]} /></td>
                <td>{o.seller ? <ClubLink id={o.seller} /> : t('common.free')}</td>
                <td className="num">{o.loan ? t('tr.loan') : o.preContract ? t('neg.bosman') : money(o.fee)}{o.counter && o.status === 'countered' ? ` → ${money(o.counter)}` : ''}</td>
                <td>{status(o)} <span className="muted">{dateFmt(o.created)}</span></td>
                <td>
                  {o.status === 'negotiating' && <button className="small primary" onClick={() => setNeg(o)}>{t('offer.negotiate')}</button>}
                  {o.status === 'countered' && <button className="small primary" onClick={() => { const r = acceptCounter(o.id); notify(); if (r === 'ok') setNeg(o); }}>{t('offer.acceptCounter')}</button>}
                  {['pending', 'countered', 'negotiating'].includes(o.status) && <button className="small" onClick={() => { o.status = 'withdrawn'; notify(); }}>{t('offer.withdraw')}</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
      {neg && <NegotiationModal offer={neg} onClose={() => setNeg(null)} />}
    </div>
  );
}
