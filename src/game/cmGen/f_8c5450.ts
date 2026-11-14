// 0x8c5450 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4cca30=1tc
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x8c5450, 0x8c5466, 0x8c5476, 0x8c547e, 0x8c5496, 0x8c54a0, 0x8c54b3]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 0]);
function f_8c5450_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 8c5450
        R.push((R.esi >>> 0)); // 8c5450: push esi
        R.push((R.edi >>> 0)); // 8c5451: push edi
        R.edi = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 8c5452: mov edi, dword ptr [esp + 0xc]
        R.esi = ((R.ecx >>> 0)) | 0; // 8c5456: mov esi, ecx
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 8c5458: mov eax, dword ptr [edi]
        R.ecx = (R.m.u32(((R.esi + 0x86e) | 0) >>> 0)) | 0; // 8c545a: mov ecx, dword ptr [esi + 0x86e]
        R.logic(R.m.u8(((R.ecx + R.eax * 8) | 0) >>> 0) & 0x40, 8); // 8c5460: test byte ptr [ecx + eax*8], 0x40
        if (R.zf) { pc = 6; continue; } // 8c5464: je 0x8c54b3
        pc = 1; continue;
      case 1: // 8c5466
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8c5466: mov ecx, dword ptr [0xae1050]
        R.push((R.eax >>> 0)); // 8c546c: push eax
        R.call(0x4cca30, { n: 1, thisEcx: true, calleeClean: true }); // 8c546d: call 0x4cca30
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c5472: test eax, eax
        if (R.zf) { pc = 5; continue; } // 8c5474: je 0x8c54a0
        pc = 2; continue;
      case 2: // 8c5476
        R.ecx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 8c5476: mov ecx, dword ptr [esp + 0x10]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 8c547a: test ecx, ecx
        if (R.zf) { pc = 4; continue; } // 8c547c: je 0x8c5496
        pc = 3; continue;
      case 3: // 8c547e
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 8c547e: mov eax, dword ptr [eax + 4]
        R.esi = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 8c5481: mov esi, dword ptr [0xae23b4]
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 8c5487: lea edx, [eax + eax*8]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 8c548a: shl edx, 4
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8c548d: add edx, eax
        R.esi = (R.add((R.esi >>> 0), (R.eax >>> 0), 32)) | 0; // 8c548f: add esi, eax
        R.eax = (((R.esi + R.edx * 4) | 0)) | 0; // 8c5491: lea eax, [esi + edx*4]
        R.m.w32(((R.ecx) | 0) >>> 0, (R.eax >>> 0)); // 8c5494: mov dword ptr [ecx], eax
        pc = 4; continue;
      case 4: // 8c5496
        R.edi = (R.pop()) | 0; // 8c5496: pop edi
        R.eax = (0x1) | 0; // 8c5497: mov eax, 1
        R.esi = (R.pop()) | 0; // 8c549c: pop esi
        R.rv = R.ret(2); return -1; // 8c549d: ret 8
      case 5: // 8c54a0
        R.ecx = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 8c54a0: mov ecx, dword ptr [edi]
        R.edx = (R.m.u32(((R.esi + 0x86e) | 0) >>> 0)) | 0; // 8c54a2: mov edx, dword ptr [esi + 0x86e]
        R.eax = (((R.edx + R.ecx * 8) | 0)) | 0; // 8c54a8: lea eax, [edx + ecx*8]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.edx + R.ecx * 8) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8c54ab: mov cl, byte ptr [edx + ecx*8]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0xbf, 8)) & 0xff) << 0)) | 0; // 8c54ae: and cl, 0xbf
        R.m.w8(((R.eax) | 0) >>> 0, ((R.ecx >>> 0) & 0xff)); // 8c54b1: mov byte ptr [eax], cl
        pc = 6; continue;
      case 6: // 8c54b3
        R.edi = (R.pop()) | 0; // 8c54b3: pop edi
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8c54b4: xor eax, eax
        R.esi = (R.pop()) | 0; // 8c54b6: pop esi
        R.rv = R.ret(2); return -1; // 8c54b7: ret 8
      default: return pc;
    }
  }
}
export function f_8c5450(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 7) throw new Error(`f_8c5450: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_8c5450_0(R, pc); break;
      default: throw new Error(`f_8c5450: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_8c5450: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_8c5450.shared = true;
