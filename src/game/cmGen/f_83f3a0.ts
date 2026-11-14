// 0x83f3a0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4cf5a0=1c, 4cf5f0=2tc, 4d0c60=5c, 4d1600=6tc, 4d42d0=3tc, 53b900=1, 53ca90=1, 53d980=3, 5407e0=0, 544410=4, 544520=2, 544590=2, 54c8e0=2tc, 587220=2, 5968d0=2tc, 5986b0=0t, 5a0590=1tc, 5fd210=1c, 5fea50=2c, 600a50=5, 600e90=0, 62ed70=1tc, 669340=1, 69d1b0=4c, 69fc60=1tc, 6e6340=6, 754740=5tc, 7875e0=1c, 7f7490=2tc, 83bd00=1c, 83f3a0=3tc, 840d80=6tc, 8423f0=2tc, 843e10=4tc, 844780=5tcf, 846920=6tcf, 84af00=8c, 84b180=3c, 84b230=3c, 84b6f0=4c, 85e410=0t, 85fa00=0t, 864550=6cf, 8c7560=3tc, 8cca10=2tc, 8ce990=4tc, 8d0040=3tc, 946464=5
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, PC_HOOK } from './x86';

export function f_83f3a0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x83f3a0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x83f3a0:
        R.push((R.ebp >>> 0)); // 83f3a0: push ebp
        R.ebp = ((R.esp >>> 0)) | 0; // 83f3a1: mov ebp, esp
        R.esp = (R.logic((R.esp >>> 0) & 0xfffffff8, 32)) | 0; // 83f3a3: and esp, 0xfffffff8
        R.push(0xffffffff); // 83f3a6: push -1
        R.push(0x9624a3); // 83f3a8: push 0x9624a3
        R.eax = (0) | 0; // 83f3ad: mov eax, dword ptr fs:[0]
        R.push((R.eax >>> 0)); // 83f3b3: push eax
        /* fs */ // 83f3b4: mov dword ptr fs:[0], esp
        R.esp = (R.sub((R.esp >>> 0), 0xfc, 32)) | 0; // 83f3bb: sub esp, 0xfc
        R.push((R.ebx >>> 0)); // 83f3c1: push ebx
        R.push((R.esi >>> 0)); // 83f3c2: push esi
        R.push((R.edi >>> 0)); // 83f3c3: push edi
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 83f3c4: mov dword ptr [esp + 0x10], ecx
        R.edi = (R.logic((R.edi >>> 0) ^ (R.edi >>> 0), 32)) | 0; // 83f3c8: xor edi, edi
        R.ecx = (((R.esp + 0xb8) | 0)) | 0; // 83f3ca: lea ecx, [esp + 0xb8]
        R.m.w32(((R.esp + 0x84) | 0) >>> 0, (R.edi >>> 0)); // 83f3d1: mov dword ptr [esp + 0x84], edi
        R.m.w32(((R.esp + 0x48) | 0) >>> 0, (R.edi >>> 0)); // 83f3d8: mov dword ptr [esp + 0x48], edi
        R.call(0x85e410, { n: 0, thisEcx: true, calleeClean: false }); // 83f3dc: call 0x85e410
        R.ebx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 83f3e1: mov ebx, dword ptr [ebp + 0xc]
        R.m.w32(((R.esp + 0x110) | 0) >>> 0, (R.edi >>> 0)); // 83f3e4: mov dword ptr [esp + 0x110], edi
        R.m.w32(((R.esp + 0x80) | 0) >>> 0, 0x1); // 83f3eb: mov dword ptr [esp + 0x80], 1
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0x64); // 83f3f6: mov dword ptr [esp + 0x28], 0x64
        R.eax = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 83f3fe: mov eax, dword ptr [ebx + 0x53]
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 83f401: cmp eax, edi
        if (R.zf) { pc = 0x840d69; continue; } // 83f403: je 0x840d69
        pc = 0x83f409; continue;
      case 0x83f409:
        R.push((R.eax >>> 0)); // 83f409: push eax
        R.call(0x669340, { n: 1, thisEcx: false, calleeClean: false }); // 83f40a: call 0x669340
        R.ecx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 83f40f: mov ecx, dword ptr [ebp + 8]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 83f412: add esp, 4
        R.sub(R.m.u8(((R.ecx) | 0) >>> 0), 0xb, 8); // 83f415: cmp byte ptr [ecx], 0xb
        if (!R.zf) { pc = 0x83f4d8; continue; } // 83f418: jne 0x83f4d8
        pc = 0x83f41e; continue;
      case 0x83f41e:
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 83f41e: test al, al
        if (R.cL) { pc = 0x83f4df; continue; } // 83f420: jl 0x83f4df
        pc = 0x83f426; continue;
      case 0x83f426:
        R.sub(((R.eax >>> 0) & 0xff), 0x23, 8); // 83f426: cmp al, 0x23
        if (!R.cL) { pc = 0x83f4df; continue; } // 83f428: jge 0x83f4df
        pc = 0x83f42e; continue;
      case 0x83f42e:
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 83f42e: movsx eax, al
        R.edx = (((R.esp + 0x5c) | 0)) | 0; // 83f431: lea edx, [esp + 0x5c]
        R.push(0x1c); // 83f435: push 0x1c
        R.esi = (((R.eax + R.eax * 8) | 0)) | 0; // 83f437: lea esi, [eax + eax*8]
        R.push((R.edx >>> 0)); // 83f43a: push edx
        R.esi = (R.shl((R.esi >>> 0), 0x3, 32)) | 0; // 83f43b: shl esi, 3
        R.ecx = (((R.esi + 0xb63d8a) | 0)) | 0; // 83f43e: lea ecx, [esi + 0xb63d8a]
        R.call(0x54c8e0, { n: 2, thisEcx: true, calleeClean: true }); // 83f444: call 0x54c8e0
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 83f449: mov ecx, dword ptr [eax]
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 83f44b: mov eax, dword ptr [eax + 4]
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 83f44e: mov dx, word ptr [0xae2c92]
        R.m.w32(((R.esp + 0x4c) | 0) >>> 0, (R.ecx >>> 0)); // 83f455: mov dword ptr [esp + 0x4c], ecx
        R.m.w32(((R.esp + 0x50) | 0) >>> 0, (R.eax >>> 0)); // 83f459: mov dword ptr [esp + 0x50], eax
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.esp + 0x4e) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 83f45d: mov ax, word ptr [esp + 0x4e]
        R.sub(((R.eax >>> 0) & 0xffff), ((R.edx >>> 0) & 0xffff), 16); // 83f462: cmp ax, dx
        R.m.w8(((R.esp + 0x110) | 0) >>> 0, 0x1); // 83f465: mov byte ptr [esp + 0x110], 1
        if (R.cf) { pc = 0x83f481; continue; } // 83f46d: jb 0x83f481
        pc = 0x83f46f; continue;
      case 0x83f46f:
        if (!R.cBE) { pc = 0x83f4ca; continue; } // 83f46f: ja 0x83f4ca
        pc = 0x83f471; continue;
      case 0x83f471:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 83f471: xor eax, eax
        R.sub(((R.ecx >>> 0) & 0xffff), R.m.u16(((0xae2c90) | 0) >>> 0), 16); // 83f473: cmp cx, word ptr [0xae2c90]
        R.eax = ((R.eax & 0xffffff00) | (((R.cL ? 1 : 0) & 0xff) << 0)) | 0; // 83f47a: setl al
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 83f47d: cmp eax, edi
        if (R.zf) { pc = 0x83f4ca; continue; } // 83f47f: je 0x83f4ca
        pc = 0x83f481; continue;
      case 0x83f481:
        R.ecx = (((R.esp + 0x98) | 0)) | 0; // 83f481: lea ecx, [esp + 0x98]
        R.push(0x1c); // 83f488: push 0x1c
        R.push((R.ecx >>> 0)); // 83f48a: push ecx
        R.ecx = (((R.esi + 0xb63d99) | 0)) | 0; // 83f48b: lea ecx, [esi + 0xb63d99]
        R.call(0x54c8e0, { n: 2, thisEcx: true, calleeClean: true }); // 83f491: call 0x54c8e0
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 83f496: mov ecx, dword ptr [eax]
        R.edx = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 83f498: mov edx, dword ptr [eax + 4]
        R.m.w32(((R.esp + 0x4c) | 0) >>> 0, (R.ecx >>> 0)); // 83f49b: mov dword ptr [esp + 0x4c], ecx
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.esp + 0x4e) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 83f49f: mov ax, word ptr [esp + 0x4e]
        R.m.w32(((R.esp + 0x50) | 0) >>> 0, (R.edx >>> 0)); // 83f4a4: mov dword ptr [esp + 0x50], edx
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 83f4a8: mov dx, word ptr [0xae2c92]
        R.sub(((R.eax >>> 0) & 0xffff), ((R.edx >>> 0) & 0xffff), 16); // 83f4af: cmp ax, dx
        if (!R.cBE) { pc = 0x83f4c6; continue; } // 83f4b2: ja 0x83f4c6
        pc = 0x83f4b4; continue;
      case 0x83f4b4:
        if (R.cf) { pc = 0x83f4ca; continue; } // 83f4b4: jb 0x83f4ca
        pc = 0x83f4b6; continue;
      case 0x83f4b6:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 83f4b6: xor eax, eax
        R.sub(((R.ecx >>> 0) & 0xffff), R.m.u16(((0xae2c90) | 0) >>> 0), 16); // 83f4b8: cmp cx, word ptr [0xae2c90]
        R.eax = ((R.eax & 0xffffff00) | (((!R.cLE ? 1 : 0) & 0xff) << 0)) | 0; // 83f4bf: setg al
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 83f4c2: cmp eax, edi
        if (R.zf) { pc = 0x83f4ca; continue; } // 83f4c4: je 0x83f4ca
        pc = 0x83f4c6; continue;
      case 0x83f4c6:
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 83f4c6: xor al, al
        pc = 0x83f4cc; continue; // 83f4c8: jmp 0x83f4cc
      case 0x83f4ca:
        R.eax = ((R.eax & 0xffffff00) | (((0x1) & 0xff) << 0)) | 0; // 83f4ca: mov al, 1
        pc = 0x83f4cc; continue;
      case 0x83f4cc:
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 83f4cc: test al, al
        R.m.w8(((R.esp + 0x110) | 0) >>> 0, 0x0); // 83f4ce: mov byte ptr [esp + 0x110], 0
        if (R.zf) { pc = 0x83f4df; continue; } // 83f4d6: je 0x83f4df
        pc = 0x83f4d8; continue;
      case 0x83f4d8:
        R.m.w32(((R.esp + 0x80) | 0) >>> 0, (R.edi >>> 0)); // 83f4d8: mov dword ptr [esp + 0x80], edi
        pc = 0x83f4df; continue;
      case 0x83f4df:
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 83f4df: mov cx, word ptr [ebx + 0x80]
        R.sub(((R.ecx >>> 0) & 0xffff), 0xdac, 16); // 83f4e6: cmp cx, 0xdac
        if (!R.cL) { pc = 0x83f4fd; continue; } // 83f4eb: jge 0x83f4fd
        pc = 0x83f4ed; continue;
      case 0x83f4ed:
        R.eax = (0x1789) | 0; // 83f4ed: mov eax, 0x1789
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 83f4f2: sub eax, ecx
        R.eax = (R.shl((R.eax >>> 0), 0x2, 32)) | 0; // 83f4f4: shl eax, 2
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 83f4f7: mov dword ptr [esp + 0x28], eax
        pc = 0x83f534; continue; // 83f4fb: jmp 0x83f534
      case 0x83f4fd:
        R.eax = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 83f4fd: mov eax, dword ptr [ebx + 0x53]
        R.ecx = (R.m.u32(((0x9cf244) | 0) >>> 0)) | 0; // 83f500: mov ecx, dword ptr [0x9cf244]
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 83f506: mov eax, dword ptr [eax]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 83f508: cmp eax, ecx
        if (R.zf) { pc = 0x83f52c; continue; } // 83f50a: je 0x83f52c
        pc = 0x83f50c; continue;
      case 0x83f50c:
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf338) | 0) >>> 0), 32); // 83f50c: cmp eax, dword ptr [0x9cf338]
        if (R.zf) { pc = 0x83f52c; continue; } // 83f512: je 0x83f52c
        pc = 0x83f514; continue;
      case 0x83f514:
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf4a8) | 0) >>> 0), 32); // 83f514: cmp eax, dword ptr [0x9cf4a8]
        if (R.zf) { pc = 0x83f52c; continue; } // 83f51a: je 0x83f52c
        pc = 0x83f51c; continue;
      case 0x83f51c:
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf2c0) | 0) >>> 0), 32); // 83f51c: cmp eax, dword ptr [0x9cf2c0]
        if (R.zf) { pc = 0x83f52c; continue; } // 83f522: je 0x83f52c
        pc = 0x83f524; continue;
      case 0x83f524:
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf408) | 0) >>> 0), 32); // 83f524: cmp eax, dword ptr [0x9cf408]
        if (!R.zf) { pc = 0x83f534; continue; } // 83f52a: jne 0x83f534
        pc = 0x83f52c; continue;
      case 0x83f52c:
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0x32); // 83f52c: mov dword ptr [esp + 0x28], 0x32
        pc = 0x83f534; continue;
      case 0x83f534:
        R.edi = (((R.ebx + 0x1b3) | 0)) | 0; // 83f534: lea edi, [ebx + 0x1b3]
        R.m.w32(((R.esp + 0x40) | 0) >>> 0, 0x7); // 83f53a: mov dword ptr [esp + 0x40], 7
        pc = 0x83f542; continue;
      case 0x83f542:
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 83f542: mov eax, dword ptr [edi]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83f544: test eax, eax
        if (R.zf) { pc = 0x83f582; continue; } // 83f546: je 0x83f582
        pc = 0x83f548; continue;
      case 0x83f548:
        R.eax = (R.m.u32(((R.eax + 0x69) | 0) >>> 0)) | 0; // 83f548: mov eax, dword ptr [eax + 0x69]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83f54b: test eax, eax
        if (R.zf) { pc = 0x83f5aa; continue; } // 83f54d: je 0x83f5aa
        pc = 0x83f54f; continue;
      case 0x83f54f:
        R.push(0x6); // 83f54f: push 6
        R.push((R.eax >>> 0)); // 83f551: push eax
        R.call(0x544410, { n: 0, thisEcx: false, calleeClean: false }); // 83f552: call 0x544410
        R.ecx = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 83f557: mov ecx, dword ptr [edi]
        R.push(0x5); // 83f559: push 5
        R.esi = ((R.esi & 0xffff0000) | (((((((R.eax >>> 0) & 0xff)) << 24 >> 24)) & 0xffff) << 0)) | 0; // 83f55b: movsx si, al
        R.edx = (R.m.u32(((R.ecx + 0x69) | 0) >>> 0)) | 0; // 83f55f: mov edx, dword ptr [ecx + 0x69]
        R.push((R.edx >>> 0)); // 83f562: push edx
        R.esi = (R.shl((R.esi >>> 0), 0x1, 32)) | 0; // 83f563: shl esi, 1
        R.call(0x544410, { n: 4, thisEcx: false, calleeClean: false }); // 83f565: call 0x544410
        R.eax = ((R.eax & 0xffff0000) | (((((((R.eax >>> 0) & 0xff)) << 24 >> 24)) & 0xffff) << 0)) | 0; // 83f56a: movsx ax, al
        R.ecx = (0x1e) | 0; // 83f56e: mov ecx, 0x1e
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 83f573: add esp, 0x10
        R.ecx = (R.sub((R.ecx >>> 0), (R.esi >>> 0), 32)) | 0; // 83f576: sub ecx, esi
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 83f578: sub ecx, eax
        R.eax = (R.m.u32(((R.esp + 0x28) | 0) >>> 0)) | 0; // 83f57a: mov eax, dword ptr [esp + 0x28]
        R.eax = (R.add((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 83f57e: add eax, ecx
        pc = 0x83f5a6; continue; // 83f580: jmp 0x83f5a6
      case 0x83f582:
        R.eax = (R.m.u32(((R.ebx + 0x57) | 0) >>> 0)) | 0; // 83f582: mov eax, dword ptr [ebx + 0x57]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83f585: test eax, eax
        if (R.zf) { pc = 0x83f59f; continue; } // 83f587: je 0x83f59f
        pc = 0x83f589; continue;
      case 0x83f589:
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 83f589: mov edx, dword ptr [eax]
        R.eax = (R.m.u32(((0xadadfc) | 0) >>> 0)) | 0; // 83f58b: mov eax, dword ptr [0xadadfc]
        R.sub(R.m.u32(((R.eax + R.edx * 4) | 0) >>> 0), 0x0, 32); // 83f590: cmp dword ptr [eax + edx*4], 0
        if (R.zf) { pc = 0x83f59f; continue; } // 83f594: je 0x83f59f
        pc = 0x83f596; continue;
      case 0x83f596:
        R.eax = (R.m.u32(((R.esp + 0x28) | 0) >>> 0)) | 0; // 83f596: mov eax, dword ptr [esp + 0x28]
        R.eax = (R.add((R.eax >>> 0), 0xa, 32)) | 0; // 83f59a: add eax, 0xa
        pc = 0x83f5a6; continue; // 83f59d: jmp 0x83f5a6
      case 0x83f59f:
        R.eax = (R.m.u32(((R.esp + 0x28) | 0) >>> 0)) | 0; // 83f59f: mov eax, dword ptr [esp + 0x28]
        R.eax = (R.add((R.eax >>> 0), 0x5, 32)) | 0; // 83f5a3: add eax, 5
        pc = 0x83f5a6; continue;
      case 0x83f5a6:
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 83f5a6: mov dword ptr [esp + 0x28], eax
        pc = 0x83f5aa; continue;
      case 0x83f5aa:
        R.eax = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 83f5aa: mov eax, dword ptr [esp + 0x40]
        R.edi = (R.add((R.edi >>> 0), 0x4, 32)) | 0; // 83f5ae: add edi, 4
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 83f5b1: dec eax
        R.m.w32(((R.esp + 0x40) | 0) >>> 0, (R.eax >>> 0)); // 83f5b2: mov dword ptr [esp + 0x40], eax
        if (!R.zf) { pc = 0x83f542; continue; } // 83f5b6: jne 0x83f542
        pc = 0x83f5b8; continue;
      case 0x83f5b8:
        R.ecx = (((R.m.u16(((R.esp + 0x28) | 0) >>> 0)) << 16 >> 16)) | 0; // 83f5b8: movsx ecx, word ptr [esp + 0x28]
        R.eax = (0x66666667) | 0; // 83f5bd: mov eax, 0x66666667
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 83f5c2: imul ecx
        R.edx = (R.sar((R.edx >>> 0), 0x2, 32)) | 0; // 83f5c4: sar edx, 2
        R.ecx = ((R.edx >>> 0)) | 0; // 83f5c7: mov ecx, edx
        R.ecx = (R.shr((R.ecx >>> 0), 0x1f, 32)) | 0; // 83f5c9: shr ecx, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 83f5cc: add edx, ecx
        R.sub(((R.edx >>> 0) & 0xffff), 0x2, 16); // 83f5ce: cmp dx, 2
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.edx >>> 0)); // 83f5d2: mov dword ptr [esp + 0x28], edx
        if (!R.cL) { pc = 0x83f5e0; continue; } // 83f5d6: jge 0x83f5e0
        pc = 0x83f5d8; continue;
      case 0x83f5d8:
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0x2); // 83f5d8: mov dword ptr [esp + 0x28], 2
        pc = 0x83f5e0; continue;
      case 0x83f5e0:
        R.push(0x0); // 83f5e0: push 0
        R.push(0x0); // 83f5e2: push 0
        R.push(0x1); // 83f5e4: push 1
        R.push(0x0); // 83f5e6: push 0
        R.push((R.ebx >>> 0)); // 83f5e8: push ebx
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 83f5e9: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 83f5ee: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83f5f1: test eax, eax
        if (!R.zf) { pc = 0x840d69; continue; } // 83f5f3: jne 0x840d69
        pc = 0x83f5f9; continue;
      case 0x83f5f9:
        R.push((R.eax >>> 0)); // 83f5f9: push eax
        R.push((R.eax >>> 0)); // 83f5fa: push eax
        R.push(0x1); // 83f5fb: push 1
        R.push(0x1); // 83f5fd: push 1
        R.push((R.ebx >>> 0)); // 83f5ff: push ebx
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 83f600: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 83f605: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83f608: test eax, eax
        if (R.zf) { pc = 0x83f64e; continue; } // 83f60a: je 0x83f64e
        pc = 0x83f60c; continue;
      case 0x83f60c:
        R.push((R.ebx >>> 0)); // 83f60c: push ebx
        R.call(0x600e90, { n: 0, thisEcx: false, calleeClean: false }); // 83f60d: call 0x600e90
        R.push((R.ebx >>> 0)); // 83f612: push ebx
        R.m.w32(((R.esp + 0x50) | 0) >>> 0, (R.eax >>> 0)); // 83f613: mov dword ptr [esp + 0x50], eax
        R.call(0x53ca90, { n: 2, thisEcx: false, calleeClean: false }); // 83f617: call 0x53ca90
        R.ecx = (R.m.u32(((0xb63c98) | 0) >>> 0)) | 0; // 83f61c: mov ecx, dword ptr [0xb63c98]
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 83f622: add esp, 8
        R.push((R.eax >>> 0)); // 83f625: push eax
        R.call(0x5fd210, { n: 1, thisEcx: false, calleeClean: true }); // 83f626: call 0x5fd210
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83f62b: test eax, eax
        if (R.zf) { pc = 0x83f64e; continue; } // 83f62d: je 0x83f64e
        pc = 0x83f62f; continue;
      case 0x83f62f:
        R.push((R.ebx >>> 0)); // 83f62f: push ebx
        R.call(0x53ca90, { n: 1, thisEcx: false, calleeClean: false }); // 83f630: call 0x53ca90
        R.ecx = (R.m.u32(((0xb63c98) | 0) >>> 0)) | 0; // 83f635: mov ecx, dword ptr [0xb63c98]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 83f63b: add esp, 4
        R.push((R.eax >>> 0)); // 83f63e: push eax
        R.push(0x4); // 83f63f: push 4
        R.call(0x5fea50, { n: 2, thisEcx: false, calleeClean: true }); // 83f641: call 0x5fea50
        R.sub(((R.eax >>> 0) & 0xff), 0x1, 8); // 83f646: cmp al, 1
        if (R.zf) { pc = 0x840d69; continue; } // 83f648: je 0x840d69
        pc = 0x83f64e; continue;
      case 0x83f64e:
        R.esi = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 83f64e: mov esi, dword ptr [ebp + 8]
        R.sub(R.m.u32(((R.esi + 0x17) | 0) >>> 0), 0xffffffff, 32); // 83f651: cmp dword ptr [esi + 0x17], -1
        if (!R.zf) { pc = 0x840d69; continue; } // 83f655: jne 0x840d69
        pc = 0x83f65b; continue;
      case 0x83f65b:
        R.push((R.ebx >>> 0)); // 83f65b: push ebx
        R.call(0x53b900, { n: 1, thisEcx: false, calleeClean: false }); // 83f65c: call 0x53b900
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 83f661: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83f664: test eax, eax
        if (!R.zf) { pc = 0x840d69; continue; } // 83f666: jne 0x840d69
        pc = 0x83f66c; continue;
      case 0x83f66c:
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.esi + 0x1) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 83f66c: mov cx, word ptr [esi + 1]
        R.m.w32(((R.esp + 0x88) | 0) >>> 0, (R.eax >>> 0)); // 83f670: mov dword ptr [esp + 0x88], eax
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 83f677: mov al, byte ptr [esi + 0x24]
        R.edx = (R.m.u32(((R.esi + 0x3) | 0) >>> 0)) | 0; // 83f67a: mov edx, dword ptr [esi + 3]
        R.eax = ((R.eax & 0xffffff00) | (((R.shr(((R.eax >>> 0) & 0xff), 0x1, 8)) & 0xff) << 0)) | 0; // 83f67d: shr al, 1
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf, 8)) & 0xff) << 0)) | 0; // 83f67f: and al, 0xf
        R.m.w32(((R.esp + 0x68) | 0) >>> 0, (R.edx >>> 0)); // 83f681: mov dword ptr [esp + 0x68], edx
        R.push((R.eax >>> 0)); // 83f685: push eax
        R.push((R.ecx >>> 0)); // 83f686: push ecx
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 83f687: mov ecx, dword ptr [esp + 0x18]
        R.push((R.ebx >>> 0)); // 83f68b: push ebx
        R.call(0x84b230, { n: 3, thisEcx: false, calleeClean: true }); // 83f68c: call 0x84b230
        R.ecx = (R.m.u32(((0xae2a38) | 0) >>> 0)) | 0; // 83f691: mov ecx, dword ptr [0xae2a38]
        R.m.w32(((R.esp + 0x94) | 0) >>> 0, (R.eax >>> 0)); // 83f697: mov dword ptr [esp + 0x94], eax
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 83f69e: test ecx, ecx
        if (R.zf) { pc = 0x83f782; continue; } // 83f6a0: je 0x83f782
        pc = 0x83f6a6; continue;
      case 0x83f6a6:
        R.eax = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 83f6a6: mov eax, dword ptr [ebx + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83f6a9: test eax, eax
        if (R.zf) { pc = 0x83f771; continue; } // 83f6ab: je 0x83f771
        pc = 0x83f6b1; continue;
      case 0x83f6b1:
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 83f6b1: mov eax, dword ptr [eax]
        R.edx = (R.m.u32(((0x9cf360) | 0) >>> 0)) | 0; // 83f6b3: mov edx, dword ptr [0x9cf360]
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 83f6b9: cmp eax, edx
        if (R.zf) { pc = 0x83f6e1; continue; } // 83f6bb: je 0x83f6e1
        pc = 0x83f6bd; continue;
      case 0x83f6bd:
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf2e4) | 0) >>> 0), 32); // 83f6bd: cmp eax, dword ptr [0x9cf2e4]
        if (R.zf) { pc = 0x83f6e1; continue; } // 83f6c3: je 0x83f6e1
        pc = 0x83f6c5; continue;
      case 0x83f6c5:
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf314) | 0) >>> 0), 32); // 83f6c5: cmp eax, dword ptr [0x9cf314]
        if (R.zf) { pc = 0x83f6e1; continue; } // 83f6cb: je 0x83f6e1
        pc = 0x83f6cd; continue;
      case 0x83f6cd:
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf300) | 0) >>> 0), 32); // 83f6cd: cmp eax, dword ptr [0x9cf300]
        if (R.zf) { pc = 0x83f6e1; continue; } // 83f6d3: je 0x83f6e1
        pc = 0x83f6d5; continue;
      case 0x83f6d5:
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf488) | 0) >>> 0), 32); // 83f6d5: cmp eax, dword ptr [0x9cf488]
        if (!R.zf) { pc = 0x83f771; continue; } // 83f6db: jne 0x83f771
        pc = 0x83f6e1; continue;
      case 0x83f6e1:
        R.push((R.ebx >>> 0)); // 83f6e1: push ebx
        R.call(0x5a0590, { n: 1, thisEcx: true, calleeClean: true }); // 83f6e2: call 0x5a0590
        R.ecx = ((R.eax >>> 0)) | 0; // 83f6e7: mov ecx, eax
        R.call(0x5986b0, { n: 0, thisEcx: true, calleeClean: false }); // 83f6e9: call 0x5986b0
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 83f6ee: movsx eax, al
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 83f6f1: dec eax
        if (R.zf) { pc = 0x83f73e; continue; } // 83f6f2: je 0x83f73e
        pc = 0x83f6f4; continue;
      case 0x83f6f4:
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 83f6f4: dec eax
        if (R.zf) { pc = 0x83f70b; continue; } // 83f6f5: je 0x83f70b
        pc = 0x83f6f7; continue;
      case 0x83f6f7:
        R.edx = (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 83f6f7: movsx edx, word ptr [ebx + 0x80]
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.edx >>> 0)); // 83f6fe: mov dword ptr [esp + 0x20], edx
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 83f702: fild dword ptr [esp + 0x20]
        pc = 0x83f791; continue; // 83f706: jmp 0x83f791
      case 0x83f70b:
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 83f70b: mov ax, word ptr [ebx + 0x80]
        R.sub(((R.eax >>> 0) & 0xffff), 0x128e, 16); // 83f712: cmp ax, 0x128e
        if (R.cLE) { pc = 0x83f72b; continue; } // 83f716: jle 0x83f72b
        pc = 0x83f718; continue;
      case 0x83f718:
        R.eax = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 83f718: movsx eax, ax
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.eax >>> 0)); // 83f71b: mov dword ptr [esp + 0x20], eax
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 83f71f: fild dword ptr [esp + 0x20]
        R.st[0] = R.st[0] * 0.0009523809523809524; // 83f723: fmul qword ptr [0x96f8b8]
        pc = 0x83f797; continue; // 83f729: jmp 0x83f797
      case 0x83f72b:
        R.ecx = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 83f72b: movsx ecx, ax
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.ecx >>> 0)); // 83f72e: mov dword ptr [esp + 0x20], ecx
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 83f732: fild dword ptr [esp + 0x20]
        R.st[0] = R.st[0] * 0.0008888888888888889; // 83f736: fmul qword ptr [0x96f8b0]
        pc = 0x83f797; continue; // 83f73c: jmp 0x83f797
      case 0x83f73e:
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 83f73e: mov ax, word ptr [ebx + 0x80]
        R.sub(((R.eax >>> 0) & 0xffff), 0x186a, 16); // 83f745: cmp ax, 0x186a
        if (R.cLE) { pc = 0x83f75e; continue; } // 83f749: jle 0x83f75e
        pc = 0x83f74b; continue;
      case 0x83f74b:
        R.edx = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 83f74b: movsx edx, ax
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.edx >>> 0)); // 83f74e: mov dword ptr [esp + 0x20], edx
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 83f752: fild dword ptr [esp + 0x20]
        R.st[0] = R.st[0] * 0.0008888888888888889; // 83f756: fmul qword ptr [0x96f8b0]
        pc = 0x83f797; continue; // 83f75c: jmp 0x83f797
      case 0x83f75e:
        R.eax = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 83f75e: movsx eax, ax
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.eax >>> 0)); // 83f761: mov dword ptr [esp + 0x20], eax
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 83f765: fild dword ptr [esp + 0x20]
        R.st[0] = R.st[0] * 0.000851063829787234; // 83f769: fmul qword ptr [0x96f8a8]
        pc = 0x83f797; continue; // 83f76f: jmp 0x83f797
      case 0x83f771:
        R.ecx = (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 83f771: movsx ecx, word ptr [ebx + 0x80]
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.ecx >>> 0)); // 83f778: mov dword ptr [esp + 0x20], ecx
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 83f77c: fild dword ptr [esp + 0x20]
        pc = 0x83f791; continue; // 83f780: jmp 0x83f791
      case 0x83f782:
        R.edx = (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 83f782: movsx edx, word ptr [ebx + 0x80]
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.edx >>> 0)); // 83f789: mov dword ptr [esp + 0x20], edx
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 83f78d: fild dword ptr [esp + 0x20]
        pc = 0x83f791; continue;
      case 0x83f791:
        R.st[0] = R.st[0] * 0.0008; // 83f791: fmul qword ptr [0x96a618]
        pc = 0x83f797; continue;
      case 0x83f797:
        R.m.wf64(((R.esp + 0x6c) | 0) >>> 0, R.st[0]); // 83f797: fst qword ptr [esp + 0x6c]
        R.fcom(R.st[0], 1.0); R.fpop(); // 83f79b: fcomp qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 83f7a1: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 83f7a3: test ah, 0x41
        if (R.zf) { pc = 0x83f7b8; continue; } // 83f7a6: je 0x83f7b8
        pc = 0x83f7a8; continue;
      case 0x83f7a8:
        R.m.w32(((R.esp + 0x6c) | 0) >>> 0, 0x0); // 83f7a8: mov dword ptr [esp + 0x6c], 0
        R.m.w32(((R.esp + 0x70) | 0) >>> 0, 0x3ff00000); // 83f7b0: mov dword ptr [esp + 0x70], 0x3ff00000
        pc = 0x83f7b8; continue;
      case 0x83f7b8:
        R.eax = (R.m.u32(((R.esi + 0x13) | 0) >>> 0)) | 0; // 83f7b8: mov eax, dword ptr [esi + 0x13]
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 83f7bb: cmp eax, -1
        if (R.cLE) { pc = 0x83f8ab; continue; } // 83f7be: jle 0x83f8ab
        pc = 0x83f7c4; continue;
      case 0x83f7c4:
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 83f7c4: lea ecx, [eax + eax*4]
        R.eax = (((R.eax + R.ecx * 2) | 0)) | 0; // 83f7c7: lea eax, [eax + ecx*2]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 83f7ca: lea edx, [eax + eax*4]
        R.eax = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 83f7cd: mov eax, dword ptr [0xae23bc]
        R.esi = (((R.eax + R.edx * 2) | 0)) | 0; // 83f7d2: lea esi, [eax + edx*2]
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 83f7d5: mov eax, dword ptr [ebp + 8]
        R.sub(R.m.u8(((R.eax) | 0) >>> 0), 0xb, 8); // 83f7d8: cmp byte ptr [eax], 0xb
        if (!R.zf) { pc = 0x840d69; continue; } // 83f7db: jne 0x840d69
        pc = 0x83f7e1; continue;
      case 0x83f7e1:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 83f7e1: mov al, byte ptr [eax + 0x24]
        R.eax = ((R.eax & 0xffffff00) | (((R.shr(((R.eax >>> 0) & 0xff), 0x1, 8)) & 0xff) << 0)) | 0; // 83f7e4: shr al, 1
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf, 8)) & 0xff) << 0)) | 0; // 83f7e6: and al, 0xf
        R.sub(((R.eax >>> 0) & 0xff), 0x2, 8); // 83f7e8: cmp al, 2
        if (R.cf) { pc = 0x83f81c; continue; } // 83f7ea: jb 0x83f81c
        pc = 0x83f7ec; continue;
      case 0x83f7ec:
        R.sub(((R.eax >>> 0) & 0xff), 0x3, 8); // 83f7ec: cmp al, 3
        if (R.cBE) { pc = 0x83f7fb; continue; } // 83f7ee: jbe 0x83f7fb
        pc = 0x83f7f0; continue;
      case 0x83f7f0:
        R.sub(((R.eax >>> 0) & 0xff), 0x4, 8); // 83f7f0: cmp al, 4
        if (!R.zf) { pc = 0x83f81c; continue; } // 83f7f2: jne 0x83f81c
        pc = 0x83f7f4; continue;
      case 0x83f7f4:
        R.edi = (0x19c2) | 0; // 83f7f4: mov edi, 0x19c2
        pc = 0x83f821; continue; // 83f7f9: jmp 0x83f821
      case 0x83f7fb:
        R.push(0x0); // 83f7fb: push 0
        R.push(0x0); // 83f7fd: push 0
        R.push(0x1); // 83f7ff: push 1
        R.push(0x1); // 83f801: push 1
        R.push((R.ebx >>> 0)); // 83f803: push ebx
        R.edi = (0x18c2) | 0; // 83f804: mov edi, 0x18c2
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 83f809: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 83f80e: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83f811: test eax, eax
        if (R.zf) { pc = 0x83f821; continue; } // 83f813: je 0x83f821
        pc = 0x83f815; continue;
      case 0x83f815:
        R.edi = (0x8118c2) | 0; // 83f815: mov edi, 0x8118c2
        pc = 0x83f821; continue; // 83f81a: jmp 0x83f821
      case 0x83f81c:
        R.edi = (0x1902) | 0; // 83f81c: mov edi, 0x1902
        pc = 0x83f821; continue;
      case 0x83f821:
        R.ecx = (R.m.u32(((R.esp + 0x48) | 0) >>> 0)) | 0; // 83f821: mov ecx, dword ptr [esp + 0x48]
        R.edx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 83f825: mov edx, dword ptr [ebp + 8]
        R.push((R.ecx >>> 0)); // 83f828: push ecx
        R.push(0xffffffff); // 83f829: push -1
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.edx + 0x1) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 83f82b: mov ax, word ptr [edx + 1]
        R.push((R.ebx >>> 0)); // 83f82f: push ebx
        R.push((R.edi >>> 0)); // 83f830: push edi
        R.push((R.eax >>> 0)); // 83f831: push eax
        R.push((R.esi >>> 0)); // 83f832: push esi
        R.call(0x6e6340, { n: 6, thisEcx: false, calleeClean: false }); // 83f833: call 0x6e6340
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 83f838: mov ecx, dword ptr [0xae1050]
        R.esp = (R.add((R.esp >>> 0), 0x18, 32)) | 0; // 83f83e: add esp, 0x18
        R.edi = ((R.eax >>> 0)) | 0; // 83f841: mov edi, eax
        R.push((R.ebx >>> 0)); // 83f843: push ebx
        R.push((R.esi >>> 0)); // 83f844: push esi
        R.m.w32(((R.esp + 0x48) | 0) >>> 0, (R.edi >>> 0)); // 83f845: mov dword ptr [esp + 0x48], edi
        R.call(0x4cf5f0, { n: 2, thisEcx: true, calleeClean: true }); // 83f849: call 0x4cf5f0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83f84e: test eax, eax
        if (R.zf) { pc = 0x83f870; continue; } // 83f850: je 0x83f870
        pc = 0x83f852; continue;
      case 0x83f852:
        R.ecx = (R.m.u32(((R.eax + 0x45) | 0) >>> 0)) | 0; // 83f852: mov ecx, dword ptr [eax + 0x45]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 83f855: test ecx, ecx
        if (R.zf) { pc = 0x83f87c; continue; } // 83f857: je 0x83f87c
        pc = 0x83f859; continue;
      case 0x83f859:
        R.logic(((R.ecx >>> 8) & 0xff) & 0x1, 8); // 83f859: test ch, 1
        if (!R.zf) { pc = 0x83f870; continue; } // 83f85c: jne 0x83f870
        pc = 0x83f85e; continue;
      case 0x83f85e:
        R.logic(((R.ecx >>> 0) & 0xff) & 0x1, 8); // 83f85e: test cl, 1
        if (!R.zf) { pc = 0x83f870; continue; } // 83f861: jne 0x83f870
        pc = 0x83f863; continue;
      case 0x83f863:
        R.ecx = ((R.eax >>> 0)) | 0; // 83f863: mov ecx, eax
        R.call(0x85fa00, { n: 0, thisEcx: true, calleeClean: false }); // 83f865: call 0x85fa00
        R.sub(((R.eax >>> 0) & 0xffff), 0x16d, 16); // 83f86a: cmp ax, 0x16d
        if (!R.cL) { pc = 0x83f87c; continue; } // 83f86e: jge 0x83f87c
        pc = 0x83f870; continue;
      case 0x83f870:
        R.eax = (R.m.u32(((R.esp + 0x68) | 0) >>> 0)) | 0; // 83f870: mov eax, dword ptr [esp + 0x68]
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 83f874: cmp edi, eax
        if (R.cL) { pc = 0x83f87c; continue; } // 83f876: jl 0x83f87c
        pc = 0x83f878; continue;
      case 0x83f878:
        R.m.w32(((R.esp + 0x40) | 0) >>> 0, (R.eax >>> 0)); // 83f878: mov dword ptr [esp + 0x40], eax
        pc = 0x83f87c; continue;
      case 0x83f87c:
        R.fpush(R.m.s32(((R.esp + 0x68) | 0) >>> 0)); // 83f87c: fild dword ptr [esp + 0x68]
        R.fpush(R.m.s32(((R.esp + 0x40) | 0) >>> 0)); // 83f880: fild dword ptr [esp + 0x40]
        R.st[0] = R.st[0] * 1.05; // 83f884: fmul qword ptr [0x9689b8]
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 83f88a: fstp qword ptr [esp + 0x4c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x4c) | 0))); // 83f88e: fcom qword ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 83f892: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 83f894: test ah, 0x41
        if (R.zf) { pc = 0x83f89f; continue; } // 83f897: je 0x83f89f
        pc = 0x83f899; continue;
      case 0x83f899:
        R.fpop(); // 83f899: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 83f89b: fld qword ptr [esp + 0x4c]
        pc = 0x83f89f; continue;
      case 0x83f89f:
        R.ftol(); // 83f89f: call 0x945640
        R.esi = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 83f8a4: mov esi, dword ptr [ebp + 8]
        R.m.w32(((R.esp + 0x68) | 0) >>> 0, (R.eax >>> 0)); // 83f8a7: mov dword ptr [esp + 0x68], eax
        pc = 0x83f8ab; continue;
      case 0x83f8ab:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi) | 0) >>> 0)) & 0xff) << 0)) | 0; // 83f8ab: mov al, byte ptr [esi]
        R.ecx = (R.m.u32(((R.esp + 0x68) | 0) >>> 0)) | 0; // 83f8ad: mov ecx, dword ptr [esp + 0x68]
        R.sub(((R.eax >>> 0) & 0xff), 0xb, 8); // 83f8b1: cmp al, 0xb
        R.m.w32(((R.esp + 0x58) | 0) >>> 0, (R.ecx >>> 0)); // 83f8b3: mov dword ptr [esp + 0x58], ecx
        if (!R.zf) { pc = 0x83f8cf; continue; } // 83f8b7: jne 0x83f8cf
        pc = 0x83f8b9; continue;
      case 0x83f8b9:
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.esi + 0x1) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 83f8b9: mov dx, word ptr [esi + 1]
        R.ecx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 83f8bd: mov ecx, dword ptr [esp + 0x10]
        R.push((R.edx >>> 0)); // 83f8c1: push edx
        R.call(0x83bd00, { n: 1, thisEcx: false, calleeClean: true }); // 83f8c2: call 0x83bd00
        R.ecx = ((R.ecx & 0xffffff00) | (((((R.eax >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 83f8c7: mov cl, al
        R.m.w8(((R.esp + 0xf) | 0) >>> 0, ((R.ecx >>> 0) & 0xff)); // 83f8c9: mov byte ptr [esp + 0xf], cl
        pc = 0x83f8d8; continue; // 83f8cd: jmp 0x83f8d8
      case 0x83f8cf:
        R.m.w8(((R.esp + 0xf) | 0) >>> 0, 0xf); // 83f8cf: mov byte ptr [esp + 0xf], 0xf
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esp + 0xf) | 0) >>> 0)) & 0xff) << 0)) | 0; // 83f8d4: mov cl, byte ptr [esp + 0xf]
        pc = 0x83f8d8; continue;
      case 0x83f8d8:
        R.eax = (R.m.u32(((R.esi + 0x7) | 0) >>> 0)) | 0; // 83f8d8: mov eax, dword ptr [esi + 7]
        R.sub((R.eax >>> 0), 0x1, 32); // 83f8db: cmp eax, 1
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.eax >>> 0)); // 83f8de: mov dword ptr [esp + 0x20], eax
        if (!R.cLE) { pc = 0x83f8ec; continue; } // 83f8e2: jg 0x83f8ec
        pc = 0x83f8e4; continue;
      case 0x83f8e4:
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, 0x1); // 83f8e4: mov dword ptr [esp + 0x20], 1
        pc = 0x83f8ec; continue;
      case 0x83f8ec:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi) | 0) >>> 0)) & 0xff) << 0)) | 0; // 83f8ec: mov al, byte ptr [esi]
        R.edx = (R.logic((R.edx >>> 0) ^ (R.edx >>> 0), 32)) | 0; // 83f8ee: xor edx, edx
        R.sub(((R.eax >>> 0) & 0xff), 0xb, 8); // 83f8f0: cmp al, 0xb
        R.edx = ((R.edx & 0xffffff00) | (((R.zf ? 1 : 0) & 0xff) << 0)) | 0; // 83f8f2: sete dl
        R.edi = ((R.edx >>> 0)) | 0; // 83f8f5: mov edi, edx
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.esi + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 83f8f7: mov dl, byte ptr [esi + 0x24]
        R.logic(((R.edx >>> 0) & 0xff) & 0x1, 8); // 83f8fa: test dl, 1
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 83f8fd: mov dword ptr [esp + 0x14], edi
        if (R.zf) { pc = 0x83f90c; continue; } // 83f901: je 0x83f90c
        pc = 0x83f903; continue;
      case 0x83f903:
        R.sub(((R.eax >>> 0) & 0xff), 0xb, 8); // 83f903: cmp al, 0xb
        R.m.w8(((R.esp + 0x33) | 0) >>> 0, 0x1); // 83f905: mov byte ptr [esp + 0x33], 1
        if (R.zf) { pc = 0x83f911; continue; } // 83f90a: je 0x83f911
        pc = 0x83f90c; continue;
      case 0x83f90c:
        R.m.w8(((R.esp + 0x33) | 0) >>> 0, 0x0); // 83f90c: mov byte ptr [esp + 0x33], 0
        pc = 0x83f911; continue;
      case 0x83f911:
        R.edx = (R.m.u32(((R.ebp + 0x10) | 0) >>> 0)) | 0; // 83f911: mov edx, dword ptr [ebp + 0x10]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 83f914: test edx, edx
        if (R.zf) { pc = 0x83f971; continue; } // 83f916: je 0x83f971
        pc = 0x83f918; continue;
      case 0x83f918:
        R.esi = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 83f918: mov esi, dword ptr [esp + 0x10]
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 83f91c: mov eax, dword ptr [esi]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83f91e: test eax, eax
        if (R.zf) { pc = 0x83f971; continue; } // 83f920: je 0x83f971
        pc = 0x83f922; continue;
      case 0x83f922:
        R.ecx = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 83f922: mov ecx, dword ptr [edx]
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 83f924: test ebx, ebx
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.ecx >>> 0)); // 83f926: mov dword ptr [esp + 0x18], ecx
        if (R.zf) { pc = 0x83f934; continue; } // 83f92a: je 0x83f934
        pc = 0x83f92c; continue;
      case 0x83f92c:
        R.edx = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 83f92c: mov edx, dword ptr [ebx]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 83f92e: mov dword ptr [esp + 0x1c], edx
        pc = 0x83f93c; continue; // 83f932: jmp 0x83f93c
      case 0x83f934:
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, 0xffffffff); // 83f934: mov dword ptr [esp + 0x1c], 0xffffffff
        pc = 0x83f93c; continue;
      case 0x83f93c:
        R.ecx = (R.m.u32(((R.esi + 0x10) | 0) >>> 0)) | 0; // 83f93c: mov ecx, dword ptr [esi + 0x10]
        R.push(0x757ea0); // 83f93f: push 0x757ea0
        R.push(0x8); // 83f944: push 8
        R.push((R.ecx >>> 0)); // 83f946: push ecx
        R.edx = (((R.esp + 0x24) | 0)) | 0; // 83f947: lea edx, [esp + 0x24]
        R.push((R.eax >>> 0)); // 83f94b: push eax
        R.push((R.edx >>> 0)); // 83f94c: push edx
        R.call(0x946464, { n: 5, thisEcx: false, calleeClean: false }); // 83f94d: call 0x946464
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 83f952: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83f955: test eax, eax
        if (R.zf) { pc = 0x83f96d; continue; } // 83f957: je 0x83f96d
        pc = 0x83f959; continue;
      case 0x83f959:
        R.ecx = (R.m.u32(((R.ebp + 0x10) | 0) >>> 0)) | 0; // 83f959: mov ecx, dword ptr [ebp + 0x10]
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 83f95c: test edi, edi
        R.eax = ((R.eax & 0xffffff00) | (((R.zf ? 1 : 0) & 0xff) << 0)) | 0; // 83f95e: sete al
        R.push((R.eax >>> 0)); // 83f961: push eax
        R.push(0x3); // 83f962: push 3
        R.push((R.ebx >>> 0)); // 83f964: push ebx
        R.push((R.ecx >>> 0)); // 83f965: push ecx
        R.ecx = ((R.esi >>> 0)) | 0; // 83f966: mov ecx, esi
        R.call(0x843e10, { n: 4, thisEcx: true, calleeClean: true }); // 83f968: call 0x843e10
        pc = 0x83f96d; continue;
      case 0x83f96d:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esp + 0xf) | 0) >>> 0)) & 0xff) << 0)) | 0; // 83f96d: mov cl, byte ptr [esp + 0xf]
        pc = 0x83f971; continue;
      case 0x83f971:
        R.sub(((R.ecx >>> 0) & 0xff), 0x11, 8); // 83f971: cmp cl, 0x11
        if (!R.zf) { pc = 0x83f97f; continue; } // 83f974: jne 0x83f97f
        pc = 0x83f976; continue;
      case 0x83f976:
        R.eax = ((R.eax & 0xffffff00) | (((0x1) & 0xff) << 0)) | 0; // 83f976: mov al, 1
        R.m.w8(((R.esp + 0xe) | 0) >>> 0, 0x4); // 83f978: mov byte ptr [esp + 0xe], 4
        pc = 0x83f9bc; continue; // 83f97d: jmp 0x83f9bc
      case 0x83f97f:
        R.sub(((R.ecx >>> 0) & 0xff), 0x12, 8); // 83f97f: cmp cl, 0x12
        if (!R.zf) { pc = 0x83f98d; continue; } // 83f982: jne 0x83f98d
        pc = 0x83f984; continue;
      case 0x83f984:
        R.eax = ((R.eax & 0xffffff00) | (((0x8) & 0xff) << 0)) | 0; // 83f984: mov al, 8
        R.m.w8(((R.esp + 0xe) | 0) >>> 0, 0xd); // 83f986: mov byte ptr [esp + 0xe], 0xd
        pc = 0x83f9bc; continue; // 83f98b: jmp 0x83f9bc
      case 0x83f98d:
        R.sub(((R.ecx >>> 0) & 0xff), 0x13, 8); // 83f98d: cmp cl, 0x13
        if (!R.zf) { pc = 0x83f99b; continue; } // 83f990: jne 0x83f99b
        pc = 0x83f992; continue;
      case 0x83f992:
        R.eax = ((R.eax & 0xffffff00) | (((0x5) & 0xff) << 0)) | 0; // 83f992: mov al, 5
        R.m.w8(((R.esp + 0xe) | 0) >>> 0, 0x7); // 83f994: mov byte ptr [esp + 0xe], 7
        pc = 0x83f9bc; continue; // 83f999: jmp 0x83f9bc
      case 0x83f99b:
        R.sub(((R.ecx >>> 0) & 0xff), 0x15, 8); // 83f99b: cmp cl, 0x15
        if (!R.zf) { pc = 0x83f9a9; continue; } // 83f99e: jne 0x83f9a9
        pc = 0x83f9a0; continue;
      case 0x83f9a0:
        R.eax = ((R.eax & 0xffffff00) | (((0xb) & 0xff) << 0)) | 0; // 83f9a0: mov al, 0xb
        R.m.w8(((R.esp + 0xe) | 0) >>> 0, 0xd); // 83f9a2: mov byte ptr [esp + 0xe], 0xd
        pc = 0x83f9bc; continue; // 83f9a7: jmp 0x83f9bc
      case 0x83f9a9:
        R.sub(((R.ecx >>> 0) & 0xff), 0x14, 8); // 83f9a9: cmp cl, 0x14
        if (!R.zf) { pc = 0x83f9b6; continue; } // 83f9ac: jne 0x83f9b6
        pc = 0x83f9ae; continue;
      case 0x83f9ae:
        R.eax = ((R.eax & 0xffffff00) | (((0xe) & 0xff) << 0)) | 0; // 83f9ae: mov al, 0xe
        R.m.w8(((R.esp + 0xe) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 83f9b0: mov byte ptr [esp + 0xe], al
        pc = 0x83f9bc; continue; // 83f9b4: jmp 0x83f9bc
      case 0x83f9b6:
        R.m.w8(((R.esp + 0xe) | 0) >>> 0, ((R.ecx >>> 0) & 0xff)); // 83f9b6: mov byte ptr [esp + 0xe], cl
        R.eax = ((R.eax & 0xffffff00) | (((((R.ecx >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 83f9ba: mov al, cl
        pc = 0x83f9bc; continue;
      case 0x83f9bc:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esp + 0xe) | 0) >>> 0)) & 0xff) << 0)) | 0; // 83f9bc: mov cl, byte ptr [esp + 0xe]
        R.ebx = ((R.ebx & 0xffffff00) | (((((R.eax >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 83f9c0: mov bl, al
        R.sub(((R.eax >>> 0) & 0xff), ((R.ecx >>> 0) & 0xff), 8); // 83f9c2: cmp al, cl
        R.m.w8(((R.esp + 0xf) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 83f9c4: mov byte ptr [esp + 0xf], bl
        if (!R.cLE) { pc = 0x840c67; continue; } // 83f9c8: jg 0x840c67
        pc = 0x83f9ce; continue;
      case 0x83f9ce:
        R.esi = (((R.m.u8(((R.esp + 0x33) | 0) >>> 0)) << 24 >> 24)) | 0; // 83f9ce: movsx esi, byte ptr [esp + 0x33]
        R.esi = (R.shl((R.esi >>> 0), 0x4, 32)) | 0; // 83f9d3: shl esi, 4
        R.m.w32(((R.esp + 0x78) | 0) >>> 0, (R.esi >>> 0)); // 83f9d6: mov dword ptr [esp + 0x78], esi
        pc = 0x83f9da; continue;
      case 0x83f9da:
        R.ecx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 83f9da: mov ecx, dword ptr [esp + 0x10]
        R.eax = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 83f9de: movsx eax, bl
        R.edx = (((R.eax + R.esi) | 0)) | 0; // 83f9e1: lea edx, [eax + esi]
        R.edx = (R.m.u32(((R.ecx + R.edx * 4 + 0x18) | 0) >>> 0)) | 0; // 83f9e4: mov edx, dword ptr [ecx + edx*4 + 0x18]
        R.m.w32(((R.esp + 0x90) | 0) >>> 0, (R.edx >>> 0)); // 83f9e8: mov dword ptr [esp + 0x90], edx
        R.sub(R.m.u32(((R.edx) | 0) >>> 0), 0xffffffff, 32); // 83f9ef: cmp dword ptr [edx], -1
        if (R.zf) { pc = 0x840ab3; continue; } // 83f9f2: je 0x840ab3
        pc = 0x83f9f8; continue;
      case 0x83f9f8:
        R.ecx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 83f9f8: mov ecx, dword ptr [esp + 0x10]
        R.eax = (R.m.u32(((R.ecx + R.eax * 4 + 0x98) | 0) >>> 0)) | 0; // 83f9fc: mov eax, dword ptr [ecx + eax*4 + 0x98]
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 83fa03: xor ecx, ecx
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83fa05: test eax, eax
        R.m.w32(((R.esp + 0x8c) | 0) >>> 0, (R.eax >>> 0)); // 83fa07: mov dword ptr [esp + 0x8c], eax
        R.m.w32(((R.esp + 0x40) | 0) >>> 0, (R.ecx >>> 0)); // 83fa0e: mov dword ptr [esp + 0x40], ecx
        if (R.cLE) { pc = 0x840aa1; continue; } // 83fa12: jle 0x840aa1
        pc = 0x83fa18; continue;
      case 0x83fa18:
        pc = 0x83fa25; continue; // 83fa18: jmp 0x83fa25
      case 0x83fa1a:
        R.edx = (R.m.u32(((R.esp + 0x90) | 0) >>> 0)) | 0; // 83fa1a: mov edx, dword ptr [esp + 0x90]
        R.ecx = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 83fa21: mov ecx, dword ptr [esp + 0x40]
        pc = 0x83fa25; continue;
      case 0x83fa25:
        { const h = PC_HOOK[0x83fa25]; if (h) { const np = h(R); if (np) { pc = np; continue; } } } // (håndindsat: cmShortlistGame.ts' hurtige frasortering af kandidaten)
        R.eax = (((R.ecx + R.ecx * 2) | 0)) | 0; // 83fa25: lea eax, [ecx + ecx*2]
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, 0x0); // 83fa28: mov dword ptr [esp + 0x34], 0
        R.ebx = (((R.edx + R.eax * 4) | 0)) | 0; // 83fa30: lea ebx, [edx + eax*4]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.ebx >>> 0)); // 83fa33: mov dword ptr [esp + 0x24], ebx
        R.eax = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 83fa37: mov eax, dword ptr [ebx]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 83fa39: lea ecx, [eax + eax*4]
        R.eax = (((R.eax + R.ecx * 2) | 0)) | 0; // 83fa3c: lea eax, [eax + ecx*2]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 83fa3f: lea edx, [eax + eax*4]
        R.eax = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 83fa42: mov eax, dword ptr [0xae23bc]
        R.esi = (((R.eax + R.edx * 2) | 0)) | 0; // 83fa47: lea esi, [eax + edx*2]
        R.eax = (R.m.u32(((R.ebp + 0x10) | 0) >>> 0)) | 0; // 83fa4a: mov eax, dword ptr [ebp + 0x10]
        R.sub((R.esi >>> 0), (R.eax >>> 0), 32); // 83fa4d: cmp esi, eax
        if (R.zf) { pc = 0x840a81; continue; } // 83fa4f: je 0x840a81
        pc = 0x83fa55; continue;
      case 0x83fa55:
        R.ecx = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 83fa55: mov ecx, dword ptr [0xae2364]
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 83fa5b: mov eax, dword ptr [esi]
        R.ecx = (R.add((R.ecx >>> 0), 0xfffffff0, 32)) | 0; // 83fa5d: add ecx, -0x10
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 83fa60: cmp eax, ecx
        if (!R.cL) { pc = 0x840a81; continue; } // 83fa62: jge 0x840a81
        pc = 0x83fa68; continue;
      case 0x83fa68:
        R.sub(R.m.u8(((R.esi + 0x3d) | 0) >>> 0), 0x5, 8); // 83fa68: cmp byte ptr [esi + 0x3d], 5
        if (R.zf) { pc = 0x840a81; continue; } // 83fa6c: je 0x840a81
        pc = 0x83fa72; continue;
      case 0x83fa72:
        R.sub(R.m.u8(((R.esi + 0x28) | 0) >>> 0), 0x5, 8); // 83fa72: cmp byte ptr [esi + 0x28], 5
        if (R.zf) { pc = 0x840a81; continue; } // 83fa76: je 0x840a81
        pc = 0x83fa7c; continue;
      case 0x83fa7c:
        R.eax = (R.m.u32(((R.esi + 0x69) | 0) >>> 0)) | 0; // 83fa7c: mov eax, dword ptr [esi + 0x69]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83fa7f: test eax, eax
        if (R.zf) { pc = 0x83fa9b; continue; } // 83fa81: je 0x83fa9b
        pc = 0x83fa83; continue;
      case 0x83fa83:
        R.ecx = (R.m.u32(((0xb67a44) | 0) >>> 0)) | 0; // 83fa83: mov ecx, dword ptr [0xb67a44]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 83fa89: test ecx, ecx
        if (R.zf) { pc = 0x83fa9b; continue; } // 83fa8b: je 0x83fa9b
        pc = 0x83fa8d; continue;
      case 0x83fa8d:
        R.push((R.esi >>> 0)); // 83fa8d: push esi
        R.call(0x69fc60, { n: 1, thisEcx: true, calleeClean: true }); // 83fa8e: call 0x69fc60
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 83fa93: test al, al
        if (!R.zf) { pc = 0x840a81; continue; } // 83fa95: jne 0x840a81
        pc = 0x83fa9b; continue;
      case 0x83fa9b:
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 83fa9b: mov eax, dword ptr [esp + 0x14]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83fa9f: test eax, eax
        if (R.zf) { pc = 0x83fbdf; continue; } // 83faa1: je 0x83fbdf
        pc = 0x83faa7; continue;
      case 0x83faa7:
        R.edi = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 83faa7: mov edi, dword ptr [ebp + 0xc]
        R.push(0x0); // 83faaa: push 0
        R.push(0x0); // 83faac: push 0
        R.push(0x1); // 83faae: push 1
        R.push(0x1); // 83fab0: push 1
        R.push((R.edi >>> 0)); // 83fab2: push edi
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 83fab3: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 83fab8: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83fabb: test eax, eax
        if (R.zf) { pc = 0x83fb1e; continue; } // 83fabd: je 0x83fb1e
        pc = 0x83fabf; continue;
      case 0x83fabf:
        R.push((R.edi >>> 0)); // 83fabf: push edi
        R.call(0x53ca90, { n: 1, thisEcx: false, calleeClean: false }); // 83fac0: call 0x53ca90
        R.ecx = (R.m.u32(((0xb63c98) | 0) >>> 0)) | 0; // 83fac5: mov ecx, dword ptr [0xb63c98]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 83facb: add esp, 4
        R.push((R.eax >>> 0)); // 83face: push eax
        R.call(0x5fd210, { n: 1, thisEcx: false, calleeClean: true }); // 83facf: call 0x5fd210
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83fad4: test eax, eax
        if (R.zf) { pc = 0x83fb1e; continue; } // 83fad6: je 0x83fb1e
        pc = 0x83fad8; continue;
      case 0x83fad8:
        R.push((R.edi >>> 0)); // 83fad8: push edi
        R.call(0x53ca90, { n: 1, thisEcx: false, calleeClean: false }); // 83fad9: call 0x53ca90
        R.ecx = (R.m.u32(((0xb74448) | 0) >>> 0)) | 0; // 83fade: mov ecx, dword ptr [0xb74448]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 83fae4: add esp, 4
        R.push((R.eax >>> 0)); // 83fae7: push eax
        R.push((R.esi >>> 0)); // 83fae8: push esi
        R.call(0x7f7490, { n: 2, thisEcx: true, calleeClean: true }); // 83fae9: call 0x7f7490
        R.ebx = ((R.eax >>> 0)) | 0; // 83faee: mov ebx, eax
        R.push((R.edi >>> 0)); // 83faf0: push edi
        R.m.w32(((R.esp + 0x88) | 0) >>> 0, (R.ebx >>> 0)); // 83faf1: mov dword ptr [esp + 0x88], ebx
        R.call(0x53ca90, { n: 1, thisEcx: false, calleeClean: false }); // 83faf8: call 0x53ca90
        R.ecx = (R.m.u32(((0xb63c98) | 0) >>> 0)) | 0; // 83fafd: mov ecx, dword ptr [0xb63c98]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 83fb03: add esp, 4
        R.push((R.eax >>> 0)); // 83fb06: push eax
        R.push(0x4); // 83fb07: push 4
        R.call(0x5fea50, { n: 2, thisEcx: false, calleeClean: true }); // 83fb09: call 0x5fea50
        R.sub(((R.eax >>> 0) & 0xff), 0x2, 8); // 83fb0e: cmp al, 2
        if (!R.zf) { pc = 0x83fb1a; continue; } // 83fb10: jne 0x83fb1a
        pc = 0x83fb12; continue;
      case 0x83fb12:
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 83fb12: test ebx, ebx
        if (R.zf) { pc = 0x840a81; continue; } // 83fb14: je 0x840a81
        pc = 0x83fb1a; continue;
      case 0x83fb1a:
        R.ebx = (R.m.u32(((R.esp + 0x24) | 0) >>> 0)) | 0; // 83fb1a: mov ebx, dword ptr [esp + 0x24]
        pc = 0x83fb1e; continue;
      case 0x83fb1e:
        R.sub(R.m.u8(((R.esi + 0x3d) | 0) >>> 0), 0xb, 8); // 83fb1e: cmp byte ptr [esi + 0x3d], 0xb
        if (!R.zf) { pc = 0x840a81; continue; } // 83fb22: jne 0x840a81
        pc = 0x83fb28; continue;
      case 0x83fb28:
        R.eax = (R.m.u32(((R.esi + 0x24) | 0) >>> 0)) | 0; // 83fb28: mov eax, dword ptr [esi + 0x24]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83fb2b: test eax, eax
        if (R.zf) { pc = 0x83fb39; continue; } // 83fb2d: je 0x83fb39
        pc = 0x83fb2f; continue;
      case 0x83fb2f:
        R.sub(R.m.u8(((R.esi + 0x28) | 0) >>> 0), 0x5, 8); // 83fb2f: cmp byte ptr [esi + 0x28], 5
        if (R.zf) { pc = 0x840a81; continue; } // 83fb33: je 0x840a81
        pc = 0x83fb39; continue;
      case 0x83fb39:
        R.eax = (R.m.u32(((R.esi + 0x61) | 0) >>> 0)) | 0; // 83fb39: mov eax, dword ptr [esi + 0x61]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83fb3c: test eax, eax
        if (R.zf) { pc = 0x840a81; continue; } // 83fb3e: je 0x840a81
        pc = 0x83fb44; continue;
      case 0x83fb44:
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 83fb44: mov eax, dword ptr [esi]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 83fb46: lea edx, [eax + eax*4]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 83fb49: shl edx, 4
        R.edx = (R.sub((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 83fb4c: sub edx, eax
        R.eax = (R.m.u32(((0xae2d0c) | 0) >>> 0)) | 0; // 83fb4e: mov eax, dword ptr [0xae2d0c]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.edx + R.eax + 0xb) | 0) >>> 0)) & 0xff) << 0)) | 0; // 83fb53: mov cl, byte ptr [edx + eax + 0xb]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0x30, 8)) & 0xff) << 0)) | 0; // 83fb57: and cl, 0x30
        R.sub(((R.ecx >>> 0) & 0xff), 0x10, 8); // 83fb5a: cmp cl, 0x10
        if (R.zf) { pc = 0x840a81; continue; } // 83fb5d: je 0x840a81
        pc = 0x83fb63; continue;
      case 0x83fb63:
        R.eax = (R.m.u32(((R.esi + 0x1a) | 0) >>> 0)) | 0; // 83fb63: mov eax, dword ptr [esi + 0x1a]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83fb66: test eax, eax
        if (R.zf) { pc = 0x83fb79; continue; } // 83fb68: je 0x83fb79
        pc = 0x83fb6a; continue;
      case 0x83fb6a:
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 83fb6a: mov edx, dword ptr [eax]
        R.eax = (R.m.u32(((0x9cf458) | 0) >>> 0)) | 0; // 83fb6c: mov eax, dword ptr [0x9cf458]
        R.sub((R.edx >>> 0), (R.eax >>> 0), 32); // 83fb71: cmp edx, eax
        if (R.zf) { pc = 0x840a81; continue; } // 83fb73: je 0x840a81
        pc = 0x83fb79; continue;
      case 0x83fb79:
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 83fb79: mov eax, dword ptr [ebp + 8]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 83fb7c: mov al, byte ptr [eax + 0x24]
        R.ecx = ((R.ecx & 0xffffff00) | (((((R.eax >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 83fb7f: mov cl, al
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0x1e, 8)) & 0xff) << 0)) | 0; // 83fb81: and cl, 0x1e
        R.sub(((R.ecx >>> 0) & 0xff), 0xa, 8); // 83fb84: cmp cl, 0xa
        if (!R.zf) { pc = 0x83fb93; continue; } // 83fb87: jne 0x83fb93
        pc = 0x83fb89; continue;
      case 0x83fb89:
        R.sub(R.m.u8(((R.esi + 0x18) | 0) >>> 0), 0x17, 8); // 83fb89: cmp byte ptr [esi + 0x18], 0x17
        if (!R.cLE) { pc = 0x840a81; continue; } // 83fb8d: jg 0x840a81
        pc = 0x83fb93; continue;
      case 0x83fb93:
        R.logic(((R.eax >>> 0) & 0xff) & 0x1, 8); // 83fb93: test al, 1
        if (!R.zf) { pc = 0x83fbb8; continue; } // 83fb95: jne 0x83fbb8
        pc = 0x83fb97; continue;
      case 0x83fb97:
        R.fpush(R.m.s32(((R.ebx + 0x8) | 0) >>> 0)); // 83fb97: fild dword ptr [ebx + 8]
        R.edx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 83fb9a: mov edx, dword ptr [ebp + 8]
        R.st[0] = R.st[0] * 1.3; // 83fb9d: fmul qword ptr [0x968de8]
        R.fpush(R.m.s32(((R.edx + 0x7) | 0) >>> 0)); // 83fba3: fild dword ptr [edx + 7]
        R.fcom(R.st[0], R.st[1]); R.fpop(); R.fpop(); // 83fba6: fcompp 
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 83fba8: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 83fbaa: test ah, 1
        if (!R.zf) { pc = 0x840a81; continue; } // 83fbad: jne 0x840a81
        pc = 0x83fbb3; continue;
      case 0x83fbb3:
        pc = 0x83fc56; continue; // 83fbb3: jmp 0x83fc56
      case 0x83fbb8:
        R.eax = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 83fbb8: mov eax, dword ptr [esi + 0x39]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83fbbb: test eax, eax
        if (R.zf) { pc = 0x83fbca; continue; } // 83fbbd: je 0x83fbca
        pc = 0x83fbbf; continue;
      case 0x83fbbf:
        R.eax = (R.m.u32(((R.ebx + 0x8) | 0) >>> 0)) | 0; // 83fbbf: mov eax, dword ptr [ebx + 8]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83fbc2: test eax, eax
        if (R.cLE) { pc = 0x83fc56; continue; } // 83fbc4: jle 0x83fc56
        pc = 0x83fbca; continue;
      case 0x83fbca:
        R.push(0x0); // 83fbca: push 0
        R.push((R.esi >>> 0)); // 83fbcc: push esi
        R.call(0x544590, { n: 2, thisEcx: false, calleeClean: false }); // 83fbcd: call 0x544590
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 83fbd2: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83fbd5: test eax, eax
        if (R.zf) { pc = 0x840a81; continue; } // 83fbd7: je 0x840a81
        pc = 0x83fbdd; continue;
      case 0x83fbdd:
        pc = 0x83fc56; continue; // 83fbdd: jmp 0x83fc56
      case 0x83fbdf:
        R.eax = (R.m.u32(((R.esi + 0x69) | 0) >>> 0)) | 0; // 83fbdf: mov eax, dword ptr [esi + 0x69]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83fbe2: test eax, eax
        if (R.zf) { pc = 0x840a81; continue; } // 83fbe4: je 0x840a81
        pc = 0x83fbea; continue;
      case 0x83fbea:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 83fbea: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 83fbf0: push esi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 83fbf1: call 0x4cf5a0
        R.edi = ((R.eax >>> 0)) | 0; // 83fbf6: mov edi, eax
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 83fbf8: test edi, edi
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.edi >>> 0)); // 83fbfa: mov dword ptr [esp + 0x34], edi
        if (R.zf) { pc = 0x83fc2c; continue; } // 83fbfe: je 0x83fc2c
        pc = 0x83fc00; continue;
      case 0x83fc00:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edi + 0x35) | 0) >>> 0)) & 0xff) << 0)) | 0; // 83fc00: mov al, byte ptr [edi + 0x35]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x3f, 8)) & 0xff) << 0)) | 0; // 83fc03: and al, 0x3f
        R.sub(((R.eax >>> 0) & 0xff), 0x2, 8); // 83fc05: cmp al, 2
        if (!R.zf) { pc = 0x83fc2c; continue; } // 83fc07: jne 0x83fc2c
        pc = 0x83fc09; continue;
      case 0x83fc09:
        R.ecx = ((R.edi >>> 0)) | 0; // 83fc09: mov ecx, edi
        R.call(0x85fa00, { n: 0, thisEcx: true, calleeClean: false }); // 83fc0b: call 0x85fa00
        R.ecx = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 83fc10: movsx ecx, ax
        { const p = BigInt(((R.m.u32(((R.edi + 0xc) | 0) >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 83fc13: imul ecx, dword ptr [edi + 0xc]
        R.eax = (0x92492493) | 0; // 83fc17: mov eax, 0x92492493
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 83fc1c: imul ecx
        R.edx = (R.add((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 83fc1e: add edx, ecx
        R.edx = (R.sar((R.edx >>> 0), 0x2, 32)) | 0; // 83fc20: sar edx, 2
        R.ecx = ((R.edx >>> 0)) | 0; // 83fc23: mov ecx, edx
        R.ecx = (R.shr((R.ecx >>> 0), 0x1f, 32)) | 0; // 83fc25: shr ecx, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 83fc28: add edx, ecx
        pc = 0x83fc2e; continue; // 83fc2a: jmp 0x83fc2e
      case 0x83fc2c:
        R.edx = (R.logic((R.edx >>> 0) ^ (R.edx >>> 0), 32)) | 0; // 83fc2c: xor edx, edx
        pc = 0x83fc2e; continue;
      case 0x83fc2e:
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 83fc2e: mov eax, dword ptr [ebp + 8]
        R.sub((R.edx >>> 0), R.m.u32(((R.eax + 0x7) | 0) >>> 0), 32); // 83fc31: cmp edx, dword ptr [eax + 7]
        if (!R.cL) { pc = 0x840a81; continue; } // 83fc34: jge 0x840a81
        pc = 0x83fc3a; continue;
      case 0x83fc3a:
        R.ecx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 83fc3a: mov ecx, dword ptr [ebp + 0xc]
        R.eax = (((R.m.u16(((R.ecx + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 83fc3d: movsx eax, word ptr [ecx + 0x80]
        R.eax = (R.add((R.eax >>> 0), 0x1f4, 32)) | 0; // 83fc44: add eax, 0x1f4
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 83fc49: lea eax, [eax + eax*4]
        R.eax = (R.shl((R.eax >>> 0), 0x1, 32)) | 0; // 83fc4c: shl eax, 1
        R.sub((R.edx >>> 0), (R.eax >>> 0), 32); // 83fc4e: cmp edx, eax
        if (!R.cLE) { pc = 0x840a81; continue; } // 83fc50: jg 0x840a81
        pc = 0x83fc56; continue;
      case 0x83fc56:
        R.ecx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 83fc56: mov ecx, dword ptr [ebp + 0xc]
        R.eax = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 83fc59: mov eax, dword ptr [esi + 0x39]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 83fc5c: cmp eax, ecx
        if (R.zf) { pc = 0x840a81; continue; } // 83fc5e: je 0x840a81
        pc = 0x83fc64; continue;
      case 0x83fc64:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 83fc64: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 83fc6a: push esi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 83fc6b: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83fc70: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 83fc72: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x83fc91; continue; } // 83fc77: je 0x83fc91
        pc = 0x83fc79; continue;
      case 0x83fc79:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 83fc79: mov eax, dword ptr [eax + 4]
        R.ecx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 83fc7c: mov ecx, dword ptr [0xae23b4]
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 83fc82: lea edx, [eax + eax*8]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 83fc85: shl edx, 4
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 83fc88: add edx, eax
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 83fc8a: add ecx, eax
        R.eax = (((R.ecx + R.edx * 4) | 0)) | 0; // 83fc8c: lea eax, [ecx + edx*4]
        pc = 0x83fc93; continue; // 83fc8f: jmp 0x83fc93
      case 0x83fc91:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 83fc91: xor eax, eax
        pc = 0x83fc93; continue;
      case 0x83fc93:
        R.sub((R.eax >>> 0), R.m.u32(((R.ebp + 0xc) | 0) >>> 0), 32); // 83fc93: cmp eax, dword ptr [ebp + 0xc]
        if (R.zf) { pc = 0x840a81; continue; } // 83fc96: je 0x840a81
        pc = 0x83fc9c; continue;
      case 0x83fc9c:
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 83fc9c: mov eax, dword ptr [esi]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 83fc9e: lea edx, [eax + eax*4]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 83fca1: shl edx, 4
        R.edx = (R.sub((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 83fca4: sub edx, eax
        R.eax = (R.m.u32(((0xae2d0c) | 0) >>> 0)) | 0; // 83fca6: mov eax, dword ptr [0xae2d0c]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.edx + R.eax + 0xb) | 0) >>> 0)) & 0xff) << 0)) | 0; // 83fcab: mov cl, byte ptr [edx + eax + 0xb]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0xf, 8)) & 0xff) << 0)) | 0; // 83fcaf: and cl, 0xf
        R.sub(((R.ecx >>> 0) & 0xff), 0xa, 8); // 83fcb2: cmp cl, 0xa
        if (!R.cf) { pc = 0x840a81; continue; } // 83fcb5: jae 0x840a81
        pc = 0x83fcbb; continue;
      case 0x83fcbb:
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 83fcbb: mov eax, dword ptr [esp + 0x14]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83fcbf: test eax, eax
        if (R.zf) { pc = 0x83fd57; continue; } // 83fcc1: je 0x83fd57
        pc = 0x83fcc7; continue;
      case 0x83fcc7:
        R.eax = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 83fcc7: mov eax, dword ptr [esi + 0x39]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83fcca: test eax, eax
        if (R.zf) { pc = 0x83fd57; continue; } // 83fccc: je 0x83fd57
        pc = 0x83fcd2; continue;
      case 0x83fcd2:
        R.edx = (((R.esp + 0xb0) | 0)) | 0; // 83fcd2: lea edx, [esp + 0xb0]
        R.push(0xc8); // 83fcd9: push 0xc8
        R.push((R.edx >>> 0)); // 83fcde: push edx
        R.ecx = (0xae2c90) | 0; // 83fcdf: mov ecx, 0xae2c90
        R.call(0x54c8e0, { n: 2, thisEcx: true, calleeClean: true }); // 83fce4: call 0x54c8e0
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 83fce9: mov ecx, dword ptr [eax]
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 83fceb: mov eax, dword ptr [eax + 4]
        R.m.w32(((R.esp + 0xa8) | 0) >>> 0, (R.ecx >>> 0)); // 83fcee: mov dword ptr [esp + 0xa8], ecx
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.esp + 0xaa) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 83fcf5: mov dx, word ptr [esp + 0xaa]
        R.m.w32(((R.esp + 0xac) | 0) >>> 0, (R.eax >>> 0)); // 83fcfd: mov dword ptr [esp + 0xac], eax
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.esi + 0x40) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 83fd04: mov ax, word ptr [esi + 0x40]
        R.sub(((R.edx >>> 0) & 0xffff), ((R.eax >>> 0) & 0xffff), 16); // 83fd08: cmp dx, ax
        if (R.cf) { pc = 0x83fd1c; continue; } // 83fd0b: jb 0x83fd1c
        pc = 0x83fd0d; continue;
      case 0x83fd0d:
        if (!R.cBE) { pc = 0x83fd57; continue; } // 83fd0d: ja 0x83fd57
        pc = 0x83fd0f; continue;
      case 0x83fd0f:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 83fd0f: xor eax, eax
        R.sub(((R.ecx >>> 0) & 0xffff), R.m.u16(((R.esi + 0x3e) | 0) >>> 0), 16); // 83fd11: cmp cx, word ptr [esi + 0x3e]
        R.eax = ((R.eax & 0xffffff00) | (((R.cL ? 1 : 0) & 0xff) << 0)) | 0; // 83fd15: setl al
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83fd18: test eax, eax
        if (R.zf) { pc = 0x83fd57; continue; } // 83fd1a: je 0x83fd57
        pc = 0x83fd1c; continue;
      case 0x83fd1c:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 83fd1c: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 83fd22: push esi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 83fd23: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83fd28: test eax, eax
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.eax >>> 0)); // 83fd2a: mov dword ptr [esp + 0x34], eax
        if (R.zf) { pc = 0x83fd57; continue; } // 83fd2e: je 0x83fd57
        pc = 0x83fd30; continue;
      case 0x83fd30:
        R.ecx = ((R.eax >>> 0)) | 0; // 83fd30: mov ecx, eax
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.ecx + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 83fd32: mov dl, byte ptr [ecx + 0x4f]
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 83fd35: and dl, 0xf0
        R.sub(((R.edx >>> 0) & 0xff), 0x70, 8); // 83fd38: cmp dl, 0x70
        if (R.zf) { pc = 0x83fd57; continue; } // 83fd3b: je 0x83fd57
        pc = 0x83fd3d; continue;
      case 0x83fd3d:
        R.ecx = (R.m.u32(((R.eax + 0x45) | 0) >>> 0)) | 0; // 83fd3d: mov ecx, dword ptr [eax + 0x45]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 83fd40: test ecx, ecx
        if (!R.zf) { pc = 0x83fd57; continue; } // 83fd42: jne 0x83fd57
        pc = 0x83fd44; continue;
      case 0x83fd44:
        R.push(0x0); // 83fd44: push 0
        R.push((R.esi >>> 0)); // 83fd46: push esi
        R.call(0x544520, { n: 2, thisEcx: false, calleeClean: false }); // 83fd47: call 0x544520
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 83fd4c: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83fd4f: test eax, eax
        if (R.zf) { pc = 0x840a81; continue; } // 83fd51: je 0x840a81
        pc = 0x83fd57; continue;
      case 0x83fd57:
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 83fd57: mov eax, dword ptr [esi]
        R.edx = (R.m.u32(((0xae2d0c) | 0) >>> 0)) | 0; // 83fd59: mov edx, dword ptr [0xae2d0c]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 83fd5f: lea ecx, [eax + eax*4]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 83fd62: shl ecx, 4
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 83fd65: sub ecx, eax
        R.logic(R.m.u8(((R.ecx + R.edx + 0xb) | 0) >>> 0) & 0xf, 8); // 83fd67: test byte ptr [ecx + edx + 0xb], 0xf
        if (R.zf) { pc = 0x83fdb4; continue; } // 83fd6c: je 0x83fdb4
        pc = 0x83fd6e; continue;
      case 0x83fd6e:
        R.edx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 83fd6e: mov edx, dword ptr [esp + 0x10]
        R.ecx = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 83fd72: mov ecx, dword ptr [edx]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 83fd74: test ecx, ecx
        if (R.zf) { pc = 0x83fdb8; continue; } // 83fd76: je 0x83fdb8
        pc = 0x83fd78; continue;
      case 0x83fd78:
        R.m.w32(((R.esp + 0x4c) | 0) >>> 0, (R.eax >>> 0)); // 83fd78: mov dword ptr [esp + 0x4c], eax
        R.eax = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 83fd7c: mov eax, dword ptr [ebp + 0xc]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83fd7f: test eax, eax
        if (R.zf) { pc = 0x83fd8b; continue; } // 83fd81: je 0x83fd8b
        pc = 0x83fd83; continue;
      case 0x83fd83:
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 83fd83: mov eax, dword ptr [eax]
        R.m.w32(((R.esp + 0x50) | 0) >>> 0, (R.eax >>> 0)); // 83fd85: mov dword ptr [esp + 0x50], eax
        pc = 0x83fd93; continue; // 83fd89: jmp 0x83fd93
      case 0x83fd8b:
        R.m.w32(((R.esp + 0x50) | 0) >>> 0, 0xffffffff); // 83fd8b: mov dword ptr [esp + 0x50], 0xffffffff
        pc = 0x83fd93; continue;
      case 0x83fd93:
        R.edx = (R.m.u32(((R.edx + 0x10) | 0) >>> 0)) | 0; // 83fd93: mov edx, dword ptr [edx + 0x10]
        R.push(0x757ea0); // 83fd96: push 0x757ea0
        R.push(0x8); // 83fd9b: push 8
        R.push((R.edx >>> 0)); // 83fd9d: push edx
        R.eax = (((R.esp + 0x58) | 0)) | 0; // 83fd9e: lea eax, [esp + 0x58]
        R.push((R.ecx >>> 0)); // 83fda2: push ecx
        R.push((R.eax >>> 0)); // 83fda3: push eax
        R.call(0x946464, { n: 5, thisEcx: false, calleeClean: false }); // 83fda4: call 0x946464
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 83fda9: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83fdac: test eax, eax
        if (!R.zf) { pc = 0x840a81; continue; } // 83fdae: jne 0x840a81
        pc = 0x83fdb4; continue;
      case 0x83fdb4:
        R.edx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 83fdb4: mov edx, dword ptr [esp + 0x10]
        pc = 0x83fdb8; continue;
      case 0x83fdb8:
        R.ecx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 83fdb8: mov ecx, dword ptr [ebp + 0xc]
        R.eax = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 83fdbb: mov eax, dword ptr [esi + 0x39]
        R.push((R.ecx >>> 0)); // 83fdbe: push ecx
        R.push((R.eax >>> 0)); // 83fdbf: push eax
        R.push((R.esi >>> 0)); // 83fdc0: push esi
        R.ecx = ((R.edx >>> 0)) | 0; // 83fdc1: mov ecx, edx
        R.call(0x84b180, { n: 3, thisEcx: false, calleeClean: true }); // 83fdc3: call 0x84b180
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 83fdc8: test al, al
        if (R.zf) { pc = 0x840a81; continue; } // 83fdca: je 0x840a81
        pc = 0x83fdd0; continue;
      case 0x83fdd0:
        R.ecx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 83fdd0: mov ecx, dword ptr [ebp + 0xc]
        R.push(0x1); // 83fdd3: push 1
        R.push((R.ecx >>> 0)); // 83fdd5: push ecx
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 83fdd6: mov ecx, dword ptr [0xde1f54]
        R.push((R.esi >>> 0)); // 83fddc: push esi
        R.call(0x8c7560, { n: 3, thisEcx: true, calleeClean: true }); // 83fddd: call 0x8c7560
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83fde2: test eax, eax
        if (R.zf) { pc = 0x83fdfe; continue; } // 83fde4: je 0x83fdfe
        pc = 0x83fde6; continue;
      case 0x83fde6:
        R.edx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 83fde6: mov edx, dword ptr [ebp + 8]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edx + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 83fde9: mov al, byte ptr [edx + 0x24]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x1e, 8)) & 0xff) << 0)) | 0; // 83fdec: and al, 0x1e
        R.sub(((R.eax >>> 0) & 0xff), 0x2, 8); // 83fdee: cmp al, 2
        if (R.zf) { pc = 0x83fdfe; continue; } // 83fdf0: je 0x83fdfe
        pc = 0x83fdf2; continue;
      case 0x83fdf2:
        R.sub(((R.eax >>> 0) & 0xff), 0x4, 8); // 83fdf2: cmp al, 4
        if (R.zf) { pc = 0x83fdfe; continue; } // 83fdf4: je 0x83fdfe
        pc = 0x83fdf6; continue;
      case 0x83fdf6:
        R.sub(((R.eax >>> 0) & 0xff), 0x6, 8); // 83fdf6: cmp al, 6
        if (!R.zf) { pc = 0x840a81; continue; } // 83fdf8: jne 0x840a81
        pc = 0x83fdfe; continue;
      case 0x83fdfe:
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 83fdfe: mov eax, dword ptr [ebp + 8]
        R.logic(R.m.u8(((R.eax + 0x24) | 0) >>> 0) & 0x1, 8); // 83fe01: test byte ptr [eax + 0x24], 1
        if (R.zf) { pc = 0x83fe2c; continue; } // 83fe05: je 0x83fe2c
        pc = 0x83fe07; continue;
      case 0x83fe07:
        R.eax = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 83fe07: mov eax, dword ptr [esi + 0x39]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83fe0a: test eax, eax
        if (R.zf) { pc = 0x840a81; continue; } // 83fe0c: je 0x840a81
        pc = 0x83fe12; continue;
      case 0x83fe12:
        R.ecx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 83fe12: mov ecx, dword ptr [ebp + 0xc]
        R.push(0x0); // 83fe15: push 0
        R.push((R.esi >>> 0)); // 83fe17: push esi
        R.push((R.ecx >>> 0)); // 83fe18: push ecx
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 83fe19: mov ecx, dword ptr [0xde1f54]
        R.call(0x8d0040, { n: 3, thisEcx: true, calleeClean: true }); // 83fe1f: call 0x8d0040
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83fe24: test eax, eax
        if (R.zf) { pc = 0x840a81; continue; } // 83fe26: je 0x840a81
        pc = 0x83fe2c; continue;
      case 0x83fe2c:
        R.edx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 83fe2c: mov edx, dword ptr [ebp + 8]
        R.logic(R.m.u8(((R.edx + 0x24) | 0) >>> 0) & 0x1, 8); // 83fe2f: test byte ptr [edx + 0x24], 1
        if (R.zf) { pc = 0x83fec2; continue; } // 83fe33: je 0x83fec2
        pc = 0x83fe39; continue;
      case 0x83fe39:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 83fe39: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 83fe3f: push esi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 83fe40: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83fe45: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 83fe47: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x83fec2; continue; } // 83fe4c: je 0x83fec2
        pc = 0x83fe4e; continue;
      case 0x83fe4e:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 83fe4e: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 83fe51: mov edx, dword ptr [0xae23b4]
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 83fe57: add edx, eax
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 83fe59: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 83fe5c: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 83fe5f: add ecx, eax
        R.eax = (((R.edx + R.ecx * 4) | 0)) | 0; // 83fe61: lea eax, [edx + ecx*4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83fe64: test eax, eax
        if (R.zf) { pc = 0x83fec2; continue; } // 83fe66: je 0x83fec2
        pc = 0x83fe68; continue;
      case 0x83fe68:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 83fe68: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 83fe6e: push esi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 83fe6f: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83fe74: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 83fe76: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x83fe95; continue; } // 83fe7b: je 0x83fe95
        pc = 0x83fe7d; continue;
      case 0x83fe7d:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 83fe7d: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 83fe80: mov edx, dword ptr [0xae23b4]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 83fe86: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 83fe89: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 83fe8c: add ecx, eax
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 83fe8e: add edx, eax
        R.eax = (((R.edx + R.ecx * 4) | 0)) | 0; // 83fe90: lea eax, [edx + ecx*4]
        pc = 0x83fe97; continue; // 83fe93: jmp 0x83fe97
      case 0x83fe95:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 83fe95: xor eax, eax
        pc = 0x83fe97; continue;
      case 0x83fe97:
        R.push(0x0); // 83fe97: push 0
        R.push(0x0); // 83fe99: push 0
        R.push(0x1); // 83fe9b: push 1
        R.push(0x0); // 83fe9d: push 0
        R.push((R.eax >>> 0)); // 83fe9f: push eax
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 83fea0: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 83fea5: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83fea8: test eax, eax
        if (R.zf) { pc = 0x83fec2; continue; } // 83feaa: je 0x83fec2
        pc = 0x83feac; continue;
      case 0x83feac:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 83feac: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 83feb2: push esi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 83feb3: call 0x4cf5a0
        R.logic(R.m.u8(((R.eax + 0x4e) | 0) >>> 0) & 0x2, 8); // 83feb8: test byte ptr [eax + 0x4e], 2
        if (R.zf) { pc = 0x840a81; continue; } // 83febc: je 0x840a81
        pc = 0x83fec2; continue;
      case 0x83fec2:
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 83fec2: mov ecx, dword ptr [0xde1f54]
        R.push(0x0); // 83fec8: push 0
        R.push((R.esi >>> 0)); // 83feca: push esi
        R.call(0x8cca10, { n: 2, thisEcx: true, calleeClean: true }); // 83fecb: call 0x8cca10
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83fed0: test eax, eax
        if (!R.zf) { pc = 0x840a81; continue; } // 83fed2: jne 0x840a81
        pc = 0x83fed8; continue;
      case 0x83fed8:
        R.eax = (R.m.u32(((R.esp + 0x84) | 0) >>> 0)) | 0; // 83fed8: mov eax, dword ptr [esp + 0x84]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83fedf: test eax, eax
        if (!R.zf) { pc = 0x8400da; continue; } // 83fee1: jne 0x8400da
        pc = 0x83fee7; continue;
      case 0x83fee7:
        R.ebx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 83fee7: mov ebx, dword ptr [ebp + 0xc]
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 83feea: mov eax, dword ptr [esi]
        R.ecx = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 83feec: mov ecx, dword ptr [ebx]
        R.edi = (((R.eax + R.ecx) | 0)) | 0; // 83feee: lea edi, [eax + ecx]
        R.ecx = (((R.m.u16(((R.esp + 0x28) | 0) >>> 0)) << 16 >> 16)) | 0; // 83fef1: movsx ecx, word ptr [esp + 0x28]
        R.eax = ((R.edi >>> 0)) | 0; // 83fef6: mov eax, edi
        R.edx = R.eax < 0 ? -1 : 0; // 83fef8: cdq 
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.ecx >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 83fef9: idiv ecx
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 83fefb: test edx, edx
        if (R.zf) { pc = 0x8400da; continue; } // 83fefd: je 0x8400da
        pc = 0x83ff03; continue;
      case 0x83ff03:
        R.ecx = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 83ff03: mov ecx, dword ptr [ebx + 0x53]
        R.eax = (R.m.u32(((R.esi + 0x1a) | 0) >>> 0)) | 0; // 83ff06: mov eax, dword ptr [esi + 0x1a]
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 83ff09: cmp ecx, eax
        if (R.zf) { pc = 0x840060; continue; } // 83ff0b: je 0x840060
        pc = 0x83ff11; continue;
      case 0x83ff11:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x22) | 0) >>> 0)) & 0xff) << 0)) | 0; // 83ff11: mov al, byte ptr [esi + 0x22]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 83ff14: test al, al
        if (!R.zf) { pc = 0x840060; continue; } // 83ff16: jne 0x840060
        pc = 0x83ff1c; continue;
      case 0x83ff1c:
        R.eax = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 83ff1c: mov eax, dword ptr [esi + 0x39]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83ff1f: test eax, eax
        if (R.zf) { pc = 0x83ff2c; continue; } // 83ff21: je 0x83ff2c
        pc = 0x83ff23; continue;
      case 0x83ff23:
        R.sub(R.m.u32(((R.eax + 0x53) | 0) >>> 0), (R.ecx >>> 0), 32); // 83ff23: cmp dword ptr [eax + 0x53], ecx
        if (R.zf) { pc = 0x840060; continue; } // 83ff26: je 0x840060
        pc = 0x83ff2c; continue;
      case 0x83ff2c:
        R.sub(R.m.u8(((R.esi + 0x18) | 0) >>> 0), 0x17, 8); // 83ff2c: cmp byte ptr [esi + 0x18], 0x17
        if (!R.cL) { pc = 0x83ff55; continue; } // 83ff30: jge 0x83ff55
        pc = 0x83ff32; continue;
      case 0x83ff32:
        R.push(0x1); // 83ff32: push 1
        R.push((R.ecx >>> 0)); // 83ff34: push ecx
        R.push((R.esi >>> 0)); // 83ff35: push esi
        R.call(0x53d980, { n: 3, thisEcx: false, calleeClean: false }); // 83ff36: call 0x53d980
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 83ff3b: add esp, 0xc
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83ff3e: test eax, eax
        if (R.zf) { pc = 0x83ff55; continue; } // 83ff40: je 0x83ff55
        pc = 0x83ff42; continue;
      case 0x83ff42:
        R.eax = (R.m.u32(((R.esi + 0x61) | 0) >>> 0)) | 0; // 83ff42: mov eax, dword ptr [esi + 0x61]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83ff45: test eax, eax
        if (R.zf) { pc = 0x83ff55; continue; } // 83ff47: je 0x83ff55
        pc = 0x83ff49; continue;
      case 0x83ff49:
        R.sub(R.m.u16(((R.eax + 0xd) | 0) >>> 0), 0xcb2, 16); // 83ff49: cmp word ptr [eax + 0xd], 0xcb2
        if (R.cL) { pc = 0x840a81; continue; } // 83ff4f: jl 0x840a81
        pc = 0x83ff55; continue;
      case 0x83ff55:
        R.ecx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 83ff55: mov ecx, dword ptr [ebp + 0xc]
        R.edi = (R.m.u32(((R.ecx + 0x53) | 0) >>> 0)) | 0; // 83ff58: mov edi, dword ptr [ecx + 0x53]
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 83ff5b: test edi, edi
        if (R.zf) { pc = 0x83ffa9; continue; } // 83ff5d: je 0x83ffa9
        pc = 0x83ff5f; continue;
      case 0x83ff5f:
        R.eax = (R.m.u32(((R.esi + 0x1a) | 0) >>> 0)) | 0; // 83ff5f: mov eax, dword ptr [esi + 0x1a]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83ff62: test eax, eax
        if (R.zf) { pc = 0x83ffa9; continue; } // 83ff64: je 0x83ffa9
        pc = 0x83ff66; continue;
      case 0x83ff66:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.edi + 0x75) | 0) >>> 0)) & 0xff) << 0)) | 0; // 83ff66: mov dl, byte ptr [edi + 0x75]
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.eax + 0x75) | 0) >>> 0)) & 0xff) << 0)) | 0; // 83ff69: mov bl, byte ptr [eax + 0x75]
        R.sub(((R.edx >>> 0) & 0xff), ((R.ebx >>> 0) & 0xff), 8); // 83ff6c: cmp dl, bl
        if (R.zf) { pc = 0x83ffa9; continue; } // 83ff6e: je 0x83ffa9
        pc = 0x83ff70; continue;
      case 0x83ff70:
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.ecx + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 83ff70: mov cx, word ptr [ecx + 0x80]
        R.sub(((R.ecx >>> 0) & 0xffff), 0xabe, 16); // 83ff77: cmp cx, 0xabe
        if (R.cL) { pc = 0x840a81; continue; } // 83ff7c: jl 0x840a81
        pc = 0x83ff82; continue;
      case 0x83ff82:
        R.eax = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 83ff82: mov eax, dword ptr [esi + 0x39]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83ff85: test eax, eax
        if (R.zf) { pc = 0x83ff95; continue; } // 83ff87: je 0x83ff95
        pc = 0x83ff89; continue;
      case 0x83ff89:
        R.eax = (R.m.u32(((R.eax + 0x53) | 0) >>> 0)) | 0; // 83ff89: mov eax, dword ptr [eax + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83ff8c: test eax, eax
        if (R.zf) { pc = 0x83ffa9; continue; } // 83ff8e: je 0x83ffa9
        pc = 0x83ff90; continue;
      case 0x83ff90:
        R.sub(R.m.u8(((R.eax + 0x75) | 0) >>> 0), ((R.edx >>> 0) & 0xff), 8); // 83ff90: cmp byte ptr [eax + 0x75], dl
        if (R.zf) { pc = 0x83ffa9; continue; } // 83ff93: je 0x83ffa9
        pc = 0x83ff95; continue;
      case 0x83ff95:
        R.sub(((R.ecx >>> 0) & 0xffff), 0x109a, 16); // 83ff95: cmp cx, 0x109a
        if (!R.cL) { pc = 0x83ffa9; continue; } // 83ff9a: jge 0x83ffa9
        pc = 0x83ff9c; continue;
      case 0x83ff9c:
        R.sub(R.m.u8(((R.edi + 0x85) | 0) >>> 0), 0xc, 8); // 83ff9c: cmp byte ptr [edi + 0x85], 0xc
        if (R.cL) { pc = 0x840a81; continue; } // 83ffa3: jl 0x840a81
        pc = 0x83ffa9; continue;
      case 0x83ffa9:
        R.edx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 83ffa9: mov edx, dword ptr [ebp + 8]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edx + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 83ffac: mov al, byte ptr [edx + 0x24]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x1e, 8)) & 0xff) << 0)) | 0; // 83ffaf: and al, 0x1e
        R.sub(((R.eax >>> 0) & 0xff), 0xa, 8); // 83ffb1: cmp al, 0xa
        if (R.zf) { pc = 0x84000e; continue; } // 83ffb3: je 0x84000e
        pc = 0x83ffb5; continue;
      case 0x83ffb5:
        R.sub(((R.eax >>> 0) & 0xff), 0xc, 8); // 83ffb5: cmp al, 0xc
        if (R.zf) { pc = 0x84000e; continue; } // 83ffb7: je 0x84000e
        pc = 0x83ffb9; continue;
      case 0x83ffb9:
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 83ffb9: mov eax, dword ptr [esp + 0x14]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83ffbd: test eax, eax
        if (R.zf) { pc = 0x83ffd0; continue; } // 83ffbf: je 0x83ffd0
        pc = 0x83ffc1; continue;
      case 0x83ffc1:
        R.eax = (R.m.u32(((R.esi + 0x61) | 0) >>> 0)) | 0; // 83ffc1: mov eax, dword ptr [esi + 0x61]
        R.sub(R.m.u16(((R.eax + 0xd) | 0) >>> 0), 0xabe, 16); // 83ffc4: cmp word ptr [eax + 0xd], 0xabe
        if (R.cL) { pc = 0x840a81; continue; } // 83ffca: jl 0x840a81
        pc = 0x83ffd0; continue;
      case 0x83ffd0:
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 83ffd0: mov eax, dword ptr [esp + 0x14]
        R.edx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 83ffd4: mov edx, dword ptr [ebp + 0xc]
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 83ffd7: xor ecx, ecx
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 83ffd9: test eax, eax
        R.eax = (R.m.u32(((R.edx + 0xcf) | 0) >>> 0)) | 0; // 83ffdb: mov eax, dword ptr [edx + 0xcf]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.zf ? 1 : 0) & 0xff) << 0)) | 0; // 83ffe1: sete cl
        R.push((R.ecx >>> 0)); // 83ffe4: push ecx
        R.push((R.eax >>> 0)); // 83ffe5: push eax
        R.push((R.esi >>> 0)); // 83ffe6: push esi
        R.call(0x5407e0, { n: 0, thisEcx: false, calleeClean: false }); // 83ffe7: call 0x5407e0
        R.push(0x7d0); // 83ffec: push 0x7d0
        R.edi = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 83fff1: movsx edi, ax
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 83fff4: call 0x90cfc0
        R.eax = (R.add((R.eax >>> 0), 0xcb2, 32)) | 0; // 83fff9: add eax, 0xcb2
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 83fffe: add esp, 0x10
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 840001: cmp edi, eax
        if (!R.cL) { pc = 0x8400da; continue; } // 840003: jge 0x8400da
        pc = 0x840009; continue;
      case 0x840009:
        pc = 0x840a81; continue; // 840009: jmp 0x840a81
      case 0x84000e:
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 84000e: mov eax, dword ptr [esp + 0x14]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 840012: test eax, eax
        if (R.zf) { pc = 0x840025; continue; } // 840014: je 0x840025
        pc = 0x840016; continue;
      case 0x840016:
        R.ecx = (R.m.u32(((R.esi + 0x61) | 0) >>> 0)) | 0; // 840016: mov ecx, dword ptr [esi + 0x61]
        R.sub(R.m.u16(((R.ecx + 0xd) | 0) >>> 0), 0x6d6, 16); // 840019: cmp word ptr [ecx + 0xd], 0x6d6
        if (R.cL) { pc = 0x840a81; continue; } // 84001f: jl 0x840a81
        pc = 0x840025; continue;
      case 0x840025:
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 840025: mov eax, dword ptr [esp + 0x14]
        R.edx = (R.logic((R.edx >>> 0) ^ (R.edx >>> 0), 32)) | 0; // 840029: xor edx, edx
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84002b: test eax, eax
        R.eax = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 84002d: mov eax, dword ptr [ebp + 0xc]
        R.edx = ((R.edx & 0xffffff00) | (((R.zf ? 1 : 0) & 0xff) << 0)) | 0; // 840030: sete dl
        R.ecx = (R.m.u32(((R.eax + 0xcf) | 0) >>> 0)) | 0; // 840033: mov ecx, dword ptr [eax + 0xcf]
        R.push((R.edx >>> 0)); // 840039: push edx
        R.push((R.ecx >>> 0)); // 84003a: push ecx
        R.push((R.esi >>> 0)); // 84003b: push esi
        R.call(0x5407e0, { n: 0, thisEcx: false, calleeClean: false }); // 84003c: call 0x5407e0
        R.push(0x7d0); // 840041: push 0x7d0
        R.edi = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 840046: movsx edi, ax
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 840049: call 0x90cfc0
        R.eax = (R.add((R.eax >>> 0), 0xabe, 32)) | 0; // 84004e: add eax, 0xabe
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 840053: add esp, 0x10
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 840056: cmp edi, eax
        if (R.cL) { pc = 0x840a81; continue; } // 840058: jl 0x840a81
        pc = 0x84005e; continue;
      case 0x84005e:
        pc = 0x8400da; continue; // 84005e: jmp 0x8400da
      case 0x840060:
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 840060: mov eax, dword ptr [esp + 0x14]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 840064: test eax, eax
        if (R.zf) { pc = 0x840112; continue; } // 840066: je 0x840112
        pc = 0x84006c; continue;
      case 0x84006c:
        R.edx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 84006c: mov edx, dword ptr [ebp + 8]
        R.logic(R.m.u8(((R.edx + 0x24) | 0) >>> 0) & 0x1, 8); // 84006f: test byte ptr [edx + 0x24], 1
        if (!R.zf) { pc = 0x8400da; continue; } // 840073: jne 0x8400da
        pc = 0x840075; continue;
      case 0x840075:
        R.eax = (R.m.u32(((R.esi + 0x61) | 0) >>> 0)) | 0; // 840075: mov eax, dword ptr [esi + 0x61]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 840078: test eax, eax
        if (R.zf) { pc = 0x8400da; continue; } // 84007a: je 0x8400da
        pc = 0x84007c; continue;
      case 0x84007c:
        R.ecx = (0xcb2) | 0; // 84007c: mov ecx, 0xcb2
        R.sub(R.m.u16(((R.eax + 0x9) | 0) >>> 0), ((R.ecx >>> 0) & 0xffff), 16); // 840081: cmp word ptr [eax + 9], cx
        if (!R.cL) { pc = 0x8400da; continue; } // 840085: jge 0x8400da
        pc = 0x840087; continue;
      case 0x840087:
        R.eax = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 840087: mov eax, dword ptr [esi + 0x39]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84008a: test eax, eax
        if (R.zf) { pc = 0x840097; continue; } // 84008c: je 0x840097
        pc = 0x84008e; continue;
      case 0x84008e:
        R.sub(R.m.u16(((R.eax + 0x80) | 0) >>> 0), ((R.ecx >>> 0) & 0xffff), 16); // 84008e: cmp word ptr [eax + 0x80], cx
        if (!R.cL) { pc = 0x8400da; continue; } // 840095: jge 0x8400da
        pc = 0x840097; continue;
      case 0x840097:
        R.sub(R.m.u8(((R.esi + 0x18) | 0) >>> 0), 0x14, 8); // 840097: cmp byte ptr [esi + 0x18], 0x14
        if (!R.cL) { pc = 0x8400da; continue; } // 84009b: jge 0x8400da
        pc = 0x84009d; continue;
      case 0x84009d:
        R.eax = (R.m.u32(((R.ebx + 0xcf) | 0) >>> 0)) | 0; // 84009d: mov eax, dword ptr [ebx + 0xcf]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8400a3: test eax, eax
        if (R.zf) { pc = 0x8400c8; continue; } // 8400a5: je 0x8400c8
        pc = 0x8400a7; continue;
      case 0x8400a7:
        R.eax = (R.m.u32(((R.eax + 0x69) | 0) >>> 0)) | 0; // 8400a7: mov eax, dword ptr [eax + 0x69]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8400aa: test eax, eax
        if (R.zf) { pc = 0x8400c8; continue; } // 8400ac: je 0x8400c8
        pc = 0x8400ae; continue;
      case 0x8400ae:
        R.eax = (((R.m.u8(((R.eax + 0x22) | 0) >>> 0)) << 24 >> 24)) | 0; // 8400ae: movsx eax, byte ptr [eax + 0x22]
        R.ecx = (0x19) | 0; // 8400b2: mov ecx, 0x19
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 8400b7: sub ecx, eax
        R.eax = ((R.edi >>> 0)) | 0; // 8400b9: mov eax, edi
        R.edx = R.eax < 0 ? -1 : 0; // 8400bb: cdq 
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.ecx >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 8400bc: idiv ecx
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 8400be: test edx, edx
        if (!R.zf) { pc = 0x840a81; continue; } // 8400c0: jne 0x840a81
        pc = 0x8400c6; continue;
      case 0x8400c6:
        pc = 0x8400da; continue; // 8400c6: jmp 0x8400da
      case 0x8400c8:
        R.eax = ((R.edi >>> 0)) | 0; // 8400c8: mov eax, edi
        R.ecx = (0xf) | 0; // 8400ca: mov ecx, 0xf
        R.edx = R.eax < 0 ? -1 : 0; // 8400cf: cdq 
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.ecx >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 8400d0: idiv ecx
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 8400d2: test edx, edx
        if (!R.zf) { pc = 0x840a81; continue; } // 8400d4: jne 0x840a81
        pc = 0x8400da; continue;
      case 0x8400da:
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 8400da: mov eax, dword ptr [esp + 0x14]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8400de: test eax, eax
        if (R.zf) { pc = 0x84010f; continue; } // 8400e0: je 0x84010f
        pc = 0x8400e2; continue;
      case 0x8400e2:
        R.edx = (R.m.u32(((R.esp + 0x58) | 0) >>> 0)) | 0; // 8400e2: mov edx, dword ptr [esp + 0x58]
        R.ecx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 8400e6: mov ecx, dword ptr [ebp + 8]
        R.push(0x1); // 8400e9: push 1
        R.eax = (((R.esp + 0x30) | 0)) | 0; // 8400eb: lea eax, [esp + 0x30]
        R.push((R.edx >>> 0)); // 8400ef: push edx
        R.edx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 8400f0: mov edx, dword ptr [ebp + 0xc]
        R.push((R.eax >>> 0)); // 8400f3: push eax
        R.push((R.ecx >>> 0)); // 8400f4: push ecx
        R.ecx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 8400f5: mov ecx, dword ptr [esp + 0x20]
        R.push((R.esi >>> 0)); // 8400f9: push esi
        R.push((R.edx >>> 0)); // 8400fa: push edx
        R.call(0x840d80, { n: 6, thisEcx: true, calleeClean: true }); // 8400fb: call 0x840d80
        R.ecx = (R.m.u32(((R.esp + 0x2c) | 0) >>> 0)) | 0; // 840100: mov ecx, dword ptr [esp + 0x2c]
        R.edx = R.eax < 0 ? -1 : 0; // 840104: cdq 
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.eax >>> 0)); // 840105: mov dword ptr [esp + 0x18], eax
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 840109: mov dword ptr [esp + 0x1c], edx
        pc = 0x84013e; continue; // 84010d: jmp 0x84013e
      case 0x84010f:
        R.ebx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 84010f: mov ebx, dword ptr [ebp + 0xc]
        pc = 0x840112; continue;
      case 0x840112:
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 840112: mov eax, dword ptr [ebp + 8]
        R.edx = (R.m.u32(((R.ebx + 0xcf) | 0) >>> 0)) | 0; // 840115: mov edx, dword ptr [ebx + 0xcf]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84011b: mov cl, byte ptr [eax]
        R.push((R.ecx >>> 0)); // 84011d: push ecx
        R.ecx = (R.m.u32(((0xb67a44) | 0) >>> 0)) | 0; // 84011e: mov ecx, dword ptr [0xb67a44]
        R.push((R.edx >>> 0)); // 840124: push edx
        R.push((R.ebx >>> 0)); // 840125: push ebx
        R.push((R.esi >>> 0)); // 840126: push esi
        R.call(0x69d1b0, { n: 4, thisEcx: false, calleeClean: true }); // 840127: call 0x69d1b0
        R.ecx = ((R.eax >>> 0)) | 0; // 84012c: mov ecx, eax
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.ecx >>> 0)); // 84012e: mov dword ptr [esp + 0x2c], ecx
        R.eax = (R.m.u32(((R.esi + 0x52) | 0) >>> 0)) | 0; // 840132: mov eax, dword ptr [esi + 0x52]
        R.edx = R.eax < 0 ? -1 : 0; // 840135: cdq 
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.eax >>> 0)); // 840136: mov dword ptr [esp + 0x18], eax
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 84013a: mov dword ptr [esp + 0x1c], edx
        pc = 0x84013e; continue;
      case 0x84013e:
        R.sub((R.ecx >>> 0), R.m.u32(((R.esp + 0x68) | 0) >>> 0), 32); // 84013e: cmp ecx, dword ptr [esp + 0x68]
        if (R.cL) { pc = 0x840a81; continue; } // 840142: jl 0x840a81
        pc = 0x840148; continue;
      case 0x840148:
        R.eax = (R.m.u32(((R.esp + 0x58) | 0) >>> 0)) | 0; // 840148: mov eax, dword ptr [esp + 0x58]
        R.eax = (R.add((R.eax >>> 0), 0xffffd8f0, 32)) | 0; // 84014c: add eax, 0xffffd8f0
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 840151: cmp ecx, eax
        if (R.cL) { pc = 0x840a81; continue; } // 840153: jl 0x840a81
        pc = 0x840159; continue;
      case 0x840159:
        R.ecx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 840159: mov ecx, dword ptr [ebp + 8]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84015c: mov al, byte ptr [ecx + 0x24]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x1, 8)) & 0xff) << 0)) | 0; // 84015f: and al, 1
        if (!R.zf) { pc = 0x840586; continue; } // 840161: jne 0x840586
        pc = 0x840167; continue;
      case 0x840167:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 840167: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 84016d: push esi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 84016e: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 840173: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 840175: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x840194; continue; } // 84017a: je 0x840194
        pc = 0x84017c; continue;
      case 0x84017c:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 84017c: mov eax, dword ptr [eax + 4]
        R.ecx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 84017f: mov ecx, dword ptr [0xae23b4]
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 840185: lea edx, [eax + eax*8]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 840188: shl edx, 4
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 84018b: add edx, eax
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 84018d: add ecx, eax
        R.edi = (((R.ecx + R.edx * 4) | 0)) | 0; // 84018f: lea edi, [ecx + edx*4]
        pc = 0x840196; continue; // 840192: jmp 0x840196
      case 0x840194:
        R.edi = (R.logic((R.edi >>> 0) ^ (R.edi >>> 0), 32)) | 0; // 840194: xor edi, edi
        pc = 0x840196; continue;
      case 0x840196:
        R.ebx = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 840196: mov ebx, dword ptr [esp + 0x14]
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 84019a: test ebx, ebx
        if (R.zf) { pc = 0x84025f; continue; } // 84019c: je 0x84025f
        pc = 0x8401a2; continue;
      case 0x8401a2:
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 8401a2: test edi, edi
        if (R.zf) { pc = 0x84025f; continue; } // 8401a4: je 0x84025f
        pc = 0x8401aa; continue;
      case 0x8401aa:
        R.ecx = (R.m.u32(((0xae2a38) | 0) >>> 0)) | 0; // 8401aa: mov ecx, dword ptr [0xae2a38]
        R.push((R.edi >>> 0)); // 8401b0: push edi
        R.call(0x5a0590, { n: 1, thisEcx: true, calleeClean: true }); // 8401b1: call 0x5a0590
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8401b6: test eax, eax
        if (R.zf) { pc = 0x84025f; continue; } // 8401b8: je 0x84025f
        pc = 0x8401be; continue;
      case 0x8401be:
        R.ecx = (R.m.u32(((0xae2a38) | 0) >>> 0)) | 0; // 8401be: mov ecx, dword ptr [0xae2a38]
        R.push((R.edi >>> 0)); // 8401c4: push edi
        R.call(0x5a0590, { n: 1, thisEcx: true, calleeClean: true }); // 8401c5: call 0x5a0590
        R.sub(R.m.u8(((R.eax + 0x165) | 0) >>> 0), 0x1, 8); // 8401ca: cmp byte ptr [eax + 0x165], 1
        if (!R.zf) { pc = 0x84025f; continue; } // 8401d1: jne 0x84025f
        pc = 0x8401d7; continue;
      case 0x8401d7:
        R.push(0x0); // 8401d7: push 0
        R.push(0x0); // 8401d9: push 0
        R.push(0x1); // 8401db: push 1
        R.push(0x0); // 8401dd: push 0
        R.push((R.edi >>> 0)); // 8401df: push edi
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 8401e0: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8401e5: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8401e8: test eax, eax
        if (R.zf) { pc = 0x840234; continue; } // 8401ea: je 0x840234
        pc = 0x8401ec; continue;
      case 0x8401ec:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8401ec: mov ecx, dword ptr [0xae1050]
        R.push(0x0); // 8401f2: push 0
        R.push(0xffffffff); // 8401f4: push -1
        R.push(0x0); // 8401f6: push 0
        R.push((R.edi >>> 0)); // 8401f8: push edi
        R.push((R.esi >>> 0)); // 8401f9: push esi
        R.call(0x4d0c60, { n: 5, thisEcx: false, calleeClean: true }); // 8401fa: call 0x4d0c60
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 8401ff: mov ecx, dword ptr [esp + 0x1c]
        R.edx = R.eax < 0 ? -1 : 0; // 840203: cdq 
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 840204: cmp ecx, edx
        if (!R.cLE) { pc = 0x84021a; continue; } // 840206: jg 0x84021a
        pc = 0x840208; continue;
      case 0x840208:
        if (R.cL) { pc = 0x840210; continue; } // 840208: jl 0x840210
        pc = 0x84020a; continue;
      case 0x84020a:
        R.sub(R.m.u32(((R.esp + 0x18) | 0) >>> 0), (R.eax >>> 0), 32); // 84020a: cmp dword ptr [esp + 0x18], eax
        if (!R.cf) { pc = 0x84021a; continue; } // 84020e: jae 0x84021a
        pc = 0x840210; continue;
      case 0x840210:
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 840210: mov eax, dword ptr [esp + 0x18]
        R.m.w32(((R.esp + 0x60) | 0) >>> 0, (R.ecx >>> 0)); // 840214: mov dword ptr [esp + 0x60], ecx
        pc = 0x840256; continue; // 840218: jmp 0x840256
      case 0x84021a:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 84021a: mov ecx, dword ptr [0xae1050]
        R.push(0x0); // 840220: push 0
        R.push(0xffffffff); // 840222: push -1
        R.push(0x0); // 840224: push 0
        R.push((R.edi >>> 0)); // 840226: push edi
        R.push((R.esi >>> 0)); // 840227: push esi
        R.call(0x4d0c60, { n: 5, thisEcx: false, calleeClean: true }); // 840228: call 0x4d0c60
        R.edx = R.eax < 0 ? -1 : 0; // 84022d: cdq 
        R.m.w32(((R.esp + 0x60) | 0) >>> 0, (R.edx >>> 0)); // 84022e: mov dword ptr [esp + 0x60], edx
        pc = 0x840256; continue; // 840232: jmp 0x840256
      case 0x840234:
        R.eax = (R.m.u32(((R.esi + 0x52) | 0) >>> 0)) | 0; // 840234: mov eax, dword ptr [esi + 0x52]
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 840237: mov ecx, dword ptr [esp + 0x1c]
        R.edx = R.eax < 0 ? -1 : 0; // 84023b: cdq 
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 84023c: cmp ecx, edx
        if (!R.cLE) { pc = 0x840252; continue; } // 84023e: jg 0x840252
        pc = 0x840240; continue;
      case 0x840240:
        if (R.cL) { pc = 0x840248; continue; } // 840240: jl 0x840248
        pc = 0x840242; continue;
      case 0x840242:
        R.sub(R.m.u32(((R.esp + 0x18) | 0) >>> 0), (R.eax >>> 0), 32); // 840242: cmp dword ptr [esp + 0x18], eax
        if (!R.cf) { pc = 0x840252; continue; } // 840246: jae 0x840252
        pc = 0x840248; continue;
      case 0x840248:
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 840248: mov eax, dword ptr [esp + 0x18]
        R.m.w32(((R.esp + 0x60) | 0) >>> 0, (R.ecx >>> 0)); // 84024c: mov dword ptr [esp + 0x60], ecx
        pc = 0x840256; continue; // 840250: jmp 0x840256
      case 0x840252:
        R.m.w32(((R.esp + 0x60) | 0) >>> 0, (R.edx >>> 0)); // 840252: mov dword ptr [esp + 0x60], edx
        pc = 0x840256; continue;
      case 0x840256:
        R.edx = R.eax < 0 ? -1 : 0; // 840256: cdq 
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.eax >>> 0)); // 840257: mov dword ptr [esp + 0x18], eax
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 84025b: mov dword ptr [esp + 0x1c], edx
        pc = 0x84025f; continue;
      case 0x84025f:
        R.eax = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 84025f: mov eax, dword ptr [esp + 0x34]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 840263: test eax, eax
        if (!R.zf) { pc = 0x840277; continue; } // 840265: jne 0x840277
        pc = 0x840267; continue;
      case 0x840267:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 840267: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 84026d: push esi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 84026e: call 0x4cf5a0
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.eax >>> 0)); // 840273: mov dword ptr [esp + 0x34], eax
        pc = 0x840277; continue;
      case 0x840277:
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 840277: test ebx, ebx
        if (R.zf) { pc = 0x8402a4; continue; } // 840279: je 0x8402a4
        pc = 0x84027b; continue;
      case 0x84027b:
        R.ebx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 84027b: mov ebx, dword ptr [ebp + 0xc]
        R.eax = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 84027e: mov eax, dword ptr [esp + 0x34]
        R.ecx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 840282: mov ecx, dword ptr [ebp + 8]
        R.edx = (((R.esp + 0x7c) | 0)) | 0; // 840285: lea edx, [esp + 0x7c]
        R.push((R.edx >>> 0)); // 840289: push edx
        R.push((R.ebx >>> 0)); // 84028a: push ebx
        R.push((R.eax >>> 0)); // 84028b: push eax
        R.push((R.ecx >>> 0)); // 84028c: push ecx
        R.ecx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 84028d: mov ecx, dword ptr [esp + 0x20]
        R.call(0x84b6f0, { n: 4, thisEcx: false, calleeClean: true }); // 840291: call 0x84b6f0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 840296: test eax, eax
        if (R.zf) { pc = 0x8402a7; continue; } // 840298: je 0x8402a7
        pc = 0x84029a; continue;
      case 0x84029a:
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, 0x1); // 84029a: mov dword ptr [esp + 0x44], 1
        pc = 0x8402af; continue; // 8402a2: jmp 0x8402af
      case 0x8402a4:
        R.ebx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 8402a4: mov ebx, dword ptr [ebp + 0xc]
        pc = 0x8402a7; continue;
      case 0x8402a7:
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, 0x0); // 8402a7: mov dword ptr [esp + 0x44], 0
        pc = 0x8402af; continue;
      case 0x8402af:
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 8402af: test edi, edi
        if (R.zf) { pc = 0x840307; continue; } // 8402b1: je 0x840307
        pc = 0x8402b3; continue;
      case 0x8402b3:
        R.eax = (R.m.u32(((R.esp + 0x44) | 0) >>> 0)) | 0; // 8402b3: mov eax, dword ptr [esp + 0x44]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8402b7: test eax, eax
        if (!R.zf) { pc = 0x840307; continue; } // 8402b9: jne 0x840307
        pc = 0x8402bb; continue;
      case 0x8402bb:
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 8402bb: mov eax, dword ptr [esp + 0x14]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8402bf: test eax, eax
        if (!R.zf) { pc = 0x8402c8; continue; } // 8402c1: jne 0x8402c8
        pc = 0x8402c3; continue;
      case 0x8402c3:
        R.edi = (R.m.u32(((R.esi + 0x52) | 0) >>> 0)) | 0; // 8402c3: mov edi, dword ptr [esi + 0x52]
        pc = 0x840309; continue; // 8402c6: jmp 0x840309
      case 0x8402c8:
        R.push(0x0); // 8402c8: push 0
        R.push(0x0); // 8402ca: push 0
        R.push(0x1); // 8402cc: push 1
        R.push(0x0); // 8402ce: push 0
        R.push((R.edi >>> 0)); // 8402d0: push edi
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 8402d1: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8402d6: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8402d9: test eax, eax
        if (R.zf) { pc = 0x8402ef; continue; } // 8402db: je 0x8402ef
        pc = 0x8402dd; continue;
      case 0x8402dd:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8402dd: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 8402e3: push esi
        R.push((R.ebx >>> 0)); // 8402e4: push ebx
        R.push((R.edi >>> 0)); // 8402e5: push edi
        R.call(0x4d42d0, { n: 3, thisEcx: true, calleeClean: true }); // 8402e6: call 0x4d42d0
        R.edi = ((R.eax >>> 0)) | 0; // 8402eb: mov edi, eax
        pc = 0x840309; continue; // 8402ed: jmp 0x840309
      case 0x8402ef:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8402ef: mov ecx, dword ptr [0xae1050]
        R.push(0x1); // 8402f5: push 1
        R.push(0x1); // 8402f7: push 1
        R.push(0x0); // 8402f9: push 0
        R.push((R.esi >>> 0)); // 8402fb: push esi
        R.push((R.ebx >>> 0)); // 8402fc: push ebx
        R.push((R.edi >>> 0)); // 8402fd: push edi
        R.call(0x4d1600, { n: 6, thisEcx: true, calleeClean: true }); // 8402fe: call 0x4d1600
        R.edi = ((R.eax >>> 0)) | 0; // 840303: mov edi, eax
        pc = 0x840309; continue; // 840305: jmp 0x840309
      case 0x840307:
        R.edi = (R.logic((R.edi >>> 0) ^ (R.edi >>> 0), 32)) | 0; // 840307: xor edi, edi
        pc = 0x840309; continue;
      case 0x840309:
        R.eax = (R.m.u32(((R.esp + 0x7c) | 0) >>> 0)) | 0; // 840309: mov eax, dword ptr [esp + 0x7c]
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.edi >>> 0)); // 84030d: mov dword ptr [esp + 0x34], edi
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 840311: test eax, eax
        if (R.zf) { pc = 0x840327; continue; } // 840313: je 0x840327
        pc = 0x840315; continue;
      case 0x840315:
        R.ecx = (R.m.u32(((R.esp + 0x44) | 0) >>> 0)) | 0; // 840315: mov ecx, dword ptr [esp + 0x44]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 840319: test ecx, ecx
        if (R.zf) { pc = 0x840327; continue; } // 84031b: je 0x840327
        pc = 0x84031d; continue;
      case 0x84031d:
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 84031d: cmp eax, edi
        if (!R.cL) { pc = 0x840327; continue; } // 84031f: jge 0x840327
        pc = 0x840321; continue;
      case 0x840321:
        R.edi = ((R.eax >>> 0)) | 0; // 840321: mov edi, eax
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.edi >>> 0)); // 840323: mov dword ptr [esp + 0x34], edi
        pc = 0x840327; continue;
      case 0x840327:
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 840327: mov eax, dword ptr [esp + 0x14]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84032b: test eax, eax
        if (R.zf) { pc = 0x8404ad; continue; } // 84032d: je 0x8404ad
        pc = 0x840333; continue;
      case 0x840333:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 840333: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 840339: push esi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 84033a: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84033f: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 840341: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x8404ad; continue; } // 840346: je 0x8404ad
        pc = 0x84034c; continue;
      case 0x84034c:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 84034c: mov eax, dword ptr [eax + 4]
        R.ecx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 84034f: mov ecx, dword ptr [0xae23b4]
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 840355: add ecx, eax
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 840357: lea edx, [eax + eax*8]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 84035a: shl edx, 4
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 84035d: add edx, eax
        R.eax = (((R.ecx + R.edx * 4) | 0)) | 0; // 84035f: lea eax, [ecx + edx*4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 840362: test eax, eax
        if (R.zf) { pc = 0x8404ad; continue; } // 840364: je 0x8404ad
        pc = 0x84036a; continue;
      case 0x84036a:
        R.eax = (R.m.u32(((R.esp + 0x44) | 0) >>> 0)) | 0; // 84036a: mov eax, dword ptr [esp + 0x44]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84036e: test eax, eax
        if (!R.zf) { pc = 0x8404ad; continue; } // 840370: jne 0x8404ad
        pc = 0x840376; continue;
      case 0x840376:
        R.eax = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 840376: mov eax, dword ptr [esp + 0x34]
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 84037a: mov ecx, dword ptr [esp + 0x1c]
        R.edx = R.eax < 0 ? -1 : 0; // 84037e: cdq 
        R.edi = ((R.edx >>> 0)) | 0; // 84037f: mov edi, edx
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, 0x0); // 840381: mov dword ptr [esp + 0x24], 0
        R.sub((R.edi >>> 0), (R.ecx >>> 0), 32); // 840389: cmp edi, ecx
        R.ebx = ((R.eax >>> 0)) | 0; // 84038b: mov ebx, eax
        if (R.cL) { pc = 0x840452; continue; } // 84038d: jl 0x840452
        pc = 0x840393; continue;
      case 0x840393:
        if (!R.cLE) { pc = 0x84039f; continue; } // 840393: jg 0x84039f
        pc = 0x840395; continue;
      case 0x840395:
        R.sub((R.ebx >>> 0), R.m.u32(((R.esp + 0x18) | 0) >>> 0), 32); // 840395: cmp ebx, dword ptr [esp + 0x18]
        if (R.cBE) { pc = 0x840452; continue; } // 840399: jbe 0x840452
        pc = 0x84039f; continue;
      case 0x84039f:
        R.edx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 84039f: mov edx, dword ptr [ebp + 8]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edx + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8403a2: mov al, byte ptr [edx + 0x24]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x1e, 8)) & 0xff) << 0)) | 0; // 8403a5: and al, 0x1e
        R.sub(((R.eax >>> 0) & 0xff), 0xa, 8); // 8403a7: cmp al, 0xa
        if (R.zf) { pc = 0x8403bd; continue; } // 8403a9: je 0x8403bd
        pc = 0x8403ab; continue;
      case 0x8403ab:
        R.sub(((R.eax >>> 0) & 0xff), 0x8, 8); // 8403ab: cmp al, 8
        if (!R.zf) { pc = 0x840452; continue; } // 8403ad: jne 0x840452
        pc = 0x8403b3; continue;
      case 0x8403b3:
        R.sub(R.m.u8(((R.esi + 0x18) | 0) >>> 0), 0x1c, 8); // 8403b3: cmp byte ptr [esi + 0x18], 0x1c
        if (!R.cL) { pc = 0x840452; continue; } // 8403b7: jge 0x840452
        pc = 0x8403bd; continue;
      case 0x8403bd:
        R.eax = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 8403bd: mov eax, dword ptr [ebp + 0xc]
        R.edx = (((R.m.u16(((R.eax + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 8403c0: movsx edx, word ptr [eax + 0x80]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.edx >>> 0)); // 8403c7: mov dword ptr [esp + 0x24], edx
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 8403cb: fild dword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 7.692307692307693e-05; // 8403cf: fmul qword ptr [0x96f8a0]
        R.st[0] = R.st[0] + 0.5; // 8403d5: fadd qword ptr [0x968968]
        R.fpush(R.i64(((R.esp + 0x18) | 0))); // 8403db: fild qword ptr [esp + 0x18]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 8403df: fmulp st(1)
        R.fpush(2500000.0); // 8403e1: fld qword ptr [0x96a650]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 8403e7: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8403e9: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8403eb: test ah, 1
        if (R.zf) { pc = 0x8403f8; continue; } // 8403ee: je 0x8403f8
        pc = 0x8403f0; continue;
      case 0x8403f0:
        R.fpush(2500000.0); // 8403f0: fld qword ptr [0x96a650]
        pc = 0x8403fa; continue; // 8403f6: jmp 0x8403fa
      case 0x8403f8:
        R.fpush(R.st[0]); // 8403f8: fld st(0)
        pc = 0x8403fa; continue;
      case 0x8403fa:
        R.edx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 8403fa: mov edx, dword ptr [esp + 0x18]
        R.eax = ((R.ebx >>> 0)) | 0; // 8403fe: mov eax, ebx
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 840400: sub eax, edx
        R.edx = ((R.edi >>> 0)) | 0; // 840402: mov edx, edi
        R.edx = (R.sub((R.edx >>> 0), (R.ecx >>> 0), 32, R.cf ? 1 : 0)) | 0; // 840404: sbb edx, ecx
        R.m.w32(((R.esp + 0xa0) | 0) >>> 0, (R.eax >>> 0)); // 840406: mov dword ptr [esp + 0xa0], eax
        R.m.w32(((R.esp + 0xa4) | 0) >>> 0, (R.edx >>> 0)); // 84040d: mov dword ptr [esp + 0xa4], edx
        R.fpush(R.i64(((R.esp + 0xa0) | 0))); // 840414: fild qword ptr [esp + 0xa0]
        R.m.wf64(((R.esp + 0x5c) | 0) >>> 0, R.st[0]); // 84041b: fst qword ptr [esp + 0x5c]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 84041f: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 840421: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 840423: test ah, 1
        R.fpop(); // 840426: fstp st(0)
        if (R.zf) { pc = 0x840432; continue; } // 840428: je 0x840432
        pc = 0x84042a; continue;
      case 0x84042a:
        R.fpop(); // 84042a: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x5c) | 0))); // 84042c: fld qword ptr [esp + 0x5c]
        pc = 0x840449; continue; // 840430: jmp 0x840449
      case 0x840432:
        R.fpush(2500000.0); // 840432: fld qword ptr [0x96a650]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 840438: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84043a: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 84043c: test ah, 1
        if (R.zf) { pc = 0x840449; continue; } // 84043f: je 0x840449
        pc = 0x840441; continue;
      case 0x840441:
        R.fpop(); // 840441: fstp st(0)
        R.fpush(2500000.0); // 840443: fld qword ptr [0x96a650]
        pc = 0x840449; continue;
      case 0x840449:
        R.ftol(); // 840449: call 0x945640
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.eax >>> 0)); // 84044e: mov dword ptr [esp + 0x24], eax
        pc = 0x840452; continue;
      case 0x840452:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 840452: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 840458: push esi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 840459: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84045e: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 840460: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x84047f; continue; } // 840465: je 0x84047f
        pc = 0x840467; continue;
      case 0x840467:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 840467: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 84046a: mov edx, dword ptr [0xae23b4]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 840470: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 840473: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 840476: add ecx, eax
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 840478: add edx, eax
        R.ecx = (((R.edx + R.ecx * 4) | 0)) | 0; // 84047a: lea ecx, [edx + ecx*4]
        pc = 0x840481; continue; // 84047d: jmp 0x840481
      case 0x84047f:
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 84047f: xor ecx, ecx
        pc = 0x840481; continue;
      case 0x840481:
        R.eax = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 840481: mov eax, dword ptr [ebp + 0xc]
        R.edx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 840484: mov edx, dword ptr [esp + 0x18]
        R.push(0x0); // 840488: push 0
        R.push((R.edi >>> 0)); // 84048a: push edi
        R.push((R.ebx >>> 0)); // 84048b: push ebx
        R.push((R.eax >>> 0)); // 84048c: push eax
        R.eax = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 84048d: mov eax, dword ptr [esp + 0x34]
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 840491: add eax, edx
        R.edx = R.eax < 0 ? -1 : 0; // 840493: cdq 
        R.push((R.edx >>> 0)); // 840494: push edx
        R.push((R.eax >>> 0)); // 840495: push eax
        R.push((R.esi >>> 0)); // 840496: push esi
        R.push((R.ecx >>> 0)); // 840497: push ecx
        R.ecx = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 840498: mov ecx, dword ptr [esp + 0x30]
        R.call(0x84af00, { n: 8, thisEcx: false, calleeClean: true }); // 84049c: call 0x84af00
        R.sub(((R.eax >>> 0) & 0xff), 0x2, 8); // 8404a1: cmp al, 2
        if (R.zf) { pc = 0x840a81; continue; } // 8404a3: je 0x840a81
        pc = 0x8404a9; continue;
      case 0x8404a9:
        R.edi = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 8404a9: mov edi, dword ptr [esp + 0x34]
        pc = 0x8404ad; continue;
      case 0x8404ad:
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 8404ad: mov eax, dword ptr [esp + 0x94]
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 8404b4: cmp eax, -1
        if (R.zf) { pc = 0x8404c1; continue; } // 8404b7: je 0x8404c1
        pc = 0x8404b9; continue;
      case 0x8404b9:
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 8404b9: cmp edi, eax
        if (!R.cLE) { pc = 0x840a81; continue; } // 8404bb: jg 0x840a81
        pc = 0x8404c1; continue;
      case 0x8404c1:
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 8404c1: mov eax, dword ptr [esp + 0x14]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8404c5: test eax, eax
        if (R.zf) { pc = 0x84060e; continue; } // 8404c7: je 0x84060e
        pc = 0x8404cd; continue;
      case 0x8404cd:
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 8404cd: mov ecx, dword ptr [esp + 0x1c]
        R.eax = ((R.edi >>> 0)) | 0; // 8404d1: mov eax, edi
        R.edi = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 8404d3: mov edi, dword ptr [esp + 0x18]
        R.edx = R.eax < 0 ? -1 : 0; // 8404d7: cdq 
        R.eax = (R.sub((R.eax >>> 0), (R.edi >>> 0), 32)) | 0; // 8404d8: sub eax, edi
        R.edx = (R.sub((R.edx >>> 0), (R.ecx >>> 0), 32, R.cf ? 1 : 0)) | 0; // 8404da: sbb edx, ecx
        R.m.w32(((R.esp + 0x98) | 0) >>> 0, (R.eax >>> 0)); // 8404dc: mov dword ptr [esp + 0x98], eax
        R.m.w32(((R.esp + 0x9c) | 0) >>> 0, (R.edx >>> 0)); // 8404e3: mov dword ptr [esp + 0x9c], edx
        R.fpush(R.i64(((R.esp + 0x98) | 0))); // 8404ea: fild qword ptr [esp + 0x98]
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 8404f1: fild dword ptr [esp + 0x20]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x6c) | 0)); // 8404f5: fmul qword ptr [esp + 0x6c]
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 8404f9: fdivp st(1)
        R.st[0] = 1.0 - R.st[0]; // 8404fb: fsubr qword ptr [0x967890]
        R.fcom(R.st[0], 1.0); // 840501: fcom qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 840507: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 840509: test ah, 0x41
        if (!R.zf) { pc = 0x84051a; continue; } // 84050c: jne 0x84051a
        pc = 0x84050e; continue;
      case 0x84050e:
        R.st[0] = R.st[0] * 0.3333333333333333; // 84050e: fmul qword ptr [0x968a80]
        R.st[0] = R.st[0] + 0.67; // 840514: fadd qword ptr [0x968f80]
        pc = 0x84051a; continue;
      case 0x84051a:
        R.fpush(0.01); // 84051a: fld qword ptr [0x967898]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 840520: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 840522: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 840524: test ah, 0x41
        if (!R.zf) { pc = 0x840533; continue; } // 840527: jne 0x840533
        pc = 0x840529; continue;
      case 0x840529:
        R.fpop(); // 840529: fstp st(0)
        R.fpush(0.01); // 84052b: fld qword ptr [0x967898]
        pc = 0x84054a; continue; // 840531: jmp 0x84054a
      case 0x840533:
        R.fpush(3.0); // 840533: fld qword ptr [0x968930]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 840539: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84053b: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 84053d: test ah, 1
        if (R.zf) { pc = 0x84054a; continue; } // 840540: je 0x84054a
        pc = 0x840542; continue;
      case 0x840542:
        R.fpop(); // 840542: fstp st(0)
        R.fpush(3.0); // 840544: fld qword ptr [0x968930]
        pc = 0x84054a; continue;
      case 0x84054a:
        R.fpush(R.m.s32(((R.esp + 0x2c) | 0) >>> 0)); // 84054a: fild dword ptr [esp + 0x2c]
        R.st[0] = R.st[0] * R.st[1]; // 84054e: fmul st(1)
        R.ftol(); // 840550: call 0x945640
        R.ecx = (R.m.u32(((0xb63d28) | 0) >>> 0)) | 0; // 840555: mov ecx, dword ptr [0xb63d28]
        R.push((R.esi >>> 0)); // 84055b: push esi
        R.fpop(); // 84055c: fstp st(0)
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.eax >>> 0)); // 84055e: mov dword ptr [esp + 0x30], eax
        R.call(0x62ed70, { n: 1, thisEcx: true, calleeClean: true }); // 840562: call 0x62ed70
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 840567: test eax, eax
        if (R.zf) { pc = 0x8405ea; continue; } // 840569: je 0x8405ea
        pc = 0x84056b; continue;
      case 0x84056b:
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.eax + 0x2c) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 84056b: mov ax, word ptr [eax + 0x2c]
        R.sub(((R.eax >>> 0) & 0xffff), 0xf, 16); // 84056f: cmp ax, 0xf
        if (R.cLE) { pc = 0x8405ea; continue; } // 840573: jle 0x8405ea
        pc = 0x840575; continue;
      case 0x840575:
        R.eax = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 840575: movsx eax, ax
        R.eax = (R.add((R.eax >>> 0), 0xfffffff1, 32)) | 0; // 840578: add eax, -0xf
        R.ecx = ((R.eax >>> 0)) | 0; // 84057b: mov ecx, eax
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 84057d: imul ecx, eax
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, R.sub(R.m.u32(((R.esp + 0x2c) | 0) >>> 0), (R.ecx >>> 0), 32)); // 840580: sub dword ptr [esp + 0x2c], ecx
        pc = 0x8405ea; continue; // 840584: jmp 0x8405ea
      case 0x840586:
        R.edx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 840586: mov edx, dword ptr [ebp + 0xc]
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 840589: mov ecx, dword ptr [esp + 0x18]
        R.push((R.eax >>> 0)); // 84058d: push eax
        R.eax = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 84058e: mov eax, dword ptr [esp + 0x20]
        R.push(0xffffffff); // 840592: push -1
        R.push(0xffffffff); // 840594: push -1
        R.push((R.edx >>> 0)); // 840596: push edx
        R.edx = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 840597: mov edx, dword ptr [esi + 0x39]
        R.push((R.eax >>> 0)); // 84059a: push eax
        R.push((R.ecx >>> 0)); // 84059b: push ecx
        R.ecx = (R.m.u32(((R.esp + 0x28) | 0) >>> 0)) | 0; // 84059c: mov ecx, dword ptr [esp + 0x28]
        R.push((R.esi >>> 0)); // 8405a0: push esi
        R.push((R.edx >>> 0)); // 8405a1: push edx
        R.call(0x84af00, { n: 8, thisEcx: false, calleeClean: true }); // 8405a2: call 0x84af00
        R.sub(((R.eax >>> 0) & 0xff), 0x2, 8); // 8405a7: cmp al, 2
        if (R.zf) { pc = 0x840a81; continue; } // 8405a9: je 0x840a81
        pc = 0x8405af; continue;
      case 0x8405af:
        R.ecx = (R.m.u32(((0xb63d28) | 0) >>> 0)) | 0; // 8405af: mov ecx, dword ptr [0xb63d28]
        R.push((R.esi >>> 0)); // 8405b5: push esi
        R.call(0x62ed70, { n: 1, thisEcx: true, calleeClean: true }); // 8405b6: call 0x62ed70
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8405bb: test eax, eax
        if (R.zf) { pc = 0x8405ea; continue; } // 8405bd: je 0x8405ea
        pc = 0x8405bf; continue;
      case 0x8405bf:
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.eax + 0x2c) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8405bf: mov ax, word ptr [eax + 0x2c]
        R.sub(((R.eax >>> 0) & 0xffff), 0xa, 16); // 8405c3: cmp ax, 0xa
        if (R.cLE) { pc = 0x8405ea; continue; } // 8405c7: jle 0x8405ea
        pc = 0x8405c9; continue;
      case 0x8405c9:
        R.ecx = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8405c9: movsx ecx, ax
        R.eax = (0xa) | 0; // 8405cc: mov eax, 0xa
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 8405d1: sub eax, ecx
        R.ecx = (R.add((R.ecx >>> 0), 0xfffffff6, 32)) | 0; // 8405d3: add ecx, -0xa
        { const p = BigInt((((R.ecx >>> 0)) | 0)) * BigInt((((R.eax >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.eax = (Number(BigInt.asIntN(32, p))) | 0; } // 8405d6: imul eax, ecx
        R.ecx = (((R.eax + R.eax * 2) | 0)) | 0; // 8405d9: lea ecx, [eax + eax*2]
        R.edx = (((R.eax + R.ecx * 8) | 0)) | 0; // 8405dc: lea edx, [eax + ecx*8]
        R.eax = (R.m.u32(((R.esp + 0x2c) | 0) >>> 0)) | 0; // 8405df: mov eax, dword ptr [esp + 0x2c]
        R.ecx = (((R.eax + R.edx * 8) | 0)) | 0; // 8405e3: lea ecx, [eax + edx*8]
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.ecx >>> 0)); // 8405e6: mov dword ptr [esp + 0x2c], ecx
        pc = 0x8405ea; continue;
      case 0x8405ea:
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 8405ea: mov eax, dword ptr [esp + 0x14]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8405ee: test eax, eax
        if (R.zf) { pc = 0x84060e; continue; } // 8405f0: je 0x84060e
        pc = 0x8405f2; continue;
      case 0x8405f2:
        R.edx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 8405f2: mov edx, dword ptr [ebp + 0xc]
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 8405f5: mov ecx, dword ptr [0xde1f54]
        R.push(0x0); // 8405fb: push 0
        R.push(0x0); // 8405fd: push 0
        R.push((R.edx >>> 0)); // 8405ff: push edx
        R.push((R.esi >>> 0)); // 840600: push esi
        R.call(0x8ce990, { n: 4, thisEcx: true, calleeClean: true }); // 840601: call 0x8ce990
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 840606: test eax, eax
        if (R.zf) { pc = 0x840a81; continue; } // 840608: je 0x840a81
        pc = 0x84060e; continue;
      case 0x84060e:
        R.push(0x11); // 84060e: push 0x11
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 840610: call 0x90cfc0
        R.eax = (R.add((R.eax >>> 0), 0x5c, 32)) | 0; // 840615: add eax, 0x5c
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 840618: add esp, 4
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.eax >>> 0)); // 84061b: mov dword ptr [esp + 0x24], eax
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 84061f: fild dword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 0.01; // 840623: fmul qword ptr [0x967898]
        R.st[0] = R.st[0] * R.m.s32(((R.esp + 0x2c) | 0) >>> 0); // 840629: fimul dword ptr [esp + 0x2c]
        R.ftol(); // 84062d: call 0x945640
        R.ecx = (R.m.u32(((R.esp + 0x58) | 0) >>> 0)) | 0; // 840632: mov ecx, dword ptr [esp + 0x58]
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.eax >>> 0)); // 840636: mov dword ptr [esp + 0x2c], eax
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 84063a: cmp eax, ecx
        if (R.cLE) { pc = 0x84094e; continue; } // 84063c: jle 0x84094e
        pc = 0x840642; continue;
      case 0x840642:
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 840642: mov eax, dword ptr [esp + 0x14]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 840646: test eax, eax
        if (R.zf) { pc = 0x84066f; continue; } // 840648: je 0x84066f
        pc = 0x84064a; continue;
      case 0x84064a:
        R.edi = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 84064a: mov edi, dword ptr [ebp + 8]
        R.ebx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 84064d: mov ebx, dword ptr [ebp + 0xc]
        R.push(0x0); // 840650: push 0
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edi + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 840652: mov al, byte ptr [edi + 0x24]
        R.ecx = ((R.ecx & 0xffffff00) | (((((R.eax >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 840655: mov cl, al
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x1, 8)) & 0xff) << 0)) | 0; // 840657: and al, 1
        R.ecx = ((R.ecx & 0xffffff00) | (((R.shr(((R.ecx >>> 0) & 0xff), 0x1, 8)) & 0xff) << 0)) | 0; // 840659: shr cl, 1
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0xf, 8)) & 0xff) << 0)) | 0; // 84065b: and cl, 0xf
        R.push((R.ecx >>> 0)); // 84065e: push ecx
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 84065f: mov ecx, dword ptr [esp + 0x18]
        R.push((R.eax >>> 0)); // 840663: push eax
        R.push(0x1); // 840664: push 1
        R.push((R.ebx >>> 0)); // 840666: push ebx
        R.push((R.esi >>> 0)); // 840667: push esi
        R.call(0x846920, { n: 6, thisEcx: true, calleeClean: true, float: true }); // 840668: call 0x846920
        pc = 0x840687; continue; // 84066d: jmp 0x840687
      case 0x84066f:
        R.edi = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 84066f: mov edi, dword ptr [ebp + 8]
        R.ebx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 840672: mov ebx, dword ptr [ebp + 0xc]
        R.ecx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 840675: mov ecx, dword ptr [esp + 0x10]
        R.push(0x0); // 840679: push 0
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.edi) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84067b: mov dl, byte ptr [edi]
        R.push((R.edx >>> 0)); // 84067d: push edx
        R.push(0x1); // 84067e: push 1
        R.push((R.ebx >>> 0)); // 840680: push ebx
        R.push((R.esi >>> 0)); // 840681: push esi
        R.call(0x844780, { n: 5, thisEcx: true, calleeClean: true, float: true }); // 840682: call 0x844780
        pc = 0x840687; continue;
      case 0x840687:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edi + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 840687: mov al, byte ptr [edi + 0x24]
        R.m.wf64(((R.esp + 0x34) | 0) >>> 0, R.st[0]); R.fpop(); // 84068a: fstp qword ptr [esp + 0x34]
        R.logic(((R.eax >>> 0) & 0xff) & 0x1, 8); // 84068e: test al, 1
        if (!R.zf) { pc = 0x8407a2; continue; } // 840690: jne 0x8407a2
        pc = 0x840696; continue;
      case 0x840696:
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 840696: mov eax, dword ptr [esp + 0x14]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84069a: test eax, eax
        if (R.zf) { pc = 0x8407a2; continue; } // 84069c: je 0x8407a2
        pc = 0x8406a2; continue;
      case 0x8406a2:
        R.push(0x14); // 8406a2: push 0x14
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8406a4: call 0x90cfc0
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 8406a9: mov dword ptr [esp + 0x28], eax
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8406ad: add esp, 4
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 8406b0: fild dword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 0.1; // 8406b4: fmul qword ptr [0x967880]
        R.st[0] = 3.15 - R.st[0]; // 8406ba: fsubr qword ptr [0x968e58]
        R.fcom(R.st[0], R.f64(((R.esp + 0x34) | 0))); R.fpop(); // 8406c0: fcomp qword ptr [esp + 0x34]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8406c4: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 8406c6: test ah, 0x41
        if (R.zf) { pc = 0x8407a2; continue; } // 8406c9: je 0x8407a2
        pc = 0x8406cf; continue;
      case 0x8406cf:
        R.eax = (R.m.u32(((R.esi + 0x61) | 0) >>> 0)) | 0; // 8406cf: mov eax, dword ptr [esi + 0x61]
        R.ecx = (((R.m.u16(((R.eax + 0xb) | 0) >>> 0)) << 16 >> 16)) | 0; // 8406d2: movsx ecx, word ptr [eax + 0xb]
        R.eax = (0x1b4e81b5) | 0; // 8406d6: mov eax, 0x1b4e81b5
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 8406db: imul ecx
        R.edx = (R.sar((R.edx >>> 0), 0x4, 32)) | 0; // 8406dd: sar edx, 4
        R.ecx = ((R.edx >>> 0)) | 0; // 8406e0: mov ecx, edx
        R.eax = (0x4f) | 0; // 8406e2: mov eax, 0x4f
        R.ecx = (R.shr((R.ecx >>> 0), 0x1f, 32)) | 0; // 8406e7: shr ecx, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 8406ea: add edx, ecx
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 8406ec: sub eax, edx
        R.push((R.eax >>> 0)); // 8406ee: push eax
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 8406ef: call 0x90cfc0
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8406f4: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8406f7: test eax, eax
        if (!R.zf) { pc = 0x8407a2; continue; } // 8406f9: jne 0x8407a2
        pc = 0x8406ff; continue;
      case 0x8406ff:
        R.push(0x7d0); // 8406ff: push 0x7d0
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 840704: call 0x90cfc0
        R.ecx = (R.m.u32(((R.esi + 0x61) | 0) >>> 0)) | 0; // 840709: mov ecx, dword ptr [esi + 0x61]
        R.eax = (R.add((R.eax >>> 0), 0x1388, 32)) | 0; // 84070c: add eax, 0x1388
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 840711: add esp, 4
        R.edx = (((R.m.u16(((R.ecx + 0xb) | 0) >>> 0)) << 16 >> 16)) | 0; // 840714: movsx edx, word ptr [ecx + 0xb]
        R.sub((R.edx >>> 0), (R.eax >>> 0), 32); // 840718: cmp edx, eax
        if (!R.cLE) { pc = 0x840738; continue; } // 84071a: jg 0x840738
        pc = 0x84071c; continue;
      case 0x84071c:
        R.eax = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 84071c: mov eax, dword ptr [esi + 0x39]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84071f: test eax, eax
        if (R.zf) { pc = 0x8407a2; continue; } // 840721: je 0x8407a2
        pc = 0x840723; continue;
      case 0x840723:
        R.push(0x0); // 840723: push 0
        R.push(0x0); // 840725: push 0
        R.push(0x1); // 840727: push 1
        R.push(0x0); // 840729: push 0
        R.push((R.eax >>> 0)); // 84072b: push eax
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 84072c: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 840731: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 840734: test eax, eax
        if (R.zf) { pc = 0x8407a2; continue; } // 840736: je 0x8407a2
        pc = 0x840738; continue;
      case 0x840738:
        R.ecx = (R.m.u32(((R.esp + 0x44) | 0) >>> 0)) | 0; // 840738: mov ecx, dword ptr [esp + 0x44]
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 84073c: xor eax, eax
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 84073e: cmp ecx, eax
        if (R.zf) { pc = 0x84074c; continue; } // 840740: je 0x84074c
        pc = 0x840742; continue;
      case 0x840742:
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.eax >>> 0)); // 840742: mov dword ptr [esp + 0x18], eax
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 840746: mov dword ptr [esp + 0x1c], eax
        pc = 0x84078a; continue; // 84074a: jmp 0x84078a
      case 0x84074c:
        R.fpush(R.i64(((R.esp + 0x18) | 0))); // 84074c: fild qword ptr [esp + 0x18]
        R.m.wf64(((R.esp + 0x5c) | 0) >>> 0, R.st[0]); // 840750: fst qword ptr [esp + 0x5c]
        R.st[0] = R.st[0] * 1.25; // 840754: fmul qword ptr [0x968928]
        R.ftol(); // 84075a: call 0x945640
        R.push((R.eax >>> 0)); // 84075f: push eax
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 840760: call 0x90cfc0
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 840765: mov dword ptr [esp + 0x28], eax
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 840769: add esp, 4
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 84076c: fild dword ptr [esp + 0x24]
        R.fpush(R.f64(((R.esp + 0x5c) | 0))); // 840770: fld qword ptr [esp + 0x5c]
        R.st[0] = R.st[0] * 0.75; // 840774: fmul qword ptr [0x969040]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 84077a: faddp st(1)
        R.ftol(); // 84077c: call 0x945640
        R.edx = R.eax < 0 ? -1 : 0; // 840781: cdq 
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.eax >>> 0)); // 840782: mov dword ptr [esp + 0x18], eax
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 840786: mov dword ptr [esp + 0x1c], edx
        pc = 0x84078a; continue;
      case 0x84078a:
        R.ecx = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 84078a: mov ecx, dword ptr [esp + 0x38]
        R.edx = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 84078e: mov edx, dword ptr [esp + 0x34]
        R.push((R.ecx >>> 0)); // 840792: push ecx
        R.ecx = (R.m.u32(((0xb6b7c8) | 0) >>> 0)) | 0; // 840793: mov ecx, dword ptr [0xb6b7c8]
        R.push((R.edx >>> 0)); // 840799: push edx
        R.push((R.eax >>> 0)); // 84079a: push eax
        R.push((R.ebx >>> 0)); // 84079b: push ebx
        R.push((R.esi >>> 0)); // 84079c: push esi
        R.call(0x754740, { n: 5, thisEcx: true, calleeClean: true }); // 84079d: call 0x754740
        pc = 0x8407a2; continue;
      case 0x8407a2:
        R.fpush(R.f64(((R.esp + 0x34) | 0))); // 8407a2: fld qword ptr [esp + 0x34]
        R.fcom(R.st[0], 3.15); R.fpop(); // 8407a6: fcomp qword ptr [0x968e58]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8407ac: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8407ae: test ah, 1
        if (!R.zf) { pc = 0x84094e; continue; } // 8407b1: jne 0x84094e
        pc = 0x8407b7; continue;
      case 0x8407b7:
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 8407b7: mov eax, dword ptr [ebp + 8]
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.eax + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8407ba: mov bl, byte ptr [eax + 0x24]
        R.logic(((R.ebx >>> 0) & 0xff) & 0x1, 8); // 8407bd: test bl, 1
        if (!R.zf) { pc = 0x84093f; continue; } // 8407c0: jne 0x84093f
        pc = 0x8407c6; continue;
      case 0x8407c6:
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 8407c6: mov eax, dword ptr [esp + 0x14]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8407ca: test eax, eax
        if (R.zf) { pc = 0x84093f; continue; } // 8407cc: je 0x84093f
        pc = 0x8407d2; continue;
      case 0x8407d2:
        R.ecx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 8407d2: mov ecx, dword ptr [ebp + 0xc]
        R.edi = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 8407d5: mov edi, dword ptr [esp + 0x1c]
        R.ecx = (((R.m.u16(((R.ecx + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 8407d9: movsx ecx, word ptr [ecx + 0x80]
        R.edx = (((R.ecx + R.ecx * 2) | 0)) | 0; // 8407e0: lea edx, [ecx + ecx*2]
        R.eax = (((R.ecx + R.edx * 8) | 0)) | 0; // 8407e3: lea eax, [ecx + edx*8]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 8407e6: lea eax, [eax + eax*4]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 8407e9: lea eax, [eax + eax*4]
        R.eax = (R.shl((R.eax >>> 0), 0x1, 32)) | 0; // 8407ec: shl eax, 1
        R.edx = R.eax < 0 ? -1 : 0; // 8407ee: cdq 
        R.sub((R.edi >>> 0), (R.edx >>> 0), 32); // 8407ef: cmp edi, edx
        if (R.cL) { pc = 0x84080a; continue; } // 8407f1: jl 0x84080a
        pc = 0x8407f3; continue;
      case 0x8407f3:
        if (!R.cLE) { pc = 0x8407fb; continue; } // 8407f3: jg 0x8407fb
        pc = 0x8407f5; continue;
      case 0x8407f5:
        R.sub(R.m.u32(((R.esp + 0x18) | 0) >>> 0), (R.eax >>> 0), 32); // 8407f5: cmp dword ptr [esp + 0x18], eax
        if (R.cBE) { pc = 0x84080a; continue; } // 8407f9: jbe 0x84080a
        pc = 0x8407fb; continue;
      case 0x8407fb:
        R.eax = ((R.eax & 0xffffff00) | (((((R.ebx >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 8407fb: mov al, bl
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x1e, 8)) & 0xff) << 0)) | 0; // 8407fd: and al, 0x1e
        R.sub(((R.eax >>> 0) & 0xff), 0x2, 8); // 8407ff: cmp al, 2
        if (R.zf) { pc = 0x84080a; continue; } // 840801: je 0x84080a
        pc = 0x840803; continue;
      case 0x840803:
        R.m.w8(((R.esp + 0x48) | 0) >>> 0, 0x1); // 840803: mov byte ptr [esp + 0x48], 1
        pc = 0x84087c; continue; // 840808: jmp 0x84087c
      case 0x84080a:
        R.edx = (((R.ecx + R.ecx * 2) | 0)) | 0; // 84080a: lea edx, [ecx + ecx*2]
        R.eax = (((R.ecx + R.edx * 8) | 0)) | 0; // 84080d: lea eax, [ecx + edx*8]
        R.eax = (((R.eax + R.eax * 2) | 0)) | 0; // 840810: lea eax, [eax + eax*2]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 840813: lea eax, [eax + eax*4]
        R.eax = (R.shl((R.eax >>> 0), 0x1, 32)) | 0; // 840816: shl eax, 1
        R.edx = R.eax < 0 ? -1 : 0; // 840818: cdq 
        R.sub((R.edi >>> 0), (R.edx >>> 0), 32); // 840819: cmp edi, edx
        if (R.cL) { pc = 0x840834; continue; } // 84081b: jl 0x840834
        pc = 0x84081d; continue;
      case 0x84081d:
        if (!R.cLE) { pc = 0x840825; continue; } // 84081d: jg 0x840825
        pc = 0x84081f; continue;
      case 0x84081f:
        R.sub(R.m.u32(((R.esp + 0x18) | 0) >>> 0), (R.eax >>> 0), 32); // 84081f: cmp dword ptr [esp + 0x18], eax
        if (R.cBE) { pc = 0x840834; continue; } // 840823: jbe 0x840834
        pc = 0x840825; continue;
      case 0x840825:
        R.eax = ((R.eax & 0xffffff00) | (((((R.ebx >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 840825: mov al, bl
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x1e, 8)) & 0xff) << 0)) | 0; // 840827: and al, 0x1e
        R.sub(((R.eax >>> 0) & 0xff), 0x4, 8); // 840829: cmp al, 4
        if (!R.cf) { pc = 0x840834; continue; } // 84082b: jae 0x840834
        pc = 0x84082d; continue;
      case 0x84082d:
        R.m.w8(((R.esp + 0x48) | 0) >>> 0, 0x2); // 84082d: mov byte ptr [esp + 0x48], 2
        pc = 0x84087c; continue; // 840832: jmp 0x84087c
      case 0x840834:
        R.edx = ((R.edx & 0xffffff00) | (((((R.ebx >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 840834: mov dl, bl
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) & 0x1e, 8)) & 0xff) << 0)) | 0; // 840836: and dl, 0x1e
        R.sub(((R.edx >>> 0) & 0xff), 0xa, 8); // 840839: cmp dl, 0xa
        if (!R.zf) { pc = 0x840873; continue; } // 84083c: jne 0x840873
        pc = 0x84083e; continue;
      case 0x84083e:
        R.edx = (R.m.u32(((R.esi + 0x61) | 0) >>> 0)) | 0; // 84083e: mov edx, dword ptr [esi + 0x61]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 840841: test edx, edx
        if (R.zf) { pc = 0x840873; continue; } // 840843: je 0x840873
        pc = 0x840845; continue;
      case 0x840845:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x18) | 0) >>> 0)) & 0xff) << 0)) | 0; // 840845: mov al, byte ptr [esi + 0x18]
        R.sub(((R.eax >>> 0) & 0xff), 0x14, 8); // 840848: cmp al, 0x14
        if (R.cLE) { pc = 0x840873; continue; } // 84084a: jle 0x840873
        pc = 0x84084c; continue;
      case 0x84084c:
        R.sub(((R.eax >>> 0) & 0xff), 0x18, 8); // 84084c: cmp al, 0x18
        if (!R.cL) { pc = 0x840873; continue; } // 84084e: jge 0x840873
        pc = 0x840850; continue;
      case 0x840850:
        R.eax = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 840850: mov eax, dword ptr [ebp + 0xc]
        R.sub(R.m.u16(((R.eax + 0x80) | 0) >>> 0), 0x109a, 16); // 840853: cmp word ptr [eax + 0x80], 0x109a
        if (!R.cL) { pc = 0x840873; continue; } // 84085c: jge 0x840873
        pc = 0x84085e; continue;
      case 0x84085e:
        R.edx = (((R.m.u16(((R.edx + 0xb) | 0) >>> 0)) << 16 >> 16)) | 0; // 84085e: movsx edx, word ptr [edx + 0xb]
        R.edx = (R.sub((R.edx >>> 0), 0x2ee, 32)) | 0; // 840862: sub edx, 0x2ee
        R.sub((R.edx >>> 0), (R.ecx >>> 0), 32); // 840868: cmp edx, ecx
        if (R.cLE) { pc = 0x840873; continue; } // 84086a: jle 0x840873
        pc = 0x84086c; continue;
      case 0x84086c:
        R.m.w8(((R.esp + 0x48) | 0) >>> 0, 0x3); // 84086c: mov byte ptr [esp + 0x48], 3
        pc = 0x84087c; continue; // 840871: jmp 0x84087c
      case 0x840873:
        R.ebx = ((R.ebx & 0xffffff00) | (((R.shr(((R.ebx >>> 0) & 0xff), 0x1, 8)) & 0xff) << 0)) | 0; // 840873: shr bl, 1
        R.ebx = ((R.ebx & 0xffffff00) | (((R.logic(((R.ebx >>> 0) & 0xff) & 0xf, 8)) & 0xff) << 0)) | 0; // 840875: and bl, 0xf
        R.m.w8(((R.esp + 0x48) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 840878: mov byte ptr [esp + 0x48], bl
        pc = 0x84087c; continue;
      case 0x84087c:
        R.edi = (R.m.u32(((R.esp + 0x48) | 0) >>> 0)) | 0; // 84087c: mov edi, dword ptr [esp + 0x48]
        R.ebx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 840880: mov ebx, dword ptr [ebp + 0xc]
        R.push(0x0); // 840883: push 0
        R.push(0xb); // 840885: push 0xb
        R.push((R.edi >>> 0)); // 840887: push edi
        R.push(0x0); // 840888: push 0
        R.push((R.ebx >>> 0)); // 84088a: push ebx
        R.push((R.esi >>> 0)); // 84088b: push esi
        R.ecx = (((R.esp + 0xd0) | 0)) | 0; // 84088c: lea ecx, [esp + 0xd0]
        R.call(0x864550, { n: 6, thisEcx: false, calleeClean: true, float: true }); // 840893: call 0x864550
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 840898: mov eax, dword ptr [ebp + 8]
        R.push(0x0); // 84089b: push 0
        R.m.wf32(((R.esp + 0x28) | 0) >>> 0, R.st[0]); R.fpop(); // 84089d: fstp dword ptr [esp + 0x28]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8408a1: mov cl, byte ptr [eax + 0x24]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.shr(((R.ecx >>> 0) & 0xff), 0x1, 8)) & 0xff) << 0)) | 0; // 8408a4: shr cl, 1
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0xf, 8)) & 0xff) << 0)) | 0; // 8408a6: and cl, 0xf
        R.push((R.ecx >>> 0)); // 8408a9: push ecx
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 8408aa: mov ecx, dword ptr [esp + 0x18]
        R.push(0x0); // 8408ae: push 0
        R.push(0x0); // 8408b0: push 0
        R.push((R.ebx >>> 0)); // 8408b2: push ebx
        R.push((R.esi >>> 0)); // 8408b3: push esi
        R.call(0x846920, { n: 6, thisEcx: true, calleeClean: true, float: true }); // 8408b4: call 0x846920
        R.fcom(R.st[0], 0.1); R.fpop(); // 8408b9: fcomp qword ptr [0x967880]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8408bf: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8408c1: test ah, 1
        if (R.zf) { pc = 0x8408ce; continue; } // 8408c4: je 0x8408ce
        pc = 0x8408c6; continue;
      case 0x8408c6:
        R.fpush(0.1); // 8408c6: fld qword ptr [0x967880]
        pc = 0x8408ea; continue; // 8408cc: jmp 0x8408ea
      case 0x8408ce:
        R.edx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 8408ce: mov edx, dword ptr [ebp + 8]
        R.ecx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 8408d1: mov ecx, dword ptr [esp + 0x10]
        R.push(0x0); // 8408d5: push 0
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edx + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8408d7: mov al, byte ptr [edx + 0x24]
        R.eax = ((R.eax & 0xffffff00) | (((R.shr(((R.eax >>> 0) & 0xff), 0x1, 8)) & 0xff) << 0)) | 0; // 8408da: shr al, 1
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf, 8)) & 0xff) << 0)) | 0; // 8408dc: and al, 0xf
        R.push((R.eax >>> 0)); // 8408de: push eax
        R.push(0x0); // 8408df: push 0
        R.push(0x0); // 8408e1: push 0
        R.push((R.ebx >>> 0)); // 8408e3: push ebx
        R.push((R.esi >>> 0)); // 8408e4: push esi
        R.call(0x846920, { n: 6, thisEcx: true, calleeClean: true, float: true }); // 8408e5: call 0x846920
        pc = 0x8408ea; continue;
      case 0x8408ea:
        R.st[0] = 3.5 / R.st[0]; // 8408ea: fdivr qword ptr [0x968e38]
        R.fcom(R.st[0], 0.9); // 8408f0: fcom qword ptr [0x9689d8]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8408f6: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8408f8: test ah, 1
        if (R.zf) { pc = 0x840905; continue; } // 8408fb: je 0x840905
        pc = 0x8408fd; continue;
      case 0x8408fd:
        R.fpop(); // 8408fd: fstp st(0)
        R.fpush(0.8999999761581421); // 8408ff: fld dword ptr [0x96a32c]
        pc = 0x840905; continue;
      case 0x840905:
        R.st[0] = R.st[0] * R.f32(((R.esp + 0x24) | 0)); // 840905: fmul dword ptr [esp + 0x24]
        R.ecx = (R.m.u32(((0xae2a38) | 0) >>> 0)) | 0; // 840909: mov ecx, dword ptr [0xae2a38]
        R.push((R.edi >>> 0)); // 84090f: push edi
        R.push((R.esi >>> 0)); // 840910: push esi
        R.push((R.ebx >>> 0)); // 840911: push ebx
        R.m.wf64(((R.esp + 0x68) | 0) >>> 0, R.st[0]); R.fpop(); // 840912: fstp qword ptr [esp + 0x68]
        R.call(0x5a0590, { n: 1, thisEcx: true, calleeClean: true }); // 840916: call 0x5a0590
        R.ecx = ((R.eax >>> 0)) | 0; // 84091b: mov ecx, eax
        R.call(0x5968d0, { n: 2, thisEcx: true, calleeClean: true }); // 84091d: call 0x5968d0
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.eax >>> 0)); // 840922: mov dword ptr [esp + 0x24], eax
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 840926: fild dword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 1.2; // 84092a: fmul qword ptr [0x968978]
        R.fcom(R.st[0], R.f64(((R.esp + 0x5c) | 0))); R.fpop(); // 840930: fcomp qword ptr [esp + 0x5c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 840934: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 840936: test ah, 1
        if (!R.zf) { pc = 0x840a81; continue; } // 840939: jne 0x840a81
        pc = 0x84093f; continue;
      case 0x84093f:
        R.ecx = (R.m.u32(((R.esp + 0x2c) | 0) >>> 0)) | 0; // 84093f: mov ecx, dword ptr [esp + 0x2c]
        R.m.w32(((R.esp + 0x88) | 0) >>> 0, (R.esi >>> 0)); // 840943: mov dword ptr [esp + 0x88], esi
        R.m.w32(((R.esp + 0x58) | 0) >>> 0, (R.ecx >>> 0)); // 84094a: mov dword ptr [esp + 0x58], ecx
        pc = 0x84094e; continue;
      case 0x84094e:
        R.fpush(R.m.s32(((R.esp + 0x2c) | 0) >>> 0)); // 84094e: fild dword ptr [esp + 0x2c]
        R.st[0] = R.st[0] * 1.5; // 840952: fmul qword ptr [0x968940]
        R.ftol(); // 840958: call 0x945640
        R.push((R.eax >>> 0)); // 84095d: push eax
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 84095e: call 0x90cfc0
        R.ecx = (R.m.u32(((R.esp + 0x5c) | 0) >>> 0)) | 0; // 840963: mov ecx, dword ptr [esp + 0x5c]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 840967: add esp, 4
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 84096a: cmp eax, ecx
        if (R.cLE) { pc = 0x840a81; continue; } // 84096c: jle 0x840a81
        pc = 0x840972; continue;
      case 0x840972:
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 840972: mov eax, dword ptr [esp + 0x14]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 840976: test eax, eax
        if (R.zf) { pc = 0x840a81; continue; } // 840978: je 0x840a81
        pc = 0x84097e; continue;
      case 0x84097e:
        R.push(0x6); // 84097e: push 6
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 840980: call 0x90cfc0
        R.edx = (0x1c) | 0; // 840985: mov edx, 0x1c
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 84098a: add esp, 4
        R.edx = (R.sub((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 84098d: sub edx, eax
        R.eax = (((R.m.u8(((R.esi + 0x18) | 0) >>> 0)) << 24 >> 24)) | 0; // 84098f: movsx eax, byte ptr [esi + 0x18]
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 840993: cmp eax, edx
        if (!R.cL) { pc = 0x840a81; continue; } // 840995: jge 0x840a81
        pc = 0x84099b; continue;
      case 0x84099b:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 84099b: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 8409a1: push esi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 8409a2: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8409a7: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 8409a9: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x840a81; continue; } // 8409ae: je 0x840a81
        pc = 0x8409b4; continue;
      case 0x8409b4:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 8409b4: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 8409b7: mov edx, dword ptr [0xae23b4]
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8409bd: add edx, eax
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 8409bf: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 8409c2: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 8409c5: add ecx, eax
        R.eax = (((R.edx + R.ecx * 4) | 0)) | 0; // 8409c7: lea eax, [edx + ecx*4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8409ca: test eax, eax
        if (R.zf) { pc = 0x840a81; continue; } // 8409cc: je 0x840a81
        pc = 0x8409d2; continue;
      case 0x8409d2:
        R.eax = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 8409d2: mov eax, dword ptr [esi + 0x39]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8409d5: test eax, eax
        if (R.zf) { pc = 0x840a81; continue; } // 8409d7: je 0x840a81
        pc = 0x8409dd; continue;
      case 0x8409dd:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8409dd: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 8409e3: push esi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 8409e4: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8409e9: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 8409eb: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x840a0a; continue; } // 8409f0: je 0x840a0a
        pc = 0x8409f2; continue;
      case 0x8409f2:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 8409f2: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 8409f5: mov edx, dword ptr [0xae23b4]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 8409fb: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 8409fe: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 840a01: add ecx, eax
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 840a03: add edx, eax
        R.edi = (((R.edx + R.ecx * 4) | 0)) | 0; // 840a05: lea edi, [edx + ecx*4]
        pc = 0x840a0c; continue; // 840a08: jmp 0x840a0c
      case 0x840a0a:
        R.edi = (R.logic((R.edi >>> 0) ^ (R.edi >>> 0), 32)) | 0; // 840a0a: xor edi, edi
        pc = 0x840a0c; continue;
      case 0x840a0c:
        R.push(0x3e8); // 840a0c: push 0x3e8
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 840a11: call 0x90cfc0
        R.ecx = (((R.m.u16(((R.edi + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 840a16: movsx ecx, word ptr [edi + 0x80]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 840a1d: add esp, 4
        R.edx = (((R.eax + R.ecx + 0x7d0) | 0)) | 0; // 840a20: lea edx, [eax + ecx + 0x7d0]
        R.eax = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 840a27: mov eax, dword ptr [ebp + 0xc]
        R.ecx = (((R.m.u16(((R.eax + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 840a2a: movsx ecx, word ptr [eax + 0x80]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 840a31: cmp ecx, edx
        if (R.cLE) { pc = 0x840a81; continue; } // 840a33: jle 0x840a81
        pc = 0x840a35; continue;
      case 0x840a35:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 840a35: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 840a3b: push esi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 840a3c: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 840a41: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 840a43: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x840a62; continue; } // 840a48: je 0x840a62
        pc = 0x840a4a; continue;
      case 0x840a4a:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 840a4a: mov eax, dword ptr [eax + 4]
        R.ecx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 840a4d: mov ecx, dword ptr [0xae23b4]
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 840a53: lea edx, [eax + eax*8]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 840a56: shl edx, 4
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 840a59: add edx, eax
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 840a5b: add ecx, eax
        R.eax = (((R.ecx + R.edx * 4) | 0)) | 0; // 840a5d: lea eax, [ecx + edx*4]
        pc = 0x840a64; continue; // 840a60: jmp 0x840a64
      case 0x840a62:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 840a62: xor eax, eax
        pc = 0x840a64; continue;
      case 0x840a64:
        R.ecx = (R.m.u32(((0xb7431c) | 0) >>> 0)) | 0; // 840a64: mov ecx, dword ptr [0xb7431c]
        R.push((R.eax >>> 0)); // 840a6a: push eax
        R.call(0x7875e0, { n: 1, thisEcx: false, calleeClean: true }); // 840a6b: call 0x7875e0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 840a70: test eax, eax
        if (R.zf) { pc = 0x840a81; continue; } // 840a72: je 0x840a81
        pc = 0x840a74; continue;
      case 0x840a74:
        R.edx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 840a74: mov edx, dword ptr [ebp + 0xc]
        R.push((R.edx >>> 0)); // 840a77: push edx
        R.push((R.esi >>> 0)); // 840a78: push esi
        R.call(0x587220, { n: 2, thisEcx: false, calleeClean: false }); // 840a79: call 0x587220
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 840a7e: add esp, 8
        pc = 0x840a81; continue;
      case 0x840a81:
        R.eax = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 840a81: mov eax, dword ptr [esp + 0x40]
        R.ecx = (R.m.u32(((R.esp + 0x8c) | 0) >>> 0)) | 0; // 840a85: mov ecx, dword ptr [esp + 0x8c]
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 840a8c: inc eax
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 840a8d: cmp eax, ecx
        R.m.w32(((R.esp + 0x40) | 0) >>> 0, (R.eax >>> 0)); // 840a8f: mov dword ptr [esp + 0x40], eax
        if (R.cL) { pc = 0x83fa1a; continue; } // 840a93: jl 0x83fa1a
        pc = 0x840a99; continue;
      case 0x840a99:
        R.esi = (R.m.u32(((R.esp + 0x78) | 0) >>> 0)) | 0; // 840a99: mov esi, dword ptr [esp + 0x78]
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.esp + 0xf) | 0) >>> 0)) & 0xff) << 0)) | 0; // 840a9d: mov bl, byte ptr [esp + 0xf]
        pc = 0x840aa1; continue;
      case 0x840aa1:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0xe) | 0) >>> 0)) & 0xff) << 0)) | 0; // 840aa1: mov al, byte ptr [esp + 0xe]
        R.ebx = ((R.ebx & 0xffffff00) | (((R.incdec(((R.ebx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 840aa5: inc bl
        R.sub(((R.ebx >>> 0) & 0xff), ((R.eax >>> 0) & 0xff), 8); // 840aa7: cmp bl, al
        R.m.w8(((R.esp + 0xf) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 840aa9: mov byte ptr [esp + 0xf], bl
        if (R.cLE) { pc = 0x83f9da; continue; } // 840aad: jle 0x83f9da
        pc = 0x840ab3; continue;
      case 0x840ab3:
        R.ebx = (R.m.u32(((R.esp + 0x88) | 0) >>> 0)) | 0; // 840ab3: mov ebx, dword ptr [esp + 0x88]
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 840aba: test ebx, ebx
        if (R.zf) { pc = 0x840c67; continue; } // 840abc: je 0x840c67
        pc = 0x840ac2; continue;
      case 0x840ac2:
        R.edi = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 840ac2: mov edi, dword ptr [ebp + 0xc]
        R.esi = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 840ac5: mov esi, dword ptr [ebp + 8]
        R.eax = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 840ac8: mov eax, dword ptr [ebx]
        R.ecx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 840aca: mov ecx, dword ptr [esp + 0x10]
        R.push((R.edi >>> 0)); // 840ace: push edi
        R.push((R.ebx >>> 0)); // 840acf: push ebx
        R.m.w32(((R.esi + 0xf) | 0) >>> 0, (R.eax >>> 0)); // 840ad0: mov dword ptr [esi + 0xf], eax
        R.call(0x8423f0, { n: 2, thisEcx: true, calleeClean: true }); // 840ad3: call 0x8423f0
        R.logic(R.m.u8(((R.esi + 0x24) | 0) >>> 0) & 0x1, 8); // 840ad8: test byte ptr [esi + 0x24], 1
        if (!R.zf) { pc = 0x840d69; continue; } // 840adc: jne 0x840d69
        pc = 0x840ae2; continue;
      case 0x840ae2:
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 840ae2: mov eax, dword ptr [esp + 0x14]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 840ae6: test eax, eax
        if (R.zf) { pc = 0x840d69; continue; } // 840ae8: je 0x840d69
        pc = 0x840aee; continue;
      case 0x840aee:
        R.ecx = (R.m.u32(((R.ebx + 0x61) | 0) >>> 0)) | 0; // 840aee: mov ecx, dword ptr [ebx + 0x61]
        R.eax = (0x1b4e81b5) | 0; // 840af1: mov eax, 0x1b4e81b5
        R.ecx = (((R.m.u16(((R.ecx + 0xb) | 0) >>> 0)) << 16 >> 16)) | 0; // 840af6: movsx ecx, word ptr [ecx + 0xb]
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 840afa: imul ecx
        R.edx = (R.sar((R.edx >>> 0), 0x5, 32)) | 0; // 840afc: sar edx, 5
        R.eax = ((R.edx >>> 0)) | 0; // 840aff: mov eax, edx
        R.ecx = (0x25) | 0; // 840b01: mov ecx, 0x25
        R.eax = (R.shr((R.eax >>> 0), 0x1f, 32)) | 0; // 840b06: shr eax, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 840b09: add edx, eax
        R.ecx = (R.sub((R.ecx >>> 0), (R.edx >>> 0), 32)) | 0; // 840b0b: sub ecx, edx
        R.push((R.ecx >>> 0)); // 840b0d: push ecx
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 840b0e: call 0x90cfc0
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 840b13: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 840b16: test eax, eax
        if (!R.zf) { pc = 0x840d69; continue; } // 840b18: jne 0x840d69
        pc = 0x840b1e; continue;
      case 0x840b1e:
        R.push(0x7d0); // 840b1e: push 0x7d0
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 840b23: call 0x90cfc0
        R.edx = (R.m.u32(((R.ebx + 0x61) | 0) >>> 0)) | 0; // 840b28: mov edx, dword ptr [ebx + 0x61]
        R.eax = (R.add((R.eax >>> 0), 0x1388, 32)) | 0; // 840b2b: add eax, 0x1388
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 840b30: add esp, 4
        R.ecx = (((R.m.u16(((R.edx + 0xb) | 0) >>> 0)) << 16 >> 16)) | 0; // 840b33: movsx ecx, word ptr [edx + 0xb]
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 840b37: cmp ecx, eax
        if (!R.cLE) { pc = 0x840b5f; continue; } // 840b39: jg 0x840b5f
        pc = 0x840b3b; continue;
      case 0x840b3b:
        R.eax = (R.m.u32(((R.ebx + 0x39) | 0) >>> 0)) | 0; // 840b3b: mov eax, dword ptr [ebx + 0x39]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 840b3e: test eax, eax
        if (R.zf) { pc = 0x840d69; continue; } // 840b40: je 0x840d69
        pc = 0x840b46; continue;
      case 0x840b46:
        R.push(0x0); // 840b46: push 0
        R.push(0x0); // 840b48: push 0
        R.push(0x1); // 840b4a: push 1
        R.push(0x0); // 840b4c: push 0
        R.push((R.eax >>> 0)); // 840b4e: push eax
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 840b4f: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 840b54: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 840b57: test eax, eax
        if (R.zf) { pc = 0x840d69; continue; } // 840b59: je 0x840d69
        pc = 0x840b5f; continue;
      case 0x840b5f:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 840b5f: mov ecx, dword ptr [0xae1050]
        R.push((R.ebx >>> 0)); // 840b65: push ebx
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 840b66: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 840b6b: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 840b6d: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x840b97; continue; } // 840b72: je 0x840b97
        pc = 0x840b74; continue;
      case 0x840b74:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x35) | 0) >>> 0)) & 0xff) << 0)) | 0; // 840b74: mov dl, byte ptr [eax + 0x35]
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) & 0x3f, 8)) & 0xff) << 0)) | 0; // 840b77: and dl, 0x3f
        R.sub(((R.edx >>> 0) & 0xff), 0x5, 8); // 840b7a: cmp dl, 5
        if (R.zf) { pc = 0x840b97; continue; } // 840b7d: je 0x840b97
        pc = 0x840b7f; continue;
      case 0x840b7f:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 840b7f: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 840b82: mov edx, dword ptr [0xae23b4]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 840b88: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 840b8b: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 840b8e: add ecx, eax
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 840b90: add edx, eax
        R.esi = (((R.edx + R.ecx * 4) | 0)) | 0; // 840b92: lea esi, [edx + ecx*4]
        pc = 0x840b99; continue; // 840b95: jmp 0x840b99
      case 0x840b97:
        R.esi = (R.logic((R.esi >>> 0) ^ (R.esi >>> 0), 32)) | 0; // 840b97: xor esi, esi
        pc = 0x840b99; continue;
      case 0x840b99:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 840b99: mov ecx, dword ptr [0xae1050]
        R.push((R.ebx >>> 0)); // 840b9f: push ebx
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 840ba0: call 0x4cf5a0
        R.edx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 840ba5: mov edx, dword ptr [ebp + 8]
        R.ecx = (((R.esp + 0x7c) | 0)) | 0; // 840ba8: lea ecx, [esp + 0x7c]
        R.push((R.ecx >>> 0)); // 840bac: push ecx
        R.ecx = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 840bad: mov ecx, dword ptr [esp + 0x14]
        R.push((R.edi >>> 0)); // 840bb1: push edi
        R.push((R.eax >>> 0)); // 840bb2: push eax
        R.push((R.edx >>> 0)); // 840bb3: push edx
        R.call(0x84b6f0, { n: 4, thisEcx: false, calleeClean: true }); // 840bb4: call 0x84b6f0
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 840bb9: test esi, esi
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.eax >>> 0)); // 840bbb: mov dword ptr [esp + 0x44], eax
        if (R.zf) { pc = 0x840c04; continue; } // 840bbf: je 0x840c04
        pc = 0x840bc1; continue;
      case 0x840bc1:
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 840bc1: test eax, eax
        if (!R.zf) { pc = 0x840c04; continue; } // 840bc3: jne 0x840c04
        pc = 0x840bc5; continue;
      case 0x840bc5:
        R.push(0x0); // 840bc5: push 0
        R.push(0x0); // 840bc7: push 0
        R.push(0x1); // 840bc9: push 1
        R.push(0x0); // 840bcb: push 0
        R.push((R.esi >>> 0)); // 840bcd: push esi
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 840bce: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 840bd3: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 840bd6: test eax, eax
        if (R.zf) { pc = 0x840bec; continue; } // 840bd8: je 0x840bec
        pc = 0x840bda; continue;
      case 0x840bda:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 840bda: mov ecx, dword ptr [0xae1050]
        R.push((R.ebx >>> 0)); // 840be0: push ebx
        R.push((R.edi >>> 0)); // 840be1: push edi
        R.push((R.esi >>> 0)); // 840be2: push esi
        R.call(0x4d42d0, { n: 3, thisEcx: true, calleeClean: true }); // 840be3: call 0x4d42d0
        R.esi = ((R.eax >>> 0)) | 0; // 840be8: mov esi, eax
        pc = 0x840c06; continue; // 840bea: jmp 0x840c06
      case 0x840bec:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 840bec: mov ecx, dword ptr [0xae1050]
        R.push(0x1); // 840bf2: push 1
        R.push(0x1); // 840bf4: push 1
        R.push(0x0); // 840bf6: push 0
        R.push((R.ebx >>> 0)); // 840bf8: push ebx
        R.push((R.edi >>> 0)); // 840bf9: push edi
        R.push((R.esi >>> 0)); // 840bfa: push esi
        R.call(0x4d1600, { n: 6, thisEcx: true, calleeClean: true }); // 840bfb: call 0x4d1600
        R.esi = ((R.eax >>> 0)) | 0; // 840c00: mov esi, eax
        pc = 0x840c06; continue; // 840c02: jmp 0x840c06
      case 0x840c04:
        R.esi = (R.logic((R.esi >>> 0) ^ (R.esi >>> 0), 32)) | 0; // 840c04: xor esi, esi
        pc = 0x840c06; continue;
      case 0x840c06:
        R.eax = (R.m.u32(((R.esp + 0x7c) | 0) >>> 0)) | 0; // 840c06: mov eax, dword ptr [esp + 0x7c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 840c0a: test eax, eax
        if (R.zf) { pc = 0x840c1c; continue; } // 840c0c: je 0x840c1c
        pc = 0x840c0e; continue;
      case 0x840c0e:
        R.ecx = (R.m.u32(((R.esp + 0x44) | 0) >>> 0)) | 0; // 840c0e: mov ecx, dword ptr [esp + 0x44]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 840c12: test ecx, ecx
        if (R.zf) { pc = 0x840c1c; continue; } // 840c14: je 0x840c1c
        pc = 0x840c16; continue;
      case 0x840c16:
        R.sub((R.eax >>> 0), (R.esi >>> 0), 32); // 840c16: cmp eax, esi
        if (!R.cL) { pc = 0x840c1c; continue; } // 840c18: jge 0x840c1c
        pc = 0x840c1a; continue;
      case 0x840c1a:
        R.esi = ((R.eax >>> 0)) | 0; // 840c1a: mov esi, eax
        pc = 0x840c1c; continue;
      case 0x840c1c:
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 840c1c: mov eax, dword ptr [ebp + 8]
        R.push(0x0); // 840c1f: push 0
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 840c21: mov al, byte ptr [eax + 0x24]
        R.ecx = ((R.ecx & 0xffffff00) | (((((R.eax >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 840c24: mov cl, al
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x1, 8)) & 0xff) << 0)) | 0; // 840c26: and al, 1
        R.ecx = ((R.ecx & 0xffffff00) | (((R.shr(((R.ecx >>> 0) & 0xff), 0x1, 8)) & 0xff) << 0)) | 0; // 840c28: shr cl, 1
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0xf, 8)) & 0xff) << 0)) | 0; // 840c2a: and cl, 0xf
        R.push((R.ecx >>> 0)); // 840c2d: push ecx
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 840c2e: mov ecx, dword ptr [esp + 0x18]
        R.push((R.eax >>> 0)); // 840c32: push eax
        R.push(0x1); // 840c33: push 1
        R.push((R.edi >>> 0)); // 840c35: push edi
        R.push((R.ebx >>> 0)); // 840c36: push ebx
        R.call(0x846920, { n: 6, thisEcx: true, calleeClean: true, float: true }); // 840c37: call 0x846920
        R.ecx = (R.m.u32(((0xb6b7c8) | 0) >>> 0)) | 0; // 840c3c: mov ecx, dword ptr [0xb6b7c8]
        R.esp = (R.sub((R.esp >>> 0), 0x8, 32)) | 0; // 840c42: sub esp, 8
        R.m.wf64(((R.esp) | 0) >>> 0, R.st[0]); R.fpop(); // 840c45: fstp qword ptr [esp]
        R.push((R.esi >>> 0)); // 840c48: push esi
        R.push((R.edi >>> 0)); // 840c49: push edi
        R.push((R.ebx >>> 0)); // 840c4a: push ebx
        R.call(0x754740, { n: 5, thisEcx: true, calleeClean: true }); // 840c4b: call 0x754740
        R.ecx = (R.m.u32(((R.esp + 0x108) | 0) >>> 0)) | 0; // 840c50: mov ecx, dword ptr [esp + 0x108]
        /* fs */ // 840c57: mov dword ptr fs:[0], ecx
        R.edi = (R.pop()) | 0; // 840c5e: pop edi
        R.esi = (R.pop()) | 0; // 840c5f: pop esi
        R.ebx = (R.pop()) | 0; // 840c60: pop ebx
        R.esp = ((R.ebp >>> 0)) | 0; // 840c61: mov esp, ebp
        R.ebp = (R.pop()) | 0; // 840c63: pop ebp
        return R.ret(3); // 840c64: ret 0xc
      case 0x840c67:
        R.eax = (R.m.u32(((R.esp + 0x80) | 0) >>> 0)) | 0; // 840c67: mov eax, dword ptr [esp + 0x80]
        R.esi = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 840c6e: mov esi, dword ptr [ebp + 8]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 840c71: test eax, eax
        if (R.zf) { pc = 0x840d62; continue; } // 840c73: je 0x840d62
        pc = 0x840c79; continue;
      case 0x840c79:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 840c79: mov al, byte ptr [esi + 0x24]
        R.logic(((R.eax >>> 0) & 0xff) & 0x1, 8); // 840c7c: test al, 1
        if (!R.zf) { pc = 0x840d62; continue; } // 840c7e: jne 0x840d62
        pc = 0x840c84; continue;
      case 0x840c84:
        R.sub(R.m.u32(((R.esi + 0xf) | 0) >>> 0), 0xffffffff, 32); // 840c84: cmp dword ptr [esi + 0xf], -1
        if (!R.zf) { pc = 0x840d62; continue; } // 840c88: jne 0x840d62
        pc = 0x840c8e; continue;
      case 0x840c8e:
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x1e, 8)) & 0xff) << 0)) | 0; // 840c8e: and al, 0x1e
        R.sub(((R.eax >>> 0) & 0xff), 0x4, 8); // 840c90: cmp al, 4
        if (R.zf) { pc = 0x840c9c; continue; } // 840c92: je 0x840c9c
        pc = 0x840c94; continue;
      case 0x840c94:
        R.sub(((R.eax >>> 0) & 0xff), 0x6, 8); // 840c94: cmp al, 6
        if (!R.zf) { pc = 0x840d62; continue; } // 840c96: jne 0x840d62
        pc = 0x840c9c; continue;
      case 0x840c9c:
        R.ebx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 840c9c: mov ebx, dword ptr [ebp + 0xc]
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 840c9f: mov cx, word ptr [ebx + 0x80]
        R.edx = (((((R.ecx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 840ca6: movsx edx, cx
        R.m.w32(((R.esp + 0x78) | 0) >>> 0, (R.edx >>> 0)); // 840ca9: mov dword ptr [esp + 0x78], edx
        R.fpush(R.m.s32(((R.esp + 0x78) | 0) >>> 0)); // 840cad: fild dword ptr [esp + 0x78]
        R.fpush(R.m.s32(((R.esi + 0xb) | 0) >>> 0)); // 840cb1: fild dword ptr [esi + 0xb]
        R.fpush(R.st[1]); // 840cb4: fld st(1)
        R.st[0] = R.st[0] * 4e-09; // 840cb6: fmul qword ptr [0x96f898]
        R.st[0] = R.st[0] * R.st[2]; // 840cbc: fmul st(2)
        R.st[0] = R.st[0] + 0.6; // 840cbe: fadd qword ptr [0x968e48]
        R.st[0] = R.st[0] * R.m.s32(((R.esi + 0x3) | 0) >>> 0); // 840cc4: fimul dword ptr [esi + 3]
        R.fcom(R.st[0], R.st[1]); R.fpop(); R.fpop(); // 840cc7: fcompp 
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 840cc9: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 840ccb: test ah, 1
        R.fpop(); // 840cce: fstp st(0)
        if (!R.zf) { pc = 0x840d0b; continue; } // 840cd0: jne 0x840d0b
        pc = 0x840cd2; continue;
      case 0x840cd2:
        R.sub(R.m.u32(((R.esi + 0x7) | 0) >>> 0), 0xc350, 32); // 840cd2: cmp dword ptr [esi + 7], 0xc350
        if (R.cL) { pc = 0x840d0b; continue; } // 840cd9: jl 0x840d0b
        pc = 0x840cdb; continue;
      case 0x840cdb:
        R.eax = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 840cdb: mov eax, dword ptr [ebx + 0x53]
        R.ecx = (R.m.u32(((0x9cf360) | 0) >>> 0)) | 0; // 840cde: mov ecx, dword ptr [0x9cf360]
        R.sub(R.m.u32(((R.eax) | 0) >>> 0), (R.ecx >>> 0), 32); // 840ce4: cmp dword ptr [eax], ecx
        if (!R.zf) { pc = 0x840d62; continue; } // 840ce6: jne 0x840d62
        pc = 0x840ce8; continue;
      case 0x840ce8:
        R.push(0x2); // 840ce8: push 2
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 840cea: call 0x90cfc0
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 840cef: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 840cf2: test eax, eax
        if (R.zf) { pc = 0x840d62; continue; } // 840cf4: je 0x840d62
        pc = 0x840cf6; continue;
      case 0x840cf6:
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 840cf6: mov cx, word ptr [ebx + 0x80]
        R.sub(((R.ecx >>> 0) & 0xffff), 0xbb8, 16); // 840cfd: cmp cx, 0xbb8
        if (R.cLE) { pc = 0x840d62; continue; } // 840d02: jle 0x840d62
        pc = 0x840d04; continue;
      case 0x840d04:
        R.sub(((R.ecx >>> 0) & 0xffff), 0x1770, 16); // 840d04: cmp cx, 0x1770
        if (!R.cL) { pc = 0x840d62; continue; } // 840d09: jge 0x840d62
        pc = 0x840d0b; continue;
      case 0x840d0b:
        R.edx = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 840d0b: mov edx, dword ptr [ebx + 0x53]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edx + 0x11c) | 0) >>> 0)) & 0xff) << 0)) | 0; // 840d0e: mov al, byte ptr [edx + 0x11c]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 840d14: test al, al
        if (!R.zf) { pc = 0x840d34; continue; } // 840d16: jne 0x840d34
        pc = 0x840d18; continue;
      case 0x840d18:
        R.eax = (((((R.ecx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 840d18: movsx eax, cx
        R.push((R.eax >>> 0)); // 840d1b: push eax
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 840d1c: call 0x90cfc0
        R.push(0x4e20); // 840d21: push 0x4e20
        R.edi = ((R.eax >>> 0)) | 0; // 840d26: mov edi, eax
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 840d28: call 0x90cfc0
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 840d2d: add esp, 8
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 840d30: cmp edi, eax
        if (R.cLE) { pc = 0x840d62; continue; } // 840d32: jle 0x840d62
        pc = 0x840d34; continue;
      case 0x840d34:
        R.ecx = (R.m.u32(((R.ebp + 0x10) | 0) >>> 0)) | 0; // 840d34: mov ecx, dword ptr [ebp + 0x10]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 840d37: mov al, byte ptr [esi + 0x24]
        R.push((R.ecx >>> 0)); // 840d3a: push ecx
        R.ecx = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 840d3b: mov ecx, dword ptr [esp + 0x14]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) | 0x1, 8)) & 0xff) << 0)) | 0; // 840d3f: or al, 1
        R.push((R.ebx >>> 0)); // 840d41: push ebx
        R.push((R.esi >>> 0)); // 840d42: push esi
        R.m.w8(((R.esi + 0x24) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 840d43: mov byte ptr [esi + 0x24], al
        R.call(0x83f3a0, { n: 3, thisEcx: true, calleeClean: true }); // 840d46: call 0x83f3a0
        R.ecx = (R.m.u32(((R.esp + 0x108) | 0) >>> 0)) | 0; // 840d4b: mov ecx, dword ptr [esp + 0x108]
        /* fs */ // 840d52: mov dword ptr fs:[0], ecx
        R.edi = (R.pop()) | 0; // 840d59: pop edi
        R.esi = (R.pop()) | 0; // 840d5a: pop esi
        R.ebx = (R.pop()) | 0; // 840d5b: pop ebx
        R.esp = ((R.ebp >>> 0)) | 0; // 840d5c: mov esp, ebp
        R.ebp = (R.pop()) | 0; // 840d5e: pop ebp
        return R.ret(3); // 840d5f: ret 0xc
      case 0x840d62:
        R.m.w32(((R.esi + 0xf) | 0) >>> 0, 0xffffffff); // 840d62: mov dword ptr [esi + 0xf], 0xffffffff
        pc = 0x840d69; continue;
      case 0x840d69:
        R.ecx = (R.m.u32(((R.esp + 0x108) | 0) >>> 0)) | 0; // 840d69: mov ecx, dword ptr [esp + 0x108]
        R.edi = (R.pop()) | 0; // 840d70: pop edi
        R.esi = (R.pop()) | 0; // 840d71: pop esi
        /* fs */ // 840d72: mov dword ptr fs:[0], ecx
        R.ebx = (R.pop()) | 0; // 840d79: pop ebx
        R.esp = ((R.ebp >>> 0)) | 0; // 840d7a: mov esp, ebp
        R.ebp = (R.pop()) | 0; // 840d7c: pop ebp
        return R.ret(3); // 840d7d: ret 0xc
      default: throw new Error(`f_83f3a0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
