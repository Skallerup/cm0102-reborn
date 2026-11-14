// 0x84b180 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 53d740=2, 8c7950=5tc
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_84b180(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x84b180;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x84b180:
        R.push((R.esi >>> 0)); // 84b180: push esi
        R.esi = (R.m.u32(((R.esp + 0x8) | 0) >>> 0)) | 0; // 84b181: mov esi, dword ptr [esp + 8]
        R.push((R.edi >>> 0)); // 84b185: push edi
        R.ecx = (R.m.u32(((R.esi + 0x1a) | 0) >>> 0)) | 0; // 84b186: mov ecx, dword ptr [esi + 0x1a]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 84b189: test ecx, ecx
        if (!R.zf) { pc = 0x84b194; continue; } // 84b18b: jne 0x84b194
        pc = 0x84b18d; continue;
      case 0x84b18d:
        R.edi = (R.pop()) | 0; // 84b18d: pop edi
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 84b18e: xor al, al
        R.esi = (R.pop()) | 0; // 84b190: pop esi
        return R.ret(3); // 84b191: ret 0xc
      case 0x84b194:
        R.edi = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 84b194: mov edi, dword ptr [esp + 0x14]
        R.eax = (R.m.u32(((R.edi + 0x53) | 0) >>> 0)) | 0; // 84b198: mov eax, dword ptr [edi + 0x53]
        R.sub(R.m.u8(((R.eax + 0x76) | 0) >>> 0), 0xe, 8); // 84b19b: cmp byte ptr [eax + 0x76], 0xe
        if (!R.zf) { pc = 0x84b1e8; continue; } // 84b19f: jne 0x84b1e8
        pc = 0x84b1a1; continue;
      case 0x84b1a1:
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 84b1a1: cmp ecx, eax
        if (R.zf) { pc = 0x84b1e8; continue; } // 84b1a3: je 0x84b1e8
        pc = 0x84b1a5; continue;
      case 0x84b1a5:
        R.sub(R.m.u32(((R.esi + 0x1e) | 0) >>> 0), (R.eax >>> 0), 32); // 84b1a5: cmp dword ptr [esi + 0x1e], eax
        if (R.zf) { pc = 0x84b1e8; continue; } // 84b1a8: je 0x84b1e8
        pc = 0x84b1aa; continue;
      case 0x84b1aa:
        R.push((R.eax >>> 0)); // 84b1aa: push eax
        R.push((R.esi >>> 0)); // 84b1ab: push esi
        R.call(0x53d740, { n: 2, thisEcx: false, calleeClean: false }); // 84b1ac: call 0x53d740
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 84b1b1: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84b1b4: test eax, eax
        if (!R.zf) { pc = 0x84b1e8; continue; } // 84b1b6: jne 0x84b1e8
        pc = 0x84b1b8; continue;
      case 0x84b1b8:
        R.eax = (R.m.u32(((R.esi + 0x24) | 0) >>> 0)) | 0; // 84b1b8: mov eax, dword ptr [esi + 0x24]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84b1bb: test eax, eax
        if (!R.zf) { pc = 0x84b1cd; continue; } // 84b1bd: jne 0x84b1cd
        pc = 0x84b1bf; continue;
      case 0x84b1bf:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x22) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84b1bf: mov al, byte ptr [esi + 0x22]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 84b1c2: test al, al
        if (!R.zf) { pc = 0x84b1cd; continue; } // 84b1c4: jne 0x84b1cd
        pc = 0x84b1c6; continue;
      case 0x84b1c6:
        R.edi = (R.pop()) | 0; // 84b1c6: pop edi
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 84b1c7: xor al, al
        R.esi = (R.pop()) | 0; // 84b1c9: pop esi
        return R.ret(3); // 84b1ca: ret 0xc
      case 0x84b1cd:
        R.eax = (R.m.u32(((R.edi + 0x53) | 0) >>> 0)) | 0; // 84b1cd: mov eax, dword ptr [edi + 0x53]
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 84b1d0: mov ecx, dword ptr [0xde1f54]
        R.push(0x0); // 84b1d6: push 0
        R.push(0x0); // 84b1d8: push 0
        R.push(0x0); // 84b1da: push 0
        R.push((R.eax >>> 0)); // 84b1dc: push eax
        R.push((R.esi >>> 0)); // 84b1dd: push esi
        R.call(0x8c7950, { n: 5, thisEcx: true, calleeClean: true }); // 84b1de: call 0x8c7950
        R.edi = (R.pop()) | 0; // 84b1e3: pop edi
        R.esi = (R.pop()) | 0; // 84b1e4: pop esi
        return R.ret(3); // 84b1e5: ret 0xc
      case 0x84b1e8:
        R.edi = (R.pop()) | 0; // 84b1e8: pop edi
        R.eax = ((R.eax & 0xffffff00) | (((0x1) & 0xff) << 0)) | 0; // 84b1e9: mov al, 1
        R.esi = (R.pop()) | 0; // 84b1eb: pop esi
        return R.ret(3); // 84b1ec: ret 0xc
      default: throw new Error(`f_84b180: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
