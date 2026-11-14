// 0x68d080 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 68d010=0t, 944c94=1
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x68d080, 0x68d08a, 0x68d08c, 0x68d098, 0x68d0a8, 0x68d0af, 0x68d0b1]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 0]);
function f_68d080_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 68d080
        R.push((R.esi >>> 0)); // 68d080: push esi
        R.esi = ((R.ecx >>> 0)) | 0; // 68d081: mov esi, ecx
        R.eax = (R.m.u32(((R.esi + 0x2) | 0) >>> 0)) | 0; // 68d083: mov eax, dword ptr [esi + 2]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 68d086: test eax, eax
        if (R.zf) { pc = 6; continue; } // 68d088: je 0x68d0b1
        pc = 1; continue;
      case 1: // 68d08a
        R.push((R.ebx >>> 0)); // 68d08a: push ebx
        R.push((R.edi >>> 0)); // 68d08b: push edi
        pc = 2; continue;
      case 2: // 68d08c
        R.eax = (R.m.u32(((R.esi + 0x2) | 0) >>> 0)) | 0; // 68d08c: mov eax, dword ptr [esi + 2]
        R.edi = ((R.eax >>> 0)) | 0; // 68d08f: mov edi, eax
        R.ebx = (R.m.u32(((R.eax + 0x6) | 0) >>> 0)) | 0; // 68d091: mov ebx, dword ptr [eax + 6]
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 68d094: test edi, edi
        if (R.zf) { pc = 4; continue; } // 68d096: je 0x68d0a8
        pc = 3; continue;
      case 3: // 68d098
        R.ecx = ((R.edi >>> 0)) | 0; // 68d098: mov ecx, edi
        R.call(0x68d010, { n: 0, thisEcx: true, calleeClean: false }); // 68d09a: call 0x68d010
        R.push((R.edi >>> 0)); // 68d09f: push edi
        R.call(0x944c94, { n: 1, thisEcx: false, calleeClean: false }); // 68d0a0: call 0x944c94
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 68d0a5: add esp, 4
        pc = 4; continue;
      case 4: // 68d0a8
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 68d0a8: test ebx, ebx
        R.m.w32(((R.esi + 0x2) | 0) >>> 0, (R.ebx >>> 0)); // 68d0aa: mov dword ptr [esi + 2], ebx
        if (!R.zf) { pc = 2; continue; } // 68d0ad: jne 0x68d08c
        pc = 5; continue;
      case 5: // 68d0af
        R.edi = (R.pop()) | 0; // 68d0af: pop edi
        R.ebx = (R.pop()) | 0; // 68d0b0: pop ebx
        pc = 6; continue;
      case 6: // 68d0b1
        R.m.w16(((R.esi) | 0) >>> 0, 0x0); // 68d0b1: mov word ptr [esi], 0
        R.m.w32(((R.esi + 0x2) | 0) >>> 0, 0x0); // 68d0b6: mov dword ptr [esi + 2], 0
        R.m.w32(((R.esi + 0x6) | 0) >>> 0, 0x0); // 68d0bd: mov dword ptr [esi + 6], 0
        R.m.w32(((R.esi + 0xa) | 0) >>> 0, 0x0); // 68d0c4: mov dword ptr [esi + 0xa], 0
        R.esi = (R.pop()) | 0; // 68d0cb: pop esi
        R.rv = R.ret(0); return -1; // 68d0cc: ret 
      default: return pc;
    }
  }
}
export function f_68d080(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 7) throw new Error(`f_68d080: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_68d080_0(R, pc); break;
      default: throw new Error(`f_68d080: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_68d080: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_68d080.shared = true;
