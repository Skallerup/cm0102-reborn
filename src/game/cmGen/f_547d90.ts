// 0x547d90 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x547d90, 0x547d9e, 0x547da9, 0x547db5, 0x547dc1, 0x547dcd, 0x547dd9, 0x547dde, 0x547de8, 0x547ded, 0x547df7, 0x547dfc, 0x547e06, 0x547e0d, 0x547e13, 0x547e1a, 0x547e20, 0x547e27, 0x547e2d, 0x547e35, 0x547e44, 0x547e47, 0x547e4a, 0x547e53, 0x547e5c, 0x547e62]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2]);
function f_547d90_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 547d90
        R.push((R.esi >>> 0)); // 547d90: push esi
        R.push((R.edi >>> 0)); // 547d91: push edi
        R.edi = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 547d92: mov edi, dword ptr [esp + 0xc]
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 547d96: test edi, edi
        if (R.zf) { pc = 25; continue; } // 547d98: je 0x547e62
        pc = 1; continue;
      case 1: // 547d9e
        R.eax = (R.m.u32(((R.edi + 0x65) | 0) >>> 0)) | 0; // 547d9e: mov eax, dword ptr [edi + 0x65]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 547da1: test eax, eax
        if (R.zf) { pc = 25; continue; } // 547da3: je 0x547e62
        pc = 2; continue;
      case 2: // 547da9
        R.esi = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 547da9: mov esi, dword ptr [esp + 0x10]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 547dad: test esi, esi
        if (R.zf) { pc = 25; continue; } // 547daf: je 0x547e62
        pc = 3; continue;
      case 3: // 547db5
        R.sub(R.m.u32(((R.esi + 0x9b) | 0) >>> 0), (R.edi >>> 0), 32); // 547db5: cmp dword ptr [esi + 0x9b], edi
        if (R.zf) { pc = 25; continue; } // 547dbb: je 0x547e62
        pc = 4; continue;
      case 4: // 547dc1
        R.sub(R.m.u32(((R.esi + 0x9f) | 0) >>> 0), (R.edi >>> 0), 32); // 547dc1: cmp dword ptr [esi + 0x9f], edi
        if (R.zf) { pc = 25; continue; } // 547dc7: je 0x547e62
        pc = 5; continue;
      case 5: // 547dcd
        R.sub(R.m.u32(((R.esi + 0xa3) | 0) >>> 0), (R.edi >>> 0), 32); // 547dcd: cmp dword ptr [esi + 0xa3], edi
        if (R.zf) { pc = 25; continue; } // 547dd3: je 0x547e62
        pc = 6; continue;
      case 6: // 547dd9
        R.sub(R.m.u32(((R.eax + 0x10) | 0) >>> 0), (R.esi >>> 0), 32); // 547dd9: cmp dword ptr [eax + 0x10], esi
        if (!R.zf) { pc = 8; continue; } // 547ddc: jne 0x547de8
        pc = 7; continue;
      case 7: // 547dde
        R.edi = (R.pop()) | 0; // 547dde: pop edi
        R.m.w32(((R.eax + 0x10) | 0) >>> 0, 0x0); // 547ddf: mov dword ptr [eax + 0x10], 0
        R.esi = (R.pop()) | 0; // 547de6: pop esi
        R.rv = R.ret(0); return -1; // 547de7: ret 
      case 8: // 547de8
        R.sub(R.m.u32(((R.eax + 0x14) | 0) >>> 0), (R.esi >>> 0), 32); // 547de8: cmp dword ptr [eax + 0x14], esi
        if (!R.zf) { pc = 10; continue; } // 547deb: jne 0x547df7
        pc = 9; continue;
      case 9: // 547ded
        R.edi = (R.pop()) | 0; // 547ded: pop edi
        R.m.w32(((R.eax + 0x14) | 0) >>> 0, 0x0); // 547dee: mov dword ptr [eax + 0x14], 0
        R.esi = (R.pop()) | 0; // 547df5: pop esi
        R.rv = R.ret(0); return -1; // 547df6: ret 
      case 10: // 547df7
        R.sub(R.m.u32(((R.eax + 0x18) | 0) >>> 0), (R.esi >>> 0), 32); // 547df7: cmp dword ptr [eax + 0x18], esi
        if (!R.zf) { pc = 12; continue; } // 547dfa: jne 0x547e06
        pc = 11; continue;
      case 11: // 547dfc
        R.edi = (R.pop()) | 0; // 547dfc: pop edi
        R.m.w32(((R.eax + 0x18) | 0) >>> 0, 0x0); // 547dfd: mov dword ptr [eax + 0x18], 0
        R.esi = (R.pop()) | 0; // 547e04: pop esi
        R.rv = R.ret(0); return -1; // 547e05: ret 
      default: return pc;
    }
  }
}
function f_547d90_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 12: // 547e06
        R.ecx = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 547e06: mov ecx, dword ptr [eax + 4]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 547e09: test ecx, ecx
        if (!R.zf) { pc = 14; continue; } // 547e0b: jne 0x547e13
        pc = 13; continue;
      case 13: // 547e0d
        R.m.w32(((R.eax + 0x4) | 0) >>> 0, (R.esi >>> 0)); // 547e0d: mov dword ptr [eax + 4], esi
        R.edi = (R.pop()) | 0; // 547e10: pop edi
        R.esi = (R.pop()) | 0; // 547e11: pop esi
        R.rv = R.ret(0); return -1; // 547e12: ret 
      case 14: // 547e13
        R.ecx = (R.m.u32(((R.eax + 0x8) | 0) >>> 0)) | 0; // 547e13: mov ecx, dword ptr [eax + 8]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 547e16: test ecx, ecx
        if (!R.zf) { pc = 16; continue; } // 547e18: jne 0x547e20
        pc = 15; continue;
      case 15: // 547e1a
        R.m.w32(((R.eax + 0x8) | 0) >>> 0, (R.esi >>> 0)); // 547e1a: mov dword ptr [eax + 8], esi
        R.edi = (R.pop()) | 0; // 547e1d: pop edi
        R.esi = (R.pop()) | 0; // 547e1e: pop esi
        R.rv = R.ret(0); return -1; // 547e1f: ret 
      case 16: // 547e20
        R.ecx = (R.m.u32(((R.eax + 0xc) | 0) >>> 0)) | 0; // 547e20: mov ecx, dword ptr [eax + 0xc]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 547e23: test ecx, ecx
        if (!R.zf) { pc = 18; continue; } // 547e25: jne 0x547e2d
        pc = 17; continue;
      case 17: // 547e27
        R.m.w32(((R.eax + 0xc) | 0) >>> 0, (R.esi >>> 0)); // 547e27: mov dword ptr [eax + 0xc], esi
        R.edi = (R.pop()) | 0; // 547e2a: pop edi
        R.esi = (R.pop()) | 0; // 547e2b: pop esi
        R.rv = R.ret(0); return -1; // 547e2c: ret 
      case 18: // 547e2d
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 547e2d: mov eax, dword ptr [esp + 0x14]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 547e31: test eax, eax
        if (R.zf) { pc = 25; continue; } // 547e33: je 0x547e62
        pc = 19; continue;
      case 19: // 547e35
        R.push(0x3); // 547e35: push 3
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 547e37: call 0x90cfc0
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 547e3c: add esp, 4
        R.eax = (R.sub((R.eax >>> 0), 0x0, 32)) | 0; // 547e3f: sub eax, 0
        if (R.zf) { pc = 24; continue; } // 547e42: je 0x547e5c
        pc = 20; continue;
      case 20: // 547e44
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 547e44: dec eax
        if (R.zf) { pc = 23; continue; } // 547e45: je 0x547e53
        pc = 21; continue;
      case 21: // 547e47
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 547e47: dec eax
        if (!R.zf) { pc = 25; continue; } // 547e48: jne 0x547e62
        pc = 22; continue;
      case 22: // 547e4a
        R.eax = (R.m.u32(((R.edi + 0x65) | 0) >>> 0)) | 0; // 547e4a: mov eax, dword ptr [edi + 0x65]
        R.edi = (R.pop()) | 0; // 547e4d: pop edi
        R.m.w32(((R.eax + 0xc) | 0) >>> 0, (R.esi >>> 0)); // 547e4e: mov dword ptr [eax + 0xc], esi
        R.esi = (R.pop()) | 0; // 547e51: pop esi
        R.rv = R.ret(0); return -1; // 547e52: ret 
      default: return pc;
    }
  }
}
function f_547d90_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 23: // 547e53
        R.ecx = (R.m.u32(((R.edi + 0x65) | 0) >>> 0)) | 0; // 547e53: mov ecx, dword ptr [edi + 0x65]
        R.edi = (R.pop()) | 0; // 547e56: pop edi
        R.m.w32(((R.ecx + 0x8) | 0) >>> 0, (R.esi >>> 0)); // 547e57: mov dword ptr [ecx + 8], esi
        R.esi = (R.pop()) | 0; // 547e5a: pop esi
        R.rv = R.ret(0); return -1; // 547e5b: ret 
      case 24: // 547e5c
        R.edx = (R.m.u32(((R.edi + 0x65) | 0) >>> 0)) | 0; // 547e5c: mov edx, dword ptr [edi + 0x65]
        R.m.w32(((R.edx + 0x4) | 0) >>> 0, (R.esi >>> 0)); // 547e5f: mov dword ptr [edx + 4], esi
        pc = 25; continue;
      case 25: // 547e62
        R.edi = (R.pop()) | 0; // 547e62: pop edi
        R.esi = (R.pop()) | 0; // 547e63: pop esi
        R.rv = R.ret(0); return -1; // 547e64: ret 
      default: return pc;
    }
  }
}
export function f_547d90(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 26) throw new Error(`f_547d90: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_547d90_0(R, pc); break;
      case 1: np = f_547d90_1(R, pc); break;
      case 2: np = f_547d90_2(R, pc); break;
      default: throw new Error(`f_547d90: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_547d90: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_547d90.shared = true;
