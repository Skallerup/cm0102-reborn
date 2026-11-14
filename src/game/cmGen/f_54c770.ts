// 0x54c770 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 94627a=1
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_54c770(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x54c770;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x54c770:
        R.push((R.ecx >>> 0)); // 54c770: push ecx
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((0xae2430) | 0) >>> 0)) & 0xff) << 0)) | 0; // 54c771: mov al, byte ptr [0xae2430]
        R.push((R.ebx >>> 0)); // 54c776: push ebx
        R.ebx = (0x1) | 0; // 54c777: mov ebx, 1
        R.push((R.esi >>> 0)); // 54c77c: push esi
        R.push((R.edi >>> 0)); // 54c77d: push edi
        R.edi = ((R.ecx >>> 0)) | 0; // 54c77e: mov edi, ecx
        R.logic(((R.ebx >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 54c780: test bl, al
        R.m.w32(((R.esp + 0xc) | 0) >>> 0, 0x0); // 54c782: mov dword ptr [esp + 0xc], 0
        if (!R.zf) { pc = 0x54c7bb; continue; } // 54c78a: jne 0x54c7bb
        pc = 0x54c78c; continue;
      case 0x54c78c:
        R.edx = ((R.edx & 0xffffff00) | (((((R.eax >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 54c78c: mov dl, al
        R.push(0x54c8d0); // 54c78e: push 0x54c8d0
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) | ((R.ebx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 54c793: or dl, bl
        R.m.w16(((0xae2410) | 0) >>> 0, 0x28); // 54c795: mov word ptr [0xae2410], 0x28
        R.m.w8(((0xae2430) | 0) >>> 0, ((R.edx >>> 0) & 0xff)); // 54c79e: mov byte ptr [0xae2430], dl
        R.m.w16(((0xae2412) | 0) >>> 0, 0x7b4); // 54c7a4: mov word ptr [0xae2412], 0x7b4
        R.m.w32(((0xae2414) | 0) >>> 0, (R.ebx >>> 0)); // 54c7ad: mov dword ptr [0xae2414], ebx
        R.call(0x94627a, { n: 1, thisEcx: false, calleeClean: false }); // 54c7b3: call 0x94627a
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 54c7b8: add esp, 4
        pc = 0x54c7bb; continue;
      case 0x54c7bb:
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u8(((R.esp + 0x18) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 54c7bb: movzx ax, byte ptr [esp + 0x18]
        R.push((R.ebp >>> 0)); // 54c7c1: push ebp
        R.ebp = ((R.ebp & 0xffff0000) | (((R.m.u16(((R.edi + 0x2) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 54c7c2: mov bp, word ptr [edi + 2]
        R.esi = (((R.eax * 8) | 0)) | 0; // 54c7c6: lea esi, [eax*8]
        R.m.w16(((0xae2412) | 0) >>> 0, ((R.ebp >>> 0) & 0xffff)); // 54c7cd: mov word ptr [0xae2412], bp
        R.esi = (R.sub((R.esi >>> 0), (R.eax >>> 0), 32)) | 0; // 54c7d4: sub esi, eax
        R.esi = ((R.esi & 0xffff0000) | (((R.add(((R.esi >>> 0) & 0xffff), R.m.u16(((R.edi) | 0) >>> 0), 16)) & 0xffff) << 0)) | 0; // 54c7d6: add si, word ptr [edi]
        R.m.w16(((0xae2410) | 0) >>> 0, ((R.esi >>> 0) & 0xffff)); // 54c7d9: mov word ptr [0xae2410], si
        pc = 0x54c7e0; continue;
      case 0x54c7e0:
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 54c7e0: xor ecx, ecx
        R.ecx = ((R.ecx & 0xffff0000) | (((((R.ebp >>> 0) & 0xffff)) & 0xffff) << 0)) | 0; // 54c7e2: mov cx, bp
        R.eax = ((R.ecx >>> 0)) | 0; // 54c7e5: mov eax, ecx
        R.eax = (R.logic((R.eax >>> 0) & 0x80000001, 32)) | 0; // 54c7e7: and eax, 0x80000001
        if (!R.sf) { pc = 0x54c7f3; continue; } // 54c7ec: jns 0x54c7f3
        pc = 0x54c7ee; continue;
      case 0x54c7ee:
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 54c7ee: dec eax
        R.eax = (R.logic((R.eax >>> 0) | 0xfffffffe, 32)) | 0; // 54c7ef: or eax, 0xfffffffe
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 54c7f2: inc eax
        pc = 0x54c7f3; continue;
      case 0x54c7f3:
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 54c7f3: cmp eax, ebx
        if (R.zf) { pc = 0x54c834; continue; } // 54c7f5: je 0x54c834
        pc = 0x54c7f7; continue;
      case 0x54c7f7:
        R.edx = ((R.ecx >>> 0)) | 0; // 54c7f7: mov edx, ecx
        R.edx = (R.logic((R.edx >>> 0) & 0x80000003, 32)) | 0; // 54c7f9: and edx, 0x80000003
        if (!R.sf) { pc = 0x54c806; continue; } // 54c7ff: jns 0x54c806
        pc = 0x54c801; continue;
      case 0x54c801:
        R.edx = (R.incdec((R.edx >>> 0), -1, 32)) | 0; // 54c801: dec edx
        R.edx = (R.logic((R.edx >>> 0) | 0xfffffffc, 32)) | 0; // 54c802: or edx, 0xfffffffc
        R.edx = (R.incdec((R.edx >>> 0), 1, 32)) | 0; // 54c805: inc edx
        pc = 0x54c806; continue;
      case 0x54c806:
        if (!R.zf) { pc = 0x54c834; continue; } // 54c806: jne 0x54c834
        pc = 0x54c808; continue;
      case 0x54c808:
        R.eax = ((R.ecx >>> 0)) | 0; // 54c808: mov eax, ecx
        R.edi = (0x64) | 0; // 54c80a: mov edi, 0x64
        R.edx = R.eax < 0 ? -1 : 0; // 54c80f: cdq 
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.edi >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 54c810: idiv edi
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 54c812: test edx, edx
        if (!R.zf) { pc = 0x54c824; continue; } // 54c814: jne 0x54c824
        pc = 0x54c816; continue;
      case 0x54c816:
        R.eax = ((R.ecx >>> 0)) | 0; // 54c816: mov eax, ecx
        R.ecx = (0x190) | 0; // 54c818: mov ecx, 0x190
        R.edx = R.eax < 0 ? -1 : 0; // 54c81d: cdq 
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.ecx >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 54c81e: idiv ecx
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 54c820: test edx, edx
        if (!R.zf) { pc = 0x54c834; continue; } // 54c822: jne 0x54c834
        pc = 0x54c824; continue;
      case 0x54c824:
        R.sub(((R.esi >>> 0) & 0xffff), 0x16d, 16); // 54c824: cmp si, 0x16d
        if (R.cLE) { pc = 0x54c844; continue; } // 54c829: jle 0x54c844
        pc = 0x54c82b; continue;
      case 0x54c82b:
        R.esi = ((R.esi & 0xffff0000) | (((R.add(((R.esi >>> 0) & 0xffff), 0xfe92, 16)) & 0xffff) << 0)) | 0; // 54c82b: add si, 0xfe92
        R.ebp = ((R.ebp & 0xffff0000) | (((R.incdec(((R.ebp >>> 0) & 0xffff), 1, 16)) & 0xffff) << 0)) | 0; // 54c830: inc bp
        pc = 0x54c7e0; continue; // 54c832: jmp 0x54c7e0
      case 0x54c834:
        R.sub(((R.esi >>> 0) & 0xffff), 0x16c, 16); // 54c834: cmp si, 0x16c
        if (R.cLE) { pc = 0x54c844; continue; } // 54c839: jle 0x54c844
        pc = 0x54c83b; continue;
      case 0x54c83b:
        R.esi = ((R.esi & 0xffff0000) | (((R.add(((R.esi >>> 0) & 0xffff), 0xfe93, 16)) & 0xffff) << 0)) | 0; // 54c83b: add si, 0xfe93
        R.ebp = ((R.ebp & 0xffff0000) | (((R.incdec(((R.ebp >>> 0) & 0xffff), 1, 16)) & 0xffff) << 0)) | 0; // 54c840: inc bp
        pc = 0x54c7e0; continue; // 54c842: jmp 0x54c7e0
      case 0x54c844:
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 54c844: xor ecx, ecx
        R.m.w16(((0xae2412) | 0) >>> 0, ((R.ebp >>> 0) & 0xffff)); // 54c846: mov word ptr [0xae2412], bp
        R.ecx = ((R.ecx & 0xffff0000) | (((((R.ebp >>> 0) & 0xffff)) & 0xffff) << 0)) | 0; // 54c84d: mov cx, bp
        R.m.w16(((0xae2410) | 0) >>> 0, ((R.esi >>> 0) & 0xffff)); // 54c850: mov word ptr [0xae2410], si
        R.edx = ((R.ecx >>> 0)) | 0; // 54c857: mov edx, ecx
        R.edx = (R.logic((R.edx >>> 0) & 0x80000001, 32)) | 0; // 54c859: and edx, 0x80000001
        if (!R.sf) { pc = 0x54c866; continue; } // 54c85f: jns 0x54c866
        pc = 0x54c861; continue;
      case 0x54c861:
        R.edx = (R.incdec((R.edx >>> 0), -1, 32)) | 0; // 54c861: dec edx
        R.edx = (R.logic((R.edx >>> 0) | 0xfffffffe, 32)) | 0; // 54c862: or edx, 0xfffffffe
        R.edx = (R.incdec((R.edx >>> 0), 1, 32)) | 0; // 54c865: inc edx
        pc = 0x54c866; continue;
      case 0x54c866:
        R.sub((R.edx >>> 0), (R.ebx >>> 0), 32); // 54c866: cmp edx, ebx
        R.ebp = (R.pop()) | 0; // 54c868: pop ebp
        if (R.zf) { pc = 0x54c89f; continue; } // 54c869: je 0x54c89f
        pc = 0x54c86b; continue;
      case 0x54c86b:
        R.eax = ((R.ecx >>> 0)) | 0; // 54c86b: mov eax, ecx
        R.eax = (R.logic((R.eax >>> 0) & 0x80000003, 32)) | 0; // 54c86d: and eax, 0x80000003
        if (!R.sf) { pc = 0x54c879; continue; } // 54c872: jns 0x54c879
        pc = 0x54c874; continue;
      case 0x54c874:
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 54c874: dec eax
        R.eax = (R.logic((R.eax >>> 0) | 0xfffffffc, 32)) | 0; // 54c875: or eax, 0xfffffffc
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 54c878: inc eax
        pc = 0x54c879; continue;
      case 0x54c879:
        if (!R.zf) { pc = 0x54c89f; continue; } // 54c879: jne 0x54c89f
        pc = 0x54c87b; continue;
      case 0x54c87b:
        R.eax = ((R.ecx >>> 0)) | 0; // 54c87b: mov eax, ecx
        R.esi = (0x64) | 0; // 54c87d: mov esi, 0x64
        R.edx = R.eax < 0 ? -1 : 0; // 54c882: cdq 
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.esi >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 54c883: idiv esi
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 54c885: test edx, edx
        if (!R.zf) { pc = 0x54c897; continue; } // 54c887: jne 0x54c897
        pc = 0x54c889; continue;
      case 0x54c889:
        R.eax = ((R.ecx >>> 0)) | 0; // 54c889: mov eax, ecx
        R.ecx = (0x190) | 0; // 54c88b: mov ecx, 0x190
        R.edx = R.eax < 0 ? -1 : 0; // 54c890: cdq 
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.ecx >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 54c891: idiv ecx
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 54c893: test edx, edx
        if (!R.zf) { pc = 0x54c89f; continue; } // 54c895: jne 0x54c89f
        pc = 0x54c897; continue;
      case 0x54c897:
        R.m.w32(((0xae2414) | 0) >>> 0, (R.ebx >>> 0)); // 54c897: mov dword ptr [0xae2414], ebx
        pc = 0x54c8a9; continue; // 54c89d: jmp 0x54c8a9
      case 0x54c89f:
        R.m.w32(((0xae2414) | 0) >>> 0, 0x0); // 54c89f: mov dword ptr [0xae2414], 0
        pc = 0x54c8a9; continue;
      case 0x54c8a9:
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 54c8a9: mov eax, dword ptr [esp + 0x14]
        R.edx = (R.m.u32(((0xae2410) | 0) >>> 0)) | 0; // 54c8ad: mov edx, dword ptr [0xae2410]
        R.edi = (R.pop()) | 0; // 54c8b3: pop edi
        R.esi = (R.pop()) | 0; // 54c8b4: pop esi
        R.m.w32(((R.eax) | 0) >>> 0, (R.edx >>> 0)); // 54c8b5: mov dword ptr [eax], edx
        R.ecx = (R.m.u32(((0xae2414) | 0) >>> 0)) | 0; // 54c8b7: mov ecx, dword ptr [0xae2414]
        R.m.w32(((R.eax + 0x4) | 0) >>> 0, (R.ecx >>> 0)); // 54c8bd: mov dword ptr [eax + 4], ecx
        R.ebx = (R.pop()) | 0; // 54c8c0: pop ebx
        R.ecx = (R.pop()) | 0; // 54c8c1: pop ecx
        return R.ret(2); // 54c8c2: ret 8
      default: throw new Error(`f_54c770: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
