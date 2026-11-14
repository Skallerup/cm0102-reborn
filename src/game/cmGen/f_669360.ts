// 0x669360 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 53b900=1, 5e8290=9, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_669360(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x669360;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x669360:
        R.esp = (R.sub((R.esp >>> 0), 0x200, 32)) | 0; // 669360: sub esp, 0x200
        R.push((R.esi >>> 0)); // 669366: push esi
        R.esi = (R.m.u32(((R.esp + 0x208) | 0) >>> 0)) | 0; // 669367: mov esi, dword ptr [esp + 0x208]
        R.push((R.esi >>> 0)); // 66936e: push esi
        R.call(0x53b900, { n: 1, thisEcx: false, calleeClean: false }); // 66936f: call 0x53b900
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 669374: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 669377: test eax, eax
        if (!R.zf) { pc = 0x669420; continue; } // 669379: jne 0x669420
        pc = 0x66937f; continue;
      case 0x66937f:
        R.edx = (R.m.u32(((R.esi + 0x53) | 0) >>> 0)) | 0; // 66937f: mov edx, dword ptr [esi + 0x53]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 669382: test edx, edx
        if (R.zf) { pc = 0x669420; continue; } // 669384: je 0x669420
        pc = 0x66938a; continue;
      case 0x66938a:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edx + 0x11c) | 0) >>> 0)) & 0xff) << 0)) | 0; // 66938a: mov al, byte ptr [edx + 0x11c]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 669390: test al, al
        if (R.zf) { pc = 0x669420; continue; } // 669392: je 0x669420
        pc = 0x669398; continue;
      case 0x669398:
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 669398: xor al, al
        pc = 0x66939a; continue;
      case 0x66939a:
        R.ecx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 66939a: movsx ecx, al
        R.ecx = (((R.ecx + R.ecx * 8) | 0)) | 0; // 66939d: lea ecx, [ecx + ecx*8]
        R.sub(R.m.u32(((R.ecx * 8 + 0xb63d60) | 0) >>> 0), (R.edx >>> 0), 32); // 6693a0: cmp dword ptr [ecx*8 + 0xb63d60], edx
        if (R.zf) { pc = 0x66945c; continue; } // 6693a7: je 0x66945c
        pc = 0x6693ad; continue;
      case 0x6693ad:
        R.eax = ((R.eax & 0xffffff00) | (((R.incdec(((R.eax >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 6693ad: inc al
        R.sub(((R.eax >>> 0) & 0xff), 0x23, 8); // 6693af: cmp al, 0x23
        if (R.cL) { pc = 0x66939a; continue; } // 6693b1: jl 0x66939a
        pc = 0x6693b3; continue;
      case 0x6693b3:
        R.edx = (((R.esp + 0x4) | 0)) | 0; // 6693b3: lea edx, [esp + 4]
        R.eax = (((R.esp + 0x104) | 0)) | 0; // 6693b7: lea eax, [esp + 0x104]
        R.push((R.edx >>> 0)); // 6693be: push edx
        R.push((R.eax >>> 0)); // 6693bf: push eax
        R.push(0x0); // 6693c0: push 0
        R.push(0x0); // 6693c2: push 0
        R.push(0x9eaff4); // 6693c4: push 0x9eaff4
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 6693c9: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 6693ce: add esp, 0x14
        R.ecx = (((R.esp + 0x4) | 0)) | 0; // 6693d1: lea ecx, [esp + 4]
        R.edx = (((R.esp + 0x104) | 0)) | 0; // 6693d5: lea edx, [esp + 0x104]
        R.push(0x26d); // 6693dc: push 0x26d
        R.push((R.ecx >>> 0)); // 6693e1: push ecx
        R.push((R.edx >>> 0)); // 6693e2: push edx
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 6693e3: call 0x90d130
        R.push((R.eax >>> 0)); // 6693e8: push eax
        R.push(0x9870e8); // 6693e9: push 0x9870e8
        R.push(0xae24d0); // 6693ee: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 6693f3: call 0x944c9f
        R.push(0x0); // 6693f8: push 0
        R.push(0xae24d0); // 6693fa: push 0xae24d0
        R.push(0x9870e0); // 6693ff: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 669404: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 669409: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 66940c: mov dword ptr [0xb67a34], 0
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 669416: xor al, al
        R.esi = (R.pop()) | 0; // 669418: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 669419: add esp, 0x200
        return R.eax; // 66941f: ret 
      case 0x669420:
        R.push((R.esi >>> 0)); // 669420: push esi
        R.call(0x53b900, { n: 1, thisEcx: false, calleeClean: false }); // 669421: call 0x53b900
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 669426: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 669429: test eax, eax
        if (!R.zf) { pc = 0x66945a; continue; } // 66942b: jne 0x66945a
        pc = 0x66942d; continue;
      case 0x66942d:
        R.edx = (R.m.u32(((R.esi + 0x53) | 0) >>> 0)) | 0; // 66942d: mov edx, dword ptr [esi + 0x53]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 669430: xor al, al
        pc = 0x669432; continue;
      case 0x669432:
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 669432: test edx, edx
        if (R.zf) { pc = 0x66944a; continue; } // 669434: je 0x66944a
        pc = 0x669436; continue;
      case 0x669436:
        R.ecx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 669436: movsx ecx, al
        R.esi = (R.m.u32(((R.edx + 0x71) | 0) >>> 0)) | 0; // 669439: mov esi, dword ptr [edx + 0x71]
        R.ecx = (((R.ecx + R.ecx * 8) | 0)) | 0; // 66943c: lea ecx, [ecx + ecx*8]
        R.ecx = (R.m.u32(((R.ecx * 8 + 0xb63d64) | 0) >>> 0)) | 0; // 66943f: mov ecx, dword ptr [ecx*8 + 0xb63d64]
        R.sub((R.ecx >>> 0), (R.esi >>> 0), 32); // 669446: cmp ecx, esi
        if (R.zf) { pc = 0x66945c; continue; } // 669448: je 0x66945c
        pc = 0x66944a; continue;
      case 0x66944a:
        R.eax = ((R.eax & 0xffffff00) | (((R.incdec(((R.eax >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 66944a: inc al
        R.sub(((R.eax >>> 0) & 0xff), 0x23, 8); // 66944c: cmp al, 0x23
        if (R.cL) { pc = 0x669432; continue; } // 66944e: jl 0x669432
        pc = 0x669450; continue;
      case 0x669450:
        R.eax = ((R.eax & 0xffffff00) | (((0x3) & 0xff) << 0)) | 0; // 669450: mov al, 3
        R.esi = (R.pop()) | 0; // 669452: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 669453: add esp, 0x200
        return R.eax; // 669459: ret 
      case 0x66945a:
        R.eax = ((R.eax & 0xffffff00) | (((0x1) & 0xff) << 0)) | 0; // 66945a: mov al, 1
        pc = 0x66945c; continue;
      case 0x66945c:
        R.esi = (R.pop()) | 0; // 66945c: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 66945d: add esp, 0x200
        return R.eax; // 669463: ret 
      default: throw new Error(`f_669360: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
