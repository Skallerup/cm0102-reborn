// 0x897ee0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 5e8290=9, 8982b0=2c, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_897ee0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x897ee0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x897ee0:
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 897ee0: mov eax, dword ptr [esp + 4]
        R.esp = (R.sub((R.esp >>> 0), 0x200, 32)) | 0; // 897ee4: sub esp, 0x200
        R.push((R.ebx >>> 0)); // 897eea: push ebx
        R.push((R.esi >>> 0)); // 897eeb: push esi
        R.push((R.edi >>> 0)); // 897eec: push edi
        R.edi = (R.logic((R.edi >>> 0) ^ (R.edi >>> 0), 32)) | 0; // 897eed: xor edi, edi
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 897eef: cmp eax, edi
        R.esi = ((R.ecx >>> 0)) | 0; // 897ef1: mov esi, ecx
        if (!R.zf) { pc = 0x897f28; continue; } // 897ef3: jne 0x897f28
        pc = 0x897ef5; continue;
      case 0x897ef5:
        R.eax = (((R.esp + 0xc) | 0)) | 0; // 897ef5: lea eax, [esp + 0xc]
        R.ecx = (((R.esp + 0x10c) | 0)) | 0; // 897ef9: lea ecx, [esp + 0x10c]
        R.push((R.eax >>> 0)); // 897f00: push eax
        R.push((R.ecx >>> 0)); // 897f01: push ecx
        R.push((R.edi >>> 0)); // 897f02: push edi
        R.push((R.edi >>> 0)); // 897f03: push edi
        R.push(0xa8b908); // 897f04: push 0xa8b908
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 897f09: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 897f0e: add esp, 0x14
        R.edx = (((R.esp + 0xc) | 0)) | 0; // 897f11: lea edx, [esp + 0xc]
        R.eax = (((R.esp + 0x10c) | 0)) | 0; // 897f15: lea eax, [esp + 0x10c]
        R.push(0x675); // 897f1c: push 0x675
        R.push((R.edx >>> 0)); // 897f21: push edx
        R.push((R.eax >>> 0)); // 897f22: push eax
        pc = 0x898004; continue; // 897f23: jmp 0x898004
      case 0x897f28:
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.esp + 0x214) | 0) >>> 0)) & 0xff) << 0)) | 0; // 897f28: mov bl, byte ptr [esp + 0x214]
        R.logic(((R.ebx >>> 0) & 0xff) & ((R.ebx >>> 0) & 0xff), 8); // 897f2f: test bl, bl
        if (R.cL) { pc = 0x897fd6; continue; } // 897f31: jl 0x897fd6
        pc = 0x897f37; continue;
      case 0x897f37:
        R.sub(((R.ebx >>> 0) & 0xff), 0x1, 8); // 897f37: cmp bl, 1
        if (!R.cLE) { pc = 0x897fd6; continue; } // 897f3a: jg 0x897fd6
        pc = 0x897f40; continue;
      case 0x897f40:
        R.ecx = (R.m.u32(((R.esp + 0x21c) | 0) >>> 0)) | 0; // 897f40: mov ecx, dword ptr [esp + 0x21c]
        R.push((R.ecx >>> 0)); // 897f47: push ecx
        R.push((R.eax >>> 0)); // 897f48: push eax
        R.ecx = ((R.esi >>> 0)) | 0; // 897f49: mov ecx, esi
        R.call(0x8982b0, { n: 2, thisEcx: false, calleeClean: true }); // 897f4b: call 0x8982b0
        R.edx = (R.logic((R.edx >>> 0) | 0xffffffff, 32)) | 0; // 897f50: or edx, 0xffffffff
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 897f53: cmp eax, edx
        if (R.zf) { pc = 0x898032; continue; } // 897f55: je 0x898032
        pc = 0x897f5b; continue;
      case 0x897f5b:
        R.ecx = (R.m.u32(((R.esp + 0x218) | 0) >>> 0)) | 0; // 897f5b: mov ecx, dword ptr [esp + 0x218]
        R.sub((R.ecx >>> 0), (R.edi >>> 0), 32); // 897f62: cmp ecx, edi
        if (R.zf) { pc = 0x897f91; continue; } // 897f64: je 0x897f91
        pc = 0x897f66; continue;
      case 0x897f66:
        R.esi = (R.m.u32(((R.esi + 0x601) | 0) >>> 0)) | 0; // 897f66: mov esi, dword ptr [esi + 0x601]
        R.edi = (R.pop()) | 0; // 897f6c: pop edi
        R.edx = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 897f6d: movsx edx, bl
        R.edx = (((R.esi + R.edx * 4) | 0)) | 0; // 897f70: lea edx, [esi + edx*4]
        R.esi = (((R.eax + R.eax * 8) | 0)) | 0; // 897f73: lea esi, [eax + eax*8]
        R.esi = (R.shl((R.esi >>> 0), 0x4, 32)) | 0; // 897f76: shl esi, 4
        R.esi = (R.add((R.esi >>> 0), (R.eax >>> 0), 32)) | 0; // 897f79: add esi, eax
        R.eax = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 897f7b: mov eax, dword ptr [ecx]
        R.m.w32(((R.edx + R.esi + 0x56) | 0) >>> 0, (R.eax >>> 0)); // 897f7d: mov dword ptr [edx + esi + 0x56], eax
        R.esi = (R.pop()) | 0; // 897f81: pop esi
        R.eax = (0x1) | 0; // 897f82: mov eax, 1
        R.ebx = (R.pop()) | 0; // 897f87: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 897f88: add esp, 0x200
        return R.eax; // 897f8e: ret 0x10
      case 0x897f91:
        R.edi = (R.m.u32(((R.esi + 0x601) | 0) >>> 0)) | 0; // 897f91: mov edi, dword ptr [esi + 0x601]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 897f97: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 897f9a: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 897f9d: add ecx, eax
        R.eax = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 897f9f: movsx eax, bl
        R.logic(((R.ebx >>> 0) & 0xff) & ((R.ebx >>> 0) & 0xff), 8); // 897fa2: test bl, bl
        R.eax = (((R.edi + R.eax * 4) | 0)) | 0; // 897fa4: lea eax, [edi + eax*4]
        R.m.w32(((R.eax + R.ecx + 0x56) | 0) >>> 0, (R.edx >>> 0)); // 897fa7: mov dword ptr [eax + ecx + 0x56], edx
        if (!R.zf) { pc = 0x897fc5; continue; } // 897fab: jne 0x897fc5
        pc = 0x897fad; continue;
      case 0x897fad:
        R.eax = (R.m.u32(((R.esi + 0x601) | 0) >>> 0)) | 0; // 897fad: mov eax, dword ptr [esi + 0x601]
        R.eax = (R.add((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 897fb3: add eax, ecx
        R.edi = (R.m.u32(((R.eax + 0x5a) | 0) >>> 0)) | 0; // 897fb5: mov edi, dword ptr [eax + 0x5a]
        R.m.w32(((R.eax + 0x56) | 0) >>> 0, (R.edi >>> 0)); // 897fb8: mov dword ptr [eax + 0x56], edi
        R.eax = (R.m.u32(((R.esi + 0x601) | 0) >>> 0)) | 0; // 897fbb: mov eax, dword ptr [esi + 0x601]
        R.m.w32(((R.eax + R.ecx + 0x5a) | 0) >>> 0, (R.edx >>> 0)); // 897fc1: mov dword ptr [eax + ecx + 0x5a], edx
        pc = 0x897fc5; continue;
      case 0x897fc5:
        R.edi = (R.pop()) | 0; // 897fc5: pop edi
        R.esi = (R.pop()) | 0; // 897fc6: pop esi
        R.eax = (0x1) | 0; // 897fc7: mov eax, 1
        R.ebx = (R.pop()) | 0; // 897fcc: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 897fcd: add esp, 0x200
        return R.eax; // 897fd3: ret 0x10
      case 0x897fd6:
        R.ecx = (((R.esp + 0x10c) | 0)) | 0; // 897fd6: lea ecx, [esp + 0x10c]
        R.edx = (((R.esp + 0xc) | 0)) | 0; // 897fdd: lea edx, [esp + 0xc]
        R.push((R.ecx >>> 0)); // 897fe1: push ecx
        R.push((R.edx >>> 0)); // 897fe2: push edx
        R.push((R.edi >>> 0)); // 897fe3: push edi
        R.push((R.edi >>> 0)); // 897fe4: push edi
        R.push(0xa8b908); // 897fe5: push 0xa8b908
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 897fea: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 897fef: add esp, 0x14
        R.eax = (((R.esp + 0x10c) | 0)) | 0; // 897ff2: lea eax, [esp + 0x10c]
        R.ecx = (((R.esp + 0xc) | 0)) | 0; // 897ff9: lea ecx, [esp + 0xc]
        R.push(0x67d); // 897ffd: push 0x67d
        R.push((R.eax >>> 0)); // 898002: push eax
        R.push((R.ecx >>> 0)); // 898003: push ecx
        pc = 0x898004; continue;
      case 0x898004:
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 898004: call 0x90d130
        R.push((R.eax >>> 0)); // 898009: push eax
        R.push(0x9870e8); // 89800a: push 0x9870e8
        R.push(0xae24d0); // 89800f: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 898014: call 0x944c9f
        R.push((R.edi >>> 0)); // 898019: push edi
        R.push(0xae24d0); // 89801a: push 0xae24d0
        R.push(0x9870e0); // 89801f: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 898024: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 898029: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, (R.edi >>> 0)); // 89802c: mov dword ptr [0xb67a34], edi
        pc = 0x898032; continue;
      case 0x898032:
        R.edi = (R.pop()) | 0; // 898032: pop edi
        R.esi = (R.pop()) | 0; // 898033: pop esi
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 898034: xor eax, eax
        R.ebx = (R.pop()) | 0; // 898036: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 898037: add esp, 0x200
        return R.eax; // 89803d: ret 0x10
      default: throw new Error(`f_897ee0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
