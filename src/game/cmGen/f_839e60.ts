// 0x839e60 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4cf5a0=1c, 4cf5f0=2tc, 5a8f60=0, 5cc7d0=0, 5e8290=9, 844300=2c, 90d130=0, 944c9f=0, 944cff=5t, 944e46=1, 9452ca=1t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x839e60, 0x839e74, 0x839e79, 0x839e7f, 0x839e8e, 0x839e94, 0x839e97, 0x839ea6, 0x839eb9, 0x839eca, 0x839ecb, 0x839ed8, 0x839ee0, 0x839ee6, 0x839ef4, 0x839ef6, 0x839ef8, 0x839f1e, 0x839f25, 0x839f2d, 0x839f55, 0x839f5a, 0x839f6f, 0x839f89, 0x839fab, 0x839fce, 0x83a027, 0x83a03f, 0x83a0b3, 0x83a0b5, 0x83a0c6, 0x83a0de, 0x83a0f4, 0x83a0fb, 0x83a10d, 0x83a122, 0x83a12f]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5]);
function f_839e60_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 839e60
        R.esp = (R.sub((R.esp >>> 0), 0x204, 32)) | 0; // 839e60: sub esp, 0x204
        R.push((R.ebx >>> 0)); // 839e66: push ebx
        R.push((R.ebp >>> 0)); // 839e67: push ebp
        R.push((R.esi >>> 0)); // 839e68: push esi
        R.esi = ((R.ecx >>> 0)) | 0; // 839e69: mov esi, ecx
        R.push((R.edi >>> 0)); // 839e6b: push edi
        R.ebp = (0x2) | 0; // 839e6c: mov ebp, 2
        R.edi = (((R.esi + 0x18) | 0)) | 0; // 839e71: lea edi, [esi + 0x18]
        pc = 1; continue;
      case 1: // 839e74
        R.ebx = (0x10) | 0; // 839e74: mov ebx, 0x10
        pc = 2; continue;
      case 2: // 839e79
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 839e79: mov eax, dword ptr [edi]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 839e7b: test eax, eax
        if (R.zf) { pc = 4; continue; } // 839e7d: je 0x839e8e
        pc = 3; continue;
      case 3: // 839e7f
        R.push((R.eax >>> 0)); // 839e7f: push eax
        R.call(0x9452ca, { n: 1, thisEcx: true, calleeClean: false }); // 839e80: call 0x9452ca
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 839e85: add esp, 4
        R.m.w32(((R.edi) | 0) >>> 0, 0x0); // 839e88: mov dword ptr [edi], 0
        pc = 4; continue;
      case 4: // 839e8e
        R.edi = (R.add((R.edi >>> 0), 0x4, 32)) | 0; // 839e8e: add edi, 4
        R.ebx = (R.incdec((R.ebx >>> 0), -1, 32)) | 0; // 839e91: dec ebx
        if (!R.zf) { pc = 2; continue; } // 839e92: jne 0x839e79
        pc = 5; continue;
      case 5: // 839e94
        R.ebp = (R.incdec((R.ebp >>> 0), -1, 32)) | 0; // 839e94: dec ebp
        if (!R.zf) { pc = 1; continue; } // 839e95: jne 0x839e74
        pc = 6; continue;
      case 6: // 839e97
        R.m.w32(((R.esi + 0xd8) | 0) >>> 0, 0x0); // 839e97: mov dword ptr [esi + 0xd8], 0
        R.m.w8(((R.esp + 0x10) | 0) >>> 0, 0x0); // 839ea1: mov byte ptr [esp + 0x10], 0
        pc = 7; continue;
      case 7: // 839ea6
        R.eax = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 839ea6: mov eax, dword ptr [0xae2364]
        R.edi = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 839eab: mov edi, dword ptr [0xae23bc]
        R.ebx = (R.logic((R.ebx >>> 0) ^ (R.ebx >>> 0), 32)) | 0; // 839eb1: xor ebx, ebx
        R.ebp = (R.logic((R.ebp >>> 0) ^ (R.ebp >>> 0), 32)) | 0; // 839eb3: xor ebp, ebp
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 839eb5: test eax, eax
        if (R.cLE) { pc = 11; continue; } // 839eb7: jle 0x839ed8
        pc = 8; continue;
      case 8: // 839eb9
        R.eax = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 839eb9: mov eax, dword ptr [esp + 0x10]
        R.ecx = ((R.esi >>> 0)) | 0; // 839ebd: mov ecx, esi
        R.push((R.eax >>> 0)); // 839ebf: push eax
        R.push((R.edi >>> 0)); // 839ec0: push edi
        R.call(0x844300, { n: 2, thisEcx: false, calleeClean: true }); // 839ec1: call 0x844300
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 839ec6: test al, al
        if (R.zf) { pc = 10; continue; } // 839ec8: je 0x839ecb
        pc = 9; continue;
      case 9: // 839eca
        R.ebx = (R.incdec((R.ebx >>> 0), 1, 32)) | 0; // 839eca: inc ebx
        pc = 10; continue;
      default: return pc;
    }
  }
}
function f_839e60_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 10: // 839ecb
        R.eax = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 839ecb: mov eax, dword ptr [0xae2364]
        R.ebp = (R.incdec((R.ebp >>> 0), 1, 32)) | 0; // 839ed0: inc ebp
        R.edi = (R.add((R.edi >>> 0), 0x6e, 32)) | 0; // 839ed1: add edi, 0x6e
        R.sub((R.ebp >>> 0), (R.eax >>> 0), 32); // 839ed4: cmp ebp, eax
        if (R.cL) { pc = 8; continue; } // 839ed6: jl 0x839eb9
        pc = 11; continue;
      case 11: // 839ed8
        R.sub((R.ebx >>> 0), R.m.u32(((R.esi + 0xd8) | 0) >>> 0), 32); // 839ed8: cmp ebx, dword ptr [esi + 0xd8]
        if (R.cLE) { pc = 13; continue; } // 839ede: jle 0x839ee6
        pc = 12; continue;
      case 12: // 839ee0
        R.m.w32(((R.esi + 0xd8) | 0) >>> 0, (R.ebx >>> 0)); // 839ee0: mov dword ptr [esi + 0xd8], ebx
        pc = 13; continue;
      case 13: // 839ee6
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x10) | 0) >>> 0)) & 0xff) << 0)) | 0; // 839ee6: mov al, byte ptr [esp + 0x10]
        R.eax = ((R.eax & 0xffffff00) | (((R.incdec(((R.eax >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 839eea: inc al
        R.sub(((R.eax >>> 0) & 0xff), 0x10, 8); // 839eec: cmp al, 0x10
        R.m.w8(((R.esp + 0x10) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 839eee: mov byte ptr [esp + 0x10], al
        if (R.cL) { pc = 7; continue; } // 839ef2: jl 0x839ea6
        pc = 14; continue;
      case 14: // 839ef4
        R.edi = (R.logic((R.edi >>> 0) ^ (R.edi >>> 0), 32)) | 0; // 839ef4: xor edi, edi
        pc = 15; continue;
      case 15: // 839ef6
        R.ebx = ((R.ebx & 0xffffff00) | (((R.logic(((R.ebx >>> 0) & 0xff) ^ ((R.ebx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 839ef6: xor bl, bl
        pc = 16; continue;
      case 16: // 839ef8
        R.eax = (R.m.u32(((R.esi + 0xd8) | 0) >>> 0)) | 0; // 839ef8: mov eax, dword ptr [esi + 0xd8]
        R.ecx = (((R.eax + R.eax * 2) | 0)) | 0; // 839efe: lea ecx, [eax + eax*2]
        R.ecx = (R.shl((R.ecx >>> 0), 0x2, 32)) | 0; // 839f01: shl ecx, 2
        R.push((R.ecx >>> 0)); // 839f04: push ecx
        R.call(0x944e46, { n: 1, thisEcx: false, calleeClean: false }); // 839f05: call 0x944e46
        R.edx = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 839f0a: movsx edx, bl
        R.edx = (R.add((R.edx >>> 0), (R.edi >>> 0), 32)) | 0; // 839f0d: add edx, edi
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 839f0f: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 839f12: test eax, eax
        R.m.w32(((R.esi + R.edx * 4 + 0x18) | 0) >>> 0, (R.eax >>> 0)); // 839f14: mov dword ptr [esi + edx*4 + 0x18], eax
        if (R.zf) { pc = 27; continue; } // 839f18: je 0x83a03f
        pc = 17; continue;
      case 17: // 839f1e
        R.ebx = ((R.ebx & 0xffffff00) | (((R.incdec(((R.ebx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 839f1e: inc bl
        R.sub(((R.ebx >>> 0) & 0xff), 0x10, 8); // 839f20: cmp bl, 0x10
        if (R.cL) { pc = 16; continue; } // 839f23: jl 0x839ef8
        pc = 18; continue;
      case 18: // 839f25
        R.edi = (R.add((R.edi >>> 0), 0x10, 32)) | 0; // 839f25: add edi, 0x10
        R.sub((R.edi >>> 0), 0x20, 32); // 839f28: cmp edi, 0x20
        if (R.cL) { pc = 15; continue; } // 839f2b: jl 0x839ef6
        pc = 19; continue;
      default: return pc;
    }
  }
}
function f_839e60_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 19: // 839f2d
        R.ecx = (0x10) | 0; // 839f2d: mov ecx, 0x10
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 839f32: xor eax, eax
        R.edi = (((R.esi + 0x98) | 0)) | 0; // 839f34: lea edi, [esi + 0x98]
        R.ebx = (R.logic((R.ebx >>> 0) ^ (R.ebx >>> 0), 32)) | 0; // 839f3a: xor ebx, ebx
        R.str('rep stosd'); // 839f3c: rep stosd dword ptr es:[edi], eax
        R.ecx = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 839f3e: mov ecx, dword ptr [0xae2364]
        R.ebp = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 839f44: mov ebp, dword ptr [0xae23bc]
        R.ecx = (R.add((R.ecx >>> 0), 0xfffffff0, 32)) | 0; // 839f4a: add ecx, -0x10
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 839f4d: test ecx, ecx
        if (R.cLE) { pc = 35; continue; } // 839f4f: jle 0x83a122
        pc = 20; continue;
      case 20: // 839f55
        R.m.w8(((R.esp + 0x10) | 0) >>> 0, 0x0); // 839f55: mov byte ptr [esp + 0x10], 0
        pc = 21; continue;
      case 21: // 839f5a
        R.edx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 839f5a: mov edx, dword ptr [esp + 0x10]
        R.ecx = ((R.esi >>> 0)) | 0; // 839f5e: mov ecx, esi
        R.push((R.edx >>> 0)); // 839f60: push edx
        R.push((R.ebp >>> 0)); // 839f61: push ebp
        R.call(0x844300, { n: 2, thisEcx: false, calleeClean: true }); // 839f62: call 0x844300
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 839f67: test al, al
        if (R.zf) { pc = 33; continue; } // 839f69: je 0x83a0fb
        pc = 22; continue;
      case 22: // 839f6f
        R.edi = (((R.m.u8(((R.esp + 0x10) | 0) >>> 0)) << 24 >> 24)) | 0; // 839f6f: movsx edi, byte ptr [esp + 0x10]
        R.ecx = (R.m.u32(((R.esi + 0xd8) | 0) >>> 0)) | 0; // 839f74: mov ecx, dword ptr [esi + 0xd8]
        R.eax = (R.m.u32(((R.esi + R.edi * 4 + 0x98) | 0) >>> 0)) | 0; // 839f7a: mov eax, dword ptr [esi + edi*4 + 0x98]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 839f81: cmp eax, ecx
        if (!R.cL) { pc = 36; continue; } // 839f83: jge 0x83a12f
        pc = 23; continue;
      case 23: // 839f89
        R.ecx = (R.m.u32(((R.esi + R.edi * 4 + 0x18) | 0) >>> 0)) | 0; // 839f89: mov ecx, dword ptr [esi + edi*4 + 0x18]
        R.eax = (((R.eax + R.eax * 2) | 0)) | 0; // 839f8d: lea eax, [eax + eax*2]
        R.m.w32(((R.ecx + R.eax * 4) | 0) >>> 0, (R.ebx >>> 0)); // 839f90: mov dword ptr [ecx + eax*4], ebx
        R.eax = (R.m.u32(((R.esi + R.edi * 4 + 0x98) | 0) >>> 0)) | 0; // 839f93: mov eax, dword ptr [esi + edi*4 + 0x98]
        R.edx = (((R.eax + R.eax * 2) | 0)) | 0; // 839f9a: lea edx, [eax + eax*2]
        R.eax = (R.m.u32(((R.esi + R.edi * 4 + 0x58) | 0) >>> 0)) | 0; // 839f9d: mov eax, dword ptr [esi + edi*4 + 0x58]
        R.m.w32(((R.eax + R.edx * 4) | 0) >>> 0, (R.ebx >>> 0)); // 839fa1: mov dword ptr [eax + edx*4], ebx
        R.eax = (R.m.u32(((R.ebp + 0x1a) | 0) >>> 0)) | 0; // 839fa4: mov eax, dword ptr [ebp + 0x1a]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 839fa7: test eax, eax
        if (!R.zf) { pc = 25; continue; } // 839fa9: jne 0x839fce
        pc = 24; continue;
      case 24: // 839fab
        R.edx = (R.m.u32(((0xae2350) | 0) >>> 0)) | 0; // 839fab: mov edx, dword ptr [0xae2350]
        R.push((R.edx >>> 0)); // 839fb1: push edx
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 839fb2: call 0x90cfc0
        R.edx = (R.m.u32(((0xae23a8) | 0) >>> 0)) | 0; // 839fb7: mov edx, dword ptr [0xae23a8]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 839fbd: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 839fc0: shl ecx, 4
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 839fc3: add esp, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 839fc6: add ecx, eax
        R.eax = (((R.edx + R.ecx * 2) | 0)) | 0; // 839fc8: lea eax, [edx + ecx*2]
        R.m.w32(((R.ebp + 0x1a) | 0) >>> 0, (R.eax >>> 0)); // 839fcb: mov dword ptr [ebp + 0x1a], eax
        pc = 25; continue;
      default: return pc;
    }
  }
}
function f_839e60_3(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 25: // 839fce
        R.ecx = (R.m.u32(((R.esi + R.edi * 4 + 0x98) | 0) >>> 0)) | 0; // 839fce: mov ecx, dword ptr [esi + edi*4 + 0x98]
        R.edx = (R.m.u32(((R.esi + R.edi * 4 + 0x18) | 0) >>> 0)) | 0; // 839fd5: mov edx, dword ptr [esi + edi*4 + 0x18]
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 839fd9: mov eax, dword ptr [eax]
        R.push((R.ebp >>> 0)); // 839fdb: push ebp
        R.ecx = (((R.ecx + R.ecx * 2) | 0)) | 0; // 839fdc: lea ecx, [ecx + ecx*2]
        R.m.w32(((R.edx + R.ecx * 4 + 0x4) | 0) >>> 0, (R.eax >>> 0)); // 839fdf: mov dword ptr [edx + ecx*4 + 4], eax
        R.eax = (R.m.u32(((R.esi + R.edi * 4 + 0x98) | 0) >>> 0)) | 0; // 839fe3: mov eax, dword ptr [esi + edi*4 + 0x98]
        R.ecx = (R.m.u32(((R.ebp + 0x1a) | 0) >>> 0)) | 0; // 839fea: mov ecx, dword ptr [ebp + 0x1a]
        R.edx = (((R.eax + R.eax * 2) | 0)) | 0; // 839fed: lea edx, [eax + eax*2]
        R.eax = (R.m.u32(((R.esi + R.edi * 4 + 0x58) | 0) >>> 0)) | 0; // 839ff0: mov eax, dword ptr [esi + edi*4 + 0x58]
        R.ecx = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 839ff4: mov ecx, dword ptr [ecx]
        R.m.w32(((R.eax + R.edx * 4 + 0x4) | 0) >>> 0, (R.ecx >>> 0)); // 839ff6: mov dword ptr [eax + edx*4 + 4], ecx
        R.eax = (R.m.u32(((R.esi + R.edi * 4 + 0x98) | 0) >>> 0)) | 0; // 839ffa: mov eax, dword ptr [esi + edi*4 + 0x98]
        R.ecx = (R.m.u32(((R.ebp + 0x52) | 0) >>> 0)) | 0; // 83a001: mov ecx, dword ptr [ebp + 0x52]
        R.edx = (((R.eax + R.eax * 2) | 0)) | 0; // 83a004: lea edx, [eax + eax*2]
        R.eax = (R.m.u32(((R.esi + R.edi * 4 + 0x18) | 0) >>> 0)) | 0; // 83a007: mov eax, dword ptr [esi + edi*4 + 0x18]
        R.m.w32(((R.eax + R.edx * 4 + 0x8) | 0) >>> 0, (R.ecx >>> 0)); // 83a00b: mov dword ptr [eax + edx*4 + 8], ecx
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 83a00f: mov ecx, dword ptr [0xae1050]
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 83a015: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83a01a: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 83a01c: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 28; continue; } // 83a021: je 0x83a0b3
        pc = 26; continue;
      case 26: // 83a027
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 83a027: mov eax, dword ptr [eax + 4]
        R.ecx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 83a02a: mov ecx, dword ptr [0xae23b4]
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 83a030: lea edx, [eax + eax*8]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 83a033: shl edx, 4
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 83a036: add edx, eax
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 83a038: add ecx, eax
        R.eax = (((R.ecx + R.edx * 4) | 0)) | 0; // 83a03a: lea eax, [ecx + edx*4]
        pc = 29; continue; // 83a03d: jmp 0x83a0b5
      default: return pc;
    }
  }
}
function f_839e60_4(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 27: // 83a03f
        R.eax = (((R.esp + 0x14) | 0)) | 0; // 83a03f: lea eax, [esp + 0x14]
        R.ecx = (((R.esp + 0x114) | 0)) | 0; // 83a043: lea ecx, [esp + 0x114]
        R.push((R.eax >>> 0)); // 83a04a: push eax
        R.push((R.ecx >>> 0)); // 83a04b: push ecx
        R.push(0x0); // 83a04c: push 0
        R.push(0x0); // 83a04e: push 0
        R.push(0xa825a4); // 83a050: push 0xa825a4
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 83a055: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 83a05a: add esp, 0x14
        R.edx = (((R.esp + 0x14) | 0)) | 0; // 83a05d: lea edx, [esp + 0x14]
        R.eax = (((R.esp + 0x114) | 0)) | 0; // 83a061: lea eax, [esp + 0x114]
        R.push(0x10c); // 83a068: push 0x10c
        R.push((R.edx >>> 0)); // 83a06d: push edx
        R.push((R.eax >>> 0)); // 83a06e: push eax
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 83a06f: call 0x90d130
        R.push((R.eax >>> 0)); // 83a074: push eax
        R.push(0x9870e8); // 83a075: push 0x9870e8
        R.push(0xae24d0); // 83a07a: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 83a07f: call 0x944c9f
        R.push(0x0); // 83a084: push 0
        R.push(0xae24d0); // 83a086: push 0xae24d0
        R.push(0x9870e0); // 83a08b: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 83a090: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 83a095: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 83a098: mov dword ptr [0xb67a34], 0
        R.call(0x5cc7d0, { n: 0, thisEcx: false, calleeClean: false }); // 83a0a2: call 0x5cc7d0
        R.call(0x5a8f60, { n: 0, thisEcx: false, calleeClean: false }); // 83a0a7: call 0x5a8f60
        R.push(0xffffffff); // 83a0ac: push -1
        throw new Error('C++-undtagelse (0x945934)'); // 83a0ae: call 0x945934
        pc = 28; continue;
      case 28: // 83a0b3
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 83a0b3: xor eax, eax
        pc = 29; continue;
      case 29: // 83a0b5
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 83a0b5: mov ecx, dword ptr [0xae1050]
        R.push((R.eax >>> 0)); // 83a0bb: push eax
        R.push((R.ebp >>> 0)); // 83a0bc: push ebp
        R.call(0x4cf5f0, { n: 2, thisEcx: true, calleeClean: true }); // 83a0bd: call 0x4cf5f0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83a0c2: test eax, eax
        if (R.zf) { pc = 31; continue; } // 83a0c4: je 0x83a0de
        pc = 30; continue;
      case 30: // 83a0c6
        R.edx = (((R.m.u8(((R.eax + 0x3d) | 0) >>> 0)) << 24 >> 24)) | 0; // 83a0c6: movsx edx, byte ptr [eax + 0x3d]
        R.eax = (R.m.u32(((R.esi + R.edi * 4 + 0x98) | 0) >>> 0)) | 0; // 83a0ca: mov eax, dword ptr [esi + edi*4 + 0x98]
        R.ecx = (R.m.u32(((R.esi + R.edi * 4 + 0x58) | 0) >>> 0)) | 0; // 83a0d1: mov ecx, dword ptr [esi + edi*4 + 0x58]
        R.eax = (((R.eax + R.eax * 2) | 0)) | 0; // 83a0d5: lea eax, [eax + eax*2]
        R.m.w32(((R.ecx + R.eax * 4 + 0x8) | 0) >>> 0, (R.edx >>> 0)); // 83a0d8: mov dword ptr [ecx + eax*4 + 8], edx
        pc = 32; continue; // 83a0dc: jmp 0x83a0f4
      case 31: // 83a0de
        R.eax = (R.m.u32(((R.esi + R.edi * 4 + 0x98) | 0) >>> 0)) | 0; // 83a0de: mov eax, dword ptr [esi + edi*4 + 0x98]
        R.edx = (((R.eax + R.eax * 2) | 0)) | 0; // 83a0e5: lea edx, [eax + eax*2]
        R.eax = (R.m.u32(((R.esi + R.edi * 4 + 0x58) | 0) >>> 0)) | 0; // 83a0e8: mov eax, dword ptr [esi + edi*4 + 0x58]
        R.m.w32(((R.eax + R.edx * 4 + 0x8) | 0) >>> 0, 0x64); // 83a0ec: mov dword ptr [eax + edx*4 + 8], 0x64
        pc = 32; continue;
      case 32: // 83a0f4
        R.m.w32(((R.esi + R.edi * 4 + 0x98) | 0) >>> 0, R.incdec(R.m.u32(((R.esi + R.edi * 4 + 0x98) | 0) >>> 0), 1, 32)); // 83a0f4: inc dword ptr [esi + edi*4 + 0x98]
        pc = 33; continue;
      default: return pc;
    }
  }
}
function f_839e60_5(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 33: // 83a0fb
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x10) | 0) >>> 0)) & 0xff) << 0)) | 0; // 83a0fb: mov al, byte ptr [esp + 0x10]
        R.eax = ((R.eax & 0xffffff00) | (((R.incdec(((R.eax >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 83a0ff: inc al
        R.sub(((R.eax >>> 0) & 0xff), 0x10, 8); // 83a101: cmp al, 0x10
        R.m.w8(((R.esp + 0x10) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 83a103: mov byte ptr [esp + 0x10], al
        if (R.cL) { pc = 21; continue; } // 83a107: jl 0x839f5a
        pc = 34; continue;
      case 34: // 83a10d
        R.ecx = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 83a10d: mov ecx, dword ptr [0xae2364]
        R.ebx = (R.incdec((R.ebx >>> 0), 1, 32)) | 0; // 83a113: inc ebx
        R.ecx = (R.add((R.ecx >>> 0), 0xfffffff0, 32)) | 0; // 83a114: add ecx, -0x10
        R.ebp = (R.add((R.ebp >>> 0), 0x6e, 32)) | 0; // 83a117: add ebp, 0x6e
        R.sub((R.ebx >>> 0), (R.ecx >>> 0), 32); // 83a11a: cmp ebx, ecx
        if (R.cL) { pc = 20; continue; } // 83a11c: jl 0x839f55
        pc = 35; continue;
      case 35: // 83a122
        R.edi = (R.pop()) | 0; // 83a122: pop edi
        R.esi = (R.pop()) | 0; // 83a123: pop esi
        R.ebp = (R.pop()) | 0; // 83a124: pop ebp
        R.ebx = (R.pop()) | 0; // 83a125: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x204, 32)) | 0; // 83a126: add esp, 0x204
        R.rv = R.ret(1); return -1; // 83a12c: ret 4
      case 36: // 83a12f
        R.edx = (((R.esp + 0x114) | 0)) | 0; // 83a12f: lea edx, [esp + 0x114]
        R.eax = (((R.esp + 0x14) | 0)) | 0; // 83a136: lea eax, [esp + 0x14]
        R.push((R.edx >>> 0)); // 83a13a: push edx
        R.push((R.eax >>> 0)); // 83a13b: push eax
        R.push(0x0); // 83a13c: push 0
        R.push(0x0); // 83a13e: push 0
        R.push(0xa825a4); // 83a140: push 0xa825a4
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 83a145: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 83a14a: add esp, 0x14
        R.ecx = (((R.esp + 0x114) | 0)) | 0; // 83a14d: lea ecx, [esp + 0x114]
        R.edx = (((R.esp + 0x14) | 0)) | 0; // 83a154: lea edx, [esp + 0x14]
        R.push(0x121); // 83a158: push 0x121
        R.push((R.ecx >>> 0)); // 83a15d: push ecx
        R.push((R.edx >>> 0)); // 83a15e: push edx
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 83a15f: call 0x90d130
        R.push((R.eax >>> 0)); // 83a164: push eax
        R.push(0x9870e8); // 83a165: push 0x9870e8
        R.push(0xae24d0); // 83a16a: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 83a16f: call 0x944c9f
        R.push(0x0); // 83a174: push 0
        R.push(0xae24d0); // 83a176: push 0xae24d0
        R.push(0x9870e0); // 83a17b: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 83a180: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 83a185: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 83a188: mov dword ptr [0xb67a34], 0
        R.call(0x5cc7d0, { n: 0, thisEcx: false, calleeClean: false }); // 83a192: call 0x5cc7d0
        R.call(0x5a8f60, { n: 0, thisEcx: false, calleeClean: false }); // 83a197: call 0x5a8f60
        R.push(0xffffffff); // 83a19c: push -1
        throw new Error('C++-undtagelse (0x945934)'); // 83a19e: call 0x945934
      default: return pc;
    }
  }
}
export function f_839e60(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 37) throw new Error(`f_839e60: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_839e60_0(R, pc); break;
      case 1: np = f_839e60_1(R, pc); break;
      case 2: np = f_839e60_2(R, pc); break;
      case 3: np = f_839e60_3(R, pc); break;
      case 4: np = f_839e60_4(R, pc); break;
      case 5: np = f_839e60_5(R, pc); break;
      default: throw new Error(`f_839e60: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_839e60: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_839e60.shared = true;
