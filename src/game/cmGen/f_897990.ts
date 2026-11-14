// 0x897990 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 53b900=1, 5e8290=9, 775790=1c, 8982b0=2c, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_897990(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x897990;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x897990:
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 897990: mov eax, dword ptr [esp + 4]
        R.esp = (R.sub((R.esp >>> 0), 0x200, 32)) | 0; // 897994: sub esp, 0x200
        R.push((R.ebx >>> 0)); // 89799a: push ebx
        R.push((R.ebp >>> 0)); // 89799b: push ebp
        R.ebp = (R.logic((R.ebp >>> 0) ^ (R.ebp >>> 0), 32)) | 0; // 89799c: xor ebp, ebp
        R.push((R.esi >>> 0)); // 89799e: push esi
        R.sub((R.eax >>> 0), (R.ebp >>> 0), 32); // 89799f: cmp eax, ebp
        R.push((R.edi >>> 0)); // 8979a1: push edi
        R.ebx = ((R.ecx >>> 0)) | 0; // 8979a2: mov ebx, ecx
        if (!R.zf) { pc = 0x8979d8; continue; } // 8979a4: jne 0x8979d8
        pc = 0x8979a6; continue;
      case 0x8979a6:
        R.eax = (((R.esp + 0x10) | 0)) | 0; // 8979a6: lea eax, [esp + 0x10]
        R.ecx = (((R.esp + 0x110) | 0)) | 0; // 8979aa: lea ecx, [esp + 0x110]
        R.push((R.eax >>> 0)); // 8979b1: push eax
        R.push((R.ecx >>> 0)); // 8979b2: push ecx
        R.push((R.ebp >>> 0)); // 8979b3: push ebp
        R.push((R.ebp >>> 0)); // 8979b4: push ebp
        R.push(0xa8b908); // 8979b5: push 0xa8b908
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 8979ba: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8979bf: add esp, 0x14
        R.edx = (((R.esp + 0x10) | 0)) | 0; // 8979c2: lea edx, [esp + 0x10]
        R.eax = (((R.esp + 0x110) | 0)) | 0; // 8979c6: lea eax, [esp + 0x110]
        R.push(0x5a5); // 8979cd: push 0x5a5
        R.push((R.edx >>> 0)); // 8979d2: push edx
        pc = 0x897b6b; continue; // 8979d3: jmp 0x897b6b
      case 0x8979d8:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esp + 0x218) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8979d8: mov cl, byte ptr [esp + 0x218]
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 8979df: test cl, cl
        if (R.cL) { pc = 0x897b3e; continue; } // 8979e1: jl 0x897b3e
        pc = 0x8979e7; continue;
      case 0x8979e7:
        R.sub(((R.ecx >>> 0) & 0xff), 0x4, 8); // 8979e7: cmp cl, 4
        if (!R.cLE) { pc = 0x897b3e; continue; } // 8979ea: jg 0x897b3e
        pc = 0x8979f0; continue;
      case 0x8979f0:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esp + 0x21c) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8979f0: mov cl, byte ptr [esp + 0x21c]
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 8979f7: test cl, cl
        if (R.cL) { pc = 0x897b0e; continue; } // 8979f9: jl 0x897b0e
        pc = 0x8979ff; continue;
      case 0x8979ff:
        R.sub(((R.ecx >>> 0) & 0xff), 0x1, 8); // 8979ff: cmp cl, 1
        if (!R.cLE) { pc = 0x897b0e; continue; } // 897a02: jg 0x897b0e
        pc = 0x897a08; continue;
      case 0x897a08:
        R.ecx = (R.m.u32(((R.esp + 0x220) | 0) >>> 0)) | 0; // 897a08: mov ecx, dword ptr [esp + 0x220]
        R.push((R.ecx >>> 0)); // 897a0f: push ecx
        R.push((R.eax >>> 0)); // 897a10: push eax
        R.ecx = ((R.ebx >>> 0)) | 0; // 897a11: mov ecx, ebx
        R.call(0x8982b0, { n: 2, thisEcx: false, calleeClean: true }); // 897a13: call 0x8982b0
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 897a18: cmp eax, -1
        if (R.zf) { pc = 0x897b9a; continue; } // 897a1b: je 0x897b9a
        pc = 0x897a21; continue;
      case 0x897a21:
        R.edx = (((R.m.u8(((R.esp + 0x218) | 0) >>> 0)) << 24 >> 24)) | 0; // 897a21: movsx edx, byte ptr [esp + 0x218]
        R.ecx = (((R.m.u8(((R.esp + 0x21c) | 0) >>> 0)) << 24 >> 24)) | 0; // 897a29: movsx ecx, byte ptr [esp + 0x21c]
        R.esi = (((R.eax + R.eax * 8) | 0)) | 0; // 897a31: lea esi, [eax + eax*8]
        R.esi = (R.shl((R.esi >>> 0), 0x4, 32)) | 0; // 897a34: shl esi, 4
        R.edi = (((R.ecx + R.edx * 2) | 0)) | 0; // 897a37: lea edi, [ecx + edx*2]
        R.edx = (R.m.u32(((R.ebx + 0x601) | 0) >>> 0)) | 0; // 897a3a: mov edx, dword ptr [ebx + 0x601]
        R.esi = (R.add((R.esi >>> 0), (R.eax >>> 0), 32)) | 0; // 897a40: add esi, eax
        R.edi = (R.shl((R.edi >>> 0), 0x2, 32)) | 0; // 897a42: shl edi, 2
        R.edx = (R.add((R.edx >>> 0), (R.esi >>> 0), 32)) | 0; // 897a45: add edx, esi
        R.eax = (R.m.u32(((R.edx + R.edi + 0x5e) | 0) >>> 0)) | 0; // 897a47: mov eax, dword ptr [edx + edi + 0x5e]
        R.ecx = (((R.edx + R.edi + 0x5e) | 0)) | 0; // 897a4b: lea ecx, [edx + edi + 0x5e]
        R.edx = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 897a4f: mov edx, dword ptr [0xae2364]
        R.edx = (R.add((R.edx >>> 0), 0x52d, 32)) | 0; // 897a55: add edx, 0x52d
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 897a5b: cmp eax, edx
        if (R.cLE) { pc = 0x897a74; continue; } // 897a5d: jle 0x897a74
        pc = 0x897a5f; continue;
      case 0x897a5f:
        R.edi = (R.pop()) | 0; // 897a5f: pop edi
        R.esi = (R.pop()) | 0; // 897a60: pop esi
        R.ebp = (R.pop()) | 0; // 897a61: pop ebp
        R.m.w32(((R.ecx) | 0) >>> 0, 0xffffffff); // 897a62: mov dword ptr [ecx], 0xffffffff
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 897a68: xor eax, eax
        R.ebx = (R.pop()) | 0; // 897a6a: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 897a6b: add esp, 0x200
        return R.eax; // 897a71: ret 0x10
      case 0x897a74:
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 897a74: cmp eax, -1
        if (R.cLE) { pc = 0x897b9a; continue; } // 897a77: jle 0x897b9a
        pc = 0x897a7d; continue;
      case 0x897a7d:
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 897a7d: lea edx, [eax + eax*4]
        R.eax = (((R.eax + R.edx * 2) | 0)) | 0; // 897a80: lea eax, [eax + edx*2]
        R.ebp = (((R.eax + R.eax * 4) | 0)) | 0; // 897a83: lea ebp, [eax + eax*4]
        R.eax = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 897a86: mov eax, dword ptr [0xae23bc]
        R.ebp = (R.shl((R.ebp >>> 0), 0x1, 32)) | 0; // 897a8b: shl ebp, 1
        R.edx = (R.m.u32(((R.eax + R.ebp + 0x61) | 0) >>> 0)) | 0; // 897a8d: mov edx, dword ptr [eax + ebp + 0x61]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 897a91: test edx, edx
        if (!R.zf) { pc = 0x897aaa; continue; } // 897a93: jne 0x897aaa
        pc = 0x897a95; continue;
      case 0x897a95:
        R.edi = (R.pop()) | 0; // 897a95: pop edi
        R.esi = (R.pop()) | 0; // 897a96: pop esi
        R.ebp = (R.pop()) | 0; // 897a97: pop ebp
        R.m.w32(((R.ecx) | 0) >>> 0, 0xffffffff); // 897a98: mov dword ptr [ecx], 0xffffffff
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 897a9e: xor eax, eax
        R.ebx = (R.pop()) | 0; // 897aa0: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 897aa1: add esp, 0x200
        return R.eax; // 897aa7: ret 0x10
      case 0x897aaa:
        R.ecx = (R.m.u32(((R.esp + 0x214) | 0) >>> 0)) | 0; // 897aaa: mov ecx, dword ptr [esp + 0x214]
        R.edx = (R.m.u32(((R.eax + R.ebp + 0x39) | 0) >>> 0)) | 0; // 897ab1: mov edx, dword ptr [eax + ebp + 0x39]
        R.sub((R.edx >>> 0), (R.ecx >>> 0), 32); // 897ab5: cmp edx, ecx
        if (R.zf) { pc = 0x897aff; continue; } // 897ab7: je 0x897aff
        pc = 0x897ab9; continue;
      case 0x897ab9:
        R.push((R.ecx >>> 0)); // 897ab9: push ecx
        R.call(0x53b900, { n: 1, thisEcx: false, calleeClean: false }); // 897aba: call 0x53b900
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 897abf: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 897ac2: test eax, eax
        if (!R.zf) { pc = 0x897afa; continue; } // 897ac4: jne 0x897afa
        pc = 0x897ac6; continue;
      case 0x897ac6:
        R.eax = (R.m.u32(((R.esp + 0x214) | 0) >>> 0)) | 0; // 897ac6: mov eax, dword ptr [esp + 0x214]
        R.ecx = (R.m.u32(((0xb74318) | 0) >>> 0)) | 0; // 897acd: mov ecx, dword ptr [0xb74318]
        R.push((R.eax >>> 0)); // 897ad3: push eax
        R.call(0x775790, { n: 1, thisEcx: false, calleeClean: true }); // 897ad4: call 0x775790
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 897ad9: test eax, eax
        if (!R.zf) { pc = 0x897afa; continue; } // 897adb: jne 0x897afa
        pc = 0x897add; continue;
      case 0x897add:
        R.ecx = (R.m.u32(((R.ebx + 0x601) | 0) >>> 0)) | 0; // 897add: mov ecx, dword ptr [ebx + 0x601]
        R.ecx = (R.add((R.ecx >>> 0), (R.esi >>> 0), 32)) | 0; // 897ae3: add ecx, esi
        R.m.w32(((R.ecx + R.edi + 0x5e) | 0) >>> 0, 0xffffffff); // 897ae5: mov dword ptr [ecx + edi + 0x5e], 0xffffffff
        R.edi = (R.pop()) | 0; // 897aed: pop edi
        R.esi = (R.pop()) | 0; // 897aee: pop esi
        R.ebp = (R.pop()) | 0; // 897aef: pop ebp
        R.ebx = (R.pop()) | 0; // 897af0: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 897af1: add esp, 0x200
        return R.eax; // 897af7: ret 0x10
      case 0x897afa:
        R.eax = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 897afa: mov eax, dword ptr [0xae23bc]
        pc = 0x897aff; continue;
      case 0x897aff:
        R.edi = (R.pop()) | 0; // 897aff: pop edi
        R.eax = (R.add((R.eax >>> 0), (R.ebp >>> 0), 32)) | 0; // 897b00: add eax, ebp
        R.esi = (R.pop()) | 0; // 897b02: pop esi
        R.ebp = (R.pop()) | 0; // 897b03: pop ebp
        R.ebx = (R.pop()) | 0; // 897b04: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 897b05: add esp, 0x200
        return R.eax; // 897b0b: ret 0x10
      case 0x897b0e:
        R.edx = (((R.esp + 0x110) | 0)) | 0; // 897b0e: lea edx, [esp + 0x110]
        R.eax = (((R.esp + 0x10) | 0)) | 0; // 897b15: lea eax, [esp + 0x10]
        R.push((R.edx >>> 0)); // 897b19: push edx
        R.push((R.eax >>> 0)); // 897b1a: push eax
        R.push((R.ebp >>> 0)); // 897b1b: push ebp
        R.push((R.ebp >>> 0)); // 897b1c: push ebp
        R.push(0xa8b908); // 897b1d: push 0xa8b908
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 897b22: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 897b27: add esp, 0x14
        R.ecx = (((R.esp + 0x110) | 0)) | 0; // 897b2a: lea ecx, [esp + 0x110]
        R.edx = (((R.esp + 0x10) | 0)) | 0; // 897b31: lea edx, [esp + 0x10]
        R.push(0x5b5); // 897b35: push 0x5b5
        R.push((R.ecx >>> 0)); // 897b3a: push ecx
        R.push((R.edx >>> 0)); // 897b3b: push edx
        pc = 0x897b6c; continue; // 897b3c: jmp 0x897b6c
      case 0x897b3e:
        R.eax = (((R.esp + 0x110) | 0)) | 0; // 897b3e: lea eax, [esp + 0x110]
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 897b45: lea ecx, [esp + 0x10]
        R.push((R.eax >>> 0)); // 897b49: push eax
        R.push((R.ecx >>> 0)); // 897b4a: push ecx
        R.push((R.ebp >>> 0)); // 897b4b: push ebp
        R.push((R.ebp >>> 0)); // 897b4c: push ebp
        R.push(0xa8b908); // 897b4d: push 0xa8b908
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 897b52: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 897b57: add esp, 0x14
        R.edx = (((R.esp + 0x110) | 0)) | 0; // 897b5a: lea edx, [esp + 0x110]
        R.eax = (((R.esp + 0x10) | 0)) | 0; // 897b61: lea eax, [esp + 0x10]
        R.push(0x5ad); // 897b65: push 0x5ad
        R.push((R.edx >>> 0)); // 897b6a: push edx
        pc = 0x897b6b; continue;
      case 0x897b6b:
        R.push((R.eax >>> 0)); // 897b6b: push eax
        pc = 0x897b6c; continue;
      case 0x897b6c:
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 897b6c: call 0x90d130
        R.push((R.eax >>> 0)); // 897b71: push eax
        R.push(0x9870e8); // 897b72: push 0x9870e8
        R.push(0xae24d0); // 897b77: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 897b7c: call 0x944c9f
        R.push((R.ebp >>> 0)); // 897b81: push ebp
        R.push(0xae24d0); // 897b82: push 0xae24d0
        R.push(0x9870e0); // 897b87: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 897b8c: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 897b91: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, (R.ebp >>> 0)); // 897b94: mov dword ptr [0xb67a34], ebp
        pc = 0x897b9a; continue;
      case 0x897b9a:
        R.edi = (R.pop()) | 0; // 897b9a: pop edi
        R.esi = (R.pop()) | 0; // 897b9b: pop esi
        R.ebp = (R.pop()) | 0; // 897b9c: pop ebp
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 897b9d: xor eax, eax
        R.ebx = (R.pop()) | 0; // 897b9f: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 897ba0: add esp, 0x200
        return R.eax; // 897ba6: ret 0x10
      default: throw new Error(`f_897990: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
