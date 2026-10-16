import { useState } from 'react';
import { roleScore, slotFit, slotRole } from '../../game/attributes';
import { gs, squad } from '../../game/state';
import { act } from '../../game/actions';
import { autoSelect, available, changeFormation, FORMATIONS, newTactic } from '../../game/tactics';
import type { Player, PlayerInstructions, Tactic, TeamInstructions } from '../../game/types';
import { t } from '../../i18n';
import { chemistry } from '../../game/personality';
import { Bar, Panel, PlayerLink, posStr } from '../components';
import { useGame } from '../core';
import { Head } from './common';

export function Tactics() {
  const g = useGame()!;
  if (!g.tactic) g.tactic = autoSelect(newTactic('4-4-2'), squad(g.userClub));
  const set = (tac: Tactic) => act({ t: 'tactic', tactic: tac });
  return (
    <div>
      <Head title={t('nav.tactics')}>
        <button onClick={() => set(autoSelect(g.tactic!, squad(g.userClub)))}>{t('tac.assistantPick')}</button>
        <button onClick={() => act({ t: 'savedTactics', list: [...g.savedTactics.filter((x) => x.formation !== g.tactic!.formation), structuredClone(g.tactic!)].slice(-6) })}>{t('tac.save')}</button>
        {g.savedTactics.length > 0 && (
          <select value="" onChange={(e) => { const s = g.savedTactics[Number(e.target.value)]; if (s) set({ ...structuredClone(s), lineup: g.tactic!.lineup.length === s.lineup.length ? g.tactic!.lineup : s.lineup }); }}>
            <option value="">{t('tac.load')}</option>
            {g.savedTactics.map((s, i) => <option key={i} value={i}>{s.formation} ({t(`ment.${s.team.mentality}`)})</option>)}
          </select>
        )}
      </Head>
      <ChemistryPanel />
      <TacticEditor tactic={g.tactic} players={squad(g.userClub)} onChange={set} />
    </div>
  );
}

