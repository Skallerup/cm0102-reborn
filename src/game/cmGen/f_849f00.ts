// 0x849f00 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4cf5a0=1c, 4cf5f0=2tc, 53b620=1, 540a50=3, 600a50=5, 849ce0=4tc, 849d60=2c
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x849f00, 0x849f0d, 0x849f15, 0x849f37, 0x849f3e, 0x849f53, 0x849f5b, 0x849f60, 0x849f75, 0x849f8d, 0x849f8f, 0x849f93, 0x849fa4, 0x849fb0, 0x849fc5, 0x849fd5, 0x849fe4, 0x849fe9, 0x849ffd, 0x84a005, 0x84a00d, 0x84a011]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2]);
function f_849f00_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 849f00
        R.push((R.ebx >>> 0)); // 849f00: push ebx
        R.push((R.esi >>> 0)); // 849f01: push esi
        R.push((R.edi >>> 0)); // 849f02: push edi
        R.edi = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 849f03: mov edi, dword ptr [esp + 0x14]
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 849f07: test edi, edi
        R.ebx = ((R.ecx >>> 0)) | 0; // 849f09: mov ebx, ecx
        if (!R.zf) { pc = 2; continue; } // 849f0b: jne 0x849f15
        pc = 1; continue;
      case 1: // 849f0d
        R.edi = (R.pop()) | 0; // 849f0d: pop edi
        R.esi = (R.pop()) | 0; // 849f0e: pop esi
        R.eax = ((R.eax & 0xffffff00) | (((0x7) & 0xff) << 0)) | 0; // 849f0f: mov al, 7
        R.ebx = (R.pop()) | 0; // 849f11: pop ebx
        R.rv = R.ret(3); return -1; // 849f12: ret 0xc
      case 2: // 849f15
        R.esi = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 849f15: mov esi, dword ptr [esp + 0x10]
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 849f19: xor eax, eax
        R.push(0x0); // 849f1b: push 0
        R.ecx = ((R.ebx >>> 0)) | 0; // 849f1d: mov ecx, ebx
        R.edx = (R.m.u32(((R.esi + 0x61) | 0) >>> 0)) | 0; // 849f1f: mov edx, dword ptr [esi + 0x61]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 849f22: test edx, edx
        R.eax = ((R.eax & 0xffffff00) | (((R.zf ? 1 : 0) & 0xff) << 0)) | 0; // 849f24: sete al
        R.push((R.eax >>> 0)); // 849f27: push eax
        R.push((R.esi >>> 0)); // 849f28: push esi
        R.push((R.edi >>> 0)); // 849f29: push edi
        R.call(0x849ce0, { n: 4, thisEcx: true, calleeClean: true }); // 849f2a: call 0x849ce0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 849f2f: test eax, eax
        if (!R.zf) { pc = 19; continue; } // 849f31: jne 0x84a005
        pc = 3; continue;
      case 3: // 849f37
        R.eax = (R.m.u32(((R.esi + 0x69) | 0) >>> 0)) | 0; // 849f37: mov eax, dword ptr [esi + 0x69]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 849f3a: test eax, eax
        if (R.zf) { pc = 5; continue; } // 849f3c: je 0x849f53
        pc = 4; continue;
      case 4: // 849f3e
        R.push(0x0); // 849f3e: push 0
        R.push(0x1); // 849f40: push 1
        R.push((R.esi >>> 0)); // 849f42: push esi
        R.push((R.edi >>> 0)); // 849f43: push edi
        R.ecx = ((R.ebx >>> 0)) | 0; // 849f44: mov ecx, ebx
        R.call(0x849ce0, { n: 4, thisEcx: true, calleeClean: true }); // 849f46: call 0x849ce0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 849f4b: test eax, eax
        if (!R.zf) { pc = 19; continue; } // 849f4d: jne 0x84a005
        pc = 5; continue;
      case 5: // 849f53
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 849f53: mov eax, dword ptr [esp + 0x18]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 849f57: test eax, eax
        if (R.zf) { pc = 7; continue; } // 849f59: je 0x849f60
        pc = 6; continue;
      case 6: // 849f5b
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esi + 0x3d) | 0) >>> 0)) & 0xff) << 0)) | 0; // 849f5b: mov cl, byte ptr [esi + 0x3d]
        R.m.w8(((R.eax) | 0) >>> 0, ((R.ecx >>> 0) & 0xff)); // 849f5e: mov byte ptr [eax], cl
        pc = 7; continue;
      default: return pc;
    }
  }
}
function f_849f00_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 7: // 849f60
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 849f60: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 849f66: push esi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 849f67: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 849f6c: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 849f6e: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 9; continue; } // 849f73: je 0x849f8d
        pc = 8; continue;
      case 8: // 849f75
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 849f75: mov eax, dword ptr [eax + 4]
        R.ecx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 849f78: mov ecx, dword ptr [0xae23b4]
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 849f7e: lea edx, [eax + eax*8]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 849f81: shl edx, 4
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 849f84: add edx, eax
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 849f86: add ecx, eax
        R.eax = (((R.ecx + R.edx * 4) | 0)) | 0; // 849f88: lea eax, [ecx + edx*4]
        pc = 10; continue; // 849f8b: jmp 0x849f8f
      case 9: // 849f8d
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 849f8d: xor eax, eax
        pc = 10; continue;
      case 10: // 849f8f
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 849f8f: cmp eax, edi
        if (!R.zf) { pc = 13; continue; } // 849f91: jne 0x849fb0
        pc = 11; continue;
      case 11: // 849f93
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 849f93: mov ecx, dword ptr [0xae1050]
        R.push((R.edi >>> 0)); // 849f99: push edi
        R.push((R.esi >>> 0)); // 849f9a: push esi
        R.call(0x4cf5f0, { n: 2, thisEcx: true, calleeClean: true }); // 849f9b: call 0x4cf5f0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 849fa0: test eax, eax
        if (R.zf) { pc = 18; continue; } // 849fa2: je 0x849ffd
        pc = 12; continue;
      case 12: // 849fa4
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 849fa4: mov al, byte ptr [eax + 0x4f]
        R.edi = (R.pop()) | 0; // 849fa7: pop edi
        R.esi = (R.pop()) | 0; // 849fa8: pop esi
        R.ebx = (R.pop()) | 0; // 849fa9: pop ebx
        R.eax = ((R.eax & 0xffffff00) | (((R.shr(((R.eax >>> 0) & 0xff), 0x4, 8)) & 0xff) << 0)) | 0; // 849faa: shr al, 4
        R.rv = R.ret(3); return -1; // 849fad: ret 0xc
      case 13: // 849fb0
        R.push(0x0); // 849fb0: push 0
        R.push(0x0); // 849fb2: push 0
        R.push(0x1); // 849fb4: push 1
        R.push(0x1); // 849fb6: push 1
        R.push((R.edi >>> 0)); // 849fb8: push edi
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 849fb9: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 849fbe: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 849fc1: test eax, eax
        if (R.zf) { pc = 16; continue; } // 849fc3: je 0x849fe4
        pc = 14; continue;
      case 14: // 849fc5
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.esi + 0x3d) | 0) >>> 0)) & 0xff) << 0)) | 0; // 849fc5: mov dl, byte ptr [esi + 0x3d]
        R.push((R.edx >>> 0)); // 849fc8: push edx
        R.call(0x53b620, { n: 1, thisEcx: false, calleeClean: false }); // 849fc9: call 0x53b620
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 849fce: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 849fd1: test eax, eax
        if (R.zf) { pc = 16; continue; } // 849fd3: je 0x849fe4
        pc = 15; continue;
      default: return pc;
    }
  }
}
function f_849f00_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 15: // 849fd5
        R.push((R.edi >>> 0)); // 849fd5: push edi
        R.push((R.esi >>> 0)); // 849fd6: push esi
        R.ecx = ((R.ebx >>> 0)) | 0; // 849fd7: mov ecx, ebx
        R.call(0x849d60, { n: 2, thisEcx: false, calleeClean: true }); // 849fd9: call 0x849d60
        R.edi = (R.pop()) | 0; // 849fde: pop edi
        R.esi = (R.pop()) | 0; // 849fdf: pop esi
        R.ebx = (R.pop()) | 0; // 849fe0: pop ebx
        R.rv = R.ret(3); return -1; // 849fe1: ret 0xc
      case 16: // 849fe4
        R.sub(R.m.u32(((R.esi + 0x39) | 0) >>> 0), (R.edi >>> 0), 32); // 849fe4: cmp dword ptr [esi + 0x39], edi
        if (R.zf) { pc = 11; continue; } // 849fe7: je 0x849f93
        pc = 17; continue;
      case 17: // 849fe9
        R.push(0x1); // 849fe9: push 1
        R.push(0x0); // 849feb: push 0
        R.push((R.edi >>> 0)); // 849fed: push edi
        R.call(0x540a50, { n: 3, thisEcx: false, calleeClean: false }); // 849fee: call 0x540a50
        R.ecx = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 849ff3: mov ecx, dword ptr [esi + 0x39]
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 849ff6: add esp, 0xc
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 849ff9: cmp ecx, eax
        if (R.zf) { pc = 11; continue; } // 849ffb: je 0x849f93
        pc = 18; continue;
      case 18: // 849ffd
        R.edi = (R.pop()) | 0; // 849ffd: pop edi
        R.esi = (R.pop()) | 0; // 849ffe: pop esi
        R.eax = ((R.eax & 0xffffff00) | (((0x7) & 0xff) << 0)) | 0; // 849fff: mov al, 7
        R.ebx = (R.pop()) | 0; // 84a001: pop ebx
        R.rv = R.ret(3); return -1; // 84a002: ret 0xc
      case 19: // 84a005
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 84a005: mov ecx, dword ptr [esp + 0x18]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 84a009: test ecx, ecx
        if (R.zf) { pc = 21; continue; } // 84a00b: je 0x84a011
        pc = 20; continue;
      case 20: // 84a00d
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84a00d: mov dl, byte ptr [eax]
        R.m.w8(((R.ecx) | 0) >>> 0, ((R.edx >>> 0) & 0xff)); // 84a00f: mov byte ptr [ecx], dl
        pc = 21; continue;
      case 21: // 84a011
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84a011: mov al, byte ptr [eax + 0x24]
        R.edi = (R.pop()) | 0; // 84a014: pop edi
        R.eax = ((R.eax & 0xffffff00) | (((R.shr(((R.eax >>> 0) & 0xff), 0x1, 8)) & 0xff) << 0)) | 0; // 84a015: shr al, 1
        R.esi = (R.pop()) | 0; // 84a017: pop esi
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf, 8)) & 0xff) << 0)) | 0; // 84a018: and al, 0xf
        R.ebx = (R.pop()) | 0; // 84a01a: pop ebx
        R.rv = R.ret(3); return -1; // 84a01b: ret 0xc
      default: return pc;
    }
  }
}
export function f_849f00(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 22) throw new Error(`f_849f00: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_849f00_0(R, pc); break;
      case 1: np = f_849f00_1(R, pc); break;
      case 2: np = f_849f00_2(R, pc); break;
      default: throw new Error(`f_849f00: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_849f00: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_849f00.shared = true;
