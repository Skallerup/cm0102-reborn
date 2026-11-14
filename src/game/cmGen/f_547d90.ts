// 0x547d90 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_547d90(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x547d90;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x547d90:
        R.push((R.esi >>> 0)); // 547d90: push esi
        R.push((R.edi >>> 0)); // 547d91: push edi
        R.edi = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 547d92: mov edi, dword ptr [esp + 0xc]
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 547d96: test edi, edi
        if (R.zf) { pc = 0x547e62; continue; } // 547d98: je 0x547e62
        pc = 0x547d9e; continue;
      case 0x547d9e:
        R.eax = (R.m.u32(((R.edi + 0x65) | 0) >>> 0)) | 0; // 547d9e: mov eax, dword ptr [edi + 0x65]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 547da1: test eax, eax
        if (R.zf) { pc = 0x547e62; continue; } // 547da3: je 0x547e62
        pc = 0x547da9; continue;
      case 0x547da9:
        R.esi = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 547da9: mov esi, dword ptr [esp + 0x10]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 547dad: test esi, esi
        if (R.zf) { pc = 0x547e62; continue; } // 547daf: je 0x547e62
        pc = 0x547db5; continue;
      case 0x547db5:
        R.sub(R.m.u32(((R.esi + 0x9b) | 0) >>> 0), (R.edi >>> 0), 32); // 547db5: cmp dword ptr [esi + 0x9b], edi
        if (R.zf) { pc = 0x547e62; continue; } // 547dbb: je 0x547e62
        pc = 0x547dc1; continue;
      case 0x547dc1:
        R.sub(R.m.u32(((R.esi + 0x9f) | 0) >>> 0), (R.edi >>> 0), 32); // 547dc1: cmp dword ptr [esi + 0x9f], edi
        if (R.zf) { pc = 0x547e62; continue; } // 547dc7: je 0x547e62
        pc = 0x547dcd; continue;
      case 0x547dcd:
        R.sub(R.m.u32(((R.esi + 0xa3) | 0) >>> 0), (R.edi >>> 0), 32); // 547dcd: cmp dword ptr [esi + 0xa3], edi
        if (R.zf) { pc = 0x547e62; continue; } // 547dd3: je 0x547e62
        pc = 0x547dd9; continue;
      case 0x547dd9:
        R.sub(R.m.u32(((R.eax + 0x10) | 0) >>> 0), (R.esi >>> 0), 32); // 547dd9: cmp dword ptr [eax + 0x10], esi
        if (!R.zf) { pc = 0x547de8; continue; } // 547ddc: jne 0x547de8
        pc = 0x547dde; continue;
      case 0x547dde:
        R.edi = (R.pop()) | 0; // 547dde: pop edi
        R.m.w32(((R.eax + 0x10) | 0) >>> 0, 0x0); // 547ddf: mov dword ptr [eax + 0x10], 0
        R.esi = (R.pop()) | 0; // 547de6: pop esi
        return R.ret(0); // 547de7: ret 
      case 0x547de8:
        R.sub(R.m.u32(((R.eax + 0x14) | 0) >>> 0), (R.esi >>> 0), 32); // 547de8: cmp dword ptr [eax + 0x14], esi
        if (!R.zf) { pc = 0x547df7; continue; } // 547deb: jne 0x547df7
        pc = 0x547ded; continue;
      case 0x547ded:
        R.edi = (R.pop()) | 0; // 547ded: pop edi
        R.m.w32(((R.eax + 0x14) | 0) >>> 0, 0x0); // 547dee: mov dword ptr [eax + 0x14], 0
        R.esi = (R.pop()) | 0; // 547df5: pop esi
        return R.ret(0); // 547df6: ret 
      case 0x547df7:
        R.sub(R.m.u32(((R.eax + 0x18) | 0) >>> 0), (R.esi >>> 0), 32); // 547df7: cmp dword ptr [eax + 0x18], esi
        if (!R.zf) { pc = 0x547e06; continue; } // 547dfa: jne 0x547e06
        pc = 0x547dfc; continue;
      case 0x547dfc:
        R.edi = (R.pop()) | 0; // 547dfc: pop edi
        R.m.w32(((R.eax + 0x18) | 0) >>> 0, 0x0); // 547dfd: mov dword ptr [eax + 0x18], 0
        R.esi = (R.pop()) | 0; // 547e04: pop esi
        return R.ret(0); // 547e05: ret 
      case 0x547e06:
        R.ecx = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 547e06: mov ecx, dword ptr [eax + 4]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 547e09: test ecx, ecx
        if (!R.zf) { pc = 0x547e13; continue; } // 547e0b: jne 0x547e13
        pc = 0x547e0d; continue;
      case 0x547e0d:
        R.m.w32(((R.eax + 0x4) | 0) >>> 0, (R.esi >>> 0)); // 547e0d: mov dword ptr [eax + 4], esi
        R.edi = (R.pop()) | 0; // 547e10: pop edi
        R.esi = (R.pop()) | 0; // 547e11: pop esi
        return R.ret(0); // 547e12: ret 
      case 0x547e13:
        R.ecx = (R.m.u32(((R.eax + 0x8) | 0) >>> 0)) | 0; // 547e13: mov ecx, dword ptr [eax + 8]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 547e16: test ecx, ecx
        if (!R.zf) { pc = 0x547e20; continue; } // 547e18: jne 0x547e20
        pc = 0x547e1a; continue;
      case 0x547e1a:
        R.m.w32(((R.eax + 0x8) | 0) >>> 0, (R.esi >>> 0)); // 547e1a: mov dword ptr [eax + 8], esi
        R.edi = (R.pop()) | 0; // 547e1d: pop edi
        R.esi = (R.pop()) | 0; // 547e1e: pop esi
        return R.ret(0); // 547e1f: ret 
      case 0x547e20:
        R.ecx = (R.m.u32(((R.eax + 0xc) | 0) >>> 0)) | 0; // 547e20: mov ecx, dword ptr [eax + 0xc]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 547e23: test ecx, ecx
        if (!R.zf) { pc = 0x547e2d; continue; } // 547e25: jne 0x547e2d
        pc = 0x547e27; continue;
      case 0x547e27:
        R.m.w32(((R.eax + 0xc) | 0) >>> 0, (R.esi >>> 0)); // 547e27: mov dword ptr [eax + 0xc], esi
        R.edi = (R.pop()) | 0; // 547e2a: pop edi
        R.esi = (R.pop()) | 0; // 547e2b: pop esi
        return R.ret(0); // 547e2c: ret 
      case 0x547e2d:
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 547e2d: mov eax, dword ptr [esp + 0x14]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 547e31: test eax, eax
        if (R.zf) { pc = 0x547e62; continue; } // 547e33: je 0x547e62
        pc = 0x547e35; continue;
      case 0x547e35:
        R.push(0x3); // 547e35: push 3
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 547e37: call 0x90cfc0
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 547e3c: add esp, 4
        R.eax = (R.sub((R.eax >>> 0), 0x0, 32)) | 0; // 547e3f: sub eax, 0
        if (R.zf) { pc = 0x547e5c; continue; } // 547e42: je 0x547e5c
        pc = 0x547e44; continue;
      case 0x547e44:
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 547e44: dec eax
        if (R.zf) { pc = 0x547e53; continue; } // 547e45: je 0x547e53
        pc = 0x547e47; continue;
      case 0x547e47:
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 547e47: dec eax
        if (!R.zf) { pc = 0x547e62; continue; } // 547e48: jne 0x547e62
        pc = 0x547e4a; continue;
      case 0x547e4a:
        R.eax = (R.m.u32(((R.edi + 0x65) | 0) >>> 0)) | 0; // 547e4a: mov eax, dword ptr [edi + 0x65]
        R.edi = (R.pop()) | 0; // 547e4d: pop edi
        R.m.w32(((R.eax + 0xc) | 0) >>> 0, (R.esi >>> 0)); // 547e4e: mov dword ptr [eax + 0xc], esi
        R.esi = (R.pop()) | 0; // 547e51: pop esi
        return R.ret(0); // 547e52: ret 
      case 0x547e53:
        R.ecx = (R.m.u32(((R.edi + 0x65) | 0) >>> 0)) | 0; // 547e53: mov ecx, dword ptr [edi + 0x65]
        R.edi = (R.pop()) | 0; // 547e56: pop edi
        R.m.w32(((R.ecx + 0x8) | 0) >>> 0, (R.esi >>> 0)); // 547e57: mov dword ptr [ecx + 8], esi
        R.esi = (R.pop()) | 0; // 547e5a: pop esi
        return R.ret(0); // 547e5b: ret 
      case 0x547e5c:
        R.edx = (R.m.u32(((R.edi + 0x65) | 0) >>> 0)) | 0; // 547e5c: mov edx, dword ptr [edi + 0x65]
        R.m.w32(((R.edx + 0x4) | 0) >>> 0, (R.esi >>> 0)); // 547e5f: mov dword ptr [edx + 4], esi
        pc = 0x547e62; continue;
      case 0x547e62:
        R.edi = (R.pop()) | 0; // 547e62: pop edi
        R.esi = (R.pop()) | 0; // 547e63: pop esi
        return R.ret(0); // 547e64: ret 
      default: throw new Error(`f_547d90: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
