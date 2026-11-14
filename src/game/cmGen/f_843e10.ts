// 0x843e10 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 417c10=2tc, 4cf5f0=2tc, 54c5b0=2tc, 54c8e0=2tc, 600a50=5, 68d020=0t, 68d040=0t, 68d1b0=0t, 83f3a0=3tc, 842180=5tc, 843e10=4tc, 946464=5
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x843e10, 0x843e50, 0x843e55, 0x843e60, 0x843e86, 0x843eb6, 0x843ebd, 0x843ec5, 0x843ec9, 0x843ed1, 0x843eda, 0x843ee0, 0x843ef8, 0x843efd, 0x843f15, 0x843f3f, 0x843f4e, 0x843f68, 0x843f83, 0x843f8b, 0x843fab, 0x843fbb, 0x843fd6, 0x843ff3, 0x843ffb, 0x84400d, 0x844013, 0x844039, 0x844061, 0x84406c, 0x844078, 0x84407a, 0x84407e, 0x84408a, 0x84409a, 0x8440a8, 0x8440b1, 0x8440c3, 0x8440ca, 0x8440e5, 0x8440e7, 0x844112, 0x84412a, 0x844140, 0x844175, 0x84418d, 0x844196, 0x8441d3, 0x8441db, 0x8441e0, 0x8441e7, 0x8441f8, 0x84422a, 0x84423c, 0x84424f]);
const CH = new Uint8Array([0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 8, 8, 8]);
function f_843e10_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 843e10
        R.push(0xffffffff); // 843e10: push -1
        R.push(0x962518); // 843e12: push 0x962518
        R.eax = (0) | 0; // 843e17: mov eax, dword ptr fs:[0]
        R.push((R.eax >>> 0)); // 843e1d: push eax
        /* fs */ // 843e1e: mov dword ptr fs:[0], esp
        R.esp = (R.sub((R.esp >>> 0), 0x5c, 32)) | 0; // 843e25: sub esp, 0x5c
        R.push((R.ebx >>> 0)); // 843e28: push ebx
        R.push((R.ebp >>> 0)); // 843e29: push ebp
        R.ebx = ((R.ecx >>> 0)) | 0; // 843e2a: mov ebx, ecx
        R.push((R.esi >>> 0)); // 843e2c: push esi
        R.push((R.edi >>> 0)); // 843e2d: push edi
        R.ecx = (((R.esp + 0x5c) | 0)) | 0; // 843e2e: lea ecx, [esp + 0x5c]
        R.call(0x68d020, { n: 0, thisEcx: true, calleeClean: false }); // 843e32: call 0x68d020
        R.edi = (R.m.u32(((R.esp + 0x80) | 0) >>> 0)) | 0; // 843e37: mov edi, dword ptr [esp + 0x80]
        R.ebp = (R.m.u32(((R.esp + 0x7c) | 0) >>> 0)) | 0; // 843e3e: mov ebp, dword ptr [esp + 0x7c]
        R.esi = (R.logic((R.esi >>> 0) ^ (R.esi >>> 0), 32)) | 0; // 843e42: xor esi, esi
        R.sub((R.edi >>> 0), (R.esi >>> 0), 32); // 843e44: cmp edi, esi
        R.m.w32(((R.esp + 0x74) | 0) >>> 0, (R.esi >>> 0)); // 843e46: mov dword ptr [esp + 0x74], esi
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.esi >>> 0)); // 843e4a: mov dword ptr [esp + 0x10], esi
        if (R.zf) { pc = 2; continue; } // 843e4e: je 0x843e55
        pc = 1; continue;
      case 1: // 843e50
        R.sub((R.edi >>> 0), R.m.u32(((R.ebp + 0x39) | 0) >>> 0), 32); // 843e50: cmp edi, dword ptr [ebp + 0x39]
        if (!R.zf) { pc = 5; continue; } // 843e53: jne 0x843eb6
        pc = 2; continue;
      case 2: // 843e55
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x84) | 0) >>> 0)) & 0xff) << 0)) | 0; // 843e55: mov al, byte ptr [esp + 0x84]
        R.sub(((R.eax >>> 0) & 0xff), 0x4, 8); // 843e5c: cmp al, 4
        if (!R.zf) { pc = 6; continue; } // 843e5e: jne 0x843ebd
        pc = 3; continue;
      case 3: // 843e60
        R.push((R.esi >>> 0)); // 843e60: push esi
        R.push(0x3); // 843e61: push 3
        R.eax = (((R.esp + 0x64) | 0)) | 0; // 843e63: lea eax, [esp + 0x64]
        R.push((R.esi >>> 0)); // 843e67: push esi
        R.push((R.eax >>> 0)); // 843e68: push eax
        R.push((R.ebp >>> 0)); // 843e69: push ebp
        R.ecx = ((R.ebx >>> 0)) | 0; // 843e6a: mov ecx, ebx
        R.call(0x842180, { n: 5, thisEcx: true, calleeClean: true }); // 843e6c: call 0x842180
        R.ecx = (R.m.u32(((R.esp + 0x5e) | 0) >>> 0)) | 0; // 843e71: mov ecx, dword ptr [esp + 0x5e]
        R.m.w32(((R.esp + 0x66) | 0) >>> 0, (R.ecx >>> 0)); // 843e75: mov dword ptr [esp + 0x66], ecx
        R.ecx = (((R.esp + 0x5c) | 0)) | 0; // 843e79: lea ecx, [esp + 0x5c]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 843e7d: call 0x68d1b0
        R.sub((R.eax >>> 0), (R.esi >>> 0), 32); // 843e82: cmp eax, esi
        if (R.zf) { pc = 5; continue; } // 843e84: je 0x843eb6
        pc = 4; continue;
      default: return pc;
    }
  }
}
function f_843e10_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 4: // 843e86
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 843e86: mov eax, dword ptr [eax + 4]
        R.ecx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 843e89: mov ecx, dword ptr [0xae23b4]
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 843e8f: add ecx, eax
        R.push(0x2); // 843e91: push 2
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 843e93: lea edx, [eax + eax*8]
        R.push(0x1); // 843e96: push 1
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 843e98: shl edx, 4
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 843e9b: add edx, eax
        R.edx = (((R.ecx + R.edx * 4) | 0)) | 0; // 843e9d: lea edx, [ecx + edx*4]
        R.ecx = ((R.ebx >>> 0)) | 0; // 843ea0: mov ecx, ebx
        R.push((R.edx >>> 0)); // 843ea2: push edx
        R.push((R.ebp >>> 0)); // 843ea3: push ebp
        R.call(0x843e10, { n: 4, thisEcx: true, calleeClean: true }); // 843ea4: call 0x843e10
        R.ecx = (((R.esp + 0x5c) | 0)) | 0; // 843ea9: lea ecx, [esp + 0x5c]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 843ead: call 0x68d1b0
        R.sub((R.eax >>> 0), (R.esi >>> 0), 32); // 843eb2: cmp eax, esi
        if (!R.zf) { pc = 4; continue; } // 843eb4: jne 0x843e86
        pc = 5; continue;
      case 5: // 843eb6
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x84) | 0) >>> 0)) & 0xff) << 0)) | 0; // 843eb6: mov al, byte ptr [esp + 0x84]
        pc = 6; continue;
      case 6: // 843ebd
        R.sub((R.edi >>> 0), (R.esi >>> 0), 32); // 843ebd: cmp edi, esi
        if (R.zf) { pc = 53; continue; } // 843ebf: je 0x84423c
        pc = 7; continue;
      case 7: // 843ec5
        R.sub(((R.eax >>> 0) & 0xff), 0x5, 8); // 843ec5: cmp al, 5
        if (R.zf) { pc = 10; continue; } // 843ec7: je 0x843eda
        pc = 8; continue;
      case 8: // 843ec9
        R.sub(((R.eax >>> 0) & 0xff), 0x4, 8); // 843ec9: cmp al, 4
        if (R.zf) { pc = 27; continue; } // 843ecb: je 0x844039
        pc = 9; continue;
      case 9: // 843ed1
        R.sub((R.edi >>> 0), R.m.u32(((R.ebp + 0x39) | 0) >>> 0), 32); // 843ed1: cmp edi, dword ptr [ebp + 0x39]
        if (R.zf) { pc = 27; continue; } // 843ed4: je 0x844039
        pc = 10; continue;
      case 10: // 843eda
        R.eax = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 843eda: mov eax, dword ptr [ebx]
        R.sub((R.eax >>> 0), (R.esi >>> 0), 32); // 843edc: cmp eax, esi
        if (!R.zf) { pc = 12; continue; } // 843ede: jne 0x843ef8
        pc = 11; continue;
      case 11: // 843ee0
        R.ecx = (((R.esp + 0x5c) | 0)) | 0; // 843ee0: lea ecx, [esp + 0x5c]
        R.m.w32(((R.esp + 0x74) | 0) >>> 0, 0xffffffff); // 843ee4: mov dword ptr [esp + 0x74], 0xffffffff
        R.call(0x68d040, { n: 0, thisEcx: true, calleeClean: false }); // 843eec: call 0x68d040
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 843ef1: xor al, al
        pc = 54; continue; // 843ef3: jmp 0x84424f
      case 12: // 843ef8
        R.sub(R.m.u32(((R.ebx + 0x4) | 0) >>> 0), (R.esi >>> 0), 32); // 843ef8: cmp dword ptr [ebx + 4], esi
        if (!R.zf) { pc = 14; continue; } // 843efb: jne 0x843f15
        pc = 13; continue;
      case 13: // 843efd
        R.ecx = (((R.esp + 0x5c) | 0)) | 0; // 843efd: lea ecx, [esp + 0x5c]
        R.m.w32(((R.esp + 0x74) | 0) >>> 0, 0xffffffff); // 843f01: mov dword ptr [esp + 0x74], 0xffffffff
        R.call(0x68d040, { n: 0, thisEcx: true, calleeClean: false }); // 843f09: call 0x68d040
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 843f0e: xor al, al
        pc = 54; continue; // 843f10: jmp 0x84424f
      default: return pc;
    }
  }
}
function f_843e10_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 14: // 843f15
        R.ecx = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 843f15: mov ecx, dword ptr [ebp]
        R.edx = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 843f18: mov edx, dword ptr [edi]
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.ecx >>> 0)); // 843f1a: mov dword ptr [esp + 0x14], ecx
        R.ecx = (R.m.u32(((R.ebx + 0x10) | 0) >>> 0)) | 0; // 843f1e: mov ecx, dword ptr [ebx + 0x10]
        R.push(0x757ea0); // 843f21: push 0x757ea0
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 843f26: mov dword ptr [esp + 0x1c], edx
        R.push(0x8); // 843f2a: push 8
        R.push((R.ecx >>> 0)); // 843f2c: push ecx
        R.edx = (((R.esp + 0x20) | 0)) | 0; // 843f2d: lea edx, [esp + 0x20]
        R.push((R.eax >>> 0)); // 843f31: push eax
        R.push((R.edx >>> 0)); // 843f32: push edx
        R.call(0x946464, { n: 5, thisEcx: false, calleeClean: false }); // 843f33: call 0x946464
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 843f38: add esp, 0x14
        R.sub((R.eax >>> 0), (R.esi >>> 0), 32); // 843f3b: cmp eax, esi
        if (R.zf) { pc = 18; continue; } // 843f3d: je 0x843f83
        pc = 15; continue;
      case 15: // 843f3f
        R.edx = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 843f3f: mov edx, dword ptr [ebx]
        R.ecx = (R.m.u32(((R.ebx + 0x10) | 0) >>> 0)) | 0; // 843f41: mov ecx, dword ptr [ebx + 0x10]
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 843f44: sub eax, edx
        R.eax = (R.shr((R.eax >>> 0), 0x3, 32)) | 0; // 843f46: shr eax, 3
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 843f49: dec ecx
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 843f4a: cmp eax, ecx
        if (!R.cL) { pc = 17; continue; } // 843f4c: jge 0x843f68
        pc = 16; continue;
      case 16: // 843f4e
        R.ecx = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 843f4e: mov ecx, dword ptr [ebx]
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 843f50: inc eax
        R.edx = (R.m.u32(((R.ecx + R.eax * 8) | 0) >>> 0)) | 0; // 843f51: mov edx, dword ptr [ecx + eax*8]
        R.m.w32(((R.ecx + R.eax * 8 + -0x8) | 0) >>> 0, (R.edx >>> 0)); // 843f54: mov dword ptr [ecx + eax*8 - 8], edx
        R.edx = (R.m.u32(((R.ecx + R.eax * 8 + 0x4) | 0) >>> 0)) | 0; // 843f58: mov edx, dword ptr [ecx + eax*8 + 4]
        R.m.w32(((R.ecx + R.eax * 8 + -0x4) | 0) >>> 0, (R.edx >>> 0)); // 843f5c: mov dword ptr [ecx + eax*8 - 4], edx
        R.ecx = (R.m.u32(((R.ebx + 0x10) | 0) >>> 0)) | 0; // 843f60: mov ecx, dword ptr [ebx + 0x10]
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 843f63: dec ecx
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 843f64: cmp eax, ecx
        if (R.cL) { pc = 16; continue; } // 843f66: jl 0x843f4e
        pc = 17; continue;
      case 17: // 843f68
        R.edx = (R.m.u32(((R.ebx + 0x10) | 0) >>> 0)) | 0; // 843f68: mov edx, dword ptr [ebx + 0x10]
        R.eax = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 843f6b: mov eax, dword ptr [ebx]
        R.m.w32(((R.eax + R.edx * 8 + -0x4) | 0) >>> 0, (R.esi >>> 0)); // 843f6d: mov dword ptr [eax + edx*8 - 4], esi
        R.ecx = (R.m.u32(((R.ebx + 0x10) | 0) >>> 0)) | 0; // 843f71: mov ecx, dword ptr [ebx + 0x10]
        R.edx = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 843f74: mov edx, dword ptr [ebx]
        R.m.w32(((R.edx + R.ecx * 8 + -0x8) | 0) >>> 0, (R.esi >>> 0)); // 843f76: mov dword ptr [edx + ecx*8 - 8], esi
        R.eax = (R.m.u32(((R.ebx + 0x10) | 0) >>> 0)) | 0; // 843f7a: mov eax, dword ptr [ebx + 0x10]
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 843f7d: dec eax
        R.m.w32(((R.ebx + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 843f7e: mov dword ptr [ebx + 0x10], eax
        pc = 19; continue; // 843f81: jmp 0x843f8b
      case 18: // 843f83
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, 0x1); // 843f83: mov dword ptr [esp + 0x10], 1
        pc = 19; continue;
      default: return pc;
    }
  }
}
function f_843e10_3(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 19: // 843f8b
        R.eax = (R.m.u32(((R.ebx + 0x14) | 0) >>> 0)) | 0; // 843f8b: mov eax, dword ptr [ebx + 0x14]
        R.ecx = (R.m.u32(((R.ebx + 0x4) | 0) >>> 0)) | 0; // 843f8e: mov ecx, dword ptr [ebx + 4]
        R.push(0x844740); // 843f91: push 0x844740
        R.push(0x8); // 843f96: push 8
        R.push((R.eax >>> 0)); // 843f98: push eax
        R.edx = (((R.esp + 0x20) | 0)) | 0; // 843f99: lea edx, [esp + 0x20]
        R.push((R.ecx >>> 0)); // 843f9d: push ecx
        R.push((R.edx >>> 0)); // 843f9e: push edx
        R.call(0x946464, { n: 5, thisEcx: false, calleeClean: false }); // 843f9f: call 0x946464
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 843fa4: add esp, 0x14
        R.sub((R.eax >>> 0), (R.esi >>> 0), 32); // 843fa7: cmp eax, esi
        if (R.zf) { pc = 23; continue; } // 843fa9: je 0x843ff3
        pc = 20; continue;
      case 20: // 843fab
        R.edx = (R.m.u32(((R.ebx + 0x4) | 0) >>> 0)) | 0; // 843fab: mov edx, dword ptr [ebx + 4]
        R.ecx = (R.m.u32(((R.ebx + 0x14) | 0) >>> 0)) | 0; // 843fae: mov ecx, dword ptr [ebx + 0x14]
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 843fb1: sub eax, edx
        R.eax = (R.shr((R.eax >>> 0), 0x3, 32)) | 0; // 843fb3: shr eax, 3
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 843fb6: dec ecx
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 843fb7: cmp eax, ecx
        if (!R.cL) { pc = 22; continue; } // 843fb9: jge 0x843fd6
        pc = 21; continue;
      case 21: // 843fbb
        R.ecx = (R.m.u32(((R.ebx + 0x4) | 0) >>> 0)) | 0; // 843fbb: mov ecx, dword ptr [ebx + 4]
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 843fbe: inc eax
        R.edx = (R.m.u32(((R.ecx + R.eax * 8) | 0) >>> 0)) | 0; // 843fbf: mov edx, dword ptr [ecx + eax*8]
        R.m.w32(((R.ecx + R.eax * 8 + -0x8) | 0) >>> 0, (R.edx >>> 0)); // 843fc2: mov dword ptr [ecx + eax*8 - 8], edx
        R.edx = (R.m.u32(((R.ecx + R.eax * 8 + 0x4) | 0) >>> 0)) | 0; // 843fc6: mov edx, dword ptr [ecx + eax*8 + 4]
        R.m.w32(((R.ecx + R.eax * 8 + -0x4) | 0) >>> 0, (R.edx >>> 0)); // 843fca: mov dword ptr [ecx + eax*8 - 4], edx
        R.ecx = (R.m.u32(((R.ebx + 0x14) | 0) >>> 0)) | 0; // 843fce: mov ecx, dword ptr [ebx + 0x14]
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 843fd1: dec ecx
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 843fd2: cmp eax, ecx
        if (R.cL) { pc = 21; continue; } // 843fd4: jl 0x843fbb
        pc = 22; continue;
      case 22: // 843fd6
        R.edx = (R.m.u32(((R.ebx + 0x14) | 0) >>> 0)) | 0; // 843fd6: mov edx, dword ptr [ebx + 0x14]
        R.eax = (R.m.u32(((R.ebx + 0x4) | 0) >>> 0)) | 0; // 843fd9: mov eax, dword ptr [ebx + 4]
        R.m.w32(((R.eax + R.edx * 8 + -0x4) | 0) >>> 0, (R.esi >>> 0)); // 843fdc: mov dword ptr [eax + edx*8 - 4], esi
        R.ecx = (R.m.u32(((R.ebx + 0x14) | 0) >>> 0)) | 0; // 843fe0: mov ecx, dword ptr [ebx + 0x14]
        R.edx = (R.m.u32(((R.ebx + 0x4) | 0) >>> 0)) | 0; // 843fe3: mov edx, dword ptr [ebx + 4]
        R.m.w32(((R.edx + R.ecx * 8 + -0x8) | 0) >>> 0, (R.esi >>> 0)); // 843fe6: mov dword ptr [edx + ecx*8 - 8], esi
        R.eax = (R.m.u32(((R.ebx + 0x14) | 0) >>> 0)) | 0; // 843fea: mov eax, dword ptr [ebx + 0x14]
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 843fed: dec eax
        R.m.w32(((R.ebx + 0x14) | 0) >>> 0, (R.eax >>> 0)); // 843fee: mov dword ptr [ebx + 0x14], eax
        pc = 24; continue; // 843ff1: jmp 0x843ffb
      case 23: // 843ff3
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, 0x1); // 843ff3: mov dword ptr [esp + 0x10], 1
        pc = 24; continue;
      case 24: // 843ffb
        R.push((R.esi >>> 0)); // 843ffb: push esi
        R.push((R.esi >>> 0)); // 843ffc: push esi
        R.push(0x1); // 843ffd: push 1
        R.push((R.esi >>> 0)); // 843fff: push esi
        R.push((R.edi >>> 0)); // 844000: push edi
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 844001: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 844006: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 844009: test eax, eax
        if (!R.zf) { pc = 27; continue; } // 84400b: jne 0x844039
        pc = 25; continue;
      default: return pc;
    }
  }
}
function f_843e10_4(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 25: // 84400d
        R.sub(R.m.u32(((R.esp + 0x10) | 0) >>> 0), (R.esi >>> 0), 32); // 84400d: cmp dword ptr [esp + 0x10], esi
        if (!R.zf) { pc = 27; continue; } // 844011: jne 0x844039
        pc = 26; continue;
      case 26: // 844013
        R.eax = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 844013: mov eax, dword ptr [ebp]
        R.edx = (R.m.u32(((0xae2d0c) | 0) >>> 0)) | 0; // 844016: mov edx, dword ptr [0xae2d0c]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 84401c: lea ecx, [eax + eax*4]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 84401f: shl ecx, 4
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 844022: sub ecx, eax
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + R.edx + 0xb) | 0) >>> 0)) & 0xff) << 0)) | 0; // 844024: mov al, byte ptr [ecx + edx + 0xb]
        R.esi = (((R.ecx + R.edx + 0xb) | 0)) | 0; // 844028: lea esi, [ecx + edx + 0xb]
        R.ecx = ((R.ecx & 0xffffff00) | (((((R.eax >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 84402c: mov cl, al
        R.ecx = ((R.ecx & 0xffffff00) | (((R.incdec(((R.ecx >>> 0) & 0xff), -1, 8)) & 0xff) << 0)) | 0; // 84402e: dec cl
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 844030: xor cl, al
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0xf, 8)) & 0xff) << 0)) | 0; // 844032: and cl, 0xf
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 844035: xor cl, al
        R.m.w8(((R.esi) | 0) >>> 0, ((R.ecx >>> 0) & 0xff)); // 844037: mov byte ptr [esi], cl
        pc = 27; continue;
      case 27: // 844039
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 844039: mov eax, dword ptr [edi]
        R.edx = (R.m.u32(((R.ebx + 0xdc) | 0) >>> 0)) | 0; // 84403b: mov edx, dword ptr [ebx + 0xdc]
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 844041: mov ecx, dword ptr [0xae1050]
        R.push((R.edi >>> 0)); // 844047: push edi
        R.esi = (((R.eax + R.eax * 8) | 0)) | 0; // 844048: lea esi, [eax + eax*8]
        R.push((R.ebp >>> 0)); // 84404b: push ebp
        R.esi = (R.add((R.esi >>> 0), (R.edx >>> 0), 32)) | 0; // 84404c: add esi, edx
        R.call(0x4cf5f0, { n: 2, thisEcx: true, calleeClean: true }); // 84404e: call 0x4cf5f0
        R.m.w32(((R.esp + 0x7c) | 0) >>> 0, (R.eax >>> 0)); // 844053: mov dword ptr [esp + 0x7c], eax
        R.edi = (R.logic((R.edi >>> 0) ^ (R.edi >>> 0), 32)) | 0; // 844057: xor edi, edi
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, 0x28); // 844059: mov dword ptr [esp + 0x10], 0x28
        pc = 28; continue;
      case 28: // 844061
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x88) | 0) >>> 0)) & 0xff) << 0)) | 0; // 844061: mov al, byte ptr [esp + 0x88]
        R.sub(((R.eax >>> 0) & 0xff), 0x1, 8); // 844068: cmp al, 1
        if (!R.zf) { pc = 31; continue; } // 84406a: jne 0x84407a
        pc = 29; continue;
      case 29: // 84406c
        R.edx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 84406c: mov edx, dword ptr [esi]
        R.sub(R.m.u8(((R.edi + R.edx) | 0) >>> 0), 0xb, 8); // 84406e: cmp byte ptr [edi + edx], 0xb
        if (R.zf) { pc = 52; continue; } // 844072: je 0x84422a
        pc = 30; continue;
      case 30: // 844078
        pc = 33; continue; // 844078: jmp 0x84408a
      case 31: // 84407a
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 84407a: test al, al
        if (!R.zf) { pc = 33; continue; } // 84407c: jne 0x84408a
        pc = 32; continue;
      case 32: // 84407e
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 84407e: mov eax, dword ptr [esi]
        R.sub(R.m.u8(((R.edi + R.eax) | 0) >>> 0), 0xb, 8); // 844080: cmp byte ptr [edi + eax], 0xb
        if (!R.zf) { pc = 52; continue; } // 844084: jne 0x84422a
        pc = 33; continue;
      default: return pc;
    }
  }
}
function f_843e10_5(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 33: // 84408a
        R.ecx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 84408a: mov ecx, dword ptr [esi]
        R.edx = (R.m.u32(((R.edi + R.ecx + 0xf) | 0) >>> 0)) | 0; // 84408c: mov edx, dword ptr [edi + ecx + 0xf]
        R.eax = (((R.edi + R.ecx) | 0)) | 0; // 844090: lea eax, [edi + ecx]
        R.ecx = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 844093: mov ecx, dword ptr [ebp]
        R.sub((R.edx >>> 0), (R.ecx >>> 0), 32); // 844096: cmp edx, ecx
        if (R.zf) { pc = 36; continue; } // 844098: je 0x8440b1
        pc = 34; continue;
      case 34: // 84409a
        R.sub(R.m.u8(((R.esp + 0x84) | 0) >>> 0), 0x4, 8); // 84409a: cmp byte ptr [esp + 0x84], 4
        if (!R.zf) { pc = 52; continue; } // 8440a2: jne 0x84422a
        pc = 35; continue;
      case 35: // 8440a8
        R.sub(R.m.u32(((R.eax + 0x13) | 0) >>> 0), (R.ecx >>> 0), 32); // 8440a8: cmp dword ptr [eax + 0x13], ecx
        if (!R.zf) { pc = 52; continue; } // 8440ab: jne 0x84422a
        pc = 36; continue;
      case 36: // 8440b1
        R.edx = (((R.m.u8(((R.esp + 0x84) | 0) >>> 0)) << 24 >> 24)) | 0; // 8440b1: movsx edx, byte ptr [esp + 0x84]
        R.edx = (R.incdec((R.edx >>> 0), -1, 32)) | 0; // 8440b9: dec edx
        R.sub((R.edx >>> 0), 0x4, 32); // 8440ba: cmp edx, 4
        if (!R.cBE) { pc = 52; continue; } // 8440bd: ja 0x84422a
        pc = 37; continue;
      case 37: // 8440c3
        pc = [38, 41, 46, 48, 42][R.edx >>> 0] ?? -2; continue; // 8440c3: jmp dword ptr [edx*4 + 0x844264]
      case 38: // 8440ca
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 8440ca: or ecx, 0xffffffff
        R.m.w32(((R.eax + 0xf) | 0) >>> 0, (R.ecx >>> 0)); // 8440cd: mov dword ptr [eax + 0xf], ecx
        R.edx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8440d0: mov edx, dword ptr [esi]
        R.m.w32(((R.edi + R.edx + 0x17) | 0) >>> 0, (R.ecx >>> 0)); // 8440d2: mov dword ptr [edi + edx + 0x17], ecx
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8440d6: mov eax, dword ptr [esi]
        R.edx = (R.m.u32(((R.edi + R.eax + 0x13) | 0) >>> 0)) | 0; // 8440d8: mov edx, dword ptr [edi + eax + 0x13]
        R.eax = (((R.edi + R.eax + 0x13) | 0)) | 0; // 8440dc: lea eax, [edi + eax + 0x13]
        R.sub((R.edx >>> 0), R.m.u32(((R.ebp) | 0) >>> 0), 32); // 8440e0: cmp edx, dword ptr [ebp]
        if (!R.zf) { pc = 40; continue; } // 8440e3: jne 0x8440e7
        pc = 39; continue;
      case 39: // 8440e5
        R.m.w32(((R.eax) | 0) >>> 0, (R.ecx >>> 0)); // 8440e5: mov dword ptr [eax], ecx
        pc = 40; continue;
      case 40: // 8440e7
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8440e7: mov eax, dword ptr [esi]
        R.push((R.ebp >>> 0)); // 8440e9: push ebp
        R.edx = ((R.edi >>> 0)) | 0; // 8440ea: mov edx, edi
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.edi + R.eax + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8440ec: mov cl, byte ptr [edi + eax + 0x24]
        R.eax = (((R.edi + R.eax + 0x24) | 0)) | 0; // 8440f0: lea eax, [edi + eax + 0x24]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0xfe, 8)) & 0xff) << 0)) | 0; // 8440f4: and cl, 0xfe
        R.m.w8(((R.eax) | 0) >>> 0, ((R.ecx >>> 0) & 0xff)); // 8440f7: mov byte ptr [eax], cl
        R.ecx = (R.m.u32(((R.esp + 0x84) | 0) >>> 0)) | 0; // 8440f9: mov ecx, dword ptr [esp + 0x84]
        R.push((R.ecx >>> 0)); // 844100: push ecx
        R.ecx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 844101: mov ecx, dword ptr [esi]
        R.edx = (R.add((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 844103: add edx, ecx
        R.ecx = ((R.ebx >>> 0)) | 0; // 844105: mov ecx, ebx
        R.push((R.edx >>> 0)); // 844107: push edx
        R.call(0x83f3a0, { n: 3, thisEcx: true, calleeClean: true }); // 844108: call 0x83f3a0
        pc = 52; continue; // 84410d: jmp 0x84422a
      default: return pc;
    }
  }
}
function f_843e10_6(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 41: // 844112
        R.eax = (((R.esp + 0x1c) | 0)) | 0; // 844112: lea eax, [esp + 0x1c]
        R.push(0x78); // 844116: push 0x78
        R.push((R.eax >>> 0)); // 844118: push eax
        R.ecx = (0xae2c90) | 0; // 844119: mov ecx, 0xae2c90
        R.call(0x54c5b0, { n: 2, thisEcx: true, calleeClean: true }); // 84411e: call 0x54c5b0
        R.push((R.eax >>> 0)); // 844123: push eax
        R.ecx = (((R.esp + 0x28) | 0)) | 0; // 844124: lea ecx, [esp + 0x28]
        pc = 43; continue; // 844128: jmp 0x844140
      case 42: // 84412a
        R.eax = (((R.esp + 0x2c) | 0)) | 0; // 84412a: lea eax, [esp + 0x2c]
        R.push(0xe); // 84412e: push 0xe
        R.push((R.eax >>> 0)); // 844130: push eax
        R.ecx = (0xae2c90) | 0; // 844131: mov ecx, 0xae2c90
        R.call(0x54c5b0, { n: 2, thisEcx: true, calleeClean: true }); // 844136: call 0x54c5b0
        R.push((R.eax >>> 0)); // 84413b: push eax
        R.ecx = (((R.esp + 0x38) | 0)) | 0; // 84413c: lea ecx, [esp + 0x38]
        pc = 43; continue;
      case 43: // 844140
        R.edx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 844140: mov edx, dword ptr [esi]
        R.push((R.ecx >>> 0)); // 844142: push ecx
        R.ecx = (((R.edi + R.edx + 0x1b) | 0)) | 0; // 844143: lea ecx, [edi + edx + 0x1b]
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 844147: call 0x417c10
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 84414c: mov eax, dword ptr [esi]
        R.ecx = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 84414e: mov ecx, dword ptr [ebp]
        R.m.w32(((R.edi + R.eax + 0x13) | 0) >>> 0, (R.ecx >>> 0)); // 844151: mov dword ptr [edi + eax + 0x13], ecx
        R.edx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 844155: mov edx, dword ptr [esi]
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 844157: xor eax, eax
        R.m.w32(((R.edi + R.edx + 0x17) | 0) >>> 0, 0xffffffff); // 844159: mov dword ptr [edi + edx + 0x17], 0xffffffff
        R.ecx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 844161: mov ecx, dword ptr [esi]
        R.m.w32(((R.edi + R.ecx + 0xb) | 0) >>> 0, (R.eax >>> 0)); // 844163: mov dword ptr [edi + ecx + 0xb], eax
        R.edx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 844167: mov edx, dword ptr [esi]
        R.ecx = (R.m.u32(((R.esp + 0x7c) | 0) >>> 0)) | 0; // 844169: mov ecx, dword ptr [esp + 0x7c]
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 84416d: cmp ecx, eax
        R.m.w32(((R.edi + R.edx + 0x7) | 0) >>> 0, (R.eax >>> 0)); // 84416f: mov dword ptr [edi + edx + 7], eax
        if (R.zf) { pc = 45; continue; } // 844173: je 0x84418d
        pc = 44; continue;
      case 44: // 844175
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 844175: mov eax, dword ptr [esi]
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.ecx + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 844177: mov dl, byte ptr [ecx + 0x4f]
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) & 0xf, 8)) & 0xff) << 0)) | 0; // 84417a: and dl, 0xf
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edi + R.eax + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84417d: mov al, byte ptr [edi + eax + 0x24]
        R.eax = ((R.eax & 0xffffff00) | (((R.shr(((R.eax >>> 0) & 0xff), 0x1, 8)) & 0xff) << 0)) | 0; // 844181: shr al, 1
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf, 8)) & 0xff) << 0)) | 0; // 844183: and al, 0xf
        R.eax = ((R.eax & 0xffffff00) | (((R.shl(((R.eax >>> 0) & 0xff), 0x4, 8)) & 0xff) << 0)) | 0; // 844185: shl al, 4
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) | ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 844188: or dl, al
        R.m.w8(((R.ecx + 0x4f) | 0) >>> 0, ((R.edx >>> 0) & 0xff)); // 84418a: mov byte ptr [ecx + 0x4f], dl
        pc = 45; continue;
      case 45: // 84418d
        R.m.w8(((R.esi + 0x8) | 0) >>> 0, 0x64); // 84418d: mov byte ptr [esi + 8], 0x64
        pc = 52; continue; // 844191: jmp 0x84422a
      default: return pc;
    }
  }
}
function f_843e10_7(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 46: // 844196
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 844196: or ecx, 0xffffffff
        R.push(0x78); // 844199: push 0x78
        R.m.w32(((R.eax + 0xf) | 0) >>> 0, (R.ecx >>> 0)); // 84419b: mov dword ptr [eax + 0xf], ecx
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 84419e: mov eax, dword ptr [esi]
        R.m.w32(((R.edi + R.eax + 0x17) | 0) >>> 0, (R.ecx >>> 0)); // 8441a0: mov dword ptr [edi + eax + 0x17], ecx
        R.ecx = (((R.esp + 0x40) | 0)) | 0; // 8441a4: lea ecx, [esp + 0x40]
        R.push((R.ecx >>> 0)); // 8441a8: push ecx
        R.ecx = (0xae2c90) | 0; // 8441a9: mov ecx, 0xae2c90
        R.call(0x54c8e0, { n: 2, thisEcx: true, calleeClean: true }); // 8441ae: call 0x54c8e0
        R.push((R.eax >>> 0)); // 8441b3: push eax
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8441b4: mov eax, dword ptr [esi]
        R.edx = (((R.esp + 0x48) | 0)) | 0; // 8441b6: lea edx, [esp + 0x48]
        R.push((R.edx >>> 0)); // 8441ba: push edx
        R.ecx = (((R.edi + R.eax + 0x1b) | 0)) | 0; // 8441bb: lea ecx, [edi + eax + 0x1b]
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 8441bf: call 0x417c10
        R.ecx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8441c4: mov ecx, dword ptr [esi]
        R.edx = (R.m.u32(((R.edi + R.ecx + 0x13) | 0) >>> 0)) | 0; // 8441c6: mov edx, dword ptr [edi + ecx + 0x13]
        R.eax = (((R.edi + R.ecx + 0x13) | 0)) | 0; // 8441ca: lea eax, [edi + ecx + 0x13]
        R.sub((R.edx >>> 0), R.m.u32(((R.ebp) | 0) >>> 0), 32); // 8441ce: cmp edx, dword ptr [ebp]
        if (!R.zf) { pc = 52; continue; } // 8441d1: jne 0x84422a
        pc = 47; continue;
      case 47: // 8441d3
        R.m.w32(((R.eax) | 0) >>> 0, 0xffffffff); // 8441d3: mov dword ptr [eax], 0xffffffff
        pc = 52; continue; // 8441d9: jmp 0x84422a
      case 48: // 8441db
        R.sub(R.m.u32(((R.eax + 0x13) | 0) >>> 0), (R.ecx >>> 0), 32); // 8441db: cmp dword ptr [eax + 0x13], ecx
        if (!R.zf) { pc = 50; continue; } // 8441de: jne 0x8441e7
        pc = 49; continue;
      case 49: // 8441e0
        R.m.w32(((R.eax + 0x13) | 0) >>> 0, 0xffffffff); // 8441e0: mov dword ptr [eax + 0x13], 0xffffffff
        pc = 50; continue;
      case 50: // 8441e7
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8441e7: mov eax, dword ptr [esi]
        R.edx = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 8441e9: mov edx, dword ptr [ebp]
        R.ecx = (R.m.u32(((R.edi + R.eax + 0xf) | 0) >>> 0)) | 0; // 8441ec: mov ecx, dword ptr [edi + eax + 0xf]
        R.eax = (((R.edi + R.eax + 0xf) | 0)) | 0; // 8441f0: lea eax, [edi + eax + 0xf]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 8441f4: cmp ecx, edx
        if (!R.zf) { pc = 52; continue; } // 8441f6: jne 0x84422a
        pc = 51; continue;
      case 51: // 8441f8
        R.m.w32(((R.eax) | 0) >>> 0, 0xffffffff); // 8441f8: mov dword ptr [eax], 0xffffffff
        R.edx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8441fe: mov edx, dword ptr [esi]
        R.eax = (((R.esp + 0x4c) | 0)) | 0; // 844200: lea eax, [esp + 0x4c]
        R.push(0x78); // 844204: push 0x78
        R.push((R.eax >>> 0)); // 844206: push eax
        R.ecx = (0xae2c90) | 0; // 844207: mov ecx, 0xae2c90
        R.m.w32(((R.edi + R.edx + 0x17) | 0) >>> 0, 0xffffffff); // 84420c: mov dword ptr [edi + edx + 0x17], 0xffffffff
        R.call(0x54c8e0, { n: 2, thisEcx: true, calleeClean: true }); // 844214: call 0x54c8e0
        R.edx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 844219: mov edx, dword ptr [esi]
        R.ecx = (((R.esp + 0x54) | 0)) | 0; // 84421b: lea ecx, [esp + 0x54]
        R.push((R.eax >>> 0)); // 84421f: push eax
        R.push((R.ecx >>> 0)); // 844220: push ecx
        R.ecx = (((R.edi + R.edx + 0x1b) | 0)) | 0; // 844221: lea ecx, [edi + edx + 0x1b]
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 844225: call 0x417c10
        pc = 52; continue;
      default: return pc;
    }
  }
}
function f_843e10_8(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 52: // 84422a
        R.eax = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 84422a: mov eax, dword ptr [esp + 0x10]
        R.edi = (R.add((R.edi >>> 0), 0x25, 32)) | 0; // 84422e: add edi, 0x25
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 844231: dec eax
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 844232: mov dword ptr [esp + 0x10], eax
        if (!R.zf) { pc = 28; continue; } // 844236: jne 0x844061
        pc = 53; continue;
      case 53: // 84423c
        R.ecx = (((R.esp + 0x5c) | 0)) | 0; // 84423c: lea ecx, [esp + 0x5c]
        R.m.w32(((R.esp + 0x74) | 0) >>> 0, 0xffffffff); // 844240: mov dword ptr [esp + 0x74], 0xffffffff
        R.call(0x68d040, { n: 0, thisEcx: true, calleeClean: false }); // 844248: call 0x68d040
        R.eax = ((R.eax & 0xffffff00) | (((0x1) & 0xff) << 0)) | 0; // 84424d: mov al, 1
        pc = 54; continue;
      case 54: // 84424f
        R.ecx = (R.m.u32(((R.esp + 0x6c) | 0) >>> 0)) | 0; // 84424f: mov ecx, dword ptr [esp + 0x6c]
        R.edi = (R.pop()) | 0; // 844253: pop edi
        R.esi = (R.pop()) | 0; // 844254: pop esi
        R.ebp = (R.pop()) | 0; // 844255: pop ebp
        R.ebx = (R.pop()) | 0; // 844256: pop ebx
        /* fs */ // 844257: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x68, 32)) | 0; // 84425e: add esp, 0x68
        R.rv = R.ret(4); return -1; // 844261: ret 0x10
      default: return pc;
    }
  }
}
export function f_843e10(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 55) throw new Error(`f_843e10: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_843e10_0(R, pc); break;
      case 1: np = f_843e10_1(R, pc); break;
      case 2: np = f_843e10_2(R, pc); break;
      case 3: np = f_843e10_3(R, pc); break;
      case 4: np = f_843e10_4(R, pc); break;
      case 5: np = f_843e10_5(R, pc); break;
      case 6: np = f_843e10_6(R, pc); break;
      case 7: np = f_843e10_7(R, pc); break;
      case 8: np = f_843e10_8(R, pc); break;
      default: throw new Error(`f_843e10: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_843e10: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_843e10.shared = true;
