// 0x7a6e30 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 7a82b0=1tc
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x7a6e30]);
const CH = new Uint8Array([0]);
function f_7a6e30_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 7a6e30
        R.eax = (R.m.u32(((R.ecx + 0x1c) | 0) >>> 0)) | 0; // 7a6e30: mov eax, dword ptr [ecx + 0x1c]
        R.push((R.esi >>> 0)); // 7a6e33: push esi
        R.esi = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 7a6e34: mov esi, dword ptr [esp + 0xc]
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 7a6e38: mov edx, dword ptr [eax]
        R.eax = (R.m.u32(((R.esp + 0x8) | 0) >>> 0)) | 0; // 7a6e3a: mov eax, dword ptr [esp + 8]
        R.m.w32(((R.eax) | 0) >>> 0, (R.edx >>> 0)); // 7a6e3e: mov dword ptr [eax], edx
        R.edx = (R.m.u32(((R.ecx + 0x1c) | 0) >>> 0)) | 0; // 7a6e40: mov edx, dword ptr [ecx + 0x1c]
        R.edx = (R.m.u32(((R.edx + 0x4) | 0) >>> 0)) | 0; // 7a6e43: mov edx, dword ptr [edx + 4]
        R.m.w32(((R.esi) | 0) >>> 0, (R.edx >>> 0)); // 7a6e46: mov dword ptr [esi], edx
        R.edx = (R.m.u32(((R.ecx + 0x1c) | 0) >>> 0)) | 0; // 7a6e48: mov edx, dword ptr [ecx + 0x1c]
        R.esi = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 7a6e4b: mov esi, dword ptr [esp + 0x10]
        R.edx = (R.m.u32(((R.edx + 0x8) | 0) >>> 0)) | 0; // 7a6e4f: mov edx, dword ptr [edx + 8]
        R.m.w32(((R.esi) | 0) >>> 0, (R.edx >>> 0)); // 7a6e52: mov dword ptr [esi], edx
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 7a6e54: mov eax, dword ptr [eax]
        R.push((R.eax >>> 0)); // 7a6e56: push eax
        R.call(0x7a82b0, { n: 1, thisEcx: true, calleeClean: true }); // 7a6e57: call 0x7a82b0
        R.esi = (R.pop()) | 0; // 7a6e5c: pop esi
        R.rv = R.ret(3); return -1; // 7a6e5d: ret 0xc
      default: return pc;
    }
  }
}
export function f_7a6e30(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 1) throw new Error(`f_7a6e30: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_7a6e30_0(R, pc); break;
      default: throw new Error(`f_7a6e30: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_7a6e30: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_7a6e30.shared = true;
