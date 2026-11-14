// 0x7a6e20 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_7a6e20(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x7a6e20;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x7a6e20:
        R.eax = (R.m.u32(((R.ecx + 0x20) | 0) >>> 0)) | 0; // 7a6e20: mov eax, dword ptr [ecx + 0x20]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 7a6e23: test eax, eax
        R.eax = ((R.eax & 0xffffff00) | (((!R.zf ? 1 : 0) & 0xff) << 0)) | 0; // 7a6e25: setne al
        return R.ret(0); // 7a6e28: ret 
      default: throw new Error(`f_7a6e20: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
