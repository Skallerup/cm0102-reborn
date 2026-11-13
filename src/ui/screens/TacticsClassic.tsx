// Taktik i klassisk tema (som i CM 01/02): værktøjslinjen Tactics ▾ · View ▾ · Last Match · Edit ▾, formationens
// navn over listen og fanerne Overview · With Ball · Without Ball over banen. Til venstre de 11 og udskifterne (grå) med
// trøjenummeret i det blå felt, tomme bænkpladser SB6 … SB9; til højre banen med spillerne som cirkler. Klik en spiller i
// listen og derefter en plads (eller træk og slip) for at sætte ham ind. Under "With Ball"/"Without Ball" vises holdets –
// og den valgte spillers – instruktioner. Ændringer er en kladde, der først gemmes ved Ok i bundbjælken (Cancel fortryder).
import { useRef, useState, type ReactNode } from 'react';
import { act } from '../../game/actions';
import { A, naturalRole, roleScore, slotFit, slotRole } from '../../game/attributes';
import { benchSize } from '../../game/rules';
import { gs, squad } from '../../game/state';
import { SlotGuides, coarse, holdDrag } from './runs';
import { FORMATIONS, autoSelect, available, changeFormation, newTactic, runTarget, slotTaken, snapFreeSlot } from '../../game/tactics';
import type { Fixture, Player, PlayerInstructions, Slot, Tactic } from '../../game/types';
import { aiTactic } from '../../game/sim';
import { money, t } from '../../i18n';
import { ClassicFoot, CxDrop, useClassicDialog, type DropItem } from '../classic';
import { askText } from '../confirm';
import { posStr } from '../components';
import { useGame, useNav, useRouteState } from '../core';
import { Head } from './common';
import { shapeName } from './Tactics';
import { LastMatchView, TeamInstrDialog } from './Match';
import { ZonePitch, type Zone } from './ZonePitch';
import { mirrorPositions, movePost, slotMoved } from '../../game/engine/grid/tacticPositions';
import { positionsValid } from '../../game/engine/grid/tacticTable';

const left = (s: Slot) => s.y;
const top = (s: Slot) => 97 - s.x * 0.92;
const slotName = (s: Slot) => `${s.pos === 'ST' ? 'F' : s.pos}${s.pos === 'GK' || s.side === 'C' ? '' : s.side}`;
type View = 'cond' | 'fit' | 'value';
type Pane = 'overview' | 'with' | 'without';

/** Edit → Copy/Copy All: udklipsholderen (gælder, så længe siden er åben) */
let clip: { one?: { slot: Slot; instr: PlayerInstructions }; all?: { slots: Slot[]; individual: PlayerInstructions[]; formation: string; positions?: Tactic['positions'] } } | null = null;

