// 0x8c5430 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_8c5430(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x8c5430;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x8c5430:
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 8c5430: mov eax, dword ptr [esp + 4]
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8c5434: mov edx, dword ptr [eax]
        R.eax = (R.m.u32(((R.ecx + 0x86e) | 0) >>> 0)) | 0; // 8c5436: mov eax, dword ptr [ecx + 0x86e]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + R.edx * 8) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8c543c: mov cl, byte ptr [eax + edx*8]
        R.eax = (((R.eax + R.edx * 8) | 0)) | 0; // 8c543f: lea eax, [eax + edx*8]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0xbf, 8)) & 0xff) << 0)) | 0; // 8c5442: and cl, 0xbf
        R.m.w8(((R.eax) | 0) >>> 0, ((R.ecx >>> 0) & 0xff)); // 8c5445: mov byte ptr [eax], cl
        return R.ret(1); // 8c5447: ret 4
      default: throw new Error(`f_8c5430: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
