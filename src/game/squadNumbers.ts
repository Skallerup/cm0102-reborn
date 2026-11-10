// Squad Numbers-beskeden som i CM 01/02 (målt i originalen 9/11-2026, 3.9.68, Man Utd): lørdag 4/8 om aftenen kommer
// "Man Utd squad numbers to be decided" – "Man Utd have been requested to submit their squad numbers list for the
// forthcoming season." med Respond. Continue Game er grå, indtil listen er sendt (Submit → "Submit the current set of squad
// numbers for the forthcoming season ?" → beskeden får linjen "The list has been submitted.").
// Hos os bliver listen sendt automatisk, hvis klubben skal spille en kamp, før manageren har svaret (moderne udseende og
// ferie – det klassiske udseende holder Continue Game tilbage som originalen).
import { addNews, gs, squad } from './state';
import { asOwner, forEachHuman } from './humans';

export const SQN_DAY = '08-04';

/** Venter klubben på at sende sin trøjenummerliste? */
export const squadNumbersDue = (cid: number) => !!cid && gs().clubs[cid]?.sqnDue === gs().season;

/** Dagligt: beskeden den 4/8 – og den automatiske indsendelse, hvis klubben skal spille først */
export function squadNumbersDaily() {
  const g = gs();
  forEachHuman(() => {
    const c = g.clubs[g.userClub];
    if (!c) return;
    if (g.date.slice(5) === SQN_DAY && c.sqnDue !== g.season && !c.sqnDone?.includes(g.season)) {
      c.sqnDue = g.season;
      addNews({ cat: 'general', key: 'sqn.request', params: { club: c.short } });
    }
    if (c.sqnDue === g.season && (g.manager.holiday || Object.values(g.fixtures).some((f) => f.date === g.date && (f.home === c.id || f.away === c.id)))) submitSquadNumbers(c.id);
  });
}

/** Submit: numrene fra listen (spiller-id → nummer, 0 = intet) sættes, og beskeden får "The list has been submitted." */
export function submitSquadNumbers(cid: number, nums?: Record<number, number>): 'ok' | 'error' {
  const g = gs();
  const c = g.clubs[cid];
  if (!c) return 'error';
  if (nums) {
    const sq = squad(cid);
    const ids = new Set(sq.map((p) => p.id));
    const used = new Set<number>();
    for (const [pid, n] of Object.entries(nums)) {
      if (!ids.has(Number(pid)) || !Number.isInteger(n) || n < 0 || n > 99) return 'error';
      if (n && used.has(n)) return 'error';
      if (n) used.add(n);
    }
    // spillere, listen ikke nævner, beholder deres nummer, hvis det stadig er ledigt
    for (const p of sq) {
      if (Number(p.id) in nums) p.number = nums[p.id] || undefined;
      else if (p.number && used.has(p.number)) p.number = undefined;
      else if (p.number) used.add(p.number);
    }
  }
  if (c.sqnDue !== undefined) {
    (c.sqnDone ??= []).push(c.sqnDue);
    c.sqnDone = c.sqnDone.slice(-3);
    c.sqnDue = undefined;
    asOwner(cid, () => { for (const n of g.news) if (n.key === 'sqn.request' && !n.params.done) n.params = { ...n.params, done: 1 }; });
  }
  return 'ok';
}
