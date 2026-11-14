// 0x897bb0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 5e8290=9, 8982b0=2c, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_897bb0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x897bb0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x897bb0:
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 897bb0: mov eax, dword ptr [esp + 4]
        R.esp = (R.sub((R.esp >>> 0), 0x200, 32)) | 0; // 897bb4: sub esp, 0x200
        R.push((R.ebx >>> 0)); // 897bba: push ebx
        R.push((R.ebp >>> 0)); // 897bbb: push ebp
        R.push((R.esi >>> 0)); // 897bbc: push esi
        R.esi = (R.logic((R.esi >>> 0) ^ (R.esi >>> 0), 32)) | 0; // 897bbd: xor esi, esi
        R.sub((R.eax >>> 0), (R.esi >>> 0), 32); // 897bbf: cmp eax, esi
        R.ebp = ((R.ecx >>> 0)) | 0; // 897bc1: mov ebp, ecx
        if (!R.zf) { pc = 0x897bf7; continue; } // 897bc3: jne 0x897bf7
        pc = 0x897bc5; continue;
      case 0x897bc5:
        R.eax = (((R.esp + 0xc) | 0)) | 0; // 897bc5: lea eax, [esp + 0xc]
        R.ecx = (((R.esp + 0x10c) | 0)) | 0; // 897bc9: lea ecx, [esp + 0x10c]
        R.push((R.eax >>> 0)); // 897bd0: push eax
        R.push((R.ecx >>> 0)); // 897bd1: push ecx
        R.push((R.esi >>> 0)); // 897bd2: push esi
        R.push((R.esi >>> 0)); // 897bd3: push esi
        R.push(0xa8b908); // 897bd4: push 0xa8b908
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 897bd9: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 897bde: add esp, 0x14
        R.edx = (((R.esp + 0xc) | 0)) | 0; // 897be1: lea edx, [esp + 0xc]
        R.eax = (((R.esp + 0x10c) | 0)) | 0; // 897be5: lea eax, [esp + 0x10c]
        R.push(0x605); // 897bec: push 0x605
        R.push((R.edx >>> 0)); // 897bf1: push edx
        pc = 0x897d75; continue; // 897bf2: jmp 0x897d75
      case 0x897bf7:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esp + 0x214) | 0) >>> 0)) & 0xff) << 0)) | 0; // 897bf7: mov cl, byte ptr [esp + 0x214]
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 897bfe: test cl, cl
        if (R.cL) { pc = 0x897d48; continue; } // 897c00: jl 0x897d48
        pc = 0x897c06; continue;
      case 0x897c06:
        R.sub(((R.ecx >>> 0) & 0xff), 0x4, 8); // 897c06: cmp cl, 4
        if (!R.cLE) { pc = 0x897d48; continue; } // 897c09: jg 0x897d48
        pc = 0x897c0f; continue;
      case 0x897c0f:
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.esp + 0x218) | 0) >>> 0)) & 0xff) << 0)) | 0; // 897c0f: mov bl, byte ptr [esp + 0x218]
        R.logic(((R.ebx >>> 0) & 0xff) & ((R.ebx >>> 0) & 0xff), 8); // 897c16: test bl, bl
        if (R.cL) { pc = 0x897d18; continue; } // 897c18: jl 0x897d18
        pc = 0x897c1e; continue;
      case 0x897c1e:
        R.sub(((R.ebx >>> 0) & 0xff), 0x1, 8); // 897c1e: cmp bl, 1
        if (!R.cLE) { pc = 0x897d18; continue; } // 897c21: jg 0x897d18
        pc = 0x897c27; continue;
      case 0x897c27:
        R.ecx = (R.m.u32(((R.esp + 0x220) | 0) >>> 0)) | 0; // 897c27: mov ecx, dword ptr [esp + 0x220]
        R.push((R.ecx >>> 0)); // 897c2e: push ecx
        R.push((R.eax >>> 0)); // 897c2f: push eax
        R.ecx = ((R.ebp >>> 0)) | 0; // 897c30: mov ecx, ebp
        R.call(0x8982b0, { n: 2, thisEcx: false, calleeClean: true }); // 897c32: call 0x8982b0
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 897c37: cmp eax, -1
        if (R.zf) { pc = 0x897da4; continue; } // 897c3a: je 0x897da4
        pc = 0x897c40; continue;
      case 0x897c40:
        R.ecx = (R.m.u32(((R.esp + 0x21c) | 0) >>> 0)) | 0; // 897c40: mov ecx, dword ptr [esp + 0x21c]
        R.push((R.edi >>> 0)); // 897c47: push edi
        R.edx = (((R.m.u8(((R.esp + 0x218) | 0) >>> 0)) << 24 >> 24)) | 0; // 897c48: movsx edx, byte ptr [esp + 0x218]
        R.sub((R.ecx >>> 0), (R.esi >>> 0), 32); // 897c50: cmp ecx, esi
        if (R.zf) { pc = 0x897c83; continue; } // 897c52: je 0x897c83
        pc = 0x897c54; continue;
      case 0x897c54:
        R.esi = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 897c54: movsx esi, bl
        R.edi = (R.pop()) | 0; // 897c57: pop edi
        R.edx = (((R.esi + R.edx * 2) | 0)) | 0; // 897c58: lea edx, [esi + edx*2]
        R.esi = (R.m.u32(((R.ebp + 0x601) | 0) >>> 0)) | 0; // 897c5b: mov esi, dword ptr [ebp + 0x601]
        R.edx = (((R.esi + R.edx * 4) | 0)) | 0; // 897c61: lea edx, [esi + edx*4]
        R.esi = (((R.eax + R.eax * 8) | 0)) | 0; // 897c64: lea esi, [eax + eax*8]
        R.esi = (R.shl((R.esi >>> 0), 0x4, 32)) | 0; // 897c67: shl esi, 4
        R.esi = (R.add((R.esi >>> 0), (R.eax >>> 0), 32)) | 0; // 897c6a: add esi, eax
        R.eax = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 897c6c: mov eax, dword ptr [ecx]
        R.m.w32(((R.edx + R.esi + 0x5e) | 0) >>> 0, (R.eax >>> 0)); // 897c6e: mov dword ptr [edx + esi + 0x5e], eax
        R.esi = (R.pop()) | 0; // 897c72: pop esi
        R.ebp = (R.pop()) | 0; // 897c73: pop ebp
        R.eax = (0x1) | 0; // 897c74: mov eax, 1
        R.ebx = (R.pop()) | 0; // 897c79: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 897c7a: add esp, 0x200
        return R.ret(5); // 897c80: ret 0x14
      case 0x897c83:
        R.esi = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 897c83: movsx esi, bl
        R.edi = (R.m.u32(((R.ebp + 0x601) | 0) >>> 0)) | 0; // 897c86: mov edi, dword ptr [ebp + 0x601]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 897c8c: lea ecx, [eax + eax*8]
        R.edx = (R.shl((R.edx >>> 0), 0x1, 32)) | 0; // 897c8f: shl edx, 1
        R.esi = (R.add((R.esi >>> 0), (R.edx >>> 0), 32)) | 0; // 897c91: add esi, edx
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 897c93: shl ecx, 4
        R.esi = (R.shl((R.esi >>> 0), 0x2, 32)) | 0; // 897c96: shl esi, 2
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 897c99: add ecx, eax
        R.sub(((R.ebx >>> 0) & 0xff), 0x1, 8); // 897c9b: cmp bl, 1
        R.eax = (((R.ecx + R.esi) | 0)) | 0; // 897c9e: lea eax, [ecx + esi]
        R.m.w32(((R.eax + R.edi + 0x5e) | 0) >>> 0, 0xffffffff); // 897ca1: mov dword ptr [eax + edi + 0x5e], 0xffffffff
        if (!R.cL) { pc = 0x897d06; continue; } // 897ca9: jge 0x897d06
        pc = 0x897cab; continue;
      case 0x897cab:
        R.ebx = ((R.ebx & 0xffffff00) | (((R.incdec(((R.ebx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 897cab: inc bl
        R.sub(((R.ebx >>> 0) & 0xff), 0x2, 8); // 897cad: cmp bl, 2
        if (!R.cL) { pc = 0x897d06; continue; } // 897cb0: jge 0x897d06
        pc = 0x897cb2; continue;
      case 0x897cb2:
        R.edi = (R.m.u32(((R.ebp + 0x601) | 0) >>> 0)) | 0; // 897cb2: mov edi, dword ptr [ebp + 0x601]
        pc = 0x897cb8; continue;
      case 0x897cb8:
        R.eax = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 897cb8: movsx eax, bl
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 897cbb: add eax, edx
        R.eax = (((R.ecx + R.eax * 4) | 0)) | 0; // 897cbd: lea eax, [ecx + eax*4]
        R.sub(R.m.u32(((R.eax + R.edi + 0x5e) | 0) >>> 0), 0xffffffff, 32); // 897cc0: cmp dword ptr [eax + edi + 0x5e], -1
        if (!R.cLE) { pc = 0x897ce0; continue; } // 897cc5: jg 0x897ce0
        pc = 0x897cc7; continue;
      case 0x897cc7:
        R.ebx = ((R.ebx & 0xffffff00) | (((R.incdec(((R.ebx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 897cc7: inc bl
        R.sub(((R.ebx >>> 0) & 0xff), 0x2, 8); // 897cc9: cmp bl, 2
        if (R.cL) { pc = 0x897cb8; continue; } // 897ccc: jl 0x897cb8
        pc = 0x897cce; continue;
      case 0x897cce:
        R.edi = (R.pop()) | 0; // 897cce: pop edi
        R.esi = (R.pop()) | 0; // 897ccf: pop esi
        R.ebp = (R.pop()) | 0; // 897cd0: pop ebp
        R.eax = (0x1) | 0; // 897cd1: mov eax, 1
        R.ebx = (R.pop()) | 0; // 897cd6: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 897cd7: add esp, 0x200
        return R.ret(5); // 897cdd: ret 0x14
      case 0x897ce0:
        R.eax = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 897ce0: movsx eax, bl
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 897ce3: add eax, edx
        R.ebx = (((R.ecx + R.edi) | 0)) | 0; // 897ce5: lea ebx, [ecx + edi]
        R.eax = (R.shl((R.eax >>> 0), 0x2, 32)) | 0; // 897ce8: shl eax, 2
        R.edx = (((R.eax + R.ecx) | 0)) | 0; // 897ceb: lea edx, [eax + ecx]
        R.eax = (R.add((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 897cee: add eax, ecx
        R.edx = (R.m.u32(((R.edx + R.edi + 0x5e) | 0) >>> 0)) | 0; // 897cf0: mov edx, dword ptr [edx + edi + 0x5e]
        R.m.w32(((R.ebx + R.esi + 0x5e) | 0) >>> 0, (R.edx >>> 0)); // 897cf4: mov dword ptr [ebx + esi + 0x5e], edx
        R.ecx = (R.m.u32(((R.ebp + 0x601) | 0) >>> 0)) | 0; // 897cf8: mov ecx, dword ptr [ebp + 0x601]
        R.m.w32(((R.eax + R.ecx + 0x5e) | 0) >>> 0, 0xffffffff); // 897cfe: mov dword ptr [eax + ecx + 0x5e], 0xffffffff
        pc = 0x897d06; continue;
      case 0x897d06:
        R.edi = (R.pop()) | 0; // 897d06: pop edi
        R.esi = (R.pop()) | 0; // 897d07: pop esi
        R.ebp = (R.pop()) | 0; // 897d08: pop ebp
        R.eax = (0x1) | 0; // 897d09: mov eax, 1
        R.ebx = (R.pop()) | 0; // 897d0e: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 897d0f: add esp, 0x200
        return R.ret(5); // 897d15: ret 0x14
      case 0x897d18:
        R.edx = (((R.esp + 0x10c) | 0)) | 0; // 897d18: lea edx, [esp + 0x10c]
        R.eax = (((R.esp + 0xc) | 0)) | 0; // 897d1f: lea eax, [esp + 0xc]
        R.push((R.edx >>> 0)); // 897d23: push edx
        R.push((R.eax >>> 0)); // 897d24: push eax
        R.push((R.esi >>> 0)); // 897d25: push esi
        R.push((R.esi >>> 0)); // 897d26: push esi
        R.push(0xa8b908); // 897d27: push 0xa8b908
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 897d2c: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 897d31: add esp, 0x14
        R.ecx = (((R.esp + 0x10c) | 0)) | 0; // 897d34: lea ecx, [esp + 0x10c]
        R.edx = (((R.esp + 0xc) | 0)) | 0; // 897d3b: lea edx, [esp + 0xc]
        R.push(0x615); // 897d3f: push 0x615
        R.push((R.ecx >>> 0)); // 897d44: push ecx
        R.push((R.edx >>> 0)); // 897d45: push edx
        pc = 0x897d76; continue; // 897d46: jmp 0x897d76
      case 0x897d48:
        R.eax = (((R.esp + 0x10c) | 0)) | 0; // 897d48: lea eax, [esp + 0x10c]
        R.ecx = (((R.esp + 0xc) | 0)) | 0; // 897d4f: lea ecx, [esp + 0xc]
        R.push((R.eax >>> 0)); // 897d53: push eax
        R.push((R.ecx >>> 0)); // 897d54: push ecx
        R.push((R.esi >>> 0)); // 897d55: push esi
        R.push((R.esi >>> 0)); // 897d56: push esi
        R.push(0xa8b908); // 897d57: push 0xa8b908
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 897d5c: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 897d61: add esp, 0x14
        R.edx = (((R.esp + 0x10c) | 0)) | 0; // 897d64: lea edx, [esp + 0x10c]
        R.eax = (((R.esp + 0xc) | 0)) | 0; // 897d6b: lea eax, [esp + 0xc]
        R.push(0x60d); // 897d6f: push 0x60d
        R.push((R.edx >>> 0)); // 897d74: push edx
        pc = 0x897d75; continue;
      case 0x897d75:
        R.push((R.eax >>> 0)); // 897d75: push eax
        pc = 0x897d76; continue;
      case 0x897d76:
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 897d76: call 0x90d130
        R.push((R.eax >>> 0)); // 897d7b: push eax
        R.push(0x9870e8); // 897d7c: push 0x9870e8
        R.push(0xae24d0); // 897d81: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 897d86: call 0x944c9f
        R.push((R.esi >>> 0)); // 897d8b: push esi
        R.push(0xae24d0); // 897d8c: push 0xae24d0
        R.push(0x9870e0); // 897d91: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 897d96: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 897d9b: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, (R.esi >>> 0)); // 897d9e: mov dword ptr [0xb67a34], esi
        pc = 0x897da4; continue;
      case 0x897da4:
        R.esi = (R.pop()) | 0; // 897da4: pop esi
        R.ebp = (R.pop()) | 0; // 897da5: pop ebp
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 897da6: xor eax, eax
        R.ebx = (R.pop()) | 0; // 897da8: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 897da9: add esp, 0x200
        return R.ret(5); // 897daf: ret 0x14
      default: throw new Error(`f_897bb0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
