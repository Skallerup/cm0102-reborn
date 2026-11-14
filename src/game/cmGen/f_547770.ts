// 0x547770 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 669bd0=3
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_547770(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x547770;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x547770:
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 547770: mov eax, dword ptr [esp + 4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 547774: test eax, eax
        if (!R.zf) { pc = 0x547779; continue; } // 547776: jne 0x547779
        pc = 0x547778; continue;
      case 0x547778:
        return R.ret(0); // 547778: ret 
      case 0x547779:
        R.push(0x0); // 547779: push 0
        R.push(0x0); // 54777b: push 0
        R.push((R.eax >>> 0)); // 54777d: push eax
        R.call(0x669bd0, { n: 3, thisEcx: false, calleeClean: false }); // 54777e: call 0x669bd0
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 547783: add esp, 0xc
        return R.ret(0); // 547786: ret 
      default: throw new Error(`f_547770: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
