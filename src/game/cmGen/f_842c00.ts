// 0x842c00 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4cf5a0=1c, 53b900=1, 54c8e0=2tc, 5b7d20=1, 842e10=3tc, 8cca10=2tc
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_842c00(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x842c00;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x842c00:
        R.esp = (R.sub((R.esp >>> 0), 0x14, 32)) | 0; // 842c00: sub esp, 0x14
        R.push((R.ebx >>> 0)); // 842c03: push ebx
        R.push((R.ebp >>> 0)); // 842c04: push ebp
        R.push((R.esi >>> 0)); // 842c05: push esi
        R.push((R.edi >>> 0)); // 842c06: push edi
        R.edi = (R.m.u32(((R.esp + 0x28) | 0) >>> 0)) | 0; // 842c07: mov edi, dword ptr [esp + 0x28]
        R.esi = (R.logic((R.esi >>> 0) ^ (R.esi >>> 0), 32)) | 0; // 842c0b: xor esi, esi
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.ecx >>> 0)); // 842c0d: mov dword ptr [esp + 0x18], ecx
        R.eax = (R.m.u32(((R.edi + 0x61) | 0) >>> 0)) | 0; // 842c11: mov eax, dword ptr [edi + 0x61]
        R.sub((R.eax >>> 0), (R.esi >>> 0), 32); // 842c14: cmp eax, esi
        if (R.zf) { pc = 0x842df7; continue; } // 842c16: je 0x842df7
        pc = 0x842c1c; continue;
      case 0x842c1c:
        R.sub(R.m.u32(((R.esp + 0x2c) | 0) >>> 0), (R.esi >>> 0), 32); // 842c1c: cmp dword ptr [esp + 0x2c], esi
        if (!R.zf) { pc = 0x842c2e; continue; } // 842c20: jne 0x842c2e
        pc = 0x842c22; continue;
      case 0x842c22:
        R.sub(R.m.u16(((R.eax + 0xb) | 0) >>> 0), 0x157c, 16); // 842c22: cmp word ptr [eax + 0xb], 0x157c
        if (R.cL) { pc = 0x842df7; continue; } // 842c28: jl 0x842df7
        pc = 0x842c2e; continue;
      case 0x842c2e:
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 842c2e: mov eax, dword ptr [edi]
        R.edx = (R.m.u32(((0xae2d0c) | 0) >>> 0)) | 0; // 842c30: mov edx, dword ptr [0xae2d0c]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 842c36: lea ecx, [eax + eax*4]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 842c39: shl ecx, 4
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 842c3c: sub ecx, eax
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + R.edx + 0xb) | 0) >>> 0)) & 0xff) << 0)) | 0; // 842c3e: mov al, byte ptr [ecx + edx + 0xb]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x30, 8)) & 0xff) << 0)) | 0; // 842c42: and al, 0x30
        R.sub(((R.eax >>> 0) & 0xff), 0x10, 8); // 842c44: cmp al, 0x10
        if (R.zf) { pc = 0x842df7; continue; } // 842c46: je 0x842df7
        pc = 0x842c4c; continue;
      case 0x842c4c:
        R.sub(R.m.u8(((R.edi + 0x3d) | 0) >>> 0), 0xb, 8); // 842c4c: cmp byte ptr [edi + 0x3d], 0xb
        if (!R.zf) { pc = 0x842df7; continue; } // 842c50: jne 0x842df7
        pc = 0x842c56; continue;
      case 0x842c56:
        R.sub(R.m.u32(((R.edi + 0x24) | 0) >>> 0), (R.esi >>> 0), 32); // 842c56: cmp dword ptr [edi + 0x24], esi
        if (R.zf) { pc = 0x842c65; continue; } // 842c59: je 0x842c65
        pc = 0x842c5b; continue;
      case 0x842c5b:
        R.sub(R.m.u8(((R.edi + 0x28) | 0) >>> 0), 0x5, 8); // 842c5b: cmp byte ptr [edi + 0x28], 5
        if (R.zf) { pc = 0x842df7; continue; } // 842c5f: je 0x842df7
        pc = 0x842c65; continue;
      case 0x842c65:
        R.eax = (R.m.u32(((R.edi + 0x1a) | 0) >>> 0)) | 0; // 842c65: mov eax, dword ptr [edi + 0x1a]
        R.sub((R.eax >>> 0), (R.esi >>> 0), 32); // 842c68: cmp eax, esi
        if (R.zf) { pc = 0x842c7b; continue; } // 842c6a: je 0x842c7b
        pc = 0x842c6c; continue;
      case 0x842c6c:
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 842c6c: mov ecx, dword ptr [eax]
        R.eax = (R.m.u32(((0x9cf458) | 0) >>> 0)) | 0; // 842c6e: mov eax, dword ptr [0x9cf458]
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 842c73: cmp ecx, eax
        if (R.zf) { pc = 0x842df7; continue; } // 842c75: je 0x842df7
        pc = 0x842c7b; continue;
      case 0x842c7b:
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 842c7b: mov ecx, dword ptr [0xde1f54]
        R.push((R.esi >>> 0)); // 842c81: push esi
        R.push((R.edi >>> 0)); // 842c82: push edi
        R.call(0x8cca10, { n: 2, thisEcx: true, calleeClean: true }); // 842c83: call 0x8cca10
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 842c88: test eax, eax
        if (!R.zf) { pc = 0x842df7; continue; } // 842c8a: jne 0x842df7
        pc = 0x842c90; continue;
      case 0x842c90:
        R.sub(R.m.u32(((R.edi + 0x39) | 0) >>> 0), (R.esi >>> 0), 32); // 842c90: cmp dword ptr [edi + 0x39], esi
        if (R.zf) { pc = 0x842cf7; continue; } // 842c93: je 0x842cf7
        pc = 0x842c95; continue;
      case 0x842c95:
        R.edx = (((R.esp + 0x1c) | 0)) | 0; // 842c95: lea edx, [esp + 0x1c]
        R.push(0xc8); // 842c99: push 0xc8
        R.push((R.edx >>> 0)); // 842c9e: push edx
        R.ecx = (0xae2c90) | 0; // 842c9f: mov ecx, 0xae2c90
        R.call(0x54c8e0, { n: 2, thisEcx: true, calleeClean: true }); // 842ca4: call 0x54c8e0
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 842ca9: mov ecx, dword ptr [eax]
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 842cab: mov eax, dword ptr [eax + 4]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 842cae: mov dword ptr [esp + 0x10], ecx
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.esp + 0x12) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 842cb2: mov dx, word ptr [esp + 0x12]
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.eax >>> 0)); // 842cb7: mov dword ptr [esp + 0x14], eax
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.edi + 0x40) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 842cbb: mov ax, word ptr [edi + 0x40]
        R.sub(((R.edx >>> 0) & 0xffff), ((R.eax >>> 0) & 0xffff), 16); // 842cbf: cmp dx, ax
        if (R.cf) { pc = 0x842cd3; continue; } // 842cc2: jb 0x842cd3
        pc = 0x842cc4; continue;
      case 0x842cc4:
        if (!R.cBE) { pc = 0x842cf7; continue; } // 842cc4: ja 0x842cf7
        pc = 0x842cc6; continue;
      case 0x842cc6:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 842cc6: xor eax, eax
        R.sub(((R.ecx >>> 0) & 0xffff), R.m.u16(((R.edi + 0x3e) | 0) >>> 0), 16); // 842cc8: cmp cx, word ptr [edi + 0x3e]
        R.eax = ((R.eax & 0xffffff00) | (((R.cL ? 1 : 0) & 0xff) << 0)) | 0; // 842ccc: setl al
        R.sub((R.eax >>> 0), (R.esi >>> 0), 32); // 842ccf: cmp eax, esi
        if (R.zf) { pc = 0x842cf7; continue; } // 842cd1: je 0x842cf7
        pc = 0x842cd3; continue;
      case 0x842cd3:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 842cd3: mov ecx, dword ptr [0xae1050]
        R.push((R.edi >>> 0)); // 842cd9: push edi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 842cda: call 0x4cf5a0
        R.sub((R.eax >>> 0), (R.esi >>> 0), 32); // 842cdf: cmp eax, esi
        if (R.zf) { pc = 0x842cf7; continue; } // 842ce1: je 0x842cf7
        pc = 0x842ce3; continue;
      case 0x842ce3:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 842ce3: mov cl, byte ptr [eax + 0x4f]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 842ce6: and cl, 0xf0
        R.sub(((R.ecx >>> 0) & 0xff), 0x70, 8); // 842ce9: cmp cl, 0x70
        if (R.zf) { pc = 0x842cf7; continue; } // 842cec: je 0x842cf7
        pc = 0x842cee; continue;
      case 0x842cee:
        R.sub(R.m.u32(((R.eax + 0x45) | 0) >>> 0), (R.esi >>> 0), 32); // 842cee: cmp dword ptr [eax + 0x45], esi
        if (R.zf) { pc = 0x842df7; continue; } // 842cf1: je 0x842df7
        pc = 0x842cf7; continue;
      case 0x842cf7:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 842cf7: mov ecx, dword ptr [0xae1050]
        R.push((R.edi >>> 0)); // 842cfd: push edi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 842cfe: call 0x4cf5a0
        R.sub((R.eax >>> 0), (R.esi >>> 0), 32); // 842d03: cmp eax, esi
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 842d05: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x842d28; continue; } // 842d0a: je 0x842d28
        pc = 0x842d0c; continue;
      case 0x842d0c:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 842d0c: mov eax, dword ptr [eax + 4]
        R.ecx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 842d0f: mov ecx, dword ptr [0xae23b4]
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 842d15: lea edx, [eax + eax*8]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 842d18: shl edx, 4
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 842d1b: add edx, eax
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 842d1d: add ecx, eax
        R.edx = (((R.ecx + R.edx * 4) | 0)) | 0; // 842d1f: lea edx, [ecx + edx*4]
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.edx >>> 0)); // 842d22: mov dword ptr [esp + 0x2c], edx
        pc = 0x842d2c; continue; // 842d26: jmp 0x842d2c
      case 0x842d28:
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.esi >>> 0)); // 842d28: mov dword ptr [esp + 0x2c], esi
        pc = 0x842d2c; continue;
      case 0x842d2c:
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 842d2c: mov eax, dword ptr [edi]
        R.edx = (R.m.u32(((0xae2d0c) | 0) >>> 0)) | 0; // 842d2e: mov edx, dword ptr [0xae2d0c]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 842d34: lea ecx, [eax + eax*4]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 842d37: shl ecx, 4
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 842d3a: sub ecx, eax
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + R.edx + 0xb) | 0) >>> 0)) & 0xff) << 0)) | 0; // 842d3c: mov al, byte ptr [ecx + edx + 0xb]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf, 8)) & 0xff) << 0)) | 0; // 842d40: and al, 0xf
        R.m.w8(((R.esp + 0x28) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 842d42: mov byte ptr [esp + 0x28], al
        R.eax = (R.m.u32(((R.edi + 0x61) | 0) >>> 0)) | 0; // 842d46: mov eax, dword ptr [edi + 0x61]
        R.push((R.eax >>> 0)); // 842d49: push eax
        R.call(0x5b7d20, { n: 1, thisEcx: false, calleeClean: false }); // 842d4a: call 0x5b7d20
        R.ebx = ((R.eax >>> 0)) | 0; // 842d4f: mov ebx, eax
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 842d51: add esp, 4
        R.logic(((R.ebx >>> 0) & 0xff) & 0x2, 8); // 842d54: test bl, 2
        if (R.zf) { pc = 0x842d5c; continue; } // 842d57: je 0x842d5c
        pc = 0x842d59; continue;
      case 0x842d59:
        R.ebx = (R.logic((R.ebx >>> 0) | 0x4, 32)) | 0; // 842d59: or ebx, 4
        pc = 0x842d5c; continue;
      case 0x842d5c:
        R.logic(((R.ebx >>> 0) & 0xff) & 0x8, 8); // 842d5c: test bl, 8
        if (R.zf) { pc = 0x842d64; continue; } // 842d5f: je 0x842d64
        pc = 0x842d61; continue;
      case 0x842d61:
        R.ebx = (R.logic((R.ebx >>> 0) | 0x10, 32)) | 0; // 842d61: or ebx, 0x10
        pc = 0x842d64; continue;
      case 0x842d64:
        R.logic(((R.ebx >>> 0) & 0xff) & 0x20, 8); // 842d64: test bl, 0x20
        if (R.zf) { pc = 0x842d6c; continue; } // 842d67: je 0x842d6c
        pc = 0x842d69; continue;
      case 0x842d69:
        R.ebx = (R.logic((R.ebx >>> 0) | 0x10, 32)) | 0; // 842d69: or ebx, 0x10
        pc = 0x842d6c; continue;
      case 0x842d6c:
        R.logic(((R.ebx >>> 0) & 0xff) & 0x80, 8); // 842d6c: test bl, 0x80
        if (R.zf) { pc = 0x842d74; continue; } // 842d6f: je 0x842d74
        pc = 0x842d71; continue;
      case 0x842d71:
        R.ebx = ((R.ebx & 0xffff00ff) | (((R.logic(((R.ebx >>> 8) & 0xff) | 0x1, 8)) & 0xff) << 8)) | 0; // 842d71: or bh, 1
        pc = 0x842d74; continue;
      case 0x842d74:
        R.ecx = ((R.ebx >>> 0)) | 0; // 842d74: mov ecx, ebx
        R.ecx = (R.logic((R.ecx >>> 0) & 0x800, 32)) | 0; // 842d76: and ecx, 0x800
        R.logic(((R.ecx >>> 0) & 0xffff) & ((R.ecx >>> 0) & 0xffff), 16); // 842d7c: test cx, cx
        if (R.zf) { pc = 0x842d84; continue; } // 842d7f: je 0x842d84
        pc = 0x842d81; continue;
      case 0x842d81:
        R.ebx = ((R.ebx & 0xffff00ff) | (((R.logic(((R.ebx >>> 8) & 0xff) | 0x4, 8)) & 0xff) << 8)) | 0; // 842d81: or bh, 4
        pc = 0x842d84; continue;
      case 0x842d84:
        R.eax = (R.m.u32(((0xae235c) | 0) >>> 0)) | 0; // 842d84: mov eax, dword ptr [0xae235c]
        R.ebp = (R.m.u32(((0xae2d1c) | 0) >>> 0)) | 0; // 842d89: mov ebp, dword ptr [0xae2d1c]
        R.sub((R.eax >>> 0), (R.esi >>> 0), 32); // 842d8f: cmp eax, esi
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.esi >>> 0)); // 842d91: mov dword ptr [esp + 0x10], esi
        if (R.cLE) { pc = 0x842df7; continue; } // 842d95: jle 0x842df7
        pc = 0x842d97; continue;
      case 0x842d97:
        R.eax = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 842d97: mov eax, dword ptr [ebp]
        R.ecx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 842d9a: mov ecx, dword ptr [0xae23b4]
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 842da0: add ecx, eax
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 842da2: lea edx, [eax + eax*8]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 842da5: shl edx, 4
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 842da8: add edx, eax
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x28) | 0) >>> 0)) & 0xff) << 0)) | 0; // 842daa: mov al, byte ptr [esp + 0x28]
        R.sub(((R.eax >>> 0) & 0xff), 0x5, 8); // 842dae: cmp al, 5
        R.esi = (((R.ecx + R.edx * 4) | 0)) | 0; // 842db0: lea esi, [ecx + edx*4]
        if (!R.cL) { pc = 0x842df7; continue; } // 842db3: jge 0x842df7
        pc = 0x842db5; continue;
      case 0x842db5:
        R.push((R.esi >>> 0)); // 842db5: push esi
        R.call(0x53b900, { n: 1, thisEcx: false, calleeClean: false }); // 842db6: call 0x53b900
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 842dbb: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 842dbe: test eax, eax
        if (!R.zf) { pc = 0x842de1; continue; } // 842dc0: jne 0x842de1
        pc = 0x842dc2; continue;
      case 0x842dc2:
        R.sub(R.m.u32(((R.esp + 0x2c) | 0) >>> 0), (R.esi >>> 0), 32); // 842dc2: cmp dword ptr [esp + 0x2c], esi
        if (R.zf) { pc = 0x842de1; continue; } // 842dc6: je 0x842de1
        pc = 0x842dc8; continue;
      case 0x842dc8:
        R.sub(R.m.u32(((R.edi + 0x39) | 0) >>> 0), (R.esi >>> 0), 32); // 842dc8: cmp dword ptr [edi + 0x39], esi
        if (R.zf) { pc = 0x842de1; continue; } // 842dcb: je 0x842de1
        pc = 0x842dcd; continue;
      case 0x842dcd:
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 842dcd: mov ecx, dword ptr [esp + 0x18]
        R.push((R.ebx >>> 0)); // 842dd1: push ebx
        R.push((R.esi >>> 0)); // 842dd2: push esi
        R.push((R.edi >>> 0)); // 842dd3: push edi
        R.call(0x842e10, { n: 3, thisEcx: true, calleeClean: true }); // 842dd4: call 0x842e10
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 842dd9: test eax, eax
        if (R.zf) { pc = 0x842de1; continue; } // 842ddb: je 0x842de1
        pc = 0x842ddd; continue;
      case 0x842ddd:
        R.m.w8(((R.esp + 0x28) | 0) >>> 0, R.incdec(R.m.u8(((R.esp + 0x28) | 0) >>> 0), 1, 8)); // 842ddd: inc byte ptr [esp + 0x28]
        pc = 0x842de1; continue;
      case 0x842de1:
        R.eax = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 842de1: mov eax, dword ptr [esp + 0x10]
        R.ecx = (R.m.u32(((0xae235c) | 0) >>> 0)) | 0; // 842de5: mov ecx, dword ptr [0xae235c]
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 842deb: inc eax
        R.ebp = (R.add((R.ebp >>> 0), 0x4, 32)) | 0; // 842dec: add ebp, 4
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 842def: cmp eax, ecx
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 842df1: mov dword ptr [esp + 0x10], eax
        if (R.cL) { pc = 0x842d97; continue; } // 842df5: jl 0x842d97
        pc = 0x842df7; continue;
      case 0x842df7:
        R.edi = (R.pop()) | 0; // 842df7: pop edi
        R.esi = (R.pop()) | 0; // 842df8: pop esi
        R.ebp = (R.pop()) | 0; // 842df9: pop ebp
        R.ebx = (R.pop()) | 0; // 842dfa: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 842dfb: add esp, 0x14
        return R.eax; // 842dfe: ret 8
      default: throw new Error(`f_842c00: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
