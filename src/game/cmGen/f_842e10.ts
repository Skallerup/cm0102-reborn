// 0x842e10 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4cf5a0=1c, 4d0c60=5c, 4d1600=6tc, 4d42d0=3tc, 53ca90=1, 5407e0=0, 5444a0=2, 5968d0=2tc, 598800=5tc, 5a0590=1tc, 5fd210=1c, 5fea50=2c, 600a50=5, 62ed70=1tc, 7f7490=2tc, 840d80=6tc, 8423f0=2tc, 843e10=4tc, 846920=6tcf, 84af00=8c, 84b180=3c, 84b6f0=4c, 85e410=0t, 864550=6cf, 8c7560=3tc, 8ce990=4tc, 946464=5
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_842e10(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x842e10;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x842e10:
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
        if (!R.zf) { pc = 0x8436e4; continue; } // 842e62: jne 0x8436e4
        pc = 0x842e68; continue;
      case 0x842e68:
        R.push((R.esi >>> 0)); // 842e68: push esi
        R.push((R.esi >>> 0)); // 842e69: push esi
        R.push(0x1); // 842e6a: push 1
        R.push(0x1); // 842e6c: push 1
        R.push((R.edi >>> 0)); // 842e6e: push edi
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 842e6f: call 0x600a50
        R.ebx = (R.m.u32(((R.esp + 0xcc) | 0) >>> 0)) | 0; // 842e74: mov ebx, dword ptr [esp + 0xcc]
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 842e7b: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 842e7e: test eax, eax
        if (R.zf) { pc = 0x842eff; continue; } // 842e80: je 0x842eff
        pc = 0x842e82; continue;
      case 0x842e82:
        R.push((R.edi >>> 0)); // 842e82: push edi
        R.call(0x53ca90, { n: 1, thisEcx: false, calleeClean: false }); // 842e83: call 0x53ca90
        R.ecx = (R.m.u32(((0xb63c98) | 0) >>> 0)) | 0; // 842e88: mov ecx, dword ptr [0xb63c98]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 842e8e: add esp, 4
        R.push((R.eax >>> 0)); // 842e91: push eax
        R.call(0x5fd210, { n: 1, thisEcx: false, calleeClean: true }); // 842e92: call 0x5fd210
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 842e97: test eax, eax
        if (R.zf) { pc = 0x842eff; continue; } // 842e99: je 0x842eff
        pc = 0x842e9b; continue;
      case 0x842e9b:
        R.push((R.edi >>> 0)); // 842e9b: push edi
        R.call(0x53ca90, { n: 1, thisEcx: false, calleeClean: false }); // 842e9c: call 0x53ca90
        R.ecx = (R.m.u32(((0xb74448) | 0) >>> 0)) | 0; // 842ea1: mov ecx, dword ptr [0xb74448]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 842ea7: add esp, 4
        R.push((R.eax >>> 0)); // 842eaa: push eax
        R.push((R.ebx >>> 0)); // 842eab: push ebx
        R.call(0x7f7490, { n: 2, thisEcx: true, calleeClean: true }); // 842eac: call 0x7f7490
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 842eb1: test eax, eax
        if (R.zf) { pc = 0x842ebd; continue; } // 842eb3: je 0x842ebd
        pc = 0x842eb5; continue;
      case 0x842eb5:
        R.m.w32(((R.esp + 0x40) | 0) >>> 0, 0x1); // 842eb5: mov dword ptr [esp + 0x40], 1
        pc = 0x842ebd; continue;
      case 0x842ebd:
        R.push((R.edi >>> 0)); // 842ebd: push edi
        R.call(0x53ca90, { n: 1, thisEcx: false, calleeClean: false }); // 842ebe: call 0x53ca90
        R.ecx = (R.m.u32(((0xb63c98) | 0) >>> 0)) | 0; // 842ec3: mov ecx, dword ptr [0xb63c98]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 842ec9: add esp, 4
        R.push((R.eax >>> 0)); // 842ecc: push eax
        R.push(0x4); // 842ecd: push 4
        R.call(0x5fea50, { n: 2, thisEcx: false, calleeClean: true }); // 842ecf: call 0x5fea50
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 842ed4: movsx eax, al
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 842ed7: dec eax
        if (R.zf) { pc = 0x8436e4; continue; } // 842ed8: je 0x8436e4
        pc = 0x842ede; continue;
      case 0x842ede:
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 842ede: dec eax
        if (!R.zf) { pc = 0x842eff; continue; } // 842edf: jne 0x842eff
        pc = 0x842ee1; continue;
      case 0x842ee1:
        R.push((R.edi >>> 0)); // 842ee1: push edi
        R.call(0x53ca90, { n: 1, thisEcx: false, calleeClean: false }); // 842ee2: call 0x53ca90
        R.ecx = (R.m.u32(((0xb74448) | 0) >>> 0)) | 0; // 842ee7: mov ecx, dword ptr [0xb74448]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 842eed: add esp, 4
        R.push((R.eax >>> 0)); // 842ef0: push eax
        R.push((R.ebx >>> 0)); // 842ef1: push ebx
        R.call(0x7f7490, { n: 2, thisEcx: true, calleeClean: true }); // 842ef2: call 0x7f7490
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 842ef7: test eax, eax
        if (R.zf) { pc = 0x8436e4; continue; } // 842ef9: je 0x8436e4
        pc = 0x842eff; continue;
      case 0x842eff:
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 842eff: mov eax, dword ptr [edi]
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 842f01: mov ecx, dword ptr [0xae1050]
        R.push((R.ebx >>> 0)); // 842f07: push ebx
        R.esi = (((R.eax + R.eax * 8) | 0)) | 0; // 842f08: lea esi, [eax + eax*8]
        R.eax = (R.m.u32(((R.ebp + 0xdc) | 0) >>> 0)) | 0; // 842f0b: mov eax, dword ptr [ebp + 0xdc]
        R.esi = (R.add((R.esi >>> 0), (R.eax >>> 0), 32)) | 0; // 842f11: add esi, eax
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 842f13: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 842f18: test eax, eax
        R.m.w32(((R.esp + 0x50) | 0) >>> 0, (R.eax >>> 0)); // 842f1a: mov dword ptr [esp + 0x50], eax
        if (R.zf) { pc = 0x842f3c; continue; } // 842f1e: je 0x842f3c
        pc = 0x842f20; continue;
      case 0x842f20:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 842f20: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 842f23: mov edx, dword ptr [0xae23b4]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 842f29: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 842f2c: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 842f2f: add ecx, eax
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 842f31: add edx, eax
        R.eax = (((R.edx + R.ecx * 4) | 0)) | 0; // 842f33: lea eax, [edx + ecx*4]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 842f36: mov dword ptr [esp + 0x10], eax
        pc = 0x842f44; continue; // 842f3a: jmp 0x842f44
      case 0x842f3c:
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, 0x0); // 842f3c: mov dword ptr [esp + 0x10], 0
        pc = 0x842f44; continue;
      case 0x842f44:
        R.sub(R.m.u8(((R.esi + 0x4) | 0) >>> 0), 0x1, 8); // 842f44: cmp byte ptr [esi + 4], 1
        if (!R.zf) { pc = 0x8436e4; continue; } // 842f48: jne 0x8436e4
        pc = 0x842f4e; continue;
      case 0x842f4e:
        R.sub(R.m.u8(((R.esi + 0x8) | 0) >>> 0), 0x64, 8); // 842f4e: cmp byte ptr [esi + 8], 0x64
        if (!R.cf) { pc = 0x8436e4; continue; } // 842f52: jae 0x8436e4
        pc = 0x842f58; continue;
      case 0x842f58:
        R.eax = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 842f58: mov eax, dword ptr [ebp]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 842f5b: test eax, eax
        if (R.zf) { pc = 0x842fa0; continue; } // 842f5d: je 0x842fa0
        pc = 0x842f5f; continue;
      case 0x842f5f:
        R.ecx = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 842f5f: mov ecx, dword ptr [ebx]
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 842f61: test edi, edi
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.ecx >>> 0)); // 842f63: mov dword ptr [esp + 0x38], ecx
        if (R.zf) { pc = 0x842f71; continue; } // 842f67: je 0x842f71
        pc = 0x842f69; continue;
      case 0x842f69:
        R.edx = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 842f69: mov edx, dword ptr [edi]
        R.m.w32(((R.esp + 0x3c) | 0) >>> 0, (R.edx >>> 0)); // 842f6b: mov dword ptr [esp + 0x3c], edx
        pc = 0x842f79; continue; // 842f6f: jmp 0x842f79
      case 0x842f71:
        R.m.w32(((R.esp + 0x3c) | 0) >>> 0, 0xffffffff); // 842f71: mov dword ptr [esp + 0x3c], 0xffffffff
        pc = 0x842f79; continue;
      case 0x842f79:
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
        if (R.zf) { pc = 0x842fa0; continue; } // 842f94: je 0x842fa0
        pc = 0x842f96; continue;
      case 0x842f96:
        R.eax = (0x1) | 0; // 842f96: mov eax, 1
        pc = 0x8436e6; continue; // 842f9b: jmp 0x8436e6
      case 0x842fa0:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 842fa0: mov ecx, dword ptr [0xae1050]
        R.push((R.ebx >>> 0)); // 842fa6: push ebx
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 842fa7: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 842fac: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 842fae: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x842fcd; continue; } // 842fb3: je 0x842fcd
        pc = 0x842fb5; continue;
      case 0x842fb5:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 842fb5: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 842fb8: mov edx, dword ptr [0xae23b4]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 842fbe: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 842fc1: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 842fc4: add ecx, eax
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 842fc6: add edx, eax
        R.eax = (((R.edx + R.ecx * 4) | 0)) | 0; // 842fc8: lea eax, [edx + ecx*4]
        pc = 0x842fcf; continue; // 842fcb: jmp 0x842fcf
      case 0x842fcd:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 842fcd: xor eax, eax
        pc = 0x842fcf; continue;
      case 0x842fcf:
        R.push((R.edi >>> 0)); // 842fcf: push edi
        R.push((R.eax >>> 0)); // 842fd0: push eax
        R.push((R.ebx >>> 0)); // 842fd1: push ebx
        R.ecx = ((R.ebp >>> 0)) | 0; // 842fd2: mov ecx, ebp
        R.call(0x84b180, { n: 3, thisEcx: false, calleeClean: true }); // 842fd4: call 0x84b180
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 842fd9: test al, al
        if (R.zf) { pc = 0x8436e4; continue; } // 842fdb: je 0x8436e4
        pc = 0x842fe1; continue;
      case 0x842fe1:
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 842fe1: mov ecx, dword ptr [0xde1f54]
        R.ebp = (R.logic((R.ebp >>> 0) ^ (R.ebp >>> 0), 32)) | 0; // 842fe7: xor ebp, ebp
        R.push((R.ebp >>> 0)); // 842fe9: push ebp
        R.push((R.ebp >>> 0)); // 842fea: push ebp
        R.push((R.edi >>> 0)); // 842feb: push edi
        R.push((R.ebx >>> 0)); // 842fec: push ebx
        R.call(0x8ce990, { n: 4, thisEcx: true, calleeClean: true }); // 842fed: call 0x8ce990
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 842ff2: test eax, eax
        if (R.zf) { pc = 0x8436e4; continue; } // 842ff4: je 0x8436e4
        pc = 0x842ffa; continue;
      case 0x842ffa:
        R.ecx = (R.m.u32(((0xae2a38) | 0) >>> 0)) | 0; // 842ffa: mov ecx, dword ptr [0xae2a38]
        R.push((R.edi >>> 0)); // 843000: push edi
        R.call(0x5a0590, { n: 1, thisEcx: true, calleeClean: true }); // 843001: call 0x5a0590
        R.sub((R.eax >>> 0), (R.ebp >>> 0), 32); // 843006: cmp eax, ebp
        if (R.zf) { pc = 0x8436e4; continue; } // 843008: je 0x8436e4
        pc = 0x84300e; continue;
      case 0x84300e:
        R.push((R.ebp >>> 0)); // 84300e: push ebp
        R.push(0x1); // 84300f: push 1
        R.push((R.ebp >>> 0)); // 843011: push ebp
        R.push((R.ebp >>> 0)); // 843012: push ebp
        R.push((R.ebp >>> 0)); // 843013: push ebp
        R.ecx = ((R.eax >>> 0)) | 0; // 843014: mov ecx, eax
        R.call(0x598800, { n: 5, thisEcx: true, calleeClean: true }); // 843016: call 0x598800
        R.sub((R.eax >>> 0), (R.ebp >>> 0), 32); // 84301b: cmp eax, ebp
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.eax >>> 0)); // 84301d: mov dword ptr [esp + 0x44], eax
        if (!R.cL) { pc = 0x843027; continue; } // 843021: jge 0x843027
        pc = 0x843023; continue;
      case 0x843023:
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.ebp >>> 0)); // 843023: mov dword ptr [esp + 0x44], ebp
        pc = 0x843027; continue;
      case 0x843027:
        R.eax = (((R.m.u16(((R.edi + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 843027: movsx eax, word ptr [edi + 0x80]
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.eax >>> 0)); // 84302e: mov dword ptr [esp + 0x30], eax
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 843032: fild dword ptr [esp + 0x30]
        R.st[0] = R.st[0] * 0.0008; // 843036: fmul qword ptr [0x96a618]
        R.m.wf64(((R.esp + 0x38) | 0) >>> 0, R.st[0]); // 84303c: fst qword ptr [esp + 0x38]
        R.fcom(R.st[0], 1.0); R.fpop(); // 843040: fcomp qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 843046: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 843048: test ah, 0x41
        if (R.zf) { pc = 0x84305d; continue; } // 84304b: je 0x84305d
        pc = 0x84304d; continue;
      case 0x84304d:
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, 0x0); // 84304d: mov dword ptr [esp + 0x38], 0
        R.m.w32(((R.esp + 0x3c) | 0) >>> 0, 0x3ff00000); // 843055: mov dword ptr [esp + 0x3c], 0x3ff00000
        pc = 0x84305d; continue;
      case 0x84305d:
        R.esi = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 84305d: mov esi, dword ptr [esi]
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.ebp >>> 0)); // 84305f: mov dword ptr [esp + 0x30], ebp
        pc = 0x843063; continue;
      case 0x843063:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 843063: mov al, byte ptr [esi + 0x24]
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, 0xffffffff); // 843066: mov dword ptr [esp + 0x34], 0xffffffff
        R.logic(((R.eax >>> 0) & 0xff) & 0x1, 8); // 84306e: test al, 1
        if (!R.zf) { pc = 0x8436cf; continue; } // 843070: jne 0x8436cf
        pc = 0x843076; continue;
      case 0x843076:
        R.sub(R.m.u8(((R.esi) | 0) >>> 0), 0xb, 8); // 843076: cmp byte ptr [esi], 0xb
        if (!R.zf) { pc = 0x8436cf; continue; } // 843079: jne 0x8436cf
        pc = 0x84307f; continue;
      case 0x84307f:
        R.sub(R.m.u32(((R.esi + 0x17) | 0) >>> 0), 0xffffffff, 32); // 84307f: cmp dword ptr [esi + 0x17], -1
        if (!R.zf) { pc = 0x8436cf; continue; } // 843083: jne 0x8436cf
        pc = 0x843089; continue;
      case 0x843089:
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.esi + 0x1) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 843089: mov ax, word ptr [esi + 1]
        R.logic(((R.eax >>> 0) & 0xffff) & ((R.eax >>> 0) & 0xffff), 16); // 84308d: test ax, ax
        if (R.zf) { pc = 0x8436cf; continue; } // 843090: je 0x8436cf
        pc = 0x843096; continue;
      case 0x843096:
        R.edi = (R.m.u32(((R.esp + 0xc0) | 0) >>> 0)) | 0; // 843096: mov edi, dword ptr [esp + 0xc0]
        R.ecx = ((R.eax >>> 0)) | 0; // 84309d: mov ecx, eax
        R.ecx = (R.logic((R.ecx >>> 0) & (R.edi >>> 0), 32)) | 0; // 84309f: and ecx, edi
        R.sub(((R.ecx >>> 0) & 0xffff), ((R.eax >>> 0) & 0xffff), 16); // 8430a1: cmp cx, ax
        if (!R.zf) { pc = 0x8436cf; continue; } // 8430a4: jne 0x8436cf
        pc = 0x8430aa; continue;
      case 0x8430aa:
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
        if (R.zf) { pc = 0x843153; continue; } // 8430cc: je 0x843153
        pc = 0x8430d2; continue;
      case 0x8430d2:
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8430d2: test eax, eax
        if (!R.zf) { pc = 0x843153; continue; } // 8430d4: jne 0x843153
        pc = 0x8430d6; continue;
      case 0x8430d6:
        R.sub(R.m.u16(((R.ebx + 0x80) | 0) >>> 0), 0x1b58, 16); // 8430d6: cmp word ptr [ebx + 0x80], 0x1b58
        if (!R.cL) { pc = 0x843153; continue; } // 8430df: jge 0x843153
        pc = 0x8430e1; continue;
      case 0x8430e1:
        R.fpush(R.m.s32(((R.esi + 0x7) | 0) >>> 0)); // 8430e1: fild dword ptr [esi + 7]
        R.eax = (R.m.u32(((R.esp + 0xb8) | 0) >>> 0)) | 0; // 8430e4: mov eax, dword ptr [esp + 0xb8]
        R.st[0] = R.st[0] * 1.3; // 8430eb: fmul qword ptr [0x968de8]
        R.fpush(R.m.s32(((R.eax + 0x52) | 0) >>> 0)); // 8430f1: fild dword ptr [eax + 0x52]
        R.fcom(R.st[0], R.st[1]); R.fpop(); R.fpop(); // 8430f4: fcompp 
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8430f6: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 8430f8: test ah, 0x41
        if (!R.zf) { pc = 0x843153; continue; } // 8430fb: jne 0x843153
        pc = 0x8430fd; continue;
      case 0x8430fd:
        R.eax = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 8430fd: mov eax, dword ptr [esp + 0x10]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 843101: test eax, eax
        if (R.zf) { pc = 0x8436cf; continue; } // 843103: je 0x8436cf
        pc = 0x843109; continue;
      case 0x843109:
        R.push(0x0); // 843109: push 0
        R.push(0x0); // 84310b: push 0
        R.push(0x1); // 84310d: push 1
        R.ecx = ((R.eax >>> 0)) | 0; // 84310f: mov ecx, eax
        R.push(0x0); // 843111: push 0
        R.push((R.ecx >>> 0)); // 843113: push ecx
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 843114: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 843119: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84311c: test eax, eax
        if (R.zf) { pc = 0x8436cf; continue; } // 84311e: je 0x8436cf
        pc = 0x843124; continue;
      case 0x843124:
        R.edx = (R.m.u32(((R.esp + 0xb8) | 0) >>> 0)) | 0; // 843124: mov edx, dword ptr [esp + 0xb8]
        R.ecx = (R.m.u32(((R.esi + 0x7) | 0) >>> 0)) | 0; // 84312b: mov ecx, dword ptr [esi + 7]
        R.eax = (R.m.u32(((R.edx + 0x52) | 0) >>> 0)) | 0; // 84312e: mov eax, dword ptr [edx + 0x52]
        R.eax = (R.sub((R.eax >>> 0), 0x16e360, 32)) | 0; // 843131: sub eax, 0x16e360
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 843136: cmp eax, ecx
        if (!R.cL) { pc = 0x8436cf; continue; } // 843138: jge 0x8436cf
        pc = 0x84313e; continue;
      case 0x84313e:
        R.ecx = ((R.edx >>> 0)) | 0; // 84313e: mov ecx, edx
        R.push(0x0); // 843140: push 0
        R.push((R.ecx >>> 0)); // 843142: push ecx
        R.call(0x5444a0, { n: 2, thisEcx: false, calleeClean: false }); // 843143: call 0x5444a0
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 843148: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84314b: test eax, eax
        if (R.zf) { pc = 0x8436cf; continue; } // 84314d: je 0x8436cf
        pc = 0x843153; continue;
      case 0x843153:
        R.eax = (R.m.u32(((R.esi + 0xf) | 0) >>> 0)) | 0; // 843153: mov eax, dword ptr [esi + 0xf]
        R.ecx = (R.m.u32(((R.esi + 0x13) | 0) >>> 0)) | 0; // 843156: mov ecx, dword ptr [esi + 0x13]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 843159: cmp eax, ecx
        if (!R.zf) { pc = 0x843166; continue; } // 84315b: jne 0x843166
        pc = 0x84315d; continue;
      case 0x84315d:
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 84315d: cmp eax, -1
        if (!R.zf) { pc = 0x8436cf; continue; } // 843160: jne 0x8436cf
        pc = 0x843166; continue;
      case 0x843166:
        R.eax = (R.m.u32(((R.esi + 0x1b) | 0) >>> 0)) | 0; // 843166: mov eax, dword ptr [esi + 0x1b]
        R.edx = (R.m.u32(((R.esi + 0x1f) | 0) >>> 0)) | 0; // 843169: mov edx, dword ptr [esi + 0x1f]
        R.m.w32(((R.esp + 0x48) | 0) >>> 0, (R.eax >>> 0)); // 84316c: mov dword ptr [esp + 0x48], eax
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.esp + 0x4a) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 843170: mov cx, word ptr [esp + 0x4a]
        R.m.w32(((R.esp + 0x4c) | 0) >>> 0, (R.edx >>> 0)); // 843175: mov dword ptr [esp + 0x4c], edx
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 843179: mov dx, word ptr [0xae2c92]
        R.sub(((R.ecx >>> 0) & 0xffff), ((R.edx >>> 0) & 0xffff), 16); // 843180: cmp cx, dx
        if (R.cf) { pc = 0x8431a1; continue; } // 843183: jb 0x8431a1
        pc = 0x843185; continue;
      case 0x843185:
        if (!R.cBE) { pc = 0x8436cf; continue; } // 843185: ja 0x8436cf
        pc = 0x84318b; continue;
      case 0x84318b:
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 84318b: xor ecx, ecx
        R.sub(((R.eax >>> 0) & 0xffff), R.m.u16(((0xae2c90) | 0) >>> 0), 16); // 84318d: cmp ax, word ptr [0xae2c90]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.cL ? 1 : 0) & 0xff) << 0)) | 0; // 843194: setl cl
        R.eax = ((R.ecx >>> 0)) | 0; // 843197: mov eax, ecx
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 843199: test eax, eax
        if (R.zf) { pc = 0x8436cf; continue; } // 84319b: je 0x8436cf
        pc = 0x8431a1; continue;
      case 0x8431a1:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8431a1: mov al, byte ptr [esi + 0x24]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x1e, 8)) & 0xff) << 0)) | 0; // 8431a4: and al, 0x1e
        R.sub(((R.eax >>> 0) & 0xff), 0xa, 8); // 8431a6: cmp al, 0xa
        if (!R.zf) { pc = 0x843231; continue; } // 8431a8: jne 0x843231
        pc = 0x8431ae; continue;
      case 0x8431ae:
        R.edx = (R.m.u32(((R.esp + 0xb8) | 0) >>> 0)) | 0; // 8431ae: mov edx, dword ptr [esp + 0xb8]
        R.sub(R.m.u8(((R.edx + 0x18) | 0) >>> 0), 0x18, 8); // 8431b5: cmp byte ptr [edx + 0x18], 0x18
        if (!R.cLE) { pc = 0x8436cf; continue; } // 8431b9: jg 0x8436cf
        pc = 0x8431bf; continue;
      case 0x8431bf:
        R.sub(((R.eax >>> 0) & 0xff), ((R.eax >>> 0) & 0xff), 8); // 8431bf: cmp al, al
        if (!R.zf) { pc = 0x843231; continue; } // 8431c1: jne 0x843231
        pc = 0x8431c3; continue;
      case 0x8431c3:
        R.eax = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 8431c3: mov eax, dword ptr [esp + 0x40]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8431c7: test eax, eax
        if (!R.zf) { pc = 0x843231; continue; } // 8431c9: jne 0x843231
        pc = 0x8431cb; continue;
      case 0x8431cb:
        R.eax = (R.m.u32(((R.esp + 0xbc) | 0) >>> 0)) | 0; // 8431cb: mov eax, dword ptr [esp + 0xbc]
        R.ecx = (R.m.u32(((R.eax + 0x53) | 0) >>> 0)) | 0; // 8431d2: mov ecx, dword ptr [eax + 0x53]
        R.eax = (R.m.u32(((R.edx + 0x1a) | 0) >>> 0)) | 0; // 8431d5: mov eax, dword ptr [edx + 0x1a]
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 8431d8: cmp ecx, eax
        if (R.zf) { pc = 0x843231; continue; } // 8431da: je 0x843231
        pc = 0x8431dc; continue;
      case 0x8431dc:
        R.eax = (R.m.u32(((R.edx + 0x39) | 0) >>> 0)) | 0; // 8431dc: mov eax, dword ptr [edx + 0x39]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8431df: test eax, eax
        if (R.zf) { pc = 0x8431e8; continue; } // 8431e1: je 0x8431e8
        pc = 0x8431e3; continue;
      case 0x8431e3:
        R.sub(R.m.u32(((R.eax + 0x53) | 0) >>> 0), (R.ecx >>> 0), 32); // 8431e3: cmp dword ptr [eax + 0x53], ecx
        if (R.zf) { pc = 0x843231; continue; } // 8431e6: je 0x843231
        pc = 0x8431e8; continue;
      case 0x8431e8:
        R.ecx = (R.m.u32(((R.edx + 0x61) | 0) >>> 0)) | 0; // 8431e8: mov ecx, dword ptr [edx + 0x61]
        R.sub(R.m.u16(((R.ecx + 0xb) | 0) >>> 0), 0x3e8, 16); // 8431eb: cmp word ptr [ecx + 0xb], 0x3e8
        if (R.cL) { pc = 0x8436cf; continue; } // 8431f1: jl 0x8436cf
        pc = 0x8431f7; continue;
      case 0x8431f7:
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
        if (R.cL) { pc = 0x8436cf; continue; } // 84322b: jl 0x8436cf
        pc = 0x843231; continue;
      case 0x843231:
        R.edx = (R.m.u32(((R.esp + 0xbc) | 0) >>> 0)) | 0; // 843231: mov edx, dword ptr [esp + 0xbc]
        R.eax = (R.m.u32(((R.esp + 0xb8) | 0) >>> 0)) | 0; // 843238: mov eax, dword ptr [esp + 0xb8]
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 84323f: mov ecx, dword ptr [0xde1f54]
        R.push(0x1); // 843245: push 1
        R.push((R.edx >>> 0)); // 843247: push edx
        R.push((R.eax >>> 0)); // 843248: push eax
        R.call(0x8c7560, { n: 3, thisEcx: true, calleeClean: true }); // 843249: call 0x8c7560
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84324e: test eax, eax
        if (R.zf) { pc = 0x843267; continue; } // 843250: je 0x843267
        pc = 0x843252; continue;
      case 0x843252:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 843252: mov al, byte ptr [esi + 0x24]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x1e, 8)) & 0xff) << 0)) | 0; // 843255: and al, 0x1e
        R.sub(((R.eax >>> 0) & 0xff), 0x2, 8); // 843257: cmp al, 2
        if (R.zf) { pc = 0x843267; continue; } // 843259: je 0x843267
        pc = 0x84325b; continue;
      case 0x84325b:
        R.sub(((R.eax >>> 0) & 0xff), 0x4, 8); // 84325b: cmp al, 4
        if (R.zf) { pc = 0x843267; continue; } // 84325d: je 0x843267
        pc = 0x84325f; continue;
      case 0x84325f:
        R.sub(((R.eax >>> 0) & 0xff), 0x6, 8); // 84325f: cmp al, 6
        if (!R.zf) { pc = 0x8436cf; continue; } // 843261: jne 0x8436cf
        pc = 0x843267; continue;
      case 0x843267:
        R.fpush(R.m.s32(((R.esp + 0x44) | 0) >>> 0)); // 843267: fild dword ptr [esp + 0x44]
        R.fpush(R.m.s32(((R.esi + 0x7) | 0) >>> 0)); // 84326b: fild dword ptr [esi + 7]
        R.fpush(R.st[1]); // 84326e: fld st(1)
        R.st[0] = R.st[0] * 0.2; // 843270: fmul qword ptr [0x968918]
        R.fcom(R.st[0], R.st[1]); R.fpop(); R.fpop(); // 843276: fcompp 
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 843278: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 84327a: test ah, 1
        if (!R.zf) { pc = 0x8432c6; continue; } // 84327d: jne 0x8432c6
        pc = 0x84327f; continue;
      case 0x84327f:
        R.eax = (R.m.u32(((R.esp + 0x2c) | 0) >>> 0)) | 0; // 84327f: mov eax, dword ptr [esp + 0x2c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 843283: test eax, eax
        if (!R.zf) { pc = 0x8432c6; continue; } // 843285: jne 0x8432c6
        pc = 0x843287; continue;
      case 0x843287:
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
        if (!R.zf) { pc = 0x8432c6; continue; } // 8432ba: jne 0x8432c6
        pc = 0x8432bc; continue;
      case 0x8432bc:
        R.ftol(); // 8432bc: call 0x945640
        R.m.w32(((R.esi + 0x7) | 0) >>> 0, (R.eax >>> 0)); // 8432c1: mov dword ptr [esi + 7], eax
        pc = 0x8432c8; continue; // 8432c4: jmp 0x8432c8
      case 0x8432c6:
        R.fpop(); // 8432c6: fstp st(0)
        pc = 0x8432c8; continue;
      case 0x8432c8:
        R.eax = (R.m.u32(((R.esi + 0x7) | 0) >>> 0)) | 0; // 8432c8: mov eax, dword ptr [esi + 7]
        R.sub((R.eax >>> 0), 0x1, 32); // 8432cb: cmp eax, 1
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.eax >>> 0)); // 8432ce: mov dword ptr [esp + 0x20], eax
        if (!R.cLE) { pc = 0x8432dc; continue; } // 8432d2: jg 0x8432dc
        pc = 0x8432d4; continue;
      case 0x8432d4:
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, 0x1); // 8432d4: mov dword ptr [esp + 0x20], 1
        pc = 0x8432dc; continue;
      case 0x8432dc:
        R.eax = (R.m.u32(((R.esi + 0xf) | 0) >>> 0)) | 0; // 8432dc: mov eax, dword ptr [esi + 0xf]
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 8432df: cmp eax, -1
        if (R.zf) { pc = 0x843465; continue; } // 8432e2: je 0x843465
        pc = 0x8432e8; continue;
      case 0x8432e8:
        R.ecx = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 8432e8: mov ecx, dword ptr [0xae23bc]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 8432ee: lea edx, [eax + eax*4]
        R.eax = (((R.eax + R.edx * 2) | 0)) | 0; // 8432f1: lea eax, [eax + edx*2]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 8432f4: lea eax, [eax + eax*4]
        R.eax = (((R.ecx + R.eax * 2) | 0)) | 0; // 8432f7: lea eax, [ecx + eax*2]
        R.ecx = (R.m.u32(((R.eax + 0x61) | 0) >>> 0)) | 0; // 8432fa: mov ecx, dword ptr [eax + 0x61]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 8432fd: test ecx, ecx
        if (R.zf) { pc = 0x843465; continue; } // 8432ff: je 0x843465
        pc = 0x843305; continue;
      case 0x843305:
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
        if (R.zf) { pc = 0x84335a; continue; } // 84333e: je 0x84335a
        pc = 0x843340; continue;
      case 0x843340:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 843340: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 843343: mov edx, dword ptr [0xae23b4]
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 843349: add edx, eax
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 84334b: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 84334e: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 843351: add ecx, eax
        R.ebp = (((R.edx + R.ecx * 4) | 0)) | 0; // 843353: lea ebp, [edx + ecx*4]
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 843356: test ebp, ebp
        if (!R.zf) { pc = 0x84335e; continue; } // 843358: jne 0x84335e
        pc = 0x84335a; continue;
      case 0x84335a:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 84335a: xor eax, eax
        pc = 0x8433ad; continue; // 84335c: jmp 0x8433ad
      case 0x84335e:
        R.push(0x0); // 84335e: push 0
        R.push(0x0); // 843360: push 0
        R.push(0x1); // 843362: push 1
        R.push(0x0); // 843364: push 0
        R.push((R.ebp >>> 0)); // 843366: push ebp
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 843367: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 84336c: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84336f: test eax, eax
        if (R.zf) { pc = 0x84338e; continue; } // 843371: je 0x84338e
        pc = 0x843373; continue;
      case 0x843373:
        R.eax = (R.m.u32(((R.esp + 0x24) | 0) >>> 0)) | 0; // 843373: mov eax, dword ptr [esp + 0x24]
        R.ecx = (R.m.u32(((R.esp + 0xbc) | 0) >>> 0)) | 0; // 843377: mov ecx, dword ptr [esp + 0xbc]
        R.push((R.eax >>> 0)); // 84337e: push eax
        R.push((R.ecx >>> 0)); // 84337f: push ecx
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 843380: mov ecx, dword ptr [0xae1050]
        R.push((R.ebp >>> 0)); // 843386: push ebp
        R.call(0x4d42d0, { n: 3, thisEcx: true, calleeClean: true }); // 843387: call 0x4d42d0
        pc = 0x8433ad; continue; // 84338c: jmp 0x8433ad
      case 0x84338e:
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
        pc = 0x8433ad; continue;
      case 0x8433ad:
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
        if (!R.zf) { pc = 0x8433e0; continue; } // 8433d4: jne 0x8433e0
        pc = 0x8433d6; continue;
      case 0x8433d6:
        R.fpop(); // 8433d6: fstp st(0)
        R.fpush(0.01); // 8433d8: fld qword ptr [0x967898]
        pc = 0x843412; continue; // 8433de: jmp 0x843412
      case 0x8433e0:
        R.fpush(3.0); // 8433e0: fld qword ptr [0x968930]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 8433e6: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8433e8: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8433ea: test ah, 1
        if (R.zf) { pc = 0x8433f9; continue; } // 8433ed: je 0x8433f9
        pc = 0x8433ef; continue;
      case 0x8433ef:
        R.fpop(); // 8433ef: fstp st(0)
        R.fpush(3.0); // 8433f1: fld qword ptr [0x968930]
        pc = 0x843406; continue; // 8433f7: jmp 0x843406
      case 0x8433f9:
        R.fcom(R.st[0], 1.0); // 8433f9: fcom qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8433ff: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 843401: test ah, 0x41
        if (!R.zf) { pc = 0x843412; continue; } // 843404: jne 0x843412
        pc = 0x843406; continue;
      case 0x843406:
        R.st[0] = R.st[0] * 0.3333333333333333; // 843406: fmul qword ptr [0x968a80]
        R.st[0] = R.st[0] + 0.67; // 84340c: fadd qword ptr [0x968f80]
        pc = 0x843412; continue;
      case 0x843412:
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 843412: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * R.st[1]; // 843416: fmul st(1)
        R.ftol(); // 843418: call 0x945640
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.eax >>> 0)); // 84341d: mov dword ptr [esp + 0x14], eax
        R.ecx = (R.m.u32(((R.esi + 0x3) | 0) >>> 0)) | 0; // 843421: mov ecx, dword ptr [esi + 3]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 843424: cmp eax, ecx
        R.fpop(); // 843426: fstp st(0)
        if (!R.cL) { pc = 0x8436cf; continue; } // 843428: jge 0x8436cf
        pc = 0x84342e; continue;
      case 0x84342e:
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 84342e: cmp eax, edi
        if (!R.cLE) { pc = 0x843436; continue; } // 843430: jg 0x843436
        pc = 0x843432; continue;
      case 0x843432:
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 843432: mov dword ptr [esp + 0x14], edi
        pc = 0x843436; continue;
      case 0x843436:
        R.ecx = (R.m.u32(((R.esp + 0x24) | 0) >>> 0)) | 0; // 843436: mov ecx, dword ptr [esp + 0x24]
        R.push((R.ecx >>> 0)); // 84343a: push ecx
        R.ecx = (R.m.u32(((0xb63d28) | 0) >>> 0)) | 0; // 84343b: mov ecx, dword ptr [0xb63d28]
        R.call(0x62ed70, { n: 1, thisEcx: true, calleeClean: true }); // 843441: call 0x62ed70
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 843446: test eax, eax
        if (R.zf) { pc = 0x84347b; continue; } // 843448: je 0x84347b
        pc = 0x84344a; continue;
      case 0x84344a:
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.eax + 0x2c) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 84344a: mov ax, word ptr [eax + 0x2c]
        R.sub(((R.eax >>> 0) & 0xffff), 0xf, 16); // 84344e: cmp ax, 0xf
        if (R.cLE) { pc = 0x84347b; continue; } // 843452: jle 0x84347b
        pc = 0x843454; continue;
      case 0x843454:
        R.eax = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 843454: movsx eax, ax
        R.eax = (R.add((R.eax >>> 0), 0xfffffff1, 32)) | 0; // 843457: add eax, -0xf
        R.edx = ((R.eax >>> 0)) | 0; // 84345a: mov edx, eax
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.edx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.edx = (Number(BigInt.asIntN(32, p))) | 0; } // 84345c: imul edx, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, R.sub(R.m.u32(((R.esp + 0x14) | 0) >>> 0), (R.edx >>> 0), 32)); // 84345f: sub dword ptr [esp + 0x14], edx
        pc = 0x84347b; continue; // 843463: jmp 0x84347b
      case 0x843465:
        R.edi = (R.m.u32(((R.esi + 0x3) | 0) >>> 0)) | 0; // 843465: mov edi, dword ptr [esi + 3]
        R.m.w32(((R.esi + 0xf) | 0) >>> 0, 0xffffffff); // 843468: mov dword ptr [esi + 0xf], 0xffffffff
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 84346f: mov dword ptr [esp + 0x14], edi
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, 0x0); // 843473: mov dword ptr [esp + 0x24], 0
        pc = 0x84347b; continue;
      case 0x84347b:
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
        if (R.zf) { pc = 0x84357d; continue; } // 8434a5: je 0x84357d
        pc = 0x8434ab; continue;
      case 0x8434ab:
        R.ecx = (R.m.u32(((0xae2a38) | 0) >>> 0)) | 0; // 8434ab: mov ecx, dword ptr [0xae2a38]
        R.edi = ((R.eax >>> 0)) | 0; // 8434b1: mov edi, eax
        R.push((R.edi >>> 0)); // 8434b3: push edi
        R.call(0x5a0590, { n: 1, thisEcx: true, calleeClean: true }); // 8434b4: call 0x5a0590
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8434b9: test eax, eax
        if (R.zf) { pc = 0x84351c; continue; } // 8434bb: je 0x84351c
        pc = 0x8434bd; continue;
      case 0x8434bd:
        R.ecx = (R.m.u32(((0xae2a38) | 0) >>> 0)) | 0; // 8434bd: mov ecx, dword ptr [0xae2a38]
        R.push((R.edi >>> 0)); // 8434c3: push edi
        R.call(0x5a0590, { n: 1, thisEcx: true, calleeClean: true }); // 8434c4: call 0x5a0590
        R.sub(R.m.u8(((R.eax + 0x165) | 0) >>> 0), 0x1, 8); // 8434c9: cmp byte ptr [eax + 0x165], 1
        if (!R.zf) { pc = 0x84351c; continue; } // 8434d0: jne 0x84351c
        pc = 0x8434d2; continue;
      case 0x8434d2:
        R.push(0x0); // 8434d2: push 0
        R.push(0x0); // 8434d4: push 0
        R.push(0x1); // 8434d6: push 1
        R.push(0x0); // 8434d8: push 0
        R.push((R.edi >>> 0)); // 8434da: push edi
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 8434db: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8434e0: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8434e3: test eax, eax
        if (R.zf) { pc = 0x843513; continue; } // 8434e5: je 0x843513
        pc = 0x8434e7; continue;
      case 0x8434e7:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8434e7: mov ecx, dword ptr [0xae1050]
        R.push(0x0); // 8434ed: push 0
        R.push(0xffffffff); // 8434ef: push -1
        R.push(0x0); // 8434f1: push 0
        R.push((R.edi >>> 0)); // 8434f3: push edi
        R.push((R.ebx >>> 0)); // 8434f4: push ebx
        R.call(0x4d0c60, { n: 5, thisEcx: false, calleeClean: true }); // 8434f5: call 0x4d0c60
        R.sub((R.ebp >>> 0), (R.eax >>> 0), 32); // 8434fa: cmp ebp, eax
        if (R.cL) { pc = 0x84351c; continue; } // 8434fc: jl 0x84351c
        pc = 0x8434fe; continue;
      case 0x8434fe:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8434fe: mov ecx, dword ptr [0xae1050]
        R.push(0x0); // 843504: push 0
        R.push(0xffffffff); // 843506: push -1
        R.push(0x0); // 843508: push 0
        R.push((R.edi >>> 0)); // 84350a: push edi
        R.push((R.ebx >>> 0)); // 84350b: push ebx
        R.call(0x4d0c60, { n: 5, thisEcx: false, calleeClean: true }); // 84350c: call 0x4d0c60
        pc = 0x84351a; continue; // 843511: jmp 0x84351a
      case 0x843513:
        R.eax = (R.m.u32(((R.ebx + 0x52) | 0) >>> 0)) | 0; // 843513: mov eax, dword ptr [ebx + 0x52]
        R.sub((R.ebp >>> 0), (R.eax >>> 0), 32); // 843516: cmp ebp, eax
        if (R.cL) { pc = 0x84351c; continue; } // 843518: jl 0x84351c
        pc = 0x84351a; continue;
      case 0x84351a:
        R.ebp = ((R.eax >>> 0)) | 0; // 84351a: mov ebp, eax
        pc = 0x84351c; continue;
      case 0x84351c:
        R.eax = (R.m.u32(((R.esp + 0x2c) | 0) >>> 0)) | 0; // 84351c: mov eax, dword ptr [esp + 0x2c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 843520: test eax, eax
        if (!R.zf) { pc = 0x84357d; continue; } // 843522: jne 0x84357d
        pc = 0x843524; continue;
      case 0x843524:
        R.edx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 843524: mov edx, dword ptr [esp + 0x10]
        R.push(0x0); // 843528: push 0
        R.push(0x0); // 84352a: push 0
        R.push(0x1); // 84352c: push 1
        R.push(0x0); // 84352e: push 0
        R.push((R.edx >>> 0)); // 843530: push edx
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 843531: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 843536: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 843539: test eax, eax
        if (R.zf) { pc = 0x84355a; continue; } // 84353b: je 0x84355a
        pc = 0x84353d; continue;
      case 0x84353d:
        R.eax = (R.m.u32(((R.esp + 0xbc) | 0) >>> 0)) | 0; // 84353d: mov eax, dword ptr [esp + 0xbc]
        R.ecx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 843544: mov ecx, dword ptr [esp + 0x10]
        R.push((R.ebx >>> 0)); // 843548: push ebx
        R.push((R.eax >>> 0)); // 843549: push eax
        R.push((R.ecx >>> 0)); // 84354a: push ecx
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 84354b: mov ecx, dword ptr [0xae1050]
        R.call(0x4d42d0, { n: 3, thisEcx: true, calleeClean: true }); // 843551: call 0x4d42d0
        R.edi = ((R.eax >>> 0)) | 0; // 843556: mov edi, eax
        pc = 0x84357f; continue; // 843558: jmp 0x84357f
      case 0x84355a:
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
        pc = 0x84357f; continue; // 84357b: jmp 0x84357f
      case 0x84357d:
        R.edi = (R.logic((R.edi >>> 0) ^ (R.edi >>> 0), 32)) | 0; // 84357d: xor edi, edi
        pc = 0x84357f; continue;
      case 0x84357f:
        R.eax = (R.m.u32(((R.esp + 0x54) | 0) >>> 0)) | 0; // 84357f: mov eax, dword ptr [esp + 0x54]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 843583: test eax, eax
        if (R.zf) { pc = 0x843595; continue; } // 843585: je 0x843595
        pc = 0x843587; continue;
      case 0x843587:
        R.ecx = (R.m.u32(((R.esp + 0x2c) | 0) >>> 0)) | 0; // 843587: mov ecx, dword ptr [esp + 0x2c]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 84358b: test ecx, ecx
        if (R.zf) { pc = 0x843595; continue; } // 84358d: je 0x843595
        pc = 0x84358f; continue;
      case 0x84358f:
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 84358f: cmp eax, edi
        if (!R.cL) { pc = 0x843595; continue; } // 843591: jge 0x843595
        pc = 0x843593; continue;
      case 0x843593:
        R.edi = ((R.eax >>> 0)) | 0; // 843593: mov edi, eax
        pc = 0x843595; continue;
      case 0x843595:
        R.eax = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 843595: mov eax, dword ptr [esp + 0x10]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 843599: test eax, eax
        if (R.zf) { pc = 0x8435de; continue; } // 84359b: je 0x8435de
        pc = 0x84359d; continue;
      case 0x84359d:
        R.eax = (R.m.u32(((R.esp + 0x2c) | 0) >>> 0)) | 0; // 84359d: mov eax, dword ptr [esp + 0x2c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8435a1: test eax, eax
        if (!R.zf) { pc = 0x8435de; continue; } // 8435a3: jne 0x8435de
        pc = 0x8435a5; continue;
      case 0x8435a5:
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
        if (!R.zf) { pc = 0x8435de; continue; } // 8435ca: jne 0x8435de
        pc = 0x8435cc; continue;
      case 0x8435cc:
        R.eax = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 8435cc: mov eax, dword ptr [esp + 0x34]
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 8435d0: cmp eax, -1
        if (R.zf) { pc = 0x8436cf; continue; } // 8435d3: je 0x8436cf
        pc = 0x8435d9; continue;
      case 0x8435d9:
        pc = 0x8436cc; continue; // 8435d9: jmp 0x8436cc
      case 0x8435de:
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
        if (!R.zf) { pc = 0x843611; continue; } // 843605: jne 0x843611
        pc = 0x843607; continue;
      case 0x843607:
        R.fpop(); // 843607: fstp st(0)
        R.fpush(0.01); // 843609: fld qword ptr [0x967898]
        pc = 0x843643; continue; // 84360f: jmp 0x843643
      case 0x843611:
        R.fpush(3.0); // 843611: fld qword ptr [0x968930]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 843617: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 843619: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 84361b: test ah, 1
        if (R.zf) { pc = 0x84362a; continue; } // 84361e: je 0x84362a
        pc = 0x843620; continue;
      case 0x843620:
        R.fpop(); // 843620: fstp st(0)
        R.fpush(3.0); // 843622: fld qword ptr [0x968930]
        pc = 0x843637; continue; // 843628: jmp 0x843637
      case 0x84362a:
        R.fcom(R.st[0], 1.0); // 84362a: fcom qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 843630: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 843632: test ah, 0x41
        if (!R.zf) { pc = 0x843643; continue; } // 843635: jne 0x843643
        pc = 0x843637; continue;
      case 0x843637:
        R.st[0] = R.st[0] * 0.3333333333333333; // 843637: fmul qword ptr [0x968a80]
        R.st[0] = R.st[0] + 0.67; // 84363d: fadd qword ptr [0x968f80]
        pc = 0x843643; continue;
      case 0x843643:
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 843643: fild dword ptr [esp + 0x28]
        R.st[0] = R.st[0] * R.st[1]; // 843647: fmul st(1)
        R.ftol(); // 843649: call 0x945640
        R.ecx = (R.m.u32(((0xb63d28) | 0) >>> 0)) | 0; // 84364e: mov ecx, dword ptr [0xb63d28]
        R.push((R.ebx >>> 0)); // 843654: push ebx
        R.fpop(); // 843655: fstp st(0)
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.eax >>> 0)); // 843657: mov dword ptr [esp + 0x2c], eax
        R.call(0x62ed70, { n: 1, thisEcx: true, calleeClean: true }); // 84365b: call 0x62ed70
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 843660: test eax, eax
        if (R.zf) { pc = 0x84367d; continue; } // 843662: je 0x84367d
        pc = 0x843664; continue;
      case 0x843664:
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.eax + 0x2c) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 843664: mov ax, word ptr [eax + 0x2c]
        R.sub(((R.eax >>> 0) & 0xffff), 0xf, 16); // 843668: cmp ax, 0xf
        if (R.cLE) { pc = 0x84367d; continue; } // 84366c: jle 0x84367d
        pc = 0x84366e; continue;
      case 0x84366e:
        R.eax = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 84366e: movsx eax, ax
        R.eax = (R.add((R.eax >>> 0), 0xfffffff1, 32)) | 0; // 843671: add eax, -0xf
        R.ecx = ((R.eax >>> 0)) | 0; // 843674: mov ecx, eax
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 843676: imul ecx, eax
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, R.sub(R.m.u32(((R.esp + 0x28) | 0) >>> 0), (R.ecx >>> 0), 32)); // 843679: sub dword ptr [esp + 0x28], ecx
        pc = 0x84367d; continue;
      case 0x84367d:
        R.edx = (R.m.u32(((R.esp + 0x28) | 0) >>> 0)) | 0; // 84367d: mov edx, dword ptr [esp + 0x28]
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 843681: mov eax, dword ptr [esp + 0x14]
        R.sub((R.edx >>> 0), (R.eax >>> 0), 32); // 843685: cmp edx, eax
        if (!R.cL) { pc = 0x843694; continue; } // 843687: jge 0x843694
        pc = 0x843689; continue;
      case 0x843689:
        R.eax = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 843689: mov eax, dword ptr [esp + 0x34]
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 84368d: cmp eax, -1
        if (R.zf) { pc = 0x8436cf; continue; } // 843690: je 0x8436cf
        pc = 0x843692; continue;
      case 0x843692:
        pc = 0x8436cc; continue; // 843692: jmp 0x8436cc
      case 0x843694:
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
        if (R.zf) { pc = 0x843701; continue; } // 8436c1: je 0x843701
        pc = 0x8436c3; continue;
      case 0x8436c3:
        R.eax = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 8436c3: mov eax, dword ptr [esp + 0x34]
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 8436c7: cmp eax, -1
        if (R.zf) { pc = 0x8436cf; continue; } // 8436ca: je 0x8436cf
        pc = 0x8436cc; continue;
      case 0x8436cc:
        R.m.w32(((R.esi + 0x7) | 0) >>> 0, (R.eax >>> 0)); // 8436cc: mov dword ptr [esi + 7], eax
        pc = 0x8436cf; continue;
      case 0x8436cf:
        R.eax = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 8436cf: mov eax, dword ptr [esp + 0x30]
        R.esi = (R.add((R.esi >>> 0), 0x25, 32)) | 0; // 8436d3: add esi, 0x25
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 8436d6: inc eax
        R.sub((R.eax >>> 0), 0x28, 32); // 8436d7: cmp eax, 0x28
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.eax >>> 0)); // 8436da: mov dword ptr [esp + 0x30], eax
        if (R.cL) { pc = 0x843063; continue; } // 8436de: jl 0x843063
        pc = 0x8436e4; continue;
      case 0x8436e4:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8436e4: xor eax, eax
        pc = 0x8436e6; continue;
      case 0x8436e6:
        R.ecx = (R.m.u32(((R.esp + 0xa8) | 0) >>> 0)) | 0; // 8436e6: mov ecx, dword ptr [esp + 0xa8]
        R.edi = (R.pop()) | 0; // 8436ed: pop edi
        R.esi = (R.pop()) | 0; // 8436ee: pop esi
        R.ebp = (R.pop()) | 0; // 8436ef: pop ebp
        R.ebx = (R.pop()) | 0; // 8436f0: pop ebx
        /* fs */ // 8436f1: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0xa4, 32)) | 0; // 8436f8: add esp, 0xa4
        return R.ret(3); // 8436fe: ret 0xc
      case 0x843701:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 843701: mov al, byte ptr [esi + 0x24]
        R.logic(((R.eax >>> 0) & 0xff) & 0x1, 8); // 843704: test al, 1
        if (!R.zf) { pc = 0x8437c7; continue; } // 843706: jne 0x8437c7
        pc = 0x84370c; continue;
      case 0x84370c:
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
        if (R.zf) { pc = 0x843753; continue; } // 843749: je 0x843753
        pc = 0x84374b; continue;
      case 0x84374b:
        R.fpush(0.1); // 84374b: fld qword ptr [0x967880]
        pc = 0x84376b; continue; // 843751: jmp 0x84376b
      case 0x843753:
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
        pc = 0x84376b; continue;
      case 0x84376b:
        R.st[0] = 3.5 / R.st[0]; // 84376b: fdivr qword ptr [0x968e38]
        R.fcom(R.st[0], 0.9); // 843771: fcom qword ptr [0x9689d8]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 843777: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 843779: test ah, 1
        if (R.zf) { pc = 0x843786; continue; } // 84377c: je 0x843786
        pc = 0x84377e; continue;
      case 0x84377e:
        R.fpop(); // 84377e: fstp st(0)
        R.fpush(0.8999999761581421); // 843780: fld dword ptr [0x96a32c]
        pc = 0x843786; continue;
      case 0x843786:
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
        if (!R.zf) { pc = 0x8436e4; continue; } // 8437c1: jne 0x8436e4
        pc = 0x8437c7; continue;
      case 0x8437c7:
        R.eax = (R.m.u32(((R.esp + 0x24) | 0) >>> 0)) | 0; // 8437c7: mov eax, dword ptr [esp + 0x24]
        R.ecx = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 8437cb: mov ecx, dword ptr [ebx]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8437cd: test eax, eax
        R.m.w32(((R.esi + 0xf) | 0) >>> 0, (R.ecx >>> 0)); // 8437cf: mov dword ptr [esi + 0xf], ecx
        if (R.zf) { pc = 0x8437e1; continue; } // 8437d2: je 0x8437e1
        pc = 0x8437d4; continue;
      case 0x8437d4:
        R.push(0x0); // 8437d4: push 0
        R.push(0x3); // 8437d6: push 3
        R.push((R.edi >>> 0)); // 8437d8: push edi
        R.push((R.eax >>> 0)); // 8437d9: push eax
        R.ecx = ((R.ebp >>> 0)) | 0; // 8437da: mov ecx, ebp
        R.call(0x843e10, { n: 4, thisEcx: true, calleeClean: true }); // 8437dc: call 0x843e10
        pc = 0x8437e1; continue;
      case 0x8437e1:
        R.push((R.edi >>> 0)); // 8437e1: push edi
        R.push((R.ebx >>> 0)); // 8437e2: push ebx
        R.ecx = ((R.ebp >>> 0)) | 0; // 8437e3: mov ecx, ebp
        R.call(0x8423f0, { n: 2, thisEcx: true, calleeClean: true }); // 8437e5: call 0x8423f0
        R.eax = (0x1) | 0; // 8437ea: mov eax, 1
        pc = 0x8436e6; continue; // 8437ef: jmp 0x8436e6
      default: throw new Error(`f_842e10: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
