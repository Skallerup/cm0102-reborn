import { useEffect, useRef, useState } from 'react';
import { benchSize } from '../../game/rules';
import { Info } from '../help';
import { A, roleScore, slotFit, slotRole, roleProfile } from '../../game/attributes';
import { gs, squad } from '../../game/state';
import { act } from '../../game/actions';
import { autoSelect, available, changeFormation, FORMATIONS, newTactic, runTarget, shapeName } from '../../game/tactics';
import type { Player, PlayerInstructions, PosKey, Side, Slot, Tactic, TeamInstructions } from '../../game/types';
import { t } from '../../i18n';
import { chemistry } from '../../game/personality';
import { Bar, Panel, PlayerLink, posStr } from '../components';
import { useGame } from '../core';
import { Head } from './common';
import { isRetro } from '../theme';
import { origLogic } from '../../game/rules';
import { movePost } from '../../game/engine/grid/tacticPositions';
import { ZonePitch, type Zone } from './ZonePitch';
import { TAKERS, TI_CHOICES, TI_LABEL, tiSetValue } from './Match';
import { ClassicTactics } from './TacticsClassic';
import { coarse } from './runs';
import { assistantSelect, pickableFor } from '../../game/sim';

export function Tactics() {
  const g = useGame()!;
  const [lastOpen, setLastOpen] = useState(false); // (hooks før det tidlige return, så skift af udseende ikke ændrer hook-rækkefølgen)
  if (isRetro() && !g.draft) return <ClassicTactics />;
  if (!g.tactic) g.tactic = autoSelect(newTactic('4-4-2'), squad(g.userClub));
  const set = (tac: Tactic) => act({ t: 'tactic', tactic: tac });
  // originale spil (CM 01/02): ingen er udtaget fra start – assistenten udtager holdet; originalens egne valg (Last Match, Clear Squad)
  const orig = origLogic();
  const empty = orig && !g.tactic.lineup.some(Boolean);
  return (
    <div>
      <Head title={t('nav.tactics')}>
        <button className={empty ? 'primary' : ''} onClick={() => set(assistantSelect(g.tactic!, g.userClub, pickableFor(g.userClub, squad(g.userClub))))}>{t('tac.assistantPick')}</button>
        {orig && <button onClick={() => set({ ...g.tactic!, lineup: g.tactic!.lineup.map(() => 0), bench: [] })}>{t('cl.sq.clear')}</button>}
        {orig && <button disabled={!g.lastMatchTactic} onClick={() => setLastOpen(!lastOpen)}>{t('cl.lastMatch')}</button>}
        <button onClick={() => act({ t: 'savedTactics', list: [...g.savedTactics.filter((x) => x.formation !== g.tactic!.formation), structuredClone(g.tactic!)].slice(-6) })}>{t('tac.save')}</button>
        {g.savedTactics.length > 0 && (
          <select value="" onChange={(e) => { const s = g.savedTactics[Number(e.target.value)]; if (s) set({ ...structuredClone(s), lineup: g.tactic!.lineup.length === s.lineup.length ? g.tactic!.lineup : s.lineup }); }}>
            <option value="">{t('tac.load')}</option>
            {g.savedTactics.map((s, i) => <option key={i} value={i}>{s.formation} ({t(`ment.${s.team.mentality}`)})</option>)}
          </select>
        )}
      </Head>
      {!g.draft && !orig && <ChemistryPanel />}
      {orig && lastOpen && g.lastMatchTactic && <LastMatchPanel tac={g.lastMatchTactic} />}
      <TacticEditor tactic={g.tactic} players={squad(g.userClub)} onChange={set} />
    </div>
  );
}

/** Pladsens betegnelse ud fra hvor den står på banen (x: 0 eget mål → 100 modstanderens, y: 0 venstre → 100 højre) */
export function slotAt(x: number, y: number): { pos: PosKey; side: Side } {
  const side: Side = y < 30 ? 'L' : y > 70 ? 'R' : 'C';
  const pos: PosKey = x < 15 && side === 'C' ? 'SW' : x < 27 ? 'D' : x < 36 ? (side === 'C' ? 'DM' : 'WB') : x < 56 ? 'M' : x < 70 ? 'AM' : 'ST';
  return { pos, side };
}

export { shapeName };

/** Banens koordinater i procent af tavlen */
const slotLeft = (s: Slot) => s.y;
const slotTop = (s: Slot) => 97 - s.x * 0.92;

