// 0x7a7eb0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_7a7eb0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x7a7eb0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x7a7eb0:
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 7a7eb0: mov eax, dword ptr [esp + 4]
        R.edx = (R.m.u32(((0xae2d0c) | 0) >>> 0)) | 0; // 7a7eb4: mov edx, dword ptr [0xae2d0c]
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 7a7eba: mov eax, dword ptr [eax]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 7a7ebc: lea ecx, [eax + eax*4]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 7a7ebf: shl ecx, 4
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 7a7ec2: sub ecx, eax
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + R.edx + 0xb) | 0) >>> 0)) & 0xff) << 0)) | 0; // 7a7ec4: mov al, byte ptr [ecx + edx + 0xb]
        R.eax = ((R.eax & 0xffffff00) | (((R.shr(((R.eax >>> 0) & 0xff), 0x4, 8)) & 0xff) << 0)) | 0; // 7a7ec8: shr al, 4
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x3, 8)) & 0xff) << 0)) | 0; // 7a7ecb: and al, 3
        return R.eax; // 7a7ecd: ret 4
      default: throw new Error(`f_7a7eb0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
