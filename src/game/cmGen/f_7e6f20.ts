// 0x7e6f20 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x7e6f20, 0x7e6f28, 0x7e6f34, 0x7e6f3c, 0x7e6f44, 0x7e6f4c, 0x7e6f54, 0x7e6f5c, 0x7e6f64]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0]);
function f_7e6f20_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 7e6f20
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 7e6f20: mov eax, dword ptr [esp + 4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 7e6f24: test eax, eax
        if (R.zf) { pc = 8; continue; } // 7e6f26: je 0x7e6f64
        pc = 1; continue;
      case 1: // 7e6f28
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 7e6f28: mov eax, dword ptr [eax]
        R.ecx = (R.m.u32(((0x9cf794) | 0) >>> 0)) | 0; // 7e6f2a: mov ecx, dword ptr [0x9cf794]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 7e6f30: cmp eax, ecx
        if (R.zf) { pc = 7; continue; } // 7e6f32: je 0x7e6f5c
        pc = 2; continue;
      case 2: // 7e6f34
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf684) | 0) >>> 0), 32); // 7e6f34: cmp eax, dword ptr [0x9cf684]
        if (R.zf) { pc = 7; continue; } // 7e6f3a: je 0x7e6f5c
        pc = 3; continue;
      case 3: // 7e6f3c
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf798) | 0) >>> 0), 32); // 7e6f3c: cmp eax, dword ptr [0x9cf798]
        if (R.zf) { pc = 7; continue; } // 7e6f42: je 0x7e6f5c
        pc = 4; continue;
      case 4: // 7e6f44
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf6b0) | 0) >>> 0), 32); // 7e6f44: cmp eax, dword ptr [0x9cf6b0]
        if (R.zf) { pc = 7; continue; } // 7e6f4a: je 0x7e6f5c
        pc = 5; continue;
      case 5: // 7e6f4c
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf5d8) | 0) >>> 0), 32); // 7e6f4c: cmp eax, dword ptr [0x9cf5d8]
        if (R.zf) { pc = 7; continue; } // 7e6f52: je 0x7e6f5c
        pc = 6; continue;
      case 6: // 7e6f54
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf548) | 0) >>> 0), 32); // 7e6f54: cmp eax, dword ptr [0x9cf548]
        if (!R.zf) { pc = 8; continue; } // 7e6f5a: jne 0x7e6f64
        pc = 7; continue;
      case 7: // 7e6f5c
        R.eax = (0x1) | 0; // 7e6f5c: mov eax, 1
        R.rv = R.ret(1); return -1; // 7e6f61: ret 4
      case 8: // 7e6f64
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 7e6f64: xor eax, eax
        R.rv = R.ret(1); return -1; // 7e6f66: ret 4
      default: return pc;
    }
  }
}
export function f_7e6f20(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 9) throw new Error(`f_7e6f20: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_7e6f20_0(R, pc); break;
      default: throw new Error(`f_7e6f20: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_7e6f20: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_7e6f20.shared = true;
