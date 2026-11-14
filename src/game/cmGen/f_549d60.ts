// 0x549d60 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x549d60, 0x549d68, 0x549d74, 0x549d8c, 0x549da6, 0x549dab, 0x549dc4]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 0]);
function f_549d60_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 549d60
        R.ecx = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 549d60: mov ecx, dword ptr [esp + 4]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 549d64: test ecx, ecx
        if (R.zf) { pc = 6; continue; } // 549d66: je 0x549dc4
        pc = 1; continue;
      case 1: // 549d68
        R.eax = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 549d68: mov eax, dword ptr [ecx]
        R.edx = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 549d6a: mov edx, dword ptr [0xae2364]
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 549d70: cmp eax, edx
        if (!R.cL) { pc = 6; continue; } // 549d72: jge 0x549dc4
        pc = 2; continue;
      case 2: // 549d74
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 549d74: lea edx, [eax + eax*4]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 549d77: shl edx, 4
        R.edx = (R.sub((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 549d7a: sub edx, eax
        R.eax = (R.m.u32(((0xae2d0c) | 0) >>> 0)) | 0; // 549d7c: mov eax, dword ptr [0xae2d0c]
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 549d81: add eax, edx
        R.edx = (R.m.u32(((R.esp + 0x8) | 0) >>> 0)) | 0; // 549d83: mov edx, dword ptr [esp + 8]
        R.sub(R.m.u32(((R.eax + 0x37) | 0) >>> 0), (R.edx >>> 0), 32); // 549d87: cmp dword ptr [eax + 0x37], edx
        if (!R.zf) { pc = 4; continue; } // 549d8a: jne 0x549da6
        pc = 3; continue;
      case 3: // 549d8c
        R.edx = (R.logic((R.edx >>> 0) | 0xffffffff, 32)) | 0; // 549d8c: or edx, 0xffffffff
        R.m.w32(((R.eax + 0x27) | 0) >>> 0, (R.edx >>> 0)); // 549d8f: mov dword ptr [eax + 0x27], edx
        R.eax = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 549d92: mov eax, dword ptr [ecx]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 549d94: lea ecx, [eax + eax*4]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 549d97: shl ecx, 4
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 549d9a: sub ecx, eax
        R.eax = (R.m.u32(((0xae2d0c) | 0) >>> 0)) | 0; // 549d9c: mov eax, dword ptr [0xae2d0c]
        R.m.w32(((R.ecx + R.eax + 0x37) | 0) >>> 0, (R.edx >>> 0)); // 549da1: mov dword ptr [ecx + eax + 0x37], edx
        R.rv = R.ret(0); return -1; // 549da5: ret 
      case 4: // 549da6
        R.sub(R.m.u32(((R.eax + 0x4b) | 0) >>> 0), (R.edx >>> 0), 32); // 549da6: cmp dword ptr [eax + 0x4b], edx
        if (!R.zf) { pc = 6; continue; } // 549da9: jne 0x549dc4
        pc = 5; continue;
      case 5: // 549dab
        R.edx = (R.logic((R.edx >>> 0) | 0xffffffff, 32)) | 0; // 549dab: or edx, 0xffffffff
        R.m.w32(((R.eax + 0x3b) | 0) >>> 0, (R.edx >>> 0)); // 549dae: mov dword ptr [eax + 0x3b], edx
        R.eax = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 549db1: mov eax, dword ptr [ecx]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 549db3: lea ecx, [eax + eax*4]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 549db6: shl ecx, 4
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 549db9: sub ecx, eax
        R.eax = (R.m.u32(((0xae2d0c) | 0) >>> 0)) | 0; // 549dbb: mov eax, dword ptr [0xae2d0c]
        R.m.w32(((R.ecx + R.eax + 0x4b) | 0) >>> 0, (R.edx >>> 0)); // 549dc0: mov dword ptr [ecx + eax + 0x4b], edx
        pc = 6; continue;
      case 6: // 549dc4
        R.rv = R.ret(0); return -1; // 549dc4: ret 
      default: return pc;
    }
  }
}
export function f_549d60(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 7) throw new Error(`f_549d60: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_549d60_0(R, pc); break;
      default: throw new Error(`f_549d60: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_549d60: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_549d60.shared = true;
