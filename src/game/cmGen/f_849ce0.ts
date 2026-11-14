// 0x849ce0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_849ce0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x849ce0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x849ce0:
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 849ce0: mov eax, dword ptr [esp + 4]
        R.edx = (R.m.u32(((R.ecx + 0xdc) | 0) >>> 0)) | 0; // 849ce4: mov edx, dword ptr [ecx + 0xdc]
        R.push((R.ebx >>> 0)); // 849cea: push ebx
        R.ebx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 849ceb: mov ebx, dword ptr [esp + 0x10]
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 849cef: mov eax, dword ptr [eax]
        R.push((R.ebp >>> 0)); // 849cf1: push ebp
        R.push((R.esi >>> 0)); // 849cf2: push esi
        R.push((R.edi >>> 0)); // 849cf3: push edi
        R.eax = (((R.eax + R.eax * 8) | 0)) | 0; // 849cf4: lea eax, [eax + eax*8]
        R.edi = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 849cf7: mov edi, dword ptr [esp + 0x20]
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 849cfb: add eax, edx
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) ^ ((R.ecx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 849cfd: xor cl, cl
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 849cff: mov edx, dword ptr [eax]
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 849d01: mov eax, dword ptr [esp + 0x18]
        R.esi = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 849d05: mov esi, dword ptr [eax]
        pc = 0x849d07; continue;
      case 0x849d07:
        R.eax = (((((R.ecx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 849d07: movsx eax, cl
        R.ebp = (((R.eax + R.eax * 8) | 0)) | 0; // 849d0a: lea ebp, [eax + eax*8]
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 849d0d: add eax, edx
        R.eax = (((R.eax + R.ebp * 4) | 0)) | 0; // 849d0f: lea eax, [eax + ebp*4]
        R.sub(R.m.u32(((R.eax + 0xf) | 0) >>> 0), (R.esi >>> 0), 32); // 849d12: cmp dword ptr [eax + 0xf], esi
        if (R.zf) { pc = 0x849d20; continue; } // 849d15: je 0x849d20
        pc = 0x849d17; continue;
      case 0x849d17:
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 849d17: test edi, edi
        if (R.zf) { pc = 0x849d30; continue; } // 849d19: je 0x849d30
        pc = 0x849d1b; continue;
      case 0x849d1b:
        R.sub(R.m.u32(((R.eax + 0x13) | 0) >>> 0), (R.esi >>> 0), 32); // 849d1b: cmp dword ptr [eax + 0x13], esi
        if (!R.zf) { pc = 0x849d30; continue; } // 849d1e: jne 0x849d30
        pc = 0x849d20; continue;
      case 0x849d20:
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 849d20: test ebx, ebx
        if (R.zf) { pc = 0x849d2b; continue; } // 849d22: je 0x849d2b
        pc = 0x849d24; continue;
      case 0x849d24:
        R.sub(R.m.u8(((R.eax) | 0) >>> 0), 0xb, 8); // 849d24: cmp byte ptr [eax], 0xb
        if (!R.zf) { pc = 0x849d40; continue; } // 849d27: jne 0x849d40
        pc = 0x849d29; continue;
      case 0x849d29:
        pc = 0x849d30; continue; // 849d29: jmp 0x849d30
      case 0x849d2b:
        R.sub(R.m.u8(((R.eax) | 0) >>> 0), 0xb, 8); // 849d2b: cmp byte ptr [eax], 0xb
        if (R.zf) { pc = 0x849d40; continue; } // 849d2e: je 0x849d40
        pc = 0x849d30; continue;
      case 0x849d30:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.incdec(((R.ecx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 849d30: inc cl
        R.sub(((R.ecx >>> 0) & 0xff), 0x28, 8); // 849d32: cmp cl, 0x28
        if (R.cL) { pc = 0x849d07; continue; } // 849d35: jl 0x849d07
        pc = 0x849d37; continue;
      case 0x849d37:
        R.edi = (R.pop()) | 0; // 849d37: pop edi
        R.esi = (R.pop()) | 0; // 849d38: pop esi
        R.ebp = (R.pop()) | 0; // 849d39: pop ebp
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 849d3a: xor eax, eax
        R.ebx = (R.pop()) | 0; // 849d3c: pop ebx
        return R.ret(4); // 849d3d: ret 0x10
      case 0x849d40:
        R.eax = (((((R.ecx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 849d40: movsx eax, cl
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 849d43: add edx, eax
        R.edi = (R.pop()) | 0; // 849d45: pop edi
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 849d46: lea ecx, [eax + eax*8]
        R.esi = (R.pop()) | 0; // 849d49: pop esi
        R.ebp = (R.pop()) | 0; // 849d4a: pop ebp
        R.ebx = (R.pop()) | 0; // 849d4b: pop ebx
        R.eax = (((R.edx + R.ecx * 4) | 0)) | 0; // 849d4c: lea eax, [edx + ecx*4]
        return R.ret(4); // 849d4f: ret 0x10
      default: throw new Error(`f_849ce0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
