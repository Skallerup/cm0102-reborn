// 0x8c1870 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 68d1b0=0t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x8c1870, 0x8c188c, 0x8c1890, 0x8c1898, 0x8c18a3, 0x8c18aa]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0]);
function f_8c1870_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 8c1870
        R.eax = (R.m.u32(((R.ecx + 0x92e) | 0) >>> 0)) | 0; // 8c1870: mov eax, dword ptr [ecx + 0x92e]
        R.push((R.esi >>> 0)); // 8c1876: push esi
        R.esi = (((R.ecx + 0x92c) | 0)) | 0; // 8c1877: lea esi, [ecx + 0x92c]
        R.push((R.edi >>> 0)); // 8c187d: push edi
        R.ecx = ((R.esi >>> 0)) | 0; // 8c187e: mov ecx, esi
        R.m.w32(((R.esi + 0xa) | 0) >>> 0, (R.eax >>> 0)); // 8c1880: mov dword ptr [esi + 0xa], eax
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8c1883: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c1888: test eax, eax
        if (R.zf) { pc = 4; continue; } // 8c188a: je 0x8c18a3
        pc = 1; continue;
      case 1: // 8c188c
        R.edi = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 8c188c: mov edi, dword ptr [esp + 0xc]
        pc = 2; continue;
      case 2: // 8c1890
        R.ecx = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 8c1890: mov ecx, dword ptr [edi]
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8c1892: mov edx, dword ptr [eax]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 8c1894: cmp ecx, edx
        if (R.zf) { pc = 5; continue; } // 8c1896: je 0x8c18aa
        pc = 3; continue;
      case 3: // 8c1898
        R.ecx = ((R.esi >>> 0)) | 0; // 8c1898: mov ecx, esi
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8c189a: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c189f: test eax, eax
        if (!R.zf) { pc = 2; continue; } // 8c18a1: jne 0x8c1890
        pc = 4; continue;
      case 4: // 8c18a3
        R.edi = (R.pop()) | 0; // 8c18a3: pop edi
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8c18a4: xor eax, eax
        R.esi = (R.pop()) | 0; // 8c18a6: pop esi
        R.rv = R.ret(1); return -1; // 8c18a7: ret 4
      case 5: // 8c18aa
        R.edi = (R.pop()) | 0; // 8c18aa: pop edi
        R.eax = (0x1) | 0; // 8c18ab: mov eax, 1
        R.esi = (R.pop()) | 0; // 8c18b0: pop esi
        R.rv = R.ret(1); return -1; // 8c18b1: ret 4
      default: return pc;
    }
  }
}
export function f_8c1870(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 6) throw new Error(`f_8c1870: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_8c1870_0(R, pc); break;
      default: throw new Error(`f_8c1870: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_8c1870: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_8c1870.shared = true;
