// 0x8cca10 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 68d020=0t, 68d040=0t, 68d080=0t, 68d1b0=0t, 8c5cf0=3tc, 8c5e40=2tc
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_8cca10(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x8cca10;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x8cca10:
        R.push(0xffffffff); // 8cca10: push -1
        R.push(0x963e98); // 8cca12: push 0x963e98
        R.eax = (0) | 0; // 8cca17: mov eax, dword ptr fs:[0]
        R.push((R.eax >>> 0)); // 8cca1d: push eax
        /* fs */ // 8cca1e: mov dword ptr fs:[0], esp
        R.esp = (R.sub((R.esp >>> 0), 0x10, 32)) | 0; // 8cca25: sub esp, 0x10
        R.push((R.ebx >>> 0)); // 8cca28: push ebx
        R.push((R.ebp >>> 0)); // 8cca29: push ebp
        R.push((R.esi >>> 0)); // 8cca2a: push esi
        R.esi = ((R.ecx >>> 0)) | 0; // 8cca2b: mov esi, ecx
        R.push((R.edi >>> 0)); // 8cca2d: push edi
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 8cca2e: lea ecx, [esp + 0x10]
        R.call(0x68d020, { n: 0, thisEcx: true, calleeClean: false }); // 8cca32: call 0x68d020
        R.ebp = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 8cca37: mov ebp, dword ptr [esp + 0x30]
        R.ecx = (R.m.u32(((R.esi + 0x86e) | 0) >>> 0)) | 0; // 8cca3b: mov ecx, dword ptr [esi + 0x86e]
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0x0); // 8cca41: mov dword ptr [esp + 0x28], 0
        R.eax = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 8cca49: mov eax, dword ptr [ebp]
        R.logic(R.m.u8(((R.ecx + R.eax * 8) | 0) >>> 0) & 0x10, 8); // 8cca4c: test byte ptr [ecx + eax*8], 0x10
        if (R.zf) { pc = 0x8ccb02; continue; } // 8cca50: je 0x8ccb02
        pc = 0x8cca56; continue;
      case 0x8cca56:
        R.edx = (((R.esp + 0x10) | 0)) | 0; // 8cca56: lea edx, [esp + 0x10]
        R.push(0x0); // 8cca5a: push 0
        R.push((R.edx >>> 0)); // 8cca5c: push edx
        R.push((R.ebp >>> 0)); // 8cca5d: push ebp
        R.ecx = ((R.esi >>> 0)) | 0; // 8cca5e: mov ecx, esi
        R.call(0x8c5cf0, { n: 3, thisEcx: true, calleeClean: true }); // 8cca60: call 0x8c5cf0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cca65: test eax, eax
        R.ebx = ((R.ebx & 0xffffff00) | (((0x13) & 0xff) << 0)) | 0; // 8cca67: mov bl, 0x13
        if (R.zf) { pc = 0x8ccaa6; continue; } // 8cca69: je 0x8ccaa6
        pc = 0x8cca6b; continue;
      case 0x8cca6b:
        R.eax = (R.m.u32(((R.esp + 0x12) | 0) >>> 0)) | 0; // 8cca6b: mov eax, dword ptr [esp + 0x12]
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 8cca6f: lea ecx, [esp + 0x10]
        R.m.w32(((R.esp + 0x1a) | 0) >>> 0, (R.eax >>> 0)); // 8cca73: mov dword ptr [esp + 0x1a], eax
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8cca77: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cca7c: test eax, eax
        if (R.zf) { pc = 0x8ccaa6; continue; } // 8cca7e: je 0x8ccaa6
        pc = 0x8cca80; continue;
      case 0x8cca80:
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8cca80: mov ecx, dword ptr [eax]
        R.edx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8cca82: mov edx, dword ptr [esi]
        R.ecx = (R.m.u32(((R.edx + R.ecx * 4) | 0) >>> 0)) | 0; // 8cca84: mov ecx, dword ptr [edx + ecx*4]
        R.sub(R.m.u8(((R.ecx + 0x2c) | 0) >>> 0), ((R.ebx >>> 0) & 0xff), 8); // 8cca87: cmp byte ptr [ecx + 0x2c], bl
        if (R.zf) { pc = 0x8cca9b; continue; } // 8cca8a: je 0x8cca9b
        pc = 0x8cca8c; continue;
      case 0x8cca8c:
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 8cca8c: lea ecx, [esp + 0x10]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8cca90: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cca95: test eax, eax
        if (!R.zf) { pc = 0x8cca80; continue; } // 8cca97: jne 0x8cca80
        pc = 0x8cca99; continue;
      case 0x8cca99:
        pc = 0x8ccaa6; continue; // 8cca99: jmp 0x8ccaa6
      case 0x8cca9b:
        R.edi = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8cca9b: mov edi, dword ptr [eax]
        R.sub((R.edi >>> 0), 0xffffffff, 32); // 8cca9d: cmp edi, -1
        if (!R.zf) { pc = 0x8ccb31; continue; } // 8ccaa0: jne 0x8ccb31
        pc = 0x8ccaa6; continue;
      case 0x8ccaa6:
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 8ccaa6: lea ecx, [esp + 0x10]
        R.call(0x68d080, { n: 0, thisEcx: true, calleeClean: false }); // 8ccaaa: call 0x68d080
        R.edx = (((R.esp + 0x10) | 0)) | 0; // 8ccaaf: lea edx, [esp + 0x10]
        R.ecx = ((R.esi >>> 0)) | 0; // 8ccab3: mov ecx, esi
        R.push((R.edx >>> 0)); // 8ccab5: push edx
        R.push((R.ebp >>> 0)); // 8ccab6: push ebp
        R.call(0x8c5e40, { n: 2, thisEcx: true, calleeClean: true }); // 8ccab7: call 0x8c5e40
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8ccabc: test eax, eax
        if (R.zf) { pc = 0x8ccaee; continue; } // 8ccabe: je 0x8ccaee
        pc = 0x8ccac0; continue;
      case 0x8ccac0:
        R.eax = (R.m.u32(((R.esp + 0x12) | 0) >>> 0)) | 0; // 8ccac0: mov eax, dword ptr [esp + 0x12]
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 8ccac4: lea ecx, [esp + 0x10]
        R.m.w32(((R.esp + 0x1a) | 0) >>> 0, (R.eax >>> 0)); // 8ccac8: mov dword ptr [esp + 0x1a], eax
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8ccacc: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8ccad1: test eax, eax
        if (R.zf) { pc = 0x8ccaee; continue; } // 8ccad3: je 0x8ccaee
        pc = 0x8ccad5; continue;
      case 0x8ccad5:
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8ccad5: mov ecx, dword ptr [eax]
        R.edx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8ccad7: mov edx, dword ptr [esi]
        R.ecx = (R.m.u32(((R.edx + R.ecx * 4) | 0) >>> 0)) | 0; // 8ccad9: mov ecx, dword ptr [edx + ecx*4]
        R.sub(R.m.u8(((R.ecx + 0x2c) | 0) >>> 0), ((R.ebx >>> 0) & 0xff), 8); // 8ccadc: cmp byte ptr [ecx + 0x2c], bl
        if (R.zf) { pc = 0x8ccb2a; continue; } // 8ccadf: je 0x8ccb2a
        pc = 0x8ccae1; continue;
      case 0x8ccae1:
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 8ccae1: lea ecx, [esp + 0x10]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8ccae5: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8ccaea: test eax, eax
        if (!R.zf) { pc = 0x8ccad5; continue; } // 8ccaec: jne 0x8ccad5
        pc = 0x8ccaee; continue;
      case 0x8ccaee:
        R.ecx = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 8ccaee: mov ecx, dword ptr [ebp]
        R.edx = (R.m.u32(((R.esi + 0x86e) | 0) >>> 0)) | 0; // 8ccaf1: mov edx, dword ptr [esi + 0x86e]
        R.eax = (((R.edx + R.ecx * 8) | 0)) | 0; // 8ccaf7: lea eax, [edx + ecx*8]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.edx + R.ecx * 8) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8ccafa: mov cl, byte ptr [edx + ecx*8]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0xef, 8)) & 0xff) << 0)) | 0; // 8ccafd: and cl, 0xef
        R.m.w8(((R.eax) | 0) >>> 0, ((R.ecx >>> 0) & 0xff)); // 8ccb00: mov byte ptr [eax], cl
        pc = 0x8ccb02; continue;
      case 0x8ccb02:
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 8ccb02: lea ecx, [esp + 0x10]
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0xffffffff); // 8ccb06: mov dword ptr [esp + 0x28], 0xffffffff
        R.call(0x68d040, { n: 0, thisEcx: true, calleeClean: false }); // 8ccb0e: call 0x68d040
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8ccb13: xor eax, eax
        pc = 0x8ccb15; continue;
      case 0x8ccb15:
        R.ecx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 8ccb15: mov ecx, dword ptr [esp + 0x20]
        R.edi = (R.pop()) | 0; // 8ccb19: pop edi
        R.esi = (R.pop()) | 0; // 8ccb1a: pop esi
        R.ebp = (R.pop()) | 0; // 8ccb1b: pop ebp
        R.ebx = (R.pop()) | 0; // 8ccb1c: pop ebx
        /* fs */ // 8ccb1d: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x1c, 32)) | 0; // 8ccb24: add esp, 0x1c
        return R.ret(2); // 8ccb27: ret 8
      case 0x8ccb2a:
        R.edi = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8ccb2a: mov edi, dword ptr [eax]
        R.sub((R.edi >>> 0), 0xffffffff, 32); // 8ccb2c: cmp edi, -1
        if (R.zf) { pc = 0x8ccaee; continue; } // 8ccb2f: je 0x8ccaee
        pc = 0x8ccb31; continue;
      case 0x8ccb31:
        R.ebx = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 8ccb31: mov ebx, dword ptr [esp + 0x34]
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 8ccb35: test ebx, ebx
        if (R.zf) { pc = 0x8ccb64; continue; } // 8ccb37: je 0x8ccb64
        pc = 0x8ccb39; continue;
      case 0x8ccb39:
        R.edx = (R.m.u32(((R.esi + 0x928) | 0) >>> 0)) | 0; // 8ccb39: mov edx, dword ptr [esi + 0x928]
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8ccb3f: xor eax, eax
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 8ccb41: test edx, edx
        if (R.cLE) { pc = 0x8ccb64; continue; } // 8ccb43: jle 0x8ccb64
        pc = 0x8ccb45; continue;
      case 0x8ccb45:
        R.esi = (R.m.u32(((R.esi + 0x920) | 0) >>> 0)) | 0; // 8ccb45: mov esi, dword ptr [esi + 0x920]
        R.ecx = (((R.esi + 0x8) | 0)) | 0; // 8ccb4b: lea ecx, [esi + 8]
        pc = 0x8ccb4e; continue;
      case 0x8ccb4e:
        R.sub(R.m.u32(((R.ecx) | 0) >>> 0), (R.edi >>> 0), 32); // 8ccb4e: cmp dword ptr [ecx], edi
        if (R.zf) { pc = 0x8ccb5c; continue; } // 8ccb50: je 0x8ccb5c
        pc = 0x8ccb52; continue;
      case 0x8ccb52:
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 8ccb52: inc eax
        R.ecx = (R.add((R.ecx >>> 0), 0xc, 32)) | 0; // 8ccb53: add ecx, 0xc
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 8ccb56: cmp eax, edx
        if (R.cL) { pc = 0x8ccb4e; continue; } // 8ccb58: jl 0x8ccb4e
        pc = 0x8ccb5a; continue;
      case 0x8ccb5a:
        pc = 0x8ccb64; continue; // 8ccb5a: jmp 0x8ccb64
      case 0x8ccb5c:
        R.edx = (((R.eax + R.eax * 2) | 0)) | 0; // 8ccb5c: lea edx, [eax + eax*2]
        R.eax = (((R.esi + R.edx * 4) | 0)) | 0; // 8ccb5f: lea eax, [esi + edx*4]
        R.m.w32(((R.ebx) | 0) >>> 0, (R.eax >>> 0)); // 8ccb62: mov dword ptr [ebx], eax
        pc = 0x8ccb64; continue;
      case 0x8ccb64:
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 8ccb64: lea ecx, [esp + 0x10]
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0xffffffff); // 8ccb68: mov dword ptr [esp + 0x28], 0xffffffff
        R.call(0x68d040, { n: 0, thisEcx: true, calleeClean: false }); // 8ccb70: call 0x68d040
        R.eax = (0x1) | 0; // 8ccb75: mov eax, 1
        pc = 0x8ccb15; continue; // 8ccb7a: jmp 0x8ccb15
      default: throw new Error(`f_8cca10: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
