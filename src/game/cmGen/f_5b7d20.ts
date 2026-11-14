// 0x5b7d20 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 5e8290=9, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_5b7d20(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x5b7d20;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x5b7d20:
        R.ecx = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 5b7d20: mov ecx, dword ptr [esp + 4]
        R.esp = (R.sub((R.esp >>> 0), 0x204, 32)) | 0; // 5b7d24: sub esp, 0x204
        R.push((R.esi >>> 0)); // 5b7d2a: push esi
        R.push((R.edi >>> 0)); // 5b7d2b: push edi
        R.esi = (R.logic((R.esi >>> 0) ^ (R.esi >>> 0), 32)) | 0; // 5b7d2c: xor esi, esi
        R.edi = (R.logic((R.edi >>> 0) ^ (R.edi >>> 0), 32)) | 0; // 5b7d2e: xor edi, edi
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 5b7d30: test ecx, ecx
        if (!R.zf) { pc = 0x5b7d9c; continue; } // 5b7d32: jne 0x5b7d9c
        pc = 0x5b7d34; continue;
      case 0x5b7d34:
        R.eax = (((R.esp + 0xc) | 0)) | 0; // 5b7d34: lea eax, [esp + 0xc]
        R.ecx = (((R.esp + 0x10c) | 0)) | 0; // 5b7d38: lea ecx, [esp + 0x10c]
        R.push((R.eax >>> 0)); // 5b7d3f: push eax
        R.push((R.ecx >>> 0)); // 5b7d40: push ecx
        R.push((R.edi >>> 0)); // 5b7d41: push edi
        R.push((R.edi >>> 0)); // 5b7d42: push edi
        R.push(0x9cc3dc); // 5b7d43: push 0x9cc3dc
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 5b7d48: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 5b7d4d: add esp, 0x14
        R.edx = (((R.esp + 0xc) | 0)) | 0; // 5b7d50: lea edx, [esp + 0xc]
        R.eax = (((R.esp + 0x10c) | 0)) | 0; // 5b7d54: lea eax, [esp + 0x10c]
        R.push(0xeb4); // 5b7d5b: push 0xeb4
        R.push((R.edx >>> 0)); // 5b7d60: push edx
        R.push((R.eax >>> 0)); // 5b7d61: push eax
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 5b7d62: call 0x90d130
        R.push((R.eax >>> 0)); // 5b7d67: push eax
        R.push(0x9870e8); // 5b7d68: push 0x9870e8
        R.push(0xae24d0); // 5b7d6d: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 5b7d72: call 0x944c9f
        R.push((R.edi >>> 0)); // 5b7d77: push edi
        R.push(0xae24d0); // 5b7d78: push 0xae24d0
        R.push(0x9870e0); // 5b7d7d: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 5b7d82: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 5b7d87: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, (R.edi >>> 0)); // 5b7d8a: mov dword ptr [0xb67a34], edi
        R.eax = ((R.eax & 0xffff0000) | (((R.logic(((R.eax >>> 0) & 0xffff) ^ ((R.eax >>> 0) & 0xffff), 16)) & 0xffff) << 0)) | 0; // 5b7d90: xor ax, ax
        R.edi = (R.pop()) | 0; // 5b7d93: pop edi
        R.esi = (R.pop()) | 0; // 5b7d94: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x204, 32)) | 0; // 5b7d95: add esp, 0x204
        return R.ret(0); // 5b7d9b: ret 
      case 0x5b7d9c:
        R.push((R.ebx >>> 0)); // 5b7d9c: push ebx
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.ecx + 0x11) | 0) >>> 0)) & 0xff) << 0)) | 0; // 5b7d9d: mov bl, byte ptr [ecx + 0x11]
        R.m.w8(((R.esp + 0xf) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 5b7da0: mov byte ptr [esp + 0xf], bl
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.ecx + 0x10) | 0) >>> 0)) & 0xff) << 0)) | 0; // 5b7da4: mov bl, byte ptr [ecx + 0x10]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + 0xf) | 0) >>> 0)) & 0xff) << 0)) | 0; // 5b7da7: mov al, byte ptr [ecx + 0xf]
        R.m.w8(((R.esp + 0xe) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 5b7daa: mov byte ptr [esp + 0xe], bl
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.ecx + 0x12) | 0) >>> 0)) & 0xff) << 0)) | 0; // 5b7dae: mov bl, byte ptr [ecx + 0x12]
        R.edx = ((R.edx & 0xffffff00) | (((0xf) & 0xff) << 0)) | 0; // 5b7db1: mov dl, 0xf
        R.m.w8(((R.esp + 0xc) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 5b7db3: mov byte ptr [esp + 0xc], bl
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.ecx + 0x15) | 0) >>> 0)) & 0xff) << 0)) | 0; // 5b7db7: mov bl, byte ptr [ecx + 0x15]
        R.m.w8(((R.esp + 0xd) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 5b7dba: mov byte ptr [esp + 0xd], bl
        pc = 0x5b7dbe; continue;
      case 0x5b7dbe:
        R.sub(((R.eax >>> 0) & 0xff), ((R.edx >>> 0) & 0xff), 8); // 5b7dbe: cmp al, dl
        if (R.cL) { pc = 0x5b7dc5; continue; } // 5b7dc0: jl 0x5b7dc5
        pc = 0x5b7dc2; continue;
      case 0x5b7dc2:
        R.esi = (R.logic((R.esi >>> 0) | 0x1, 32)) | 0; // 5b7dc2: or esi, 1
        pc = 0x5b7dc5; continue;
      case 0x5b7dc5:
        R.sub(R.m.u8(((R.esp + 0xf) | 0) >>> 0), ((R.edx >>> 0) & 0xff), 8); // 5b7dc5: cmp byte ptr [esp + 0xf], dl
        if (R.cL) { pc = 0x5b7dce; continue; } // 5b7dc9: jl 0x5b7dce
        pc = 0x5b7dcb; continue;
      case 0x5b7dcb:
        R.esi = (R.logic((R.esi >>> 0) | 0x4, 32)) | 0; // 5b7dcb: or esi, 4
        pc = 0x5b7dce; continue;
      case 0x5b7dce:
        R.sub(R.m.u8(((R.esp + 0xe) | 0) >>> 0), ((R.edx >>> 0) & 0xff), 8); // 5b7dce: cmp byte ptr [esp + 0xe], dl
        if (R.cL) { pc = 0x5b7dd7; continue; } // 5b7dd2: jl 0x5b7dd7
        pc = 0x5b7dd4; continue;
      case 0x5b7dd4:
        R.esi = (R.logic((R.esi >>> 0) | 0x2, 32)) | 0; // 5b7dd4: or esi, 2
        pc = 0x5b7dd7; continue;
      case 0x5b7dd7:
        R.sub(R.m.u8(((R.esp + 0xc) | 0) >>> 0), ((R.edx >>> 0) & 0xff), 8); // 5b7dd7: cmp byte ptr [esp + 0xc], dl
        if (R.cL) { pc = 0x5b7de2; continue; } // 5b7ddb: jl 0x5b7de2
        pc = 0x5b7ddd; continue;
      case 0x5b7ddd:
        R.esi = (R.logic((R.esi >>> 0) | 0x8, 32)) | 0; // 5b7ddd: or esi, 8
        pc = 0x5b7df4; continue; // 5b7de0: jmp 0x5b7df4
      case 0x5b7de2:
        R.sub(R.m.u8(((R.ecx + 0x14) | 0) >>> 0), ((R.edx >>> 0) & 0xff), 8); // 5b7de2: cmp byte ptr [ecx + 0x14], dl
        if (R.cL) { pc = 0x5b7dec; continue; } // 5b7de5: jl 0x5b7dec
        pc = 0x5b7de7; continue;
      case 0x5b7de7:
        R.esi = (R.logic((R.esi >>> 0) | 0x20, 32)) | 0; // 5b7de7: or esi, 0x20
        pc = 0x5b7df4; continue; // 5b7dea: jmp 0x5b7df4
      case 0x5b7dec:
        R.sub(R.m.u8(((R.ecx + 0x13) | 0) >>> 0), ((R.edx >>> 0) & 0xff), 8); // 5b7dec: cmp byte ptr [ecx + 0x13], dl
        if (R.cL) { pc = 0x5b7df4; continue; } // 5b7def: jl 0x5b7df4
        pc = 0x5b7df1; continue;
      case 0x5b7df1:
        R.esi = (R.logic((R.esi >>> 0) | 0x10, 32)) | 0; // 5b7df1: or esi, 0x10
        pc = 0x5b7df4; continue;
      case 0x5b7df4:
        R.sub(R.m.u8(((R.esp + 0xd) | 0) >>> 0), ((R.edx >>> 0) & 0xff), 8); // 5b7df4: cmp byte ptr [esp + 0xd], dl
        if (R.cL) { pc = 0x5b7dfd; continue; } // 5b7df8: jl 0x5b7dfd
        pc = 0x5b7dfa; continue;
      case 0x5b7dfa:
        R.esi = (R.logic((R.esi >>> 0) | 0x40, 32)) | 0; // 5b7dfa: or esi, 0x40
        pc = 0x5b7dfd; continue;
      case 0x5b7dfd:
        R.edx = ((R.edx & 0xffffff00) | (((R.incdec(((R.edx >>> 0) & 0xff), -1, 8)) & 0xff) << 0)) | 0; // 5b7dfd: dec dl
        R.sub(((R.edx >>> 0) & 0xff), 0xa, 8); // 5b7dff: cmp dl, 0xa
        if (R.cL) { pc = 0x5b7e09; continue; } // 5b7e02: jl 0x5b7e09
        pc = 0x5b7e04; continue;
      case 0x5b7e04:
        R.logic(((R.esi >>> 0) & 0xffff) & ((R.esi >>> 0) & 0xffff), 16); // 5b7e04: test si, si
        if (R.zf) { pc = 0x5b7dbe; continue; } // 5b7e07: je 0x5b7dbe
        pc = 0x5b7e09; continue;
      case 0x5b7e09:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.ecx + 0x17) | 0) >>> 0)) & 0xff) << 0)) | 0; // 5b7e09: mov dl, byte ptr [ecx + 0x17]
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.ecx + 0x18) | 0) >>> 0)) & 0xff) << 0)) | 0; // 5b7e0c: mov bl, byte ptr [ecx + 0x18]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.ecx + 0x19) | 0) >>> 0)) & 0xff) << 0)) | 0; // 5b7e0f: mov cl, byte ptr [ecx + 0x19]
        R.eax = ((R.eax & 0xffffff00) | (((0xf) & 0xff) << 0)) | 0; // 5b7e12: mov al, 0xf
        pc = 0x5b7e14; continue;
      case 0x5b7e14:
        R.sub(((R.edx >>> 0) & 0xff), 0xf, 8); // 5b7e14: cmp dl, 0xf
        if (R.cL) { pc = 0x5b7e24; continue; } // 5b7e17: jl 0x5b7e24
        pc = 0x5b7e19; continue;
      case 0x5b7e19:
        R.esi = (R.logic((R.esi >>> 0) | 0x800, 32)) | 0; // 5b7e19: or esi, 0x800
        R.edi = (0x1) | 0; // 5b7e1f: mov edi, 1
        pc = 0x5b7e24; continue;
      case 0x5b7e24:
        R.sub(((R.ebx >>> 0) & 0xff), 0xf, 8); // 5b7e24: cmp bl, 0xf
        if (R.cL) { pc = 0x5b7e34; continue; } // 5b7e27: jl 0x5b7e34
        pc = 0x5b7e29; continue;
      case 0x5b7e29:
        R.esi = (R.logic((R.esi >>> 0) | 0x80, 32)) | 0; // 5b7e29: or esi, 0x80
        R.edi = (0x1) | 0; // 5b7e2f: mov edi, 1
        pc = 0x5b7e34; continue;
      case 0x5b7e34:
        R.sub(((R.ecx >>> 0) & 0xff), 0xf, 8); // 5b7e34: cmp cl, 0xf
        if (R.cL) { pc = 0x5b7e44; continue; } // 5b7e37: jl 0x5b7e44
        pc = 0x5b7e39; continue;
      case 0x5b7e39:
        R.esi = (R.logic((R.esi >>> 0) | 0x200, 32)) | 0; // 5b7e39: or esi, 0x200
        R.edi = (0x1) | 0; // 5b7e3f: mov edi, 1
        pc = 0x5b7e44; continue;
      case 0x5b7e44:
        R.eax = ((R.eax & 0xffffff00) | (((R.incdec(((R.eax >>> 0) & 0xff), -1, 8)) & 0xff) << 0)) | 0; // 5b7e44: dec al
        R.sub(((R.eax >>> 0) & 0xff), 0xa, 8); // 5b7e46: cmp al, 0xa
        if (R.cL) { pc = 0x5b7e4e; continue; } // 5b7e48: jl 0x5b7e4e
        pc = 0x5b7e4a; continue;
      case 0x5b7e4a:
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 5b7e4a: test edi, edi
        if (R.zf) { pc = 0x5b7e14; continue; } // 5b7e4c: je 0x5b7e14
        pc = 0x5b7e4e; continue;
      case 0x5b7e4e:
        R.ebx = (R.pop()) | 0; // 5b7e4e: pop ebx
        R.eax = ((R.eax & 0xffff0000) | (((((R.esi >>> 0) & 0xffff)) & 0xffff) << 0)) | 0; // 5b7e4f: mov ax, si
        R.edi = (R.pop()) | 0; // 5b7e52: pop edi
        R.esi = (R.pop()) | 0; // 5b7e53: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x204, 32)) | 0; // 5b7e54: add esp, 0x204
        return R.ret(0); // 5b7e5a: ret 
      default: throw new Error(`f_5b7d20: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
