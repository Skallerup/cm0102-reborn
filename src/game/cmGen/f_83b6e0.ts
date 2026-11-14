// 0x83b6e0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4cf5a0=1c, 4cf5f0=2tc, 53b900=1, 544590=2, 54c8e0=2tc, 598800=5tc, 5a0590=1tc, 600a50=5, 83f3a0=3tc, 846920=6tcf, 85fa00=0t, 8c5cf0=3tc, 8c61e0=1tc, 945333=4
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x83b6e0, 0x83b71c, 0x83b72d, 0x83b741, 0x83b758, 0x83b75e, 0x83b77b, 0x83b795, 0x83b7a6, 0x83b7ab, 0x83b7b6, 0x83b7c2, 0x83b7c6, 0x83b7d5, 0x83b7df, 0x83b7e7, 0x83b7fa, 0x83b812, 0x83b818, 0x83b82c, 0x83b833, 0x83b842, 0x83b852, 0x83b85b, 0x83b866, 0x83b86d, 0x83b877, 0x83b886, 0x83b890, 0x83b8a6, 0x83b8b0, 0x83b8c0, 0x83b8ca, 0x83b8da, 0x83b8dc, 0x83b8e1, 0x83b8fb, 0x83b903, 0x83b911, 0x83b91a, 0x83b92b, 0x83b935, 0x83b941, 0x83b94a, 0x83b952, 0x83b957, 0x83b95f, 0x83b965, 0x83b96a, 0x83b980, 0x83b98c, 0x83b9a7, 0x83b9b1, 0x83b9b6, 0x83b9c4, 0x83b9d7, 0x83b9db, 0x83ba0b, 0x83ba1e, 0x83ba25, 0x83ba2e, 0x83ba40, 0x83ba44, 0x83ba4f, 0x83ba53, 0x83ba61, 0x83ba69, 0x83ba6d, 0x83ba78, 0x83ba7c, 0x83ba8e, 0x83ba96, 0x83baca, 0x83bad0, 0x83baf4, 0x83bb01, 0x83bb13, 0x83bb17, 0x83bb21, 0x83bb29, 0x83bb45, 0x83bb51, 0x83bb5b, 0x83bb7d, 0x83bb92, 0x83bbaa, 0x83bbac, 0x83bbb6, 0x83bbc9, 0x83bbe0, 0x83bbeb, 0x83bbf0, 0x83bc17, 0x83bc1b, 0x83bc3e, 0x83bc52, 0x83bc56, 0x83bc8e, 0x83bc90, 0x83bc9d, 0x83bca4, 0x83bca9, 0x83bcc6]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 10, 11, 11, 11, 11, 11, 11, 11]);
function f_83b6e0_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 83b6e0
        R.esp = (R.sub((R.esp >>> 0), 0x2c, 32)) | 0; // 83b6e0: sub esp, 0x2c
        R.push((R.ebx >>> 0)); // 83b6e3: push ebx
        R.push((R.ebp >>> 0)); // 83b6e4: push ebp
        R.push((R.esi >>> 0)); // 83b6e5: push esi
        R.esi = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 83b6e6: mov esi, dword ptr [esp + 0x3c]
        R.ebp = (R.logic((R.ebp >>> 0) ^ (R.ebp >>> 0), 32)) | 0; // 83b6ea: xor ebp, ebp
        R.push((R.edi >>> 0)); // 83b6ec: push edi
        R.push((R.ebp >>> 0)); // 83b6ed: push ebp
        R.push((R.ebp >>> 0)); // 83b6ee: push ebp
        R.push(0x1); // 83b6ef: push 1
        R.edi = ((R.ecx >>> 0)) | 0; // 83b6f1: mov edi, ecx
        R.ebx = ((R.ebx & 0xffffff00) | (((R.logic(((R.ebx >>> 0) & 0xff) ^ ((R.ebx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 83b6f3: xor bl, bl
        R.push((R.ebp >>> 0)); // 83b6f5: push ebp
        R.push((R.esi >>> 0)); // 83b6f6: push esi
        R.m.w32(((R.esp + 0x4c) | 0) >>> 0, (R.edi >>> 0)); // 83b6f7: mov dword ptr [esp + 0x4c], edi
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.ebp >>> 0)); // 83b6fb: mov dword ptr [esp + 0x2c], ebp
        R.m.w8(((R.esp + 0x26) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 83b6ff: mov byte ptr [esp + 0x26], bl
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.ebp >>> 0)); // 83b703: mov dword ptr [esp + 0x34], ebp
        R.m.w8(((R.esp + 0x25) | 0) >>> 0, 0x8); // 83b707: mov byte ptr [esp + 0x25], 8
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 83b70c: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 83b711: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83b714: test eax, eax
        if (!R.zf) { pc = 102; continue; } // 83b716: jne 0x83bcc6
        pc = 1; continue;
      case 1: // 83b71c
        R.push((R.esi >>> 0)); // 83b71c: push esi
        R.call(0x53b900, { n: 1, thisEcx: false, calleeClean: false }); // 83b71d: call 0x53b900
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 83b722: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83b725: test eax, eax
        if (!R.zf) { pc = 102; continue; } // 83b727: jne 0x83bcc6
        pc = 2; continue;
      case 2: // 83b72d
        R.ecx = (R.m.u32(((0xae2a38) | 0) >>> 0)) | 0; // 83b72d: mov ecx, dword ptr [0xae2a38]
        R.push((R.esi >>> 0)); // 83b733: push esi
        R.call(0x5a0590, { n: 1, thisEcx: true, calleeClean: true }); // 83b734: call 0x5a0590
        R.sub((R.eax >>> 0), (R.ebp >>> 0), 32); // 83b739: cmp eax, ebp
        if (R.zf) { pc = 102; continue; } // 83b73b: je 0x83bcc6
        pc = 3; continue;
      case 3: // 83b741
        R.push((R.ebp >>> 0)); // 83b741: push ebp
        R.push(0x1); // 83b742: push 1
        R.push((R.ebp >>> 0)); // 83b744: push ebp
        R.push((R.ebp >>> 0)); // 83b745: push ebp
        R.push((R.ebp >>> 0)); // 83b746: push ebp
        R.ecx = ((R.eax >>> 0)) | 0; // 83b747: mov ecx, eax
        R.call(0x598800, { n: 5, thisEcx: true, calleeClean: true }); // 83b749: call 0x598800
        R.ebp = ((R.eax >>> 0)) | 0; // 83b74e: mov ebp, eax
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 83b750: test ebp, ebp
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.ebp >>> 0)); // 83b752: mov dword ptr [esp + 0x14], ebp
        if (!R.cL) { pc = 5; continue; } // 83b756: jge 0x83b75e
        pc = 4; continue;
      case 4: // 83b758
        R.ebp = (R.logic((R.ebp >>> 0) ^ (R.ebp >>> 0), 32)) | 0; // 83b758: xor ebp, ebp
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.ebp >>> 0)); // 83b75a: mov dword ptr [esp + 0x14], ebp
        pc = 5; continue;
      default: return pc;
    }
  }
}
function f_83b6e0_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 5: // 83b75e
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 83b75e: mov eax, dword ptr [esi]
        R.ecx = (R.m.u32(((R.edi + 0xdc) | 0) >>> 0)) | 0; // 83b760: mov ecx, dword ptr [edi + 0xdc]
        R.esi = (((R.eax + R.eax * 8) | 0)) | 0; // 83b766: lea esi, [eax + eax*8]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + R.ecx + 0x4) | 0) >>> 0)) & 0xff) << 0)) | 0; // 83b769: mov al, byte ptr [esi + ecx + 4]
        R.esi = (R.add((R.esi >>> 0), (R.ecx >>> 0), 32)) | 0; // 83b76d: add esi, ecx
        R.sub(((R.eax >>> 0) & 0xff), 0x1, 8); // 83b76f: cmp al, 1
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.esi >>> 0)); // 83b771: mov dword ptr [esp + 0x1c], esi
        if (!R.zf) { pc = 102; continue; } // 83b775: jne 0x83bcc6
        pc = 6; continue;
      case 6: // 83b77b
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 83b77b: mov eax, dword ptr [esi]
        R.push(0x83b690); // 83b77d: push 0x83b690
        R.push(0x25); // 83b782: push 0x25
        R.push(0x28); // 83b784: push 0x28
        R.push((R.eax >>> 0)); // 83b786: push eax
        R.call(0x945333, { n: 4, thisEcx: false, calleeClean: false }); // 83b787: call 0x945333
        R.esi = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 83b78c: mov esi, dword ptr [esi]
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 83b78e: add esp, 0x10
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) ^ ((R.ecx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 83b791: xor cl, cl
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) ^ ((R.edx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 83b793: xor dl, dl
        pc = 7; continue;
      case 7: // 83b795
        R.eax = (((((R.ecx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 83b795: movsx eax, cl
        R.edi = (((R.eax + R.eax * 8) | 0)) | 0; // 83b798: lea edi, [eax + eax*8]
        R.eax = (R.add((R.eax >>> 0), (R.esi >>> 0), 32)) | 0; // 83b79b: add eax, esi
        R.eax = (((R.eax + R.edi * 4) | 0)) | 0; // 83b79d: lea eax, [eax + edi*4]
        R.sub(R.m.u32(((R.eax + 0xf) | 0) >>> 0), 0xffffffff, 32); // 83b7a0: cmp dword ptr [eax + 0xf], -1
        if (!R.zf) { pc = 13; continue; } // 83b7a4: jne 0x83b7d5
        pc = 8; continue;
      case 8: // 83b7a6
        R.sub(R.m.u8(((R.eax) | 0) >>> 0), 0xb, 8); // 83b7a6: cmp byte ptr [eax], 0xb
        if (!R.zf) { pc = 12; continue; } // 83b7a9: jne 0x83b7c6
        pc = 9; continue;
      case 9: // 83b7ab
        R.edx = ((R.edx & 0xffffff00) | (((R.incdec(((R.edx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 83b7ab: inc dl
        R.sub(((R.edx >>> 0) & 0xff), 0x4, 8); // 83b7ad: cmp dl, 4
        R.m.w8(((R.esp + 0x13) | 0) >>> 0, ((R.edx >>> 0) & 0xff)); // 83b7b0: mov byte ptr [esp + 0x13], dl
        if (!R.zf) { pc = 11; continue; } // 83b7b4: jne 0x83b7c2
        pc = 10; continue;
      case 10: // 83b7b6
        R.edx = ((R.edx & 0xffffff00) | (((((R.ecx >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 83b7b6: mov dl, cl
        R.edx = ((R.edx & 0xffffff00) | (((R.incdec(((R.edx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 83b7b8: inc dl
        R.m.w8(((R.esp + 0x11) | 0) >>> 0, ((R.edx >>> 0) & 0xff)); // 83b7ba: mov byte ptr [esp + 0x11], dl
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.esp + 0x13) | 0) >>> 0)) & 0xff) << 0)) | 0; // 83b7be: mov dl, byte ptr [esp + 0x13]
        pc = 11; continue;
      case 11: // 83b7c2
        R.ebp = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 83b7c2: mov ebp, dword ptr [esp + 0x14]
        pc = 12; continue;
      case 12: // 83b7c6
        R.eax = (R.m.u32(((R.eax + 0xb) | 0) >>> 0)) | 0; // 83b7c6: mov eax, dword ptr [eax + 0xb]
        R.edi = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 83b7c9: mov edi, dword ptr [esp + 0x18]
        R.ebx = ((R.ebx & 0xffffff00) | (((R.incdec(((R.ebx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 83b7cd: inc bl
        R.edi = (R.add((R.edi >>> 0), (R.eax >>> 0), 32)) | 0; // 83b7cf: add edi, eax
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.edi >>> 0)); // 83b7d1: mov dword ptr [esp + 0x18], edi
        pc = 13; continue;
      default: return pc;
    }
  }
}
function f_83b6e0_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 13: // 83b7d5
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x11) | 0) >>> 0)) & 0xff) << 0)) | 0; // 83b7d5: mov al, byte ptr [esp + 0x11]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.incdec(((R.ecx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 83b7d9: inc cl
        R.sub(((R.ecx >>> 0) & 0xff), ((R.eax >>> 0) & 0xff), 8); // 83b7db: cmp cl, al
        if (R.cL) { pc = 7; continue; } // 83b7dd: jl 0x83b795
        pc = 14; continue;
      case 14: // 83b7df
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 83b7df: test al, al
        if (R.cLE) { pc = 46; continue; } // 83b7e1: jle 0x83b95f
        pc = 15; continue;
      case 15: // 83b7e7
        R.esi = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 83b7e7: mov esi, dword ptr [esp + 0x20]
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, 0x0); // 83b7eb: mov dword ptr [esp + 0x14], 0
        R.ecx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 83b7f3: movsx ecx, al
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.ecx >>> 0)); // 83b7f6: mov dword ptr [esp + 0x24], ecx
        pc = 16; continue;
      case 16: // 83b7fa
        R.edx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 83b7fa: mov edx, dword ptr [esp + 0x1c]
        R.ecx = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 83b7fe: mov ecx, dword ptr [esp + 0x14]
        R.eax = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 83b802: mov eax, dword ptr [edx]
        R.edx = (R.logic((R.edx >>> 0) | 0xffffffff, 32)) | 0; // 83b804: or edx, 0xffffffff
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 83b807: add ecx, eax
        R.sub(R.m.u32(((R.ecx + 0xf) | 0) >>> 0), (R.edx >>> 0), 32); // 83b809: cmp dword ptr [ecx + 0xf], edx
        if (!R.zf) { pc = 35; continue; } // 83b80c: jne 0x83b8e1
        pc = 17; continue;
      case 17: // 83b812
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx) | 0) >>> 0)) & 0xff) << 0)) | 0; // 83b812: mov al, byte ptr [ecx]
        R.sub(((R.eax >>> 0) & 0xff), 0xb, 8); // 83b814: cmp al, 0xb
        if (!R.zf) { pc = 22; continue; } // 83b816: jne 0x83b852
        pc = 18; continue;
      case 18: // 83b818
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.ecx + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 83b818: mov dl, byte ptr [ecx + 0x24]
        R.edx = (R.shr((R.edx >>> 0), 0x1, 32)) | 0; // 83b81b: shr edx, 1
        R.edx = (R.logic((R.edx >>> 0) & 0xf, 32)) | 0; // 83b81d: and edx, 0xf
        R.eax = (((R.edx + -0x2) | 0)) | 0; // 83b820: lea eax, [edx - 2]
        R.sub((R.eax >>> 0), 0x3, 32); // 83b823: cmp eax, 3
        if (!R.cBE) { pc = 35; continue; } // 83b826: ja 0x83b8e1
        pc = 19; continue;
      case 19: // 83b82c
        pc = [20, 20, 21, 26][R.eax >>> 0] ?? -2; continue; // 83b82c: jmp dword ptr [eax*4 + 0x83bcd0]
      case 20: // 83b833
        R.edi = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 83b833: movsx edi, bl
        R.eax = ((R.ebp >>> 0)) | 0; // 83b836: mov eax, ebp
        R.edx = R.eax < 0 ? -1 : 0; // 83b838: cdq 
        R.edi = (R.shl((R.edi >>> 0), 0x1, 32)) | 0; // 83b839: shl edi, 1
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.edi >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 83b83b: idiv edi
        pc = 34; continue; // 83b83d: jmp 0x83b8dc
      case 21: // 83b842
        R.edi = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 83b842: movsx edi, bl
        R.eax = ((R.ebp >>> 0)) | 0; // 83b845: mov eax, ebp
        R.edx = R.eax < 0 ? -1 : 0; // 83b847: cdq 
        R.edi = (R.shl((R.edi >>> 0), 0x2, 32)) | 0; // 83b848: shl edi, 2
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.edi >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 83b84b: idiv edi
        pc = 34; continue; // 83b84d: jmp 0x83b8dc
      case 22: // 83b852
        R.sub(R.m.u32(((R.ecx + 0x13) | 0) >>> 0), (R.edx >>> 0), 32); // 83b852: cmp dword ptr [ecx + 0x13], edx
        if (!R.zf) { pc = 35; continue; } // 83b855: jne 0x83b8e1
        pc = 23; continue;
      default: return pc;
    }
  }
}
function f_83b6e0_3(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 23: // 83b85b
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 83b85b: movsx eax, al
        R.eax = (R.add((R.eax >>> 0), 0xfffffffa, 32)) | 0; // 83b85e: add eax, -6
        R.sub((R.eax >>> 0), 0x4, 32); // 83b861: cmp eax, 4
        if (!R.cBE) { pc = 35; continue; } // 83b864: ja 0x83b8e1
        pc = 24; continue;
      case 24: // 83b866
        pc = [25, 27, 25, 29, 31][R.eax >>> 0] ?? -2; continue; // 83b866: jmp dword ptr [eax*4 + 0x83bce0]
      case 25: // 83b86d
        R.eax = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 83b86d: mov eax, dword ptr [esp + 0x40]
        R.sub(R.m.u8(((R.eax + 0x64) | 0) >>> 0), 0x1, 8); // 83b871: cmp byte ptr [eax + 0x64], 1
        if (!R.zf) { pc = 33; continue; } // 83b875: jne 0x83b8da
        pc = 26; continue;
      case 26: // 83b877
        R.eax = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 83b877: movsx eax, bl
        R.edi = (((R.eax + R.eax * 4) | 0)) | 0; // 83b87a: lea edi, [eax + eax*4]
        R.eax = ((R.ebp >>> 0)) | 0; // 83b87d: mov eax, ebp
        R.edx = R.eax < 0 ? -1 : 0; // 83b87f: cdq 
        R.edi = (R.shl((R.edi >>> 0), 0x1, 32)) | 0; // 83b880: shl edi, 1
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.edi >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 83b882: idiv edi
        pc = 34; continue; // 83b884: jmp 0x83b8dc
      case 27: // 83b886
        R.edx = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 83b886: mov edx, dword ptr [esp + 0x40]
        R.sub(R.m.u8(((R.edx + 0x64) | 0) >>> 0), 0x1, 8); // 83b88a: cmp byte ptr [edx + 0x64], 1
        if (!R.zf) { pc = 33; continue; } // 83b88e: jne 0x83b8da
        pc = 28; continue;
      case 28: // 83b890
        R.eax = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 83b890: movsx eax, bl
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 83b893: lea eax, [eax + eax*4]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 83b896: lea eax, [eax + eax*4]
        R.edi = (((R.eax + R.eax * 4) | 0)) | 0; // 83b899: lea edi, [eax + eax*4]
        R.eax = ((R.ebp >>> 0)) | 0; // 83b89c: mov eax, ebp
        R.edx = R.eax < 0 ? -1 : 0; // 83b89e: cdq 
        R.edi = (R.shl((R.edi >>> 0), 0x3, 32)) | 0; // 83b89f: shl edi, 3
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.edi >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 83b8a2: idiv edi
        pc = 34; continue; // 83b8a4: jmp 0x83b8dc
      case 29: // 83b8a6
        R.edx = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 83b8a6: mov edx, dword ptr [esp + 0x40]
        R.sub(R.m.u8(((R.edx + 0x64) | 0) >>> 0), 0x1, 8); // 83b8aa: cmp byte ptr [edx + 0x64], 1
        if (!R.zf) { pc = 33; continue; } // 83b8ae: jne 0x83b8da
        pc = 30; continue;
      case 30: // 83b8b0
        R.eax = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 83b8b0: movsx eax, bl
        R.edi = (((R.eax + R.eax * 4) | 0)) | 0; // 83b8b3: lea edi, [eax + eax*4]
        R.eax = ((R.ebp >>> 0)) | 0; // 83b8b6: mov eax, ebp
        R.edx = R.eax < 0 ? -1 : 0; // 83b8b8: cdq 
        R.edi = (R.shl((R.edi >>> 0), 0x2, 32)) | 0; // 83b8b9: shl edi, 2
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.edi >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 83b8bc: idiv edi
        pc = 34; continue; // 83b8be: jmp 0x83b8dc
      case 31: // 83b8c0
        R.eax = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 83b8c0: mov eax, dword ptr [esp + 0x40]
        R.sub(R.m.u8(((R.eax + 0x64) | 0) >>> 0), 0x1, 8); // 83b8c4: cmp byte ptr [eax + 0x64], 1
        if (!R.zf) { pc = 33; continue; } // 83b8c8: jne 0x83b8da
        pc = 32; continue;
      default: return pc;
    }
  }
}
function f_83b6e0_4(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 32: // 83b8ca
        R.eax = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 83b8ca: movsx eax, bl
        R.edi = (((R.eax + R.eax * 4) | 0)) | 0; // 83b8cd: lea edi, [eax + eax*4]
        R.eax = ((R.ebp >>> 0)) | 0; // 83b8d0: mov eax, ebp
        R.edx = R.eax < 0 ? -1 : 0; // 83b8d2: cdq 
        R.edi = (R.shl((R.edi >>> 0), 0x2, 32)) | 0; // 83b8d3: shl edi, 2
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.edi >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 83b8d6: idiv edi
        pc = 34; continue; // 83b8d8: jmp 0x83b8dc
      case 33: // 83b8da
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 83b8da: xor eax, eax
        pc = 34; continue;
      case 34: // 83b8dc
        R.m.w32(((R.ecx + 0x7) | 0) >>> 0, (R.eax >>> 0)); // 83b8dc: mov dword ptr [ecx + 7], eax
        R.esi = (R.add((R.esi >>> 0), (R.eax >>> 0), 32)) | 0; // 83b8df: add esi, eax
        pc = 35; continue;
      case 35: // 83b8e1
        R.ecx = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 83b8e1: mov ecx, dword ptr [esp + 0x14]
        R.eax = (R.m.u32(((R.esp + 0x24) | 0) >>> 0)) | 0; // 83b8e5: mov eax, dword ptr [esp + 0x24]
        R.ecx = (R.add((R.ecx >>> 0), 0x25, 32)) | 0; // 83b8e9: add ecx, 0x25
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 83b8ec: dec eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.ecx >>> 0)); // 83b8ed: mov dword ptr [esp + 0x14], ecx
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.eax >>> 0)); // 83b8f1: mov dword ptr [esp + 0x24], eax
        if (!R.zf) { pc = 16; continue; } // 83b8f5: jne 0x83b7fa
        pc = 36; continue;
      case 36: // 83b8fb
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x11) | 0) >>> 0)) & 0xff) << 0)) | 0; // 83b8fb: mov al, byte ptr [esp + 0x11]
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.esi >>> 0)); // 83b8ff: mov dword ptr [esp + 0x20], esi
        pc = 37; continue;
      case 37: // 83b903
        R.ebp = (R.sub((R.ebp >>> 0), (R.esi >>> 0), 32)) | 0; // 83b903: sub ebp, esi
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 83b905: test al, al
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.ebp >>> 0)); // 83b907: mov dword ptr [esp + 0x14], ebp
        if (R.cLE) { pc = 77; continue; } // 83b90b: jle 0x83bb17
        pc = 38; continue;
      case 38: // 83b911
        R.ecx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 83b911: movsx ecx, al
        R.edi = (R.logic((R.edi >>> 0) ^ (R.edi >>> 0), 32)) | 0; // 83b914: xor edi, edi
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.ecx >>> 0)); // 83b916: mov dword ptr [esp + 0x30], ecx
        pc = 39; continue;
      case 39: // 83b91a
        R.ebx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 83b91a: mov ebx, dword ptr [esp + 0x1c]
        R.edx = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 83b91e: mov edx, dword ptr [ebx]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.edi + R.edx) | 0) >>> 0)) & 0xff) << 0)) | 0; // 83b920: mov cl, byte ptr [edi + edx]
        R.esi = (((R.edi + R.edx) | 0)) | 0; // 83b923: lea esi, [edi + edx]
        R.sub(((R.ecx >>> 0) & 0xff), 0xb, 8); // 83b926: cmp cl, 0xb
        if (R.zf) { pc = 41; continue; } // 83b929: je 0x83b935
        pc = 40; continue;
      case 40: // 83b92b
        R.sub(R.m.u32(((R.esi + 0x13) | 0) >>> 0), 0xffffffff, 32); // 83b92b: cmp dword ptr [esi + 0x13], -1
        if (!R.cLE) { pc = 75; continue; } // 83b92f: jg 0x83bb01
        pc = 41; continue;
      case 41: // 83b935
        R.eax = (R.m.u32(((R.esi + 0xf) | 0) >>> 0)) | 0; // 83b935: mov eax, dword ptr [esi + 0xf]
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 83b938: cmp eax, -1
        if (!R.cLE) { pc = 75; continue; } // 83b93b: jg 0x83bb01
        pc = 42; continue;
      case 42: // 83b941
        R.sub(((R.ecx >>> 0) & 0xff), 0x7, 8); // 83b941: cmp cl, 7
        if (R.zf) { pc = 75; continue; } // 83b944: je 0x83bb01
        pc = 43; continue;
      default: return pc;
    }
  }
}
function f_83b6e0_5(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 43: // 83b94a
        R.edx = (R.m.u32(((R.esi + 0x17) | 0) >>> 0)) | 0; // 83b94a: mov edx, dword ptr [esi + 0x17]
        R.sub((R.edx >>> 0), 0xffffffff, 32); // 83b94d: cmp edx, -1
        if (R.cLE) { pc = 51; continue; } // 83b950: jle 0x83b9a7
        pc = 44; continue;
      case 44: // 83b952
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 83b952: cmp eax, -1
        if (!R.zf) { pc = 47; continue; } // 83b955: jne 0x83b965
        pc = 45; continue;
      case 45: // 83b957
        R.m.w32(((R.esi + 0x17) | 0) >>> 0, (R.eax >>> 0)); // 83b957: mov dword ptr [esi + 0x17], eax
        pc = 75; continue; // 83b95a: jmp 0x83bb01
      case 46: // 83b95f
        R.esi = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 83b95f: mov esi, dword ptr [esp + 0x20]
        pc = 37; continue; // 83b963: jmp 0x83b903
      case 47: // 83b965
        R.sub(((R.ecx >>> 0) & 0xff), 0xb, 8); // 83b965: cmp cl, 0xb
        if (!R.zf) { pc = 50; continue; } // 83b968: jne 0x83b98c
        pc = 48; continue;
      case 48: // 83b96a
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 83b96a: mov ecx, dword ptr [0xde1f54]
        R.push((R.edx >>> 0)); // 83b970: push edx
        R.call(0x8c61e0, { n: 1, thisEcx: true, calleeClean: true }); // 83b971: call 0x8c61e0
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 83b976: mov eax, dword ptr [eax]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83b978: test eax, eax
        if (R.zf) { pc = 75; continue; } // 83b97a: je 0x83bb01
        pc = 49; continue;
      case 49: // 83b980
        R.ebp = (R.sub((R.ebp >>> 0), R.m.u32(((R.eax + 0x1b) | 0) >>> 0), 32)) | 0; // 83b980: sub ebp, dword ptr [eax + 0x1b]
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.ebp >>> 0)); // 83b983: mov dword ptr [esp + 0x14], ebp
        pc = 75; continue; // 83b987: jmp 0x83bb01
      case 50: // 83b98c
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 83b98c: lea ecx, [eax + eax*4]
        R.eax = (((R.eax + R.ecx * 2) | 0)) | 0; // 83b98f: lea eax, [eax + ecx*2]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 83b992: lea edx, [eax + eax*4]
        R.eax = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 83b995: mov eax, dword ptr [0xae23bc]
        R.ebp = (R.sub((R.ebp >>> 0), R.m.u32(((R.eax + R.edx * 2 + 0x52) | 0) >>> 0), 32)) | 0; // 83b99a: sub ebp, dword ptr [eax + edx*2 + 0x52]
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.ebp >>> 0)); // 83b99e: mov dword ptr [esp + 0x14], ebp
        pc = 75; continue; // 83b9a2: jmp 0x83bb01
      case 51: // 83b9a7
        R.edx = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 83b9a7: mov edx, dword ptr [esp + 0x40]
        R.sub(R.m.u8(((R.edx + 0x64) | 0) >>> 0), 0x1, 8); // 83b9ab: cmp byte ptr [edx + 0x64], 1
        if (R.zf) { pc = 54; continue; } // 83b9af: je 0x83b9c4
        pc = 52; continue;
      case 52: // 83b9b1
        R.sub(((R.ecx >>> 0) & 0xff), 0xb, 8); // 83b9b1: cmp cl, 0xb
        if (R.zf) { pc = 54; continue; } // 83b9b4: je 0x83b9c4
        pc = 53; continue;
      case 53: // 83b9b6
        R.m.w32(((R.esi + 0x7) | 0) >>> 0, 0x0); // 83b9b6: mov dword ptr [esi + 7], 0
        R.edx = (0x1) | 0; // 83b9bd: mov edx, 1
        pc = 57; continue; // 83b9c2: jmp 0x83ba0b
      case 54: // 83b9c4
        R.eax = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 83b9c4: mov eax, dword ptr [esp + 0x20]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, 0x3e8); // 83b9c8: mov dword ptr [esp + 0x24], 0x3e8
        R.sub((R.eax >>> 0), 0x3e8, 32); // 83b9d0: cmp eax, 0x3e8
        if (R.cL) { pc = 56; continue; } // 83b9d5: jl 0x83b9db
        pc = 55; continue;
      default: return pc;
    }
  }
}
function f_83b6e0_6(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 55: // 83b9d7
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.eax >>> 0)); // 83b9d7: mov dword ptr [esp + 0x24], eax
        pc = 56; continue;
      case 56: // 83b9db
        R.ebp = (R.m.u32(((R.esi + 0x7) | 0) >>> 0)) | 0; // 83b9db: mov ebp, dword ptr [esi + 7]
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.ebp >>> 0)); // 83b9de: mov dword ptr [esp + 0x28], ebp
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 83b9e2: fild dword ptr [esp + 0x28]
        R.st[0] = R.st[0] / R.m.s32(((R.esp + 0x24) | 0) >>> 0); // 83b9e6: fidiv dword ptr [esp + 0x24]
        R.st[0] = R.st[0] * R.m.s32(((R.esp + 0x14) | 0) >>> 0); // 83b9ea: fimul dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * -0.5; // 83b9ee: fmul qword ptr [0x969540]
        R.ftol(); // 83b9f4: call 0x945640
        R.ebx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 83b9f9: mov ebx, dword ptr [esp + 0x1c]
        R.ebp = (R.sub((R.ebp >>> 0), (R.eax >>> 0), 32)) | 0; // 83b9fd: sub ebp, eax
        R.m.w32(((R.esi + 0x7) | 0) >>> 0, (R.ebp >>> 0)); // 83b9ff: mov dword ptr [esi + 7], ebp
        R.ebp = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 83ba02: mov ebp, dword ptr [esp + 0x14]
        R.edx = (0x1) | 0; // 83ba06: mov edx, 1
        pc = 57; continue;
      case 57: // 83ba0b
        R.eax = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 83ba0b: mov eax, dword ptr [ebx]
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 83ba0d: mov ecx, dword ptr [esp + 0x18]
        R.esi = (((R.edi + R.eax) | 0)) | 0; // 83ba11: lea esi, [edi + eax]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edi + R.eax + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 83ba14: mov al, byte ptr [edi + eax + 0x24]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x1e, 8)) & 0xff) << 0)) | 0; // 83ba18: and al, 0x1e
        R.sub(((R.eax >>> 0) & 0xff), 0x6, 8); // 83ba1a: cmp al, 6
        if (!R.cBE) { pc = 65; continue; } // 83ba1c: ja 0x83ba61
        pc = 58; continue;
      case 58: // 83ba1e
        R.sub(R.m.u8(((R.esp + 0x12) | 0) >>> 0), 0x3, 8); // 83ba1e: cmp byte ptr [esp + 0x12], 3
        if (!R.cL) { pc = 71; continue; } // 83ba23: jge 0x83ba96
        pc = 59; continue;
      case 59: // 83ba25
        R.sub(((R.eax >>> 0) & 0xff), 0x6, 8); // 83ba25: cmp al, 6
        R.edx = (0x1) | 0; // 83ba27: mov edx, 1
        if (!R.cBE) { pc = 65; continue; } // 83ba2c: ja 0x83ba61
        pc = 60; continue;
      case 60: // 83ba2e
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x12) | 0) >>> 0)) & 0xff) << 0)) | 0; // 83ba2e: mov al, byte ptr [esp + 0x12]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.edx >>> 0)); // 83ba32: mov dword ptr [esp + 0x24], edx
        R.eax = ((R.eax & 0xffffff00) | (((R.incdec(((R.eax >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 83ba36: inc al
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 83ba38: cmp ecx, edx
        R.m.w8(((R.esp + 0x12) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 83ba3a: mov byte ptr [esp + 0x12], al
        if (R.cL) { pc = 62; continue; } // 83ba3e: jl 0x83ba44
        pc = 61; continue;
      case 61: // 83ba40
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.ecx >>> 0)); // 83ba40: mov dword ptr [esp + 0x24], ecx
        pc = 62; continue;
      case 62: // 83ba44
        R.eax = (R.m.u32(((R.esi + 0xb) | 0) >>> 0)) | 0; // 83ba44: mov eax, dword ptr [esi + 0xb]
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.edx >>> 0)); // 83ba47: mov dword ptr [esp + 0x28], edx
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 83ba4b: cmp eax, edx
        if (R.cL) { pc = 64; continue; } // 83ba4d: jl 0x83ba53
        pc = 63; continue;
      case 63: // 83ba4f
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 83ba4f: mov dword ptr [esp + 0x28], eax
        pc = 64; continue;
      case 64: // 83ba53
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 83ba53: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] / R.m.s32(((R.esp + 0x24) | 0) >>> 0); // 83ba57: fidiv dword ptr [esp + 0x24]
        R.st[0] = R.st[0] * R.m.s32(((R.esp + 0x28) | 0) >>> 0); // 83ba5b: fimul dword ptr [esp + 0x28]
        pc = 70; continue; // 83ba5f: jmp 0x83ba8e
      default: return pc;
    }
  }
}
function f_83b6e0_7(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 65: // 83ba61
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 83ba61: cmp ecx, edx
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.edx >>> 0)); // 83ba63: mov dword ptr [esp + 0x28], edx
        if (R.cL) { pc = 67; continue; } // 83ba67: jl 0x83ba6d
        pc = 66; continue;
      case 66: // 83ba69
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.ecx >>> 0)); // 83ba69: mov dword ptr [esp + 0x28], ecx
        pc = 67; continue;
      case 67: // 83ba6d
        R.eax = (R.m.u32(((R.esi + 0xb) | 0) >>> 0)) | 0; // 83ba6d: mov eax, dword ptr [esi + 0xb]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.edx >>> 0)); // 83ba70: mov dword ptr [esp + 0x24], edx
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 83ba74: cmp eax, edx
        if (R.cL) { pc = 69; continue; } // 83ba76: jl 0x83ba7c
        pc = 68; continue;
      case 68: // 83ba78
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.eax >>> 0)); // 83ba78: mov dword ptr [esp + 0x24], eax
        pc = 69; continue;
      case 69: // 83ba7c
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 83ba7c: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] / R.m.s32(((R.esp + 0x28) | 0) >>> 0); // 83ba80: fidiv dword ptr [esp + 0x28]
        R.st[0] = R.st[0] * R.m.s32(((R.esp + 0x24) | 0) >>> 0); // 83ba84: fimul dword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 0.5; // 83ba88: fmul qword ptr [0x968968]
        pc = 70; continue;
      case 70: // 83ba8e
        R.ftol(); // 83ba8e: call 0x945640
        R.m.w32(((R.esi + 0x7) | 0) >>> 0, R.add(R.m.u32(((R.esi + 0x7) | 0) >>> 0), (R.eax >>> 0), 32)); // 83ba93: add dword ptr [esi + 7], eax
        pc = 71; continue;
      case 71: // 83ba96
        R.ecx = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 83ba96: mov ecx, dword ptr [ebx]
        R.push(0x0); // 83ba98: push 0
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.edi + R.ecx + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 83ba9a: mov dl, byte ptr [edi + ecx + 0x24]
        R.eax = (((R.edi + R.ecx + 0x24) | 0)) | 0; // 83ba9e: lea eax, [edi + ecx + 0x24]
        R.ecx = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 83baa2: mov ecx, dword ptr [esp + 0x3c]
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) & 0xfe, 8)) & 0xff) << 0)) | 0; // 83baa6: and dl, 0xfe
        R.m.w8(((R.eax) | 0) >>> 0, ((R.edx >>> 0) & 0xff)); // 83baa9: mov byte ptr [eax], dl
        R.esi = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 83baab: mov esi, dword ptr [ebx]
        R.edx = (R.m.u32(((R.esp + 0x44) | 0) >>> 0)) | 0; // 83baad: mov edx, dword ptr [esp + 0x44]
        R.eax = ((R.edi >>> 0)) | 0; // 83bab1: mov eax, edi
        R.eax = (R.add((R.eax >>> 0), (R.esi >>> 0), 32)) | 0; // 83bab3: add eax, esi
        R.push((R.edx >>> 0)); // 83bab5: push edx
        R.push((R.eax >>> 0)); // 83bab6: push eax
        R.call(0x83f3a0, { n: 3, thisEcx: true, calleeClean: true }); // 83bab7: call 0x83f3a0
        R.ecx = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 83babc: mov ecx, dword ptr [ebx]
        R.eax = (R.m.u32(((R.edi + R.ecx + 0xf) | 0) >>> 0)) | 0; // 83babe: mov eax, dword ptr [edi + ecx + 0xf]
        R.esi = (((R.edi + R.ecx) | 0)) | 0; // 83bac2: lea esi, [edi + ecx]
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 83bac5: cmp eax, -1
        if (R.cLE) { pc = 74; continue; } // 83bac8: jle 0x83baf4
        pc = 72; continue;
      case 72: // 83baca
        R.logic(R.m.u8(((R.esi + 0x24) | 0) >>> 0) & 0x1, 8); // 83baca: test byte ptr [esi + 0x24], 1
        if (!R.zf) { pc = 74; continue; } // 83bace: jne 0x83baf4
        pc = 73; continue;
      default: return pc;
    }
  }
}
function f_83b6e0_8(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 73: // 83bad0
        R.ecx = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 83bad0: mov ecx, dword ptr [0xae23bc]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 83bad6: lea edx, [eax + eax*4]
        R.eax = (((R.eax + R.edx * 2) | 0)) | 0; // 83bad9: lea eax, [eax + edx*2]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 83badc: lea eax, [eax + eax*4]
        R.fpush(R.m.s32(((R.ecx + R.eax * 2 + 0x52) | 0) >>> 0)); // 83badf: fild dword ptr [ecx + eax*2 + 0x52]
        R.st[0] = R.st[0] * -1.3; // 83bae3: fmul qword ptr [0x96f878]
        R.ftol(); // 83bae9: call 0x945640
        R.ebp = (R.add((R.ebp >>> 0), (R.eax >>> 0), 32)) | 0; // 83baee: add ebp, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.ebp >>> 0)); // 83baf0: mov dword ptr [esp + 0x14], ebp
        pc = 74; continue;
      case 74: // 83baf4
        R.edx = (R.m.u32(((R.esi + 0xb) | 0) >>> 0)) | 0; // 83baf4: mov edx, dword ptr [esi + 0xb]
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 83baf7: mov eax, dword ptr [esp + 0x18]
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 83bafb: sub eax, edx
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.eax >>> 0)); // 83bafd: mov dword ptr [esp + 0x18], eax
        pc = 75; continue;
      case 75: // 83bb01
        R.eax = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 83bb01: mov eax, dword ptr [esp + 0x30]
        R.edi = (R.add((R.edi >>> 0), 0x25, 32)) | 0; // 83bb05: add edi, 0x25
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 83bb08: dec eax
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.eax >>> 0)); // 83bb09: mov dword ptr [esp + 0x30], eax
        if (!R.zf) { pc = 39; continue; } // 83bb0d: jne 0x83b91a
        pc = 76; continue;
      case 76: // 83bb13
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x11) | 0) >>> 0)) & 0xff) << 0)) | 0; // 83bb13: mov al, byte ptr [esp + 0x11]
        pc = 77; continue;
      case 77: // 83bb17
        R.sub(((R.eax >>> 0) & 0xff), 0x28, 8); // 83bb17: cmp al, 0x28
        R.ebx = ((R.ebx & 0xffffff00) | (((((R.eax >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 83bb19: mov bl, al
        if (!R.cL) { pc = 102; continue; } // 83bb1b: jge 0x83bcc6
        pc = 78; continue;
      case 78: // 83bb21
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 83bb21: test ebp, ebp
        if (R.cLE) { pc = 102; continue; } // 83bb23: jle 0x83bcc6
        pc = 79; continue;
      case 79: // 83bb29
        R.eax = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 83bb29: movsx eax, bl
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 83bb2c: lea ecx, [eax + eax*8]
        R.edx = (((R.eax + R.ecx * 4) | 0)) | 0; // 83bb2f: lea edx, [eax + ecx*4]
        R.eax = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 83bb32: mov eax, dword ptr [esp + 0x1c]
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 83bb36: mov ecx, dword ptr [eax]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + R.edx) | 0) >>> 0)) & 0xff) << 0)) | 0; // 83bb38: mov al, byte ptr [ecx + edx]
        R.ecx = (R.add((R.ecx >>> 0), (R.edx >>> 0), 32)) | 0; // 83bb3b: add ecx, edx
        R.sub(((R.eax >>> 0) & 0xff), 0xb, 8); // 83bb3d: cmp al, 0xb
        if (!R.zf) { pc = 99; continue; } // 83bb3f: jne 0x83bc9d
        pc = 80; continue;
      case 80: // 83bb45
        R.eax = (R.m.u32(((R.ecx + 0xf) | 0) >>> 0)) | 0; // 83bb45: mov eax, dword ptr [ecx + 0xf]
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 83bb48: cmp eax, -1
        if (R.cLE) { pc = 99; continue; } // 83bb4b: jle 0x83bc9d
        pc = 81; continue;
      case 81: // 83bb51
        R.sub(R.m.u32(((R.ecx + 0x17) | 0) >>> 0), 0xffffffff, 32); // 83bb51: cmp dword ptr [ecx + 0x17], -1
        if (!R.zf) { pc = 99; continue; } // 83bb55: jne 0x83bc9d
        pc = 82; continue;
      default: return pc;
    }
  }
}
function f_83b6e0_9(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 82: // 83bb5b
        R.ecx = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 83bb5b: mov ecx, dword ptr [0xae23bc]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 83bb61: lea edx, [eax + eax*4]
        R.eax = (((R.eax + R.edx * 2) | 0)) | 0; // 83bb64: lea eax, [eax + edx*2]
        R.edx = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 83bb67: mov edx, dword ptr [esp + 0x40]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 83bb6b: lea eax, [eax + eax*4]
        R.edi = (((R.ecx + R.eax * 2) | 0)) | 0; // 83bb6e: lea edi, [ecx + eax*2]
        R.eax = (R.m.u32(((R.ecx + R.eax * 2 + 0x39) | 0) >>> 0)) | 0; // 83bb71: mov eax, dword ptr [ecx + eax*2 + 0x39]
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 83bb75: cmp eax, edx
        if (!R.zf) { pc = 99; continue; } // 83bb77: jne 0x83bc9d
        pc = 83; continue;
      case 83: // 83bb7d
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 83bb7d: mov ecx, dword ptr [0xae1050]
        R.push((R.edi >>> 0)); // 83bb83: push edi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 83bb84: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83bb89: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 83bb8b: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 85; continue; } // 83bb90: je 0x83bbaa
        pc = 84; continue;
      case 84: // 83bb92
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 83bb92: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 83bb95: mov edx, dword ptr [0xae23b4]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 83bb9b: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 83bb9e: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 83bba1: add ecx, eax
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 83bba3: add edx, eax
        R.eax = (((R.edx + R.ecx * 4) | 0)) | 0; // 83bba5: lea eax, [edx + ecx*4]
        pc = 86; continue; // 83bba8: jmp 0x83bbac
      case 85: // 83bbaa
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 83bbaa: xor eax, eax
        pc = 86; continue;
      case 86: // 83bbac
        R.sub((R.eax >>> 0), R.m.u32(((R.esp + 0x40) | 0) >>> 0), 32); // 83bbac: cmp eax, dword ptr [esp + 0x40]
        if (R.zf) { pc = 99; continue; } // 83bbb0: je 0x83bc9d
        pc = 87; continue;
      case 87: // 83bbb6
        R.push(0x0); // 83bbb6: push 0
        R.push((R.edi >>> 0)); // 83bbb8: push edi
        R.call(0x544590, { n: 2, thisEcx: false, calleeClean: false }); // 83bbb9: call 0x544590
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 83bbbe: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83bbc1: test eax, eax
        if (!R.zf) { pc = 99; continue; } // 83bbc3: jne 0x83bc9d
        pc = 88; continue;
      case 88: // 83bbc9
        R.eax = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 83bbc9: mov eax, dword ptr [esp + 0x40]
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 83bbcd: mov ecx, dword ptr [0xae1050]
        R.push((R.eax >>> 0)); // 83bbd3: push eax
        R.push((R.edi >>> 0)); // 83bbd4: push edi
        R.call(0x4cf5f0, { n: 2, thisEcx: true, calleeClean: true }); // 83bbd5: call 0x4cf5f0
        R.esi = ((R.eax >>> 0)) | 0; // 83bbda: mov esi, eax
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 83bbdc: test esi, esi
        if (R.zf) { pc = 90; continue; } // 83bbde: je 0x83bbeb
        pc = 89; continue;
      case 89: // 83bbe0
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esi + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 83bbe0: mov cl, byte ptr [esi + 0x4f]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.shr(((R.ecx >>> 0) & 0xff), 0x4, 8)) & 0xff) << 0)) | 0; // 83bbe3: shr cl, 4
        R.eax = (((((R.ecx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 83bbe6: movsx eax, cl
        pc = 91; continue; // 83bbe9: jmp 0x83bbf0
      default: return pc;
    }
  }
}
function f_83b6e0_10(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 90: // 83bbeb
        R.eax = (0x4) | 0; // 83bbeb: mov eax, 4
        pc = 91; continue;
      case 91: // 83bbf0
        R.edx = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 83bbf0: mov edx, dword ptr [esp + 0x40]
        R.ecx = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 83bbf4: mov ecx, dword ptr [esp + 0x38]
        R.push(0x0); // 83bbf8: push 0
        R.push((R.eax >>> 0)); // 83bbfa: push eax
        R.push(0x0); // 83bbfb: push 0
        R.push(0x1); // 83bbfd: push 1
        R.push((R.edx >>> 0)); // 83bbff: push edx
        R.push((R.edi >>> 0)); // 83bc00: push edi
        R.call(0x846920, { n: 6, thisEcx: true, calleeClean: true, float: true }); // 83bc01: call 0x846920
        R.fcom(R.st[0], 3.15); R.fpop(); // 83bc06: fcomp qword ptr [0x968e58]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 83bc0c: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 83bc0e: test ah, 1
        if (!R.zf) { pc = 99; continue; } // 83bc11: jne 0x83bc9d
        pc = 92; continue;
      case 92: // 83bc17
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 83bc17: test esi, esi
        if (R.zf) { pc = 94; continue; } // 83bc19: je 0x83bc3e
        pc = 93; continue;
      case 93: // 83bc1b
        R.push(0xa); // 83bc1b: push 0xa
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 83bc1d: call 0x90cfc0
        R.ebp = (0x14) | 0; // 83bc22: mov ebp, 0x14
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 83bc27: add esp, 4
        R.ecx = ((R.esi >>> 0)) | 0; // 83bc2a: mov ecx, esi
        R.ebp = (R.sub((R.ebp >>> 0), (R.eax >>> 0), 32)) | 0; // 83bc2c: sub ebp, eax
        R.call(0x85fa00, { n: 0, thisEcx: true, calleeClean: false }); // 83bc2e: call 0x85fa00
        R.eax = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 83bc33: movsx eax, ax
        R.sub((R.eax >>> 0), (R.ebp >>> 0), 32); // 83bc36: cmp eax, ebp
        R.ebp = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 83bc38: mov ebp, dword ptr [esp + 0x14]
        if (R.cL) { pc = 101; continue; } // 83bc3c: jl 0x83bca9
        pc = 94; continue;
      case 94: // 83bc3e
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 83bc3e: mov ecx, dword ptr [0xde1f54]
        R.push(0x0); // 83bc44: push 0
        R.push(0x0); // 83bc46: push 0
        R.push((R.edi >>> 0)); // 83bc48: push edi
        R.call(0x8c5cf0, { n: 3, thisEcx: true, calleeClean: true }); // 83bc49: call 0x8c5cf0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83bc4e: test eax, eax
        if (!R.zf) { pc = 101; continue; } // 83bc50: jne 0x83bca9
        pc = 95; continue;
      case 95: // 83bc52
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 83bc52: test esi, esi
        if (R.zf) { pc = 99; continue; } // 83bc54: je 0x83bc9d
        pc = 96; continue;
      default: return pc;
    }
  }
}
function f_83b6e0_11(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 96: // 83bc56
        R.push(0x64); // 83bc56: push 0x64
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 83bc58: call 0x90cfc0
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 83bc5d: add esp, 4
        R.eax = (R.add((R.eax >>> 0), 0x1e, 32)) | 0; // 83bc60: add eax, 0x1e
        R.ecx = (((R.esp + 0x28) | 0)) | 0; // 83bc63: lea ecx, [esp + 0x28]
        R.push((R.eax >>> 0)); // 83bc67: push eax
        R.push((R.ecx >>> 0)); // 83bc68: push ecx
        R.ecx = (0xae2c90) | 0; // 83bc69: mov ecx, 0xae2c90
        R.call(0x54c8e0, { n: 2, thisEcx: true, calleeClean: true }); // 83bc6e: call 0x54c8e0
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 83bc73: mov ecx, dword ptr [eax]
        R.edx = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 83bc75: mov edx, dword ptr [eax + 4]
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.esi + 0x27) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 83bc78: mov ax, word ptr [esi + 0x27]
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.ecx >>> 0)); // 83bc7c: mov dword ptr [esp + 0x30], ecx
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.edx >>> 0)); // 83bc80: mov dword ptr [esp + 0x34], edx
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.esp + 0x32) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 83bc84: mov dx, word ptr [esp + 0x32]
        R.sub(((R.edx >>> 0) & 0xffff), ((R.eax >>> 0) & 0xffff), 16); // 83bc89: cmp dx, ax
        if (!R.cBE) { pc = 101; continue; } // 83bc8c: ja 0x83bca9
        pc = 97; continue;
      case 97: // 83bc8e
        if (R.cf) { pc = 99; continue; } // 83bc8e: jb 0x83bc9d
        pc = 98; continue;
      case 98: // 83bc90
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 83bc90: xor eax, eax
        R.sub(((R.ecx >>> 0) & 0xffff), R.m.u16(((R.esi + 0x25) | 0) >>> 0), 16); // 83bc92: cmp cx, word ptr [esi + 0x25]
        R.eax = ((R.eax & 0xffffff00) | (((!R.cLE ? 1 : 0) & 0xff) << 0)) | 0; // 83bc96: setg al
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83bc99: test eax, eax
        if (!R.zf) { pc = 101; continue; } // 83bc9b: jne 0x83bca9
        pc = 99; continue;
      case 99: // 83bc9d
        R.ebx = ((R.ebx & 0xffffff00) | (((R.incdec(((R.ebx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 83bc9d: inc bl
        R.sub(((R.ebx >>> 0) & 0xff), 0x28, 8); // 83bc9f: cmp bl, 0x28
        if (!R.cL) { pc = 102; continue; } // 83bca2: jge 0x83bcc6
        pc = 100; continue;
      case 100: // 83bca4
        pc = 78; continue; // 83bca4: jmp 0x83bb21
      case 101: // 83bca9
        R.edx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 83bca9: mov edx, dword ptr [esp + 0x1c]
        R.eax = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 83bcad: movsx eax, bl
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 83bcb0: lea ecx, [eax + eax*8]
        R.eax = (((R.eax + R.ecx * 4) | 0)) | 0; // 83bcb3: lea eax, [eax + ecx*4]
        R.ecx = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 83bcb6: mov ecx, dword ptr [edx]
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 83bcb8: add ecx, eax
        R.esi = (R.m.u32(((R.ecx + 0x3) | 0) >>> 0)) | 0; // 83bcba: mov esi, dword ptr [ecx + 3]
        R.m.w32(((R.ecx + 0xb) | 0) >>> 0, (R.esi >>> 0)); // 83bcbd: mov dword ptr [ecx + 0xb], esi
        R.edx = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 83bcc0: mov edx, dword ptr [edx]
        R.m.w32(((R.eax + R.edx + 0x7) | 0) >>> 0, (R.ebp >>> 0)); // 83bcc2: mov dword ptr [eax + edx + 7], ebp
        pc = 102; continue;
      case 102: // 83bcc6
        R.edi = (R.pop()) | 0; // 83bcc6: pop edi
        R.esi = (R.pop()) | 0; // 83bcc7: pop esi
        R.ebp = (R.pop()) | 0; // 83bcc8: pop ebp
        R.ebx = (R.pop()) | 0; // 83bcc9: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x2c, 32)) | 0; // 83bcca: add esp, 0x2c
        R.rv = R.ret(1); return -1; // 83bccd: ret 4
      default: return pc;
    }
  }
}
export function f_83b6e0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 103) throw new Error(`f_83b6e0: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_83b6e0_0(R, pc); break;
      case 1: np = f_83b6e0_1(R, pc); break;
      case 2: np = f_83b6e0_2(R, pc); break;
      case 3: np = f_83b6e0_3(R, pc); break;
      case 4: np = f_83b6e0_4(R, pc); break;
      case 5: np = f_83b6e0_5(R, pc); break;
      case 6: np = f_83b6e0_6(R, pc); break;
      case 7: np = f_83b6e0_7(R, pc); break;
      case 8: np = f_83b6e0_8(R, pc); break;
      case 9: np = f_83b6e0_9(R, pc); break;
      case 10: np = f_83b6e0_10(R, pc); break;
      case 11: np = f_83b6e0_11(R, pc); break;
      default: throw new Error(`f_83b6e0: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_83b6e0: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_83b6e0.shared = true;
