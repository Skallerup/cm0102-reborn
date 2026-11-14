// 0x669340 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_669340(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x669340;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x669340:
        R.edx = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 669340: mov edx, dword ptr [esp + 4]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 669344: xor al, al
        pc = 0x669346; continue;
      case 0x669346:
        R.ecx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 669346: movsx ecx, al
        R.ecx = (((R.ecx + R.ecx * 8) | 0)) | 0; // 669349: lea ecx, [ecx + ecx*8]
        R.sub(R.m.u32(((R.ecx * 8 + 0xb63d60) | 0) >>> 0), (R.edx >>> 0), 32); // 66934c: cmp dword ptr [ecx*8 + 0xb63d60], edx
        if (R.zf) { pc = 0x66935d; continue; } // 669353: je 0x66935d
        pc = 0x669355; continue;
      case 0x669355:
        R.eax = ((R.eax & 0xffffff00) | (((R.incdec(((R.eax >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 669355: inc al
        R.sub(((R.eax >>> 0) & 0xff), 0x23, 8); // 669357: cmp al, 0x23
        if (R.cL) { pc = 0x669346; continue; } // 669359: jl 0x669346
        pc = 0x66935b; continue;
      case 0x66935b:
        R.eax = ((R.eax & 0xffffff00) | (((0x4) & 0xff) << 0)) | 0; // 66935b: mov al, 4
        pc = 0x66935d; continue;
      case 0x66935d:
        return R.ret(0); // 66935d: ret 
      default: throw new Error(`f_669340: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
