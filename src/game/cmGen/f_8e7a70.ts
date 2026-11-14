// 0x8e7a70 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4d0c60=5c, 68d1b0=0t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_8e7a70(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x8e7a70;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x8e7a70:
        R.push((R.ebx >>> 0)); // 8e7a70: push ebx
        R.push((R.esi >>> 0)); // 8e7a71: push esi
        R.push((R.edi >>> 0)); // 8e7a72: push edi
        R.edi = ((R.ecx >>> 0)) | 0; // 8e7a73: mov edi, ecx
        R.eax = (R.m.u32(((R.edi + 0xc) | 0) >>> 0)) | 0; // 8e7a75: mov eax, dword ptr [edi + 0xc]
        R.esi = (R.m.u32(((R.edi + 0x1b) | 0) >>> 0)) | 0; // 8e7a78: mov esi, dword ptr [edi + 0x1b]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 8e7a7b: lea ecx, [eax + eax*4]
        R.eax = (((R.eax + R.ecx * 2) | 0)) | 0; // 8e7a7e: lea eax, [eax + ecx*2]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 8e7a81: lea edx, [eax + eax*4]
        R.eax = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 8e7a84: mov eax, dword ptr [0xae23bc]
        R.ebx = (((R.eax + R.edx * 2) | 0)) | 0; // 8e7a89: lea ebx, [eax + edx*2]
        R.eax = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 8e7a8c: mov eax, dword ptr [esp + 0x10]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e7a90: test eax, eax
        if (!R.zf) { pc = 0x8e7ad1; continue; } // 8e7a92: jne 0x8e7ad1
        pc = 0x8e7a94; continue;
      case 0x8e7a94:
        R.eax = (R.m.u32(((R.edi + 0x35) | 0) >>> 0)) | 0; // 8e7a94: mov eax, dword ptr [edi + 0x35]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e7a97: test eax, eax
        if (R.cLE) { pc = 0x8e7a9d; continue; } // 8e7a99: jle 0x8e7a9d
        pc = 0x8e7a9b; continue;
      case 0x8e7a9b:
        R.esi = (R.add((R.esi >>> 0), (R.eax >>> 0), 32)) | 0; // 8e7a9b: add esi, eax
        pc = 0x8e7a9d; continue;
      case 0x8e7a9d:
        R.eax = (R.m.u32(((R.edi + 0x3a) | 0) >>> 0)) | 0; // 8e7a9d: mov eax, dword ptr [edi + 0x3a]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e7aa0: test eax, eax
        if (R.cLE) { pc = 0x8e7aa6; continue; } // 8e7aa2: jle 0x8e7aa6
        pc = 0x8e7aa4; continue;
      case 0x8e7aa4:
        R.esi = (R.add((R.esi >>> 0), (R.eax >>> 0), 32)) | 0; // 8e7aa4: add esi, eax
        pc = 0x8e7aa6; continue;
      case 0x8e7aa6:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edi + 0x3f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e7aa6: mov al, byte ptr [edi + 0x3f]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 8e7aa9: test al, al
        if (R.cLE) { pc = 0x8e7ad1; continue; } // 8e7aab: jle 0x8e7ad1
        pc = 0x8e7aad; continue;
      case 0x8e7aad:
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 8e7aad: mov ecx, dword ptr [esp + 0x1c]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 8e7ab1: test ecx, ecx
        if (R.zf) { pc = 0x8e7ad1; continue; } // 8e7ab3: je 0x8e7ad1
        pc = 0x8e7ab5; continue;
      case 0x8e7ab5:
        R.ecx = (R.m.u32(((R.ebx + 0x52) | 0) >>> 0)) | 0; // 8e7ab5: mov ecx, dword ptr [ebx + 0x52]
        R.edx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 8e7ab8: movsx edx, al
        { const p = BigInt((((R.edx >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 8e7abb: imul ecx, edx
        R.eax = (0x51eb851f) | 0; // 8e7abe: mov eax, 0x51eb851f
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 8e7ac3: imul ecx
        R.edx = (R.sar((R.edx >>> 0), 0x5, 32)) | 0; // 8e7ac5: sar edx, 5
        R.eax = ((R.edx >>> 0)) | 0; // 8e7ac8: mov eax, edx
        R.eax = (R.shr((R.eax >>> 0), 0x1f, 32)) | 0; // 8e7aca: shr eax, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8e7acd: add edx, eax
        R.esi = (R.add((R.esi >>> 0), (R.edx >>> 0), 32)) | 0; // 8e7acf: add esi, edx
        pc = 0x8e7ad1; continue;
      case 0x8e7ad1:
        R.eax = (R.m.u32(((R.edi + 0x4) | 0) >>> 0)) | 0; // 8e7ad1: mov eax, dword ptr [edi + 4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e7ad4: test eax, eax
        if (R.zf) { pc = 0x8e7b3d; continue; } // 8e7ad6: je 0x8e7b3d
        pc = 0x8e7ad8; continue;
      case 0x8e7ad8:
        R.ecx = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 8e7ad8: mov ecx, dword ptr [esp + 0x14]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 8e7adc: test ecx, ecx
        if (!R.zf) { pc = 0x8e7b3d; continue; } // 8e7ade: jne 0x8e7b3d
        pc = 0x8e7ae0; continue;
      case 0x8e7ae0:
        R.ecx = (R.m.u32(((R.eax + 0x2) | 0) >>> 0)) | 0; // 8e7ae0: mov ecx, dword ptr [eax + 2]
        R.m.w32(((R.eax + 0xa) | 0) >>> 0, (R.ecx >>> 0)); // 8e7ae3: mov dword ptr [eax + 0xa], ecx
        R.ecx = (R.m.u32(((R.edi + 0x4) | 0) >>> 0)) | 0; // 8e7ae6: mov ecx, dword ptr [edi + 4]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8e7ae9: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e7aee: test eax, eax
        if (R.zf) { pc = 0x8e7b3d; continue; } // 8e7af0: je 0x8e7b3d
        pc = 0x8e7af2; continue;
      case 0x8e7af2:
        R.push((R.ebp >>> 0)); // 8e7af2: push ebp
        R.ebp = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 8e7af3: mov ebp, dword ptr [esp + 0x1c]
        pc = 0x8e7af7; continue;
      case 0x8e7af7:
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 8e7af7: test ebp, ebp
        if (R.zf) { pc = 0x8e7b13; continue; } // 8e7af9: je 0x8e7b13
        pc = 0x8e7afb; continue;
      case 0x8e7afb:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8e7afb: mov ecx, dword ptr [0xae1050]
        R.push(0x0); // 8e7b01: push 0
        R.push(0xffffffff); // 8e7b03: push -1
        R.push(0x0); // 8e7b05: push 0
        R.push(0x0); // 8e7b07: push 0
        R.push((R.ebx >>> 0)); // 8e7b09: push ebx
        R.call(0x4d0c60, { n: 5, thisEcx: false, calleeClean: true }); // 8e7b0a: call 0x4d0c60
        R.esi = (R.add((R.esi >>> 0), (R.eax >>> 0), 32)) | 0; // 8e7b0f: add esi, eax
        pc = 0x8e7b28; continue; // 8e7b11: jmp 0x8e7b28
      case 0x8e7b13:
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8e7b13: mov eax, dword ptr [eax]
        R.ecx = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 8e7b15: mov ecx, dword ptr [0xae23bc]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 8e7b1b: lea edx, [eax + eax*4]
        R.eax = (((R.eax + R.edx * 2) | 0)) | 0; // 8e7b1e: lea eax, [eax + edx*2]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 8e7b21: lea eax, [eax + eax*4]
        R.esi = (R.add((R.esi >>> 0), R.m.u32(((R.ecx + R.eax * 2 + 0x52) | 0) >>> 0), 32)) | 0; // 8e7b24: add esi, dword ptr [ecx + eax*2 + 0x52]
        pc = 0x8e7b28; continue;
      case 0x8e7b28:
        R.ecx = (R.m.u32(((R.edi + 0x4) | 0) >>> 0)) | 0; // 8e7b28: mov ecx, dword ptr [edi + 4]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8e7b2b: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e7b30: test eax, eax
        if (!R.zf) { pc = 0x8e7af7; continue; } // 8e7b32: jne 0x8e7af7
        pc = 0x8e7b34; continue;
      case 0x8e7b34:
        R.ebp = (R.pop()) | 0; // 8e7b34: pop ebp
        R.eax = ((R.esi >>> 0)) | 0; // 8e7b35: mov eax, esi
        R.edi = (R.pop()) | 0; // 8e7b37: pop edi
        R.esi = (R.pop()) | 0; // 8e7b38: pop esi
        R.ebx = (R.pop()) | 0; // 8e7b39: pop ebx
        return R.ret(4); // 8e7b3a: ret 0x10
      case 0x8e7b3d:
        R.eax = ((R.esi >>> 0)) | 0; // 8e7b3d: mov eax, esi
        R.edi = (R.pop()) | 0; // 8e7b3f: pop edi
        R.esi = (R.pop()) | 0; // 8e7b40: pop esi
        R.ebx = (R.pop()) | 0; // 8e7b41: pop ebx
        return R.ret(4); // 8e7b42: ret 0x10
      default: throw new Error(`f_8e7a70: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
