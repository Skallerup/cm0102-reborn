// 0x8c5cf0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 68d0d0=2tc, 68d1b0=0t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x8c5cf0, 0x8c5d05, 0x8c5d0d, 0x8c5d17, 0x8c5d23, 0x8c5d29, 0x8c5d2e, 0x8c5d36, 0x8c5d40, 0x8c5d46, 0x8c5d50, 0x8c5d5a, 0x8c5d73, 0x8c5d7b, 0x8c5d87, 0x8c5d90, 0x8c5d94, 0x8c5d9c, 0x8c5da1, 0x8c5da6, 0x8c5dab, 0x8c5db0, 0x8c5db5, 0x8c5dba, 0x8c5dc0, 0x8c5dc4, 0x8c5dce, 0x8c5dd2, 0x8c5ddd, 0x8c5de9, 0x8c5df1, 0x8c5df8, 0x8c5dfc, 0x8c5e00, 0x8c5e04, 0x8c5e08, 0x8c5e0c, 0x8c5e10, 0x8c5e16, 0x8c5e20, 0x8c5e28, 0x8c5e33]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]);
function f_8c5cf0_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 8c5cf0
        R.push((R.ecx >>> 0)); // 8c5cf0: push ecx
        R.eax = (R.m.u32(((R.esp + 0x8) | 0) >>> 0)) | 0; // 8c5cf1: mov eax, dword ptr [esp + 8]
        R.push((R.ebx >>> 0)); // 8c5cf5: push ebx
        R.push((R.ebp >>> 0)); // 8c5cf6: push ebp
        R.push((R.esi >>> 0)); // 8c5cf7: push esi
        R.push((R.edi >>> 0)); // 8c5cf8: push edi
        R.edi = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8c5cf9: mov edi, dword ptr [eax]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c5cfb: test eax, eax
        R.ebp = ((R.ecx >>> 0)) | 0; // 8c5cfd: mov ebp, ecx
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edi >>> 0)); // 8c5cff: mov dword ptr [esp + 0x10], edi
        if (R.zf) { pc = 3; continue; } // 8c5d03: je 0x8c5d17
        pc = 1; continue;
      case 1: // 8c5d05
        R.sub((R.edi >>> 0), R.m.u32(((0xae2364) | 0) >>> 0), 32); // 8c5d05: cmp edi, dword ptr [0xae2364]
        if (R.cL) { pc = 3; continue; } // 8c5d0b: jl 0x8c5d17
        pc = 2; continue;
      case 2: // 8c5d0d
        R.edi = (R.pop()) | 0; // 8c5d0d: pop edi
        R.esi = (R.pop()) | 0; // 8c5d0e: pop esi
        R.ebp = (R.pop()) | 0; // 8c5d0f: pop ebp
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8c5d10: xor eax, eax
        R.ebx = (R.pop()) | 0; // 8c5d12: pop ebx
        R.ecx = (R.pop()) | 0; // 8c5d13: pop ecx
        R.rv = R.ret(3); return -1; // 8c5d14: ret 0xc
      case 3: // 8c5d17
        R.esi = (R.m.u32(((R.ebp + 0x4) | 0) >>> 0)) | 0; // 8c5d17: mov esi, dword ptr [ebp + 4]
        R.eax = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 8c5d1a: mov eax, dword ptr [ebp]
        R.edx = (R.logic((R.edx >>> 0) ^ (R.edx >>> 0), 32)) | 0; // 8c5d1d: xor edx, edx
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8c5d1f: test esi, esi
        if (R.cLE) { pc = 9; continue; } // 8c5d21: jle 0x8c5d46
        pc = 4; continue;
      case 4: // 8c5d23
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8c5d23: mov ecx, dword ptr [eax]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 8c5d25: test ecx, ecx
        if (R.zf) { pc = 6; continue; } // 8c5d27: je 0x8c5d2e
        pc = 5; continue;
      case 5: // 8c5d29
        R.sub(R.m.u32(((R.ecx + 0xc) | 0) >>> 0), (R.edi >>> 0), 32); // 8c5d29: cmp dword ptr [ecx + 0xc], edi
        if (R.zf) { pc = 8; continue; } // 8c5d2c: je 0x8c5d40
        pc = 6; continue;
      case 6: // 8c5d2e
        R.edx = (R.incdec((R.edx >>> 0), 1, 32)) | 0; // 8c5d2e: inc edx
        R.eax = (R.add((R.eax >>> 0), 0x4, 32)) | 0; // 8c5d2f: add eax, 4
        R.sub((R.edx >>> 0), (R.esi >>> 0), 32); // 8c5d32: cmp edx, esi
        if (R.cL) { pc = 4; continue; } // 8c5d34: jl 0x8c5d23
        pc = 7; continue;
      case 7: // 8c5d36
        R.edi = (R.pop()) | 0; // 8c5d36: pop edi
        R.esi = (R.pop()) | 0; // 8c5d37: pop esi
        R.ebp = (R.pop()) | 0; // 8c5d38: pop ebp
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8c5d39: xor eax, eax
        R.ebx = (R.pop()) | 0; // 8c5d3b: pop ebx
        R.ecx = (R.pop()) | 0; // 8c5d3c: pop ecx
        R.rv = R.ret(3); return -1; // 8c5d3d: ret 0xc
      case 8: // 8c5d40
        R.esi = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8c5d40: mov esi, dword ptr [eax]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8c5d42: test esi, esi
        if (!R.zf) { pc = 10; continue; } // 8c5d44: jne 0x8c5d50
        pc = 9; continue;
      default: return pc;
    }
  }
}
function f_8c5cf0_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 9: // 8c5d46
        R.edi = (R.pop()) | 0; // 8c5d46: pop edi
        R.esi = (R.pop()) | 0; // 8c5d47: pop esi
        R.ebp = (R.pop()) | 0; // 8c5d48: pop ebp
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8c5d49: xor eax, eax
        R.ebx = (R.pop()) | 0; // 8c5d4b: pop ebx
        R.ecx = (R.pop()) | 0; // 8c5d4c: pop ecx
        R.rv = R.ret(3); return -1; // 8c5d4d: ret 0xc
      case 10: // 8c5d50
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8c5d50: mov eax, dword ptr [esi]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c5d52: test eax, eax
        if (R.zf) { pc = 29; continue; } // 8c5d54: je 0x8c5de9
        pc = 11; continue;
      case 11: // 8c5d5a
        R.ecx = (R.m.u32(((R.eax + 0x2) | 0) >>> 0)) | 0; // 8c5d5a: mov ecx, dword ptr [eax + 2]
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, 0x0); // 8c5d5d: mov dword ptr [esp + 0x18], 0
        R.m.w32(((R.eax + 0xa) | 0) >>> 0, (R.ecx >>> 0)); // 8c5d65: mov dword ptr [eax + 0xa], ecx
        R.ecx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8c5d68: mov ecx, dword ptr [esi]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8c5d6a: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c5d6f: test eax, eax
        if (R.zf) { pc = 28; continue; } // 8c5d71: je 0x8c5ddd
        pc = 12; continue;
      case 12: // 8c5d73
        R.ebx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 8c5d73: mov ebx, dword ptr [esp + 0x20]
        R.edi = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 8c5d77: mov edi, dword ptr [esp + 0x1c]
        pc = 13; continue;
      case 13: // 8c5d7b
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8c5d7b: mov edx, dword ptr [eax]
        R.ecx = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 8c5d7d: mov ecx, dword ptr [ebp]
        R.edx = (R.m.u32(((R.ecx + R.edx * 4) | 0) >>> 0)) | 0; // 8c5d80: mov edx, dword ptr [ecx + edx*4]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 8c5d83: test edx, edx
        if (R.zf) { pc = 27; continue; } // 8c5d85: je 0x8c5dd2
        pc = 14; continue;
      case 14: // 8c5d87
        R.ecx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 8c5d87: mov ecx, dword ptr [esp + 0x10]
        R.sub(R.m.u32(((R.edx + 0xc) | 0) >>> 0), (R.ecx >>> 0), 32); // 8c5d8b: cmp dword ptr [edx + 0xc], ecx
        if (!R.zf) { pc = 27; continue; } // 8c5d8e: jne 0x8c5dd2
        pc = 15; continue;
      case 15: // 8c5d90
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 8c5d90: test ebx, ebx
        if (!R.zf) { pc = 24; continue; } // 8c5d92: jne 0x8c5dc0
        pc = 16; continue;
      case 16: // 8c5d94
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.edx + 0x2c) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8c5d94: mov cl, byte ptr [edx + 0x2c]
        R.sub(((R.ecx >>> 0) & 0xff), 0x2, 8); // 8c5d97: cmp cl, 2
        if (R.zf) { pc = 22; continue; } // 8c5d9a: je 0x8c5db5
        pc = 17; continue;
      case 17: // 8c5d9c
        R.sub(((R.ecx >>> 0) & 0xff), 0x3, 8); // 8c5d9c: cmp cl, 3
        if (R.zf) { pc = 22; continue; } // 8c5d9f: je 0x8c5db5
        pc = 18; continue;
      case 18: // 8c5da1
        R.sub(((R.ecx >>> 0) & 0xff), 0x14, 8); // 8c5da1: cmp cl, 0x14
        if (R.zf) { pc = 22; continue; } // 8c5da4: je 0x8c5db5
        pc = 19; continue;
      case 19: // 8c5da6
        R.sub(((R.ecx >>> 0) & 0xff), 0xf, 8); // 8c5da6: cmp cl, 0xf
        if (R.zf) { pc = 23; continue; } // 8c5da9: je 0x8c5dba
        pc = 20; continue;
      default: return pc;
    }
  }
}
function f_8c5cf0_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 20: // 8c5dab
        R.sub(((R.ecx >>> 0) & 0xff), 0x10, 8); // 8c5dab: cmp cl, 0x10
        if (R.zf) { pc = 22; continue; } // 8c5dae: je 0x8c5db5
        pc = 21; continue;
      case 21: // 8c5db0
        R.sub(((R.ecx >>> 0) & 0xff), 0x4, 8); // 8c5db0: cmp cl, 4
        if (!R.zf) { pc = 24; continue; } // 8c5db3: jne 0x8c5dc0
        pc = 22; continue;
      case 22: // 8c5db5
        R.sub(((R.ecx >>> 0) & 0xff), 0xf, 8); // 8c5db5: cmp cl, 0xf
        if (!R.zf) { pc = 27; continue; } // 8c5db8: jne 0x8c5dd2
        pc = 23; continue;
      case 23: // 8c5dba
        R.sub(R.m.u8(((R.edx + 0x2e) | 0) >>> 0), 0x3, 8); // 8c5dba: cmp byte ptr [edx + 0x2e], 3
        if (!R.cf) { pc = 27; continue; } // 8c5dbe: jae 0x8c5dd2
        pc = 24; continue;
      case 24: // 8c5dc0
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 8c5dc0: test edi, edi
        if (R.zf) { pc = 26; continue; } // 8c5dc2: je 0x8c5dce
        pc = 25; continue;
      case 25: // 8c5dc4
        R.push(0x4); // 8c5dc4: push 4
        R.push((R.eax >>> 0)); // 8c5dc6: push eax
        R.ecx = ((R.edi >>> 0)) | 0; // 8c5dc7: mov ecx, edi
        R.call(0x68d0d0, { n: 2, thisEcx: true, calleeClean: true }); // 8c5dc9: call 0x68d0d0
        pc = 26; continue;
      case 26: // 8c5dce
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, R.incdec(R.m.u32(((R.esp + 0x18) | 0) >>> 0), 1, 32)); // 8c5dce: inc dword ptr [esp + 0x18]
        pc = 27; continue;
      case 27: // 8c5dd2
        R.ecx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8c5dd2: mov ecx, dword ptr [esi]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8c5dd4: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c5dd9: test eax, eax
        if (!R.zf) { pc = 13; continue; } // 8c5ddb: jne 0x8c5d7b
        pc = 28; continue;
      case 28: // 8c5ddd
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 8c5ddd: mov eax, dword ptr [esp + 0x18]
        R.edi = (R.pop()) | 0; // 8c5de1: pop edi
        R.esi = (R.pop()) | 0; // 8c5de2: pop esi
        R.ebp = (R.pop()) | 0; // 8c5de3: pop ebp
        R.ebx = (R.pop()) | 0; // 8c5de4: pop ebx
        R.ecx = (R.pop()) | 0; // 8c5de5: pop ecx
        R.rv = R.ret(3); return -1; // 8c5de6: ret 0xc
      case 29: // 8c5de9
        R.eax = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 8c5de9: mov eax, dword ptr [esp + 0x20]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c5ded: test eax, eax
        if (!R.zf) { pc = 39; continue; } // 8c5def: jne 0x8c5e20
        pc = 30; continue;
      case 30: // 8c5df1
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x2c) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8c5df1: mov al, byte ptr [esi + 0x2c]
        R.sub(((R.eax >>> 0) & 0xff), 0x2, 8); // 8c5df4: cmp al, 2
        if (R.zf) { pc = 36; continue; } // 8c5df6: je 0x8c5e0c
        pc = 31; continue;
      case 31: // 8c5df8
        R.sub(((R.eax >>> 0) & 0xff), 0x3, 8); // 8c5df8: cmp al, 3
        if (R.zf) { pc = 36; continue; } // 8c5dfa: je 0x8c5e0c
        pc = 32; continue;
      default: return pc;
    }
  }
}
function f_8c5cf0_3(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 32: // 8c5dfc
        R.sub(((R.eax >>> 0) & 0xff), 0x14, 8); // 8c5dfc: cmp al, 0x14
        if (R.zf) { pc = 36; continue; } // 8c5dfe: je 0x8c5e0c
        pc = 33; continue;
      case 33: // 8c5e00
        R.sub(((R.eax >>> 0) & 0xff), 0xf, 8); // 8c5e00: cmp al, 0xf
        if (R.zf) { pc = 37; continue; } // 8c5e02: je 0x8c5e10
        pc = 34; continue;
      case 34: // 8c5e04
        R.sub(((R.eax >>> 0) & 0xff), 0x10, 8); // 8c5e04: cmp al, 0x10
        if (R.zf) { pc = 36; continue; } // 8c5e06: je 0x8c5e0c
        pc = 35; continue;
      case 35: // 8c5e08
        R.sub(((R.eax >>> 0) & 0xff), 0x4, 8); // 8c5e08: cmp al, 4
        if (!R.zf) { pc = 39; continue; } // 8c5e0a: jne 0x8c5e20
        pc = 36; continue;
      case 36: // 8c5e0c
        R.sub(((R.eax >>> 0) & 0xff), 0xf, 8); // 8c5e0c: cmp al, 0xf
        if (!R.zf) { pc = 38; continue; } // 8c5e0e: jne 0x8c5e16
        pc = 37; continue;
      case 37: // 8c5e10
        R.sub(R.m.u8(((R.esi + 0x2e) | 0) >>> 0), 0x3, 8); // 8c5e10: cmp byte ptr [esi + 0x2e], 3
        if (R.cf) { pc = 39; continue; } // 8c5e14: jb 0x8c5e20
        pc = 38; continue;
      case 38: // 8c5e16
        R.edi = (R.pop()) | 0; // 8c5e16: pop edi
        R.esi = (R.pop()) | 0; // 8c5e17: pop esi
        R.ebp = (R.pop()) | 0; // 8c5e18: pop ebp
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8c5e19: xor eax, eax
        R.ebx = (R.pop()) | 0; // 8c5e1b: pop ebx
        R.ecx = (R.pop()) | 0; // 8c5e1c: pop ecx
        R.rv = R.ret(3); return -1; // 8c5e1d: ret 0xc
      case 39: // 8c5e20
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 8c5e20: mov ecx, dword ptr [esp + 0x1c]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 8c5e24: test ecx, ecx
        if (R.zf) { pc = 41; continue; } // 8c5e26: je 0x8c5e33
        pc = 40; continue;
      case 40: // 8c5e28
        R.esi = (R.add((R.esi >>> 0), 0x20, 32)) | 0; // 8c5e28: add esi, 0x20
        R.push(0x4); // 8c5e2b: push 4
        R.push((R.esi >>> 0)); // 8c5e2d: push esi
        R.call(0x68d0d0, { n: 2, thisEcx: true, calleeClean: true }); // 8c5e2e: call 0x68d0d0
        pc = 41; continue;
      case 41: // 8c5e33
        R.edi = (R.pop()) | 0; // 8c5e33: pop edi
        R.esi = (R.pop()) | 0; // 8c5e34: pop esi
        R.ebp = (R.pop()) | 0; // 8c5e35: pop ebp
        R.eax = (0x1) | 0; // 8c5e36: mov eax, 1
        R.ebx = (R.pop()) | 0; // 8c5e3b: pop ebx
        R.ecx = (R.pop()) | 0; // 8c5e3c: pop ecx
        R.rv = R.ret(3); return -1; // 8c5e3d: ret 0xc
      default: return pc;
    }
  }
}
export function f_8c5cf0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 42) throw new Error(`f_8c5cf0: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_8c5cf0_0(R, pc); break;
      case 1: np = f_8c5cf0_1(R, pc); break;
      case 2: np = f_8c5cf0_2(R, pc); break;
      case 3: np = f_8c5cf0_3(R, pc); break;
      default: throw new Error(`f_8c5cf0: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_8c5cf0: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_8c5cf0.shared = true;
