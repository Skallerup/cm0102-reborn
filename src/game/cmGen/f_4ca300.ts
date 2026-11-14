// 0x4ca300 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 5e8290=6, 66f4e0=0, 68d1b0=0t, 90d130=0, 944c9f=7, 944cff=5t, 945667=2t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x4ca300, 0x4ca323, 0x4ca337, 0x4ca345, 0x4ca34e, 0x4ca352, 0x4ca35a, 0x4ca37f, 0x4ca3a0, 0x4ca3ae, 0x4ca3c6]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2]);
function f_4ca300_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 4ca300
        R.esp = (R.sub((R.esp >>> 0), 0x208, 32)) | 0; // 4ca300: sub esp, 0x208
        R.push((R.ebx >>> 0)); // 4ca306: push ebx
        R.push((R.ebp >>> 0)); // 4ca307: push ebp
        R.push((R.esi >>> 0)); // 4ca308: push esi
        R.push((R.edi >>> 0)); // 4ca309: push edi
        R.edi = ((R.ecx >>> 0)) | 0; // 4ca30a: mov edi, ecx
        R.ebx = ((R.ebx & 0xffffff00) | (((R.logic(((R.ebx >>> 0) & 0xff) ^ ((R.ebx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 4ca30c: xor bl, bl
        R.ebp = (R.logic((R.ebp >>> 0) ^ (R.ebp >>> 0), 32)) | 0; // 4ca30e: xor ebp, ebp
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4ca310: mov dword ptr [esp + 0x14], edi
        R.eax = (R.m.u32(((R.edi + 0x34) | 0) >>> 0)) | 0; // 4ca314: mov eax, dword ptr [edi + 0x34]
        R.m.w8(((R.esp + 0x13) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 4ca317: mov byte ptr [esp + 0x13], bl
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4ca31b: test eax, eax
        if (R.zf) { pc = 9; continue; } // 4ca31d: je 0x4ca3ae
        pc = 1; continue;
      case 1: // 4ca323
        R.ecx = (R.m.u32(((R.eax + 0x2) | 0) >>> 0)) | 0; // 4ca323: mov ecx, dword ptr [eax + 2]
        R.m.w32(((R.eax + 0xa) | 0) >>> 0, (R.ecx >>> 0)); // 4ca326: mov dword ptr [eax + 0xa], ecx
        R.ecx = (R.m.u32(((R.edi + 0x34) | 0) >>> 0)) | 0; // 4ca329: mov ecx, dword ptr [edi + 0x34]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 4ca32c: call 0x68d1b0
        R.esi = ((R.eax >>> 0)) | 0; // 4ca331: mov esi, eax
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 4ca333: test esi, esi
        if (R.zf) { pc = 9; continue; } // 4ca335: je 0x4ca3ae
        pc = 2; continue;
      case 2: // 4ca337
        R.eax = (R.m.u32(((R.esp + 0x21c) | 0) >>> 0)) | 0; // 4ca337: mov eax, dword ptr [esp + 0x21c]
        R.edx = (R.m.u32(((R.esi + 0x4) | 0) >>> 0)) | 0; // 4ca33e: mov edx, dword ptr [esi + 4]
        R.sub((R.edx >>> 0), R.m.u32(((R.eax) | 0) >>> 0), 32); // 4ca341: cmp edx, dword ptr [eax]
        if (!R.zf) { pc = 8; continue; } // 4ca343: jne 0x4ca3a0
        pc = 3; continue;
      case 3: // 4ca345
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x35) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4ca345: mov al, byte ptr [esi + 0x35]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x3f, 8)) & 0xff) << 0)) | 0; // 4ca348: and al, 0x3f
        R.sub(((R.eax >>> 0) & 0xff), 0x5, 8); // 4ca34a: cmp al, 5
        if (R.zf) { pc = 8; continue; } // 4ca34c: je 0x4ca3a0
        pc = 4; continue;
      case 4: // 4ca34e
        R.sub(((R.eax >>> 0) & 0xff), 0x6, 8); // 4ca34e: cmp al, 6
        if (R.zf) { pc = 8; continue; } // 4ca350: je 0x4ca3a0
        pc = 5; continue;
      case 5: // 4ca352
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x13) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4ca352: mov al, byte ptr [esp + 0x13]
        R.sub(((R.eax >>> 0) & 0xff), ((R.ebx >>> 0) & 0xff), 8); // 4ca356: cmp al, bl
        if (!R.zf) { pc = 7; continue; } // 4ca358: jne 0x4ca37f
        pc = 6; continue;
      default: return pc;
    }
  }
}
function f_4ca300_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 6: // 4ca35a
        R.eax = ((R.eax & 0xffffff00) | (((R.add(((R.eax >>> 0) & 0xff), 0x14, 8)) & 0xff) << 0)) | 0; // 4ca35a: add al, 0x14
        R.m.w8(((R.esp + 0x13) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 4ca35c: mov byte ptr [esp + 0x13], al
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 4ca360: movsx eax, al
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 4ca363: lea ecx, [eax + eax*8]
        R.eax = (((R.eax + R.ecx * 4) | 0)) | 0; // 4ca366: lea eax, [eax + ecx*4]
        R.edx = (((R.eax + R.eax * 2) | 0)) | 0; // 4ca369: lea edx, [eax + eax*2]
        R.push((R.edx >>> 0)); // 4ca36c: push edx
        R.push((R.ebp >>> 0)); // 4ca36d: push ebp
        R.call(0x945667, { n: 2, thisEcx: true, calleeClean: false }); // 4ca36e: call 0x945667
        R.ebp = ((R.eax >>> 0)) | 0; // 4ca373: mov ebp, eax
        R.eax = (R.m.u32(((R.edi + 0x34) | 0) >>> 0)) | 0; // 4ca375: mov eax, dword ptr [edi + 0x34]
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 4ca378: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4ca37b: test eax, eax
        if (R.zf) { pc = 10; continue; } // 4ca37d: je 0x4ca3c6
        pc = 7; continue;
      case 7: // 4ca37f
        R.eax = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 4ca37f: movsx eax, bl
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 4ca382: lea ecx, [eax + eax*8]
        R.eax = (((R.eax + R.ecx * 4) | 0)) | 0; // 4ca385: lea eax, [eax + ecx*4]
        R.ecx = (0x1b) | 0; // 4ca388: mov ecx, 0x1b
        R.edx = (((R.ebp + R.eax * 2) | 0)) | 0; // 4ca38d: lea edx, [ebp + eax*2]
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 4ca391: add eax, edx
        R.ebx = ((R.ebx & 0xffffff00) | (((R.incdec(((R.ebx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 4ca393: inc bl
        R.edi = ((R.eax >>> 0)) | 0; // 4ca395: mov edi, eax
        R.str('rep movsd'); // 4ca397: rep movsd dword ptr es:[edi], dword ptr [esi]
        R.str('movsw'); // 4ca399: movsw word ptr es:[edi], word ptr [esi]
        R.str('movsb'); // 4ca39b: movsb byte ptr es:[edi], byte ptr [esi]
        R.edi = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 4ca39c: mov edi, dword ptr [esp + 0x14]
        pc = 8; continue;
      case 8: // 4ca3a0
        R.ecx = (R.m.u32(((R.edi + 0x34) | 0) >>> 0)) | 0; // 4ca3a0: mov ecx, dword ptr [edi + 0x34]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 4ca3a3: call 0x68d1b0
        R.esi = ((R.eax >>> 0)) | 0; // 4ca3a8: mov esi, eax
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 4ca3aa: test esi, esi
        if (!R.zf) { pc = 2; continue; } // 4ca3ac: jne 0x4ca337
        pc = 9; continue;
      case 9: // 4ca3ae
        R.edx = (R.m.u32(((R.esp + 0x220) | 0) >>> 0)) | 0; // 4ca3ae: mov edx, dword ptr [esp + 0x220]
        R.edi = (R.pop()) | 0; // 4ca3b5: pop edi
        R.esi = (R.pop()) | 0; // 4ca3b6: pop esi
        R.eax = ((R.eax & 0xffffff00) | (((((R.ebx >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 4ca3b7: mov al, bl
        R.m.w32(((R.edx) | 0) >>> 0, (R.ebp >>> 0)); // 4ca3b9: mov dword ptr [edx], ebp
        R.ebp = (R.pop()) | 0; // 4ca3bb: pop ebp
        R.ebx = (R.pop()) | 0; // 4ca3bc: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x208, 32)) | 0; // 4ca3bd: add esp, 0x208
        R.rv = R.ret(2); return -1; // 4ca3c3: ret 8
      default: return pc;
    }
  }
}
function f_4ca300_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 10: // 4ca3c6
        R.eax = (((R.esp + 0x18) | 0)) | 0; // 4ca3c6: lea eax, [esp + 0x18]
        R.ecx = (((R.esp + 0x118) | 0)) | 0; // 4ca3ca: lea ecx, [esp + 0x118]
        R.push((R.eax >>> 0)); // 4ca3d1: push eax
        R.push((R.ecx >>> 0)); // 4ca3d2: push ecx
        R.push(0x0); // 4ca3d3: push 0
        R.push(0x0); // 4ca3d5: push 0
        R.push(0x9a8190); // 4ca3d7: push 0x9a8190
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 4ca3dc: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 4ca3e1: add esp, 0x14
        R.edx = (((R.esp + 0x18) | 0)) | 0; // 4ca3e4: lea edx, [esp + 0x18]
        R.eax = (((R.esp + 0x118) | 0)) | 0; // 4ca3e8: lea eax, [esp + 0x118]
        R.push(0x9a8220); // 4ca3ef: push 0x9a8220
        R.push(0x64c); // 4ca3f4: push 0x64c
        R.push((R.edx >>> 0)); // 4ca3f9: push edx
        R.push((R.eax >>> 0)); // 4ca3fa: push eax
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 4ca3fb: call 0x90d130
        R.push((R.eax >>> 0)); // 4ca400: push eax
        R.push(0x9a8120); // 4ca401: push 0x9a8120
        R.push(0xae24d0); // 4ca406: push 0xae24d0
        R.call(0x944c9f, { n: 7, thisEcx: false, calleeClean: false }); // 4ca40b: call 0x944c9f
        R.esp = (R.add((R.esp >>> 0), 0x1c, 32)) | 0; // 4ca410: add esp, 0x1c
        R.push(0x9a8108); // 4ca413: push 0x9a8108
        R.push(0xae28bc); // 4ca418: push 0xae28bc
        R.call(0x66f4e0, { n: 2, thisEcx: false, calleeClean: false }); // 4ca41d: call 0x66f4e0
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 4ca422: add esp, 8
        R.push(0xae24d0); // 4ca425: push 0xae24d0
        R.push(0x9a7ff8); // 4ca42a: push 0x9a7ff8
        R.push(0xae26c4); // 4ca42f: push 0xae26c4
        R.call(0x66f4e0, { n: 0, thisEcx: false, calleeClean: false }); // 4ca434: call 0x66f4e0
        R.push(0x0); // 4ca439: push 0
        R.push(0xae26c4); // 4ca43b: push 0xae26c4
        R.push(0xae28bc); // 4ca440: push 0xae28bc
        R.call(0x5e8290, { n: 6, thisEcx: false, calleeClean: false }); // 4ca445: call 0x5e8290
        R.ecx = (R.m.u32(((R.esp + 0x238) | 0) >>> 0)) | 0; // 4ca44a: mov ecx, dword ptr [esp + 0x238]
        R.esp = (R.add((R.esp >>> 0), 0x18, 32)) | 0; // 4ca451: add esp, 0x18
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 4ca454: xor al, al
        R.edi = (R.pop()) | 0; // 4ca456: pop edi
        R.esi = (R.pop()) | 0; // 4ca457: pop esi
        R.ebp = (R.pop()) | 0; // 4ca458: pop ebp
        R.m.w32(((R.ecx) | 0) >>> 0, 0x0); // 4ca459: mov dword ptr [ecx], 0
        R.ebx = (R.pop()) | 0; // 4ca45f: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x208, 32)) | 0; // 4ca460: add esp, 0x208
        R.rv = R.ret(2); return -1; // 4ca466: ret 8
      default: return pc;
    }
  }
}
export function f_4ca300(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 11) throw new Error(`f_4ca300: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_4ca300_0(R, pc); break;
      case 1: np = f_4ca300_1(R, pc); break;
      case 2: np = f_4ca300_2(R, pc); break;
      default: throw new Error(`f_4ca300: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_4ca300: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_4ca300.shared = true;
