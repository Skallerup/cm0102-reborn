// Mediets kø (0x754740 add_rumour) – adskilt fra cmRumours.ts, så spejderrapporten (cmScout.ts) kan lægge rygter i køen uden at trække
// transfers.ts ind (importcyklus).
import type { GameState, Player } from './types';
import { cmGbp } from './cmMoney';

/** £50.000.000 (0x2faf080) i spillets penge for den interesserede klub (cmMoney: 2001 £ = € · 0,86, 2026/27 ligaens faktor) */
const feeCap = (g: GameState, club: number) => Math.round(50_000_000 / cmGbp(g, club));

export interface RumEntry { p: number; c: number; d: string; st: number; amt: number; will: number; from: number }
export interface CmRumState { q: RumEntry[]; last: number }
export const cmRumState = (g: GameState): CmRumState => (g.cmRum ??= { q: [], last: lastOfferId(g) });
const lastOfferId = (g: GameState) => g.offers.reduce((m, o) => Math.max(m, o.id), 0);

/** 0x754740: posten (spiller, klub) – findes parret, sker intet */
export function cmRumourAdd(g: GameState, p: Player, club: number, amt: number, will: number): void {
  const st = cmRumState(g);
  if (st.q.some((e) => e.p === p.id && e.c === club)) return;
  st.q.push({ p: p.id, c: club, d: g.date, st: 0, amt: Math.max(0, Math.min(Math.round(amt), feeCap(g, club))), will, from: p.club || 0 });
  st.q.sort((a, b) => a.p - b.p || a.c - b.c);
}

/** spejderrapportens rygte (cmShortlistGame.ts cmScoutAddRumour – registreres der, så cmScout.ts ikke trækker ønskelisterne og transfers.ts ind) */
export type ScoutRumour = (g: GameState, p: Player, club: number, rand: (n: number) => number) => { amt: number; will: number } | null;
export const SCOUT_RUMOUR: { fn: ScoutRumour | null } = { fn: null };
