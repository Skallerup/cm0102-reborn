// 0x5fe040 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 5e8290=9, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_5fe040(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x5fe040;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x5fe040:
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 5fe040: mov eax, dword ptr [esp + 4]
        R.esp = (R.sub((R.esp >>> 0), 0x200, 32)) | 0; // 5fe044: sub esp, 0x200
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5fe04a: test eax, eax
        if (!R.zf) { pc = 0x5fe094; continue; } // 5fe04c: jne 0x5fe094
        pc = 0x5fe04e; continue;
      case 0x5fe04e:
        R.eax = (((R.m.u16(((0xb77c7a) | 0) >>> 0)) << 16 >> 16)) | 0; // 5fe04e: movsx eax, word ptr [0xb77c7a]
        R.eax = (((R.eax + R.eax * 2) | 0)) | 0; // 5fe055: lea eax, [eax + eax*2]
        R.eax = (R.shl((R.eax >>> 0), 0x8, 32)) | 0; // 5fe058: shl eax, 8
        R.eax = (R.m.u32(((R.eax + 0xb74c26) | 0) >>> 0)) | 0; // 5fe05b: mov eax, dword ptr [eax + 0xb74c26]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5fe061: test eax, eax
        if (!R.zf) { pc = 0x5fe094; continue; } // 5fe063: jne 0x5fe094
        pc = 0x5fe065; continue;
      case 0x5fe065:
        R.ecx = (((R.esp) | 0)) | 0; // 5fe065: lea ecx, [esp]
        R.edx = (((R.esp + 0x100) | 0)) | 0; // 5fe069: lea edx, [esp + 0x100]
        R.push((R.ecx >>> 0)); // 5fe070: push ecx
        R.push((R.edx >>> 0)); // 5fe071: push edx
        R.push((R.eax >>> 0)); // 5fe072: push eax
        R.push((R.eax >>> 0)); // 5fe073: push eax
        R.push(0x9cf11c); // 5fe074: push 0x9cf11c
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 5fe079: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 5fe07e: add esp, 0x14
        R.eax = (((R.esp) | 0)) | 0; // 5fe081: lea eax, [esp]
        R.ecx = (((R.esp + 0x100) | 0)) | 0; // 5fe085: lea ecx, [esp + 0x100]
        R.push(0x61b); // 5fe08c: push 0x61b
        R.push((R.eax >>> 0)); // 5fe091: push eax
        pc = 0x5fe100; continue; // 5fe092: jmp 0x5fe100
      case 0x5fe094:
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 5fe094: mov edx, dword ptr [eax]
        R.eax = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 5fe096: mov eax, dword ptr [0xae2364]
        R.edx = (R.sub((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 5fe09b: sub edx, eax
        R.edx = (R.add((R.edx >>> 0), 0x10, 32)) | 0; // 5fe09d: add edx, 0x10
        if (R.sf) { pc = 0x5fe0d1; continue; } // 5fe0a0: js 0x5fe0d1
        pc = 0x5fe0a2; continue;
      case 0x5fe0a2:
        R.eax = (R.m.u32(((R.ecx + 0x4) | 0) >>> 0)) | 0; // 5fe0a2: mov eax, dword ptr [ecx + 4]
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 5fe0a5: dec eax
        R.sub((R.edx >>> 0), (R.eax >>> 0), 32); // 5fe0a6: cmp edx, eax
        if (!R.cLE) { pc = 0x5fe0d1; continue; } // 5fe0a8: jg 0x5fe0d1
        pc = 0x5fe0aa; continue;
      case 0x5fe0aa:
        R.eax = (((R.edx + R.edx * 4) | 0)) | 0; // 5fe0aa: lea eax, [edx + edx*4]
        R.eax = (((R.eax + R.eax * 8) | 0)) | 0; // 5fe0ad: lea eax, [eax + eax*8]
        R.eax = (R.shl((R.eax >>> 0), 0x1, 32)) | 0; // 5fe0b0: shl eax, 1
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 5fe0b2: sub eax, edx
        R.eax = (R.shl((R.eax >>> 0), 0x5, 32)) | 0; // 5fe0b4: shl eax, 5
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 5fe0b7: add eax, edx
        R.eax = (((R.eax + R.eax * 2) | 0)) | 0; // 5fe0b9: lea eax, [eax + eax*2]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 5fe0bc: lea edx, [eax + eax*4]
        R.eax = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 5fe0bf: mov eax, dword ptr [ecx]
        R.eax = (R.m.u32(((R.edx + R.eax + 0x9ace) | 0) >>> 0)) | 0; // 5fe0c1: mov eax, dword ptr [edx + eax + 0x9ace]
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 5fe0c8: add esp, 0x200
        return R.eax; // 5fe0ce: ret 4
      case 0x5fe0d1:
        R.ecx = (((R.esp + 0x100) | 0)) | 0; // 5fe0d1: lea ecx, [esp + 0x100]
        R.edx = (((R.esp) | 0)) | 0; // 5fe0d8: lea edx, [esp]
        R.push((R.ecx >>> 0)); // 5fe0dc: push ecx
        R.push((R.edx >>> 0)); // 5fe0dd: push edx
        R.push(0x0); // 5fe0de: push 0
        R.push(0x0); // 5fe0e0: push 0
        R.push(0x9cf11c); // 5fe0e2: push 0x9cf11c
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 5fe0e7: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 5fe0ec: add esp, 0x14
        R.eax = (((R.esp + 0x100) | 0)) | 0; // 5fe0ef: lea eax, [esp + 0x100]
        R.ecx = (((R.esp) | 0)) | 0; // 5fe0f6: lea ecx, [esp]
        R.push(0x627); // 5fe0fa: push 0x627
        R.push((R.eax >>> 0)); // 5fe0ff: push eax
        pc = 0x5fe100; continue;
      case 0x5fe100:
        R.push((R.ecx >>> 0)); // 5fe100: push ecx
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 5fe101: call 0x90d130
        R.push((R.eax >>> 0)); // 5fe106: push eax
        R.push(0x9870e8); // 5fe107: push 0x9870e8
        R.push(0xae24d0); // 5fe10c: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 5fe111: call 0x944c9f
        R.push(0x0); // 5fe116: push 0
        R.push(0xae24d0); // 5fe118: push 0xae24d0
        R.push(0x9870e0); // 5fe11d: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 5fe122: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 5fe127: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 5fe12a: mov dword ptr [0xb67a34], 0
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 5fe134: xor eax, eax
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 5fe136: add esp, 0x200
        return R.eax; // 5fe13c: ret 4
      default: throw new Error(`f_5fe040: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
