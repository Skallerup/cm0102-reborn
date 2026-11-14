// 0x5477d0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x5477d0, 0x5477d8, 0x5477e0, 0x5477e8, 0x5477f0, 0x5477f8, 0x5477fe]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 0]);
function f_5477d0_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 5477d0
        R.ecx = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 5477d0: mov ecx, dword ptr [esp + 4]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 5477d4: test ecx, ecx
        if (R.zf) { pc = 6; continue; } // 5477d6: je 0x5477fe
        pc = 1; continue;
      case 1: // 5477d8
        R.eax = (R.m.u32(((R.esp + 0x8) | 0) >>> 0)) | 0; // 5477d8: mov eax, dword ptr [esp + 8]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5477dc: test eax, eax
        if (R.zf) { pc = 6; continue; } // 5477de: je 0x5477fe
        pc = 2; continue;
      case 2: // 5477e0
        R.sub(R.m.u32(((R.eax + 0xa7) | 0) >>> 0), (R.ecx >>> 0), 32); // 5477e0: cmp dword ptr [eax + 0xa7], ecx
        if (R.zf) { pc = 5; continue; } // 5477e6: je 0x5477f8
        pc = 3; continue;
      case 3: // 5477e8
        R.sub(R.m.u32(((R.eax + 0xab) | 0) >>> 0), (R.ecx >>> 0), 32); // 5477e8: cmp dword ptr [eax + 0xab], ecx
        if (R.zf) { pc = 5; continue; } // 5477ee: je 0x5477f8
        pc = 4; continue;
      case 4: // 5477f0
        R.sub(R.m.u32(((R.eax + 0xaf) | 0) >>> 0), (R.ecx >>> 0), 32); // 5477f0: cmp dword ptr [eax + 0xaf], ecx
        if (!R.zf) { pc = 6; continue; } // 5477f6: jne 0x5477fe
        pc = 5; continue;
      case 5: // 5477f8
        R.eax = (0x1) | 0; // 5477f8: mov eax, 1
        R.rv = R.ret(0); return -1; // 5477fd: ret 
      case 6: // 5477fe
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 5477fe: xor eax, eax
        R.rv = R.ret(0); return -1; // 547800: ret 
      default: return pc;
    }
  }
}
export function f_5477d0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 7) throw new Error(`f_5477d0: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_5477d0_0(R, pc); break;
      default: throw new Error(`f_5477d0: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_5477d0: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_5477d0.shared = true;
