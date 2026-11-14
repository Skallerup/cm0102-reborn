// 0x8c1870 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 68d1b0=0t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_8c1870(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x8c1870;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x8c1870:
        R.eax = (R.m.u32(((R.ecx + 0x92e) | 0) >>> 0)) | 0; // 8c1870: mov eax, dword ptr [ecx + 0x92e]
        R.push((R.esi >>> 0)); // 8c1876: push esi
        R.esi = (((R.ecx + 0x92c) | 0)) | 0; // 8c1877: lea esi, [ecx + 0x92c]
        R.push((R.edi >>> 0)); // 8c187d: push edi
        R.ecx = ((R.esi >>> 0)) | 0; // 8c187e: mov ecx, esi
        R.m.w32(((R.esi + 0xa) | 0) >>> 0, (R.eax >>> 0)); // 8c1880: mov dword ptr [esi + 0xa], eax
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8c1883: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c1888: test eax, eax
        if (R.zf) { pc = 0x8c18a3; continue; } // 8c188a: je 0x8c18a3
        pc = 0x8c188c; continue;
      case 0x8c188c:
        R.edi = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 8c188c: mov edi, dword ptr [esp + 0xc]
        pc = 0x8c1890; continue;
      case 0x8c1890:
        R.ecx = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 8c1890: mov ecx, dword ptr [edi]
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8c1892: mov edx, dword ptr [eax]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 8c1894: cmp ecx, edx
        if (R.zf) { pc = 0x8c18aa; continue; } // 8c1896: je 0x8c18aa
        pc = 0x8c1898; continue;
      case 0x8c1898:
        R.ecx = ((R.esi >>> 0)) | 0; // 8c1898: mov ecx, esi
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8c189a: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c189f: test eax, eax
        if (!R.zf) { pc = 0x8c1890; continue; } // 8c18a1: jne 0x8c1890
        pc = 0x8c18a3; continue;
      case 0x8c18a3:
        R.edi = (R.pop()) | 0; // 8c18a3: pop edi
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8c18a4: xor eax, eax
        R.esi = (R.pop()) | 0; // 8c18a6: pop esi
        return R.eax; // 8c18a7: ret 4
      case 0x8c18aa:
        R.edi = (R.pop()) | 0; // 8c18aa: pop edi
        R.eax = (0x1) | 0; // 8c18ab: mov eax, 1
        R.esi = (R.pop()) | 0; // 8c18b0: pop esi
        return R.eax; // 8c18b1: ret 4
      default: throw new Error(`f_8c1870: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