export function TacticEditor({ tactic, players, onChange, matchMode, onSub, cond }: {
  tactic: Tactic; players: Player[]; onChange: (t: Tactic) => void; matchMode?: boolean; onSub?: (outId: number, inId: number) => void;
  /** under kampen: den aktuelle kondition pr. spiller (samme tal som i udskiftningsmenuen) */
  cond?: Record<number, number>;
}) {
  const condOf = (p: Player) => cond?.[p.id] ?? p.condition;
  // originale spil: CM 01/02's taktik (Overview · With Ball · Without Ball, SB1-SB9, Team Instructions, Penalty Takers)
  const orig = origLogic();
  const [pane, setPane] = useState<'overview' | 'with' | 'without'>('overview');
  const [zone, setZone] = useState<Zone>({ zx: 0, zy: 0 });
  const [pick, setPick] = useState<number | null>(null);
  const [penOpen, setPenOpen] = useState(false);
  const [sel, setSel] = useState<number | null>(null);
  const [drag, setDrag] = useState<number | null>(null);
  // fortryd: de seneste ændringer gemmes, så man kan klikke sig tilbage
  const [hist, setHist] = useState<Tactic[]>([]);
  const change = (next: Tactic) => { setHist((h) => [...h.slice(-39), tactic]); onChange(next); };
  const undo = () => { const prev = hist.at(-1); if (!prev) return; setHist(hist.slice(0, -1)); onChange(prev); };
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !e.shiftKey && el?.tagName !== 'INPUT' && el?.tagName !== 'TEXTAREA') { e.preventDefault(); undo(); }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });
  // flyt pladser (egen formation) og højrekliksmenu med spillerinstruktioner
  const [editPos, setEditPos] = useState(false);
  const [moving, setMoving] = useState<{ i: number; x: number; y: number } | null>(null);
  const [menu, setMenu] = useState<{ i: number; left: number; top: number } | null>(null);
  const pitchRef = useRef<HTMLDivElement>(null);
  // højreklik og træk fra en spiller = løbepil til nærmeste punkt i gitteret (som i det klassiske udseende – ejerens ønske 2026-11-10)
  const [rdrag, setRdrag] = useState<{ slot: number; x: number; y: number; moved: boolean } | null>(null);
  const rdragRef = useRef(rdrag);
  rdragRef.current = rdrag;
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
    change({ ...tactic, slots, formation: shapeName(slots) });
  };
  const setIndFor = (i: number, patch: Partial<PlayerInstructions>) => {
    const individual = tactic.individual.slice();
    individual[i] = { ...individual[i], ...patch };
    change({ ...tactic, individual });
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
      if (from >= 0) { lineup[from] = prev; lineup[slot] = pid; change({ ...tactic, lineup }); }
      else if (onSub && prev) onSub(prev, pid);
      return;
    }
    if (from >= 0) {
      lineup[from] = prev;
      lineup[slot] = pid;
    } else {
      lineup[slot] = pid;
      bench = bench.filter((x) => x !== pid);
      if (prev && bench.length < benchSize()) bench.push(prev);
    }
    change({ ...tactic, lineup, bench });
  };

  const toggleBench = (pid: number) => {
    if (matchMode) return;
    if (tactic.bench.includes(pid)) change({ ...tactic, bench: tactic.bench.filter((x) => x !== pid) });
    else if (tactic.bench.length < benchSize() && !inXI.has(pid)) change({ ...tactic, bench: [...tactic.bench, pid] });
  };

  const setTeam = (patch: Partial<TeamInstructions>) => change({ ...tactic, team: { ...tactic.team, ...patch } });
  const setInd = (patch: Partial<PlayerInstructions>) => {
    if (sel === null) return;
    const individual = tactic.individual.slice();
    individual[sel] = { ...individual[sel], ...patch };
    change({ ...tactic, individual });
  };

  const listed = players.slice().sort((a, b) => {
    if (selSlot) return (available(b) ? 1 : 0) - (available(a) ? 1 : 0) || roleScore(b, slotRole(selSlot)) * slotFit(b, selSlot) - roleScore(a, slotRole(selSlot)) * slotFit(a, selSlot);
    return Number(inXI.has(b.id)) - Number(inXI.has(a.id)) || Number(tactic.bench.includes(b.id)) - Number(tactic.bench.includes(a.id)) || b.ca - a.ca;
  });
  const ind = sel !== null ? tactic.individual[sel] : null;
  const tm = tactic.team;
  // -1 = "holdets" / "auto" (feltet udelades); ja/nej-felter uden værdi tæller som nej
  const iopt = (k: keyof NonNullable<typeof ind>, vals: [number | boolean, string][]) => {
    if (!ind) return null;
    const cur = ind[k] ?? (typeof vals[0][0] === 'boolean' ? false : -1);
    return (
      <div className="ti-row">
        <div className="ti-label"><b>{t(`pi.${k}`)}</b><span className="muted">{t(`pih.${k}`)}</span></div>
        <div className="seg" role="radiogroup">
          {vals.map(([v, l]) => (
            <button key={String(v)} type="button" role="radio" aria-checked={cur === v} className={cur === v ? 'on' : ''}
              onClick={() => setInd({ [k]: v === -1 ? undefined : v } as Partial<NonNullable<typeof ind>>)}>{l}</button>
          ))}
        </div>
      </div>
    );
  };
  const opt = (k: keyof TeamInstructions, vals: [number | string | boolean, string][]) => (
    <div className="ti-row">
      <div className="ti-label"><b>{t(`ti.${k}`)}</b><span className="muted">{t(`tih.${k}`)}</span></div>
      <div className="seg" role="radiogroup">
        {vals.map(([v, l]) => (
          <button key={String(v)} type="button" role="radio" aria-checked={tm[k] === v} className={tm[k] === v ? 'on' : ''}
            onClick={() => setTeam({ [k]: v } as Partial<TeamInstructions>)}>{l}</button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="cols" style={{ gridTemplateColumns: 'minmax(280px, 420px) 1fr' }}>
      <div className="col">
        <div className="row">
          <select value={tactic.formation} disabled={matchMode && false} onChange={(e) => change(changeFormation(tactic, e.target.value))}>
            {!FORMATIONS.includes(tactic.formation) && <option value={tactic.formation}>{t('tac.customFormation', { name: tactic.formation })}</option>}
            {FORMATIONS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <button className="small" disabled={!hist.length} onClick={undo} title={t('tac.undoHint')}>↶ {t('tac.undo')}{hist.length ? ` (${hist.length})` : ''}</button>
          {!gs().draft && <button className={`small ${editPos ? 'primary' : ''}`} onClick={() => { setEditPos(!editPos); setSel(null); }} title={t('tac.movePosHint')}>✥ {t(editPos ? 'tac.movePosDone' : 'tac.movePos')}</button>}
          <span className="muted">{t(editPos ? 'tac.movePosHint' : coarse() ? 'tac.hint2Touch' : 'tac.hint2')}</span>
        </div>
        {orig && !matchMode && (
          <div className="seg" role="tablist">
            {(['overview', 'with', 'without'] as const).map((k) => <button key={k} type="button" role="tab" aria-selected={pane === k} className={pane === k ? 'on' : ''} onClick={() => setPane(k)}>{t(`cl.tac.${k}`)}</button>)}
          </div>
        )}
        {orig && !matchMode && pane !== 'overview' && (
          <ZonePitch modern colors={gs().clubs[gs().userClub]?.colors as [string, string] | undefined} tac={tactic} att={pane === 'with' ? 1 : 0} zone={zone} onZone={setZone} sel={sel}
            byId={(id) => byId.get(id)} onSelect={(i) => setSel(sel === i ? null : i)} onMove={gs().draft ? null : (i, x, y) => { if (tactic.slots[i]?.pos !== 'GK') change(movePost(tactic, i, pane === 'with' ? 1 : 0, zone.zx, zone.zy, x, y)); }} />
        )}
        <div className={`pitch ${editPos ? 'editing' : ''}`} ref={pitchRef} style={orig && !matchMode && pane !== 'overview' ? { display: 'none' } : undefined}
          onDragOver={(e) => { if (drag !== null && tactic.lineup.includes(drag)) e.preventDefault(); }}
          onDrop={(e) => {
            // sluppet på en tom plet: flyt spillerens plads dertil (egen formation)
            if (drag === null) return;
            // draft-liga: formationen er den, der blev draftet – pladser flyttes ikke ved et uheld
            if (gs().draft) { setDrag(null); return; }
            const i = tactic.lineup.indexOf(drag);
            setDrag(null);
            if (i < 0 || tactic.slots[i].pos === 'GK') return;
            const { x, y } = toPitch(e.clientX, e.clientY);
            const slots = tactic.slots.slice();
            slots[i] = { ...slotAt(x, y), x: Math.round(x), y: Math.round(y) };
            change({ ...tactic, slots, formation: shapeName(slots) });
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
            {/* løbepile sat med højreklik-træk (individual[i].run) – den, der trækkes, vises live */}
            {tactic.slots.map((s, i) => {
              const live = rdrag?.slot === i && rdrag.moved ? runTarget(s, rdrag.x, rdrag.y) : undefined;
              const r = live !== undefined ? live : tactic.individual[i]?.run;
              if (s.pos === 'GK' || !tactic.lineup[i] || !r) return null;
              const x1 = slotLeft(s), y1 = slotTop(s), x2 = slotLeft(r as Slot), y2 = slotTop(r as Slot);
              const len = Math.hypot(x2 - x1, y2 - y1) || 1, ux = (x2 - x1) / len, uy = (y2 - y1) / len;
              return <line key={`run${i}`} x1={x1 + ux * 4} y1={y1 + uy * 4} x2={x2 - ux * 1.5} y2={y2 - uy * 1.5} stroke="#fff" strokeWidth="1.6" strokeDasharray="3 2.4" vectorEffect="non-scaling-stroke" markerEnd="url(#arrowhead)" opacity={live !== undefined ? 0.6 : 0.95} />;
            })}
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
                onClick={() => {
                  if (editPos) return;
                  // tryk på en spiller og så en anden på banen: de bytter plads (mobilens udgave af træk)
                  if (sel !== null && sel !== i && tactic.lineup[sel] && !menu) { assign(i, tactic.lineup[sel]); setSel(null); return; }
                  setSel(sel === i ? null : i);
                }}
                onContextMenu={(e) => { if (!p) return; e.preventDefault(); }}
                onPointerDown={(e) => {
                  if (editPos && s.pos !== 'GK') { e.preventDefault(); (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); setMoving({ i, x: s.x, y: s.y }); return; }
                  // højre knap (touchpad: to fingre / ctrl + klik): træk = løbepil; uden træk åbnes menuen
                  if (p && !editPos && (e.button === 2 || (e.button === 0 && e.ctrlKey))) {
                    e.preventDefault(); e.stopPropagation();
                    const startX = e.clientX, startY = e.clientY;
                    if (e.button === 0) window.addEventListener('click', (ev) => { ev.stopPropagation(); ev.preventDefault(); }, { capture: true, once: true });
                    if (s.pos !== 'GK') setRdrag({ slot: i, ...toPitch(startX, startY), moved: false });
                    const move = (ev: PointerEvent) => { if (s.pos === 'GK') return; const moved = (rdragRef.current?.moved ?? false) || Math.hypot(ev.clientX - startX, ev.clientY - startY) > 4; setRdrag({ slot: i, ...toPitch(ev.clientX, ev.clientY), moved }); };
                    const up = (ev: PointerEvent) => {
                      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up);
                      const moved = s.pos !== 'GK' && ((rdragRef.current?.moved ?? false) || Math.hypot(ev.clientX - startX, ev.clientY - startY) > 4);
                      setRdrag(null);
                      if (!moved) { setSel(i); setMenu({ i, left: ev.clientX, top: ev.clientY }); return; }
                      const pt = toPitch(ev.clientX, ev.clientY);
                      setIndFor(i, { run: runTarget(s, pt.x, pt.y) ?? undefined });
                    };
                    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
                    return;
                  }
                  // langt tryk (mobil) åbner menuen
                  if (e.pointerType === 'touch' && p) { const { clientX, clientY } = e; press.current = setTimeout(() => { setSel(i); setMenu({ i, left: clientX, top: clientY }); }, 550); }
                }}
                onPointerUp={() => { if (press.current) { clearTimeout(press.current); press.current = null; } }}
                onPointerCancel={() => { if (press.current) { clearTimeout(press.current); press.current = null; } }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.stopPropagation(); if (drag !== null) assign(i, drag); setDrag(null); }}
                draggable={!!p && !editPos && !coarse()}
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
                {p && <div className="fit" style={{ color: fit > 0.85 ? '#9f9' : fit > 0.6 ? '#ff9' : '#f99' }}>{fit > 0.85 ? '●' : fit > 0.6 ? '◐' : '○'} {Math.round(condOf(p))}%</div>}
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
            <div className="ctx-menu" style={{ left: Math.max(4, Math.min(menu.left, window.innerWidth - 340)), top: Math.max(4, Math.min(menu.top, window.innerHeight - 300)) }} onClick={(e) => e.stopPropagation()}>
              <div className="ctx-title">{p.last} · {sl.pos}{sl.side !== 'C' ? ' ' + sl.side : ''}</div>
              <div className="ctx-row role">
                {([[0, '⬇', 'tac.roleDef'], [1, '●', 'tac.roleBal'], [2, '⬆', 'tac.roleAtt']] as const).map(([v, ic, k]) => (
                  <button key={v} className={`small ${ins.runs === v ? 'primary' : ''}`} onClick={(e) => { e.stopPropagation(); setIndFor(i, { runs: v }); }}>{ic} {t(k)}</button>
                ))}
              </div>
              {ins.run && <div className="ctx-row"><button className="small" onClick={(e) => { e.stopPropagation(); setIndFor(i, { run: undefined }); }}>{t('cl.tac.run.none')}</button></div>}
              {!orig && tri('longShots', t('pi.longShots'))}
              {!orig && tri('crossing', t('pi.crossing'))}
              {!orig && (
                <div className="ctx-toggles">
                  {tog('runWithBall', t('pi.runWithBall'))}
                  {tog('throughBalls', t('pi.throughBalls'))}
                  {tog('tightMarking', t('pi.tightMarking'))}
                  {tog('freeRole', t('pi.freeRole'))}
                </div>
              )}
            </div>
          );
        })()}
        {orig && <OrigBench tactic={tactic} byId={byId} pick={pick} setPick={setPick} change={change} matchMode={!!matchMode} />}
        {orig ? (
          <Panel title={t('tac.setPieces')}>
            <div className="col">
              <label className="row setpiece-row"><span>{t('tac.captain')}</span>
                <select value={tactic.captain} onChange={(e) => change({ ...tactic, captain: Number(e.target.value) })}>
                  <option value={0}>—</option>
                  {tactic.lineup.map((id) => byId.get(id)).filter(Boolean).map((p) => <option key={p!.id} value={p!.id}>{p!.last}</option>)}
                </select>
              </label>
              <button className={penOpen ? 'primary' : ''} onClick={() => setPenOpen(!penOpen)}>{t('cl.tac.penTakers')}</button>
            </div>
          </Panel>
        ) : (
        <Panel title={t('tac.setPieces')}>
          <div className="col">
            {(['captain', 'penalties', 'freeKicks', 'corners'] as const).map((k) => (
              <label key={k} className="row setpiece-row"><span>{t(`tac.${k}`)}</span>
                <select value={tactic[k]} onChange={(e) => change({ ...tactic, [k]: Number(e.target.value) })}>
                  <option value={0}>—</option>
                  {tactic.lineup.map((id) => byId.get(id)).filter(Boolean).map((p) => <option key={p!.id} value={p!.id}>{p!.last}</option>)}
                </select>
              </label>
            ))}
            {(['playmaker', 'targetMan'] as const).map((k) => (
              <label key={k} className="row setpiece-row"><span>{t(`tac.${k}`)}</span>
                <select value={tactic.team[k] ?? 0} onChange={(e) => change({ ...tactic, team: { ...tactic.team, [k]: Number(e.target.value) || undefined } })}>
                  <option value={0}>—</option>
                  {tactic.lineup.map((id) => byId.get(id)).filter(Boolean).map((p) => <option key={p!.id} value={p!.id}>{p!.last}</option>)}
                </select>
              </label>
            ))}
          </div>
        </Panel>
        )}
        {orig && penOpen && <PenaltyPanel tactic={tactic} players={players} change={change} />}
      </div>
      <div className="col">
        {orig ? <OrigTeamPanel tactic={tactic} players={players} change={change} /> : (
        <Panel title={t('tac.team')}>
          <div className="ti-groups">
            <div className="ti-group">
              <div className="ti-head">⚽ {t('tac.withBall')}</div>
              {opt('mentality', [0, 1, 2, 3, 4].map((v) => [v, t(`ment.short.${v}`)]))}
              {opt('passing', [[0, t('ti.short')], [1, t('ti.mixed')], [2, t('ti.long')]])}
              {opt('tempo', [[0, t('ti.slow')], [1, t('ti.normal')], [2, t('ti.fast')]])}
              {opt('width', [[0, t('ti.narrow')], [1, t('ti.normal')], [2, t('ti.wide')]])}
              {opt('counter', [[false, t('common.no')], [true, t('common.yes')]])}
            </div>
            <div className="ti-group">
              <div className="ti-head">🛡 {t('tac.withoutBall')}</div>
              {opt('closingDown', [[0, t('ti.rarely')], [1, t('ti.sometimes')], [2, t('ti.often')]])}
              {opt('tackling', [[0, t('ti.easy')], [1, t('ti.normal')], [2, t('ti.hard')]])}
              {opt('marking', [['zonal', t('ti.zonal')], ['man', t('ti.man')]])}
              {opt('offside', [[false, t('common.no')], [true, t('common.yes')]])}
              {opt('menBehind', [[false, t('common.no')], [true, t('common.yes')]])}
            </div>
          </div>
        </Panel>
        )}
        {ind && selSlot && !orig && (
          <Panel title={`${t('tac.individual')}: ${selSlot.pos}${selSlot.side !== 'C' ? ' ' + selSlot.side : ''} – ${byId.get(tactic.lineup[sel!])?.last ?? ''}`}>
            <div className="ti-groups">
              <div className="ti-group">
                <div className="ti-head">⚽ {t('tac.withBall')}</div>
                {iopt('runs', [[0, t('tac.roleDef')], [1, t('tac.roleBal')], [2, t('tac.roleAtt')]])}
                {iopt('longShots', [[0, t('ti.rarely')], [1, t('ti.mixed')], [2, t('ti.often')]])}
                {iopt('crossing', [[0, t('ti.rarely')], [1, t('ti.mixed')], [2, t('ti.often')]])}
                {iopt('runWithBall', [[false, t('common.no')], [true, t('common.yes')]])}
                {iopt('throughBalls', [[false, t('common.no')], [true, t('common.yes')]])}
                {iopt('holdUp', [[false, t('common.no')], [true, t('common.yes')]])}
                {iopt('passing', [[-1, t('ti.teamSetting')], [0, t('ti.short')], [1, t('ti.mixed')], [2, t('ti.long')]])}
                {iopt('setPieces', [[-1, t('ti.auto')], [0, t('sp.back')], [1, t('sp.normal')], [2, t('sp.forward')]])}
              </div>
              <div className="ti-group">
                <div className="ti-head">🛡 {t('tac.withoutBall')}</div>
                {iopt('tightMarking', [[false, t('common.no')], [true, t('common.yes')]])}
                {iopt('closingDown', [[-1, t('ti.teamSetting')], [0, t('ti.rarely')], [1, t('ti.sometimes')], [2, t('ti.often')]])}
                {iopt('tackling', [[-1, t('ti.teamSetting')], [0, t('ti.easy')], [1, t('ti.normal')], [2, t('ti.hard')]])}
                <div className="ti-head" style={{ marginTop: 6 }}>✦ {t('tac.roleHead')}</div>
                {iopt('freeRole', [[false, t('common.no')], [true, t('common.yes')]])}
              </div>
            </div>
          </Panel>
        )}
        <Panel title={selSlot ? t('tac.bestFor', { slot: `${selSlot.pos}${selSlot.side !== 'C' ? ' ' + selSlot.side : ''}` }) : t('tac.players')} className="flush">
          <div className="table-wrap" style={{ maxHeight: 420, overflowY: 'auto' }}>
            <table className="grid tac-players">
              <thead><tr><th></th><th>{t('col.pos')}</th><th>{t('col.name')}</th><th>{t('col.cond')}</th>{selSlot && <th>{t('tac.suit')}</th>}<th></th></tr></thead>
              <tbody>
                {listed.map((p) => {
                  const xi = tactic.lineup.indexOf(p.id);
                  const onBench = tactic.bench.includes(p.id);
                  const suit = selSlot ? Math.round(roleScore(p, slotRole(selSlot)) * slotFit(p, selSlot) * 10) / 10 : 0;
                  return (
                    <tr key={p.id} className={`clickable ${!available(p) ? 'injured' : ''}`} draggable onDragStart={() => setDrag(p.id)} onDragEnd={() => setDrag(null)}
                      onClick={() => { if (sel !== null && available(p)) assign(sel, p.id); else if (orig && !matchMode) setPick(pick === p.id ? null : p.id); }}>
                      <td>{xi >= 0 ? <span className="tag good">{orig ? (p.number ?? tactic.slots[xi].pos) : tactic.slots[xi].pos}</span> : onBench ? <span className="tag">{orig ? `SB${tactic.bench.indexOf(p.id) + 1}` : t('tac.sub')}</span> : ''}{orig && tactic.captain === p.id && <span className="tag warn">{t('cl.tac.capt')}</span>}{orig && pick === p.id && <span className="tag good">✓</span>}</td>
                      <td>{posStr(p)}</td>
                      <td><PlayerLink p={p} short />{p.injury && <span className="tag bad">{t('tag.inj')}</span>}{p.banned > 0 && <span className="tag bad">{t('tag.ban')}</span>}
                        {p.reserves && <span className="tag" title={t('cl.pl.inReserves')}>{t('cl.tag.Res')}</span>}
                        {selSlot && !orig && <RoleNote p={p} slot={selSlot} />}</td>
                      <td><Bar value={condOf(p)} /></td>
                      {selSlot && <td className="num">{suit.toFixed(1)}</td>}
                      <td>{!matchMode && p.reserves && <button className="small" title={t('cl.pl.inReserves')} onClick={(e) => { e.stopPropagation(); act({ t: 'reserves', pid: p.id, on: false }); }}>↑ {t('cl.pl.callUp')}</button>}{!matchMode && xi < 0 && available(p) && <button className="small" onClick={(e) => { e.stopPropagation(); toggleBench(p.id); }}>{onBench ? '−' : '+'} {t('tac.sub')}</button>}</td>
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

/** Kort beskrivelse af, hvorfor spilleren passer til pladsen: styrker, svagheder og om det er et kompromis */
function RoleNote({ p, slot }: { p: Player; slot: Slot }) {
  const rp = roleProfile(p, slotRole(slot), slot);
  const parts = [...rp.strengths.map((k) => t(`rp.s.${k}`)), ...rp.weaknesses.map((k) => t(`rp.w.${k}`))];
  if (!parts.length && !rp.compromise) return null;
  return (
    <div className="role-note">
      {rp.strengths.map((k) => <span key={k} className="good">{t(`rp.s.${k}`)}</span>)}
      {rp.weaknesses.map((k) => <span key={k} className="bad">{t(`rp.w.${k}`)}</span>)}
      {rp.compromise && <span className="warn">{t('rp.compromise')}</span>}
    </div>
  );
}

/** Kemiens faktorer (se chemistry() i personality.ts) */
const CHEM_ROWS = ['chem.nation', 'chem.tenure', 'chem.newcomers', 'chem.leaders', 'chem.captain', 'chem.pros', 'chem.trouble', 'chem.wantsAway', 'chem.camp'];

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
      <details className="chem-how">
        <summary>{t('chem.how')}</summary>
        <p>{t('chem.howEffect', { score: ch.score, pct: ((ch.score - 50) * 0.06).toFixed(1) })}</p>
        <table className="grid">
          <thead><tr><th>{t('chem.howFactor')}</th><th className="num">{t('chem.howNow')}</th><th className="num">{t('chem.howRange')}</th><th>{t('chem.howImprove')}</th></tr></thead>
          <tbody>
            {CHEM_ROWS.map((key) => {
              const v = ch.parts.find((x) => x.key === key)?.value ?? 0;
              return <tr key={key}><td>{t(`${key}.name`)}</td><td className={`num ${v > 0 ? 'good' : v < 0 ? 'bad' : 'muted'}`}>{v > 0 ? '+' : ''}{v}</td><td className="num muted">{t(`${key}.range`)}</td><td className="muted">{t(`${key}.how`)}</td></tr>;
            })}
          </tbody>
        </table>
      </details>
    </div>
  );
}

/** CM 01/02: de tomme/besatte bænkpladser SB1 … SB9 (en valgt spiller i listen sættes på en plads; en besat plads fjernes ved klik uden valgt spiller) */
function OrigBench({ tactic, byId, pick, setPick, change, matchMode }: { tactic: Tactic; byId: Map<number, Player>; pick: number | null; setPick: (n: number | null) => void; change: (t: Tactic) => void; matchMode: boolean }) {
  if (matchMode) return null;
  const n = Math.max(9, benchSize());
  return (
    <Panel title={t('match.subsTitle')}>
      <div className="orig-bench">
        {Array.from({ length: n }, (_, i) => {
          const id = tactic.bench[i];
          const p = id ? byId.get(id) : undefined;
          return (
            <button key={i} type="button" className={`orig-sb ${p ? 'full' : ''}`} disabled={!p && (pick === null || tactic.lineup.includes(pick))}
              onClick={() => {
                if (pick !== null && !tactic.lineup.includes(pick)) {
                  const bench = tactic.bench.filter((x) => x !== pick);
                  bench.splice(Math.min(i, bench.length), 0, pick);
                  change({ ...tactic, bench: bench.slice(0, n) }); setPick(null);
                } else if (p) change({ ...tactic, bench: tactic.bench.filter((x) => x !== id) });
              }}>
              <b>SB{i + 1}</b><span>{p ? `${p.number ?? ''} ${p.last}`.trim() : ''}</span>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

/** CM 01/02 "Team Instructions": Mentality, Passing, Tackling, Pressing, Offside Trap, Counter Attack, Men Behind Ball + frispark/hjørner/playmaker */
function OrigTeamPanel({ tactic, players, change }: { tactic: Tactic; players: Player[]; change: (t: Tactic) => void }) {
  const tm = tactic.team;
  const byId = new Map(players.map((p) => [p.id, p]));
  const val = (k: (typeof TI_CHOICES)[number]['k']) => { const v = tm[k]; return typeof v === 'boolean' ? (v ? 1 : 0) : (v ?? 0); };
  const taker = (k: (typeof TAKERS)[number]) => k === 'playmaker' ? (tm.playmaker ?? 0) : k === 'freeKicksR' ? (tactic.freeKicksR ?? tactic.freeKicks) : k === 'cornersR' ? (tactic.cornersR ?? tactic.corners) : tactic[k];
  const setTaker = (k: (typeof TAKERS)[number], id: number) => change(k === 'playmaker' ? { ...tactic, team: { ...tm, playmaker: id || undefined } } : { ...tactic, [k]: id });
  return (
    <Panel title={t('cl.mt.teamInstr')}>
      <div className="ti-groups">
        <div className="ti-group">
          {TI_CHOICES.map((c) => (
            <div key={c.k} className="ti-row">
              <div className="ti-label"><b>{t(TI_LABEL[c.k])}</b></div>
              <div className="seg" role="radiogroup">
                {[...c.opts].sort((x, y) => x[1] - y[1]).map(([l, o]) => <button key={l} type="button" role="radio" aria-checked={c.is(val(c.k), o)} className={c.is(val(c.k), o) ? 'on' : ''} onClick={() => change({ ...tactic, team: tiSetValue(tm, c.k, o) })}>{t(l)}</button>)}
              </div>
            </div>
          ))}
        </div>
        <div className="ti-group">
          {TAKERS.map((k) => (
            <label key={k} className="row setpiece-row"><span>{t(`cl.mt.ti.${k}`)}</span>
              <select value={taker(k)} onChange={(e) => setTaker(k, Number(e.target.value))}>
                <option value={0}>—</option>
                {tactic.lineup.map((id) => byId.get(id)).filter(Boolean).map((p) => <option key={p!.id} value={p!.id}>{p!.number ?? ''} {p!.last}</option>)}
              </select>
            </label>
          ))}
        </div>
      </div>
    </Panel>
  );
}

/** CM 01/02 "Penalty Takers": klik på spillerne i den rækkefølge, de skal sparke */
function PenaltyPanel({ tactic, players, change }: { tactic: Tactic; players: Player[]; change: (t: Tactic) => void }) {
  const order = tactic.penOrder !== undefined ? tactic.penOrder.filter((id) => players.some((p) => p.id === id)) : tactic.penalties ? [tactic.penalties] : [];
  const set = (next: number[]) => change({ ...tactic, penOrder: next, penalties: next[0] ?? tactic.penalties });
  const toggle = (id: number) => set(order.includes(id) ? order.filter((x) => x !== id) : [...order, id].slice(0, 50));
  const list = players.filter((p) => !p.reserves).sort((a, b) => (order.indexOf(a.id) < 0 ? 999 : order.indexOf(a.id)) - (order.indexOf(b.id) < 0 ? 999 : order.indexOf(b.id)) || b.ca - a.ca);
  return (
    <Panel title={t('cl.tac.penTitle')}>
      <div className="row" style={{ marginBottom: 8 }}>
        <button className="small" onClick={() => set([...players].filter(available).sort((a, b) => b.attrs[A.penalties] + b.attrs[A.pressure] - a.attrs[A.penalties] - a.attrs[A.pressure]).slice(0, 11).map((p) => p.id))}>{t('tac.assistantPick')}</button>
        <button className="small" onClick={() => set([])}>{t('cl.tac.clearSquad')}</button>
      </div>
      <div className="orig-pens">
        {list.map((p) => {
          const i = order.indexOf(p.id);
          return <button key={p.id} type="button" className={`orig-pen ${i >= 0 ? 'on' : ''}`} onClick={() => toggle(p.id)}><b>{i >= 0 ? i + 1 : ''}</b><span>{p.last}</span></button>;
        })}
      </div>
    </Panel>
  );
}

/** Last Match (CM 01/02): startopstillingen fra sidste kamp – kun til at se på */
function LastMatchPanel({ tac }: { tac: Tactic }) {
  const g = useGame()!;
  return (
    <Panel title={t('cl.mt.lastMatch')}>
      <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
        <span className="tag">{tac.formation}</span>
        {tac.lineup.filter(Boolean).map((id) => <span key={id} className="tag">{g.players[id]?.number ?? ''} {g.players[id]?.last ?? ''}</span>)}
      </div>
    </Panel>
  );
}
