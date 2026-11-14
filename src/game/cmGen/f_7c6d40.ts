// 0x7c6d40 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_7c6d40(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x7c6d40;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x7c6d40:
        R.edx = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 7c6d40: mov edx, dword ptr [esp + 4]
        R.push((R.esi >>> 0)); // 7c6d44: push esi
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 7c6d45: test edx, edx
        if (!R.zf) { pc = 0x7c6d4e; continue; } // 7c6d47: jne 0x7c6d4e
        pc = 0x7c6d49; continue;
      case 0x7c6d49:
        R.eax = (R.logic((R.eax >>> 0) | 0xffffffff, 32)) | 0; // 7c6d49: or eax, 0xffffffff
        R.esi = (R.pop()) | 0; // 7c6d4c: pop esi
        return R.ret(0); // 7c6d4d: ret 
      case 0x7c6d4e:
        R.esi = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 7c6d4e: mov esi, dword ptr [esp + 0xc]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 7c6d52: test esi, esi
        if (!R.zf) { pc = 0x7c6d5d; continue; } // 7c6d54: jne 0x7c6d5d
        pc = 0x7c6d56; continue;
      case 0x7c6d56:
        R.eax = (0x1) | 0; // 7c6d56: mov eax, 1
        R.esi = (R.pop()) | 0; // 7c6d5b: pop esi
        return R.ret(0); // 7c6d5c: ret 
      case 0x7c6d5d:
        R.eax = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 7c6d5d: mov eax, dword ptr [edx]
        R.ecx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 7c6d5f: mov ecx, dword ptr [esi]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 7c6d61: cmp eax, ecx
        if (!R.zf) { pc = 0x7c6d7a; continue; } // 7c6d63: jne 0x7c6d7a
        pc = 0x7c6d65; continue;
      case 0x7c6d65:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.edx + 0x4) | 0) >>> 0)) & 0xff) << 0)) | 0; // 7c6d65: mov dl, byte ptr [edx + 4]
        R.sub(((R.edx >>> 0) & 0xff), 0xff, 8); // 7c6d68: cmp dl, 0xff
        if (R.zf) { pc = 0x7c6d7e; continue; } // 7c6d6b: je 0x7c6d7e
        pc = 0x7c6d6d; continue;
      case 0x7c6d6d:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x4) | 0) >>> 0)) & 0xff) << 0)) | 0; // 7c6d6d: mov al, byte ptr [esi + 4]
        R.sub(((R.eax >>> 0) & 0xff), 0xff, 8); // 7c6d70: cmp al, 0xff
        if (R.zf) { pc = 0x7c6d7e; continue; } // 7c6d72: je 0x7c6d7e
        pc = 0x7c6d74; continue;
      case 0x7c6d74:
        R.ecx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 7c6d74: movsx ecx, al
        R.eax = (((((R.edx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 7c6d77: movsx eax, dl
        pc = 0x7c6d7a; continue;
      case 0x7c6d7a:
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 7c6d7a: sub eax, ecx
        R.esi = (R.pop()) | 0; // 7c6d7c: pop esi
        return R.ret(0); // 7c6d7d: ret 
      case 0x7c6d7e:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 7c6d7e: xor eax, eax
        R.esi = (R.pop()) | 0; // 7c6d80: pop esi
        return R.ret(0); // 7c6d81: ret 
      default: throw new Error(`f_7c6d40: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
