// 0x40a7d0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 549f70=4tc
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_40a7d0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x40a7d0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x40a7d0:
        R.push((R.ecx >>> 0)); // 40a7d0: push ecx
        R.eax = ((R.eax & 0xffff0000) | (((((R.m.u8(((R.ecx + 0x2) | 0) >>> 0)) << 24 >> 24)) & 0xffff) << 0)) | 0; // 40a7d1: movsx ax, byte ptr [ecx + 2]
        R.edx = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 40a7d6: mov edx, dword ptr [esp + 0xc]
        R.push((R.esi >>> 0)); // 40a7da: push esi
        R.esi = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 40a7db: mov esi, dword ptr [esp + 0xc]
        R.push((R.eax >>> 0)); // 40a7df: push eax
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + 0x4) | 0) >>> 0)) & 0xff) << 0)) | 0; // 40a7e0: mov al, byte ptr [ecx + 4]
        R.push((R.edx >>> 0)); // 40a7e3: push edx
        R.ecx = ((R.ecx & 0xffff0000) | (((((R.m.u8(((R.ecx + 0x3) | 0) >>> 0)) << 24 >> 24)) & 0xffff) << 0)) | 0; // 40a7e4: movsx cx, byte ptr [ecx + 3]
        R.push((R.eax >>> 0)); // 40a7e9: push eax
        R.push((R.ecx >>> 0)); // 40a7ea: push ecx
        R.ecx = ((R.esi >>> 0)) | 0; // 40a7eb: mov ecx, esi
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, 0x0); // 40a7ed: mov dword ptr [esp + 0x14], 0
        R.call(0x549f70, { n: 4, thisEcx: true, calleeClean: true }); // 40a7f5: call 0x549f70
        R.eax = ((R.esi >>> 0)) | 0; // 40a7fa: mov eax, esi
        R.esi = (R.pop()) | 0; // 40a7fc: pop esi
        R.ecx = (R.pop()) | 0; // 40a7fd: pop ecx
        return R.ret(2); // 40a7fe: ret 8
      default: throw new Error(`f_40a7d0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
