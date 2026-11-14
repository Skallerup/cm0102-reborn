// 0x53ab90 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 5e8290=9, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x53ab90, 0x53ab9e, 0x53ac0a, 0x53ac28, 0x53ac32]);
const CH = new Uint8Array([0, 0, 0, 0, 0]);
function f_53ab90_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 53ab90
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 53ab90: mov eax, dword ptr [esp + 4]
        R.esp = (R.sub((R.esp >>> 0), 0x200, 32)) | 0; // 53ab94: sub esp, 0x200
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 53ab9a: test eax, eax
        if (!R.zf) { pc = 2; continue; } // 53ab9c: jne 0x53ac0a
        pc = 1; continue;
      case 1: // 53ab9e
        R.eax = (((R.esp) | 0)) | 0; // 53ab9e: lea eax, [esp]
        R.ecx = (((R.esp + 0x100) | 0)) | 0; // 53aba2: lea ecx, [esp + 0x100]
        R.push((R.eax >>> 0)); // 53aba9: push eax
        R.push((R.ecx >>> 0)); // 53abaa: push ecx
        R.push(0x0); // 53abab: push 0
        R.push(0x0); // 53abad: push 0
        R.push(0x9b5ac8); // 53abaf: push 0x9b5ac8
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 53abb4: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 53abb9: add esp, 0x14
        R.edx = (((R.esp) | 0)) | 0; // 53abbc: lea edx, [esp]
        R.eax = (((R.esp + 0x100) | 0)) | 0; // 53abc0: lea eax, [esp + 0x100]
        R.push(0x312e); // 53abc7: push 0x312e
        R.push((R.edx >>> 0)); // 53abcc: push edx
        R.push((R.eax >>> 0)); // 53abcd: push eax
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 53abce: call 0x90d130
        R.push((R.eax >>> 0)); // 53abd3: push eax
        R.push(0x9870e8); // 53abd4: push 0x9870e8
        R.push(0xae24d0); // 53abd9: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 53abde: call 0x944c9f
        R.push(0x0); // 53abe3: push 0
        R.push(0xae24d0); // 53abe5: push 0xae24d0
        R.push(0x9870e0); // 53abea: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 53abef: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 53abf4: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 53abf7: mov dword ptr [0xb67a34], 0
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) | 0xff, 8)) & 0xff) << 0)) | 0; // 53ac01: or al, 0xff
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53ac03: add esp, 0x200
        R.rv = R.ret(0); return -1; // 53ac09: ret 
      case 2: // 53ac0a
        R.ecx = (R.m.u32(((R.esp + 0x208) | 0) >>> 0)) | 0; // 53ac0a: mov ecx, dword ptr [esp + 0x208]
        R.push((R.esi >>> 0)); // 53ac11: push esi
        R.edx = (((R.m.u16(((R.eax + 0x10) | 0) >>> 0)) << 16 >> 16)) | 0; // 53ac12: movsx edx, word ptr [eax + 0x10]
        R.esi = (((R.m.u16(((R.ecx) | 0) >>> 0)) << 16 >> 16)) | 0; // 53ac16: movsx esi, word ptr [ecx]
        R.edx = (R.sub((R.edx >>> 0), (R.esi >>> 0), 32)) | 0; // 53ac19: sub edx, esi
        R.esi = (R.pop()) | 0; // 53ac1b: pop esi
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 53ac1c: test edx, edx
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.eax + 0x12) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 53ac1e: mov dx, word ptr [eax + 0x12]
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.ecx + 0x2) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 53ac22: mov ax, word ptr [ecx + 2]
        if (R.cLE) { pc = 4; continue; } // 53ac26: jle 0x53ac32
        pc = 3; continue;
      case 3: // 53ac28
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 53ac28: sub eax, edx
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 53ac2a: dec eax
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53ac2b: add esp, 0x200
        R.rv = R.ret(0); return -1; // 53ac31: ret 
      case 4: // 53ac32
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 53ac32: sub eax, edx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53ac34: add esp, 0x200
        R.rv = R.ret(0); return -1; // 53ac3a: ret 
      default: return pc;
    }
  }
}
export function f_53ab90(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 5) throw new Error(`f_53ab90: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_53ab90_0(R, pc); break;
      default: throw new Error(`f_53ab90: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_53ab90: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_53ab90.shared = true;
