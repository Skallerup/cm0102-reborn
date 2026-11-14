// 0x8676f0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x8676f0]);
const CH = new Uint8Array([0]);
function f_8676f0_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 8676f0
        R.eax = (R.m.u32(((R.ecx + 0x40) | 0) >>> 0)) | 0; // 8676f0: mov eax, dword ptr [ecx + 0x40]
        R.rv = R.ret(0); return -1; // 8676f3: ret 
      default: return pc;
    }
  }
}
export function f_8676f0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 1) throw new Error(`f_8676f0: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_8676f0_0(R, pc); break;
      default: throw new Error(`f_8676f0: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_8676f0: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_8676f0.shared = true;
