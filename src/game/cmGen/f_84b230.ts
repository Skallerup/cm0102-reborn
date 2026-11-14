// 0x84b230 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_84b230(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x84b230;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x84b230:
        R.eax = (((R.m.u8(((R.esp + 0xc) | 0) >>> 0)) << 24 >> 24)) | 0; // 84b230: movsx eax, byte ptr [esp + 0xc]
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 84b235: dec eax
        R.push((R.esi >>> 0)); // 84b236: push esi
        R.sub((R.eax >>> 0), 0x5, 32); // 84b237: cmp eax, 5
        if (!R.cBE) { pc = 0x84b303; continue; } // 84b23a: ja 0x84b303
        pc = 0x84b240; continue;
      case 0x84b240:
        pc = [0x84b303, 0x84b303, 0x84b303, 0x84b247, 0x84b2cc, 0x84b2e9][R.eax >>> 0]; continue; // 84b240: jmp dword ptr [eax*4 + 0x84b30c]
      case 0x84b247:
        R.eax = (R.m.u32(((R.esp + 0x8) | 0) >>> 0)) | 0; // 84b247: mov eax, dword ptr [esp + 8]
        R.ecx = (R.m.u32(((R.eax + 0x53) | 0) >>> 0)) | 0; // 84b24b: mov ecx, dword ptr [eax + 0x53]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 84b24e: test ecx, ecx
        if (R.zf) { pc = 0x84b2b5; continue; } // 84b250: je 0x84b2b5
        pc = 0x84b252; continue;
      case 0x84b252:
        R.edx = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 84b252: mov edx, dword ptr [ecx]
        R.esi = (R.m.u32(((0x9cf360) | 0) >>> 0)) | 0; // 84b254: mov esi, dword ptr [0x9cf360]
        R.sub((R.edx >>> 0), (R.esi >>> 0), 32); // 84b25a: cmp edx, esi
        if (R.zf) { pc = 0x84b26e; continue; } // 84b25c: je 0x84b26e
        pc = 0x84b25e; continue;
      case 0x84b25e:
        R.sub((R.edx >>> 0), R.m.u32(((0x9cf2e4) | 0) >>> 0), 32); // 84b25e: cmp edx, dword ptr [0x9cf2e4]
        if (R.zf) { pc = 0x84b26e; continue; } // 84b264: je 0x84b26e
        pc = 0x84b266; continue;
      case 0x84b266:
        R.sub((R.edx >>> 0), R.m.u32(((0x9cf488) | 0) >>> 0), 32); // 84b266: cmp edx, dword ptr [0x9cf488]
        if (!R.zf) { pc = 0x84b287; continue; } // 84b26c: jne 0x84b287
        pc = 0x84b26e; continue;
      case 0x84b26e:
        R.eax = (((R.m.u16(((R.eax + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 84b26e: movsx eax, word ptr [eax + 0x80]
        R.esi = (R.pop()) | 0; // 84b275: pop esi
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 84b276: lea ecx, [eax + eax*4]
        R.eax = (((R.eax + R.ecx * 2) | 0)) | 0; // 84b279: lea eax, [eax + ecx*2]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 84b27c: lea eax, [eax + eax*4]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 84b27f: lea eax, [eax + eax*4]
        R.eax = (R.shl((R.eax >>> 0), 0x1, 32)) | 0; // 84b282: shl eax, 1
        return R.ret(3); // 84b284: ret 0xc
      case 0x84b287:
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 84b287: test ecx, ecx
        if (R.zf) { pc = 0x84b2b5; continue; } // 84b289: je 0x84b2b5
        pc = 0x84b28b; continue;
      case 0x84b28b:
        R.ecx = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 84b28b: mov ecx, dword ptr [ecx]
        R.edx = (R.m.u32(((0x9cf314) | 0) >>> 0)) | 0; // 84b28d: mov edx, dword ptr [0x9cf314]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 84b293: cmp ecx, edx
        if (R.zf) { pc = 0x84b29f; continue; } // 84b295: je 0x84b29f
        pc = 0x84b297; continue;
      case 0x84b297:
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf300) | 0) >>> 0), 32); // 84b297: cmp ecx, dword ptr [0x9cf300]
        if (!R.zf) { pc = 0x84b2b5; continue; } // 84b29d: jne 0x84b2b5
        pc = 0x84b29f; continue;
      case 0x84b29f:
        R.ecx = (((R.m.u16(((R.eax + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 84b29f: movsx ecx, word ptr [eax + 0x80]
        R.esi = (R.pop()) | 0; // 84b2a6: pop esi
        R.eax = (((R.ecx + R.ecx * 2) | 0)) | 0; // 84b2a7: lea eax, [ecx + ecx*2]
        R.eax = (R.shl((R.eax >>> 0), 0x5, 32)) | 0; // 84b2aa: shl eax, 5
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 84b2ad: sub eax, ecx
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 84b2af: lea eax, [eax + eax*4]
        return R.ret(3); // 84b2b2: ret 0xc
      case 0x84b2b5:
        R.ecx = (((R.m.u16(((R.eax + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 84b2b5: movsx ecx, word ptr [eax + 0x80]
        R.eax = ((R.ecx >>> 0)) | 0; // 84b2bc: mov eax, ecx
        R.esi = (R.pop()) | 0; // 84b2be: pop esi
        R.eax = (R.shl((R.eax >>> 0), 0x5, 32)) | 0; // 84b2bf: shl eax, 5
        R.eax = (R.add((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 84b2c2: add eax, ecx
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 84b2c4: lea eax, [eax + eax*4]
        R.eax = (R.shl((R.eax >>> 0), 0x1, 32)) | 0; // 84b2c7: shl eax, 1
        return R.ret(3); // 84b2c9: ret 0xc
      case 0x84b2cc:
        R.edx = (R.m.u32(((R.esp + 0x8) | 0) >>> 0)) | 0; // 84b2cc: mov edx, dword ptr [esp + 8]
        R.esi = (R.pop()) | 0; // 84b2d0: pop esi
        R.eax = (((R.m.u16(((R.edx + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 84b2d1: movsx eax, word ptr [edx + 0x80]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 84b2d8: lea ecx, [eax + eax*4]
        R.eax = (((R.eax + R.ecx * 2) | 0)) | 0; // 84b2db: lea eax, [eax + ecx*2]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 84b2de: lea eax, [eax + eax*4]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 84b2e1: lea eax, [eax + eax*4]
        R.eax = (R.shl((R.eax >>> 0), 0x1, 32)) | 0; // 84b2e4: shl eax, 1
        return R.ret(3); // 84b2e6: ret 0xc
      case 0x84b2e9:
        R.edx = (R.m.u32(((R.esp + 0x8) | 0) >>> 0)) | 0; // 84b2e9: mov edx, dword ptr [esp + 8]
        R.esi = (R.pop()) | 0; // 84b2ed: pop esi
        R.eax = (((R.m.u16(((R.edx + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 84b2ee: movsx eax, word ptr [edx + 0x80]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 84b2f5: lea ecx, [eax + eax*4]
        R.eax = (((R.eax + R.ecx * 2) | 0)) | 0; // 84b2f8: lea eax, [eax + ecx*2]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 84b2fb: lea eax, [eax + eax*4]
        R.eax = (R.shl((R.eax >>> 0), 0x1, 32)) | 0; // 84b2fe: shl eax, 1
        return R.ret(3); // 84b300: ret 0xc
      case 0x84b303:
        R.eax = (R.logic((R.eax >>> 0) | 0xffffffff, 32)) | 0; // 84b303: or eax, 0xffffffff
        R.esi = (R.pop()) | 0; // 84b306: pop esi
        return R.ret(3); // 84b307: ret 0xc
      default: throw new Error(`f_84b230: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
