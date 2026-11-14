// 0x7ae950 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 53e990=5
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_7ae950(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x7ae950;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x7ae950:
        R.push((R.esi >>> 0)); // 7ae950: push esi
        R.esi = ((R.ecx >>> 0)) | 0; // 7ae951: mov esi, ecx
        R.eax = (R.m.u32(((R.esi + 0x180) | 0) >>> 0)) | 0; // 7ae953: mov eax, dword ptr [esi + 0x180]
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 7ae959: cmp eax, -1
        if (R.cLE) { pc = 0x7ae9b2; continue; } // 7ae95c: jle 0x7ae9b2
        pc = 0x7ae95e; continue;
      case 0x7ae95e:
        R.edx = (R.m.u32(((R.esi + 0x17c) | 0) >>> 0)) | 0; // 7ae95e: mov edx, dword ptr [esi + 0x17c]
        R.ecx = (((R.esi + 0x184) | 0)) | 0; // 7ae964: lea ecx, [esi + 0x184]
        R.push((R.ecx >>> 0)); // 7ae96a: push ecx
        R.ecx = (R.m.u32(((R.esi + 0x178) | 0) >>> 0)) | 0; // 7ae96b: mov ecx, dword ptr [esi + 0x178]
        R.push((R.edx >>> 0)); // 7ae971: push edx
        R.edx = (R.m.u32(((R.esi + 0x174) | 0) >>> 0)) | 0; // 7ae972: mov edx, dword ptr [esi + 0x174]
        R.push((R.ecx >>> 0)); // 7ae978: push ecx
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 7ae979: lea ecx, [eax + eax*4]
        R.push((R.edx >>> 0)); // 7ae97c: push edx
        R.eax = (((R.eax + R.ecx * 2) | 0)) | 0; // 7ae97d: lea eax, [eax + ecx*2]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 7ae980: lea edx, [eax + eax*4]
        R.eax = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 7ae983: mov eax, dword ptr [0xae23bc]
        R.ecx = (((R.eax + R.edx * 2) | 0)) | 0; // 7ae988: lea ecx, [eax + edx*2]
        R.push((R.ecx >>> 0)); // 7ae98b: push ecx
        R.call(0x53e990, { n: 5, thisEcx: false, calleeClean: false }); // 7ae98c: call 0x53e990
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 7ae991: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 7ae994: test eax, eax
        if (R.zf) { pc = 0x7ae9b2; continue; } // 7ae996: je 0x7ae9b2
        pc = 0x7ae998; continue;
      case 0x7ae998:
        R.esi = (R.m.u32(((R.esi + 0x180) | 0) >>> 0)) | 0; // 7ae998: mov esi, dword ptr [esi + 0x180]
        R.ecx = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 7ae99e: mov ecx, dword ptr [0xae23bc]
        R.edx = (((R.esi + R.esi * 4) | 0)) | 0; // 7ae9a4: lea edx, [esi + esi*4]
        R.eax = (((R.esi + R.edx * 2) | 0)) | 0; // 7ae9a7: lea eax, [esi + edx*2]
        R.esi = (R.pop()) | 0; // 7ae9aa: pop esi
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 7ae9ab: lea eax, [eax + eax*4]
        R.eax = (((R.ecx + R.eax * 2) | 0)) | 0; // 7ae9ae: lea eax, [ecx + eax*2]
        return R.eax; // 7ae9b1: ret 
      case 0x7ae9b2:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 7ae9b2: xor eax, eax
        R.esi = (R.pop()) | 0; // 7ae9b4: pop esi
        return R.eax; // 7ae9b5: ret 
      default: throw new Error(`f_7ae950: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
