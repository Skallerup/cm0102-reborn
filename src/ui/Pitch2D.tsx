// Klassisk 2D-kampvisning (inspireret af CM/FM): spillerne bevæger sig mellem deres forsvars- og
// angrebspositioner fra taktikken, alt efter hvor bolden er – så man kan se, hvad taktikken gør.
import { useEffect, useMemo, useState } from 'react';
import type { MatchSim } from '../game/engine/match';
import type { ShotRecord } from '../game/types';
import { hash01 } from '../game/rng';

export type Snap = ReturnType<MatchSim['pitch']>;
/** Straffespark: hvilket hold skyder, og hvor langt tilløbet er nået (0 opstilling, 1 tilløb, 2 skud). so = straffesparkskonkurrence */
type PenSnap = Snap & { pen: number; penStep: number; so?: boolean };

/** Hjørnespark: hvilket hold, fra hvilken side (0 = top, 2 = bund), hvem tager det, hvem afslutter, og hvor langt vi er (0 klar, 1 indlæg, 2 afslutning/clearing) */
type CornerSnap = Snap & { corner: { team: number; lane: number; taker: number; target?: number; step: number; cleared?: boolean } };

/** Hjørnesparksopstilling: skytten ved flaget, angribere og forsvarere i feltet, resten længere ude */
function cornerLayout(s: CornerSnap): { pos: Map<number, [number, number]>; ball: [number, number]; holder?: Snap['players'][number] } {
  const c = s.corner;
  const toRight = c.team === 0;
  const dir = toRight ? 1 : -1;
  const goalX = toRight ? 100 : 0;
  const flag: [number, number] = [toRight ? 99.3 : 0.7, c.lane === 0 ? 1.5 : 98.5];
  const pos = new Map<number, [number, number]>();
  const att = s.players.filter((p) => p.team === c.team && !p.gk && p.id !== c.taker)
    .sort((a, b) => dir * (b.ax - a.ax)); // de mest offensive først
  const def = s.players.filter((p) => p.team !== c.team && !p.gk);
  // fem angribere i feltet (afslutteren foran), to ved feltets kant, resten bliver hjemme
  const target = att.find((p) => p.id === c.target);
  const inBox = [...(target ? [target] : []), ...att.filter((p) => p !== target)].slice(0, 5);
  const spots: [number, number][] = [[8, 50 + (c.lane === 0 ? -4 : 4)], [6, 38], [11, 60], [13, 45], [5, 64]];
  inBox.forEach((p, i) => pos.set(p.id, [goalX - dir * spots[i][0], spots[i][1]]));
  const rest = att.filter((p) => !inBox.includes(p));
  rest.forEach((p, i) => pos.set(p.id, i < 2 ? [goalX - dir * 20, 38 + i * 24] : [50 - dir * (6 + i * 3), 30 + ((i * 17) % 40)]));
  // forsvarerne markerer angriberne i feltet (lidt nærmere målet), resten dækker stolper og kant
  def.forEach((p, i) => {
    const m = inBox[i];
    if (m) { const [x, y] = pos.get(m.id)!; pos.set(p.id, [x + dir * 2.6, y + 3]); }
    else pos.set(p.id, i % 2 ? [goalX - dir * 2, c.lane === 0 ? 44 : 56] : [goalX - dir * (16 + i), 30 + ((i * 13) % 40)]);
  });
  for (const p of s.players.filter((x) => x.gk)) pos.set(p.id, p.team === c.team ? [toRight ? 8 : 92, 50] : [toRight ? 98.5 : 1.5, 50]);
  const taker = s.players.find((p) => p.id === c.taker);
  if (taker) pos.set(taker.id, [flag[0] - dir * 1.2, flag[1] + (c.lane === 0 ? 1.5 : -1.5)]);
  let ball: [number, number] = flag;
  let holder = taker;
  if (c.step >= 1 && inBox[0]) {
    const [x, y] = pos.get(inBox[0].id)!;
    ball = [x + dir * 0.8, y];
    holder = inBox[0];
  }
  if (c.step >= 2) {
    if (c.cleared) {
      // forsvaret header bolden væk
      ball = [goalX - dir * 24, c.lane === 0 ? 30 : 70];
      holder = undefined;
    } else if (s.shot) {
      const o = s.shot.outcome;
      ball = o === 'goal' || o === 'offside' ? [goalX - dir * 0.5, 47] : o === 'saved' ? [goalX - dir * 2, 51] : o === 'blocked' ? [goalX - dir * 9, 50] : missSpot(toRight, s.moment);
    }
  }
  return { pos, ball, holder };
}

