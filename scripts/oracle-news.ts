// Originalens (CM 01/02 3.9.68) nyheder i hukommelsen – til dag-for-dag-sammenligningen af nyheder mellem originalen og vores spil.
// Struktur (~/cm0102-engine/notes/news-list.md):
//   News-objektet N = u32 [0xb7431c]:  +0 pool (NewsItem[], 0xdf bytes pr. post, vokser med 100 ad gangen)  +4 antal allokerede poster
//     +8 managertabellen (12 bytes pr. menneskemanager)  +0xc 16 (pladser)  +0x10 sidste nyheds-id (tæller)
//   Managertabellen, indeks = staff.id − [0xae2364] + 16 (de sidste 16 staff-id'er er menneskene): +0 første post i puljen (−1 = ingen
//     manager), +4 skrivepladsen (ring på 100 poster: base..base+99), +8 antal ulæste.  deliver_to_manager 0x785d40 / kopi 0x786010.
//   NewsItem (ctor 0x77bbe0(type, sub)): +0 u32 type, +4 u8 (0x784eb0's dom ved leveringen: 0/1), +5 s32[50] pladser (slots; tekstslots
//     0x7858c0 lægger strenge ind i pladserne), +0xcd Date (s16 dag i året, s16 år, u32 skudår), +0xd5 u8 tidspunktet [0xae2c88] (0 AM,
//     1 PM, 2 EVE), +0xd6 u32 id (0 = tom post), +0xda u32 læst (1 = læst/tom, 0 = ulæst), +0xde u8 udsendelsen (0 klub 0x7861e0,
//     1 turnering 0x7862d0, 2 land 0x7863f0/0x786520, 3 verdensdel 0x786640, 4 alle 0x786780).
// Overskriften gemmes IKKE: den laves ved visning af NewsItem-teksten 0x77bc80 ud fra type + pladser (pr. type egne tekstfunktioner,
// fx 0x6a3060 for 0x1787, 0x59f3e0 for 0x1779, 0x8dc370 for 0xfa8; skabelonerne er strenge i cm0102.exe).
import { pathToFileURL } from 'node:url';
import type { SparseMem } from '../src/game/cmMem';

export interface OracleNews {
  date: string; type: number; sub: number; headline?: string; club?: string; slots?: number[];
  /** nyhedens id (+0xd6), tidspunktet (+0xd5), læst (+0xda), udsendelsen (+0xde), kategorien (0x785670) og modtagerens staff-id */
  id: number; tod: number; read: boolean; scope: number; cat: number; to: number;
}

const POST = 0xdf, RING = 100;

/** 0x785670: nyhedens kategori efter typen (1–999 → 2, 1000-tallet → 7, 2000 → 3, 3000 → 4, 4000 → 5, 5000 → 1, 6000–0x1790 → 6; ellers 0) */
export function origNewsCat(t: number): number {
  if (t >= 1 && t < 1000) return 2;
  if (t >= 1000 && t < 2000) return 7;
  if (t >= 2000 && t < 3000) return 3;
  if (t >= 3000 && t < 4000) return 4;
  if (t >= 4000 && t < 5000) return 5;
  if (t >= 5000 && t < 6000) return 1;
  if (t >= 6000 && t <= 0x1790) return 6;
  return 0;
}

