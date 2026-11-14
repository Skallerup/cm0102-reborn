// 0x549ef0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x549ef0, 0x549f11, 0x549f16, 0x549f1b, 0x549f24, 0x549f29, 0x549f2b, 0x549f3b, 0x549f49, 0x549f57]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
function f_549ef0_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 549ef0
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.esp + 0x4) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 549ef0: mov ax, word ptr [esp + 4]
        R.push((R.esi >>> 0)); // 549ef5: push esi
        R.esi = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 549ef6: mov esi, dword ptr [esp + 0xc]
        R.m.w16(((R.ecx) | 0) >>> 0, ((R.eax >>> 0) & 0xffff)); // 549efa: mov word ptr [ecx], ax
        R.m.w16(((R.ecx + 0x2) | 0) >>> 0, ((R.esi >>> 0) & 0xffff)); // 549efd: mov word ptr [ecx + 2], si
        R.esi = (R.logic((R.esi >>> 0) & 0xffff, 32)) | 0; // 549f01: and esi, 0xffff
        R.edx = ((R.esi >>> 0)) | 0; // 549f07: mov edx, esi
        R.edx = (R.logic((R.edx >>> 0) & 0x80000001, 32)) | 0; // 549f09: and edx, 0x80000001
        if (!R.sf) { pc = 2; continue; } // 549f0f: jns 0x549f16
        pc = 1; continue;
      case 1: // 549f11
        R.edx = (R.incdec((R.edx >>> 0), -1, 32)) | 0; // 549f11: dec edx
        R.edx = (R.logic((R.edx >>> 0) | 0xfffffffe, 32)) | 0; // 549f12: or edx, 0xfffffffe
        R.edx = (R.incdec((R.edx >>> 0), 1, 32)) | 0; // 549f15: inc edx
        pc = 2; continue;
      case 2: // 549f16
        R.sub((R.edx >>> 0), 0x1, 32); // 549f16: cmp edx, 1
        if (R.zf) { pc = 9; continue; } // 549f19: je 0x549f57
        pc = 3; continue;
      case 3: // 549f1b
        R.eax = ((R.esi >>> 0)) | 0; // 549f1b: mov eax, esi
        R.eax = (R.logic((R.eax >>> 0) & 0x80000003, 32)) | 0; // 549f1d: and eax, 0x80000003
        if (!R.sf) { pc = 5; continue; } // 549f22: jns 0x549f29
        pc = 4; continue;
      case 4: // 549f24
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 549f24: dec eax
        R.eax = (R.logic((R.eax >>> 0) | 0xfffffffc, 32)) | 0; // 549f25: or eax, 0xfffffffc
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 549f28: inc eax
        pc = 5; continue;
      case 5: // 549f29
        if (!R.zf) { pc = 9; continue; } // 549f29: jne 0x549f57
        pc = 6; continue;
      case 6: // 549f2b
        R.eax = ((R.esi >>> 0)) | 0; // 549f2b: mov eax, esi
        R.push((R.edi >>> 0)); // 549f2d: push edi
        R.edx = R.eax < 0 ? -1 : 0; // 549f2e: cdq 
        R.edi = (0x64) | 0; // 549f2f: mov edi, 0x64
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.edi >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 549f34: idiv edi
        R.edi = (R.pop()) | 0; // 549f36: pop edi
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 549f37: test edx, edx
        if (!R.zf) { pc = 8; continue; } // 549f39: jne 0x549f49
        pc = 7; continue;
      case 7: // 549f3b
        R.eax = ((R.esi >>> 0)) | 0; // 549f3b: mov eax, esi
        R.esi = (0x190) | 0; // 549f3d: mov esi, 0x190
        R.edx = R.eax < 0 ? -1 : 0; // 549f42: cdq 
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.esi >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 549f43: idiv esi
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 549f45: test edx, edx
        if (!R.zf) { pc = 9; continue; } // 549f47: jne 0x549f57
        pc = 8; continue;
      case 8: // 549f49
        R.eax = (0x1) | 0; // 549f49: mov eax, 1
        R.esi = (R.pop()) | 0; // 549f4e: pop esi
        R.m.w32(((R.ecx + 0x4) | 0) >>> 0, (R.eax >>> 0)); // 549f4f: mov dword ptr [ecx + 4], eax
        R.eax = ((R.ecx >>> 0)) | 0; // 549f52: mov eax, ecx
        R.rv = R.ret(2); return -1; // 549f54: ret 8
      default: return pc;
    }
  }
}
function f_549ef0_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 9: // 549f57
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 549f57: xor eax, eax
        R.esi = (R.pop()) | 0; // 549f59: pop esi
        R.m.w32(((R.ecx + 0x4) | 0) >>> 0, (R.eax >>> 0)); // 549f5a: mov dword ptr [ecx + 4], eax
        R.eax = ((R.ecx >>> 0)) | 0; // 549f5d: mov eax, ecx
        R.rv = R.ret(2); return -1; // 549f5f: ret 8
      default: return pc;
    }
  }
}
export function f_549ef0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 10) throw new Error(`f_549ef0: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_549ef0_0(R, pc); break;
      case 1: np = f_549ef0_1(R, pc); break;
      default: throw new Error(`f_549ef0: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_549ef0: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_549ef0.shared = true;
