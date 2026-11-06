// Navnesøgning: alle ord skal findes (i vilkårlig rækkefølge – "mark kerr" finder "Kerr, Mark"), uden accenter
// og med tolerance for stavemåder med/uden h ("Aghahowa" finder databasens "Agahowa", "Tsygalko" ikke – men
// "tsigalko" gør). Bruges af Find, Transfers, editoren og draften.
const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/ø/g, 'o').replace(/æ/g, 'ae').replace(/ß/g, 'ss').replace(/ł/g, 'l').replace(/đ/g, 'd').replace(/ı/g, 'i');
const loose = (s: string) => fold(s).replace(/h/g, '').replace(/[^a-z0-9 ]+/g, ' ');

/** En forberedt søgning: test(navn) er sand, når alle ord i søgningen findes i navnet */
export function nameQuery(q: string): ((...names: (string | undefined)[]) => boolean) | null {
  const words = loose(q).split(/\s+/).filter(Boolean);
  if (!words.length) return null;
  return (...names) => {
    const hay = loose(names.filter(Boolean).join(' '));
    return words.every((w) => hay.includes(w));
  };
}
