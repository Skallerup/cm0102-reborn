// 0x53cc30 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 540a50=3, 5e8290=9, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_53cc30(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x53cc30;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x53cc30:
        R.esp = (R.sub((R.esp >>> 0), 0x200, 32)) | 0; // 53cc30: sub esp, 0x200
        R.push((R.esi >>> 0)); // 53cc36: push esi
        R.esi = (R.m.u32(((R.esp + 0x208) | 0) >>> 0)) | 0; // 53cc37: mov esi, dword ptr [esp + 0x208]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 53cc3e: test esi, esi
        if (!R.zf) { pc = 0x53cca8; continue; } // 53cc40: jne 0x53cca8
        pc = 0x53cc42; continue;
      case 0x53cc42:
        R.eax = (((R.esp + 0x4) | 0)) | 0; // 53cc42: lea eax, [esp + 4]
        R.ecx = (((R.esp + 0x104) | 0)) | 0; // 53cc46: lea ecx, [esp + 0x104]
        R.push((R.eax >>> 0)); // 53cc4d: push eax
        R.push((R.ecx >>> 0)); // 53cc4e: push ecx
        R.push((R.esi >>> 0)); // 53cc4f: push esi
        R.push((R.esi >>> 0)); // 53cc50: push esi
        R.push(0x9b5ac8); // 53cc51: push 0x9b5ac8
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 53cc56: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 53cc5b: add esp, 0x14
        R.edx = (((R.esp + 0x4) | 0)) | 0; // 53cc5e: lea edx, [esp + 4]
        R.eax = (((R.esp + 0x104) | 0)) | 0; // 53cc62: lea eax, [esp + 0x104]
        R.push(0x3997); // 53cc69: push 0x3997
        R.push((R.edx >>> 0)); // 53cc6e: push edx
        R.push((R.eax >>> 0)); // 53cc6f: push eax
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 53cc70: call 0x90d130
        R.push((R.eax >>> 0)); // 53cc75: push eax
        R.push(0x9870e8); // 53cc76: push 0x9870e8
        R.push(0xae24d0); // 53cc7b: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 53cc80: call 0x944c9f
        R.push((R.esi >>> 0)); // 53cc85: push esi
        R.push(0xae24d0); // 53cc86: push 0xae24d0
        R.push(0x9870e0); // 53cc8b: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 53cc90: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 53cc95: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, (R.esi >>> 0)); // 53cc98: mov dword ptr [0xb67a34], esi
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53cc9e: xor eax, eax
        R.esi = (R.pop()) | 0; // 53cca0: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53cca1: add esp, 0x200
        return R.eax; // 53cca7: ret 
      case 0x53cca8:
        R.push((R.ebx >>> 0)); // 53cca8: push ebx
        R.push((R.ebp >>> 0)); // 53cca9: push ebp
        R.push((R.edi >>> 0)); // 53ccaa: push edi
        R.push(0x1); // 53ccab: push 1
        R.push(0x0); // 53ccad: push 0
        R.push((R.esi >>> 0)); // 53ccaf: push esi
        R.call(0x540a50, { n: 3, thisEcx: false, calleeClean: false }); // 53ccb0: call 0x540a50
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 53ccb5: add esp, 0xc
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 53ccb8: test eax, eax
        if (R.zf) { pc = 0x53cd31; continue; } // 53ccba: je 0x53cd31
        pc = 0x53ccbc; continue;
      case 0x53ccbc:
        R.ebp = (R.m.u32(((R.esp + 0x218) | 0) >>> 0)) | 0; // 53ccbc: mov ebp, dword ptr [esp + 0x218]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) ^ ((R.ecx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 53ccc3: xor cl, cl
        R.esi = (R.add((R.esi >>> 0), 0x19f, 32)) | 0; // 53ccc5: add esi, 0x19f
        R.edi = (0x5) | 0; // 53cccb: mov edi, 5
        pc = 0x53ccd0; continue;
      case 0x53ccd0:
        R.edx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 53ccd0: mov edx, dword ptr [esi]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 53ccd2: test edx, edx
        if (R.zf) { pc = 0x53ccdf; continue; } // 53ccd4: je 0x53ccdf
        pc = 0x53ccd6; continue;
      case 0x53ccd6:
        R.ebx = (((((R.ecx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 53ccd6: movsx ebx, cl
        R.ecx = ((R.ecx & 0xffffff00) | (((R.incdec(((R.ecx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 53ccd9: inc cl
        R.m.w32(((R.ebp + R.ebx * 4) | 0) >>> 0, (R.edx >>> 0)); // 53ccdb: mov dword ptr [ebp + ebx*4], edx
        pc = 0x53ccdf; continue;
      case 0x53ccdf:
        R.esi = (R.add((R.esi >>> 0), 0x4, 32)) | 0; // 53ccdf: add esi, 4
        R.edi = (R.incdec((R.edi >>> 0), -1, 32)) | 0; // 53cce2: dec edi
        if (!R.zf) { pc = 0x53ccd0; continue; } // 53cce3: jne 0x53ccd0
        pc = 0x53cce5; continue;
      case 0x53cce5:
        R.ebx = ((R.ebx & 0xffffff00) | (((R.logic(((R.ebx >>> 0) & 0xff) ^ ((R.ebx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 53cce5: xor bl, bl
        pc = 0x53cce7; continue;
      case 0x53cce7:
        R.sub(((R.ecx >>> 0) & 0xff), 0x5, 8); // 53cce7: cmp cl, 5
        if (!R.cL) { pc = 0x53cd45; continue; } // 53ccea: jge 0x53cd45
        pc = 0x53ccec; continue;
      case 0x53ccec:
        R.edx = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 53ccec: movsx edx, bl
        R.edx = (R.m.u32(((R.eax + R.edx * 4 + 0x19f) | 0) >>> 0)) | 0; // 53ccef: mov edx, dword ptr [eax + edx*4 + 0x19f]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 53ccf6: test edx, edx
        if (R.zf) { pc = 0x53cd03; continue; } // 53ccf8: je 0x53cd03
        pc = 0x53ccfa; continue;
      case 0x53ccfa:
        R.esi = (((((R.ecx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 53ccfa: movsx esi, cl
        R.ecx = ((R.ecx & 0xffffff00) | (((R.incdec(((R.ecx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 53ccfd: inc cl
        R.m.w32(((R.ebp + R.esi * 4) | 0) >>> 0, (R.edx >>> 0)); // 53ccff: mov dword ptr [ebp + esi*4], edx
        pc = 0x53cd03; continue;
      case 0x53cd03:
        R.ebx = ((R.ebx & 0xffffff00) | (((R.incdec(((R.ebx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 53cd03: inc bl
        R.sub(((R.ebx >>> 0) & 0xff), 0x5, 8); // 53cd05: cmp bl, 5
        if (R.cL) { pc = 0x53cce7; continue; } // 53cd08: jl 0x53cce7
        pc = 0x53cd0a; continue;
      case 0x53cd0a:
        R.sub(((R.ecx >>> 0) & 0xff), 0x5, 8); // 53cd0a: cmp cl, 5
        if (!R.cL) { pc = 0x53cd45; continue; } // 53cd0d: jge 0x53cd45
        pc = 0x53cd0f; continue;
      case 0x53cd0f:
        R.eax = (((((R.ecx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 53cd0f: movsx eax, cl
        R.ecx = (0x5) | 0; // 53cd12: mov ecx, 5
        R.edi = (((R.ebp + R.eax * 4) | 0)) | 0; // 53cd17: lea edi, [ebp + eax*4]
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 53cd1b: sub ecx, eax
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53cd1d: xor eax, eax
        R.str('rep stosd'); // 53cd1f: rep stosd dword ptr es:[edi], eax
        R.edi = (R.pop()) | 0; // 53cd21: pop edi
        R.ebp = (R.pop()) | 0; // 53cd22: pop ebp
        R.ebx = (R.pop()) | 0; // 53cd23: pop ebx
        R.eax = (0x1) | 0; // 53cd24: mov eax, 1
        R.esi = (R.pop()) | 0; // 53cd29: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53cd2a: add esp, 0x200
        return R.eax; // 53cd30: ret 
      case 0x53cd31:
        R.edi = (R.m.u32(((R.esp + 0x218) | 0) >>> 0)) | 0; // 53cd31: mov edi, dword ptr [esp + 0x218]
        R.esi = (R.add((R.esi >>> 0), 0x19f, 32)) | 0; // 53cd38: add esi, 0x19f
        R.ecx = (0x5) | 0; // 53cd3e: mov ecx, 5
        R.str('rep movsd'); // 53cd43: rep movsd dword ptr es:[edi], dword ptr [esi]
        pc = 0x53cd45; continue;
      case 0x53cd45:
        R.edi = (R.pop()) | 0; // 53cd45: pop edi
        R.ebp = (R.pop()) | 0; // 53cd46: pop ebp
        R.ebx = (R.pop()) | 0; // 53cd47: pop ebx
        R.eax = (0x1) | 0; // 53cd48: mov eax, 1
        R.esi = (R.pop()) | 0; // 53cd4d: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53cd4e: add esp, 0x200
        return R.eax; // 53cd54: ret 
      default: throw new Error(`f_53cc30: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