/** Direkte frispark: skytten ~22 m fra mål, en mur på fire, målmanden på stregen */
type FkSnap = Snap & { fk: number; fkStep: number; fkY: number };
function fkLayout(s: FkSnap): { pos: Map<number, [number, number]>; ball: [number, number]; holder?: Snap['players'][number] } {
  const toRight = s.fk === 0;
  const dir = toRight ? 1 : -1;
  const goalX = toRight ? 100 : 0;
  const bx = goalX - dir * 21, by = s.fkY;
  const pos = new Map<number, [number, number]>();
  const shooter = s.players.find((p) => p.id === s.holder);
  const def = s.players.filter((p) => p.team !== s.fk && !p.gk);
  const att = s.players.filter((p) => p.team === s.fk && !p.gk && p.id !== shooter?.id);
  // muren: fire forsvarere 9 m fra bolden mellem bold og mål
  const wx = bx + dir * 8.5, wy = by + (50 - by) * 0.4;
  def.forEach((p, i) => pos.set(p.id, i < 4 ? [wx, wy - 4.5 + i * 3] : [goalX - dir * (6 + (i % 3) * 3), 34 + ((i * 11) % 32)]));
  att.forEach((p, i) => pos.set(p.id, i < 4 ? [goalX - dir * (7 + (i % 2) * 3), 38 + i * 7] : [50 - dir * (5 + i), 25 + ((i * 13) % 50)]));
  for (const p of s.players.filter((x) => x.gk)) pos.set(p.id, p.team === s.fk ? [toRight ? 8 : 92, 50] : [goalX - dir * 1.5, 48]);
  if (shooter) pos.set(shooter.id, [bx - dir * (s.fkStep === 0 ? 4 : 1), by + 1.5]);
  let ball: [number, number] = [bx, by];
  if (s.shot) {
    const o = s.shot.outcome as string;
    ball = o === 'goal' ? [goalX - dir * 0.5, 45] : o === 'saved' ? [goalX - dir * 2, 47] : o === 'post' ? [goalX - dir * 0.4, 44.3] : o === 'blocked' ? [wx - dir * 1, wy] : missSpot(toRight, s.moment);
  }
  return { pos, ball, holder: shooter };
}

/**
 * Straffesparksopstilling: skytten ved pletten, målmanden på stregen, alle andre uden for feltet.
 * I en straffesparkskonkurrence skydes der altid mod samme mål, og spillerne står i midtercirklen.
 */
function penLayout(s: PenSnap): { pos: Map<number, [number, number]>; ball: [number, number]; holder?: Snap['players'][number] } {
  const toRight = s.so ? true : s.pen === 0;
  const dir = toRight ? 1 : -1;
  const goalX = toRight ? 100 : 0;
  const spotX = toRight ? 89 : 11;
  const edgeX = toRight ? 80 : 20;
  const pos = new Map<number, [number, number]>();
  const shooter = s.players.find((p) => p.id === s.holder);
  // skuddets side og målmandens gæt (samme for alle billeder af sparket)
  const aim = hash01(Math.floor(s.moment / 10), s.holder, 21) < 0.5 ? -1 : 1;
  const out = s.penStep >= 2 ? s.shot?.outcome : undefined;
  const dive = out === 'saved' ? aim : out === 'goal' ? (hash01(Math.floor(s.moment / 10), s.holder, 22) < 0.8 ? -aim : aim) : out ? (hash01(Math.floor(s.moment / 10), s.holder, 23) < 0.5 ? -1 : 1) : 0;
  const k = [0, 0];
  for (const p of s.players) {
    if (p.id === shooter?.id) continue;
    if (p.gk) {
      const defending = p.team !== s.pen;
      if (defending) pos.set(p.id, [goalX - dir * (dive ? 1.6 : 1), 50 + dive * 5.5]);
      else pos.set(p.id, s.so ? [goalX - dir * 13, 17] : [p.team === 0 ? 6 : 94, 50]);
      continue;
    }
    const i = k[p.team]++;
    if (s.so) {
      // midtercirklen: hvert hold i to rækker på sin side af midterlinjen
      const row = i % 2, col = Math.floor(i / 2) % 5;
      pos.set(p.id, [50 + (p.team === 0 ? -1 : 1) * (2.6 + row * 4.4), 36 + col * 7]);
      continue;
    }
    // spredt i to rækker uden for feltet
    const n = k[0] + k[1] - 1;
    const row = n % 2, col = Math.floor(n / 2) % 9;
    pos.set(p.id, [edgeX - dir * (row * 6 + Math.abs(col - 4) * 0.8), 20 + col * 7.5 + row * 3.5]);
  }
  const back = s.penStep === 0 ? 6 : s.penStep === 1 ? 2 : 0.5;
  if (shooter) pos.set(shooter.id, [spotX - dir * back, 50 + (s.penStep === 0 ? 3 : 1)]);
  let ball: [number, number] = [spotX, 50];
  if (out) {
    ball = out === 'goal' || out === 'offside' ? [goalX - dir * 0.5, 50 + aim * 4] : out === 'saved' ? [goalX - dir * 4.5, 50 + aim * 9] : [goalX + dir * 0.5, 50 + aim * 10.5];
  }
  return { pos, ball, holder: shooter };
}
const W = 105, H = 68;

