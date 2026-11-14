// 0x8c61e0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x8c61e0, 0x8c61eb, 0x8c61f3]);
const CH = new Uint8Array([0, 0, 0]);
function f_8c61e0_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 8c61e0
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 8c61e0: mov eax, dword ptr [esp + 4]
        R.edx = (R.m.u32(((R.ecx + 0x4) | 0) >>> 0)) | 0; // 8c61e4: mov edx, dword ptr [ecx + 4]
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 8c61e7: cmp eax, edx
        if (!R.cL) { pc = 2; continue; } // 8c61e9: jge 0x8c61f3
        pc = 1; continue;
      case 1: // 8c61eb
        R.ecx = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 8c61eb: mov ecx, dword ptr [ecx]
        R.eax = (((R.ecx + R.eax * 4) | 0)) | 0; // 8c61ed: lea eax, [ecx + eax*4]
        R.rv = R.ret(1); return -1; // 8c61f0: ret 4
      case 2: // 8c61f3
        R.eax = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 8c61f3: mov eax, dword ptr [ecx]
        R.rv = R.ret(1); return -1; // 8c61f5: ret 4
      default: return pc;
    }
  }
}
export function f_8c61e0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 3) throw new Error(`f_8c61e0: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_8c61e0_0(R, pc); break;
      default: throw new Error(`f_8c61e0: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_8c61e0: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_8c61e0.shared = true;
