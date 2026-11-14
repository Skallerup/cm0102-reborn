// 0x7e4920 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 417c10=2tc, 5e8290=9, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_7e4920(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x7e4920;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x7e4920:
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 7e4920: mov eax, dword ptr [esp + 4]
        R.esp = (R.sub((R.esp >>> 0), 0x208, 32)) | 0; // 7e4924: sub esp, 0x208
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 7e492a: test eax, eax
        if (!R.zf) { pc = 0x7e4960; continue; } // 7e492c: jne 0x7e4960
        pc = 0x7e492e; continue;
      case 0x7e492e:
        R.eax = (((R.esp + 0x8) | 0)) | 0; // 7e492e: lea eax, [esp + 8]
        R.ecx = (((R.esp + 0x108) | 0)) | 0; // 7e4932: lea ecx, [esp + 0x108]
        R.push((R.eax >>> 0)); // 7e4939: push eax
        R.push((R.ecx >>> 0)); // 7e493a: push ecx
        R.push(0x0); // 7e493b: push 0
        R.push(0x0); // 7e493d: push 0
        R.push(0xa7a088); // 7e493f: push 0xa7a088
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 7e4944: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 7e4949: add esp, 0x14
        R.edx = (((R.esp + 0x8) | 0)) | 0; // 7e494c: lea edx, [esp + 8]
        R.eax = (((R.esp + 0x108) | 0)) | 0; // 7e4950: lea eax, [esp + 0x108]
        R.push(0x80); // 7e4957: push 0x80
        R.push((R.edx >>> 0)); // 7e495c: push edx
        R.push((R.eax >>> 0)); // 7e495d: push eax
        pc = 0x7e499b; continue; // 7e495e: jmp 0x7e499b
      case 0x7e4960:
        R.ecx = (R.m.u32(((R.esp + 0x210) | 0) >>> 0)) | 0; // 7e4960: mov ecx, dword ptr [esp + 0x210]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 7e4967: test ecx, ecx
        if (!R.zf) { pc = 0x7e49d7; continue; } // 7e4969: jne 0x7e49d7
        pc = 0x7e496b; continue;
      case 0x7e496b:
        R.ecx = (((R.esp + 0x108) | 0)) | 0; // 7e496b: lea ecx, [esp + 0x108]
        R.edx = (((R.esp + 0x8) | 0)) | 0; // 7e4972: lea edx, [esp + 8]
        R.push((R.ecx >>> 0)); // 7e4976: push ecx
        R.push((R.edx >>> 0)); // 7e4977: push edx
        R.push(0x0); // 7e4978: push 0
        R.push(0x0); // 7e497a: push 0
        R.push(0xa7a088); // 7e497c: push 0xa7a088
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 7e4981: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 7e4986: add esp, 0x14
        R.eax = (((R.esp + 0x108) | 0)) | 0; // 7e4989: lea eax, [esp + 0x108]
        R.ecx = (((R.esp + 0x8) | 0)) | 0; // 7e4990: lea ecx, [esp + 8]
        R.push(0x88); // 7e4994: push 0x88
        R.push((R.eax >>> 0)); // 7e4999: push eax
        R.push((R.ecx >>> 0)); // 7e499a: push ecx
        pc = 0x7e499b; continue;
      case 0x7e499b:
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 7e499b: call 0x90d130
        R.push((R.eax >>> 0)); // 7e49a0: push eax
        R.push(0x9870e8); // 7e49a1: push 0x9870e8
        R.push(0xae24d0); // 7e49a6: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 7e49ab: call 0x944c9f
        R.push(0x0); // 7e49b0: push 0
        R.push(0xae24d0); // 7e49b2: push 0xae24d0
        R.push(0x9870e0); // 7e49b7: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 7e49bc: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 7e49c1: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 7e49c4: mov dword ptr [0xb67a34], 0
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 7e49ce: xor eax, eax
        R.esp = (R.add((R.esp >>> 0), 0x208, 32)) | 0; // 7e49d0: add esp, 0x208
        return R.eax; // 7e49d6: ret 
      case 0x7e49d7:
        R.edx = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 7e49d7: mov edx, dword ptr [eax + 4]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 7e49da: test edx, edx
        if (R.zf) { pc = 0x7e49e3; continue; } // 7e49dc: je 0x7e49e3
        pc = 0x7e49de; continue;
      case 0x7e49de:
        R.edx = (R.m.u32(((R.edx + 0x33) | 0) >>> 0)) | 0; // 7e49de: mov edx, dword ptr [edx + 0x33]
        pc = 0x7e49e6; continue; // 7e49e1: jmp 0x7e49e6
      case 0x7e49e3:
        R.edx = (R.logic((R.edx >>> 0) | 0xffffffff, 32)) | 0; // 7e49e3: or edx, 0xffffffff
        pc = 0x7e49e6; continue;
      case 0x7e49e6:
        R.m.w32(((R.ecx) | 0) >>> 0, (R.edx >>> 0)); // 7e49e6: mov dword ptr [ecx], edx
        R.edx = (R.m.u32(((R.eax + 0x8) | 0) >>> 0)) | 0; // 7e49e8: mov edx, dword ptr [eax + 8]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 7e49eb: test edx, edx
        if (R.zf) { pc = 0x7e49f4; continue; } // 7e49ed: je 0x7e49f4
        pc = 0x7e49ef; continue;
      case 0x7e49ef:
        R.edx = (R.m.u32(((R.edx + 0x33) | 0) >>> 0)) | 0; // 7e49ef: mov edx, dword ptr [edx + 0x33]
        pc = 0x7e49f7; continue; // 7e49f2: jmp 0x7e49f7
      case 0x7e49f4:
        R.edx = (R.logic((R.edx >>> 0) | 0xffffffff, 32)) | 0; // 7e49f4: or edx, 0xffffffff
        pc = 0x7e49f7; continue;
      case 0x7e49f7:
        R.m.w32(((R.ecx + 0x4) | 0) >>> 0, (R.edx >>> 0)); // 7e49f7: mov dword ptr [ecx + 4], edx
        R.edx = (R.m.u32(((R.eax + 0xc) | 0) >>> 0)) | 0; // 7e49fa: mov edx, dword ptr [eax + 0xc]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 7e49fd: test edx, edx
        if (R.zf) { pc = 0x7e4a06; continue; } // 7e49ff: je 0x7e4a06
        pc = 0x7e4a01; continue;
      case 0x7e4a01:
        R.edx = (R.m.u32(((R.edx + 0x33) | 0) >>> 0)) | 0; // 7e4a01: mov edx, dword ptr [edx + 0x33]
        pc = 0x7e4a09; continue; // 7e4a04: jmp 0x7e4a09
      case 0x7e4a06:
        R.edx = (R.logic((R.edx >>> 0) | 0xffffffff, 32)) | 0; // 7e4a06: or edx, 0xffffffff
        pc = 0x7e4a09; continue;
      case 0x7e4a09:
        R.m.w32(((R.ecx + 0x8) | 0) >>> 0, (R.edx >>> 0)); // 7e4a09: mov dword ptr [ecx + 8], edx
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 7e4a0c: mov edx, dword ptr [eax]
        R.eax = (R.add((R.eax >>> 0), 0x10, 32)) | 0; // 7e4a0e: add eax, 0x10
        R.m.w32(((R.ecx + 0xc) | 0) >>> 0, (R.edx >>> 0)); // 7e4a11: mov dword ptr [ecx + 0xc], edx
        R.push((R.eax >>> 0)); // 7e4a14: push eax
        R.eax = (((R.esp + 0x4) | 0)) | 0; // 7e4a15: lea eax, [esp + 4]
        R.push((R.eax >>> 0)); // 7e4a19: push eax
        R.ecx = (R.add((R.ecx >>> 0), 0x10, 32)) | 0; // 7e4a1a: add ecx, 0x10
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 7e4a1d: call 0x417c10
        R.eax = (0x1) | 0; // 7e4a22: mov eax, 1
        R.esp = (R.add((R.esp >>> 0), 0x208, 32)) | 0; // 7e4a27: add esp, 0x208
        return R.eax; // 7e4a2d: ret 
      default: throw new Error(`f_7e4920: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
