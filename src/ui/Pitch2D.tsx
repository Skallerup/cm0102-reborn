// Klassisk 2D-kampvisning (inspireret af CM/FM): spillerne bevæger sig mellem deres forsvars- og
// angrebspositioner fra taktikken, alt efter hvor bolden er – så man kan se, hvad taktikken gør.
import { useMemo } from 'react';
import type { MatchSim } from '../game/engine/match';
import { hash01 } from '../game/rng';

type Snap = ReturnType<MatchSim['pitch']>;
const W = 105, H = 68;

/** Boldens position (0-100 i begge akser; hold 0 angriber mod højre) */
function ballPos(s: Snap): [number, number] {
  const b = Math.floor(s.zone / 3), l = s.zone % 3;
  let x = 10 + b * 20 + (hash01(s.moment, 11, 1) - 0.5) * 12;
  let y = 16.67 + l * 33.33 + (hash01(s.moment, 12, 2) - 0.5) * 18;
  if (s.shot) {
    // afslutning: bolden på vej mod (eller i) mål
    const toRight = s.shot.team === 0;
    x = s.shot.outcome === 'goal' ? (toRight ? 99.5 : 0.5) : toRight ? 93 : 7;
    y = s.shot.outcome === 'off' ? (hash01(s.moment, 13, 3) < 0.5 ? 38 : 62) : 47 + hash01(s.moment, 14, 4) * 6;
  }
  return [Math.max(1, Math.min(99, x)), Math.max(3, Math.min(97, y))];
}

/** Spillernes positioner ud fra taktikken og boldens placering */
function layout(s: Snap): Map<number, [number, number]> {
  const [bx, by] = ballPos(s);
  const out = new Map<number, [number, number]>();
  for (const p of s.players) {
    const prog = p.team === 0 ? bx / 100 : 1 - bx / 100; // hvor langt bolden er i holdets angrebsretning
    const attacking = p.team === s.poss;
    const f = attacking ? 0.3 + 0.7 * prog : 0.15 * prog;
    let x = p.dx + (p.ax - p.dx) * f;
    let y = p.dy + (p.ay - p.dy) * f;
    if (p.gk) { y = 50 + (by - 50) * 0.15; }
    else {
      // holdet trækker sig sammen mod bolden
      x += (bx - x) * 0.18;
      y += (by - y) * 0.22;
    }
    x += (hash01(s.moment, p.id, 5) - 0.5) * 3;
    y += (hash01(s.moment, p.id, 6) - 0.5) * 3;
    out.set(p.id, [x, y]);
  }
  // boldholderen står ved bolden, og den nærmeste modspiller presser ham
  const h = s.players.find((p) => p.id === s.holder && p.team === s.poss);
  if (h && !s.shot?.outcome.startsWith('goal')) {
    out.set(h.id, [bx - (h.team === 0 ? 1.2 : -1.2), by]);
    let best: { id: number; d: number } | null = null;
    for (const p of s.players) {
      if (p.team === h.team || p.gk) continue;
      const [x, y] = out.get(p.id)!;
      const d = (x - bx) ** 2 + (y - by) ** 2;
      if (!best || d < best.d) best = { id: p.id, d };
    }
    if (best) { const [x, y] = out.get(best.id)!; out.set(best.id, [x + (bx - x) * 0.6, y + (by - y) * 0.6]); }
  }
  return out;
}

export function Pitch2D({ sim, me, colors, minute, banner, bannerCls, stepMs }: {
  sim: MatchSim; me: number; colors: [string, string, string, string]; minute: string; banner: string; bannerCls: string; stepMs: number;
}) {
  const s = sim.pitch();
  const pos = useMemo(() => layout(s), [s.moment, s.zone, s.poss, s.holder, s.players.length]); // eslint-disable-line react-hooks/exhaustive-deps
  const [bx, by] = ballPos(s);
  const dur = `${Math.max(80, Math.min(900, stepMs))}ms`;
  const X = (x: number) => (x / 100) * W, Y = (y: number) => (y / 100) * H;
  const holder = s.players.find((p) => p.id === s.holder);
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
              {p.id === s.holder && <text y="-2.7" textAnchor="middle" fontSize="1.9" fontWeight="700" fill="#fff" stroke="rgba(0,0,0,0.6)" strokeWidth="0.25" paintOrder="stroke">{p.name}</text>}
            </g>
          );
        })}
        <g className="p2d-ball" style={{ transform: `translate(${X(bx)}px, ${Y(by)}px)`, transitionDuration: dur }}>
          <circle r="0.9" fill="#fff" stroke="#111" strokeWidth="0.2" />
        </g>
      </svg>
      <div className="p2d-minute">{minute}</div>
      {holder && <div className="p2d-poss" style={{ background: s.poss === 0 ? colors[0] : colors[2], color: s.poss === 0 ? colors[1] : colors[3] }}>⚽ {holder.name}</div>}
      <div className={`p2d-banner ${bannerCls}`}>{banner}</div>
    </div>
  );
}
