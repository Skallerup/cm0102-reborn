// 0x4d45f0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 54a110=0t, 54c5b0=2tc, 54cfb0=7t, 669bd0=3
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x4d45f0]);
const CH = new Uint8Array([0]);
function f_4d45f0_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 4d45f0
        R.push(0xffffffff); // 4d45f0: push -1
        R.push(0x956e40); // 4d45f2: push 0x956e40
        R.eax = (0) | 0; // 4d45f7: mov eax, dword ptr fs:[0]
        R.push((R.eax >>> 0)); // 4d45fd: push eax
        /* fs */ // 4d45fe: mov dword ptr fs:[0], esp
        R.esp = (R.sub((R.esp >>> 0), 0x10, 32)) | 0; // 4d4605: sub esp, 0x10
        R.ecx = (((R.esp) | 0)) | 0; // 4d4608: lea ecx, [esp]
        R.call(0x54a110, { n: 0, thisEcx: true, calleeClean: false }); // 4d460c: call 0x54a110
        R.ecx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 4d4611: mov ecx, dword ptr [esp + 0x20]
        R.eax = (((R.esp) | 0)) | 0; // 4d4615: lea eax, [esp]
        R.push((R.eax >>> 0)); // 4d4619: push eax
        R.push(0x0); // 4d461a: push 0
        R.push((R.ecx >>> 0)); // 4d461c: push ecx
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, 0x0); // 4d461d: mov dword ptr [esp + 0x24], 0
        R.call(0x669bd0, { n: 3, thisEcx: false, calleeClean: false }); // 4d4625: call 0x669bd0
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 4d462a: add esp, 0xc
        R.edx = (((R.esp + 0x8) | 0)) | 0; // 4d462d: lea edx, [esp + 8]
        R.ecx = (((R.esp) | 0)) | 0; // 4d4631: lea ecx, [esp]
        R.push(0xa); // 4d4635: push 0xa
        R.push((R.edx >>> 0)); // 4d4637: push edx
        R.call(0x54c5b0, { n: 2, thisEcx: true, calleeClean: true }); // 4d4638: call 0x54c5b0
        R.ecx = ((R.eax >>> 0)) | 0; // 4d463d: mov ecx, eax
        R.m.w8(((R.esp + 0x18) | 0) >>> 0, 0x1); // 4d463f: mov byte ptr [esp + 0x18], 1
        R.call(0x54cfb0, { n: 7, thisEcx: true, calleeClean: false }); // 4d4644: call 0x54cfb0
        R.ecx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 4d4649: mov ecx, dword ptr [esp + 0x10]
        /* fs */ // 4d464d: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x1c, 32)) | 0; // 4d4654: add esp, 0x1c
        R.rv = R.ret(1); return -1; // 4d4657: ret 4
      default: return pc;
    }
  }
}
export function f_4d45f0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 1) throw new Error(`f_4d45f0: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_4d45f0_0(R, pc); break;
      default: throw new Error(`f_4d45f0: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_4d45f0: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_4d45f0.shared = true;
