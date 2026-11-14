// 0x7af600 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 54a110=0t, 5e8290=9, 7e4920=0, 90d130=0, 944c9f=0, 944cff=5t, 946464=7
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_7af600(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x7af600;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x7af600:
        R.push(0xffffffff); // 7af600: push -1
        R.push(0x95f386); // 7af602: push 0x95f386
        R.eax = (0) | 0; // 7af607: mov eax, dword ptr fs:[0]
        R.push((R.eax >>> 0)); // 7af60d: push eax
        /* fs */ // 7af60e: mov dword ptr fs:[0], esp
        R.esp = (R.sub((R.esp >>> 0), 0x230, 32)) | 0; // 7af615: sub esp, 0x230
        R.push((R.esi >>> 0)); // 7af61b: push esi
        R.esi = ((R.ecx >>> 0)) | 0; // 7af61c: mov esi, ecx
        R.ecx = (((R.esp + 0x14) | 0)) | 0; // 7af61e: lea ecx, [esp + 0x14]
        R.call(0x54a110, { n: 0, thisEcx: true, calleeClean: false }); // 7af622: call 0x54a110
        R.ecx = (((R.esp + 0x1c) | 0)) | 0; // 7af627: lea ecx, [esp + 0x1c]
        R.m.w32(((R.esp + 0x23c) | 0) >>> 0, 0x0); // 7af62b: mov dword ptr [esp + 0x23c], 0
        R.call(0x54a110, { n: 0, thisEcx: true, calleeClean: false }); // 7af636: call 0x54a110
        R.eax = (R.m.u32(((R.esp + 0x244) | 0) >>> 0)) | 0; // 7af63b: mov eax, dword ptr [esp + 0x244]
        R.m.w32(((R.esp + 0x23c) | 0) >>> 0, 0x1); // 7af642: mov dword ptr [esp + 0x23c], 1
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 7af64d: test eax, eax
        if (!R.zf) { pc = 0x7af6ce; continue; } // 7af64f: jne 0x7af6ce
        pc = 0x7af651; continue;
      case 0x7af651:
        R.eax = (((R.esp + 0x34) | 0)) | 0; // 7af651: lea eax, [esp + 0x34]
        R.ecx = (((R.esp + 0x134) | 0)) | 0; // 7af655: lea ecx, [esp + 0x134]
        R.push((R.eax >>> 0)); // 7af65c: push eax
        R.push((R.ecx >>> 0)); // 7af65d: push ecx
        R.push(0x0); // 7af65e: push 0
        R.push(0x0); // 7af660: push 0
        R.push(0xa701b0); // 7af662: push 0xa701b0
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 7af667: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 7af66c: add esp, 0x14
        R.edx = (((R.esp + 0x34) | 0)) | 0; // 7af66f: lea edx, [esp + 0x34]
        R.eax = (((R.esp + 0x134) | 0)) | 0; // 7af673: lea eax, [esp + 0x134]
        R.push(0x33e); // 7af67a: push 0x33e
        R.push((R.edx >>> 0)); // 7af67f: push edx
        R.push((R.eax >>> 0)); // 7af680: push eax
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 7af681: call 0x90d130
        R.push((R.eax >>> 0)); // 7af686: push eax
        R.push(0x9870e8); // 7af687: push 0x9870e8
        R.push(0xae24d0); // 7af68c: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 7af691: call 0x944c9f
        R.push(0x0); // 7af696: push 0
        R.push(0xae24d0); // 7af698: push 0xae24d0
        R.push(0x9870e0); // 7af69d: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 7af6a2: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 7af6a7: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 7af6aa: mov dword ptr [0xb67a34], 0
        pc = 0x7af6b4; continue;
      case 0x7af6b4:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 7af6b4: xor eax, eax
        pc = 0x7af6b6; continue;
      case 0x7af6b6:
        R.ecx = (R.m.u32(((R.esp + 0x234) | 0) >>> 0)) | 0; // 7af6b6: mov ecx, dword ptr [esp + 0x234]
        R.esi = (R.pop()) | 0; // 7af6bd: pop esi
        /* fs */ // 7af6be: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x23c, 32)) | 0; // 7af6c5: add esp, 0x23c
        return R.eax; // 7af6cb: ret 4
      case 0x7af6ce:
        R.ecx = (R.m.u32(((R.esi + 0x1f6) | 0) >>> 0)) | 0; // 7af6ce: mov ecx, dword ptr [esi + 0x1f6]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 7af6d4: test ecx, ecx
        if (R.zf) { pc = 0x7af6b4; continue; } // 7af6d6: je 0x7af6b4
        pc = 0x7af6d8; continue;
      case 0x7af6d8:
        R.ecx = (((R.esp + 0x4) | 0)) | 0; // 7af6d8: lea ecx, [esp + 4]
        R.push((R.ecx >>> 0)); // 7af6dc: push ecx
        R.push((R.eax >>> 0)); // 7af6dd: push eax
        R.call(0x7e4920, { n: 0, thisEcx: false, calleeClean: false }); // 7af6de: call 0x7e4920
        R.edx = (R.m.u32(((R.esi + 0x1f6) | 0) >>> 0)) | 0; // 7af6e3: mov edx, dword ptr [esi + 0x1f6]
        R.eax = (R.m.u32(((R.esi + 0x1ee) | 0) >>> 0)) | 0; // 7af6e9: mov eax, dword ptr [esi + 0x1ee]
        R.push(0x7bce50); // 7af6ef: push 0x7bce50
        R.push(0x2d); // 7af6f4: push 0x2d
        R.push((R.edx >>> 0)); // 7af6f6: push edx
        R.ecx = (((R.esp + 0x18) | 0)) | 0; // 7af6f7: lea ecx, [esp + 0x18]
        R.push((R.eax >>> 0)); // 7af6fb: push eax
        R.push((R.ecx >>> 0)); // 7af6fc: push ecx
        R.call(0x946464, { n: 7, thisEcx: false, calleeClean: false }); // 7af6fd: call 0x946464
        R.esp = (R.add((R.esp >>> 0), 0x1c, 32)) | 0; // 7af702: add esp, 0x1c
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 7af705: test eax, eax
        if (R.zf) { pc = 0x7af6b4; continue; } // 7af707: je 0x7af6b4
        pc = 0x7af709; continue;
      case 0x7af709:
        R.logic(R.m.u8(((R.eax + 0x20) | 0) >>> 0) & 0x1, 8); // 7af709: test byte ptr [eax + 0x20], 1
        if (!R.zf) { pc = 0x7af6b4; continue; } // 7af70d: jne 0x7af6b4
        pc = 0x7af70f; continue;
      case 0x7af70f:
        R.eax = (0x1) | 0; // 7af70f: mov eax, 1
        pc = 0x7af6b6; continue; // 7af714: jmp 0x7af6b6
      default: throw new Error(`f_7af600: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
