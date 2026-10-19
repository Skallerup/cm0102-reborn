// Klassisk 2D-kampvisning (inspireret af CM/FM): spillerne bevæger sig mellem deres forsvars- og
// angrebspositioner fra taktikken, alt efter hvor bolden er – så man kan se, hvad taktikken gør.
import { useMemo } from 'react';
import type { MatchSim } from '../game/engine/match';
import type { ShotRecord } from '../game/types';
import { hash01 } from '../game/rng';

export type Snap = ReturnType<MatchSim['pitch']>;
/** Straffespark: hvilket hold skyder, og hvor langt tilløbet er nået (0 opstilling, 1 tilløb, 2 skud) */
type PenSnap = Snap & { pen: number; penStep: number };

/** Straffesparksopstilling: skytten ved pletten, målmanden på stregen, alle andre uden for feltet */
function penLayout(s: PenSnap): { pos: Map<number, [number, number]>; ball: [number, number]; holder?: Snap['players'][number] } {
  const toRight = s.pen === 0;
  const goalX = toRight ? 100 : 0;
  const spotX = toRight ? 89 : 11;
  const edgeX = toRight ? 80 : 20;
  const pos = new Map<number, [number, number]>();
  const shooter = s.players.find((p) => p.id === s.holder);
  let k = 0;
  for (const p of s.players) {
    if (p.id === shooter?.id) continue;
    if (p.gk) {
      const defending = p.team !== s.pen;
      pos.set(p.id, defending ? [toRight ? 99 : 1, 50] : [p.team === 0 ? 6 : 94, 50]);
      continue;
    }
    // spredt i to rækker uden for feltet
    const row = k % 2, col = Math.floor(k / 2) % 9;
    k++;
    pos.set(p.id, [edgeX - (toRight ? 1 : -1) * (row * 6 + Math.abs(col - 4) * 0.8), 20 + col * 7.5 + row * 3.5]);
  }
  const back = s.penStep === 0 ? 6 : s.penStep === 1 ? 2 : 0.5;
  if (shooter) pos.set(shooter.id, [spotX - (toRight ? back : -back), 50 + (s.penStep === 0 ? 3 : 1)]);
  let ball: [number, number] = [spotX, 50];
  if (s.shot) {
    const inNet = s.shot.outcome === 'goal';
    ball = inNet ? [goalX + (toRight ? -0.5 : 0.5), 46] : s.shot.outcome === 'saved' ? [toRight ? 98 : 2, 52] : [toRight ? 99.5 : 0.5, 38];
  }
  return { pos, ball, holder: shooter };
}
const W = 105, H = 68;

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
function layout(s: Snap): { pos: Map<number, [number, number]>; ball: [number, number]; holder?: Snap['players'][number] } {
  if ((s as PenSnap).pen !== undefined) return penLayout(s as PenSnap);
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
    ball = [inNet ? (toRight ? 99.5 : 0.5) : toRight ? 96 : 4, s.shot.outcome === 'off' ? (hash01(s.moment, 13, 3) < 0.5 ? 40 : 60) : 46 + hash01(s.moment, 14, 4) * 8];
  }
  // skub spillere, der står oven i hinanden, lidt fra hinanden
  const ids = [...pos.keys()];
  for (let it = 0; it < 3; it++) {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = pos.get(ids[i])!, b = pos.get(ids[j])!;
        const dx = b[0] - a[0], dy = (b[1] - a[1]) * 0.68, d = Math.hypot(dx, dy);
        if (d > 0 && d < 3.2) {
          const push = (3.2 - d) / 2 / d;
          if (ids[i] !== holder?.id) pos.set(ids[i], [a[0] - dx * push, a[1] - (dy / 0.68) * push]);
          if (ids[j] !== holder?.id) pos.set(ids[j], [b[0] + dx * push, b[1] + (dy / 0.68) * push]);
        }
      }
    }
  }
  return { pos, ball, holder };
}

export function Pitch2D({ snap, me, colors, minute, banner, bannerCls, stepMs, flash }: {
  snap: Snap; me: number; colors: [string, string, string, string]; minute: string; banner: string; bannerCls: string; stepMs: number; flash?: string;
}) {
  const s = snap;
  const { pos, ball, holder } = useMemo(() => layout(s), [s.moment, s.zone, s.poss, s.holder, s.players.length]); // eslint-disable-line react-hooks/exhaustive-deps
  const [bx, by] = ball;
  const dur = `${Math.max(80, Math.min(900, stepMs))}ms`;
  const X = (x: number) => (x / 100) * W, Y = (y: number) => (y / 100) * H;
  return (
    <div className="pitch2d">
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
              <circle r="1.9" fill={bg} stroke={mine ? '#fff' : 'rgba(0,0,0,0.55)'} strokeWidth="0.35" />
              <text y="0.65" textAnchor="middle" fontSize="1.9" fontWeight="800" fill={fg}>{p.num}</text>
              {p.id === holder?.id && <text y="-2.7" textAnchor="middle" fontSize="1.9" fontWeight="700" fill="#fff" stroke="rgba(0,0,0,0.6)" strokeWidth="0.25" paintOrder="stroke">{p.name}</text>}
            </g>
          );
        })}
        <g className="p2d-ball" style={{ transform: `translate(${X(bx)}px, ${Y(by)}px)`, transitionDuration: dur }}>
          <circle r="0.9" fill="#fff" stroke="#111" strokeWidth="0.2" />
        </g>
      </svg>
      <div className="p2d-minute">{minute}</div>
      {holder && <div className="p2d-poss" style={{ background: s.poss === 0 ? colors[0] : colors[2], color: s.poss === 0 ? colors[1] : colors[3] }}>⚽ {holder.name}</div>}
      {flash && <div className="p2d-flash">{flash}</div>}
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
  if (shot.kind === 'pen') {
    const pen = (step: number, sh: Snap['shot'] = null): Snap => ({ ...f(4, 1, shot.p, step, sh), pen: team, penStep: step } as PenSnap);
    return [pen(0), pen(1), pen(2, { team, outcome: shot.outcome, zone: shot.zone })];
  }
  return [
    f(2, lane === 1 ? 1 : lane, mid?.id, 1),
    f(3, lane, fwd?.id, 2),
    f(4, lane, shot.p, 3),
    f(4, lane, shot.p, 4, { team, outcome: shot.outcome, zone: shot.zone }),
  ];
}
