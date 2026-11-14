// 0x68d010 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 944c94=0
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_68d010(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x68d010;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x68d010:
        R.eax = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 68d010: mov eax, dword ptr [ecx]
        R.push((R.eax >>> 0)); // 68d012: push eax
        R.call(0x944c94, { n: 0, thisEcx: false, calleeClean: false }); // 68d013: call 0x944c94
        R.ecx = (R.pop()) | 0; // 68d018: pop ecx
        return R.eax; // 68d019: ret 
      default: throw new Error(`f_68d010: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
