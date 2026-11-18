// 2026/27 i ægte tilstand (MODERN_PARITY 9+10): kendskab/spejdere og karantæner/appel/bøder over en periode – antal karantæner (alle klubber og
// menneskets), appeller og deres svar, Discipline Player (bøder/advarsler) og nyhederne, spejderrapporterne og kendskabsniveauerne.
// Menneskets faste politik (begge tilstande): Scout Player på de 10 mest værdifulde spillere i Championship og én spejder på Spanien ved
// spilstarten; appel af hver karantæne, der kan appelleres; 1 uges bøde med grunden "dismissal" til hver af hans egne spillere med rødt kort.
// npx tsx scripts/cm-scout-disc-2026.ts [til-dato = 2027-01-01] [klub = Brentford] [frø = 1]   (OLD=1: spillets egne systemer som før – markørerne
// g.cmScoutStart/g.cmDiscStart fjernes efter spilstarten, og kendskabet startes igen af scouting.ts)
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { act } from '../src/game/actions';
import { initKnowledge, knowledgeOf, startScoutAssignment } from '../src/game/scouting';
import { cmAppeal, cmAppealOpen } from '../src/game/cmDiscipline';
import { cmDiscLogic, cmScoutLogic } from '../src/game/cmPlayerData';

const until = process.argv[2] ?? '2027-01-01';
const w = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData & { cmRaw?: unknown };
Object.assign(w, JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')));
const eng = w.nations.findIndex((x) => x.name === 'England');
const name = process.argv[3] ?? 'Brentford';
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === name || c[2] === name)![0], activeNations: [eng], lang: 'en', masking: true,
  seed: Number(process.argv[4] ?? 1), mode: 'authentic' });
const g = gs();
if (process.env.OLD === '1') { delete g.cmScoutStart; delete g.cmDiscStart; initKnowledge(); }
const me = g.userClub;
console.log(`start ${g.date} · cmScoutLogic ${cmScoutLogic(g)} · cmDiscLogic ${cmDiscLogic(g)} · ${OLDTAG()}`);
function OLDTAG() { return process.env.OLD === '1' ? 'FØR (spillets egne systemer)' : 'EFTER (originalens moduler)'; }

function knowLine(label: string) {
  const ps = Object.values(g.players).filter((p) => !p.virtual && p.club !== me);
  const b = [0, 0, 0, 0];
  let sum = 0;
  for (const p of ps) { const k = knowledgeOf(p); sum += k; b[k >= 100 ? 3 : k >= 66 ? 2 : k >= 33 ? 1 : 0]++; }
  const eng2 = ps.filter((p) => p.club && g.clubs[p.club]?.nation === eng);
  const engAvg = eng2.reduce((a, p) => a + knowledgeOf(p), 0) / Math.max(1, eng2.length);
  console.log(`${label} kendskab (${ps.length} spillere uden for klubben): snit ${(sum / ps.length).toFixed(1)} % · niveau 0/1/2/3 = ${b.join(' / ')} · engelske klubber snit ${engAvg.toFixed(1)} %`);
}
knowLine('start');

// spejderne: Scout Player på Championships 10 dyreste og én spejder på Spanien
const scouts = Object.values(g.staff).filter((s) => s.club === me && s.role === 'scout').sort((a, b) => a.id - b.id);
const champ = Object.values(g.players).filter((p) => p.club && p.club !== me && g.clubs[p.club]?.nation === eng && g.leagues[g.clubs[p.club].league]?.tier === 2)
  .sort((a, b) => b.value - a.value || a.id - b.id).slice(0, 10);
const spain = g.nations.findIndex((n) => n.name === 'Spain');
console.log(`spejdere: ${scouts.length} (${scouts.map((s) => `${s.first} ${s.last}`).join(', ')})`);
if (scouts.length) {
  for (const p of champ) startScoutAssignment(scouts[0].id, { kind: 'player', target: p.id, since: g.date, found: [] });
  if (scouts[1] && spain >= 0) startScoutAssignment(scouts[1].id, { kind: 'nation', target: spain, since: g.date, found: [] });
}

const banStart = new Map(Object.values(g.players).map((p) => [p.id, p.banLog?.length ?? 0]));
let appeals = 0, fines = 0, days = 0;
const seen = new Set<number>();
const finedFor = new Set<string>();
while (g.date < until && days++ < 400) {
  const r = continueGame();
  if (r.match !== undefined) quickPlayUserMatch();
  for (const n of g.news) {
    if (seen.has(n.id)) continue;
    seen.add(n.id);
    if (cmAppealOpen(g, n) && cmAppeal(g, n.id)) appeals++;
  }
  // rødt kort i menneskets seneste kamp → 1 uges bøde (dismissal in prior match)
  for (const p of Object.values(g.players)) {
    if (p.club !== me || p.lastRed !== g.date) continue;
    const k = `${p.id}|${g.date}`;
    if (finedFor.has(k)) continue;
    finedFor.add(k);
    act({ t: 'interact', pid: p.id, kind: 'fine', reason: 'dismissal' });
    fines++;
  }
}
console.log(`slut ${g.date} (${days} dage)`);
knowLine('slut');
let bans = 0, mine = 0, games = 0, reds = 0;
for (const p of Object.values(g.players)) {
  const l = p.banLog ?? [];
  const n0 = banStart.get(p.id) ?? 0;
  for (const x of l.slice(n0)) { bans++; games += x.n; if (x.red) reds++; if (p.club === me) mine++; }
}
console.log(`karantæner (alle klubber): ${bans} (${reds} for rødt kort/misconduct, ${games} kampe i alt) · menneskets klub ${mine}`);
const cnt = (re: RegExp) => g.news.filter((n) => re.test(n.key)).length;
const byKey = (re: RegExp) => { const m: Record<string, number> = {}; for (const n of g.news) if (re.test(n.key)) m[n.key] = (m[n.key] ?? 0) + 1; return JSON.stringify(m); };
console.log(`karantænenyheder: ${byKey(/^(cmban\.h|ban\.)/)}`);
console.log(`appeller: ${appeals} · svar ${byKey(/^cmban\.fa\./)}`);
console.log(`bøder (Discipline Player): ${fines} · nyheder ${byKey(/^cmfine\.|^talk\.|^interact\./)} · poster ${g.cmFine?.recs.length ?? 0}`);
console.log(`spejdernyheder: ${cnt(/./) && g.news.filter((n) => n.cat === 'scout').length} · ${byKey(/^(cmsr|scout|cmsa|news\.scout)/)}`);
console.log(`anmodninger tilbage: ${g.cmScoutReq?.length ?? 0} · opgaver ${Object.keys(g.cmScoutAsg ?? {}).length} · fund (gammelt system) ${Object.keys(g.scoutFinds ?? {}).length}`);
