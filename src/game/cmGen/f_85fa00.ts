// 0x85fa00 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 54cdb0=2tc
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x85fa00]);
const CH = new Uint8Array([0]);
function f_85fa00_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 85fa00
        R.eax = (R.m.u32(((0xae2c94) | 0) >>> 0)) | 0; // 85fa00: mov eax, dword ptr [0xae2c94]
        R.edx = (R.m.u32(((0xae2c90) | 0) >>> 0)) | 0; // 85fa05: mov edx, dword ptr [0xae2c90]
        R.push((R.eax >>> 0)); // 85fa0b: push eax
        R.push((R.edx >>> 0)); // 85fa0c: push edx
        R.ecx = (R.add((R.ecx >>> 0), 0x2d, 32)) | 0; // 85fa0d: add ecx, 0x2d
        R.call(0x54cdb0, { n: 2, thisEcx: true, calleeClean: true }); // 85fa10: call 0x54cdb0
        R.rv = R.ret(0); return -1; // 85fa15: ret 
      default: return pc;
    }
  }
}
export function f_85fa00(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 1) throw new Error(`f_85fa00: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_85fa00_0(R, pc); break;
      default: throw new Error(`f_85fa00: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_85fa00: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_85fa00.shared = true;
