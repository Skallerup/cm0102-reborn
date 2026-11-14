// Udløbsdatoen for en spillers startkontrakt som i originalen (CONTRACT_MANAGER::initialise_all_staff_contracts 0x4c7560 → 0x85e960
// kopierer personens kontraktudløb staff +0x46; målt 14/11-2026 mod øjebliksbilledet pre-0-2001.bin på de engelske klubbers spillere:
// 1.962 af 2.084 udløb med dato i databasen er ens, resten er "for tidlige"; 2.912 poster parret på navn + fødselsdato).
//
//   * Databasen har en dato (staff.dat +70): den gælder, som den står (dag og måned – ikke kun året).
//   * Databasen har ingen dato (dag 31, år 1900): 0x4c7560 trækker den (0x4c7632–0x4c776d): år = spilårets år + rand(6) + 1,
//     måned = måneden for (nationens sæsonslut + 10 dage) (nationstabellen 0xb63d60, 0x669bd0), dag = rand(28) + 1.
//     Målt: år 2002–2007 jævnt, dagene 1–28 jævnt, juni for England.
//   * Udløbet er mindre end startdatoen + 8 dage (0x4c777e–0x4c77be): læg 52 uger (364 dage) til, så længe det gælder
//     (30/6-2001 → 29/6-2002; 30/6-1999 → 26/6-2002).
// *Estimeret:* nationens sæsonslutmåned for nationer uden post i tabellen (juni); selve tabellens datoer er målt i øjebliksbilledet
// (de står i NATION_MONTH som måneden for dato + 10 dage).
import { cmRand } from './cmPlayerData';

/** måneden (1–12) for nationens sæsonslut + 10 dage (0x669bd0 → 0x54c5b0 → 0x54cfb0; datoerne i tabellen 0xb63d60+0x39) */
export const NATION_MONTH: Record<string, number> = {
  Argentina: 7, Australia: 6, Belgium: 6, Brazil: 12, Croatia: 6, Denmark: 6, England: 6, Finland: 11, France: 6, Germany: 6, Greece: 5,
  Holland: 6, 'Republic of Ireland': 5, Italy: 6, Japan: 12, 'Northern Ireland': 5, Norway: 11, Poland: 6, Portugal: 6, Russia: 11,
  Scotland: 6, 'South Korea': 12, Spain: 6, Sweden: 11, Turkey: 5, 'United States': 1, Wales: 5,
};

const dayNum = (iso: string) => Math.round(Date.parse(iso + 'T00:00:00Z') / 86400000);
const isoOf = (n: number) => new Date(n * 86400000).toISOString().slice(0, 10);

/** udløbet (yyyy-mm-dd) for en spillers startkontrakt. `dbEnd` = databasens dato ('' = ingen), `today` = spilstarten. */
export function cmContractEnd(dbEnd: string, today: string, nation: string | undefined, seed: number, id: number): string {
  let end = dbEnd;
  if (!end) {
    const rand = cmRand(seed, id, 0x4c7560);
    const year = Number(today.slice(0, 4)) + rand(6) + 1;
    const month = NATION_MONTH[nation ?? ''] ?? 6;
    const day = rand(28) + 1;
    end = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  const limit = dayNum(today) + 8;
  let n = dayNum(end);
  while (n < limit) n += 364;
  return isoOf(n);
}
