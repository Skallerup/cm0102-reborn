// 0x8e8c40 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 40a7d0=2tc, 54c5b0=2tc, 54c8e0=2tc
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_8e8c40(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x8e8c40;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x8e8c40:
        R.eax = (0) | 0; // 8e8c40: mov eax, dword ptr fs:[0]
        R.push(0xffffffff); // 8e8c46: push -1
        R.push(0x9649f0); // 8e8c48: push 0x9649f0
        R.push((R.eax >>> 0)); // 8e8c4d: push eax
        /* fs */ // 8e8c4e: mov dword ptr fs:[0], esp
        R.esp = (R.sub((R.esp >>> 0), 0x28, 32)) | 0; // 8e8c55: sub esp, 0x28
        R.push((R.ebx >>> 0)); // 8e8c58: push ebx
        R.push((R.esi >>> 0)); // 8e8c59: push esi
        R.esi = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 8e8c5a: mov esi, dword ptr [esp + 0x40]
        R.push((R.edi >>> 0)); // 8e8c5e: push edi
        R.edi = (R.m.u32(((R.esp + 0x48) | 0) >>> 0)) | 0; // 8e8c5f: mov edi, dword ptr [esp + 0x48]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edi + 0x4) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e8c63: mov al, byte ptr [edi + 4]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.edi + 0xa) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e8c66: mov cl, byte ptr [edi + 0xa]
        R.sub(((R.eax >>> 0) & 0xff), ((R.ecx >>> 0) & 0xff), 8); // 8e8c69: cmp al, cl
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.esi + 0x2) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8e8c6b: mov ax, word ptr [esi + 2]
        R.push((R.eax >>> 0)); // 8e8c6f: push eax
        if (R.cLE) { pc = 0x8e8d67; continue; } // 8e8c70: jle 0x8e8d67
        pc = 0x8e8c76; continue;
      case 0x8e8c76:
        R.ecx = (((R.esp + 0x18) | 0)) | 0; // 8e8c76: lea ecx, [esp + 0x18]
        R.push((R.ecx >>> 0)); // 8e8c7a: push ecx
        R.ecx = ((R.edi >>> 0)) | 0; // 8e8c7b: mov ecx, edi
        R.call(0x40a7d0, { n: 2, thisEcx: true, calleeClean: true }); // 8e8c7d: call 0x40a7d0
        R.ebx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8e8c82: mov ebx, dword ptr [eax]
        R.edx = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 8e8c84: mov edx, dword ptr [eax + 4]
        R.eax = (((R.esp + 0x1c) | 0)) | 0; // 8e8c87: lea eax, [esp + 0x1c]
        R.push(0x1); // 8e8c8b: push 1
        R.push((R.eax >>> 0)); // 8e8c8d: push eax
        R.ecx = ((R.esi >>> 0)) | 0; // 8e8c8e: mov ecx, esi
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, 0x0); // 8e8c90: mov dword ptr [esp + 0x44], 0
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.ebx >>> 0)); // 8e8c98: mov dword ptr [esp + 0x14], ebx
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.edx >>> 0)); // 8e8c9c: mov dword ptr [esp + 0x18], edx
        R.call(0x54c5b0, { n: 2, thisEcx: true, calleeClean: true }); // 8e8ca0: call 0x54c5b0
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.eax + 0x2) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8e8ca5: mov cx, word ptr [eax + 2]
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.esp + 0xe) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8e8ca9: mov dx, word ptr [esp + 0xe]
        R.sub(((R.edx >>> 0) & 0xffff), ((R.ecx >>> 0) & 0xffff), 16); // 8e8cae: cmp dx, cx
        if (!R.cf) { pc = 0x8e8cba; continue; } // 8e8cb1: jae 0x8e8cba
        pc = 0x8e8cb3; continue;
      case 0x8e8cb3:
        R.eax = (0x1) | 0; // 8e8cb3: mov eax, 1
        pc = 0x8e8cca; continue; // 8e8cb8: jmp 0x8e8cca
      case 0x8e8cba:
        if (R.cBE) { pc = 0x8e8cc0; continue; } // 8e8cba: jbe 0x8e8cc0
        pc = 0x8e8cbc; continue;
      case 0x8e8cbc:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8e8cbc: xor eax, eax
        pc = 0x8e8cca; continue; // 8e8cbe: jmp 0x8e8cca
      case 0x8e8cc0:
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 8e8cc0: xor ecx, ecx
        R.sub(((R.ebx >>> 0) & 0xffff), R.m.u16(((R.eax) | 0) >>> 0), 16); // 8e8cc2: cmp bx, word ptr [eax]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.cL ? 1 : 0) & 0xff) << 0)) | 0; // 8e8cc5: setl cl
        R.eax = ((R.ecx >>> 0)) | 0; // 8e8cc8: mov eax, ecx
        pc = 0x8e8cca; continue;
      case 0x8e8cca:
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e8cca: test eax, eax
        R.m.w32(((R.esp + 0x3c) | 0) >>> 0, 0xffffffff); // 8e8ccc: mov dword ptr [esp + 0x3c], 0xffffffff
        if (R.zf) { pc = 0x8e8cef; continue; } // 8e8cd4: je 0x8e8cef
        pc = 0x8e8cd6; continue;
      case 0x8e8cd6:
        R.edi = (R.pop()) | 0; // 8e8cd6: pop edi
        R.esi = (R.pop()) | 0; // 8e8cd7: pop esi
        R.eax = (0x1) | 0; // 8e8cd8: mov eax, 1
        R.ebx = (R.pop()) | 0; // 8e8cdd: pop ebx
        R.ecx = (R.m.u32(((R.esp + 0x28) | 0) >>> 0)) | 0; // 8e8cde: mov ecx, dword ptr [esp + 0x28]
        /* fs */ // 8e8ce2: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x34, 32)) | 0; // 8e8ce9: add esp, 0x34
        return R.ret(2); // 8e8cec: ret 8
      case 0x8e8cef:
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.esi + 0x2) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8e8cef: mov ax, word ptr [esi + 2]
        R.edx = (((R.esp + 0x1c) | 0)) | 0; // 8e8cf3: lea edx, [esp + 0x1c]
        R.push((R.eax >>> 0)); // 8e8cf7: push eax
        R.push((R.edx >>> 0)); // 8e8cf8: push edx
        R.ecx = (((R.edi + 0x6) | 0)) | 0; // 8e8cf9: lea ecx, [edi + 6]
        R.call(0x40a7d0, { n: 2, thisEcx: true, calleeClean: true }); // 8e8cfc: call 0x40a7d0
        R.edi = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8e8d01: mov edi, dword ptr [eax]
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 8e8d03: mov eax, dword ptr [eax + 4]
        R.ecx = (((R.esp + 0x14) | 0)) | 0; // 8e8d06: lea ecx, [esp + 0x14]
        R.push(0x1); // 8e8d0a: push 1
        R.push((R.ecx >>> 0)); // 8e8d0c: push ecx
        R.ecx = ((R.esi >>> 0)) | 0; // 8e8d0d: mov ecx, esi
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, 0x1); // 8e8d0f: mov dword ptr [esp + 0x44], 1
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 8e8d17: mov dword ptr [esp + 0x14], edi
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.eax >>> 0)); // 8e8d1b: mov dword ptr [esp + 0x18], eax
        R.call(0x54c8e0, { n: 2, thisEcx: true, calleeClean: true }); // 8e8d1f: call 0x54c8e0
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.eax + 0x2) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8e8d24: mov cx, word ptr [eax + 2]
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.esp + 0xe) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8e8d28: mov dx, word ptr [esp + 0xe]
        R.sub(((R.edx >>> 0) & 0xffff), ((R.ecx >>> 0) & 0xffff), 16); // 8e8d2d: cmp dx, cx
        if (!R.cBE) { pc = 0x8e8e1a; continue; } // 8e8d30: ja 0x8e8e1a
        pc = 0x8e8d36; continue;
      case 0x8e8d36:
        if (R.cf) { pc = 0x8e8e33; continue; } // 8e8d36: jb 0x8e8e33
        pc = 0x8e8d3c; continue;
      case 0x8e8d3c:
        R.edx = (R.logic((R.edx >>> 0) ^ (R.edx >>> 0), 32)) | 0; // 8e8d3c: xor edx, edx
        R.sub(((R.edi >>> 0) & 0xffff), R.m.u16(((R.eax) | 0) >>> 0), 16); // 8e8d3e: cmp di, word ptr [eax]
        R.edx = ((R.edx & 0xffffff00) | (((!R.cLE ? 1 : 0) & 0xff) << 0)) | 0; // 8e8d41: setg dl
        R.eax = ((R.edx >>> 0)) | 0; // 8e8d44: mov eax, edx
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e8d46: test eax, eax
        if (R.zf) { pc = 0x8e8e33; continue; } // 8e8d48: je 0x8e8e33
        pc = 0x8e8d4e; continue;
      case 0x8e8d4e:
        R.edi = (R.pop()) | 0; // 8e8d4e: pop edi
        R.esi = (R.pop()) | 0; // 8e8d4f: pop esi
        R.eax = (0x1) | 0; // 8e8d50: mov eax, 1
        R.ebx = (R.pop()) | 0; // 8e8d55: pop ebx
        R.ecx = (R.m.u32(((R.esp + 0x28) | 0) >>> 0)) | 0; // 8e8d56: mov ecx, dword ptr [esp + 0x28]
        /* fs */ // 8e8d5a: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x34, 32)) | 0; // 8e8d61: add esp, 0x34
        return R.ret(2); // 8e8d64: ret 8
      case 0x8e8d67:
        R.eax = (((R.esp + 0x20) | 0)) | 0; // 8e8d67: lea eax, [esp + 0x20]
        R.ecx = ((R.edi >>> 0)) | 0; // 8e8d6b: mov ecx, edi
        R.push((R.eax >>> 0)); // 8e8d6d: push eax
        R.call(0x40a7d0, { n: 2, thisEcx: true, calleeClean: true }); // 8e8d6e: call 0x40a7d0
        R.ecx = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 8e8d73: mov ecx, dword ptr [eax + 4]
        R.ebx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8e8d76: mov ebx, dword ptr [eax]
        R.edx = (((R.esp + 0x14) | 0)) | 0; // 8e8d78: lea edx, [esp + 0x14]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 8e8d7c: mov dword ptr [esp + 0x10], ecx
        R.push(0x1); // 8e8d80: push 1
        R.push((R.edx >>> 0)); // 8e8d82: push edx
        R.ecx = ((R.esi >>> 0)) | 0; // 8e8d83: mov ecx, esi
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, 0x2); // 8e8d85: mov dword ptr [esp + 0x44], 2
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.ebx >>> 0)); // 8e8d8d: mov dword ptr [esp + 0x14], ebx
        R.call(0x54c5b0, { n: 2, thisEcx: true, calleeClean: true }); // 8e8d91: call 0x54c5b0
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.eax + 0x2) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8e8d96: mov cx, word ptr [eax + 2]
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.esp + 0xe) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8e8d9a: mov dx, word ptr [esp + 0xe]
        R.sub(((R.edx >>> 0) & 0xffff), ((R.ecx >>> 0) & 0xffff), 16); // 8e8d9f: cmp dx, cx
        if (!R.cf) { pc = 0x8e8dab; continue; } // 8e8da2: jae 0x8e8dab
        pc = 0x8e8da4; continue;
      case 0x8e8da4:
        R.eax = (0x1) | 0; // 8e8da4: mov eax, 1
        pc = 0x8e8dbb; continue; // 8e8da9: jmp 0x8e8dbb
      case 0x8e8dab:
        if (R.cBE) { pc = 0x8e8db1; continue; } // 8e8dab: jbe 0x8e8db1
        pc = 0x8e8dad; continue;
      case 0x8e8dad:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8e8dad: xor eax, eax
        pc = 0x8e8dbb; continue; // 8e8daf: jmp 0x8e8dbb
      case 0x8e8db1:
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 8e8db1: xor ecx, ecx
        R.sub(((R.ebx >>> 0) & 0xffff), R.m.u16(((R.eax) | 0) >>> 0), 16); // 8e8db3: cmp bx, word ptr [eax]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.cL ? 1 : 0) & 0xff) << 0)) | 0; // 8e8db6: setl cl
        R.eax = ((R.ecx >>> 0)) | 0; // 8e8db9: mov eax, ecx
        pc = 0x8e8dbb; continue;
      case 0x8e8dbb:
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e8dbb: test eax, eax
        R.m.w32(((R.esp + 0x3c) | 0) >>> 0, 0xffffffff); // 8e8dbd: mov dword ptr [esp + 0x3c], 0xffffffff
        if (R.zf) { pc = 0x8e8e33; continue; } // 8e8dc5: je 0x8e8e33
        pc = 0x8e8dc7; continue;
      case 0x8e8dc7:
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.esi + 0x2) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8e8dc7: mov ax, word ptr [esi + 2]
        R.edx = (((R.esp + 0x24) | 0)) | 0; // 8e8dcb: lea edx, [esp + 0x24]
        R.push((R.eax >>> 0)); // 8e8dcf: push eax
        R.push((R.edx >>> 0)); // 8e8dd0: push edx
        R.ecx = (((R.edi + 0x6) | 0)) | 0; // 8e8dd1: lea ecx, [edi + 6]
        R.call(0x40a7d0, { n: 2, thisEcx: true, calleeClean: true }); // 8e8dd4: call 0x40a7d0
        R.edi = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8e8dd9: mov edi, dword ptr [eax]
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 8e8ddb: mov eax, dword ptr [eax + 4]
        R.ecx = (((R.esp + 0x2c) | 0)) | 0; // 8e8dde: lea ecx, [esp + 0x2c]
        R.push(0x1); // 8e8de2: push 1
        R.push((R.ecx >>> 0)); // 8e8de4: push ecx
        R.ecx = ((R.esi >>> 0)) | 0; // 8e8de5: mov ecx, esi
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, 0x3); // 8e8de7: mov dword ptr [esp + 0x44], 3
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 8e8def: mov dword ptr [esp + 0x14], edi
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.eax >>> 0)); // 8e8df3: mov dword ptr [esp + 0x18], eax
        R.call(0x54c8e0, { n: 2, thisEcx: true, calleeClean: true }); // 8e8df7: call 0x54c8e0
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.eax + 0x2) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8e8dfc: mov cx, word ptr [eax + 2]
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.esp + 0xe) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8e8e00: mov dx, word ptr [esp + 0xe]
        R.sub(((R.edx >>> 0) & 0xffff), ((R.ecx >>> 0) & 0xffff), 16); // 8e8e05: cmp dx, cx
        if (!R.cBE) { pc = 0x8e8e1a; continue; } // 8e8e08: ja 0x8e8e1a
        pc = 0x8e8e0a; continue;
      case 0x8e8e0a:
        if (R.cf) { pc = 0x8e8e33; continue; } // 8e8e0a: jb 0x8e8e33
        pc = 0x8e8e0c; continue;
      case 0x8e8e0c:
        R.edx = (R.logic((R.edx >>> 0) ^ (R.edx >>> 0), 32)) | 0; // 8e8e0c: xor edx, edx
        R.sub(((R.edi >>> 0) & 0xffff), R.m.u16(((R.eax) | 0) >>> 0), 16); // 8e8e0e: cmp di, word ptr [eax]
        R.edx = ((R.edx & 0xffffff00) | (((!R.cLE ? 1 : 0) & 0xff) << 0)) | 0; // 8e8e11: setg dl
        R.eax = ((R.edx >>> 0)) | 0; // 8e8e14: mov eax, edx
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e8e16: test eax, eax
        if (R.zf) { pc = 0x8e8e33; continue; } // 8e8e18: je 0x8e8e33
        pc = 0x8e8e1a; continue;
      case 0x8e8e1a:
        R.edi = (R.pop()) | 0; // 8e8e1a: pop edi
        R.esi = (R.pop()) | 0; // 8e8e1b: pop esi
        R.eax = (0x1) | 0; // 8e8e1c: mov eax, 1
        R.ebx = (R.pop()) | 0; // 8e8e21: pop ebx
        R.ecx = (R.m.u32(((R.esp + 0x28) | 0) >>> 0)) | 0; // 8e8e22: mov ecx, dword ptr [esp + 0x28]
        /* fs */ // 8e8e26: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x34, 32)) | 0; // 8e8e2d: add esp, 0x34
        return R.ret(2); // 8e8e30: ret 8
      case 0x8e8e33:
        R.ecx = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 8e8e33: mov ecx, dword ptr [esp + 0x34]
        R.edi = (R.pop()) | 0; // 8e8e37: pop edi
        R.esi = (R.pop()) | 0; // 8e8e38: pop esi
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8e8e39: xor eax, eax
        R.ebx = (R.pop()) | 0; // 8e8e3b: pop ebx
        /* fs */ // 8e8e3c: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x34, 32)) | 0; // 8e8e43: add esp, 0x34
        return R.ret(2); // 8e8e46: ret 8
      default: throw new Error(`f_8e8c40: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
