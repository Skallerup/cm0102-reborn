// 0x7e6f20 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_7e6f20(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x7e6f20;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x7e6f20:
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 7e6f20: mov eax, dword ptr [esp + 4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 7e6f24: test eax, eax
        if (R.zf) { pc = 0x7e6f64; continue; } // 7e6f26: je 0x7e6f64
        pc = 0x7e6f28; continue;
      case 0x7e6f28:
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 7e6f28: mov eax, dword ptr [eax]
        R.ecx = (R.m.u32(((0x9cf794) | 0) >>> 0)) | 0; // 7e6f2a: mov ecx, dword ptr [0x9cf794]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 7e6f30: cmp eax, ecx
        if (R.zf) { pc = 0x7e6f5c; continue; } // 7e6f32: je 0x7e6f5c
        pc = 0x7e6f34; continue;
      case 0x7e6f34:
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf684) | 0) >>> 0), 32); // 7e6f34: cmp eax, dword ptr [0x9cf684]
        if (R.zf) { pc = 0x7e6f5c; continue; } // 7e6f3a: je 0x7e6f5c
        pc = 0x7e6f3c; continue;
      case 0x7e6f3c:
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf798) | 0) >>> 0), 32); // 7e6f3c: cmp eax, dword ptr [0x9cf798]
        if (R.zf) { pc = 0x7e6f5c; continue; } // 7e6f42: je 0x7e6f5c
        pc = 0x7e6f44; continue;
      case 0x7e6f44:
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf6b0) | 0) >>> 0), 32); // 7e6f44: cmp eax, dword ptr [0x9cf6b0]
        if (R.zf) { pc = 0x7e6f5c; continue; } // 7e6f4a: je 0x7e6f5c
        pc = 0x7e6f4c; continue;
      case 0x7e6f4c:
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf5d8) | 0) >>> 0), 32); // 7e6f4c: cmp eax, dword ptr [0x9cf5d8]
        if (R.zf) { pc = 0x7e6f5c; continue; } // 7e6f52: je 0x7e6f5c
        pc = 0x7e6f54; continue;
      case 0x7e6f54:
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf548) | 0) >>> 0), 32); // 7e6f54: cmp eax, dword ptr [0x9cf548]
        if (!R.zf) { pc = 0x7e6f64; continue; } // 7e6f5a: jne 0x7e6f64
        pc = 0x7e6f5c; continue;
      case 0x7e6f5c:
        R.eax = (0x1) | 0; // 7e6f5c: mov eax, 1
        return R.eax; // 7e6f61: ret 4
      case 0x7e6f64:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 7e6f64: xor eax, eax
        return R.eax; // 7e6f66: ret 4
      default: throw new Error(`f_7e6f20: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
