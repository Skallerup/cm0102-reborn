// 0x418f60 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4196a0=1tc, 4cf5a0=1c
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_418f60(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x418f60;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x418f60:
        R.push((R.esi >>> 0)); // 418f60: push esi
        R.esi = (R.m.u32(((R.esp + 0x8) | 0) >>> 0)) | 0; // 418f61: mov esi, dword ptr [esp + 8]
        R.push((R.edi >>> 0)); // 418f65: push edi
        R.edi = ((R.ecx >>> 0)) | 0; // 418f66: mov edi, ecx
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 418f68: test esi, esi
        if (!R.zf) { pc = 0x418f73; continue; } // 418f6a: jne 0x418f73
        pc = 0x418f6c; continue;
      case 0x418f6c:
        R.edi = (R.pop()) | 0; // 418f6c: pop edi
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 418f6d: xor al, al
        R.esi = (R.pop()) | 0; // 418f6f: pop esi
        return R.ret(2); // 418f70: ret 8
      case 0x418f73:
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 418f73: mov eax, dword ptr [esi]
        R.ecx = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 418f75: mov ecx, dword ptr [0xae2364]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 418f7b: cmp eax, ecx
        if (R.cL) { pc = 0x418f86; continue; } // 418f7d: jl 0x418f86
        pc = 0x418f7f; continue;
      case 0x418f7f:
        R.edi = (R.pop()) | 0; // 418f7f: pop edi
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 418f80: xor al, al
        R.esi = (R.pop()) | 0; // 418f82: pop esi
        return R.ret(2); // 418f83: ret 8
      case 0x418f86:
        R.ecx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 418f86: mov ecx, dword ptr [esp + 0x10]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 418f8a: test ecx, ecx
        if (R.zf) { pc = 0x418f9c; continue; } // 418f8c: je 0x418f9c
        pc = 0x418f8e; continue;
      case 0x418f8e:
        R.ecx = (R.m.u32(((R.edi + 0xc) | 0) >>> 0)) | 0; // 418f8e: mov ecx, dword ptr [edi + 0xc]
        R.edi = (R.pop()) | 0; // 418f91: pop edi
        R.esi = (R.pop()) | 0; // 418f92: pop esi
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + R.eax) | 0) >>> 0)) & 0xff) << 0)) | 0; // 418f93: mov al, byte ptr [ecx + eax]
        R.eax = (R.logic((R.eax >>> 0) & 0x1, 32)) | 0; // 418f96: and eax, 1
        return R.ret(2); // 418f99: ret 8
      case 0x418f9c:
        R.edx = (R.m.u32(((R.edi + 0xc) | 0) >>> 0)) | 0; // 418f9c: mov edx, dword ptr [edi + 0xc]
        R.logic(R.m.u8(((R.edx + R.eax) | 0) >>> 0) & 0x1, 8); // 418f9f: test byte ptr [edx + eax], 1
        if (R.zf) { pc = 0x418fdc; continue; } // 418fa3: je 0x418fdc
        pc = 0x418fa5; continue;
      case 0x418fa5:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 418fa5: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 418fab: push esi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 418fac: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 418fb1: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 418fb3: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x418fd4; continue; } // 418fb8: je 0x418fd4
        pc = 0x418fba; continue;
      case 0x418fba:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 418fba: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 418fbd: mov edx, dword ptr [0xae23b4]
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 418fc3: add edx, eax
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 418fc5: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 418fc8: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 418fcb: add ecx, eax
        R.eax = (((R.edx + R.ecx * 4) | 0)) | 0; // 418fcd: lea eax, [edx + ecx*4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 418fd0: test eax, eax
        if (!R.zf) { pc = 0x418fdc; continue; } // 418fd2: jne 0x418fdc
        pc = 0x418fd4; continue;
      case 0x418fd4:
        R.push((R.esi >>> 0)); // 418fd4: push esi
        R.ecx = ((R.edi >>> 0)) | 0; // 418fd5: mov ecx, edi
        R.call(0x4196a0, { n: 1, thisEcx: true, calleeClean: true }); // 418fd7: call 0x4196a0
        pc = 0x418fdc; continue;
      case 0x418fdc:
        R.eax = (R.m.u32(((R.edi + 0xc) | 0) >>> 0)) | 0; // 418fdc: mov eax, dword ptr [edi + 0xc]
        R.ecx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 418fdf: mov ecx, dword ptr [esi]
        R.edi = (R.pop()) | 0; // 418fe1: pop edi
        R.esi = (R.pop()) | 0; // 418fe2: pop esi
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + R.ecx) | 0) >>> 0)) & 0xff) << 0)) | 0; // 418fe3: mov al, byte ptr [eax + ecx]
        R.eax = (R.logic((R.eax >>> 0) & 0x1, 32)) | 0; // 418fe6: and eax, 1
        return R.ret(2); // 418fe9: ret 8
      default: throw new Error(`f_418f60: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
