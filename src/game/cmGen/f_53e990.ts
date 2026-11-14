// 0x53e990 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4a7f20=2tc, 5e8290=9, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x53e990, 0x53e99e, 0x53ea0a, 0x53ea11, 0x53ea18, 0x53ea21, 0x53ea28, 0x53ea36, 0x53ea3f, 0x53ea46, 0x53ea54, 0x53ea5d, 0x53ea64, 0x53ea72, 0x53ea7b, 0x53ea86, 0x53ea97, 0x53ea9e]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
function f_53e990_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 53e990
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 53e990: mov eax, dword ptr [esp + 4]
        R.esp = (R.sub((R.esp >>> 0), 0x200, 32)) | 0; // 53e994: sub esp, 0x200
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 53e99a: test eax, eax
        if (!R.zf) { pc = 2; continue; } // 53e99c: jne 0x53ea0a
        pc = 1; continue;
      case 1: // 53e99e
        R.eax = (((R.esp) | 0)) | 0; // 53e99e: lea eax, [esp]
        R.ecx = (((R.esp + 0x100) | 0)) | 0; // 53e9a2: lea ecx, [esp + 0x100]
        R.push((R.eax >>> 0)); // 53e9a9: push eax
        R.push((R.ecx >>> 0)); // 53e9aa: push ecx
        R.push(0x0); // 53e9ab: push 0
        R.push(0x0); // 53e9ad: push 0
        R.push(0x9b5ac8); // 53e9af: push 0x9b5ac8
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 53e9b4: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 53e9b9: add esp, 0x14
        R.edx = (((R.esp) | 0)) | 0; // 53e9bc: lea edx, [esp]
        R.eax = (((R.esp + 0x100) | 0)) | 0; // 53e9c0: lea eax, [esp + 0x100]
        R.push(0x3d90); // 53e9c7: push 0x3d90
        R.push((R.edx >>> 0)); // 53e9cc: push edx
        R.push((R.eax >>> 0)); // 53e9cd: push eax
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 53e9ce: call 0x90d130
        R.push((R.eax >>> 0)); // 53e9d3: push eax
        R.push(0x9870e8); // 53e9d4: push 0x9870e8
        R.push(0xae24d0); // 53e9d9: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 53e9de: call 0x944c9f
        R.push(0x0); // 53e9e3: push 0
        R.push(0xae24d0); // 53e9e5: push 0xae24d0
        R.push(0x9870e0); // 53e9ea: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 53e9ef: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 53e9f4: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 53e9f7: mov dword ptr [0xb67a34], 0
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53ea01: xor eax, eax
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53ea03: add esp, 0x200
        R.rv = R.ret(0); return -1; // 53ea09: ret 
      case 2: // 53ea0a
        R.ecx = (R.m.u32(((R.eax + 0x61) | 0) >>> 0)) | 0; // 53ea0a: mov ecx, dword ptr [eax + 0x61]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 53ea0d: test ecx, ecx
        if (!R.zf) { pc = 5; continue; } // 53ea0f: jne 0x53ea21
        pc = 3; continue;
      case 3: // 53ea11
        R.ecx = (R.m.u32(((R.eax + 0x69) | 0) >>> 0)) | 0; // 53ea11: mov ecx, dword ptr [eax + 0x69]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 53ea14: test ecx, ecx
        if (!R.zf) { pc = 5; continue; } // 53ea16: jne 0x53ea21
        pc = 4; continue;
      case 4: // 53ea18
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53ea18: xor eax, eax
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53ea1a: add esp, 0x200
        R.rv = R.ret(0); return -1; // 53ea20: ret 
      case 5: // 53ea21
        R.ecx = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 53ea21: mov ecx, dword ptr [eax + 4]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 53ea24: test ecx, ecx
        if (R.zf) { pc = 8; continue; } // 53ea26: je 0x53ea3f
        pc = 6; continue;
      case 6: // 53ea28
        R.ecx = (R.m.u32(((R.ecx + 0x33) | 0) >>> 0)) | 0; // 53ea28: mov ecx, dword ptr [ecx + 0x33]
        R.edx = (R.m.u32(((R.esp + 0x208) | 0) >>> 0)) | 0; // 53ea2b: mov edx, dword ptr [esp + 0x208]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 53ea32: cmp ecx, edx
        if (R.zf) { pc = 8; continue; } // 53ea34: je 0x53ea3f
        pc = 7; continue;
      default: return pc;
    }
  }
}
function f_53e990_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 7: // 53ea36
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53ea36: xor eax, eax
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53ea38: add esp, 0x200
        R.rv = R.ret(0); return -1; // 53ea3e: ret 
      case 8: // 53ea3f
        R.ecx = (R.m.u32(((R.eax + 0x8) | 0) >>> 0)) | 0; // 53ea3f: mov ecx, dword ptr [eax + 8]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 53ea42: test ecx, ecx
        if (R.zf) { pc = 11; continue; } // 53ea44: je 0x53ea5d
        pc = 9; continue;
      case 9: // 53ea46
        R.edx = (R.m.u32(((R.ecx + 0x33) | 0) >>> 0)) | 0; // 53ea46: mov edx, dword ptr [ecx + 0x33]
        R.ecx = (R.m.u32(((R.esp + 0x20c) | 0) >>> 0)) | 0; // 53ea49: mov ecx, dword ptr [esp + 0x20c]
        R.sub((R.edx >>> 0), (R.ecx >>> 0), 32); // 53ea50: cmp edx, ecx
        if (R.zf) { pc = 11; continue; } // 53ea52: je 0x53ea5d
        pc = 10; continue;
      case 10: // 53ea54
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53ea54: xor eax, eax
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53ea56: add esp, 0x200
        R.rv = R.ret(0); return -1; // 53ea5c: ret 
      case 11: // 53ea5d
        R.ecx = (R.m.u32(((R.eax + 0xc) | 0) >>> 0)) | 0; // 53ea5d: mov ecx, dword ptr [eax + 0xc]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 53ea60: test ecx, ecx
        if (R.zf) { pc = 14; continue; } // 53ea62: je 0x53ea7b
        pc = 12; continue;
      case 12: // 53ea64
        R.ecx = (R.m.u32(((R.ecx + 0x33) | 0) >>> 0)) | 0; // 53ea64: mov ecx, dword ptr [ecx + 0x33]
        R.edx = (R.m.u32(((R.esp + 0x210) | 0) >>> 0)) | 0; // 53ea67: mov edx, dword ptr [esp + 0x210]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 53ea6e: cmp ecx, edx
        if (R.zf) { pc = 14; continue; } // 53ea70: je 0x53ea7b
        pc = 13; continue;
      case 13: // 53ea72
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53ea72: xor eax, eax
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53ea74: add esp, 0x200
        R.rv = R.ret(0); return -1; // 53ea7a: ret 
      case 14: // 53ea7b
        R.ecx = (R.m.u32(((R.esp + 0x214) | 0) >>> 0)) | 0; // 53ea7b: mov ecx, dword ptr [esp + 0x214]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 53ea82: test ecx, ecx
        if (R.zf) { pc = 17; continue; } // 53ea84: je 0x53ea9e
        pc = 15; continue;
      case 15: // 53ea86
        R.edx = (R.m.u32(((R.eax + 0x14) | 0) >>> 0)) | 0; // 53ea86: mov edx, dword ptr [eax + 0x14]
        R.eax = (R.m.u32(((R.eax + 0x10) | 0) >>> 0)) | 0; // 53ea89: mov eax, dword ptr [eax + 0x10]
        R.push((R.edx >>> 0)); // 53ea8c: push edx
        R.push((R.eax >>> 0)); // 53ea8d: push eax
        R.call(0x4a7f20, { n: 2, thisEcx: true, calleeClean: true }); // 53ea8e: call 0x4a7f20
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 53ea93: test eax, eax
        if (!R.zf) { pc = 17; continue; } // 53ea95: jne 0x53ea9e
        pc = 16; continue;
      case 16: // 53ea97
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53ea97: add esp, 0x200
        R.rv = R.ret(0); return -1; // 53ea9d: ret 
      case 17: // 53ea9e
        R.eax = (0x1) | 0; // 53ea9e: mov eax, 1
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53eaa3: add esp, 0x200
        R.rv = R.ret(0); return -1; // 53eaa9: ret 
      default: return pc;
    }
  }
}
export function f_53e990(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 18) throw new Error(`f_53e990: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_53e990_0(R, pc); break;
      case 1: np = f_53e990_1(R, pc); break;
      default: throw new Error(`f_53e990: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_53e990: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_53e990.shared = true;
