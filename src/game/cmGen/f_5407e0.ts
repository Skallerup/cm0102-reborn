// 0x5407e0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 5408c0=2
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x5407e0, 0x5407e9, 0x5407ff, 0x540808, 0x54080c, 0x540815, 0x540819, 0x540822, 0x540829, 0x540844, 0x54085f, 0x540875, 0x54087e, 0x540882, 0x54088b, 0x54088f, 0x540898, 0x54089f, 0x5408a5, 0x5408a9]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2]);
function f_5407e0_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 5407e0
        R.eax = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 5407e0: mov eax, dword ptr [esp + 0xc]
        R.push((R.esi >>> 0)); // 5407e4: push esi
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5407e5: test eax, eax
        if (R.zf) { pc = 10; continue; } // 5407e7: je 0x54085f
        pc = 1; continue;
      case 1: // 5407e9
        R.eax = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 5407e9: mov eax, dword ptr [esp + 0xc]
        R.esi = (R.m.u32(((R.esp + 0x8) | 0) >>> 0)) | 0; // 5407ed: mov esi, dword ptr [esp + 8]
        R.push((R.eax >>> 0)); // 5407f1: push eax
        R.push((R.esi >>> 0)); // 5407f2: push esi
        R.call(0x5408c0, { n: 2, thisEcx: false, calleeClean: false }); // 5407f3: call 0x5408c0
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 5407f8: add esp, 8
        R.sub(((R.eax >>> 0) & 0xff), 0x4, 8); // 5407fb: cmp al, 4
        if (!R.zf) { pc = 3; continue; } // 5407fd: jne 0x540808
        pc = 2; continue;
      case 2: // 5407ff
        R.ecx = (R.m.u32(((R.esi + 0x69) | 0) >>> 0)) | 0; // 5407ff: mov ecx, dword ptr [esi + 0x69]
        R.esi = (R.pop()) | 0; // 540802: pop esi
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.ecx + 0xc) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 540803: mov ax, word ptr [ecx + 0xc]
        R.rv = R.ret(0); return -1; // 540807: ret 
      case 3: // 540808
        R.sub(((R.eax >>> 0) & 0xff), 0x2, 8); // 540808: cmp al, 2
        if (!R.zf) { pc = 5; continue; } // 54080a: jne 0x540815
        pc = 4; continue;
      case 4: // 54080c
        R.edx = (R.m.u32(((R.esi + 0x69) | 0) >>> 0)) | 0; // 54080c: mov edx, dword ptr [esi + 0x69]
        R.esi = (R.pop()) | 0; // 54080f: pop esi
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.edx + 0x8) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 540810: mov ax, word ptr [edx + 8]
        R.rv = R.ret(0); return -1; // 540814: ret 
      case 5: // 540815
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 540815: test al, al
        if (!R.zf) { pc = 7; continue; } // 540817: jne 0x540822
        pc = 6; continue;
      case 6: // 540819
        R.eax = (R.m.u32(((R.esi + 0x69) | 0) >>> 0)) | 0; // 540819: mov eax, dword ptr [esi + 0x69]
        R.esi = (R.pop()) | 0; // 54081c: pop esi
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.eax + 0xa) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 54081d: mov ax, word ptr [eax + 0xa]
        R.rv = R.ret(0); return -1; // 540821: ret 
      case 7: // 540822
        R.esi = (R.m.u32(((R.esi + 0x69) | 0) >>> 0)) | 0; // 540822: mov esi, dword ptr [esi + 0x69]
        R.sub(((R.eax >>> 0) & 0xff), 0x3, 8); // 540825: cmp al, 3
        if (!R.zf) { pc = 9; continue; } // 540827: jne 0x540844
        pc = 8; continue;
      case 8: // 540829
        R.eax = (((R.m.u16(((R.esi + 0xc) | 0) >>> 0)) << 16 >> 16)) | 0; // 540829: movsx eax, word ptr [esi + 0xc]
        R.edx = R.eax < 0 ? -1 : 0; // 54082d: cdq 
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 54082e: sub eax, edx
        R.ecx = ((R.eax >>> 0)) | 0; // 540830: mov ecx, eax
        R.eax = (((R.m.u16(((R.esi + 0x8) | 0) >>> 0)) << 16 >> 16)) | 0; // 540832: movsx eax, word ptr [esi + 8]
        R.edx = R.eax < 0 ? -1 : 0; // 540836: cdq 
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 540837: sub eax, edx
        R.esi = (R.pop()) | 0; // 540839: pop esi
        R.ecx = (R.sar((R.ecx >>> 0), 0x1, 32)) | 0; // 54083a: sar ecx, 1
        R.eax = (R.sar((R.eax >>> 0), 0x1, 32)) | 0; // 54083c: sar eax, 1
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 54083e: add ecx, eax
        R.eax = ((R.eax & 0xffff0000) | (((((R.ecx >>> 0) & 0xffff)) & 0xffff) << 0)) | 0; // 540840: mov ax, cx
        R.rv = R.ret(0); return -1; // 540843: ret 
      default: return pc;
    }
  }
}
function f_5407e0_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 9: // 540844
        R.eax = (((R.m.u16(((R.esi + 0xa) | 0) >>> 0)) << 16 >> 16)) | 0; // 540844: movsx eax, word ptr [esi + 0xa]
        R.edx = R.eax < 0 ? -1 : 0; // 540848: cdq 
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 540849: sub eax, edx
        R.ecx = ((R.eax >>> 0)) | 0; // 54084b: mov ecx, eax
        R.eax = (((R.m.u16(((R.esi + 0x8) | 0) >>> 0)) << 16 >> 16)) | 0; // 54084d: movsx eax, word ptr [esi + 8]
        R.edx = R.eax < 0 ? -1 : 0; // 540851: cdq 
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 540852: sub eax, edx
        R.esi = (R.pop()) | 0; // 540854: pop esi
        R.ecx = (R.sar((R.ecx >>> 0), 0x1, 32)) | 0; // 540855: sar ecx, 1
        R.eax = (R.sar((R.eax >>> 0), 0x1, 32)) | 0; // 540857: sar eax, 1
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 540859: add ecx, eax
        R.eax = ((R.eax & 0xffff0000) | (((((R.ecx >>> 0) & 0xffff)) & 0xffff) << 0)) | 0; // 54085b: mov ax, cx
        R.rv = R.ret(0); return -1; // 54085e: ret 
      case 10: // 54085f
        R.edx = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 54085f: mov edx, dword ptr [esp + 0xc]
        R.esi = (R.m.u32(((R.esp + 0x8) | 0) >>> 0)) | 0; // 540863: mov esi, dword ptr [esp + 8]
        R.push((R.edx >>> 0)); // 540867: push edx
        R.push((R.esi >>> 0)); // 540868: push esi
        R.call(0x5408c0, { n: 2, thisEcx: false, calleeClean: false }); // 540869: call 0x5408c0
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 54086e: add esp, 8
        R.sub(((R.eax >>> 0) & 0xff), 0x4, 8); // 540871: cmp al, 4
        if (!R.zf) { pc = 12; continue; } // 540873: jne 0x54087e
        pc = 11; continue;
      case 11: // 540875
        R.eax = (R.m.u32(((R.esi + 0x61) | 0) >>> 0)) | 0; // 540875: mov eax, dword ptr [esi + 0x61]
        R.esi = (R.pop()) | 0; // 540878: pop esi
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.eax + 0xd) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 540879: mov ax, word ptr [eax + 0xd]
        R.rv = R.ret(0); return -1; // 54087d: ret 
      case 12: // 54087e
        R.sub(((R.eax >>> 0) & 0xff), 0x2, 8); // 54087e: cmp al, 2
        if (!R.zf) { pc = 14; continue; } // 540880: jne 0x54088b
        pc = 13; continue;
      case 13: // 540882
        R.ecx = (R.m.u32(((R.esi + 0x61) | 0) >>> 0)) | 0; // 540882: mov ecx, dword ptr [esi + 0x61]
        R.esi = (R.pop()) | 0; // 540885: pop esi
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.ecx + 0x9) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 540886: mov ax, word ptr [ecx + 9]
        R.rv = R.ret(0); return -1; // 54088a: ret 
      case 14: // 54088b
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 54088b: test al, al
        if (!R.zf) { pc = 16; continue; } // 54088d: jne 0x540898
        pc = 15; continue;
      case 15: // 54088f
        R.edx = (R.m.u32(((R.esi + 0x61) | 0) >>> 0)) | 0; // 54088f: mov edx, dword ptr [esi + 0x61]
        R.esi = (R.pop()) | 0; // 540892: pop esi
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.edx + 0xb) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 540893: mov ax, word ptr [edx + 0xb]
        R.rv = R.ret(0); return -1; // 540897: ret 
      case 16: // 540898
        R.esi = (R.m.u32(((R.esi + 0x61) | 0) >>> 0)) | 0; // 540898: mov esi, dword ptr [esi + 0x61]
        R.sub(((R.eax >>> 0) & 0xff), 0x3, 8); // 54089b: cmp al, 3
        if (!R.zf) { pc = 18; continue; } // 54089d: jne 0x5408a5
        pc = 17; continue;
      case 17: // 54089f
        R.eax = (((R.m.u16(((R.esi + 0xd) | 0) >>> 0)) << 16 >> 16)) | 0; // 54089f: movsx eax, word ptr [esi + 0xd]
        pc = 19; continue; // 5408a3: jmp 0x5408a9
      case 18: // 5408a5
        R.eax = (((R.m.u16(((R.esi + 0xb) | 0) >>> 0)) << 16 >> 16)) | 0; // 5408a5: movsx eax, word ptr [esi + 0xb]
        pc = 19; continue;
      default: return pc;
    }
  }
}
function f_5407e0_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 19: // 5408a9
        R.edx = R.eax < 0 ? -1 : 0; // 5408a9: cdq 
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 5408aa: sub eax, edx
        R.ecx = ((R.eax >>> 0)) | 0; // 5408ac: mov ecx, eax
        R.eax = (((R.m.u16(((R.esi + 0x9) | 0) >>> 0)) << 16 >> 16)) | 0; // 5408ae: movsx eax, word ptr [esi + 9]
        R.edx = R.eax < 0 ? -1 : 0; // 5408b2: cdq 
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 5408b3: sub eax, edx
        R.esi = (R.pop()) | 0; // 5408b5: pop esi
        R.ecx = (R.sar((R.ecx >>> 0), 0x1, 32)) | 0; // 5408b6: sar ecx, 1
        R.eax = (R.sar((R.eax >>> 0), 0x1, 32)) | 0; // 5408b8: sar eax, 1
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 5408ba: add ecx, eax
        R.eax = ((R.eax & 0xffff0000) | (((((R.ecx >>> 0) & 0xffff)) & 0xffff) << 0)) | 0; // 5408bc: mov ax, cx
        R.rv = R.ret(0); return -1; // 5408bf: ret 
      default: return pc;
    }
  }
}
export function f_5407e0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 20) throw new Error(`f_5407e0: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_5407e0_0(R, pc); break;
      case 1: np = f_5407e0_1(R, pc); break;
      case 2: np = f_5407e0_2(R, pc); break;
      default: throw new Error(`f_5407e0: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_5407e0: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_5407e0.shared = true;
