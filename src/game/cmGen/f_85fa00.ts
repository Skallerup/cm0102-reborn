// 0x85fa00 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 54cdb0=2tc
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_85fa00(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x85fa00;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x85fa00:
        R.eax = (R.m.u32(((0xae2c94) | 0) >>> 0)) | 0; // 85fa00: mov eax, dword ptr [0xae2c94]
        R.edx = (R.m.u32(((0xae2c90) | 0) >>> 0)) | 0; // 85fa05: mov edx, dword ptr [0xae2c90]
        R.push((R.eax >>> 0)); // 85fa0b: push eax
        R.push((R.edx >>> 0)); // 85fa0c: push edx
        R.ecx = (R.add((R.ecx >>> 0), 0x2d, 32)) | 0; // 85fa0d: add ecx, 0x2d
        R.call(0x54cdb0, { n: 2, thisEcx: true, calleeClean: true }); // 85fa10: call 0x54cdb0
        return R.ret(0); // 85fa15: ret 
      default: throw new Error(`f_85fa00: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
