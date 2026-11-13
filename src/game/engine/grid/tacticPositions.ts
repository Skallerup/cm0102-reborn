// CM 01/02's taktikfaner "With Ball" og "Without Ball": taktikkens grove positionsgitter (taktikfilens blok +0x164, notes/5b3560-slot-grid.md
// og notes/5b7160-tactic-table.md). Hver plads har 2 (uden/med bold) × 3 × 4 boldzoner med et punkt (x 0..26, y 0..35) på 27×36-banen.
// Taktikskærmen 0x89f710 viser i tilstand 0/2 (+0x2727; 2 = med bold) punkterne for den valgte boldzone (+0x2729, den gule stiplede firkant);
// en spiller, der slippes, snappes til nærmeste af de 27×36 punkter og skrives med 0x5b3560 (kun den ene zone), som også genudleder
// pladsens masker. Overview (tilstand 1) lægger en plads på en af de 31 masker med 0x5b2ba0 = det kanoniske gitter for masken.
// Motoren (gridMatch → mapTactic) udvider gitteret med 0x5b7160 som ved indlæsning af en taktikfil.
import type { Slot, Tactic, TacticPositions } from '../../types';
import { GRID_X, GRID_Y, shapeName, snapSlot } from '../../tactics';
import { PRESET_TACTICS } from './presetTactics';
import { CANON_MASKS, canon, canonGrid, positionsValid, presetFor, presetGrid, slotMask } from './tacticTable';

const V = [0x1, 0x2, 0x4, 0x8, 0x10, 0x20, 0x40];          // GK SW D DM M AM F
const H = [0x80, 0x100, 0x200, 0x400, 0x800];              // L LC C RC R
/** 0x5b73a0: laveste rækkebit og første kolonnebit (GK → C) */
const vOf = (m: number) => V.find((b) => m & b) ?? 0;
const hOf = (m: number) => (m & 0x80 ? 0x80 : m & 0x100 ? 0x100 : m & 0x200 || m & 1 ? 0x200 : m & 0x400 ? 0x400 : m & 0x800 ? 0x800 : 0);

/** postens indeks i en plads' 24 punkter */
export const postIdx = (att: 0 | 1, zx: number, zy: number) => 12 * att + 4 * zx + zy;
export const packXY = (x: number, y: number) => (x & 0xff) | ((y & 0xff) << 8);
export const unpackXY = (v: number): [number, number] => [v & 0xff, (v >> 8) & 0xff];

function readGrid(g: Uint8Array, slot: number): number[] {
  const v = new DataView(g.buffer, g.byteOffset, g.byteLength), out: number[] = [];
  for (let k = 0; k < 24; k++) {
    const att = k >= 12 ? 1 : 0, zx = Math.floor((k % 12) / 4), zy = k % 4, idx = ((2 * slot + att) * 3 + zx) * 4 + zy;
    out.push(packXY(v.getInt16(4 * idx, true), v.getInt16(4 * idx + 2, true)));
  }
  return out;
}

/** Positionerne, motoren bruger for en formation uden egne positioner: forudindstillingens gitter (filen), når masken er præcis dens,
 *  ellers det kanoniske gitter (0x5b2ba0) – samme valg som mapTactic. */
export function defaultPositions(slots: Slot[], formation?: string): TacticPositions {
  const masks = slots.slice(0, 11).map(slotMask);
  const hit = presetFor(masks, formation);
  if (hit) {
    const pr = PRESET_TACTICS[hit.index], g = presetGrid(pr);
    return { posts: hit.slotOf.map((j) => readGrid(g, j)), masks, masks2: hit.slotOf.map((j) => pr.masks2[j]), preset: hit.index, presetSlot: hit.slotOf.slice() };
  }
  const g = canonGrid(masks);
  return { posts: masks.map((_, i) => readGrid(g, i)), masks, masks2: masks.slice() };
}

/** Taktikkens positioner med/uden bold: de gemte, hvis de stadig passer til pladserne, ellers formationens */
export function tacticPositions(t: Tactic): TacticPositions {
  return t.positions && positionsValid(t.slots, t.positions) ? t.positions : defaultPositions(t.slots, t.formation);
}

/** 0x5b2ba0 (setSlotMask(slot, 0, mask)): pladsen får masken, og dens 24 punkter bliver maskens kanoniske (0x5b7e60) */
export function resetSlot(p: TacticPositions, slot: number, mask: number): TacticPositions {
  const posts = p.posts.map((r) => r.slice()), masks = p.masks.slice(), masks2 = p.masks2.slice();
  masks[slot] = mask; masks2[slot] = mask;
  for (const att of [0, 1] as const) for (let zx = 0; zx < 3; zx++) for (let zy = 0; zy < 4; zy++) {
    const [x, y] = canon(mask, att, zx, zy);
    posts[slot][postIdx(att, zx, zy)] = packXY(x, y);
  }
  return { ...p, posts, masks, masks2 };
}

/**
 * 0x5b3560 setPost(slot, att, zone, xy): skriv én post og genudled pladsens masker. For begge tilstande findes de kanoniske masker
 * (0x9cc368), hvis 12 punkter ligger tættest på pladsens (celleafstand på 9×12, SW-rækken ×2); den nuværende maske foretrækkes ved lighed.
 * *estimeret*: en markspiller kan ikke blive målmand (maske 0x1 springes over), og målmandens maske røres ikke.
 */
