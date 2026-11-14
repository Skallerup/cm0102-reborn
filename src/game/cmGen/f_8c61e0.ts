// 0x8c61e0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_8c61e0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x8c61e0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x8c61e0:
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 8c61e0: mov eax, dword ptr [esp + 4]
        R.edx = (R.m.u32(((R.ecx + 0x4) | 0) >>> 0)) | 0; // 8c61e4: mov edx, dword ptr [ecx + 4]
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 8c61e7: cmp eax, edx
        if (!R.cL) { pc = 0x8c61f3; continue; } // 8c61e9: jge 0x8c61f3
        pc = 0x8c61eb; continue;
      case 0x8c61eb:
        R.ecx = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 8c61eb: mov ecx, dword ptr [ecx]
        R.eax = (((R.ecx + R.eax * 4) | 0)) | 0; // 8c61ed: lea eax, [ecx + eax*4]
        return R.ret(1); // 8c61f0: ret 4
      case 0x8c61f3:
        R.eax = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 8c61f3: mov eax, dword ptr [ecx]
        return R.ret(1); // 8c61f5: ret 4
      default: throw new Error(`f_8c61e0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
