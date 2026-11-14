// 0x84af00 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4cf5f0=2tc, 4d1600=6tc, 4d42d0=3tc, 53ca90=1, 5444a0=2, 544590=2, 5fd210=1c, 5fea50=2c, 600a50=5, 867b50=0t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x84af00, 0x84af23, 0x84af27, 0x84af32, 0x84af3a, 0x84af43, 0x84af4b, 0x84af58, 0x84af6d, 0x84af7d, 0x84af8f, 0x84afc0, 0x84afc9, 0x84afcd, 0x84afd6, 0x84b003, 0x84b009, 0x84b01c, 0x84b025, 0x84b031, 0x84b06b, 0x84b084, 0x84b0a5, 0x84b0a8, 0x84b0ad, 0x84b0ba, 0x84b0bc, 0x84b0c1, 0x84b0c8, 0x84b0cd, 0x84b0e7, 0x84b0eb, 0x84b0f6, 0x84b0f8, 0x84b0fe, 0x84b113, 0x84b11e, 0x84b120, 0x84b126, 0x84b135, 0x84b13e, 0x84b159, 0x84b162, 0x84b174]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5]);
function f_84af00_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 84af00
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 84af00: mov ecx, dword ptr [0xae1050]
        R.push((R.ebx >>> 0)); // 84af06: push ebx
        R.ebx = (R.m.u32(((R.esp + 0x8) | 0) >>> 0)) | 0; // 84af07: mov ebx, dword ptr [esp + 8]
        R.push((R.ebp >>> 0)); // 84af0b: push ebp
        R.ebp = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 84af0c: mov ebp, dword ptr [esp + 0x10]
        R.push((R.esi >>> 0)); // 84af10: push esi
        R.push((R.edi >>> 0)); // 84af11: push edi
        R.push((R.ebx >>> 0)); // 84af12: push ebx
        R.push((R.ebp >>> 0)); // 84af13: push ebp
        R.call(0x4cf5f0, { n: 2, thisEcx: true, calleeClean: true }); // 84af14: call 0x4cf5f0
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 84af19: test ebx, ebx
        R.edi = ((R.eax >>> 0)) | 0; // 84af1b: mov edi, eax
        if (R.zf) { pc = 43; continue; } // 84af1d: je 0x84b174
        pc = 1; continue;
      case 1: // 84af23
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 84af23: test edi, edi
        if (R.zf) { pc = 3; continue; } // 84af25: je 0x84af32
        pc = 2; continue;
      case 2: // 84af27
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edi + 0x49) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84af27: mov al, byte ptr [edi + 0x49]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 84af2a: test al, al
        if (!R.zf) { pc = 43; continue; } // 84af2c: jne 0x84b174
        pc = 3; continue;
      case 3: // 84af32
        R.sub(R.m.u32(((R.ebx + 0xcf) | 0) >>> 0), (R.ebp >>> 0), 32); // 84af32: cmp dword ptr [ebx + 0xcf], ebp
        if (!R.zf) { pc = 5; continue; } // 84af38: jne 0x84af43
        pc = 4; continue;
      case 4: // 84af3a
        R.edi = (R.pop()) | 0; // 84af3a: pop edi
        R.esi = (R.pop()) | 0; // 84af3b: pop esi
        R.ebp = (R.pop()) | 0; // 84af3c: pop ebp
        R.eax = ((R.eax & 0xffffff00) | (((0x2) & 0xff) << 0)) | 0; // 84af3d: mov al, 2
        R.ebx = (R.pop()) | 0; // 84af3f: pop ebx
        R.rv = R.ret(8); return -1; // 84af40: ret 0x20
      case 5: // 84af43
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 84af43: test edi, edi
        if (R.zf) { pc = 42; continue; } // 84af45: je 0x84b162
        pc = 6; continue;
      case 6: // 84af4b
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edi + 0x35) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84af4b: mov al, byte ptr [edi + 0x35]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x3f, 8)) & 0xff) << 0)) | 0; // 84af4e: and al, 0x3f
        R.sub(((R.eax >>> 0) & 0xff), 0x2, 8); // 84af50: cmp al, 2
        if (!R.zf) { pc = 42; continue; } // 84af52: jne 0x84b162
        pc = 7; continue;
      case 7: // 84af58
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x30) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84af58: mov al, byte ptr [esp + 0x30]
        R.push(0x0); // 84af5c: push 0
        R.push(0x0); // 84af5e: push 0
        R.push(0x1); // 84af60: push 1
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 84af62: test al, al
        R.push(0x0); // 84af64: push 0
        R.push((R.ebx >>> 0)); // 84af66: push ebx
        if (R.zf) { pc = 18; continue; } // 84af67: je 0x84b025
        pc = 8; continue;
      default: return pc;
    }
  }
}
function f_84af00_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 8: // 84af6d
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 84af6d: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 84af72: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84af75: test eax, eax
        if (!R.zf) { pc = 43; continue; } // 84af77: jne 0x84b174
        pc = 9; continue;
      case 9: // 84af7d
        R.push((R.eax >>> 0)); // 84af7d: push eax
        R.push((R.ebp >>> 0)); // 84af7e: push ebp
        R.call(0x544590, { n: 2, thisEcx: false, calleeClean: false }); // 84af7f: call 0x544590
        R.ecx = (R.m.u32(((R.esp + 0x2c) | 0) >>> 0)) | 0; // 84af84: mov ecx, dword ptr [esp + 0x2c]
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 84af88: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84af8b: test eax, eax
        if (R.zf) { pc = 11; continue; } // 84af8d: je 0x84afc0
        pc = 10; continue;
      case 10: // 84af8f
        R.edx = (R.m.u32(((R.ebp + 0x61) | 0) >>> 0)) | 0; // 84af8f: mov edx, dword ptr [ebp + 0x61]
        R.eax = (((R.m.u16(((R.edx + 0xb) | 0) >>> 0)) << 16 >> 16)) | 0; // 84af92: movsx eax, word ptr [edx + 0xb]
        R.edx = (((R.m.u16(((R.ecx + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 84af96: movsx edx, word ptr [ecx + 0x80]
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.eax >>> 0)); // 84af9d: mov dword ptr [esp + 0x30], eax
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 84afa1: fild dword ptr [esp + 0x30]
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.edx >>> 0)); // 84afa5: mov dword ptr [esp + 0x30], edx
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 84afa9: fild dword ptr [esp + 0x30]
        R.st[0] = R.st[0] * 1.25; // 84afad: fmul qword ptr [0x968928]
        R.fcom(R.st[0], R.st[1]); R.fpop(); R.fpop(); // 84afb3: fcompp 
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84afb5: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 84afb7: test ah, 0x41
        if (R.zf) { pc = 43; continue; } // 84afba: je 0x84b174
        pc = 11; continue;
      case 11: // 84afc0
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edi + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84afc0: mov al, byte ptr [edi + 0x4f]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 84afc3: and al, 0xf0
        R.sub(((R.eax >>> 0) & 0xff), 0x60, 8); // 84afc5: cmp al, 0x60
        if (R.zf) { pc = 14; continue; } // 84afc7: je 0x84afd6
        pc = 12; continue;
      case 12: // 84afc9
        R.sub(((R.eax >>> 0) & 0xff), 0x70, 8); // 84afc9: cmp al, 0x70
        if (R.zf) { pc = 14; continue; } // 84afcb: je 0x84afd6
        pc = 13; continue;
      case 13: // 84afcd
        R.eax = (R.m.u32(((R.ebp + 0x61) | 0) >>> 0)) | 0; // 84afcd: mov eax, dword ptr [ebp + 0x61]
        R.sub(R.m.u8(((R.eax + 0xf) | 0) >>> 0), 0x14, 8); // 84afd0: cmp byte ptr [eax + 0xf], 0x14
        if (!R.zf) { pc = 17; continue; } // 84afd4: jne 0x84b01c
        pc = 14; continue;
      case 14: // 84afd6
        R.edx = (R.m.u32(((R.ebp + 0x61) | 0) >>> 0)) | 0; // 84afd6: mov edx, dword ptr [ebp + 0x61]
        R.ecx = (((R.m.u16(((R.ecx + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 84afd9: movsx ecx, word ptr [ecx + 0x80]
        R.eax = (((R.m.u16(((R.edx + 0xb) | 0) >>> 0)) << 16 >> 16)) | 0; // 84afe0: movsx eax, word ptr [edx + 0xb]
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.eax >>> 0)); // 84afe4: mov dword ptr [esp + 0x30], eax
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 84afe8: fild dword ptr [esp + 0x30]
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.ecx >>> 0)); // 84afec: mov dword ptr [esp + 0x30], ecx
        R.st[0] = R.st[0] * 0.75; // 84aff0: fmul qword ptr [0x969040]
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 84aff6: fild dword ptr [esp + 0x30]
        R.fcom(R.st[0], R.st[1]); R.fpop(); R.fpop(); // 84affa: fcompp 
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84affc: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 84affe: test ah, 0x41
        if (!R.zf) { pc = 17; continue; } // 84b001: jne 0x84b01c
        pc = 15; continue;
      default: return pc;
    }
  }
}
function f_84af00_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 15: // 84b003
        R.sub(R.m.u8(((R.edi + 0x3d) | 0) >>> 0), 0xce, 8); // 84b003: cmp byte ptr [edi + 0x3d], 0xce
        if (!R.cL) { pc = 17; continue; } // 84b007: jge 0x84b01c
        pc = 16; continue;
      case 16: // 84b009
        R.edx = (R.m.u32(((R.ebx + 0x1db) | 0) >>> 0)) | 0; // 84b009: mov edx, dword ptr [ebx + 0x1db]
        R.eax = (R.m.u32(((0x9cf6e8) | 0) >>> 0)) | 0; // 84b00f: mov eax, dword ptr [0x9cf6e8]
        R.sub((R.edx >>> 0), (R.eax >>> 0), 32); // 84b014: cmp edx, eax
        if (!R.zf) { pc = 43; continue; } // 84b016: jne 0x84b174
        pc = 17; continue;
      case 17: // 84b01c
        R.edi = (R.pop()) | 0; // 84b01c: pop edi
        R.esi = (R.pop()) | 0; // 84b01d: pop esi
        R.ebp = (R.pop()) | 0; // 84b01e: pop ebp
        R.eax = ((R.eax & 0xffffff00) | (((0x2) & 0xff) << 0)) | 0; // 84b01f: mov al, 2
        R.ebx = (R.pop()) | 0; // 84b021: pop ebx
        R.rv = R.ret(8); return -1; // 84b022: ret 0x20
      case 18: // 84b025
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 84b025: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 84b02a: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84b02d: test eax, eax
        if (R.zf) { pc = 24; continue; } // 84b02f: je 0x84b0ad
        pc = 19; continue;
      case 19: // 84b031
        R.eax = (R.m.u32(((R.esp + 0x24) | 0) >>> 0)) | 0; // 84b031: mov eax, dword ptr [esp + 0x24]
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 84b035: mov ecx, dword ptr [0xae1050]
        R.push((R.ebp >>> 0)); // 84b03b: push ebp
        R.push((R.eax >>> 0)); // 84b03c: push eax
        R.push((R.ebx >>> 0)); // 84b03d: push ebx
        R.call(0x4d42d0, { n: 3, thisEcx: true, calleeClean: true }); // 84b03e: call 0x4d42d0
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.eax >>> 0)); // 84b043: mov dword ptr [esp + 0x30], eax
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 84b047: fild dword ptr [esp + 0x30]
        R.st[0] = R.st[0] * 0.8; // 84b04b: fmul qword ptr [0x9689b0]
        R.ftol(); // 84b051: call 0x945640
        R.esi = ((R.eax >>> 0)) | 0; // 84b056: mov esi, eax
        R.ecx = ((R.edi >>> 0)) | 0; // 84b058: mov ecx, edi
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.esi >>> 0)); // 84b05a: mov dword ptr [esp + 0x30], esi
        R.call(0x867b50, { n: 0, thisEcx: true, calleeClean: false }); // 84b05e: call 0x867b50
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84b063: test eax, eax
        if (!R.zf) { pc = 31; continue; } // 84b065: jne 0x84b0eb
        pc = 20; continue;
      case 20: // 84b06b
        R.push((R.ebx >>> 0)); // 84b06b: push ebx
        R.call(0x53ca90, { n: 1, thisEcx: false, calleeClean: false }); // 84b06c: call 0x53ca90
        R.ecx = (R.m.u32(((0xb63c98) | 0) >>> 0)) | 0; // 84b071: mov ecx, dword ptr [0xb63c98]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 84b077: add esp, 4
        R.push((R.eax >>> 0)); // 84b07a: push eax
        R.call(0x5fd210, { n: 1, thisEcx: false, calleeClean: true }); // 84b07b: call 0x5fd210
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84b080: test eax, eax
        if (R.zf) { pc = 31; continue; } // 84b082: je 0x84b0eb
        pc = 21; continue;
      default: return pc;
    }
  }
}
function f_84af00_3(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 21: // 84b084
        R.push((R.ebx >>> 0)); // 84b084: push ebx
        R.call(0x53ca90, { n: 1, thisEcx: false, calleeClean: false }); // 84b085: call 0x53ca90
        R.ecx = (R.m.u32(((0xb63c98) | 0) >>> 0)) | 0; // 84b08a: mov ecx, dword ptr [0xb63c98]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 84b090: add esp, 4
        R.push((R.eax >>> 0)); // 84b093: push eax
        R.push(0x0); // 84b094: push 0
        R.call(0x5fea50, { n: 2, thisEcx: false, calleeClean: true }); // 84b096: call 0x5fea50
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 84b09b: movsx eax, al
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 84b09e: dec eax
        if (R.zf) { pc = 17; continue; } // 84b09f: je 0x84b01c
        pc = 22; continue;
      case 22: // 84b0a5
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 84b0a5: dec eax
        if (!R.zf) { pc = 31; continue; } // 84b0a6: jne 0x84b0eb
        pc = 23; continue;
      case 23: // 84b0a8
        R.esi = (R.m.u32(((R.ebp + 0x52) | 0) >>> 0)) | 0; // 84b0a8: mov esi, dword ptr [ebp + 0x52]
        pc = 30; continue; // 84b0ab: jmp 0x84b0e7
      case 24: // 84b0ad
        R.eax = (R.m.u32(((R.esp + 0x2c) | 0) >>> 0)) | 0; // 84b0ad: mov eax, dword ptr [esp + 0x2c]
        R.esi = (R.m.u32(((R.esp + 0x28) | 0) >>> 0)) | 0; // 84b0b1: mov esi, dword ptr [esp + 0x28]
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 84b0b5: cmp eax, -1
        if (R.cL) { pc = 27; continue; } // 84b0b8: jl 0x84b0c1
        pc = 25; continue;
      case 25: // 84b0ba
        if (!R.cLE) { pc = 30; continue; } // 84b0ba: jg 0x84b0e7
        pc = 26; continue;
      case 26: // 84b0bc
        R.sub((R.esi >>> 0), 0xffffffff, 32); // 84b0bc: cmp esi, -1
        if (!R.cBE) { pc = 30; continue; } // 84b0bf: ja 0x84b0e7
        pc = 27; continue;
      case 27: // 84b0c1
        R.eax = (R.m.u32(((R.ebp + 0x61) | 0) >>> 0)) | 0; // 84b0c1: mov eax, dword ptr [ebp + 0x61]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84b0c4: test eax, eax
        if (!R.zf) { pc = 29; continue; } // 84b0c6: jne 0x84b0cd
        pc = 28; continue;
      case 28: // 84b0c8
        R.esi = (R.m.u32(((R.ebp + 0x52) | 0) >>> 0)) | 0; // 84b0c8: mov esi, dword ptr [ebp + 0x52]
        pc = 30; continue; // 84b0cb: jmp 0x84b0e7
      case 29: // 84b0cd
        R.ecx = (R.m.u32(((R.esp + 0x24) | 0) >>> 0)) | 0; // 84b0cd: mov ecx, dword ptr [esp + 0x24]
        R.push(0x1); // 84b0d1: push 1
        R.push(0x1); // 84b0d3: push 1
        R.push(0x0); // 84b0d5: push 0
        R.push((R.ebp >>> 0)); // 84b0d7: push ebp
        R.push((R.ecx >>> 0)); // 84b0d8: push ecx
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 84b0d9: mov ecx, dword ptr [0xae1050]
        R.push((R.ebx >>> 0)); // 84b0df: push ebx
        R.call(0x4d1600, { n: 6, thisEcx: true, calleeClean: true }); // 84b0e0: call 0x4d1600
        R.esi = ((R.eax >>> 0)) | 0; // 84b0e5: mov esi, eax
        pc = 30; continue;
      case 30: // 84b0e7
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.esi >>> 0)); // 84b0e7: mov dword ptr [esp + 0x30], esi
        pc = 31; continue;
      default: return pc;
    }
  }
}
function f_84af00_4(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 31: // 84b0eb
        R.edi = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 84b0eb: mov edi, dword ptr [esp + 0x20]
        R.eax = ((R.esi >>> 0)) | 0; // 84b0ef: mov eax, esi
        R.edx = R.eax < 0 ? -1 : 0; // 84b0f1: cdq 
        R.sub((R.edi >>> 0), (R.edx >>> 0), 32); // 84b0f2: cmp edi, edx
        if (R.cL) { pc = 34; continue; } // 84b0f4: jl 0x84b0fe
        pc = 32; continue;
      case 32: // 84b0f6
        if (!R.cLE) { pc = 43; continue; } // 84b0f6: jg 0x84b174
        pc = 33; continue;
      case 33: // 84b0f8
        R.sub(R.m.u32(((R.esp + 0x1c) | 0) >>> 0), (R.eax >>> 0), 32); // 84b0f8: cmp dword ptr [esp + 0x1c], eax
        if (!R.cf) { pc = 43; continue; } // 84b0fc: jae 0x84b174
        pc = 34; continue;
      case 34: // 84b0fe
        R.push(0x0); // 84b0fe: push 0
        R.push(0x0); // 84b100: push 0
        R.push(0x1); // 84b102: push 1
        R.push(0x0); // 84b104: push 0
        R.push((R.ebx >>> 0)); // 84b106: push ebx
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 84b107: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 84b10c: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84b10f: test eax, eax
        if (R.zf) { pc = 40; continue; } // 84b111: je 0x84b13e
        pc = 35; continue;
      case 35: // 84b113
        R.eax = (((R.esi + -0x16e360) | 0)) | 0; // 84b113: lea eax, [esi - 0x16e360]
        R.edx = R.eax < 0 ? -1 : 0; // 84b119: cdq 
        R.sub((R.edx >>> 0), (R.edi >>> 0), 32); // 84b11a: cmp edx, edi
        if (!R.cLE) { pc = 40; continue; } // 84b11c: jg 0x84b13e
        pc = 36; continue;
      case 36: // 84b11e
        if (R.cL) { pc = 38; continue; } // 84b11e: jl 0x84b126
        pc = 37; continue;
      case 37: // 84b120
        R.sub((R.eax >>> 0), R.m.u32(((R.esp + 0x1c) | 0) >>> 0), 32); // 84b120: cmp eax, dword ptr [esp + 0x1c]
        if (!R.cf) { pc = 40; continue; } // 84b124: jae 0x84b13e
        pc = 38; continue;
      case 38: // 84b126
        R.push(0x0); // 84b126: push 0
        R.push((R.ebp >>> 0)); // 84b128: push ebp
        R.call(0x5444a0, { n: 2, thisEcx: false, calleeClean: false }); // 84b129: call 0x5444a0
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 84b12e: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84b131: test eax, eax
        if (R.zf) { pc = 40; continue; } // 84b133: je 0x84b13e
        pc = 39; continue;
      case 39: // 84b135
        R.edi = (R.pop()) | 0; // 84b135: pop edi
        R.esi = (R.pop()) | 0; // 84b136: pop esi
        R.ebp = (R.pop()) | 0; // 84b137: pop ebp
        R.eax = ((R.eax & 0xffffff00) | (((0x1) & 0xff) << 0)) | 0; // 84b138: mov al, 1
        R.ebx = (R.pop()) | 0; // 84b13a: pop ebx
        R.rv = R.ret(8); return -1; // 84b13b: ret 0x20
      default: return pc;
    }
  }
}
function f_84af00_5(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 40: // 84b13e
        R.fpush(R.i64(((R.esp + 0x1c) | 0))); // 84b13e: fild qword ptr [esp + 0x1c]
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 84b142: fild dword ptr [esp + 0x30]
        R.st[0] = R.st[0] * 0.7142857142857143; // 84b146: fmul qword ptr [0x96f9c0]
        R.fcom(R.st[0], R.st[1]); R.fpop(); R.fpop(); // 84b14c: fcompp 
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84b14e: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 84b150: test ah, 0x41
        if (R.zf) { pc = 17; continue; } // 84b153: je 0x84b01c
        pc = 41; continue;
      case 41: // 84b159
        R.edi = (R.pop()) | 0; // 84b159: pop edi
        R.esi = (R.pop()) | 0; // 84b15a: pop esi
        R.ebp = (R.pop()) | 0; // 84b15b: pop ebp
        R.eax = ((R.eax & 0xffffff00) | (((0x1) & 0xff) << 0)) | 0; // 84b15c: mov al, 1
        R.ebx = (R.pop()) | 0; // 84b15e: pop ebx
        R.rv = R.ret(8); return -1; // 84b15f: ret 0x20
      case 42: // 84b162
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x30) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84b162: mov al, byte ptr [esp + 0x30]
        R.edi = (R.pop()) | 0; // 84b166: pop edi
        R.eax = ((R.eax & 0xffffff00) | (((R.neg(((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 84b167: neg al
        R.eax = ((R.eax & 0xffffff00) | (((R.sub(((R.eax >>> 0) & 0xff), ((R.eax >>> 0) & 0xff), 8, R.cf ? 1 : 0)) & 0xff) << 0)) | 0; // 84b169: sbb al, al
        R.esi = (R.pop()) | 0; // 84b16b: pop esi
        R.ebp = (R.pop()) | 0; // 84b16c: pop ebp
        R.eax = (R.logic((R.eax >>> 0) & 0x2, 32)) | 0; // 84b16d: and eax, 2
        R.ebx = (R.pop()) | 0; // 84b170: pop ebx
        R.rv = R.ret(8); return -1; // 84b171: ret 0x20
      case 43: // 84b174
        R.edi = (R.pop()) | 0; // 84b174: pop edi
        R.esi = (R.pop()) | 0; // 84b175: pop esi
        R.ebp = (R.pop()) | 0; // 84b176: pop ebp
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 84b177: xor al, al
        R.ebx = (R.pop()) | 0; // 84b179: pop ebx
        R.rv = R.ret(8); return -1; // 84b17a: ret 0x20
      default: return pc;
    }
  }
}
export function f_84af00(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 44) throw new Error(`f_84af00: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_84af00_0(R, pc); break;
      case 1: np = f_84af00_1(R, pc); break;
      case 2: np = f_84af00_2(R, pc); break;
      case 3: np = f_84af00_3(R, pc); break;
      case 4: np = f_84af00_4(R, pc); break;
      case 5: np = f_84af00_5(R, pc); break;
      default: throw new Error(`f_84af00: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_84af00: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_84af00.shared = true;
