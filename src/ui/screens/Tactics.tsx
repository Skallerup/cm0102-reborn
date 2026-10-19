import { useEffect, useRef, useState } from 'react';
import { Info } from '../help';
import { roleScore, slotFit, slotRole } from '../../game/attributes';
import { gs, squad } from '../../game/state';
import { act } from '../../game/actions';
import { autoSelect, available, changeFormation, FORMATIONS, newTactic } from '../../game/tactics';
import type { Player, PlayerInstructions, PosKey, Side, Slot, Tactic, TeamInstructions } from '../../game/types';
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

/** Pladsens betegnelse ud fra hvor den står på banen (x: 0 eget mål → 100 modstanderens, y: 0 venstre → 100 højre) */
function slotAt(x: number, y: number): { pos: PosKey; side: Side } {
  const side: Side = y < 30 ? 'L' : y > 70 ? 'R' : 'C';
  const pos: PosKey = x < 15 && side === 'C' ? 'SW' : x < 27 ? 'D' : x < 36 ? (side === 'C' ? 'DM' : 'WB') : x < 56 ? 'M' : x < 70 ? 'AM' : 'ST';
  return { pos, side };
}

/** Navn til en egen formation ud fra pladserne, fx "4-1-2-3*" */
function shapeName(slots: Slot[]): string {
  const n = { d: 0, dm: 0, m: 0, am: 0, st: 0 };
  for (const s of slots) {
    if (s.pos === 'GK') continue;
    if (s.pos === 'D' || s.pos === 'SW' || (s.pos === 'WB' && s.x < 36)) n.d++;
    else if (s.pos === 'DM') n.dm++;
    else if (s.pos === 'M' || s.pos === 'WB') n.m++;
    else if (s.pos === 'AM') n.am++;
    else n.st++;
  }
  return `${[n.d, n.dm, n.m, n.am, n.st].filter((x) => x > 0).join('-')}*`;
}

/** Banens koordinater i procent af tavlen */
const slotLeft = (s: Slot) => s.y;
const slotTop = (s: Slot) => 97 - s.x * 0.92;

