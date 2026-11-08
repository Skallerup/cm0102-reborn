// CM 01/02's løbepile på taktikbanen: højreklik og træk en spiller → pil til nærmeste punkt i pladsgitteret (også skråt);
// et kort træk fjerner den, og et højreklik uden træk (touchpad: to fingre / ctrl + klik) åbner en menu med retningerne.
// Bruges af taktikskærmen og kampens taktik.
import { useEffect, useRef, useState } from 'react';
import { GRID_X, GRID_Y, runTarget, slotTaken, snapSlot } from '../../game/tactics';
import type { Slot } from '../../game/types';

type Pt = { x: number; y: number };
const left = (s: Pt) => s.y;
const top = (s: Pt) => 97 - s.x * 0.92;

/** Touchskærm (ingen mus): HTML5-træk slås fra, så et langt tryk kan tegne løbepile i stedet */
export const coarse = () => typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;

/**
 * Mobilens højreklik-og-træk: hold fingeren på en spiller (~0,4 s), og træk så. Før tiden er gået, ruller siden som normalt
 * (et træk over 8 px afbryder); bagefter holdes siden stille, og `end` får slutpunktet (moved = false: holdt uden at trække).
 */
export function holdDrag(e: React.TouchEvent, cb: { begin: (x: number, y: number) => void; move: (x: number, y: number) => void; end: (x: number, y: number, moved: boolean) => void; cancel?: () => void }) {
  if (e.touches.length !== 1) return;
  const sx = e.touches[0].clientX, sy = e.touches[0].clientY;
  let lx = sx, ly = sy, active = false, moved = false;
  const timer = setTimeout(() => { active = true; try { navigator.vibrate?.(12); } catch { /* ignorer */ } cb.begin(sx, sy); }, 380);
  const cleanup = () => { clearTimeout(timer); window.removeEventListener('touchmove', tm); window.removeEventListener('touchend', te); window.removeEventListener('touchcancel', tc); };
  const tm = (ev: TouchEvent) => {
    lx = ev.touches[0].clientX; ly = ev.touches[0].clientY;
    if (!active) { if (Math.hypot(lx - sx, ly - sy) > 8) cleanup(); return; }
    ev.preventDefault();
    if (Math.hypot(lx - sx, ly - sy) > 6) moved = true;
    cb.move(lx, ly);
  };
  // preventDefault på touchend: intet klik bagefter (ellers vælges spilleren/lukkes menuen)
  const te = (ev: TouchEvent) => { const was = active; cleanup(); if (was) { ev.preventDefault(); cb.end(lx, ly, moved); } };
  const tc = () => { const was = active; cleanup(); if (was) cb.cancel?.(); };
  window.addEventListener('touchmove', tm, { passive: false }); window.addEventListener('touchend', te, { passive: false }); window.addEventListener('touchcancel', tc);
}

export function useRunDrag(pitch: React.RefObject<HTMLDivElement | null>, onRun: (slot: number, run: Pt | null) => void, onMenu: (slot: number, x: number, y: number) => void) {
  const [live, setLive] = useState<{ slot: number; s: Slot; x: number; y: number } | null>(null);
  const moved = useRef(false);
  const toPitch = (cx: number, cy: number) => {
    const r = pitch.current!.getBoundingClientRect();
    const l = ((cx - r.left) / r.width) * 100, tp = ((cy - r.top) / r.height) * 100;
    return { x: Math.max(10, Math.min(90, (97 - tp) / 0.92)), y: Math.max(4, Math.min(96, l)) };
  };
  /** onPointerDown på en spiller (null = ikke tilladt, fx målmanden) */
  const start = (e: React.PointerEvent, slot: number, s: Slot) => {
    if (!pitch.current || !(e.button === 2 || (e.button === 0 && e.ctrlKey))) return;
    e.preventDefault(); e.stopPropagation();
    const sx = e.clientX, sy = e.clientY;
    moved.current = false;
    // ctrl + klik giver et almindeligt klik bagefter – det må ikke vælge spilleren eller lukke menuen
    if (e.button === 0) window.addEventListener('click', (ev) => { ev.stopPropagation(); ev.preventDefault(); }, { capture: true, once: true });
    const move = (ev: PointerEvent) => {
      if (Math.hypot(ev.clientX - sx, ev.clientY - sy) > 4) moved.current = true;
      if (moved.current) setLive({ slot, s, ...toPitch(ev.clientX, ev.clientY) });
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up);
      setLive(null);
      if (!moved.current && Math.hypot(ev.clientX - sx, ev.clientY - sy) <= 4) { onMenu(slot, ev.clientX, ev.clientY); return; }
      const pt = toPitch(ev.clientX, ev.clientY);
      onRun(slot, runTarget(s, pt.x, pt.y));
    };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
  };
  /** onTouchStart på en spiller: langt tryk + træk = pil, langt tryk uden træk = menuen */
  const touch = (e: React.TouchEvent, slot: number, s: Slot) => {
    if (!pitch.current) return;
    holdDrag(e, {
      begin: (x, y) => setLive({ slot, s, ...toPitch(x, y) }),
      move: (x, y) => setLive({ slot, s, ...toPitch(x, y) }),
      end: (x, y, mv) => { setLive(null); if (!mv) { onMenu(slot, x, y); return; } const pt = toPitch(x, y); onRun(slot, runTarget(s, pt.x, pt.y)); },
      cancel: () => setLive(null),
    });
  };
  /** pilen der vises lige nu for en plads (under træk: forhåndsvisningen) */
  const shown = (slot: number, s: Slot, run: Pt | undefined): Pt | null | undefined => (live?.slot === slot ? runTarget(s, live.x, live.y) : run);
  return { start, touch, shown, dragging: live !== null };
}

