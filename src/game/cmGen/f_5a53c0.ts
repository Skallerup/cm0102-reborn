// 0x5a53c0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_5a53c0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x5a53c0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x5a53c0:
        return R.ret(0); // 5a53c0: ret 
      default: throw new Error(`f_5a53c0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
