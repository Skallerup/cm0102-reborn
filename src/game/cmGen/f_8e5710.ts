// 0x8e5710 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 68d040=0t, 68d1f0=1tc, 944c94=1
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_8e5710(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x8e5710;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x8e5710:
        R.push(0xffffffff); // 8e5710: push -1
        R.push(0x96490b); // 8e5712: push 0x96490b
        R.eax = (0) | 0; // 8e5717: mov eax, dword ptr fs:[0]
        R.push((R.eax >>> 0)); // 8e571d: push eax
        /* fs */ // 8e571e: mov dword ptr fs:[0], esp
        R.push((R.ecx >>> 0)); // 8e5725: push ecx
        R.push((R.esi >>> 0)); // 8e5726: push esi
        R.push((R.edi >>> 0)); // 8e5727: push edi
        R.edi = ((R.ecx >>> 0)) | 0; // 8e5728: mov edi, ecx
        R.m.w32(((R.esp + 0x8) | 0) >>> 0, (R.edi >>> 0)); // 8e572a: mov dword ptr [esp + 8], edi
        R.esi = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 8e572e: mov esi, dword ptr [edi]
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, 0x0); // 8e5730: mov dword ptr [esp + 0x14], 0
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8e5738: test esi, esi
        if (R.zf) { pc = 0x8e5763; continue; } // 8e573a: je 0x8e5763
        pc = 0x8e573c; continue;
      case 0x8e573c:
        R.sub(R.m.u16(((R.esi) | 0) >>> 0), 0x1, 16); // 8e573c: cmp word ptr [esi], 1
        if (!R.zf) { pc = 0x8e5758; continue; } // 8e5740: jne 0x8e5758
        pc = 0x8e5742; continue;
      case 0x8e5742:
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8e5742: test esi, esi
        if (R.zf) { pc = 0x8e5763; continue; } // 8e5744: je 0x8e5763
        pc = 0x8e5746; continue;
      case 0x8e5746:
        R.ecx = ((R.esi >>> 0)) | 0; // 8e5746: mov ecx, esi
        R.call(0x68d040, { n: 0, thisEcx: true, calleeClean: false }); // 8e5748: call 0x68d040
        R.push((R.esi >>> 0)); // 8e574d: push esi
        R.call(0x944c94, { n: 1, thisEcx: false, calleeClean: false }); // 8e574e: call 0x944c94
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8e5753: add esp, 4
        pc = 0x8e5763; continue; // 8e5756: jmp 0x8e5763
      case 0x8e5758:
        R.eax = (((R.edi + 0x20) | 0)) | 0; // 8e5758: lea eax, [edi + 0x20]
        R.ecx = ((R.esi >>> 0)) | 0; // 8e575b: mov ecx, esi
        R.push((R.eax >>> 0)); // 8e575d: push eax
        R.call(0x68d1f0, { n: 1, thisEcx: true, calleeClean: true }); // 8e575e: call 0x68d1f0
        pc = 0x8e5763; continue;
      case 0x8e5763:
        R.esi = (R.m.u32(((R.edi + 0x4) | 0) >>> 0)) | 0; // 8e5763: mov esi, dword ptr [edi + 4]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8e5766: test esi, esi
        if (R.zf) { pc = 0x8e577a; continue; } // 8e5768: je 0x8e577a
        pc = 0x8e576a; continue;
      case 0x8e576a:
        R.ecx = ((R.esi >>> 0)) | 0; // 8e576a: mov ecx, esi
        R.call(0x68d040, { n: 0, thisEcx: true, calleeClean: false }); // 8e576c: call 0x68d040
        R.push((R.esi >>> 0)); // 8e5771: push esi
        R.call(0x944c94, { n: 1, thisEcx: false, calleeClean: false }); // 8e5772: call 0x944c94
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8e5777: add esp, 4
        pc = 0x8e577a; continue;
      case 0x8e577a:
        R.ecx = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 8e577a: mov ecx, dword ptr [esp + 0xc]
        R.edi = (R.pop()) | 0; // 8e577e: pop edi
        R.esi = (R.pop()) | 0; // 8e577f: pop esi
        /* fs */ // 8e5780: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 8e5787: add esp, 0x10
        return R.ret(0); // 8e578a: ret 
      default: throw new Error(`f_8e5710: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
