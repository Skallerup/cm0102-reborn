// 0x8e82f0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 68d1b0=0t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_8e82f0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x8e82f0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x8e82f0:
        R.push((R.esi >>> 0)); // 8e82f0: push esi
        R.esi = ((R.ecx >>> 0)) | 0; // 8e82f1: mov esi, ecx
        R.push((R.edi >>> 0)); // 8e82f3: push edi
        R.eax = (R.m.u32(((R.esi + 0x4) | 0) >>> 0)) | 0; // 8e82f4: mov eax, dword ptr [esi + 4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e82f7: test eax, eax
        if (R.zf) { pc = 0x8e8325; continue; } // 8e82f9: je 0x8e8325
        pc = 0x8e82fb; continue;
      case 0x8e82fb:
        R.ecx = (R.m.u32(((R.eax + 0x2) | 0) >>> 0)) | 0; // 8e82fb: mov ecx, dword ptr [eax + 2]
        R.m.w32(((R.eax + 0xa) | 0) >>> 0, (R.ecx >>> 0)); // 8e82fe: mov dword ptr [eax + 0xa], ecx
        R.ecx = (R.m.u32(((R.esi + 0x4) | 0) >>> 0)) | 0; // 8e8301: mov ecx, dword ptr [esi + 4]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8e8304: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e8309: test eax, eax
        if (R.zf) { pc = 0x8e8325; continue; } // 8e830b: je 0x8e8325
        pc = 0x8e830d; continue;
      case 0x8e830d:
        R.edi = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 8e830d: mov edi, dword ptr [esp + 0xc]
        pc = 0x8e8311; continue;
      case 0x8e8311:
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8e8311: mov edx, dword ptr [eax]
        R.ecx = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 8e8313: mov ecx, dword ptr [edi]
        R.sub((R.edx >>> 0), (R.ecx >>> 0), 32); // 8e8315: cmp edx, ecx
        if (R.zf) { pc = 0x8e8327; continue; } // 8e8317: je 0x8e8327
        pc = 0x8e8319; continue;
      case 0x8e8319:
        R.ecx = (R.m.u32(((R.esi + 0x4) | 0) >>> 0)) | 0; // 8e8319: mov ecx, dword ptr [esi + 4]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8e831c: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e8321: test eax, eax
        if (!R.zf) { pc = 0x8e8311; continue; } // 8e8323: jne 0x8e8311
        pc = 0x8e8325; continue;
      case 0x8e8325:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8e8325: xor eax, eax
        pc = 0x8e8327; continue;
      case 0x8e8327:
        R.edi = (R.pop()) | 0; // 8e8327: pop edi
        R.esi = (R.pop()) | 0; // 8e8328: pop esi
        return R.eax; // 8e8329: ret 4
      default: throw new Error(`f_8e82f0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
