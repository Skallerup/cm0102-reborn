// Et "gammelt" gemt spil til konverteringens test (tests/cmConvert.test.ts, scripts/convert-soak.ts): originalens lag fjernes fra et spil med den
// originale database, og egenskaberne pustes op som i de gamle gem (20 overalt, fart 1).
import type { GameState } from '../../src/game/types';
import { ATTRS } from '../../src/game/attributes';
import { INTRINSIC_KEYS } from '../../src/game/playerInit';

export function makeLegacy(g: GameState, inflate = 300): GameState {
  const o = JSON.parse(JSON.stringify(g)) as GameState;
  const r = o as unknown as Record<string, unknown>;
  for (const k of Object.keys(r)) if (/^cm[A-Z]/.test(k)) delete r[k];
  o.options.mode = 'extended';
  delete o.options.engine;
  const strip = (x: object) => { for (const k of Object.keys(x)) if (/^cm[A-Z]/.test(k)) delete (x as Record<string, unknown>)[k]; };
  for (const p of Object.values(o.players)) { strip(p); if (p.contract) strip(p.contract); }
  for (const s of Object.values(o.staff)) strip(s);
  for (const c of Object.values(o.clubs)) strip(c);
  const ids = Object.values(o.players).filter((p) => p.club).map((p) => p.id).sort((a, b) => a - b);
  const idx = INTRINSIC_KEYS.map((k) => ATTRS.indexOf(k));
  for (let i = 0; i < inflate && ids.length; i++) {
    const p = o.players[ids[(i * 7919) % ids.length]];
    for (const j of idx) p.attrs[j] = 20;
    p.attrs[ATTRS.indexOf('pace')] = 1;
    p.ca = Math.min(200, p.pa + 15);
  }
  return o;
}
