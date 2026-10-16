import { ATTRS } from '../game/attributes';
import { RADAR_AXES } from '../game/analysis';
import type { Player } from '../game/types';
import { dateFmt, t } from '../i18n';

/** Snapshot ca. `months` måneder tilbage (eller det ældste) */
export function snapshotAgo(p: Player, months: number) {
  const dev = p.dev ?? [];
  if (!dev.length) return null;
  return dev[Math.max(0, dev.length - 1 - months)];
}

/** Ændring i en attribut siden snapshot */
export function attrDelta(p: Player, idx: number, months: number): number {
  const s = snapshotAgo(p, months);
  if (!s) return 0;
  return Math.round((p.attrs[idx] - s.a[idx]) * 10) / 10;
}

/** Samlet udvikling (sum af ændringer i de 36 synlige attributter) */
export function totalDelta(p: Player, months: number): number {
  const s = snapshotAgo(p, months);
  if (!s) return 0;
  let d = 0;
  for (let i = 0; i < 36; i++) d += p.attrs[i] - s.a[i];
  return Math.round(d * 10) / 10;
}

export function Arrow({ d, small }: { d: number; small?: boolean }) {
  if (Math.abs(d) < (small ? 0.5 : 0.1)) return null;
  return <span className={`dev-arrow ${d > 0 ? 'up' : 'down'}`} title={`${d > 0 ? '+' : ''}${d.toFixed(1)}`}>{d > 0 ? '▲' : '▼'}{small ? '' : ` ${Math.abs(d).toFixed(1)}`}</span>;
}

const COLORS = ['#ffd447', '#7fd1ff', '#59d97a', '#ff8fd0', '#ffa94d', '#c38bff'];

/** Linjediagram over profilens akser måned for måned */
export function DevelopmentChart({ p }: { p: Player }) {
  const dev = [...(p.dev ?? []), { d: 'now', a: p.attrs.slice(0, 36) }];
  const isGK = p.pos[0] >= 15;
  const axes = RADAR_AXES.filter((a) => (isGK ? true : a.key !== 'goalkeeping'));
  const series = axes.map((ax) => dev.map((s) => ax.attrs.reduce((sum, i) => sum + s.a[i], 0) / ax.attrs.length));
  const all = series.flat();
  const lo = Math.max(1, Math.floor(Math.min(...all) - 1));
  const hi = Math.min(20, Math.ceil(Math.max(...all) + 1));
  const W = 420, H = 170, L = 26, B = 18;
  const x = (i: number) => L + (dev.length <= 1 ? 0 : (i / (dev.length - 1)) * (W - L - 6));
  const y = (v: number) => 6 + (1 - (v - lo) / Math.max(1, hi - lo)) * (H - B - 6);
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label={t('dev.chart')}>
        {[lo, (lo + hi) / 2, hi].map((v) => (
          <g key={v}><line x1={L} x2={W} y1={y(v)} y2={y(v)} stroke="currentColor" strokeOpacity={0.12} /><text x={2} y={y(v) + 3}>{Math.round(v)}</text></g>
        ))}
        {series.map((ser, si) => (
          <polyline key={si} fill="none" stroke={COLORS[si]} strokeWidth={2} points={ser.map((v, i) => `${x(i)},${y(v)}`).join(' ')} />
        ))}
        <text x={L} y={H - 4}>{dev[0].d === 'now' ? '' : dateFmt(dev[0].d)}</text>
        <text x={W - 4} y={H - 4} textAnchor="end">{t('dev.now')}</text>
      </svg>
      <div className="legend">{axes.map((a, i) => <span key={a.key}><i style={{ background: COLORS[i] }} />{t(`radar.${a.key}`)}</span>)}</div>
    </div>
  );
}

/** Største ændringer siden første snapshot */
export function DevelopmentList({ p }: { p: Player }) {
  const first = p.dev?.[0];
  if (!first) return null;
  const changes = ATTRS.slice(0, 36)
    .map((k, i) => [k, Math.round((p.attrs[i] - first.a[i]) * 10) / 10] as const)
    .filter(([, d]) => Math.abs(d) >= 0.3)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 12);
  if (!changes.length) return <div className="muted">{t('dev.noChange')}</div>;
  return (
    <div className="attr-list">
      {changes.map(([k, d]) => [<span key={k}>{t(`attr.${k}`)}</span>, <span key={k + 'd'}><Arrow d={d} /></span>])}
    </div>
  );
}
