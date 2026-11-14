// 0x69fc60 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 5e8290=9, 68d1b0=0t, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x69fc60, 0x69fc82, 0x69fc89, 0x69fc92, 0x69fca0, 0x69fcab, 0x69fcc0, 0x69fd38]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 1, 1]);
function f_69fc60_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 69fc60
        R.esp = (R.sub((R.esp >>> 0), 0x200, 32)) | 0; // 69fc60: sub esp, 0x200
        R.push((R.ebx >>> 0)); // 69fc66: push ebx
        R.push((R.ebp >>> 0)); // 69fc67: push ebp
        R.push((R.esi >>> 0)); // 69fc68: push esi
        R.esi = ((R.ecx >>> 0)) | 0; // 69fc69: mov esi, ecx
        R.push((R.edi >>> 0)); // 69fc6b: push edi
        R.edi = (R.logic((R.edi >>> 0) ^ (R.edi >>> 0), 32)) | 0; // 69fc6c: xor edi, edi
        R.eax = (R.m.u32(((R.esi + 0x8) | 0) >>> 0)) | 0; // 69fc6e: mov eax, dword ptr [esi + 8]
        R.ecx = (R.m.u32(((R.eax + 0x2) | 0) >>> 0)) | 0; // 69fc71: mov ecx, dword ptr [eax + 2]
        R.ebx = (R.m.u32(((R.eax + 0xa) | 0) >>> 0)) | 0; // 69fc74: mov ebx, dword ptr [eax + 0xa]
        R.m.w32(((R.eax + 0xa) | 0) >>> 0, (R.ecx >>> 0)); // 69fc77: mov dword ptr [eax + 0xa], ecx
        R.ecx = (R.m.u32(((R.esi + 0x8) | 0) >>> 0)) | 0; // 69fc7a: mov ecx, dword ptr [esi + 8]
        R.sub(R.m.u16(((R.ecx) | 0) >>> 0), ((R.edi >>> 0) & 0xffff), 16); // 69fc7d: cmp word ptr [ecx], di
        if (R.cLE) { pc = 5; continue; } // 69fc80: jle 0x69fcab
        pc = 1; continue;
      case 1: // 69fc82
        R.ebp = (R.m.u32(((R.esp + 0x214) | 0) >>> 0)) | 0; // 69fc82: mov ebp, dword ptr [esp + 0x214]
        pc = 2; continue;
      case 2: // 69fc89
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 69fc89: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69fc8e: test eax, eax
        if (R.zf) { pc = 6; continue; } // 69fc90: je 0x69fcc0
        pc = 3; continue;
      case 3: // 69fc92
        R.edx = (R.m.u32(((R.eax + 0x6) | 0) >>> 0)) | 0; // 69fc92: mov edx, dword ptr [eax + 6]
        R.eax = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 69fc95: mov eax, dword ptr [ebp]
        R.sub((R.edx >>> 0), (R.eax >>> 0), 32); // 69fc98: cmp edx, eax
        if (R.zf) { pc = 7; continue; } // 69fc9a: je 0x69fd38
        pc = 4; continue;
      case 4: // 69fca0
        R.ecx = (R.m.u32(((R.esi + 0x8) | 0) >>> 0)) | 0; // 69fca0: mov ecx, dword ptr [esi + 8]
        R.edi = (R.incdec((R.edi >>> 0), 1, 32)) | 0; // 69fca3: inc edi
        R.eax = (((R.m.u16(((R.ecx) | 0) >>> 0)) << 16 >> 16)) | 0; // 69fca4: movsx eax, word ptr [ecx]
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 69fca7: cmp edi, eax
        if (R.cL) { pc = 2; continue; } // 69fca9: jl 0x69fc89
        pc = 5; continue;
      case 5: // 69fcab
        R.ecx = (R.m.u32(((R.esi + 0x8) | 0) >>> 0)) | 0; // 69fcab: mov ecx, dword ptr [esi + 8]
        R.edi = (R.pop()) | 0; // 69fcae: pop edi
        R.esi = (R.pop()) | 0; // 69fcaf: pop esi
        R.ebp = (R.pop()) | 0; // 69fcb0: pop ebp
        R.m.w32(((R.ecx + 0xa) | 0) >>> 0, (R.ebx >>> 0)); // 69fcb1: mov dword ptr [ecx + 0xa], ebx
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 69fcb4: xor al, al
        R.ebx = (R.pop()) | 0; // 69fcb6: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 69fcb7: add esp, 0x200
        R.rv = R.ret(1); return -1; // 69fcbd: ret 4
      default: return pc;
    }
  }
}
function f_69fc60_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 6: // 69fcc0
        R.ecx = (R.m.u32(((R.esi + 0x8) | 0) >>> 0)) | 0; // 69fcc0: mov ecx, dword ptr [esi + 8]
        R.edx = (((R.esp + 0x10) | 0)) | 0; // 69fcc3: lea edx, [esp + 0x10]
        R.eax = (((R.esp + 0x110) | 0)) | 0; // 69fcc7: lea eax, [esp + 0x110]
        R.push((R.edx >>> 0)); // 69fcce: push edx
        R.push((R.eax >>> 0)); // 69fccf: push eax
        R.push(0x0); // 69fcd0: push 0
        R.push(0x0); // 69fcd2: push 0
        R.push(0x9f18a4); // 69fcd4: push 0x9f18a4
        R.m.w32(((R.ecx + 0xa) | 0) >>> 0, (R.ebx >>> 0)); // 69fcd9: mov dword ptr [ecx + 0xa], ebx
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 69fcdc: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 69fce1: add esp, 0x14
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 69fce4: lea ecx, [esp + 0x10]
        R.edx = (((R.esp + 0x110) | 0)) | 0; // 69fce8: lea edx, [esp + 0x110]
        R.push(0x3724); // 69fcef: push 0x3724
        R.push((R.ecx >>> 0)); // 69fcf4: push ecx
        R.push((R.edx >>> 0)); // 69fcf5: push edx
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 69fcf6: call 0x90d130
        R.push((R.eax >>> 0)); // 69fcfb: push eax
        R.push(0x9870e8); // 69fcfc: push 0x9870e8
        R.push(0xae24d0); // 69fd01: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 69fd06: call 0x944c9f
        R.push(0x0); // 69fd0b: push 0
        R.push(0xae24d0); // 69fd0d: push 0xae24d0
        R.push(0x9870e0); // 69fd12: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 69fd17: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 69fd1c: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 69fd1f: mov dword ptr [0xb67a34], 0
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 69fd29: xor al, al
        R.edi = (R.pop()) | 0; // 69fd2b: pop edi
        R.esi = (R.pop()) | 0; // 69fd2c: pop esi
        R.ebp = (R.pop()) | 0; // 69fd2d: pop ebp
        R.ebx = (R.pop()) | 0; // 69fd2e: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 69fd2f: add esp, 0x200
        R.rv = R.ret(1); return -1; // 69fd35: ret 4
      case 7: // 69fd38
        R.eax = (R.m.u32(((R.esi + 0x8) | 0) >>> 0)) | 0; // 69fd38: mov eax, dword ptr [esi + 8]
        R.edi = (R.pop()) | 0; // 69fd3b: pop edi
        R.esi = (R.pop()) | 0; // 69fd3c: pop esi
        R.ebp = (R.pop()) | 0; // 69fd3d: pop ebp
        R.m.w32(((R.eax + 0xa) | 0) >>> 0, (R.ebx >>> 0)); // 69fd3e: mov dword ptr [eax + 0xa], ebx
        R.eax = ((R.eax & 0xffffff00) | (((0x1) & 0xff) << 0)) | 0; // 69fd41: mov al, 1
        R.ebx = (R.pop()) | 0; // 69fd43: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 69fd44: add esp, 0x200
        R.rv = R.ret(1); return -1; // 69fd4a: ret 4
      default: return pc;
    }
  }
}
export function f_69fc60(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 8) throw new Error(`f_69fc60: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_69fc60_0(R, pc); break;
      case 1: np = f_69fc60_1(R, pc); break;
      default: throw new Error(`f_69fc60: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_69fc60: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_69fc60.shared = true;
