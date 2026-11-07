import { gs, hasGame } from '../game/state';
// Klublogoer hentes ved kørsel fra luukhopman/football-logos via jsDelivr (ikke bundlet i projektet)
let base = '';
let map: Record<string, string> = {};
// klubnavn → fuld url (TheSportsDB) for klubber, logopakken ikke har (fx Blackburn og de engelske 1. divisionsklubber)
let named: Record<string, string> = {};
// landsholdenes logoer (nationsnavn → url, scripts/build-nation-badges.py)
let nations: Record<string, string> = {};
// turneringernes logoer (rigtigt navn eller CL/UEFA/UECL/wc/euro → url, scripts/build-comp-badges.py)
let comps: Record<string, string> = {};
let loaded: Promise<void> | null = null;

export function loadLogos(): Promise<void> {
  if (!loaded) {
    loaded = fetch(`${import.meta.env.BASE_URL}data/logos.json`)
      .then((r) => (r.ok ? r.json() : { base: '', logos: {} }))
      .then(setLogoData)
      .catch(() => { /* uden logoer */ });
  }
  return loaded;
}

type LogoData = { base: string; logos: Record<string, string>; named?: Record<string, string>; nations?: Record<string, string>; comps?: Record<string, string> };
/** Sæt logolisten direkte (scripts/seo/db.ts læser logos.json fra disken) */
export function setLogoData(d: LogoData) { base = d.base; map = d.logos; named = d.named ?? {}; nations = d.nations ?? {}; comps = d.comps ?? {}; cmIndex = null; }

const url = (p: string) => (p.startsWith('https://') ? p : base + p.split('/').map(encodeURIComponent).join('/'));

/** Turneringens logo: de europæiske på id, ellers på det rigtige navn (comps.ts realCompName) */
export const compLogoUrl = (id: string | undefined, realName: string | undefined): string | null => (id && comps[id]) || (realName && comps[realName]) || null;

/** Landsholdets logo (databasens engelske nationsnavn) */
export const nationLogoUrl = (name: string | undefined): string | null => (name && nations[name]) || null;

export function logoUrl(clubId: number): string | null {
  // CM 01/02-klubber har ikke Transfermarkt-id'er – match logoet på klubbens navn i stedet
  if (hasGame() && gs().dbKind === 'cm0102') return cmLogo(clubId);
  const p = map[clubId];
  return p ? url(p) : null;
}

// ---------- CM 01/02: match klubnavn til et logo ----------

// normalisér et klubnavn til et sammenligneligt nøgleord (fjern accenter, tegn og gængse fodboldord)
const STOP = new Set(['fc', 'cf', 'ac', 'sc', 'cp', 'sv', 'vfl', 'vfb', 'bsc', 'fk', 'if', 'bk', 'sk', 'rc', 'cd', 'ud', 'ssc', 'as', 'ssd', 'club', 'clube', 'futebol', 'calcio', 'football', 'sporting', 'de', 'do', 'da', 'the']);
// Logo-repoet bruger nogle steder engelske/andre stavemåder af byer end CM-databaserne – map dem sammen
const ALIAS: Record<string, string> = {
  kobenhavn: 'copenhagen', munchen: 'munich', wien: 'vienna', praha: 'prague',
  milano: 'milan', genova: 'genoa', moskva: 'moscow', beograd: 'belgrade', bucuresti: 'bucharest',
};
function norm(s: string): string {
  // NFD dekomponerer ikke de nordiske bogstaver (ø, æ, å) eller ß – map dem, så fx dansk "Brøndby"
  // matcher logo-repoets "Bröndby" (ö → o). ALIAS retter forskelle som København ↔ Copenhagen.
  return s.toLowerCase().replace(/ø/g, 'o').replace(/æ/g, 'ae').replace(/å/g, 'a').replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[.'’\-/]/g, ' ')
    .split(/\s+/).map((w) => ALIAS[w] ?? w).filter((w) => w && !STOP.has(w) && !/^(18|19|20)\d\d$/.test(w)).join(' ').trim();
}

let cmIndex: Map<string, string> | null = null;
let cmKeys: { key: string; path: string }[] = [];
function cmLogo(clubId: number): string | null {
  if (!Object.keys(map).length) return null; // logolisten er ikke hentet endnu
  if (!cmIndex) {
    cmIndex = new Map();
    cmKeys = [];
    for (const p of Object.values(map)) {
      const name = p.split('/').pop()?.replace(/\.png$/i, '') ?? '';
      const k = norm(name);
      if (!k) continue;
      if (!cmIndex.has(k)) cmIndex.set(k, p);
      cmKeys.push({ key: k, path: p });
    }
    // navngivne logoer går forud for pakkens (de er lagt ind netop fordi pakken mangler eller matcher klubben forkert)
    for (const [n, u] of Object.entries(named)) { const k = norm(n); if (k) { cmIndex.set(k, u); cmKeys.push({ key: k, path: u }); } }
  }
  const c = gs().clubs[clubId];
  if (!c) return null;
  const nName = norm(c.name), nShort = norm(c.short);
  // 1) præcist match på navn eller kort navn
  const exact = cmIndex.get(nName) ?? cmIndex.get(nShort);
  if (exact) return url(exact);
  // 2) logo-navnet ender på klubbens korte navn og er entydigt (fx "espanyol" → "rcd espanyol",
  //    "benfica" → "sl benfica", "mainz" → "1 fsv mainz"). Suffiks undgår falske match som inter → inter miami.
  for (const q of [nShort, nName]) {
    if (q.length < 4) continue;
    const hits = cmKeys.filter((e) => e.key === q || e.key.endsWith(' ' + q));
    if (hits.length === 1) return url(hits[0].path);
  }
  return null;
}
