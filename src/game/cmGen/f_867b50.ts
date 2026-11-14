// 0x867b50 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_867b50(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x867b50;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x867b50:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.ecx + 0x1c) | 0) >>> 0)) & 0xff) << 0)) | 0; // 867b50: mov dl, byte ptr [ecx + 0x1c]
        R.eax = ((R.eax & 0xffffff00) | (((0x2) & 0xff) << 0)) | 0; // 867b53: mov al, 2
        R.sub(((R.edx >>> 0) & 0xff), ((R.eax >>> 0) & 0xff), 8); // 867b55: cmp dl, al
        if (R.zf) { pc = 0x867b67; continue; } // 867b57: je 0x867b67
        pc = 0x867b59; continue;
      case 0x867b59:
        R.sub(R.m.u8(((R.ecx + 0x1d) | 0) >>> 0), 0x1, 8); // 867b59: cmp byte ptr [ecx + 0x1d], 1
        if (R.zf) { pc = 0x867b67; continue; } // 867b5d: je 0x867b67
        pc = 0x867b5f; continue;
      case 0x867b5f:
        R.sub(R.m.u8(((R.ecx + 0x1f) | 0) >>> 0), ((R.eax >>> 0) & 0xff), 8); // 867b5f: cmp byte ptr [ecx + 0x1f], al
        if (R.zf) { pc = 0x867b67; continue; } // 867b62: je 0x867b67
        pc = 0x867b64; continue;
      case 0x867b64:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 867b64: xor eax, eax
        return R.ret(0); // 867b66: ret 
      case 0x867b67:
        R.eax = (0x1) | 0; // 867b67: mov eax, 1
        return R.ret(0); // 867b6c: ret 
      default: throw new Error(`f_867b50: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
