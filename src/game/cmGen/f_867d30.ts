// 0x867d30 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 456740=2tc, 4a7f20=2tc
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_867d30(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x867d30;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x867d30:
        R.push((R.esi >>> 0)); // 867d30: push esi
        R.push((R.edi >>> 0)); // 867d31: push edi
        R.edi = ((R.ecx >>> 0)) | 0; // 867d32: mov edi, ecx
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edi + 0x35) | 0) >>> 0)) & 0xff) << 0)) | 0; // 867d34: mov al, byte ptr [edi + 0x35]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x3f, 8)) & 0xff) << 0)) | 0; // 867d37: and al, 0x3f
        R.sub(((R.eax >>> 0) & 0xff), 0x1, 8); // 867d39: cmp al, 1
        if (!R.zf) { pc = 0x867d42; continue; } // 867d3b: jne 0x867d42
        pc = 0x867d3d; continue;
      case 0x867d3d:
        R.edi = (R.pop()) | 0; // 867d3d: pop edi
        R.eax = ((R.eax & 0xffffff00) | (((0xe) & 0xff) << 0)) | 0; // 867d3e: mov al, 0xe
        R.esi = (R.pop()) | 0; // 867d40: pop esi
        return R.ret(0); // 867d41: ret 
      case 0x867d42:
        R.ecx = (R.m.u32(((0xae2c94) | 0) >>> 0)) | 0; // 867d42: mov ecx, dword ptr [0xae2c94]
        R.edx = (R.m.u32(((0xae2c90) | 0) >>> 0)) | 0; // 867d48: mov edx, dword ptr [0xae2c90]
        R.esi = (((R.edi + 0x2d) | 0)) | 0; // 867d4e: lea esi, [edi + 0x2d]
        R.push((R.ecx >>> 0)); // 867d51: push ecx
        R.push((R.edx >>> 0)); // 867d52: push edx
        R.ecx = ((R.esi >>> 0)) | 0; // 867d53: mov ecx, esi
        R.call(0x456740, { n: 2, thisEcx: true, calleeClean: true }); // 867d55: call 0x456740
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 867d5a: test eax, eax
        if (!R.zf) { pc = 0x867d63; continue; } // 867d5c: jne 0x867d63
        pc = 0x867d5e; continue;
      case 0x867d5e:
        R.edi = (R.pop()) | 0; // 867d5e: pop edi
        R.eax = ((R.eax & 0xffffff00) | (((0xe) & 0xff) << 0)) | 0; // 867d5f: mov al, 0xe
        R.esi = (R.pop()) | 0; // 867d61: pop esi
        return R.ret(0); // 867d62: ret 
      case 0x867d63:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edi + 0x35) | 0) >>> 0)) & 0xff) << 0)) | 0; // 867d63: mov al, byte ptr [edi + 0x35]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x3f, 8)) & 0xff) << 0)) | 0; // 867d66: and al, 0x3f
        R.sub(((R.eax >>> 0) & 0xff), 0x2, 8); // 867d68: cmp al, 2
        if (R.zf) { pc = 0x867d71; continue; } // 867d6a: je 0x867d71
        pc = 0x867d6c; continue;
      case 0x867d6c:
        R.edi = (R.pop()) | 0; // 867d6c: pop edi
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 867d6d: xor al, al
        R.esi = (R.pop()) | 0; // 867d6f: pop esi
        return R.ret(0); // 867d70: ret 
      case 0x867d71:
        R.ecx = (R.m.u32(((0xae1094) | 0) >>> 0)) | 0; // 867d71: mov ecx, dword ptr [0xae1094]
        R.edx = (R.m.u32(((0xae1090) | 0) >>> 0)) | 0; // 867d77: mov edx, dword ptr [0xae1090]
        R.push((R.ecx >>> 0)); // 867d7d: push ecx
        R.push((R.edx >>> 0)); // 867d7e: push edx
        R.ecx = ((R.esi >>> 0)) | 0; // 867d7f: mov ecx, esi
        R.call(0x456740, { n: 2, thisEcx: true, calleeClean: true }); // 867d81: call 0x456740
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 867d86: test eax, eax
        if (R.zf) { pc = 0x867d8f; continue; } // 867d88: je 0x867d8f
        pc = 0x867d8a; continue;
      case 0x867d8a:
        R.edi = (R.pop()) | 0; // 867d8a: pop edi
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 867d8b: xor al, al
        R.esi = (R.pop()) | 0; // 867d8d: pop esi
        return R.ret(0); // 867d8e: ret 
      case 0x867d8f:
        R.eax = (R.m.u32(((0xae1014) | 0) >>> 0)) | 0; // 867d8f: mov eax, dword ptr [0xae1014]
        R.ecx = (R.m.u32(((0xae1010) | 0) >>> 0)) | 0; // 867d94: mov ecx, dword ptr [0xae1010]
        R.push((R.eax >>> 0)); // 867d9a: push eax
        R.push((R.ecx >>> 0)); // 867d9b: push ecx
        R.ecx = ((R.esi >>> 0)) | 0; // 867d9c: mov ecx, esi
        R.call(0x456740, { n: 2, thisEcx: true, calleeClean: true }); // 867d9e: call 0x456740
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 867da3: test eax, eax
        if (R.zf) { pc = 0x867e37; continue; } // 867da5: je 0x867e37
        pc = 0x867dab; continue;
      case 0x867dab:
        R.edx = (R.m.u32(((0xae1064) | 0) >>> 0)) | 0; // 867dab: mov edx, dword ptr [0xae1064]
        R.eax = (R.m.u32(((0xae1060) | 0) >>> 0)) | 0; // 867db1: mov eax, dword ptr [0xae1060]
        R.push((R.edx >>> 0)); // 867db6: push edx
        R.push((R.eax >>> 0)); // 867db7: push eax
        R.ecx = ((R.esi >>> 0)) | 0; // 867db8: mov ecx, esi
        R.call(0x456740, { n: 2, thisEcx: true, calleeClean: true }); // 867dba: call 0x456740
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 867dbf: test eax, eax
        if (R.zf) { pc = 0x867e18; continue; } // 867dc1: je 0x867e18
        pc = 0x867dc3; continue;
      case 0x867dc3:
        R.ecx = (R.m.u32(((0xae1044) | 0) >>> 0)) | 0; // 867dc3: mov ecx, dword ptr [0xae1044]
        R.edx = (R.m.u32(((0xae1040) | 0) >>> 0)) | 0; // 867dc9: mov edx, dword ptr [0xae1040]
        R.push((R.ecx >>> 0)); // 867dcf: push ecx
        R.push((R.edx >>> 0)); // 867dd0: push edx
        R.ecx = ((R.esi >>> 0)) | 0; // 867dd1: mov ecx, esi
        R.call(0x456740, { n: 2, thisEcx: true, calleeClean: true }); // 867dd3: call 0x456740
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 867dd8: test eax, eax
        if (R.zf) { pc = 0x867dfa; continue; } // 867dda: je 0x867dfa
        pc = 0x867ddc; continue;
      case 0x867ddc:
        R.eax = (R.m.u32(((0xae1094) | 0) >>> 0)) | 0; // 867ddc: mov eax, dword ptr [0xae1094]
        R.ecx = (R.m.u32(((0xae1090) | 0) >>> 0)) | 0; // 867de1: mov ecx, dword ptr [0xae1090]
        R.push((R.eax >>> 0)); // 867de7: push eax
        R.push((R.ecx >>> 0)); // 867de8: push ecx
        R.ecx = ((R.esi >>> 0)) | 0; // 867de9: mov ecx, esi
        R.call(0x4a7f20, { n: 2, thisEcx: true, calleeClean: true }); // 867deb: call 0x4a7f20
        R.eax = (R.neg((R.eax >>> 0), 32)) | 0; // 867df0: neg eax
        R.eax = ((R.eax & 0xffffff00) | (((R.sub(((R.eax >>> 0) & 0xff), ((R.eax >>> 0) & 0xff), 8, R.cf ? 1 : 0)) & 0xff) << 0)) | 0; // 867df2: sbb al, al
        R.edi = (R.pop()) | 0; // 867df4: pop edi
        R.eax = (R.add((R.eax >>> 0), 0x2, 32)) | 0; // 867df5: add eax, 2
        R.esi = (R.pop()) | 0; // 867df8: pop esi
        return R.ret(0); // 867df9: ret 
      case 0x867dfa:
        R.edx = (R.m.u32(((0xae1044) | 0) >>> 0)) | 0; // 867dfa: mov edx, dword ptr [0xae1044]
        R.eax = (R.m.u32(((0xae1040) | 0) >>> 0)) | 0; // 867e00: mov eax, dword ptr [0xae1040]
        R.push((R.edx >>> 0)); // 867e05: push edx
        R.push((R.eax >>> 0)); // 867e06: push eax
        R.ecx = ((R.esi >>> 0)) | 0; // 867e07: mov ecx, esi
        R.call(0x4a7f20, { n: 2, thisEcx: true, calleeClean: true }); // 867e09: call 0x4a7f20
        R.eax = (R.neg((R.eax >>> 0), 32)) | 0; // 867e0e: neg eax
        R.eax = ((R.eax & 0xffffff00) | (((R.sub(((R.eax >>> 0) & 0xff), ((R.eax >>> 0) & 0xff), 8, R.cf ? 1 : 0)) & 0xff) << 0)) | 0; // 867e10: sbb al, al
        R.edi = (R.pop()) | 0; // 867e12: pop edi
        R.eax = (R.add((R.eax >>> 0), 0x4, 32)) | 0; // 867e13: add eax, 4
        R.esi = (R.pop()) | 0; // 867e16: pop esi
        return R.ret(0); // 867e17: ret 
      case 0x867e18:
        R.ecx = (R.m.u32(((0xae1064) | 0) >>> 0)) | 0; // 867e18: mov ecx, dword ptr [0xae1064]
        R.edx = (R.m.u32(((0xae1060) | 0) >>> 0)) | 0; // 867e1e: mov edx, dword ptr [0xae1060]
        R.push((R.ecx >>> 0)); // 867e24: push ecx
        R.push((R.edx >>> 0)); // 867e25: push edx
        R.ecx = ((R.esi >>> 0)) | 0; // 867e26: mov ecx, esi
        R.call(0x4a7f20, { n: 2, thisEcx: true, calleeClean: true }); // 867e28: call 0x4a7f20
        R.eax = (R.neg((R.eax >>> 0), 32)) | 0; // 867e2d: neg eax
        R.eax = ((R.eax & 0xffffff00) | (((R.sub(((R.eax >>> 0) & 0xff), ((R.eax >>> 0) & 0xff), 8, R.cf ? 1 : 0)) & 0xff) << 0)) | 0; // 867e2f: sbb al, al
        R.edi = (R.pop()) | 0; // 867e31: pop edi
        R.eax = (R.add((R.eax >>> 0), 0x6, 32)) | 0; // 867e32: add eax, 6
        R.esi = (R.pop()) | 0; // 867e35: pop esi
        return R.ret(0); // 867e36: ret 
      case 0x867e37:
        R.eax = (R.m.u32(((0xae1034) | 0) >>> 0)) | 0; // 867e37: mov eax, dword ptr [0xae1034]
        R.ecx = (R.m.u32(((0xae1030) | 0) >>> 0)) | 0; // 867e3c: mov ecx, dword ptr [0xae1030]
        R.push((R.eax >>> 0)); // 867e42: push eax
        R.push((R.ecx >>> 0)); // 867e43: push ecx
        R.ecx = ((R.esi >>> 0)) | 0; // 867e44: mov ecx, esi
        R.call(0x456740, { n: 2, thisEcx: true, calleeClean: true }); // 867e46: call 0x456740
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 867e4b: test eax, eax
        if (R.zf) { pc = 0x867ea4; continue; } // 867e4d: je 0x867ea4
        pc = 0x867e4f; continue;
      case 0x867e4f:
        R.edx = (R.m.u32(((0xae105c) | 0) >>> 0)) | 0; // 867e4f: mov edx, dword ptr [0xae105c]
        R.eax = (R.m.u32(((0xae1058) | 0) >>> 0)) | 0; // 867e55: mov eax, dword ptr [0xae1058]
        R.push((R.edx >>> 0)); // 867e5a: push edx
        R.push((R.eax >>> 0)); // 867e5b: push eax
        R.ecx = ((R.esi >>> 0)) | 0; // 867e5c: mov ecx, esi
        R.call(0x456740, { n: 2, thisEcx: true, calleeClean: true }); // 867e5e: call 0x456740
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 867e63: test eax, eax
        if (R.zf) { pc = 0x867e86; continue; } // 867e65: je 0x867e86
        pc = 0x867e67; continue;
      case 0x867e67:
        R.ecx = (R.m.u32(((0xae1014) | 0) >>> 0)) | 0; // 867e67: mov ecx, dword ptr [0xae1014]
        R.edx = (R.m.u32(((0xae1010) | 0) >>> 0)) | 0; // 867e6d: mov edx, dword ptr [0xae1010]
        R.push((R.ecx >>> 0)); // 867e73: push ecx
        R.push((R.edx >>> 0)); // 867e74: push edx
        R.ecx = ((R.esi >>> 0)) | 0; // 867e75: mov ecx, esi
        R.call(0x4a7f20, { n: 2, thisEcx: true, calleeClean: true }); // 867e77: call 0x4a7f20
        R.eax = (R.neg((R.eax >>> 0), 32)) | 0; // 867e7c: neg eax
        R.eax = ((R.eax & 0xffffff00) | (((R.sub(((R.eax >>> 0) & 0xff), ((R.eax >>> 0) & 0xff), 8, R.cf ? 1 : 0)) & 0xff) << 0)) | 0; // 867e7e: sbb al, al
        R.edi = (R.pop()) | 0; // 867e80: pop edi
        R.eax = (R.add((R.eax >>> 0), 0x8, 32)) | 0; // 867e81: add eax, 8
        R.esi = (R.pop()) | 0; // 867e84: pop esi
        return R.ret(0); // 867e85: ret 
      case 0x867e86:
        R.eax = (R.m.u32(((0xae105c) | 0) >>> 0)) | 0; // 867e86: mov eax, dword ptr [0xae105c]
        R.ecx = (R.m.u32(((0xae1058) | 0) >>> 0)) | 0; // 867e8b: mov ecx, dword ptr [0xae1058]
        R.push((R.eax >>> 0)); // 867e91: push eax
        R.push((R.ecx >>> 0)); // 867e92: push ecx
        R.ecx = ((R.esi >>> 0)) | 0; // 867e93: mov ecx, esi
        R.call(0x4a7f20, { n: 2, thisEcx: true, calleeClean: true }); // 867e95: call 0x4a7f20
        R.eax = (R.neg((R.eax >>> 0), 32)) | 0; // 867e9a: neg eax
        R.eax = ((R.eax & 0xffffff00) | (((R.sub(((R.eax >>> 0) & 0xff), ((R.eax >>> 0) & 0xff), 8, R.cf ? 1 : 0)) & 0xff) << 0)) | 0; // 867e9c: sbb al, al
        R.edi = (R.pop()) | 0; // 867e9e: pop edi
        R.eax = (R.add((R.eax >>> 0), 0xa, 32)) | 0; // 867e9f: add eax, 0xa
        R.esi = (R.pop()) | 0; // 867ea2: pop esi
        return R.ret(0); // 867ea3: ret 
      case 0x867ea4:
        R.edx = (R.m.u32(((0xae1034) | 0) >>> 0)) | 0; // 867ea4: mov edx, dword ptr [0xae1034]
        R.eax = (R.m.u32(((0xae1030) | 0) >>> 0)) | 0; // 867eaa: mov eax, dword ptr [0xae1030]
        R.push((R.edx >>> 0)); // 867eaf: push edx
        R.push((R.eax >>> 0)); // 867eb0: push eax
        R.ecx = ((R.esi >>> 0)) | 0; // 867eb1: mov ecx, esi
        R.call(0x4a7f20, { n: 2, thisEcx: true, calleeClean: true }); // 867eb3: call 0x4a7f20
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 867eb8: test eax, eax
        if (R.zf) { pc = 0x867ec1; continue; } // 867eba: je 0x867ec1
        pc = 0x867ebc; continue;
      case 0x867ebc:
        R.edi = (R.pop()) | 0; // 867ebc: pop edi
        R.eax = ((R.eax & 0xffffff00) | (((0xb) & 0xff) << 0)) | 0; // 867ebd: mov al, 0xb
        R.esi = (R.pop()) | 0; // 867ebf: pop esi
        return R.ret(0); // 867ec0: ret 
      case 0x867ec1:
        R.ecx = (R.m.u32(((0xae104c) | 0) >>> 0)) | 0; // 867ec1: mov ecx, dword ptr [0xae104c]
        R.edx = (R.m.u32(((0xae1048) | 0) >>> 0)) | 0; // 867ec7: mov edx, dword ptr [0xae1048]
        R.push((R.ecx >>> 0)); // 867ecd: push ecx
        R.push((R.edx >>> 0)); // 867ece: push edx
        R.ecx = ((R.esi >>> 0)) | 0; // 867ecf: mov ecx, esi
        R.call(0x4a7f20, { n: 2, thisEcx: true, calleeClean: true }); // 867ed1: call 0x4a7f20
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 867ed6: test eax, eax
        R.eax = ((R.eax & 0xffffff00) | (((!R.zf ? 1 : 0) & 0xff) << 0)) | 0; // 867ed8: setne al
        R.edi = (R.pop()) | 0; // 867edb: pop edi
        R.eax = (R.add((R.eax >>> 0), 0xc, 32)) | 0; // 867edc: add eax, 0xc
        R.esi = (R.pop()) | 0; // 867edf: pop esi
        return R.ret(0); // 867ee0: ret 
      default: throw new Error(`f_867d30: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
