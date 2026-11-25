// Originalens pres-, ultimatum- og protestnyheder (0x1777 0x6a0e70, 0x178d 0x6ac700, 0x1782 0x6a5d10) i menneskemanagerens indbakke over
// dagsbillederne (oracle-days.ts): unikke nyheds-id'er pr. type, delt på egen klub/andre klubber, og udsendelsen (+0xde).
// Brug: npx tsx scripts/oracle-press-news.ts [daysnap-mappe]
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import { readOracleNews } from './oracle-news';

const ix = readDaySnapIndex(process.argv[2] ?? DEFAULT_DAYSNAP);
if (!ix) { console.error('ingen dagsbilleder'); process.exit(1); }
const CLUB_SLOT: Record<number, number> = { 0x1777: 4, 0x178d: 4, 0x1782: 0 };
const seen = new Map<number, { type: number; date: string; club: number; scope: number; own: boolean }>();
for (const e of ix.snaps) {
  const m = loadDaySnap(ix, e);
  const S = m.u32(0xae23bc);
  for (const x of readOracleNews(m)) {
    if (!(x.type in CLUB_SLOT) || seen.has(x.id)) continue;
    const clubAdr = m.u32(S + 0x6e * x.to + 0x39);
    const myId = clubAdr ? m.s32(clubAdr) : -1;
    const club = x.slots?.[CLUB_SLOT[x.type]] ?? -1;
    seen.set(x.id, { type: x.type, date: x.date, club, scope: x.scope, own: club === myId });
  }
}
const rows = [...seen.values()].sort((a, b) => a.date.localeCompare(b.date));
for (const t of Object.keys(CLUB_SLOT).map(Number)) {
  const r = rows.filter((x) => x.type === t);
  const sc: Record<number, number> = {};
  for (const x of r) sc[x.scope] = (sc[x.scope] ?? 0) + 1;
  console.log(`0x${t.toString(16)}: ${r.length} (egen ${r.filter((x) => x.own).length}, andre ${r.filter((x) => !x.own).length}) udsendelse ${JSON.stringify(sc)}`);
}
for (const x of rows) console.log(`${x.date} 0x${x.type.toString(16)} klub ${x.club}${x.own ? ' (egen)' : ''} scope ${x.scope}`);
