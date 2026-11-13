// Meet with Board og ultimatummet som i originalen (0x6ae180, 0x782c6f, 0x6ad610, 0x6aca50, 0x6adb70) – cmBoardUltimatum.ts
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { boardRequestAvailable, decideUltimatum, issueUltimatum, ultimatumOffered, type UltimatumIn } from '../src/game/cmBoardUltimatum';
import { newRec, isoToCm } from '../src/game/cmBoard';
import { ultimatumBody, ultimatumConfirm, ultimatumTitle } from '../src/game/cmBoardText';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { act } from '../src/game/actions';
import { meetBoardAvailable } from '../src/game/board';

const seq = (...xs: number[]) => { let i = 0; return (n: number) => { const v = xs[i++] ?? 0; return n > 0 ? v % n : 0; }; };
const base = (o: Partial<UltimatumIn> = {}): UltimatumIn => ({
  req: 1, today: isoToCm('2001-07-14'), gameStart: isoToCm('2001-07-14'), mrep: 3900, joined: isoToCm('2001-07-14'), cmRep: 3900,
  clubRep: 9000, status: 1, facilities: 20, nat85: 20, cap: 68000, mood: 3,
  chair: { patience: 10, amb: 15, business: 12 }, fin: { balance: 30000000, band: 2, transferBudget: 10000000, wageCap: 50000 }, ...o,
});

describe('Meet with Board (0x4253f0/0x6ae180)', () => {
  it('kun ungdommen er grå – når træningsanlægget er 20', () => {
    expect([1, 2, 3, 4, 5].map((r) => boardRequestAvailable(r, 20))).toEqual([true, false, true, true, true]);
    expect([1, 2, 3, 4, 5].map((r) => boardRequestAvailable(r, 19))).toEqual([true, true, true, true, true]);
  });
  it('knappen Ultimatum (0x782c6f): ikke tid, ikke svar 0/6, kun én gang', () => {
    expect(ultimatumOffered(1, 4, false)).toBe(true);
    expect(ultimatumOffered(1, 0xc, false)).toBe(true);
    expect(ultimatumOffered(5, 4, false)).toBe(false);
    expect(ultimatumOffered(1, 0, false)).toBe(false);
    expect(ultimatumOffered(1, 6, false)).toBe(false);
    expect(ultimatumOffered(1, 4, true)).toBe(false);
  });
});

describe('ultimatummet (0x6ad610/0x6aca50)', () => {
  it('første ultimatum (R.d41 = vagtdatoen): ny manager → "inexperienced" (4), −500 i tillid; R.d41 = i dag', () => {
    const R = { ...newRec(), w6: 7000 };
    const o = issueUltimatum(base(), R, seq(5000));
    expect(o.res).toBe(4);
    expect(R.w6).toBe(6500);
    expect(R.d41).toEqual(isoToCm('2001-07-14'));
    // omdømmet 3900 ≤ rand(6750)+2000 = 7000 → ingen tilhængernyhed
    expect(o.fans).toBe(0);
  });
  it('første ultimatum efter et halvt år med omdømme ≥ 5250: tilgivet "this once" (3), −1250', () => {
    const R = { ...newRec(), w6: 7000 };
    const x = base({ mrep: 6000, today: isoToCm('2002-02-01') });
    expect(decideUltimatum(x, R, seq(), {})).toBe(3);
  });
  it('et nyt ultimatum inden for 90 dage: stadionreglen (fyret ved lav tillid)', () => {
    const R = { ...newRec(), w6: 3000, d41: isoToCm('2001-07-01') };
    expect(decideUltimatum(base({ joined: isoToCm('2000-07-01'), mrep: 4500 }), R, seq(), {})).toBe(2);
    // høj tillid, for lille stadion til omdømmet, god stemning → ja
    const R2 = { ...newRec(), w6: 8000, d41: isoToCm('2001-07-01') };
    expect(decideUltimatum(base({ joined: isoToCm('2000-07-01'), mrep: 6000, cap: 30000 }), R2, seq(), {})).toBe(1);
  });
  it('fyret: årsag og R.b2 |= 2', () => {
    const R = { ...newRec(), w6: 3000, d41: isoToCm('2001-07-01') };
    const o = issueUltimatum(base({ joined: isoToCm("2000-07-01"), mrep: 4500 }), R, seq(6000));
    expect(o.res).toBe(2);
    expect(o.reason).toBe(0xf);
    expect(R.b2 & 2).toBe(2);
  });
});

describe('teksterne (0x906610, 0x6adb70)', () => {
  it('som skærmbillederne 328/329', () => {
    expect(ultimatumConfirm('Man Utd', 1)).toBe("Are you sure that you wish to issue an ultimatum to the Man Utd board ?\n\nThis would be a short statement indicating that either they agree to expand the club's stadium or you will resign from your job.");
    expect(ultimatumTitle(1, 1, 4, 'Man Utd')).toBe('Man Utd fans respond to speculation');
    expect(ultimatumTitle(3, 1, 4, 'Man Utd')).toBe('Board refuse to expand the stadium');
    expect(ultimatumBody(3, 1, 4, 'Manchester United', 'M S', 'Old Trafford', false, false)).toBe('In a private meeting with you the Manchester United board indicated that such demands are inappropriate from such an inexperienced manager.\n\nThey are willing to excuse this outburst but recommend that you do not repeat it again.');
    expect(ultimatumBody(1, 1, 1, 'Manchester United', 'M S', 'Old Trafford', false, false)).toContain('think that Old Trafford is already a worthy home');
    expect(ultimatumBody(1, 2, 2, 'X', 'Smith', '', false, false)).toContain("understand Smith's frustrations");
  });
});

describe('i spillet (3.9.60, ægte tilstand): anmodning → nyhed med Ultimatum → ultimatum', () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((n) => n.name === 'England');
  const mu = world.clubs.find((c) => c[1] === 'Manchester United')![0];
  it('Man Utd: ungdommen grå (anlæg 20), stadionanmodningen giver nyheden 0x1786, og et afslag kan følges af ultimatummet', () => {
    createGame(world, { managerName: 'M S', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
    const g = gs();
    g.clubs[mu].facilities = 20;
    expect(meetBoardAvailable('youth')).toBe(false);
    expect(meetBoardAvailable('stadium')).toBe(true);
    expect(meetBoardAvailable('transfer')).toBe(true);
    act({ t: 'meetBoard', kind: 'stadium' });
    const n = g.news.find((x) => x.params.title === 'Board reaction to request to expand stadium')!;
    expect(n).toBeTruthy();
    expect(n.params.rq).toBe(1);
    if (n.params.rc === 0 || n.params.rc === 6) return;              // bevilget – ingen knap
    const before = g.news.length;
    expect(act({ t: 'ultimatum', news: n.id })).toBe('ok');
    expect(n.params.ult).toBe(1);
    const titles = g.news.slice(0, g.news.length - before).map((x) => x.params.title);
    expect(titles[0]).toMatch(/^Board (refuse|agree) to expand the stadium$/);
    expect(act({ t: 'ultimatum', news: n.id })).toBe('blocked');       // kun én gang
  }, 600000);
});
