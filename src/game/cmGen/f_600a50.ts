// 0x600a50 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 53b3d0=1, 53b900=1, 5409b0=1, 5e8290=9, 5fd480=1c, 5fd6b0=2c, 5fe040=1c, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_600a50(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x600a50;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x600a50:
        R.esp = (R.sub((R.esp >>> 0), 0x200, 32)) | 0; // 600a50: sub esp, 0x200
        R.push((R.ebx >>> 0)); // 600a56: push ebx
        R.push((R.ebp >>> 0)); // 600a57: push ebp
        R.push((R.esi >>> 0)); // 600a58: push esi
        R.push((R.edi >>> 0)); // 600a59: push edi
        R.edi = (R.m.u32(((R.esp + 0x214) | 0) >>> 0)) | 0; // 600a5a: mov edi, dword ptr [esp + 0x214]
        R.ebx = (R.logic((R.ebx >>> 0) ^ (R.ebx >>> 0), 32)) | 0; // 600a61: xor ebx, ebx
        R.sub((R.edi >>> 0), (R.ebx >>> 0), 32); // 600a63: cmp edi, ebx
        if (R.zf) { pc = 0x600c0f; continue; } // 600a65: je 0x600c0f
        pc = 0x600a6b; continue;
      case 0x600a6b:
        R.ebp = (R.m.u32(((R.esp + 0x224) | 0) >>> 0)) | 0; // 600a6b: mov ebp, dword ptr [esp + 0x224]
        R.esi = (R.m.u32(((R.esp + 0x220) | 0) >>> 0)) | 0; // 600a72: mov esi, dword ptr [esp + 0x220]
        pc = 0x600a79; continue;
      case 0x600a79:
        R.sub((R.esi >>> 0), (R.ebx >>> 0), 32); // 600a79: cmp esi, ebx
        if (!R.zf) { pc = 0x600a83; continue; } // 600a7b: jne 0x600a83
        pc = 0x600a7d; continue;
      case 0x600a7d:
        R.esi = (R.m.u32(((R.edi + 0xcf) | 0) >>> 0)) | 0; // 600a7d: mov esi, dword ptr [edi + 0xcf]
        pc = 0x600a83; continue;
      case 0x600a83:
        R.eax = (R.m.u32(((R.edi + 0xcf) | 0) >>> 0)) | 0; // 600a83: mov eax, dword ptr [edi + 0xcf]
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 600a89: cmp eax, ebx
        if (R.zf) { pc = 0x600be5; continue; } // 600a8b: je 0x600be5
        pc = 0x600a91; continue;
      case 0x600a91:
        R.sub((R.esi >>> 0), (R.eax >>> 0), 32); // 600a91: cmp esi, eax
        if (!R.zf) { pc = 0x600be5; continue; } // 600a93: jne 0x600be5
        pc = 0x600a99; continue;
      case 0x600a99:
        R.eax = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 600a99: mov eax, dword ptr [0xae2364]
        R.ecx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 600a9e: mov ecx, dword ptr [esi]
        R.eax = (R.add((R.eax >>> 0), 0xfffffff0, 32)) | 0; // 600aa0: add eax, -0x10
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 600aa3: cmp ecx, eax
        if (R.cL) { pc = 0x600be5; continue; } // 600aa5: jl 0x600be5
        pc = 0x600aab; continue;
      case 0x600aab:
        R.sub(R.m.u32(((R.esp + 0x218) | 0) >>> 0), (R.ebx >>> 0), 32); // 600aab: cmp dword ptr [esp + 0x218], ebx
        if (!R.zf) { pc = 0x600b83; continue; } // 600ab2: jne 0x600b83
        pc = 0x600ab8; continue;
      case 0x600ab8:
        R.ecx = (R.m.u32(((0xb63c98) | 0) >>> 0)) | 0; // 600ab8: mov ecx, dword ptr [0xb63c98]
        R.push((R.esi >>> 0)); // 600abe: push esi
        R.call(0x5fe040, { n: 1, thisEcx: false, calleeClean: true }); // 600abf: call 0x5fe040
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 600ac4: test eax, eax
        if (!R.zf) { pc = 0x600be5; continue; } // 600ac6: jne 0x600be5
        pc = 0x600acc; continue;
      case 0x600acc:
        R.edx = (R.m.u32(((0xb63c98) | 0) >>> 0)) | 0; // 600acc: mov edx, dword ptr [0xb63c98]
        R.sub((R.esi >>> 0), (R.ebx >>> 0), 32); // 600ad2: cmp esi, ebx
        R.eax = ((R.esi >>> 0)) | 0; // 600ad4: mov eax, esi
        if (!R.zf) { pc = 0x600b4d; continue; } // 600ad6: jne 0x600b4d
        pc = 0x600ad8; continue;
      case 0x600ad8:
        R.eax = (((R.m.u16(((0xb77c7a) | 0) >>> 0)) << 16 >> 16)) | 0; // 600ad8: movsx eax, word ptr [0xb77c7a]
        R.ecx = (((R.eax + R.eax * 2) | 0)) | 0; // 600adf: lea ecx, [eax + eax*2]
        R.ecx = (R.shl((R.ecx >>> 0), 0x8, 32)) | 0; // 600ae2: shl ecx, 8
        R.eax = (R.m.u32(((R.ecx + 0xb74c26) | 0) >>> 0)) | 0; // 600ae5: mov eax, dword ptr [ecx + 0xb74c26]
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 600aeb: cmp eax, ebx
        if (!R.zf) { pc = 0x600b4d; continue; } // 600aed: jne 0x600b4d
        pc = 0x600aef; continue;
      case 0x600aef:
        R.edx = (((R.esp + 0x10) | 0)) | 0; // 600aef: lea edx, [esp + 0x10]
        R.eax = (((R.esp + 0x110) | 0)) | 0; // 600af3: lea eax, [esp + 0x110]
        R.push((R.edx >>> 0)); // 600afa: push edx
        R.push((R.eax >>> 0)); // 600afb: push eax
        R.push((R.ebx >>> 0)); // 600afc: push ebx
        R.push((R.ebx >>> 0)); // 600afd: push ebx
        R.push(0x9cf11c); // 600afe: push 0x9cf11c
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 600b03: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 600b08: add esp, 0x14
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 600b0b: lea ecx, [esp + 0x10]
        R.edx = (((R.esp + 0x110) | 0)) | 0; // 600b0f: lea edx, [esp + 0x110]
        R.push(0x3e7); // 600b16: push 0x3e7
        R.push((R.ecx >>> 0)); // 600b1b: push ecx
        R.push((R.edx >>> 0)); // 600b1c: push edx
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 600b1d: call 0x90d130
        R.push((R.eax >>> 0)); // 600b22: push eax
        R.push(0x9870e8); // 600b23: push 0x9870e8
        R.push(0xae24d0); // 600b28: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 600b2d: call 0x944c9f
        R.push((R.ebx >>> 0)); // 600b32: push ebx
        R.push(0xae24d0); // 600b33: push 0xae24d0
        R.push(0x9870e0); // 600b38: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 600b3d: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 600b42: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, (R.ebx >>> 0)); // 600b45: mov dword ptr [0xb67a34], ebx
        pc = 0x600b83; continue; // 600b4b: jmp 0x600b83
      case 0x600b4d:
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 600b4d: mov ecx, dword ptr [eax]
        R.eax = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 600b4f: mov eax, dword ptr [0xae2364]
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 600b54: sub ecx, eax
        R.ecx = (R.add((R.ecx >>> 0), 0x10, 32)) | 0; // 600b56: add ecx, 0x10
        if (R.sf) { pc = 0x600b83; continue; } // 600b59: js 0x600b83
        pc = 0x600b5b; continue;
      case 0x600b5b:
        R.eax = (R.m.u32(((R.edx + 0x4) | 0) >>> 0)) | 0; // 600b5b: mov eax, dword ptr [edx + 4]
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 600b5e: dec eax
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 600b5f: cmp ecx, eax
        if (!R.cLE) { pc = 0x600b83; continue; } // 600b61: jg 0x600b83
        pc = 0x600b63; continue;
      case 0x600b63:
        R.eax = (((R.ecx + R.ecx * 4) | 0)) | 0; // 600b63: lea eax, [ecx + ecx*4]
        R.edx = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 600b66: mov edx, dword ptr [edx]
        R.eax = (((R.eax + R.eax * 8) | 0)) | 0; // 600b68: lea eax, [eax + eax*8]
        R.eax = (R.shl((R.eax >>> 0), 0x1, 32)) | 0; // 600b6b: shl eax, 1
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 600b6d: sub eax, ecx
        R.eax = (R.shl((R.eax >>> 0), 0x5, 32)) | 0; // 600b6f: shl eax, 5
        R.eax = (R.add((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 600b72: add eax, ecx
        R.eax = (((R.eax + R.eax * 2) | 0)) | 0; // 600b74: lea eax, [eax + eax*2]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 600b77: lea ecx, [eax + eax*4]
        R.sub(R.m.u32(((R.ecx + R.edx + 0x9a01) | 0) >>> 0), (R.ebx >>> 0), 32); // 600b7a: cmp dword ptr [ecx + edx + 0x9a01], ebx
        if (!R.zf) { pc = 0x600be5; continue; } // 600b81: jne 0x600be5
        pc = 0x600b83; continue;
      case 0x600b83:
        R.push((R.edi >>> 0)); // 600b83: push edi
        R.call(0x53b900, { n: 1, thisEcx: false, calleeClean: false }); // 600b84: call 0x53b900
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 600b89: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 600b8c: test eax, eax
        if (R.zf) { pc = 0x600bbc; continue; } // 600b8e: je 0x600bbc
        pc = 0x600b90; continue;
      case 0x600b90:
        R.sub((R.ebp >>> 0), (R.ebx >>> 0), 32); // 600b90: cmp ebp, ebx
        if (!R.zf) { pc = 0x600c78; continue; } // 600b92: jne 0x600c78
        pc = 0x600b98; continue;
      case 0x600b98:
        R.sub(R.m.u8(((R.esp + 0x21c) | 0) >>> 0), ((R.ebx >>> 0) & 0xff), 8); // 600b98: cmp byte ptr [esp + 0x21c], bl
        if (!R.zf) { pc = 0x600c78; continue; } // 600b9f: jne 0x600c78
        pc = 0x600ba5; continue;
      case 0x600ba5:
        R.ecx = (R.m.u32(((0xb63c98) | 0) >>> 0)) | 0; // 600ba5: mov ecx, dword ptr [0xb63c98]
        R.push((R.ebx >>> 0)); // 600bab: push ebx
        R.push((R.esi >>> 0)); // 600bac: push esi
        R.call(0x5fd6b0, { n: 2, thisEcx: false, calleeClean: true }); // 600bad: call 0x5fd6b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 600bb2: test eax, eax
        if (!R.zf) { pc = 0x600c78; continue; } // 600bb4: jne 0x600c78
        pc = 0x600bba; continue;
      case 0x600bba:
        pc = 0x600be5; continue; // 600bba: jmp 0x600be5
      case 0x600bbc:
        R.sub((R.ebp >>> 0), (R.ebx >>> 0), 32); // 600bbc: cmp ebp, ebx
        if (!R.zf) { pc = 0x600c78; continue; } // 600bbe: jne 0x600c78
        pc = 0x600bc4; continue;
      case 0x600bc4:
        R.sub(R.m.u8(((R.esp + 0x21c) | 0) >>> 0), ((R.ebx >>> 0) & 0xff), 8); // 600bc4: cmp byte ptr [esp + 0x21c], bl
        if (!R.zf) { pc = 0x600c78; continue; } // 600bcb: jne 0x600c78
        pc = 0x600bd1; continue;
      case 0x600bd1:
        R.ecx = (R.m.u32(((0xb63c98) | 0) >>> 0)) | 0; // 600bd1: mov ecx, dword ptr [0xb63c98]
        R.push((R.esi >>> 0)); // 600bd7: push esi
        R.call(0x5fd480, { n: 1, thisEcx: false, calleeClean: true }); // 600bd8: call 0x5fd480
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 600bdd: test eax, eax
        if (!R.zf) { pc = 0x600c78; continue; } // 600bdf: jne 0x600c78
        pc = 0x600be5; continue;
      case 0x600be5:
        R.push((R.edi >>> 0)); // 600be5: push edi
        R.call(0x5409b0, { n: 1, thisEcx: false, calleeClean: false }); // 600be6: call 0x5409b0
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 600beb: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 600bee: test eax, eax
        if (R.zf) { pc = 0x600c6b; continue; } // 600bf0: je 0x600c6b
        pc = 0x600bf2; continue;
      case 0x600bf2:
        R.eax = (R.m.u32(((R.edi + 0x53) | 0) >>> 0)) | 0; // 600bf2: mov eax, dword ptr [edi + 0x53]
        R.m.w8(((R.esp + 0x21c) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 600bf5: mov byte ptr [esp + 0x21c], bl
        R.push((R.eax >>> 0)); // 600bfc: push eax
        R.call(0x53b3d0, { n: 1, thisEcx: false, calleeClean: false }); // 600bfd: call 0x53b3d0
        R.edi = ((R.eax >>> 0)) | 0; // 600c02: mov edi, eax
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 600c04: add esp, 4
        R.sub((R.edi >>> 0), (R.ebx >>> 0), 32); // 600c07: cmp edi, ebx
        if (!R.zf) { pc = 0x600a79; continue; } // 600c09: jne 0x600a79
        pc = 0x600c0f; continue;
      case 0x600c0f:
        R.ecx = (((R.esp + 0x110) | 0)) | 0; // 600c0f: lea ecx, [esp + 0x110]
        R.edx = (((R.esp + 0x10) | 0)) | 0; // 600c16: lea edx, [esp + 0x10]
        R.push((R.ecx >>> 0)); // 600c1a: push ecx
        R.push((R.edx >>> 0)); // 600c1b: push edx
        R.push((R.ebx >>> 0)); // 600c1c: push ebx
        R.push((R.ebx >>> 0)); // 600c1d: push ebx
        R.push(0x9cf11c); // 600c1e: push 0x9cf11c
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 600c23: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 600c28: add esp, 0x14
        R.eax = (((R.esp + 0x110) | 0)) | 0; // 600c2b: lea eax, [esp + 0x110]
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 600c32: lea ecx, [esp + 0x10]
        R.push(0xb0a); // 600c36: push 0xb0a
        R.push((R.eax >>> 0)); // 600c3b: push eax
        R.push((R.ecx >>> 0)); // 600c3c: push ecx
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 600c3d: call 0x90d130
        R.push((R.eax >>> 0)); // 600c42: push eax
        R.push(0x9870e8); // 600c43: push 0x9870e8
        R.push(0xae24d0); // 600c48: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 600c4d: call 0x944c9f
        R.push((R.ebx >>> 0)); // 600c52: push ebx
        R.push(0xae24d0); // 600c53: push 0xae24d0
        R.push(0x9870e0); // 600c58: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 600c5d: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 600c62: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, (R.ebx >>> 0)); // 600c65: mov dword ptr [0xb67a34], ebx
        pc = 0x600c6b; continue;
      case 0x600c6b:
        R.edi = (R.pop()) | 0; // 600c6b: pop edi
        R.esi = (R.pop()) | 0; // 600c6c: pop esi
        R.ebp = (R.pop()) | 0; // 600c6d: pop ebp
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 600c6e: xor eax, eax
        R.ebx = (R.pop()) | 0; // 600c70: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 600c71: add esp, 0x200
        return R.eax; // 600c77: ret 
      case 0x600c78:
        R.edi = (R.pop()) | 0; // 600c78: pop edi
        R.esi = (R.pop()) | 0; // 600c79: pop esi
        R.ebp = (R.pop()) | 0; // 600c7a: pop ebp
        R.eax = (0x1) | 0; // 600c7b: mov eax, 1
        R.ebx = (R.pop()) | 0; // 600c80: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 600c81: add esp, 0x200
        return R.eax; // 600c87: ret 
      default: throw new Error(`f_600a50: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
