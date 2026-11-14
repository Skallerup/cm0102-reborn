// CM 01/02's transferliste og spillerens utilfredshed (cm0102.exe 3.9.68) – cmTransferList.ts: 0x8ce0e0, 0x4ca470, 0x842320/0x8f8450,
// Transfer-fanens Future (0x87dd80), transferanmodningen 0x4d8610/0x4d8990/0x4dcd70 og de interesserede klubber (0x842180, *estimeret*).
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  cmAnswerRequest, cmAvailability, cmFutureHappy, cmFutureLines, cmInterested, cmRequestNews, deservedStatus, requestBodyKind, requestReasons, statusHappiness,
} from '../src/game/cmTransferList';
import { cmContractOf, cmRand, newCmContract } from '../src/game/cmPlayerData';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { act } from '../src/game/actions';
import { aiBidsForListed } from '../src/game/transfers';
import { clubLevel } from '../src/game/scouting';
import { fromGbp, toGbp } from '../src/game/cmTransferBid';
import { addDays } from '../src/game/dates';
import { valueTarget } from '../src/game/training';
import { ATTRS } from '../src/game/attributes';

describe('tilfredsheden ved ny trupstatus (0x8ce0e0, springtabellen 0x8ce8f0)', () => {
  it('uden status før: Key +100, First +50, Rotation +25, Backup 0, Not Needed −100; listet (flag & 3) → −100', () => {
    expect([1, 2, 3, 4, 5, 6, 7].map((s) => statusHappiness(0, 0, s, 0))).toEqual([100, 50, 25, 0, 0, -20, -100]);
    expect([1, 2, 3, 4, 5].map((s) => statusHappiness(0, 0, s, 1))).toEqual([-100, -100, -100, -100, -50]);
    expect(statusHappiness(0, 0, 5, 2)).toBe(0);            // Hot Prospect tester kun & 1
  });
  it('med status før: kun nedrykning, (gammel − ny)·25, 3 → 4 = −50, højst −125, klemt til ±100', () => {
    expect(statusHappiness(40, 2, 7, 0)).toBe(-85);          // First → Not Needed: −125
    expect(statusHappiness(40, 3, 4, 0)).toBe(-10);
    expect(statusHappiness(40, 1, 3, 0)).toBe(-10);
    expect(statusHappiness(40, 5, 2, 0)).toBe(40);           // forfremmelse: uændret
    expect(statusHappiness(-90, 1, 7, 0)).toBe(-100);
  });
});

describe('den fortjente status (0x4ca470)', () => {
  const pl = (age: number) => ({ dob: `${2001 - age}-01-01`, attrs: [], cmRep: [100, 100, 150] } as never);
  it('efter +0x3d (spilletiden) og den nuværende status', () => {
    const c = newCmContract(1);
    c.b4f = 0x10; c.b3d = 50; expect(deservedStatus(pl(27), c, 27)).toBe(1);
    c.b3d = 20; expect(deservedStatus(pl(27), c, 27)).toBe(3);
    c.b4f = 0x40; c.b3d = -40; expect(deservedStatus(pl(27), c, 27)).toBe(7);
    c.b4f = 0x60; c.b3d = 80; expect(deservedStatus(pl(25), c, 25)).toBe(1);
  });
});

describe('transferanmodningens tekst (0x4d8990)', () => {
  it('grundene i originalens rækkefølge, højst fem', () => {
    expect(requestReasons(0x10 | 0x200, false, 8000, true, false)).toEqual(['regular', 'unfair']);
    expect(requestReasons(2, true, 8000, true, false)).toEqual(['agentContract']);
    expect(requestReasons(2 | 0x1000000, false, 8000, true, false)).toEqual(['payDemands']);
    expect(requestReasons(0x20000, false, 8000, true, true)).toEqual(['endCareer']);
    expect(requestReasons(0x20000, false, 8000, true, false)).toEqual(['homesick']);
    expect(requestReasons(0x20000000, false, 8000, true, false)).toEqual([]);   // kun klubber under 6750 i omdømme
    expect(requestReasons(0x20000000, false, 5000, true, false)).toEqual(['ambitious']);
    expect(requestReasons(0x800, false, 8000, true, false)).toEqual(['teammate', 'assistant']);
    expect(requestReasons(0x40000 | 1, false, 8000, true, false)).toEqual(['bigger']);
    expect(requestReasons(0x7fffffff, false, 5000, true, false)).toHaveLength(5);
  });
  it('brødteksten efter antallet af grunde, staff-id og agenten', () => {
    expect(requestBodyKind(0, 7, 0, false).body).toBe('unhappy');
    expect(requestBodyKind(1, 3, 0x10, false)).toMatchObject({ body: 'request', join: 'one' });       // 1 ≤ 3 % 3 + 2
    expect(requestBodyKind(3, 3, 0x10, false)).toMatchObject({ body: 'furious', join: 'three' });     // 3 > 2
    expect(requestBodyKind(4, 5, 0x10, false)).toMatchObject({ body: 'request', join: 'some', pick: [1, 3] });
    expect(requestBodyKind(1, 3, 3, true).body).toBe('agentRequest');                                  // (3 − 3) % 3 = 0
    expect(requestBodyKind(3, 3, 4, true).body).toBe('agentDemand');
    expect(requestBodyKind(5, 3, 4, true).body).toBe('agentDemandMany');
  });
});

