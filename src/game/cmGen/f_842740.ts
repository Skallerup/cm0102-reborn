// 0x842740 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4cf5a0=1c, 549f70=4tc, 54c770=2tc, 54cab0=2tc, 54cf70=0t, 54cfb0=0t, 669360=1, 843e10=4tc, 846920=6tcf, 849ce0=4tc, 8bed60=6tc, 8d0530=5tc, 8d0590=7tc
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_842740(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x842740;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x842740:
        R.eax = (0) | 0; // 842740: mov eax, dword ptr fs:[0]
        R.push(0xffffffff); // 842746: push -1
        R.push(0x9624b8); // 842748: push 0x9624b8
        R.push((R.eax >>> 0)); // 84274d: push eax
        /* fs */ // 84274e: mov dword ptr fs:[0], esp
        R.esp = (R.sub((R.esp >>> 0), 0x24, 32)) | 0; // 842755: sub esp, 0x24
        R.push((R.ebx >>> 0)); // 842758: push ebx
        R.push((R.ebp >>> 0)); // 842759: push ebp
        R.push((R.esi >>> 0)); // 84275a: push esi
        R.esi = (R.m.u32(((R.esp + 0x44) | 0) >>> 0)) | 0; // 84275b: mov esi, dword ptr [esp + 0x44]
        R.push((R.edi >>> 0)); // 84275f: push edi
        R.edi = (R.m.u32(((R.esp + 0x44) | 0) >>> 0)) | 0; // 842760: mov edi, dword ptr [esp + 0x44]
        R.push(0x0); // 842764: push 0
        R.push(0x0); // 842766: push 0
        R.push((R.edi >>> 0)); // 842768: push edi
        R.ebp = ((R.ecx >>> 0)) | 0; // 842769: mov ebp, ecx
        R.push((R.esi >>> 0)); // 84276b: push esi
        R.call(0x849ce0, { n: 4, thisEcx: true, calleeClean: true }); // 84276c: call 0x849ce0
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 842771: mov ecx, dword ptr [0xae1050]
        R.push((R.edi >>> 0)); // 842777: push edi
        R.ebx = ((R.eax >>> 0)) | 0; // 842778: mov ebx, eax
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 84277a: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84277f: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 842781: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x8427a6; continue; } // 842786: je 0x8427a6
        pc = 0x842788; continue;
      case 0x842788:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 842788: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 84278b: mov edx, dword ptr [0xae23b4]
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 842791: add edx, eax
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 842793: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 842796: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 842799: add ecx, eax
        R.eax = (((R.edx + R.ecx * 4) | 0)) | 0; // 84279b: lea eax, [edx + ecx*4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84279e: test eax, eax
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.eax >>> 0)); // 8427a0: mov dword ptr [esp + 0x20], eax
        if (!R.zf) { pc = 0x8427cf; continue; } // 8427a4: jne 0x8427cf
        pc = 0x8427a6; continue;
      case 0x8427a6:
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 8427a6: test ebx, ebx
        if (R.zf) { pc = 0x8427b7; continue; } // 8427a8: je 0x8427b7
        pc = 0x8427aa; continue;
      case 0x8427aa:
        R.push(0x0); // 8427aa: push 0
        R.push(0x1); // 8427ac: push 1
        R.push((R.esi >>> 0)); // 8427ae: push esi
        R.push((R.edi >>> 0)); // 8427af: push edi
        R.ecx = ((R.ebp >>> 0)) | 0; // 8427b0: mov ecx, ebp
        R.call(0x843e10, { n: 4, thisEcx: true, calleeClean: true }); // 8427b2: call 0x843e10
        pc = 0x8427b7; continue;
      case 0x8427b7:
        R.eax = (R.logic((R.eax >>> 0) | 0xffffffff, 32)) | 0; // 8427b7: or eax, 0xffffffff
        pc = 0x8427ba; continue;
      case 0x8427ba:
        R.ecx = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 8427ba: mov ecx, dword ptr [esp + 0x34]
        R.edi = (R.pop()) | 0; // 8427be: pop edi
        R.esi = (R.pop()) | 0; // 8427bf: pop esi
        R.ebp = (R.pop()) | 0; // 8427c0: pop ebp
        R.ebx = (R.pop()) | 0; // 8427c1: pop ebx
        /* fs */ // 8427c2: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x30, 32)) | 0; // 8427c9: add esp, 0x30
        return R.ret(2); // 8427cc: ret 8
      case 0x8427cf:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.ebx + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8427cf: mov dl, byte ptr [ebx + 0x24]
        R.eax = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 8427d2: mov eax, dword ptr [0xde1f54]
        R.edx = ((R.edx & 0xffffff00) | (((R.shr(((R.edx >>> 0) & 0xff), 0x1, 8)) & 0xff) << 0)) | 0; // 8427d7: shr dl, 1
        R.ecx = (R.m.u32(((R.eax + 0x856) | 0) >>> 0)) | 0; // 8427d9: mov ecx, dword ptr [eax + 0x856]
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) & 0xf, 8)) & 0xff) << 0)) | 0; // 8427df: and dl, 0xf
        R.push(0x0); // 8427e2: push 0
        R.push((R.edx >>> 0)); // 8427e4: push edx
        R.push(0x1); // 8427e5: push 1
        R.push(0x0); // 8427e7: push 0
        R.push((R.esi >>> 0)); // 8427e9: push esi
        R.push((R.edi >>> 0)); // 8427ea: push edi
        R.call(0x846920, { n: 6, thisEcx: true, calleeClean: true, float: true }); // 8427eb: call 0x846920
        R.fcom(R.st[0], 3.5); R.fpop(); // 8427f0: fcomp qword ptr [0x968e38]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8427f6: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8427f8: test ah, 1
        if (!R.zf) { pc = 0x8427b7; continue; } // 8427fb: jne 0x8427b7
        pc = 0x8427fd; continue;
      case 0x8427fd:
        R.ecx = (0xae2c90) | 0; // 8427fd: mov ecx, 0xae2c90
        R.call(0x54cfb0, { n: 0, thisEcx: true, calleeClean: false }); // 842802: call 0x54cfb0
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 842807: mov ecx, dword ptr [0xae1050]
        R.ebx = ((R.ebx & 0xffffff00) | (((((R.eax >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 84280d: mov bl, al
        R.push((R.edi >>> 0)); // 84280f: push edi
        R.m.w8(((R.esp + 0x48) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 842810: mov byte ptr [esp + 0x48], bl
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 842814: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 842819: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 84281b: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x84283a; continue; } // 842820: je 0x84283a
        pc = 0x842822; continue;
      case 0x842822:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 842822: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 842825: mov edx, dword ptr [0xae23b4]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 84282b: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 84282e: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 842831: add ecx, eax
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 842833: add edx, eax
        R.eax = (((R.edx + R.ecx * 4) | 0)) | 0; // 842835: lea eax, [edx + ecx*4]
        pc = 0x84283c; continue; // 842838: jmp 0x84283c
      case 0x84283a:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 84283a: xor eax, eax
        pc = 0x84283c; continue;
      case 0x84283c:
        R.ecx = (((R.esp + 0x14) | 0)) | 0; // 84283c: lea ecx, [esp + 0x14]
        R.edx = (((R.esp + 0x48) | 0)) | 0; // 842840: lea edx, [esp + 0x48]
        R.push((R.ecx >>> 0)); // 842844: push ecx
        R.push((R.edx >>> 0)); // 842845: push edx
        R.ecx = (((R.esp + 0x1e) | 0)) | 0; // 842846: lea ecx, [esp + 0x1e]
        R.edx = (((R.esp + 0x1b) | 0)) | 0; // 84284a: lea edx, [esp + 0x1b]
        R.push((R.ecx >>> 0)); // 84284e: push ecx
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 84284f: mov ecx, dword ptr [0xde1f54]
        R.push((R.edx >>> 0)); // 842855: push edx
        R.push((R.edi >>> 0)); // 842856: push edi
        R.push((R.eax >>> 0)); // 842857: push eax
        R.push((R.esi >>> 0)); // 842858: push esi
        R.call(0x8d0590, { n: 7, thisEcx: true, calleeClean: true }); // 842859: call 0x8d0590
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.esp + 0x14) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 84285e: mov ax, word ptr [esp + 0x14]
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 842863: mov dx, word ptr [0xae2c92]
        R.eax = ((R.eax & 0xffff0000) | (((R.sub(((R.eax >>> 0) & 0xffff), ((R.edx >>> 0) & 0xffff), 16)) & 0xffff) << 0)) | 0; // 84286a: sub ax, dx
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, 0x1); // 84286d: mov dword ptr [esp + 0x18], 1
        R.ecx = ((R.ecx & 0xffff0000) | (((((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) & 0xffff) << 0)) | 0; // 842875: movsx cx, bl
        R.ebx = (((R.eax + R.eax * 2) | 0)) | 0; // 842879: lea ebx, [eax + eax*2]
        R.eax = ((R.eax & 0xffff0000) | (((((R.m.u8(((R.esp + 0x48) | 0) >>> 0)) << 24 >> 24)) & 0xffff) << 0)) | 0; // 84287c: movsx ax, byte ptr [esp + 0x48]
        R.ebx = (R.shl((R.ebx >>> 0), 0x2, 32)) | 0; // 842882: shl ebx, 2
        R.ebx = (R.sub((R.ebx >>> 0), (R.ecx >>> 0), 32)) | 0; // 842885: sub ebx, ecx
        R.ebx = (R.add((R.ebx >>> 0), (R.eax >>> 0), 32)) | 0; // 842887: add ebx, eax
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.esp + 0x16) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 842889: mov ax, word ptr [esp + 0x16]
        R.eax = ((R.eax & 0xffff0000) | (((R.sub(((R.eax >>> 0) & 0xffff), ((R.edx >>> 0) & 0xffff), 16)) & 0xffff) << 0)) | 0; // 84288e: sub ax, dx
        R.eax = (((R.eax + R.eax * 2) | 0)) | 0; // 842891: lea eax, [eax + eax*2]
        R.eax = (R.shl((R.eax >>> 0), 0x2, 32)) | 0; // 842894: shl eax, 2
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 842897: sub eax, ecx
        R.ecx = ((R.ecx & 0xffff0000) | (((((R.m.u8(((R.esp + 0x13) | 0) >>> 0)) << 24 >> 24)) & 0xffff) << 0)) | 0; // 842899: movsx cx, byte ptr [esp + 0x13]
        R.eax = (R.add((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 84289f: add eax, ecx
        R.sub(((R.eax >>> 0) & 0xffff), 0x1, 16); // 8428a1: cmp ax, 1
        if (R.cL) { pc = 0x8428ab; continue; } // 8428a5: jl 0x8428ab
        pc = 0x8428a7; continue;
      case 0x8428a7:
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.eax >>> 0)); // 8428a7: mov dword ptr [esp + 0x18], eax
        pc = 0x8428ab; continue;
      case 0x8428ab:
        R.sub(R.m.u16(((R.esp + 0x18) | 0) >>> 0), ((R.ebx >>> 0) & 0xffff), 16); // 8428ab: cmp word ptr [esp + 0x18], bx
        if (!R.cLE) { pc = 0x8427b7; continue; } // 8428b0: jg 0x8427b7
        pc = 0x8428b6; continue;
      case 0x8428b6:
        R.eax = (R.m.u32(((R.esi + 0x53) | 0) >>> 0)) | 0; // 8428b6: mov eax, dword ptr [esi + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8428b9: test eax, eax
        if (R.zf) { pc = 0x8428dc; continue; } // 8428bb: je 0x8428dc
        pc = 0x8428bd; continue;
      case 0x8428bd:
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8428bd: mov edx, dword ptr [eax]
        R.eax = (R.m.u32(((0x9cf408) | 0) >>> 0)) | 0; // 8428bf: mov eax, dword ptr [0x9cf408]
        R.sub((R.edx >>> 0), (R.eax >>> 0), 32); // 8428c4: cmp edx, eax
        if (!R.zf) { pc = 0x8428dc; continue; } // 8428c6: jne 0x8428dc
        pc = 0x8428c8; continue;
      case 0x8428c8:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x44) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8428c8: mov al, byte ptr [esp + 0x44]
        R.sub(((R.eax >>> 0) & 0xff), 0xa, 8); // 8428cc: cmp al, 0xa
        if (!R.cL) { pc = 0x8427b7; continue; } // 8428ce: jge 0x8427b7
        pc = 0x8428d4; continue;
      case 0x8428d4:
        R.sub(((R.eax >>> 0) & 0xff), 0x2, 8); // 8428d4: cmp al, 2
        if (R.cLE) { pc = 0x8427b7; continue; } // 8428d6: jle 0x8427b7
        pc = 0x8428dc; continue;
      case 0x8428dc:
        R.push(0x0); // 8428dc: push 0
        R.push(0x1); // 8428de: push 1
        R.push(0x0); // 8428e0: push 0
        R.push(0x0); // 8428e2: push 0
        R.push((R.esi >>> 0)); // 8428e4: push esi
        R.push((R.edi >>> 0)); // 8428e5: push edi
        R.ecx = ((R.ebp >>> 0)) | 0; // 8428e6: mov ecx, ebp
        R.call(0x846920, { n: 6, thisEcx: true, calleeClean: true, float: true }); // 8428e8: call 0x846920
        R.fcom(R.st[0], 2.75); R.fpop(); // 8428ed: fcomp qword ptr [0x9690a8]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8428f3: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8428f5: test ah, 1
        if (!R.zf) { pc = 0x84291d; continue; } // 8428f8: jne 0x84291d
        pc = 0x8428fa; continue;
      case 0x8428fa:
        R.eax = (R.m.u32(((R.esi + 0x53) | 0) >>> 0)) | 0; // 8428fa: mov eax, dword ptr [esi + 0x53]
        R.ecx = (R.m.u32(((0x9cf488) | 0) >>> 0)) | 0; // 8428fd: mov ecx, dword ptr [0x9cf488]
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 842903: mov eax, dword ptr [eax]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 842905: cmp eax, ecx
        if (R.zf) { pc = 0x84291d; continue; } // 842907: je 0x84291d
        pc = 0x842909; continue;
      case 0x842909:
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf434) | 0) >>> 0), 32); // 842909: cmp eax, dword ptr [0x9cf434]
        if (R.zf) { pc = 0x84291d; continue; } // 84290f: je 0x84291d
        pc = 0x842911; continue;
      case 0x842911:
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf360) | 0) >>> 0), 32); // 842911: cmp eax, dword ptr [0x9cf360]
        if (R.zf) { pc = 0x84291d; continue; } // 842917: je 0x84291d
        pc = 0x842919; continue;
      case 0x842919:
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.esp + 0x18) | 0) >>> 0)) & 0xff) << 0)) | 0; // 842919: mov bl, byte ptr [esp + 0x18]
        pc = 0x84291d; continue;
      case 0x84291d:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x44) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84291d: mov al, byte ptr [esp + 0x44]
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 842921: mov cx, word ptr [0xae2c92]
        R.ebx = ((R.ebx & 0xffffff00) | (((R.add(((R.ebx >>> 0) & 0xff), ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 842928: add bl, al
        R.m.w16(((R.esp + 0x44) | 0) >>> 0, ((R.ecx >>> 0) & 0xffff)); // 84292a: mov word ptr [esp + 0x44], cx
        R.sub(((R.ebx >>> 0) & 0xff), 0xb, 8); // 84292f: cmp bl, 0xb
        R.m.w8(((R.esp + 0x18) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 842932: mov byte ptr [esp + 0x18], bl
        if (R.cLE) { pc = 0x84295b; continue; } // 842936: jle 0x84295b
        pc = 0x842938; continue;
      case 0x842938:
        R.edx = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 842938: movsx edx, bl
        R.eax = (0xaaaaaaab) | 0; // 84293b: mov eax, 0xaaaaaaab
        R.ecx = ((R.ecx & 0xffffff00) | (((0xf4) & 0xff) << 0)) | 0; // 842940: mov cl, 0xf4
        { const p = BigInt(R.eax >>> 0) * BigInt((R.edx >>> 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = (p >> 32n) !== 0n; } // 842942: mul edx
        R.edx = (R.shr((R.edx >>> 0), 0x3, 32)) | 0; // 842944: shr edx, 3
        R.eax = ((R.eax & 0xffffff00) | (((((R.edx >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 842947: mov al, dl
        { const p = ((R.eax << 24) >> 24) * ((((R.ecx >>> 0) & 0xff)) << 24 >> 24); R.eax = ((R.eax & 0xffff0000) | (p & 0xffff)) | 0; R.cf = R.of = ((p << 24) >> 24) !== p; } // 842949: imul cl
        R.ebx = ((R.ebx & 0xffffff00) | (((R.add(((R.ebx >>> 0) & 0xff), ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 84294b: add bl, al
        R.eax = (R.m.u32(((R.esp + 0x44) | 0) >>> 0)) | 0; // 84294d: mov eax, dword ptr [esp + 0x44]
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 842951: add eax, edx
        R.m.w8(((R.esp + 0x18) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 842953: mov byte ptr [esp + 0x18], bl
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.eax >>> 0)); // 842957: mov dword ptr [esp + 0x44], eax
        pc = 0x84295b; continue;
      case 0x84295b:
        R.ecx = (0xae2c90) | 0; // 84295b: mov ecx, 0xae2c90
        R.call(0x54cf70, { n: 0, thisEcx: true, calleeClean: false }); // 842960: call 0x54cf70
        R.sub(((R.eax >>> 0) & 0xffff), 0x1c, 16); // 842965: cmp ax, 0x1c
        if (R.cLE) { pc = 0x842972; continue; } // 842969: jle 0x842972
        pc = 0x84296b; continue;
      case 0x84296b:
        R.eax = (0x1c) | 0; // 84296b: mov eax, 0x1c
        pc = 0x84297f; continue; // 842970: jmp 0x84297f
      case 0x842972:
        R.ecx = (0xae2c90) | 0; // 842972: mov ecx, 0xae2c90
        R.call(0x54cf70, { n: 0, thisEcx: true, calleeClean: false }); // 842977: call 0x54cf70
        R.eax = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 84297c: movsx eax, ax
        pc = 0x84297f; continue;
      case 0x84297f:
        R.edx = (R.m.u32(((R.esp + 0x44) | 0) >>> 0)) | 0; // 84297f: mov edx, dword ptr [esp + 0x44]
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 842983: mov ecx, dword ptr [esp + 0x18]
        R.push(0xffffffff); // 842987: push -1
        R.push((R.edx >>> 0)); // 842989: push edx
        R.push((R.ecx >>> 0)); // 84298a: push ecx
        R.push((R.eax >>> 0)); // 84298b: push eax
        R.ecx = (((R.esp + 0x34) | 0)) | 0; // 84298c: lea ecx, [esp + 0x34]
        R.call(0x549f70, { n: 4, thisEcx: true, calleeClean: true }); // 842990: call 0x549f70
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 842995: mov ecx, dword ptr [0xde1f54]
        R.edx = (((R.esp + 0x24) | 0)) | 0; // 84299b: lea edx, [esp + 0x24]
        R.push(0x1); // 84299f: push 1
        R.push((R.edx >>> 0)); // 8429a1: push edx
        R.push(0x0); // 8429a2: push 0
        R.push((R.edi >>> 0)); // 8429a4: push edi
        R.push((R.esi >>> 0)); // 8429a5: push esi
        R.m.w32(((R.esp + 0x50) | 0) >>> 0, 0x0); // 8429a6: mov dword ptr [esp + 0x50], 0
        R.call(0x8d0530, { n: 5, thisEcx: true, calleeClean: true }); // 8429ae: call 0x8d0530
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8429b3: test eax, eax
        if (R.zf) { pc = 0x8427b7; continue; } // 8429b5: je 0x8427b7
        pc = 0x8429bb; continue;
      case 0x8429bb:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8429bb: mov ecx, dword ptr [0xae1050]
        R.push((R.edi >>> 0)); // 8429c1: push edi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 8429c2: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8429c7: test eax, eax
        if (R.zf) { pc = 0x8427b7; continue; } // 8429c9: je 0x8427b7
        pc = 0x8429cf; continue;
      case 0x8429cf:
        R.ecx = (R.m.u32(((R.eax + 0x2d) | 0) >>> 0)) | 0; // 8429cf: mov ecx, dword ptr [eax + 0x2d]
        R.eax = (R.m.u32(((R.eax + 0x31) | 0) >>> 0)) | 0; // 8429d2: mov eax, dword ptr [eax + 0x31]
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.esp + 0x26) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8429d5: mov dx, word ptr [esp + 0x26]
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.ecx >>> 0)); // 8429da: mov dword ptr [esp + 0x18], ecx
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 8429de: mov dword ptr [esp + 0x1c], eax
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.esp + 0x1a) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8429e2: mov ax, word ptr [esp + 0x1a]
        R.sub(((R.eax >>> 0) & 0xffff), ((R.edx >>> 0) & 0xffff), 16); // 8429e7: cmp ax, dx
        if (R.cf) { pc = 0x8427b7; continue; } // 8429ea: jb 0x8427b7
        pc = 0x8429f0; continue;
      case 0x8429f0:
        if (!R.cBE) { pc = 0x842a04; continue; } // 8429f0: ja 0x842a04
        pc = 0x8429f2; continue;
      case 0x8429f2:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8429f2: xor eax, eax
        R.sub(((R.ecx >>> 0) & 0xffff), R.m.u16(((R.esp + 0x24) | 0) >>> 0), 16); // 8429f4: cmp cx, word ptr [esp + 0x24]
        R.eax = ((R.eax & 0xffffff00) | (((R.cL ? 1 : 0) & 0xff) << 0)) | 0; // 8429f9: setl al
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8429fc: test eax, eax
        if (!R.zf) { pc = 0x8427b7; continue; } // 8429fe: jne 0x8427b7
        pc = 0x842a04; continue;
      case 0x842a04:
        R.push((R.esi >>> 0)); // 842a04: push esi
        R.call(0x669360, { n: 1, thisEcx: false, calleeClean: false }); // 842a05: call 0x669360
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 842a0a: movsx eax, al
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 842a0d: add esp, 4
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 842a10: lea ecx, [eax + eax*8]
        R.eax = (((R.esp + 0x2c) | 0)) | 0; // 842a13: lea eax, [esp + 0x2c]
        R.push(0x4); // 842a17: push 4
        R.push((R.eax >>> 0)); // 842a19: push eax
        R.ebx = (R.m.u32(((R.ecx * 8 + 0xb63d8a) | 0) >>> 0)) | 0; // 842a1a: mov ebx, dword ptr [ecx*8 + 0xb63d8a]
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.ebx >>> 0)); // 842a21: mov dword ptr [esp + 0x20], ebx
        R.edx = (R.m.u32(((R.ecx * 8 + 0xb63d8e) | 0) >>> 0)) | 0; // 842a25: mov edx, dword ptr [ecx*8 + 0xb63d8e]
        R.ecx = (((R.esp + 0x2c) | 0)) | 0; // 842a2c: lea ecx, [esp + 0x2c]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.edx >>> 0)); // 842a30: mov dword ptr [esp + 0x24], edx
        R.call(0x54cab0, { n: 2, thisEcx: true, calleeClean: true }); // 842a34: call 0x54cab0
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.eax + 0x2) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 842a39: mov cx, word ptr [eax + 2]
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.esp + 0x1a) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 842a3d: mov dx, word ptr [esp + 0x1a]
        R.sub(((R.edx >>> 0) & 0xffff), ((R.ecx >>> 0) & 0xffff), 16); // 842a42: cmp dx, cx
        if (!R.cBE) { pc = 0x8427b7; continue; } // 842a45: ja 0x8427b7
        pc = 0x842a4b; continue;
      case 0x842a4b:
        if (R.cf) { pc = 0x842a5f; continue; } // 842a4b: jb 0x842a5f
        pc = 0x842a4d; continue;
      case 0x842a4d:
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 842a4d: xor ecx, ecx
        R.sub(((R.ebx >>> 0) & 0xffff), R.m.u16(((R.eax) | 0) >>> 0), 16); // 842a4f: cmp bx, word ptr [eax]
        R.ecx = ((R.ecx & 0xffffff00) | (((!R.cLE ? 1 : 0) & 0xff) << 0)) | 0; // 842a52: setg cl
        R.eax = ((R.ecx >>> 0)) | 0; // 842a55: mov eax, ecx
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 842a57: test eax, eax
        if (!R.zf) { pc = 0x8427b7; continue; } // 842a59: jne 0x8427b7
        pc = 0x842a5f; continue;
      case 0x842a5f:
        R.edx = (((R.esp + 0x2c) | 0)) | 0; // 842a5f: lea edx, [esp + 0x2c]
        R.push(0x3); // 842a63: push 3
        R.push((R.edx >>> 0)); // 842a65: push edx
        R.ecx = (0xae2c90) | 0; // 842a66: mov ecx, 0xae2c90
        R.call(0x54c770, { n: 2, thisEcx: true, calleeClean: true }); // 842a6b: call 0x54c770
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 842a70: mov ecx, dword ptr [eax]
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 842a72: mov eax, dword ptr [eax + 4]
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.esp + 0x26) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 842a75: mov dx, word ptr [esp + 0x26]
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.ecx >>> 0)); // 842a7a: mov dword ptr [esp + 0x18], ecx
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 842a7e: mov dword ptr [esp + 0x1c], eax
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.esp + 0x1a) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 842a82: mov ax, word ptr [esp + 0x1a]
        R.sub(((R.eax >>> 0) & 0xffff), ((R.edx >>> 0) & 0xffff), 16); // 842a87: cmp ax, dx
        if (!R.cBE) { pc = 0x8427b7; continue; } // 842a8a: ja 0x8427b7
        pc = 0x842a90; continue;
      case 0x842a90:
        if (R.cf) { pc = 0x842aa4; continue; } // 842a90: jb 0x842aa4
        pc = 0x842a92; continue;
      case 0x842a92:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 842a92: xor eax, eax
        R.sub(((R.ecx >>> 0) & 0xffff), R.m.u16(((R.esp + 0x24) | 0) >>> 0), 16); // 842a94: cmp cx, word ptr [esp + 0x24]
        R.eax = ((R.eax & 0xffffff00) | (((!R.cLE ? 1 : 0) & 0xff) << 0)) | 0; // 842a99: setg al
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 842a9c: test eax, eax
        if (!R.zf) { pc = 0x8427b7; continue; } // 842a9e: jne 0x8427b7
        pc = 0x842aa4; continue;
      case 0x842aa4:
        R.ecx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 842aa4: mov ecx, dword ptr [esp + 0x20]
        R.eax = (((R.m.u16(((R.esi + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 842aa8: movsx eax, word ptr [esi + 0x80]
        R.edx = (((R.m.u16(((R.ecx + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 842aaf: movsx edx, word ptr [ecx + 0x80]
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 842ab6: sub eax, edx
        R.sub((R.eax >>> 0), 0x9c4, 32); // 842ab8: cmp eax, 0x9c4
        if (R.cLE) { pc = 0x842ac6; continue; } // 842abd: jle 0x842ac6
        pc = 0x842abf; continue;
      case 0x842abf:
        R.m.w8(((R.esp + 0x44) | 0) >>> 0, 0x64); // 842abf: mov byte ptr [esp + 0x44], 0x64
        pc = 0x842ad6; continue; // 842ac4: jmp 0x842ad6
      case 0x842ac6:
        R.sub((R.eax >>> 0), 0xfffffa24, 32); // 842ac6: cmp eax, 0xfffffa24
        R.eax = ((R.eax & 0xffffff00) | (((R.cLE ? 1 : 0) & 0xff) << 0)) | 0; // 842acb: setle al
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 842ace: dec eax
        R.eax = (R.logic((R.eax >>> 0) & 0x32, 32)) | 0; // 842acf: and eax, 0x32
        R.m.w8(((R.esp + 0x44) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 842ad2: mov byte ptr [esp + 0x44], al
        pc = 0x842ad6; continue;
      case 0x842ad6:
        R.ecx = (R.m.u32(((R.esp + 0x44) | 0) >>> 0)) | 0; // 842ad6: mov ecx, dword ptr [esp + 0x44]
        R.push(0x1); // 842ada: push 1
        R.push(0x1); // 842adc: push 1
        R.edx = (((R.esp + 0x2c) | 0)) | 0; // 842ade: lea edx, [esp + 0x2c]
        R.push((R.ecx >>> 0)); // 842ae2: push ecx
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 842ae3: mov ecx, dword ptr [0xde1f54]
        R.push((R.edx >>> 0)); // 842ae9: push edx
        R.push((R.esi >>> 0)); // 842aea: push esi
        R.push((R.edi >>> 0)); // 842aeb: push edi
        R.call(0x8bed60, { n: 6, thisEcx: true, calleeClean: true }); // 842aec: call 0x8bed60
        pc = 0x8427ba; continue; // 842af1: jmp 0x8427ba
      default: throw new Error(`f_842740: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
