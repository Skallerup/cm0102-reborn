// 0x5446d0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_5446d0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x5446d0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x5446d0:
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 5446d0: mov eax, dword ptr [esp + 4]
        R.ecx = (R.m.u32(((0x9cf2e4) | 0) >>> 0)) | 0; // 5446d4: mov ecx, dword ptr [0x9cf2e4]
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 5446da: mov eax, dword ptr [eax]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 5446dc: cmp eax, ecx
        if (R.zf) { pc = 0x544703; continue; } // 5446de: je 0x544703
        pc = 0x5446e0; continue;
      case 0x5446e0:
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf45c) | 0) >>> 0), 32); // 5446e0: cmp eax, dword ptr [0x9cf45c]
        if (R.zf) { pc = 0x544703; continue; } // 5446e6: je 0x544703
        pc = 0x5446e8; continue;
      case 0x5446e8:
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf2dc) | 0) >>> 0), 32); // 5446e8: cmp eax, dword ptr [0x9cf2dc]
        if (R.zf) { pc = 0x544703; continue; } // 5446ee: je 0x544703
        pc = 0x5446f0; continue;
      case 0x5446f0:
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf510) | 0) >>> 0), 32); // 5446f0: cmp eax, dword ptr [0x9cf510]
        if (R.zf) { pc = 0x544703; continue; } // 5446f6: je 0x544703
        pc = 0x5446f8; continue;
      case 0x5446f8:
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf3e4) | 0) >>> 0), 32); // 5446f8: cmp eax, dword ptr [0x9cf3e4]
        if (R.zf) { pc = 0x544703; continue; } // 5446fe: je 0x544703
        pc = 0x544700; continue;
      case 0x544700:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 544700: xor eax, eax
        return R.ret(0); // 544702: ret 
      case 0x544703:
        R.eax = (0x1) | 0; // 544703: mov eax, 1
        return R.ret(0); // 544708: ret 
      default: throw new Error(`f_5446d0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
