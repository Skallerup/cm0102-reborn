// Originalens spejdernyheder (typerne 0x1389–0x138e, PLAYER_SEARCH/SCOUT_MANAGER) i menneskemanagerens indbakke pr. dag – fra dagsbillederne
// (~/cm0102-engine/oracle/daysnap). Brug: npx tsx scripts/oracle-scout-news.ts [STEP=1] [UNTIL=2002-06-30]
import { readOracleNews } from './oracle-news';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';

const ix = readDaySnapIndex(process.env.DAYSNAP ?? DEFAULT_DAYSNAP);
if (!ix) throw new Error('ingen dagsbilleder');
const step = Number(process.env.STEP ?? 7), until = process.env.UNTIL ?? '9999';
const seen = new Map<number, { date: string; type: number; slots: number[] }>();
const all = new Map<number, number>();
for (let i = 0; i < ix.snaps.length; i += step) {
  const e = ix.snaps[i];
  if (e.iso > until) break;
  const m = loadDaySnap(ix, e);
  for (const n of readOracleNews(m)) {
    all.set(n.type, (all.get(n.type) ?? 0) + (seen.has(n.id) ? 0 : 1));
    if (n.type >= 0x1389 && n.type <= 0x138e && !seen.has(n.id)) seen.set(n.id, { date: n.date, type: n.type, slots: n.slots ?? [] });
    if (!seen.has(n.id)) seen.set(n.id, { date: n.date, type: n.type, slots: [] });
  }
}
const sc = [...seen.values()].filter((x) => x.type >= 0x1389 && x.type <= 0x138e).sort((a, b) => a.date.localeCompare(b.date));
for (const x of sc) console.log(x.date, '0x' + x.type.toString(16), x.slots.slice(0, 12).join(','));
console.log('typer i alt:', [...all.entries()].sort((a, b) => a[0] - b[0]).map(([t, n]) => `0x${t.toString(16)}:${n}`).join(' '));
