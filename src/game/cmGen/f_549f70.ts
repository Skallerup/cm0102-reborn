// 0x549f70 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 54a2d0=2tc, 5e8290=9, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x549f70, 0x549f87, 0x549f8d, 0x549ff2, 0x549ffe, 0x54a003, 0x54a065, 0x54a080, 0x54a085, 0x54a08a, 0x54a093, 0x54a098, 0x54a09a, 0x54a0aa, 0x54a0b8, 0x54a0d2, 0x54a0ea, 0x54a0f8, 0x54a101]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2]);
function f_549f70_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 549f70
        R.esp = (R.sub((R.esp >>> 0), 0x200, 32)) | 0; // 549f70: sub esp, 0x200
        R.push((R.esi >>> 0)); // 549f76: push esi
        R.push((R.edi >>> 0)); // 549f77: push edi
        R.edi = (R.m.u32(((R.esp + 0x20c) | 0) >>> 0)) | 0; // 549f78: mov edi, dword ptr [esp + 0x20c]
        R.esi = ((R.ecx >>> 0)) | 0; // 549f7f: mov esi, ecx
        R.sub(((R.edi >>> 0) & 0xffff), 0x1, 16); // 549f81: cmp di, 1
        if (R.cL) { pc = 2; continue; } // 549f85: jl 0x549f8d
        pc = 1; continue;
      case 1: // 549f87
        R.sub(((R.edi >>> 0) & 0xffff), 0x1f, 16); // 549f87: cmp di, 0x1f
        if (R.cLE) { pc = 3; continue; } // 549f8b: jle 0x549ff2
        pc = 2; continue;
      case 2: // 549f8d
        R.eax = (((R.esp + 0x8) | 0)) | 0; // 549f8d: lea eax, [esp + 8]
        R.ecx = (((R.esp + 0x108) | 0)) | 0; // 549f91: lea ecx, [esp + 0x108]
        R.push((R.eax >>> 0)); // 549f98: push eax
        R.push((R.ecx >>> 0)); // 549f99: push ecx
        R.push(0x0); // 549f9a: push 0
        R.push(0x0); // 549f9c: push 0
        R.push(0x9b8478); // 549f9e: push 0x9b8478
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 549fa3: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 549fa8: add esp, 0x14
        R.edx = (((R.esp + 0x8) | 0)) | 0; // 549fab: lea edx, [esp + 8]
        R.eax = (((R.esp + 0x108) | 0)) | 0; // 549faf: lea eax, [esp + 0x108]
        R.push(0x34); // 549fb6: push 0x34
        R.push((R.edx >>> 0)); // 549fb8: push edx
        R.push((R.eax >>> 0)); // 549fb9: push eax
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 549fba: call 0x90d130
        R.push((R.eax >>> 0)); // 549fbf: push eax
        R.push(0x9870e8); // 549fc0: push 0x9870e8
        R.push(0xae24d0); // 549fc5: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 549fca: call 0x944c9f
        R.push(0x0); // 549fcf: push 0
        R.push(0xae24d0); // 549fd1: push 0xae24d0
        R.push(0x9870e0); // 549fd6: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 549fdb: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 549fe0: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 549fe3: mov dword ptr [0xb67a34], 0
        R.edi = (0x1) | 0; // 549fed: mov edi, 1
        pc = 3; continue;
      case 3: // 549ff2
        R.push((R.ebx >>> 0)); // 549ff2: push ebx
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.esp + 0x214) | 0) >>> 0)) & 0xff) << 0)) | 0; // 549ff3: mov bl, byte ptr [esp + 0x214]
        R.logic(((R.ebx >>> 0) & 0xff) & ((R.ebx >>> 0) & 0xff), 8); // 549ffa: test bl, bl
        if (R.cL) { pc = 5; continue; } // 549ffc: jl 0x54a003
        pc = 4; continue;
      case 4: // 549ffe
        R.sub(((R.ebx >>> 0) & 0xff), 0xb, 8); // 549ffe: cmp bl, 0xb
        if (R.cLE) { pc = 6; continue; } // 54a001: jle 0x54a065
        pc = 5; continue;
      default: return pc;
    }
  }
}
function f_549f70_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 5: // 54a003
        R.ecx = (((R.esp + 0x10c) | 0)) | 0; // 54a003: lea ecx, [esp + 0x10c]
        R.edx = (((R.esp + 0xc) | 0)) | 0; // 54a00a: lea edx, [esp + 0xc]
        R.push((R.ecx >>> 0)); // 54a00e: push ecx
        R.push((R.edx >>> 0)); // 54a00f: push edx
        R.push(0x0); // 54a010: push 0
        R.push(0x0); // 54a012: push 0
        R.push(0x9b8478); // 54a014: push 0x9b8478
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 54a019: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 54a01e: add esp, 0x14
        R.eax = (((R.esp + 0x10c) | 0)) | 0; // 54a021: lea eax, [esp + 0x10c]
        R.ecx = (((R.esp + 0xc) | 0)) | 0; // 54a028: lea ecx, [esp + 0xc]
        R.push(0x3b); // 54a02c: push 0x3b
        R.push((R.eax >>> 0)); // 54a02e: push eax
        R.push((R.ecx >>> 0)); // 54a02f: push ecx
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 54a030: call 0x90d130
        R.push((R.eax >>> 0)); // 54a035: push eax
        R.push(0x9870e8); // 54a036: push 0x9870e8
        R.push(0xae24d0); // 54a03b: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 54a040: call 0x944c9f
        R.push(0x0); // 54a045: push 0
        R.push(0xae24d0); // 54a047: push 0xae24d0
        R.push(0x9870e0); // 54a04c: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 54a051: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 54a056: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 54a059: mov dword ptr [0xb67a34], 0
        R.ebx = ((R.ebx & 0xffffff00) | (((R.logic(((R.ebx >>> 0) & 0xff) ^ ((R.ebx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 54a063: xor bl, bl
        pc = 6; continue;
      case 6: // 54a065
        R.ecx = (R.m.u32(((R.esp + 0x218) | 0) >>> 0)) | 0; // 54a065: mov ecx, dword ptr [esp + 0x218]
        R.m.w16(((R.esi + 0x2) | 0) >>> 0, ((R.ecx >>> 0) & 0xffff)); // 54a06c: mov word ptr [esi + 2], cx
        R.ecx = (R.logic((R.ecx >>> 0) & 0xffff, 32)) | 0; // 54a070: and ecx, 0xffff
        R.edx = ((R.ecx >>> 0)) | 0; // 54a076: mov edx, ecx
        R.edx = (R.logic((R.edx >>> 0) & 0x80000001, 32)) | 0; // 54a078: and edx, 0x80000001
        if (!R.sf) { pc = 8; continue; } // 54a07e: jns 0x54a085
        pc = 7; continue;
      case 7: // 54a080
        R.edx = (R.incdec((R.edx >>> 0), -1, 32)) | 0; // 54a080: dec edx
        R.edx = (R.logic((R.edx >>> 0) | 0xfffffffe, 32)) | 0; // 54a081: or edx, 0xfffffffe
        R.edx = (R.incdec((R.edx >>> 0), 1, 32)) | 0; // 54a084: inc edx
        pc = 8; continue;
      case 8: // 54a085
        R.sub((R.edx >>> 0), 0x1, 32); // 54a085: cmp edx, 1
        if (R.zf) { pc = 15; continue; } // 54a088: je 0x54a0d2
        pc = 9; continue;
      case 9: // 54a08a
        R.eax = ((R.ecx >>> 0)) | 0; // 54a08a: mov eax, ecx
        R.eax = (R.logic((R.eax >>> 0) & 0x80000003, 32)) | 0; // 54a08c: and eax, 0x80000003
        if (!R.sf) { pc = 11; continue; } // 54a091: jns 0x54a098
        pc = 10; continue;
      case 10: // 54a093
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 54a093: dec eax
        R.eax = (R.logic((R.eax >>> 0) | 0xfffffffc, 32)) | 0; // 54a094: or eax, 0xfffffffc
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 54a097: inc eax
        pc = 11; continue;
      case 11: // 54a098
        if (!R.zf) { pc = 15; continue; } // 54a098: jne 0x54a0d2
        pc = 12; continue;
      default: return pc;
    }
  }
}
function f_549f70_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 12: // 54a09a
        R.eax = ((R.ecx >>> 0)) | 0; // 54a09a: mov eax, ecx
        R.push((R.ebp >>> 0)); // 54a09c: push ebp
        R.edx = R.eax < 0 ? -1 : 0; // 54a09d: cdq 
        R.ebp = (0x64) | 0; // 54a09e: mov ebp, 0x64
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.ebp >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 54a0a3: idiv ebp
        R.ebp = (R.pop()) | 0; // 54a0a5: pop ebp
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 54a0a6: test edx, edx
        if (!R.zf) { pc = 14; continue; } // 54a0a8: jne 0x54a0b8
        pc = 13; continue;
      case 13: // 54a0aa
        R.eax = ((R.ecx >>> 0)) | 0; // 54a0aa: mov eax, ecx
        R.ecx = (0x190) | 0; // 54a0ac: mov ecx, 0x190
        R.edx = R.eax < 0 ? -1 : 0; // 54a0b1: cdq 
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.ecx >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 54a0b2: idiv ecx
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 54a0b4: test edx, edx
        if (!R.zf) { pc = 15; continue; } // 54a0b6: jne 0x54a0d2
        pc = 14; continue;
      case 14: // 54a0b8
        R.edx = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 54a0b8: movsx edx, bl
        R.m.w32(((R.esi + 0x4) | 0) >>> 0, 0x1); // 54a0bb: mov dword ptr [esi + 4], 1
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.edx * 2 + 0x9b8460) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 54a0c2: mov ax, word ptr [edx*2 + 0x9b8460]
        R.eax = ((R.eax & 0xffff0000) | (((R.add(((R.eax >>> 0) & 0xffff), ((R.edi >>> 0) & 0xffff), 16)) & 0xffff) << 0)) | 0; // 54a0ca: add ax, di
        R.m.w16(((R.esi) | 0) >>> 0, ((R.eax >>> 0) & 0xffff)); // 54a0cd: mov word ptr [esi], ax
        pc = 16; continue; // 54a0d0: jmp 0x54a0ea
      case 15: // 54a0d2
        R.ecx = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 54a0d2: movsx ecx, bl
        R.m.w32(((R.esi + 0x4) | 0) >>> 0, 0x0); // 54a0d5: mov dword ptr [esi + 4], 0
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.ecx * 2 + 0x9b8448) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 54a0dc: mov dx, word ptr [ecx*2 + 0x9b8448]
        R.edx = ((R.edx & 0xffff0000) | (((R.add(((R.edx >>> 0) & 0xffff), ((R.edi >>> 0) & 0xffff), 16)) & 0xffff) << 0)) | 0; // 54a0e4: add dx, di
        R.m.w16(((R.esi) | 0) >>> 0, ((R.edx >>> 0) & 0xffff)); // 54a0e7: mov word ptr [esi], dx
        pc = 16; continue;
      case 16: // 54a0ea
        R.eax = (R.m.u32(((R.esp + 0x21c) | 0) >>> 0)) | 0; // 54a0ea: mov eax, dword ptr [esp + 0x21c]
        R.ebx = (R.pop()) | 0; // 54a0f1: pop ebx
        R.sub(((R.eax >>> 0) & 0xffff), 0xffff, 16); // 54a0f2: cmp ax, 0xffff
        if (R.zf) { pc = 18; continue; } // 54a0f6: je 0x54a101
        pc = 17; continue;
      case 17: // 54a0f8
        R.push((R.esi >>> 0)); // 54a0f8: push esi
        R.push((R.eax >>> 0)); // 54a0f9: push eax
        R.ecx = ((R.esi >>> 0)) | 0; // 54a0fa: mov ecx, esi
        R.call(0x54a2d0, { n: 2, thisEcx: true, calleeClean: true }); // 54a0fc: call 0x54a2d0
        pc = 18; continue;
      case 18: // 54a101
        R.eax = ((R.esi >>> 0)) | 0; // 54a101: mov eax, esi
        R.edi = (R.pop()) | 0; // 54a103: pop edi
        R.esi = (R.pop()) | 0; // 54a104: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 54a105: add esp, 0x200
        R.rv = R.ret(4); return -1; // 54a10b: ret 0x10
      default: return pc;
    }
  }
}
export function f_549f70(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 19) throw new Error(`f_549f70: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_549f70_0(R, pc); break;
      case 1: np = f_549f70_1(R, pc); break;
      case 2: np = f_549f70_2(R, pc); break;
      default: throw new Error(`f_549f70: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_549f70: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_549f70.shared = true;
