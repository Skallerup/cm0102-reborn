// 0x8d0bb0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 417c10=2tc, 549f70=4tc
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_8d0bb0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x8d0bb0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x8d0bb0:
        R.push(0xffffffff); // 8d0bb0: push -1
        R.push(0x964090); // 8d0bb2: push 0x964090
        R.eax = (0) | 0; // 8d0bb7: mov eax, dword ptr fs:[0]
        R.push((R.eax >>> 0)); // 8d0bbd: push eax
        /* fs */ // 8d0bbe: mov dword ptr fs:[0], esp
        R.esp = (R.sub((R.esp >>> 0), 0x30, 32)) | 0; // 8d0bc5: sub esp, 0x30
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8d0bc8: mov ax, word ptr [0xae2c92]
        R.push((R.esi >>> 0)); // 8d0bce: push esi
        R.push(0xffffffff); // 8d0bcf: push -1
        R.push((R.eax >>> 0)); // 8d0bd1: push eax
        R.push(0x6); // 8d0bd2: push 6
        R.push(0x1); // 8d0bd4: push 1
        R.ecx = (((R.esp + 0x24) | 0)) | 0; // 8d0bd6: lea ecx, [esp + 0x24]
        R.call(0x549f70, { n: 4, thisEcx: true, calleeClean: true }); // 8d0bda: call 0x549f70
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8d0bdf: mov cx, word ptr [0xae2c92]
        R.push(0xffffffff); // 8d0be6: push -1
        R.push((R.ecx >>> 0)); // 8d0be8: push ecx
        R.push(0x6); // 8d0be9: push 6
        R.push(0x1f); // 8d0beb: push 0x1f
        R.ecx = (((R.esp + 0x14) | 0)) | 0; // 8d0bed: lea ecx, [esp + 0x14]
        R.m.w32(((R.esp + 0x4c) | 0) >>> 0, 0x0); // 8d0bf1: mov dword ptr [esp + 0x4c], 0
        R.call(0x549f70, { n: 4, thisEcx: true, calleeClean: true }); // 8d0bf9: call 0x549f70
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8d0bfe: mov dx, word ptr [0xae2c92]
        R.push(0xffffffff); // 8d0c05: push -1
        R.push((R.edx >>> 0)); // 8d0c07: push edx
        R.push(0xb); // 8d0c08: push 0xb
        R.push(0xf); // 8d0c0a: push 0xf
        R.ecx = (((R.esp + 0x2c) | 0)) | 0; // 8d0c0c: lea ecx, [esp + 0x2c]
        R.m.w8(((R.esp + 0x4c) | 0) >>> 0, 0x1); // 8d0c10: mov byte ptr [esp + 0x4c], 1
        R.call(0x549f70, { n: 4, thisEcx: true, calleeClean: true }); // 8d0c15: call 0x549f70
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8d0c1a: mov ax, word ptr [0xae2c92]
        R.push(0xffffffff); // 8d0c20: push -1
        R.push((R.eax >>> 0)); // 8d0c22: push eax
        R.push(0x0); // 8d0c23: push 0
        R.push(0xf); // 8d0c25: push 0xf
        R.ecx = (((R.esp + 0x1c) | 0)) | 0; // 8d0c27: lea ecx, [esp + 0x1c]
        R.m.w8(((R.esp + 0x4c) | 0) >>> 0, 0x2); // 8d0c2b: mov byte ptr [esp + 0x4c], 2
        R.call(0x549f70, { n: 4, thisEcx: true, calleeClean: true }); // 8d0c30: call 0x549f70
        R.eax = (R.m.u32(((0xae2c90) | 0) >>> 0)) | 0; // 8d0c35: mov eax, dword ptr [0xae2c90]
        R.ecx = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 8d0c3a: mov ecx, dword ptr [esp + 0x14]
        R.sub(((R.eax >>> 0) & 0xffff), ((R.ecx >>> 0) & 0xffff), 16); // 8d0c3e: cmp ax, cx
        R.m.w8(((R.esp + 0x3c) | 0) >>> 0, 0x3); // 8d0c41: mov byte ptr [esp + 0x3c], 3
        if (R.cL) { pc = 0x8d0c7d; continue; } // 8d0c46: jl 0x8d0c7d
        pc = 0x8d0c48; continue;
      case 0x8d0c48:
        R.sub(((R.eax >>> 0) & 0xffff), R.m.u16(((R.esp + 0x4) | 0) >>> 0), 16); // 8d0c48: cmp ax, word ptr [esp + 4]
        if (!R.cLE) { pc = 0x8d0c7d; continue; } // 8d0c4d: jg 0x8d0c7d
        pc = 0x8d0c4f; continue;
      case 0x8d0c4f:
        R.ecx = (((R.esp + 0x24) | 0)) | 0; // 8d0c4f: lea ecx, [esp + 0x24]
        R.push(0xae2c90); // 8d0c53: push 0xae2c90
        R.push((R.ecx >>> 0)); // 8d0c58: push ecx
        R.ecx = (R.m.u32(((R.esp + 0x4c) | 0) >>> 0)) | 0; // 8d0c59: mov ecx, dword ptr [esp + 0x4c]
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 8d0c5d: call 0x417c10
        R.ecx = (R.m.u32(((R.esp + 0x48) | 0) >>> 0)) | 0; // 8d0c62: mov ecx, dword ptr [esp + 0x48]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 8d0c66: test ecx, ecx
        if (R.zf) { pc = 0x8d0d75; continue; } // 8d0c68: je 0x8d0d75
        pc = 0x8d0c6e; continue;
      case 0x8d0c6e:
        R.edx = (((R.esp + 0x4) | 0)) | 0; // 8d0c6e: lea edx, [esp + 4]
        R.eax = (((R.esp + 0x24) | 0)) | 0; // 8d0c72: lea eax, [esp + 0x24]
        R.push((R.edx >>> 0)); // 8d0c76: push edx
        R.push((R.eax >>> 0)); // 8d0c77: push eax
        pc = 0x8d0d70; continue; // 8d0c78: jmp 0x8d0d70
      case 0x8d0c7d:
        R.sub(((R.eax >>> 0) & 0xffff), R.m.u16(((R.esp + 0x1c) | 0) >>> 0), 16); // 8d0c7d: cmp ax, word ptr [esp + 0x1c]
        if (R.cL) { pc = 0x8d0ccf; continue; } // 8d0c82: jl 0x8d0ccf
        pc = 0x8d0c84; continue;
      case 0x8d0c84:
        R.ecx = (((R.esp + 0x24) | 0)) | 0; // 8d0c84: lea ecx, [esp + 0x24]
        R.push(0xae2c90); // 8d0c88: push 0xae2c90
        R.push((R.ecx >>> 0)); // 8d0c8d: push ecx
        R.ecx = (R.m.u32(((R.esp + 0x4c) | 0) >>> 0)) | 0; // 8d0c8e: mov ecx, dword ptr [esp + 0x4c]
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 8d0c92: call 0x417c10
        R.esi = (R.m.u32(((R.esp + 0x48) | 0) >>> 0)) | 0; // 8d0c97: mov esi, dword ptr [esp + 0x48]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8d0c9b: test esi, esi
        if (R.zf) { pc = 0x8d0d75; continue; } // 8d0c9d: je 0x8d0d75
        pc = 0x8d0ca3; continue;
      case 0x8d0ca3:
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8d0ca3: mov dx, word ptr [0xae2c92]
        R.push(0xffffffff); // 8d0caa: push -1
        R.m.w16(((R.esp + 0x48) | 0) >>> 0, ((R.edx >>> 0) & 0xffff)); // 8d0cac: mov word ptr [esp + 0x48], dx
        R.ecx = (((R.esp + 0x28) | 0)) | 0; // 8d0cb1: lea ecx, [esp + 0x28]
        R.eax = (R.m.u32(((R.esp + 0x48) | 0) >>> 0)) | 0; // 8d0cb5: mov eax, dword ptr [esp + 0x48]
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 8d0cb9: inc eax
        R.push((R.eax >>> 0)); // 8d0cba: push eax
        R.push(0x0); // 8d0cbb: push 0
        R.push(0xf); // 8d0cbd: push 0xf
        R.call(0x549f70, { n: 4, thisEcx: true, calleeClean: true }); // 8d0cbf: call 0x549f70
        R.ecx = (((R.esp + 0x2c) | 0)) | 0; // 8d0cc4: lea ecx, [esp + 0x2c]
        R.push((R.eax >>> 0)); // 8d0cc8: push eax
        R.push((R.ecx >>> 0)); // 8d0cc9: push ecx
        pc = 0x8d0d6e; continue; // 8d0cca: jmp 0x8d0d6e
      case 0x8d0ccf:
        R.sub(((R.eax >>> 0) & 0xffff), R.m.u16(((R.esp + 0xc) | 0) >>> 0), 16); // 8d0ccf: cmp ax, word ptr [esp + 0xc]
        if (!R.cLE) { pc = 0x8d0d01; continue; } // 8d0cd4: jg 0x8d0d01
        pc = 0x8d0cd6; continue;
      case 0x8d0cd6:
        R.ecx = (R.m.u32(((R.esp + 0x44) | 0) >>> 0)) | 0; // 8d0cd6: mov ecx, dword ptr [esp + 0x44]
        R.edx = (((R.esp + 0x2c) | 0)) | 0; // 8d0cda: lea edx, [esp + 0x2c]
        R.push(0xae2c90); // 8d0cde: push 0xae2c90
        R.push((R.edx >>> 0)); // 8d0ce3: push edx
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 8d0ce4: call 0x417c10
        R.ecx = (R.m.u32(((R.esp + 0x48) | 0) >>> 0)) | 0; // 8d0ce9: mov ecx, dword ptr [esp + 0x48]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 8d0ced: test ecx, ecx
        if (R.zf) { pc = 0x8d0d75; continue; } // 8d0cef: je 0x8d0d75
        pc = 0x8d0cf5; continue;
      case 0x8d0cf5:
        R.eax = (((R.esp + 0xc) | 0)) | 0; // 8d0cf5: lea eax, [esp + 0xc]
        R.edx = (((R.esp + 0x2c) | 0)) | 0; // 8d0cf9: lea edx, [esp + 0x2c]
        R.push((R.eax >>> 0)); // 8d0cfd: push eax
        R.push((R.edx >>> 0)); // 8d0cfe: push edx
        pc = 0x8d0d70; continue; // 8d0cff: jmp 0x8d0d70
      case 0x8d0d01:
        R.sub(((R.eax >>> 0) & 0xffff), ((R.ecx >>> 0) & 0xffff), 16); // 8d0d01: cmp ax, cx
        if (!R.cL) { pc = 0x8d0d2d; continue; } // 8d0d04: jge 0x8d0d2d
        pc = 0x8d0d06; continue;
      case 0x8d0d06:
        R.eax = (((R.esp + 0x14) | 0)) | 0; // 8d0d06: lea eax, [esp + 0x14]
        R.ecx = (((R.esp + 0x2c) | 0)) | 0; // 8d0d0a: lea ecx, [esp + 0x2c]
        R.push((R.eax >>> 0)); // 8d0d0e: push eax
        R.push((R.ecx >>> 0)); // 8d0d0f: push ecx
        R.ecx = (R.m.u32(((R.esp + 0x4c) | 0) >>> 0)) | 0; // 8d0d10: mov ecx, dword ptr [esp + 0x4c]
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 8d0d14: call 0x417c10
        R.ecx = (R.m.u32(((R.esp + 0x48) | 0) >>> 0)) | 0; // 8d0d19: mov ecx, dword ptr [esp + 0x48]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 8d0d1d: test ecx, ecx
        if (R.zf) { pc = 0x8d0d75; continue; } // 8d0d1f: je 0x8d0d75
        pc = 0x8d0d21; continue;
      case 0x8d0d21:
        R.edx = (((R.esp + 0x4) | 0)) | 0; // 8d0d21: lea edx, [esp + 4]
        R.eax = (((R.esp + 0x2c) | 0)) | 0; // 8d0d25: lea eax, [esp + 0x2c]
        R.push((R.edx >>> 0)); // 8d0d29: push edx
        R.push((R.eax >>> 0)); // 8d0d2a: push eax
        pc = 0x8d0d70; continue; // 8d0d2b: jmp 0x8d0d70
      case 0x8d0d2d:
        R.ecx = (((R.esp + 0x1c) | 0)) | 0; // 8d0d2d: lea ecx, [esp + 0x1c]
        R.edx = (((R.esp + 0x2c) | 0)) | 0; // 8d0d31: lea edx, [esp + 0x2c]
        R.push((R.ecx >>> 0)); // 8d0d35: push ecx
        R.ecx = (R.m.u32(((R.esp + 0x48) | 0) >>> 0)) | 0; // 8d0d36: mov ecx, dword ptr [esp + 0x48]
        R.push((R.edx >>> 0)); // 8d0d3a: push edx
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 8d0d3b: call 0x417c10
        R.esi = (R.m.u32(((R.esp + 0x48) | 0) >>> 0)) | 0; // 8d0d40: mov esi, dword ptr [esp + 0x48]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8d0d44: test esi, esi
        if (R.zf) { pc = 0x8d0d75; continue; } // 8d0d46: je 0x8d0d75
        pc = 0x8d0d48; continue;
      case 0x8d0d48:
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8d0d48: mov ax, word ptr [0xae2c92]
        R.push(0xffffffff); // 8d0d4e: push -1
        R.m.w16(((R.esp + 0x48) | 0) >>> 0, ((R.eax >>> 0) & 0xffff)); // 8d0d50: mov word ptr [esp + 0x48], ax
        R.ecx = (R.m.u32(((R.esp + 0x48) | 0) >>> 0)) | 0; // 8d0d55: mov ecx, dword ptr [esp + 0x48]
        R.ecx = (R.incdec((R.ecx >>> 0), 1, 32)) | 0; // 8d0d59: inc ecx
        R.push((R.ecx >>> 0)); // 8d0d5a: push ecx
        R.push(0x0); // 8d0d5b: push 0
        R.push(0xf); // 8d0d5d: push 0xf
        R.ecx = (((R.esp + 0x3c) | 0)) | 0; // 8d0d5f: lea ecx, [esp + 0x3c]
        R.call(0x549f70, { n: 4, thisEcx: true, calleeClean: true }); // 8d0d63: call 0x549f70
        R.edx = (((R.esp + 0x24) | 0)) | 0; // 8d0d68: lea edx, [esp + 0x24]
        R.push((R.eax >>> 0)); // 8d0d6c: push eax
        R.push((R.edx >>> 0)); // 8d0d6d: push edx
        pc = 0x8d0d6e; continue;
      case 0x8d0d6e:
        R.ecx = ((R.esi >>> 0)) | 0; // 8d0d6e: mov ecx, esi
        pc = 0x8d0d70; continue;
      case 0x8d0d70:
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 8d0d70: call 0x417c10
        pc = 0x8d0d75; continue;
      case 0x8d0d75:
        R.ecx = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 8d0d75: mov ecx, dword ptr [esp + 0x34]
        R.esi = (R.pop()) | 0; // 8d0d79: pop esi
        /* fs */ // 8d0d7a: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x3c, 32)) | 0; // 8d0d81: add esp, 0x3c
        return R.ret(2); // 8d0d84: ret 8
      default: throw new Error(`f_8d0bb0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
