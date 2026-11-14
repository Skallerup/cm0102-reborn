// 0x946464 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_946464(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x946464;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x946464:
        R.push((R.ebp >>> 0)); // 946464: push ebp
        R.ebp = ((R.esp >>> 0)) | 0; // 946465: mov ebp, esp
        R.eax = (R.m.u32(((R.ebp + 0x10) | 0) >>> 0)) | 0; // 946467: mov eax, dword ptr [ebp + 0x10]
        R.push((R.ebx >>> 0)); // 94646a: push ebx
        R.push((R.esi >>> 0)); // 94646b: push esi
        R.push((R.edi >>> 0)); // 94646c: push edi
        R.edi = (((R.eax + -0x1) | 0)) | 0; // 94646d: lea edi, [eax - 1]
        R.ecx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 946470: mov ecx, dword ptr [ebp + 0xc]
        { const p = BigInt(((R.m.u32(((R.ebp + 0x14) | 0) >>> 0)) | 0)) * BigInt((((R.edi >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.edi = (Number(BigInt.asIntN(32, p))) | 0; } // 946473: imul edi, dword ptr [ebp + 0x14]
        R.edi = (R.add((R.edi >>> 0), (R.ecx >>> 0), 32)) | 0; // 946477: add edi, ecx
        R.m.w32(((R.ebp + 0xc) | 0) >>> 0, (R.ecx >>> 0)); // 946479: mov dword ptr [ebp + 0xc], ecx
        R.sub((R.ecx >>> 0), (R.edi >>> 0), 32); // 94647c: cmp ecx, edi
        if (!R.cBE) { pc = 0x9464cb; continue; } // 94647e: ja 0x9464cb
        pc = 0x946480; continue;
      case 0x946480:
        R.ebx = ((R.eax >>> 0)) | 0; // 946480: mov ebx, eax
        R.ebx = (R.shr((R.ebx >>> 0), 0x1, 32)) | 0; // 946482: shr ebx, 1
        if (R.zf) { pc = 0x9464d6; continue; } // 946484: je 0x9464d6
        pc = 0x946486; continue;
      case 0x946486:
        R.m.w32(((R.ebp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 946486: mov dword ptr [ebp + 0x10], eax
        R.eax = ((R.ebx >>> 0)) | 0; // 946489: mov eax, ebx
        R.m.w32(((R.ebp + 0x10) | 0) >>> 0, R.logic(R.m.u32(((R.ebp + 0x10) | 0) >>> 0) & 0x1, 32)); // 94648b: and dword ptr [ebp + 0x10], 1
        if (!R.zf) { pc = 0x946494; continue; } // 94648f: jne 0x946494
        pc = 0x946491; continue;
      case 0x946491:
        R.eax = (((R.ebx + -0x1) | 0)) | 0; // 946491: lea eax, [ebx - 1]
        pc = 0x946494; continue;
      case 0x946494:
        { const p = BigInt(((R.m.u32(((R.ebp + 0x14) | 0) >>> 0)) | 0)) * BigInt((((R.eax >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.eax = (Number(BigInt.asIntN(32, p))) | 0; } // 946494: imul eax, dword ptr [ebp + 0x14]
        R.eax = (R.add((R.eax >>> 0), R.m.u32(((R.ebp + 0xc) | 0) >>> 0), 32)) | 0; // 946498: add eax, dword ptr [ebp + 0xc]
        R.esi = ((R.eax >>> 0)) | 0; // 94649b: mov esi, eax
        R.push((R.esi >>> 0)); // 94649d: push esi
        R.push(R.m.u32(((R.ebp + 0x8) | 0) >>> 0)); // 94649e: push dword ptr [ebp + 8]
        R.callInd(R.m.u32(((R.ebp + 0x18) | 0) >>> 0)); // 9464a1: call dword ptr [ebp + 0x18]
        R.ecx = (R.pop()) | 0; // 9464a4: pop ecx
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 9464a5: test eax, eax
        R.ecx = (R.pop()) | 0; // 9464a7: pop ecx
        if (R.zf) { pc = 0x9464d2; continue; } // 9464a8: je 0x9464d2
        pc = 0x9464aa; continue;
      case 0x9464aa:
        if (!R.cL) { pc = 0x9464bc; continue; } // 9464aa: jge 0x9464bc
        pc = 0x9464ac; continue;
      case 0x9464ac:
        R.esi = (R.sub((R.esi >>> 0), R.m.u32(((R.ebp + 0x14) | 0) >>> 0), 32)) | 0; // 9464ac: sub esi, dword ptr [ebp + 0x14]
        R.sub(R.m.u32(((R.ebp + 0x10) | 0) >>> 0), 0x0, 32); // 9464af: cmp dword ptr [ebp + 0x10], 0
        R.edi = ((R.esi >>> 0)) | 0; // 9464b3: mov edi, esi
        if (!R.zf) { pc = 0x9464c4; continue; } // 9464b5: jne 0x9464c4
        pc = 0x9464b7; continue;
      case 0x9464b7:
        R.eax = (((R.ebx + -0x1) | 0)) | 0; // 9464b7: lea eax, [ebx - 1]
        pc = 0x9464c6; continue; // 9464ba: jmp 0x9464c6
      case 0x9464bc:
        R.eax = (R.m.u32(((R.ebp + 0x14) | 0) >>> 0)) | 0; // 9464bc: mov eax, dword ptr [ebp + 0x14]
        R.esi = (R.add((R.esi >>> 0), (R.eax >>> 0), 32)) | 0; // 9464bf: add esi, eax
        R.m.w32(((R.ebp + 0xc) | 0) >>> 0, (R.esi >>> 0)); // 9464c1: mov dword ptr [ebp + 0xc], esi
        pc = 0x9464c4; continue;
      case 0x9464c4:
        R.eax = ((R.ebx >>> 0)) | 0; // 9464c4: mov eax, ebx
        pc = 0x9464c6; continue;
      case 0x9464c6:
        R.sub(R.m.u32(((R.ebp + 0xc) | 0) >>> 0), (R.edi >>> 0), 32); // 9464c6: cmp dword ptr [ebp + 0xc], edi
        if (R.cBE) { pc = 0x946480; continue; } // 9464c9: jbe 0x946480
        pc = 0x9464cb; continue;
      case 0x9464cb:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 9464cb: xor eax, eax
        pc = 0x9464cd; continue;
      case 0x9464cd:
        R.edi = (R.pop()) | 0; // 9464cd: pop edi
        R.esi = (R.pop()) | 0; // 9464ce: pop esi
        R.ebx = (R.pop()) | 0; // 9464cf: pop ebx
        R.ebp = (R.pop()) | 0; // 9464d0: pop ebp
        return R.ret(0); // 9464d1: ret 
      case 0x9464d2:
        R.eax = ((R.esi >>> 0)) | 0; // 9464d2: mov eax, esi
        pc = 0x9464cd; continue; // 9464d4: jmp 0x9464cd
      case 0x9464d6:
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 9464d6: test eax, eax
        if (R.zf) { pc = 0x9464cb; continue; } // 9464d8: je 0x9464cb
        pc = 0x9464da; continue;
      case 0x9464da:
        R.push(R.m.u32(((R.ebp + 0xc) | 0) >>> 0)); // 9464da: push dword ptr [ebp + 0xc]
        R.push(R.m.u32(((R.ebp + 0x8) | 0) >>> 0)); // 9464dd: push dword ptr [ebp + 8]
        R.callInd(R.m.u32(((R.ebp + 0x18) | 0) >>> 0)); // 9464e0: call dword ptr [ebp + 0x18]
        R.eax = (R.neg((R.eax >>> 0), 32)) | 0; // 9464e3: neg eax
        R.eax = (R.sub((R.eax >>> 0), (R.eax >>> 0), 32, R.cf ? 1 : 0)) | 0; // 9464e5: sbb eax, eax
        R.ecx = (R.pop()) | 0; // 9464e7: pop ecx
        R.eax = (~(R.eax >>> 0)) | 0; // 9464e8: not eax
        R.eax = (R.logic((R.eax >>> 0) & R.m.u32(((R.ebp + 0xc) | 0) >>> 0), 32)) | 0; // 9464ea: and eax, dword ptr [ebp + 0xc]
        R.ecx = (R.pop()) | 0; // 9464ed: pop ecx
        pc = 0x9464cd; continue; // 9464ee: jmp 0x9464cd
      default: throw new Error(`f_946464: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
