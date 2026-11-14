// 0x8d0530 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x8d0530, 0x8d053e, 0x8d054c, 0x8d0554, 0x8d055b, 0x8d0564, 0x8d056f]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 0]);
function f_8d0530_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 8d0530
        R.push((R.ebx >>> 0)); // 8d0530: push ebx
        R.ebx = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 8d0531: mov ebx, dword ptr [esp + 0xc]
        R.push((R.esi >>> 0)); // 8d0535: push esi
        R.eax = (R.m.u32(((R.ebx + 0x39) | 0) >>> 0)) | 0; // 8d0536: mov eax, dword ptr [ebx + 0x39]
        R.push((R.edi >>> 0)); // 8d0539: push edi
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8d053a: test eax, eax
        if (R.zf) { pc = 5; continue; } // 8d053c: je 0x8d0564
        pc = 1; continue;
      case 1: // 8d053e
        R.edi = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 8d053e: mov edi, dword ptr [esp + 0x10]
        R.edx = (R.m.u32(((R.eax + 0x53) | 0) >>> 0)) | 0; // 8d0542: mov edx, dword ptr [eax + 0x53]
        R.esi = (R.m.u32(((R.edi + 0x53) | 0) >>> 0)) | 0; // 8d0545: mov esi, dword ptr [edi + 0x53]
        R.sub((R.esi >>> 0), (R.edx >>> 0), 32); // 8d0548: cmp esi, edx
        if (!R.zf) { pc = 5; continue; } // 8d054a: jne 0x8d0564
        pc = 2; continue;
      case 2: // 8d054c
        R.edx = (R.logic((R.edx >>> 0) ^ (R.edx >>> 0), 32)) | 0; // 8d054c: xor edx, edx
        R.eax = (((R.ecx + 0x8ac) | 0)) | 0; // 8d054e: lea eax, [ecx + 0x8ac]
        pc = 3; continue;
      case 3: // 8d0554
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8d0554: mov ecx, dword ptr [eax]
        R.sub(R.m.u32(((R.ecx + 0xa) | 0) >>> 0), (R.esi >>> 0), 32); // 8d0556: cmp dword ptr [ecx + 0xa], esi
        if (R.zf) { pc = 6; continue; } // 8d0559: je 0x8d056f
        pc = 4; continue;
      case 4: // 8d055b
        R.edx = (R.incdec((R.edx >>> 0), 1, 32)) | 0; // 8d055b: inc edx
        R.eax = (R.add((R.eax >>> 0), 0x4, 32)) | 0; // 8d055c: add eax, 4
        R.sub((R.edx >>> 0), 0x1c, 32); // 8d055f: cmp edx, 0x1c
        if (R.cL) { pc = 3; continue; } // 8d0562: jl 0x8d0554
        pc = 5; continue;
      case 5: // 8d0564
        R.edi = (R.pop()) | 0; // 8d0564: pop edi
        R.esi = (R.pop()) | 0; // 8d0565: pop esi
        R.eax = (0x1) | 0; // 8d0566: mov eax, 1
        R.ebx = (R.pop()) | 0; // 8d056b: pop ebx
        R.rv = R.ret(5); return -1; // 8d056c: ret 0x14
      case 6: // 8d056f
        R.ecx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 8d056f: mov ecx, dword ptr [esp + 0x20]
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8d0573: mov eax, dword ptr [eax]
        R.push((R.ecx >>> 0)); // 8d0575: push ecx
        R.ecx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 8d0576: mov ecx, dword ptr [esp + 0x20]
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8d057a: mov edx, dword ptr [eax]
        R.push((R.ecx >>> 0)); // 8d057c: push ecx
        R.ecx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 8d057d: mov ecx, dword ptr [esp + 0x20]
        R.push((R.ecx >>> 0)); // 8d0581: push ecx
        R.push((R.ebx >>> 0)); // 8d0582: push ebx
        R.push((R.edi >>> 0)); // 8d0583: push edi
        R.ecx = ((R.eax >>> 0)) | 0; // 8d0584: mov ecx, eax
        R.callInd(R.m.u32(((R.edx + 0x24) | 0) >>> 0)); // 8d0586: call dword ptr [edx + 0x24]
        R.edi = (R.pop()) | 0; // 8d0589: pop edi
        R.esi = (R.pop()) | 0; // 8d058a: pop esi
        R.ebx = (R.pop()) | 0; // 8d058b: pop ebx
        R.rv = R.ret(5); return -1; // 8d058c: ret 0x14
      default: return pc;
    }
  }
}
export function f_8d0530(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 7) throw new Error(`f_8d0530: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_8d0530_0(R, pc); break;
      default: throw new Error(`f_8d0530: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_8d0530: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_8d0530.shared = true;
