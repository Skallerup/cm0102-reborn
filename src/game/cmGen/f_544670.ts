// 0x544670 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_544670(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x544670;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x544670:
        R.sub(R.m.u8(((0xae233c) | 0) >>> 0), 0x1, 8); // 544670: cmp byte ptr [0xae233c], 1
        if (R.zf) { pc = 0x5446bf; continue; } // 544677: je 0x5446bf
        pc = 0x544679; continue;
      case 0x544679:
        R.ecx = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 544679: mov ecx, dword ptr [esp + 4]
        R.edx = (R.m.u32(((0x9cf260) | 0) >>> 0)) | 0; // 54467d: mov edx, dword ptr [0x9cf260]
        R.eax = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 544683: mov eax, dword ptr [ecx]
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 544685: cmp eax, edx
        if (R.zf) { pc = 0x5446bf; continue; } // 544687: je 0x5446bf
        pc = 0x544689; continue;
      case 0x544689:
        R.ecx = (R.m.u32(((R.ecx + 0x71) | 0) >>> 0)) | 0; // 544689: mov ecx, dword ptr [ecx + 0x71]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 54468c: test ecx, ecx
        if (R.zf) { pc = 0x5446bc; continue; } // 54468e: je 0x5446bc
        pc = 0x544690; continue;
      case 0x544690:
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf430) | 0) >>> 0), 32); // 544690: cmp eax, dword ptr [0x9cf430]
        if (R.zf) { pc = 0x5446bc; continue; } // 544696: je 0x5446bc
        pc = 0x544698; continue;
      case 0x544698:
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf4dc) | 0) >>> 0), 32); // 544698: cmp eax, dword ptr [0x9cf4dc]
        if (R.zf) { pc = 0x5446bc; continue; } // 54469e: je 0x5446bc
        pc = 0x5446a0; continue;
      case 0x5446a0:
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf2ac) | 0) >>> 0), 32); // 5446a0: cmp eax, dword ptr [0x9cf2ac]
        if (R.zf) { pc = 0x5446bc; continue; } // 5446a6: je 0x5446bc
        pc = 0x5446a8; continue;
      case 0x5446a8:
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf448) | 0) >>> 0), 32); // 5446a8: cmp eax, dword ptr [0x9cf448]
        if (R.zf) { pc = 0x5446bc; continue; } // 5446ae: je 0x5446bc
        pc = 0x5446b0; continue;
      case 0x5446b0:
        R.eax = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 5446b0: mov eax, dword ptr [ecx]
        R.ecx = (R.m.u32(((0x9cfa10) | 0) >>> 0)) | 0; // 5446b2: mov ecx, dword ptr [0x9cfa10]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 5446b8: cmp eax, ecx
        if (R.zf) { pc = 0x5446bf; continue; } // 5446ba: je 0x5446bf
        pc = 0x5446bc; continue;
      case 0x5446bc:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 5446bc: xor eax, eax
        return R.ret(0); // 5446be: ret 
      case 0x5446bf:
        R.eax = (0x1) | 0; // 5446bf: mov eax, 1
        return R.ret(0); // 5446c4: ret 
      default: throw new Error(`f_544670: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
