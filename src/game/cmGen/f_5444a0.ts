// 0x5444a0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4cf5a0=1c, 4cf5f0=2tc, 600a50=5
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_5444a0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x5444a0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x5444a0:
        R.push((R.esi >>> 0)); // 5444a0: push esi
        R.push((R.edi >>> 0)); // 5444a1: push edi
        R.edi = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 5444a2: mov edi, dword ptr [esp + 0xc]
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 5444a6: test edi, edi
        if (R.zf) { pc = 0x54451b; continue; } // 5444a8: je 0x54451b
        pc = 0x5444aa; continue;
      case 0x5444aa:
        R.esi = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 5444aa: mov esi, dword ptr [esp + 0x10]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 5444ae: test esi, esi
        if (!R.zf) { pc = 0x5444e1; continue; } // 5444b0: jne 0x5444e1
        pc = 0x5444b2; continue;
      case 0x5444b2:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 5444b2: mov ecx, dword ptr [0xae1050]
        R.push((R.edi >>> 0)); // 5444b8: push edi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 5444b9: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5444be: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 5444c0: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x54451b; continue; } // 5444c5: je 0x54451b
        pc = 0x5444c7; continue;
      case 0x5444c7:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 5444c7: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 5444ca: mov edx, dword ptr [0xae23b4]
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 5444d0: add edx, eax
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 5444d2: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 5444d5: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 5444d8: add ecx, eax
        R.esi = (((R.edx + R.ecx * 4) | 0)) | 0; // 5444da: lea esi, [edx + ecx*4]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 5444dd: test esi, esi
        if (R.zf) { pc = 0x54451b; continue; } // 5444df: je 0x54451b
        pc = 0x5444e1; continue;
      case 0x5444e1:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 5444e1: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 5444e7: push esi
        R.push((R.edi >>> 0)); // 5444e8: push edi
        R.call(0x4cf5f0, { n: 2, thisEcx: true, calleeClean: true }); // 5444e9: call 0x4cf5f0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5444ee: test eax, eax
        if (R.zf) { pc = 0x54451b; continue; } // 5444f0: je 0x54451b
        pc = 0x5444f2; continue;
      case 0x5444f2:
        R.logic(R.m.u8(((R.eax + 0x4e) | 0) >>> 0) & 0x1, 8); // 5444f2: test byte ptr [eax + 0x4e], 1
        if (R.zf) { pc = 0x54451b; continue; } // 5444f6: je 0x54451b
        pc = 0x5444f8; continue;
      case 0x5444f8:
        R.push(0x0); // 5444f8: push 0
        R.push(0x0); // 5444fa: push 0
        R.push(0x1); // 5444fc: push 1
        R.push(0x1); // 5444fe: push 1
        R.push((R.esi >>> 0)); // 544500: push esi
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 544501: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 544506: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 544509: test eax, eax
        if (!R.zf) { pc = 0x544513; continue; } // 54450b: jne 0x544513
        pc = 0x54450d; continue;
      case 0x54450d:
        R.sub(R.m.u8(((R.edi + 0x3d) | 0) >>> 0), 0xf, 8); // 54450d: cmp byte ptr [edi + 0x3d], 0xf
        if (R.zf) { pc = 0x54451b; continue; } // 544511: je 0x54451b
        pc = 0x544513; continue;
      case 0x544513:
        R.edi = (R.pop()) | 0; // 544513: pop edi
        R.eax = (0x1) | 0; // 544514: mov eax, 1
        R.esi = (R.pop()) | 0; // 544519: pop esi
        return R.ret(0); // 54451a: ret 
      case 0x54451b:
        R.edi = (R.pop()) | 0; // 54451b: pop edi
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 54451c: xor eax, eax
        R.esi = (R.pop()) | 0; // 54451e: pop esi
        return R.ret(0); // 54451f: ret 
      default: throw new Error(`f_5444a0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
