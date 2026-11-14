// 0x8c5e40 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4cf5a0=1c, 68d0d0=2tc, 68d1b0=0t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x8c5e40, 0x8c5e54, 0x8c5e61, 0x8c5e6a, 0x8c5e7b, 0x8c5e84, 0x8c5e99, 0x8c5eb3, 0x8c5ebc, 0x8c5ed1, 0x8c5ee9, 0x8c5eeb, 0x8c5eff, 0x8c5f09, 0x8c5f18, 0x8c5f1f, 0x8c5f23, 0x8c5f27, 0x8c5f2b, 0x8c5f2f, 0x8c5f33, 0x8c5f37, 0x8c5f3d, 0x8c5f44, 0x8c5f58, 0x8c5f61, 0x8c5f6f, 0x8c5f71, 0x8c5f79, 0x8c5f86, 0x8c5f8a, 0x8c5fa1, 0x8c5fb0]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3]);
function f_8c5e40_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 8c5e40
        R.push((R.ecx >>> 0)); // 8c5e40: push ecx
        R.push((R.ebx >>> 0)); // 8c5e41: push ebx
        R.push((R.ebp >>> 0)); // 8c5e42: push ebp
        R.ebp = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 8c5e43: mov ebp, dword ptr [esp + 0x10]
        R.ebx = (R.logic((R.ebx >>> 0) ^ (R.ebx >>> 0), 32)) | 0; // 8c5e47: xor ebx, ebx
        R.push((R.edi >>> 0)); // 8c5e49: push edi
        R.sub((R.ebp >>> 0), (R.ebx >>> 0), 32); // 8c5e4a: cmp ebp, ebx
        R.edi = ((R.ecx >>> 0)) | 0; // 8c5e4c: mov edi, ecx
        R.m.w32(((R.esp + 0xc) | 0) >>> 0, (R.ebx >>> 0)); // 8c5e4e: mov dword ptr [esp + 0xc], ebx
        if (R.zf) { pc = 3; continue; } // 8c5e52: je 0x8c5e6a
        pc = 1; continue;
      case 1: // 8c5e54
        R.eax = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 8c5e54: mov eax, dword ptr [ebp]
        R.ecx = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 8c5e57: mov ecx, dword ptr [0xae2364]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 8c5e5d: cmp eax, ecx
        if (R.cL) { pc = 3; continue; } // 8c5e5f: jl 0x8c5e6a
        pc = 2; continue;
      case 2: // 8c5e61
        R.edi = (R.pop()) | 0; // 8c5e61: pop edi
        R.ebp = (R.pop()) | 0; // 8c5e62: pop ebp
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8c5e63: xor eax, eax
        R.ebx = (R.pop()) | 0; // 8c5e65: pop ebx
        R.ecx = (R.pop()) | 0; // 8c5e66: pop ecx
        R.rv = R.ret(2); return -1; // 8c5e67: ret 8
      case 3: // 8c5e6a
        R.ecx = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 8c5e6a: mov ecx, dword ptr [ebp]
        R.edx = (R.m.u32(((R.edi + 0x86e) | 0) >>> 0)) | 0; // 8c5e6d: mov edx, dword ptr [edi + 0x86e]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edx + R.ecx * 8 + 0x2) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8c5e73: mov al, byte ptr [edx + ecx*8 + 2]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 8c5e77: test al, al
        if (!R.zf) { pc = 5; continue; } // 8c5e79: jne 0x8c5e84
        pc = 4; continue;
      case 4: // 8c5e7b
        R.edi = (R.pop()) | 0; // 8c5e7b: pop edi
        R.ebp = (R.pop()) | 0; // 8c5e7c: pop ebp
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8c5e7d: xor eax, eax
        R.ebx = (R.pop()) | 0; // 8c5e7f: pop ebx
        R.ecx = (R.pop()) | 0; // 8c5e80: pop ecx
        R.rv = R.ret(2); return -1; // 8c5e81: ret 8
      case 5: // 8c5e84
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8c5e84: mov ecx, dword ptr [0xae1050]
        R.push((R.ebp >>> 0)); // 8c5e8a: push ebp
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 8c5e8b: call 0x4cf5a0
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 8c5e90: cmp eax, ebx
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 8c5e92: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 7; continue; } // 8c5e97: je 0x8c5eb3
        pc = 6; continue;
      case 6: // 8c5e99
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 8c5e99: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 8c5e9c: mov edx, dword ptr [0xae23b4]
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8c5ea2: add edx, eax
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 8c5ea4: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 8c5ea7: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 8c5eaa: add ecx, eax
        R.eax = (((R.edx + R.ecx * 4) | 0)) | 0; // 8c5eac: lea eax, [edx + ecx*4]
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 8c5eaf: cmp eax, ebx
        if (!R.zf) { pc = 8; continue; } // 8c5eb1: jne 0x8c5ebc
        pc = 7; continue;
      default: return pc;
    }
  }
}
function f_8c5e40_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 7: // 8c5eb3
        R.edi = (R.pop()) | 0; // 8c5eb3: pop edi
        R.ebp = (R.pop()) | 0; // 8c5eb4: pop ebp
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8c5eb5: xor eax, eax
        R.ebx = (R.pop()) | 0; // 8c5eb7: pop ebx
        R.ecx = (R.pop()) | 0; // 8c5eb8: pop ecx
        R.rv = R.ret(2); return -1; // 8c5eb9: ret 8
      case 8: // 8c5ebc
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8c5ebc: mov ecx, dword ptr [0xae1050]
        R.push((R.ebp >>> 0)); // 8c5ec2: push ebp
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 8c5ec3: call 0x4cf5a0
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 8c5ec8: cmp eax, ebx
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 8c5eca: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 10; continue; } // 8c5ecf: je 0x8c5ee9
        pc = 9; continue;
      case 9: // 8c5ed1
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 8c5ed1: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 8c5ed4: mov edx, dword ptr [0xae23b4]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 8c5eda: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 8c5edd: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 8c5ee0: add ecx, eax
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8c5ee2: add edx, eax
        R.eax = (((R.edx + R.ecx * 4) | 0)) | 0; // 8c5ee4: lea eax, [edx + ecx*4]
        pc = 11; continue; // 8c5ee7: jmp 0x8c5eeb
      case 10: // 8c5ee9
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8c5ee9: xor eax, eax
        pc = 11; continue;
      case 11: // 8c5eeb
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8c5eeb: mov eax, dword ptr [eax]
        R.push((R.esi >>> 0)); // 8c5eed: push esi
        R.esi = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 8c5eee: mov esi, dword ptr [edi]
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.eax >>> 0)); // 8c5ef0: mov dword ptr [esp + 0x18], eax
        R.eax = (R.m.u32(((R.edi + 0x4) | 0) >>> 0)) | 0; // 8c5ef4: mov eax, dword ptr [edi + 4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c5ef7: test eax, eax
        if (R.cLE) { pc = 32; continue; } // 8c5ef9: jle 0x8c5fb0
        pc = 12; continue;
      case 12: // 8c5eff
        R.ecx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8c5eff: mov ecx, dword ptr [esi]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 8c5f01: test ecx, ecx
        if (R.zf) { pc = 31; continue; } // 8c5f03: je 0x8c5fa1
        pc = 13; continue;
      case 13: // 8c5f09
        R.edx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 8c5f09: mov edx, dword ptr [esp + 0x18]
        R.eax = (R.m.u32(((R.ecx + 0x8) | 0) >>> 0)) | 0; // 8c5f0d: mov eax, dword ptr [ecx + 8]
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 8c5f10: cmp eax, edx
        if (!R.zf) { pc = 31; continue; } // 8c5f12: jne 0x8c5fa1
        pc = 14; continue;
      case 14: // 8c5f18
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + 0x2c) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8c5f18: mov al, byte ptr [ecx + 0x2c]
        R.sub(((R.eax >>> 0) & 0xff), 0x2, 8); // 8c5f1b: cmp al, 2
        if (R.zf) { pc = 20; continue; } // 8c5f1d: je 0x8c5f33
        pc = 15; continue;
      case 15: // 8c5f1f
        R.sub(((R.eax >>> 0) & 0xff), 0x3, 8); // 8c5f1f: cmp al, 3
        if (R.zf) { pc = 20; continue; } // 8c5f21: je 0x8c5f33
        pc = 16; continue;
      case 16: // 8c5f23
        R.sub(((R.eax >>> 0) & 0xff), 0x14, 8); // 8c5f23: cmp al, 0x14
        if (R.zf) { pc = 20; continue; } // 8c5f25: je 0x8c5f33
        pc = 17; continue;
      default: return pc;
    }
  }
}
function f_8c5e40_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 17: // 8c5f27
        R.sub(((R.eax >>> 0) & 0xff), 0xf, 8); // 8c5f27: cmp al, 0xf
        if (R.zf) { pc = 21; continue; } // 8c5f29: je 0x8c5f37
        pc = 18; continue;
      case 18: // 8c5f2b
        R.sub(((R.eax >>> 0) & 0xff), 0x10, 8); // 8c5f2b: cmp al, 0x10
        if (R.zf) { pc = 20; continue; } // 8c5f2d: je 0x8c5f33
        pc = 19; continue;
      case 19: // 8c5f2f
        R.sub(((R.eax >>> 0) & 0xff), 0x4, 8); // 8c5f2f: cmp al, 4
        if (!R.zf) { pc = 22; continue; } // 8c5f31: jne 0x8c5f3d
        pc = 20; continue;
      case 20: // 8c5f33
        R.sub(((R.eax >>> 0) & 0xff), 0xf, 8); // 8c5f33: cmp al, 0xf
        if (!R.zf) { pc = 31; continue; } // 8c5f35: jne 0x8c5fa1
        pc = 21; continue;
      case 21: // 8c5f37
        R.sub(R.m.u8(((R.ecx + 0x2e) | 0) >>> 0), 0x3, 8); // 8c5f37: cmp byte ptr [ecx + 0x2e], 3
        if (!R.cf) { pc = 31; continue; } // 8c5f3b: jae 0x8c5fa1
        pc = 22; continue;
      case 22: // 8c5f3d
        R.eax = (R.m.u32(((R.ecx + 0x4) | 0) >>> 0)) | 0; // 8c5f3d: mov eax, dword ptr [ecx + 4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c5f40: test eax, eax
        if (R.zf) { pc = 30; continue; } // 8c5f42: je 0x8c5f8a
        pc = 23; continue;
      case 23: // 8c5f44
        R.ecx = (R.m.u32(((R.eax + 0x2) | 0) >>> 0)) | 0; // 8c5f44: mov ecx, dword ptr [eax + 2]
        R.m.w32(((R.eax + 0xa) | 0) >>> 0, (R.ecx >>> 0)); // 8c5f47: mov dword ptr [eax + 0xa], ecx
        R.edx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8c5f4a: mov edx, dword ptr [esi]
        R.ecx = (R.m.u32(((R.edx + 0x4) | 0) >>> 0)) | 0; // 8c5f4c: mov ecx, dword ptr [edx + 4]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8c5f4f: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c5f54: test eax, eax
        if (R.zf) { pc = 30; continue; } // 8c5f56: je 0x8c5f8a
        pc = 24; continue;
      case 24: // 8c5f58
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8c5f58: mov eax, dword ptr [eax]
        R.ecx = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 8c5f5a: mov ecx, dword ptr [ebp]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 8c5f5d: cmp eax, ecx
        if (R.zf) { pc = 27; continue; } // 8c5f5f: je 0x8c5f71
        pc = 25; continue;
      case 25: // 8c5f61
        R.ecx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8c5f61: mov ecx, dword ptr [esi]
        R.ecx = (R.m.u32(((R.ecx + 0x4) | 0) >>> 0)) | 0; // 8c5f63: mov ecx, dword ptr [ecx + 4]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8c5f66: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c5f6b: test eax, eax
        if (!R.zf) { pc = 24; continue; } // 8c5f6d: jne 0x8c5f58
        pc = 26; continue;
      case 26: // 8c5f6f
        pc = 30; continue; // 8c5f6f: jmp 0x8c5f8a
      case 27: // 8c5f71
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 8c5f71: mov ecx, dword ptr [esp + 0x1c]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 8c5f75: test ecx, ecx
        if (R.zf) { pc = 29; continue; } // 8c5f77: je 0x8c5f86
        pc = 28; continue;
      default: return pc;
    }
  }
}
function f_8c5e40_3(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 28: // 8c5f79
        R.edx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8c5f79: mov edx, dword ptr [esi]
        R.push(0x4); // 8c5f7b: push 4
        R.edx = (R.add((R.edx >>> 0), 0x20, 32)) | 0; // 8c5f7d: add edx, 0x20
        R.push((R.edx >>> 0)); // 8c5f80: push edx
        R.call(0x68d0d0, { n: 2, thisEcx: true, calleeClean: true }); // 8c5f81: call 0x68d0d0
        pc = 29; continue;
      case 29: // 8c5f86
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, R.incdec(R.m.u32(((R.esp + 0x10) | 0) >>> 0), 1, 32)); // 8c5f86: inc dword ptr [esp + 0x10]
        pc = 30; continue;
      case 30: // 8c5f8a
        R.eax = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 8c5f8a: mov eax, dword ptr [ebp]
        R.ecx = (R.m.u32(((R.edi + 0x86e) | 0) >>> 0)) | 0; // 8c5f8d: mov ecx, dword ptr [edi + 0x86e]
        R.edx = (R.logic((R.edx >>> 0) ^ (R.edx >>> 0), 32)) | 0; // 8c5f93: xor edx, edx
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.ecx + R.eax * 8 + 0x2) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8c5f95: mov dl, byte ptr [ecx + eax*8 + 2]
        R.eax = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 8c5f99: mov eax, dword ptr [esp + 0x10]
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 8c5f9d: cmp eax, edx
        if (R.zf) { pc = 32; continue; } // 8c5f9f: je 0x8c5fb0
        pc = 31; continue;
      case 31: // 8c5fa1
        R.eax = (R.m.u32(((R.edi + 0x4) | 0) >>> 0)) | 0; // 8c5fa1: mov eax, dword ptr [edi + 4]
        R.ebx = (R.incdec((R.ebx >>> 0), 1, 32)) | 0; // 8c5fa4: inc ebx
        R.esi = (R.add((R.esi >>> 0), 0x4, 32)) | 0; // 8c5fa5: add esi, 4
        R.sub((R.ebx >>> 0), (R.eax >>> 0), 32); // 8c5fa8: cmp ebx, eax
        if (R.cL) { pc = 12; continue; } // 8c5faa: jl 0x8c5eff
        pc = 32; continue;
      case 32: // 8c5fb0
        R.eax = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 8c5fb0: mov eax, dword ptr [esp + 0x10]
        R.esi = (R.pop()) | 0; // 8c5fb4: pop esi
        R.edi = (R.pop()) | 0; // 8c5fb5: pop edi
        R.ebp = (R.pop()) | 0; // 8c5fb6: pop ebp
        R.ebx = (R.pop()) | 0; // 8c5fb7: pop ebx
        R.ecx = (R.pop()) | 0; // 8c5fb8: pop ecx
        R.rv = R.ret(2); return -1; // 8c5fb9: ret 8
      default: return pc;
    }
  }
}
export function f_8c5e40(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 33) throw new Error(`f_8c5e40: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_8c5e40_0(R, pc); break;
      case 1: np = f_8c5e40_1(R, pc); break;
      case 2: np = f_8c5e40_2(R, pc); break;
      case 3: np = f_8c5e40_3(R, pc); break;
      default: throw new Error(`f_8c5e40: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_8c5e40: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_8c5e40.shared = true;
