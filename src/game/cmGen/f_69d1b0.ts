// 0x69d1b0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 53b900=1, 53d980=3, 5407e0=3, 547790=2, 5477d0=2, 547810=2, 547840=2, 549f70=4tc, 54a110=0t, 7c6830=4tc, 945ff0=0
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_69d1b0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x69d1b0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x69d1b0:
        R.eax = (0) | 0; // 69d1b0: mov eax, dword ptr fs:[0]
        R.push(0xffffffff); // 69d1b6: push -1
        R.push(0x95cd48); // 69d1b8: push 0x95cd48
        R.push((R.eax >>> 0)); // 69d1bd: push eax
        /* fs */ // 69d1be: mov dword ptr fs:[0], esp
        R.esp = (R.sub((R.esp >>> 0), 0x8c, 32)) | 0; // 69d1c5: sub esp, 0x8c
        R.push((R.ebx >>> 0)); // 69d1cb: push ebx
        R.push((R.ebp >>> 0)); // 69d1cc: push ebp
        R.push((R.esi >>> 0)); // 69d1cd: push esi
        R.esi = (R.m.u32(((R.esp + 0xa8) | 0) >>> 0)) | 0; // 69d1ce: mov esi, dword ptr [esp + 0xa8]
        R.push((R.edi >>> 0)); // 69d1d5: push edi
        R.eax = (R.m.u32(((R.esi + 0x69) | 0) >>> 0)) | 0; // 69d1d6: mov eax, dword ptr [esi + 0x69]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69d1d9: test eax, eax
        if (R.zf) { pc = 0x69d5fc; continue; } // 69d1db: je 0x69d5fc
        pc = 0x69d1e1; continue;
      case 0x69d1e1:
        R.ebp = (R.m.u32(((R.esp + 0xb4) | 0) >>> 0)) | 0; // 69d1e1: mov ebp, dword ptr [esp + 0xb4]
        R.ebx = (R.m.u32(((R.esp + 0xb0) | 0) >>> 0)) | 0; // 69d1e8: mov ebx, dword ptr [esp + 0xb0]
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 69d1ef: test ebp, ebp
        if (R.zf) { pc = 0x69d1fa; continue; } // 69d1f1: je 0x69d1fa
        pc = 0x69d1f3; continue;
      case 0x69d1f3:
        R.eax = (R.m.u32(((R.ebp + 0x69) | 0) >>> 0)) | 0; // 69d1f3: mov eax, dword ptr [ebp + 0x69]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69d1f6: test eax, eax
        if (!R.zf) { pc = 0x69d21b; continue; } // 69d1f8: jne 0x69d21b
        pc = 0x69d1fa; continue;
      case 0x69d1fa:
        R.ebp = (R.m.u32(((R.ebx + 0xbf) | 0) >>> 0)) | 0; // 69d1fa: mov ebp, dword ptr [ebx + 0xbf]
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 69d200: test ebp, ebp
        R.m.w32(((R.esp + 0xb4) | 0) >>> 0, (R.ebp >>> 0)); // 69d202: mov dword ptr [esp + 0xb4], ebp
        if (R.zf) { pc = 0x69d212; continue; } // 69d209: je 0x69d212
        pc = 0x69d20b; continue;
      case 0x69d20b:
        R.eax = (R.m.u32(((R.ebp + 0x69) | 0) >>> 0)) | 0; // 69d20b: mov eax, dword ptr [ebp + 0x69]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69d20e: test eax, eax
        if (!R.zf) { pc = 0x69d21b; continue; } // 69d210: jne 0x69d21b
        pc = 0x69d212; continue;
      case 0x69d212:
        R.ebp = (R.logic((R.ebp >>> 0) ^ (R.ebp >>> 0), 32)) | 0; // 69d212: xor ebp, ebp
        R.m.w32(((R.esp + 0xb4) | 0) >>> 0, (R.ebp >>> 0)); // 69d214: mov dword ptr [esp + 0xb4], ebp
        pc = 0x69d21b; continue;
      case 0x69d21b:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x18) | 0) >>> 0)) & 0xff) << 0)) | 0; // 69d21b: mov al, byte ptr [esi + 0x18]
        R.m.w8(((R.esp + 0x1b) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 69d21e: mov byte ptr [esp + 0x1b], al
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x3d) | 0) >>> 0)) & 0xff) << 0)) | 0; // 69d222: mov al, byte ptr [esi + 0x3d]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 69d225: test al, al
        if (R.zf) { pc = 0x69d22f; continue; } // 69d227: je 0x69d22f
        pc = 0x69d229; continue;
      case 0x69d229:
        R.m.w8(((R.esp + 0x1a) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 69d229: mov byte ptr [esp + 0x1a], al
        pc = 0x69d23f; continue; // 69d22d: jmp 0x69d23f
      case 0x69d22f:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x28) | 0) >>> 0)) & 0xff) << 0)) | 0; // 69d22f: mov al, byte ptr [esi + 0x28]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 69d232: test al, al
        R.m.w8(((R.esp + 0x1a) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 69d234: mov byte ptr [esp + 0x1a], al
        if (!R.zf) { pc = 0x69d23f; continue; } // 69d238: jne 0x69d23f
        pc = 0x69d23a; continue;
      case 0x69d23a:
        R.m.w8(((R.esp + 0x1a) | 0) >>> 0, 0xb); // 69d23a: mov byte ptr [esp + 0x1a], 0xb
        pc = 0x69d23f; continue;
      case 0x69d23f:
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 69d23f: test ebp, ebp
        if (R.zf) { pc = 0x69d25b; continue; } // 69d241: je 0x69d25b
        pc = 0x69d243; continue;
      case 0x69d243:
        R.push(0x1); // 69d243: push 1
        R.push((R.ebp >>> 0)); // 69d245: push ebp
        R.push((R.esi >>> 0)); // 69d246: push esi
        R.call(0x5407e0, { n: 3, thisEcx: false, calleeClean: false }); // 69d247: call 0x5407e0
        R.edi = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 69d24c: movsx edi, ax
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 69d24f: add esp, 0xc
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 69d252: mov dword ptr [esp + 0x14], edi
        pc = 0x69d2f7; continue; // 69d256: jmp 0x69d2f7
      case 0x69d25b:
        R.ecx = (((R.esp + 0x3c) | 0)) | 0; // 69d25b: lea ecx, [esp + 0x3c]
        R.call(0x54a110, { n: 0, thisEcx: true, calleeClean: false }); // 69d25f: call 0x54a110
        R.edi = (R.logic((R.edi >>> 0) ^ (R.edi >>> 0), 32)) | 0; // 69d264: xor edi, edi
        R.ecx = (((R.esp + 0x55) | 0)) | 0; // 69d266: lea ecx, [esp + 0x55]
        R.m.w32(((R.esp + 0xa4) | 0) >>> 0, (R.edi >>> 0)); // 69d26a: mov dword ptr [esp + 0xa4], edi
        R.call(0x54a110, { n: 0, thisEcx: true, calleeClean: false }); // 69d271: call 0x54a110
        R.ecx = (((R.esp + 0x5d) | 0)) | 0; // 69d276: lea ecx, [esp + 0x5d]
        R.m.w8(((R.esp + 0xa4) | 0) >>> 0, 0x1); // 69d27a: mov byte ptr [esp + 0xa4], 1
        R.call(0x54a110, { n: 0, thisEcx: true, calleeClean: false }); // 69d282: call 0x54a110
        R.ecx = (((R.esp + 0x6a) | 0)) | 0; // 69d287: lea ecx, [esp + 0x6a]
        R.m.w8(((R.esp + 0xa4) | 0) >>> 0, 0x2); // 69d28b: mov byte ptr [esp + 0xa4], 2
        R.call(0x54a110, { n: 0, thisEcx: true, calleeClean: false }); // 69d293: call 0x54a110
        R.ecx = (((R.esp + 0x72) | 0)) | 0; // 69d298: lea ecx, [esp + 0x72]
        R.m.w8(((R.esp + 0xa4) | 0) >>> 0, 0x3); // 69d29c: mov byte ptr [esp + 0xa4], 3
        R.call(0x54a110, { n: 0, thisEcx: true, calleeClean: false }); // 69d2a4: call 0x54a110
        R.ecx = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 69d2a9: mov ecx, dword ptr [ebx + 0x53]
        R.edx = (((R.esp + 0x2c) | 0)) | 0; // 69d2ac: lea edx, [esp + 0x2c]
        R.push(0x1); // 69d2b0: push 1
        R.push((R.edx >>> 0)); // 69d2b2: push edx
        R.push((R.esi >>> 0)); // 69d2b3: push esi
        R.m.w32(((R.esp + 0xb0) | 0) >>> 0, 0x4); // 69d2b4: mov dword ptr [esp + 0xb0], 4
        R.m.w32(((R.esp + 0x52) | 0) >>> 0, (R.ecx >>> 0)); // 69d2bf: mov dword ptr [esp + 0x52], ecx
        R.m.w32(((R.esp + 0xa1) | 0) >>> 0, (R.edi >>> 0)); // 69d2c3: mov dword ptr [esp + 0xa1], edi
        R.m.w32(((R.esp + 0x99) | 0) >>> 0, (R.edi >>> 0)); // 69d2ca: mov dword ptr [esp + 0x99], edi
        R.m.w32(((R.esp + 0x56) | 0) >>> 0, (R.edi >>> 0)); // 69d2d1: mov dword ptr [esp + 0x56], edi
        R.m.w32(((R.esp + 0x71) | 0) >>> 0, (R.ebx >>> 0)); // 69d2d5: mov dword ptr [esp + 0x71], ebx
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 69d2d9: mov dword ptr [esp + 0x38], edi
        R.call(0x5407e0, { n: 3, thisEcx: false, calleeClean: false }); // 69d2dd: call 0x5407e0
        R.edi = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 69d2e2: movsx edi, ax
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 69d2e5: add esp, 0xc
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 69d2e8: mov dword ptr [esp + 0x14], edi
        R.m.w32(((R.esp + 0xa4) | 0) >>> 0, 0xffffffff); // 69d2ec: mov dword ptr [esp + 0xa4], 0xffffffff
        pc = 0x69d2f7; continue;
      case 0x69d2f7:
        R.eax = (R.m.u32(((R.esi + 0x69) | 0) >>> 0)) | 0; // 69d2f7: mov eax, dword ptr [esi + 0x69]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69d2fa: test eax, eax
        if (R.zf) { pc = 0x69d33e; continue; } // 69d2fc: je 0x69d33e
        pc = 0x69d2fe; continue;
      case 0x69d2fe:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esp + 0x1a) | 0) >>> 0)) & 0xff) << 0)) | 0; // 69d2fe: mov cl, byte ptr [esp + 0x1a]
        R.sub(((R.ecx >>> 0) & 0xff), 0xc, 8); // 69d302: cmp cl, 0xc
        if (R.zf) { pc = 0x69d30c; continue; } // 69d305: je 0x69d30c
        pc = 0x69d307; continue;
      case 0x69d307:
        R.sub(((R.ecx >>> 0) & 0xff), 0x5, 8); // 69d307: cmp cl, 5
        if (!R.zf) { pc = 0x69d33e; continue; } // 69d30a: jne 0x69d33e
        pc = 0x69d30c; continue;
      case 0x69d30c:
        R.sub(R.m.u16(((R.ebx + 0x80) | 0) >>> 0), 0x109a, 16); // 69d30c: cmp word ptr [ebx + 0x80], 0x109a
        if (R.cLE) { pc = 0x69d33e; continue; } // 69d315: jle 0x69d33e
        pc = 0x69d317; continue;
      case 0x69d317:
        R.ecx = (((R.m.u16(((R.eax + 0x4) | 0) >>> 0)) << 16 >> 16)) | 0; // 69d317: movsx ecx, word ptr [eax + 4]
        R.sub(R.m.u16(((R.eax + 0xc) | 0) >>> 0), 0xcb2, 16); // 69d31b: cmp word ptr [eax + 0xc], 0xcb2
        R.ecx = (((R.ecx + R.ecx * 4) | 0)) | 0; // 69d321: lea ecx, [ecx + ecx*4]
        R.edx = (((R.ecx + R.edi) | 0)) | 0; // 69d324: lea edx, [ecx + edi]
        R.edi = (((R.edx + R.ecx * 4) | 0)) | 0; // 69d327: lea edi, [edx + ecx*4]
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 69d32a: mov dword ptr [esp + 0x14], edi
        if (R.cLE) { pc = 0x69d33e; continue; } // 69d32e: jle 0x69d33e
        pc = 0x69d330; continue;
      case 0x69d330:
        R.eax = (((R.m.u16(((R.eax + 0x6) | 0) >>> 0)) << 16 >> 16)) | 0; // 69d330: movsx eax, word ptr [eax + 6]
        R.ecx = (((R.eax + R.edi) | 0)) | 0; // 69d334: lea ecx, [eax + edi]
        R.edi = (((R.ecx + R.eax * 4) | 0)) | 0; // 69d337: lea edi, [ecx + eax*4]
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 69d33a: mov dword ptr [esp + 0x14], edi
        pc = 0x69d33e; continue;
      case 0x69d33e:
        R.sub(R.m.u32(((R.esi + 0x39) | 0) >>> 0), (R.ebx >>> 0), 32); // 69d33e: cmp dword ptr [esi + 0x39], ebx
        if (!R.zf) { pc = 0x69d366; continue; } // 69d341: jne 0x69d366
        pc = 0x69d343; continue;
      case 0x69d343:
        R.edx = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 69d343: mov edx, dword ptr [0xae2364]
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 69d349: mov eax, dword ptr [esi]
        R.edx = (R.add((R.edx >>> 0), 0xfffffff0, 32)) | 0; // 69d34b: add edx, -0x10
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 69d34e: cmp eax, edx
        if (R.cL) { pc = 0x69d357; continue; } // 69d350: jl 0x69d357
        pc = 0x69d352; continue;
      case 0x69d352:
        R.edi = (R.add((R.edi >>> 0), 0x64, 32)) | 0; // 69d352: add edi, 0x64
        pc = 0x69d362; continue; // 69d355: jmp 0x69d362
      case 0x69d357:
        R.eax = (((R.m.u8(((R.esi + 0x59) | 0) >>> 0)) << 24 >> 24)) | 0; // 69d357: movsx eax, byte ptr [esi + 0x59]
        R.ecx = ((R.eax >>> 0)) | 0; // 69d35b: mov ecx, eax
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 69d35d: imul ecx, eax
        R.edi = (R.add((R.edi >>> 0), (R.ecx >>> 0), 32)) | 0; // 69d360: add edi, ecx
        pc = 0x69d362; continue;
      case 0x69d362:
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 69d362: mov dword ptr [esp + 0x14], edi
        pc = 0x69d366; continue;
      case 0x69d366:
        R.push((R.ebx >>> 0)); // 69d366: push ebx
        R.push((R.esi >>> 0)); // 69d367: push esi
        R.call(0x547790, { n: 2, thisEcx: false, calleeClean: false }); // 69d368: call 0x547790
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 69d36d: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69d370: test eax, eax
        if (R.zf) { pc = 0x69d3a3; continue; } // 69d372: je 0x69d3a3
        pc = 0x69d374; continue;
      case 0x69d374:
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 69d374: fild dword ptr [esp + 0x14]
        R.m.wf64(((R.esp + 0x1c) | 0) >>> 0, R.st[0]); // 69d378: fst qword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 1.1; // 69d37c: fmul qword ptr [0x9689c0]
        R.fpush(R.f64(((R.esp + 0x1c) | 0))); // 69d382: fld qword ptr [esp + 0x1c]
        R.st[0] = R.st[0] + 2000.0; // 69d386: fadd qword ptr [0x9688f8]
        R.m.wf64(((R.esp + 0x1c) | 0) >>> 0, R.st[0]); R.fpop(); // 69d38c: fstp qword ptr [esp + 0x1c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x1c) | 0))); // 69d390: fcom qword ptr [esp + 0x1c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 69d394: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 69d396: test ah, 0x41
        if (R.zf) { pc = 0x69d3bb; continue; } // 69d399: je 0x69d3bb
        pc = 0x69d39b; continue;
      case 0x69d39b:
        R.fpop(); // 69d39b: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x1c) | 0))); // 69d39d: fld qword ptr [esp + 0x1c]
        pc = 0x69d3bb; continue; // 69d3a1: jmp 0x69d3bb
      case 0x69d3a3:
        R.push((R.ebx >>> 0)); // 69d3a3: push ebx
        R.push((R.esi >>> 0)); // 69d3a4: push esi
        R.call(0x5477d0, { n: 2, thisEcx: false, calleeClean: false }); // 69d3a5: call 0x5477d0
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 69d3aa: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69d3ad: test eax, eax
        if (R.zf) { pc = 0x69d3c6; continue; } // 69d3af: je 0x69d3c6
        pc = 0x69d3b1; continue;
      case 0x69d3b1:
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 69d3b1: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.25; // 69d3b5: fmul qword ptr [0x9689e0]
        pc = 0x69d3bb; continue;
      case 0x69d3bb:
        R.ftol(); // 69d3bb: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 69d3c0: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 69d3c2: mov dword ptr [esp + 0x14], edi
        pc = 0x69d3c6; continue;
      case 0x69d3c6:
        R.push((R.ebp >>> 0)); // 69d3c6: push ebp
        R.push((R.esi >>> 0)); // 69d3c7: push esi
        R.call(0x547810, { n: 2, thisEcx: false, calleeClean: false }); // 69d3c8: call 0x547810
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 69d3cd: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69d3d0: test eax, eax
        if (R.zf) { pc = 0x69d403; continue; } // 69d3d2: je 0x69d403
        pc = 0x69d3d4; continue;
      case 0x69d3d4:
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 69d3d4: fild dword ptr [esp + 0x14]
        R.m.wf64(((R.esp + 0x1c) | 0) >>> 0, R.st[0]); // 69d3d8: fst qword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 1.1; // 69d3dc: fmul qword ptr [0x9689c0]
        R.fpush(R.f64(((R.esp + 0x1c) | 0))); // 69d3e2: fld qword ptr [esp + 0x1c]
        R.st[0] = R.st[0] + 2000.0; // 69d3e6: fadd qword ptr [0x9688f8]
        R.m.wf64(((R.esp + 0x1c) | 0) >>> 0, R.st[0]); R.fpop(); // 69d3ec: fstp qword ptr [esp + 0x1c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x1c) | 0))); // 69d3f0: fcom qword ptr [esp + 0x1c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 69d3f4: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 69d3f6: test ah, 0x41
        if (R.zf) { pc = 0x69d41b; continue; } // 69d3f9: je 0x69d41b
        pc = 0x69d3fb; continue;
      case 0x69d3fb:
        R.fpop(); // 69d3fb: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x1c) | 0))); // 69d3fd: fld qword ptr [esp + 0x1c]
        pc = 0x69d41b; continue; // 69d401: jmp 0x69d41b
      case 0x69d403:
        R.push((R.ebp >>> 0)); // 69d403: push ebp
        R.push((R.esi >>> 0)); // 69d404: push esi
        R.call(0x547840, { n: 2, thisEcx: false, calleeClean: false }); // 69d405: call 0x547840
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 69d40a: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69d40d: test eax, eax
        if (R.zf) { pc = 0x69d426; continue; } // 69d40f: je 0x69d426
        pc = 0x69d411; continue;
      case 0x69d411:
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 69d411: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.25; // 69d415: fmul qword ptr [0x9689e0]
        pc = 0x69d41b; continue;
      case 0x69d41b:
        R.ftol(); // 69d41b: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 69d420: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 69d422: mov dword ptr [esp + 0x14], edi
        pc = 0x69d426; continue;
      case 0x69d426:
        R.eax = (((R.m.u8(((R.esp + 0xb8) | 0) >>> 0)) << 24 >> 24)) | 0; // 69d426: movsx eax, byte ptr [esp + 0xb8]
        R.eax = (R.add((R.eax >>> 0), 0xfffffffb, 32)) | 0; // 69d42e: add eax, -5
        R.sub((R.eax >>> 0), 0xa, 32); // 69d431: cmp eax, 0xa
        if (!R.cBE) { pc = 0x69d5fc; continue; } // 69d434: ja 0x69d5fc
        pc = 0x69d43a; continue;
      case 0x69d43a:
        pc = [0x69d441, 0x69db39, 0x69db39, 0x69deb6, 0x69e22d, 0x69e4e7, 0x69d5fc, 0x69d441, 0x69db39, 0x69db39, 0x69deb6][R.eax >>> 0]; continue; // 69d43a: jmp dword ptr [eax*4 + 0x69eaec]
      case 0x69d441:
        R.edx = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 69d441: mov edx, dword ptr [0xae2364]
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 69d447: mov eax, dword ptr [esi]
        R.edx = (R.add((R.edx >>> 0), 0xfffffff0, 32)) | 0; // 69d449: add edx, -0x10
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 69d44c: cmp eax, edx
        if (!R.cL) { pc = 0x69e5b9; continue; } // 69d44e: jge 0x69e5b9
        pc = 0x69d454; continue;
      case 0x69d454:
        R.eax = (((R.m.u8(((R.esp + 0x1a) | 0) >>> 0)) << 24 >> 24)) | 0; // 69d454: movsx eax, byte ptr [esp + 0x1a]
        R.eax = (R.add((R.eax >>> 0), 0xfffffffb, 32)) | 0; // 69d459: add eax, -5
        R.ebp = (0x1676) | 0; // 69d45c: mov ebp, 0x1676
        R.sub((R.eax >>> 0), 0xb, 32); // 69d461: cmp eax, 0xb
        if (!R.cBE) { pc = 0x69d63c; continue; } // 69d464: ja 0x69d63c
        pc = 0x69d46a; continue;
      case 0x69d46a:
        pc = [0x69d65a, 0x69d4da, 0x69d50b, 0x69d580, 0x69d61c, 0x69d63c, 0x69d5ca, 0x69d471, 0x69d4b6, 0x69d63c, 0x69d558, 0x69d48b][R.eax >>> 0]; continue; // 69d46a: jmp dword ptr [eax*4 + 0x69eb18]
      case 0x69d471:
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 69d471: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.95; // 69d475: fmul qword ptr [0x9689d0]
        R.ftol(); // 69d47b: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 69d480: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 69d482: mov dword ptr [esp + 0x14], edi
        pc = 0x69d65a; continue; // 69d486: jmp 0x69d65a
      case 0x69d48b:
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 69d48b: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.75; // 69d48f: fmul qword ptr [0x969040]
        R.ftol(); // 69d495: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 69d49a: mov edi, eax
        R.eax = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 69d49c: mov eax, dword ptr [esi + 0x39]
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 69d49f: cmp eax, ebx
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 69d4a1: mov dword ptr [esp + 0x14], edi
        if (R.zf) { pc = 0x69d65a; continue; } // 69d4a5: je 0x69d65a
        pc = 0x69d4ab; continue;
      case 0x69d4ab:
        R.sub(R.m.u32(((R.esi + 0x24) | 0) >>> 0), (R.ebx >>> 0), 32); // 69d4ab: cmp dword ptr [esi + 0x24], ebx
        if (R.zf) { pc = 0x69d65a; continue; } // 69d4ae: je 0x69d65a
        pc = 0x69d4b4; continue;
      case 0x69d4b4:
        pc = 0x69d4f9; continue; // 69d4b4: jmp 0x69d4f9
      case 0x69d4b6:
        R.sub(R.m.u32(((R.esi + 0x39) | 0) >>> 0), (R.ebx >>> 0), 32); // 69d4b6: cmp dword ptr [esi + 0x39], ebx
        if (R.zf) { pc = 0x69d4c0; continue; } // 69d4b9: je 0x69d4c0
        pc = 0x69d4bb; continue;
      case 0x69d4bb:
        R.sub(R.m.u32(((R.esi + 0x24) | 0) >>> 0), (R.ebx >>> 0), 32); // 69d4bb: cmp dword ptr [esi + 0x24], ebx
        if (!R.zf) { pc = 0x69d4e4; continue; } // 69d4be: jne 0x69d4e4
        pc = 0x69d4c0; continue;
      case 0x69d4c0:
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 69d4c0: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.75; // 69d4c4: fmul qword ptr [0x969040]
        R.ftol(); // 69d4ca: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 69d4cf: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 69d4d1: mov dword ptr [esp + 0x14], edi
        pc = 0x69d65a; continue; // 69d4d5: jmp 0x69d65a
      case 0x69d4da:
        R.sub(R.m.u32(((R.esi + 0x39) | 0) >>> 0), (R.ebx >>> 0), 32); // 69d4da: cmp dword ptr [esi + 0x39], ebx
        if (R.zf) { pc = 0x69d4c0; continue; } // 69d4dd: je 0x69d4c0
        pc = 0x69d4df; continue;
      case 0x69d4df:
        R.sub(R.m.u32(((R.esi + 0x24) | 0) >>> 0), (R.ebx >>> 0), 32); // 69d4df: cmp dword ptr [esi + 0x24], ebx
        if (R.zf) { pc = 0x69d4c0; continue; } // 69d4e2: je 0x69d4c0
        pc = 0x69d4e4; continue;
      case 0x69d4e4:
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 69d4e4: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.6; // 69d4e8: fmul qword ptr [0x968e48]
        R.ftol(); // 69d4ee: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 69d4f3: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 69d4f5: mov dword ptr [esp + 0x14], edi
        pc = 0x69d4f9; continue;
      case 0x69d4f9:
        R.sub(R.m.u16(((R.ebx + 0x80) | 0) >>> 0), ((R.ebp >>> 0) & 0xffff), 16); // 69d4f9: cmp word ptr [ebx + 0x80], bp
        if (R.cLE) { pc = 0x69d65a; continue; } // 69d500: jle 0x69d65a
        pc = 0x69d506; continue;
      case 0x69d506:
        pc = 0x69d5fc; continue; // 69d506: jmp 0x69d5fc
      case 0x69d50b:
        R.sub(R.m.u32(((R.esi + 0x39) | 0) >>> 0), (R.ebx >>> 0), 32); // 69d50b: cmp dword ptr [esi + 0x39], ebx
        if (R.zf) { pc = 0x69d53e; continue; } // 69d50e: je 0x69d53e
        pc = 0x69d510; continue;
      case 0x69d510:
        R.sub(R.m.u32(((R.esi + 0x24) | 0) >>> 0), (R.ebx >>> 0), 32); // 69d510: cmp dword ptr [esi + 0x24], ebx
        if (R.zf) { pc = 0x69d53e; continue; } // 69d513: je 0x69d53e
        pc = 0x69d515; continue;
      case 0x69d515:
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 69d515: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.3; // 69d519: fmul qword ptr [0x968e80]
        R.ftol(); // 69d51f: call 0x945640
        R.sub(R.m.u16(((R.ebx + 0x80) | 0) >>> 0), 0x1482, 16); // 69d524: cmp word ptr [ebx + 0x80], 0x1482
        R.edi = ((R.eax >>> 0)) | 0; // 69d52d: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 69d52f: mov dword ptr [esp + 0x14], edi
        if (R.cLE) { pc = 0x69d65a; continue; } // 69d533: jle 0x69d65a
        pc = 0x69d539; continue;
      case 0x69d539:
        pc = 0x69d5fc; continue; // 69d539: jmp 0x69d5fc
      case 0x69d53e:
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 69d53e: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.5; // 69d542: fmul qword ptr [0x968968]
        R.ftol(); // 69d548: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 69d54d: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 69d54f: mov dword ptr [esp + 0x14], edi
        pc = 0x69d65a; continue; // 69d553: jmp 0x69d65a
      case 0x69d558:
        R.sub(R.m.u32(((R.esi + 0x39) | 0) >>> 0), (R.ebx >>> 0), 32); // 69d558: cmp dword ptr [esi + 0x39], ebx
        if (R.zf) { pc = 0x69d5b0; continue; } // 69d55b: je 0x69d5b0
        pc = 0x69d55d; continue;
      case 0x69d55d:
        R.sub(R.m.u32(((R.esi + 0x24) | 0) >>> 0), (R.ebx >>> 0), 32); // 69d55d: cmp dword ptr [esi + 0x24], ebx
        if (R.zf) { pc = 0x69d5b0; continue; } // 69d560: je 0x69d5b0
        pc = 0x69d562; continue;
      case 0x69d562:
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 69d562: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.4; // 69d566: fmul qword ptr [0x968e00]
        R.ftol(); // 69d56c: call 0x945640
        R.sub(R.m.u16(((R.ebx + 0x80) | 0) >>> 0), ((R.ebp >>> 0) & 0xffff), 16); // 69d571: cmp word ptr [ebx + 0x80], bp
        R.edi = ((R.eax >>> 0)) | 0; // 69d578: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 69d57a: mov dword ptr [esp + 0x14], edi
        pc = 0x69d5a8; continue; // 69d57e: jmp 0x69d5a8
      case 0x69d580:
        R.sub(R.m.u32(((R.esi + 0x39) | 0) >>> 0), (R.ebx >>> 0), 32); // 69d580: cmp dword ptr [esi + 0x39], ebx
        if (R.zf) { pc = 0x69d5b0; continue; } // 69d583: je 0x69d5b0
        pc = 0x69d585; continue;
      case 0x69d585:
        R.sub(R.m.u32(((R.esi + 0x24) | 0) >>> 0), (R.ebx >>> 0), 32); // 69d585: cmp dword ptr [esi + 0x24], ebx
        if (R.zf) { pc = 0x69d5b0; continue; } // 69d588: je 0x69d5b0
        pc = 0x69d58a; continue;
      case 0x69d58a:
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 69d58a: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.475; // 69d58e: fmul qword ptr [0x96d270]
        R.ftol(); // 69d594: call 0x945640
        R.sub(R.m.u16(((R.ebx + 0x80) | 0) >>> 0), 0x1482, 16); // 69d599: cmp word ptr [ebx + 0x80], 0x1482
        R.edi = ((R.eax >>> 0)) | 0; // 69d5a2: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 69d5a4: mov dword ptr [esp + 0x14], edi
        pc = 0x69d5a8; continue;
      case 0x69d5a8:
        if (R.cLE) { pc = 0x69d65a; continue; } // 69d5a8: jle 0x69d65a
        pc = 0x69d5ae; continue;
      case 0x69d5ae:
        pc = 0x69d5fc; continue; // 69d5ae: jmp 0x69d5fc
      case 0x69d5b0:
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 69d5b0: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.6; // 69d5b4: fmul qword ptr [0x968e48]
        R.ftol(); // 69d5ba: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 69d5bf: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 69d5c1: mov dword ptr [esp + 0x14], edi
        pc = 0x69d65a; continue; // 69d5c5: jmp 0x69d65a
      case 0x69d5ca:
        R.sub(R.m.u32(((R.esi + 0x39) | 0) >>> 0), (R.ebx >>> 0), 32); // 69d5ca: cmp dword ptr [esi + 0x39], ebx
        if (R.zf) { pc = 0x69d471; continue; } // 69d5cd: je 0x69d471
        pc = 0x69d5d3; continue;
      case 0x69d5d3:
        R.sub(R.m.u32(((R.esi + 0x24) | 0) >>> 0), (R.ebx >>> 0), 32); // 69d5d3: cmp dword ptr [esi + 0x24], ebx
        if (R.zf) { pc = 0x69d471; continue; } // 69d5d6: je 0x69d471
        pc = 0x69d5dc; continue;
      case 0x69d5dc:
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 69d5dc: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.75; // 69d5e0: fmul qword ptr [0x969040]
        R.ftol(); // 69d5e6: call 0x945640
        R.sub(R.m.u16(((R.ebx + 0x80) | 0) >>> 0), 0x1482, 16); // 69d5eb: cmp word ptr [ebx + 0x80], 0x1482
        R.edi = ((R.eax >>> 0)) | 0; // 69d5f4: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 69d5f6: mov dword ptr [esp + 0x14], edi
        pc = 0x69d5fa; continue;
      case 0x69d5fa:
        if (R.cLE) { pc = 0x69d65a; continue; } // 69d5fa: jle 0x69d65a
        pc = 0x69d5fc; continue;
      case 0x69d5fc:
        R.eax = (0xffffd8f0) | 0; // 69d5fc: mov eax, 0xffffd8f0
        pc = 0x69d601; continue;
      case 0x69d601:
        R.ecx = (R.m.u32(((R.esp + 0x9c) | 0) >>> 0)) | 0; // 69d601: mov ecx, dword ptr [esp + 0x9c]
        R.edi = (R.pop()) | 0; // 69d608: pop edi
        R.esi = (R.pop()) | 0; // 69d609: pop esi
        R.ebp = (R.pop()) | 0; // 69d60a: pop ebp
        R.ebx = (R.pop()) | 0; // 69d60b: pop ebx
        /* fs */ // 69d60c: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x98, 32)) | 0; // 69d613: add esp, 0x98
        return R.ret(4); // 69d619: ret 0x10
      case 0x69d61c:
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 69d61c: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.2; // 69d620: fmul qword ptr [0x968918]
        R.ftol(); // 69d626: call 0x945640
        R.sub(R.m.u16(((R.ebx + 0x80) | 0) >>> 0), 0xcb2, 16); // 69d62b: cmp word ptr [ebx + 0x80], 0xcb2
        R.edi = ((R.eax >>> 0)) | 0; // 69d634: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 69d636: mov dword ptr [esp + 0x14], edi
        pc = 0x69d5fa; continue; // 69d63a: jmp 0x69d5fa
      case 0x69d63c:
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 69d63c: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.001; // 69d640: fmul qword ptr [0x96a350]
        R.ftol(); // 69d646: call 0x945640
        R.sub(R.m.u16(((R.ebx + 0x80) | 0) >>> 0), ((R.ebp >>> 0) & 0xffff), 16); // 69d64b: cmp word ptr [ebx + 0x80], bp
        R.edi = ((R.eax >>> 0)) | 0; // 69d652: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 69d654: mov dword ptr [esp + 0x14], edi
        if (!R.cLE) { pc = 0x69d5fc; continue; } // 69d658: jg 0x69d5fc
        pc = 0x69d65a; continue;
      case 0x69d65a:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x1b) | 0) >>> 0)) & 0xff) << 0)) | 0; // 69d65a: mov al, byte ptr [esp + 0x1b]
        R.ebp = (0x1b58) | 0; // 69d65e: mov ebp, 0x1b58
        R.sub(((R.eax >>> 0) & 0xff), 0x3b, 8); // 69d663: cmp al, 0x3b
        if (R.cLE) { pc = 0x69d6a8; continue; } // 69d665: jle 0x69d6a8
        pc = 0x69d667; continue;
      case 0x69d667:
        R.push((R.ebx >>> 0)); // 69d667: push ebx
        R.call(0x53b900, { n: 1, thisEcx: false, calleeClean: false }); // 69d668: call 0x53b900
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 69d66d: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69d670: test eax, eax
        if (R.zf) { pc = 0x69d689; continue; } // 69d672: je 0x69d689
        pc = 0x69d674; continue;
      case 0x69d674:
        R.sub(R.m.u16(((R.ebx + 0x80) | 0) >>> 0), ((R.ebp >>> 0) & 0xffff), 16); // 69d674: cmp word ptr [ebx + 0x80], bp
        if (R.cLE) { pc = 0x69d689; continue; } // 69d67b: jle 0x69d689
        pc = 0x69d67d; continue;
      case 0x69d67d:
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 69d67d: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.875; // 69d681: fmul qword ptr [0x96a678]
        pc = 0x69d6d4; continue; // 69d687: jmp 0x69d6d4
      case 0x69d689:
        R.sub(R.m.u16(((R.ebx + 0x80) | 0) >>> 0), 0x1c52, 16); // 69d689: cmp word ptr [ebx + 0x80], 0x1c52
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 69d692: fild dword ptr [esp + 0x14]
        if (R.cLE) { pc = 0x69d6a0; continue; } // 69d696: jle 0x69d6a0
        pc = 0x69d698; continue;
      case 0x69d698:
        R.st[0] = R.st[0] * 0.9; // 69d698: fmul qword ptr [0x9689d8]
        pc = 0x69d6d4; continue; // 69d69e: jmp 0x69d6d4
      case 0x69d6a0:
        R.st[0] = R.st[0] * 0.95; // 69d6a0: fmul qword ptr [0x9689d0]
        pc = 0x69d6d4; continue; // 69d6a6: jmp 0x69d6d4
      case 0x69d6a8:
        R.sub(((R.eax >>> 0) & 0xff), 0x26, 8); // 69d6a8: cmp al, 0x26
        if (!R.cL) { pc = 0x69d6df; continue; } // 69d6aa: jge 0x69d6df
        pc = 0x69d6ac; continue;
      case 0x69d6ac:
        R.eax = (R.m.u32(((R.esi + 0x69) | 0) >>> 0)) | 0; // 69d6ac: mov eax, dword ptr [esi + 0x69]
        R.sub(R.m.u16(((R.eax + 0xc) | 0) >>> 0), 0x109a, 16); // 69d6af: cmp word ptr [eax + 0xc], 0x109a
        if (!R.cL) { pc = 0x69d6df; continue; } // 69d6b5: jge 0x69d6df
        pc = 0x69d6b7; continue;
      case 0x69d6b7:
        R.ecx = (((R.m.u8(((R.esp + 0x1b) | 0) >>> 0)) << 24 >> 24)) | 0; // 69d6b7: movsx ecx, byte ptr [esp + 0x1b]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 69d6bc: mov dword ptr [esp + 0x10], ecx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69d6c0: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.05; // 69d6c4: fmul qword ptr [0x967888]
        R.st[0] = R.st[0] - 0.95; // 69d6ca: fsub qword ptr [0x9689d0]
        R.st[0] = R.st[0] * R.m.s32(((R.esp + 0x14) | 0) >>> 0); // 69d6d0: fimul dword ptr [esp + 0x14]
        pc = 0x69d6d4; continue;
      case 0x69d6d4:
        R.ftol(); // 69d6d4: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 69d6d9: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 69d6db: mov dword ptr [esp + 0x14], edi
        pc = 0x69d6df; continue;
      case 0x69d6df:
        R.sub(R.m.u8(((R.esp + 0x1b) | 0) >>> 0), 0x2d, 8); // 69d6df: cmp byte ptr [esp + 0x1b], 0x2d
        if (!R.cL) { pc = 0x69d751; continue; } // 69d6e4: jge 0x69d751
        pc = 0x69d6e6; continue;
      case 0x69d6e6:
        R.sub(R.m.u16(((R.ebx + 0x80) | 0) >>> 0), ((R.ebp >>> 0) & 0xffff), 16); // 69d6e6: cmp word ptr [ebx + 0x80], bp
        if (!R.cL) { pc = 0x69d751; continue; } // 69d6ed: jge 0x69d751
        pc = 0x69d6ef; continue;
      case 0x69d6ef:
        R.ecx = (R.m.u32(((R.esi + 0x69) | 0) >>> 0)) | 0; // 69d6ef: mov ecx, dword ptr [esi + 0x69]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, 0x32); // 69d6f2: mov dword ptr [esp + 0x10], 0x32
        R.eax = (((R.m.u16(((R.ecx + 0x6) | 0) >>> 0)) << 16 >> 16)) | 0; // 69d6fa: movsx eax, word ptr [ecx + 6]
        R.edx = (((R.m.u16(((R.ecx + 0x4) | 0) >>> 0)) << 16 >> 16)) | 0; // 69d6fe: movsx edx, word ptr [ecx + 4]
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 69d702: sub eax, edx
        R.sub((R.eax >>> 0), 0x32, 32); // 69d704: cmp eax, 0x32
        if (!R.cLE) { pc = 0x69d70d; continue; } // 69d707: jg 0x69d70d
        pc = 0x69d709; continue;
      case 0x69d709:
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69d709: mov dword ptr [esp + 0x10], eax
        pc = 0x69d70d; continue;
      case 0x69d70d:
        R.eax = (R.m.u32(((R.esp + 0xb4) | 0) >>> 0)) | 0; // 69d70d: mov eax, dword ptr [esp + 0xb4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69d714: test eax, eax
        if (R.zf) { pc = 0x69d725; continue; } // 69d716: je 0x69d725
        pc = 0x69d718; continue;
      case 0x69d718:
        R.eax = (R.m.u32(((R.eax + 0x69) | 0) >>> 0)) | 0; // 69d718: mov eax, dword ptr [eax + 0x69]
        R.ecx = (((R.m.u8(((R.eax + 0x1d) | 0) >>> 0)) << 24 >> 24)) | 0; // 69d71b: movsx ecx, byte ptr [eax + 0x1d]
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.ecx >>> 0)); // 69d71f: mov dword ptr [esp + 0x14], ecx
        pc = 0x69d72d; continue; // 69d723: jmp 0x69d72d
      case 0x69d725:
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, 0xa); // 69d725: mov dword ptr [esp + 0x14], 0xa
        pc = 0x69d72d; continue;
      case 0x69d72d:
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69d72d: fild dword ptr [esp + 0x10]
        R.fpush(2.0); // 69d731: fld qword ptr [0x968950]
        R.call(0x945ff0, { n: 0, thisEcx: false, calleeClean: false }); // 69d737: call 0x945ff0
        R.st[0] = R.st[0] * R.m.s32(((R.esp + 0x14) | 0) >>> 0); // 69d73c: fimul dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.1; // 69d740: fmul qword ptr [0x967880]
        R.ftol(); // 69d746: call 0x945640
        R.edi = (R.add((R.edi >>> 0), (R.eax >>> 0), 32)) | 0; // 69d74b: add edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 69d74d: mov dword ptr [esp + 0x14], edi
        pc = 0x69d751; continue;
      case 0x69d751:
        R.eax = (R.m.u32(((R.esp + 0xb4) | 0) >>> 0)) | 0; // 69d751: mov eax, dword ptr [esp + 0xb4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69d758: test eax, eax
        if (R.zf) { pc = 0x69d954; continue; } // 69d75a: je 0x69d954
        pc = 0x69d760; continue;
      case 0x69d760:
        R.edx = ((R.eax >>> 0)) | 0; // 69d760: mov edx, eax
        R.ebp = (R.m.u32(((R.esi + 0x69) | 0) >>> 0)) | 0; // 69d762: mov ebp, dword ptr [esi + 0x69]
        R.edi = (R.m.u32(((R.edx + 0x69) | 0) >>> 0)) | 0; // 69d765: mov edi, dword ptr [edx + 0x69]
        R.edx = (((R.m.u8(((R.ebp + 0xe) | 0) >>> 0)) << 24 >> 24)) | 0; // 69d768: movsx edx, byte ptr [ebp + 0xe]
        R.eax = (((R.m.u8(((R.edi + 0x16) | 0) >>> 0)) << 24 >> 24)) | 0; // 69d76c: movsx eax, byte ptr [edi + 0x16]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69d770: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69d774: fild dword ptr [esp + 0x10]
        R.ecx = (((R.m.u8(((R.edi + 0xe) | 0) >>> 0)) << 24 >> 24)) | 0; // 69d778: movsx ecx, byte ptr [edi + 0xe]
        R.st[0] = R.st[0] * 0.025; // 69d77c: fmul qword ptr [0x967878]
        R.ecx = (R.sub((R.ecx >>> 0), (R.edx >>> 0), 32)) | 0; // 69d782: sub ecx, edx
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 69d784: mov dword ptr [esp + 0x10], ecx
        R.st[0] = 1.25 - R.st[0]; // 69d788: fsubr qword ptr [0x968928]
        R.fpush(R.st[0]); // 69d78e: fld st(0)
        R.st[0] = R.st[0] * 100.0; // 69d790: fmul qword ptr [0x9688a8]
        R.fpush(R.st[1]); // 69d796: fld st(1)
        R.st[0] = R.st[0] * 150.0; // 69d798: fmul qword ptr [0x968f50]
        R.m.wf64(((R.esp + 0x1c) | 0) >>> 0, R.st[0]); R.fpop(); // 69d79e: fstp qword ptr [esp + 0x1c]
        R.fpush(R.st[1]); // 69d7a2: fld st(1)
        R.st[0] = R.st[0] * 300.0; // 69d7a4: fmul qword ptr [0x96a6b0]
        R.m.wf64(((R.esp + 0x24) | 0) >>> 0, R.st[0]); R.fpop(); // 69d7aa: fstp qword ptr [esp + 0x24]
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69d7ae: fild dword ptr [esp + 0x10]
        R.st[0] = Math.abs(R.st[0]); // 69d7b2: fabs 
        R.st[0] = R.st[0] / R.st[1]; // 69d7b4: fdiv st(1)
        R.st[0] = 1.0 - R.st[0]; // 69d7b6: fsubr qword ptr [0x967890]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 69d7bc: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.5; // 69d7c0: fmul qword ptr [0x968940]
        R.ftol(); // 69d7c6: call 0x945640
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69d7cb: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69d7cf: fild dword ptr [esp + 0x10]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69d7d3: fmulp st(1)
        R.ftol(); // 69d7d5: call 0x945640
        R.ecx = (((R.m.u8(((R.ebp + 0x12) | 0) >>> 0)) << 24 >> 24)) | 0; // 69d7da: movsx ecx, byte ptr [ebp + 0x12]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69d7de: mov dword ptr [esp + 0x10], eax
        R.eax = (((R.m.u8(((R.edi + 0x12) | 0) >>> 0)) << 24 >> 24)) | 0; // 69d7e2: movsx eax, byte ptr [edi + 0x12]
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69d7e6: fild dword ptr [esp + 0x10]
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 69d7ea: sub eax, ecx
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69d7ec: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69d7f0: fild dword ptr [esp + 0x10]
        R.st[0] = Math.abs(R.st[0]); // 69d7f4: fabs 
        R.fpush(R.st[3]); // 69d7f6: fld st(3)
        R.st[0] = R.st[0] * 250.0; // 69d7f8: fmul qword ptr [0x968898]
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 69d7fe: fdivp st(1)
        R.st[0] = 1.0 - R.st[0]; // 69d800: fsubr qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69d806: fmulp st(1)
        R.ftol(); // 69d808: call 0x945640
        R.edx = (((R.m.u8(((R.edi + 0x13) | 0) >>> 0)) << 24 >> 24)) | 0; // 69d80d: movsx edx, byte ptr [edi + 0x13]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69d811: mov dword ptr [esp + 0x10], eax
        R.eax = (((R.m.u8(((R.ebp + 0x13) | 0) >>> 0)) << 24 >> 24)) | 0; // 69d815: movsx eax, byte ptr [ebp + 0x13]
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69d819: fild dword ptr [esp + 0x10]
        R.edx = (R.sub((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 69d81d: sub edx, eax
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edx >>> 0)); // 69d81f: mov dword ptr [esp + 0x10], edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69d823: fild dword ptr [esp + 0x10]
        R.st[0] = Math.abs(R.st[0]); // 69d827: fabs 
        R.st[0] = R.st[0] / R.st[2]; // 69d829: fdiv st(2)
        R.st[0] = 1.0 - R.st[0]; // 69d82b: fsubr qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69d831: fmulp st(1)
        R.ftol(); // 69d833: call 0x945640
        R.ecx = (((R.m.u8(((R.edi + 0x14) | 0) >>> 0)) << 24 >> 24)) | 0; // 69d838: movsx ecx, byte ptr [edi + 0x14]
        R.fpop(); // 69d83c: fstp st(0)
        R.edx = (((R.m.u8(((R.ebp + 0x14) | 0) >>> 0)) << 24 >> 24)) | 0; // 69d83e: movsx edx, byte ptr [ebp + 0x14]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69d842: mov dword ptr [esp + 0x10], eax
        R.ecx = (R.sub((R.ecx >>> 0), (R.edx >>> 0), 32)) | 0; // 69d846: sub ecx, edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69d848: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 69d84c: mov dword ptr [esp + 0x10], ecx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69d850: fild dword ptr [esp + 0x10]
        R.st[0] = Math.abs(R.st[0]); // 69d854: fabs 
        R.st[0] = R.st[0] / R.f64(((R.esp + 0x1c) | 0)); // 69d856: fdiv qword ptr [esp + 0x1c]
        R.st[0] = 1.0 - R.st[0]; // 69d85a: fsubr qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69d860: fmulp st(1)
        R.ftol(); // 69d862: call 0x945640
        R.ecx = (((R.m.u8(((R.ebp + 0x15) | 0) >>> 0)) << 24 >> 24)) | 0; // 69d867: movsx ecx, byte ptr [ebp + 0x15]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69d86b: mov dword ptr [esp + 0x10], eax
        R.eax = (((R.m.u8(((R.edi + 0x15) | 0) >>> 0)) << 24 >> 24)) | 0; // 69d86f: movsx eax, byte ptr [edi + 0x15]
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69d873: fild dword ptr [esp + 0x10]
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 69d877: sub eax, ecx
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69d879: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69d87d: fild dword ptr [esp + 0x10]
        R.st[0] = Math.abs(R.st[0]); // 69d881: fabs 
        R.st[0] = R.st[0] / R.f64(((R.esp + 0x1c) | 0)); // 69d883: fdiv qword ptr [esp + 0x1c]
        R.st[0] = 1.0 - R.st[0]; // 69d887: fsubr qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69d88d: fmulp st(1)
        R.ftol(); // 69d88f: call 0x945640
        R.edx = (((R.m.u8(((R.edi + 0x1a) | 0) >>> 0)) << 24 >> 24)) | 0; // 69d894: movsx edx, byte ptr [edi + 0x1a]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69d898: mov dword ptr [esp + 0x10], eax
        R.eax = (((R.m.u8(((R.ebp + 0x1a) | 0) >>> 0)) << 24 >> 24)) | 0; // 69d89c: movsx eax, byte ptr [ebp + 0x1a]
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69d8a0: fild dword ptr [esp + 0x10]
        R.edx = (R.sub((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 69d8a4: sub edx, eax
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edx >>> 0)); // 69d8a6: mov dword ptr [esp + 0x10], edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69d8aa: fild dword ptr [esp + 0x10]
        R.st[0] = Math.abs(R.st[0]); // 69d8ae: fabs 
        R.st[0] = R.st[0] / R.f64(((R.esp + 0x24) | 0)); // 69d8b0: fdiv qword ptr [esp + 0x24]
        R.st[0] = 1.0 - R.st[0]; // 69d8b4: fsubr qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69d8ba: fmulp st(1)
        R.ftol(); // 69d8bc: call 0x945640
        R.ecx = (((R.m.u8(((R.edi + 0x1c) | 0) >>> 0)) << 24 >> 24)) | 0; // 69d8c1: movsx ecx, byte ptr [edi + 0x1c]
        R.edx = (((R.m.u8(((R.ebp + 0x1c) | 0) >>> 0)) << 24 >> 24)) | 0; // 69d8c5: movsx edx, byte ptr [ebp + 0x1c]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69d8c9: mov dword ptr [esp + 0x10], eax
        R.ecx = (R.sub((R.ecx >>> 0), (R.edx >>> 0), 32)) | 0; // 69d8cd: sub ecx, edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69d8cf: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 69d8d3: mov dword ptr [esp + 0x10], ecx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69d8d7: fild dword ptr [esp + 0x10]
        R.st[0] = Math.abs(R.st[0]); // 69d8db: fabs 
        R.st[0] = R.st[0] / R.f64(((R.esp + 0x24) | 0)); // 69d8dd: fdiv qword ptr [esp + 0x24]
        R.st[0] = 1.0 - R.st[0]; // 69d8e1: fsubr qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69d8e7: fmulp st(1)
        R.ftol(); // 69d8e9: call 0x945640
        R.ecx = (((R.m.u8(((R.ebp + 0x1f) | 0) >>> 0)) << 24 >> 24)) | 0; // 69d8ee: movsx ecx, byte ptr [ebp + 0x1f]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69d8f2: mov dword ptr [esp + 0x10], eax
        R.eax = (((R.m.u8(((R.edi + 0x1f) | 0) >>> 0)) << 24 >> 24)) | 0; // 69d8f6: movsx eax, byte ptr [edi + 0x1f]
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69d8fa: fild dword ptr [esp + 0x10]
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 69d8fe: sub eax, ecx
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69d900: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69d904: fild dword ptr [esp + 0x10]
        R.st[0] = Math.abs(R.st[0]); // 69d908: fabs 
        { const t = R.st[0]; R.st[0] = R.st[2]; R.st[2] = t; } // 69d90a: fxch st(2)
        R.st[0] = R.st[0] * 200.0; // 69d90c: fmul qword ptr [0x96a648]
        R.st[2] = R.st[2] / R.st[0]; R.fpop(); // 69d912: fdivp st(2)
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 69d914: fxch st(1)
        R.st[0] = 1.0 - R.st[0]; // 69d916: fsubr qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69d91c: fmulp st(1)
        R.ftol(); // 69d91e: call 0x945640
        R.edx = (((R.m.u8(((R.edi + 0x22) | 0) >>> 0)) << 24 >> 24)) | 0; // 69d923: movsx edx, byte ptr [edi + 0x22]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69d927: mov dword ptr [esp + 0x10], eax
        R.eax = (((R.m.u8(((R.ebp + 0x22) | 0) >>> 0)) << 24 >> 24)) | 0; // 69d92b: movsx eax, byte ptr [ebp + 0x22]
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69d92f: fild dword ptr [esp + 0x10]
        R.edx = (R.sub((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 69d933: sub edx, eax
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edx >>> 0)); // 69d935: mov dword ptr [esp + 0x10], edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69d939: fild dword ptr [esp + 0x10]
        R.st[0] = Math.abs(R.st[0]); // 69d93d: fabs 
        R.st[0] = R.st[0] / R.f64(((R.esp + 0x1c) | 0)); // 69d93f: fdiv qword ptr [esp + 0x1c]
        R.st[0] = 1.0 - R.st[0]; // 69d943: fsubr qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69d949: fmulp st(1)
        R.ftol(); // 69d94b: call 0x945640
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.eax >>> 0)); // 69d950: mov dword ptr [esp + 0x14], eax
        pc = 0x69d954; continue;
      case 0x69d954:
        R.edi = (R.m.u32(((R.esi + 0x69) | 0) >>> 0)) | 0; // 69d954: mov edi, dword ptr [esi + 0x69]
        R.ecx = (((R.m.u8(((R.edi + 0x11) | 0) >>> 0)) << 24 >> 24)) | 0; // 69d957: movsx ecx, byte ptr [edi + 0x11]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 69d95b: mov dword ptr [esp + 0x10], ecx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69d95f: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.0008333333333333334; // 69d963: fmul qword ptr [0x96d268]
        R.st[0] = R.st[0] + 1.0; // 69d969: fadd qword ptr [0x967890]
        R.st[0] = R.st[0] * R.m.s32(((R.esp + 0x14) | 0) >>> 0); // 69d96f: fimul dword ptr [esp + 0x14]
        R.ftol(); // 69d973: call 0x945640
        R.edx = (((R.m.u8(((R.edi + 0x10) | 0) >>> 0)) << 24 >> 24)) | 0; // 69d978: movsx edx, byte ptr [edi + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69d97c: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69d980: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edx >>> 0)); // 69d984: mov dword ptr [esp + 0x10], edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69d988: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.0008333333333333334; // 69d98c: fmul qword ptr [0x96d268]
        R.st[0] = R.st[0] + 1.0; // 69d992: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69d998: fmulp st(1)
        R.ftol(); // 69d99a: call 0x945640
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69d99f: mov dword ptr [esp + 0x10], eax
        R.eax = (((R.m.u8(((R.edi + 0x17) | 0) >>> 0)) << 24 >> 24)) | 0; // 69d9a3: movsx eax, byte ptr [edi + 0x17]
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69d9a7: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69d9ab: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69d9af: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.002; // 69d9b3: fmul qword ptr [0x969048]
        R.st[0] = R.st[0] + 1.0; // 69d9b9: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69d9bf: fmulp st(1)
        R.ftol(); // 69d9c1: call 0x945640
        R.ecx = (((R.m.u8(((R.edi + 0x18) | 0) >>> 0)) << 24 >> 24)) | 0; // 69d9c6: movsx ecx, byte ptr [edi + 0x18]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69d9ca: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69d9ce: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 69d9d2: mov dword ptr [esp + 0x10], ecx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69d9d6: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.002; // 69d9da: fmul qword ptr [0x969048]
        R.st[0] = R.st[0] + 1.0; // 69d9e0: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69d9e6: fmulp st(1)
        R.ftol(); // 69d9e8: call 0x945640
        R.edx = (((R.m.u8(((R.edi + 0x19) | 0) >>> 0)) << 24 >> 24)) | 0; // 69d9ed: movsx edx, byte ptr [edi + 0x19]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69d9f1: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69d9f5: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edx >>> 0)); // 69d9f9: mov dword ptr [esp + 0x10], edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69d9fd: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.002; // 69da01: fmul qword ptr [0x969048]
        R.st[0] = R.st[0] + 1.0; // 69da07: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69da0d: fmulp st(1)
        R.ftol(); // 69da0f: call 0x945640
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69da14: mov dword ptr [esp + 0x10], eax
        R.eax = (((R.m.u8(((R.edi + 0x1b) | 0) >>> 0)) << 24 >> 24)) | 0; // 69da18: movsx eax, byte ptr [edi + 0x1b]
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69da1c: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69da20: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69da24: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.002; // 69da28: fmul qword ptr [0x969048]
        R.st[0] = R.st[0] + 1.0; // 69da2e: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69da34: fmulp st(1)
        R.ftol(); // 69da36: call 0x945640
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.eax >>> 0)); // 69da3b: mov dword ptr [esp + 0x14], eax
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 69da3f: mov ax, word ptr [ebx + 0x80]
        R.sub(((R.eax >>> 0) & 0xffff), 0x1c52, 16); // 69da46: cmp ax, 0x1c52
        if (R.cLE) { pc = 0x69da60; continue; } // 69da4a: jle 0x69da60
        pc = 0x69da4c; continue;
      case 0x69da4c:
        R.ecx = (((R.m.u8(((R.edi + 0x21) | 0) >>> 0)) << 24 >> 24)) | 0; // 69da4c: movsx ecx, byte ptr [edi + 0x21]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 69da50: mov dword ptr [esp + 0x10], ecx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69da54: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.008; // 69da58: fmul qword ptr [0x96d260]
        pc = 0x69da8c; continue; // 69da5e: jmp 0x69da8c
      case 0x69da60:
        R.sub(((R.eax >>> 0) & 0xffff), 0x1676, 16); // 69da60: cmp ax, 0x1676
        if (R.cLE) { pc = 0x69da7a; continue; } // 69da64: jle 0x69da7a
        pc = 0x69da66; continue;
      case 0x69da66:
        R.edx = (((R.m.u8(((R.edi + 0x21) | 0) >>> 0)) << 24 >> 24)) | 0; // 69da66: movsx edx, byte ptr [edi + 0x21]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edx >>> 0)); // 69da6a: mov dword ptr [esp + 0x10], edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69da6e: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.004; // 69da72: fmul qword ptr [0x968d60]
        pc = 0x69da8c; continue; // 69da78: jmp 0x69da8c
      case 0x69da7a:
        R.eax = (((R.m.u8(((R.edi + 0x21) | 0) >>> 0)) << 24 >> 24)) | 0; // 69da7a: movsx eax, byte ptr [edi + 0x21]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69da7e: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69da82: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.002; // 69da86: fmul qword ptr [0x969048]
        pc = 0x69da8c; continue;
      case 0x69da8c:
        R.st[0] = R.st[0] + 1.0; // 69da8c: fadd qword ptr [0x967890]
        R.st[0] = R.st[0] * R.m.s32(((R.esp + 0x14) | 0) >>> 0); // 69da92: fimul dword ptr [esp + 0x14]
        R.ftol(); // 69da96: call 0x945640
        R.ecx = (((R.m.u8(((R.esi + 0x59) | 0) >>> 0)) << 24 >> 24)) | 0; // 69da9b: movsx ecx, byte ptr [esi + 0x59]
        R.ecx = (R.sub((R.ecx >>> 0), 0xa, 32)) | 0; // 69da9f: sub ecx, 0xa
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.eax >>> 0)); // 69daa2: mov dword ptr [esp + 0x14], eax
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 69daa6: mov dword ptr [esp + 0x10], ecx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69daaa: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.005; // 69daae: fmul qword ptr [0x968ef0]
        R.st[0] = R.st[0] + 1.0; // 69dab4: fadd qword ptr [0x967890]
        R.st[0] = R.st[0] * R.m.s32(((R.esp + 0x14) | 0) >>> 0); // 69daba: fimul dword ptr [esp + 0x14]
        R.ftol(); // 69dabe: call 0x945640
        R.edx = (((R.m.u8(((R.esi + 0x58) | 0) >>> 0)) << 24 >> 24)) | 0; // 69dac3: movsx edx, byte ptr [esi + 0x58]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69dac7: mov dword ptr [esp + 0x10], eax
        R.edx = (R.sub((R.edx >>> 0), 0xa, 32)) | 0; // 69dacb: sub edx, 0xa
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69dace: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edx >>> 0)); // 69dad2: mov dword ptr [esp + 0x10], edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69dad6: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.005; // 69dada: fmul qword ptr [0x968ef0]
        R.st[0] = R.st[0] + 1.0; // 69dae0: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69dae6: fmulp st(1)
        R.ftol(); // 69dae8: call 0x945640
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69daed: mov dword ptr [esp + 0x10], eax
        R.eax = (((R.m.u8(((R.esi + 0x5a) | 0) >>> 0)) << 24 >> 24)) | 0; // 69daf1: movsx eax, byte ptr [esi + 0x5a]
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69daf5: fild dword ptr [esp + 0x10]
        R.eax = (R.sub((R.eax >>> 0), 0xa, 32)) | 0; // 69daf9: sub eax, 0xa
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69dafc: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69db00: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.005; // 69db04: fmul qword ptr [0x968ef0]
        R.st[0] = R.st[0] + 1.0; // 69db0a: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69db10: fmulp st(1)
        R.ftol(); // 69db12: call 0x945640
        R.ecx = (((R.m.u8(((R.esi + 0x5b) | 0) >>> 0)) << 24 >> 24)) | 0; // 69db17: movsx ecx, byte ptr [esi + 0x5b]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69db1b: mov dword ptr [esp + 0x10], eax
        R.ecx = (R.sub((R.ecx >>> 0), 0xa, 32)) | 0; // 69db1f: sub ecx, 0xa
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69db22: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 69db26: mov dword ptr [esp + 0x10], ecx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69db2a: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.005; // 69db2e: fmul qword ptr [0x968ef0]
        pc = 0x69e5a6; continue; // 69db34: jmp 0x69e5a6
      case 0x69db39:
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 69db39: test ebp, ebp
        if (R.zf) { pc = 0x69dd08; continue; } // 69db3b: je 0x69dd08
        pc = 0x69db41; continue;
      case 0x69db41:
        R.edx = (R.m.u32(((R.esp + 0xb4) | 0) >>> 0)) | 0; // 69db41: mov edx, dword ptr [esp + 0xb4]
        R.edi = (R.m.u32(((R.esi + 0x69) | 0) >>> 0)) | 0; // 69db48: mov edi, dword ptr [esi + 0x69]
        R.ebp = (R.m.u32(((R.edx + 0x69) | 0) >>> 0)) | 0; // 69db4b: mov ebp, dword ptr [edx + 0x69]
        R.ecx = (((R.m.u8(((R.edi + 0xe) | 0) >>> 0)) << 24 >> 24)) | 0; // 69db4e: movsx ecx, byte ptr [edi + 0xe]
        R.eax = (((R.m.u8(((R.ebp + 0xe) | 0) >>> 0)) << 24 >> 24)) | 0; // 69db52: movsx eax, byte ptr [ebp + 0xe]
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 69db56: sub eax, ecx
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69db58: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69db5c: fild dword ptr [esp + 0x10]
        R.st[0] = Math.abs(R.st[0]); // 69db60: fabs 
        R.st[0] = R.st[0] * 0.006666666666666667; // 69db62: fmul qword ptr [0x96d1d0]
        R.st[0] = 1.0 - R.st[0]; // 69db68: fsubr qword ptr [0x967890]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 69db6e: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.5; // 69db72: fmul qword ptr [0x968940]
        R.ftol(); // 69db78: call 0x945640
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69db7d: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69db81: fild dword ptr [esp + 0x10]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69db85: fmulp st(1)
        R.ftol(); // 69db87: call 0x945640
        R.edx = (((R.m.u8(((R.ebp + 0x12) | 0) >>> 0)) << 24 >> 24)) | 0; // 69db8c: movsx edx, byte ptr [ebp + 0x12]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69db90: mov dword ptr [esp + 0x10], eax
        R.eax = (((R.m.u8(((R.edi + 0x12) | 0) >>> 0)) << 24 >> 24)) | 0; // 69db94: movsx eax, byte ptr [edi + 0x12]
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69db98: fild dword ptr [esp + 0x10]
        R.edx = (R.sub((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 69db9c: sub edx, eax
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edx >>> 0)); // 69db9e: mov dword ptr [esp + 0x10], edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69dba2: fild dword ptr [esp + 0x10]
        R.st[0] = Math.abs(R.st[0]); // 69dba6: fabs 
        R.st[0] = R.st[0] * 0.006666666666666667; // 69dba8: fmul qword ptr [0x96d1d0]
        R.st[0] = 1.0 - R.st[0]; // 69dbae: fsubr qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69dbb4: fmulp st(1)
        R.ftol(); // 69dbb6: call 0x945640
        R.ecx = (((R.m.u8(((R.ebp + 0x13) | 0) >>> 0)) << 24 >> 24)) | 0; // 69dbbb: movsx ecx, byte ptr [ebp + 0x13]
        R.edx = (((R.m.u8(((R.edi + 0x13) | 0) >>> 0)) << 24 >> 24)) | 0; // 69dbbf: movsx edx, byte ptr [edi + 0x13]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69dbc3: mov dword ptr [esp + 0x10], eax
        R.ecx = (R.sub((R.ecx >>> 0), (R.edx >>> 0), 32)) | 0; // 69dbc7: sub ecx, edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69dbc9: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 69dbcd: mov dword ptr [esp + 0x10], ecx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69dbd1: fild dword ptr [esp + 0x10]
        R.st[0] = Math.abs(R.st[0]); // 69dbd5: fabs 
        R.st[0] = R.st[0] * 0.01; // 69dbd7: fmul qword ptr [0x967898]
        R.st[0] = 1.0 - R.st[0]; // 69dbdd: fsubr qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69dbe3: fmulp st(1)
        R.ftol(); // 69dbe5: call 0x945640
        R.ecx = (((R.m.u8(((R.edi + 0x14) | 0) >>> 0)) << 24 >> 24)) | 0; // 69dbea: movsx ecx, byte ptr [edi + 0x14]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69dbee: mov dword ptr [esp + 0x10], eax
        R.eax = (((R.m.u8(((R.ebp + 0x14) | 0) >>> 0)) << 24 >> 24)) | 0; // 69dbf2: movsx eax, byte ptr [ebp + 0x14]
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69dbf6: fild dword ptr [esp + 0x10]
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 69dbfa: sub eax, ecx
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69dbfc: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69dc00: fild dword ptr [esp + 0x10]
        R.st[0] = Math.abs(R.st[0]); // 69dc04: fabs 
        R.st[0] = R.st[0] * 0.0044444444444444444; // 69dc06: fmul qword ptr [0x96d258]
        R.st[0] = 1.0 - R.st[0]; // 69dc0c: fsubr qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69dc12: fmulp st(1)
        R.ftol(); // 69dc14: call 0x945640
        R.edx = (((R.m.u8(((R.ebp + 0x15) | 0) >>> 0)) << 24 >> 24)) | 0; // 69dc19: movsx edx, byte ptr [ebp + 0x15]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69dc1d: mov dword ptr [esp + 0x10], eax
        R.eax = (((R.m.u8(((R.edi + 0x15) | 0) >>> 0)) << 24 >> 24)) | 0; // 69dc21: movsx eax, byte ptr [edi + 0x15]
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69dc25: fild dword ptr [esp + 0x10]
        R.edx = (R.sub((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 69dc29: sub edx, eax
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edx >>> 0)); // 69dc2b: mov dword ptr [esp + 0x10], edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69dc2f: fild dword ptr [esp + 0x10]
        R.st[0] = Math.abs(R.st[0]); // 69dc33: fabs 
        R.st[0] = R.st[0] * 0.006666666666666667; // 69dc35: fmul qword ptr [0x96d1d0]
        R.st[0] = 1.0 - R.st[0]; // 69dc3b: fsubr qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69dc41: fmulp st(1)
        R.ftol(); // 69dc43: call 0x945640
        R.ecx = (((R.m.u8(((R.ebp + 0x1a) | 0) >>> 0)) << 24 >> 24)) | 0; // 69dc48: movsx ecx, byte ptr [ebp + 0x1a]
        R.edx = (((R.m.u8(((R.edi + 0x1a) | 0) >>> 0)) << 24 >> 24)) | 0; // 69dc4c: movsx edx, byte ptr [edi + 0x1a]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69dc50: mov dword ptr [esp + 0x10], eax
        R.ecx = (R.sub((R.ecx >>> 0), (R.edx >>> 0), 32)) | 0; // 69dc54: sub ecx, edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69dc56: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 69dc5a: mov dword ptr [esp + 0x10], ecx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69dc5e: fild dword ptr [esp + 0x10]
        R.st[0] = Math.abs(R.st[0]); // 69dc62: fabs 
        R.st[0] = R.st[0] * 0.01; // 69dc64: fmul qword ptr [0x967898]
        R.st[0] = 1.0 - R.st[0]; // 69dc6a: fsubr qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69dc70: fmulp st(1)
        R.ftol(); // 69dc72: call 0x945640
        R.ecx = (((R.m.u8(((R.edi + 0x1c) | 0) >>> 0)) << 24 >> 24)) | 0; // 69dc77: movsx ecx, byte ptr [edi + 0x1c]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69dc7b: mov dword ptr [esp + 0x10], eax
        R.eax = (((R.m.u8(((R.ebp + 0x1c) | 0) >>> 0)) << 24 >> 24)) | 0; // 69dc7f: movsx eax, byte ptr [ebp + 0x1c]
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69dc83: fild dword ptr [esp + 0x10]
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 69dc87: sub eax, ecx
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69dc89: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69dc8d: fild dword ptr [esp + 0x10]
        R.st[0] = Math.abs(R.st[0]); // 69dc91: fabs 
        R.st[0] = R.st[0] * 0.01; // 69dc93: fmul qword ptr [0x967898]
        R.st[0] = 1.0 - R.st[0]; // 69dc99: fsubr qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69dc9f: fmulp st(1)
        R.ftol(); // 69dca1: call 0x945640
        R.edx = (((R.m.u8(((R.ebp + 0x1f) | 0) >>> 0)) << 24 >> 24)) | 0; // 69dca6: movsx edx, byte ptr [ebp + 0x1f]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69dcaa: mov dword ptr [esp + 0x10], eax
        R.eax = (((R.m.u8(((R.edi + 0x1f) | 0) >>> 0)) << 24 >> 24)) | 0; // 69dcae: movsx eax, byte ptr [edi + 0x1f]
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69dcb2: fild dword ptr [esp + 0x10]
        R.edx = (R.sub((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 69dcb6: sub edx, eax
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edx >>> 0)); // 69dcb8: mov dword ptr [esp + 0x10], edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69dcbc: fild dword ptr [esp + 0x10]
        R.st[0] = Math.abs(R.st[0]); // 69dcc0: fabs 
        R.st[0] = R.st[0] * 0.006666666666666667; // 69dcc2: fmul qword ptr [0x96d1d0]
        R.st[0] = 1.0 - R.st[0]; // 69dcc8: fsubr qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69dcce: fmulp st(1)
        R.ftol(); // 69dcd0: call 0x945640
        R.ecx = (((R.m.u8(((R.ebp + 0x22) | 0) >>> 0)) << 24 >> 24)) | 0; // 69dcd5: movsx ecx, byte ptr [ebp + 0x22]
        R.edx = (((R.m.u8(((R.edi + 0x22) | 0) >>> 0)) << 24 >> 24)) | 0; // 69dcd9: movsx edx, byte ptr [edi + 0x22]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69dcdd: mov dword ptr [esp + 0x10], eax
        R.ecx = (R.sub((R.ecx >>> 0), (R.edx >>> 0), 32)) | 0; // 69dce1: sub ecx, edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69dce3: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 69dce7: mov dword ptr [esp + 0x10], ecx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69dceb: fild dword ptr [esp + 0x10]
        R.st[0] = Math.abs(R.st[0]); // 69dcef: fabs 
        R.st[0] = R.st[0] * 0.004; // 69dcf1: fmul qword ptr [0x968d60]
        R.st[0] = 1.0 - R.st[0]; // 69dcf7: fsubr qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69dcfd: fmulp st(1)
        R.ftol(); // 69dcff: call 0x945640
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.eax >>> 0)); // 69dd04: mov dword ptr [esp + 0x14], eax
        pc = 0x69dd08; continue;
      case 0x69dd08:
        R.edi = (R.m.u32(((R.esi + 0x69) | 0) >>> 0)) | 0; // 69dd08: mov edi, dword ptr [esi + 0x69]
        R.eax = (((R.m.u8(((R.edi + 0x11) | 0) >>> 0)) << 24 >> 24)) | 0; // 69dd0b: movsx eax, byte ptr [edi + 0x11]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69dd0f: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69dd13: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.002; // 69dd17: fmul qword ptr [0x969048]
        R.st[0] = R.st[0] + 1.0; // 69dd1d: fadd qword ptr [0x967890]
        R.st[0] = R.st[0] * R.m.s32(((R.esp + 0x14) | 0) >>> 0); // 69dd23: fimul dword ptr [esp + 0x14]
        R.ftol(); // 69dd27: call 0x945640
        R.ecx = (((R.m.u8(((R.edi + 0x10) | 0) >>> 0)) << 24 >> 24)) | 0; // 69dd2c: movsx ecx, byte ptr [edi + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69dd30: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69dd34: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 69dd38: mov dword ptr [esp + 0x10], ecx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69dd3c: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.002; // 69dd40: fmul qword ptr [0x969048]
        R.st[0] = R.st[0] + 1.0; // 69dd46: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69dd4c: fmulp st(1)
        R.ftol(); // 69dd4e: call 0x945640
        R.edx = (((R.m.u8(((R.edi + 0x17) | 0) >>> 0)) << 24 >> 24)) | 0; // 69dd53: movsx edx, byte ptr [edi + 0x17]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69dd57: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69dd5b: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edx >>> 0)); // 69dd5f: mov dword ptr [esp + 0x10], edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69dd63: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.0013333333333333333; // 69dd67: fmul qword ptr [0x96d250]
        R.st[0] = R.st[0] + 1.0; // 69dd6d: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69dd73: fmulp st(1)
        R.ftol(); // 69dd75: call 0x945640
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69dd7a: mov dword ptr [esp + 0x10], eax
        R.eax = (((R.m.u8(((R.edi + 0x18) | 0) >>> 0)) << 24 >> 24)) | 0; // 69dd7e: movsx eax, byte ptr [edi + 0x18]
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69dd82: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69dd86: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69dd8a: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.0013333333333333333; // 69dd8e: fmul qword ptr [0x96d250]
        R.st[0] = R.st[0] + 1.0; // 69dd94: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69dd9a: fmulp st(1)
        R.ftol(); // 69dd9c: call 0x945640
        R.ecx = (((R.m.u8(((R.edi + 0x19) | 0) >>> 0)) << 24 >> 24)) | 0; // 69dda1: movsx ecx, byte ptr [edi + 0x19]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69dda5: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69dda9: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 69ddad: mov dword ptr [esp + 0x10], ecx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69ddb1: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.0006666666666666666; // 69ddb5: fmul qword ptr [0x968da0]
        R.st[0] = R.st[0] + 1.0; // 69ddbb: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69ddc1: fmulp st(1)
        R.ftol(); // 69ddc3: call 0x945640
        R.edx = (((R.m.u8(((R.edi + 0x1b) | 0) >>> 0)) << 24 >> 24)) | 0; // 69ddc8: movsx edx, byte ptr [edi + 0x1b]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69ddcc: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69ddd0: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edx >>> 0)); // 69ddd4: mov dword ptr [esp + 0x10], edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69ddd8: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.0013333333333333333; // 69dddc: fmul qword ptr [0x96d250]
        R.st[0] = R.st[0] + 1.0; // 69dde2: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69dde8: fmulp st(1)
        R.ftol(); // 69ddea: call 0x945640
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69ddef: mov dword ptr [esp + 0x10], eax
        R.eax = (((R.m.u8(((R.edi + 0x21) | 0) >>> 0)) << 24 >> 24)) | 0; // 69ddf3: movsx eax, byte ptr [edi + 0x21]
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69ddf7: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69ddfb: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69ddff: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.002; // 69de03: fmul qword ptr [0x969048]
        R.st[0] = R.st[0] + 1.0; // 69de09: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69de0f: fmulp st(1)
        R.ftol(); // 69de11: call 0x945640
        R.ecx = (((R.m.u8(((R.esi + 0x59) | 0) >>> 0)) << 24 >> 24)) | 0; // 69de16: movsx ecx, byte ptr [esi + 0x59]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69de1a: mov dword ptr [esp + 0x10], eax
        R.ecx = (R.sub((R.ecx >>> 0), 0xa, 32)) | 0; // 69de1e: sub ecx, 0xa
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69de21: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 69de25: mov dword ptr [esp + 0x10], ecx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69de29: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.005; // 69de2d: fmul qword ptr [0x968ef0]
        R.st[0] = R.st[0] + 1.0; // 69de33: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69de39: fmulp st(1)
        R.ftol(); // 69de3b: call 0x945640
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69de40: mov dword ptr [esp + 0x10], eax
        R.edx = (((R.m.u8(((R.esi + 0x58) | 0) >>> 0)) << 24 >> 24)) | 0; // 69de44: movsx edx, byte ptr [esi + 0x58]
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69de48: fild dword ptr [esp + 0x10]
        R.edx = (R.sub((R.edx >>> 0), 0xa, 32)) | 0; // 69de4c: sub edx, 0xa
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edx >>> 0)); // 69de4f: mov dword ptr [esp + 0x10], edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69de53: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.005; // 69de57: fmul qword ptr [0x968ef0]
        R.st[0] = R.st[0] + 1.0; // 69de5d: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69de63: fmulp st(1)
        R.ftol(); // 69de65: call 0x945640
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69de6a: mov dword ptr [esp + 0x10], eax
        R.eax = (((R.m.u8(((R.esi + 0x5a) | 0) >>> 0)) << 24 >> 24)) | 0; // 69de6e: movsx eax, byte ptr [esi + 0x5a]
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69de72: fild dword ptr [esp + 0x10]
        R.eax = (R.sub((R.eax >>> 0), 0xa, 32)) | 0; // 69de76: sub eax, 0xa
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69de79: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69de7d: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.005; // 69de81: fmul qword ptr [0x968ef0]
        R.st[0] = R.st[0] + 1.0; // 69de87: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69de8d: fmulp st(1)
        R.ftol(); // 69de8f: call 0x945640
        R.ecx = (((R.m.u8(((R.esi + 0x5b) | 0) >>> 0)) << 24 >> 24)) | 0; // 69de94: movsx ecx, byte ptr [esi + 0x5b]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69de98: mov dword ptr [esp + 0x10], eax
        R.ecx = (R.sub((R.ecx >>> 0), 0xa, 32)) | 0; // 69de9c: sub ecx, 0xa
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69de9f: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 69dea3: mov dword ptr [esp + 0x10], ecx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69dea7: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.005; // 69deab: fmul qword ptr [0x968ef0]
        pc = 0x69e5a6; continue; // 69deb1: jmp 0x69e5a6
      case 0x69deb6:
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 69deb6: test ebp, ebp
        if (R.zf) { pc = 0x69e085; continue; } // 69deb8: je 0x69e085
        pc = 0x69debe; continue;
      case 0x69debe:
        R.edx = (R.m.u32(((R.esp + 0xb4) | 0) >>> 0)) | 0; // 69debe: mov edx, dword ptr [esp + 0xb4]
        R.edi = (R.m.u32(((R.esi + 0x69) | 0) >>> 0)) | 0; // 69dec5: mov edi, dword ptr [esi + 0x69]
        R.ebp = (R.m.u32(((R.edx + 0x69) | 0) >>> 0)) | 0; // 69dec8: mov ebp, dword ptr [edx + 0x69]
        R.ecx = (((R.m.u8(((R.edi + 0xe) | 0) >>> 0)) << 24 >> 24)) | 0; // 69decb: movsx ecx, byte ptr [edi + 0xe]
        R.eax = (((R.m.u8(((R.ebp + 0xe) | 0) >>> 0)) << 24 >> 24)) | 0; // 69decf: movsx eax, byte ptr [ebp + 0xe]
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 69ded3: sub eax, ecx
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69ded5: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69ded9: fild dword ptr [esp + 0x10]
        R.st[0] = Math.abs(R.st[0]); // 69dedd: fabs 
        R.st[0] = R.st[0] * 0.006666666666666667; // 69dedf: fmul qword ptr [0x96d1d0]
        R.st[0] = 1.0 - R.st[0]; // 69dee5: fsubr qword ptr [0x967890]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 69deeb: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.5; // 69deef: fmul qword ptr [0x968940]
        R.ftol(); // 69def5: call 0x945640
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69defa: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69defe: fild dword ptr [esp + 0x10]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69df02: fmulp st(1)
        R.ftol(); // 69df04: call 0x945640
        R.edx = (((R.m.u8(((R.ebp + 0x12) | 0) >>> 0)) << 24 >> 24)) | 0; // 69df09: movsx edx, byte ptr [ebp + 0x12]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69df0d: mov dword ptr [esp + 0x10], eax
        R.eax = (((R.m.u8(((R.edi + 0x12) | 0) >>> 0)) << 24 >> 24)) | 0; // 69df11: movsx eax, byte ptr [edi + 0x12]
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69df15: fild dword ptr [esp + 0x10]
        R.edx = (R.sub((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 69df19: sub edx, eax
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edx >>> 0)); // 69df1b: mov dword ptr [esp + 0x10], edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69df1f: fild dword ptr [esp + 0x10]
        R.st[0] = Math.abs(R.st[0]); // 69df23: fabs 
        R.st[0] = R.st[0] * 0.01; // 69df25: fmul qword ptr [0x967898]
        R.st[0] = 1.0 - R.st[0]; // 69df2b: fsubr qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69df31: fmulp st(1)
        R.ftol(); // 69df33: call 0x945640
        R.ecx = (((R.m.u8(((R.ebp + 0x13) | 0) >>> 0)) << 24 >> 24)) | 0; // 69df38: movsx ecx, byte ptr [ebp + 0x13]
        R.edx = (((R.m.u8(((R.edi + 0x13) | 0) >>> 0)) << 24 >> 24)) | 0; // 69df3c: movsx edx, byte ptr [edi + 0x13]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69df40: mov dword ptr [esp + 0x10], eax
        R.ecx = (R.sub((R.ecx >>> 0), (R.edx >>> 0), 32)) | 0; // 69df44: sub ecx, edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69df46: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 69df4a: mov dword ptr [esp + 0x10], ecx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69df4e: fild dword ptr [esp + 0x10]
        R.st[0] = Math.abs(R.st[0]); // 69df52: fabs 
        R.st[0] = R.st[0] * 0.01; // 69df54: fmul qword ptr [0x967898]
        R.st[0] = 1.0 - R.st[0]; // 69df5a: fsubr qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69df60: fmulp st(1)
        R.ftol(); // 69df62: call 0x945640
        R.ecx = (((R.m.u8(((R.edi + 0x14) | 0) >>> 0)) << 24 >> 24)) | 0; // 69df67: movsx ecx, byte ptr [edi + 0x14]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69df6b: mov dword ptr [esp + 0x10], eax
        R.eax = (((R.m.u8(((R.ebp + 0x14) | 0) >>> 0)) << 24 >> 24)) | 0; // 69df6f: movsx eax, byte ptr [ebp + 0x14]
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69df73: fild dword ptr [esp + 0x10]
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 69df77: sub eax, ecx
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69df79: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69df7d: fild dword ptr [esp + 0x10]
        R.st[0] = Math.abs(R.st[0]); // 69df81: fabs 
        R.st[0] = R.st[0] * 0.0044444444444444444; // 69df83: fmul qword ptr [0x96d258]
        R.st[0] = 1.0 - R.st[0]; // 69df89: fsubr qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69df8f: fmulp st(1)
        R.ftol(); // 69df91: call 0x945640
        R.edx = (((R.m.u8(((R.ebp + 0x15) | 0) >>> 0)) << 24 >> 24)) | 0; // 69df96: movsx edx, byte ptr [ebp + 0x15]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69df9a: mov dword ptr [esp + 0x10], eax
        R.eax = (((R.m.u8(((R.edi + 0x15) | 0) >>> 0)) << 24 >> 24)) | 0; // 69df9e: movsx eax, byte ptr [edi + 0x15]
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69dfa2: fild dword ptr [esp + 0x10]
        R.edx = (R.sub((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 69dfa6: sub edx, eax
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edx >>> 0)); // 69dfa8: mov dword ptr [esp + 0x10], edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69dfac: fild dword ptr [esp + 0x10]
        R.st[0] = Math.abs(R.st[0]); // 69dfb0: fabs 
        R.st[0] = R.st[0] * 0.006666666666666667; // 69dfb2: fmul qword ptr [0x96d1d0]
        R.st[0] = 1.0 - R.st[0]; // 69dfb8: fsubr qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69dfbe: fmulp st(1)
        R.ftol(); // 69dfc0: call 0x945640
        R.ecx = (((R.m.u8(((R.ebp + 0x1a) | 0) >>> 0)) << 24 >> 24)) | 0; // 69dfc5: movsx ecx, byte ptr [ebp + 0x1a]
        R.edx = (((R.m.u8(((R.edi + 0x1a) | 0) >>> 0)) << 24 >> 24)) | 0; // 69dfc9: movsx edx, byte ptr [edi + 0x1a]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69dfcd: mov dword ptr [esp + 0x10], eax
        R.ecx = (R.sub((R.ecx >>> 0), (R.edx >>> 0), 32)) | 0; // 69dfd1: sub ecx, edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69dfd3: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 69dfd7: mov dword ptr [esp + 0x10], ecx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69dfdb: fild dword ptr [esp + 0x10]
        R.st[0] = Math.abs(R.st[0]); // 69dfdf: fabs 
        R.st[0] = R.st[0] * 0.01; // 69dfe1: fmul qword ptr [0x967898]
        R.st[0] = 1.0 - R.st[0]; // 69dfe7: fsubr qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69dfed: fmulp st(1)
        R.ftol(); // 69dfef: call 0x945640
        R.ecx = (((R.m.u8(((R.edi + 0x1c) | 0) >>> 0)) << 24 >> 24)) | 0; // 69dff4: movsx ecx, byte ptr [edi + 0x1c]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69dff8: mov dword ptr [esp + 0x10], eax
        R.eax = (((R.m.u8(((R.ebp + 0x1c) | 0) >>> 0)) << 24 >> 24)) | 0; // 69dffc: movsx eax, byte ptr [ebp + 0x1c]
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e000: fild dword ptr [esp + 0x10]
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 69e004: sub eax, ecx
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e006: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e00a: fild dword ptr [esp + 0x10]
        R.st[0] = Math.abs(R.st[0]); // 69e00e: fabs 
        R.st[0] = R.st[0] * 0.01; // 69e010: fmul qword ptr [0x967898]
        R.st[0] = 1.0 - R.st[0]; // 69e016: fsubr qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69e01c: fmulp st(1)
        R.ftol(); // 69e01e: call 0x945640
        R.edx = (((R.m.u8(((R.ebp + 0x1f) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e023: movsx edx, byte ptr [ebp + 0x1f]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e027: mov dword ptr [esp + 0x10], eax
        R.eax = (((R.m.u8(((R.edi + 0x1f) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e02b: movsx eax, byte ptr [edi + 0x1f]
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e02f: fild dword ptr [esp + 0x10]
        R.edx = (R.sub((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 69e033: sub edx, eax
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edx >>> 0)); // 69e035: mov dword ptr [esp + 0x10], edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e039: fild dword ptr [esp + 0x10]
        R.st[0] = Math.abs(R.st[0]); // 69e03d: fabs 
        R.st[0] = R.st[0] * 0.006666666666666667; // 69e03f: fmul qword ptr [0x96d1d0]
        R.st[0] = 1.0 - R.st[0]; // 69e045: fsubr qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69e04b: fmulp st(1)
        R.ftol(); // 69e04d: call 0x945640
        R.ecx = (((R.m.u8(((R.ebp + 0x22) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e052: movsx ecx, byte ptr [ebp + 0x22]
        R.edx = (((R.m.u8(((R.edi + 0x22) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e056: movsx edx, byte ptr [edi + 0x22]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e05a: mov dword ptr [esp + 0x10], eax
        R.ecx = (R.sub((R.ecx >>> 0), (R.edx >>> 0), 32)) | 0; // 69e05e: sub ecx, edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e060: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 69e064: mov dword ptr [esp + 0x10], ecx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e068: fild dword ptr [esp + 0x10]
        R.st[0] = Math.abs(R.st[0]); // 69e06c: fabs 
        R.st[0] = R.st[0] * 0.004; // 69e06e: fmul qword ptr [0x968d60]
        R.st[0] = 1.0 - R.st[0]; // 69e074: fsubr qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69e07a: fmulp st(1)
        R.ftol(); // 69e07c: call 0x945640
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.eax >>> 0)); // 69e081: mov dword ptr [esp + 0x14], eax
        pc = 0x69e085; continue;
      case 0x69e085:
        R.edi = (R.m.u32(((R.esi + 0x69) | 0) >>> 0)) | 0; // 69e085: mov edi, dword ptr [esi + 0x69]
        R.eax = (((R.m.u8(((R.edi + 0x11) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e088: movsx eax, byte ptr [edi + 0x11]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e08c: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e090: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.005; // 69e094: fmul qword ptr [0x968ef0]
        R.st[0] = R.st[0] + 1.0; // 69e09a: fadd qword ptr [0x967890]
        R.st[0] = R.st[0] * R.m.s32(((R.esp + 0x14) | 0) >>> 0); // 69e0a0: fimul dword ptr [esp + 0x14]
        R.ftol(); // 69e0a4: call 0x945640
        R.ecx = (((R.m.u8(((R.edi + 0x10) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e0a9: movsx ecx, byte ptr [edi + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e0ad: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e0b1: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 69e0b5: mov dword ptr [esp + 0x10], ecx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e0b9: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.005; // 69e0bd: fmul qword ptr [0x968ef0]
        R.st[0] = R.st[0] + 1.0; // 69e0c3: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69e0c9: fmulp st(1)
        R.ftol(); // 69e0cb: call 0x945640
        R.edx = (((R.m.u8(((R.edi + 0x17) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e0d0: movsx edx, byte ptr [edi + 0x17]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e0d4: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e0d8: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edx >>> 0)); // 69e0dc: mov dword ptr [esp + 0x10], edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e0e0: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.0013333333333333333; // 69e0e4: fmul qword ptr [0x96d250]
        R.st[0] = R.st[0] + 1.0; // 69e0ea: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69e0f0: fmulp st(1)
        R.ftol(); // 69e0f2: call 0x945640
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e0f7: mov dword ptr [esp + 0x10], eax
        R.eax = (((R.m.u8(((R.edi + 0x18) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e0fb: movsx eax, byte ptr [edi + 0x18]
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e0ff: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e103: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e107: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.0013333333333333333; // 69e10b: fmul qword ptr [0x96d250]
        R.st[0] = R.st[0] + 1.0; // 69e111: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69e117: fmulp st(1)
        R.ftol(); // 69e119: call 0x945640
        R.ecx = (((R.m.u8(((R.edi + 0x19) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e11e: movsx ecx, byte ptr [edi + 0x19]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e122: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e126: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 69e12a: mov dword ptr [esp + 0x10], ecx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e12e: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.0013333333333333333; // 69e132: fmul qword ptr [0x96d250]
        R.st[0] = R.st[0] + 1.0; // 69e138: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69e13e: fmulp st(1)
        R.ftol(); // 69e140: call 0x945640
        R.edx = (((R.m.u8(((R.edi + 0x1b) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e145: movsx edx, byte ptr [edi + 0x1b]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e149: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e14d: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edx >>> 0)); // 69e151: mov dword ptr [esp + 0x10], edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e155: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.0008333333333333334; // 69e159: fmul qword ptr [0x96d268]
        R.st[0] = R.st[0] + 1.0; // 69e15f: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69e165: fmulp st(1)
        R.ftol(); // 69e167: call 0x945640
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e16c: mov dword ptr [esp + 0x10], eax
        R.eax = (((R.m.u8(((R.edi + 0x21) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e170: movsx eax, byte ptr [edi + 0x21]
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e174: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e178: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e17c: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.004; // 69e180: fmul qword ptr [0x968d60]
        R.st[0] = R.st[0] + 1.0; // 69e186: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69e18c: fmulp st(1)
        R.ftol(); // 69e18e: call 0x945640
        R.ecx = (((R.m.u8(((R.esi + 0x59) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e193: movsx ecx, byte ptr [esi + 0x59]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e197: mov dword ptr [esp + 0x10], eax
        R.ecx = (R.sub((R.ecx >>> 0), 0xa, 32)) | 0; // 69e19b: sub ecx, 0xa
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e19e: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 69e1a2: mov dword ptr [esp + 0x10], ecx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e1a6: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.02; // 69e1aa: fmul qword ptr [0x968a98]
        R.st[0] = R.st[0] + 1.0; // 69e1b0: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69e1b6: fmulp st(1)
        R.ftol(); // 69e1b8: call 0x945640
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e1bd: mov dword ptr [esp + 0x10], eax
        R.edx = (((R.m.u8(((R.esi + 0x58) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e1c1: movsx edx, byte ptr [esi + 0x58]
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e1c5: fild dword ptr [esp + 0x10]
        R.edx = (R.sub((R.edx >>> 0), 0xa, 32)) | 0; // 69e1c9: sub edx, 0xa
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edx >>> 0)); // 69e1cc: mov dword ptr [esp + 0x10], edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e1d0: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.02; // 69e1d4: fmul qword ptr [0x968a98]
        R.st[0] = R.st[0] + 1.0; // 69e1da: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69e1e0: fmulp st(1)
        R.ftol(); // 69e1e2: call 0x945640
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e1e7: mov dword ptr [esp + 0x10], eax
        R.eax = (((R.m.u8(((R.esi + 0x5a) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e1eb: movsx eax, byte ptr [esi + 0x5a]
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e1ef: fild dword ptr [esp + 0x10]
        R.eax = (R.sub((R.eax >>> 0), 0xa, 32)) | 0; // 69e1f3: sub eax, 0xa
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e1f6: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e1fa: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.02; // 69e1fe: fmul qword ptr [0x968a98]
        R.st[0] = R.st[0] + 1.0; // 69e204: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69e20a: fmulp st(1)
        R.ftol(); // 69e20c: call 0x945640
        R.ecx = (((R.m.u8(((R.esi + 0x5b) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e211: movsx ecx, byte ptr [esi + 0x5b]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e215: mov dword ptr [esp + 0x10], eax
        R.ecx = (R.sub((R.ecx >>> 0), 0xa, 32)) | 0; // 69e219: sub ecx, 0xa
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e21c: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 69e220: mov dword ptr [esp + 0x10], ecx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e224: fild dword ptr [esp + 0x10]
        pc = 0x69e5a0; continue; // 69e228: jmp 0x69e5a0
      case 0x69e22d:
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 69e22d: test ebp, ebp
        if (R.zf) { pc = 0x69e3fc; continue; } // 69e22f: je 0x69e3fc
        pc = 0x69e235; continue;
      case 0x69e235:
        R.edx = (R.m.u32(((R.esp + 0xb4) | 0) >>> 0)) | 0; // 69e235: mov edx, dword ptr [esp + 0xb4]
        R.edi = (R.m.u32(((R.esi + 0x69) | 0) >>> 0)) | 0; // 69e23c: mov edi, dword ptr [esi + 0x69]
        R.ebp = (R.m.u32(((R.edx + 0x69) | 0) >>> 0)) | 0; // 69e23f: mov ebp, dword ptr [edx + 0x69]
        R.ecx = (((R.m.u8(((R.edi + 0xe) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e242: movsx ecx, byte ptr [edi + 0xe]
        R.eax = (((R.m.u8(((R.ebp + 0xe) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e246: movsx eax, byte ptr [ebp + 0xe]
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 69e24a: sub eax, ecx
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e24c: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e250: fild dword ptr [esp + 0x10]
        R.st[0] = Math.abs(R.st[0]); // 69e254: fabs 
        R.st[0] = R.st[0] * 0.002; // 69e256: fmul qword ptr [0x969048]
        R.st[0] = 1.0 - R.st[0]; // 69e25c: fsubr qword ptr [0x967890]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 69e262: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.5; // 69e266: fmul qword ptr [0x968940]
        R.ftol(); // 69e26c: call 0x945640
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e271: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e275: fild dword ptr [esp + 0x10]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69e279: fmulp st(1)
        R.ftol(); // 69e27b: call 0x945640
        R.edx = (((R.m.u8(((R.ebp + 0x12) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e280: movsx edx, byte ptr [ebp + 0x12]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e284: mov dword ptr [esp + 0x10], eax
        R.eax = (((R.m.u8(((R.edi + 0x12) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e288: movsx eax, byte ptr [edi + 0x12]
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e28c: fild dword ptr [esp + 0x10]
        R.edx = (R.sub((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 69e290: sub edx, eax
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edx >>> 0)); // 69e292: mov dword ptr [esp + 0x10], edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e296: fild dword ptr [esp + 0x10]
        R.st[0] = Math.abs(R.st[0]); // 69e29a: fabs 
        R.st[0] = R.st[0] * 0.002; // 69e29c: fmul qword ptr [0x969048]
        R.st[0] = 1.0 - R.st[0]; // 69e2a2: fsubr qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69e2a8: fmulp st(1)
        R.ftol(); // 69e2aa: call 0x945640
        R.ecx = (((R.m.u8(((R.ebp + 0x13) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e2af: movsx ecx, byte ptr [ebp + 0x13]
        R.edx = (((R.m.u8(((R.edi + 0x13) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e2b3: movsx edx, byte ptr [edi + 0x13]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e2b7: mov dword ptr [esp + 0x10], eax
        R.ecx = (R.sub((R.ecx >>> 0), (R.edx >>> 0), 32)) | 0; // 69e2bb: sub ecx, edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e2bd: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 69e2c1: mov dword ptr [esp + 0x10], ecx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e2c5: fild dword ptr [esp + 0x10]
        R.st[0] = Math.abs(R.st[0]); // 69e2c9: fabs 
        R.st[0] = R.st[0] * 0.002; // 69e2cb: fmul qword ptr [0x969048]
        R.st[0] = 1.0 - R.st[0]; // 69e2d1: fsubr qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69e2d7: fmulp st(1)
        R.ftol(); // 69e2d9: call 0x945640
        R.ecx = (((R.m.u8(((R.edi + 0x14) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e2de: movsx ecx, byte ptr [edi + 0x14]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e2e2: mov dword ptr [esp + 0x10], eax
        R.eax = (((R.m.u8(((R.ebp + 0x14) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e2e6: movsx eax, byte ptr [ebp + 0x14]
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e2ea: fild dword ptr [esp + 0x10]
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 69e2ee: sub eax, ecx
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e2f0: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e2f4: fild dword ptr [esp + 0x10]
        R.st[0] = Math.abs(R.st[0]); // 69e2f8: fabs 
        R.st[0] = R.st[0] * 0.002; // 69e2fa: fmul qword ptr [0x969048]
        R.st[0] = 1.0 - R.st[0]; // 69e300: fsubr qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69e306: fmulp st(1)
        R.ftol(); // 69e308: call 0x945640
        R.edx = (((R.m.u8(((R.ebp + 0x15) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e30d: movsx edx, byte ptr [ebp + 0x15]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e311: mov dword ptr [esp + 0x10], eax
        R.eax = (((R.m.u8(((R.edi + 0x15) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e315: movsx eax, byte ptr [edi + 0x15]
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e319: fild dword ptr [esp + 0x10]
        R.edx = (R.sub((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 69e31d: sub edx, eax
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edx >>> 0)); // 69e31f: mov dword ptr [esp + 0x10], edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e323: fild dword ptr [esp + 0x10]
        R.st[0] = Math.abs(R.st[0]); // 69e327: fabs 
        R.st[0] = R.st[0] * 0.002; // 69e329: fmul qword ptr [0x969048]
        R.st[0] = 1.0 - R.st[0]; // 69e32f: fsubr qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69e335: fmulp st(1)
        R.ftol(); // 69e337: call 0x945640
        R.ecx = (((R.m.u8(((R.ebp + 0x1a) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e33c: movsx ecx, byte ptr [ebp + 0x1a]
        R.edx = (((R.m.u8(((R.edi + 0x1a) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e340: movsx edx, byte ptr [edi + 0x1a]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e344: mov dword ptr [esp + 0x10], eax
        R.ecx = (R.sub((R.ecx >>> 0), (R.edx >>> 0), 32)) | 0; // 69e348: sub ecx, edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e34a: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 69e34e: mov dword ptr [esp + 0x10], ecx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e352: fild dword ptr [esp + 0x10]
        R.st[0] = Math.abs(R.st[0]); // 69e356: fabs 
        R.st[0] = R.st[0] * 0.002; // 69e358: fmul qword ptr [0x969048]
        R.st[0] = 1.0 - R.st[0]; // 69e35e: fsubr qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69e364: fmulp st(1)
        R.ftol(); // 69e366: call 0x945640
        R.ecx = (((R.m.u8(((R.edi + 0x1c) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e36b: movsx ecx, byte ptr [edi + 0x1c]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e36f: mov dword ptr [esp + 0x10], eax
        R.eax = (((R.m.u8(((R.ebp + 0x1c) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e373: movsx eax, byte ptr [ebp + 0x1c]
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e377: fild dword ptr [esp + 0x10]
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 69e37b: sub eax, ecx
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e37d: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e381: fild dword ptr [esp + 0x10]
        R.st[0] = Math.abs(R.st[0]); // 69e385: fabs 
        R.st[0] = R.st[0] * 0.002; // 69e387: fmul qword ptr [0x969048]
        R.st[0] = 1.0 - R.st[0]; // 69e38d: fsubr qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69e393: fmulp st(1)
        R.ftol(); // 69e395: call 0x945640
        R.edx = (((R.m.u8(((R.ebp + 0x1f) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e39a: movsx edx, byte ptr [ebp + 0x1f]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e39e: mov dword ptr [esp + 0x10], eax
        R.eax = (((R.m.u8(((R.edi + 0x1f) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e3a2: movsx eax, byte ptr [edi + 0x1f]
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e3a6: fild dword ptr [esp + 0x10]
        R.edx = (R.sub((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 69e3aa: sub edx, eax
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edx >>> 0)); // 69e3ac: mov dword ptr [esp + 0x10], edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e3b0: fild dword ptr [esp + 0x10]
        R.st[0] = Math.abs(R.st[0]); // 69e3b4: fabs 
        R.st[0] = R.st[0] * 0.002; // 69e3b6: fmul qword ptr [0x969048]
        R.st[0] = 1.0 - R.st[0]; // 69e3bc: fsubr qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69e3c2: fmulp st(1)
        R.ftol(); // 69e3c4: call 0x945640
        R.ecx = (((R.m.u8(((R.ebp + 0x22) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e3c9: movsx ecx, byte ptr [ebp + 0x22]
        R.edx = (((R.m.u8(((R.edi + 0x22) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e3cd: movsx edx, byte ptr [edi + 0x22]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e3d1: mov dword ptr [esp + 0x10], eax
        R.ecx = (R.sub((R.ecx >>> 0), (R.edx >>> 0), 32)) | 0; // 69e3d5: sub ecx, edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e3d7: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 69e3db: mov dword ptr [esp + 0x10], ecx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e3df: fild dword ptr [esp + 0x10]
        R.st[0] = Math.abs(R.st[0]); // 69e3e3: fabs 
        R.st[0] = R.st[0] * 0.002; // 69e3e5: fmul qword ptr [0x969048]
        R.st[0] = 1.0 - R.st[0]; // 69e3eb: fsubr qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69e3f1: fmulp st(1)
        R.ftol(); // 69e3f3: call 0x945640
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.eax >>> 0)); // 69e3f8: mov dword ptr [esp + 0x14], eax
        pc = 0x69e3fc; continue;
      case 0x69e3fc:
        R.edi = (R.m.u32(((R.esi + 0x69) | 0) >>> 0)) | 0; // 69e3fc: mov edi, dword ptr [esi + 0x69]
        R.eax = (((R.m.u8(((R.edi + 0x17) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e3ff: movsx eax, byte ptr [edi + 0x17]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e403: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e407: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.005; // 69e40b: fmul qword ptr [0x968ef0]
        R.st[0] = R.st[0] + 1.0; // 69e411: fadd qword ptr [0x967890]
        R.st[0] = R.st[0] * R.m.s32(((R.esp + 0x14) | 0) >>> 0); // 69e417: fimul dword ptr [esp + 0x14]
        R.ftol(); // 69e41b: call 0x945640
        R.ecx = (((R.m.u8(((R.edi + 0x18) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e420: movsx ecx, byte ptr [edi + 0x18]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e424: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e428: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 69e42c: mov dword ptr [esp + 0x10], ecx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e430: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.005; // 69e434: fmul qword ptr [0x968ef0]
        R.st[0] = R.st[0] + 1.0; // 69e43a: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69e440: fmulp st(1)
        R.ftol(); // 69e442: call 0x945640
        R.edx = (((R.m.u8(((R.esi + 0x59) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e447: movsx edx, byte ptr [esi + 0x59]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e44b: mov dword ptr [esp + 0x10], eax
        R.edx = (R.sub((R.edx >>> 0), 0xa, 32)) | 0; // 69e44f: sub edx, 0xa
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e452: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edx >>> 0)); // 69e456: mov dword ptr [esp + 0x10], edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e45a: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.002; // 69e45e: fmul qword ptr [0x969048]
        R.st[0] = R.st[0] + 1.0; // 69e464: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69e46a: fmulp st(1)
        R.ftol(); // 69e46c: call 0x945640
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e471: mov dword ptr [esp + 0x10], eax
        R.eax = (((R.m.u8(((R.esi + 0x58) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e475: movsx eax, byte ptr [esi + 0x58]
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e479: fild dword ptr [esp + 0x10]
        R.eax = (R.sub((R.eax >>> 0), 0xa, 32)) | 0; // 69e47d: sub eax, 0xa
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e480: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e484: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.002; // 69e488: fmul qword ptr [0x969048]
        R.st[0] = R.st[0] + 1.0; // 69e48e: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69e494: fmulp st(1)
        R.ftol(); // 69e496: call 0x945640
        R.ecx = (((R.m.u8(((R.esi + 0x5a) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e49b: movsx ecx, byte ptr [esi + 0x5a]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e49f: mov dword ptr [esp + 0x10], eax
        R.ecx = (R.sub((R.ecx >>> 0), 0xa, 32)) | 0; // 69e4a3: sub ecx, 0xa
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e4a6: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 69e4aa: mov dword ptr [esp + 0x10], ecx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e4ae: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.002; // 69e4b2: fmul qword ptr [0x969048]
        R.st[0] = R.st[0] + 1.0; // 69e4b8: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69e4be: fmulp st(1)
        R.ftol(); // 69e4c0: call 0x945640
        R.edx = (((R.m.u8(((R.esi + 0x5b) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e4c5: movsx edx, byte ptr [esi + 0x5b]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e4c9: mov dword ptr [esp + 0x10], eax
        R.edx = (R.sub((R.edx >>> 0), 0xa, 32)) | 0; // 69e4cd: sub edx, 0xa
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e4d0: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edx >>> 0)); // 69e4d4: mov dword ptr [esp + 0x10], edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e4d8: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.002; // 69e4dc: fmul qword ptr [0x969048]
        pc = 0x69e5a6; continue; // 69e4e2: jmp 0x69e5a6
      case 0x69e4e7:
        R.eax = (R.m.u32(((R.esi + 0x69) | 0) >>> 0)) | 0; // 69e4e7: mov eax, dword ptr [esi + 0x69]
        R.ecx = (((R.m.u8(((R.eax + 0x1e) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e4ea: movsx ecx, byte ptr [eax + 0x1e]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 69e4ee: mov dword ptr [esp + 0x10], ecx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e4f2: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.01; // 69e4f6: fmul qword ptr [0x967898]
        R.st[0] = R.st[0] + 1.0; // 69e4fc: fadd qword ptr [0x967890]
        R.st[0] = R.st[0] * R.m.s32(((R.esp + 0x14) | 0) >>> 0); // 69e502: fimul dword ptr [esp + 0x14]
        R.ftol(); // 69e506: call 0x945640
        R.edx = (((R.m.u8(((R.esi + 0x59) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e50b: movsx edx, byte ptr [esi + 0x59]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e50f: mov dword ptr [esp + 0x10], eax
        R.edx = (R.sub((R.edx >>> 0), 0xa, 32)) | 0; // 69e513: sub edx, 0xa
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e516: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edx >>> 0)); // 69e51a: mov dword ptr [esp + 0x10], edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e51e: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.02; // 69e522: fmul qword ptr [0x968a98]
        R.st[0] = R.st[0] + 1.0; // 69e528: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69e52e: fmulp st(1)
        R.ftol(); // 69e530: call 0x945640
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e535: mov dword ptr [esp + 0x10], eax
        R.eax = (((R.m.u8(((R.esi + 0x58) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e539: movsx eax, byte ptr [esi + 0x58]
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e53d: fild dword ptr [esp + 0x10]
        R.eax = (R.sub((R.eax >>> 0), 0xa, 32)) | 0; // 69e541: sub eax, 0xa
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e544: mov dword ptr [esp + 0x10], eax
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e548: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.02; // 69e54c: fmul qword ptr [0x968a98]
        R.st[0] = R.st[0] + 1.0; // 69e552: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69e558: fmulp st(1)
        R.ftol(); // 69e55a: call 0x945640
        R.ecx = (((R.m.u8(((R.esi + 0x5a) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e55f: movsx ecx, byte ptr [esi + 0x5a]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e563: mov dword ptr [esp + 0x10], eax
        R.ecx = (R.sub((R.ecx >>> 0), 0xa, 32)) | 0; // 69e567: sub ecx, 0xa
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e56a: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 69e56e: mov dword ptr [esp + 0x10], ecx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e572: fild dword ptr [esp + 0x10]
        R.st[0] = R.st[0] * 0.02; // 69e576: fmul qword ptr [0x968a98]
        R.st[0] = R.st[0] + 1.0; // 69e57c: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69e582: fmulp st(1)
        R.ftol(); // 69e584: call 0x945640
        R.edx = (((R.m.u8(((R.esi + 0x5b) | 0) >>> 0)) << 24 >> 24)) | 0; // 69e589: movsx edx, byte ptr [esi + 0x5b]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e58d: mov dword ptr [esp + 0x10], eax
        R.edx = (R.sub((R.edx >>> 0), 0xa, 32)) | 0; // 69e591: sub edx, 0xa
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e594: fild dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edx >>> 0)); // 69e598: mov dword ptr [esp + 0x10], edx
        R.fpush(R.m.s32(((R.esp + 0x10) | 0) >>> 0)); // 69e59c: fild dword ptr [esp + 0x10]
        pc = 0x69e5a0; continue;
      case 0x69e5a0:
        R.st[0] = R.st[0] * 0.02; // 69e5a0: fmul qword ptr [0x968a98]
        pc = 0x69e5a6; continue;
      case 0x69e5a6:
        R.st[0] = R.st[0] + 1.0; // 69e5a6: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 69e5ac: fmulp st(1)
        R.ftol(); // 69e5ae: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 69e5b3: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 69e5b5: mov dword ptr [esp + 0x14], edi
        pc = 0x69e5b9; continue;
      case 0x69e5b9:
        R.eax = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 69e5b9: mov eax, dword ptr [esi + 0x39]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69e5bc: test eax, eax
        if (R.zf) { pc = 0x69e5ca; continue; } // 69e5be: je 0x69e5ca
        pc = 0x69e5c0; continue;
      case 0x69e5c0:
        R.eax = (R.m.u32(((R.eax + 0x53) | 0) >>> 0)) | 0; // 69e5c0: mov eax, dword ptr [eax + 0x53]
        R.ecx = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 69e5c3: mov ecx, dword ptr [ebx + 0x53]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 69e5c6: cmp eax, ecx
        if (R.zf) { pc = 0x69e5e2; continue; } // 69e5c8: je 0x69e5e2
        pc = 0x69e5ca; continue;
      case 0x69e5ca:
        R.eax = (R.m.u32(((R.esi + 0x24) | 0) >>> 0)) | 0; // 69e5ca: mov eax, dword ptr [esi + 0x24]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69e5cd: test eax, eax
        if (R.zf) { pc = 0x69e5db; continue; } // 69e5cf: je 0x69e5db
        pc = 0x69e5d1; continue;
      case 0x69e5d1:
        R.eax = (R.m.u32(((R.eax + 0x53) | 0) >>> 0)) | 0; // 69e5d1: mov eax, dword ptr [eax + 0x53]
        R.ecx = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 69e5d4: mov ecx, dword ptr [ebx + 0x53]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 69e5d7: cmp eax, ecx
        if (R.zf) { pc = 0x69e5e2; continue; } // 69e5d9: je 0x69e5e2
        pc = 0x69e5db; continue;
      case 0x69e5db:
        R.eax = (R.m.u32(((R.esi + 0x1a) | 0) >>> 0)) | 0; // 69e5db: mov eax, dword ptr [esi + 0x1a]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69e5de: test eax, eax
        if (R.zf) { pc = 0x69e5e6; continue; } // 69e5e0: je 0x69e5e6
        pc = 0x69e5e2; continue;
      case 0x69e5e2:
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 69e5e2: mov dword ptr [esp + 0x10], eax
        pc = 0x69e5e6; continue;
      case 0x69e5e6:
        R.sub(R.m.u16(((R.ebx + 0x80) | 0) >>> 0), 0x128e, 16); // 69e5e6: cmp word ptr [ebx + 0x80], 0x128e
        if (R.cLE) { pc = 0x69e6cf; continue; } // 69e5ef: jle 0x69e6cf
        pc = 0x69e5f5; continue;
      case 0x69e5f5:
        R.eax = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 69e5f5: mov eax, dword ptr [ebx + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69e5f8: test eax, eax
        if (R.zf) { pc = 0x69e6cf; continue; } // 69e5fa: je 0x69e6cf
        pc = 0x69e600; continue;
      case 0x69e600:
        R.ecx = (R.m.u32(((R.esi + 0x1a) | 0) >>> 0)) | 0; // 69e600: mov ecx, dword ptr [esi + 0x1a]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 69e603: test ecx, ecx
        if (R.zf) { pc = 0x69e6cf; continue; } // 69e605: je 0x69e6cf
        pc = 0x69e60b; continue;
      case 0x69e60b:
        R.push(0x1); // 69e60b: push 1
        R.push((R.eax >>> 0)); // 69e60d: push eax
        R.push((R.esi >>> 0)); // 69e60e: push esi
        R.call(0x53d980, { n: 3, thisEcx: false, calleeClean: false }); // 69e60f: call 0x53d980
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 69e614: add esp, 0xc
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69e617: test eax, eax
        if (R.zf) { pc = 0x69e6cf; continue; } // 69e619: je 0x69e6cf
        pc = 0x69e61f; continue;
      case 0x69e61f:
        R.eax = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 69e61f: mov eax, dword ptr [esi + 0x39]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69e622: test eax, eax
        if (R.zf) { pc = 0x69e634; continue; } // 69e624: je 0x69e634
        pc = 0x69e626; continue;
      case 0x69e626:
        R.ecx = (R.m.u32(((R.eax + 0x53) | 0) >>> 0)) | 0; // 69e626: mov ecx, dword ptr [eax + 0x53]
        R.edx = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 69e629: mov edx, dword ptr [ebx + 0x53]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 69e62c: cmp ecx, edx
        if (R.zf) { pc = 0x69e6cf; continue; } // 69e62e: je 0x69e6cf
        pc = 0x69e634; continue;
      case 0x69e634:
        R.edx = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 69e634: mov edx, dword ptr [ebx + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69e637: test eax, eax
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.edx + 0x85) | 0) >>> 0)) & 0xff) << 0)) | 0; // 69e639: mov cl, byte ptr [edx + 0x85]
        R.edx = (R.m.u32(((R.esi + 0x1a) | 0) >>> 0)) | 0; // 69e63f: mov edx, dword ptr [esi + 0x1a]
        R.m.w8(((R.esp + 0x1b) | 0) >>> 0, ((R.ecx >>> 0) & 0xff)); // 69e642: mov byte ptr [esp + 0x1b], cl
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.edx + 0x85) | 0) >>> 0)) & 0xff) << 0)) | 0; // 69e646: mov cl, byte ptr [edx + 0x85]
        if (R.zf) { pc = 0x69e670; continue; } // 69e64c: je 0x69e670
        pc = 0x69e64e; continue;
      case 0x69e64e:
        R.ebp = (R.m.u32(((R.eax + 0x53) | 0) >>> 0)) | 0; // 69e64e: mov ebp, dword ptr [eax + 0x53]
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 69e651: test ebp, ebp
        if (R.zf) { pc = 0x69e661; continue; } // 69e653: je 0x69e661
        pc = 0x69e655; continue;
      case 0x69e655:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.ebp + 0x85) | 0) >>> 0)) & 0xff) << 0)) | 0; // 69e655: mov dl, byte ptr [ebp + 0x85]
        R.sub(((R.edx >>> 0) & 0xff), ((R.ecx >>> 0) & 0xff), 8); // 69e65b: cmp dl, cl
        if (R.cLE) { pc = 0x69e661; continue; } // 69e65d: jle 0x69e661
        pc = 0x69e65f; continue;
      case 0x69e65f:
        R.ecx = ((R.ecx & 0xffffff00) | (((((R.edx >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 69e65f: mov cl, dl
        pc = 0x69e661; continue;
      case 0x69e661:
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69e661: test eax, eax
        if (R.zf) { pc = 0x69e670; continue; } // 69e663: je 0x69e670
        pc = 0x69e665; continue;
      case 0x69e665:
        R.sub(R.m.u16(((R.eax + 0x80) | 0) >>> 0), 0x1a5e, 16); // 69e665: cmp word ptr [eax + 0x80], 0x1a5e
        if (!R.cL) { pc = 0x69e6cf; continue; } // 69e66e: jge 0x69e6cf
        pc = 0x69e670; continue;
      case 0x69e670:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x1b) | 0) >>> 0)) & 0xff) << 0)) | 0; // 69e670: mov al, byte ptr [esp + 0x1b]
        R.sub(((R.ecx >>> 0) & 0xff), ((R.eax >>> 0) & 0xff), 8); // 69e674: cmp cl, al
        if (!R.cL) { pc = 0x69e6cf; continue; } // 69e676: jge 0x69e6cf
        pc = 0x69e678; continue;
      case 0x69e678:
        R.ecx = (((((R.ecx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 69e678: movsx ecx, cl
        R.edx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 69e67b: movsx edx, al
        R.ecx = (R.sub((R.ecx >>> 0), (R.edx >>> 0), 32)) | 0; // 69e67e: sub ecx, edx
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ecx >>> 0)); // 69e680: mov dword ptr [esp + 0x1c], ecx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 69e684: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 0.025; // 69e688: fmul qword ptr [0x967878]
        R.st[0] = R.st[0] + 1.0; // 69e68e: fadd qword ptr [0x967890]
        R.fcom(R.st[0], 0.75); // 69e694: fcom qword ptr [0x969040]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 69e69a: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 69e69c: test ah, 1
        if (R.zf) { pc = 0x69e6a9; continue; } // 69e69f: je 0x69e6a9
        pc = 0x69e6a1; continue;
      case 0x69e6a1:
        R.fpop(); // 69e6a1: fstp st(0)
        R.fpush(0.75); // 69e6a3: fld dword ptr [0x96d248]
        pc = 0x69e6a9; continue;
      case 0x69e6a9:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x1a) | 0) >>> 0)) & 0xff) << 0)) | 0; // 69e6a9: mov al, byte ptr [esp + 0x1a]
        R.sub(((R.eax >>> 0) & 0xff), 0xc, 8); // 69e6ad: cmp al, 0xc
        if (R.zf) { pc = 0x69e6bc; continue; } // 69e6af: je 0x69e6bc
        pc = 0x69e6b1; continue;
      case 0x69e6b1:
        R.sub(((R.eax >>> 0) & 0xff), 0x5, 8); // 69e6b1: cmp al, 5
        if (R.zf) { pc = 0x69e6bc; continue; } // 69e6b3: je 0x69e6bc
        pc = 0x69e6b5; continue;
      case 0x69e6b5:
        R.fpop(); // 69e6b5: fstp st(0)
        pc = 0x69d5fc; continue; // 69e6b7: jmp 0x69d5fc
      case 0x69e6bc:
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 69e6bc: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * R.st[1]; // 69e6c0: fmul st(1)
        R.ftol(); // 69e6c2: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 69e6c7: mov edi, eax
        R.fpop(); // 69e6c9: fstp st(0)
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 69e6cb: mov dword ptr [esp + 0x14], edi
        pc = 0x69e6cf; continue;
      case 0x69e6cf:
        R.push((R.ebx >>> 0)); // 69e6cf: push ebx
        R.call(0x53b900, { n: 1, thisEcx: false, calleeClean: false }); // 69e6d0: call 0x53b900
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 69e6d5: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69e6d8: test eax, eax
        if (R.zf) { pc = 0x69e8a6; continue; } // 69e6da: je 0x69e8a6
        pc = 0x69e6e0; continue;
      case 0x69e6e0:
        R.eax = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 69e6e0: mov eax, dword ptr [ebx + 0x53]
        R.ecx = (R.m.u32(((R.esi + 0x1a) | 0) >>> 0)) | 0; // 69e6e3: mov ecx, dword ptr [esi + 0x1a]
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 69e6e6: cmp ecx, eax
        if (!R.zf) { pc = 0x69e719; continue; } // 69e6e8: jne 0x69e719
        pc = 0x69e6ea; continue;
      case 0x69e6ea:
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 69e6ea: fild dword ptr [esp + 0x14]
        R.edi = (R.add((R.edi >>> 0), 0x7d0, 32)) | 0; // 69e6ee: add edi, 0x7d0
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edi >>> 0)); // 69e6f4: mov dword ptr [esp + 0x1c], edi
        R.st[0] = R.st[0] * 1.2; // 69e6f8: fmul qword ptr [0x968978]
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 69e6fe: fild dword ptr [esp + 0x1c]
        R.m.wf64(((R.esp + 0x24) | 0) >>> 0, R.st[0]); R.fpop(); // 69e702: fstp qword ptr [esp + 0x24]
        R.fcom(R.st[0], R.f64(((R.esp + 0x24) | 0))); // 69e706: fcom qword ptr [esp + 0x24]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 69e70a: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 69e70c: test ah, 0x41
        if (R.zf) { pc = 0x69e754; continue; } // 69e70f: je 0x69e754
        pc = 0x69e711; continue;
      case 0x69e711:
        R.fpop(); // 69e711: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x24) | 0))); // 69e713: fld qword ptr [esp + 0x24]
        pc = 0x69e754; continue; // 69e717: jmp 0x69e754
      case 0x69e719:
        R.push(0x1); // 69e719: push 1
        R.push((R.eax >>> 0)); // 69e71b: push eax
        R.push((R.esi >>> 0)); // 69e71c: push esi
        R.call(0x53d980, { n: 3, thisEcx: false, calleeClean: false }); // 69e71d: call 0x53d980
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 69e722: add esp, 0xc
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69e725: test eax, eax
        if (!R.zf) { pc = 0x69e74a; continue; } // 69e727: jne 0x69e74a
        pc = 0x69e729; continue;
      case 0x69e729:
        R.eax = (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 69e729: movsx eax, word ptr [ebx + 0x80]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 69e730: mov dword ptr [esp + 0x1c], eax
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 69e734: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 2.5e-05; // 69e738: fmul qword ptr [0x96d240]
        R.st[0] = 0.75 - R.st[0]; // 69e73e: fsubr qword ptr [0x969040]
        R.st[0] = R.st[0] * R.m.s32(((R.esp + 0x14) | 0) >>> 0); // 69e744: fimul dword ptr [esp + 0x14]
        pc = 0x69e754; continue; // 69e748: jmp 0x69e754
      case 0x69e74a:
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 69e74a: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.35; // 69e74e: fmul qword ptr [0x969510]
        pc = 0x69e754; continue;
      case 0x69e754:
        R.ftol(); // 69e754: call 0x945640
        R.sub(R.m.u16(((R.ebx + 0x80) | 0) >>> 0), 0x186a, 16); // 69e759: cmp word ptr [ebx + 0x80], 0x186a
        R.edi = ((R.eax >>> 0)) | 0; // 69e762: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 69e764: mov dword ptr [esp + 0x14], edi
        if (R.cLE) { pc = 0x69e7f1; continue; } // 69e768: jle 0x69e7f1
        pc = 0x69e76e; continue;
      case 0x69e76e:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x1a) | 0) >>> 0)) & 0xff) << 0)) | 0; // 69e76e: mov al, byte ptr [esp + 0x1a]
        R.sub(((R.eax >>> 0) & 0xff), 0xc, 8); // 69e772: cmp al, 0xc
        if (R.zf) { pc = 0x69e797; continue; } // 69e774: je 0x69e797
        pc = 0x69e776; continue;
      case 0x69e776:
        R.sub(((R.eax >>> 0) & 0xff), 0x5, 8); // 69e776: cmp al, 5
        if (R.zf) { pc = 0x69e797; continue; } // 69e778: je 0x69e797
        pc = 0x69e77a; continue;
      case 0x69e77a:
        R.ecx = (R.m.u32(((R.esi + 0x69) | 0) >>> 0)) | 0; // 69e77a: mov ecx, dword ptr [esi + 0x69]
        R.edx = (((R.m.u16(((R.ecx + 0xc) | 0) >>> 0)) << 16 >> 16)) | 0; // 69e77d: movsx edx, word ptr [ecx + 0xc]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 69e781: mov dword ptr [esp + 0x1c], edx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 69e785: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 2.5e-05; // 69e789: fmul qword ptr [0x96d240]
        R.st[0] = R.st[0] + 0.5; // 69e78f: fadd qword ptr [0x968968]
        pc = 0x69e7e2; continue; // 69e795: jmp 0x69e7e2
      case 0x69e797:
        R.eax = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 69e797: mov eax, dword ptr [ebx + 0x53]
        R.push(0x1); // 69e79a: push 1
        R.push((R.eax >>> 0)); // 69e79c: push eax
        R.push((R.esi >>> 0)); // 69e79d: push esi
        R.call(0x53d980, { n: 3, thisEcx: false, calleeClean: false }); // 69e79e: call 0x53d980
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 69e7a3: add esp, 0xc
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69e7a6: test eax, eax
        if (R.zf) { pc = 0x69e7c7; continue; } // 69e7a8: je 0x69e7c7
        pc = 0x69e7aa; continue;
      case 0x69e7aa:
        R.ecx = (R.m.u32(((R.esi + 0x69) | 0) >>> 0)) | 0; // 69e7aa: mov ecx, dword ptr [esi + 0x69]
        R.edx = (((R.m.u16(((R.ecx + 0xc) | 0) >>> 0)) << 16 >> 16)) | 0; // 69e7ad: movsx edx, word ptr [ecx + 0xc]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 69e7b1: mov dword ptr [esp + 0x1c], edx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 69e7b5: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 5e-05; // 69e7b9: fmul qword ptr [0x96d238]
        R.st[0] = R.st[0] + 0.5; // 69e7bf: fadd qword ptr [0x968968]
        pc = 0x69e7e2; continue; // 69e7c5: jmp 0x69e7e2
      case 0x69e7c7:
        R.eax = (R.m.u32(((R.esi + 0x69) | 0) >>> 0)) | 0; // 69e7c7: mov eax, dword ptr [esi + 0x69]
        R.ecx = (((R.m.u16(((R.eax + 0xc) | 0) >>> 0)) << 16 >> 16)) | 0; // 69e7ca: movsx ecx, word ptr [eax + 0xc]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ecx >>> 0)); // 69e7ce: mov dword ptr [esp + 0x1c], ecx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 69e7d2: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 2.5e-05; // 69e7d6: fmul qword ptr [0x96d240]
        R.st[0] = R.st[0] + 0.75; // 69e7dc: fadd qword ptr [0x969040]
        pc = 0x69e7e2; continue;
      case 0x69e7e2:
        R.st[0] = R.st[0] * R.m.s32(((R.esp + 0x14) | 0) >>> 0); // 69e7e2: fimul dword ptr [esp + 0x14]
        R.ftol(); // 69e7e6: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 69e7eb: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 69e7ed: mov dword ptr [esp + 0x14], edi
        pc = 0x69e7f1; continue;
      case 0x69e7f1:
        R.edx = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 69e7f1: mov edx, dword ptr [0xae2364]
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 69e7f7: mov eax, dword ptr [esi]
        R.edx = (R.add((R.edx >>> 0), 0xfffffff0, 32)) | 0; // 69e7f9: add edx, -0x10
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 69e7fc: cmp eax, edx
        if (R.cL) { pc = 0x69ea31; continue; } // 69e7fe: jl 0x69ea31
        pc = 0x69e804; continue;
      case 0x69e804:
        R.eax = (R.m.u32(((R.esp + 0xb4) | 0) >>> 0)) | 0; // 69e804: mov eax, dword ptr [esp + 0xb4]
        R.push(0x1); // 69e80b: push 1
        R.push((R.eax >>> 0)); // 69e80d: push eax
        R.push((R.esi >>> 0)); // 69e80e: push esi
        R.call(0x5407e0, { n: 3, thisEcx: false, calleeClean: false }); // 69e80f: call 0x5407e0
        R.ebp = ((R.eax >>> 0)) | 0; // 69e814: mov ebp, eax
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 69e816: add esp, 0xc
        R.sub(((R.ebp >>> 0) & 0xffff), 0x109a, 16); // 69e819: cmp bp, 0x109a
        if (!R.cL) { pc = 0x69e824; continue; } // 69e81e: jge 0x69e824
        pc = 0x69e820; continue;
      case 0x69e820:
        R.edi = (R.logic((R.edi >>> 0) ^ (R.edi >>> 0), 32)) | 0; // 69e820: xor edi, edi
        pc = 0x69e83c; continue; // 69e822: jmp 0x69e83c
      case 0x69e824:
        R.sub(((R.ebp >>> 0) & 0xffff), 0x1a5e, 16); // 69e824: cmp bp, 0x1a5e
        if (!R.cL) { pc = 0x69e840; continue; } // 69e829: jge 0x69e840
        pc = 0x69e82b; continue;
      case 0x69e82b:
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 69e82b: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.75; // 69e82f: fmul qword ptr [0x969040]
        R.ftol(); // 69e835: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 69e83a: mov edi, eax
        pc = 0x69e83c; continue;
      case 0x69e83c:
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 69e83c: mov dword ptr [esp + 0x14], edi
        pc = 0x69e840; continue;
      case 0x69e840:
        R.sub(((R.ebp >>> 0) & 0xffff), 0x1c52, 16); // 69e840: cmp bp, 0x1c52
        if (!R.cL) { pc = 0x69ea31; continue; } // 69e845: jge 0x69ea31
        pc = 0x69e84b; continue;
      case 0x69e84b:
        R.push(0xffffffff); // 69e84b: push -1
        R.push(0x7d3); // 69e84d: push 0x7d3
        R.push(0x6); // 69e852: push 6
        R.push(0x17); // 69e854: push 0x17
        R.ecx = (((R.esp + 0x2c) | 0)) | 0; // 69e856: lea ecx, [esp + 0x2c]
        R.call(0x549f70, { n: 4, thisEcx: true, calleeClean: true }); // 69e85a: call 0x549f70
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 69e85f: mov ecx, dword ptr [eax]
        R.edx = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 69e861: mov edx, dword ptr [eax + 4]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.ecx >>> 0)); // 69e864: mov dword ptr [esp + 0x24], ecx
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.esp + 0x26) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 69e868: mov ax, word ptr [esp + 0x26]
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.edx >>> 0)); // 69e86d: mov dword ptr [esp + 0x28], edx
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 69e871: mov dx, word ptr [0xae2c92]
        R.sub(((R.eax >>> 0) & 0xffff), ((R.edx >>> 0) & 0xffff), 16); // 69e878: cmp ax, dx
        if (!R.cBE) { pc = 0x69e897; continue; } // 69e87b: ja 0x69e897
        pc = 0x69e87d; continue;
      case 0x69e87d:
        if (R.cf) { pc = 0x69ea31; continue; } // 69e87d: jb 0x69ea31
        pc = 0x69e883; continue;
      case 0x69e883:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 69e883: xor eax, eax
        R.sub(((R.ecx >>> 0) & 0xffff), R.m.u16(((0xae2c90) | 0) >>> 0), 16); // 69e885: cmp cx, word ptr [0xae2c90]
        R.eax = ((R.eax & 0xffffff00) | (((!R.cLE ? 1 : 0) & 0xff) << 0)) | 0; // 69e88c: setg al
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69e88f: test eax, eax
        if (R.zf) { pc = 0x69ea31; continue; } // 69e891: je 0x69ea31
        pc = 0x69e897; continue;
      case 0x69e897:
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 69e897: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.75; // 69e89b: fmul qword ptr [0x969040]
        pc = 0x69ea26; continue; // 69e8a1: jmp 0x69ea26
      case 0x69e8a6:
        R.ebp = ((R.ebp & 0xffff0000) | (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 69e8a6: mov bp, word ptr [ebx + 0x80]
        R.sub(((R.ebp >>> 0) & 0xffff), 0x1c52, 16); // 69e8ad: cmp bp, 0x1c52
        if (R.cLE) { pc = 0x69e9ea; continue; } // 69e8b2: jle 0x69e9ea
        pc = 0x69e8b8; continue;
      case 0x69e8b8:
        R.eax = (R.m.u32(((R.ebx + 0x57) | 0) >>> 0)) | 0; // 69e8b8: mov eax, dword ptr [ebx + 0x57]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69e8bb: test eax, eax
        if (R.zf) { pc = 0x69e9ea; continue; } // 69e8bd: je 0x69e9ea
        pc = 0x69e8c3; continue;
      case 0x69e8c3:
        R.eax = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 69e8c3: mov eax, dword ptr [ebx + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69e8c6: test eax, eax
        if (R.zf) { pc = 0x69e9ea; continue; } // 69e8c8: je 0x69e9ea
        pc = 0x69e8ce; continue;
      case 0x69e8ce:
        R.sub(R.m.u8(((R.eax + 0x85) | 0) >>> 0), 0xa, 8); // 69e8ce: cmp byte ptr [eax + 0x85], 0xa
        if (R.cLE) { pc = 0x69e9ea; continue; } // 69e8d5: jle 0x69e9ea
        pc = 0x69e8db; continue;
      case 0x69e8db:
        R.eax = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 69e8db: mov eax, dword ptr [esi + 0x39]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69e8de: test eax, eax
        if (R.zf) { pc = 0x69e8f4; continue; } // 69e8e0: je 0x69e8f4
        pc = 0x69e8e2; continue;
      case 0x69e8e2:
        R.eax = (((R.m.u16(((R.eax + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 69e8e2: movsx eax, word ptr [eax + 0x80]
        R.ecx = (((((R.ebp >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 69e8e9: movsx ecx, bp
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 69e8ec: sub eax, ecx
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.eax >>> 0)); // 69e8ee: mov dword ptr [esp + 0x14], eax
        pc = 0x69e90c; continue; // 69e8f2: jmp 0x69e90c
      case 0x69e8f4:
        R.eax = (R.m.u32(((R.esi + 0x69) | 0) >>> 0)) | 0; // 69e8f4: mov eax, dword ptr [esi + 0x69]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69e8f7: test eax, eax
        if (R.zf) { pc = 0x69d5fc; continue; } // 69e8f9: je 0x69d5fc
        pc = 0x69e8ff; continue;
      case 0x69e8ff:
        R.edx = (((R.m.u16(((R.eax + 0xc) | 0) >>> 0)) << 16 >> 16)) | 0; // 69e8ff: movsx edx, word ptr [eax + 0xc]
        R.eax = (((((R.ebp >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 69e903: movsx eax, bp
        R.edx = (R.sub((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 69e906: sub edx, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edx >>> 0)); // 69e908: mov dword ptr [esp + 0x14], edx
        pc = 0x69e90c; continue;
      case 0x69e90c:
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 69e90c: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.15; // 69e910: fmul qword ptr [0x968f20]
        R.ftol(); // 69e916: call 0x945640
        R.ecx = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 69e91b: movsx ecx, ax
        R.edi = (R.add((R.edi >>> 0), (R.ecx >>> 0), 32)) | 0; // 69e91e: add edi, ecx
        R.sub(((R.ebp >>> 0) & 0xffff), 0x203a, 16); // 69e920: cmp bp, 0x203a
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 69e925: mov dword ptr [esp + 0x14], edi
        if (R.cLE) { pc = 0x69e978; continue; } // 69e929: jle 0x69e978
        pc = 0x69e92b; continue;
      case 0x69e92b:
        R.eax = (R.m.u32(((R.esi + 0x69) | 0) >>> 0)) | 0; // 69e92b: mov eax, dword ptr [esi + 0x69]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69e92e: test eax, eax
        if (R.zf) { pc = 0x69e978; continue; } // 69e930: je 0x69e978
        pc = 0x69e932; continue;
      case 0x69e932:
        R.sub(R.m.u16(((R.eax + 0xc) | 0) >>> 0), 0x109a, 16); // 69e932: cmp word ptr [eax + 0xc], 0x109a
        if (!R.cL) { pc = 0x69e978; continue; } // 69e938: jge 0x69e978
        pc = 0x69e93a; continue;
      case 0x69e93a:
        R.eax = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 69e93a: mov eax, dword ptr [ebx + 0x53]
        R.push(0x1); // 69e93d: push 1
        R.push((R.eax >>> 0)); // 69e93f: push eax
        R.push((R.esi >>> 0)); // 69e940: push esi
        R.call(0x53d980, { n: 3, thisEcx: false, calleeClean: false }); // 69e941: call 0x53d980
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 69e946: add esp, 0xc
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69e949: test eax, eax
        if (!R.zf) { pc = 0x69d5fc; continue; } // 69e94b: jne 0x69d5fc
        pc = 0x69e951; continue;
      case 0x69e951:
        R.eax = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 69e951: mov eax, dword ptr [esi + 0x39]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69e954: test eax, eax
        if (R.zf) { pc = 0x69d5fc; continue; } // 69e956: je 0x69d5fc
        pc = 0x69e95c; continue;
      case 0x69e95c:
        R.eax = (R.m.u32(((R.eax + 0x57) | 0) >>> 0)) | 0; // 69e95c: mov eax, dword ptr [eax + 0x57]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69e95f: test eax, eax
        if (R.zf) { pc = 0x69d5fc; continue; } // 69e961: je 0x69d5fc
        pc = 0x69e967; continue;
      case 0x69e967:
        R.edx = (R.m.u32(((R.ebx + 0x57) | 0) >>> 0)) | 0; // 69e967: mov edx, dword ptr [ebx + 0x57]
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.eax + 0x69) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 69e96a: mov ax, word ptr [eax + 0x69]
        R.sub(((R.eax >>> 0) & 0xffff), R.m.u16(((R.edx + 0x69) | 0) >>> 0), 16); // 69e96e: cmp ax, word ptr [edx + 0x69]
        if (R.cL) { pc = 0x69d5fc; continue; } // 69e972: jl 0x69d5fc
        pc = 0x69e978; continue;
      case 0x69e978:
        R.sub(R.m.u8(((R.esp + 0xb8) | 0) >>> 0), 0x9, 8); // 69e978: cmp byte ptr [esp + 0xb8], 9
        if (R.zf) { pc = 0x69ea31; continue; } // 69e980: je 0x69ea31
        pc = 0x69e986; continue;
      case 0x69e986:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x1a) | 0) >>> 0)) & 0xff) << 0)) | 0; // 69e986: mov al, byte ptr [esp + 0x1a]
        R.sub(((R.eax >>> 0) & 0xff), 0xc, 8); // 69e98a: cmp al, 0xc
        if (R.zf) { pc = 0x69e9a9; continue; } // 69e98c: je 0x69e9a9
        pc = 0x69e98e; continue;
      case 0x69e98e:
        R.sub(((R.eax >>> 0) & 0xff), 0x5, 8); // 69e98e: cmp al, 5
        if (R.zf) { pc = 0x69e9a9; continue; } // 69e990: je 0x69e9a9
        pc = 0x69e992; continue;
      case 0x69e992:
        R.ecx = (R.m.u32(((R.esi + 0x69) | 0) >>> 0)) | 0; // 69e992: mov ecx, dword ptr [esi + 0x69]
        R.edx = (((R.m.u16(((R.ecx + 0xc) | 0) >>> 0)) << 16 >> 16)) | 0; // 69e995: movsx edx, word ptr [ecx + 0xc]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 69e999: mov dword ptr [esp + 0x1c], edx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 69e99d: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 2.5e-05; // 69e9a1: fmul qword ptr [0x96d240]
        pc = 0x69ea1c; continue; // 69e9a7: jmp 0x69ea1c
      case 0x69e9a9:
        R.eax = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 69e9a9: mov eax, dword ptr [ebx + 0x53]
        R.push(0x1); // 69e9ac: push 1
        R.push((R.eax >>> 0)); // 69e9ae: push eax
        R.push((R.esi >>> 0)); // 69e9af: push esi
        R.call(0x53d980, { n: 3, thisEcx: false, calleeClean: false }); // 69e9b0: call 0x53d980
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 69e9b5: add esp, 0xc
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69e9b8: test eax, eax
        if (R.zf) { pc = 0x69e9cd; continue; } // 69e9ba: je 0x69e9cd
        pc = 0x69e9bc; continue;
      case 0x69e9bc:
        R.ecx = (R.m.u32(((R.esi + 0x69) | 0) >>> 0)) | 0; // 69e9bc: mov ecx, dword ptr [esi + 0x69]
        R.edx = (((R.m.u16(((R.ecx + 0xc) | 0) >>> 0)) << 16 >> 16)) | 0; // 69e9bf: movsx edx, word ptr [ecx + 0xc]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 69e9c3: mov dword ptr [esp + 0x1c], edx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 69e9c7: fild dword ptr [esp + 0x1c]
        pc = 0x69ea16; continue; // 69e9cb: jmp 0x69ea16
      case 0x69e9cd:
        R.eax = (R.m.u32(((R.esi + 0x69) | 0) >>> 0)) | 0; // 69e9cd: mov eax, dword ptr [esi + 0x69]
        R.ecx = (((R.m.u16(((R.eax + 0xc) | 0) >>> 0)) << 16 >> 16)) | 0; // 69e9d0: movsx ecx, word ptr [eax + 0xc]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ecx >>> 0)); // 69e9d4: mov dword ptr [esp + 0x1c], ecx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 69e9d8: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 2.5e-05; // 69e9dc: fmul qword ptr [0x96d240]
        R.st[0] = R.st[0] + 0.75; // 69e9e2: fadd qword ptr [0x969040]
        pc = 0x69ea22; continue; // 69e9e8: jmp 0x69ea22
      case 0x69e9ea:
        R.edx = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 69e9ea: mov edx, dword ptr [ebx + 0x53]
        R.push(0x1); // 69e9ed: push 1
        R.push((R.edx >>> 0)); // 69e9ef: push edx
        R.push((R.esi >>> 0)); // 69e9f0: push esi
        R.call(0x53d980, { n: 3, thisEcx: false, calleeClean: false }); // 69e9f1: call 0x53d980
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 69e9f6: add esp, 0xc
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69e9f9: test eax, eax
        if (R.zf) { pc = 0x69ea31; continue; } // 69e9fb: je 0x69ea31
        pc = 0x69e9fd; continue;
      case 0x69e9fd:
        R.sub(R.m.u8(((R.esp + 0xb8) | 0) >>> 0), 0x9, 8); // 69e9fd: cmp byte ptr [esp + 0xb8], 9
        if (R.zf) { pc = 0x69ea31; continue; } // 69ea05: je 0x69ea31
        pc = 0x69ea07; continue;
      case 0x69ea07:
        R.eax = (R.m.u32(((R.esi + 0x69) | 0) >>> 0)) | 0; // 69ea07: mov eax, dword ptr [esi + 0x69]
        R.ecx = (((R.m.u16(((R.eax + 0xc) | 0) >>> 0)) << 16 >> 16)) | 0; // 69ea0a: movsx ecx, word ptr [eax + 0xc]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ecx >>> 0)); // 69ea0e: mov dword ptr [esp + 0x1c], ecx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 69ea12: fild dword ptr [esp + 0x1c]
        pc = 0x69ea16; continue;
      case 0x69ea16:
        R.st[0] = R.st[0] * 5e-05; // 69ea16: fmul qword ptr [0x96d238]
        pc = 0x69ea1c; continue;
      case 0x69ea1c:
        R.st[0] = R.st[0] + 0.5; // 69ea1c: fadd qword ptr [0x968968]
        pc = 0x69ea22; continue;
      case 0x69ea22:
        R.st[0] = R.st[0] * R.m.s32(((R.esp + 0x14) | 0) >>> 0); // 69ea22: fimul dword ptr [esp + 0x14]
        pc = 0x69ea26; continue;
      case 0x69ea26:
        R.ftol(); // 69ea26: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 69ea2b: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 69ea2d: mov dword ptr [esp + 0x14], edi
        pc = 0x69ea31; continue;
      case 0x69ea31:
        R.eax = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 69ea31: mov eax, dword ptr [ebx + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69ea34: test eax, eax
        if (R.zf) { pc = 0x69ea71; continue; } // 69ea36: je 0x69ea71
        pc = 0x69ea38; continue;
      case 0x69ea38:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x77) | 0) >>> 0)) & 0xff) << 0)) | 0; // 69ea38: mov dl, byte ptr [eax + 0x77]
        R.ecx = (R.m.u32(((0xb74350) | 0) >>> 0)) | 0; // 69ea3b: mov ecx, dword ptr [0xb74350]
        R.push(0x1); // 69ea41: push 1
        R.push((R.edx >>> 0)); // 69ea43: push edx
        R.push((R.ebx >>> 0)); // 69ea44: push ebx
        R.push((R.esi >>> 0)); // 69ea45: push esi
        R.call(0x7c6830, { n: 4, thisEcx: true, calleeClean: true }); // 69ea46: call 0x7c6830
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 69ea4b: movsx eax, al
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 69ea4e: mov dword ptr [esp + 0x1c], eax
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 69ea52: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 0.05; // 69ea56: fmul qword ptr [0x967888]
        R.st[0] = R.st[0] + 0.5; // 69ea5c: fadd qword ptr [0x968968]
        R.st[0] = R.st[0] * R.m.s32(((R.esp + 0x14) | 0) >>> 0); // 69ea62: fimul dword ptr [esp + 0x14]
        R.ftol(); // 69ea66: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 69ea6b: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 69ea6d: mov dword ptr [esp + 0x14], edi
        pc = 0x69ea71; continue;
      case 0x69ea71:
        R.eax = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 69ea71: mov eax, dword ptr [esp + 0x10]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69ea75: test eax, eax
        if (R.zf) { pc = 0x69eaae; continue; } // 69ea77: je 0x69eaae
        pc = 0x69ea79; continue;
      case 0x69ea79:
        R.eax = (((R.m.u8(((R.eax + 0x7e) | 0) >>> 0)) << 24 >> 24)) | 0; // 69ea79: movsx eax, byte ptr [eax + 0x7e]
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 69ea7d: dec eax
        if (R.zf) { pc = 0x69eabf; continue; } // 69ea7e: je 0x69eabf
        pc = 0x69ea80; continue;
      case 0x69ea80:
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 69ea80: dec eax
        if (R.zf) { pc = 0x69eac6; continue; } // 69ea81: je 0x69eac6
        pc = 0x69ea83; continue;
      case 0x69ea83:
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 69ea83: dec eax
        if (R.zf) { pc = 0x69ea9c; continue; } // 69ea84: je 0x69ea9c
        pc = 0x69ea86; continue;
      case 0x69ea86:
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 69ea86: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.05; // 69ea8a: fmul qword ptr [0x967888]
        R.ftol(); // 69ea90: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 69ea95: mov edi, eax
        pc = 0x69d601; continue; // 69ea97: jmp 0x69d601
      case 0x69ea9c:
        R.eax = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 69ea9c: mov eax, dword ptr [ebx + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69ea9f: test eax, eax
        if (R.zf) { pc = 0x69eabf; continue; } // 69eaa1: je 0x69eabf
        pc = 0x69eaa3; continue;
      case 0x69eaa3:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x7e) | 0) >>> 0)) & 0xff) << 0)) | 0; // 69eaa3: mov al, byte ptr [eax + 0x7e]
        R.sub(((R.eax >>> 0) & 0xff), 0x1, 8); // 69eaa6: cmp al, 1
        if (R.zf) { pc = 0x69eaae; continue; } // 69eaa8: je 0x69eaae
        pc = 0x69eaaa; continue;
      case 0x69eaaa:
        R.sub(((R.eax >>> 0) & 0xff), 0x2, 8); // 69eaaa: cmp al, 2
        if (!R.zf) { pc = 0x69eabf; continue; } // 69eaac: jne 0x69eabf
        pc = 0x69eaae; continue;
      case 0x69eaae:
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 69eaae: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.25; // 69eab2: fmul qword ptr [0x9689e0]
        R.ftol(); // 69eab8: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 69eabd: mov edi, eax
        pc = 0x69eabf; continue;
      case 0x69eabf:
        R.eax = ((R.edi >>> 0)) | 0; // 69eabf: mov eax, edi
        pc = 0x69d601; continue; // 69eac1: jmp 0x69d601
      case 0x69eac6:
        R.eax = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 69eac6: mov eax, dword ptr [ebx + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 69eac9: test eax, eax
        if (R.zf) { pc = 0x69eabf; continue; } // 69eacb: je 0x69eabf
        pc = 0x69eacd; continue;
      case 0x69eacd:
        R.sub(R.m.u8(((R.eax + 0x7e) | 0) >>> 0), 0x1, 8); // 69eacd: cmp byte ptr [eax + 0x7e], 1
        if (!R.zf) { pc = 0x69eabf; continue; } // 69ead1: jne 0x69eabf
        pc = 0x69ead3; continue;
      case 0x69ead3:
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 69ead3: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.75; // 69ead7: fmul qword ptr [0x969040]
        R.ftol(); // 69eadd: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 69eae2: mov edi, eax
        pc = 0x69d601; continue; // 69eae4: jmp 0x69d601
      default: throw new Error(`f_69d1b0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
