// 0x8d0590 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4cf5a0=1c, 549f70=4tc, 54a110=4t, 54cf70=0t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_8d0590(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x8d0590;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x8d0590:
        R.esp = (R.sub((R.esp >>> 0), 0x10, 32)) | 0; // 8d0590: sub esp, 0x10
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) ^ ((R.edx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 8d0593: xor dl, dl
        R.ecx = (R.add((R.ecx >>> 0), 0x8ac, 32)) | 0; // 8d0595: add ecx, 0x8ac
        R.push((R.ebx >>> 0)); // 8d059b: push ebx
        R.push((R.ebp >>> 0)); // 8d059c: push ebp
        R.ebp = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 8d059d: mov ebp, dword ptr [esp + 0x1c]
        R.push((R.esi >>> 0)); // 8d05a1: push esi
        R.push((R.edi >>> 0)); // 8d05a2: push edi
        R.eax = ((R.ecx >>> 0)) | 0; // 8d05a3: mov eax, ecx
        R.esi = (R.m.u32(((R.ebp + 0x53) | 0) >>> 0)) | 0; // 8d05a5: mov esi, dword ptr [ebp + 0x53]
        pc = 0x8d05a8; continue;
      case 0x8d05a8:
        R.edi = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8d05a8: mov edi, dword ptr [eax]
        R.sub(R.m.u32(((R.edi + 0xa) | 0) >>> 0), (R.esi >>> 0), 32); // 8d05aa: cmp dword ptr [edi + 0xa], esi
        if (R.zf) { pc = 0x8d065f; continue; } // 8d05ad: je 0x8d065f
        pc = 0x8d05b3; continue;
      case 0x8d05b3:
        R.edx = ((R.edx & 0xffffff00) | (((R.incdec(((R.edx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 8d05b3: inc dl
        R.eax = (R.add((R.eax >>> 0), 0x4, 32)) | 0; // 8d05b5: add eax, 4
        R.sub(((R.edx >>> 0) & 0xff), 0x1c, 8); // 8d05b8: cmp dl, 0x1c
        if (R.cL) { pc = 0x8d05a8; continue; } // 8d05bb: jl 0x8d05a8
        pc = 0x8d05bd; continue;
      case 0x8d05bd:
        R.ebx = (R.m.u32(((R.esp + 0x2c) | 0) >>> 0)) | 0; // 8d05bd: mov ebx, dword ptr [esp + 0x2c]
        R.edi = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 8d05c1: mov edi, dword ptr [esp + 0x3c]
        R.esi = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 8d05c5: mov esi, dword ptr [esp + 0x38]
        R.eax = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 8d05c9: mov eax, dword ptr [esp + 0x34]
        R.ecx = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 8d05cd: mov ecx, dword ptr [ecx]
        R.push((R.ebx >>> 0)); // 8d05cf: push ebx
        R.push((R.edi >>> 0)); // 8d05d0: push edi
        R.push((R.esi >>> 0)); // 8d05d1: push esi
        R.edx = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 8d05d2: mov edx, dword ptr [ecx]
        R.push((R.eax >>> 0)); // 8d05d4: push eax
        R.eax = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 8d05d5: mov eax, dword ptr [esp + 0x40]
        R.push((R.eax >>> 0)); // 8d05d9: push eax
        R.eax = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 8d05da: mov eax, dword ptr [esp + 0x3c]
        R.push((R.eax >>> 0)); // 8d05de: push eax
        R.push((R.ebp >>> 0)); // 8d05df: push ebp
        pc = 0x8d05e0; continue;
      case 0x8d05e0:
        R.callInd(R.m.u32(((R.edx + 0x28) | 0) >>> 0)); // 8d05e0: call dword ptr [edx + 0x28]
        R.ecx = (0xae2c90) | 0; // 8d05e3: mov ecx, 0xae2c90
        R.call(0x54cf70, { n: 0, thisEcx: true, calleeClean: false }); // 8d05e8: call 0x54cf70
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8d05ed: mov ecx, dword ptr [0xae1050]
        R.push((R.ebx >>> 0)); // 8d05f3: push ebx
        R.ebp = ((R.eax >>> 0)) | 0; // 8d05f4: mov ebp, eax
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 8d05f6: call 0x4cf5a0
        R.ebx = ((R.eax >>> 0)) | 0; // 8d05fb: mov ebx, eax
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 8d05fd: test ebx, ebx
        if (R.zf) { pc = 0x8d075f; continue; } // 8d05ff: je 0x8d075f
        pc = 0x8d0605; continue;
      case 0x8d0605:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.ebx + 0x35) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8d0605: mov cl, byte ptr [ebx + 0x35]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0x3f, 8)) & 0xff) << 0)) | 0; // 8d0608: and cl, 0x3f
        R.sub(((R.ecx >>> 0) & 0xff), 0x2, 8); // 8d060b: cmp cl, 2
        if (!R.zf) { pc = 0x8d075f; continue; } // 8d060e: jne 0x8d075f
        pc = 0x8d0614; continue;
      case 0x8d0614:
        R.ecx = (R.m.u32(((0xae2c90) | 0) >>> 0)) | 0; // 8d0614: mov ecx, dword ptr [0xae2c90]
        R.edx = (R.m.u32(((0xae2c94) | 0) >>> 0)) | 0; // 8d061a: mov edx, dword ptr [0xae2c94]
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.ebx + 0x2f) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8d0620: mov ax, word ptr [ebx + 0x2f]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 8d0624: mov dword ptr [esp + 0x10], ecx
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edx >>> 0)); // 8d0628: mov dword ptr [esp + 0x14], edx
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.esp + 0x12) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8d062c: mov dx, word ptr [esp + 0x12]
        R.sub(((R.edx >>> 0) & 0xffff), ((R.eax >>> 0) & 0xffff), 16); // 8d0631: cmp dx, ax
        if (!R.cBE) { pc = 0x8d0645; continue; } // 8d0634: ja 0x8d0645
        pc = 0x8d0636; continue;
      case 0x8d0636:
        if (R.cf) { pc = 0x8d0691; continue; } // 8d0636: jb 0x8d0691
        pc = 0x8d0638; continue;
      case 0x8d0638:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8d0638: xor eax, eax
        R.sub(((R.ecx >>> 0) & 0xffff), R.m.u16(((R.ebx + 0x2d) | 0) >>> 0), 16); // 8d063a: cmp cx, word ptr [ebx + 0x2d]
        R.eax = ((R.eax & 0xffffff00) | (((!R.cLE ? 1 : 0) & 0xff) << 0)) | 0; // 8d063e: setg al
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8d0641: test eax, eax
        if (R.zf) { pc = 0x8d0691; continue; } // 8d0643: je 0x8d0691
        pc = 0x8d0645; continue;
      case 0x8d0645:
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 8d0645: lea ecx, [esp + 0x10]
        R.call(0x54a110, { n: 4, thisEcx: true, calleeClean: false }); // 8d0649: call 0x54a110
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.eax + 0x2) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8d064e: mov ax, word ptr [eax + 2]
        R.m.w16(((R.edi) | 0) >>> 0, ((R.eax >>> 0) & 0xffff)); // 8d0652: mov word ptr [edi], ax
        R.edi = (R.pop()) | 0; // 8d0655: pop edi
        R.esi = (R.pop()) | 0; // 8d0656: pop esi
        R.ebp = (R.pop()) | 0; // 8d0657: pop ebp
        R.ebx = (R.pop()) | 0; // 8d0658: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 8d0659: add esp, 0x10
        return R.ret(7); // 8d065c: ret 0x1c
      case 0x8d065f:
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8d065f: mov eax, dword ptr [eax]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8d0661: test eax, eax
        if (R.zf) { pc = 0x8d05bd; continue; } // 8d0663: je 0x8d05bd
        pc = 0x8d0669; continue;
      case 0x8d0669:
        R.ebx = (R.m.u32(((R.esp + 0x2c) | 0) >>> 0)) | 0; // 8d0669: mov ebx, dword ptr [esp + 0x2c]
        R.edi = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 8d066d: mov edi, dword ptr [esp + 0x3c]
        R.esi = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 8d0671: mov esi, dword ptr [esp + 0x38]
        R.ecx = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 8d0675: mov ecx, dword ptr [esp + 0x34]
        R.push((R.ebx >>> 0)); // 8d0679: push ebx
        R.push((R.edi >>> 0)); // 8d067a: push edi
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8d067b: mov edx, dword ptr [eax]
        R.push((R.esi >>> 0)); // 8d067d: push esi
        R.push((R.ecx >>> 0)); // 8d067e: push ecx
        R.ecx = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 8d067f: mov ecx, dword ptr [esp + 0x40]
        R.push((R.ecx >>> 0)); // 8d0683: push ecx
        R.ecx = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 8d0684: mov ecx, dword ptr [esp + 0x3c]
        R.push((R.ecx >>> 0)); // 8d0688: push ecx
        R.push((R.ebp >>> 0)); // 8d0689: push ebp
        R.ecx = ((R.eax >>> 0)) | 0; // 8d068a: mov ecx, eax
        pc = 0x8d05e0; continue; // 8d068c: jmp 0x8d05e0
      case 0x8d0691:
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.edi) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8d0691: mov ax, word ptr [edi]
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 8d0694: xor ecx, ecx
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8d0696: mov cx, word ptr [0xae2c92]
        R.edx = ((R.eax >>> 0)) | 0; // 8d069d: mov edx, eax
        R.ecx = (R.add((R.ecx >>> 0), 0x5, 32)) | 0; // 8d069f: add ecx, 5
        R.edx = (R.logic((R.edx >>> 0) & 0xffff, 32)) | 0; // 8d06a2: and edx, 0xffff
        R.sub((R.edx >>> 0), (R.ecx >>> 0), 32); // 8d06a8: cmp edx, ecx
        if (R.cLE) { pc = 0x8d06c6; continue; } // 8d06aa: jle 0x8d06c6
        pc = 0x8d06ac; continue;
      case 0x8d06ac:
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 8d06ac: lea ecx, [esp + 0x10]
        R.call(0x54a110, { n: 4, thisEcx: true, calleeClean: false }); // 8d06b0: call 0x54a110
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.eax + 0x2) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8d06b5: mov ax, word ptr [eax + 2]
        R.m.w16(((R.edi) | 0) >>> 0, ((R.eax >>> 0) & 0xffff)); // 8d06b9: mov word ptr [edi], ax
        R.edi = (R.pop()) | 0; // 8d06bc: pop edi
        R.esi = (R.pop()) | 0; // 8d06bd: pop esi
        R.ebp = (R.pop()) | 0; // 8d06be: pop ebp
        R.ebx = (R.pop()) | 0; // 8d06bf: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 8d06c0: add esp, 0x10
        return R.ret(7); // 8d06c3: ret 0x1c
      case 0x8d06c6:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esi) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8d06c6: mov cl, byte ptr [esi]
        R.push(0xffffffff); // 8d06c8: push -1
        R.push((R.eax >>> 0)); // 8d06ca: push eax
        R.push((R.ecx >>> 0)); // 8d06cb: push ecx
        R.push((R.ebp >>> 0)); // 8d06cc: push ebp
        R.ecx = (((R.esp + 0x28) | 0)) | 0; // 8d06cd: lea ecx, [esp + 0x28]
        R.call(0x549f70, { n: 4, thisEcx: true, calleeClean: true }); // 8d06d1: call 0x549f70
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8d06d6: mov ecx, dword ptr [eax]
        R.edx = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 8d06d8: mov edx, dword ptr [eax + 4]
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.ebx + 0x2f) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8d06db: mov ax, word ptr [ebx + 0x2f]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 8d06df: mov dword ptr [esp + 0x10], ecx
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edx >>> 0)); // 8d06e3: mov dword ptr [esp + 0x14], edx
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.esp + 0x12) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8d06e7: mov dx, word ptr [esp + 0x12]
        R.sub(((R.edx >>> 0) & 0xffff), ((R.eax >>> 0) & 0xffff), 16); // 8d06ec: cmp dx, ax
        if (!R.cBE) { pc = 0x8d0700; continue; } // 8d06ef: ja 0x8d0700
        pc = 0x8d06f1; continue;
      case 0x8d06f1:
        if (R.cf) { pc = 0x8d076f; continue; } // 8d06f1: jb 0x8d076f
        pc = 0x8d06f3; continue;
      case 0x8d06f3:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8d06f3: xor eax, eax
        R.sub(((R.ecx >>> 0) & 0xffff), R.m.u16(((R.ebx + 0x2d) | 0) >>> 0), 16); // 8d06f5: cmp cx, word ptr [ebx + 0x2d]
        R.eax = ((R.eax & 0xffffff00) | (((!R.cLE ? 1 : 0) & 0xff) << 0)) | 0; // 8d06f9: setg al
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8d06fc: test eax, eax
        if (R.zf) { pc = 0x8d076f; continue; } // 8d06fe: je 0x8d076f
        pc = 0x8d0700; continue;
      case 0x8d0700:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8d0700: mov al, byte ptr [esi]
        R.eax = ((R.eax & 0xffffff00) | (((R.incdec(((R.eax >>> 0) & 0xff), -1, 8)) & 0xff) << 0)) | 0; // 8d0702: dec al
        R.m.w8(((R.esi) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 8d0704: mov byte ptr [esi], al
        if (!R.sf) { pc = 0x8d070e; continue; } // 8d0706: jns 0x8d070e
        pc = 0x8d0708; continue;
      case 0x8d0708:
        R.m.w16(((R.edi) | 0) >>> 0, R.incdec(R.m.u16(((R.edi) | 0) >>> 0), -1, 16)); // 8d0708: dec word ptr [edi]
        R.m.w8(((R.esi) | 0) >>> 0, 0xb); // 8d070b: mov byte ptr [esi], 0xb
        pc = 0x8d070e; continue;
      case 0x8d070e:
        R.edx = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 8d070e: mov edx, dword ptr [esp + 0x34]
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.edi) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8d0712: mov cx, word ptr [edi]
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.edx) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8d0715: mov ax, word ptr [edx]
        R.sub(((R.eax >>> 0) & 0xffff), ((R.ecx >>> 0) & 0xffff), 16); // 8d0718: cmp ax, cx
        if (!R.cBE) { pc = 0x8d072b; continue; } // 8d071b: ja 0x8d072b
        pc = 0x8d071d; continue;
      case 0x8d071d:
        if (!R.zf) { pc = 0x8d0739; continue; } // 8d071d: jne 0x8d0739
        pc = 0x8d071f; continue;
      case 0x8d071f:
        R.eax = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 8d071f: mov eax, dword ptr [esp + 0x30]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8d0723: mov cl, byte ptr [eax]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8d0725: mov al, byte ptr [esi]
        R.sub(((R.ecx >>> 0) & 0xff), ((R.eax >>> 0) & 0xff), 8); // 8d0727: cmp cl, al
        if (R.cLE) { pc = 0x8d0739; continue; } // 8d0729: jle 0x8d0739
        pc = 0x8d072b; continue;
      case 0x8d072b:
        R.ecx = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 8d072b: mov ecx, dword ptr [esp + 0x30]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8d072f: mov al, byte ptr [esi]
        R.m.w8(((R.ecx) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 8d0731: mov byte ptr [ecx], al
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.edi) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8d0733: mov ax, word ptr [edi]
        R.m.w16(((R.edx) | 0) >>> 0, ((R.eax >>> 0) & 0xffff)); // 8d0736: mov word ptr [edx], ax
        pc = 0x8d0739; continue;
      case 0x8d0739:
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.edi) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8d0739: mov ax, word ptr [edi]
        R.sub(((R.eax >>> 0) & 0xffff), R.m.u16(((0xae2c92) | 0) >>> 0), 16); // 8d073c: cmp ax, word ptr [0xae2c92]
        if (!R.cf) { pc = 0x8d06c6; continue; } // 8d0743: jae 0x8d06c6
        pc = 0x8d0745; continue;
      case 0x8d0745:
        R.ecx = (((R.esp + 0x18) | 0)) | 0; // 8d0745: lea ecx, [esp + 0x18]
        R.call(0x54a110, { n: 4, thisEcx: true, calleeClean: false }); // 8d0749: call 0x54a110
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.eax + 0x2) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8d074e: mov cx, word ptr [eax + 2]
        R.m.w16(((R.edi) | 0) >>> 0, ((R.ecx >>> 0) & 0xffff)); // 8d0752: mov word ptr [edi], cx
        R.edi = (R.pop()) | 0; // 8d0755: pop edi
        R.esi = (R.pop()) | 0; // 8d0756: pop esi
        R.ebp = (R.pop()) | 0; // 8d0757: pop ebp
        R.ebx = (R.pop()) | 0; // 8d0758: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 8d0759: add esp, 0x10
        return R.ret(7); // 8d075c: ret 0x1c
      case 0x8d075f:
        R.ecx = (((R.esp + 0x18) | 0)) | 0; // 8d075f: lea ecx, [esp + 0x18]
        R.call(0x54a110, { n: 4, thisEcx: true, calleeClean: false }); // 8d0763: call 0x54a110
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.eax + 0x2) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8d0768: mov dx, word ptr [eax + 2]
        R.m.w16(((R.edi) | 0) >>> 0, ((R.edx >>> 0) & 0xffff)); // 8d076c: mov word ptr [edi], dx
        pc = 0x8d076f; continue;
      case 0x8d076f:
        R.edi = (R.pop()) | 0; // 8d076f: pop edi
        R.esi = (R.pop()) | 0; // 8d0770: pop esi
        R.ebp = (R.pop()) | 0; // 8d0771: pop ebp
        R.ebx = (R.pop()) | 0; // 8d0772: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 8d0773: add esp, 0x10
        return R.ret(7); // 8d0776: ret 0x1c
      default: throw new Error(`f_8d0590: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
