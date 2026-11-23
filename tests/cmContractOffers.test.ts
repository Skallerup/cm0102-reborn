// CM 01/02: menneskets kontrakttilbud til egen spiller (forlængelse) og til en klubløs afgøres som alle kontrakttilbud i resolve_contract_offers
// 0x4ce4e0 – værdien 0x866830 af tilbuddet mod spillerens krav 0x85fc50, vægtet med viljen 0x846920 (cmContractAnswer). Ejerens fund 23/11: en
// spiller sagde ja til en løn langt under kravet (før: spillets eget skøn med et andet krav end originalens for klubløse og forlængelser).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { act } from '../src/game/actions';
import { humanRenewDemand, processOffers, renewContract } from '../src/game/transfers';
import { cmContractAnswer, cmTalkDemand } from '../src/game/cmContractGame';
import { cmTalksDemand, offerTerms } from '../src/game/cmTransferTalks';
import type { Player, TransferOffer } from '../src/game/types';

describe('kontrakttilbud til egen spiller og klubløse (3.9.60, ægte tilstand)', { timeout: 600_000 }, () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((n) => n.name === 'England');
  const ipswich = world.clubs.find((c) => c[1] === 'Ipswich Town')![0];
  const r50 = (v: number) => Math.round(v / 50) * 50;

  it('forlængelse: kravet er 0x85fc50 for egen klub, og svaret er 0x4ce4e0 – halv løn afvises, kravet accepteres', () => {
    createGame(world, { managerName: 'M S', managerNation: eng, clubId: ipswich, activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
    const g = gs();
    const club = g.clubs[ipswich];
    club.wageBudget = 1e9;
    let accepted = 0, checked = 0;
    for (const p of squad(ipswich).sort((a, b) => b.ca - a.ca).slice(0, 12)) {
      const d = humanRenewDemand(p, club);
      const cm = cmTalkDemand(g, p, ipswich, p.squadStatus)!;
      expect(d.wage).toBe(cm.wage);
      const so = Math.round(d.signOn / 500) * 500;
      const snap = JSON.stringify(p.contract);
      const half = renewContract(p.id, r50(d.wage * 0.5), d.years, so ? { signOn: so } : {});
      p.contract = JSON.parse(snap);
      if (half !== 'budget') { expect(half).toBe('counter'); checked++; }
      const full = renewContract(p.id, r50(d.wage), d.years, so ? { signOn: so } : {});
      p.contract = JSON.parse(snap);
      if (full === 'accepted') accepted++;
    }
    expect(checked).toBeGreaterThan(5);
    expect(accepted).toBeGreaterThan(5);
  });

  it('0x866830: signing-on fordeles over tilbuddets dage – samme løn og samme beløb er mere værd på en kortere kontrakt', () => {
    const g = gs();
    const p = squad(ipswich).sort((a, b) => b.ca - a.ca)[0];
    const w = cmTalkDemand(g, p, ipswich, p.squadStatus)!;
    const long = cmContractAnswer(g, p, ipswich, offerTerms(g, w.wage * 0.7, 5, { signOn: w.signOn }, ipswich), p.squadStatus)!;
    const short = cmContractAnswer(g, p, ipswich, offerTerms(g, w.wage * 0.7, 1, { signOn: w.signOn }, ipswich), p.squadStatus)!;
    expect(short.score).toBeGreaterThan(long.score);
  });

  it('klubløs: Offer Contract viser 0x85fc50, svaret efter 1–5 dage (0x4ce4e0) – halv løn afvises, kravet giver underskrift uden Confirm Transfer Offer', () => {
    const g = gs();
    const club = g.clubs[ipswich];
    club.wageBudget = 1e9;
    let p: Player | undefined, o: TransferOffer | undefined;
    for (const x of Object.values(g.players).filter((q) => !q.club && q.ca > 60).sort((a, b) => b.ca - a.ca)) {
      const w = cmTalkDemand(g, x, ipswich);
      if (!w || w.wage > 20000) continue;
      const ok = cmContractAnswer(g, x, ipswich, offerTerms(g, w.wage, Math.max(1, Number(w.expires.slice(0, 4)) - Number(g.date.slice(0, 4))), { signOn: w.signOn }, ipswich));
      if (ok?.accept) { p = x; break; }
    }
    expect(p).toBeDefined();
    const r = act<TransferOffer | string>({ t: 'bid', pid: p!.id, fee: 0, loan: false });
    expect(typeof r).toBe('object');
    o = r as TransferOffer;
    expect(o.cmTalks?.state).toBe(0);
    const want = cmTalksDemand(o)!;
    const years = Math.max(1, Number(want.expires.slice(0, 4)) - Number(g.date.slice(0, 4)));
    // halv løn: afslag (0x8c28c0-svaret "rejects"), tilbuddet kan gives igen
    expect(act({ t: 'negotiate', pid: p!.id, wage: r50(want.wage * 0.5), years, clauses: { signOn: want.signOn } })).toBe('cmSent');
    const d0 = g.date;
    g.date = o.cmTalks!.due!;
    processOffers();
    expect(o.cmTalks!.state).toBe(4);
    expect(p!.club).toBe(0);
    // det åbne tilbud åbnes igen fra spillerens side (Offer Contract)
    expect(act<TransferOffer | string>({ t: 'bid', pid: p!.id, fee: 0, loan: false })).toBe(o);
    expect(act({ t: 'negotiate', pid: p!.id, wage: r50(want.wage), years, clauses: { signOn: want.signOn } })).toBe('cmSent');
    g.date = o.cmTalks!.due!;
    processOffers();
    expect(p!.club).toBe(ipswich);
    expect(o.status).toBe('completed');
    g.date = d0;
  });
});
