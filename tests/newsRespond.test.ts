// CM 01/02: nyheder, der kræver svar (0x782b70 = 2), holder Continue Game tilbage (ejerens billede 19/11: "Valencia transfer bid for
// Scholes" med Respond og Continue Game grå). 0x787350(m, 1) → nyhedsskærmen med den ældste ulæste/ubesvarede nyhed.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import type { NewsItem, TransferOffer } from '../src/game/types';
import { newsDue, newsMustRespond } from '../src/ui/screens/newsRespond';

const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((n) => n.name === 'England');

describe('nyheder, der kræver svar', () => {
  it('bud på egen spiller, jobtilbud og Squad Numbers blokerer – Appeal/Ultimatum og læste beskeder gør ikke', () => {
    createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Manchester United')![0], activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
    const g = gs();
    for (const n of g.news) n.read = true;
    g.clubs[g.userClub].sqnDue = undefined;
    expect(newsDue(g)).toBeUndefined();
    const p = Object.values(g.players).find((x) => x.club === g.userClub)!;
    const buyer = Number(Object.keys(g.clubs).find((c) => Number(c) !== g.userClub));
    const o: TransferOffer = { id: g.nextId.offer++, player: p.id, buyer, seller: g.userClub, fee: 1_700_000, loan: false, status: 'pending', created: g.date, respondBy: g.date };
    g.offers.push(o);
    const bid: NewsItem = { id: g.nextId.news++, date: g.date, read: true, cat: 'transfer', key: 'transfer.incomingBid', params: { club: 'Valencia', player: p.last, fee: o.fee }, link: { kind: 'offer', id: o.id } };
    const other: NewsItem = { id: g.nextId.news++, date: g.date, read: true, cat: 'board', key: 'board.cm', params: {} };
    g.news.unshift(bid, other);
    expect(newsMustRespond(g, bid)).toBe(true);
    expect(newsMustRespond(g, other)).toBe(false);
    expect(newsDue(g)?.id).toBe(bid.id);
    // besvaret: ikke længere blokerende
    o.status = 'rejected';
    expect(newsMustRespond(g, bid)).toBe(false);
    expect(newsDue(g)).toBeUndefined();
    // jobtilbuddet (0x1774) til det er besvaret
    const job: NewsItem = { id: g.nextId.news++, date: g.date, read: true, cat: 'job', key: 'news.jobOffer', params: { club: 'X' }, link: { kind: 'club', id: buyer } };
    g.news.unshift(job);
    expect(newsMustRespond(g, job)).toBe(false);
    g.jobOffers.push(buyer);
    expect(newsMustRespond(g, job)).toBe(true);
    g.jobOffers.length = 0;
    // Squad Numbers (målt 9/11)
    const sqn: NewsItem = { id: g.nextId.news++, date: g.date, read: true, cat: 'general', key: 'sqn.request', params: { club: 'Man Utd' } };
    g.news.unshift(sqn);
    g.clubs[g.userClub].sqnDue = g.season;
    expect(newsMustRespond(g, sqn)).toBe(true);
    g.clubs[g.userClub].sqnDue = undefined;
    // ældste af ulæste og ubesvarede vælges først (0x7888c2 ">=")
    o.status = 'pending';
    const unread: NewsItem = { id: g.nextId.news++, date: g.date, read: false, cat: 'board', key: 'board.cm', params: {} };
    g.news.unshift(unread);
    expect(newsDue(g)?.id).toBe(bid.id);
    o.status = 'rejected';
    expect(newsDue(g)?.id).toBe(unread.id);
  }, 120_000);

  it('jobtilbud midt i sæsonen: No i "Accept the position …?" er et afslag (0x6b2790 handling 1) og frigiver Continue Game', async () => {
    createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Manchester United')![0], activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
    const g = gs();
    for (const n of g.news) n.read = true;
    g.clubs[g.userClub].sqnDue = undefined;
    g.jobOffers.length = 0;
    expect(newsDue(g)).toBeUndefined();
    const cid = Number(Object.keys(g.clubs).find((c) => Number(c) !== g.userClub && g.clubs[Number(c)].league === g.clubs[g.userClub].league));
    g.jobOffers.push(cid);
    const job: NewsItem = { id: g.nextId.news++, date: g.date, read: false, cat: 'job', key: 'news.jobOffer', params: { club: g.clubs[cid].short }, link: { kind: 'club', id: cid } };
    g.news.unshift(job);
    // Continue Game åbner tilbuddet (ældste ubesvarede), og det blokerer, til det er besvaret
    expect(newsDue(g)?.id).toBe(job.id);
    expect(newsMustRespond(g, job)).toBe(true);
    // No (JobOfferPanel i ægte tilstand) = declineJob
    const { act } = await import('../src/game/actions');
    act({ t: 'declineJob', club: cid });
    expect(gs().jobOffers).not.toContain(cid);
    job.read = true;
    expect(newsMustRespond(gs(), job)).toBe(false);
    expect(newsDue(gs())).toBeUndefined();
    // UI: No kalder afslaget (ikke blot luk)
    const src = readFileSync('src/ui/screens/TransferStatusClassic.tsx', 'utf8');
    expect(src).toMatch(/className="cx-job-no" onClick=\{decline\}/);
  }, 120_000);
});
