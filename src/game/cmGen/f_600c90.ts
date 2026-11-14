// 0x600c90 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 53b3d0=1, 53b900=1, 5409b0=1, 5e8290=9, 5fd480=1c, 5fe040=1c, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x600c90, 0x600ca8, 0x600caf, 0x600cd0, 0x600cd8, 0x600ce0, 0x600cf4, 0x600d00, 0x600d17, 0x600d75, 0x600d83, 0x600d8b, 0x600dad, 0x600dbc, 0x600dcd, 0x600de1, 0x600dee, 0x600e04, 0x600e67, 0x600e73]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3]);
function f_600c90_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 600c90
        R.esp = (R.sub((R.esp >>> 0), 0x200, 32)) | 0; // 600c90: sub esp, 0x200
        R.push((R.ebp >>> 0)); // 600c96: push ebp
        R.push((R.esi >>> 0)); // 600c97: push esi
        R.push((R.edi >>> 0)); // 600c98: push edi
        R.edi = (R.m.u32(((R.esp + 0x210) | 0) >>> 0)) | 0; // 600c99: mov edi, dword ptr [esp + 0x210]
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 600ca0: test edi, edi
        if (R.zf) { pc = 17; continue; } // 600ca2: je 0x600e04
        pc = 1; continue;
      case 1: // 600ca8
        R.ebp = (R.m.u32(((R.esp + 0x214) | 0) >>> 0)) | 0; // 600ca8: mov ebp, dword ptr [esp + 0x214]
        pc = 2; continue;
      case 2: // 600caf
        R.eax = (((R.m.u16(((0xb77c7a) | 0) >>> 0)) << 16 >> 16)) | 0; // 600caf: movsx eax, word ptr [0xb77c7a]
        R.eax = (((R.eax + R.eax * 2) | 0)) | 0; // 600cb6: lea eax, [eax + eax*2]
        R.eax = (R.shl((R.eax >>> 0), 0x8, 32)) | 0; // 600cb9: shl eax, 8
        R.esi = (R.m.u32(((R.eax + 0xb74c26) | 0) >>> 0)) | 0; // 600cbc: mov esi, dword ptr [eax + 0xb74c26]
        R.eax = (R.m.u32(((R.edi + 0xcf) | 0) >>> 0)) | 0; // 600cc2: mov eax, dword ptr [edi + 0xcf]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 600cc8: test eax, eax
        if (R.zf) { pc = 15; continue; } // 600cca: je 0x600de1
        pc = 3; continue;
      case 3: // 600cd0
        R.sub((R.esi >>> 0), (R.eax >>> 0), 32); // 600cd0: cmp esi, eax
        if (!R.zf) { pc = 15; continue; } // 600cd2: jne 0x600de1
        pc = 4; continue;
      case 4: // 600cd8
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 600cd8: test ebp, ebp
        if (!R.zf) { pc = 12; continue; } // 600cda: jne 0x600dad
        pc = 5; continue;
      case 5: // 600ce0
        R.ecx = (R.m.u32(((0xb63c98) | 0) >>> 0)) | 0; // 600ce0: mov ecx, dword ptr [0xb63c98]
        R.push((R.esi >>> 0)); // 600ce6: push esi
        R.call(0x5fe040, { n: 1, thisEcx: false, calleeClean: true }); // 600ce7: call 0x5fe040
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 600cec: test eax, eax
        if (!R.zf) { pc = 15; continue; } // 600cee: jne 0x600de1
        pc = 6; continue;
      case 6: // 600cf4
        R.edx = (R.m.u32(((0xb63c98) | 0) >>> 0)) | 0; // 600cf4: mov edx, dword ptr [0xb63c98]
        R.eax = ((R.esi >>> 0)) | 0; // 600cfa: mov eax, esi
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 600cfc: test esi, esi
        if (!R.zf) { pc = 9; continue; } // 600cfe: jne 0x600d75
        pc = 7; continue;
      case 7: // 600d00
        R.eax = (((R.m.u16(((0xb77c7a) | 0) >>> 0)) << 16 >> 16)) | 0; // 600d00: movsx eax, word ptr [0xb77c7a]
        R.ecx = (((R.eax + R.eax * 2) | 0)) | 0; // 600d07: lea ecx, [eax + eax*2]
        R.ecx = (R.shl((R.ecx >>> 0), 0x8, 32)) | 0; // 600d0a: shl ecx, 8
        R.eax = (R.m.u32(((R.ecx + 0xb74c26) | 0) >>> 0)) | 0; // 600d0d: mov eax, dword ptr [ecx + 0xb74c26]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 600d13: test eax, eax
        if (!R.zf) { pc = 9; continue; } // 600d15: jne 0x600d75
        pc = 8; continue;
      default: return pc;
    }
  }
}
function f_600c90_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 8: // 600d17
        R.edx = (((R.esp + 0xc) | 0)) | 0; // 600d17: lea edx, [esp + 0xc]
        R.eax = (((R.esp + 0x10c) | 0)) | 0; // 600d1b: lea eax, [esp + 0x10c]
        R.push((R.edx >>> 0)); // 600d22: push edx
        R.push((R.eax >>> 0)); // 600d23: push eax
        R.push((R.esi >>> 0)); // 600d24: push esi
        R.push((R.esi >>> 0)); // 600d25: push esi
        R.push(0x9cf11c); // 600d26: push 0x9cf11c
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 600d2b: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 600d30: add esp, 0x14
        R.ecx = (((R.esp + 0xc) | 0)) | 0; // 600d33: lea ecx, [esp + 0xc]
        R.edx = (((R.esp + 0x10c) | 0)) | 0; // 600d37: lea edx, [esp + 0x10c]
        R.push(0x3e7); // 600d3e: push 0x3e7
        R.push((R.ecx >>> 0)); // 600d43: push ecx
        R.push((R.edx >>> 0)); // 600d44: push edx
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 600d45: call 0x90d130
        R.push((R.eax >>> 0)); // 600d4a: push eax
        R.push(0x9870e8); // 600d4b: push 0x9870e8
        R.push(0xae24d0); // 600d50: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 600d55: call 0x944c9f
        R.push((R.esi >>> 0)); // 600d5a: push esi
        R.push(0xae24d0); // 600d5b: push 0xae24d0
        R.push(0x9870e0); // 600d60: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 600d65: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 600d6a: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, (R.esi >>> 0)); // 600d6d: mov dword ptr [0xb67a34], esi
        pc = 12; continue; // 600d73: jmp 0x600dad
      case 9: // 600d75
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 600d75: mov ecx, dword ptr [eax]
        R.eax = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 600d77: mov eax, dword ptr [0xae2364]
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 600d7c: sub ecx, eax
        R.ecx = (R.add((R.ecx >>> 0), 0x10, 32)) | 0; // 600d7e: add ecx, 0x10
        if (R.sf) { pc = 12; continue; } // 600d81: js 0x600dad
        pc = 10; continue;
      case 10: // 600d83
        R.eax = (R.m.u32(((R.edx + 0x4) | 0) >>> 0)) | 0; // 600d83: mov eax, dword ptr [edx + 4]
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 600d86: dec eax
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 600d87: cmp ecx, eax
        if (!R.cLE) { pc = 12; continue; } // 600d89: jg 0x600dad
        pc = 11; continue;
      case 11: // 600d8b
        R.eax = (((R.ecx + R.ecx * 4) | 0)) | 0; // 600d8b: lea eax, [ecx + ecx*4]
        R.edx = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 600d8e: mov edx, dword ptr [edx]
        R.eax = (((R.eax + R.eax * 8) | 0)) | 0; // 600d90: lea eax, [eax + eax*8]
        R.eax = (R.shl((R.eax >>> 0), 0x1, 32)) | 0; // 600d93: shl eax, 1
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 600d95: sub eax, ecx
        R.eax = (R.shl((R.eax >>> 0), 0x5, 32)) | 0; // 600d97: shl eax, 5
        R.eax = (R.add((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 600d9a: add eax, ecx
        R.eax = (((R.eax + R.eax * 2) | 0)) | 0; // 600d9c: lea eax, [eax + eax*2]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 600d9f: lea ecx, [eax + eax*4]
        R.eax = (R.m.u32(((R.ecx + R.edx + 0x9a01) | 0) >>> 0)) | 0; // 600da2: mov eax, dword ptr [ecx + edx + 0x9a01]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 600da9: test eax, eax
        if (!R.zf) { pc = 15; continue; } // 600dab: jne 0x600de1
        pc = 12; continue;
      case 12: // 600dad
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x218) | 0) >>> 0)) & 0xff) << 0)) | 0; // 600dad: mov al, byte ptr [esp + 0x218]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 600db4: test al, al
        if (!R.zf) { pc = 19; continue; } // 600db6: jne 0x600e73
        pc = 13; continue;
      default: return pc;
    }
  }
}
function f_600c90_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 13: // 600dbc
        R.push((R.edi >>> 0)); // 600dbc: push edi
        R.call(0x53b900, { n: 1, thisEcx: false, calleeClean: false }); // 600dbd: call 0x53b900
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 600dc2: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 600dc5: test eax, eax
        if (!R.zf) { pc = 19; continue; } // 600dc7: jne 0x600e73
        pc = 14; continue;
      case 14: // 600dcd
        R.ecx = (R.m.u32(((0xb63c98) | 0) >>> 0)) | 0; // 600dcd: mov ecx, dword ptr [0xb63c98]
        R.push((R.esi >>> 0)); // 600dd3: push esi
        R.call(0x5fd480, { n: 1, thisEcx: false, calleeClean: true }); // 600dd4: call 0x5fd480
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 600dd9: test eax, eax
        if (!R.zf) { pc = 19; continue; } // 600ddb: jne 0x600e73
        pc = 15; continue;
      case 15: // 600de1
        R.push((R.edi >>> 0)); // 600de1: push edi
        R.call(0x5409b0, { n: 1, thisEcx: false, calleeClean: false }); // 600de2: call 0x5409b0
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 600de7: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 600dea: test eax, eax
        if (R.zf) { pc = 18; continue; } // 600dec: je 0x600e67
        pc = 16; continue;
      case 16: // 600dee
        R.eax = (R.m.u32(((R.edi + 0x53) | 0) >>> 0)) | 0; // 600dee: mov eax, dword ptr [edi + 0x53]
        R.push((R.eax >>> 0)); // 600df1: push eax
        R.call(0x53b3d0, { n: 1, thisEcx: false, calleeClean: false }); // 600df2: call 0x53b3d0
        R.edi = ((R.eax >>> 0)) | 0; // 600df7: mov edi, eax
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 600df9: add esp, 4
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 600dfc: test edi, edi
        if (!R.zf) { pc = 2; continue; } // 600dfe: jne 0x600caf
        pc = 17; continue;
      case 17: // 600e04
        R.ecx = (((R.esp + 0x10c) | 0)) | 0; // 600e04: lea ecx, [esp + 0x10c]
        R.edx = (((R.esp + 0xc) | 0)) | 0; // 600e0b: lea edx, [esp + 0xc]
        R.push((R.ecx >>> 0)); // 600e0f: push ecx
        R.push((R.edx >>> 0)); // 600e10: push edx
        R.push(0x0); // 600e11: push 0
        R.push(0x0); // 600e13: push 0
        R.push(0x9cf11c); // 600e15: push 0x9cf11c
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 600e1a: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 600e1f: add esp, 0x14
        R.eax = (((R.esp + 0x10c) | 0)) | 0; // 600e22: lea eax, [esp + 0x10c]
        R.ecx = (((R.esp + 0xc) | 0)) | 0; // 600e29: lea ecx, [esp + 0xc]
        R.push(0xb3f); // 600e2d: push 0xb3f
        R.push((R.eax >>> 0)); // 600e32: push eax
        R.push((R.ecx >>> 0)); // 600e33: push ecx
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 600e34: call 0x90d130
        R.push((R.eax >>> 0)); // 600e39: push eax
        R.push(0x9870e8); // 600e3a: push 0x9870e8
        R.push(0xae24d0); // 600e3f: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 600e44: call 0x944c9f
        R.push(0x0); // 600e49: push 0
        R.push(0xae24d0); // 600e4b: push 0xae24d0
        R.push(0x9870e0); // 600e50: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 600e55: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 600e5a: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 600e5d: mov dword ptr [0xb67a34], 0
        pc = 18; continue;
      default: return pc;
    }
  }
}
function f_600c90_3(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 18: // 600e67
        R.edi = (R.pop()) | 0; // 600e67: pop edi
        R.esi = (R.pop()) | 0; // 600e68: pop esi
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 600e69: xor eax, eax
        R.ebp = (R.pop()) | 0; // 600e6b: pop ebp
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 600e6c: add esp, 0x200
        R.rv = R.ret(0); return -1; // 600e72: ret 
      case 19: // 600e73
        R.edi = (R.pop()) | 0; // 600e73: pop edi
        R.esi = (R.pop()) | 0; // 600e74: pop esi
        R.eax = (0x1) | 0; // 600e75: mov eax, 1
        R.ebp = (R.pop()) | 0; // 600e7a: pop ebp
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 600e7b: add esp, 0x200
        R.rv = R.ret(0); return -1; // 600e81: ret 
      default: return pc;
    }
  }
}
export function f_600c90(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 20) throw new Error(`f_600c90: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_600c90_0(R, pc); break;
      case 1: np = f_600c90_1(R, pc); break;
      case 2: np = f_600c90_2(R, pc); break;
      case 3: np = f_600c90_3(R, pc); break;
      default: throw new Error(`f_600c90: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_600c90: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_600c90.shared = true;
