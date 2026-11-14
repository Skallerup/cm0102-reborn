// 0x8e7b50 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4cf5a0=1c, 4d0c60=5c, 5986b0=0t, 5a0590=1tc, 68d1b0=0t, 6e86d0=10t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_8e7b50(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x8e7b50;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x8e7b50:
        R.push((R.ebp >>> 0)); // 8e7b50: push ebp
        R.ebp = ((R.esp >>> 0)) | 0; // 8e7b51: mov ebp, esp
        R.esp = (R.logic((R.esp >>> 0) & 0xfffffff8, 32)) | 0; // 8e7b53: and esp, 0xfffffff8
        R.esp = (R.sub((R.esp >>> 0), 0x24, 32)) | 0; // 8e7b56: sub esp, 0x24
        R.push((R.ebx >>> 0)); // 8e7b59: push ebx
        R.push((R.esi >>> 0)); // 8e7b5a: push esi
        R.push((R.edi >>> 0)); // 8e7b5b: push edi
        R.edi = ((R.ecx >>> 0)) | 0; // 8e7b5c: mov edi, ecx
        R.ebx = (R.logic((R.ebx >>> 0) ^ (R.ebx >>> 0), 32)) | 0; // 8e7b5e: xor ebx, ebx
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, 0x3ff00000); // 8e7b60: mov dword ptr [esp + 0x2c], 0x3ff00000
        R.eax = (R.m.u32(((R.edi + 0xc) | 0) >>> 0)) | 0; // 8e7b68: mov eax, dword ptr [edi + 0xc]
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.ebx >>> 0)); // 8e7b6b: mov dword ptr [esp + 0x18], ebx
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.ebx >>> 0)); // 8e7b6f: mov dword ptr [esp + 0x20], ebx
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.ebx >>> 0)); // 8e7b73: mov dword ptr [esp + 0x28], ebx
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 8e7b77: lea ecx, [eax + eax*4]
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, 0x3f800000); // 8e7b7a: mov dword ptr [esp + 0x14], 0x3f800000
        R.eax = (((R.eax + R.ecx * 2) | 0)) | 0; // 8e7b82: lea eax, [eax + ecx*2]
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8e7b85: mov ecx, dword ptr [0xae1050]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 8e7b8b: lea edx, [eax + eax*4]
        R.eax = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 8e7b8e: mov eax, dword ptr [0xae23bc]
        R.esi = (((R.eax + R.edx * 2) | 0)) | 0; // 8e7b93: lea esi, [eax + edx*2]
        R.push((R.esi >>> 0)); // 8e7b96: push esi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 8e7b97: call 0x4cf5a0
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 8e7b9c: cmp eax, ebx
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 8e7b9e: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x8e7bcc; continue; } // 8e7ba3: je 0x8e7bcc
        pc = 0x8e7ba5; continue;
      case 0x8e7ba5:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + 0x35) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e7ba5: mov cl, byte ptr [eax + 0x35]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0x3f, 8)) & 0xff) << 0)) | 0; // 8e7ba8: and cl, 0x3f
        R.sub(((R.ecx >>> 0) & 0xff), 0x5, 8); // 8e7bab: cmp cl, 5
        if (R.zf) { pc = 0x8e7bcc; continue; } // 8e7bae: je 0x8e7bcc
        pc = 0x8e7bb0; continue;
      case 0x8e7bb0:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 8e7bb0: mov eax, dword ptr [eax + 4]
        R.ecx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 8e7bb3: mov ecx, dword ptr [0xae23b4]
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 8e7bb9: lea edx, [eax + eax*8]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 8e7bbc: shl edx, 4
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8e7bbf: add edx, eax
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 8e7bc1: add ecx, eax
        R.edx = (((R.ecx + R.edx * 4) | 0)) | 0; // 8e7bc3: lea edx, [ecx + edx*4]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 8e7bc6: mov dword ptr [esp + 0x1c], edx
        pc = 0x8e7bd0; continue; // 8e7bca: jmp 0x8e7bd0
      case 0x8e7bcc:
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ebx >>> 0)); // 8e7bcc: mov dword ptr [esp + 0x1c], ebx
        pc = 0x8e7bd0; continue;
      case 0x8e7bd0:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x18) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e7bd0: mov al, byte ptr [esi + 0x18]
        R.ebx = (R.m.u32(((R.edi + 0x1b) | 0) >>> 0)) | 0; // 8e7bd3: mov ebx, dword ptr [edi + 0x1b]
        R.m.w8(((R.esp + 0xf) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 8e7bd6: mov byte ptr [esp + 0xf], al
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edi + 0x11) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e7bda: mov al, byte ptr [edi + 0x11]
        R.sub(((R.eax >>> 0) & 0xff), 0xb, 8); // 8e7bdd: cmp al, 0xb
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ebx >>> 0)); // 8e7bdf: mov dword ptr [esp + 0x10], ebx
        if (!R.zf) { pc = 0x8e7c2d; continue; } // 8e7be3: jne 0x8e7c2d
        pc = 0x8e7be5; continue;
      case 0x8e7be5:
        R.eax = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 8e7be5: mov eax, dword ptr [esi + 0x39]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e7be8: test eax, eax
        if (R.zf) { pc = 0x8e7c2d; continue; } // 8e7bea: je 0x8e7c2d
        pc = 0x8e7bec; continue;
      case 0x8e7bec:
        R.ecx = (R.m.u32(((R.esi + 0x61) | 0) >>> 0)) | 0; // 8e7bec: mov ecx, dword ptr [esi + 0x61]
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.ecx + 0xb) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8e7bef: mov dx, word ptr [ecx + 0xb]
        R.push((R.edx >>> 0)); // 8e7bf3: push edx
        R.push(0x2); // 8e7bf4: push 2
        R.push((R.eax >>> 0)); // 8e7bf6: push eax
        R.eax = (R.m.u32(((R.eax + 0xcf) | 0) >>> 0)) | 0; // 8e7bf7: mov eax, dword ptr [eax + 0xcf]
        R.push((R.esi >>> 0)); // 8e7bfd: push esi
        R.push((R.eax >>> 0)); // 8e7bfe: push eax
        R.call(0x6e86d0, { n: 0, thisEcx: true, calleeClean: false }); // 8e7bff: call 0x6e86d0
        R.ecx = ((R.eax >>> 0)) | 0; // 8e7c04: mov ecx, eax
        R.eax = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 8e7c06: mov eax, dword ptr [esi + 0x39]
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.ecx >>> 0)); // 8e7c09: mov dword ptr [esp + 0x34], ecx
        R.edx = (((R.ecx + R.ecx * 2) | 0)) | 0; // 8e7c0d: lea edx, [ecx + ecx*2]
        R.ecx = (((R.ecx + R.edx * 8) | 0)) | 0; // 8e7c10: lea ecx, [ecx + edx*8]
        R.edx = (R.m.u32(((R.eax + 0xcf) | 0) >>> 0)) | 0; // 8e7c13: mov edx, dword ptr [eax + 0xcf]
        R.ecx = (R.shl((R.ecx >>> 0), 0x1, 32)) | 0; // 8e7c19: shl ecx, 1
        R.push((R.ecx >>> 0)); // 8e7c1b: push ecx
        R.push(0x1); // 8e7c1c: push 1
        R.push((R.eax >>> 0)); // 8e7c1e: push eax
        R.push((R.esi >>> 0)); // 8e7c1f: push esi
        R.push((R.edx >>> 0)); // 8e7c20: push edx
        R.call(0x6e86d0, { n: 10, thisEcx: true, calleeClean: false }); // 8e7c21: call 0x6e86d0
        R.esp = (R.add((R.esp >>> 0), 0x28, 32)) | 0; // 8e7c26: add esp, 0x28
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.eax >>> 0)); // 8e7c29: mov dword ptr [esp + 0x18], eax
        pc = 0x8e7c2d; continue;
      case 0x8e7c2d:
        R.eax = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 8e7c2d: mov eax, dword ptr [esp + 0x1c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e7c31: test eax, eax
        if (R.zf) { pc = 0x8e7cd5; continue; } // 8e7c33: je 0x8e7cd5
        pc = 0x8e7c39; continue;
      case 0x8e7c39:
        R.ecx = (R.m.u32(((R.ebp + 0x14) | 0) >>> 0)) | 0; // 8e7c39: mov ecx, dword ptr [ebp + 0x14]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 8e7c3c: test ecx, ecx
        if (R.zf) { pc = 0x8e7cd5; continue; } // 8e7c3e: je 0x8e7cd5
        pc = 0x8e7c44; continue;
      case 0x8e7c44:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.edi + 0x40) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e7c44: mov cl, byte ptr [edi + 0x40]
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 8e7c47: test cl, cl
        if (R.cLE) { pc = 0x8e7cd5; continue; } // 8e7c49: jle 0x8e7cd5
        pc = 0x8e7c4f; continue;
      case 0x8e7c4f:
        R.ecx = (R.m.u32(((0xae2a38) | 0) >>> 0)) | 0; // 8e7c4f: mov ecx, dword ptr [0xae2a38]
        R.push((R.eax >>> 0)); // 8e7c55: push eax
        R.call(0x5a0590, { n: 1, thisEcx: true, calleeClean: true }); // 8e7c56: call 0x5a0590
        R.ecx = ((R.eax >>> 0)) | 0; // 8e7c5b: mov ecx, eax
        R.call(0x5986b0, { n: 0, thisEcx: true, calleeClean: false }); // 8e7c5d: call 0x5986b0
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 8e7c62: movsx eax, al
        R.eax = (R.add((R.eax >>> 0), 0x2, 32)) | 0; // 8e7c65: add eax, 2
        R.sub((R.eax >>> 0), 0x3, 32); // 8e7c68: cmp eax, 3
        if (!R.cBE) { pc = 0x8e7cd5; continue; } // 8e7c6b: ja 0x8e7cd5
        pc = 0x8e7c6d; continue;
      case 0x8e7c6d:
        pc = [0x8e7c74, 0x8e7c8e, 0x8e7ca8, 0x8e7cc7][R.eax >>> 0]; continue; // 8e7c6d: jmp dword ptr [eax*4 + 0x8e7edc]
      case 0x8e7c74:
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, 0x3dcccccd); // 8e7c74: mov dword ptr [esp + 0x14], 0x3dcccccd
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0x0); // 8e7c7c: mov dword ptr [esp + 0x28], 0
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, 0x3fe00000); // 8e7c84: mov dword ptr [esp + 0x2c], 0x3fe00000
        pc = 0x8e7cd5; continue; // 8e7c8c: jmp 0x8e7cd5
      case 0x8e7c8e:
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, 0x3e99999a); // 8e7c8e: mov dword ptr [esp + 0x14], 0x3e99999a
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0x0); // 8e7c96: mov dword ptr [esp + 0x28], 0
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, 0x3fe80000); // 8e7c9e: mov dword ptr [esp + 0x2c], 0x3fe80000
        pc = 0x8e7cd5; continue; // 8e7ca6: jmp 0x8e7cd5
      case 0x8e7ca8:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edi + 0x40) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e7ca8: mov al, byte ptr [edi + 0x40]
        R.sub(((R.eax >>> 0) & 0xff), 0x7, 8); // 8e7cab: cmp al, 7
        if (R.cL) { pc = 0x8e7ccd; continue; } // 8e7cad: jl 0x8e7ccd
        pc = 0x8e7caf; continue;
      case 0x8e7caf:
        R.sub(((R.eax >>> 0) & 0xff), 0xd, 8); // 8e7caf: cmp al, 0xd
        if (!R.cL) { pc = 0x8e7cbd; continue; } // 8e7cb1: jge 0x8e7cbd
        pc = 0x8e7cb3; continue;
      case 0x8e7cb3:
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, 0x3f333333); // 8e7cb3: mov dword ptr [esp + 0x14], 0x3f333333
        pc = 0x8e7cd5; continue; // 8e7cbb: jmp 0x8e7cd5
      case 0x8e7cbd:
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, 0x3ecccccd); // 8e7cbd: mov dword ptr [esp + 0x14], 0x3ecccccd
        pc = 0x8e7cd5; continue; // 8e7cc5: jmp 0x8e7cd5
      case 0x8e7cc7:
        R.sub(R.m.u8(((R.edi + 0x40) | 0) >>> 0), 0xc, 8); // 8e7cc7: cmp byte ptr [edi + 0x40], 0xc
        if (R.cLE) { pc = 0x8e7cd5; continue; } // 8e7ccb: jle 0x8e7cd5
        pc = 0x8e7ccd; continue;
      case 0x8e7ccd:
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, 0x3f666666); // 8e7ccd: mov dword ptr [esp + 0x14], 0x3f666666
        pc = 0x8e7cd5; continue;
      case 0x8e7cd5:
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 8e7cd5: mov eax, dword ptr [ebp + 8]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e7cd8: test eax, eax
        if (!R.zf) { pc = 0x8e7e4d; continue; } // 8e7cda: jne 0x8e7e4d
        pc = 0x8e7ce0; continue;
      case 0x8e7ce0:
        R.eax = (R.m.u32(((R.esi + 0x61) | 0) >>> 0)) | 0; // 8e7ce0: mov eax, dword ptr [esi + 0x61]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e7ce3: test eax, eax
        if (R.zf) { pc = 0x8e7e4d; continue; } // 8e7ce5: je 0x8e7e4d
        pc = 0x8e7ceb; continue;
      case 0x8e7ceb:
        R.eax = (R.m.u32(((R.edi + 0x35) | 0) >>> 0)) | 0; // 8e7ceb: mov eax, dword ptr [edi + 0x35]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e7cee: test eax, eax
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.eax >>> 0)); // 8e7cf0: mov dword ptr [esp + 0x24], eax
        if (R.cLE) { pc = 0x8e7d21; continue; } // 8e7cf4: jle 0x8e7d21
        pc = 0x8e7cf6; continue;
      case 0x8e7cf6:
        R.eax = (((R.m.u8(((R.edi + 0x39) | 0) >>> 0)) << 24 >> 24)) | 0; // 8e7cf6: movsx eax, byte ptr [edi + 0x39]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 8e7cfa: mov dword ptr [esp + 0x1c], eax
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 8e7cfe: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 0.005; // 8e7d02: fmul qword ptr [0x968ef0]
        R.st[0] = 1.0 - R.st[0]; // 8e7d08: fsubr qword ptr [0x967890]
        R.st[0] = R.st[0] * R.m.s32(((R.esp + 0x24) | 0) >>> 0); // 8e7d0e: fimul dword ptr [esp + 0x24]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x28) | 0)); // 8e7d12: fmul qword ptr [esp + 0x28]
        R.ftol(); // 8e7d16: call 0x945640
        R.ebx = (R.add((R.ebx >>> 0), (R.eax >>> 0), 32)) | 0; // 8e7d1b: add ebx, eax
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ebx >>> 0)); // 8e7d1d: mov dword ptr [esp + 0x10], ebx
        pc = 0x8e7d21; continue;
      case 0x8e7d21:
        R.eax = (R.m.u32(((R.edi + 0x3a) | 0) >>> 0)) | 0; // 8e7d21: mov eax, dword ptr [edi + 0x3a]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e7d24: test eax, eax
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 8e7d26: mov dword ptr [esp + 0x1c], eax
        if (R.cLE) { pc = 0x8e7ddc; continue; } // 8e7d2a: jle 0x8e7ddc
        pc = 0x8e7d30; continue;
      case 0x8e7d30:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x22) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e7d30: mov al, byte ptr [esi + 0x22]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 8e7d33: test al, al
        if (!R.zf) { pc = 0x8e7ddc; continue; } // 8e7d35: jne 0x8e7ddc
        pc = 0x8e7d3b; continue;
      case 0x8e7d3b:
        R.sub(R.m.u8(((R.esp + 0xf) | 0) >>> 0), 0x1c, 8); // 8e7d3b: cmp byte ptr [esp + 0xf], 0x1c
        if (!R.cL) { pc = 0x8e7ddc; continue; } // 8e7d40: jge 0x8e7ddc
        pc = 0x8e7d46; continue;
      case 0x8e7d46:
        R.ecx = (R.m.u32(((R.esi + 0x1a) | 0) >>> 0)) | 0; // 8e7d46: mov ecx, dword ptr [esi + 0x1a]
        R.edx = (((R.m.u16(((R.ecx + 0x8e) | 0) >>> 0)) << 16 >> 16)) | 0; // 8e7d49: movsx edx, word ptr [ecx + 0x8e]
        R.ecx = (((R.m.u16(((R.esp + 0x18) | 0) >>> 0)) << 16 >> 16)) | 0; // 8e7d50: movsx ecx, word ptr [esp + 0x18]
        R.eax = ((R.ecx >>> 0)) | 0; // 8e7d55: mov eax, ecx
        R.eax = (R.shl((R.eax >>> 0), 0x6, 32)) | 0; // 8e7d57: shl eax, 6
        R.eax = (R.add((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 8e7d5a: add eax, ecx
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 8e7d5c: cmp eax, edx
        if (R.cLE) { pc = 0x8e7ddc; continue; } // 8e7d5e: jle 0x8e7ddc
        pc = 0x8e7d60; continue;
      case 0x8e7d60:
        R.ecx = (((R.m.u8(((R.esp + 0xf) | 0) >>> 0)) << 24 >> 24)) | 0; // 8e7d60: movsx ecx, byte ptr [esp + 0xf]
        R.ecx = (R.sub((R.ecx >>> 0), 0x18, 32)) | 0; // 8e7d65: sub ecx, 0x18
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 8e7d68: sub eax, edx
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.ecx >>> 0)); // 8e7d6a: mov dword ptr [esp + 0x24], ecx
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 8e7d6e: fild dword ptr [esp + 0x24]
        R.ecx = (((R.m.u8(((R.edi + 0x3e) | 0) >>> 0)) << 24 >> 24)) | 0; // 8e7d72: movsx ecx, byte ptr [edi + 0x3e]
        R.st[0] = Math.abs(R.st[0]); // 8e7d76: fabs 
        R.st[0] = R.st[0] * 0.06666666666666667; // 8e7d78: fmul qword ptr [0x96d438]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.ecx >>> 0)); // 8e7d7e: mov dword ptr [esp + 0x24], ecx
        R.st[0] = 1.0 - R.st[0]; // 8e7d82: fsubr qword ptr [0x967890]
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 8e7d88: fild dword ptr [esp + 0x24]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.eax >>> 0)); // 8e7d8c: mov dword ptr [esp + 0x24], eax
        R.st[0] = R.st[0] * 0.005; // 8e7d90: fmul qword ptr [0x968ef0]
        R.st[0] = 1.0 - R.st[0]; // 8e7d96: fsubr qword ptr [0x967890]
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 8e7d9c: fild dword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 0.0013333333333333333; // 8e7da0: fmul qword ptr [0x96d250]
        R.st[0] = R.st[0] + 0.3; // 8e7da6: fadd qword ptr [0x968e80]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 8e7dac: fmulp st(1)
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 8e7dae: fmulp st(1)
        R.fcom(R.st[0], 0.75); // 8e7db0: fcom qword ptr [0x969040]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8e7db6: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 8e7db8: test ah, 0x41
        if (!R.zf) { pc = 0x8e7dc5; continue; } // 8e7dbb: jne 0x8e7dc5
        pc = 0x8e7dbd; continue;
      case 0x8e7dbd:
        R.fpop(); // 8e7dbd: fstp st(0)
        R.fpush(0.75); // 8e7dbf: fld qword ptr [0x969040]
        pc = 0x8e7dc5; continue;
      case 0x8e7dc5:
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 8e7dc5: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * R.st[1]; // 8e7dc9: fmul st(1)
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x28) | 0)); // 8e7dcb: fmul qword ptr [esp + 0x28]
        R.ftol(); // 8e7dcf: call 0x945640
        R.ebx = (R.add((R.ebx >>> 0), (R.eax >>> 0), 32)) | 0; // 8e7dd4: add ebx, eax
        R.fpop(); // 8e7dd6: fstp st(0)
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ebx >>> 0)); // 8e7dd8: mov dword ptr [esp + 0x10], ebx
        pc = 0x8e7ddc; continue;
      case 0x8e7ddc:
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.edi + 0x3f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e7ddc: mov bl, byte ptr [edi + 0x3f]
        R.logic(((R.ebx >>> 0) & 0xff) & ((R.ebx >>> 0) & 0xff), 8); // 8e7ddf: test bl, bl
        if (R.cLE) { pc = 0x8e7e49; continue; } // 8e7de1: jle 0x8e7e49
        pc = 0x8e7de3; continue;
      case 0x8e7de3:
        R.eax = (R.m.u32(((R.ebp + 0x18) | 0) >>> 0)) | 0; // 8e7de3: mov eax, dword ptr [ebp + 0x18]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e7de6: test eax, eax
        if (R.zf) { pc = 0x8e7e49; continue; } // 8e7de8: je 0x8e7e49
        pc = 0x8e7dea; continue;
      case 0x8e7dea:
        R.ecx = (((R.m.u16(((R.esp + 0x18) | 0) >>> 0)) << 16 >> 16)) | 0; // 8e7dea: movsx ecx, word ptr [esp + 0x18]
        R.edx = (((R.m.u16(((R.esp + 0x20) | 0) >>> 0)) << 16 >> 16)) | 0; // 8e7def: movsx edx, word ptr [esp + 0x20]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.ecx >>> 0)); // 8e7df4: mov dword ptr [esp + 0x24], ecx
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.edx >>> 0)); // 8e7df8: mov dword ptr [esp + 0x20], edx
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 8e7dfc: fild dword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 0.8; // 8e7e00: fmul qword ptr [0x9689b0]
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 8e7e06: fild dword ptr [esp + 0x20]
        R.fcom(R.st[0], R.st[1]); R.fpop(); R.fpop(); // 8e7e0a: fcompp 
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8e7e0c: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8e7e0e: test ah, 1
        if (R.zf) { pc = 0x8e7e49; continue; } // 8e7e11: je 0x8e7e49
        pc = 0x8e7e13; continue;
      case 0x8e7e13:
        R.esi = (R.m.u32(((R.esi + 0x52) | 0) >>> 0)) | 0; // 8e7e13: mov esi, dword ptr [esi + 0x52]
        R.ecx = (R.sub((R.ecx >>> 0), (R.edx >>> 0), 32)) | 0; // 8e7e16: sub ecx, edx
        R.eax = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 8e7e18: movsx eax, bl
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.esi >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.esi = (Number(BigInt.asIntN(32, p))) | 0; } // 8e7e1b: imul esi, eax
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.esi >>> 0)); // 8e7e1e: mov dword ptr [esp + 0x24], esi
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 8e7e22: fild dword ptr [esp + 0x24]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.ecx >>> 0)); // 8e7e26: mov dword ptr [esp + 0x24], ecx
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 8e7e2a: fild dword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 0.030303030303030304; // 8e7e2e: fmul qword ptr [0x970450]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 8e7e34: fmulp st(1)
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x28) | 0)); // 8e7e36: fmul qword ptr [esp + 0x28]
        R.st[0] = R.st[0] * 0.01; // 8e7e3a: fmul qword ptr [0x967898]
        R.ftol(); // 8e7e40: call 0x945640
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, R.add(R.m.u32(((R.esp + 0x10) | 0) >>> 0), (R.eax >>> 0), 32)); // 8e7e45: add dword ptr [esp + 0x10], eax
        pc = 0x8e7e49; continue;
      case 0x8e7e49:
        R.ebx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 8e7e49: mov ebx, dword ptr [esp + 0x10]
        pc = 0x8e7e4d; continue;
      case 0x8e7e4d:
        R.eax = (R.m.u32(((R.edi + 0x4) | 0) >>> 0)) | 0; // 8e7e4d: mov eax, dword ptr [edi + 4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e7e50: test eax, eax
        if (R.zf) { pc = 0x8e7ec4; continue; } // 8e7e52: je 0x8e7ec4
        pc = 0x8e7e54; continue;
      case 0x8e7e54:
        R.ecx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 8e7e54: mov ecx, dword ptr [ebp + 0xc]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 8e7e57: test ecx, ecx
        if (!R.zf) { pc = 0x8e7ec4; continue; } // 8e7e59: jne 0x8e7ec4
        pc = 0x8e7e5b; continue;
      case 0x8e7e5b:
        R.ecx = (R.m.u32(((R.eax + 0x2) | 0) >>> 0)) | 0; // 8e7e5b: mov ecx, dword ptr [eax + 2]
        R.m.w32(((R.eax + 0xa) | 0) >>> 0, (R.ecx >>> 0)); // 8e7e5e: mov dword ptr [eax + 0xa], ecx
        R.ecx = (R.m.u32(((R.edi + 0x4) | 0) >>> 0)) | 0; // 8e7e61: mov ecx, dword ptr [edi + 4]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8e7e64: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e7e69: test eax, eax
        if (R.zf) { pc = 0x8e7ec4; continue; } // 8e7e6b: je 0x8e7ec4
        pc = 0x8e7e6d; continue;
      case 0x8e7e6d:
        R.esi = (R.m.u32(((R.ebp + 0x10) | 0) >>> 0)) | 0; // 8e7e6d: mov esi, dword ptr [ebp + 0x10]
        pc = 0x8e7e70; continue;
      case 0x8e7e70:
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8e7e70: test esi, esi
        if (R.zf) { pc = 0x8e7ea0; continue; } // 8e7e72: je 0x8e7ea0
        pc = 0x8e7e74; continue;
      case 0x8e7e74:
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8e7e74: mov eax, dword ptr [eax]
        R.ecx = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 8e7e76: mov ecx, dword ptr [0xae23bc]
        R.push(0x0); // 8e7e7c: push 0
        R.push(0xffffffff); // 8e7e7e: push -1
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 8e7e80: lea edx, [eax + eax*4]
        R.push(0x0); // 8e7e83: push 0
        R.push(0x0); // 8e7e85: push 0
        R.eax = (((R.eax + R.edx * 2) | 0)) | 0; // 8e7e87: lea eax, [eax + edx*2]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 8e7e8a: lea eax, [eax + eax*4]
        R.edx = (((R.ecx + R.eax * 2) | 0)) | 0; // 8e7e8d: lea edx, [ecx + eax*2]
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8e7e90: mov ecx, dword ptr [0xae1050]
        R.push((R.edx >>> 0)); // 8e7e96: push edx
        R.call(0x4d0c60, { n: 5, thisEcx: false, calleeClean: true }); // 8e7e97: call 0x4d0c60
        R.ebx = (R.add((R.ebx >>> 0), (R.eax >>> 0), 32)) | 0; // 8e7e9c: add ebx, eax
        pc = 0x8e7eb4; continue; // 8e7e9e: jmp 0x8e7eb4
      case 0x8e7ea0:
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8e7ea0: mov eax, dword ptr [eax]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 8e7ea2: lea ecx, [eax + eax*4]
        R.eax = (((R.eax + R.ecx * 2) | 0)) | 0; // 8e7ea5: lea eax, [eax + ecx*2]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 8e7ea8: lea edx, [eax + eax*4]
        R.eax = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 8e7eab: mov eax, dword ptr [0xae23bc]
        R.ebx = (R.add((R.ebx >>> 0), R.m.u32(((R.eax + R.edx * 2 + 0x52) | 0) >>> 0), 32)) | 0; // 8e7eb0: add ebx, dword ptr [eax + edx*2 + 0x52]
        pc = 0x8e7eb4; continue;
      case 0x8e7eb4:
        R.ecx = (R.m.u32(((R.edi + 0x4) | 0) >>> 0)) | 0; // 8e7eb4: mov ecx, dword ptr [edi + 4]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8e7eb7: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e7ebc: test eax, eax
        if (!R.zf) { pc = 0x8e7e70; continue; } // 8e7ebe: jne 0x8e7e70
        pc = 0x8e7ec0; continue;
      case 0x8e7ec0:
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ebx >>> 0)); // 8e7ec0: mov dword ptr [esp + 0x10], ebx
        pc = 0x8e7ec4; continue;
      case 0x8e7ec4:
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 8e7ec4: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * R.f32(((R.esp + 0x14) | 0)); // 8e7ec8: fmul dword ptr [esp + 0x14]
        R.ftol(); // 8e7ecc: call 0x945640
        R.edi = (R.pop()) | 0; // 8e7ed1: pop edi
        R.esi = (R.pop()) | 0; // 8e7ed2: pop esi
        R.ebx = (R.pop()) | 0; // 8e7ed3: pop ebx
        R.esp = ((R.ebp >>> 0)) | 0; // 8e7ed4: mov esp, ebp
        R.ebp = (R.pop()) | 0; // 8e7ed6: pop ebp
        return R.ret(5); // 8e7ed7: ret 0x14
      default: throw new Error(`f_8e7b50: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
