// 0x4a7f20 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x4a7f20, 0x4a7f2b, 0x4a7f35, 0x4a7f3d]);
const CH = new Uint8Array([0, 0, 0, 0]);
function f_4a7f20_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 4a7f20
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.esp + 0x6) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 4a7f20: mov ax, word ptr [esp + 6]
        R.sub(((R.eax >>> 0) & 0xffff), R.m.u16(((R.ecx + 0x2) | 0) >>> 0), 16); // 4a7f25: cmp ax, word ptr [ecx + 2]
        if (!R.zf) { pc = 3; continue; } // 4a7f29: jne 0x4a7f3d
        pc = 1; continue;
      case 1: // 4a7f2b
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.esp + 0x4) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 4a7f2b: mov dx, word ptr [esp + 4]
        R.sub(((R.edx >>> 0) & 0xffff), R.m.u16(((R.ecx) | 0) >>> 0), 16); // 4a7f30: cmp dx, word ptr [ecx]
        if (!R.zf) { pc = 3; continue; } // 4a7f33: jne 0x4a7f3d
        pc = 2; continue;
      case 2: // 4a7f35
        R.eax = (0x1) | 0; // 4a7f35: mov eax, 1
        R.rv = R.ret(2); return -1; // 4a7f3a: ret 8
      case 3: // 4a7f3d
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 4a7f3d: xor eax, eax
        R.rv = R.ret(2); return -1; // 4a7f3f: ret 8
      default: return pc;
    }
  }
}
export function f_4a7f20(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 4) throw new Error(`f_4a7f20: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_4a7f20_0(R, pc); break;
      default: throw new Error(`f_4a7f20: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_4a7f20: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_4a7f20.shared = true;
