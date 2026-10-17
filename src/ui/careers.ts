// Spillernes virkelige karriere før spilstart (public/data/careers.json) – hentes først når en
// spillerprofil åbnes og caches i hukommelsen.
export interface RealSeason { season: number; club: number; clubName?: string; apps: number; goals: number; assists: number; minutes: number }

interface CareersFile { first: number; clubs: Record<string, string>; players: Record<string, number[]> }

let file: Promise<CareersFile | null> | null = null;

function load(): Promise<CareersFile | null> {
  if (!file) {
    file = fetch(`${import.meta.env.BASE_URL}data/careers.json`)
      .then((r) => (r.ok ? (r.json() as Promise<CareersFile>) : null))
      .catch(() => { file = null; return null; });
  }
  return file;
}

export async function realCareer(pid: number): Promise<RealSeason[]> {
  const f = await load();
  const flat = f?.players[String(pid)];
  if (!f || !flat) return [];
  const out: RealSeason[] = [];
  for (let i = 0; i + 5 < flat.length; i += 6) {
    const club = flat[i + 1];
    out.push({ season: f.first + flat[i], club, clubName: f.clubs[String(club)], apps: flat[i + 2], goals: flat[i + 3], assists: flat[i + 4], minutes: flat[i + 5] });
  }
  return out;
}
