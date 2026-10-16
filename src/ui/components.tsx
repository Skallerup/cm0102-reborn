import { useMemo, useState, type ReactNode } from 'react';
import { positionString } from '../game/attributes';
import { ageOn } from '../game/dates';
import { gs } from '../game/state';
import type { Player } from '../game/types';
import { t } from '../i18n';
import { useNav } from './core';
import { logoUrl } from './logos';

export function PlayerLink({ p, short }: { p: Player | undefined; short?: boolean }) {
  const { nav } = useNav();
  if (!p) return <span className="muted">—</span>;
  return (
    <a className="link" onClick={(e) => { e.stopPropagation(); nav({ name: 'player', id: p.id }); }}>
      {short ? `${p.first ? p.first[0] + '. ' : ''}${p.last}` : `${p.first} ${p.last}`.trim()}
    </a>
  );
}

/** Klublogo – falder tilbage til et "trøje"-felt i klubfarverne */
export function Crest({ id, size = 14 }: { id: number; size?: number }) {
  const [failed, setFailed] = useState(false);
  const c = gs().clubs[id];
  const url = logoUrl(id);
  if (url && !failed) {
    return <img className="crest" src={url} alt="" width={size} height={size} loading="lazy" onError={() => setFailed(true)} style={{ width: size, height: size }} />;
  }
  if (!c) return null;
  return <i className="kit" style={{ background: c.colors[0], borderColor: c.colors[1], width: size * 0.8, height: size * 0.8 }} />;
}

export function ClubLink({ id, long }: { id: number; long?: boolean }) {
  const { nav } = useNav();
  const c = gs().clubs[id];
  if (!c) return <span className="muted">{t('common.free')}</span>;
  return (
    <a className="link club-link" onClick={(e) => { e.stopPropagation(); nav({ name: 'club', id }); }}>
      <Crest id={id} />
      {long ? c.name : c.short}
    </a>
  );
}

export function Nat({ n }: { n: number }) {
  const nat = gs().nations[n];
  return <span className="nat" title={nat?.name}>{nat?.code ?? '?'}</span>;
}

export function AttrVal({ lo, hi }: { lo: number; hi: number }) {
  const v = Math.round((lo + hi) / 2);
  const cls = v >= 16 ? 'a-top' : v >= 13 ? 'a-good' : v >= 9 ? 'a-mid' : v >= 5 ? 'a-low' : 'a-bad';
  return <span className={`attr ${cls}`}>{lo === hi ? lo : `${lo}–${hi}`}</span>;
}

export function Stars({ range }: { range: [number, number] }) {
  const [lo, hi] = range;
  const out: ReactNode[] = [];
  for (let i = 1; i <= 5; i++) {
    const cls = lo >= i ? 's-full' : lo >= i - 0.5 ? 's-half' : hi >= i - 0.5 ? 's-maybe' : 's-empty';
    out.push(<i key={i} className={`star ${cls}`} />);
  }
  return <span className="stars" title={`${lo}–${hi}`}>{out}</span>;
}

export function Bar({ value, max = 100, tone }: { value: number; max?: number; tone?: 'good' | 'bad' | 'auto' }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const cls = tone === 'auto' || !tone ? (pct > 75 ? 'good' : pct > 45 ? 'mid' : 'bad') : tone;
  return <span className="bar"><i className={cls} style={{ width: `${pct}%` }} /></span>;
}

export function Tabs({ tabs, value, onChange }: { tabs: [string, string][]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="tabs">
      {tabs.map(([k, label]) => (
        <button key={k} className={k === value ? 'on' : ''} onClick={() => onChange(k)}>{label}</button>
      ))}
    </div>
  );
}

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className={`modal ${wide ? 'wide' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span>{title}</span>
          <button className="x" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export interface Col<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  sort?: (row: T) => number | string;
  className?: string;
  title?: string;
}

export function Table<T>({ rows, cols, rowKey, onRow, initialSort, initialDir = -1, rowClass, limit }: {
  rows: T[]; cols: Col<T>[]; rowKey: (r: T) => string | number; onRow?: (r: T) => void; initialSort?: string; initialDir?: 1 | -1; rowClass?: (r: T) => string; limit?: number;
}) {
  const [sortKey, setSortKey] = useState(initialSort);
  const [dir, setDir] = useState<1 | -1>(initialDir);
  const sorted = useMemo(() => {
    const col = cols.find((c) => c.key === sortKey);
    if (!col?.sort) return rows;
    const f = col.sort;
    return rows.slice().sort((a, b) => {
      const va = f(a), vb = f(b);
      return (va < vb ? -1 : va > vb ? 1 : 0) * dir;
    });
  }, [rows, cols, sortKey, dir]);
  const shown = limit ? sorted.slice(0, limit) : sorted;
  return (
    <div className="table-wrap">
      <table className="grid">
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c.key} className={`${c.className ?? ''} ${c.sort ? 'sortable' : ''} ${sortKey === c.key ? 'sorted' : ''}`} title={c.title}
                onClick={() => { if (!c.sort) return; if (sortKey === c.key) setDir((d) => (d === 1 ? -1 : 1)); else { setSortKey(c.key); setDir(-1); } }}>
                {c.label}{sortKey === c.key ? (dir === 1 ? ' ▲' : ' ▼') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shown.map((r) => (
            <tr key={rowKey(r)} onClick={onRow ? () => onRow(r) : undefined} className={`${onRow ? 'clickable' : ''} ${rowClass?.(r) ?? ''}`}>
              {cols.map((c) => <td key={c.key} className={c.className}>{c.render(r)}</td>)}
            </tr>
          ))}
          {shown.length === 0 && <tr><td colSpan={cols.length} className="muted center">{t('common.none')}</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export function Panel({ title, children, right, className }: { title?: ReactNode; children: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <section className={`panel ${className ?? ''}`}>
      {title && <header><h3>{title}</h3>{right && <div className="right">{right}</div>}</header>}
      <div className="panel-body">{children}</div>
    </section>
  );
}

export function age(p: Player) {
  return ageOn(p.dob, gs().date);
}

export function posStr(p: Player) {
  return positionString(p);
}

/** Radar-diagram (SVG) – sammenlign op til 3 spillere */
export function Radar({ series, labels }: { series: { name: string; values: number[]; color: string }[]; labels: string[] }) {
  const size = 260, c = size / 2, r = 95;
  const n = labels.length;
  const pt = (i: number, v: number) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [c + Math.cos(a) * r * (v / 20), c + Math.sin(a) * r * (v / 20)];
  };
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="radar" role="img" aria-label="radar">
      {[5, 10, 15, 20].map((lv) => (
        <polygon key={lv} points={labels.map((_, i) => pt(i, lv).join(',')).join(' ')} className="radar-grid" />
      ))}
      {labels.map((l, i) => {
        const [x, y] = pt(i, 23.5);
        const [x2, y2] = pt(i, 20);
        return (
          <g key={l}>
            <line x1={c} y1={c} x2={x2} y2={y2} className="radar-grid" />
            <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="radar-label">{l}</text>
          </g>
        );
      })}
      {series.map((s) => (
        <polygon key={s.name} points={s.values.map((v, i) => pt(i, v).join(',')).join(' ')} style={{ fill: s.color, stroke: s.color }} className="radar-series" />
      ))}
    </svg>
  );
}

export function Pct({ v }: { v: number }) {
  return <>{Math.round(v * 100)}%</>;
}

export function Empty({ text }: { text: string }) {
  return <div className="empty">{text}</div>;
}
