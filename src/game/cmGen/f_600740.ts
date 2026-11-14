// 0x600740 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 5e8290=9, 90d130=0, 944c9f=0, 944cff=5t, 946464=5
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_600740(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x600740;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x600740:
        R.esp = (R.sub((R.esp >>> 0), 0x220, 32)) | 0; // 600740: sub esp, 0x220
        R.push((R.esi >>> 0)); // 600746: push esi
        R.esi = (R.m.u32(((R.esp + 0x228) | 0) >>> 0)) | 0; // 600747: mov esi, dword ptr [esp + 0x228]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 60074e: test esi, esi
        if (R.zf) { pc = 0x600859; continue; } // 600750: je 0x600859
        pc = 0x600756; continue;
      case 0x600756:
        R.eax = (R.m.u32(((R.esp + 0x22c) | 0) >>> 0)) | 0; // 600756: mov eax, dword ptr [esp + 0x22c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 60075d: test eax, eax
        if (!R.zf) { pc = 0x60077c; continue; } // 60075f: jne 0x60077c
        pc = 0x600761; continue;
      case 0x600761:
        R.eax = (((R.m.u16(((0xb77c7a) | 0) >>> 0)) << 16 >> 16)) | 0; // 600761: movsx eax, word ptr [0xb77c7a]
        R.eax = (((R.eax + R.eax * 2) | 0)) | 0; // 600768: lea eax, [eax + eax*2]
        R.eax = (R.shl((R.eax >>> 0), 0x8, 32)) | 0; // 60076b: shl eax, 8
        R.eax = (R.m.u32(((R.eax + 0xb74c26) | 0) >>> 0)) | 0; // 60076e: mov eax, dword ptr [eax + 0xb74c26]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 600774: test eax, eax
        if (R.zf) { pc = 0x600859; continue; } // 600776: je 0x600859
        pc = 0x60077c; continue;
      case 0x60077c:
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 60077c: mov edx, dword ptr [eax]
        R.eax = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 60077e: mov eax, dword ptr [0xae2364]
        R.edx = (R.sub((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 600783: sub edx, eax
        R.edx = (R.add((R.edx >>> 0), 0x10, 32)) | 0; // 600785: add edx, 0x10
        if (R.sf) { pc = 0x6007f6; continue; } // 600788: js 0x6007f6
        pc = 0x60078a; continue;
      case 0x60078a:
        R.eax = (R.m.u32(((R.ecx + 0x4) | 0) >>> 0)) | 0; // 60078a: mov eax, dword ptr [ecx + 4]
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 60078d: dec eax
        R.sub((R.edx >>> 0), (R.eax >>> 0), 32); // 60078e: cmp edx, eax
        if (!R.cLE) { pc = 0x6007f6; continue; } // 600790: jg 0x6007f6
        pc = 0x600792; continue;
      case 0x600792:
        R.eax = (((R.edx + R.edx * 4) | 0)) | 0; // 600792: lea eax, [edx + edx*4]
        R.eax = (((R.eax + R.eax * 8) | 0)) | 0; // 600795: lea eax, [eax + eax*8]
        R.eax = (R.shl((R.eax >>> 0), 0x1, 32)) | 0; // 600798: shl eax, 1
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 60079a: sub eax, edx
        R.eax = (R.shl((R.eax >>> 0), 0x5, 32)) | 0; // 60079c: shl eax, 5
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 60079f: add eax, edx
        R.edx = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 6007a1: mov edx, dword ptr [ecx]
        R.eax = (((R.eax + R.eax * 2) | 0)) | 0; // 6007a3: lea eax, [eax + eax*2]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 6007a6: lea eax, [eax + eax*4]
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 6007a9: add eax, edx
        R.ecx = (R.m.u32(((R.eax + 0xa6e3) | 0) >>> 0)) | 0; // 6007ab: mov ecx, dword ptr [eax + 0xa6e3]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 6007b1: test ecx, ecx
        if (R.zf) { pc = 0x600859; continue; } // 6007b3: je 0x600859
        pc = 0x6007b9; continue;
      case 0x6007b9:
        R.ecx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 6007b9: mov ecx, dword ptr [esi]
        R.m.w8(((R.esp + 0x8) | 0) >>> 0, 0x0); // 6007bb: mov byte ptr [esp + 8], 0
        R.m.w32(((R.esp + 0x4) | 0) >>> 0, (R.ecx >>> 0)); // 6007c0: mov dword ptr [esp + 4], ecx
        R.edx = (R.m.u32(((R.eax + 0xa6eb) | 0) >>> 0)) | 0; // 6007c4: mov edx, dword ptr [eax + 0xa6eb]
        R.eax = (R.m.u32(((R.eax + 0xa6e3) | 0) >>> 0)) | 0; // 6007ca: mov eax, dword ptr [eax + 0xa6e3]
        R.push(0x601a10); // 6007d0: push 0x601a10
        R.push(0x1e); // 6007d5: push 0x1e
        R.push((R.edx >>> 0)); // 6007d7: push edx
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 6007d8: lea ecx, [esp + 0x10]
        R.push((R.eax >>> 0)); // 6007dc: push eax
        R.push((R.ecx >>> 0)); // 6007dd: push ecx
        R.call(0x946464, { n: 5, thisEcx: false, calleeClean: false }); // 6007de: call 0x946464
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 6007e3: add esp, 0x14
        R.eax = (R.neg((R.eax >>> 0), 32)) | 0; // 6007e6: neg eax
        R.eax = (R.sub((R.eax >>> 0), (R.eax >>> 0), 32, R.cf ? 1 : 0)) | 0; // 6007e8: sbb eax, eax
        R.esi = (R.pop()) | 0; // 6007ea: pop esi
        R.eax = (R.neg((R.eax >>> 0), 32)) | 0; // 6007eb: neg eax
        R.esp = (R.add((R.esp >>> 0), 0x220, 32)) | 0; // 6007ed: add esp, 0x220
        return R.eax; // 6007f3: ret 8
      case 0x6007f6:
        R.edx = (((R.esp + 0x24) | 0)) | 0; // 6007f6: lea edx, [esp + 0x24]
        R.eax = (((R.esp + 0x124) | 0)) | 0; // 6007fa: lea eax, [esp + 0x124]
        R.push((R.edx >>> 0)); // 600801: push edx
        R.push((R.eax >>> 0)); // 600802: push eax
        R.push(0x0); // 600803: push 0
        R.push(0x0); // 600805: push 0
        R.push(0x9cf11c); // 600807: push 0x9cf11c
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 60080c: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 600811: add esp, 0x14
        R.ecx = (((R.esp + 0x24) | 0)) | 0; // 600814: lea ecx, [esp + 0x24]
        R.edx = (((R.esp + 0x124) | 0)) | 0; // 600818: lea edx, [esp + 0x124]
        R.push(0xa96); // 60081f: push 0xa96
        R.push((R.ecx >>> 0)); // 600824: push ecx
        R.push((R.edx >>> 0)); // 600825: push edx
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 600826: call 0x90d130
        R.push((R.eax >>> 0)); // 60082b: push eax
        R.push(0x9870e8); // 60082c: push 0x9870e8
        R.push(0xae24d0); // 600831: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 600836: call 0x944c9f
        R.push(0x0); // 60083b: push 0
        R.push(0xae24d0); // 60083d: push 0xae24d0
        R.push(0x9870e0); // 600842: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 600847: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 60084c: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 60084f: mov dword ptr [0xb67a34], 0
        pc = 0x600859; continue;
      case 0x600859:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 600859: xor eax, eax
        R.esi = (R.pop()) | 0; // 60085b: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x220, 32)) | 0; // 60085c: add esp, 0x220
        return R.eax; // 600862: ret 8
      default: throw new Error(`f_600740: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
