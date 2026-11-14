// 0x549c90 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x549c90, 0x549c98, 0x549ca4, 0x549cab, 0x549cdf, 0x549ce1]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0]);
function f_549c90_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 549c90
        R.edx = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 549c90: mov edx, dword ptr [esp + 4]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 549c94: test edx, edx
        if (R.zf) { pc = 5; continue; } // 549c96: je 0x549ce1
        pc = 1; continue;
      case 1: // 549c98
        R.eax = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 549c98: mov eax, dword ptr [edx]
        R.ecx = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 549c9a: mov ecx, dword ptr [0xae2364]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 549ca0: cmp eax, ecx
        if (!R.cL) { pc = 5; continue; } // 549ca2: jge 0x549ce1
        pc = 2; continue;
      case 2: // 549ca4
        R.push((R.esi >>> 0)); // 549ca4: push esi
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 549ca5: xor eax, eax
        R.push((R.edi >>> 0)); // 549ca7: push edi
        R.esi = (R.logic((R.esi >>> 0) | 0xffffffff, 32)) | 0; // 549ca8: or esi, 0xffffffff
        pc = 3; continue;
      case 3: // 549cab
        R.ecx = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 549cab: mov ecx, dword ptr [edx]
        R.edi = (((R.ecx + R.ecx * 4) | 0)) | 0; // 549cad: lea edi, [ecx + ecx*4]
        R.edi = (R.shl((R.edi >>> 0), 0x4, 32)) | 0; // 549cb0: shl edi, 4
        R.edi = (R.sub((R.edi >>> 0), (R.ecx >>> 0), 32)) | 0; // 549cb3: sub edi, ecx
        R.ecx = (R.m.u32(((0xae2d0c) | 0) >>> 0)) | 0; // 549cb5: mov ecx, dword ptr [0xae2d0c]
        R.edi = (R.add((R.edi >>> 0), (R.eax >>> 0), 32)) | 0; // 549cbb: add edi, eax
        R.m.w32(((R.edi + R.ecx + 0x27) | 0) >>> 0, (R.esi >>> 0)); // 549cbd: mov dword ptr [edi + ecx + 0x27], esi
        R.ecx = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 549cc1: mov ecx, dword ptr [edx]
        R.edi = (((R.ecx + R.ecx * 4) | 0)) | 0; // 549cc3: lea edi, [ecx + ecx*4]
        R.edi = (R.shl((R.edi >>> 0), 0x4, 32)) | 0; // 549cc6: shl edi, 4
        R.edi = (R.sub((R.edi >>> 0), (R.ecx >>> 0), 32)) | 0; // 549cc9: sub edi, ecx
        R.ecx = (R.m.u32(((0xae2d0c) | 0) >>> 0)) | 0; // 549ccb: mov ecx, dword ptr [0xae2d0c]
        R.edi = (R.add((R.edi >>> 0), (R.eax >>> 0), 32)) | 0; // 549cd1: add edi, eax
        R.eax = (R.add((R.eax >>> 0), 0x14, 32)) | 0; // 549cd3: add eax, 0x14
        R.sub((R.eax >>> 0), 0x28, 32); // 549cd6: cmp eax, 0x28
        R.m.w32(((R.edi + R.ecx + 0x37) | 0) >>> 0, (R.esi >>> 0)); // 549cd9: mov dword ptr [edi + ecx + 0x37], esi
        if (R.cL) { pc = 3; continue; } // 549cdd: jl 0x549cab
        pc = 4; continue;
      case 4: // 549cdf
        R.edi = (R.pop()) | 0; // 549cdf: pop edi
        R.esi = (R.pop()) | 0; // 549ce0: pop esi
        pc = 5; continue;
      case 5: // 549ce1
        R.rv = R.ret(0); return -1; // 549ce1: ret 
      default: return pc;
    }
  }
}
export function f_549c90(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 6) throw new Error(`f_549c90: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_549c90_0(R, pc); break;
      default: throw new Error(`f_549c90: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_549c90: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_549c90.shared = true;
