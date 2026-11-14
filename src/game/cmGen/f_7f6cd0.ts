// 0x7f6cd0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 5e8290=9, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_7f6cd0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x7f6cd0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x7f6cd0:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.esp + 0x4) | 0) >>> 0)) & 0xff) << 0)) | 0; // 7f6cd0: mov dl, byte ptr [esp + 4]
        R.esp = (R.sub((R.esp >>> 0), 0x200, 32)) | 0; // 7f6cd4: sub esp, 0x200
        R.logic(((R.edx >>> 0) & 0xff) & ((R.edx >>> 0) & 0xff), 8); // 7f6cda: test dl, dl
        if (R.cL) { pc = 0x7f6db4; continue; } // 7f6cdc: jl 0x7f6db4
        pc = 0x7f6ce2; continue;
      case 0x7f6ce2:
        R.sub(((R.edx >>> 0) & 0xff), 0x9, 8); // 7f6ce2: cmp dl, 9
        if (!R.cLE) { pc = 0x7f6db4; continue; } // 7f6ce5: jg 0x7f6db4
        pc = 0x7f6ceb; continue;
      case 0x7f6ceb:
        R.eax = (R.m.u32(((R.esp + 0x208) | 0) >>> 0)) | 0; // 7f6ceb: mov eax, dword ptr [esp + 0x208]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 7f6cf2: test eax, eax
        if (!R.zf) { pc = 0x7f6d3f; continue; } // 7f6cf4: jne 0x7f6d3f
        pc = 0x7f6cf6; continue;
      case 0x7f6cf6:
        R.eax = (((R.m.u16(((0xb77c7a) | 0) >>> 0)) << 16 >> 16)) | 0; // 7f6cf6: movsx eax, word ptr [0xb77c7a]
        R.eax = (((R.eax + R.eax * 2) | 0)) | 0; // 7f6cfd: lea eax, [eax + eax*2]
        R.eax = (R.shl((R.eax >>> 0), 0x8, 32)) | 0; // 7f6d00: shl eax, 8
        R.eax = (R.m.u32(((R.eax + 0xb74c26) | 0) >>> 0)) | 0; // 7f6d03: mov eax, dword ptr [eax + 0xb74c26]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 7f6d09: test eax, eax
        if (!R.zf) { pc = 0x7f6d3f; continue; } // 7f6d0b: jne 0x7f6d3f
        pc = 0x7f6d0d; continue;
      case 0x7f6d0d:
        R.ecx = (((R.esp) | 0)) | 0; // 7f6d0d: lea ecx, [esp]
        R.edx = (((R.esp + 0x100) | 0)) | 0; // 7f6d11: lea edx, [esp + 0x100]
        R.push((R.ecx >>> 0)); // 7f6d18: push ecx
        R.push((R.edx >>> 0)); // 7f6d19: push edx
        R.push((R.eax >>> 0)); // 7f6d1a: push eax
        R.push((R.eax >>> 0)); // 7f6d1b: push eax
        R.push(0xa7b094); // 7f6d1c: push 0xa7b094
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 7f6d21: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 7f6d26: add esp, 0x14
        R.eax = (((R.esp) | 0)) | 0; // 7f6d29: lea eax, [esp]
        R.ecx = (((R.esp + 0x100) | 0)) | 0; // 7f6d2d: lea ecx, [esp + 0x100]
        R.push(0x109); // 7f6d34: push 0x109
        R.push((R.eax >>> 0)); // 7f6d39: push eax
        pc = 0x7f6de3; continue; // 7f6d3a: jmp 0x7f6de3
      case 0x7f6d3f:
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 7f6d3f: mov eax, dword ptr [eax]
        R.push((R.esi >>> 0)); // 7f6d41: push esi
        R.esi = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 7f6d42: mov esi, dword ptr [0xae2364]
        R.eax = (R.sub((R.eax >>> 0), (R.esi >>> 0), 32)) | 0; // 7f6d48: sub eax, esi
        R.esi = (R.pop()) | 0; // 7f6d4a: pop esi
        R.eax = (R.add((R.eax >>> 0), 0x10, 32)) | 0; // 7f6d4b: add eax, 0x10
        R.edx = (((((R.edx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 7f6d4e: movsx edx, dl
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 7f6d51: lea eax, [eax + eax*4]
        R.eax = (((R.edx + R.eax * 2) | 0)) | 0; // 7f6d54: lea eax, [edx + eax*2]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 7f6d57: test eax, eax
        if (R.cL) { pc = 0x7f6d82; continue; } // 7f6d59: jl 0x7f6d82
        pc = 0x7f6d5b; continue;
      case 0x7f6d5b:
        R.edx = (R.m.u32(((R.ecx + 0x8) | 0) >>> 0)) | 0; // 7f6d5b: mov edx, dword ptr [ecx + 8]
        R.edx = (R.incdec((R.edx >>> 0), -1, 32)) | 0; // 7f6d5e: dec edx
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 7f6d5f: cmp eax, edx
        if (!R.cLE) { pc = 0x7f6d82; continue; } // 7f6d61: jg 0x7f6d82
        pc = 0x7f6d63; continue;
      case 0x7f6d63:
        R.edx = (((R.eax * 8) | 0)) | 0; // 7f6d63: lea edx, [eax*8]
        R.edx = (R.sub((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 7f6d6a: sub edx, eax
        R.edx = (((R.edx + R.edx * 2) | 0)) | 0; // 7f6d6c: lea edx, [edx + edx*2]
        R.eax = (((R.eax + R.edx * 2) | 0)) | 0; // 7f6d6f: lea eax, [eax + edx*2]
        R.edx = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 7f6d72: mov edx, dword ptr [ecx]
        R.eax = (R.shl((R.eax >>> 0), 0x4, 32)) | 0; // 7f6d74: shl eax, 4
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 7f6d77: add eax, edx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 7f6d79: add esp, 0x200
        return R.ret(2); // 7f6d7f: ret 8
      case 0x7f6d82:
        R.eax = (((R.esp + 0x100) | 0)) | 0; // 7f6d82: lea eax, [esp + 0x100]
        R.ecx = (((R.esp) | 0)) | 0; // 7f6d89: lea ecx, [esp]
        R.push((R.eax >>> 0)); // 7f6d8d: push eax
        R.push((R.ecx >>> 0)); // 7f6d8e: push ecx
        R.push(0x0); // 7f6d8f: push 0
        R.push(0x0); // 7f6d91: push 0
        R.push(0xa7b094); // 7f6d93: push 0xa7b094
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 7f6d98: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 7f6d9d: add esp, 0x14
        R.edx = (((R.esp + 0x100) | 0)) | 0; // 7f6da0: lea edx, [esp + 0x100]
        R.eax = (((R.esp) | 0)) | 0; // 7f6da7: lea eax, [esp]
        R.push(0x113); // 7f6dab: push 0x113
        R.push((R.edx >>> 0)); // 7f6db0: push edx
        R.push((R.eax >>> 0)); // 7f6db1: push eax
        pc = 0x7f6de4; continue; // 7f6db2: jmp 0x7f6de4
      case 0x7f6db4:
        R.ecx = (((R.esp + 0x100) | 0)) | 0; // 7f6db4: lea ecx, [esp + 0x100]
        R.edx = (((R.esp) | 0)) | 0; // 7f6dbb: lea edx, [esp]
        R.push((R.ecx >>> 0)); // 7f6dbf: push ecx
        R.push((R.edx >>> 0)); // 7f6dc0: push edx
        R.push(0x0); // 7f6dc1: push 0
        R.push(0x0); // 7f6dc3: push 0
        R.push(0xa7b094); // 7f6dc5: push 0xa7b094
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 7f6dca: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 7f6dcf: add esp, 0x14
        R.eax = (((R.esp + 0x100) | 0)) | 0; // 7f6dd2: lea eax, [esp + 0x100]
        R.ecx = (((R.esp) | 0)) | 0; // 7f6dd9: lea ecx, [esp]
        R.push(0xff); // 7f6ddd: push 0xff
        R.push((R.eax >>> 0)); // 7f6de2: push eax
        pc = 0x7f6de3; continue;
      case 0x7f6de3:
        R.push((R.ecx >>> 0)); // 7f6de3: push ecx
        pc = 0x7f6de4; continue;
      case 0x7f6de4:
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 7f6de4: call 0x90d130
        R.push((R.eax >>> 0)); // 7f6de9: push eax
        R.push(0x9870e8); // 7f6dea: push 0x9870e8
        R.push(0xae24d0); // 7f6def: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 7f6df4: call 0x944c9f
        R.push(0x0); // 7f6df9: push 0
        R.push(0xae24d0); // 7f6dfb: push 0xae24d0
        R.push(0x9870e0); // 7f6e00: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 7f6e05: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 7f6e0a: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 7f6e0d: mov dword ptr [0xb67a34], 0
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 7f6e17: xor eax, eax
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 7f6e19: add esp, 0x200
        return R.ret(2); // 7f6e1f: ret 8
      default: throw new Error(`f_7f6cd0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
