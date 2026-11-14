// 0x417c10 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_417c10(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x417c10;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x417c10:
        R.push((R.ecx >>> 0)); // 417c10: push ecx
        R.eax = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 417c11: mov eax, dword ptr [esp + 0xc]
        R.m.w32(((R.esp) | 0) >>> 0, 0x0); // 417c15: mov dword ptr [esp], 0
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.eax + 0x2) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 417c1d: mov dx, word ptr [eax + 2]
        R.m.w16(((R.ecx + 0x2) | 0) >>> 0, ((R.edx >>> 0) & 0xffff)); // 417c21: mov word ptr [ecx + 2], dx
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.eax) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 417c25: mov dx, word ptr [eax]
        R.m.w16(((R.ecx) | 0) >>> 0, ((R.edx >>> 0) & 0xffff)); // 417c28: mov word ptr [ecx], dx
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 417c2b: mov eax, dword ptr [eax + 4]
        R.m.w32(((R.ecx + 0x4) | 0) >>> 0, (R.eax >>> 0)); // 417c2e: mov dword ptr [ecx + 4], eax
        R.eax = (R.m.u32(((R.esp + 0x8) | 0) >>> 0)) | 0; // 417c31: mov eax, dword ptr [esp + 8]
        R.edx = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 417c35: mov edx, dword ptr [ecx]
        R.m.w32(((R.eax) | 0) >>> 0, (R.edx >>> 0)); // 417c37: mov dword ptr [eax], edx
        R.ecx = (R.m.u32(((R.ecx + 0x4) | 0) >>> 0)) | 0; // 417c39: mov ecx, dword ptr [ecx + 4]
        R.m.w32(((R.eax + 0x4) | 0) >>> 0, (R.ecx >>> 0)); // 417c3c: mov dword ptr [eax + 4], ecx
        R.ecx = (R.pop()) | 0; // 417c3f: pop ecx
        return R.ret(2); // 417c40: ret 8
      default: throw new Error(`f_417c10: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
