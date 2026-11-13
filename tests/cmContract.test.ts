// CONTRACT_MANAGER::daily_update 0x4c7ac0 (src/game/cmContract.ts, med 0x85fc50/0x864550/0x4cda70/0x4ce4e0 …) mod originalen: fixturerne
// (scripts/ct-fixture.ts af sporbinærens øjebliksbilleder, oraklet frø 1, 3.9.60) har de bytes af originalens hukommelse, porten læser,
// svarene på dens tilfældige tal og ikke-porterede kald i originalens rækkefølge, og originalens kontrakter/værdier efter dagen.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { G, SparseMem, type CmCtx } from '../src/game/cmMem';
import { contractDailyUpdate_4c7ac0 } from '../src/game/cmContract';

interface Fx { day: number; year: number; slice: number; flag: number; datePtr: number; runs: [number, string][]; ev: (number | string)[][]; expect: [number, number, [number, number][], number, number][] }

function run(file: string) {
  const fx = JSON.parse(gunzipSync(readFileSync(new URL(`./fixtures/${file}`, import.meta.url))).toString()) as Fx;
  const m = new SparseMem();
  for (const [a, h] of fx.runs) m.loadHex(a, h);
  let i = 0, bad = '';
  const next = (k: number, what: string) => { const e = fx.ev[i++]; if (!e || e[0] !== k) { bad ||= `hændelse ${i - 1}: ${what}`; throw new Error(bad); } return e; };
  const c: CmCtx = {
    m,
    rand: (n) => { const e = next(0, `rand(${n})`); if (e[1] !== n) { bad ||= `hændelse ${i - 1}: rand(${e[1]}) ≠ rand(${n})`; throw new Error(bad); } return e[2] as number; },
    call: (adr, ...a) => {
      const e = next(1, `kald ${adr.toString(16)}`);
      if (e[1] !== adr) { bad ||= `hændelse ${i - 1}: kald ${(e[1] as number).toString(16)} ≠ ${adr.toString(16)}`; throw new Error(bad); }
      for (const o of e.slice(3) as string[]) { const [p, h] = o.split(':'); m.loadHex(parseInt(p, 16), h); }
      // realloc 0x945667(gammel, n): indholdet flyttes med til originalens nye blok (som ct-replay.ts)
      if (adr === 0x945667 && e[2] && a[0] && (e[2] as number) >>> 0 !== a[0] >>> 0) for (let k = 0; k < (a[1] >>> 0); k++) m.w8(((e[2] as number) >>> 0) + k, m.u8((a[0] >>> 0) + k));
      return e[2] as number;
    },
  };
  contractDailyUpdate_4c7ac0(c, fx.datePtr, fx.slice, fx.flag);
  const staff = m.u32(G.STAFF);
  let contracts = 0, contractsOk = 0, values = 0, valuesN = 0;
  for (const [id, a, bytes, v, vch] of fx.expect) {
    if (vch) { valuesN++; if (m.s32(staff + 0x6e * id + 0x52) === v) values++; }
    if (!bytes.length) continue;
    contracts++;
    if (bytes.every(([k, b]) => m.u8(a + k) === b)) contractsOk++;
  }
  return { used: i, total: fx.ev.length, contracts, contractsOk, values, valuesN };
}

describe('CONTRACT_MANAGER::daily_update 0x4c7ac0 mod originalen', () => {
  it('30/6-2002 (udløbsdagen): alle tal og kald i samme rækkefølge, de 67 udløbne kontrakter ens', () => {
    const r = run('cm-contract-180-2002.json.gz');
    expect(r.used).toBe(r.total);
    // kontrakter, som kun ikke-porterede kald (fritstillingen 0x8c1af0 m.fl.) ændrer, tælles ikke
    expect(r.contractsOk).toBeGreaterThanOrEqual(67);
    expect(r.values).toBeGreaterThanOrEqual(1239);
  });
  it('20/7-2001: forlængelsestilbud (0x4cda70 → 0x85fc50 → 0x864550), værdierne +0x52', () => {
    const r = run('cm-contract-200-2001.json.gz');
    expect(r.used).toBe(r.total);
    expect(r.values).toBe(1357);
  });
});
