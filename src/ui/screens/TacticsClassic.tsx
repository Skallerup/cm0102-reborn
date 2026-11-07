// Taktik i klassisk tema (som i CM 01/02): værktøjslinjen Tactics ▾ · View ▾ · Last Match · Edit ▾, formationens
// navn og fanerne Overview · With Ball · Without Ball. Til venstre de 11 (1-11), bænken (SB1 …) og resten af truppen
// (grå); til højre banen med spillerne som cirkler. Klik en spiller i listen og derefter en plads (eller træk og
// slip) for at sætte ham ind. Under "With Ball"/"Without Ball" vises holdets – og den valgte spillers – instruktioner.
import { useRef, useState, type ReactNode } from 'react';
import { act } from '../../game/actions';
import { A, naturalRole, roleScore, slotFit, slotRole } from '../../game/attributes';
import { benchSize } from '../../game/rules';
import { gs, squad } from '../../game/state';
import { autoSelect, available, changeFormation, FORMATIONS, newTactic, slotTaken, snapSlot } from '../../game/tactics';
import type { Fixture, Player, PlayerInstructions, Slot, Tactic, TeamInstructions } from '../../game/types';
import { aiTactic } from '../../game/sim';
import { money, t } from '../../i18n';
import { CxDrop, titleColors, type DropItem } from '../classic';
import { askText } from '../confirm';
import { posStr } from '../components';
import { useGame, useNav, useRouteState } from '../core';
import { Head } from './common';
import { shapeName } from './Tactics';

const left = (s: Slot) => s.y;
const top = (s: Slot) => 97 - s.x * 0.92;
const slotName = (s: Slot) => `${s.pos === 'ST' ? 'F' : s.pos}${s.pos === 'GK' || s.side === 'C' ? '' : s.side}`;
type View = 'cond' | 'fit' | 'pos' | 'value';
type Pane = 'overview' | 'with' | 'without';

/** Edit → Copy/Copy All: udklipsholderen (gælder, så længe siden er åben) */
let clip: { one?: { slot: Slot; instr: PlayerInstructions }; all?: { slots: Slot[]; individual: PlayerInstructions[]; formation: string } } | null = null;

