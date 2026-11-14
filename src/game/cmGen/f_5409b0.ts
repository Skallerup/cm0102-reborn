// 0x5409b0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 5e8290=9, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x5409b0, 0x5409be, 0x540a2a]);
const CH = new Uint8Array([0, 0, 0]);
function f_5409b0_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 5409b0
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 5409b0: mov eax, dword ptr [esp + 4]
        R.esp = (R.sub((R.esp >>> 0), 0x200, 32)) | 0; // 5409b4: sub esp, 0x200
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5409ba: test eax, eax
        if (!R.zf) { pc = 2; continue; } // 5409bc: jne 0x540a2a
        pc = 1; continue;
      case 1: // 5409be
        R.eax = (((R.esp) | 0)) | 0; // 5409be: lea eax, [esp]
        R.ecx = (((R.esp + 0x100) | 0)) | 0; // 5409c2: lea ecx, [esp + 0x100]
        R.push((R.eax >>> 0)); // 5409c9: push eax
        R.push((R.ecx >>> 0)); // 5409ca: push ecx
        R.push(0x0); // 5409cb: push 0
        R.push(0x0); // 5409cd: push 0
        R.push(0x9b5ac8); // 5409cf: push 0x9b5ac8
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 5409d4: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 5409d9: add esp, 0x14
        R.edx = (((R.esp) | 0)) | 0; // 5409dc: lea edx, [esp]
        R.eax = (((R.esp + 0x100) | 0)) | 0; // 5409e0: lea eax, [esp + 0x100]
        R.push(0x43a8); // 5409e7: push 0x43a8
        R.push((R.edx >>> 0)); // 5409ec: push edx
        R.push((R.eax >>> 0)); // 5409ed: push eax
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 5409ee: call 0x90d130
        R.push((R.eax >>> 0)); // 5409f3: push eax
        R.push(0x9870e8); // 5409f4: push 0x9870e8
        R.push(0xae24d0); // 5409f9: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 5409fe: call 0x944c9f
        R.push(0x0); // 540a03: push 0
        R.push(0xae24d0); // 540a05: push 0xae24d0
        R.push(0x9870e0); // 540a0a: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 540a0f: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 540a14: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 540a17: mov dword ptr [0xb67a34], 0
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 540a21: xor eax, eax
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 540a23: add esp, 0x200
        R.rv = R.ret(0); return -1; // 540a29: ret 
      case 2: // 540a2a
        R.ecx = (R.m.u32(((0xae235c) | 0) >>> 0)) | 0; // 540a2a: mov ecx, dword ptr [0xae235c]
        R.edx = (R.m.u32(((0xae2350) | 0) >>> 0)) | 0; // 540a30: mov edx, dword ptr [0xae2350]
        R.push((R.esi >>> 0)); // 540a36: push esi
        R.esi = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 540a37: mov esi, dword ptr [eax]
        R.ecx = (R.sub((R.ecx >>> 0), (R.edx >>> 0), 32)) | 0; // 540a39: sub ecx, edx
        R.edx = (R.logic((R.edx >>> 0) ^ (R.edx >>> 0), 32)) | 0; // 540a3b: xor edx, edx
        R.sub((R.esi >>> 0), (R.ecx >>> 0), 32); // 540a3d: cmp esi, ecx
        R.esi = (R.pop()) | 0; // 540a3f: pop esi
        R.edx = ((R.edx & 0xffffff00) | (((!R.cL ? 1 : 0) & 0xff) << 0)) | 0; // 540a40: setge dl
        R.eax = ((R.edx >>> 0)) | 0; // 540a43: mov eax, edx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 540a45: add esp, 0x200
        R.rv = R.ret(0); return -1; // 540a4b: ret 
      default: return pc;
    }
  }
}
export function f_5409b0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 3) throw new Error(`f_5409b0: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_5409b0_0(R, pc); break;
      default: throw new Error(`f_5409b0: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_5409b0: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_5409b0.shared = true;