/** Hvor bolden ender ved et forbiskud: lige uden for stolpen eller bag mål (over overliggeren) – aldrig langt væk */
function missSpot(toRight: boolean, seed: number): [number, number] {
  const u = hash01(seed, 13, 3), v = hash01(seed, 14, 4);
  const lineX = toRight ? 100.9 : -0.9;
  if (u < 0.35) return [toRight ? 101.6 : -1.6, 46.5 + v * 7]; // over mål
  return [lineX, u < 0.68 ? 42.5 - v * 3 : 57.5 + v * 3]; // forbi stolpen
}

/** Zonens midte (0-100 i begge akser; hold 0 angriber mod højre) */
function zoneCenter(s: Snap): [number, number] {
  const b = Math.floor(s.zone / 3), l = s.zone % 3;
  return [10 + b * 20, 16.67 + l * 33.33];
}

const clampP = (v: number, lo = 1, hi = 99) => Math.max(lo, Math.min(hi, v));

/**
 * Spillernes positioner ud fra taktikken og boldens zone – og bolden ved boldholderens fødder.
 * Returnerer positionerne, boldens placering og hvem der har bolden.
 */
function layout(s: Snap, gap = 3.2): { pos: Map<number, [number, number]>; ball: [number, number]; holder?: Snap['players'][number] } {
  if ((s as PenSnap).pen !== undefined) return penLayout(s as PenSnap);
  if ((s as CornerSnap).corner) return cornerLayout(s as CornerSnap);
  if ((s as FkSnap).fk !== undefined) return fkLayout(s as FkSnap);
  const [zx, zy] = zoneCenter(s);
  const pos = new Map<number, [number, number]>();
  for (const p of s.players) {
    const prog = p.team === 0 ? zx / 100 : 1 - zx / 100; // hvor langt bolden er i holdets angrebsretning
    const attacking = p.team === s.poss;
    const f = attacking ? 0.25 + 0.6 * prog : 0.1 * prog;
    const bx0 = p.dx + (p.ax - p.dx) * f, by0 = p.dy + (p.ay - p.dy) * f;
    let x = bx0, y = by0;
    if (p.gk) y = 50 + (zy - 50) * 0.12;
    else {
      // holdet trækker sig lidt sammen mod bolden – men ikke langt væk fra sin plads
      x += (zx - x) * 0.1;
      y += (zy - y) * 0.14;
      const dx = x - bx0, dy = y - by0, d = Math.hypot(dx, dy), max = 9;
      if (d > max) { x = bx0 + (dx / d) * max; y = by0 + (dy / d) * max; }
    }
    x += (hash01(s.moment, p.id, 5) - 0.5) * 1.2;
    y += (hash01(s.moment, p.id, 6) - 0.5) * 1.2;
    pos.set(p.id, [clampP(x), clampP(y, 2, 98)]);
  }
  // boldholderen: den registrerede spiller – eller (efter et boldtab) holdkammeraten nærmest bolden
  let holder = s.players.find((p) => p.id === s.holder && p.team === s.poss);
  if (!holder) {
    let best = Infinity;
    for (const p of s.players) {
      if (p.team !== s.poss || p.gk) continue;
      const [x, y] = pos.get(p.id)!;
      const d = (x - zx) ** 2 + (y - zy) ** 2;
      if (d < best) { best = d; holder = p; }
    }
  }
  let ball: [number, number] = [zx, zy];
  if (holder) {
    // boldholderen går ind i zonen (halvvejs fra sin plads), og bolden er ved hans fødder
    const [hx, hy] = pos.get(holder.id)!;
    const nx = clampP(hx + (zx - hx) * 0.5), ny = clampP(hy + (zy - hy) * 0.5, 2, 98);
    pos.set(holder.id, [nx, ny]);
    const dir = holder.team === 0 ? 1 : -1;
    ball = [clampP(nx + dir * 1.4), ny + 0.6];
    // den nærmeste modspiller presser ham
    let best: { id: number; d: number } | null = null;
    for (const p of s.players) {
      if (p.team === holder.team || p.gk) continue;
      const [x, y] = pos.get(p.id)!;
      const d = (x - nx) ** 2 + (y - ny) ** 2;
      if (!best || d < best.d) best = { id: p.id, d };
    }
    if (best) { const [x, y] = pos.get(best.id)!; pos.set(best.id, [x + (nx + dir * 3 - x) * 0.55, y + (ny - y) * 0.55]); }
  }
  if (s.shot) {
    // afslutning: bolden på vej mod (eller i) mål
    const toRight = s.shot.team === 0;
    const inNet = s.shot.outcome === 'goal' || s.shot.outcome === 'offside';
    if ((s.shot.outcome as string) === 'post') {
      // på stolpen/overliggeren
      return { pos, ball: [toRight ? 99.6 : 0.4, 44.2], holder: undefined };
    }
    ball = s.shot.outcome === 'off' ? missSpot(toRight, s.moment) : [inNet ? (toRight ? 99.5 : 0.5) : toRight ? 96 : 4, 46 + hash01(s.moment, 14, 4) * 8];
  }
  // skub spillere, der står oven i hinanden, lidt fra hinanden
  const ids = [...pos.keys()];
  for (let it = 0; it < 3; it++) {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = pos.get(ids[i])!, b = pos.get(ids[j])!;
        const dx = b[0] - a[0], dy = (b[1] - a[1]) * 0.68, d = Math.hypot(dx, dy);
        if (d > 0 && d < gap) {
          const push = (gap - d) / 2 / d;
          if (ids[i] !== holder?.id) pos.set(ids[i], [a[0] - dx * push, a[1] - (dy / 0.68) * push]);
          if (ids[j] !== holder?.id) pos.set(ids[j], [b[0] + dx * push, b[1] + (dy / 0.68) * push]);
        }
      }
    }
  }
  return { pos, ball, holder };
}

