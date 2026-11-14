// 0x866f60 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x866f60, 0x866f9f, 0x866fa7, 0x866fb1, 0x866fb9, 0x866fc8, 0x866ff9, 0x866ffc, 0x867001, 0x867006, 0x86700b, 0x86700d, 0x867015, 0x86701a, 0x86701e, 0x867020, 0x86702b, 0x86702e, 0x867039, 0x86703e, 0x867042, 0x867047, 0x86704b, 0x86704e, 0x867055, 0x86705f, 0x867064, 0x86706a, 0x86706d, 0x867077, 0x867079, 0x867083, 0x867085, 0x867094, 0x867096, 0x8670a0, 0x8670a2, 0x8670ac, 0x8670ae, 0x8670b6, 0x8670b8, 0x8670c0, 0x8670c7, 0x8670c9, 0x8670ce, 0x8670d9, 0x8670db, 0x8670e2, 0x8670e4, 0x8670e9, 0x8670f3, 0x8670f8, 0x8670fa, 0x867105, 0x867107, 0x86710e, 0x867114, 0x867121, 0x867129, 0x86712d, 0x867132, 0x86713f, 0x86714b, 0x867150, 0x86715d, 0x867162, 0x867167, 0x867174, 0x867179, 0x86717f, 0x867186, 0x867193, 0x86719b, 0x86719f, 0x8671a6, 0x8671ab, 0x8671b8, 0x8671c0, 0x8671c4, 0x8671cb, 0x8671d0, 0x8671dd, 0x8671e2, 0x8671ef, 0x8671f4, 0x867201, 0x867206, 0x867213, 0x867226, 0x867233]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7]);
function f_866f60_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 866f60
        R.esp = (R.sub((R.esp >>> 0), 0xc, 32)) | 0; // 866f60: sub esp, 0xc
        R.push((R.ebx >>> 0)); // 866f63: push ebx
        R.push((R.ebp >>> 0)); // 866f64: push ebp
        R.push((R.esi >>> 0)); // 866f65: push esi
        R.push((R.edi >>> 0)); // 866f66: push edi
        R.edi = ((R.ecx >>> 0)) | 0; // 866f67: mov edi, ecx
        R.ebx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 866f69: mov ebx, dword ptr [0xae23b4]
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 866f6f: mov eax, dword ptr [edi]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 866f71: lea ecx, [eax + eax*4]
        R.eax = (((R.eax + R.ecx * 2) | 0)) | 0; // 866f74: lea eax, [eax + ecx*2]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) ^ ((R.ecx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 866f77: xor cl, cl
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 866f79: lea edx, [eax + eax*4]
        R.eax = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 866f7c: mov eax, dword ptr [0xae23bc]
        R.esi = (((R.eax + R.edx * 2) | 0)) | 0; // 866f81: lea esi, [eax + edx*2]
        R.eax = (R.m.u32(((R.edi + 0x4) | 0) >>> 0)) | 0; // 866f84: mov eax, dword ptr [edi + 4]
        R.ebx = (R.add((R.ebx >>> 0), (R.eax >>> 0), 32)) | 0; // 866f87: add ebx, eax
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 866f89: lea edx, [eax + eax*8]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 866f8c: shl edx, 4
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 866f8f: add edx, eax
        R.eax = (((R.ebx + R.edx * 4) | 0)) | 0; // 866f91: lea eax, [ebx + edx*4]
        R.edx = (R.m.u32(((R.ebx + R.edx * 4 + 0xcf) | 0) >>> 0)) | 0; // 866f94: mov edx, dword ptr [ebx + edx*4 + 0xcf]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 866f9b: test edx, edx
        if (R.zf) { pc = 2; continue; } // 866f9d: je 0x866fa7
        pc = 1; continue;
      case 1: // 866f9f
        R.sub((R.esi >>> 0), (R.edx >>> 0), 32); // 866f9f: cmp esi, edx
        if (R.zf) { pc = 89; continue; } // 866fa1: je 0x867233
        pc = 2; continue;
      case 2: // 866fa7
        R.eax = (R.m.u32(((R.eax + 0xd3) | 0) >>> 0)) | 0; // 866fa7: mov eax, dword ptr [eax + 0xd3]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 866fad: test eax, eax
        if (R.zf) { pc = 4; continue; } // 866faf: je 0x866fb9
        pc = 3; continue;
      case 3: // 866fb1
        R.sub((R.esi >>> 0), (R.eax >>> 0), 32); // 866fb1: cmp esi, eax
        if (R.zf) { pc = 89; continue; } // 866fb3: je 0x867233
        pc = 4; continue;
      case 4: // 866fb9
        R.eax = (R.m.u32(((R.edi + 0x45) | 0) >>> 0)) | 0; // 866fb9: mov eax, dword ptr [edi + 0x45]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 866fbc: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.eax >>> 0)); // 866fbe: mov dword ptr [esp + 0x14], eax
        if (R.zf) { pc = 89; continue; } // 866fc2: je 0x867233
        pc = 5; continue;
      default: return pc;
    }
  }
}
function f_866f60_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 5: // 866fc8
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x5b) | 0) >>> 0)) & 0xff) << 0)) | 0; // 866fc8: mov al, byte ptr [esi + 0x5b]
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.esi + 0x5a) | 0) >>> 0)) & 0xff) << 0)) | 0; // 866fcb: mov dl, byte ptr [esi + 0x5a]
        R.m.w8(((R.esp + 0x10) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 866fce: mov byte ptr [esp + 0x10], al
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 866fd2: mov eax, dword ptr [esi]
        R.m.w8(((R.esp + 0x11) | 0) >>> 0, ((R.edx >>> 0) & 0xff)); // 866fd4: mov byte ptr [esp + 0x11], dl
        R.ebp = (0x7) | 0; // 866fd8: mov ebp, 7
        R.edx = R.eax < 0 ? -1 : 0; // 866fdd: cdq 
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.ebp >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 866fde: idiv ebp
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.esi + 0x59) | 0) >>> 0)) & 0xff) << 0)) | 0; // 866fe0: mov bl, byte ptr [esi + 0x59]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x11) | 0) >>> 0)) & 0xff) << 0)) | 0; // 866fe3: mov al, byte ptr [esp + 0x11]
        R.edx = ((R.edx & 0xffffff00) | (((R.add(((R.edx >>> 0) & 0xff), ((R.ebx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 866fe7: add dl, bl
        R.edx = ((R.edx & 0xffffff00) | (((R.add(((R.edx >>> 0) & 0xff), ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 866fe9: add dl, al
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x10) | 0) >>> 0)) & 0xff) << 0)) | 0; // 866feb: mov al, byte ptr [esp + 0x10]
        R.edx = ((R.edx & 0xffffff00) | (((R.add(((R.edx >>> 0) & 0xff), ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 866fef: add dl, al
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x11) | 0) >>> 0)) & 0xff) << 0)) | 0; // 866ff1: mov al, byte ptr [esp + 0x11]
        R.sub(((R.eax >>> 0) & 0xff), 0x1, 8); // 866ff5: cmp al, 1
        if (!R.zf) { pc = 7; continue; } // 866ff7: jne 0x866ffc
        pc = 6; continue;
      case 6: // 866ff9
        R.edx = ((R.edx & 0xffffff00) | (((R.add(((R.edx >>> 0) & 0xff), 0xfe, 8)) & 0xff) << 0)) | 0; // 866ff9: add dl, 0xfe
        pc = 7; continue;
      case 7: // 866ffc
        R.sub(((R.ebx >>> 0) & 0xff), 0x1, 8); // 866ffc: cmp bl, 1
        if (!R.zf) { pc = 9; continue; } // 866fff: jne 0x867006
        pc = 8; continue;
      case 8: // 867001
        R.edx = ((R.edx & 0xffffff00) | (((R.add(((R.edx >>> 0) & 0xff), 0xfd, 8)) & 0xff) << 0)) | 0; // 867001: add dl, 0xfd
        pc = 11; continue; // 867004: jmp 0x86700d
      case 9: // 867006
        R.sub(((R.ebx >>> 0) & 0xff), 0x6, 8); // 867006: cmp bl, 6
        if (!R.cL) { pc = 11; continue; } // 867009: jge 0x86700d
        pc = 10; continue;
      case 10: // 86700b
        R.edx = ((R.edx & 0xffffff00) | (((R.incdec(((R.edx >>> 0) & 0xff), -1, 8)) & 0xff) << 0)) | 0; // 86700b: dec dl
        pc = 11; continue;
      case 11: // 86700d
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x10) | 0) >>> 0)) & 0xff) << 0)) | 0; // 86700d: mov al, byte ptr [esp + 0x10]
        R.sub(((R.eax >>> 0) & 0xff), 0x1, 8); // 867011: cmp al, 1
        if (!R.zf) { pc = 13; continue; } // 867013: jne 0x86701a
        pc = 12; continue;
      case 12: // 867015
        R.edx = ((R.edx & 0xffffff00) | (((R.add(((R.edx >>> 0) & 0xff), 0xfd, 8)) & 0xff) << 0)) | 0; // 867015: add dl, 0xfd
        pc = 15; continue; // 867018: jmp 0x867020
      case 13: // 86701a
        R.sub(((R.eax >>> 0) & 0xff), 0x6, 8); // 86701a: cmp al, 6
        if (!R.cL) { pc = 15; continue; } // 86701c: jge 0x867020
        pc = 14; continue;
      case 14: // 86701e
        R.edx = ((R.edx & 0xffffff00) | (((R.incdec(((R.edx >>> 0) & 0xff), -1, 8)) & 0xff) << 0)) | 0; // 86701e: dec dl
        pc = 15; continue;
      case 15: // 867020
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x5d) | 0) >>> 0)) & 0xff) << 0)) | 0; // 867020: mov al, byte ptr [esi + 0x5d]
        R.sub(((R.eax >>> 0) & 0xff), 0x1, 8); // 867023: cmp al, 1
        R.m.w8(((R.esp + 0x12) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 867025: mov byte ptr [esp + 0x12], al
        if (!R.zf) { pc = 17; continue; } // 867029: jne 0x86702e
        pc = 16; continue;
      case 16: // 86702b
        R.edx = ((R.edx & 0xffffff00) | (((R.add(((R.edx >>> 0) & 0xff), 0xfe, 8)) & 0xff) << 0)) | 0; // 86702b: add dl, 0xfe
        pc = 17; continue;
      default: return pc;
    }
  }
}
function f_866f60_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 17: // 86702e
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edi + 0x44) | 0) >>> 0)) & 0xff) << 0)) | 0; // 86702e: mov al, byte ptr [edi + 0x44]
        R.sub(((R.eax >>> 0) & 0xff), 0x4b, 8); // 867031: cmp al, 0x4b
        R.m.w8(((R.esp + 0x13) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 867033: mov byte ptr [esp + 0x13], al
        if (R.cLE) { pc = 19; continue; } // 867037: jle 0x86703e
        pc = 18; continue;
      case 18: // 867039
        R.edx = ((R.edx & 0xffffff00) | (((R.add(((R.edx >>> 0) & 0xff), 0xa, 8)) & 0xff) << 0)) | 0; // 867039: add dl, 0xa
        pc = 23; continue; // 86703c: jmp 0x86704e
      case 19: // 86703e
        R.sub(((R.eax >>> 0) & 0xff), 0x32, 8); // 86703e: cmp al, 0x32
        if (R.cLE) { pc = 21; continue; } // 867040: jle 0x867047
        pc = 20; continue;
      case 20: // 867042
        R.edx = ((R.edx & 0xffffff00) | (((R.add(((R.edx >>> 0) & 0xff), 0x5, 8)) & 0xff) << 0)) | 0; // 867042: add dl, 5
        pc = 23; continue; // 867045: jmp 0x86704e
      case 21: // 867047
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 867047: test al, al
        if (R.cLE) { pc = 23; continue; } // 867049: jle 0x86704e
        pc = 22; continue;
      case 22: // 86704b
        R.edx = ((R.edx & 0xffffff00) | (((R.add(((R.edx >>> 0) & 0xff), 0x2, 8)) & 0xff) << 0)) | 0; // 86704b: add dl, 2
        pc = 23; continue;
      case 23: // 86704e
        R.eax = (R.m.u32(((R.esi + 0x61) | 0) >>> 0)) | 0; // 86704e: mov eax, dword ptr [esi + 0x61]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 867051: test eax, eax
        if (R.zf) { pc = 28; continue; } // 867053: je 0x86706d
        pc = 24; continue;
      case 24: // 867055
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.eax + 0xb) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 867055: mov ax, word ptr [eax + 0xb]
        R.sub(((R.eax >>> 0) & 0xffff), 0x1c52, 16); // 867059: cmp ax, 0x1c52
        if (R.cLE) { pc = 26; continue; } // 86705d: jle 0x867064
        pc = 25; continue;
      case 25: // 86705f
        R.edx = ((R.edx & 0xffffff00) | (((R.add(((R.edx >>> 0) & 0xff), 0xfb, 8)) & 0xff) << 0)) | 0; // 86705f: add dl, 0xfb
        pc = 28; continue; // 867062: jmp 0x86706d
      case 26: // 867064
        R.sub(((R.eax >>> 0) & 0xffff), 0x1676, 16); // 867064: cmp ax, 0x1676
        if (R.cLE) { pc = 28; continue; } // 867068: jle 0x86706d
        pc = 27; continue;
      case 27: // 86706a
        R.edx = ((R.edx & 0xffffff00) | (((R.add(((R.edx >>> 0) & 0xff), 0xfd, 8)) & 0xff) << 0)) | 0; // 86706a: add dl, 0xfd
        pc = 28; continue;
      case 28: // 86706d
        R.logic(R.m.u32(((R.esp + 0x14) | 0) >>> 0) & 0x20000, 32); // 86706d: test dword ptr [esp + 0x14], 0x20000
        if (R.zf) { pc = 30; continue; } // 867075: je 0x867079
        pc = 29; continue;
      case 29: // 867077
        R.ecx = ((R.ecx & 0xffffff00) | (((0x1) & 0xff) << 0)) | 0; // 867077: mov cl, 1
        pc = 30; continue;
      case 30: // 867079
        R.logic(R.m.u32(((R.esp + 0x14) | 0) >>> 0) & 0x40000, 32); // 867079: test dword ptr [esp + 0x14], 0x40000
        if (R.zf) { pc = 32; continue; } // 867081: je 0x867085
        pc = 31; continue;
      case 31: // 867083
        R.ecx = ((R.ecx & 0xffffff00) | (((R.incdec(((R.ecx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 867083: inc cl
        pc = 32; continue;
      default: return pc;
    }
  }
}
function f_866f60_3(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 32: // 867085
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 867085: mov eax, dword ptr [esp + 0x14]
        R.eax = (R.logic((R.eax >>> 0) & 0x1000002, 32)) | 0; // 867089: and eax, 0x1000002
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.eax >>> 0)); // 86708e: mov dword ptr [esp + 0x18], eax
        if (R.zf) { pc = 34; continue; } // 867092: je 0x867096
        pc = 33; continue;
      case 33: // 867094
        R.ecx = ((R.ecx & 0xffffff00) | (((R.incdec(((R.ecx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 867094: inc cl
        pc = 34; continue;
      case 34: // 867096
        R.logic(R.m.u32(((R.esp + 0x14) | 0) >>> 0) & 0x200600, 32); // 867096: test dword ptr [esp + 0x14], 0x200600
        if (R.zf) { pc = 36; continue; } // 86709e: je 0x8670a2
        pc = 35; continue;
      case 35: // 8670a0
        R.ecx = ((R.ecx & 0xffffff00) | (((R.incdec(((R.ecx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 8670a0: inc cl
        pc = 36; continue;
      case 36: // 8670a2
        R.logic(R.m.u32(((R.esp + 0x14) | 0) >>> 0) & 0x2840, 32); // 8670a2: test dword ptr [esp + 0x14], 0x2840
        if (R.zf) { pc = 38; continue; } // 8670aa: je 0x8670ae
        pc = 37; continue;
      case 37: // 8670ac
        R.ecx = ((R.ecx & 0xffffff00) | (((R.incdec(((R.ecx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 8670ac: inc cl
        pc = 38; continue;
      case 38: // 8670ae
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 8670ae: mov eax, dword ptr [esp + 0x14]
        R.logic(((R.eax >>> 0) & 0xff) & 0x14, 8); // 8670b2: test al, 0x14
        if (R.zf) { pc = 40; continue; } // 8670b4: je 0x8670b8
        pc = 39; continue;
      case 39: // 8670b6
        R.ecx = ((R.ecx & 0xffffff00) | (((R.incdec(((R.ecx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 8670b6: inc cl
        pc = 40; continue;
      case 40: // 8670b8
        R.ebp = (R.m.u32(((R.edi + 0x40) | 0) >>> 0)) | 0; // 8670b8: mov ebp, dword ptr [edi + 0x40]
        R.ebp = (R.logic((R.ebp >>> 0) & 0x8, 32)) | 0; // 8670bb: and ebp, 8
        if (!R.zf) { pc = 42; continue; } // 8670be: jne 0x8670c7
        pc = 41; continue;
      case 41: // 8670c0
        R.logic((R.eax >>> 0) & 0x4582208, 32); // 8670c0: test eax, 0x4582208
        if (R.zf) { pc = 43; continue; } // 8670c5: je 0x8670c9
        pc = 42; continue;
      case 42: // 8670c7
        R.ecx = ((R.ecx & 0xffffff00) | (((R.incdec(((R.ecx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 8670c7: inc cl
        pc = 43; continue;
      case 43: // 8670c9
        R.sub(((R.ecx >>> 0) & 0xff), 0x1, 8); // 8670c9: cmp cl, 1
        if (R.cLE) { pc = 54; continue; } // 8670cc: jle 0x867107
        pc = 44; continue;
      case 44: // 8670ce
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x10) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8670ce: mov al, byte ptr [esp + 0x10]
        R.edx = ((R.edx & 0xffffff00) | (((R.add(((R.edx >>> 0) & 0xff), 0xfd, 8)) & 0xff) << 0)) | 0; // 8670d2: add dl, 0xfd
        R.sub(((R.eax >>> 0) & 0xff), 0x6, 8); // 8670d5: cmp al, 6
        if (!R.cL) { pc = 46; continue; } // 8670d7: jge 0x8670db
        pc = 45; continue;
      case 45: // 8670d9
        R.edx = ((R.edx & 0xffffff00) | (((R.sub(((R.edx >>> 0) & 0xff), ((R.ecx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 8670d9: sub dl, cl
        pc = 46; continue;
      case 46: // 8670db
        R.sub(R.m.u8(((R.esp + 0x12) | 0) >>> 0), 0x6, 8); // 8670db: cmp byte ptr [esp + 0x12], 6
        if (!R.cL) { pc = 48; continue; } // 8670e0: jge 0x8670e4
        pc = 47; continue;
      default: return pc;
    }
  }
}
function f_866f60_4(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 47: // 8670e2
        R.edx = ((R.edx & 0xffffff00) | (((R.sub(((R.edx >>> 0) & 0xff), ((R.ecx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 8670e2: sub dl, cl
        pc = 48; continue;
      case 48: // 8670e4
        R.sub(((R.ebx >>> 0) & 0xff), 0x1, 8); // 8670e4: cmp bl, 1
        if (!R.zf) { pc = 50; continue; } // 8670e7: jne 0x8670f3
        pc = 49; continue;
      case 49: // 8670e9
        R.eax = ((R.eax & 0xffffff00) | (((((R.ecx >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 8670e9: mov al, cl
        R.ebx = ((R.ebx & 0xffffff00) | (((0xfe) & 0xff) << 0)) | 0; // 8670eb: mov bl, 0xfe
        { const p = ((R.eax << 24) >> 24) * ((((R.ebx >>> 0) & 0xff)) << 24 >> 24); R.eax = ((R.eax & 0xffff0000) | (p & 0xffff)) | 0; R.cf = R.of = ((p << 24) >> 24) !== p; } // 8670ed: imul bl
        R.edx = ((R.edx & 0xffffff00) | (((R.add(((R.edx >>> 0) & 0xff), ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 8670ef: add dl, al
        pc = 52; continue; // 8670f1: jmp 0x8670fa
      case 50: // 8670f3
        R.sub(((R.ebx >>> 0) & 0xff), 0x6, 8); // 8670f3: cmp bl, 6
        if (!R.cL) { pc = 52; continue; } // 8670f6: jge 0x8670fa
        pc = 51; continue;
      case 51: // 8670f8
        R.edx = ((R.edx & 0xffffff00) | (((R.sub(((R.edx >>> 0) & 0xff), ((R.ecx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 8670f8: sub dl, cl
        pc = 52; continue;
      case 52: // 8670fa
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x5a) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8670fa: mov al, byte ptr [esi + 0x5a]
        R.sub(((R.eax >>> 0) & 0xff), 0x6, 8); // 8670fd: cmp al, 6
        R.m.w8(((R.esp + 0x11) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 8670ff: mov byte ptr [esp + 0x11], al
        if (!R.cL) { pc = 54; continue; } // 867103: jge 0x867107
        pc = 53; continue;
      case 53: // 867105
        R.edx = ((R.edx & 0xffffff00) | (((R.sub(((R.edx >>> 0) & 0xff), ((R.ecx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 867105: sub dl, cl
        pc = 54; continue;
      case 54: // 867107
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x59) | 0) >>> 0)) & 0xff) << 0)) | 0; // 867107: mov al, byte ptr [esi + 0x59]
        R.sub(((R.eax >>> 0) & 0xff), 0xf, 8); // 86710a: cmp al, 0xf
        if (!R.cL) { pc = 57; continue; } // 86710c: jge 0x867121
        pc = 55; continue;
      case 55: // 86710e
        R.logic(R.m.u8(((R.edi + 0x4e) | 0) >>> 0) & 0x1, 8); // 86710e: test byte ptr [edi + 0x4e], 1
        if (R.zf) { pc = 57; continue; } // 867112: je 0x867121
        pc = 56; continue;
      case 56: // 867114
        R.edi = (R.pop()) | 0; // 867114: pop edi
        R.esi = (R.pop()) | 0; // 867115: pop esi
        R.ebp = (R.pop()) | 0; // 867116: pop ebp
        R.eax = (0x1) | 0; // 867117: mov eax, 1
        R.ebx = (R.pop()) | 0; // 86711c: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 86711d: add esp, 0xc
        R.rv = R.ret(0); return -1; // 867120: ret 
      case 57: // 867121
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 867121: mov ecx, dword ptr [esp + 0x18]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 867125: test ecx, ecx
        if (R.zf) { pc = 61; continue; } // 867127: je 0x86713f
        pc = 58; continue;
      case 58: // 867129
        R.sub(((R.eax >>> 0) & 0xff), 0xa, 8); // 867129: cmp al, 0xa
        if (!R.cL) { pc = 61; continue; } // 86712b: jge 0x86713f
        pc = 59; continue;
      case 59: // 86712d
        R.sub(((R.edx >>> 0) & 0xff), 0x19, 8); // 86712d: cmp dl, 0x19
        if (!R.cL) { pc = 61; continue; } // 867130: jge 0x86713f
        pc = 60; continue;
      default: return pc;
    }
  }
}
function f_866f60_5(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 60: // 867132
        R.edi = (R.pop()) | 0; // 867132: pop edi
        R.esi = (R.pop()) | 0; // 867133: pop esi
        R.ebp = (R.pop()) | 0; // 867134: pop ebp
        R.eax = (0x1) | 0; // 867135: mov eax, 1
        R.ebx = (R.pop()) | 0; // 86713a: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 86713b: add esp, 0xc
        R.rv = R.ret(0); return -1; // 86713e: ret 
      case 61: // 86713f
        R.ecx = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 86713f: mov ecx, dword ptr [esp + 0x14]
        R.logic((R.ecx >>> 0) & 0x20020, 32); // 867143: test ecx, 0x20020
        if (R.zf) { pc = 64; continue; } // 867149: je 0x86715d
        pc = 62; continue;
      case 62: // 86714b
        R.sub(((R.edx >>> 0) & 0xff), 0x19, 8); // 86714b: cmp dl, 0x19
        if (!R.cL) { pc = 64; continue; } // 86714e: jge 0x86715d
        pc = 63; continue;
      case 63: // 867150
        R.edi = (R.pop()) | 0; // 867150: pop edi
        R.esi = (R.pop()) | 0; // 867151: pop esi
        R.ebp = (R.pop()) | 0; // 867152: pop ebp
        R.eax = (0x1) | 0; // 867153: mov eax, 1
        R.ebx = (R.pop()) | 0; // 867158: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 867159: add esp, 0xc
        R.rv = R.ret(0); return -1; // 86715c: ret 
      case 64: // 86715d
        R.logic(((R.ecx >>> 8) & 0xff) & 0x2, 8); // 86715d: test ch, 2
        if (R.zf) { pc = 67; continue; } // 867160: je 0x867174
        pc = 65; continue;
      case 65: // 867162
        R.sub(((R.edx >>> 0) & 0xff), 0x12, 8); // 867162: cmp dl, 0x12
        if (!R.cL) { pc = 67; continue; } // 867165: jge 0x867174
        pc = 66; continue;
      case 66: // 867167
        R.edi = (R.pop()) | 0; // 867167: pop edi
        R.esi = (R.pop()) | 0; // 867168: pop esi
        R.ebp = (R.pop()) | 0; // 867169: pop ebp
        R.eax = (0x1) | 0; // 86716a: mov eax, 1
        R.ebx = (R.pop()) | 0; // 86716f: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 867170: add esp, 0xc
        R.rv = R.ret(0); return -1; // 867173: ret 
      case 67: // 867174
        R.logic(((R.ecx >>> 0) & 0xff) & 0x4, 8); // 867174: test cl, 4
        if (R.zf) { pc = 71; continue; } // 867177: je 0x867193
        pc = 68; continue;
      case 68: // 867179
        R.sub(R.m.u8(((R.esi + 0x57) | 0) >>> 0), 0xf, 8); // 867179: cmp byte ptr [esi + 0x57], 0xf
        if (R.cLE) { pc = 71; continue; } // 86717d: jle 0x867193
        pc = 69; continue;
      case 69: // 86717f
        R.sub(R.m.u8(((R.esp + 0x10) | 0) >>> 0), 0xa, 8); // 86717f: cmp byte ptr [esp + 0x10], 0xa
        if (!R.cL) { pc = 71; continue; } // 867184: jge 0x867193
        pc = 70; continue;
      default: return pc;
    }
  }
}
function f_866f60_6(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 70: // 867186
        R.edi = (R.pop()) | 0; // 867186: pop edi
        R.esi = (R.pop()) | 0; // 867187: pop esi
        R.ebp = (R.pop()) | 0; // 867188: pop ebp
        R.eax = (0x1) | 0; // 867189: mov eax, 1
        R.ebx = (R.pop()) | 0; // 86718e: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 86718f: add esp, 0xc
        R.rv = R.ret(0); return -1; // 867192: ret 
      case 71: // 867193
        R.logic((R.ecx >>> 0) & 0x2808, 32); // 867193: test ecx, 0x2808
        if (R.zf) { pc = 76; continue; } // 867199: je 0x8671b8
        pc = 72; continue;
      case 72: // 86719b
        R.sub(((R.eax >>> 0) & 0xff), 0xa, 8); // 86719b: cmp al, 0xa
        if (!R.cL) { pc = 76; continue; } // 86719d: jge 0x8671b8
        pc = 73; continue;
      case 73: // 86719f
        R.sub(R.m.u8(((R.esp + 0x11) | 0) >>> 0), 0x6, 8); // 86719f: cmp byte ptr [esp + 0x11], 6
        if (!R.cL) { pc = 76; continue; } // 8671a4: jge 0x8671b8
        pc = 74; continue;
      case 74: // 8671a6
        R.sub(((R.edx >>> 0) & 0xff), 0x1e, 8); // 8671a6: cmp dl, 0x1e
        if (!R.cL) { pc = 76; continue; } // 8671a9: jge 0x8671b8
        pc = 75; continue;
      case 75: // 8671ab
        R.edi = (R.pop()) | 0; // 8671ab: pop edi
        R.esi = (R.pop()) | 0; // 8671ac: pop esi
        R.ebp = (R.pop()) | 0; // 8671ad: pop ebp
        R.eax = (0x1) | 0; // 8671ae: mov eax, 1
        R.ebx = (R.pop()) | 0; // 8671b3: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 8671b4: add esp, 0xc
        R.rv = R.ret(0); return -1; // 8671b7: ret 
      case 76: // 8671b8
        R.logic((R.ecx >>> 0) & 0x82200, 32); // 8671b8: test ecx, 0x82200
        if (!R.zf) { pc = 78; continue; } // 8671be: jne 0x8671c4
        pc = 77; continue;
      case 77: // 8671c0
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 8671c0: test ebp, ebp
        if (R.zf) { pc = 81; continue; } // 8671c2: je 0x8671dd
        pc = 78; continue;
      case 78: // 8671c4
        R.sub(R.m.u8(((R.esp + 0x10) | 0) >>> 0), 0xa, 8); // 8671c4: cmp byte ptr [esp + 0x10], 0xa
        if (!R.cL) { pc = 81; continue; } // 8671c9: jge 0x8671dd
        pc = 79; continue;
      case 79: // 8671cb
        R.sub(((R.edx >>> 0) & 0xff), 0x14, 8); // 8671cb: cmp dl, 0x14
        if (!R.cL) { pc = 81; continue; } // 8671ce: jge 0x8671dd
        pc = 80; continue;
      case 80: // 8671d0
        R.edi = (R.pop()) | 0; // 8671d0: pop edi
        R.esi = (R.pop()) | 0; // 8671d1: pop esi
        R.ebp = (R.pop()) | 0; // 8671d2: pop ebp
        R.eax = (0x1) | 0; // 8671d3: mov eax, 1
        R.ebx = (R.pop()) | 0; // 8671d8: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 8671d9: add esp, 0xc
        R.rv = R.ret(0); return -1; // 8671dc: ret 
      case 81: // 8671dd
        R.logic(((R.ecx >>> 0) & 0xff) & 0x1, 8); // 8671dd: test cl, 1
        if (R.zf) { pc = 83; continue; } // 8671e0: je 0x8671ef
        pc = 82; continue;
      default: return pc;
    }
  }
}
function f_866f60_7(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 82: // 8671e2
        R.edi = (R.pop()) | 0; // 8671e2: pop edi
        R.esi = (R.pop()) | 0; // 8671e3: pop esi
        R.ebp = (R.pop()) | 0; // 8671e4: pop ebp
        R.eax = (0x1) | 0; // 8671e5: mov eax, 1
        R.ebx = (R.pop()) | 0; // 8671ea: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 8671eb: add esp, 0xc
        R.rv = R.ret(0); return -1; // 8671ee: ret 
      case 83: // 8671ef
        R.logic(((R.ecx >>> 0) & 0xff) & 0x10, 8); // 8671ef: test cl, 0x10
        if (R.zf) { pc = 85; continue; } // 8671f2: je 0x867201
        pc = 84; continue;
      case 84: // 8671f4
        R.edi = (R.pop()) | 0; // 8671f4: pop edi
        R.esi = (R.pop()) | 0; // 8671f5: pop esi
        R.ebp = (R.pop()) | 0; // 8671f6: pop ebp
        R.eax = (0x1) | 0; // 8671f7: mov eax, 1
        R.ebx = (R.pop()) | 0; // 8671fc: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 8671fd: add esp, 0xc
        R.rv = R.ret(0); return -1; // 867200: ret 
      case 85: // 867201
        R.logic(((R.ecx >>> 8) & 0xff) & 0x1, 8); // 867201: test ch, 1
        if (R.zf) { pc = 87; continue; } // 867204: je 0x867213
        pc = 86; continue;
      case 86: // 867206
        R.edi = (R.pop()) | 0; // 867206: pop edi
        R.esi = (R.pop()) | 0; // 867207: pop esi
        R.ebp = (R.pop()) | 0; // 867208: pop ebp
        R.eax = (0x1) | 0; // 867209: mov eax, 1
        R.ebx = (R.pop()) | 0; // 86720e: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 86720f: add esp, 0xc
        R.rv = R.ret(0); return -1; // 867212: ret 
      case 87: // 867213
        R.edx = (((R.m.u8(((R.esp + 0x13) | 0) >>> 0)) << 24 >> 24)) | 0; // 867213: movsx edx, byte ptr [esp + 0x13]
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 867218: movsx eax, al
        R.ecx = (0xffffffba) | 0; // 86721b: mov ecx, 0xffffffba
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 867220: sub ecx, eax
        R.sub((R.edx >>> 0), (R.ecx >>> 0), 32); // 867222: cmp edx, ecx
        if (!R.cL) { pc = 89; continue; } // 867224: jge 0x867233
        pc = 88; continue;
      case 88: // 867226
        R.edi = (R.pop()) | 0; // 867226: pop edi
        R.esi = (R.pop()) | 0; // 867227: pop esi
        R.ebp = (R.pop()) | 0; // 867228: pop ebp
        R.eax = (0x1) | 0; // 867229: mov eax, 1
        R.ebx = (R.pop()) | 0; // 86722e: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 86722f: add esp, 0xc
        R.rv = R.ret(0); return -1; // 867232: ret 
      case 89: // 867233
        R.edi = (R.pop()) | 0; // 867233: pop edi
        R.esi = (R.pop()) | 0; // 867234: pop esi
        R.ebp = (R.pop()) | 0; // 867235: pop ebp
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 867236: xor eax, eax
        R.ebx = (R.pop()) | 0; // 867238: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 867239: add esp, 0xc
        R.rv = R.ret(0); return -1; // 86723c: ret 
      default: return pc;
    }
  }
}
export function f_866f60(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 90) throw new Error(`f_866f60: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_866f60_0(R, pc); break;
      case 1: np = f_866f60_1(R, pc); break;
      case 2: np = f_866f60_2(R, pc); break;
      case 3: np = f_866f60_3(R, pc); break;
      case 4: np = f_866f60_4(R, pc); break;
      case 5: np = f_866f60_5(R, pc); break;
      case 6: np = f_866f60_6(R, pc); break;
      case 7: np = f_866f60_7(R, pc); break;
      default: throw new Error(`f_866f60: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_866f60: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_866f60.shared = true;
