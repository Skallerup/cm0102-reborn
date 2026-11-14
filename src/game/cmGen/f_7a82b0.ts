// 0x7a82b0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_7a82b0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x7a82b0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x7a82b0:
        R.edx = (R.m.u32(((R.ecx + 0x20) | 0) >>> 0)) | 0; // 7a82b0: mov edx, dword ptr [ecx + 0x20]
        R.push((R.ebx >>> 0)); // 7a82b3: push ebx
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 7a82b4: xor eax, eax
        R.push((R.esi >>> 0)); // 7a82b6: push esi
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 7a82b7: test edx, edx
        R.push((R.edi >>> 0)); // 7a82b9: push edi
        if (R.cLE) { pc = 0x7a833b; continue; } // 7a82ba: jle 0x7a833b
        pc = 0x7a82bc; continue;
      case 0x7a82bc:
        R.esi = (R.m.u32(((R.ecx + 0x1c) | 0) >>> 0)) | 0; // 7a82bc: mov esi, dword ptr [ecx + 0x1c]
        R.edi = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 7a82bf: mov edi, dword ptr [esp + 0x10]
        pc = 0x7a82c3; continue;
      case 0x7a82c3:
        R.sub(R.m.u32(((R.esi) | 0) >>> 0), (R.edi >>> 0), 32); // 7a82c3: cmp dword ptr [esi], edi
        if (R.zf) { pc = 0x7a82d5; continue; } // 7a82c5: je 0x7a82d5
        pc = 0x7a82c7; continue;
      case 0x7a82c7:
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 7a82c7: inc eax
        R.esi = (R.add((R.esi >>> 0), 0x10, 32)) | 0; // 7a82c8: add esi, 0x10
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 7a82cb: cmp eax, edx
        if (R.cL) { pc = 0x7a82c3; continue; } // 7a82cd: jl 0x7a82c3
        pc = 0x7a82cf; continue;
      case 0x7a82cf:
        R.edi = (R.pop()) | 0; // 7a82cf: pop edi
        R.esi = (R.pop()) | 0; // 7a82d0: pop esi
        R.ebx = (R.pop()) | 0; // 7a82d1: pop ebx
        return R.ret(1); // 7a82d2: ret 4
      case 0x7a82d5:
        R.edx = (R.incdec((R.edx >>> 0), -1, 32)) | 0; // 7a82d5: dec edx
        R.esi = ((R.eax >>> 0)) | 0; // 7a82d6: mov esi, eax
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 7a82d8: cmp eax, edx
        if (!R.cL) { pc = 0x7a830a; continue; } // 7a82da: jge 0x7a830a
        pc = 0x7a82dc; continue;
      case 0x7a82dc:
        R.eax = (R.shl((R.eax >>> 0), 0x4, 32)) | 0; // 7a82dc: shl eax, 4
        pc = 0x7a82df; continue;
      case 0x7a82df:
        R.edx = (R.m.u32(((R.ecx + 0x1c) | 0) >>> 0)) | 0; // 7a82df: mov edx, dword ptr [ecx + 0x1c]
        R.edi = (((R.eax + R.edx + 0x10) | 0)) | 0; // 7a82e2: lea edi, [eax + edx + 0x10]
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 7a82e6: add edx, eax
        R.esi = (R.incdec((R.esi >>> 0), 1, 32)) | 0; // 7a82e8: inc esi
        R.eax = (R.add((R.eax >>> 0), 0x10, 32)) | 0; // 7a82e9: add eax, 0x10
        R.ebx = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 7a82ec: mov ebx, dword ptr [edi]
        R.m.w32(((R.edx) | 0) >>> 0, (R.ebx >>> 0)); // 7a82ee: mov dword ptr [edx], ebx
        R.ebx = (R.m.u32(((R.edi + 0x4) | 0) >>> 0)) | 0; // 7a82f0: mov ebx, dword ptr [edi + 4]
        R.m.w32(((R.edx + 0x4) | 0) >>> 0, (R.ebx >>> 0)); // 7a82f3: mov dword ptr [edx + 4], ebx
        R.ebx = (R.m.u32(((R.edi + 0x8) | 0) >>> 0)) | 0; // 7a82f6: mov ebx, dword ptr [edi + 8]
        R.m.w32(((R.edx + 0x8) | 0) >>> 0, (R.ebx >>> 0)); // 7a82f9: mov dword ptr [edx + 8], ebx
        R.edi = (R.m.u32(((R.edi + 0xc) | 0) >>> 0)) | 0; // 7a82fc: mov edi, dword ptr [edi + 0xc]
        R.m.w32(((R.edx + 0xc) | 0) >>> 0, (R.edi >>> 0)); // 7a82ff: mov dword ptr [edx + 0xc], edi
        R.edx = (R.m.u32(((R.ecx + 0x20) | 0) >>> 0)) | 0; // 7a8302: mov edx, dword ptr [ecx + 0x20]
        R.edx = (R.incdec((R.edx >>> 0), -1, 32)) | 0; // 7a8305: dec edx
        R.sub((R.esi >>> 0), (R.edx >>> 0), 32); // 7a8306: cmp esi, edx
        if (R.cL) { pc = 0x7a82df; continue; } // 7a8308: jl 0x7a82df
        pc = 0x7a830a; continue;
      case 0x7a830a:
        R.edx = (R.m.u32(((R.ecx + 0x20) | 0) >>> 0)) | 0; // 7a830a: mov edx, dword ptr [ecx + 0x20]
        R.esi = (R.m.u32(((R.ecx + 0x1c) | 0) >>> 0)) | 0; // 7a830d: mov esi, dword ptr [ecx + 0x1c]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 7a8310: shl edx, 4
        R.eax = (R.logic((R.eax >>> 0) | 0xffffffff, 32)) | 0; // 7a8313: or eax, 0xffffffff
        R.m.w32(((R.edx + R.esi + -0x10) | 0) >>> 0, (R.eax >>> 0)); // 7a8316: mov dword ptr [edx + esi - 0x10], eax
        R.edx = (R.m.u32(((R.ecx + 0x20) | 0) >>> 0)) | 0; // 7a831a: mov edx, dword ptr [ecx + 0x20]
        R.esi = (R.m.u32(((R.ecx + 0x1c) | 0) >>> 0)) | 0; // 7a831d: mov esi, dword ptr [ecx + 0x1c]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 7a8320: shl edx, 4
        R.m.w32(((R.edx + R.esi + -0xc) | 0) >>> 0, (R.eax >>> 0)); // 7a8323: mov dword ptr [edx + esi - 0xc], eax
        R.edx = (R.m.u32(((R.ecx + 0x20) | 0) >>> 0)) | 0; // 7a8327: mov edx, dword ptr [ecx + 0x20]
        R.esi = (R.m.u32(((R.ecx + 0x1c) | 0) >>> 0)) | 0; // 7a832a: mov esi, dword ptr [ecx + 0x1c]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 7a832d: shl edx, 4
        R.m.w32(((R.edx + R.esi + -0x8) | 0) >>> 0, (R.eax >>> 0)); // 7a8330: mov dword ptr [edx + esi - 8], eax
        R.eax = (R.m.u32(((R.ecx + 0x20) | 0) >>> 0)) | 0; // 7a8334: mov eax, dword ptr [ecx + 0x20]
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 7a8337: dec eax
        R.m.w32(((R.ecx + 0x20) | 0) >>> 0, (R.eax >>> 0)); // 7a8338: mov dword ptr [ecx + 0x20], eax
        pc = 0x7a833b; continue;
      case 0x7a833b:
        R.edi = (R.pop()) | 0; // 7a833b: pop edi
        R.esi = (R.pop()) | 0; // 7a833c: pop esi
        R.ebx = (R.pop()) | 0; // 7a833d: pop ebx
        return R.ret(1); // 7a833e: ret 4
      default: throw new Error(`f_7a82b0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
