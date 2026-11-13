// Kompakte kamprapporter for computerklubbernes kampe (CM 01/02 kan vise enhver spillet kamp som kampskærmen efter slutfløjt:
// opstillinger med trøjenumre, udskiftninger, karakterer, kort, kampens spiller, Match Stats, Team Stats og Action Zones).
// Pakkes af motorens færdige rapport (ingen tilfældige tal) og gemmes i g.miniReports for den aktuelle sæson – prune() rydder dem
// sammen med kampprogrammet. Kommentaren og skuddene gemmes ikke (computerens kampe spilles uden kommentar).
import type { GameState, MatchEvent, MatchReport, MatchStatsSide, MiniReport, PlayerMatchLine, ShootoutKick } from './types';

const STAT_KEYS = ['goals', 'shots', 'onTarget', 'possession', 'corners', 'fouls', 'yellows', 'reds', 'offsides', 'passes', 'passesCompleted',
  'throwIns', 'tackles', 'tacklesWon', 'headers', 'headersWon'] as const;
/** de begivenheder, kampskærmen bruger (mål, kort, udskiftninger, skader) */
const EV_KINDS = ['goal', 'yellow', 'red', 'sub', 'injury'] as const;
const SO_OUT: ShootoutKick['outcome'][] = ['goal', 'saved', 'off'];
/** zonemotorens 15 felter: 5 bånd × 3 baner → tredjedele (eget forsvar = bånd 0-1, midtbane 2, angreb 3-4), som PlayedMatchClassic */
const LANES = 3;

const statsOut = (s: MatchStatsSide): number[] => {
  const out = STAT_KEYS.map((k) => s[k]);
  // zonemotoren tæller ikke CM 01/02's indkast/tacklinger/hovedstød – de udelades så (CxMatchStats skjuler rækkerne)
  return out[11] === undefined ? out.slice(0, 11).map((v) => v ?? 0) : out.map((v) => v ?? 0);
};

/** karaktererne gemmes som hele tal 1-10 (sådan viser kampskærmen dem) */
export function packReport(rep: MatchReport, num: (id: number) => number | undefined): MiniReport {
  // pr. hold: de startende efter plads, så de indskiftede (rækkefølgen giver pladsen); CM 01/02-tællerne til sidst, så zonemotorens
  // manglende (−1) kan skæres af
  const p = ([0, 1] as const).map((side) => {
    const mine = rep.players.filter((l) => l.team === side);
    return [...mine.filter((l) => !l.sub).sort((a, b) => a.slot - b.slot), ...mine.filter((l) => l.sub)].map((l) => {
      const row = [l.id, Math.round(Math.max(1, Math.min(10, l.rating))), l.goals, l.assists, (l.yellow & 3) | (l.red ? 4 : 0) | (l.injured ? 8 : 0) | (l.sub ? 16 : 0),
        l.shots, l.tackles, l.passes, l.passesOk, Math.round(l.cond), num(l.id) ?? -1, l.tckA ?? -1, l.hea ?? -1, l.heaW ?? -1, l.on ?? -1];
      while (row.length > 11 && row[row.length - 1] === -1) row.pop();
      return row;
    });
  }) as [number[][], number[][]];
  const b = ([0, 1] as const).map((s) => (rep.bench?.[s] ?? []).flatMap((id) => [id, num(id) ?? -1])) as [number[], number[]];
  const e: number[] = [];
  for (const ev of rep.events) {
    const k = (EV_KINDS as readonly string[]).indexOf(ev.k);
    if (k < 0) continue;
    e.push(ev.m, ev.t, k, ev.p ?? 0, ev.p2 ?? 0, (ev.og ? 1 : 0) | (ev.pen ? 2 : 0));
  }
  const z = [0, 0, 0, 0, 0, 0];
  rep.heat.forEach((h, side) => h.forEach((v, zone) => { const band = Math.floor(zone / LANES); const zi = band <= 1 ? 0 : band === 2 ? 1 : 2; z[zi * 2 + side] += v; }));
  const mini: MiniReport = { s: [statsOut(rep.stats[0]), statsOut(rep.stats[1])], p, b, e, z: z.map((v) => Math.round(v)), mom: rep.mom, c: rep.capt ?? [0, 0] };
  if (rep.shootout?.length) mini.so = rep.shootout.flatMap((k) => [k.t, k.p, k.gk, SO_OUT.indexOf(k.outcome)]);
  return mini;
}

