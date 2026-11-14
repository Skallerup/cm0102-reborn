// 0x600e90 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x600e90, 0x600e9c, 0x600ea1, 0x600eab, 0x600ead, 0x600ebb, 0x600ec2, 0x600ec6, 0x600ed3, 0x600ed5, 0x600edc]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
function f_600e90_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 600e90
        R.push((R.ebx >>> 0)); // 600e90: push ebx
        R.push((R.esi >>> 0)); // 600e91: push esi
        R.esi = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 600e92: mov esi, dword ptr [esp + 0xc]
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 600e96: xor eax, eax
        R.push((R.edi >>> 0)); // 600e98: push edi
        R.ebx = ((R.ebx & 0xffffff00) | (((R.logic(((R.ebx >>> 0) & 0xff) | 0xff, 8)) & 0xff) << 0)) | 0; // 600e99: or bl, 0xff
        pc = 1; continue;
      case 1: // 600e9c
        R.sub(((R.ebx >>> 0) & 0xff), 0xff, 8); // 600e9c: cmp bl, 0xff
        if (!R.zf) { pc = 4; continue; } // 600e9f: jne 0x600ead
        pc = 2; continue;
      case 2: // 600ea1
        R.eax = (R.m.u32(((R.esi + 0xd3) | 0) >>> 0)) | 0; // 600ea1: mov eax, dword ptr [esi + 0xd3]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 600ea7: test eax, eax
        if (!R.zf) { pc = 10; continue; } // 600ea9: jne 0x600edc
        pc = 3; continue;
      case 3: // 600eab
        pc = 9; continue; // 600eab: jmp 0x600ed5
      case 4: // 600ead
        R.ecx = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 600ead: movsx ecx, bl
        R.ecx = (R.m.u32(((R.esi + R.ecx * 4 + 0x19f) | 0) >>> 0)) | 0; // 600eb0: mov ecx, dword ptr [esi + ecx*4 + 0x19f]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 600eb7: test ecx, ecx
        if (R.zf) { pc = 9; continue; } // 600eb9: je 0x600ed5
        pc = 5; continue;
      case 5: // 600ebb
        R.edx = (R.m.u32(((R.ecx + 0x69) | 0) >>> 0)) | 0; // 600ebb: mov edx, dword ptr [ecx + 0x69]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 600ebe: test edx, edx
        if (R.zf) { pc = 9; continue; } // 600ec0: je 0x600ed5
        pc = 6; continue;
      case 6: // 600ec2
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 600ec2: test eax, eax
        if (R.zf) { pc = 8; continue; } // 600ec4: je 0x600ed3
        pc = 7; continue;
      case 7: // 600ec6
        R.edi = (R.m.u32(((R.eax + 0x69) | 0) >>> 0)) | 0; // 600ec6: mov edi, dword ptr [eax + 0x69]
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.edx + 0xa) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 600ec9: mov dx, word ptr [edx + 0xa]
        R.sub(((R.edx >>> 0) & 0xffff), R.m.u16(((R.edi + 0xa) | 0) >>> 0), 16); // 600ecd: cmp dx, word ptr [edi + 0xa]
        if (R.cLE) { pc = 9; continue; } // 600ed1: jle 0x600ed5
        pc = 8; continue;
      case 8: // 600ed3
        R.eax = ((R.ecx >>> 0)) | 0; // 600ed3: mov eax, ecx
        pc = 9; continue;
      case 9: // 600ed5
        R.ebx = ((R.ebx & 0xffffff00) | (((R.incdec(((R.ebx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 600ed5: inc bl
        R.sub(((R.ebx >>> 0) & 0xff), 0x5, 8); // 600ed7: cmp bl, 5
        if (R.cL) { pc = 1; continue; } // 600eda: jl 0x600e9c
        pc = 10; continue;
      case 10: // 600edc
        R.edi = (R.pop()) | 0; // 600edc: pop edi
        R.esi = (R.pop()) | 0; // 600edd: pop esi
        R.ebx = (R.pop()) | 0; // 600ede: pop ebx
        R.rv = R.ret(0); return -1; // 600edf: ret 
      default: return pc;
    }
  }
}
export function f_600e90(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 11) throw new Error(`f_600e90: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_600e90_0(R, pc); break;
      default: throw new Error(`f_600e90: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_600e90: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_600e90.shared = true;
