// Databasernes hentning uden afhængigheder af siden (window/localStorage/IndexedDB) – bruges både af hovedtråden (world.ts) og af nyt spils
// Web Worker (newGameWorker.ts), som (hukommelse, iPhone 21/11) selv henter og parser databasen, så hovedtråden aldrig holder den hele.
import type { WorldData } from '../game/newgame';
import type { CMWorld } from '../game/data/cm0102';

export type CommunityEdit = { kind: string; target: string; field: string; value: string };

// De originale CM 01/02-databaser: 3.9.60 (udgivelsen – den, originalen selv bruger til 2001/02) og 3.9.65 (rettelser,
// stadig 01/02-trupperne) med fællesskabets svenske rettelse ("Swedish_fixed"), samt 3.9.68 (02/03-trupperne med
// 01/02-startdatoen). Den svenske rettelse ændrer kun skjulte svenske klubber – spillere, trupper og økonomi er de samme.
export const ORIGINAL_VERSIONS = ['3.9.60', '3.9.65', '3.9.68'] as const;
export type OriginalVersion = (typeof ORIGINAL_VERSIONS)[number];
/** `size` = originalens databasestørrelse (ui/dbSize.ts): Normal findes kun for 3.9.60 (world-original-normal.json, CM_DBSIZE=2) */
export const originalFile = (v: OriginalVersion, size: 'normal' | 'maximum' = 'maximum') => (v === '3.9.60' ? (size === 'normal' ? 'world-original-normal.json' : 'world-original.json') : `world-original-${v.replace(/\./g, '')}.json`);

const base = () => import.meta.env.BASE_URL;

export async function fetchOriginalWorld(v: OriginalVersion, size: 'normal' | 'maximum' = 'maximum'): Promise<WorldData> {
  const file = originalFile(v, size);
  const r = await fetch(`${base()}data/${file}`);
  if (!r.ok) throw new Error(`${file}: ${r.status}`);
  return r.json() as Promise<WorldData>;
}

export async function fetchModernWorld(): Promise<WorldData> {
  // world-cm.json (byggescriptet): originalens rå værdier (CMWorld.cmRaw) til originalens logik i ægte tilstand (cmLogic – fx gittermotoren);
  // mangler den (fx uden net og uden cache), bygges spillet uden dem som før
  const side = fetch(`${base()}data/world-cm.json`).then((r) => (r.ok ? r.json() as Promise<{ cmRaw?: CMWorld['cmRaw'] }> : null)).catch(() => null);
  // world-cm-staff.json (MODERN_PARITY 13): Staff Search's øvrige ikke-spillere (CMWorld.staffX/clubNames – originalens hukommelse 0x524d70);
  // ikke i offline-cachen – mangler den, får et nyt spil kun spillets egen stab i søgningen
  const staffSide = fetch(`${base()}data/world-cm-staff.json`).then((r) => (r.ok ? r.json() as Promise<Pick<CMWorld, 'staffX' | 'clubNames'>> : null)).catch(() => null);
  const r = await fetch(`${base()}data/world.json`);
  if (!r.ok) throw new Error(`world.json: ${r.status}`);
  const w = await r.json() as WorldData & Partial<CMWorld>;
  const x = await side;
  if (x?.cmRaw && w.kind === 'cm0102' && !w.cmRaw) w.cmRaw = x.cmRaw;
  const xs = await staffSide;
  if (xs?.staffX && w.kind === 'cm0102' && !w.staffX) { w.staffX = xs.staffX; w.clubNames = xs.clubNames ?? {}; }
  return w as WorldData;
}

/**
 * Fællesskabets godkendte rettelser ("Community Update", se api/hub.ts) oven på databasen: navne og egenskaber på spillere, navne og farver
 * på klubber. En kopi: den delte database (bl.a. draft-ligaens spillerpulje) skal være ens hos alle klienter. (Hukommelse, 21/11) kun de
 * rettede rækker kopieres – før var det hele databasen (structuredClone).
 */
export function applyCommunityEdits(baseW: WorldData, edits: CommunityEdit[] | null | undefined): WorldData {
  if (!edits?.length) return baseW;
  const src = baseW as WorldData & Partial<CMWorld>;
  const cm = { ...src, players: src.players.slice(), clubs: src.clubs.slice(), ...(src.ratings ? { ratings: { ...src.ratings } } : {}),
    ...(src.clubColors ? { clubColors: { ...src.clubColors } } : {}) } as WorldData & Partial<CMWorld>;
  const w = cm as WorldData;
  const F = Object.fromEntries((cm.playerFields ?? []).map((f, i) => [f, i]));
  const pRows = w.players as unknown as unknown[][], cRows = w.clubs as unknown as unknown[][];
  const players = new Map(pRows.map((p, i) => [Number(p[0]), i]));
  const clubs = new Map(cRows.map((c, i) => [Number(c[0]), i]));
  const copied = new Set<unknown[]>(), copiedR = new Set<number>();
  const own = (rows: unknown[][], i: number) => { if (!copied.has(rows[i])) { rows[i] = rows[i].slice(); copied.add(rows[i]); } return rows[i]; };
  for (const e of edits) {
    const id = Number(e.target);
    if (e.kind === 'player') {
      const pi = players.get(id);
      if (pi === undefined) continue;
      const p = own(pRows, pi);
      if (e.field === 'first' && F.first !== undefined) p[F.first] = e.value;
      if (e.field === 'last' && F.last !== undefined) p[F.last] = e.value;
      if (e.field === 'attr' && cm.ratings?.[id]) {
        const [i, v] = e.value.split(':').map(Number);
        if (cm.ratings[id].attrs[i] !== undefined) {
          if (!copiedR.has(id)) { cm.ratings[id] = structuredClone(cm.ratings[id]); copiedR.add(id); }
          cm.ratings[id].attrs[i] = v;
        }
      }
    } else {
      const ci = clubs.get(id);
      if (ci === undefined) continue;
      const c = own(cRows, ci);
      if (e.field === 'name') c[1] = e.value;
      if (e.field === 'short') c[2] = e.value;
      if (e.field === 'color' && cm.clubColors) { const [a, b] = e.value.split(','); cm.clubColors[id] = [a, b ?? cm.clubColors[id]?.[1] ?? '#ffffff']; }
    }
  }
  return w;
}

/** Det, startforløbets lister bruger (lande, ligaer, klubber og spillernes nationaliteter) – hovedtråden behøver ikke hele databasen */
export function slimWorld(w: WorldData): WorldData {
  const nk = w.playerFields.indexOf('nation');
  const o: Record<string, unknown> = {};
  for (const k of ['kind', 'source', 'season', 'nations', 'leagues', 'clubs'] as const) if (k in w) o[k] = (w as unknown as Record<string, unknown>)[k];
  o.playerFields = ['nation'];
  o.players = [...new Set(w.players.map((p) => p[nk] as number))].map((n) => [n]);
  o.names = {};
  return o as unknown as WorldData;
}
