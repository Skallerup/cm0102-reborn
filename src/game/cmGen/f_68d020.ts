// 0x68d020 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x68d020]);
const CH = new Uint8Array([0]);
function f_68d020_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 68d020
        R.eax = ((R.ecx >>> 0)) | 0; // 68d020: mov eax, ecx
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 68d022: xor ecx, ecx
        R.m.w32(((R.eax + 0x2) | 0) >>> 0, (R.ecx >>> 0)); // 68d024: mov dword ptr [eax + 2], ecx
        R.m.w32(((R.eax + 0x6) | 0) >>> 0, (R.ecx >>> 0)); // 68d027: mov dword ptr [eax + 6], ecx
        R.m.w32(((R.eax + 0xa) | 0) >>> 0, (R.ecx >>> 0)); // 68d02a: mov dword ptr [eax + 0xa], ecx
        R.m.w16(((R.eax) | 0) >>> 0, ((R.ecx >>> 0) & 0xffff)); // 68d02d: mov word ptr [eax], cx
        R.rv = R.ret(0); return -1; // 68d030: ret 
      default: return pc;
    }
  }
}
export function f_68d020(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 1) throw new Error(`f_68d020: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_68d020_0(R, pc); break;
      default: throw new Error(`f_68d020: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_68d020: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_68d020.shared = true;
