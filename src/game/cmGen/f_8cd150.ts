// 0x8cd150 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 68d020=0t, 68d040=7t, 68d1b0=0t, 8c5cf0=3tc, 8cde70=2tc
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x8cd150, 0x8cd18f, 0x8cd1b3, 0x8cd1bc, 0x8cd1c3, 0x8cd1c5, 0x8cd1ce, 0x8cd1d2, 0x8cd1d6, 0x8cd1da, 0x8cd1e7, 0x8cd20d]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1]);
function f_8cd150_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 8cd150
        R.push(0xffffffff); // 8cd150: push -1
        R.push(0x963ed8); // 8cd152: push 0x963ed8
        R.eax = (0) | 0; // 8cd157: mov eax, dword ptr fs:[0]
        R.push((R.eax >>> 0)); // 8cd15d: push eax
        /* fs */ // 8cd15e: mov dword ptr fs:[0], esp
        R.esp = (R.sub((R.esp >>> 0), 0x10, 32)) | 0; // 8cd165: sub esp, 0x10
        R.push((R.esi >>> 0)); // 8cd168: push esi
        R.esi = ((R.ecx >>> 0)) | 0; // 8cd169: mov esi, ecx
        R.push((R.edi >>> 0)); // 8cd16b: push edi
        R.ecx = (((R.esp + 0x8) | 0)) | 0; // 8cd16c: lea ecx, [esp + 8]
        R.call(0x68d020, { n: 0, thisEcx: true, calleeClean: false }); // 8cd170: call 0x68d020
        R.edi = (R.m.u32(((R.esp + 0x28) | 0) >>> 0)) | 0; // 8cd175: mov edi, dword ptr [esp + 0x28]
        R.push(0x0); // 8cd179: push 0
        R.push((R.edi >>> 0)); // 8cd17b: push edi
        R.ecx = ((R.esi >>> 0)) | 0; // 8cd17c: mov ecx, esi
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0x0); // 8cd17e: mov dword ptr [esp + 0x28], 0
        R.call(0x8cde70, { n: 2, thisEcx: true, calleeClean: true }); // 8cd186: call 0x8cde70
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cd18b: test eax, eax
        if (R.zf) { pc = 10; continue; } // 8cd18d: je 0x8cd1e7
        pc = 1; continue;
      case 1: // 8cd18f
        R.eax = (((R.esp + 0x8) | 0)) | 0; // 8cd18f: lea eax, [esp + 8]
        R.push(0x0); // 8cd193: push 0
        R.push((R.eax >>> 0)); // 8cd195: push eax
        R.push((R.edi >>> 0)); // 8cd196: push edi
        R.ecx = ((R.esi >>> 0)) | 0; // 8cd197: mov ecx, esi
        R.call(0x8c5cf0, { n: 3, thisEcx: true, calleeClean: true }); // 8cd199: call 0x8c5cf0
        R.ecx = (R.m.u32(((R.esp + 0xa) | 0) >>> 0)) | 0; // 8cd19e: mov ecx, dword ptr [esp + 0xa]
        R.m.w32(((R.esp + 0x12) | 0) >>> 0, (R.ecx >>> 0)); // 8cd1a2: mov dword ptr [esp + 0x12], ecx
        R.ecx = (((R.esp + 0x8) | 0)) | 0; // 8cd1a6: lea ecx, [esp + 8]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8cd1aa: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cd1af: test eax, eax
        if (R.zf) { pc = 10; continue; } // 8cd1b1: je 0x8cd1e7
        pc = 2; continue;
      case 2: // 8cd1b3
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8cd1b3: mov eax, dword ptr [eax]
        R.ecx = (R.m.u32(((R.esi + 0x4) | 0) >>> 0)) | 0; // 8cd1b5: mov ecx, dword ptr [esi + 4]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 8cd1b8: cmp eax, ecx
        if (!R.cL) { pc = 4; continue; } // 8cd1ba: jge 0x8cd1c3
        pc = 3; continue;
      case 3: // 8cd1bc
        R.edx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8cd1bc: mov edx, dword ptr [esi]
        R.eax = (((R.edx + R.eax * 4) | 0)) | 0; // 8cd1be: lea eax, [edx + eax*4]
        pc = 5; continue; // 8cd1c1: jmp 0x8cd1c5
      case 4: // 8cd1c3
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8cd1c3: mov eax, dword ptr [esi]
        pc = 5; continue;
      case 5: // 8cd1c5
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8cd1c5: mov eax, dword ptr [eax]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x2c) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8cd1c7: mov al, byte ptr [eax + 0x2c]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 8cd1ca: test al, al
        if (R.zf) { pc = 11; continue; } // 8cd1cc: je 0x8cd20d
        pc = 6; continue;
      case 6: // 8cd1ce
        R.sub(((R.eax >>> 0) & 0xff), 0x1, 8); // 8cd1ce: cmp al, 1
        if (R.zf) { pc = 11; continue; } // 8cd1d0: je 0x8cd20d
        pc = 7; continue;
      default: return pc;
    }
  }
}
function f_8cd150_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 7: // 8cd1d2
        R.sub(((R.eax >>> 0) & 0xff), 0x5, 8); // 8cd1d2: cmp al, 5
        if (R.zf) { pc = 11; continue; } // 8cd1d4: je 0x8cd20d
        pc = 8; continue;
      case 8: // 8cd1d6
        R.sub(((R.eax >>> 0) & 0xff), 0x6, 8); // 8cd1d6: cmp al, 6
        if (R.zf) { pc = 11; continue; } // 8cd1d8: je 0x8cd20d
        pc = 9; continue;
      case 9: // 8cd1da
        R.ecx = (((R.esp + 0x8) | 0)) | 0; // 8cd1da: lea ecx, [esp + 8]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8cd1de: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cd1e3: test eax, eax
        if (!R.zf) { pc = 2; continue; } // 8cd1e5: jne 0x8cd1b3
        pc = 10; continue;
      case 10: // 8cd1e7
        R.ecx = (((R.esp + 0x8) | 0)) | 0; // 8cd1e7: lea ecx, [esp + 8]
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, 0xffffffff); // 8cd1eb: mov dword ptr [esp + 0x20], 0xffffffff
        R.call(0x68d040, { n: 7, thisEcx: true, calleeClean: false }); // 8cd1f3: call 0x68d040
        R.edi = (R.pop()) | 0; // 8cd1f8: pop edi
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8cd1f9: xor eax, eax
        R.esi = (R.pop()) | 0; // 8cd1fb: pop esi
        R.ecx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 8cd1fc: mov ecx, dword ptr [esp + 0x10]
        /* fs */ // 8cd200: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x1c, 32)) | 0; // 8cd207: add esp, 0x1c
        R.rv = R.ret(1); return -1; // 8cd20a: ret 4
      case 11: // 8cd20d
        R.ecx = (((R.esp + 0x8) | 0)) | 0; // 8cd20d: lea ecx, [esp + 8]
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, 0xffffffff); // 8cd211: mov dword ptr [esp + 0x20], 0xffffffff
        R.call(0x68d040, { n: 7, thisEcx: true, calleeClean: false }); // 8cd219: call 0x68d040
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 8cd21e: mov ecx, dword ptr [esp + 0x18]
        R.edi = (R.pop()) | 0; // 8cd222: pop edi
        R.eax = (0x1) | 0; // 8cd223: mov eax, 1
        R.esi = (R.pop()) | 0; // 8cd228: pop esi
        /* fs */ // 8cd229: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x1c, 32)) | 0; // 8cd230: add esp, 0x1c
        R.rv = R.ret(1); return -1; // 8cd233: ret 4
      default: return pc;
    }
  }
}
export function f_8cd150(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 12) throw new Error(`f_8cd150: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_8cd150_0(R, pc); break;
      case 1: np = f_8cd150_1(R, pc); break;
      default: throw new Error(`f_8cd150: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_8cd150: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_8cd150.shared = true;
