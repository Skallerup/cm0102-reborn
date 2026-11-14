// 0x8e5680 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 54a110=0t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_8e5680(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x8e5680;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x8e5680:
        R.push((R.esi >>> 0)); // 8e5680: push esi
        R.esi = ((R.ecx >>> 0)) | 0; // 8e5681: mov esi, ecx
        R.ecx = (((R.esi + 0x12) | 0)) | 0; // 8e5683: lea ecx, [esi + 0x12]
        R.call(0x54a110, { n: 0, thisEcx: true, calleeClean: false }); // 8e5686: call 0x54a110
        R.m.w32(((R.esi) | 0) >>> 0, 0x0); // 8e568b: mov dword ptr [esi], 0
        R.m.w32(((R.esi + 0x4) | 0) >>> 0, 0x0); // 8e5691: mov dword ptr [esi + 4], 0
        R.eax = ((R.esi >>> 0)) | 0; // 8e5698: mov eax, esi
        R.esi = (R.pop()) | 0; // 8e569a: pop esi
        return R.ret(0); // 8e569b: ret 
      default: throw new Error(`f_8e5680: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
