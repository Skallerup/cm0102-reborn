// Squad Numbers (som i CM 01/02): hver spiller har et fast trøjenummer i klubben. Vælg et nyt nummer – har en
// holdkammerat det i forvejen, bytter de to numre.
import { authentic } from '../../game/rules';
import { ClassicFoot } from '../classic';
import { useState } from 'react';
import { act } from '../../game/actions';
import { gs, squad } from '../../game/state';
import { POSITIONS, type Player } from '../../game/types';
import { t } from '../../i18n';
import { PlayerLink, posStr } from '../components';
import { askConfirm } from '../confirm';
import { useGame, useNav } from '../core';
import { coarse } from './runs';

/** Primær position (GK først … angribere sidst), som truppens sortering */
const POS_ORDER = (p: Player) => {
  const order = ['GK', 'SW', 'D', 'WB', 'DM', 'M', 'AM', 'ST'];
  const best = Math.max(...p.pos);
  return Math.min(...POSITIONS.map((k, i) => (p.pos[i] >= Math.min(15, best) ? order.indexOf(k) : 99)));
};

export function SquadNumbers({ players, classic = false }: { players: Player[]; classic?: boolean }) {
  const byNum = new Map(players.filter((p) => p.number).map((p) => [p.number!, p]));
  const list = players.slice().sort((a, b) => (a.number ?? 100) - (b.number ?? 100) || a.last.localeCompare(b.last));
  return (
    <div className={classic ? 'cx-numbers' : 'panel squad-numbers'}>
      <p className={classic ? 'cx-numbers-hint' : 'muted'}>{t('sqn.hint')}</p>
      <table className={classic ? 'cx-table' : 'table'}>
        <thead><tr><th className="num">#</th><th>{t('col.pos')}</th><th>{t('col.name')}</th><th>{t('sqn.change')}</th></tr></thead>
        <tbody>
          {list.map((p) => (
            <tr key={p.id}>
              <td className="num"><b className="sqn-num">{p.number ?? '–'}</b></td>
              <td>{posStr(p)}</td>
              <td><PlayerLink p={p} /></td>
              <td>
                <select aria-label={t('sqn.change')} value={p.number ?? ''} onChange={(e) => act({ t: 'squadNumber', pid: p.id, n: Number(e.target.value) })}>
                  {Array.from({ length: 99 }, (_, i) => i + 1).map((n) => {
                    const o = byNum.get(n);
                    return <option key={n} value={n}>{n}{o && o.id !== p.id ? ` – ${o.last} (${t('sqn.swap')})` : ''}</option>;
                  })}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Klassisk: originalens "<klub> Squad Numbers" (målt 9/11-2026). To talrækker 1-25 og 26-50 (ledige numre er lyse), spillerne
 * i to kolonner med det blå nummerfelt. Træk et nummer fra rækken over på en spiller; klik på et nummer i rækken eller på en
 * spillers felt for at gøre det ledigt (som i originalen). Uden mus: klik et nummer i rækken og derefter spillerens felt.
 * Auto/Clear som i originalen (Autos fordeling er *estimeret*), Back fortryder, Submit spørger og sender listen.
 */
export function ClassicSquadNumbers({ onClose, missing = false }: { onClose?: () => void; missing?: boolean }) {
  const g = useGame()!;
  const { nav } = useNav();
  // før en kamp (CM 01/02): kun spillerne uden nummer, og kun de ledige numre kan vælges
  const [only] = useState(() => (missing ? new Set(squad(g.userClub).filter((p) => !p.reserves && !p.number).map((p) => p.id)) : null));
  const all = squad(g.userClub).filter((p) => !p.reserves);
  const players = all.filter((p) => !only || only.has(p.id)).sort((a, b) => POS_ORDER(a) - POS_ORDER(b) || b.ca - a.ca);
  const others = only ? all.filter((p) => !only.has(p.id) && p.number) : [];
  const initial = () => Object.fromEntries(players.map((p) => [p.id, p.number ?? 0])) as Record<number, number>;
  const [nums, setNums] = useState<Record<number, number>>(initial);
  const [picked, setPicked] = useState<number | null>(null);
  const holder = (n: number) => players.find((p) => nums[p.id] === n);
  const lockedN = (n: number) => others.some((p) => p.number === n);
  const assign = (pid: number, n: number) => setNums((cur) => {
    const next = { ...cur };
    for (const [id, v] of Object.entries(next)) if (v === n) next[Number(id)] = 0;
    next[pid] = n;
    return next;
  });
  const clickStrip = (n: number) => {
    const h = holder(n);
    if (h) setNums((cur) => ({ ...cur, [h.id]: 0 }));
    setPicked(n);
  };
  const clickBox = (pid: number) => {
    if (picked !== null) { assign(pid, picked); setPicked(null); return; }
    setNums((cur) => ({ ...cur, [pid]: 0 }));
  };
  const auto = () => setNums((cur) => {
    const next = { ...cur };
    const used = new Set(Object.values(next).filter(Boolean));
    for (const p of players) {
      if (next[p.id]) continue;
      const n = Array.from({ length: 99 }, (_, i) => i + 1).find((k) => !used.has(k) && (p.pos[0] >= 15 ? k === 1 || k === 13 || k > 20 : k > 1));
      if (n) { next[p.id] = n; used.add(n); }
    }
    return next;
  });
  const submit = async () => {
    if (!(await askConfirm(t(only ? 'sqn.confirmChanges' : 'sqn.confirm'), { head: t('sqn.confirmHead') }))) return;
    act({ t: 'squadNumbers', nums });
    onClose?.();
    // før en kamp: videre til "Proceed to the match ?"
    const go = gs().pendingFixture;
    if (only && go && (await askConfirm(t('cl.mt.proceed'), { head: t('cl.mt.confirm') }))) nav({ name: 'match', id: go });
  };
  const strip = (from: number) => (
    <div className="cx-sqn-strip">
      {Array.from({ length: 25 }, (_, i) => from + i).map((n) => (
        <button key={n} className={`cx-sqn-n ${holder(n) || lockedN(n) ? '' : 'free'} ${picked === n ? 'on' : ''}`} disabled={lockedN(n)} draggable={!coarse() && !lockedN(n)}
          onDragStart={(e) => e.dataTransfer.setData('text/sqn', String(n))} onClick={() => clickStrip(n)}>{n}</button>
      ))}
    </div>
  );
  return (
    <div className="cx-sqn">
      {onClose && <div className="cx-subtitle">{t('sqn.please')}</div>}
      <div className="cx-sqn-bar">
        <span className="cx-grow" />
        <button className="cx-grey" onClick={auto}>{t('sqn.auto')}</button>
        <button className="cx-grey" onClick={() => setNums(Object.fromEntries(players.map((p) => [p.id, 0])))}>{t('sqn.clear')}</button>
      </div>
      {strip(1)}
      <div className="cx-sqn-list">
        {players.map((p) => (
          <div key={p.id} className="cx-sqn-row">
            <span className={`cx-sqn-box ${picked !== null ? 'target' : ''}`} data-pid={p.id} role="button" tabIndex={0} title={t('sqn.dragHint')}
              onClick={() => clickBox(p.id)} onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const n = Number(e.dataTransfer.getData('text/sqn')); if (n) { assign(p.id, n); setPicked(null); } }}>{nums[p.id] || ''}</span>
            <span className="cx-sqn-tag">{p.injury ? <i className="inj">{t('cl.tag.Inj')}</i> : null}</span>
            <PlayerLink p={p} />
            <span className="cx-sqn-pos">{posStr(p)}</span>
          </div>
        ))}
      </div>
      {strip(26)}
      {/* CM 01/02 har ingen hjælpetekst under talrækkerne */}
      {!authentic() && <p className="cx-sqn-hint">{t('sqn.dragHint')}</p>}
      <ClassicFoot cols="3fr 1fr">
        <button onClick={() => (onClose ? onClose() : (setNums(initial()), setPicked(null)))}>{t('common.back')}</button>
        <button className="primary" onClick={() => void submit()}>{t('sqn.submit')}</button>
      </ClassicFoot>
    </div>
  );
}