export function ClassicTactics() {
  const g = useGame()!;
  const { nav, back } = useNav();
  if (!g.tactic) g.tactic = autoSelect(newTactic('4-4-2'), squad(g.userClub));
  // CM 01/02: skærmen arbejder på en kladde – Ok gemmer, Cancel fortryder (kladden står på ruten, så en tur til spillerens side
  // og tilbage ikke mister den); Continue Game er grå, mens der er ugemte ændringer
  const [draft, setDraft] = useRouteState<Tactic | null>('tdraft', null);
  useClassicDialog(!!draft);
  const tac = draft ?? g.tactic;
  const players = squad(g.userClub).filter((p) => !p.reserves);
  const byId = new Map(players.map((p) => [p.id, p]));
  const [pane, setPane] = useRouteState<Pane>('tpane', 'overview');
  const [view0, setView] = useRouteState<View>('tview', 'cond');
  // With Ball / Without Ball: den valgte boldzone (originalens +0x2729; *estimeret* start: venstre zone ved eget mål som på ejerens billede)
  const [zone, setZone] = useRouteState<Zone>('tzone', { zx: 0, zy: 0 });
  const view: View = (['cond', 'fit', 'value'] as View[]).includes(view0) ? view0 : 'cond';
  // vores ekstra: hele truppen under bænkpladserne (originalen udtager de øvrige på trupskærmen)
  const [all, setAll] = useRouteState('tall', false);
  const [lastOpen, setLastOpen] = useRouteState('tlast', false);
  const [penScreen, setPenScreen] = useRouteState('tpens', false);
  const [tiOpen, setTiOpen] = useState(false);
  const [runMenu, setRunMenu] = useState<{ slot: number; x: number; y: number } | null>(null);
  const [pick, setPick] = useState<number | null>(null); // valgt spiller (i listen)
  const [slotSel, setSlotSel] = useState<number | null>(null); // valgt plads (på banen)
  const [drag, setDrag] = useState<number | null>(null);
  const [dragCapt, setDragCapt] = useState(false); // "capt" trækkes fra listen til en anden spiller
  const [hist, setHist] = useState<Tactic[]>([]);
  const change = (next: Tactic) => { setHist((h) => [...h.slice(-39), tac]); setDraft(next); };
  const ok = () => { if (draft) act({ t: 'tactic', tactic: draft }); setDraft(null); back(); };
  const cancel = () => { setDraft(null); back(); };
  const setRun = (slot: number, run: { x: number; y: number } | null) => {
    const individual = tac.individual.slice();
    individual[slot] = { ...individual[slot], run: run ?? undefined };
    change({ ...tac, individual });
  };
  const undo = () => { const prev = hist.at(-1); if (!prev) return; setHist(hist.slice(0, -1)); setDraft(prev); };

  /** Sæt en spiller på en plads (byt, hvis han allerede er på holdet; den der stod der, ryger på bænken) */
  const assign = (slot: number, pid: number) => {
    const lineup = tac.lineup.slice();
    let bench = tac.bench.slice();
    const prev = lineup[slot];
    const from = lineup.indexOf(pid);
    if (from >= 0) { lineup[from] = prev; lineup[slot] = pid; }
    else {
      lineup[slot] = pid;
      const bi = bench.indexOf(pid);
      // fra bænken: den der kommer ud, overtager hans plads på bænken
      if (bi >= 0 && prev) bench[bi] = prev;
      else { bench = bench.filter((x) => x !== pid); if (prev && bench.length < benchSize()) bench.push(prev); }
    }
    change({ ...tac, lineup, bench });
    setPick(null); setSlotSel(null);
  };
  /** Flyt en spillers plads på banen (egen formation, som i originalen): træk ham til en tom plet */
  const moveSlot = (i: number, x: number, y: number) => {
    if (i < 0 || tac.slots[i].pos === 'GK' || gs().draft) return;
    const slots = tac.slots.slice();
    // CM 01/02: spilleren lander på den nærmeste faste plads (ikke frit); optaget plads = ingen flytning
    const s = snapFreeSlot(slots, i, x, y);
    if (!s) { setPick(null); setSlotSel(null); return; }
    slots[i] = s;
    // løbepilen hører til den gamle plads
    const individual = tac.individual.slice();
    if (individual[i]?.run) individual[i] = { ...individual[i], run: undefined };
    // CM 01/02 (0x5b2ba0): pladsens positioner med/uden bold bliver den nye plads' kanoniske; de andres egne bevares
    change(slotMoved({ ...tac, slots, individual, formation: shapeName(slots) }, i));
    setPick(null); setSlotSel(null);
  };
  /** With Ball / Without Ball: en spiller trukket til et nyt punkt i den valgte boldzone (0x5b3560) */
  const movePos = (i: number, x: number, y: number) => {
    if (gs().draft || tac.slots[i]?.pos === 'GK') return;
    change(movePost(tac, i, pane === 'with' ? 1 : 0, zone.zx, zone.zy, x, y));
  };
  /** "capt" slippes på en spiller i startopstillingen: han bliver anfører (kladden – Ok gemmer) */
  const giveCaptain = (pid: number) => { setDragCapt(false); if (tac.lineup.includes(pid) && tac.captain !== pid) change({ ...tac, captain: pid }); };
  const toggleBench = (pid: number) => {
    if (tac.lineup.includes(pid)) return;
    if (tac.bench.includes(pid)) change({ ...tac, bench: tac.bench.filter((x) => x !== pid) });
    else if (tac.bench.length < benchSize()) change({ ...tac, bench: [...tac.bench, pid] });
  };
  /**
   * Byt to spillere i listen (CM 01/02: træk en spiller fra bænken op på en af de 11, eller omvendt): de bytter plads –
   * den der kommer ud, overtager den andens plads på bænken (eller ryger ud af truppen, hvis den anden ikke var udtaget)
   */
  const swapPlayers = (a: number, b: number) => {
    if (a === b) return;
    const lineup = tac.lineup.slice(), bench = tac.bench.slice();
    const la = lineup.indexOf(a), lb = lineup.indexOf(b), ba = bench.indexOf(a), bb = bench.indexOf(b);
    if (la < 0 && lb < 0 && ba < 0 && bb < 0) return;
    if (la >= 0) lineup[la] = b; else if (ba >= 0) bench[ba] = b;
    if (lb >= 0) lineup[lb] = a; else if (bb >= 0) bench[bb] = a;
    change({ ...tac, lineup, bench });
    setPick(null); setSlotSel(null);
  };
  const clickRow = (p: Player) => {
    // With/Without Ball: et klik på en af de 11 vælger hans prik på banen
    if (pane !== 'overview' && tac.lineup.includes(p.id)) { const i = tac.lineup.indexOf(p.id); setPick(null); setSlotSel(slotSel === i ? null : i); return; }
    if (slotSel !== null && available(p)) { assign(slotSel, p.id); return; }
    // klik en spiller og så en anden i listen: de bytter (fx bænk ↔ startopstilling)
    if (pick !== null && pick !== p.id && (tac.lineup.includes(pick) || tac.bench.includes(pick) || tac.lineup.includes(p.id) || tac.bench.includes(p.id))) { swapPlayers(pick, p.id); return; }
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
    if (view === 'value') return money(p.value);
    return <Cond p={p} />;
  };
  const row = (p: Player, label: string, kind: 'xi' | 'bench' | 'rest', slot?: Slot) => (
    <div key={p.id} className={`cx-tac-row ${kind} ${pick === p.id ? 'on' : ''} ${!available(p) ? 'unavail' : ''}`} draggable={!coarse()}
      onDragStart={(e) => { e.dataTransfer.setData('text/plain', String(p.id)); setTimeout(() => setDrag(p.id), 0); }} onDragEnd={() => setTimeout(() => setDrag(null), 0)} onClick={() => clickRow(p)}
      onDragOver={(e) => { if (dragCapt ? tac.lineup.includes(p.id) : drag !== null && drag !== p.id) e.preventDefault(); }}
      onDrop={(e) => { e.preventDefault(); if (dragCapt) giveCaptain(p.id); else if (drag !== null) swapPlayers(drag, p.id); setDrag(null); }}>
      <button className="cx-tac-num" title={kind === 'xi' ? undefined : t(kind === 'bench' ? 'cl.tac.fromBench' : 'cl.tac.toBench')}
        onClick={(e) => { e.stopPropagation(); toggleBench(p.id); }}>{label}</button>
      <span className="cx-tac-name" onDoubleClick={(e) => { e.stopPropagation(); nav({ name: 'player', id: p.id }); }}>{p.first ? `${p.first} ` : ''}{p.last}</span>
      {/* CM 01/02: kun "capt" i denne visning (frispark/hjørner/straffe står i deres egne menuer) */}
      <span className={`cx-tac-tag ${tac.captain === p.id ? 'capt' : ''}`} draggable={tac.captain === p.id && !coarse()}
        onDragStart={(e) => { e.stopPropagation(); e.dataTransfer.setData('text/plain', 'capt'); setTimeout(() => setDragCapt(true), 0); }} onDragEnd={() => setTimeout(() => setDragCapt(false), 0)}>{tac.captain === p.id ? t('cl.tac.capt') : ''}</span>
      <span className="cx-tac-pos">{posStr(p)}</span>
      <span className="cx-tac-val">{value(p, slot)}</span>
    </div>
  );
  /** tom bænkplads (SB6 …): en valgt/trukket spiller uden for truppen kan sættes på, hvis der er plads på bænken */
  const toBench = (pid: number | null) => { if (pid !== null && !tac.lineup.includes(pid) && !tac.bench.includes(pid) && tac.bench.length < benchSize()) { change({ ...tac, bench: [...tac.bench, pid] }); setPick(null); } };
  const emptyRow = (i: number) => (
    <div key={`sb${i}`} className="cx-tac-row cx-tac-sbfree" onClick={() => toBench(pick)}
      onDragOver={(e) => { if (drag !== null) e.preventDefault(); }} onDrop={(e) => { e.preventDefault(); toBench(drag); setDrag(null); }}>
      <span className="cx-tac-num">SB{i + 1}</span>
    </div>
  );

  const nm = (id: number) => { const p = byId.get(id); return p ? `${p.number ?? ''} ${p.first} ${p.last}`.trim() : ''; };
  const starters = tac.lineup.filter(Boolean);
  const saved = g.savedTactics;
  const savedLabel = (s2: Tactic) => s2.name ?? `${s2.formation} (${t(`ment.${s2.team.mentality}`)})`;
  // CM 01/02: Team Instructions · Penalty Takers · Set To Default ▸ · — · Load · Save · Save As · Delete
  const tacticItems: DropItem[] = [
    // CM 01/02: den samme grønne Team Instructions-boks som under kampen
    { key: 'ti', label: t('cl.mt.teamInstr'), onClick: () => setTiOpen(true) },
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
    change({ ...tac, slots: tac.slots.map((sl) => ({ ...sl, y: 100 - sl.y, side: flip(sl.side) })), individual: tac.individual.map((ind) => (ind?.run ? { ...ind, run: { x: ind.run.x, y: 100 - ind.run.y } } : ind)),
      positions: tac.positions && positionsValid(tac.slots, tac.positions) ? mirrorPositions(tac.positions) : undefined });
  };
  // CM 01/02: Undo · Copy · Copy All · Paste · Reflect · Show Runs (+ vores egne: assistenten, ryd holdet, playmaker/target)
  // den valgte plads (klikket på banen eller en spiller på holdet i listen)
  const curSlot = slotSel ?? (pick !== null && tac.lineup.includes(pick) ? tac.lineup.indexOf(pick) : null);
  const editItems: DropItem[] = [
    { key: 'undo', label: `${t('tac.undo')}${hist.length ? ` (${hist.length})` : ''}`, disabled: !hist.length, onClick: undo },
    // CM 01/02: Copy (den valgte spillers plads og instruktioner) · Copy All (hele formationen) · Paste
    { key: 'copy', label: t('cl.tac.copy'), disabled: curSlot === null, onClick: () => { if (curSlot !== null) clip = { one: { slot: { ...tac.slots[curSlot] }, instr: { ...tac.individual[curSlot] } } }; } },
    { key: 'copyall', label: t('cl.tac.copyAll'), onClick: () => { clip = { all: { slots: structuredClone(tac.slots), individual: structuredClone(tac.individual), formation: tac.formation, positions: tac.positions && structuredClone(tac.positions) } }; } },
    { key: 'paste', label: t('cl.tac.paste'), disabled: !clip || (!!clip.one && curSlot === null), onClick: () => {
      if (clip?.all) change({ ...tac, slots: structuredClone(clip.all.slots), individual: structuredClone(clip.all.individual), formation: clip.all.formation, positions: clip.all.positions && structuredClone(clip.all.positions) });
      else if (clip?.one && curSlot !== null && tac.slots[curSlot].pos !== 'GK') {
        const slots = tac.slots.slice(), individual = tac.individual.slice();
        if (!slotTaken(slots, curSlot, clip.one.slot)) slots[curSlot] = { ...clip.one.slot };
        individual[curSlot] = { ...clip.one.instr };
        change(slotMoved({ ...tac, slots, individual }, curSlot));
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
  const views: DropItem[] = [
    ...(['cond', 'fit', 'value'] as View[]).map((v) => ({ key: v, label: t(`cl.tac.v.${v}`), checked: view === v, onClick: () => setView(v) })),
    { key: 'sep', sep: true },
    { key: 'all', label: t('cl.tac.v.all'), checked: all, onClick: () => setAll(!all) },
  ];

  if (tiOpen) return <div className="cx-tac"><Head title={t('nav.tactics')} /><TeamInstrDialog tac={tac} on={tac.lineup.filter(Boolean)} editable onClose={() => setTiOpen(false)} onOk={(f) => { change(f(tac)); setTiOpen(false); }} /></div>;
  if (lastOpen && g.lastMatchTactic) return (
    <>
      <LastMatchView tac={g.lastMatchTactic} club={g.clubs[g.userClub]?.name ?? ''} />
      <ClassicFoot cols="3fr 1fr"><button className="cx-tac-lastback" onClick={() => setLastOpen(false)}>{t('cm.back')}</button><button disabled>{t('cm.next')}</button></ClassicFoot>
    </>
  );
  if (penScreen) return <PenaltyTakers tac={tac} players={players} change={change} onClose={() => setPenScreen(false)} />;
  return (
    <div className="cx-tac">
      <Head title={t('nav.tactics')}>
        <CxDrop label={t('nav.tactics')} items={tacticItems} />
        <CxDrop label={t('cl.sq.view')} items={views} />
        <span className="grow" />
        <button className="cx-greybtn cx-tac-last" disabled={!g.lastMatchTactic} onClick={() => setLastOpen(true)}>{t('cl.lastMatch')}</button>
        <CxDrop label={t('cl.tac.edit')} items={editItems} align="right" />
      </Head>
      <div className="cx-tac-body">
        <div className="cx-tac-left">
          <span className="cx-tac-form">{tac.formation}</span>
          <div className={`cx-tac-list ${all ? 'all' : ''}`}>
            {/* CM 01/02: trøjenummeret i det blå felt; de 11, udskifterne (grå) og de tomme bænkpladser op til SB9 – ens på Overview, With Ball og Without Ball */}
            {xi.map((p) => row(p, String(p.number ?? ''), 'xi', tac.slots[tac.lineup.indexOf(p.id)]))}
            {bench.map((p) => row(p, String(p.number ?? ''), 'bench'))}
            {Array.from({ length: Math.max(9, benchSize()) - bench.length }, (_, k) => emptyRow(bench.length + k))}
            {all && rest.map((p) => row(p, String(p.number ?? ''), 'rest'))}
          </div>
        </div>
        <div className="cx-tac-right">
          <div className="cx-tac-panes">
            {(['overview', 'with', 'without'] as Pane[]).map((k) => <button key={k} className={pane === k ? 'on' : ''} onClick={() => setPane(k)}>{t(`cl.tac.${k}`)}</button>)}
          </div>
          {pane !== 'overview' ? (
            <ZonePitch tac={tac} att={pane === 'with' ? 1 : 0} zone={zone} onZone={setZone} sel={curSlot} byId={(id) => byId.get(id)}
              onSelect={(i) => { setPick(null); setSlotSel(slotSel === i ? null : i); }} onMove={gs().draft ? null : movePos}
              dropCapt={dragCapt ? (i) => giveCaptain(tac.lineup[i]) : undefined} />
          ) : <Pitch tac={tac} byId={byId} sel={slotSel} drag={drag} onSlot={clickSlot} onRuns={(slot, x, y) => setRunMenu({ slot, x, y })} onRun={setRun} onDrop={(i) => { if (dragCapt) giveCaptain(tac.lineup[i]); else if (drag !== null) assign(i, drag); setDrag(null); }} onDrag={setDrag}
          onMove={(x, y) => {
            // sluppet (eller klikket) på en tom plet: en spiller på holdet flytter sin plads dertil
            const i = drag !== null ? tac.lineup.indexOf(drag) : slotSel;
            setDrag(null);
            if (i !== null && i >= 0) moveSlot(i, x, y);
          }} />}
        </div>
      </div>
      {runMenu && (
        <div className="cx-ctx-bg" onClick={() => setRunMenu(null)} onContextMenu={(e) => { e.preventDefault(); setRunMenu(null); }}>
          <div className="cx-ctx cx-drop-pop" style={{ left: Math.max(4, Math.min(runMenu.x, window.innerWidth - 230)), top: Math.max(4, Math.min(runMenu.y, window.innerHeight - 330)) }} onClick={(e) => e.stopPropagation()}>
            <div className="cx-menu-head">{t('cl.tac.run')}</div>
            {([['f', 1, 0], ['fl', 1, -1], ['fr', 1, 1], ['l', 0, -1], ['r', 0, 1], ['bl', -1, -1], ['br', -1, 1], ['b', -1, 0]] as const).map(([k, fx, fy]) => {
              const s0 = tac.slots[runMenu.slot];
              const target = runTarget(s0, s0.x + fx * 14, s0.y + fy * 18);
              const cur = tac.individual[runMenu.slot]?.run;
              const on = !!target && !!cur && cur.x === target.x && cur.y === target.y;
              return target && <button key={k} className={on ? 'on' : ''} onClick={() => { setRun(runMenu.slot, target); setRunMenu(null); }}><span className="cx-drop-check">{on ? '✓' : ''}</span>{t(`cl.tac.run.${k}`)}</button>;
            })}
            <button className={!tac.individual[runMenu.slot]?.run ? 'on' : ''} onClick={() => { setRun(runMenu.slot, null); setRunMenu(null); }}><span className="cx-drop-check">{!tac.individual[runMenu.slot]?.run ? '✓' : ''}</span>{t('cl.tac.run.none')}</button>
            <div className="cx-menu-head">{t('pi.runs')}</div>
            {[2, 1, 0].map((v) => {
              const cur = tac.individual[runMenu.slot]?.runs ?? 1;
              return <button key={v} className={cur === v ? 'on' : ''} onClick={() => { const individual = tac.individual.slice(); individual[runMenu.slot] = { ...individual[runMenu.slot], runs: v }; change({ ...tac, individual }); setRunMenu(null); }}><span className="cx-drop-check">{cur === v ? '✓' : ''}</span>{t(`cl.mt.lvl.g${v}`)}</button>;
            })}
          </div>
        </div>
      )}
      {/* CM 01/02 har ingen hjælpetekst; på touch står Løb-knappen her, når en plads er valgt */}
      {coarse() && slotSel !== null && tac.slots[slotSel]?.pos !== 'GK' && tac.lineup[slotSel] > 0 && (
        <div className="cx-tac-hint">
          <button className="cx-greybtn cx-run-btn" onClick={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); setRunMenu({ slot: slotSel, x: r.left, y: r.top - 320 }); }}>➚ {t('cl.tac.run')}</button>
        </div>
      )}
      <ClassicFoot cols="3fr 1fr">
        <button className="cx-tac-cancel" onClick={cancel}>{t('common.cancel')}</button>
        <button className="primary cx-tac-ok" onClick={ok}>{t('common.ok')}</button>
      </ClassicFoot>
    </div>
  );
}

function Pitch({ tac, byId, sel, drag, onSlot, onDrop, onDrag, onMove, club, onRuns, onRun }: {
  tac: Tactic; byId: Map<number, Player>; sel: number | null; drag: number | null;
  onSlot: (i: number) => void; onDrop: (i: number) => void; onDrag: (pid: number | null) => void; onMove: (x: number, y: number) => void; club?: number;
  /** højreklik (touchpad: klik med to fingre eller ctrl + klik) på en spiller: menuen med løb fremad */
  onRuns?: (slot: number, x: number, y: number) => void;
  /** CM 01/02: højreklik og træk en spiller → løbepil til nærmeste punkt i gitteret (null = fjern) */
  onRun?: (slot: number, run: { x: number; y: number } | null) => void;
}) {
  const [rdrag, setRdrag] = useState<{ slot: number; cx: number; cy: number; x: number; y: number; moved: boolean } | null>(null);
  const rdragRef = useRef(rdrag);
  rdragRef.current = rdrag;
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
        {tac.slots.map((s, i) => {
          const live = rdrag?.slot === i && rdrag.moved ? runTarget(s, rdrag.x, rdrag.y) : undefined;
          const r = live !== undefined ? live : tac.individual[i]?.run;
          if (s.pos === 'GK' || !tac.lineup[i] || !r) return null;
          // pilen starter ved cirklens kant og slutter lidt før punktet (som originalen)
          const x1 = left(s), y1 = top(s), x2 = left(r as Slot), y2 = top(r as Slot);
          const len = Math.hypot(x2 - x1, y2 - y1) || 1, ux = (x2 - x1) / len, uy = (y2 - y1) / len;
          return <line key={i} className={live !== undefined ? 'live' : ''} x1={x1 + ux * 4} y1={y1 + uy * 4} x2={x2 - ux * 1.5} y2={y2 - uy * 1.5} stroke="#fff" strokeWidth="1.1" strokeDasharray="3 2.5" vectorEffect="non-scaling-stroke" markerEnd="url(#cx-arrow)" />;
        })}
      </svg>
      {(() => { const self = sel ?? (drag !== null ? tac.lineup.indexOf(drag) : -1); return <SlotGuides pitch={ref} active={self >= 0 && tac.slots[self]?.pos !== 'GK' && club === undefined} slots={tac.slots} self={self} />; })()}
      {tac.slots.map((s, i) => {
        const p = byId.get(tac.lineup[i]);
        const gk = s.pos === 'GK';
        return (
          <div key={i} className={`cx-tac-slot ${sel === i ? 'on' : ''} ${drag !== null ? 'drop' : ''} ${p ? '' : 'empty'}`} style={{ left: `${left(s)}%`, top: `${top(s)}%` }}
            onClick={(e) => { e.stopPropagation(); onSlot(i); }} onContextMenu={(e) => { if (!onRuns || gk || !p) return; e.preventDefault(); e.stopPropagation(); }}
            onPointerDown={(e) => {
              // højre knap (touchpad: to fingre / ctrl + klik): træk en løbepil; uden træk åbnes menuen med retninger
              if (!onRun || gk || !p || !(e.button === 2 || (e.button === 0 && e.ctrlKey))) return;
              e.preventDefault(); e.stopPropagation();
              const startX = e.clientX, startY = e.clientY;
              if (e.button === 0) window.addEventListener('click', (ev) => { ev.stopPropagation(); ev.preventDefault(); }, { capture: true, once: true });
              setRdrag({ slot: i, cx: startX, cy: startY, ...toPitch(startX, startY), moved: false });
              const move = (ev: PointerEvent) => {
                const moved = (rdragRef.current?.moved ?? false) || Math.hypot(ev.clientX - startX, ev.clientY - startY) > 4;
                setRdrag({ slot: i, cx: startX, cy: startY, ...toPitch(ev.clientX, ev.clientY), moved });
              };
              const up = (ev: PointerEvent) => {
                window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up);
                const moved = (rdragRef.current?.moved ?? false) || Math.hypot(ev.clientX - startX, ev.clientY - startY) > 4;
                setRdrag(null);
                if (!moved) { onRuns?.(i, ev.clientX, ev.clientY); return; }
                const pt = toPitch(ev.clientX, ev.clientY);
                onRun(i, runTarget(s, pt.x, pt.y));
              };
              window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
            }}
            onTouchStart={(e) => {
              // mobil: hold fingeren på spilleren og træk = løbepil; holdt uden træk = menuen med retninger
              if (!onRun || gk || !p) return;
              holdDrag(e, {
                begin: (x, y) => setRdrag({ slot: i, cx: x, cy: y, ...toPitch(x, y), moved: false }),
                move: (x, y) => setRdrag({ slot: i, cx: x, cy: y, ...toPitch(x, y), moved: true }),
                end: (x, y, moved) => { setRdrag(null); if (!moved) { onRuns?.(i, x, y); return; } const pt = toPitch(x, y); onRun(i, runTarget(s, pt.x, pt.y)); },
                cancel: () => setRdrag(null),
              });
            }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onDrop(i); }}
            draggable={!!p && club === undefined && !coarse()} onDragStart={(e) => { if (!p) return; e.dataTransfer.setData('text/plain', String(p.id)); e.dataTransfer.effectAllowed = 'move'; setTimeout(() => onDrag(p.id), 0); }} onDragEnd={() => setTimeout(() => onDrag(null), 0)} title={`${slotName(s)}${p ? ` – ${p.first} ${p.last}` : ''}`}>
            {/* CM 01/02: trøjenummeret i en rød cirkel (målmanden grøn) */}
            <span className={`cx-tac-dot ${gk ? 'gk' : ''}`}>{p ? p.number ?? '' : ''}</span>
            <span className="cx-tac-nm">{p ? p.last : slotName(s)}</span>
          </div>
        );
      })}
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
    <div key={p.id} className={`cx-tac-row ${dim ? 'bench' : 'xi'}`}>
      <span className="cx-tac-num">{label}</span>
      <span className="cx-tac-name cx-link" role="link" onClick={() => nav({ name: 'player', id: p.id })}>{p.first ? `${p.first} ` : ''}{p.last}</span>
      <span className="cx-tac-tag">{tac.captain === p.id ? t('cl.tac.capt') : ''}</span>
      <span className="cx-tac-pos">{posStr(p)}</span>
      <span className="cx-tac-val"><Cond p={p} /></span>
    </div>
  );
  const xi = tac.lineup.map((id) => byId.get(id)).filter((p): p is Player => !!p);
  const bench = tac.bench.map((id) => byId.get(id)).filter((p): p is Player => !!p);
  return (
    <div className="cx-tac cx-tac-view">
      <Head title={t('nav.tactics')}>
        <button className="cx-greybtn" disabled>{t('cl.mt.teamInstr')}</button>
      </Head>
      <div className="cx-tac-body">
        <div className="cx-tac-left">
          <span className="cx-tac-form">{opp !== undefined ? t('cl.tac.formationVs', { club: g.clubs[opp]?.short ?? '' }) : tac.formation}</span>
          <div className="cx-tac-list">
            {xi.map((p) => row(p, String(p.number ?? tac.lineup.indexOf(p.id) + 1), false))}
            {bench.map((p) => row(p, String(p.number ?? ''), true))}
          </div>
        </div>
        <div className="cx-tac-right">
          <div className="cx-tac-panes">
            {(['overview', 'with', 'without'] as Pane[]).map((k) => <button key={k} className={k === 'overview' ? 'on' : ''} disabled={k !== 'overview'}>{t(`cl.tac.${k}`)}</button>)}
          </div>
          <Pitch tac={tac} byId={byId} sel={null} drag={null} club={club} onSlot={() => {}} onDrop={() => {}} onDrag={() => {}} onMove={() => {}} />
        </div>
      </div>
    </div>
  );
}

