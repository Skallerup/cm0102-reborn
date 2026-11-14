// 0x54cab0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 94627a=1
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_54cab0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x54cab0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x54cab0:
        R.push((R.ecx >>> 0)); // 54cab0: push ecx
        R.push((R.esi >>> 0)); // 54cab1: push esi
        R.esi = ((R.ecx >>> 0)) | 0; // 54cab2: mov esi, ecx
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((0xae24aa) | 0) >>> 0)) & 0xff) << 0)) | 0; // 54cab4: mov cl, byte ptr [0xae24aa]
        R.eax = (0x1) | 0; // 54caba: mov eax, 1
        R.logic(((R.eax >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 54cabf: test al, cl
        R.m.w32(((R.esp + 0x4) | 0) >>> 0, 0x0); // 54cac1: mov dword ptr [esp + 4], 0
        if (!R.zf) { pc = 0x54caf9; continue; } // 54cac9: jne 0x54caf9
        pc = 0x54cacb; continue;
      case 0x54cacb:
        R.edx = ((R.edx & 0xffffff00) | (((((R.ecx >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 54cacb: mov dl, cl
        R.push(0x54cc20); // 54cacd: push 0x54cc20
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) | ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 54cad2: or dl, al
        R.m.w16(((0xae24c8) | 0) >>> 0, 0x28); // 54cad4: mov word ptr [0xae24c8], 0x28
        R.m.w8(((0xae24aa) | 0) >>> 0, ((R.edx >>> 0) & 0xff)); // 54cadd: mov byte ptr [0xae24aa], dl
        R.m.w16(((0xae24ca) | 0) >>> 0, 0x7b4); // 54cae3: mov word ptr [0xae24ca], 0x7b4
        R.m.w32(((0xae24cc) | 0) >>> 0, (R.eax >>> 0)); // 54caec: mov dword ptr [0xae24cc], eax
        R.call(0x94627a, { n: 1, thisEcx: false, calleeClean: false }); // 54caf1: call 0x94627a
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 54caf6: add esp, 4
        pc = 0x54caf9; continue;
      case 0x54caf9:
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u8(((R.esp + 0x10) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 54caf9: movzx ax, byte ptr [esp + 0x10]
        R.push((R.ebx >>> 0)); // 54caff: push ebx
        R.push((R.ebp >>> 0)); // 54cb00: push ebp
        R.ebp = ((R.ebp & 0xffff0000) | (((R.m.u16(((R.esi + 0x2) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 54cb01: mov bp, word ptr [esi + 2]
        R.ecx = (((R.eax * 8) | 0)) | 0; // 54cb05: lea ecx, [eax*8]
        R.push((R.edi >>> 0)); // 54cb0c: push edi
        R.m.w16(((0xae24ca) | 0) >>> 0, ((R.ebp >>> 0) & 0xffff)); // 54cb0d: mov word ptr [0xae24ca], bp
        R.edi = ((R.edi & 0xffff0000) | (((R.m.u16(((R.esi) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 54cb14: mov di, word ptr [esi]
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 54cb17: sub ecx, eax
        R.edi = ((R.edi & 0xffff0000) | (((R.sub(((R.edi >>> 0) & 0xffff), ((R.ecx >>> 0) & 0xffff), 16)) & 0xffff) << 0)) | 0; // 54cb19: sub di, cx
        R.m.w16(((0xae24c8) | 0) >>> 0, ((R.edi >>> 0) & 0xffff)); // 54cb1c: mov word ptr [0xae24c8], di
        pc = 0x54cb23; continue;
      case 0x54cb23:
        R.esi = ((R.esi & 0xffff0000) | (((((R.ebp >>> 0) & 0xffff)) & 0xffff) << 0)) | 0; // 54cb23: mov si, bp
        R.esi = ((R.esi & 0xffff0000) | (((R.incdec(((R.esi >>> 0) & 0xffff), -1, 16)) & 0xffff) << 0)) | 0; // 54cb26: dec si
        R.ecx = ((R.esi >>> 0)) | 0; // 54cb28: mov ecx, esi
        R.ecx = (R.logic((R.ecx >>> 0) & 0xffff, 32)) | 0; // 54cb2a: and ecx, 0xffff
        R.edx = ((R.ecx >>> 0)) | 0; // 54cb30: mov edx, ecx
        R.edx = (R.logic((R.edx >>> 0) & 0x80000001, 32)) | 0; // 54cb32: and edx, 0x80000001
        if (!R.sf) { pc = 0x54cb3f; continue; } // 54cb38: jns 0x54cb3f
        pc = 0x54cb3a; continue;
      case 0x54cb3a:
        R.edx = (R.incdec((R.edx >>> 0), -1, 32)) | 0; // 54cb3a: dec edx
        R.edx = (R.logic((R.edx >>> 0) | 0xfffffffe, 32)) | 0; // 54cb3b: or edx, 0xfffffffe
        R.edx = (R.incdec((R.edx >>> 0), 1, 32)) | 0; // 54cb3e: inc edx
        pc = 0x54cb3f; continue;
      case 0x54cb3f:
        R.sub((R.edx >>> 0), 0x1, 32); // 54cb3f: cmp edx, 1
        if (R.zf) { pc = 0x54cb7f; continue; } // 54cb42: je 0x54cb7f
        pc = 0x54cb44; continue;
      case 0x54cb44:
        R.eax = ((R.ecx >>> 0)) | 0; // 54cb44: mov eax, ecx
        R.eax = (R.logic((R.eax >>> 0) & 0x80000003, 32)) | 0; // 54cb46: and eax, 0x80000003
        if (!R.sf) { pc = 0x54cb52; continue; } // 54cb4b: jns 0x54cb52
        pc = 0x54cb4d; continue;
      case 0x54cb4d:
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 54cb4d: dec eax
        R.eax = (R.logic((R.eax >>> 0) | 0xfffffffc, 32)) | 0; // 54cb4e: or eax, 0xfffffffc
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 54cb51: inc eax
        pc = 0x54cb52; continue;
      case 0x54cb52:
        if (!R.zf) { pc = 0x54cb7f; continue; } // 54cb52: jne 0x54cb7f
        pc = 0x54cb54; continue;
      case 0x54cb54:
        R.eax = ((R.ecx >>> 0)) | 0; // 54cb54: mov eax, ecx
        R.ebx = (0x64) | 0; // 54cb56: mov ebx, 0x64
        R.edx = R.eax < 0 ? -1 : 0; // 54cb5b: cdq 
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.ebx >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 54cb5c: idiv ebx
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 54cb5e: test edx, edx
        if (!R.zf) { pc = 0x54cb70; continue; } // 54cb60: jne 0x54cb70
        pc = 0x54cb62; continue;
      case 0x54cb62:
        R.eax = ((R.ecx >>> 0)) | 0; // 54cb62: mov eax, ecx
        R.ecx = (0x190) | 0; // 54cb64: mov ecx, 0x190
        R.edx = R.eax < 0 ? -1 : 0; // 54cb69: cdq 
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.ecx >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 54cb6a: idiv ecx
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 54cb6c: test edx, edx
        if (!R.zf) { pc = 0x54cb7f; continue; } // 54cb6e: jne 0x54cb7f
        pc = 0x54cb70; continue;
      case 0x54cb70:
        R.logic(((R.edi >>> 0) & 0xffff) & ((R.edi >>> 0) & 0xffff), 16); // 54cb70: test di, di
        if (!R.cL) { pc = 0x54cb8e; continue; } // 54cb73: jge 0x54cb8e
        pc = 0x54cb75; continue;
      case 0x54cb75:
        R.edi = ((R.edi & 0xffff0000) | (((R.add(((R.edi >>> 0) & 0xffff), 0x16e, 16)) & 0xffff) << 0)) | 0; // 54cb75: add di, 0x16e
        R.ebp = ((R.ebp & 0xffff0000) | (((((R.esi >>> 0) & 0xffff)) & 0xffff) << 0)) | 0; // 54cb7a: mov bp, si
        pc = 0x54cb23; continue; // 54cb7d: jmp 0x54cb23
      case 0x54cb7f:
        R.logic(((R.edi >>> 0) & 0xffff) & ((R.edi >>> 0) & 0xffff), 16); // 54cb7f: test di, di
        if (!R.cL) { pc = 0x54cb8e; continue; } // 54cb82: jge 0x54cb8e
        pc = 0x54cb84; continue;
      case 0x54cb84:
        R.edi = ((R.edi & 0xffff0000) | (((R.add(((R.edi >>> 0) & 0xffff), 0x16d, 16)) & 0xffff) << 0)) | 0; // 54cb84: add di, 0x16d
        R.ebp = ((R.ebp & 0xffff0000) | (((((R.esi >>> 0) & 0xffff)) & 0xffff) << 0)) | 0; // 54cb89: mov bp, si
        pc = 0x54cb23; continue; // 54cb8c: jmp 0x54cb23
      case 0x54cb8e:
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 54cb8e: xor ecx, ecx
        R.m.w16(((0xae24ca) | 0) >>> 0, ((R.ebp >>> 0) & 0xffff)); // 54cb90: mov word ptr [0xae24ca], bp
        R.ecx = ((R.ecx & 0xffff0000) | (((((R.ebp >>> 0) & 0xffff)) & 0xffff) << 0)) | 0; // 54cb97: mov cx, bp
        R.m.w16(((0xae24c8) | 0) >>> 0, ((R.edi >>> 0) & 0xffff)); // 54cb9a: mov word ptr [0xae24c8], di
        R.edx = ((R.ecx >>> 0)) | 0; // 54cba1: mov edx, ecx
        R.edx = (R.logic((R.edx >>> 0) & 0x80000001, 32)) | 0; // 54cba3: and edx, 0x80000001
        if (!R.sf) { pc = 0x54cbb0; continue; } // 54cba9: jns 0x54cbb0
        pc = 0x54cbab; continue;
      case 0x54cbab:
        R.edx = (R.incdec((R.edx >>> 0), -1, 32)) | 0; // 54cbab: dec edx
        R.edx = (R.logic((R.edx >>> 0) | 0xfffffffe, 32)) | 0; // 54cbac: or edx, 0xfffffffe
        R.edx = (R.incdec((R.edx >>> 0), 1, 32)) | 0; // 54cbaf: inc edx
        pc = 0x54cbb0; continue;
      case 0x54cbb0:
        R.edi = (R.pop()) | 0; // 54cbb0: pop edi
        R.ebp = (R.pop()) | 0; // 54cbb1: pop ebp
        R.sub((R.edx >>> 0), 0x1, 32); // 54cbb2: cmp edx, 1
        R.ebx = (R.pop()) | 0; // 54cbb5: pop ebx
        if (R.zf) { pc = 0x54cbf0; continue; } // 54cbb6: je 0x54cbf0
        pc = 0x54cbb8; continue;
      case 0x54cbb8:
        R.eax = ((R.ecx >>> 0)) | 0; // 54cbb8: mov eax, ecx
        R.eax = (R.logic((R.eax >>> 0) & 0x80000003, 32)) | 0; // 54cbba: and eax, 0x80000003
        if (!R.sf) { pc = 0x54cbc6; continue; } // 54cbbf: jns 0x54cbc6
        pc = 0x54cbc1; continue;
      case 0x54cbc1:
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 54cbc1: dec eax
        R.eax = (R.logic((R.eax >>> 0) | 0xfffffffc, 32)) | 0; // 54cbc2: or eax, 0xfffffffc
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 54cbc5: inc eax
        pc = 0x54cbc6; continue;
      case 0x54cbc6:
        if (!R.zf) { pc = 0x54cbf0; continue; } // 54cbc6: jne 0x54cbf0
        pc = 0x54cbc8; continue;
      case 0x54cbc8:
        R.eax = ((R.ecx >>> 0)) | 0; // 54cbc8: mov eax, ecx
        R.esi = (0x64) | 0; // 54cbca: mov esi, 0x64
        R.edx = R.eax < 0 ? -1 : 0; // 54cbcf: cdq 
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.esi >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 54cbd0: idiv esi
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 54cbd2: test edx, edx
        if (!R.zf) { pc = 0x54cbe4; continue; } // 54cbd4: jne 0x54cbe4
        pc = 0x54cbd6; continue;
      case 0x54cbd6:
        R.eax = ((R.ecx >>> 0)) | 0; // 54cbd6: mov eax, ecx
        R.ecx = (0x190) | 0; // 54cbd8: mov ecx, 0x190
        R.edx = R.eax < 0 ? -1 : 0; // 54cbdd: cdq 
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.ecx >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 54cbde: idiv ecx
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 54cbe0: test edx, edx
        if (!R.zf) { pc = 0x54cbf0; continue; } // 54cbe2: jne 0x54cbf0
        pc = 0x54cbe4; continue;
      case 0x54cbe4:
        R.m.w32(((0xae24cc) | 0) >>> 0, 0x1); // 54cbe4: mov dword ptr [0xae24cc], 1
        pc = 0x54cbfa; continue; // 54cbee: jmp 0x54cbfa
      case 0x54cbf0:
        R.m.w32(((0xae24cc) | 0) >>> 0, 0x0); // 54cbf0: mov dword ptr [0xae24cc], 0
        pc = 0x54cbfa; continue;
      case 0x54cbfa:
        R.eax = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 54cbfa: mov eax, dword ptr [esp + 0xc]
        R.edx = (R.m.u32(((0xae24c8) | 0) >>> 0)) | 0; // 54cbfe: mov edx, dword ptr [0xae24c8]
        R.esi = (R.pop()) | 0; // 54cc04: pop esi
        R.m.w32(((R.eax) | 0) >>> 0, (R.edx >>> 0)); // 54cc05: mov dword ptr [eax], edx
        R.ecx = (R.m.u32(((0xae24cc) | 0) >>> 0)) | 0; // 54cc07: mov ecx, dword ptr [0xae24cc]
        R.m.w32(((R.eax + 0x4) | 0) >>> 0, (R.ecx >>> 0)); // 54cc0d: mov dword ptr [eax + 4], ecx
        R.ecx = (R.pop()) | 0; // 54cc10: pop ecx
        return R.ret(2); // 54cc11: ret 8
      default: throw new Error(`f_54cab0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
