// 0x544590 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4cf5a0=1c, 4cf5f0=2tc
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x544590, 0x544599, 0x5445a1, 0x5445b6, 0x5445d0, 0x5445e1, 0x5445e7, 0x5445ee]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]);
function f_544590_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 544590
        R.push((R.esi >>> 0)); // 544590: push esi
        R.esi = (R.m.u32(((R.esp + 0x8) | 0) >>> 0)) | 0; // 544591: mov esi, dword ptr [esp + 8]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 544595: test esi, esi
        if (R.zf) { pc = 7; continue; } // 544597: je 0x5445ee
        pc = 1; continue;
      case 1: // 544599
        R.eax = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 544599: mov eax, dword ptr [esp + 0xc]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 54459d: test eax, eax
        if (!R.zf) { pc = 4; continue; } // 54459f: jne 0x5445d0
        pc = 2; continue;
      case 2: // 5445a1
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 5445a1: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 5445a7: push esi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 5445a8: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5445ad: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 5445af: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 7; continue; } // 5445b4: je 0x5445ee
        pc = 3; continue;
      case 3: // 5445b6
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 5445b6: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 5445b9: mov edx, dword ptr [0xae23b4]
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 5445bf: add edx, eax
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 5445c1: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 5445c4: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 5445c7: add ecx, eax
        R.eax = (((R.edx + R.ecx * 4) | 0)) | 0; // 5445c9: lea eax, [edx + ecx*4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5445cc: test eax, eax
        if (R.zf) { pc = 7; continue; } // 5445ce: je 0x5445ee
        pc = 4; continue;
      case 4: // 5445d0
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 5445d0: mov ecx, dword ptr [0xae1050]
        R.push((R.eax >>> 0)); // 5445d6: push eax
        R.push((R.esi >>> 0)); // 5445d7: push esi
        R.call(0x4cf5f0, { n: 2, thisEcx: true, calleeClean: true }); // 5445d8: call 0x4cf5f0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5445dd: test eax, eax
        if (R.zf) { pc = 7; continue; } // 5445df: je 0x5445ee
        pc = 5; continue;
      case 5: // 5445e1
        R.logic(R.m.u8(((R.eax + 0x4e) | 0) >>> 0) & 0x2, 8); // 5445e1: test byte ptr [eax + 0x4e], 2
        if (R.zf) { pc = 7; continue; } // 5445e5: je 0x5445ee
        pc = 6; continue;
      case 6: // 5445e7
        R.eax = (0x1) | 0; // 5445e7: mov eax, 1
        R.esi = (R.pop()) | 0; // 5445ec: pop esi
        R.rv = R.ret(0); return -1; // 5445ed: ret 
      case 7: // 5445ee
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 5445ee: xor eax, eax
        R.esi = (R.pop()) | 0; // 5445f0: pop esi
        R.rv = R.ret(0); return -1; // 5445f1: ret 
      default: return pc;
    }
  }
}
export function f_544590(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 8) throw new Error(`f_544590: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_544590_0(R, pc); break;
      default: throw new Error(`f_544590: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_544590: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_544590.shared = true;
