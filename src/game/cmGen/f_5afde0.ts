// 0x5afde0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x5afde0, 0x5afde8, 0x5afdeb]);
const CH = new Uint8Array([0, 0, 0]);
function f_5afde0_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 5afde0
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 5afde0: mov eax, dword ptr [esp + 4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5afde4: test eax, eax
        if (!R.zf) { pc = 2; continue; } // 5afde6: jne 0x5afdeb
        pc = 1; continue;
      case 1: // 5afde8
        R.rv = R.ret(1); return -1; // 5afde8: ret 4
      case 2: // 5afdeb
        R.edx = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 5afdeb: mov edx, dword ptr [0xae2364]
        R.push((R.esi >>> 0)); // 5afdf1: push esi
        R.esi = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 5afdf2: mov esi, dword ptr [eax]
        R.edx = (R.sub((R.edx >>> 0), (R.esi >>> 0), 32)) | 0; // 5afdf4: sub edx, esi
        R.esi = (R.pop()) | 0; // 5afdf6: pop esi
        R.eax = (R.m.u32(((R.ecx + R.edx * 4 + -0x4) | 0) >>> 0)) | 0; // 5afdf7: mov eax, dword ptr [ecx + edx*4 - 4]
        R.rv = R.ret(1); return -1; // 5afdfb: ret 4
      default: return pc;
    }
  }
}
export function f_5afde0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 3) throw new Error(`f_5afde0: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_5afde0_0(R, pc); break;
      default: throw new Error(`f_5afde0: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_5afde0: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_5afde0.shared = true;
