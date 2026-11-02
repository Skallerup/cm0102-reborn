import { gs, hasGame } from '../game/state';
// Klublogoer hentes ved kørsel fra luukhopman/football-logos via jsDelivr (ikke bundlet i projektet)
let base = '';
let map: Record<string, string> = {};
let loaded: Promise<void> | null = null;

export function loadLogos(): Promise<void> {
  if (!loaded) {
    loaded = fetch(`${import.meta.env.BASE_URL}data/logos.json`)
      .then((r) => (r.ok ? r.json() : { base: '', logos: {} }))
      .then((d: { base: string; logos: Record<string, string> }) => { base = d.base; map = d.logos; })
      .catch(() => { /* uden logoer */ });
  }
  return loaded;
}

const url = (p: string) => base + p.split('/').map(encodeURIComponent).join('/');

export function logoUrl(clubId: number): string | null {
  // CM 01/02-klubber har ikke Transfermarkt-id'er – match logoet på klubbens navn i stedet
  if (hasGame() && gs().dbKind === 'cm0102') return cmLogo(clubId);
  const p = map[clubId];
  return p ? url(p) : null;
}

// ---------- CM 01/02: match klubnavn til et logo ----------

// normalisér et klubnavn til et sammenligneligt nøgleord (fjern accenter, tegn og gængse fodboldord)
const STOP = new Set(['fc', 'cf', 'ac', 'sc', 'cp', 'sv', 'vfl', 'vfb', 'bsc', 'fk', 'if', 'bk', 'sk', 'rc', 'cd', 'ud', 'ssc', 'as', 'ssd', 'club', 'clube', 'futebol', 'calcio', 'football', 'sporting', 'de', 'do', 'da', 'the']);
function norm(s: string): string {
  // NFD dekomponerer ikke de nordiske bogstaver (ø, æ, å) eller ß – map dem, så fx dansk "Brøndby"
  // matcher logo-repoets "Bröndby" (ö → o)
  return s.toLowerCase().replace(/ø/g, 'o').replace(/æ/g, 'ae').replace(/å/g, 'a').replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[.'’\-/]/g, ' ')
    .split(/\s+/).filter((w) => w && !STOP.has(w) && !/^(18|19|20)\d\d$/.test(w)).join(' ').trim();
}

let cmIndex: Map<string, string> | null = null;
function cmLogo(clubId: number): string | null {
  if (!Object.keys(map).length) return null; // logolisten er ikke hentet endnu
  if (!cmIndex) {
    cmIndex = new Map();
    for (const p of Object.values(map)) {
      const name = p.split('/').pop()?.replace(/\.png$/i, '') ?? '';
      const k = norm(name);
      if (k && !cmIndex.has(k)) cmIndex.set(k, p);
    }
  }
  const c = gs().clubs[clubId];
  if (!c) return null;
  const p = cmIndex.get(norm(c.name)) ?? cmIndex.get(norm(c.short));
  return p ? url(p) : null;
}
