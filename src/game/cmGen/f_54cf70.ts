// 0x54cf70 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x54cf70, 0x54cf7d, 0x54cf82, 0x54cf8d, 0x54cf92, 0x54cf9a, 0x54cfa0]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 0]);
function f_54cf70_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 54cf70
        R.eax = (R.m.u32(((R.ecx + 0x4) | 0) >>> 0)) | 0; // 54cf70: mov eax, dword ptr [ecx + 4]
        R.push((R.esi >>> 0)); // 54cf73: push esi
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 54cf74: test eax, eax
        R.esi = (0x9b8460) | 0; // 54cf76: mov esi, 0x9b8460
        if (!R.zf) { pc = 2; continue; } // 54cf7b: jne 0x54cf82
        pc = 1; continue;
      case 1: // 54cf7d
        R.esi = (0x9b8448) | 0; // 54cf7d: mov esi, 0x9b8448
        pc = 2; continue;
      case 2: // 54cf82
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.ecx) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 54cf82: mov ax, word ptr [ecx]
        R.edx = (0xb) | 0; // 54cf85: mov edx, 0xb
        R.ecx = (((R.esi + 0x16) | 0)) | 0; // 54cf8a: lea ecx, [esi + 0x16]
        pc = 3; continue;
      case 3: // 54cf8d
        R.sub(R.m.u16(((R.ecx) | 0) >>> 0), ((R.eax >>> 0) & 0xffff), 16); // 54cf8d: cmp word ptr [ecx], ax
        if (R.cL) { pc = 6; continue; } // 54cf90: jl 0x54cfa0
        pc = 4; continue;
      case 4: // 54cf92
        R.edx = (R.incdec((R.edx >>> 0), -1, 32)) | 0; // 54cf92: dec edx
        R.ecx = (R.sub((R.ecx >>> 0), 0x2, 32)) | 0; // 54cf93: sub ecx, 2
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 54cf96: test edx, edx
        if (!R.cL) { pc = 3; continue; } // 54cf98: jge 0x54cf8d
        pc = 5; continue;
      case 5: // 54cf9a
        R.eax = ((R.eax & 0xffff0000) | (((R.logic(((R.eax >>> 0) & 0xffff) | 0xffff, 16)) & 0xffff) << 0)) | 0; // 54cf9a: or ax, 0xffff
        R.esi = (R.pop()) | 0; // 54cf9e: pop esi
        R.rv = R.ret(0); return -1; // 54cf9f: ret 
      case 6: // 54cfa0
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.esi + R.edx * 2) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 54cfa0: mov cx, word ptr [esi + edx*2]
        R.esi = (R.pop()) | 0; // 54cfa4: pop esi
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 54cfa5: sub eax, ecx
        R.rv = R.ret(0); return -1; // 54cfa7: ret 
      default: return pc;
    }
  }
}
export function f_54cf70(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 7) throw new Error(`f_54cf70: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_54cf70_0(R, pc); break;
      default: throw new Error(`f_54cf70: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_54cf70: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_54cf70.shared = true;
