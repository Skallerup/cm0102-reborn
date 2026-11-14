// 0x840d80 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 53ca90=1, 53d980=3, 5408c0=4, 544410=0, 544520=2, 544590=2, 600a50=5, 600e90=0, 6e6340=6, 6e86d0=5t, 7f7490=2tc, 83bd00=1c, 945ff0=0f
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';
import { ROT } from './x86';

const RO_842000_1u = [0x0, 0x0, 0x0, 0x0, 0x1, 0x1, 0x1, 0x2, 0x2, 0x2, 0x3, 0x3, 0x3, 0x4, 0x5, 0x5, 0x0, 0x2, 0x1, 0x4, 0x3, 0x8d, 0x49, 0x0, 0x78, 0x14, 0x84, 0x0, 0x78, 0x14, 0x84, 0x0, 0x1c, 0x16, 0x84, 0x0, 0x2a, 0x14, 0x84, 0x0, 0x4c, 0x14, 0x84, 0x0, 0xfa, 0x17, 0x84, 0x0, 0xef, 0x1c, 0x84, 0x0, 0xe, 0x1d, 0x84, 0x0, 0x2d, 0x1d, 0x84, 0x0, 0x4c, 0x1d, 0x84, 0x0, 0xcc, 0x1c, 0x84, 0x0, 0xac, 0x1c, 0x84, 0x0, 0x86, 0x1c, 0x84, 0x0, 0x60, 0x1c, 0x84, 0x0, 0x3a, 0x1c, 0x84, 0x0, 0x14, 0x1c, 0x84, 0x0, 0xee, 0x1b, 0x84, 0x0, 0xc8, 0x1b, 0x84, 0x0, 0x6d, 0x1d, 0x84, 0x0, 0x0, 0x1, 0x2, 0x3, 0xc, 0xc, 0xc, 0xc, 0xc, 0xc, 0xc, 0xc, 0x4, 0x5, 0x6, 0x2, 0x7, 0x8, 0x9, 0xa, 0xb, 0xb, 0xb, 0xb, 0xb, 0x90, 0x90, 0x90, 0x8b, 0x1, 0x83, 0xec, 0x8, 0x85, 0xc0, 0x75, 0x8, 0x32, 0xc0, 0x83, 0xc4, 0x8, 0xc2, 0x8, 0x0, 0x8b, 0x54, 0x24, 0xc, 0x8b, 0x12, 0x89, 0x54, 0x24, 0x0, 0x8b, 0x54, 0x24, 0x10, 0x85, 0xd2, 0x74, 0x8, 0x8b, 0x12, 0x89, 0x54, 0x24, 0x4, 0xeb, 0x8, 0xc7, 0x44, 0x24, 0x4, 0xff, 0xff, 0xff, 0xff, 0x8b, 0x49, 0x10, 0x68, 0xa0, 0x7e, 0x75, 0x0, 0x6a, 0x8, 0x51, 0x8d, 0x54, 0x24, 0xc, 0x50, 0x52, 0xe8, 0x9b, 0x43, 0x10, 0x0, 0x83, 0xc4, 0x14, 0x85, 0xc0, 0xf, 0x95, 0xc0, 0x83, 0xc4, 0x8, 0xc2, 0x8, 0x0, 0x90, 0x90, 0x90, 0x90, 0x90, 0x90, 0x90, 0x90, 0x90, 0x83, 0xec, 0x8, 0x53, 0x8b, 0x5c, 0x24, 0x10, 0x55, 0x56, 0x8b, 0x3, 0x57, 0x8b, 0xf9, 0x68, 0x40, 0x47, 0x84, 0x0, 0x89, 0x44, 0x24, 0x18, 0x6a, 0x8, 0x8b, 0x4f, 0x14, 0x8b, 0x57, 0x4];
const RO_842064_1u = [0x0, 0x1, 0x2, 0x3, 0xc, 0xc, 0xc, 0xc, 0xc, 0xc, 0xc, 0xc, 0x4, 0x5, 0x6, 0x2, 0x7, 0x8, 0x9, 0xa, 0xb, 0xb, 0xb, 0xb, 0xb, 0x90, 0x90, 0x90, 0x8b, 0x1, 0x83, 0xec, 0x8, 0x85, 0xc0, 0x75, 0x8, 0x32, 0xc0, 0x83, 0xc4, 0x8, 0xc2, 0x8, 0x0, 0x8b, 0x54, 0x24, 0xc, 0x8b, 0x12, 0x89, 0x54, 0x24, 0x0, 0x8b, 0x54, 0x24, 0x10, 0x85, 0xd2, 0x74, 0x8, 0x8b, 0x12, 0x89, 0x54, 0x24, 0x4, 0xeb, 0x8, 0xc7, 0x44, 0x24, 0x4, 0xff, 0xff, 0xff, 0xff, 0x8b, 0x49, 0x10, 0x68, 0xa0, 0x7e, 0x75, 0x0, 0x6a, 0x8, 0x51, 0x8d, 0x54, 0x24, 0xc, 0x50, 0x52, 0xe8, 0x9b, 0x43, 0x10, 0x0, 0x83, 0xc4, 0x14, 0x85, 0xc0, 0xf, 0x95, 0xc0, 0x83, 0xc4, 0x8, 0xc2, 0x8, 0x0, 0x90, 0x90, 0x90, 0x90, 0x90, 0x90, 0x90, 0x90, 0x90, 0x83, 0xec, 0x8, 0x53, 0x8b, 0x5c, 0x24, 0x10, 0x55, 0x56, 0x8b, 0x3, 0x57, 0x8b, 0xf9, 0x68, 0x40, 0x47, 0x84, 0x0, 0x89, 0x44, 0x24, 0x18, 0x6a, 0x8, 0x8b, 0x4f, 0x14, 0x8b, 0x57, 0x4, 0x51, 0x8d, 0x44, 0x24, 0x1c, 0x52, 0x50, 0xc7, 0x44, 0x24, 0x24, 0xff, 0xff, 0xff, 0xff, 0xe8, 0x50, 0x43, 0x10, 0x0, 0x8b, 0xf0, 0x83, 0xc4, 0x14, 0x85, 0xf6, 0x74, 0x4a, 0x8b, 0x47, 0x4, 0x8b, 0x4f, 0x14, 0x3b, 0xf0, 0x8d, 0x6c, 0xc8, 0xf8, 0x76, 0x15, 0x8b, 0xb, 0x8b, 0x56, 0xfc, 0x83, 0xee, 0x8, 0x3b, 0xd1, 0x75, 0x6, 0x3b, 0xf0, 0x77, 0xf2, 0xeb, 0x3, 0x83, 0xc6, 0x8, 0x8b, 0x56, 0x4, 0x8b, 0x3, 0x3b, 0xd0, 0x75, 0x1e, 0x8b, 0x7c, 0x24, 0x20, 0x6a, 0x8, 0x56, 0x8b, 0xcf, 0xe8, 0x79, 0xaf, 0xe4, 0xff, 0x3b, 0xf5, 0x74, 0xc, 0x8b, 0x46, 0xc, 0x8b, 0xb, 0x83, 0xc6, 0x8, 0x3b];

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x840d80, 0x840dac, 0x840db4, 0x840dc5, 0x840dcc, 0x840ded, 0x840df9, 0x840dfd, 0x840e01, 0x840e26, 0x840e2d, 0x840e37, 0x840e41, 0x840e4b, 0x840e52, 0x840e59, 0x840e60, 0x840e75, 0x840e7a, 0x840e8f, 0x840e98, 0x840eb0, 0x840eb7, 0x840ebc, 0x840ec1, 0x840ec6, 0x840ecb, 0x840ece, 0x840ed2, 0x840edb, 0x840ef2, 0x840f0b, 0x840f25, 0x840f74, 0x840f7f, 0x840fcb, 0x840fd4, 0x840fe1, 0x840fe8, 0x84100a, 0x84100d, 0x841015, 0x84101b, 0x84101f, 0x841030, 0x841036, 0x84103d, 0x84105b, 0x84105e, 0x84106c, 0x841071, 0x84107f, 0x841082, 0x841088, 0x841092, 0x8410a0, 0x8410a5, 0x8410ae, 0x8410bb, 0x8410e3, 0x8410e6, 0x8410eb, 0x8410ee, 0x8410f2, 0x841103, 0x841109, 0x841110, 0x84112e, 0x841131, 0x841136, 0x841139, 0x84113f, 0x841149, 0x841157, 0x84115a, 0x841164, 0x841187, 0x8411b0, 0x8411bf, 0x8411c7, 0x8411cc, 0x8411ce, 0x8411dc, 0x8411ed, 0x8411fa, 0x841211, 0x841258, 0x84125e, 0x841265, 0x841285, 0x841294, 0x8412b9, 0x8412de, 0x841300, 0x841322, 0x841344, 0x841369, 0x84137f, 0x841398, 0x84139e, 0x8413d5, 0x8413f8, 0x8413ff, 0x841404, 0x841423, 0x84142a, 0x84144c, 0x841478, 0x841481, 0x84148d, 0x8414e9, 0x8414ef, 0x8414f9, 0x8414fc, 0x8414ff, 0x84150d, 0x84151b, 0x841527, 0x84153b, 0x841547, 0x841558, 0x841565, 0x84156f, 0x841576, 0x8415a5, 0x8415af, 0x8415be, 0x8415c6, 0x8415c8, 0x8415d9, 0x84161c, 0x841622, 0x84163a, 0x841650, 0x841663, 0x84166f, 0x8416cb, 0x8416d1, 0x8416db, 0x8416de, 0x8416e1, 0x8416ef, 0x8416fd, 0x841709, 0x84171d, 0x841729, 0x84173a, 0x841747, 0x841751, 0x841758, 0x841787, 0x841791, 0x8417a0, 0x8417a8, 0x8417aa, 0x8417b7, 0x8417fa, 0x841819, 0x84181b, 0x84181e, 0x84182e, 0x84187a, 0x841895, 0x8418ae, 0x8418c4, 0x8418cb, 0x8418d7, 0x8418db, 0x8418f1, 0x841912, 0x841916, 0x841922, 0x84193e, 0x84196c, 0x8419d9, 0x8419e6, 0x841a12, 0x841a2d, 0x841a50, 0x841a5e, 0x841a62, 0x841a6f, 0x841aa1, 0x841aa9, 0x841acf, 0x841ad5, 0x841ad9, 0x841ae4, 0x841aff, 0x841b0e, 0x841b15, 0x841b3d, 0x841b49, 0x841b50, 0x841b78, 0x841b82, 0x841b8e, 0x841ba4, 0x841ba8, 0x841bb9, 0x841bc8, 0x841be3, 0x841bee, 0x841c09, 0x841c14, 0x841c2f, 0x841c3a, 0x841c55, 0x841c60, 0x841c7b, 0x841c86, 0x841ca1, 0x841cac, 0x841cc7, 0x841ccc, 0x841ce7, 0x841cef, 0x841d06, 0x841d0e, 0x841d25, 0x841d2d, 0x841d44, 0x841d4c, 0x841d63, 0x841d69, 0x841d6d, 0x841d7a, 0x841db9, 0x841dd4, 0x841ddc, 0x841df0, 0x841df6, 0x841e01, 0x841e0f, 0x841e2e, 0x841e30, 0x841e55, 0x841e5e, 0x841e6e, 0x841e8b, 0x841e9e, 0x841eb1, 0x841eb9, 0x841ebd, 0x841ed2, 0x841ee1, 0x841eee, 0x841f06, 0x841f0e, 0x841f16, 0x841f29, 0x841f30, 0x841f41, 0x841f47, 0x841f54, 0x841f62, 0x841f6b, 0x841f7a, 0x841fa6, 0x841fac, 0x841fb3]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 10, 10, 10, 10, 11, 11, 11, 11, 11, 11, 11, 12, 12, 12, 12, 12, 13, 13, 13, 13, 13, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 20, 20, 20, 20, 20, 20, 20, 21, 21, 21, 22, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 25, 25, 25, 25, 25, 25, 25, 25, 25, 26, 26, 26, 26, 26, 26, 26, 26, 26, 27, 27, 27, 27, 27, 27, 27, 27, 27, 28, 28, 28, 28, 28, 28, 28, 29, 29, 29, 29, 29, 29, 29, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 31, 31, 31, 31, 31, 31, 31, 31, 32, 32, 32, 32]);
function f_840d80_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 840d80
        R.push((R.ebp >>> 0)); // 840d80: push ebp
        R.ebp = ((R.esp >>> 0)) | 0; // 840d81: mov ebp, esp
        R.esp = (R.logic((R.esp >>> 0) & 0xfffffff8, 32)) | 0; // 840d83: and esp, 0xfffffff8
        R.esp = (R.sub((R.esp >>> 0), 0x3c, 32)) | 0; // 840d86: sub esp, 0x3c
        R.push((R.ebx >>> 0)); // 840d89: push ebx
        R.ebx = (R.m.u32(((R.ebp + 0x10) | 0) >>> 0)) | 0; // 840d8a: mov ebx, dword ptr [ebp + 0x10]
        R.push((R.esi >>> 0)); // 840d8d: push esi
        R.esi = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 840d8e: mov esi, dword ptr [ebp + 8]
        R.eax = (R.m.u32(((R.ebx + 0x7) | 0) >>> 0)) | 0; // 840d91: mov eax, dword ptr [ebx + 7]
        R.push((R.edi >>> 0)); // 840d94: push edi
        R.edi = (R.m.u32(((R.esi + 0xcf) | 0) >>> 0)) | 0; // 840d95: mov edi, dword ptr [esi + 0xcf]
        R.sub((R.eax >>> 0), 0x1, 32); // 840d9b: cmp eax, 1
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.ecx >>> 0)); // 840d9e: mov dword ptr [esp + 0x28], ecx
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.edi >>> 0)); // 840da2: mov dword ptr [esp + 0x18], edi
        R.m.w32(((R.esp + 0x3c) | 0) >>> 0, (R.eax >>> 0)); // 840da6: mov dword ptr [esp + 0x3c], eax
        if (!R.cLE) { pc = 2; continue; } // 840daa: jg 0x840db4
        pc = 1; continue;
      case 1: // 840dac
        R.m.w32(((R.esp + 0x3c) | 0) >>> 0, 0x1); // 840dac: mov dword ptr [esp + 0x3c], 1
        pc = 2; continue;
      case 2: // 840db4
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 840db4: test edi, edi
        R.m.w8(((R.esp + 0xf) | 0) >>> 0, 0x4); // 840db6: mov byte ptr [esp + 0xf], 4
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, 0x0); // 840dbb: mov dword ptr [esp + 0x20], 0
        if (R.zf) { pc = 5; continue; } // 840dc3: je 0x840ded
        pc = 3; continue;
      case 3: // 840dc5
        R.eax = (R.m.u32(((R.edi + 0x69) | 0) >>> 0)) | 0; // 840dc5: mov eax, dword ptr [edi + 0x69]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 840dc8: test eax, eax
        if (!R.zf) { pc = 5; continue; } // 840dca: jne 0x840ded
        pc = 4; continue;
      case 4: // 840dcc
        R.eax = (R.m.u32(((0xae2368) | 0) >>> 0)) | 0; // 840dcc: mov eax, dword ptr [0xae2368]
        R.push((R.eax >>> 0)); // 840dd1: push eax
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 840dd2: call 0x90cfc0
        R.edx = (R.m.u32(((0xae23c0) | 0) >>> 0)) | 0; // 840dd7: mov edx, dword ptr [0xae23c0]
        R.ecx = ((R.eax >>> 0)) | 0; // 840ddd: mov ecx, eax
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 840ddf: shl ecx, 4
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 840de2: add esp, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 840de5: add ecx, eax
        R.eax = (((R.edx + R.ecx * 4) | 0)) | 0; // 840de7: lea eax, [edx + ecx*4]
        R.m.w32(((R.edi + 0x69) | 0) >>> 0, (R.eax >>> 0)); // 840dea: mov dword ptr [edi + 0x69], eax
        pc = 5; continue;
      case 5: // 840ded
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebx + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 840ded: mov al, byte ptr [ebx + 0x24]
        R.edi = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 840df0: mov edi, dword ptr [ebp + 0xc]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x1e, 8)) & 0xff) << 0)) | 0; // 840df3: and al, 0x1e
        R.sub(((R.eax >>> 0) & 0xff), 0x4, 8); // 840df5: cmp al, 4
        if (R.zf) { pc = 16; continue; } // 840df7: je 0x840e60
        pc = 6; continue;
      case 6: // 840df9
        R.sub(((R.eax >>> 0) & 0xff), 0x6, 8); // 840df9: cmp al, 6
        if (R.zf) { pc = 16; continue; } // 840dfb: je 0x840e60
        pc = 7; continue;
      case 7: // 840dfd
        R.sub(((R.eax >>> 0) & 0xff), 0x8, 8); // 840dfd: cmp al, 8
        if (!R.zf) { pc = 15; continue; } // 840dff: jne 0x840e59
        pc = 8; continue;
      default: return pc;
    }
  }
}
function f_840d80_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 8: // 840e01
        R.ecx = (R.m.u32(((R.esi + 0xcf) | 0) >>> 0)) | 0; // 840e01: mov ecx, dword ptr [esi + 0xcf]
        R.ebx = (0x5982) | 0; // 840e07: mov ebx, 0x5982
        R.push((R.ecx >>> 0)); // 840e0c: push ecx
        R.push((R.edi >>> 0)); // 840e0d: push edi
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.ebx >>> 0)); // 840e0e: mov dword ptr [esp + 0x18], ebx
        R.call(0x5408c0, { n: 2, thisEcx: false, calleeClean: false }); // 840e12: call 0x5408c0
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 840e17: movsx eax, al
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 840e1a: add esp, 8
        R.sub((R.eax >>> 0), 0x4, 32); // 840e1d: cmp eax, 4
        if (!R.cBE) { pc = 28; continue; } // 840e20: ja 0x840ed2
        pc = 9; continue;
      case 9: // 840e26
        pc = [10, 11, 12, 13, 14][R.eax >>> 0] ?? -2; continue; // 840e26: jmp dword ptr [eax*4 + 0x841fc0]
      case 10: // 840e2d
        R.ebx = (0x59c2) | 0; // 840e2d: mov ebx, 0x59c2
        pc = 27; continue; // 840e32: jmp 0x840ece
      case 11: // 840e37
        R.ebx = (0x59d2) | 0; // 840e37: mov ebx, 0x59d2
        pc = 27; continue; // 840e3c: jmp 0x840ece
      case 12: // 840e41
        R.ebx = (0x5992) | 0; // 840e41: mov ebx, 0x5992
        pc = 27; continue; // 840e46: jmp 0x840ece
      case 13: // 840e4b
        R.ebx = (0x59b2) | 0; // 840e4b: mov ebx, 0x59b2
        pc = 27; continue; // 840e50: jmp 0x840ece
      case 14: // 840e52
        R.ebx = (0x59a2) | 0; // 840e52: mov ebx, 0x59a2
        pc = 27; continue; // 840e57: jmp 0x840ece
      case 15: // 840e59
        R.ebx = (0x5902) | 0; // 840e59: mov ebx, 0x5902
        pc = 27; continue; // 840e5e: jmp 0x840ece
      case 16: // 840e60
        R.edx = (R.m.u32(((R.ebp + 0x10) | 0) >>> 0)) | 0; // 840e60: mov edx, dword ptr [ebp + 0x10]
        R.ecx = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 840e63: mov ecx, dword ptr [edi]
        R.ebx = (0x5882) | 0; // 840e65: mov ebx, 0x5882
        R.eax = (R.m.u32(((R.edx + 0xf) | 0) >>> 0)) | 0; // 840e6a: mov eax, dword ptr [edx + 0xf]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ebx >>> 0)); // 840e6d: mov dword ptr [esp + 0x10], ebx
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 840e71: cmp eax, ecx
        if (!R.zf) { pc = 20; continue; } // 840e73: jne 0x840e98
        pc = 17; continue;
      case 17: // 840e75
        R.sub(R.m.u32(((R.edi + 0x39) | 0) >>> 0), (R.esi >>> 0), 32); // 840e75: cmp dword ptr [edi + 0x39], esi
        if (!R.zf) { pc = 20; continue; } // 840e78: jne 0x840e98
        pc = 18; continue;
      case 18: // 840e7a
        R.push(0x0); // 840e7a: push 0
        R.push(0x0); // 840e7c: push 0
        R.push(0x1); // 840e7e: push 1
        R.push(0x1); // 840e80: push 1
        R.push((R.esi >>> 0)); // 840e82: push esi
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 840e83: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 840e88: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 840e8b: test eax, eax
        if (R.zf) { pc = 20; continue; } // 840e8d: je 0x840e98
        pc = 19; continue;
      case 19: // 840e8f
        R.ebx = (0x815882) | 0; // 840e8f: mov ebx, 0x815882
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ebx >>> 0)); // 840e94: mov dword ptr [esp + 0x10], ebx
        pc = 20; continue;
      default: return pc;
    }
  }
}
function f_840d80_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 20: // 840e98
        R.ecx = (R.m.u32(((R.esi + 0xcf) | 0) >>> 0)) | 0; // 840e98: mov ecx, dword ptr [esi + 0xcf]
        R.push((R.ecx >>> 0)); // 840e9e: push ecx
        R.push((R.edi >>> 0)); // 840e9f: push edi
        R.call(0x5408c0, { n: 2, thisEcx: false, calleeClean: false }); // 840ea0: call 0x5408c0
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 840ea5: movsx eax, al
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 840ea8: add esp, 8
        R.sub((R.eax >>> 0), 0x4, 32); // 840eab: cmp eax, 4
        if (!R.cBE) { pc = 28; continue; } // 840eae: ja 0x840ed2
        pc = 21; continue;
      case 21: // 840eb0
        pc = [22, 23, 24, 25, 26][R.eax >>> 0] ?? -2; continue; // 840eb0: jmp dword ptr [eax*4 + 0x841fd4]
      case 22: // 840eb7
        R.ebx = (R.logic((R.ebx >>> 0) | 0x40, 32)) | 0; // 840eb7: or ebx, 0x40
        pc = 27; continue; // 840eba: jmp 0x840ece
      case 23: // 840ebc
        R.ebx = (R.logic((R.ebx >>> 0) | 0x50, 32)) | 0; // 840ebc: or ebx, 0x50
        pc = 27; continue; // 840ebf: jmp 0x840ece
      case 24: // 840ec1
        R.ebx = (R.logic((R.ebx >>> 0) | 0x10, 32)) | 0; // 840ec1: or ebx, 0x10
        pc = 27; continue; // 840ec4: jmp 0x840ece
      case 25: // 840ec6
        R.ebx = (R.logic((R.ebx >>> 0) | 0x30, 32)) | 0; // 840ec6: or ebx, 0x30
        pc = 27; continue; // 840ec9: jmp 0x840ece
      case 26: // 840ecb
        R.ebx = (R.logic((R.ebx >>> 0) | 0x20, 32)) | 0; // 840ecb: or ebx, 0x20
        pc = 27; continue;
      case 27: // 840ece
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ebx >>> 0)); // 840ece: mov dword ptr [esp + 0x10], ebx
        pc = 28; continue;
      case 28: // 840ed2
        R.edx = (R.m.u32(((R.ebp + 0x10) | 0) >>> 0)) | 0; // 840ed2: mov edx, dword ptr [ebp + 0x10]
        R.logic(R.m.u8(((R.edx + 0x24) | 0) >>> 0) & 0x1, 8); // 840ed5: test byte ptr [edx + 0x24], 1
        if (R.zf) { pc = 30; continue; } // 840ed9: je 0x840ef2
        pc = 29; continue;
      case 29: // 840edb
        R.push(0x0); // 840edb: push 0
        R.push((R.edi >>> 0)); // 840edd: push edi
        R.call(0x544590, { n: 2, thisEcx: false, calleeClean: false }); // 840ede: call 0x544590
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 840ee3: add esp, 8
        R.eax = (R.neg((R.eax >>> 0), 32)) | 0; // 840ee6: neg eax
        R.eax = ((R.eax & 0xffffff00) | (((R.sub(((R.eax >>> 0) & 0xff), ((R.eax >>> 0) & 0xff), 8, R.cf ? 1 : 0)) & 0xff) << 0)) | 0; // 840ee8: sbb al, al
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xa, 8)) & 0xff) << 0)) | 0; // 840eea: and al, 0xa
        R.eax = ((R.eax & 0xffffff00) | (((R.add(((R.eax >>> 0) & 0xff), 0x6, 8)) & 0xff) << 0)) | 0; // 840eec: add al, 6
        R.m.w8(((R.esp + 0xf) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 840eee: mov byte ptr [esp + 0xf], al
        pc = 30; continue;
      case 30: // 840ef2
        R.push(0x0); // 840ef2: push 0
        R.push(0x0); // 840ef4: push 0
        R.push(0x1); // 840ef6: push 1
        R.push(0x1); // 840ef8: push 1
        R.push((R.esi >>> 0)); // 840efa: push esi
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 840efb: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 840f00: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 840f03: test eax, eax
        if (R.zf) { pc = 35; continue; } // 840f05: je 0x840fcb
        pc = 31; continue;
      default: return pc;
    }
  }
}
function f_840d80_3(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 31: // 840f0b
        R.push((R.esi >>> 0)); // 840f0b: push esi
        R.call(0x53ca90, { n: 1, thisEcx: false, calleeClean: false }); // 840f0c: call 0x53ca90
        R.ecx = (R.m.u32(((0xb74448) | 0) >>> 0)) | 0; // 840f11: mov ecx, dword ptr [0xb74448]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 840f17: add esp, 4
        R.push((R.eax >>> 0)); // 840f1a: push eax
        R.push((R.edi >>> 0)); // 840f1b: push edi
        R.call(0x7f7490, { n: 2, thisEcx: true, calleeClean: true }); // 840f1c: call 0x7f7490
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 840f21: test eax, eax
        if (R.zf) { pc = 34; continue; } // 840f23: je 0x840f7f
        pc = 32; continue;
      case 32: // 840f25
        R.push((R.esi >>> 0)); // 840f25: push esi
        R.call(0x600e90, { n: 0, thisEcx: false, calleeClean: false }); // 840f26: call 0x600e90
        R.push((R.eax >>> 0)); // 840f2b: push eax
        R.eax = (R.m.u32(((R.ebp + 0x10) | 0) >>> 0)) | 0; // 840f2c: mov eax, dword ptr [ebp + 0x10]
        R.push(0xffffffff); // 840f2f: push -1
        R.push((R.esi >>> 0)); // 840f31: push esi
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.eax + 0x1) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 840f32: mov cx, word ptr [eax + 1]
        R.push((R.ebx >>> 0)); // 840f36: push ebx
        R.push((R.ecx >>> 0)); // 840f37: push ecx
        R.push((R.edi >>> 0)); // 840f38: push edi
        R.call(0x6e6340, { n: 7, thisEcx: false, calleeClean: false }); // 840f39: call 0x6e6340
        R.ebx = (R.m.u32(((R.ebp + 0x14) | 0) >>> 0)) | 0; // 840f3e: mov ebx, dword ptr [ebp + 0x14]
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.eax >>> 0)); // 840f41: mov dword ptr [esp + 0x34], eax
        R.esp = (R.add((R.esp >>> 0), 0x1c, 32)) | 0; // 840f45: add esp, 0x1c
        R.m.w32(((R.ebx) | 0) >>> 0, (R.eax >>> 0)); // 840f48: mov dword ptr [ebx], eax
        R.eax = (R.add((R.eax >>> 0), 0x3a98, 32)) | 0; // 840f4a: add eax, 0x3a98
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.eax >>> 0)); // 840f4f: mov dword ptr [esp + 0x30], eax
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 840f53: fild dword ptr [esp + 0x30]
        R.fpush(R.m.s32(((R.esp + 0x18) | 0) >>> 0)); // 840f57: fild dword ptr [esp + 0x18]
        R.st[0] = R.st[0] * 1.5; // 840f5b: fmul qword ptr [0x968940]
        R.m.wf64(((R.esp + 0x40) | 0) >>> 0, R.st[0]); R.fpop(); // 840f61: fstp qword ptr [esp + 0x40]
        R.fcom(R.st[0], R.f64(((R.esp + 0x40) | 0))); // 840f65: fcom qword ptr [esp + 0x40]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 840f69: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 840f6b: test ah, 0x41
        if (R.zf) { pc = 79; continue; } // 840f6e: je 0x8411c7
        pc = 33; continue;
      case 33: // 840f74
        R.fpop(); // 840f74: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x40) | 0))); // 840f76: fld qword ptr [esp + 0x40]
        pc = 79; continue; // 840f7a: jmp 0x8411c7
      default: return pc;
    }
  }
}
function f_840d80_4(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 34: // 840f7f
        R.fpush(R.m.s32(((R.ebp + 0x18) | 0) >>> 0)); // 840f7f: fild dword ptr [ebp + 0x18]
        R.push((R.esi >>> 0)); // 840f82: push esi
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); R.fpop(); // 840f83: fstp qword ptr [esp + 0x44]
        R.call(0x600e90, { n: 0, thisEcx: false, calleeClean: false }); // 840f87: call 0x600e90
        R.fpush(R.f64(((R.esp + 0x44) | 0))); // 840f8c: fld qword ptr [esp + 0x44]
        R.st[0] = R.st[0] * 2.5e-05; // 840f90: fmul qword ptr [0x96d240]
        R.edx = (((R.m.u8(((R.esp + 0x13) | 0) >>> 0)) << 24 >> 24)) | 0; // 840f96: movsx edx, byte ptr [esp + 0x13]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x44) | 0)); // 840f9b: fmul qword ptr [esp + 0x44]
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.edx >>> 0)); // 840f9f: mov dword ptr [esp + 0x34], edx
        R.push((R.eax >>> 0)); // 840fa3: push eax
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 840fa4: fild dword ptr [esp + 0x38]
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 840fa8: fdivp st(1)
        R.ftol(); // 840faa: call 0x945640
        R.push((R.eax >>> 0)); // 840faf: push eax
        R.eax = (R.m.u32(((R.ebp + 0x10) | 0) >>> 0)) | 0; // 840fb0: mov eax, dword ptr [ebp + 0x10]
        R.push((R.esi >>> 0)); // 840fb3: push esi
        R.push((R.ebx >>> 0)); // 840fb4: push ebx
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.eax + 0x1) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 840fb5: mov cx, word ptr [eax + 1]
        R.push((R.ecx >>> 0)); // 840fb9: push ecx
        R.push((R.edi >>> 0)); // 840fba: push edi
        R.call(0x6e6340, { n: 7, thisEcx: false, calleeClean: false }); // 840fbb: call 0x6e6340
        R.ebx = (R.m.u32(((R.ebp + 0x14) | 0) >>> 0)) | 0; // 840fc0: mov ebx, dword ptr [ebp + 0x14]
        R.esp = (R.add((R.esp >>> 0), 0x1c, 32)) | 0; // 840fc3: add esp, 0x1c
        pc = 80; continue; // 840fc6: jmp 0x8411cc
      case 35: // 840fcb
        R.logic(((R.ebx >>> 8) & 0xff) & 0x1, 8); // 840fcb: test bh, 1
        if (R.zf) { pc = 56; continue; } // 840fce: je 0x8410a5
        pc = 36; continue;
      case 36: // 840fd4
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 840fd4: mov eax, dword ptr [esp + 0x18]
        R.m.w8(((R.esp + 0xe) | 0) >>> 0, 0x0); // 840fd8: mov byte ptr [esp + 0xe], 0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 840fdd: test eax, eax
        if (R.zf) { pc = 43; continue; } // 840fdf: je 0x84101f
        pc = 37; continue;
      case 37: // 840fe1
        R.eax = (R.m.u32(((R.eax + 0x69) | 0) >>> 0)) | 0; // 840fe1: mov eax, dword ptr [eax + 0x69]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 840fe4: test eax, eax
        if (R.zf) { pc = 43; continue; } // 840fe6: je 0x84101f
        pc = 38; continue;
      case 38: // 840fe8
        R.push(0x6); // 840fe8: push 6
        R.push((R.eax >>> 0)); // 840fea: push eax
        R.call(0x544410, { n: 0, thisEcx: false, calleeClean: false }); // 840feb: call 0x544410
        R.edx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 840ff0: mov edx, dword ptr [esp + 0x20]
        R.m.w8(((R.esp + 0x16) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 840ff4: mov byte ptr [esp + 0x16], al
        R.push((R.edx >>> 0)); // 840ff8: push edx
        R.push((R.edi >>> 0)); // 840ff9: push edi
        R.call(0x5408c0, { n: 4, thisEcx: false, calleeClean: false }); // 840ffa: call 0x5408c0
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 840fff: movsx eax, al
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 841002: add esp, 0x10
        R.eax = (R.sub((R.eax >>> 0), 0x3, 32)) | 0; // 841005: sub eax, 3
        if (R.zf) { pc = 41; continue; } // 841008: je 0x841015
        pc = 39; continue;
      case 39: // 84100a
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 84100a: dec eax
        if (!R.zf) { pc = 43; continue; } // 84100b: jne 0x84101f
        pc = 40; continue;
      default: return pc;
    }
  }
}
function f_840d80_5(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 40: // 84100d
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0xe) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84100d: mov al, byte ptr [esp + 0xe]
        R.eax = ((R.eax & 0xffffff00) | (((R.add(((R.eax >>> 0) & 0xff), 0xf6, 8)) & 0xff) << 0)) | 0; // 841011: add al, 0xf6
        pc = 42; continue; // 841013: jmp 0x84101b
      case 41: // 841015
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0xe) | 0) >>> 0)) & 0xff) << 0)) | 0; // 841015: mov al, byte ptr [esp + 0xe]
        R.eax = ((R.eax & 0xffffff00) | (((R.add(((R.eax >>> 0) & 0xff), 0xfb, 8)) & 0xff) << 0)) | 0; // 841019: add al, 0xfb
        pc = 42; continue;
      case 42: // 84101b
        R.m.w8(((R.esp + 0xe) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 84101b: mov byte ptr [esp + 0xe], al
        pc = 43; continue;
      case 43: // 84101f
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 84101f: mov eax, dword ptr [ebp + 8]
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, 0x7); // 841022: mov dword ptr [esp + 0x30], 7
        R.esi = (((R.eax + 0x1b3) | 0)) | 0; // 84102a: lea esi, [eax + 0x1b3]
        pc = 44; continue;
      case 44: // 841030
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 841030: mov eax, dword ptr [esi]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 841032: test eax, eax
        if (R.zf) { pc = 54; continue; } // 841034: je 0x841092
        pc = 45; continue;
      case 45: // 841036
        R.eax = (R.m.u32(((R.eax + 0x69) | 0) >>> 0)) | 0; // 841036: mov eax, dword ptr [eax + 0x69]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 841039: test eax, eax
        if (R.zf) { pc = 54; continue; } // 84103b: je 0x841092
        pc = 46; continue;
      case 46: // 84103d
        R.push(0x6); // 84103d: push 6
        R.push((R.eax >>> 0)); // 84103f: push eax
        R.call(0x544410, { n: 0, thisEcx: false, calleeClean: false }); // 841040: call 0x544410
        R.ecx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 841045: mov ecx, dword ptr [esi]
        R.ebx = ((R.ebx & 0xffffff00) | (((((R.eax >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 841047: mov bl, al
        R.push((R.ecx >>> 0)); // 841049: push ecx
        R.push((R.edi >>> 0)); // 84104a: push edi
        R.call(0x5408c0, { n: 4, thisEcx: false, calleeClean: false }); // 84104b: call 0x5408c0
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 841050: movsx eax, al
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 841053: add esp, 0x10
        R.eax = (R.sub((R.eax >>> 0), 0x3, 32)) | 0; // 841056: sub eax, 3
        if (R.zf) { pc = 50; continue; } // 841059: je 0x841071
        pc = 47; continue;
      case 47: // 84105b
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 84105b: dec eax
        if (!R.zf) { pc = 52; continue; } // 84105c: jne 0x841082
        pc = 48; continue;
      case 48: // 84105e
        R.edx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 84105e: mov edx, dword ptr [ebp + 8]
        R.sub(R.m.u16(((R.edx + 0x80) | 0) >>> 0), 0xdac, 16); // 841061: cmp word ptr [edx + 0x80], 0xdac
        if (R.cL) { pc = 54; continue; } // 84106a: jl 0x841092
        pc = 49; continue;
      case 49: // 84106c
        R.ebx = ((R.ebx & 0xffffff00) | (((R.add(((R.ebx >>> 0) & 0xff), 0xf6, 8)) & 0xff) << 0)) | 0; // 84106c: add bl, 0xf6
        pc = 52; continue; // 84106f: jmp 0x841082
      case 50: // 841071
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 841071: mov eax, dword ptr [ebp + 8]
        R.sub(R.m.u16(((R.eax + 0x80) | 0) >>> 0), 0xdac, 16); // 841074: cmp word ptr [eax + 0x80], 0xdac
        if (R.cL) { pc = 54; continue; } // 84107d: jl 0x841092
        pc = 51; continue;
      case 51: // 84107f
        R.ebx = ((R.ebx & 0xffffff00) | (((R.add(((R.ebx >>> 0) & 0xff), 0xfb, 8)) & 0xff) << 0)) | 0; // 84107f: add bl, 0xfb
        pc = 52; continue;
      default: return pc;
    }
  }
}
function f_840d80_6(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 52: // 841082
        R.sub(((R.ebx >>> 0) & 0xff), R.m.u8(((R.esp + 0xe) | 0) >>> 0), 8); // 841082: cmp bl, byte ptr [esp + 0xe]
        if (R.cLE) { pc = 54; continue; } // 841086: jle 0x841092
        pc = 53; continue;
      case 53: // 841088
        R.ecx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 841088: mov ecx, dword ptr [esi]
        R.m.w8(((R.esp + 0xe) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 84108a: mov byte ptr [esp + 0xe], bl
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.ecx >>> 0)); // 84108e: mov dword ptr [esp + 0x18], ecx
        pc = 54; continue;
      case 54: // 841092
        R.eax = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 841092: mov eax, dword ptr [esp + 0x30]
        R.esi = (R.add((R.esi >>> 0), 0x4, 32)) | 0; // 841096: add esi, 4
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 841099: dec eax
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.eax >>> 0)); // 84109a: mov dword ptr [esp + 0x30], eax
        if (!R.zf) { pc = 44; continue; } // 84109e: jne 0x841030
        pc = 55; continue;
      case 55: // 8410a0
        pc = 73; continue; // 8410a0: jmp 0x841157
      case 56: // 8410a5
        R.logic(((R.ebx >>> 0) & 0xff) & 0x80, 8); // 8410a5: test bl, 0x80
        if (R.zf) { pc = 74; continue; } // 8410a8: je 0x84115a
        pc = 57; continue;
      case 57: // 8410ae
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 8410ae: mov eax, dword ptr [esp + 0x18]
        R.m.w8(((R.esp + 0xe) | 0) >>> 0, 0x0); // 8410b2: mov byte ptr [esp + 0xe], 0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8410b7: test eax, eax
        if (R.zf) { pc = 63; continue; } // 8410b9: je 0x8410f2
        pc = 58; continue;
      case 58: // 8410bb
        R.esi = ((R.eax >>> 0)) | 0; // 8410bb: mov esi, eax
        R.push(0x5); // 8410bd: push 5
        R.edx = (R.m.u32(((R.esi + 0x69) | 0) >>> 0)) | 0; // 8410bf: mov edx, dword ptr [esi + 0x69]
        R.push((R.edx >>> 0)); // 8410c2: push edx
        R.call(0x544410, { n: 0, thisEcx: false, calleeClean: false }); // 8410c3: call 0x544410
        R.ebx = ((R.ebx & 0xffffff00) | (((((R.eax >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 8410c8: mov bl, al
        R.push((R.esi >>> 0)); // 8410ca: push esi
        R.ebx = ((R.ebx & 0xffffff00) | (((R.add(((R.ebx >>> 0) & 0xff), 0x5, 8)) & 0xff) << 0)) | 0; // 8410cb: add bl, 5
        R.push((R.edi >>> 0)); // 8410ce: push edi
        R.m.w8(((R.esp + 0x1e) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 8410cf: mov byte ptr [esp + 0x1e], bl
        R.call(0x5408c0, { n: 4, thisEcx: false, calleeClean: false }); // 8410d3: call 0x5408c0
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 8410d8: movsx eax, al
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 8410db: add esp, 0x10
        R.eax = (R.sub((R.eax >>> 0), 0x3, 32)) | 0; // 8410de: sub eax, 3
        if (R.zf) { pc = 61; continue; } // 8410e1: je 0x8410eb
        pc = 59; continue;
      case 59: // 8410e3
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 8410e3: dec eax
        if (!R.zf) { pc = 63; continue; } // 8410e4: jne 0x8410f2
        pc = 60; continue;
      case 60: // 8410e6
        R.ebx = ((R.ebx & 0xffffff00) | (((R.add(((R.ebx >>> 0) & 0xff), 0xf6, 8)) & 0xff) << 0)) | 0; // 8410e6: add bl, 0xf6
        pc = 62; continue; // 8410e9: jmp 0x8410ee
      case 61: // 8410eb
        R.ebx = ((R.ebx & 0xffffff00) | (((R.add(((R.ebx >>> 0) & 0xff), 0xfb, 8)) & 0xff) << 0)) | 0; // 8410eb: add bl, 0xfb
        pc = 62; continue;
      case 62: // 8410ee
        R.m.w8(((R.esp + 0xe) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 8410ee: mov byte ptr [esp + 0xe], bl
        pc = 63; continue;
      default: return pc;
    }
  }
}
function f_840d80_7(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 63: // 8410f2
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 8410f2: mov eax, dword ptr [ebp + 8]
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, 0x7); // 8410f5: mov dword ptr [esp + 0x30], 7
        R.esi = (((R.eax + 0x1b3) | 0)) | 0; // 8410fd: lea esi, [eax + 0x1b3]
        pc = 64; continue;
      case 64: // 841103
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 841103: mov eax, dword ptr [esi]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 841105: test eax, eax
        if (R.zf) { pc = 72; continue; } // 841107: je 0x841149
        pc = 65; continue;
      case 65: // 841109
        R.eax = (R.m.u32(((R.eax + 0x69) | 0) >>> 0)) | 0; // 841109: mov eax, dword ptr [eax + 0x69]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84110c: test eax, eax
        if (R.zf) { pc = 72; continue; } // 84110e: je 0x841149
        pc = 66; continue;
      case 66: // 841110
        R.push(0x5); // 841110: push 5
        R.push((R.eax >>> 0)); // 841112: push eax
        R.call(0x544410, { n: 0, thisEcx: false, calleeClean: false }); // 841113: call 0x544410
        R.ecx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 841118: mov ecx, dword ptr [esi]
        R.ebx = ((R.ebx & 0xffffff00) | (((((R.eax >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 84111a: mov bl, al
        R.push((R.ecx >>> 0)); // 84111c: push ecx
        R.push((R.edi >>> 0)); // 84111d: push edi
        R.call(0x5408c0, { n: 4, thisEcx: false, calleeClean: false }); // 84111e: call 0x5408c0
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 841123: movsx eax, al
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 841126: add esp, 0x10
        R.eax = (R.sub((R.eax >>> 0), 0x3, 32)) | 0; // 841129: sub eax, 3
        if (R.zf) { pc = 69; continue; } // 84112c: je 0x841136
        pc = 67; continue;
      case 67: // 84112e
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 84112e: dec eax
        if (!R.zf) { pc = 70; continue; } // 84112f: jne 0x841139
        pc = 68; continue;
      case 68: // 841131
        R.ebx = ((R.ebx & 0xffffff00) | (((R.add(((R.ebx >>> 0) & 0xff), 0xf6, 8)) & 0xff) << 0)) | 0; // 841131: add bl, 0xf6
        pc = 70; continue; // 841134: jmp 0x841139
      case 69: // 841136
        R.ebx = ((R.ebx & 0xffffff00) | (((R.add(((R.ebx >>> 0) & 0xff), 0xfb, 8)) & 0xff) << 0)) | 0; // 841136: add bl, 0xfb
        pc = 70; continue;
      case 70: // 841139
        R.sub(((R.ebx >>> 0) & 0xff), R.m.u8(((R.esp + 0xe) | 0) >>> 0), 8); // 841139: cmp bl, byte ptr [esp + 0xe]
        if (R.cLE) { pc = 72; continue; } // 84113d: jle 0x841149
        pc = 71; continue;
      case 71: // 84113f
        R.edx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 84113f: mov edx, dword ptr [esi]
        R.m.w8(((R.esp + 0xe) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 841141: mov byte ptr [esp + 0xe], bl
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.edx >>> 0)); // 841145: mov dword ptr [esp + 0x18], edx
        pc = 72; continue;
      case 72: // 841149
        R.eax = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 841149: mov eax, dword ptr [esp + 0x30]
        R.esi = (R.add((R.esi >>> 0), 0x4, 32)) | 0; // 84114d: add esi, 4
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 841150: dec eax
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.eax >>> 0)); // 841151: mov dword ptr [esp + 0x30], eax
        if (!R.zf) { pc = 64; continue; } // 841155: jne 0x841103
        pc = 73; continue;
      case 73: // 841157
        R.esi = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 841157: mov esi, dword ptr [ebp + 8]
        pc = 74; continue;
      default: return pc;
    }
  }
}
function f_840d80_8(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 74: // 84115a
        R.ecx = (R.m.u32(((R.ebp + 0x18) | 0) >>> 0)) | 0; // 84115a: mov ecx, dword ptr [ebp + 0x18]
        R.eax = (R.logic((R.eax >>> 0) | 0xffffffff, 32)) | 0; // 84115d: or eax, 0xffffffff
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 841160: cmp ecx, eax
        if (R.cLE) { pc = 76; continue; } // 841162: jle 0x841187
        pc = 75; continue;
      case 75: // 841164
        R.fpush(R.m.s32(((R.ebp + 0x18) | 0) >>> 0)); // 841164: fild dword ptr [ebp + 0x18]
        R.eax = (((R.m.u8(((R.esp + 0xf) | 0) >>> 0)) << 24 >> 24)) | 0; // 841167: movsx eax, byte ptr [esp + 0xf]
        R.fpush(R.st[0]); // 84116c: fld st(0)
        R.st[0] = R.st[0] * 2.5e-05; // 84116e: fmul qword ptr [0x96d240]
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.eax >>> 0)); // 841174: mov dword ptr [esp + 0x30], eax
        R.st[0] = R.st[0] * R.st[1]; // 841178: fmul st(1)
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 84117a: fild dword ptr [esp + 0x30]
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 84117e: fdivp st(1)
        R.ftol(); // 841180: call 0x945640
        R.fpop(); // 841185: fstp st(0)
        pc = 76; continue;
      case 76: // 841187
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 841187: mov ecx, dword ptr [esp + 0x18]
        R.edx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 84118b: mov edx, dword ptr [esp + 0x10]
        R.push((R.ecx >>> 0)); // 84118f: push ecx
        R.push((R.eax >>> 0)); // 841190: push eax
        R.eax = (R.m.u32(((R.ebp + 0x10) | 0) >>> 0)) | 0; // 841191: mov eax, dword ptr [ebp + 0x10]
        R.push((R.esi >>> 0)); // 841194: push esi
        R.push((R.edx >>> 0)); // 841195: push edx
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.eax + 0x1) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 841196: mov cx, word ptr [eax + 1]
        R.push((R.ecx >>> 0)); // 84119a: push ecx
        R.push((R.edi >>> 0)); // 84119b: push edi
        R.call(0x6e6340, { n: 6, thisEcx: false, calleeClean: false }); // 84119c: call 0x6e6340
        R.ebx = (R.m.u32(((R.ebp + 0x14) | 0) >>> 0)) | 0; // 8411a1: mov ebx, dword ptr [ebp + 0x14]
        R.esp = (R.add((R.esp >>> 0), 0x18, 32)) | 0; // 8411a4: add esp, 0x18
        R.m.w32(((R.ebx) | 0) >>> 0, (R.eax >>> 0)); // 8411a7: mov dword ptr [ebx], eax
        R.eax = (R.m.u32(((R.edi + 0x39) | 0) >>> 0)) | 0; // 8411a9: mov eax, dword ptr [edi + 0x39]
        R.sub((R.esi >>> 0), (R.eax >>> 0), 32); // 8411ac: cmp esi, eax
        if (R.zf) { pc = 81; continue; } // 8411ae: je 0x8411ce
        pc = 77; continue;
      case 77: // 8411b0
        R.push(0x0); // 8411b0: push 0
        R.push((R.edi >>> 0)); // 8411b2: push edi
        R.call(0x544520, { n: 2, thisEcx: false, calleeClean: false }); // 8411b3: call 0x544520
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 8411b8: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8411bb: test eax, eax
        if (R.zf) { pc = 81; continue; } // 8411bd: je 0x8411ce
        pc = 78; continue;
      case 78: // 8411bf
        R.fpush(R.m.s32(((R.ebx) | 0) >>> 0)); // 8411bf: fild dword ptr [ebx]
        R.st[0] = R.st[0] * 1.05; // 8411c1: fmul qword ptr [0x9689b8]
        pc = 79; continue;
      case 79: // 8411c7
        R.ftol(); // 8411c7: call 0x945640
        pc = 80; continue;
      case 80: // 8411cc
        R.m.w32(((R.ebx) | 0) >>> 0, (R.eax >>> 0)); // 8411cc: mov dword ptr [ebx], eax
        pc = 81; continue;
      default: return pc;
    }
  }
}
function f_840d80_9(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 81: // 8411ce
        R.ecx = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 8411ce: mov ecx, dword ptr [ebx]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 8411d0: test ecx, ecx
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.ecx >>> 0)); // 8411d2: mov dword ptr [esp + 0x18], ecx
        if (R.cL) { pc = 255; continue; } // 8411d6: jl 0x841f62
        pc = 82; continue;
      case 82: // 8411dc
        R.edx = (R.m.u32(((R.ebp + 0x18) | 0) >>> 0)) | 0; // 8411dc: mov edx, dword ptr [ebp + 0x18]
        R.edx = (R.add((R.edx >>> 0), 0xffffd8f0, 32)) | 0; // 8411df: add edx, 0xffffd8f0
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 8411e5: cmp ecx, edx
        if (R.cL) { pc = 255; continue; } // 8411e7: jl 0x841f62
        pc = 83; continue;
      case 83: // 8411ed
        R.esi = (R.m.u32(((R.ebp + 0x10) | 0) >>> 0)) | 0; // 8411ed: mov esi, dword ptr [ebp + 0x10]
        R.logic(R.m.u8(((R.esi + 0x24) | 0) >>> 0) & 0x1, 8); // 8411f0: test byte ptr [esi + 0x24], 1
        if (!R.zf) { pc = 256; continue; } // 8411f4: jne 0x841f6b
        pc = 84; continue;
      case 84: // 8411fa
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 8411fa: mov eax, dword ptr [edi]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 8411fc: lea edx, [eax + eax*4]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 8411ff: shl edx, 4
        R.edx = (R.sub((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 841202: sub edx, eax
        R.eax = (R.m.u32(((0xae2d0c) | 0) >>> 0)) | 0; // 841204: mov eax, dword ptr [0xae2d0c]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edx + R.eax + 0xb) | 0) >>> 0)) & 0xff) << 0)) | 0; // 841209: mov al, byte ptr [edx + eax + 0xb]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf, 8)) & 0xff) << 0)) | 0; // 84120d: and al, 0xf
        if (R.zf) { pc = 88; continue; } // 84120f: je 0x841265
        pc = 85; continue;
      case 85: // 841211
        R.ecx = (R.add((R.ecx >>> 0), 0x1388, 32)) | 0; // 841211: add ecx, 0x1388
        R.eax = (R.logic((R.eax >>> 0) & 0xff, 32)) | 0; // 841217: and eax, 0xff
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.ecx >>> 0)); // 84121c: mov dword ptr [esp + 0x30], ecx
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 841220: fild dword ptr [esp + 0x30]
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.eax >>> 0)); // 841224: mov dword ptr [esp + 0x30], eax
        R.m.wf64(((R.esp + 0x40) | 0) >>> 0, R.st[0]); R.fpop(); // 841228: fstp qword ptr [esp + 0x40]
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 84122c: fild dword ptr [esp + 0x30]
        R.fpush(2.0); // 841230: fld qword ptr [0x968950]
        R.call(0x945ff0, { n: 0, thisEcx: false, calleeClean: false, float: true }); // 841236: call 0x945ff0
        R.st[0] = R.st[0] * 0.01; // 84123b: fmul qword ptr [0x967898]
        R.st[0] = R.st[0] + 1.0; // 841241: fadd qword ptr [0x967890]
        R.st[0] = R.st[0] * R.m.s32(((R.esp + 0x18) | 0) >>> 0); // 841247: fimul dword ptr [esp + 0x18]
        R.fpush(R.f64(((R.esp + 0x40) | 0))); // 84124b: fld qword ptr [esp + 0x40]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 84124f: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 841251: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 841253: test ah, 1
        if (R.zf) { pc = 87; continue; } // 841256: je 0x84125e
        pc = 86; continue;
      case 86: // 841258
        R.fpop(); // 841258: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x40) | 0))); // 84125a: fld qword ptr [esp + 0x40]
        pc = 87; continue;
      case 87: // 84125e
        R.ftol(); // 84125e: call 0x945640
        R.m.w32(((R.ebx) | 0) >>> 0, (R.eax >>> 0)); // 841263: mov dword ptr [ebx], eax
        pc = 88; continue;
      default: return pc;
    }
  }
}
function f_840d80_10(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 88: // 841265
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.esi + 0x1) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 841265: mov cx, word ptr [esi + 1]
        R.m.w8(((R.esp + 0xf) | 0) >>> 0, 0x1c); // 841269: mov byte ptr [esp + 0xf], 0x1c
        R.push((R.ecx >>> 0)); // 84126e: push ecx
        R.ecx = (R.m.u32(((R.esp + 0x2c) | 0) >>> 0)) | 0; // 84126f: mov ecx, dword ptr [esp + 0x2c]
        R.call(0x83bd00, { n: 1, thisEcx: false, calleeClean: true }); // 841273: call 0x83bd00
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 841278: movsx eax, al
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 84127b: dec eax
        R.sub((R.eax >>> 0), 0x14, 32); // 84127c: cmp eax, 0x14
        if (!R.cBE) { pc = 95; continue; } // 84127f: ja 0x841344
        pc = 89; continue;
      case 89: // 841285
        R.edx = (R.logic((R.edx >>> 0) ^ (R.edx >>> 0), 32)) | 0; // 841285: xor edx, edx
        R.edx = ((R.edx & 0xffffff00) | (((ROT(RO_842000_1u, 0x842000, 1, ((R.eax + 0x842000) | 0))) & 0xff) << 0)) | 0; // 841287: mov dl, byte ptr [eax + 0x842000]
        pc = [94, 93, 92, 91, 90, 95][R.edx >>> 0] ?? -2; continue; // 84128d: jmp dword ptr [edx*4 + 0x841fe8]
      case 90: // 841294
        R.m.w32(((R.esp + 0x40) | 0) >>> 0, 0x0); // 841294: mov dword ptr [esp + 0x40], 0
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, 0x4168cba8); // 84129c: mov dword ptr [esp + 0x44], 0x4168cba8
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, 0x0); // 8412a4: mov dword ptr [esp + 0x10], 0
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, 0x3ff00000); // 8412ac: mov dword ptr [esp + 0x14], 0x3ff00000
        pc = 96; continue; // 8412b4: jmp 0x841369
      case 91: // 8412b9
        R.m.w32(((R.esp + 0x40) | 0) >>> 0, 0x0); // 8412b9: mov dword ptr [esp + 0x40], 0
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, 0x4164fb18); // 8412c1: mov dword ptr [esp + 0x44], 0x4164fb18
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, 0x9999999a); // 8412c9: mov dword ptr [esp + 0x10], 0x9999999a
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, 0x3fe99999); // 8412d1: mov dword ptr [esp + 0x14], 0x3fe99999
        pc = 96; continue; // 8412d9: jmp 0x841369
      case 92: // 8412de
        R.m.w32(((R.esp + 0x40) | 0) >>> 0, 0x0); // 8412de: mov dword ptr [esp + 0x40], 0
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, 0x416312d0); // 8412e6: mov dword ptr [esp + 0x44], 0x416312d0
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, 0x0); // 8412ee: mov dword ptr [esp + 0x10], 0
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, 0x3fe80000); // 8412f6: mov dword ptr [esp + 0x14], 0x3fe80000
        pc = 96; continue; // 8412fe: jmp 0x841369
      case 93: // 841300
        R.m.w32(((R.esp + 0x40) | 0) >>> 0, 0x0); // 841300: mov dword ptr [esp + 0x40], 0
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, 0x41612a88); // 841308: mov dword ptr [esp + 0x44], 0x41612a88
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, 0xcccccccd); // 841310: mov dword ptr [esp + 0x10], 0xcccccccd
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, 0x3fe4cccc); // 841318: mov dword ptr [esp + 0x14], 0x3fe4cccc
        pc = 96; continue; // 841320: jmp 0x841369
      case 94: // 841322
        R.m.w32(((R.esp + 0x40) | 0) >>> 0, 0x0); // 841322: mov dword ptr [esp + 0x40], 0
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, 0x415e8480); // 84132a: mov dword ptr [esp + 0x44], 0x415e8480
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, 0x33333333); // 841332: mov dword ptr [esp + 0x10], 0x33333333
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, 0x3fe33333); // 84133a: mov dword ptr [esp + 0x14], 0x3fe33333
        pc = 96; continue; // 841342: jmp 0x841369
      case 95: // 841344
        R.m.w32(((R.esp + 0x40) | 0) >>> 0, 0x0); // 841344: mov dword ptr [esp + 0x40], 0
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, 0x4156e360); // 84134c: mov dword ptr [esp + 0x44], 0x4156e360
        R.m.w8(((R.esp + 0xf) | 0) >>> 0, 0x20); // 841354: mov byte ptr [esp + 0xf], 0x20
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, 0x66666666); // 841359: mov dword ptr [esp + 0x10], 0x66666666
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, 0x3fe26666); // 841361: mov dword ptr [esp + 0x14], 0x3fe26666
        pc = 96; continue;
      case 96: // 841369
        R.eax = (R.m.u32(((R.ebp + 0x14) | 0) >>> 0)) | 0; // 841369: mov eax, dword ptr [ebp + 0x14]
        R.edi = (0x80) | 0; // 84136c: mov edi, 0x80
        R.esi = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 841371: mov esi, dword ptr [eax]
        R.sub((R.esi >>> 0), 0x88b8, 32); // 841373: cmp esi, 0x88b8
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.esi >>> 0)); // 841379: mov dword ptr [esp + 0x18], esi
        if (R.cL) { pc = 100; continue; } // 84137d: jl 0x8413d5
        pc = 97; continue;
      default: return pc;
    }
  }
}
function f_840d80_11(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 97: // 84137f
        R.ebx = (R.m.u32(((R.ebp + 0x10) | 0) >>> 0)) | 0; // 84137f: mov ebx, dword ptr [ebp + 0x10]
        R.eax = ((R.esi >>> 0)) | 0; // 841382: mov eax, esi
        R.edx = R.eax < 0 ? -1 : 0; // 841384: cdq 
        R.ecx = (R.m.u32(((R.ebx + 0xb) | 0) >>> 0)) | 0; // 841385: mov ecx, dword ptr [ebx + 0xb]
        R.edx = (R.logic((R.edx >>> 0) & 0x7, 32)) | 0; // 841388: and edx, 7
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 84138b: add eax, edx
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.ecx >>> 0)); // 84138d: mov dword ptr [esp + 0x30], ecx
        R.eax = (R.sar((R.eax >>> 0), 0x3, 32)) | 0; // 841391: sar eax, 3
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 841394: cmp ecx, eax
        if (R.cL) { pc = 100; continue; } // 841396: jl 0x8413d5
        pc = 98; continue;
      case 98: // 841398
        R.sub(R.m.u16(((R.ebx + 0x1) | 0) >>> 0), ((R.edi >>> 0) & 0xffff), 16); // 841398: cmp word ptr [ebx + 1], di
        if (R.cL) { pc = 100; continue; } // 84139c: jl 0x8413d5
        pc = 99; continue;
      case 99: // 84139e
        R.fpush(R.m.s32(((R.esp + 0x18) | 0) >>> 0)); // 84139e: fild dword ptr [esp + 0x18]
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, 0x1); // 8413a2: mov dword ptr [esp + 0x20], 1
        R.fpush(R.st[0]); // 8413aa: fld st(0)
        R.st[0] = R.st[0] * 5e-05; // 8413ac: fmul qword ptr [0x96d238]
        R.st[0] = R.st[0] - 1.0; // 8413b2: fsub qword ptr [0x967890]
        R.st[0] = R.st[0] * R.st[1]; // 8413b8: fmul st(1)
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 8413ba: fild dword ptr [esp + 0x30]
        R.st[0] = R.st[0] * 0.25; // 8413be: fmul qword ptr [0x9689e0]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 8413c4: faddp st(1)
        R.st[0] = R.st[0] * 0.32; // 8413c6: fmul qword ptr [0x96f918]
        R.ftol(); // 8413cc: call 0x945640
        R.fpop(); // 8413d1: fstp st(0)
        pc = 101; continue; // 8413d3: jmp 0x8413f8
      case 100: // 8413d5
        R.ecx = (R.m.u32(((R.ebp + 0x10) | 0) >>> 0)) | 0; // 8413d5: mov ecx, dword ptr [ebp + 0x10]
        R.fpush(R.m.s32(((R.ecx + 0xb) | 0) >>> 0)); // 8413d8: fild dword ptr [ecx + 0xb]
        R.st[0] = R.st[0] * 0.25; // 8413db: fmul qword ptr [0x9689e0]
        R.fpush(R.m.s32(((R.esp + 0x18) | 0) >>> 0)); // 8413e1: fild dword ptr [esp + 0x18]
        R.st[0] = R.st[0] * 0.75; // 8413e5: fmul qword ptr [0x969040]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 8413eb: faddp st(1)
        R.st[0] = R.st[0] * 0.32; // 8413ed: fmul qword ptr [0x96f918]
        R.ftol(); // 8413f3: call 0x945640
        pc = 101; continue;
      case 101: // 8413f8
        R.ebx = ((R.eax >>> 0)) | 0; // 8413f8: mov ebx, eax
        R.sub((R.ebx >>> 0), 0x1, 32); // 8413fa: cmp ebx, 1
        if (!R.cf) { pc = 103; continue; } // 8413fd: jae 0x841404
        pc = 102; continue;
      case 102: // 8413ff
        R.ebx = (0x1) | 0; // 8413ff: mov ebx, 1
        pc = 103; continue;
      case 103: // 841404
        R.ecx = (R.m.u32(((R.ebp + 0x10) | 0) >>> 0)) | 0; // 841404: mov ecx, dword ptr [ebp + 0x10]
        R.edx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 841407: mov edx, dword ptr [ebp + 0xc]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84140a: mov al, byte ptr [ecx + 0x24]
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.edx + 0x18) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84140d: mov dl, byte ptr [edx + 0x18]
        R.eax = (R.shr((R.eax >>> 0), 0x1, 32)) | 0; // 841410: shr eax, 1
        R.eax = (R.logic((R.eax >>> 0) & 0xf, 32)) | 0; // 841412: and eax, 0xf
        R.m.w8(((R.esp + 0xe) | 0) >>> 0, ((R.edx >>> 0) & 0xff)); // 841415: mov byte ptr [esp + 0xe], dl
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 841419: dec eax
        R.sub((R.eax >>> 0), 0x5, 32); // 84141a: cmp eax, 5
        if (!R.cBE) { pc = 158; continue; } // 84141d: ja 0x84181b
        pc = 104; continue;
      default: return pc;
    }
  }
}
function f_840d80_12(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 104: // 841423
        pc = [107, 107, 130, 105, 106, 156][R.eax >>> 0] ?? -2; continue; // 841423: jmp dword ptr [eax*4 + 0x842018]
      case 105: // 84142a
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.ebx >>> 0)); // 84142a: mov dword ptr [esp + 0x30], ebx
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, 0x0); // 84142e: mov dword ptr [esp + 0x34], 0
        R.fpush(R.i64(((R.esp + 0x30) | 0))); // 841436: fild qword ptr [esp + 0x30]
        R.st[0] = R.st[0] * 0.5; // 84143a: fmul qword ptr [0x968968]
        R.ftol(); // 841440: call 0x945640
        R.ebx = ((R.eax >>> 0)) | 0; // 841445: mov ebx, eax
        pc = 158; continue; // 841447: jmp 0x84181b
      case 106: // 84144c
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.ebx >>> 0)); // 84144c: mov dword ptr [esp + 0x30], ebx
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, 0x0); // 841450: mov dword ptr [esp + 0x34], 0
        R.fpush(R.i64(((R.esp + 0x30) | 0))); // 841458: fild qword ptr [esp + 0x30]
        R.st[0] = R.st[0] * 0.3333333333333333; // 84145c: fmul qword ptr [0x968a80]
        R.ftol(); // 841462: call 0x945640
        R.ebx = ((R.eax >>> 0)) | 0; // 841467: mov ebx, eax
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0xf) | 0) >>> 0)) & 0xff) << 0)) | 0; // 841469: mov al, byte ptr [esp + 0xf]
        R.eax = ((R.eax & 0xffffff00) | (((R.add(((R.eax >>> 0) & 0xff), 0xf7, 8)) & 0xff) << 0)) | 0; // 84146d: add al, 0xf7
        R.m.w8(((R.esp + 0xf) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 84146f: mov byte ptr [esp + 0xf], al
        pc = 158; continue; // 841473: jmp 0x84181b
      case 107: // 841478
        R.sub(((R.edx >>> 0) & 0xff), 0x1b, 8); // 841478: cmp dl, 0x1b
        if (!R.cL) { pc = 158; continue; } // 84147b: jge 0x84181b
        pc = 108; continue;
      case 108: // 841481
        R.sub((R.esi >>> 0), 0x4e20, 32); // 841481: cmp esi, 0x4e20
        if (R.cLE) { pc = 158; continue; } // 841487: jle 0x84181b
        pc = 109; continue;
      default: return pc;
    }
  }
}
function f_840d80_13(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 109: // 84148d
        R.eax = ((R.esi >>> 0)) | 0; // 84148d: mov eax, esi
        R.edi = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 84148f: mov edi, dword ptr [ebp + 8]
        R.edx = R.eax < 0 ? -1 : 0; // 841492: cdq 
        R.ecx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 841493: mov ecx, dword ptr [ebp + 0xc]
        R.edx = (R.logic((R.edx >>> 0) & 0x3, 32)) | 0; // 841496: and edx, 3
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 841499: add eax, edx
        R.edx = (R.m.u32(((R.edi + 0xcf) | 0) >>> 0)) | 0; // 84149b: mov edx, dword ptr [edi + 0xcf]
        R.eax = (R.sar((R.eax >>> 0), 0x2, 32)) | 0; // 8414a1: sar eax, 2
        R.push((R.eax >>> 0)); // 8414a4: push eax
        R.push(0x1); // 8414a5: push 1
        R.push((R.edi >>> 0)); // 8414a7: push edi
        R.push((R.ecx >>> 0)); // 8414a8: push ecx
        R.push((R.edx >>> 0)); // 8414a9: push edx
        R.call(0x6e86d0, { n: 5, thisEcx: true, calleeClean: false }); // 8414aa: call 0x6e86d0
        R.esi = (R.m.u32(((R.ebp + 0x14) | 0) >>> 0)) | 0; // 8414af: mov esi, dword ptr [ebp + 0x14]
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8414b2: add esp, 0x14
        R.eax = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8414b5: movsx eax, ax
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.eax >>> 0)); // 8414b8: mov dword ptr [esp + 0x30], eax
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 8414bc: fild dword ptr [esp + 0x30]
        R.fpush(R.m.s32(((R.esi) | 0) >>> 0)); // 8414c0: fild dword ptr [esi]
        R.m.wf64(((R.esp + 0x18) | 0) >>> 0, R.st[0]); R.fpop(); // 8414c2: fstp qword ptr [esp + 0x18]
        R.st[0] = R.st[0] * 220.0; // 8414c6: fmul qword ptr [0x968f48]
        R.st[0] = R.st[0] / R.f64(((R.esp + 0x18) | 0)); // 8414cc: fdiv qword ptr [esp + 0x18]
        R.fpush(R.f64(((R.esp + 0x10) | 0))); // 8414d0: fld qword ptr [esp + 0x10]
        R.st[0] = R.st[0] + 0.6; // 8414d4: fadd qword ptr [0x968e48]
        R.m.wf64(((R.esp + 0x30) | 0) >>> 0, R.st[0]); R.fpop(); // 8414da: fstp qword ptr [esp + 0x30]
        R.fcom(R.st[0], R.f64(((R.esp + 0x30) | 0))); // 8414de: fcom qword ptr [esp + 0x30]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8414e2: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8414e4: test ah, 1
        if (!R.zf) { pc = 111; continue; } // 8414e7: jne 0x8414ef
        pc = 110; continue;
      case 110: // 8414e9
        R.fpop(); // 8414e9: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x30) | 0))); // 8414eb: fld qword ptr [esp + 0x30]
        pc = 111; continue;
      case 111: // 8414ef
        R.eax = (((R.m.u8(((R.esp + 0xe) | 0) >>> 0)) << 24 >> 24)) | 0; // 8414ef: movsx eax, byte ptr [esp + 0xe]
        R.eax = (R.sub((R.eax >>> 0), 0x18, 32)) | 0; // 8414f4: sub eax, 0x18
        if (R.zf) { pc = 116; continue; } // 8414f7: je 0x84151b
        pc = 112; continue;
      case 112: // 8414f9
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 8414f9: dec eax
        if (R.zf) { pc = 115; continue; } // 8414fa: je 0x84150d
        pc = 113; continue;
      case 113: // 8414fc
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 8414fc: dec eax
        if (!R.zf) { pc = 117; continue; } // 8414fd: jne 0x841527
        pc = 114; continue;
      case 114: // 8414ff
        R.st[0] = R.st[0] * 0.3; // 8414ff: fmul qword ptr [0x968e80]
        R.st[0] = R.st[0] + 0.7; // 841505: fadd qword ptr [0x968e40]
        pc = 117; continue; // 84150b: jmp 0x841527
      case 115: // 84150d
        R.st[0] = R.st[0] + 1.0; // 84150d: fadd qword ptr [0x967890]
        R.st[0] = R.st[0] * 0.5; // 841513: fmul qword ptr [0x968968]
        pc = 117; continue; // 841519: jmp 0x841527
      default: return pc;
    }
  }
}
function f_840d80_14(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 116: // 84151b
        R.st[0] = R.st[0] * 0.7; // 84151b: fmul qword ptr [0x968e40]
        R.st[0] = R.st[0] + 0.3; // 841521: fadd qword ptr [0x968e80]
        pc = 117; continue;
      case 117: // 841527
        R.fpush(R.m.s32(((R.ebp + 0x18) | 0) >>> 0)); // 841527: fild dword ptr [ebp + 0x18]
        R.st[0] = R.st[0] * 1.05; // 84152a: fmul qword ptr [0x9689b8]
        R.fcom(R.st[0], R.f64(((R.esp + 0x18) | 0))); R.fpop(); // 841530: fcomp qword ptr [esp + 0x18]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 841534: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 841536: test ah, 1
        if (!R.zf) { pc = 119; continue; } // 841539: jne 0x841547
        pc = 118; continue;
      case 118: // 84153b
        R.eax = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 84153b: mov eax, dword ptr [esp + 0x20]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84153f: test eax, eax
        if (R.zf) { pc = 128; continue; } // 841541: je 0x8415c8
        pc = 119; continue;
      case 119: // 841547
        R.fcom(R.st[0], 1.0); // 841547: fcom qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84154d: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 84154f: test ah, 0x41
        if (!R.zf) { pc = 157; continue; } // 841552: jne 0x841819
        pc = 120; continue;
      case 120: // 841558
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.edi + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 841558: mov ax, word ptr [edi + 0x80]
        R.sub(((R.eax >>> 0) & 0xffff), 0x3e8, 16); // 84155f: cmp ax, 0x3e8
        if (!R.cL) { pc = 122; continue; } // 841563: jge 0x84156f
        pc = 121; continue;
      case 121: // 841565
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, 0x3e8); // 841565: mov dword ptr [esp + 0x30], 0x3e8
        pc = 123; continue; // 84156d: jmp 0x841576
      case 122: // 84156f
        R.ecx = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 84156f: movsx ecx, ax
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.ecx >>> 0)); // 841572: mov dword ptr [esp + 0x30], ecx
        pc = 123; continue;
      case 123: // 841576
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 841576: mov eax, dword ptr [edi]
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 841578: lea edx, [eax + eax*8]
        R.eax = (R.m.u32(((R.esp + 0x28) | 0) >>> 0)) | 0; // 84157b: mov eax, dword ptr [esp + 0x28]
        R.ecx = (R.m.u32(((R.eax + 0xdc) | 0) >>> 0)) | 0; // 84157f: mov ecx, dword ptr [eax + 0xdc]
        R.edx = (((R.m.u16(((R.edx + R.ecx + 0x5) | 0) >>> 0)) << 16 >> 16)) | 0; // 841585: movsx edx, word ptr [edx + ecx + 5]
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.edx >>> 0)); // 84158a: mov dword ptr [esp + 0x28], edx
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 84158e: fild dword ptr [esp + 0x28]
        R.st[0] = R.st[0] / R.m.s32(((R.esp + 0x30) | 0) >>> 0); // 841592: fidiv dword ptr [esp + 0x30]
        R.fpush(1.0); // 841596: fld qword ptr [0x967890]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 84159c: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84159e: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 8415a0: test ah, 0x41
        if (!R.zf) { pc = 125; continue; } // 8415a3: jne 0x8415af
        pc = 124; continue;
      case 124: // 8415a5
        R.fpop(); // 8415a5: fstp st(0)
        R.fpush(1.0); // 8415a7: fld qword ptr [0x967890]
        pc = 127; continue; // 8415ad: jmp 0x8415c6
      default: return pc;
    }
  }
}
function f_840d80_15(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 125: // 8415af
        R.fpush(1.2); // 8415af: fld qword ptr [0x968978]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 8415b5: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8415b7: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8415b9: test ah, 1
        if (R.zf) { pc = 127; continue; } // 8415bc: je 0x8415c6
        pc = 126; continue;
      case 126: // 8415be
        R.fpop(); // 8415be: fstp st(0)
        R.fpush(1.2); // 8415c0: fld qword ptr [0x968978]
        pc = 127; continue;
      case 127: // 8415c6
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 8415c6: fmulp st(1)
        pc = 128; continue;
      case 128: // 8415c8
        R.fcom(R.st[0], 1.0); // 8415c8: fcom qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8415ce: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 8415d0: test ah, 0x41
        if (!R.zf) { pc = 157; continue; } // 8415d3: jne 0x841819
        pc = 129; continue;
      case 129: // 8415d9
        R.fpush(R.st[0]); // 8415d9: fld st(0)
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x10) | 0)); // 8415db: fmul qword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.ebx >>> 0)); // 8415df: mov dword ptr [esp + 0x30], ebx
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, 0x0); // 8415e3: mov dword ptr [esp + 0x34], 0
        R.m.wf64(((R.esp + 0x10) | 0) >>> 0, R.st[0]); R.fpop(); // 8415eb: fstp qword ptr [esp + 0x10]
        R.st[0] = R.st[0] + 1.0; // 8415ef: fadd qword ptr [0x967890]
        R.st[0] = R.st[0] * 0.5; // 8415f5: fmul qword ptr [0x968968]
        R.fpush(R.i64(((R.esp + 0x30) | 0))); // 8415fb: fild qword ptr [esp + 0x30]
        R.st[0] = R.st[0] * R.st[1]; // 8415ff: fmul st(1)
        R.ftol(); // 841601: call 0x945640
        R.fpush(R.f64(((R.esp + 0x18) | 0))); // 841606: fld qword ptr [esp + 0x18]
        R.st[0] = R.st[0] * R.st[1]; // 84160a: fmul st(1)
        R.ebx = ((R.eax >>> 0)) | 0; // 84160c: mov ebx, eax
        R.ftol(); // 84160e: call 0x945640
        R.fpop(); // 841613: fstp st(0)
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 841615: mov dword ptr [esi], eax
        pc = 158; continue; // 841617: jmp 0x84181b
      case 130: // 84161c
        R.sub(R.m.u16(((R.ecx + 0x1) | 0) >>> 0), ((R.edi >>> 0) & 0xffff), 16); // 84161c: cmp word ptr [ecx + 1], di
        if (!R.cL) { pc = 132; continue; } // 841620: jge 0x84163a
        pc = 131; continue;
      case 131: // 841622
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.ebx >>> 0)); // 841622: mov dword ptr [esp + 0x30], ebx
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, 0x0); // 841626: mov dword ptr [esp + 0x34], 0
        R.fpush(R.i64(((R.esp + 0x30) | 0))); // 84162e: fild qword ptr [esp + 0x30]
        R.st[0] = R.st[0] * 0.6666666666666666; // 841632: fmul qword ptr [0x96a670]
        pc = 133; continue; // 841638: jmp 0x841650
      case 132: // 84163a
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.ebx >>> 0)); // 84163a: mov dword ptr [esp + 0x30], ebx
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, 0x0); // 84163e: mov dword ptr [esp + 0x34], 0
        R.fpush(R.i64(((R.esp + 0x30) | 0))); // 841646: fild qword ptr [esp + 0x30]
        R.st[0] = R.st[0] * 0.9090909090909091; // 84164a: fmul qword ptr [0x96d718]
        pc = 133; continue;
      default: return pc;
    }
  }
}
function f_840d80_16(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 133: // 841650
        R.ftol(); // 841650: call 0x945640
        R.ebx = ((R.eax >>> 0)) | 0; // 841655: mov ebx, eax
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0xe) | 0) >>> 0)) & 0xff) << 0)) | 0; // 841657: mov al, byte ptr [esp + 0xe]
        R.sub(((R.eax >>> 0) & 0xff), 0x1b, 8); // 84165b: cmp al, 0x1b
        if (!R.cL) { pc = 158; continue; } // 84165d: jge 0x84181b
        pc = 134; continue;
      case 134: // 841663
        R.sub((R.esi >>> 0), 0x4e20, 32); // 841663: cmp esi, 0x4e20
        if (R.cLE) { pc = 158; continue; } // 841669: jle 0x84181b
        pc = 135; continue;
      case 135: // 84166f
        R.eax = ((R.esi >>> 0)) | 0; // 84166f: mov eax, esi
        R.edi = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 841671: mov edi, dword ptr [ebp + 8]
        R.edx = R.eax < 0 ? -1 : 0; // 841674: cdq 
        R.edx = (R.logic((R.edx >>> 0) & 0x3, 32)) | 0; // 841675: and edx, 3
        R.ecx = (R.m.u32(((R.edi + 0xcf) | 0) >>> 0)) | 0; // 841678: mov ecx, dword ptr [edi + 0xcf]
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 84167e: add eax, edx
        R.eax = (R.sar((R.eax >>> 0), 0x2, 32)) | 0; // 841680: sar eax, 2
        R.push((R.eax >>> 0)); // 841683: push eax
        R.eax = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 841684: mov eax, dword ptr [ebp + 0xc]
        R.push(0x1); // 841687: push 1
        R.push((R.edi >>> 0)); // 841689: push edi
        R.push((R.eax >>> 0)); // 84168a: push eax
        R.push((R.ecx >>> 0)); // 84168b: push ecx
        R.call(0x6e86d0, { n: 5, thisEcx: true, calleeClean: false }); // 84168c: call 0x6e86d0
        R.edx = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 841691: movsx edx, ax
        R.eax = (R.m.u32(((R.ebp + 0x14) | 0) >>> 0)) | 0; // 841694: mov eax, dword ptr [ebp + 0x14]
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.edx >>> 0)); // 841697: mov dword ptr [esp + 0x44], edx
        R.fpush(R.m.s32(((R.esp + 0x44) | 0) >>> 0)); // 84169b: fild dword ptr [esp + 0x44]
        R.fpush(R.m.s32(((R.eax) | 0) >>> 0)); // 84169f: fild dword ptr [eax]
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8416a1: add esp, 0x14
        R.m.wf64(((R.esp + 0x18) | 0) >>> 0, R.st[0]); R.fpop(); // 8416a4: fstp qword ptr [esp + 0x18]
        R.st[0] = R.st[0] * 220.0; // 8416a8: fmul qword ptr [0x968f48]
        R.st[0] = R.st[0] / R.f64(((R.esp + 0x18) | 0)); // 8416ae: fdiv qword ptr [esp + 0x18]
        R.fpush(R.f64(((R.esp + 0x10) | 0))); // 8416b2: fld qword ptr [esp + 0x10]
        R.st[0] = R.st[0] + 0.6; // 8416b6: fadd qword ptr [0x968e48]
        R.m.wf64(((R.esp + 0x30) | 0) >>> 0, R.st[0]); R.fpop(); // 8416bc: fstp qword ptr [esp + 0x30]
        R.fcom(R.st[0], R.f64(((R.esp + 0x30) | 0))); // 8416c0: fcom qword ptr [esp + 0x30]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8416c4: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8416c6: test ah, 1
        if (!R.zf) { pc = 137; continue; } // 8416c9: jne 0x8416d1
        pc = 136; continue;
      case 136: // 8416cb
        R.fpop(); // 8416cb: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x30) | 0))); // 8416cd: fld qword ptr [esp + 0x30]
        pc = 137; continue;
      case 137: // 8416d1
        R.eax = (((R.m.u8(((R.esp + 0xe) | 0) >>> 0)) << 24 >> 24)) | 0; // 8416d1: movsx eax, byte ptr [esp + 0xe]
        R.eax = (R.sub((R.eax >>> 0), 0x18, 32)) | 0; // 8416d6: sub eax, 0x18
        if (R.zf) { pc = 142; continue; } // 8416d9: je 0x8416fd
        pc = 138; continue;
      case 138: // 8416db
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 8416db: dec eax
        if (R.zf) { pc = 141; continue; } // 8416dc: je 0x8416ef
        pc = 139; continue;
      case 139: // 8416de
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 8416de: dec eax
        if (!R.zf) { pc = 143; continue; } // 8416df: jne 0x841709
        pc = 140; continue;
      default: return pc;
    }
  }
}
function f_840d80_17(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 140: // 8416e1
        R.st[0] = R.st[0] * 0.3; // 8416e1: fmul qword ptr [0x968e80]
        R.st[0] = R.st[0] + 0.7; // 8416e7: fadd qword ptr [0x968e40]
        pc = 143; continue; // 8416ed: jmp 0x841709
      case 141: // 8416ef
        R.st[0] = R.st[0] + 1.0; // 8416ef: fadd qword ptr [0x967890]
        R.st[0] = R.st[0] * 0.5; // 8416f5: fmul qword ptr [0x968968]
        pc = 143; continue; // 8416fb: jmp 0x841709
      case 142: // 8416fd
        R.st[0] = R.st[0] * 0.7; // 8416fd: fmul qword ptr [0x968e40]
        R.st[0] = R.st[0] + 0.3; // 841703: fadd qword ptr [0x968e80]
        pc = 143; continue;
      case 143: // 841709
        R.fpush(R.m.s32(((R.ebp + 0x18) | 0) >>> 0)); // 841709: fild dword ptr [ebp + 0x18]
        R.st[0] = R.st[0] * 1.05; // 84170c: fmul qword ptr [0x9689b8]
        R.fcom(R.st[0], R.f64(((R.esp + 0x18) | 0))); R.fpop(); // 841712: fcomp qword ptr [esp + 0x18]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 841716: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 841718: test ah, 1
        if (!R.zf) { pc = 145; continue; } // 84171b: jne 0x841729
        pc = 144; continue;
      case 144: // 84171d
        R.eax = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 84171d: mov eax, dword ptr [esp + 0x20]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 841721: test eax, eax
        if (R.zf) { pc = 154; continue; } // 841723: je 0x8417aa
        pc = 145; continue;
      case 145: // 841729
        R.fcom(R.st[0], 1.0); // 841729: fcom qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84172f: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 841731: test ah, 0x41
        if (!R.zf) { pc = 157; continue; } // 841734: jne 0x841819
        pc = 146; continue;
      case 146: // 84173a
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.edi + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 84173a: mov ax, word ptr [edi + 0x80]
        R.sub(((R.eax >>> 0) & 0xffff), 0x3e8, 16); // 841741: cmp ax, 0x3e8
        if (!R.cL) { pc = 148; continue; } // 841745: jge 0x841751
        pc = 147; continue;
      case 147: // 841747
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, 0x3e8); // 841747: mov dword ptr [esp + 0x30], 0x3e8
        pc = 149; continue; // 84174f: jmp 0x841758
      case 148: // 841751
        R.ecx = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 841751: movsx ecx, ax
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.ecx >>> 0)); // 841754: mov dword ptr [esp + 0x30], ecx
        pc = 149; continue;
      case 149: // 841758
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 841758: mov eax, dword ptr [edi]
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 84175a: lea edx, [eax + eax*8]
        R.eax = (R.m.u32(((R.esp + 0x28) | 0) >>> 0)) | 0; // 84175d: mov eax, dword ptr [esp + 0x28]
        R.ecx = (R.m.u32(((R.eax + 0xdc) | 0) >>> 0)) | 0; // 841761: mov ecx, dword ptr [eax + 0xdc]
        R.edx = (((R.m.u16(((R.edx + R.ecx + 0x5) | 0) >>> 0)) << 16 >> 16)) | 0; // 841767: movsx edx, word ptr [edx + ecx + 5]
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.edx >>> 0)); // 84176c: mov dword ptr [esp + 0x28], edx
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 841770: fild dword ptr [esp + 0x28]
        R.st[0] = R.st[0] / R.m.s32(((R.esp + 0x30) | 0) >>> 0); // 841774: fidiv dword ptr [esp + 0x30]
        R.fpush(1.0); // 841778: fld qword ptr [0x967890]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 84177e: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 841780: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 841782: test ah, 0x41
        if (!R.zf) { pc = 151; continue; } // 841785: jne 0x841791
        pc = 150; continue;
      default: return pc;
    }
  }
}
function f_840d80_18(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 150: // 841787
        R.fpop(); // 841787: fstp st(0)
        R.fpush(1.0); // 841789: fld qword ptr [0x967890]
        pc = 153; continue; // 84178f: jmp 0x8417a8
      case 151: // 841791
        R.fpush(1.2); // 841791: fld qword ptr [0x968978]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 841797: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 841799: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 84179b: test ah, 1
        if (R.zf) { pc = 153; continue; } // 84179e: je 0x8417a8
        pc = 152; continue;
      case 152: // 8417a0
        R.fpop(); // 8417a0: fstp st(0)
        R.fpush(1.2); // 8417a2: fld qword ptr [0x968978]
        pc = 153; continue;
      case 153: // 8417a8
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 8417a8: fmulp st(1)
        pc = 154; continue;
      case 154: // 8417aa
        R.fcom(R.st[0], 1.0); // 8417aa: fcom qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8417b0: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 8417b2: test ah, 0x41
        if (!R.zf) { pc = 157; continue; } // 8417b5: jne 0x841819
        pc = 155; continue;
      case 155: // 8417b7
        R.fpush(R.st[0]); // 8417b7: fld st(0)
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x10) | 0)); // 8417b9: fmul qword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.ebx >>> 0)); // 8417bd: mov dword ptr [esp + 0x30], ebx
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, 0x0); // 8417c1: mov dword ptr [esp + 0x34], 0
        R.m.wf64(((R.esp + 0x10) | 0) >>> 0, R.st[0]); R.fpop(); // 8417c9: fstp qword ptr [esp + 0x10]
        R.st[0] = R.st[0] + 1.0; // 8417cd: fadd qword ptr [0x967890]
        R.st[0] = R.st[0] * 0.5; // 8417d3: fmul qword ptr [0x968968]
        R.fpush(R.i64(((R.esp + 0x30) | 0))); // 8417d9: fild qword ptr [esp + 0x30]
        R.st[0] = R.st[0] * R.st[1]; // 8417dd: fmul st(1)
        R.ftol(); // 8417df: call 0x945640
        R.fpush(R.f64(((R.esp + 0x18) | 0))); // 8417e4: fld qword ptr [esp + 0x18]
        R.st[0] = R.st[0] * R.st[1]; // 8417e8: fmul st(1)
        R.ebx = ((R.eax >>> 0)) | 0; // 8417ea: mov ebx, eax
        R.ftol(); // 8417ec: call 0x945640
        R.ecx = (R.m.u32(((R.ebp + 0x14) | 0) >>> 0)) | 0; // 8417f1: mov ecx, dword ptr [ebp + 0x14]
        R.fpop(); // 8417f4: fstp st(0)
        R.m.w32(((R.ecx) | 0) >>> 0, (R.eax >>> 0)); // 8417f6: mov dword ptr [ecx], eax
        pc = 159; continue; // 8417f8: jmp 0x84181e
      case 156: // 8417fa
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.ebx >>> 0)); // 8417fa: mov dword ptr [esp + 0x30], ebx
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, 0x0); // 8417fe: mov dword ptr [esp + 0x34], 0
        R.fpush(R.i64(((R.esp + 0x30) | 0))); // 841806: fild qword ptr [esp + 0x30]
        R.st[0] = R.st[0] * 0.2; // 84180a: fmul qword ptr [0x968918]
        R.ftol(); // 841810: call 0x945640
        R.ebx = ((R.eax >>> 0)) | 0; // 841815: mov ebx, eax
        pc = 158; continue; // 841817: jmp 0x84181b
      case 157: // 841819
        R.fpop(); // 841819: fstp st(0)
        pc = 158; continue;
      case 158: // 84181b
        R.edi = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 84181b: mov edi, dword ptr [ebp + 8]
        pc = 159; continue;
      default: return pc;
    }
  }
}
function f_840d80_19(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 159: // 84181e
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esp + 0xe) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84181e: mov cl, byte ptr [esp + 0xe]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0xf) | 0) >>> 0)) & 0xff) << 0)) | 0; // 841822: mov al, byte ptr [esp + 0xf]
        R.sub(((R.ecx >>> 0) & 0xff), ((R.eax >>> 0) & 0xff), 8); // 841826: cmp cl, al
        if (R.cLE) { pc = 173; continue; } // 841828: jle 0x84196c
        pc = 160; continue;
      case 160: // 84182e
        R.esi = (((((R.ecx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 84182e: movsx esi, cl
        R.edi = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 841831: movsx edi, al
        R.eax = ((R.esi >>> 0)) | 0; // 841834: mov eax, esi
        R.edx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 841836: mov edx, dword ptr [ebp + 0xc]
        R.eax = (R.sub((R.eax >>> 0), (R.edi >>> 0), 32)) | 0; // 841839: sub eax, edi
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0x0); // 84183b: mov dword ptr [esp + 0x28], 0
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.eax >>> 0)); // 841843: mov dword ptr [esp + 0x30], eax
        R.eax = (R.m.u32(((R.edx + 0x61) | 0) >>> 0)) | 0; // 841847: mov eax, dword ptr [edx + 0x61]
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 84184a: fild dword ptr [esp + 0x30]
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.eax + 0xd) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 84184e: mov ax, word ptr [eax + 0xd]
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, 0x0); // 841852: mov dword ptr [esp + 0x2c], 0
        R.sub(((R.eax >>> 0) & 0xffff), 0x1770, 16); // 84185a: cmp ax, 0x1770
        R.m.wf64(((R.esp + 0x18) | 0) >>> 0, R.st[0]); // 84185e: fst qword ptr [esp + 0x18]
        R.st[0] = R.st[0] * 0.3; // 841862: fmul qword ptr [0x968e80]
        R.st[0] = R.st[0] + 0.8; // 841868: fadd qword ptr [0x9689b0]
        R.st[0] = 1.0 / R.st[0]; // 84186e: fdivr qword ptr [0x967890]
        R.m.wf64(((R.esp + 0x20) | 0) >>> 0, R.st[0]); R.fpop(); // 841874: fstp qword ptr [esp + 0x20]
        if (R.cLE) { pc = 162; continue; } // 841878: jle 0x841895
        pc = 161; continue;
      case 161: // 84187a
        R.ecx = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 84187a: movsx ecx, ax
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.ecx >>> 0)); // 84187d: mov dword ptr [esp + 0x28], ecx
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 841881: fild dword ptr [esp + 0x28]
        R.st[0] = R.st[0] * 0.00025; // 841885: fmul qword ptr [0x96a680]
        R.st[0] = R.st[0] - 1.5; // 84188b: fsub qword ptr [0x968940]
        R.m.wf64(((R.esp + 0x28) | 0) >>> 0, R.st[0]); R.fpop(); // 841891: fstp qword ptr [esp + 0x28]
        pc = 162; continue;
      case 162: // 841895
        R.edx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 841895: mov edx, dword ptr [ebp + 8]
        R.ecx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 841898: mov ecx, dword ptr [ebp + 0xc]
        R.push(0x1); // 84189b: push 1
        R.eax = (R.m.u32(((R.edx + 0x53) | 0) >>> 0)) | 0; // 84189d: mov eax, dword ptr [edx + 0x53]
        R.push((R.eax >>> 0)); // 8418a0: push eax
        R.push((R.ecx >>> 0)); // 8418a1: push ecx
        R.call(0x53d980, { n: 3, thisEcx: false, calleeClean: false }); // 8418a2: call 0x53d980
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 8418a7: add esp, 0xc
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8418aa: test eax, eax
        if (R.zf) { pc = 164; continue; } // 8418ac: je 0x8418c4
        pc = 163; continue;
      case 163: // 8418ae
        R.fpush(R.f64(((R.esp + 0x18) | 0))); // 8418ae: fld qword ptr [esp + 0x18]
        R.st[0] = R.st[0] * 0.15; // 8418b2: fmul qword ptr [0x968f20]
        R.st[0] = R.st[0] + 0.9; // 8418b8: fadd qword ptr [0x9689d8]
        R.st[0] = R.f64(((R.esp + 0x20) | 0)) / R.st[0]; // 8418be: fdivr qword ptr [esp + 0x20]
        pc = 170; continue; // 8418c2: jmp 0x841916
      case 164: // 8418c4
        R.edi = (R.add((R.edi >>> 0), 0x2, 32)) | 0; // 8418c4: add edi, 2
        R.sub((R.esi >>> 0), (R.edi >>> 0), 32); // 8418c7: cmp esi, edi
        if (R.cLE) { pc = 169; continue; } // 8418c9: jle 0x841912
        pc = 165; continue;
      default: return pc;
    }
  }
}
function f_840d80_20(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 165: // 8418cb
        R.edx = (R.m.u32(((R.ebp + 0x10) | 0) >>> 0)) | 0; // 8418cb: mov edx, dword ptr [ebp + 0x10]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edx + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8418ce: mov al, byte ptr [edx + 0x24]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x1e, 8)) & 0xff) << 0)) | 0; // 8418d1: and al, 0x1e
        R.sub(((R.eax >>> 0) & 0xff), 0x8, 8); // 8418d3: cmp al, 8
        if (R.zf) { pc = 167; continue; } // 8418d5: je 0x8418db
        pc = 166; continue;
      case 166: // 8418d7
        R.sub(((R.eax >>> 0) & 0xff), 0x6, 8); // 8418d7: cmp al, 6
        if (!R.zf) { pc = 169; continue; } // 8418d9: jne 0x841912
        pc = 167; continue;
      case 167: // 8418db
        R.eax = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 8418db: mov eax, dword ptr [ebp + 0xc]
        R.ecx = (R.m.u32(((R.eax + 0x61) | 0) >>> 0)) | 0; // 8418de: mov ecx, dword ptr [eax + 0x61]
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 8418e1: mov eax, dword ptr [ebp + 8]
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.ecx + 0xb) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8418e4: mov dx, word ptr [ecx + 0xb]
        R.sub(((R.edx >>> 0) & 0xffff), R.m.u16(((R.eax + 0x80) | 0) >>> 0), 16); // 8418e8: cmp dx, word ptr [eax + 0x80]
        if (!R.cL) { pc = 169; continue; } // 8418ef: jge 0x841912
        pc = 168; continue;
      case 168: // 8418f1
        R.ecx = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 8418f1: mov ecx, dword ptr [esp + 0x30]
        R.ecx = (R.add((R.ecx >>> 0), 0xfffffffe, 32)) | 0; // 8418f5: add ecx, -2
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.ecx >>> 0)); // 8418f8: mov dword ptr [esp + 0x30], ecx
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 8418fc: fild dword ptr [esp + 0x30]
        R.st[0] = R.st[0] * 0.06666666666666667; // 841900: fmul qword ptr [0x96d438]
        R.st[0] = 1.0 - R.st[0]; // 841906: fsubr qword ptr [0x967890]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x20) | 0)); // 84190c: fmul qword ptr [esp + 0x20]
        pc = 170; continue; // 841910: jmp 0x841916
      case 169: // 841912
        R.fpush(R.f64(((R.esp + 0x20) | 0))); // 841912: fld qword ptr [esp + 0x20]
        pc = 170; continue;
      case 170: // 841916
        R.edx = (R.m.u32(((R.ebp + 0x10) | 0) >>> 0)) | 0; // 841916: mov edx, dword ptr [ebp + 0x10]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edx + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 841919: mov al, byte ptr [edx + 0x24]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x1e, 8)) & 0xff) << 0)) | 0; // 84191c: and al, 0x1e
        R.sub(((R.eax >>> 0) & 0xff), 0xa, 8); // 84191e: cmp al, 0xa
        if (!R.zf) { pc = 172; continue; } // 841920: jne 0x84193e
        pc = 171; continue;
      case 171: // 841922
        R.fpush(1.0); // 841922: fld qword ptr [0x967890]
        R.st[0] = R.st[0] - R.f64(((R.esp + 0x28) | 0)); // 841928: fsub qword ptr [esp + 0x28]
        R.esi = (R.m.u32(((R.ebp + 0x14) | 0) >>> 0)) | 0; // 84192c: mov esi, dword ptr [ebp + 0x14]
        R.st[0] = R.st[0] * R.st[1]; // 84192f: fmul st(1)
        R.st[0] = R.st[0] + R.f64(((R.esp + 0x28) | 0)); // 841931: fadd qword ptr [esp + 0x28]
        R.st[0] = R.st[0] * R.m.s32(((R.esi) | 0) >>> 0); // 841935: fimul dword ptr [esi]
        R.ftol(); // 841937: call 0x945640
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 84193c: mov dword ptr [esi], eax
        pc = 172; continue;
      default: return pc;
    }
  }
}
function f_840d80_21(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 172: // 84193e
        R.fpush(1.0); // 84193e: fld qword ptr [0x967890]
        R.st[0] = R.st[0] - R.f64(((R.esp + 0x28) | 0)); // 841944: fsub qword ptr [esp + 0x28]
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.ebx >>> 0)); // 841948: mov dword ptr [esp + 0x30], ebx
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, 0x0); // 84194c: mov dword ptr [esp + 0x34], 0
        R.st[0] = R.st[0] * R.st[1]; // 841954: fmul st(1)
        R.st[0] = R.st[0] + R.f64(((R.esp + 0x28) | 0)); // 841956: fadd qword ptr [esp + 0x28]
        R.fpush(R.i64(((R.esp + 0x30) | 0))); // 84195a: fild qword ptr [esp + 0x30]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 84195e: fmulp st(1)
        R.ftol(); // 841960: call 0x945640
        R.edi = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 841965: mov edi, dword ptr [ebp + 8]
        R.ebx = ((R.eax >>> 0)) | 0; // 841968: mov ebx, eax
        R.fpop(); // 84196a: fstp st(0)
        pc = 173; continue;
      case 173: // 84196c
        R.ecx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 84196c: mov ecx, dword ptr [ebp + 0xc]
        R.esi = (R.m.u32(((R.ecx + 0x61) | 0) >>> 0)) | 0; // 84196f: mov esi, dword ptr [ecx + 0x61]
        R.edx = (((R.m.u8(((R.esi + 0x2d) | 0) >>> 0)) << 24 >> 24)) | 0; // 841972: movsx edx, byte ptr [esi + 0x2d]
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.edx >>> 0)); // 841976: mov dword ptr [esp + 0x30], edx
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 84197a: fild dword ptr [esp + 0x30]
        R.fpush(2.0); // 84197e: fld qword ptr [0x968950]
        R.call(0x945ff0, { n: 0, thisEcx: false, calleeClean: false, float: true }); // 841984: call 0x945ff0
        R.st[0] = R.st[0] * 0.00016666666666666666; // 841989: fmul qword ptr [0x968f40]
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.ebx >>> 0)); // 84198f: mov dword ptr [esp + 0x30], ebx
        R.ebx = (R.logic((R.ebx >>> 0) ^ (R.ebx >>> 0), 32)) | 0; // 841993: xor ebx, ebx
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.ebx >>> 0)); // 841995: mov dword ptr [esp + 0x34], ebx
        R.st[0] = 1.0 - R.st[0]; // 841999: fsubr qword ptr [0x967890]
        R.fpush(R.i64(((R.esp + 0x30) | 0))); // 84199f: fild qword ptr [esp + 0x30]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 8419a3: fmulp st(1)
        R.ftol(); // 8419a5: call 0x945640
        R.ecx = ((R.eax >>> 0)) | 0; // 8419aa: mov ecx, eax
        R.edx = (R.m.u32(((R.ebp + 0x10) | 0) >>> 0)) | 0; // 8419ac: mov edx, dword ptr [ebp + 0x10]
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 8419af: imul ecx, eax
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.ecx >>> 0)); // 8419b2: mov dword ptr [esp + 0x30], ecx
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.ebx >>> 0)); // 8419b6: mov dword ptr [esp + 0x34], ebx
        R.fpush(R.i64(((R.esp + 0x30) | 0))); // 8419ba: fild qword ptr [esp + 0x30]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edx + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8419be: mov al, byte ptr [edx + 0x24]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x1e, 8)) & 0xff) << 0)) | 0; // 8419c1: and al, 0x1e
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x40) | 0)); // 8419c3: fmul qword ptr [esp + 0x40]
        R.sub(((R.eax >>> 0) & 0xff), 0xc, 8); // 8419c7: cmp al, 0xc
        R.st[0] = R.st[0] * 1e-08; // 8419c9: fmul qword ptr [0x968eb8]
        R.m.wf64(((R.esp + 0x40) | 0) >>> 0, R.st[0]); // 8419cf: fst qword ptr [esp + 0x40]
        if (!R.zf) { pc = 179; continue; } // 8419d3: jne 0x841a5e
        pc = 174; continue;
      case 174: // 8419d9
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.edi + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8419d9: mov ax, word ptr [edi + 0x80]
        R.sub(((R.eax >>> 0) & 0xffff), 0x1388, 16); // 8419e0: cmp ax, 0x1388
        if (R.cLE) { pc = 177; continue; } // 8419e4: jle 0x841a2d
        pc = 175; continue;
      default: return pc;
    }
  }
}
function f_840d80_22(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 175: // 8419e6
        R.ecx = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8419e6: movsx ecx, ax
        R.eax = (((R.ecx + -0x1388) | 0)) | 0; // 8419e9: lea eax, [ecx - 0x1388]
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.eax >>> 0)); // 8419ef: mov dword ptr [esp + 0x30], eax
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 8419f3: fild dword ptr [esp + 0x30]
        R.st[0] = R.st[0] * 20.0; // 8419f7: fmul qword ptr [0x968ea8]
        R.st[0] = R.st[0] + 50000.0; // 8419fd: fadd qword ptr [0x968880]
        R.fpush(R.st[1]); // 841a03: fld st(1)
        R.fcom(R.st[0], R.st[1]); R.fpop(); R.fpop(); // 841a05: fcompp 
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 841a07: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 841a09: test ah, 0x41
        if (!R.zf) { pc = 186; continue; } // 841a0c: jne 0x841ad9
        pc = 176; continue;
      case 176: // 841a12
        R.ecx = (R.add((R.ecx >>> 0), 0xfffe7960, 32)) | 0; // 841a12: add ecx, 0xfffe7960
        R.fpop(); // 841a18: fstp st(0)
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.ecx >>> 0)); // 841a1a: mov dword ptr [esp + 0x30], ecx
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 841a1e: fild dword ptr [esp + 0x30]
        R.st[0] = R.st[0] + 50000.0; // 841a22: fadd qword ptr [0x968880]
        pc = 185; continue; // 841a28: jmp 0x841ad5
      case 177: // 841a2d
        R.eax = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 841a2d: movsx eax, ax
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 841a30: mov dword ptr [esp + 0x28], eax
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 841a34: lea ecx, [eax + eax*4]
        R.ecx = (R.shl((R.ecx >>> 0), 0x1, 32)) | 0; // 841a37: shl ecx, 1
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.ecx >>> 0)); // 841a39: mov dword ptr [esp + 0x30], ecx
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 841a3d: fild dword ptr [esp + 0x30]
        R.fpush(R.st[1]); // 841a41: fld st(1)
        R.fcom(R.st[0], R.st[1]); R.fpop(); R.fpop(); // 841a43: fcompp 
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 841a45: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 841a47: test ah, 0x41
        if (!R.zf) { pc = 186; continue; } // 841a4a: jne 0x841ad9
        pc = 178; continue;
      case 178: // 841a50
        R.fpop(); // 841a50: fstp st(0)
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 841a52: fild dword ptr [esp + 0x28]
        R.st[0] = R.st[0] * 10.0; // 841a56: fmul qword ptr [0x9688b0]
        pc = 185; continue; // 841a5c: jmp 0x841ad5
      case 179: // 841a5e
        R.sub(((R.eax >>> 0) & 0xff), 0xa, 8); // 841a5e: cmp al, 0xa
        if (!R.zf) { pc = 186; continue; } // 841a60: jne 0x841ad9
        pc = 180; continue;
      case 180: // 841a62
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.edi + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 841a62: mov ax, word ptr [edi + 0x80]
        R.sub(((R.eax >>> 0) & 0xffff), 0x1388, 16); // 841a69: cmp ax, 0x1388
        if (R.cLE) { pc = 183; continue; } // 841a6d: jle 0x841aa9
        pc = 181; continue;
      default: return pc;
    }
  }
}
function f_840d80_23(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 181: // 841a6f
        R.edx = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 841a6f: movsx edx, ax
        R.edx = (R.sub((R.edx >>> 0), 0x1388, 32)) | 0; // 841a72: sub edx, 0x1388
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.edx >>> 0)); // 841a78: mov dword ptr [esp + 0x30], edx
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 841a7c: fild dword ptr [esp + 0x30]
        R.st[0] = R.st[0] * 0.2; // 841a80: fmul qword ptr [0x968918]
        R.st[0] = R.st[0] + 500.0; // 841a86: fadd qword ptr [0x968878]
        R.fpush(R.st[0]); // 841a8c: fld st(0)
        R.st[0] = R.st[0] * R.st[1]; // 841a8e: fmul st(1)
        R.m.wf64(((R.esp + 0x30) | 0) >>> 0, R.st[0]); R.fpop(); // 841a90: fstp qword ptr [esp + 0x30]
        R.fpop(); // 841a94: fstp st(0)
        R.fcom(R.st[0], R.f64(((R.esp + 0x30) | 0))); // 841a96: fcom qword ptr [esp + 0x30]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 841a9a: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 841a9c: test ah, 0x41
        if (!R.zf) { pc = 186; continue; } // 841a9f: jne 0x841ad9
        pc = 182; continue;
      case 182: // 841aa1
        R.fpop(); // 841aa1: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x30) | 0))); // 841aa3: fld qword ptr [esp + 0x30]
        pc = 185; continue; // 841aa7: jmp 0x841ad5
      case 183: // 841aa9
        R.eax = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 841aa9: movsx eax, ax
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.eax >>> 0)); // 841aac: mov dword ptr [esp + 0x30], eax
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 841ab0: fild dword ptr [esp + 0x30]
        R.fpush(R.st[0]); // 841ab4: fld st(0)
        R.st[0] = R.st[0] * R.st[1]; // 841ab6: fmul st(1)
        R.st[0] = R.st[0] * 0.010000000000000002; // 841ab8: fmul qword ptr [0x96f910]
        R.m.wf64(((R.esp + 0x30) | 0) >>> 0, R.st[0]); R.fpop(); // 841abe: fstp qword ptr [esp + 0x30]
        R.fpop(); // 841ac2: fstp st(0)
        R.fcom(R.st[0], R.f64(((R.esp + 0x30) | 0))); // 841ac4: fcom qword ptr [esp + 0x30]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 841ac8: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 841aca: test ah, 0x41
        if (!R.zf) { pc = 186; continue; } // 841acd: jne 0x841ad9
        pc = 184; continue;
      case 184: // 841acf
        R.fpop(); // 841acf: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x30) | 0))); // 841ad1: fld qword ptr [esp + 0x30]
        pc = 185; continue;
      case 185: // 841ad5
        R.m.wf64(((R.esp + 0x40) | 0) >>> 0, R.st[0]); // 841ad5: fst qword ptr [esp + 0x40]
        pc = 186; continue;
      case 186: // 841ad9
        R.esi = ((R.esi & 0xffff0000) | (((R.m.u16(((R.esi + 0xd) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 841ad9: mov si, word ptr [esi + 0xd]
        R.sub(((R.esi >>> 0) & 0xffff), 0x1388, 16); // 841add: cmp si, 0x1388
        if (!R.cLE) { pc = 189; continue; } // 841ae2: jg 0x841b0e
        pc = 187; continue;
      case 187: // 841ae4
        R.fpush(R.f64(((R.esp + 0x10) | 0))); // 841ae4: fld qword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 10000000.0; // 841ae8: fmul qword ptr [0x96f908]
        R.m.wf64(((R.esp + 0x30) | 0) >>> 0, R.st[0]); // 841aee: fst qword ptr [esp + 0x30]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 841af2: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 841af4: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 841af6: test ah, 1
        if (R.zf) { pc = 198; continue; } // 841af9: je 0x841ba8
        pc = 188; continue;
      case 188: // 841aff
        R.fpop(); // 841aff: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x30) | 0))); // 841b01: fld qword ptr [esp + 0x30]
        R.m.wf64(((R.esp + 0x40) | 0) >>> 0, R.st[0]); // 841b05: fst qword ptr [esp + 0x40]
        pc = 198; continue; // 841b09: jmp 0x841ba8
      default: return pc;
    }
  }
}
function f_840d80_24(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 189: // 841b0e
        R.sub(((R.esi >>> 0) & 0xffff), 0x1f40, 16); // 841b0e: cmp si, 0x1f40
        if (!R.cLE) { pc = 192; continue; } // 841b13: jg 0x841b49
        pc = 190; continue;
      case 190: // 841b15
        R.ecx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 841b15: movsx ecx, si
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.ecx >>> 0)); // 841b18: mov dword ptr [esp + 0x30], ecx
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 841b1c: fild dword ptr [esp + 0x30]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x10) | 0)); // 841b20: fmul qword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 1666.67; // 841b24: fmul qword ptr [0x96f900]
        R.st[0] = R.st[0] + 1650000.0; // 841b2a: fadd qword ptr [0x96f8f8]
        R.m.wf64(((R.esp + 0x30) | 0) >>> 0, R.st[0]); // 841b30: fst qword ptr [esp + 0x30]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 841b34: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 841b36: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 841b38: test ah, 1
        if (R.zf) { pc = 198; continue; } // 841b3b: je 0x841ba8
        pc = 191; continue;
      case 191: // 841b3d
        R.fpop(); // 841b3d: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x30) | 0))); // 841b3f: fld qword ptr [esp + 0x30]
        R.m.wf64(((R.esp + 0x40) | 0) >>> 0, R.st[0]); // 841b43: fst qword ptr [esp + 0x40]
        pc = 198; continue; // 841b47: jmp 0x841ba8
      case 192: // 841b49
        R.sub(((R.esi >>> 0) & 0xffff), 0x2328, 16); // 841b49: cmp si, 0x2328
        if (!R.cL) { pc = 196; continue; } // 841b4e: jge 0x841b8e
        pc = 193; continue;
      case 193: // 841b50
        R.edx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 841b50: movsx edx, si
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.edx >>> 0)); // 841b53: mov dword ptr [esp + 0x30], edx
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 841b57: fild dword ptr [esp + 0x30]
        R.st[0] = R.st[0] * 7500.0; // 841b5b: fmul qword ptr [0x9690b8]
        R.st[0] = R.st[0] - 45000000.0; // 841b61: fsub qword ptr [0x96f8f0]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x10) | 0)); // 841b67: fmul qword ptr [esp + 0x10]
        R.m.wf64(((R.esp + 0x30) | 0) >>> 0, R.st[0]); // 841b6b: fst qword ptr [esp + 0x30]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 841b6f: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 841b71: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 841b73: test ah, 1
        if (R.zf) { pc = 195; continue; } // 841b76: je 0x841b82
        pc = 194; continue;
      case 194: // 841b78
        R.fpop(); // 841b78: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x30) | 0))); // 841b7a: fld qword ptr [esp + 0x30]
        R.m.wf64(((R.esp + 0x40) | 0) >>> 0, R.st[0]); // 841b7e: fst qword ptr [esp + 0x40]
        pc = 195; continue;
      case 195: // 841b82
        R.fpush(R.f64(((R.esp + 0x10) | 0))); // 841b82: fld qword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 1.5; // 841b86: fmul qword ptr [0x968940]
        pc = 197; continue; // 841b8c: jmp 0x841ba4
      case 196: // 841b8e
        R.fpop(); // 841b8e: fstp st(0)
        R.fpush(100000000.0); // 841b90: fld qword ptr [0x96d568]
        R.m.wf64(((R.esp + 0x40) | 0) >>> 0, R.st[0]); // 841b96: fst qword ptr [esp + 0x40]
        R.fpush(R.f64(((R.esp + 0x10) | 0))); // 841b9a: fld qword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 2.5; // 841b9e: fmul qword ptr [0x968e18]
        pc = 197; continue;
      case 197: // 841ba4
        R.m.wf64(((R.esp + 0x10) | 0) >>> 0, R.st[0]); R.fpop(); // 841ba4: fstp qword ptr [esp + 0x10]
        pc = 198; continue;
      default: return pc;
    }
  }
}
function f_840d80_25(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 198: // 841ba8
        R.eax = (((R.m.u8(((R.esp + 0xe) | 0) >>> 0)) << 24 >> 24)) | 0; // 841ba8: movsx eax, byte ptr [esp + 0xe]
        R.eax = (R.add((R.eax >>> 0), 0xfffffff0, 32)) | 0; // 841bad: add eax, -0x10
        R.sub((R.eax >>> 0), 0x18, 32); // 841bb0: cmp eax, 0x18
        if (!R.cBE) { pc = 225; continue; } // 841bb3: ja 0x841d6d
        pc = 199; continue;
      case 199: // 841bb9
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 841bb9: xor ecx, ecx
        R.ecx = ((R.ecx & 0xffffff00) | (((ROT(RO_842064_1u, 0x842064, 1, ((R.eax + 0x842064) | 0))) & 0xff) << 0)) | 0; // 841bbb: mov cl, byte ptr [eax + 0x842064]
        pc = [216, 218, 220, 222, 214, 212, 210, 208, 206, 204, 202, 200, 225][R.ecx >>> 0] ?? -2; continue; // 841bc1: jmp dword ptr [ecx*4 + 0x842030]
      case 200: // 841bc8
        R.fpush(R.f64(((R.esp + 0x10) | 0))); // 841bc8: fld qword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 500000.0; // 841bcc: fmul qword ptr [0x968870]
        R.m.wf64(((R.esp + 0x30) | 0) >>> 0, R.st[0]); // 841bd2: fst qword ptr [esp + 0x30]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 841bd6: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 841bd8: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 841bda: test ah, 1
        if (R.zf) { pc = 225; continue; } // 841bdd: je 0x841d6d
        pc = 201; continue;
      case 201: // 841be3
        R.fpop(); // 841be3: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x30) | 0))); // 841be5: fld qword ptr [esp + 0x30]
        pc = 224; continue; // 841be9: jmp 0x841d69
      case 202: // 841bee
        R.fpush(R.f64(((R.esp + 0x10) | 0))); // 841bee: fld qword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 750000.0; // 841bf2: fmul qword ptr [0x96f8e8]
        R.m.wf64(((R.esp + 0x30) | 0) >>> 0, R.st[0]); // 841bf8: fst qword ptr [esp + 0x30]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 841bfc: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 841bfe: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 841c00: test ah, 1
        if (R.zf) { pc = 225; continue; } // 841c03: je 0x841d6d
        pc = 203; continue;
      case 203: // 841c09
        R.fpop(); // 841c09: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x30) | 0))); // 841c0b: fld qword ptr [esp + 0x30]
        pc = 224; continue; // 841c0f: jmp 0x841d69
      case 204: // 841c14
        R.fpush(R.f64(((R.esp + 0x10) | 0))); // 841c14: fld qword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 1000000.0; // 841c18: fmul qword ptr [0x9688d8]
        R.m.wf64(((R.esp + 0x30) | 0) >>> 0, R.st[0]); // 841c1e: fst qword ptr [esp + 0x30]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 841c22: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 841c24: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 841c26: test ah, 1
        if (R.zf) { pc = 225; continue; } // 841c29: je 0x841d6d
        pc = 205; continue;
      case 205: // 841c2f
        R.fpop(); // 841c2f: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x30) | 0))); // 841c31: fld qword ptr [esp + 0x30]
        pc = 224; continue; // 841c35: jmp 0x841d69
      case 206: // 841c3a
        R.fpush(R.f64(((R.esp + 0x10) | 0))); // 841c3a: fld qword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 2500000.0; // 841c3e: fmul qword ptr [0x96a650]
        R.m.wf64(((R.esp + 0x30) | 0) >>> 0, R.st[0]); // 841c44: fst qword ptr [esp + 0x30]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 841c48: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 841c4a: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 841c4c: test ah, 1
        if (R.zf) { pc = 225; continue; } // 841c4f: je 0x841d6d
        pc = 207; continue;
      default: return pc;
    }
  }
}
function f_840d80_26(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 207: // 841c55
        R.fpop(); // 841c55: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x30) | 0))); // 841c57: fld qword ptr [esp + 0x30]
        pc = 224; continue; // 841c5b: jmp 0x841d69
      case 208: // 841c60
        R.fpush(R.f64(((R.esp + 0x10) | 0))); // 841c60: fld qword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 5000000.0; // 841c64: fmul qword ptr [0x9688c8]
        R.m.wf64(((R.esp + 0x30) | 0) >>> 0, R.st[0]); // 841c6a: fst qword ptr [esp + 0x30]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 841c6e: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 841c70: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 841c72: test ah, 1
        if (R.zf) { pc = 225; continue; } // 841c75: je 0x841d6d
        pc = 209; continue;
      case 209: // 841c7b
        R.fpop(); // 841c7b: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x30) | 0))); // 841c7d: fld qword ptr [esp + 0x30]
        pc = 224; continue; // 841c81: jmp 0x841d69
      case 210: // 841c86
        R.fpush(R.f64(((R.esp + 0x10) | 0))); // 841c86: fld qword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 10000000.0; // 841c8a: fmul qword ptr [0x96f908]
        R.m.wf64(((R.esp + 0x30) | 0) >>> 0, R.st[0]); // 841c90: fst qword ptr [esp + 0x30]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 841c94: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 841c96: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 841c98: test ah, 1
        if (R.zf) { pc = 225; continue; } // 841c9b: je 0x841d6d
        pc = 211; continue;
      case 211: // 841ca1
        R.fpop(); // 841ca1: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x30) | 0))); // 841ca3: fld qword ptr [esp + 0x30]
        pc = 224; continue; // 841ca7: jmp 0x841d69
      case 212: // 841cac
        R.fpush(R.f64(((R.esp + 0x10) | 0))); // 841cac: fld qword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 12000000.0; // 841cb0: fmul qword ptr [0x96f8e0]
        R.m.wf64(((R.esp + 0x30) | 0) >>> 0, R.st[0]); // 841cb6: fst qword ptr [esp + 0x30]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 841cba: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 841cbc: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 841cbe: test ah, 1
        if (R.zf) { pc = 225; continue; } // 841cc1: je 0x841d6d
        pc = 213; continue;
      case 213: // 841cc7
        pc = 223; continue; // 841cc7: jmp 0x841d63
      case 214: // 841ccc
        R.fpush(R.f64(((R.esp + 0x10) | 0))); // 841ccc: fld qword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 15000000.0; // 841cd0: fmul qword ptr [0x96a630]
        R.m.wf64(((R.esp + 0x30) | 0) >>> 0, R.st[0]); // 841cd6: fst qword ptr [esp + 0x30]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 841cda: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 841cdc: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 841cde: test ah, 1
        if (R.zf) { pc = 225; continue; } // 841ce1: je 0x841d6d
        pc = 215; continue;
      case 215: // 841ce7
        R.fpop(); // 841ce7: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x30) | 0))); // 841ce9: fld qword ptr [esp + 0x30]
        pc = 224; continue; // 841ced: jmp 0x841d69
      default: return pc;
    }
  }
}
function f_840d80_27(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 216: // 841cef
        R.fpush(R.f64(((R.esp + 0x10) | 0))); // 841cef: fld qword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 4500000.0; // 841cf3: fmul qword ptr [0x96f8d8]
        R.m.wf64(((R.esp + 0x30) | 0) >>> 0, R.st[0]); // 841cf9: fst qword ptr [esp + 0x30]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 841cfd: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 841cff: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 841d01: test ah, 1
        if (R.zf) { pc = 225; continue; } // 841d04: je 0x841d6d
        pc = 217; continue;
      case 217: // 841d06
        R.fpop(); // 841d06: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x30) | 0))); // 841d08: fld qword ptr [esp + 0x30]
        pc = 224; continue; // 841d0c: jmp 0x841d69
      case 218: // 841d0e
        R.fpush(R.f64(((R.esp + 0x10) | 0))); // 841d0e: fld qword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 6000000.0; // 841d12: fmul qword ptr [0x968e90]
        R.m.wf64(((R.esp + 0x30) | 0) >>> 0, R.st[0]); // 841d18: fst qword ptr [esp + 0x30]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 841d1c: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 841d1e: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 841d20: test ah, 1
        if (R.zf) { pc = 225; continue; } // 841d23: je 0x841d6d
        pc = 219; continue;
      case 219: // 841d25
        R.fpop(); // 841d25: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x30) | 0))); // 841d27: fld qword ptr [esp + 0x30]
        pc = 224; continue; // 841d2b: jmp 0x841d69
      case 220: // 841d2d
        R.fpush(R.f64(((R.esp + 0x10) | 0))); // 841d2d: fld qword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 8000000.0; // 841d31: fmul qword ptr [0x96d850]
        R.m.wf64(((R.esp + 0x30) | 0) >>> 0, R.st[0]); // 841d37: fst qword ptr [esp + 0x30]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 841d3b: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 841d3d: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 841d3f: test ah, 1
        if (R.zf) { pc = 225; continue; } // 841d42: je 0x841d6d
        pc = 221; continue;
      case 221: // 841d44
        R.fpop(); // 841d44: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x30) | 0))); // 841d46: fld qword ptr [esp + 0x30]
        pc = 224; continue; // 841d4a: jmp 0x841d69
      case 222: // 841d4c
        R.fpush(R.f64(((R.esp + 0x10) | 0))); // 841d4c: fld qword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 12000000.0; // 841d50: fmul qword ptr [0x96f8e0]
        R.m.wf64(((R.esp + 0x30) | 0) >>> 0, R.st[0]); // 841d56: fst qword ptr [esp + 0x30]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 841d5a: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 841d5c: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 841d5e: test ah, 1
        if (R.zf) { pc = 225; continue; } // 841d61: je 0x841d6d
        pc = 223; continue;
      case 223: // 841d63
        R.fpop(); // 841d63: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x30) | 0))); // 841d65: fld qword ptr [esp + 0x30]
        pc = 224; continue;
      case 224: // 841d69
        R.m.wf64(((R.esp + 0x40) | 0) >>> 0, R.st[0]); // 841d69: fst qword ptr [esp + 0x40]
        pc = 225; continue;
      default: return pc;
    }
  }
}
function f_840d80_28(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 225: // 841d6d
        R.fcom(R.st[0], 1500000.0); // 841d6d: fcom qword ptr [0x96f8d0]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 841d73: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 841d75: test ah, 0x41
        if (!R.zf) { pc = 231; continue; } // 841d78: jne 0x841df6
        pc = 226; continue;
      case 226: // 841d7a
        R.edx = (R.m.u32(((R.ebp + 0x14) | 0) >>> 0)) | 0; // 841d7a: mov edx, dword ptr [ebp + 0x14]
        R.ecx = (R.m.u32(((R.edi + 0xcf) | 0) >>> 0)) | 0; // 841d7d: mov ecx, dword ptr [edi + 0xcf]
        R.fpop(); // 841d83: fstp st(0)
        R.eax = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 841d85: mov eax, dword ptr [edx]
        R.edx = R.eax < 0 ? -1 : 0; // 841d87: cdq 
        R.edx = (R.logic((R.edx >>> 0) & 0x3, 32)) | 0; // 841d88: and edx, 3
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 841d8b: add eax, edx
        R.eax = (R.sar((R.eax >>> 0), 0x2, 32)) | 0; // 841d8d: sar eax, 2
        R.push((R.eax >>> 0)); // 841d90: push eax
        R.eax = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 841d91: mov eax, dword ptr [ebp + 0xc]
        R.push(0x2); // 841d94: push 2
        R.push((R.edi >>> 0)); // 841d96: push edi
        R.push((R.eax >>> 0)); // 841d97: push eax
        R.push((R.ecx >>> 0)); // 841d98: push ecx
        R.call(0x6e86d0, { n: 5, thisEcx: true, calleeClean: false }); // 841d99: call 0x6e86d0
        R.edx = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 841d9e: movsx edx, ax
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.edx >>> 0)); // 841da1: mov dword ptr [esp + 0x44], edx
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 841da5: add esp, 0x14
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 841da8: fild dword ptr [esp + 0x30]
        R.fcom(R.st[0], 145.0); // 841dac: fcom qword ptr [0x96f8c8]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 841db2: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 841db4: test ah, 1
        if (R.zf) { pc = 230; continue; } // 841db7: je 0x841df0
        pc = 227; continue;
      case 227: // 841db9
        R.st[0] = R.st[0] * 0.025; // 841db9: fmul qword ptr [0x967878]
        R.st[0] = R.st[0] - 2.625; // 841dbf: fsub qword ptr [0x96f8c0]
        R.fpush(0.0); // 841dc5: fld qword ptr [0x9689a0]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 841dcb: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 841dcd: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 841dcf: test ah, 0x41
        if (!R.zf) { pc = 229; continue; } // 841dd2: jne 0x841ddc
        pc = 228; continue;
      case 228: // 841dd4
        R.fpop(); // 841dd4: fstp st(0)
        R.fpush(0.0); // 841dd6: fld qword ptr [0x9689a0]
        pc = 229; continue;
      case 229: // 841ddc
        R.fpush(R.f64(((R.esp + 0x40) | 0))); // 841ddc: fld qword ptr [esp + 0x40]
        R.st[0] = R.st[0] - 1500000.0; // 841de0: fsub qword ptr [0x96f8d0]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 841de6: fmulp st(1)
        R.st[0] = R.st[0] + 1500000.0; // 841de8: fadd qword ptr [0x96f8d0]
        pc = 231; continue; // 841dee: jmp 0x841df6
      case 230: // 841df0
        R.fpop(); // 841df0: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x40) | 0))); // 841df2: fld qword ptr [esp + 0x40]
        pc = 231; continue;
      case 231: // 841df6
        R.eax = (R.m.u32(((R.edi + 0x57) | 0) >>> 0)) | 0; // 841df6: mov eax, dword ptr [edi + 0x57]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 841df9: test eax, eax
        if (R.zf) { pc = 244; continue; } // 841dfb: je 0x841ed2
        pc = 232; continue;
      default: return pc;
    }
  }
}
function f_840d80_29(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 232: // 841e01
        R.esi = ((R.esi & 0xffff0000) | (((R.m.u16(((R.eax + 0x69) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 841e01: mov si, word ptr [eax + 0x69]
        R.sub(((R.esi >>> 0) & 0xffff), 0x10, 16); // 841e05: cmp si, 0x10
        if (!R.cL) { pc = 244; continue; } // 841e09: jge 0x841ed2
        pc = 233; continue;
      case 233: // 841e0f
        R.ecx = (((R.m.u16(((R.edi + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 841e0f: movsx ecx, word ptr [edi + 0x80]
        R.eax = (0x10624dd3) | 0; // 841e16: mov eax, 0x10624dd3
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 841e1b: imul ecx
        R.edx = (R.sar((R.edx >>> 0), 0x5, 32)) | 0; // 841e1d: sar edx, 5
        R.eax = ((R.edx >>> 0)) | 0; // 841e20: mov eax, edx
        R.eax = (R.shr((R.eax >>> 0), 0x1f, 32)) | 0; // 841e22: shr eax, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 841e25: add edx, eax
        R.eax = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 841e27: movsx eax, si
        R.sub((R.edx >>> 0), (R.eax >>> 0), 32); // 841e2a: cmp edx, eax
        if (R.cLE) { pc = 235; continue; } // 841e2c: jle 0x841e30
        pc = 234; continue;
      case 234: // 841e2e
        R.eax = ((R.edx >>> 0)) | 0; // 841e2e: mov eax, edx
        pc = 235; continue;
      case 235: // 841e30
        R.ecx = ((R.eax >>> 0)) | 0; // 841e30: mov ecx, eax
        R.ecx = (R.shl((R.ecx >>> 0), 0x5, 32)) | 0; // 841e32: shl ecx, 5
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 841e35: add ecx, eax
        R.eax = (((R.eax + R.ecx * 2) | 0)) | 0; // 841e37: lea eax, [eax + ecx*2]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 841e3a: lea eax, [eax + eax*4]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 841e3d: lea eax, [eax + eax*4]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 841e40: lea ecx, [eax + eax*4]
        R.ecx = (((R.ecx + R.ecx * 4) | 0)) | 0; // 841e43: lea ecx, [ecx + ecx*4]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 841e46: shl ecx, 4
        R.sub((R.ecx >>> 0), 0xf4240, 32); // 841e49: cmp ecx, 0xf4240
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.ecx >>> 0)); // 841e4f: mov dword ptr [esp + 0x28], ecx
        if (!R.cLE) { pc = 237; continue; } // 841e53: jg 0x841e5e
        pc = 236; continue;
      case 236: // 841e55
        R.ecx = (0xf4240) | 0; // 841e55: mov ecx, 0xf4240
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.ecx >>> 0)); // 841e5a: mov dword ptr [esp + 0x28], ecx
        pc = 237; continue;
      case 237: // 841e5e
        R.edx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 841e5e: mov edx, dword ptr [ebp + 0xc]
        R.eax = (R.m.u32(((R.edx + 0x61) | 0) >>> 0)) | 0; // 841e61: mov eax, dword ptr [edx + 0x61]
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.eax + 0xd) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 841e64: mov ax, word ptr [eax + 0xd]
        R.sub(((R.eax >>> 0) & 0xffff), 0x1f40, 16); // 841e68: cmp ax, 0x1f40
        if (R.cLE) { pc = 239; continue; } // 841e6c: jle 0x841e8b
        pc = 238; continue;
      case 238: // 841e6e
        R.eax = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 841e6e: movsx eax, ax
        R.eax = (R.sub((R.eax >>> 0), 0x1f40, 32)) | 0; // 841e71: sub eax, 0x1f40
        R.edx = (((R.eax + R.eax * 2) | 0)) | 0; // 841e76: lea edx, [eax + eax*2]
        R.eax = (((R.eax + R.edx * 8) | 0)) | 0; // 841e79: lea eax, [eax + edx*8]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 841e7c: lea eax, [eax + eax*4]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 841e7f: lea eax, [eax + eax*4]
        R.eax = (R.shl((R.eax >>> 0), 0x4, 32)) | 0; // 841e82: shl eax, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 841e85: add ecx, eax
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.ecx >>> 0)); // 841e87: mov dword ptr [esp + 0x28], ecx
        pc = 239; continue;
      default: return pc;
    }
  }
}
function f_840d80_30(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 239: // 841e8b
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 841e8b: fild dword ptr [esp + 0x28]
        R.m.wf64(((R.esp + 0x40) | 0) >>> 0, R.st[0]); R.fpop(); // 841e8f: fstp qword ptr [esp + 0x40]
        R.fcom(R.st[0], R.f64(((R.esp + 0x40) | 0))); // 841e93: fcom qword ptr [esp + 0x40]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 841e97: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 841e99: test ah, 0x41
        if (!R.zf) { pc = 244; continue; } // 841e9c: jne 0x841ed2
        pc = 240; continue;
      case 240: // 841e9e
        R.fpop(); // 841e9e: fstp st(0)
        R.fpush(1.0); // 841ea0: fld qword ptr [0x967890]
        R.fcom(R.st[0], R.f64(((R.esp + 0x10) | 0))); R.fpop(); // 841ea6: fcomp qword ptr [esp + 0x10]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 841eaa: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 841eac: test ah, 1
        if (R.zf) { pc = 242; continue; } // 841eaf: je 0x841eb9
        pc = 241; continue;
      case 241: // 841eb1
        R.fpush(1.0); // 841eb1: fld qword ptr [0x967890]
        pc = 243; continue; // 841eb7: jmp 0x841ebd
      case 242: // 841eb9
        R.fpush(R.f64(((R.esp + 0x10) | 0))); // 841eb9: fld qword ptr [esp + 0x10]
        pc = 243; continue;
      case 243: // 841ebd
        R.fpush(R.f64(((R.esp + 0x40) | 0))); // 841ebd: fld qword ptr [esp + 0x40]
        R.st[0] = R.st[0] * R.st[1]; // 841ec1: fmul st(1)
        R.ftol(); // 841ec3: call 0x945640
        R.fpop(); // 841ec8: fstp st(0)
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.eax >>> 0)); // 841eca: mov dword ptr [esp + 0x30], eax
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 841ece: fild dword ptr [esp + 0x30]
        pc = 244; continue;
      case 244: // 841ed2
        R.ecx = (R.m.u32(((R.edi + 0x53) | 0) >>> 0)) | 0; // 841ed2: mov ecx, dword ptr [edi + 0x53]
        R.eax = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 841ed5: mov eax, dword ptr [ecx]
        R.ecx = (R.m.u32(((0x9cf434) | 0) >>> 0)) | 0; // 841ed7: mov ecx, dword ptr [0x9cf434]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 841edd: cmp eax, ecx
        if (!R.zf) { pc = 248; continue; } // 841edf: jne 0x841f0e
        pc = 245; continue;
      case 245: // 841ee1
        R.fcom(R.st[0], 6000000.0); // 841ee1: fcom qword ptr [0x968e90]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 841ee7: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 841ee9: test ah, 1
        if (R.zf) { pc = 247; continue; } // 841eec: je 0x841f06
        pc = 246; continue;
      case 246: // 841eee
        R.fpush(R.st[0]); // 841eee: fld st(0)
        R.st[0] = R.st[0] * 1.6666666666666668e-07; // 841ef0: fmul qword ptr [0x968e88]
        R.st[0] = R.st[0] * 0.6; // 841ef6: fmul qword ptr [0x968e48]
        R.st[0] = R.st[0] + 0.3; // 841efc: fadd qword ptr [0x968e80]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 841f02: fmulp st(1)
        pc = 250; continue; // 841f04: jmp 0x841f29
      case 247: // 841f06
        R.st[0] = R.st[0] * 0.9; // 841f06: fmul qword ptr [0x9689d8]
        pc = 250; continue; // 841f0c: jmp 0x841f29
      case 248: // 841f0e
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf300) | 0) >>> 0), 32); // 841f0e: cmp eax, dword ptr [0x9cf300]
        if (!R.zf) { pc = 250; continue; } // 841f14: jne 0x841f29
        pc = 249; continue;
      default: return pc;
    }
  }
}
function f_840d80_31(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 249: // 841f16
        R.st[0] = R.st[0] * 0.8; // 841f16: fmul qword ptr [0x9689b0]
        R.ftol(); // 841f1c: call 0x945640
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.eax >>> 0)); // 841f21: mov dword ptr [esp + 0x30], eax
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 841f25: fild dword ptr [esp + 0x30]
        pc = 250; continue;
      case 250: // 841f29
        R.eax = (R.m.u32(((R.ebp + 0x1c) | 0) >>> 0)) | 0; // 841f29: mov eax, dword ptr [ebp + 0x1c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 841f2c: test eax, eax
        if (R.zf) { pc = 254; continue; } // 841f2e: je 0x841f54
        pc = 251; continue;
      case 251: // 841f30
        R.fpush(R.m.s32(((R.esp + 0x3c) | 0) >>> 0)); // 841f30: fild dword ptr [esp + 0x3c]
        R.m.wf64(((R.esp + 0x40) | 0) >>> 0, R.st[0]); // 841f34: fst qword ptr [esp + 0x40]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 841f38: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 841f3a: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 841f3c: test ah, 1
        if (R.zf) { pc = 253; continue; } // 841f3f: je 0x841f47
        pc = 252; continue;
      case 252: // 841f41
        R.fpop(); // 841f41: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x40) | 0))); // 841f43: fld qword ptr [esp + 0x40]
        pc = 253; continue;
      case 253: // 841f47
        R.ftol(); // 841f47: call 0x945640
        R.m.w32(((R.esp + 0x3c) | 0) >>> 0, (R.eax >>> 0)); // 841f4c: mov dword ptr [esp + 0x3c], eax
        R.fpush(R.m.s32(((R.esp + 0x3c) | 0) >>> 0)); // 841f50: fild dword ptr [esp + 0x3c]
        pc = 254; continue;
      case 254: // 841f54
        R.ftol(); // 841f54: call 0x945640
        R.edi = (R.pop()) | 0; // 841f59: pop edi
        R.esi = (R.pop()) | 0; // 841f5a: pop esi
        R.ebx = (R.pop()) | 0; // 841f5b: pop ebx
        R.esp = ((R.ebp >>> 0)) | 0; // 841f5c: mov esp, ebp
        R.ebp = (R.pop()) | 0; // 841f5e: pop ebp
        R.rv = R.ret(6); return -1; // 841f5f: ret 0x18
      case 255: // 841f62
        R.esi = (R.m.u32(((R.ebp + 0x10) | 0) >>> 0)) | 0; // 841f62: mov esi, dword ptr [ebp + 0x10]
        R.logic(R.m.u8(((R.esi + 0x24) | 0) >>> 0) & 0x1, 8); // 841f65: test byte ptr [esi + 0x24], 1
        if (R.zf) { pc = 260; continue; } // 841f69: je 0x841fb3
        pc = 256; continue;
      case 256: // 841f6b
        R.push(0x0); // 841f6b: push 0
        R.push((R.edi >>> 0)); // 841f6d: push edi
        R.call(0x544590, { n: 2, thisEcx: false, calleeClean: false }); // 841f6e: call 0x544590
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 841f73: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 841f76: test eax, eax
        if (R.zf) { pc = 260; continue; } // 841f78: je 0x841fb3
        pc = 257; continue;
      default: return pc;
    }
  }
}
function f_840d80_32(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 257: // 841f7a
        R.eax = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 841f7a: mov eax, dword ptr [ebx]
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.eax >>> 0)); // 841f7c: mov dword ptr [esp + 0x18], eax
        R.eax = (R.add((R.eax >>> 0), 0x1388, 32)) | 0; // 841f80: add eax, 0x1388
        R.m.w32(((R.esp + 0x3c) | 0) >>> 0, (R.eax >>> 0)); // 841f85: mov dword ptr [esp + 0x3c], eax
        R.fpush(R.m.s32(((R.esp + 0x3c) | 0) >>> 0)); // 841f89: fild dword ptr [esp + 0x3c]
        R.fpush(R.m.s32(((R.esp + 0x18) | 0) >>> 0)); // 841f8d: fild dword ptr [esp + 0x18]
        R.st[0] = R.st[0] * 1.2; // 841f91: fmul qword ptr [0x968978]
        R.m.wf64(((R.esp + 0x40) | 0) >>> 0, R.st[0]); R.fpop(); // 841f97: fstp qword ptr [esp + 0x40]
        R.fcom(R.st[0], R.f64(((R.esp + 0x40) | 0))); // 841f9b: fcom qword ptr [esp + 0x40]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 841f9f: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 841fa1: test ah, 0x41
        if (R.zf) { pc = 259; continue; } // 841fa4: je 0x841fac
        pc = 258; continue;
      case 258: // 841fa6
        R.fpop(); // 841fa6: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x40) | 0))); // 841fa8: fld qword ptr [esp + 0x40]
        pc = 259; continue;
      case 259: // 841fac
        R.ftol(); // 841fac: call 0x945640
        R.m.w32(((R.ebx) | 0) >>> 0, (R.eax >>> 0)); // 841fb1: mov dword ptr [ebx], eax
        pc = 260; continue;
      case 260: // 841fb3
        R.edi = (R.pop()) | 0; // 841fb3: pop edi
        R.esi = (R.pop()) | 0; // 841fb4: pop esi
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 841fb5: xor eax, eax
        R.ebx = (R.pop()) | 0; // 841fb7: pop ebx
        R.esp = ((R.ebp >>> 0)) | 0; // 841fb8: mov esp, ebp
        R.ebp = (R.pop()) | 0; // 841fba: pop ebp
        R.rv = R.ret(6); return -1; // 841fbb: ret 0x18
      default: return pc;
    }
  }
}
export function f_840d80(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 261) throw new Error(`f_840d80: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_840d80_0(R, pc); break;
      case 1: np = f_840d80_1(R, pc); break;
      case 2: np = f_840d80_2(R, pc); break;
      case 3: np = f_840d80_3(R, pc); break;
      case 4: np = f_840d80_4(R, pc); break;
      case 5: np = f_840d80_5(R, pc); break;
      case 6: np = f_840d80_6(R, pc); break;
      case 7: np = f_840d80_7(R, pc); break;
      case 8: np = f_840d80_8(R, pc); break;
      case 9: np = f_840d80_9(R, pc); break;
      case 10: np = f_840d80_10(R, pc); break;
      case 11: np = f_840d80_11(R, pc); break;
      case 12: np = f_840d80_12(R, pc); break;
      case 13: np = f_840d80_13(R, pc); break;
      case 14: np = f_840d80_14(R, pc); break;
      case 15: np = f_840d80_15(R, pc); break;
      case 16: np = f_840d80_16(R, pc); break;
      case 17: np = f_840d80_17(R, pc); break;
      case 18: np = f_840d80_18(R, pc); break;
      case 19: np = f_840d80_19(R, pc); break;
      case 20: np = f_840d80_20(R, pc); break;
      case 21: np = f_840d80_21(R, pc); break;
      case 22: np = f_840d80_22(R, pc); break;
      case 23: np = f_840d80_23(R, pc); break;
      case 24: np = f_840d80_24(R, pc); break;
      case 25: np = f_840d80_25(R, pc); break;
      case 26: np = f_840d80_26(R, pc); break;
      case 27: np = f_840d80_27(R, pc); break;
      case 28: np = f_840d80_28(R, pc); break;
      case 29: np = f_840d80_29(R, pc); break;
      case 30: np = f_840d80_30(R, pc); break;
      case 31: np = f_840d80_31(R, pc); break;
      case 32: np = f_840d80_32(R, pc); break;
      default: throw new Error(`f_840d80: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_840d80: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_840d80.shared = true;
