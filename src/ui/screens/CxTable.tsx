// Klassisk tabel: grå kolonneknapper (klik = sortér), en blå knap forrest i hver række og farvede kolonner.
import { useState, type ReactNode } from 'react';

export interface CxCol<T> {
  key: string;
  label: ReactNode;
  /** CSS-klasse for cellen: c-name, c-club, c-yel, c-pos, c-cyan, c-val, c-num, c-cond */
  cls?: string;
  render: (r: T) => ReactNode;
  /** sorteringsnøgle; tal sorteres faldende først, tekst stigende */
  sort?: (r: T) => number | string;
  title?: string;
}

export function CxTable<T>({ rows, cols, rowKey, btn, initialSort, page, onPage }: {
  rows: T[]; cols: CxCol<T>[]; rowKey: (r: T) => string | number;
  /** den blå knap forrest i rækken */
  btn?: (r: T) => ReactNode;
  initialSort?: string;
  /** sidevisning: { size, index } – udelades for alle rækker */
  page?: { size: number; index: number };
  onPage?: (pages: number) => void;
}) {
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(initialSort ? { key: initialSort, dir: 1 } : null);
  const col = sort ? cols.find((c) => c.key === sort.key) : undefined;
  let list = rows;
  if (col?.sort) {
    const f = col.sort;
    list = [...rows].sort((a, b) => {
      const x = f(a), y = f(b);
      const d = typeof x === 'number' && typeof y === 'number' ? y - x : String(x).localeCompare(String(y));
      return d * sort!.dir;
    });
  }
  const pages = page ? Math.max(1, Math.ceil(list.length / page.size)) : 1;
  onPage?.(pages);
  if (page) list = list.slice(page.index * page.size, (page.index + 1) * page.size);
  return (
    <div className="cx-tbl-wrap">
      <table className="cx-tbl">
        <thead>
          <tr>
            {btn && <th className="btn-col" />}
            {cols.map((c) => (
              <th key={c.key} className={sort?.key === c.key ? 'on' : ''} title={c.title}
                onClick={() => c.sort && setSort(sort?.key === c.key ? { key: c.key, dir: sort.dir === 1 ? -1 : 1 } : { key: c.key, dir: 1 })}>
                {c.label}{sort?.key === c.key ? (sort.dir === 1 ? ' ▾' : ' ▴') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {list.map((r) => (
            <tr key={rowKey(r)}>
              {btn && <td className="btn-col">{btn(r)}</td>}
              {cols.map((c) => <td key={c.key} className={c.cls}>{c.render(r)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