/** "Man Utd Penalty Takers" (CM 01/02): klik på spillerne i den rækkefølge, de skal sparke – nummeret står i den lilla knap */
export function PenaltyTakers({ tac, players, change, onClose }: { tac: Tactic; players: Player[]; change: (t: Tactic) => void; onClose: () => void }) {
  const order = tac.penOrder !== undefined ? tac.penOrder.filter((id) => players.some((p) => p.id === id)) : tac.penalties ? [tac.penalties] : [];
  const set = (next: number[]) => change({ ...tac, penOrder: next, penalties: next[0] ?? tac.penalties });
  const toggle = (id: number) => set(order.includes(id) ? order.filter((x) => x !== id) : [...order, id].slice(0, 50));
  const list = players.slice().sort((a, b) => {
    const ia = order.indexOf(a.id), ib = order.indexOf(b.id);
    return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib) || roleRank(a) - roleRank(b);
  });
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
        {/* skiftevis venstre/højre, så sorteringen læses række for række (ejerens ønske 2026-11-10) */}
        <div className="cx-sq-col">{list.filter((_, i) => i % 2 === 0).map(row)}</div>
        <div className="cx-sq-col">{list.filter((_, i) => i % 2 === 1).map(row)}</div>
      </div>
      {slots(25)}
      <div className="cx-ts-buttons"><button className="primary cx-pen-done" onClick={onClose}>{t('common.ok')}</button></div>
    </div>
  );
}
/** CM 01/02: konditionen i grønt ved 100 %, ellers orange */
const Cond = ({ p }: { p: Player }) => <span className={p.condition >= 99.5 ? 'cx-cond-full' : 'cx-cond-low'}>{Math.round(p.condition)}%</span>;
const roleRank = (p: Player) => ['GK', 'CB', 'FB', 'DM', 'CM', 'WM', 'AM', 'W', 'ST'].indexOf(naturalRole(p));
