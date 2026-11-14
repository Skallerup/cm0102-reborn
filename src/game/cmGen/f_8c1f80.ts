// 0x8c1f80 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 5e8290=9, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_8c1f80(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x8c1f80;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x8c1f80:
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 8c1f80: mov eax, dword ptr [esp + 4]
        R.esp = (R.sub((R.esp >>> 0), 0x200, 32)) | 0; // 8c1f84: sub esp, 0x200
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c1f8a: test eax, eax
        if (!R.cL) { pc = 0x8c1ffa; continue; } // 8c1f8c: jge 0x8c1ffa
        pc = 0x8c1f8e; continue;
      case 0x8c1f8e:
        R.eax = (((R.esp) | 0)) | 0; // 8c1f8e: lea eax, [esp]
        R.ecx = (((R.esp + 0x100) | 0)) | 0; // 8c1f92: lea ecx, [esp + 0x100]
        R.push((R.eax >>> 0)); // 8c1f99: push eax
        R.push((R.ecx >>> 0)); // 8c1f9a: push ecx
        R.push(0x0); // 8c1f9b: push 0
        R.push(0x0); // 8c1f9d: push 0
        R.push(0xa8d514); // 8c1f9f: push 0xa8d514
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 8c1fa4: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8c1fa9: add esp, 0x14
        R.edx = (((R.esp) | 0)) | 0; // 8c1fac: lea edx, [esp]
        R.eax = (((R.esp + 0x100) | 0)) | 0; // 8c1fb0: lea eax, [esp + 0x100]
        R.push(0xd91); // 8c1fb7: push 0xd91
        R.push((R.edx >>> 0)); // 8c1fbc: push edx
        R.push((R.eax >>> 0)); // 8c1fbd: push eax
        pc = 0x8c1fbe; continue;
      case 0x8c1fbe:
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 8c1fbe: call 0x90d130
        R.push((R.eax >>> 0)); // 8c1fc3: push eax
        R.push(0x9870e8); // 8c1fc4: push 0x9870e8
        R.push(0xae24d0); // 8c1fc9: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 8c1fce: call 0x944c9f
        R.push(0x0); // 8c1fd3: push 0
        R.push(0xae24d0); // 8c1fd5: push 0xae24d0
        R.push(0x9870e0); // 8c1fda: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 8c1fdf: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 8c1fe4: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 8c1fe7: mov dword ptr [0xb67a34], 0
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 8c1ff1: add esp, 0x200
        return R.eax; // 8c1ff7: ret 4
      case 0x8c1ffa:
        R.sub((R.eax >>> 0), R.m.u32(((R.ecx + 0x4) | 0) >>> 0), 32); // 8c1ffa: cmp eax, dword ptr [ecx + 4]
        if (R.cL) { pc = 0x8c2031; continue; } // 8c1ffd: jl 0x8c2031
        pc = 0x8c1fff; continue;
      case 0x8c1fff:
        R.ecx = (((R.esp + 0x100) | 0)) | 0; // 8c1fff: lea ecx, [esp + 0x100]
        R.edx = (((R.esp) | 0)) | 0; // 8c2006: lea edx, [esp]
        R.push((R.ecx >>> 0)); // 8c200a: push ecx
        R.push((R.edx >>> 0)); // 8c200b: push edx
        R.push(0x0); // 8c200c: push 0
        R.push(0x0); // 8c200e: push 0
        R.push(0xa8d514); // 8c2010: push 0xa8d514
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 8c2015: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8c201a: add esp, 0x14
        R.eax = (((R.esp + 0x100) | 0)) | 0; // 8c201d: lea eax, [esp + 0x100]
        R.ecx = (((R.esp) | 0)) | 0; // 8c2024: lea ecx, [esp]
        R.push(0xd96); // 8c2028: push 0xd96
        R.push((R.eax >>> 0)); // 8c202d: push eax
        R.push((R.ecx >>> 0)); // 8c202e: push ecx
        pc = 0x8c1fbe; continue; // 8c202f: jmp 0x8c1fbe
      case 0x8c2031:
        R.edx = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 8c2031: mov edx, dword ptr [ecx]
        R.eax = (R.m.u32(((R.edx + R.eax * 4) | 0) >>> 0)) | 0; // 8c2033: mov eax, dword ptr [edx + eax*4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c2036: test eax, eax
        if (R.zf) { pc = 0x8c204d; continue; } // 8c2038: je 0x8c204d
        pc = 0x8c203a; continue;
      case 0x8c203a:
        R.sub(R.m.u8(((R.eax + 0x1f) | 0) >>> 0), 0x1, 8); // 8c203a: cmp byte ptr [eax + 0x1f], 1
        if (R.zf) { pc = 0x8c204d; continue; } // 8c203e: je 0x8c204d
        pc = 0x8c2040; continue;
      case 0x8c2040:
        R.sub(R.m.u8(((R.eax + 0x2c) | 0) >>> 0), 0x6, 8); // 8c2040: cmp byte ptr [eax + 0x2c], 6
        R.ecx = ((R.ecx & 0xffffff00) | (((R.zf ? 1 : 0) & 0xff) << 0)) | 0; // 8c2044: sete cl
        R.ecx = (R.add((R.ecx >>> 0), 0x7, 32)) | 0; // 8c2047: add ecx, 7
        R.m.w8(((R.eax + 0x2c) | 0) >>> 0, ((R.ecx >>> 0) & 0xff)); // 8c204a: mov byte ptr [eax + 0x2c], cl
        pc = 0x8c204d; continue;
      case 0x8c204d:
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 8c204d: add esp, 0x200
        return R.eax; // 8c2053: ret 4
      default: throw new Error(`f_8c1f80: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
