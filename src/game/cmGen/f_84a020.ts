// 0x84a020 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4cc490=7tc, 4cc9e0=2tc, 4cda70=7tc, 4cf5a0=1c, 4cf5f0=2tc, 53b900=1, 53c590=3, 53ca90=1, 54c5b0=2tc, 5968d0=2tc, 5a0590=1tc, 5fd210=1c, 5fea50=2c, 600a50=5, 62ed70=1tc, 842740=2tc, 843e10=4tc, 844540=2tc, 849ce0=4tc, 85e410=0t, 85fc50=7tc, 8be300=2tc, 8c5450=2tc, 8c5e40=2tc, 8cca10=2tc, 8cdc90=2tc, 8cde70=2tc, 8ce990=4tc, 8ced40=6tc, 8d0040=3tc, 8e5680=0t, 8e5710=0t, 8e5d60=6tc, 944c94=1
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x84a020, 0x84a08e, 0x84a0a4, 0x84a0b7, 0x84a0d0, 0x84a0ef, 0x84a10a, 0x84a114, 0x84a128, 0x84a155, 0x84a159, 0x84a181, 0x84a189, 0x84a195, 0x84a19f, 0x84a1c5, 0x84a1dd, 0x84a1df, 0x84a1e7, 0x84a1ef, 0x84a200, 0x84a202, 0x84a210, 0x84a216, 0x84a21e, 0x84a220, 0x84a224, 0x84a226, 0x84a234, 0x84a23a, 0x84a242, 0x84a244, 0x84a248, 0x84a24a, 0x84a258, 0x84a25e, 0x84a266, 0x84a268, 0x84a26c, 0x84a27a, 0x84a27c, 0x84a280, 0x84a28e, 0x84a2a4, 0x84a2ac, 0x84a2c2, 0x84a2d7, 0x84a2de, 0x84a2e8, 0x84a301, 0x84a308, 0x84a310, 0x84a328, 0x84a334, 0x84a349, 0x84a35e, 0x84a376, 0x84a37f, 0x84a384, 0x84a38f, 0x84a396, 0x84a39e, 0x84a3aa, 0x84a3b9, 0x84a3be, 0x84a3c7, 0x84a3cc, 0x84a3d5, 0x84a3da, 0x84a3e1, 0x84a3eb, 0x84a3f4, 0x84a409, 0x84a421, 0x84a423, 0x84a441, 0x84a449, 0x84a45e, 0x84a463, 0x84a467, 0x84a496, 0x84a4e9, 0x84a4f0, 0x84a515, 0x84a527, 0x84a548, 0x84a550, 0x84a559, 0x84a572, 0x84a590, 0x84a59c, 0x84a5b1, 0x84a5c9, 0x84a5cb, 0x84a5e0, 0x84a5e9, 0x84a63d, 0x84a64a, 0x84a697, 0x84a6c2, 0x84a71b, 0x84a739, 0x84a77a, 0x84a798, 0x84a7b1, 0x84a7ca, 0x84a7df, 0x84a7f2, 0x84a7f9, 0x84a810, 0x84a81d, 0x84a827, 0x84a82e, 0x84a87e, 0x84a89e, 0x84a8af, 0x84a8bf, 0x84a8cf, 0x84a8e6, 0x84a900, 0x84a904, 0x84a952, 0x84a964, 0x84a975, 0x84a985, 0x84a990, 0x84a9a3, 0x84a9ab, 0x84a9b4, 0x84a9ce, 0x84a9d4, 0x84a9ef, 0x84aa05, 0x84aa0c, 0x84aa17, 0x84aa21, 0x84aa38, 0x84aa4d, 0x84aa67, 0x84aa7c, 0x84aa94, 0x84aa96, 0x84aaab, 0x84aac1, 0x84aad6, 0x84aaeb, 0x84ab26, 0x84ab52, 0x84ab7f, 0x84ab85, 0x84ab99, 0x84abab]);
const CH = new Uint8Array([0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 10, 10, 10, 11, 11, 11, 11, 12, 12, 13, 13, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20, 20, 20, 21, 21, 21, 21, 21, 22]);
function f_84a020_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 84a020
        R.push((R.ebp >>> 0)); // 84a020: push ebp
        R.ebp = ((R.esp >>> 0)) | 0; // 84a021: mov ebp, esp
        R.esp = (R.logic((R.esp >>> 0) & 0xfffffff8, 32)) | 0; // 84a023: and esp, 0xfffffff8
        R.push(0xffffffff); // 84a026: push -1
        R.push(0x9625a9); // 84a028: push 0x9625a9
        R.eax = (0) | 0; // 84a02d: mov eax, dword ptr fs:[0]
        R.push((R.eax >>> 0)); // 84a033: push eax
        /* fs */ // 84a034: mov dword ptr fs:[0], esp
        R.esp = (R.sub((R.esp >>> 0), 0x11c, 32)) | 0; // 84a03b: sub esp, 0x11c
        R.push((R.ebx >>> 0)); // 84a041: push ebx
        R.push((R.esi >>> 0)); // 84a042: push esi
        R.push((R.edi >>> 0)); // 84a043: push edi
        R.edi = ((R.ecx >>> 0)) | 0; // 84a044: mov edi, ecx
        R.eax = (((R.esp + 0x3c) | 0)) | 0; // 84a046: lea eax, [esp + 0x3c]
        R.push(0x7); // 84a04a: push 7
        R.push((R.eax >>> 0)); // 84a04c: push eax
        R.ecx = (0xae2c90) | 0; // 84a04d: mov ecx, 0xae2c90
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 84a052: mov dword ptr [esp + 0x38], edi
        R.call(0x54c5b0, { n: 2, thisEcx: true, calleeClean: true }); // 84a056: call 0x54c5b0
        R.ecx = (((R.esp + 0xd8) | 0)) | 0; // 84a05b: lea ecx, [esp + 0xd8]
        R.m.w32(((R.esp + 0x130) | 0) >>> 0, 0x0); // 84a062: mov dword ptr [esp + 0x130], 0
        R.call(0x85e410, { n: 0, thisEcx: true, calleeClean: false }); // 84a06d: call 0x85e410
        R.ebx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 84a072: mov ebx, dword ptr [ebp + 8]
        R.m.w8(((R.esp + 0x130) | 0) >>> 0, 0x1); // 84a075: mov byte ptr [esp + 0x130], 1
        R.push((R.ebx >>> 0)); // 84a07d: push ebx
        R.call(0x53b900, { n: 1, thisEcx: false, calleeClean: false }); // 84a07e: call 0x53b900
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 84a083: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84a086: test eax, eax
        if (!R.zf) { pc = 151; continue; } // 84a088: jne 0x84abab
        pc = 1; continue;
      case 1: // 84a08e
        R.push((R.eax >>> 0)); // 84a08e: push eax
        R.push((R.eax >>> 0)); // 84a08f: push eax
        R.push(0x1); // 84a090: push 1
        R.push((R.eax >>> 0)); // 84a092: push eax
        R.push((R.ebx >>> 0)); // 84a093: push ebx
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 84a094: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 84a099: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84a09c: test eax, eax
        if (!R.zf) { pc = 151; continue; } // 84a09e: jne 0x84abab
        pc = 2; continue;
      case 2: // 84a0a4
        R.push((R.eax >>> 0)); // 84a0a4: push eax
        R.push((R.eax >>> 0)); // 84a0a5: push eax
        R.push(0x1); // 84a0a6: push 1
        R.push(0x1); // 84a0a8: push 1
        R.push((R.ebx >>> 0)); // 84a0aa: push ebx
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 84a0ab: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 84a0b0: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84a0b3: test eax, eax
        if (R.zf) { pc = 5; continue; } // 84a0b5: je 0x84a0ef
        pc = 3; continue;
      default: return pc;
    }
  }
}
function f_84a020_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 3: // 84a0b7
        R.push((R.ebx >>> 0)); // 84a0b7: push ebx
        R.call(0x53ca90, { n: 1, thisEcx: false, calleeClean: false }); // 84a0b8: call 0x53ca90
        R.ecx = (R.m.u32(((0xb63c98) | 0) >>> 0)) | 0; // 84a0bd: mov ecx, dword ptr [0xb63c98]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 84a0c3: add esp, 4
        R.push((R.eax >>> 0)); // 84a0c6: push eax
        R.call(0x5fd210, { n: 1, thisEcx: false, calleeClean: true }); // 84a0c7: call 0x5fd210
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84a0cc: test eax, eax
        if (R.zf) { pc = 5; continue; } // 84a0ce: je 0x84a0ef
        pc = 4; continue;
      case 4: // 84a0d0
        R.push((R.ebx >>> 0)); // 84a0d0: push ebx
        R.call(0x53ca90, { n: 1, thisEcx: false, calleeClean: false }); // 84a0d1: call 0x53ca90
        R.ecx = (R.m.u32(((0xb63c98) | 0) >>> 0)) | 0; // 84a0d6: mov ecx, dword ptr [0xb63c98]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 84a0dc: add esp, 4
        R.push((R.eax >>> 0)); // 84a0df: push eax
        R.push(0x4); // 84a0e0: push 4
        R.call(0x5fea50, { n: 2, thisEcx: false, calleeClean: true }); // 84a0e2: call 0x5fea50
        R.sub(((R.eax >>> 0) & 0xff), 0x1, 8); // 84a0e7: cmp al, 1
        if (R.zf) { pc = 151; continue; } // 84a0e9: je 0x84abab
        pc = 5; continue;
      case 5: // 84a0ef
        R.esi = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 84a0ef: mov esi, dword ptr [ebx]
        R.ecx = (R.m.u32(((R.edi + 0xdc) | 0) >>> 0)) | 0; // 84a0f1: mov ecx, dword ptr [edi + 0xdc]
        R.esi = (((R.esi + R.esi * 8) | 0)) | 0; // 84a0f7: lea esi, [esi + esi*8]
        R.esi = (R.add((R.esi >>> 0), (R.ecx >>> 0), 32)) | 0; // 84a0fa: add esi, ecx
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.esi >>> 0)); // 84a0fc: mov dword ptr [esp + 0x18], esi
        R.sub(R.m.u8(((R.esi + 0x4) | 0) >>> 0), 0x1, 8); // 84a100: cmp byte ptr [esi + 4], 1
        if (!R.zf) { pc = 151; continue; } // 84a104: jne 0x84abab
        pc = 6; continue;
      case 6: // 84a10a
        R.sub(R.m.u8(((R.esi + 0x8) | 0) >>> 0), 0x64, 8); // 84a10a: cmp byte ptr [esi + 8], 0x64
        if (!R.cf) { pc = 151; continue; } // 84a10e: jae 0x84abab
        pc = 7; continue;
      case 7: // 84a114
        R.ecx = (R.m.u32(((0xae2a38) | 0) >>> 0)) | 0; // 84a114: mov ecx, dword ptr [0xae2a38]
        R.push((R.ebx >>> 0)); // 84a11a: push ebx
        R.call(0x5a0590, { n: 1, thisEcx: true, calleeClean: true }); // 84a11b: call 0x5a0590
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84a120: test eax, eax
        if (R.zf) { pc = 151; continue; } // 84a122: je 0x84abab
        pc = 8; continue;
      case 8: // 84a128
        R.push(0xb); // 84a128: push 0xb
        R.push((R.ebx >>> 0)); // 84a12a: push ebx
        R.ecx = ((R.edi >>> 0)) | 0; // 84a12b: mov ecx, edi
        R.call(0x844540, { n: 2, thisEcx: true, calleeClean: true }); // 84a12d: call 0x844540
        R.push(0x0); // 84a132: push 0
        R.push(0x0); // 84a134: push 0
        R.push((R.ebx >>> 0)); // 84a136: push ebx
        R.m.w8(((R.esp + 0x23) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 84a137: mov byte ptr [esp + 0x23], al
        R.call(0x53c590, { n: 3, thisEcx: false, calleeClean: false }); // 84a13b: call 0x53c590
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esp + 0x23) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84a140: mov cl, byte ptr [esp + 0x23]
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 84a144: add esp, 0xc
        R.ecx = ((R.ecx & 0xffffff00) | (((R.add(((R.ecx >>> 0) & 0xff), ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 84a147: add cl, al
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 84a149: xor al, al
        R.m.w8(((R.esp + 0xf) | 0) >>> 0, ((R.ecx >>> 0) & 0xff)); // 84a14b: mov byte ptr [esp + 0xf], cl
        R.m.w8(((R.esp + 0x17) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 84a14f: mov byte ptr [esp + 0x17], al
        pc = 10; continue; // 84a153: jmp 0x84a159
      default: return pc;
    }
  }
}
function f_84a020_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 9: // 84a155
        R.esi = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 84a155: mov esi, dword ptr [esp + 0x18]
        pc = 10; continue;
      case 10: // 84a159
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 84a159: movsx eax, al
        R.ecx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 84a15c: mov ecx, dword ptr [esi]
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 84a15e: lea edx, [eax + eax*8]
        R.eax = (((R.eax + R.edx * 4) | 0)) | 0; // 84a161: lea eax, [eax + edx*4]
        R.edx = (R.logic((R.edx >>> 0) ^ (R.edx >>> 0), 32)) | 0; // 84a164: xor edx, edx
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 84a166: add ecx, eax
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 84a168: mov dword ptr [esp + 0x1c], eax
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84a16c: mov al, byte ptr [ecx]
        R.sub(((R.eax >>> 0) & 0xff), 0xb, 8); // 84a16e: cmp al, 0xb
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0xf) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84a170: mov al, byte ptr [esp + 0xf]
        R.edx = ((R.edx & 0xffffff00) | (((R.zf ? 1 : 0) & 0xff) << 0)) | 0; // 84a174: sete dl
        R.edi = ((R.edx >>> 0)) | 0; // 84a177: mov edi, edx
        R.sub(((R.eax >>> 0) & 0xff), 0x32, 8); // 84a179: cmp al, 0x32
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 84a17b: mov dword ptr [esp + 0x38], edi
        if (R.cL) { pc = 12; continue; } // 84a17f: jl 0x84a189
        pc = 11; continue;
      case 11: // 84a181
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 84a181: test edi, edi
        if (!R.zf) { pc = 150; continue; } // 84a183: jne 0x84ab99
        pc = 12; continue;
      case 12: // 84a189
        R.eax = (R.m.u32(((R.ecx + 0xf) | 0) >>> 0)) | 0; // 84a189: mov eax, dword ptr [ecx + 0xf]
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 84a18c: cmp eax, -1
        if (R.cLE) { pc = 150; continue; } // 84a18f: jle 0x84ab99
        pc = 13; continue;
      case 13: // 84a195
        R.sub(R.m.u32(((R.ecx + 0x17) | 0) >>> 0), 0xffffffff, 32); // 84a195: cmp dword ptr [ecx + 0x17], -1
        if (!R.zf) { pc = 150; continue; } // 84a199: jne 0x84ab99
        pc = 14; continue;
      case 14: // 84a19f
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 84a19f: lea ecx, [eax + eax*4]
        R.eax = (((R.eax + R.ecx * 2) | 0)) | 0; // 84a1a2: lea eax, [eax + ecx*2]
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 84a1a5: mov ecx, dword ptr [0xae1050]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 84a1ab: lea edx, [eax + eax*4]
        R.eax = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 84a1ae: mov eax, dword ptr [0xae23bc]
        R.esi = (((R.eax + R.edx * 2) | 0)) | 0; // 84a1b3: lea esi, [eax + edx*2]
        R.push((R.esi >>> 0)); // 84a1b6: push esi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 84a1b7: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84a1bc: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 84a1be: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 16; continue; } // 84a1c3: je 0x84a1dd
        pc = 15; continue;
      case 15: // 84a1c5
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 84a1c5: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 84a1c8: mov edx, dword ptr [0xae23b4]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 84a1ce: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 84a1d1: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 84a1d4: add ecx, eax
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 84a1d6: add edx, eax
        R.eax = (((R.edx + R.ecx * 4) | 0)) | 0; // 84a1d8: lea eax, [edx + ecx*4]
        pc = 17; continue; // 84a1db: jmp 0x84a1df
      case 16: // 84a1dd
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 84a1dd: xor eax, eax
        pc = 17; continue;
      default: return pc;
    }
  }
}
function f_84a020_3(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 17: // 84a1df
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 84a1df: cmp eax, ebx
        if (R.zf) { pc = 150; continue; } // 84a1e1: je 0x84ab99
        pc = 18; continue;
      case 18: // 84a1e7
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 84a1e7: test edi, edi
        if (!R.zf) { pc = 42; continue; } // 84a1e9: jne 0x84a28e
        pc = 19; continue;
      case 19: // 84a1ef
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 84a1ef: mov eax, dword ptr [esp + 0x18]
        R.edx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 84a1f3: mov edx, dword ptr [esp + 0x1c]
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 84a1f7: mov ecx, dword ptr [eax]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + R.edx) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84a1f9: mov al, byte ptr [ecx + edx]
        R.sub(((R.eax >>> 0) & 0xff), 0x8, 8); // 84a1fc: cmp al, 8
        if (!R.zf) { pc = 25; continue; } // 84a1fe: jne 0x84a220
        pc = 20; continue;
      case 20: // 84a200
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 84a200: xor al, al
        pc = 21; continue;
      case 21: // 84a202
        R.ecx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 84a202: movsx ecx, al
        R.edx = (R.m.u32(((R.ebx + R.ecx * 4 + 0x19f) | 0) >>> 0)) | 0; // 84a205: mov edx, dword ptr [ebx + ecx*4 + 0x19f]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 84a20c: test edx, edx
        if (R.zf) { pc = 23; continue; } // 84a20e: je 0x84a216
        pc = 22; continue;
      case 22: // 84a210
        R.eax = ((R.eax & 0xffffff00) | (((R.incdec(((R.eax >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 84a210: inc al
        R.sub(((R.eax >>> 0) & 0xff), 0x5, 8); // 84a212: cmp al, 5
        if (R.cL) { pc = 21; continue; } // 84a214: jl 0x84a202
        pc = 23; continue;
      case 23: // 84a216
        R.sub(((R.eax >>> 0) & 0xff), 0x5, 8); // 84a216: cmp al, 5
        if (R.zf) { pc = 150; continue; } // 84a218: je 0x84ab99
        pc = 24; continue;
      case 24: // 84a21e
        pc = 42; continue; // 84a21e: jmp 0x84a28e
      case 25: // 84a220
        R.sub(((R.eax >>> 0) & 0xff), 0x9, 8); // 84a220: cmp al, 9
        if (!R.zf) { pc = 31; continue; } // 84a222: jne 0x84a244
        pc = 26; continue;
      case 26: // 84a224
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 84a224: xor al, al
        pc = 27; continue;
      case 27: // 84a226
        R.edx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 84a226: movsx edx, al
        R.ecx = (R.m.u32(((R.ebx + R.edx * 4 + 0x1b3) | 0) >>> 0)) | 0; // 84a229: mov ecx, dword ptr [ebx + edx*4 + 0x1b3]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 84a230: test ecx, ecx
        if (R.zf) { pc = 29; continue; } // 84a232: je 0x84a23a
        pc = 28; continue;
      case 28: // 84a234
        R.eax = ((R.eax & 0xffffff00) | (((R.incdec(((R.eax >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 84a234: inc al
        R.sub(((R.eax >>> 0) & 0xff), 0x7, 8); // 84a236: cmp al, 7
        if (R.cL) { pc = 27; continue; } // 84a238: jl 0x84a226
        pc = 29; continue;
      case 29: // 84a23a
        R.sub(((R.eax >>> 0) & 0xff), 0x7, 8); // 84a23a: cmp al, 7
        if (R.zf) { pc = 150; continue; } // 84a23c: je 0x84ab99
        pc = 30; continue;
      case 30: // 84a242
        pc = 42; continue; // 84a242: jmp 0x84a28e
      default: return pc;
    }
  }
}
function f_84a020_4(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 31: // 84a244
        R.sub(((R.eax >>> 0) & 0xff), 0xa, 8); // 84a244: cmp al, 0xa
        if (!R.zf) { pc = 37; continue; } // 84a246: jne 0x84a268
        pc = 32; continue;
      case 32: // 84a248
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 84a248: xor al, al
        pc = 33; continue;
      case 33: // 84a24a
        R.ecx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 84a24a: movsx ecx, al
        R.edx = (R.m.u32(((R.ebx + R.ecx * 4 + 0x1cf) | 0) >>> 0)) | 0; // 84a24d: mov edx, dword ptr [ebx + ecx*4 + 0x1cf]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 84a254: test edx, edx
        if (R.zf) { pc = 35; continue; } // 84a256: je 0x84a25e
        pc = 34; continue;
      case 34: // 84a258
        R.eax = ((R.eax & 0xffffff00) | (((R.incdec(((R.eax >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 84a258: inc al
        R.sub(((R.eax >>> 0) & 0xff), 0x3, 8); // 84a25a: cmp al, 3
        if (R.cL) { pc = 33; continue; } // 84a25c: jl 0x84a24a
        pc = 35; continue;
      case 35: // 84a25e
        R.sub(((R.eax >>> 0) & 0xff), 0x3, 8); // 84a25e: cmp al, 3
        if (R.zf) { pc = 150; continue; } // 84a260: je 0x84ab99
        pc = 36; continue;
      case 36: // 84a266
        pc = 42; continue; // 84a266: jmp 0x84a28e
      case 37: // 84a268
        R.sub(((R.eax >>> 0) & 0xff), 0x6, 8); // 84a268: cmp al, 6
        if (!R.zf) { pc = 40; continue; } // 84a26a: jne 0x84a27c
        pc = 38; continue;
      case 38: // 84a26c
        R.eax = (R.m.u32(((R.ebx + 0xd3) | 0) >>> 0)) | 0; // 84a26c: mov eax, dword ptr [ebx + 0xd3]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84a272: test eax, eax
        if (!R.zf) { pc = 150; continue; } // 84a274: jne 0x84ab99
        pc = 39; continue;
      case 39: // 84a27a
        pc = 42; continue; // 84a27a: jmp 0x84a28e
      case 40: // 84a27c
        R.sub(((R.eax >>> 0) & 0xff), 0x7, 8); // 84a27c: cmp al, 7
        if (!R.zf) { pc = 42; continue; } // 84a27e: jne 0x84a28e
        pc = 41; continue;
      case 41: // 84a280
        R.eax = (R.m.u32(((R.ebx + 0xd3) | 0) >>> 0)) | 0; // 84a280: mov eax, dword ptr [ebx + 0xd3]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84a286: test eax, eax
        if (!R.zf) { pc = 150; continue; } // 84a288: jne 0x84ab99
        pc = 42; continue;
      case 42: // 84a28e
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 84a28e: mov eax, dword ptr [esi]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 84a290: lea edx, [eax + eax*4]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 84a293: shl edx, 4
        R.edx = (R.sub((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 84a296: sub edx, eax
        R.eax = (R.m.u32(((0xae2d0c) | 0) >>> 0)) | 0; // 84a298: mov eax, dword ptr [0xae2d0c]
        R.logic(R.m.u8(((R.edx + R.eax + 0xb) | 0) >>> 0) & 0x30, 8); // 84a29d: test byte ptr [edx + eax + 0xb], 0x30
        if (R.zf) { pc = 44; continue; } // 84a2a2: je 0x84a2ac
        pc = 43; continue;
      case 43: // 84a2a4
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 84a2a4: test edi, edi
        if (!R.zf) { pc = 150; continue; } // 84a2a6: jne 0x84ab99
        pc = 44; continue;
      default: return pc;
    }
  }
}
function f_84a020_5(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 44: // 84a2ac
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 84a2ac: mov ecx, dword ptr [0xde1f54]
        R.push(0x0); // 84a2b2: push 0
        R.push((R.esi >>> 0)); // 84a2b4: push esi
        R.call(0x8cca10, { n: 2, thisEcx: true, calleeClean: true }); // 84a2b5: call 0x8cca10
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84a2ba: test eax, eax
        if (!R.zf) { pc = 150; continue; } // 84a2bc: jne 0x84ab99
        pc = 45; continue;
      case 45: // 84a2c2
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 84a2c2: mov ecx, dword ptr [0xde1f54]
        R.push((R.eax >>> 0)); // 84a2c8: push eax
        R.push((R.esi >>> 0)); // 84a2c9: push esi
        R.call(0x8c5450, { n: 2, thisEcx: true, calleeClean: true }); // 84a2ca: call 0x8c5450
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84a2cf: test eax, eax
        if (!R.zf) { pc = 150; continue; } // 84a2d1: jne 0x84ab99
        pc = 46; continue;
      case 46: // 84a2d7
        R.eax = (R.m.u32(((R.esi + 0x24) | 0) >>> 0)) | 0; // 84a2d7: mov eax, dword ptr [esi + 0x24]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84a2da: test eax, eax
        if (R.zf) { pc = 48; continue; } // 84a2dc: je 0x84a2e8
        pc = 47; continue;
      case 47: // 84a2de
        R.sub(R.m.u8(((R.esi + 0x28) | 0) >>> 0), 0x5, 8); // 84a2de: cmp byte ptr [esi + 0x28], 5
        if (R.zf) { pc = 150; continue; } // 84a2e2: je 0x84ab99
        pc = 48; continue;
      case 48: // 84a2e8
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 84a2e8: mov ecx, dword ptr [esp + 0x18]
        R.eax = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 84a2ec: mov eax, dword ptr [esp + 0x1c]
        R.edx = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 84a2f0: mov edx, dword ptr [ecx]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + R.edx + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84a2f2: mov cl, byte ptr [eax + edx + 0x24]
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 84a2f6: add eax, edx
        R.logic(((R.ecx >>> 0) & 0xff) & 0x1, 8); // 84a2f8: test cl, 1
        if (!R.zf) { pc = 132; continue; } // 84a2fb: jne 0x84aa05
        pc = 49; continue;
      case 49: // 84a301
        R.sub(R.m.u16(((R.eax + 0x1) | 0) >>> 0), 0xffff, 16); // 84a301: cmp word ptr [eax + 1], -1
        if (!R.cLE) { pc = 51; continue; } // 84a306: jg 0x84a310
        pc = 50; continue;
      case 50: // 84a308
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 84a308: test edi, edi
        if (!R.zf) { pc = 150; continue; } // 84a30a: jne 0x84ab99
        pc = 51; continue;
      case 51: // 84a310
        R.ecx = (((R.esp + 0x2e) | 0)) | 0; // 84a310: lea ecx, [esp + 0x2e]
        R.push(0x0); // 84a314: push 0
        R.push((R.ecx >>> 0)); // 84a316: push ecx
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 84a317: mov ecx, dword ptr [0xde1f54]
        R.push((R.ebx >>> 0)); // 84a31d: push ebx
        R.push((R.esi >>> 0)); // 84a31e: push esi
        R.call(0x8ce990, { n: 4, thisEcx: true, calleeClean: true }); // 84a31f: call 0x8ce990
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84a324: test eax, eax
        if (!R.zf) { pc = 53; continue; } // 84a326: jne 0x84a334
        pc = 52; continue;
      case 52: // 84a328
        R.sub(R.m.u16(((R.esp + 0x2e) | 0) >>> 0), 0x9, 16); // 84a328: cmp word ptr [esp + 0x2e], 9
        if (!R.zf) { pc = 150; continue; } // 84a32e: jne 0x84ab99
        pc = 53; continue;
      default: return pc;
    }
  }
}
function f_84a020_6(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 53: // 84a334
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 84a334: mov ecx, dword ptr [0xde1f54]
        R.push((R.ebx >>> 0)); // 84a33a: push ebx
        R.push((R.esi >>> 0)); // 84a33b: push esi
        R.call(0x8cdc90, { n: 2, thisEcx: true, calleeClean: true }); // 84a33c: call 0x8cdc90
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84a341: test eax, eax
        if (!R.zf) { pc = 150; continue; } // 84a343: jne 0x84ab99
        pc = 54; continue;
      case 54: // 84a349
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 84a349: mov ecx, dword ptr [0xde1f54]
        R.push((R.eax >>> 0)); // 84a34f: push eax
        R.push((R.esi >>> 0)); // 84a350: push esi
        R.call(0x8c5e40, { n: 2, thisEcx: true, calleeClean: true }); // 84a351: call 0x8c5e40
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84a356: test eax, eax
        if (!R.zf) { pc = 150; continue; } // 84a358: jne 0x84ab99
        pc = 55; continue;
      case 55: // 84a35e
        R.edx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 84a35e: mov edx, dword ptr [esp + 0x18]
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 84a362: mov ecx, dword ptr [esp + 0x1c]
        R.eax = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 84a366: mov eax, dword ptr [edx]
        R.edi = (((R.eax + R.ecx) | 0)) | 0; // 84a368: lea edi, [eax + ecx]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + R.ecx + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84a36b: mov al, byte ptr [eax + ecx + 0x24]
        R.logic(((R.eax >>> 0) & 0xff) & 0x20, 8); // 84a36f: test al, 0x20
        R.eax = (R.m.u32(((R.edi + 0xb) | 0) >>> 0)) | 0; // 84a371: mov eax, dword ptr [edi + 0xb]
        if (R.zf) { pc = 58; continue; } // 84a374: je 0x84a384
        pc = 56; continue;
      case 56: // 84a376
        R.eax = (R.shl((R.eax >>> 0), 0x1, 32)) | 0; // 84a376: shl eax, 1
        R.sub((R.eax >>> 0), 0x4e20, 32); // 84a378: cmp eax, 0x4e20
        if (!R.cLE) { pc = 58; continue; } // 84a37d: jg 0x84a384
        pc = 57; continue;
      case 57: // 84a37f
        R.eax = (0x4e20) | 0; // 84a37f: mov eax, 0x4e20
        pc = 58; continue;
      case 58: // 84a384
        R.ecx = (R.m.u32(((R.ebx + 0x57) | 0) >>> 0)) | 0; // 84a384: mov ecx, dword ptr [ebx + 0x57]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 84a387: mov dword ptr [esp + 0x10], eax
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 84a38b: test ecx, ecx
        if (R.zf) { pc = 69; continue; } // 84a38d: je 0x84a3e1
        pc = 59; continue;
      case 59: // 84a38f
        R.ecx = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 84a38f: mov ecx, dword ptr [ecx]
        R.sub((R.ecx >>> 0), 0xffffffff, 32); // 84a391: cmp ecx, -1
        if (R.cLE) { pc = 69; continue; } // 84a394: jle 0x84a3e1
        pc = 60; continue;
      case 60: // 84a396
        R.sub((R.ecx >>> 0), R.m.u32(((0xae2378) | 0) >>> 0), 32); // 84a396: cmp ecx, dword ptr [0xae2378]
        if (!R.cL) { pc = 69; continue; } // 84a39c: jge 0x84a3e1
        pc = 61; continue;
      case 61: // 84a39e
        R.edx = (R.m.u32(((0xadadfc) | 0) >>> 0)) | 0; // 84a39e: mov edx, dword ptr [0xadadfc]
        R.sub(R.m.u32(((R.edx + R.ecx * 4) | 0) >>> 0), 0x0, 32); // 84a3a4: cmp dword ptr [edx + ecx*4], 0
        if (R.zf) { pc = 69; continue; } // 84a3a8: je 0x84a3e1
        pc = 62; continue;
      case 62: // 84a3aa
        R.sub(R.m.u16(((R.ebx + 0x80) | 0) >>> 0), 0x128e, 16); // 84a3aa: cmp word ptr [ebx + 0x80], 0x128e
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esp + 0xf) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84a3b3: mov cl, byte ptr [esp + 0xf]
        if (R.cLE) { pc = 67; continue; } // 84a3b7: jle 0x84a3d5
        pc = 63; continue;
      default: return pc;
    }
  }
}
function f_84a020_7(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 63: // 84a3b9
        R.sub(((R.ecx >>> 0) & 0xff), 0x19, 8); // 84a3b9: cmp cl, 0x19
        if (!R.cL) { pc = 65; continue; } // 84a3bc: jge 0x84a3c7
        pc = 64; continue;
      case 64: // 84a3be
        R.eax = (((R.eax + R.eax * 2) | 0)) | 0; // 84a3be: lea eax, [eax + eax*2]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 84a3c1: mov dword ptr [esp + 0x10], eax
        pc = 69; continue; // 84a3c5: jmp 0x84a3e1
      case 65: // 84a3c7
        R.sub(((R.ecx >>> 0) & 0xff), 0x23, 8); // 84a3c7: cmp cl, 0x23
        if (!R.cL) { pc = 69; continue; } // 84a3ca: jge 0x84a3e1
        pc = 66; continue;
      case 66: // 84a3cc
        R.ecx = (((R.eax + R.eax) | 0)) | 0; // 84a3cc: lea ecx, [eax + eax]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 84a3cf: mov dword ptr [esp + 0x10], ecx
        pc = 69; continue; // 84a3d3: jmp 0x84a3e1
      case 67: // 84a3d5
        R.sub(((R.ecx >>> 0) & 0xff), 0x19, 8); // 84a3d5: cmp cl, 0x19
        if (!R.cL) { pc = 69; continue; } // 84a3d8: jge 0x84a3e1
        pc = 68; continue;
      case 68: // 84a3da
        R.edx = (((R.eax + R.eax) | 0)) | 0; // 84a3da: lea edx, [eax + eax]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edx >>> 0)); // 84a3dd: mov dword ptr [esp + 0x10], edx
        pc = 69; continue;
      case 69: // 84a3e1
        R.sub(R.m.u32(((R.edi + 0x13) | 0) >>> 0), 0xffffffff, 32); // 84a3e1: cmp dword ptr [edi + 0x13], -1
        if (R.cLE) { pc = 87; continue; } // 84a3e5: jle 0x84a559
        pc = 70; continue;
      case 70: // 84a3eb
        R.sub(R.m.u8(((R.edi) | 0) >>> 0), 0xb, 8); // 84a3eb: cmp byte ptr [edi], 0xb
        if (!R.zf) { pc = 87; continue; } // 84a3ee: jne 0x84a559
        pc = 71; continue;
      case 71: // 84a3f4
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 84a3f4: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 84a3fa: push esi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 84a3fb: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84a400: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 84a402: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 73; continue; } // 84a407: je 0x84a421
        pc = 72; continue;
      case 72: // 84a409
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 84a409: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 84a40c: mov edx, dword ptr [0xae23b4]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 84a412: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 84a415: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 84a418: add ecx, eax
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 84a41a: add edx, eax
        R.eax = (((R.edx + R.ecx * 4) | 0)) | 0; // 84a41c: lea eax, [edx + ecx*4]
        pc = 74; continue; // 84a41f: jmp 0x84a423
      case 73: // 84a421
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 84a421: xor eax, eax
        pc = 74; continue;
      default: return pc;
    }
  }
}
function f_84a020_8(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 74: // 84a423
        R.ecx = (((R.esp + 0x2e) | 0)) | 0; // 84a423: lea ecx, [esp + 0x2e]
        R.edx = (((R.esp + 0x3c) | 0)) | 0; // 84a427: lea edx, [esp + 0x3c]
        R.push((R.ecx >>> 0)); // 84a42b: push ecx
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 84a42c: mov ecx, dword ptr [0xde1f54]
        R.push(0x1); // 84a432: push 1
        R.push((R.eax >>> 0)); // 84a434: push eax
        R.push((R.esi >>> 0)); // 84a435: push esi
        R.push((R.edx >>> 0)); // 84a436: push edx
        R.push((R.ebx >>> 0)); // 84a437: push ebx
        R.call(0x8ced40, { n: 6, thisEcx: true, calleeClean: true }); // 84a438: call 0x8ced40
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84a43d: test eax, eax
        if (!R.zf) { pc = 79; continue; } // 84a43f: jne 0x84a467
        pc = 75; continue;
      case 75: // 84a441
        R.sub(R.m.u16(((R.esp + 0x2e) | 0) >>> 0), 0x9, 16); // 84a441: cmp word ptr [esp + 0x2e], 9
        if (R.zf) { pc = 79; continue; } // 84a447: je 0x84a467
        pc = 76; continue;
      case 76: // 84a449
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 84a449: mov eax, dword ptr [esp + 0x18]
        R.edx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 84a44d: mov edx, dword ptr [esp + 0x1c]
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 84a451: mov ecx, dword ptr [eax]
        R.eax = (R.m.u32(((R.ecx + R.edx + 0xb) | 0) >>> 0)) | 0; // 84a453: mov eax, dword ptr [ecx + edx + 0xb]
        R.sub((R.eax >>> 0), 0x2710, 32); // 84a457: cmp eax, 0x2710
        if (!R.cLE) { pc = 78; continue; } // 84a45c: jg 0x84a463
        pc = 77; continue;
      case 77: // 84a45e
        R.eax = (0x2710) | 0; // 84a45e: mov eax, 0x2710
        pc = 78; continue;
      case 78: // 84a463
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, R.add(R.m.u32(((R.esp + 0x10) | 0) >>> 0), (R.eax >>> 0), 32)); // 84a463: add dword ptr [esp + 0x10], eax
        pc = 79; continue;
      case 79: // 84a467
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 84a467: mov eax, dword ptr [esp + 0x18]
        R.edx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 84a46b: mov edx, dword ptr [esp + 0x1c]
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 84a46f: mov ecx, dword ptr [eax]
        R.eax = (R.m.u32(((R.ecx + R.edx + 0x13) | 0) >>> 0)) | 0; // 84a471: mov eax, dword ptr [ecx + edx + 0x13]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 84a475: lea ecx, [eax + eax*4]
        R.eax = (((R.eax + R.ecx * 2) | 0)) | 0; // 84a478: lea eax, [eax + ecx*2]
        R.ecx = (R.m.u32(((0xb63d28) | 0) >>> 0)) | 0; // 84a47b: mov ecx, dword ptr [0xb63d28]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 84a481: lea edx, [eax + eax*4]
        R.eax = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 84a484: mov eax, dword ptr [0xae23bc]
        R.edi = (((R.eax + R.edx * 2) | 0)) | 0; // 84a489: lea edi, [eax + edx*2]
        R.push((R.edi >>> 0)); // 84a48c: push edi
        R.call(0x62ed70, { n: 1, thisEcx: true, calleeClean: true }); // 84a48d: call 0x62ed70
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84a492: test eax, eax
        if (R.zf) { pc = 81; continue; } // 84a494: je 0x84a4e9
        pc = 80; continue;
      default: return pc;
    }
  }
}
function f_84a020_9(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 80: // 84a496
        R.ecx = (R.m.u32(((0xb63d28) | 0) >>> 0)) | 0; // 84a496: mov ecx, dword ptr [0xb63d28]
        R.push((R.edi >>> 0)); // 84a49c: push edi
        R.call(0x62ed70, { n: 1, thisEcx: true, calleeClean: true }); // 84a49d: call 0x62ed70
        R.ecx = (R.m.u32(((0xb63d28) | 0) >>> 0)) | 0; // 84a4a2: mov ecx, dword ptr [0xb63d28]
        R.push((R.edi >>> 0)); // 84a4a8: push edi
        R.ebx = (((R.m.u16(((R.eax + 0x2c) | 0) >>> 0)) << 16 >> 16)) | 0; // 84a4a9: movsx ebx, word ptr [eax + 0x2c]
        R.call(0x62ed70, { n: 1, thisEcx: true, calleeClean: true }); // 84a4ad: call 0x62ed70
        R.ecx = (((R.m.u16(((R.eax + 0x2c) | 0) >>> 0)) << 16 >> 16)) | 0; // 84a4b2: movsx ecx, word ptr [eax + 0x2c]
        { const p = BigInt((((R.ecx >>> 0)) | 0)) * BigInt((((R.ebx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ebx = (Number(BigInt.asIntN(32, p))) | 0; } // 84a4b6: imul ebx, ecx
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.ebx >>> 0)); // 84a4b9: mov dword ptr [esp + 0x20], ebx
        R.ebx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 84a4bd: mov ebx, dword ptr [ebp + 8]
        R.eax = (0x10624dd3) | 0; // 84a4c0: mov eax, 0x10624dd3
        R.ecx = (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 84a4c5: movsx ecx, word ptr [ebx + 0x80]
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 84a4cc: imul ecx
        R.ecx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 84a4ce: mov ecx, dword ptr [esp + 0x20]
        R.edx = (R.sar((R.edx >>> 0), 0x5, 32)) | 0; // 84a4d2: sar edx, 5
        R.eax = ((R.edx >>> 0)) | 0; // 84a4d5: mov eax, edx
        R.eax = (R.shr((R.eax >>> 0), 0x1f, 32)) | 0; // 84a4d7: shr eax, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 84a4da: add edx, eax
        R.eax = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 84a4dc: mov eax, dword ptr [esp + 0x10]
        { const p = BigInt((((R.edx >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 84a4e0: imul ecx, edx
        R.eax = (R.add((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 84a4e3: add eax, ecx
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 84a4e5: mov dword ptr [esp + 0x10], eax
        pc = 81; continue;
      case 81: // 84a4e9
        R.eax = (R.m.u32(((R.edi + 0x61) | 0) >>> 0)) | 0; // 84a4e9: mov eax, dword ptr [edi + 0x61]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84a4ec: test eax, eax
        if (R.zf) { pc = 83; continue; } // 84a4ee: je 0x84a515
        pc = 82; continue;
      case 82: // 84a4f0
        R.edx = (((R.m.u8(((R.eax + 0x45) | 0) >>> 0)) << 24 >> 24)) | 0; // 84a4f0: movsx edx, byte ptr [eax + 0x45]
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.edx >>> 0)); // 84a4f4: mov dword ptr [esp + 0x20], edx
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 84a4f8: fild dword ptr [esp + 0x20]
        R.st[0] = R.st[0] * 0.03333333333333333; // 84a4fc: fmul qword ptr [0x969020]
        R.st[0] = 1.5 - R.st[0]; // 84a502: fsubr qword ptr [0x968940]
        R.st[0] = R.st[0] * R.m.s32(((R.esp + 0x10) | 0) >>> 0); // 84a508: fimul dword ptr [esp + 0x10]
        R.ftol(); // 84a50c: call 0x945640
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, R.add(R.m.u32(((R.esp + 0x10) | 0) >>> 0), (R.eax >>> 0), 32)); // 84a511: add dword ptr [esp + 0x10], eax
        pc = 83; continue;
      case 83: // 84a515
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 84a515: mov ecx, dword ptr [0xde1f54]
        R.push(0x0); // 84a51b: push 0
        R.push((R.edi >>> 0)); // 84a51d: push edi
        R.call(0x8cde70, { n: 2, thisEcx: true, calleeClean: true }); // 84a51e: call 0x8cde70
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84a523: test eax, eax
        if (R.zf) { pc = 87; continue; } // 84a525: je 0x84a559
        pc = 84; continue;
      case 84: // 84a527
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 84a527: mov eax, dword ptr [esp + 0x18]
        R.edx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 84a52b: mov edx, dword ptr [esp + 0x1c]
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 84a52f: mov ecx, dword ptr [eax]
        R.fpush(R.m.s32(((R.ecx + R.edx + 0xb) | 0) >>> 0)); // 84a531: fild dword ptr [ecx + edx + 0xb]
        R.st[0] = R.st[0] * 1.5; // 84a535: fmul qword ptr [0x968940]
        R.fcom(R.st[0], 10000.0); // 84a53b: fcom qword ptr [0x968910]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84a541: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 84a543: test ah, 0x41
        if (R.zf) { pc = 86; continue; } // 84a546: je 0x84a550
        pc = 85; continue;
      default: return pc;
    }
  }
}
function f_84a020_10(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 85: // 84a548
        R.fpop(); // 84a548: fstp st(0)
        R.fpush(10000.0); // 84a54a: fld qword ptr [0x968910]
        pc = 86; continue;
      case 86: // 84a550
        R.ftol(); // 84a550: call 0x945640
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, R.add(R.m.u32(((R.esp + 0x10) | 0) >>> 0), (R.eax >>> 0), 32)); // 84a555: add dword ptr [esp + 0x10], eax
        pc = 87; continue;
      case 87: // 84a559
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 84a559: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 84a55f: push esi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 84a560: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84a565: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 84a567: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 98; continue; } // 84a56c: je 0x84a697
        pc = 88; continue;
      case 88: // 84a572
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 84a572: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 84a575: mov edx, dword ptr [0xae23b4]
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 84a57b: add edx, eax
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 84a57d: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 84a580: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 84a583: add ecx, eax
        R.eax = (((R.edx + R.ecx * 4) | 0)) | 0; // 84a585: lea eax, [edx + ecx*4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84a588: test eax, eax
        if (R.zf) { pc = 98; continue; } // 84a58a: je 0x84a697
        pc = 89; continue;
      case 89: // 84a590
        R.eax = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 84a590: mov eax, dword ptr [esp + 0x38]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84a594: test eax, eax
        if (R.zf) { pc = 98; continue; } // 84a596: je 0x84a697
        pc = 90; continue;
      case 90: // 84a59c
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 84a59c: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 84a5a2: push esi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 84a5a3: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84a5a8: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 84a5aa: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 92; continue; } // 84a5af: je 0x84a5c9
        pc = 91; continue;
      case 91: // 84a5b1
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 84a5b1: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 84a5b4: mov edx, dword ptr [0xae23b4]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 84a5ba: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 84a5bd: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 84a5c0: add ecx, eax
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 84a5c2: add edx, eax
        R.eax = (((R.edx + R.ecx * 4) | 0)) | 0; // 84a5c4: lea eax, [edx + ecx*4]
        pc = 93; continue; // 84a5c7: jmp 0x84a5cb
      case 92: // 84a5c9
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 84a5c9: xor eax, eax
        pc = 93; continue;
      default: return pc;
    }
  }
}
function f_84a020_11(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 93: // 84a5cb
        R.push(0x0); // 84a5cb: push 0
        R.push(0x0); // 84a5cd: push 0
        R.push(0x1); // 84a5cf: push 1
        R.push(0x0); // 84a5d1: push 0
        R.push((R.eax >>> 0)); // 84a5d3: push eax
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 84a5d4: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 84a5d9: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84a5dc: test eax, eax
        if (!R.zf) { pc = 95; continue; } // 84a5de: jne 0x84a5e9
        pc = 94; continue;
      case 94: // 84a5e0
        R.sub(R.m.u32(((R.esi + 0x39) | 0) >>> 0), (R.ebx >>> 0), 32); // 84a5e0: cmp dword ptr [esi + 0x39], ebx
        if (!R.zf) { pc = 98; continue; } // 84a5e3: jne 0x84a697
        pc = 95; continue;
      case 95: // 84a5e9
        R.ecx = (((R.esp + 0x88) | 0)) | 0; // 84a5e9: lea ecx, [esp + 0x88]
        R.call(0x85e410, { n: 0, thisEcx: true, calleeClean: false }); // 84a5f0: call 0x85e410
        R.edi = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 84a5f5: mov edi, dword ptr [esp + 0x18]
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 84a5f9: mov ecx, dword ptr [esp + 0x1c]
        R.push(0x0); // 84a5fd: push 0
        R.push(0x0); // 84a5ff: push 0
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 84a601: mov eax, dword ptr [edi]
        R.m.w8(((R.esp + 0x138) | 0) >>> 0, 0x2); // 84a603: mov byte ptr [esp + 0x138], 2
        R.eax = (R.add((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 84a60b: add eax, ecx
        R.ecx = (((R.esp + 0x90) | 0)) | 0; // 84a60d: lea ecx, [esp + 0x90]
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84a614: mov dl, byte ptr [eax]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84a616: mov al, byte ptr [eax + 0x24]
        R.eax = ((R.eax & 0xffffff00) | (((R.shr(((R.eax >>> 0) & 0xff), 0x1, 8)) & 0xff) << 0)) | 0; // 84a619: shr al, 1
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf, 8)) & 0xff) << 0)) | 0; // 84a61b: and al, 0xf
        R.push((R.edx >>> 0)); // 84a61d: push edx
        R.push((R.eax >>> 0)); // 84a61e: push eax
        R.push(0xffffffff); // 84a61f: push -1
        R.push((R.ebx >>> 0)); // 84a621: push ebx
        R.push((R.esi >>> 0)); // 84a622: push esi
        R.call(0x85fc50, { n: 7, thisEcx: true, calleeClean: true }); // 84a623: call 0x85fc50
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.eax >>> 0)); // 84a628: mov dword ptr [esp + 0x20], eax
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 84a62c: fild dword ptr [esp + 0x20]
        R.fcom(R.st[0], 0.0); R.fpop(); // 84a630: fcomp qword ptr [0x9689a0]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84a636: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x40, 8); // 84a638: test ah, 0x40
        if (R.zf) { pc = 97; continue; } // 84a63b: je 0x84a64a
        pc = 96; continue;
      case 96: // 84a63d
        R.m.w8(((R.esp + 0x130) | 0) >>> 0, 0x1); // 84a63d: mov byte ptr [esp + 0x130], 1
        pc = 150; continue; // 84a645: jmp 0x84ab99
      default: return pc;
    }
  }
}
function f_84a020_12(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 97: // 84a64a
        R.ecx = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 84a64a: mov ecx, dword ptr [edi]
        R.edx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 84a64c: mov edx, dword ptr [esp + 0x1c]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + R.edx + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84a650: mov al, byte ptr [ecx + edx + 0x24]
        R.ecx = (R.m.u32(((0xae2a38) | 0) >>> 0)) | 0; // 84a654: mov ecx, dword ptr [0xae2a38]
        R.eax = ((R.eax & 0xffffff00) | (((R.shr(((R.eax >>> 0) & 0xff), 0x1, 8)) & 0xff) << 0)) | 0; // 84a65a: shr al, 1
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf, 8)) & 0xff) << 0)) | 0; // 84a65c: and al, 0xf
        R.push((R.eax >>> 0)); // 84a65e: push eax
        R.push((R.esi >>> 0)); // 84a65f: push esi
        R.push((R.ebx >>> 0)); // 84a660: push ebx
        R.call(0x5a0590, { n: 1, thisEcx: true, calleeClean: true }); // 84a661: call 0x5a0590
        R.ecx = ((R.eax >>> 0)) | 0; // 84a666: mov ecx, eax
        R.call(0x5968d0, { n: 2, thisEcx: true, calleeClean: true }); // 84a668: call 0x5968d0
        R.fpush(R.m.s32(((R.esp + 0x94) | 0) >>> 0)); // 84a66d: fild dword ptr [esp + 0x94]
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.eax >>> 0)); // 84a674: mov dword ptr [esp + 0x20], eax
        R.m.w8(((R.esp + 0x130) | 0) >>> 0, 0x1); // 84a678: mov byte ptr [esp + 0x130], 1
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 84a680: fild dword ptr [esp + 0x20]
        R.st[0] = R.st[0] * 1.3; // 84a684: fmul qword ptr [0x968de8]
        R.fcom(R.st[0], R.st[1]); R.fpop(); R.fpop(); // 84a68a: fcompp 
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84a68c: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 84a68e: test ah, 1
        if (!R.zf) { pc = 150; continue; } // 84a691: jne 0x84ab99
        pc = 98; continue;
      case 98: // 84a697
        R.ecx = (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 84a697: movsx ecx, word ptr [ebx + 0x80]
        R.edx = (((R.ecx + R.ecx + 0x3e8) | 0)) | 0; // 84a69e: lea edx, [ecx + ecx + 0x3e8]
        R.push((R.edx >>> 0)); // 84a6a5: push edx
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 84a6a6: call 0x90cfc0
        R.edi = ((R.eax >>> 0)) | 0; // 84a6ab: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 84a6ad: mov eax, dword ptr [esp + 0x14]
        R.push((R.eax >>> 0)); // 84a6b1: push eax
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 84a6b2: call 0x90cfc0
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 84a6b7: add esp, 8
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 84a6ba: cmp eax, edi
        if (R.cLE) { pc = 150; continue; } // 84a6bc: jle 0x84ab99
        pc = 99; continue;
      default: return pc;
    }
  }
}
function f_84a020_13(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 99: // 84a6c2
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 84a6c2: mov ecx, dword ptr [esp + 0x18]
        R.edi = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 84a6c6: mov edi, dword ptr [esp + 0x1c]
        R.edx = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 84a6ca: mov edx, dword ptr [ecx]
        R.ecx = (((R.esp + 0x44) | 0)) | 0; // 84a6cc: lea ecx, [esp + 0x44]
        R.eax = (((R.edx + R.edi + 0x24) | 0)) | 0; // 84a6d0: lea eax, [edx + edi + 0x24]
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.edx + R.edi + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84a6d4: mov dl, byte ptr [edx + edi + 0x24]
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) & 0xdf, 8)) & 0xff) << 0)) | 0; // 84a6d8: and dl, 0xdf
        R.m.w8(((R.eax) | 0) >>> 0, ((R.edx >>> 0) & 0xff)); // 84a6db: mov byte ptr [eax], dl
        R.call(0x8e5680, { n: 0, thisEcx: true, calleeClean: false }); // 84a6dd: call 0x8e5680
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 84a6e2: mov eax, dword ptr [esp + 0x18]
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, 0x0); // 84a6e6: mov dword ptr [esp + 0x34], 0
        R.edx = (((R.esp + 0x34) | 0)) | 0; // 84a6ee: lea edx, [esp + 0x34]
        R.m.w8(((R.esp + 0x130) | 0) >>> 0, 0x3); // 84a6f2: mov byte ptr [esp + 0x130], 3
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 84a6fa: mov ecx, dword ptr [eax]
        R.push((R.edx >>> 0)); // 84a6fc: push edx
        R.push(0x0); // 84a6fd: push 0
        R.eax = (((R.ecx + R.edi) | 0)) | 0; // 84a6ff: lea eax, [ecx + edi]
        R.ecx = (R.m.u32(((R.ecx + R.edi + 0x7) | 0) >>> 0)) | 0; // 84a702: mov ecx, dword ptr [ecx + edi + 7]
        R.push((R.ecx >>> 0)); // 84a706: push ecx
        R.push((R.eax >>> 0)); // 84a707: push eax
        R.push((R.ebx >>> 0)); // 84a708: push ebx
        R.push((R.esi >>> 0)); // 84a709: push esi
        R.ecx = (((R.esp + 0x5c) | 0)) | 0; // 84a70a: lea ecx, [esp + 0x5c]
        R.call(0x8e5d60, { n: 6, thisEcx: true, calleeClean: true }); // 84a70e: call 0x8e5d60
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84a713: test eax, eax
        if (R.zf) { pc = 130; continue; } // 84a715: je 0x84a9d4
        pc = 100; continue;
      case 100: // 84a71b
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 84a71b: mov ecx, dword ptr [0xde1f54]
        R.edx = (((R.esp + 0x44) | 0)) | 0; // 84a721: lea edx, [esp + 0x44]
        R.push(0x0); // 84a725: push 0
        R.push((R.edx >>> 0)); // 84a727: push edx
        R.call(0x8be300, { n: 2, thisEcx: true, calleeClean: true }); // 84a728: call 0x8be300
        R.eax = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 84a72d: mov eax, dword ptr [esp + 0x34]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84a731: test eax, eax
        if (R.zf) { pc = 128; continue; } // 84a733: je 0x84a9b4
        pc = 101; continue;
      default: return pc;
    }
  }
}
function f_84a020_14(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 101: // 84a739
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 84a739: mov ecx, dword ptr [esp + 0x18]
        R.push(0x0); // 84a73d: push 0
        R.push(0x1); // 84a73f: push 1
        R.push(0x0); // 84a741: push 0
        R.edx = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 84a743: mov edx, dword ptr [ecx]
        R.ecx = ((R.edi >>> 0)) | 0; // 84a745: mov ecx, edi
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.edx + R.ecx) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84a747: mov dl, byte ptr [edx + ecx]
        R.ecx = (R.m.u32(((R.esp + 0x74) | 0) >>> 0)) | 0; // 84a74a: mov ecx, dword ptr [esp + 0x74]
        R.push((R.edx >>> 0)); // 84a74e: push edx
        R.edx = (R.m.u32(((R.esp + 0x74) | 0) >>> 0)) | 0; // 84a74f: mov edx, dword ptr [esp + 0x74]
        R.push((R.ecx >>> 0)); // 84a753: push ecx
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 84a754: mov ecx, dword ptr [0xae1050]
        R.push((R.edx >>> 0)); // 84a75a: push edx
        R.push((R.eax >>> 0)); // 84a75b: push eax
        R.call(0x4cc490, { n: 7, thisEcx: true, calleeClean: true }); // 84a75c: call 0x4cc490
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 84a761: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 84a767: push esi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 84a768: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84a76d: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 84a76f: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 126; continue; } // 84a774: je 0x84a9a3
        pc = 102; continue;
      case 102: // 84a77a
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 84a77a: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 84a77d: mov edx, dword ptr [0xae23b4]
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 84a783: add edx, eax
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 84a785: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 84a788: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 84a78b: add ecx, eax
        R.edi = (((R.edx + R.ecx * 4) | 0)) | 0; // 84a78d: lea edi, [edx + ecx*4]
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 84a790: test edi, edi
        if (R.zf) { pc = 126; continue; } // 84a792: je 0x84a9a3
        pc = 103; continue;
      case 103: // 84a798
        R.push(0x0); // 84a798: push 0
        R.push(0x0); // 84a79a: push 0
        R.push(0x1); // 84a79c: push 1
        R.push(0x0); // 84a79e: push 0
        R.push((R.edi >>> 0)); // 84a7a0: push edi
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 84a7a1: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 84a7a6: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84a7a9: test eax, eax
        if (!R.zf) { pc = 126; continue; } // 84a7ab: jne 0x84a9a3
        pc = 104; continue;
      case 104: // 84a7b1
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 84a7b1: mov eax, dword ptr [edi]
        R.ecx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 84a7b3: mov ecx, dword ptr [esi]
        R.push((R.eax >>> 0)); // 84a7b5: push eax
        R.push((R.ecx >>> 0)); // 84a7b6: push ecx
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 84a7b7: mov ecx, dword ptr [0xae1050]
        R.call(0x4cc9e0, { n: 2, thisEcx: true, calleeClean: true }); // 84a7bd: call 0x4cc9e0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84a7c2: test eax, eax
        if (!R.zf) { pc = 126; continue; } // 84a7c4: jne 0x84a9a3
        pc = 105; continue;
      default: return pc;
    }
  }
}
function f_84a020_15(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 105: // 84a7ca
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 84a7ca: mov ecx, dword ptr [0xae1050]
        R.push((R.edi >>> 0)); // 84a7d0: push edi
        R.push((R.esi >>> 0)); // 84a7d1: push esi
        R.call(0x4cf5f0, { n: 2, thisEcx: true, calleeClean: true }); // 84a7d2: call 0x4cf5f0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84a7d7: test eax, eax
        if (R.zf) { pc = 126; continue; } // 84a7d9: je 0x84a9a3
        pc = 106; continue;
      case 106: // 84a7df
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84a7df: mov dl, byte ptr [eax + 0x4f]
        R.edx = ((R.edx & 0xffffff00) | (((R.shr(((R.edx >>> 0) & 0xff), 0x4, 8)) & 0xff) << 0)) | 0; // 84a7e2: shr dl, 4
        R.eax = (((((R.edx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 84a7e5: movsx eax, dl
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 84a7e8: dec eax
        R.sub((R.eax >>> 0), 0x4, 32); // 84a7e9: cmp eax, 4
        if (!R.cBE) { pc = 126; continue; } // 84a7ec: ja 0x84a9a3
        pc = 107; continue;
      case 107: // 84a7f2
        pc = [108, 108, 117, 117, 117][R.eax >>> 0] ?? -2; continue; // 84a7f2: jmp dword ptr [eax*4 + 0x84abc4]
      case 108: // 84a7f9
        R.ecx = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 84a7f9: mov ecx, dword ptr [esp + 0x30]
        R.push(0x0); // 84a7fd: push 0
        R.push(0x0); // 84a7ff: push 0
        R.push((R.esi >>> 0)); // 84a801: push esi
        R.push((R.edi >>> 0)); // 84a802: push edi
        R.call(0x849ce0, { n: 4, thisEcx: true, calleeClean: true }); // 84a803: call 0x849ce0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84a808: test eax, eax
        if (R.zf) { pc = 126; continue; } // 84a80a: je 0x84a9a3
        pc = 109; continue;
      case 109: // 84a810
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 84a810: mov cx, word ptr [ebx + 0x80]
        R.sub(((R.ecx >>> 0) & 0xffff), 0x1, 16); // 84a817: cmp cx, 1
        if (!R.cL) { pc = 111; continue; } // 84a81b: jge 0x84a827
        pc = 110; continue;
      case 110: // 84a81d
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, 0x1); // 84a81d: mov dword ptr [esp + 0x10], 1
        pc = 112; continue; // 84a825: jmp 0x84a82e
      case 111: // 84a827
        R.eax = (((((R.ecx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 84a827: movsx eax, cx
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 84a82a: mov dword ptr [esp + 0x10], eax
        pc = 112; continue;
      default: return pc;
    }
  }
}
function f_84a020_16(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 112: // 84a82e
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 84a82e: mov eax, dword ptr [esi]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 84a830: lea edx, [eax + eax*4]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 84a833: shl edx, 4
        R.edx = (R.sub((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 84a836: sub edx, eax
        R.eax = (R.m.u32(((0xae2d0c) | 0) >>> 0)) | 0; // 84a838: mov eax, dword ptr [0xae2d0c]
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.edx + R.eax + 0xb) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84a83d: mov dl, byte ptr [edx + eax + 0xb]
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) & 0xf, 8)) & 0xff) << 0)) | 0; // 84a841: and dl, 0xf
        R.edx = (R.logic((R.edx >>> 0) & 0xff, 32)) | 0; // 84a844: and edx, 0xff
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.edx >>> 0)); // 84a84a: mov dword ptr [esp + 0x20], edx
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 84a84e: fild dword ptr [esp + 0x20]
        R.eax = (((((R.ecx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 84a852: movsx eax, cx
        R.st[0] = R.st[0] * 0.1; // 84a855: fmul qword ptr [0x967880]
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.eax >>> 0)); // 84a85b: mov dword ptr [esp + 0x20], eax
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 84a85f: fild dword ptr [esp + 0x20]
        R.st[0] = R.st[0] / R.m.s32(((R.esp + 0x10) | 0) >>> 0); // 84a863: fidiv dword ptr [esp + 0x10]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 84a867: faddp st(1)
        R.m.wf64(((R.esp + 0x24) | 0) >>> 0, R.st[0]); R.fpop(); // 84a869: fstp qword ptr [esp + 0x24]
        R.fpush(1.0); // 84a86d: fld qword ptr [0x967890]
        R.fcom(R.st[0], R.f64(((R.esp + 0x24) | 0))); R.fpop(); // 84a873: fcomp qword ptr [esp + 0x24]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84a877: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 84a879: test ah, 0x41
        if (!R.zf) { pc = 114; continue; } // 84a87c: jne 0x84a89e
        pc = 113; continue;
      case 113: // 84a87e
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0x3ff00000); // 84a87e: mov dword ptr [esp + 0x28], 0x3ff00000
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, 0x0); // 84a886: mov dword ptr [esp + 0x24], 0
        R.ecx = (R.m.u32(((R.esp + 0x28) | 0) >>> 0)) | 0; // 84a88e: mov ecx, dword ptr [esp + 0x28]
        R.edx = (R.m.u32(((R.esp + 0x24) | 0) >>> 0)) | 0; // 84a892: mov edx, dword ptr [esp + 0x24]
        R.push(0x2); // 84a896: push 2
        R.push((R.ecx >>> 0)); // 84a898: push ecx
        pc = 125; continue; // 84a899: jmp 0x84a990
      case 114: // 84a89e
        R.fpush(1.4); // 84a89e: fld qword ptr [0x968dc0]
        R.fcom(R.st[0], R.f64(((R.esp + 0x24) | 0))); R.fpop(); // 84a8a4: fcomp qword ptr [esp + 0x24]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84a8a8: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 84a8aa: test ah, 1
        if (R.zf) { pc = 116; continue; } // 84a8ad: je 0x84a8bf
        pc = 115; continue;
      case 115: // 84a8af
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, 0x66666666); // 84a8af: mov dword ptr [esp + 0x24], 0x66666666
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0x3ff66666); // 84a8b7: mov dword ptr [esp + 0x28], 0x3ff66666
        pc = 116; continue;
      case 116: // 84a8bf
        R.ecx = (R.m.u32(((R.esp + 0x28) | 0) >>> 0)) | 0; // 84a8bf: mov ecx, dword ptr [esp + 0x28]
        R.edx = (R.m.u32(((R.esp + 0x24) | 0) >>> 0)) | 0; // 84a8c3: mov edx, dword ptr [esp + 0x24]
        R.push(0x2); // 84a8c7: push 2
        R.push((R.ecx >>> 0)); // 84a8c9: push ecx
        pc = 125; continue; // 84a8ca: jmp 0x84a990
      case 117: // 84a8cf
        R.ecx = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 84a8cf: mov ecx, dword ptr [esp + 0x30]
        R.push(0x0); // 84a8d3: push 0
        R.push(0x0); // 84a8d5: push 0
        R.push((R.esi >>> 0)); // 84a8d7: push esi
        R.push((R.edi >>> 0)); // 84a8d8: push edi
        R.call(0x849ce0, { n: 4, thisEcx: true, calleeClean: true }); // 84a8d9: call 0x849ce0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84a8de: test eax, eax
        if (R.zf) { pc = 126; continue; } // 84a8e0: je 0x84a9a3
        pc = 118; continue;
      default: return pc;
    }
  }
}
function f_84a020_17(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 118: // 84a8e6
        R.eax = (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 84a8e6: movsx eax, word ptr [ebx + 0x80]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.eax >>> 0)); // 84a8ed: mov dword ptr [esp + 0x24], eax
        R.eax = (R.add((R.eax >>> 0), (R.eax >>> 0), 32)) | 0; // 84a8f1: add eax, eax
        R.sub((R.eax >>> 0), 0x1, 32); // 84a8f3: cmp eax, 1
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, 0x1); // 84a8f6: mov dword ptr [esp + 0x10], 1
        if (R.cL) { pc = 120; continue; } // 84a8fe: jl 0x84a904
        pc = 119; continue;
      case 119: // 84a900
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 84a900: mov dword ptr [esp + 0x10], eax
        pc = 120; continue;
      case 120: // 84a904
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 84a904: mov eax, dword ptr [esi]
        R.edx = (R.m.u32(((0xae2d0c) | 0) >>> 0)) | 0; // 84a906: mov edx, dword ptr [0xae2d0c]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 84a90c: lea ecx, [eax + eax*4]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 84a90f: shl ecx, 4
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 84a912: sub ecx, eax
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + R.edx + 0xb) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84a914: mov al, byte ptr [ecx + edx + 0xb]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf, 8)) & 0xff) << 0)) | 0; // 84a918: and al, 0xf
        R.eax = (R.logic((R.eax >>> 0) & 0xff, 32)) | 0; // 84a91a: and eax, 0xff
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.eax >>> 0)); // 84a91f: mov dword ptr [esp + 0x20], eax
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 84a923: fild dword ptr [esp + 0x20]
        R.st[0] = R.st[0] * 0.1; // 84a927: fmul qword ptr [0x967880]
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 84a92d: fild dword ptr [esp + 0x24]
        R.st[0] = R.st[0] / R.m.s32(((R.esp + 0x10) | 0) >>> 0); // 84a931: fidiv dword ptr [esp + 0x10]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 84a935: faddp st(1)
        R.st[0] = R.st[0] + 0.5; // 84a937: fadd qword ptr [0x968968]
        R.m.wf64(((R.esp + 0x24) | 0) >>> 0, R.st[0]); R.fpop(); // 84a93d: fstp qword ptr [esp + 0x24]
        R.fpush(1.0); // 84a941: fld qword ptr [0x967890]
        R.fcom(R.st[0], R.f64(((R.esp + 0x24) | 0))); R.fpop(); // 84a947: fcomp qword ptr [esp + 0x24]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84a94b: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 84a94d: test ah, 0x41
        if (!R.zf) { pc = 122; continue; } // 84a950: jne 0x84a964
        pc = 121; continue;
      case 121: // 84a952
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, 0x0); // 84a952: mov dword ptr [esp + 0x24], 0
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0x3ff00000); // 84a95a: mov dword ptr [esp + 0x28], 0x3ff00000
        pc = 124; continue; // 84a962: jmp 0x84a985
      case 122: // 84a964
        R.fpush(1.2); // 84a964: fld qword ptr [0x968978]
        R.fcom(R.st[0], R.f64(((R.esp + 0x24) | 0))); R.fpop(); // 84a96a: fcomp qword ptr [esp + 0x24]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84a96e: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 84a970: test ah, 1
        if (R.zf) { pc = 124; continue; } // 84a973: je 0x84a985
        pc = 123; continue;
      case 123: // 84a975
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, 0x33333333); // 84a975: mov dword ptr [esp + 0x24], 0x33333333
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0x3ff33333); // 84a97d: mov dword ptr [esp + 0x28], 0x3ff33333
        pc = 124; continue;
      case 124: // 84a985
        R.ecx = (R.m.u32(((R.esp + 0x28) | 0) >>> 0)) | 0; // 84a985: mov ecx, dword ptr [esp + 0x28]
        R.edx = (R.m.u32(((R.esp + 0x24) | 0) >>> 0)) | 0; // 84a989: mov edx, dword ptr [esp + 0x24]
        R.push(0x2); // 84a98d: push 2
        R.push((R.ecx >>> 0)); // 84a98f: push ecx
        pc = 125; continue;
      default: return pc;
    }
  }
}
function f_84a020_18(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 125: // 84a990
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 84a990: mov ecx, dword ptr [0xae1050]
        R.push((R.edx >>> 0)); // 84a996: push edx
        R.push(0xffffffff); // 84a997: push -1
        R.push(0x0); // 84a999: push 0
        R.push(0x0); // 84a99b: push 0
        R.push((R.esi >>> 0)); // 84a99d: push esi
        R.call(0x4cda70, { n: 7, thisEcx: true, calleeClean: true }); // 84a99e: call 0x4cda70
        pc = 126; continue;
      case 126: // 84a9a3
        R.eax = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 84a9a3: mov eax, dword ptr [esp + 0x34]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84a9a7: test eax, eax
        if (R.zf) { pc = 128; continue; } // 84a9a9: je 0x84a9b4
        pc = 127; continue;
      case 127: // 84a9ab
        R.push((R.eax >>> 0)); // 84a9ab: push eax
        R.call(0x944c94, { n: 1, thisEcx: false, calleeClean: false }); // 84a9ac: call 0x944c94
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 84a9b1: add esp, 4
        pc = 128; continue;
      case 128: // 84a9b4
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 84a9b4: mov eax, dword ptr [esp + 0x18]
        R.edx = (R.m.u32(((R.esp + 0x64) | 0) >>> 0)) | 0; // 84a9b8: mov edx, dword ptr [esp + 0x64]
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 84a9bc: mov ecx, dword ptr [eax]
        R.eax = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 84a9be: mov eax, dword ptr [esp + 0x1c]
        R.m.w32(((R.ecx + R.eax + 0x17) | 0) >>> 0, (R.edx >>> 0)); // 84a9c2: mov dword ptr [ecx + eax + 0x17], edx
        R.eax = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 84a9c6: mov eax, dword ptr [esp + 0x38]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84a9ca: test eax, eax
        if (R.zf) { pc = 131; continue; } // 84a9cc: je 0x84a9ef
        pc = 129; continue;
      case 129: // 84a9ce
        R.m.w8(((R.esp + 0xf) | 0) >>> 0, R.incdec(R.m.u8(((R.esp + 0xf) | 0) >>> 0), 1, 8)); // 84a9ce: inc byte ptr [esp + 0xf]
        pc = 131; continue; // 84a9d2: jmp 0x84a9ef
      case 130: // 84a9d4
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 84a9d4: mov ecx, dword ptr [esp + 0x18]
        R.edx = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 84a9d8: mov edx, dword ptr [ecx]
        R.ecx = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 84a9da: mov ecx, dword ptr [esp + 0x30]
        R.sub(R.m.u8(((R.edx + R.edi) | 0) >>> 0), 0xb, 8); // 84a9de: cmp byte ptr [edx + edi], 0xb
        R.eax = ((R.eax & 0xffffff00) | (((!R.zf ? 1 : 0) & 0xff) << 0)) | 0; // 84a9e2: setne al
        R.push((R.eax >>> 0)); // 84a9e5: push eax
        R.push(0x1); // 84a9e6: push 1
        R.push((R.ebx >>> 0)); // 84a9e8: push ebx
        R.push((R.esi >>> 0)); // 84a9e9: push esi
        R.call(0x843e10, { n: 4, thisEcx: true, calleeClean: true }); // 84a9ea: call 0x843e10
        pc = 131; continue;
      case 131: // 84a9ef
        R.ecx = (((R.esp + 0x44) | 0)) | 0; // 84a9ef: lea ecx, [esp + 0x44]
        R.m.w8(((R.esp + 0x130) | 0) >>> 0, 0x1); // 84a9f3: mov byte ptr [esp + 0x130], 1
        R.call(0x8e5710, { n: 0, thisEcx: true, calleeClean: false }); // 84a9fb: call 0x8e5710
        pc = 150; continue; // 84aa00: jmp 0x84ab99
      case 132: // 84aa05
        R.eax = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 84aa05: mov eax, dword ptr [ebx + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84aa08: test eax, eax
        if (R.zf) { pc = 135; continue; } // 84aa0a: je 0x84aa21
        pc = 133; continue;
      case 133: // 84aa0c
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 84aa0c: mov ecx, dword ptr [eax]
        R.eax = (R.m.u32(((0x9cf300) | 0) >>> 0)) | 0; // 84aa0e: mov eax, dword ptr [0x9cf300]
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 84aa13: cmp ecx, eax
        if (!R.zf) { pc = 135; continue; } // 84aa15: jne 0x84aa21
        pc = 134; continue;
      default: return pc;
    }
  }
}
function f_84a020_19(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 134: // 84aa17
        R.sub(R.m.u8(((R.ebx + 0x64) | 0) >>> 0), 0x3, 8); // 84aa17: cmp byte ptr [ebx + 0x64], 3
        if (R.zf) { pc = 150; continue; } // 84aa1b: je 0x84ab99
        pc = 135; continue;
      case 135: // 84aa21
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 84aa21: mov ecx, dword ptr [0xde1f54]
        R.push(0x0); // 84aa27: push 0
        R.push((R.esi >>> 0)); // 84aa29: push esi
        R.push((R.ebx >>> 0)); // 84aa2a: push ebx
        R.call(0x8d0040, { n: 3, thisEcx: true, calleeClean: true }); // 84aa2b: call 0x8d0040
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84aa30: test eax, eax
        if (R.zf) { pc = 150; continue; } // 84aa32: je 0x84ab99
        pc = 136; continue;
      case 136: // 84aa38
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 84aa38: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 84aa3e: push esi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 84aa3f: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84aa44: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 84aa46: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 143; continue; } // 84aa4b: je 0x84aac1
        pc = 137; continue;
      case 137: // 84aa4d
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 84aa4d: mov eax, dword ptr [eax + 4]
        R.ecx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 84aa50: mov ecx, dword ptr [0xae23b4]
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 84aa56: add ecx, eax
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 84aa58: lea edx, [eax + eax*8]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 84aa5b: shl edx, 4
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 84aa5e: add edx, eax
        R.eax = (((R.ecx + R.edx * 4) | 0)) | 0; // 84aa60: lea eax, [ecx + edx*4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84aa63: test eax, eax
        if (R.zf) { pc = 143; continue; } // 84aa65: je 0x84aac1
        pc = 138; continue;
      case 138: // 84aa67
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 84aa67: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 84aa6d: push esi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 84aa6e: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84aa73: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 84aa75: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 140; continue; } // 84aa7a: je 0x84aa94
        pc = 139; continue;
      case 139: // 84aa7c
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 84aa7c: mov eax, dword ptr [eax + 4]
        R.ecx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 84aa7f: mov ecx, dword ptr [0xae23b4]
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 84aa85: lea edx, [eax + eax*8]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 84aa88: shl edx, 4
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 84aa8b: add edx, eax
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 84aa8d: add ecx, eax
        R.eax = (((R.ecx + R.edx * 4) | 0)) | 0; // 84aa8f: lea eax, [ecx + edx*4]
        pc = 141; continue; // 84aa92: jmp 0x84aa96
      case 140: // 84aa94
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 84aa94: xor eax, eax
        pc = 141; continue;
      default: return pc;
    }
  }
}
function f_84a020_20(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 141: // 84aa96
        R.push(0x0); // 84aa96: push 0
        R.push(0x0); // 84aa98: push 0
        R.push(0x1); // 84aa9a: push 1
        R.push(0x0); // 84aa9c: push 0
        R.push((R.eax >>> 0)); // 84aa9e: push eax
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 84aa9f: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 84aaa4: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84aaa7: test eax, eax
        if (R.zf) { pc = 143; continue; } // 84aaa9: je 0x84aac1
        pc = 142; continue;
      case 142: // 84aaab
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 84aaab: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 84aab1: push esi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 84aab2: call 0x4cf5a0
        R.logic(R.m.u8(((R.eax + 0x4e) | 0) >>> 0) & 0x2, 8); // 84aab7: test byte ptr [eax + 0x4e], 2
        if (R.zf) { pc = 150; continue; } // 84aabb: je 0x84ab99
        pc = 143; continue;
      case 143: // 84aac1
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 84aac1: mov ecx, dword ptr [0xde1f54]
        R.push((R.ebx >>> 0)); // 84aac7: push ebx
        R.push((R.esi >>> 0)); // 84aac8: push esi
        R.call(0x8cdc90, { n: 2, thisEcx: true, calleeClean: true }); // 84aac9: call 0x8cdc90
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84aace: test eax, eax
        if (!R.zf) { pc = 150; continue; } // 84aad0: jne 0x84ab99
        pc = 144; continue;
      case 144: // 84aad6
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 84aad6: mov ecx, dword ptr [0xde1f54]
        R.push((R.eax >>> 0)); // 84aadc: push eax
        R.push((R.esi >>> 0)); // 84aadd: push esi
        R.call(0x8c5e40, { n: 2, thisEcx: true, calleeClean: true }); // 84aade: call 0x8c5e40
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84aae3: test eax, eax
        if (!R.zf) { pc = 150; continue; } // 84aae5: jne 0x84ab99
        pc = 145; continue;
      case 145: // 84aaeb
        R.ecx = (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 84aaeb: movsx ecx, word ptr [ebx + 0x80]
        R.eax = (0x66666667) | 0; // 84aaf2: mov eax, 0x66666667
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 84aaf7: imul ecx
        R.edx = (R.sar((R.edx >>> 0), 0x2, 32)) | 0; // 84aaf9: sar edx, 2
        R.eax = ((R.edx >>> 0)) | 0; // 84aafc: mov eax, edx
        R.eax = (R.shr((R.eax >>> 0), 0x1f, 32)) | 0; // 84aafe: shr eax, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 84ab01: add edx, eax
        R.push((R.edx >>> 0)); // 84ab03: push edx
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 84ab04: call 0x90cfc0
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 84ab09: mov ecx, dword ptr [esp + 0x1c]
        R.edi = ((R.eax >>> 0)) | 0; // 84ab0d: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 84ab0f: mov eax, dword ptr [esp + 0x20]
        R.edx = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 84ab13: mov edx, dword ptr [ecx]
        R.ecx = (R.m.u32(((R.edx + R.eax + 0xb) | 0) >>> 0)) | 0; // 84ab15: mov ecx, dword ptr [edx + eax + 0xb]
        R.push((R.ecx >>> 0)); // 84ab19: push ecx
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 84ab1a: call 0x90cfc0
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 84ab1f: add esp, 8
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 84ab22: cmp eax, edi
        if (!R.cLE) { pc = 147; continue; } // 84ab24: jg 0x84ab52
        pc = 146; continue;
      default: return pc;
    }
  }
}
function f_84a020_21(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 146: // 84ab26
        R.edx = (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 84ab26: movsx edx, word ptr [ebx + 0x80]
        R.edx = (R.shl((R.edx >>> 0), 0x1, 32)) | 0; // 84ab2d: shl edx, 1
        R.push((R.edx >>> 0)); // 84ab2f: push edx
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 84ab30: call 0x90cfc0
        R.edx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 84ab35: mov edx, dword ptr [esp + 0x20]
        R.edi = ((R.eax >>> 0)) | 0; // 84ab39: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 84ab3b: mov eax, dword ptr [esp + 0x1c]
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 84ab3f: mov ecx, dword ptr [eax]
        R.eax = (R.m.u32(((R.ecx + R.edx + 0xb) | 0) >>> 0)) | 0; // 84ab41: mov eax, dword ptr [ecx + edx + 0xb]
        R.push((R.eax >>> 0)); // 84ab45: push eax
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 84ab46: call 0x90cfc0
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 84ab4b: add esp, 8
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 84ab4e: cmp eax, edi
        if (R.cLE) { pc = 150; continue; } // 84ab50: jle 0x84ab99
        pc = 147; continue;
      case 147: // 84ab52
        R.edi = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 84ab52: mov edi, dword ptr [esp + 0x30]
        R.push((R.ebx >>> 0)); // 84ab56: push ebx
        R.push((R.esi >>> 0)); // 84ab57: push esi
        R.ecx = ((R.edi >>> 0)) | 0; // 84ab58: mov ecx, edi
        R.call(0x842740, { n: 2, thisEcx: true, calleeClean: true }); // 84ab5a: call 0x842740
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 84ab5f: mov ecx, dword ptr [esp + 0x18]
        R.edx = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 84ab63: mov edx, dword ptr [ecx]
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 84ab65: mov ecx, dword ptr [esp + 0x1c]
        R.m.w32(((R.edx + R.ecx + 0x17) | 0) >>> 0, (R.eax >>> 0)); // 84ab69: mov dword ptr [edx + ecx + 0x17], eax
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 84ab6d: mov eax, dword ptr [esp + 0x18]
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 84ab71: mov edx, dword ptr [eax]
        R.eax = (((R.edx + R.ecx) | 0)) | 0; // 84ab73: lea eax, [edx + ecx]
        R.ecx = (R.m.u32(((R.edx + R.ecx + 0x17) | 0) >>> 0)) | 0; // 84ab76: mov ecx, dword ptr [edx + ecx + 0x17]
        R.sub((R.ecx >>> 0), 0xffffffff, 32); // 84ab7a: cmp ecx, -1
        if (R.cLE) { pc = 149; continue; } // 84ab7d: jle 0x84ab85
        pc = 148; continue;
      case 148: // 84ab7f
        R.m.w8(((R.esp + 0xf) | 0) >>> 0, R.incdec(R.m.u8(((R.esp + 0xf) | 0) >>> 0), 1, 8)); // 84ab7f: inc byte ptr [esp + 0xf]
        pc = 150; continue; // 84ab83: jmp 0x84ab99
      case 149: // 84ab85
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84ab85: mov dl, byte ptr [eax]
        R.ecx = ((R.edi >>> 0)) | 0; // 84ab87: mov ecx, edi
        R.sub(((R.edx >>> 0) & 0xff), 0xb, 8); // 84ab89: cmp dl, 0xb
        R.eax = ((R.eax & 0xffffff00) | (((!R.zf ? 1 : 0) & 0xff) << 0)) | 0; // 84ab8c: setne al
        R.push((R.eax >>> 0)); // 84ab8f: push eax
        R.push(0x1); // 84ab90: push 1
        R.push((R.ebx >>> 0)); // 84ab92: push ebx
        R.push((R.esi >>> 0)); // 84ab93: push esi
        R.call(0x843e10, { n: 4, thisEcx: true, calleeClean: true }); // 84ab94: call 0x843e10
        pc = 150; continue;
      case 150: // 84ab99
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x17) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84ab99: mov al, byte ptr [esp + 0x17]
        R.eax = ((R.eax & 0xffffff00) | (((R.incdec(((R.eax >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 84ab9d: inc al
        R.sub(((R.eax >>> 0) & 0xff), 0x28, 8); // 84ab9f: cmp al, 0x28
        R.m.w8(((R.esp + 0x17) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 84aba1: mov byte ptr [esp + 0x17], al
        if (R.cL) { pc = 9; continue; } // 84aba5: jl 0x84a155
        pc = 151; continue;
      default: return pc;
    }
  }
}
function f_84a020_22(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 151: // 84abab
        R.ecx = (R.m.u32(((R.esp + 0x128) | 0) >>> 0)) | 0; // 84abab: mov ecx, dword ptr [esp + 0x128]
        R.edi = (R.pop()) | 0; // 84abb2: pop edi
        R.esi = (R.pop()) | 0; // 84abb3: pop esi
        /* fs */ // 84abb4: mov dword ptr fs:[0], ecx
        R.ebx = (R.pop()) | 0; // 84abbb: pop ebx
        R.esp = ((R.ebp >>> 0)) | 0; // 84abbc: mov esp, ebp
        R.ebp = (R.pop()) | 0; // 84abbe: pop ebp
        R.rv = R.ret(1); return -1; // 84abbf: ret 4
      default: return pc;
    }
  }
}
export function f_84a020(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 152) throw new Error(`f_84a020: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_84a020_0(R, pc); break;
      case 1: np = f_84a020_1(R, pc); break;
      case 2: np = f_84a020_2(R, pc); break;
      case 3: np = f_84a020_3(R, pc); break;
      case 4: np = f_84a020_4(R, pc); break;
      case 5: np = f_84a020_5(R, pc); break;
      case 6: np = f_84a020_6(R, pc); break;
      case 7: np = f_84a020_7(R, pc); break;
      case 8: np = f_84a020_8(R, pc); break;
      case 9: np = f_84a020_9(R, pc); break;
      case 10: np = f_84a020_10(R, pc); break;
      case 11: np = f_84a020_11(R, pc); break;
      case 12: np = f_84a020_12(R, pc); break;
      case 13: np = f_84a020_13(R, pc); break;
      case 14: np = f_84a020_14(R, pc); break;
      case 15: np = f_84a020_15(R, pc); break;
      case 16: np = f_84a020_16(R, pc); break;
      case 17: np = f_84a020_17(R, pc); break;
      case 18: np = f_84a020_18(R, pc); break;
      case 19: np = f_84a020_19(R, pc); break;
      case 20: np = f_84a020_20(R, pc); break;
      case 21: np = f_84a020_21(R, pc); break;
      case 22: np = f_84a020_22(R, pc); break;
      default: throw new Error(`f_84a020: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_84a020: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_84a020.shared = true;
