// Bestyrelsens fyringer i vores spil (som oraklet: original DB størrelse 2, England aktivt, Arsenal, frø 1) dag for dag – manageren pr. klub og
// bestyrelsens tillid (w6) → JSON i samme form som scripts/board-sack-oracle.ts; med ORACLE=<json> også sammenligningen (afgange pr. måned,
// England/øvrige, skiftet job/ledig, menneskets tillid pr. måned).
//   WORLD=public/data/world-original-normal.json node scripts/measure.mjs -- npx tsx scripts/board-sack-ours.ts <ud.json> [til=2002-06-30]
//   npx tsx scripts/board-sack-ours.ts --compare <vores.json> <oraklet.json>
import { readFileSync, writeFileSync } from 'node:fs';

interface Club { name: string; nation: string; div: string }
interface Run { clubs: Club[]; days: { d: string; mgr: number[]; w6: number[] }[]; staff: Record<string, string> }

async function play(out: string, until: string): Promise<Run> {
  const { createGame } = await import('../src/game/newgame');
  const { continueGame, quickPlayUserMatch } = await import('../src/game/sim');
  const { gs } = await import('../src/game/state');
  const w = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original-normal.json', 'utf8'));
  const eng = w.nations.findIndex((x: { name: string }) => x.name === 'England');
  const user = w.clubs.find((c: unknown[]) => c[1] === (process.env.CLUB ?? 'Arsenal'))[0];
  createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: Number(process.env.SEED ?? 1), mode: 'authentic' });
  const g = gs();
  const cl = Object.values(g.clubs).filter((c) => !c.national);
  const clubs: Club[] = cl.map((c) => ({ name: c.name, nation: g.nations[c.nation]?.name ?? '', div: g.comps[c.league]?.name ?? '' }));
  const days: Run['days'] = [], staff: Record<string, string> = {};
  const snap = () => {
    const mgr = cl.map((c) => (c.id === g.userClub ? -2 : c.manager || -1));
    for (const id of mgr) if (id >= 0 && !staff[id]) { const s = g.staff[id]; staff[id] = s ? `${s.first} ${s.last}`.trim() : '?'; }
    days.push({ d: g.date, mgr, w6: cl.map((c) => g.cmBoard?.rec[c.id]?.w6 ?? 0) });
  };
  const t0 = Date.now();
  snap();
  let last = g.date;
  while (g.date < until) {
    const r = continueGame();
    if (r?.match !== undefined) quickPlayUserMatch();
    if (g.dayDone && !g.pendingFixture && g.date !== last) { last = g.date; snap(); if (g.date.endsWith('-01')) console.log(g.date, `${((Date.now() - t0) / 1000).toFixed(0)} s`); }
  }
  const run = { clubs, days, staff };
  writeFileSync(out, JSON.stringify(run));
  return run;
}

/** afgange: dag d, klub, gammel manager → (ny); 'job' = den gamle er manager andetsteds inden for 14 dage, ellers 'ledig' */
function departures(r: Run) {
  const res: { d: string; club: number; from: number; kind: 'job' | 'ledig' }[] = [];
  for (let i = 1; i < r.days.length; i++) {
    const a = r.days[i - 1].mgr, b = r.days[i].mgr;
    for (let c = 0; c < a.length; c++) {
      if (a[c] < 0 || a[c] === b[c]) continue;
      let job = false;
      for (let j = i; j < Math.min(r.days.length, i + 14) && !job; j++) job = r.days[j].mgr.some((x, k) => k !== c && x === a[c]);
      res.push({ d: r.days[i].d, club: c, from: a[c], kind: job ? 'job' : 'ledig' });
    }
  }
  return res;
}

function compare(ours: Run, orac: Run) {
  const groups: [string, (c: Club) => boolean][] = [
    ['England (ligaklubber)', (c) => c.nation === 'England' && /Premier|First Division|Second Division|Third Division/.test(c.div)],
    ['England alle', (c) => c.nation === 'England'],
    ['øvrige lande', (c) => c.nation !== 'England'],
    ['alle', () => true],
  ];
  const months = [...new Set([...orac.days, ...ours.days].map((x) => x.d.slice(0, 7)))].sort();
  const D = { ours: departures(ours), orac: departures(orac) };
  for (const [gn, f] of groups) {
    console.log(`\n== ${gn}: afgange pr. måned (vores / oraklet; i parentes: heraf til et andet job)`);
    const row = (r: Run, dep: typeof D.ours, m: string) => { const xs = dep.filter((x) => x.d.startsWith(m) && f(r.clubs[x.club])); return `${xs.length} (${xs.filter((x) => x.kind === 'job').length})`; };
    let to = 0, tt = 0;
    for (const m of months) { console.log(`  ${m}: ${row(ours, D.ours, m).padEnd(8)} / ${row(orac, D.orac, m)}`); }
    to = D.ours.filter((x) => f(ours.clubs[x.club])).length; tt = D.orac.filter((x) => f(orac.clubs[x.club])).length;
    console.log(`  i alt: ${to} / ${tt};  klubber: ${ours.clubs.filter(f).length} / ${orac.clubs.filter(f).length}`);
  }
  // England: hvilke klubber
  const eng = (r: Run, dep: typeof D.ours) => dep.filter((x) => r.clubs[x.club].nation === 'England').map((x) => `${x.d} ${r.clubs[x.club].name} (${r.staff[x.from] ?? x.from}, ${x.kind})`);
  console.log('\n== England, vores:\n  ' + eng(ours, D.ours).join('\n  '));
  console.log('\n== England, oraklet:\n  ' + eng(orac, D.orac).join('\n  '));
  // menneskets tillid
  const ui = ours.days[0].mgr.indexOf(-2), name = ours.clubs[ui]?.name, oi = orac.clubs.findIndex((c) => c.name === name);
  console.log(`\n== ${name}: bestyrelsens tillid w6 den 1. i måneden (vores / oraklet)`);
  for (const m of months) {
    const a = ours.days.find((x) => x.d.startsWith(m)), b = orac.days.find((x) => x.d.startsWith(m));
    console.log(`  ${m}: ${a?.w6[ui] ?? '-'} / ${b?.w6[oi] ?? '-'}`);
  }
  // tillid gennemsnit England-ligaklubber
  console.log('\n== England ligaklubber: gns. w6 den 1. i måneden (vores / oraklet)');
  const ef = groups[0][1];
  for (const m of months) {
    const a = ours.days.find((x) => x.d.startsWith(m)), b = orac.days.find((x) => x.d.startsWith(m));
    const mean = (r: Run, x: Run['days'][number] | undefined) => { if (!x) return '-'; const v = r.clubs.map((c, i) => (ef(c) && x.mgr[i] !== -2 ? x.w6[i] : NaN)).filter((y) => !Number.isNaN(y)); return (v.reduce((s, y) => s + y, 0) / v.length).toFixed(0); };
    console.log(`  ${m}: ${mean(ours, a)} / ${mean(orac, b)}`);
  }
}

if (process.argv[2] === '--compare') {
  compare(JSON.parse(readFileSync(process.argv[3], 'utf8')), JSON.parse(readFileSync(process.argv[4], 'utf8')));
} else {
  const r = await play(process.argv[2], process.argv[3] ?? '2002-06-30');
  if (process.env.ORACLE) compare(r, JSON.parse(readFileSync(process.env.ORACLE, 'utf8')));
}
