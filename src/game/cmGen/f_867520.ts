// 0x867520 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 549c90=1, 867240=1tc
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_867520(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x867520;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x867520:
        R.push((R.esi >>> 0)); // 867520: push esi
        R.esi = ((R.ecx >>> 0)) | 0; // 867521: mov esi, ecx
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 867523: mov eax, dword ptr [esi]
        R.m.w32(((R.esi + 0x45) | 0) >>> 0, 0x0); // 867525: mov dword ptr [esi + 0x45], 0
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 86752c: lea ecx, [eax + eax*4]
        R.eax = (((R.eax + R.ecx * 2) | 0)) | 0; // 86752f: lea eax, [eax + ecx*2]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 867532: lea edx, [eax + eax*4]
        R.eax = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 867535: mov eax, dword ptr [0xae23bc]
        R.ecx = (((R.eax + R.edx * 2) | 0)) | 0; // 86753a: lea ecx, [eax + edx*2]
        R.push((R.ecx >>> 0)); // 86753d: push ecx
        R.call(0x549c90, { n: 1, thisEcx: false, calleeClean: false }); // 86753e: call 0x549c90
        R.eax = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 867543: mov eax, dword ptr [esp + 0xc]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 867547: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 86754a: test eax, eax
        if (R.zf) { pc = 0x867557; continue; } // 86754c: je 0x867557
        pc = 0x86754e; continue;
      case 0x86754e:
        R.push(0x0); // 86754e: push 0
        R.ecx = ((R.esi >>> 0)) | 0; // 867550: mov ecx, esi
        R.call(0x867240, { n: 1, thisEcx: true, calleeClean: true }); // 867552: call 0x867240
        pc = 0x867557; continue;
      case 0x867557:
        R.esi = (R.pop()) | 0; // 867557: pop esi
        return R.ret(1); // 867558: ret 4
      default: throw new Error(`f_867520: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
