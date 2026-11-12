/**
 * (runde 9) Ligatabellens poster af SPILLETS tabel og kampprogram – originalens Comp_Stats-række 0x4a4850 (post 0x76) som tilskuertallet
 * sub_85cba0 (crowd.ts) og computerens tilstand 0x6df460 (aiMode.ts' `league`) læser:
 *   +4 kampe (byte), stimerne +0x19 sejre i træk, +0x2d nederlag i træk, +0x41 ubesejret i træk, +0x55 uden sejr i træk (dword) med hver sin
 *   blok på 0x14 bytes (+4 første dato, +0xc seneste kamp i stimen: +0x4d for +0x41, +0x61 for +0x55 – dag/år-ord), +0x72 sæsonens
 *   udgangsplacering (sidste sæson – cmPlayerData.lastRank), +0x73 placeringen nu, +0x74/+0x75 den bedst/dårligst mulige slutplacering.
 * Afkodet af oraklets rækker (crowd1.txt KO-linjerne – Arsenal hele sæsonen): før ligaens første kamp er +0x73..+0x75 = 0; stimerne følger
 * resultaterne (sejr: +0x19/+0x41 op, +0x2d/+0x55 nul; uafgjort: +0x41/+0x55 op; nederlag: +0x2d/+0x55 op).
 * +0x74/+0x75 er ligaens opdatering 0x684cd0 (0x684ef7–0x6850dc, porteret her – `possiblePositions`): rækkefølgen er tabellens, maks.point =
 * (kampe i alt +0xa7 − spillet +0x11) · point pr. sejr +0xc2 (3) + point +0x19; kampe i alt = (hold − 1) · gange mod hver (+0x3c).
 * Ikke afbildet: stimer overført fra sidste sæson (0x4aceb0 – spillets kampprogram ryddes ved sæsonslut, så stimerne starter forfra) og
 * flaget [+0xe6] (lige point mellem to færdige hold – kun i sidste runde).
 */
import type { GameState, TableRow } from '../../types';
import { lastRank } from '../../cmPlayerData';

export interface GameLeagueRow {
  played: number; pos: number; best: number; worst: number; x72: number;
  runs: [number, number, number, number];
  /** seneste kamp i stimen +0x41 (ubesejret) og +0x55 (uden sejr) – ISO-dato, null = ingen */
  end41: string | null; end55: string | null;
}

/** samme rækkefølge som competitions.ts sortTable (uden den cirkulære import) */
function sorted(g: GameState, rows: TableRow[]) {
  return rows.slice().sort((a, b) => b.pts - a.pts || b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf || (g.clubs[a.club]?.short ?? '').localeCompare(g.clubs[b.club]?.short ?? ''));
}

/** 0x684ef7–0x6850dc: bedst (+0x39) og dårligst (+0x3a) mulige placering for rækken på plads i (0-baseret) i den sorterede tabel */
export function possiblePositions(rows: { p: number; pts: number }[], i: number, total: number, ppw = 3, e6 = false): [number, number] {
  const me = rows[i], maxMe = (total - me.p) * ppw + me.pts;
  let best = i + 1;
  for (let j = 0; j < i; j++) {
    const o = rows[j], iF = me.p >= total, jF = o.p >= total;
    if (!iF && !jF) { if (maxMe >= o.pts) best--; }
    else if (!jF) { if (maxMe === o.pts) best--; }                                         // 0x684f9d (sic)
    else if (!iF) { if (maxMe >= o.pts) best--; }
    else if (maxMe === o.pts && e6) best--;
  }
  let worst = i + 1;
  for (let j = i + 1; j < rows.length; j++) {
    const o = rows[j], maxO = (total - o.p) * ppw + o.pts, iF = me.p >= total, jF = o.p >= total;
    if (!iF && !jF) { if (maxO >= me.pts) worst++; }
    else if (!jF) { if (maxO >= me.pts) worst++; }                                         // 0x685076
    else if (!iF) { if (maxO === me.pts) worst++; }                                        // 0x68508a (sic)
    else if (maxO === me.pts && e6) worst++;
  }
  return [best, worst];
}

/** klubbens række i ligaen `compId` af spillets tabel og kampprogram (null: ingen liga/række) */
export function gameLeagueRow(g: GameState, compId: string, club: number): GameLeagueRow | null {
  const comp = g.comps[compId];
  if (!comp || comp.type !== 'league') return null;
  const rows = sorted(g, comp.table);
  const i = rows.findIndex((r) => r.club === club);
  if (i < 0) return null;
  const me = rows[i];
  // stimerne af klubbens ligakampe i datoorden
  const runs: [number, number, number, number] = [0, 0, 0, 0];
  let end41: string | null = null, end55: string | null = null;
  const fx = Object.values(g.fixtures).filter((f) => f.comp === compId && f.result && (f.home === club || f.away === club)).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.id - b.id));
  for (const f of fx) {
    const r = f.result!, gf = f.home === club ? r.hg : r.ag, ga = f.home === club ? r.ag : r.hg;
    if (gf > ga) { runs[0]++; runs[2]++; runs[1] = 0; runs[3] = 0; end41 = f.date; }
    else if (gf === ga) { runs[0] = 0; runs[1] = 0; runs[2]++; runs[3]++; end41 = f.date; end55 = f.date; }
    else { runs[0] = 0; runs[2] = 0; runs[1]++; runs[3]++; end55 = f.date; }
  }
  const anyPlayed = rows.some((r) => r.p > 0);
  const roundsPer = g.customRules?.[compId]?.rounds ?? 2;
  const total = (rows.length - 1) * roundsPer;
  const [best, worst] = anyPlayed ? possiblePositions(rows, i, total) : [0, 0];
  return { played: me.p, pos: anyPlayed ? i + 1 : 0, best, worst, x72: lastRank(g, compId, club), runs, end41, end55 };
}
