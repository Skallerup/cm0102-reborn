// 0x5fd6b0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 5e8290=9, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_5fd6b0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x5fd6b0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x5fd6b0:
        R.esp = (R.sub((R.esp >>> 0), 0x200, 32)) | 0; // 5fd6b0: sub esp, 0x200
        R.push((R.esi >>> 0)); // 5fd6b6: push esi
        R.esi = (R.m.u32(((R.esp + 0x20c) | 0) >>> 0)) | 0; // 5fd6b7: mov esi, dword ptr [esp + 0x20c]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 5fd6be: test esi, esi
        R.push((R.edi >>> 0)); // 5fd6c0: push edi
        if (R.zf) { pc = 0x5fd6c9; continue; } // 5fd6c1: je 0x5fd6c9
        pc = 0x5fd6c3; continue;
      case 0x5fd6c3:
        R.m.w32(((R.esi) | 0) >>> 0, 0x0); // 5fd6c3: mov dword ptr [esi], 0
        pc = 0x5fd6c9; continue;
      case 0x5fd6c9:
        R.eax = (R.m.u32(((R.esp + 0x20c) | 0) >>> 0)) | 0; // 5fd6c9: mov eax, dword ptr [esp + 0x20c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5fd6d0: test eax, eax
        if (!R.zf) { pc = 0x5fd71e; continue; } // 5fd6d2: jne 0x5fd71e
        pc = 0x5fd6d4; continue;
      case 0x5fd6d4:
        R.eax = (((R.m.u16(((0xb77c7a) | 0) >>> 0)) << 16 >> 16)) | 0; // 5fd6d4: movsx eax, word ptr [0xb77c7a]
        R.eax = (((R.eax + R.eax * 2) | 0)) | 0; // 5fd6db: lea eax, [eax + eax*2]
        R.eax = (R.shl((R.eax >>> 0), 0x8, 32)) | 0; // 5fd6de: shl eax, 8
        R.eax = (R.m.u32(((R.eax + 0xb74c26) | 0) >>> 0)) | 0; // 5fd6e1: mov eax, dword ptr [eax + 0xb74c26]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5fd6e7: test eax, eax
        if (!R.zf) { pc = 0x5fd71e; continue; } // 5fd6e9: jne 0x5fd71e
        pc = 0x5fd6eb; continue;
      case 0x5fd6eb:
        R.ecx = (((R.esp + 0x8) | 0)) | 0; // 5fd6eb: lea ecx, [esp + 8]
        R.edx = (((R.esp + 0x108) | 0)) | 0; // 5fd6ef: lea edx, [esp + 0x108]
        R.push((R.ecx >>> 0)); // 5fd6f6: push ecx
        R.push((R.edx >>> 0)); // 5fd6f7: push edx
        R.push((R.eax >>> 0)); // 5fd6f8: push eax
        R.push((R.eax >>> 0)); // 5fd6f9: push eax
        R.push(0x9cf11c); // 5fd6fa: push 0x9cf11c
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 5fd6ff: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 5fd704: add esp, 0x14
        R.eax = (((R.esp + 0x8) | 0)) | 0; // 5fd707: lea eax, [esp + 8]
        R.ecx = (((R.esp + 0x108) | 0)) | 0; // 5fd70b: lea ecx, [esp + 0x108]
        R.push(0x4b4); // 5fd712: push 0x4b4
        R.push((R.eax >>> 0)); // 5fd717: push eax
        R.push((R.ecx >>> 0)); // 5fd718: push ecx
        pc = 0x5fd7ca; continue; // 5fd719: jmp 0x5fd7ca
      case 0x5fd71e:
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 5fd71e: mov edx, dword ptr [eax]
        R.edi = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 5fd720: mov edi, dword ptr [0xae2364]
        R.edx = (R.sub((R.edx >>> 0), (R.edi >>> 0), 32)) | 0; // 5fd726: sub edx, edi
        R.edx = (R.add((R.edx >>> 0), 0x10, 32)) | 0; // 5fd728: add edx, 0x10
        if (R.sf) { pc = 0x5fd79a; continue; } // 5fd72b: js 0x5fd79a
        pc = 0x5fd72d; continue;
      case 0x5fd72d:
        R.edi = (R.m.u32(((R.ecx + 0x4) | 0) >>> 0)) | 0; // 5fd72d: mov edi, dword ptr [ecx + 4]
        R.edi = (R.incdec((R.edi >>> 0), -1, 32)) | 0; // 5fd730: dec edi
        R.sub((R.edx >>> 0), (R.edi >>> 0), 32); // 5fd731: cmp edx, edi
        if (!R.cLE) { pc = 0x5fd79a; continue; } // 5fd733: jg 0x5fd79a
        pc = 0x5fd735; continue;
      case 0x5fd735:
        R.eax = (R.m.u32(((R.eax + 0x24) | 0) >>> 0)) | 0; // 5fd735: mov eax, dword ptr [eax + 0x24]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5fd738: test eax, eax
        if (R.zf) { pc = 0x5fd766; continue; } // 5fd73a: je 0x5fd766
        pc = 0x5fd73c; continue;
      case 0x5fd73c:
        R.eax = (R.m.u32(((R.eax + 0x53) | 0) >>> 0)) | 0; // 5fd73c: mov eax, dword ptr [eax + 0x53]
        R.sub(R.m.u32(((R.eax + 0x88) | 0) >>> 0), 0x190, 32); // 5fd73f: cmp dword ptr [eax + 0x88], 0x190
        if (!R.cL) { pc = 0x5fd766; continue; } // 5fd749: jge 0x5fd766
        pc = 0x5fd74b; continue;
      case 0x5fd74b:
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 5fd74b: test esi, esi
        if (R.zf) { pc = 0x5fd7fd; continue; } // 5fd74d: je 0x5fd7fd
        pc = 0x5fd753; continue;
      case 0x5fd753:
        R.m.w32(((R.esi) | 0) >>> 0, 0x1); // 5fd753: mov dword ptr [esi], 1
        R.edi = (R.pop()) | 0; // 5fd759: pop edi
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 5fd75a: xor eax, eax
        R.esi = (R.pop()) | 0; // 5fd75c: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 5fd75d: add esp, 0x200
        return R.eax; // 5fd763: ret 8
      case 0x5fd766:
        R.eax = (((R.edx + R.edx * 4) | 0)) | 0; // 5fd766: lea eax, [edx + edx*4]
        R.push((R.ebx >>> 0)); // 5fd769: push ebx
        R.eax = (((R.eax + R.eax * 8) | 0)) | 0; // 5fd76a: lea eax, [eax + eax*8]
        R.eax = (R.shl((R.eax >>> 0), 0x1, 32)) | 0; // 5fd76d: shl eax, 1
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 5fd76f: sub eax, edx
        R.eax = (R.shl((R.eax >>> 0), 0x5, 32)) | 0; // 5fd771: shl eax, 5
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 5fd774: add eax, edx
        R.eax = (((R.eax + R.eax * 2) | 0)) | 0; // 5fd776: lea eax, [eax + eax*2]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 5fd779: lea edx, [eax + eax*4]
        R.eax = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 5fd77c: mov eax, dword ptr [ecx]
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 5fd77e: xor ecx, ecx
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.edx + R.eax + 0x9a06) | 0) >>> 0)) & 0xff) << 0)) | 0; // 5fd780: mov bl, byte ptr [edx + eax + 0x9a06]
        R.logic(((R.ebx >>> 0) & 0xff) & ((R.ebx >>> 0) & 0xff), 8); // 5fd787: test bl, bl
        R.ecx = ((R.ecx & 0xffffff00) | (((!R.zf ? 1 : 0) & 0xff) << 0)) | 0; // 5fd789: setne cl
        R.ebx = (R.pop()) | 0; // 5fd78c: pop ebx
        R.edi = (R.pop()) | 0; // 5fd78d: pop edi
        R.eax = ((R.ecx >>> 0)) | 0; // 5fd78e: mov eax, ecx
        R.esi = (R.pop()) | 0; // 5fd790: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 5fd791: add esp, 0x200
        return R.eax; // 5fd797: ret 8
      case 0x5fd79a:
        R.edx = (((R.esp + 0x108) | 0)) | 0; // 5fd79a: lea edx, [esp + 0x108]
        R.eax = (((R.esp + 0x8) | 0)) | 0; // 5fd7a1: lea eax, [esp + 8]
        R.push((R.edx >>> 0)); // 5fd7a5: push edx
        R.push((R.eax >>> 0)); // 5fd7a6: push eax
        R.push(0x0); // 5fd7a7: push 0
        R.push(0x0); // 5fd7a9: push 0
        R.push(0x9cf11c); // 5fd7ab: push 0x9cf11c
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 5fd7b0: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 5fd7b5: add esp, 0x14
        R.ecx = (((R.esp + 0x108) | 0)) | 0; // 5fd7b8: lea ecx, [esp + 0x108]
        R.edx = (((R.esp + 0x8) | 0)) | 0; // 5fd7bf: lea edx, [esp + 8]
        R.push(0x4c0); // 5fd7c3: push 0x4c0
        R.push((R.ecx >>> 0)); // 5fd7c8: push ecx
        R.push((R.edx >>> 0)); // 5fd7c9: push edx
        pc = 0x5fd7ca; continue;
      case 0x5fd7ca:
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 5fd7ca: call 0x90d130
        R.push((R.eax >>> 0)); // 5fd7cf: push eax
        R.push(0x9870e8); // 5fd7d0: push 0x9870e8
        R.push(0xae24d0); // 5fd7d5: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 5fd7da: call 0x944c9f
        R.push(0x0); // 5fd7df: push 0
        R.push(0xae24d0); // 5fd7e1: push 0xae24d0
        R.push(0x9870e0); // 5fd7e6: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 5fd7eb: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 5fd7f0: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 5fd7f3: mov dword ptr [0xb67a34], 0
        pc = 0x5fd7fd; continue;
      case 0x5fd7fd:
        R.edi = (R.pop()) | 0; // 5fd7fd: pop edi
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 5fd7fe: xor eax, eax
        R.esi = (R.pop()) | 0; // 5fd800: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 5fd801: add esp, 0x200
        return R.eax; // 5fd807: ret 8
      default: throw new Error(`f_5fd6b0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
