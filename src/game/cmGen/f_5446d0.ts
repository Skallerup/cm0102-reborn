// 0x5446d0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x5446d0, 0x5446e0, 0x5446e8, 0x5446f0, 0x5446f8, 0x544700, 0x544703]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 0]);
function f_5446d0_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 5446d0
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 5446d0: mov eax, dword ptr [esp + 4]
        R.ecx = (R.m.u32(((0x9cf2e4) | 0) >>> 0)) | 0; // 5446d4: mov ecx, dword ptr [0x9cf2e4]
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 5446da: mov eax, dword ptr [eax]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 5446dc: cmp eax, ecx
        if (R.zf) { pc = 6; continue; } // 5446de: je 0x544703
        pc = 1; continue;
      case 1: // 5446e0
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf45c) | 0) >>> 0), 32); // 5446e0: cmp eax, dword ptr [0x9cf45c]
        if (R.zf) { pc = 6; continue; } // 5446e6: je 0x544703
        pc = 2; continue;
      case 2: // 5446e8
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf2dc) | 0) >>> 0), 32); // 5446e8: cmp eax, dword ptr [0x9cf2dc]
        if (R.zf) { pc = 6; continue; } // 5446ee: je 0x544703
        pc = 3; continue;
      case 3: // 5446f0
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf510) | 0) >>> 0), 32); // 5446f0: cmp eax, dword ptr [0x9cf510]
        if (R.zf) { pc = 6; continue; } // 5446f6: je 0x544703
        pc = 4; continue;
      case 4: // 5446f8
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf3e4) | 0) >>> 0), 32); // 5446f8: cmp eax, dword ptr [0x9cf3e4]
        if (R.zf) { pc = 6; continue; } // 5446fe: je 0x544703
        pc = 5; continue;
      case 5: // 544700
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 544700: xor eax, eax
        R.rv = R.ret(0); return -1; // 544702: ret 
      case 6: // 544703
        R.eax = (0x1) | 0; // 544703: mov eax, 1
        R.rv = R.ret(0); return -1; // 544708: ret 
      default: return pc;
    }
  }
}
export function f_5446d0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 7) throw new Error(`f_5446d0: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_5446d0_0(R, pc); break;
      default: throw new Error(`f_5446d0: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_5446d0: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_5446d0.shared = true;