describe('i spillet (3.9.60, ægte tilstand)', { timeout: 120_000 }, () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((n) => n.name === 'England');
  const mu = world.clubs.find((c) => c[1] === 'Manchester United')![0];
  const scholes = () => squad(mu).find((p) => p.last === 'Scholes')!;

  it('Scholes billigt og "not needed": værdien bliver udbudsprisen, tilfredsheden falder, klubber er interesserede og byder hurtigt', () => {
    createGame(world, { managerName: 'M S', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
    const g = gs();
    g.date = addDays(g.date, 30);
    const p = scholes();
    const c = cmContractOf(p);
    c.b44 = 0; c.b45 = 0; c.b4f = ((c.b4f ?? 0) & 0xf) | 0x20; p.squadStatus = 'first';
    const price = fromGbp(100_000);
    expect(price).toBeLessThan(valueTarget(p));
    act({ t: 'cmTransferStatus', pid: p.id, status: 7, price, listed: false, loan: false, request: false });
    expect(p.value).toBe(price);                         // Value på Transfer-fanen = +0x52 = udbudsprisen
    expect(Math.round(toGbp(p.value))).toBe(100_000);
    expect(p.squadStatus).toBe('surplus');
    expect(c.b44).toBe(-100);                            // First → Not Needed: −125, klemt
    expect(cmAvailability(p)).toBe('unknown');           // ikke listet: "Unknown" som i originalen
    const interested = cmInterested(g, p, clubLevel);
    expect(interested.length).toBeGreaterThan(0);
    // budet kommer inden for få dage, på værdien
    let bid;
    for (let d = 0; d < 30 && !bid; d++) {
      aiBidsForListed();
      bid = g.offers.find((o) => o.player === p.id && o.status === 'pending');
      g.date = addDays(g.date, 1);
    }
    expect(bid).toBeTruthy();
    expect(bid!.fee).toBe(price);
    expect(interested).toContain(bid!.buyer);
    // udbudsprisen over formlen gælder ikke (0x8ce1e5: kun et menneske, og kun ned)
    const q = squad(mu).filter((x) => x !== p).sort((a, b) => b.ca - a.ca)[0];
    const v0 = q.value;
    act({ t: 'cmTransferStatus', pid: q.id, status: 0, price: Math.round(valueTarget(q) * 3), listed: false, loan: false, request: false });
    expect(q.value).toBe(v0);
  });

  it('klagen 0x200 giver "Feels he has been treated unfairly" (0x883004); transferlistet uden klager en reaktion (0x880a9b)', () => {
    const g = gs();
    const p = scholes();
    const c = cmContractOf(p);
    c.b45 = 0x200;
    p.joined = '1990-01-01';
    expect(cmFutureLines(g, p).map((x) => x.k)).toContain('unfair');
    c.b45 = 0; c.b4e = 0;
    act({ t: 'cmTransferStatus', pid: p.id, status: 2, price: null, listed: true, loan: false, request: false });
    expect(cmAvailability(p)).toBe('club');
    expect(p.listed).toBe(true);
    expect(p.squadStatus).toBe('surplus');               // 0x842320: status 7
    expect(c.b45).toBe(0);
    expect(cmFutureLines(g, p).map((x) => x.k).some((k) => /^list|noLeave|forceBack/.test(k))).toBe(true);
    // Yes i "Transfer list"-dialogen igen: af listen (0x8f8450)
    act({ t: 'listed', pid: p.id });
    expect(cmAvailability(p)).toBe('unknown');
  });

  it('Future: "Happy to stay" kun gennem originalens tilfredse blok (0x8844e1) – Key → Not Needed giver "Unknown"', () => {
    const p = scholes();
    const c = cmContractOf(p);
    c.b45 = 0; c.b4e = 0; c.b44 = 0; c.b4f = 0x10;
    expect(cmFutureHappy(p)).toBe(true);
    // Key → Not Needed: +0x44 −125 (klemt) < −Loyalty → blokken springes over
    c.b44 = statusHappiness(0, 1, 7, 0);
    expect(cmFutureHappy(p)).toBe(false);
    c.b44 = 0; c.b45 = 0x4000;
    expect(cmFutureHappy(p)).toBe(false);
    c.b45 = 0; c.b4e = 1;
    expect(cmFutureHappy(p)).toBe(false);
    c.b4e = 0;
  });

  it('Future, resten af 0x87dd80 (0x883bcf–0x8853ba): klagerne, den tilfredse blok, det aftalte skifte og "Unknown"', () => {
    const g = gs();
    const p = squad(mu).sort((a, b) => b.ca - a.ca)[10];
    const c = cmContractOf(p);
    const set = (k: string, v: number) => { p.attrs[(ATTRS as readonly string[]).indexOf(k)] = v; };
    const ks = (n = 0) => cmFutureLines(g, p, n).map((x) => x.k);
    set('loyalty', 10); set('professionalism', 12); set('pressure', 12); set('temperament', 12); set('ambition', 10);
    p.cmRel = undefined; p.renewal = undefined; p.cmRetire = undefined;
    p.dob = `${Number(g.date.slice(0, 4)) - 27}-01-01`;
    p.joined = '1995-07-01';
    if (p.contract) p.contract.futureClub = undefined;
    c.b45 = 0; c.b4e = 0; c.b44 = 0; c.b3d = 0; c.b3e = 0; c.b3f = 0; c.b4f = ((c.b4f ?? 0) & 0xf) | 0x20;
    // ingen klager og tilfreds (+0x44 ≥ −Loyalty): én tilfreds linje (0x884d48)
    expect(ks()).toEqual(['happyStay']);
    // ingen trupstatus (nibble 0): "Wants clarification on his future" (0x884406)
    c.b4f = (c.b4f ?? 0) & 0xf;
    expect(ks()).toEqual(['clarification']);
    c.b4f = ((c.b4f ?? 0) & 0xf) | 0x10;
    // klubben er hans yndlingsklub og Loyalty > 5: Key → "Is enjoying playing for the club" (0x884c66)
    p.cmRel = [p.club, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    expect(ks()).toEqual(['enjoyPlaying']);
    p.cmRel = undefined;
    // Key → Not Needed (−125 klemt): +0x44 < −Loyalty → blokken springes over → "Unknown" (0x884dbc)
    c.b44 = statusHappiness(0, 1, 7, 0);
    expect(ks()).toEqual(['unknown']);
    c.b44 = 0;
    // klagerne 0x20 (over 720 dage i klubben), 0x40, 0x200000, 0x8000 – og ingen tilfreds linje, når +0x45 ≠ 0
    c.b45 = 0x20 | 0x40 | 0x200000 | 0x8000;
    expect(ks()).toEqual(['timeToMove', 'personal', 'unhappyRemarks', 'unhappyTraining']);
    p.joined = addDays(g.date, -100);
    set('temperament', 4);
    c.b45 = 0x20;
    expect(ks()).toEqual(['mistakeMoving']);
    expect(cmFutureLines(g, p)[0].p?.nation).toBe('England');
    set('temperament', 12);
    // 0x100000: Pressure ≥ 6 → 0x88418a: +0x3f > 4 og under 27 år → "relies upon him too much", ellers "Jaded"
    c.b45 = 0x100000; c.b3f = 5;
    expect(ks()).toEqual(['jaded']);                     // 27 år
    p.dob = `${Number(g.date.slice(0, 4)) - 25}-01-01`;
    expect(ks()).toEqual(['reliesTooMuch']);
    c.b3f = 0;
    expect(ks()).toEqual(['jaded']);
    p.dob = `${Number(g.date.slice(0, 4)) - 27}-01-01`;
    // 0x80: må ikke skifte – Temperament < 6 og Professionalism < 15 → vred
    c.b45 = 0x80; set('temperament', 4);
    expect(ks()).toEqual(['angryMove']);
    set('temperament', 12); c.b45 = 0;
    // et aftalt skifte (0x8cca10 → 0x884e12): ingen tilfreds linje; Pressure ≥ 10 og intet andet → "Unknown"
    p.contract!.futureClub = squad(mu).length ? Number(Object.keys(g.clubs).find((id) => Number(id) !== mu)) : 0;
    expect(ks()).toEqual(['unknown']);
    set('pressure', 4); p.dob = `${Number(g.date.slice(0, 4)) - 20}-01-01`;
    expect(ks()).toEqual(['insecure']);
    p.contract!.futureClub = undefined; set('pressure', 12); p.dob = `${Number(g.date.slice(0, 4)) - 27}-01-01`;
    // interessen (Interested-listen ikke tom, > 150 dage i klubben): +0x45 & 0x101 → "Is hoping to impress the visiting scouts"
    c.b45 = 0x100; p.joined = '1995-07-01';
    expect(ks(2)[0]).toBe('impressScouts');
    expect(ks(0)).not.toContain('impressScouts');
    c.b45 = 0;
    // karrieren slutter (0x7a7eb0): kun den linje
    p.cmRetire = true;
    expect(ks()).toEqual(['noFuture']);                  // under 30 år
    p.dob = `${Number(g.date.slice(0, 4)) - 32}-01-01`;
    expect(ks()).toEqual(['retiring']);
    p.dob = `${Number(g.date.slice(0, 4)) - 27}-01-01`;
    p.cmRetire = undefined;
    // alle nøgler findes på engelsk og dansk
    const en = readFileSync('src/i18n/en.ts', 'utf8'), da = readFileSync('src/i18n/da.ts', 'utf8');
    for (const k of ['happyStay', 'clarification', 'enjoyPlaying', 'unknown', 'timeToMove', 'mistakeMoving', 'adjustLifestyle', 'personal', 'depression',
      'unhappyRemarks', 'unhappyTraining', 'reliesTooMuch', 'jaded', 'angryMove', 'insecure', 'impressScouts', 'retiring', 'biggerSoon', 'commitFuture',
      'conditionsNow', 'content', 'enthusiastic', 'loanExperience', 'extendContract', 'bosman', 'anxiousContract']) {
      expect(en).toContain(`"cm.fut.${k}"`);
      expect(da).toContain(`"cm.fut.${k}"`);
    }
  });

  it('transferanmodningen: "X requests move" med grundene; Respond → granted (listed by request) / turned down', () => {
    const g = gs();
    const p = squad(mu).sort((a, b) => b.ca - a.ca)[6];
    const c = cmContractOf(p);
    c.b45 = 0x10 | 0x200; c.b4e = 0; c.b44 = 0;
    cmRequestNews(g, p, c, cmRand(1, 2, 3));
    const n = g.news.find((x) => x.key === 'cm.req' && x.link?.id === p.id)!;
    expect(n).toBeTruthy();
    expect(n.params.flags).toBe(0x210);
    expect(n.params.player).toBe(p.last);
    // kun én ubesvaret ad gangen
    const cnt = g.news.filter((x) => x.key === 'cm.req').length;
    cmRequestNews(g, p, c, cmRand(1, 2, 4));
    expect(g.news.filter((x) => x.key === 'cm.req').length).toBe(cnt);
    expect(cmAnswerRequest(g, n.id, true)).toBe('ok');
    expect(n.params.ans).toBe(1);
    expect(cmAvailability(p)).toBe('request');
    expect(p.listed).toBe(true);
    expect(g.news.some((x) => x.key === 'transfer.requestGranted')).toBe(true);
    expect(cmAnswerRequest(g, n.id, false)).toBe('error');   // allerede besvaret
    // afslag: +0x44 += s8(5·Loyalty + 56)
    const p2 = squad(mu).sort((a, b) => b.ca - a.ca)[8];
    const c2 = cmContractOf(p2);
    c2.b45 = 0x10; c2.b44 = -20; c2.b4e = 0;
    cmRequestNews(g, p2, c2, cmRand(5));
    const n2 = g.news.find((x) => x.key === 'cm.req' && x.link?.id === p2.id)!;
    const loy = Math.round(p2.attrs[(ATTRS as readonly string[]).indexOf('loyalty')] || 10);
    act({ t: 'cmRequest', news: n2.id, grant: false });
    expect(n2.params.ans).toBe(2);
    const d = ((((5 * loy) << 24) >> 24) + 0x38) << 24 >> 24;
    expect(c2.b44).toBe(Math.max(-100, Math.min(100, -20 + d)));
    expect(cmAvailability(p2)).toBe('unknown');
  });
});
