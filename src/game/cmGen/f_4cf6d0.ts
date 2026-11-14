// 0x4cf6d0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_4cf6d0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x4cf6d0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x4cf6d0:
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 4cf6d0: mov eax, dword ptr [esp + 4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4cf6d4: test eax, eax
        if (!R.zf) { pc = 0x4cf6db; continue; } // 4cf6d6: jne 0x4cf6db
        pc = 0x4cf6d8; continue;
      case 0x4cf6d8:
        return R.eax; // 4cf6d8: ret 4
      case 0x4cf6db:
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 4cf6db: mov eax, dword ptr [eax]
        R.edx = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 4cf6dd: mov edx, dword ptr [0xae2364]
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 4cf6e3: cmp eax, edx
        if (R.cL) { pc = 0x4cf6ec; continue; } // 4cf6e5: jl 0x4cf6ec
        pc = 0x4cf6e7; continue;
      case 0x4cf6e7:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 4cf6e7: xor eax, eax
        return R.eax; // 4cf6e9: ret 4
      case 0x4cf6ec:
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 4cf6ec: lea edx, [eax + eax*4]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 4cf6ef: shl edx, 4
        R.edx = (R.sub((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 4cf6f2: sub edx, eax
        R.eax = (R.m.u32(((0xae2d0c) | 0) >>> 0)) | 0; // 4cf6f4: mov eax, dword ptr [0xae2d0c]
        R.eax = (R.m.u32(((R.edx + R.eax + 0x4) | 0) >>> 0)) | 0; // 4cf6f9: mov eax, dword ptr [edx + eax + 4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4cf6fd: test eax, eax
        if (!R.cL) { pc = 0x4cf706; continue; } // 4cf6ff: jge 0x4cf706
        pc = 0x4cf701; continue;
      case 0x4cf701:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 4cf701: xor eax, eax
        return R.eax; // 4cf703: ret 4
      case 0x4cf706:
        R.edx = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 4cf706: mov edx, dword ptr [ecx]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4cf708: lea eax, [eax + eax*4]
        R.eax = (R.shl((R.eax >>> 0), 0x4, 32)) | 0; // 4cf70b: shl eax, 4
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 4cf70e: add eax, edx
        return R.eax; // 4cf710: ret 4
      default: throw new Error(`f_4cf6d0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
