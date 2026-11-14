// 0x7f7270 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 53cd60=2, 5e8290=9, 7ae8a0=1tc, 7ae950=0t, 7f6cd0=2c, 8043c0=140t, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_7f7270(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x7f7270;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x7f7270:
        R.esp = (R.sub((R.esp >>> 0), 0x230, 32)) | 0; // 7f7270: sub esp, 0x230
        R.push((R.ebp >>> 0)); // 7f7276: push ebp
        R.ebp = (R.m.u32(((R.esp + 0x238) | 0) >>> 0)) | 0; // 7f7277: mov ebp, dword ptr [esp + 0x238]
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 7f727e: test ebp, ebp
        R.m.w32(((R.esp + 0x8) | 0) >>> 0, (R.ecx >>> 0)); // 7f7280: mov dword ptr [esp + 8], ecx
        if (!R.zf) { pc = 0x7f72cf; continue; } // 7f7284: jne 0x7f72cf
        pc = 0x7f7286; continue;
      case 0x7f7286:
        R.eax = (((R.m.u16(((0xb77c7a) | 0) >>> 0)) << 16 >> 16)) | 0; // 7f7286: movsx eax, word ptr [0xb77c7a]
        R.eax = (((R.eax + R.eax * 2) | 0)) | 0; // 7f728d: lea eax, [eax + eax*2]
        R.eax = (R.shl((R.eax >>> 0), 0x8, 32)) | 0; // 7f7290: shl eax, 8
        R.ebp = (R.m.u32(((R.eax + 0xb74c26) | 0) >>> 0)) | 0; // 7f7293: mov ebp, dword ptr [eax + 0xb74c26]
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 7f7299: test ebp, ebp
        if (!R.zf) { pc = 0x7f72cf; continue; } // 7f729b: jne 0x7f72cf
        pc = 0x7f729d; continue;
      case 0x7f729d:
        R.ecx = (((R.esp + 0x34) | 0)) | 0; // 7f729d: lea ecx, [esp + 0x34]
        R.edx = (((R.esp + 0x134) | 0)) | 0; // 7f72a1: lea edx, [esp + 0x134]
        R.push((R.ecx >>> 0)); // 7f72a8: push ecx
        R.push((R.edx >>> 0)); // 7f72a9: push edx
        R.push((R.ebp >>> 0)); // 7f72aa: push ebp
        R.push((R.ebp >>> 0)); // 7f72ab: push ebp
        R.push(0xa7b094); // 7f72ac: push 0xa7b094
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 7f72b1: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 7f72b6: add esp, 0x14
        R.eax = (((R.esp + 0x34) | 0)) | 0; // 7f72b9: lea eax, [esp + 0x34]
        R.ecx = (((R.esp + 0x134) | 0)) | 0; // 7f72bd: lea ecx, [esp + 0x134]
        R.push(0x1ba); // 7f72c4: push 0x1ba
        R.push((R.eax >>> 0)); // 7f72c9: push eax
        pc = 0x7f7446; continue; // 7f72ca: jmp 0x7f7446
      case 0x7f72cf:
        R.push((R.ebx >>> 0)); // 7f72cf: push ebx
        R.push((R.esi >>> 0)); // 7f72d0: push esi
        R.ebx = ((R.ebx & 0xffffff00) | (((R.logic(((R.ebx >>> 0) & 0xff) ^ ((R.ebx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 7f72d1: xor bl, bl
        R.push((R.edi >>> 0)); // 7f72d3: push edi
        R.edi = (R.m.u32(((R.ebp + 0x39) | 0) >>> 0)) | 0; // 7f72d4: mov edi, dword ptr [ebp + 0x39]
        R.m.w8(((R.esp + 0x10) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 7f72d7: mov byte ptr [esp + 0x10], bl
        pc = 0x7f72db; continue;
      case 0x7f72db:
        R.edx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 7f72db: mov edx, dword ptr [esp + 0x10]
        R.ecx = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 7f72df: mov ecx, dword ptr [esp + 0x14]
        R.push((R.ebp >>> 0)); // 7f72e3: push ebp
        R.push((R.edx >>> 0)); // 7f72e4: push edx
        R.call(0x7f6cd0, { n: 2, thisEcx: false, calleeClean: true }); // 7f72e5: call 0x7f6cd0
        R.esi = ((R.eax >>> 0)) | 0; // 7f72ea: mov esi, eax
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 7f72ec: test esi, esi
        if (R.zf) { pc = 0x7f7319; continue; } // 7f72ee: je 0x7f7319
        pc = 0x7f72f0; continue;
      case 0x7f72f0:
        R.sub(R.m.u8(((R.esi + 0xa) | 0) >>> 0), 0x4, 8); // 7f72f0: cmp byte ptr [esi + 0xa], 4
        if (!R.zf) { pc = 0x7f7319; continue; } // 7f72f4: jne 0x7f7319
        pc = 0x7f72f6; continue;
      case 0x7f72f6:
        R.ecx = ((R.esi >>> 0)) | 0; // 7f72f6: mov ecx, esi
        R.call(0x7ae950, { n: 0, thisEcx: true, calleeClean: false }); // 7f72f8: call 0x7ae950
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 7f72fd: test edi, edi
        if (R.zf) { pc = 0x7f7310; continue; } // 7f72ff: je 0x7f7310
        pc = 0x7f7301; continue;
      case 0x7f7301:
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 7f7301: test eax, eax
        if (R.zf) { pc = 0x7f7319; continue; } // 7f7303: je 0x7f7319
        pc = 0x7f7305; continue;
      case 0x7f7305:
        R.sub(R.m.u32(((R.eax + 0x39) | 0) >>> 0), (R.edi >>> 0), 32); // 7f7305: cmp dword ptr [eax + 0x39], edi
        if (!R.zf) { pc = 0x7f7310; continue; } // 7f7308: jne 0x7f7310
        pc = 0x7f730a; continue;
      case 0x7f730a:
        R.sub(R.m.u8(((R.eax + 0x3d) | 0) >>> 0), 0x9, 8); // 7f730a: cmp byte ptr [eax + 0x3d], 9
        if (R.zf) { pc = 0x7f7319; continue; } // 7f730e: je 0x7f7319
        pc = 0x7f7310; continue;
      case 0x7f7310:
        R.push(0x0); // 7f7310: push 0
        R.ecx = ((R.esi >>> 0)) | 0; // 7f7312: mov ecx, esi
        R.call(0x7ae8a0, { n: 1, thisEcx: true, calleeClean: true }); // 7f7314: call 0x7ae8a0
        pc = 0x7f7319; continue;
      case 0x7f7319:
        R.ebx = ((R.ebx & 0xffffff00) | (((R.incdec(((R.ebx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 7f7319: inc bl
        R.sub(((R.ebx >>> 0) & 0xff), 0xa, 8); // 7f731b: cmp bl, 0xa
        R.m.w8(((R.esp + 0x10) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 7f731e: mov byte ptr [esp + 0x10], bl
        if (R.cL) { pc = 0x7f72db; continue; } // 7f7322: jl 0x7f72db
        pc = 0x7f7324; continue;
      case 0x7f7324:
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 7f7324: test edi, edi
        if (R.zf) { pc = 0x7f73de; continue; } // 7f7326: je 0x7f73de
        pc = 0x7f732c; continue;
      case 0x7f732c:
        R.eax = (((R.esp + 0x24) | 0)) | 0; // 7f732c: lea eax, [esp + 0x24]
        R.push((R.eax >>> 0)); // 7f7330: push eax
        R.push((R.edi >>> 0)); // 7f7331: push edi
        R.call(0x53cd60, { n: 2, thisEcx: false, calleeClean: false }); // 7f7332: call 0x53cd60
        R.ecx = (((R.esp + 0x2c) | 0)) | 0; // 7f7337: lea ecx, [esp + 0x2c]
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 7f733b: add esp, 8
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 7f733e: mov dword ptr [esp + 0x10], ecx
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, 0x7); // 7f7342: mov dword ptr [esp + 0x20], 7
        pc = 0x7f734a; continue;
      case 0x7f734a:
        R.edx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 7f734a: mov edx, dword ptr [esp + 0x10]
        R.edi = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 7f734e: mov edi, dword ptr [edx]
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 7f7350: test edi, edi
        if (R.zf) { pc = 0x7f73c4; continue; } // 7f7352: je 0x7f73c4
        pc = 0x7f7354; continue;
      case 0x7f7354:
        R.ebx = ((R.ebx & 0xffffff00) | (((R.logic(((R.ebx >>> 0) & 0xff) ^ ((R.ebx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 7f7354: xor bl, bl
        R.m.w8(((R.esp + 0x18) | 0) >>> 0, 0xff); // 7f7356: mov byte ptr [esp + 0x18], 0xff
        R.m.w8(((R.esp + 0x1c) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 7f735b: mov byte ptr [esp + 0x1c], bl
        pc = 0x7f735f; continue;
      case 0x7f735f:
        R.eax = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 7f735f: mov eax, dword ptr [esp + 0x1c]
        R.ecx = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 7f7363: mov ecx, dword ptr [esp + 0x14]
        R.push((R.ebp >>> 0)); // 7f7367: push ebp
        R.push((R.eax >>> 0)); // 7f7368: push eax
        R.call(0x7f6cd0, { n: 2, thisEcx: false, calleeClean: true }); // 7f7369: call 0x7f6cd0
        R.esi = ((R.eax >>> 0)) | 0; // 7f736e: mov esi, eax
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 7f7370: test esi, esi
        if (R.zf) { pc = 0x7f739b; continue; } // 7f7372: je 0x7f739b
        pc = 0x7f7374; continue;
      case 0x7f7374:
        R.sub(R.m.u8(((R.esi + 0xa) | 0) >>> 0), 0x4, 8); // 7f7374: cmp byte ptr [esi + 0xa], 4
        if (!R.zf) { pc = 0x7f739b; continue; } // 7f7378: jne 0x7f739b
        pc = 0x7f737a; continue;
      case 0x7f737a:
        R.ecx = ((R.esi >>> 0)) | 0; // 7f737a: mov ecx, esi
        R.call(0x7ae950, { n: 0, thisEcx: true, calleeClean: false }); // 7f737c: call 0x7ae950
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 7f7381: cmp eax, edi
        if (R.zf) { pc = 0x7f73c4; continue; } // 7f7383: je 0x7f73c4
        pc = 0x7f7385; continue;
      case 0x7f7385:
        R.ecx = ((R.esi >>> 0)) | 0; // 7f7385: mov ecx, esi
        R.call(0x7ae950, { n: 0, thisEcx: true, calleeClean: false }); // 7f7387: call 0x7ae950
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 7f738c: test eax, eax
        if (!R.zf) { pc = 0x7f739b; continue; } // 7f738e: jne 0x7f739b
        pc = 0x7f7390; continue;
      case 0x7f7390:
        R.sub(R.m.u8(((R.esp + 0x18) | 0) >>> 0), 0xff, 8); // 7f7390: cmp byte ptr [esp + 0x18], 0xff
        if (!R.zf) { pc = 0x7f739b; continue; } // 7f7395: jne 0x7f739b
        pc = 0x7f7397; continue;
      case 0x7f7397:
        R.m.w8(((R.esp + 0x18) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 7f7397: mov byte ptr [esp + 0x18], bl
        pc = 0x7f739b; continue;
      case 0x7f739b:
        R.ebx = ((R.ebx & 0xffffff00) | (((R.incdec(((R.ebx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 7f739b: inc bl
        R.sub(((R.ebx >>> 0) & 0xff), 0xa, 8); // 7f739d: cmp bl, 0xa
        R.m.w8(((R.esp + 0x1c) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 7f73a0: mov byte ptr [esp + 0x1c], bl
        if (R.cL) { pc = 0x7f735f; continue; } // 7f73a4: jl 0x7f735f
        pc = 0x7f73a6; continue;
      case 0x7f73a6:
        R.sub(R.m.u8(((R.esp + 0x18) | 0) >>> 0), 0xff, 8); // 7f73a6: cmp byte ptr [esp + 0x18], 0xff
        if (R.cLE) { pc = 0x7f73c4; continue; } // 7f73ab: jle 0x7f73c4
        pc = 0x7f73ad; continue;
      case 0x7f73ad:
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 7f73ad: mov ecx, dword ptr [esp + 0x18]
        R.push((R.edi >>> 0)); // 7f73b1: push edi
        R.push((R.ebp >>> 0)); // 7f73b2: push ebp
        R.push((R.ecx >>> 0)); // 7f73b3: push ecx
        R.ecx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 7f73b4: mov ecx, dword ptr [esp + 0x20]
        R.call(0x7f6cd0, { n: 2, thisEcx: false, calleeClean: true }); // 7f73b8: call 0x7f6cd0
        R.ecx = ((R.eax >>> 0)) | 0; // 7f73bd: mov ecx, eax
        R.call(0x7ae8a0, { n: 1, thisEcx: true, calleeClean: true }); // 7f73bf: call 0x7ae8a0
        pc = 0x7f73c4; continue;
      case 0x7f73c4:
        R.ecx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 7f73c4: mov ecx, dword ptr [esp + 0x10]
        R.eax = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 7f73c8: mov eax, dword ptr [esp + 0x20]
        R.ecx = (R.add((R.ecx >>> 0), 0x4, 32)) | 0; // 7f73cc: add ecx, 4
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 7f73cf: dec eax
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 7f73d0: mov dword ptr [esp + 0x10], ecx
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.eax >>> 0)); // 7f73d4: mov dword ptr [esp + 0x20], eax
        if (!R.zf) { pc = 0x7f734a; continue; } // 7f73d8: jne 0x7f734a
        pc = 0x7f73de; continue;
      case 0x7f73de:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebp) | 0) >>> 0)) & 0xff) << 0)) | 0; // 7f73de: mov al, byte ptr [ebp]
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((0xae2364) | 0) >>> 0)) & 0xff) << 0)) | 0; // 7f73e1: mov dl, byte ptr [0xae2364]
        R.eax = ((R.eax & 0xffffff00) | (((R.sub(((R.eax >>> 0) & 0xff), ((R.edx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 7f73e7: sub al, dl
        R.edi = (R.pop()) | 0; // 7f73e9: pop edi
        R.eax = ((R.eax & 0xffffff00) | (((R.add(((R.eax >>> 0) & 0xff), 0x10, 8)) & 0xff) << 0)) | 0; // 7f73ea: add al, 0x10
        R.esi = (R.pop()) | 0; // 7f73ec: pop esi
        R.ebx = (R.pop()) | 0; // 7f73ed: pop ebx
        if (R.sf) { pc = 0x7f7417; continue; } // 7f73ee: js 0x7f7417
        pc = 0x7f73f0; continue;
      case 0x7f73f0:
        R.sub(((R.eax >>> 0) & 0xff), 0xf, 8); // 7f73f0: cmp al, 0xf
        if (!R.cLE) { pc = 0x7f7417; continue; } // 7f73f2: jg 0x7f7417
        pc = 0x7f73f4; continue;
      case 0x7f73f4:
        R.edx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 7f73f4: movsx edx, al
        R.eax = (R.m.u32(((R.esp + 0x8) | 0) >>> 0)) | 0; // 7f73f7: mov eax, dword ptr [esp + 8]
        R.ecx = (R.m.u32(((R.eax + R.edx * 4 + 0xc) | 0) >>> 0)) | 0; // 7f73fb: mov ecx, dword ptr [eax + edx*4 + 0xc]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 7f73ff: test ecx, ecx
        if (R.zf) { pc = 0x7f7408; continue; } // 7f7401: je 0x7f7408
        pc = 0x7f7403; continue;
      case 0x7f7403:
        R.call(0x8043c0, { n: 140, thisEcx: true, calleeClean: false }); // 7f7403: call 0x8043c0
        pc = 0x7f7408; continue;
      case 0x7f7408:
        R.eax = (0x1) | 0; // 7f7408: mov eax, 1
        R.ebp = (R.pop()) | 0; // 7f740d: pop ebp
        R.esp = (R.add((R.esp >>> 0), 0x230, 32)) | 0; // 7f740e: add esp, 0x230
        return R.ret(1); // 7f7414: ret 4
      case 0x7f7417:
        R.ecx = (((R.esp + 0x134) | 0)) | 0; // 7f7417: lea ecx, [esp + 0x134]
        R.edx = (((R.esp + 0x34) | 0)) | 0; // 7f741e: lea edx, [esp + 0x34]
        R.push((R.ecx >>> 0)); // 7f7422: push ecx
        R.push((R.edx >>> 0)); // 7f7423: push edx
        R.push(0x0); // 7f7424: push 0
        R.push(0x0); // 7f7426: push 0
        R.push(0xa7b094); // 7f7428: push 0xa7b094
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 7f742d: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 7f7432: add esp, 0x14
        R.eax = (((R.esp + 0x134) | 0)) | 0; // 7f7435: lea eax, [esp + 0x134]
        R.ecx = (((R.esp + 0x34) | 0)) | 0; // 7f743c: lea ecx, [esp + 0x34]
        R.push(0x212); // 7f7440: push 0x212
        R.push((R.eax >>> 0)); // 7f7445: push eax
        pc = 0x7f7446; continue;
      case 0x7f7446:
        R.push((R.ecx >>> 0)); // 7f7446: push ecx
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 7f7447: call 0x90d130
        R.push((R.eax >>> 0)); // 7f744c: push eax
        R.push(0x9870e8); // 7f744d: push 0x9870e8
        R.push(0xae24d0); // 7f7452: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 7f7457: call 0x944c9f
        R.push(0x0); // 7f745c: push 0
        R.push(0xae24d0); // 7f745e: push 0xae24d0
        R.push(0x9870e0); // 7f7463: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 7f7468: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 7f746d: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 7f7470: mov dword ptr [0xb67a34], 0
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 7f747a: xor eax, eax
        R.ebp = (R.pop()) | 0; // 7f747c: pop ebp
        R.esp = (R.add((R.esp >>> 0), 0x230, 32)) | 0; // 7f747d: add esp, 0x230
        return R.ret(1); // 7f7483: ret 4
      default: throw new Error(`f_7f7270: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
