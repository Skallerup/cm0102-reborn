// 0x8e7810 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 5e8290=9, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x8e7810, 0x8e7821, 0x8e782c, 0x8e7884]);
const CH = new Uint8Array([0, 0, 0, 1]);
function f_8e7810_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 8e7810
        R.edx = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 8e7810: mov edx, dword ptr [esp + 4]
        R.esp = (R.sub((R.esp >>> 0), 0x200, 32)) | 0; // 8e7814: sub esp, 0x200
        R.push((R.ebx >>> 0)); // 8e781a: push ebx
        R.ebx = (R.logic((R.ebx >>> 0) ^ (R.ebx >>> 0), 32)) | 0; // 8e781b: xor ebx, ebx
        R.sub((R.edx >>> 0), (R.ebx >>> 0), 32); // 8e781d: cmp edx, ebx
        if (R.zf) { pc = 3; continue; } // 8e781f: je 0x8e7884
        pc = 1; continue;
      case 1: // 8e7821
        R.eax = (R.m.u32(((R.esp + 0x20c) | 0) >>> 0)) | 0; // 8e7821: mov eax, dword ptr [esp + 0x20c]
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 8e7828: cmp eax, ebx
        if (R.zf) { pc = 3; continue; } // 8e782a: je 0x8e7884
        pc = 2; continue;
      case 2: // 8e782c
        R.m.w8(((R.ecx + 0x2d) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 8e782c: mov byte ptr [ecx + 0x2d], bl
        R.m.w32(((R.ecx) | 0) >>> 0, (R.ebx >>> 0)); // 8e782f: mov dword ptr [ecx], ebx
        R.m.w8(((R.ecx + 0x11) | 0) >>> 0, 0xb); // 8e7831: mov byte ptr [ecx + 0x11], 0xb
        R.m.w32(((R.ecx + 0x4) | 0) >>> 0, (R.ebx >>> 0)); // 8e7835: mov dword ptr [ecx + 4], ebx
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8e7838: mov eax, dword ptr [eax]
        R.m.w32(((R.ecx + 0x8) | 0) >>> 0, (R.eax >>> 0)); // 8e783a: mov dword ptr [ecx + 8], eax
        R.edx = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 8e783d: mov edx, dword ptr [edx]
        R.eax = ((R.eax & 0xffffff00) | (((0xa) & 0xff) << 0)) | 0; // 8e783f: mov al, 0xa
        R.m.w32(((R.ecx + 0x1b) | 0) >>> 0, (R.ebx >>> 0)); // 8e7841: mov dword ptr [ecx + 0x1b], ebx
        R.m.w8(((R.ecx + 0x39) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 8e7844: mov byte ptr [ecx + 0x39], al
        R.m.w8(((R.ecx + 0x3e) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 8e7847: mov byte ptr [ecx + 0x3e], al
        R.eax = (R.logic((R.eax >>> 0) | 0xffffffff, 32)) | 0; // 8e784a: or eax, 0xffffffff
        R.m.w32(((R.ecx + 0x35) | 0) >>> 0, (R.ebx >>> 0)); // 8e784d: mov dword ptr [ecx + 0x35], ebx
        R.m.w32(((R.ecx + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 8e7850: mov dword ptr [ecx + 0x28], eax
        R.m.w32(((R.ecx + 0x24) | 0) >>> 0, (R.eax >>> 0)); // 8e7853: mov dword ptr [ecx + 0x24], eax
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + 0x30) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e7856: mov al, byte ptr [ecx + 0x30]
        R.m.w32(((R.ecx + 0x3a) | 0) >>> 0, (R.ebx >>> 0)); // 8e7859: mov dword ptr [ecx + 0x3a], ebx
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 8e785c: and al, 0xf0
        R.m.w8(((R.ecx + 0x3f) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 8e785e: mov byte ptr [ecx + 0x3f], bl
        R.m.w8(((R.ecx + 0x40) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 8e7861: mov byte ptr [ecx + 0x40], bl
        R.m.w8(((R.ecx + 0x2c) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 8e7864: mov byte ptr [ecx + 0x2c], bl
        R.m.w8(((R.ecx + 0x10) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 8e7867: mov byte ptr [ecx + 0x10], bl
        R.m.w8(((R.ecx + 0x2e) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 8e786a: mov byte ptr [ecx + 0x2e], bl
        R.m.w8(((R.ecx + 0x2f) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 8e786d: mov byte ptr [ecx + 0x2f], bl
        R.m.w32(((R.ecx + 0xc) | 0) >>> 0, (R.edx >>> 0)); // 8e7870: mov dword ptr [ecx + 0xc], edx
        R.m.w8(((R.ecx + 0x1f) | 0) >>> 0, 0x1); // 8e7873: mov byte ptr [ecx + 0x1f], 1
        R.m.w8(((R.ecx + 0x30) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 8e7877: mov byte ptr [ecx + 0x30], al
        R.ebx = (R.pop()) | 0; // 8e787a: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 8e787b: add esp, 0x200
        R.rv = R.ret(2); return -1; // 8e7881: ret 8
      default: return pc;
    }
  }
}
function f_8e7810_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 3: // 8e7884
        R.eax = (((R.esp + 0x4) | 0)) | 0; // 8e7884: lea eax, [esp + 4]
        R.ecx = (((R.esp + 0x104) | 0)) | 0; // 8e7888: lea ecx, [esp + 0x104]
        R.push((R.eax >>> 0)); // 8e788f: push eax
        R.push((R.ecx >>> 0)); // 8e7890: push ecx
        R.push((R.ebx >>> 0)); // 8e7891: push ebx
        R.push((R.ebx >>> 0)); // 8e7892: push ebx
        R.push(0xa9e318); // 8e7893: push 0xa9e318
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 8e7898: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8e789d: add esp, 0x14
        R.edx = (((R.esp + 0x4) | 0)) | 0; // 8e78a0: lea edx, [esp + 4]
        R.eax = (((R.esp + 0x104) | 0)) | 0; // 8e78a4: lea eax, [esp + 0x104]
        R.push(0x485); // 8e78ab: push 0x485
        R.push((R.edx >>> 0)); // 8e78b0: push edx
        R.push((R.eax >>> 0)); // 8e78b1: push eax
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 8e78b2: call 0x90d130
        R.push((R.eax >>> 0)); // 8e78b7: push eax
        R.push(0x9870e8); // 8e78b8: push 0x9870e8
        R.push(0xae24d0); // 8e78bd: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 8e78c2: call 0x944c9f
        R.push((R.ebx >>> 0)); // 8e78c7: push ebx
        R.push(0xae24d0); // 8e78c8: push 0xae24d0
        R.push(0x9870e0); // 8e78cd: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 8e78d2: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 8e78d7: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, (R.ebx >>> 0)); // 8e78da: mov dword ptr [0xb67a34], ebx
        R.ebx = (R.pop()) | 0; // 8e78e0: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 8e78e1: add esp, 0x200
        R.rv = R.ret(2); return -1; // 8e78e7: ret 8
      default: return pc;
    }
  }
}
export function f_8e7810(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 4) throw new Error(`f_8e7810: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_8e7810_0(R, pc); break;
      case 1: np = f_8e7810_1(R, pc); break;
      default: throw new Error(`f_8e7810: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_8e7810: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_8e7810.shared = true;
