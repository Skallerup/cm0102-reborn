// 0x5b02f0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4cf5a0=1c, 540a50=3
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x5b02f0, 0x5b0300, 0x5b030b, 0x5b0317, 0x5b031e, 0x5b0328, 0x5b032f, 0x5b0336, 0x5b033b, 0x5b0350, 0x5b0368, 0x5b036a, 0x5b0374, 0x5b037b, 0x5b0382, 0x5b038b, 0x5b0392, 0x5b0399, 0x5b039d, 0x5b03b5, 0x5b03bc, 0x5b03cb]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2]);
function f_5b02f0_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 5b02f0
        R.push((R.esi >>> 0)); // 5b02f0: push esi
        R.esi = (R.m.u32(((R.esp + 0x8) | 0) >>> 0)) | 0; // 5b02f1: mov esi, dword ptr [esp + 8]
        R.push((R.edi >>> 0)); // 5b02f5: push edi
        R.edi = ((R.ecx >>> 0)) | 0; // 5b02f6: mov edi, ecx
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 5b02f8: test esi, esi
        if (R.zf) { pc = 21; continue; } // 5b02fa: je 0x5b03cb
        pc = 1; continue;
      case 1: // 5b0300
        R.eax = (R.m.u32(((R.edi + 0x4) | 0) >>> 0)) | 0; // 5b0300: mov eax, dword ptr [edi + 4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5b0303: test eax, eax
        if (R.zf) { pc = 21; continue; } // 5b0305: je 0x5b03cb
        pc = 2; continue;
      case 2: // 5b030b
        R.ecx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 5b030b: mov ecx, dword ptr [esi]
        R.edx = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 5b030d: mov edx, dword ptr [0xae2364]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 5b0313: cmp ecx, edx
        if (R.cL) { pc = 4; continue; } // 5b0315: jl 0x5b031e
        pc = 3; continue;
      case 3: // 5b0317
        R.edi = (R.pop()) | 0; // 5b0317: pop edi
        R.eax = ((R.eax & 0xffffff00) | (((0x3) & 0xff) << 0)) | 0; // 5b0318: mov al, 3
        R.esi = (R.pop()) | 0; // 5b031a: pop esi
        R.rv = R.ret(1); return -1; // 5b031b: ret 4
      case 4: // 5b031e
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((0x9cc270) | 0) >>> 0)) & 0xff) << 0)) | 0; // 5b031e: mov cl, byte ptr [0x9cc270]
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 5b0324: test cl, cl
        if (!R.zf) { pc = 6; continue; } // 5b0326: jne 0x5b032f
        pc = 5; continue;
      case 5: // 5b0328
        R.edi = (R.pop()) | 0; // 5b0328: pop edi
        R.eax = ((R.eax & 0xffffff00) | (((0x3) & 0xff) << 0)) | 0; // 5b0329: mov al, 3
        R.esi = (R.pop()) | 0; // 5b032b: pop esi
        R.rv = R.ret(1); return -1; // 5b032c: ret 4
      case 6: // 5b032f
        R.ecx = (R.m.u32(((R.eax + 0x39) | 0) >>> 0)) | 0; // 5b032f: mov ecx, dword ptr [eax + 0x39]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 5b0332: test ecx, ecx
        if (R.zf) { pc = 13; continue; } // 5b0334: je 0x5b037b
        pc = 7; continue;
      case 7: // 5b0336
        R.sub(R.m.u32(((R.esi + 0x39) | 0) >>> 0), (R.ecx >>> 0), 32); // 5b0336: cmp dword ptr [esi + 0x39], ecx
        if (R.zf) { pc = 12; continue; } // 5b0339: je 0x5b0374
        pc = 8; continue;
      case 8: // 5b033b
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 5b033b: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 5b0341: push esi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 5b0342: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5b0347: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 5b0349: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 10; continue; } // 5b034e: je 0x5b0368
        pc = 9; continue;
      case 9: // 5b0350
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 5b0350: mov eax, dword ptr [eax + 4]
        R.ecx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 5b0353: mov ecx, dword ptr [0xae23b4]
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 5b0359: lea edx, [eax + eax*8]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 5b035c: shl edx, 4
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 5b035f: add edx, eax
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 5b0361: add ecx, eax
        R.edx = (((R.ecx + R.edx * 4) | 0)) | 0; // 5b0363: lea edx, [ecx + edx*4]
        pc = 11; continue; // 5b0366: jmp 0x5b036a
      default: return pc;
    }
  }
}
function f_5b02f0_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 10: // 5b0368
        R.edx = (R.logic((R.edx >>> 0) ^ (R.edx >>> 0), 32)) | 0; // 5b0368: xor edx, edx
        pc = 11; continue;
      case 11: // 5b036a
        R.eax = (R.m.u32(((R.edi + 0x4) | 0) >>> 0)) | 0; // 5b036a: mov eax, dword ptr [edi + 4]
        R.ecx = (R.m.u32(((R.eax + 0x39) | 0) >>> 0)) | 0; // 5b036d: mov ecx, dword ptr [eax + 0x39]
        R.sub((R.edx >>> 0), (R.ecx >>> 0), 32); // 5b0370: cmp edx, ecx
        if (!R.zf) { pc = 13; continue; } // 5b0372: jne 0x5b037b
        pc = 12; continue;
      case 12: // 5b0374
        R.edi = (R.pop()) | 0; // 5b0374: pop edi
        R.eax = ((R.eax & 0xffffff00) | (((0x3) & 0xff) << 0)) | 0; // 5b0375: mov al, 3
        R.esi = (R.pop()) | 0; // 5b0377: pop esi
        R.rv = R.ret(1); return -1; // 5b0378: ret 4
      case 13: // 5b037b
        R.edx = (R.m.u32(((R.esi + 0x24) | 0) >>> 0)) | 0; // 5b037b: mov edx, dword ptr [esi + 0x24]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 5b037e: test edx, edx
        if (R.zf) { pc = 16; continue; } // 5b0380: je 0x5b0392
        pc = 14; continue;
      case 14: // 5b0382
        R.push((R.ebx >>> 0)); // 5b0382: push ebx
        R.ebx = (R.m.u32(((R.eax + 0x24) | 0) >>> 0)) | 0; // 5b0383: mov ebx, dword ptr [eax + 0x24]
        R.sub((R.edx >>> 0), (R.ebx >>> 0), 32); // 5b0386: cmp edx, ebx
        R.ebx = (R.pop()) | 0; // 5b0388: pop ebx
        if (!R.zf) { pc = 16; continue; } // 5b0389: jne 0x5b0392
        pc = 15; continue;
      case 15: // 5b038b
        R.edi = (R.pop()) | 0; // 5b038b: pop edi
        R.eax = ((R.eax & 0xffffff00) | (((0x3) & 0xff) << 0)) | 0; // 5b038c: mov al, 3
        R.esi = (R.pop()) | 0; // 5b038e: pop esi
        R.rv = R.ret(1); return -1; // 5b038f: ret 4
      case 16: // 5b0392
        R.eax = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 5b0392: mov eax, dword ptr [esi + 0x39]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5b0395: test eax, eax
        if (R.zf) { pc = 20; continue; } // 5b0397: je 0x5b03bc
        pc = 17; continue;
      case 17: // 5b0399
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 5b0399: test ecx, ecx
        if (R.zf) { pc = 20; continue; } // 5b039b: je 0x5b03bc
        pc = 18; continue;
      case 18: // 5b039d
        R.edx = (((R.esp + 0xc) | 0)) | 0; // 5b039d: lea edx, [esp + 0xc]
        R.push(0x1); // 5b03a1: push 1
        R.push((R.edx >>> 0)); // 5b03a3: push edx
        R.push((R.eax >>> 0)); // 5b03a4: push eax
        R.call(0x540a50, { n: 3, thisEcx: false, calleeClean: false }); // 5b03a5: call 0x540a50
        R.ecx = (R.m.u32(((R.edi + 0x4) | 0) >>> 0)) | 0; // 5b03aa: mov ecx, dword ptr [edi + 4]
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 5b03ad: add esp, 0xc
        R.sub((R.eax >>> 0), R.m.u32(((R.ecx + 0x39) | 0) >>> 0), 32); // 5b03b0: cmp eax, dword ptr [ecx + 0x39]
        if (!R.zf) { pc = 20; continue; } // 5b03b3: jne 0x5b03bc
        pc = 19; continue;
      case 19: // 5b03b5
        R.edi = (R.pop()) | 0; // 5b03b5: pop edi
        R.eax = ((R.eax & 0xffffff00) | (((0x3) & 0xff) << 0)) | 0; // 5b03b6: mov al, 3
        R.esi = (R.pop()) | 0; // 5b03b8: pop esi
        R.rv = R.ret(1); return -1; // 5b03b9: ret 4
      default: return pc;
    }
  }
}
function f_5b02f0_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 20: // 5b03bc
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 5b03bc: mov eax, dword ptr [esi]
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 5b03be: lea edx, [eax + eax*8]
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 5b03c1: mov eax, dword ptr [edi]
        R.edi = (R.pop()) | 0; // 5b03c3: pop edi
        R.esi = (R.pop()) | 0; // 5b03c4: pop esi
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edx + R.eax) | 0) >>> 0)) & 0xff) << 0)) | 0; // 5b03c5: mov al, byte ptr [edx + eax]
        R.rv = R.ret(1); return -1; // 5b03c8: ret 4
      case 21: // 5b03cb
        R.edi = (R.pop()) | 0; // 5b03cb: pop edi
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 5b03cc: xor al, al
        R.esi = (R.pop()) | 0; // 5b03ce: pop esi
        R.rv = R.ret(1); return -1; // 5b03cf: ret 4
      default: return pc;
    }
  }
}
export function f_5b02f0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 22) throw new Error(`f_5b02f0: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_5b02f0_0(R, pc); break;
      case 1: np = f_5b02f0_1(R, pc); break;
      case 2: np = f_5b02f0_2(R, pc); break;
      default: throw new Error(`f_5b02f0: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_5b02f0: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_5b02f0.shared = true;
