// 0x4d0c60 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4cf5f0=2tc, 5407e0=3, 6e86d0=5t, 867b50=0t, 8d0780=3c, 8d0a70=1c
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_4d0c60(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x4d0c60;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x4d0c60:
        R.push((R.ebp >>> 0)); // 4d0c60: push ebp
        R.ebp = ((R.esp >>> 0)) | 0; // 4d0c61: mov ebp, esp
        R.esp = (R.logic((R.esp >>> 0) & 0xfffffff8, 32)) | 0; // 4d0c63: and esp, 0xfffffff8
        R.esp = (R.sub((R.esp >>> 0), 0x34, 32)) | 0; // 4d0c66: sub esp, 0x34
        R.push((R.ebx >>> 0)); // 4d0c69: push ebx
        R.ebx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 4d0c6a: mov ebx, dword ptr [ebp + 8]
        R.push((R.esi >>> 0)); // 4d0c6d: push esi
        R.push((R.edi >>> 0)); // 4d0c6e: push edi
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 4d0c6f: test ebx, ebx
        if (!R.zf) { pc = 0x4d0c77; continue; } // 4d0c71: jne 0x4d0c77
        pc = 0x4d0c73; continue;
      case 0x4d0c73:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 4d0c73: xor eax, eax
        pc = 0x4d0cad; continue; // 4d0c75: jmp 0x4d0cad
      case 0x4d0c77:
        R.eax = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 4d0c77: mov eax, dword ptr [ebx]
        R.edx = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 4d0c79: mov edx, dword ptr [0xae2364]
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 4d0c7f: cmp eax, edx
        if (R.cL) { pc = 0x4d0c87; continue; } // 4d0c81: jl 0x4d0c87
        pc = 0x4d0c83; continue;
      case 0x4d0c83:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 4d0c83: xor eax, eax
        pc = 0x4d0cad; continue; // 4d0c85: jmp 0x4d0cad
      case 0x4d0c87:
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 4d0c87: lea edx, [eax + eax*4]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 4d0c8a: shl edx, 4
        R.edx = (R.sub((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 4d0c8d: sub edx, eax
        R.eax = (R.m.u32(((0xae2d0c) | 0) >>> 0)) | 0; // 4d0c8f: mov eax, dword ptr [0xae2d0c]
        R.eax = (R.m.u32(((R.edx + R.eax) | 0) >>> 0)) | 0; // 4d0c94: mov eax, dword ptr [edx + eax]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d0c97: test eax, eax
        if (!R.cL) { pc = 0x4d0c9f; continue; } // 4d0c99: jge 0x4d0c9f
        pc = 0x4d0c9b; continue;
      case 0x4d0c9b:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 4d0c9b: xor eax, eax
        pc = 0x4d0cad; continue; // 4d0c9d: jmp 0x4d0cad
      case 0x4d0c9f:
        R.edx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 4d0c9f: mov edx, dword ptr [0xae1050]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4d0ca5: lea eax, [eax + eax*4]
        R.eax = (R.shl((R.eax >>> 0), 0x4, 32)) | 0; // 4d0ca8: shl eax, 4
        R.eax = (R.add((R.eax >>> 0), R.m.u32(((R.edx) | 0) >>> 0), 32)) | 0; // 4d0cab: add eax, dword ptr [edx]
        pc = 0x4d0cad; continue;
      case 0x4d0cad:
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d0cad: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 4d0caf: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x4d0cce; continue; } // 4d0cb4: je 0x4d0cce
        pc = 0x4d0cb6; continue;
      case 0x4d0cb6:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 4d0cb6: mov eax, dword ptr [eax + 4]
        R.esi = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 4d0cb9: mov esi, dword ptr [0xae23b4]
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 4d0cbf: lea edx, [eax + eax*8]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 4d0cc2: shl edx, 4
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 4d0cc5: add edx, eax
        R.esi = (R.add((R.esi >>> 0), (R.eax >>> 0), 32)) | 0; // 4d0cc7: add esi, eax
        R.edi = (((R.esi + R.edx * 4) | 0)) | 0; // 4d0cc9: lea edi, [esi + edx*4]
        pc = 0x4d0cd0; continue; // 4d0ccc: jmp 0x4d0cd0
      case 0x4d0cce:
        R.edi = (R.logic((R.edi >>> 0) ^ (R.edi >>> 0), 32)) | 0; // 4d0cce: xor edi, edi
        pc = 0x4d0cd0; continue;
      case 0x4d0cd0:
        R.push((R.edi >>> 0)); // 4d0cd0: push edi
        R.push((R.ebx >>> 0)); // 4d0cd1: push ebx
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.edi >>> 0)); // 4d0cd2: mov dword ptr [esp + 0x28], edi
        R.call(0x4cf5f0, { n: 2, thisEcx: true, calleeClean: true }); // 4d0cd6: call 0x4cf5f0
        R.esi = (R.m.u32(((R.ebx + 0x61) | 0) >>> 0)) | 0; // 4d0cdb: mov esi, dword ptr [ebx + 0x61]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 4d0cde: mov dword ptr [esp + 0x1c], eax
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 4d0ce2: test esi, esi
        if (R.zf) { pc = 0x4d15cb; continue; } // 4d0ce4: je 0x4d15cb
        pc = 0x4d0cea; continue;
      case 0x4d0cea:
        R.sub(R.m.u8(((R.esi + 0x15) | 0) >>> 0), 0xf, 8); // 4d0cea: cmp byte ptr [esi + 0x15], 0xf
        if (R.cL) { pc = 0x4d0d0a; continue; } // 4d0cee: jl 0x4d0d0a
        pc = 0x4d0cf0; continue;
      case 0x4d0cf0:
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, 0x0); // 4d0cf0: mov dword ptr [esp + 0x38], 0
        R.m.w32(((R.esp + 0x3c) | 0) >>> 0, 0x4168cba8); // 4d0cf8: mov dword ptr [esp + 0x3c], 0x4168cba8
        R.m.w8(((R.esp + 0x12) | 0) >>> 0, 0x1c); // 4d0d00: mov byte ptr [esp + 0x12], 0x1c
        pc = 0x4d0d8d; continue; // 4d0d05: jmp 0x4d0d8d
      case 0x4d0d0a:
        R.sub(R.m.u8(((R.esi + 0x14) | 0) >>> 0), 0xf, 8); // 4d0d0a: cmp byte ptr [esi + 0x14], 0xf
        if (R.cL) { pc = 0x4d0d22; continue; } // 4d0d0e: jl 0x4d0d22
        pc = 0x4d0d10; continue;
      case 0x4d0d10:
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, 0x0); // 4d0d10: mov dword ptr [esp + 0x38], 0
        R.m.w32(((R.esp + 0x3c) | 0) >>> 0, 0x4164fb18); // 4d0d18: mov dword ptr [esp + 0x3c], 0x4164fb18
        pc = 0x4d0d88; continue; // 4d0d20: jmp 0x4d0d88
      case 0x4d0d22:
        R.sub(R.m.u8(((R.esi + 0x13) | 0) >>> 0), 0xf, 8); // 4d0d22: cmp byte ptr [esi + 0x13], 0xf
        if (R.cL) { pc = 0x4d0d3a; continue; } // 4d0d26: jl 0x4d0d3a
        pc = 0x4d0d28; continue;
      case 0x4d0d28:
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, 0x0); // 4d0d28: mov dword ptr [esp + 0x38], 0
        R.m.w32(((R.esp + 0x3c) | 0) >>> 0, 0x416312d0); // 4d0d30: mov dword ptr [esp + 0x3c], 0x416312d0
        pc = 0x4d0d88; continue; // 4d0d38: jmp 0x4d0d88
      case 0x4d0d3a:
        R.sub(R.m.u8(((R.esi + 0x12) | 0) >>> 0), 0xf, 8); // 4d0d3a: cmp byte ptr [esi + 0x12], 0xf
        if (R.cL) { pc = 0x4d0d52; continue; } // 4d0d3e: jl 0x4d0d52
        pc = 0x4d0d40; continue;
      case 0x4d0d40:
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, 0x0); // 4d0d40: mov dword ptr [esp + 0x38], 0
        R.m.w32(((R.esp + 0x3c) | 0) >>> 0, 0x41612a88); // 4d0d48: mov dword ptr [esp + 0x3c], 0x41612a88
        pc = 0x4d0d88; continue; // 4d0d50: jmp 0x4d0d88
      case 0x4d0d52:
        R.sub(R.m.u8(((R.esi + 0xf) | 0) >>> 0), 0x14, 8); // 4d0d52: cmp byte ptr [esi + 0xf], 0x14
        if (!R.zf) { pc = 0x4d0d6f; continue; } // 4d0d56: jne 0x4d0d6f
        pc = 0x4d0d58; continue;
      case 0x4d0d58:
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, 0x0); // 4d0d58: mov dword ptr [esp + 0x38], 0
        R.m.w32(((R.esp + 0x3c) | 0) >>> 0, 0x4156e360); // 4d0d60: mov dword ptr [esp + 0x3c], 0x4156e360
        R.m.w8(((R.esp + 0x12) | 0) >>> 0, 0x21); // 4d0d68: mov byte ptr [esp + 0x12], 0x21
        pc = 0x4d0d8d; continue; // 4d0d6d: jmp 0x4d0d8d
      case 0x4d0d6f:
        R.sub(R.m.u8(((R.esi + 0x10) | 0) >>> 0), 0xf, 8); // 4d0d6f: cmp byte ptr [esi + 0x10], 0xf
        if (!R.cL) { pc = 0x4d0d78; continue; } // 4d0d73: jge 0x4d0d78
        pc = 0x4d0d75; continue;
      case 0x4d0d75:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x11) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d0d75: mov al, byte ptr [esi + 0x11]
        pc = 0x4d0d78; continue;
      case 0x4d0d78:
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, 0x0); // 4d0d78: mov dword ptr [esp + 0x38], 0
        R.m.w32(((R.esp + 0x3c) | 0) >>> 0, 0x415e8480); // 4d0d80: mov dword ptr [esp + 0x3c], 0x415e8480
        pc = 0x4d0d88; continue;
      case 0x4d0d88:
        R.m.w8(((R.esp + 0x12) | 0) >>> 0, 0x1d); // 4d0d88: mov byte ptr [esp + 0x12], 0x1d
        pc = 0x4d0d8d; continue;
      case 0x4d0d8d:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebx + 0x18) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d0d8d: mov al, byte ptr [ebx + 0x18]
        R.ecx = (((R.m.u8(((R.esp + 0x12) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d0d90: movsx ecx, byte ptr [esp + 0x12]
        R.m.w8(((R.esp + 0x13) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 4d0d95: mov byte ptr [esp + 0x13], al
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.ecx >>> 0)); // 4d0d99: mov dword ptr [esp + 0x2c], ecx
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 4d0d9d: movsx eax, al
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 4d0da0: sub ecx, eax
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.eax >>> 0)); // 4d0da2: mov dword ptr [esp + 0x30], eax
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.ecx >>> 0)); // 4d0da6: mov dword ptr [esp + 0x18], ecx
        R.fpush(R.m.s32(((R.esp + 0x18) | 0) >>> 0)); // 4d0daa: fild dword ptr [esp + 0x18]
        R.fcom(R.st[0], 5.0); // 4d0dae: fcom qword ptr [0x9688a0]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d0db4: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d0db6: test ah, 0x41
        if (!R.zf) { pc = 0x4d0dc7; continue; } // 4d0db9: jne 0x4d0dc7
        pc = 0x4d0dbb; continue;
      case 0x4d0dbb:
        R.st[0] = R.st[0] * 0.5; // 4d0dbb: fmul dword ptr [0x968f18]
        R.st[0] = 8.0 - R.st[0]; // 4d0dc1: fsubr qword ptr [0x968f10]
        pc = 0x4d0dc7; continue;
      case 0x4d0dc7:
        R.fpush(R.st[0]); // 4d0dc7: fld st(0)
        R.ftol(); // 4d0dc9: call 0x945640
        R.edx = R.eax < 0 ? -1 : 0; // 4d0dce: cdq 
        R.eax = (R.logic((R.eax >>> 0) ^ (R.edx >>> 0), 32)) | 0; // 4d0dcf: xor eax, edx
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 4d0dd1: sub eax, edx
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.eax >>> 0)); // 4d0dd3: mov dword ptr [esp + 0x14], eax
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0xf) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d0dd7: mov al, byte ptr [esi + 0xf]
        R.st[0] = R.st[0] * R.m.s32(((R.esp + 0x14) | 0) >>> 0); // 4d0dda: fimul dword ptr [esp + 0x14]
        R.sub(((R.eax >>> 0) & 0xff), 0xf, 8); // 4d0dde: cmp al, 0xf
        R.st[0] = R.st[0] * 0.3333333432674408; // 4d0de0: fmul dword ptr [0x968f08]
        R.st[0] = R.st[0] * 0.08333333333333333; // 4d0de6: fmul qword ptr [0x968f00]
        R.st[0] = R.st[0] + 1.0; // 4d0dec: fadd qword ptr [0x967890]
        if (!R.cL) { pc = 0x4d0e95; continue; } // 4d0df2: jge 0x4d0e95
        pc = 0x4d0df8; continue;
      case 0x4d0df8:
        R.eax = (((R.m.u8(((R.esi + 0x28) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d0df8: movsx eax, byte ptr [esi + 0x28]
        R.ecx = (((R.m.u8(((R.esi + 0x27) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d0dfc: movsx ecx, byte ptr [esi + 0x27]
        R.eax = (R.sub((R.eax >>> 0), 0xf, 32)) | 0; // 4d0e00: sub eax, 0xf
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.eax >>> 0)); // 4d0e03: mov dword ptr [esp + 0x14], eax
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d0e07: fild dword ptr [esp + 0x14]
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.ecx >>> 0)); // 4d0e0b: mov dword ptr [esp + 0x14], ecx
        R.edx = (((R.m.u8(((R.esi + 0x43) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d0e0f: movsx edx, byte ptr [esi + 0x43]
        R.st[0] = R.st[0] * 0.013333333333333334; // 4d0e13: fmul qword ptr [0x968ef8]
        R.eax = (((R.m.u8(((R.esi + 0x36) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d0e19: movsx eax, byte ptr [esi + 0x36]
        R.st[0] = R.st[0] + 1.0; // 4d0e1d: fadd qword ptr [0x967890]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d0e23: fild dword ptr [esp + 0x14]
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edx >>> 0)); // 4d0e27: mov dword ptr [esp + 0x14], edx
        R.eax = (R.sub((R.eax >>> 0), 0xf, 32)) | 0; // 4d0e2b: sub eax, 0xf
        R.ecx = (((R.m.u8(((R.esi + 0x2f) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d0e2e: movsx ecx, byte ptr [esi + 0x2f]
        R.st[0] = R.st[0] * 0.005; // 4d0e32: fmul qword ptr [0x968ef0]
        R.ecx = (R.sub((R.ecx >>> 0), 0xf, 32)) | 0; // 4d0e38: sub ecx, 0xf
        R.st[0] = R.st[0] + 1.0; // 4d0e3b: fadd qword ptr [0x967890]
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 4d0e41: fxch st(1)
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 4d0e43: fxch st(1)
        R.st[0] = R.st[0] * R.st[2]; // 4d0e45: fmul st(2)
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 4d0e47: fmulp st(1)
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d0e49: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.0033333333333333335; // 4d0e4d: fmul qword ptr [0x968e60]
        R.st[0] = R.st[0] + 1.0; // 4d0e53: fadd qword ptr [0x967890]
        R.m.wf32(((R.esp + 0x14) | 0) >>> 0, R.st[0]); // 4d0e59: fst dword ptr [esp + 0x14]
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.eax >>> 0)); // 4d0e5d: mov dword ptr [esp + 0x14], eax
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 4d0e61: fmulp st(1)
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d0e63: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.013333333333333334; // 4d0e67: fmul qword ptr [0x968ef8]
        R.st[0] = R.st[0] + 1.0; // 4d0e6d: fadd qword ptr [0x967890]
        R.m.wf32(((R.esp + 0x14) | 0) >>> 0, R.st[0]); // 4d0e73: fst dword ptr [esp + 0x14]
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.ecx >>> 0)); // 4d0e77: mov dword ptr [esp + 0x14], ecx
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 4d0e7b: fmulp st(1)
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d0e7d: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.013333333333333334; // 4d0e81: fmul qword ptr [0x968ef8]
        R.st[0] = R.st[0] + 1.0; // 4d0e87: fadd qword ptr [0x967890]
        R.m.wf32(((R.esp + 0x14) | 0) >>> 0, R.st[0]); // 4d0e8d: fst dword ptr [esp + 0x14]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 4d0e91: fmulp st(1)
        R.st[1] = R.st[0]; R.fpop(); // 4d0e93: fstp st(1)
        pc = 0x4d0e95; continue;
      case 0x4d0e95:
        R.eax = (((R.m.u8(((R.esi + 0x2d) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d0e95: movsx eax, byte ptr [esi + 0x2d]
        R.edx = ((R.eax >>> 0)) | 0; // 4d0e99: mov edx, eax
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.edx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.edx = (Number(BigInt.asIntN(32, p))) | 0; } // 4d0e9b: imul edx, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edx >>> 0)); // 4d0e9e: mov dword ptr [esp + 0x14], edx
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d0ea2: fild dword ptr [esp + 0x14]
        R.eax = (((R.m.u16(((R.esi + 0x9) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d0ea6: movsx eax, word ptr [esi + 9]
        R.st[0] = R.st[0] * 0.05; // 4d0eaa: fmul qword ptr [0x967888]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.eax >>> 0)); // 4d0eb0: mov dword ptr [esp + 0x24], eax
        R.st[0] = R.st[0] * 0.034; // 4d0eb4: fmul qword ptr [0x968ee8]
        R.st[0] = 1.33 - R.st[0]; // 4d0eba: fsubr qword ptr [0x968ee0]
        R.st[0] = R.st[0] * R.st[1]; // 4d0ec0: fmul st(1)
        R.m.wf32(((R.esp + 0x14) | 0) >>> 0, R.st[0]); R.fpop(); // 4d0ec2: fstp dword ptr [esp + 0x14]
        R.fpop(); // 4d0ec6: fstp st(0)
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 4d0ec8: fild dword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 0.0003333333333333333; // 4d0ecc: fmul qword ptr [0x968ed8]
        R.st[0] = R.st[0] + 0.17; // 4d0ed2: fadd qword ptr [0x968ed0]
        R.fcom(R.st[0], 1.1); // 4d0ed8: fcom qword ptr [0x9689c0]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d0ede: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d0ee0: test ah, 1
        if (R.zf) { pc = 0x4d0eed; continue; } // 4d0ee3: je 0x4d0eed
        pc = 0x4d0ee5; continue;
      case 0x4d0ee5:
        R.fpop(); // 4d0ee5: fstp st(0)
        R.fpush(1.1); // 4d0ee7: fld qword ptr [0x9689c0]
        pc = 0x4d0eed; continue;
      case 0x4d0eed:
        R.fpush(R.f32(((R.esp + 0x14) | 0))); // 4d0eed: fld dword ptr [esp + 0x14]
        R.fcom(R.st[0], 0.01); R.fpop(); // 4d0ef1: fcomp qword ptr [0x967898]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d0ef7: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d0ef9: test ah, 1
        if (R.zf) { pc = 0x4d0f08; continue; } // 4d0efc: je 0x4d0f08
        pc = 0x4d0efe; continue;
      case 0x4d0efe:
        R.fpop(); // 4d0efe: fstp st(0)
        R.fpush(0.01); // 4d0f00: fld qword ptr [0x967898]
        pc = 0x4d0f1d; continue; // 4d0f06: jmp 0x4d0f1d
      case 0x4d0f08:
        R.fpush(R.f32(((R.esp + 0x14) | 0))); // 4d0f08: fld dword ptr [esp + 0x14]
        R.fpush(R.st[1]); // 4d0f0c: fld st(1)
        R.fcom(R.st[0], R.st[1]); R.fpop(); R.fpop(); // 4d0f0e: fcompp 
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d0f10: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d0f12: test ah, 1
        if (!R.zf) { pc = 0x4d0f1d; continue; } // 4d0f15: jne 0x4d0f1d
        pc = 0x4d0f17; continue;
      case 0x4d0f17:
        R.fpop(); // 4d0f17: fstp st(0)
        R.fpush(R.f32(((R.esp + 0x14) | 0))); // 4d0f19: fld dword ptr [esp + 0x14]
        pc = 0x4d0f1d; continue;
      case 0x4d0f1d:
        R.ebx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 4d0f1d: mov ebx, dword ptr [ebp + 0xc]
        R.m.wf32(((R.esp + 0x14) | 0) >>> 0, R.st[0]); R.fpop(); // 4d0f20: fstp dword ptr [esp + 0x14]
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 4d0f24: test ebx, ebx
        if (!R.zf) { pc = 0x4d0f31; continue; } // 4d0f26: jne 0x4d0f31
        pc = 0x4d0f28; continue;
      case 0x4d0f28:
        R.eax = (((R.m.u16(((R.esi + 0xb) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d0f28: movsx eax, word ptr [esi + 0xb]
        pc = 0x4d0fcf; continue; // 4d0f2c: jmp 0x4d0fcf
      case 0x4d0f31:
        R.ecx = (R.m.u32(((R.ebx + 0xcf) | 0) >>> 0)) | 0; // 4d0f31: mov ecx, dword ptr [ebx + 0xcf]
        R.edx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 4d0f37: mov edx, dword ptr [ebp + 8]
        R.push(0x0); // 4d0f3a: push 0
        R.push((R.ecx >>> 0)); // 4d0f3c: push ecx
        R.push((R.edx >>> 0)); // 4d0f3d: push edx
        R.call(0x5407e0, { n: 3, thisEcx: false, calleeClean: false }); // 4d0f3e: call 0x5407e0
        R.edi = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d0f43: movsx edi, ax
        R.eax = (R.m.u32(((R.ebp + 0x14) | 0) >>> 0)) | 0; // 4d0f46: mov eax, dword ptr [ebp + 0x14]
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 4d0f49: add esp, 0xc
        R.sub(((R.eax >>> 0) & 0xffff), 0xffff, 16); // 4d0f4c: cmp ax, 0xffff
        if (!R.zf) { pc = 0x4d0f69; continue; } // 4d0f50: jne 0x4d0f69
        pc = 0x4d0f52; continue;
      case 0x4d0f52:
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 4d0f52: mov eax, dword ptr [ebp + 8]
        R.ecx = (R.m.u32(((R.ebx + 0xcf) | 0) >>> 0)) | 0; // 4d0f55: mov ecx, dword ptr [ebx + 0xcf]
        R.push((R.edi >>> 0)); // 4d0f5b: push edi
        R.push(0x1); // 4d0f5c: push 1
        R.push((R.ebx >>> 0)); // 4d0f5e: push ebx
        R.push((R.eax >>> 0)); // 4d0f5f: push eax
        R.push((R.ecx >>> 0)); // 4d0f60: push ecx
        R.call(0x6e86d0, { n: 5, thisEcx: true, calleeClean: false }); // 4d0f61: call 0x6e86d0
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 4d0f66: add esp, 0x14
        pc = 0x4d0f69; continue;
      case 0x4d0f69:
        R.edx = (((R.eax + R.eax * 2) | 0)) | 0; // 4d0f69: lea edx, [eax + eax*2]
        R.eax = (((R.eax + R.edx * 8) | 0)) | 0; // 4d0f6c: lea eax, [eax + edx*8]
        R.eax = (R.shl((R.eax >>> 0), 0x1, 32)) | 0; // 4d0f6f: shl eax, 1
        R.logic(((R.eax >>> 0) & 0xffff) & ((R.eax >>> 0) & 0xffff), 16); // 4d0f71: test ax, ax
        if (!R.cL) { pc = 0x4d0f78; continue; } // 4d0f74: jge 0x4d0f78
        pc = 0x4d0f76; continue;
      case 0x4d0f76:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 4d0f76: xor eax, eax
        pc = 0x4d0f78; continue;
      case 0x4d0f78:
        R.sub((R.edi >>> 0), 0x1388, 32); // 4d0f78: cmp edi, 0x1388
        R.ecx = ((R.edi >>> 0)) | 0; // 4d0f7e: mov ecx, edi
        if (R.cf) { pc = 0x4d0f87; continue; } // 4d0f80: jb 0x4d0f87
        pc = 0x4d0f82; continue;
      case 0x4d0f82:
        R.ecx = (0x1388) | 0; // 4d0f82: mov ecx, 0x1388
        pc = 0x4d0f87; continue;
      case 0x4d0f87:
        R.eax = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d0f87: movsx eax, ax
        R.eax = (R.add((R.eax >>> 0), (R.edi >>> 0), 32)) | 0; // 4d0f8a: add eax, edi
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.eax >>> 0)); // 4d0f8c: mov dword ptr [esp + 0x24], eax
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 4d0f90: xor eax, eax
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 4d0f92: mov dword ptr [esp + 0x28], eax
        R.fpush(R.i64(((R.esp + 0x24) | 0))); // 4d0f96: fild qword ptr [esp + 0x24]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.ecx >>> 0)); // 4d0f9a: mov dword ptr [esp + 0x24], ecx
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 4d0f9e: mov dword ptr [esp + 0x28], eax
        R.fpush(R.i64(((R.esp + 0x24) | 0))); // 4d0fa2: fild qword ptr [esp + 0x24]
        R.st[0] = R.st[0] * R.f32(((R.esp + 0x14) | 0)); // 4d0fa6: fmul dword ptr [esp + 0x14]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 4d0faa: faddp st(1)
        R.st[0] = R.st[0] * 0.3333333432674408; // 4d0fac: fmul dword ptr [0x968f08]
        R.ftol(); // 4d0fb2: call 0x945640
        R.sub((R.eax >>> 0), 0x1, 32); // 4d0fb7: cmp eax, 1
        if (!R.cBE) { pc = 0x4d0fc3; continue; } // 4d0fba: ja 0x4d0fc3
        pc = 0x4d0fbc; continue;
      case 0x4d0fbc:
        R.eax = (0x1) | 0; // 4d0fbc: mov eax, 1
        pc = 0x4d0fcf; continue; // 4d0fc1: jmp 0x4d0fcf
      case 0x4d0fc3:
        R.sub((R.eax >>> 0), 0x2ee0, 32); // 4d0fc3: cmp eax, 0x2ee0
        if (R.cBE) { pc = 0x4d0fcf; continue; } // 4d0fc8: jbe 0x4d0fcf
        pc = 0x4d0fca; continue;
      case 0x4d0fca:
        R.eax = (0x2ee0) | 0; // 4d0fca: mov eax, 0x2ee0
        pc = 0x4d0fcf; continue;
      case 0x4d0fcf:
        R.esi = ((R.esi & 0xffff0000) | (((R.m.u16(((R.esi + 0xd) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 4d0fcf: mov si, word ptr [esi + 0xd]
        R.sub(((R.esi >>> 0) & 0xffff), 0x1388, 16); // 4d0fd3: cmp si, 0x1388
        if (R.cLE) { pc = 0x4d1062; continue; } // 4d0fd8: jle 0x4d1062
        pc = 0x4d0fde; continue;
      case 0x4d0fde:
        R.ecx = (R.m.u32(((R.esp + 0x2c) | 0) >>> 0)) | 0; // 4d0fde: mov ecx, dword ptr [esp + 0x2c]
        R.edx = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 4d0fe2: mov edx, dword ptr [esp + 0x30]
        R.ecx = (R.add((R.ecx >>> 0), 0x4, 32)) | 0; // 4d0fe6: add ecx, 4
        R.sub((R.edx >>> 0), (R.ecx >>> 0), 32); // 4d0fe9: cmp edx, ecx
        if (!R.cL) { pc = 0x4d1062; continue; } // 4d0feb: jge 0x4d1062
        pc = 0x4d0fed; continue;
      case 0x4d0fed:
        R.ecx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d0fed: movsx ecx, si
        R.edx = ((R.eax >>> 0)) | 0; // 4d0ff0: mov edx, eax
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.ecx >>> 0)); // 4d0ff2: mov dword ptr [esp + 0x30], ecx
        R.edx = (R.shr((R.edx >>> 0), 0x1, 32)) | 0; // 4d0ff6: shr edx, 1
        R.ecx = (((R.edx + R.ecx + -0x9c4) | 0)) | 0; // 4d0ff8: lea ecx, [edx + ecx - 0x9c4]
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 4d0fff: cmp ecx, eax
        if (R.cBE) { pc = 0x4d1005; continue; } // 4d1001: jbe 0x4d1005
        pc = 0x4d1003; continue;
      case 0x4d1003:
        R.eax = ((R.ecx >>> 0)) | 0; // 4d1003: mov eax, ecx
        pc = 0x4d1005; continue;
      case 0x4d1005:
        R.sub(((R.esi >>> 0) & 0xffff), 0x1f40, 16); // 4d1005: cmp si, 0x1f40
        if (R.cLE) { pc = 0x4d1062; continue; } // 4d100a: jle 0x4d1062
        pc = 0x4d100c; continue;
      case 0x4d100c:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esp + 0x13) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d100c: mov cl, byte ptr [esp + 0x13]
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.esp + 0x12) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d1010: mov dl, byte ptr [esp + 0x12]
        R.sub(((R.ecx >>> 0) & 0xff), ((R.edx >>> 0) & 0xff), 8); // 4d1014: cmp cl, dl
        if (!R.cLE) { pc = 0x4d1062; continue; } // 4d1016: jg 0x4d1062
        pc = 0x4d1018; continue;
      case 0x4d1018:
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 4d1018: fild dword ptr [esp + 0x30]
        R.edx = ((R.eax >>> 0)) | 0; // 4d101c: mov edx, eax
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 4d101e: xor ecx, ecx
        R.edx = (R.shr((R.edx >>> 0), 0x1, 32)) | 0; // 4d1020: shr edx, 1
        R.st[0] = R.st[0] * 2.25; // 4d1022: fmul qword ptr [0x968ec8]
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.edx >>> 0)); // 4d1028: mov dword ptr [esp + 0x30], edx
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.ecx >>> 0)); // 4d102c: mov dword ptr [esp + 0x34], ecx
        R.fpush(R.i64(((R.esp + 0x30) | 0))); // 4d1030: fild qword ptr [esp + 0x30]
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.eax >>> 0)); // 4d1034: mov dword ptr [esp + 0x30], eax
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.ecx >>> 0)); // 4d1038: mov dword ptr [esp + 0x34], ecx
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 4d103c: faddp st(1)
        R.st[0] = R.st[0] - 12500.0; // 4d103e: fsub qword ptr [0x968ec0]
        R.fpush(R.i64(((R.esp + 0x30) | 0))); // 4d1044: fild qword ptr [esp + 0x30]
        R.m.wf64(((R.esp + 0x30) | 0) >>> 0, R.st[0]); R.fpop(); // 4d1048: fstp qword ptr [esp + 0x30]
        R.fcom(R.st[0], R.f64(((R.esp + 0x30) | 0))); // 4d104c: fcom qword ptr [esp + 0x30]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1050: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d1052: test ah, 0x41
        if (R.zf) { pc = 0x4d105d; continue; } // 4d1055: je 0x4d105d
        pc = 0x4d1057; continue;
      case 0x4d1057:
        R.fpop(); // 4d1057: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x30) | 0))); // 4d1059: fld qword ptr [esp + 0x30]
        pc = 0x4d105d; continue;
      case 0x4d105d:
        R.ftol(); // 4d105d: call 0x945640
        pc = 0x4d1062; continue;
      case 0x4d1062:
        R.ecx = ((R.eax >>> 0)) | 0; // 4d1062: mov ecx, eax
        R.edi = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 4d1064: mov edi, dword ptr [ebp + 8]
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 4d1067: imul ecx, eax
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edi + 0x22) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d106a: mov al, byte ptr [edi + 0x22]
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.ecx >>> 0)); // 4d106d: mov dword ptr [esp + 0x30], ecx
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, 0x0); // 4d1071: mov dword ptr [esp + 0x34], 0
        R.fpush(R.i64(((R.esp + 0x30) | 0))); // 4d1079: fild qword ptr [esp + 0x30]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 4d107d: test al, al
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x38) | 0)); // 4d107f: fmul qword ptr [esp + 0x38]
        R.st[0] = R.st[0] * 1e-08; // 4d1083: fmul qword ptr [0x968eb8]
        if (R.zf) { pc = 0x4d10d3; continue; } // 4d1089: je 0x4d10d3
        pc = 0x4d108b; continue;
      case 0x4d108b:
        R.ecx = (R.m.u32(((R.edi + 0x1a) | 0) >>> 0)) | 0; // 4d108b: mov ecx, dword ptr [edi + 0x1a]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 4d108e: test ecx, ecx
        if (R.zf) { pc = 0x4d10d3; continue; } // 4d1090: je 0x4d10d3
        pc = 0x4d1092; continue;
      case 0x4d1092:
        R.ecx = (((R.m.u16(((R.ecx + 0x8e) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d1092: movsx ecx, word ptr [ecx + 0x8e]
        R.eax = (R.logic((R.eax >>> 0) & 0xff, 32)) | 0; // 4d1099: and eax, 0xff
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 4d109e: imul ecx, eax
        R.eax = (0x38e38e39) | 0; // 4d10a1: mov eax, 0x38e38e39
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 4d10a6: imul ecx
        R.edx = (R.sar((R.edx >>> 0), 0x2, 32)) | 0; // 4d10a8: sar edx, 2
        R.eax = ((R.edx >>> 0)) | 0; // 4d10ab: mov eax, edx
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d10ad: mov ecx, dword ptr [esp + 0x18]
        R.eax = (R.shr((R.eax >>> 0), 0x1f, 32)) | 0; // 4d10b1: shr eax, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 4d10b4: add edx, eax
        R.eax = (((((R.edx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d10b6: movsx eax, dx
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 4d10b9: cmp eax, ecx
        R.edx = ((R.eax >>> 0)) | 0; // 4d10bb: mov edx, eax
        if (R.cL) { pc = 0x4d10c1; continue; } // 4d10bd: jl 0x4d10c1
        pc = 0x4d10bf; continue;
      case 0x4d10bf:
        R.edx = ((R.ecx >>> 0)) | 0; // 4d10bf: mov edx, ecx
        pc = 0x4d10c1; continue;
      case 0x4d10c1:
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 4d10c1: test edx, edx
        if (!R.cL) { pc = 0x4d10c9; continue; } // 4d10c3: jge 0x4d10c9
        pc = 0x4d10c5; continue;
      case 0x4d10c5:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 4d10c5: xor eax, eax
        pc = 0x4d10cf; continue; // 4d10c7: jmp 0x4d10cf
      case 0x4d10c9:
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 4d10c9: cmp eax, ecx
        if (R.cL) { pc = 0x4d10cf; continue; } // 4d10cb: jl 0x4d10cf
        pc = 0x4d10cd; continue;
      case 0x4d10cd:
        R.eax = ((R.ecx >>> 0)) | 0; // 4d10cd: mov eax, ecx
        pc = 0x4d10cf; continue;
      case 0x4d10cf:
        R.m.w8(((R.esp + 0x13) | 0) >>> 0, R.add(R.m.u8(((R.esp + 0x13) | 0) >>> 0), ((R.eax >>> 0) & 0xff), 8)); // 4d10cf: add byte ptr [esp + 0x13], al
        pc = 0x4d10d3; continue;
      case 0x4d10d3:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x12) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d10d3: mov al, byte ptr [esp + 0x12]
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.esp + 0x13) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d10d7: mov dl, byte ptr [esp + 0x13]
        R.eax = ((R.eax & 0xffffff00) | (((R.sub(((R.eax >>> 0) & 0xff), ((R.edx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 4d10db: sub al, dl
        R.eax = ((R.eax & 0xffffff00) | (((R.add(((R.eax >>> 0) & 0xff), 0xa, 8)) & 0xff) << 0)) | 0; // 4d10dd: add al, 0xa
        if (!R.sf) { pc = 0x4d10e5; continue; } // 4d10df: jns 0x4d10e5
        pc = 0x4d10e1; continue;
      case 0x4d10e1:
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 4d10e1: xor al, al
        pc = 0x4d10eb; continue; // 4d10e3: jmp 0x4d10eb
      case 0x4d10e5:
        R.sub(((R.eax >>> 0) & 0xff), 0x14, 8); // 4d10e5: cmp al, 0x14
        if (R.cL) { pc = 0x4d10eb; continue; } // 4d10e7: jl 0x4d10eb
        pc = 0x4d10e9; continue;
      case 0x4d10e9:
        R.eax = ((R.eax & 0xffffff00) | (((0x13) & 0xff) << 0)) | 0; // 4d10e9: mov al, 0x13
        pc = 0x4d10eb; continue;
      case 0x4d10eb:
        R.ecx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 4d10eb: movsx ecx, al
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 4d10ee: test ebx, ebx
        R.edx = (((R.m.u8(((R.ecx + 0x9a7f30) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d10f0: movsx edx, byte ptr [ecx + 0x9a7f30]
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.edx >>> 0)); // 4d10f7: mov dword ptr [esp + 0x30], edx
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 4d10fb: fild dword ptr [esp + 0x30]
        R.st[0] = R.st[0] * R.st[1]; // 4d10ff: fmul st(1)
        R.st[0] = R.st[0] * 0.01; // 4d1101: fmul qword ptr [0x967898]
        R.m.wf64(((R.esp + 0x38) | 0) >>> 0, R.st[0]); R.fpop(); // 4d1107: fstp qword ptr [esp + 0x38]
        R.fpop(); // 4d110b: fstp st(0)
        if (R.zf) { pc = 0x4d1225; continue; } // 4d110d: je 0x4d1225
        pc = 0x4d1113; continue;
      case 0x4d1113:
        R.ecx = (R.m.u32(((R.ebx + 0x57) | 0) >>> 0)) | 0; // 4d1113: mov ecx, dword ptr [ebx + 0x57]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 4d1116: test ecx, ecx
        if (R.zf) { pc = 0x4d11ad; continue; } // 4d1118: je 0x4d11ad
        pc = 0x4d111e; continue;
      case 0x4d111e:
        R.eax = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 4d111e: mov eax, dword ptr [ebx + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d1121: test eax, eax
        if (R.zf) { pc = 0x4d11a2; continue; } // 4d1123: je 0x4d11a2
        pc = 0x4d1125; continue;
      case 0x4d1125:
        R.eax = (((R.m.u8(((R.eax + 0x7e) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d1125: movsx eax, byte ptr [eax + 0x7e]
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.eax >>> 0)); // 4d1129: mov dword ptr [esp + 0x30], eax
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 4d112d: fild dword ptr [esp + 0x30]
        R.fcom(R.st[0], 1.0); // 4d1131: fcom qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1137: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d1139: test ah, 1
        if (!R.zf) { pc = 0x4d114b; continue; } // 4d113c: jne 0x4d114b
        pc = 0x4d113e; continue;
      case 0x4d113e:
        R.fcom(R.st[0], 3.0); // 4d113e: fcom qword ptr [0x968930]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1144: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d1146: test ah, 0x41
        if (!R.zf) { pc = 0x4d1153; continue; } // 4d1149: jne 0x4d1153
        pc = 0x4d114b; continue;
      case 0x4d114b:
        R.fpop(); // 4d114b: fstp st(0)
        R.fpush(3.0); // 4d114d: fld qword ptr [0x968930]
        pc = 0x4d1153; continue;
      case 0x4d1153:
        R.st[0] = R.st[0] + 1.0; // 4d1153: fadd qword ptr [0x967890]
        R.eax = (((R.m.u8(((R.ebx + 0x64) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d1159: movsx eax, byte ptr [ebx + 0x64]
        R.st[0] = R.st[0] * 0.5; // 4d115d: fmul qword ptr [0x968968]
        R.eax = (R.sub((R.eax >>> 0), 0x2, 32)) | 0; // 4d1163: sub eax, 2
        if (R.zf) { pc = 0x4d1173; continue; } // 4d1166: je 0x4d1173
        pc = 0x4d1168; continue;
      case 0x4d1168:
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 4d1168: dec eax
        if (!R.zf) { pc = 0x4d1175; continue; } // 4d1169: jne 0x4d1175
        pc = 0x4d116b; continue;
      case 0x4d116b:
        R.st[0] = R.st[0] * 7.5; // 4d116b: fmul qword ptr [0x968eb0]
        pc = 0x4d1175; continue; // 4d1171: jmp 0x4d1175
      case 0x4d1173:
        R.st[0] = R.st[0] + R.st[0]; // 4d1173: fadd st(0), st(0)
        pc = 0x4d1175; continue;
      case 0x4d1175:
        R.eax = (((R.m.u16(((R.ecx + 0x69) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d1175: movsx eax, word ptr [ecx + 0x69]
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.eax >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.eax = (Number(BigInt.asIntN(32, p))) | 0; } // 4d1179: imul eax, eax
        R.ecx = (((R.eax + R.eax * 2) | 0)) | 0; // 4d117c: lea ecx, [eax + eax*2]
        R.edx = (((R.eax + R.ecx * 8) | 0)) | 0; // 4d117f: lea edx, [eax + ecx*8]
        R.eax = (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d1182: movsx eax, word ptr [ebx + 0x80]
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 4d1189: add edx, eax
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.edx >>> 0)); // 4d118b: mov dword ptr [esp + 0x30], edx
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 4d118f: fild dword ptr [esp + 0x30]
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 4d1193: fxch st(1)
        R.st[0] = R.st[0] * 1000.0; // 4d1195: fmul qword ptr [0x968908]
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 4d119b: fdivp st(1)
        pc = 0x4d1238; continue; // 4d119d: jmp 0x4d1238
      case 0x4d11a2:
        R.fpush(1.0); // 4d11a2: fld qword ptr [0x967890]
        pc = 0x4d1238; continue; // 4d11a8: jmp 0x4d1238
      case 0x4d11ad:
        R.ecx = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 4d11ad: mov ecx, dword ptr [ebx + 0x53]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 4d11b0: test ecx, ecx
        if (R.zf) { pc = 0x4d11a2; continue; } // 4d11b2: je 0x4d11a2
        pc = 0x4d11b4; continue;
      case 0x4d11b4:
        R.edx = (((R.m.u8(((R.ecx + 0x7e) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d11b4: movsx edx, byte ptr [ecx + 0x7e]
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.edx >>> 0)); // 4d11b8: mov dword ptr [esp + 0x30], edx
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 4d11bc: fild dword ptr [esp + 0x30]
        R.fcom(R.st[0], 1.0); // 4d11c0: fcom qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d11c6: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d11c8: test ah, 1
        if (!R.zf) { pc = 0x4d11da; continue; } // 4d11cb: jne 0x4d11da
        pc = 0x4d11cd; continue;
      case 0x4d11cd:
        R.fcom(R.st[0], 3.0); // 4d11cd: fcom qword ptr [0x968930]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d11d3: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d11d5: test ah, 0x41
        if (!R.zf) { pc = 0x4d11e2; continue; } // 4d11d8: jne 0x4d11e2
        pc = 0x4d11da; continue;
      case 0x4d11da:
        R.fpop(); // 4d11da: fstp st(0)
        R.fpush(3.0); // 4d11dc: fld qword ptr [0x968930]
        pc = 0x4d11e2; continue;
      case 0x4d11e2:
        R.eax = (((R.m.u8(((R.ebx + 0x64) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d11e2: movsx eax, byte ptr [ebx + 0x64]
        R.eax = (R.sub((R.eax >>> 0), 0x2, 32)) | 0; // 4d11e6: sub eax, 2
        if (R.zf) { pc = 0x4d11f6; continue; } // 4d11e9: je 0x4d11f6
        pc = 0x4d11eb; continue;
      case 0x4d11eb:
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 4d11eb: dec eax
        if (!R.zf) { pc = 0x4d11f8; continue; } // 4d11ec: jne 0x4d11f8
        pc = 0x4d11ee; continue;
      case 0x4d11ee:
        R.st[0] = R.st[0] * 7.5; // 4d11ee: fmul qword ptr [0x968eb0]
        pc = 0x4d11f8; continue; // 4d11f4: jmp 0x4d11f8
      case 0x4d11f6:
        R.st[0] = R.st[0] + R.st[0]; // 4d11f6: fadd st(0), st(0)
        pc = 0x4d11f8; continue;
      case 0x4d11f8:
        R.eax = (((R.m.u8(((R.ecx + 0x85) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d11f8: movsx eax, byte ptr [ecx + 0x85]
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.eax >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.eax = (Number(BigInt.asIntN(32, p))) | 0; } // 4d11ff: imul eax, eax
        R.ecx = (((R.eax + R.eax * 2) | 0)) | 0; // 4d1202: lea ecx, [eax + eax*2]
        R.edx = (((R.eax + R.ecx * 8) | 0)) | 0; // 4d1205: lea edx, [eax + ecx*8]
        R.eax = (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d1208: movsx eax, word ptr [ebx + 0x80]
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 4d120f: add edx, eax
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.edx >>> 0)); // 4d1211: mov dword ptr [esp + 0x30], edx
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 4d1215: fild dword ptr [esp + 0x30]
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 4d1219: fxch st(1)
        R.st[0] = R.st[0] * 1000.0; // 4d121b: fmul qword ptr [0x968908]
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 4d1221: fdivp st(1)
        pc = 0x4d1238; continue; // 4d1223: jmp 0x4d1238
      case 0x4d1225:
        R.push(0x3); // 4d1225: push 3
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 4d1227: call 0x90cfc0
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 4d122c: add esp, 4
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 4d122f: inc eax
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.eax >>> 0)); // 4d1230: mov dword ptr [esp + 0x30], eax
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 4d1234: fild dword ptr [esp + 0x30]
        pc = 0x4d1238; continue;
      case 0x4d1238:
        R.fpush(20.0); // 4d1238: fld qword ptr [0x968ea8]
        R.st[0] = R.st[0] - R.st[1]; // 4d123e: fsub st(1)
        R.fpush(R.st[0]); // 4d1240: fld st(0)
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 4d1242: fmulp st(1)
        R.st[0] = R.st[0] * 0.2; // 4d1244: fmul qword ptr [0x968918]
        R.st[0] = R.st[0] * 0.02; // 4d124a: fmul qword ptr [0x968a98]
        R.st[0] = 1.0 - R.st[0]; // 4d1250: fsubr qword ptr [0x967890]
        R.fcom(R.st[0], 0.1); // 4d1256: fcom qword ptr [0x967880]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d125c: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d125e: test ah, 1
        if (R.zf) { pc = 0x4d126d; continue; } // 4d1261: je 0x4d126d
        pc = 0x4d1263; continue;
      case 0x4d1263:
        R.fpop(); // 4d1263: fstp st(0)
        R.fpush(0.1); // 4d1265: fld qword ptr [0x967880]
        pc = 0x4d1282; continue; // 4d126b: jmp 0x4d1282
      case 0x4d126d:
        R.fcom(R.st[0], 1.1); // 4d126d: fcom qword ptr [0x9689c0]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1273: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d1275: test ah, 0x41
        if (!R.zf) { pc = 0x4d1282; continue; } // 4d1278: jne 0x4d1282
        pc = 0x4d127a; continue;
      case 0x4d127a:
        R.fpop(); // 4d127a: fstp st(0)
        R.fpush(1.1); // 4d127c: fld qword ptr [0x9689c0]
        pc = 0x4d1282; continue;
      case 0x4d1282:
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x38) | 0)); // 4d1282: fmul qword ptr [esp + 0x38]
        R.m.wf64(((R.esp + 0x38) | 0) >>> 0, R.st[0]); R.fpop(); // 4d1286: fstp qword ptr [esp + 0x38]
        R.fpush(R.st[0]); // 4d128a: fld st(0)
        R.st[0] = R.st[0] * R.st[1]; // 4d128c: fmul st(1)
        R.fpush(R.st[0]); // 4d128e: fld st(0)
        R.st[0] = R.st[0] * 65000.0; // 4d1290: fmul qword ptr [0x968ea0]
        R.fcom(R.st[0], R.f64(((R.esp + 0x38) | 0))); R.fpop(); // 4d1296: fcomp qword ptr [esp + 0x38]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d129a: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d129c: test ah, 1
        if (R.zf) { pc = 0x4d12bb; continue; } // 4d129f: je 0x4d12bb
        pc = 0x4d12a1; continue;
      case 0x4d12a1:
        R.fpush(R.f64(((R.esp + 0x38) | 0))); // 4d12a1: fld qword ptr [esp + 0x38]
        R.st[0] = R.st[0] * 0.25; // 4d12a5: fmul qword ptr [0x9689e0]
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 4d12ab: fxch st(1)
        R.st[0] = R.st[0] * 32500.0; // 4d12ad: fmul qword ptr [0x968e98]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 4d12b3: faddp st(1)
        R.m.wf64(((R.esp + 0x38) | 0) >>> 0, R.st[0]); R.fpop(); // 4d12b5: fstp qword ptr [esp + 0x38]
        pc = 0x4d12bd; continue; // 4d12b9: jmp 0x4d12bd
      case 0x4d12bb:
        R.fpop(); // 4d12bb: fstp st(0)
        pc = 0x4d12bd; continue;
      case 0x4d12bd:
        R.st[0] = R.st[0] * 5000.0; // 4d12bd: fmul qword ptr [0x9688e8]
        R.fpush(R.f64(((R.esp + 0x38) | 0))); // 4d12c3: fld qword ptr [esp + 0x38]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d12c7: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d12c9: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d12cb: test ah, 1
        if (R.zf) { pc = 0x4d12d6; continue; } // 4d12ce: je 0x4d12d6
        pc = 0x4d12d0; continue;
      case 0x4d12d0:
        R.m.wf64(((R.esp + 0x38) | 0) >>> 0, R.st[0]); R.fpop(); // 4d12d0: fstp qword ptr [esp + 0x38]
        pc = 0x4d12d8; continue; // 4d12d4: jmp 0x4d12d8
      case 0x4d12d6:
        R.fpop(); // 4d12d6: fstp st(0)
        pc = 0x4d12d8; continue;
      case 0x4d12d8:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebp + 0x10) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d12d8: mov al, byte ptr [ebp + 0x10]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 4d12db: test al, al
        if (R.zf) { pc = 0x4d1390; continue; } // 4d12dd: je 0x4d1390
        pc = 0x4d12e3; continue;
      case 0x4d12e3:
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 4d12e3: test ebx, ebx
        if (R.zf) { pc = 0x4d1351; continue; } // 4d12e5: je 0x4d1351
        pc = 0x4d12e7; continue;
      case 0x4d12e7:
        R.ebx = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 4d12e7: mov ebx, dword ptr [ebx + 0x53]
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 4d12ea: test ebx, ebx
        if (R.zf) { pc = 0x4d1351; continue; } // 4d12ec: je 0x4d1351
        pc = 0x4d12ee; continue;
      case 0x4d12ee:
        R.ecx = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 4d12ee: mov ecx, dword ptr [ebx]
        R.eax = (R.m.u32(((0x9cf434) | 0) >>> 0)) | 0; // 4d12f0: mov eax, dword ptr [0x9cf434]
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 4d12f5: cmp ecx, eax
        if (!R.zf) { pc = 0x4d1351; continue; } // 4d12f7: jne 0x4d1351
        pc = 0x4d12f9; continue;
      case 0x4d12f9:
        R.fpush(R.f64(((R.esp + 0x38) | 0))); // 4d12f9: fld qword ptr [esp + 0x38]
        R.fcom(R.st[0], 6000000.0); R.fpop(); // 4d12fd: fcomp qword ptr [0x968e90]
        R.fpush(R.f64(((R.esp + 0x38) | 0))); // 4d1303: fld qword ptr [esp + 0x38]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1307: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d1309: test ah, 1
        if (R.zf) { pc = 0x4d1347; continue; } // 4d130c: je 0x4d1347
        pc = 0x4d130e; continue;
      case 0x4d130e:
        R.st[0] = R.st[0] * 1.6666666666666668e-07; // 4d130e: fmul qword ptr [0x968e88]
        R.st[0] = R.st[0] * 0.6; // 4d1314: fmul qword ptr [0x968e48]
        R.st[0] = R.st[0] + 0.3; // 4d131a: fadd qword ptr [0x968e80]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x38) | 0)); // 4d1320: fmul qword ptr [esp + 0x38]
        R.fpush(5000.0); // 4d1324: fld qword ptr [0x9688e8]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d132a: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d132c: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d132e: test ah, 0x41
        if (!R.zf) { pc = 0x4d134d; continue; } // 4d1331: jne 0x4d134d
        pc = 0x4d1333; continue;
      case 0x4d1333:
        R.fpop(); // 4d1333: fstp st(0)
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, 0x0); // 4d1335: mov dword ptr [esp + 0x38], 0
        R.m.w32(((R.esp + 0x3c) | 0) >>> 0, 0x40b38800); // 4d133d: mov dword ptr [esp + 0x3c], 0x40b38800
        pc = 0x4d1351; continue; // 4d1345: jmp 0x4d1351
      case 0x4d1347:
        R.st[0] = R.st[0] * 0.9; // 4d1347: fmul qword ptr [0x9689d8]
        pc = 0x4d134d; continue;
      case 0x4d134d:
        R.m.wf64(((R.esp + 0x38) | 0) >>> 0, R.st[0]); R.fpop(); // 4d134d: fstp qword ptr [esp + 0x38]
        pc = 0x4d1351; continue;
      case 0x4d1351:
        R.esi = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 4d1351: mov esi, dword ptr [esp + 0x1c]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 4d1355: test esi, esi
        if (R.zf) { pc = 0x4d15b9; continue; } // 4d1357: je 0x4d15b9
        pc = 0x4d135d; continue;
      case 0x4d135d:
        R.ecx = ((R.esi >>> 0)) | 0; // 4d135d: mov ecx, esi
        R.call(0x867b50, { n: 0, thisEcx: true, calleeClean: false }); // 4d135f: call 0x867b50
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d1364: test eax, eax
        if (R.zf) { pc = 0x4d15b9; continue; } // 4d1366: je 0x4d15b9
        pc = 0x4d136c; continue;
      case 0x4d136c:
        R.fpush(R.m.s32(((R.esi + 0x21) | 0) >>> 0)); // 4d136c: fild dword ptr [esi + 0x21]
        R.fpush(R.f64(((R.esp + 0x38) | 0))); // 4d136f: fld qword ptr [esp + 0x38]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d1373: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1375: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d1377: test ah, 1
        if (R.zf) { pc = 0x4d1382; continue; } // 4d137a: je 0x4d1382
        pc = 0x4d137c; continue;
      case 0x4d137c:
        R.fpop(); // 4d137c: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x38) | 0))); // 4d137e: fld qword ptr [esp + 0x38]
        pc = 0x4d1382; continue;
      case 0x4d1382:
        R.ftol(); // 4d1382: call 0x945640
        R.edi = (R.pop()) | 0; // 4d1387: pop edi
        R.esi = (R.pop()) | 0; // 4d1388: pop esi
        R.ebx = (R.pop()) | 0; // 4d1389: pop ebx
        R.esp = ((R.ebp >>> 0)) | 0; // 4d138a: mov esp, ebp
        R.ebp = (R.pop()) | 0; // 4d138c: pop ebp
        return R.eax; // 4d138d: ret 0x14
      case 0x4d1390:
        R.esi = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 4d1390: mov esi, dword ptr [esp + 0x1c]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 4d1394: test esi, esi
        if (R.zf) { pc = 0x4d1476; continue; } // 4d1396: je 0x4d1476
        pc = 0x4d139c; continue;
      case 0x4d139c:
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 4d139c: mov ecx, dword ptr [0xde1f54]
        R.push((R.edi >>> 0)); // 4d13a2: push edi
        R.call(0x8d0a70, { n: 1, thisEcx: false, calleeClean: true }); // 4d13a3: call 0x8d0a70
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d13a8: test eax, eax
        if (R.zf) { pc = 0x4d14a9; continue; } // 4d13aa: je 0x4d14a9
        pc = 0x4d13b0; continue;
      case 0x4d13b0:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 4d13b0: xor eax, eax
        R.edx = (R.logic((R.edx >>> 0) ^ (R.edx >>> 0), 32)) | 0; // 4d13b2: xor edx, edx
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.esi + 0x2f) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 4d13b4: mov ax, word ptr [esi + 0x2f]
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 4d13b8: mov dx, word ptr [0xae2c92]
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 4d13bf: sub eax, edx
        R.edx = (((R.m.u16(((R.esi + 0x2d) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d13c1: movsx edx, word ptr [esi + 0x2d]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 4d13c5: lea ecx, [eax + eax*8]
        R.eax = (((R.eax + R.ecx * 8) | 0)) | 0; // 4d13c8: lea eax, [eax + ecx*8]
        R.ecx = (((R.m.u16(((0xae2c90) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d13cb: movsx ecx, word ptr [0xae2c90]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4d13d2: lea eax, [eax + eax*4]
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 4d13d5: add eax, edx
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 4d13d7: sub eax, ecx
        R.sub((R.eax >>> 0), 0x1, 32); // 4d13d9: cmp eax, 1
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.eax >>> 0)); // 4d13dc: mov dword ptr [esp + 0x14], eax
        if (R.cL) { pc = 0x4d15e7; continue; } // 4d13e0: jl 0x4d15e7
        pc = 0x4d13e6; continue;
      case 0x4d13e6:
        R.sub((R.ebx >>> 0), R.m.u32(((R.esp + 0x20) | 0) >>> 0), 32); // 4d13e6: cmp ebx, dword ptr [esp + 0x20]
        if (!R.zf) { pc = 0x4d1415; continue; } // 4d13ea: jne 0x4d1415
        pc = 0x4d13ec; continue;
      case 0x4d13ec:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esi + 0x3d) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d13ec: mov cl, byte ptr [esi + 0x3d]
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 4d13ef: test cl, cl
        if (R.cLE) { pc = 0x4d1415; continue; } // 4d13f1: jle 0x4d1415
        pc = 0x4d13f3; continue;
      case 0x4d13f3:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.esi + 0x35) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d13f3: mov dl, byte ptr [esi + 0x35]
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) & 0x3f, 8)) & 0xff) << 0)) | 0; // 4d13f6: and dl, 0x3f
        R.sub(((R.edx >>> 0) & 0xff), 0x2, 8); // 4d13f9: cmp dl, 2
        if (!R.zf) { pc = 0x4d1432; continue; } // 4d13fc: jne 0x4d1432
        pc = 0x4d13fe; continue;
      case 0x4d13fe:
        R.ecx = (((((R.ecx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 4d13fe: movsx ecx, cl
        R.edx = (((R.ecx * 8) | 0)) | 0; // 4d1401: lea edx, [ecx*8]
        R.edx = (R.sub((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 4d1408: sub edx, ecx
        R.eax = (((R.eax + R.edx + 0xc8) | 0)) | 0; // 4d140a: lea eax, [eax + edx + 0xc8]
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.eax >>> 0)); // 4d1411: mov dword ptr [esp + 0x14], eax
        pc = 0x4d1415; continue;
      case 0x4d1415:
        R.fpush(R.f64(((R.esp + 0x38) | 0))); // 4d1415: fld qword ptr [esp + 0x38]
        pc = 0x4d1419; continue;
      case 0x4d1419:
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d1419: fild dword ptr [esp + 0x14]
        R.sub((R.eax >>> 0), 0x15e, 32); // 4d141d: cmp eax, 0x15e
        R.st[0] = R.st[0] * 0.0014285714285714286; // 4d1422: fmul qword ptr [0x968e78]
        if (!R.cL) { pc = 0x4d143e; continue; } // 4d1428: jge 0x4d143e
        pc = 0x4d142a; continue;
      case 0x4d142a:
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 4d142a: fmulp st(1)
        R.m.wf64(((R.esp + 0x38) | 0) >>> 0, R.st[0]); // 4d142c: fst qword ptr [esp + 0x38]
        pc = 0x4d14ad; continue; // 4d1430: jmp 0x4d14ad
      case 0x4d1432:
        R.fpush(R.f64(((R.esp + 0x38) | 0))); // 4d1432: fld qword ptr [esp + 0x38]
        R.st[0] = R.st[0] * 0.5; // 4d1436: fmul qword ptr [0x968968]
        pc = 0x4d1419; continue; // 4d143c: jmp 0x4d1419
      case 0x4d143e:
        R.st[0] = 2.5 - R.st[0]; // 4d143e: fsubr qword ptr [0x968e18]
        R.fcom(R.st[0], 1.0); // 4d1444: fcom qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d144a: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d144c: test ah, 1
        if (R.zf) { pc = 0x4d1459; continue; } // 4d144f: je 0x4d1459
        pc = 0x4d1451; continue;
      case 0x4d1451:
        R.fpop(); // 4d1451: fstp st(0)
        R.fpush(1.0); // 4d1453: fld dword ptr [0x968e70]
        pc = 0x4d1459; continue;
      case 0x4d1459:
        R.fcom(R.st[0], 2.0); // 4d1459: fcom qword ptr [0x968950]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d145f: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d1461: test ah, 0x41
        if (!R.zf) { pc = 0x4d146e; continue; } // 4d1464: jne 0x4d146e
        pc = 0x4d1466; continue;
      case 0x4d1466:
        R.fpop(); // 4d1466: fstp st(0)
        R.fpush(2.0); // 4d1468: fld dword ptr [0x9689a8]
        pc = 0x4d146e; continue;
      case 0x4d146e:
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 4d146e: fdivp st(1)
        R.m.wf64(((R.esp + 0x38) | 0) >>> 0, R.st[0]); // 4d1470: fst qword ptr [esp + 0x38]
        pc = 0x4d14ad; continue; // 4d1474: jmp 0x4d14ad
      case 0x4d1476:
        R.fpush(0.0); // 4d1476: fld qword ptr [0x9689a0]
        R.m.wf64(((R.esp + 0x38) | 0) >>> 0, R.st[0]); // 4d147c: fst qword ptr [esp + 0x38]
        pc = 0x4d1480; continue;
      case 0x4d1480:
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 4d1480: test ebx, ebx
        if (R.zf) { pc = 0x4d1596; continue; } // 4d1482: je 0x4d1596
        pc = 0x4d1488; continue;
      case 0x4d1488:
        R.ebx = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 4d1488: mov ebx, dword ptr [ebx + 0x53]
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 4d148b: test ebx, ebx
        if (R.zf) { pc = 0x4d1596; continue; } // 4d148d: je 0x4d1596
        pc = 0x4d1493; continue;
      case 0x4d1493:
        R.ecx = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 4d1493: mov ecx, dword ptr [ebx]
        R.eax = (R.m.u32(((0x9cf300) | 0) >>> 0)) | 0; // 4d1495: mov eax, dword ptr [0x9cf300]
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 4d149a: cmp ecx, eax
        if (!R.zf) { pc = 0x4d151d; continue; } // 4d149c: jne 0x4d151d
        pc = 0x4d149e; continue;
      case 0x4d149e:
        R.st[0] = R.st[0] * 0.8; // 4d149e: fmul qword ptr [0x9689b0]
        pc = 0x4d1592; continue; // 4d14a4: jmp 0x4d1592
      case 0x4d14a9:
        R.fpush(R.f64(((R.esp + 0x38) | 0))); // 4d14a9: fld qword ptr [esp + 0x38]
        pc = 0x4d14ad; continue;
      case 0x4d14ad:
        R.fcom(R.st[0], 0.0); // 4d14ad: fcom qword ptr [0x9689a0]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d14b3: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x40, 8); // 4d14b5: test ah, 0x40
        if (!R.zf) { pc = 0x4d1480; continue; } // 4d14b8: jne 0x4d1480
        pc = 0x4d14ba; continue;
      case 0x4d14ba:
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 4d14ba: test ebx, ebx
        if (R.zf) { pc = 0x4d1596; continue; } // 4d14bc: je 0x4d1596
        pc = 0x4d14c2; continue;
      case 0x4d14c2:
        R.eax = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 4d14c2: mov eax, dword ptr [ebx + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d14c5: test eax, eax
        if (R.zf) { pc = 0x4d1480; continue; } // 4d14c7: je 0x4d1480
        pc = 0x4d14c9; continue;
      case 0x4d14c9:
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 4d14c9: mov eax, dword ptr [eax]
        R.ecx = (R.m.u32(((0x9cf434) | 0) >>> 0)) | 0; // 4d14cb: mov ecx, dword ptr [0x9cf434]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 4d14d1: cmp eax, ecx
        if (!R.zf) { pc = 0x4d1480; continue; } // 4d14d3: jne 0x4d1480
        pc = 0x4d14d5; continue;
      case 0x4d14d5:
        R.fcom(R.st[0], 6000000.0); // 4d14d5: fcom qword ptr [0x968e90]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d14db: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d14dd: test ah, 1
        if (R.zf) { pc = 0x4d1515; continue; } // 4d14e0: je 0x4d1515
        pc = 0x4d14e2; continue;
      case 0x4d14e2:
        R.fpush(R.st[0]); // 4d14e2: fld st(0)
        R.st[0] = R.st[0] * 1.6666666666666668e-07; // 4d14e4: fmul qword ptr [0x968e88]
        R.st[0] = R.st[0] * 0.6; // 4d14ea: fmul qword ptr [0x968e48]
        R.st[0] = R.st[0] + 0.3; // 4d14f0: fadd qword ptr [0x968e80]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 4d14f6: fmulp st(1)
        R.fpush(5000.0); // 4d14f8: fld qword ptr [0x9688e8]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d14fe: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1500: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d1502: test ah, 0x41
        if (!R.zf) { pc = 0x4d1592; continue; } // 4d1505: jne 0x4d1592
        pc = 0x4d150b; continue;
      case 0x4d150b:
        R.fpop(); // 4d150b: fstp st(0)
        R.fpush(5000.0); // 4d150d: fld qword ptr [0x9688e8]
        pc = 0x4d1592; continue; // 4d1513: jmp 0x4d1592
      case 0x4d1515:
        R.st[0] = R.st[0] * 0.9; // 4d1515: fmul qword ptr [0x9689d8]
        pc = 0x4d1592; continue; // 4d151b: jmp 0x4d1592
      case 0x4d151d:
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 4d151d: test ebx, ebx
        if (R.zf) { pc = 0x4d1596; continue; } // 4d151f: je 0x4d1596
        pc = 0x4d1521; continue;
      case 0x4d1521:
        R.edx = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 4d1521: mov edx, dword ptr [ebx]
        R.eax = (R.m.u32(((0x9cf484) | 0) >>> 0)) | 0; // 4d1523: mov eax, dword ptr [0x9cf484]
        R.sub((R.edx >>> 0), (R.eax >>> 0), 32); // 4d1528: cmp edx, eax
        if (!R.zf) { pc = 0x4d1596; continue; } // 4d152a: jne 0x4d1596
        pc = 0x4d152c; continue;
      case 0x4d152c:
        R.st[0] = R.st[0] * 0.25; // 4d152c: fmul qword ptr [0x9689e0]
        R.fcom(R.st[0], 125000.0); // 4d1532: fcom qword ptr [0x968e68]
        R.m.wf64(((R.esp + 0x38) | 0) >>> 0, R.st[0]); // 4d1538: fst qword ptr [esp + 0x38]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d153c: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d153e: test ah, 0x41
        if (!R.zf) { pc = 0x4d1566; continue; } // 4d1541: jne 0x4d1566
        pc = 0x4d1543; continue;
      case 0x4d1543:
        R.st[0] = R.st[0] - 125000.0; // 4d1543: fsub qword ptr [0x968e68]
        R.st[0] = R.st[0] * 0.5; // 4d1549: fmul qword ptr [0x968968]
        R.st[0] = R.st[0] + 125000.0; // 4d154f: fadd qword ptr [0x968e68]
        R.ftol(); // 4d1555: call 0x945640
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.eax >>> 0)); // 4d155a: mov dword ptr [esp + 0x30], eax
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 4d155e: fild dword ptr [esp + 0x30]
        R.m.wf64(((R.esp + 0x38) | 0) >>> 0, R.st[0]); // 4d1562: fst qword ptr [esp + 0x38]
        pc = 0x4d1566; continue;
      case 0x4d1566:
        R.fcom(R.st[0], 250000.0); // 4d1566: fcom qword ptr [0x9688e0]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d156c: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d156e: test ah, 0x41
        if (!R.zf) { pc = 0x4d1596; continue; } // 4d1571: jne 0x4d1596
        pc = 0x4d1573; continue;
      case 0x4d1573:
        R.st[0] = R.st[0] - 250000.0; // 4d1573: fsub qword ptr [0x9688e0]
        R.st[0] = R.st[0] * 0.5; // 4d1579: fmul qword ptr [0x968968]
        R.st[0] = R.st[0] + 250000.0; // 4d157f: fadd qword ptr [0x9688e0]
        R.ftol(); // 4d1585: call 0x945640
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.eax >>> 0)); // 4d158a: mov dword ptr [esp + 0x30], eax
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 4d158e: fild dword ptr [esp + 0x30]
        pc = 0x4d1592; continue;
      case 0x4d1592:
        R.m.wf64(((R.esp + 0x38) | 0) >>> 0, R.st[0]); // 4d1592: fst qword ptr [esp + 0x38]
        pc = 0x4d1596; continue;
      case 0x4d1596:
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 4d1596: test esi, esi
        if (R.zf) { pc = 0x4d15bd; continue; } // 4d1598: je 0x4d15bd
        pc = 0x4d159a; continue;
      case 0x4d159a:
        R.ecx = ((R.esi >>> 0)) | 0; // 4d159a: mov ecx, esi
        R.fpop(); // 4d159c: fstp st(0)
        R.call(0x867b50, { n: 0, thisEcx: true, calleeClean: false }); // 4d159e: call 0x867b50
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d15a3: test eax, eax
        if (R.zf) { pc = 0x4d15b9; continue; } // 4d15a5: je 0x4d15b9
        pc = 0x4d15a7; continue;
      case 0x4d15a7:
        R.fpush(R.m.s32(((R.esi + 0x21) | 0) >>> 0)); // 4d15a7: fild dword ptr [esi + 0x21]
        R.fpush(R.f64(((R.esp + 0x38) | 0))); // 4d15aa: fld qword ptr [esp + 0x38]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d15ae: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d15b0: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d15b2: test ah, 1
        if (R.zf) { pc = 0x4d15bd; continue; } // 4d15b5: je 0x4d15bd
        pc = 0x4d15b7; continue;
      case 0x4d15b7:
        R.fpop(); // 4d15b7: fstp st(0)
        pc = 0x4d15b9; continue;
      case 0x4d15b9:
        R.fpush(R.f64(((R.esp + 0x38) | 0))); // 4d15b9: fld qword ptr [esp + 0x38]
        pc = 0x4d15bd; continue;
      case 0x4d15bd:
        R.ftol(); // 4d15bd: call 0x945640
        R.edi = (R.pop()) | 0; // 4d15c2: pop edi
        R.esi = (R.pop()) | 0; // 4d15c3: pop esi
        R.ebx = (R.pop()) | 0; // 4d15c4: pop ebx
        R.esp = ((R.ebp >>> 0)) | 0; // 4d15c5: mov esp, ebp
        R.ebp = (R.pop()) | 0; // 4d15c7: pop ebp
        return R.eax; // 4d15c8: ret 0x14
      case 0x4d15cb:
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 4d15cb: test edi, edi
        if (R.zf) { pc = 0x4d15e7; continue; } // 4d15cd: je 0x4d15e7
        pc = 0x4d15cf; continue;
      case 0x4d15cf:
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 4d15cf: mov ecx, dword ptr [0xde1f54]
        R.push(0x1); // 4d15d5: push 1
        R.push((R.edi >>> 0)); // 4d15d7: push edi
        R.push((R.ebx >>> 0)); // 4d15d8: push ebx
        R.call(0x8d0780, { n: 3, thisEcx: false, calleeClean: true }); // 4d15d9: call 0x8d0780
        R.edi = (R.pop()) | 0; // 4d15de: pop edi
        R.esi = (R.pop()) | 0; // 4d15df: pop esi
        R.ebx = (R.pop()) | 0; // 4d15e0: pop ebx
        R.esp = ((R.ebp >>> 0)) | 0; // 4d15e1: mov esp, ebp
        R.ebp = (R.pop()) | 0; // 4d15e3: pop ebp
        return R.eax; // 4d15e4: ret 0x14
      case 0x4d15e7:
        R.edi = (R.pop()) | 0; // 4d15e7: pop edi
        R.esi = (R.pop()) | 0; // 4d15e8: pop esi
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 4d15e9: xor eax, eax
        R.ebx = (R.pop()) | 0; // 4d15eb: pop ebx
        R.esp = ((R.ebp >>> 0)) | 0; // 4d15ec: mov esp, ebp
        R.ebp = (R.pop()) | 0; // 4d15ee: pop ebp
        return R.eax; // 4d15ef: ret 0x14
      default: throw new Error(`f_4d0c60: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
