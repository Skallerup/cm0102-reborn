// 0x68d1b0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_68d1b0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x68d1b0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x68d1b0:
        R.edx = (R.m.u32(((R.ecx + 0xa) | 0) >>> 0)) | 0; // 68d1b0: mov edx, dword ptr [ecx + 0xa]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 68d1b3: test edx, edx
        if (R.zf) { pc = 0x68d1c0; continue; } // 68d1b5: je 0x68d1c0
        pc = 0x68d1b7; continue;
      case 0x68d1b7:
        R.eax = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 68d1b7: mov eax, dword ptr [edx]
        R.edx = (R.m.u32(((R.edx + 0x6) | 0) >>> 0)) | 0; // 68d1b9: mov edx, dword ptr [edx + 6]
        R.m.w32(((R.ecx + 0xa) | 0) >>> 0, (R.edx >>> 0)); // 68d1bc: mov dword ptr [ecx + 0xa], edx
        return R.ret(0); // 68d1bf: ret 
      case 0x68d1c0:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 68d1c0: xor eax, eax
        return R.ret(0); // 68d1c2: ret 
      default: throw new Error(`f_68d1b0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
