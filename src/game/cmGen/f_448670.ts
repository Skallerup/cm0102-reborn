// 0x448670 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 54a110=4t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_448670(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x448670;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x448670:
        R.push(0xffffffff); // 448670: push -1
        R.push(0x95549b); // 448672: push 0x95549b
        R.eax = (0) | 0; // 448677: mov eax, dword ptr fs:[0]
        R.push((R.eax >>> 0)); // 44867d: push eax
        /* fs */ // 44867e: mov dword ptr fs:[0], esp
        R.push((R.ecx >>> 0)); // 448685: push ecx
        R.push((R.esi >>> 0)); // 448686: push esi
        R.esi = ((R.ecx >>> 0)) | 0; // 448687: mov esi, ecx
        R.m.w32(((R.esp + 0x4) | 0) >>> 0, (R.esi >>> 0)); // 448689: mov dword ptr [esp + 4], esi
        R.ecx = (((R.esi + 0x4) | 0)) | 0; // 44868d: lea ecx, [esi + 4]
        R.call(0x54a110, { n: 0, thisEcx: true, calleeClean: false }); // 448690: call 0x54a110
        R.ecx = (((R.esi + 0xc) | 0)) | 0; // 448695: lea ecx, [esi + 0xc]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, 0x0); // 448698: mov dword ptr [esp + 0x10], 0
        R.call(0x54a110, { n: 4, thisEcx: true, calleeClean: false }); // 4486a0: call 0x54a110
        R.ecx = (R.m.u32(((R.esp + 0x8) | 0) >>> 0)) | 0; // 4486a5: mov ecx, dword ptr [esp + 8]
        R.eax = ((R.esi >>> 0)) | 0; // 4486a9: mov eax, esi
        R.esi = (R.pop()) | 0; // 4486ab: pop esi
        /* fs */ // 4486ac: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 4486b3: add esp, 0x10
        return R.eax; // 4486b6: ret 
      default: throw new Error(`f_448670: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
