// 0x866f60 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_866f60(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x866f60;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x866f60:
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
        if (R.zf) { pc = 0x866fa7; continue; } // 866f9d: je 0x866fa7
        pc = 0x866f9f; continue;
      case 0x866f9f:
        R.sub((R.esi >>> 0), (R.edx >>> 0), 32); // 866f9f: cmp esi, edx
        if (R.zf) { pc = 0x867233; continue; } // 866fa1: je 0x867233
        pc = 0x866fa7; continue;
      case 0x866fa7:
        R.eax = (R.m.u32(((R.eax + 0xd3) | 0) >>> 0)) | 0; // 866fa7: mov eax, dword ptr [eax + 0xd3]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 866fad: test eax, eax
        if (R.zf) { pc = 0x866fb9; continue; } // 866faf: je 0x866fb9
        pc = 0x866fb1; continue;
      case 0x866fb1:
        R.sub((R.esi >>> 0), (R.eax >>> 0), 32); // 866fb1: cmp esi, eax
        if (R.zf) { pc = 0x867233; continue; } // 866fb3: je 0x867233
        pc = 0x866fb9; continue;
      case 0x866fb9:
        R.eax = (R.m.u32(((R.edi + 0x45) | 0) >>> 0)) | 0; // 866fb9: mov eax, dword ptr [edi + 0x45]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 866fbc: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.eax >>> 0)); // 866fbe: mov dword ptr [esp + 0x14], eax
        if (R.zf) { pc = 0x867233; continue; } // 866fc2: je 0x867233
        pc = 0x866fc8; continue;
      case 0x866fc8:
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
        if (!R.zf) { pc = 0x866ffc; continue; } // 866ff7: jne 0x866ffc
        pc = 0x866ff9; continue;
      case 0x866ff9:
        R.edx = ((R.edx & 0xffffff00) | (((R.add(((R.edx >>> 0) & 0xff), 0xfe, 8)) & 0xff) << 0)) | 0; // 866ff9: add dl, 0xfe
        pc = 0x866ffc; continue;
      case 0x866ffc:
        R.sub(((R.ebx >>> 0) & 0xff), 0x1, 8); // 866ffc: cmp bl, 1
        if (!R.zf) { pc = 0x867006; continue; } // 866fff: jne 0x867006
        pc = 0x867001; continue;
      case 0x867001:
        R.edx = ((R.edx & 0xffffff00) | (((R.add(((R.edx >>> 0) & 0xff), 0xfd, 8)) & 0xff) << 0)) | 0; // 867001: add dl, 0xfd
        pc = 0x86700d; continue; // 867004: jmp 0x86700d
      case 0x867006:
        R.sub(((R.ebx >>> 0) & 0xff), 0x6, 8); // 867006: cmp bl, 6
        if (!R.cL) { pc = 0x86700d; continue; } // 867009: jge 0x86700d
        pc = 0x86700b; continue;
      case 0x86700b:
        R.edx = ((R.edx & 0xffffff00) | (((R.incdec(((R.edx >>> 0) & 0xff), -1, 8)) & 0xff) << 0)) | 0; // 86700b: dec dl
        pc = 0x86700d; continue;
      case 0x86700d:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x10) | 0) >>> 0)) & 0xff) << 0)) | 0; // 86700d: mov al, byte ptr [esp + 0x10]
        R.sub(((R.eax >>> 0) & 0xff), 0x1, 8); // 867011: cmp al, 1
        if (!R.zf) { pc = 0x86701a; continue; } // 867013: jne 0x86701a
        pc = 0x867015; continue;
      case 0x867015:
        R.edx = ((R.edx & 0xffffff00) | (((R.add(((R.edx >>> 0) & 0xff), 0xfd, 8)) & 0xff) << 0)) | 0; // 867015: add dl, 0xfd
        pc = 0x867020; continue; // 867018: jmp 0x867020
      case 0x86701a:
        R.sub(((R.eax >>> 0) & 0xff), 0x6, 8); // 86701a: cmp al, 6
        if (!R.cL) { pc = 0x867020; continue; } // 86701c: jge 0x867020
        pc = 0x86701e; continue;
      case 0x86701e:
        R.edx = ((R.edx & 0xffffff00) | (((R.incdec(((R.edx >>> 0) & 0xff), -1, 8)) & 0xff) << 0)) | 0; // 86701e: dec dl
        pc = 0x867020; continue;
      case 0x867020:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x5d) | 0) >>> 0)) & 0xff) << 0)) | 0; // 867020: mov al, byte ptr [esi + 0x5d]
        R.sub(((R.eax >>> 0) & 0xff), 0x1, 8); // 867023: cmp al, 1
        R.m.w8(((R.esp + 0x12) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 867025: mov byte ptr [esp + 0x12], al
        if (!R.zf) { pc = 0x86702e; continue; } // 867029: jne 0x86702e
        pc = 0x86702b; continue;
      case 0x86702b:
        R.edx = ((R.edx & 0xffffff00) | (((R.add(((R.edx >>> 0) & 0xff), 0xfe, 8)) & 0xff) << 0)) | 0; // 86702b: add dl, 0xfe
        pc = 0x86702e; continue;
      case 0x86702e:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edi + 0x44) | 0) >>> 0)) & 0xff) << 0)) | 0; // 86702e: mov al, byte ptr [edi + 0x44]
        R.sub(((R.eax >>> 0) & 0xff), 0x4b, 8); // 867031: cmp al, 0x4b
        R.m.w8(((R.esp + 0x13) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 867033: mov byte ptr [esp + 0x13], al
        if (R.cLE) { pc = 0x86703e; continue; } // 867037: jle 0x86703e
        pc = 0x867039; continue;
      case 0x867039:
        R.edx = ((R.edx & 0xffffff00) | (((R.add(((R.edx >>> 0) & 0xff), 0xa, 8)) & 0xff) << 0)) | 0; // 867039: add dl, 0xa
        pc = 0x86704e; continue; // 86703c: jmp 0x86704e
      case 0x86703e:
        R.sub(((R.eax >>> 0) & 0xff), 0x32, 8); // 86703e: cmp al, 0x32
        if (R.cLE) { pc = 0x867047; continue; } // 867040: jle 0x867047
        pc = 0x867042; continue;
      case 0x867042:
        R.edx = ((R.edx & 0xffffff00) | (((R.add(((R.edx >>> 0) & 0xff), 0x5, 8)) & 0xff) << 0)) | 0; // 867042: add dl, 5
        pc = 0x86704e; continue; // 867045: jmp 0x86704e
      case 0x867047:
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 867047: test al, al
        if (R.cLE) { pc = 0x86704e; continue; } // 867049: jle 0x86704e
        pc = 0x86704b; continue;
      case 0x86704b:
        R.edx = ((R.edx & 0xffffff00) | (((R.add(((R.edx >>> 0) & 0xff), 0x2, 8)) & 0xff) << 0)) | 0; // 86704b: add dl, 2
        pc = 0x86704e; continue;
      case 0x86704e:
        R.eax = (R.m.u32(((R.esi + 0x61) | 0) >>> 0)) | 0; // 86704e: mov eax, dword ptr [esi + 0x61]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 867051: test eax, eax
        if (R.zf) { pc = 0x86706d; continue; } // 867053: je 0x86706d
        pc = 0x867055; continue;
      case 0x867055:
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.eax + 0xb) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 867055: mov ax, word ptr [eax + 0xb]
        R.sub(((R.eax >>> 0) & 0xffff), 0x1c52, 16); // 867059: cmp ax, 0x1c52
        if (R.cLE) { pc = 0x867064; continue; } // 86705d: jle 0x867064
        pc = 0x86705f; continue;
      case 0x86705f:
        R.edx = ((R.edx & 0xffffff00) | (((R.add(((R.edx >>> 0) & 0xff), 0xfb, 8)) & 0xff) << 0)) | 0; // 86705f: add dl, 0xfb
        pc = 0x86706d; continue; // 867062: jmp 0x86706d
      case 0x867064:
        R.sub(((R.eax >>> 0) & 0xffff), 0x1676, 16); // 867064: cmp ax, 0x1676
        if (R.cLE) { pc = 0x86706d; continue; } // 867068: jle 0x86706d
        pc = 0x86706a; continue;
      case 0x86706a:
        R.edx = ((R.edx & 0xffffff00) | (((R.add(((R.edx >>> 0) & 0xff), 0xfd, 8)) & 0xff) << 0)) | 0; // 86706a: add dl, 0xfd
        pc = 0x86706d; continue;
      case 0x86706d:
        R.logic(R.m.u32(((R.esp + 0x14) | 0) >>> 0) & 0x20000, 32); // 86706d: test dword ptr [esp + 0x14], 0x20000
        if (R.zf) { pc = 0x867079; continue; } // 867075: je 0x867079
        pc = 0x867077; continue;
      case 0x867077:
        R.ecx = ((R.ecx & 0xffffff00) | (((0x1) & 0xff) << 0)) | 0; // 867077: mov cl, 1
        pc = 0x867079; continue;
      case 0x867079:
        R.logic(R.m.u32(((R.esp + 0x14) | 0) >>> 0) & 0x40000, 32); // 867079: test dword ptr [esp + 0x14], 0x40000
        if (R.zf) { pc = 0x867085; continue; } // 867081: je 0x867085
        pc = 0x867083; continue;
      case 0x867083:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.incdec(((R.ecx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 867083: inc cl
        pc = 0x867085; continue;
      case 0x867085:
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 867085: mov eax, dword ptr [esp + 0x14]
        R.eax = (R.logic((R.eax >>> 0) & 0x1000002, 32)) | 0; // 867089: and eax, 0x1000002
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.eax >>> 0)); // 86708e: mov dword ptr [esp + 0x18], eax
        if (R.zf) { pc = 0x867096; continue; } // 867092: je 0x867096
        pc = 0x867094; continue;
      case 0x867094:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.incdec(((R.ecx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 867094: inc cl
        pc = 0x867096; continue;
      case 0x867096:
        R.logic(R.m.u32(((R.esp + 0x14) | 0) >>> 0) & 0x200600, 32); // 867096: test dword ptr [esp + 0x14], 0x200600
        if (R.zf) { pc = 0x8670a2; continue; } // 86709e: je 0x8670a2
        pc = 0x8670a0; continue;
      case 0x8670a0:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.incdec(((R.ecx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 8670a0: inc cl
        pc = 0x8670a2; continue;
      case 0x8670a2:
        R.logic(R.m.u32(((R.esp + 0x14) | 0) >>> 0) & 0x2840, 32); // 8670a2: test dword ptr [esp + 0x14], 0x2840
        if (R.zf) { pc = 0x8670ae; continue; } // 8670aa: je 0x8670ae
        pc = 0x8670ac; continue;
      case 0x8670ac:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.incdec(((R.ecx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 8670ac: inc cl
        pc = 0x8670ae; continue;
      case 0x8670ae:
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 8670ae: mov eax, dword ptr [esp + 0x14]
        R.logic(((R.eax >>> 0) & 0xff) & 0x14, 8); // 8670b2: test al, 0x14
        if (R.zf) { pc = 0x8670b8; continue; } // 8670b4: je 0x8670b8
        pc = 0x8670b6; continue;
      case 0x8670b6:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.incdec(((R.ecx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 8670b6: inc cl
        pc = 0x8670b8; continue;
      case 0x8670b8:
        R.ebp = (R.m.u32(((R.edi + 0x40) | 0) >>> 0)) | 0; // 8670b8: mov ebp, dword ptr [edi + 0x40]
        R.ebp = (R.logic((R.ebp >>> 0) & 0x8, 32)) | 0; // 8670bb: and ebp, 8
        if (!R.zf) { pc = 0x8670c7; continue; } // 8670be: jne 0x8670c7
        pc = 0x8670c0; continue;
      case 0x8670c0:
        R.logic((R.eax >>> 0) & 0x4582208, 32); // 8670c0: test eax, 0x4582208
        if (R.zf) { pc = 0x8670c9; continue; } // 8670c5: je 0x8670c9
        pc = 0x8670c7; continue;
      case 0x8670c7:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.incdec(((R.ecx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 8670c7: inc cl
        pc = 0x8670c9; continue;
      case 0x8670c9:
        R.sub(((R.ecx >>> 0) & 0xff), 0x1, 8); // 8670c9: cmp cl, 1
        if (R.cLE) { pc = 0x867107; continue; } // 8670cc: jle 0x867107
        pc = 0x8670ce; continue;
      case 0x8670ce:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x10) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8670ce: mov al, byte ptr [esp + 0x10]
        R.edx = ((R.edx & 0xffffff00) | (((R.add(((R.edx >>> 0) & 0xff), 0xfd, 8)) & 0xff) << 0)) | 0; // 8670d2: add dl, 0xfd
        R.sub(((R.eax >>> 0) & 0xff), 0x6, 8); // 8670d5: cmp al, 6
        if (!R.cL) { pc = 0x8670db; continue; } // 8670d7: jge 0x8670db
        pc = 0x8670d9; continue;
      case 0x8670d9:
        R.edx = ((R.edx & 0xffffff00) | (((R.sub(((R.edx >>> 0) & 0xff), ((R.ecx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 8670d9: sub dl, cl
        pc = 0x8670db; continue;
      case 0x8670db:
        R.sub(R.m.u8(((R.esp + 0x12) | 0) >>> 0), 0x6, 8); // 8670db: cmp byte ptr [esp + 0x12], 6
        if (!R.cL) { pc = 0x8670e4; continue; } // 8670e0: jge 0x8670e4
        pc = 0x8670e2; continue;
      case 0x8670e2:
        R.edx = ((R.edx & 0xffffff00) | (((R.sub(((R.edx >>> 0) & 0xff), ((R.ecx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 8670e2: sub dl, cl
        pc = 0x8670e4; continue;
      case 0x8670e4:
        R.sub(((R.ebx >>> 0) & 0xff), 0x1, 8); // 8670e4: cmp bl, 1
        if (!R.zf) { pc = 0x8670f3; continue; } // 8670e7: jne 0x8670f3
        pc = 0x8670e9; continue;
      case 0x8670e9:
        R.eax = ((R.eax & 0xffffff00) | (((((R.ecx >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 8670e9: mov al, cl
        R.ebx = ((R.ebx & 0xffffff00) | (((0xfe) & 0xff) << 0)) | 0; // 8670eb: mov bl, 0xfe
        { const p = ((R.eax << 24) >> 24) * ((((R.ebx >>> 0) & 0xff)) << 24 >> 24); R.eax = ((R.eax & 0xffff0000) | (p & 0xffff)) | 0; R.cf = R.of = ((p << 24) >> 24) !== p; } // 8670ed: imul bl
        R.edx = ((R.edx & 0xffffff00) | (((R.add(((R.edx >>> 0) & 0xff), ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 8670ef: add dl, al
        pc = 0x8670fa; continue; // 8670f1: jmp 0x8670fa
      case 0x8670f3:
        R.sub(((R.ebx >>> 0) & 0xff), 0x6, 8); // 8670f3: cmp bl, 6
        if (!R.cL) { pc = 0x8670fa; continue; } // 8670f6: jge 0x8670fa
        pc = 0x8670f8; continue;
      case 0x8670f8:
        R.edx = ((R.edx & 0xffffff00) | (((R.sub(((R.edx >>> 0) & 0xff), ((R.ecx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 8670f8: sub dl, cl
        pc = 0x8670fa; continue;
      case 0x8670fa:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x5a) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8670fa: mov al, byte ptr [esi + 0x5a]
        R.sub(((R.eax >>> 0) & 0xff), 0x6, 8); // 8670fd: cmp al, 6
        R.m.w8(((R.esp + 0x11) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 8670ff: mov byte ptr [esp + 0x11], al
        if (!R.cL) { pc = 0x867107; continue; } // 867103: jge 0x867107
        pc = 0x867105; continue;
      case 0x867105:
        R.edx = ((R.edx & 0xffffff00) | (((R.sub(((R.edx >>> 0) & 0xff), ((R.ecx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 867105: sub dl, cl
        pc = 0x867107; continue;
      case 0x867107:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x59) | 0) >>> 0)) & 0xff) << 0)) | 0; // 867107: mov al, byte ptr [esi + 0x59]
        R.sub(((R.eax >>> 0) & 0xff), 0xf, 8); // 86710a: cmp al, 0xf
        if (!R.cL) { pc = 0x867121; continue; } // 86710c: jge 0x867121
        pc = 0x86710e; continue;
      case 0x86710e:
        R.logic(R.m.u8(((R.edi + 0x4e) | 0) >>> 0) & 0x1, 8); // 86710e: test byte ptr [edi + 0x4e], 1
        if (R.zf) { pc = 0x867121; continue; } // 867112: je 0x867121
        pc = 0x867114; continue;
      case 0x867114:
        R.edi = (R.pop()) | 0; // 867114: pop edi
        R.esi = (R.pop()) | 0; // 867115: pop esi
        R.ebp = (R.pop()) | 0; // 867116: pop ebp
        R.eax = (0x1) | 0; // 867117: mov eax, 1
        R.ebx = (R.pop()) | 0; // 86711c: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 86711d: add esp, 0xc
        return R.ret(0); // 867120: ret 
      case 0x867121:
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 867121: mov ecx, dword ptr [esp + 0x18]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 867125: test ecx, ecx
        if (R.zf) { pc = 0x86713f; continue; } // 867127: je 0x86713f
        pc = 0x867129; continue;
      case 0x867129:
        R.sub(((R.eax >>> 0) & 0xff), 0xa, 8); // 867129: cmp al, 0xa
        if (!R.cL) { pc = 0x86713f; continue; } // 86712b: jge 0x86713f
        pc = 0x86712d; continue;
      case 0x86712d:
        R.sub(((R.edx >>> 0) & 0xff), 0x19, 8); // 86712d: cmp dl, 0x19
        if (!R.cL) { pc = 0x86713f; continue; } // 867130: jge 0x86713f
        pc = 0x867132; continue;
      case 0x867132:
        R.edi = (R.pop()) | 0; // 867132: pop edi
        R.esi = (R.pop()) | 0; // 867133: pop esi
        R.ebp = (R.pop()) | 0; // 867134: pop ebp
        R.eax = (0x1) | 0; // 867135: mov eax, 1
        R.ebx = (R.pop()) | 0; // 86713a: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 86713b: add esp, 0xc
        return R.ret(0); // 86713e: ret 
      case 0x86713f:
        R.ecx = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 86713f: mov ecx, dword ptr [esp + 0x14]
        R.logic((R.ecx >>> 0) & 0x20020, 32); // 867143: test ecx, 0x20020
        if (R.zf) { pc = 0x86715d; continue; } // 867149: je 0x86715d
        pc = 0x86714b; continue;
      case 0x86714b:
        R.sub(((R.edx >>> 0) & 0xff), 0x19, 8); // 86714b: cmp dl, 0x19
        if (!R.cL) { pc = 0x86715d; continue; } // 86714e: jge 0x86715d
        pc = 0x867150; continue;
      case 0x867150:
        R.edi = (R.pop()) | 0; // 867150: pop edi
        R.esi = (R.pop()) | 0; // 867151: pop esi
        R.ebp = (R.pop()) | 0; // 867152: pop ebp
        R.eax = (0x1) | 0; // 867153: mov eax, 1
        R.ebx = (R.pop()) | 0; // 867158: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 867159: add esp, 0xc
        return R.ret(0); // 86715c: ret 
      case 0x86715d:
        R.logic(((R.ecx >>> 8) & 0xff) & 0x2, 8); // 86715d: test ch, 2
        if (R.zf) { pc = 0x867174; continue; } // 867160: je 0x867174
        pc = 0x867162; continue;
      case 0x867162:
        R.sub(((R.edx >>> 0) & 0xff), 0x12, 8); // 867162: cmp dl, 0x12
        if (!R.cL) { pc = 0x867174; continue; } // 867165: jge 0x867174
        pc = 0x867167; continue;
      case 0x867167:
        R.edi = (R.pop()) | 0; // 867167: pop edi
        R.esi = (R.pop()) | 0; // 867168: pop esi
        R.ebp = (R.pop()) | 0; // 867169: pop ebp
        R.eax = (0x1) | 0; // 86716a: mov eax, 1
        R.ebx = (R.pop()) | 0; // 86716f: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 867170: add esp, 0xc
        return R.ret(0); // 867173: ret 
      case 0x867174:
        R.logic(((R.ecx >>> 0) & 0xff) & 0x4, 8); // 867174: test cl, 4
        if (R.zf) { pc = 0x867193; continue; } // 867177: je 0x867193
        pc = 0x867179; continue;
      case 0x867179:
        R.sub(R.m.u8(((R.esi + 0x57) | 0) >>> 0), 0xf, 8); // 867179: cmp byte ptr [esi + 0x57], 0xf
        if (R.cLE) { pc = 0x867193; continue; } // 86717d: jle 0x867193
        pc = 0x86717f; continue;
      case 0x86717f:
        R.sub(R.m.u8(((R.esp + 0x10) | 0) >>> 0), 0xa, 8); // 86717f: cmp byte ptr [esp + 0x10], 0xa
        if (!R.cL) { pc = 0x867193; continue; } // 867184: jge 0x867193
        pc = 0x867186; continue;
      case 0x867186:
        R.edi = (R.pop()) | 0; // 867186: pop edi
        R.esi = (R.pop()) | 0; // 867187: pop esi
        R.ebp = (R.pop()) | 0; // 867188: pop ebp
        R.eax = (0x1) | 0; // 867189: mov eax, 1
        R.ebx = (R.pop()) | 0; // 86718e: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 86718f: add esp, 0xc
        return R.ret(0); // 867192: ret 
      case 0x867193:
        R.logic((R.ecx >>> 0) & 0x2808, 32); // 867193: test ecx, 0x2808
        if (R.zf) { pc = 0x8671b8; continue; } // 867199: je 0x8671b8
        pc = 0x86719b; continue;
      case 0x86719b:
        R.sub(((R.eax >>> 0) & 0xff), 0xa, 8); // 86719b: cmp al, 0xa
        if (!R.cL) { pc = 0x8671b8; continue; } // 86719d: jge 0x8671b8
        pc = 0x86719f; continue;
      case 0x86719f:
        R.sub(R.m.u8(((R.esp + 0x11) | 0) >>> 0), 0x6, 8); // 86719f: cmp byte ptr [esp + 0x11], 6
        if (!R.cL) { pc = 0x8671b8; continue; } // 8671a4: jge 0x8671b8
        pc = 0x8671a6; continue;
      case 0x8671a6:
        R.sub(((R.edx >>> 0) & 0xff), 0x1e, 8); // 8671a6: cmp dl, 0x1e
        if (!R.cL) { pc = 0x8671b8; continue; } // 8671a9: jge 0x8671b8
        pc = 0x8671ab; continue;
      case 0x8671ab:
        R.edi = (R.pop()) | 0; // 8671ab: pop edi
        R.esi = (R.pop()) | 0; // 8671ac: pop esi
        R.ebp = (R.pop()) | 0; // 8671ad: pop ebp
        R.eax = (0x1) | 0; // 8671ae: mov eax, 1
        R.ebx = (R.pop()) | 0; // 8671b3: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 8671b4: add esp, 0xc
        return R.ret(0); // 8671b7: ret 
      case 0x8671b8:
        R.logic((R.ecx >>> 0) & 0x82200, 32); // 8671b8: test ecx, 0x82200
        if (!R.zf) { pc = 0x8671c4; continue; } // 8671be: jne 0x8671c4
        pc = 0x8671c0; continue;
      case 0x8671c0:
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 8671c0: test ebp, ebp
        if (R.zf) { pc = 0x8671dd; continue; } // 8671c2: je 0x8671dd
        pc = 0x8671c4; continue;
      case 0x8671c4:
        R.sub(R.m.u8(((R.esp + 0x10) | 0) >>> 0), 0xa, 8); // 8671c4: cmp byte ptr [esp + 0x10], 0xa
        if (!R.cL) { pc = 0x8671dd; continue; } // 8671c9: jge 0x8671dd
        pc = 0x8671cb; continue;
      case 0x8671cb:
        R.sub(((R.edx >>> 0) & 0xff), 0x14, 8); // 8671cb: cmp dl, 0x14
        if (!R.cL) { pc = 0x8671dd; continue; } // 8671ce: jge 0x8671dd
        pc = 0x8671d0; continue;
      case 0x8671d0:
        R.edi = (R.pop()) | 0; // 8671d0: pop edi
        R.esi = (R.pop()) | 0; // 8671d1: pop esi
        R.ebp = (R.pop()) | 0; // 8671d2: pop ebp
        R.eax = (0x1) | 0; // 8671d3: mov eax, 1
        R.ebx = (R.pop()) | 0; // 8671d8: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 8671d9: add esp, 0xc
        return R.ret(0); // 8671dc: ret 
      case 0x8671dd:
        R.logic(((R.ecx >>> 0) & 0xff) & 0x1, 8); // 8671dd: test cl, 1
        if (R.zf) { pc = 0x8671ef; continue; } // 8671e0: je 0x8671ef
        pc = 0x8671e2; continue;
      case 0x8671e2:
        R.edi = (R.pop()) | 0; // 8671e2: pop edi
        R.esi = (R.pop()) | 0; // 8671e3: pop esi
        R.ebp = (R.pop()) | 0; // 8671e4: pop ebp
        R.eax = (0x1) | 0; // 8671e5: mov eax, 1
        R.ebx = (R.pop()) | 0; // 8671ea: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 8671eb: add esp, 0xc
        return R.ret(0); // 8671ee: ret 
      case 0x8671ef:
        R.logic(((R.ecx >>> 0) & 0xff) & 0x10, 8); // 8671ef: test cl, 0x10
        if (R.zf) { pc = 0x867201; continue; } // 8671f2: je 0x867201
        pc = 0x8671f4; continue;
      case 0x8671f4:
        R.edi = (R.pop()) | 0; // 8671f4: pop edi
        R.esi = (R.pop()) | 0; // 8671f5: pop esi
        R.ebp = (R.pop()) | 0; // 8671f6: pop ebp
        R.eax = (0x1) | 0; // 8671f7: mov eax, 1
        R.ebx = (R.pop()) | 0; // 8671fc: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 8671fd: add esp, 0xc
        return R.ret(0); // 867200: ret 
      case 0x867201:
        R.logic(((R.ecx >>> 8) & 0xff) & 0x1, 8); // 867201: test ch, 1
        if (R.zf) { pc = 0x867213; continue; } // 867204: je 0x867213
        pc = 0x867206; continue;
      case 0x867206:
        R.edi = (R.pop()) | 0; // 867206: pop edi
        R.esi = (R.pop()) | 0; // 867207: pop esi
        R.ebp = (R.pop()) | 0; // 867208: pop ebp
        R.eax = (0x1) | 0; // 867209: mov eax, 1
        R.ebx = (R.pop()) | 0; // 86720e: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 86720f: add esp, 0xc
        return R.ret(0); // 867212: ret 
      case 0x867213:
        R.edx = (((R.m.u8(((R.esp + 0x13) | 0) >>> 0)) << 24 >> 24)) | 0; // 867213: movsx edx, byte ptr [esp + 0x13]
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 867218: movsx eax, al
        R.ecx = (0xffffffba) | 0; // 86721b: mov ecx, 0xffffffba
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 867220: sub ecx, eax
        R.sub((R.edx >>> 0), (R.ecx >>> 0), 32); // 867222: cmp edx, ecx
        if (!R.cL) { pc = 0x867233; continue; } // 867224: jge 0x867233
        pc = 0x867226; continue;
      case 0x867226:
        R.edi = (R.pop()) | 0; // 867226: pop edi
        R.esi = (R.pop()) | 0; // 867227: pop esi
        R.ebp = (R.pop()) | 0; // 867228: pop ebp
        R.eax = (0x1) | 0; // 867229: mov eax, 1
        R.ebx = (R.pop()) | 0; // 86722e: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 86722f: add esp, 0xc
        return R.ret(0); // 867232: ret 
      case 0x867233:
        R.edi = (R.pop()) | 0; // 867233: pop edi
        R.esi = (R.pop()) | 0; // 867234: pop esi
        R.ebp = (R.pop()) | 0; // 867235: pop ebp
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 867236: xor eax, eax
        R.ebx = (R.pop()) | 0; // 867238: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 867239: add esp, 0xc
        return R.ret(0); // 86723c: ret 
      default: throw new Error(`f_866f60: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
