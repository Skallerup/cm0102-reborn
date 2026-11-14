// 0x8ccb80 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 417c10=2tc, 4cf5a0=1c, 54a110=0t, 5e8290=6, 66f4e0=0, 68d020=0t, 68d040=0t, 68d0d0=2tc, 68d1b0=0t, 8c6100=2tc, 90d130=0, 944c9f=7, 944cff=5t, 945333=4, 945667=2t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';
import { ROT } from './x86';

const RO_8cd134_1u = [0x0, 0x1, 0x7, 0x7, 0x7, 0x2, 0x2, 0x2, 0x2, 0x7, 0x3, 0x4, 0x4, 0x4, 0x5, 0x7, 0x7, 0x6, 0x6, 0x5, 0x90, 0x90, 0x90, 0x90, 0x90, 0x90, 0x90, 0x90, 0x6a, 0xff, 0x68, 0xd8, 0x3e, 0x96, 0x0, 0x64, 0xa1, 0x0, 0x0, 0x0, 0x0, 0x50, 0x64, 0x89, 0x25, 0x0, 0x0, 0x0, 0x0, 0x83, 0xec, 0x10, 0x56, 0x8b, 0xf1, 0x57, 0x8d, 0x4c, 0x24, 0x8, 0xe8, 0xab, 0xfe, 0xdb, 0xff, 0x8b, 0x7c, 0x24, 0x28, 0x6a, 0x0, 0x57, 0x8b, 0xce, 0xc7, 0x44, 0x24, 0x28, 0x0, 0x0, 0x0, 0x0, 0xe8, 0xe5, 0xc, 0x0, 0x0, 0x85, 0xc0, 0x74, 0x58, 0x8d, 0x44, 0x24, 0x8, 0x6a, 0x0, 0x50, 0x57, 0x8b, 0xce, 0xe8, 0x52, 0x8b, 0xff, 0xff, 0x8b, 0x4c, 0x24, 0xa, 0x89, 0x4c, 0x24, 0x12, 0x8d, 0x4c, 0x24, 0x8, 0xe8, 0x1, 0x0, 0xdc, 0xff, 0x85, 0xc0, 0x74, 0x34, 0x8b, 0x0, 0x8b, 0x4e, 0x4, 0x3b, 0xc1, 0x7d, 0x7, 0x8b, 0x16, 0x8d, 0x4, 0x82, 0xeb, 0x2, 0x8b, 0x6, 0x8b, 0x0, 0x8a, 0x40, 0x2c, 0x84, 0xc0, 0x74, 0x3f, 0x3c, 0x1, 0x74, 0x3b, 0x3c, 0x5, 0x74, 0x37, 0x3c, 0x6, 0x74, 0x33, 0x8d, 0x4c, 0x24, 0x8, 0xe8, 0xcd, 0xff, 0xdb, 0xff, 0x85, 0xc0, 0x75, 0xcc, 0x8d, 0x4c, 0x24, 0x8, 0xc7, 0x44, 0x24, 0x20, 0xff, 0xff, 0xff, 0xff, 0xe8, 0x48, 0xfe, 0xdb, 0xff, 0x5f, 0x33, 0xc0, 0x5e, 0x8b, 0x4c, 0x24, 0x10, 0x64, 0x89, 0xd, 0x0, 0x0, 0x0, 0x0, 0x83, 0xc4, 0x1c, 0xc2, 0x4, 0x0, 0x8d, 0x4c, 0x24, 0x8, 0xc7, 0x44, 0x24, 0x20, 0xff, 0xff, 0xff, 0xff, 0xe8, 0x22, 0xfe, 0xdb, 0xff, 0x8b, 0x4c, 0x24, 0x18, 0x5f, 0xb8, 0x1, 0x0, 0x0, 0x0, 0x5e, 0x64, 0x89, 0xd, 0x0, 0x0, 0x0, 0x0, 0x83, 0xc4, 0x1c, 0xc2];

