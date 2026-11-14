// 0x547840 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_547840(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x547840;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x547840:
        R.ecx = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 547840: mov ecx, dword ptr [esp + 4]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 547844: test ecx, ecx
        if (R.zf) { pc = 0x54786c; continue; } // 547846: je 0x54786c
        pc = 0x547848; continue;
      case 0x547848:
        R.eax = (R.m.u32(((R.esp + 0x8) | 0) >>> 0)) | 0; // 547848: mov eax, dword ptr [esp + 8]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 54784c: test eax, eax
        if (R.zf) { pc = 0x54786c; continue; } // 54784e: je 0x54786c
        pc = 0x547850; continue;
      case 0x547850:
        R.eax = (R.m.u32(((R.eax + 0x65) | 0) >>> 0)) | 0; // 547850: mov eax, dword ptr [eax + 0x65]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 547853: test eax, eax
        if (R.zf) { pc = 0x54786c; continue; } // 547855: je 0x54786c
        pc = 0x547857; continue;
      case 0x547857:
        R.sub(R.m.u32(((R.eax + 0x28) | 0) >>> 0), (R.ecx >>> 0), 32); // 547857: cmp dword ptr [eax + 0x28], ecx
        if (R.zf) { pc = 0x547866; continue; } // 54785a: je 0x547866
        pc = 0x54785c; continue;
      case 0x54785c:
        R.sub(R.m.u32(((R.eax + 0x2c) | 0) >>> 0), (R.ecx >>> 0), 32); // 54785c: cmp dword ptr [eax + 0x2c], ecx
        if (R.zf) { pc = 0x547866; continue; } // 54785f: je 0x547866
        pc = 0x547861; continue;
      case 0x547861:
        R.sub(R.m.u32(((R.eax + 0x30) | 0) >>> 0), (R.ecx >>> 0), 32); // 547861: cmp dword ptr [eax + 0x30], ecx
        if (!R.zf) { pc = 0x54786c; continue; } // 547864: jne 0x54786c
        pc = 0x547866; continue;
      case 0x547866:
        R.eax = (0x1) | 0; // 547866: mov eax, 1
        return R.eax; // 54786b: ret 
      case 0x54786c:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 54786c: xor eax, eax
        return R.eax; // 54786e: ret 
      default: throw new Error(`f_547840: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
