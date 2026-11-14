// 0x7ae8a0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 53e990=5, 7e4920=2
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_7ae8a0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x7ae8a0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x7ae8a0:
        R.push((R.ebx >>> 0)); // 7ae8a0: push ebx
        R.push((R.esi >>> 0)); // 7ae8a1: push esi
        R.esi = ((R.ecx >>> 0)) | 0; // 7ae8a2: mov esi, ecx
        R.ebx = (R.logic((R.ebx >>> 0) | 0xffffffff, 32)) | 0; // 7ae8a4: or ebx, 0xffffffff
        R.eax = (R.m.u32(((R.esi + 0x180) | 0) >>> 0)) | 0; // 7ae8a7: mov eax, dword ptr [esi + 0x180]
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 7ae8ad: cmp eax, ebx
        if (R.cLE) { pc = 0x7ae905; continue; } // 7ae8af: jle 0x7ae905
        pc = 0x7ae8b1; continue;
      case 0x7ae8b1:
        R.edx = (R.m.u32(((R.esi + 0x17c) | 0) >>> 0)) | 0; // 7ae8b1: mov edx, dword ptr [esi + 0x17c]
        R.ecx = (((R.esi + 0x184) | 0)) | 0; // 7ae8b7: lea ecx, [esi + 0x184]
        R.push((R.ecx >>> 0)); // 7ae8bd: push ecx
        R.ecx = (R.m.u32(((R.esi + 0x178) | 0) >>> 0)) | 0; // 7ae8be: mov ecx, dword ptr [esi + 0x178]
        R.push((R.edx >>> 0)); // 7ae8c4: push edx
        R.edx = (R.m.u32(((R.esi + 0x174) | 0) >>> 0)) | 0; // 7ae8c5: mov edx, dword ptr [esi + 0x174]
        R.push((R.ecx >>> 0)); // 7ae8cb: push ecx
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 7ae8cc: lea ecx, [eax + eax*4]
        R.push((R.edx >>> 0)); // 7ae8cf: push edx
        R.eax = (((R.eax + R.ecx * 2) | 0)) | 0; // 7ae8d0: lea eax, [eax + ecx*2]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 7ae8d3: lea edx, [eax + eax*4]
        R.eax = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 7ae8d6: mov eax, dword ptr [0xae23bc]
        R.ecx = (((R.eax + R.edx * 2) | 0)) | 0; // 7ae8db: lea ecx, [eax + edx*2]
        R.push((R.ecx >>> 0)); // 7ae8de: push ecx
        R.call(0x53e990, { n: 5, thisEcx: false, calleeClean: false }); // 7ae8df: call 0x53e990
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 7ae8e4: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 7ae8e7: test eax, eax
        if (R.zf) { pc = 0x7ae905; continue; } // 7ae8e9: je 0x7ae905
        pc = 0x7ae8eb; continue;
      case 0x7ae8eb:
        R.eax = (R.m.u32(((R.esi + 0x180) | 0) >>> 0)) | 0; // 7ae8eb: mov eax, dword ptr [esi + 0x180]
        R.ecx = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 7ae8f1: mov ecx, dword ptr [0xae23bc]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 7ae8f7: lea edx, [eax + eax*4]
        R.eax = (((R.eax + R.edx * 2) | 0)) | 0; // 7ae8fa: lea eax, [eax + edx*2]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 7ae8fd: lea eax, [eax + eax*4]
        R.eax = (((R.ecx + R.eax * 2) | 0)) | 0; // 7ae900: lea eax, [ecx + eax*2]
        pc = 0x7ae907; continue; // 7ae903: jmp 0x7ae907
      case 0x7ae905:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 7ae905: xor eax, eax
        pc = 0x7ae907; continue;
      case 0x7ae907:
        R.ecx = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 7ae907: mov ecx, dword ptr [esp + 0xc]
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 7ae90b: cmp ecx, eax
        if (R.zf) { pc = 0x7ae93d; continue; } // 7ae90d: je 0x7ae93d
        pc = 0x7ae90f; continue;
      case 0x7ae90f:
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 7ae90f: test ecx, ecx
        if (R.zf) { pc = 0x7ae925; continue; } // 7ae911: je 0x7ae925
        pc = 0x7ae913; continue;
      case 0x7ae913:
        R.edx = (((R.esi + 0x174) | 0)) | 0; // 7ae913: lea edx, [esi + 0x174]
        R.push((R.edx >>> 0)); // 7ae919: push edx
        R.push((R.ecx >>> 0)); // 7ae91a: push ecx
        R.call(0x7e4920, { n: 2, thisEcx: false, calleeClean: false }); // 7ae91b: call 0x7e4920
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 7ae920: add esp, 8
        pc = 0x7ae92b; continue; // 7ae923: jmp 0x7ae92b
      case 0x7ae925:
        R.m.w32(((R.esi + 0x180) | 0) >>> 0, (R.ebx >>> 0)); // 7ae925: mov dword ptr [esi + 0x180], ebx
        pc = 0x7ae92b; continue;
      case 0x7ae92b:
        R.m.w32(((R.esi + 0x18c) | 0) >>> 0, (R.ebx >>> 0)); // 7ae92b: mov dword ptr [esi + 0x18c], ebx
        R.m.w8(((R.esi + 0x194) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 7ae931: mov byte ptr [esi + 0x194], bl
        R.m.w32(((R.esi + 0x195) | 0) >>> 0, (R.ebx >>> 0)); // 7ae937: mov dword ptr [esi + 0x195], ebx
        pc = 0x7ae93d; continue;
      case 0x7ae93d:
        R.esi = (R.pop()) | 0; // 7ae93d: pop esi
        R.eax = (0x1) | 0; // 7ae93e: mov eax, 1
        R.ebx = (R.pop()) | 0; // 7ae943: pop ebx
        return R.ret(1); // 7ae944: ret 4
      default: throw new Error(`f_7ae8a0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
