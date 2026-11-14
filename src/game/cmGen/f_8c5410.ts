// 0x8c5410 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x8c5410]);
const CH = new Uint8Array([0]);
function f_8c5410_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 8c5410
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 8c5410: mov eax, dword ptr [esp + 4]
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8c5414: mov edx, dword ptr [eax]
        R.eax = (R.m.u32(((R.ecx + 0x86e) | 0) >>> 0)) | 0; // 8c5416: mov eax, dword ptr [ecx + 0x86e]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + R.edx * 8) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8c541c: mov cl, byte ptr [eax + edx*8]
        R.eax = (((R.eax + R.edx * 8) | 0)) | 0; // 8c541f: lea eax, [eax + edx*8]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) | 0x40, 8)) & 0xff) << 0)) | 0; // 8c5422: or cl, 0x40
        R.m.w8(((R.eax) | 0) >>> 0, ((R.ecx >>> 0) & 0xff)); // 8c5425: mov byte ptr [eax], cl
        R.rv = R.ret(1); return -1; // 8c5427: ret 4
      default: return pc;
    }
  }
}
export function f_8c5410(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 1) throw new Error(`f_8c5410: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_8c5410_0(R, pc); break;
      default: throw new Error(`f_8c5410: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_8c5410: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_8c5410.shared = true;
