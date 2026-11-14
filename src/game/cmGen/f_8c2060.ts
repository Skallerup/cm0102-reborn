// 0x8c2060 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 5e8290=9, 68d1b0=0t, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x8c2060, 0x8c2075, 0x8c20a5, 0x8c20e3, 0x8c20e8, 0x8c211a, 0x8c2123, 0x8c2138, 0x8c2140, 0x8c2144, 0x8c2148, 0x8c214f, 0x8c2151, 0x8c215d, 0x8c2162, 0x8c2173]);
const CH = new Uint8Array([0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2]);
function f_8c2060_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 8c2060
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 8c2060: mov eax, dword ptr [esp + 4]
        R.esp = (R.sub((R.esp >>> 0), 0x200, 32)) | 0; // 8c2064: sub esp, 0x200
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c206a: test eax, eax
        R.push((R.esi >>> 0)); // 8c206c: push esi
        R.push((R.edi >>> 0)); // 8c206d: push edi
        R.edi = (0x1) | 0; // 8c206e: mov edi, 1
        if (!R.cL) { pc = 3; continue; } // 8c2073: jge 0x8c20e3
        pc = 1; continue;
      case 1: // 8c2075
        R.eax = (((R.esp + 0x8) | 0)) | 0; // 8c2075: lea eax, [esp + 8]
        R.ecx = (((R.esp + 0x108) | 0)) | 0; // 8c2079: lea ecx, [esp + 0x108]
        R.push((R.eax >>> 0)); // 8c2080: push eax
        R.push((R.ecx >>> 0)); // 8c2081: push ecx
        R.push(0x0); // 8c2082: push 0
        R.push(0x0); // 8c2084: push 0
        R.push(0xa8d514); // 8c2086: push 0xa8d514
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 8c208b: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8c2090: add esp, 0x14
        R.edx = (((R.esp + 0x8) | 0)) | 0; // 8c2093: lea edx, [esp + 8]
        R.eax = (((R.esp + 0x108) | 0)) | 0; // 8c2097: lea eax, [esp + 0x108]
        R.push(0xdc3); // 8c209e: push 0xdc3
        R.push((R.edx >>> 0)); // 8c20a3: push edx
        R.push((R.eax >>> 0)); // 8c20a4: push eax
        pc = 2; continue;
      case 2: // 8c20a5
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 8c20a5: call 0x90d130
        R.push((R.eax >>> 0)); // 8c20aa: push eax
        R.push(0x9870e8); // 8c20ab: push 0x9870e8
        R.push(0xae24d0); // 8c20b0: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 8c20b5: call 0x944c9f
        R.push(0x0); // 8c20ba: push 0
        R.push(0xae24d0); // 8c20bc: push 0xae24d0
        R.push(0x9870e0); // 8c20c1: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 8c20c6: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 8c20cb: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 8c20ce: mov dword ptr [0xb67a34], 0
        R.edi = (R.pop()) | 0; // 8c20d8: pop edi
        R.esi = (R.pop()) | 0; // 8c20d9: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 8c20da: add esp, 0x200
        R.rv = R.ret(2); return -1; // 8c20e0: ret 8
      case 3: // 8c20e3
        R.sub((R.eax >>> 0), R.m.u32(((R.ecx + 0x4) | 0) >>> 0), 32); // 8c20e3: cmp eax, dword ptr [ecx + 4]
        if (R.cL) { pc = 5; continue; } // 8c20e6: jl 0x8c211a
        pc = 4; continue;
      default: return pc;
    }
  }
}
function f_8c2060_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 4: // 8c20e8
        R.ecx = (((R.esp + 0x108) | 0)) | 0; // 8c20e8: lea ecx, [esp + 0x108]
        R.edx = (((R.esp + 0x8) | 0)) | 0; // 8c20ef: lea edx, [esp + 8]
        R.push((R.ecx >>> 0)); // 8c20f3: push ecx
        R.push((R.edx >>> 0)); // 8c20f4: push edx
        R.push(0x0); // 8c20f5: push 0
        R.push(0x0); // 8c20f7: push 0
        R.push(0xa8d514); // 8c20f9: push 0xa8d514
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 8c20fe: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8c2103: add esp, 0x14
        R.eax = (((R.esp + 0x108) | 0)) | 0; // 8c2106: lea eax, [esp + 0x108]
        R.ecx = (((R.esp + 0x8) | 0)) | 0; // 8c210d: lea ecx, [esp + 8]
        R.push(0xdc8); // 8c2111: push 0xdc8
        R.push((R.eax >>> 0)); // 8c2116: push eax
        R.push((R.ecx >>> 0)); // 8c2117: push ecx
        pc = 2; continue; // 8c2118: jmp 0x8c20a5
      case 5: // 8c211a
        R.edx = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 8c211a: mov edx, dword ptr [ecx]
        R.esi = (R.m.u32(((R.edx + R.eax * 4) | 0) >>> 0)) | 0; // 8c211c: mov esi, dword ptr [edx + eax*4]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8c211f: test esi, esi
        if (R.zf) { pc = 15; continue; } // 8c2121: je 0x8c2173
        pc = 6; continue;
      case 6: // 8c2123
        R.eax = (R.m.u32(((R.esi + 0x4) | 0) >>> 0)) | 0; // 8c2123: mov eax, dword ptr [esi + 4]
        R.ecx = (R.m.u32(((R.eax + 0x2) | 0) >>> 0)) | 0; // 8c2126: mov ecx, dword ptr [eax + 2]
        R.m.w32(((R.eax + 0xa) | 0) >>> 0, (R.ecx >>> 0)); // 8c2129: mov dword ptr [eax + 0xa], ecx
        R.ecx = (R.m.u32(((R.esi + 0x4) | 0) >>> 0)) | 0; // 8c212c: mov ecx, dword ptr [esi + 4]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8c212f: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c2134: test eax, eax
        if (R.zf) { pc = 14; continue; } // 8c2136: je 0x8c2162
        pc = 7; continue;
      case 7: // 8c2138
        R.push((R.ebp >>> 0)); // 8c2138: push ebp
        R.ebp = (R.m.u32(((R.esp + 0x214) | 0) >>> 0)) | 0; // 8c2139: mov ebp, dword ptr [esp + 0x214]
        pc = 8; continue;
      case 8: // 8c2140
        R.sub(R.m.u32(((R.eax) | 0) >>> 0), (R.ebp >>> 0), 32); // 8c2140: cmp dword ptr [eax], ebp
        if (!R.zf) { pc = 10; continue; } // 8c2142: jne 0x8c2148
        pc = 9; continue;
      case 9: // 8c2144
        R.m.w8(((R.eax + 0x4) | 0) >>> 0, 0x1); // 8c2144: mov byte ptr [eax + 4], 1
        pc = 10; continue;
      case 10: // 8c2148
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + 0x4) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8c2148: mov cl, byte ptr [eax + 4]
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 8c214b: test cl, cl
        if (R.zf) { pc = 12; continue; } // 8c214d: je 0x8c2151
        pc = 11; continue;
      case 11: // 8c214f
        R.edi = (R.logic((R.edi >>> 0) ^ (R.edi >>> 0), 32)) | 0; // 8c214f: xor edi, edi
        pc = 12; continue;
      case 12: // 8c2151
        R.ecx = (R.m.u32(((R.esi + 0x4) | 0) >>> 0)) | 0; // 8c2151: mov ecx, dword ptr [esi + 4]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8c2154: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c2159: test eax, eax
        if (!R.zf) { pc = 8; continue; } // 8c215b: jne 0x8c2140
        pc = 13; continue;
      default: return pc;
    }
  }
}
function f_8c2060_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 13: // 8c215d
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 8c215d: test edi, edi
        R.ebp = (R.pop()) | 0; // 8c215f: pop ebp
        if (R.zf) { pc = 15; continue; } // 8c2160: je 0x8c2173
        pc = 14; continue;
      case 14: // 8c2162
        R.sub(R.m.u8(((R.esi + 0x2c) | 0) >>> 0), 0x7, 8); // 8c2162: cmp byte ptr [esi + 0x2c], 7
        R.edx = ((R.edx & 0xffffff00) | (((!R.zf ? 1 : 0) & 0xff) << 0)) | 0; // 8c2166: setne dl
        R.edx = (R.incdec((R.edx >>> 0), -1, 32)) | 0; // 8c2169: dec edx
        R.edx = (R.logic((R.edx >>> 0) & 0x2, 32)) | 0; // 8c216a: and edx, 2
        R.edx = (R.add((R.edx >>> 0), 0x6, 32)) | 0; // 8c216d: add edx, 6
        R.m.w8(((R.esi + 0x2c) | 0) >>> 0, ((R.edx >>> 0) & 0xff)); // 8c2170: mov byte ptr [esi + 0x2c], dl
        pc = 15; continue;
      case 15: // 8c2173
        R.edi = (R.pop()) | 0; // 8c2173: pop edi
        R.esi = (R.pop()) | 0; // 8c2174: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 8c2175: add esp, 0x200
        R.rv = R.ret(2); return -1; // 8c217b: ret 8
      default: return pc;
    }
  }
}
export function f_8c2060(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 16) throw new Error(`f_8c2060: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_8c2060_0(R, pc); break;
      case 1: np = f_8c2060_1(R, pc); break;
      case 2: np = f_8c2060_2(R, pc); break;
      default: throw new Error(`f_8c2060: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_8c2060: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_8c2060.shared = true;
