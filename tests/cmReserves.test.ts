// Originalens baggrundskampe (fixture −2, 0x84b940/0x84be20 – cmReserves.ts). Den originale database i ægte tilstand.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import '../src/game/sim';
import { cmResBuild, cmResDaily, cmResPairs, cmResPool } from '../src/game/cmReserves';
import type { GameState } from '../src/game/types';

describe('baggrundskampene som CM 01/02 (original DB, ægte tilstand)', () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((x) => x.name === 'England');
  const club = world.clubs.find((c) => c[2] === 'Man Utd')![0];
  createGame(world, { managerName: 'T', managerNation: eng, clubId: club, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  const g = gs() as GameState;
  const pool = cmResPool(g);
  const st = cmResBuild(g);

  it('puljen (0x84b940): kun klubber uden for de spilbare ligaer – ingen engelske ligaklubber, ikke menneskets', () => {
    expect(pool.length).toBeGreaterThan(1000);
    expect(pool).not.toContain(g.userClub);
    for (const c of pool) expect(g.comps[g.clubs[c].league]?.type === 'league' && !g.leagues[g.clubs[c].league]?.hidden).toBe(false);
    const engLeague = Object.values(g.clubs).filter((c) => g.comps[c.league]?.type === 'league');
    expect(engLeague.length).toBeGreaterThanOrEqual(92);
    for (const c of engLeague) expect(pool).not.toContain(c.id);
  });

  it('grupperne: ⌈n/16⌉ à 16, de første 16 − (n mod 16) à 15, alle klubber én gang', () => {
    const n = pool.length, r = n % 16;
    expect(st.groups.length).toBe(Math.ceil(n / 16));
    st.groups.forEach((grp, i) => expect(grp.length).toBe(r && i < 16 - r ? 15 : 16));
    expect(new Set(st.groups.flat()).size).toBe(n);
    expect([...st.groups.flat()].sort((a, b) => a - b)).toEqual([...pool].sort((a, b) => a - b));
    // sorteret efter omdømme med små lokale ombytninger: første gruppe er stærkere end sidste
    const rep = (grp: number[]) => grp.reduce((s, c) => s + (g.cmClubRep?.[c] ?? 0), 0) / grp.length;
    expect(rep(st.groups[0])).toBeGreaterThan(rep(st.groups[st.groups.length - 1]));
  });

  it('kalenderen (0x84be20): ingen kampe i juni/juli; i august spiller grupperne med dag-i-året mod 7 = gruppen mod 7', () => {
    const save = g.date;
    g.date = '2001-07-20';
    expect(cmResPairs(g, cmResBuild(g))).toEqual([]);
    g.date = '2001-08-08';
    const s2 = cmResBuild(g);
    const pairs = cmResPairs(g, s2);
    expect(pairs.length).toBeGreaterThan(30);
    const doy = 219; // 8/8-2001 (0 = 1/1)
    const groupOf = new Map<number, number>();
    s2.groups.forEach((grp, i) => grp.forEach((c) => groupOf.set(c, i)));
    for (const [h, a] of pairs) {
      expect(groupOf.get(h)).toBe(groupOf.get(a));
      expect(groupOf.get(h)! % 7).toBe(doy % 7);
    }
    expect(new Set(pairs.flat()).size).toBe(pairs.length * 2);
    g.date = save;
  });

  it('kampene: PlayerStats (liga/pokal), ingen tabel, ingen kampprogram, ingen nyheder, ingen penge til billetter', () => {
    g.date = '2001-08-08';
    const nFix = Object.keys(g.fixtures).length, nNews = g.news.length;
    g.cmRes = undefined;
    const virt0 = Object.values(g.players).filter((p) => p.virtual).length;
    const before = Object.fromEntries(pool.map((c) => [c, g.clubs[c].balance]));
    // (20/11) dagens kampe (0x84be20) og hvor mange rigtige spillere hver klub kan stille (højst 11) – Europas klubber uden liga (HE<land>) har ingen
    // spillere i hukommelsen og spiller kun med fyldspillere, som i originalen
    const real = new Map<number, number>();
    for (const p of Object.values(g.players)) if (p.club && !p.virtual) real.set(p.club, (real.get(p.club) ?? 0) + 1);
    const minReal = cmResPairs(g, cmResBuild(g)).flat().reduce((s, c) => s + Math.min(11, real.get(c) ?? 0), 0);
    const played = cmResDaily(g);
    expect(played).toBeGreaterThan(30);
    expect(Object.keys(g.fixtures).length).toBe(nFix);
    expect(g.news.length).toBe(nNews);
    expect(g.news.some((n) => n.key.startsWith('res.'))).toBe(false);
    // spillerne i de klubber, der spillede, har kampe i kategori 2 eller 3 og ingen fyldspillere bagefter
    const withStats = Object.values(g.players).filter((p) => p.cmStats?.[2] || p.cmStats?.[3]);
    // (de inaktive divisioners klubber – Englands non-league – har kun spillerne i hukommelsen og fyldes op med fyldspillere 0x90d2f0 som i
    // originalen, så færre rigtige spillere pr. kamp end en fuld trup)
    expect(minReal).toBeGreaterThan(1000);
    // (21/11) ikke en nedre grænse pr. klub: udtagelsen stiller også fyldspillere, når der er rigtige spillere (fx Racing de Andorra 5 af 14) – med
    // 0x5267c0's klubber med 1–5 spillere (Englands non-league) ligger tallet lige under summen
    // (23/11) 0,94: spilstartens omdømme for spillere uden CA i databasen følger nu 0x536270 (rå CA < 1 → rand(di) + 1, oftest 1 – fordelingen som
    // oraklets 14/7-01), og udtagelsens rollevurdering (roleScore.ts, spillerposten +0xb) vurderer de unge lavere, så lidt flere fyldspillere stilles
    expect(withStats.length).toBeGreaterThanOrEqual(Math.floor(minReal * 0.94));
    expect(Object.values(g.players).filter((p) => p.virtual).length).toBeLessThanOrEqual(virt0);   // 0x90d6b0 efter hver kamp
    // ingen kampindtægt (FinanceTable 0x59a5d0 kaldes ikke) – kun bonusser kan trække penge
    for (const c of pool) expect(g.clubs[c].balance).toBeLessThanOrEqual(before[c]);
  });
});
