// 0x544670 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x544670, 0x544679, 0x544689, 0x544690, 0x544698, 0x5446a0, 0x5446a8, 0x5446b0, 0x5446bc, 0x5446bf]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
function f_544670_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 544670
        R.sub(R.m.u8(((0xae233c) | 0) >>> 0), 0x1, 8); // 544670: cmp byte ptr [0xae233c], 1
        if (R.zf) { pc = 9; continue; } // 544677: je 0x5446bf
        pc = 1; continue;
      case 1: // 544679
        R.ecx = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 544679: mov ecx, dword ptr [esp + 4]
        R.edx = (R.m.u32(((0x9cf260) | 0) >>> 0)) | 0; // 54467d: mov edx, dword ptr [0x9cf260]
        R.eax = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 544683: mov eax, dword ptr [ecx]
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 544685: cmp eax, edx
        if (R.zf) { pc = 9; continue; } // 544687: je 0x5446bf
        pc = 2; continue;
      case 2: // 544689
        R.ecx = (R.m.u32(((R.ecx + 0x71) | 0) >>> 0)) | 0; // 544689: mov ecx, dword ptr [ecx + 0x71]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 54468c: test ecx, ecx
        if (R.zf) { pc = 8; continue; } // 54468e: je 0x5446bc
        pc = 3; continue;
      case 3: // 544690
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf430) | 0) >>> 0), 32); // 544690: cmp eax, dword ptr [0x9cf430]
        if (R.zf) { pc = 8; continue; } // 544696: je 0x5446bc
        pc = 4; continue;
      case 4: // 544698
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf4dc) | 0) >>> 0), 32); // 544698: cmp eax, dword ptr [0x9cf4dc]
        if (R.zf) { pc = 8; continue; } // 54469e: je 0x5446bc
        pc = 5; continue;
      case 5: // 5446a0
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf2ac) | 0) >>> 0), 32); // 5446a0: cmp eax, dword ptr [0x9cf2ac]
        if (R.zf) { pc = 8; continue; } // 5446a6: je 0x5446bc
        pc = 6; continue;
      case 6: // 5446a8
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf448) | 0) >>> 0), 32); // 5446a8: cmp eax, dword ptr [0x9cf448]
        if (R.zf) { pc = 8; continue; } // 5446ae: je 0x5446bc
        pc = 7; continue;
      case 7: // 5446b0
        R.eax = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 5446b0: mov eax, dword ptr [ecx]
        R.ecx = (R.m.u32(((0x9cfa10) | 0) >>> 0)) | 0; // 5446b2: mov ecx, dword ptr [0x9cfa10]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 5446b8: cmp eax, ecx
        if (R.zf) { pc = 9; continue; } // 5446ba: je 0x5446bf
        pc = 8; continue;
      case 8: // 5446bc
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 5446bc: xor eax, eax
        R.rv = R.ret(0); return -1; // 5446be: ret 
      case 9: // 5446bf
        R.eax = (0x1) | 0; // 5446bf: mov eax, 1
        R.rv = R.ret(0); return -1; // 5446c4: ret 
      default: return pc;
    }
  }
}
export function f_544670(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 10) throw new Error(`f_544670: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_544670_0(R, pc); break;
      default: throw new Error(`f_544670: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_544670: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_544670.shared = true;
