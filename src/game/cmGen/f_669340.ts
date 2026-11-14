// 0x669340 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x669340, 0x669346, 0x669355, 0x66935b, 0x66935d]);
const CH = new Uint8Array([0, 0, 0, 0, 0]);
function f_669340_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 669340
        R.edx = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 669340: mov edx, dword ptr [esp + 4]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 669344: xor al, al
        pc = 1; continue;
      case 1: // 669346
        R.ecx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 669346: movsx ecx, al
        R.ecx = (((R.ecx + R.ecx * 8) | 0)) | 0; // 669349: lea ecx, [ecx + ecx*8]
        R.sub(R.m.u32(((R.ecx * 8 + 0xb63d60) | 0) >>> 0), (R.edx >>> 0), 32); // 66934c: cmp dword ptr [ecx*8 + 0xb63d60], edx
        if (R.zf) { pc = 4; continue; } // 669353: je 0x66935d
        pc = 2; continue;
      case 2: // 669355
        R.eax = ((R.eax & 0xffffff00) | (((R.incdec(((R.eax >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 669355: inc al
        R.sub(((R.eax >>> 0) & 0xff), 0x23, 8); // 669357: cmp al, 0x23
        if (R.cL) { pc = 1; continue; } // 669359: jl 0x669346
        pc = 3; continue;
      case 3: // 66935b
        R.eax = ((R.eax & 0xffffff00) | (((0x4) & 0xff) << 0)) | 0; // 66935b: mov al, 4
        pc = 4; continue;
      case 4: // 66935d
        R.rv = R.ret(0); return -1; // 66935d: ret 
      default: return pc;
    }
  }
}
export function f_669340(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 5) throw new Error(`f_669340: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_669340_0(R, pc); break;
      default: throw new Error(`f_669340: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_669340: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_669340.shared = true;
