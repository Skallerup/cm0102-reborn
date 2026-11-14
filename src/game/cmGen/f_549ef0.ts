// 0x549ef0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_549ef0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x549ef0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x549ef0:
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.esp + 0x4) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 549ef0: mov ax, word ptr [esp + 4]
        R.push((R.esi >>> 0)); // 549ef5: push esi
        R.esi = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 549ef6: mov esi, dword ptr [esp + 0xc]
        R.m.w16(((R.ecx) | 0) >>> 0, ((R.eax >>> 0) & 0xffff)); // 549efa: mov word ptr [ecx], ax
        R.m.w16(((R.ecx + 0x2) | 0) >>> 0, ((R.esi >>> 0) & 0xffff)); // 549efd: mov word ptr [ecx + 2], si
        R.esi = (R.logic((R.esi >>> 0) & 0xffff, 32)) | 0; // 549f01: and esi, 0xffff
        R.edx = ((R.esi >>> 0)) | 0; // 549f07: mov edx, esi
        R.edx = (R.logic((R.edx >>> 0) & 0x80000001, 32)) | 0; // 549f09: and edx, 0x80000001
        if (!R.sf) { pc = 0x549f16; continue; } // 549f0f: jns 0x549f16
        pc = 0x549f11; continue;
      case 0x549f11:
        R.edx = (R.incdec((R.edx >>> 0), -1, 32)) | 0; // 549f11: dec edx
        R.edx = (R.logic((R.edx >>> 0) | 0xfffffffe, 32)) | 0; // 549f12: or edx, 0xfffffffe
        R.edx = (R.incdec((R.edx >>> 0), 1, 32)) | 0; // 549f15: inc edx
        pc = 0x549f16; continue;
      case 0x549f16:
        R.sub((R.edx >>> 0), 0x1, 32); // 549f16: cmp edx, 1
        if (R.zf) { pc = 0x549f57; continue; } // 549f19: je 0x549f57
        pc = 0x549f1b; continue;
      case 0x549f1b:
        R.eax = ((R.esi >>> 0)) | 0; // 549f1b: mov eax, esi
        R.eax = (R.logic((R.eax >>> 0) & 0x80000003, 32)) | 0; // 549f1d: and eax, 0x80000003
        if (!R.sf) { pc = 0x549f29; continue; } // 549f22: jns 0x549f29
        pc = 0x549f24; continue;
      case 0x549f24:
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 549f24: dec eax
        R.eax = (R.logic((R.eax >>> 0) | 0xfffffffc, 32)) | 0; // 549f25: or eax, 0xfffffffc
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 549f28: inc eax
        pc = 0x549f29; continue;
      case 0x549f29:
        if (!R.zf) { pc = 0x549f57; continue; } // 549f29: jne 0x549f57
        pc = 0x549f2b; continue;
      case 0x549f2b:
        R.eax = ((R.esi >>> 0)) | 0; // 549f2b: mov eax, esi
        R.push((R.edi >>> 0)); // 549f2d: push edi
        R.edx = R.eax < 0 ? -1 : 0; // 549f2e: cdq 
        R.edi = (0x64) | 0; // 549f2f: mov edi, 0x64
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.edi >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 549f34: idiv edi
        R.edi = (R.pop()) | 0; // 549f36: pop edi
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 549f37: test edx, edx
        if (!R.zf) { pc = 0x549f49; continue; } // 549f39: jne 0x549f49
        pc = 0x549f3b; continue;
      case 0x549f3b:
        R.eax = ((R.esi >>> 0)) | 0; // 549f3b: mov eax, esi
        R.esi = (0x190) | 0; // 549f3d: mov esi, 0x190
        R.edx = R.eax < 0 ? -1 : 0; // 549f42: cdq 
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.esi >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 549f43: idiv esi
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 549f45: test edx, edx
        if (!R.zf) { pc = 0x549f57; continue; } // 549f47: jne 0x549f57
        pc = 0x549f49; continue;
      case 0x549f49:
        R.eax = (0x1) | 0; // 549f49: mov eax, 1
        R.esi = (R.pop()) | 0; // 549f4e: pop esi
        R.m.w32(((R.ecx + 0x4) | 0) >>> 0, (R.eax >>> 0)); // 549f4f: mov dword ptr [ecx + 4], eax
        R.eax = ((R.ecx >>> 0)) | 0; // 549f52: mov eax, ecx
        return R.eax; // 549f54: ret 8
      case 0x549f57:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 549f57: xor eax, eax
        R.esi = (R.pop()) | 0; // 549f59: pop esi
        R.m.w32(((R.ecx + 0x4) | 0) >>> 0, (R.eax >>> 0)); // 549f5a: mov dword ptr [ecx + 4], eax
        R.eax = ((R.ecx >>> 0)) | 0; // 549f5d: mov eax, ecx
        return R.eax; // 549f5f: ret 8
      default: throw new Error(`f_549ef0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
