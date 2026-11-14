// 0x8b4cd0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 5e8290=9, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_8b4cd0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x8b4cd0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x8b4cd0:
        R.edx = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 8b4cd0: mov edx, dword ptr [esp + 4]
        R.esp = (R.sub((R.esp >>> 0), 0x200, 32)) | 0; // 8b4cd4: sub esp, 0x200
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 8b4cda: test edx, edx
        if (!R.zf) { pc = 0x8b4d0d; continue; } // 8b4cdc: jne 0x8b4d0d
        pc = 0x8b4cde; continue;
      case 0x8b4cde:
        R.eax = (((R.esp) | 0)) | 0; // 8b4cde: lea eax, [esp]
        R.ecx = (((R.esp + 0x100) | 0)) | 0; // 8b4ce2: lea ecx, [esp + 0x100]
        R.push((R.eax >>> 0)); // 8b4ce9: push eax
        R.push((R.ecx >>> 0)); // 8b4cea: push ecx
        R.push((R.edx >>> 0)); // 8b4ceb: push edx
        R.push((R.edx >>> 0)); // 8b4cec: push edx
        R.push(0xa8ccd0); // 8b4ced: push 0xa8ccd0
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 8b4cf2: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8b4cf7: add esp, 0x14
        R.edx = (((R.esp) | 0)) | 0; // 8b4cfa: lea edx, [esp]
        R.eax = (((R.esp + 0x100) | 0)) | 0; // 8b4cfe: lea eax, [esp + 0x100]
        R.push(0xa20); // 8b4d05: push 0xa20
        R.push((R.edx >>> 0)); // 8b4d0a: push edx
        pc = 0x8b4d65; continue; // 8b4d0b: jmp 0x8b4d65
      case 0x8b4d0d:
        R.eax = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 8b4d0d: mov eax, dword ptr [0xae2364]
        R.push((R.edi >>> 0)); // 8b4d12: push edi
        R.edi = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 8b4d13: mov edi, dword ptr [edx]
        R.eax = (R.sub((R.eax >>> 0), (R.edi >>> 0), 32)) | 0; // 8b4d15: sub eax, edi
        R.edi = (R.pop()) | 0; // 8b4d17: pop edi
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 8b4d18: dec eax
        if (R.sf) { pc = 0x8b4d36; continue; } // 8b4d19: js 0x8b4d36
        pc = 0x8b4d1b; continue;
      case 0x8b4d1b:
        R.sub((R.eax >>> 0), 0x10, 32); // 8b4d1b: cmp eax, 0x10
        if (!R.cL) { pc = 0x8b4d36; continue; } // 8b4d1e: jge 0x8b4d36
        pc = 0x8b4d20; continue;
      case 0x8b4d20:
        R.eax = (((R.eax + R.eax * 2) | 0)) | 0; // 8b4d20: lea eax, [eax + eax*2]
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 8b4d23: lea edx, [eax + eax*8]
        R.eax = (((R.ecx + R.edx * 2 + 0x652d) | 0)) | 0; // 8b4d26: lea eax, [ecx + edx*2 + 0x652d]
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 8b4d2d: add esp, 0x200
        return R.ret(1); // 8b4d33: ret 4
      case 0x8b4d36:
        R.eax = (((R.esp + 0x100) | 0)) | 0; // 8b4d36: lea eax, [esp + 0x100]
        R.ecx = (((R.esp) | 0)) | 0; // 8b4d3d: lea ecx, [esp]
        R.push((R.eax >>> 0)); // 8b4d41: push eax
        R.push((R.ecx >>> 0)); // 8b4d42: push ecx
        R.push(0x0); // 8b4d43: push 0
        R.push(0x0); // 8b4d45: push 0
        R.push(0xa8ccd0); // 8b4d47: push 0xa8ccd0
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 8b4d4c: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8b4d51: add esp, 0x14
        R.edx = (((R.esp + 0x100) | 0)) | 0; // 8b4d54: lea edx, [esp + 0x100]
        R.eax = (((R.esp) | 0)) | 0; // 8b4d5b: lea eax, [esp]
        R.push(0xa2a); // 8b4d5f: push 0xa2a
        R.push((R.edx >>> 0)); // 8b4d64: push edx
        pc = 0x8b4d65; continue;
      case 0x8b4d65:
        R.push((R.eax >>> 0)); // 8b4d65: push eax
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 8b4d66: call 0x90d130
        R.push((R.eax >>> 0)); // 8b4d6b: push eax
        R.push(0x9870e8); // 8b4d6c: push 0x9870e8
        R.push(0xae24d0); // 8b4d71: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 8b4d76: call 0x944c9f
        R.push(0x0); // 8b4d7b: push 0
        R.push(0xae24d0); // 8b4d7d: push 0xae24d0
        R.push(0x9870e0); // 8b4d82: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 8b4d87: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 8b4d8c: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 8b4d8f: mov dword ptr [0xb67a34], 0
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8b4d99: xor eax, eax
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 8b4d9b: add esp, 0x200
        return R.ret(1); // 8b4da1: ret 4
      default: throw new Error(`f_8b4cd0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
