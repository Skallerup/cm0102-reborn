// 0x542740 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 540a50=3, 5e8290=9, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x542740, 0x542752, 0x5427b8, 0x5427cc, 0x5427d6, 0x5427e7, 0x5427f1, 0x542808, 0x54280f, 0x54281b, 0x542823, 0x54282b, 0x542833, 0x54283b, 0x542842, 0x54284e, 0x542856, 0x542860, 0x542867, 0x542872, 0x54287a, 0x542882, 0x54288c]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2]);
function f_542740_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 542740
        R.esp = (R.sub((R.esp >>> 0), 0x200, 32)) | 0; // 542740: sub esp, 0x200
        R.push((R.esi >>> 0)); // 542746: push esi
        R.esi = (R.m.u32(((R.esp + 0x208) | 0) >>> 0)) | 0; // 542747: mov esi, dword ptr [esp + 0x208]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 54274e: test esi, esi
        if (!R.zf) { pc = 2; continue; } // 542750: jne 0x5427b8
        pc = 1; continue;
      case 1: // 542752
        R.eax = (((R.esp + 0x4) | 0)) | 0; // 542752: lea eax, [esp + 4]
        R.ecx = (((R.esp + 0x104) | 0)) | 0; // 542756: lea ecx, [esp + 0x104]
        R.push((R.eax >>> 0)); // 54275d: push eax
        R.push((R.ecx >>> 0)); // 54275e: push ecx
        R.push((R.esi >>> 0)); // 54275f: push esi
        R.push((R.esi >>> 0)); // 542760: push esi
        R.push(0x9b5ac8); // 542761: push 0x9b5ac8
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 542766: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 54276b: add esp, 0x14
        R.edx = (((R.esp + 0x4) | 0)) | 0; // 54276e: lea edx, [esp + 4]
        R.eax = (((R.esp + 0x104) | 0)) | 0; // 542772: lea eax, [esp + 0x104]
        R.push(0x46fa); // 542779: push 0x46fa
        R.push((R.edx >>> 0)); // 54277e: push edx
        R.push((R.eax >>> 0)); // 54277f: push eax
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 542780: call 0x90d130
        R.push((R.eax >>> 0)); // 542785: push eax
        R.push(0x9870e8); // 542786: push 0x9870e8
        R.push(0xae24d0); // 54278b: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 542790: call 0x944c9f
        R.push((R.esi >>> 0)); // 542795: push esi
        R.push(0xae24d0); // 542796: push 0xae24d0
        R.push(0x9870e0); // 54279b: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 5427a0: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 5427a5: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, (R.esi >>> 0)); // 5427a8: mov dword ptr [0xb67a34], esi
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 5427ae: xor eax, eax
        R.esi = (R.pop()) | 0; // 5427b0: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 5427b1: add esp, 0x200
        R.rv = R.ret(0); return -1; // 5427b7: ret 
      case 2: // 5427b8
        R.ecx = (R.m.u32(((0xae235c) | 0) >>> 0)) | 0; // 5427b8: mov ecx, dword ptr [0xae235c]
        R.edx = (R.m.u32(((0xae2350) | 0) >>> 0)) | 0; // 5427be: mov edx, dword ptr [0xae2350]
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 5427c4: mov eax, dword ptr [esi]
        R.ecx = (R.sub((R.ecx >>> 0), (R.edx >>> 0), 32)) | 0; // 5427c6: sub ecx, edx
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 5427c8: cmp eax, ecx
        if (R.cL) { pc = 4; continue; } // 5427ca: jl 0x5427d6
        pc = 3; continue;
      case 3: // 5427cc
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 5427cc: xor eax, eax
        R.esi = (R.pop()) | 0; // 5427ce: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 5427cf: add esp, 0x200
        R.rv = R.ret(0); return -1; // 5427d5: ret 
      case 4: // 5427d6
        R.push(0x1); // 5427d6: push 1
        R.push(0x0); // 5427d8: push 0
        R.push((R.esi >>> 0)); // 5427da: push esi
        R.call(0x540a50, { n: 3, thisEcx: false, calleeClean: false }); // 5427db: call 0x540a50
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 5427e0: add esp, 0xc
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5427e3: test eax, eax
        if (R.zf) { pc = 6; continue; } // 5427e5: je 0x5427f1
        pc = 5; continue;
      default: return pc;
    }
  }
}
function f_542740_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 5: // 5427e7
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 5427e7: xor eax, eax
        R.esi = (R.pop()) | 0; // 5427e9: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 5427ea: add esp, 0x200
        R.rv = R.ret(0); return -1; // 5427f0: ret 
      case 6: // 5427f1
        R.edx = (R.m.u32(((0xae2350) | 0) >>> 0)) | 0; // 5427f1: mov edx, dword ptr [0xae2350]
        R.ecx = (R.m.u32(((0xae235c) | 0) >>> 0)) | 0; // 5427f7: mov ecx, dword ptr [0xae235c]
        R.eax = (((R.edx + R.edx) | 0)) | 0; // 5427fd: lea eax, [edx + edx]
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 542800: sub ecx, eax
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 542802: mov eax, dword ptr [esi]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 542804: cmp eax, ecx
        if (R.cL) { pc = 17; continue; } // 542806: jl 0x542860
        pc = 7; continue;
      case 7: // 542808
        R.eax = (R.m.u32(((R.esi + 0x53) | 0) >>> 0)) | 0; // 542808: mov eax, dword ptr [esi + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 54280b: test eax, eax
        if (R.zf) { pc = 17; continue; } // 54280d: je 0x542860
        pc = 8; continue;
      case 8: // 54280f
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 54280f: mov ecx, dword ptr [eax]
        R.edx = (R.m.u32(((0x9cf488) | 0) >>> 0)) | 0; // 542811: mov edx, dword ptr [0x9cf488]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 542817: cmp ecx, edx
        if (R.zf) { pc = 21; continue; } // 542819: je 0x542882
        pc = 9; continue;
      case 9: // 54281b
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf408) | 0) >>> 0), 32); // 54281b: cmp ecx, dword ptr [0x9cf408]
        if (R.zf) { pc = 21; continue; } // 542821: je 0x542882
        pc = 10; continue;
      case 10: // 542823
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf360) | 0) >>> 0), 32); // 542823: cmp ecx, dword ptr [0x9cf360]
        if (R.zf) { pc = 21; continue; } // 542829: je 0x542882
        pc = 11; continue;
      case 11: // 54282b
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf260) | 0) >>> 0), 32); // 54282b: cmp ecx, dword ptr [0x9cf260]
        if (R.zf) { pc = 21; continue; } // 542831: je 0x542882
        pc = 12; continue;
      case 12: // 542833
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf218) | 0) >>> 0), 32); // 542833: cmp ecx, dword ptr [0x9cf218]
        if (R.zf) { pc = 21; continue; } // 542839: je 0x542882
        pc = 13; continue;
      case 13: // 54283b
        R.eax = (R.m.u32(((R.eax + 0x71) | 0) >>> 0)) | 0; // 54283b: mov eax, dword ptr [eax + 0x71]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 54283e: test eax, eax
        if (R.zf) { pc = 22; continue; } // 542840: je 0x54288c
        pc = 14; continue;
      case 14: // 542842
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 542842: mov eax, dword ptr [eax]
        R.ecx = (R.m.u32(((0x9cfa18) | 0) >>> 0)) | 0; // 542844: mov ecx, dword ptr [0x9cfa18]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 54284a: cmp eax, ecx
        if (R.zf) { pc = 16; continue; } // 54284c: je 0x542856
        pc = 15; continue;
      case 15: // 54284e
        R.sub((R.eax >>> 0), R.m.u32(((0x9cfa08) | 0) >>> 0), 32); // 54284e: cmp eax, dword ptr [0x9cfa08]
        if (!R.zf) { pc = 22; continue; } // 542854: jne 0x54288c
        pc = 16; continue;
      default: return pc;
    }
  }
}
function f_542740_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 16: // 542856
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 542856: xor eax, eax
        R.esi = (R.pop()) | 0; // 542858: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 542859: add esp, 0x200
        R.rv = R.ret(0); return -1; // 54285f: ret 
      case 17: // 542860
        R.esi = (R.m.u32(((R.esi + 0x53) | 0) >>> 0)) | 0; // 542860: mov esi, dword ptr [esi + 0x53]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 542863: test esi, esi
        if (R.zf) { pc = 22; continue; } // 542865: je 0x54288c
        pc = 18; continue;
      case 18: // 542867
        R.esi = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 542867: mov esi, dword ptr [esi]
        R.eax = (R.m.u32(((0x9cf488) | 0) >>> 0)) | 0; // 542869: mov eax, dword ptr [0x9cf488]
        R.sub((R.esi >>> 0), (R.eax >>> 0), 32); // 54286e: cmp esi, eax
        if (R.zf) { pc = 21; continue; } // 542870: je 0x542882
        pc = 19; continue;
      case 19: // 542872
        R.sub((R.esi >>> 0), R.m.u32(((0x9cf314) | 0) >>> 0), 32); // 542872: cmp esi, dword ptr [0x9cf314]
        if (R.zf) { pc = 21; continue; } // 542878: je 0x542882
        pc = 20; continue;
      case 20: // 54287a
        R.sub((R.esi >>> 0), R.m.u32(((0x9cf434) | 0) >>> 0), 32); // 54287a: cmp esi, dword ptr [0x9cf434]
        if (!R.zf) { pc = 22; continue; } // 542880: jne 0x54288c
        pc = 21; continue;
      case 21: // 542882
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 542882: xor eax, eax
        R.esi = (R.pop()) | 0; // 542884: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 542885: add esp, 0x200
        R.rv = R.ret(0); return -1; // 54288b: ret 
      case 22: // 54288c
        R.eax = (0x1) | 0; // 54288c: mov eax, 1
        R.esi = (R.pop()) | 0; // 542891: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 542892: add esp, 0x200
        R.rv = R.ret(0); return -1; // 542898: ret 
      default: return pc;
    }
  }
}
export function f_542740(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 23) throw new Error(`f_542740: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_542740_0(R, pc); break;
      case 1: np = f_542740_1(R, pc); break;
      case 2: np = f_542740_2(R, pc); break;
      default: throw new Error(`f_542740: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_542740: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_542740.shared = true;
