// 0x4cc9e0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 68d1b0=0t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_4cc9e0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x4cc9e0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x4cc9e0:
        R.push((R.ebx >>> 0)); // 4cc9e0: push ebx
        R.push((R.esi >>> 0)); // 4cc9e1: push esi
        R.esi = ((R.ecx >>> 0)) | 0; // 4cc9e2: mov esi, ecx
        R.push((R.edi >>> 0)); // 4cc9e4: push edi
        R.eax = (R.m.u32(((R.esi + 0x34) | 0) >>> 0)) | 0; // 4cc9e5: mov eax, dword ptr [esi + 0x34]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4cc9e8: test eax, eax
        if (R.zf) { pc = 0x4cca1b; continue; } // 4cc9ea: je 0x4cca1b
        pc = 0x4cc9ec; continue;
      case 0x4cc9ec:
        R.ecx = (R.m.u32(((R.eax + 0x2) | 0) >>> 0)) | 0; // 4cc9ec: mov ecx, dword ptr [eax + 2]
        R.m.w32(((R.eax + 0xa) | 0) >>> 0, (R.ecx >>> 0)); // 4cc9ef: mov dword ptr [eax + 0xa], ecx
        R.ecx = (R.m.u32(((R.esi + 0x34) | 0) >>> 0)) | 0; // 4cc9f2: mov ecx, dword ptr [esi + 0x34]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 4cc9f5: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4cc9fa: test eax, eax
        if (R.zf) { pc = 0x4cca1b; continue; } // 4cc9fc: je 0x4cca1b
        pc = 0x4cc9fe; continue;
      case 0x4cc9fe:
        R.edi = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 4cc9fe: mov edi, dword ptr [esp + 0x14]
        R.ebx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 4cca02: mov ebx, dword ptr [esp + 0x10]
        pc = 0x4cca06; continue;
      case 0x4cca06:
        R.sub(R.m.u32(((R.eax) | 0) >>> 0), (R.ebx >>> 0), 32); // 4cca06: cmp dword ptr [eax], ebx
        if (!R.zf) { pc = 0x4cca0f; continue; } // 4cca08: jne 0x4cca0f
        pc = 0x4cca0a; continue;
      case 0x4cca0a:
        R.sub(R.m.u32(((R.eax + 0x4) | 0) >>> 0), (R.edi >>> 0), 32); // 4cca0a: cmp dword ptr [eax + 4], edi
        if (R.zf) { pc = 0x4cca1d; continue; } // 4cca0d: je 0x4cca1d
        pc = 0x4cca0f; continue;
      case 0x4cca0f:
        R.ecx = (R.m.u32(((R.esi + 0x34) | 0) >>> 0)) | 0; // 4cca0f: mov ecx, dword ptr [esi + 0x34]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 4cca12: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4cca17: test eax, eax
        if (!R.zf) { pc = 0x4cca06; continue; } // 4cca19: jne 0x4cca06
        pc = 0x4cca1b; continue;
      case 0x4cca1b:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 4cca1b: xor eax, eax
        pc = 0x4cca1d; continue;
      case 0x4cca1d:
        R.edi = (R.pop()) | 0; // 4cca1d: pop edi
        R.esi = (R.pop()) | 0; // 4cca1e: pop esi
        R.ebx = (R.pop()) | 0; // 4cca1f: pop ebx
        return R.ret(2); // 4cca20: ret 8
      default: throw new Error(`f_4cc9e0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