/** Pilene som stiplede linjer med pilespids, fra cirklens kant til lidt før punktet (som originalen) */
export function RunArrows({ items }: { items: { key: number | string; s: Slot; run: Pt | null | undefined }[] }) {
  return (
    <svg className="runs" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs><marker id="cx-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#fff" /></marker></defs>
      {items.map(({ key, s, run }) => {
        if (!run || s.pos === 'GK') return null;
        const x1 = left(s), y1 = top(s), x2 = left(run), y2 = top(run);
        const len = Math.hypot(x2 - x1, y2 - y1) || 1, ux = (x2 - x1) / len, uy = (y2 - y1) / len;
        return <line key={key} x1={x1 + ux * 4} y1={y1 + uy * 4} x2={x2 - ux * 1.5} y2={y2 - uy * 1.5} stroke="#fff" strokeWidth="1.1" strokeDasharray="3 2.5" vectorEffect="non-scaling-stroke" markerEnd="url(#cx-arrow)" />;
      })}
    </svg>
  );
}

/** Menuens retninger (touchpad): ét trin i hver af de 8 retninger */
export const RUN_DIRS = [['f', 1, 0], ['fl', 1, -1], ['fr', 1, 1], ['l', 0, -1], ['r', 0, 1], ['bl', -1, -1], ['br', -1, 1], ['b', -1, 0]] as const;
export const dirTarget = (s: Slot, fx: number, fy: number) => runTarget(s, s.x + fx * 14, s.y + fy * 18);

/**
 * Pladsgitteret, mens en spiller flyttes (træk eller klik → klik): de faste pladser som ringe og den, spilleren lander på,
 * fremhævet med navnet – så man kan se, hvor rækkerne (fx AM og F) går til. `self` = pladsen der flyttes (−1 = ukendt).
 */
export function SlotGuides({ pitch, active, slots, self }: { pitch: React.RefObject<HTMLDivElement | null>; active: boolean; slots: Slot[]; self: number }) {
  const [hot, setHot] = useState<Slot | null>(null);
  useEffect(() => {
    const el = pitch.current;
    setHot(null);
    if (!active || !el) return;
    const on = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const l = ((e.clientX - r.left) / r.width) * 100, tp = ((e.clientY - r.top) / r.height) * 100;
      setHot(snapSlot(Math.max(10, Math.min(90, (97 - tp) / 0.92)), Math.max(4, Math.min(96, l))));
    };
    const off = () => setHot(null);
    el.addEventListener('dragover', on); el.addEventListener('pointermove', on); el.addEventListener('pointerleave', off);
    return () => { el.removeEventListener('dragover', on); el.removeEventListener('pointermove', on); el.removeEventListener('pointerleave', off); };
  }, [active, pitch]);
  if (!active) return null;
  const name = (s: Slot) => `${s.pos === 'ST' ? 'F' : s.pos}${s.side === 'C' ? '' : s.side}`;
  return (
    <div className="cx-guides" aria-hidden="true">
      {GRID_X.flatMap((x) => GRID_Y.map((y) => {
        const s = snapSlot(x, y);
        const on = hot && hot.x === x && hot.y === y;
        const taken = slotTaken(slots, self, s);
        return <i key={`${x}-${y}`} className={`${on ? 'hot' : ''} ${taken ? 'taken' : ''}`} style={{ left: `${left(s)}%`, top: `${top(s)}%` }}>{on && <b>{name(s)}</b>}</i>;
      }))}
    </div>
  );
}
