// 0x85e590 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 417c10=2tc, 4cf5a0=1c, 549c90=1, 5e8290=9, 7c6830=4tc, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x85e590, 0x85e5b4, 0x85e61c, 0x85e6cf, 0x85e6d6, 0x85e6f1, 0x85e6f4, 0x85e703]);
const CH = new Uint8Array([0, 0, 1, 2, 2, 2, 2, 2]);
function f_85e590_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 85e590
        R.esp = (R.sub((R.esp >>> 0), 0x208, 32)) | 0; // 85e590: sub esp, 0x208
        R.push((R.ebx >>> 0)); // 85e596: push ebx
        R.push((R.ebp >>> 0)); // 85e597: push ebp
        R.ebp = (R.m.u32(((R.esp + 0x214) | 0) >>> 0)) | 0; // 85e598: mov ebp, dword ptr [esp + 0x214]
        R.push((R.esi >>> 0)); // 85e59f: push esi
        R.esi = ((R.ecx >>> 0)) | 0; // 85e5a0: mov esi, ecx
        R.push((R.ebp >>> 0)); // 85e5a2: push ebp
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 85e5a3: mov ecx, dword ptr [0xae1050]
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 85e5a9: call 0x4cf5a0
        R.ebx = (R.logic((R.ebx >>> 0) ^ (R.ebx >>> 0), 32)) | 0; // 85e5ae: xor ebx, ebx
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 85e5b0: cmp eax, ebx
        if (!R.zf) { pc = 2; continue; } // 85e5b2: jne 0x85e61c
        pc = 1; continue;
      case 1: // 85e5b4
        R.eax = (((R.esp + 0x14) | 0)) | 0; // 85e5b4: lea eax, [esp + 0x14]
        R.ecx = (((R.esp + 0x114) | 0)) | 0; // 85e5b8: lea ecx, [esp + 0x114]
        R.push((R.eax >>> 0)); // 85e5bf: push eax
        R.push((R.ecx >>> 0)); // 85e5c0: push ecx
        R.push((R.ebx >>> 0)); // 85e5c1: push ebx
        R.push((R.ebx >>> 0)); // 85e5c2: push ebx
        R.push(0xa8360c); // 85e5c3: push 0xa8360c
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 85e5c8: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 85e5cd: add esp, 0x14
        R.edx = (((R.esp + 0x14) | 0)) | 0; // 85e5d0: lea edx, [esp + 0x14]
        R.eax = (((R.esp + 0x114) | 0)) | 0; // 85e5d4: lea eax, [esp + 0x114]
        R.push(0xf5); // 85e5db: push 0xf5
        R.push((R.edx >>> 0)); // 85e5e0: push edx
        R.push((R.eax >>> 0)); // 85e5e1: push eax
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 85e5e2: call 0x90d130
        R.push((R.eax >>> 0)); // 85e5e7: push eax
        R.push(0x9870e8); // 85e5e8: push 0x9870e8
        R.push(0xae24d0); // 85e5ed: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 85e5f2: call 0x944c9f
        R.push((R.ebx >>> 0)); // 85e5f7: push ebx
        R.push(0xae24d0); // 85e5f8: push 0xae24d0
        R.push(0x9870e0); // 85e5fd: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 85e602: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 85e607: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, (R.ebx >>> 0)); // 85e60a: mov dword ptr [0xb67a34], ebx
        R.esi = (R.pop()) | 0; // 85e610: pop esi
        R.ebp = (R.pop()) | 0; // 85e611: pop ebp
        R.ebx = (R.pop()) | 0; // 85e612: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x208, 32)) | 0; // 85e613: add esp, 0x208
        R.rv = R.ret(6); return -1; // 85e619: ret 0x18
      default: return pc;
    }
  }
}
function f_85e590_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 2: // 85e61c
        R.ecx = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 85e61c: mov ecx, dword ptr [ebp]
        R.push((R.edi >>> 0)); // 85e61f: push edi
        R.edi = (R.m.u32(((R.esp + 0x220) | 0) >>> 0)) | 0; // 85e620: mov edi, dword ptr [esp + 0x220]
        R.m.w32(((R.esi) | 0) >>> 0, (R.ecx >>> 0)); // 85e627: mov dword ptr [esi], ecx
        R.push(0xae2c90); // 85e629: push 0xae2c90
        R.edx = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 85e62e: mov edx, dword ptr [edi]
        R.m.w32(((R.esi + 0x8) | 0) >>> 0, (R.ebx >>> 0)); // 85e630: mov dword ptr [esi + 8], ebx
        R.m.w32(((R.esi + 0x4) | 0) >>> 0, (R.edx >>> 0)); // 85e633: mov dword ptr [esi + 4], edx
        R.ecx = (R.m.u32(((R.eax + 0xc) | 0) >>> 0)) | 0; // 85e636: mov ecx, dword ptr [eax + 0xc]
        R.edx = (((R.m.u8(((R.esp + 0x22c) | 0) >>> 0)) << 24 >> 24)) | 0; // 85e639: movsx edx, byte ptr [esp + 0x22c]
        { const p = BigInt((((R.edx >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 85e641: imul ecx, edx
        R.eax = (0x51eb851f) | 0; // 85e644: mov eax, 0x51eb851f
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 85e649: imul ecx
        R.edx = (R.sar((R.edx >>> 0), 0x5, 32)) | 0; // 85e64b: sar edx, 5
        R.eax = ((R.edx >>> 0)) | 0; // 85e64e: mov eax, edx
        R.ecx = (((R.esp + 0x14) | 0)) | 0; // 85e650: lea ecx, [esp + 0x14]
        R.eax = (R.shr((R.eax >>> 0), 0x1f, 32)) | 0; // 85e654: shr eax, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 85e657: add edx, eax
        R.push((R.ecx >>> 0)); // 85e659: push ecx
        R.ecx = (((R.esi + 0x25) | 0)) | 0; // 85e65a: lea ecx, [esi + 0x25]
        R.m.w32(((R.esi + 0xc) | 0) >>> 0, (R.edx >>> 0)); // 85e65d: mov dword ptr [esi + 0xc], edx
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 85e660: call 0x417c10
        R.edx = (R.m.u32(((R.esp + 0x224) | 0) >>> 0)) | 0; // 85e665: mov edx, dword ptr [esp + 0x224]
        R.eax = (((R.esp + 0x10) | 0)) | 0; // 85e66c: lea eax, [esp + 0x10]
        R.push((R.edx >>> 0)); // 85e670: push edx
        R.push((R.eax >>> 0)); // 85e671: push eax
        R.ecx = (((R.esi + 0x2d) | 0)) | 0; // 85e672: lea ecx, [esi + 0x2d]
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 85e675: call 0x417c10
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esi + 0x35) | 0) >>> 0)) & 0xff) << 0)) | 0; // 85e67a: mov cl, byte ptr [esi + 0x35]
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 85e67d: mov eax, dword ptr [esi]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0xc6, 8)) & 0xff) << 0)) | 0; // 85e67f: and cl, 0xc6
        R.edx = (R.m.u32(((R.esi + 0xc) | 0) >>> 0)) | 0; // 85e682: mov edx, dword ptr [esi + 0xc]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) | 0x6, 8)) & 0xff) << 0)) | 0; // 85e685: or cl, 6
        R.m.w32(((R.esi + 0x36) | 0) >>> 0, (R.edx >>> 0)); // 85e688: mov dword ptr [esi + 0x36], edx
        R.m.w8(((R.esi + 0x35) | 0) >>> 0, ((R.ecx >>> 0) & 0xff)); // 85e68b: mov byte ptr [esi + 0x35], cl
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 85e68e: lea ecx, [eax + eax*4]
        R.m.w8(((R.esi + 0x3a) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 85e691: mov byte ptr [esi + 0x3a], bl
        R.m.w8(((R.esi + 0x49) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 85e694: mov byte ptr [esi + 0x49], bl
        R.eax = (((R.eax + R.ecx * 2) | 0)) | 0; // 85e697: lea eax, [eax + ecx*2]
        R.m.w32(((R.esi + 0x4a) | 0) >>> 0, 0xffffffff); // 85e69a: mov dword ptr [esi + 0x4a], 0xffffffff
        R.m.w8(((R.esi + 0x44) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 85e6a1: mov byte ptr [esi + 0x44], bl
        R.m.w8(((R.esi + 0x4e) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 85e6a4: mov byte ptr [esi + 0x4e], bl
        R.m.w32(((R.esi + 0x45) | 0) >>> 0, (R.ebx >>> 0)); // 85e6a7: mov dword ptr [esi + 0x45], ebx
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 85e6aa: lea edx, [eax + eax*4]
        R.eax = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 85e6ad: mov eax, dword ptr [0xae23bc]
        R.ecx = (((R.eax + R.edx * 2) | 0)) | 0; // 85e6b2: lea ecx, [eax + edx*2]
        R.push((R.ecx >>> 0)); // 85e6b5: push ecx
        R.call(0x549c90, { n: 1, thisEcx: false, calleeClean: false }); // 85e6b6: call 0x549c90
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 85e6bb: add esp, 4
        R.sub((R.edi >>> 0), (R.ebx >>> 0), 32); // 85e6be: cmp edi, ebx
        R.m.w32(((R.esi + 0x40) | 0) >>> 0, (R.ebx >>> 0)); // 85e6c0: mov dword ptr [esi + 0x40], ebx
        R.m.w8(((R.esi + 0x4e) | 0) >>> 0, 0x4); // 85e6c3: mov byte ptr [esi + 0x4e], 4
        R.m.w8(((R.esi + 0x3f) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 85e6c7: mov byte ptr [esi + 0x3f], bl
        R.m.w8(((R.esi + 0x3e) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 85e6ca: mov byte ptr [esi + 0x3e], bl
        if (R.zf) { pc = 7; continue; } // 85e6cd: je 0x85e703
        pc = 3; continue;
      default: return pc;
    }
  }
}
function f_85e590_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 3: // 85e6cf
        R.eax = (R.m.u32(((R.edi + 0x53) | 0) >>> 0)) | 0; // 85e6cf: mov eax, dword ptr [edi + 0x53]
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 85e6d2: cmp eax, ebx
        if (R.zf) { pc = 7; continue; } // 85e6d4: je 0x85e703
        pc = 4; continue;
      case 4: // 85e6d6
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x77) | 0) >>> 0)) & 0xff) << 0)) | 0; // 85e6d6: mov dl, byte ptr [eax + 0x77]
        R.ecx = (R.m.u32(((0xb74350) | 0) >>> 0)) | 0; // 85e6d9: mov ecx, dword ptr [0xb74350]
        R.push((R.ebx >>> 0)); // 85e6df: push ebx
        R.push((R.edx >>> 0)); // 85e6e0: push edx
        R.push((R.edi >>> 0)); // 85e6e1: push edi
        R.push((R.ebp >>> 0)); // 85e6e2: push ebp
        R.call(0x7c6830, { n: 4, thisEcx: true, calleeClean: true }); // 85e6e3: call 0x7c6830
        R.sub(((R.eax >>> 0) & 0xff), 0xa, 8); // 85e6e8: cmp al, 0xa
        R.ecx = (0xa) | 0; // 85e6ea: mov ecx, 0xa
        if (!R.cLE) { pc = 6; continue; } // 85e6ef: jg 0x85e6f4
        pc = 5; continue;
      case 5: // 85e6f1
        R.ecx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 85e6f1: movsx ecx, al
        pc = 6; continue;
      case 6: // 85e6f4
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 85e6f4: mov al, byte ptr [esi + 0x4f]
        R.edx = ((R.edx & 0xffffff00) | (((((R.eax >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 85e6f7: mov dl, al
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) ^ ((R.ecx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 85e6f9: xor dl, cl
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) & 0xf, 8)) & 0xff) << 0)) | 0; // 85e6fb: and dl, 0xf
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 85e6fe: xor dl, al
        R.m.w8(((R.esi + 0x4f) | 0) >>> 0, ((R.edx >>> 0) & 0xff)); // 85e700: mov byte ptr [esi + 0x4f], dl
        pc = 7; continue;
      case 7: // 85e703
        R.m.w16(((R.esi + 0x3b) | 0) >>> 0, ((R.ebx >>> 0) & 0xffff)); // 85e703: mov word ptr [esi + 0x3b], bx
        R.m.w8(((R.esi + 0x1c) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 85e707: mov byte ptr [esi + 0x1c], bl
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esp + 0x230) | 0) >>> 0)) & 0xff) << 0)) | 0; // 85e70a: mov cl, byte ptr [esp + 0x230]
        R.m.w8(((R.esi + 0x1d) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 85e711: mov byte ptr [esi + 0x1d], bl
        R.m.w8(((R.esi + 0x1e) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 85e714: mov byte ptr [esi + 0x1e], bl
        R.m.w8(((R.esi + 0x1f) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 85e717: mov byte ptr [esi + 0x1f], bl
        R.eax = (R.logic((R.eax >>> 0) | 0xffffffff, 32)) | 0; // 85e71a: or eax, 0xffffffff
        R.m.w8(((R.esi + 0x20) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 85e71d: mov byte ptr [esi + 0x20], bl
        R.m.w32(((R.esi + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 85e720: mov dword ptr [esi + 0x10], eax
        R.m.w32(((R.esi + 0x14) | 0) >>> 0, (R.eax >>> 0)); // 85e723: mov dword ptr [esi + 0x14], eax
        R.m.w32(((R.esi + 0x18) | 0) >>> 0, (R.eax >>> 0)); // 85e726: mov dword ptr [esi + 0x18], eax
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x22c) | 0) >>> 0)) & 0xff) << 0)) | 0; // 85e729: mov al, byte ptr [esp + 0x22c]
        R.m.w32(((R.esi + 0x21) | 0) >>> 0, (R.ebx >>> 0)); // 85e730: mov dword ptr [esi + 0x21], ebx
        R.m.w8(((R.esi + 0x1c) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 85e733: mov byte ptr [esi + 0x1c], al
        R.m.w8(((R.esi + 0x1d) | 0) >>> 0, ((R.ecx >>> 0) & 0xff)); // 85e736: mov byte ptr [esi + 0x1d], cl
        R.edi = (R.pop()) | 0; // 85e739: pop edi
        R.esi = (R.pop()) | 0; // 85e73a: pop esi
        R.ebp = (R.pop()) | 0; // 85e73b: pop ebp
        R.ebx = (R.pop()) | 0; // 85e73c: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x208, 32)) | 0; // 85e73d: add esp, 0x208
        R.rv = R.ret(6); return -1; // 85e743: ret 0x18
      default: return pc;
    }
  }
}
export function f_85e590(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 8) throw new Error(`f_85e590: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_85e590_0(R, pc); break;
      case 1: np = f_85e590_1(R, pc); break;
      case 2: np = f_85e590_2(R, pc); break;
      default: throw new Error(`f_85e590: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_85e590: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_85e590.shared = true;
