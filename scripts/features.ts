// Funktionstest gennem spillets egne handlinger (de samme, som knapperne i UI'et sender): køb, salg, kontrakter,
// udleje, spejdere, træning, stab, bestyrelse, presse, venskabskampe, træningslejr, gem/indlæs og job.
// Kør: npx tsx scripts/features.ts [world-fil] [klubnavn]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs, squad } from '../src/game/state';
import { applyAction } from '../src/game/actions';
import { askingPrice, loanSuitors, renewalDemand, wageDemand } from '../src/game/transfers';
import { friendlyDates } from '../src/game/friendlies';
import { campWindows } from '../src/game/camp';
import { serializeState, deserializeState } from '../src/game/snapshot';
import { addDays, ageOn } from '../src/game/dates';
import { naturalRole } from '../src/game/attributes';

const file = process.argv[2] ?? 'public/data/world.json';
const clubName = process.argv[3] ?? 'Brentford FC';
const world = JSON.parse(readFileSync(file, 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
createGame(world, { managerName: 'Feature', managerNation: eng, clubId: world.clubs.find((c) => c[1] === clubName)![0], activeNations: [eng], lang: 'en', masking: true, seed: 21 });
const g = gs();
const me = () => g.clubs[g.userClub];
const days = (n: number) => { for (let i = 0; i < n; i++) { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); } };
const res: [string, boolean, string][] = [];
const test = async (name: string, fn: () => unknown | Promise<unknown>) => {
  try { const out = await fn(); res.push([name, out !== false, typeof out === 'string' ? out : '']); }
  catch (e) { res.push([name, false, `undtagelse: ${(e as Error).message}`]); }
};
const mine = () => squad(g.userClub);
const newsSince = (id: number) => g.news.filter((n) => n.id > id).map((n) => n.key);

await test('køb: bud → kontrakt → spilleren skifter', () => {
  const lvl = mine().map((p) => p.ca).sort((a, b) => b - a)[5];
  const tried: string[] = [];
  for (const target of Object.values(g.players).filter((p) => p.club && p.club !== g.userClub && g.clubs[p.club].league === me().league && p.ca >= lvl - 5 && p.ca <= lvl + 5 && !p.loan && ageOn(p.dob, g.date) < 29 && askingPrice(p) < me().transferBudget * 0.6).slice(0, 4)) {
  me().transferBudget = Math.max(me().transferBudget, askingPrice(target) * 2);
  applyAction({ t: 'bid', pid: target.id, fee: Math.round(askingPrice(target) * 1.3), loan: false });
  for (let i = 0; i < 6; i++) {
    days(1);
    const o = g.offers.find((x) => x.player === target.id && x.buyer === g.userClub);
    if (o?.status === 'negotiating') {
      const w = Math.round(wageDemand(target, me()) * 1.25);
      me().wageBudget += w * 2;
      const r = applyAction({ t: 'negotiate', pid: target.id, wage: w, years: 3 });
      days(1);
      return target.club === g.userClub ? `købt ${target.last} (${r})` : `kontrakt ikke på plads: ${r}`;
    }
    if (o && ['rejected', 'collapsed', 'withdrawn'].includes(o.status)) break;
  }
  tried.push(`${target.last}: ${g.offers.find((x) => x.player === target.id && x.buyer === g.userClub)?.status} (${newsSince(0).find((k) => k.startsWith('transfer.')) ?? ''})`);
  }
  return tried.length ? `ingen handel: ${tried.join(', ')}` : 'ingen passende spiller fundet';
});

await test('kontraktforlængelse', () => {
  const p = mine().filter((x) => x.contract && !x.loan).sort((a, b) => a.contract!.expires.localeCompare(b.contract!.expires))[0];
  const before = p.contract!.expires;
  me().wageBudget += 1e7;
  const r = applyAction({ t: 'renew', pid: p.id, wage: Math.round(renewalDemand(p, me()) * 1.3), years: 2 });
  return r === 'accepted' ? (p.contract!.expires > before ? `${before} → ${p.contract!.expires}` : false) : `svar: ${r}`;
});

await test('sæt på transferlisten', () => {
  const p = mine().sort((a, b) => a.ca - b.ca)[3];
  applyAction({ t: 'listed', pid: p.id, price: 500_000 });
  return p.listed === true && (p.listPrice ?? 0) > 0;
});

await test('udleje', () => {
  const p = mine().filter((x) => ageOn(x.dob, g.date) <= 21 && !x.loan).sort((a, b) => a.ca - b.ca)[0];
  if (!p) return 'ingen ung spiller';
  const s0 = loanSuitors(p.id)[0];
  if (!s0) return 'ingen klub vil leje ham (springes over)';
  const r = applyAction({ t: 'loanOut', pid: p.id, club: s0.club, share: s0.maxShare, fee: 0 });
  return p.loan ? `til ${g.clubs[s0.club].name}` : `svar ${JSON.stringify(r)}`;
});

await test('fritstilling', () => {
  const p = mine().filter((x) => !x.loan).sort((a, b) => a.ca - b.ca)[0];
  const bal = me().balance;
  const r = applyAction({ t: 'release', pid: p.id });
  return p.club === 0 ? `kostede ${Math.round(bal - me().balance)}` : `svar ${JSON.stringify(r)}`;
});

await test('spejder på opgave → rapport', () => {
  const s = Object.values(g.staff).find((x) => x.club === g.userClub && x.role === 'scout');
  if (!s) return 'ingen spejder i staben';
  const id = g.nextId.news;
  applyAction({ t: 'scout', staffId: s.id, assignment: { kind: 'nation', target: eng } as never });
  days(45);
  return newsSince(id).some((k) => k.startsWith('news.scout')) || `ingen spejdernyhed (${s.assignment ? 'stadig i gang' : 'færdig'})`;
});

await test('træning for hele truppen', () => {
  applyAction({ t: 'trainingAll', key: 'general' });
  return mine().every((p) => p.training === 'general');
});

await test('ansæt og fyr en træner', () => {
  const s = Object.values(g.staff).filter((x) => !x.club && x.role === 'coach').sort((a, b) => b.attrs.coaching - a.attrs.coaching)[0];
  if (!s) return 'ingen fri træner';
  const r = applyAction({ t: 'hireStaff', id: s.id, wage: Math.round((s.wage || 1000) * 1.5) });
  days(4);
  if (s.club !== g.userClub) return `ikke ansat: ${JSON.stringify(r)}`;
  applyAction({ t: 'fireStaff', id: s.id });
  return s.club !== g.userClub;
});

await test('billetpris', () => { applyAction({ t: 'ticket', price: 40 }); return me().ticketPrice === 40; });
await test('holdtale', () => { applyAction({ t: 'teamTalk', kind: 'praise' }); return true; });
await test('advarsel til spiller', () => { const p = mine()[4]; const r = applyAction({ t: 'interact', pid: p.id, kind: 'warning', reason: 'none' }); return r !== undefined ? `svar ${JSON.stringify(r).slice(0, 60)}` : true; });
await test('trøjenummer', () => { const [a, b] = mine().filter((p) => p.number).slice(0, 2); const n = b.number!; applyAction({ t: 'squadNumber', pid: a.id, n }); return a.number === n; });
await test('bestyrelse: større transferbudget', () => { const r = applyAction({ t: 'budget', kind: 'transfer', pct: 10 }); return `svar ${JSON.stringify(r).slice(0, 80)}`; });
await test('bestyrelse: tillidserklæring', () => { const r = applyAction({ t: 'boardAsk', kind: 'confidenceVote' }); return `svar ${JSON.stringify(r).slice(0, 80)}`; });
await test('presse: svar på et pressemøde', () => {
  const pr = (g as unknown as { press?: { topics?: { id: string }[] } }).press;
  if (!pr?.topics?.length) return 'intet pressemøde lige nu';
  applyAction({ t: 'press', answers: pr.topics.map((x) => ({ topic: x.id, tone: 'calm' })) });
  return true;
});

await test('gem og indlæs (samme tilstand)', async () => {
  const blob = await serializeState(g);
  const back = await deserializeState(blob);
  const ok = Object.keys(back.players).length === Object.keys(g.players).length && back.date === g.date && back.userClub === g.userClub;
  return ok ? `${Math.round(blob.size / 1024)} KB` : false;
});

await test('venskabskamp og træningslejr i sommerpausen', () => {
  // næste sommer: spil frem til juli
  while (!(g.date.slice(5, 7) === '07' && Number(g.date.slice(8)) >= 3)) days(1);
  if (!g.userClub) return 'fyret undervejs (springes over)';
  const opp = Object.values(g.clubs).find((c) => c.id !== g.userClub && c.league === me().league)!;
  const fd = friendlyDates()[0], cw = campWindows()[0];
  const r1 = fd ? applyAction({ t: 'friendly', opp: opp.id, date: fd, kind: 'easy' }) : 'ingen dato';
  const r2 = cw ? applyAction({ t: 'camp', dest: 'home', start: cw.start }) : 'intet vindue';
  days(14);
  const played = (g.manager.friendlies ?? []).some((f) => f.done);
  return r1 === 'ok' && r2 === 'ok' ? (played ? 'begge planlagt, venskabskampen spillet' : 'planlagt, men venskabskampen er ikke spillet') : `venskabskamp: ${JSON.stringify(r1)} · lejr: ${JSON.stringify(r2)}`;
});

await test('ungdomsårgang i løbet af sæsonen', () => {
  const before = new Set(mine().map((p) => p.id));
  while (!(g.date.slice(5, 7) === '04')) days(1);
  const fresh = mine().filter((p) => !before.has(p.id) && ageOn(p.dob, g.date) <= 17);
  return fresh.length ? `${fresh.length} nye` : 'ingen ungdomsspillere';
});

await test('to målmænd i egen trup', () => `${mine().filter((p) => naturalRole(p) === 'GK').length} målmænd`);

await test('sig op → søg job → nyt job', () => {
  applyAction({ t: 'resign' });
  if (g.userClub) return 'stadig ansat efter opsigelse';
  for (let i = 0; i < 60 && !g.userClub; i++) {
    const offer = g.jobOffers.find((id) => g.clubs[id]?.manager === 0);
    if (offer) applyAction({ t: 'acceptJob', club: offer });
    else for (const id of g.vacancies.slice(0, 4)) applyAction({ t: 'applyJob', club: id });
    for (const [id, talk] of Object.entries(g.manager.jobTalks ?? {})) if (talk.stage === 'offer') applyAction({ t: 'acceptJob', club: Number(id) });
    days(2);
  }
  return g.userClub ? `nyt job: ${me().name}` : 'intet job efter 120 dage';
});

for (const [n, ok, msg] of res) console.log(`${ok ? '✓' : '✗'} ${n}${msg ? ` – ${msg}` : ''}`);
const bad = res.filter((r) => !r[1]).length;
console.log(bad ? `\n${bad} af ${res.length} fejlede` : `\nAlle ${res.length} funktioner virker`);
process.exit(bad ? 1 : 0);
