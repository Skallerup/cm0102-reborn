// 0x669bd0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 417c10=2tc, 549ef0=2tc, 54a110=0t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_669bd0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x669bd0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x669bd0:
        R.push(0xffffffff); // 669bd0: push -1
        R.push(0x95c658); // 669bd2: push 0x95c658
        R.eax = (0) | 0; // 669bd7: mov eax, dword ptr fs:[0]
        R.push((R.eax >>> 0)); // 669bdd: push eax
        /* fs */ // 669bde: mov dword ptr fs:[0], esp
        R.esp = (R.sub((R.esp >>> 0), 0x20, 32)) | 0; // 669be5: sub esp, 0x20
        R.push((R.ebx >>> 0)); // 669be8: push ebx
        R.push((R.esi >>> 0)); // 669be9: push esi
        R.push((R.edi >>> 0)); // 669bea: push edi
        R.ecx = (((R.esp + 0x1c) | 0)) | 0; // 669beb: lea ecx, [esp + 0x1c]
        R.edi = (0xb63e38) | 0; // 669bef: mov edi, 0xb63e38
        R.call(0x54a110, { n: 0, thisEcx: true, calleeClean: false }); // 669bf4: call 0x54a110
        R.ebx = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 669bf9: mov ebx, dword ptr [esp + 0x3c]
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, 0x0); // 669bfd: mov dword ptr [esp + 0x34], 0
        R.edx = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 669c05: mov edx, dword ptr [ebx + 0x53]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 669c08: test edx, edx
        if (R.zf) { pc = 0x669c85; continue; } // 669c0a: je 0x669c85
        pc = 0x669c0c; continue;
      case 0x669c0c:
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 669c0c: xor ecx, ecx
        R.eax = (0xb63d60) | 0; // 669c0e: mov eax, 0xb63d60
        pc = 0x669c13; continue;
      case 0x669c13:
        R.sub(R.m.u32(((R.eax) | 0) >>> 0), (R.edx >>> 0), 32); // 669c13: cmp dword ptr [eax], edx
        if (R.zf) { pc = 0x669c24; continue; } // 669c15: je 0x669c24
        pc = 0x669c17; continue;
      case 0x669c17:
        R.eax = (R.add((R.eax >>> 0), 0x48, 32)) | 0; // 669c17: add eax, 0x48
        R.ecx = (R.incdec((R.ecx >>> 0), 1, 32)) | 0; // 669c1a: inc ecx
        R.sub((R.eax >>> 0), 0xb64738, 32); // 669c1b: cmp eax, 0xb64738
        if (R.cL) { pc = 0x669c13; continue; } // 669c20: jl 0x669c13
        pc = 0x669c22; continue;
      case 0x669c22:
        pc = 0x669c85; continue; // 669c22: jmp 0x669c85
      case 0x669c24:
        R.eax = (((R.ecx + R.ecx * 8) | 0)) | 0; // 669c24: lea eax, [ecx + ecx*8]
        R.ecx = (((R.esp + 0xc) | 0)) | 0; // 669c27: lea ecx, [esp + 0xc]
        R.edi = (((R.eax * 8 + 0xb63d60) | 0)) | 0; // 669c2b: lea edi, [eax*8 + 0xb63d60]
        R.esi = (((R.edi + 0x39) | 0)) | 0; // 669c32: lea esi, [edi + 0x39]
        R.push((R.esi >>> 0)); // 669c35: push esi
        R.push((R.ecx >>> 0)); // 669c36: push ecx
        R.ecx = (((R.esp + 0x24) | 0)) | 0; // 669c37: lea ecx, [esp + 0x24]
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 669c3b: call 0x417c10
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.esi + 0xb) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 669c40: mov cx, word ptr [esi + 0xb]
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.esi + 0x8) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 669c44: mov dx, word ptr [esi + 8]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0xa) | 0) >>> 0)) & 0xff) << 0)) | 0; // 669c48: mov al, byte ptr [esi + 0xa]
        R.m.w16(((R.esp + 0x27) | 0) >>> 0, ((R.ecx >>> 0) & 0xffff)); // 669c4b: mov word ptr [esp + 0x27], cx
        R.ecx = (R.m.u32(((R.ebx + 0x1db) | 0) >>> 0)) | 0; // 669c50: mov ecx, dword ptr [ebx + 0x1db]
        R.m.w16(((R.esp + 0x24) | 0) >>> 0, ((R.edx >>> 0) & 0xffff)); // 669c56: mov word ptr [esp + 0x24], dx
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.esi + 0xd) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 669c5b: mov dx, word ptr [esi + 0xd]
        R.sub((R.ecx >>> 0), 0xffffffff, 32); // 669c5f: cmp ecx, -1
        R.m.w8(((R.esp + 0x26) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 669c62: mov byte ptr [esp + 0x26], al
        R.m.w16(((R.esp + 0x29) | 0) >>> 0, ((R.edx >>> 0) & 0xffff)); // 669c66: mov word ptr [esp + 0x29], dx
        if (R.zf) { pc = 0x669c85; continue; } // 669c6b: je 0x669c85
        pc = 0x669c6d; continue;
      case 0x669c6d:
        R.sub(((R.eax >>> 0) & 0xff), 0x3, 8); // 669c6d: cmp al, 3
        if (R.zf) { pc = 0x669c79; continue; } // 669c6f: je 0x669c79
        pc = 0x669c71; continue;
      case 0x669c71:
        R.sub(((R.eax >>> 0) & 0xff), 0x4, 8); // 669c71: cmp al, 4
        if (R.zf) { pc = 0x669c79; continue; } // 669c73: je 0x669c79
        pc = 0x669c75; continue;
      case 0x669c75:
        R.sub(((R.eax >>> 0) & 0xff), 0x5, 8); // 669c75: cmp al, 5
        if (!R.zf) { pc = 0x669c85; continue; } // 669c77: jne 0x669c85
        pc = 0x669c79; continue;
      case 0x669c79:
        R.m.w8(((R.esp + 0x26) | 0) >>> 0, 0x4); // 669c79: mov byte ptr [esp + 0x26], 4
        R.m.w16(((R.esp + 0x24) | 0) >>> 0, 0x1e); // 669c7e: mov word ptr [esp + 0x24], 0x1e
        pc = 0x669c85; continue;
      case 0x669c85:
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.edi + 0x2a) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 669c85: mov ax, word ptr [edi + 0x2a]
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.esp + 0x1c) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 669c89: mov cx, word ptr [esp + 0x1c]
        R.edx = (R.m.u32(((0xae2c90) | 0) >>> 0)) | 0; // 669c8e: mov edx, dword ptr [0xae2c90]
        R.sub(((R.eax >>> 0) & 0xffff), ((R.ecx >>> 0) & 0xffff), 16); // 669c94: cmp ax, cx
        if (R.cLE) { pc = 0x669de7; continue; } // 669c97: jle 0x669de7
        pc = 0x669c9d; continue;
      case 0x669c9d:
        R.sub(((R.edx >>> 0) & 0xffff), ((R.eax >>> 0) & 0xffff), 16); // 669c9d: cmp dx, ax
        if (R.cLE) { pc = 0x669d09; continue; } // 669ca0: jle 0x669d09
        pc = 0x669ca2; continue;
      case 0x669ca2:
        R.esi = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 669ca2: mov esi, dword ptr [esp + 0x40]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 669ca6: test esi, esi
        if (R.zf) { pc = 0x669cd2; continue; } // 669ca8: je 0x669cd2
        pc = 0x669caa; continue;
      case 0x669caa:
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 669caa: mov cx, word ptr [0xae2c92]
        R.m.w16(((R.esp + 0x40) | 0) >>> 0, ((R.ecx >>> 0) & 0xffff)); // 669cb1: mov word ptr [esp + 0x40], cx
        R.ecx = (((R.esp + 0xc) | 0)) | 0; // 669cb6: lea ecx, [esp + 0xc]
        R.edx = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 669cba: mov edx, dword ptr [esp + 0x40]
        R.push((R.edx >>> 0)); // 669cbe: push edx
        R.push((R.eax >>> 0)); // 669cbf: push eax
        R.call(0x549ef0, { n: 2, thisEcx: true, calleeClean: true }); // 669cc0: call 0x549ef0
        R.push((R.eax >>> 0)); // 669cc5: push eax
        R.eax = (((R.esp + 0x18) | 0)) | 0; // 669cc6: lea eax, [esp + 0x18]
        R.push((R.eax >>> 0)); // 669cca: push eax
        R.ecx = ((R.esi >>> 0)) | 0; // 669ccb: mov ecx, esi
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 669ccd: call 0x417c10
        pc = 0x669cd2; continue;
      case 0x669cd2:
        R.esi = (R.m.u32(((R.esp + 0x44) | 0) >>> 0)) | 0; // 669cd2: mov esi, dword ptr [esp + 0x44]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 669cd6: test esi, esi
        if (R.zf) { pc = 0x669f2c; continue; } // 669cd8: je 0x669f2c
        pc = 0x669cde; continue;
      case 0x669cde:
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 669cde: mov cx, word ptr [0xae2c92]
        R.eax = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 669ce5: mov eax, dword ptr [esp + 0x1c]
        R.m.w16(((R.esp + 0x40) | 0) >>> 0, ((R.ecx >>> 0) & 0xffff)); // 669ce9: mov word ptr [esp + 0x40], cx
        R.ecx = (((R.esp + 0x14) | 0)) | 0; // 669cee: lea ecx, [esp + 0x14]
        R.edx = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 669cf2: mov edx, dword ptr [esp + 0x40]
        R.edx = (R.incdec((R.edx >>> 0), 1, 32)) | 0; // 669cf6: inc edx
        R.push((R.edx >>> 0)); // 669cf7: push edx
        R.push((R.eax >>> 0)); // 669cf8: push eax
        R.call(0x549ef0, { n: 2, thisEcx: true, calleeClean: true }); // 669cf9: call 0x549ef0
        R.ecx = (((R.esp + 0xc) | 0)) | 0; // 669cfe: lea ecx, [esp + 0xc]
        R.push((R.eax >>> 0)); // 669d02: push eax
        R.push((R.ecx >>> 0)); // 669d03: push ecx
        pc = 0x669f25; continue; // 669d04: jmp 0x669f25
      case 0x669d09:
        R.esi = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 669d09: mov esi, dword ptr [esp + 0x40]
        R.sub(((R.edx >>> 0) & 0xffff), ((R.ecx >>> 0) & 0xffff), 16); // 669d0d: cmp dx, cx
        if (!R.cL) { pc = 0x669d73; continue; } // 669d10: jge 0x669d73
        pc = 0x669d12; continue;
      case 0x669d12:
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 669d12: test esi, esi
        if (R.zf) { pc = 0x669d3f; continue; } // 669d14: je 0x669d3f
        pc = 0x669d16; continue;
      case 0x669d16:
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 669d16: mov dx, word ptr [0xae2c92]
        R.m.w16(((R.esp + 0x40) | 0) >>> 0, ((R.edx >>> 0) & 0xffff)); // 669d1d: mov word ptr [esp + 0x40], dx
        R.ecx = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 669d22: mov ecx, dword ptr [esp + 0x40]
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 669d26: dec ecx
        R.push((R.ecx >>> 0)); // 669d27: push ecx
        R.push((R.eax >>> 0)); // 669d28: push eax
        R.ecx = (((R.esp + 0x1c) | 0)) | 0; // 669d29: lea ecx, [esp + 0x1c]
        R.call(0x549ef0, { n: 2, thisEcx: true, calleeClean: true }); // 669d2d: call 0x549ef0
        R.edx = (((R.esp + 0xc) | 0)) | 0; // 669d32: lea edx, [esp + 0xc]
        R.push((R.eax >>> 0)); // 669d36: push eax
        R.push((R.edx >>> 0)); // 669d37: push edx
        R.ecx = ((R.esi >>> 0)) | 0; // 669d38: mov ecx, esi
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 669d3a: call 0x417c10
        pc = 0x669d3f; continue;
      case 0x669d3f:
        R.esi = (R.m.u32(((R.esp + 0x44) | 0) >>> 0)) | 0; // 669d3f: mov esi, dword ptr [esp + 0x44]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 669d43: test esi, esi
        if (R.zf) { pc = 0x669f2c; continue; } // 669d45: je 0x669f2c
        pc = 0x669d4b; continue;
      case 0x669d4b:
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 669d4b: mov ax, word ptr [0xae2c92]
        R.edx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 669d51: mov edx, dword ptr [esp + 0x1c]
        R.m.w16(((R.esp + 0x40) | 0) >>> 0, ((R.eax >>> 0) & 0xffff)); // 669d55: mov word ptr [esp + 0x40], ax
        R.ecx = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 669d5a: mov ecx, dword ptr [esp + 0x40]
        R.push((R.ecx >>> 0)); // 669d5e: push ecx
        R.push((R.edx >>> 0)); // 669d5f: push edx
        R.ecx = (((R.esp + 0x1c) | 0)) | 0; // 669d60: lea ecx, [esp + 0x1c]
        R.call(0x549ef0, { n: 2, thisEcx: true, calleeClean: true }); // 669d64: call 0x549ef0
        R.push((R.eax >>> 0)); // 669d69: push eax
        R.eax = (((R.esp + 0x10) | 0)) | 0; // 669d6a: lea eax, [esp + 0x10]
        pc = 0x669f24; continue; // 669d6e: jmp 0x669f24
      case 0x669d73:
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 669d73: test esi, esi
        if (R.zf) { pc = 0x669d9f; continue; } // 669d75: je 0x669d9f
        pc = 0x669d77; continue;
      case 0x669d77:
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 669d77: mov cx, word ptr [0xae2c92]
        R.m.w16(((R.esp + 0x40) | 0) >>> 0, ((R.ecx >>> 0) & 0xffff)); // 669d7e: mov word ptr [esp + 0x40], cx
        R.ecx = (((R.esp + 0x14) | 0)) | 0; // 669d83: lea ecx, [esp + 0x14]
        R.edx = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 669d87: mov edx, dword ptr [esp + 0x40]
        R.push((R.edx >>> 0)); // 669d8b: push edx
        R.push((R.eax >>> 0)); // 669d8c: push eax
        R.call(0x549ef0, { n: 2, thisEcx: true, calleeClean: true }); // 669d8d: call 0x549ef0
        R.push((R.eax >>> 0)); // 669d92: push eax
        R.eax = (((R.esp + 0x10) | 0)) | 0; // 669d93: lea eax, [esp + 0x10]
        R.push((R.eax >>> 0)); // 669d97: push eax
        R.ecx = ((R.esi >>> 0)) | 0; // 669d98: mov ecx, esi
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 669d9a: call 0x417c10
        pc = 0x669d9f; continue;
      case 0x669d9f:
        R.esi = (R.m.u32(((R.esp + 0x44) | 0) >>> 0)) | 0; // 669d9f: mov esi, dword ptr [esp + 0x44]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 669da3: test esi, esi
        if (R.zf) { pc = 0x669dd3; continue; } // 669da5: je 0x669dd3
        pc = 0x669da7; continue;
      case 0x669da7:
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 669da7: mov cx, word ptr [0xae2c92]
        R.eax = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 669dae: mov eax, dword ptr [esp + 0x1c]
        R.m.w16(((R.esp + 0x40) | 0) >>> 0, ((R.ecx >>> 0) & 0xffff)); // 669db2: mov word ptr [esp + 0x40], cx
        R.ecx = (((R.esp + 0x14) | 0)) | 0; // 669db7: lea ecx, [esp + 0x14]
        R.edx = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 669dbb: mov edx, dword ptr [esp + 0x40]
        R.push((R.edx >>> 0)); // 669dbf: push edx
        R.push((R.eax >>> 0)); // 669dc0: push eax
        R.call(0x549ef0, { n: 2, thisEcx: true, calleeClean: true }); // 669dc1: call 0x549ef0
        R.ecx = (((R.esp + 0xc) | 0)) | 0; // 669dc6: lea ecx, [esp + 0xc]
        R.push((R.eax >>> 0)); // 669dca: push eax
        R.push((R.ecx >>> 0)); // 669dcb: push ecx
        R.ecx = ((R.esi >>> 0)) | 0; // 669dcc: mov ecx, esi
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 669dce: call 0x417c10
        pc = 0x669dd3; continue;
      case 0x669dd3:
        R.edi = (R.pop()) | 0; // 669dd3: pop edi
        R.esi = (R.pop()) | 0; // 669dd4: pop esi
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 669dd5: xor eax, eax
        R.ebx = (R.pop()) | 0; // 669dd7: pop ebx
        R.ecx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 669dd8: mov ecx, dword ptr [esp + 0x20]
        /* fs */ // 669ddc: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x2c, 32)) | 0; // 669de3: add esp, 0x2c
        return R.eax; // 669de6: ret 
      case 0x669de7:
        R.sub(((R.edx >>> 0) & 0xffff), ((R.eax >>> 0) & 0xffff), 16); // 669de7: cmp dx, ax
        if (!R.cL) { pc = 0x669e63; continue; } // 669dea: jge 0x669e63
        pc = 0x669dec; continue;
      case 0x669dec:
        R.esi = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 669dec: mov esi, dword ptr [esp + 0x40]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 669df0: test esi, esi
        if (R.zf) { pc = 0x669e1c; continue; } // 669df2: je 0x669e1c
        pc = 0x669df4; continue;
      case 0x669df4:
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 669df4: mov dx, word ptr [0xae2c92]
        R.m.w16(((R.esp + 0x40) | 0) >>> 0, ((R.edx >>> 0) & 0xffff)); // 669dfb: mov word ptr [esp + 0x40], dx
        R.ecx = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 669e00: mov ecx, dword ptr [esp + 0x40]
        R.push((R.ecx >>> 0)); // 669e04: push ecx
        R.push((R.eax >>> 0)); // 669e05: push eax
        R.ecx = (((R.esp + 0x1c) | 0)) | 0; // 669e06: lea ecx, [esp + 0x1c]
        R.call(0x549ef0, { n: 2, thisEcx: true, calleeClean: true }); // 669e0a: call 0x549ef0
        R.edx = (((R.esp + 0xc) | 0)) | 0; // 669e0f: lea edx, [esp + 0xc]
        R.push((R.eax >>> 0)); // 669e13: push eax
        R.push((R.edx >>> 0)); // 669e14: push edx
        R.ecx = ((R.esi >>> 0)) | 0; // 669e15: mov ecx, esi
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 669e17: call 0x417c10
        pc = 0x669e1c; continue;
      case 0x669e1c:
        R.esi = (R.m.u32(((R.esp + 0x44) | 0) >>> 0)) | 0; // 669e1c: mov esi, dword ptr [esp + 0x44]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 669e20: test esi, esi
        if (R.zf) { pc = 0x669e4f; continue; } // 669e22: je 0x669e4f
        pc = 0x669e24; continue;
      case 0x669e24:
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 669e24: mov ax, word ptr [0xae2c92]
        R.edx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 669e2a: mov edx, dword ptr [esp + 0x1c]
        R.m.w16(((R.esp + 0x40) | 0) >>> 0, ((R.eax >>> 0) & 0xffff)); // 669e2e: mov word ptr [esp + 0x40], ax
        R.ecx = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 669e33: mov ecx, dword ptr [esp + 0x40]
        R.push((R.ecx >>> 0)); // 669e37: push ecx
        R.push((R.edx >>> 0)); // 669e38: push edx
        R.ecx = (((R.esp + 0x1c) | 0)) | 0; // 669e39: lea ecx, [esp + 0x1c]
        R.call(0x549ef0, { n: 2, thisEcx: true, calleeClean: true }); // 669e3d: call 0x549ef0
        R.push((R.eax >>> 0)); // 669e42: push eax
        R.eax = (((R.esp + 0x10) | 0)) | 0; // 669e43: lea eax, [esp + 0x10]
        R.push((R.eax >>> 0)); // 669e47: push eax
        R.ecx = ((R.esi >>> 0)) | 0; // 669e48: mov ecx, esi
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 669e4a: call 0x417c10
        pc = 0x669e4f; continue;
      case 0x669e4f:
        R.edi = (R.pop()) | 0; // 669e4f: pop edi
        R.esi = (R.pop()) | 0; // 669e50: pop esi
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 669e51: xor eax, eax
        R.ebx = (R.pop()) | 0; // 669e53: pop ebx
        R.ecx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 669e54: mov ecx, dword ptr [esp + 0x20]
        /* fs */ // 669e58: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x2c, 32)) | 0; // 669e5f: add esp, 0x2c
        return R.eax; // 669e62: ret 
      case 0x669e63:
        R.esi = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 669e63: mov esi, dword ptr [esp + 0x40]
        R.sub(((R.edx >>> 0) & 0xffff), ((R.ecx >>> 0) & 0xffff), 16); // 669e67: cmp dx, cx
        if (R.cLE) { pc = 0x669ecd; continue; } // 669e6a: jle 0x669ecd
        pc = 0x669e6c; continue;
      case 0x669e6c:
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 669e6c: test esi, esi
        if (R.zf) { pc = 0x669e99; continue; } // 669e6e: je 0x669e99
        pc = 0x669e70; continue;
      case 0x669e70:
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 669e70: mov cx, word ptr [0xae2c92]
        R.m.w16(((R.esp + 0x40) | 0) >>> 0, ((R.ecx >>> 0) & 0xffff)); // 669e77: mov word ptr [esp + 0x40], cx
        R.ecx = (((R.esp + 0x14) | 0)) | 0; // 669e7c: lea ecx, [esp + 0x14]
        R.edx = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 669e80: mov edx, dword ptr [esp + 0x40]
        R.edx = (R.incdec((R.edx >>> 0), 1, 32)) | 0; // 669e84: inc edx
        R.push((R.edx >>> 0)); // 669e85: push edx
        R.push((R.eax >>> 0)); // 669e86: push eax
        R.call(0x549ef0, { n: 2, thisEcx: true, calleeClean: true }); // 669e87: call 0x549ef0
        R.push((R.eax >>> 0)); // 669e8c: push eax
        R.eax = (((R.esp + 0x10) | 0)) | 0; // 669e8d: lea eax, [esp + 0x10]
        R.push((R.eax >>> 0)); // 669e91: push eax
        R.ecx = ((R.esi >>> 0)) | 0; // 669e92: mov ecx, esi
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 669e94: call 0x417c10
        pc = 0x669e99; continue;
      case 0x669e99:
        R.esi = (R.m.u32(((R.esp + 0x44) | 0) >>> 0)) | 0; // 669e99: mov esi, dword ptr [esp + 0x44]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 669e9d: test esi, esi
        if (R.zf) { pc = 0x669f2c; continue; } // 669e9f: je 0x669f2c
        pc = 0x669ea5; continue;
      case 0x669ea5:
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 669ea5: mov cx, word ptr [0xae2c92]
        R.eax = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 669eac: mov eax, dword ptr [esp + 0x1c]
        R.m.w16(((R.esp + 0x40) | 0) >>> 0, ((R.ecx >>> 0) & 0xffff)); // 669eb0: mov word ptr [esp + 0x40], cx
        R.ecx = (((R.esp + 0x14) | 0)) | 0; // 669eb5: lea ecx, [esp + 0x14]
        R.edx = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 669eb9: mov edx, dword ptr [esp + 0x40]
        R.edx = (R.incdec((R.edx >>> 0), 1, 32)) | 0; // 669ebd: inc edx
        R.push((R.edx >>> 0)); // 669ebe: push edx
        R.push((R.eax >>> 0)); // 669ebf: push eax
        R.call(0x549ef0, { n: 2, thisEcx: true, calleeClean: true }); // 669ec0: call 0x549ef0
        R.ecx = (((R.esp + 0xc) | 0)) | 0; // 669ec5: lea ecx, [esp + 0xc]
        R.push((R.eax >>> 0)); // 669ec9: push eax
        R.push((R.ecx >>> 0)); // 669eca: push ecx
        pc = 0x669f25; continue; // 669ecb: jmp 0x669f25
      case 0x669ecd:
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 669ecd: test esi, esi
        if (R.zf) { pc = 0x669ef9; continue; } // 669ecf: je 0x669ef9
        pc = 0x669ed1; continue;
      case 0x669ed1:
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 669ed1: mov dx, word ptr [0xae2c92]
        R.m.w16(((R.esp + 0x40) | 0) >>> 0, ((R.edx >>> 0) & 0xffff)); // 669ed8: mov word ptr [esp + 0x40], dx
        R.ecx = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 669edd: mov ecx, dword ptr [esp + 0x40]
        R.push((R.ecx >>> 0)); // 669ee1: push ecx
        R.push((R.eax >>> 0)); // 669ee2: push eax
        R.ecx = (((R.esp + 0x1c) | 0)) | 0; // 669ee3: lea ecx, [esp + 0x1c]
        R.call(0x549ef0, { n: 2, thisEcx: true, calleeClean: true }); // 669ee7: call 0x549ef0
        R.edx = (((R.esp + 0xc) | 0)) | 0; // 669eec: lea edx, [esp + 0xc]
        R.push((R.eax >>> 0)); // 669ef0: push eax
        R.push((R.edx >>> 0)); // 669ef1: push edx
        R.ecx = ((R.esi >>> 0)) | 0; // 669ef2: mov ecx, esi
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 669ef4: call 0x417c10
        pc = 0x669ef9; continue;
      case 0x669ef9:
        R.esi = (R.m.u32(((R.esp + 0x44) | 0) >>> 0)) | 0; // 669ef9: mov esi, dword ptr [esp + 0x44]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 669efd: test esi, esi
        if (R.zf) { pc = 0x669f2c; continue; } // 669eff: je 0x669f2c
        pc = 0x669f01; continue;
      case 0x669f01:
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 669f01: mov ax, word ptr [0xae2c92]
        R.edx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 669f07: mov edx, dword ptr [esp + 0x1c]
        R.m.w16(((R.esp + 0x40) | 0) >>> 0, ((R.eax >>> 0) & 0xffff)); // 669f0b: mov word ptr [esp + 0x40], ax
        R.ecx = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 669f10: mov ecx, dword ptr [esp + 0x40]
        R.push((R.ecx >>> 0)); // 669f14: push ecx
        R.push((R.edx >>> 0)); // 669f15: push edx
        R.ecx = (((R.esp + 0x1c) | 0)) | 0; // 669f16: lea ecx, [esp + 0x1c]
        R.call(0x549ef0, { n: 2, thisEcx: true, calleeClean: true }); // 669f1a: call 0x549ef0
        R.push((R.eax >>> 0)); // 669f1f: push eax
        R.eax = (((R.esp + 0x10) | 0)) | 0; // 669f20: lea eax, [esp + 0x10]
        pc = 0x669f24; continue;
      case 0x669f24:
        R.push((R.eax >>> 0)); // 669f24: push eax
        pc = 0x669f25; continue;
      case 0x669f25:
        R.ecx = ((R.esi >>> 0)) | 0; // 669f25: mov ecx, esi
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 669f27: call 0x417c10
        pc = 0x669f2c; continue;
      case 0x669f2c:
        R.ecx = (R.m.u32(((R.esp + 0x2c) | 0) >>> 0)) | 0; // 669f2c: mov ecx, dword ptr [esp + 0x2c]
        R.edi = (R.pop()) | 0; // 669f30: pop edi
        R.esi = (R.pop()) | 0; // 669f31: pop esi
        R.eax = (0x1) | 0; // 669f32: mov eax, 1
        R.ebx = (R.pop()) | 0; // 669f37: pop ebx
        /* fs */ // 669f38: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x2c, 32)) | 0; // 669f3f: add esp, 0x2c
        return R.eax; // 669f42: ret 
      default: throw new Error(`f_669bd0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
