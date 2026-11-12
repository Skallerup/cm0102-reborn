// Originalens CRT-matematik (MSVC 6, x87), som den rekompilerede original regner den (oraklet).
//
// pow 0x945ff0 → 0x946012: for et endeligt, positivt grundtal går den altid gennem fyl2x og 0x94bbd0 (ingen genvej for hele eksponenter):
//   t = y·log2(x); n = frndint(t) (afrunding til nærmeste, lige ved ½); r = (2^(t − n) − 1) + 1; resultat = r·2^n (fscale).
// Derfor er fx 9^1,5 = 26,999999999999993 og ikke 27 – rand(ftol(20·9^1,5)) er rand(539) i dommerens 0x6e99c6. Math.pow giver 27.
// (log2/exp2 er JavaScripts – de kan afvige med en enkelt ulp fra C-bibliotekets; det rammer kun resultater præcis på en heltalsgrænse.)

const rint = (t: number) => {
  const r = Math.round(t);
  return r - t === 0.5 && r % 2 !== 0 ? r - 1 : r;                                           // Math.round runder ½ op – frndint til lige
};

/** CRT pow (0x945ff0): x^y som originalen; x ≤ 0 som Math.pow (de grene er ikke porteret) */
export function crtPow(x: number, y: number): number {
  if (!(x > 0) || !Number.isFinite(x) || !Number.isFinite(y)) return Math.pow(x, y);
  const t = y * Math.log2(x), n = rint(t);
  const r = (2 ** (t - n) - 1) + 1;
  return r * 2 ** n;
}
