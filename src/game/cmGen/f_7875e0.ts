// 0x7875e0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 53ca90=1, 5fd210=1c, 600a50=5
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_7875e0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x7875e0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x7875e0:
        R.push((R.esi >>> 0)); // 7875e0: push esi
        R.esi = (R.m.u32(((R.esp + 0x8) | 0) >>> 0)) | 0; // 7875e1: mov esi, dword ptr [esp + 8]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 7875e5: test esi, esi
        if (!R.zf) { pc = 0x7875ef; continue; } // 7875e7: jne 0x7875ef
        pc = 0x7875e9; continue;
      case 0x7875e9:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 7875e9: xor eax, eax
        R.esi = (R.pop()) | 0; // 7875eb: pop esi
        return R.ret(1); // 7875ec: ret 4
      case 0x7875ef:
        R.push(0x0); // 7875ef: push 0
        R.push(0x0); // 7875f1: push 0
        R.push(0x1); // 7875f3: push 1
        R.push(0x1); // 7875f5: push 1
        R.push((R.esi >>> 0)); // 7875f7: push esi
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 7875f8: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 7875fd: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 787600: test eax, eax
        if (!R.zf) { pc = 0x787608; continue; } // 787602: jne 0x787608
        pc = 0x787604; continue;
      case 0x787604:
        R.esi = (R.pop()) | 0; // 787604: pop esi
        return R.ret(1); // 787605: ret 4
      case 0x787608:
        R.push((R.esi >>> 0)); // 787608: push esi
        R.call(0x53ca90, { n: 1, thisEcx: false, calleeClean: false }); // 787609: call 0x53ca90
        R.ecx = (R.m.u32(((0xb63c98) | 0) >>> 0)) | 0; // 78760e: mov ecx, dword ptr [0xb63c98]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 787614: add esp, 4
        R.push((R.eax >>> 0)); // 787617: push eax
        R.call(0x5fd210, { n: 1, thisEcx: false, calleeClean: true }); // 787618: call 0x5fd210
        R.eax = (0x1) | 0; // 78761d: mov eax, 1
        R.esi = (R.pop()) | 0; // 787622: pop esi
        return R.ret(1); // 787623: ret 4
      default: throw new Error(`f_7875e0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
