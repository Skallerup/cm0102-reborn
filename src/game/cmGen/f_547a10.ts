// 0x547a10 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_547a10(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x547a10;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x547a10:
        R.push((R.ebx >>> 0)); // 547a10: push ebx
        R.ebx = (R.m.u32(((R.esp + 0x8) | 0) >>> 0)) | 0; // 547a11: mov ebx, dword ptr [esp + 8]
        R.push((R.esi >>> 0)); // 547a15: push esi
        R.push((R.edi >>> 0)); // 547a16: push edi
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 547a17: test ebx, ebx
        if (R.zf) { pc = 0x547adf; continue; } // 547a19: je 0x547adf
        pc = 0x547a1f; continue;
      case 0x547a1f:
        R.eax = (R.m.u32(((R.ebx + 0x65) | 0) >>> 0)) | 0; // 547a1f: mov eax, dword ptr [ebx + 0x65]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 547a22: test eax, eax
        if (R.zf) { pc = 0x547adf; continue; } // 547a24: je 0x547adf
        pc = 0x547a2a; continue;
      case 0x547a2a:
        R.esi = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 547a2a: mov esi, dword ptr [esp + 0x14]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 547a2e: test esi, esi
        if (R.zf) { pc = 0x547adf; continue; } // 547a30: je 0x547adf
        pc = 0x547a36; continue;
      case 0x547a36:
        R.edi = (R.m.u32(((R.eax + 0x1c) | 0) >>> 0)) | 0; // 547a36: mov edi, dword ptr [eax + 0x1c]
        R.sub((R.edi >>> 0), (R.esi >>> 0), 32); // 547a39: cmp edi, esi
        if (R.zf) { pc = 0x547adf; continue; } // 547a3b: je 0x547adf
        pc = 0x547a41; continue;
      case 0x547a41:
        R.edx = (R.m.u32(((R.eax + 0x20) | 0) >>> 0)) | 0; // 547a41: mov edx, dword ptr [eax + 0x20]
        R.sub((R.edx >>> 0), (R.esi >>> 0), 32); // 547a44: cmp edx, esi
        if (R.zf) { pc = 0x547adf; continue; } // 547a46: je 0x547adf
        pc = 0x547a4c; continue;
      case 0x547a4c:
        R.ecx = (R.m.u32(((R.eax + 0x24) | 0) >>> 0)) | 0; // 547a4c: mov ecx, dword ptr [eax + 0x24]
        R.sub((R.ecx >>> 0), (R.esi >>> 0), 32); // 547a4f: cmp ecx, esi
        if (R.zf) { pc = 0x547adf; continue; } // 547a51: je 0x547adf
        pc = 0x547a57; continue;
      case 0x547a57:
        R.sub(R.m.u32(((R.eax + 0x28) | 0) >>> 0), (R.esi >>> 0), 32); // 547a57: cmp dword ptr [eax + 0x28], esi
        if (!R.zf) { pc = 0x547a67; continue; } // 547a5a: jne 0x547a67
        pc = 0x547a5c; continue;
      case 0x547a5c:
        R.edi = (R.pop()) | 0; // 547a5c: pop edi
        R.esi = (R.pop()) | 0; // 547a5d: pop esi
        R.m.w32(((R.eax + 0x28) | 0) >>> 0, 0x0); // 547a5e: mov dword ptr [eax + 0x28], 0
        R.ebx = (R.pop()) | 0; // 547a65: pop ebx
        return R.ret(0); // 547a66: ret 
      case 0x547a67:
        R.sub(R.m.u32(((R.eax + 0x2c) | 0) >>> 0), (R.esi >>> 0), 32); // 547a67: cmp dword ptr [eax + 0x2c], esi
        if (!R.zf) { pc = 0x547a77; continue; } // 547a6a: jne 0x547a77
        pc = 0x547a6c; continue;
      case 0x547a6c:
        R.edi = (R.pop()) | 0; // 547a6c: pop edi
        R.esi = (R.pop()) | 0; // 547a6d: pop esi
        R.m.w32(((R.eax + 0x2c) | 0) >>> 0, 0x0); // 547a6e: mov dword ptr [eax + 0x2c], 0
        R.ebx = (R.pop()) | 0; // 547a75: pop ebx
        return R.ret(0); // 547a76: ret 
      case 0x547a77:
        R.sub(R.m.u32(((R.eax + 0x30) | 0) >>> 0), (R.esi >>> 0), 32); // 547a77: cmp dword ptr [eax + 0x30], esi
        if (!R.zf) { pc = 0x547a87; continue; } // 547a7a: jne 0x547a87
        pc = 0x547a7c; continue;
      case 0x547a7c:
        R.edi = (R.pop()) | 0; // 547a7c: pop edi
        R.esi = (R.pop()) | 0; // 547a7d: pop esi
        R.m.w32(((R.eax + 0x30) | 0) >>> 0, 0x0); // 547a7e: mov dword ptr [eax + 0x30], 0
        R.ebx = (R.pop()) | 0; // 547a85: pop ebx
        return R.ret(0); // 547a86: ret 
      case 0x547a87:
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 547a87: test edi, edi
        if (!R.zf) { pc = 0x547a92; continue; } // 547a89: jne 0x547a92
        pc = 0x547a8b; continue;
      case 0x547a8b:
        R.m.w32(((R.eax + 0x1c) | 0) >>> 0, (R.esi >>> 0)); // 547a8b: mov dword ptr [eax + 0x1c], esi
        R.edi = (R.pop()) | 0; // 547a8e: pop edi
        R.esi = (R.pop()) | 0; // 547a8f: pop esi
        R.ebx = (R.pop()) | 0; // 547a90: pop ebx
        return R.ret(0); // 547a91: ret 
      case 0x547a92:
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 547a92: test edx, edx
        if (!R.zf) { pc = 0x547a9d; continue; } // 547a94: jne 0x547a9d
        pc = 0x547a96; continue;
      case 0x547a96:
        R.m.w32(((R.eax + 0x20) | 0) >>> 0, (R.esi >>> 0)); // 547a96: mov dword ptr [eax + 0x20], esi
        R.edi = (R.pop()) | 0; // 547a99: pop edi
        R.esi = (R.pop()) | 0; // 547a9a: pop esi
        R.ebx = (R.pop()) | 0; // 547a9b: pop ebx
        return R.ret(0); // 547a9c: ret 
      case 0x547a9d:
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 547a9d: test ecx, ecx
        if (!R.zf) { pc = 0x547aa8; continue; } // 547a9f: jne 0x547aa8
        pc = 0x547aa1; continue;
      case 0x547aa1:
        R.m.w32(((R.eax + 0x24) | 0) >>> 0, (R.esi >>> 0)); // 547aa1: mov dword ptr [eax + 0x24], esi
        R.edi = (R.pop()) | 0; // 547aa4: pop edi
        R.esi = (R.pop()) | 0; // 547aa5: pop esi
        R.ebx = (R.pop()) | 0; // 547aa6: pop ebx
        return R.ret(0); // 547aa7: ret 
      case 0x547aa8:
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 547aa8: mov eax, dword ptr [esp + 0x18]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 547aac: test eax, eax
        if (R.zf) { pc = 0x547adf; continue; } // 547aae: je 0x547adf
        pc = 0x547ab0; continue;
      case 0x547ab0:
        R.push(0x3); // 547ab0: push 3
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 547ab2: call 0x90cfc0
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 547ab7: add esp, 4
        R.eax = (R.sub((R.eax >>> 0), 0x0, 32)) | 0; // 547aba: sub eax, 0
        if (R.zf) { pc = 0x547ad9; continue; } // 547abd: je 0x547ad9
        pc = 0x547abf; continue;
      case 0x547abf:
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 547abf: dec eax
        if (R.zf) { pc = 0x547acf; continue; } // 547ac0: je 0x547acf
        pc = 0x547ac2; continue;
      case 0x547ac2:
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 547ac2: dec eax
        if (!R.zf) { pc = 0x547adf; continue; } // 547ac3: jne 0x547adf
        pc = 0x547ac5; continue;
      case 0x547ac5:
        R.eax = (R.m.u32(((R.ebx + 0x65) | 0) >>> 0)) | 0; // 547ac5: mov eax, dword ptr [ebx + 0x65]
        R.edi = (R.pop()) | 0; // 547ac8: pop edi
        R.m.w32(((R.eax + 0x24) | 0) >>> 0, (R.esi >>> 0)); // 547ac9: mov dword ptr [eax + 0x24], esi
        R.esi = (R.pop()) | 0; // 547acc: pop esi
        R.ebx = (R.pop()) | 0; // 547acd: pop ebx
        return R.ret(0); // 547ace: ret 
      case 0x547acf:
        R.ecx = (R.m.u32(((R.ebx + 0x65) | 0) >>> 0)) | 0; // 547acf: mov ecx, dword ptr [ebx + 0x65]
        R.edi = (R.pop()) | 0; // 547ad2: pop edi
        R.m.w32(((R.ecx + 0x20) | 0) >>> 0, (R.esi >>> 0)); // 547ad3: mov dword ptr [ecx + 0x20], esi
        R.esi = (R.pop()) | 0; // 547ad6: pop esi
        R.ebx = (R.pop()) | 0; // 547ad7: pop ebx
        return R.ret(0); // 547ad8: ret 
      case 0x547ad9:
        R.edx = (R.m.u32(((R.ebx + 0x65) | 0) >>> 0)) | 0; // 547ad9: mov edx, dword ptr [ebx + 0x65]
        R.m.w32(((R.edx + 0x1c) | 0) >>> 0, (R.esi >>> 0)); // 547adc: mov dword ptr [edx + 0x1c], esi
        pc = 0x547adf; continue;
      case 0x547adf:
        R.edi = (R.pop()) | 0; // 547adf: pop edi
        R.esi = (R.pop()) | 0; // 547ae0: pop esi
        R.ebx = (R.pop()) | 0; // 547ae1: pop ebx
        return R.ret(0); // 547ae2: ret 
      default: throw new Error(`f_547a10: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
