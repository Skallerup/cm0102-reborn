// 0x8982b0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 53b900=1, 5409b0=1, 5e8290=9, 600a50=5, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x8982b0, 0x8982d8, 0x8982e7, 0x8982f4, 0x898302, 0x89830c, 0x89833c, 0x898349, 0x89835f, 0x898372, 0x898376, 0x89837d, 0x8983ad, 0x8983e0, 0x8983e2]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 2]);
function f_8982b0_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 8982b0
        R.esp = (R.sub((R.esp >>> 0), 0x200, 32)) | 0; // 8982b0: sub esp, 0x200
        R.push((R.esi >>> 0)); // 8982b6: push esi
        R.esi = (R.m.u32(((R.esp + 0x208) | 0) >>> 0)) | 0; // 8982b7: mov esi, dword ptr [esp + 0x208]
        R.push((R.edi >>> 0)); // 8982be: push edi
        R.push(0x0); // 8982bf: push 0
        R.push(0x0); // 8982c1: push 0
        R.push(0x1); // 8982c3: push 1
        R.push(0x1); // 8982c5: push 1
        R.push((R.esi >>> 0)); // 8982c7: push esi
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 8982c8: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8982cd: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8982d0: test eax, eax
        if (R.zf) { pc = 13; continue; } // 8982d2: je 0x8983e0
        pc = 1; continue;
      case 1: // 8982d8
        R.eax = (R.m.u32(((R.esp + 0x210) | 0) >>> 0)) | 0; // 8982d8: mov eax, dword ptr [esp + 0x210]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8982df: test eax, eax
        if (R.zf) { pc = 13; continue; } // 8982e1: je 0x8983e0
        pc = 2; continue;
      case 2: // 8982e7
        R.push((R.esi >>> 0)); // 8982e7: push esi
        R.call(0x5409b0, { n: 1, thisEcx: false, calleeClean: false }); // 8982e8: call 0x5409b0
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8982ed: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8982f0: test eax, eax
        if (R.zf) { pc = 4; continue; } // 8982f2: je 0x898302
        pc = 3; continue;
      case 3: // 8982f4
        R.edi = (R.pop()) | 0; // 8982f4: pop edi
        R.eax = (R.logic((R.eax >>> 0) | 0xffffffff, 32)) | 0; // 8982f5: or eax, 0xffffffff
        R.esi = (R.pop()) | 0; // 8982f8: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 8982f9: add esp, 0x200
        R.rv = R.ret(2); return -1; // 8982ff: ret 8
      case 4: // 898302
        R.edi = (R.m.u32(((R.esi + 0xcf) | 0) >>> 0)) | 0; // 898302: mov edi, dword ptr [esi + 0xcf]
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 898308: test edi, edi
        if (!R.zf) { pc = 6; continue; } // 89830a: jne 0x89833c
        pc = 5; continue;
      case 5: // 89830c
        R.eax = (((R.esp + 0x8) | 0)) | 0; // 89830c: lea eax, [esp + 8]
        R.ecx = (((R.esp + 0x108) | 0)) | 0; // 898310: lea ecx, [esp + 0x108]
        R.push((R.eax >>> 0)); // 898317: push eax
        R.push((R.ecx >>> 0)); // 898318: push ecx
        R.push((R.edi >>> 0)); // 898319: push edi
        R.push((R.edi >>> 0)); // 89831a: push edi
        R.push(0xa8b908); // 89831b: push 0xa8b908
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 898320: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 898325: add esp, 0x14
        R.edx = (((R.esp + 0x8) | 0)) | 0; // 898328: lea edx, [esp + 8]
        R.eax = (((R.esp + 0x108) | 0)) | 0; // 89832c: lea eax, [esp + 0x108]
        R.push(0x742); // 898333: push 0x742
        R.push((R.edx >>> 0)); // 898338: push edx
        R.push((R.eax >>> 0)); // 898339: push eax
        pc = 12; continue; // 89833a: jmp 0x8983ad
      default: return pc;
    }
  }
}
function f_8982b0_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 6: // 89833c
        R.push((R.esi >>> 0)); // 89833c: push esi
        R.call(0x53b900, { n: 1, thisEcx: false, calleeClean: false }); // 89833d: call 0x53b900
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 898342: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 898345: test eax, eax
        if (R.zf) { pc = 8; continue; } // 898347: je 0x89835f
        pc = 7; continue;
      case 7: // 898349
        R.edx = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 898349: mov edx, dword ptr [0xae2364]
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 89834f: mov eax, dword ptr [edi]
        R.ecx = (R.m.u32(((0xae235c) | 0) >>> 0)) | 0; // 898351: mov ecx, dword ptr [0xae235c]
        R.edx = (R.sub((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 898357: sub edx, eax
        R.eax = (((R.edx + R.ecx + 0xf) | 0)) | 0; // 898359: lea eax, [edx + ecx + 0xf]
        pc = 9; continue; // 89835d: jmp 0x898372
      case 8: // 89835f
        R.eax = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 89835f: mov eax, dword ptr [0xae2364]
        R.ecx = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 898364: mov ecx, dword ptr [edi]
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 898366: sub eax, ecx
        R.ecx = (R.m.u32(((0xae235c) | 0) >>> 0)) | 0; // 898368: mov ecx, dword ptr [0xae235c]
        R.eax = (((R.eax + R.ecx + -0x1) | 0)) | 0; // 89836e: lea eax, [eax + ecx - 1]
        pc = 9; continue;
      case 9: // 898372
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 898372: test eax, eax
        if (R.cL) { pc = 11; continue; } // 898374: jl 0x89837d
        pc = 10; continue;
      case 10: // 898376
        R.ecx = (R.add((R.ecx >>> 0), 0x20, 32)) | 0; // 898376: add ecx, 0x20
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 898379: cmp eax, ecx
        if (R.cL) { pc = 14; continue; } // 89837b: jl 0x8983e2
        pc = 11; continue;
      case 11: // 89837d
        R.ecx = (((R.esp + 0x108) | 0)) | 0; // 89837d: lea ecx, [esp + 0x108]
        R.edx = (((R.esp + 0x8) | 0)) | 0; // 898384: lea edx, [esp + 8]
        R.push((R.ecx >>> 0)); // 898388: push ecx
        R.push((R.edx >>> 0)); // 898389: push edx
        R.push(0x0); // 89838a: push 0
        R.push(0x0); // 89838c: push 0
        R.push(0xa8b908); // 89838e: push 0xa8b908
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 898393: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 898398: add esp, 0x14
        R.eax = (((R.esp + 0x108) | 0)) | 0; // 89839b: lea eax, [esp + 0x108]
        R.ecx = (((R.esp + 0x8) | 0)) | 0; // 8983a2: lea ecx, [esp + 8]
        R.push(0x755); // 8983a6: push 0x755
        R.push((R.eax >>> 0)); // 8983ab: push eax
        R.push((R.ecx >>> 0)); // 8983ac: push ecx
        pc = 12; continue;
      case 12: // 8983ad
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 8983ad: call 0x90d130
        R.push((R.eax >>> 0)); // 8983b2: push eax
        R.push(0x9870e8); // 8983b3: push 0x9870e8
        R.push(0xae24d0); // 8983b8: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 8983bd: call 0x944c9f
        R.push(0x0); // 8983c2: push 0
        R.push(0xae24d0); // 8983c4: push 0xae24d0
        R.push(0x9870e0); // 8983c9: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 8983ce: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 8983d3: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 8983d6: mov dword ptr [0xb67a34], 0
        pc = 13; continue;
      default: return pc;
    }
  }
}
function f_8982b0_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 13: // 8983e0
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8983e0: mov eax, dword ptr [esi]
        pc = 14; continue;
      case 14: // 8983e2
        R.edi = (R.pop()) | 0; // 8983e2: pop edi
        R.esi = (R.pop()) | 0; // 8983e3: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 8983e4: add esp, 0x200
        R.rv = R.ret(2); return -1; // 8983ea: ret 8
      default: return pc;
    }
  }
}
export function f_8982b0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 15) throw new Error(`f_8982b0: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_8982b0_0(R, pc); break;
      case 1: np = f_8982b0_1(R, pc); break;
      case 2: np = f_8982b0_2(R, pc); break;
      default: throw new Error(`f_8982b0: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_8982b0: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_8982b0.shared = true;
