// 0x54cfb0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x54cfb0, 0x54cfbc, 0x54cfc1, 0x54cfcd, 0x54cfd2, 0x54cfda, 0x54cfdc]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 0]);
function f_54cfb0_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 54cfb0
        R.eax = (R.m.u32(((R.ecx + 0x4) | 0) >>> 0)) | 0; // 54cfb0: mov eax, dword ptr [ecx + 4]
        R.edx = (0x9b8460) | 0; // 54cfb3: mov edx, 0x9b8460
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 54cfb8: test eax, eax
        if (!R.zf) { pc = 2; continue; } // 54cfba: jne 0x54cfc1
        pc = 1; continue;
      case 1: // 54cfbc
        R.edx = (0x9b8448) | 0; // 54cfbc: mov edx, 0x9b8448
        pc = 2; continue;
      case 2: // 54cfc1
        R.push((R.esi >>> 0)); // 54cfc1: push esi
        R.esi = ((R.esi & 0xffff0000) | (((R.m.u16(((R.ecx) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 54cfc2: mov si, word ptr [ecx]
        R.eax = (0xb) | 0; // 54cfc5: mov eax, 0xb
        R.ecx = (((R.edx + 0x16) | 0)) | 0; // 54cfca: lea ecx, [edx + 0x16]
        pc = 3; continue;
      case 3: // 54cfcd
        R.sub(R.m.u16(((R.ecx) | 0) >>> 0), ((R.esi >>> 0) & 0xffff), 16); // 54cfcd: cmp word ptr [ecx], si
        if (R.cL) { pc = 6; continue; } // 54cfd0: jl 0x54cfdc
        pc = 4; continue;
      case 4: // 54cfd2
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 54cfd2: dec eax
        R.ecx = (R.sub((R.ecx >>> 0), 0x2, 32)) | 0; // 54cfd3: sub ecx, 2
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 54cfd6: test eax, eax
        if (!R.cL) { pc = 3; continue; } // 54cfd8: jge 0x54cfcd
        pc = 5; continue;
      case 5: // 54cfda
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) | 0xff, 8)) & 0xff) << 0)) | 0; // 54cfda: or al, 0xff
        pc = 6; continue;
      case 6: // 54cfdc
        R.esi = (R.pop()) | 0; // 54cfdc: pop esi
        R.rv = R.ret(0); return -1; // 54cfdd: ret 
      default: return pc;
    }
  }
}
export function f_54cfb0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 7) throw new Error(`f_54cfb0: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_54cfb0_0(R, pc); break;
      default: throw new Error(`f_54cfb0: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_54cfb0: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_54cfb0.shared = true;
