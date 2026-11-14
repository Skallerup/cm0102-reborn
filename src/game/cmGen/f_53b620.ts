// 0x53b620 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_53b620(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x53b620;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x53b620:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x4) | 0) >>> 0)) & 0xff) << 0)) | 0; // 53b620: mov al, byte ptr [esp + 4]
        R.sub(((R.eax >>> 0) & 0xff), 0xb, 8); // 53b624: cmp al, 0xb
        if (R.zf) { pc = 0x53b637; continue; } // 53b626: je 0x53b637
        pc = 0x53b628; continue;
      case 0x53b628:
        R.sub(((R.eax >>> 0) & 0xff), 0xc, 8); // 53b628: cmp al, 0xc
        if (R.zf) { pc = 0x53b637; continue; } // 53b62a: je 0x53b637
        pc = 0x53b62c; continue;
      case 0x53b62c:
        R.sub(((R.eax >>> 0) & 0xff), 0xd, 8); // 53b62c: cmp al, 0xd
        if (R.zf) { pc = 0x53b637; continue; } // 53b62e: je 0x53b637
        pc = 0x53b630; continue;
      case 0x53b630:
        R.sub(((R.eax >>> 0) & 0xff), 0xf, 8); // 53b630: cmp al, 0xf
        if (R.zf) { pc = 0x53b637; continue; } // 53b632: je 0x53b637
        pc = 0x53b634; continue;
      case 0x53b634:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53b634: xor eax, eax
        return R.ret(0); // 53b636: ret 
      case 0x53b637:
        R.eax = (0x1) | 0; // 53b637: mov eax, 1
        return R.ret(0); // 53b63c: ret 
      default: throw new Error(`f_53b620: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
