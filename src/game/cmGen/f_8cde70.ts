// 0x8cde70 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4cc9e0=2tc, 4cf5a0=1c, 600c90=3, 68d020=0t, 68d040=0t, 68d1b0=0t, 7f7490=2tc, 8c5cf0=3tc
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_8cde70(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x8cde70;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x8cde70:
        R.push(0xffffffff); // 8cde70: push -1
        R.push(0x963f58); // 8cde72: push 0x963f58
        R.eax = (0) | 0; // 8cde77: mov eax, dword ptr fs:[0]
        R.push((R.eax >>> 0)); // 8cde7d: push eax
        /* fs */ // 8cde7e: mov dword ptr fs:[0], esp
        R.esp = (R.sub((R.esp >>> 0), 0x10, 32)) | 0; // 8cde85: sub esp, 0x10
        R.push((R.ebx >>> 0)); // 8cde88: push ebx
        R.push((R.ebp >>> 0)); // 8cde89: push ebp
        R.ebx = ((R.ecx >>> 0)) | 0; // 8cde8a: mov ebx, ecx
        R.push((R.esi >>> 0)); // 8cde8c: push esi
        R.push((R.edi >>> 0)); // 8cde8d: push edi
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 8cde8e: lea ecx, [esp + 0x10]
        R.call(0x68d020, { n: 0, thisEcx: true, calleeClean: false }); // 8cde92: call 0x68d020
        R.edi = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 8cde97: mov edi, dword ptr [esp + 0x30]
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0x0); // 8cde9b: mov dword ptr [esp + 0x28], 0
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 8cdea3: test edi, edi
        if (R.zf) { pc = 0x8cdeb7; continue; } // 8cdea5: je 0x8cdeb7
        pc = 0x8cdea7; continue;
      case 0x8cdea7:
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 8cdea7: mov eax, dword ptr [edi]
        R.ecx = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 8cdea9: mov ecx, dword ptr [0xae2364]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 8cdeaf: cmp eax, ecx
        if (!R.cL) { pc = 0x8ce0b5; continue; } // 8cdeb1: jge 0x8ce0b5
        pc = 0x8cdeb7; continue;
      case 0x8cdeb7:
        R.eax = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 8cdeb7: mov eax, dword ptr [esp + 0x34]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cdebb: test eax, eax
        if (!R.zf) { pc = 0x8cdeec; continue; } // 8cdebd: jne 0x8cdeec
        pc = 0x8cdebf; continue;
      case 0x8cdebf:
        R.ecx = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 8cdebf: mov ecx, dword ptr [edi]
        R.edx = (R.m.u32(((R.ebx + 0x86e) | 0) >>> 0)) | 0; // 8cdec1: mov edx, dword ptr [ebx + 0x86e]
        R.logic(R.m.u8(((R.edx + R.ecx * 8) | 0) >>> 0) & 0x1, 8); // 8cdec7: test byte ptr [edx + ecx*8], 1
        if (R.zf) { pc = 0x8ce0b5; continue; } // 8cdecb: je 0x8ce0b5
        pc = 0x8cded1; continue;
      case 0x8cded1:
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 8cded1: lea ecx, [esp + 0x10]
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0xffffffff); // 8cded5: mov dword ptr [esp + 0x28], 0xffffffff
        R.call(0x68d040, { n: 0, thisEcx: true, calleeClean: false }); // 8cdedd: call 0x68d040
        R.eax = (0x1) | 0; // 8cdee2: mov eax, 1
        pc = 0x8ce0c8; continue; // 8cdee7: jmp 0x8ce0c8
      case 0x8cdeec:
        R.eax = (((R.m.u16(((0xb77c7a) | 0) >>> 0)) << 16 >> 16)) | 0; // 8cdeec: movsx eax, word ptr [0xb77c7a]
        R.eax = (((R.eax + R.eax * 2) | 0)) | 0; // 8cdef3: lea eax, [eax + eax*2]
        R.eax = (R.shl((R.eax >>> 0), 0x8, 32)) | 0; // 8cdef6: shl eax, 8
        R.eax = (R.m.u32(((R.eax + 0xb74c26) | 0) >>> 0)) | 0; // 8cdef9: mov eax, dword ptr [eax + 0xb74c26]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cdeff: test eax, eax
        if (!R.zf) { pc = 0x8cdf2b; continue; } // 8cdf01: jne 0x8cdf2b
        pc = 0x8cdf03; continue;
      case 0x8cdf03:
        R.ecx = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 8cdf03: mov ecx, dword ptr [edi]
        R.edx = (R.m.u32(((R.ebx + 0x86e) | 0) >>> 0)) | 0; // 8cdf05: mov edx, dword ptr [ebx + 0x86e]
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0xffffffff); // 8cdf0b: mov dword ptr [esp + 0x28], 0xffffffff
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edx + R.ecx * 8) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8cdf13: mov al, byte ptr [edx + ecx*8]
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 8cdf16: lea ecx, [esp + 0x10]
        R.eax = (R.logic((R.eax >>> 0) & 0x1, 32)) | 0; // 8cdf1a: and eax, 1
        R.esi = ((R.eax >>> 0)) | 0; // 8cdf1d: mov esi, eax
        R.call(0x68d040, { n: 0, thisEcx: true, calleeClean: false }); // 8cdf1f: call 0x68d040
        R.eax = ((R.esi >>> 0)) | 0; // 8cdf24: mov eax, esi
        pc = 0x8ce0c8; continue; // 8cdf26: jmp 0x8ce0c8
      case 0x8cdf2b:
        R.ecx = (R.m.u32(((0xb74448) | 0) >>> 0)) | 0; // 8cdf2b: mov ecx, dword ptr [0xb74448]
        R.push((R.eax >>> 0)); // 8cdf31: push eax
        R.push((R.edi >>> 0)); // 8cdf32: push edi
        R.call(0x7f7490, { n: 2, thisEcx: true, calleeClean: true }); // 8cdf33: call 0x7f7490
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 8cdf38: lea ecx, [esp + 0x10]
        R.push(0x0); // 8cdf3c: push 0
        R.push((R.ecx >>> 0)); // 8cdf3e: push ecx
        R.push((R.edi >>> 0)); // 8cdf3f: push edi
        R.ecx = ((R.ebx >>> 0)) | 0; // 8cdf40: mov ecx, ebx
        R.ebp = ((R.eax >>> 0)) | 0; // 8cdf42: mov ebp, eax
        R.call(0x8c5cf0, { n: 3, thisEcx: true, calleeClean: true }); // 8cdf44: call 0x8c5cf0
        R.edx = (R.m.u32(((R.esp + 0x12) | 0) >>> 0)) | 0; // 8cdf49: mov edx, dword ptr [esp + 0x12]
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 8cdf4d: lea ecx, [esp + 0x10]
        R.m.w32(((R.esp + 0x1a) | 0) >>> 0, (R.edx >>> 0)); // 8cdf51: mov dword ptr [esp + 0x1a], edx
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8cdf55: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cdf5a: test eax, eax
        if (R.zf) { pc = 0x8ce065; continue; } // 8cdf5c: je 0x8ce065
        pc = 0x8cdf62; continue;
      case 0x8cdf62:
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8cdf62: mov eax, dword ptr [eax]
        R.ecx = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 8cdf64: mov ecx, dword ptr [ebx]
        R.esi = (R.m.u32(((R.ecx + R.eax * 4) | 0) >>> 0)) | 0; // 8cdf66: mov esi, dword ptr [ecx + eax*4]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x2d) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8cdf69: mov al, byte ptr [esi + 0x2d]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 8cdf6c: test al, al
        if (!R.zf) { pc = 0x8ce09d; continue; } // 8cdf6e: jne 0x8ce09d
        pc = 0x8cdf74; continue;
      case 0x8cdf74:
        R.eax = (R.m.u32(((R.esi + 0x8) | 0) >>> 0)) | 0; // 8cdf74: mov eax, dword ptr [esi + 8]
        R.ecx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 8cdf77: mov ecx, dword ptr [0xae23b4]
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 8cdf7d: add ecx, eax
        R.push(0x1); // 8cdf7f: push 1
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 8cdf81: lea edx, [eax + eax*8]
        R.push(0x0); // 8cdf84: push 0
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 8cdf86: shl edx, 4
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8cdf89: add edx, eax
        R.edx = (((R.ecx + R.edx * 4) | 0)) | 0; // 8cdf8b: lea edx, [ecx + edx*4]
        R.push((R.edx >>> 0)); // 8cdf8e: push edx
        R.call(0x600c90, { n: 3, thisEcx: false, calleeClean: false }); // 8cdf8f: call 0x600c90
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 8cdf94: add esp, 0xc
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cdf97: test eax, eax
        if (!R.zf) { pc = 0x8ce09d; continue; } // 8cdf99: jne 0x8ce09d
        pc = 0x8cdf9f; continue;
      case 0x8cdf9f:
        R.eax = (R.m.u32(((R.esi + 0xc) | 0) >>> 0)) | 0; // 8cdf9f: mov eax, dword ptr [esi + 0xc]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 8cdfa2: lea ecx, [eax + eax*4]
        R.eax = (((R.eax + R.ecx * 2) | 0)) | 0; // 8cdfa5: lea eax, [eax + ecx*2]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 8cdfa8: lea edx, [eax + eax*4]
        R.eax = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 8cdfab: mov eax, dword ptr [0xae23bc]
        R.ecx = (((R.eax + R.edx * 2) | 0)) | 0; // 8cdfb0: lea ecx, [eax + edx*2]
        R.push((R.ecx >>> 0)); // 8cdfb3: push ecx
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8cdfb4: mov ecx, dword ptr [0xae1050]
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 8cdfba: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cdfbf: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 8cdfc1: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x8ce050; continue; } // 8cdfc6: je 0x8ce050
        pc = 0x8cdfcc; continue;
      case 0x8cdfcc:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x35) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8cdfcc: mov dl, byte ptr [eax + 0x35]
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) & 0x3f, 8)) & 0xff) << 0)) | 0; // 8cdfcf: and dl, 0x3f
        R.sub(((R.edx >>> 0) & 0xff), 0x5, 8); // 8cdfd2: cmp dl, 5
        if (R.zf) { pc = 0x8ce050; continue; } // 8cdfd5: je 0x8ce050
        pc = 0x8cdfd7; continue;
      case 0x8cdfd7:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 8cdfd7: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 8cdfda: mov edx, dword ptr [0xae23b4]
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8cdfe0: add edx, eax
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 8cdfe2: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 8cdfe5: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 8cdfe8: add ecx, eax
        R.eax = (((R.edx + R.ecx * 4) | 0)) | 0; // 8cdfea: lea eax, [edx + ecx*4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cdfed: test eax, eax
        if (R.zf) { pc = 0x8ce050; continue; } // 8cdfef: je 0x8ce050
        pc = 0x8cdff1; continue;
      case 0x8cdff1:
        R.eax = (R.m.u32(((R.esi + 0xc) | 0) >>> 0)) | 0; // 8cdff1: mov eax, dword ptr [esi + 0xc]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 8cdff4: lea ecx, [eax + eax*4]
        R.eax = (((R.eax + R.ecx * 2) | 0)) | 0; // 8cdff7: lea eax, [eax + ecx*2]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 8cdffa: lea edx, [eax + eax*4]
        R.eax = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 8cdffd: mov eax, dword ptr [0xae23bc]
        R.ecx = (((R.eax + R.edx * 2) | 0)) | 0; // 8ce002: lea ecx, [eax + edx*2]
        R.push((R.ecx >>> 0)); // 8ce005: push ecx
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8ce006: mov ecx, dword ptr [0xae1050]
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 8ce00c: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8ce011: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 8ce013: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x8ce03d; continue; } // 8ce018: je 0x8ce03d
        pc = 0x8ce01a; continue;
      case 0x8ce01a:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x35) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8ce01a: mov dl, byte ptr [eax + 0x35]
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) & 0x3f, 8)) & 0xff) << 0)) | 0; // 8ce01d: and dl, 0x3f
        R.sub(((R.edx >>> 0) & 0xff), 0x5, 8); // 8ce020: cmp dl, 5
        if (R.zf) { pc = 0x8ce03d; continue; } // 8ce023: je 0x8ce03d
        pc = 0x8ce025; continue;
      case 0x8ce025:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 8ce025: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 8ce028: mov edx, dword ptr [0xae23b4]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 8ce02e: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 8ce031: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 8ce034: add ecx, eax
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8ce036: add edx, eax
        R.eax = (((R.edx + R.ecx * 4) | 0)) | 0; // 8ce038: lea eax, [edx + ecx*4]
        pc = 0x8ce03f; continue; // 8ce03b: jmp 0x8ce03f
      case 0x8ce03d:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8ce03d: xor eax, eax
        pc = 0x8ce03f; continue;
      case 0x8ce03f:
        R.push(0x1); // 8ce03f: push 1
        R.push(0x0); // 8ce041: push 0
        R.push((R.eax >>> 0)); // 8ce043: push eax
        R.call(0x600c90, { n: 3, thisEcx: false, calleeClean: false }); // 8ce044: call 0x600c90
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 8ce049: add esp, 0xc
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8ce04c: test eax, eax
        if (!R.zf) { pc = 0x8ce09d; continue; } // 8ce04e: jne 0x8ce09d
        pc = 0x8ce050; continue;
      case 0x8ce050:
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 8ce050: test ebp, ebp
        if (!R.zf) { pc = 0x8ce09d; continue; } // 8ce052: jne 0x8ce09d
        pc = 0x8ce054; continue;
      case 0x8ce054:
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 8ce054: lea ecx, [esp + 0x10]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8ce058: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8ce05d: test eax, eax
        if (!R.zf) { pc = 0x8cdf62; continue; } // 8ce05f: jne 0x8cdf62
        pc = 0x8ce065; continue;
      case 0x8ce065:
        R.eax = (((R.m.u16(((0xb77c7a) | 0) >>> 0)) << 16 >> 16)) | 0; // 8ce065: movsx eax, word ptr [0xb77c7a]
        R.eax = (((R.eax + R.eax * 2) | 0)) | 0; // 8ce06c: lea eax, [eax + eax*2]
        R.eax = (R.shl((R.eax >>> 0), 0x8, 32)) | 0; // 8ce06f: shl eax, 8
        R.eax = (R.m.u32(((R.eax + 0xb74c26) | 0) >>> 0)) | 0; // 8ce072: mov eax, dword ptr [eax + 0xb74c26]
        R.eax = (R.m.u32(((R.eax + 0x39) | 0) >>> 0)) | 0; // 8ce078: mov eax, dword ptr [eax + 0x39]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8ce07b: test eax, eax
        if (R.zf) { pc = 0x8ce0b5; continue; } // 8ce07d: je 0x8ce0b5
        pc = 0x8ce07f; continue;
      case 0x8ce07f:
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8ce07f: mov ecx, dword ptr [eax]
        R.edx = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 8ce081: mov edx, dword ptr [edi]
        R.push((R.ecx >>> 0)); // 8ce083: push ecx
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8ce084: mov ecx, dword ptr [0xae1050]
        R.push((R.edx >>> 0)); // 8ce08a: push edx
        R.call(0x4cc9e0, { n: 2, thisEcx: true, calleeClean: true }); // 8ce08b: call 0x4cc9e0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8ce090: test eax, eax
        if (R.zf) { pc = 0x8ce0b5; continue; } // 8ce092: je 0x8ce0b5
        pc = 0x8ce094; continue;
      case 0x8ce094:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x35) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8ce094: mov al, byte ptr [eax + 0x35]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x3f, 8)) & 0xff) << 0)) | 0; // 8ce097: and al, 0x3f
        R.sub(((R.eax >>> 0) & 0xff), 0x5, 8); // 8ce099: cmp al, 5
        if (!R.zf) { pc = 0x8ce0b5; continue; } // 8ce09b: jne 0x8ce0b5
        pc = 0x8ce09d; continue;
      case 0x8ce09d:
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 8ce09d: lea ecx, [esp + 0x10]
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0xffffffff); // 8ce0a1: mov dword ptr [esp + 0x28], 0xffffffff
        R.call(0x68d040, { n: 0, thisEcx: true, calleeClean: false }); // 8ce0a9: call 0x68d040
        R.eax = (0x1) | 0; // 8ce0ae: mov eax, 1
        pc = 0x8ce0c8; continue; // 8ce0b3: jmp 0x8ce0c8
      case 0x8ce0b5:
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 8ce0b5: lea ecx, [esp + 0x10]
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0xffffffff); // 8ce0b9: mov dword ptr [esp + 0x28], 0xffffffff
        R.call(0x68d040, { n: 0, thisEcx: true, calleeClean: false }); // 8ce0c1: call 0x68d040
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8ce0c6: xor eax, eax
        pc = 0x8ce0c8; continue;
      case 0x8ce0c8:
        R.ecx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 8ce0c8: mov ecx, dword ptr [esp + 0x20]
        R.edi = (R.pop()) | 0; // 8ce0cc: pop edi
        R.esi = (R.pop()) | 0; // 8ce0cd: pop esi
        R.ebp = (R.pop()) | 0; // 8ce0ce: pop ebp
        R.ebx = (R.pop()) | 0; // 8ce0cf: pop ebx
        /* fs */ // 8ce0d0: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x1c, 32)) | 0; // 8ce0d7: add esp, 0x1c
        return R.eax; // 8ce0da: ret 8
      default: throw new Error(`f_8cde70: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
