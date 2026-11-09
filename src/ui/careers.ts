import { gs, hasGame } from '../game/state';
import { cmDatabase } from '../game/newgame';
// Spillernes virkelige karriere før spilstart (public/data/careers.json) – hentes først når en
// spillerprofil åbnes og caches i hukommelsen.
export interface RealSeason { season: number; club: number; clubName?: string; apps: number; goals: number; assists: number; minutes: number; loan?: boolean }

interface CareersFile { first: number; fields?: string[]; clubs: Record<string, string>; players: Record<string, number[]>; moves?: Record<string, number[]> }

/** Klubskifte før spilstart (fee = -1: ukendt beløb) */
export interface RealMove { season: number; from: number; to: number; fromName?: string; toName?: string; fee: number }

const files = new Map<string, Promise<CareersFile | null>>();

/** Karrierefilen til spillets database: transfermarkt (moderne), CM 2026/27 eller den originale 01/02 */
function careerFile(): string {
  if (!hasGame() || gs().dbKind !== 'cm0102') return 'careers.json';
  const v = gs().dbVersion;
  return cmDatabase(gs()) === 'original' ? (v && v !== '3.9.60' ? `careers-original-${v.replace(/\./g, '')}.json` : 'careers-original.json') : 'careers-cm.json';
}

function load(name = careerFile()): Promise<CareersFile | null> {
  let f = files.get(name);
  if (!f) {
    f = fetch(`${import.meta.env.BASE_URL}data/${name}`)
      .then((r) => (r.ok ? (r.json() as Promise<CareersFile>) : null))
      .catch(() => { files.delete(name); return null; });
    files.set(name, f);
  }
  return f;
}

export async function realCareer(pid: number): Promise<RealSeason[]> {
  const f = await load();
  const flat = f?.players[String(pid)];
  if (!f || !flat) return [];
  // CM-filerne har et leje-flag i stedet for minutter (CM 01/02's staff_history.dat)
  const loanField = f.fields?.[5] === 'loan';
  const out: RealSeason[] = [];
  for (let i = 0; i + 5 < flat.length; i += 6) {
    const club = flat[i + 1];
    out.push({ season: f.first + flat[i], club, clubName: f.clubs[String(club)], apps: flat[i + 2], goals: flat[i + 3], assists: flat[i + 4],
      minutes: loanField ? 0 : flat[i + 5], ...(loanField && flat[i + 5] ? { loan: true } : {}) });
  }
  return out;
}

export async function realMoves(pid: number): Promise<RealMove[]> {
  if (hasGame() && gs().dbKind === 'cm0102') return [];
  const f = await load();
  const flat = f?.moves?.[String(pid)];
  if (!f || !flat) return [];
  const out: RealMove[] = [];
  for (let i = 0; i + 3 < flat.length; i += 4) {
    const fee = flat[i + 3];
    out.push({ season: f.first + flat[i], from: flat[i + 1], to: flat[i + 2], fromName: f.clubs[String(flat[i + 1])], toName: f.clubs[String(flat[i + 2])], fee: fee < 0 ? -1 : fee * 1000 });
  }
  return out;
}
