// 0x4a7f20 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_4a7f20(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x4a7f20;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x4a7f20:
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.esp + 0x6) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 4a7f20: mov ax, word ptr [esp + 6]
        R.sub(((R.eax >>> 0) & 0xffff), R.m.u16(((R.ecx + 0x2) | 0) >>> 0), 16); // 4a7f25: cmp ax, word ptr [ecx + 2]
        if (!R.zf) { pc = 0x4a7f3d; continue; } // 4a7f29: jne 0x4a7f3d
        pc = 0x4a7f2b; continue;
      case 0x4a7f2b:
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.esp + 0x4) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 4a7f2b: mov dx, word ptr [esp + 4]
        R.sub(((R.edx >>> 0) & 0xffff), R.m.u16(((R.ecx) | 0) >>> 0), 16); // 4a7f30: cmp dx, word ptr [ecx]
        if (!R.zf) { pc = 0x4a7f3d; continue; } // 4a7f33: jne 0x4a7f3d
        pc = 0x4a7f35; continue;
      case 0x4a7f35:
        R.eax = (0x1) | 0; // 4a7f35: mov eax, 1
        return R.eax; // 4a7f3a: ret 8
      case 0x4a7f3d:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 4a7f3d: xor eax, eax
        return R.eax; // 4a7f3f: ret 8
      default: throw new Error(`f_4a7f20: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
