// 0x68cfc0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 944cf1=0
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_68cfc0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x68cfc0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x68cfc0:
        R.push((R.ebx >>> 0)); // 68cfc0: push ebx
        R.push((R.esi >>> 0)); // 68cfc1: push esi
        R.push((R.edi >>> 0)); // 68cfc2: push edi
        R.edi = ((R.edi & 0xffff0000) | (((R.m.u16(((R.esp + 0x14) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 68cfc3: mov di, word ptr [esp + 0x14]
        R.esi = (((((R.edi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 68cfc8: movsx esi, di
        R.ebx = ((R.ecx >>> 0)) | 0; // 68cfcb: mov ebx, ecx
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 68cfcd: xor eax, eax
        R.push((R.esi >>> 0)); // 68cfcf: push esi
        R.m.w32(((R.ebx + 0xa) | 0) >>> 0, (R.eax >>> 0)); // 68cfd0: mov dword ptr [ebx + 0xa], eax
        R.m.w32(((R.ebx + 0x6) | 0) >>> 0, (R.eax >>> 0)); // 68cfd3: mov dword ptr [ebx + 6], eax
        R.call(0x944cf1, { n: 0, thisEcx: false, calleeClean: false }); // 68cfd6: call 0x944cf1
        R.m.w16(((R.ebx + 0x4) | 0) >>> 0, ((R.edi >>> 0) & 0xffff)); // 68cfdb: mov word ptr [ebx + 4], di
        R.ecx = ((R.esi >>> 0)) | 0; // 68cfdf: mov ecx, esi
        R.esi = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 68cfe1: mov esi, dword ptr [esp + 0x14]
        R.m.w32(((R.ebx) | 0) >>> 0, (R.eax >>> 0)); // 68cfe5: mov dword ptr [ebx], eax
        R.edi = ((R.eax >>> 0)) | 0; // 68cfe7: mov edi, eax
        R.eax = ((R.ecx >>> 0)) | 0; // 68cfe9: mov eax, ecx
        R.ecx = (R.shr((R.ecx >>> 0), 0x2, 32)) | 0; // 68cfeb: shr ecx, 2
        R.str('rep movsd'); // 68cfee: rep movsd dword ptr es:[edi], dword ptr [esi]
        R.ecx = ((R.eax >>> 0)) | 0; // 68cff0: mov ecx, eax
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 68cff2: add esp, 4
        R.ecx = (R.logic((R.ecx >>> 0) & 0x3, 32)) | 0; // 68cff5: and ecx, 3
        R.eax = ((R.ebx >>> 0)) | 0; // 68cff8: mov eax, ebx
        R.str('rep movsb'); // 68cffa: rep movsb byte ptr es:[edi], byte ptr [esi]
        R.edi = (R.pop()) | 0; // 68cffc: pop edi
        R.esi = (R.pop()) | 0; // 68cffd: pop esi
        R.ebx = (R.pop()) | 0; // 68cffe: pop ebx
        return R.eax; // 68cfff: ret 8
      default: throw new Error(`f_68cfc0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
