// Populære spillere (kultlisten + de bedste wonderkids) og hvilke af de tre officielle udgaver (3.9.60/3.9.65/3.9.68) de findes i.
// Kør: npx tsx scripts/build-popular-versions.ts  → public/data/popular-versions.json (hentes først, når boksen i nyt spil åbnes)
import { readFileSync, writeFileSync } from 'node:fs';

type Row = (string | number | null)[];
interface World { season: number; playerFields: string[]; players: Row[]; clubs: Row[]; ratings: Record<string, { ca: number; pa: number; paRaw?: number }> }
const load = (f: string) => JSON.parse(readFileSync(f, 'utf8')) as World;
const VERS = ['3.9.60', '3.9.65', '3.9.68'];
const worlds = [load('public/data/world-original.json'), load('public/data/world-original-3965.json'), load('public/data/world-original-3968.json')];
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z ]+/g, ' ').replace(/\s+/g, ' ').trim();

type Ent = { name: string; club: string; ca: number; pa: number; age: number };
const index = worlds.map((w) => {
  const F = Object.fromEntries(w.playerFields.map((f, i) => [f, i]));
  const club = new Map(w.clubs.map((c) => [c[0] as number, c[1] as string]));
  const m = new Map<string, Ent>();
  for (const r of w.players) {
    const name = [String(r[F.first] ?? '').trim(), String(r[F.last] ?? '').trim()].filter(Boolean).join(' ');
    const rt = w.ratings[String(r[F.id])];
    const e: Ent = { name, club: club.get(r[F.club] as number) ?? 'Free agent', ca: rt?.ca ?? 0, pa: (rt?.paRaw ?? 0) < 0 ? -1 : rt?.pa ?? 0, age: 2001 - Number(String(r[F.dob]).slice(0, 4)) };
    const k = norm(name);
    const o = m.get(k);
    if (!o || e.ca > o.ca) m.set(k, e);
  }
  return m;
});

const names: string[] = [];
const add = (n: string) => { if (!names.some((x) => norm(x) === norm(n))) names.push(n); };
for (const c of JSON.parse(readFileSync('scripts/cult-players.json', 'utf8')) as { first: string; last: string }[]) add([c.first, c.last].filter(Boolean).join(' '));
// wonderkids: højeste PA blandt dem på højst 19 år i en af udgaverne
const kids = new Map<string, Ent>();
for (const m of index) for (const [k, e] of m) if (e.age <= 19 && e.pa >= 170 && e.ca >= 60 && !kids.has(k)) kids.set(k, e);
[...kids.values()].sort((a, b) => b.pa - a.pa || b.ca - a.ca).slice(0, 25).forEach((e) => add(e.name));

const out: [string, ([string, number, number] | null)[]][] = [];
for (const n of names) {
  const k = norm(n);
  let hits = index.map((m) => m.get(k) ?? null);
  // kælenavne/stavemåder: fald tilbage til et unikt efternavn med samme forbogstav
  if (!hits.some(Boolean)) {
    const last = k.split(' ').pop()!;
    hits = index.map((m) => { const c = [...m].filter(([kk]) => kk.split(' ').pop() === last && kk[0] === k[0]); return c.length === 1 ? c[0][1] : null; });
  }
  if (!hits.some(Boolean)) continue;
  out.push([hits.find(Boolean)!.name, hits.map((e) => (e ? [e.club, e.ca, e.pa] as [string, number, number] : null))]);
}
writeFileSync('public/data/popular-versions.json', JSON.stringify({ v: VERS, p: out }));
console.log(`${out.length} spillere af ${names.length} kandidater`);
