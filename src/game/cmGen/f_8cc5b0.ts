// 0x8cc5b0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4cf5a0=1c, 4cf5f0=2tc, 53b620=1, 5e8290=9, 846920=6tcf, 8e8ed0=0t, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x8cc5b0, 0x8cc612, 0x8cc61d, 0x8cc635, 0x8cc637, 0x8cc66e, 0x8cc675, 0x8cc67f, 0x8cc683, 0x8cc68a, 0x8cc693, 0x8cc69a, 0x8cc6a3, 0x8cc6a5, 0x8cc6ab, 0x8cc6ba, 0x8cc6c0, 0x8cc6cc, 0x8cc6d9, 0x8cc6df, 0x8cc700, 0x8cc706, 0x8cc710, 0x8cc732, 0x8cc738, 0x8cc744, 0x8cc74c, 0x8cc751, 0x8cc753, 0x8cc763, 0x8cc76a, 0x8cc7cd, 0x8cc7d9, 0x8cc7ed, 0x8cc7ff, 0x8cc828, 0x8cc82e, 0x8cc849, 0x8cc84d, 0x8cc877, 0x8cc89d, 0x8cc8a5, 0x8cc8ac, 0x8cc8da, 0x8cc8e8, 0x8cc8ea]);
const CH = new Uint8Array([0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6]);
function f_8cc5b0_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 8cc5b0
        R.esp = (R.sub((R.esp >>> 0), 0x214, 32)) | 0; // 8cc5b0: sub esp, 0x214
        R.push((R.ebx >>> 0)); // 8cc5b6: push ebx
        R.push((R.ebp >>> 0)); // 8cc5b7: push ebp
        R.push((R.esi >>> 0)); // 8cc5b8: push esi
        R.push((R.edi >>> 0)); // 8cc5b9: push edi
        R.edi = (R.m.u32(((R.esp + 0x228) | 0) >>> 0)) | 0; // 8cc5ba: mov edi, dword ptr [esp + 0x228]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 8cc5c1: mov edx, dword ptr [0xae23b4]
        R.esi = ((R.ecx >>> 0)) | 0; // 8cc5c7: mov esi, ecx
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, 0x16d); // 8cc5c9: mov dword ptr [esp + 0x10], 0x16d
        R.eax = (R.m.u32(((R.edi + 0x8) | 0) >>> 0)) | 0; // 8cc5d1: mov eax, dword ptr [edi + 8]
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.esi >>> 0)); // 8cc5d4: mov dword ptr [esp + 0x18], esi
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8cc5d8: add edx, eax
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 8cc5da: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 8cc5dd: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 8cc5e0: add ecx, eax
        R.eax = (R.m.u32(((R.edi + 0xc) | 0) >>> 0)) | 0; // 8cc5e2: mov eax, dword ptr [edi + 0xc]
        R.ebx = (((R.edx + R.ecx * 4) | 0)) | 0; // 8cc5e5: lea ebx, [edx + ecx*4]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 8cc5e8: lea ecx, [eax + eax*4]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ebx >>> 0)); // 8cc5eb: mov dword ptr [esp + 0x1c], ebx
        R.eax = (((R.eax + R.ecx * 2) | 0)) | 0; // 8cc5ef: lea eax, [eax + ecx*2]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 8cc5f2: lea edx, [eax + eax*4]
        R.eax = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 8cc5f5: mov eax, dword ptr [0xae23bc]
        R.ecx = (((R.eax + R.edx * 2) | 0)) | 0; // 8cc5fa: lea ecx, [eax + edx*2]
        R.push((R.ecx >>> 0)); // 8cc5fd: push ecx
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8cc5fe: mov ecx, dword ptr [0xae1050]
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 8cc604: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cc609: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 8cc60b: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 3; continue; } // 8cc610: je 0x8cc635
        pc = 1; continue;
      case 1: // 8cc612
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x35) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8cc612: mov dl, byte ptr [eax + 0x35]
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) & 0x3f, 8)) & 0xff) << 0)) | 0; // 8cc615: and dl, 0x3f
        R.sub(((R.edx >>> 0) & 0xff), 0x5, 8); // 8cc618: cmp dl, 5
        if (R.zf) { pc = 3; continue; } // 8cc61b: je 0x8cc635
        pc = 2; continue;
      case 2: // 8cc61d
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 8cc61d: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 8cc620: mov edx, dword ptr [0xae23b4]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 8cc626: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 8cc629: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 8cc62c: add ecx, eax
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8cc62e: add edx, eax
        R.ecx = (((R.edx + R.ecx * 4) | 0)) | 0; // 8cc630: lea ecx, [edx + ecx*4]
        pc = 4; continue; // 8cc633: jmp 0x8cc637
      case 3: // 8cc635
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 8cc635: xor ecx, ecx
        pc = 4; continue;
      default: return pc;
    }
  }
}
function f_8cc5b0_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 4: // 8cc637
        R.eax = (R.m.u32(((R.edi + 0xc) | 0) >>> 0)) | 0; // 8cc637: mov eax, dword ptr [edi + 0xc]
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.ecx >>> 0)); // 8cc63a: mov dword ptr [esp + 0x14], ecx
        R.push((R.ecx >>> 0)); // 8cc63e: push ecx
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8cc63f: mov ecx, dword ptr [0xae1050]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 8cc645: lea edx, [eax + eax*4]
        R.eax = (((R.eax + R.edx * 2) | 0)) | 0; // 8cc648: lea eax, [eax + edx*2]
        R.edx = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 8cc64b: mov edx, dword ptr [0xae23bc]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 8cc651: lea eax, [eax + eax*4]
        R.ebp = (((R.edx + R.eax * 2) | 0)) | 0; // 8cc654: lea ebp, [edx + eax*2]
        R.push((R.ebp >>> 0)); // 8cc657: push ebp
        R.call(0x4cf5f0, { n: 2, thisEcx: true, calleeClean: true }); // 8cc658: call 0x4cf5f0
        R.edx = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 8cc65d: mov edx, dword ptr [ebx + 0x53]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) ^ ((R.ecx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 8cc660: xor cl, cl
        R.esi = (R.add((R.esi >>> 0), 0x8ac, 32)) | 0; // 8cc662: add esi, 0x8ac
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.eax >>> 0)); // 8cc668: mov dword ptr [esp + 0x20], eax
        R.eax = ((R.esi >>> 0)) | 0; // 8cc66c: mov eax, esi
        pc = 5; continue;
      case 5: // 8cc66e
        R.ebx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8cc66e: mov ebx, dword ptr [eax]
        R.sub(R.m.u32(((R.ebx + 0xa) | 0) >>> 0), (R.edx >>> 0), 32); // 8cc670: cmp dword ptr [ebx + 0xa], edx
        if (R.zf) { pc = 13; continue; } // 8cc673: je 0x8cc6a5
        pc = 6; continue;
      case 6: // 8cc675
        R.ecx = ((R.ecx & 0xffffff00) | (((R.incdec(((R.ecx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 8cc675: inc cl
        R.eax = (R.add((R.eax >>> 0), 0x4, 32)) | 0; // 8cc677: add eax, 4
        R.sub(((R.ecx >>> 0) & 0xff), 0x1c, 8); // 8cc67a: cmp cl, 0x1c
        if (R.cL) { pc = 5; continue; } // 8cc67d: jl 0x8cc66e
        pc = 7; continue;
      case 7: // 8cc67f
        R.ebx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 8cc67f: mov ebx, dword ptr [esp + 0x10]
        pc = 8; continue;
      case 8: // 8cc683
        R.eax = (R.m.u32(((R.edi + 0x4) | 0) >>> 0)) | 0; // 8cc683: mov eax, dword ptr [edi + 4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cc686: test eax, eax
        if (R.zf) { pc = 18; continue; } // 8cc688: je 0x8cc6d9
        pc = 9; continue;
      case 9: // 8cc68a
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 8cc68a: mov eax, dword ptr [esp + 0x14]
        R.ecx = (R.m.u32(((R.eax + 0x53) | 0) >>> 0)) | 0; // 8cc68e: mov ecx, dword ptr [eax + 0x53]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 8cc691: xor al, al
        pc = 10; continue;
      case 10: // 8cc693
        R.edx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8cc693: mov edx, dword ptr [esi]
        R.sub(R.m.u32(((R.edx + 0xa) | 0) >>> 0), (R.ecx >>> 0), 32); // 8cc695: cmp dword ptr [edx + 0xa], ecx
        if (R.zf) { pc = 15; continue; } // 8cc698: je 0x8cc6ba
        pc = 11; continue;
      case 11: // 8cc69a
        R.eax = ((R.eax & 0xffffff00) | (((R.incdec(((R.eax >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 8cc69a: inc al
        R.esi = (R.add((R.esi >>> 0), 0x4, 32)) | 0; // 8cc69c: add esi, 4
        R.sub(((R.eax >>> 0) & 0xff), 0x1c, 8); // 8cc69f: cmp al, 0x1c
        if (R.cL) { pc = 10; continue; } // 8cc6a1: jl 0x8cc693
        pc = 12; continue;
      case 12: // 8cc6a3
        pc = 18; continue; // 8cc6a3: jmp 0x8cc6d9
      case 13: // 8cc6a5
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8cc6a5: mov eax, dword ptr [eax]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cc6a7: test eax, eax
        if (R.zf) { pc = 7; continue; } // 8cc6a9: je 0x8cc67f
        pc = 14; continue;
      default: return pc;
    }
  }
}
function f_8cc5b0_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 14: // 8cc6ab
        R.ecx = ((R.eax >>> 0)) | 0; // 8cc6ab: mov ecx, eax
        R.call(0x8e8ed0, { n: 0, thisEcx: true, calleeClean: false }); // 8cc6ad: call 0x8e8ed0
        R.ebx = ((R.eax >>> 0)) | 0; // 8cc6b2: mov ebx, eax
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ebx >>> 0)); // 8cc6b4: mov dword ptr [esp + 0x10], ebx
        pc = 8; continue; // 8cc6b8: jmp 0x8cc683
      case 15: // 8cc6ba
        R.esi = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8cc6ba: mov esi, dword ptr [esi]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8cc6bc: test esi, esi
        if (R.zf) { pc = 18; continue; } // 8cc6be: je 0x8cc6d9
        pc = 16; continue;
      case 16: // 8cc6c0
        R.ecx = ((R.esi >>> 0)) | 0; // 8cc6c0: mov ecx, esi
        R.call(0x8e8ed0, { n: 0, thisEcx: true, calleeClean: false }); // 8cc6c2: call 0x8e8ed0
        R.sub(((R.ebx >>> 0) & 0xffff), ((R.eax >>> 0) & 0xffff), 16); // 8cc6c7: cmp bx, ax
        if (R.cf) { pc = 18; continue; } // 8cc6ca: jb 0x8cc6d9
        pc = 17; continue;
      case 17: // 8cc6cc
        R.ecx = ((R.esi >>> 0)) | 0; // 8cc6cc: mov ecx, esi
        R.call(0x8e8ed0, { n: 0, thisEcx: true, calleeClean: false }); // 8cc6ce: call 0x8e8ed0
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 8cc6d3: mov dword ptr [esp + 0x10], eax
        R.ebx = ((R.eax >>> 0)) | 0; // 8cc6d7: mov ebx, eax
        pc = 18; continue;
      case 18: // 8cc6d9
        R.sub(((R.ebx >>> 0) & 0xffff), 0x3, 16); // 8cc6d9: cmp bx, 3
        if (!R.cf) { pc = 20; continue; } // 8cc6dd: jae 0x8cc700
        pc = 19; continue;
      case 19: // 8cc6df
        R.eax = (R.m.u32(((R.esp + 0x22c) | 0) >>> 0)) | 0; // 8cc6df: mov eax, dword ptr [esp + 0x22c]
        R.ecx = (R.m.u32(((R.esp + 0x230) | 0) >>> 0)) | 0; // 8cc6e6: mov ecx, dword ptr [esp + 0x230]
        R.edi = (R.pop()) | 0; // 8cc6ed: pop edi
        R.esi = (R.pop()) | 0; // 8cc6ee: pop esi
        R.m.w8(((R.eax) | 0) >>> 0, 0x0); // 8cc6ef: mov byte ptr [eax], 0
        R.ebp = (R.pop()) | 0; // 8cc6f2: pop ebp
        R.m.w8(((R.ecx) | 0) >>> 0, 0x1); // 8cc6f3: mov byte ptr [ecx], 1
        R.ebx = (R.pop()) | 0; // 8cc6f6: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x214, 32)) | 0; // 8cc6f7: add esp, 0x214
        R.rv = R.ret(3); return -1; // 8cc6fd: ret 0xc
      case 20: // 8cc700
        R.sub(((R.ebx >>> 0) & 0xffff), 0x6, 16); // 8cc700: cmp bx, 6
        if (!R.cf) { pc = 23; continue; } // 8cc704: jae 0x8cc732
        pc = 21; continue;
      case 21: // 8cc706
        R.edx = (R.m.u32(((R.esp + 0x22c) | 0) >>> 0)) | 0; // 8cc706: mov edx, dword ptr [esp + 0x22c]
        R.m.w8(((R.edx) | 0) >>> 0, 0x1); // 8cc70d: mov byte ptr [edx], 1
        pc = 22; continue;
      case 22: // 8cc710
        R.push(0x3); // 8cc710: push 3
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8cc712: call 0x90cfc0
        R.ecx = (R.m.u32(((R.esp + 0x234) | 0) >>> 0)) | 0; // 8cc717: mov ecx, dword ptr [esp + 0x234]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8cc71e: add esp, 4
        R.eax = ((R.eax & 0xffffff00) | (((R.incdec(((R.eax >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 8cc721: inc al
        R.edi = (R.pop()) | 0; // 8cc723: pop edi
        R.esi = (R.pop()) | 0; // 8cc724: pop esi
        R.ebp = (R.pop()) | 0; // 8cc725: pop ebp
        R.m.w8(((R.ecx) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 8cc726: mov byte ptr [ecx], al
        R.ebx = (R.pop()) | 0; // 8cc728: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x214, 32)) | 0; // 8cc729: add esp, 0x214
        R.rv = R.ret(3); return -1; // 8cc72f: ret 0xc
      default: return pc;
    }
  }
}
function f_8cc5b0_3(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 23: // 8cc732
        R.sub(((R.ebx >>> 0) & 0xffff), 0xb, 16); // 8cc732: cmp bx, 0xb
        if (!R.cf) { pc = 25; continue; } // 8cc736: jae 0x8cc744
        pc = 24; continue;
      case 24: // 8cc738
        R.edx = (R.m.u32(((R.esp + 0x22c) | 0) >>> 0)) | 0; // 8cc738: mov edx, dword ptr [esp + 0x22c]
        R.m.w8(((R.edx) | 0) >>> 0, 0x2); // 8cc73f: mov byte ptr [edx], 2
        pc = 22; continue; // 8cc742: jmp 0x8cc710
      case 25: // 8cc744
        R.eax = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 8cc744: mov eax, dword ptr [esp + 0x20]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cc748: test eax, eax
        if (R.zf) { pc = 27; continue; } // 8cc74a: je 0x8cc751
        pc = 26; continue;
      case 26: // 8cc74c
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.eax + 0x3d) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8cc74c: mov bl, byte ptr [eax + 0x3d]
        pc = 28; continue; // 8cc74f: jmp 0x8cc753
      case 27: // 8cc751
        R.ebx = ((R.ebx & 0xffffff00) | (((0x9c) & 0xff) << 0)) | 0; // 8cc751: mov bl, 0x9c
        pc = 28; continue;
      case 28: // 8cc753
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.edi + 0x11) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8cc753: mov dl, byte ptr [edi + 0x11]
        R.push((R.edx >>> 0)); // 8cc756: push edx
        R.call(0x53b620, { n: 1, thisEcx: false, calleeClean: false }); // 8cc757: call 0x53b620
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8cc75c: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cc75f: test eax, eax
        if (R.zf) { pc = 31; continue; } // 8cc761: je 0x8cc7cd
        pc = 29; continue;
      case 29: // 8cc763
        R.eax = (R.m.u32(((R.ebp + 0x61) | 0) >>> 0)) | 0; // 8cc763: mov eax, dword ptr [ebp + 0x61]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cc766: test eax, eax
        if (!R.zf) { pc = 31; continue; } // 8cc768: jne 0x8cc7cd
        pc = 30; continue;
      case 30: // 8cc76a
        R.eax = (((R.esp + 0x24) | 0)) | 0; // 8cc76a: lea eax, [esp + 0x24]
        R.ecx = (((R.esp + 0x124) | 0)) | 0; // 8cc76e: lea ecx, [esp + 0x124]
        R.push((R.eax >>> 0)); // 8cc775: push eax
        R.push((R.ecx >>> 0)); // 8cc776: push ecx
        R.push(0x0); // 8cc777: push 0
        R.push(0x0); // 8cc779: push 0
        R.push(0xa8d514); // 8cc77b: push 0xa8d514
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 8cc780: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8cc785: add esp, 0x14
        R.edx = (((R.esp + 0x24) | 0)) | 0; // 8cc788: lea edx, [esp + 0x24]
        R.eax = (((R.esp + 0x124) | 0)) | 0; // 8cc78c: lea eax, [esp + 0x124]
        R.push(0x29c3); // 8cc793: push 0x29c3
        R.push((R.edx >>> 0)); // 8cc798: push edx
        R.push((R.eax >>> 0)); // 8cc799: push eax
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 8cc79a: call 0x90d130
        R.push((R.eax >>> 0)); // 8cc79f: push eax
        R.push(0x9870e8); // 8cc7a0: push 0x9870e8
        R.push(0xae24d0); // 8cc7a5: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 8cc7aa: call 0x944c9f
        R.push(0x0); // 8cc7af: push 0
        R.push(0xae24d0); // 8cc7b1: push 0xae24d0
        R.push(0x9870e0); // 8cc7b6: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 8cc7bb: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 8cc7c0: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 8cc7c3: mov dword ptr [0xb67a34], 0
        pc = 31; continue;
      default: return pc;
    }
  }
}
function f_8cc5b0_4(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 31: // 8cc7cd
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 8cc7cd: mov eax, dword ptr [esp + 0x14]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cc7d1: test eax, eax
        if (R.zf) { pc = 42; continue; } // 8cc7d3: je 0x8cc8ac
        pc = 32; continue;
      case 32: // 8cc7d9
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.edi + 0x11) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8cc7d9: mov cl, byte ptr [edi + 0x11]
        R.push((R.ecx >>> 0)); // 8cc7dc: push ecx
        R.call(0x53b620, { n: 1, thisEcx: false, calleeClean: false }); // 8cc7dd: call 0x53b620
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8cc7e2: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cc7e5: test eax, eax
        if (R.zf) { pc = 42; continue; } // 8cc7e7: je 0x8cc8ac
        pc = 33; continue;
      case 33: // 8cc7ed
        R.edx = (R.m.u32(((R.ebp + 0x61) | 0) >>> 0)) | 0; // 8cc7ed: mov edx, dword ptr [ebp + 0x61]
        R.esi = ((R.esi & 0xffff0000) | (((R.m.u16(((R.edx + 0x7) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8cc7f0: mov si, word ptr [edx + 7]
        R.sub(((R.esi >>> 0) & 0xffff), 0x82, 16); // 8cc7f4: cmp si, 0x82
        if (R.cLE) { pc = 42; continue; } // 8cc7f9: jle 0x8cc8ac
        pc = 34; continue;
      case 34: // 8cc7ff
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 8cc7ff: mov eax, dword ptr [esp + 0x14]
        R.ecx = (((R.m.u16(((R.eax + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 8cc803: movsx ecx, word ptr [eax + 0x80]
        R.eax = (0x88888889) | 0; // 8cc80a: mov eax, 0x88888889
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 8cc80f: imul ecx
        R.edx = (R.add((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 8cc811: add edx, ecx
        R.edx = (R.sar((R.edx >>> 0), 0x5, 32)) | 0; // 8cc813: sar edx, 5
        R.ecx = ((R.edx >>> 0)) | 0; // 8cc816: mov ecx, edx
        R.ecx = (R.shr((R.ecx >>> 0), 0x1f, 32)) | 0; // 8cc818: shr ecx, 0x1f
        R.eax = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8cc81b: movsx eax, si
        R.edx = (R.add((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 8cc81e: add edx, ecx
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 8cc820: cmp eax, edx
        if (R.cLE) { pc = 42; continue; } // 8cc822: jle 0x8cc8ac
        pc = 35; continue;
      case 35: // 8cc828
        R.sub(R.m.u8(((R.ebp + 0x18) | 0) >>> 0), 0x1a, 8); // 8cc828: cmp byte ptr [ebp + 0x18], 0x1a
        if (!R.cL) { pc = 42; continue; } // 8cc82c: jge 0x8cc8ac
        pc = 36; continue;
      case 36: // 8cc82e
        R.eax = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 8cc82e: mov eax, dword ptr [ebp]
        R.edx = (R.m.u32(((0xae2d0c) | 0) >>> 0)) | 0; // 8cc831: mov edx, dword ptr [0xae2d0c]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 8cc837: lea ecx, [eax + eax*4]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 8cc83a: shl ecx, 4
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 8cc83d: sub ecx, eax
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + R.edx + 0xb) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8cc83f: mov al, byte ptr [ecx + edx + 0xb]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf, 8)) & 0xff) << 0)) | 0; // 8cc843: and al, 0xf
        R.sub(((R.eax >>> 0) & 0xff), 0x3, 8); // 8cc845: cmp al, 3
        if (!R.cf) { pc = 42; continue; } // 8cc847: jae 0x8cc8ac
        pc = 37; continue;
      case 37: // 8cc849
        R.logic(((R.ebx >>> 0) & 0xff) & ((R.ebx >>> 0) & 0xff), 8); // 8cc849: test bl, bl
        if (R.cLE) { pc = 42; continue; } // 8cc84b: jle 0x8cc8ac
        pc = 38; continue;
      default: return pc;
    }
  }
}
function f_8cc5b0_5(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 38: // 8cc84d
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 8cc84d: mov ecx, dword ptr [esp + 0x1c]
        R.edx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 8cc851: mov edx, dword ptr [esp + 0x18]
        R.push(0x0); // 8cc855: push 0
        R.push(0x1); // 8cc857: push 1
        R.push(0x0); // 8cc859: push 0
        R.push(0x0); // 8cc85b: push 0
        R.push((R.ecx >>> 0)); // 8cc85d: push ecx
        R.ecx = (R.m.u32(((R.edx + 0x856) | 0) >>> 0)) | 0; // 8cc85e: mov ecx, dword ptr [edx + 0x856]
        R.push((R.ebp >>> 0)); // 8cc864: push ebp
        R.call(0x846920, { n: 6, thisEcx: true, calleeClean: true, float: true }); // 8cc865: call 0x846920
        R.fcom(R.st[0], 3.15); R.fpop(); // 8cc86a: fcomp qword ptr [0x968e58]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8cc870: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 8cc872: test ah, 0x41
        if (!R.zf) { pc = 42; continue; } // 8cc875: jne 0x8cc8ac
        pc = 39; continue;
      case 39: // 8cc877
        R.eax = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 8cc877: mov eax, dword ptr [esp + 0x10]
        R.eax = (R.logic((R.eax >>> 0) & 0xffff, 32)) | 0; // 8cc87b: and eax, 0xffff
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.eax >>> 0)); // 8cc880: mov dword ptr [esp + 0x18], eax
        R.fpush(R.m.s32(((R.esp + 0x18) | 0) >>> 0)); // 8cc884: fild dword ptr [esp + 0x18]
        R.st[0] = R.st[0] * 2.5; // 8cc888: fmul qword ptr [0x968e18]
        R.fpush(30.0); // 8cc88e: fld qword ptr [0x968dd8]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 8cc894: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8cc896: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8cc898: test ah, 1
        if (R.zf) { pc = 41; continue; } // 8cc89b: je 0x8cc8a5
        pc = 40; continue;
      case 40: // 8cc89d
        R.fpop(); // 8cc89d: fstp st(0)
        R.fpush(30.0); // 8cc89f: fld qword ptr [0x968dd8]
        pc = 41; continue;
      case 41: // 8cc8a5
        R.ftol(); // 8cc8a5: call 0x945640
        pc = 45; continue; // 8cc8aa: jmp 0x8cc8ea
      case 42: // 8cc8ac
        R.ecx = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 8cc8ac: movsx ecx, bl
        R.eax = (0x66666667) | 0; // 8cc8af: mov eax, 0x66666667
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 8cc8b4: imul ecx
        R.edx = (R.sar((R.edx >>> 0), 0x2, 32)) | 0; // 8cc8b6: sar edx, 2
        R.eax = ((R.edx >>> 0)) | 0; // 8cc8b9: mov eax, edx
        R.eax = (R.shr((R.eax >>> 0), 0x1f, 32)) | 0; // 8cc8bb: shr eax, 0x1f
        R.ecx = (((R.edx + R.eax + 0xc) | 0)) | 0; // 8cc8be: lea ecx, [edx + eax + 0xc]
        R.push((R.ecx >>> 0)); // 8cc8c2: push ecx
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8cc8c3: call 0x90cfc0
        R.push(0x3); // 8cc8c8: push 3
        R.ebx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 8cc8ca: movsx ebx, al
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8cc8cd: call 0x90cfc0
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 8cc8d2: add esp, 8
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 8cc8d5: inc eax
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 8cc8d6: cmp eax, ebx
        if (R.cLE) { pc = 44; continue; } // 8cc8d8: jle 0x8cc8e8
        pc = 43; continue;
      case 43: // 8cc8da
        R.push(0x3); // 8cc8da: push 3
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8cc8dc: call 0x90cfc0
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8cc8e1: add esp, 4
        R.eax = ((R.eax & 0xffffff00) | (((R.incdec(((R.eax >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 8cc8e4: inc al
        pc = 45; continue; // 8cc8e6: jmp 0x8cc8ea
      default: return pc;
    }
  }
}
function f_8cc5b0_6(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 44: // 8cc8e8
        R.eax = ((R.eax & 0xffffff00) | (((((R.ebx >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 8cc8e8: mov al, bl
        pc = 45; continue;
      case 45: // 8cc8ea
        R.ecx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 8cc8ea: movsx ecx, al
        R.eax = (0x55555556) | 0; // 8cc8ed: mov eax, 0x55555556
        R.edi = (R.pop()) | 0; // 8cc8f2: pop edi
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 8cc8f3: imul ecx
        R.eax = ((R.edx >>> 0)) | 0; // 8cc8f5: mov eax, edx
        R.esi = (R.pop()) | 0; // 8cc8f7: pop esi
        R.eax = (R.shr((R.eax >>> 0), 0x1f, 32)) | 0; // 8cc8f8: shr eax, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8cc8fb: add edx, eax
        R.eax = (R.m.u32(((R.esp + 0x224) | 0) >>> 0)) | 0; // 8cc8fd: mov eax, dword ptr [esp + 0x224]
        R.ebp = (R.pop()) | 0; // 8cc904: pop ebp
        R.ebx = (R.pop()) | 0; // 8cc905: pop ebx
        R.m.w8(((R.eax) | 0) >>> 0, ((R.edx >>> 0) & 0xff)); // 8cc906: mov byte ptr [eax], dl
        R.eax = ((R.ecx >>> 0)) | 0; // 8cc908: mov eax, ecx
        R.edx = R.eax < 0 ? -1 : 0; // 8cc90a: cdq 
        R.ecx = (0x3) | 0; // 8cc90b: mov ecx, 3
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.ecx >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 8cc910: idiv ecx
        R.eax = (R.m.u32(((R.esp + 0x220) | 0) >>> 0)) | 0; // 8cc912: mov eax, dword ptr [esp + 0x220]
        R.m.w8(((R.eax) | 0) >>> 0, ((R.edx >>> 0) & 0xff)); // 8cc919: mov byte ptr [eax], dl
        R.esp = (R.add((R.esp >>> 0), 0x214, 32)) | 0; // 8cc91b: add esp, 0x214
        R.rv = R.ret(3); return -1; // 8cc921: ret 0xc
      default: return pc;
    }
  }
}
export function f_8cc5b0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 46) throw new Error(`f_8cc5b0: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_8cc5b0_0(R, pc); break;
      case 1: np = f_8cc5b0_1(R, pc); break;
      case 2: np = f_8cc5b0_2(R, pc); break;
      case 3: np = f_8cc5b0_3(R, pc); break;
      case 4: np = f_8cc5b0_4(R, pc); break;
      case 5: np = f_8cc5b0_5(R, pc); break;
      case 6: np = f_8cc5b0_6(R, pc); break;
      default: throw new Error(`f_8cc5b0: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_8cc5b0: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_8cc5b0.shared = true;
