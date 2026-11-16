// Originalens venskabskampe for mennesket og computerens svar (cmFriendlyOffers.ts – club_screens.cpp 0x470400/0x470fe0/0x482d10,
// comp/friendly.cpp 0x5c75a0/0x5c6b70/0x5c6f00/0x5c5570/0x5c5f40/0x5c6570/0x5c85d0). Den originale database i ægte tilstand.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { act } from '../src/game/actions';
import {
  FRIENDLY_COMP, cmFrAddMatch, cmFrDateStatus, cmFrFree, cmFrInviteCheck, cmFrInviteKind, cmFrOpenMatch, cmFrReply, cmFrSend, cmFrTourNations,
  cmFrUpdate, frDn, frIso,
} from '../src/game/cmFriendlyOffers';
import { CM_NATION_FR } from '../src/game/data/cmPreseason';
import type { GameState } from '../src/game/types';

describe('venskabskampe som CM 01/02 (original DB, ægte tilstand)', () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((x) => x.name === 'England');
  const clubId = (short: string) => world.clubs.find((c) => c[2] === short)![0];
  createGame(world, { managerName: 'T', managerNation: eng, clubId: clubId('Man Utd'), activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  const g = gs() as GameState;
  const me = g.userClub;
  const today = frDn(g.date);
  const clubFix = (club: number) => Object.values(g.fixtures).filter((f) => f.home === club || f.away === club);
  /** første dag fra `from`, hvor klubben er ledig (status 1) */
  const firstFree = (club: number, from: number) => { for (let d = from; d < from + 200; d++) if (cmFrDateStatus(g, club, d).s === 1) return d; throw new Error('ingen'); };
  const small = Object.values(g.clubs).filter((c) => c.nation === eng && c.id !== me && g.comps[c.league]?.type === 'league').sort((a, b) => (g.cmClubRep?.[a.id] ?? 0) - (g.cmClubRep?.[b.id] ?? 0))[0];

  it('datoerne (0x5c75a0): under en uge frem er optaget, en kampdag og dagene omkring er optaget', () => {
    expect(g.date).toBe('2001-07-14');
    expect(cmFrDateStatus(g, me, today + 3).s).toBe(2);
    const lg = clubFix(me).filter((f) => g.comps[f.comp]?.type === 'league').sort((a, b) => a.date.localeCompare(b.date))[0];
    const d = frDn(lg.date);
    for (const x of [d - 1, d, d + 1]) expect(cmFrDateStatus(g, me, x).s).toBe(2);
    expect(cmFrFree(g, me, d + 3) || cmFrDateStatus(g, me, d + 3).s !== 1).toBe(true);
    expect(cmFrDateStatus(g, me, d, [d]).s).toBe(4);
  });

  it('Home Friendly: åben invitation → Invite Club → computerens svar dagen efter → kampen', () => {
    const d = firstFree(me, today + 7);
    expect(act({ t: 'cmFrArrange', date: frIso(d), home: true })).toBe('ok');
    const m = cmFrOpenMatch(g)!;
    expect(m.home).toBe(me);
    expect(m.away).toBe(0);
    expect(cmFrInviteKind(g, me)).toBeNull();
    expect(cmFrInviteKind(g, small.id)).toBe('match');
    const chk = cmFrInviteCheck(g, small.id)!;
    expect(chk.home).toBe(true);
    expect(chk.date).toBe(frIso(d));
    if (!chk.ok) return;                          // den lille klub har selv en kamp den dag – ingen invitation
    expect(act({ t: 'cmFrInvite', club: small.id })).toBe('ok');
    expect(cmFrOpenMatch(g)).toBeUndefined();
    expect(m.pend).toBe(1);
    // på Fixtures: "{klub} ?" på dagen (status 5)
    expect(cmFrDateStatus(g, me, d).s).toBe(5);
    cmFrUpdate(g, today + 1);
    const fx = Object.values(g.fixtures).find((f) => f.comp === FRIENDLY_COMP && f.date === frIso(d) && f.home === me);
    // Man Utd har langt højere omdømme end den mindste klub: ja (0x5c5f40: arrangøren ≥ den indbudtes / f)
    expect(fx?.away).toBe(small.id);
    expect(g.news.some((n) => n.key === 'cmfr.accepts' && n.params?.date === frIso(d))).toBe(true);
    expect(g.cmFrH!.m.some((x) => x === m)).toBe(false);
    // Cancel (0x5c6570): kampen slettes
    expect(act({ t: 'cmFrCancel', fixture: fx!.id })).toBe('ok');
    expect(g.fixtures[fx!.id]).toBeUndefined();
  });

  it('svaret efter omdømmet (0x5c5f40): en lille arrangør får nej af en storklub, et ja med lille forskel', () => {
    const big = Object.values(g.clubs).filter((c) => c.nation === eng && c.id !== me).sort((a, b) => (g.cmClubRep?.[b.id] ?? 0) - (g.cmClubRep?.[a.id] ?? 0))[0];
    const d = firstFree(small.id, today + 10);
    const rep = g.cmClubRep![small.id];
    const m = cmFrAddMatch(g, small.id, d, big.id, true)!;
    cmFrSend(g, m);
    cmFrReply(g, m);
    expect(m.st).toBe(4);
    // ri − ro ≤ 600 · 1,65 → ja, selv om arrangøren er svagere
    const n2 = Object.values(g.clubs).find((c) => c.nation === eng && c.id !== me && c.id !== small.id && (g.cmClubRep?.[c.id] ?? 0) > rep && (g.cmClubRep?.[c.id] ?? 0) - rep < 900)!;
    if (n2) {
      const d2 = firstFree(n2.id, d + 3);
      const m2 = cmFrAddMatch(g, small.id, d2, n2.id, true)!;
      cmFrReply(g, m2);
      expect(m2.st).toBe(3);
      expect(Object.values(g.fixtures).some((f) => f.comp === FRIENDLY_COMP && f.home === small.id && f.away === n2.id)).toBe(true);
    }
  });

  it('en åben invitation uden modstander forsvinder ved næste opdatering (0x5c262f)', () => {
    const d = firstFree(me, today + 20);
    act({ t: 'cmFrArrange', date: frIso(d), home: false });
    expect(cmFrOpenMatch(g)?.away).toBe(me);
    cmFrUpdate(g, today + 1);
    expect(cmFrOpenMatch(g)).toBeUndefined();
  });

  it('turnéen (0x5c7e32): ikke to dage i træk, højst 3 dage fra de valgte; landene efter omdømmet (0x471a90)', () => {
    const d = firstFree(me, today + 7);
    expect(cmFrDateStatus(g, me, d + 1, [d], true).s).toBe(2);
    expect(cmFrDateStatus(g, me, d + 5, [d], true).s).toBe(2);
    expect([1, 2]).toContain(cmFrDateStatus(g, me, d + 2, [d], true).s);
    const nats = cmFrTourNations(g, (n) => CM_NATION_FR[n]);
    expect(nats.length).toBeGreaterThan(10);
    expect(nats.some((x) => x.nation === eng)).toBe(false);
    // Man Utd (omdømme ≥ 8000 → trin 5): alle lande kan vælges
    if ((g.cmClubRep?.[me] ?? 0) >= 8000) expect(nats.every((x) => x.ok)).toBe(true);
    const nat = nats.find((x) => x.ok && Object.values(g.clubs).some((c) => c.nation === x.nation))!.nation;
    const free2 = cmFrDateStatus(g, me, d + 2, [d], true).s === 1;
    const dates = free2 ? [d, d + 2] : [d];
    expect(act({ t: 'cmFrTour', nation: nat, dates: dates.map(frIso) })).toBe('ok');
    expect(cmFrDateStatus(g, me, d).s).toBe(6);
    const opp = Object.values(g.clubs).find((c) => c.nation === nat)!;
    expect(cmFrInviteKind(g, opp.id)).toBe('tour');
    const other = Object.values(g.clubs).find((c) => c.nation !== nat && c.id !== me)!;
    expect(cmFrInviteKind(g, other.id)).toBeNull();
    if (cmFrInviteCheck(g, opp.id)!.ok) {
      expect(act({ t: 'cmFrInvite', club: opp.id })).toBe('ok');
      const mm = g.cmFrH!.m.find((x) => x.org === me && x.d === frIso(d))!;
      expect(mm.home).toBe(opp.id);        // turnéen: mennesket ude
    }
    expect(act({ t: 'cmFrCancel', tour: g.cmFrH!.t.findIndex((x) => x.club === me) })).toBe('ok');
    expect(g.cmFrH!.t.some((x) => x.club === me)).toBe(false);
    expect(g.cmFrH!.m.some((x) => x.org === me && x.d === frIso(d))).toBe(false);
  });

  it('computerens tilbud til mennesket (0x5c5570 → nyheden "friendly proposal", Respond 0x4744b0)', () => {
    const d = firstFree(me, today + 30);
    const org = small.id;
    if (cmFrDateStatus(g, org, d).s !== 1) return;
    const m = cmFrAddMatch(g, org, d, me, true)!;
    cmFrSend(g, m);
    expect(m.st).toBe(2);
    expect(g.news.some((n) => n.key === 'cmfr.proposal' && n.params?.date === frIso(d))).toBe(true);
    cmFrUpdate(g, today + 1);               // venter på mennesket – ingen kamp, tilbuddet står
    expect(g.cmFrH!.m.includes(m)).toBe(true);
    expect(act({ t: 'cmFrAnswer', date: frIso(d), org, yes: true })).toBe('ok');
    expect(Object.values(g.fixtures).some((f) => f.comp === FRIENDLY_COMP && f.date === frIso(d) && f.home === org && f.away === me)).toBe(true);
  });

  it('computerens forsæson går gennem tilbud og svar (stadig venskabskampe, kun efter 14/7)', () => {
    const fr = Object.values(g.fixtures).filter((f) => f.comp === FRIENDLY_COMP);
    expect(fr.length).toBeGreaterThan(30);
    expect((g.cmFrH?.m ?? []).every((m) => m.d >= g.date)).toBe(true);
  });
});