export function f_8ccb80(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x8ccb80;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x8ccb80:
        R.push(0xffffffff); // 8ccb80: push -1
        R.push(0x963ec6); // 8ccb82: push 0x963ec6
        R.eax = (0) | 0; // 8ccb87: mov eax, dword ptr fs:[0]
        R.push((R.eax >>> 0)); // 8ccb8d: push eax
        /* fs */ // 8ccb8e: mov dword ptr fs:[0], esp
        R.esp = (R.sub((R.esp >>> 0), 0x254, 32)) | 0; // 8ccb95: sub esp, 0x254
        R.push((R.ebx >>> 0)); // 8ccb9b: push ebx
        R.push((R.ebp >>> 0)); // 8ccb9c: push ebp
        R.push((R.esi >>> 0)); // 8ccb9d: push esi
        R.push((R.edi >>> 0)); // 8ccb9e: push edi
        R.edi = ((R.ecx >>> 0)) | 0; // 8ccb9f: mov edi, ecx
        R.ecx = (((R.esp + 0x24) | 0)) | 0; // 8ccba1: lea ecx, [esp + 0x24]
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 8ccba5: mov dword ptr [esp + 0x38], edi
        R.call(0x68d020, { n: 0, thisEcx: true, calleeClean: false }); // 8ccba9: call 0x68d020
        R.ebp = (R.logic((R.ebp >>> 0) ^ (R.ebp >>> 0), 32)) | 0; // 8ccbae: xor ebp, ebp
        R.ecx = (((R.esp + 0x3c) | 0)) | 0; // 8ccbb0: lea ecx, [esp + 0x3c]
        R.m.w32(((R.esp + 0x26c) | 0) >>> 0, (R.ebp >>> 0)); // 8ccbb4: mov dword ptr [esp + 0x26c], ebp
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.ebp >>> 0)); // 8ccbbb: mov dword ptr [esp + 0x18], ebp
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.ebp >>> 0)); // 8ccbbf: mov dword ptr [esp + 0x20], ebp
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.ebp >>> 0)); // 8ccbc3: mov dword ptr [esp + 0x14], ebp
        R.call(0x54a110, { n: 0, thisEcx: true, calleeClean: false }); // 8ccbc7: call 0x54a110
        R.ebx = (R.m.u32(((R.esp + 0x274) | 0) >>> 0)) | 0; // 8ccbcc: mov ebx, dword ptr [esp + 0x274]
        R.eax = (R.m.u32(((R.edi + 0x4) | 0) >>> 0)) | 0; // 8ccbd3: mov eax, dword ptr [edi + 4]
        R.edx = (R.logic((R.edx >>> 0) ^ (R.edx >>> 0), 32)) | 0; // 8ccbd6: xor edx, edx
        R.sub((R.eax >>> 0), (R.ebp >>> 0), 32); // 8ccbd8: cmp eax, ebp
        R.esi = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 8ccbda: mov esi, dword ptr [ebx]
        R.m.w8(((R.esp + 0x26c) | 0) >>> 0, 0x1); // 8ccbdc: mov byte ptr [esp + 0x26c], 1
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 8ccbe4: mov dword ptr [esp + 0x1c], edx
        if (R.cLE) { pc = 0x8ccc45; continue; } // 8ccbe8: jle 0x8ccc45
        pc = 0x8ccbea; continue;
      case 0x8ccbea:
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 8ccbea: mov eax, dword ptr [edi]
        R.ecx = (R.m.u32(((R.eax + R.edx * 4) | 0) >>> 0)) | 0; // 8ccbec: mov ecx, dword ptr [eax + edx*4]
        R.sub((R.ecx >>> 0), (R.ebp >>> 0), 32); // 8ccbef: cmp ecx, ebp
        if (R.zf) { pc = 0x8ccc39; continue; } // 8ccbf1: je 0x8ccc39
        pc = 0x8ccbf3; continue;
      case 0x8ccbf3:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + 0x2c) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8ccbf3: mov al, byte ptr [ecx + 0x2c]
        R.sub(((R.eax >>> 0) & 0xff), 0x2, 8); // 8ccbf6: cmp al, 2
        if (R.zf) { pc = 0x8ccc0e; continue; } // 8ccbf8: je 0x8ccc0e
        pc = 0x8ccbfa; continue;
      case 0x8ccbfa:
        R.sub(((R.eax >>> 0) & 0xff), 0x3, 8); // 8ccbfa: cmp al, 3
        if (R.zf) { pc = 0x8ccc0e; continue; } // 8ccbfc: je 0x8ccc0e
        pc = 0x8ccbfe; continue;
      case 0x8ccbfe:
        R.sub(((R.eax >>> 0) & 0xff), 0x14, 8); // 8ccbfe: cmp al, 0x14
        if (R.zf) { pc = 0x8ccc0e; continue; } // 8ccc00: je 0x8ccc0e
        pc = 0x8ccc02; continue;
      case 0x8ccc02:
        R.sub(((R.eax >>> 0) & 0xff), 0xf, 8); // 8ccc02: cmp al, 0xf
        if (R.zf) { pc = 0x8ccc12; continue; } // 8ccc04: je 0x8ccc12
        pc = 0x8ccc06; continue;
      case 0x8ccc06:
        R.sub(((R.eax >>> 0) & 0xff), 0x10, 8); // 8ccc06: cmp al, 0x10
        if (R.zf) { pc = 0x8ccc0e; continue; } // 8ccc08: je 0x8ccc0e
        pc = 0x8ccc0a; continue;
      case 0x8ccc0a:
        R.sub(((R.eax >>> 0) & 0xff), 0x4, 8); // 8ccc0a: cmp al, 4
        if (!R.zf) { pc = 0x8ccc18; continue; } // 8ccc0c: jne 0x8ccc18
        pc = 0x8ccc0e; continue;
      case 0x8ccc0e:
        R.sub(((R.eax >>> 0) & 0xff), 0xf, 8); // 8ccc0e: cmp al, 0xf
        if (!R.zf) { pc = 0x8ccc39; continue; } // 8ccc10: jne 0x8ccc39
        pc = 0x8ccc12; continue;
      case 0x8ccc12:
        R.sub(R.m.u8(((R.ecx + 0x2e) | 0) >>> 0), 0x3, 8); // 8ccc12: cmp byte ptr [ecx + 0x2e], 3
        if (!R.cf) { pc = 0x8ccc39; continue; } // 8ccc16: jae 0x8ccc39
        pc = 0x8ccc18; continue;
      case 0x8ccc18:
        R.sub(R.m.u32(((R.ecx + 0x8) | 0) >>> 0), (R.esi >>> 0), 32); // 8ccc18: cmp dword ptr [ecx + 8], esi
        if (!R.zf) { pc = 0x8ccc39; continue; } // 8ccc1b: jne 0x8ccc39
        pc = 0x8ccc1d; continue;
      case 0x8ccc1d:
        R.ecx = (((R.esp + 0x24) | 0)) | 0; // 8ccc1d: lea ecx, [esp + 0x24]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 8ccc21: test ecx, ecx
        if (R.zf) { pc = 0x8ccc39; continue; } // 8ccc23: je 0x8ccc39
        pc = 0x8ccc25; continue;
      case 0x8ccc25:
        R.edx = (((R.esp + 0x1c) | 0)) | 0; // 8ccc25: lea edx, [esp + 0x1c]
        R.push(0x4); // 8ccc29: push 4
        R.push((R.edx >>> 0)); // 8ccc2b: push edx
        R.ecx = (((R.esp + 0x2c) | 0)) | 0; // 8ccc2c: lea ecx, [esp + 0x2c]
        R.call(0x68d0d0, { n: 2, thisEcx: true, calleeClean: true }); // 8ccc30: call 0x68d0d0
        R.edx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 8ccc35: mov edx, dword ptr [esp + 0x1c]
        pc = 0x8ccc39; continue;
      case 0x8ccc39:
        R.eax = (R.m.u32(((R.edi + 0x4) | 0) >>> 0)) | 0; // 8ccc39: mov eax, dword ptr [edi + 4]
        R.edx = (R.incdec((R.edx >>> 0), 1, 32)) | 0; // 8ccc3c: inc edx
        R.sub((R.edx >>> 0), (R.eax >>> 0), 32); // 8ccc3d: cmp edx, eax
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 8ccc3f: mov dword ptr [esp + 0x1c], edx
        if (R.cL) { pc = 0x8ccbea; continue; } // 8ccc43: jl 0x8ccbea
        pc = 0x8ccc45; continue;
      case 0x8ccc45:
        R.eax = (((R.esp + 0x24) | 0)) | 0; // 8ccc45: lea eax, [esp + 0x24]
        R.ecx = ((R.edi >>> 0)) | 0; // 8ccc49: mov ecx, edi
        R.push((R.eax >>> 0)); // 8ccc4b: push eax
        R.push((R.ebx >>> 0)); // 8ccc4c: push ebx
        R.call(0x8c6100, { n: 2, thisEcx: true, calleeClean: true }); // 8ccc4d: call 0x8c6100
        R.ecx = (R.m.u32(((R.esp + 0x26) | 0) >>> 0)) | 0; // 8ccc52: mov ecx, dword ptr [esp + 0x26]
        R.m.w32(((R.esp + 0x2e) | 0) >>> 0, (R.ecx >>> 0)); // 8ccc56: mov dword ptr [esp + 0x2e], ecx
        R.ecx = (((R.esp + 0x24) | 0)) | 0; // 8ccc5a: lea ecx, [esp + 0x24]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8ccc5e: call 0x68d1b0
        R.sub((R.eax >>> 0), (R.ebp >>> 0), 32); // 8ccc63: cmp eax, ebp
        if (R.zf) { pc = 0x8ccf62; continue; } // 8ccc65: je 0x8ccf62
        pc = 0x8ccc6b; continue;
      case 0x8ccc6b:
        pc = 0x8ccc71; continue; // 8ccc6b: jmp 0x8ccc71
      case 0x8ccc6d:
        R.edi = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 8ccc6d: mov edi, dword ptr [esp + 0x38]
        pc = 0x8ccc71; continue;
      case 0x8ccc71:
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8ccc71: mov edx, dword ptr [eax]
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 8ccc73: mov eax, dword ptr [edi]
        R.ebp = (R.m.u32(((R.eax + R.edx * 4) | 0) >>> 0)) | 0; // 8ccc75: mov ebp, dword ptr [eax + edx*4]
        R.sub(R.m.u8(((R.ebp + 0x1f) | 0) >>> 0), 0x1, 8); // 8ccc78: cmp byte ptr [ebp + 0x1f], 1
        if (R.zf) { pc = 0x8ccf51; continue; } // 8ccc7c: je 0x8ccf51
        pc = 0x8ccc82; continue;
      case 0x8ccc82:
        R.eax = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 8ccc82: mov eax, dword ptr [ebp + 0xc]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 8ccc85: lea ecx, [eax + eax*4]
        R.eax = (((R.eax + R.ecx * 2) | 0)) | 0; // 8ccc88: lea eax, [eax + ecx*2]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 8ccc8b: lea edx, [eax + eax*4]
        R.eax = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 8ccc8e: mov eax, dword ptr [0xae23bc]
        R.ecx = (((R.eax + R.edx * 2) | 0)) | 0; // 8ccc93: lea ecx, [eax + edx*2]
        R.push((R.ecx >>> 0)); // 8ccc96: push ecx
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8ccc97: mov ecx, dword ptr [0xae1050]
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 8ccc9d: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8ccca2: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 8ccca4: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x8cccd2; continue; } // 8ccca9: je 0x8cccd2
        pc = 0x8cccab; continue;
      case 0x8cccab:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x35) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8cccab: mov dl, byte ptr [eax + 0x35]
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) & 0x3f, 8)) & 0xff) << 0)) | 0; // 8cccae: and dl, 0x3f
        R.sub(((R.edx >>> 0) & 0xff), 0x5, 8); // 8cccb1: cmp dl, 5
        if (R.zf) { pc = 0x8cccd2; continue; } // 8cccb4: je 0x8cccd2
        pc = 0x8cccb6; continue;
      case 0x8cccb6:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 8cccb6: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 8cccb9: mov edx, dword ptr [0xae23b4]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 8cccbf: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 8cccc2: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 8cccc5: add ecx, eax
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8cccc7: add edx, eax
        R.ebx = (((R.edx + R.ecx * 4) | 0)) | 0; // 8cccc9: lea ebx, [edx + ecx*4]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ebx >>> 0)); // 8ccccc: mov dword ptr [esp + 0x1c], ebx
        pc = 0x8cccde; continue; // 8cccd0: jmp 0x8cccde
      case 0x8cccd2:
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, 0x0); // 8cccd2: mov dword ptr [esp + 0x1c], 0
        R.ebx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 8cccda: mov ebx, dword ptr [esp + 0x1c]
        pc = 0x8cccde; continue;
      case 0x8cccde:
        R.eax = (((R.m.u8(((R.ebp + 0x2c) | 0) >>> 0)) << 24 >> 24)) | 0; // 8cccde: movsx eax, byte ptr [ebp + 0x2c]
        R.sub((R.eax >>> 0), 0x13, 32); // 8ccce2: cmp eax, 0x13
        if (!R.cBE) { pc = 0x8ccd20; continue; } // 8ccce5: ja 0x8ccd20
        pc = 0x8ccce7; continue;
      case 0x8ccce7:
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 8ccce7: xor ecx, ecx
        R.ecx = ((R.ecx & 0xffffff00) | (((ROT(RO_8cd134_1u, 0x8cd134, 1, ((R.eax + 0x8cd134) | 0))) & 0xff) << 0)) | 0; // 8ccce9: mov cl, byte ptr [eax + 0x8cd134]
        pc = [0x8ccd20, 0x8cccf6, 0x8cccfd, 0x8ccd04, 0x8ccd0b, 0x8ccd19, 0x8ccd12, 0x8ccd20][R.ecx >>> 0]; continue; // 8cccef: jmp dword ptr [ecx*4 + 0x8cd114]
      case 0x8cccf6:
        R.m.w8(((R.esp + 0x13) | 0) >>> 0, 0x1); // 8cccf6: mov byte ptr [esp + 0x13], 1
        pc = 0x8ccd25; continue; // 8cccfb: jmp 0x8ccd25
      case 0x8cccfd:
        R.m.w8(((R.esp + 0x13) | 0) >>> 0, 0x2); // 8cccfd: mov byte ptr [esp + 0x13], 2
        pc = 0x8ccd25; continue; // 8ccd02: jmp 0x8ccd25
      case 0x8ccd04:
        R.m.w8(((R.esp + 0x13) | 0) >>> 0, 0x3); // 8ccd04: mov byte ptr [esp + 0x13], 3
        pc = 0x8ccd25; continue; // 8ccd09: jmp 0x8ccd25
      case 0x8ccd0b:
        R.m.w8(((R.esp + 0x13) | 0) >>> 0, 0x4); // 8ccd0b: mov byte ptr [esp + 0x13], 4
        pc = 0x8ccd25; continue; // 8ccd10: jmp 0x8ccd25
      case 0x8ccd12:
        R.m.w8(((R.esp + 0x13) | 0) >>> 0, 0x5); // 8ccd12: mov byte ptr [esp + 0x13], 5
        pc = 0x8ccd25; continue; // 8ccd17: jmp 0x8ccd25
      case 0x8ccd19:
        R.m.w8(((R.esp + 0x13) | 0) >>> 0, 0x6); // 8ccd19: mov byte ptr [esp + 0x13], 6
        pc = 0x8ccd25; continue; // 8ccd1e: jmp 0x8ccd25
      case 0x8ccd20:
        R.m.w8(((R.esp + 0x13) | 0) >>> 0, 0x0); // 8ccd20: mov byte ptr [esp + 0x13], 0
        pc = 0x8ccd25; continue;
      case 0x8ccd25:
        R.edx = (R.m.u32(((R.edi + 0x928) | 0) >>> 0)) | 0; // 8ccd25: mov edx, dword ptr [edi + 0x928]
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8ccd2b: xor eax, eax
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 8ccd2d: test edx, edx
        if (R.cLE) { pc = 0x8ccd51; continue; } // 8ccd2f: jle 0x8ccd51
        pc = 0x8ccd31; continue;
      case 0x8ccd31:
        R.ecx = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 8ccd31: mov ecx, dword ptr [esp + 0x38]
        R.edi = (R.m.u32(((R.ebp + 0x20) | 0) >>> 0)) | 0; // 8ccd35: mov edi, dword ptr [ebp + 0x20]
        R.esi = (R.m.u32(((R.ecx + 0x920) | 0) >>> 0)) | 0; // 8ccd38: mov esi, dword ptr [ecx + 0x920]
        R.ecx = (((R.esi + 0x8) | 0)) | 0; // 8ccd3e: lea ecx, [esi + 8]
        pc = 0x8ccd41; continue;
      case 0x8ccd41:
        R.sub(R.m.u32(((R.ecx) | 0) >>> 0), (R.edi >>> 0), 32); // 8ccd41: cmp dword ptr [ecx], edi
        if (R.zf) { pc = 0x8ccde3; continue; } // 8ccd43: je 0x8ccde3
        pc = 0x8ccd49; continue;
      case 0x8ccd49:
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 8ccd49: inc eax
        R.ecx = (R.add((R.ecx >>> 0), 0xc, 32)) | 0; // 8ccd4a: add ecx, 0xc
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 8ccd4d: cmp eax, edx
        if (R.cL) { pc = 0x8ccd41; continue; } // 8ccd4f: jl 0x8ccd41
        pc = 0x8ccd51; continue;
      case 0x8ccd51:
        R.ecx = (((R.ebp + 0x12) | 0)) | 0; // 8ccd51: lea ecx, [ebp + 0x12]
        R.edx = (((R.esp + 0x5c) | 0)) | 0; // 8ccd54: lea edx, [esp + 0x5c]
        R.push((R.ecx >>> 0)); // 8ccd58: push ecx
        R.push((R.edx >>> 0)); // 8ccd59: push edx
        pc = 0x8ccd5a; continue;
      case 0x8ccd5a:
        R.ecx = (((R.esp + 0x44) | 0)) | 0; // 8ccd5a: lea ecx, [esp + 0x44]
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 8ccd5e: call 0x417c10
        R.eax = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 8ccd63: mov eax, dword ptr [esp + 0x20]
        R.edi = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 8ccd67: mov edi, dword ptr [esp + 0x14]
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 8ccd6b: cmp eax, edi
        if (!R.zf) { pc = 0x8ccd93; continue; } // 8ccd6d: jne 0x8ccd93
        pc = 0x8ccd6f; continue;
      case 0x8ccd6f:
        R.eax = (R.add((R.eax >>> 0), 0x14, 32)) | 0; // 8ccd6f: add eax, 0x14
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.eax >>> 0)); // 8ccd72: mov dword ptr [esp + 0x20], eax
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt(27); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.eax = (Number(BigInt.asIntN(32, p))) | 0; } // 8ccd76: imul eax, eax, 0x1b
        R.push((R.eax >>> 0)); // 8ccd79: push eax
        R.eax = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 8ccd7a: mov eax, dword ptr [esp + 0x1c]
        R.push((R.eax >>> 0)); // 8ccd7e: push eax
        R.call(0x945667, { n: 2, thisEcx: true, calleeClean: false }); // 8ccd7f: call 0x945667
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 8ccd84: add esp, 8
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.eax >>> 0)); // 8ccd87: mov dword ptr [esp + 0x18], eax
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8ccd8b: test eax, eax
        if (R.zf) { pc = 0x8ccfb5; continue; } // 8ccd8d: je 0x8ccfb5
        pc = 0x8ccd93; continue;
      case 0x8ccd93:
        R.ecx = ((R.edi >>> 0)) | 0; // 8ccd93: mov ecx, edi
        R.edx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 8ccd95: mov edx, dword ptr [esp + 0x18]
        { const p = BigInt((((R.ecx >>> 0)) | 0)) * BigInt(27); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 8ccd99: imul ecx, ecx, 0x1b
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x13) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8ccd9c: mov al, byte ptr [esp + 0x13]
        R.esi = (((R.ecx + R.edx) | 0)) | 0; // 8ccda0: lea esi, [ecx + edx]
        R.ecx = (((R.esp + 0x3c) | 0)) | 0; // 8ccda3: lea ecx, [esp + 0x3c]
        R.edx = (((R.esp + 0x54) | 0)) | 0; // 8ccda7: lea edx, [esp + 0x54]
        R.push((R.ecx >>> 0)); // 8ccdab: push ecx
        R.push((R.edx >>> 0)); // 8ccdac: push edx
        R.ecx = ((R.esi >>> 0)) | 0; // 8ccdad: mov ecx, esi
        R.m.w8(((R.esi + 0x19) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 8ccdaf: mov byte ptr [esi + 0x19], al
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 8ccdb2: call 0x417c10
        R.eax = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 8ccdb7: mov eax, dword ptr [ebp + 0xc]
        R.edx = (R.m.u32(((R.esp + 0x274) | 0) >>> 0)) | 0; // 8ccdba: mov edx, dword ptr [esp + 0x274]
        R.m.w32(((R.esi + 0x8) | 0) >>> 0, (R.eax >>> 0)); // 8ccdc1: mov dword ptr [esi + 8], eax
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.ebp + 0x2d) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8ccdc4: mov cl, byte ptr [ebp + 0x2d]
        R.m.w8(((R.esi + 0x1a) | 0) >>> 0, ((R.ecx >>> 0) & 0xff)); // 8ccdc7: mov byte ptr [esi + 0x1a], cl
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 8ccdca: mov eax, dword ptr [ebp + 8]
        R.sub(R.m.u32(((R.edx) | 0) >>> 0), (R.eax >>> 0), 32); // 8ccdcd: cmp dword ptr [edx], eax
        if (!R.zf) { pc = 0x8cce0b; continue; } // 8ccdcf: jne 0x8cce0b
        pc = 0x8ccdd1; continue;
      case 0x8ccdd1:
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 8ccdd1: test ebx, ebx
        if (R.zf) { pc = 0x8ccdfc; continue; } // 8ccdd3: je 0x8ccdfc
        pc = 0x8ccdd5; continue;
      case 0x8ccdd5:
        R.eax = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 8ccdd5: mov eax, dword ptr [ebx]
        R.m.w32(((R.esi + 0xc) | 0) >>> 0, (R.eax >>> 0)); // 8ccdd7: mov dword ptr [esi + 0xc], eax
        R.m.w32(((R.esi + 0x10) | 0) >>> 0, 0x0); // 8ccdda: mov dword ptr [esi + 0x10], 0
        pc = 0x8cce15; continue; // 8ccde1: jmp 0x8cce15
      case 0x8ccde3:
        R.edx = (((R.eax + R.eax * 2) | 0)) | 0; // 8ccde3: lea edx, [eax + eax*2]
        R.eax = (((R.esi + R.edx * 4) | 0)) | 0; // 8ccde6: lea eax, [esi + edx*4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8ccde9: test eax, eax
        if (R.zf) { pc = 0x8ccd51; continue; } // 8ccdeb: je 0x8ccd51
        pc = 0x8ccdf1; continue;
      case 0x8ccdf1:
        R.push((R.eax >>> 0)); // 8ccdf1: push eax
        R.eax = (((R.esp + 0x50) | 0)) | 0; // 8ccdf2: lea eax, [esp + 0x50]
        R.push((R.eax >>> 0)); // 8ccdf6: push eax
        pc = 0x8ccd5a; continue; // 8ccdf7: jmp 0x8ccd5a
      case 0x8ccdfc:
        R.eax = (R.logic((R.eax >>> 0) | 0xffffffff, 32)) | 0; // 8ccdfc: or eax, 0xffffffff
        R.m.w32(((R.esi + 0xc) | 0) >>> 0, (R.eax >>> 0)); // 8ccdff: mov dword ptr [esi + 0xc], eax
        R.m.w32(((R.esi + 0x10) | 0) >>> 0, 0x0); // 8cce02: mov dword ptr [esi + 0x10], 0
        pc = 0x8cce15; continue; // 8cce09: jmp 0x8cce15
      case 0x8cce0b:
        R.m.w32(((R.esi + 0xc) | 0) >>> 0, (R.eax >>> 0)); // 8cce0b: mov dword ptr [esi + 0xc], eax
        R.m.w32(((R.esi + 0x10) | 0) >>> 0, 0x1); // 8cce0e: mov dword ptr [esi + 0x10], 1
        pc = 0x8cce15; continue;
      case 0x8cce15:
        R.eax = (R.m.u32(((R.ebp + 0x1b) | 0) >>> 0)) | 0; // 8cce15: mov eax, dword ptr [ebp + 0x1b]
        R.m.w32(((R.esi + 0x14) | 0) >>> 0, (R.eax >>> 0)); // 8cce18: mov dword ptr [esi + 0x14], eax
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebp + 0x2f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8cce1b: mov al, byte ptr [ebp + 0x2f]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 8cce1e: test al, al
        if (R.zf) { pc = 0x8cce3c; continue; } // 8cce20: je 0x8cce3c
        pc = 0x8cce22; continue;
      case 0x8cce22:
        R.eax = (R.m.u32(((R.ebp + 0x1b) | 0) >>> 0)) | 0; // 8cce22: mov eax, dword ptr [ebp + 0x1b]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cce25: test eax, eax
        if (!R.zf) { pc = 0x8cce3c; continue; } // 8cce27: jne 0x8cce3c
        pc = 0x8cce29; continue;
      case 0x8cce29:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebp + 0x30) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8cce29: mov al, byte ptr [ebp + 0x30]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf, 8)) & 0xff) << 0)) | 0; // 8cce2c: and al, 0xf
        R.sub(((R.eax >>> 0) & 0xff), 0x3, 8); // 8cce2e: cmp al, 3
        if (R.zf) { pc = 0x8cce36; continue; } // 8cce30: je 0x8cce36
        pc = 0x8cce32; continue;
      case 0x8cce32:
        R.sub(((R.eax >>> 0) & 0xff), 0x4, 8); // 8cce32: cmp al, 4
        if (!R.zf) { pc = 0x8cce3c; continue; } // 8cce34: jne 0x8cce3c
        pc = 0x8cce36; continue;
      case 0x8cce36:
        R.m.w8(((R.esi + 0x18) | 0) >>> 0, 0x4); // 8cce36: mov byte ptr [esi + 0x18], 4
        pc = 0x8cce4d; continue; // 8cce3a: jmp 0x8cce4d
      case 0x8cce3c:
        R.eax = (R.m.u32(((R.ebp + 0x4) | 0) >>> 0)) | 0; // 8cce3c: mov eax, dword ptr [ebp + 4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cce3f: test eax, eax
        if (R.zf) { pc = 0x8cce49; continue; } // 8cce41: je 0x8cce49
        pc = 0x8cce43; continue;
      case 0x8cce43:
        R.m.w8(((R.esi + 0x18) | 0) >>> 0, 0x1); // 8cce43: mov byte ptr [esi + 0x18], 1
        pc = 0x8cce4d; continue; // 8cce47: jmp 0x8cce4d
      case 0x8cce49:
        R.m.w8(((R.esi + 0x18) | 0) >>> 0, 0x0); // 8cce49: mov byte ptr [esi + 0x18], 0
        pc = 0x8cce4d; continue;
      case 0x8cce4d:
        R.eax = (R.m.u32(((R.ebp + 0x4) | 0) >>> 0)) | 0; // 8cce4d: mov eax, dword ptr [ebp + 4]
        R.edi = (R.incdec((R.edi >>> 0), 1, 32)) | 0; // 8cce50: inc edi
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cce51: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 8cce53: mov dword ptr [esp + 0x14], edi
        if (R.zf) { pc = 0x8ccf51; continue; } // 8cce57: je 0x8ccf51
        pc = 0x8cce5d; continue;
      case 0x8cce5d:
        R.ecx = (R.m.u32(((R.eax + 0x2) | 0) >>> 0)) | 0; // 8cce5d: mov ecx, dword ptr [eax + 2]
        R.m.w32(((R.eax + 0xa) | 0) >>> 0, (R.ecx >>> 0)); // 8cce60: mov dword ptr [eax + 0xa], ecx
        R.ecx = (R.m.u32(((R.ebp + 0x4) | 0) >>> 0)) | 0; // 8cce63: mov ecx, dword ptr [ebp + 4]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8cce66: call 0x68d1b0
        R.edi = ((R.eax >>> 0)) | 0; // 8cce6b: mov edi, eax
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 8cce6d: test edi, edi
        if (R.zf) { pc = 0x8ccf51; continue; } // 8cce6f: je 0x8ccf51
        pc = 0x8cce75; continue;
      case 0x8cce75:
        R.ebx = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 8cce75: mov ebx, dword ptr [esp + 0x14]
        R.eax = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 8cce79: mov eax, dword ptr [esp + 0x20]
        { const p = BigInt((((R.ebx >>> 0)) | 0)) * BigInt(27); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ebx = (Number(BigInt.asIntN(32, p))) | 0; } // 8cce7d: imul ebx, ebx, 0x1b
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt(27); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.eax = (Number(BigInt.asIntN(32, p))) | 0; } // 8cce80: imul eax, eax, 0x1b
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.eax >>> 0)); // 8cce83: mov dword ptr [esp + 0x34], eax
        pc = 0x8cce8d; continue; // 8cce87: jmp 0x8cce8d
      case 0x8cce89:
        R.eax = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 8cce89: mov eax, dword ptr [esp + 0x34]
        pc = 0x8cce8d; continue;
      case 0x8cce8d:
        R.edx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 8cce8d: mov edx, dword ptr [esp + 0x20]
        R.ecx = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 8cce91: mov ecx, dword ptr [esp + 0x14]
        R.sub((R.edx >>> 0), (R.ecx >>> 0), 32); // 8cce95: cmp edx, ecx
        if (!R.zf) { pc = 0x8ccec7; continue; } // 8cce97: jne 0x8ccec7
        pc = 0x8cce99; continue;
      case 0x8cce99:
        R.eax = (R.add((R.eax >>> 0), 0x21c, 32)) | 0; // 8cce99: add eax, 0x21c
        R.esi = ((R.edx >>> 0)) | 0; // 8cce9e: mov esi, edx
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.eax >>> 0)); // 8ccea0: mov dword ptr [esp + 0x34], eax
        R.push((R.eax >>> 0)); // 8ccea4: push eax
        R.eax = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 8ccea5: mov eax, dword ptr [esp + 0x1c]
        R.esi = (R.add((R.esi >>> 0), 0x14, 32)) | 0; // 8ccea9: add esi, 0x14
        R.push((R.eax >>> 0)); // 8cceac: push eax
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.esi >>> 0)); // 8ccead: mov dword ptr [esp + 0x28], esi
        R.call(0x945667, { n: 2, thisEcx: true, calleeClean: false }); // 8cceb1: call 0x945667
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 8cceb6: add esp, 8
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.eax >>> 0)); // 8cceb9: mov dword ptr [esp + 0x18], eax
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8ccebd: test eax, eax
        if (R.zf) { pc = 0x8cd064; continue; } // 8ccebf: je 0x8cd064
        pc = 0x8ccec5; continue;
      case 0x8ccec5:
        pc = 0x8ccecb; continue; // 8ccec5: jmp 0x8ccecb
      case 0x8ccec7:
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 8ccec7: mov eax, dword ptr [esp + 0x18]
        pc = 0x8ccecb; continue;
      case 0x8ccecb:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esp + 0x13) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8ccecb: mov cl, byte ptr [esp + 0x13]
        R.esi = (((R.ebx + R.eax) | 0)) | 0; // 8ccecf: lea esi, [ebx + eax]
        R.edx = (((R.esp + 0x3c) | 0)) | 0; // 8cced2: lea edx, [esp + 0x3c]
        R.eax = (((R.esp + 0x44) | 0)) | 0; // 8cced6: lea eax, [esp + 0x44]
        R.m.w8(((R.esi + 0x19) | 0) >>> 0, ((R.ecx >>> 0) & 0xff)); // 8cceda: mov byte ptr [esi + 0x19], cl
        R.push((R.edx >>> 0)); // 8ccedd: push edx
        R.push((R.eax >>> 0)); // 8ccede: push eax
        R.ecx = ((R.esi >>> 0)) | 0; // 8ccedf: mov ecx, esi
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 8ccee1: call 0x417c10
        R.ecx = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 8ccee6: mov ecx, dword ptr [edi]
        R.edx = (R.m.u32(((R.esp + 0x274) | 0) >>> 0)) | 0; // 8ccee8: mov edx, dword ptr [esp + 0x274]
        R.m.w32(((R.esi + 0x8) | 0) >>> 0, (R.ecx >>> 0)); // 8cceef: mov dword ptr [esi + 8], ecx
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 8ccef2: mov eax, dword ptr [ebp + 8]
        R.sub(R.m.u32(((R.edx) | 0) >>> 0), (R.eax >>> 0), 32); // 8ccef5: cmp dword ptr [edx], eax
        if (!R.zf) { pc = 0x8ccf1e; continue; } // 8ccef7: jne 0x8ccf1e
        pc = 0x8ccef9; continue;
      case 0x8ccef9:
        R.eax = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 8ccef9: mov eax, dword ptr [esp + 0x1c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8ccefd: test eax, eax
        if (R.zf) { pc = 0x8ccf0f; continue; } // 8cceff: je 0x8ccf0f
        pc = 0x8ccf01; continue;
      case 0x8ccf01:
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8ccf01: mov eax, dword ptr [eax]
        R.m.w32(((R.esi + 0xc) | 0) >>> 0, (R.eax >>> 0)); // 8ccf03: mov dword ptr [esi + 0xc], eax
        R.m.w32(((R.esi + 0x10) | 0) >>> 0, 0x1); // 8ccf06: mov dword ptr [esi + 0x10], 1
        pc = 0x8ccf28; continue; // 8ccf0d: jmp 0x8ccf28
      case 0x8ccf0f:
        R.eax = (R.logic((R.eax >>> 0) | 0xffffffff, 32)) | 0; // 8ccf0f: or eax, 0xffffffff
        R.m.w32(((R.esi + 0xc) | 0) >>> 0, (R.eax >>> 0)); // 8ccf12: mov dword ptr [esi + 0xc], eax
        R.m.w32(((R.esi + 0x10) | 0) >>> 0, 0x1); // 8ccf15: mov dword ptr [esi + 0x10], 1
        pc = 0x8ccf28; continue; // 8ccf1c: jmp 0x8ccf28
      case 0x8ccf1e:
        R.m.w32(((R.esi + 0xc) | 0) >>> 0, (R.eax >>> 0)); // 8ccf1e: mov dword ptr [esi + 0xc], eax
        R.m.w32(((R.esi + 0x10) | 0) >>> 0, 0x0); // 8ccf21: mov dword ptr [esi + 0x10], 0
        pc = 0x8ccf28; continue;
      case 0x8ccf28:
        R.edx = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 8ccf28: mov edx, dword ptr [esp + 0x14]
        R.m.w32(((R.esi + 0x14) | 0) >>> 0, 0x0); // 8ccf2c: mov dword ptr [esi + 0x14], 0
        R.m.w8(((R.esi + 0x18) | 0) >>> 0, 0x1); // 8ccf33: mov byte ptr [esi + 0x18], 1
        R.ecx = (R.m.u32(((R.ebp + 0x4) | 0) >>> 0)) | 0; // 8ccf37: mov ecx, dword ptr [ebp + 4]
        R.edx = (R.incdec((R.edx >>> 0), 1, 32)) | 0; // 8ccf3a: inc edx
        R.ebx = (R.add((R.ebx >>> 0), 0x1b, 32)) | 0; // 8ccf3b: add ebx, 0x1b
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edx >>> 0)); // 8ccf3e: mov dword ptr [esp + 0x14], edx
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8ccf42: call 0x68d1b0
        R.edi = ((R.eax >>> 0)) | 0; // 8ccf47: mov edi, eax
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 8ccf49: test edi, edi
        if (!R.zf) { pc = 0x8cce89; continue; } // 8ccf4b: jne 0x8cce89
        pc = 0x8ccf51; continue;
      case 0x8ccf51:
        R.ecx = (((R.esp + 0x24) | 0)) | 0; // 8ccf51: lea ecx, [esp + 0x24]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8ccf55: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8ccf5a: test eax, eax
        if (!R.zf) { pc = 0x8ccc6d; continue; } // 8ccf5c: jne 0x8ccc6d
        pc = 0x8ccf62; continue;
      case 0x8ccf62:
        R.esi = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 8ccf62: mov esi, dword ptr [esp + 0x14]
        R.edi = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 8ccf66: mov edi, dword ptr [esp + 0x18]
        R.push(0x8e55f0); // 8ccf6a: push 0x8e55f0
        R.push(0x1b); // 8ccf6f: push 0x1b
        R.push((R.esi >>> 0)); // 8ccf71: push esi
        R.push((R.edi >>> 0)); // 8ccf72: push edi
        R.call(0x945333, { n: 4, thisEcx: false, calleeClean: false }); // 8ccf73: call 0x945333
        R.ecx = (R.m.u32(((R.esp + 0x288) | 0) >>> 0)) | 0; // 8ccf78: mov ecx, dword ptr [esp + 0x288]
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 8ccf7f: add esp, 0x10
        R.m.w32(((R.esp + 0x26c) | 0) >>> 0, 0xffffffff); // 8ccf82: mov dword ptr [esp + 0x26c], 0xffffffff
        R.m.w32(((R.ecx) | 0) >>> 0, (R.edi >>> 0)); // 8ccf8d: mov dword ptr [ecx], edi
        R.ecx = (((R.esp + 0x24) | 0)) | 0; // 8ccf8f: lea ecx, [esp + 0x24]
        R.call(0x68d040, { n: 0, thisEcx: true, calleeClean: false }); // 8ccf93: call 0x68d040
        R.eax = ((R.esi >>> 0)) | 0; // 8ccf98: mov eax, esi
        pc = 0x8ccf9a; continue;
      case 0x8ccf9a:
        R.ecx = (R.m.u32(((R.esp + 0x264) | 0) >>> 0)) | 0; // 8ccf9a: mov ecx, dword ptr [esp + 0x264]
        R.edi = (R.pop()) | 0; // 8ccfa1: pop edi
        R.esi = (R.pop()) | 0; // 8ccfa2: pop esi
        R.ebp = (R.pop()) | 0; // 8ccfa3: pop ebp
        R.ebx = (R.pop()) | 0; // 8ccfa4: pop ebx
        /* fs */ // 8ccfa5: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x260, 32)) | 0; // 8ccfac: add esp, 0x260
        return R.ret(2); // 8ccfb2: ret 8
      case 0x8ccfb5:
        R.eax = (((R.esp + 0x64) | 0)) | 0; // 8ccfb5: lea eax, [esp + 0x64]
        R.ecx = (((R.esp + 0x164) | 0)) | 0; // 8ccfb9: lea ecx, [esp + 0x164]
        R.push((R.eax >>> 0)); // 8ccfc0: push eax
        R.push((R.ecx >>> 0)); // 8ccfc1: push ecx
        R.push(0x0); // 8ccfc2: push 0
        R.push(0x0); // 8ccfc4: push 0
        R.push(0xa8d514); // 8ccfc6: push 0xa8d514
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 8ccfcb: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8ccfd0: add esp, 0x14
        R.edx = (((R.esp + 0x64) | 0)) | 0; // 8ccfd3: lea edx, [esp + 0x64]
        R.eax = (((R.esp + 0x164) | 0)) | 0; // 8ccfd7: lea eax, [esp + 0x164]
        R.push(0xa8ecfc); // 8ccfde: push 0xa8ecfc
        R.push(0x2b2c); // 8ccfe3: push 0x2b2c
        R.push((R.edx >>> 0)); // 8ccfe8: push edx
        R.push((R.eax >>> 0)); // 8ccfe9: push eax
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 8ccfea: call 0x90d130
        R.push((R.eax >>> 0)); // 8ccfef: push eax
        R.push(0x9a8120); // 8ccff0: push 0x9a8120
        R.push(0xae24d0); // 8ccff5: push 0xae24d0
        R.call(0x944c9f, { n: 7, thisEcx: false, calleeClean: false }); // 8ccffa: call 0x944c9f
        R.esp = (R.add((R.esp >>> 0), 0x1c, 32)) | 0; // 8ccfff: add esp, 0x1c
        R.push(0x9a8108); // 8cd002: push 0x9a8108
        R.push(0xae28bc); // 8cd007: push 0xae28bc
        R.call(0x66f4e0, { n: 2, thisEcx: false, calleeClean: false }); // 8cd00c: call 0x66f4e0
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 8cd011: add esp, 8
        R.push(0xae24d0); // 8cd014: push 0xae24d0
        R.push(0x9a7ff8); // 8cd019: push 0x9a7ff8
        R.push(0xae26c4); // 8cd01e: push 0xae26c4
        R.call(0x66f4e0, { n: 0, thisEcx: false, calleeClean: false }); // 8cd023: call 0x66f4e0
        R.push(0x0); // 8cd028: push 0
        R.push(0xae26c4); // 8cd02a: push 0xae26c4
        R.push(0xae28bc); // 8cd02f: push 0xae28bc
        R.call(0x5e8290, { n: 6, thisEcx: false, calleeClean: false }); // 8cd034: call 0x5e8290
        R.ecx = (R.m.u32(((R.esp + 0x290) | 0) >>> 0)) | 0; // 8cd039: mov ecx, dword ptr [esp + 0x290]
        R.esp = (R.add((R.esp >>> 0), 0x18, 32)) | 0; // 8cd040: add esp, 0x18
        R.m.w32(((R.esp + 0x26c) | 0) >>> 0, 0xffffffff); // 8cd043: mov dword ptr [esp + 0x26c], 0xffffffff
        R.m.w32(((R.ecx) | 0) >>> 0, 0x0); // 8cd04e: mov dword ptr [ecx], 0
        R.ecx = (((R.esp + 0x24) | 0)) | 0; // 8cd054: lea ecx, [esp + 0x24]
        R.call(0x68d040, { n: 0, thisEcx: true, calleeClean: false }); // 8cd058: call 0x68d040
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8cd05d: xor eax, eax
        pc = 0x8ccf9a; continue; // 8cd05f: jmp 0x8ccf9a
      case 0x8cd064:
        R.edx = (((R.esp + 0x164) | 0)) | 0; // 8cd064: lea edx, [esp + 0x164]
        R.eax = (((R.esp + 0x64) | 0)) | 0; // 8cd06b: lea eax, [esp + 0x64]
        R.push((R.edx >>> 0)); // 8cd06f: push edx
        R.push((R.eax >>> 0)); // 8cd070: push eax
        R.push(0x0); // 8cd071: push 0
        R.push(0x0); // 8cd073: push 0
        R.push(0xa8d514); // 8cd075: push 0xa8d514
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 8cd07a: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8cd07f: add esp, 0x14
        R.ecx = (((R.esp + 0x164) | 0)) | 0; // 8cd082: lea ecx, [esp + 0x164]
        R.edx = (((R.esp + 0x64) | 0)) | 0; // 8cd089: lea edx, [esp + 0x64]
        R.push(0xa8ecfc); // 8cd08d: push 0xa8ecfc
        R.push(0x2b63); // 8cd092: push 0x2b63
        R.push((R.ecx >>> 0)); // 8cd097: push ecx
        R.push((R.edx >>> 0)); // 8cd098: push edx
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 8cd099: call 0x90d130
        R.push((R.eax >>> 0)); // 8cd09e: push eax
        R.push(0x9a8120); // 8cd09f: push 0x9a8120
        R.push(0xae24d0); // 8cd0a4: push 0xae24d0
        R.call(0x944c9f, { n: 7, thisEcx: false, calleeClean: false }); // 8cd0a9: call 0x944c9f
        R.esp = (R.add((R.esp >>> 0), 0x1c, 32)) | 0; // 8cd0ae: add esp, 0x1c
        R.push(0x9a8108); // 8cd0b1: push 0x9a8108
        R.push(0xae28bc); // 8cd0b6: push 0xae28bc
        R.call(0x66f4e0, { n: 2, thisEcx: false, calleeClean: false }); // 8cd0bb: call 0x66f4e0
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 8cd0c0: add esp, 8
        R.push(0xae24d0); // 8cd0c3: push 0xae24d0
        R.push(0x9a7ff8); // 8cd0c8: push 0x9a7ff8
        R.push(0xae26c4); // 8cd0cd: push 0xae26c4
        R.call(0x66f4e0, { n: 0, thisEcx: false, calleeClean: false }); // 8cd0d2: call 0x66f4e0
        R.push(0x0); // 8cd0d7: push 0
        R.push(0xae26c4); // 8cd0d9: push 0xae26c4
        R.push(0xae28bc); // 8cd0de: push 0xae28bc
        R.call(0x5e8290, { n: 6, thisEcx: false, calleeClean: false }); // 8cd0e3: call 0x5e8290
        R.eax = (R.m.u32(((R.esp + 0x290) | 0) >>> 0)) | 0; // 8cd0e8: mov eax, dword ptr [esp + 0x290]
        R.esp = (R.add((R.esp >>> 0), 0x18, 32)) | 0; // 8cd0ef: add esp, 0x18
        R.ecx = (((R.esp + 0x24) | 0)) | 0; // 8cd0f2: lea ecx, [esp + 0x24]
        R.m.w32(((R.esp + 0x26c) | 0) >>> 0, 0xffffffff); // 8cd0f6: mov dword ptr [esp + 0x26c], 0xffffffff
        R.m.w32(((R.eax) | 0) >>> 0, 0x0); // 8cd101: mov dword ptr [eax], 0
        R.call(0x68d040, { n: 0, thisEcx: true, calleeClean: false }); // 8cd107: call 0x68d040
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8cd10c: xor eax, eax
        pc = 0x8ccf9a; continue; // 8cd10e: jmp 0x8ccf9a
      default: throw new Error(`f_8ccb80: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
