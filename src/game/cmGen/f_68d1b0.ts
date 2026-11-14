// 0x68d1b0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x68d1b0, 0x68d1b7, 0x68d1c0]);
const CH = new Uint8Array([0, 0, 0]);
function f_68d1b0_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 68d1b0
        R.edx = (R.m.u32(((R.ecx + 0xa) | 0) >>> 0)) | 0; // 68d1b0: mov edx, dword ptr [ecx + 0xa]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 68d1b3: test edx, edx
        if (R.zf) { pc = 2; continue; } // 68d1b5: je 0x68d1c0
        pc = 1; continue;
      case 1: // 68d1b7
        R.eax = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 68d1b7: mov eax, dword ptr [edx]
        R.edx = (R.m.u32(((R.edx + 0x6) | 0) >>> 0)) | 0; // 68d1b9: mov edx, dword ptr [edx + 6]
        R.m.w32(((R.ecx + 0xa) | 0) >>> 0, (R.edx >>> 0)); // 68d1bc: mov dword ptr [ecx + 0xa], edx
        R.rv = R.ret(0); return -1; // 68d1bf: ret 
      case 2: // 68d1c0
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 68d1c0: xor eax, eax
        R.rv = R.ret(0); return -1; // 68d1c2: ret 
      default: return pc;
    }
  }
}
export function f_68d1b0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 3) throw new Error(`f_68d1b0: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_68d1b0_0(R, pc); break;
      default: throw new Error(`f_68d1b0: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_68d1b0: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_68d1b0.shared = true;
