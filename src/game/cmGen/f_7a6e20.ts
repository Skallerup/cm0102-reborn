// 0x7a6e20 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x7a6e20]);
const CH = new Uint8Array([0]);
function f_7a6e20_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 7a6e20
        R.eax = (R.m.u32(((R.ecx + 0x20) | 0) >>> 0)) | 0; // 7a6e20: mov eax, dword ptr [ecx + 0x20]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 7a6e23: test eax, eax
        R.eax = ((R.eax & 0xffffff00) | (((!R.zf ? 1 : 0) & 0xff) << 0)) | 0; // 7a6e25: setne al
        R.rv = R.ret(0); return -1; // 7a6e28: ret 
      default: return pc;
    }
  }
}
export function f_7a6e20(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 1) throw new Error(`f_7a6e20: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_7a6e20_0(R, pc); break;
      default: throw new Error(`f_7a6e20: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_7a6e20: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_7a6e20.shared = true;
