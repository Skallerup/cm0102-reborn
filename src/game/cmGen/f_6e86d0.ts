// 0x6e86d0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 5407e0=3, 544410=2
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_6e86d0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x6e86d0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x6e86d0:
        R.push((R.ecx >>> 0)); // 6e86d0: push ecx
        R.edx = (R.m.u32(((0xdd7120) | 0) >>> 0)) | 0; // 6e86d1: mov edx, dword ptr [0xdd7120]
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 6e86d7: mov eax, dword ptr [esp + 0x18]
        R.push((R.ebx >>> 0)); // 6e86db: push ebx
        R.push((R.ebp >>> 0)); // 6e86dc: push ebp
        R.ebp = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 6e86dd: mov ebp, dword ptr [esp + 0x14]
        R.push((R.esi >>> 0)); // 6e86e1: push esi
        R.push((R.edi >>> 0)); // 6e86e2: push edi
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, 0x0); // 6e86e3: mov dword ptr [esp + 0x10], 0
        R.esi = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 6e86eb: mov esi, dword ptr [ebp]
        R.ebx = ((R.ebx & 0xffffff00) | (((0x1) & 0xff) << 0)) | 0; // 6e86ee: mov bl, 1
        R.esi = (R.add((R.esi >>> 0), (R.edx >>> 0), 32)) | 0; // 6e86f0: add esi, edx
        R.sub(((R.eax >>> 0) & 0xffff), 0xffff, 16); // 6e86f2: cmp ax, 0xffff
        if (R.cLE) { pc = 0x6e870e; continue; } // 6e86f6: jle 0x6e870e
        pc = 0x6e86f8; continue;
      case 0x6e86f8:
        R.ecx = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 6e86f8: movsx ecx, ax
        R.eax = (0x51eb851f) | 0; // 6e86fb: mov eax, 0x51eb851f
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 6e8700: imul ecx
        R.edx = (R.sar((R.edx >>> 0), 0x4, 32)) | 0; // 6e8702: sar edx, 4
        R.eax = ((R.edx >>> 0)) | 0; // 6e8705: mov eax, edx
        R.eax = (R.shr((R.eax >>> 0), 0x1f, 32)) | 0; // 6e8707: shr eax, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 6e870a: add edx, eax
        pc = 0x6e8740; continue; // 6e870c: jmp 0x6e8740
      case 0x6e870e:
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 6e870e: mov eax, dword ptr [esp + 0x18]
        R.push(0x0); // 6e8712: push 0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 6e8714: test eax, eax
        if (!R.zf) { pc = 0x6e8722; continue; } // 6e8716: jne 0x6e8722
        pc = 0x6e8718; continue;
      case 0x6e8718:
        R.edx = (R.m.u32(((R.esp + 0x24) | 0) >>> 0)) | 0; // 6e8718: mov edx, dword ptr [esp + 0x24]
        R.eax = (R.m.u32(((R.edx + 0xcf) | 0) >>> 0)) | 0; // 6e871c: mov eax, dword ptr [edx + 0xcf]
        pc = 0x6e8722; continue;
      case 0x6e8722:
        R.push((R.eax >>> 0)); // 6e8722: push eax
        R.push((R.ebp >>> 0)); // 6e8723: push ebp
        R.call(0x5407e0, { n: 3, thisEcx: false, calleeClean: false }); // 6e8724: call 0x5407e0
        R.ecx = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 6e8729: movsx ecx, ax
        R.eax = (0x51eb851f) | 0; // 6e872c: mov eax, 0x51eb851f
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 6e8731: add esp, 0xc
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 6e8734: imul ecx
        R.edx = (R.sar((R.edx >>> 0), 0x4, 32)) | 0; // 6e8736: sar edx, 4
        R.ecx = ((R.edx >>> 0)) | 0; // 6e8739: mov ecx, edx
        R.ecx = (R.shr((R.ecx >>> 0), 0x1f, 32)) | 0; // 6e873b: shr ecx, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 6e873e: add edx, ecx
        pc = 0x6e8740; continue;
      case 0x6e8740:
        R.edi = ((R.edx >>> 0)) | 0; // 6e8740: mov edi, edx
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.esp + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 6e8742: mov dl, byte ptr [esp + 0x24]
        R.sub(((R.edx >>> 0) & 0xff), 0x2, 8); // 6e8746: cmp dl, 2
        if (!R.zf) { pc = 0x6e8752; continue; } // 6e8749: jne 0x6e8752
        pc = 0x6e874b; continue;
      case 0x6e874b:
        R.m.w8(((R.esp + 0x28) | 0) >>> 0, 0x0); // 6e874b: mov byte ptr [esp + 0x28], 0
        pc = 0x6e876a; continue; // 6e8750: jmp 0x6e876a
      case 0x6e8752:
        R.eax = (R.m.u32(((R.ebp + 0x61) | 0) >>> 0)) | 0; // 6e8752: mov eax, dword ptr [ebp + 0x61]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + 0xf) | 0) >>> 0)) & 0xff) << 0)) | 0; // 6e8755: mov cl, byte ptr [eax + 0xf]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebp + 0x18) | 0) >>> 0)) & 0xff) << 0)) | 0; // 6e8758: mov al, byte ptr [ebp + 0x18]
        R.sub(((R.ecx >>> 0) & 0xff), 0x14, 8); // 6e875b: cmp cl, 0x14
        if (!R.zf) { pc = 0x6e8764; continue; } // 6e875e: jne 0x6e8764
        pc = 0x6e8760; continue;
      case 0x6e8760:
        R.eax = ((R.eax & 0xffffff00) | (((R.sub(((R.eax >>> 0) & 0xff), 0x1a, 8)) & 0xff) << 0)) | 0; // 6e8760: sub al, 0x1a
        pc = 0x6e8766; continue; // 6e8762: jmp 0x6e8766
      case 0x6e8764:
        R.eax = ((R.eax & 0xffffff00) | (((R.sub(((R.eax >>> 0) & 0xff), 0x17, 8)) & 0xff) << 0)) | 0; // 6e8764: sub al, 0x17
        pc = 0x6e8766; continue;
      case 0x6e8766:
        R.m.w8(((R.esp + 0x28) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 6e8766: mov byte ptr [esp + 0x28], al
        pc = 0x6e876a; continue;
      case 0x6e876a:
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 6e876a: mov eax, dword ptr [esp + 0x18]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 6e876e: test eax, eax
        if (R.zf) { pc = 0x6e87cb; continue; } // 6e8770: je 0x6e87cb
        pc = 0x6e8772; continue;
      case 0x6e8772:
        R.ecx = (R.m.u32(((R.eax + 0x69) | 0) >>> 0)) | 0; // 6e8772: mov ecx, dword ptr [eax + 0x69]
        R.esi = (R.add((R.esi >>> 0), R.m.u32(((R.eax) | 0) >>> 0), 32)) | 0; // 6e8775: add esi, dword ptr [eax]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 6e8777: test ecx, ecx
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 6e8779: mov dword ptr [esp + 0x10], ecx
        if (R.zf) { pc = 0x6e87cb; continue; } // 6e877d: je 0x6e87cb
        pc = 0x6e877f; continue;
      case 0x6e877f:
        R.sub(((R.edx >>> 0) & 0xff), 0x2, 8); // 6e877f: cmp dl, 2
        if (!R.zf) { pc = 0x6e87cb; continue; } // 6e8782: jne 0x6e87cb
        pc = 0x6e8784; continue;
      case 0x6e8784:
        R.sub(((R.edi >>> 0) & 0xffff), 0x32, 16); // 6e8784: cmp di, 0x32
        if (R.cLE) { pc = 0x6e87cb; continue; } // 6e8788: jle 0x6e87cb
        pc = 0x6e878a; continue;
      case 0x6e878a:
        R.eax = ((R.ecx >>> 0)) | 0; // 6e878a: mov eax, ecx
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + 0x17) | 0) >>> 0)) & 0xff) << 0)) | 0; // 6e878c: mov cl, byte ptr [eax + 0x17]
        R.push((R.ecx >>> 0)); // 6e878f: push ecx
        R.push((R.eax >>> 0)); // 6e8790: push eax
        R.call(0x544410, { n: 2, thisEcx: false, calleeClean: false }); // 6e8791: call 0x544410
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 6e8796: movsx eax, al
        R.eax = (R.sub((R.eax >>> 0), 0xa, 32)) | 0; // 6e8799: sub eax, 0xa
        R.ebp = (0xc8) | 0; // 6e879c: mov ebp, 0xc8
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 6e87a1: add esp, 8
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 6e87a4: lea edx, [eax + eax*4]
        R.eax = (((((R.edi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 6e87a7: movsx eax, di
        R.ecx = (((R.eax + R.edx * 2) | 0)) | 0; // 6e87aa: lea ecx, [eax + edx*2]
        R.eax = ((R.esi >>> 0)) | 0; // 6e87ad: mov eax, esi
        R.edx = R.eax < 0 ? -1 : 0; // 6e87af: cdq 
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.ebp >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 6e87b0: idiv ebp
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 6e87b2: cmp ecx, edx
        if (R.cLE) { pc = 0x6e87c7; continue; } // 6e87b4: jle 0x6e87c7
        pc = 0x6e87b6; continue;
      case 0x6e87b6:
        R.edx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 6e87b6: mov edx, dword ptr [esp + 0x1c]
        R.edi = (R.pop()) | 0; // 6e87ba: pop edi
        R.esi = (R.pop()) | 0; // 6e87bb: pop esi
        R.ebp = (R.pop()) | 0; // 6e87bc: pop ebp
        R.eax = (R.m.u32(((R.edx + 0x61) | 0) >>> 0)) | 0; // 6e87bd: mov eax, dword ptr [edx + 0x61]
        R.ebx = (R.pop()) | 0; // 6e87c0: pop ebx
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.eax + 0x5) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 6e87c1: mov ax, word ptr [eax + 5]
        R.ecx = (R.pop()) | 0; // 6e87c5: pop ecx
        return R.eax; // 6e87c6: ret 
      case 0x6e87c7:
        R.ebp = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 6e87c7: mov ebp, dword ptr [esp + 0x1c]
        pc = 0x6e87cb; continue;
      case 0x6e87cb:
        R.eax = ((R.esi >>> 0)) | 0; // 6e87cb: mov eax, esi
        R.ecx = (0x65) | 0; // 6e87cd: mov ecx, 0x65
        R.edx = R.eax < 0 ? -1 : 0; // 6e87d2: cdq 
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.ecx >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 6e87d3: idiv ecx
        R.ecx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 6e87d5: mov ecx, dword ptr [esp + 0x10]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 6e87d9: test ecx, ecx
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 6e87db: mov dword ptr [esp + 0x1c], edx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 6e87df: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 0.01; // 6e87e3: fmul qword ptr [0x967898]
        R.m.wf32(((R.esp + 0x1c) | 0) >>> 0, R.st[0]); R.fpop(); // 6e87e9: fstp dword ptr [esp + 0x1c]
        if (R.zf) { pc = 0x6e885a; continue; } // 6e87ed: je 0x6e885a
        pc = 0x6e87ef; continue;
      case 0x6e87ef:
        R.eax = ((R.esi >>> 0)) | 0; // 6e87ef: mov eax, esi
        R.ebx = (0xa) | 0; // 6e87f1: mov ebx, 0xa
        R.edx = R.eax < 0 ? -1 : 0; // 6e87f6: cdq 
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.ebx >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 6e87f7: idiv ebx
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 6e87f9: test edx, edx
        if (!R.zf) { pc = 0x6e8809; continue; } // 6e87fb: jne 0x6e8809
        pc = 0x6e87fd; continue;
      case 0x6e87fd:
        R.fpush(R.f32(((R.esp + 0x1c) | 0))); // 6e87fd: fld dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 20.0; // 6e8801: fmul dword ptr [0x96afb0]
        pc = 0x6e8846; continue; // 6e8807: jmp 0x6e8846
      case 0x6e8809:
        R.sub(R.m.u8(((R.esp + 0x24) | 0) >>> 0), 0x2, 8); // 6e8809: cmp byte ptr [esp + 0x24], 2
        if (!R.zf) { pc = 0x6e882a; continue; } // 6e880e: jne 0x6e882a
        pc = 0x6e8810; continue;
      case 0x6e8810:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.ecx + 0x17) | 0) >>> 0)) & 0xff) << 0)) | 0; // 6e8810: mov dl, byte ptr [ecx + 0x17]
        R.push((R.edx >>> 0)); // 6e8813: push edx
        R.push((R.ecx >>> 0)); // 6e8814: push ecx
        R.call(0x544410, { n: 2, thisEcx: false, calleeClean: false }); // 6e8815: call 0x544410
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 6e881a: movsx eax, al
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.eax >>> 0)); // 6e881d: mov dword ptr [esp + 0x20], eax
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 6e8821: add esp, 8
        R.fpush(R.m.s32(((R.esp + 0x18) | 0) >>> 0)); // 6e8824: fild dword ptr [esp + 0x18]
        pc = 0x6e8842; continue; // 6e8828: jmp 0x6e8842
      case 0x6e882a:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.ecx + 0x18) | 0) >>> 0)) & 0xff) << 0)) | 0; // 6e882a: mov dl, byte ptr [ecx + 0x18]
        R.push((R.edx >>> 0)); // 6e882d: push edx
        R.push((R.ecx >>> 0)); // 6e882e: push ecx
        R.call(0x544410, { n: 2, thisEcx: false, calleeClean: false }); // 6e882f: call 0x544410
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 6e8834: movsx eax, al
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.eax >>> 0)); // 6e8837: mov dword ptr [esp + 0x20], eax
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 6e883b: add esp, 8
        R.fpush(R.m.s32(((R.esp + 0x18) | 0) >>> 0)); // 6e883e: fild dword ptr [esp + 0x18]
        pc = 0x6e8842; continue;
      case 0x6e8842:
        R.st[0] = R.st[0] * R.f32(((R.esp + 0x1c) | 0)); // 6e8842: fmul dword ptr [esp + 0x1c]
        pc = 0x6e8846; continue;
      case 0x6e8846:
        R.st[0] = R.st[0] + 0.5; // 6e8846: fadd qword ptr [0x968968]
        R.ftol(); // 6e884c: call 0x945640
        R.ebx = ((R.ebx & 0xffffff00) | (((((R.eax >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 6e8851: mov bl, al
        R.sub(((R.ebx >>> 0) & 0xff), 0x14, 8); // 6e8853: cmp bl, 0x14
        if (R.cLE) { pc = 0x6e885a; continue; } // 6e8856: jle 0x6e885a
        pc = 0x6e8858; continue;
      case 0x6e8858:
        R.ebx = ((R.ebx & 0xffffff00) | (((0x14) & 0xff) << 0)) | 0; // 6e8858: mov bl, 0x14
        pc = 0x6e885a; continue;
      case 0x6e885a:
        R.sub(R.m.u8(((R.esp + 0x24) | 0) >>> 0), 0x2, 8); // 6e885a: cmp byte ptr [esp + 0x24], 2
        if (!R.zf) { pc = 0x6e8891; continue; } // 6e885f: jne 0x6e8891
        pc = 0x6e8861; continue;
      case 0x6e8861:
        R.ecx = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 6e8861: movsx ecx, bl
        R.edx = (0x15) | 0; // 6e8864: mov edx, 0x15
        R.eax = ((R.esi >>> 0)) | 0; // 6e8869: mov eax, esi
        R.edx = (R.sub((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 6e886b: sub edx, ecx
        R.edx = (R.shl((R.edx >>> 0), 0x1, 32)) | 0; // 6e886d: shl edx, 1
        R.esi = ((R.edx >>> 0)) | 0; // 6e886f: mov esi, edx
        R.edx = R.eax < 0 ? -1 : 0; // 6e8871: cdq 
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.esi >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 6e8872: idiv esi
        R.eax = ((R.eax & 0xffff0000) | (((((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) & 0xffff) << 0)) | 0; // 6e8874: movsx ax, bl
        R.esi = (((R.edx + R.eax + -0x15) | 0)) | 0; // 6e8878: lea esi, [edx + eax - 0x15]
        R.eax = ((R.ecx >>> 0)) | 0; // 6e887c: mov eax, ecx
        R.ecx = (R.m.u32(((R.ebp + 0x61) | 0) >>> 0)) | 0; // 6e887e: mov ecx, dword ptr [ebp + 0x61]
        R.edx = R.eax < 0 ? -1 : 0; // 6e8881: cdq 
        R.ecx = (((R.m.u16(((R.ecx + 0x5) | 0) >>> 0)) << 16 >> 16)) | 0; // 6e8882: movsx ecx, word ptr [ecx + 5]
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 6e8886: sub eax, edx
        R.eax = (R.sar((R.eax >>> 0), 0x1, 32)) | 0; // 6e8888: sar eax, 1
        R.eax = ((R.eax & 0xffffff00) | (((R.add(((R.eax >>> 0) & 0xff), 0xa, 8)) & 0xff) << 0)) | 0; // 6e888a: add al, 0xa
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 6e888c: movsx eax, al
        pc = 0x6e88d2; continue; // 6e888f: jmp 0x6e88d2
      case 0x6e8891:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x28) | 0) >>> 0)) & 0xff) << 0)) | 0; // 6e8891: mov al, byte ptr [esp + 0x28]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 6e8895: test al, al
        if (R.cLE) { pc = 0x6e88a4; continue; } // 6e8897: jle 0x6e88a4
        pc = 0x6e8899; continue;
      case 0x6e8899:
        R.eax = ((R.eax & 0xffff0000) | (((((((R.eax >>> 0) & 0xff)) << 24 >> 24)) & 0xffff) << 0)) | 0; // 6e8899: movsx ax, al
        R.edx = ((R.eax >>> 0)) | 0; // 6e889d: mov edx, eax
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.edx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.edx = (Number(BigInt.asIntN(32, p))) | 0; } // 6e889f: imul edx, eax
        R.edi = (R.sub((R.edi >>> 0), (R.edx >>> 0), 32)) | 0; // 6e88a2: sub edi, edx
        pc = 0x6e88a4; continue;
      case 0x6e88a4:
        R.ecx = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 6e88a4: movsx ecx, bl
        R.edx = (0x15) | 0; // 6e88a7: mov edx, 0x15
        R.eax = ((R.esi >>> 0)) | 0; // 6e88ac: mov eax, esi
        R.edx = (R.sub((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 6e88ae: sub edx, ecx
        R.edx = (R.shl((R.edx >>> 0), 0x1, 32)) | 0; // 6e88b0: shl edx, 1
        R.esi = ((R.edx >>> 0)) | 0; // 6e88b2: mov esi, edx
        R.edx = R.eax < 0 ? -1 : 0; // 6e88b4: cdq 
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.esi >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 6e88b5: idiv esi
        R.eax = ((R.eax & 0xffff0000) | (((((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) & 0xffff) << 0)) | 0; // 6e88b7: movsx ax, bl
        R.esi = (((R.edx + R.eax + -0x15) | 0)) | 0; // 6e88bb: lea esi, [edx + eax - 0x15]
        R.eax = ((R.ecx >>> 0)) | 0; // 6e88bf: mov eax, ecx
        R.ecx = (R.m.u32(((R.ebp + 0x61) | 0) >>> 0)) | 0; // 6e88c1: mov ecx, dword ptr [ebp + 0x61]
        R.edx = R.eax < 0 ? -1 : 0; // 6e88c4: cdq 
        R.ecx = (((R.m.u16(((R.ecx + 0x7) | 0) >>> 0)) << 16 >> 16)) | 0; // 6e88c5: movsx ecx, word ptr [ecx + 7]
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 6e88c9: sub eax, edx
        R.eax = (R.sar((R.eax >>> 0), 0x1, 32)) | 0; // 6e88cb: sar eax, 1
        R.eax = ((R.eax & 0xffffff00) | (((R.add(((R.eax >>> 0) & 0xff), 0xa, 8)) & 0xff) << 0)) | 0; // 6e88cd: add al, 0xa
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 6e88cf: movsx eax, al
        pc = 0x6e88d2; continue;
      case 0x6e88d2:
        R.edx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 6e88d2: movsx edx, si
        R.ecx = (R.add((R.ecx >>> 0), (R.edx >>> 0), 32)) | 0; // 6e88d5: add ecx, edx
        R.edx = (0x14) | 0; // 6e88d7: mov edx, 0x14
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 6e88dc: imul ecx, eax
        R.edx = (R.sub((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 6e88df: sub edx, eax
        R.eax = (((((R.edi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 6e88e1: movsx eax, di
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.edx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.edx = (Number(BigInt.asIntN(32, p))) | 0; } // 6e88e4: imul edx, eax
        R.ecx = (R.add((R.ecx >>> 0), (R.edx >>> 0), 32)) | 0; // 6e88e7: add ecx, edx
        R.eax = (0x66666667) | 0; // 6e88e9: mov eax, 0x66666667
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 6e88ee: imul ecx
        R.edx = (R.sar((R.edx >>> 0), 0x3, 32)) | 0; // 6e88f0: sar edx, 3
        R.ecx = ((R.edx >>> 0)) | 0; // 6e88f3: mov ecx, edx
        R.edi = (R.pop()) | 0; // 6e88f5: pop edi
        R.ecx = (R.shr((R.ecx >>> 0), 0x1f, 32)) | 0; // 6e88f6: shr ecx, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 6e88f9: add edx, ecx
        R.esi = (R.pop()) | 0; // 6e88fb: pop esi
        R.ebp = (R.pop()) | 0; // 6e88fc: pop ebp
        R.eax = ((R.eax & 0xffff0000) | (((((R.edx >>> 0) & 0xffff)) & 0xffff) << 0)) | 0; // 6e88fd: mov ax, dx
        R.ebx = (R.pop()) | 0; // 6e8900: pop ebx
        R.ecx = (R.pop()) | 0; // 6e8901: pop ecx
        return R.eax; // 6e8902: ret 
      default: throw new Error(`f_6e86d0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
