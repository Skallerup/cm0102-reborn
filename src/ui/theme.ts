// Farvetema: mørkt (standard), lyst eller i klubbens farver. Klubfarverne aflæses fra klubbens
// logo (de to mest dominerende farver), så Brøndby bliver gul/blå, FCK hvid/blå osv.
// Valget er personligt og gemmes i browseren – ikke i spillet.
import { logoUrl } from './logos';
import { gs, hasGame } from '../game/state';

export type Theme = 'club' | 'clubDark' | 'light' | 'dark';
const KEY = 'cm-theme';
const VARS = ['--accent', '--accent-ink', '--accent2', '--tint1', '--tint2'];

export function getTheme(): Theme {
  // standard: klubbens farver på lys baggrund
  try { const v = localStorage.getItem(KEY); return v === 'dark' || v === 'light' || v === 'clubDark' ? v : 'club'; } catch { return 'club'; }
}

export function setTheme(t: Theme) {
  try { localStorage.setItem(KEY, t); } catch { /* privat vindue */ }
  applyTheme();
}

type RGB = [number, number, number];
const cache = new Map<number, Promise<RGB[] | null>>();

function hsl([r, g, b]: RGB): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}

function rgbFromHsl(h: number, s: number, l: number): RGB {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

/** De (op til) to mest dominerende farver i klubbens logo */
function logoColors(clubId: number): Promise<RGB[] | null> {
  const hit = cache.get(clubId);
  if (hit) return hit;
  const url = logoUrl(clubId);
  const p = !url ? Promise.resolve(null) : new Promise<RGB[] | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = c.height = 48;
        const ctx = c.getContext('2d', { willReadFrequently: true })!;
        ctx.drawImage(img, 0, 0, 48, 48);
        const d = ctx.getImageData(0, 0, 48, 48).data;
        const buckets = new Map<number, { n: number; sum: RGB }>();
        let whites = 0;
        for (let i = 0; i < d.length; i += 4) {
          if (d[i + 3] < 200) continue;
          const rgb: RGB = [d[i], d[i + 1], d[i + 2]];
          const [, s, l] = hsl(rgb);
          if (l > 0.9) { whites++; continue; }
          if (l < 0.1 || s < 0.22) continue; // sort, grå
          const k = (rgb[0] >> 5) * 64 + (rgb[1] >> 5) * 8 + (rgb[2] >> 5);
          const b = buckets.get(k) ?? { n: 0, sum: [0, 0, 0] };
          b.n++; b.sum[0] += rgb[0]; b.sum[1] += rgb[1]; b.sum[2] += rgb[2];
          buckets.set(k, b);
        }
        const cols = [...buckets.values()].sort((a, b) => b.n - a.n).map((b) => b.sum.map((v) => Math.round(v / b.n)) as RGB);
        const out: RGB[] = [];
        for (const col of cols) {
          if (out.length >= 2) break;
          // anden farve skal have en tydeligt anden tone
          if (out.length === 1) { const dh = Math.abs(hsl(out[0])[0] - hsl(col)[0]); if (Math.min(dh, 360 - dh) < 35) continue; }
          out.push(col);
        }
        if (out.length === 1 && whites > 40) out.push([240, 244, 255]);
        resolve(out.length ? out : null);
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
  cache.set(clubId, p);
  return p;
}

/** Gør en farve læsbar på mørk baggrund (lys nok, ikke for grå) */
function forDark(c: RGB, minL = 0.58): RGB {
  const [h, s, l] = hsl(c);
  return rgbFromHsl(h, Math.max(s, 0.55), Math.max(l, minL));
}

/** Gør en farve læsbar på hvid baggrund – behold klubbens nuance, gør kun for lyse farver mørkere */
function forLight(c: RGB, maxL = 0.45): RGB {
  const [h, s, l] = hsl(c);
  return l <= maxL ? c : rgbFromHsl(h, s, maxL);
}

/** Er farven så lys/grå, at den ikke duer som accent (fx hvid)? */
const washed = (c: RGB) => { const [, s, l] = hsl(c); return l > 0.85 || s < 0.15; };

const css = (c: RGB) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
const lum = ([r, g, b]: RGB) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

let applied = 0;
export function applyTheme() {
  const root = document.documentElement;
  const theme = getTheme();
  const token = ++applied;
  // forsiden og startmenuen er designet mørke – temaet gælder inde i spillet
  const dark = theme === 'dark' || theme === 'clubDark' || !hasGame();
  root.dataset.theme = dark ? 'dark' : 'light';
  for (const v of VARS) root.style.removeProperty(v);
  if ((theme !== 'club' && theme !== 'clubDark') || !hasGame()) return;
  const club = gs().clubs[gs().userClub];
  if (!club) return;
  void logoColors(club.id).then((cols) => {
    if (token !== applied) return;
    const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    const [a0, b0] = cols ?? club.colors.map(hex);
    // en hvid/grå farve i logoet duer ikke som accent – brug klubbens hovedfarve
    const [a, b] = washed(a0) && b0 && !washed(b0) ? [b0, a0] : [a0, b0];
    const second = b && !washed(b) ? b : undefined;
    const accent = dark ? forDark(a) : forLight(a);
    // links: anden klubfarve – eller en mørkere udgave af hovedfarven (fx Vejle: rød og hvid)
    const accent2 = dark ? forDark(second ?? a, 0.66) : forLight(second ?? a, second ? 0.42 : 0.34);
    root.style.setProperty('--accent', css(accent));
    root.style.setProperty('--accent-ink', lum(accent) > 0.55 ? '#141008' : '#ffffff');
    root.style.setProperty('--accent2', css(accent2));
    const ta = dark ? 0.22 : 0.10, tb = dark ? 0.14 : 0.06;
    root.style.setProperty('--tint1', `rgba(${a[0]}, ${a[1]}, ${a[2]}, ${ta})`);
    root.style.setProperty('--tint2', `rgba(${(second ?? a)[0]}, ${(second ?? a)[1]}, ${(second ?? a)[2]}, ${tb})`);
  });
}
