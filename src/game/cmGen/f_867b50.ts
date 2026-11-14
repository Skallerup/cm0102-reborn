// 0x867b50 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x867b50, 0x867b59, 0x867b5f, 0x867b64, 0x867b67]);
const CH = new Uint8Array([0, 0, 0, 0, 0]);
function f_867b50_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 867b50
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.ecx + 0x1c) | 0) >>> 0)) & 0xff) << 0)) | 0; // 867b50: mov dl, byte ptr [ecx + 0x1c]
        R.eax = ((R.eax & 0xffffff00) | (((0x2) & 0xff) << 0)) | 0; // 867b53: mov al, 2
        R.sub(((R.edx >>> 0) & 0xff), ((R.eax >>> 0) & 0xff), 8); // 867b55: cmp dl, al
        if (R.zf) { pc = 4; continue; } // 867b57: je 0x867b67
        pc = 1; continue;
      case 1: // 867b59
        R.sub(R.m.u8(((R.ecx + 0x1d) | 0) >>> 0), 0x1, 8); // 867b59: cmp byte ptr [ecx + 0x1d], 1
        if (R.zf) { pc = 4; continue; } // 867b5d: je 0x867b67
        pc = 2; continue;
      case 2: // 867b5f
        R.sub(R.m.u8(((R.ecx + 0x1f) | 0) >>> 0), ((R.eax >>> 0) & 0xff), 8); // 867b5f: cmp byte ptr [ecx + 0x1f], al
        if (R.zf) { pc = 4; continue; } // 867b62: je 0x867b67
        pc = 3; continue;
      case 3: // 867b64
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 867b64: xor eax, eax
        R.rv = R.ret(0); return -1; // 867b66: ret 
      case 4: // 867b67
        R.eax = (0x1) | 0; // 867b67: mov eax, 1
        R.rv = R.ret(0); return -1; // 867b6c: ret 
      default: return pc;
    }
  }
}
export function f_867b50(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 5) throw new Error(`f_867b50: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_867b50_0(R, pc); break;
      default: throw new Error(`f_867b50: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_867b50: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_867b50.shared = true;
