// 0x6005e0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 5e8290=9, 90d130=0, 944c9f=0, 944cff=5t, 946464=5
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_6005e0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x6005e0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x6005e0:
        R.esp = (R.sub((R.esp >>> 0), 0x220, 32)) | 0; // 6005e0: sub esp, 0x220
        R.push((R.esi >>> 0)); // 6005e6: push esi
        R.esi = (R.m.u32(((R.esp + 0x228) | 0) >>> 0)) | 0; // 6005e7: mov esi, dword ptr [esp + 0x228]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 6005ee: test esi, esi
        if (R.zf) { pc = 0x600729; continue; } // 6005f0: je 0x600729
        pc = 0x6005f6; continue;
      case 0x6005f6:
        R.eax = (R.m.u32(((R.esp + 0x22c) | 0) >>> 0)) | 0; // 6005f6: mov eax, dword ptr [esp + 0x22c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 6005fd: test eax, eax
        if (!R.zf) { pc = 0x60064b; continue; } // 6005ff: jne 0x60064b
        pc = 0x600601; continue;
      case 0x600601:
        R.eax = (((R.m.u16(((0xb77c7a) | 0) >>> 0)) << 16 >> 16)) | 0; // 600601: movsx eax, word ptr [0xb77c7a]
        R.eax = (((R.eax + R.eax * 2) | 0)) | 0; // 600608: lea eax, [eax + eax*2]
        R.eax = (R.shl((R.eax >>> 0), 0x8, 32)) | 0; // 60060b: shl eax, 8
        R.eax = (R.m.u32(((R.eax + 0xb74c26) | 0) >>> 0)) | 0; // 60060e: mov eax, dword ptr [eax + 0xb74c26]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 600614: test eax, eax
        if (!R.zf) { pc = 0x60064b; continue; } // 600616: jne 0x60064b
        pc = 0x600618; continue;
      case 0x600618:
        R.ecx = (((R.esp + 0x24) | 0)) | 0; // 600618: lea ecx, [esp + 0x24]
        R.edx = (((R.esp + 0x124) | 0)) | 0; // 60061c: lea edx, [esp + 0x124]
        R.push((R.ecx >>> 0)); // 600623: push ecx
        R.push((R.edx >>> 0)); // 600624: push edx
        R.push((R.eax >>> 0)); // 600625: push eax
        R.push((R.eax >>> 0)); // 600626: push eax
        R.push(0x9cf11c); // 600627: push 0x9cf11c
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 60062c: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 600631: add esp, 0x14
        R.eax = (((R.esp + 0x24) | 0)) | 0; // 600634: lea eax, [esp + 0x24]
        R.ecx = (((R.esp + 0x124) | 0)) | 0; // 600638: lea ecx, [esp + 0x124]
        R.push(0xa4b); // 60063f: push 0xa4b
        R.push((R.eax >>> 0)); // 600644: push eax
        R.push((R.ecx >>> 0)); // 600645: push ecx
        pc = 0x6006f6; continue; // 600646: jmp 0x6006f6
      case 0x60064b:
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 60064b: mov edx, dword ptr [eax]
        R.eax = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 60064d: mov eax, dword ptr [0xae2364]
        R.edx = (R.sub((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 600652: sub edx, eax
        R.edx = (R.add((R.edx >>> 0), 0x10, 32)) | 0; // 600654: add edx, 0x10
        if (R.sf) { pc = 0x6006c6; continue; } // 600657: js 0x6006c6
        pc = 0x600659; continue;
      case 0x600659:
        R.eax = (R.m.u32(((R.ecx + 0x4) | 0) >>> 0)) | 0; // 600659: mov eax, dword ptr [ecx + 4]
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 60065c: dec eax
        R.sub((R.edx >>> 0), (R.eax >>> 0), 32); // 60065d: cmp edx, eax
        if (!R.cLE) { pc = 0x6006c6; continue; } // 60065f: jg 0x6006c6
        pc = 0x600661; continue;
      case 0x600661:
        R.eax = (((R.edx + R.edx * 4) | 0)) | 0; // 600661: lea eax, [edx + edx*4]
        R.eax = (((R.eax + R.eax * 8) | 0)) | 0; // 600664: lea eax, [eax + eax*8]
        R.eax = (R.shl((R.eax >>> 0), 0x1, 32)) | 0; // 600667: shl eax, 1
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 600669: sub eax, edx
        R.eax = (R.shl((R.eax >>> 0), 0x5, 32)) | 0; // 60066b: shl eax, 5
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 60066e: add eax, edx
        R.edx = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 600670: mov edx, dword ptr [ecx]
        R.eax = (((R.eax + R.eax * 2) | 0)) | 0; // 600672: lea eax, [eax + eax*2]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 600675: lea eax, [eax + eax*4]
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 600678: add eax, edx
        R.ecx = (R.m.u32(((R.eax + 0xa6e3) | 0) >>> 0)) | 0; // 60067a: mov ecx, dword ptr [eax + 0xa6e3]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 600680: test ecx, ecx
        if (R.zf) { pc = 0x600729; continue; } // 600682: je 0x600729
        pc = 0x600688; continue;
      case 0x600688:
        R.ecx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 600688: mov ecx, dword ptr [esi]
        R.m.w8(((R.esp + 0x8) | 0) >>> 0, 0x0); // 60068a: mov byte ptr [esp + 8], 0
        R.m.w32(((R.esp + 0x4) | 0) >>> 0, (R.ecx >>> 0)); // 60068f: mov dword ptr [esp + 4], ecx
        R.edx = (R.m.u32(((R.eax + 0xa6eb) | 0) >>> 0)) | 0; // 600693: mov edx, dword ptr [eax + 0xa6eb]
        R.eax = (R.m.u32(((R.eax + 0xa6e3) | 0) >>> 0)) | 0; // 600699: mov eax, dword ptr [eax + 0xa6e3]
        R.push(0x601a10); // 60069f: push 0x601a10
        R.push(0x1e); // 6006a4: push 0x1e
        R.push((R.edx >>> 0)); // 6006a6: push edx
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 6006a7: lea ecx, [esp + 0x10]
        R.push((R.eax >>> 0)); // 6006ab: push eax
        R.push((R.ecx >>> 0)); // 6006ac: push ecx
        R.call(0x946464, { n: 5, thisEcx: false, calleeClean: false }); // 6006ad: call 0x946464
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 6006b2: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 6006b5: test eax, eax
        if (R.zf) { pc = 0x600729; continue; } // 6006b7: je 0x600729
        pc = 0x6006b9; continue;
      case 0x6006b9:
        R.eax = (R.add((R.eax >>> 0), 0x4, 32)) | 0; // 6006b9: add eax, 4
        R.esi = (R.pop()) | 0; // 6006bc: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x220, 32)) | 0; // 6006bd: add esp, 0x220
        return R.ret(2); // 6006c3: ret 8
      case 0x6006c6:
        R.edx = (((R.esp + 0x124) | 0)) | 0; // 6006c6: lea edx, [esp + 0x124]
        R.eax = (((R.esp + 0x24) | 0)) | 0; // 6006cd: lea eax, [esp + 0x24]
        R.push((R.edx >>> 0)); // 6006d1: push edx
        R.push((R.eax >>> 0)); // 6006d2: push eax
        R.push(0x0); // 6006d3: push 0
        R.push(0x0); // 6006d5: push 0
        R.push(0x9cf11c); // 6006d7: push 0x9cf11c
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 6006dc: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 6006e1: add esp, 0x14
        R.ecx = (((R.esp + 0x124) | 0)) | 0; // 6006e4: lea ecx, [esp + 0x124]
        R.edx = (((R.esp + 0x24) | 0)) | 0; // 6006eb: lea edx, [esp + 0x24]
        R.push(0xa57); // 6006ef: push 0xa57
        R.push((R.ecx >>> 0)); // 6006f4: push ecx
        R.push((R.edx >>> 0)); // 6006f5: push edx
        pc = 0x6006f6; continue;
      case 0x6006f6:
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 6006f6: call 0x90d130
        R.push((R.eax >>> 0)); // 6006fb: push eax
        R.push(0x9870e8); // 6006fc: push 0x9870e8
        R.push(0xae24d0); // 600701: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 600706: call 0x944c9f
        R.push(0x0); // 60070b: push 0
        R.push(0xae24d0); // 60070d: push 0xae24d0
        R.push(0x9870e0); // 600712: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 600717: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 60071c: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 60071f: mov dword ptr [0xb67a34], 0
        pc = 0x600729; continue;
      case 0x600729:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 600729: xor eax, eax
        R.esi = (R.pop()) | 0; // 60072b: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x220, 32)) | 0; // 60072c: add esp, 0x220
        return R.ret(2); // 600732: ret 8
      default: throw new Error(`f_6005e0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
