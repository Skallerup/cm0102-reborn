// 0x547d30 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_547d30(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x547d30;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x547d30:
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 547d30: mov eax, dword ptr [esp + 4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 547d34: test eax, eax
        if (R.zf) { pc = 0x547d5c; continue; } // 547d36: je 0x547d5c
        pc = 0x547d38; continue;
      case 0x547d38:
        R.eax = (R.m.u32(((R.eax + 0x65) | 0) >>> 0)) | 0; // 547d38: mov eax, dword ptr [eax + 0x65]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 547d3b: test eax, eax
        if (R.zf) { pc = 0x547d5c; continue; } // 547d3d: je 0x547d5c
        pc = 0x547d3f; continue;
      case 0x547d3f:
        R.ecx = (R.m.u32(((R.esp + 0x8) | 0) >>> 0)) | 0; // 547d3f: mov ecx, dword ptr [esp + 8]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 547d43: test ecx, ecx
        if (R.zf) { pc = 0x547d5c; continue; } // 547d45: je 0x547d5c
        pc = 0x547d47; continue;
      case 0x547d47:
        R.sub(R.m.u32(((R.eax + 0x10) | 0) >>> 0), (R.ecx >>> 0), 32); // 547d47: cmp dword ptr [eax + 0x10], ecx
        if (R.zf) { pc = 0x547d56; continue; } // 547d4a: je 0x547d56
        pc = 0x547d4c; continue;
      case 0x547d4c:
        R.sub(R.m.u32(((R.eax + 0x14) | 0) >>> 0), (R.ecx >>> 0), 32); // 547d4c: cmp dword ptr [eax + 0x14], ecx
        if (R.zf) { pc = 0x547d56; continue; } // 547d4f: je 0x547d56
        pc = 0x547d51; continue;
      case 0x547d51:
        R.sub(R.m.u32(((R.eax + 0x18) | 0) >>> 0), (R.ecx >>> 0), 32); // 547d51: cmp dword ptr [eax + 0x18], ecx
        if (!R.zf) { pc = 0x547d5c; continue; } // 547d54: jne 0x547d5c
        pc = 0x547d56; continue;
      case 0x547d56:
        R.eax = (0x1) | 0; // 547d56: mov eax, 1
        return R.ret(0); // 547d5b: ret 
      case 0x547d5c:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 547d5c: xor eax, eax
        return R.ret(0); // 547d5e: ret 
      default: throw new Error(`f_547d30: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
