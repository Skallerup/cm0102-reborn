// 0x53d740 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_53d740(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x53d740;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x53d740:
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 53d740: mov eax, dword ptr [esp + 4]
        R.ecx = ((R.ecx & 0xffffff00) | (((0x2) & 0xff) << 0)) | 0; // 53d744: mov cl, 2
        R.push((R.esi >>> 0)); // 53d746: push esi
        R.edx = (R.m.u32(((R.eax + 0x1a) | 0) >>> 0)) | 0; // 53d747: mov edx, dword ptr [eax + 0x1a]
        R.push((R.edi >>> 0)); // 53d74a: push edi
        R.sub(R.m.u8(((R.edx + 0x7f) | 0) >>> 0), ((R.ecx >>> 0) & 0xff), 8); // 53d74b: cmp byte ptr [edx + 0x7f], cl
        if (R.zf) { pc = 0x53d7c8; continue; } // 53d74e: je 0x53d7c8
        pc = 0x53d750; continue;
      case 0x53d750:
        R.edi = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 53d750: mov edi, dword ptr [edx]
        R.esi = (R.m.u32(((0x9cf4ac) | 0) >>> 0)) | 0; // 53d752: mov esi, dword ptr [0x9cf4ac]
        R.sub((R.edi >>> 0), (R.esi >>> 0), 32); // 53d758: cmp edi, esi
        if (R.zf) { pc = 0x53d7c8; continue; } // 53d75a: je 0x53d7c8
        pc = 0x53d75c; continue;
      case 0x53d75c:
        R.eax = (R.m.u32(((R.eax + 0x1e) | 0) >>> 0)) | 0; // 53d75c: mov eax, dword ptr [eax + 0x1e]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 53d75f: test eax, eax
        if (R.zf) { pc = 0x53d768; continue; } // 53d761: je 0x53d768
        pc = 0x53d763; continue;
      case 0x53d763:
        R.sub(R.m.u8(((R.eax + 0x7f) | 0) >>> 0), ((R.ecx >>> 0) & 0xff), 8); // 53d763: cmp byte ptr [eax + 0x7f], cl
        if (R.zf) { pc = 0x53d7c8; continue; } // 53d766: je 0x53d7c8
        pc = 0x53d768; continue;
      case 0x53d768:
        R.eax = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 53d768: mov eax, dword ptr [esp + 0x10]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 53d76c: test eax, eax
        if (R.zf) { pc = 0x53d7c3; continue; } // 53d76e: je 0x53d7c3
        pc = 0x53d770; continue;
      case 0x53d770:
        R.esi = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 53d770: mov esi, dword ptr [eax]
        R.eax = (R.m.u32(((0x9cf314) | 0) >>> 0)) | 0; // 53d772: mov eax, dword ptr [0x9cf314]
        R.sub((R.esi >>> 0), (R.eax >>> 0), 32); // 53d777: cmp esi, eax
        if (!R.zf) { pc = 0x53d79b; continue; } // 53d779: jne 0x53d79b
        pc = 0x53d77b; continue;
      case 0x53d77b:
        R.ecx = (R.m.u32(((0x9cfa10) | 0) >>> 0)) | 0; // 53d77b: mov ecx, dword ptr [0x9cfa10]
        R.eax = ((R.ecx >>> 0)) | 0; // 53d781: mov eax, ecx
        R.eax = (R.shl((R.eax >>> 0), 0x5, 32)) | 0; // 53d783: shl eax, 5
        R.eax = (R.add((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 53d786: add eax, ecx
        R.ecx = (R.m.u32(((0xae23a4) | 0) >>> 0)) | 0; // 53d788: mov ecx, dword ptr [0xae23a4]
        R.eax = (((R.eax + R.eax * 2) | 0)) | 0; // 53d78e: lea eax, [eax + eax*2]
        R.eax = (((R.ecx + R.eax * 2) | 0)) | 0; // 53d791: lea eax, [ecx + eax*2]
        R.ecx = (R.m.u32(((R.edx + 0x71) | 0) >>> 0)) | 0; // 53d794: mov ecx, dword ptr [edx + 0x71]
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 53d797: cmp ecx, eax
        if (R.zf) { pc = 0x53d7c8; continue; } // 53d799: je 0x53d7c8
        pc = 0x53d79b; continue;
      case 0x53d79b:
        R.sub((R.esi >>> 0), R.m.u32(((0x9cf360) | 0) >>> 0), 32); // 53d79b: cmp esi, dword ptr [0x9cf360]
        if (R.zf) { pc = 0x53d7c8; continue; } // 53d7a1: je 0x53d7c8
        pc = 0x53d7a3; continue;
      case 0x53d7a3:
        R.sub((R.esi >>> 0), R.m.u32(((0x9cf2c0) | 0) >>> 0), 32); // 53d7a3: cmp esi, dword ptr [0x9cf2c0]
        if (!R.zf) { pc = 0x53d7c3; continue; } // 53d7a9: jne 0x53d7c3
        pc = 0x53d7ab; continue;
      case 0x53d7ab:
        R.sub((R.edi >>> 0), R.m.u32(((0x9cf348) | 0) >>> 0), 32); // 53d7ab: cmp edi, dword ptr [0x9cf348]
        if (R.zf) { pc = 0x53d7c8; continue; } // 53d7b1: je 0x53d7c8
        pc = 0x53d7b3; continue;
      case 0x53d7b3:
        R.sub((R.edi >>> 0), R.m.u32(((0x9cf408) | 0) >>> 0), 32); // 53d7b3: cmp edi, dword ptr [0x9cf408]
        if (R.zf) { pc = 0x53d7c8; continue; } // 53d7b9: je 0x53d7c8
        pc = 0x53d7bb; continue;
      case 0x53d7bb:
        R.sub((R.edi >>> 0), R.m.u32(((0x9cf3a0) | 0) >>> 0), 32); // 53d7bb: cmp edi, dword ptr [0x9cf3a0]
        if (R.zf) { pc = 0x53d7c8; continue; } // 53d7c1: je 0x53d7c8
        pc = 0x53d7c3; continue;
      case 0x53d7c3:
        R.edi = (R.pop()) | 0; // 53d7c3: pop edi
        R.esi = (R.pop()) | 0; // 53d7c4: pop esi
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53d7c5: xor eax, eax
        return R.ret(0); // 53d7c7: ret 
      case 0x53d7c8:
        R.edi = (R.pop()) | 0; // 53d7c8: pop edi
        R.esi = (R.pop()) | 0; // 53d7c9: pop esi
        R.eax = (0x1) | 0; // 53d7ca: mov eax, 1
        return R.ret(0); // 53d7cf: ret 
      default: throw new Error(`f_53d740: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
