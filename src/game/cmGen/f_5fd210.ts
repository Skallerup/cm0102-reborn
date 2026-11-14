// 0x5fd210 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 5e8290=9, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_5fd210(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x5fd210;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x5fd210:
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 5fd210: mov eax, dword ptr [esp + 4]
        R.esp = (R.sub((R.esp >>> 0), 0x200, 32)) | 0; // 5fd214: sub esp, 0x200
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5fd21a: test eax, eax
        if (!R.zf) { pc = 0x5fd2a5; continue; } // 5fd21c: jne 0x5fd2a5
        pc = 0x5fd222; continue;
      case 0x5fd222:
        R.eax = (((R.m.u16(((0xb77c7a) | 0) >>> 0)) << 16 >> 16)) | 0; // 5fd222: movsx eax, word ptr [0xb77c7a]
        R.eax = (((R.eax + R.eax * 2) | 0)) | 0; // 5fd229: lea eax, [eax + eax*2]
        R.eax = (R.shl((R.eax >>> 0), 0x8, 32)) | 0; // 5fd22c: shl eax, 8
        R.eax = (R.m.u32(((R.eax + 0xb74c26) | 0) >>> 0)) | 0; // 5fd22f: mov eax, dword ptr [eax + 0xb74c26]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5fd235: test eax, eax
        if (!R.zf) { pc = 0x5fd2a5; continue; } // 5fd237: jne 0x5fd2a5
        pc = 0x5fd239; continue;
      case 0x5fd239:
        R.ecx = (((R.esp) | 0)) | 0; // 5fd239: lea ecx, [esp]
        R.edx = (((R.esp + 0x100) | 0)) | 0; // 5fd23d: lea edx, [esp + 0x100]
        R.push((R.ecx >>> 0)); // 5fd244: push ecx
        R.push((R.edx >>> 0)); // 5fd245: push edx
        R.push((R.eax >>> 0)); // 5fd246: push eax
        R.push((R.eax >>> 0)); // 5fd247: push eax
        R.push(0x9cf11c); // 5fd248: push 0x9cf11c
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 5fd24d: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 5fd252: add esp, 0x14
        R.eax = (((R.esp) | 0)) | 0; // 5fd255: lea eax, [esp]
        R.ecx = (((R.esp + 0x100) | 0)) | 0; // 5fd259: lea ecx, [esp + 0x100]
        R.push(0x3e7); // 5fd260: push 0x3e7
        R.push((R.eax >>> 0)); // 5fd265: push eax
        R.push((R.ecx >>> 0)); // 5fd266: push ecx
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 5fd267: call 0x90d130
        R.push((R.eax >>> 0)); // 5fd26c: push eax
        R.push(0x9870e8); // 5fd26d: push 0x9870e8
        R.push(0xae24d0); // 5fd272: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 5fd277: call 0x944c9f
        R.push(0x0); // 5fd27c: push 0
        R.push(0xae24d0); // 5fd27e: push 0xae24d0
        R.push(0x9870e0); // 5fd283: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 5fd288: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 5fd28d: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 5fd290: mov dword ptr [0xb67a34], 0
        pc = 0x5fd29a; continue;
      case 0x5fd29a:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 5fd29a: xor eax, eax
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 5fd29c: add esp, 0x200
        return R.ret(1); // 5fd2a2: ret 4
      case 0x5fd2a5:
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 5fd2a5: mov edx, dword ptr [eax]
        R.eax = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 5fd2a7: mov eax, dword ptr [0xae2364]
        R.edx = (R.sub((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 5fd2ac: sub edx, eax
        R.edx = (R.add((R.edx >>> 0), 0x10, 32)) | 0; // 5fd2ae: add edx, 0x10
        if (R.sf) { pc = 0x5fd29a; continue; } // 5fd2b1: js 0x5fd29a
        pc = 0x5fd2b3; continue;
      case 0x5fd2b3:
        R.eax = (R.m.u32(((R.ecx + 0x4) | 0) >>> 0)) | 0; // 5fd2b3: mov eax, dword ptr [ecx + 4]
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 5fd2b6: dec eax
        R.sub((R.edx >>> 0), (R.eax >>> 0), 32); // 5fd2b7: cmp edx, eax
        if (!R.cLE) { pc = 0x5fd29a; continue; } // 5fd2b9: jg 0x5fd29a
        pc = 0x5fd2bb; continue;
      case 0x5fd2bb:
        R.eax = (((R.edx + R.edx * 4) | 0)) | 0; // 5fd2bb: lea eax, [edx + edx*4]
        R.eax = (((R.eax + R.eax * 8) | 0)) | 0; // 5fd2be: lea eax, [eax + eax*8]
        R.eax = (R.shl((R.eax >>> 0), 0x1, 32)) | 0; // 5fd2c1: shl eax, 1
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 5fd2c3: sub eax, edx
        R.eax = (R.shl((R.eax >>> 0), 0x5, 32)) | 0; // 5fd2c5: shl eax, 5
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 5fd2c8: add eax, edx
        R.eax = (((R.eax + R.eax * 2) | 0)) | 0; // 5fd2ca: lea eax, [eax + eax*2]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 5fd2cd: lea edx, [eax + eax*4]
        R.eax = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 5fd2d0: mov eax, dword ptr [ecx]
        R.eax = (R.m.u32(((R.edx + R.eax + 0x9a01) | 0) >>> 0)) | 0; // 5fd2d2: mov eax, dword ptr [edx + eax + 0x9a01]
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 5fd2d9: add esp, 0x200
        return R.ret(1); // 5fd2df: ret 4
      default: throw new Error(`f_5fd210: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
