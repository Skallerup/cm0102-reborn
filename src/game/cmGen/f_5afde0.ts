// 0x5afde0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_5afde0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x5afde0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x5afde0:
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 5afde0: mov eax, dword ptr [esp + 4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5afde4: test eax, eax
        if (!R.zf) { pc = 0x5afdeb; continue; } // 5afde6: jne 0x5afdeb
        pc = 0x5afde8; continue;
      case 0x5afde8:
        return R.ret(1); // 5afde8: ret 4
      case 0x5afdeb:
        R.edx = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 5afdeb: mov edx, dword ptr [0xae2364]
        R.push((R.esi >>> 0)); // 5afdf1: push esi
        R.esi = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 5afdf2: mov esi, dword ptr [eax]
        R.edx = (R.sub((R.edx >>> 0), (R.esi >>> 0), 32)) | 0; // 5afdf4: sub edx, esi
        R.esi = (R.pop()) | 0; // 5afdf6: pop esi
        R.eax = (R.m.u32(((R.ecx + R.edx * 4 + -0x4) | 0) >>> 0)) | 0; // 5afdf7: mov eax, dword ptr [ecx + edx*4 - 4]
        return R.ret(1); // 5afdfb: ret 4
      default: throw new Error(`f_5afde0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