const narrowQuery = '(max-width: 600px)';
function useNarrow(): boolean {
  const [narrow, setNarrow] = useState(() => typeof matchMedia !== 'undefined' && matchMedia(narrowQuery).matches);
  useEffect(() => {
    const m = matchMedia(narrowQuery);
    const on = () => setNarrow(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return narrow;
}

/** Straffesparkskonkurrencens tavle: hvert holds spark (✓ mål, ✕ brændt, ○ mangler af de første fem) */
export interface ShootoutTally { names: [string, string]; kicks: [string[], string[]] }

export function Pitch2D({ snap, me, colors, minute, banner, bannerCls, stepMs, flash, shootout, weather }: {
  snap: Snap; me: number; colors: [string, string, string, string]; minute: string; banner: string; bannerCls: string; stepMs: number; flash?: string; shootout?: ShootoutTally; weather?: string;
}) {
  const s = snap;
  // på smalle skærme er banen lille – større spillere og navne, så de kan læses
  const k = useNarrow() ? 1.4 : 1;
  const { pos, ball, holder } = useMemo(() => layout(s, 3.2 * k), [s.moment, s.zone, s.poss, s.holder, s.players.length, k]); // eslint-disable-line react-hooks/exhaustive-deps
  const [bx, by] = ball;
  const dur = `${Math.max(80, Math.min(900, stepMs))}ms`;
  const X = (x: number) => (x / 100) * W, Y = (y: number) => (y / 100) * H;
  return (
    <div className={`pitch2d wx-${weather ?? 'clear'}`}>
      {(weather === 'rain' || weather === 'heavyRain' || weather === 'snow') && <div className="p2d-wx" aria-hidden />}
      <svg viewBox={`-3 -3 ${W + 6} ${H + 6}`} role="img" aria-label="2D">
        <defs>
          <pattern id="stripes" width="10.5" height={H} patternUnits="userSpaceOnUse">
            <rect width="5.25" height={H} fill="#3f8f3a" /><rect x="5.25" width="5.25" height={H} fill="#3a8636" />
          </pattern>
        </defs>
        <rect x="-3" y="-3" width={W + 6} height={H + 6} fill="#357d32" rx="2" />
        <rect x="0" y="0" width={W} height={H} fill="url(#stripes)" />
        <g fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="0.35">
          <rect x="0" y="0" width={W} height={H} />
          <line x1={W / 2} y1="0" x2={W / 2} y2={H} />
          <circle cx={W / 2} cy={H / 2} r="9.15" />
          <rect x="0" y={H / 2 - 20.16} width="16.5" height="40.32" />
          <rect x={W - 16.5} y={H / 2 - 20.16} width="16.5" height="40.32" />
          <rect x="0" y={H / 2 - 9.16} width="5.5" height="18.32" />
          <rect x={W - 5.5} y={H / 2 - 9.16} width="5.5" height="18.32" />
          <rect x="-1.5" y={H / 2 - 3.66} width="1.5" height="7.32" />
          <rect x={W} y={H / 2 - 3.66} width="1.5" height="7.32" />
          <path d={`M 16.5 ${H / 2 - 7.3} A 9.15 9.15 0 0 1 16.5 ${H / 2 + 7.3}`} />
          <path d={`M ${W - 16.5} ${H / 2 - 7.3} A 9.15 9.15 0 0 0 ${W - 16.5} ${H / 2 + 7.3}`} />
        </g>
        <circle cx={W / 2} cy={H / 2} r="0.5" fill="#fff" />
        {s.players.map((p) => {
          const [x, y] = pos.get(p.id) ?? [p.dx, p.dy];
          const [bg, fg] = p.team === 0 ? [colors[0], colors[1]] : [colors[2], colors[3]];
          const mine = p.team === me;
          return (
            <g key={p.id} className="p2d-player" style={{ transform: `translate(${X(x)}px, ${Y(y)}px)`, transitionDuration: dur }}>
              <title>{p.name}</title>
              <circle r={1.9 * k} fill={bg} stroke={mine ? '#fff' : 'rgba(0,0,0,0.55)'} strokeWidth={0.35 * k} />
              <text y={0.65 * k} textAnchor="middle" fontSize={1.9 * k} fontWeight="800" fill={fg}>{p.num}</text>
              {p.id === holder?.id && <text y={-2.7 * k} textAnchor="middle" fontSize={1.9 * k} fontWeight="700" fill="#fff" stroke="rgba(0,0,0,0.6)" strokeWidth="0.25" paintOrder="stroke">{p.name}</text>}
            </g>
          );
        })}
        <g className="p2d-ball" style={{ transform: `translate(${X(bx)}px, ${Y(by)}px)`, transitionDuration: dur }}>
          <circle r={0.9 * Math.sqrt(k)} fill="#fff" stroke="#111" strokeWidth="0.2" />
        </g>
      </svg>
      <div className="p2d-minute">{minute}</div>
      {holder && <div className="p2d-poss" style={{ background: s.poss === 0 ? colors[0] : colors[2], color: s.poss === 0 ? colors[1] : colors[3] }}>⚽ {holder.name}</div>}
      {flash && <div className="p2d-flash">{flash}</div>}
      {shootout && (
        <div className="p2d-so">
          {[0, 1].map((tm) => (
            <div key={tm}>
              <span className="p2d-so-name" style={{ background: tm === 0 ? colors[0] : colors[2], color: tm === 0 ? colors[1] : colors[3] }}>{shootout.names[tm]}</span>
              {[...shootout.kicks[tm], ...new Array(Math.max(0, 5 - shootout.kicks[tm].length)).fill('')].map((o, i) => (
                <span key={i} className={`p2d-so-k ${o === 'goal' ? 'good' : o ? 'bad' : ''}`}>{o === 'goal' ? '✓' : o ? '✕' : '○'}</span>
              ))}
            </div>
          ))}
        </div>
      )}
      <div className={`p2d-banner ${bannerCls}`}>{banner}</div>
    </div>
  );
}

/**
 * En chance som korte 2D-billeder: opspil på midtbanen → aflevering → afslutning → udfald.
 * Bygget ud fra motorens registrerede skud, så det, man ser, er præcis det, der skete.
 */
export function highlightFrames(base: Snap, shot: ShotRecord, assister?: number): Snap[] {
  const team = shot.t;
  const lane = shot.zone % 3;
  const abs = (rb: number) => (team === 0 ? rb : 4 - rb);
  const mates = base.players.filter((p) => p.team === team && !p.gk);
  // opspilleren: en midtbanespiller (tættest på midten) – afleveringen: assistgiveren eller en offensiv holdkammerat
  const mid = mates.slice().sort((a, b) => Math.abs((a.dx + a.ax) / 2 - 50) - Math.abs((b.dx + b.ax) / 2 - 50))[0];
  const fwd = (assister && mates.find((p) => p.id === assister)) || mates.filter((p) => p.id !== shot.p).sort((a, b) => (team === 0 ? b.ax - a.ax : a.ax - b.ax))[0];
  const f = (rb: number, l: number, holder: number | undefined, k: number, sh: Snap['shot'] = null): Snap => ({ ...base, poss: team, zone: abs(rb) * 3 + l, holder: holder ?? shot.p, moment: base.moment * 10 + k, shot: sh });
  if (shot.corner) {
    const cn = (step: number, sh: Snap['shot'] = null): Snap => ({ ...f(4, lane, step === 0 ? shot.corner : shot.p, step, sh), corner: { team, lane: lane === 1 ? 0 : lane, taker: shot.corner!, target: shot.p, step } } as CornerSnap);
    return [cn(0), cn(1), cn(2, { team, outcome: shot.outcome, zone: shot.zone })];
  }
  const out: Snap['shot'] = { team, outcome: (shot.post ? 'post' : shot.outcome) as Snap['shot'] extends infer X ? X extends { outcome: infer O } ? O : never : never, zone: shot.zone };
  const wl = lane === 1 ? (hash01(base.moment, shot.p, 9) < 0.5 ? 0 : 2) : lane;
  if (shot.kind === 'fk') {
    const fy = 50 + (hash01(base.moment, shot.p, 11) - 0.5) * 22;
    const fk = (step: number, sh: Snap['shot'] = null): Snap => ({ ...f(3, 1, shot.p, step, sh), fk: team, fkStep: step, fkY: fy } as FkSnap);
    return [fk(0), fk(1), fk(2, out)];
  }
  // oprindelsen afgør, hvordan aktionen bygges op (taktik og attributter bag chancen)
  switch (shot.origin) {
    case 'counter': return [f(1, 1, shot.p, 1), f(2, 1, shot.p, 2), f(3, 1, shot.p, 3), f(4, 1, shot.p, 4), f(4, 1, shot.p, 5, out)];
    case 'through': return [f(2, 1, fwd?.id === shot.p ? mid?.id : (assister ?? mid?.id), 1), f(3, 1, shot.p, 2), f(4, 1, shot.p, 3), f(4, 1, shot.p, 4, out)];
    case 'cross': return [f(3, wl, assister ?? fwd?.id, 1), f(4, wl, assister ?? fwd?.id, 2), f(4, 1, shot.p, 3), f(4, 1, shot.p, 4, out)];
    case 'dribble': return [f(3, lane, shot.p, 1), f(4, lane, shot.p, 2), f(4, 1, shot.p, 3), f(4, 1, shot.p, 4, out)];
    case 'press': {
      // modstanderen har bolden i sit eget felt – presset tvinger fejlen frem
      const opp = base.players.find((p) => p.team !== team && !p.gk)?.id;
      return [{ ...f(4, lane, opp, 1), poss: 1 - team }, f(4, lane, shot.p, 2), f(4, 1, shot.p, 3, out)];
    }
  }
  if (shot.kind === 'cutback') return [f(3, wl, assister ?? fwd?.id, 1), f(4, wl, assister ?? fwd?.id, 2), f(4, 1, shot.p, 3), f(4, 1, shot.p, 4, out)];
  if (shot.kind === 'long') return [f(2, lane, mid?.id, 1), f(3, 1, shot.p, 2), f(3, 1, shot.p, 3, out)];
  if (shot.kind === 'pen') {
    const pen = (step: number, sh: Snap['shot'] = null): Snap => ({ ...f(4, 1, shot.p, step, sh), pen: team, penStep: step } as PenSnap);
    return [pen(0), pen(1), pen(2, { team, outcome: shot.outcome, zone: shot.zone })];
  }
  return [
    f(2, lane === 1 ? 1 : lane, mid?.id, 1),
    f(3, lane, fwd?.id, 2),
    f(4, lane, shot.p, 3),
    f(4, lane, shot.p, 4, out),
  ];
}

/** Et spark i straffesparkskonkurrencen: skytten lægger bolden → tilløb → udfald */
export function shootoutFrames(base: Snap, k: { t: number; p: number; outcome: string }): Snap[] {
  const pen = (step: number, sh: Snap['shot'] = null): Snap => ({ ...base, poss: k.t, zone: 13, holder: k.p, moment: base.moment * 10 + step, shot: sh, pen: k.t, penStep: step, so: true } as PenSnap);
  return [pen(0), pen(1), pen(2, { team: k.t, outcome: k.outcome as NonNullable<Snap['shot']>['outcome'], zone: 13 })];
}

/** Mellem sparkene i straffesparkskonkurrencen: alle i midtercirklen, bolden på pletten */
export function shootoutIdle(base: Snap, next: number): Snap {
  return { ...base, poss: next, zone: 13, holder: 0, shot: null, pen: next, penStep: 0, so: true } as PenSnap;
}

/** Et hjørnespark uden afslutning: klar ved flaget → indlæg → forsvaret rydder */
export function cornerFrames(base: Snap, c: { t: number; taker: number; lane: number }): Snap[] {
  const cn = (step: number): Snap => ({ ...base, poss: c.t, holder: c.taker, moment: base.moment * 10 + step, shot: null, corner: { team: c.t, lane: c.lane, taker: c.taker, step, cleared: true } } as CornerSnap);
  return [cn(0), cn(1), cn(2)];
}

/** Redningstackling: løberen er alene mod målmanden – den sidste forsvarer glider ind og tager bolden */
export function lastDitchFrames(base: Snap, h: { t: number; p: number; p2: number }): Snap[] {
  const abs = (rb: number) => (h.t === 0 ? rb : 4 - rb);
  const f = (rb: number, holder: number, poss: number, k: number): Snap => ({ ...base, poss, zone: abs(rb) * 3 + 1, holder, moment: base.moment * 10 + k, shot: null });
  return [f(3, h.p, h.t, 1), f(4, h.p, h.t, 2), f(4, h.p2, 1 - h.t, 3)];
}

/** Offside: afleveringen spilles frem, løberen er for tidligt af sted – linjevogteren løfter flaget */
export function offsideFrames(base: Snap, h: { t: number; p: number; p2: number }): Snap[] {
  const abs = (rb: number) => (h.t === 0 ? rb : 4 - rb);
  const f = (rb: number, holder: number, k: number): Snap => ({ ...base, poss: h.t, zone: abs(rb) * 3 + 1, holder, moment: base.moment * 10 + k, shot: null });
  return [f(2, h.p2, 1), f(4, h.p, 2)];
}

/** Frispark med kort eller en skade: modstanderen har bolden, og situationen stopper op */
export function incidentFrames(base: Snap, e: { t: number; p: number }): Snap[] {
  // den anden part har bolden et sted på midten af banen
  const victimTeam = 1 - e.t;
  const rb = 2;
  const abs = victimTeam === 0 ? rb : 4 - rb;
  const f = (k: number): Snap => ({ ...base, poss: victimTeam, zone: abs * 3 + 1, holder: 0, moment: base.moment * 10 + k, shot: null });
  return [f(1), f(2)];
}
