// 0x8c16b0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4cf6d0=1c, 5e8290=9, 68d0d0=2tc, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_8c16b0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x8c16b0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x8c16b0:
        R.esp = (R.sub((R.esp >>> 0), 0x20c, 32)) | 0; // 8c16b0: sub esp, 0x20c
        R.push((R.esi >>> 0)); // 8c16b6: push esi
        R.push((R.edi >>> 0)); // 8c16b7: push edi
        R.edi = (R.m.u32(((R.esp + 0x218) | 0) >>> 0)) | 0; // 8c16b8: mov edi, dword ptr [esp + 0x218]
        R.esi = ((R.ecx >>> 0)) | 0; // 8c16bf: mov esi, ecx
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8c16c1: mov ecx, dword ptr [0xae1050]
        R.push((R.edi >>> 0)); // 8c16c7: push edi
        R.call(0x4cf6d0, { n: 1, thisEcx: false, calleeClean: true }); // 8c16c8: call 0x4cf6d0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c16cd: test eax, eax
        if (R.zf) { pc = 0x8c173f; continue; } // 8c16cf: je 0x8c173f
        pc = 0x8c16d1; continue;
      case 0x8c16d1:
        R.eax = (((R.esp + 0x14) | 0)) | 0; // 8c16d1: lea eax, [esp + 0x14]
        R.ecx = (((R.esp + 0x114) | 0)) | 0; // 8c16d5: lea ecx, [esp + 0x114]
        R.push((R.eax >>> 0)); // 8c16dc: push eax
        R.push((R.ecx >>> 0)); // 8c16dd: push ecx
        R.push(0x0); // 8c16de: push 0
        R.push(0x0); // 8c16e0: push 0
        R.push(0xa8d514); // 8c16e2: push 0xa8d514
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 8c16e7: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8c16ec: add esp, 0x14
        R.edx = (((R.esp + 0x14) | 0)) | 0; // 8c16ef: lea edx, [esp + 0x14]
        R.eax = (((R.esp + 0x114) | 0)) | 0; // 8c16f3: lea eax, [esp + 0x114]
        R.push(0xbe6); // 8c16fa: push 0xbe6
        R.push((R.edx >>> 0)); // 8c16ff: push edx
        R.push((R.eax >>> 0)); // 8c1700: push eax
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 8c1701: call 0x90d130
        R.push((R.eax >>> 0)); // 8c1706: push eax
        R.push(0x9870e8); // 8c1707: push 0x9870e8
        R.push(0xae24d0); // 8c170c: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 8c1711: call 0x944c9f
        R.push(0x0); // 8c1716: push 0
        R.push(0xae24d0); // 8c1718: push 0xae24d0
        R.push(0x9870e0); // 8c171d: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 8c1722: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 8c1727: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 8c172a: mov dword ptr [0xb67a34], 0
        R.edi = (R.pop()) | 0; // 8c1734: pop edi
        R.esi = (R.pop()) | 0; // 8c1735: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x20c, 32)) | 0; // 8c1736: add esp, 0x20c
        return R.eax; // 8c173c: ret 0xc
      case 0x8c173f:
        R.ecx = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 8c173f: mov ecx, dword ptr [edi]
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.esp + 0x21c) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8c1741: mov dl, byte ptr [esp + 0x21c]
        R.eax = (R.m.u32(((R.esp + 0x220) | 0) >>> 0)) | 0; // 8c1748: mov eax, dword ptr [esp + 0x220]
        R.m.w32(((R.esp + 0x8) | 0) >>> 0, (R.ecx >>> 0)); // 8c174f: mov dword ptr [esp + 8], ecx
        R.ecx = (((R.esp + 0x8) | 0)) | 0; // 8c1753: lea ecx, [esp + 8]
        R.push(0x9); // 8c1757: push 9
        R.push((R.ecx >>> 0)); // 8c1759: push ecx
        R.ecx = (((R.esi + 0x92c) | 0)) | 0; // 8c175a: lea ecx, [esi + 0x92c]
        R.m.w8(((R.esp + 0x14) | 0) >>> 0, ((R.edx >>> 0) & 0xff)); // 8c1760: mov byte ptr [esp + 0x14], dl
        R.m.w32(((R.esp + 0x15) | 0) >>> 0, (R.eax >>> 0)); // 8c1764: mov dword ptr [esp + 0x15], eax
        R.call(0x68d0d0, { n: 2, thisEcx: true, calleeClean: true }); // 8c1768: call 0x68d0d0
        R.edi = (R.pop()) | 0; // 8c176d: pop edi
        R.esi = (R.pop()) | 0; // 8c176e: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x20c, 32)) | 0; // 8c176f: add esp, 0x20c
        return R.eax; // 8c1775: ret 0xc
      default: throw new Error(`f_8c16b0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
