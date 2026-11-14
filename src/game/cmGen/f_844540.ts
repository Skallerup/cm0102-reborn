// 0x844540 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 54c8e0=2tc, 600a50=5, 8c5cf0=3tc
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x844540, 0x844567, 0x844577, 0x844580, 0x844589, 0x844591, 0x84459b, 0x8445b4, 0x8445e9, 0x8445eb, 0x8445f9, 0x844624, 0x844635, 0x844639, 0x84464b]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2]);
function f_844540_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 844540
        R.esp = (R.sub((R.esp >>> 0), 0x14, 32)) | 0; // 844540: sub esp, 0x14
        R.push((R.ebx >>> 0)); // 844543: push ebx
        R.ebx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 844544: mov ebx, dword ptr [esp + 0x1c]
        R.push((R.ebp >>> 0)); // 844548: push ebp
        R.push((R.esi >>> 0)); // 844549: push esi
        R.eax = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 84454a: mov eax, dword ptr [ebx]
        R.push((R.edi >>> 0)); // 84454c: push edi
        R.m.w8(((R.esp + 0x13) | 0) >>> 0, 0x0); // 84454d: mov byte ptr [esp + 0x13], 0
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0x28); // 844552: mov dword ptr [esp + 0x28], 0x28
        R.esi = (((R.eax + R.eax * 8) | 0)) | 0; // 84455a: lea esi, [eax + eax*8]
        R.eax = (R.m.u32(((R.ecx + 0xdc) | 0) >>> 0)) | 0; // 84455d: mov eax, dword ptr [ecx + 0xdc]
        R.esi = (R.add((R.esi >>> 0), (R.eax >>> 0), 32)) | 0; // 844563: add esi, eax
        R.ebp = (R.logic((R.ebp >>> 0) ^ (R.ebp >>> 0), 32)) | 0; // 844565: xor ebp, ebp
        pc = 1; continue;
      case 1: // 844567
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 844567: mov eax, dword ptr [esi]
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 844569: or ecx, 0xffffffff
        R.eax = (R.add((R.eax >>> 0), (R.ebp >>> 0), 32)) | 0; // 84456c: add eax, ebp
        R.sub(R.m.u32(((R.eax + 0xf) | 0) >>> 0), (R.ecx >>> 0), 32); // 84456e: cmp dword ptr [eax + 0xf], ecx
        if (R.cLE) { pc = 13; continue; } // 844571: jle 0x844639
        pc = 2; continue;
      case 2: // 844577
        R.sub(R.m.u32(((R.eax + 0x17) | 0) >>> 0), (R.ecx >>> 0), 32); // 844577: cmp dword ptr [eax + 0x17], ecx
        if (R.cLE) { pc = 13; continue; } // 84457a: jle 0x844639
        pc = 3; continue;
      case 3: // 844580
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esp + 0x2c) | 0) >>> 0)) & 0xff) << 0)) | 0; // 844580: mov cl, byte ptr [esp + 0x2c]
        R.sub(((R.ecx >>> 0) & 0xff), 0xff, 8); // 844584: cmp cl, 0xff
        if (R.zf) { pc = 5; continue; } // 844587: je 0x844591
        pc = 4; continue;
      case 4: // 844589
        R.sub(R.m.u8(((R.eax) | 0) >>> 0), ((R.ecx >>> 0) & 0xff), 8); // 844589: cmp byte ptr [eax], cl
        if (!R.zf) { pc = 13; continue; } // 84458b: jne 0x844639
        pc = 5; continue;
      case 5: // 844591
        R.sub(R.m.u8(((R.esi + 0x4) | 0) >>> 0), 0x2, 8); // 844591: cmp byte ptr [esi + 4], 2
        if (!R.zf) { pc = 12; continue; } // 844595: jne 0x844635
        pc = 6; continue;
      case 6: // 84459b
        R.push(0x0); // 84459b: push 0
        R.push(0x0); // 84459d: push 0
        R.push(0x1); // 84459f: push 1
        R.push(0x1); // 8445a1: push 1
        R.push((R.ebx >>> 0)); // 8445a3: push ebx
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 8445a4: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8445a9: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8445ac: test eax, eax
        if (R.zf) { pc = 12; continue; } // 8445ae: je 0x844635
        pc = 7; continue;
      default: return pc;
    }
  }
}
function f_844540_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 7: // 8445b4
        R.ecx = (((R.esp + 0x1c) | 0)) | 0; // 8445b4: lea ecx, [esp + 0x1c]
        R.push(0x14); // 8445b8: push 0x14
        R.push((R.ecx >>> 0)); // 8445ba: push ecx
        R.ecx = (0xae2c90) | 0; // 8445bb: mov ecx, 0xae2c90
        R.call(0x54c8e0, { n: 2, thisEcx: true, calleeClean: true }); // 8445c0: call 0x54c8e0
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8445c5: mov edx, dword ptr [eax]
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 8445c7: mov eax, dword ptr [eax + 4]
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.eax >>> 0)); // 8445ca: mov dword ptr [esp + 0x18], eax
        R.eax = (R.m.u32(((R.ebx + 0xcf) | 0) >>> 0)) | 0; // 8445ce: mov eax, dword ptr [ebx + 0xcf]
        R.eax = (R.add((R.eax >>> 0), 0x3e, 32)) | 0; // 8445d4: add eax, 0x3e
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edx >>> 0)); // 8445d7: mov dword ptr [esp + 0x14], edx
        R.edi = ((R.edi & 0xffff0000) | (((R.m.u16(((R.esp + 0x16) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8445db: mov di, word ptr [esp + 0x16]
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.eax + 0x2) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8445e0: mov cx, word ptr [eax + 2]
        R.sub(((R.edi >>> 0) & 0xffff), ((R.ecx >>> 0) & 0xffff), 16); // 8445e4: cmp di, cx
        if (!R.cBE) { pc = 10; continue; } // 8445e7: ja 0x8445f9
        pc = 8; continue;
      case 8: // 8445e9
        if (R.cf) { pc = 12; continue; } // 8445e9: jb 0x844635
        pc = 9; continue;
      case 9: // 8445eb
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 8445eb: xor ecx, ecx
        R.sub(((R.edx >>> 0) & 0xffff), R.m.u16(((R.eax) | 0) >>> 0), 16); // 8445ed: cmp dx, word ptr [eax]
        R.ecx = ((R.ecx & 0xffffff00) | (((!R.cLE ? 1 : 0) & 0xff) << 0)) | 0; // 8445f0: setg cl
        R.eax = ((R.ecx >>> 0)) | 0; // 8445f3: mov eax, ecx
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8445f5: test eax, eax
        if (R.zf) { pc = 12; continue; } // 8445f7: je 0x844635
        pc = 10; continue;
      case 10: // 8445f9
        R.edx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8445f9: mov edx, dword ptr [esi]
        R.push(0x0); // 8445fb: push 0
        R.push(0x0); // 8445fd: push 0
        R.eax = (R.m.u32(((R.edx + R.ebp + 0xf) | 0) >>> 0)) | 0; // 8445ff: mov eax, dword ptr [edx + ebp + 0xf]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 844603: lea ecx, [eax + eax*4]
        R.eax = (((R.eax + R.ecx * 2) | 0)) | 0; // 844606: lea eax, [eax + ecx*2]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 844609: lea edx, [eax + eax*4]
        R.eax = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 84460c: mov eax, dword ptr [0xae23bc]
        R.ecx = (((R.eax + R.edx * 2) | 0)) | 0; // 844611: lea ecx, [eax + edx*2]
        R.push((R.ecx >>> 0)); // 844614: push ecx
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 844615: mov ecx, dword ptr [0xde1f54]
        R.call(0x8c5cf0, { n: 3, thisEcx: true, calleeClean: true }); // 84461b: call 0x8c5cf0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 844620: test eax, eax
        if (!R.zf) { pc = 12; continue; } // 844622: jne 0x844635
        pc = 11; continue;
      case 11: // 844624
        R.edx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 844624: mov edx, dword ptr [esi]
        R.eax = (R.logic((R.eax >>> 0) | 0xffffffff, 32)) | 0; // 844626: or eax, 0xffffffff
        R.m.w32(((R.edx + R.ebp + 0xf) | 0) >>> 0, (R.eax >>> 0)); // 844629: mov dword ptr [edx + ebp + 0xf], eax
        R.ecx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 84462d: mov ecx, dword ptr [esi]
        R.m.w32(((R.ecx + R.ebp + 0x17) | 0) >>> 0, (R.eax >>> 0)); // 84462f: mov dword ptr [ecx + ebp + 0x17], eax
        pc = 13; continue; // 844633: jmp 0x844639
      case 12: // 844635
        R.m.w8(((R.esp + 0x13) | 0) >>> 0, R.incdec(R.m.u8(((R.esp + 0x13) | 0) >>> 0), 1, 8)); // 844635: inc byte ptr [esp + 0x13]
        pc = 13; continue;
      default: return pc;
    }
  }
}
function f_844540_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 13: // 844639
        R.eax = (R.m.u32(((R.esp + 0x28) | 0) >>> 0)) | 0; // 844639: mov eax, dword ptr [esp + 0x28]
        R.ebp = (R.add((R.ebp >>> 0), 0x25, 32)) | 0; // 84463d: add ebp, 0x25
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 844640: dec eax
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 844641: mov dword ptr [esp + 0x28], eax
        if (!R.zf) { pc = 1; continue; } // 844645: jne 0x844567
        pc = 14; continue;
      case 14: // 84464b
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x13) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84464b: mov al, byte ptr [esp + 0x13]
        R.edi = (R.pop()) | 0; // 84464f: pop edi
        R.esi = (R.pop()) | 0; // 844650: pop esi
        R.ebp = (R.pop()) | 0; // 844651: pop ebp
        R.ebx = (R.pop()) | 0; // 844652: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 844653: add esp, 0x14
        R.rv = R.ret(2); return -1; // 844656: ret 8
      default: return pc;
    }
  }
}
export function f_844540(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 15) throw new Error(`f_844540: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_844540_0(R, pc); break;
      case 1: np = f_844540_1(R, pc); break;
      case 2: np = f_844540_2(R, pc); break;
      default: throw new Error(`f_844540: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_844540: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_844540.shared = true;