export function TacticEditor({ tactic, players, onChange, matchMode, onSub }: {
  tactic: Tactic; players: Player[]; onChange: (t: Tactic) => void; matchMode?: boolean; onSub?: (outId: number, inId: number) => void;
}) {
  const [sel, setSel] = useState<number | null>(null);
  const [drag, setDrag] = useState<number | null>(null);
  // flyt pladser (egen formation) og højrekliksmenu med spillerinstruktioner
  const [editPos, setEditPos] = useState(false);
  const [moving, setMoving] = useState<{ i: number; x: number; y: number } | null>(null);
  const [menu, setMenu] = useState<{ i: number; left: number; top: number } | null>(null);
  const pitchRef = useRef<HTMLDivElement>(null);
  const press = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!menu) return;
    const close = (e: Event) => { if (e instanceof KeyboardEvent && e.key !== 'Escape') return; setMenu(null); };
    window.addEventListener('click', close);
    window.addEventListener('keydown', close);
    return () => { window.removeEventListener('click', close); window.removeEventListener('keydown', close); };
  }, [menu]);
  const toPitch = (cx: number, cy: number) => {
    const r = pitchRef.current!.getBoundingClientRect();
    const left = ((cx - r.left) / r.width) * 100, top = ((cy - r.top) / r.height) * 100;
    return { x: Math.max(10, Math.min(90, (97 - top) / 0.92)), y: Math.max(4, Math.min(96, left)) };
  };
  const finishMove = () => {
    if (!moving) return;
    const slots = tactic.slots.slice();
    const { pos, side } = slotAt(moving.x, moving.y);
    slots[moving.i] = { pos, side, x: Math.round(moving.x), y: Math.round(moving.y) };
    setMoving(null);
    onChange({ ...tactic, slots, formation: shapeName(slots) });
  };
  const setIndFor = (i: number, patch: Partial<PlayerInstructions>) => {
    const individual = tactic.individual.slice();
    individual[i] = { ...individual[i], ...patch };
    onChange({ ...tactic, individual });
  };
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
            {!FORMATIONS.includes(tactic.formation) && <option value={tactic.formation}>{t('tac.customFormation', { name: tactic.formation })}</option>}
            {FORMATIONS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <button className={`small ${editPos ? 'primary' : ''}`} onClick={() => { setEditPos(!editPos); setSel(null); }} title={t('tac.movePosHint')}>✥ {t(editPos ? 'tac.movePosDone' : 'tac.movePos')}</button>
          <span className="muted">{t(editPos ? 'tac.movePosHint' : 'tac.hint2')}</span>
        </div>
        <div className={`pitch ${editPos ? 'editing' : ''}`} ref={pitchRef}
          onDragOver={(e) => { if (drag !== null && tactic.lineup.includes(drag)) e.preventDefault(); }}
          onDrop={(e) => {
            // sluppet på en tom plet: flyt spillerens plads dertil (egen formation)
            if (drag === null) return;
            const i = tactic.lineup.indexOf(drag);
            setDrag(null);
            if (i < 0 || tactic.slots[i].pos === 'GK') return;
            const { x, y } = toPitch(e.clientX, e.clientY);
            const slots = tactic.slots.slice();
            slots[i] = { ...slotAt(x, y), x: Math.round(x), y: Math.round(y) };
            onChange({ ...tactic, slots, formation: shapeName(slots) });
          }}
          onPointerMove={(e) => { if (moving) setMoving({ i: moving.i, ...toPitch(e.clientX, e.clientY) }); }}
          onPointerUp={finishMove} onPointerLeave={finishMove}>
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
          {/* pile: hvor meget spilleren går med frem (løb) */}
          <svg className="run-arrows" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs><marker id="arrowhead" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#fff" /></marker></defs>
            {tactic.slots.map((s0, i) => {
              const sl = moving?.i === i ? { ...s0, x: moving.x, y: moving.y } : s0;
              const runs = tactic.individual[i]?.runs ?? 1;
              // offensiv: pil frem · balanceret: ingen pil · defensiv: pil tilbage (står dybere)
              if (sl.pos === 'GK' || runs === 1 || !tactic.lineup[i]) return null;
              const forward = runs === 2;
              const inward = sl.side === 'L' ? 5 : sl.side === 'R' ? -5 : 0;
              const x1 = slotLeft(sl), y1 = slotTop(sl) + (forward ? -4 : 4);
              return <line key={i} x1={x1} y1={y1} x2={x1 + (forward ? inward : 0)} y2={y1 + (forward ? -15 : 9)} stroke={forward ? '#fff' : '#ffd166'} strokeWidth="1.6" strokeDasharray="3 2.4" vectorEffect="non-scaling-stroke" markerEnd="url(#arrowhead)" opacity="0.9" />;
            })}
          </svg>
          {tactic.slots.map((s0, i) => {
            const s = moving?.i === i ? { ...s0, ...slotAt(moving.x, moving.y), x: moving.x, y: moving.y } : s0;
            const p = byId.get(tactic.lineup[i]);
            const fit = p ? slotFit(p, s) : 0;
            const club = gs().clubs[gs().userClub];
            return (
              <div key={i} className={`slot ${sel === i ? 'picked' : ''} ${p ? '' : 'empty'} ${drag !== null ? 'drop' : ''} ${moving?.i === i ? 'moving' : ''}`}
                style={{ left: `${slotLeft(s)}%`, top: `${slotTop(s)}%` }}
                onClick={() => { if (!editPos) setSel(sel === i ? null : i); }}
                onContextMenu={(e) => { if (!p || s.pos === 'GK' && false) return; e.preventDefault(); setSel(i); setMenu({ i, left: e.clientX, top: e.clientY }); }}
                onPointerDown={(e) => {
                  if (editPos && s.pos !== 'GK') { e.preventDefault(); (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); setMoving({ i, x: s.x, y: s.y }); return; }
                  // langt tryk (mobil) åbner menuen
                  if (e.pointerType === 'touch' && p) { const { clientX, clientY } = e; press.current = setTimeout(() => { setSel(i); setMenu({ i, left: clientX, top: clientY }); }, 550); }
                }}
                onPointerUp={() => { if (press.current) { clearTimeout(press.current); press.current = null; } }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.stopPropagation(); if (drag !== null) assign(i, drag); setDrag(null); }}
                draggable={!!p && !editPos}
                onDragStart={(e) => {
                  if (!p) return;
                  setDrag(p.id);
                  // et lille rent trækbillede i stedet for browserens "spøgelse"
                  const ghost = document.createElement('div');
                  ghost.className = 'drag-ghost';
                  ghost.textContent = p.last;
                  document.body.appendChild(ghost);
                  e.dataTransfer.setDragImage(ghost, 20, 14);
                  setTimeout(() => ghost.remove(), 0);
                }}
                onDragEnd={() => setDrag(null)}>
                <div className="shirt" style={{ background: club?.colors[0] ?? '#c00', color: club?.colors[1] ?? '#fff' }}>{s.pos}{s.side !== 'C' ? s.side : ''}</div>
                <div className="nm">{p ? p.last : t('tac.empty')}</div>
                {p && <div className="fit" style={{ color: fit > 0.85 ? '#9f9' : fit > 0.6 ? '#ff9' : '#f99' }}>{fit > 0.85 ? '●' : fit > 0.6 ? '◐' : '○'} {Math.round(p.condition)}%</div>}
              </div>
            );
          })}
        </div>
        {menu && (() => {
          const i = menu.i;
          const ins = tactic.individual[i];
          const p = byId.get(tactic.lineup[i]);
          if (!ins || !p) return null;
          const sl = tactic.slots[i];
          const tri = (k: 'longShots' | 'crossing', label: string) => (
            <div className="ctx-row"><span>{label}</span>{[0, 1, 2].map((v) => <button key={v} className={`small ${ins[k] === v ? 'primary' : ''}`} onClick={(e) => { e.stopPropagation(); setIndFor(i, { [k]: v } as Partial<PlayerInstructions>); }}>{t(['ti.rarely', 'ti.sometimes', 'ti.often'][v])}</button>)}</div>
          );
          const tog = (k: 'runWithBall' | 'throughBalls' | 'freeRole' | 'tightMarking', label: string) => (
            <button className={`ctx-toggle ${ins[k] ? 'on' : ''}`} onClick={(e) => { e.stopPropagation(); setIndFor(i, { [k]: !ins[k] } as Partial<PlayerInstructions>); }}>{ins[k] ? '✓' : '○'} {label}</button>
          );
          return (
            <div className="ctx-menu" style={{ left: Math.min(menu.left, window.innerWidth - 340), top: Math.min(menu.top, window.innerHeight - 300) }} onClick={(e) => e.stopPropagation()}>
              <div className="ctx-title">{p.last} · {sl.pos}{sl.side !== 'C' ? ' ' + sl.side : ''}</div>
              <div className="ctx-row role">
                {([[0, '⬇', 'tac.roleDef'], [1, '●', 'tac.roleBal'], [2, '⬆', 'tac.roleAtt']] as const).map(([v, ic, k]) => (
                  <button key={v} className={`small ${ins.runs === v ? 'primary' : ''}`} onClick={(e) => { e.stopPropagation(); setIndFor(i, { runs: v }); }}>{ic} {t(k)}</button>
                ))}
              </div>
              {tri('longShots', t('pi.longShots'))}
              {tri('crossing', t('pi.crossing'))}
              <div className="ctx-toggles">
                {tog('runWithBall', t('pi.runWithBall'))}
                {tog('throughBalls', t('pi.throughBalls'))}
                {tog('tightMarking', t('pi.tightMarking'))}
                {tog('freeRole', t('pi.freeRole'))}
              </div>
            </div>
          );
        })()}
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
        <b>{t('chem.title')}: {ch.score}/100 <Bar value={ch.score} /></b><Info topic="chemistry" />
        <span className="muted">{t('chem.effect', { pct: ((ch.score - 50) * 0.06).toFixed(1) })}</span>
      </div>
      <div className="row" style={{ marginTop: 6 }}>
        {ch.parts.filter((p) => p.value !== 0).map((p) => <span key={p.key} className={`tag ${p.value > 0 ? 'good' : 'bad'}`}>{t(p.key, p.params)} {p.value > 0 ? '+' : ''}{p.value}</span>)}
      </div>
    </div>
  );
}
