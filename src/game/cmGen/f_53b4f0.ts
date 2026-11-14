// 0x53b4f0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 5e8290=9, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_53b4f0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x53b4f0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x53b4f0:
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 53b4f0: mov eax, dword ptr [esp + 4]
        R.esp = (R.sub((R.esp >>> 0), 0x200, 32)) | 0; // 53b4f4: sub esp, 0x200
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 53b4fa: test eax, eax
        if (!R.zf) { pc = 0x53b530; continue; } // 53b4fc: jne 0x53b530
        pc = 0x53b4fe; continue;
      case 0x53b4fe:
        R.eax = (((R.esp) | 0)) | 0; // 53b4fe: lea eax, [esp]
        R.ecx = (((R.esp + 0x100) | 0)) | 0; // 53b502: lea ecx, [esp + 0x100]
        R.push((R.eax >>> 0)); // 53b509: push eax
        R.push((R.ecx >>> 0)); // 53b50a: push ecx
        R.push(0x0); // 53b50b: push 0
        R.push(0x0); // 53b50d: push 0
        R.push(0x9b5ac8); // 53b50f: push 0x9b5ac8
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 53b514: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 53b519: add esp, 0x14
        R.edx = (((R.esp) | 0)) | 0; // 53b51c: lea edx, [esp]
        R.eax = (((R.esp + 0x100) | 0)) | 0; // 53b520: lea eax, [esp + 0x100]
        R.push(0x3368); // 53b527: push 0x3368
        R.push((R.edx >>> 0)); // 53b52c: push edx
        R.push((R.eax >>> 0)); // 53b52d: push eax
        pc = 0x53b5a6; continue; // 53b52e: jmp 0x53b5a6
      case 0x53b530:
        R.ecx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 53b530: mov ecx, dword ptr [0xae23b4]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 53b536: test ecx, ecx
        if (!R.zf) { pc = 0x53b56c; continue; } // 53b538: jne 0x53b56c
        pc = 0x53b53a; continue;
      case 0x53b53a:
        R.ecx = (((R.esp + 0x100) | 0)) | 0; // 53b53a: lea ecx, [esp + 0x100]
        R.edx = (((R.esp) | 0)) | 0; // 53b541: lea edx, [esp]
        R.push((R.ecx >>> 0)); // 53b545: push ecx
        R.push((R.edx >>> 0)); // 53b546: push edx
        R.push(0x0); // 53b547: push 0
        R.push(0x0); // 53b549: push 0
        R.push(0x9b5ac8); // 53b54b: push 0x9b5ac8
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 53b550: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 53b555: add esp, 0x14
        R.eax = (((R.esp + 0x100) | 0)) | 0; // 53b558: lea eax, [esp + 0x100]
        R.ecx = (((R.esp) | 0)) | 0; // 53b55f: lea ecx, [esp]
        R.push(0x336f); // 53b563: push 0x336f
        R.push((R.eax >>> 0)); // 53b568: push eax
        R.push((R.ecx >>> 0)); // 53b569: push ecx
        pc = 0x53b5a6; continue; // 53b56a: jmp 0x53b5a6
      case 0x53b56c:
        R.edx = (R.m.u32(((0xae23a8) | 0) >>> 0)) | 0; // 53b56c: mov edx, dword ptr [0xae23a8]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 53b572: test edx, edx
        if (!R.zf) { pc = 0x53b5e2; continue; } // 53b574: jne 0x53b5e2
        pc = 0x53b576; continue;
      case 0x53b576:
        R.edx = (((R.esp + 0x100) | 0)) | 0; // 53b576: lea edx, [esp + 0x100]
        R.eax = (((R.esp) | 0)) | 0; // 53b57d: lea eax, [esp]
        R.push((R.edx >>> 0)); // 53b581: push edx
        R.push((R.eax >>> 0)); // 53b582: push eax
        R.push(0x0); // 53b583: push 0
        R.push(0x0); // 53b585: push 0
        R.push(0x9b5ac8); // 53b587: push 0x9b5ac8
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 53b58c: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 53b591: add esp, 0x14
        R.ecx = (((R.esp + 0x100) | 0)) | 0; // 53b594: lea ecx, [esp + 0x100]
        R.edx = (((R.esp) | 0)) | 0; // 53b59b: lea edx, [esp]
        R.push(0x3376); // 53b59f: push 0x3376
        R.push((R.ecx >>> 0)); // 53b5a4: push ecx
        R.push((R.edx >>> 0)); // 53b5a5: push edx
        pc = 0x53b5a6; continue;
      case 0x53b5a6:
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 53b5a6: call 0x90d130
        R.push((R.eax >>> 0)); // 53b5ab: push eax
        R.push(0x9870e8); // 53b5ac: push 0x9870e8
        R.push(0xae24d0); // 53b5b1: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 53b5b6: call 0x944c9f
        R.push(0x0); // 53b5bb: push 0
        R.push(0xae24d0); // 53b5bd: push 0xae24d0
        R.push(0x9870e0); // 53b5c2: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 53b5c7: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 53b5cc: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 53b5cf: mov dword ptr [0xb67a34], 0
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53b5d9: xor eax, eax
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53b5db: add esp, 0x200
        return R.eax; // 53b5e1: ret 
      case 0x53b5e2:
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 53b5e2: mov eax, dword ptr [eax]
        R.edx = (R.m.u32(((0xae2350) | 0) >>> 0)) | 0; // 53b5e4: mov edx, dword ptr [0xae2350]
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 53b5ea: sub eax, edx
        R.edx = (R.m.u32(((0xae235c) | 0) >>> 0)) | 0; // 53b5ec: mov edx, dword ptr [0xae235c]
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 53b5f2: add eax, edx
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 53b5f4: lea edx, [eax + eax*8]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 53b5f7: shl edx, 4
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 53b5fa: add edx, eax
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 53b5fc: add ecx, eax
        R.eax = (((R.ecx + R.edx * 4) | 0)) | 0; // 53b5fe: lea eax, [ecx + edx*4]
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53b601: add esp, 0x200
        return R.eax; // 53b607: ret 
      default: throw new Error(`f_53b4f0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