export function TacticEditor({ tactic, players, onChange, matchMode, onSub }: {
  tactic: Tactic; players: Player[]; onChange: (t: Tactic) => void; matchMode?: boolean; onSub?: (outId: number, inId: number) => void;
}) {
  const [sel, setSel] = useState<number | null>(null);
  const [drag, setDrag] = useState<number | null>(null);
  const byId = new Map(players.map((p) => [p.id, p]));
  const inXI = new Set(tactic.lineup);
  const selSlot = sel !== null ? tactic.slots[sel] : null;

  const assign = (slot: number, pid: number) => {
    const lineup = tactic.lineup.slice();
    let bench = tactic.bench.slice();
    const prev = lineup[slot];
    const from = lineup.indexOf(pid);
    if (matchMode) {
      if (from >= 0) { lineup[from] = prev; lineup[slot] = pid; onChange({ ...tactic, lineup }); }
      else if (onSub && prev) onSub(prev, pid);
      return;
    }
    if (from >= 0) {
      lineup[from] = prev;
      lineup[slot] = pid;
    } else {
      lineup[slot] = pid;
      bench = bench.filter((x) => x !== pid);
      if (prev && bench.length < 5) bench.push(prev);
    }
    onChange({ ...tactic, lineup, bench });
  };

  const toggleBench = (pid: number) => {
    if (matchMode) return;
    if (tactic.bench.includes(pid)) onChange({ ...tactic, bench: tactic.bench.filter((x) => x !== pid) });
    else if (tactic.bench.length < 5 && !inXI.has(pid)) onChange({ ...tactic, bench: [...tactic.bench, pid] });
  };

  const setTeam = (patch: Partial<TeamInstructions>) => onChange({ ...tactic, team: { ...tactic.team, ...patch } });
  const setInd = (patch: Partial<PlayerInstructions>) => {
    if (sel === null) return;
    const individual = tactic.individual.slice();
    individual[sel] = { ...individual[sel], ...patch };
    onChange({ ...tactic, individual });
  };

  const listed = players.slice().sort((a, b) => {
    if (selSlot) return (available(b) ? 1 : 0) - (available(a) ? 1 : 0) || roleScore(b, slotRole(selSlot)) * slotFit(b, selSlot) - roleScore(a, slotRole(selSlot)) * slotFit(a, selSlot);
    return Number(inXI.has(b.id)) - Number(inXI.has(a.id)) || Number(tactic.bench.includes(b.id)) - Number(tactic.bench.includes(a.id)) || b.ca - a.ca;
  });
  const ind = sel !== null ? tactic.individual[sel] : null;
  const tm = tactic.team;
  const opt = (k: keyof TeamInstructions, vals: [number | string | boolean, string][]) => (
    <label className="row">
      <span style={{ width: 120 }}>{t(`ti.${k}`)}</span>
      <select value={String(tm[k])} onChange={(e) => {
        const v = vals.find((x) => String(x[0]) === e.target.value)![0];
        setTeam({ [k]: v } as Partial<TeamInstructions>);
      }}>
        {vals.map(([v, l]) => <option key={String(v)} value={String(v)}>{l}</option>)}
      </select>
    </label>
  );

  return (
    <div className="cols" style={{ gridTemplateColumns: 'minmax(280px, 420px) 1fr' }}>
      <div className="col">
        <div className="row">
          <select value={tactic.formation} disabled={matchMode && false} onChange={(e) => onChange(changeFormation(tactic, e.target.value))}>
            {FORMATIONS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <span className="muted">{t('tac.hint')}</span>
        </div>
        <div className="pitch">
          <svg className="lines" viewBox="0 0 68 100" preserveAspectRatio="none">
            <g stroke="#ffffffaa" strokeWidth="0.4" fill="none">
              <rect x="1" y="1" width="66" height="98" />
              <line x1="1" y1="50" x2="67" y2="50" />
              <circle cx="34" cy="50" r="9" />
              <rect x="14" y="1" width="40" height="16" />
              <rect x="14" y="83" width="40" height="16" />
              <rect x="25" y="1" width="18" height="6" />
              <rect x="25" y="93" width="18" height="6" />
            </g>
          </svg>
          {tactic.slots.map((s, i) => {
            const p = byId.get(tactic.lineup[i]);
            const fit = p ? slotFit(p, s) : 0;
            const club = gs().clubs[gs().userClub];
            return (
              <div key={i} className={`slot ${sel === i ? 'sel' : ''} ${p ? '' : 'empty'} ${drag !== null ? 'drop' : ''}`}
                style={{ left: `${s.y}%`, top: `${97 - s.x * 0.92}%` }}
                onClick={() => setSel(sel === i ? null : i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => { if (drag !== null) assign(i, drag); setDrag(null); }}
                draggable={!!p}
                onDragStart={() => p && setDrag(p.id)}
                onDragEnd={() => setDrag(null)}>
                <div className="shirt" style={{ background: club?.colors[0] ?? '#c00', color: club?.colors[1] ?? '#fff' }}>{s.pos}{s.side !== 'C' ? s.side : ''}</div>
                <div className="nm">{p ? p.last : t('tac.empty')}</div>
                {p && <div className="fit" style={{ color: fit > 0.85 ? '#9f9' : fit > 0.6 ? '#ff9' : '#f99' }}>{fit > 0.85 ? '●' : fit > 0.6 ? '◐' : '○'} {Math.round(p.condition)}%</div>}
              </div>
            );
          })}
        </div>
        <Panel title={t('tac.setPieces')}>
          <div className="col">
            {(['captain', 'penalties', 'freeKicks', 'corners'] as const).map((k) => (
              <label key={k} className="row"><span style={{ width: 110 }}>{t(`tac.${k}`)}</span>
                <select value={tactic[k]} onChange={(e) => onChange({ ...tactic, [k]: Number(e.target.value) })}>
                  <option value={0}>—</option>
                  {tactic.lineup.map((id) => byId.get(id)).filter(Boolean).map((p) => <option key={p!.id} value={p!.id}>{p!.last}</option>)}
                </select>
              </label>
            ))}
          </div>
        </Panel>
      </div>
      <div className="col">
        <Panel title={t('tac.team')}>
          <div className="cols2">
            <div className="col">
              {opt('mentality', [0, 1, 2, 3, 4].map((v) => [v, t(`ment.${v}`)]))}
              {opt('passing', [[0, t('ti.short')], [1, t('ti.mixed')], [2, t('ti.long')]])}
              {opt('tempo', [[0, t('ti.slow')], [1, t('ti.normal')], [2, t('ti.fast')]])}
              {opt('width', [[0, t('ti.narrow')], [1, t('ti.normal')], [2, t('ti.wide')]])}
            </div>
            <div className="col">
              {opt('closingDown', [[0, t('ti.rarely')], [1, t('ti.sometimes')], [2, t('ti.often')]])}
              {opt('tackling', [[0, t('ti.easy')], [1, t('ti.normal')], [2, t('ti.hard')]])}
              {opt('marking', [['zonal', t('ti.zonal')], ['man', t('ti.man')]])}
              {opt('offside', [[false, t('common.no')], [true, t('common.yes')]])}
              {opt('counter', [[false, t('common.no')], [true, t('common.yes')]])}
            </div>
          </div>
        </Panel>
        {ind && selSlot && (
          <Panel title={`${t('tac.individual')}: ${selSlot.pos}${selSlot.side !== 'C' ? ' ' + selSlot.side : ''} – ${byId.get(tactic.lineup[sel!])?.last ?? ''}`}>
            <div className="cols2">
              <label className="row"><span style={{ width: 120 }}>{t('pi.runs')}</span>
                <select value={ind.runs} onChange={(e) => setInd({ runs: Number(e.target.value) })}>
                  <option value={0}>{t('ti.rarely')}</option><option value={1}>{t('ti.mixed')}</option><option value={2}>{t('ti.often')}</option>
                </select></label>
              <label className="row"><span style={{ width: 120 }}>{t('pi.longShots')}</span>
                <select value={ind.longShots} onChange={(e) => setInd({ longShots: Number(e.target.value) })}>
                  <option value={0}>{t('ti.rarely')}</option><option value={1}>{t('ti.mixed')}</option><option value={2}>{t('ti.often')}</option>
                </select></label>
              <label className="row"><span style={{ width: 120 }}>{t('pi.crossing')}</span>
                <select value={ind.crossing} onChange={(e) => setInd({ crossing: Number(e.target.value) })}>
                  <option value={0}>{t('ti.rarely')}</option><option value={1}>{t('ti.mixed')}</option><option value={2}>{t('ti.often')}</option>
                </select></label>
              <label className="row"><input type="checkbox" checked={ind.runWithBall} onChange={(e) => setInd({ runWithBall: e.target.checked })} /> {t('pi.runWithBall')}</label>
              <label className="row"><input type="checkbox" checked={ind.throughBalls} onChange={(e) => setInd({ throughBalls: e.target.checked })} /> {t('pi.throughBalls')}</label>
              <label className="row"><input type="checkbox" checked={ind.tightMarking} onChange={(e) => setInd({ tightMarking: e.target.checked })} /> {t('pi.tightMarking')}</label>
              <label className="row"><input type="checkbox" checked={ind.freeRole} onChange={(e) => setInd({ freeRole: e.target.checked })} /> {t('pi.freeRole')}</label>
            </div>
          </Panel>
        )}
        <Panel title={selSlot ? t('tac.bestFor', { slot: `${selSlot.pos}${selSlot.side !== 'C' ? ' ' + selSlot.side : ''}` }) : t('tac.players')} className="flush">
          <div className="table-wrap" style={{ maxHeight: 420, overflowY: 'auto' }}>
            <table className="grid">
              <thead><tr><th></th><th>{t('col.pos')}</th><th>{t('col.name')}</th><th>{t('col.cond')}</th>{selSlot && <th>{t('tac.suit')}</th>}<th></th></tr></thead>
              <tbody>
                {listed.map((p) => {
                  const xi = tactic.lineup.indexOf(p.id);
                  const onBench = tactic.bench.includes(p.id);
                  const suit = selSlot ? Math.round(roleScore(p, slotRole(selSlot)) * slotFit(p, selSlot) * 10) / 10 : 0;
                  return (
                    <tr key={p.id} className={`clickable ${!available(p) ? 'injured' : ''}`} draggable onDragStart={() => setDrag(p.id)} onDragEnd={() => setDrag(null)}
                      onClick={() => { if (sel !== null && available(p)) assign(sel, p.id); }}>
                      <td>{xi >= 0 ? <span className="tag good">{tactic.slots[xi].pos}</span> : onBench ? <span className="tag">{t('tac.sub')}</span> : ''}</td>
                      <td>{posStr(p)}</td>
                      <td><PlayerLink p={p} short />{p.injury && <span className="tag bad">{t('tag.inj')}</span>}{p.banned > 0 && <span className="tag bad">{t('tag.ban')}</span>}</td>
                      <td><Bar value={p.condition} /></td>
                      {selSlot && <td className="num">{suit.toFixed(1)}</td>}
                      <td>{!matchMode && xi < 0 && available(p) && <button className="small" onClick={(e) => { e.stopPropagation(); toggleBench(p.id); }}>{onBench ? '−' : '+'} {t('tac.sub')}</button>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function ChemistryPanel() {
  const g = useGame()!;
  const tac = g.tactic!;
  const ch = chemistry(tac.lineup.map((id) => g.players[id]).filter(Boolean), tac.captain);
  const tone = ch.score >= 60 ? 'good' : ch.score < 45 ? 'bad' : 'warn';
  return (
    <div className={`insight ${tone}`}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <b>{t('chem.title')}: {ch.score}/100 <Bar value={ch.score} /></b>
        <span className="muted">{t('chem.effect', { pct: ((ch.score - 50) * 0.06).toFixed(1) })}</span>
      </div>
      <div className="row" style={{ marginTop: 6 }}>
        {ch.parts.filter((p) => p.value !== 0).map((p) => <span key={p.key} className={`tag ${p.value > 0 ? 'good' : 'bad'}`}>{t(p.key, p.params)} {p.value > 0 ? '+' : ''}{p.value}</span>)}
      </div>
    </div>
  );
}
