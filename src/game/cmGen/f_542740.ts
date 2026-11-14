// 0x542740 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 540a50=3, 5e8290=9, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_542740(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x542740;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x542740:
        R.esp = (R.sub((R.esp >>> 0), 0x200, 32)) | 0; // 542740: sub esp, 0x200
        R.push((R.esi >>> 0)); // 542746: push esi
        R.esi = (R.m.u32(((R.esp + 0x208) | 0) >>> 0)) | 0; // 542747: mov esi, dword ptr [esp + 0x208]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 54274e: test esi, esi
        if (!R.zf) { pc = 0x5427b8; continue; } // 542750: jne 0x5427b8
        pc = 0x542752; continue;
      case 0x542752:
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
        return R.eax; // 5427b7: ret 
      case 0x5427b8:
        R.ecx = (R.m.u32(((0xae235c) | 0) >>> 0)) | 0; // 5427b8: mov ecx, dword ptr [0xae235c]
        R.edx = (R.m.u32(((0xae2350) | 0) >>> 0)) | 0; // 5427be: mov edx, dword ptr [0xae2350]
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 5427c4: mov eax, dword ptr [esi]
        R.ecx = (R.sub((R.ecx >>> 0), (R.edx >>> 0), 32)) | 0; // 5427c6: sub ecx, edx
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 5427c8: cmp eax, ecx
        if (R.cL) { pc = 0x5427d6; continue; } // 5427ca: jl 0x5427d6
        pc = 0x5427cc; continue;
      case 0x5427cc:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 5427cc: xor eax, eax
        R.esi = (R.pop()) | 0; // 5427ce: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 5427cf: add esp, 0x200
        return R.eax; // 5427d5: ret 
      case 0x5427d6:
        R.push(0x1); // 5427d6: push 1
        R.push(0x0); // 5427d8: push 0
        R.push((R.esi >>> 0)); // 5427da: push esi
        R.call(0x540a50, { n: 3, thisEcx: false, calleeClean: false }); // 5427db: call 0x540a50
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 5427e0: add esp, 0xc
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5427e3: test eax, eax
        if (R.zf) { pc = 0x5427f1; continue; } // 5427e5: je 0x5427f1
        pc = 0x5427e7; continue;
      case 0x5427e7:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 5427e7: xor eax, eax
        R.esi = (R.pop()) | 0; // 5427e9: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 5427ea: add esp, 0x200
        return R.eax; // 5427f0: ret 
      case 0x5427f1:
        R.edx = (R.m.u32(((0xae2350) | 0) >>> 0)) | 0; // 5427f1: mov edx, dword ptr [0xae2350]
        R.ecx = (R.m.u32(((0xae235c) | 0) >>> 0)) | 0; // 5427f7: mov ecx, dword ptr [0xae235c]
        R.eax = (((R.edx + R.edx) | 0)) | 0; // 5427fd: lea eax, [edx + edx]
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 542800: sub ecx, eax
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 542802: mov eax, dword ptr [esi]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 542804: cmp eax, ecx
        if (R.cL) { pc = 0x542860; continue; } // 542806: jl 0x542860
        pc = 0x542808; continue;
      case 0x542808:
        R.eax = (R.m.u32(((R.esi + 0x53) | 0) >>> 0)) | 0; // 542808: mov eax, dword ptr [esi + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 54280b: test eax, eax
        if (R.zf) { pc = 0x542860; continue; } // 54280d: je 0x542860
        pc = 0x54280f; continue;
      case 0x54280f:
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 54280f: mov ecx, dword ptr [eax]
        R.edx = (R.m.u32(((0x9cf488) | 0) >>> 0)) | 0; // 542811: mov edx, dword ptr [0x9cf488]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 542817: cmp ecx, edx
        if (R.zf) { pc = 0x542882; continue; } // 542819: je 0x542882
        pc = 0x54281b; continue;
      case 0x54281b:
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf408) | 0) >>> 0), 32); // 54281b: cmp ecx, dword ptr [0x9cf408]
        if (R.zf) { pc = 0x542882; continue; } // 542821: je 0x542882
        pc = 0x542823; continue;
      case 0x542823:
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf360) | 0) >>> 0), 32); // 542823: cmp ecx, dword ptr [0x9cf360]
        if (R.zf) { pc = 0x542882; continue; } // 542829: je 0x542882
        pc = 0x54282b; continue;
      case 0x54282b:
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf260) | 0) >>> 0), 32); // 54282b: cmp ecx, dword ptr [0x9cf260]
        if (R.zf) { pc = 0x542882; continue; } // 542831: je 0x542882
        pc = 0x542833; continue;
      case 0x542833:
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf218) | 0) >>> 0), 32); // 542833: cmp ecx, dword ptr [0x9cf218]
        if (R.zf) { pc = 0x542882; continue; } // 542839: je 0x542882
        pc = 0x54283b; continue;
      case 0x54283b:
        R.eax = (R.m.u32(((R.eax + 0x71) | 0) >>> 0)) | 0; // 54283b: mov eax, dword ptr [eax + 0x71]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 54283e: test eax, eax
        if (R.zf) { pc = 0x54288c; continue; } // 542840: je 0x54288c
        pc = 0x542842; continue;
      case 0x542842:
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 542842: mov eax, dword ptr [eax]
        R.ecx = (R.m.u32(((0x9cfa18) | 0) >>> 0)) | 0; // 542844: mov ecx, dword ptr [0x9cfa18]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 54284a: cmp eax, ecx
        if (R.zf) { pc = 0x542856; continue; } // 54284c: je 0x542856
        pc = 0x54284e; continue;
      case 0x54284e:
        R.sub((R.eax >>> 0), R.m.u32(((0x9cfa08) | 0) >>> 0), 32); // 54284e: cmp eax, dword ptr [0x9cfa08]
        if (!R.zf) { pc = 0x54288c; continue; } // 542854: jne 0x54288c
        pc = 0x542856; continue;
      case 0x542856:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 542856: xor eax, eax
        R.esi = (R.pop()) | 0; // 542858: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 542859: add esp, 0x200
        return R.eax; // 54285f: ret 
      case 0x542860:
        R.esi = (R.m.u32(((R.esi + 0x53) | 0) >>> 0)) | 0; // 542860: mov esi, dword ptr [esi + 0x53]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 542863: test esi, esi
        if (R.zf) { pc = 0x54288c; continue; } // 542865: je 0x54288c
        pc = 0x542867; continue;
      case 0x542867:
        R.esi = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 542867: mov esi, dword ptr [esi]
        R.eax = (R.m.u32(((0x9cf488) | 0) >>> 0)) | 0; // 542869: mov eax, dword ptr [0x9cf488]
        R.sub((R.esi >>> 0), (R.eax >>> 0), 32); // 54286e: cmp esi, eax
        if (R.zf) { pc = 0x542882; continue; } // 542870: je 0x542882
        pc = 0x542872; continue;
      case 0x542872:
        R.sub((R.esi >>> 0), R.m.u32(((0x9cf314) | 0) >>> 0), 32); // 542872: cmp esi, dword ptr [0x9cf314]
        if (R.zf) { pc = 0x542882; continue; } // 542878: je 0x542882
        pc = 0x54287a; continue;
      case 0x54287a:
        R.sub((R.esi >>> 0), R.m.u32(((0x9cf434) | 0) >>> 0), 32); // 54287a: cmp esi, dword ptr [0x9cf434]
        if (!R.zf) { pc = 0x54288c; continue; } // 542880: jne 0x54288c
        pc = 0x542882; continue;
      case 0x542882:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 542882: xor eax, eax
        R.esi = (R.pop()) | 0; // 542884: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 542885: add esp, 0x200
        return R.eax; // 54288b: ret 
      case 0x54288c:
        R.eax = (0x1) | 0; // 54288c: mov eax, 1
        R.esi = (R.pop()) | 0; // 542891: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 542892: add esp, 0x200
        return R.eax; // 542898: ret 
      default: throw new Error(`f_542740: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
