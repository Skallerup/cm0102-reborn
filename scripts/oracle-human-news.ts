// (fejlsøgning) oraklets nyheder til mennesket (alle typer, unikke id) FROM..UNTIL – tæller pr. type og viser de valgte typer (TYPES=bbd,bbe)
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import { readOracleNews, ORIG_NEWS_KIND } from './oracle-news';
const FROM = process.env.FROM ?? '2001-11-01', UNTIL = process.env.UNTIL ?? '2002-08-15';
const ix = readDaySnapIndex(process.env.DAYSNAP ?? DEFAULT_DAYSNAP)!;
const snaps = ix.snaps.filter((e) => e.iso >= FROM && e.iso <= UNTIL).sort((a, b) => a.iso.localeCompare(b.iso));
const seen = new Map<number, string>(); const cnt: Record<string, number> = {};
const SHOW = new Set((process.env.TYPES ?? '').split(',').filter(Boolean).map((x) => parseInt(x, 16)));
for (const e of snaps) {
  const m = loadDaySnap(ix, e);
  for (const x of readOracleNews(m)) {
    if (seen.has(x.id)) continue;
    const k = `0x${x.type.toString(16)}/${x.sub}`;
    seen.set(x.id, k); cnt[k] = (cnt[k] ?? 0) + 1;
    if (!SHOW.size || SHOW.has(x.type)) console.log(x.date, k, ORIG_NEWS_KIND[x.type] ?? '', x.headline ?? '', x.club ?? '', JSON.stringify((x.slots ?? []).slice(0, 8)));
  }
  (m as { release?: () => void }).release?.();
}
console.log('billeder', snaps.length, JSON.stringify(Object.fromEntries(Object.entries(cnt).sort())));
