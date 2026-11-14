// 0x53cb80 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 540a50=3, 5e8290=9, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_53cb80(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x53cb80;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x53cb80:
        R.ecx = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 53cb80: mov ecx, dword ptr [esp + 4]
        R.esp = (R.sub((R.esp >>> 0), 0x200, 32)) | 0; // 53cb84: sub esp, 0x200
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 53cb8a: test ecx, ecx
        if (!R.zf) { pc = 0x53cbfa; continue; } // 53cb8c: jne 0x53cbfa
        pc = 0x53cb8e; continue;
      case 0x53cb8e:
        R.eax = (((R.esp) | 0)) | 0; // 53cb8e: lea eax, [esp]
        R.ecx = (((R.esp + 0x100) | 0)) | 0; // 53cb92: lea ecx, [esp + 0x100]
        R.push((R.eax >>> 0)); // 53cb99: push eax
        R.push((R.ecx >>> 0)); // 53cb9a: push ecx
        R.push(0x0); // 53cb9b: push 0
        R.push(0x0); // 53cb9d: push 0
        R.push(0x9b5ac8); // 53cb9f: push 0x9b5ac8
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 53cba4: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 53cba9: add esp, 0x14
        R.edx = (((R.esp) | 0)) | 0; // 53cbac: lea edx, [esp]
        R.eax = (((R.esp + 0x100) | 0)) | 0; // 53cbb0: lea eax, [esp + 0x100]
        R.push(0x3973); // 53cbb7: push 0x3973
        R.push((R.edx >>> 0)); // 53cbbc: push edx
        R.push((R.eax >>> 0)); // 53cbbd: push eax
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 53cbbe: call 0x90d130
        R.push((R.eax >>> 0)); // 53cbc3: push eax
        R.push(0x9870e8); // 53cbc4: push 0x9870e8
        R.push(0xae24d0); // 53cbc9: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 53cbce: call 0x944c9f
        R.push(0x0); // 53cbd3: push 0
        R.push(0xae24d0); // 53cbd5: push 0xae24d0
        R.push(0x9870e0); // 53cbda: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 53cbdf: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 53cbe4: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 53cbe7: mov dword ptr [0xb67a34], 0
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53cbf1: xor eax, eax
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53cbf3: add esp, 0x200
        return R.ret(0); // 53cbf9: ret 
      case 0x53cbfa:
        R.eax = (R.m.u32(((R.ecx + 0xd3) | 0) >>> 0)) | 0; // 53cbfa: mov eax, dword ptr [ecx + 0xd3]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 53cc00: test eax, eax
        if (!R.zf) { pc = 0x53cc20; continue; } // 53cc02: jne 0x53cc20
        pc = 0x53cc04; continue;
      case 0x53cc04:
        R.push(0x1); // 53cc04: push 1
        R.push((R.eax >>> 0)); // 53cc06: push eax
        R.push((R.ecx >>> 0)); // 53cc07: push ecx
        R.call(0x540a50, { n: 3, thisEcx: false, calleeClean: false }); // 53cc08: call 0x540a50
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 53cc0d: add esp, 0xc
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 53cc10: test eax, eax
        if (R.zf) { pc = 0x53cc1e; continue; } // 53cc12: je 0x53cc1e
        pc = 0x53cc14; continue;
      case 0x53cc14:
        R.eax = (R.m.u32(((R.eax + 0xd3) | 0) >>> 0)) | 0; // 53cc14: mov eax, dword ptr [eax + 0xd3]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 53cc1a: test eax, eax
        if (!R.zf) { pc = 0x53cc20; continue; } // 53cc1c: jne 0x53cc20
        pc = 0x53cc1e; continue;
      case 0x53cc1e:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53cc1e: xor eax, eax
        pc = 0x53cc20; continue;
      case 0x53cc20:
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53cc20: add esp, 0x200
        return R.ret(0); // 53cc26: ret 
      default: throw new Error(`f_53cb80: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
