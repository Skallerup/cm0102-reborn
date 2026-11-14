// 0x5fd480 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 5e8290=9, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x5fd480, 0x5fd48e, 0x5fd4a5, 0x5fd4d5, 0x5fd4e3, 0x5fd4eb, 0x5fd51d, 0x5fd54d]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 1, 1, 1]);
function f_5fd480_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 5fd480
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 5fd480: mov eax, dword ptr [esp + 4]
        R.esp = (R.sub((R.esp >>> 0), 0x200, 32)) | 0; // 5fd484: sub esp, 0x200
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5fd48a: test eax, eax
        if (!R.zf) { pc = 3; continue; } // 5fd48c: jne 0x5fd4d5
        pc = 1; continue;
      case 1: // 5fd48e
        R.eax = (((R.m.u16(((0xb77c7a) | 0) >>> 0)) << 16 >> 16)) | 0; // 5fd48e: movsx eax, word ptr [0xb77c7a]
        R.eax = (((R.eax + R.eax * 2) | 0)) | 0; // 5fd495: lea eax, [eax + eax*2]
        R.eax = (R.shl((R.eax >>> 0), 0x8, 32)) | 0; // 5fd498: shl eax, 8
        R.eax = (R.m.u32(((R.eax + 0xb74c26) | 0) >>> 0)) | 0; // 5fd49b: mov eax, dword ptr [eax + 0xb74c26]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5fd4a1: test eax, eax
        if (!R.zf) { pc = 3; continue; } // 5fd4a3: jne 0x5fd4d5
        pc = 2; continue;
      case 2: // 5fd4a5
        R.ecx = (((R.esp) | 0)) | 0; // 5fd4a5: lea ecx, [esp]
        R.edx = (((R.esp + 0x100) | 0)) | 0; // 5fd4a9: lea edx, [esp + 0x100]
        R.push((R.ecx >>> 0)); // 5fd4b0: push ecx
        R.push((R.edx >>> 0)); // 5fd4b1: push edx
        R.push((R.eax >>> 0)); // 5fd4b2: push eax
        R.push((R.eax >>> 0)); // 5fd4b3: push eax
        R.push(0x9cf11c); // 5fd4b4: push 0x9cf11c
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 5fd4b9: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 5fd4be: add esp, 0x14
        R.eax = (((R.esp) | 0)) | 0; // 5fd4c1: lea eax, [esp]
        R.ecx = (((R.esp + 0x100) | 0)) | 0; // 5fd4c5: lea ecx, [esp + 0x100]
        R.push(0x462); // 5fd4cc: push 0x462
        R.push((R.eax >>> 0)); // 5fd4d1: push eax
        R.push((R.ecx >>> 0)); // 5fd4d2: push ecx
        pc = 7; continue; // 5fd4d3: jmp 0x5fd54d
      case 3: // 5fd4d5
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 5fd4d5: mov edx, dword ptr [eax]
        R.eax = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 5fd4d7: mov eax, dword ptr [0xae2364]
        R.edx = (R.sub((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 5fd4dc: sub edx, eax
        R.edx = (R.add((R.edx >>> 0), 0x10, 32)) | 0; // 5fd4de: add edx, 0x10
        if (R.sf) { pc = 6; continue; } // 5fd4e1: js 0x5fd51d
        pc = 4; continue;
      case 4: // 5fd4e3
        R.eax = (R.m.u32(((R.ecx + 0x4) | 0) >>> 0)) | 0; // 5fd4e3: mov eax, dword ptr [ecx + 4]
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 5fd4e6: dec eax
        R.sub((R.edx >>> 0), (R.eax >>> 0), 32); // 5fd4e7: cmp edx, eax
        if (!R.cLE) { pc = 6; continue; } // 5fd4e9: jg 0x5fd51d
        pc = 5; continue;
      default: return pc;
    }
  }
}
function f_5fd480_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 5: // 5fd4eb
        R.eax = (((R.edx + R.edx * 4) | 0)) | 0; // 5fd4eb: lea eax, [edx + edx*4]
        R.push((R.ebx >>> 0)); // 5fd4ee: push ebx
        R.eax = (((R.eax + R.eax * 8) | 0)) | 0; // 5fd4ef: lea eax, [eax + eax*8]
        R.eax = (R.shl((R.eax >>> 0), 0x1, 32)) | 0; // 5fd4f2: shl eax, 1
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 5fd4f4: sub eax, edx
        R.eax = (R.shl((R.eax >>> 0), 0x5, 32)) | 0; // 5fd4f6: shl eax, 5
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 5fd4f9: add eax, edx
        R.eax = (((R.eax + R.eax * 2) | 0)) | 0; // 5fd4fb: lea eax, [eax + eax*2]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 5fd4fe: lea edx, [eax + eax*4]
        R.eax = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 5fd501: mov eax, dword ptr [ecx]
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 5fd503: xor ecx, ecx
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.edx + R.eax + 0x9a05) | 0) >>> 0)) & 0xff) << 0)) | 0; // 5fd505: mov bl, byte ptr [edx + eax + 0x9a05]
        R.logic(((R.ebx >>> 0) & 0xff) & ((R.ebx >>> 0) & 0xff), 8); // 5fd50c: test bl, bl
        R.ecx = ((R.ecx & 0xffffff00) | (((!R.zf ? 1 : 0) & 0xff) << 0)) | 0; // 5fd50e: setne cl
        R.eax = ((R.ecx >>> 0)) | 0; // 5fd511: mov eax, ecx
        R.ebx = (R.pop()) | 0; // 5fd513: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 5fd514: add esp, 0x200
        R.rv = R.ret(1); return -1; // 5fd51a: ret 4
      case 6: // 5fd51d
        R.edx = (((R.esp + 0x100) | 0)) | 0; // 5fd51d: lea edx, [esp + 0x100]
        R.eax = (((R.esp) | 0)) | 0; // 5fd524: lea eax, [esp]
        R.push((R.edx >>> 0)); // 5fd528: push edx
        R.push((R.eax >>> 0)); // 5fd529: push eax
        R.push(0x0); // 5fd52a: push 0
        R.push(0x0); // 5fd52c: push 0
        R.push(0x9cf11c); // 5fd52e: push 0x9cf11c
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 5fd533: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 5fd538: add esp, 0x14
        R.ecx = (((R.esp + 0x100) | 0)) | 0; // 5fd53b: lea ecx, [esp + 0x100]
        R.edx = (((R.esp) | 0)) | 0; // 5fd542: lea edx, [esp]
        R.push(0x46e); // 5fd546: push 0x46e
        R.push((R.ecx >>> 0)); // 5fd54b: push ecx
        R.push((R.edx >>> 0)); // 5fd54c: push edx
        pc = 7; continue;
      case 7: // 5fd54d
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 5fd54d: call 0x90d130
        R.push((R.eax >>> 0)); // 5fd552: push eax
        R.push(0x9870e8); // 5fd553: push 0x9870e8
        R.push(0xae24d0); // 5fd558: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 5fd55d: call 0x944c9f
        R.push(0x0); // 5fd562: push 0
        R.push(0xae24d0); // 5fd564: push 0xae24d0
        R.push(0x9870e0); // 5fd569: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 5fd56e: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 5fd573: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 5fd576: mov dword ptr [0xb67a34], 0
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 5fd580: xor eax, eax
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 5fd582: add esp, 0x200
        R.rv = R.ret(1); return -1; // 5fd588: ret 4
      default: return pc;
    }
  }
}
export function f_5fd480(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 8) throw new Error(`f_5fd480: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_5fd480_0(R, pc); break;
      case 1: np = f_5fd480_1(R, pc); break;
      default: throw new Error(`f_5fd480: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_5fd480: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_5fd480.shared = true;
