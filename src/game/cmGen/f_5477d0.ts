// 0x5477d0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_5477d0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x5477d0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x5477d0:
        R.ecx = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 5477d0: mov ecx, dword ptr [esp + 4]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 5477d4: test ecx, ecx
        if (R.zf) { pc = 0x5477fe; continue; } // 5477d6: je 0x5477fe
        pc = 0x5477d8; continue;
      case 0x5477d8:
        R.eax = (R.m.u32(((R.esp + 0x8) | 0) >>> 0)) | 0; // 5477d8: mov eax, dword ptr [esp + 8]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5477dc: test eax, eax
        if (R.zf) { pc = 0x5477fe; continue; } // 5477de: je 0x5477fe
        pc = 0x5477e0; continue;
      case 0x5477e0:
        R.sub(R.m.u32(((R.eax + 0xa7) | 0) >>> 0), (R.ecx >>> 0), 32); // 5477e0: cmp dword ptr [eax + 0xa7], ecx
        if (R.zf) { pc = 0x5477f8; continue; } // 5477e6: je 0x5477f8
        pc = 0x5477e8; continue;
      case 0x5477e8:
        R.sub(R.m.u32(((R.eax + 0xab) | 0) >>> 0), (R.ecx >>> 0), 32); // 5477e8: cmp dword ptr [eax + 0xab], ecx
        if (R.zf) { pc = 0x5477f8; continue; } // 5477ee: je 0x5477f8
        pc = 0x5477f0; continue;
      case 0x5477f0:
        R.sub(R.m.u32(((R.eax + 0xaf) | 0) >>> 0), (R.ecx >>> 0), 32); // 5477f0: cmp dword ptr [eax + 0xaf], ecx
        if (!R.zf) { pc = 0x5477fe; continue; } // 5477f6: jne 0x5477fe
        pc = 0x5477f8; continue;
      case 0x5477f8:
        R.eax = (0x1) | 0; // 5477f8: mov eax, 1
        return R.ret(0); // 5477fd: ret 
      case 0x5477fe:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 5477fe: xor eax, eax
        return R.ret(0); // 547800: ret 
      default: throw new Error(`f_5477d0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
