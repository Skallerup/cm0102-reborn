// 0x8c5fc0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4cf5a0=1c, 68d0d0=2tc, 68d1b0=0t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x8c5fc0, 0x8c5fd5, 0x8c5fe1, 0x8c5feb, 0x8c6000, 0x8c601a, 0x8c6024, 0x8c603d, 0x8c603e, 0x8c6048, 0x8c6053, 0x8c6063, 0x8c606a, 0x8c606e, 0x8c6072, 0x8c6076, 0x8c607a, 0x8c607e, 0x8c6082, 0x8c6088, 0x8c608f, 0x8c60a1, 0x8c60ab, 0x8c60b7, 0x8c60b9, 0x8c60c1, 0x8c60c9, 0x8c60cd, 0x8c60e4, 0x8c60e5]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]);
function f_8c5fc0_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 8c5fc0
        R.esp = (R.sub((R.esp >>> 0), 0xc, 32)) | 0; // 8c5fc0: sub esp, 0xc
        R.eax = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 8c5fc3: mov eax, dword ptr [esp + 0x10]
        R.push((R.ebp >>> 0)); // 8c5fc7: push ebp
        R.push((R.esi >>> 0)); // 8c5fc8: push esi
        R.esi = (R.logic((R.esi >>> 0) ^ (R.esi >>> 0), 32)) | 0; // 8c5fc9: xor esi, esi
        R.sub((R.eax >>> 0), (R.esi >>> 0), 32); // 8c5fcb: cmp eax, esi
        R.ebp = ((R.ecx >>> 0)) | 0; // 8c5fcd: mov ebp, ecx
        R.m.w32(((R.esp + 0x8) | 0) >>> 0, (R.esi >>> 0)); // 8c5fcf: mov dword ptr [esp + 8], esi
        if (R.zf) { pc = 3; continue; } // 8c5fd3: je 0x8c5feb
        pc = 1; continue;
      case 1: // 8c5fd5
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8c5fd5: mov ecx, dword ptr [eax]
        R.edx = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 8c5fd7: mov edx, dword ptr [0xae2364]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 8c5fdd: cmp ecx, edx
        if (R.cL) { pc = 3; continue; } // 8c5fdf: jl 0x8c5feb
        pc = 2; continue;
      case 2: // 8c5fe1
        R.esi = (R.pop()) | 0; // 8c5fe1: pop esi
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8c5fe2: xor eax, eax
        R.ebp = (R.pop()) | 0; // 8c5fe4: pop ebp
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 8c5fe5: add esp, 0xc
        R.rv = R.ret(2); return -1; // 8c5fe8: ret 8
      case 3: // 8c5feb
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8c5feb: mov ecx, dword ptr [0xae1050]
        R.push((R.eax >>> 0)); // 8c5ff1: push eax
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 8c5ff2: call 0x4cf5a0
        R.sub((R.eax >>> 0), (R.esi >>> 0), 32); // 8c5ff7: cmp eax, esi
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 8c5ff9: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 5; continue; } // 8c5ffe: je 0x8c601a
        pc = 4; continue;
      case 4: // 8c6000
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 8c6000: mov eax, dword ptr [eax + 4]
        R.ecx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 8c6003: mov ecx, dword ptr [0xae23b4]
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 8c6009: add ecx, eax
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 8c600b: lea edx, [eax + eax*8]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 8c600e: shl edx, 4
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8c6011: add edx, eax
        R.eax = (((R.ecx + R.edx * 4) | 0)) | 0; // 8c6013: lea eax, [ecx + edx*4]
        R.sub((R.eax >>> 0), (R.esi >>> 0), 32); // 8c6016: cmp eax, esi
        if (!R.zf) { pc = 6; continue; } // 8c6018: jne 0x8c6024
        pc = 5; continue;
      case 5: // 8c601a
        R.esi = (R.pop()) | 0; // 8c601a: pop esi
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8c601b: xor eax, eax
        R.ebp = (R.pop()) | 0; // 8c601d: pop ebp
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 8c601e: add esp, 0xc
        R.rv = R.ret(2); return -1; // 8c6021: ret 8
      case 6: // 8c6024
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8c6024: mov edx, dword ptr [eax]
        R.eax = (R.m.u32(((R.ebp + 0x10) | 0) >>> 0)) | 0; // 8c6026: mov eax, dword ptr [ebp + 0x10]
        R.push((R.ebx >>> 0)); // 8c6029: push ebx
        R.ebx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 8c602a: mov ebx, dword ptr [ebp + 0xc]
        R.sub((R.eax >>> 0), (R.esi >>> 0), 32); // 8c602d: cmp eax, esi
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edx >>> 0)); // 8c602f: mov dword ptr [esp + 0x14], edx
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.esi >>> 0)); // 8c6033: mov dword ptr [esp + 0x10], esi
        if (R.cLE) { pc = 29; continue; } // 8c6037: jle 0x8c60e5
        pc = 7; continue;
      default: return pc;
    }
  }
}
function f_8c5fc0_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 7: // 8c603d
        R.push((R.edi >>> 0)); // 8c603d: push edi
        pc = 8; continue;
      case 8: // 8c603e
        R.esi = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 8c603e: mov esi, dword ptr [ebx]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8c6040: test esi, esi
        if (R.zf) { pc = 27; continue; } // 8c6042: je 0x8c60cd
        pc = 9; continue;
      case 9: // 8c6048
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 8c6048: mov eax, dword ptr [esp + 0x18]
        R.ecx = (R.m.u32(((R.esi + 0x8) | 0) >>> 0)) | 0; // 8c604c: mov ecx, dword ptr [esi + 8]
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 8c604f: cmp ecx, eax
        if (!R.zf) { pc = 27; continue; } // 8c6051: jne 0x8c60cd
        pc = 10; continue;
      case 10: // 8c6053
        R.ecx = (R.m.u32(((R.esi + 0x20) | 0) >>> 0)) | 0; // 8c6053: mov ecx, dword ptr [esi + 0x20]
        R.edx = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 8c6056: mov edx, dword ptr [ebp]
        R.edi = (((R.esi + 0x20) | 0)) | 0; // 8c6059: lea edi, [esi + 0x20]
        R.ecx = (R.m.u32(((R.edx + R.ecx * 4) | 0) >>> 0)) | 0; // 8c605c: mov ecx, dword ptr [edx + ecx*4]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 8c605f: test ecx, ecx
        if (R.zf) { pc = 27; continue; } // 8c6061: je 0x8c60cd
        pc = 11; continue;
      case 11: // 8c6063
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + 0x2c) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8c6063: mov al, byte ptr [ecx + 0x2c]
        R.sub(((R.eax >>> 0) & 0xff), 0x2, 8); // 8c6066: cmp al, 2
        if (R.zf) { pc = 17; continue; } // 8c6068: je 0x8c607e
        pc = 12; continue;
      case 12: // 8c606a
        R.sub(((R.eax >>> 0) & 0xff), 0x3, 8); // 8c606a: cmp al, 3
        if (R.zf) { pc = 17; continue; } // 8c606c: je 0x8c607e
        pc = 13; continue;
      case 13: // 8c606e
        R.sub(((R.eax >>> 0) & 0xff), 0x14, 8); // 8c606e: cmp al, 0x14
        if (R.zf) { pc = 17; continue; } // 8c6070: je 0x8c607e
        pc = 14; continue;
      case 14: // 8c6072
        R.sub(((R.eax >>> 0) & 0xff), 0xf, 8); // 8c6072: cmp al, 0xf
        if (R.zf) { pc = 18; continue; } // 8c6074: je 0x8c6082
        pc = 15; continue;
      case 15: // 8c6076
        R.sub(((R.eax >>> 0) & 0xff), 0x10, 8); // 8c6076: cmp al, 0x10
        if (R.zf) { pc = 17; continue; } // 8c6078: je 0x8c607e
        pc = 16; continue;
      case 16: // 8c607a
        R.sub(((R.eax >>> 0) & 0xff), 0x4, 8); // 8c607a: cmp al, 4
        if (!R.zf) { pc = 19; continue; } // 8c607c: jne 0x8c6088
        pc = 17; continue;
      case 17: // 8c607e
        R.sub(((R.eax >>> 0) & 0xff), 0xf, 8); // 8c607e: cmp al, 0xf
        if (!R.zf) { pc = 27; continue; } // 8c6080: jne 0x8c60cd
        pc = 18; continue;
      case 18: // 8c6082
        R.sub(R.m.u8(((R.ecx + 0x2e) | 0) >>> 0), 0x3, 8); // 8c6082: cmp byte ptr [ecx + 0x2e], 3
        if (!R.cf) { pc = 27; continue; } // 8c6086: jae 0x8c60cd
        pc = 19; continue;
      case 19: // 8c6088
        R.eax = (R.m.u32(((R.esi + 0x4) | 0) >>> 0)) | 0; // 8c6088: mov eax, dword ptr [esi + 4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c608b: test eax, eax
        if (R.zf) { pc = 27; continue; } // 8c608d: je 0x8c60cd
        pc = 20; continue;
      default: return pc;
    }
  }
}
function f_8c5fc0_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 20: // 8c608f
        R.ecx = (R.m.u32(((R.eax + 0x2) | 0) >>> 0)) | 0; // 8c608f: mov ecx, dword ptr [eax + 2]
        R.m.w32(((R.eax + 0xa) | 0) >>> 0, (R.ecx >>> 0)); // 8c6092: mov dword ptr [eax + 0xa], ecx
        R.ecx = (R.m.u32(((R.esi + 0x4) | 0) >>> 0)) | 0; // 8c6095: mov ecx, dword ptr [esi + 4]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8c6098: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c609d: test eax, eax
        if (R.zf) { pc = 27; continue; } // 8c609f: je 0x8c60cd
        pc = 21; continue;
      case 21: // 8c60a1
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8c60a1: mov edx, dword ptr [eax]
        R.eax = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 8c60a3: mov eax, dword ptr [esp + 0x20]
        R.sub((R.edx >>> 0), R.m.u32(((R.eax) | 0) >>> 0), 32); // 8c60a7: cmp edx, dword ptr [eax]
        if (R.zf) { pc = 24; continue; } // 8c60a9: je 0x8c60b9
        pc = 22; continue;
      case 22: // 8c60ab
        R.ecx = (R.m.u32(((R.esi + 0x4) | 0) >>> 0)) | 0; // 8c60ab: mov ecx, dword ptr [esi + 4]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8c60ae: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c60b3: test eax, eax
        if (!R.zf) { pc = 21; continue; } // 8c60b5: jne 0x8c60a1
        pc = 23; continue;
      case 23: // 8c60b7
        pc = 27; continue; // 8c60b7: jmp 0x8c60cd
      case 24: // 8c60b9
        R.ecx = (R.m.u32(((R.esp + 0x24) | 0) >>> 0)) | 0; // 8c60b9: mov ecx, dword ptr [esp + 0x24]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 8c60bd: test ecx, ecx
        if (R.zf) { pc = 26; continue; } // 8c60bf: je 0x8c60c9
        pc = 25; continue;
      case 25: // 8c60c1
        R.push(0x4); // 8c60c1: push 4
        R.push((R.edi >>> 0)); // 8c60c3: push edi
        R.call(0x68d0d0, { n: 2, thisEcx: true, calleeClean: true }); // 8c60c4: call 0x68d0d0
        pc = 26; continue;
      case 26: // 8c60c9
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, R.incdec(R.m.u32(((R.esp + 0x10) | 0) >>> 0), 1, 32)); // 8c60c9: inc dword ptr [esp + 0x10]
        pc = 27; continue;
      case 27: // 8c60cd
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 8c60cd: mov eax, dword ptr [esp + 0x14]
        R.ecx = (R.m.u32(((R.ebp + 0x10) | 0) >>> 0)) | 0; // 8c60d1: mov ecx, dword ptr [ebp + 0x10]
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 8c60d4: inc eax
        R.ebx = (R.add((R.ebx >>> 0), 0x4, 32)) | 0; // 8c60d5: add ebx, 4
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 8c60d8: cmp eax, ecx
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.eax >>> 0)); // 8c60da: mov dword ptr [esp + 0x14], eax
        if (R.cL) { pc = 8; continue; } // 8c60de: jl 0x8c603e
        pc = 28; continue;
      case 28: // 8c60e4
        R.edi = (R.pop()) | 0; // 8c60e4: pop edi
        pc = 29; continue;
      case 29: // 8c60e5
        R.eax = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 8c60e5: mov eax, dword ptr [esp + 0xc]
        R.ebx = (R.pop()) | 0; // 8c60e9: pop ebx
        R.esi = (R.pop()) | 0; // 8c60ea: pop esi
        R.ebp = (R.pop()) | 0; // 8c60eb: pop ebp
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 8c60ec: add esp, 0xc
        R.rv = R.ret(2); return -1; // 8c60ef: ret 8
      default: return pc;
    }
  }
}
export function f_8c5fc0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 30) throw new Error(`f_8c5fc0: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_8c5fc0_0(R, pc); break;
      case 1: np = f_8c5fc0_1(R, pc); break;
      case 2: np = f_8c5fc0_2(R, pc); break;
      default: throw new Error(`f_8c5fc0: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_8c5fc0: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_8c5fc0.shared = true;