export function ClassicTactics() {
  const g = useGame()!;
  const { nav } = useNav();
  if (!g.tactic) g.tactic = autoSelect(newTactic('4-4-2'), squad(g.userClub));
  const tac = g.tactic;
  const players = squad(g.userClub);
  const byId = new Map(players.map((p) => [p.id, p]));
  const [pane, setPane] = useRouteState<Pane>('tpane', 'overview');
  const [view, setView] = useRouteState<View>('tview', 'cond');
  const [penScreen, setPenScreen] = useRouteState('tpens', false);
  const [pick, setPick] = useState<number | null>(null); // valgt spiller (i listen)
  const [slotSel, setSlotSel] = useState<number | null>(null); // valgt plads (på banen)
  const [drag, setDrag] = useState<number | null>(null);
  const [hist, setHist] = useState<Tactic[]>([]);
  const change = (next: Tactic) => { setHist((h) => [...h.slice(-39), tac]); act({ t: 'tactic', tactic: next }); };
  const undo = () => { const prev = hist.at(-1); if (!prev) return; setHist(hist.slice(0, -1)); act({ t: 'tactic', tactic: prev }); };

  /** Sæt en spiller på en plads (byt, hvis han allerede er på holdet; den der stod der, ryger på bænken) */
  const assign = (slot: number, pid: number) => {
    const lineup = tac.lineup.slice();
    let bench = tac.bench.slice();
    const prev = lineup[slot];
    const from = lineup.indexOf(pid);
    if (from >= 0) { lineup[from] = prev; lineup[slot] = pid; }
    else {
      lineup[slot] = pid;
      bench = bench.filter((x) => x !== pid);
      if (prev && bench.length < benchSize()) bench.push(prev);
    }
    change({ ...tac, lineup, bench });
    setPick(null); setSlotSel(null);
  };
  /** Flyt en spillers plads på banen (egen formation, som i originalen): træk ham til en tom plet */
  const moveSlot = (i: number, x: number, y: number) => {
    if (i < 0 || tac.slots[i].pos === 'GK' || gs().draft) return;
    const slots = tac.slots.slice();
    // CM 01/02: spilleren lander på den nærmeste faste plads (ikke frit); optaget plads = ingen flytning
    const s = snapSlot(x, y);
    if (slotTaken(slots, i, s)) { setPick(null); setSlotSel(null); return; }
    slots[i] = s;
    change({ ...tac, slots, formation: shapeName(slots) });
    setPick(null); setSlotSel(null);
  };
  const toggleBench = (pid: number) => {
    if (tac.lineup.includes(pid)) return;
    if (tac.bench.includes(pid)) change({ ...tac, bench: tac.bench.filter((x) => x !== pid) });
    else if (tac.bench.length < benchSize()) change({ ...tac, bench: [...tac.bench, pid] });
  };
  const clickRow = (p: Player) => {
    if (slotSel !== null && available(p)) { assign(slotSel, p.id); return; }
    setPick(pick === p.id ? null : p.id);
  };
  const clickSlot = (i: number) => {
    if (pick !== null) { assign(i, pick); return; }
    setSlotSel(slotSel === i ? null : i);
  };

  // listen: de 11 i pladsernes rækkefølge, så bænken, så resten (efter evne)
  const xi = tac.lineup.map((id) => byId.get(id)).filter((p): p is Player => !!p);
  const bench = tac.bench.map((id) => byId.get(id)).filter((p): p is Player => !!p);
  const rest = players.filter((p) => !tac.lineup.includes(p.id) && !tac.bench.includes(p.id)).sort((a, b) => Number(available(b)) - Number(available(a)) || b.ca - a.ca);
  const fitSlot = slotSel !== null ? tac.slots[slotSel] : null;
  const value = (p: Player, slot?: Slot): ReactNode => {
    if (view === 'fit') { const s = slot ?? fitSlot; return s ? `${(Math.round(roleScore(p, slotRole(s)) * slotFit(p, s) * 10) / 10).toFixed(1)}` : posStr(p); }
    if (view === 'pos') return posStr(p);
    if (view === 'value') return money(p.value);
    return `${Math.round(p.condition)}%`;
  };
  const tags = (p: Player) => [tac.captain === p.id && t('cl.tac.capt'), tac.penalties === p.id && t('cl.tac.pen'), tac.freeKicks === p.id && t('cl.tac.fk'), tac.corners === p.id && t('cl.tac.cor'), tac.team.playmaker === p.id && t('cl.tac.pm'), tac.team.targetMan === p.id && t('cl.tac.tm')].filter(Boolean).join(' ');
  const row = (p: Player, label: string, kind: 'xi' | 'bench' | 'rest', slot?: Slot) => (
    <div key={p.id} className={`cx-tac-row ${kind} ${pick === p.id ? 'on' : ''} ${!available(p) ? 'unavail' : ''}`} draggable
      onDragStart={(e) => { e.dataTransfer.setData('text/plain', String(p.id)); setTimeout(() => setDrag(p.id), 0); }} onDragEnd={() => setTimeout(() => setDrag(null), 0)} onClick={() => clickRow(p)}>
      <button className="cx-tac-num" title={kind === 'xi' ? undefined : t(kind === 'bench' ? 'cl.tac.fromBench' : 'cl.tac.toBench')}
        onClick={(e) => { e.stopPropagation(); toggleBench(p.id); }}>{label}</button>
      <span className="cx-tac-name" onDoubleClick={(e) => { e.stopPropagation(); nav({ name: 'player', id: p.id }); }}>{p.first ? `${p.first} ` : ''}{p.last}</span>
      <span className="cx-tac-tag">{tags(p)}</span>
      <span className="cx-tac-val">{value(p, slot)}</span>
    </div>
  );

  const lastMatch = (() => {
    let best: { id: number; date: string } | undefined;
    for (const f of Object.values(g.fixtures)) if (f.result && g.reports[f.id] && (f.home === g.userClub || f.away === g.userClub) && (!best || f.date > best.date)) best = { id: f.id, date: f.date };
    return best?.id;
  })();
  const nm = (id: number) => { const p = byId.get(id); return p ? `${p.number ?? ''} ${p.first} ${p.last}`.trim() : ''; };
  const starters = tac.lineup.filter(Boolean);
  const saved = g.savedTactics;
  const savedLabel = (s2: Tactic) => s2.name ?? `${s2.formation} (${t(`ment.${s2.team.mentality}`)})`;
  // CM 01/02: Team Instructions · Penalty Takers · Set To Default ▸ · — · Load · Save · Save As · Delete
  const tacticItems: DropItem[] = [
    { key: 'ti', label: t('cl.mt.teamInstr'), onClick: () => setPane('with') },
    { key: 'pens', label: t('cl.tac.penTakers'), onClick: () => setPenScreen(true) },
    // vores ekstra: anfører, frispark og hjørnespark (i originalen trækkes "capt" m.fl. hen på spilleren)
    { key: 'setp', label: t('cl.tac.setPieceTakers'), sub: (['captain', 'freeKicks', 'corners'] as const).map((k) => ({ key: k, label: t(`tac.${k}`), sub: starters.map((id) => ({ key: `${k}${id}`, label: nm(id), checked: tac[k] === id, onClick: () => change({ ...tac, [k]: id }) })) })) },
    { key: 'def', label: t('cl.mt.default'), sub: FORMATIONS.map((f) => ({ key: `f${f}`, label: f, checked: tac.formation === f, onClick: () => change(changeFormation(tac, f)) })) },
    { key: 'sep', sep: true },
    { key: 'load', label: t('cl.tac.load'), sub: saved.length ? saved.map((s2, i2) => ({ key: `l${i2}`, label: savedLabel(s2), onClick: () => change({ ...structuredClone(s2), lineup: tac.lineup.length === s2.lineup.length ? tac.lineup : s2.lineup }) })) : [{ key: 'none', label: t('common.none'), disabled: true, onClick: () => {} }] },
    { key: 'save', label: t('cl.tac.save'), disabled: !tac.name || !saved.some((x) => x.name === tac.name), onClick: () => act({ t: 'savedTactics', list: saved.map((x) => (x.name === tac.name ? structuredClone(tac) : x)) }) },
    { key: 'saveas', label: t('cl.tac.saveAs'), onClick: () => void askText(t('cl.tac.saveAsQ'), tac.name ?? tac.formation, { head: t('cl.tac.saveAs') }).then((name) => { if (name) { act({ t: 'savedTactics', list: [...saved.filter((x) => x.name !== name), { ...structuredClone(tac), name }].slice(-10) }); change({ ...tac, name }); } }) },
    { key: 'del', label: t('cl.tac.delete'), sub: saved.length ? saved.map((s2, i2) => ({ key: `d${i2}`, label: savedLabel(s2), onClick: () => act({ t: 'savedTactics', list: saved.filter((_, k) => k !== i2) }) })) : [{ key: 'none', label: t('common.none'), disabled: true, onClick: () => {} }] },
  ];
  /** spejlvend formationen (venstre ↔ højre) – CM 01/02 Edit → Reflect */
  const reflect = () => {
    const flip = (sd: Slot['side']): Slot['side'] => (sd === 'L' ? 'R' : sd === 'R' ? 'L' : sd);
    change({ ...tac, slots: tac.slots.map((sl) => ({ ...sl, y: 100 - sl.y, side: flip(sl.side) })) });
  };
  // CM 01/02: Undo · Copy · Copy All · Paste · Reflect · Show Runs (+ vores egne: assistenten, ryd holdet, playmaker/target)
  // den valgte plads (klikket på banen eller en spiller på holdet i listen)
  const curSlot = slotSel ?? (pick !== null && tac.lineup.includes(pick) ? tac.lineup.indexOf(pick) : null);
  const editItems: DropItem[] = [
    { key: 'undo', label: `${t('tac.undo')}${hist.length ? ` (${hist.length})` : ''}`, disabled: !hist.length, onClick: undo },
    // CM 01/02: Copy (den valgte spillers plads og instruktioner) · Copy All (hele formationen) · Paste
    { key: 'copy', label: t('cl.tac.copy'), disabled: curSlot === null, onClick: () => { if (curSlot !== null) clip = { one: { slot: { ...tac.slots[curSlot] }, instr: { ...tac.individual[curSlot] } } }; } },
    { key: 'copyall', label: t('cl.tac.copyAll'), onClick: () => { clip = { all: { slots: structuredClone(tac.slots), individual: structuredClone(tac.individual), formation: tac.formation } }; } },
    { key: 'paste', label: t('cl.tac.paste'), disabled: !clip || (!!clip.one && curSlot === null), onClick: () => {
      if (clip?.all) change({ ...tac, slots: structuredClone(clip.all.slots), individual: structuredClone(clip.all.individual), formation: clip.all.formation });
      else if (clip?.one && curSlot !== null && tac.slots[curSlot].pos !== 'GK') {
        const slots = tac.slots.slice(), individual = tac.individual.slice();
        if (!slotTaken(slots, curSlot, clip.one.slot)) slots[curSlot] = { ...clip.one.slot };
        individual[curSlot] = { ...clip.one.instr };
        change({ ...tac, slots, individual });
      }
    } },
    { key: 'sep0', sep: true },
    { key: 'reflect', label: t('cl.tac.reflect'), onClick: reflect },
    { key: 'runs', label: t('cl.tac.showRuns'), checked: pane === 'with', onClick: () => setPane(pane === 'with' ? 'overview' : 'with') },
    { key: 'sep', sep: true },
    { key: 'auto', label: t('tac.assistantPick'), onClick: () => change(autoSelect(tac, players)) },
    { key: 'clear', label: t('cl.sq.clear'), onClick: () => change({ ...tac, lineup: tac.lineup.map(() => 0), bench: [] }) },
    ...(['playmaker', 'targetMan'] as const).map((k) => ({ key: k, label: t(`tac.${k}`), sub: [{ key: `${k}0`, label: t('common.none'), checked: !tac.team[k], onClick: () => change({ ...tac, team: { ...tac.team, [k]: undefined } }) }, ...starters.map((id) => ({ key: `${k}${id}`, label: nm(id), checked: tac.team[k] === id, onClick: () => change({ ...tac, team: { ...tac.team, [k]: id } }) }))] })),
  ];
  const views: DropItem[] = (['cond', 'fit', 'pos', 'value'] as View[]).map((v) => ({ key: v, label: t(`cl.tac.v.${v}`), checked: view === v, onClick: () => setView(v) }));

  if (penScreen) return <PenaltyTakers tac={tac} players={players} change={change} onClose={() => setPenScreen(false)} />;
  return (
    <div className="cx-tac">
      <Head title={t('nav.tactics')}>
        <CxDrop label={t('nav.tactics')} items={tacticItems} />
        <CxDrop label={t('cl.sq.view')} items={views} />
        <span className="grow" />
        <button className="cx-greybtn" disabled={!lastMatch} onClick={() => lastMatch && nav({ name: 'report', id: lastMatch })}>{t('cl.lastMatch')}</button>
        <CxDrop label={t('cl.tac.edit')} items={editItems} align="right" />
      </Head>
      <div className="cx-tac-bar">
        <span className="cx-tac-form">{tac.formation}</span>
        <div className="cx-tac-panes">
          {(['overview', 'with', 'without'] as Pane[]).map((k) => <button key={k} className={pane === k ? 'on' : ''} onClick={() => setPane(k)}>{t(`cl.tac.${k}`)}</button>)}
        </div>
      </div>
      <div className="cx-tac-body">
        <div className="cx-tac-left">
          {pane === 'overview' ? (
            <div className="cx-tac-list">
              {xi.map((p) => row(p, String(tac.lineup.indexOf(p.id) + 1), 'xi', tac.slots[tac.lineup.indexOf(p.id)]))}
              {Array.from({ length: benchSize() }, (_, i) => bench[i]
                ? row(bench[i], `SB${i + 1}`, 'bench')
                : <div key={`sb${i}`} className="cx-tac-row empty"><span className="cx-tac-num">SB{i + 1}</span><span className="cx-tac-name">–</span></div>)}
              {rest.map((p) => row(p, '', 'rest'))}
            </div>
          ) : <Instructions tac={tac} pane={pane} slot={slotSel ?? (pick !== null && tac.lineup.includes(pick) ? tac.lineup.indexOf(pick) : null)} byId={byId} change={change} />}
        </div>
        <Pitch tac={tac} byId={byId} sel={slotSel} drag={drag} onSlot={clickSlot} onDrop={(i) => { if (drag !== null) assign(i, drag); setDrag(null); }} onDrag={setDrag}
          onMove={(x, y) => {
            // sluppet (eller klikket) på en tom plet: en spiller på holdet flytter sin plads dertil
            const i = drag !== null ? tac.lineup.indexOf(drag) : slotSel;
            setDrag(null);
            if (i !== null && i >= 0) moveSlot(i, x, y);
          }} />
      </div>
      <div className="cx-tac-hint">{t(pick !== null ? 'cl.tac.hintPlace' : slotSel !== null ? 'cl.tac.hintPlayer' : 'cl.tac.hint')}</div>
    </div>
  );
}

