// 0x54cc30 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 54cc30=3tc, 94627a=1
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x54cc30, 0x54cc5f, 0x54cc93, 0x54cca1, 0x54cca7, 0x54ccb3, 0x54cccf, 0x54ccdc, 0x54ccee, 0x54ccfd, 0x54cd02, 0x54cd07, 0x54cd10, 0x54cd15, 0x54cd17, 0x54cd25, 0x54cd33, 0x54cd49, 0x54cd4e, 0x54cd5d, 0x54cd65, 0x54cd81]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2]);
function f_54cc30_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 54cc30
        R.push(0xffffffff); // 54cc30: push -1
        R.push(0x957a58); // 54cc32: push 0x957a58
        R.eax = (0) | 0; // 54cc37: mov eax, dword ptr fs:[0]
        R.push((R.eax >>> 0)); // 54cc3d: push eax
        /* fs */ // 54cc3e: mov dword ptr fs:[0], esp
        R.push((R.ecx >>> 0)); // 54cc45: push ecx
        R.push((R.ebx >>> 0)); // 54cc46: push ebx
        R.push((R.ebp >>> 0)); // 54cc47: push ebp
        R.ebp = (R.logic((R.ebp >>> 0) ^ (R.ebp >>> 0), 32)) | 0; // 54cc48: xor ebp, ebp
        R.push((R.esi >>> 0)); // 54cc4a: push esi
        R.push((R.edi >>> 0)); // 54cc4b: push edi
        R.esi = ((R.ecx >>> 0)) | 0; // 54cc4c: mov esi, ecx
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ebp >>> 0)); // 54cc4e: mov dword ptr [esp + 0x10], ebp
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((0xae249d) | 0) >>> 0)) & 0xff) << 0)) | 0; // 54cc52: mov al, byte ptr [0xae249d]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ebp >>> 0)); // 54cc57: mov dword ptr [esp + 0x1c], ebp
        R.logic(((R.eax >>> 0) & 0xff) & 0x1, 8); // 54cc5b: test al, 1
        if (!R.zf) { pc = 2; continue; } // 54cc5d: jne 0x54cc93
        pc = 1; continue;
      case 1: // 54cc5f
        R.edx = ((R.edx & 0xffffff00) | (((((R.eax >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 54cc5f: mov dl, al
        R.push(0x54cda0); // 54cc61: push 0x54cda0
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) | 0x1, 8)) & 0xff) << 0)) | 0; // 54cc66: or dl, 1
        R.m.w16(((0xae2428) | 0) >>> 0, 0x28); // 54cc69: mov word ptr [0xae2428], 0x28
        R.m.w8(((0xae249d) | 0) >>> 0, ((R.edx >>> 0) & 0xff)); // 54cc72: mov byte ptr [0xae249d], dl
        R.m.w16(((0xae242a) | 0) >>> 0, 0x7b4); // 54cc78: mov word ptr [0xae242a], 0x7b4
        R.m.w32(((0xae242c) | 0) >>> 0, 0x1); // 54cc81: mov dword ptr [0xae242c], 1
        R.call(0x94627a, { n: 1, thisEcx: false, calleeClean: false }); // 54cc8b: call 0x94627a
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 54cc90: add esp, 4
        pc = 2; continue;
      case 2: // 54cc93
        R.edi = ((R.edi & 0xffff0000) | (((R.m.u16(((R.esi + 0x2) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 54cc93: mov di, word ptr [esi + 2]
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.esp + 0x2a) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 54cc97: mov dx, word ptr [esp + 0x2a]
        R.sub(((R.edx >>> 0) & 0xffff), ((R.edi >>> 0) & 0xffff), 16); // 54cc9c: cmp dx, di
        if (!R.cBE) { pc = 5; continue; } // 54cc9f: ja 0x54ccb3
        pc = 3; continue;
      case 3: // 54cca1
        R.ebx = (R.m.u32(((R.esp + 0x28) | 0) >>> 0)) | 0; // 54cca1: mov ebx, dword ptr [esp + 0x28]
        if (R.cf) { pc = 6; continue; } // 54cca5: jb 0x54cccf
        pc = 4; continue;
      case 4: // 54cca7
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 54cca7: xor eax, eax
        R.sub(((R.ebx >>> 0) & 0xffff), R.m.u16(((R.esi) | 0) >>> 0), 16); // 54cca9: cmp bx, word ptr [esi]
        R.eax = ((R.eax & 0xffffff00) | (((!R.cLE ? 1 : 0) & 0xff) << 0)) | 0; // 54ccac: setg al
        R.sub((R.eax >>> 0), (R.ebp >>> 0), 32); // 54ccaf: cmp eax, ebp
        if (R.zf) { pc = 6; continue; } // 54ccb1: je 0x54cccf
        pc = 5; continue;
      case 5: // 54ccb3
        R.eax = (R.m.u32(((R.esi + 0x4) | 0) >>> 0)) | 0; // 54ccb3: mov eax, dword ptr [esi + 4]
        R.ecx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 54ccb6: mov ecx, dword ptr [esi]
        R.esi = (R.m.u32(((R.esp + 0x24) | 0) >>> 0)) | 0; // 54ccb8: mov esi, dword ptr [esp + 0x24]
        R.push((R.eax >>> 0)); // 54ccbc: push eax
        R.push((R.ecx >>> 0)); // 54ccbd: push ecx
        R.push((R.esi >>> 0)); // 54ccbe: push esi
        R.ecx = (((R.esp + 0x34) | 0)) | 0; // 54ccbf: lea ecx, [esp + 0x34]
        R.call(0x54cc30, { n: 3, thisEcx: true, calleeClean: true }); // 54ccc3: call 0x54cc30
        R.eax = ((R.esi >>> 0)) | 0; // 54ccc8: mov eax, esi
        pc = 21; continue; // 54ccca: jmp 0x54cd81
      default: return pc;
    }
  }
}
function f_54cc30_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 6: // 54cccf
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.esi) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 54cccf: mov cx, word ptr [esi]
        R.eax = (((((R.ecx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 54ccd2: movsx eax, cx
        R.ebp = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 54ccd5: movsx ebp, bx
        R.eax = (R.sub((R.eax >>> 0), (R.ebp >>> 0), 32)) | 0; // 54ccd8: sub eax, ebp
        if (R.sf) { pc = 8; continue; } // 54ccda: js 0x54ccee
        pc = 7; continue;
      case 7: // 54ccdc
        R.ecx = (R.sub((R.ecx >>> 0), (R.ebx >>> 0), 32)) | 0; // 54ccdc: sub ecx, ebx
        R.m.w16(((0xae2428) | 0) >>> 0, ((R.ecx >>> 0) & 0xffff)); // 54ccde: mov word ptr [0xae2428], cx
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.esi + 0x2) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 54cce5: mov cx, word ptr [esi + 2]
        R.ecx = ((R.ecx & 0xffff0000) | (((R.sub(((R.ecx >>> 0) & 0xffff), ((R.edx >>> 0) & 0xffff), 16)) & 0xffff) << 0)) | 0; // 54cce9: sub cx, dx
        pc = 20; continue; // 54ccec: jmp 0x54cd65
      case 8: // 54ccee
        R.edi = (R.logic((R.edi >>> 0) & 0xffff, 32)) | 0; // 54ccee: and edi, 0xffff
        R.eax = ((R.edi >>> 0)) | 0; // 54ccf4: mov eax, edi
        R.eax = (R.logic((R.eax >>> 0) & 0x80000001, 32)) | 0; // 54ccf6: and eax, 0x80000001
        if (!R.sf) { pc = 10; continue; } // 54ccfb: jns 0x54cd02
        pc = 9; continue;
      case 9: // 54ccfd
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 54ccfd: dec eax
        R.eax = (R.logic((R.eax >>> 0) | 0xfffffffe, 32)) | 0; // 54ccfe: or eax, 0xfffffffe
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 54cd01: inc eax
        pc = 10; continue;
      case 10: // 54cd02
        R.sub((R.eax >>> 0), 0x1, 32); // 54cd02: cmp eax, 1
        if (R.zf) { pc = 18; continue; } // 54cd05: je 0x54cd4e
        pc = 11; continue;
      case 11: // 54cd07
        R.eax = ((R.edi >>> 0)) | 0; // 54cd07: mov eax, edi
        R.eax = (R.logic((R.eax >>> 0) & 0x80000003, 32)) | 0; // 54cd09: and eax, 0x80000003
        if (!R.sf) { pc = 13; continue; } // 54cd0e: jns 0x54cd15
        pc = 12; continue;
      case 12: // 54cd10
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 54cd10: dec eax
        R.eax = (R.logic((R.eax >>> 0) | 0xfffffffc, 32)) | 0; // 54cd11: or eax, 0xfffffffc
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 54cd14: inc eax
        pc = 13; continue;
      case 13: // 54cd15
        if (!R.zf) { pc = 18; continue; } // 54cd15: jne 0x54cd4e
        pc = 14; continue;
      case 14: // 54cd17
        R.eax = ((R.edi >>> 0)) | 0; // 54cd17: mov eax, edi
        R.ebp = (0x64) | 0; // 54cd19: mov ebp, 0x64
        R.edx = R.eax < 0 ? -1 : 0; // 54cd1e: cdq 
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.ebp >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 54cd1f: idiv ebp
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 54cd21: test edx, edx
        if (!R.zf) { pc = 16; continue; } // 54cd23: jne 0x54cd33
        pc = 15; continue;
      case 15: // 54cd25
        R.eax = ((R.edi >>> 0)) | 0; // 54cd25: mov eax, edi
        R.edi = (0x190) | 0; // 54cd27: mov edi, 0x190
        R.edx = R.eax < 0 ? -1 : 0; // 54cd2c: cdq 
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.edi >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 54cd2d: idiv edi
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 54cd2f: test edx, edx
        if (!R.zf) { pc = 17; continue; } // 54cd31: jne 0x54cd49
        pc = 16; continue;
      default: return pc;
    }
  }
}
function f_54cc30_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 16: // 54cd33
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.esp + 0x2a) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 54cd33: mov dx, word ptr [esp + 0x2a]
        R.ecx = (R.sub((R.ecx >>> 0), (R.ebx >>> 0), 32)) | 0; // 54cd38: sub ecx, ebx
        R.ecx = (R.add((R.ecx >>> 0), 0x16e, 32)) | 0; // 54cd3a: add ecx, 0x16e
        R.m.w16(((0xae2428) | 0) >>> 0, ((R.ecx >>> 0) & 0xffff)); // 54cd40: mov word ptr [0xae2428], cx
        pc = 19; continue; // 54cd47: jmp 0x54cd5d
      case 17: // 54cd49
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.esp + 0x2a) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 54cd49: mov dx, word ptr [esp + 0x2a]
        pc = 18; continue;
      case 18: // 54cd4e
        R.ecx = (R.sub((R.ecx >>> 0), (R.ebx >>> 0), 32)) | 0; // 54cd4e: sub ecx, ebx
        R.ecx = (R.add((R.ecx >>> 0), 0x16d, 32)) | 0; // 54cd50: add ecx, 0x16d
        R.m.w16(((0xae2428) | 0) >>> 0, ((R.ecx >>> 0) & 0xffff)); // 54cd56: mov word ptr [0xae2428], cx
        pc = 19; continue;
      case 19: // 54cd5d
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.esi + 0x2) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 54cd5d: mov cx, word ptr [esi + 2]
        R.ecx = ((R.ecx & 0xffff0000) | (((R.sub(((R.ecx >>> 0) & 0xffff), ((R.edx >>> 0) & 0xffff), 16)) & 0xffff) << 0)) | 0; // 54cd61: sub cx, dx
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 54cd64: dec ecx
        pc = 20; continue;
      case 20: // 54cd65
        R.eax = (R.m.u32(((R.esp + 0x24) | 0) >>> 0)) | 0; // 54cd65: mov eax, dword ptr [esp + 0x24]
        R.m.w16(((0xae242a) | 0) >>> 0, ((R.ecx >>> 0) & 0xffff)); // 54cd69: mov word ptr [0xae242a], cx
        R.edx = (R.m.u32(((0xae2428) | 0) >>> 0)) | 0; // 54cd70: mov edx, dword ptr [0xae2428]
        R.m.w32(((R.eax) | 0) >>> 0, (R.edx >>> 0)); // 54cd76: mov dword ptr [eax], edx
        R.ecx = (R.m.u32(((0xae242c) | 0) >>> 0)) | 0; // 54cd78: mov ecx, dword ptr [0xae242c]
        R.m.w32(((R.eax + 0x4) | 0) >>> 0, (R.ecx >>> 0)); // 54cd7e: mov dword ptr [eax + 4], ecx
        pc = 21; continue;
      case 21: // 54cd81
        R.ecx = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 54cd81: mov ecx, dword ptr [esp + 0x14]
        R.edi = (R.pop()) | 0; // 54cd85: pop edi
        R.esi = (R.pop()) | 0; // 54cd86: pop esi
        R.ebp = (R.pop()) | 0; // 54cd87: pop ebp
        R.ebx = (R.pop()) | 0; // 54cd88: pop ebx
        /* fs */ // 54cd89: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 54cd90: add esp, 0x10
        R.rv = R.ret(3); return -1; // 54cd93: ret 0xc
      default: return pc;
    }
  }
}
export function f_54cc30(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 22) throw new Error(`f_54cc30: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_54cc30_0(R, pc); break;
      case 1: np = f_54cc30_1(R, pc); break;
      case 2: np = f_54cc30_2(R, pc); break;
      default: throw new Error(`f_54cc30: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_54cc30: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_54cc30.shared = true;
