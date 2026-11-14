// 0x4cca30 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 68d1b0=0t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_4cca30(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x4cca30;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x4cca30:
        R.push((R.esi >>> 0)); // 4cca30: push esi
        R.esi = ((R.ecx >>> 0)) | 0; // 4cca31: mov esi, ecx
        R.push((R.edi >>> 0)); // 4cca33: push edi
        R.eax = (R.m.u32(((R.esi + 0x34) | 0) >>> 0)) | 0; // 4cca34: mov eax, dword ptr [esi + 0x34]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4cca37: test eax, eax
        if (R.zf) { pc = 0x4cca67; continue; } // 4cca39: je 0x4cca67
        pc = 0x4cca3b; continue;
      case 0x4cca3b:
        R.ecx = (R.m.u32(((R.eax + 0x2) | 0) >>> 0)) | 0; // 4cca3b: mov ecx, dword ptr [eax + 2]
        R.m.w32(((R.eax + 0xa) | 0) >>> 0, (R.ecx >>> 0)); // 4cca3e: mov dword ptr [eax + 0xa], ecx
        R.ecx = (R.m.u32(((R.esi + 0x34) | 0) >>> 0)) | 0; // 4cca41: mov ecx, dword ptr [esi + 0x34]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 4cca44: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4cca49: test eax, eax
        if (R.zf) { pc = 0x4cca67; continue; } // 4cca4b: je 0x4cca67
        pc = 0x4cca4d; continue;
      case 0x4cca4d:
        R.edi = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 4cca4d: mov edi, dword ptr [esp + 0xc]
        pc = 0x4cca51; continue;
      case 0x4cca51:
        R.sub(R.m.u32(((R.eax) | 0) >>> 0), (R.edi >>> 0), 32); // 4cca51: cmp dword ptr [eax], edi
        if (!R.zf) { pc = 0x4cca5b; continue; } // 4cca53: jne 0x4cca5b
        pc = 0x4cca55; continue;
      case 0x4cca55:
        R.sub(R.m.u8(((R.eax + 0x50) | 0) >>> 0), 0x2, 8); // 4cca55: cmp byte ptr [eax + 0x50], 2
        if (R.zf) { pc = 0x4cca69; continue; } // 4cca59: je 0x4cca69
        pc = 0x4cca5b; continue;
      case 0x4cca5b:
        R.ecx = (R.m.u32(((R.esi + 0x34) | 0) >>> 0)) | 0; // 4cca5b: mov ecx, dword ptr [esi + 0x34]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 4cca5e: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4cca63: test eax, eax
        if (!R.zf) { pc = 0x4cca51; continue; } // 4cca65: jne 0x4cca51
        pc = 0x4cca67; continue;
      case 0x4cca67:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 4cca67: xor eax, eax
        pc = 0x4cca69; continue;
      case 0x4cca69:
        R.edi = (R.pop()) | 0; // 4cca69: pop edi
        R.esi = (R.pop()) | 0; // 4cca6a: pop esi
        return R.ret(1); // 4cca6b: ret 4
      default: throw new Error(`f_4cca30: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
