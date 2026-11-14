// 0x897dc0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 5e8290=9, 8982b0=2c, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x897dc0, 0x897dd2, 0x897e07, 0x897e12, 0x897e17, 0x897e30, 0x897e51, 0x897e6e, 0x897e9e, 0x897ed1]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 1, 1, 1, 1]);
function f_897dc0_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 897dc0
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 897dc0: mov eax, dword ptr [esp + 4]
        R.esp = (R.sub((R.esp >>> 0), 0x200, 32)) | 0; // 897dc4: sub esp, 0x200
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 897dca: test eax, eax
        R.push((R.ebx >>> 0)); // 897dcc: push ebx
        R.push((R.esi >>> 0)); // 897dcd: push esi
        R.esi = ((R.ecx >>> 0)) | 0; // 897dce: mov esi, ecx
        if (!R.zf) { pc = 2; continue; } // 897dd0: jne 0x897e07
        pc = 1; continue;
      case 1: // 897dd2
        R.eax = (((R.esp + 0x8) | 0)) | 0; // 897dd2: lea eax, [esp + 8]
        R.ecx = (((R.esp + 0x108) | 0)) | 0; // 897dd6: lea ecx, [esp + 0x108]
        R.push((R.eax >>> 0)); // 897ddd: push eax
        R.push((R.ecx >>> 0)); // 897dde: push ecx
        R.push(0x0); // 897ddf: push 0
        R.push(0x0); // 897de1: push 0
        R.push(0xa8b908); // 897de3: push 0xa8b908
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 897de8: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 897ded: add esp, 0x14
        R.edx = (((R.esp + 0x8) | 0)) | 0; // 897df0: lea edx, [esp + 8]
        R.eax = (((R.esp + 0x108) | 0)) | 0; // 897df4: lea eax, [esp + 0x108]
        R.push(0x64a); // 897dfb: push 0x64a
        R.push((R.edx >>> 0)); // 897e00: push edx
        R.push((R.eax >>> 0)); // 897e01: push eax
        pc = 8; continue; // 897e02: jmp 0x897e9e
      case 2: // 897e07
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.esp + 0x210) | 0) >>> 0)) & 0xff) << 0)) | 0; // 897e07: mov bl, byte ptr [esp + 0x210]
        R.logic(((R.ebx >>> 0) & 0xff) & ((R.ebx >>> 0) & 0xff), 8); // 897e0e: test bl, bl
        if (R.cL) { pc = 7; continue; } // 897e10: jl 0x897e6e
        pc = 3; continue;
      case 3: // 897e12
        R.sub(((R.ebx >>> 0) & 0xff), 0x1, 8); // 897e12: cmp bl, 1
        if (!R.cLE) { pc = 7; continue; } // 897e15: jg 0x897e6e
        pc = 4; continue;
      case 4: // 897e17
        R.ecx = (R.m.u32(((R.esp + 0x214) | 0) >>> 0)) | 0; // 897e17: mov ecx, dword ptr [esp + 0x214]
        R.push((R.ecx >>> 0)); // 897e1e: push ecx
        R.push((R.eax >>> 0)); // 897e1f: push eax
        R.ecx = ((R.esi >>> 0)) | 0; // 897e20: mov ecx, esi
        R.call(0x8982b0, { n: 2, thisEcx: false, calleeClean: true }); // 897e22: call 0x8982b0
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 897e27: cmp eax, -1
        if (R.zf) { pc = 9; continue; } // 897e2a: je 0x897ed1
        pc = 5; continue;
      case 5: // 897e30
        R.ecx = (R.m.u32(((R.esi + 0x601) | 0) >>> 0)) | 0; // 897e30: mov ecx, dword ptr [esi + 0x601]
        R.edx = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 897e36: movsx edx, bl
        R.edx = (((R.ecx + R.edx * 4) | 0)) | 0; // 897e39: lea edx, [ecx + edx*4]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 897e3c: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 897e3f: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 897e42: add ecx, eax
        R.eax = (R.m.u32(((R.edx + R.ecx + 0x56) | 0) >>> 0)) | 0; // 897e44: mov eax, dword ptr [edx + ecx + 0x56]
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 897e48: cmp eax, -1
        if (R.cLE) { pc = 9; continue; } // 897e4b: jle 0x897ed1
        pc = 6; continue;
      default: return pc;
    }
  }
}
function f_897dc0_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 6: // 897e51
        R.ecx = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 897e51: mov ecx, dword ptr [0xae23bc]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 897e57: lea edx, [eax + eax*4]
        R.esi = (R.pop()) | 0; // 897e5a: pop esi
        R.ebx = (R.pop()) | 0; // 897e5b: pop ebx
        R.eax = (((R.eax + R.edx * 2) | 0)) | 0; // 897e5c: lea eax, [eax + edx*2]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 897e5f: lea eax, [eax + eax*4]
        R.eax = (((R.ecx + R.eax * 2) | 0)) | 0; // 897e62: lea eax, [ecx + eax*2]
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 897e65: add esp, 0x200
        R.rv = R.ret(3); return -1; // 897e6b: ret 0xc
      case 7: // 897e6e
        R.edx = (((R.esp + 0x108) | 0)) | 0; // 897e6e: lea edx, [esp + 0x108]
        R.eax = (((R.esp + 0x8) | 0)) | 0; // 897e75: lea eax, [esp + 8]
        R.push((R.edx >>> 0)); // 897e79: push edx
        R.push((R.eax >>> 0)); // 897e7a: push eax
        R.push(0x0); // 897e7b: push 0
        R.push(0x0); // 897e7d: push 0
        R.push(0xa8b908); // 897e7f: push 0xa8b908
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 897e84: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 897e89: add esp, 0x14
        R.ecx = (((R.esp + 0x108) | 0)) | 0; // 897e8c: lea ecx, [esp + 0x108]
        R.edx = (((R.esp + 0x8) | 0)) | 0; // 897e93: lea edx, [esp + 8]
        R.push(0x652); // 897e97: push 0x652
        R.push((R.ecx >>> 0)); // 897e9c: push ecx
        R.push((R.edx >>> 0)); // 897e9d: push edx
        pc = 8; continue;
      case 8: // 897e9e
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 897e9e: call 0x90d130
        R.push((R.eax >>> 0)); // 897ea3: push eax
        R.push(0x9870e8); // 897ea4: push 0x9870e8
        R.push(0xae24d0); // 897ea9: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 897eae: call 0x944c9f
        R.push(0x0); // 897eb3: push 0
        R.push(0xae24d0); // 897eb5: push 0xae24d0
        R.push(0x9870e0); // 897eba: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 897ebf: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 897ec4: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 897ec7: mov dword ptr [0xb67a34], 0
        pc = 9; continue;
      case 9: // 897ed1
        R.esi = (R.pop()) | 0; // 897ed1: pop esi
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 897ed2: xor eax, eax
        R.ebx = (R.pop()) | 0; // 897ed4: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 897ed5: add esp, 0x200
        R.rv = R.ret(3); return -1; // 897edb: ret 0xc
      default: return pc;
    }
  }
}
export function f_897dc0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 10) throw new Error(`f_897dc0: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_897dc0_0(R, pc); break;
      case 1: np = f_897dc0_1(R, pc); break;
      default: throw new Error(`f_897dc0: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_897dc0: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_897dc0.shared = true;
