// En world-fil som spillet selv indlæser den (src/ui/worldFetch.ts fetchModernWorld): 2026/27's world.json har originalens rå værdier
// (CMWorld.cmRaw – omdømmerne, turneringernes club_comp.dat +0x69, tilskuerne, økonomien, kalenderen …) i sidefilen world-cm.json og Staff
// Search's øvrige ikke-spillere i world-cm-staff.json. Uden fletningen spillede måle-scriptene 2026/27 uden hele cmRaw (fx g.cmCompRep tom →
// alle turneringer +0x69 = 0) – et andet spil end browserens. De originale databaser (world-original*.json) har cmRaw i filen og røres ikke.
// NO_CM=1: uden sidefilerne (som før – fx for at sammenligne med en gammel måling).
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { WorldData } from '../../src/game/newgame';

export function readWorld<T = WorldData>(file: string): T {
  const w = JSON.parse(readFileSync(file, 'utf8')) as WorldData & { kind?: string; cmRaw?: unknown; staffX?: unknown; clubNames?: unknown };
  // kun en CM-database uden egne rå værdier (2026/27's world.json) – som fetchModernWorld
  if (w.kind !== 'cm0102' || w.cmRaw || w.season < 2020 || process.env.NO_CM === '1') return w as unknown as T;
  const dir = dirname(file);
  const side = join(dir, 'world-cm.json'), staff = join(dir, 'world-cm-staff.json');
  if (existsSync(side)) {
    const x = JSON.parse(readFileSync(side, 'utf8')) as { cmRaw?: unknown };
    if (x.cmRaw) w.cmRaw = x.cmRaw;
  }
  if (!w.staffX && existsSync(staff)) {
    const xs = JSON.parse(readFileSync(staff, 'utf8')) as { staffX?: unknown; clubNames?: unknown };
    if (xs.staffX) { w.staffX = xs.staffX; w.clubNames = xs.clubNames ?? {}; }
  }
  return w as unknown as T;
}
