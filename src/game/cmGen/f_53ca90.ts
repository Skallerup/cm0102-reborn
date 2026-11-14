// 0x53ca90 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 53b3d0=1, 540a50=3, 5e8290=9, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_53ca90(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x53ca90;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x53ca90:
        R.esp = (R.sub((R.esp >>> 0), 0x200, 32)) | 0; // 53ca90: sub esp, 0x200
        R.push((R.esi >>> 0)); // 53ca96: push esi
        R.esi = (R.m.u32(((R.esp + 0x208) | 0) >>> 0)) | 0; // 53ca97: mov esi, dword ptr [esp + 0x208]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 53ca9e: test esi, esi
        if (R.zf) { pc = 0x53caf4; continue; } // 53caa0: je 0x53caf4
        pc = 0x53caa2; continue;
      case 0x53caa2:
        R.eax = (R.m.u32(((R.esi + 0xcf) | 0) >>> 0)) | 0; // 53caa2: mov eax, dword ptr [esi + 0xcf]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 53caa8: test eax, eax
        if (!R.zf) { pc = 0x53cb61; continue; } // 53caaa: jne 0x53cb61
        pc = 0x53cab0; continue;
      case 0x53cab0:
        R.push(0x1); // 53cab0: push 1
        R.push(0x0); // 53cab2: push 0
        R.push((R.esi >>> 0)); // 53cab4: push esi
        R.call(0x540a50, { n: 3, thisEcx: false, calleeClean: false }); // 53cab5: call 0x540a50
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 53caba: add esp, 0xc
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 53cabd: test eax, eax
        if (R.zf) { pc = 0x53cacf; continue; } // 53cabf: je 0x53cacf
        pc = 0x53cac1; continue;
      case 0x53cac1:
        R.ecx = (R.m.u32(((R.eax + 0xcf) | 0) >>> 0)) | 0; // 53cac1: mov ecx, dword ptr [eax + 0xcf]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 53cac7: test ecx, ecx
        if (!R.zf) { pc = 0x53cb6f; continue; } // 53cac9: jne 0x53cb6f
        pc = 0x53cacf; continue;
      case 0x53cacf:
        R.eax = (R.m.u32(((0xae235c) | 0) >>> 0)) | 0; // 53cacf: mov eax, dword ptr [0xae235c]
        R.edx = (R.m.u32(((0xae2350) | 0) >>> 0)) | 0; // 53cad4: mov edx, dword ptr [0xae2350]
        R.ecx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 53cada: mov ecx, dword ptr [esi]
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 53cadc: sub eax, edx
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 53cade: cmp ecx, eax
        if (R.cL) { pc = 0x53cb57; continue; } // 53cae0: jl 0x53cb57
        pc = 0x53cae2; continue;
      case 0x53cae2:
        R.ecx = (R.m.u32(((R.esi + 0x53) | 0) >>> 0)) | 0; // 53cae2: mov ecx, dword ptr [esi + 0x53]
        R.push((R.ecx >>> 0)); // 53cae5: push ecx
        R.call(0x53b3d0, { n: 1, thisEcx: false, calleeClean: false }); // 53cae6: call 0x53b3d0
        R.esi = ((R.eax >>> 0)) | 0; // 53caeb: mov esi, eax
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 53caed: add esp, 4
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 53caf0: test esi, esi
        if (!R.zf) { pc = 0x53caa2; continue; } // 53caf2: jne 0x53caa2
        pc = 0x53caf4; continue;
      case 0x53caf4:
        R.edx = (((R.esp + 0x4) | 0)) | 0; // 53caf4: lea edx, [esp + 4]
        R.eax = (((R.esp + 0x104) | 0)) | 0; // 53caf8: lea eax, [esp + 0x104]
        R.push((R.edx >>> 0)); // 53caff: push edx
        R.push((R.eax >>> 0)); // 53cb00: push eax
        R.push(0x0); // 53cb01: push 0
        R.push(0x0); // 53cb03: push 0
        R.push(0x9b5ac8); // 53cb05: push 0x9b5ac8
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 53cb0a: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 53cb0f: add esp, 0x14
        R.ecx = (((R.esp + 0x4) | 0)) | 0; // 53cb12: lea ecx, [esp + 4]
        R.edx = (((R.esp + 0x104) | 0)) | 0; // 53cb16: lea edx, [esp + 0x104]
        R.push(0x394a); // 53cb1d: push 0x394a
        R.push((R.ecx >>> 0)); // 53cb22: push ecx
        R.push((R.edx >>> 0)); // 53cb23: push edx
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 53cb24: call 0x90d130
        R.push((R.eax >>> 0)); // 53cb29: push eax
        R.push(0x9870e8); // 53cb2a: push 0x9870e8
        R.push(0xae24d0); // 53cb2f: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 53cb34: call 0x944c9f
        R.push(0x0); // 53cb39: push 0
        R.push(0xae24d0); // 53cb3b: push 0xae24d0
        R.push(0x9870e0); // 53cb40: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 53cb45: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 53cb4a: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 53cb4d: mov dword ptr [0xb67a34], 0
        pc = 0x53cb57; continue;
      case 0x53cb57:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53cb57: xor eax, eax
        R.esi = (R.pop()) | 0; // 53cb59: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53cb5a: add esp, 0x200
        return R.eax; // 53cb60: ret 
      case 0x53cb61:
        R.eax = (R.m.u32(((R.esi + 0xcf) | 0) >>> 0)) | 0; // 53cb61: mov eax, dword ptr [esi + 0xcf]
        R.esi = (R.pop()) | 0; // 53cb67: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53cb68: add esp, 0x200
        return R.eax; // 53cb6e: ret 
      case 0x53cb6f:
        R.eax = (R.m.u32(((R.eax + 0xcf) | 0) >>> 0)) | 0; // 53cb6f: mov eax, dword ptr [eax + 0xcf]
        R.esi = (R.pop()) | 0; // 53cb75: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53cb76: add esp, 0x200
        return R.eax; // 53cb7c: ret 
      default: throw new Error(`f_53ca90: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