export function setPost(p: TacticPositions, slot: number, att: 0 | 1, zx: number, zy: number, x: number, y: number): TacticPositions {
  x = Math.max(0, Math.min(26, Math.round(x))); y = Math.max(0, Math.min(35, Math.round(y)));
  const posts = p.posts.map((r) => r.slice()), masks = p.masks.slice(), masks2 = p.masks2.slice();
  posts[slot][postIdx(att, zx, zy)] = packXY(x, y);
  const cur = masks[slot];
  if (cur === 0x1) return { ...p, posts, masks, masks2 };
  const best = [0x7fffffff, 0x7fffffff], cands: number[][] = [[], []];
  for (const a of [0, 1] as const) {
    for (const m of CANON_MASKS) {
      if (m === 0x1) continue;
      let d = 0;
      for (let ix = 0; ix < 3; ix++) for (let iy = 0; iy < 4; iy++) {
        const [gx, gy] = unpackXY(posts[slot][postIdx(a, ix, iy)]), [cx, cy] = canon(m, a, ix, iy);
        d += Math.abs(Math.trunc((gy * 12) / 36) - Math.trunc((cy * 12) / 36)) + Math.abs(Math.trunc((gx * 9) / 27) - Math.trunc((cx * 9) / 27));
      }
      if (m & 0x2) d *= 2;
      if (d < best[a]) { best[a] = d; cands[a] = [m]; } else if (d === best[a] && cands[a].length < 11) cands[a].push(m);
    }
  }
  let ca = best[0] > best[1] ? 1 : 0, ci = 0;
  for (const a of [0, 1]) { const k = cands[a].indexOf(cur); if (k >= 0) { ca = a; ci = k; } }
  const nw = cands[ca][ci];
  masks[slot] = nw;
  const other = cands[1 - ca];
  if (other.includes(nw)) masks2[slot] = nw;
  else if (other.some((m) => hOf(m) === hOf(nw))) masks2[slot] = other.find((m) => hOf(m) === hOf(nw))!;
  else if (other.length === 2) {
    const hi = Math.trunc((H.indexOf(hOf(other[0])) + H.indexOf(hOf(other[1]))) / 2), vi = Math.trunc((V.indexOf(vOf(other[0])) + V.indexOf(vOf(other[1]))) / 2);
    masks2[slot] = H[hi] | V[vi];
  } else masks2[slot] = other[0];
  return { ...p, posts, masks, masks2 };
}

/** Spillets faste plads for en maske (Overview følger masken, som i originalen) */
export function maskToSlot(mask: number): Slot {
  const r = V.indexOf(vOf(mask)) - 1, c = H.indexOf(hOf(mask));
  return snapSlot(GRID_X[Math.max(0, r)], GRID_Y[Math.max(0, c)]);
}

/** Positionsnavnet på taktikskærmen (GK, DR, DC, MC, FC …). *estimeret*: SW på siderne vises som DL/DR, AM/DM med side (AMR, DMC). */
export function maskName(mask: number): string {
  if (mask & 0x1) return 'GK';
  const v = vOf(mask), h = hOf(mask), sd = h === 0x80 ? 'L' : h === 0x800 ? 'R' : 'C';
  if (v === 0x2) return sd === 'C' ? 'SW' : `D${sd}`;
  return `${v === 0x4 ? 'D' : v === 0x8 ? 'DM' : v === 0x10 ? 'M' : v === 0x20 ? 'AM' : 'F'}${sd}`;
}

/** Edit → Reflect: venstre ↔ højre (x → 26 − x, boldzonerne spejlet, maskernes kolonner byttet) */
export function mirrorPositions(p: TacticPositions): TacticPositions {
  const col = (m: number) => { const h = hOf(m); if (m & 0x1) return m; return (m & ~0xf80) | H[4 - H.indexOf(h)]; };
  const posts = p.posts.map((r) => {
    const o = r.slice();
    for (const att of [0, 1] as const) for (let zx = 0; zx < 3; zx++) for (let zy = 0; zy < 4; zy++) {
      const [x, y] = unpackXY(r[postIdx(att, zx, zy)]);
      o[postIdx(att, 2 - zx, zy)] = packXY(26 - x, y);
    }
    return o;
  });
  return { ...p, posts, masks: p.masks.map(col), masks2: p.masks2.map(col) };
}

/** Flyt en spillers position med (att 1) eller uden bold (att 0), når bolden er i zonen (zx, zy) – og lad Overview følge masken */
export function movePost(t: Tactic, slot: number, att: 0 | 1, zx: number, zy: number, x: number, y: number): Tactic {
  const cur = tacticPositions(t);
  const next = setPost(cur, slot, att, zx, zy, x, y);
  const slots = t.slots.slice();
  if (next.masks[slot] !== cur.masks[slot]) slots[slot] = maskToSlot(next.masks[slot]);
  return { ...t, slots, positions: next, formation: shapeName(slots) };
}

/** Overview: en plads flyttet til en anden fast plads → 0x5b2ba0 for pladsen (de andres egne positioner bevares) */
export function slotMoved(t: Tactic, slot: number): Tactic {
  const p = t.positions;
  if (!p || positionsValid(t.slots, p)) return t;
  // de øvrige pladser skal stadig passe – ellers er positionerne alligevel ugyldige (så gælder formationens)
  if (p.posts?.length === 11 && t.slots.slice(0, 11).every((s, i) => i === slot || slotMask(s) === p.masks[i])) return { ...t, positions: resetSlot(p, slot, slotMask(t.slots[slot])) };
  return t;
}
