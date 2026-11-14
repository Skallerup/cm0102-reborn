// 0x7c6d40 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x7c6d40, 0x7c6d49, 0x7c6d4e, 0x7c6d56, 0x7c6d5d, 0x7c6d65, 0x7c6d6d, 0x7c6d74, 0x7c6d7a, 0x7c6d7e]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
function f_7c6d40_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 7c6d40
        R.edx = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 7c6d40: mov edx, dword ptr [esp + 4]
        R.push((R.esi >>> 0)); // 7c6d44: push esi
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 7c6d45: test edx, edx
        if (!R.zf) { pc = 2; continue; } // 7c6d47: jne 0x7c6d4e
        pc = 1; continue;
      case 1: // 7c6d49
        R.eax = (R.logic((R.eax >>> 0) | 0xffffffff, 32)) | 0; // 7c6d49: or eax, 0xffffffff
        R.esi = (R.pop()) | 0; // 7c6d4c: pop esi
        R.rv = R.ret(0); return -1; // 7c6d4d: ret 
      case 2: // 7c6d4e
        R.esi = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 7c6d4e: mov esi, dword ptr [esp + 0xc]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 7c6d52: test esi, esi
        if (!R.zf) { pc = 4; continue; } // 7c6d54: jne 0x7c6d5d
        pc = 3; continue;
      case 3: // 7c6d56
        R.eax = (0x1) | 0; // 7c6d56: mov eax, 1
        R.esi = (R.pop()) | 0; // 7c6d5b: pop esi
        R.rv = R.ret(0); return -1; // 7c6d5c: ret 
      case 4: // 7c6d5d
        R.eax = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 7c6d5d: mov eax, dword ptr [edx]
        R.ecx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 7c6d5f: mov ecx, dword ptr [esi]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 7c6d61: cmp eax, ecx
        if (!R.zf) { pc = 8; continue; } // 7c6d63: jne 0x7c6d7a
        pc = 5; continue;
      case 5: // 7c6d65
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.edx + 0x4) | 0) >>> 0)) & 0xff) << 0)) | 0; // 7c6d65: mov dl, byte ptr [edx + 4]
        R.sub(((R.edx >>> 0) & 0xff), 0xff, 8); // 7c6d68: cmp dl, 0xff
        if (R.zf) { pc = 9; continue; } // 7c6d6b: je 0x7c6d7e
        pc = 6; continue;
      case 6: // 7c6d6d
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x4) | 0) >>> 0)) & 0xff) << 0)) | 0; // 7c6d6d: mov al, byte ptr [esi + 4]
        R.sub(((R.eax >>> 0) & 0xff), 0xff, 8); // 7c6d70: cmp al, 0xff
        if (R.zf) { pc = 9; continue; } // 7c6d72: je 0x7c6d7e
        pc = 7; continue;
      case 7: // 7c6d74
        R.ecx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 7c6d74: movsx ecx, al
        R.eax = (((((R.edx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 7c6d77: movsx eax, dl
        pc = 8; continue;
      case 8: // 7c6d7a
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 7c6d7a: sub eax, ecx
        R.esi = (R.pop()) | 0; // 7c6d7c: pop esi
        R.rv = R.ret(0); return -1; // 7c6d7d: ret 
      case 9: // 7c6d7e
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 7c6d7e: xor eax, eax
        R.esi = (R.pop()) | 0; // 7c6d80: pop esi
        R.rv = R.ret(0); return -1; // 7c6d81: ret 
      default: return pc;
    }
  }
}
export function f_7c6d40(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 10) throw new Error(`f_7c6d40: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_7c6d40_0(R, pc); break;
      default: throw new Error(`f_7c6d40: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_7c6d40: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_7c6d40.shared = true;
