// Probe (fællesskab #35): en stjernes lønkrav ved fornyelse og hos en køber – 2026 (world.json + world-cm.json) eller 2001.
//   npx tsx scripts/bruno-probe.ts [2026|2001] [efternavn] [klub] [køber] [dato]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { cmGbp } from '../src/game/cmMoney';
import { humanRenewDemand } from '../src/game/transfers';
import { cmTalkDemand } from '../src/game/cmContractGame';

const db = process.argv[2] ?? '2026';
const who = process.argv[3] ?? 'Fernandes';
const clubName = process.argv[4] ?? 'Man Utd';
const bidName = process.argv[5] ?? 'Arsenal';
const w = JSON.parse(readFileSync(db === '2001' ? 'public/data/world-original.json' : 'public/data/world.json', 'utf8')) as WorldData;
if (db !== '2001') Object.assign(w, JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')));
const nat = ['England'].map((n) => w.nations.findIndex((x) => x.name === n));
const cid = (n: string) => w.clubs.find((c) => c[1] === n || c[2] === n)![0] as number;
createGame(w, { managerName: 'Test Smoke', managerNation: nat[0], clubId: cid(clubName), activeNations: nat, lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
if (process.argv[6]) g.date = process.argv[6]; // kun probe: alder/datoer som på en senere dag
const home = cid(clubName), bid = cid(bidName);
for (const p of Object.values(g.players).filter((x) => x.last.includes(who) && x.club === home)) {
  const own = humanRenewDemand(p, g.clubs[home]);
  const t = cmTalkDemand(g, p, home, p.squadStatus);
  const tb = cmTalkDemand(g, p, bid);
  console.log(JSON.stringify({ id: p.id, name: `${p.first} ${p.last}`, ca: p.ca, pa: p.pa, rep: p.cmRep, value: p.value, contract: p.contract,
    gbpHome: cmGbp(g, home), gbpBid: cmGbp(g, bid), status: p.squadStatus, own, rawOwn: t?.raw, rawBid: tb?.raw, bidWage: tb?.wage }));
}
