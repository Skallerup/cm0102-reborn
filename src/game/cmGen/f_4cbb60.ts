// 0x4cbb60 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 53b620=1, 540a50=3, 542740=1
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_4cbb60(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x4cbb60;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x4cbb60:
        R.push((R.ecx >>> 0)); // 4cbb60: push ecx
        R.push((R.ebx >>> 0)); // 4cbb61: push ebx
        R.push((R.ebp >>> 0)); // 4cbb62: push ebp
        R.push((R.esi >>> 0)); // 4cbb63: push esi
        R.esi = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 4cbb64: mov esi, dword ptr [esp + 0x14]
        R.ebx = (R.logic((R.ebx >>> 0) ^ (R.ebx >>> 0), 32)) | 0; // 4cbb68: xor ebx, ebx
        R.push((R.edi >>> 0)); // 4cbb6a: push edi
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x3d) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4cbb6b: mov al, byte ptr [esi + 0x3d]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 4cbb6e: mov dword ptr [esp + 0x10], ecx
        R.sub(((R.eax >>> 0) & 0xff), 0xc, 8); // 4cbb72: cmp al, 0xc
        if (R.zf) { pc = 0x4cbd0f; continue; } // 4cbb74: je 0x4cbd0f
        pc = 0x4cbb7a; continue;
      case 0x4cbb7a:
        R.push((R.eax >>> 0)); // 4cbb7a: push eax
        R.call(0x53b620, { n: 1, thisEcx: false, calleeClean: false }); // 4cbb7b: call 0x53b620
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 4cbb80: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4cbb83: test eax, eax
        if (R.zf) { pc = 0x4cbd0f; continue; } // 4cbb85: je 0x4cbd0f
        pc = 0x4cbb8b; continue;
      case 0x4cbb8b:
        R.eax = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 4cbb8b: mov eax, dword ptr [esi + 0x39]
        R.edi = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 4cbb8e: mov edi, dword ptr [esp + 0x1c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4cbb92: test eax, eax
        if (R.zf) { pc = 0x4cbbc9; continue; } // 4cbb94: je 0x4cbbc9
        pc = 0x4cbb96; continue;
      case 0x4cbb96:
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 4cbb96: cmp eax, edi
        if (!R.zf) { pc = 0x4cbbc9; continue; } // 4cbb98: jne 0x4cbbc9
        pc = 0x4cbb9a; continue;
      case 0x4cbb9a:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x3d) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4cbb9a: mov al, byte ptr [esi + 0x3d]
        R.push((R.eax >>> 0)); // 4cbb9d: push eax
        R.call(0x53b620, { n: 1, thisEcx: false, calleeClean: false }); // 4cbb9e: call 0x53b620
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 4cbba3: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4cbba6: test eax, eax
        if (R.zf) { pc = 0x4cbbc9; continue; } // 4cbba8: je 0x4cbbc9
        pc = 0x4cbbaa; continue;
      case 0x4cbbaa:
        R.push((R.edi >>> 0)); // 4cbbaa: push edi
        R.call(0x542740, { n: 1, thisEcx: false, calleeClean: false }); // 4cbbab: call 0x542740
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 4cbbb0: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4cbbb3: test eax, eax
        if (R.zf) { pc = 0x4cbbc9; continue; } // 4cbbb5: je 0x4cbbc9
        pc = 0x4cbbb7; continue;
      case 0x4cbbb7:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.esi + 0x5e) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4cbbb7: mov dl, byte ptr [esi + 0x5e]
        R.edi = (R.pop()) | 0; // 4cbbba: pop edi
        R.logic(((R.edx >>> 0) & 0xff) & 0x1, 8); // 4cbbbb: test dl, 1
        R.eax = ((R.eax & 0xffffff00) | (((!R.zf ? 1 : 0) & 0xff) << 0)) | 0; // 4cbbbe: setne al
        R.esi = (R.pop()) | 0; // 4cbbc1: pop esi
        R.ebp = (R.pop()) | 0; // 4cbbc2: pop ebp
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 4cbbc3: inc eax
        R.ebx = (R.pop()) | 0; // 4cbbc4: pop ebx
        R.ecx = (R.pop()) | 0; // 4cbbc5: pop ecx
        return R.ret(2); // 4cbbc6: ret 8
      case 0x4cbbc9:
        R.eax = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 4cbbc9: mov eax, dword ptr [esi + 0x39]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4cbbcc: test eax, eax
        if (R.zf) { pc = 0x4cbc0b; continue; } // 4cbbce: je 0x4cbc0b
        pc = 0x4cbbd0; continue;
      case 0x4cbbd0:
        R.ecx = (((R.esp + 0x18) | 0)) | 0; // 4cbbd0: lea ecx, [esp + 0x18]
        R.push(0x1); // 4cbbd4: push 1
        R.push((R.ecx >>> 0)); // 4cbbd6: push ecx
        R.push((R.eax >>> 0)); // 4cbbd7: push eax
        R.call(0x540a50, { n: 3, thisEcx: false, calleeClean: false }); // 4cbbd8: call 0x540a50
        R.ebx = ((R.eax >>> 0)) | 0; // 4cbbdd: mov ebx, eax
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 4cbbdf: add esp, 0xc
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 4cbbe2: test ebx, ebx
        if (R.zf) { pc = 0x4cbc0b; continue; } // 4cbbe4: je 0x4cbc0b
        pc = 0x4cbbe6; continue;
      case 0x4cbbe6:
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4cbbe6: mov eax, dword ptr [esp + 0x18]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4cbbea: test eax, eax
        if (R.zf) { pc = 0x4cbbfd; continue; } // 4cbbec: je 0x4cbbfd
        pc = 0x4cbbee; continue;
      case 0x4cbbee:
        R.sub((R.edi >>> 0), R.m.u32(((R.esi + 0x39) | 0) >>> 0), 32); // 4cbbee: cmp edi, dword ptr [esi + 0x39]
        if (!R.zf) { pc = 0x4cbc0b; continue; } // 4cbbf1: jne 0x4cbc0b
        pc = 0x4cbbf3; continue;
      case 0x4cbbf3:
        R.edi = (R.pop()) | 0; // 4cbbf3: pop edi
        R.esi = (R.pop()) | 0; // 4cbbf4: pop esi
        R.ebp = (R.pop()) | 0; // 4cbbf5: pop ebp
        R.eax = ((R.eax & 0xffffff00) | (((0x4) & 0xff) << 0)) | 0; // 4cbbf6: mov al, 4
        R.ebx = (R.pop()) | 0; // 4cbbf8: pop ebx
        R.ecx = (R.pop()) | 0; // 4cbbf9: pop ecx
        return R.ret(2); // 4cbbfa: ret 8
      case 0x4cbbfd:
        R.sub((R.edi >>> 0), (R.ebx >>> 0), 32); // 4cbbfd: cmp edi, ebx
        if (!R.zf) { pc = 0x4cbc0b; continue; } // 4cbbff: jne 0x4cbc0b
        pc = 0x4cbc01; continue;
      case 0x4cbc01:
        R.edi = (R.pop()) | 0; // 4cbc01: pop edi
        R.esi = (R.pop()) | 0; // 4cbc02: pop esi
        R.ebp = (R.pop()) | 0; // 4cbc03: pop ebp
        R.eax = ((R.eax & 0xffffff00) | (((0x3) & 0xff) << 0)) | 0; // 4cbc04: mov al, 3
        R.ebx = (R.pop()) | 0; // 4cbc06: pop ebx
        R.ecx = (R.pop()) | 0; // 4cbc07: pop ecx
        return R.ret(2); // 4cbc08: ret 8
      case 0x4cbc0b:
        R.edx = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 4cbc0b: mov edx, dword ptr [0xae2364]
        R.ecx = (R.m.u32(((0xae2d0c) | 0) >>> 0)) | 0; // 4cbc11: mov ecx, dword ptr [0xae2d0c]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 4cbc17: test esi, esi
        if (!R.zf) { pc = 0x4cbc1f; continue; } // 4cbc19: jne 0x4cbc1f
        pc = 0x4cbc1b; continue;
      case 0x4cbc1b:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 4cbc1b: xor eax, eax
        pc = 0x4cbc4a; continue; // 4cbc1d: jmp 0x4cbc4a
      case 0x4cbc1f:
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 4cbc1f: mov eax, dword ptr [esi]
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 4cbc21: cmp eax, edx
        if (R.cL) { pc = 0x4cbc29; continue; } // 4cbc23: jl 0x4cbc29
        pc = 0x4cbc25; continue;
      case 0x4cbc25:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 4cbc25: xor eax, eax
        pc = 0x4cbc4a; continue; // 4cbc27: jmp 0x4cbc4a
      case 0x4cbc29:
        R.edi = (((R.eax + R.eax * 4) | 0)) | 0; // 4cbc29: lea edi, [eax + eax*4]
        R.edi = (R.shl((R.edi >>> 0), 0x4, 32)) | 0; // 4cbc2c: shl edi, 4
        R.edi = (R.sub((R.edi >>> 0), (R.eax >>> 0), 32)) | 0; // 4cbc2f: sub edi, eax
        R.eax = (R.m.u32(((R.edi + R.ecx) | 0) >>> 0)) | 0; // 4cbc31: mov eax, dword ptr [edi + ecx]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4cbc34: test eax, eax
        if (!R.cL) { pc = 0x4cbc3c; continue; } // 4cbc36: jge 0x4cbc3c
        pc = 0x4cbc38; continue;
      case 0x4cbc38:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 4cbc38: xor eax, eax
        pc = 0x4cbc4a; continue; // 4cbc3a: jmp 0x4cbc4a
      case 0x4cbc3c:
        R.edi = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 4cbc3c: mov edi, dword ptr [0xae1050]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4cbc42: lea eax, [eax + eax*4]
        R.eax = (R.shl((R.eax >>> 0), 0x4, 32)) | 0; // 4cbc45: shl eax, 4
        R.eax = (R.add((R.eax >>> 0), R.m.u32(((R.edi) | 0) >>> 0), 32)) | 0; // 4cbc48: add eax, dword ptr [edi]
        pc = 0x4cbc4a; continue;
      case 0x4cbc4a:
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4cbc4a: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 4cbc4c: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x4cbd0f; continue; } // 4cbc51: je 0x4cbd0f
        pc = 0x4cbc57; continue;
      case 0x4cbc57:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 4cbc57: mov eax, dword ptr [eax + 4]
        R.ebp = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 4cbc5a: mov ebp, dword ptr [0xae23b4]
        R.ebp = (R.add((R.ebp >>> 0), (R.eax >>> 0), 32)) | 0; // 4cbc60: add ebp, eax
        R.edi = (((R.eax + R.eax * 8) | 0)) | 0; // 4cbc62: lea edi, [eax + eax*8]
        R.edi = (R.shl((R.edi >>> 0), 0x4, 32)) | 0; // 4cbc65: shl edi, 4
        R.edi = (R.add((R.edi >>> 0), (R.eax >>> 0), 32)) | 0; // 4cbc68: add edi, eax
        R.edi = (((R.ebp + R.edi * 4) | 0)) | 0; // 4cbc6a: lea edi, [ebp + edi*4]
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 4cbc6e: test edi, edi
        if (R.zf) { pc = 0x4cbd0f; continue; } // 4cbc70: je 0x4cbd0f
        pc = 0x4cbc76; continue;
      case 0x4cbc76:
        R.sub((R.edi >>> 0), R.m.u32(((R.esi + 0x39) | 0) >>> 0), 32); // 4cbc76: cmp edi, dword ptr [esi + 0x39]
        if (R.zf) { pc = 0x4cbd0f; continue; } // 4cbc79: je 0x4cbd0f
        pc = 0x4cbc7f; continue;
      case 0x4cbc7f:
        R.sub((R.edi >>> 0), (R.ebx >>> 0), 32); // 4cbc7f: cmp edi, ebx
        if (R.zf) { pc = 0x4cbd0f; continue; } // 4cbc81: je 0x4cbd0f
        pc = 0x4cbc87; continue;
      case 0x4cbc87:
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 4cbc87: test esi, esi
        if (!R.zf) { pc = 0x4cbc8f; continue; } // 4cbc89: jne 0x4cbc8f
        pc = 0x4cbc8b; continue;
      case 0x4cbc8b:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 4cbc8b: xor eax, eax
        pc = 0x4cbcb8; continue; // 4cbc8d: jmp 0x4cbcb8
      case 0x4cbc8f:
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 4cbc8f: mov eax, dword ptr [esi]
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 4cbc91: cmp eax, edx
        if (R.cL) { pc = 0x4cbc99; continue; } // 4cbc93: jl 0x4cbc99
        pc = 0x4cbc95; continue;
      case 0x4cbc95:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 4cbc95: xor eax, eax
        pc = 0x4cbcb8; continue; // 4cbc97: jmp 0x4cbcb8
      case 0x4cbc99:
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 4cbc99: lea edx, [eax + eax*4]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 4cbc9c: shl edx, 4
        R.edx = (R.sub((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 4cbc9f: sub edx, eax
        R.eax = (R.m.u32(((R.edx + R.ecx) | 0) >>> 0)) | 0; // 4cbca1: mov eax, dword ptr [edx + ecx]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4cbca4: test eax, eax
        if (!R.cL) { pc = 0x4cbcac; continue; } // 4cbca6: jge 0x4cbcac
        pc = 0x4cbca8; continue;
      case 0x4cbca8:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 4cbca8: xor eax, eax
        pc = 0x4cbcb8; continue; // 4cbcaa: jmp 0x4cbcb8
      case 0x4cbcac:
        R.ecx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 4cbcac: mov ecx, dword ptr [esp + 0x10]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4cbcb0: lea eax, [eax + eax*4]
        R.eax = (R.shl((R.eax >>> 0), 0x4, 32)) | 0; // 4cbcb3: shl eax, 4
        R.eax = (R.add((R.eax >>> 0), R.m.u32(((R.ecx) | 0) >>> 0), 32)) | 0; // 4cbcb6: add eax, dword ptr [ecx]
        pc = 0x4cbcb8; continue;
      case 0x4cbcb8:
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.eax + 0x35) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4cbcb8: mov bl, byte ptr [eax + 0x35]
        R.esi = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 4cbcbb: mov esi, dword ptr [esp + 0x1c]
        R.ebx = ((R.ebx & 0xffffff00) | (((R.shl(((R.ebx >>> 0) & 0xff), 0x1, 8)) & 0xff) << 0)) | 0; // 4cbcbf: shl bl, 1
        R.ebx = ((R.ebx & 0xffffff00) | (((R.sar(((R.ebx >>> 0) & 0xff), 0x7, 8)) & 0xff) << 0)) | 0; // 4cbcc1: sar bl, 7
        R.sub((R.edi >>> 0), (R.esi >>> 0), 32); // 4cbcc4: cmp edi, esi
        if (!R.zf) { pc = 0x4cbce3; continue; } // 4cbcc6: jne 0x4cbce3
        pc = 0x4cbcc8; continue;
      case 0x4cbcc8:
        R.push((R.esi >>> 0)); // 4cbcc8: push esi
        R.call(0x542740, { n: 1, thisEcx: false, calleeClean: false }); // 4cbcc9: call 0x542740
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 4cbcce: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4cbcd1: test eax, eax
        if (R.zf) { pc = 0x4cbce3; continue; } // 4cbcd3: je 0x4cbce3
        pc = 0x4cbcd5; continue;
      case 0x4cbcd5:
        R.logic(((R.ebx >>> 0) & 0xff) & ((R.ebx >>> 0) & 0xff), 8); // 4cbcd5: test bl, bl
        R.edi = (R.pop()) | 0; // 4cbcd7: pop edi
        R.esi = (R.pop()) | 0; // 4cbcd8: pop esi
        R.eax = ((R.eax & 0xffffff00) | (((R.zf ? 1 : 0) & 0xff) << 0)) | 0; // 4cbcd9: sete al
        R.ebp = (R.pop()) | 0; // 4cbcdc: pop ebp
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 4cbcdd: inc eax
        R.ebx = (R.pop()) | 0; // 4cbcde: pop ebx
        R.ecx = (R.pop()) | 0; // 4cbcdf: pop ecx
        return R.ret(2); // 4cbce0: ret 8
      case 0x4cbce3:
        R.edx = (((R.esp + 0x18) | 0)) | 0; // 4cbce3: lea edx, [esp + 0x18]
        R.push(0x1); // 4cbce7: push 1
        R.push((R.edx >>> 0)); // 4cbce9: push edx
        R.push((R.edi >>> 0)); // 4cbcea: push edi
        R.call(0x540a50, { n: 3, thisEcx: false, calleeClean: false }); // 4cbceb: call 0x540a50
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 4cbcf0: add esp, 0xc
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4cbcf3: test eax, eax
        if (R.zf) { pc = 0x4cbd0f; continue; } // 4cbcf5: je 0x4cbd0f
        pc = 0x4cbcf7; continue;
      case 0x4cbcf7:
        R.sub((R.eax >>> 0), (R.esi >>> 0), 32); // 4cbcf7: cmp eax, esi
        if (R.zf) { pc = 0x4cbcff; continue; } // 4cbcf9: je 0x4cbcff
        pc = 0x4cbcfb; continue;
      case 0x4cbcfb:
        R.sub((R.edi >>> 0), (R.esi >>> 0), 32); // 4cbcfb: cmp edi, esi
        if (!R.zf) { pc = 0x4cbd0f; continue; } // 4cbcfd: jne 0x4cbd0f
        pc = 0x4cbcff; continue;
      case 0x4cbcff:
        R.logic(((R.ebx >>> 0) & 0xff) & ((R.ebx >>> 0) & 0xff), 8); // 4cbcff: test bl, bl
        R.edi = (R.pop()) | 0; // 4cbd01: pop edi
        R.esi = (R.pop()) | 0; // 4cbd02: pop esi
        R.eax = ((R.eax & 0xffffff00) | (((R.zf ? 1 : 0) & 0xff) << 0)) | 0; // 4cbd03: sete al
        R.ebp = (R.pop()) | 0; // 4cbd06: pop ebp
        R.eax = (R.add((R.eax >>> 0), 0x3, 32)) | 0; // 4cbd07: add eax, 3
        R.ebx = (R.pop()) | 0; // 4cbd0a: pop ebx
        R.ecx = (R.pop()) | 0; // 4cbd0b: pop ecx
        return R.ret(2); // 4cbd0c: ret 8
      case 0x4cbd0f:
        R.edi = (R.pop()) | 0; // 4cbd0f: pop edi
        R.esi = (R.pop()) | 0; // 4cbd10: pop esi
        R.ebp = (R.pop()) | 0; // 4cbd11: pop ebp
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 4cbd12: xor al, al
        R.ebx = (R.pop()) | 0; // 4cbd14: pop ebx
        R.ecx = (R.pop()) | 0; // 4cbd15: pop ecx
        return R.ret(2); // 4cbd16: ret 8
      default: throw new Error(`f_4cbb60: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
