// 0x8cdd80 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 68d020=0t, 68d040=7t, 68d1b0=0t, 8c5cf0=3tc
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x8cdd80, 0x8cddb6, 0x8cddc2, 0x8cddca, 0x8cddd8, 0x8cddfb, 0x8cddff, 0x8cde0f, 0x8cde1c, 0x8cde43]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 1, 1, 1, 1]);
function f_8cdd80_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 8cdd80
        R.push(0xffffffff); // 8cdd80: push -1
        R.push(0x963f38); // 8cdd82: push 0x963f38
        R.eax = (0) | 0; // 8cdd87: mov eax, dword ptr fs:[0]
        R.push((R.eax >>> 0)); // 8cdd8d: push eax
        /* fs */ // 8cdd8e: mov dword ptr fs:[0], esp
        R.esp = (R.sub((R.esp >>> 0), 0x10, 32)) | 0; // 8cdd95: sub esp, 0x10
        R.push((R.ebx >>> 0)); // 8cdd98: push ebx
        R.push((R.esi >>> 0)); // 8cdd99: push esi
        R.push((R.edi >>> 0)); // 8cdd9a: push edi
        R.edi = ((R.ecx >>> 0)) | 0; // 8cdd9b: mov edi, ecx
        R.ecx = (((R.esp + 0xc) | 0)) | 0; // 8cdd9d: lea ecx, [esp + 0xc]
        R.call(0x68d020, { n: 0, thisEcx: true, calleeClean: false }); // 8cdda1: call 0x68d020
        R.eax = (R.m.u32(((R.esp + 0x2c) | 0) >>> 0)) | 0; // 8cdda6: mov eax, dword ptr [esp + 0x2c]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, 0x0); // 8cddaa: mov dword ptr [esp + 0x24], 0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cddb2: test eax, eax
        if (R.zf) { pc = 2; continue; } // 8cddb4: je 0x8cddc2
        pc = 1; continue;
      case 1: // 8cddb6
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8cddb6: mov ecx, dword ptr [eax]
        R.edx = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 8cddb8: mov edx, dword ptr [0xae2364]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 8cddbe: cmp ecx, edx
        if (!R.cL) { pc = 8; continue; } // 8cddc0: jge 0x8cde1c
        pc = 2; continue;
      case 2: // 8cddc2
        R.ecx = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 8cddc2: mov ecx, dword ptr [esp + 0x34]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 8cddc6: test ecx, ecx
        if (!R.zf) { pc = 4; continue; } // 8cddc8: jne 0x8cddd8
        pc = 3; continue;
      case 3: // 8cddca
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8cddca: mov edx, dword ptr [eax]
        R.esi = (R.m.u32(((R.edi + 0x86e) | 0) >>> 0)) | 0; // 8cddcc: mov esi, dword ptr [edi + 0x86e]
        R.logic(R.m.u8(((R.esi + R.edx * 8) | 0) >>> 0) & 0x1, 8); // 8cddd2: test byte ptr [esi + edx*8], 1
        if (R.zf) { pc = 8; continue; } // 8cddd6: je 0x8cde1c
        pc = 4; continue;
      case 4: // 8cddd8
        R.push((R.ecx >>> 0)); // 8cddd8: push ecx
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 8cddd9: lea ecx, [esp + 0x10]
        R.push((R.ecx >>> 0)); // 8cdddd: push ecx
        R.push((R.eax >>> 0)); // 8cddde: push eax
        R.ecx = ((R.edi >>> 0)) | 0; // 8cdddf: mov ecx, edi
        R.call(0x8c5cf0, { n: 3, thisEcx: true, calleeClean: true }); // 8cdde1: call 0x8c5cf0
        R.edx = (R.m.u32(((R.esp + 0xe) | 0) >>> 0)) | 0; // 8cdde6: mov edx, dword ptr [esp + 0xe]
        R.ecx = (((R.esp + 0xc) | 0)) | 0; // 8cddea: lea ecx, [esp + 0xc]
        R.m.w32(((R.esp + 0x16) | 0) >>> 0, (R.edx >>> 0)); // 8cddee: mov dword ptr [esp + 0x16], edx
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8cddf2: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cddf7: test eax, eax
        if (R.zf) { pc = 8; continue; } // 8cddf9: je 0x8cde1c
        pc = 5; continue;
      case 5: // 8cddfb
        R.ebx = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 8cddfb: mov ebx, dword ptr [esp + 0x30]
        pc = 6; continue;
      default: return pc;
    }
  }
}
function f_8cdd80_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 6: // 8cddff
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8cddff: mov eax, dword ptr [eax]
        R.ecx = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 8cde01: mov ecx, dword ptr [edi]
        R.esi = (R.m.u32(((R.ecx + R.eax * 4) | 0) >>> 0)) | 0; // 8cde03: mov esi, dword ptr [ecx + eax*4]
        R.eax = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 8cde06: mov eax, dword ptr [ebx]
        R.edx = (R.m.u32(((R.esi + 0x8) | 0) >>> 0)) | 0; // 8cde08: mov edx, dword ptr [esi + 8]
        R.sub((R.edx >>> 0), (R.eax >>> 0), 32); // 8cde0b: cmp edx, eax
        if (R.zf) { pc = 9; continue; } // 8cde0d: je 0x8cde43
        pc = 7; continue;
      case 7: // 8cde0f
        R.ecx = (((R.esp + 0xc) | 0)) | 0; // 8cde0f: lea ecx, [esp + 0xc]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8cde13: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cde18: test eax, eax
        if (!R.zf) { pc = 6; continue; } // 8cde1a: jne 0x8cddff
        pc = 8; continue;
      case 8: // 8cde1c
        R.ecx = (((R.esp + 0xc) | 0)) | 0; // 8cde1c: lea ecx, [esp + 0xc]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, 0xffffffff); // 8cde20: mov dword ptr [esp + 0x24], 0xffffffff
        R.call(0x68d040, { n: 7, thisEcx: true, calleeClean: false }); // 8cde28: call 0x68d040
        R.edi = (R.pop()) | 0; // 8cde2d: pop edi
        R.esi = (R.pop()) | 0; // 8cde2e: pop esi
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8cde2f: xor eax, eax
        R.ebx = (R.pop()) | 0; // 8cde31: pop ebx
        R.ecx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 8cde32: mov ecx, dword ptr [esp + 0x10]
        /* fs */ // 8cde36: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x1c, 32)) | 0; // 8cde3d: add esp, 0x1c
        R.rv = R.ret(3); return -1; // 8cde40: ret 0xc
      case 9: // 8cde43
        R.ecx = (((R.esp + 0xc) | 0)) | 0; // 8cde43: lea ecx, [esp + 0xc]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, 0xffffffff); // 8cde47: mov dword ptr [esp + 0x24], 0xffffffff
        R.call(0x68d040, { n: 7, thisEcx: true, calleeClean: false }); // 8cde4f: call 0x68d040
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 8cde54: mov ecx, dword ptr [esp + 0x1c]
        R.eax = ((R.esi >>> 0)) | 0; // 8cde58: mov eax, esi
        R.edi = (R.pop()) | 0; // 8cde5a: pop edi
        R.esi = (R.pop()) | 0; // 8cde5b: pop esi
        R.ebx = (R.pop()) | 0; // 8cde5c: pop ebx
        /* fs */ // 8cde5d: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x1c, 32)) | 0; // 8cde64: add esp, 0x1c
        R.rv = R.ret(3); return -1; // 8cde67: ret 0xc
      default: return pc;
    }
  }
}
export function f_8cdd80(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 10) throw new Error(`f_8cdd80: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_8cdd80_0(R, pc); break;
      case 1: np = f_8cdd80_1(R, pc); break;
      default: throw new Error(`f_8cdd80: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_8cdd80: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_8cdd80.shared = true;
