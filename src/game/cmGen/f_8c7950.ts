// 0x8c7950 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 456740=2tc, 4cf5a0=1c, 54cfb0=0t, 58d710=5tc, 945a60=2, 945ff0=0, 946464=5
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x8c7950, 0x8c7973, 0x8c797c, 0x8c7980, 0x8c7988, 0x8c798c, 0x8c799c, 0x8c79b3, 0x8c79e7, 0x8c79ef, 0x8c7a07, 0x8c7a0d, 0x8c7a1c, 0x8c7a20, 0x8c7a38, 0x8c7a3c, 0x8c7a4a, 0x8c7a62, 0x8c7a68, 0x8c7a6c, 0x8c7a84, 0x8c7a8b, 0x8c7a92, 0x8c7aa9, 0x8c7abb, 0x8c7ac2, 0x8c7ad4, 0x8c7adc, 0x8c7af8, 0x8c7b02, 0x8c7b06, 0x8c7b12, 0x8c7b1c, 0x8c7b20, 0x8c7b25, 0x8c7b2d, 0x8c7b36, 0x8c7b3d, 0x8c7b4f, 0x8c7b57, 0x8c7b73, 0x8c7b7d, 0x8c7b81, 0x8c7b8d, 0x8c7b97, 0x8c7b9b, 0x8c7ba0, 0x8c7ba8, 0x8c7bb3, 0x8c7bb7, 0x8c7bd1, 0x8c7be0, 0x8c7be4, 0x8c7bf0, 0x8c7bf8, 0x8c7c05, 0x8c7c0d, 0x8c7c11, 0x8c7c1d, 0x8c7c24, 0x8c7c30, 0x8c7c34, 0x8c7c3b, 0x8c7c46, 0x8c7c4f, 0x8c7c84, 0x8c7c87, 0x8c7cae, 0x8c7cd2, 0x8c7d1e, 0x8c7d20, 0x8c7d29, 0x8c7d2f, 0x8c7d5e, 0x8c7d5f, 0x8c7d65, 0x8c7d6d, 0x8c7d92, 0x8c7d97, 0x8c7dc8, 0x8c7dd4, 0x8c7dde, 0x8c7de8, 0x8c7ded, 0x8c7e08]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10]);
function f_8c7950_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 8c7950
        R.esp = (R.sub((R.esp >>> 0), 0x14, 32)) | 0; // 8c7950: sub esp, 0x14
        R.push((R.ebx >>> 0)); // 8c7953: push ebx
        R.push((R.ebp >>> 0)); // 8c7954: push ebp
        R.ebp = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 8c7955: mov ebp, dword ptr [esp + 0x20]
        R.push((R.esi >>> 0)); // 8c7959: push esi
        R.m.w32(((R.esp + 0xc) | 0) >>> 0, (R.ecx >>> 0)); // 8c795a: mov dword ptr [esp + 0xc], ecx
        R.push((R.edi >>> 0)); // 8c795e: push edi
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8c795f: mov ecx, dword ptr [0xae1050]
        R.push((R.ebp >>> 0)); // 8c7965: push ebp
        R.ebx = (R.logic((R.ebx >>> 0) ^ (R.ebx >>> 0), 32)) | 0; // 8c7966: xor ebx, ebx
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 8c7968: call 0x4cf5a0
        R.esi = ((R.eax >>> 0)) | 0; // 8c796d: mov esi, eax
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8c796f: test esi, esi
        if (R.zf) { pc = 3; continue; } // 8c7971: je 0x8c7980
        pc = 1; continue;
      case 1: // 8c7973
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x35) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8c7973: mov al, byte ptr [esi + 0x35]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x3f, 8)) & 0xff) << 0)) | 0; // 8c7976: and al, 0x3f
        R.sub(((R.eax >>> 0) & 0xff), 0x2, 8); // 8c7978: cmp al, 2
        if (R.zf) { pc = 3; continue; } // 8c797a: je 0x8c7980
        pc = 2; continue;
      case 2: // 8c797c
        R.ebx = ((R.esi >>> 0)) | 0; // 8c797c: mov ebx, esi
        R.esi = (R.logic((R.esi >>> 0) ^ (R.esi >>> 0), 32)) | 0; // 8c797e: xor esi, esi
        pc = 3; continue;
      case 3: // 8c7980
        R.edi = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 8c7980: mov edi, dword ptr [esp + 0x34]
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 8c7984: test edi, edi
        if (!R.zf) { pc = 8; continue; } // 8c7986: jne 0x8c79e7
        pc = 4; continue;
      case 4: // 8c7988
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 8c7988: test ebp, ebp
        if (R.zf) { pc = 6; continue; } // 8c798a: je 0x8c799c
        pc = 5; continue;
      case 5: // 8c798c
        R.ecx = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 8c798c: mov ecx, dword ptr [ebp]
        R.eax = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 8c798f: mov eax, dword ptr [0xae2364]
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 8c7994: cmp ecx, eax
        if (!R.cL) { pc = 20; continue; } // 8c7996: jge 0x8c7a84
        pc = 6; continue;
      case 6: // 8c799c
        R.edx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 8c799c: mov edx, dword ptr [esp + 0x10]
        R.eax = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 8c79a0: mov eax, dword ptr [ebp]
        R.ecx = (R.m.u32(((R.edx + 0x86e) | 0) >>> 0)) | 0; // 8c79a3: mov ecx, dword ptr [edx + 0x86e]
        R.logic(R.m.u8(((R.ecx + R.eax * 8) | 0) >>> 0) & 0x20, 8); // 8c79a9: test byte ptr [ecx + eax*8], 0x20
        if (R.zf) { pc = 20; continue; } // 8c79ad: je 0x8c7a84
        pc = 7; continue;
      default: return pc;
    }
  }
}
function f_8c7950_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 7: // 8c79b3
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.eax >>> 0)); // 8c79b3: mov dword ptr [esp + 0x14], eax
        R.eax = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 8c79b7: mov eax, dword ptr [esp + 0x10]
        R.push(0x8e55c0); // 8c79bb: push 0x8e55c0
        R.push(0xe); // 8c79c0: push 0xe
        R.edx = (R.m.u32(((R.eax + 0x93e) | 0) >>> 0)) | 0; // 8c79c2: mov edx, dword ptr [eax + 0x93e]
        R.eax = (R.m.u32(((R.eax + 0x93a) | 0) >>> 0)) | 0; // 8c79c8: mov eax, dword ptr [eax + 0x93a]
        R.push((R.edx >>> 0)); // 8c79ce: push edx
        R.ecx = (((R.esp + 0x20) | 0)) | 0; // 8c79cf: lea ecx, [esp + 0x20]
        R.push((R.eax >>> 0)); // 8c79d3: push eax
        R.push((R.ecx >>> 0)); // 8c79d4: push ecx
        R.call(0x946464, { n: 5, thisEcx: false, calleeClean: false }); // 8c79d5: call 0x946464
        R.edi = ((R.eax >>> 0)) | 0; // 8c79da: mov edi, eax
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8c79dc: add esp, 0x14
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 8c79df: test edi, edi
        if (R.zf) { pc = 20; continue; } // 8c79e1: je 0x8c7a84
        pc = 8; continue;
      case 8: // 8c79e7
        R.eax = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 8c79e7: mov eax, dword ptr [esp + 0x30]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c79eb: test eax, eax
        if (!R.zf) { pc = 12; continue; } // 8c79ed: jne 0x8c7a1c
        pc = 9; continue;
      case 9: // 8c79ef
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.edi + 0x6) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8c79ef: mov cx, word ptr [edi + 6]
        R.eax = ((R.ecx >>> 0)) | 0; // 8c79f3: mov eax, ecx
        R.eax = (R.logic((R.eax >>> 0) & 0xffff, 32)) | 0; // 8c79f5: and eax, 0xffff
        R.edx = (((R.eax + R.eax * 2) | 0)) | 0; // 8c79fa: lea edx, [eax + eax*2]
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8c79fd: xor eax, eax
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.edi + 0x4) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8c79ff: mov ax, word ptr [edi + 4]
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 8c7a03: cmp eax, edx
        if (!R.cLE) { pc = 11; continue; } // 8c7a05: jg 0x8c7a0d
        pc = 10; continue;
      case 10: // 8c7a07
        R.sub(((R.ecx >>> 0) & 0xffff), 0x4, 16); // 8c7a07: cmp cx, 4
        if (!R.cf) { pc = 20; continue; } // 8c7a0b: jae 0x8c7a84
        pc = 11; continue;
      case 11: // 8c7a0d
        R.edi = (R.pop()) | 0; // 8c7a0d: pop edi
        R.esi = (R.pop()) | 0; // 8c7a0e: pop esi
        R.ebp = (R.pop()) | 0; // 8c7a0f: pop ebp
        R.eax = (0x1) | 0; // 8c7a10: mov eax, 1
        R.ebx = (R.pop()) | 0; // 8c7a15: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8c7a16: add esp, 0x14
        R.rv = R.ret(5); return -1; // 8c7a19: ret 0x14
      case 12: // 8c7a1c
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8c7a1c: test esi, esi
        if (R.zf) { pc = 14; continue; } // 8c7a1e: je 0x8c7a38
        pc = 13; continue;
      case 13: // 8c7a20
        R.ecx = (R.m.u32(((R.esi + 0x31) | 0) >>> 0)) | 0; // 8c7a20: mov ecx, dword ptr [esi + 0x31]
        R.eax = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 8c7a23: mov eax, dword ptr [esp + 0x30]
        R.edx = (R.m.u32(((R.esi + 0x2d) | 0) >>> 0)) | 0; // 8c7a27: mov edx, dword ptr [esi + 0x2d]
        R.push((R.ecx >>> 0)); // 8c7a2a: push ecx
        R.push((R.edx >>> 0)); // 8c7a2b: push edx
        R.ecx = (((R.eax + 0x2d) | 0)) | 0; // 8c7a2c: lea ecx, [eax + 0x2d]
        R.call(0x456740, { n: 2, thisEcx: true, calleeClean: true }); // 8c7a2f: call 0x456740
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c7a34: test eax, eax
        if (!R.zf) { pc = 16; continue; } // 8c7a36: jne 0x8c7a4a
        pc = 14; continue;
      default: return pc;
    }
  }
}
function f_8c7950_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 14: // 8c7a38
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 8c7a38: test ebx, ebx
        if (R.zf) { pc = 18; continue; } // 8c7a3a: je 0x8c7a68
        pc = 15; continue;
      case 15: // 8c7a3c
        R.ecx = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 8c7a3c: mov ecx, dword ptr [esp + 0x30]
        R.eax = (R.m.u32(((R.ebx + 0x4) | 0) >>> 0)) | 0; // 8c7a40: mov eax, dword ptr [ebx + 4]
        R.edx = (R.m.u32(((R.ecx + 0x4) | 0) >>> 0)) | 0; // 8c7a43: mov edx, dword ptr [ecx + 4]
        R.sub((R.edx >>> 0), (R.eax >>> 0), 32); // 8c7a46: cmp edx, eax
        if (R.zf) { pc = 18; continue; } // 8c7a48: je 0x8c7a68
        pc = 16; continue;
      case 16: // 8c7a4a
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.edi + 0x6) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8c7a4a: mov cx, word ptr [edi + 6]
        R.edx = (R.logic((R.edx >>> 0) ^ (R.edx >>> 0), 32)) | 0; // 8c7a4e: xor edx, edx
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.edi + 0x4) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8c7a50: mov dx, word ptr [edi + 4]
        R.eax = ((R.ecx >>> 0)) | 0; // 8c7a54: mov eax, ecx
        R.eax = (R.logic((R.eax >>> 0) & 0xffff, 32)) | 0; // 8c7a56: and eax, 0xffff
        R.eax = (((R.eax + R.eax * 2) | 0)) | 0; // 8c7a5b: lea eax, [eax + eax*2]
        R.sub((R.edx >>> 0), (R.eax >>> 0), 32); // 8c7a5e: cmp edx, eax
        if (!R.cLE) { pc = 11; continue; } // 8c7a60: jg 0x8c7a0d
        pc = 17; continue;
      case 17: // 8c7a62
        R.sub(((R.ecx >>> 0) & 0xffff), 0x4, 16); // 8c7a62: cmp cx, 4
        if (R.cf) { pc = 11; continue; } // 8c7a66: jb 0x8c7a0d
        pc = 18; continue;
      case 18: // 8c7a68
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8c7a68: test esi, esi
        if (R.zf) { pc = 20; continue; } // 8c7a6a: je 0x8c7a84
        pc = 19; continue;
      case 19: // 8c7a6c
        R.eax = (R.m.u32(((R.esi + 0x31) | 0) >>> 0)) | 0; // 8c7a6c: mov eax, dword ptr [esi + 0x31]
        R.ecx = (R.m.u32(((R.esi + 0x2d) | 0) >>> 0)) | 0; // 8c7a6f: mov ecx, dword ptr [esi + 0x2d]
        R.edx = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 8c7a72: mov edx, dword ptr [esp + 0x30]
        R.push((R.eax >>> 0)); // 8c7a76: push eax
        R.push((R.ecx >>> 0)); // 8c7a77: push ecx
        R.ecx = (((R.edx + 0x2d) | 0)) | 0; // 8c7a78: lea ecx, [edx + 0x2d]
        R.call(0x456740, { n: 2, thisEcx: true, calleeClean: true }); // 8c7a7b: call 0x456740
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c7a80: test eax, eax
        if (R.zf) { pc = 11; continue; } // 8c7a82: je 0x8c7a0d
        pc = 20; continue;
      case 20: // 8c7a84
        R.eax = (R.m.u32(((R.ebp + 0x69) | 0) >>> 0)) | 0; // 8c7a84: mov eax, dword ptr [ebp + 0x69]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c7a87: test eax, eax
        if (R.zf) { pc = 23; continue; } // 8c7a89: je 0x8c7aa9
        pc = 21; continue;
      case 21: // 8c7a8b
        R.ecx = (R.m.u32(((R.ebp + 0x61) | 0) >>> 0)) | 0; // 8c7a8b: mov ecx, dword ptr [ebp + 0x61]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 8c7a8e: test ecx, ecx
        if (!R.zf) { pc = 23; continue; } // 8c7a90: jne 0x8c7aa9
        pc = 22; continue;
      default: return pc;
    }
  }
}
function f_8c7950_3(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 22: // 8c7a92
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 8c7a92: xor ecx, ecx
        R.sub(R.m.u16(((R.eax + 0xc) | 0) >>> 0), 0xa0, 16); // 8c7a94: cmp word ptr [eax + 0xc], 0xa0
        R.edi = (R.pop()) | 0; // 8c7a9a: pop edi
        R.esi = (R.pop()) | 0; // 8c7a9b: pop esi
        R.ecx = ((R.ecx & 0xffffff00) | (((!R.cLE ? 1 : 0) & 0xff) << 0)) | 0; // 8c7a9c: setg cl
        R.ebp = (R.pop()) | 0; // 8c7a9f: pop ebp
        R.eax = ((R.ecx >>> 0)) | 0; // 8c7aa0: mov eax, ecx
        R.ebx = (R.pop()) | 0; // 8c7aa2: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8c7aa3: add esp, 0x14
        R.rv = R.ret(5); return -1; // 8c7aa6: ret 0x14
      case 23: // 8c7aa9
        R.edi = (0x7d1) | 0; // 8c7aa9: mov edi, 0x7d1
        R.sub(R.m.u16(((0xae2c92) | 0) >>> 0), ((R.edi >>> 0) & 0xffff), 16); // 8c7aae: cmp word ptr [0xae2c92], di
        if (!R.zf) { pc = 47; continue; } // 8c7ab5: jne 0x8c7ba8
        pc = 24; continue;
      case 24: // 8c7abb
        R.eax = (R.m.u32(((R.ebp + 0x4) | 0) >>> 0)) | 0; // 8c7abb: mov eax, dword ptr [ebp + 4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c7abe: test eax, eax
        if (R.zf) { pc = 36; continue; } // 8c7ac0: je 0x8c7b36
        pc = 25; continue;
      case 25: // 8c7ac2
        R.push(0x9b5ac0); // 8c7ac2: push 0x9b5ac0
        R.push((R.eax >>> 0)); // 8c7ac7: push eax
        R.call(0x945a60, { n: 2, thisEcx: false, calleeClean: false }); // 8c7ac8: call 0x945a60
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 8c7acd: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c7ad0: test eax, eax
        if (R.zf) { pc = 35; continue; } // 8c7ad2: je 0x8c7b2d
        pc = 26; continue;
      case 26: // 8c7ad4
        R.eax = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 8c7ad4: mov eax, dword ptr [esp + 0x30]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c7ad8: test eax, eax
        if (R.zf) { pc = 35; continue; } // 8c7ada: je 0x8c7b2d
        pc = 27; continue;
      case 27: // 8c7adc
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 8c7adc: mov eax, dword ptr [eax + 4]
        R.ecx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 8c7adf: mov ecx, dword ptr [0xae23b4]
        R.esi = (0xa8eb48) | 0; // 8c7ae5: mov esi, 0xa8eb48
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 8c7aea: lea edx, [eax + eax*8]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 8c7aed: shl edx, 4
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8c7af0: add edx, eax
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 8c7af2: add ecx, eax
        R.eax = (((R.ecx + R.edx * 4 + 0x4) | 0)) | 0; // 8c7af4: lea eax, [ecx + edx*4 + 4]
        pc = 28; continue;
      case 28: // 8c7af8
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8c7af8: mov dl, byte ptr [eax]
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.esi) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8c7afa: mov bl, byte ptr [esi]
        R.ecx = ((R.ecx & 0xffffff00) | (((((R.edx >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 8c7afc: mov cl, dl
        R.sub(((R.edx >>> 0) & 0xff), ((R.ebx >>> 0) & 0xff), 8); // 8c7afe: cmp dl, bl
        if (!R.zf) { pc = 33; continue; } // 8c7b00: jne 0x8c7b20
        pc = 29; continue;
      case 29: // 8c7b02
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 8c7b02: test cl, cl
        if (R.zf) { pc = 32; continue; } // 8c7b04: je 0x8c7b1c
        pc = 30; continue;
      default: return pc;
    }
  }
}
function f_8c7950_4(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 30: // 8c7b06
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x1) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8c7b06: mov dl, byte ptr [eax + 1]
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.esi + 0x1) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8c7b09: mov bl, byte ptr [esi + 1]
        R.ecx = ((R.ecx & 0xffffff00) | (((((R.edx >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 8c7b0c: mov cl, dl
        R.sub(((R.edx >>> 0) & 0xff), ((R.ebx >>> 0) & 0xff), 8); // 8c7b0e: cmp dl, bl
        if (!R.zf) { pc = 33; continue; } // 8c7b10: jne 0x8c7b20
        pc = 31; continue;
      case 31: // 8c7b12
        R.eax = (R.add((R.eax >>> 0), 0x2, 32)) | 0; // 8c7b12: add eax, 2
        R.esi = (R.add((R.esi >>> 0), 0x2, 32)) | 0; // 8c7b15: add esi, 2
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 8c7b18: test cl, cl
        if (!R.zf) { pc = 28; continue; } // 8c7b1a: jne 0x8c7af8
        pc = 32; continue;
      case 32: // 8c7b1c
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8c7b1c: xor eax, eax
        pc = 34; continue; // 8c7b1e: jmp 0x8c7b25
      case 33: // 8c7b20
        R.eax = (R.sub((R.eax >>> 0), (R.eax >>> 0), 32, R.cf ? 1 : 0)) | 0; // 8c7b20: sbb eax, eax
        R.eax = (R.sub((R.eax >>> 0), 0xffffffff, 32, R.cf ? 1 : 0)) | 0; // 8c7b22: sbb eax, -1
        pc = 34; continue;
      case 34: // 8c7b25
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c7b25: test eax, eax
        if (R.zf) { pc = 11; continue; } // 8c7b27: je 0x8c7a0d
        pc = 35; continue;
      case 35: // 8c7b2d
        R.sub(R.m.u16(((0xae2c92) | 0) >>> 0), ((R.edi >>> 0) & 0xffff), 16); // 8c7b2d: cmp word ptr [0xae2c92], di
        if (!R.zf) { pc = 47; continue; } // 8c7b34: jne 0x8c7ba8
        pc = 36; continue;
      case 36: // 8c7b36
        R.eax = (R.m.u32(((R.ebp + 0x4) | 0) >>> 0)) | 0; // 8c7b36: mov eax, dword ptr [ebp + 4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c7b39: test eax, eax
        if (R.zf) { pc = 47; continue; } // 8c7b3b: je 0x8c7ba8
        pc = 37; continue;
      case 37: // 8c7b3d
        R.push(0x9b5ab0); // 8c7b3d: push 0x9b5ab0
        R.push((R.eax >>> 0)); // 8c7b42: push eax
        R.call(0x945a60, { n: 2, thisEcx: false, calleeClean: false }); // 8c7b43: call 0x945a60
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 8c7b48: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c7b4b: test eax, eax
        if (R.zf) { pc = 47; continue; } // 8c7b4d: je 0x8c7ba8
        pc = 38; continue;
      case 38: // 8c7b4f
        R.eax = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 8c7b4f: mov eax, dword ptr [esp + 0x30]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c7b53: test eax, eax
        if (R.zf) { pc = 47; continue; } // 8c7b55: je 0x8c7ba8
        pc = 39; continue;
      case 39: // 8c7b57
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 8c7b57: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 8c7b5a: mov edx, dword ptr [0xae23b4]
        R.esi = (0xa8eb48) | 0; // 8c7b60: mov esi, 0xa8eb48
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 8c7b65: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 8c7b68: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 8c7b6b: add ecx, eax
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8c7b6d: add edx, eax
        R.eax = (((R.edx + R.ecx * 4 + 0x4) | 0)) | 0; // 8c7b6f: lea eax, [edx + ecx*4 + 4]
        pc = 40; continue;
      default: return pc;
    }
  }
}
function f_8c7950_5(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 40: // 8c7b73
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8c7b73: mov dl, byte ptr [eax]
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.esi) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8c7b75: mov bl, byte ptr [esi]
        R.ecx = ((R.ecx & 0xffffff00) | (((((R.edx >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 8c7b77: mov cl, dl
        R.sub(((R.edx >>> 0) & 0xff), ((R.ebx >>> 0) & 0xff), 8); // 8c7b79: cmp dl, bl
        if (!R.zf) { pc = 45; continue; } // 8c7b7b: jne 0x8c7b9b
        pc = 41; continue;
      case 41: // 8c7b7d
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 8c7b7d: test cl, cl
        if (R.zf) { pc = 44; continue; } // 8c7b7f: je 0x8c7b97
        pc = 42; continue;
      case 42: // 8c7b81
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x1) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8c7b81: mov dl, byte ptr [eax + 1]
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.esi + 0x1) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8c7b84: mov bl, byte ptr [esi + 1]
        R.ecx = ((R.ecx & 0xffffff00) | (((((R.edx >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 8c7b87: mov cl, dl
        R.sub(((R.edx >>> 0) & 0xff), ((R.ebx >>> 0) & 0xff), 8); // 8c7b89: cmp dl, bl
        if (!R.zf) { pc = 45; continue; } // 8c7b8b: jne 0x8c7b9b
        pc = 43; continue;
      case 43: // 8c7b8d
        R.eax = (R.add((R.eax >>> 0), 0x2, 32)) | 0; // 8c7b8d: add eax, 2
        R.esi = (R.add((R.esi >>> 0), 0x2, 32)) | 0; // 8c7b90: add esi, 2
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 8c7b93: test cl, cl
        if (!R.zf) { pc = 40; continue; } // 8c7b95: jne 0x8c7b73
        pc = 44; continue;
      case 44: // 8c7b97
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8c7b97: xor eax, eax
        pc = 46; continue; // 8c7b99: jmp 0x8c7ba0
      case 45: // 8c7b9b
        R.eax = (R.sub((R.eax >>> 0), (R.eax >>> 0), 32, R.cf ? 1 : 0)) | 0; // 8c7b9b: sbb eax, eax
        R.eax = (R.sub((R.eax >>> 0), 0xffffffff, 32, R.cf ? 1 : 0)) | 0; // 8c7b9d: sbb eax, -1
        pc = 46; continue;
      case 46: // 8c7ba0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c7ba0: test eax, eax
        if (R.zf) { pc = 11; continue; } // 8c7ba2: je 0x8c7a0d
        pc = 47; continue;
      case 47: // 8c7ba8
        R.eax = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 8c7ba8: mov eax, dword ptr [esp + 0x38]
        R.esi = (R.m.u32(((R.ebp + 0x61) | 0) >>> 0)) | 0; // 8c7bac: mov esi, dword ptr [ebp + 0x61]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c7baf: test eax, eax
        if (R.zf) { pc = 51; continue; } // 8c7bb1: je 0x8c7be0
        pc = 48; continue;
      case 48: // 8c7bb3
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8c7bb3: test esi, esi
        if (R.zf) { pc = 53; continue; } // 8c7bb5: je 0x8c7bf0
        pc = 49; continue;
      case 49: // 8c7bb7
        R.push(0x3e8); // 8c7bb7: push 0x3e8
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8c7bbc: call 0x90cfc0
        R.ecx = (((R.m.u16(((R.esi + 0xd) | 0) >>> 0)) << 16 >> 16)) | 0; // 8c7bc1: movsx ecx, word ptr [esi + 0xd]
        R.eax = (R.add((R.eax >>> 0), 0x1f40, 32)) | 0; // 8c7bc5: add eax, 0x1f40
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8c7bca: add esp, 4
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 8c7bcd: cmp ecx, eax
        if (R.cLE) { pc = 53; continue; } // 8c7bcf: jle 0x8c7bf0
        pc = 50; continue;
      default: return pc;
    }
  }
}
function f_8c7950_6(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 50: // 8c7bd1
        R.edi = (R.pop()) | 0; // 8c7bd1: pop edi
        R.esi = (R.pop()) | 0; // 8c7bd2: pop esi
        R.ebp = (R.pop()) | 0; // 8c7bd3: pop ebp
        R.eax = (0x1) | 0; // 8c7bd4: mov eax, 1
        R.ebx = (R.pop()) | 0; // 8c7bd9: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8c7bda: add esp, 0x14
        R.rv = R.ret(5); return -1; // 8c7bdd: ret 0x14
      case 51: // 8c7be0
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8c7be0: test esi, esi
        if (R.zf) { pc = 53; continue; } // 8c7be2: je 0x8c7bf0
        pc = 52; continue;
      case 52: // 8c7be4
        R.sub(R.m.u16(((R.esi + 0xd) | 0) >>> 0), 0x2134, 16); // 8c7be4: cmp word ptr [esi + 0xd], 0x2134
        if (!R.cLE) { pc = 11; continue; } // 8c7bea: jg 0x8c7a0d
        pc = 53; continue;
      case 53: // 8c7bf0
        R.eax = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 8c7bf0: mov eax, dword ptr [esp + 0x30]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c7bf4: test eax, eax
        if (R.zf) { pc = 55; continue; } // 8c7bf6: je 0x8c7c05
        pc = 54; continue;
      case 54: // 8c7bf8
        R.sub(R.m.u32(((R.eax + 0xc) | 0) >>> 0), 0x88b7, 32); // 8c7bf8: cmp dword ptr [eax + 0xc], 0x88b7
        if (!R.cLE) { pc = 11; continue; } // 8c7bff: jg 0x8c7a0d
        pc = 55; continue;
      case 55: // 8c7c05
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.ebp + 0x18) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8c7c05: mov cl, byte ptr [ebp + 0x18]
        R.sub(((R.ecx >>> 0) & 0xff), 0x18, 8); // 8c7c08: cmp cl, 0x18
        if (!R.cL) { pc = 58; continue; } // 8c7c0b: jge 0x8c7c1d
        pc = 56; continue;
      case 56: // 8c7c0d
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8c7c0d: test esi, esi
        if (R.zf) { pc = 58; continue; } // 8c7c0f: je 0x8c7c1d
        pc = 57; continue;
      case 57: // 8c7c11
        R.sub(R.m.u16(((R.esi + 0x7) | 0) >>> 0), 0xbe, 16); // 8c7c11: cmp word ptr [esi + 7], 0xbe
        if (!R.cLE) { pc = 11; continue; } // 8c7c17: jg 0x8c7a0d
        pc = 58; continue;
      case 58: // 8c7c1d
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebp + 0x22) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8c7c1d: mov al, byte ptr [ebp + 0x22]
        R.sub(((R.eax >>> 0) & 0xff), 0x5, 8); // 8c7c20: cmp al, 5
        if (!R.cf) { pc = 60; continue; } // 8c7c22: jae 0x8c7c30
        pc = 59; continue;
      case 59: // 8c7c24
        R.edi = (R.pop()) | 0; // 8c7c24: pop edi
        R.esi = (R.pop()) | 0; // 8c7c25: pop esi
        R.ebp = (R.pop()) | 0; // 8c7c26: pop ebp
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8c7c27: xor eax, eax
        R.ebx = (R.pop()) | 0; // 8c7c29: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8c7c2a: add esp, 0x14
        R.rv = R.ret(5); return -1; // 8c7c2d: ret 0x14
      case 60: // 8c7c30
        R.sub(((R.eax >>> 0) & 0xff), 0x14, 8); // 8c7c30: cmp al, 0x14
        if (R.cBE) { pc = 64; continue; } // 8c7c32: jbe 0x8c7c4f
        pc = 61; continue;
      case 61: // 8c7c34
        R.eax = (R.m.u32(((R.ebp + 0x1a) | 0) >>> 0)) | 0; // 8c7c34: mov eax, dword ptr [ebp + 0x1a]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c7c37: test eax, eax
        if (R.zf) { pc = 64; continue; } // 8c7c39: je 0x8c7c4f
        pc = 62; continue;
      default: return pc;
    }
  }
}
function f_8c7950_7(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 62: // 8c7c3b
        R.sub(R.m.u16(((R.eax + 0x8e) | 0) >>> 0), 0xbb8, 16); // 8c7c3b: cmp word ptr [eax + 0x8e], 0xbb8
        if (R.cLE) { pc = 64; continue; } // 8c7c44: jle 0x8c7c4f
        pc = 63; continue;
      case 63: // 8c7c46
        R.sub(((R.ecx >>> 0) & 0xff), 0x20, 8); // 8c7c46: cmp cl, 0x20
        if (R.cL) { pc = 11; continue; } // 8c7c49: jl 0x8c7a0d
        pc = 64; continue;
      case 64: // 8c7c4f
        R.edx = (R.m.u32(((R.ebp + 0x1a) | 0) >>> 0)) | 0; // 8c7c4f: mov edx, dword ptr [ebp + 0x1a]
        R.esi = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 8c7c52: mov esi, dword ptr [esp + 0x10]
        R.eax = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 8c7c56: mov eax, dword ptr [edx]
        R.ebx = (R.m.u32(((R.esi + 0x86e) | 0) >>> 0)) | 0; // 8c7c58: mov ebx, dword ptr [esi + 0x86e]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 8c7c5e: lea ecx, [eax + eax*4]
        R.eax = (((R.eax + R.ecx * 2) | 0)) | 0; // 8c7c61: lea eax, [eax + ecx*2]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 8c7c64: lea edx, [eax + eax*4]
        R.eax = (R.m.u32(((0xb74318) | 0) >>> 0)) | 0; // 8c7c67: mov eax, dword ptr [0xb74318]
        R.ecx = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 8c7c6c: mov ecx, dword ptr [eax + 4]
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.ecx + R.edx * 2 + 0x2) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8c7c6f: mov dx, word ptr [ecx + edx*2 + 2]
        R.ecx = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 8c7c74: mov ecx, dword ptr [ebp]
        R.eax = ((R.eax & 0xffff0000) | (((((R.edx >>> 0) & 0xffff)) & 0xffff) << 0)) | 0; // 8c7c77: mov ax, dx
        R.eax = ((R.eax & 0xffff0000) | (((R.sub(((R.eax >>> 0) & 0xffff), R.m.u16(((R.ebx + R.ecx * 8 + 0x5) | 0) >>> 0), 16)) & 0xffff) << 0)) | 0; // 8c7c7a: sub ax, word ptr [ebx + ecx*8 + 5]
        R.logic(((R.eax >>> 0) & 0xffff) & ((R.eax >>> 0) & 0xffff), 16); // 8c7c7f: test ax, ax
        if (R.cLE) { pc = 67; continue; } // 8c7c82: jle 0x8c7cae
        pc = 65; continue;
      case 65: // 8c7c84
        R.ecx = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8c7c84: movsx ecx, ax
        pc = 66; continue;
      case 66: // 8c7c87
        R.eax = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 8c7c87: mov eax, dword ptr [ebp]
        R.ebx = (R.m.u32(((R.esi + 0x86e) | 0) >>> 0)) | 0; // 8c7c8a: mov ebx, dword ptr [esi + 0x86e]
        R.m.w16(((R.ebx + R.eax * 8 + 0x3) | 0) >>> 0, R.shl(R.m.u16(((R.ebx + R.eax * 8 + 0x3) | 0) >>> 0), 0x1, 16)); // 8c7c90: shl word ptr [ebx + eax*8 + 3], 1
        R.eax = (((R.ebx + R.eax * 8 + 0x3) | 0)) | 0; // 8c7c95: lea eax, [ebx + eax*8 + 3]
        R.ebx = (R.m.u32(((R.esi + 0x86e) | 0) >>> 0)) | 0; // 8c7c99: mov ebx, dword ptr [esi + 0x86e]
        R.eax = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 8c7c9f: mov eax, dword ptr [ebp]
        R.m.w8(((R.ebx + R.eax * 8 + 0x3) | 0) >>> 0, R.logic(R.m.u8(((R.ebx + R.eax * 8 + 0x3) | 0) >>> 0) & 0xfe, 8)); // 8c7ca2: and byte ptr [ebx + eax*8 + 3], 0xfe
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 8c7ca7: dec ecx
        R.eax = (((R.ebx + R.eax * 8 + 0x3) | 0)) | 0; // 8c7ca8: lea eax, [ebx + eax*8 + 3]
        if (!R.zf) { pc = 66; continue; } // 8c7cac: jne 0x8c7c87
        pc = 67; continue;
      case 67: // 8c7cae
        R.ecx = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 8c7cae: mov ecx, dword ptr [ebp]
        R.eax = (R.m.u32(((R.esi + 0x86e) | 0) >>> 0)) | 0; // 8c7cb1: mov eax, dword ptr [esi + 0x86e]
        R.m.w16(((R.eax + R.ecx * 8 + 0x5) | 0) >>> 0, ((R.edx >>> 0) & 0xffff)); // 8c7cb7: mov word ptr [eax + ecx*8 + 5], dx
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8c7cbc: mov ax, word ptr [0xae2c92]
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 8c7cc2: xor ecx, ecx
        R.ecx = ((R.ecx & 0xffff0000) | (((((R.eax >>> 0) & 0xffff)) & 0xffff) << 0)) | 0; // 8c7cc4: mov cx, ax
        R.ecx = (R.sub((R.ecx >>> 0), 0x2, 32)) | 0; // 8c7cc7: sub ecx, 2
        R.sub((R.ecx >>> 0), (R.edi >>> 0), 32); // 8c7cca: cmp ecx, edi
        if (R.cL) { pc = 80; continue; } // 8c7ccc: jl 0x8c7dd4
        pc = 68; continue;
      default: return pc;
    }
  }
}
function f_8c7950_8(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 68: // 8c7cd2
        R.edx = (R.m.u32(((0xb74318) | 0) >>> 0)) | 0; // 8c7cd2: mov edx, dword ptr [0xb74318]
        R.m.w16(((R.esp + 0x30) | 0) >>> 0, ((R.eax >>> 0) & 0xffff)); // 8c7cd8: mov word ptr [esp + 0x30], ax
        R.m.w16(((R.esp + 0x28) | 0) >>> 0, ((R.eax >>> 0) & 0xffff)); // 8c7cdd: mov word ptr [esp + 0x28], ax
        R.eax = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 8c7ce2: mov eax, dword ptr [esp + 0x30]
        R.esi = (R.m.u32(((R.edx + 0x1c) | 0) >>> 0)) | 0; // 8c7ce6: mov esi, dword ptr [edx + 0x1c]
        R.push((R.eax >>> 0)); // 8c7ce9: push eax
        R.ecx = (0xae2c90) | 0; // 8c7cea: mov ecx, 0xae2c90
        R.call(0x54cfb0, { n: 0, thisEcx: true, calleeClean: false }); // 8c7cef: call 0x54cfb0
        R.ecx = (R.m.u32(((R.esp + 0x2c) | 0) >>> 0)) | 0; // 8c7cf4: mov ecx, dword ptr [esp + 0x2c]
        R.push((R.eax >>> 0)); // 8c7cf8: push eax
        R.ecx = (R.add((R.ecx >>> 0), 0xfffffffe, 32)) | 0; // 8c7cf9: add ecx, -2
        R.push((R.ecx >>> 0)); // 8c7cfc: push ecx
        R.ecx = (0xae2c90) | 0; // 8c7cfd: mov ecx, 0xae2c90
        R.call(0x54cfb0, { n: 0, thisEcx: true, calleeClean: false }); // 8c7d02: call 0x54cfb0
        R.edx = (R.m.u32(((R.ebp + 0x1a) | 0) >>> 0)) | 0; // 8c7d07: mov edx, dword ptr [ebp + 0x1a]
        R.push((R.eax >>> 0)); // 8c7d0a: push eax
        R.push((R.edx >>> 0)); // 8c7d0b: push edx
        R.ecx = ((R.esi >>> 0)) | 0; // 8c7d0c: mov ecx, esi
        R.call(0x58d710, { n: 5, thisEcx: true, calleeClean: true }); // 8c7d0e: call 0x58d710
        R.sub(((R.eax >>> 0) & 0xffff), 0x10, 16); // 8c7d13: cmp ax, 0x10
        R.edi = (0x10) | 0; // 8c7d17: mov edi, 0x10
        if (!R.cLE) { pc = 70; continue; } // 8c7d1c: jg 0x8c7d20
        pc = 69; continue;
      case 69: // 8c7d1e
        R.edi = ((R.eax >>> 0)) | 0; // 8c7d1e: mov edi, eax
        pc = 70; continue;
      case 70: // 8c7d20
        R.esi = (R.logic((R.esi >>> 0) ^ (R.esi >>> 0), 32)) | 0; // 8c7d20: xor esi, esi
        R.ebx = (R.logic((R.ebx >>> 0) ^ (R.ebx >>> 0), 32)) | 0; // 8c7d22: xor ebx, ebx
        R.logic(((R.edi >>> 0) & 0xffff) & ((R.edi >>> 0) & 0xffff), 16); // 8c7d24: test di, di
        if (R.cLE) { pc = 75; continue; } // 8c7d27: jle 0x8c7d65
        pc = 71; continue;
      case 71: // 8c7d29
        R.sub(((R.esi >>> 0) & 0xffff), 0x10, 16); // 8c7d29: cmp si, 0x10
        if (!R.cL) { pc = 75; continue; } // 8c7d2d: jge 0x8c7d65
        pc = 72; continue;
      case 72: // 8c7d2f
        R.fpush(2.0); // 8c7d2f: fld qword ptr [0x968950]
        R.eax = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8c7d35: movsx eax, si
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.eax >>> 0)); // 8c7d38: mov dword ptr [esp + 0x30], eax
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 8c7d3c: fild dword ptr [esp + 0x30]
        R.call(0x945ff0, { n: 0, thisEcx: false, calleeClean: false }); // 8c7d40: call 0x945ff0
        R.ftol(); // 8c7d45: call 0x945640
        R.edx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 8c7d4a: mov edx, dword ptr [esp + 0x10]
        R.ecx = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 8c7d4e: mov ecx, dword ptr [ebp]
        R.edx = (R.m.u32(((R.edx + 0x86e) | 0) >>> 0)) | 0; // 8c7d51: mov edx, dword ptr [edx + 0x86e]
        R.logic(R.m.u16(((R.edx + R.ecx * 8 + 0x3) | 0) >>> 0) & ((R.eax >>> 0) & 0xffff), 16); // 8c7d57: test word ptr [edx + ecx*8 + 3], ax
        if (R.zf) { pc = 74; continue; } // 8c7d5c: je 0x8c7d5f
        pc = 73; continue;
      case 73: // 8c7d5e
        R.ebx = (R.incdec((R.ebx >>> 0), 1, 32)) | 0; // 8c7d5e: inc ebx
        pc = 74; continue;
      case 74: // 8c7d5f
        R.esi = (R.incdec((R.esi >>> 0), 1, 32)) | 0; // 8c7d5f: inc esi
        R.sub(((R.esi >>> 0) & 0xffff), ((R.edi >>> 0) & 0xffff), 16); // 8c7d60: cmp si, di
        if (R.cL) { pc = 71; continue; } // 8c7d63: jl 0x8c7d29
        pc = 75; continue;
      default: return pc;
    }
  }
}
function f_8c7950_9(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 75: // 8c7d65
        R.eax = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 8c7d65: mov eax, dword ptr [esp + 0x38]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c7d69: test eax, eax
        if (R.zf) { pc = 81; continue; } // 8c7d6b: je 0x8c7dde
        pc = 76; continue;
      case 76: // 8c7d6d
        R.push(0x3); // 8c7d6d: push 3
        R.esi = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8c7d6f: movsx esi, bx
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8c7d72: call 0x90cfc0
        R.ebx = (0xb) | 0; // 8c7d77: mov ebx, 0xb
        R.push(0x3); // 8c7d7c: push 3
        R.ebx = (R.sub((R.ebx >>> 0), (R.eax >>> 0), 32)) | 0; // 8c7d7e: sub ebx, eax
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8c7d80: call 0x90cfc0
        R.ebx = (R.add((R.ebx >>> 0), (R.eax >>> 0), 32)) | 0; // 8c7d85: add ebx, eax
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 8c7d87: add esp, 8
        R.sub((R.esi >>> 0), (R.ebx >>> 0), 32); // 8c7d8a: cmp esi, ebx
        if (!R.cLE) { pc = 11; continue; } // 8c7d8c: jg 0x8c7a0d
        pc = 77; continue;
      case 77: // 8c7d92
        R.logic(((R.edi >>> 0) & 0xffff) & ((R.edi >>> 0) & 0xffff), 16); // 8c7d92: test di, di
        if (R.zf) { pc = 84; continue; } // 8c7d95: je 0x8c7e08
        pc = 78; continue;
      case 78: // 8c7d97
        R.push(0xa); // 8c7d97: push 0xa
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8c7d99: call 0x90cfc0
        R.ebx = (0x46) | 0; // 8c7d9e: mov ebx, 0x46
        R.push(0xa); // 8c7da3: push 0xa
        R.ebx = (R.sub((R.ebx >>> 0), (R.eax >>> 0), 32)) | 0; // 8c7da5: sub ebx, eax
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8c7da7: call 0x90cfc0
        R.ebx = (R.add((R.ebx >>> 0), (R.eax >>> 0), 32)) | 0; // 8c7dac: add ebx, eax
        R.eax = (((R.esi + R.esi * 2) | 0)) | 0; // 8c7dae: lea eax, [esi + esi*2]
        R.ecx = (((((R.edi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8c7db1: movsx ecx, di
        R.eax = (((R.esi + R.eax * 8) | 0)) | 0; // 8c7db4: lea eax, [esi + eax*8]
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 8c7db7: add esp, 8
        R.eax = (R.shl((R.eax >>> 0), 0x2, 32)) | 0; // 8c7dba: shl eax, 2
        R.edx = R.eax < 0 ? -1 : 0; // 8c7dbd: cdq 
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.ecx >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 8c7dbe: idiv ecx
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 8c7dc0: cmp eax, ebx
        if (!R.cLE) { pc = 11; continue; } // 8c7dc2: jg 0x8c7a0d
        pc = 79; continue;
      case 79: // 8c7dc8
        R.edi = (R.pop()) | 0; // 8c7dc8: pop edi
        R.esi = (R.pop()) | 0; // 8c7dc9: pop esi
        R.ebp = (R.pop()) | 0; // 8c7dca: pop ebp
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8c7dcb: xor eax, eax
        R.ebx = (R.pop()) | 0; // 8c7dcd: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8c7dce: add esp, 0x14
        R.rv = R.ret(5); return -1; // 8c7dd1: ret 0x14
      case 80: // 8c7dd4
        R.eax = (0x10) | 0; // 8c7dd4: mov eax, 0x10
        pc = 69; continue; // 8c7dd9: jmp 0x8c7d1e
      case 81: // 8c7dde
        R.sub(((R.ebx >>> 0) & 0xffff), 0xb, 16); // 8c7dde: cmp bx, 0xb
        if (!R.cLE) { pc = 11; continue; } // 8c7de2: jg 0x8c7a0d
        pc = 82; continue;
      case 82: // 8c7de8
        R.logic(((R.edi >>> 0) & 0xffff) & ((R.edi >>> 0) & 0xffff), 16); // 8c7de8: test di, di
        if (R.zf) { pc = 84; continue; } // 8c7deb: je 0x8c7e08
        pc = 83; continue;
      default: return pc;
    }
  }
}
function f_8c7950_10(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 83: // 8c7ded
        R.eax = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8c7ded: movsx eax, bx
        R.ecx = (((((R.edi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8c7df0: movsx ecx, di
        R.edx = (((R.eax + R.eax * 2) | 0)) | 0; // 8c7df3: lea edx, [eax + eax*2]
        R.eax = (((R.eax + R.edx * 8) | 0)) | 0; // 8c7df6: lea eax, [eax + edx*8]
        R.eax = (R.shl((R.eax >>> 0), 0x2, 32)) | 0; // 8c7df9: shl eax, 2
        R.edx = R.eax < 0 ? -1 : 0; // 8c7dfc: cdq 
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.ecx >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 8c7dfd: idiv ecx
        R.sub((R.eax >>> 0), 0x46, 32); // 8c7dff: cmp eax, 0x46
        if (!R.cLE) { pc = 11; continue; } // 8c7e02: jg 0x8c7a0d
        pc = 84; continue;
      case 84: // 8c7e08
        R.edi = (R.pop()) | 0; // 8c7e08: pop edi
        R.esi = (R.pop()) | 0; // 8c7e09: pop esi
        R.ebp = (R.pop()) | 0; // 8c7e0a: pop ebp
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8c7e0b: xor eax, eax
        R.ebx = (R.pop()) | 0; // 8c7e0d: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8c7e0e: add esp, 0x14
        R.rv = R.ret(5); return -1; // 8c7e11: ret 0x14
      default: return pc;
    }
  }
}
export function f_8c7950(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 85) throw new Error(`f_8c7950: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_8c7950_0(R, pc); break;
      case 1: np = f_8c7950_1(R, pc); break;
      case 2: np = f_8c7950_2(R, pc); break;
      case 3: np = f_8c7950_3(R, pc); break;
      case 4: np = f_8c7950_4(R, pc); break;
      case 5: np = f_8c7950_5(R, pc); break;
      case 6: np = f_8c7950_6(R, pc); break;
      case 7: np = f_8c7950_7(R, pc); break;
      case 8: np = f_8c7950_8(R, pc); break;
      case 9: np = f_8c7950_9(R, pc); break;
      case 10: np = f_8c7950_10(R, pc); break;
      default: throw new Error(`f_8c7950: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_8c7950: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_8c7950.shared = true;
