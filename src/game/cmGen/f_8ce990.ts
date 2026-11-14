// 0x8ce990 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4cca30=1tc, 53d7f0=1, 53d980=3, 68d020=0t, 68d040=0t, 68d1b0=0t, 8c5cf0=3tc, 8c5e40=2tc, 8c5fc0=2tc, 8cde70=2tc
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_8ce990(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x8ce990;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x8ce990:
        R.push(0xffffffff); // 8ce990: push -1
        R.push(0x963f78); // 8ce992: push 0x963f78
        R.eax = (0) | 0; // 8ce997: mov eax, dword ptr fs:[0]
        R.push((R.eax >>> 0)); // 8ce99d: push eax
        /* fs */ // 8ce99e: mov dword ptr fs:[0], esp
        R.esp = (R.sub((R.esp >>> 0), 0x10, 32)) | 0; // 8ce9a5: sub esp, 0x10
        R.push((R.ebx >>> 0)); // 8ce9a8: push ebx
        R.push((R.ebp >>> 0)); // 8ce9a9: push ebp
        R.push((R.esi >>> 0)); // 8ce9aa: push esi
        R.push((R.edi >>> 0)); // 8ce9ab: push edi
        R.edi = ((R.ecx >>> 0)) | 0; // 8ce9ac: mov edi, ecx
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 8ce9ae: lea ecx, [esp + 0x10]
        R.call(0x68d020, { n: 0, thisEcx: true, calleeClean: false }); // 8ce9b2: call 0x68d020
        R.ebx = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 8ce9b7: mov ebx, dword ptr [esp + 0x30]
        R.ebp = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 8ce9bb: mov ebp, dword ptr [esp + 0x34]
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0x0); // 8ce9bf: mov dword ptr [esp + 0x28], 0
        R.eax = (R.m.u32(((R.ebx + 0x1a) | 0) >>> 0)) | 0; // 8ce9c7: mov eax, dword ptr [ebx + 0x1a]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8ce9ca: test eax, eax
        if (R.zf) { pc = 0x8cea14; continue; } // 8ce9cc: je 0x8cea14
        pc = 0x8ce9ce; continue;
      case 0x8ce9ce:
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8ce9ce: mov ecx, dword ptr [eax]
        R.edx = (R.m.u32(((0x9cf458) | 0) >>> 0)) | 0; // 8ce9d0: mov edx, dword ptr [0x9cf458]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 8ce9d6: cmp ecx, edx
        if (!R.zf) { pc = 0x8cea14; continue; } // 8ce9d8: jne 0x8cea14
        pc = 0x8ce9da; continue;
      case 0x8ce9da:
        R.ecx = (R.m.u32(((R.ebx + 0x39) | 0) >>> 0)) | 0; // 8ce9da: mov ecx, dword ptr [ebx + 0x39]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 8ce9dd: test ecx, ecx
        if (R.zf) { pc = 0x8ce9e6; continue; } // 8ce9df: je 0x8ce9e6
        pc = 0x8ce9e1; continue;
      case 0x8ce9e1:
        R.sub(R.m.u32(((R.ecx + 0x53) | 0) >>> 0), (R.eax >>> 0), 32); // 8ce9e1: cmp dword ptr [ecx + 0x53], eax
        if (!R.zf) { pc = 0x8cea14; continue; } // 8ce9e4: jne 0x8cea14
        pc = 0x8ce9e6; continue;
      case 0x8ce9e6:
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 8ce9e6: test ebp, ebp
        if (R.zf) { pc = 0x8cea14; continue; } // 8ce9e8: je 0x8cea14
        pc = 0x8ce9ea; continue;
      case 0x8ce9ea:
        R.sub(R.m.u32(((R.ebp + 0x53) | 0) >>> 0), (R.eax >>> 0), 32); // 8ce9ea: cmp dword ptr [ebp + 0x53], eax
        if (R.zf) { pc = 0x8cea14; continue; } // 8ce9ed: je 0x8cea14
        pc = 0x8ce9ef; continue;
      case 0x8ce9ef:
        R.eax = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 8ce9ef: mov eax, dword ptr [esp + 0x38]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8ce9f3: test eax, eax
        if (R.zf) { pc = 0x8ce9fc; continue; } // 8ce9f5: je 0x8ce9fc
        pc = 0x8ce9f7; continue;
      case 0x8ce9f7:
        R.m.w16(((R.eax) | 0) >>> 0, 0x27); // 8ce9f7: mov word ptr [eax], 0x27
        pc = 0x8ce9fc; continue;
      case 0x8ce9fc:
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 8ce9fc: lea ecx, [esp + 0x10]
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0xffffffff); // 8cea00: mov dword ptr [esp + 0x28], 0xffffffff
        R.call(0x68d040, { n: 0, thisEcx: true, calleeClean: false }); // 8cea08: call 0x68d040
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8cea0d: xor eax, eax
        pc = 0x8ced28; continue; // 8cea0f: jmp 0x8ced28
      case 0x8cea14:
        R.eax = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 8cea14: mov eax, dword ptr [ebx]
        R.edx = (R.m.u32(((R.edi + 0x86e) | 0) >>> 0)) | 0; // 8cea16: mov edx, dword ptr [edi + 0x86e]
        R.logic(R.m.u8(((R.edx + R.eax * 8) | 0) >>> 0) & 0x40, 8); // 8cea1c: test byte ptr [edx + eax*8], 0x40
        if (R.zf) { pc = 0x8cea40; continue; } // 8cea20: je 0x8cea40
        pc = 0x8cea22; continue;
      case 0x8cea22:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8cea22: mov ecx, dword ptr [0xae1050]
        R.push((R.eax >>> 0)); // 8cea28: push eax
        R.call(0x4cca30, { n: 1, thisEcx: true, calleeClean: true }); // 8cea29: call 0x4cca30
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cea2e: test eax, eax
        if (!R.zf) { pc = 0x8cea88; continue; } // 8cea30: jne 0x8cea88
        pc = 0x8cea32; continue;
      case 0x8cea32:
        R.eax = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 8cea32: mov eax, dword ptr [ebx]
        R.ecx = (R.m.u32(((R.edi + 0x86e) | 0) >>> 0)) | 0; // 8cea34: mov ecx, dword ptr [edi + 0x86e]
        R.eax = (((R.ecx + R.eax * 8) | 0)) | 0; // 8cea3a: lea eax, [ecx + eax*8]
        R.m.w8(((R.eax) | 0) >>> 0, R.logic(R.m.u8(((R.eax) | 0) >>> 0) & 0xbf, 8)); // 8cea3d: and byte ptr [eax], 0xbf
        pc = 0x8cea40; continue;
      case 0x8cea40:
        R.eax = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 8cea40: mov eax, dword ptr [esp + 0x3c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cea44: test eax, eax
        if (!R.zf) { pc = 0x8ceaad; continue; } // 8cea46: jne 0x8ceaad
        pc = 0x8cea48; continue;
      case 0x8cea48:
        R.push(0x0); // 8cea48: push 0
        R.push((R.ebx >>> 0)); // 8cea4a: push ebx
        R.ecx = ((R.edi >>> 0)) | 0; // 8cea4b: mov ecx, edi
        R.call(0x8c5e40, { n: 2, thisEcx: true, calleeClean: true }); // 8cea4d: call 0x8c5e40
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cea52: test eax, eax
        if (!R.zf) { pc = 0x8cea63; continue; } // 8cea54: jne 0x8cea63
        pc = 0x8cea56; continue;
      case 0x8cea56:
        R.push((R.eax >>> 0)); // 8cea56: push eax
        R.push((R.ebx >>> 0)); // 8cea57: push ebx
        R.ecx = ((R.edi >>> 0)) | 0; // 8cea58: mov ecx, edi
        R.call(0x8c5fc0, { n: 2, thisEcx: true, calleeClean: true }); // 8cea5a: call 0x8c5fc0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cea5f: test eax, eax
        if (R.zf) { pc = 0x8ceaad; continue; } // 8cea61: je 0x8ceaad
        pc = 0x8cea63; continue;
      case 0x8cea63:
        R.eax = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 8cea63: mov eax, dword ptr [esp + 0x38]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cea67: test eax, eax
        if (R.zf) { pc = 0x8cea70; continue; } // 8cea69: je 0x8cea70
        pc = 0x8cea6b; continue;
      case 0x8cea6b:
        R.m.w16(((R.eax) | 0) >>> 0, 0x7); // 8cea6b: mov word ptr [eax], 7
        pc = 0x8cea70; continue;
      case 0x8cea70:
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 8cea70: lea ecx, [esp + 0x10]
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0xffffffff); // 8cea74: mov dword ptr [esp + 0x28], 0xffffffff
        R.call(0x68d040, { n: 0, thisEcx: true, calleeClean: false }); // 8cea7c: call 0x68d040
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8cea81: xor eax, eax
        pc = 0x8ced28; continue; // 8cea83: jmp 0x8ced28
      case 0x8cea88:
        R.eax = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 8cea88: mov eax, dword ptr [esp + 0x38]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cea8c: test eax, eax
        if (R.zf) { pc = 0x8cea95; continue; } // 8cea8e: je 0x8cea95
        pc = 0x8cea90; continue;
      case 0x8cea90:
        R.m.w16(((R.eax) | 0) >>> 0, 0x21); // 8cea90: mov word ptr [eax], 0x21
        pc = 0x8cea95; continue;
      case 0x8cea95:
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 8cea95: lea ecx, [esp + 0x10]
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0xffffffff); // 8cea99: mov dword ptr [esp + 0x28], 0xffffffff
        R.call(0x68d040, { n: 0, thisEcx: true, calleeClean: false }); // 8ceaa1: call 0x68d040
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8ceaa6: xor eax, eax
        pc = 0x8ced28; continue; // 8ceaa8: jmp 0x8ced28
      case 0x8ceaad:
        R.edx = (R.m.u32(((R.edi + 0x92e) | 0) >>> 0)) | 0; // 8ceaad: mov edx, dword ptr [edi + 0x92e]
        R.esi = (((R.edi + 0x92c) | 0)) | 0; // 8ceab3: lea esi, [edi + 0x92c]
        R.ecx = ((R.esi >>> 0)) | 0; // 8ceab9: mov ecx, esi
        R.m.w32(((R.esi + 0xa) | 0) >>> 0, (R.edx >>> 0)); // 8ceabb: mov dword ptr [esi + 0xa], edx
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8ceabe: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8ceac3: test eax, eax
        if (R.zf) { pc = 0x8ceada; continue; } // 8ceac5: je 0x8ceada
        pc = 0x8ceac7; continue;
      case 0x8ceac7:
        R.ecx = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 8ceac7: mov ecx, dword ptr [ebx]
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8ceac9: mov edx, dword ptr [eax]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 8ceacb: cmp ecx, edx
        if (R.zf) { pc = 0x8ceb20; continue; } // 8ceacd: je 0x8ceb20
        pc = 0x8ceacf; continue;
      case 0x8ceacf:
        R.ecx = ((R.esi >>> 0)) | 0; // 8ceacf: mov ecx, esi
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8cead1: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cead6: test eax, eax
        if (!R.zf) { pc = 0x8ceac7; continue; } // 8cead8: jne 0x8ceac7
        pc = 0x8ceada; continue;
      case 0x8ceada:
        R.push(0x0); // 8ceada: push 0
        R.push((R.ebx >>> 0)); // 8ceadc: push ebx
        R.ecx = ((R.edi >>> 0)) | 0; // 8ceadd: mov ecx, edi
        R.call(0x8cde70, { n: 2, thisEcx: true, calleeClean: true }); // 8ceadf: call 0x8cde70
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8ceae4: test eax, eax
        if (R.zf) { pc = 0x8ceb89; continue; } // 8ceae6: je 0x8ceb89
        pc = 0x8ceaec; continue;
      case 0x8ceaec:
        R.edx = (((R.esp + 0x10) | 0)) | 0; // 8ceaec: lea edx, [esp + 0x10]
        R.push(0x0); // 8ceaf0: push 0
        R.push((R.edx >>> 0)); // 8ceaf2: push edx
        R.push((R.ebx >>> 0)); // 8ceaf3: push ebx
        R.ecx = ((R.edi >>> 0)) | 0; // 8ceaf4: mov ecx, edi
        R.call(0x8c5cf0, { n: 3, thisEcx: true, calleeClean: true }); // 8ceaf6: call 0x8c5cf0
        R.eax = (R.m.u32(((R.esp + 0x12) | 0) >>> 0)) | 0; // 8ceafb: mov eax, dword ptr [esp + 0x12]
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 8ceaff: lea ecx, [esp + 0x10]
        R.m.w32(((R.esp + 0x1a) | 0) >>> 0, (R.eax >>> 0)); // 8ceb03: mov dword ptr [esp + 0x1a], eax
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8ceb07: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8ceb0c: test eax, eax
        if (R.zf) { pc = 0x8ceb89; continue; } // 8ceb0e: je 0x8ceb89
        pc = 0x8ceb10; continue;
      case 0x8ceb10:
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8ceb10: mov eax, dword ptr [eax]
        R.ecx = (R.m.u32(((R.edi + 0x4) | 0) >>> 0)) | 0; // 8ceb12: mov ecx, dword ptr [edi + 4]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 8ceb15: cmp eax, ecx
        if (!R.cL) { pc = 0x8ceb45; continue; } // 8ceb17: jge 0x8ceb45
        pc = 0x8ceb19; continue;
      case 0x8ceb19:
        R.ecx = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 8ceb19: mov ecx, dword ptr [edi]
        R.eax = (((R.ecx + R.eax * 4) | 0)) | 0; // 8ceb1b: lea eax, [ecx + eax*4]
        pc = 0x8ceb47; continue; // 8ceb1e: jmp 0x8ceb47
      case 0x8ceb20:
        R.eax = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 8ceb20: mov eax, dword ptr [esp + 0x38]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8ceb24: test eax, eax
        if (R.zf) { pc = 0x8ceb2d; continue; } // 8ceb26: je 0x8ceb2d
        pc = 0x8ceb28; continue;
      case 0x8ceb28:
        R.m.w16(((R.eax) | 0) >>> 0, 0x1); // 8ceb28: mov word ptr [eax], 1
        pc = 0x8ceb2d; continue;
      case 0x8ceb2d:
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 8ceb2d: lea ecx, [esp + 0x10]
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0xffffffff); // 8ceb31: mov dword ptr [esp + 0x28], 0xffffffff
        R.call(0x68d040, { n: 0, thisEcx: true, calleeClean: false }); // 8ceb39: call 0x68d040
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8ceb3e: xor eax, eax
        pc = 0x8ced28; continue; // 8ceb40: jmp 0x8ced28
      case 0x8ceb45:
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 8ceb45: mov eax, dword ptr [edi]
        pc = 0x8ceb47; continue;
      case 0x8ceb47:
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8ceb47: mov ecx, dword ptr [eax]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + 0x2c) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8ceb49: mov al, byte ptr [ecx + 0x2c]
        R.sub(((R.eax >>> 0) & 0xff), 0xa, 8); // 8ceb4c: cmp al, 0xa
        if (R.zf) { pc = 0x8cec28; continue; } // 8ceb4e: je 0x8cec28
        pc = 0x8ceb54; continue;
      case 0x8ceb54:
        R.sub(((R.eax >>> 0) & 0xff), 0xb, 8); // 8ceb54: cmp al, 0xb
        if (R.zf) { pc = 0x8cec28; continue; } // 8ceb56: je 0x8cec28
        pc = 0x8ceb5c; continue;
      case 0x8ceb5c:
        R.sub(((R.eax >>> 0) & 0xff), 0xc, 8); // 8ceb5c: cmp al, 0xc
        if (R.zf) { pc = 0x8cec28; continue; } // 8ceb5e: je 0x8cec28
        pc = 0x8ceb64; continue;
      case 0x8ceb64:
        R.sub(((R.eax >>> 0) & 0xff), 0xd, 8); // 8ceb64: cmp al, 0xd
        if (R.zf) { pc = 0x8cec28; continue; } // 8ceb66: je 0x8cec28
        pc = 0x8ceb6c; continue;
      case 0x8ceb6c:
        R.sub(((R.eax >>> 0) & 0xff), 0xe, 8); // 8ceb6c: cmp al, 0xe
        if (R.zf) { pc = 0x8cec28; continue; } // 8ceb6e: je 0x8cec28
        pc = 0x8ceb74; continue;
      case 0x8ceb74:
        R.sub(((R.eax >>> 0) & 0xff), 0x13, 8); // 8ceb74: cmp al, 0x13
        if (R.zf) { pc = 0x8cec03; continue; } // 8ceb76: je 0x8cec03
        pc = 0x8ceb7c; continue;
      case 0x8ceb7c:
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 8ceb7c: lea ecx, [esp + 0x10]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8ceb80: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8ceb85: test eax, eax
        if (!R.zf) { pc = 0x8ceb10; continue; } // 8ceb87: jne 0x8ceb10
        pc = 0x8ceb89; continue;
      case 0x8ceb89:
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 8ceb89: test ebp, ebp
        if (R.zf) { pc = 0x8ced05; continue; } // 8ceb8b: je 0x8ced05
        pc = 0x8ceb91; continue;
      case 0x8ceb91:
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 8ceb91: test ebx, ebx
        if (R.zf) { pc = 0x8ced05; continue; } // 8ceb93: je 0x8ced05
        pc = 0x8ceb99; continue;
      case 0x8ceb99:
        R.eax = (R.m.u32(((R.ebx + 0x61) | 0) >>> 0)) | 0; // 8ceb99: mov eax, dword ptr [ebx + 0x61]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8ceb9c: test eax, eax
        if (R.zf) { pc = 0x8ced05; continue; } // 8ceb9e: je 0x8ced05
        pc = 0x8ceba4; continue;
      case 0x8ceba4:
        R.push((R.ebp >>> 0)); // 8ceba4: push ebp
        R.call(0x53d7f0, { n: 1, thisEcx: false, calleeClean: false }); // 8ceba5: call 0x53d7f0
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8cebaa: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cebad: test eax, eax
        if (R.zf) { pc = 0x8cec51; continue; } // 8cebaf: je 0x8cec51
        pc = 0x8cebb5; continue;
      case 0x8cebb5:
        R.eax = (R.m.u32(((0x9cf424) | 0) >>> 0)) | 0; // 8cebb5: mov eax, dword ptr [0x9cf424]
        R.push(0x1); // 8cebba: push 1
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 8cebbc: lea edx, [eax + eax*8]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 8cebbf: shl edx, 4
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8cebc2: add edx, eax
        R.eax = (R.m.u32(((0xae23a8) | 0) >>> 0)) | 0; // 8cebc4: mov eax, dword ptr [0xae23a8]
        R.ecx = (((R.eax + R.edx * 2) | 0)) | 0; // 8cebc9: lea ecx, [eax + edx*2]
        R.push((R.ecx >>> 0)); // 8cebcc: push ecx
        R.push((R.ebx >>> 0)); // 8cebcd: push ebx
        R.call(0x53d980, { n: 3, thisEcx: false, calleeClean: false }); // 8cebce: call 0x53d980
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 8cebd3: add esp, 0xc
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cebd6: test eax, eax
        if (R.zf) { pc = 0x8ced05; continue; } // 8cebd8: je 0x8ced05
        pc = 0x8cebde; continue;
      case 0x8cebde:
        R.eax = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 8cebde: mov eax, dword ptr [esp + 0x38]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cebe2: test eax, eax
        if (R.zf) { pc = 0x8cebeb; continue; } // 8cebe4: je 0x8cebeb
        pc = 0x8cebe6; continue;
      case 0x8cebe6:
        R.m.w16(((R.eax) | 0) >>> 0, 0x19); // 8cebe6: mov word ptr [eax], 0x19
        pc = 0x8cebeb; continue;
      case 0x8cebeb:
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 8cebeb: lea ecx, [esp + 0x10]
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0xffffffff); // 8cebef: mov dword ptr [esp + 0x28], 0xffffffff
        R.call(0x68d040, { n: 0, thisEcx: true, calleeClean: false }); // 8cebf7: call 0x68d040
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8cebfc: xor eax, eax
        pc = 0x8ced28; continue; // 8cebfe: jmp 0x8ced28
      case 0x8cec03:
        R.eax = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 8cec03: mov eax, dword ptr [esp + 0x38]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cec07: test eax, eax
        if (R.zf) { pc = 0x8cec10; continue; } // 8cec09: je 0x8cec10
        pc = 0x8cec0b; continue;
      case 0x8cec0b:
        R.m.w16(((R.eax) | 0) >>> 0, 0x20); // 8cec0b: mov word ptr [eax], 0x20
        pc = 0x8cec10; continue;
      case 0x8cec10:
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 8cec10: lea ecx, [esp + 0x10]
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0xffffffff); // 8cec14: mov dword ptr [esp + 0x28], 0xffffffff
        R.call(0x68d040, { n: 0, thisEcx: true, calleeClean: false }); // 8cec1c: call 0x68d040
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8cec21: xor eax, eax
        pc = 0x8ced28; continue; // 8cec23: jmp 0x8ced28
      case 0x8cec28:
        R.eax = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 8cec28: mov eax, dword ptr [esp + 0x38]
        R.m.w8(((R.ecx + 0x2d) | 0) >>> 0, 0x1); // 8cec2c: mov byte ptr [ecx + 0x2d], 1
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cec30: test eax, eax
        if (R.zf) { pc = 0x8cec39; continue; } // 8cec32: je 0x8cec39
        pc = 0x8cec34; continue;
      case 0x8cec34:
        R.m.w16(((R.eax) | 0) >>> 0, 0x12); // 8cec34: mov word ptr [eax], 0x12
        pc = 0x8cec39; continue;
      case 0x8cec39:
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 8cec39: lea ecx, [esp + 0x10]
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0xffffffff); // 8cec3d: mov dword ptr [esp + 0x28], 0xffffffff
        R.call(0x68d040, { n: 0, thisEcx: true, calleeClean: false }); // 8cec45: call 0x68d040
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8cec4a: xor eax, eax
        pc = 0x8ced28; continue; // 8cec4c: jmp 0x8ced28
      case 0x8cec51:
        R.eax = (R.m.u32(((R.ebp + 0x53) | 0) >>> 0)) | 0; // 8cec51: mov eax, dword ptr [ebp + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cec54: test eax, eax
        if (R.zf) { pc = 0x8ceca9; continue; } // 8cec56: je 0x8ceca9
        pc = 0x8cec58; continue;
      case 0x8cec58:
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8cec58: mov edx, dword ptr [eax]
        R.ecx = (R.m.u32(((0x9cf4dc) | 0) >>> 0)) | 0; // 8cec5a: mov ecx, dword ptr [0x9cf4dc]
        R.sub((R.edx >>> 0), (R.ecx >>> 0), 32); // 8cec60: cmp edx, ecx
        if (!R.zf) { pc = 0x8ceca9; continue; } // 8cec62: jne 0x8ceca9
        pc = 0x8cec64; continue;
      case 0x8cec64:
        R.ecx = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 8cec64: mov ecx, dword ptr [ebp + 0x57]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 8cec67: test ecx, ecx
        if (R.zf) { pc = 0x8cec77; continue; } // 8cec69: je 0x8cec77
        pc = 0x8cec6b; continue;
      case 0x8cec6b:
        R.ecx = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 8cec6b: mov ecx, dword ptr [ecx]
        R.edx = (R.m.u32(((0x9cf8d8) | 0) >>> 0)) | 0; // 8cec6d: mov edx, dword ptr [0x9cf8d8]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 8cec73: cmp ecx, edx
        if (R.zf) { pc = 0x8ceca9; continue; } // 8cec75: je 0x8ceca9
        pc = 0x8cec77; continue;
      case 0x8cec77:
        R.push(0x1); // 8cec77: push 1
        R.push((R.eax >>> 0)); // 8cec79: push eax
        R.push((R.ebx >>> 0)); // 8cec7a: push ebx
        R.call(0x53d980, { n: 3, thisEcx: false, calleeClean: false }); // 8cec7b: call 0x53d980
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 8cec80: add esp, 0xc
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cec83: test eax, eax
        if (R.zf) { pc = 0x8ced05; continue; } // 8cec85: je 0x8ced05
        pc = 0x8cec87; continue;
      case 0x8cec87:
        R.eax = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 8cec87: mov eax, dword ptr [esp + 0x38]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cec8b: test eax, eax
        if (R.zf) { pc = 0x8cec94; continue; } // 8cec8d: je 0x8cec94
        pc = 0x8cec8f; continue;
      case 0x8cec8f:
        R.m.w16(((R.eax) | 0) >>> 0, 0x28); // 8cec8f: mov word ptr [eax], 0x28
        pc = 0x8cec94; continue;
      case 0x8cec94:
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 8cec94: lea ecx, [esp + 0x10]
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0xffffffff); // 8cec98: mov dword ptr [esp + 0x28], 0xffffffff
        R.call(0x68d040, { n: 0, thisEcx: true, calleeClean: false }); // 8ceca0: call 0x68d040
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8ceca5: xor eax, eax
        pc = 0x8ced28; continue; // 8ceca7: jmp 0x8ced28
      case 0x8ceca9:
        R.eax = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 8ceca9: mov eax, dword ptr [ebp]
        R.ecx = (R.m.u32(((0x9d0128) | 0) >>> 0)) | 0; // 8cecac: mov ecx, dword ptr [0x9d0128]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 8cecb2: cmp eax, ecx
        if (R.zf) { pc = 0x8cecbe; continue; } // 8cecb4: je 0x8cecbe
        pc = 0x8cecb6; continue;
      case 0x8cecb6:
        R.sub((R.eax >>> 0), R.m.u32(((0x9d01a0) | 0) >>> 0), 32); // 8cecb6: cmp eax, dword ptr [0x9d01a0]
        if (!R.zf) { pc = 0x8ced05; continue; } // 8cecbc: jne 0x8ced05
        pc = 0x8cecbe; continue;
      case 0x8cecbe:
        R.eax = (R.m.u32(((R.ebx + 0x1a) | 0) >>> 0)) | 0; // 8cecbe: mov eax, dword ptr [ebx + 0x1a]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cecc1: test eax, eax
        if (R.zf) { pc = 0x8cecd0; continue; } // 8cecc3: je 0x8cecd0
        pc = 0x8cecc5; continue;
      case 0x8cecc5:
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8cecc5: mov edx, dword ptr [eax]
        R.eax = (R.m.u32(((0x9cf488) | 0) >>> 0)) | 0; // 8cecc7: mov eax, dword ptr [0x9cf488]
        R.sub((R.edx >>> 0), (R.eax >>> 0), 32); // 8ceccc: cmp edx, eax
        if (!R.zf) { pc = 0x8ced05; continue; } // 8cecce: jne 0x8ced05
        pc = 0x8cecd0; continue;
      case 0x8cecd0:
        R.eax = (R.m.u32(((R.ebx + 0x1e) | 0) >>> 0)) | 0; // 8cecd0: mov eax, dword ptr [ebx + 0x1e]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cecd3: test eax, eax
        if (R.zf) { pc = 0x8cece3; continue; } // 8cecd5: je 0x8cece3
        pc = 0x8cecd7; continue;
      case 0x8cecd7:
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8cecd7: mov eax, dword ptr [eax]
        R.ecx = (R.m.u32(((0x9cf424) | 0) >>> 0)) | 0; // 8cecd9: mov ecx, dword ptr [0x9cf424]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 8cecdf: cmp eax, ecx
        if (R.zf) { pc = 0x8ced05; continue; } // 8cece1: je 0x8ced05
        pc = 0x8cece3; continue;
      case 0x8cece3:
        R.eax = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 8cece3: mov eax, dword ptr [esp + 0x38]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cece7: test eax, eax
        if (R.zf) { pc = 0x8cecf0; continue; } // 8cece9: je 0x8cecf0
        pc = 0x8ceceb; continue;
      case 0x8ceceb:
        R.m.w16(((R.eax) | 0) >>> 0, 0x1a); // 8ceceb: mov word ptr [eax], 0x1a
        pc = 0x8cecf0; continue;
      case 0x8cecf0:
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 8cecf0: lea ecx, [esp + 0x10]
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0xffffffff); // 8cecf4: mov dword ptr [esp + 0x28], 0xffffffff
        R.call(0x68d040, { n: 0, thisEcx: true, calleeClean: false }); // 8cecfc: call 0x68d040
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8ced01: xor eax, eax
        pc = 0x8ced28; continue; // 8ced03: jmp 0x8ced28
      case 0x8ced05:
        R.eax = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 8ced05: mov eax, dword ptr [esp + 0x38]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8ced09: test eax, eax
        if (R.zf) { pc = 0x8ced12; continue; } // 8ced0b: je 0x8ced12
        pc = 0x8ced0d; continue;
      case 0x8ced0d:
        R.m.w16(((R.eax) | 0) >>> 0, 0x0); // 8ced0d: mov word ptr [eax], 0
        pc = 0x8ced12; continue;
      case 0x8ced12:
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 8ced12: lea ecx, [esp + 0x10]
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0xffffffff); // 8ced16: mov dword ptr [esp + 0x28], 0xffffffff
        R.call(0x68d040, { n: 0, thisEcx: true, calleeClean: false }); // 8ced1e: call 0x68d040
        R.eax = (0x1) | 0; // 8ced23: mov eax, 1
        pc = 0x8ced28; continue;
      case 0x8ced28:
        R.ecx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 8ced28: mov ecx, dword ptr [esp + 0x20]
        R.edi = (R.pop()) | 0; // 8ced2c: pop edi
        R.esi = (R.pop()) | 0; // 8ced2d: pop esi
        R.ebp = (R.pop()) | 0; // 8ced2e: pop ebp
        R.ebx = (R.pop()) | 0; // 8ced2f: pop ebx
        /* fs */ // 8ced30: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x1c, 32)) | 0; // 8ced37: add esp, 0x1c
        return R.ret(4); // 8ced3a: ret 0x10
      default: throw new Error(`f_8ce990: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
