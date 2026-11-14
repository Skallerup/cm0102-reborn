// 0x8d0780 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 417c10=2tc, 4cf5a0=1c, 4d0c60=5c, 53ab90=2, 5446d0=1, 54a110=0t, 54cdb0=2tc, 5e8290=9, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x8d0780, 0x8d07c0, 0x8d07cf, 0x8d07d4, 0x8d07d9, 0x8d07ef, 0x8d07fc, 0x8d0834, 0x8d083e, 0x8d0849, 0x8d0853, 0x8d0860, 0x8d086d, 0x8d0883, 0x8d0892, 0x8d08f6, 0x8d090a, 0x8d0919, 0x8d093b, 0x8d0946, 0x8d094b, 0x8d0956, 0x8d0960, 0x8d0975, 0x8d097c, 0x8d0999, 0x8d09af, 0x8d09c3, 0x8d09d3, 0x8d09ed, 0x8d0a49, 0x8d0a4b]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5]);
function f_8d0780_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 8d0780
        R.push(0xffffffff); // 8d0780: push -1
        R.push(0x96403b); // 8d0782: push 0x96403b
        R.eax = (0) | 0; // 8d0787: mov eax, dword ptr fs:[0]
        R.push((R.eax >>> 0)); // 8d078d: push eax
        /* fs */ // 8d078e: mov dword ptr fs:[0], esp
        R.esp = (R.sub((R.esp >>> 0), 0x210, 32)) | 0; // 8d0795: sub esp, 0x210
        R.push((R.ebx >>> 0)); // 8d079b: push ebx
        R.push((R.ebp >>> 0)); // 8d079c: push ebp
        R.push((R.esi >>> 0)); // 8d079d: push esi
        R.push((R.edi >>> 0)); // 8d079e: push edi
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 8d079f: lea ecx, [esp + 0x10]
        R.call(0x54a110, { n: 0, thisEcx: true, calleeClean: false }); // 8d07a3: call 0x54a110
        R.edi = (R.m.u32(((R.esp + 0x230) | 0) >>> 0)) | 0; // 8d07a8: mov edi, dword ptr [esp + 0x230]
        R.ebp = (R.logic((R.ebp >>> 0) ^ (R.ebp >>> 0), 32)) | 0; // 8d07af: xor ebp, ebp
        R.sub((R.edi >>> 0), (R.ebp >>> 0), 32); // 8d07b1: cmp edi, ebp
        R.m.w32(((R.esp + 0x228) | 0) >>> 0, (R.ebp >>> 0)); // 8d07b3: mov dword ptr [esp + 0x228], ebp
        if (R.zf) { pc = 29; continue; } // 8d07ba: je 0x8d09ed
        pc = 1; continue;
      case 1: // 8d07c0
        R.ebx = (R.m.u32(((R.esp + 0x234) | 0) >>> 0)) | 0; // 8d07c0: mov ebx, dword ptr [esp + 0x234]
        R.sub((R.ebx >>> 0), (R.ebp >>> 0), 32); // 8d07c7: cmp ebx, ebp
        if (R.zf) { pc = 29; continue; } // 8d07c9: je 0x8d09ed
        pc = 2; continue;
      case 2: // 8d07cf
        R.sub(R.m.u32(((R.edi + 0x61) | 0) >>> 0), (R.ebp >>> 0), 32); // 8d07cf: cmp dword ptr [edi + 0x61], ebp
        if (!R.zf) { pc = 10; continue; } // 8d07d2: jne 0x8d0853
        pc = 3; continue;
      case 3: // 8d07d4
        R.sub(R.m.u32(((R.edi + 0x69) | 0) >>> 0), (R.ebp >>> 0), 32); // 8d07d4: cmp dword ptr [edi + 0x69], ebp
        if (R.zf) { pc = 10; continue; } // 8d07d7: je 0x8d0853
        pc = 4; continue;
      case 4: // 8d07d9
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8d07d9: mov ecx, dword ptr [0xae1050]
        R.push((R.edi >>> 0)); // 8d07df: push edi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 8d07e0: call 0x4cf5a0
        R.esi = ((R.eax >>> 0)) | 0; // 8d07e5: mov esi, eax
        R.sub((R.esi >>> 0), (R.ebp >>> 0), 32); // 8d07e7: cmp esi, ebp
        if (R.zf) { pc = 30; continue; } // 8d07e9: je 0x8d0a49
        pc = 5; continue;
      case 5: // 8d07ef
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x35) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8d07ef: mov al, byte ptr [esi + 0x35]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x3f, 8)) & 0xff) << 0)) | 0; // 8d07f2: and al, 0x3f
        R.sub(((R.eax >>> 0) & 0xff), 0x2, 8); // 8d07f4: cmp al, 2
        if (!R.zf) { pc = 30; continue; } // 8d07f6: jne 0x8d0a49
        pc = 6; continue;
      default: return pc;
    }
  }
}
function f_8d0780_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 6: // 8d07fc
        R.ecx = (R.m.u32(((0xae2c94) | 0) >>> 0)) | 0; // 8d07fc: mov ecx, dword ptr [0xae2c94]
        R.edx = (R.m.u32(((0xae2c90) | 0) >>> 0)) | 0; // 8d0802: mov edx, dword ptr [0xae2c90]
        R.push((R.ecx >>> 0)); // 8d0808: push ecx
        R.push((R.edx >>> 0)); // 8d0809: push edx
        R.ecx = (((R.esi + 0x2d) | 0)) | 0; // 8d080a: lea ecx, [esi + 0x2d]
        R.call(0x54cdb0, { n: 2, thisEcx: true, calleeClean: true }); // 8d080d: call 0x54cdb0
        R.ecx = ((R.eax >>> 0)) | 0; // 8d0812: mov ecx, eax
        R.eax = (0x92492493) | 0; // 8d0814: mov eax, 0x92492493
        { const p = BigInt(((R.m.u32(((R.esi + 0xc) | 0) >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 8d0819: imul ecx, dword ptr [esi + 0xc]
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 8d081d: imul ecx
        R.edx = (R.add((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 8d081f: add edx, ecx
        R.edx = (R.sar((R.edx >>> 0), 0x2, 32)) | 0; // 8d0821: sar edx, 2
        R.eax = ((R.edx >>> 0)) | 0; // 8d0824: mov eax, edx
        R.eax = (R.shr((R.eax >>> 0), 0x1f, 32)) | 0; // 8d0826: shr eax, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8d0829: add edx, eax
        R.eax = ((R.edx >>> 0)) | 0; // 8d082b: mov eax, edx
        R.sub((R.eax >>> 0), 0x3e8, 32); // 8d082d: cmp eax, 0x3e8
        if (!R.cL) { pc = 8; continue; } // 8d0832: jge 0x8d083e
        pc = 7; continue;
      case 7: // 8d0834
        R.eax = (0x3e8) | 0; // 8d0834: mov eax, 0x3e8
        pc = 31; continue; // 8d0839: jmp 0x8d0a4b
      case 8: // 8d083e
        R.sub((R.eax >>> 0), 0xf4240, 32); // 8d083e: cmp eax, 0xf4240
        if (R.cLE) { pc = 31; continue; } // 8d0843: jle 0x8d0a4b
        pc = 9; continue;
      case 9: // 8d0849
        R.eax = (0xf4240) | 0; // 8d0849: mov eax, 0xf4240
        pc = 31; continue; // 8d084e: jmp 0x8d0a4b
      case 10: // 8d0853
        R.sub(R.m.u8(((0xae233c) | 0) >>> 0), 0x1, 8); // 8d0853: cmp byte ptr [0xae233c], 1
        if (!R.zf) { pc = 15; continue; } // 8d085a: jne 0x8d08f6
        pc = 11; continue;
      case 11: // 8d0860
        R.sub(R.m.u32(((R.esp + 0x238) | 0) >>> 0), (R.ebp >>> 0), 32); // 8d0860: cmp dword ptr [esp + 0x238], ebp
        if (!R.zf) { pc = 15; continue; } // 8d0867: jne 0x8d08f6
        pc = 12; continue;
      case 12: // 8d086d
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8d086d: mov ecx, dword ptr [0xae1050]
        R.push((R.edi >>> 0)); // 8d0873: push edi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 8d0874: call 0x4cf5a0
        R.esi = ((R.eax >>> 0)) | 0; // 8d0879: mov esi, eax
        R.sub((R.esi >>> 0), (R.ebp >>> 0), 32); // 8d087b: cmp esi, ebp
        if (R.zf) { pc = 30; continue; } // 8d087d: je 0x8d0a49
        pc = 13; continue;
      case 13: // 8d0883
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esi + 0x35) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8d0883: mov cl, byte ptr [esi + 0x35]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0x3f, 8)) & 0xff) << 0)) | 0; // 8d0886: and cl, 0x3f
        R.sub(((R.ecx >>> 0) & 0xff), 0x2, 8); // 8d0889: cmp cl, 2
        if (!R.zf) { pc = 30; continue; } // 8d088c: jne 0x8d0a49
        pc = 14; continue;
      default: return pc;
    }
  }
}
function f_8d0780_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 14: // 8d0892
        R.edx = (R.m.u32(((0xae2c94) | 0) >>> 0)) | 0; // 8d0892: mov edx, dword ptr [0xae2c94]
        R.eax = (R.m.u32(((0xae2c90) | 0) >>> 0)) | 0; // 8d0898: mov eax, dword ptr [0xae2c90]
        R.push((R.edx >>> 0)); // 8d089d: push edx
        R.push((R.eax >>> 0)); // 8d089e: push eax
        R.ecx = (((R.esi + 0x2d) | 0)) | 0; // 8d089f: lea ecx, [esi + 0x2d]
        R.call(0x54cdb0, { n: 2, thisEcx: true, calleeClean: true }); // 8d08a2: call 0x54cdb0
        R.ecx = ((R.eax >>> 0)) | 0; // 8d08a7: mov ecx, eax
        R.eax = (0x92492493) | 0; // 8d08a9: mov eax, 0x92492493
        { const p = BigInt(((R.m.u32(((R.esi + 0xc) | 0) >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 8d08ae: imul ecx, dword ptr [esi + 0xc]
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 8d08b2: imul ecx
        R.edx = (R.add((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 8d08b4: add edx, ecx
        R.eax = (R.m.u32(((R.esi + 0x4) | 0) >>> 0)) | 0; // 8d08b6: mov eax, dword ptr [esi + 4]
        R.edx = (R.sar((R.edx >>> 0), 0x2, 32)) | 0; // 8d08b9: sar edx, 2
        R.ecx = ((R.edx >>> 0)) | 0; // 8d08bc: mov ecx, edx
        R.push((R.ebp >>> 0)); // 8d08be: push ebp
        R.ecx = (R.shr((R.ecx >>> 0), 0x1f, 32)) | 0; // 8d08bf: shr ecx, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 8d08c2: add edx, ecx
        R.ecx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 8d08c4: mov ecx, dword ptr [0xae23b4]
        R.ebx = ((R.edx >>> 0)) | 0; // 8d08ca: mov ebx, edx
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 8d08cc: lea edx, [eax + eax*8]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 8d08cf: shl edx, 4
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8d08d2: add edx, eax
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 8d08d4: add ecx, eax
        R.push(0xffffffff); // 8d08d6: push -1
        R.push(0x1); // 8d08d8: push 1
        R.edx = (((R.ecx + R.edx * 4) | 0)) | 0; // 8d08da: lea edx, [ecx + edx*4]
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8d08dd: mov ecx, dword ptr [0xae1050]
        R.push((R.edx >>> 0)); // 8d08e3: push edx
        R.push((R.edi >>> 0)); // 8d08e4: push edi
        R.call(0x4d0c60, { n: 5, thisEcx: false, calleeClean: true }); // 8d08e5: call 0x4d0c60
        R.eax = (R.add((R.eax >>> 0), (R.ebx >>> 0), 32)) | 0; // 8d08ea: add eax, ebx
        R.edx = R.eax < 0 ? -1 : 0; // 8d08ec: cdq 
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 8d08ed: sub eax, edx
        R.eax = (R.sar((R.eax >>> 0), 0x1, 32)) | 0; // 8d08ef: sar eax, 1
        pc = 31; continue; // 8d08f1: jmp 0x8d0a4b
      case 15: // 8d08f6
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8d08f6: mov ecx, dword ptr [0xae1050]
        R.push((R.edi >>> 0)); // 8d08fc: push edi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 8d08fd: call 0x4cf5a0
        R.sub((R.eax >>> 0), (R.ebp >>> 0), 32); // 8d0902: cmp eax, ebp
        if (R.zf) { pc = 30; continue; } // 8d0904: je 0x8d0a49
        pc = 16; continue;
      case 16: // 8d090a
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x35) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8d090a: mov dl, byte ptr [eax + 0x35]
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) & 0x3f, 8)) & 0xff) << 0)) | 0; // 8d090d: and dl, 0x3f
        R.sub(((R.edx >>> 0) & 0xff), 0x5, 8); // 8d0910: cmp dl, 5
        if (R.zf) { pc = 30; continue; } // 8d0913: je 0x8d0a49
        pc = 17; continue;
      default: return pc;
    }
  }
}
function f_8d0780_3(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 17: // 8d0919
        R.ecx = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 8d0919: mov ecx, dword ptr [eax + 4]
        R.ebp = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 8d091c: mov ebp, dword ptr [0xae23b4]
        R.ebp = (R.add((R.ebp >>> 0), (R.ecx >>> 0), 32)) | 0; // 8d0922: add ebp, ecx
        R.esi = (((R.ecx + R.ecx * 8) | 0)) | 0; // 8d0924: lea esi, [ecx + ecx*8]
        R.esi = (R.shl((R.esi >>> 0), 0x4, 32)) | 0; // 8d0927: shl esi, 4
        R.esi = (R.add((R.esi >>> 0), (R.ecx >>> 0), 32)) | 0; // 8d092a: add esi, ecx
        R.ecx = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 8d092c: mov ecx, dword ptr [ebx + 0x53]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 8d092f: test ecx, ecx
        R.esi = (((R.ebp + R.esi * 4) | 0)) | 0; // 8d0931: lea esi, [ebp + esi*4]
        if (R.zf) { pc = 30; continue; } // 8d0935: je 0x8d0a49
        pc = 18; continue;
      case 18: // 8d093b
        R.ecx = (R.m.u32(((R.esi + 0x53) | 0) >>> 0)) | 0; // 8d093b: mov ecx, dword ptr [esi + 0x53]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 8d093e: test ecx, ecx
        if (R.zf) { pc = 30; continue; } // 8d0940: je 0x8d0a49
        pc = 19; continue;
      case 19: // 8d0946
        R.sub(((R.edx >>> 0) & 0xff), 0x2, 8); // 8d0946: cmp dl, 2
        if (!R.zf) { pc = 21; continue; } // 8d0949: jne 0x8d0956
        pc = 20; continue;
      case 20: // 8d094b
        R.eax = (R.add((R.eax >>> 0), 0x2d, 32)) | 0; // 8d094b: add eax, 0x2d
        R.push((R.eax >>> 0)); // 8d094e: push eax
        R.eax = (((R.esp + 0x1c) | 0)) | 0; // 8d094f: lea eax, [esp + 0x1c]
        R.push((R.eax >>> 0)); // 8d0953: push eax
        pc = 22; continue; // 8d0954: jmp 0x8d0960
      case 21: // 8d0956
        R.ecx = (((R.esp + 0x18) | 0)) | 0; // 8d0956: lea ecx, [esp + 0x18]
        R.push(0xae2c90); // 8d095a: push 0xae2c90
        R.push((R.ecx >>> 0)); // 8d095f: push ecx
        pc = 22; continue;
      case 22: // 8d0960
        R.ecx = (((R.esp + 0x18) | 0)) | 0; // 8d0960: lea ecx, [esp + 0x18]
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 8d0964: call 0x417c10
        R.edx = (R.m.u32(((R.esi + 0x53) | 0) >>> 0)) | 0; // 8d0969: mov edx, dword ptr [esi + 0x53]
        R.eax = (R.m.u32(((0x9cf4a8) | 0) >>> 0)) | 0; // 8d096c: mov eax, dword ptr [0x9cf4a8]
        R.sub(R.m.u32(((R.edx) | 0) >>> 0), (R.eax >>> 0), 32); // 8d0971: cmp dword ptr [edx], eax
        if (!R.zf) { pc = 25; continue; } // 8d0973: jne 0x8d0999
        pc = 23; continue;
      case 23: // 8d0975
        R.ecx = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 8d0975: mov ecx, dword ptr [ebx + 0x53]
        R.sub(R.m.u32(((R.ecx) | 0) >>> 0), (R.eax >>> 0), 32); // 8d0978: cmp dword ptr [ecx], eax
        if (!R.zf) { pc = 25; continue; } // 8d097a: jne 0x8d0999
        pc = 24; continue;
      case 24: // 8d097c
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8d097c: mov ecx, dword ptr [0xae1050]
        R.push(0x0); // 8d0982: push 0
        R.push(0xffffffff); // 8d0984: push -1
        R.push(0x1); // 8d0986: push 1
        R.push((R.esi >>> 0)); // 8d0988: push esi
        R.push((R.edi >>> 0)); // 8d0989: push edi
        R.call(0x4d0c60, { n: 5, thisEcx: false, calleeClean: true }); // 8d098a: call 0x4d0c60
        R.edx = R.eax < 0 ? -1 : 0; // 8d098f: cdq 
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 8d0990: sub eax, edx
        R.eax = (R.sar((R.eax >>> 0), 0x1, 32)) | 0; // 8d0992: sar eax, 1
        pc = 31; continue; // 8d0994: jmp 0x8d0a4b
      default: return pc;
    }
  }
}
function f_8d0780_4(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 25: // 8d0999
        R.edx = (((R.esp + 0x10) | 0)) | 0; // 8d0999: lea edx, [esp + 0x10]
        R.push((R.edx >>> 0)); // 8d099d: push edx
        R.push((R.edi >>> 0)); // 8d099e: push edi
        R.call(0x53ab90, { n: 2, thisEcx: false, calleeClean: false }); // 8d099f: call 0x53ab90
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 8d09a4: add esp, 8
        R.sub(((R.eax >>> 0) & 0xff), 0x18, 8); // 8d09a7: cmp al, 0x18
        if (!R.cL) { pc = 30; continue; } // 8d09a9: jge 0x8d0a49
        pc = 26; continue;
      case 26: // 8d09af
        R.eax = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 8d09af: mov eax, dword ptr [ebx + 0x53]
        R.push((R.eax >>> 0)); // 8d09b2: push eax
        R.call(0x5446d0, { n: 1, thisEcx: false, calleeClean: false }); // 8d09b3: call 0x5446d0
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8d09b8: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8d09bb: test eax, eax
        if (R.zf) { pc = 30; continue; } // 8d09bd: je 0x8d0a49
        pc = 27; continue;
      case 27: // 8d09c3
        R.ecx = (R.m.u32(((R.esi + 0x53) | 0) >>> 0)) | 0; // 8d09c3: mov ecx, dword ptr [esi + 0x53]
        R.push((R.ecx >>> 0)); // 8d09c6: push ecx
        R.call(0x5446d0, { n: 1, thisEcx: false, calleeClean: false }); // 8d09c7: call 0x5446d0
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8d09cc: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8d09cf: test eax, eax
        if (R.zf) { pc = 30; continue; } // 8d09d1: je 0x8d0a49
        pc = 28; continue;
      case 28: // 8d09d3
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8d09d3: mov ecx, dword ptr [0xae1050]
        R.push(0x0); // 8d09d9: push 0
        R.push(0xffffffff); // 8d09db: push -1
        R.push(0x1); // 8d09dd: push 1
        R.push((R.esi >>> 0)); // 8d09df: push esi
        R.push((R.edi >>> 0)); // 8d09e0: push edi
        R.call(0x4d0c60, { n: 5, thisEcx: false, calleeClean: true }); // 8d09e1: call 0x4d0c60
        R.edx = R.eax < 0 ? -1 : 0; // 8d09e6: cdq 
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 8d09e7: sub eax, edx
        R.eax = (R.sar((R.eax >>> 0), 0x1, 32)) | 0; // 8d09e9: sar eax, 1
        pc = 31; continue; // 8d09eb: jmp 0x8d0a4b
      default: return pc;
    }
  }
}
function f_8d0780_5(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 29: // 8d09ed
        R.edx = (((R.esp + 0x20) | 0)) | 0; // 8d09ed: lea edx, [esp + 0x20]
        R.eax = (((R.esp + 0x120) | 0)) | 0; // 8d09f1: lea eax, [esp + 0x120]
        R.push((R.edx >>> 0)); // 8d09f8: push edx
        R.push((R.eax >>> 0)); // 8d09f9: push eax
        R.push((R.ebp >>> 0)); // 8d09fa: push ebp
        R.push((R.ebp >>> 0)); // 8d09fb: push ebp
        R.push(0xa8d514); // 8d09fc: push 0xa8d514
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 8d0a01: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8d0a06: add esp, 0x14
        R.ecx = (((R.esp + 0x20) | 0)) | 0; // 8d0a09: lea ecx, [esp + 0x20]
        R.edx = (((R.esp + 0x120) | 0)) | 0; // 8d0a0d: lea edx, [esp + 0x120]
        R.push(0x372e); // 8d0a14: push 0x372e
        R.push((R.ecx >>> 0)); // 8d0a19: push ecx
        R.push((R.edx >>> 0)); // 8d0a1a: push edx
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 8d0a1b: call 0x90d130
        R.push((R.eax >>> 0)); // 8d0a20: push eax
        R.push(0x9870e8); // 8d0a21: push 0x9870e8
        R.push(0xae24d0); // 8d0a26: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 8d0a2b: call 0x944c9f
        R.push((R.ebp >>> 0)); // 8d0a30: push ebp
        R.push(0xae24d0); // 8d0a31: push 0xae24d0
        R.push(0x9870e0); // 8d0a36: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 8d0a3b: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 8d0a40: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, (R.ebp >>> 0)); // 8d0a43: mov dword ptr [0xb67a34], ebp
        pc = 30; continue;
      case 30: // 8d0a49
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8d0a49: xor eax, eax
        pc = 31; continue;
      case 31: // 8d0a4b
        R.ecx = (R.m.u32(((R.esp + 0x220) | 0) >>> 0)) | 0; // 8d0a4b: mov ecx, dword ptr [esp + 0x220]
        R.edi = (R.pop()) | 0; // 8d0a52: pop edi
        R.esi = (R.pop()) | 0; // 8d0a53: pop esi
        R.ebp = (R.pop()) | 0; // 8d0a54: pop ebp
        R.ebx = (R.pop()) | 0; // 8d0a55: pop ebx
        /* fs */ // 8d0a56: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x21c, 32)) | 0; // 8d0a5d: add esp, 0x21c
        R.rv = R.ret(3); return -1; // 8d0a63: ret 0xc
      default: return pc;
    }
  }
}
export function f_8d0780(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 32) throw new Error(`f_8d0780: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_8d0780_0(R, pc); break;
      case 1: np = f_8d0780_1(R, pc); break;
      case 2: np = f_8d0780_2(R, pc); break;
      case 3: np = f_8d0780_3(R, pc); break;
      case 4: np = f_8d0780_4(R, pc); break;
      case 5: np = f_8d0780_5(R, pc); break;
      default: throw new Error(`f_8d0780: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_8d0780: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_8d0780.shared = true;
