// 0x8d0a70 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4cf5a0=1c, 544670=1, 54a110=0t, 5e8290=9, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_8d0a70(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x8d0a70;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x8d0a70:
        R.push(0xffffffff); // 8d0a70: push -1
        R.push(0x96405b); // 8d0a72: push 0x96405b
        R.eax = (0) | 0; // 8d0a77: mov eax, dword ptr fs:[0]
        R.push((R.eax >>> 0)); // 8d0a7d: push eax
        /* fs */ // 8d0a7e: mov dword ptr fs:[0], esp
        R.esp = (R.sub((R.esp >>> 0), 0x208, 32)) | 0; // 8d0a85: sub esp, 0x208
        R.ecx = (((R.esp) | 0)) | 0; // 8d0a8b: lea ecx, [esp]
        R.call(0x54a110, { n: 0, thisEcx: true, calleeClean: false }); // 8d0a8f: call 0x54a110
        R.eax = (R.m.u32(((R.esp + 0x218) | 0) >>> 0)) | 0; // 8d0a94: mov eax, dword ptr [esp + 0x218]
        R.m.w32(((R.esp + 0x210) | 0) >>> 0, 0x0); // 8d0a9b: mov dword ptr [esp + 0x210], 0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8d0aa6: test eax, eax
        if (!R.zf) { pc = 0x8d0b26; continue; } // 8d0aa8: jne 0x8d0b26
        pc = 0x8d0aaa; continue;
      case 0x8d0aaa:
        R.eax = (((R.esp + 0x8) | 0)) | 0; // 8d0aaa: lea eax, [esp + 8]
        R.ecx = (((R.esp + 0x108) | 0)) | 0; // 8d0aae: lea ecx, [esp + 0x108]
        R.push((R.eax >>> 0)); // 8d0ab5: push eax
        R.push((R.ecx >>> 0)); // 8d0ab6: push ecx
        R.push(0x0); // 8d0ab7: push 0
        R.push(0x0); // 8d0ab9: push 0
        R.push(0xa8d514); // 8d0abb: push 0xa8d514
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 8d0ac0: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8d0ac5: add esp, 0x14
        R.edx = (((R.esp + 0x8) | 0)) | 0; // 8d0ac8: lea edx, [esp + 8]
        R.eax = (((R.esp + 0x108) | 0)) | 0; // 8d0acc: lea eax, [esp + 0x108]
        R.push(0x3798); // 8d0ad3: push 0x3798
        R.push((R.edx >>> 0)); // 8d0ad8: push edx
        R.push((R.eax >>> 0)); // 8d0ad9: push eax
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 8d0ada: call 0x90d130
        R.push((R.eax >>> 0)); // 8d0adf: push eax
        R.push(0x9870e8); // 8d0ae0: push 0x9870e8
        R.push(0xae24d0); // 8d0ae5: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 8d0aea: call 0x944c9f
        R.push(0x0); // 8d0aef: push 0
        R.push(0xae24d0); // 8d0af1: push 0xae24d0
        R.push(0x9870e0); // 8d0af6: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 8d0afb: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 8d0b00: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 8d0b03: mov dword ptr [0xb67a34], 0
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8d0b0d: xor eax, eax
        R.ecx = (R.m.u32(((R.esp + 0x208) | 0) >>> 0)) | 0; // 8d0b0f: mov ecx, dword ptr [esp + 0x208]
        /* fs */ // 8d0b16: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x214, 32)) | 0; // 8d0b1d: add esp, 0x214
        return R.ret(1); // 8d0b23: ret 4
      case 0x8d0b26:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8d0b26: mov ecx, dword ptr [0xae1050]
        R.push((R.eax >>> 0)); // 8d0b2c: push eax
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 8d0b2d: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8d0b32: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 8d0b34: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x8d0b87; continue; } // 8d0b39: je 0x8d0b87
        pc = 0x8d0b3b; continue;
      case 0x8d0b3b:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + 0x35) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8d0b3b: mov cl, byte ptr [eax + 0x35]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0x3f, 8)) & 0xff) << 0)) | 0; // 8d0b3e: and cl, 0x3f
        R.sub(((R.ecx >>> 0) & 0xff), 0x5, 8); // 8d0b41: cmp cl, 5
        if (R.zf) { pc = 0x8d0b87; continue; } // 8d0b44: je 0x8d0b87
        pc = 0x8d0b46; continue;
      case 0x8d0b46:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 8d0b46: mov eax, dword ptr [eax + 4]
        R.ecx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 8d0b49: mov ecx, dword ptr [0xae23b4]
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 8d0b4f: add ecx, eax
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 8d0b51: lea edx, [eax + eax*8]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 8d0b54: shl edx, 4
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8d0b57: add edx, eax
        R.eax = (((R.ecx + R.edx * 4) | 0)) | 0; // 8d0b59: lea eax, [ecx + edx*4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8d0b5c: test eax, eax
        if (R.zf) { pc = 0x8d0b87; continue; } // 8d0b5e: je 0x8d0b87
        pc = 0x8d0b60; continue;
      case 0x8d0b60:
        R.eax = (R.m.u32(((R.eax + 0x53) | 0) >>> 0)) | 0; // 8d0b60: mov eax, dword ptr [eax + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8d0b63: test eax, eax
        if (R.zf) { pc = 0x8d0b87; continue; } // 8d0b65: je 0x8d0b87
        pc = 0x8d0b67; continue;
      case 0x8d0b67:
        R.push((R.eax >>> 0)); // 8d0b67: push eax
        R.call(0x544670, { n: 1, thisEcx: false, calleeClean: false }); // 8d0b68: call 0x544670
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8d0b6d: add esp, 4
        R.ecx = (R.m.u32(((R.esp + 0x208) | 0) >>> 0)) | 0; // 8d0b70: mov ecx, dword ptr [esp + 0x208]
        /* fs */ // 8d0b77: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x214, 32)) | 0; // 8d0b7e: add esp, 0x214
        return R.ret(1); // 8d0b84: ret 4
      case 0x8d0b87:
        R.ecx = (R.m.u32(((R.esp + 0x208) | 0) >>> 0)) | 0; // 8d0b87: mov ecx, dword ptr [esp + 0x208]
        R.eax = (0x1) | 0; // 8d0b8e: mov eax, 1
        /* fs */ // 8d0b93: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x214, 32)) | 0; // 8d0b9a: add esp, 0x214
        return R.ret(1); // 8d0ba0: ret 4
      default: throw new Error(`f_8d0a70: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
