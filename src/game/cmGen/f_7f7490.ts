// 0x7f7490 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 5e8290=9, 7af600=1tc, 7f6cd0=2c, 804540=1tc, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x7f7490, 0x7f74a3, 0x7f74d1, 0x7f7504, 0x7f7512, 0x7f751d, 0x7f7534, 0x7f7567, 0x7f7575, 0x7f7579, 0x7f7584, 0x7f7596, 0x7f759c, 0x7f75ad, 0x7f75b3, 0x7f75be, 0x7f75cc]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2]);
function f_7f7490_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 7f7490
        R.edx = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 7f7490: mov edx, dword ptr [esp + 4]
        R.esp = (R.sub((R.esp >>> 0), 0x204, 32)) | 0; // 7f7494: sub esp, 0x204
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 7f749a: test edx, edx
        R.push((R.ebx >>> 0)); // 7f749c: push ebx
        R.push((R.esi >>> 0)); // 7f749d: push esi
        R.push((R.edi >>> 0)); // 7f749e: push edi
        R.edi = ((R.ecx >>> 0)) | 0; // 7f749f: mov edi, ecx
        if (!R.zf) { pc = 4; continue; } // 7f74a1: jne 0x7f7512
        pc = 1; continue;
      case 1: // 7f74a3
        R.eax = (((R.esp + 0x10) | 0)) | 0; // 7f74a3: lea eax, [esp + 0x10]
        R.ecx = (((R.esp + 0x110) | 0)) | 0; // 7f74a7: lea ecx, [esp + 0x110]
        R.push((R.eax >>> 0)); // 7f74ae: push eax
        R.push((R.ecx >>> 0)); // 7f74af: push ecx
        R.push((R.edx >>> 0)); // 7f74b0: push edx
        R.push((R.edx >>> 0)); // 7f74b1: push edx
        R.push(0xa7b094); // 7f74b2: push 0xa7b094
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 7f74b7: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 7f74bc: add esp, 0x14
        R.edx = (((R.esp + 0x10) | 0)) | 0; // 7f74bf: lea edx, [esp + 0x10]
        R.eax = (((R.esp + 0x110) | 0)) | 0; // 7f74c3: lea eax, [esp + 0x110]
        R.push(0x231); // 7f74ca: push 0x231
        R.push((R.edx >>> 0)); // 7f74cf: push edx
        R.push((R.eax >>> 0)); // 7f74d0: push eax
        pc = 2; continue;
      case 2: // 7f74d1
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 7f74d1: call 0x90d130
        R.push((R.eax >>> 0)); // 7f74d6: push eax
        R.push(0x9870e8); // 7f74d7: push 0x9870e8
        R.push(0xae24d0); // 7f74dc: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 7f74e1: call 0x944c9f
        R.push(0x0); // 7f74e6: push 0
        R.push(0xae24d0); // 7f74e8: push 0xae24d0
        R.push(0x9870e0); // 7f74ed: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 7f74f2: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 7f74f7: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 7f74fa: mov dword ptr [0xb67a34], 0
        pc = 3; continue;
      case 3: // 7f7504
        R.edi = (R.pop()) | 0; // 7f7504: pop edi
        R.esi = (R.pop()) | 0; // 7f7505: pop esi
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 7f7506: xor eax, eax
        R.ebx = (R.pop()) | 0; // 7f7508: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x204, 32)) | 0; // 7f7509: add esp, 0x204
        R.rv = R.ret(2); return -1; // 7f750f: ret 8
      case 4: // 7f7512
        R.esi = (R.m.u32(((R.esp + 0x218) | 0) >>> 0)) | 0; // 7f7512: mov esi, dword ptr [esp + 0x218]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 7f7519: test esi, esi
        if (!R.zf) { pc = 7; continue; } // 7f751b: jne 0x7f7567
        pc = 5; continue;
      case 5: // 7f751d
        R.eax = (((R.m.u16(((0xb77c7a) | 0) >>> 0)) << 16 >> 16)) | 0; // 7f751d: movsx eax, word ptr [0xb77c7a]
        R.ecx = (((R.eax + R.eax * 2) | 0)) | 0; // 7f7524: lea ecx, [eax + eax*2]
        R.ecx = (R.shl((R.ecx >>> 0), 0x8, 32)) | 0; // 7f7527: shl ecx, 8
        R.esi = (R.m.u32(((R.ecx + 0xb74c26) | 0) >>> 0)) | 0; // 7f752a: mov esi, dword ptr [ecx + 0xb74c26]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 7f7530: test esi, esi
        if (!R.zf) { pc = 7; continue; } // 7f7532: jne 0x7f7567
        pc = 6; continue;
      default: return pc;
    }
  }
}
function f_7f7490_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 6: // 7f7534
        R.edx = (((R.esp + 0x110) | 0)) | 0; // 7f7534: lea edx, [esp + 0x110]
        R.eax = (((R.esp + 0x10) | 0)) | 0; // 7f753b: lea eax, [esp + 0x10]
        R.push((R.edx >>> 0)); // 7f753f: push edx
        R.push((R.eax >>> 0)); // 7f7540: push eax
        R.push((R.esi >>> 0)); // 7f7541: push esi
        R.push((R.esi >>> 0)); // 7f7542: push esi
        R.push(0xa7b094); // 7f7543: push 0xa7b094
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 7f7548: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 7f754d: add esp, 0x14
        R.ecx = (((R.esp + 0x110) | 0)) | 0; // 7f7550: lea ecx, [esp + 0x110]
        R.edx = (((R.esp + 0x10) | 0)) | 0; // 7f7557: lea edx, [esp + 0x10]
        R.push(0x23b); // 7f755b: push 0x23b
        R.push((R.ecx >>> 0)); // 7f7560: push ecx
        R.push((R.edx >>> 0)); // 7f7561: push edx
        pc = 2; continue; // 7f7562: jmp 0x7f74d1
      case 7: // 7f7567
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi) | 0) >>> 0)) & 0xff) << 0)) | 0; // 7f7567: mov al, byte ptr [esi]
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((0xae2364) | 0) >>> 0)) & 0xff) << 0)) | 0; // 7f7569: mov bl, byte ptr [0xae2364]
        R.eax = ((R.eax & 0xffffff00) | (((R.sub(((R.eax >>> 0) & 0xff), ((R.ebx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 7f756f: sub al, bl
        R.eax = ((R.eax & 0xffffff00) | (((R.add(((R.eax >>> 0) & 0xff), 0x10, 8)) & 0xff) << 0)) | 0; // 7f7571: add al, 0x10
        if (R.sf) { pc = 3; continue; } // 7f7573: js 0x7f7504
        pc = 8; continue;
      case 8: // 7f7575
        R.sub(((R.eax >>> 0) & 0xff), 0xf, 8); // 7f7575: cmp al, 0xf
        if (!R.cLE) { pc = 3; continue; } // 7f7577: jg 0x7f7504
        pc = 9; continue;
      case 9: // 7f7579
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 7f7579: movsx eax, al
        R.ecx = (R.m.u32(((R.edi + R.eax * 4 + 0xc) | 0) >>> 0)) | 0; // 7f757c: mov ecx, dword ptr [edi + eax*4 + 0xc]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 7f7580: test ecx, ecx
        if (R.zf) { pc = 11; continue; } // 7f7582: je 0x7f7596
        pc = 10; continue;
      case 10: // 7f7584
        R.push((R.edx >>> 0)); // 7f7584: push edx
        R.call(0x804540, { n: 1, thisEcx: true, calleeClean: true }); // 7f7585: call 0x804540
        R.edi = (R.pop()) | 0; // 7f758a: pop edi
        R.esi = (R.pop()) | 0; // 7f758b: pop esi
        R.ebx = (R.pop()) | 0; // 7f758c: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x204, 32)) | 0; // 7f758d: add esp, 0x204
        R.rv = R.ret(2); return -1; // 7f7593: ret 8
      case 11: // 7f7596
        R.ebx = ((R.ebx & 0xffffff00) | (((R.logic(((R.ebx >>> 0) & 0xff) ^ ((R.ebx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 7f7596: xor bl, bl
        R.m.w8(((R.esp + 0xc) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 7f7598: mov byte ptr [esp + 0xc], bl
        pc = 12; continue;
      case 12: // 7f759c
        R.ecx = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 7f759c: mov ecx, dword ptr [esp + 0xc]
        R.push((R.esi >>> 0)); // 7f75a0: push esi
        R.push((R.ecx >>> 0)); // 7f75a1: push ecx
        R.ecx = ((R.edi >>> 0)) | 0; // 7f75a2: mov ecx, edi
        R.call(0x7f6cd0, { n: 2, thisEcx: false, calleeClean: true }); // 7f75a4: call 0x7f6cd0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 7f75a9: test eax, eax
        if (R.zf) { pc = 14; continue; } // 7f75ab: je 0x7f75b3
        pc = 13; continue;
      case 13: // 7f75ad
        R.sub(R.m.u8(((R.eax + 0xa) | 0) >>> 0), 0x1, 8); // 7f75ad: cmp byte ptr [eax + 0xa], 1
        if (R.zf) { pc = 16; continue; } // 7f75b1: je 0x7f75cc
        pc = 14; continue;
      default: return pc;
    }
  }
}
function f_7f7490_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 14: // 7f75b3
        R.ebx = ((R.ebx & 0xffffff00) | (((R.incdec(((R.ebx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 7f75b3: inc bl
        R.sub(((R.ebx >>> 0) & 0xff), 0xa, 8); // 7f75b5: cmp bl, 0xa
        R.m.w8(((R.esp + 0xc) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 7f75b8: mov byte ptr [esp + 0xc], bl
        if (R.cL) { pc = 12; continue; } // 7f75bc: jl 0x7f759c
        pc = 15; continue;
      case 15: // 7f75be
        R.edi = (R.pop()) | 0; // 7f75be: pop edi
        R.esi = (R.pop()) | 0; // 7f75bf: pop esi
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 7f75c0: xor eax, eax
        R.ebx = (R.pop()) | 0; // 7f75c2: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x204, 32)) | 0; // 7f75c3: add esp, 0x204
        R.rv = R.ret(2); return -1; // 7f75c9: ret 8
      case 16: // 7f75cc
        R.edx = (R.m.u32(((R.esp + 0x214) | 0) >>> 0)) | 0; // 7f75cc: mov edx, dword ptr [esp + 0x214]
        R.ecx = ((R.eax >>> 0)) | 0; // 7f75d3: mov ecx, eax
        R.push((R.edx >>> 0)); // 7f75d5: push edx
        R.call(0x7af600, { n: 1, thisEcx: true, calleeClean: true }); // 7f75d6: call 0x7af600
        R.edi = (R.pop()) | 0; // 7f75db: pop edi
        R.esi = (R.pop()) | 0; // 7f75dc: pop esi
        R.ebx = (R.pop()) | 0; // 7f75dd: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x204, 32)) | 0; // 7f75de: add esp, 0x204
        R.rv = R.ret(2); return -1; // 7f75e4: ret 8
      default: return pc;
    }
  }
}
export function f_7f7490(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 17) throw new Error(`f_7f7490: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_7f7490_0(R, pc); break;
      case 1: np = f_7f7490_1(R, pc); break;
      case 2: np = f_7f7490_2(R, pc); break;
      default: throw new Error(`f_7f7490: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_7f7490: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_7f7490.shared = true;
