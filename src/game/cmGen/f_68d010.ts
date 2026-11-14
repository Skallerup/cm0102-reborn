// 0x68d010 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 944c94=0
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x68d010]);
const CH = new Uint8Array([0]);
function f_68d010_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 68d010
        R.eax = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 68d010: mov eax, dword ptr [ecx]
        R.push((R.eax >>> 0)); // 68d012: push eax
        R.call(0x944c94, { n: 0, thisEcx: false, calleeClean: false }); // 68d013: call 0x944c94
        R.ecx = (R.pop()) | 0; // 68d018: pop ecx
        R.rv = R.ret(0); return -1; // 68d019: ret 
      default: return pc;
    }
  }
}
export function f_68d010(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 1) throw new Error(`f_68d010: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_68d010_0(R, pc); break;
      default: throw new Error(`f_68d010: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_68d010: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_68d010.shared = true;