/** Rapporten pakket ud til kampskærmen (PlayedMatchClassic) – kun de felter, skærmen bruger; heat = tredjedelene i felterne 0/6/9 */
export function unpackReport(mini: MiniReport, fixture: number, home: number, away: number, et?: boolean, pens?: [number, number]): MatchReport {
  const stats = mini.s.map((a) => {
    const s = { xg: 0 } as MatchStatsSide;
    STAT_KEYS.forEach((k, i) => { if (i < a.length) (s as unknown as Record<string, number>)[k] = a[i]; });
    return s;
  }) as [MatchStatsSide, MatchStatsSide];
  const nums: Record<number, number> = {};
  const opt = (v: number) => (v < 0 ? undefined : v);
  // minutterne gemmes ikke (kampskærmen viser dem ikke – udskiftningernes minut står i begivenhederne)
  const players: PlayerMatchLine[] = mini.p.flatMap((rows, team) => rows.map((a, i) => {
    if (a[10] >= 0) nums[a[0]] = a[10];
    const sub = !!(a[4] & 16);
    return { id: a[0], team, rating: a[1], goals: a[2], assists: a[3], minutes: 0, yellow: a[4] & 3, red: !!(a[4] & 4), injured: !!(a[4] & 8), sub,
      slot: sub ? 99 : i, shots: a[5], tackles: a[6], passes: a[7], passesOk: a[8], cond: a[9], tckA: opt(a[11] ?? -1), hea: opt(a[12] ?? -1), heaW: opt(a[13] ?? -1), on: opt(a[14] ?? -1) };
  }));
  const bench = mini.b.map((a) => {
    const ids: number[] = [];
    for (let i = 0; i < a.length; i += 2) { ids.push(a[i]); if (a[i + 1] >= 0) nums[a[i]] = a[i + 1]; }
    return ids;
  }) as [number[], number[]];
  const events: MatchEvent[] = [];
  for (let i = 0; i + 6 <= mini.e.length; i += 6) {
    const [m, t, k, p, p2, fl] = mini.e.slice(i, i + 6);
    events.push({ m, t, k: EV_KINDS[k], ...(p ? { p } : {}), ...(p2 ? { p2 } : {}), ...(fl & 1 ? { og: true } : {}), ...(fl & 2 ? { pen: true } : {}) });
  }
  // tredjedelene lægges i ét felt pr. bånd (PlayedMatchClassic summerer båndene til tredjedele igen)
  const heat: [number[], number[]] = [Array(15).fill(0), Array(15).fill(0)];
  for (let zi = 0; zi < 3; zi++) for (let side = 0; side < 2; side++) heat[side][[0, 2, 3][zi] * LANES] = mini.z[zi * 2 + side] ?? 0;
  const shootout = mini.so ? Array.from({ length: mini.so.length / 4 }, (_, i) => ({ t: mini.so![i * 4], p: mini.so![i * 4 + 1], gk: mini.so![i * 4 + 2], outcome: SO_OUT[mini.so![i * 4 + 3]] ?? 'off' })) : undefined;
  return { fixture, home, away, stats, players, events, shots: [], momentum: [], heat, zoneControl: [], mom: mini.mom, commentary: [], et, pens, shootout,
    formations: ['', ''], bench, capt: mini.c, nums };
}

/** Den viste rapport for en spillet kamp: menneskets fulde rapport, ellers computerkampens kompakte (ældre gemte spil: ingen) */
export function matchViewReport(g: GameState, id: number): MatchReport | undefined {
  const rep = g.reports[id];
  if (rep) return rep;
  const mini = g.miniReports?.[id];
  const f = g.fixtures[id];
  if (!mini || !f) return undefined;
  return unpackReport(mini, id, f.home, f.away, f.result?.et, f.result?.pens);
}

export const hasMatchView = (g: GameState, id: number | undefined) => id !== undefined && (!!g.reports[id] || !!g.miniReports?.[id]);
