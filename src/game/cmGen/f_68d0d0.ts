// 0x68d0d0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 68cfc0=2tc, 944cf1=1
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_68d0d0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x68d0d0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x68d0d0:
        R.push(0xffffffff); // 68d0d0: push -1
        R.push(0x95cb56); // 68d0d2: push 0x95cb56
        R.eax = (0) | 0; // 68d0d7: mov eax, dword ptr fs:[0]
        R.push((R.eax >>> 0)); // 68d0dd: push eax
        /* fs */ // 68d0de: mov dword ptr fs:[0], esp
        R.push((R.ecx >>> 0)); // 68d0e5: push ecx
        R.push((R.esi >>> 0)); // 68d0e6: push esi
        R.esi = ((R.ecx >>> 0)) | 0; // 68d0e7: mov esi, ecx
        R.push(0xe); // 68d0e9: push 0xe
        R.sub(R.m.u16(((R.esi) | 0) >>> 0), 0x0, 16); // 68d0eb: cmp word ptr [esi], 0
        if (!R.zf) { pc = 0x68d137; continue; } // 68d0ef: jne 0x68d137
        pc = 0x68d0f1; continue;
      case 0x68d0f1:
        R.call(0x944cf1, { n: 1, thisEcx: false, calleeClean: false }); // 68d0f1: call 0x944cf1
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 68d0f6: add esp, 4
        R.m.w32(((R.esp + 0x4) | 0) >>> 0, (R.eax >>> 0)); // 68d0f9: mov dword ptr [esp + 4], eax
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 68d0fd: test eax, eax
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, 0x0); // 68d0ff: mov dword ptr [esp + 0x10], 0
        if (R.zf) { pc = 0x68d11c; continue; } // 68d107: je 0x68d11c
        pc = 0x68d109; continue;
      case 0x68d109:
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 68d109: mov ecx, dword ptr [esp + 0x1c]
        R.edx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 68d10d: mov edx, dword ptr [esp + 0x18]
        R.push((R.ecx >>> 0)); // 68d111: push ecx
        R.push((R.edx >>> 0)); // 68d112: push edx
        R.ecx = ((R.eax >>> 0)) | 0; // 68d113: mov ecx, eax
        R.call(0x68cfc0, { n: 2, thisEcx: true, calleeClean: true }); // 68d115: call 0x68cfc0
        pc = 0x68d11e; continue; // 68d11a: jmp 0x68d11e
      case 0x68d11c:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 68d11c: xor eax, eax
        pc = 0x68d11e; continue;
      case 0x68d11e:
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 68d11e: test eax, eax
        R.m.w32(((R.esi + 0x2) | 0) >>> 0, (R.eax >>> 0)); // 68d120: mov dword ptr [esi + 2], eax
        if (!R.zf) { pc = 0x68d191; continue; } // 68d123: jne 0x68d191
        pc = 0x68d125; continue;
      case 0x68d125:
        R.esi = (R.pop()) | 0; // 68d125: pop esi
        R.ecx = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 68d126: mov ecx, dword ptr [esp + 4]
        /* fs */ // 68d12a: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 68d131: add esp, 0x10
        return R.eax; // 68d134: ret 8
      case 0x68d137:
        R.call(0x944cf1, { n: 1, thisEcx: false, calleeClean: false }); // 68d137: call 0x944cf1
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 68d13c: add esp, 4
        R.m.w32(((R.esp + 0x4) | 0) >>> 0, (R.eax >>> 0)); // 68d13f: mov dword ptr [esp + 4], eax
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 68d143: test eax, eax
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, 0x1); // 68d145: mov dword ptr [esp + 0x10], 1
        if (R.zf) { pc = 0x68d162; continue; } // 68d14d: je 0x68d162
        pc = 0x68d14f; continue;
      case 0x68d14f:
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 68d14f: mov ecx, dword ptr [esp + 0x1c]
        R.edx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 68d153: mov edx, dword ptr [esp + 0x18]
        R.push((R.ecx >>> 0)); // 68d157: push ecx
        R.push((R.edx >>> 0)); // 68d158: push edx
        R.ecx = ((R.eax >>> 0)) | 0; // 68d159: mov ecx, eax
        R.call(0x68cfc0, { n: 2, thisEcx: true, calleeClean: true }); // 68d15b: call 0x68cfc0
        pc = 0x68d164; continue; // 68d160: jmp 0x68d164
      case 0x68d162:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 68d162: xor eax, eax
        pc = 0x68d164; continue;
      case 0x68d164:
        R.ecx = (R.m.u32(((R.esi + 0x6) | 0) >>> 0)) | 0; // 68d164: mov ecx, dword ptr [esi + 6]
        R.m.w32(((R.ecx + 0x6) | 0) >>> 0, (R.eax >>> 0)); // 68d167: mov dword ptr [ecx + 6], eax
        R.eax = (R.m.u32(((R.esi + 0x6) | 0) >>> 0)) | 0; // 68d16a: mov eax, dword ptr [esi + 6]
        R.ecx = (R.m.u32(((R.eax + 0x6) | 0) >>> 0)) | 0; // 68d16d: mov ecx, dword ptr [eax + 6]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 68d170: test ecx, ecx
        if (!R.zf) { pc = 0x68d188; continue; } // 68d172: jne 0x68d188
        pc = 0x68d174; continue;
      case 0x68d174:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 68d174: xor eax, eax
        R.esi = (R.pop()) | 0; // 68d176: pop esi
        R.ecx = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 68d177: mov ecx, dword ptr [esp + 4]
        /* fs */ // 68d17b: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 68d182: add esp, 0x10
        return R.eax; // 68d185: ret 8
      case 0x68d188:
        R.m.w32(((R.ecx + 0xa) | 0) >>> 0, (R.eax >>> 0)); // 68d188: mov dword ptr [ecx + 0xa], eax
        R.edx = (R.m.u32(((R.esi + 0x6) | 0) >>> 0)) | 0; // 68d18b: mov edx, dword ptr [esi + 6]
        R.eax = (R.m.u32(((R.edx + 0x6) | 0) >>> 0)) | 0; // 68d18e: mov eax, dword ptr [edx + 6]
        pc = 0x68d191; continue;
      case 0x68d191:
        R.m.w16(((R.esi) | 0) >>> 0, R.incdec(R.m.u16(((R.esi) | 0) >>> 0), 1, 16)); // 68d191: inc word ptr [esi]
        R.ecx = ((R.eax >>> 0)) | 0; // 68d194: mov ecx, eax
        R.m.w32(((R.esi + 0x6) | 0) >>> 0, (R.eax >>> 0)); // 68d196: mov dword ptr [esi + 6], eax
        R.esi = (R.pop()) | 0; // 68d199: pop esi
        R.eax = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 68d19a: mov eax, dword ptr [ecx]
        R.ecx = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 68d19c: mov ecx, dword ptr [esp + 4]
        /* fs */ // 68d1a0: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 68d1a7: add esp, 0x10
        return R.eax; // 68d1aa: ret 8
      default: throw new Error(`f_68d0d0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
