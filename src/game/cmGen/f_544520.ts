// 0x544520 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4cf5a0=1c, 4cf5f0=2tc
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x544520, 0x544529, 0x544531, 0x544546, 0x544560, 0x544571, 0x544577, 0x54457e]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]);
function f_544520_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 544520
        R.push((R.esi >>> 0)); // 544520: push esi
        R.esi = (R.m.u32(((R.esp + 0x8) | 0) >>> 0)) | 0; // 544521: mov esi, dword ptr [esp + 8]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 544525: test esi, esi
        if (R.zf) { pc = 7; continue; } // 544527: je 0x54457e
        pc = 1; continue;
      case 1: // 544529
        R.eax = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 544529: mov eax, dword ptr [esp + 0xc]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 54452d: test eax, eax
        if (!R.zf) { pc = 4; continue; } // 54452f: jne 0x544560
        pc = 2; continue;
      case 2: // 544531
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 544531: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 544537: push esi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 544538: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 54453d: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 54453f: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 7; continue; } // 544544: je 0x54457e
        pc = 3; continue;
      case 3: // 544546
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 544546: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 544549: mov edx, dword ptr [0xae23b4]
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 54454f: add edx, eax
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 544551: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 544554: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 544557: add ecx, eax
        R.eax = (((R.edx + R.ecx * 4) | 0)) | 0; // 544559: lea eax, [edx + ecx*4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 54455c: test eax, eax
        if (R.zf) { pc = 7; continue; } // 54455e: je 0x54457e
        pc = 4; continue;
      case 4: // 544560
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 544560: mov ecx, dword ptr [0xae1050]
        R.push((R.eax >>> 0)); // 544566: push eax
        R.push((R.esi >>> 0)); // 544567: push esi
        R.call(0x4cf5f0, { n: 2, thisEcx: true, calleeClean: true }); // 544568: call 0x4cf5f0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 54456d: test eax, eax
        if (R.zf) { pc = 7; continue; } // 54456f: je 0x54457e
        pc = 5; continue;
      case 5: // 544571
        R.logic(R.m.u8(((R.eax + 0x4e) | 0) >>> 0) & 0x9, 8); // 544571: test byte ptr [eax + 0x4e], 9
        if (R.zf) { pc = 7; continue; } // 544575: je 0x54457e
        pc = 6; continue;
      case 6: // 544577
        R.eax = (0x1) | 0; // 544577: mov eax, 1
        R.esi = (R.pop()) | 0; // 54457c: pop esi
        R.rv = R.ret(0); return -1; // 54457d: ret 
      case 7: // 54457e
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 54457e: xor eax, eax
        R.esi = (R.pop()) | 0; // 544580: pop esi
        R.rv = R.ret(0); return -1; // 544581: ret 
      default: return pc;
    }
  }
}
export function f_544520(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 8) throw new Error(`f_544520: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_544520_0(R, pc); break;
      default: throw new Error(`f_544520: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_544520: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_544520.shared = true;
