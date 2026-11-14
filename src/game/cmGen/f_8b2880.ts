// 0x8b2880 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 53b900=1, 53cb80=0, 53cc30=3, 544410=2, 600a50=5, 8b4cd0=1c
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_8b2880(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x8b2880;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x8b2880:
        R.esp = (R.sub((R.esp >>> 0), 0x34, 32)) | 0; // 8b2880: sub esp, 0x34
        R.push((R.ebx >>> 0)); // 8b2883: push ebx
        R.push((R.esi >>> 0)); // 8b2884: push esi
        R.esi = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 8b2885: mov esi, dword ptr [esp + 0x40]
        R.push((R.edi >>> 0)); // 8b2889: push edi
        R.edi = (R.m.u32(((R.esp + 0x48) | 0) >>> 0)) | 0; // 8b288a: mov edi, dword ptr [esp + 0x48]
        R.ebx = ((R.ecx >>> 0)) | 0; // 8b288e: mov ebx, ecx
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 8b2890: test edi, edi
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, 0x3f800000); // 8b2892: mov dword ptr [esp + 0x18], 0x3f800000
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, 0x3f99999a); // 8b289a: mov dword ptr [esp + 0x1c], 0x3f99999a
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, 0x3fb33333); // 8b28a2: mov dword ptr [esp + 0x20], 0x3fb33333
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, 0x3fcccccd); // 8b28aa: mov dword ptr [esp + 0x24], 0x3fcccccd
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0x40000000); // 8b28b2: mov dword ptr [esp + 0x28], 0x40000000
        if (!R.zf) { pc = 0x8b28d5; continue; } // 8b28ba: jne 0x8b28d5
        pc = 0x8b28bc; continue;
      case 0x8b28bc:
        R.push(0x0); // 8b28bc: push 0
        R.push(0x0); // 8b28be: push 0
        R.push(0x1); // 8b28c0: push 1
        R.push(0x1); // 8b28c2: push 1
        R.push((R.esi >>> 0)); // 8b28c4: push esi
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 8b28c5: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8b28ca: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8b28cd: test eax, eax
        if (R.zf) { pc = 0x8b2bb4; continue; } // 8b28cf: je 0x8b2bb4
        pc = 0x8b28d5; continue;
      case 0x8b28d5:
        R.push((R.esi >>> 0)); // 8b28d5: push esi
        R.call(0x53b900, { n: 1, thisEcx: false, calleeClean: false }); // 8b28d6: call 0x53b900
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8b28db: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8b28de: test eax, eax
        if (!R.zf) { pc = 0x8b2bb4; continue; } // 8b28e0: jne 0x8b2bb4
        pc = 0x8b28e6; continue;
      case 0x8b28e6:
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 8b28e6: test edi, edi
        if (!R.zf) { pc = 0x8b28f0; continue; } // 8b28e8: jne 0x8b28f0
        pc = 0x8b28ea; continue;
      case 0x8b28ea:
        R.edi = (R.m.u32(((R.esi + 0xcf) | 0) >>> 0)) | 0; // 8b28ea: mov edi, dword ptr [esi + 0xcf]
        pc = 0x8b28f0; continue;
      case 0x8b28f0:
        R.push((R.ebp >>> 0)); // 8b28f0: push ebp
        R.push((R.edi >>> 0)); // 8b28f1: push edi
        R.ecx = ((R.ebx >>> 0)) | 0; // 8b28f2: mov ecx, ebx
        R.call(0x8b4cd0, { n: 1, thisEcx: false, calleeClean: true }); // 8b28f4: call 0x8b4cd0
        R.push((R.esi >>> 0)); // 8b28f9: push esi
        R.ebp = ((R.eax >>> 0)) | 0; // 8b28fa: mov ebp, eax
        R.call(0x53cb80, { n: 0, thisEcx: false, calleeClean: false }); // 8b28fc: call 0x53cb80
        R.m.w32(((R.esp + 0x4c) | 0) >>> 0, (R.eax >>> 0)); // 8b2901: mov dword ptr [esp + 0x4c], eax
        R.eax = (((R.esp + 0x34) | 0)) | 0; // 8b2905: lea eax, [esp + 0x34]
        R.push((R.eax >>> 0)); // 8b2909: push eax
        R.push((R.esi >>> 0)); // 8b290a: push esi
        R.call(0x53cc30, { n: 3, thisEcx: false, calleeClean: false }); // 8b290b: call 0x53cc30
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 8b2910: add esp, 0xc
        R.edi = ((R.ebp >>> 0)) | 0; // 8b2913: mov edi, ebp
        R.ebx = (0x6) | 0; // 8b2915: mov ebx, 6
        pc = 0x8b291a; continue;
      case 0x8b291a:
        R.edx = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 8b291a: mov edx, dword ptr [edi]
        R.sub((R.edx >>> 0), 0xffffffff, 32); // 8b291c: cmp edx, -1
        if (R.zf) { pc = 0x8b298d; continue; } // 8b291f: je 0x8b298d
        pc = 0x8b2921; continue;
      case 0x8b2921:
        R.ecx = (((R.edx + R.edx * 4) | 0)) | 0; // 8b2921: lea ecx, [edx + edx*4]
        R.eax = (((R.edx + R.ecx * 2) | 0)) | 0; // 8b2924: lea eax, [edx + ecx*2]
        R.ecx = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 8b2927: mov ecx, dword ptr [0xae23bc]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 8b292d: lea eax, [eax + eax*4]
        R.esi = (R.m.u32(((R.ecx + R.eax * 2 + 0x69) | 0) >>> 0)) | 0; // 8b2930: mov esi, dword ptr [ecx + eax*2 + 0x69]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8b2934: test esi, esi
        if (!R.zf) { pc = 0x8b294a; continue; } // 8b2936: jne 0x8b294a
        pc = 0x8b2938; continue;
      case 0x8b2938:
        R.eax = (((R.edi + 0x4) | 0)) | 0; // 8b2938: lea eax, [edi + 4]
        R.edx = (R.logic((R.edx >>> 0) ^ (R.edx >>> 0), 32)) | 0; // 8b293b: xor edx, edx
        R.m.w32(((R.edi) | 0) >>> 0, 0xffffffff); // 8b293d: mov dword ptr [edi], 0xffffffff
        R.m.w32(((R.eax) | 0) >>> 0, (R.edx >>> 0)); // 8b2943: mov dword ptr [eax], edx
        R.m.w8(((R.eax + 0x4) | 0) >>> 0, ((R.edx >>> 0) & 0xff)); // 8b2945: mov byte ptr [eax + 4], dl
        pc = 0x8b298d; continue; // 8b2948: jmp 0x8b298d
      case 0x8b294a:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) | 0xff, 8)) & 0xff) << 0)) | 0; // 8b294a: or cl, 0xff
        R.esi = (R.logic((R.esi >>> 0) ^ (R.esi >>> 0), 32)) | 0; // 8b294d: xor esi, esi
        pc = 0x8b294f; continue;
      case 0x8b294f:
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8b294f: test esi, esi
        if (!R.zf) { pc = 0x8b298d; continue; } // 8b2951: jne 0x8b298d
        pc = 0x8b2953; continue;
      case 0x8b2953:
        R.sub(((R.ecx >>> 0) & 0xff), 0xff, 8); // 8b2953: cmp cl, 0xff
        if (!R.zf) { pc = 0x8b295e; continue; } // 8b2956: jne 0x8b295e
        pc = 0x8b2958; continue;
      case 0x8b2958:
        R.eax = (R.m.u32(((R.esp + 0x48) | 0) >>> 0)) | 0; // 8b2958: mov eax, dword ptr [esp + 0x48]
        pc = 0x8b2965; continue; // 8b295c: jmp 0x8b2965
      case 0x8b295e:
        R.eax = (((((R.ecx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 8b295e: movsx eax, cl
        R.eax = (R.m.u32(((R.esp + R.eax * 4 + 0x30) | 0) >>> 0)) | 0; // 8b2961: mov eax, dword ptr [esp + eax*4 + 0x30]
        pc = 0x8b2965; continue;
      case 0x8b2965:
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8b2965: test eax, eax
        if (R.zf) { pc = 0x8b2972; continue; } // 8b2967: je 0x8b2972
        pc = 0x8b2969; continue;
      case 0x8b2969:
        R.sub(R.m.u32(((R.eax) | 0) >>> 0), (R.edx >>> 0), 32); // 8b2969: cmp dword ptr [eax], edx
        if (!R.zf) { pc = 0x8b2972; continue; } // 8b296b: jne 0x8b2972
        pc = 0x8b296d; continue;
      case 0x8b296d:
        R.esi = (0x1) | 0; // 8b296d: mov esi, 1
        pc = 0x8b2972; continue;
      case 0x8b2972:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.incdec(((R.ecx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 8b2972: inc cl
        R.sub(((R.ecx >>> 0) & 0xff), 0x5, 8); // 8b2974: cmp cl, 5
        if (R.cL) { pc = 0x8b294f; continue; } // 8b2977: jl 0x8b294f
        pc = 0x8b2979; continue;
      case 0x8b2979:
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8b2979: test esi, esi
        if (!R.zf) { pc = 0x8b298d; continue; } // 8b297b: jne 0x8b298d
        pc = 0x8b297d; continue;
      case 0x8b297d:
        R.edx = (((R.edi + 0x4) | 0)) | 0; // 8b297d: lea edx, [edi + 4]
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 8b2980: xor ecx, ecx
        R.m.w32(((R.edi) | 0) >>> 0, 0xffffffff); // 8b2982: mov dword ptr [edi], 0xffffffff
        R.m.w32(((R.edx) | 0) >>> 0, (R.ecx >>> 0)); // 8b2988: mov dword ptr [edx], ecx
        R.m.w8(((R.edx + 0x4) | 0) >>> 0, ((R.ecx >>> 0) & 0xff)); // 8b298a: mov byte ptr [edx + 4], cl
        pc = 0x8b298d; continue;
      case 0x8b298d:
        R.edi = (R.add((R.edi >>> 0), 0x9, 32)) | 0; // 8b298d: add edi, 9
        R.ebx = (R.incdec((R.ebx >>> 0), -1, 32)) | 0; // 8b2990: dec ebx
        if (!R.zf) { pc = 0x8b291a; continue; } // 8b2991: jne 0x8b291a
        pc = 0x8b2993; continue;
      case 0x8b2993:
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) | 0xff, 8)) & 0xff) << 0)) | 0; // 8b2993: or al, 0xff
        R.m.w8(((R.esp + 0x4c) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 8b2995: mov byte ptr [esp + 0x4c], al
        pc = 0x8b2999; continue;
      case 0x8b2999:
        R.sub(((R.eax >>> 0) & 0xff), 0xff, 8); // 8b2999: cmp al, 0xff
        if (!R.zf) { pc = 0x8b29a3; continue; } // 8b299b: jne 0x8b29a3
        pc = 0x8b299d; continue;
      case 0x8b299d:
        R.edx = (R.m.u32(((R.esp + 0x48) | 0) >>> 0)) | 0; // 8b299d: mov edx, dword ptr [esp + 0x48]
        pc = 0x8b29aa; continue; // 8b29a1: jmp 0x8b29aa
      case 0x8b29a3:
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 8b29a3: movsx eax, al
        R.edx = (R.m.u32(((R.esp + R.eax * 4 + 0x30) | 0) >>> 0)) | 0; // 8b29a6: mov edx, dword ptr [esp + eax*4 + 0x30]
        pc = 0x8b29aa; continue;
      case 0x8b29aa:
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 8b29aa: test edx, edx
        if (R.zf) { pc = 0x8b2a0c; continue; } // 8b29ac: je 0x8b2a0c
        pc = 0x8b29ae; continue;
      case 0x8b29ae:
        R.eax = (R.m.u32(((R.edx + 0x69) | 0) >>> 0)) | 0; // 8b29ae: mov eax, dword ptr [edx + 0x69]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8b29b1: test eax, eax
        if (R.zf) { pc = 0x8b2a0c; continue; } // 8b29b3: je 0x8b2a0c
        pc = 0x8b29b5; continue;
      case 0x8b29b5:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) ^ ((R.ecx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 8b29b5: xor cl, cl
        R.esi = (R.logic((R.esi >>> 0) ^ (R.esi >>> 0), 32)) | 0; // 8b29b7: xor esi, esi
        pc = 0x8b29b9; continue;
      case 0x8b29b9:
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8b29b9: test esi, esi
        if (!R.zf) { pc = 0x8b2a0c; continue; } // 8b29bb: jne 0x8b2a0c
        pc = 0x8b29bd; continue;
      case 0x8b29bd:
        R.ebx = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 8b29bd: mov ebx, dword ptr [edx]
        R.eax = (((((R.ecx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 8b29bf: movsx eax, cl
        R.edi = (((R.ebp + R.eax * 8) | 0)) | 0; // 8b29c2: lea edi, [ebp + eax*8]
        R.sub((R.ebx >>> 0), R.m.u32(((R.eax + R.edi) | 0) >>> 0), 32); // 8b29c6: cmp ebx, dword ptr [eax + edi]
        if (!R.zf) { pc = 0x8b29d0; continue; } // 8b29c9: jne 0x8b29d0
        pc = 0x8b29cb; continue;
      case 0x8b29cb:
        R.esi = (0x1) | 0; // 8b29cb: mov esi, 1
        pc = 0x8b29d0; continue;
      case 0x8b29d0:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.incdec(((R.ecx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 8b29d0: inc cl
        R.sub(((R.ecx >>> 0) & 0xff), 0x6, 8); // 8b29d2: cmp cl, 6
        if (R.cL) { pc = 0x8b29b9; continue; } // 8b29d5: jl 0x8b29b9
        pc = 0x8b29d7; continue;
      case 0x8b29d7:
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8b29d7: test esi, esi
        if (!R.zf) { pc = 0x8b2a0c; continue; } // 8b29d9: jne 0x8b2a0c
        pc = 0x8b29db; continue;
      case 0x8b29db:
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 8b29db: xor al, al
        pc = 0x8b29dd; continue;
      case 0x8b29dd:
        R.ecx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 8b29dd: movsx ecx, al
        R.esi = (((R.ebp + R.ecx * 8) | 0)) | 0; // 8b29e0: lea esi, [ebp + ecx*8]
        R.sub(R.m.u32(((R.ecx + R.esi) | 0) >>> 0), 0xffffffff, 32); // 8b29e4: cmp dword ptr [ecx + esi], -1
        if (R.zf) { pc = 0x8b29f2; continue; } // 8b29e8: je 0x8b29f2
        pc = 0x8b29ea; continue;
      case 0x8b29ea:
        R.eax = ((R.eax & 0xffffff00) | (((R.incdec(((R.eax >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 8b29ea: inc al
        R.sub(((R.eax >>> 0) & 0xff), 0x6, 8); // 8b29ec: cmp al, 6
        if (R.cL) { pc = 0x8b29dd; continue; } // 8b29ee: jl 0x8b29dd
        pc = 0x8b29f0; continue;
      case 0x8b29f0:
        pc = 0x8b2a0c; continue; // 8b29f0: jmp 0x8b2a0c
      case 0x8b29f2:
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 8b29f2: movsx eax, al
        R.edx = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 8b29f5: mov edx, dword ptr [edx]
        R.ecx = (((R.ebp + R.eax * 8) | 0)) | 0; // 8b29f7: lea ecx, [ebp + eax*8]
        R.eax = (R.add((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 8b29fb: add eax, ecx
        R.ecx = (0x1010101) | 0; // 8b29fd: mov ecx, 0x1010101
        R.m.w32(((R.eax) | 0) >>> 0, (R.edx >>> 0)); // 8b2a02: mov dword ptr [eax], edx
        R.eax = (R.add((R.eax >>> 0), 0x4, 32)) | 0; // 8b2a04: add eax, 4
        R.m.w32(((R.eax) | 0) >>> 0, (R.ecx >>> 0)); // 8b2a07: mov dword ptr [eax], ecx
        R.m.w8(((R.eax + 0x4) | 0) >>> 0, ((R.ecx >>> 0) & 0xff)); // 8b2a09: mov byte ptr [eax + 4], cl
        pc = 0x8b2a0c; continue;
      case 0x8b2a0c:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x4c) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8b2a0c: mov al, byte ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffffff00) | (((R.incdec(((R.eax >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 8b2a10: inc al
        R.sub(((R.eax >>> 0) & 0xff), 0x5, 8); // 8b2a12: cmp al, 5
        R.m.w8(((R.esp + 0x4c) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 8b2a14: mov byte ptr [esp + 0x4c], al
        if (R.cL) { pc = 0x8b2999; continue; } // 8b2a18: jl 0x8b2999
        pc = 0x8b2a1e; continue;
      case 0x8b2a1e:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x4c) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8b2a1e: mov al, byte ptr [esp + 0x4c]
        R.edx = ((R.ebp >>> 0)) | 0; // 8b2a22: mov edx, ebp
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edx >>> 0)); // 8b2a24: mov dword ptr [esp + 0x10], edx
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, 0x6); // 8b2a28: mov dword ptr [esp + 0x14], 6
        pc = 0x8b2a30; continue;
      case 0x8b2a30:
        R.ecx = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 8b2a30: mov ecx, dword ptr [edx]
        R.sub((R.ecx >>> 0), 0xffffffff, 32); // 8b2a32: cmp ecx, -1
        if (R.zf) { pc = 0x8b2b9d; continue; } // 8b2a35: je 0x8b2b9d
        pc = 0x8b2a3b; continue;
      case 0x8b2a3b:
        R.esi = (((R.ecx + R.ecx * 4) | 0)) | 0; // 8b2a3b: lea esi, [ecx + ecx*4]
        R.ecx = (((R.ecx + R.esi * 2) | 0)) | 0; // 8b2a3e: lea ecx, [ecx + esi*2]
        R.esi = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 8b2a41: mov esi, dword ptr [0xae23bc]
        R.ecx = (((R.ecx + R.ecx * 4) | 0)) | 0; // 8b2a47: lea ecx, [ecx + ecx*4]
        R.esi = (R.m.u32(((R.esi + R.ecx * 2 + 0x69) | 0) >>> 0)) | 0; // 8b2a4a: mov esi, dword ptr [esi + ecx*2 + 0x69]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8b2a4e: test esi, esi
        if (!R.zf) { pc = 0x8b2a67; continue; } // 8b2a50: jne 0x8b2a67
        pc = 0x8b2a52; continue;
      case 0x8b2a52:
        R.esi = (((R.edx + 0x4) | 0)) | 0; // 8b2a52: lea esi, [edx + 4]
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 8b2a55: xor ecx, ecx
        R.m.w32(((R.edx) | 0) >>> 0, 0xffffffff); // 8b2a57: mov dword ptr [edx], 0xffffffff
        R.m.w32(((R.esi) | 0) >>> 0, (R.ecx >>> 0)); // 8b2a5d: mov dword ptr [esi], ecx
        R.m.w8(((R.esi + 0x4) | 0) >>> 0, ((R.ecx >>> 0) & 0xff)); // 8b2a5f: mov byte ptr [esi + 4], cl
        pc = 0x8b2b9d; continue; // 8b2a62: jmp 0x8b2b9d
      case 0x8b2a67:
        R.ebx = ((R.ebx & 0xffffff00) | (((R.logic(((R.ebx >>> 0) & 0xff) ^ ((R.ebx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 8b2a67: xor bl, bl
        R.ecx = (((R.edx + 0x4) | 0)) | 0; // 8b2a69: lea ecx, [edx + 4]
        R.m.w8(((R.esp + 0x4c) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 8b2a6c: mov byte ptr [esp + 0x4c], bl
        R.edi = ((R.ecx >>> 0)) | 0; // 8b2a70: mov edi, ecx
        R.ebp = (0x5) | 0; // 8b2a72: mov ebp, 5
        pc = 0x8b2a77; continue;
      case 0x8b2a77:
        R.sub(R.m.u8(((R.edi) | 0) >>> 0), 0x0, 8); // 8b2a77: cmp byte ptr [edi], 0
        if (R.zf) { pc = 0x8b2a7e; continue; } // 8b2a7a: je 0x8b2a7e
        pc = 0x8b2a7c; continue;
      case 0x8b2a7c:
        R.ebx = ((R.ebx & 0xffffff00) | (((R.incdec(((R.ebx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 8b2a7c: inc bl
        pc = 0x8b2a7e; continue;
      case 0x8b2a7e:
        R.edi = (R.incdec((R.edi >>> 0), 1, 32)) | 0; // 8b2a7e: inc edi
        R.ebp = (R.incdec((R.ebp >>> 0), -1, 32)) | 0; // 8b2a7f: dec ebp
        if (!R.zf) { pc = 0x8b2a77; continue; } // 8b2a80: jne 0x8b2a77
        pc = 0x8b2a82; continue;
      case 0x8b2a82:
        R.m.w8(((R.esp + 0x4c) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 8b2a82: mov byte ptr [esp + 0x4c], bl
        R.ebx = (R.logic((R.ebx >>> 0) ^ (R.ebx >>> 0), 32)) | 0; // 8b2a86: xor ebx, ebx
        R.ebp = ((R.ecx >>> 0)) | 0; // 8b2a88: mov ebp, ecx
        R.m.w32(((R.esp + 0x48) | 0) >>> 0, 0x5); // 8b2a8a: mov dword ptr [esp + 0x48], 5
        pc = 0x8b2a92; continue;
      case 0x8b2a92:
        R.sub(R.m.u8(((R.ebp) | 0) >>> 0), 0x0, 8); // 8b2a92: cmp byte ptr [ebp], 0
        if (R.zf) { pc = 0x8b2b8c; continue; } // 8b2a96: je 0x8b2b8c
        pc = 0x8b2a9c; continue;
      case 0x8b2a9c:
        R.sub((R.ebx >>> 0), 0x4, 32); // 8b2a9c: cmp ebx, 4
        if (!R.cBE) { pc = 0x8b2b5e; continue; } // 8b2a9f: ja 0x8b2b5e
        pc = 0x8b2aa5; continue;
      case 0x8b2aa5:
        pc = [0x8b2b31, 0x8b2add, 0x8b2aac, 0x8b2b14, 0x8b2b51][R.ebx >>> 0]; continue; // 8b2aa5: jmp dword ptr [ebx*4 + 0x8b2bc0]
      case 0x8b2aac:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.esi + 0x10) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8b2aac: mov dl, byte ptr [esi + 0x10]
        R.push((R.edx >>> 0)); // 8b2aaf: push edx
        R.push((R.esi >>> 0)); // 8b2ab0: push esi
        R.call(0x544410, { n: 2, thisEcx: false, calleeClean: false }); // 8b2ab1: call 0x544410
        R.edx = (((R.m.u8(((R.esi + 0xe) | 0) >>> 0)) << 24 >> 24)) | 0; // 8b2ab6: movsx edx, byte ptr [esi + 0xe]
        R.ecx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 8b2aba: movsx ecx, al
        R.eax = (((R.m.u8(((R.esi + 0x12) | 0) >>> 0)) << 24 >> 24)) | 0; // 8b2abd: movsx eax, byte ptr [esi + 0x12]
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 8b2ac1: add ecx, eax
        R.eax = (0x55555556) | 0; // 8b2ac3: mov eax, 0x55555556
        R.ecx = (R.add((R.ecx >>> 0), (R.edx >>> 0), 32)) | 0; // 8b2ac8: add ecx, edx
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 8b2aca: add esp, 8
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 8b2acd: imul ecx
        R.eax = ((R.edx >>> 0)) | 0; // 8b2acf: mov eax, edx
        R.ecx = ((R.eax >>> 0)) | 0; // 8b2ad1: mov ecx, eax
        R.ecx = (R.shr((R.ecx >>> 0), 0x1f, 32)) | 0; // 8b2ad3: shr ecx, 0x1f
        R.eax = (R.add((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 8b2ad6: add eax, ecx
        pc = 0x8b2b5e; continue; // 8b2ad8: jmp 0x8b2b5e
      case 0x8b2add:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.esi + 0x21) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8b2add: mov dl, byte ptr [esi + 0x21]
        R.push((R.edx >>> 0)); // 8b2ae0: push edx
        R.push((R.esi >>> 0)); // 8b2ae1: push esi
        R.call(0x544410, { n: 0, thisEcx: false, calleeClean: false }); // 8b2ae2: call 0x544410
        R.edi = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 8b2ae7: movsx edi, al
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x10) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8b2aea: mov al, byte ptr [esi + 0x10]
        R.push((R.eax >>> 0)); // 8b2aed: push eax
        R.push((R.esi >>> 0)); // 8b2aee: push esi
        R.call(0x544410, { n: 4, thisEcx: false, calleeClean: false }); // 8b2aef: call 0x544410
        R.edx = (((R.m.u8(((R.esi + 0x12) | 0) >>> 0)) << 24 >> 24)) | 0; // 8b2af4: movsx edx, byte ptr [esi + 0x12]
        R.ecx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 8b2af8: movsx ecx, al
        R.edi = (R.add((R.edi >>> 0), (R.ecx >>> 0), 32)) | 0; // 8b2afb: add edi, ecx
        R.eax = (0x55555556) | 0; // 8b2afd: mov eax, 0x55555556
        R.edi = (R.add((R.edi >>> 0), (R.edx >>> 0), 32)) | 0; // 8b2b02: add edi, edx
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 8b2b04: add esp, 0x10
        { const p = BigInt(R.eax | 0) * BigInt((((R.edi >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 8b2b07: imul edi
        R.eax = ((R.edx >>> 0)) | 0; // 8b2b09: mov eax, edx
        R.ecx = ((R.eax >>> 0)) | 0; // 8b2b0b: mov ecx, eax
        R.ecx = (R.shr((R.ecx >>> 0), 0x1f, 32)) | 0; // 8b2b0d: shr ecx, 0x1f
        R.eax = (R.add((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 8b2b10: add eax, ecx
        pc = 0x8b2b5e; continue; // 8b2b12: jmp 0x8b2b5e
      case 0x8b2b14:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.esi + 0x10) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8b2b14: mov dl, byte ptr [esi + 0x10]
        R.push((R.edx >>> 0)); // 8b2b17: push edx
        R.push((R.esi >>> 0)); // 8b2b18: push esi
        R.call(0x544410, { n: 2, thisEcx: false, calleeClean: false }); // 8b2b19: call 0x544410
        R.ecx = (((R.m.u8(((R.esi + 0x12) | 0) >>> 0)) << 24 >> 24)) | 0; // 8b2b1e: movsx ecx, byte ptr [esi + 0x12]
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 8b2b22: movsx eax, al
        R.eax = (R.add((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 8b2b25: add eax, ecx
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 8b2b27: add esp, 8
        R.edx = R.eax < 0 ? -1 : 0; // 8b2b2a: cdq 
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 8b2b2b: sub eax, edx
        R.eax = (R.sar((R.eax >>> 0), 0x1, 32)) | 0; // 8b2b2d: sar eax, 1
        pc = 0x8b2b5e; continue; // 8b2b2f: jmp 0x8b2b5e
      case 0x8b2b31:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.esi + 0x10) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8b2b31: mov dl, byte ptr [esi + 0x10]
        R.push((R.edx >>> 0)); // 8b2b34: push edx
        R.push((R.esi >>> 0)); // 8b2b35: push esi
        R.call(0x544410, { n: 2, thisEcx: false, calleeClean: false }); // 8b2b36: call 0x544410
        R.ecx = (((R.m.u8(((R.esi + 0x12) | 0) >>> 0)) << 24 >> 24)) | 0; // 8b2b3b: movsx ecx, byte ptr [esi + 0x12]
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 8b2b3f: movsx eax, al
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 8b2b42: sub eax, ecx
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 8b2b44: add esp, 8
        R.eax = (R.add((R.eax >>> 0), 0x15, 32)) | 0; // 8b2b47: add eax, 0x15
        R.edx = R.eax < 0 ? -1 : 0; // 8b2b4a: cdq 
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 8b2b4b: sub eax, edx
        R.eax = (R.sar((R.eax >>> 0), 0x1, 32)) | 0; // 8b2b4d: sar eax, 1
        pc = 0x8b2b5e; continue; // 8b2b4f: jmp 0x8b2b5e
      case 0x8b2b51:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.esi + 0x11) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8b2b51: mov dl, byte ptr [esi + 0x11]
        R.push((R.edx >>> 0)); // 8b2b54: push edx
        R.push((R.esi >>> 0)); // 8b2b55: push esi
        R.call(0x544410, { n: 2, thisEcx: false, calleeClean: false }); // 8b2b56: call 0x544410
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 8b2b5b: add esp, 8
        pc = 0x8b2b5e; continue;
      case 0x8b2b5e:
        R.ecx = (((R.m.u8(((R.esp + 0x4c) | 0) >>> 0)) << 24 >> 24)) | 0; // 8b2b5e: movsx ecx, byte ptr [esp + 0x4c]
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 8b2b63: movsx eax, al
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.eax >>> 0)); // 8b2b66: mov dword ptr [esp + 0x18], eax
        R.fpush(R.m.s32(((R.esp + 0x18) | 0) >>> 0)); // 8b2b6a: fild dword ptr [esp + 0x18]
        R.st[0] = R.st[0] / R.f32(((R.esp + R.ecx * 4 + 0x18) | 0)); // 8b2b6e: fdiv dword ptr [esp + ecx*4 + 0x18]
        R.ftol(); // 8b2b72: call 0x945640
        R.sub(((R.eax >>> 0) & 0xff), 0x1, 8); // 8b2b77: cmp al, 1
        if (!R.cL) { pc = 0x8b2b7f; continue; } // 8b2b79: jge 0x8b2b7f
        pc = 0x8b2b7b; continue;
      case 0x8b2b7b:
        R.eax = ((R.eax & 0xffffff00) | (((0x1) & 0xff) << 0)) | 0; // 8b2b7b: mov al, 1
        pc = 0x8b2b85; continue; // 8b2b7d: jmp 0x8b2b85
      case 0x8b2b7f:
        R.sub(((R.eax >>> 0) & 0xff), 0x14, 8); // 8b2b7f: cmp al, 0x14
        if (R.cLE) { pc = 0x8b2b85; continue; } // 8b2b81: jle 0x8b2b85
        pc = 0x8b2b83; continue;
      case 0x8b2b83:
        R.eax = ((R.eax & 0xffffff00) | (((0x14) & 0xff) << 0)) | 0; // 8b2b83: mov al, 0x14
        pc = 0x8b2b85; continue;
      case 0x8b2b85:
        R.edx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 8b2b85: mov edx, dword ptr [esp + 0x10]
        R.m.w8(((R.ebp) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 8b2b89: mov byte ptr [ebp], al
        pc = 0x8b2b8c; continue;
      case 0x8b2b8c:
        R.ecx = (R.m.u32(((R.esp + 0x48) | 0) >>> 0)) | 0; // 8b2b8c: mov ecx, dword ptr [esp + 0x48]
        R.ebx = (R.incdec((R.ebx >>> 0), 1, 32)) | 0; // 8b2b90: inc ebx
        R.ebp = (R.incdec((R.ebp >>> 0), 1, 32)) | 0; // 8b2b91: inc ebp
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 8b2b92: dec ecx
        R.m.w32(((R.esp + 0x48) | 0) >>> 0, (R.ecx >>> 0)); // 8b2b93: mov dword ptr [esp + 0x48], ecx
        if (!R.zf) { pc = 0x8b2a92; continue; } // 8b2b97: jne 0x8b2a92
        pc = 0x8b2b9d; continue;
      case 0x8b2b9d:
        R.ecx = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 8b2b9d: mov ecx, dword ptr [esp + 0x14]
        R.edx = (R.add((R.edx >>> 0), 0x9, 32)) | 0; // 8b2ba1: add edx, 9
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 8b2ba4: dec ecx
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edx >>> 0)); // 8b2ba5: mov dword ptr [esp + 0x10], edx
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.ecx >>> 0)); // 8b2ba9: mov dword ptr [esp + 0x14], ecx
        if (!R.zf) { pc = 0x8b2a30; continue; } // 8b2bad: jne 0x8b2a30
        pc = 0x8b2bb3; continue;
      case 0x8b2bb3:
        R.ebp = (R.pop()) | 0; // 8b2bb3: pop ebp
        pc = 0x8b2bb4; continue;
      case 0x8b2bb4:
        R.edi = (R.pop()) | 0; // 8b2bb4: pop edi
        R.esi = (R.pop()) | 0; // 8b2bb5: pop esi
        R.ebx = (R.pop()) | 0; // 8b2bb6: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x34, 32)) | 0; // 8b2bb7: add esp, 0x34
        return R.ret(2); // 8b2bba: ret 8
      default: throw new Error(`f_8b2880: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
