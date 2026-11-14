// 0x8cdc90 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 68d020=0t, 68d040=7t, 68d1b0=0t, 8c5cf0=3tc
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_8cdc90(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x8cdc90;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x8cdc90:
        R.push(0xffffffff); // 8cdc90: push -1
        R.push(0x963f18); // 8cdc92: push 0x963f18
        R.eax = (0) | 0; // 8cdc97: mov eax, dword ptr fs:[0]
        R.push((R.eax >>> 0)); // 8cdc9d: push eax
        /* fs */ // 8cdc9e: mov dword ptr fs:[0], esp
        R.esp = (R.sub((R.esp >>> 0), 0x10, 32)) | 0; // 8cdca5: sub esp, 0x10
        R.push((R.esi >>> 0)); // 8cdca8: push esi
        R.esi = ((R.ecx >>> 0)) | 0; // 8cdca9: mov esi, ecx
        R.push((R.edi >>> 0)); // 8cdcab: push edi
        R.ecx = (((R.esp + 0x8) | 0)) | 0; // 8cdcac: lea ecx, [esp + 8]
        R.call(0x68d020, { n: 0, thisEcx: true, calleeClean: false }); // 8cdcb0: call 0x68d020
        R.eax = (R.m.u32(((R.esp + 0x28) | 0) >>> 0)) | 0; // 8cdcb5: mov eax, dword ptr [esp + 0x28]
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, 0x0); // 8cdcb9: mov dword ptr [esp + 0x20], 0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cdcc1: test eax, eax
        if (R.zf) { pc = 0x8cdcd1; continue; } // 8cdcc3: je 0x8cdcd1
        pc = 0x8cdcc5; continue;
      case 0x8cdcc5:
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8cdcc5: mov ecx, dword ptr [eax]
        R.edx = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 8cdcc7: mov edx, dword ptr [0xae2364]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 8cdccd: cmp ecx, edx
        if (!R.cL) { pc = 0x8cdd24; continue; } // 8cdccf: jge 0x8cdd24
        pc = 0x8cdcd1; continue;
      case 0x8cdcd1:
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8cdcd1: mov edx, dword ptr [eax]
        R.ecx = (R.m.u32(((R.esi + 0x86e) | 0) >>> 0)) | 0; // 8cdcd3: mov ecx, dword ptr [esi + 0x86e]
        R.logic(R.m.u8(((R.ecx + R.edx * 8) | 0) >>> 0) & 0x1, 8); // 8cdcd9: test byte ptr [ecx + edx*8], 1
        if (R.zf) { pc = 0x8cdd24; continue; } // 8cdcdd: je 0x8cdd24
        pc = 0x8cdcdf; continue;
      case 0x8cdcdf:
        R.edx = (((R.esp + 0x8) | 0)) | 0; // 8cdcdf: lea edx, [esp + 8]
        R.push(0x0); // 8cdce3: push 0
        R.push((R.edx >>> 0)); // 8cdce5: push edx
        R.push((R.eax >>> 0)); // 8cdce6: push eax
        R.ecx = ((R.esi >>> 0)) | 0; // 8cdce7: mov ecx, esi
        R.call(0x8c5cf0, { n: 3, thisEcx: true, calleeClean: true }); // 8cdce9: call 0x8c5cf0
        R.eax = (R.m.u32(((R.esp + 0xa) | 0) >>> 0)) | 0; // 8cdcee: mov eax, dword ptr [esp + 0xa]
        R.ecx = (((R.esp + 0x8) | 0)) | 0; // 8cdcf2: lea ecx, [esp + 8]
        R.m.w32(((R.esp + 0x12) | 0) >>> 0, (R.eax >>> 0)); // 8cdcf6: mov dword ptr [esp + 0x12], eax
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8cdcfa: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cdcff: test eax, eax
        if (R.zf) { pc = 0x8cdd24; continue; } // 8cdd01: je 0x8cdd24
        pc = 0x8cdd03; continue;
      case 0x8cdd03:
        R.edi = (R.m.u32(((R.esp + 0x2c) | 0) >>> 0)) | 0; // 8cdd03: mov edi, dword ptr [esp + 0x2c]
        pc = 0x8cdd07; continue;
      case 0x8cdd07:
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8cdd07: mov ecx, dword ptr [eax]
        R.edx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8cdd09: mov edx, dword ptr [esi]
        R.eax = (R.m.u32(((R.edx + R.ecx * 4) | 0) >>> 0)) | 0; // 8cdd0b: mov eax, dword ptr [edx + ecx*4]
        R.ecx = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 8cdd0e: mov ecx, dword ptr [edi]
        R.eax = (R.m.u32(((R.eax + 0x8) | 0) >>> 0)) | 0; // 8cdd10: mov eax, dword ptr [eax + 8]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 8cdd13: cmp eax, ecx
        if (R.zf) { pc = 0x8cdd4a; continue; } // 8cdd15: je 0x8cdd4a
        pc = 0x8cdd17; continue;
      case 0x8cdd17:
        R.ecx = (((R.esp + 0x8) | 0)) | 0; // 8cdd17: lea ecx, [esp + 8]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8cdd1b: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cdd20: test eax, eax
        if (!R.zf) { pc = 0x8cdd07; continue; } // 8cdd22: jne 0x8cdd07
        pc = 0x8cdd24; continue;
      case 0x8cdd24:
        R.ecx = (((R.esp + 0x8) | 0)) | 0; // 8cdd24: lea ecx, [esp + 8]
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, 0xffffffff); // 8cdd28: mov dword ptr [esp + 0x20], 0xffffffff
        R.call(0x68d040, { n: 7, thisEcx: true, calleeClean: false }); // 8cdd30: call 0x68d040
        R.edi = (R.pop()) | 0; // 8cdd35: pop edi
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8cdd36: xor eax, eax
        R.esi = (R.pop()) | 0; // 8cdd38: pop esi
        R.ecx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 8cdd39: mov ecx, dword ptr [esp + 0x10]
        /* fs */ // 8cdd3d: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x1c, 32)) | 0; // 8cdd44: add esp, 0x1c
        return R.ret(2); // 8cdd47: ret 8
      case 0x8cdd4a:
        R.ecx = (((R.esp + 0x8) | 0)) | 0; // 8cdd4a: lea ecx, [esp + 8]
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, 0xffffffff); // 8cdd4e: mov dword ptr [esp + 0x20], 0xffffffff
        R.call(0x68d040, { n: 7, thisEcx: true, calleeClean: false }); // 8cdd56: call 0x68d040
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 8cdd5b: mov ecx, dword ptr [esp + 0x18]
        R.edi = (R.pop()) | 0; // 8cdd5f: pop edi
        R.eax = (0x1) | 0; // 8cdd60: mov eax, 1
        R.esi = (R.pop()) | 0; // 8cdd65: pop esi
        /* fs */ // 8cdd66: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x1c, 32)) | 0; // 8cdd6d: add esp, 0x1c
        return R.ret(2); // 8cdd70: ret 8
      default: throw new Error(`f_8cdc90: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