function Pitch({ tac, byId, sel, drag, onSlot, onDrop, onDrag, onMove, club }: {
  tac: Tactic; byId: Map<number, Player>; sel: number | null; drag: number | null;
  onSlot: (i: number) => void; onDrop: (i: number) => void; onDrag: (pid: number | null) => void; onMove: (x: number, y: number) => void; club?: number;
}) {
  const col = titleColors(club ?? gs().userClub);
  const ref = useRef<HTMLDivElement>(null);
  const toPitch = (cx: number, cy: number) => {
    const r = ref.current!.getBoundingClientRect();
    const l = ((cx - r.left) / r.width) * 100, tp = ((cy - r.top) / r.height) * 100;
    return { x: Math.max(10, Math.min(90, (97 - tp) / 0.92)), y: Math.max(4, Math.min(96, l)) };
  };
  return (
    <div className={`cx-tac-pitch ${sel !== null ? 'moving' : ''}`} ref={ref}
      onDragOver={(e) => { if (drag !== null && tac.lineup.includes(drag)) e.preventDefault(); }}
      onDrop={(e) => { e.preventDefault(); const { x, y } = toPitch(e.clientX, e.clientY); onMove(x, y); }}
      onClick={(e) => { if (sel === null || e.target !== e.currentTarget && !(e.target as Element).closest('svg')) return; const { x, y } = toPitch(e.clientX, e.clientY); onMove(x, y); }}>
      <svg className="lines" viewBox="0 0 68 100" preserveAspectRatio="none">
        <g stroke="#ffffff88" strokeWidth="0.35" fill="none">
          <rect x="1" y="1" width="66" height="98" /><line x1="1" y1="50" x2="67" y2="50" /><circle cx="34" cy="50" r="9" />
          <rect x="14" y="1" width="40" height="16" /><rect x="14" y="83" width="40" height="16" /><rect x="25" y="1" width="18" height="6" /><rect x="25" y="93" width="18" height="6" />
        </g>
      </svg>
      <svg className="runs" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs><marker id="cx-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#fff" /></marker></defs>
        {tac.slots.map((s, i) => (s.pos !== 'GK' && tac.lineup[i] && (tac.individual[i]?.runs ?? 1) === 2
          ? <line key={i} x1={left(s)} y1={top(s) - 5} x2={left(s)} y2={top(s) - 17} stroke="#fff" strokeWidth="1.2" strokeDasharray="2.5 2" vectorEffect="non-scaling-stroke" markerEnd="url(#cx-arrow)" />
          : null))}
      </svg>
      {tac.slots.map((s, i) => {
        const p = byId.get(tac.lineup[i]);
        const gk = s.pos === 'GK';
        return (
          <div key={i} className={`cx-tac-slot ${sel === i ? 'on' : ''} ${drag !== null ? 'drop' : ''} ${p ? '' : 'empty'}`} style={{ left: `${left(s)}%`, top: `${top(s)}%` }}
            onClick={(e) => { e.stopPropagation(); onSlot(i); }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onDrop(i); }}
            draggable={!!p && club === undefined} onDragStart={(e) => { if (!p) return; e.dataTransfer.setData('text/plain', String(p.id)); e.dataTransfer.effectAllowed = 'move'; setTimeout(() => onDrag(p.id), 0); }} onDragEnd={() => setTimeout(() => onDrag(null), 0)} title={`${slotName(s)}${p ? ` – ${p.first} ${p.last}` : ''}`}>
            <span className="cx-tac-dot" style={gk ? { background: '#fff21f', color: '#10164e' } : col.neutral ? undefined : { background: col.bg, color: col.fg }}>{club !== undefined ? p?.number ?? i + 1 : i + 1}</span>
            <span className="cx-tac-nm">{p ? p.last : slotName(s)}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Holdets instruktioner (med eller uden bold) og den valgte spillers – i en grøn boks som i originalen */
function Instructions({ tac, pane, slot, byId, change }: { tac: Tactic; pane: Pane; slot: number | null; byId: Map<number, Player>; change: (t: Tactic) => void }) {
  const tm = tac.team;
  const setTeam = (patch: Partial<TeamInstructions>) => change({ ...tac, team: { ...tm, ...patch } });
  const ind = slot !== null ? tac.individual[slot] : null;
  const p = slot !== null ? byId.get(tac.lineup[slot]) : undefined;
  const setInd = (patch: Partial<PlayerInstructions>) => { if (slot === null) return; const individual = tac.individual.slice(); individual[slot] = { ...individual[slot], ...patch }; change({ ...tac, individual }); };
  const optRow = <T extends string | number | boolean>(label: string, cur: T, vals: [T, string][], on: (v: T) => void) => (
    <div className="cx-ti-row" key={label}>
      <span className="cx-ti-label">{label}</span>
      <div className="cx-ti-opts">{vals.map(([v, l]) => <button key={String(v)} className={cur === v ? 'on' : ''} onClick={() => on(v)}>{l}</button>)}</div>
    </div>
  );
  const yn: [boolean, string][] = [[false, t('common.no')], [true, t('common.yes')]];
  const lvl = (a: string, b: string, c: string): [number, string][] => [[0, t(a)], [1, t(b)], [2, t(c)]];
  return (
    <div className="cx-ti">
      <div className="cx-ti-title">{t('tac.team')}</div>
      <div className="cx-ti-grid">
        {pane === 'with' ? <>
          {optRow(t('ti.mentality'), tm.mentality, [0, 1, 2, 3, 4].map((v) => [v, t(`ment.short.${v}`)] as [number, string]), (v) => setTeam({ mentality: v }))}
          {optRow(t('ti.passing'), tm.passing, lvl('ti.short', 'ti.mixed', 'ti.long'), (v) => setTeam({ passing: v }))}
          {optRow(t('ti.tempo'), tm.tempo, lvl('ti.slow', 'ti.normal', 'ti.fast'), (v) => setTeam({ tempo: v }))}
          {optRow(t('ti.width'), tm.width, lvl('ti.narrow', 'ti.normal', 'ti.wide'), (v) => setTeam({ width: v }))}
          {optRow(t('ti.counter'), tm.counter, yn, (v) => setTeam({ counter: v }))}
        </> : <>
          {optRow(t('ti.closingDown'), tm.closingDown, lvl('ti.rarely', 'ti.sometimes', 'ti.often'), (v) => setTeam({ closingDown: v }))}
          {optRow(t('ti.tackling'), tm.tackling, lvl('ti.easy', 'ti.normal', 'ti.hard'), (v) => setTeam({ tackling: v }))}
          {optRow(t('ti.marking'), tm.marking, [['zonal', t('ti.zonal')], ['man', t('ti.man')]], (v) => setTeam({ marking: v }))}
          {optRow(t('ti.offside'), tm.offside, yn, (v) => setTeam({ offside: v }))}
          {optRow(t('ti.menBehind'), !!tm.menBehind, yn, (v) => setTeam({ menBehind: v }))}
        </>}
      </div>
      <div className="cx-ti-title">{p && ind ? `${t('tac.individual')}: ${p.last}` : t('tac.individual')}</div>
      {p && ind ? (
        <div className="cx-ti-grid">
          {pane === 'with' ? <>
            {optRow(t('pi.runs'), ind.runs, lvl('tac.roleDef', 'tac.roleBal', 'tac.roleAtt'), (v) => setInd({ runs: v }))}
            {optRow(t('pi.longShots'), ind.longShots, lvl('ti.rarely', 'ti.mixed', 'ti.often'), (v) => setInd({ longShots: v }))}
            {optRow(t('pi.crossing'), ind.crossing, lvl('ti.rarely', 'ti.mixed', 'ti.often'), (v) => setInd({ crossing: v }))}
            {optRow(t('pi.runWithBall'), ind.runWithBall, yn, (v) => setInd({ runWithBall: v }))}
            {optRow(t('pi.throughBalls'), ind.throughBalls, yn, (v) => setInd({ throughBalls: v }))}
            {optRow(t('pi.freeRole'), ind.freeRole, yn, (v) => setInd({ freeRole: v }))}
            {optRow(t('pi.holdUp'), !!ind.holdUp, yn, (v) => setInd({ holdUp: v }))}
            {optRow(t('pi.passing'), ind.passing ?? -1, [[-1, t('ti.teamSetting')], ...lvl('ti.short', 'ti.mixed', 'ti.long')], (v) => setInd({ passing: v < 0 ? undefined : v }))}
            {optRow(t('pi.setPieces'), ind.setPieces ?? -1, [[-1, t('ti.auto')], ...lvl('sp.back', 'sp.normal', 'sp.forward')], (v) => setInd({ setPieces: v < 0 ? undefined : v }))}
          </> : <>
            {optRow(t('pi.tightMarking'), ind.tightMarking, yn, (v) => setInd({ tightMarking: v }))}
            {optRow(t('pi.closingDown'), ind.closingDown ?? -1, [[-1, t('ti.teamSetting')], ...lvl('ti.rarely', 'ti.sometimes', 'ti.often')], (v) => setInd({ closingDown: v < 0 ? undefined : v }))}
            {optRow(t('pi.tackling'), ind.tackling ?? -1, [[-1, t('ti.teamSetting')], ...lvl('ti.easy', 'ti.normal', 'ti.hard')], (v) => setInd({ tackling: v < 0 ? undefined : v }))}
          </>}
        </div>
      ) : <div className="cx-ti-empty">{t('cl.tac.pickSlot')}</div>}
    </div>
  );
}

/** En anden klubs taktik (CM 01/02 "Arsenal Tactics"): opstillingen fra deres seneste kamp, skrivebeskyttet */
export function ClubTacticsView({ club }: { club: number }) {
  const g = useGame()!;
  const { nav } = useNav();
  let last: { f: Fixture; date: string } | undefined;
  for (const f of Object.values(g.fixtures)) if (f.result && (f.home === club || f.away === club) && (!last || f.date > last.date)) last = { f, date: f.date };
  const opp = last ? (last.f.home === club ? last.f.away : last.f.home) : undefined;
  // samme opstilling som motoren vælger for klubben mod den modstander (aiTactic trækker ingen tilfældige tal)
  const tac = aiTactic(club, opp, last ? last.f.home === club : true);
  const players = squad(club);
  const byId = new Map(players.map((p) => [p.id, p]));
  const row = (p: Player, label: string, dim: boolean) => (
    <div key={p.id} className={`cx-tac-row ${dim ? 'rest' : 'xi'}`}>
      <span className="cx-tac-num">{label}</span>
      <span className="cx-tac-name cx-link" role="link" onClick={() => nav({ name: 'player', id: p.id })}>{p.first ? `${p.first} ` : ''}{p.last}</span>
      <span className="cx-tac-tag">{tac.captain === p.id ? t('cl.tac.capt') : ''}</span>
      <span className="cx-tac-val c-pos">{posStr(p)}</span>
    </div>
  );
  const xi = tac.lineup.map((id) => byId.get(id)).filter((p): p is Player => !!p);
  const bench = tac.bench.map((id) => byId.get(id)).filter((p): p is Player => !!p);
  return (
    <div className="cx-tac cx-tac-view">
      <Head title={t('nav.tactics')}>
        <button className="cx-greybtn" disabled>{t('cl.mt.teamInstr')}</button>
      </Head>
      <div className="cx-tac-bar">
        <span className="cx-tac-form">{opp !== undefined ? t('cl.tac.formationVs', { club: g.clubs[opp]?.short ?? '' }) : tac.formation}</span>
        <div className="cx-tac-panes">
          {(['overview', 'with', 'without'] as Pane[]).map((k) => <button key={k} className={k === 'overview' ? 'on' : ''} disabled={k !== 'overview'}>{t(`cl.tac.${k}`)}</button>)}
        </div>
      </div>
      <div className="cx-tac-body">
        <div className="cx-tac-left"><div className="cx-tac-list">
          {xi.map((p) => row(p, String(p.number ?? tac.lineup.indexOf(p.id) + 1), false))}
          {bench.map((p) => row(p, String(p.number ?? ''), true))}
        </div></div>
        <Pitch tac={tac} byId={byId} sel={null} drag={null} club={club} onSlot={() => {}} onDrop={() => {}} onDrag={() => {}} onMove={() => {}} />
      </div>
    </div>
  );
}

/** "Man Utd Penalty Takers" (CM 01/02): klik på spillerne i den rækkefølge, de skal sparke – nummeret står i den lilla knap */
function PenaltyTakers({ tac, players, change, onClose }: { tac: Tactic; players: Player[]; change: (t: Tactic) => void; onClose: () => void }) {
  const order = tac.penOrder !== undefined ? tac.penOrder.filter((id) => players.some((p) => p.id === id)) : tac.penalties ? [tac.penalties] : [];
  const set = (next: number[]) => change({ ...tac, penOrder: next, penalties: next[0] ?? tac.penalties });
  const toggle = (id: number) => set(order.includes(id) ? order.filter((x) => x !== id) : [...order, id].slice(0, 50));
  const list = players.slice().sort((a, b) => {
    const ia = order.indexOf(a.id), ib = order.indexOf(b.id);
    return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib) || roleRank(a) - roleRank(b);
  });
  const half = Math.ceil(list.length / 2);
  const row = (p: Player) => {
    const i = order.indexOf(p.id);
    return (
      <div key={p.id} className="cx-sq-row">
        <button className={`cx-pen-num ${i >= 0 ? 'on' : ''}`} onClick={() => toggle(p.id)}>{i >= 0 ? i + 1 : ''}</button>
        <span className="cx-sq-tag" />
        <button className={`cx-sq-name ${!available(p) ? 'unavail' : ''}`} onClick={() => toggle(p.id)}>{p.last}{p.first ? `, ${p.first[0]}` : ''}</button>
        <span className="cx-sq-info">{posStr(p)}</span>
      </div>
    );
  };
  // CM 01/02: de nummererede pladser øverst (1-25) og nederst (26-50)
  const slots = (from: number) => <div className="cx-pen-slots">{Array.from({ length: 25 }, (_, k) => <span key={k} className={order[from + k] ? 'on' : ''}>{from + k + 1}</span>)}</div>;
  return (
    <div className="cx-pens">
      <Head title={t('cl.tac.penTitle')}>
        <button className="cx-greybtn" onClick={() => set([...players].filter(available).sort((a, b) => b.attrs[A.penalties] + b.attrs[A.pressure] - a.attrs[A.penalties] - a.attrs[A.pressure]).slice(0, 11).map((p) => p.id))}>{t('tac.assistantPick')}</button>
        <span className="grow" />
        <button className="cx-greybtn" onClick={() => set([])}>{t('cl.tac.clearSquad')}</button>
      </Head>
      {slots(0)}
      <div className="cx-sq-cols">
        <div className="cx-sq-col">{list.slice(0, half).map(row)}</div>
        <div className="cx-sq-col">{list.slice(half).map(row)}</div>
      </div>
      {slots(25)}
      <div className="cx-ts-buttons"><button className="primary cx-pen-done" onClick={onClose}>{t('common.ok')}</button></div>
    </div>
  );
}
const roleRank = (p: Player) => ['GK', 'CB', 'FB', 'DM', 'CM', 'WM', 'AM', 'W', 'ST'].indexOf(naturalRole(p));
