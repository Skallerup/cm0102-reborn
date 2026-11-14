// 0x775790 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 53b900=1
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x775790, 0x7757a2, 0x7757ae, 0x7757b6, 0x7757bc]);
const CH = new Uint8Array([0, 0, 0, 0, 0]);
function f_775790_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 775790
        R.push((R.esi >>> 0)); // 775790: push esi
        R.esi = (R.m.u32(((R.esp + 0x8) | 0) >>> 0)) | 0; // 775791: mov esi, dword ptr [esp + 8]
        R.push((R.esi >>> 0)); // 775795: push esi
        R.call(0x53b900, { n: 1, thisEcx: false, calleeClean: false }); // 775796: call 0x53b900
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 77579b: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 77579e: test eax, eax
        if (!R.zf) { pc = 4; continue; } // 7757a0: jne 0x7757bc
        pc = 1; continue;
      case 1: // 7757a2
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 7757a2: mov eax, dword ptr [esi]
        R.ecx = (R.m.u32(((0x9d00a4) | 0) >>> 0)) | 0; // 7757a4: mov ecx, dword ptr [0x9d00a4]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 7757aa: cmp eax, ecx
        if (R.zf) { pc = 4; continue; } // 7757ac: je 0x7757bc
        pc = 2; continue;
      case 2: // 7757ae
        R.sub((R.eax >>> 0), R.m.u32(((0x9d00a8) | 0) >>> 0), 32); // 7757ae: cmp eax, dword ptr [0x9d00a8]
        if (R.zf) { pc = 4; continue; } // 7757b4: je 0x7757bc
        pc = 3; continue;
      case 3: // 7757b6
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 7757b6: xor eax, eax
        R.esi = (R.pop()) | 0; // 7757b8: pop esi
        R.rv = R.ret(1); return -1; // 7757b9: ret 4
      case 4: // 7757bc
        R.eax = (0x1) | 0; // 7757bc: mov eax, 1
        R.esi = (R.pop()) | 0; // 7757c1: pop esi
        R.rv = R.ret(1); return -1; // 7757c2: ret 4
      default: return pc;
    }
  }
}
export function f_775790(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 5) throw new Error(`f_775790: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_775790_0(R, pc); break;
      default: throw new Error(`f_775790: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_775790: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_775790.shared = true;
