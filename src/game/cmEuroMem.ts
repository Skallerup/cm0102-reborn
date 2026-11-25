// De europæiske turneringer i hukommelserne, hvor Shortlist_Manager 0x846920 kører (cmContractGame.ts buildWantMem, cmSlMem.ts buildSlWantMem):
// 0x847a9e/0x848ad5 læser klubbens turnering club +0x1db (> −1 og ≠ Intertoto [0x9cf6f8], eller spillerens omdømme under 5000), turnerings-
// posten [0xae23d0] + 107·id (+0 id, +0x69 omdømme), vægten 15.000 for Champions League ([0x9cf6e8]) ellers omdømmet · 600, og før klubbens
// første kamp (Comp_Stats +4 = 0) den forudsagte plads +0x72 i 1..16: vægt · (1,32 − plads · 0,02) – turneringsobjektet [0xadadfc][id] +8 →
// 0x4a4850. Oraklet (xfer3-snap pre-200-2001): Real Madrid 1, Juventus/Man Utd 3, Arsenal/Liverpool/Parma 9, Leverkusen 13 i CL; Inter/Milan 1,
// Valencia/Leeds 3, Ipswich 5 i UEFA Cup'en – cmEurope.ts cmEuroPredict. [0xae2d14] + 6·klub er −1 for alle klubber i oraklet (som før).
import type { Competition, GameState } from './types';
import type { CmMem } from './cmMem';
import { cmClubEuroComp } from './cmFitnessGame';

/** Comp_Stats +4 (kampe) for klubben i en europæisk turnering: de spillede kampe (dobbeltkampene og gruppespillene) */
function cmEuroPlayed(g: GameState, c: Competition, club: number): number {
  let n = 0;
  for (const t of c.ties) if (t.a === club || t.b === club) for (const id of t.fx) if (g.fixtures[id]?.result) n++;
  if (c.groups) for (const k in c.groups) for (const r of c.groups[k]) if (r.club === club) n += r.p;
  return n;
}

const EUROREC = 0x3dc00000, EUROOBJ = 0x3dd00000, EUROSTATS = 0x3dd80000;
/** Champions League, UEFA Cup, Intertoto (comp.dat-id'erne – også 2026/27's world-cm.json) og omdømmet +0x69 i 3.9.60's comp.dat */
const IDS = [326, 328, 330], REP = [20, 18, 8];
const kOf = (c: Competition) => (c.id === 'CL' ? 0 : c.id === 'UEFA' ? 1 : 2);

export interface EuroMem {
  /** club +0x1db for klubben (−1 = ingen) */
  id(cid: number): number;
  /** 0x4a4850 for en europæisk turnering (this = [obj+8]): Comp_Stats-rækken for klubben (adressen `row`), 0 uden række; undefined = ikke en europæisk */
  row(m: CmMem, a: number[], row: number): number | undefined;
}

/** skriver globalerne og turneringsposterne; `compTab` = [0xadadfc] (ligaernes objekttabel) */
export function writeEuroMem(m: CmMem, g: GameState, compTab: number): EuroMem {
  m.w32(0x9cf6e8, IDS[0]); m.w32(0x9cf6f0, IDS[1]); m.w32(0x9cf6f8, IDS[2]);
  m.w32(0xae23d0, EUROREC);
  IDS.forEach((id, k) => {
    const r = EUROREC + 107 * id;
    m.w32(r, id); m.w16(r + 0x69, g.cmCompRep?.[id] ?? REP[k]);
    const o = EUROOBJ + 0x100 * k;
    m.w32(compTab + 4 * id, o); m.w32(o + 8, EUROSTATS + 0x100 * k);
  });
  // klub → turnering (kun turneringernes klubber slås op)
  const of = new Map<number, Competition>();
  for (const k in g.comps) {
    const c = g.comps[k];
    if (c.type !== 'continental' || c.finished) continue;
    for (const x of [...c.clubs, ...((c.meta?.cmAdd as number[] | undefined) ?? [])]) {
      if (of.has(x)) continue;
      const e = cmClubEuroComp(g, x);
      if (e) of.set(x, e);
    }
  }
  return {
    id: (cid) => { const c = of.get(cid); return c ? IDS[kOf(c)] : -1; },
    row: (mm, a, row) => {
      const k = ((a[0] >>> 0) - EUROSTATS) / 0x100;
      if (!(k === 0 || k === 1 || k === 2)) return undefined;
      const cid = mm.s32(a[a.length - 1] >>> 0), c = of.get(cid);
      if (!c || kOf(c) !== k) return 0;
      const pp = c.meta?.cmPP as Record<number, number> | undefined;
      mm.w8(row + 4, Math.min(255, cmEuroPlayed(g, c, cid))); mm.w8(row + 0x72, pp?.[cid] ?? 0);
      mm.w8(row + 0x73, 0); mm.w8(row + 0x74, 0); mm.w8(row + 0x75, 0);
      return row;
    },
  };
}
