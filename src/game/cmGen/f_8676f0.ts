// 0x8676f0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_8676f0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x8676f0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x8676f0:
        R.eax = (R.m.u32(((R.ecx + 0x40) | 0) >>> 0)) | 0; // 8676f0: mov eax, dword ptr [ecx + 0x40]
        return R.ret(0); // 8676f3: ret 
      default: throw new Error(`f_8676f0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
