// 0x544600 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4cf5a0=1c, 4cf5f0=2tc
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_544600(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x544600;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x544600:
        R.push((R.esi >>> 0)); // 544600: push esi
        R.esi = (R.m.u32(((R.esp + 0x8) | 0) >>> 0)) | 0; // 544601: mov esi, dword ptr [esp + 8]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 544605: test esi, esi
        if (R.zf) { pc = 0x54465e; continue; } // 544607: je 0x54465e
        pc = 0x544609; continue;
      case 0x544609:
        R.eax = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 544609: mov eax, dword ptr [esp + 0xc]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 54460d: test eax, eax
        if (!R.zf) { pc = 0x544640; continue; } // 54460f: jne 0x544640
        pc = 0x544611; continue;
      case 0x544611:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 544611: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 544617: push esi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 544618: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 54461d: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 54461f: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x54465e; continue; } // 544624: je 0x54465e
        pc = 0x544626; continue;
      case 0x544626:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 544626: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 544629: mov edx, dword ptr [0xae23b4]
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 54462f: add edx, eax
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 544631: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 544634: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 544637: add ecx, eax
        R.eax = (((R.edx + R.ecx * 4) | 0)) | 0; // 544639: lea eax, [edx + ecx*4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 54463c: test eax, eax
        if (R.zf) { pc = 0x54465e; continue; } // 54463e: je 0x54465e
        pc = 0x544640; continue;
      case 0x544640:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 544640: mov ecx, dword ptr [0xae1050]
        R.push((R.eax >>> 0)); // 544646: push eax
        R.push((R.esi >>> 0)); // 544647: push esi
        R.call(0x4cf5f0, { n: 2, thisEcx: true, calleeClean: true }); // 544648: call 0x4cf5f0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 54464d: test eax, eax
        if (R.zf) { pc = 0x54465e; continue; } // 54464f: je 0x54465e
        pc = 0x544651; continue;
      case 0x544651:
        R.logic(R.m.u8(((R.eax + 0x4e) | 0) >>> 0) & 0x8, 8); // 544651: test byte ptr [eax + 0x4e], 8
        if (R.zf) { pc = 0x54465e; continue; } // 544655: je 0x54465e
        pc = 0x544657; continue;
      case 0x544657:
        R.eax = (0x1) | 0; // 544657: mov eax, 1
        R.esi = (R.pop()) | 0; // 54465c: pop esi
        return R.ret(0); // 54465d: ret 
      case 0x54465e:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 54465e: xor eax, eax
        R.esi = (R.pop()) | 0; // 544660: pop esi
        return R.ret(0); // 544661: ret 
      default: throw new Error(`f_544600: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
