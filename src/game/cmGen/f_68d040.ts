// 0x68d040 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 68d010=0t, 944c94=1
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x68d040, 0x68d04a, 0x68d04c, 0x68d058, 0x68d068, 0x68d06f, 0x68d071]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 0]);
function f_68d040_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 68d040
        R.push((R.esi >>> 0)); // 68d040: push esi
        R.esi = ((R.ecx >>> 0)) | 0; // 68d041: mov esi, ecx
        R.eax = (R.m.u32(((R.esi + 0x2) | 0) >>> 0)) | 0; // 68d043: mov eax, dword ptr [esi + 2]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 68d046: test eax, eax
        if (R.zf) { pc = 6; continue; } // 68d048: je 0x68d071
        pc = 1; continue;
      case 1: // 68d04a
        R.push((R.ebx >>> 0)); // 68d04a: push ebx
        R.push((R.edi >>> 0)); // 68d04b: push edi
        pc = 2; continue;
      case 2: // 68d04c
        R.eax = (R.m.u32(((R.esi + 0x2) | 0) >>> 0)) | 0; // 68d04c: mov eax, dword ptr [esi + 2]
        R.edi = ((R.eax >>> 0)) | 0; // 68d04f: mov edi, eax
        R.ebx = (R.m.u32(((R.eax + 0x6) | 0) >>> 0)) | 0; // 68d051: mov ebx, dword ptr [eax + 6]
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 68d054: test edi, edi
        if (R.zf) { pc = 4; continue; } // 68d056: je 0x68d068
        pc = 3; continue;
      case 3: // 68d058
        R.ecx = ((R.edi >>> 0)) | 0; // 68d058: mov ecx, edi
        R.call(0x68d010, { n: 0, thisEcx: true, calleeClean: false }); // 68d05a: call 0x68d010
        R.push((R.edi >>> 0)); // 68d05f: push edi
        R.call(0x944c94, { n: 1, thisEcx: false, calleeClean: false }); // 68d060: call 0x944c94
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 68d065: add esp, 4
        pc = 4; continue;
      case 4: // 68d068
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 68d068: test ebx, ebx
        R.m.w32(((R.esi + 0x2) | 0) >>> 0, (R.ebx >>> 0)); // 68d06a: mov dword ptr [esi + 2], ebx
        if (!R.zf) { pc = 2; continue; } // 68d06d: jne 0x68d04c
        pc = 5; continue;
      case 5: // 68d06f
        R.edi = (R.pop()) | 0; // 68d06f: pop edi
        R.ebx = (R.pop()) | 0; // 68d070: pop ebx
        pc = 6; continue;
      case 6: // 68d071
        R.esi = (R.pop()) | 0; // 68d071: pop esi
        R.rv = R.ret(0); return -1; // 68d072: ret 
      default: return pc;
    }
  }
}
export function f_68d040(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 7) throw new Error(`f_68d040: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_68d040_0(R, pc); break;
      default: throw new Error(`f_68d040: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_68d040: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_68d040.shared = true;
