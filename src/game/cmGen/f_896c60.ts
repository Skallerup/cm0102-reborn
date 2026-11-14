// 0x896c60 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 5e8290=9, 897990=4tc, 897bb0=5tc, 897dc0=3tc, 897ee0=4tc, 8982b0=2c, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x896c60, 0x896c79, 0x896ca9, 0x896cb4, 0x896ce2, 0x896d1f, 0x896d34, 0x896d43, 0x896d57, 0x896d5b, 0x896d6e, 0x896d7c, 0x896d84, 0x896d93, 0x896da2, 0x896daf, 0x896dbe, 0x896dcb, 0x896dd0, 0x896ddb, 0x896de2, 0x896dfa, 0x896e16, 0x896e24, 0x896e39, 0x896e43, 0x896e4b, 0x896e50, 0x896e55, 0x896e5a, 0x896e6e, 0x896e74]);
const CH = new Uint8Array([0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4]);
function f_896c60_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 896c60
        R.esp = (R.sub((R.esp >>> 0), 0x20c, 32)) | 0; // 896c60: sub esp, 0x20c
        R.push((R.ebx >>> 0)); // 896c66: push ebx
        R.ebx = (R.m.u32(((R.esp + 0x214) | 0) >>> 0)) | 0; // 896c67: mov ebx, dword ptr [esp + 0x214]
        R.push((R.ebp >>> 0)); // 896c6e: push ebp
        R.push((R.esi >>> 0)); // 896c6f: push esi
        R.push((R.edi >>> 0)); // 896c70: push edi
        R.edi = (R.logic((R.edi >>> 0) ^ (R.edi >>> 0), 32)) | 0; // 896c71: xor edi, edi
        R.sub((R.ebx >>> 0), (R.edi >>> 0), 32); // 896c73: cmp ebx, edi
        R.esi = ((R.ecx >>> 0)) | 0; // 896c75: mov esi, ecx
        if (!R.zf) { pc = 2; continue; } // 896c77: jne 0x896ca9
        pc = 1; continue;
      case 1: // 896c79
        R.eax = (((R.esp + 0x1c) | 0)) | 0; // 896c79: lea eax, [esp + 0x1c]
        R.ecx = (((R.esp + 0x11c) | 0)) | 0; // 896c7d: lea ecx, [esp + 0x11c]
        R.push((R.eax >>> 0)); // 896c84: push eax
        R.push((R.ecx >>> 0)); // 896c85: push ecx
        R.push((R.edi >>> 0)); // 896c86: push edi
        R.push((R.edi >>> 0)); // 896c87: push edi
        R.push(0xa8b908); // 896c88: push 0xa8b908
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 896c8d: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 896c92: add esp, 0x14
        R.edx = (((R.esp + 0x1c) | 0)) | 0; // 896c95: lea edx, [esp + 0x1c]
        R.eax = (((R.esp + 0x11c) | 0)) | 0; // 896c99: lea eax, [esp + 0x11c]
        R.push(0x34d); // 896ca0: push 0x34d
        R.push((R.edx >>> 0)); // 896ca5: push edx
        R.push((R.eax >>> 0)); // 896ca6: push eax
        pc = 4; continue; // 896ca7: jmp 0x896ce2
      case 2: // 896ca9
        R.ebp = (R.m.u32(((R.esp + 0x224) | 0) >>> 0)) | 0; // 896ca9: mov ebp, dword ptr [esp + 0x224]
        R.sub((R.ebp >>> 0), (R.edi >>> 0), 32); // 896cb0: cmp ebp, edi
        if (!R.zf) { pc = 5; continue; } // 896cb2: jne 0x896d1f
        pc = 3; continue;
      case 3: // 896cb4
        R.ecx = (((R.esp + 0x11c) | 0)) | 0; // 896cb4: lea ecx, [esp + 0x11c]
        R.edx = (((R.esp + 0x1c) | 0)) | 0; // 896cbb: lea edx, [esp + 0x1c]
        R.push((R.ecx >>> 0)); // 896cbf: push ecx
        R.push((R.edx >>> 0)); // 896cc0: push edx
        R.push((R.edi >>> 0)); // 896cc1: push edi
        R.push((R.edi >>> 0)); // 896cc2: push edi
        R.push(0xa8b908); // 896cc3: push 0xa8b908
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 896cc8: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 896ccd: add esp, 0x14
        R.eax = (((R.esp + 0x11c) | 0)) | 0; // 896cd0: lea eax, [esp + 0x11c]
        R.ecx = (((R.esp + 0x1c) | 0)) | 0; // 896cd7: lea ecx, [esp + 0x1c]
        R.push(0x355); // 896cdb: push 0x355
        R.push((R.eax >>> 0)); // 896ce0: push eax
        R.push((R.ecx >>> 0)); // 896ce1: push ecx
        pc = 4; continue;
      default: return pc;
    }
  }
}
function f_896c60_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 4: // 896ce2
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 896ce2: call 0x90d130
        R.push((R.eax >>> 0)); // 896ce7: push eax
        R.push(0x9870e8); // 896ce8: push 0x9870e8
        R.push(0xae24d0); // 896ced: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 896cf2: call 0x944c9f
        R.push((R.edi >>> 0)); // 896cf7: push edi
        R.push(0xae24d0); // 896cf8: push 0xae24d0
        R.push(0x9870e0); // 896cfd: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 896d02: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 896d07: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, (R.edi >>> 0)); // 896d0a: mov dword ptr [0xb67a34], edi
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 896d10: xor eax, eax
        R.edi = (R.pop()) | 0; // 896d12: pop edi
        R.esi = (R.pop()) | 0; // 896d13: pop esi
        R.ebp = (R.pop()) | 0; // 896d14: pop ebp
        R.ebx = (R.pop()) | 0; // 896d15: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x20c, 32)) | 0; // 896d16: add esp, 0x20c
        R.rv = R.ret(4); return -1; // 896d1c: ret 0x10
      case 5: // 896d1f
        R.edi = (R.m.u32(((R.esp + 0x228) | 0) >>> 0)) | 0; // 896d1f: mov edi, dword ptr [esp + 0x228]
        R.ecx = ((R.esi >>> 0)) | 0; // 896d26: mov ecx, esi
        R.push((R.edi >>> 0)); // 896d28: push edi
        R.push((R.ebx >>> 0)); // 896d29: push ebx
        R.call(0x8982b0, { n: 2, thisEcx: false, calleeClean: true }); // 896d2a: call 0x8982b0
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 896d2f: cmp eax, -1
        if (!R.zf) { pc = 7; continue; } // 896d32: jne 0x896d43
        pc = 6; continue;
      case 6: // 896d34
        R.edi = (R.pop()) | 0; // 896d34: pop edi
        R.esi = (R.pop()) | 0; // 896d35: pop esi
        R.ebp = (R.pop()) | 0; // 896d36: pop ebp
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 896d37: xor eax, eax
        R.ebx = (R.pop()) | 0; // 896d39: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x20c, 32)) | 0; // 896d3a: add esp, 0x20c
        R.rv = R.ret(4); return -1; // 896d40: ret 0x10
      case 7: // 896d43
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 896d43: lea edx, [eax + eax*8]
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 896d46: xor ecx, ecx
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 896d48: shl edx, 4
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 896d4b: add edx, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.ecx >>> 0)); // 896d4d: mov dword ptr [esp + 0x14], ecx
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edx >>> 0)); // 896d51: mov dword ptr [esp + 0x10], edx
        pc = 9; continue; // 896d55: jmp 0x896d5b
      case 8: // 896d57
        R.edx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 896d57: mov edx, dword ptr [esp + 0x10]
        pc = 9; continue;
      case 9: // 896d5b
        R.eax = (R.m.u32(((R.esi + 0x601) | 0) >>> 0)) | 0; // 896d5b: mov eax, dword ptr [esi + 0x601]
        R.edx = (R.add((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 896d61: add edx, ecx
        R.eax = (((R.edx + R.eax + 0x2) | 0)) | 0; // 896d63: lea eax, [edx + eax + 2]
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 896d67: mov edx, dword ptr [eax]
        R.sub((R.edx >>> 0), R.m.u32(((R.ebp) | 0) >>> 0), 32); // 896d69: cmp edx, dword ptr [ebp]
        if (!R.zf) { pc = 11; continue; } // 896d6c: jne 0x896d7c
        pc = 10; continue;
      case 10: // 896d6e
        R.m.w32(((R.eax) | 0) >>> 0, 0xffffffff); // 896d6e: mov dword ptr [eax], 0xffffffff
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, 0x1); // 896d74: mov dword ptr [esp + 0x14], 1
        pc = 11; continue;
      default: return pc;
    }
  }
}
function f_896c60_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 11: // 896d7c
        R.ecx = (R.add((R.ecx >>> 0), 0x4, 32)) | 0; // 896d7c: add ecx, 4
        R.sub((R.ecx >>> 0), 0x50, 32); // 896d7f: cmp ecx, 0x50
        if (R.cL) { pc = 8; continue; } // 896d82: jl 0x896d57
        pc = 12; continue;
      case 12: // 896d84
        R.eax = (R.m.u32(((R.esp + 0x22c) | 0) >>> 0)) | 0; // 896d84: mov eax, dword ptr [esp + 0x22c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 896d8b: test eax, eax
        if (R.zf) { pc = 24; continue; } // 896d8d: je 0x896e39
        pc = 13; continue;
      case 13: // 896d93
        R.push((R.edi >>> 0)); // 896d93: push edi
        R.push(0x0); // 896d94: push 0
        R.push((R.ebx >>> 0)); // 896d96: push ebx
        R.ecx = ((R.esi >>> 0)) | 0; // 896d97: mov ecx, esi
        R.call(0x897dc0, { n: 3, thisEcx: true, calleeClean: true }); // 896d99: call 0x897dc0
        R.sub((R.eax >>> 0), (R.ebp >>> 0), 32); // 896d9e: cmp eax, ebp
        if (!R.zf) { pc = 15; continue; } // 896da0: jne 0x896daf
        pc = 14; continue;
      case 14: // 896da2
        R.push((R.edi >>> 0)); // 896da2: push edi
        R.push(0x0); // 896da3: push 0
        R.push(0x0); // 896da5: push 0
        R.push((R.ebx >>> 0)); // 896da7: push ebx
        R.ecx = ((R.esi >>> 0)) | 0; // 896da8: mov ecx, esi
        R.call(0x897ee0, { n: 4, thisEcx: true, calleeClean: true }); // 896daa: call 0x897ee0
        pc = 15; continue;
      case 15: // 896daf
        R.push((R.edi >>> 0)); // 896daf: push edi
        R.push(0x1); // 896db0: push 1
        R.push((R.ebx >>> 0)); // 896db2: push ebx
        R.ecx = ((R.esi >>> 0)) | 0; // 896db3: mov ecx, esi
        R.call(0x897dc0, { n: 3, thisEcx: true, calleeClean: true }); // 896db5: call 0x897dc0
        R.sub((R.eax >>> 0), (R.ebp >>> 0), 32); // 896dba: cmp eax, ebp
        if (!R.zf) { pc = 17; continue; } // 896dbc: jne 0x896dcb
        pc = 16; continue;
      case 16: // 896dbe
        R.push((R.edi >>> 0)); // 896dbe: push edi
        R.push(0x0); // 896dbf: push 0
        R.push(0x1); // 896dc1: push 1
        R.push((R.ebx >>> 0)); // 896dc3: push ebx
        R.ecx = ((R.esi >>> 0)) | 0; // 896dc4: mov ecx, esi
        R.call(0x897ee0, { n: 4, thisEcx: true, calleeClean: true }); // 896dc6: call 0x897ee0
        pc = 17; continue;
      case 17: // 896dcb
        R.m.w8(((R.esp + 0x10) | 0) >>> 0, 0x0); // 896dcb: mov byte ptr [esp + 0x10], 0
        pc = 18; continue;
      case 18: // 896dd0
        R.ebp = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 896dd0: mov ebp, dword ptr [esp + 0x10]
        R.m.w8(((R.esp + 0x18) | 0) >>> 0, 0x0); // 896dd4: mov byte ptr [esp + 0x18], 0
        pc = 20; continue; // 896dd9: jmp 0x896de2
      case 19: // 896ddb
        R.edi = (R.m.u32(((R.esp + 0x228) | 0) >>> 0)) | 0; // 896ddb: mov edi, dword ptr [esp + 0x228]
        pc = 20; continue;
      default: return pc;
    }
  }
}
function f_896c60_3(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 20: // 896de2
        R.push((R.edi >>> 0)); // 896de2: push edi
        R.edi = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 896de3: mov edi, dword ptr [esp + 0x1c]
        R.push((R.edi >>> 0)); // 896de7: push edi
        R.push((R.ebp >>> 0)); // 896de8: push ebp
        R.push((R.ebx >>> 0)); // 896de9: push ebx
        R.ecx = ((R.esi >>> 0)) | 0; // 896dea: mov ecx, esi
        R.call(0x897990, { n: 4, thisEcx: true, calleeClean: true }); // 896dec: call 0x897990
        R.sub((R.eax >>> 0), R.m.u32(((R.esp + 0x224) | 0) >>> 0), 32); // 896df1: cmp eax, dword ptr [esp + 0x224]
        if (!R.zf) { pc = 22; continue; } // 896df8: jne 0x896e16
        pc = 21; continue;
      case 21: // 896dfa
        R.eax = (R.m.u32(((R.esp + 0x228) | 0) >>> 0)) | 0; // 896dfa: mov eax, dword ptr [esp + 0x228]
        R.ecx = ((R.esi >>> 0)) | 0; // 896e01: mov ecx, esi
        R.push((R.eax >>> 0)); // 896e03: push eax
        R.push(0x0); // 896e04: push 0
        R.push((R.edi >>> 0)); // 896e06: push edi
        R.push((R.ebp >>> 0)); // 896e07: push ebp
        R.push((R.ebx >>> 0)); // 896e08: push ebx
        R.call(0x897bb0, { n: 5, thisEcx: true, calleeClean: true }); // 896e09: call 0x897bb0
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, 0x1); // 896e0e: mov dword ptr [esp + 0x14], 1
        pc = 22; continue;
      case 22: // 896e16
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x18) | 0) >>> 0)) & 0xff) << 0)) | 0; // 896e16: mov al, byte ptr [esp + 0x18]
        R.eax = ((R.eax & 0xffffff00) | (((R.incdec(((R.eax >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 896e1a: inc al
        R.sub(((R.eax >>> 0) & 0xff), 0x2, 8); // 896e1c: cmp al, 2
        R.m.w8(((R.esp + 0x18) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 896e1e: mov byte ptr [esp + 0x18], al
        if (R.cL) { pc = 19; continue; } // 896e22: jl 0x896ddb
        pc = 23; continue;
      case 23: // 896e24
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x10) | 0) >>> 0)) & 0xff) << 0)) | 0; // 896e24: mov al, byte ptr [esp + 0x10]
        R.edi = (R.m.u32(((R.esp + 0x228) | 0) >>> 0)) | 0; // 896e28: mov edi, dword ptr [esp + 0x228]
        R.eax = ((R.eax & 0xffffff00) | (((R.incdec(((R.eax >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 896e2f: inc al
        R.sub(((R.eax >>> 0) & 0xff), 0x5, 8); // 896e31: cmp al, 5
        R.m.w8(((R.esp + 0x10) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 896e33: mov byte ptr [esp + 0x10], al
        if (R.cL) { pc = 18; continue; } // 896e37: jl 0x896dd0
        pc = 24; continue;
      case 24: // 896e39
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x5f0) | 0) >>> 0)) & 0xff) << 0)) | 0; // 896e39: mov al, byte ptr [esi + 0x5f0]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 896e3f: test al, al
        if (R.zf) { pc = 31; continue; } // 896e41: je 0x896e74
        pc = 25; continue;
      case 25: // 896e43
        R.eax = (((R.esi + 0x38) | 0)) | 0; // 896e43: lea eax, [esi + 0x38]
        R.ecx = (0x10) | 0; // 896e46: mov ecx, 0x10
        pc = 26; continue;
      case 26: // 896e4b
        R.sub(R.m.u32(((R.eax) | 0) >>> 0), 0x0, 32); // 896e4b: cmp dword ptr [eax], 0
        if (R.zf) { pc = 30; continue; } // 896e4e: je 0x896e6e
        pc = 27; continue;
      case 27: // 896e50
        R.sub(R.m.u32(((R.eax + -0x8) | 0) >>> 0), (R.ebx >>> 0), 32); // 896e50: cmp dword ptr [eax - 8], ebx
        if (!R.zf) { pc = 30; continue; } // 896e53: jne 0x896e6e
        pc = 28; continue;
      case 28: // 896e55
        R.sub(R.m.u32(((R.eax + -0x4) | 0) >>> 0), (R.edi >>> 0), 32); // 896e55: cmp dword ptr [eax - 4], edi
        if (!R.zf) { pc = 30; continue; } // 896e58: jne 0x896e6e
        pc = 29; continue;
      default: return pc;
    }
  }
}
function f_896c60_4(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 29: // 896e5a
        R.m.w32(((R.eax) | 0) >>> 0, 0x0); // 896e5a: mov dword ptr [eax], 0
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.esi + 0x5f0) | 0) >>> 0)) & 0xff) << 0)) | 0; // 896e60: mov dl, byte ptr [esi + 0x5f0]
        R.edx = ((R.edx & 0xffffff00) | (((R.incdec(((R.edx >>> 0) & 0xff), -1, 8)) & 0xff) << 0)) | 0; // 896e66: dec dl
        R.m.w8(((R.esi + 0x5f0) | 0) >>> 0, ((R.edx >>> 0) & 0xff)); // 896e68: mov byte ptr [esi + 0x5f0], dl
        pc = 30; continue;
      case 30: // 896e6e
        R.eax = (R.add((R.eax >>> 0), 0x5c, 32)) | 0; // 896e6e: add eax, 0x5c
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 896e71: dec ecx
        if (!R.zf) { pc = 26; continue; } // 896e72: jne 0x896e4b
        pc = 31; continue;
      case 31: // 896e74
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 896e74: mov eax, dword ptr [esp + 0x14]
        R.edi = (R.pop()) | 0; // 896e78: pop edi
        R.esi = (R.pop()) | 0; // 896e79: pop esi
        R.ebp = (R.pop()) | 0; // 896e7a: pop ebp
        R.ebx = (R.pop()) | 0; // 896e7b: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x20c, 32)) | 0; // 896e7c: add esp, 0x20c
        R.rv = R.ret(4); return -1; // 896e82: ret 0x10
      default: return pc;
    }
  }
}
export function f_896c60(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 32) throw new Error(`f_896c60: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_896c60_0(R, pc); break;
      case 1: np = f_896c60_1(R, pc); break;
      case 2: np = f_896c60_2(R, pc); break;
      case 3: np = f_896c60_3(R, pc); break;
      case 4: np = f_896c60_4(R, pc); break;
      default: throw new Error(`f_896c60: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_896c60: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_896c60.shared = true;
