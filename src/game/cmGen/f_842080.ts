// 0x842080 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 946464=5
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_842080(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x842080;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x842080:
        R.eax = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 842080: mov eax, dword ptr [ecx]
        R.esp = (R.sub((R.esp >>> 0), 0x8, 32)) | 0; // 842082: sub esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 842085: test eax, eax
        if (!R.zf) { pc = 0x842091; continue; } // 842087: jne 0x842091
        pc = 0x842089; continue;
      case 0x842089:
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 842089: xor al, al
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 84208b: add esp, 8
        return R.ret(2); // 84208e: ret 8
      case 0x842091:
        R.edx = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 842091: mov edx, dword ptr [esp + 0xc]
        R.edx = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 842095: mov edx, dword ptr [edx]
        R.m.w32(((R.esp) | 0) >>> 0, (R.edx >>> 0)); // 842097: mov dword ptr [esp], edx
        R.edx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 84209b: mov edx, dword ptr [esp + 0x10]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 84209f: test edx, edx
        if (R.zf) { pc = 0x8420ab; continue; } // 8420a1: je 0x8420ab
        pc = 0x8420a3; continue;
      case 0x8420a3:
        R.edx = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 8420a3: mov edx, dword ptr [edx]
        R.m.w32(((R.esp + 0x4) | 0) >>> 0, (R.edx >>> 0)); // 8420a5: mov dword ptr [esp + 4], edx
        pc = 0x8420b3; continue; // 8420a9: jmp 0x8420b3
      case 0x8420ab:
        R.m.w32(((R.esp + 0x4) | 0) >>> 0, 0xffffffff); // 8420ab: mov dword ptr [esp + 4], 0xffffffff
        pc = 0x8420b3; continue;
      case 0x8420b3:
        R.ecx = (R.m.u32(((R.ecx + 0x10) | 0) >>> 0)) | 0; // 8420b3: mov ecx, dword ptr [ecx + 0x10]
        R.push(0x757ea0); // 8420b6: push 0x757ea0
        R.push(0x8); // 8420bb: push 8
        R.push((R.ecx >>> 0)); // 8420bd: push ecx
        R.edx = (((R.esp + 0xc) | 0)) | 0; // 8420be: lea edx, [esp + 0xc]
        R.push((R.eax >>> 0)); // 8420c2: push eax
        R.push((R.edx >>> 0)); // 8420c3: push edx
        R.call(0x946464, { n: 5, thisEcx: false, calleeClean: false }); // 8420c4: call 0x946464
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8420c9: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8420cc: test eax, eax
        R.eax = ((R.eax & 0xffffff00) | (((!R.zf ? 1 : 0) & 0xff) << 0)) | 0; // 8420ce: setne al
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 8420d1: add esp, 8
        return R.ret(2); // 8420d4: ret 8
      default: throw new Error(`f_842080: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
