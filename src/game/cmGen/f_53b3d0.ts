// 0x53b3d0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 5e8290=9, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_53b3d0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x53b3d0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x53b3d0:
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 53b3d0: mov eax, dword ptr [esp + 4]
        R.esp = (R.sub((R.esp >>> 0), 0x200, 32)) | 0; // 53b3d4: sub esp, 0x200
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 53b3da: test eax, eax
        if (!R.zf) { pc = 0x53b410; continue; } // 53b3dc: jne 0x53b410
        pc = 0x53b3de; continue;
      case 0x53b3de:
        R.eax = (((R.esp) | 0)) | 0; // 53b3de: lea eax, [esp]
        R.ecx = (((R.esp + 0x100) | 0)) | 0; // 53b3e2: lea ecx, [esp + 0x100]
        R.push((R.eax >>> 0)); // 53b3e9: push eax
        R.push((R.ecx >>> 0)); // 53b3ea: push ecx
        R.push(0x0); // 53b3eb: push 0
        R.push(0x0); // 53b3ed: push 0
        R.push(0x9b5ac8); // 53b3ef: push 0x9b5ac8
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 53b3f4: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 53b3f9: add esp, 0x14
        R.edx = (((R.esp) | 0)) | 0; // 53b3fc: lea edx, [esp]
        R.eax = (((R.esp + 0x100) | 0)) | 0; // 53b400: lea eax, [esp + 0x100]
        R.push(0x3346); // 53b407: push 0x3346
        R.push((R.edx >>> 0)); // 53b40c: push edx
        R.push((R.eax >>> 0)); // 53b40d: push eax
        pc = 0x53b486; continue; // 53b40e: jmp 0x53b486
      case 0x53b410:
        R.ecx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 53b410: mov ecx, dword ptr [0xae23b4]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 53b416: test ecx, ecx
        if (!R.zf) { pc = 0x53b44c; continue; } // 53b418: jne 0x53b44c
        pc = 0x53b41a; continue;
      case 0x53b41a:
        R.ecx = (((R.esp + 0x100) | 0)) | 0; // 53b41a: lea ecx, [esp + 0x100]
        R.edx = (((R.esp) | 0)) | 0; // 53b421: lea edx, [esp]
        R.push((R.ecx >>> 0)); // 53b425: push ecx
        R.push((R.edx >>> 0)); // 53b426: push edx
        R.push(0x0); // 53b427: push 0
        R.push(0x0); // 53b429: push 0
        R.push(0x9b5ac8); // 53b42b: push 0x9b5ac8
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 53b430: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 53b435: add esp, 0x14
        R.eax = (((R.esp + 0x100) | 0)) | 0; // 53b438: lea eax, [esp + 0x100]
        R.ecx = (((R.esp) | 0)) | 0; // 53b43f: lea ecx, [esp]
        R.push(0x334d); // 53b443: push 0x334d
        R.push((R.eax >>> 0)); // 53b448: push eax
        R.push((R.ecx >>> 0)); // 53b449: push ecx
        pc = 0x53b486; continue; // 53b44a: jmp 0x53b486
      case 0x53b44c:
        R.edx = (R.m.u32(((0xae23a8) | 0) >>> 0)) | 0; // 53b44c: mov edx, dword ptr [0xae23a8]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 53b452: test edx, edx
        if (!R.zf) { pc = 0x53b4c2; continue; } // 53b454: jne 0x53b4c2
        pc = 0x53b456; continue;
      case 0x53b456:
        R.edx = (((R.esp + 0x100) | 0)) | 0; // 53b456: lea edx, [esp + 0x100]
        R.eax = (((R.esp) | 0)) | 0; // 53b45d: lea eax, [esp]
        R.push((R.edx >>> 0)); // 53b461: push edx
        R.push((R.eax >>> 0)); // 53b462: push eax
        R.push(0x0); // 53b463: push 0
        R.push(0x0); // 53b465: push 0
        R.push(0x9b5ac8); // 53b467: push 0x9b5ac8
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 53b46c: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 53b471: add esp, 0x14
        R.ecx = (((R.esp + 0x100) | 0)) | 0; // 53b474: lea ecx, [esp + 0x100]
        R.edx = (((R.esp) | 0)) | 0; // 53b47b: lea edx, [esp]
        R.push(0x3354); // 53b47f: push 0x3354
        R.push((R.ecx >>> 0)); // 53b484: push ecx
        R.push((R.edx >>> 0)); // 53b485: push edx
        pc = 0x53b486; continue;
      case 0x53b486:
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 53b486: call 0x90d130
        R.push((R.eax >>> 0)); // 53b48b: push eax
        R.push(0x9870e8); // 53b48c: push 0x9870e8
        R.push(0xae24d0); // 53b491: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 53b496: call 0x944c9f
        R.push(0x0); // 53b49b: push 0
        R.push(0xae24d0); // 53b49d: push 0xae24d0
        R.push(0x9870e0); // 53b4a2: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 53b4a7: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 53b4ac: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 53b4af: mov dword ptr [0xb67a34], 0
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53b4b9: xor eax, eax
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53b4bb: add esp, 0x200
        return R.ret(0); // 53b4c1: ret 
      case 0x53b4c2:
        R.edx = (R.m.u32(((0xae2350) | 0) >>> 0)) | 0; // 53b4c2: mov edx, dword ptr [0xae2350]
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 53b4c8: mov eax, dword ptr [eax]
        R.edx = (R.add((R.edx >>> 0), (R.edx >>> 0), 32)) | 0; // 53b4ca: add edx, edx
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 53b4cc: sub eax, edx
        R.edx = (R.m.u32(((0xae235c) | 0) >>> 0)) | 0; // 53b4ce: mov edx, dword ptr [0xae235c]
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 53b4d4: add eax, edx
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 53b4d6: lea edx, [eax + eax*8]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 53b4d9: shl edx, 4
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 53b4dc: add edx, eax
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 53b4de: add ecx, eax
        R.eax = (((R.ecx + R.edx * 4) | 0)) | 0; // 53b4e0: lea eax, [ecx + edx*4]
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53b4e3: add esp, 0x200
        return R.ret(0); // 53b4e9: ret 
      default: throw new Error(`f_53b3d0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
