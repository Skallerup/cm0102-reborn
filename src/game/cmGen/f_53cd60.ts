// 0x53cd60 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 540a50=3, 5e8290=9, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x53cd60, 0x53cd72, 0x53cdd8, 0x53cdec, 0x53ce00, 0x53ce06, 0x53ce0f, 0x53ce15, 0x53ce17, 0x53ce1c, 0x53ce2a, 0x53ce33, 0x53ce3a, 0x53ce3f, 0x53ce61, 0x53ce75]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2]);
function f_53cd60_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 53cd60
        R.esp = (R.sub((R.esp >>> 0), 0x200, 32)) | 0; // 53cd60: sub esp, 0x200
        R.push((R.esi >>> 0)); // 53cd66: push esi
        R.esi = (R.m.u32(((R.esp + 0x208) | 0) >>> 0)) | 0; // 53cd67: mov esi, dword ptr [esp + 0x208]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 53cd6e: test esi, esi
        if (!R.zf) { pc = 2; continue; } // 53cd70: jne 0x53cdd8
        pc = 1; continue;
      case 1: // 53cd72
        R.eax = (((R.esp + 0x4) | 0)) | 0; // 53cd72: lea eax, [esp + 4]
        R.ecx = (((R.esp + 0x104) | 0)) | 0; // 53cd76: lea ecx, [esp + 0x104]
        R.push((R.eax >>> 0)); // 53cd7d: push eax
        R.push((R.ecx >>> 0)); // 53cd7e: push ecx
        R.push((R.esi >>> 0)); // 53cd7f: push esi
        R.push((R.esi >>> 0)); // 53cd80: push esi
        R.push(0x9b5ac8); // 53cd81: push 0x9b5ac8
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 53cd86: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 53cd8b: add esp, 0x14
        R.edx = (((R.esp + 0x4) | 0)) | 0; // 53cd8e: lea edx, [esp + 4]
        R.eax = (((R.esp + 0x104) | 0)) | 0; // 53cd92: lea eax, [esp + 0x104]
        R.push(0x39d5); // 53cd99: push 0x39d5
        R.push((R.edx >>> 0)); // 53cd9e: push edx
        R.push((R.eax >>> 0)); // 53cd9f: push eax
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 53cda0: call 0x90d130
        R.push((R.eax >>> 0)); // 53cda5: push eax
        R.push(0x9870e8); // 53cda6: push 0x9870e8
        R.push(0xae24d0); // 53cdab: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 53cdb0: call 0x944c9f
        R.push((R.esi >>> 0)); // 53cdb5: push esi
        R.push(0xae24d0); // 53cdb6: push 0xae24d0
        R.push(0x9870e0); // 53cdbb: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 53cdc0: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 53cdc5: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, (R.esi >>> 0)); // 53cdc8: mov dword ptr [0xb67a34], esi
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53cdce: xor eax, eax
        R.esi = (R.pop()) | 0; // 53cdd0: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53cdd1: add esp, 0x200
        R.rv = R.ret(0); return -1; // 53cdd7: ret 
      case 2: // 53cdd8
        R.push((R.ebx >>> 0)); // 53cdd8: push ebx
        R.push((R.ebp >>> 0)); // 53cdd9: push ebp
        R.push((R.edi >>> 0)); // 53cdda: push edi
        R.push(0x1); // 53cddb: push 1
        R.push(0x0); // 53cddd: push 0
        R.push((R.esi >>> 0)); // 53cddf: push esi
        R.call(0x540a50, { n: 3, thisEcx: false, calleeClean: false }); // 53cde0: call 0x540a50
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 53cde5: add esp, 0xc
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 53cde8: test eax, eax
        if (R.zf) { pc = 14; continue; } // 53cdea: je 0x53ce61
        pc = 3; continue;
      case 3: // 53cdec
        R.ebp = (R.m.u32(((R.esp + 0x218) | 0) >>> 0)) | 0; // 53cdec: mov ebp, dword ptr [esp + 0x218]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) ^ ((R.ecx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 53cdf3: xor cl, cl
        R.esi = (R.add((R.esi >>> 0), 0x1b3, 32)) | 0; // 53cdf5: add esi, 0x1b3
        R.edi = (0x7) | 0; // 53cdfb: mov edi, 7
        pc = 4; continue;
      case 4: // 53ce00
        R.edx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 53ce00: mov edx, dword ptr [esi]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 53ce02: test edx, edx
        if (R.zf) { pc = 6; continue; } // 53ce04: je 0x53ce0f
        pc = 5; continue;
      default: return pc;
    }
  }
}
function f_53cd60_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 5: // 53ce06
        R.ebx = (((((R.ecx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 53ce06: movsx ebx, cl
        R.ecx = ((R.ecx & 0xffffff00) | (((R.incdec(((R.ecx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 53ce09: inc cl
        R.m.w32(((R.ebp + R.ebx * 4) | 0) >>> 0, (R.edx >>> 0)); // 53ce0b: mov dword ptr [ebp + ebx*4], edx
        pc = 6; continue;
      case 6: // 53ce0f
        R.esi = (R.add((R.esi >>> 0), 0x4, 32)) | 0; // 53ce0f: add esi, 4
        R.edi = (R.incdec((R.edi >>> 0), -1, 32)) | 0; // 53ce12: dec edi
        if (!R.zf) { pc = 4; continue; } // 53ce13: jne 0x53ce00
        pc = 7; continue;
      case 7: // 53ce15
        R.ebx = ((R.ebx & 0xffffff00) | (((R.logic(((R.ebx >>> 0) & 0xff) ^ ((R.ebx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 53ce15: xor bl, bl
        pc = 8; continue;
      case 8: // 53ce17
        R.sub(((R.ecx >>> 0) & 0xff), 0x7, 8); // 53ce17: cmp cl, 7
        if (!R.cL) { pc = 15; continue; } // 53ce1a: jge 0x53ce75
        pc = 9; continue;
      case 9: // 53ce1c
        R.edx = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 53ce1c: movsx edx, bl
        R.edx = (R.m.u32(((R.eax + R.edx * 4 + 0x1b3) | 0) >>> 0)) | 0; // 53ce1f: mov edx, dword ptr [eax + edx*4 + 0x1b3]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 53ce26: test edx, edx
        if (R.zf) { pc = 11; continue; } // 53ce28: je 0x53ce33
        pc = 10; continue;
      case 10: // 53ce2a
        R.esi = (((((R.ecx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 53ce2a: movsx esi, cl
        R.ecx = ((R.ecx & 0xffffff00) | (((R.incdec(((R.ecx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 53ce2d: inc cl
        R.m.w32(((R.ebp + R.esi * 4) | 0) >>> 0, (R.edx >>> 0)); // 53ce2f: mov dword ptr [ebp + esi*4], edx
        pc = 11; continue;
      case 11: // 53ce33
        R.ebx = ((R.ebx & 0xffffff00) | (((R.incdec(((R.ebx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 53ce33: inc bl
        R.sub(((R.ebx >>> 0) & 0xff), 0x7, 8); // 53ce35: cmp bl, 7
        if (R.cL) { pc = 8; continue; } // 53ce38: jl 0x53ce17
        pc = 12; continue;
      case 12: // 53ce3a
        R.sub(((R.ecx >>> 0) & 0xff), 0x7, 8); // 53ce3a: cmp cl, 7
        if (!R.cL) { pc = 15; continue; } // 53ce3d: jge 0x53ce75
        pc = 13; continue;
      case 13: // 53ce3f
        R.eax = (((((R.ecx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 53ce3f: movsx eax, cl
        R.ecx = (0x7) | 0; // 53ce42: mov ecx, 7
        R.edi = (((R.ebp + R.eax * 4) | 0)) | 0; // 53ce47: lea edi, [ebp + eax*4]
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 53ce4b: sub ecx, eax
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53ce4d: xor eax, eax
        R.str('rep stosd'); // 53ce4f: rep stosd dword ptr es:[edi], eax
        R.edi = (R.pop()) | 0; // 53ce51: pop edi
        R.ebp = (R.pop()) | 0; // 53ce52: pop ebp
        R.ebx = (R.pop()) | 0; // 53ce53: pop ebx
        R.eax = (0x1) | 0; // 53ce54: mov eax, 1
        R.esi = (R.pop()) | 0; // 53ce59: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53ce5a: add esp, 0x200
        R.rv = R.ret(0); return -1; // 53ce60: ret 
      case 14: // 53ce61
        R.edi = (R.m.u32(((R.esp + 0x218) | 0) >>> 0)) | 0; // 53ce61: mov edi, dword ptr [esp + 0x218]
        R.esi = (R.add((R.esi >>> 0), 0x1b3, 32)) | 0; // 53ce68: add esi, 0x1b3
        R.ecx = (0x7) | 0; // 53ce6e: mov ecx, 7
        R.str('rep movsd'); // 53ce73: rep movsd dword ptr es:[edi], dword ptr [esi]
        pc = 15; continue;
      default: return pc;
    }
  }
}
function f_53cd60_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 15: // 53ce75
        R.edi = (R.pop()) | 0; // 53ce75: pop edi
        R.ebp = (R.pop()) | 0; // 53ce76: pop ebp
        R.ebx = (R.pop()) | 0; // 53ce77: pop ebx
        R.eax = (0x1) | 0; // 53ce78: mov eax, 1
        R.esi = (R.pop()) | 0; // 53ce7d: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53ce7e: add esp, 0x200
        R.rv = R.ret(0); return -1; // 53ce84: ret 
      default: return pc;
    }
  }
}
export function f_53cd60(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 16) throw new Error(`f_53cd60: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_53cd60_0(R, pc); break;
      case 1: np = f_53cd60_1(R, pc); break;
      case 2: np = f_53cd60_2(R, pc); break;
      default: throw new Error(`f_53cd60: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_53cd60: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_53cd60.shared = true;
