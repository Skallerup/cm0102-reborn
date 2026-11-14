// 0x7549b0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 945333=4
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_7549b0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x7549b0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x7549b0:
        R.push((R.ecx >>> 0)); // 7549b0: push ecx
        R.eax = ((R.ecx >>> 0)) | 0; // 7549b1: mov eax, ecx
        R.edx = (R.logic((R.edx >>> 0) ^ (R.edx >>> 0), 32)) | 0; // 7549b3: xor edx, edx
        R.m.w32(((R.esp) | 0) >>> 0, (R.edx >>> 0)); // 7549b5: mov dword ptr [esp], edx
        R.ecx = (R.m.u32(((R.eax + 0x14) | 0) >>> 0)) | 0; // 7549b9: mov ecx, dword ptr [eax + 0x14]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 7549bc: cmp ecx, edx
        if (R.cLE) { pc = 0x754a11; continue; } // 7549be: jle 0x754a11
        pc = 0x7549c0; continue;
      case 0x7549c0:
        R.push((R.ebx >>> 0)); // 7549c0: push ebx
        R.ebx = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 7549c1: mov ebx, dword ptr [esp + 0xc]
        R.push((R.ebp >>> 0)); // 7549c5: push ebp
        R.push((R.esi >>> 0)); // 7549c6: push esi
        R.push((R.edi >>> 0)); // 7549c7: push edi
        pc = 0x7549c8; continue;
      case 0x7549c8:
        R.esi = (R.m.u32(((R.eax + 0xc) | 0) >>> 0)) | 0; // 7549c8: mov esi, dword ptr [eax + 0xc]
        R.ebp = (R.m.u32(((R.edx + R.esi) | 0) >>> 0)) | 0; // 7549cb: mov ebp, dword ptr [edx + esi]
        R.edi = (((R.edx + R.esi) | 0)) | 0; // 7549ce: lea edi, [edx + esi]
        R.sub((R.ebp >>> 0), R.m.u32(((R.ebx) | 0) >>> 0), 32); // 7549d1: cmp ebp, dword ptr [ebx]
        if (!R.zf) { pc = 0x7549fa; continue; } // 7549d3: jne 0x7549fa
        pc = 0x7549d5; continue;
      case 0x7549d5:
        R.ecx = (((R.ecx + R.ecx * 4) | 0)) | 0; // 7549d5: lea ecx, [ecx + ecx*4]
        R.esi = (((R.esi + R.ecx * 4) | 0)) | 0; // 7549d8: lea esi, [esi + ecx*4]
        R.esi = (((R.ecx + R.esi + -0x19) | 0)) | 0; // 7549db: lea esi, [ecx + esi - 0x19]
        R.ecx = (0x6) | 0; // 7549df: mov ecx, 6
        R.str('rep movsd'); // 7549e4: rep movsd dword ptr es:[edi], dword ptr [esi]
        R.str('movsb'); // 7549e6: movsb byte ptr es:[edi], byte ptr [esi]
        R.edi = (R.m.u32(((R.eax + 0x14) | 0) >>> 0)) | 0; // 7549e7: mov edi, dword ptr [eax + 0x14]
        R.esi = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 7549ea: mov esi, dword ptr [esp + 0x10]
        R.edi = (R.incdec((R.edi >>> 0), -1, 32)) | 0; // 7549ee: dec edi
        R.esi = (R.incdec((R.esi >>> 0), -1, 32)) | 0; // 7549ef: dec esi
        R.m.w32(((R.eax + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 7549f0: mov dword ptr [eax + 0x14], edi
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.esi >>> 0)); // 7549f3: mov dword ptr [esp + 0x10], esi
        R.edx = (R.sub((R.edx >>> 0), 0x19, 32)) | 0; // 7549f7: sub edx, 0x19
        pc = 0x7549fa; continue;
      case 0x7549fa:
        R.esi = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 7549fa: mov esi, dword ptr [esp + 0x10]
        R.ecx = (R.m.u32(((R.eax + 0x14) | 0) >>> 0)) | 0; // 7549fe: mov ecx, dword ptr [eax + 0x14]
        R.esi = (R.incdec((R.esi >>> 0), 1, 32)) | 0; // 754a01: inc esi
        R.edx = (R.add((R.edx >>> 0), 0x19, 32)) | 0; // 754a02: add edx, 0x19
        R.sub((R.esi >>> 0), (R.ecx >>> 0), 32); // 754a05: cmp esi, ecx
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.esi >>> 0)); // 754a07: mov dword ptr [esp + 0x10], esi
        if (R.cL) { pc = 0x7549c8; continue; } // 754a0b: jl 0x7549c8
        pc = 0x754a0d; continue;
      case 0x754a0d:
        R.edi = (R.pop()) | 0; // 754a0d: pop edi
        R.esi = (R.pop()) | 0; // 754a0e: pop esi
        R.ebp = (R.pop()) | 0; // 754a0f: pop ebp
        R.ebx = (R.pop()) | 0; // 754a10: pop ebx
        pc = 0x754a11; continue;
      case 0x754a11:
        R.ecx = (R.m.u32(((R.eax + 0x14) | 0) >>> 0)) | 0; // 754a11: mov ecx, dword ptr [eax + 0x14]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 754a14: test ecx, ecx
        if (R.zf) { pc = 0x754a2c; continue; } // 754a16: je 0x754a2c
        pc = 0x754a18; continue;
      case 0x754a18:
        R.eax = (R.m.u32(((R.eax + 0xc) | 0) >>> 0)) | 0; // 754a18: mov eax, dword ptr [eax + 0xc]
        R.push(0x757ea0); // 754a1b: push 0x757ea0
        R.push(0x19); // 754a20: push 0x19
        R.push((R.ecx >>> 0)); // 754a22: push ecx
        R.push((R.eax >>> 0)); // 754a23: push eax
        R.call(0x945333, { n: 4, thisEcx: false, calleeClean: false }); // 754a24: call 0x945333
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 754a29: add esp, 0x10
        pc = 0x754a2c; continue;
      case 0x754a2c:
        R.ecx = (R.pop()) | 0; // 754a2c: pop ecx
        return R.eax; // 754a2d: ret 4
      default: throw new Error(`f_7549b0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
