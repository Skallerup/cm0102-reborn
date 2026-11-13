// Afspilning af originalens log (sn_trace.c) som CmCtx: portens rand-kald og c.call-kald skal komme i præcis samme rækkefølge og med samme
// argumenter som originalens. Kald af en ikke-porteret funktion springer loggen frem til funktionens "C"-linje (dens egne rand-kald og indre
// kald hører til den) og giver originalens returværdi. Omsluttede funktioner, porten selv har oversat, er gennemsigtige.
import type { CmCtx, CmMem } from '../src/game/cmMem';
import type { SnapLog } from './ct-snap';

export interface Mismatch { at: number; want: string; got: string; stack: string }

export class Replay implements CmCtx {
  pos = 0;
  randCount = 0;
  callCount = 0;
  mismatch: Mismatch | null = null;
  floatRet = new Set([0x864550, 0x866830, 0x844780, 0x846920]);
  argMismatch = 0;
  strictArgs = true;
  constructor(public m: CmMem, public log: SnapLog) {}
  private item(i: number) { return this.log.seq[i]; }
  private fail(want: string, got: string): never {
    this.mismatch ??= { at: this.pos, want, got, stack: new Error().stack?.split('\n').slice(2, 7).join(' | ') ?? '' };
    throw new ReplayStop(this.mismatch);
  }
  probes: { adr: number; v: number }[] = [];
  probe(adr: number, v: number): void { this.probes.push({ adr, v }); }
  rand(n: number): number {
    // gennemsigtige omsluttede kald (porteret) springes over
    while (this.pos < this.log.seq.length && this.item(this.pos).k !== 'R') {
      const it = this.item(this.pos);
      if (it.k === 'E' || it.k === 'C') { this.pos++; continue; }
    }
    const it = this.item(this.pos);
    if (!it) this.fail('slut på loggen', `rand(${n})`);
    const r = this.log.rands[it.i];
    if (r.n !== n) this.fail(`rand(${r.n}) @${r.ret.toString(16)}`, `rand(${n})`);
    this.pos++; this.randCount++;
    return r.r;
  }
  call(adr: number, ...args: number[]): number {
    // næste E for adressen (gennemsigtige E/C før den springes over, men ikke rand)
    let p = this.pos;
    for (; p < this.log.seq.length; p++) {
      const it = this.item(p);
      if (it.k === 'R') this.fail(`rand(${this.log.rands[it.i].n}) @${this.log.rands[it.i].ret.toString(16)}`, `call ${adr.toString(16)}(${args.map((a) => (a >>> 0).toString(16)).join(',')})`);
      const c = this.log.calls[it.i];
      if (it.k === 'E' && c.adr === adr) break;
    }
    if (p >= this.log.seq.length) this.fail('slut på loggen', `call ${adr.toString(16)}`);
    const e = this.log.calls[this.item(p).i];
    // thiscall: portene giver enten `this` som første argument eller ikke – begge godtages
    // stakpegere (originalens lokale variabler ~0x10f00000, portens under FRAME_TOP 0x2ff000) sammenlignes ikke
    const stackO = (v: number) => v >= 0x10000000 && v < 0x11000000, stackP = (v: number) => v >= 0x100000 && v < 0x400000;
    const ok = (want: number[]) => args.every((a, k) => k >= want.length || (a >>> 0) === want[k] || (stackO(want[k]) && stackP(a >>> 0)) || ((a >>> 0) < 0x100 && (want[k] & 0xff) === (a >>> 0)) || ((a >>> 0) < 0x10000 && (want[k] & 0xffff) === (a >>> 0)) || (a === -1 && (want[k] & 0xff) === 0xff));
    if (!ok(e.args) && !ok([e.ecx, ...e.args])) {
      if (this.strictArgs) this.fail(`call ${adr.toString(16)}(${[e.ecx, ...e.args].map((x) => x.toString(16)).join(',')}) @${e.ret.toString(16)}`, `(${args.map((a) => (a >>> 0).toString(16)).join(',')})`);
      this.argMismatch++;
    }
    // til den matchende C (samme adresse og dybde)
    let depth = 0, q = p + 1;
    for (; q < this.log.seq.length; q++) {
      const it = this.item(q);
      if (it.k === 'R') continue;
      const c = this.log.calls[it.i];
      if (c.adr !== adr) continue;
      if (it.k === 'E') depth++;
      else if (depth === 0) break;
      else depth--;
    }
    const cc = this.log.calls[this.item(q).i];
    // ud-parametre: originalens 32 bytes efter kaldet skrives til portens tilsvarende peger
    if (cc.out) {
      const thisFirst = !ok(e.args);
      for (const o of cc.out) {
        const ai = thisFirst ? o.k + 1 : o.k;
        const ptr = args[ai];
        if (ptr !== undefined && stackP(ptr >>> 0) && 'loadHex' in this.m) (this.m as unknown as { loadHex(a: number, h: string): void }).loadHex(ptr >>> 0, o.hex);
      }
    }
    this.pos = q + 1; this.callCount++;
    // realloc 0x945667(gammel, n): indholdet flyttes med (originalens nye blok)
    if (adr === 0x945667 && cc.eax && args[0]) { const o = args[0] >>> 0, nw = cc.eax >>> 0; if (o !== nw) for (let i = 0; i < (args[1] >>> 0); i++) this.m.w8(nw + i, this.m.u8(o + i)); }
    return this.floatRet.has(adr) ? cc.st0! : (cc.eax! | 0);
  }
  /** resten af loggens rand-kald (skal være 0 når porten er færdig) */
  remainingRands(): number { let n = 0; for (let i = this.pos; i < this.log.seq.length; i++) if (this.item(i).k === 'R') n++; return n; }
}
export class ReplayStop extends Error { constructor(public mm: Mismatch) { super(`afvigelse ved ${mm.at}: originalen ${mm.want}, porten ${mm.got}`); } }