/** originalens nyhedstype → vores nyhedsnøgle(r) (NewsItem.key; `board.cm` med params.k) – kun hvor portens kode siger det entydigt */
export const ORIG_NEWS_KIND: Record<number, string> = {
  0x1e: 'cmint.h.req',                                   // 0x76f1a0 cmIntlSquad.ts
  0x1f: 'cmfe.h.tv',                                     // 0x48ea40 tv-rettighederne (cmFinance.ts tvRights)
  0x20: 'cmint.wd',                                      // 0x76f7d0/0x76fa40
  0x21: 'cmint.ci',                                      // 0x76fd10/0x76ff40
  0x22: 'cmint.rq',                                      // 0x7701f0/0x7703f0
  0x7d2: 'cmban.hD|cmban.h1|cmban.hN',                   // 0x557280 cmDiscipline.ts
  0xbbf: 'cm.req',                                       // 0x4d8610 cmTransferList.ts
  0xbc6: 'cmfine.{w,f}{0,1,2}',                          // 0x5a74b0/0x5a76e0 cmFine.ts
  0xfa3: 'transfer.cmAccepted',                          // 0x8c0080 cmTransferTalks.ts
  0xfa4: 'transfer.cmAgrees|transfer.cmRejects',         // cmTransferTalks.ts
  0xfac: 'transfer.cmTalks',                             // 0x8d7cd0/0x8d7fb0
  0xfae: 'transfer.cmRejectsMove',                       // 0x8d8310
  0xfa8: 'transfer.o.N|transfer.oFree.N|cm.stm.N',       // 0x8dbef0 (tekst 0x8dc370) transfers.ts / cmStaffMove.ts
  0x1394: 'cmfine.coachPleased|cmfine.coachPressure',    // 0x5a7f20 cmFine.ts
  0x1770: 'news.managerSacked|board.cm(k=d)|job.resigned|board.sacked',  // 0x6a1b00/0x6a1d60 cmBoardGame.ts 'departed'
  0x1771: 'board.cm(k=e)',                               // 0x6a4a20 forventningerne
  0x1772: 'board.cm(k=c)',                               // 0x6a4c40 Board Confidence Update
  0x1773: 'job.cmAck|job.cmDismiss',                     // 0x69c6b0
  0x1774: 'board.cm(k=o)|news.jobOffer',                 // 0x6a4f80 jobtilbuddet
  0x1779: 'cmfe.h.*',                                    // 0x59f300 cmFinEvents.ts
  0x177a: 'cmfe.h.stand|cmfe.h.terrace',                 // 0x59f900
  0x177b: 'cmfe.h.receivers|cmfe.h.crisis',              // 0x59fc60
  0x177d: 'cmfe.h.facilities',                           // 0x59ffb0
  0x177e: 'board.cm(k=x)',                               // 0x6a44a0 forbundets forventninger
  0x1781: 'board.cm(k=p)',                               // 0x6a5a60 forbundets vurdering
  0x1783: 'cmfe.h.appeased',                             // 0x5a02f0
  0x1784: 'cmfine.board',                                // 0x5a7ed0
  0x1786: 'board.cm(rq,rc)',                             // 0x6a9350 svaret på en anmodning
  0x1787: 'news.cmAppoint',                              // 0x6a2e00
  0x178a: 'cmban.fa.*',                                  // 0x6ac060 cmDiscipline.ts
  0x178f: 'board.cm(k=u)',                               // 0x6ad930 ultimatummet
};

function cstr(m: SparseMem, a: number, max = 64): string {
  if (!a) return '';
  let s = '';
  for (let i = 0; i < max; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); }
  return s;
}
const iso = (day: number, year: number) => new Date(Date.UTC(year, 0, 1 + day)).toISOString().slice(0, 10);

/** alle menneskemanageres indbakker, ældste først (ringen fra skrivepladsen) */
export function readOracleNews(m: SparseMem): OracleNews[] {
  const N = m.u32(0xb7431c);
  if (!N) return [];
  const pool = m.u32(N), tab = m.u32(N + 8), nst = m.s32(0xae2364), S = m.u32(0xae23bc);
  const out: OracleNews[] = [];
  for (let i = 0; i < 16; i++) {
    const base = m.s32(tab + 12 * i), cur = m.s32(tab + 12 * i + 4);
    if (base < 0) continue;
    const to = nst - 16 + i, clubAdr = m.u32(S + 0x6e * to + 0x39);
    const club = clubAdr ? cstr(m, clubAdr + 4, 51) : undefined;
    for (let k = 0; k < RING; k++) {
      const a = pool + POST * (base + ((cur - base + k) % RING));
      const id = m.s32(a + 0xd6);
      if (!id) continue;
      const slots: number[] = [];
      for (let j = 0; j < 50; j++) slots.push(m.s32(a + 5 + 4 * j));
      let n = slots.length;
      while (n > 0 && slots[n - 1] === 0) n--;
      const type = m.u32(a);
      out.push({ date: iso(m.s16(a + 0xcd), m.s16(a + 0xcf)), type, sub: m.u8(a + 4), club, slots: slots.slice(0, n),
        id, tod: m.u8(a + 0xd5), read: m.s32(a + 0xda) !== 0, scope: m.u8(a + 0xde), cat: origNewsCat(type), to });
    }
  }
  return out;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const { loadSnap } = await import('./ct-snap');
  const file = process.argv[2];
  if (!file) { console.error('brug: npx tsx scripts/oracle-news.ts <pre.bin>'); process.exit(1); }
  const m = loadSnap(file);
  const list = readOracleNews(m);
  console.log(`dato ${iso(m.s16(0xae2c90), m.s16(0xae2c92))}: ${list.length} nyheder`);
  const TOD = ['AM', 'PM', 'EVE'];
  for (const x of list) {
    console.log(`${x.date} ${TOD[x.tod] ?? x.tod} #${x.id} type 0x${x.type.toString(16)} sub ${x.sub} kat ${x.cat} scope ${x.scope}${x.read ? ' læst' : ''}`
      + ` → ${x.to} (${x.club ?? ''})  ${ORIG_NEWS_KIND[x.type] ?? ''}  [${(x.slots ?? []).slice(0, 10).join(',')}]`);
  }
}
