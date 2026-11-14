// 0x842e10 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4cf5a0=1c, 4d0c60=5c, 4d1600=6tc, 4d42d0=3tc, 53ca90=1, 5407e0=0, 5444a0=2, 5968d0=2tc, 598800=5tc, 5a0590=1tc, 5fd210=1c, 5fea50=2c, 600a50=5, 62ed70=1tc, 7f7490=2tc, 840d80=6tc, 8423f0=2tc, 843e10=4tc, 846920=6tcf, 84af00=8c, 84b180=3c, 84b6f0=4c, 85e410=0t, 864550=6cf, 8c7560=3tc, 8ce990=4tc, 946464=5
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x842e10, 0x842e68, 0x842e82, 0x842e9b, 0x842eb5, 0x842ebd, 0x842ede, 0x842ee1, 0x842eff, 0x842f20, 0x842f3c, 0x842f44, 0x842f4e, 0x842f58, 0x842f5f, 0x842f69, 0x842f71, 0x842f79, 0x842f96, 0x842fa0, 0x842fb5, 0x842fcd, 0x842fcf, 0x842fe1, 0x842ffa, 0x84300e, 0x843023, 0x843027, 0x84304d, 0x84305d, 0x843063, 0x843076, 0x84307f, 0x843089, 0x843096, 0x8430aa, 0x8430d2, 0x8430d6, 0x8430e1, 0x8430fd, 0x843109, 0x843124, 0x84313e, 0x843153, 0x84315d, 0x843166, 0x843185, 0x84318b, 0x8431a1, 0x8431ae, 0x8431bf, 0x8431c3, 0x8431cb, 0x8431dc, 0x8431e3, 0x8431e8, 0x8431f7, 0x843231, 0x843252, 0x84325b, 0x84325f, 0x843267, 0x84327f, 0x843287, 0x8432bc, 0x8432c6, 0x8432c8, 0x8432d4, 0x8432dc, 0x8432e8, 0x843305, 0x843340, 0x84335a, 0x84335e, 0x843373, 0x84338e, 0x8433ad, 0x8433d6, 0x8433e0, 0x8433ef, 0x8433f9, 0x843406, 0x843412, 0x84342e, 0x843432, 0x843436, 0x84344a, 0x843454, 0x843465, 0x84347b, 0x8434ab, 0x8434bd, 0x8434d2, 0x8434e7, 0x8434fe, 0x843513, 0x84351a, 0x84351c, 0x843524, 0x84353d, 0x84355a, 0x84357d, 0x84357f, 0x843587, 0x84358f, 0x843593, 0x843595, 0x84359d, 0x8435a5, 0x8435cc, 0x8435d9, 0x8435de, 0x843607, 0x843611, 0x843620, 0x84362a, 0x843637, 0x843643, 0x843664, 0x84366e, 0x84367d, 0x843689, 0x843692, 0x843694, 0x8436c3, 0x8436cc, 0x8436cf, 0x8436e4, 0x8436e6, 0x843701, 0x84370c, 0x84374b, 0x843753, 0x84376b, 0x84377e, 0x843786, 0x8437c7, 0x8437d4, 0x8437e1]);
const CH = new Uint8Array([0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 10, 10, 10, 11, 11, 11, 11, 11, 11, 11, 11, 12, 12, 12, 12, 12, 12, 12, 12, 13, 13, 13, 13, 13, 13, 13, 13, 13, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 17, 18, 18, 18, 18]);
function f_842e10_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 842e10
        R.push(0xffffffff); // 842e10: push -1
        R.push(0x9624f8); // 842e12: push 0x9624f8
        R.eax = (0) | 0; // 842e17: mov eax, dword ptr fs:[0]
        R.push((R.eax >>> 0)); // 842e1d: push eax
        /* fs */ // 842e1e: mov dword ptr fs:[0], esp
        R.esp = (R.sub((R.esp >>> 0), 0x98, 32)) | 0; // 842e25: sub esp, 0x98
        R.push((R.ebx >>> 0)); // 842e2b: push ebx
        R.push((R.ebp >>> 0)); // 842e2c: push ebp
        R.ebp = ((R.ecx >>> 0)) | 0; // 842e2d: mov ebp, ecx
        R.push((R.esi >>> 0)); // 842e2f: push esi
        R.push((R.edi >>> 0)); // 842e30: push edi
        R.ecx = (((R.esp + 0x58) | 0)) | 0; // 842e31: lea ecx, [esp + 0x58]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ebp >>> 0)); // 842e35: mov dword ptr [esp + 0x1c], ebp
        R.call(0x85e410, { n: 0, thisEcx: true, calleeClean: false }); // 842e39: call 0x85e410
        R.edi = (R.m.u32(((R.esp + 0xbc) | 0) >>> 0)) | 0; // 842e3e: mov edi, dword ptr [esp + 0xbc]
        R.esi = (R.logic((R.esi >>> 0) ^ (R.esi >>> 0), 32)) | 0; // 842e45: xor esi, esi
        R.push((R.esi >>> 0)); // 842e47: push esi
        R.push((R.esi >>> 0)); // 842e48: push esi
        R.push(0x1); // 842e49: push 1
        R.push((R.esi >>> 0)); // 842e4b: push esi
        R.push((R.edi >>> 0)); // 842e4c: push edi
        R.m.w32(((R.esp + 0xc4) | 0) >>> 0, (R.esi >>> 0)); // 842e4d: mov dword ptr [esp + 0xc4], esi
        R.m.w32(((R.esp + 0x54) | 0) >>> 0, (R.esi >>> 0)); // 842e54: mov dword ptr [esp + 0x54], esi
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 842e58: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 842e5d: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 842e60: test eax, eax
        if (!R.zf) { pc = 127; continue; } // 842e62: jne 0x8436e4
        pc = 1; continue;
      case 1: // 842e68
        R.push((R.esi >>> 0)); // 842e68: push esi
        R.push((R.esi >>> 0)); // 842e69: push esi
        R.push(0x1); // 842e6a: push 1
        R.push(0x1); // 842e6c: push 1
        R.push((R.edi >>> 0)); // 842e6e: push edi
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 842e6f: call 0x600a50
        R.ebx = (R.m.u32(((R.esp + 0xcc) | 0) >>> 0)) | 0; // 842e74: mov ebx, dword ptr [esp + 0xcc]
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 842e7b: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 842e7e: test eax, eax
        if (R.zf) { pc = 8; continue; } // 842e80: je 0x842eff
        pc = 2; continue;
      case 2: // 842e82
        R.push((R.edi >>> 0)); // 842e82: push edi
        R.call(0x53ca90, { n: 1, thisEcx: false, calleeClean: false }); // 842e83: call 0x53ca90
        R.ecx = (R.m.u32(((0xb63c98) | 0) >>> 0)) | 0; // 842e88: mov ecx, dword ptr [0xb63c98]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 842e8e: add esp, 4
        R.push((R.eax >>> 0)); // 842e91: push eax
        R.call(0x5fd210, { n: 1, thisEcx: false, calleeClean: true }); // 842e92: call 0x5fd210
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 842e97: test eax, eax
        if (R.zf) { pc = 8; continue; } // 842e99: je 0x842eff
        pc = 3; continue;
      default: return pc;
    }
  }
}
function f_842e10_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 3: // 842e9b
        R.push((R.edi >>> 0)); // 842e9b: push edi
        R.call(0x53ca90, { n: 1, thisEcx: false, calleeClean: false }); // 842e9c: call 0x53ca90
        R.ecx = (R.m.u32(((0xb74448) | 0) >>> 0)) | 0; // 842ea1: mov ecx, dword ptr [0xb74448]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 842ea7: add esp, 4
        R.push((R.eax >>> 0)); // 842eaa: push eax
        R.push((R.ebx >>> 0)); // 842eab: push ebx
        R.call(0x7f7490, { n: 2, thisEcx: true, calleeClean: true }); // 842eac: call 0x7f7490
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 842eb1: test eax, eax
        if (R.zf) { pc = 5; continue; } // 842eb3: je 0x842ebd
        pc = 4; continue;
      case 4: // 842eb5
        R.m.w32(((R.esp + 0x40) | 0) >>> 0, 0x1); // 842eb5: mov dword ptr [esp + 0x40], 1
        pc = 5; continue;
      case 5: // 842ebd
        R.push((R.edi >>> 0)); // 842ebd: push edi
        R.call(0x53ca90, { n: 1, thisEcx: false, calleeClean: false }); // 842ebe: call 0x53ca90
        R.ecx = (R.m.u32(((0xb63c98) | 0) >>> 0)) | 0; // 842ec3: mov ecx, dword ptr [0xb63c98]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 842ec9: add esp, 4
        R.push((R.eax >>> 0)); // 842ecc: push eax
        R.push(0x4); // 842ecd: push 4
        R.call(0x5fea50, { n: 2, thisEcx: false, calleeClean: true }); // 842ecf: call 0x5fea50
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 842ed4: movsx eax, al
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 842ed7: dec eax
        if (R.zf) { pc = 127; continue; } // 842ed8: je 0x8436e4
        pc = 6; continue;
      case 6: // 842ede
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 842ede: dec eax
        if (!R.zf) { pc = 8; continue; } // 842edf: jne 0x842eff
        pc = 7; continue;
      case 7: // 842ee1
        R.push((R.edi >>> 0)); // 842ee1: push edi
        R.call(0x53ca90, { n: 1, thisEcx: false, calleeClean: false }); // 842ee2: call 0x53ca90
        R.ecx = (R.m.u32(((0xb74448) | 0) >>> 0)) | 0; // 842ee7: mov ecx, dword ptr [0xb74448]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 842eed: add esp, 4
        R.push((R.eax >>> 0)); // 842ef0: push eax
        R.push((R.ebx >>> 0)); // 842ef1: push ebx
        R.call(0x7f7490, { n: 2, thisEcx: true, calleeClean: true }); // 842ef2: call 0x7f7490
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 842ef7: test eax, eax
        if (R.zf) { pc = 127; continue; } // 842ef9: je 0x8436e4
        pc = 8; continue;
      case 8: // 842eff
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 842eff: mov eax, dword ptr [edi]
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 842f01: mov ecx, dword ptr [0xae1050]
        R.push((R.ebx >>> 0)); // 842f07: push ebx
        R.esi = (((R.eax + R.eax * 8) | 0)) | 0; // 842f08: lea esi, [eax + eax*8]
        R.eax = (R.m.u32(((R.ebp + 0xdc) | 0) >>> 0)) | 0; // 842f0b: mov eax, dword ptr [ebp + 0xdc]
        R.esi = (R.add((R.esi >>> 0), (R.eax >>> 0), 32)) | 0; // 842f11: add esi, eax
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 842f13: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 842f18: test eax, eax
        R.m.w32(((R.esp + 0x50) | 0) >>> 0, (R.eax >>> 0)); // 842f1a: mov dword ptr [esp + 0x50], eax
        if (R.zf) { pc = 10; continue; } // 842f1e: je 0x842f3c
        pc = 9; continue;
      default: return pc;
    }
  }
}
function f_842e10_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 9: // 842f20
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 842f20: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 842f23: mov edx, dword ptr [0xae23b4]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 842f29: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 842f2c: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 842f2f: add ecx, eax
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 842f31: add edx, eax
        R.eax = (((R.edx + R.ecx * 4) | 0)) | 0; // 842f33: lea eax, [edx + ecx*4]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 842f36: mov dword ptr [esp + 0x10], eax
        pc = 11; continue; // 842f3a: jmp 0x842f44
      case 10: // 842f3c
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, 0x0); // 842f3c: mov dword ptr [esp + 0x10], 0
        pc = 11; continue;
      case 11: // 842f44
        R.sub(R.m.u8(((R.esi + 0x4) | 0) >>> 0), 0x1, 8); // 842f44: cmp byte ptr [esi + 4], 1
        if (!R.zf) { pc = 127; continue; } // 842f48: jne 0x8436e4
        pc = 12; continue;
      case 12: // 842f4e
        R.sub(R.m.u8(((R.esi + 0x8) | 0) >>> 0), 0x64, 8); // 842f4e: cmp byte ptr [esi + 8], 0x64
        if (!R.cf) { pc = 127; continue; } // 842f52: jae 0x8436e4
        pc = 13; continue;
      case 13: // 842f58
        R.eax = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 842f58: mov eax, dword ptr [ebp]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 842f5b: test eax, eax
        if (R.zf) { pc = 19; continue; } // 842f5d: je 0x842fa0
        pc = 14; continue;
      case 14: // 842f5f
        R.ecx = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 842f5f: mov ecx, dword ptr [ebx]
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 842f61: test edi, edi
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.ecx >>> 0)); // 842f63: mov dword ptr [esp + 0x38], ecx
        if (R.zf) { pc = 16; continue; } // 842f67: je 0x842f71
        pc = 15; continue;
      case 15: // 842f69
        R.edx = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 842f69: mov edx, dword ptr [edi]
        R.m.w32(((R.esp + 0x3c) | 0) >>> 0, (R.edx >>> 0)); // 842f6b: mov dword ptr [esp + 0x3c], edx
        pc = 17; continue; // 842f6f: jmp 0x842f79
      case 16: // 842f71
        R.m.w32(((R.esp + 0x3c) | 0) >>> 0, 0xffffffff); // 842f71: mov dword ptr [esp + 0x3c], 0xffffffff
        pc = 17; continue;
      case 17: // 842f79
        R.ecx = (R.m.u32(((R.ebp + 0x10) | 0) >>> 0)) | 0; // 842f79: mov ecx, dword ptr [ebp + 0x10]
        R.push(0x757ea0); // 842f7c: push 0x757ea0
        R.push(0x8); // 842f81: push 8
        R.push((R.ecx >>> 0)); // 842f83: push ecx
        R.edx = (((R.esp + 0x44) | 0)) | 0; // 842f84: lea edx, [esp + 0x44]
        R.push((R.eax >>> 0)); // 842f88: push eax
        R.push((R.edx >>> 0)); // 842f89: push edx
        R.call(0x946464, { n: 5, thisEcx: false, calleeClean: false }); // 842f8a: call 0x946464
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 842f8f: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 842f92: test eax, eax
        if (R.zf) { pc = 19; continue; } // 842f94: je 0x842fa0
        pc = 18; continue;
      case 18: // 842f96
        R.eax = (0x1) | 0; // 842f96: mov eax, 1
        pc = 128; continue; // 842f9b: jmp 0x8436e6
      default: return pc;
    }
  }
}
function f_842e10_3(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 19: // 842fa0
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 842fa0: mov ecx, dword ptr [0xae1050]
        R.push((R.ebx >>> 0)); // 842fa6: push ebx
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 842fa7: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 842fac: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 842fae: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 21; continue; } // 842fb3: je 0x842fcd
        pc = 20; continue;
      case 20: // 842fb5
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 842fb5: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 842fb8: mov edx, dword ptr [0xae23b4]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 842fbe: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 842fc1: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 842fc4: add ecx, eax
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 842fc6: add edx, eax
        R.eax = (((R.edx + R.ecx * 4) | 0)) | 0; // 842fc8: lea eax, [edx + ecx*4]
        pc = 22; continue; // 842fcb: jmp 0x842fcf
      case 21: // 842fcd
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 842fcd: xor eax, eax
        pc = 22; continue;
      case 22: // 842fcf
        R.push((R.edi >>> 0)); // 842fcf: push edi
        R.push((R.eax >>> 0)); // 842fd0: push eax
        R.push((R.ebx >>> 0)); // 842fd1: push ebx
        R.ecx = ((R.ebp >>> 0)) | 0; // 842fd2: mov ecx, ebp
        R.call(0x84b180, { n: 3, thisEcx: false, calleeClean: true }); // 842fd4: call 0x84b180
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 842fd9: test al, al
        if (R.zf) { pc = 127; continue; } // 842fdb: je 0x8436e4
        pc = 23; continue;
      case 23: // 842fe1
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 842fe1: mov ecx, dword ptr [0xde1f54]
        R.ebp = (R.logic((R.ebp >>> 0) ^ (R.ebp >>> 0), 32)) | 0; // 842fe7: xor ebp, ebp
        R.push((R.ebp >>> 0)); // 842fe9: push ebp
        R.push((R.ebp >>> 0)); // 842fea: push ebp
        R.push((R.edi >>> 0)); // 842feb: push edi
        R.push((R.ebx >>> 0)); // 842fec: push ebx
        R.call(0x8ce990, { n: 4, thisEcx: true, calleeClean: true }); // 842fed: call 0x8ce990
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 842ff2: test eax, eax
        if (R.zf) { pc = 127; continue; } // 842ff4: je 0x8436e4
        pc = 24; continue;
      case 24: // 842ffa
        R.ecx = (R.m.u32(((0xae2a38) | 0) >>> 0)) | 0; // 842ffa: mov ecx, dword ptr [0xae2a38]
        R.push((R.edi >>> 0)); // 843000: push edi
        R.call(0x5a0590, { n: 1, thisEcx: true, calleeClean: true }); // 843001: call 0x5a0590
        R.sub((R.eax >>> 0), (R.ebp >>> 0), 32); // 843006: cmp eax, ebp
        if (R.zf) { pc = 127; continue; } // 843008: je 0x8436e4
        pc = 25; continue;
      case 25: // 84300e
        R.push((R.ebp >>> 0)); // 84300e: push ebp
        R.push(0x1); // 84300f: push 1
        R.push((R.ebp >>> 0)); // 843011: push ebp
        R.push((R.ebp >>> 0)); // 843012: push ebp
        R.push((R.ebp >>> 0)); // 843013: push ebp
        R.ecx = ((R.eax >>> 0)) | 0; // 843014: mov ecx, eax
        R.call(0x598800, { n: 5, thisEcx: true, calleeClean: true }); // 843016: call 0x598800
        R.sub((R.eax >>> 0), (R.ebp >>> 0), 32); // 84301b: cmp eax, ebp
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.eax >>> 0)); // 84301d: mov dword ptr [esp + 0x44], eax
        if (!R.cL) { pc = 27; continue; } // 843021: jge 0x843027
        pc = 26; continue;
      default: return pc;
    }
  }
}
function f_842e10_4(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 26: // 843023
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.ebp >>> 0)); // 843023: mov dword ptr [esp + 0x44], ebp
        pc = 27; continue;
      case 27: // 843027
        R.eax = (((R.m.u16(((R.edi + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 843027: movsx eax, word ptr [edi + 0x80]
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.eax >>> 0)); // 84302e: mov dword ptr [esp + 0x30], eax
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 843032: fild dword ptr [esp + 0x30]
        R.st[0] = R.st[0] * 0.0008; // 843036: fmul qword ptr [0x96a618]
        R.m.wf64(((R.esp + 0x38) | 0) >>> 0, R.st[0]); // 84303c: fst qword ptr [esp + 0x38]
        R.fcom(R.st[0], 1.0); R.fpop(); // 843040: fcomp qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 843046: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 843048: test ah, 0x41
        if (R.zf) { pc = 29; continue; } // 84304b: je 0x84305d
        pc = 28; continue;
      case 28: // 84304d
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, 0x0); // 84304d: mov dword ptr [esp + 0x38], 0
        R.m.w32(((R.esp + 0x3c) | 0) >>> 0, 0x3ff00000); // 843055: mov dword ptr [esp + 0x3c], 0x3ff00000
        pc = 29; continue;
      case 29: // 84305d
        R.esi = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 84305d: mov esi, dword ptr [esi]
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.ebp >>> 0)); // 84305f: mov dword ptr [esp + 0x30], ebp
        pc = 30; continue;
      case 30: // 843063
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 843063: mov al, byte ptr [esi + 0x24]
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, 0xffffffff); // 843066: mov dword ptr [esp + 0x34], 0xffffffff
        R.logic(((R.eax >>> 0) & 0xff) & 0x1, 8); // 84306e: test al, 1
        if (!R.zf) { pc = 126; continue; } // 843070: jne 0x8436cf
        pc = 31; continue;
      case 31: // 843076
        R.sub(R.m.u8(((R.esi) | 0) >>> 0), 0xb, 8); // 843076: cmp byte ptr [esi], 0xb
        if (!R.zf) { pc = 126; continue; } // 843079: jne 0x8436cf
        pc = 32; continue;
      case 32: // 84307f
        R.sub(R.m.u32(((R.esi + 0x17) | 0) >>> 0), 0xffffffff, 32); // 84307f: cmp dword ptr [esi + 0x17], -1
        if (!R.zf) { pc = 126; continue; } // 843083: jne 0x8436cf
        pc = 33; continue;
      case 33: // 843089
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.esi + 0x1) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 843089: mov ax, word ptr [esi + 1]
        R.logic(((R.eax >>> 0) & 0xffff) & ((R.eax >>> 0) & 0xffff), 16); // 84308d: test ax, ax
        if (R.zf) { pc = 126; continue; } // 843090: je 0x8436cf
        pc = 34; continue;
      case 34: // 843096
        R.edi = (R.m.u32(((R.esp + 0xc0) | 0) >>> 0)) | 0; // 843096: mov edi, dword ptr [esp + 0xc0]
        R.ecx = ((R.eax >>> 0)) | 0; // 84309d: mov ecx, eax
        R.ecx = (R.logic((R.ecx >>> 0) & (R.edi >>> 0), 32)) | 0; // 84309f: and ecx, edi
        R.sub(((R.ecx >>> 0) & 0xffff), ((R.eax >>> 0) & 0xffff), 16); // 8430a1: cmp cx, ax
        if (!R.zf) { pc = 126; continue; } // 8430a4: jne 0x8436cf
        pc = 35; continue;
      default: return pc;
    }
  }
}
function f_842e10_5(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 35: // 8430aa
        R.ebx = (R.m.u32(((R.esp + 0xbc) | 0) >>> 0)) | 0; // 8430aa: mov ebx, dword ptr [esp + 0xbc]
        R.edi = (R.m.u32(((R.esp + 0x50) | 0) >>> 0)) | 0; // 8430b1: mov edi, dword ptr [esp + 0x50]
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 8430b5: mov ecx, dword ptr [esp + 0x1c]
        R.edx = (((R.esp + 0x54) | 0)) | 0; // 8430b9: lea edx, [esp + 0x54]
        R.push((R.edx >>> 0)); // 8430bd: push edx
        R.push((R.ebx >>> 0)); // 8430be: push ebx
        R.push((R.edi >>> 0)); // 8430bf: push edi
        R.push((R.esi >>> 0)); // 8430c0: push esi
        R.call(0x84b6f0, { n: 4, thisEcx: false, calleeClean: true }); // 8430c1: call 0x84b6f0
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 8430c6: test edi, edi
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.eax >>> 0)); // 8430c8: mov dword ptr [esp + 0x2c], eax
        if (R.zf) { pc = 43; continue; } // 8430cc: je 0x843153
        pc = 36; continue;
      case 36: // 8430d2
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8430d2: test eax, eax
        if (!R.zf) { pc = 43; continue; } // 8430d4: jne 0x843153
        pc = 37; continue;
      case 37: // 8430d6
        R.sub(R.m.u16(((R.ebx + 0x80) | 0) >>> 0), 0x1b58, 16); // 8430d6: cmp word ptr [ebx + 0x80], 0x1b58
        if (!R.cL) { pc = 43; continue; } // 8430df: jge 0x843153
        pc = 38; continue;
      case 38: // 8430e1
        R.fpush(R.m.s32(((R.esi + 0x7) | 0) >>> 0)); // 8430e1: fild dword ptr [esi + 7]
        R.eax = (R.m.u32(((R.esp + 0xb8) | 0) >>> 0)) | 0; // 8430e4: mov eax, dword ptr [esp + 0xb8]
        R.st[0] = R.st[0] * 1.3; // 8430eb: fmul qword ptr [0x968de8]
        R.fpush(R.m.s32(((R.eax + 0x52) | 0) >>> 0)); // 8430f1: fild dword ptr [eax + 0x52]
        R.fcom(R.st[0], R.st[1]); R.fpop(); R.fpop(); // 8430f4: fcompp 
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8430f6: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 8430f8: test ah, 0x41
        if (!R.zf) { pc = 43; continue; } // 8430fb: jne 0x843153
        pc = 39; continue;
      case 39: // 8430fd
        R.eax = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 8430fd: mov eax, dword ptr [esp + 0x10]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 843101: test eax, eax
        if (R.zf) { pc = 126; continue; } // 843103: je 0x8436cf
        pc = 40; continue;
      case 40: // 843109
        R.push(0x0); // 843109: push 0
        R.push(0x0); // 84310b: push 0
        R.push(0x1); // 84310d: push 1
        R.ecx = ((R.eax >>> 0)) | 0; // 84310f: mov ecx, eax
        R.push(0x0); // 843111: push 0
        R.push((R.ecx >>> 0)); // 843113: push ecx
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 843114: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 843119: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84311c: test eax, eax
        if (R.zf) { pc = 126; continue; } // 84311e: je 0x8436cf
        pc = 41; continue;
      case 41: // 843124
        R.edx = (R.m.u32(((R.esp + 0xb8) | 0) >>> 0)) | 0; // 843124: mov edx, dword ptr [esp + 0xb8]
        R.ecx = (R.m.u32(((R.esi + 0x7) | 0) >>> 0)) | 0; // 84312b: mov ecx, dword ptr [esi + 7]
        R.eax = (R.m.u32(((R.edx + 0x52) | 0) >>> 0)) | 0; // 84312e: mov eax, dword ptr [edx + 0x52]
        R.eax = (R.sub((R.eax >>> 0), 0x16e360, 32)) | 0; // 843131: sub eax, 0x16e360
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 843136: cmp eax, ecx
        if (!R.cL) { pc = 126; continue; } // 843138: jge 0x8436cf
        pc = 42; continue;
      default: return pc;
    }
  }
}
function f_842e10_6(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 42: // 84313e
        R.ecx = ((R.edx >>> 0)) | 0; // 84313e: mov ecx, edx
        R.push(0x0); // 843140: push 0
        R.push((R.ecx >>> 0)); // 843142: push ecx
        R.call(0x5444a0, { n: 2, thisEcx: false, calleeClean: false }); // 843143: call 0x5444a0
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 843148: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84314b: test eax, eax
        if (R.zf) { pc = 126; continue; } // 84314d: je 0x8436cf
        pc = 43; continue;
      case 43: // 843153
        R.eax = (R.m.u32(((R.esi + 0xf) | 0) >>> 0)) | 0; // 843153: mov eax, dword ptr [esi + 0xf]
        R.ecx = (R.m.u32(((R.esi + 0x13) | 0) >>> 0)) | 0; // 843156: mov ecx, dword ptr [esi + 0x13]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 843159: cmp eax, ecx
        if (!R.zf) { pc = 45; continue; } // 84315b: jne 0x843166
        pc = 44; continue;
      case 44: // 84315d
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 84315d: cmp eax, -1
        if (!R.zf) { pc = 126; continue; } // 843160: jne 0x8436cf
        pc = 45; continue;
      case 45: // 843166
        R.eax = (R.m.u32(((R.esi + 0x1b) | 0) >>> 0)) | 0; // 843166: mov eax, dword ptr [esi + 0x1b]
        R.edx = (R.m.u32(((R.esi + 0x1f) | 0) >>> 0)) | 0; // 843169: mov edx, dword ptr [esi + 0x1f]
        R.m.w32(((R.esp + 0x48) | 0) >>> 0, (R.eax >>> 0)); // 84316c: mov dword ptr [esp + 0x48], eax
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.esp + 0x4a) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 843170: mov cx, word ptr [esp + 0x4a]
        R.m.w32(((R.esp + 0x4c) | 0) >>> 0, (R.edx >>> 0)); // 843175: mov dword ptr [esp + 0x4c], edx
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 843179: mov dx, word ptr [0xae2c92]
        R.sub(((R.ecx >>> 0) & 0xffff), ((R.edx >>> 0) & 0xffff), 16); // 843180: cmp cx, dx
        if (R.cf) { pc = 48; continue; } // 843183: jb 0x8431a1
        pc = 46; continue;
      case 46: // 843185
        if (!R.cBE) { pc = 126; continue; } // 843185: ja 0x8436cf
        pc = 47; continue;
      case 47: // 84318b
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 84318b: xor ecx, ecx
        R.sub(((R.eax >>> 0) & 0xffff), R.m.u16(((0xae2c90) | 0) >>> 0), 16); // 84318d: cmp ax, word ptr [0xae2c90]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.cL ? 1 : 0) & 0xff) << 0)) | 0; // 843194: setl cl
        R.eax = ((R.ecx >>> 0)) | 0; // 843197: mov eax, ecx
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 843199: test eax, eax
        if (R.zf) { pc = 126; continue; } // 84319b: je 0x8436cf
        pc = 48; continue;
      case 48: // 8431a1
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8431a1: mov al, byte ptr [esi + 0x24]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x1e, 8)) & 0xff) << 0)) | 0; // 8431a4: and al, 0x1e
        R.sub(((R.eax >>> 0) & 0xff), 0xa, 8); // 8431a6: cmp al, 0xa
        if (!R.zf) { pc = 57; continue; } // 8431a8: jne 0x843231
        pc = 49; continue;
      case 49: // 8431ae
        R.edx = (R.m.u32(((R.esp + 0xb8) | 0) >>> 0)) | 0; // 8431ae: mov edx, dword ptr [esp + 0xb8]
        R.sub(R.m.u8(((R.edx + 0x18) | 0) >>> 0), 0x18, 8); // 8431b5: cmp byte ptr [edx + 0x18], 0x18
        if (!R.cLE) { pc = 126; continue; } // 8431b9: jg 0x8436cf
        pc = 50; continue;
      case 50: // 8431bf
        R.sub(((R.eax >>> 0) & 0xff), ((R.eax >>> 0) & 0xff), 8); // 8431bf: cmp al, al
        if (!R.zf) { pc = 57; continue; } // 8431c1: jne 0x843231
        pc = 51; continue;
      case 51: // 8431c3
        R.eax = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 8431c3: mov eax, dword ptr [esp + 0x40]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8431c7: test eax, eax
        if (!R.zf) { pc = 57; continue; } // 8431c9: jne 0x843231
        pc = 52; continue;
      default: return pc;
    }
  }
}
function f_842e10_7(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 52: // 8431cb
        R.eax = (R.m.u32(((R.esp + 0xbc) | 0) >>> 0)) | 0; // 8431cb: mov eax, dword ptr [esp + 0xbc]
        R.ecx = (R.m.u32(((R.eax + 0x53) | 0) >>> 0)) | 0; // 8431d2: mov ecx, dword ptr [eax + 0x53]
        R.eax = (R.m.u32(((R.edx + 0x1a) | 0) >>> 0)) | 0; // 8431d5: mov eax, dword ptr [edx + 0x1a]
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 8431d8: cmp ecx, eax
        if (R.zf) { pc = 57; continue; } // 8431da: je 0x843231
        pc = 53; continue;
      case 53: // 8431dc
        R.eax = (R.m.u32(((R.edx + 0x39) | 0) >>> 0)) | 0; // 8431dc: mov eax, dword ptr [edx + 0x39]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8431df: test eax, eax
        if (R.zf) { pc = 55; continue; } // 8431e1: je 0x8431e8
        pc = 54; continue;
      case 54: // 8431e3
        R.sub(R.m.u32(((R.eax + 0x53) | 0) >>> 0), (R.ecx >>> 0), 32); // 8431e3: cmp dword ptr [eax + 0x53], ecx
        if (R.zf) { pc = 57; continue; } // 8431e6: je 0x843231
        pc = 55; continue;
      case 55: // 8431e8
        R.ecx = (R.m.u32(((R.edx + 0x61) | 0) >>> 0)) | 0; // 8431e8: mov ecx, dword ptr [edx + 0x61]
        R.sub(R.m.u16(((R.ecx + 0xb) | 0) >>> 0), 0x3e8, 16); // 8431eb: cmp word ptr [ecx + 0xb], 0x3e8
        if (R.cL) { pc = 126; continue; } // 8431f1: jl 0x8436cf
        pc = 56; continue;
      case 56: // 8431f7
        R.edx = (R.m.u32(((R.esp + 0xbc) | 0) >>> 0)) | 0; // 8431f7: mov edx, dword ptr [esp + 0xbc]
        R.ecx = (R.m.u32(((R.esp + 0xb8) | 0) >>> 0)) | 0; // 8431fe: mov ecx, dword ptr [esp + 0xb8]
        R.push(0x0); // 843205: push 0
        R.eax = (R.m.u32(((R.edx + 0xcf) | 0) >>> 0)) | 0; // 843207: mov eax, dword ptr [edx + 0xcf]
        R.push((R.eax >>> 0)); // 84320d: push eax
        R.push((R.ecx >>> 0)); // 84320e: push ecx
        R.call(0x5407e0, { n: 0, thisEcx: false, calleeClean: false }); // 84320f: call 0x5407e0
        R.push(0x7d0); // 843214: push 0x7d0
        R.edi = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 843219: movsx edi, ax
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 84321c: call 0x90cfc0
        R.eax = (R.add((R.eax >>> 0), 0x3e8, 32)) | 0; // 843221: add eax, 0x3e8
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 843226: add esp, 0x10
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 843229: cmp edi, eax
        if (R.cL) { pc = 126; continue; } // 84322b: jl 0x8436cf
        pc = 57; continue;
      case 57: // 843231
        R.edx = (R.m.u32(((R.esp + 0xbc) | 0) >>> 0)) | 0; // 843231: mov edx, dword ptr [esp + 0xbc]
        R.eax = (R.m.u32(((R.esp + 0xb8) | 0) >>> 0)) | 0; // 843238: mov eax, dword ptr [esp + 0xb8]
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 84323f: mov ecx, dword ptr [0xde1f54]
        R.push(0x1); // 843245: push 1
        R.push((R.edx >>> 0)); // 843247: push edx
        R.push((R.eax >>> 0)); // 843248: push eax
        R.call(0x8c7560, { n: 3, thisEcx: true, calleeClean: true }); // 843249: call 0x8c7560
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84324e: test eax, eax
        if (R.zf) { pc = 61; continue; } // 843250: je 0x843267
        pc = 58; continue;
      case 58: // 843252
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 843252: mov al, byte ptr [esi + 0x24]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x1e, 8)) & 0xff) << 0)) | 0; // 843255: and al, 0x1e
        R.sub(((R.eax >>> 0) & 0xff), 0x2, 8); // 843257: cmp al, 2
        if (R.zf) { pc = 61; continue; } // 843259: je 0x843267
        pc = 59; continue;
      case 59: // 84325b
        R.sub(((R.eax >>> 0) & 0xff), 0x4, 8); // 84325b: cmp al, 4
        if (R.zf) { pc = 61; continue; } // 84325d: je 0x843267
        pc = 60; continue;
      default: return pc;
    }
  }
}
function f_842e10_8(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 60: // 84325f
        R.sub(((R.eax >>> 0) & 0xff), 0x6, 8); // 84325f: cmp al, 6
        if (!R.zf) { pc = 126; continue; } // 843261: jne 0x8436cf
        pc = 61; continue;
      case 61: // 843267
        R.fpush(R.m.s32(((R.esp + 0x44) | 0) >>> 0)); // 843267: fild dword ptr [esp + 0x44]
        R.fpush(R.m.s32(((R.esi + 0x7) | 0) >>> 0)); // 84326b: fild dword ptr [esi + 7]
        R.fpush(R.st[1]); // 84326e: fld st(1)
        R.st[0] = R.st[0] * 0.2; // 843270: fmul qword ptr [0x968918]
        R.fcom(R.st[0], R.st[1]); R.fpop(); R.fpop(); // 843276: fcompp 
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 843278: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 84327a: test ah, 1
        if (!R.zf) { pc = 65; continue; } // 84327d: jne 0x8432c6
        pc = 62; continue;
      case 62: // 84327f
        R.eax = (R.m.u32(((R.esp + 0x2c) | 0) >>> 0)) | 0; // 84327f: mov eax, dword ptr [esp + 0x2c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 843283: test eax, eax
        if (!R.zf) { pc = 65; continue; } // 843285: jne 0x8432c6
        pc = 63; continue;
      case 63: // 843287
        R.fpush(R.m.s32(((R.esi + 0x3) | 0) >>> 0)); // 843287: fild dword ptr [esi + 3]
        R.ecx = (R.m.u32(((R.esi + 0x7) | 0) >>> 0)) | 0; // 84328a: mov ecx, dword ptr [esi + 7]
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.ecx >>> 0)); // 84328d: mov dword ptr [esp + 0x34], ecx
        R.fpush(R.st[0]); // 843291: fld st(0)
        R.st[0] = R.st[0] * 0.01536; // 843293: fmul qword ptr [0x96f920]
        R.st[0] = R.st[0] * R.st[1]; // 843299: fmul st(1)
        R.ftol(); // 84329b: call 0x945640
        R.fpop(); // 8432a0: fstp st(0)
        R.st[0] = R.st[0] * 0.8; // 8432a2: fmul qword ptr [0x9689b0]
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.eax >>> 0)); // 8432a8: mov dword ptr [esp + 0x20], eax
        R.m.w32(((R.esi + 0x7) | 0) >>> 0, (R.eax >>> 0)); // 8432ac: mov dword ptr [esi + 7], eax
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 8432af: fild dword ptr [esp + 0x20]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 8432b3: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8432b5: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 8432b7: test ah, 0x41
        if (!R.zf) { pc = 65; continue; } // 8432ba: jne 0x8432c6
        pc = 64; continue;
      case 64: // 8432bc
        R.ftol(); // 8432bc: call 0x945640
        R.m.w32(((R.esi + 0x7) | 0) >>> 0, (R.eax >>> 0)); // 8432c1: mov dword ptr [esi + 7], eax
        pc = 66; continue; // 8432c4: jmp 0x8432c8
      case 65: // 8432c6
        R.fpop(); // 8432c6: fstp st(0)
        pc = 66; continue;
      case 66: // 8432c8
        R.eax = (R.m.u32(((R.esi + 0x7) | 0) >>> 0)) | 0; // 8432c8: mov eax, dword ptr [esi + 7]
        R.sub((R.eax >>> 0), 0x1, 32); // 8432cb: cmp eax, 1
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.eax >>> 0)); // 8432ce: mov dword ptr [esp + 0x20], eax
        if (!R.cLE) { pc = 68; continue; } // 8432d2: jg 0x8432dc
        pc = 67; continue;
      case 67: // 8432d4
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, 0x1); // 8432d4: mov dword ptr [esp + 0x20], 1
        pc = 68; continue;
      case 68: // 8432dc
        R.eax = (R.m.u32(((R.esi + 0xf) | 0) >>> 0)) | 0; // 8432dc: mov eax, dword ptr [esi + 0xf]
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 8432df: cmp eax, -1
        if (R.zf) { pc = 88; continue; } // 8432e2: je 0x843465
        pc = 69; continue;
      default: return pc;
    }
  }
}
function f_842e10_9(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 69: // 8432e8
        R.ecx = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 8432e8: mov ecx, dword ptr [0xae23bc]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 8432ee: lea edx, [eax + eax*4]
        R.eax = (((R.eax + R.edx * 2) | 0)) | 0; // 8432f1: lea eax, [eax + edx*2]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 8432f4: lea eax, [eax + eax*4]
        R.eax = (((R.ecx + R.eax * 2) | 0)) | 0; // 8432f7: lea eax, [ecx + eax*2]
        R.ecx = (R.m.u32(((R.eax + 0x61) | 0) >>> 0)) | 0; // 8432fa: mov ecx, dword ptr [eax + 0x61]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 8432fd: test ecx, ecx
        if (R.zf) { pc = 88; continue; } // 8432ff: je 0x843465
        pc = 70; continue;
      case 70: // 843305
        R.edi = (R.m.u32(((R.esi + 0x3) | 0) >>> 0)) | 0; // 843305: mov edi, dword ptr [esi + 3]
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 843308: mov ecx, dword ptr [esp + 0x1c]
        R.push(0x1); // 84330c: push 1
        R.edx = (((R.esp + 0x18) | 0)) | 0; // 84330e: lea edx, [esp + 0x18]
        R.push((R.edi >>> 0)); // 843312: push edi
        R.ebp = ((R.eax >>> 0)) | 0; // 843313: mov ebp, eax
        R.eax = (R.m.u32(((R.esp + 0xc4) | 0) >>> 0)) | 0; // 843315: mov eax, dword ptr [esp + 0xc4]
        R.push((R.edx >>> 0)); // 84331c: push edx
        R.push((R.esi >>> 0)); // 84331d: push esi
        R.push((R.ebp >>> 0)); // 84331e: push ebp
        R.push((R.eax >>> 0)); // 84331f: push eax
        R.m.w32(((R.esp + 0x3c) | 0) >>> 0, (R.ebp >>> 0)); // 843320: mov dword ptr [esp + 0x3c], ebp
        R.call(0x840d80, { n: 6, thisEcx: true, calleeClean: true }); // 843324: call 0x840d80
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 843329: mov ecx, dword ptr [0xae1050]
        R.push((R.ebp >>> 0)); // 84332f: push ebp
        R.ebx = ((R.eax >>> 0)) | 0; // 843330: mov ebx, eax
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 843332: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 843337: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 843339: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 72; continue; } // 84333e: je 0x84335a
        pc = 71; continue;
      case 71: // 843340
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 843340: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 843343: mov edx, dword ptr [0xae23b4]
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 843349: add edx, eax
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 84334b: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 84334e: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 843351: add ecx, eax
        R.ebp = (((R.edx + R.ecx * 4) | 0)) | 0; // 843353: lea ebp, [edx + ecx*4]
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 843356: test ebp, ebp
        if (!R.zf) { pc = 73; continue; } // 843358: jne 0x84335e
        pc = 72; continue;
      case 72: // 84335a
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 84335a: xor eax, eax
        pc = 76; continue; // 84335c: jmp 0x8433ad
      case 73: // 84335e
        R.push(0x0); // 84335e: push 0
        R.push(0x0); // 843360: push 0
        R.push(0x1); // 843362: push 1
        R.push(0x0); // 843364: push 0
        R.push((R.ebp >>> 0)); // 843366: push ebp
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 843367: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 84336c: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84336f: test eax, eax
        if (R.zf) { pc = 75; continue; } // 843371: je 0x84338e
        pc = 74; continue;
      default: return pc;
    }
  }
}
function f_842e10_10(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 74: // 843373
        R.eax = (R.m.u32(((R.esp + 0x24) | 0) >>> 0)) | 0; // 843373: mov eax, dword ptr [esp + 0x24]
        R.ecx = (R.m.u32(((R.esp + 0xbc) | 0) >>> 0)) | 0; // 843377: mov ecx, dword ptr [esp + 0xbc]
        R.push((R.eax >>> 0)); // 84337e: push eax
        R.push((R.ecx >>> 0)); // 84337f: push ecx
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 843380: mov ecx, dword ptr [0xae1050]
        R.push((R.ebp >>> 0)); // 843386: push ebp
        R.call(0x4d42d0, { n: 3, thisEcx: true, calleeClean: true }); // 843387: call 0x4d42d0
        pc = 76; continue; // 84338c: jmp 0x8433ad
      case 75: // 84338e
        R.edx = (R.m.u32(((R.esp + 0x24) | 0) >>> 0)) | 0; // 84338e: mov edx, dword ptr [esp + 0x24]
        R.eax = (R.m.u32(((R.esp + 0xbc) | 0) >>> 0)) | 0; // 843392: mov eax, dword ptr [esp + 0xbc]
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 843399: mov ecx, dword ptr [0xae1050]
        R.push(0x1); // 84339f: push 1
        R.push(0x1); // 8433a1: push 1
        R.push(0x0); // 8433a3: push 0
        R.push((R.edx >>> 0)); // 8433a5: push edx
        R.push((R.eax >>> 0)); // 8433a6: push eax
        R.push((R.ebp >>> 0)); // 8433a7: push ebp
        R.call(0x4d1600, { n: 6, thisEcx: true, calleeClean: true }); // 8433a8: call 0x4d1600
        pc = 76; continue;
      case 76: // 8433ad
        R.eax = (R.sub((R.eax >>> 0), (R.ebx >>> 0), 32)) | 0; // 8433ad: sub eax, ebx
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.eax >>> 0)); // 8433af: mov dword ptr [esp + 0x18], eax
        R.fpush(R.m.s32(((R.esp + 0x18) | 0) >>> 0)); // 8433b3: fild dword ptr [esp + 0x18]
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 8433b7: fild dword ptr [esp + 0x20]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x38) | 0)); // 8433bb: fmul qword ptr [esp + 0x38]
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 8433bf: fdivp st(1)
        R.st[0] = 1.0 - R.st[0]; // 8433c1: fsubr qword ptr [0x967890]
        R.fpush(0.01); // 8433c7: fld qword ptr [0x967898]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 8433cd: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8433cf: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 8433d1: test ah, 0x41
        if (!R.zf) { pc = 78; continue; } // 8433d4: jne 0x8433e0
        pc = 77; continue;
      case 77: // 8433d6
        R.fpop(); // 8433d6: fstp st(0)
        R.fpush(0.01); // 8433d8: fld qword ptr [0x967898]
        pc = 82; continue; // 8433de: jmp 0x843412
      case 78: // 8433e0
        R.fpush(3.0); // 8433e0: fld qword ptr [0x968930]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 8433e6: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8433e8: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8433ea: test ah, 1
        if (R.zf) { pc = 80; continue; } // 8433ed: je 0x8433f9
        pc = 79; continue;
      case 79: // 8433ef
        R.fpop(); // 8433ef: fstp st(0)
        R.fpush(3.0); // 8433f1: fld qword ptr [0x968930]
        pc = 81; continue; // 8433f7: jmp 0x843406
      case 80: // 8433f9
        R.fcom(R.st[0], 1.0); // 8433f9: fcom qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8433ff: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 843401: test ah, 0x41
        if (!R.zf) { pc = 82; continue; } // 843404: jne 0x843412
        pc = 81; continue;
      case 81: // 843406
        R.st[0] = R.st[0] * 0.3333333333333333; // 843406: fmul qword ptr [0x968a80]
        R.st[0] = R.st[0] + 0.67; // 84340c: fadd qword ptr [0x968f80]
        pc = 82; continue;
      default: return pc;
    }
  }
}
function f_842e10_11(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 82: // 843412
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 843412: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * R.st[1]; // 843416: fmul st(1)
        R.ftol(); // 843418: call 0x945640
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.eax >>> 0)); // 84341d: mov dword ptr [esp + 0x14], eax
        R.ecx = (R.m.u32(((R.esi + 0x3) | 0) >>> 0)) | 0; // 843421: mov ecx, dword ptr [esi + 3]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 843424: cmp eax, ecx
        R.fpop(); // 843426: fstp st(0)
        if (!R.cL) { pc = 126; continue; } // 843428: jge 0x8436cf
        pc = 83; continue;
      case 83: // 84342e
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 84342e: cmp eax, edi
        if (!R.cLE) { pc = 85; continue; } // 843430: jg 0x843436
        pc = 84; continue;
      case 84: // 843432
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 843432: mov dword ptr [esp + 0x14], edi
        pc = 85; continue;
      case 85: // 843436
        R.ecx = (R.m.u32(((R.esp + 0x24) | 0) >>> 0)) | 0; // 843436: mov ecx, dword ptr [esp + 0x24]
        R.push((R.ecx >>> 0)); // 84343a: push ecx
        R.ecx = (R.m.u32(((0xb63d28) | 0) >>> 0)) | 0; // 84343b: mov ecx, dword ptr [0xb63d28]
        R.call(0x62ed70, { n: 1, thisEcx: true, calleeClean: true }); // 843441: call 0x62ed70
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 843446: test eax, eax
        if (R.zf) { pc = 89; continue; } // 843448: je 0x84347b
        pc = 86; continue;
      case 86: // 84344a
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.eax + 0x2c) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 84344a: mov ax, word ptr [eax + 0x2c]
        R.sub(((R.eax >>> 0) & 0xffff), 0xf, 16); // 84344e: cmp ax, 0xf
        if (R.cLE) { pc = 89; continue; } // 843452: jle 0x84347b
        pc = 87; continue;
      case 87: // 843454
        R.eax = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 843454: movsx eax, ax
        R.eax = (R.add((R.eax >>> 0), 0xfffffff1, 32)) | 0; // 843457: add eax, -0xf
        R.edx = ((R.eax >>> 0)) | 0; // 84345a: mov edx, eax
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.edx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.edx = (Number(BigInt.asIntN(32, p))) | 0; } // 84345c: imul edx, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, R.sub(R.m.u32(((R.esp + 0x14) | 0) >>> 0), (R.edx >>> 0), 32)); // 84345f: sub dword ptr [esp + 0x14], edx
        pc = 89; continue; // 843463: jmp 0x84347b
      case 88: // 843465
        R.edi = (R.m.u32(((R.esi + 0x3) | 0) >>> 0)) | 0; // 843465: mov edi, dword ptr [esi + 3]
        R.m.w32(((R.esi + 0xf) | 0) >>> 0, 0xffffffff); // 843468: mov dword ptr [esi + 0xf], 0xffffffff
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 84346f: mov dword ptr [esp + 0x14], edi
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, 0x0); // 843473: mov dword ptr [esp + 0x24], 0
        pc = 89; continue;
      case 89: // 84347b
        R.ebx = (R.m.u32(((R.esp + 0xb8) | 0) >>> 0)) | 0; // 84347b: mov ebx, dword ptr [esp + 0xb8]
        R.ecx = (R.m.u32(((R.esp + 0xbc) | 0) >>> 0)) | 0; // 843482: mov ecx, dword ptr [esp + 0xbc]
        R.push(0x1); // 843489: push 1
        R.eax = (((R.esp + 0x2c) | 0)) | 0; // 84348b: lea eax, [esp + 0x2c]
        R.push((R.edi >>> 0)); // 84348f: push edi
        R.push((R.eax >>> 0)); // 843490: push eax
        R.push((R.esi >>> 0)); // 843491: push esi
        R.push((R.ebx >>> 0)); // 843492: push ebx
        R.push((R.ecx >>> 0)); // 843493: push ecx
        R.ecx = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 843494: mov ecx, dword ptr [esp + 0x34]
        R.call(0x840d80, { n: 6, thisEcx: true, calleeClean: true }); // 843498: call 0x840d80
        R.ebp = ((R.eax >>> 0)) | 0; // 84349d: mov ebp, eax
        R.eax = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 84349f: mov eax, dword ptr [esp + 0x10]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8434a3: test eax, eax
        if (R.zf) { pc = 101; continue; } // 8434a5: je 0x84357d
        pc = 90; continue;
      default: return pc;
    }
  }
}
function f_842e10_12(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 90: // 8434ab
        R.ecx = (R.m.u32(((0xae2a38) | 0) >>> 0)) | 0; // 8434ab: mov ecx, dword ptr [0xae2a38]
        R.edi = ((R.eax >>> 0)) | 0; // 8434b1: mov edi, eax
        R.push((R.edi >>> 0)); // 8434b3: push edi
        R.call(0x5a0590, { n: 1, thisEcx: true, calleeClean: true }); // 8434b4: call 0x5a0590
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8434b9: test eax, eax
        if (R.zf) { pc = 97; continue; } // 8434bb: je 0x84351c
        pc = 91; continue;
      case 91: // 8434bd
        R.ecx = (R.m.u32(((0xae2a38) | 0) >>> 0)) | 0; // 8434bd: mov ecx, dword ptr [0xae2a38]
        R.push((R.edi >>> 0)); // 8434c3: push edi
        R.call(0x5a0590, { n: 1, thisEcx: true, calleeClean: true }); // 8434c4: call 0x5a0590
        R.sub(R.m.u8(((R.eax + 0x165) | 0) >>> 0), 0x1, 8); // 8434c9: cmp byte ptr [eax + 0x165], 1
        if (!R.zf) { pc = 97; continue; } // 8434d0: jne 0x84351c
        pc = 92; continue;
      case 92: // 8434d2
        R.push(0x0); // 8434d2: push 0
        R.push(0x0); // 8434d4: push 0
        R.push(0x1); // 8434d6: push 1
        R.push(0x0); // 8434d8: push 0
        R.push((R.edi >>> 0)); // 8434da: push edi
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 8434db: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8434e0: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8434e3: test eax, eax
        if (R.zf) { pc = 95; continue; } // 8434e5: je 0x843513
        pc = 93; continue;
      case 93: // 8434e7
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8434e7: mov ecx, dword ptr [0xae1050]
        R.push(0x0); // 8434ed: push 0
        R.push(0xffffffff); // 8434ef: push -1
        R.push(0x0); // 8434f1: push 0
        R.push((R.edi >>> 0)); // 8434f3: push edi
        R.push((R.ebx >>> 0)); // 8434f4: push ebx
        R.call(0x4d0c60, { n: 5, thisEcx: false, calleeClean: true }); // 8434f5: call 0x4d0c60
        R.sub((R.ebp >>> 0), (R.eax >>> 0), 32); // 8434fa: cmp ebp, eax
        if (R.cL) { pc = 97; continue; } // 8434fc: jl 0x84351c
        pc = 94; continue;
      case 94: // 8434fe
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8434fe: mov ecx, dword ptr [0xae1050]
        R.push(0x0); // 843504: push 0
        R.push(0xffffffff); // 843506: push -1
        R.push(0x0); // 843508: push 0
        R.push((R.edi >>> 0)); // 84350a: push edi
        R.push((R.ebx >>> 0)); // 84350b: push ebx
        R.call(0x4d0c60, { n: 5, thisEcx: false, calleeClean: true }); // 84350c: call 0x4d0c60
        pc = 96; continue; // 843511: jmp 0x84351a
      case 95: // 843513
        R.eax = (R.m.u32(((R.ebx + 0x52) | 0) >>> 0)) | 0; // 843513: mov eax, dword ptr [ebx + 0x52]
        R.sub((R.ebp >>> 0), (R.eax >>> 0), 32); // 843516: cmp ebp, eax
        if (R.cL) { pc = 97; continue; } // 843518: jl 0x84351c
        pc = 96; continue;
      case 96: // 84351a
        R.ebp = ((R.eax >>> 0)) | 0; // 84351a: mov ebp, eax
        pc = 97; continue;
      case 97: // 84351c
        R.eax = (R.m.u32(((R.esp + 0x2c) | 0) >>> 0)) | 0; // 84351c: mov eax, dword ptr [esp + 0x2c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 843520: test eax, eax
        if (!R.zf) { pc = 101; continue; } // 843522: jne 0x84357d
        pc = 98; continue;
      default: return pc;
    }
  }
}
function f_842e10_13(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 98: // 843524
        R.edx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 843524: mov edx, dword ptr [esp + 0x10]
        R.push(0x0); // 843528: push 0
        R.push(0x0); // 84352a: push 0
        R.push(0x1); // 84352c: push 1
        R.push(0x0); // 84352e: push 0
        R.push((R.edx >>> 0)); // 843530: push edx
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 843531: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 843536: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 843539: test eax, eax
        if (R.zf) { pc = 100; continue; } // 84353b: je 0x84355a
        pc = 99; continue;
      case 99: // 84353d
        R.eax = (R.m.u32(((R.esp + 0xbc) | 0) >>> 0)) | 0; // 84353d: mov eax, dword ptr [esp + 0xbc]
        R.ecx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 843544: mov ecx, dword ptr [esp + 0x10]
        R.push((R.ebx >>> 0)); // 843548: push ebx
        R.push((R.eax >>> 0)); // 843549: push eax
        R.push((R.ecx >>> 0)); // 84354a: push ecx
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 84354b: mov ecx, dword ptr [0xae1050]
        R.call(0x4d42d0, { n: 3, thisEcx: true, calleeClean: true }); // 843551: call 0x4d42d0
        R.edi = ((R.eax >>> 0)) | 0; // 843556: mov edi, eax
        pc = 102; continue; // 843558: jmp 0x84357f
      case 100: // 84355a
        R.edx = (R.m.u32(((R.esp + 0xbc) | 0) >>> 0)) | 0; // 84355a: mov edx, dword ptr [esp + 0xbc]
        R.eax = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 843561: mov eax, dword ptr [esp + 0x10]
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 843565: mov ecx, dword ptr [0xae1050]
        R.push(0x1); // 84356b: push 1
        R.push(0x1); // 84356d: push 1
        R.push(0x0); // 84356f: push 0
        R.push((R.ebx >>> 0)); // 843571: push ebx
        R.push((R.edx >>> 0)); // 843572: push edx
        R.push((R.eax >>> 0)); // 843573: push eax
        R.call(0x4d1600, { n: 6, thisEcx: true, calleeClean: true }); // 843574: call 0x4d1600
        R.edi = ((R.eax >>> 0)) | 0; // 843579: mov edi, eax
        pc = 102; continue; // 84357b: jmp 0x84357f
      case 101: // 84357d
        R.edi = (R.logic((R.edi >>> 0) ^ (R.edi >>> 0), 32)) | 0; // 84357d: xor edi, edi
        pc = 102; continue;
      case 102: // 84357f
        R.eax = (R.m.u32(((R.esp + 0x54) | 0) >>> 0)) | 0; // 84357f: mov eax, dword ptr [esp + 0x54]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 843583: test eax, eax
        if (R.zf) { pc = 106; continue; } // 843585: je 0x843595
        pc = 103; continue;
      case 103: // 843587
        R.ecx = (R.m.u32(((R.esp + 0x2c) | 0) >>> 0)) | 0; // 843587: mov ecx, dword ptr [esp + 0x2c]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 84358b: test ecx, ecx
        if (R.zf) { pc = 106; continue; } // 84358d: je 0x843595
        pc = 104; continue;
      case 104: // 84358f
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 84358f: cmp eax, edi
        if (!R.cL) { pc = 106; continue; } // 843591: jge 0x843595
        pc = 105; continue;
      case 105: // 843593
        R.edi = ((R.eax >>> 0)) | 0; // 843593: mov edi, eax
        pc = 106; continue;
      case 106: // 843595
        R.eax = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 843595: mov eax, dword ptr [esp + 0x10]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 843599: test eax, eax
        if (R.zf) { pc = 111; continue; } // 84359b: je 0x8435de
        pc = 107; continue;
      default: return pc;
    }
  }
}
function f_842e10_14(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 107: // 84359d
        R.eax = (R.m.u32(((R.esp + 0x2c) | 0) >>> 0)) | 0; // 84359d: mov eax, dword ptr [esp + 0x2c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8435a1: test eax, eax
        if (!R.zf) { pc = 111; continue; } // 8435a3: jne 0x8435de
        pc = 108; continue;
      case 108: // 8435a5
        R.eax = ((R.edi >>> 0)) | 0; // 8435a5: mov eax, edi
        R.ecx = (R.m.u32(((R.esp + 0xbc) | 0) >>> 0)) | 0; // 8435a7: mov ecx, dword ptr [esp + 0xbc]
        R.edx = R.eax < 0 ? -1 : 0; // 8435ae: cdq 
        R.push(0x0); // 8435af: push 0
        R.push((R.edx >>> 0)); // 8435b1: push edx
        R.push((R.eax >>> 0)); // 8435b2: push eax
        R.eax = ((R.ebp >>> 0)) | 0; // 8435b3: mov eax, ebp
        R.edx = R.eax < 0 ? -1 : 0; // 8435b5: cdq 
        R.push((R.ecx >>> 0)); // 8435b6: push ecx
        R.ecx = (R.m.u32(((R.esp + 0x2c) | 0) >>> 0)) | 0; // 8435b7: mov ecx, dword ptr [esp + 0x2c]
        R.push((R.edx >>> 0)); // 8435bb: push edx
        R.edx = (R.m.u32(((R.esp + 0x24) | 0) >>> 0)) | 0; // 8435bc: mov edx, dword ptr [esp + 0x24]
        R.push((R.eax >>> 0)); // 8435c0: push eax
        R.push((R.ebx >>> 0)); // 8435c1: push ebx
        R.push((R.edx >>> 0)); // 8435c2: push edx
        R.call(0x84af00, { n: 8, thisEcx: false, calleeClean: true }); // 8435c3: call 0x84af00
        R.sub(((R.eax >>> 0) & 0xff), 0x2, 8); // 8435c8: cmp al, 2
        if (!R.zf) { pc = 111; continue; } // 8435ca: jne 0x8435de
        pc = 109; continue;
      case 109: // 8435cc
        R.eax = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 8435cc: mov eax, dword ptr [esp + 0x34]
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 8435d0: cmp eax, -1
        if (R.zf) { pc = 126; continue; } // 8435d3: je 0x8436cf
        pc = 110; continue;
      case 110: // 8435d9
        pc = 125; continue; // 8435d9: jmp 0x8436cc
      case 111: // 8435de
        R.edi = (R.sub((R.edi >>> 0), (R.ebp >>> 0), 32)) | 0; // 8435de: sub edi, ebp
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.edi >>> 0)); // 8435e0: mov dword ptr [esp + 0x18], edi
        R.fpush(R.m.s32(((R.esp + 0x18) | 0) >>> 0)); // 8435e4: fild dword ptr [esp + 0x18]
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 8435e8: fild dword ptr [esp + 0x20]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x38) | 0)); // 8435ec: fmul qword ptr [esp + 0x38]
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 8435f0: fdivp st(1)
        R.st[0] = 1.0 - R.st[0]; // 8435f2: fsubr qword ptr [0x967890]
        R.fpush(0.01); // 8435f8: fld qword ptr [0x967898]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 8435fe: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 843600: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 843602: test ah, 0x41
        if (!R.zf) { pc = 113; continue; } // 843605: jne 0x843611
        pc = 112; continue;
      case 112: // 843607
        R.fpop(); // 843607: fstp st(0)
        R.fpush(0.01); // 843609: fld qword ptr [0x967898]
        pc = 117; continue; // 84360f: jmp 0x843643
      case 113: // 843611
        R.fpush(3.0); // 843611: fld qword ptr [0x968930]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 843617: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 843619: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 84361b: test ah, 1
        if (R.zf) { pc = 115; continue; } // 84361e: je 0x84362a
        pc = 114; continue;
      default: return pc;
    }
  }
}
function f_842e10_15(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 114: // 843620
        R.fpop(); // 843620: fstp st(0)
        R.fpush(3.0); // 843622: fld qword ptr [0x968930]
        pc = 116; continue; // 843628: jmp 0x843637
      case 115: // 84362a
        R.fcom(R.st[0], 1.0); // 84362a: fcom qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 843630: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 843632: test ah, 0x41
        if (!R.zf) { pc = 117; continue; } // 843635: jne 0x843643
        pc = 116; continue;
      case 116: // 843637
        R.st[0] = R.st[0] * 0.3333333333333333; // 843637: fmul qword ptr [0x968a80]
        R.st[0] = R.st[0] + 0.67; // 84363d: fadd qword ptr [0x968f80]
        pc = 117; continue;
      case 117: // 843643
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 843643: fild dword ptr [esp + 0x28]
        R.st[0] = R.st[0] * R.st[1]; // 843647: fmul st(1)
        R.ftol(); // 843649: call 0x945640
        R.ecx = (R.m.u32(((0xb63d28) | 0) >>> 0)) | 0; // 84364e: mov ecx, dword ptr [0xb63d28]
        R.push((R.ebx >>> 0)); // 843654: push ebx
        R.fpop(); // 843655: fstp st(0)
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.eax >>> 0)); // 843657: mov dword ptr [esp + 0x2c], eax
        R.call(0x62ed70, { n: 1, thisEcx: true, calleeClean: true }); // 84365b: call 0x62ed70
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 843660: test eax, eax
        if (R.zf) { pc = 120; continue; } // 843662: je 0x84367d
        pc = 118; continue;
      case 118: // 843664
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.eax + 0x2c) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 843664: mov ax, word ptr [eax + 0x2c]
        R.sub(((R.eax >>> 0) & 0xffff), 0xf, 16); // 843668: cmp ax, 0xf
        if (R.cLE) { pc = 120; continue; } // 84366c: jle 0x84367d
        pc = 119; continue;
      case 119: // 84366e
        R.eax = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 84366e: movsx eax, ax
        R.eax = (R.add((R.eax >>> 0), 0xfffffff1, 32)) | 0; // 843671: add eax, -0xf
        R.ecx = ((R.eax >>> 0)) | 0; // 843674: mov ecx, eax
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 843676: imul ecx, eax
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, R.sub(R.m.u32(((R.esp + 0x28) | 0) >>> 0), (R.ecx >>> 0), 32)); // 843679: sub dword ptr [esp + 0x28], ecx
        pc = 120; continue;
      case 120: // 84367d
        R.edx = (R.m.u32(((R.esp + 0x28) | 0) >>> 0)) | 0; // 84367d: mov edx, dword ptr [esp + 0x28]
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 843681: mov eax, dword ptr [esp + 0x14]
        R.sub((R.edx >>> 0), (R.eax >>> 0), 32); // 843685: cmp edx, eax
        if (!R.cL) { pc = 123; continue; } // 843687: jge 0x843694
        pc = 121; continue;
      case 121: // 843689
        R.eax = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 843689: mov eax, dword ptr [esp + 0x34]
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 84368d: cmp eax, -1
        if (R.zf) { pc = 126; continue; } // 843690: je 0x8436cf
        pc = 122; continue;
      case 122: // 843692
        pc = 125; continue; // 843692: jmp 0x8436cc
      default: return pc;
    }
  }
}
function f_842e10_16(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 123: // 843694
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 843694: mov al, byte ptr [esi + 0x24]
        R.edi = (R.m.u32(((R.esp + 0xbc) | 0) >>> 0)) | 0; // 843697: mov edi, dword ptr [esp + 0xbc]
        R.ebp = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 84369e: mov ebp, dword ptr [esp + 0x1c]
        R.push(0x0); // 8436a2: push 0
        R.eax = ((R.eax & 0xffffff00) | (((R.shr(((R.eax >>> 0) & 0xff), 0x1, 8)) & 0xff) << 0)) | 0; // 8436a4: shr al, 1
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf, 8)) & 0xff) << 0)) | 0; // 8436a6: and al, 0xf
        R.ecx = ((R.ebp >>> 0)) | 0; // 8436a8: mov ecx, ebp
        R.push((R.eax >>> 0)); // 8436aa: push eax
        R.push(0x0); // 8436ab: push 0
        R.push(0x1); // 8436ad: push 1
        R.push((R.edi >>> 0)); // 8436af: push edi
        R.push((R.ebx >>> 0)); // 8436b0: push ebx
        R.call(0x846920, { n: 6, thisEcx: true, calleeClean: true, float: true }); // 8436b1: call 0x846920
        R.fcom(R.st[0], 3.15); R.fpop(); // 8436b6: fcomp qword ptr [0x968e58]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8436bc: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8436be: test ah, 1
        if (R.zf) { pc = 129; continue; } // 8436c1: je 0x843701
        pc = 124; continue;
      case 124: // 8436c3
        R.eax = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 8436c3: mov eax, dword ptr [esp + 0x34]
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 8436c7: cmp eax, -1
        if (R.zf) { pc = 126; continue; } // 8436ca: je 0x8436cf
        pc = 125; continue;
      case 125: // 8436cc
        R.m.w32(((R.esi + 0x7) | 0) >>> 0, (R.eax >>> 0)); // 8436cc: mov dword ptr [esi + 7], eax
        pc = 126; continue;
      case 126: // 8436cf
        R.eax = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 8436cf: mov eax, dword ptr [esp + 0x30]
        R.esi = (R.add((R.esi >>> 0), 0x25, 32)) | 0; // 8436d3: add esi, 0x25
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 8436d6: inc eax
        R.sub((R.eax >>> 0), 0x28, 32); // 8436d7: cmp eax, 0x28
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.eax >>> 0)); // 8436da: mov dword ptr [esp + 0x30], eax
        if (R.cL) { pc = 30; continue; } // 8436de: jl 0x843063
        pc = 127; continue;
      case 127: // 8436e4
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8436e4: xor eax, eax
        pc = 128; continue;
      case 128: // 8436e6
        R.ecx = (R.m.u32(((R.esp + 0xa8) | 0) >>> 0)) | 0; // 8436e6: mov ecx, dword ptr [esp + 0xa8]
        R.edi = (R.pop()) | 0; // 8436ed: pop edi
        R.esi = (R.pop()) | 0; // 8436ee: pop esi
        R.ebp = (R.pop()) | 0; // 8436ef: pop ebp
        R.ebx = (R.pop()) | 0; // 8436f0: pop ebx
        /* fs */ // 8436f1: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0xa4, 32)) | 0; // 8436f8: add esp, 0xa4
        R.rv = R.ret(3); return -1; // 8436fe: ret 0xc
      case 129: // 843701
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 843701: mov al, byte ptr [esi + 0x24]
        R.logic(((R.eax >>> 0) & 0xff) & 0x1, 8); // 843704: test al, 1
        if (!R.zf) { pc = 136; continue; } // 843706: jne 0x8437c7
        pc = 130; continue;
      default: return pc;
    }
  }
}
function f_842e10_17(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 130: // 84370c
        R.eax = ((R.eax & 0xffffff00) | (((R.shr(((R.eax >>> 0) & 0xff), 0x1, 8)) & 0xff) << 0)) | 0; // 84370c: shr al, 1
        R.push(0x0); // 84370e: push 0
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf, 8)) & 0xff) << 0)) | 0; // 843710: and al, 0xf
        R.push(0xb); // 843712: push 0xb
        R.push((R.eax >>> 0)); // 843714: push eax
        R.push(0x0); // 843715: push 0
        R.push((R.edi >>> 0)); // 843717: push edi
        R.push((R.ebx >>> 0)); // 843718: push ebx
        R.ecx = (((R.esp + 0x70) | 0)) | 0; // 843719: lea ecx, [esp + 0x70]
        R.call(0x864550, { n: 6, thisEcx: false, calleeClean: true, float: true }); // 84371d: call 0x864550
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esi + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 843722: mov cl, byte ptr [esi + 0x24]
        R.push(0x0); // 843725: push 0
        R.m.wf32(((R.esp + 0x1c) | 0) >>> 0, R.st[0]); R.fpop(); // 843727: fstp dword ptr [esp + 0x1c]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.shr(((R.ecx >>> 0) & 0xff), 0x1, 8)) & 0xff) << 0)) | 0; // 84372b: shr cl, 1
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0xf, 8)) & 0xff) << 0)) | 0; // 84372d: and cl, 0xf
        R.push((R.ecx >>> 0)); // 843730: push ecx
        R.push(0x0); // 843731: push 0
        R.push(0x0); // 843733: push 0
        R.push((R.edi >>> 0)); // 843735: push edi
        R.push((R.ebx >>> 0)); // 843736: push ebx
        R.ecx = ((R.ebp >>> 0)) | 0; // 843737: mov ecx, ebp
        R.call(0x846920, { n: 6, thisEcx: true, calleeClean: true, float: true }); // 843739: call 0x846920
        R.fcom(R.st[0], 0.1); R.fpop(); // 84373e: fcomp qword ptr [0x967880]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 843744: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 843746: test ah, 1
        if (R.zf) { pc = 132; continue; } // 843749: je 0x843753
        pc = 131; continue;
      case 131: // 84374b
        R.fpush(0.1); // 84374b: fld qword ptr [0x967880]
        pc = 133; continue; // 843751: jmp 0x84376b
      case 132: // 843753
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.esi + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 843753: mov dl, byte ptr [esi + 0x24]
        R.push(0x0); // 843756: push 0
        R.edx = ((R.edx & 0xffffff00) | (((R.shr(((R.edx >>> 0) & 0xff), 0x1, 8)) & 0xff) << 0)) | 0; // 843758: shr dl, 1
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) & 0xf, 8)) & 0xff) << 0)) | 0; // 84375a: and dl, 0xf
        R.ecx = ((R.ebp >>> 0)) | 0; // 84375d: mov ecx, ebp
        R.push((R.edx >>> 0)); // 84375f: push edx
        R.push(0x0); // 843760: push 0
        R.push(0x0); // 843762: push 0
        R.push((R.edi >>> 0)); // 843764: push edi
        R.push((R.ebx >>> 0)); // 843765: push ebx
        R.call(0x846920, { n: 6, thisEcx: true, calleeClean: true, float: true }); // 843766: call 0x846920
        pc = 133; continue;
      case 133: // 84376b
        R.st[0] = 3.5 / R.st[0]; // 84376b: fdivr qword ptr [0x968e38]
        R.fcom(R.st[0], 0.9); // 843771: fcom qword ptr [0x9689d8]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 843777: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 843779: test ah, 1
        if (R.zf) { pc = 135; continue; } // 84377c: je 0x843786
        pc = 134; continue;
      case 134: // 84377e
        R.fpop(); // 84377e: fstp st(0)
        R.fpush(0.8999999761581421); // 843780: fld dword ptr [0x96a32c]
        pc = 135; continue;
      default: return pc;
    }
  }
}
function f_842e10_18(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 135: // 843786
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 843786: mov al, byte ptr [esi + 0x24]
        R.ecx = (R.m.u32(((0xae2a38) | 0) >>> 0)) | 0; // 843789: mov ecx, dword ptr [0xae2a38]
        R.st[0] = R.st[0] * R.f32(((R.esp + 0x18) | 0)); // 84378f: fmul dword ptr [esp + 0x18]
        R.eax = ((R.eax & 0xffffff00) | (((R.shr(((R.eax >>> 0) & 0xff), 0x1, 8)) & 0xff) << 0)) | 0; // 843793: shr al, 1
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf, 8)) & 0xff) << 0)) | 0; // 843795: and al, 0xf
        R.push((R.eax >>> 0)); // 843797: push eax
        R.push((R.ebx >>> 0)); // 843798: push ebx
        R.m.wf64(((R.esp + 0x50) | 0) >>> 0, R.st[0]); R.fpop(); // 843799: fstp qword ptr [esp + 0x50]
        R.push((R.edi >>> 0)); // 84379d: push edi
        R.call(0x5a0590, { n: 1, thisEcx: true, calleeClean: true }); // 84379e: call 0x5a0590
        R.ecx = ((R.eax >>> 0)) | 0; // 8437a3: mov ecx, eax
        R.call(0x5968d0, { n: 2, thisEcx: true, calleeClean: true }); // 8437a5: call 0x5968d0
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.eax >>> 0)); // 8437aa: mov dword ptr [esp + 0x18], eax
        R.fpush(R.m.s32(((R.esp + 0x18) | 0) >>> 0)); // 8437ae: fild dword ptr [esp + 0x18]
        R.st[0] = R.st[0] * 1.2; // 8437b2: fmul qword ptr [0x968978]
        R.fcom(R.st[0], R.f64(((R.esp + 0x48) | 0))); R.fpop(); // 8437b8: fcomp qword ptr [esp + 0x48]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8437bc: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8437be: test ah, 1
        if (!R.zf) { pc = 127; continue; } // 8437c1: jne 0x8436e4
        pc = 136; continue;
      case 136: // 8437c7
        R.eax = (R.m.u32(((R.esp + 0x24) | 0) >>> 0)) | 0; // 8437c7: mov eax, dword ptr [esp + 0x24]
        R.ecx = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 8437cb: mov ecx, dword ptr [ebx]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8437cd: test eax, eax
        R.m.w32(((R.esi + 0xf) | 0) >>> 0, (R.ecx >>> 0)); // 8437cf: mov dword ptr [esi + 0xf], ecx
        if (R.zf) { pc = 138; continue; } // 8437d2: je 0x8437e1
        pc = 137; continue;
      case 137: // 8437d4
        R.push(0x0); // 8437d4: push 0
        R.push(0x3); // 8437d6: push 3
        R.push((R.edi >>> 0)); // 8437d8: push edi
        R.push((R.eax >>> 0)); // 8437d9: push eax
        R.ecx = ((R.ebp >>> 0)) | 0; // 8437da: mov ecx, ebp
        R.call(0x843e10, { n: 4, thisEcx: true, calleeClean: true }); // 8437dc: call 0x843e10
        pc = 138; continue;
      case 138: // 8437e1
        R.push((R.edi >>> 0)); // 8437e1: push edi
        R.push((R.ebx >>> 0)); // 8437e2: push ebx
        R.ecx = ((R.ebp >>> 0)) | 0; // 8437e3: mov ecx, ebp
        R.call(0x8423f0, { n: 2, thisEcx: true, calleeClean: true }); // 8437e5: call 0x8423f0
        R.eax = (0x1) | 0; // 8437ea: mov eax, 1
        pc = 128; continue; // 8437ef: jmp 0x8436e6
      default: return pc;
    }
  }
}
export function f_842e10(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 139) throw new Error(`f_842e10: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_842e10_0(R, pc); break;
      case 1: np = f_842e10_1(R, pc); break;
      case 2: np = f_842e10_2(R, pc); break;
      case 3: np = f_842e10_3(R, pc); break;
      case 4: np = f_842e10_4(R, pc); break;
      case 5: np = f_842e10_5(R, pc); break;
      case 6: np = f_842e10_6(R, pc); break;
      case 7: np = f_842e10_7(R, pc); break;
      case 8: np = f_842e10_8(R, pc); break;
      case 9: np = f_842e10_9(R, pc); break;
      case 10: np = f_842e10_10(R, pc); break;
      case 11: np = f_842e10_11(R, pc); break;
      case 12: np = f_842e10_12(R, pc); break;
      case 13: np = f_842e10_13(R, pc); break;
      case 14: np = f_842e10_14(R, pc); break;
      case 15: np = f_842e10_15(R, pc); break;
      case 16: np = f_842e10_16(R, pc); break;
      case 17: np = f_842e10_17(R, pc); break;
      case 18: np = f_842e10_18(R, pc); break;
      default: throw new Error(`f_842e10: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_842e10: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_842e10.shared = true;
