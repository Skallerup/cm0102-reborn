// 0x804540 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 7af600=1tc
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_804540(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x804540;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x804540:
        R.push((R.ebx >>> 0)); // 804540: push ebx
        R.push((R.esi >>> 0)); // 804541: push esi
        R.esi = ((R.ecx >>> 0)) | 0; // 804542: mov esi, ecx
        R.ebx = ((R.ebx & 0xffffff00) | (((R.logic(((R.ebx >>> 0) & 0xff) ^ ((R.ebx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 804544: xor bl, bl
        R.ecx = ((R.ecx & 0xffffff00) | (((0x1) & 0xff) << 0)) | 0; // 804546: mov cl, 1
        pc = 0x804548; continue;
      case 0x804548:
        R.edx = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 804548: movsx edx, bl
        R.eax = (((R.edx * 8) | 0)) | 0; // 80454b: lea eax, [edx*8]
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 804552: sub eax, edx
        R.eax = (((R.eax + R.eax * 2) | 0)) | 0; // 804554: lea eax, [eax + eax*2]
        R.edx = (((R.edx + R.eax * 2) | 0)) | 0; // 804557: lea edx, [edx + eax*2]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 80455a: shl edx, 4
        R.eax = (((R.edx + R.esi + 0x1) | 0)) | 0; // 80455d: lea eax, [edx + esi + 1]
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.edx + R.esi + 0xb) | 0) >>> 0)) & 0xff) << 0)) | 0; // 804561: mov dl, byte ptr [edx + esi + 0xb]
        R.sub(((R.edx >>> 0) & 0xff), ((R.ecx >>> 0) & 0xff), 8); // 804565: cmp dl, cl
        if (R.zf) { pc = 0x804577; continue; } // 804567: je 0x804577
        pc = 0x804569; continue;
      case 0x804569:
        R.ebx = ((R.ebx & 0xffffff00) | (((R.incdec(((R.ebx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 804569: inc bl
        R.sub(((R.ebx >>> 0) & 0xff), 0xa, 8); // 80456b: cmp bl, 0xa
        if (R.cL) { pc = 0x804548; continue; } // 80456e: jl 0x804548
        pc = 0x804570; continue;
      case 0x804570:
        R.esi = (R.pop()) | 0; // 804570: pop esi
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 804571: xor eax, eax
        R.ebx = (R.pop()) | 0; // 804573: pop ebx
        return R.eax; // 804574: ret 4
      case 0x804577:
        R.ecx = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 804577: mov ecx, dword ptr [esp + 0xc]
        R.push((R.ecx >>> 0)); // 80457b: push ecx
        R.ecx = ((R.eax >>> 0)) | 0; // 80457c: mov ecx, eax
        R.call(0x7af600, { n: 1, thisEcx: true, calleeClean: true }); // 80457e: call 0x7af600
        R.esi = (R.pop()) | 0; // 804583: pop esi
        R.ebx = (R.pop()) | 0; // 804584: pop ebx
        return R.eax; // 804585: ret 4
      default: throw new Error(`f_804540: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
