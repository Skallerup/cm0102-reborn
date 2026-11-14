// 0x456740 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_456740(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x456740;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x456740:
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.ecx + 0x2) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 456740: mov ax, word ptr [ecx + 2]
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.esp + 0x6) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 456744: mov dx, word ptr [esp + 6]
        R.sub(((R.edx >>> 0) & 0xffff), ((R.eax >>> 0) & 0xffff), 16); // 456749: cmp dx, ax
        if (!R.cf) { pc = 0x456756; continue; } // 45674c: jae 0x456756
        pc = 0x45674e; continue;
      case 0x45674e:
        R.eax = (0x1) | 0; // 45674e: mov eax, 1
        return R.ret(2); // 456753: ret 8
      case 0x456756:
        if (R.cBE) { pc = 0x45675d; continue; } // 456756: jbe 0x45675d
        pc = 0x456758; continue;
      case 0x456758:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 456758: xor eax, eax
        return R.ret(2); // 45675a: ret 8
      case 0x45675d:
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.esp + 0x4) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 45675d: mov dx, word ptr [esp + 4]
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 456762: xor eax, eax
        R.sub(((R.edx >>> 0) & 0xffff), R.m.u16(((R.ecx) | 0) >>> 0), 16); // 456764: cmp dx, word ptr [ecx]
        R.eax = ((R.eax & 0xffffff00) | (((R.cL ? 1 : 0) & 0xff) << 0)) | 0; // 456767: setl al
        return R.ret(2); // 45676a: ret 8
      default: throw new Error(`f_456740: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
