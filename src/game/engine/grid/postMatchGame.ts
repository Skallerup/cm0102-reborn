// Kamprapporten efter slutfløjt (postMatch.ts: 0x6d1cc0/0x6d26b0/0x7172d0/0x6d3610/0x6d3de0 og 0x6d4a20) i spillets kampe: strukturerne bygget
// af spillets data, resultaterne som MatchReport.cmPost (cmPlayerData.ts cmApplyPost overfører dem til spillerne og klubberne).
//
// Kilderne (originalens felt → spillets data):
//   MATCH_PLAYER-felterne          gittermotorens tilstand (postMatchInputs.ts pmPlayerOf – kontrolleret felt for felt mod oraklet)
//   staffposten +0x18/+0x57..+0x5d  GP.staffRaw (gameInputs.ts staffBytes: alder, de skjulte egenskaber), +0x1a = Player.nation
//   spillerposten +5/+9/+0xb/+0xd  GP.recRaw (aiTeam.ts playerRecord: CA og cmRepMem ×50)
//   kontrakten 0x4cf5f0 +0x3d/+0x4f Player.cmContract (cmPlayerData.ts), trupstatus (statusCode) uden den
//   klub +0x80 / +0x53             cmPlayerData.ts clubRepMem / Club.nation; turneringen +0x69 / +0x5d: gameInputs.ts fixtureInfoOf / Competition.nation
//   [0xb74350] +0x10/+0x18         GameState.cmRatingAvg (cmPlayerData.ts – 680/100 ved spilstart)
// Findes ikke i spillet (dokumenteret i ENGINE_PORT_PLAN.md, runde 9c): spillerens yndlings-/uvenklubber (staff +0x65), klubbens rivaler og
// yndlinge/uvenner blandt personerne (club +0x9b..+0xbb), club +0xcf, landshold (0x53b900 – landskampene spilles ikke i gittermotoren),
// de store landsholdsturneringer (0x76d940), rundekoderne fixture +0x30/+0x32 (= 0), prøvespillerlisten engine+0x478e (ingen) og managerens
// omdømme i ikke-spillerposten (+8/+0xa/+0xc – Staff har det ikke: 0x6d3610 springes over).
import type { CmPostResult, Player } from '../../types';
import { gs, hasGame } from '../../state';
import { clubRepMem, newCmContract, statusCode } from '../../cmPlayerData';
import { fixtureInfoOf } from './gameInputs';
import type { GP, GridMatch, Rand } from './gridMatch';
import { matchReport6d1cc0, refereeReport6d4a20, type PmClub, type PmEnv, type PmFixture, type PmPlayer, type PmStaff } from './postMatch';
import { pmPlayerOf, pmSides, refereeInputs } from './postMatchInputs';

const s8 = (v: number) => (v << 24) >> 24;
const u16 = (a: Int8Array, o: number) => ((a[o] & 0xff) | ((a[o + 1] & 0xff) << 8));
const s16a = (a: Int8Array, o: number) => (u16(a, o) << 16) >> 16;

function clubOfGame(id: number): PmClub {
  const g = gs(), c = g.clubs[id];
  return { key: id + 1, id, rep: clubRepMem(g, id), nation: c ? c.nation + 1 : 0, ground: id + 1, disStaff: [], favStaff: [], rivals: [], cf: 0, national: false, manager: null };
}

function staffOfGame(q: GP): PmStaff | null {
  const p = q.src;
  if (p.regen || !q.staffRaw || !q.recRaw) return null;                    // 0x6d20d6: genererede spillere (id ≥ [0xae2364]) får ingen rapport
  const S = q.staffRaw, R = q.recRaw;
  return { key: p.id + 1, id: p.id, age: s8(S[0x18]), nation: (p.nation ?? -1) + 1, ambition: S[0x57], determination: S[0x58], pressure: S[0x5a],
    professionalism: S[0x5b], temperament: S[0x5d], rec: { ca: s16a(R, 5), r9: s16a(R, 9), rb: s16a(R, 0xb), rd: s16a(R, 0xd) }, prefs: null };
}

/** kamprapporten for gittermotorens kamp (efter slutfløjtet) med kampens egne tal (rand) – null uden spil */
export function gamePostReport(gm: GridMatch, o: { home: number; away: number; fixtureId?: number; neutral?: boolean }, rand: Rand): CmPostResult | null {
  if (!hasGame()) return null;
  const g = gs();
  const f = o.fixtureId !== undefined ? g.fixtures[o.fixtureId] : undefined;
  const info = fixtureInfoOf(f?.comp, o.home, f?.stage);
  const comp = f ? g.comps[f.comp] : g.comps[g.clubs[o.home]?.league ?? ''];
  const home = clubOfGame(o.home), away = clubOfGame(o.away);
  const fx: PmFixture = {
    id: o.fixtureId ?? 0, home, away, ground: o.neutral ? 0 : home.ground, w30: 0, w32: 0, b3a: info.fx3a, b40: 1,
    comp: info.comp ? { rep: info.comp.rep, nation: comp && comp.nation >= 0 ? comp.nation + 1 : 0, major: false, special: false } : null,
    goals: [gm.m.goals[0] & 0xff, gm.m.goals[1] & 0xff],
  };
  const sides = pmSides(gm);
  const players: [(PmPlayer | null)[], (PmPlayer | null)[]] = [Array(20).fill(null), Array(20).fill(null)];
  const byIdx: [Player[], Player[]] = [[], []];
  for (const s of [0, 1] as const) sides[s].forEach((q, i) => { if (i < 20) { players[s][i] = pmPlayerOf(gm, q, staffOfGame(q)); byIdx[s][i] = q.src; } });
  const env: PmEnv = {
    b0: 0, avg: [...(g.cmRatingAvg ?? [680, 100]), 0, 0] as [number, number, number, number], clock: gm.m.clock, momSet: !!gm.manOfTheMatch(),
    staffLimit: Infinity, list: true, trials: null,
    contract: (st, club) => {
      const p = g.players[st.id];
      if (!p || p.club !== club.id || p.loan) return null;
      const c = p.cmContract ?? newCmContract(statusCode(p));
      return { b3d: c.b3d, b4f: c.b4f ?? (statusCode(p) << 4) };
    },
  };
  const res = matchReport6d1cc0({ fx, players, managers: [null, null] }, env, rand);
  const refIn = refereeInputs(gm, sides);
  const ref = refereeReport6d4a20({ ref: 0, comp: fx.comp, ...refIn }, rand);
  const out: CmPostResult = { players: {}, clubRep: [res.clubRep[0], res.clubRep[1]], referee: ref ? ref.score : null };
  for (const s of [0, 1] as const) players[s].forEach((p, i) => {
    if (!p || p.w47 === undefined || !byIdx[s][i]) return;
    // MATCH_PLAYER +0x17 og +0x49/+0x47/+0x4b = spillerpostens +0x45 og +9/+0xb/+0xd (0x6d35d5's gren uden kampspiller skriver dem dér)
    out.players[byIdx[s][i].id] = { morale: p.morale, rep: [p.w49!, p.w47!, p.w4b!] };
  });
  return out;
}
