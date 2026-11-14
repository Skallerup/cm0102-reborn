// 0x8cf0e0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 417c10=2tc, 4cf5a0=1c, 54a110=0t, 54c5b0=2tc, 8d0bb0=2c
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_8cf0e0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x8cf0e0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x8cf0e0:
        R.push(0xffffffff); // 8cf0e0: push -1
        R.push(0x963fa8); // 8cf0e2: push 0x963fa8
        R.eax = (0) | 0; // 8cf0e7: mov eax, dword ptr fs:[0]
        R.push((R.eax >>> 0)); // 8cf0ed: push eax
        /* fs */ // 8cf0ee: mov dword ptr fs:[0], esp
        R.esp = (R.sub((R.esp >>> 0), 0x34, 32)) | 0; // 8cf0f5: sub esp, 0x34
        R.push((R.ebx >>> 0)); // 8cf0f8: push ebx
        R.push((R.ebp >>> 0)); // 8cf0f9: push ebp
        R.push((R.esi >>> 0)); // 8cf0fa: push esi
        R.push((R.edi >>> 0)); // 8cf0fb: push edi
        R.edi = ((R.ecx >>> 0)) | 0; // 8cf0fc: mov edi, ecx
        R.esi = (R.logic((R.esi >>> 0) ^ (R.esi >>> 0), 32)) | 0; // 8cf0fe: xor esi, esi
        R.ecx = (((R.esp + 0x24) | 0)) | 0; // 8cf100: lea ecx, [esp + 0x24]
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.esi >>> 0)); // 8cf104: mov dword ptr [esp + 0x14], esi
        R.call(0x54a110, { n: 0, thisEcx: true, calleeClean: false }); // 8cf108: call 0x54a110
        R.eax = (((R.esp + 0x34) | 0)) | 0; // 8cf10d: lea eax, [esp + 0x34]
        R.push(0x16d); // 8cf111: push 0x16d
        R.push((R.eax >>> 0)); // 8cf116: push eax
        R.ecx = (0xae2c90) | 0; // 8cf117: mov ecx, 0xae2c90
        R.m.w32(((R.esp + 0x54) | 0) >>> 0, (R.esi >>> 0)); // 8cf11c: mov dword ptr [esp + 0x54], esi
        R.call(0x54c5b0, { n: 2, thisEcx: true, calleeClean: true }); // 8cf120: call 0x54c5b0
        R.ecx = (((R.esp + 0x2c) | 0)) | 0; // 8cf125: lea ecx, [esp + 0x2c]
        R.m.w8(((R.esp + 0x4c) | 0) >>> 0, 0x1); // 8cf129: mov byte ptr [esp + 0x4c], 1
        R.ebx = (R.logic((R.ebx >>> 0) ^ (R.ebx >>> 0), 32)) | 0; // 8cf12e: xor ebx, ebx
        R.call(0x54a110, { n: 0, thisEcx: true, calleeClean: false }); // 8cf130: call 0x54a110
        R.ecx = (((R.esp + 0x1c) | 0)) | 0; // 8cf135: lea ecx, [esp + 0x1c]
        R.push(0xae2c90); // 8cf139: push 0xae2c90
        R.push((R.ecx >>> 0)); // 8cf13e: push ecx
        R.ecx = (R.m.u32(((R.esp + 0x60) | 0) >>> 0)) | 0; // 8cf13f: mov ecx, dword ptr [esp + 0x60]
        R.m.w8(((R.esp + 0x54) | 0) >>> 0, 0x2); // 8cf143: mov byte ptr [esp + 0x54], 2
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 8cf148: call 0x417c10
        R.ebp = (R.m.u32(((R.esp + 0x54) | 0) >>> 0)) | 0; // 8cf14d: mov ebp, dword ptr [esp + 0x54]
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.ebp + 0x30) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8cf151: mov dl, byte ptr [ebp + 0x30]
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) & 0xf, 8)) & 0xff) << 0)) | 0; // 8cf154: and dl, 0xf
        R.sub(((R.edx >>> 0) & 0xff), 0x4, 8); // 8cf157: cmp dl, 4
        if (!R.zf) { pc = 0x8cf1e2; continue; } // 8cf15a: jne 0x8cf1e2
        pc = 0x8cf160; continue;
      case 0x8cf160:
        R.eax = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 8cf160: mov eax, dword ptr [ebp + 0xc]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 8cf163: lea ecx, [eax + eax*4]
        R.eax = (((R.eax + R.ecx * 2) | 0)) | 0; // 8cf166: lea eax, [eax + ecx*2]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 8cf169: lea edx, [eax + eax*4]
        R.eax = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 8cf16c: mov eax, dword ptr [0xae23bc]
        R.ecx = (((R.eax + R.edx * 2) | 0)) | 0; // 8cf171: lea ecx, [eax + edx*2]
        R.push((R.ecx >>> 0)); // 8cf174: push ecx
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8cf175: mov ecx, dword ptr [0xae1050]
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 8cf17b: call 0x4cf5a0
        R.sub((R.eax >>> 0), (R.esi >>> 0), 32); // 8cf180: cmp eax, esi
        if (R.zf) { pc = 0x8cf1d6; continue; } // 8cf182: je 0x8cf1d6
        pc = 0x8cf184; continue;
      case 0x8cf184:
        R.eax = (R.add((R.eax >>> 0), 0x2d, 32)) | 0; // 8cf184: add eax, 0x2d
        R.edx = (((R.esp + 0x1c) | 0)) | 0; // 8cf187: lea edx, [esp + 0x1c]
        R.push((R.eax >>> 0)); // 8cf18b: push eax
        R.push((R.edx >>> 0)); // 8cf18c: push edx
        R.ecx = (((R.esp + 0x34) | 0)) | 0; // 8cf18d: lea ecx, [esp + 0x34]
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 8cf191: call 0x417c10
        R.eax = (R.m.u32(((0xae2c90) | 0) >>> 0)) | 0; // 8cf196: mov eax, dword ptr [0xae2c90]
        R.ecx = (R.m.u32(((0xae2c94) | 0) >>> 0)) | 0; // 8cf19b: mov ecx, dword ptr [0xae2c94]
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.esp + 0x2e) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8cf1a1: mov dx, word ptr [esp + 0x2e]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 8cf1a6: mov dword ptr [esp + 0x1c], eax
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.ecx >>> 0)); // 8cf1aa: mov dword ptr [esp + 0x20], ecx
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.esp + 0x1e) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8cf1ae: mov cx, word ptr [esp + 0x1e]
        R.sub(((R.ecx >>> 0) & 0xffff), ((R.edx >>> 0) & 0xffff), 16); // 8cf1b3: cmp cx, dx
        if (!R.cBE) { pc = 0x8cf1ca; continue; } // 8cf1b6: ja 0x8cf1ca
        pc = 0x8cf1b8; continue;
      case 0x8cf1b8:
        if (R.cf) { pc = 0x8cf1f5; continue; } // 8cf1b8: jb 0x8cf1f5
        pc = 0x8cf1ba; continue;
      case 0x8cf1ba:
        R.edx = (R.logic((R.edx >>> 0) ^ (R.edx >>> 0), 32)) | 0; // 8cf1ba: xor edx, edx
        R.sub(((R.eax >>> 0) & 0xffff), R.m.u16(((R.esp + 0x2c) | 0) >>> 0), 16); // 8cf1bc: cmp ax, word ptr [esp + 0x2c]
        R.edx = ((R.edx & 0xffffff00) | (((!R.cLE ? 1 : 0) & 0xff) << 0)) | 0; // 8cf1c1: setg dl
        R.eax = ((R.edx >>> 0)) | 0; // 8cf1c4: mov eax, edx
        R.sub((R.eax >>> 0), (R.esi >>> 0), 32); // 8cf1c6: cmp eax, esi
        if (R.zf) { pc = 0x8cf1f5; continue; } // 8cf1c8: je 0x8cf1f5
        pc = 0x8cf1ca; continue;
      case 0x8cf1ca:
        R.eax = (((R.esp + 0x1c) | 0)) | 0; // 8cf1ca: lea eax, [esp + 0x1c]
        R.push(0xae2c90); // 8cf1ce: push 0xae2c90
        R.push((R.eax >>> 0)); // 8cf1d3: push eax
        pc = 0x8cf1ec; continue; // 8cf1d4: jmp 0x8cf1ec
      case 0x8cf1d6:
        R.ecx = (((R.esp + 0x1c) | 0)) | 0; // 8cf1d6: lea ecx, [esp + 0x1c]
        R.push(0xae2c90); // 8cf1da: push 0xae2c90
        R.push((R.ecx >>> 0)); // 8cf1df: push ecx
        pc = 0x8cf1ec; continue; // 8cf1e0: jmp 0x8cf1ec
      case 0x8cf1e2:
        R.edx = (((R.esp + 0x1c) | 0)) | 0; // 8cf1e2: lea edx, [esp + 0x1c]
        R.push(0xae2c90); // 8cf1e6: push 0xae2c90
        R.push((R.edx >>> 0)); // 8cf1eb: push edx
        pc = 0x8cf1ec; continue;
      case 0x8cf1ec:
        R.ecx = (((R.esp + 0x34) | 0)) | 0; // 8cf1ec: lea ecx, [esp + 0x34]
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 8cf1f0: call 0x417c10
        pc = 0x8cf1f5; continue;
      case 0x8cf1f5:
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 8cf1f5: mov eax, dword ptr [ebp + 8]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 8cf1f8: mov edx, dword ptr [0xae23b4]
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8cf1fe: add edx, eax
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 8cf200: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 8cf203: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 8cf206: add ecx, eax
        R.eax = (((R.edx + R.ecx * 4) | 0)) | 0; // 8cf208: lea eax, [edx + ecx*4]
        R.m.w32(((R.esp + 0x54) | 0) >>> 0, (R.eax >>> 0)); // 8cf20b: mov dword ptr [esp + 0x54], eax
        R.eax = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 8cf20f: mov eax, dword ptr [ebp + 0xc]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 8cf212: lea ecx, [eax + eax*4]
        R.eax = (((R.eax + R.ecx * 2) | 0)) | 0; // 8cf215: lea eax, [eax + ecx*2]
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8cf218: mov ecx, dword ptr [0xae1050]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 8cf21e: lea edx, [eax + eax*4]
        R.eax = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 8cf221: mov eax, dword ptr [0xae23bc]
        R.esi = (((R.eax + R.edx * 2) | 0)) | 0; // 8cf226: lea esi, [eax + edx*2]
        R.push((R.esi >>> 0)); // 8cf229: push esi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 8cf22a: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cf22f: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 8cf231: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x8cf25f; continue; } // 8cf236: je 0x8cf25f
        pc = 0x8cf238; continue;
      case 0x8cf238:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + 0x35) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8cf238: mov cl, byte ptr [eax + 0x35]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0x3f, 8)) & 0xff) << 0)) | 0; // 8cf23b: and cl, 0x3f
        R.sub(((R.ecx >>> 0) & 0xff), 0x5, 8); // 8cf23e: cmp cl, 5
        if (R.zf) { pc = 0x8cf25f; continue; } // 8cf241: je 0x8cf25f
        pc = 0x8cf243; continue;
      case 0x8cf243:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 8cf243: mov eax, dword ptr [eax + 4]
        R.ecx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 8cf246: mov ecx, dword ptr [0xae23b4]
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 8cf24c: lea edx, [eax + eax*8]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 8cf24f: shl edx, 4
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8cf252: add edx, eax
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 8cf254: add ecx, eax
        R.edx = (((R.ecx + R.edx * 4) | 0)) | 0; // 8cf256: lea edx, [ecx + edx*4]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 8cf259: mov dword ptr [esp + 0x1c], edx
        pc = 0x8cf267; continue; // 8cf25d: jmp 0x8cf267
      case 0x8cf25f:
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, 0x0); // 8cf25f: mov dword ptr [esp + 0x1c], 0
        pc = 0x8cf267; continue;
      case 0x8cf267:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebp + 0x30) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8cf267: mov al, byte ptr [ebp + 0x30]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf, 8)) & 0xff) << 0)) | 0; // 8cf26a: and al, 0xf
        R.sub(((R.eax >>> 0) & 0xff), 0x5, 8); // 8cf26c: cmp al, 5
        if (!R.zf) { pc = 0x8cf2e1; continue; } // 8cf26e: jne 0x8cf2e1
        pc = 0x8cf270; continue;
      case 0x8cf270:
        R.ecx = (R.m.u32(((R.esp + 0x58) | 0) >>> 0)) | 0; // 8cf270: mov ecx, dword ptr [esp + 0x58]
        R.push(0x0); // 8cf274: push 0
        R.push((R.ecx >>> 0)); // 8cf276: push ecx
        R.ecx = ((R.edi >>> 0)) | 0; // 8cf277: mov ecx, edi
        R.call(0x8d0bb0, { n: 2, thisEcx: false, calleeClean: true }); // 8cf279: call 0x8d0bb0
        R.esi = (R.m.u32(((R.esp + 0x54) | 0) >>> 0)) | 0; // 8cf27e: mov esi, dword ptr [esp + 0x54]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) ^ ((R.ecx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 8cf282: xor cl, cl
        R.eax = (((R.edi + 0x8ac) | 0)) | 0; // 8cf284: lea eax, [edi + 0x8ac]
        R.edx = (R.m.u32(((R.esi + 0x53) | 0) >>> 0)) | 0; // 8cf28a: mov edx, dword ptr [esi + 0x53]
        pc = 0x8cf28d; continue;
      case 0x8cf28d:
        R.edi = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8cf28d: mov edi, dword ptr [eax]
        R.sub(R.m.u32(((R.edi + 0xa) | 0) >>> 0), (R.edx >>> 0), 32); // 8cf28f: cmp dword ptr [edi + 0xa], edx
        if (R.zf) { pc = 0x8cf2b6; continue; } // 8cf292: je 0x8cf2b6
        pc = 0x8cf294; continue;
      case 0x8cf294:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.incdec(((R.ecx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 8cf294: inc cl
        R.eax = (R.add((R.eax >>> 0), 0x4, 32)) | 0; // 8cf296: add eax, 4
        R.sub(((R.ecx >>> 0) & 0xff), 0x1c, 8); // 8cf299: cmp cl, 0x1c
        if (R.cL) { pc = 0x8cf28d; continue; } // 8cf29c: jl 0x8cf28d
        pc = 0x8cf29e; continue;
      case 0x8cf29e:
        R.eax = ((R.eax & 0xffff0000) | (((((R.ebx >>> 0) & 0xffff)) & 0xffff) << 0)) | 0; // 8cf29e: mov ax, bx
        pc = 0x8cf2a1; continue;
      case 0x8cf2a1:
        R.ecx = (R.m.u32(((R.esp + 0x44) | 0) >>> 0)) | 0; // 8cf2a1: mov ecx, dword ptr [esp + 0x44]
        R.edi = (R.pop()) | 0; // 8cf2a5: pop edi
        R.esi = (R.pop()) | 0; // 8cf2a6: pop esi
        R.ebp = (R.pop()) | 0; // 8cf2a7: pop ebp
        R.ebx = (R.pop()) | 0; // 8cf2a8: pop ebx
        /* fs */ // 8cf2a9: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x40, 32)) | 0; // 8cf2b0: add esp, 0x40
        return R.ret(2); // 8cf2b3: ret 8
      case 0x8cf2b6:
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8cf2b6: mov eax, dword ptr [eax]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cf2b8: test eax, eax
        if (R.zf) { pc = 0x8cf29e; continue; } // 8cf2ba: je 0x8cf29e
        pc = 0x8cf2bc; continue;
      case 0x8cf2bc:
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8cf2bc: mov edx, dword ptr [eax]
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 8cf2be: lea ecx, [esp + 0x10]
        R.push((R.ecx >>> 0)); // 8cf2c2: push ecx
        R.ecx = (R.m.u32(((R.esp + 0x5c) | 0) >>> 0)) | 0; // 8cf2c3: mov ecx, dword ptr [esp + 0x5c]
        R.push((R.ecx >>> 0)); // 8cf2c7: push ecx
        R.push((R.esi >>> 0)); // 8cf2c8: push esi
        R.push((R.ebp >>> 0)); // 8cf2c9: push ebp
        R.ecx = ((R.eax >>> 0)) | 0; // 8cf2ca: mov ecx, eax
        R.callInd(R.m.u32(((R.edx + 0xc) | 0) >>> 0)); // 8cf2cc: call dword ptr [edx + 0xc]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cf2cf: test eax, eax
        if (!R.zf) { pc = 0x8cf29e; continue; } // 8cf2d1: jne 0x8cf29e
        pc = 0x8cf2d3; continue;
      case 0x8cf2d3:
        R.eax = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 8cf2d3: mov eax, dword ptr [esp + 0x10]
        R.sub(((R.eax >>> 0) & 0xffff), 0x9, 16); // 8cf2d7: cmp ax, 9
        if (R.zf) { pc = 0x8cf29e; continue; } // 8cf2db: je 0x8cf29e
        pc = 0x8cf2dd; continue;
      case 0x8cf2dd:
        R.ebx = ((R.eax >>> 0)) | 0; // 8cf2dd: mov ebx, eax
        pc = 0x8cf29e; continue; // 8cf2df: jmp 0x8cf29e
      case 0x8cf2e1:
        R.eax = (R.m.u32(((R.esi + 0x61) | 0) >>> 0)) | 0; // 8cf2e1: mov eax, dword ptr [esi + 0x61]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cf2e4: test eax, eax
        if (!R.zf) { pc = 0x8cf300; continue; } // 8cf2e6: jne 0x8cf300
        pc = 0x8cf2e8; continue;
      case 0x8cf2e8:
        R.ecx = (R.m.u32(((R.esp + 0x58) | 0) >>> 0)) | 0; // 8cf2e8: mov ecx, dword ptr [esp + 0x58]
        R.edx = (((R.esp + 0x1c) | 0)) | 0; // 8cf2ec: lea edx, [esp + 0x1c]
        R.push(0xae2c90); // 8cf2f0: push 0xae2c90
        R.push((R.edx >>> 0)); // 8cf2f5: push edx
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 8cf2f6: call 0x417c10
        R.eax = ((R.eax & 0xffff0000) | (((R.logic(((R.eax >>> 0) & 0xffff) ^ ((R.eax >>> 0) & 0xffff), 16)) & 0xffff) << 0)) | 0; // 8cf2fb: xor ax, ax
        pc = 0x8cf2a1; continue; // 8cf2fe: jmp 0x8cf2a1
      case 0x8cf300:
        R.eax = (R.m.u32(((R.esp + 0x54) | 0) >>> 0)) | 0; // 8cf300: mov eax, dword ptr [esp + 0x54]
        R.edx = (((R.edi + 0x8ac) | 0)) | 0; // 8cf304: lea edx, [edi + 0x8ac]
        R.ecx = ((R.edx >>> 0)) | 0; // 8cf30a: mov ecx, edx
        R.esi = (R.m.u32(((R.eax + 0x53) | 0) >>> 0)) | 0; // 8cf30c: mov esi, dword ptr [eax + 0x53]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 8cf30f: xor al, al
        pc = 0x8cf311; continue;
      case 0x8cf311:
        R.edi = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 8cf311: mov edi, dword ptr [ecx]
        R.sub(R.m.u32(((R.edi + 0xa) | 0) >>> 0), (R.esi >>> 0), 32); // 8cf313: cmp dword ptr [edi + 0xa], esi
        if (R.zf) { pc = 0x8cf34b; continue; } // 8cf316: je 0x8cf34b
        pc = 0x8cf318; continue;
      case 0x8cf318:
        R.eax = ((R.eax & 0xffffff00) | (((R.incdec(((R.eax >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 8cf318: inc al
        R.ecx = (R.add((R.ecx >>> 0), 0x4, 32)) | 0; // 8cf31a: add ecx, 4
        R.sub(((R.eax >>> 0) & 0xff), 0x1c, 8); // 8cf31d: cmp al, 0x1c
        if (R.cL) { pc = 0x8cf311; continue; } // 8cf31f: jl 0x8cf311
        pc = 0x8cf321; continue;
      case 0x8cf321:
        R.edi = (R.logic((R.edi >>> 0) ^ (R.edi >>> 0), 32)) | 0; // 8cf321: xor edi, edi
        pc = 0x8cf323; continue;
      case 0x8cf323:
        R.eax = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 8cf323: mov eax, dword ptr [esp + 0x1c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cf327: test eax, eax
        if (R.zf) { pc = 0x8cf35b; continue; } // 8cf329: je 0x8cf35b
        pc = 0x8cf32b; continue;
      case 0x8cf32b:
        R.ecx = (R.m.u32(((R.ebp + 0x4) | 0) >>> 0)) | 0; // 8cf32b: mov ecx, dword ptr [ebp + 4]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 8cf32e: test ecx, ecx
        if (R.zf) { pc = 0x8cf35b; continue; } // 8cf330: je 0x8cf35b
        pc = 0x8cf332; continue;
      case 0x8cf332:
        R.esi = (R.m.u32(((R.eax + 0x53) | 0) >>> 0)) | 0; // 8cf332: mov esi, dword ptr [eax + 0x53]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 8cf335: xor al, al
        R.ecx = ((R.edx >>> 0)) | 0; // 8cf337: mov ecx, edx
        pc = 0x8cf339; continue;
      case 0x8cf339:
        R.edx = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 8cf339: mov edx, dword ptr [ecx]
        R.sub(R.m.u32(((R.edx + 0xa) | 0) >>> 0), (R.esi >>> 0), 32); // 8cf33b: cmp dword ptr [edx + 0xa], esi
        if (R.zf) { pc = 0x8cf34f; continue; } // 8cf33e: je 0x8cf34f
        pc = 0x8cf340; continue;
      case 0x8cf340:
        R.eax = ((R.eax & 0xffffff00) | (((R.incdec(((R.eax >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 8cf340: inc al
        R.ecx = (R.add((R.ecx >>> 0), 0x4, 32)) | 0; // 8cf342: add ecx, 4
        R.sub(((R.eax >>> 0) & 0xff), 0x1c, 8); // 8cf345: cmp al, 0x1c
        if (R.cL) { pc = 0x8cf339; continue; } // 8cf347: jl 0x8cf339
        pc = 0x8cf349; continue;
      case 0x8cf349:
        pc = 0x8cf353; continue; // 8cf349: jmp 0x8cf353
      case 0x8cf34b:
        R.edi = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 8cf34b: mov edi, dword ptr [ecx]
        pc = 0x8cf323; continue; // 8cf34d: jmp 0x8cf323
      case 0x8cf34f:
        R.esi = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 8cf34f: mov esi, dword ptr [ecx]
        pc = 0x8cf35f; continue; // 8cf351: jmp 0x8cf35f
      case 0x8cf353:
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, 0x0); // 8cf353: mov dword ptr [esp + 0x14], 0
        pc = 0x8cf35b; continue;
      case 0x8cf35b:
        R.esi = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 8cf35b: mov esi, dword ptr [esp + 0x14]
        pc = 0x8cf35f; continue;
      case 0x8cf35f:
        R.eax = (((R.esp + 0x2c) | 0)) | 0; // 8cf35f: lea eax, [esp + 0x2c]
        R.ecx = (((R.esp + 0x14) | 0)) | 0; // 8cf363: lea ecx, [esp + 0x14]
        R.push((R.eax >>> 0)); // 8cf367: push eax
        R.push((R.ecx >>> 0)); // 8cf368: push ecx
        pc = 0x8cf369; continue;
      case 0x8cf369:
        R.ecx = (((R.esp + 0x2c) | 0)) | 0; // 8cf369: lea ecx, [esp + 0x2c]
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 8cf36d: call 0x417c10
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.esp + 0x36) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8cf372: mov ax, word ptr [esp + 0x36]
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.esp + 0x26) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8cf377: mov cx, word ptr [esp + 0x26]
        R.sub(((R.eax >>> 0) & 0xffff), ((R.ecx >>> 0) & 0xffff), 16); // 8cf37c: cmp ax, cx
        if (!R.cBE) { pc = 0x8cf39e; continue; } // 8cf37f: ja 0x8cf39e
        pc = 0x8cf381; continue;
      case 0x8cf381:
        if (R.cf) { pc = 0x8cf29e; continue; } // 8cf381: jb 0x8cf29e
        pc = 0x8cf387; continue;
      case 0x8cf387:
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.esp + 0x34) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8cf387: mov dx, word ptr [esp + 0x34]
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8cf38c: xor eax, eax
        R.sub(((R.edx >>> 0) & 0xffff), R.m.u16(((R.esp + 0x24) | 0) >>> 0), 16); // 8cf38e: cmp dx, word ptr [esp + 0x24]
        R.eax = ((R.eax & 0xffffff00) | (((!R.cLE ? 1 : 0) & 0xff) << 0)) | 0; // 8cf393: setg al
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cf396: test eax, eax
        if (R.zf) { pc = 0x8cf29e; continue; } // 8cf398: je 0x8cf29e
        pc = 0x8cf39e; continue;
      case 0x8cf39e:
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 8cf39e: test edi, edi
        if (R.zf) { pc = 0x8cf3e6; continue; } // 8cf3a0: je 0x8cf3e6
        pc = 0x8cf3a2; continue;
      case 0x8cf3a2:
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 8cf3a2: mov eax, dword ptr [edi]
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 8cf3a4: lea ecx, [esp + 0x10]
        R.push((R.ecx >>> 0)); // 8cf3a8: push ecx
        R.ecx = (R.m.u32(((R.esp + 0x58) | 0) >>> 0)) | 0; // 8cf3a9: mov ecx, dword ptr [esp + 0x58]
        R.edx = (((R.esp + 0x28) | 0)) | 0; // 8cf3ad: lea edx, [esp + 0x28]
        R.push((R.edx >>> 0)); // 8cf3b1: push edx
        R.push((R.ecx >>> 0)); // 8cf3b2: push ecx
        R.push((R.ebp >>> 0)); // 8cf3b3: push ebp
        R.ecx = ((R.edi >>> 0)) | 0; // 8cf3b4: mov ecx, edi
        R.callInd(R.m.u32(((R.eax + 0xc) | 0) >>> 0)); // 8cf3b6: call dword ptr [eax + 0xc]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cf3b9: test eax, eax
        if (!R.zf) { pc = 0x8cf3e6; continue; } // 8cf3bb: jne 0x8cf3e6
        pc = 0x8cf3bd; continue;
      case 0x8cf3bd:
        R.eax = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 8cf3bd: mov eax, dword ptr [esp + 0x10]
        R.sub(((R.eax >>> 0) & 0xffff), 0x9, 16); // 8cf3c1: cmp ax, 9
        if (R.zf) { pc = 0x8cf3ce; continue; } // 8cf3c5: je 0x8cf3ce
        pc = 0x8cf3c7; continue;
      case 0x8cf3c7:
        R.logic(((R.ebx >>> 0) & 0xffff) & ((R.ebx >>> 0) & 0xffff), 16); // 8cf3c7: test bx, bx
        if (!R.zf) { pc = 0x8cf3ce; continue; } // 8cf3ca: jne 0x8cf3ce
        pc = 0x8cf3cc; continue;
      case 0x8cf3cc:
        R.ebx = ((R.eax >>> 0)) | 0; // 8cf3cc: mov ebx, eax
        pc = 0x8cf3ce; continue;
      case 0x8cf3ce:
        R.sub(((R.ebx >>> 0) & 0xffff), 0x14, 16); // 8cf3ce: cmp bx, 0x14
        if (R.zf) { pc = 0x8cf3e6; continue; } // 8cf3d2: je 0x8cf3e6
        pc = 0x8cf3d4; continue;
      case 0x8cf3d4:
        R.sub(((R.ebx >>> 0) & 0xffff), 0x15, 16); // 8cf3d4: cmp bx, 0x15
        if (R.zf) { pc = 0x8cf3e6; continue; } // 8cf3d8: je 0x8cf3e6
        pc = 0x8cf3da; continue;
      case 0x8cf3da:
        R.sub(((R.ebx >>> 0) & 0xffff), 0x1f, 16); // 8cf3da: cmp bx, 0x1f
        if (R.zf) { pc = 0x8cf3e6; continue; } // 8cf3de: je 0x8cf3e6
        pc = 0x8cf3e0; continue;
      case 0x8cf3e0:
        R.sub(((R.ebx >>> 0) & 0xffff), 0x11, 16); // 8cf3e0: cmp bx, 0x11
        if (!R.zf) { pc = 0x8cf42e; continue; } // 8cf3e4: jne 0x8cf42e
        pc = 0x8cf3e6; continue;
      case 0x8cf3e6:
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8cf3e6: test esi, esi
        if (R.zf) { pc = 0x8cf449; continue; } // 8cf3e8: je 0x8cf449
        pc = 0x8cf3ea; continue;
      case 0x8cf3ea:
        R.edx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8cf3ea: mov edx, dword ptr [esi]
        R.eax = (((R.esp + 0x10) | 0)) | 0; // 8cf3ec: lea eax, [esp + 0x10]
        R.push((R.eax >>> 0)); // 8cf3f0: push eax
        R.eax = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 8cf3f1: mov eax, dword ptr [esp + 0x20]
        R.ecx = (((R.esp + 0x28) | 0)) | 0; // 8cf3f5: lea ecx, [esp + 0x28]
        R.push((R.ecx >>> 0)); // 8cf3f9: push ecx
        R.push((R.eax >>> 0)); // 8cf3fa: push eax
        R.push((R.ebp >>> 0)); // 8cf3fb: push ebp
        R.ecx = ((R.esi >>> 0)) | 0; // 8cf3fc: mov ecx, esi
        R.callInd(R.m.u32(((R.edx + 0xc) | 0) >>> 0)); // 8cf3fe: call dword ptr [edx + 0xc]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cf401: test eax, eax
        if (!R.zf) { pc = 0x8cf449; continue; } // 8cf403: jne 0x8cf449
        pc = 0x8cf405; continue;
      case 0x8cf405:
        R.eax = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 8cf405: mov eax, dword ptr [esp + 0x10]
        R.sub(((R.eax >>> 0) & 0xffff), 0x9, 16); // 8cf409: cmp ax, 9
        if (R.zf) { pc = 0x8cf416; continue; } // 8cf40d: je 0x8cf416
        pc = 0x8cf40f; continue;
      case 0x8cf40f:
        R.logic(((R.ebx >>> 0) & 0xffff) & ((R.ebx >>> 0) & 0xffff), 16); // 8cf40f: test bx, bx
        if (!R.zf) { pc = 0x8cf416; continue; } // 8cf412: jne 0x8cf416
        pc = 0x8cf414; continue;
      case 0x8cf414:
        R.ebx = ((R.eax >>> 0)) | 0; // 8cf414: mov ebx, eax
        pc = 0x8cf416; continue;
      case 0x8cf416:
        R.sub(((R.ebx >>> 0) & 0xffff), 0x14, 16); // 8cf416: cmp bx, 0x14
        if (R.zf) { pc = 0x8cf449; continue; } // 8cf41a: je 0x8cf449
        pc = 0x8cf41c; continue;
      case 0x8cf41c:
        R.sub(((R.ebx >>> 0) & 0xffff), 0x15, 16); // 8cf41c: cmp bx, 0x15
        if (R.zf) { pc = 0x8cf449; continue; } // 8cf420: je 0x8cf449
        pc = 0x8cf422; continue;
      case 0x8cf422:
        R.sub(((R.ebx >>> 0) & 0xffff), 0x1f, 16); // 8cf422: cmp bx, 0x1f
        if (R.zf) { pc = 0x8cf449; continue; } // 8cf426: je 0x8cf449
        pc = 0x8cf428; continue;
      case 0x8cf428:
        R.sub(((R.ebx >>> 0) & 0xffff), 0x11, 16); // 8cf428: cmp bx, 0x11
        if (R.zf) { pc = 0x8cf449; continue; } // 8cf42c: je 0x8cf449
        pc = 0x8cf42e; continue;
      case 0x8cf42e:
        R.ecx = (((R.esp + 0x14) | 0)) | 0; // 8cf42e: lea ecx, [esp + 0x14]
        R.push(0x1); // 8cf432: push 1
        R.push((R.ecx >>> 0)); // 8cf434: push ecx
        R.ecx = (((R.esp + 0x2c) | 0)) | 0; // 8cf435: lea ecx, [esp + 0x2c]
        R.call(0x54c5b0, { n: 2, thisEcx: true, calleeClean: true }); // 8cf439: call 0x54c5b0
        R.edx = (((R.esp + 0x3c) | 0)) | 0; // 8cf43e: lea edx, [esp + 0x3c]
        R.push((R.eax >>> 0)); // 8cf442: push eax
        R.push((R.edx >>> 0)); // 8cf443: push edx
        pc = 0x8cf369; continue; // 8cf444: jmp 0x8cf369
      case 0x8cf449:
        R.eax = (((R.esp + 0x24) | 0)) | 0; // 8cf449: lea eax, [esp + 0x24]
        R.ecx = (((R.esp + 0x3c) | 0)) | 0; // 8cf44d: lea ecx, [esp + 0x3c]
        R.push((R.eax >>> 0)); // 8cf451: push eax
        R.push((R.ecx >>> 0)); // 8cf452: push ecx
        R.ecx = (R.m.u32(((R.esp + 0x60) | 0) >>> 0)) | 0; // 8cf453: mov ecx, dword ptr [esp + 0x60]
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 8cf457: call 0x417c10
        R.eax = ((R.eax & 0xffff0000) | (((R.logic(((R.eax >>> 0) & 0xffff) ^ ((R.eax >>> 0) & 0xffff), 16)) & 0xffff) << 0)) | 0; // 8cf45c: xor ax, ax
        pc = 0x8cf2a1; continue; // 8cf45f: jmp 0x8cf2a1
      default: throw new Error(`f_8cf0e0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
