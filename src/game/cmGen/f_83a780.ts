// 0x83a780 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4cf5a0=1c, 4cf5f0=2tc, 5444a0=2, 600a50=5, 867d30=0t, 945333=8
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_83a780(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x83a780;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x83a780:
        R.push((R.ecx >>> 0)); // 83a780: push ecx
        R.push((R.ebx >>> 0)); // 83a781: push ebx
        R.push((R.ebp >>> 0)); // 83a782: push ebp
        R.push((R.esi >>> 0)); // 83a783: push esi
        R.push((R.edi >>> 0)); // 83a784: push edi
        R.edi = ((R.ecx >>> 0)) | 0; // 83a785: mov edi, ecx
        R.esi = (R.logic((R.esi >>> 0) ^ (R.esi >>> 0), 32)) | 0; // 83a787: xor esi, esi
        pc = 0x83a789; continue;
      case 0x83a789:
        R.eax = (R.m.u32(((R.edi + R.esi * 4 + 0x98) | 0) >>> 0)) | 0; // 83a789: mov eax, dword ptr [edi + esi*4 + 0x98]
        R.ebx = (R.logic((R.ebx >>> 0) ^ (R.ebx >>> 0), 32)) | 0; // 83a790: xor ebx, ebx
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 83a792: cmp eax, ebx
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ebx >>> 0)); // 83a794: mov dword ptr [esp + 0x10], ebx
        if (R.cLE) { pc = 0x83a980; continue; } // 83a798: jle 0x83a980
        pc = 0x83a79e; continue;
      case 0x83a79e:
        R.eax = (R.m.u32(((R.edi + R.esi * 4 + 0x18) | 0) >>> 0)) | 0; // 83a79e: mov eax, dword ptr [edi + esi*4 + 0x18]
        R.eax = (R.m.u32(((R.ebx + R.eax) | 0) >>> 0)) | 0; // 83a7a2: mov eax, dword ptr [ebx + eax]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 83a7a5: lea ecx, [eax + eax*4]
        R.eax = (((R.eax + R.ecx * 2) | 0)) | 0; // 83a7a8: lea eax, [eax + ecx*2]
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 83a7ab: mov ecx, dword ptr [0xae1050]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 83a7b1: lea edx, [eax + eax*4]
        R.eax = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 83a7b4: mov eax, dword ptr [0xae23bc]
        R.ebp = (((R.eax + R.edx * 2) | 0)) | 0; // 83a7b9: lea ebp, [eax + edx*2]
        R.push((R.ebp >>> 0)); // 83a7bc: push ebp
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 83a7bd: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83a7c2: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 83a7c4: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x83a7e3; continue; } // 83a7c9: je 0x83a7e3
        pc = 0x83a7cb; continue;
      case 0x83a7cb:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 83a7cb: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 83a7ce: mov edx, dword ptr [0xae23b4]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 83a7d4: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 83a7d7: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 83a7da: add ecx, eax
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 83a7dc: add edx, eax
        R.eax = (((R.edx + R.ecx * 4) | 0)) | 0; // 83a7de: lea eax, [edx + ecx*4]
        pc = 0x83a7e5; continue; // 83a7e1: jmp 0x83a7e5
      case 0x83a7e3:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 83a7e3: xor eax, eax
        pc = 0x83a7e5; continue;
      case 0x83a7e5:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 83a7e5: mov ecx, dword ptr [0xae1050]
        R.push((R.eax >>> 0)); // 83a7eb: push eax
        R.push((R.ebp >>> 0)); // 83a7ec: push ebp
        R.call(0x4cf5f0, { n: 2, thisEcx: true, calleeClean: true }); // 83a7ed: call 0x4cf5f0
        R.sub((R.esi >>> 0), 0xf, 32); // 83a7f2: cmp esi, 0xf
        if (!R.zf) { pc = 0x83a806; continue; } // 83a7f5: jne 0x83a806
        pc = 0x83a7f7; continue;
      case 0x83a7f7:
        R.eax = (R.m.u32(((R.edi + 0x54) | 0) >>> 0)) | 0; // 83a7f7: mov eax, dword ptr [edi + 0x54]
        R.ecx = (R.m.u32(((R.ebp + 0x52) | 0) >>> 0)) | 0; // 83a7fa: mov ecx, dword ptr [ebp + 0x52]
        R.m.w32(((R.eax + R.ebx + 0x8) | 0) >>> 0, (R.ecx >>> 0)); // 83a7fd: mov dword ptr [eax + ebx + 8], ecx
        pc = 0x83a965; continue; // 83a801: jmp 0x83a965
      case 0x83a806:
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83a806: test eax, eax
        if (R.zf) { pc = 0x83a882; continue; } // 83a808: je 0x83a882
        pc = 0x83a80a; continue;
      case 0x83a80a:
        R.ecx = ((R.eax >>> 0)) | 0; // 83a80a: mov ecx, eax
        R.call(0x867d30, { n: 0, thisEcx: true, calleeClean: false }); // 83a80c: call 0x867d30
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 83a811: test al, al
        if (!R.zf) { pc = 0x83a882; continue; } // 83a813: jne 0x83a882
        pc = 0x83a815; continue;
      case 0x83a815:
        R.edx = (R.m.u32(((R.edi + R.esi * 4 + 0x18) | 0) >>> 0)) | 0; // 83a815: mov edx, dword ptr [edi + esi*4 + 0x18]
        R.eax = (R.m.u32(((R.ebp + 0x52) | 0) >>> 0)) | 0; // 83a819: mov eax, dword ptr [ebp + 0x52]
        R.m.w32(((R.ebx + R.edx + 0x8) | 0) >>> 0, (R.eax >>> 0)); // 83a81c: mov dword ptr [ebx + edx + 8], eax
        R.eax = (R.m.u32(((R.ebp + 0x39) | 0) >>> 0)) | 0; // 83a820: mov eax, dword ptr [ebp + 0x39]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83a823: test eax, eax
        if (R.zf) { pc = 0x83a88e; continue; } // 83a825: je 0x83a88e
        pc = 0x83a827; continue;
      case 0x83a827:
        R.push(0x0); // 83a827: push 0
        R.push(0x0); // 83a829: push 0
        R.push(0x1); // 83a82b: push 1
        R.push(0x0); // 83a82d: push 0
        R.push((R.eax >>> 0)); // 83a82f: push eax
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 83a830: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 83a835: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83a838: test eax, eax
        if (R.zf) { pc = 0x83a88e; continue; } // 83a83a: je 0x83a88e
        pc = 0x83a83c; continue;
      case 0x83a83c:
        R.push(0x0); // 83a83c: push 0
        R.push((R.ebp >>> 0)); // 83a83e: push ebp
        R.call(0x5444a0, { n: 2, thisEcx: false, calleeClean: false }); // 83a83f: call 0x5444a0
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 83a844: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83a847: test eax, eax
        if (R.zf) { pc = 0x83a88e; continue; } // 83a849: je 0x83a88e
        pc = 0x83a84b; continue;
      case 0x83a84b:
        R.ecx = (R.m.u32(((R.edi + R.esi * 4 + 0x18) | 0) >>> 0)) | 0; // 83a84b: mov ecx, dword ptr [edi + esi*4 + 0x18]
        R.eax = (((R.ebx + R.ecx + 0x8) | 0)) | 0; // 83a84f: lea eax, [ebx + ecx + 8]
        R.ecx = (R.m.u32(((R.ebx + R.ecx + 0x8) | 0) >>> 0)) | 0; // 83a853: mov ecx, dword ptr [ebx + ecx + 8]
        R.ecx = (R.add((R.ecx >>> 0), 0xffe91ca0, 32)) | 0; // 83a857: add ecx, 0xffe91ca0
        R.m.w32(((R.eax) | 0) >>> 0, (R.ecx >>> 0)); // 83a85d: mov dword ptr [eax], ecx
        R.edx = (R.m.u32(((R.edi + R.esi * 4 + 0x18) | 0) >>> 0)) | 0; // 83a85f: mov edx, dword ptr [edi + esi*4 + 0x18]
        R.ebp = (R.m.u32(((R.ebp + 0x52) | 0) >>> 0)) | 0; // 83a863: mov ebp, dword ptr [ebp + 0x52]
        R.eax = (0x55555556) | 0; // 83a866: mov eax, 0x55555556
        R.ecx = (((R.ebx + R.edx + 0x8) | 0)) | 0; // 83a86b: lea ecx, [ebx + edx + 8]
        { const p = BigInt(R.eax | 0) * BigInt((((R.ebp >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 83a86f: imul ebp
        R.eax = ((R.edx >>> 0)) | 0; // 83a871: mov eax, edx
        R.eax = (R.shr((R.eax >>> 0), 0x1f, 32)) | 0; // 83a873: shr eax, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 83a876: add edx, eax
        R.eax = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 83a878: mov eax, dword ptr [ecx]
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 83a87a: cmp eax, edx
        if (!R.cL) { pc = 0x83a88e; continue; } // 83a87c: jge 0x83a88e
        pc = 0x83a87e; continue;
      case 0x83a87e:
        R.m.w32(((R.ecx) | 0) >>> 0, (R.edx >>> 0)); // 83a87e: mov dword ptr [ecx], edx
        pc = 0x83a88e; continue; // 83a880: jmp 0x83a88e
      case 0x83a882:
        R.ecx = (R.m.u32(((R.edi + R.esi * 4 + 0x18) | 0) >>> 0)) | 0; // 83a882: mov ecx, dword ptr [edi + esi*4 + 0x18]
        R.m.w32(((R.ebx + R.ecx + 0x8) | 0) >>> 0, 0x0); // 83a886: mov dword ptr [ebx + ecx + 8], 0
        pc = 0x83a88e; continue;
      case 0x83a88e:
        R.edx = (R.m.u32(((R.edi + R.esi * 4 + 0x58) | 0) >>> 0)) | 0; // 83a88e: mov edx, dword ptr [edi + esi*4 + 0x58]
        R.eax = (R.m.u32(((R.ebx + R.edx) | 0) >>> 0)) | 0; // 83a892: mov eax, dword ptr [ebx + edx]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 83a895: lea ecx, [eax + eax*4]
        R.eax = (((R.eax + R.ecx * 2) | 0)) | 0; // 83a898: lea eax, [eax + ecx*2]
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 83a89b: mov ecx, dword ptr [0xae1050]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 83a8a1: lea edx, [eax + eax*4]
        R.eax = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 83a8a4: mov eax, dword ptr [0xae23bc]
        R.ebp = (((R.eax + R.edx * 2) | 0)) | 0; // 83a8a9: lea ebp, [eax + edx*2]
        R.push((R.ebp >>> 0)); // 83a8ac: push ebp
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 83a8ad: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83a8b2: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 83a8b4: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x83a8d3; continue; } // 83a8b9: je 0x83a8d3
        pc = 0x83a8bb; continue;
      case 0x83a8bb:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 83a8bb: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 83a8be: mov edx, dword ptr [0xae23b4]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 83a8c4: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 83a8c7: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 83a8ca: add ecx, eax
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 83a8cc: add edx, eax
        R.eax = (((R.edx + R.ecx * 4) | 0)) | 0; // 83a8ce: lea eax, [edx + ecx*4]
        pc = 0x83a8d5; continue; // 83a8d1: jmp 0x83a8d5
      case 0x83a8d3:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 83a8d3: xor eax, eax
        pc = 0x83a8d5; continue;
      case 0x83a8d5:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 83a8d5: mov ecx, dword ptr [0xae1050]
        R.push((R.eax >>> 0)); // 83a8db: push eax
        R.push((R.ebp >>> 0)); // 83a8dc: push ebp
        R.call(0x4cf5f0, { n: 2, thisEcx: true, calleeClean: true }); // 83a8dd: call 0x4cf5f0
        R.ecx = (R.m.u32(((R.ebp + 0x61) | 0) >>> 0)) | 0; // 83a8e2: mov ecx, dword ptr [ebp + 0x61]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 83a8e5: test ecx, ecx
        if (R.zf) { pc = 0x83a959; continue; } // 83a8e7: je 0x83a959
        pc = 0x83a8e9; continue;
      case 0x83a8e9:
        R.ebp = (R.m.u32(((R.ebp + 0x39) | 0) >>> 0)) | 0; // 83a8e9: mov ebp, dword ptr [ebp + 0x39]
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 83a8ec: test ebp, ebp
        if (R.zf) { pc = 0x83a959; continue; } // 83a8ee: je 0x83a959
        pc = 0x83a8f0; continue;
      case 0x83a8f0:
        R.ecx = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 83a8f0: mov ecx, dword ptr [ebp + 0x57]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 83a8f3: test ecx, ecx
        if (R.zf) { pc = 0x83a959; continue; } // 83a8f5: je 0x83a959
        pc = 0x83a8f7; continue;
      case 0x83a8f7:
        R.ecx = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 83a8f7: mov ecx, dword ptr [ecx]
        R.edx = (R.m.u32(((0xadadfc) | 0) >>> 0)) | 0; // 83a8f9: mov edx, dword ptr [0xadadfc]
        R.sub(R.m.u32(((R.edx + R.ecx * 4) | 0) >>> 0), 0x0, 32); // 83a8ff: cmp dword ptr [edx + ecx*4], 0
        if (!R.zf) { pc = 0x83a910; continue; } // 83a903: jne 0x83a910
        pc = 0x83a905; continue;
      case 0x83a905:
        R.sub(R.m.u16(((R.ebp + 0x80) | 0) >>> 0), 0x1770, 16); // 83a905: cmp word ptr [ebp + 0x80], 0x1770
        if (R.cL) { pc = 0x83a959; continue; } // 83a90e: jl 0x83a959
        pc = 0x83a910; continue;
      case 0x83a910:
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83a910: test eax, eax
        if (R.zf) { pc = 0x83a94b; continue; } // 83a912: je 0x83a94b
        pc = 0x83a914; continue;
      case 0x83a914:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + 0x4e) | 0) >>> 0)) & 0xff) << 0)) | 0; // 83a914: mov cl, byte ptr [eax + 0x4e]
        R.logic(((R.ecx >>> 0) & 0xff) & 0x2, 8); // 83a917: test cl, 2
        if (R.zf) { pc = 0x83a92a; continue; } // 83a91a: je 0x83a92a
        pc = 0x83a91c; continue;
      case 0x83a91c:
        R.eax = (R.m.u32(((R.edi + R.esi * 4 + 0x58) | 0) >>> 0)) | 0; // 83a91c: mov eax, dword ptr [edi + esi*4 + 0x58]
        R.m.w32(((R.ebx + R.eax + 0x8) | 0) >>> 0, 0xfffffc18); // 83a920: mov dword ptr [ebx + eax + 8], 0xfffffc18
        pc = 0x83a965; continue; // 83a928: jmp 0x83a965
      case 0x83a92a:
        R.logic(((R.ecx >>> 0) & 0xff) & 0x9, 8); // 83a92a: test cl, 9
        if (!R.zf) { pc = 0x83a93d; continue; } // 83a92d: jne 0x83a93d
        pc = 0x83a92f; continue;
      case 0x83a92f:
        R.ecx = (((R.m.u8(((R.eax + 0x3d) | 0) >>> 0)) << 24 >> 24)) | 0; // 83a92f: movsx ecx, byte ptr [eax + 0x3d]
        R.edx = (R.m.u32(((R.edi + R.esi * 4 + 0x58) | 0) >>> 0)) | 0; // 83a933: mov edx, dword ptr [edi + esi*4 + 0x58]
        R.m.w32(((R.ebx + R.edx + 0x8) | 0) >>> 0, (R.ecx >>> 0)); // 83a937: mov dword ptr [ebx + edx + 8], ecx
        pc = 0x83a965; continue; // 83a93b: jmp 0x83a965
      case 0x83a93d:
        R.eax = (R.m.u32(((R.edi + R.esi * 4 + 0x58) | 0) >>> 0)) | 0; // 83a93d: mov eax, dword ptr [edi + esi*4 + 0x58]
        R.m.w32(((R.ebx + R.eax + 0x8) | 0) >>> 0, 0x7d0); // 83a941: mov dword ptr [ebx + eax + 8], 0x7d0
        pc = 0x83a965; continue; // 83a949: jmp 0x83a965
      case 0x83a94b:
        R.ecx = (R.m.u32(((R.edi + R.esi * 4 + 0x58) | 0) >>> 0)) | 0; // 83a94b: mov ecx, dword ptr [edi + esi*4 + 0x58]
        R.m.w32(((R.ebx + R.ecx + 0x8) | 0) >>> 0, 0x7d0); // 83a94f: mov dword ptr [ebx + ecx + 8], 0x7d0
        pc = 0x83a965; continue; // 83a957: jmp 0x83a965
      case 0x83a959:
        R.edx = (R.m.u32(((R.edi + R.esi * 4 + 0x58) | 0) >>> 0)) | 0; // 83a959: mov edx, dword ptr [edi + esi*4 + 0x58]
        R.m.w32(((R.ebx + R.edx + 0x8) | 0) >>> 0, 0x7d0); // 83a95d: mov dword ptr [ebx + edx + 8], 0x7d0
        pc = 0x83a965; continue;
      case 0x83a965:
        R.eax = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 83a965: mov eax, dword ptr [esp + 0x10]
        R.ecx = (R.m.u32(((R.edi + R.esi * 4 + 0x98) | 0) >>> 0)) | 0; // 83a969: mov ecx, dword ptr [edi + esi*4 + 0x98]
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 83a970: inc eax
        R.ebx = (R.add((R.ebx >>> 0), 0xc, 32)) | 0; // 83a971: add ebx, 0xc
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 83a974: cmp eax, ecx
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 83a976: mov dword ptr [esp + 0x10], eax
        if (R.cL) { pc = 0x83a79e; continue; } // 83a97a: jl 0x83a79e
        pc = 0x83a980; continue;
      case 0x83a980:
        R.eax = (R.m.u32(((R.edi + R.esi * 4 + 0x98) | 0) >>> 0)) | 0; // 83a980: mov eax, dword ptr [edi + esi*4 + 0x98]
        R.ecx = (R.m.u32(((R.edi + R.esi * 4 + 0x18) | 0) >>> 0)) | 0; // 83a987: mov ecx, dword ptr [edi + esi*4 + 0x18]
        R.push(0x83b670); // 83a98b: push 0x83b670
        R.push(0xc); // 83a990: push 0xc
        R.push((R.eax >>> 0)); // 83a992: push eax
        R.push((R.ecx >>> 0)); // 83a993: push ecx
        R.call(0x945333, { n: 0, thisEcx: false, calleeClean: false }); // 83a994: call 0x945333
        R.edx = (R.m.u32(((R.edi + R.esi * 4 + 0x98) | 0) >>> 0)) | 0; // 83a999: mov edx, dword ptr [edi + esi*4 + 0x98]
        R.eax = (R.m.u32(((R.edi + R.esi * 4 + 0x58) | 0) >>> 0)) | 0; // 83a9a0: mov eax, dword ptr [edi + esi*4 + 0x58]
        R.push(0x83b670); // 83a9a4: push 0x83b670
        R.push(0xc); // 83a9a9: push 0xc
        R.push((R.edx >>> 0)); // 83a9ab: push edx
        R.push((R.eax >>> 0)); // 83a9ac: push eax
        R.call(0x945333, { n: 8, thisEcx: false, calleeClean: false }); // 83a9ad: call 0x945333
        R.esp = (R.add((R.esp >>> 0), 0x20, 32)) | 0; // 83a9b2: add esp, 0x20
        R.esi = (R.incdec((R.esi >>> 0), 1, 32)) | 0; // 83a9b5: inc esi
        R.sub((R.esi >>> 0), 0x10, 32); // 83a9b6: cmp esi, 0x10
        if (R.cL) { pc = 0x83a789; continue; } // 83a9b9: jl 0x83a789
        pc = 0x83a9bf; continue;
      case 0x83a9bf:
        R.edi = (R.pop()) | 0; // 83a9bf: pop edi
        R.esi = (R.pop()) | 0; // 83a9c0: pop esi
        R.ebp = (R.pop()) | 0; // 83a9c1: pop ebp
        R.ebx = (R.pop()) | 0; // 83a9c2: pop ebx
        R.ecx = (R.pop()) | 0; // 83a9c3: pop ecx
        return R.ret(0); // 83a9c4: ret 
      default: throw new Error(`f_83a780: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
