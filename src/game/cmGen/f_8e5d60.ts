// 0x8e5d60 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 417c10=2tc, 4cda70=7tc, 4cf5a0=1c, 4cf6d0=1c, 4d0c60=5c, 4d1600=6tc, 4d42d0=3tc, 53b620=1, 5409b0=1, 5444a0=2, 5986b0=0t, 598800=5tc, 5a0590=1tc, 5e8290=9, 600a50=5, 68d020=0t, 68d040=0t, 68d0d0=2tc, 68d1b0=0t, 840d80=6tc, 84b6f0=4c, 85e410=0t, 867b50=0t, 868210=3tc, 8c5cf0=3tc, 8c5e40=2tc, 8c61e0=1tc, 8cc930=2tc, 8cdd80=3tc, 8ced40=6tc, 8d0780=3c, 8d0a70=1c, 8e7a70=4tc, 8e8330=3tc, 90d130=0, 944c94=1, 944c9f=0, 944cf1=1, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_8e5d60(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x8e5d60;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x8e5d60:
        R.push(0xffffffff); // 8e5d60: push -1
        R.push(0x964982); // 8e5d62: push 0x964982
        R.eax = (0) | 0; // 8e5d67: mov eax, dword ptr fs:[0]
        R.push((R.eax >>> 0)); // 8e5d6d: push eax
        /* fs */ // 8e5d6e: mov dword ptr fs:[0], esp
        R.esp = (R.sub((R.esp >>> 0), 0x24c, 32)) | 0; // 8e5d75: sub esp, 0x24c
        R.push((R.ebx >>> 0)); // 8e5d7b: push ebx
        R.push((R.ebp >>> 0)); // 8e5d7c: push ebp
        R.ebp = (R.m.u32(((R.esp + 0x264) | 0) >>> 0)) | 0; // 8e5d7d: mov ebp, dword ptr [esp + 0x264]
        R.push((R.esi >>> 0)); // 8e5d84: push esi
        R.push((R.edi >>> 0)); // 8e5d85: push edi
        R.edi = (R.logic((R.edi >>> 0) ^ (R.edi >>> 0), 32)) | 0; // 8e5d86: xor edi, edi
        R.sub((R.ebp >>> 0), (R.edi >>> 0), 32); // 8e5d88: cmp ebp, edi
        R.esi = ((R.ecx >>> 0)) | 0; // 8e5d8a: mov esi, ecx
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edi >>> 0)); // 8e5d8c: mov dword ptr [esp + 0x10], edi
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, 0xffffffff); // 8e5d90: mov dword ptr [esp + 0x14], 0xffffffff
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.edi >>> 0)); // 8e5d98: mov dword ptr [esp + 0x2c], edi
        if (R.zf) { pc = 0x8e7761; continue; } // 8e5d9c: je 0x8e7761
        pc = 0x8e5da2; continue;
      case 0x8e5da2:
        R.sub(R.m.u32(((R.esp + 0x270) | 0) >>> 0), (R.edi >>> 0), 32); // 8e5da2: cmp dword ptr [esp + 0x270], edi
        if (R.zf) { pc = 0x8e7761; continue; } // 8e5da9: je 0x8e7761
        pc = 0x8e5daf; continue;
      case 0x8e5daf:
        R.eax = (R.m.u32(((R.ebp + 0x61) | 0) >>> 0)) | 0; // 8e5daf: mov eax, dword ptr [ebp + 0x61]
        R.ebx = (R.m.u32(((R.esp + 0x274) | 0) >>> 0)) | 0; // 8e5db2: mov ebx, dword ptr [esp + 0x274]
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 8e5db9: cmp eax, edi
        if (R.zf) { pc = 0x8e5e78; continue; } // 8e5dbb: je 0x8e5e78
        pc = 0x8e5dc1; continue;
      case 0x8e5dc1:
        R.sub((R.ebx >>> 0), (R.edi >>> 0), 32); // 8e5dc1: cmp ebx, edi
        if (R.zf) { pc = 0x8e5e78; continue; } // 8e5dc3: je 0x8e5e78
        pc = 0x8e5dc9; continue;
      case 0x8e5dc9:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebx + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e5dc9: mov al, byte ptr [ebx + 0x24]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x1e, 8)) & 0xff) << 0)) | 0; // 8e5dcc: and al, 0x1e
        R.sub(((R.eax >>> 0) & 0xff), 0x8, 8); // 8e5dce: cmp al, 8
        if (!R.cf) { pc = 0x8e5e78; continue; } // 8e5dd0: jae 0x8e5e78
        pc = 0x8e5dd6; continue;
      case 0x8e5dd6:
        R.push(0xbb8); // 8e5dd6: push 0xbb8
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e5ddb: call 0x90cfc0
        R.ecx = (R.m.u32(((R.ebp + 0x61) | 0) >>> 0)) | 0; // 8e5de0: mov ecx, dword ptr [ebp + 0x61]
        R.eax = (R.add((R.eax >>> 0), 0xfa0, 32)) | 0; // 8e5de3: add eax, 0xfa0
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8e5de8: add esp, 4
        R.edx = (((R.m.u16(((R.ecx + 0xb) | 0) >>> 0)) << 16 >> 16)) | 0; // 8e5deb: movsx edx, word ptr [ecx + 0xb]
        R.sub((R.edx >>> 0), (R.eax >>> 0), 32); // 8e5def: cmp edx, eax
        if (R.cLE) { pc = 0x8e5e78; continue; } // 8e5df1: jle 0x8e5e78
        pc = 0x8e5df7; continue;
      case 0x8e5df7:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8e5df7: mov ecx, dword ptr [0xae1050]
        R.push((R.ebp >>> 0)); // 8e5dfd: push ebp
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 8e5dfe: call 0x4cf5a0
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 8e5e03: cmp eax, edi
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 8e5e05: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x8e5e78; continue; } // 8e5e0a: je 0x8e5e78
        pc = 0x8e5e0c; continue;
      case 0x8e5e0c:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 8e5e0c: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 8e5e0f: mov edx, dword ptr [0xae23b4]
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8e5e15: add edx, eax
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 8e5e17: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 8e5e1a: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 8e5e1d: add ecx, eax
        R.eax = (((R.edx + R.ecx * 4) | 0)) | 0; // 8e5e1f: lea eax, [edx + ecx*4]
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 8e5e22: cmp eax, edi
        if (R.zf) { pc = 0x8e5e78; continue; } // 8e5e24: je 0x8e5e78
        pc = 0x8e5e26; continue;
      case 0x8e5e26:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8e5e26: mov ecx, dword ptr [0xae1050]
        R.push((R.ebp >>> 0)); // 8e5e2c: push ebp
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 8e5e2d: call 0x4cf5a0
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 8e5e32: cmp eax, edi
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 8e5e34: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x8e5e53; continue; } // 8e5e39: je 0x8e5e53
        pc = 0x8e5e3b; continue;
      case 0x8e5e3b:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 8e5e3b: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 8e5e3e: mov edx, dword ptr [0xae23b4]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 8e5e44: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 8e5e47: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 8e5e4a: add ecx, eax
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8e5e4c: add edx, eax
        R.eax = (((R.edx + R.ecx * 4) | 0)) | 0; // 8e5e4e: lea eax, [edx + ecx*4]
        pc = 0x8e5e55; continue; // 8e5e51: jmp 0x8e5e55
      case 0x8e5e53:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8e5e53: xor eax, eax
        pc = 0x8e5e55; continue;
      case 0x8e5e55:
        R.ecx = (R.m.u32(((R.esp + 0x270) | 0) >>> 0)) | 0; // 8e5e55: mov ecx, dword ptr [esp + 0x270]
        R.eax = (R.m.u32(((R.eax + 0x57) | 0) >>> 0)) | 0; // 8e5e5c: mov eax, dword ptr [eax + 0x57]
        R.sub((R.eax >>> 0), R.m.u32(((R.ecx + 0x57) | 0) >>> 0), 32); // 8e5e5f: cmp eax, dword ptr [ecx + 0x57]
        if (!R.zf) { pc = 0x8e5e78; continue; } // 8e5e62: jne 0x8e5e78
        pc = 0x8e5e64; continue;
      case 0x8e5e64:
        R.push(0x14); // 8e5e64: push 0x14
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e5e66: call 0x90cfc0
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8e5e6b: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e5e6e: test eax, eax
        if (!R.zf) { pc = 0x8e5e78; continue; } // 8e5e70: jne 0x8e5e78
        pc = 0x8e5e72; continue;
      case 0x8e5e72:
        R.m.w8(((R.esi + 0x2d) | 0) >>> 0, 0x1); // 8e5e72: mov byte ptr [esi + 0x2d], 1
        pc = 0x8e5e7c; continue; // 8e5e76: jmp 0x8e5e7c
      case 0x8e5e78:
        R.m.w8(((R.esi + 0x2d) | 0) >>> 0, 0x0); // 8e5e78: mov byte ptr [esi + 0x2d], 0
        pc = 0x8e5e7c; continue;
      case 0x8e5e7c:
        R.edx = (R.m.u32(((R.esp + 0x270) | 0) >>> 0)) | 0; // 8e5e7c: mov edx, dword ptr [esp + 0x270]
        R.m.w32(((R.esi) | 0) >>> 0, (R.edi >>> 0)); // 8e5e83: mov dword ptr [esi], edi
        R.m.w32(((R.esi + 0x4) | 0) >>> 0, (R.edi >>> 0)); // 8e5e85: mov dword ptr [esi + 4], edi
        R.push((R.ebp >>> 0)); // 8e5e88: push ebp
        R.eax = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 8e5e89: mov eax, dword ptr [edx]
        R.m.w32(((R.esi + 0x8) | 0) >>> 0, (R.eax >>> 0)); // 8e5e8b: mov dword ptr [esi + 8], eax
        R.ecx = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 8e5e8e: mov ecx, dword ptr [ebp]
        R.m.w32(((R.esi + 0xc) | 0) >>> 0, (R.ecx >>> 0)); // 8e5e91: mov dword ptr [esi + 0xc], ecx
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8e5e94: mov ecx, dword ptr [0xae1050]
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 8e5e9a: call 0x4cf5a0
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.esp + 0x27c) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e5e9f: mov dl, byte ptr [esp + 0x27c]
        R.sub((R.ebx >>> 0), (R.edi >>> 0), 32); // 8e5ea6: cmp ebx, edi
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.eax >>> 0)); // 8e5ea8: mov dword ptr [esp + 0x34], eax
        R.m.w8(((R.esi + 0x2f) | 0) >>> 0, ((R.edx >>> 0) & 0xff)); // 8e5eac: mov byte ptr [esi + 0x2f], dl
        if (R.zf) { pc = 0x8e5eb6; continue; } // 8e5eaf: je 0x8e5eb6
        pc = 0x8e5eb1; continue;
      case 0x8e5eb1:
        R.eax = (((R.m.u8(((R.ebx) | 0) >>> 0)) << 24 >> 24)) | 0; // 8e5eb1: movsx eax, byte ptr [ebx]
        pc = 0x8e5ebb; continue; // 8e5eb4: jmp 0x8e5ebb
      case 0x8e5eb6:
        R.eax = (0xb) | 0; // 8e5eb6: mov eax, 0xb
        pc = 0x8e5ebb; continue;
      case 0x8e5ebb:
        R.m.w8(((R.esi + 0x11) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 8e5ebb: mov byte ptr [esi + 0x11], al
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.esi + 0x30) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e5ebe: mov dl, byte ptr [esi + 0x30]
        R.eax = (R.logic((R.eax >>> 0) | 0xffffffff, 32)) | 0; // 8e5ec1: or eax, 0xffffffff
        R.ebx = (0xfffffff0) | 0; // 8e5ec4: mov ebx, 0xfffffff0
        R.m.w32(((R.esi + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 8e5ec9: mov dword ptr [esi + 0x28], eax
        R.m.w32(((R.esi + 0x24) | 0) >>> 0, (R.eax >>> 0)); // 8e5ecc: mov dword ptr [esi + 0x24], eax
        R.eax = (R.m.u32(((R.esi + 0x31) | 0) >>> 0)) | 0; // 8e5ecf: mov eax, dword ptr [esi + 0x31]
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) & ((R.ebx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 8e5ed2: and dl, bl
        R.eax = (R.logic((R.eax >>> 0) & (R.ebx >>> 0), 32)) | 0; // 8e5ed4: and eax, ebx
        R.m.w8(((R.esi + 0x1f) | 0) >>> 0, 0x0); // 8e5ed6: mov byte ptr [esi + 0x1f], 0
        R.m.w32(((R.esi + 0x31) | 0) >>> 0, (R.eax >>> 0)); // 8e5eda: mov dword ptr [esi + 0x31], eax
        R.eax = (R.m.u32(((R.esp + 0x280) | 0) >>> 0)) | 0; // 8e5edd: mov eax, dword ptr [esp + 0x280]
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 8e5ee4: cmp eax, edi
        R.m.w32(((R.esi + 0x35) | 0) >>> 0, (R.edi >>> 0)); // 8e5ee6: mov dword ptr [esi + 0x35], edi
        R.m.w8(((R.esi + 0x39) | 0) >>> 0, 0xa); // 8e5ee9: mov byte ptr [esi + 0x39], 0xa
        R.m.w32(((R.esi + 0x3a) | 0) >>> 0, (R.edi >>> 0)); // 8e5eed: mov dword ptr [esi + 0x3a], edi
        R.m.w8(((R.esi + 0x3e) | 0) >>> 0, 0xa); // 8e5ef0: mov byte ptr [esi + 0x3e], 0xa
        R.m.w8(((R.esi + 0x3f) | 0) >>> 0, 0x0); // 8e5ef4: mov byte ptr [esi + 0x3f], 0
        R.m.w8(((R.esi + 0x40) | 0) >>> 0, 0x0); // 8e5ef8: mov byte ptr [esi + 0x40], 0
        R.m.w8(((R.esi + 0x2c) | 0) >>> 0, 0x0); // 8e5efc: mov byte ptr [esi + 0x2c], 0
        R.m.w8(((R.esi + 0x10) | 0) >>> 0, 0x0); // 8e5f00: mov byte ptr [esi + 0x10], 0
        R.m.w8(((R.esi + 0x2e) | 0) >>> 0, 0x0); // 8e5f04: mov byte ptr [esi + 0x2e], 0
        R.m.w8(((R.esi + 0x30) | 0) >>> 0, ((R.edx >>> 0) & 0xff)); // 8e5f08: mov byte ptr [esi + 0x30], dl
        R.m.w32(((R.esi + 0x1b) | 0) >>> 0, (R.edi >>> 0)); // 8e5f0b: mov dword ptr [esi + 0x1b], edi
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.edi >>> 0)); // 8e5f0e: mov dword ptr [esp + 0x20], edi
        if (R.zf) { pc = 0x8e5f16; continue; } // 8e5f12: je 0x8e5f16
        pc = 0x8e5f14; continue;
      case 0x8e5f14:
        R.m.w32(((R.eax) | 0) >>> 0, (R.edi >>> 0)); // 8e5f14: mov dword ptr [eax], edi
        pc = 0x8e5f16; continue;
      case 0x8e5f16:
        R.eax = (R.m.u32(((R.esp + 0x270) | 0) >>> 0)) | 0; // 8e5f16: mov eax, dword ptr [esp + 0x270]
        R.push((R.edi >>> 0)); // 8e5f1d: push edi
        R.push((R.edi >>> 0)); // 8e5f1e: push edi
        R.push(0x1); // 8e5f1f: push 1
        R.push((R.edi >>> 0)); // 8e5f21: push edi
        R.push((R.eax >>> 0)); // 8e5f22: push eax
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 8e5f23: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8e5f28: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e5f2b: test eax, eax
        if (R.zf) { pc = 0x8e6346; continue; } // 8e5f2d: je 0x8e6346
        pc = 0x8e5f33; continue;
      case 0x8e5f33:
        R.ecx = (R.m.u32(((R.esp + 0x270) | 0) >>> 0)) | 0; // 8e5f33: mov ecx, dword ptr [esp + 0x270]
        R.push(0x1); // 8e5f3a: push 1
        R.push((R.ecx >>> 0)); // 8e5f3c: push ecx
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 8e5f3d: mov ecx, dword ptr [0xde1f54]
        R.push((R.ebp >>> 0)); // 8e5f43: push ebp
        R.call(0x8cdd80, { n: 3, thisEcx: true, calleeClean: true }); // 8e5f44: call 0x8cdd80
        R.edi = ((R.eax >>> 0)) | 0; // 8e5f49: mov edi, eax
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 8e5f4b: test edi, edi
        if (R.zf) { pc = 0x8e630c; continue; } // 8e5f4d: je 0x8e630c
        pc = 0x8e5f53; continue;
      case 0x8e5f53:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edi + 0x1f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e5f53: mov al, byte ptr [edi + 0x1f]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 8e5f56: test al, al
        if (!R.zf) { pc = 0x8e630c; continue; } // 8e5f58: jne 0x8e630c
        pc = 0x8e5f5e; continue;
      case 0x8e5f5e:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x2f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e5f5e: mov al, byte ptr [esi + 0x2f]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 8e5f61: test al, al
        if (!R.zf) { pc = 0x8e630c; continue; } // 8e5f63: jne 0x8e630c
        pc = 0x8e5f69; continue;
      case 0x8e5f69:
        R.edx = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 8e5f69: mov edx, dword ptr [edi]
        R.m.w32(((R.esi) | 0) >>> 0, (R.edx >>> 0)); // 8e5f6b: mov dword ptr [esi], edx
        R.eax = (R.m.u32(((R.edi + 0x4) | 0) >>> 0)) | 0; // 8e5f6d: mov eax, dword ptr [edi + 4]
        R.m.w32(((R.esi + 0x4) | 0) >>> 0, (R.eax >>> 0)); // 8e5f70: mov dword ptr [esi + 4], eax
        R.ecx = (R.m.u32(((R.edi + 0x8) | 0) >>> 0)) | 0; // 8e5f73: mov ecx, dword ptr [edi + 8]
        R.m.w32(((R.esi + 0x8) | 0) >>> 0, (R.ecx >>> 0)); // 8e5f76: mov dword ptr [esi + 8], ecx
        R.edx = (R.m.u32(((R.edi + 0xc) | 0) >>> 0)) | 0; // 8e5f79: mov edx, dword ptr [edi + 0xc]
        R.m.w32(((R.esi + 0xc) | 0) >>> 0, (R.edx >>> 0)); // 8e5f7c: mov dword ptr [esi + 0xc], edx
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edi + 0x10) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e5f7f: mov al, byte ptr [edi + 0x10]
        R.m.w8(((R.esi + 0x10) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 8e5f82: mov byte ptr [esi + 0x10], al
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.edi + 0x11) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e5f85: mov cl, byte ptr [edi + 0x11]
        R.edx = (((R.edi + 0x12) | 0)) | 0; // 8e5f88: lea edx, [edi + 0x12]
        R.eax = (((R.esp + 0x3c) | 0)) | 0; // 8e5f8b: lea eax, [esp + 0x3c]
        R.m.w8(((R.esi + 0x11) | 0) >>> 0, ((R.ecx >>> 0) & 0xff)); // 8e5f8f: mov byte ptr [esi + 0x11], cl
        R.push((R.edx >>> 0)); // 8e5f92: push edx
        R.push((R.eax >>> 0)); // 8e5f93: push eax
        R.ecx = (((R.esi + 0x12) | 0)) | 0; // 8e5f94: lea ecx, [esi + 0x12]
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 8e5f97: call 0x417c10
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.edi + 0x1a) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e5f9c: mov cl, byte ptr [edi + 0x1a]
        R.m.w8(((R.esi + 0x1a) | 0) >>> 0, ((R.ecx >>> 0) & 0xff)); // 8e5f9f: mov byte ptr [esi + 0x1a], cl
        R.edx = (R.m.u32(((R.edi + 0x1b) | 0) >>> 0)) | 0; // 8e5fa2: mov edx, dword ptr [edi + 0x1b]
        R.m.w32(((R.esi + 0x1b) | 0) >>> 0, (R.edx >>> 0)); // 8e5fa5: mov dword ptr [esi + 0x1b], edx
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edi + 0x1f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e5fa8: mov al, byte ptr [edi + 0x1f]
        R.m.w8(((R.esi + 0x1f) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 8e5fab: mov byte ptr [esi + 0x1f], al
        R.ecx = (R.m.u32(((R.edi + 0x20) | 0) >>> 0)) | 0; // 8e5fae: mov ecx, dword ptr [edi + 0x20]
        R.m.w32(((R.esi + 0x20) | 0) >>> 0, (R.ecx >>> 0)); // 8e5fb1: mov dword ptr [esi + 0x20], ecx
        R.edx = (R.m.u32(((R.edi + 0x24) | 0) >>> 0)) | 0; // 8e5fb4: mov edx, dword ptr [edi + 0x24]
        R.m.w32(((R.esi + 0x24) | 0) >>> 0, (R.edx >>> 0)); // 8e5fb7: mov dword ptr [esi + 0x24], edx
        R.eax = (R.m.u32(((R.edi + 0x28) | 0) >>> 0)) | 0; // 8e5fba: mov eax, dword ptr [edi + 0x28]
        R.m.w32(((R.esi + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 8e5fbd: mov dword ptr [esi + 0x28], eax
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.edi + 0x2c) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e5fc0: mov cl, byte ptr [edi + 0x2c]
        R.m.w8(((R.esi + 0x2c) | 0) >>> 0, ((R.ecx >>> 0) & 0xff)); // 8e5fc3: mov byte ptr [esi + 0x2c], cl
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.edi + 0x2d) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e5fc6: mov dl, byte ptr [edi + 0x2d]
        R.m.w8(((R.esi + 0x2d) | 0) >>> 0, ((R.edx >>> 0) & 0xff)); // 8e5fc9: mov byte ptr [esi + 0x2d], dl
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edi + 0x2e) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e5fcc: mov al, byte ptr [edi + 0x2e]
        R.m.w8(((R.esi + 0x2e) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 8e5fcf: mov byte ptr [esi + 0x2e], al
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.edi + 0x2f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e5fd2: mov cl, byte ptr [edi + 0x2f]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x30) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e5fd5: mov al, byte ptr [esi + 0x30]
        R.m.w8(((R.esi + 0x2f) | 0) >>> 0, ((R.ecx >>> 0) & 0xff)); // 8e5fd8: mov byte ptr [esi + 0x2f], cl
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.edi + 0x30) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e5fdb: mov dl, byte ptr [edi + 0x30]
        R.edx = ((R.edx & 0xffffff00) | (((R.shl(((R.edx >>> 0) & 0xff), 0x4, 8)) & 0xff) << 0)) | 0; // 8e5fde: shl dl, 4
        R.edx = ((R.edx & 0xffffff00) | (((R.sar(((R.edx >>> 0) & 0xff), 0x4, 8)) & 0xff) << 0)) | 0; // 8e5fe1: sar dl, 4
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 8e5fe4: xor dl, al
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) & 0xf, 8)) & 0xff) << 0)) | 0; // 8e5fe6: and dl, 0xf
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 8e5fe9: xor dl, al
        R.eax = (R.m.u32(((R.esi + 0x31) | 0) >>> 0)) | 0; // 8e5feb: mov eax, dword ptr [esi + 0x31]
        R.m.w8(((R.esi + 0x30) | 0) >>> 0, ((R.edx >>> 0) & 0xff)); // 8e5fee: mov byte ptr [esi + 0x30], dl
        R.ecx = (R.m.u32(((R.edi + 0x31) | 0) >>> 0)) | 0; // 8e5ff1: mov ecx, dword ptr [edi + 0x31]
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8e5ff4: xor ecx, eax
        R.edx = (((R.edi + 0x35) | 0)) | 0; // 8e5ff6: lea edx, [edi + 0x35]
        R.ecx = (R.logic((R.ecx >>> 0) & 0xf, 32)) | 0; // 8e5ff9: and ecx, 0xf
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8e5ffc: xor ecx, eax
        R.m.w32(((R.esi + 0x31) | 0) >>> 0, (R.ecx >>> 0)); // 8e5ffe: mov dword ptr [esi + 0x31], ecx
        R.eax = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 8e6001: mov eax, dword ptr [edx]
        R.m.w32(((R.esi + 0x35) | 0) >>> 0, (R.eax >>> 0)); // 8e6003: mov dword ptr [esi + 0x35], eax
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.edx + 0x4) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e6006: mov cl, byte ptr [edx + 4]
        R.edx = (((R.edi + 0x3a) | 0)) | 0; // 8e6009: lea edx, [edi + 0x3a]
        R.m.w8(((R.esi + 0x39) | 0) >>> 0, ((R.ecx >>> 0) & 0xff)); // 8e600c: mov byte ptr [esi + 0x39], cl
        R.eax = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 8e600f: mov eax, dword ptr [edx]
        R.m.w32(((R.esi + 0x3a) | 0) >>> 0, (R.eax >>> 0)); // 8e6011: mov dword ptr [esi + 0x3a], eax
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.edx + 0x4) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e6014: mov cl, byte ptr [edx + 4]
        R.m.w8(((R.esi + 0x3e) | 0) >>> 0, ((R.ecx >>> 0) & 0xff)); // 8e6017: mov byte ptr [esi + 0x3e], cl
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.edi + 0x3f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e601a: mov dl, byte ptr [edi + 0x3f]
        R.m.w8(((R.esi + 0x3f) | 0) >>> 0, ((R.edx >>> 0) & 0xff)); // 8e601d: mov byte ptr [esi + 0x3f], dl
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edi + 0x40) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e6020: mov al, byte ptr [edi + 0x40]
        R.m.w8(((R.esi + 0x40) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 8e6023: mov byte ptr [esi + 0x40], al
        R.eax = (R.m.u32(((R.ebp + 0x61) | 0) >>> 0)) | 0; // 8e6026: mov eax, dword ptr [ebp + 0x61]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e6029: test eax, eax
        if (R.zf) { pc = 0x8e60f1; continue; } // 8e602b: je 0x8e60f1
        pc = 0x8e6031; continue;
      case 0x8e6031:
        R.eax = (R.m.u32(((R.esp + 0x274) | 0) >>> 0)) | 0; // 8e6031: mov eax, dword ptr [esp + 0x274]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e6038: test eax, eax
        if (R.zf) { pc = 0x8e60f1; continue; } // 8e603a: je 0x8e60f1
        pc = 0x8e6040; continue;
      case 0x8e6040:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e6040: mov cl, byte ptr [eax + 0x24]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0x1e, 8)) & 0xff) << 0)) | 0; // 8e6043: and cl, 0x1e
        R.sub(((R.ecx >>> 0) & 0xff), 0x8, 8); // 8e6046: cmp cl, 8
        if (!R.cf) { pc = 0x8e60f1; continue; } // 8e6049: jae 0x8e60f1
        pc = 0x8e604f; continue;
      case 0x8e604f:
        R.push(0xbb8); // 8e604f: push 0xbb8
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e6054: call 0x90cfc0
        R.edx = (R.m.u32(((R.ebp + 0x61) | 0) >>> 0)) | 0; // 8e6059: mov edx, dword ptr [ebp + 0x61]
        R.eax = (R.add((R.eax >>> 0), 0xfa0, 32)) | 0; // 8e605c: add eax, 0xfa0
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8e6061: add esp, 4
        R.ecx = (((R.m.u16(((R.edx + 0xb) | 0) >>> 0)) << 16 >> 16)) | 0; // 8e6064: movsx ecx, word ptr [edx + 0xb]
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 8e6068: cmp ecx, eax
        if (R.cLE) { pc = 0x8e60f1; continue; } // 8e606a: jle 0x8e60f1
        pc = 0x8e6070; continue;
      case 0x8e6070:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8e6070: mov ecx, dword ptr [0xae1050]
        R.push((R.ebp >>> 0)); // 8e6076: push ebp
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 8e6077: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e607c: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 8e607e: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x8e60f1; continue; } // 8e6083: je 0x8e60f1
        pc = 0x8e6085; continue;
      case 0x8e6085:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 8e6085: mov eax, dword ptr [eax + 4]
        R.ecx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 8e6088: mov ecx, dword ptr [0xae23b4]
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 8e608e: add ecx, eax
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 8e6090: lea edx, [eax + eax*8]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 8e6093: shl edx, 4
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8e6096: add edx, eax
        R.eax = (((R.ecx + R.edx * 4) | 0)) | 0; // 8e6098: lea eax, [ecx + edx*4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e609b: test eax, eax
        if (R.zf) { pc = 0x8e60f1; continue; } // 8e609d: je 0x8e60f1
        pc = 0x8e609f; continue;
      case 0x8e609f:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8e609f: mov ecx, dword ptr [0xae1050]
        R.push((R.ebp >>> 0)); // 8e60a5: push ebp
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 8e60a6: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e60ab: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 8e60ad: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x8e60cc; continue; } // 8e60b2: je 0x8e60cc
        pc = 0x8e60b4; continue;
      case 0x8e60b4:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 8e60b4: mov eax, dword ptr [eax + 4]
        R.ecx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 8e60b7: mov ecx, dword ptr [0xae23b4]
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 8e60bd: lea edx, [eax + eax*8]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 8e60c0: shl edx, 4
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8e60c3: add edx, eax
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 8e60c5: add ecx, eax
        R.eax = (((R.ecx + R.edx * 4) | 0)) | 0; // 8e60c7: lea eax, [ecx + edx*4]
        pc = 0x8e60ce; continue; // 8e60ca: jmp 0x8e60ce
      case 0x8e60cc:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8e60cc: xor eax, eax
        pc = 0x8e60ce; continue;
      case 0x8e60ce:
        R.edx = (R.m.u32(((R.eax + 0x57) | 0) >>> 0)) | 0; // 8e60ce: mov edx, dword ptr [eax + 0x57]
        R.eax = (R.m.u32(((R.esp + 0x270) | 0) >>> 0)) | 0; // 8e60d1: mov eax, dword ptr [esp + 0x270]
        R.sub((R.edx >>> 0), R.m.u32(((R.eax + 0x57) | 0) >>> 0), 32); // 8e60d8: cmp edx, dword ptr [eax + 0x57]
        if (!R.zf) { pc = 0x8e60f1; continue; } // 8e60db: jne 0x8e60f1
        pc = 0x8e60dd; continue;
      case 0x8e60dd:
        R.push(0x3); // 8e60dd: push 3
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e60df: call 0x90cfc0
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8e60e4: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e60e7: test eax, eax
        if (!R.zf) { pc = 0x8e60f1; continue; } // 8e60e9: jne 0x8e60f1
        pc = 0x8e60eb; continue;
      case 0x8e60eb:
        R.m.w8(((R.esi + 0x2d) | 0) >>> 0, 0x1); // 8e60eb: mov byte ptr [esi + 0x2d], 1
        pc = 0x8e60f5; continue; // 8e60ef: jmp 0x8e60f5
      case 0x8e60f1:
        R.m.w8(((R.esi + 0x2d) | 0) >>> 0, 0x0); // 8e60f1: mov byte ptr [esi + 0x2d], 0
        pc = 0x8e60f5; continue;
      case 0x8e60f5:
        R.edx = (R.m.u32(((R.esi + 0x31) | 0) >>> 0)) | 0; // 8e60f5: mov edx, dword ptr [esi + 0x31]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esi + 0x30) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e60f8: mov cl, byte ptr [esi + 0x30]
        R.eax = (R.logic((R.eax >>> 0) | 0xffffffff, 32)) | 0; // 8e60fb: or eax, 0xffffffff
        R.edx = (R.logic((R.edx >>> 0) & (R.ebx >>> 0), 32)) | 0; // 8e60fe: and edx, ebx
        R.m.w32(((R.esi + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 8e6100: mov dword ptr [esi + 0x28], eax
        R.m.w32(((R.esi + 0x24) | 0) >>> 0, (R.eax >>> 0)); // 8e6103: mov dword ptr [esi + 0x24], eax
        R.eax = (R.m.u32(((R.esi + 0x4) | 0) >>> 0)) | 0; // 8e6106: mov eax, dword ptr [esi + 4]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 8e6109: and cl, 0xf0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e610c: test eax, eax
        R.m.w8(((R.esi + 0x10) | 0) >>> 0, 0x0); // 8e610e: mov byte ptr [esi + 0x10], 0
        R.m.w8(((R.esi + 0x2c) | 0) >>> 0, 0x0); // 8e6112: mov byte ptr [esi + 0x2c], 0
        R.m.w8(((R.esi + 0x2e) | 0) >>> 0, 0x0); // 8e6116: mov byte ptr [esi + 0x2e], 0
        R.m.w32(((R.esi + 0x31) | 0) >>> 0, (R.edx >>> 0)); // 8e611a: mov dword ptr [esi + 0x31], edx
        R.m.w8(((R.esi + 0x30) | 0) >>> 0, ((R.ecx >>> 0) & 0xff)); // 8e611d: mov byte ptr [esi + 0x30], cl
        R.m.w8(((R.esi + 0x2f) | 0) >>> 0, 0x0); // 8e6120: mov byte ptr [esi + 0x2f], 0
        R.m.w32(((R.esi) | 0) >>> 0, 0x0); // 8e6124: mov dword ptr [esi], 0
        if (R.zf) { pc = 0x8e7523; continue; } // 8e612a: je 0x8e7523
        pc = 0x8e6130; continue;
      case 0x8e6130:
        R.ecx = (((R.esp + 0x3c) | 0)) | 0; // 8e6130: lea ecx, [esp + 0x3c]
        R.call(0x68d020, { n: 0, thisEcx: true, calleeClean: false }); // 8e6134: call 0x68d020
        R.push(0xe); // 8e6139: push 0xe
        R.m.w32(((R.esp + 0x268) | 0) >>> 0, 0x0); // 8e613b: mov dword ptr [esp + 0x268], 0
        R.call(0x944cf1, { n: 1, thisEcx: false, calleeClean: false }); // 8e6146: call 0x944cf1
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8e614b: add esp, 4
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 8e614e: mov dword ptr [esp + 0x10], eax
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e6152: test eax, eax
        R.m.w8(((R.esp + 0x264) | 0) >>> 0, 0x1); // 8e6154: mov byte ptr [esp + 0x264], 1
        if (R.zf) { pc = 0x8e6167; continue; } // 8e615c: je 0x8e6167
        pc = 0x8e615e; continue;
      case 0x8e615e:
        R.ecx = ((R.eax >>> 0)) | 0; // 8e615e: mov ecx, eax
        R.call(0x68d020, { n: 0, thisEcx: true, calleeClean: false }); // 8e6160: call 0x68d020
        pc = 0x8e6169; continue; // 8e6165: jmp 0x8e6169
      case 0x8e6167:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8e6167: xor eax, eax
        pc = 0x8e6169; continue;
      case 0x8e6169:
        R.m.w32(((R.esi + 0x4) | 0) >>> 0, (R.eax >>> 0)); // 8e6169: mov dword ptr [esi + 4], eax
        R.eax = (R.m.u32(((R.edi + 0x4) | 0) >>> 0)) | 0; // 8e616c: mov eax, dword ptr [edi + 4]
        R.m.w8(((R.esp + 0x264) | 0) >>> 0, 0x0); // 8e616f: mov byte ptr [esp + 0x264], 0
        R.ecx = (R.m.u32(((R.eax + 0x2) | 0) >>> 0)) | 0; // 8e6177: mov ecx, dword ptr [eax + 2]
        R.m.w32(((R.eax + 0xa) | 0) >>> 0, (R.ecx >>> 0)); // 8e617a: mov dword ptr [eax + 0xa], ecx
        R.ecx = (R.m.u32(((R.edi + 0x4) | 0) >>> 0)) | 0; // 8e617d: mov ecx, dword ptr [edi + 4]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8e6180: call 0x68d1b0
        R.ebp = ((R.eax >>> 0)) | 0; // 8e6185: mov ebp, eax
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 8e6187: test ebp, ebp
        if (R.zf) { pc = 0x8e62c8; continue; } // 8e6189: je 0x8e62c8
        pc = 0x8e618f; continue;
      case 0x8e618f:
        R.eax = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 8e618f: mov eax, dword ptr [ebp]
        R.ecx = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 8e6192: mov ecx, dword ptr [0xae23bc]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 8e6198: lea edx, [eax + eax*4]
        R.eax = (((R.eax + R.edx * 2) | 0)) | 0; // 8e619b: lea eax, [eax + edx*2]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 8e619e: lea eax, [eax + eax*4]
        R.ebx = (((R.ecx + R.eax * 2) | 0)) | 0; // 8e61a1: lea ebx, [ecx + eax*2]
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8e61a4: mov ecx, dword ptr [0xae1050]
        R.push((R.ebx >>> 0)); // 8e61aa: push ebx
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 8e61ab: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e61b0: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 8e61b2: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x8e61d1; continue; } // 8e61b7: je 0x8e61d1
        pc = 0x8e61b9; continue;
      case 0x8e61b9:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 8e61b9: mov eax, dword ptr [eax + 4]
        R.ecx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 8e61bc: mov ecx, dword ptr [0xae23b4]
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 8e61c2: lea edx, [eax + eax*8]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 8e61c5: shl edx, 4
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8e61c8: add edx, eax
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 8e61ca: add ecx, eax
        R.eax = (((R.ecx + R.edx * 4) | 0)) | 0; // 8e61cc: lea eax, [ecx + edx*4]
        pc = 0x8e61d3; continue; // 8e61cf: jmp 0x8e61d3
      case 0x8e61d1:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8e61d1: xor eax, eax
        pc = 0x8e61d3; continue;
      case 0x8e61d3:
        R.sub((R.eax >>> 0), R.m.u32(((R.esp + 0x270) | 0) >>> 0), 32); // 8e61d3: cmp eax, dword ptr [esp + 0x270]
        if (!R.zf) { pc = 0x8e62b6; continue; } // 8e61da: jne 0x8e62b6
        pc = 0x8e61e0; continue;
      case 0x8e61e0:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8e61e0: mov ecx, dword ptr [0xae1050]
        R.push((R.ebx >>> 0)); // 8e61e6: push ebx
        R.call(0x4cf6d0, { n: 1, thisEcx: false, calleeClean: true }); // 8e61e7: call 0x4cf6d0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e61ec: test eax, eax
        if (!R.zf) { pc = 0x8e62b6; continue; } // 8e61ee: jne 0x8e62b6
        pc = 0x8e61f4; continue;
      case 0x8e61f4:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8e61f4: mov ecx, dword ptr [0xae1050]
        R.push((R.ebx >>> 0)); // 8e61fa: push ebx
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 8e61fb: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e6200: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 8e6202: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x8e621f; continue; } // 8e6207: je 0x8e621f
        pc = 0x8e6209; continue;
      case 0x8e6209:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x35) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e6209: mov dl, byte ptr [eax + 0x35]
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8e620c: xor eax, eax
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) & 0x3f, 8)) & 0xff) << 0)) | 0; // 8e620e: and dl, 0x3f
        R.sub(((R.edx >>> 0) & 0xff), 0x5, 8); // 8e6211: cmp dl, 5
        R.eax = ((R.eax & 0xffffff00) | (((R.zf ? 1 : 0) & 0xff) << 0)) | 0; // 8e6214: sete al
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e6217: test eax, eax
        if (!R.zf) { pc = 0x8e62b6; continue; } // 8e6219: jne 0x8e62b6
        pc = 0x8e621f; continue;
      case 0x8e621f:
        R.sub(R.m.u8(((R.ebx + 0x3d) | 0) >>> 0), 0xb, 8); // 8e621f: cmp byte ptr [ebx + 0x3d], 0xb
        if (!R.zf) { pc = 0x8e62b6; continue; } // 8e6223: jne 0x8e62b6
        pc = 0x8e6229; continue;
      case 0x8e6229:
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 8e6229: mov ecx, dword ptr [0xde1f54]
        R.push(0x0); // 8e622f: push 0
        R.push(0x0); // 8e6231: push 0
        R.push((R.ebx >>> 0)); // 8e6233: push ebx
        R.call(0x8c5cf0, { n: 3, thisEcx: true, calleeClean: true }); // 8e6234: call 0x8c5cf0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e6239: test eax, eax
        if (!R.zf) { pc = 0x8e6252; continue; } // 8e623b: jne 0x8e6252
        pc = 0x8e623d; continue;
      case 0x8e623d:
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 8e623d: mov ecx, dword ptr [0xde1f54]
        R.eax = (((R.esp + 0x3c) | 0)) | 0; // 8e6243: lea eax, [esp + 0x3c]
        R.push((R.eax >>> 0)); // 8e6247: push eax
        R.push((R.ebx >>> 0)); // 8e6248: push ebx
        R.call(0x8c5e40, { n: 2, thisEcx: true, calleeClean: true }); // 8e6249: call 0x8c5e40
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e624e: test eax, eax
        if (R.zf) { pc = 0x8e628b; continue; } // 8e6250: je 0x8e628b
        pc = 0x8e6252; continue;
      case 0x8e6252:
        R.sub(R.m.u16(((R.esp + 0x3c) | 0) >>> 0), 0x1, 16); // 8e6252: cmp word ptr [esp + 0x3c], 1
        if (!R.zf) { pc = 0x8e62b6; continue; } // 8e6258: jne 0x8e62b6
        pc = 0x8e625a; continue;
      case 0x8e625a:
        R.ecx = (R.m.u32(((R.esp + 0x3e) | 0) >>> 0)) | 0; // 8e625a: mov ecx, dword ptr [esp + 0x3e]
        R.m.w32(((R.esp + 0x46) | 0) >>> 0, (R.ecx >>> 0)); // 8e625e: mov dword ptr [esp + 0x46], ecx
        R.ecx = (((R.esp + 0x3c) | 0)) | 0; // 8e6262: lea ecx, [esp + 0x3c]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8e6266: call 0x68d1b0
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8e626b: mov edx, dword ptr [eax]
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 8e626d: mov ecx, dword ptr [0xde1f54]
        R.push((R.edx >>> 0)); // 8e6273: push edx
        R.call(0x8c61e0, { n: 1, thisEcx: true, calleeClean: true }); // 8e6274: call 0x8c61e0
        R.ecx = (R.m.u32(((R.esp + 0x26c) | 0) >>> 0)) | 0; // 8e6279: mov ecx, dword ptr [esp + 0x26c]
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8e6280: mov eax, dword ptr [eax]
        R.edx = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 8e6282: mov edx, dword ptr [ecx]
        R.ecx = (R.m.u32(((R.eax + 0xc) | 0) >>> 0)) | 0; // 8e6284: mov ecx, dword ptr [eax + 0xc]
        R.sub((R.edx >>> 0), (R.ecx >>> 0), 32); // 8e6287: cmp edx, ecx
        if (!R.zf) { pc = 0x8e62b6; continue; } // 8e6289: jne 0x8e62b6
        pc = 0x8e628b; continue;
      case 0x8e628b:
        R.eax = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 8e628b: mov eax, dword ptr [ebp]
        R.push(0x7); // 8e628e: push 7
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.eax >>> 0)); // 8e6290: mov dword ptr [esp + 0x18], eax
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.ebp + 0x4) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8e6294: mov cx, word ptr [ebp + 4]
        R.m.w16(((R.esp + 0x1c) | 0) >>> 0, ((R.ecx >>> 0) & 0xffff)); // 8e6298: mov word ptr [esp + 0x1c], cx
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.ebp + 0x6) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e629d: mov dl, byte ptr [ebp + 6]
        R.ecx = (R.m.u32(((R.esi + 0x4) | 0) >>> 0)) | 0; // 8e62a0: mov ecx, dword ptr [esi + 4]
        R.eax = (((R.esp + 0x18) | 0)) | 0; // 8e62a3: lea eax, [esp + 0x18]
        R.push((R.eax >>> 0)); // 8e62a7: push eax
        R.m.w8(((R.esp + 0x22) | 0) >>> 0, ((R.edx >>> 0) & 0xff)); // 8e62a8: mov byte ptr [esp + 0x22], dl
        R.m.w8(((R.esp + 0x20) | 0) >>> 0, 0x0); // 8e62ac: mov byte ptr [esp + 0x20], 0
        R.call(0x68d0d0, { n: 2, thisEcx: true, calleeClean: true }); // 8e62b1: call 0x68d0d0
        pc = 0x8e62b6; continue;
      case 0x8e62b6:
        R.ecx = (R.m.u32(((R.edi + 0x4) | 0) >>> 0)) | 0; // 8e62b6: mov ecx, dword ptr [edi + 4]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8e62b9: call 0x68d1b0
        R.ebp = ((R.eax >>> 0)) | 0; // 8e62be: mov ebp, eax
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 8e62c0: test ebp, ebp
        if (!R.zf) { pc = 0x8e618f; continue; } // 8e62c2: jne 0x8e618f
        pc = 0x8e62c8; continue;
      case 0x8e62c8:
        R.edi = (R.m.u32(((R.esi + 0x4) | 0) >>> 0)) | 0; // 8e62c8: mov edi, dword ptr [esi + 4]
        R.sub(R.m.u16(((R.edi) | 0) >>> 0), 0x0, 16); // 8e62cb: cmp word ptr [edi], 0
        if (!R.zf) { pc = 0x8e62ec; continue; } // 8e62cf: jne 0x8e62ec
        pc = 0x8e62d1; continue;
      case 0x8e62d1:
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 8e62d1: test edi, edi
        if (R.zf) { pc = 0x8e62e5; continue; } // 8e62d3: je 0x8e62e5
        pc = 0x8e62d5; continue;
      case 0x8e62d5:
        R.ecx = ((R.edi >>> 0)) | 0; // 8e62d5: mov ecx, edi
        R.call(0x68d040, { n: 0, thisEcx: true, calleeClean: false }); // 8e62d7: call 0x68d040
        R.push((R.edi >>> 0)); // 8e62dc: push edi
        R.call(0x944c94, { n: 1, thisEcx: false, calleeClean: false }); // 8e62dd: call 0x944c94
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8e62e2: add esp, 4
        pc = 0x8e62e5; continue;
      case 0x8e62e5:
        R.m.w32(((R.esi + 0x4) | 0) >>> 0, 0x0); // 8e62e5: mov dword ptr [esi + 4], 0
        pc = 0x8e62ec; continue;
      case 0x8e62ec:
        R.ecx = (((R.esp + 0x3c) | 0)) | 0; // 8e62ec: lea ecx, [esp + 0x3c]
        R.m.w32(((R.esp + 0x264) | 0) >>> 0, 0xffffffff); // 8e62f0: mov dword ptr [esp + 0x264], 0xffffffff
        R.call(0x68d040, { n: 0, thisEcx: true, calleeClean: false }); // 8e62fb: call 0x68d040
        R.ebp = (R.m.u32(((R.esp + 0x26c) | 0) >>> 0)) | 0; // 8e6300: mov ebp, dword ptr [esp + 0x26c]
        pc = 0x8e7523; continue; // 8e6307: jmp 0x8e7523
      case 0x8e630c:
        R.ecx = (R.m.u32(((R.ebp + 0x52) | 0) >>> 0)) | 0; // 8e630c: mov ecx, dword ptr [ebp + 0x52]
        R.edx = (R.m.u32(((R.esp + 0x270) | 0) >>> 0)) | 0; // 8e630f: mov edx, dword ptr [esp + 0x270]
        R.push(0x0); // 8e6316: push 0
        R.push(0x1); // 8e6318: push 1
        R.push(0x0); // 8e631a: push 0
        R.push(0x0); // 8e631c: push 0
        R.m.w32(((R.esi + 0x1b) | 0) >>> 0, (R.ecx >>> 0)); // 8e631e: mov dword ptr [esi + 0x1b], ecx
        R.ecx = (R.m.u32(((0xae2a38) | 0) >>> 0)) | 0; // 8e6321: mov ecx, dword ptr [0xae2a38]
        R.push((R.ebp >>> 0)); // 8e6327: push ebp
        R.push((R.edx >>> 0)); // 8e6328: push edx
        R.call(0x5a0590, { n: 1, thisEcx: true, calleeClean: true }); // 8e6329: call 0x5a0590
        R.ecx = ((R.eax >>> 0)) | 0; // 8e632e: mov ecx, eax
        R.call(0x598800, { n: 5, thisEcx: true, calleeClean: true }); // 8e6330: call 0x598800
        R.sub(R.m.u32(((R.esi + 0x1b) | 0) >>> 0), (R.eax >>> 0), 32); // 8e6335: cmp dword ptr [esi + 0x1b], eax
        if (R.cLE) { pc = 0x8e7523; continue; } // 8e6338: jle 0x8e7523
        pc = 0x8e633e; continue;
      case 0x8e633e:
        R.m.w32(((R.esi + 0x1b) | 0) >>> 0, (R.eax >>> 0)); // 8e633e: mov dword ptr [esi + 0x1b], eax
        pc = 0x8e7523; continue; // 8e6341: jmp 0x8e7523
      case 0x8e6346:
        R.eax = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 8e6346: mov eax, dword ptr [0xde1f54]
        R.ebx = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 8e634b: mov ebx, dword ptr [esp + 0x34]
        R.edx = (((R.esp + 0x54) | 0)) | 0; // 8e634f: lea edx, [esp + 0x54]
        R.ecx = (R.m.u32(((R.eax + 0x856) | 0) >>> 0)) | 0; // 8e6353: mov ecx, dword ptr [eax + 0x856]
        R.eax = (R.m.u32(((R.esp + 0x270) | 0) >>> 0)) | 0; // 8e6359: mov eax, dword ptr [esp + 0x270]
        R.push((R.edx >>> 0)); // 8e6360: push edx
        R.edx = (R.m.u32(((R.esp + 0x278) | 0) >>> 0)) | 0; // 8e6361: mov edx, dword ptr [esp + 0x278]
        R.push((R.eax >>> 0)); // 8e6368: push eax
        R.push((R.ebx >>> 0)); // 8e6369: push ebx
        R.push((R.edx >>> 0)); // 8e636a: push edx
        R.call(0x84b6f0, { n: 4, thisEcx: false, calleeClean: true }); // 8e636b: call 0x84b6f0
        R.edi = ((R.eax >>> 0)) | 0; // 8e6370: mov edi, eax
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 8e6372: test edi, edi
        if (R.zf) { pc = 0x8e6386; continue; } // 8e6374: je 0x8e6386
        pc = 0x8e6376; continue;
      case 0x8e6376:
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 8e6376: mov ecx, dword ptr [0xde1f54]
        R.push((R.ebp >>> 0)); // 8e637c: push ebp
        R.call(0x8d0a70, { n: 1, thisEcx: false, calleeClean: true }); // 8e637d: call 0x8d0a70
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e6382: test eax, eax
        if (R.zf) { pc = 0x8e638b; continue; } // 8e6384: je 0x8e638b
        pc = 0x8e6386; continue;
      case 0x8e6386:
        R.eax = (0x1) | 0; // 8e6386: mov eax, 1
        pc = 0x8e638b; continue;
      case 0x8e638b:
        R.ecx = (R.m.u32(((R.esp + 0x274) | 0) >>> 0)) | 0; // 8e638b: mov ecx, dword ptr [esp + 0x274]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 8e6392: test ecx, ecx
        if (R.zf) { pc = 0x8e644d; continue; } // 8e6394: je 0x8e644d
        pc = 0x8e639a; continue;
      case 0x8e639a:
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e639a: test eax, eax
        if (R.zf) { pc = 0x8e644d; continue; } // 8e639c: je 0x8e644d
        pc = 0x8e63a2; continue;
      case 0x8e63a2:
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 8e63a2: test ebx, ebx
        if (R.zf) { pc = 0x8e63c4; continue; } // 8e63a4: je 0x8e63c4
        pc = 0x8e63a6; continue;
      case 0x8e63a6:
        R.sub(R.m.u8(((R.ecx) | 0) >>> 0), 0xb, 8); // 8e63a6: cmp byte ptr [ecx], 0xb
        if (!R.zf) { pc = 0x8e63c4; continue; } // 8e63a9: jne 0x8e63c4
        pc = 0x8e63ab; continue;
      case 0x8e63ab:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebx + 0x35) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e63ab: mov al, byte ptr [ebx + 0x35]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x3f, 8)) & 0xff) << 0)) | 0; // 8e63ae: and al, 0x3f
        R.sub(((R.eax >>> 0) & 0xff), 0x1, 8); // 8e63b0: cmp al, 1
        if (R.zf) { pc = 0x8e63c4; continue; } // 8e63b2: je 0x8e63c4
        pc = 0x8e63b4; continue;
      case 0x8e63b4:
        R.sub(((R.eax >>> 0) & 0xff), 0x3, 8); // 8e63b4: cmp al, 3
        if (R.zf) { pc = 0x8e63c4; continue; } // 8e63b6: je 0x8e63c4
        pc = 0x8e63b8; continue;
      case 0x8e63b8:
        R.sub(((R.eax >>> 0) & 0xff), 0x5, 8); // 8e63b8: cmp al, 5
        if (R.zf) { pc = 0x8e63c4; continue; } // 8e63ba: je 0x8e63c4
        pc = 0x8e63bc; continue;
      case 0x8e63bc:
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 8e63bc: test edi, edi
        if (R.zf) { pc = 0x8e644d; continue; } // 8e63be: je 0x8e644d
        pc = 0x8e63c4; continue;
      case 0x8e63c4:
        R.edi = (R.m.u32(((R.esp + 0x280) | 0) >>> 0)) | 0; // 8e63c4: mov edi, dword ptr [esp + 0x280]
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 8e63cb: test edi, edi
        if (R.zf) { pc = 0x8e77bd; continue; } // 8e63cd: je 0x8e77bd
        pc = 0x8e63d3; continue;
      case 0x8e63d3:
        R.push(0x50); // 8e63d3: push 0x50
        R.call(0x944cf1, { n: 1, thisEcx: false, calleeClean: false }); // 8e63d5: call 0x944cf1
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8e63da: add esp, 4
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 8e63dd: mov dword ptr [esp + 0x10], eax
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e63e1: test eax, eax
        R.m.w32(((R.esp + 0x264) | 0) >>> 0, 0x2); // 8e63e3: mov dword ptr [esp + 0x264], 2
        if (R.zf) { pc = 0x8e63f9; continue; } // 8e63ee: je 0x8e63f9
        pc = 0x8e63f0; continue;
      case 0x8e63f0:
        R.ecx = ((R.eax >>> 0)) | 0; // 8e63f0: mov ecx, eax
        R.call(0x85e410, { n: 0, thisEcx: true, calleeClean: false }); // 8e63f2: call 0x85e410
        pc = 0x8e63fb; continue; // 8e63f7: jmp 0x8e63fb
      case 0x8e63f9:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8e63f9: xor eax, eax
        pc = 0x8e63fb; continue;
      case 0x8e63fb:
        R.push(0x2); // 8e63fb: push 2
        R.push(0x3ff00000); // 8e63fd: push 0x3ff00000
        R.push(0x0); // 8e6402: push 0
        R.push(0xffffffff); // 8e6404: push -1
        R.m.w32(((R.edi) | 0) >>> 0, (R.eax >>> 0)); // 8e6406: mov dword ptr [edi], eax
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8e6408: mov ecx, dword ptr [0xae1050]
        R.push((R.eax >>> 0)); // 8e640e: push eax
        R.eax = (R.m.u32(((R.esp + 0x284) | 0) >>> 0)) | 0; // 8e640f: mov eax, dword ptr [esp + 0x284]
        R.push((R.eax >>> 0)); // 8e6416: push eax
        R.push((R.ebp >>> 0)); // 8e6417: push ebp
        R.m.w32(((R.esp + 0x280) | 0) >>> 0, 0xffffffff); // 8e6418: mov dword ptr [esp + 0x280], 0xffffffff
        R.call(0x4cda70, { n: 7, thisEcx: true, calleeClean: true }); // 8e6423: call 0x4cda70
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e6428: test eax, eax
        if (!R.zf) { pc = 0x8e6444; continue; } // 8e642a: jne 0x8e6444
        pc = 0x8e642c; continue;
      case 0x8e642c:
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 8e642c: mov eax, dword ptr [edi]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e642e: test eax, eax
        if (R.zf) { pc = 0x8e77bd; continue; } // 8e6430: je 0x8e77bd
        pc = 0x8e6436; continue;
      case 0x8e6436:
        R.push((R.eax >>> 0)); // 8e6436: push eax
        R.call(0x944c94, { n: 1, thisEcx: false, calleeClean: false }); // 8e6437: call 0x944c94
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8e643c: add esp, 4
        pc = 0x8e77bd; continue; // 8e643f: jmp 0x8e77bd
      case 0x8e6444:
        R.m.w8(((R.esi + 0x2f) | 0) >>> 0, 0x1); // 8e6444: mov byte ptr [esi + 0x2f], 1
        pc = 0x8e7523; continue; // 8e6448: jmp 0x8e7523
      case 0x8e644d:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8e644d: mov ecx, dword ptr [0xae1050]
        R.push((R.ebp >>> 0)); // 8e6453: push ebp
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 8e6454: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e6459: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 8e645b: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x8e647a; continue; } // 8e6460: je 0x8e647a
        pc = 0x8e6462; continue;
      case 0x8e6462:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 8e6462: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 8e6465: mov edx, dword ptr [0xae23b4]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 8e646b: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 8e646e: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 8e6471: add ecx, eax
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8e6473: add edx, eax
        R.ebx = (((R.edx + R.ecx * 4) | 0)) | 0; // 8e6475: lea ebx, [edx + ecx*4]
        pc = 0x8e647c; continue; // 8e6478: jmp 0x8e647c
      case 0x8e647a:
        R.ebx = (R.logic((R.ebx >>> 0) ^ (R.ebx >>> 0), 32)) | 0; // 8e647a: xor ebx, ebx
        pc = 0x8e647c; continue;
      case 0x8e647c:
        R.eax = (R.m.u32(((R.esp + 0x274) | 0) >>> 0)) | 0; // 8e647c: mov eax, dword ptr [esp + 0x274]
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.ebx >>> 0)); // 8e6483: mov dword ptr [esp + 0x38], ebx
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e6487: test eax, eax
        if (R.zf) { pc = 0x8e6563; continue; } // 8e6489: je 0x8e6563
        pc = 0x8e648f; continue;
      case 0x8e648f:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e648f: mov al, byte ptr [eax]
        R.sub(((R.eax >>> 0) & 0xff), 0xb, 8); // 8e6491: cmp al, 0xb
        if (!R.zf) { pc = 0x8e6563; continue; } // 8e6493: jne 0x8e6563
        pc = 0x8e6499; continue;
      case 0x8e6499:
        R.ecx = (R.m.u32(((R.ebp + 0x61) | 0) >>> 0)) | 0; // 8e6499: mov ecx, dword ptr [ebp + 0x61]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 8e649c: test ecx, ecx
        if (R.zf) { pc = 0x8e77bd; continue; } // 8e649e: je 0x8e77bd
        pc = 0x8e64a4; continue;
      case 0x8e64a4:
        R.sub(((R.eax >>> 0) & 0xff), ((R.eax >>> 0) & 0xff), 8); // 8e64a4: cmp al, al
        if (!R.zf) { pc = 0x8e6563; continue; } // 8e64a6: jne 0x8e6563
        pc = 0x8e64ac; continue;
      case 0x8e64ac:
        R.eax = ((R.ecx >>> 0)) | 0; // 8e64ac: mov eax, ecx
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e64ae: test eax, eax
        if (R.zf) { pc = 0x8e6563; continue; } // 8e64b0: je 0x8e6563
        pc = 0x8e64b6; continue;
      case 0x8e64b6:
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 8e64b6: test ebx, ebx
        if (R.zf) { pc = 0x8e651d; continue; } // 8e64b8: je 0x8e651d
        pc = 0x8e64ba; continue;
      case 0x8e64ba:
        R.push(0x0); // 8e64ba: push 0
        R.push(0x0); // 8e64bc: push 0
        R.push(0x1); // 8e64be: push 1
        R.push(0x0); // 8e64c0: push 0
        R.push((R.ebx >>> 0)); // 8e64c2: push ebx
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 8e64c3: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8e64c8: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e64cb: test eax, eax
        if (R.zf) { pc = 0x8e651d; continue; } // 8e64cd: je 0x8e651d
        pc = 0x8e64cf; continue;
      case 0x8e64cf:
        R.eax = (R.m.u32(((R.esp + 0x270) | 0) >>> 0)) | 0; // 8e64cf: mov eax, dword ptr [esp + 0x270]
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8e64d6: mov ecx, dword ptr [0xae1050]
        R.push((R.ebp >>> 0)); // 8e64dc: push ebp
        R.push((R.eax >>> 0)); // 8e64dd: push eax
        R.push((R.ebx >>> 0)); // 8e64de: push ebx
        R.call(0x4d42d0, { n: 3, thisEcx: true, calleeClean: true }); // 8e64df: call 0x4d42d0
        R.edi = ((R.eax >>> 0)) | 0; // 8e64e4: mov edi, eax
        R.push(0x0); // 8e64e6: push 0
        R.push((R.ebp >>> 0)); // 8e64e8: push ebp
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 8e64e9: mov dword ptr [esp + 0x38], edi
        R.call(0x5444a0, { n: 2, thisEcx: false, calleeClean: false }); // 8e64ed: call 0x5444a0
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 8e64f2: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e64f5: test eax, eax
        if (R.zf) { pc = 0x8e6569; continue; } // 8e64f7: je 0x8e6569
        pc = 0x8e64f9; continue;
      case 0x8e64f9:
        R.eax = (0x55555556) | 0; // 8e64f9: mov eax, 0x55555556
        R.ecx = (((R.edi + -0x16e360) | 0)) | 0; // 8e64fe: lea ecx, [edi - 0x16e360]
        { const p = BigInt(R.eax | 0) * BigInt((((R.edi >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 8e6504: imul edi
        R.eax = ((R.edx >>> 0)) | 0; // 8e6506: mov eax, edx
        R.eax = (R.shr((R.eax >>> 0), 0x1f, 32)) | 0; // 8e6508: shr eax, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8e650b: add edx, eax
        R.sub((R.edx >>> 0), (R.ecx >>> 0), 32); // 8e650d: cmp edx, ecx
        if (R.cLE) { pc = 0x8e6517; continue; } // 8e650f: jle 0x8e6517
        pc = 0x8e6511; continue;
      case 0x8e6511:
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edx >>> 0)); // 8e6511: mov dword ptr [esp + 0x14], edx
        pc = 0x8e6569; continue; // 8e6515: jmp 0x8e6569
      case 0x8e6517:
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.ecx >>> 0)); // 8e6517: mov dword ptr [esp + 0x14], ecx
        pc = 0x8e6569; continue; // 8e651b: jmp 0x8e6569
      case 0x8e651d:
        R.ecx = (R.m.u32(((R.esp + 0x270) | 0) >>> 0)) | 0; // 8e651d: mov ecx, dword ptr [esp + 0x270]
        R.push(0x1); // 8e6524: push 1
        R.push(0x1); // 8e6526: push 1
        R.push(0x0); // 8e6528: push 0
        R.push((R.ebp >>> 0)); // 8e652a: push ebp
        R.push((R.ecx >>> 0)); // 8e652b: push ecx
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8e652c: mov ecx, dword ptr [0xae1050]
        R.push((R.ebx >>> 0)); // 8e6532: push ebx
        R.call(0x4d1600, { n: 6, thisEcx: true, calleeClean: true }); // 8e6533: call 0x4d1600
        R.edx = (R.m.u32(((R.esp + 0x270) | 0) >>> 0)) | 0; // 8e6538: mov edx, dword ptr [esp + 0x270]
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8e653f: mov ecx, dword ptr [0xae1050]
        R.push(0x0); // 8e6545: push 0
        R.push(0x1); // 8e6547: push 1
        R.push(0x0); // 8e6549: push 0
        R.push((R.ebp >>> 0)); // 8e654b: push ebp
        R.edi = ((R.eax >>> 0)) | 0; // 8e654c: mov edi, eax
        R.push((R.edx >>> 0)); // 8e654e: push edx
        R.push((R.ebx >>> 0)); // 8e654f: push ebx
        R.m.w32(((R.esp + 0x48) | 0) >>> 0, (R.edi >>> 0)); // 8e6550: mov dword ptr [esp + 0x48], edi
        R.call(0x4d1600, { n: 6, thisEcx: true, calleeClean: true }); // 8e6554: call 0x4d1600
        R.ecx = ((R.edi >>> 0)) | 0; // 8e6559: mov ecx, edi
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 8e655b: sub ecx, eax
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.ecx >>> 0)); // 8e655d: mov dword ptr [esp + 0x2c], ecx
        pc = 0x8e6569; continue; // 8e6561: jmp 0x8e6569
      case 0x8e6563:
        R.edi = (R.logic((R.edi >>> 0) ^ (R.edi >>> 0), 32)) | 0; // 8e6563: xor edi, edi
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.edi >>> 0)); // 8e6565: mov dword ptr [esp + 0x30], edi
        pc = 0x8e6569; continue;
      case 0x8e6569:
        R.ebx = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 8e6569: mov ebx, dword ptr [esp + 0x34]
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 8e656d: test ebx, ebx
        if (R.zf) { pc = 0x8e6591; continue; } // 8e656f: je 0x8e6591
        pc = 0x8e6571; continue;
      case 0x8e6571:
        R.ecx = ((R.ebx >>> 0)) | 0; // 8e6571: mov ecx, ebx
        R.call(0x867b50, { n: 0, thisEcx: true, calleeClean: false }); // 8e6573: call 0x867b50
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e6578: test eax, eax
        if (R.zf) { pc = 0x8e6591; continue; } // 8e657a: je 0x8e6591
        pc = 0x8e657c; continue;
      case 0x8e657c:
        R.eax = (R.m.u32(((R.ebx + 0x21) | 0) >>> 0)) | 0; // 8e657c: mov eax, dword ptr [ebx + 0x21]
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 8e657f: cmp edi, eax
        if (R.cLE) { pc = 0x8e6591; continue; } // 8e6581: jle 0x8e6591
        pc = 0x8e6583; continue;
      case 0x8e6583:
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.eax >>> 0)); // 8e6583: mov dword ptr [esp + 0x30], eax
        R.eax = (R.m.u32(((R.esi + 0x31) | 0) >>> 0)) | 0; // 8e6587: mov eax, dword ptr [esi + 0x31]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf1, 8)) & 0xff) << 0)) | 0; // 8e658a: and al, 0xf1
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) | 0x1, 8)) & 0xff) << 0)) | 0; // 8e658c: or al, 1
        R.m.w32(((R.esi + 0x31) | 0) >>> 0, (R.eax >>> 0)); // 8e658e: mov dword ptr [esi + 0x31], eax
        pc = 0x8e6591; continue;
      case 0x8e6591:
        R.eax = (R.m.u32(((R.esp + 0x274) | 0) >>> 0)) | 0; // 8e6591: mov eax, dword ptr [esp + 0x274]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e6598: test eax, eax
        if (R.zf) { pc = 0x8e65cf; continue; } // 8e659a: je 0x8e65cf
        pc = 0x8e659c; continue;
      case 0x8e659c:
        R.sub(R.m.u8(((R.eax) | 0) >>> 0), 0xb, 8); // 8e659c: cmp byte ptr [eax], 0xb
        if (!R.zf) { pc = 0x8e65cf; continue; } // 8e659f: jne 0x8e65cf
        pc = 0x8e65a1; continue;
      case 0x8e65a1:
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 8e65a1: mov ecx, dword ptr [0xde1f54]
        R.push(0x1); // 8e65a7: push 1
        R.edx = (((R.esp + 0x5c) | 0)) | 0; // 8e65a9: lea edx, [esp + 0x5c]
        R.push(0xffffffff); // 8e65ad: push -1
        R.ecx = (R.m.u32(((R.ecx + 0x856) | 0) >>> 0)) | 0; // 8e65af: mov ecx, dword ptr [ecx + 0x856]
        R.edi = ((R.eax >>> 0)) | 0; // 8e65b5: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x278) | 0) >>> 0)) | 0; // 8e65b7: mov eax, dword ptr [esp + 0x278]
        R.push((R.edx >>> 0)); // 8e65be: push edx
        R.push((R.edi >>> 0)); // 8e65bf: push edi
        R.push((R.ebp >>> 0)); // 8e65c0: push ebp
        R.push((R.eax >>> 0)); // 8e65c1: push eax
        R.call(0x840d80, { n: 6, thisEcx: true, calleeClean: true }); // 8e65c2: call 0x840d80
        R.ebx = ((R.eax >>> 0)) | 0; // 8e65c7: mov ebx, eax
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ebx >>> 0)); // 8e65c9: mov dword ptr [esp + 0x1c], ebx
        pc = 0x8e65dc; continue; // 8e65cd: jmp 0x8e65dc
      case 0x8e65cf:
        R.edi = (R.m.u32(((R.esp + 0x274) | 0) >>> 0)) | 0; // 8e65cf: mov edi, dword ptr [esp + 0x274]
        R.ebx = (R.logic((R.ebx >>> 0) ^ (R.ebx >>> 0), 32)) | 0; // 8e65d6: xor ebx, ebx
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ebx >>> 0)); // 8e65d8: mov dword ptr [esp + 0x1c], ebx
        pc = 0x8e65dc; continue;
      case 0x8e65dc:
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 8e65dc: test edi, edi
        if (R.zf) { pc = 0x8e66f6; continue; } // 8e65de: je 0x8e66f6
        pc = 0x8e65e4; continue;
      case 0x8e65e4:
        R.sub(R.m.u8(((R.edi) | 0) >>> 0), 0xb, 8); // 8e65e4: cmp byte ptr [edi], 0xb
        if (!R.zf) { pc = 0x8e66f6; continue; } // 8e65e7: jne 0x8e66f6
        pc = 0x8e65ed; continue;
      case 0x8e65ed:
        R.edi = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 8e65ed: mov edi, dword ptr [esp + 0x38]
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 8e65f1: test edi, edi
        if (R.zf) { pc = 0x8e66fa; continue; } // 8e65f3: je 0x8e66fa
        pc = 0x8e65f9; continue;
      case 0x8e65f9:
        R.ecx = (R.m.u32(((0xae2a38) | 0) >>> 0)) | 0; // 8e65f9: mov ecx, dword ptr [0xae2a38]
        R.push((R.edi >>> 0)); // 8e65ff: push edi
        R.call(0x5a0590, { n: 1, thisEcx: true, calleeClean: true }); // 8e6600: call 0x5a0590
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e6605: test eax, eax
        if (R.zf) { pc = 0x8e66fa; continue; } // 8e6607: je 0x8e66fa
        pc = 0x8e660d; continue;
      case 0x8e660d:
        R.ecx = (R.m.u32(((0xae2a38) | 0) >>> 0)) | 0; // 8e660d: mov ecx, dword ptr [0xae2a38]
        R.push((R.edi >>> 0)); // 8e6613: push edi
        R.call(0x5a0590, { n: 1, thisEcx: true, calleeClean: true }); // 8e6614: call 0x5a0590
        R.sub(R.m.u8(((R.eax + 0x165) | 0) >>> 0), 0x1, 8); // 8e6619: cmp byte ptr [eax + 0x165], 1
        if (!R.zf) { pc = 0x8e66fa; continue; } // 8e6620: jne 0x8e66fa
        pc = 0x8e6626; continue;
      case 0x8e6626:
        R.push(0x0); // 8e6626: push 0
        R.push(0x0); // 8e6628: push 0
        R.push(0x1); // 8e662a: push 1
        R.push(0x0); // 8e662c: push 0
        R.push((R.edi >>> 0)); // 8e662e: push edi
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 8e662f: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8e6634: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e6637: test eax, eax
        if (R.zf) { pc = 0x8e66bf; continue; } // 8e6639: je 0x8e66bf
        pc = 0x8e663f; continue;
      case 0x8e663f:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8e663f: mov ecx, dword ptr [0xae1050]
        R.push(0x0); // 8e6645: push 0
        R.push(0xffffffff); // 8e6647: push -1
        R.push(0x0); // 8e6649: push 0
        R.push((R.edi >>> 0)); // 8e664b: push edi
        R.push((R.ebp >>> 0)); // 8e664c: push ebp
        R.call(0x4d0c60, { n: 5, thisEcx: false, calleeClean: true }); // 8e664d: call 0x4d0c60
        R.sub((R.ebx >>> 0), (R.eax >>> 0), 32); // 8e6652: cmp ebx, eax
        if (!R.cL) { pc = 0x8e665a; continue; } // 8e6654: jge 0x8e665a
        pc = 0x8e6656; continue;
      case 0x8e6656:
        R.eax = ((R.ebx >>> 0)) | 0; // 8e6656: mov eax, ebx
        pc = 0x8e666d; continue; // 8e6658: jmp 0x8e666d
      case 0x8e665a:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8e665a: mov ecx, dword ptr [0xae1050]
        R.push(0x0); // 8e6660: push 0
        R.push(0xffffffff); // 8e6662: push -1
        R.push(0x0); // 8e6664: push 0
        R.push((R.edi >>> 0)); // 8e6666: push edi
        R.push((R.ebp >>> 0)); // 8e6667: push ebp
        R.call(0x4d0c60, { n: 5, thisEcx: false, calleeClean: true }); // 8e6668: call 0x4d0c60
        pc = 0x8e666d; continue;
      case 0x8e666d:
        R.ecx = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 8e666d: mov ecx, dword ptr [esp + 0x30]
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 8e6671: cmp ecx, eax
        if (!R.cL) { pc = 0x8e6685; continue; } // 8e6673: jge 0x8e6685
        pc = 0x8e6675; continue;
      case 0x8e6675:
        R.ebx = ((R.ecx >>> 0)) | 0; // 8e6675: mov ebx, ecx
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, 0x1); // 8e6677: mov dword ptr [esp + 0x10], 1
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ebx >>> 0)); // 8e667f: mov dword ptr [esp + 0x1c], ebx
        pc = 0x8e66fa; continue; // 8e6683: jmp 0x8e66fa
      case 0x8e6685:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8e6685: mov ecx, dword ptr [0xae1050]
        R.push(0x0); // 8e668b: push 0
        R.push(0xffffffff); // 8e668d: push -1
        R.push(0x0); // 8e668f: push 0
        R.push((R.edi >>> 0)); // 8e6691: push edi
        R.push((R.ebp >>> 0)); // 8e6692: push ebp
        R.call(0x4d0c60, { n: 5, thisEcx: false, calleeClean: true }); // 8e6693: call 0x4d0c60
        R.sub((R.ebx >>> 0), (R.eax >>> 0), 32); // 8e6698: cmp ebx, eax
        if (R.cL) { pc = 0x8e66ec; continue; } // 8e669a: jl 0x8e66ec
        pc = 0x8e669c; continue;
      case 0x8e669c:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8e669c: mov ecx, dword ptr [0xae1050]
        R.push(0x0); // 8e66a2: push 0
        R.push(0xffffffff); // 8e66a4: push -1
        R.push(0x0); // 8e66a6: push 0
        R.push((R.edi >>> 0)); // 8e66a8: push edi
        R.push((R.ebp >>> 0)); // 8e66a9: push ebp
        R.call(0x4d0c60, { n: 5, thisEcx: false, calleeClean: true }); // 8e66aa: call 0x4d0c60
        R.ebx = ((R.eax >>> 0)) | 0; // 8e66af: mov ebx, eax
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, 0x1); // 8e66b1: mov dword ptr [esp + 0x10], 1
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ebx >>> 0)); // 8e66b9: mov dword ptr [esp + 0x1c], ebx
        pc = 0x8e66fa; continue; // 8e66bd: jmp 0x8e66fa
      case 0x8e66bf:
        R.eax = (R.m.u32(((R.ebp + 0x52) | 0) >>> 0)) | 0; // 8e66bf: mov eax, dword ptr [ebp + 0x52]
        R.ecx = ((R.ebx >>> 0)) | 0; // 8e66c2: mov ecx, ebx
        R.sub((R.ebx >>> 0), (R.eax >>> 0), 32); // 8e66c4: cmp ebx, eax
        if (R.cL) { pc = 0x8e66ca; continue; } // 8e66c6: jl 0x8e66ca
        pc = 0x8e66c8; continue;
      case 0x8e66c8:
        R.ecx = ((R.eax >>> 0)) | 0; // 8e66c8: mov ecx, eax
        pc = 0x8e66ca; continue;
      case 0x8e66ca:
        R.edx = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 8e66ca: mov edx, dword ptr [esp + 0x30]
        R.sub((R.edx >>> 0), (R.ecx >>> 0), 32); // 8e66ce: cmp edx, ecx
        if (!R.cL) { pc = 0x8e66e2; continue; } // 8e66d0: jge 0x8e66e2
        pc = 0x8e66d2; continue;
      case 0x8e66d2:
        R.ebx = ((R.edx >>> 0)) | 0; // 8e66d2: mov ebx, edx
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, 0x1); // 8e66d4: mov dword ptr [esp + 0x10], 1
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ebx >>> 0)); // 8e66dc: mov dword ptr [esp + 0x1c], ebx
        pc = 0x8e66fa; continue; // 8e66e0: jmp 0x8e66fa
      case 0x8e66e2:
        R.sub((R.ebx >>> 0), (R.eax >>> 0), 32); // 8e66e2: cmp ebx, eax
        if (R.cL) { pc = 0x8e66ec; continue; } // 8e66e4: jl 0x8e66ec
        pc = 0x8e66e6; continue;
      case 0x8e66e6:
        R.ebx = ((R.eax >>> 0)) | 0; // 8e66e6: mov ebx, eax
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ebx >>> 0)); // 8e66e8: mov dword ptr [esp + 0x1c], ebx
        pc = 0x8e66ec; continue;
      case 0x8e66ec:
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, 0x1); // 8e66ec: mov dword ptr [esp + 0x10], 1
        pc = 0x8e66fa; continue; // 8e66f4: jmp 0x8e66fa
      case 0x8e66f6:
        R.edi = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 8e66f6: mov edi, dword ptr [esp + 0x38]
        pc = 0x8e66fa; continue;
      case 0x8e66fa:
        R.ecx = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 8e66fa: mov ecx, dword ptr [esp + 0x30]
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 8e66fe: test edi, edi
        R.m.w32(((R.esi + 0x1b) | 0) >>> 0, (R.ecx >>> 0)); // 8e6700: mov dword ptr [esi + 0x1b], ecx
        if (R.zf) { pc = 0x8e698a; continue; } // 8e6703: je 0x8e698a
        pc = 0x8e6709; continue;
      case 0x8e6709:
        R.push(0xf4240); // 8e6709: push 0xf4240
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e670e: call 0x90cfc0
        R.ecx = (R.m.u32(((R.esi + 0x1b) | 0) >>> 0)) | 0; // 8e6713: mov ecx, dword ptr [esi + 0x1b]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8e6716: add esp, 4
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 8e6719: cmp ecx, eax
        if (R.cLE) { pc = 0x8e698a; continue; } // 8e671b: jle 0x8e698a
        pc = 0x8e6721; continue;
      case 0x8e6721:
        R.edx = (R.m.u32(((R.esp + 0x270) | 0) >>> 0)) | 0; // 8e6721: mov edx, dword ptr [esp + 0x270]
        R.ecx = (R.m.u32(((0x9cf2e4) | 0) >>> 0)) | 0; // 8e6728: mov ecx, dword ptr [0x9cf2e4]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, 0x0); // 8e672e: mov dword ptr [esp + 0x24], 0
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0x40000000); // 8e6736: mov dword ptr [esp + 0x28], 0x40000000
        R.eax = (R.m.u32(((R.edx + 0x53) | 0) >>> 0)) | 0; // 8e673e: mov eax, dword ptr [edx + 0x53]
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8e6741: mov eax, dword ptr [eax]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 8e6743: cmp eax, ecx
        if (R.zf) { pc = 0x8e674f; continue; } // 8e6745: je 0x8e674f
        pc = 0x8e6747; continue;
      case 0x8e6747:
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf45c) | 0) >>> 0), 32); // 8e6747: cmp eax, dword ptr [0x9cf45c]
        if (!R.zf) { pc = 0x8e675f; continue; } // 8e674d: jne 0x8e675f
        pc = 0x8e674f; continue;
      case 0x8e674f:
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, 0x0); // 8e674f: mov dword ptr [esp + 0x24], 0
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0x3fe80000); // 8e6757: mov dword ptr [esp + 0x28], 0x3fe80000
        pc = 0x8e675f; continue;
      case 0x8e675f:
        R.ecx = (R.m.u32(((R.esp + 0x270) | 0) >>> 0)) | 0; // 8e675f: mov ecx, dword ptr [esp + 0x270]
        R.push((R.ecx >>> 0)); // 8e6766: push ecx
        R.ecx = (R.m.u32(((0xae2a38) | 0) >>> 0)) | 0; // 8e6767: mov ecx, dword ptr [0xae2a38]
        R.call(0x5a0590, { n: 1, thisEcx: true, calleeClean: true }); // 8e676d: call 0x5a0590
        R.ecx = ((R.eax >>> 0)) | 0; // 8e6772: mov ecx, eax
        R.call(0x5986b0, { n: 0, thisEcx: true, calleeClean: false }); // 8e6774: call 0x5986b0
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 8e6779: movsx eax, al
        R.eax = (R.add((R.eax >>> 0), 0x2, 32)) | 0; // 8e677c: add eax, 2
        R.sub((R.eax >>> 0), 0x4, 32); // 8e677f: cmp eax, 4
        if (!R.cBE) { pc = 0x8e67c9; continue; } // 8e6782: ja 0x8e67c9
        pc = 0x8e6784; continue;
      case 0x8e6784:
        pc = [0x8e67bb, 0x8e67af, 0x8e67a3, 0x8e6797, 0x8e678b][R.eax >>> 0]; continue; // 8e6784: jmp dword ptr [eax*4 + 0x8e77dc]
      case 0x8e678b:
        R.fpush(R.f64(((R.esp + 0x24) | 0))); // 8e678b: fld qword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 0.1; // 8e678f: fmul qword ptr [0x967880]
        pc = 0x8e67c5; continue; // 8e6795: jmp 0x8e67c5
      case 0x8e6797:
        R.fpush(R.f64(((R.esp + 0x24) | 0))); // 8e6797: fld qword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 0.4; // 8e679b: fmul qword ptr [0x968e00]
        pc = 0x8e67c5; continue; // 8e67a1: jmp 0x8e67c5
      case 0x8e67a3:
        R.fpush(R.f64(((R.esp + 0x24) | 0))); // 8e67a3: fld qword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 0.8; // 8e67a7: fmul qword ptr [0x9689b0]
        pc = 0x8e67c5; continue; // 8e67ad: jmp 0x8e67c5
      case 0x8e67af:
        R.fpush(R.f64(((R.esp + 0x24) | 0))); // 8e67af: fld qword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 1.5; // 8e67b3: fmul qword ptr [0x968940]
        pc = 0x8e67c5; continue; // 8e67b9: jmp 0x8e67c5
      case 0x8e67bb:
        R.fpush(R.f64(((R.esp + 0x24) | 0))); // 8e67bb: fld qword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 2.5; // 8e67bf: fmul qword ptr [0x968e18]
        pc = 0x8e67c5; continue;
      case 0x8e67c5:
        R.m.wf64(((R.esp + 0x24) | 0) >>> 0, R.st[0]); R.fpop(); // 8e67c5: fstp qword ptr [esp + 0x24]
        pc = 0x8e67c9; continue;
      case 0x8e67c9:
        R.ecx = (R.m.u32(((0xae2a38) | 0) >>> 0)) | 0; // 8e67c9: mov ecx, dword ptr [0xae2a38]
        R.push((R.edi >>> 0)); // 8e67cf: push edi
        R.call(0x5a0590, { n: 1, thisEcx: true, calleeClean: true }); // 8e67d0: call 0x5a0590
        R.ecx = ((R.eax >>> 0)) | 0; // 8e67d5: mov ecx, eax
        R.call(0x5986b0, { n: 0, thisEcx: true, calleeClean: false }); // 8e67d7: call 0x5986b0
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 8e67dc: movsx eax, al
        R.eax = (R.add((R.eax >>> 0), 0x2, 32)) | 0; // 8e67df: add eax, 2
        R.sub((R.eax >>> 0), 0x4, 32); // 8e67e2: cmp eax, 4
        if (!R.cBE) { pc = 0x8e682a; continue; } // 8e67e5: ja 0x8e682a
        pc = 0x8e67e7; continue;
      case 0x8e67e7:
        pc = [0x8e681e, 0x8e6812, 0x8e6806, 0x8e67fa, 0x8e67ee][R.eax >>> 0]; continue; // 8e67e7: jmp dword ptr [eax*4 + 0x8e77f0]
      case 0x8e67ee:
        R.fpush(R.f64(((R.esp + 0x24) | 0))); // 8e67ee: fld qword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 2.5; // 8e67f2: fmul qword ptr [0x968e18]
        pc = 0x8e682e; continue; // 8e67f8: jmp 0x8e682e
      case 0x8e67fa:
        R.fpush(R.f64(((R.esp + 0x24) | 0))); // 8e67fa: fld qword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 1.5; // 8e67fe: fmul qword ptr [0x968940]
        pc = 0x8e682e; continue; // 8e6804: jmp 0x8e682e
      case 0x8e6806:
        R.fpush(R.f64(((R.esp + 0x24) | 0))); // 8e6806: fld qword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 0.8; // 8e680a: fmul qword ptr [0x9689b0]
        pc = 0x8e682e; continue; // 8e6810: jmp 0x8e682e
      case 0x8e6812:
        R.fpush(R.f64(((R.esp + 0x24) | 0))); // 8e6812: fld qword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 0.4; // 8e6816: fmul qword ptr [0x968e00]
        pc = 0x8e682e; continue; // 8e681c: jmp 0x8e682e
      case 0x8e681e:
        R.fpush(R.f64(((R.esp + 0x24) | 0))); // 8e681e: fld qword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 0.1; // 8e6822: fmul qword ptr [0x967880]
        pc = 0x8e682e; continue; // 8e6828: jmp 0x8e682e
      case 0x8e682a:
        R.fpush(R.f64(((R.esp + 0x24) | 0))); // 8e682a: fld qword ptr [esp + 0x24]
        pc = 0x8e682e; continue;
      case 0x8e682e:
        R.fcom(R.st[0], 3.0); // 8e682e: fcom qword ptr [0x968930]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8e6834: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 8e6836: test ah, 0x41
        if (!R.zf) { pc = 0x8e6887; continue; } // 8e6839: jne 0x8e6887
        pc = 0x8e683b; continue;
      case 0x8e683b:
        R.fpop(); // 8e683b: fstp st(0)
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 8e683d: fild dword ptr [esp + 0x1c]
        R.m.w8(((R.esi + 0x40) | 0) >>> 0, 0x18); // 8e6841: mov byte ptr [esi + 0x40], 0x18
        R.st[0] = R.st[0] * 1.6666666666666667; // 8e6845: fmul qword ptr [0x96f9a8]
        R.ftol(); // 8e684b: call 0x945640
        R.fpush(R.m.s32(((R.esi + 0x1b) | 0) >>> 0)); // 8e6850: fild dword ptr [esi + 0x1b]
        R.ebx = ((R.eax >>> 0)) | 0; // 8e6853: mov ebx, eax
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ebx >>> 0)); // 8e6855: mov dword ptr [esp + 0x1c], ebx
        R.st[0] = R.st[0] * 1.6666666666666667; // 8e6859: fmul qword ptr [0x96f9a8]
        R.ftol(); // 8e685f: call 0x945640
        R.fpush(R.m.s32(((R.esp + 0x278) | 0) >>> 0)); // 8e6864: fild dword ptr [esp + 0x278]
        R.m.w32(((R.esi + 0x1b) | 0) >>> 0, (R.eax >>> 0)); // 8e686b: mov dword ptr [esi + 0x1b], eax
        R.st[0] = R.st[0] * 1.6666666666666667; // 8e686e: fmul qword ptr [0x96f9a8]
        R.ftol(); // 8e6874: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 8e6879: mov edi, eax
        R.m.w32(((R.esp + 0x278) | 0) >>> 0, (R.edi >>> 0)); // 8e687b: mov dword ptr [esp + 0x278], edi
        pc = 0x8e6991; continue; // 8e6882: jmp 0x8e6991
      case 0x8e6887:
        R.fcom(R.st[0], 2.4); // 8e6887: fcom qword ptr [0x970448]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8e688d: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 8e688f: test ah, 0x41
        if (!R.zf) { pc = 0x8e68e0; continue; } // 8e6892: jne 0x8e68e0
        pc = 0x8e6894; continue;
      case 0x8e6894:
        R.fpop(); // 8e6894: fstp st(0)
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 8e6896: fild dword ptr [esp + 0x1c]
        R.m.w8(((R.esi + 0x40) | 0) >>> 0, 0x12); // 8e689a: mov byte ptr [esi + 0x40], 0x12
        R.st[0] = R.st[0] * 1.4285714285714286; // 8e689e: fmul qword ptr [0x970440]
        R.ftol(); // 8e68a4: call 0x945640
        R.fpush(R.m.s32(((R.esi + 0x1b) | 0) >>> 0)); // 8e68a9: fild dword ptr [esi + 0x1b]
        R.ebx = ((R.eax >>> 0)) | 0; // 8e68ac: mov ebx, eax
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ebx >>> 0)); // 8e68ae: mov dword ptr [esp + 0x1c], ebx
        R.st[0] = R.st[0] * 1.4285714285714286; // 8e68b2: fmul qword ptr [0x970440]
        R.ftol(); // 8e68b8: call 0x945640
        R.fpush(R.m.s32(((R.esp + 0x278) | 0) >>> 0)); // 8e68bd: fild dword ptr [esp + 0x278]
        R.m.w32(((R.esi + 0x1b) | 0) >>> 0, (R.eax >>> 0)); // 8e68c4: mov dword ptr [esi + 0x1b], eax
        R.st[0] = R.st[0] * 1.4285714285714286; // 8e68c7: fmul qword ptr [0x970440]
        R.ftol(); // 8e68cd: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 8e68d2: mov edi, eax
        R.m.w32(((R.esp + 0x278) | 0) >>> 0, (R.edi >>> 0)); // 8e68d4: mov dword ptr [esp + 0x278], edi
        pc = 0x8e6991; continue; // 8e68db: jmp 0x8e6991
      case 0x8e68e0:
        R.fcom(R.st[0], 1.6); // 8e68e0: fcom qword ptr [0x969018]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8e68e6: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 8e68e8: test ah, 0x41
        if (!R.zf) { pc = 0x8e6936; continue; } // 8e68eb: jne 0x8e6936
        pc = 0x8e68ed; continue;
      case 0x8e68ed:
        R.fpop(); // 8e68ed: fstp st(0)
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 8e68ef: fild dword ptr [esp + 0x1c]
        R.m.w8(((R.esi + 0x40) | 0) >>> 0, 0xc); // 8e68f3: mov byte ptr [esi + 0x40], 0xc
        R.st[0] = R.st[0] * 1.25; // 8e68f7: fmul qword ptr [0x968928]
        R.ftol(); // 8e68fd: call 0x945640
        R.fpush(R.m.s32(((R.esi + 0x1b) | 0) >>> 0)); // 8e6902: fild dword ptr [esi + 0x1b]
        R.ebx = ((R.eax >>> 0)) | 0; // 8e6905: mov ebx, eax
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ebx >>> 0)); // 8e6907: mov dword ptr [esp + 0x1c], ebx
        R.st[0] = R.st[0] * 1.25; // 8e690b: fmul qword ptr [0x968928]
        R.ftol(); // 8e6911: call 0x945640
        R.fpush(R.m.s32(((R.esp + 0x278) | 0) >>> 0)); // 8e6916: fild dword ptr [esp + 0x278]
        R.m.w32(((R.esi + 0x1b) | 0) >>> 0, (R.eax >>> 0)); // 8e691d: mov dword ptr [esi + 0x1b], eax
        R.st[0] = R.st[0] * 1.25; // 8e6920: fmul qword ptr [0x968928]
        R.ftol(); // 8e6926: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 8e692b: mov edi, eax
        R.m.w32(((R.esp + 0x278) | 0) >>> 0, (R.edi >>> 0)); // 8e692d: mov dword ptr [esp + 0x278], edi
        pc = 0x8e6991; continue; // 8e6934: jmp 0x8e6991
      case 0x8e6936:
        R.fcom(R.st[0], 1.0); R.fpop(); // 8e6936: fcomp qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8e693c: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 8e693e: test ah, 0x41
        if (!R.zf) { pc = 0x8e698a; continue; } // 8e6941: jne 0x8e698a
        pc = 0x8e6943; continue;
      case 0x8e6943:
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 8e6943: fild dword ptr [esp + 0x1c]
        R.m.w8(((R.esi + 0x40) | 0) >>> 0, 0x6); // 8e6947: mov byte ptr [esi + 0x40], 6
        R.st[0] = R.st[0] * 1.1111111111111112; // 8e694b: fmul qword ptr [0x96f998]
        R.ftol(); // 8e6951: call 0x945640
        R.fpush(R.m.s32(((R.esi + 0x1b) | 0) >>> 0)); // 8e6956: fild dword ptr [esi + 0x1b]
        R.ebx = ((R.eax >>> 0)) | 0; // 8e6959: mov ebx, eax
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ebx >>> 0)); // 8e695b: mov dword ptr [esp + 0x1c], ebx
        R.st[0] = R.st[0] * 1.1111111111111112; // 8e695f: fmul qword ptr [0x96f998]
        R.ftol(); // 8e6965: call 0x945640
        R.fpush(R.m.s32(((R.esp + 0x278) | 0) >>> 0)); // 8e696a: fild dword ptr [esp + 0x278]
        R.m.w32(((R.esi + 0x1b) | 0) >>> 0, (R.eax >>> 0)); // 8e6971: mov dword ptr [esi + 0x1b], eax
        R.st[0] = R.st[0] * 1.1111111111111112; // 8e6974: fmul qword ptr [0x96f998]
        R.ftol(); // 8e697a: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 8e697f: mov edi, eax
        R.m.w32(((R.esp + 0x278) | 0) >>> 0, (R.edi >>> 0)); // 8e6981: mov dword ptr [esp + 0x278], edi
        pc = 0x8e6991; continue; // 8e6988: jmp 0x8e6991
      case 0x8e698a:
        R.edi = (R.m.u32(((R.esp + 0x278) | 0) >>> 0)) | 0; // 8e698a: mov edi, dword ptr [esp + 0x278]
        pc = 0x8e6991; continue;
      case 0x8e6991:
        R.sub((R.edi >>> 0), 0xffffffff, 32); // 8e6991: cmp edi, -1
        if (R.cLE) { pc = 0x8e7060; continue; } // 8e6994: jle 0x8e7060
        pc = 0x8e699a; continue;
      case 0x8e699a:
        R.eax = (R.m.u32(((R.esi + 0x1b) | 0) >>> 0)) | 0; // 8e699a: mov eax, dword ptr [esi + 0x1b]
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 8e699d: cmp edi, eax
        if (!R.cL) { pc = 0x8e7060; continue; } // 8e699f: jge 0x8e7060
        pc = 0x8e69a5; continue;
      case 0x8e69a5:
        R.ecx = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 8e69a5: mov ecx, dword ptr [esp + 0x14]
        R.sub((R.ecx >>> 0), 0xffffffff, 32); // 8e69a9: cmp ecx, -1
        if (R.cLE) { pc = 0x8e69cb; continue; } // 8e69ac: jle 0x8e69cb
        pc = 0x8e69ae; continue;
      case 0x8e69ae:
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 8e69ae: cmp ecx, eax
        if (!R.cL) { pc = 0x8e69b4; continue; } // 8e69b0: jge 0x8e69b4
        pc = 0x8e69b2; continue;
      case 0x8e69b2:
        R.eax = ((R.ecx >>> 0)) | 0; // 8e69b2: mov eax, ecx
        pc = 0x8e69b4; continue;
      case 0x8e69b4:
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 8e69b4: cmp eax, edi
        R.m.w32(((R.esi + 0x1b) | 0) >>> 0, (R.eax >>> 0)); // 8e69b6: mov dword ptr [esi + 0x1b], eax
        R.m.w8(((R.esi + 0x40) | 0) >>> 0, 0x0); // 8e69b9: mov byte ptr [esi + 0x40], 0
        if (R.cLE) { pc = 0x8e7060; continue; } // 8e69bd: jle 0x8e7060
        pc = 0x8e69c3; continue;
      case 0x8e69c3:
        R.m.w32(((R.esi + 0x1b) | 0) >>> 0, (R.edi >>> 0)); // 8e69c3: mov dword ptr [esi + 0x1b], edi
        pc = 0x8e7060; continue; // 8e69c6: jmp 0x8e7060
      case 0x8e69cb:
        R.fpush(R.m.s32(((R.esp + 0x278) | 0) >>> 0)); // 8e69cb: fild dword ptr [esp + 0x278]
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 8e69d2: fild dword ptr [esp + 0x30]
        R.m.w32(((R.esi + 0x1b) | 0) >>> 0, (R.edi >>> 0)); // 8e69d6: mov dword ptr [esi + 0x1b], edi
        R.m.wf64(((R.esp + 0x24) | 0) >>> 0, R.st[0]); R.fpop(); // 8e69d9: fstp qword ptr [esp + 0x24]
        R.fpush(R.st[0]); // 8e69dd: fld st(0)
        R.st[0] = R.st[0] * 1.4; // 8e69df: fmul qword ptr [0x968dc0]
        R.fcom(R.st[0], R.f64(((R.esp + 0x24) | 0))); R.fpop(); // 8e69e5: fcomp qword ptr [esp + 0x24]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8e69e9: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8e69eb: test ah, 1
        if (!R.zf) { pc = 0x8e6cf9; continue; } // 8e69ee: jne 0x8e6cf9
        pc = 0x8e69f4; continue;
      case 0x8e69f4:
        R.st[0] = R.st[0] * 1.2; // 8e69f4: fmul qword ptr [0x968978]
        R.fcom(R.st[0], R.f64(((R.esp + 0x24) | 0))); // 8e69fa: fcom qword ptr [esp + 0x24]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8e69fe: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8e6a00: test ah, 1
        if (R.zf) { pc = 0x8e6a11; continue; } // 8e6a03: je 0x8e6a11
        pc = 0x8e6a05; continue;
      case 0x8e6a05:
        R.eax = (R.m.u32(((R.esp + 0x2c) | 0) >>> 0)) | 0; // 8e6a05: mov eax, dword ptr [esp + 0x2c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e6a09: test eax, eax
        if (!R.zf) { pc = 0x8e6cf9; continue; } // 8e6a0b: jne 0x8e6cf9
        pc = 0x8e6a11; continue;
      case 0x8e6a11:
        R.sub((R.edi >>> 0), 0x186a0, 32); // 8e6a11: cmp edi, 0x186a0
        if (R.cL) { pc = 0x8e70a1; continue; } // 8e6a17: jl 0x8e70a1
        pc = 0x8e6a1d; continue;
      case 0x8e6a1d:
        R.fcom(R.st[0], R.f64(((R.esp + 0x24) | 0))); R.fpop(); // 8e6a1d: fcomp qword ptr [esp + 0x24]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8e6a21: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8e6a23: test ah, 1
        if (R.zf) { pc = 0x8e7060; continue; } // 8e6a26: je 0x8e7060
        pc = 0x8e6a2c; continue;
      case 0x8e6a2c:
        R.eax = (R.m.u32(((R.esp + 0x274) | 0) >>> 0)) | 0; // 8e6a2c: mov eax, dword ptr [esp + 0x274]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e6a33: test eax, eax
        if (R.zf) { pc = 0x8e7060; continue; } // 8e6a35: je 0x8e7060
        pc = 0x8e6a3b; continue;
      case 0x8e6a3b:
        R.sub(R.m.u8(((R.eax) | 0) >>> 0), 0xb, 8); // 8e6a3b: cmp byte ptr [eax], 0xb
        if (!R.zf) { pc = 0x8e7060; continue; } // 8e6a3e: jne 0x8e7060
        pc = 0x8e6a44; continue;
      case 0x8e6a44:
        R.eax = (R.m.u32(((R.ebp + 0x1a) | 0) >>> 0)) | 0; // 8e6a44: mov eax, dword ptr [ebp + 0x1a]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e6a47: test eax, eax
        if (R.zf) { pc = 0x8e7060; continue; } // 8e6a49: je 0x8e7060
        pc = 0x8e6a4f; continue;
      case 0x8e6a4f:
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.eax + 0x8e) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8e6a4f: mov ax, word ptr [eax + 0x8e]
        R.sub(((R.eax >>> 0) & 0xffff), 0x1388, 16); // 8e6a56: cmp ax, 0x1388
        if (R.cLE) { pc = 0x8e6b37; continue; } // 8e6a5a: jle 0x8e6b37
        pc = 0x8e6a60; continue;
      case 0x8e6a60:
        R.sub(R.m.u8(((R.ebp + 0x22) | 0) >>> 0), 0x5, 8); // 8e6a60: cmp byte ptr [ebp + 0x22], 5
        if (!R.cf) { pc = 0x8e6b37; continue; } // 8e6a64: jae 0x8e6b37
        pc = 0x8e6a6a; continue;
      case 0x8e6a6a:
        R.edx = (R.m.u32(((R.ebp + 0x61) | 0) >>> 0)) | 0; // 8e6a6a: mov edx, dword ptr [ebp + 0x61]
        R.ecx = (((R.m.u16(((R.edx + 0x9) | 0) >>> 0)) << 16 >> 16)) | 0; // 8e6a6d: movsx ecx, word ptr [edx + 9]
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.ecx >>> 0)); // 8e6a71: mov dword ptr [esp + 0x14], ecx
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 8e6a75: fild dword ptr [esp + 0x14]
        R.edx = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8e6a79: movsx edx, ax
        R.st[0] = R.st[0] * 0.7692307692307692; // 8e6a7c: fmul qword ptr [0x970438]
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edx >>> 0)); // 8e6a82: mov dword ptr [esp + 0x14], edx
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 8e6a86: fild dword ptr [esp + 0x14]
        R.fcom(R.st[0], R.st[1]); R.fpop(); R.fpop(); // 8e6a8a: fcompp 
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8e6a8c: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8e6a8e: test ah, 1
        if (!R.zf) { pc = 0x8e6aaf; continue; } // 8e6a91: jne 0x8e6aaf
        pc = 0x8e6a93; continue;
      case 0x8e6a93:
        R.eax = (R.m.u32(((R.ebp + 0x24) | 0) >>> 0)) | 0; // 8e6a93: mov eax, dword ptr [ebp + 0x24]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e6a96: test eax, eax
        if (R.zf) { pc = 0x8e6b37; continue; } // 8e6a98: je 0x8e6b37
        pc = 0x8e6a9e; continue;
      case 0x8e6a9e:
        R.push((R.eax >>> 0)); // 8e6a9e: push eax
        R.call(0x5409b0, { n: 1, thisEcx: false, calleeClean: false }); // 8e6a9f: call 0x5409b0
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8e6aa4: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e6aa7: test eax, eax
        if (R.zf) { pc = 0x8e6b37; continue; } // 8e6aa9: je 0x8e6b37
        pc = 0x8e6aaf; continue;
      case 0x8e6aaf:
        R.push(0x4); // 8e6aaf: push 4
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e6ab1: call 0x90cfc0
        R.ecx = (((R.m.u8(((R.ebp + 0x18) | 0) >>> 0)) << 24 >> 24)) | 0; // 8e6ab6: movsx ecx, byte ptr [ebp + 0x18]
        R.eax = (R.add((R.eax >>> 0), 0x19, 32)) | 0; // 8e6aba: add eax, 0x19
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8e6abd: add esp, 4
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 8e6ac0: cmp ecx, eax
        if (!R.cL) { pc = 0x8e6b37; continue; } // 8e6ac2: jge 0x8e6b37
        pc = 0x8e6ac4; continue;
      case 0x8e6ac4:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebp + 0x22) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e6ac4: mov al, byte ptr [ebp + 0x22]
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, 0x1); // 8e6ac7: mov dword ptr [esp + 0x20], 1
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 8e6acf: test al, al
        if (!R.zf) { pc = 0x8e6b0d; continue; } // 8e6ad1: jne 0x8e6b0d
        pc = 0x8e6ad3; continue;
      case 0x8e6ad3:
        R.push(0x5); // 8e6ad3: push 5
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e6ad5: call 0x90cfc0
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8e6ada: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e6add: test eax, eax
        if (!R.zf) { pc = 0x8e6b0d; continue; } // 8e6adf: jne 0x8e6b0d
        pc = 0x8e6ae1; continue;
      case 0x8e6ae1:
        R.push(0x6); // 8e6ae1: push 6
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e6ae3: call 0x90cfc0
        R.eax = (R.add((R.eax >>> 0), 0x5, 32)) | 0; // 8e6ae8: add eax, 5
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8e6aeb: add esp, 4
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.eax >>> 0)); // 8e6aee: mov dword ptr [esp + 0x14], eax
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 8e6af2: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * R.m.s32(((R.esi + 0x1b) | 0) >>> 0); // 8e6af6: fimul dword ptr [esi + 0x1b]
        R.st[0] = R.st[0] * 0.01; // 8e6af9: fmul qword ptr [0x967898]
        R.ftol(); // 8e6aff: call 0x945640
        R.m.w32(((R.esi + 0x3a) | 0) >>> 0, (R.eax >>> 0)); // 8e6b04: mov dword ptr [esi + 0x3a], eax
        R.m.w8(((R.esi + 0x3e) | 0) >>> 0, 0x1); // 8e6b07: mov byte ptr [esi + 0x3e], 1
        pc = 0x8e6b37; continue; // 8e6b0b: jmp 0x8e6b37
      case 0x8e6b0d:
        R.push(0xb); // 8e6b0d: push 0xb
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e6b0f: call 0x90cfc0
        R.eax = (R.add((R.eax >>> 0), 0x5, 32)) | 0; // 8e6b14: add eax, 5
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8e6b17: add esp, 4
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.eax >>> 0)); // 8e6b1a: mov dword ptr [esp + 0x14], eax
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 8e6b1e: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * R.m.s32(((R.esi + 0x1b) | 0) >>> 0); // 8e6b22: fimul dword ptr [esi + 0x1b]
        R.st[0] = R.st[0] * 0.01; // 8e6b25: fmul qword ptr [0x967898]
        R.ftol(); // 8e6b2b: call 0x945640
        R.m.w32(((R.esi + 0x3a) | 0) >>> 0, (R.eax >>> 0)); // 8e6b30: mov dword ptr [esi + 0x3a], eax
        R.m.w8(((R.esi + 0x3e) | 0) >>> 0, 0xa); // 8e6b33: mov byte ptr [esi + 0x3e], 0xa
        pc = 0x8e6b37; continue;
      case 0x8e6b37:
        R.eax = (R.m.u32(((R.esi + 0x1b) | 0) >>> 0)) | 0; // 8e6b37: mov eax, dword ptr [esi + 0x1b]
        R.edx = R.eax < 0 ? -1 : 0; // 8e6b3a: cdq 
        R.edx = (R.logic((R.edx >>> 0) & 0x7, 32)) | 0; // 8e6b3b: and edx, 7
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 8e6b3e: add eax, edx
        R.eax = (R.sar((R.eax >>> 0), 0x3, 32)) | 0; // 8e6b40: sar eax, 3
        R.push((R.eax >>> 0)); // 8e6b43: push eax
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e6b44: call 0x90cfc0
        R.ecx = (R.m.u32(((R.esi + 0x3a) | 0) >>> 0)) | 0; // 8e6b49: mov ecx, dword ptr [esi + 0x3a]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8e6b4c: add esp, 4
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 8e6b4f: cmp ecx, eax
        if (!R.cL) { pc = 0x8e6bc3; continue; } // 8e6b51: jge 0x8e6bc3
        pc = 0x8e6b53; continue;
      case 0x8e6b53:
        R.edx = (R.m.u32(((R.esp + 0x274) | 0) >>> 0)) | 0; // 8e6b53: mov edx, dword ptr [esp + 0x274]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edx + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e6b5a: mov al, byte ptr [edx + 0x24]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x1e, 8)) & 0xff) << 0)) | 0; // 8e6b5d: and al, 0x1e
        R.sub(((R.eax >>> 0) & 0xff), 0xa, 8); // 8e6b5f: cmp al, 0xa
        if (!R.zf) { pc = 0x8e6bc3; continue; } // 8e6b61: jne 0x8e6bc3
        pc = 0x8e6b63; continue;
      case 0x8e6b63:
        R.push(0x2); // 8e6b63: push 2
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e6b65: call 0x90cfc0
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8e6b6a: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e6b6d: test eax, eax
        if (R.zf) { pc = 0x8e6bc3; continue; } // 8e6b6f: je 0x8e6bc3
        pc = 0x8e6b71; continue;
      case 0x8e6b71:
        R.push(0x5); // 8e6b71: push 5
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, 0x1); // 8e6b73: mov dword ptr [esp + 0x24], 1
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e6b7b: call 0x90cfc0
        R.eax = ((R.eax & 0xffffff00) | (((R.incdec(((R.eax >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 8e6b80: inc al
        R.ecx = ((R.ecx & 0xffffff00) | (((0xa) & 0xff) << 0)) | 0; // 8e6b82: mov cl, 0xa
        { const p = ((R.eax << 24) >> 24) * ((((R.ecx >>> 0) & 0xff)) << 24 >> 24); R.eax = ((R.eax & 0xffff0000) | (p & 0xffff)) | 0; R.cf = R.of = ((p << 24) >> 24) !== p; } // 8e6b84: imul cl
        R.push(0xb); // 8e6b86: push 0xb
        R.m.w8(((R.esi + 0x39) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 8e6b88: mov byte ptr [esi + 0x39], al
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e6b8b: call 0x90cfc0
        R.edx = (((R.m.u8(((R.esi + 0x39) | 0) >>> 0)) << 24 >> 24)) | 0; // 8e6b90: movsx edx, byte ptr [esi + 0x39]
        R.eax = (R.add((R.eax >>> 0), 0x5, 32)) | 0; // 8e6b94: add eax, 5
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 8e6b97: add esp, 8
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.eax >>> 0)); // 8e6b9a: mov dword ptr [esp + 0x14], eax
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 8e6b9e: fild dword ptr [esp + 0x14]
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edx >>> 0)); // 8e6ba2: mov dword ptr [esp + 0x14], edx
        R.st[0] = R.st[0] * R.m.s32(((R.esi + 0x1b) | 0) >>> 0); // 8e6ba6: fimul dword ptr [esi + 0x1b]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 8e6ba9: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.6666666666666666; // 8e6bad: fmul qword ptr [0x96a670]
        R.st[0] = 100.0 - R.st[0]; // 8e6bb3: fsubr qword ptr [0x9688a8]
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 8e6bb9: fdivp st(1)
        R.ftol(); // 8e6bbb: call 0x945640
        R.m.w32(((R.esi + 0x35) | 0) >>> 0, (R.eax >>> 0)); // 8e6bc0: mov dword ptr [esi + 0x35], eax
        pc = 0x8e6bc3; continue;
      case 0x8e6bc3:
        R.eax = (R.m.u32(((R.esi + 0x1b) | 0) >>> 0)) | 0; // 8e6bc3: mov eax, dword ptr [esi + 0x1b]
        R.edx = R.eax < 0 ? -1 : 0; // 8e6bc6: cdq 
        R.edx = (R.logic((R.edx >>> 0) & 0x7, 32)) | 0; // 8e6bc7: and edx, 7
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 8e6bca: add eax, edx
        R.eax = (R.sar((R.eax >>> 0), 0x3, 32)) | 0; // 8e6bcc: sar eax, 3
        R.push((R.eax >>> 0)); // 8e6bcf: push eax
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e6bd0: call 0x90cfc0
        R.ecx = (R.m.u32(((R.esi + 0x35) | 0) >>> 0)) | 0; // 8e6bd5: mov ecx, dword ptr [esi + 0x35]
        R.edx = (R.m.u32(((R.esi + 0x3a) | 0) >>> 0)) | 0; // 8e6bd8: mov edx, dword ptr [esi + 0x3a]
        R.ecx = (R.add((R.ecx >>> 0), (R.edx >>> 0), 32)) | 0; // 8e6bdb: add ecx, edx
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8e6bdd: add esp, 4
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 8e6be0: cmp ecx, eax
        if (!R.cL) { pc = 0x8e6c48; continue; } // 8e6be2: jge 0x8e6c48
        pc = 0x8e6be4; continue;
      case 0x8e6be4:
        R.edx = (R.m.u32(((R.esp + 0x274) | 0) >>> 0)) | 0; // 8e6be4: mov edx, dword ptr [esp + 0x274]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edx + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e6beb: mov al, byte ptr [edx + 0x24]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x1e, 8)) & 0xff) << 0)) | 0; // 8e6bee: and al, 0x1e
        R.sub(((R.eax >>> 0) & 0xff), 0xa, 8); // 8e6bf0: cmp al, 0xa
        if (R.zf) { pc = 0x8e6c0d; continue; } // 8e6bf2: je 0x8e6c0d
        pc = 0x8e6bf4; continue;
      case 0x8e6bf4:
        R.push(0x14); // 8e6bf4: push 0x14
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e6bf6: call 0x90cfc0
        R.edx = (((R.m.u8(((R.ebp + 0x18) | 0) >>> 0)) << 24 >> 24)) | 0; // 8e6bfb: movsx edx, byte ptr [ebp + 0x18]
        R.ecx = (0x1c) | 0; // 8e6bff: mov ecx, 0x1c
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8e6c04: add esp, 4
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 8e6c07: sub ecx, eax
        R.sub((R.edx >>> 0), (R.ecx >>> 0), 32); // 8e6c09: cmp edx, ecx
        if (!R.cL) { pc = 0x8e6c48; continue; } // 8e6c0b: jge 0x8e6c48
        pc = 0x8e6c0d; continue;
      case 0x8e6c0d:
        R.push(0x5); // 8e6c0d: push 5
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, 0x1); // 8e6c0f: mov dword ptr [esp + 0x24], 1
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e6c17: call 0x90cfc0
        R.eax = ((R.eax & 0xffffff00) | (((R.incdec(((R.eax >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 8e6c1c: inc al
        R.ecx = ((R.ecx & 0xffffff00) | (((0x5) & 0xff) << 0)) | 0; // 8e6c1e: mov cl, 5
        { const p = ((R.eax << 24) >> 24) * ((((R.ecx >>> 0) & 0xff)) << 24 >> 24); R.eax = ((R.eax & 0xffff0000) | (p & 0xffff)) | 0; R.cf = R.of = ((p << 24) >> 24) !== p; } // 8e6c20: imul cl
        R.push(0x5); // 8e6c22: push 5
        R.ebx = ((R.ebx & 0xffffff00) | (((((R.eax >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 8e6c24: mov bl, al
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e6c26: call 0x90cfc0
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 8e6c2b: add esp, 8
        R.eax = ((R.eax & 0xffffff00) | (((R.incdec(((R.eax >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 8e6c2e: inc al
        R.edx = ((R.edx & 0xffffff00) | (((0x5) & 0xff) << 0)) | 0; // 8e6c30: mov dl, 5
        { const p = ((R.eax << 24) >> 24) * ((((R.edx >>> 0) & 0xff)) << 24 >> 24); R.eax = ((R.eax & 0xffff0000) | (p & 0xffff)) | 0; R.cf = R.of = ((p << 24) >> 24) !== p; } // 8e6c32: imul dl
        R.sub(((R.ebx >>> 0) & 0xff), ((R.eax >>> 0) & 0xff), 8); // 8e6c34: cmp bl, al
        if (!R.cL) { pc = 0x8e6c3a; continue; } // 8e6c36: jge 0x8e6c3a
        pc = 0x8e6c38; continue;
      case 0x8e6c38:
        R.eax = ((R.eax & 0xffffff00) | (((((R.ebx >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 8e6c38: mov al, bl
        pc = 0x8e6c3a; continue;
      case 0x8e6c3a:
        R.edi = (R.m.u32(((R.esp + 0x278) | 0) >>> 0)) | 0; // 8e6c3a: mov edi, dword ptr [esp + 0x278]
        R.ebx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 8e6c41: mov ebx, dword ptr [esp + 0x1c]
        R.m.w8(((R.esi + 0x3f) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 8e6c45: mov byte ptr [esi + 0x3f], al
        pc = 0x8e6c48; continue;
      case 0x8e6c48:
        R.eax = (R.m.u32(((R.esi + 0x3a) | 0) >>> 0)) | 0; // 8e6c48: mov eax, dword ptr [esi + 0x3a]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e6c4b: test eax, eax
        if (!R.zf) { pc = 0x8e7060; continue; } // 8e6c4d: jne 0x8e7060
        pc = 0x8e6c53; continue;
      case 0x8e6c53:
        R.eax = (R.m.u32(((R.esi + 0x35) | 0) >>> 0)) | 0; // 8e6c53: mov eax, dword ptr [esi + 0x35]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e6c56: test eax, eax
        if (!R.zf) { pc = 0x8e7060; continue; } // 8e6c58: jne 0x8e7060
        pc = 0x8e6c5e; continue;
      case 0x8e6c5e:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x3f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e6c5e: mov al, byte ptr [esi + 0x3f]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 8e6c61: test al, al
        if (!R.zf) { pc = 0x8e7060; continue; } // 8e6c63: jne 0x8e7060
        pc = 0x8e6c69; continue;
      case 0x8e6c69:
        R.ebx = (R.m.u32(((R.esp + 0x274) | 0) >>> 0)) | 0; // 8e6c69: mov ebx, dword ptr [esp + 0x274]
        R.fpush(R.m.s32(((R.ebx + 0x3) | 0) >>> 0)); // 8e6c70: fild dword ptr [ebx + 3]
        R.st[0] = R.st[0] * 0.67; // 8e6c73: fmul qword ptr [0x968f80]
        R.ftol(); // 8e6c79: call 0x945640
        R.push((R.eax >>> 0)); // 8e6c7e: push eax
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e6c7f: call 0x90cfc0
        R.edx = ((R.eax >>> 0)) | 0; // 8e6c84: mov edx, eax
        R.eax = (R.m.u32(((R.ebx + 0xb) | 0) >>> 0)) | 0; // 8e6c86: mov eax, dword ptr [ebx + 0xb]
        R.push((R.eax >>> 0)); // 8e6c89: push eax
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 8e6c8a: mov dword ptr [esp + 0x1c], edx
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e6c8e: call 0x90cfc0
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 8e6c93: mov ecx, dword ptr [esp + 0x1c]
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 8e6c97: add esp, 8
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 8e6c9a: cmp eax, ecx
        if (R.cLE) { pc = 0x8e705c; continue; } // 8e6c9c: jle 0x8e705c
        pc = 0x8e6ca2; continue;
      case 0x8e6ca2:
        R.push(0x5); // 8e6ca2: push 5
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, 0x1); // 8e6ca4: mov dword ptr [esp + 0x24], 1
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e6cac: call 0x90cfc0
        R.eax = ((R.eax & 0xffffff00) | (((R.incdec(((R.eax >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 8e6cb1: inc al
        R.edx = ((R.edx & 0xffffff00) | (((0xa) & 0xff) << 0)) | 0; // 8e6cb3: mov dl, 0xa
        { const p = ((R.eax << 24) >> 24) * ((((R.edx >>> 0) & 0xff)) << 24 >> 24); R.eax = ((R.eax & 0xffff0000) | (p & 0xffff)) | 0; R.cf = R.of = ((p << 24) >> 24) !== p; } // 8e6cb5: imul dl
        R.push(0xb); // 8e6cb7: push 0xb
        R.m.w8(((R.esi + 0x39) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 8e6cb9: mov byte ptr [esi + 0x39], al
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e6cbc: call 0x90cfc0
        R.eax = (R.add((R.eax >>> 0), 0x5, 32)) | 0; // 8e6cc1: add eax, 5
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 8e6cc4: add esp, 8
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.eax >>> 0)); // 8e6cc7: mov dword ptr [esp + 0x14], eax
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 8e6ccb: fild dword ptr [esp + 0x14]
        R.eax = (((R.m.u8(((R.esi + 0x39) | 0) >>> 0)) << 24 >> 24)) | 0; // 8e6ccf: movsx eax, byte ptr [esi + 0x39]
        R.st[0] = R.st[0] * R.m.s32(((R.esi + 0x1b) | 0) >>> 0); // 8e6cd3: fimul dword ptr [esi + 0x1b]
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.eax >>> 0)); // 8e6cd6: mov dword ptr [esp + 0x14], eax
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 8e6cda: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.6666666666666666; // 8e6cde: fmul qword ptr [0x96a670]
        R.st[0] = 100.0 - R.st[0]; // 8e6ce4: fsubr qword ptr [0x9688a8]
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 8e6cea: fdivp st(1)
        R.ftol(); // 8e6cec: call 0x945640
        R.m.w32(((R.esi + 0x35) | 0) >>> 0, (R.eax >>> 0)); // 8e6cf1: mov dword ptr [esi + 0x35], eax
        pc = 0x8e705c; continue; // 8e6cf4: jmp 0x8e705c
      case 0x8e6cf9:
        R.eax = (R.m.u32(((R.esp + 0x274) | 0) >>> 0)) | 0; // 8e6cf9: mov eax, dword ptr [esp + 0x274]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e6d00: test eax, eax
        R.fpop(); // 8e6d02: fstp st(0)
        if (R.zf) { pc = 0x8e77bd; continue; } // 8e6d04: je 0x8e77bd
        pc = 0x8e6d0a; continue;
      case 0x8e6d0a:
        R.sub(R.m.u8(((R.eax) | 0) >>> 0), 0xb, 8); // 8e6d0a: cmp byte ptr [eax], 0xb
        if (!R.zf) { pc = 0x8e77bd; continue; } // 8e6d0d: jne 0x8e77bd
        pc = 0x8e6d13; continue;
      case 0x8e6d13:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e6d13: mov al, byte ptr [eax + 0x24]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x1e, 8)) & 0xff) << 0)) | 0; // 8e6d16: and al, 0x1e
        R.sub(((R.eax >>> 0) & 0xff), 0xa, 8); // 8e6d18: cmp al, 0xa
        if (R.zf) { pc = 0x8e6d32; continue; } // 8e6d1a: je 0x8e6d32
        pc = 0x8e6d1c; continue;
      case 0x8e6d1c:
        R.sub(((R.eax >>> 0) & 0xff), 0x8, 8); // 8e6d1c: cmp al, 8
        if (!R.zf) { pc = 0x8e6d26; continue; } // 8e6d1e: jne 0x8e6d26
        pc = 0x8e6d20; continue;
      case 0x8e6d20:
        R.sub(R.m.u8(((R.ebp + 0x18) | 0) >>> 0), 0x1c, 8); // 8e6d20: cmp byte ptr [ebp + 0x18], 0x1c
        if (R.cL) { pc = 0x8e6d32; continue; } // 8e6d24: jl 0x8e6d32
        pc = 0x8e6d26; continue;
      case 0x8e6d26:
        R.eax = (R.m.u32(((R.esp + 0x2c) | 0) >>> 0)) | 0; // 8e6d26: mov eax, dword ptr [esp + 0x2c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e6d2a: test eax, eax
        if (R.zf) { pc = 0x8e77bd; continue; } // 8e6d2c: je 0x8e77bd
        pc = 0x8e6d32; continue;
      case 0x8e6d32:
        R.ecx = (R.m.u32(((R.ebp + 0x1a) | 0) >>> 0)) | 0; // 8e6d32: mov ecx, dword ptr [ebp + 0x1a]
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, 0x1); // 8e6d35: mov dword ptr [esp + 0x20], 1
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.ecx + 0x8e) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8e6d3d: mov ax, word ptr [ecx + 0x8e]
        R.sub(((R.eax >>> 0) & 0xffff), 0x1388, 16); // 8e6d44: cmp ax, 0x1388
        if (R.cLE) { pc = 0x8e6fcd; continue; } // 8e6d48: jle 0x8e6fcd
        pc = 0x8e6d4e; continue;
      case 0x8e6d4e:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.ebp + 0x22) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e6d4e: mov cl, byte ptr [ebp + 0x22]
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 8e6d51: test cl, cl
        if (!R.zf) { pc = 0x8e6fcd; continue; } // 8e6d53: jne 0x8e6fcd
        pc = 0x8e6d59; continue;
      case 0x8e6d59:
        R.edx = (R.m.u32(((R.ebp + 0x61) | 0) >>> 0)) | 0; // 8e6d59: mov edx, dword ptr [ebp + 0x61]
        R.ecx = (((R.m.u16(((R.edx + 0x9) | 0) >>> 0)) << 16 >> 16)) | 0; // 8e6d5c: movsx ecx, word ptr [edx + 9]
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.ecx >>> 0)); // 8e6d60: mov dword ptr [esp + 0x14], ecx
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 8e6d64: fild dword ptr [esp + 0x14]
        R.edx = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8e6d68: movsx edx, ax
        R.st[0] = R.st[0] * 0.7692307692307692; // 8e6d6b: fmul qword ptr [0x970438]
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edx >>> 0)); // 8e6d71: mov dword ptr [esp + 0x14], edx
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 8e6d75: fild dword ptr [esp + 0x14]
        R.fcom(R.st[0], R.st[1]); R.fpop(); R.fpop(); // 8e6d79: fcompp 
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8e6d7b: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8e6d7d: test ah, 1
        if (!R.zf) { pc = 0x8e6e8d; continue; } // 8e6d80: jne 0x8e6e8d
        pc = 0x8e6d86; continue;
      case 0x8e6d86:
        R.eax = (R.m.u32(((R.ebp + 0x24) | 0) >>> 0)) | 0; // 8e6d86: mov eax, dword ptr [ebp + 0x24]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e6d89: test eax, eax
        if (R.zf) { pc = 0x8e6d9e; continue; } // 8e6d8b: je 0x8e6d9e
        pc = 0x8e6d8d; continue;
      case 0x8e6d8d:
        R.push((R.eax >>> 0)); // 8e6d8d: push eax
        R.call(0x5409b0, { n: 1, thisEcx: false, calleeClean: false }); // 8e6d8e: call 0x5409b0
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8e6d93: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e6d96: test eax, eax
        if (!R.zf) { pc = 0x8e6e8d; continue; } // 8e6d98: jne 0x8e6e8d
        pc = 0x8e6d9e; continue;
      case 0x8e6d9e:
        R.push(0x5); // 8e6d9e: push 5
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e6da0: call 0x90cfc0
        R.eax = ((R.eax & 0xffffff00) | (((R.incdec(((R.eax >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 8e6da5: inc al
        R.ecx = ((R.ecx & 0xffffff00) | (((0xa) & 0xff) << 0)) | 0; // 8e6da7: mov cl, 0xa
        { const p = ((R.eax << 24) >> 24) * ((((R.ecx >>> 0) & 0xff)) << 24 >> 24); R.eax = ((R.eax & 0xffff0000) | (p & 0xffff)) | 0; R.cf = R.of = ((p << 24) >> 24) !== p; } // 8e6da9: imul cl
        R.push(0xb); // 8e6dab: push 0xb
        R.m.w8(((R.esi + 0x39) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 8e6dad: mov byte ptr [esi + 0x39], al
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e6db0: call 0x90cfc0
        R.edx = (((R.m.u8(((R.esi + 0x39) | 0) >>> 0)) << 24 >> 24)) | 0; // 8e6db5: movsx edx, byte ptr [esi + 0x39]
        R.eax = (R.add((R.eax >>> 0), 0xa, 32)) | 0; // 8e6db9: add eax, 0xa
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 8e6dbc: mov dword ptr [esp + 0x1c], eax
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 8e6dc0: fild dword ptr [esp + 0x1c]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 8e6dc4: mov dword ptr [esp + 0x1c], edx
        R.st[0] = R.st[0] * R.m.s32(((R.esi + 0x1b) | 0) >>> 0); // 8e6dc8: fimul dword ptr [esi + 0x1b]
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 8e6dcb: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 0.6666666666666666; // 8e6dcf: fmul qword ptr [0x96a670]
        R.st[0] = 100.0 - R.st[0]; // 8e6dd5: fsubr qword ptr [0x9688a8]
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 8e6ddb: fdivp st(1)
        R.ftol(); // 8e6ddd: call 0x945640
        R.push(0x6); // 8e6de2: push 6
        R.m.w32(((R.esi + 0x35) | 0) >>> 0, (R.eax >>> 0)); // 8e6de4: mov dword ptr [esi + 0x35], eax
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e6de7: call 0x90cfc0
        R.ecx = ((R.ecx & 0xffffff00) | (((0x5) & 0xff) << 0)) | 0; // 8e6dec: mov cl, 5
        R.push(0x6); // 8e6dee: push 6
        { const p = ((R.eax << 24) >> 24) * ((((R.ecx >>> 0) & 0xff)) << 24 >> 24); R.eax = ((R.eax & 0xffff0000) | (p & 0xffff)) | 0; R.cf = R.of = ((p << 24) >> 24) !== p; } // 8e6df0: imul cl
        R.ebx = ((R.ebx & 0xffffff00) | (((((R.eax >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 8e6df2: mov bl, al
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e6df4: call 0x90cfc0
        R.fpush(R.m.s32(((R.esp + 0x3c) | 0) >>> 0)); // 8e6df9: fild dword ptr [esp + 0x3c]
        R.fpush(R.f64(((R.esp + 0x34) | 0))); // 8e6dfd: fld qword ptr [esp + 0x34]
        R.st[0] = R.st[0] * 0.75; // 8e6e01: fmul qword ptr [0x969040]
        R.edx = ((R.edx & 0xffffff00) | (((0x5) & 0xff) << 0)) | 0; // 8e6e07: mov dl, 5
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 8e6e09: add esp, 0x10
        { const p = ((R.eax << 24) >> 24) * ((((R.edx >>> 0) & 0xff)) << 24 >> 24); R.eax = ((R.eax & 0xffff0000) | (p & 0xffff)) | 0; R.cf = R.of = ((p << 24) >> 24) !== p; } // 8e6e0c: imul dl
        R.fcom(R.st[0], R.st[1]); R.fpop(); R.fpop(); // 8e6e0e: fcompp 
        R.ecx = ((R.ecx & 0xffffff00) | (((((R.eax >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 8e6e10: mov cl, al
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8e6e12: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8e6e14: test ah, 1
        if (R.zf) { pc = 0x8e709b; continue; } // 8e6e17: je 0x8e709b
        pc = 0x8e6e1d; continue;
      case 0x8e6e1d:
        R.sub(((R.ebx >>> 0) & 0xff), ((R.ecx >>> 0) & 0xff), 8); // 8e6e1d: cmp bl, cl
        if (R.cLE) { pc = 0x8e6e23; continue; } // 8e6e1f: jle 0x8e6e23
        pc = 0x8e6e21; continue;
      case 0x8e6e21:
        R.ecx = ((R.ecx & 0xffffff00) | (((((R.ebx >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 8e6e21: mov cl, bl
        pc = 0x8e6e23; continue;
      case 0x8e6e23:
        R.ebx = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 8e6e23: mov ebx, dword ptr [esp + 0x30]
        R.m.w8(((R.esi + 0x3f) | 0) >>> 0, ((R.ecx >>> 0) & 0xff)); // 8e6e27: mov byte ptr [esi + 0x3f], cl
        R.sub((R.ebx >>> 0), 0x2710, 32); // 8e6e2a: cmp ebx, 0x2710
        if (!R.cLE) { pc = 0x8e6e37; continue; } // 8e6e30: jg 0x8e6e37
        pc = 0x8e6e32; continue;
      case 0x8e6e32:
        R.ebx = (0x2710) | 0; // 8e6e32: mov ebx, 0x2710
        pc = 0x8e6e37; continue;
      case 0x8e6e37:
        R.eax = (((R.m.u8(((R.esi + 0x39) | 0) >>> 0)) << 24 >> 24)) | 0; // 8e6e37: movsx eax, byte ptr [esi + 0x39]
        R.ecx = (R.m.u32(((R.esi + 0x35) | 0) >>> 0)) | 0; // 8e6e3b: mov ecx, dword ptr [esi + 0x35]
        { const p = BigInt(((R.m.u32(((R.esp + 0x2c) | 0) >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 8e6e3e: imul ecx, dword ptr [esp + 0x2c]
        R.edx = (((R.eax + R.eax * 2) | 0)) | 0; // 8e6e43: lea edx, [eax + eax*2]
        R.eax = (((R.eax + R.edx * 8) | 0)) | 0; // 8e6e46: lea eax, [eax + edx*8]
        R.edx = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 8e6e49: mov edx, dword ptr [esp + 0x30]
        R.eax = (((R.eax + R.eax * 2) | 0)) | 0; // 8e6e4d: lea eax, [eax + eax*2]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 8e6e50: lea eax, [eax + eax*4]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 8e6e53: lea eax, [eax + eax*4]
        R.eax = (R.shl((R.eax >>> 0), 0x4, 32)) | 0; // 8e6e56: shl eax, 4
        R.edi = (((R.eax + R.edx) | 0)) | 0; // 8e6e59: lea edi, [eax + edx]
        R.eax = ((R.ecx >>> 0)) | 0; // 8e6e5c: mov eax, ecx
        R.edx = R.eax < 0 ? -1 : 0; // 8e6e5e: cdq 
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.ebx >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 8e6e5f: idiv ebx
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 8e6e61: cmp edi, eax
        if (!R.cL) { pc = 0x8e6e6f; continue; } // 8e6e63: jge 0x8e6e6f
        pc = 0x8e6e65; continue;
      case 0x8e6e65:
        R.eax = ((R.edi >>> 0)) | 0; // 8e6e65: mov eax, edi
        R.m.w32(((R.esi + 0x35) | 0) >>> 0, (R.eax >>> 0)); // 8e6e67: mov dword ptr [esi + 0x35], eax
        pc = 0x8e7055; continue; // 8e6e6a: jmp 0x8e7055
      case 0x8e6e6f:
        R.edi = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 8e6e6f: mov edi, dword ptr [esp + 0x30]
        R.sub((R.edi >>> 0), 0x2710, 32); // 8e6e73: cmp edi, 0x2710
        if (!R.cLE) { pc = 0x8e6e80; continue; } // 8e6e79: jg 0x8e6e80
        pc = 0x8e6e7b; continue;
      case 0x8e6e7b:
        R.edi = (0x2710) | 0; // 8e6e7b: mov edi, 0x2710
        pc = 0x8e6e80; continue;
      case 0x8e6e80:
        R.eax = ((R.ecx >>> 0)) | 0; // 8e6e80: mov eax, ecx
        R.edx = R.eax < 0 ? -1 : 0; // 8e6e82: cdq 
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.edi >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 8e6e83: idiv edi
        R.m.w32(((R.esi + 0x35) | 0) >>> 0, (R.eax >>> 0)); // 8e6e85: mov dword ptr [esi + 0x35], eax
        pc = 0x8e7055; continue; // 8e6e88: jmp 0x8e7055
      case 0x8e6e8d:
        R.fpush(R.m.s32(((R.esi + 0x1b) | 0) >>> 0)); // 8e6e8d: fild dword ptr [esi + 0x1b]
        R.st[0] = R.st[0] * 0.75; // 8e6e90: fmul qword ptr [0x969040]
        R.fpush(R.m.s32(((R.esp + 0x2c) | 0) >>> 0)); // 8e6e96: fild dword ptr [esp + 0x2c]
        R.m.wf64(((R.esp + 0x3c) | 0) >>> 0, R.st[0]); // 8e6e9a: fst qword ptr [esp + 0x3c]
        R.st[0] = R.st[0] * 0.85; // 8e6e9e: fmul qword ptr [0x969520]
        R.m.wf64(((R.esp + 0x14) | 0) >>> 0, R.st[0]); R.fpop(); // 8e6ea4: fstp qword ptr [esp + 0x14]
        R.fcom(R.st[0], R.f64(((R.esp + 0x14) | 0))); // 8e6ea8: fcom qword ptr [esp + 0x14]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8e6eac: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 8e6eae: test ah, 0x41
        if (R.zf) { pc = 0x8e6eb9; continue; } // 8e6eb1: je 0x8e6eb9
        pc = 0x8e6eb3; continue;
      case 0x8e6eb3:
        R.fpop(); // 8e6eb3: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x14) | 0))); // 8e6eb5: fld qword ptr [esp + 0x14]
        pc = 0x8e6eb9; continue;
      case 0x8e6eb9:
        R.ftol(); // 8e6eb9: call 0x945640
        R.push(0x3); // 8e6ebe: push 3
        R.m.w32(((R.esi + 0x3a) | 0) >>> 0, (R.eax >>> 0)); // 8e6ec0: mov dword ptr [esi + 0x3a], eax
        R.m.w8(((R.esi + 0x3e) | 0) >>> 0, 0xa); // 8e6ec3: mov byte ptr [esi + 0x3e], 0xa
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e6ec7: call 0x90cfc0
        R.eax = ((R.eax & 0xffffff00) | (((R.add(((R.eax >>> 0) & 0xff), 0x3, 8)) & 0xff) << 0)) | 0; // 8e6ecc: add al, 3
        R.ecx = ((R.ecx & 0xffffff00) | (((0xa) & 0xff) << 0)) | 0; // 8e6ece: mov cl, 0xa
        { const p = ((R.eax << 24) >> 24) * ((((R.ecx >>> 0) & 0xff)) << 24 >> 24); R.eax = ((R.eax & 0xffff0000) | (p & 0xffff)) | 0; R.cf = R.of = ((p << 24) >> 24) !== p; } // 8e6ed0: imul cl
        R.push(0xb); // 8e6ed2: push 0xb
        R.m.w8(((R.esi + 0x39) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 8e6ed4: mov byte ptr [esi + 0x39], al
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e6ed7: call 0x90cfc0
        R.edx = (((R.m.u8(((R.esi + 0x39) | 0) >>> 0)) << 24 >> 24)) | 0; // 8e6edc: movsx edx, byte ptr [esi + 0x39]
        R.eax = (R.add((R.eax >>> 0), 0x5, 32)) | 0; // 8e6ee0: add eax, 5
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 8e6ee3: mov dword ptr [esp + 0x1c], eax
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 8e6ee7: fild dword ptr [esp + 0x1c]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 8e6eeb: mov dword ptr [esp + 0x1c], edx
        R.st[0] = R.st[0] * R.m.s32(((R.esi + 0x1b) | 0) >>> 0); // 8e6eef: fimul dword ptr [esi + 0x1b]
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 8e6ef2: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 0.6666666666666666; // 8e6ef6: fmul qword ptr [0x96a670]
        R.st[0] = 100.0 - R.st[0]; // 8e6efc: fsubr qword ptr [0x9688a8]
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 8e6f02: fdivp st(1)
        R.ftol(); // 8e6f04: call 0x945640
        R.push(0x6); // 8e6f09: push 6
        R.m.w32(((R.esi + 0x35) | 0) >>> 0, (R.eax >>> 0)); // 8e6f0b: mov dword ptr [esi + 0x35], eax
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e6f0e: call 0x90cfc0
        R.ecx = ((R.ecx & 0xffffff00) | (((0x5) & 0xff) << 0)) | 0; // 8e6f13: mov cl, 5
        R.push(0x6); // 8e6f15: push 6
        { const p = ((R.eax << 24) >> 24) * ((((R.ecx >>> 0) & 0xff)) << 24 >> 24); R.eax = ((R.eax & 0xffff0000) | (p & 0xffff)) | 0; R.cf = R.of = ((p << 24) >> 24) !== p; } // 8e6f17: imul cl
        R.ebx = ((R.ebx & 0xffffff00) | (((((R.eax >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 8e6f19: mov bl, al
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e6f1b: call 0x90cfc0
        R.fpush(R.f64(((R.esp + 0x34) | 0))); // 8e6f20: fld qword ptr [esp + 0x34]
        R.st[0] = R.st[0] * 0.75; // 8e6f24: fmul qword ptr [0x969040]
        R.edx = ((R.edx & 0xffffff00) | (((0x5) & 0xff) << 0)) | 0; // 8e6f2a: mov dl, 5
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 8e6f2c: add esp, 0x10
        { const p = ((R.eax << 24) >> 24) * ((((R.edx >>> 0) & 0xff)) << 24 >> 24); R.eax = ((R.eax & 0xffff0000) | (p & 0xffff)) | 0; R.cf = R.of = ((p << 24) >> 24) !== p; } // 8e6f2f: imul dl
        R.fcom(R.st[0], R.f64(((R.esp + 0x3c) | 0))); R.fpop(); // 8e6f31: fcomp qword ptr [esp + 0x3c]
        R.ecx = ((R.ecx & 0xffffff00) | (((((R.eax >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 8e6f35: mov cl, al
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8e6f37: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8e6f39: test ah, 1
        if (R.zf) { pc = 0x8e6fb8; continue; } // 8e6f3c: je 0x8e6fb8
        pc = 0x8e6f3e; continue;
      case 0x8e6f3e:
        R.sub(((R.ebx >>> 0) & 0xff), ((R.ecx >>> 0) & 0xff), 8); // 8e6f3e: cmp bl, cl
        if (R.cLE) { pc = 0x8e6f44; continue; } // 8e6f40: jle 0x8e6f44
        pc = 0x8e6f42; continue;
      case 0x8e6f42:
        R.ecx = ((R.ecx & 0xffffff00) | (((((R.ebx >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 8e6f42: mov cl, bl
        pc = 0x8e6f44; continue;
      case 0x8e6f44:
        R.ebp = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 8e6f44: mov ebp, dword ptr [esp + 0x30]
        R.m.w8(((R.esi + 0x3f) | 0) >>> 0, ((R.ecx >>> 0) & 0xff)); // 8e6f48: mov byte ptr [esi + 0x3f], cl
        R.sub((R.ebp >>> 0), 0x2710, 32); // 8e6f4b: cmp ebp, 0x2710
        R.ebx = ((R.ebp >>> 0)) | 0; // 8e6f51: mov ebx, ebp
        if (!R.cLE) { pc = 0x8e6f5a; continue; } // 8e6f53: jg 0x8e6f5a
        pc = 0x8e6f55; continue;
      case 0x8e6f55:
        R.ebx = (0x2710) | 0; // 8e6f55: mov ebx, 0x2710
        pc = 0x8e6f5a; continue;
      case 0x8e6f5a:
        R.eax = (((R.m.u8(((R.esi + 0x39) | 0) >>> 0)) << 24 >> 24)) | 0; // 8e6f5a: movsx eax, byte ptr [esi + 0x39]
        R.ecx = (R.m.u32(((R.esi + 0x35) | 0) >>> 0)) | 0; // 8e6f5e: mov ecx, dword ptr [esi + 0x35]
        { const p = BigInt(((R.m.u32(((R.esp + 0x2c) | 0) >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 8e6f61: imul ecx, dword ptr [esp + 0x2c]
        R.edx = (((R.eax + R.eax * 2) | 0)) | 0; // 8e6f66: lea edx, [eax + eax*2]
        R.eax = (((R.eax + R.edx * 8) | 0)) | 0; // 8e6f69: lea eax, [eax + edx*8]
        R.eax = (((R.eax + R.eax * 2) | 0)) | 0; // 8e6f6c: lea eax, [eax + eax*2]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 8e6f6f: lea eax, [eax + eax*4]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 8e6f72: lea eax, [eax + eax*4]
        R.eax = (R.shl((R.eax >>> 0), 0x4, 32)) | 0; // 8e6f75: shl eax, 4
        R.edi = (((R.eax + R.ebp) | 0)) | 0; // 8e6f78: lea edi, [eax + ebp]
        R.eax = ((R.ecx >>> 0)) | 0; // 8e6f7b: mov eax, ecx
        R.edx = R.eax < 0 ? -1 : 0; // 8e6f7d: cdq 
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.ebx >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 8e6f7e: idiv ebx
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 8e6f80: cmp edi, eax
        if (!R.cL) { pc = 0x8e6f95; continue; } // 8e6f82: jge 0x8e6f95
        pc = 0x8e6f84; continue;
      case 0x8e6f84:
        R.ebp = (R.m.u32(((R.esp + 0x26c) | 0) >>> 0)) | 0; // 8e6f84: mov ebp, dword ptr [esp + 0x26c]
        R.eax = ((R.edi >>> 0)) | 0; // 8e6f8b: mov eax, edi
        R.m.w32(((R.esi + 0x35) | 0) >>> 0, (R.eax >>> 0)); // 8e6f8d: mov dword ptr [esi + 0x35], eax
        pc = 0x8e7055; continue; // 8e6f90: jmp 0x8e7055
      case 0x8e6f95:
        R.sub((R.ebp >>> 0), 0x2710, 32); // 8e6f95: cmp ebp, 0x2710
        R.edi = ((R.ebp >>> 0)) | 0; // 8e6f9b: mov edi, ebp
        if (!R.cLE) { pc = 0x8e6fa4; continue; } // 8e6f9d: jg 0x8e6fa4
        pc = 0x8e6f9f; continue;
      case 0x8e6f9f:
        R.edi = (0x2710) | 0; // 8e6f9f: mov edi, 0x2710
        pc = 0x8e6fa4; continue;
      case 0x8e6fa4:
        R.eax = ((R.ecx >>> 0)) | 0; // 8e6fa4: mov eax, ecx
        R.ebp = (R.m.u32(((R.esp + 0x26c) | 0) >>> 0)) | 0; // 8e6fa6: mov ebp, dword ptr [esp + 0x26c]
        R.edx = R.eax < 0 ? -1 : 0; // 8e6fad: cdq 
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.edi >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 8e6fae: idiv edi
        R.m.w32(((R.esi + 0x35) | 0) >>> 0, (R.eax >>> 0)); // 8e6fb0: mov dword ptr [esi + 0x35], eax
        pc = 0x8e7055; continue; // 8e6fb3: jmp 0x8e7055
      case 0x8e6fb8:
        R.sub(((R.ebx >>> 0) & 0xff), ((R.ecx >>> 0) & 0xff), 8); // 8e6fb8: cmp bl, cl
        if (!R.cL) { pc = 0x8e6fbe; continue; } // 8e6fba: jge 0x8e6fbe
        pc = 0x8e6fbc; continue;
      case 0x8e6fbc:
        R.ecx = ((R.ecx & 0xffffff00) | (((((R.ebx >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 8e6fbc: mov cl, bl
        pc = 0x8e6fbe; continue;
      case 0x8e6fbe:
        R.ebp = (R.m.u32(((R.esp + 0x26c) | 0) >>> 0)) | 0; // 8e6fbe: mov ebp, dword ptr [esp + 0x26c]
        R.m.w8(((R.esi + 0x3f) | 0) >>> 0, ((R.ecx >>> 0) & 0xff)); // 8e6fc5: mov byte ptr [esi + 0x3f], cl
        pc = 0x8e7055; continue; // 8e6fc8: jmp 0x8e7055
      case 0x8e6fcd:
        R.push(0x3); // 8e6fcd: push 3
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e6fcf: call 0x90cfc0
        R.eax = ((R.eax & 0xffffff00) | (((R.add(((R.eax >>> 0) & 0xff), 0x3, 8)) & 0xff) << 0)) | 0; // 8e6fd4: add al, 3
        R.ecx = ((R.ecx & 0xffffff00) | (((0xa) & 0xff) << 0)) | 0; // 8e6fd6: mov cl, 0xa
        { const p = ((R.eax << 24) >> 24) * ((((R.ecx >>> 0) & 0xff)) << 24 >> 24); R.eax = ((R.eax & 0xffff0000) | (p & 0xffff)) | 0; R.cf = R.of = ((p << 24) >> 24) !== p; } // 8e6fd8: imul cl
        R.push(0xb); // 8e6fda: push 0xb
        R.m.w8(((R.esi + 0x39) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 8e6fdc: mov byte ptr [esi + 0x39], al
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e6fdf: call 0x90cfc0
        R.edx = (((R.m.u8(((R.esi + 0x39) | 0) >>> 0)) << 24 >> 24)) | 0; // 8e6fe4: movsx edx, byte ptr [esi + 0x39]
        R.eax = (R.add((R.eax >>> 0), 0x5, 32)) | 0; // 8e6fe8: add eax, 5
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 8e6feb: mov dword ptr [esp + 0x1c], eax
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 8e6fef: fild dword ptr [esp + 0x1c]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 8e6ff3: mov dword ptr [esp + 0x1c], edx
        R.st[0] = R.st[0] * R.m.s32(((R.esi + 0x1b) | 0) >>> 0); // 8e6ff7: fimul dword ptr [esi + 0x1b]
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 8e6ffa: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 0.6666666666666666; // 8e6ffe: fmul qword ptr [0x96a670]
        R.st[0] = 100.0 - R.st[0]; // 8e7004: fsubr qword ptr [0x9688a8]
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 8e700a: fdivp st(1)
        R.ftol(); // 8e700c: call 0x945640
        R.push(0x5); // 8e7011: push 5
        R.m.w32(((R.esi + 0x35) | 0) >>> 0, (R.eax >>> 0)); // 8e7013: mov dword ptr [esi + 0x35], eax
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e7016: call 0x90cfc0
        R.eax = ((R.eax & 0xffffff00) | (((R.incdec(((R.eax >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 8e701b: inc al
        R.ecx = ((R.ecx & 0xffffff00) | (((0x5) & 0xff) << 0)) | 0; // 8e701d: mov cl, 5
        { const p = ((R.eax << 24) >> 24) * ((((R.ecx >>> 0) & 0xff)) << 24 >> 24); R.eax = ((R.eax & 0xffff0000) | (p & 0xffff)) | 0; R.cf = R.of = ((p << 24) >> 24) !== p; } // 8e701f: imul cl
        R.push(0x5); // 8e7021: push 5
        R.ebx = ((R.ebx & 0xffffff00) | (((((R.eax >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 8e7023: mov bl, al
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e7025: call 0x90cfc0
        R.fpush(R.m.s32(((R.esp + 0x3c) | 0) >>> 0)); // 8e702a: fild dword ptr [esp + 0x3c]
        R.fpush(R.f64(((R.esp + 0x34) | 0))); // 8e702e: fld qword ptr [esp + 0x34]
        R.st[0] = R.st[0] * 0.75; // 8e7032: fmul qword ptr [0x969040]
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 8e7038: add esp, 0x10
        R.eax = ((R.eax & 0xffffff00) | (((R.incdec(((R.eax >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 8e703b: inc al
        R.edx = ((R.edx & 0xffffff00) | (((0x5) & 0xff) << 0)) | 0; // 8e703d: mov dl, 5
        { const p = ((R.eax << 24) >> 24) * ((((R.edx >>> 0) & 0xff)) << 24 >> 24); R.eax = ((R.eax & 0xffff0000) | (p & 0xffff)) | 0; R.cf = R.of = ((p << 24) >> 24) !== p; } // 8e703f: imul dl
        R.fcom(R.st[0], R.st[1]); R.fpop(); R.fpop(); // 8e7041: fcompp 
        R.ecx = ((R.ecx & 0xffffff00) | (((((R.eax >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 8e7043: mov cl, al
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8e7045: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8e7047: test ah, 1
        if (R.zf) { pc = 0x8e709b; continue; } // 8e704a: je 0x8e709b
        pc = 0x8e704c; continue;
      case 0x8e704c:
        R.sub(((R.ebx >>> 0) & 0xff), ((R.ecx >>> 0) & 0xff), 8); // 8e704c: cmp bl, cl
        if (R.cLE) { pc = 0x8e7052; continue; } // 8e704e: jle 0x8e7052
        pc = 0x8e7050; continue;
      case 0x8e7050:
        R.ecx = ((R.ecx & 0xffffff00) | (((((R.ebx >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 8e7050: mov cl, bl
        pc = 0x8e7052; continue;
      case 0x8e7052:
        R.m.w8(((R.esi + 0x3f) | 0) >>> 0, ((R.ecx >>> 0) & 0xff)); // 8e7052: mov byte ptr [esi + 0x3f], cl
        pc = 0x8e7055; continue;
      case 0x8e7055:
        R.edi = (R.m.u32(((R.esp + 0x278) | 0) >>> 0)) | 0; // 8e7055: mov edi, dword ptr [esp + 0x278]
        pc = 0x8e705c; continue;
      case 0x8e705c:
        R.ebx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 8e705c: mov ebx, dword ptr [esp + 0x1c]
        pc = 0x8e7060; continue;
      case 0x8e7060:
        R.eax = (R.m.u32(((R.esp + 0x270) | 0) >>> 0)) | 0; // 8e7060: mov eax, dword ptr [esp + 0x270]
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 8e7067: mov ecx, dword ptr [0xde1f54]
        R.push((R.eax >>> 0)); // 8e706d: push eax
        R.push((R.ebp >>> 0)); // 8e706e: push ebp
        R.call(0x8cc930, { n: 2, thisEcx: true, calleeClean: true }); // 8e706f: call 0x8cc930
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e7074: test eax, eax
        if (R.zf) { pc = 0x8e70a5; continue; } // 8e7076: je 0x8e70a5
        pc = 0x8e7078; continue;
      case 0x8e7078:
        R.sub(R.m.u8(((R.eax + 0x2c) | 0) >>> 0), 0x2, 8); // 8e7078: cmp byte ptr [eax + 0x2c], 2
        if (!R.zf) { pc = 0x8e70a5; continue; } // 8e707c: jne 0x8e70a5
        pc = 0x8e707e; continue;
      case 0x8e707e:
        R.ecx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 8e707e: mov ecx, dword ptr [esp + 0x10]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 8e7082: test ecx, ecx
        if (!R.zf) { pc = 0x8e70a5; continue; } // 8e7084: jne 0x8e70a5
        pc = 0x8e7086; continue;
      case 0x8e7086:
        R.push(0x1); // 8e7086: push 1
        R.push(0x0); // 8e7088: push 0
        R.push(0x0); // 8e708a: push 0
        R.push(0x0); // 8e708c: push 0
        R.ecx = ((R.eax >>> 0)) | 0; // 8e708e: mov ecx, eax
        R.call(0x8e7a70, { n: 4, thisEcx: true, calleeClean: true }); // 8e7090: call 0x8e7a70
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.eax >>> 0)); // 8e7095: mov dword ptr [esp + 0x2c], eax
        pc = 0x8e70ad; continue; // 8e7099: jmp 0x8e70ad
      case 0x8e709b:
        R.sub(((R.ebx >>> 0) & 0xff), ((R.ecx >>> 0) & 0xff), 8); // 8e709b: cmp bl, cl
        if (!R.cL) { pc = 0x8e7052; continue; } // 8e709d: jge 0x8e7052
        pc = 0x8e709f; continue;
      case 0x8e709f:
        pc = 0x8e7050; continue; // 8e709f: jmp 0x8e7050
      case 0x8e70a1:
        R.fpop(); // 8e70a1: fstp st(0)
        pc = 0x8e7060; continue; // 8e70a3: jmp 0x8e7060
      case 0x8e70a5:
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, 0xffffffff); // 8e70a5: mov dword ptr [esp + 0x2c], 0xffffffff
        pc = 0x8e70ad; continue;
      case 0x8e70ad:
        R.ecx = (R.m.u32(((R.esi + 0x1b) | 0) >>> 0)) | 0; // 8e70ad: mov ecx, dword ptr [esi + 0x1b]
        R.sub((R.ebx >>> 0), (R.ecx >>> 0), 32); // 8e70b0: cmp ebx, ecx
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.ecx >>> 0)); // 8e70b2: mov dword ptr [esp + 0x14], ecx
        if (!R.cLE) { pc = 0x8e70ef; continue; } // 8e70b6: jg 0x8e70ef
        pc = 0x8e70b8; continue;
      case 0x8e70b8:
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 8e70b8: fild dword ptr [esp + 0x1c]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 8e70bc: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.8; // 8e70c0: fmul qword ptr [0x9689b0]
        R.fcom(R.st[0], R.st[1]); R.fpop(); R.fpop(); // 8e70c6: fcompp 
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8e70c8: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 8e70ca: test ah, 0x41
        if (R.zf) { pc = 0x8e70ef; continue; } // 8e70cd: je 0x8e70ef
        pc = 0x8e70cf; continue;
      case 0x8e70cf:
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 8e70cf: fild dword ptr [esp + 0x14]
        R.fpush(R.m.s32(((R.esp + 0x2c) | 0) >>> 0)); // 8e70d3: fild dword ptr [esp + 0x2c]
        R.st[0] = R.st[0] * 1.2; // 8e70d7: fmul qword ptr [0x968978]
        R.fcom(R.st[0], R.st[1]); R.fpop(); R.fpop(); // 8e70dd: fcompp 
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8e70df: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 8e70e1: test ah, 0x41
        if (!R.zf) { pc = 0x8e7484; continue; } // 8e70e4: jne 0x8e7484
        pc = 0x8e70ea; continue;
      case 0x8e70ea:
        pc = 0x8e754e; continue; // 8e70ea: jmp 0x8e754e
      case 0x8e70ef:
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 8e70ef: fild dword ptr [esp + 0x1c]
        R.m.wf64(((R.esp + 0x3c) | 0) >>> 0, R.st[0]); R.fpop(); // 8e70f3: fstp qword ptr [esp + 0x3c]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 8e70f7: fild dword ptr [esp + 0x14]
        R.fpush(R.st[0]); // 8e70fb: fld st(0)
        R.st[0] = R.st[0] * 0.75; // 8e70fd: fmul qword ptr [0x969040]
        R.fcom(R.st[0], R.f64(((R.esp + 0x3c) | 0))); R.fpop(); // 8e7103: fcomp qword ptr [esp + 0x3c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8e7107: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8e7109: test ah, 1
        if (!R.zf) { pc = 0x8e72de; continue; } // 8e710c: jne 0x8e72de
        pc = 0x8e7112; continue;
      case 0x8e7112:
        R.eax = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 8e7112: mov eax, dword ptr [esp + 0x20]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e7116: test eax, eax
        if (!R.zf) { pc = 0x8e72de; continue; } // 8e7118: jne 0x8e72de
        pc = 0x8e711e; continue;
      case 0x8e711e:
        R.edx = (R.m.u32(((R.esp + 0x274) | 0) >>> 0)) | 0; // 8e711e: mov edx, dword ptr [esp + 0x274]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 8e7125: test edx, edx
        if (R.zf) { pc = 0x8e72de; continue; } // 8e7127: je 0x8e72de
        pc = 0x8e712d; continue;
      case 0x8e712d:
        R.sub(R.m.u8(((R.edx) | 0) >>> 0), 0xb, 8); // 8e712d: cmp byte ptr [edx], 0xb
        if (!R.zf) { pc = 0x8e72de; continue; } // 8e7130: jne 0x8e72de
        pc = 0x8e7136; continue;
      case 0x8e7136:
        R.st[0] = R.st[0] * 0.4; // 8e7136: fmul qword ptr [0x968e00]
        R.fcom(R.st[0], R.f64(((R.esp + 0x3c) | 0))); R.fpop(); // 8e713c: fcomp qword ptr [esp + 0x3c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8e7140: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 8e7142: test ah, 0x41
        if (R.zf) { pc = 0x8e754e; continue; } // 8e7145: je 0x8e754e
        pc = 0x8e714b; continue;
      case 0x8e714b:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edx + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e714b: mov al, byte ptr [edx + 0x24]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x1e, 8)) & 0xff) << 0)) | 0; // 8e714e: and al, 0x1e
        R.sub(((R.eax >>> 0) & 0xff), 0xa, 8); // 8e7150: cmp al, 0xa
        if (R.zf) { pc = 0x8e7166; continue; } // 8e7152: je 0x8e7166
        pc = 0x8e7154; continue;
      case 0x8e7154:
        R.sub(((R.eax >>> 0) & 0xff), 0x8, 8); // 8e7154: cmp al, 8
        if (!R.zf) { pc = 0x8e754e; continue; } // 8e7156: jne 0x8e754e
        pc = 0x8e715c; continue;
      case 0x8e715c:
        R.sub(R.m.u8(((R.ebp + 0x18) | 0) >>> 0), 0x1c, 8); // 8e715c: cmp byte ptr [ebp + 0x18], 0x1c
        if (!R.cL) { pc = 0x8e754e; continue; } // 8e7160: jge 0x8e754e
        pc = 0x8e7166; continue;
      case 0x8e7166:
        R.ecx = (R.m.u32(((R.ebp + 0x1a) | 0) >>> 0)) | 0; // 8e7166: mov ecx, dword ptr [ebp + 0x1a]
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.ecx + 0x8e) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8e7169: mov ax, word ptr [ecx + 0x8e]
        R.sub(((R.eax >>> 0) & 0xffff), 0x1388, 16); // 8e7170: cmp ax, 0x1388
        if (R.cLE) { pc = 0x8e727a; continue; } // 8e7174: jle 0x8e727a
        pc = 0x8e717a; continue;
      case 0x8e717a:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.ebp + 0x22) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e717a: mov cl, byte ptr [ebp + 0x22]
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 8e717d: test cl, cl
        if (!R.zf) { pc = 0x8e727a; continue; } // 8e717f: jne 0x8e727a
        pc = 0x8e7185; continue;
      case 0x8e7185:
        R.edx = (R.m.u32(((R.ebp + 0x61) | 0) >>> 0)) | 0; // 8e7185: mov edx, dword ptr [ebp + 0x61]
        R.ecx = (((R.m.u16(((R.edx + 0x9) | 0) >>> 0)) << 16 >> 16)) | 0; // 8e7188: movsx ecx, word ptr [edx + 9]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 8e718c: mov dword ptr [esp + 0x10], ecx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 8e7190: fild dword ptr [esp + 0x10]
        R.edx = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8e7194: movsx edx, ax
        R.st[0] = R.st[0] * 0.7692307692307692; // 8e7197: fmul qword ptr [0x970438]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edx >>> 0)); // 8e719d: mov dword ptr [esp + 0x10], edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 8e71a1: fild dword ptr [esp + 0x10]
        R.fcom(R.st[0], R.st[1]); R.fpop(); R.fpop(); // 8e71a5: fcompp 
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8e71a7: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8e71a9: test ah, 1
        if (!R.zf) { pc = 0x8e71f5; continue; } // 8e71ac: jne 0x8e71f5
        pc = 0x8e71ae; continue;
      case 0x8e71ae:
        R.eax = (R.m.u32(((R.ebp + 0x24) | 0) >>> 0)) | 0; // 8e71ae: mov eax, dword ptr [ebp + 0x24]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e71b1: test eax, eax
        if (R.zf) { pc = 0x8e71c2; continue; } // 8e71b3: je 0x8e71c2
        pc = 0x8e71b5; continue;
      case 0x8e71b5:
        R.push((R.eax >>> 0)); // 8e71b5: push eax
        R.call(0x5409b0, { n: 1, thisEcx: false, calleeClean: false }); // 8e71b6: call 0x5409b0
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8e71bb: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e71be: test eax, eax
        if (!R.zf) { pc = 0x8e71f5; continue; } // 8e71c0: jne 0x8e71f5
        pc = 0x8e71c2; continue;
      case 0x8e71c2:
        R.push(0x5); // 8e71c2: push 5
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e71c4: call 0x90cfc0
        R.eax = ((R.eax & 0xffffff00) | (((R.incdec(((R.eax >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 8e71c9: inc al
        R.ecx = ((R.ecx & 0xffffff00) | (((0xa) & 0xff) << 0)) | 0; // 8e71cb: mov cl, 0xa
        { const p = ((R.eax << 24) >> 24) * ((((R.ecx >>> 0) & 0xff)) << 24 >> 24); R.eax = ((R.eax & 0xffff0000) | (p & 0xffff)) | 0; R.cf = R.of = ((p << 24) >> 24) !== p; } // 8e71cd: imul cl
        R.push(0xb); // 8e71cf: push 0xb
        R.m.w8(((R.esi + 0x39) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 8e71d1: mov byte ptr [esi + 0x39], al
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e71d4: call 0x90cfc0
        R.edx = (((R.m.u8(((R.esi + 0x39) | 0) >>> 0)) << 24 >> 24)) | 0; // 8e71d9: movsx edx, byte ptr [esi + 0x39]
        R.eax = (R.add((R.eax >>> 0), 0xa, 32)) | 0; // 8e71dd: add eax, 0xa
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.eax >>> 0)); // 8e71e0: mov dword ptr [esp + 0x18], eax
        R.fpush(R.m.s32(((R.esp + 0x18) | 0) >>> 0)); // 8e71e4: fild dword ptr [esp + 0x18]
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.edx >>> 0)); // 8e71e8: mov dword ptr [esp + 0x18], edx
        R.st[0] = R.st[0] * R.m.s32(((R.esi + 0x1b) | 0) >>> 0); // 8e71ec: fimul dword ptr [esi + 0x1b]
        R.fpush(R.m.s32(((R.esp + 0x18) | 0) >>> 0)); // 8e71ef: fild dword ptr [esp + 0x18]
        pc = 0x8e723b; continue; // 8e71f3: jmp 0x8e723b
      case 0x8e71f5:
        R.fpush(R.m.s32(((R.esi + 0x1b) | 0) >>> 0)); // 8e71f5: fild dword ptr [esi + 0x1b]
        R.st[0] = R.st[0] * 0.75; // 8e71f8: fmul qword ptr [0x969040]
        R.ftol(); // 8e71fe: call 0x945640
        R.push(0x5); // 8e7203: push 5
        R.m.w32(((R.esi + 0x3a) | 0) >>> 0, (R.eax >>> 0)); // 8e7205: mov dword ptr [esi + 0x3a], eax
        R.m.w8(((R.esi + 0x3e) | 0) >>> 0, 0xa); // 8e7208: mov byte ptr [esi + 0x3e], 0xa
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e720c: call 0x90cfc0
        R.eax = ((R.eax & 0xffffff00) | (((R.add(((R.eax >>> 0) & 0xff), 0x3, 8)) & 0xff) << 0)) | 0; // 8e7211: add al, 3
        R.ecx = ((R.ecx & 0xffffff00) | (((0xa) & 0xff) << 0)) | 0; // 8e7213: mov cl, 0xa
        { const p = ((R.eax << 24) >> 24) * ((((R.ecx >>> 0) & 0xff)) << 24 >> 24); R.eax = ((R.eax & 0xffff0000) | (p & 0xffff)) | 0; R.cf = R.of = ((p << 24) >> 24) !== p; } // 8e7215: imul cl
        R.push(0xb); // 8e7217: push 0xb
        R.m.w8(((R.esi + 0x39) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 8e7219: mov byte ptr [esi + 0x39], al
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e721c: call 0x90cfc0
        R.edx = (((R.m.u8(((R.esi + 0x39) | 0) >>> 0)) << 24 >> 24)) | 0; // 8e7221: movsx edx, byte ptr [esi + 0x39]
        R.eax = (R.add((R.eax >>> 0), 0x5, 32)) | 0; // 8e7225: add eax, 5
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.eax >>> 0)); // 8e7228: mov dword ptr [esp + 0x18], eax
        R.fpush(R.m.s32(((R.esp + 0x18) | 0) >>> 0)); // 8e722c: fild dword ptr [esp + 0x18]
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.edx >>> 0)); // 8e7230: mov dword ptr [esp + 0x18], edx
        R.st[0] = R.st[0] * R.m.s32(((R.esi + 0x1b) | 0) >>> 0); // 8e7234: fimul dword ptr [esi + 0x1b]
        R.fpush(R.m.s32(((R.esp + 0x18) | 0) >>> 0)); // 8e7237: fild dword ptr [esp + 0x18]
        pc = 0x8e723b; continue;
      case 0x8e723b:
        R.st[0] = R.st[0] * 0.6666666666666666; // 8e723b: fmul qword ptr [0x96a670]
        R.st[0] = 100.0 - R.st[0]; // 8e7241: fsubr qword ptr [0x9688a8]
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 8e7247: fdivp st(1)
        R.ftol(); // 8e7249: call 0x945640
        R.push(0x6); // 8e724e: push 6
        R.m.w32(((R.esi + 0x35) | 0) >>> 0, (R.eax >>> 0)); // 8e7250: mov dword ptr [esi + 0x35], eax
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e7253: call 0x90cfc0
        R.ecx = ((R.ecx & 0xffffff00) | (((0x5) & 0xff) << 0)) | 0; // 8e7258: mov cl, 5
        R.push(0x6); // 8e725a: push 6
        { const p = ((R.eax << 24) >> 24) * ((((R.ecx >>> 0) & 0xff)) << 24 >> 24); R.eax = ((R.eax & 0xffff0000) | (p & 0xffff)) | 0; R.cf = R.of = ((p << 24) >> 24) !== p; } // 8e725c: imul cl
        R.ebx = ((R.ebx & 0xffffff00) | (((((R.eax >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 8e725e: mov bl, al
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e7260: call 0x90cfc0
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 8e7265: add esp, 0x10
        pc = 0x8e7268; continue;
      case 0x8e7268:
        R.edx = ((R.edx & 0xffffff00) | (((0x5) & 0xff) << 0)) | 0; // 8e7268: mov dl, 5
        { const p = ((R.eax << 24) >> 24) * ((((R.edx >>> 0) & 0xff)) << 24 >> 24); R.eax = ((R.eax & 0xffff0000) | (p & 0xffff)) | 0; R.cf = R.of = ((p << 24) >> 24) !== p; } // 8e726a: imul dl
        R.sub(((R.ebx >>> 0) & 0xff), ((R.eax >>> 0) & 0xff), 8); // 8e726c: cmp bl, al
        if (!R.cL) { pc = 0x8e7272; continue; } // 8e726e: jge 0x8e7272
        pc = 0x8e7270; continue;
      case 0x8e7270:
        R.eax = ((R.eax & 0xffffff00) | (((((R.ebx >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 8e7270: mov al, bl
        pc = 0x8e7272; continue;
      case 0x8e7272:
        R.m.w8(((R.esi + 0x3f) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 8e7272: mov byte ptr [esi + 0x3f], al
        pc = 0x8e77bd; continue; // 8e7275: jmp 0x8e77bd
      case 0x8e727a:
        R.push(0x3); // 8e727a: push 3
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e727c: call 0x90cfc0
        R.eax = ((R.eax & 0xffffff00) | (((R.add(((R.eax >>> 0) & 0xff), 0x3, 8)) & 0xff) << 0)) | 0; // 8e7281: add al, 3
        R.ecx = ((R.ecx & 0xffffff00) | (((0xa) & 0xff) << 0)) | 0; // 8e7283: mov cl, 0xa
        { const p = ((R.eax << 24) >> 24) * ((((R.ecx >>> 0) & 0xff)) << 24 >> 24); R.eax = ((R.eax & 0xffff0000) | (p & 0xffff)) | 0; R.cf = R.of = ((p << 24) >> 24) !== p; } // 8e7285: imul cl
        R.push(0xb); // 8e7287: push 0xb
        R.m.w8(((R.esi + 0x39) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 8e7289: mov byte ptr [esi + 0x39], al
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e728c: call 0x90cfc0
        R.edx = (((R.m.u8(((R.esi + 0x39) | 0) >>> 0)) << 24 >> 24)) | 0; // 8e7291: movsx edx, byte ptr [esi + 0x39]
        R.eax = (R.add((R.eax >>> 0), 0x5, 32)) | 0; // 8e7295: add eax, 5
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.eax >>> 0)); // 8e7298: mov dword ptr [esp + 0x18], eax
        R.fpush(R.m.s32(((R.esp + 0x18) | 0) >>> 0)); // 8e729c: fild dword ptr [esp + 0x18]
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.edx >>> 0)); // 8e72a0: mov dword ptr [esp + 0x18], edx
        R.st[0] = R.st[0] * R.m.s32(((R.esi + 0x1b) | 0) >>> 0); // 8e72a4: fimul dword ptr [esi + 0x1b]
        R.fpush(R.m.s32(((R.esp + 0x18) | 0) >>> 0)); // 8e72a7: fild dword ptr [esp + 0x18]
        R.st[0] = R.st[0] * 0.6666666666666666; // 8e72ab: fmul qword ptr [0x96a670]
        R.st[0] = 100.0 - R.st[0]; // 8e72b1: fsubr qword ptr [0x9688a8]
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 8e72b7: fdivp st(1)
        R.ftol(); // 8e72b9: call 0x945640
        R.push(0x5); // 8e72be: push 5
        R.m.w32(((R.esi + 0x35) | 0) >>> 0, (R.eax >>> 0)); // 8e72c0: mov dword ptr [esi + 0x35], eax
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e72c3: call 0x90cfc0
        R.eax = ((R.eax & 0xffffff00) | (((R.incdec(((R.eax >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 8e72c8: inc al
        R.ecx = ((R.ecx & 0xffffff00) | (((0x5) & 0xff) << 0)) | 0; // 8e72ca: mov cl, 5
        { const p = ((R.eax << 24) >> 24) * ((((R.ecx >>> 0) & 0xff)) << 24 >> 24); R.eax = ((R.eax & 0xffff0000) | (p & 0xffff)) | 0; R.cf = R.of = ((p << 24) >> 24) !== p; } // 8e72cc: imul cl
        R.push(0x5); // 8e72ce: push 5
        R.ebx = ((R.ebx & 0xffffff00) | (((((R.eax >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 8e72d0: mov bl, al
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e72d2: call 0x90cfc0
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 8e72d7: add esp, 0x10
        R.eax = ((R.eax & 0xffffff00) | (((R.incdec(((R.eax >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 8e72da: inc al
        pc = 0x8e7268; continue; // 8e72dc: jmp 0x8e7268
      case 0x8e72de:
        R.sub((R.ebx >>> 0), (R.ecx >>> 0), 32); // 8e72de: cmp ebx, ecx
        if (!R.cL) { pc = 0x8e7457; continue; } // 8e72e0: jge 0x8e7457
        pc = 0x8e72e6; continue;
      case 0x8e72e6:
        R.sub((R.ecx >>> 0), (R.edi >>> 0), 32); // 8e72e6: cmp ecx, edi
        R.fpop(); // 8e72e8: fstp st(0)
        if (!R.cL) { pc = 0x8e7452; continue; } // 8e72ea: jge 0x8e7452
        pc = 0x8e72f0; continue;
      case 0x8e72f0:
        R.eax = (R.m.u32(((R.esp + 0x274) | 0) >>> 0)) | 0; // 8e72f0: mov eax, dword ptr [esp + 0x274]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e72f7: test eax, eax
        if (R.zf) { pc = 0x8e7452; continue; } // 8e72f9: je 0x8e7452
        pc = 0x8e72ff; continue;
      case 0x8e72ff:
        R.eax = (R.m.u32(((R.eax + 0x3) | 0) >>> 0)) | 0; // 8e72ff: mov eax, dword ptr [eax + 3]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e7302: test eax, eax
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 8e7304: mov dword ptr [esp + 0x10], eax
        if (R.zf) { pc = 0x8e7452; continue; } // 8e7308: je 0x8e7452
        pc = 0x8e730e; continue;
      case 0x8e730e:
        R.eax = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 8e730e: mov eax, dword ptr [esp + 0x20]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e7312: test eax, eax
        if (!R.zf) { pc = 0x8e7452; continue; } // 8e7314: jne 0x8e7452
        pc = 0x8e731a; continue;
      case 0x8e731a:
        R.ecx = (R.m.u32(((R.esp + 0x274) | 0) >>> 0)) | 0; // 8e731a: mov ecx, dword ptr [esp + 0x274]
        R.sub(R.m.u8(((R.ecx) | 0) >>> 0), 0xb, 8); // 8e7321: cmp byte ptr [ecx], 0xb
        if (!R.zf) { pc = 0x8e7452; continue; } // 8e7324: jne 0x8e7452
        pc = 0x8e732a; continue;
      case 0x8e732a:
        R.edx = ((R.ecx >>> 0)) | 0; // 8e732a: mov edx, ecx
        R.fpush(R.m.s32(((R.edx + 0xb) | 0) >>> 0)); // 8e732c: fild dword ptr [edx + 0xb]
        R.st[0] = R.st[0] / R.m.s32(((R.esp + 0x10) | 0) >>> 0); // 8e732f: fidiv dword ptr [esp + 0x10]
        R.m.wf32(((R.esp + 0x20) | 0) >>> 0, R.st[0]); // 8e7333: fst dword ptr [esp + 0x20]
        R.fcom(R.st[0], 0.05); R.fpop(); // 8e7337: fcomp qword ptr [0x967888]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8e733d: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8e733f: test ah, 1
        if (R.zf) { pc = 0x8e734c; continue; } // 8e7342: je 0x8e734c
        pc = 0x8e7344; continue;
      case 0x8e7344:
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, 0x3d4ccccd); // 8e7344: mov dword ptr [esp + 0x20], 0x3d4ccccd
        pc = 0x8e734c; continue;
      case 0x8e734c:
        R.fpush(R.f32(((R.esp + 0x20) | 0))); // 8e734c: fld dword ptr [esp + 0x20]
        R.fcom(R.st[0], 0.75); R.fpop(); // 8e7350: fcomp qword ptr [0x969040]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8e7356: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 8e7358: test ah, 0x41
        if (!R.zf) { pc = 0x8e7365; continue; } // 8e735b: jne 0x8e7365
        pc = 0x8e735d; continue;
      case 0x8e735d:
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, 0x3f400000); // 8e735d: mov dword ptr [esp + 0x20], 0x3f400000
        pc = 0x8e7365; continue;
      case 0x8e7365:
        R.push(0x2); // 8e7365: push 2
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8e7367: call 0x90cfc0
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8e736c: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e736f: test eax, eax
        if (R.zf) { pc = 0x8e742c; continue; } // 8e7371: je 0x8e742c
        pc = 0x8e7377; continue;
      case 0x8e7377:
        R.fpush(10.0); // 8e7377: fld dword ptr [0x968a78]
        R.st[0] = R.st[0] / R.f32(((R.esp + 0x20) | 0)); // 8e737d: fdiv dword ptr [esp + 0x20]
        R.st[0] = R.st[0] * 0.10000000149011612; // 8e7381: fmul dword ptr [0x96afc4]
        R.ftol(); // 8e7387: call 0x945640
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 8e738c: movsx eax, al
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 8e738f: lea eax, [eax + eax*4]
        R.eax = (R.shl((R.eax >>> 0), 0x1, 32)) | 0; // 8e7392: shl eax, 1
        R.sub((R.eax >>> 0), 0x14, 32); // 8e7394: cmp eax, 0x14
        if (!R.cL) { pc = 0x8e73a0; continue; } // 8e7397: jge 0x8e73a0
        pc = 0x8e7399; continue;
      case 0x8e7399:
        R.eax = (0x14) | 0; // 8e7399: mov eax, 0x14
        pc = 0x8e73aa; continue; // 8e739e: jmp 0x8e73aa
      case 0x8e73a0:
        R.sub((R.eax >>> 0), 0x64, 32); // 8e73a0: cmp eax, 0x64
        if (R.cLE) { pc = 0x8e73aa; continue; } // 8e73a3: jle 0x8e73aa
        pc = 0x8e73a5; continue;
      case 0x8e73a5:
        R.eax = (0x64) | 0; // 8e73a5: mov eax, 0x64
        pc = 0x8e73aa; continue;
      case 0x8e73aa:
        R.ecx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 8e73aa: movsx ecx, al
        R.m.w8(((R.esi + 0x39) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 8e73ad: mov byte ptr [esi + 0x39], al
        R.eax = (0x66666667) | 0; // 8e73b0: mov eax, 0x66666667
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 8e73b5: imul ecx
        R.edx = (R.sar((R.edx >>> 0), 0x2, 32)) | 0; // 8e73b7: sar edx, 2
        R.eax = ((R.edx >>> 0)) | 0; // 8e73ba: mov eax, edx
        R.eax = (R.shr((R.eax >>> 0), 0x1f, 32)) | 0; // 8e73bc: shr eax, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8e73bf: add edx, eax
        R.eax = (((R.edx + R.edx * 4) | 0)) | 0; // 8e73c1: lea eax, [edx + edx*4]
        R.eax = (R.shl((R.eax >>> 0), 0x1, 32)) | 0; // 8e73c4: shl eax, 1
        R.sub((R.eax >>> 0), 0xa, 32); // 8e73c6: cmp eax, 0xa
        if (!R.cL) { pc = 0x8e73d2; continue; } // 8e73c9: jge 0x8e73d2
        pc = 0x8e73cb; continue;
      case 0x8e73cb:
        R.eax = (0xa) | 0; // 8e73cb: mov eax, 0xa
        pc = 0x8e73dc; continue; // 8e73d0: jmp 0x8e73dc
      case 0x8e73d2:
        R.sub((R.eax >>> 0), 0x32, 32); // 8e73d2: cmp eax, 0x32
        if (R.cLE) { pc = 0x8e73dc; continue; } // 8e73d5: jle 0x8e73dc
        pc = 0x8e73d7; continue;
      case 0x8e73d7:
        R.eax = (0x32) | 0; // 8e73d7: mov eax, 0x32
        pc = 0x8e73dc; continue;
      case 0x8e73dc:
        R.ecx = (R.m.u32(((R.esi + 0x1b) | 0) >>> 0)) | 0; // 8e73dc: mov ecx, dword ptr [esi + 0x1b]
        R.m.w8(((R.esi + 0x39) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 8e73df: mov byte ptr [esi + 0x39], al
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 8e73e2: movsx eax, al
        R.edi = (R.sub((R.edi >>> 0), (R.ecx >>> 0), 32)) | 0; // 8e73e5: sub edi, ecx
        R.ecx = (((R.eax + R.eax * 2) | 0)) | 0; // 8e73e7: lea ecx, [eax + eax*2]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edi >>> 0)); // 8e73ea: mov dword ptr [esp + 0x10], edi
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 8e73ee: fild dword ptr [esp + 0x10]
        R.eax = (((R.eax + R.ecx * 8) | 0)) | 0; // 8e73f2: lea eax, [eax + ecx*8]
        R.eax = (((R.eax + R.eax * 2) | 0)) | 0; // 8e73f5: lea eax, [eax + eax*2]
        R.st[0] = R.st[0] * R.f32(((R.esp + 0x20) | 0)); // 8e73f8: fmul dword ptr [esp + 0x20]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 8e73fc: lea eax, [eax + eax*4]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 8e73ff: lea edx, [eax + eax*4]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 8e7402: shl edx, 4
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edx >>> 0)); // 8e7405: mov dword ptr [esp + 0x10], edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 8e7409: fild dword ptr [esp + 0x10]
        R.m.wf32(((R.esp + 0x10) | 0) >>> 0, R.st[0]); R.fpop(); // 8e740d: fstp dword ptr [esp + 0x10]
        R.fcom(R.st[0], R.f32(((R.esp + 0x10) | 0))); // 8e7411: fcom dword ptr [esp + 0x10]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8e7415: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8e7417: test ah, 1
        if (!R.zf) { pc = 0x8e7422; continue; } // 8e741a: jne 0x8e7422
        pc = 0x8e741c; continue;
      case 0x8e741c:
        R.fpop(); // 8e741c: fstp st(0)
        R.fpush(R.f32(((R.esp + 0x10) | 0))); // 8e741e: fld dword ptr [esp + 0x10]
        pc = 0x8e7422; continue;
      case 0x8e7422:
        R.ftol(); // 8e7422: call 0x945640
        R.m.w32(((R.esi + 0x35) | 0) >>> 0, (R.eax >>> 0)); // 8e7427: mov dword ptr [esi + 0x35], eax
        pc = 0x8e7448; continue; // 8e742a: jmp 0x8e7448
      case 0x8e742c:
        R.edi = (R.sub((R.edi >>> 0), R.m.u32(((R.esi + 0x1b) | 0) >>> 0), 32)) | 0; // 8e742c: sub edi, dword ptr [esi + 0x1b]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edi >>> 0)); // 8e742f: mov dword ptr [esp + 0x10], edi
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 8e7433: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * R.f32(((R.esp + 0x20) | 0)); // 8e7437: fmul dword ptr [esp + 0x20]
        R.st[0] = R.st[0] * 0.5; // 8e743b: fmul dword ptr [0x968f18]
        R.ftol(); // 8e7441: call 0x945640
        R.ebx = (R.add((R.ebx >>> 0), (R.eax >>> 0), 32)) | 0; // 8e7446: add ebx, eax
        pc = 0x8e7448; continue;
      case 0x8e7448:
        R.eax = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 8e7448: mov eax, dword ptr [esp + 0x30]
        R.sub((R.ebx >>> 0), (R.eax >>> 0), 32); // 8e744c: cmp ebx, eax
        if (R.cLE) { pc = 0x8e7452; continue; } // 8e744e: jle 0x8e7452
        pc = 0x8e7450; continue;
      case 0x8e7450:
        R.ebx = ((R.eax >>> 0)) | 0; // 8e7450: mov ebx, eax
        pc = 0x8e7452; continue;
      case 0x8e7452:
        R.m.w32(((R.esi + 0x1b) | 0) >>> 0, (R.ebx >>> 0)); // 8e7452: mov dword ptr [esi + 0x1b], ebx
        pc = 0x8e7484; continue; // 8e7455: jmp 0x8e7484
      case 0x8e7457:
        R.fpush(R.m.s32(((R.esp + 0x2c) | 0) >>> 0)); // 8e7457: fild dword ptr [esp + 0x2c]
        R.st[0] = R.st[0] * 1.2; // 8e745b: fmul qword ptr [0x968978]
        R.m.wf64(((R.esp + 0x3c) | 0) >>> 0, R.st[0]); R.fpop(); // 8e7461: fstp qword ptr [esp + 0x3c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x3c) | 0))); R.fpop(); // 8e7465: fcomp qword ptr [esp + 0x3c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8e7469: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8e746b: test ah, 1
        if (R.zf) { pc = 0x8e7484; continue; } // 8e746e: je 0x8e7484
        pc = 0x8e7470; continue;
      case 0x8e7470:
        R.fpush(R.f64(((R.esp + 0x3c) | 0))); // 8e7470: fld qword ptr [esp + 0x3c]
        R.ftol(); // 8e7474: call 0x945640
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 8e7479: cmp eax, ebx
        R.m.w32(((R.esi + 0x1b) | 0) >>> 0, (R.eax >>> 0)); // 8e747b: mov dword ptr [esi + 0x1b], eax
        if (!R.cLE) { pc = 0x8e754e; continue; } // 8e747e: jg 0x8e754e
        pc = 0x8e7484; continue;
      case 0x8e7484:
        R.eax = (R.m.u32(((R.esp + 0x270) | 0) >>> 0)) | 0; // 8e7484: mov eax, dword ptr [esp + 0x270]
        R.ecx = (R.m.u32(((0xae2a38) | 0) >>> 0)) | 0; // 8e748b: mov ecx, dword ptr [0xae2a38]
        R.push(0x0); // 8e7491: push 0
        R.push(0x1); // 8e7493: push 1
        R.push(0x0); // 8e7495: push 0
        R.push(0x0); // 8e7497: push 0
        R.push((R.ebp >>> 0)); // 8e7499: push ebp
        R.push((R.eax >>> 0)); // 8e749a: push eax
        R.call(0x5a0590, { n: 1, thisEcx: true, calleeClean: true }); // 8e749b: call 0x5a0590
        R.ecx = ((R.eax >>> 0)) | 0; // 8e74a0: mov ecx, eax
        R.call(0x598800, { n: 5, thisEcx: true, calleeClean: true }); // 8e74a2: call 0x598800
        R.edi = ((R.eax >>> 0)) | 0; // 8e74a7: mov edi, eax
        R.eax = (R.m.u32(((R.esi + 0x1b) | 0) >>> 0)) | 0; // 8e74a9: mov eax, dword ptr [esi + 0x1b]
        R.ecx = ((R.edx >>> 0)) | 0; // 8e74ac: mov ecx, edx
        R.edx = R.eax < 0 ? -1 : 0; // 8e74ae: cdq 
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 8e74af: cmp ecx, edx
        if (!R.cLE) { pc = 0x8e74c1; continue; } // 8e74b1: jg 0x8e74c1
        pc = 0x8e74b3; continue;
      case 0x8e74b3:
        if (R.cL) { pc = 0x8e77bd; continue; } // 8e74b3: jl 0x8e77bd
        pc = 0x8e74b9; continue;
      case 0x8e74b9:
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 8e74b9: cmp edi, eax
        if (R.cf) { pc = 0x8e77bd; continue; } // 8e74bb: jb 0x8e77bd
        pc = 0x8e74c1; continue;
      case 0x8e74c1:
        R.edi = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 8e74c1: mov edi, dword ptr [esp + 0x34]
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 8e74c5: test edi, edi
        if (R.zf) { pc = 0x8e74fe; continue; } // 8e74c7: je 0x8e74fe
        pc = 0x8e74c9; continue;
      case 0x8e74c9:
        R.ecx = ((R.edi >>> 0)) | 0; // 8e74c9: mov ecx, edi
        R.call(0x867b50, { n: 0, thisEcx: true, calleeClean: false }); // 8e74cb: call 0x867b50
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e74d0: test eax, eax
        if (R.zf) { pc = 0x8e74fe; continue; } // 8e74d2: je 0x8e74fe
        pc = 0x8e74d4; continue;
      case 0x8e74d4:
        R.fpush(R.m.s32(((R.esi + 0x1b) | 0) >>> 0)); // 8e74d4: fild dword ptr [esi + 0x1b]
        R.st[0] = R.st[0] * 1.05; // 8e74d7: fmul qword ptr [0x9689b8]
        R.fpush(R.m.s32(((R.edi + 0x21) | 0) >>> 0)); // 8e74dd: fild dword ptr [edi + 0x21]
        R.fcom(R.st[0], R.st[1]); R.fpop(); R.fpop(); // 8e74e0: fcompp 
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8e74e2: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8e74e4: test ah, 1
        if (R.zf) { pc = 0x8e7523; continue; } // 8e74e7: je 0x8e7523
        pc = 0x8e74e9; continue;
      case 0x8e74e9:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8e74e9: xor eax, eax
        R.ecx = ((R.edi >>> 0)) | 0; // 8e74eb: mov ecx, edi
        R.m.w32(((R.esi + 0x35) | 0) >>> 0, (R.eax >>> 0)); // 8e74ed: mov dword ptr [esi + 0x35], eax
        R.m.w32(((R.esi + 0x3a) | 0) >>> 0, (R.eax >>> 0)); // 8e74f0: mov dword ptr [esi + 0x3a], eax
        R.m.w8(((R.esi + 0x3f) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 8e74f3: mov byte ptr [esi + 0x3f], al
        R.edx = (R.m.u32(((R.ecx + 0x21) | 0) >>> 0)) | 0; // 8e74f6: mov edx, dword ptr [ecx + 0x21]
        R.m.w32(((R.esi + 0x1b) | 0) >>> 0, (R.edx >>> 0)); // 8e74f9: mov dword ptr [esi + 0x1b], edx
        pc = 0x8e7523; continue; // 8e74fc: jmp 0x8e7523
      case 0x8e74fe:
        R.eax = (R.m.u32(((R.esp + 0x274) | 0) >>> 0)) | 0; // 8e74fe: mov eax, dword ptr [esp + 0x274]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e7505: test eax, eax
        if (R.zf) { pc = 0x8e750e; continue; } // 8e7507: je 0x8e750e
        pc = 0x8e7509; continue;
      case 0x8e7509:
        R.sub(R.m.u8(((R.eax) | 0) >>> 0), 0xb, 8); // 8e7509: cmp byte ptr [eax], 0xb
        if (!R.zf) { pc = 0x8e7523; continue; } // 8e750c: jne 0x8e7523
        pc = 0x8e750e; continue;
      case 0x8e750e:
        R.eax = (R.m.u32(((R.esp + 0x270) | 0) >>> 0)) | 0; // 8e750e: mov eax, dword ptr [esp + 0x270]
        R.ecx = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 8e7515: mov ecx, dword ptr [esp + 0x38]
        R.push((R.eax >>> 0)); // 8e7519: push eax
        R.push((R.ecx >>> 0)); // 8e751a: push ecx
        R.push((R.ebp >>> 0)); // 8e751b: push ebp
        R.ecx = ((R.esi >>> 0)) | 0; // 8e751c: mov ecx, esi
        R.call(0x8e8330, { n: 3, thisEcx: true, calleeClean: true }); // 8e751e: call 0x8e8330
        pc = 0x8e7523; continue;
      case 0x8e7523:
        R.eax = (R.m.u32(((R.esp + 0x278) | 0) >>> 0)) | 0; // 8e7523: mov eax, dword ptr [esp + 0x278]
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 8e752a: cmp eax, -1
        if (R.zf) { pc = 0x8e7577; continue; } // 8e752d: je 0x8e7577
        pc = 0x8e752f; continue;
      case 0x8e752f:
        R.sub((R.eax >>> 0), 0x1388, 32); // 8e752f: cmp eax, 0x1388
        if (!R.cL) { pc = 0x8e7544; continue; } // 8e7534: jge 0x8e7544
        pc = 0x8e7536; continue;
      case 0x8e7536:
        R.ecx = (R.m.u32(((R.ebp + 0x52) | 0) >>> 0)) | 0; // 8e7536: mov ecx, dword ptr [ebp + 0x52]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 8e7539: test ecx, ecx
        if (R.cLE) { pc = 0x8e7544; continue; } // 8e753b: jle 0x8e7544
        pc = 0x8e753d; continue;
      case 0x8e753d:
        R.eax = (0x1388) | 0; // 8e753d: mov eax, 0x1388
        pc = 0x8e7549; continue; // 8e7542: jmp 0x8e7549
      case 0x8e7544:
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 8e7544: cmp eax, -1
        if (R.cLE) { pc = 0x8e7577; continue; } // 8e7547: jle 0x8e7577
        pc = 0x8e7549; continue;
      case 0x8e7549:
        R.sub(R.m.u32(((R.esi + 0x1b) | 0) >>> 0), (R.eax >>> 0), 32); // 8e7549: cmp dword ptr [esi + 0x1b], eax
        if (R.cLE) { pc = 0x8e7577; continue; } // 8e754c: jle 0x8e7577
        pc = 0x8e754e; continue;
      case 0x8e754e:
        R.esi = (R.m.u32(((R.esp + 0x280) | 0) >>> 0)) | 0; // 8e754e: mov esi, dword ptr [esp + 0x280]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8e7555: test esi, esi
        if (R.zf) { pc = 0x8e77bd; continue; } // 8e7557: je 0x8e77bd
        pc = 0x8e755d; continue;
      case 0x8e755d:
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8e755d: mov eax, dword ptr [esi]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e755f: test eax, eax
        if (R.zf) { pc = 0x8e756c; continue; } // 8e7561: je 0x8e756c
        pc = 0x8e7563; continue;
      case 0x8e7563:
        R.push((R.eax >>> 0)); // 8e7563: push eax
        R.call(0x944c94, { n: 1, thisEcx: false, calleeClean: false }); // 8e7564: call 0x944c94
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8e7569: add esp, 4
        pc = 0x8e756c; continue;
      case 0x8e756c:
        R.m.w32(((R.esi) | 0) >>> 0, 0x0); // 8e756c: mov dword ptr [esi], 0
        pc = 0x8e77bd; continue; // 8e7572: jmp 0x8e77bd
      case 0x8e7577:
        R.edx = (R.m.u32(((0xae2c90) | 0) >>> 0)) | 0; // 8e7577: mov edx, dword ptr [0xae2c90]
        R.eax = (R.m.u32(((0xae2c94) | 0) >>> 0)) | 0; // 8e757d: mov eax, dword ptr [0xae2c94]
        R.m.w32(((R.esp + 0x4c) | 0) >>> 0, (R.edx >>> 0)); // 8e7582: mov dword ptr [esp + 0x4c], edx
        R.m.w32(((R.esp + 0x50) | 0) >>> 0, (R.eax >>> 0)); // 8e7586: mov dword ptr [esp + 0x50], eax
        R.ebx = (R.m.u32(((R.esp + 0x280) | 0) >>> 0)) | 0; // 8e758a: mov ebx, dword ptr [esp + 0x280]
        R.m.w32(((R.esp + 0x264) | 0) >>> 0, 0x3); // 8e7591: mov dword ptr [esp + 0x264], 3
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 8e759c: test ebx, ebx
        if (R.zf) { pc = 0x8e7616; continue; } // 8e759e: je 0x8e7616
        pc = 0x8e75a0; continue;
      case 0x8e75a0:
        R.sub(R.m.u32(((R.ebx) | 0) >>> 0), 0x0, 32); // 8e75a0: cmp dword ptr [ebx], 0
        if (R.zf) { pc = 0x8e7616; continue; } // 8e75a3: je 0x8e7616
        pc = 0x8e75a5; continue;
      case 0x8e75a5:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.ebp + 0x3d) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e75a5: mov cl, byte ptr [ebp + 0x3d]
        R.push((R.ecx >>> 0)); // 8e75a8: push ecx
        R.call(0x53b620, { n: 1, thisEcx: false, calleeClean: false }); // 8e75a9: call 0x53b620
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8e75ae: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e75b1: test eax, eax
        if (R.zf) { pc = 0x8e7616; continue; } // 8e75b3: je 0x8e7616
        pc = 0x8e75b5; continue;
      case 0x8e75b5:
        R.edi = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 8e75b5: mov edi, dword ptr [esp + 0x34]
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 8e75b9: test edi, edi
        if (R.zf) { pc = 0x8e7616; continue; } // 8e75bb: je 0x8e7616
        pc = 0x8e75bd; continue;
      case 0x8e75bd:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.esi + 0x30) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e75bd: mov dl, byte ptr [esi + 0x30]
        R.eax = (((R.edi + 0x2d) | 0)) | 0; // 8e75c0: lea eax, [edi + 0x2d]
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) & 0xf3, 8)) & 0xff) << 0)) | 0; // 8e75c3: and dl, 0xf3
        R.ecx = (((R.esp + 0x24) | 0)) | 0; // 8e75c6: lea ecx, [esp + 0x24]
        R.push((R.eax >>> 0)); // 8e75ca: push eax
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) | 0x3, 8)) & 0xff) << 0)) | 0; // 8e75cb: or dl, 3
        R.push((R.ecx >>> 0)); // 8e75ce: push ecx
        R.ecx = (((R.esp + 0x54) | 0)) | 0; // 8e75cf: lea ecx, [esp + 0x54]
        R.m.w8(((R.esi + 0x30) | 0) >>> 0, ((R.edx >>> 0) & 0xff)); // 8e75d3: mov byte ptr [esi + 0x30], dl
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 8e75d6: call 0x417c10
        R.edx = (R.m.u32(((R.esp + 0x270) | 0) >>> 0)) | 0; // 8e75db: mov edx, dword ptr [esp + 0x270]
        R.push(0x0); // 8e75e2: push 0
        R.push(0x0); // 8e75e4: push 0
        R.push((R.edx >>> 0)); // 8e75e6: push edx
        R.ecx = ((R.edi >>> 0)) | 0; // 8e75e7: mov ecx, edi
        R.call(0x868210, { n: 3, thisEcx: true, calleeClean: true }); // 8e75e9: call 0x868210
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e75ee: test eax, eax
        if (!R.zf) { pc = 0x8e7616; continue; } // 8e75f0: jne 0x8e7616
        pc = 0x8e75f2; continue;
      case 0x8e75f2:
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 8e75f2: mov ecx, dword ptr [0xde1f54]
        R.push((R.eax >>> 0)); // 8e75f8: push eax
        R.eax = (R.m.u32(((R.esp + 0x274) | 0) >>> 0)) | 0; // 8e75f9: mov eax, dword ptr [esp + 0x274]
        R.push((R.eax >>> 0)); // 8e7600: push eax
        R.push((R.ebp >>> 0)); // 8e7601: push ebp
        R.call(0x8d0780, { n: 3, thisEcx: false, calleeClean: true }); // 8e7602: call 0x8d0780
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esi + 0x30) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e7607: mov cl, byte ptr [esi + 0x30]
        R.m.w32(((R.esi + 0x1b) | 0) >>> 0, (R.eax >>> 0)); // 8e760a: mov dword ptr [esi + 0x1b], eax
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0xf5, 8)) & 0xff) << 0)) | 0; // 8e760d: and cl, 0xf5
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) | 0x5, 8)) & 0xff) << 0)) | 0; // 8e7610: or cl, 5
        R.m.w8(((R.esi + 0x30) | 0) >>> 0, ((R.ecx >>> 0) & 0xff)); // 8e7613: mov byte ptr [esi + 0x30], cl
        pc = 0x8e7616; continue;
      case 0x8e7616:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8e7616: mov ecx, dword ptr [0xae1050]
        R.push((R.ebp >>> 0)); // 8e761c: push ebp
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 8e761d: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e7622: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 8e7624: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x8e764e; continue; } // 8e7629: je 0x8e764e
        pc = 0x8e762b; continue;
      case 0x8e762b:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x35) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e762b: mov dl, byte ptr [eax + 0x35]
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) & 0x3f, 8)) & 0xff) << 0)) | 0; // 8e762e: and dl, 0x3f
        R.sub(((R.edx >>> 0) & 0xff), 0x5, 8); // 8e7631: cmp dl, 5
        if (R.zf) { pc = 0x8e764e; continue; } // 8e7634: je 0x8e764e
        pc = 0x8e7636; continue;
      case 0x8e7636:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 8e7636: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 8e7639: mov edx, dword ptr [0xae23b4]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 8e763f: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 8e7642: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 8e7645: add ecx, eax
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8e7647: add edx, eax
        R.eax = (((R.edx + R.ecx * 4) | 0)) | 0; // 8e7649: lea eax, [edx + ecx*4]
        pc = 0x8e7650; continue; // 8e764c: jmp 0x8e7650
      case 0x8e764e:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8e764e: xor eax, eax
        pc = 0x8e7650; continue;
      case 0x8e7650:
        R.ecx = (((R.esp + 0x4a) | 0)) | 0; // 8e7650: lea ecx, [esp + 0x4a]
        R.edx = (((R.esp + 0x4c) | 0)) | 0; // 8e7654: lea edx, [esp + 0x4c]
        R.push((R.ecx >>> 0)); // 8e7658: push ecx
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 8e7659: mov ecx, dword ptr [0xde1f54]
        R.push(0x1); // 8e765f: push 1
        R.push((R.eax >>> 0)); // 8e7661: push eax
        R.eax = (R.m.u32(((R.esp + 0x27c) | 0) >>> 0)) | 0; // 8e7662: mov eax, dword ptr [esp + 0x27c]
        R.push((R.ebp >>> 0)); // 8e7669: push ebp
        R.push((R.edx >>> 0)); // 8e766a: push edx
        R.push((R.eax >>> 0)); // 8e766b: push eax
        R.call(0x8ced40, { n: 6, thisEcx: true, calleeClean: true }); // 8e766c: call 0x8ced40
        R.edi = ((R.eax >>> 0)) | 0; // 8e7671: mov edi, eax
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 8e7673: test edi, edi
        if (!R.zf) { pc = 0x8e76a1; continue; } // 8e7675: jne 0x8e76a1
        pc = 0x8e7677; continue;
      case 0x8e7677:
        R.sub(R.m.u16(((R.esp + 0x4a) | 0) >>> 0), 0x9, 16); // 8e7677: cmp word ptr [esp + 0x4a], 9
        if (R.zf) { pc = 0x8e76a1; continue; } // 8e767d: je 0x8e76a1
        pc = 0x8e767f; continue;
      case 0x8e767f:
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 8e767f: test ebx, ebx
        if (R.zf) { pc = 0x8e77bd; continue; } // 8e7681: je 0x8e77bd
        pc = 0x8e7687; continue;
      case 0x8e7687:
        R.eax = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 8e7687: mov eax, dword ptr [ebx]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e7689: test eax, eax
        if (R.zf) { pc = 0x8e7696; continue; } // 8e768b: je 0x8e7696
        pc = 0x8e768d; continue;
      case 0x8e768d:
        R.push((R.eax >>> 0)); // 8e768d: push eax
        R.call(0x944c94, { n: 1, thisEcx: false, calleeClean: false }); // 8e768e: call 0x944c94
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8e7693: add esp, 4
        pc = 0x8e7696; continue;
      case 0x8e7696:
        R.m.w32(((R.ebx) | 0) >>> 0, 0x0); // 8e7696: mov dword ptr [ebx], 0
        pc = 0x8e77bd; continue; // 8e769c: jmp 0x8e77bd
      case 0x8e76a1:
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 8e76a1: test ebx, ebx
        if (R.zf) { pc = 0x8e76aa; continue; } // 8e76a3: je 0x8e76aa
        pc = 0x8e76a5; continue;
      case 0x8e76a5:
        R.sub(R.m.u32(((R.ebx) | 0) >>> 0), 0x0, 32); // 8e76a5: cmp dword ptr [ebx], 0
        if (!R.zf) { pc = 0x8e76c5; continue; } // 8e76a8: jne 0x8e76c5
        pc = 0x8e76aa; continue;
      case 0x8e76aa:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.ebp + 0x3d) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e76aa: mov cl, byte ptr [ebp + 0x3d]
        R.push((R.ecx >>> 0)); // 8e76ad: push ecx
        R.call(0x53b620, { n: 1, thisEcx: false, calleeClean: false }); // 8e76ae: call 0x53b620
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8e76b3: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e76b6: test eax, eax
        if (R.zf) { pc = 0x8e76c5; continue; } // 8e76b8: je 0x8e76c5
        pc = 0x8e76ba; continue;
      case 0x8e76ba:
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 8e76ba: test edi, edi
        if (R.zf) { pc = 0x8e76c5; continue; } // 8e76bc: je 0x8e76c5
        pc = 0x8e76be; continue;
      case 0x8e76be:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x30) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e76be: mov al, byte ptr [esi + 0x30]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 8e76c1: and al, 0xf0
        pc = 0x8e76ee; continue; // 8e76c3: jmp 0x8e76ee
      case 0x8e76c5:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.ebp + 0x3d) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e76c5: mov dl, byte ptr [ebp + 0x3d]
        R.push((R.edx >>> 0)); // 8e76c8: push edx
        R.call(0x53b620, { n: 1, thisEcx: false, calleeClean: false }); // 8e76c9: call 0x53b620
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8e76ce: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e76d1: test eax, eax
        if (R.zf) { pc = 0x8e76f1; continue; } // 8e76d3: je 0x8e76f1
        pc = 0x8e76d5; continue;
      case 0x8e76d5:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x30) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e76d5: mov al, byte ptr [esi + 0x30]
        R.ecx = ((R.ecx & 0xffffff00) | (((((R.eax >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 8e76d8: mov cl, al
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0xf, 8)) & 0xff) << 0)) | 0; // 8e76da: and cl, 0xf
        if (!R.zf) { pc = 0x8e76e5; continue; } // 8e76dd: jne 0x8e76e5
        pc = 0x8e76df; continue;
      case 0x8e76df:
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf1, 8)) & 0xff) << 0)) | 0; // 8e76df: and al, 0xf1
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) | 0x1, 8)) & 0xff) << 0)) | 0; // 8e76e1: or al, 1
        pc = 0x8e76ee; continue; // 8e76e3: jmp 0x8e76ee
      case 0x8e76e5:
        R.sub(((R.ecx >>> 0) & 0xff), 0x3, 8); // 8e76e5: cmp cl, 3
        if (!R.zf) { pc = 0x8e76f1; continue; } // 8e76e8: jne 0x8e76f1
        pc = 0x8e76ea; continue;
      case 0x8e76ea:
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf4, 8)) & 0xff) << 0)) | 0; // 8e76ea: and al, 0xf4
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) | 0x4, 8)) & 0xff) << 0)) | 0; // 8e76ec: or al, 4
        pc = 0x8e76ee; continue;
      case 0x8e76ee:
        R.m.w8(((R.esi + 0x30) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 8e76ee: mov byte ptr [esi + 0x30], al
        pc = 0x8e76f1; continue;
      case 0x8e76f1:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8e76f1: mov ecx, dword ptr [0xae1050]
        R.push((R.ebp >>> 0)); // 8e76f7: push ebp
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 8e76f8: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e76fd: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 8e76ff: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x8e772b; continue; } // 8e7704: je 0x8e772b
        pc = 0x8e7706; continue;
      case 0x8e7706:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + 0x35) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e7706: mov cl, byte ptr [eax + 0x35]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0x3f, 8)) & 0xff) << 0)) | 0; // 8e7709: and cl, 0x3f
        R.sub(((R.ecx >>> 0) & 0xff), 0x5, 8); // 8e770c: cmp cl, 5
        if (R.zf) { pc = 0x8e772b; continue; } // 8e770f: je 0x8e772b
        pc = 0x8e7711; continue;
      case 0x8e7711:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 8e7711: mov eax, dword ptr [eax + 4]
        R.ecx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 8e7714: mov ecx, dword ptr [0xae23b4]
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 8e771a: add ecx, eax
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 8e771c: lea edx, [eax + eax*8]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 8e771f: shl edx, 4
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8e7722: add edx, eax
        R.eax = (((R.ecx + R.edx * 4) | 0)) | 0; // 8e7724: lea eax, [ecx + edx*4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e7727: test eax, eax
        if (!R.zf) { pc = 0x8e772f; continue; } // 8e7729: jne 0x8e772f
        pc = 0x8e772b; continue;
      case 0x8e772b:
        R.m.w8(((R.esi + 0x2f) | 0) >>> 0, 0x1); // 8e772b: mov byte ptr [esi + 0x2f], 1
        pc = 0x8e772f; continue;
      case 0x8e772f:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x2f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e772f: mov al, byte ptr [esi + 0x2f]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 8e7732: test al, al
        if (R.zf) { pc = 0x8e775a; continue; } // 8e7734: je 0x8e775a
        pc = 0x8e7736; continue;
      case 0x8e7736:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.esi + 0x30) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e7736: mov dl, byte ptr [esi + 0x30]
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) & 0xf, 8)) & 0xff) << 0)) | 0; // 8e7739: and dl, 0xf
        R.sub(((R.edx >>> 0) & 0xff), 0x5, 8); // 8e773c: cmp dl, 5
        if (R.zf) { pc = 0x8e775a; continue; } // 8e773f: je 0x8e775a
        pc = 0x8e7741; continue;
      case 0x8e7741:
        R.eax = (R.m.u32(((R.esp + 0x270) | 0) >>> 0)) | 0; // 8e7741: mov eax, dword ptr [esp + 0x270]
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 8e7748: mov ecx, dword ptr [0xde1f54]
        R.push(0x1); // 8e774e: push 1
        R.push((R.eax >>> 0)); // 8e7750: push eax
        R.push((R.ebp >>> 0)); // 8e7751: push ebp
        R.call(0x8d0780, { n: 3, thisEcx: false, calleeClean: true }); // 8e7752: call 0x8d0780
        R.m.w32(((R.esi + 0x1b) | 0) >>> 0, (R.eax >>> 0)); // 8e7757: mov dword ptr [esi + 0x1b], eax
        pc = 0x8e775a; continue;
      case 0x8e775a:
        R.eax = (0x1) | 0; // 8e775a: mov eax, 1
        pc = 0x8e77bf; continue; // 8e775f: jmp 0x8e77bf
      case 0x8e7761:
        R.ecx = (((R.esp + 0x5c) | 0)) | 0; // 8e7761: lea ecx, [esp + 0x5c]
        R.edx = (((R.esp + 0x15c) | 0)) | 0; // 8e7765: lea edx, [esp + 0x15c]
        R.push((R.ecx >>> 0)); // 8e776c: push ecx
        R.push((R.edx >>> 0)); // 8e776d: push edx
        R.push((R.edi >>> 0)); // 8e776e: push edi
        R.push((R.edi >>> 0)); // 8e776f: push edi
        R.push(0xa9e318); // 8e7770: push 0xa9e318
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 8e7775: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8e777a: add esp, 0x14
        R.eax = (((R.esp + 0x5c) | 0)) | 0; // 8e777d: lea eax, [esp + 0x5c]
        R.ecx = (((R.esp + 0x15c) | 0)) | 0; // 8e7781: lea ecx, [esp + 0x15c]
        R.push(0x154); // 8e7788: push 0x154
        R.push((R.eax >>> 0)); // 8e778d: push eax
        R.push((R.ecx >>> 0)); // 8e778e: push ecx
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 8e778f: call 0x90d130
        R.push((R.eax >>> 0)); // 8e7794: push eax
        R.push(0x9870e8); // 8e7795: push 0x9870e8
        R.push(0xae24d0); // 8e779a: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 8e779f: call 0x944c9f
        R.push((R.edi >>> 0)); // 8e77a4: push edi
        R.push(0xae24d0); // 8e77a5: push 0xae24d0
        R.push(0x9870e0); // 8e77aa: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 8e77af: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 8e77b4: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, (R.edi >>> 0)); // 8e77b7: mov dword ptr [0xb67a34], edi
        pc = 0x8e77bd; continue;
      case 0x8e77bd:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8e77bd: xor eax, eax
        pc = 0x8e77bf; continue;
      case 0x8e77bf:
        R.ecx = (R.m.u32(((R.esp + 0x25c) | 0) >>> 0)) | 0; // 8e77bf: mov ecx, dword ptr [esp + 0x25c]
        R.edi = (R.pop()) | 0; // 8e77c6: pop edi
        R.esi = (R.pop()) | 0; // 8e77c7: pop esi
        R.ebp = (R.pop()) | 0; // 8e77c8: pop ebp
        R.ebx = (R.pop()) | 0; // 8e77c9: pop ebx
        /* fs */ // 8e77ca: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x258, 32)) | 0; // 8e77d1: add esp, 0x258
        return R.ret(6); // 8e77d7: ret 0x18
      default: throw new Error(`f_8e5d60: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
