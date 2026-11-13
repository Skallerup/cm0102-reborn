// CM 01/02's taktikfaner "With Ball" / "Without Ball" (taktikskærmen 0x89f710, tilstand 2/0): banen er delt i 3 × 4 boldzoner (svagt
// stiplet gitter), den valgte zone står som en gul stiplet firkant, og de 11 står som cirkler med positionsnavnet på deres punkt for den
// zone med/uden bold. Klik i en zone vælger den; træk en spiller = han snappes til nærmeste af de 27 × 36 punkter (0x5b3560).
import { useRef, useState } from 'react';
import type { Player, Tactic } from '../../game/types';
import { maskName, postIdx, tacticPositions, unpackXY } from '../../game/engine/grid/tacticPositions';

const L0 = 1.5, LW = 97, T0 = 99, TH = 98;           // banens felt i % af boksen (= linjerne i svg'en)
const leftOf = (x: number) => L0 + ((x + 0.5) / 27) * LW;
const topOf = (y: number) => T0 - ((y + 0.5) / 36) * TH;

export interface Zone { zx: number; zy: number }

export function ZonePitch({ tac, att, zone, onZone, sel, onSelect, onMove, byId, dotClass = '' }: {
  tac: Tactic; att: 0 | 1; zone: Zone; onZone: (z: Zone) => void; sel: number | null; onSelect: (slot: number) => void;
  /** null = skrivebeskyttet */
  onMove: ((slot: number, x: number, y: number) => void) | null;
  byId: (id: number) => Player | undefined; dotClass?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ slot: number; x: number; y: number } | null>(null);
  const dragged = useRef(false);
  const pos = tacticPositions(tac);
  /** skærmpunkt → nærmeste af de 27 × 36 punkter (løkken 0x8a2360) */
  const toPoint = (cx: number, cy: number): [number, number] => {
    const r = ref.current!.getBoundingClientRect();
    const l = ((cx - r.left) / r.width) * 100, tp = ((cy - r.top) / r.height) * 100;
    const x = Math.round(((l - L0) / LW) * 27 - 0.5), y = Math.round(((T0 - tp) / TH) * 36 - 0.5);
    return [Math.max(0, Math.min(26, x)), Math.max(0, Math.min(35, y))];
  };
  const zw = (9 / 27) * LW, zh = (9 / 36) * TH;
  return (
    <div className="cx-tac-pitch cx-zone-pitch" ref={ref}
      onClick={(e) => {
        if (dragged.current) { dragged.current = false; return; }
        if ((e.target as Element).closest('.cx-tac-slot')) return;
        const [x, y] = toPoint(e.clientX, e.clientY);
        onZone({ zx: Math.min(2, Math.floor(x / 9)), zy: Math.min(3, Math.floor(y / 9)) });
      }}>
      <svg className="lines" viewBox="0 0 68 100" preserveAspectRatio="none">
        <g stroke="#ffffff88" strokeWidth="0.35" fill="none">
          <rect x="1" y="1" width="66" height="98" /><line x1="1" y1="50" x2="67" y2="50" /><circle cx="34" cy="50" r="9" />
          <rect x="14" y="1" width="40" height="16" /><rect x="14" y="83" width="40" height="16" /><rect x="25" y="1" width="18" height="6" /><rect x="25" y="93" width="18" height="6" />
        </g>
      </svg>
      <svg className="zones" viewBox="0 0 100 100" preserveAspectRatio="none">
        <g stroke="#9fd38f66" strokeWidth="0.6" strokeDasharray="1.6 1.2" fill="none" vectorEffect="non-scaling-stroke">
          <rect x={L0} y={T0 - TH} width={LW} height={TH} vectorEffect="non-scaling-stroke" />
          {[1, 2].map((k) => <line key={`x${k}`} x1={L0 + k * zw} y1={T0 - TH} x2={L0 + k * zw} y2={T0} vectorEffect="non-scaling-stroke" />)}
          {[1, 2, 3].map((k) => <line key={`y${k}`} x1={L0} y1={T0 - k * zh} x2={L0 + LW} y2={T0 - k * zh} vectorEffect="non-scaling-stroke" />)}
        </g>
        <rect className="cx-zone-sel" x={L0 + zone.zx * zw} y={T0 - (zone.zy + 1) * zh} width={zw} height={zh} fill="none" stroke="#fff21f" strokeWidth="1.2" strokeDasharray="2.4 1.6" vectorEffect="non-scaling-stroke" />
      </svg>
      {pos.posts.map((r, i) => {
        const [x, y] = drag?.slot === i ? [drag.x, drag.y] : unpackXY(r[postIdx(att, zone.zx, zone.zy)]);
        const gk = pos.masks[i] === 0x1, p = byId(tac.lineup[i]);
        return (
          <div key={i} className={`cx-tac-slot cx-zone-slot ${sel === i ? 'on' : ''} ${p ? '' : 'empty'}`} style={{ left: `${leftOf(x)}%`, top: `${topOf(y)}%` }}
            title={p ? `${maskName(pos.masks[i])} – ${p.first} ${p.last}` : maskName(pos.masks[i])}
            onClick={(e) => { e.stopPropagation(); if (dragged.current) { dragged.current = false; return; } onSelect(i); }}
            onPointerDown={(e) => {
              if (!onMove || gk || e.button !== 0) return;
              e.preventDefault();
              const sx = e.clientX, sy = e.clientY;
              let moved = false;
              const move = (ev: PointerEvent) => {
                if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) <= 4) return;
                moved = true;
                const [px, py] = toPoint(ev.clientX, ev.clientY);
                setDrag({ slot: i, x: px, y: py });
              };
              const up = (ev: PointerEvent) => {
                window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up);
                setDrag(null);
                if (!moved) return;
                dragged.current = true;
                setTimeout(() => { dragged.current = false; }, 0);
                const [px, py] = toPoint(ev.clientX, ev.clientY);
                onMove(i, px, py);
              };
              window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
            }}>
            <span className={`cx-tac-dot cx-zone-dot ${gk ? 'gk' : ''} ${dotClass}`}>{maskName(pos.masks[i])}</span>
          </div>
        );
      })}
    </div>
  );
}
