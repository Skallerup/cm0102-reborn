// 0x547d60 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_547d60(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x547d60;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x547d60:
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 547d60: mov eax, dword ptr [esp + 4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 547d64: test eax, eax
        if (R.zf) { pc = 0x547d8c; continue; } // 547d66: je 0x547d8c
        pc = 0x547d68; continue;
      case 0x547d68:
        R.eax = (R.m.u32(((R.eax + 0x65) | 0) >>> 0)) | 0; // 547d68: mov eax, dword ptr [eax + 0x65]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 547d6b: test eax, eax
        if (R.zf) { pc = 0x547d8c; continue; } // 547d6d: je 0x547d8c
        pc = 0x547d6f; continue;
      case 0x547d6f:
        R.ecx = (R.m.u32(((R.esp + 0x8) | 0) >>> 0)) | 0; // 547d6f: mov ecx, dword ptr [esp + 8]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 547d73: test ecx, ecx
        if (R.zf) { pc = 0x547d8c; continue; } // 547d75: je 0x547d8c
        pc = 0x547d77; continue;
      case 0x547d77:
        R.sub(R.m.u32(((R.eax + 0x4) | 0) >>> 0), (R.ecx >>> 0), 32); // 547d77: cmp dword ptr [eax + 4], ecx
        if (R.zf) { pc = 0x547d86; continue; } // 547d7a: je 0x547d86
        pc = 0x547d7c; continue;
      case 0x547d7c:
        R.sub(R.m.u32(((R.eax + 0x8) | 0) >>> 0), (R.ecx >>> 0), 32); // 547d7c: cmp dword ptr [eax + 8], ecx
        if (R.zf) { pc = 0x547d86; continue; } // 547d7f: je 0x547d86
        pc = 0x547d81; continue;
      case 0x547d81:
        R.sub(R.m.u32(((R.eax + 0xc) | 0) >>> 0), (R.ecx >>> 0), 32); // 547d81: cmp dword ptr [eax + 0xc], ecx
        if (!R.zf) { pc = 0x547d8c; continue; } // 547d84: jne 0x547d8c
        pc = 0x547d86; continue;
      case 0x547d86:
        R.eax = (0x1) | 0; // 547d86: mov eax, 1
        return R.eax; // 547d8b: ret 
      case 0x547d8c:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 547d8c: xor eax, eax
        return R.eax; // 547d8e: ret 
      default: throw new Error(`f_547d60: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
