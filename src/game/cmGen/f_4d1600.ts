// 0x4d1600 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 418f60=2tc, 456740=2tc, 4b02e0=2, 4cf5f0=2tc, 4d0c60=5c, 53ca90=1, 540a50=3, 5431e0=2, 5444a0=2, 544520=2, 544600=2, 54cdb0=2tc, 5986b0=0t, 5a0590=1tc, 5fd210=1c, 5fea50=2c, 600a50=5, 6e86d0=5t, 849ce0=4tc, 8676f0=0t, 867b50=0t, 8c7560=3tc, 945ff0=0f
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_4d1600(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x4d1600;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x4d1600:
        R.esp = (R.sub((R.esp >>> 0), 0x7c, 32)) | 0; // 4d1600: sub esp, 0x7c
        R.push((R.ebx >>> 0)); // 4d1603: push ebx
        R.push((R.ebp >>> 0)); // 4d1604: push ebp
        R.ebp = (R.m.u32(((R.esp + 0x88) | 0) >>> 0)) | 0; // 4d1605: mov ebp, dword ptr [esp + 0x88]
        R.push((R.esi >>> 0)); // 4d160c: push esi
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 4d160d: test ebp, ebp
        R.push((R.edi >>> 0)); // 4d160f: push edi
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.ecx >>> 0)); // 4d1610: mov dword ptr [esp + 0x2c], ecx
        R.m.w32(((R.esp + 0x4c) | 0) >>> 0, 0x0); // 4d1614: mov dword ptr [esp + 0x4c], 0
        R.m.w32(((R.esp + 0x50) | 0) >>> 0, 0x3ff00000); // 4d161c: mov dword ptr [esp + 0x50], 0x3ff00000
        R.m.w32(((R.esp + 0x74) | 0) >>> 0, 0x0); // 4d1624: mov dword ptr [esp + 0x74], 0
        R.m.w32(((R.esp + 0x78) | 0) >>> 0, 0x3ff00000); // 4d162c: mov dword ptr [esp + 0x78], 0x3ff00000
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, 0x0); // 4d1634: mov dword ptr [esp + 0x44], 0
        R.m.w32(((R.esp + 0x48) | 0) >>> 0, 0x3ff00000); // 4d163c: mov dword ptr [esp + 0x48], 0x3ff00000
        R.m.w32(((R.esp + 0x54) | 0) >>> 0, 0x0); // 4d1644: mov dword ptr [esp + 0x54], 0
        R.m.w32(((R.esp + 0x58) | 0) >>> 0, 0x3ff00000); // 4d164c: mov dword ptr [esp + 0x58], 0x3ff00000
        if (R.zf) { pc = 0x4d424c; continue; } // 4d1654: je 0x4d424c
        pc = 0x4d165a; continue;
      case 0x4d165a:
        R.esi = (R.m.u32(((R.esp + 0x98) | 0) >>> 0)) | 0; // 4d165a: mov esi, dword ptr [esp + 0x98]
        R.push((R.ebp >>> 0)); // 4d1661: push ebp
        R.push((R.esi >>> 0)); // 4d1662: push esi
        R.call(0x4cf5f0, { n: 2, thisEcx: true, calleeClean: true }); // 4d1663: call 0x4cf5f0
        R.edi = ((R.eax >>> 0)) | 0; // 4d1668: mov edi, eax
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 4d166a: test edi, edi
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.edi >>> 0)); // 4d166c: mov dword ptr [esp + 0x18], edi
        if (R.zf) { pc = 0x4d424c; continue; } // 4d1670: je 0x4d424c
        pc = 0x4d1676; continue;
      case 0x4d1676:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edi + 0x35) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d1676: mov al, byte ptr [edi + 0x35]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x3f, 8)) & 0xff) << 0)) | 0; // 4d1679: and al, 0x3f
        R.sub(((R.eax >>> 0) & 0xff), 0x2, 8); // 4d167b: cmp al, 2
        if (!R.zf) { pc = 0x4d424c; continue; } // 4d167d: jne 0x4d424c
        pc = 0x4d1683; continue;
      case 0x4d1683:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edi + 0x49) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d1683: mov al, byte ptr [edi + 0x49]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 4d1686: test al, al
        if (!R.zf) { pc = 0x4d424c; continue; } // 4d1688: jne 0x4d424c
        pc = 0x4d168e; continue;
      case 0x4d168e:
        R.push(0x0); // 4d168e: push 0
        R.push(0x0); // 4d1690: push 0
        R.push(0x1); // 4d1692: push 1
        R.push(0x1); // 4d1694: push 1
        R.push((R.ebp >>> 0)); // 4d1696: push ebp
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 4d1697: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 4d169c: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d169f: test eax, eax
        if (R.zf) { pc = 0x4d16ea; continue; } // 4d16a1: je 0x4d16ea
        pc = 0x4d16a3; continue;
      case 0x4d16a3:
        R.push((R.ebp >>> 0)); // 4d16a3: push ebp
        R.call(0x53ca90, { n: 1, thisEcx: false, calleeClean: false }); // 4d16a4: call 0x53ca90
        R.ecx = (R.m.u32(((0xb63c98) | 0) >>> 0)) | 0; // 4d16a9: mov ecx, dword ptr [0xb63c98]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 4d16af: add esp, 4
        R.push((R.eax >>> 0)); // 4d16b2: push eax
        R.call(0x5fd210, { n: 1, thisEcx: false, calleeClean: true }); // 4d16b3: call 0x5fd210
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d16b8: test eax, eax
        if (R.zf) { pc = 0x4d16ea; continue; } // 4d16ba: je 0x4d16ea
        pc = 0x4d16bc; continue;
      case 0x4d16bc:
        R.push((R.ebp >>> 0)); // 4d16bc: push ebp
        R.call(0x53ca90, { n: 1, thisEcx: false, calleeClean: false }); // 4d16bd: call 0x53ca90
        R.ecx = (R.m.u32(((0xb63c98) | 0) >>> 0)) | 0; // 4d16c2: mov ecx, dword ptr [0xb63c98]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 4d16c8: add esp, 4
        R.push((R.eax >>> 0)); // 4d16cb: push eax
        R.push(0x0); // 4d16cc: push 0
        R.call(0x5fea50, { n: 2, thisEcx: false, calleeClean: true }); // 4d16ce: call 0x5fea50
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 4d16d3: test al, al
        if (R.zf) { pc = 0x4d16ea; continue; } // 4d16d5: je 0x4d16ea
        pc = 0x4d16d7; continue;
      case 0x4d16d7:
        R.logic(R.m.u8(((R.edi + 0x4e) | 0) >>> 0) & 0x4, 8); // 4d16d7: test byte ptr [edi + 0x4e], 4
        if (!R.zf) { pc = 0x4d16ea; continue; } // 4d16db: jne 0x4d16ea
        pc = 0x4d16dd; continue;
      case 0x4d16dd:
        R.eax = (R.m.u32(((R.esi + 0x52) | 0) >>> 0)) | 0; // 4d16dd: mov eax, dword ptr [esi + 0x52]
        R.edi = (R.pop()) | 0; // 4d16e0: pop edi
        R.esi = (R.pop()) | 0; // 4d16e1: pop esi
        R.ebp = (R.pop()) | 0; // 4d16e2: pop ebp
        R.ebx = (R.pop()) | 0; // 4d16e3: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x7c, 32)) | 0; // 4d16e4: add esp, 0x7c
        return R.ret(6); // 4d16e7: ret 0x18
      case 0x4d16ea:
        R.ecx = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d16ea: mov ecx, dword ptr [ebp + 0x57]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 4d16ed: test ecx, ecx
        if (R.zf) { pc = 0x4d177e; continue; } // 4d16ef: je 0x4d177e
        pc = 0x4d16f5; continue;
      case 0x4d16f5:
        R.eax = (R.m.u32(((R.ebp + 0x53) | 0) >>> 0)) | 0; // 4d16f5: mov eax, dword ptr [ebp + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d16f8: test eax, eax
        if (R.zf) { pc = 0x4d17f6; continue; } // 4d16fa: je 0x4d17f6
        pc = 0x4d1700; continue;
      case 0x4d1700:
        R.edx = (((R.m.u8(((R.eax + 0x7e) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d1700: movsx edx, byte ptr [eax + 0x7e]
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.edx >>> 0)); // 4d1704: mov dword ptr [esp + 0x34], edx
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 4d1708: fild dword ptr [esp + 0x34]
        R.fcom(R.st[0], 1.0); // 4d170c: fcom qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1712: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d1714: test ah, 1
        if (!R.zf) { pc = 0x4d1726; continue; } // 4d1717: jne 0x4d1726
        pc = 0x4d1719; continue;
      case 0x4d1719:
        R.fcom(R.st[0], 3.0); // 4d1719: fcom qword ptr [0x968930]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d171f: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d1721: test ah, 0x41
        if (!R.zf) { pc = 0x4d172e; continue; } // 4d1724: jne 0x4d172e
        pc = 0x4d1726; continue;
      case 0x4d1726:
        R.fpop(); // 4d1726: fstp st(0)
        R.fpush(3.0); // 4d1728: fld qword ptr [0x968930]
        pc = 0x4d172e; continue;
      case 0x4d172e:
        R.st[0] = R.st[0] + 1.0; // 4d172e: fadd qword ptr [0x967890]
        R.eax = (((R.m.u8(((R.ebp + 0x64) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d1734: movsx eax, byte ptr [ebp + 0x64]
        R.st[0] = R.st[0] * 0.5; // 4d1738: fmul qword ptr [0x968968]
        R.eax = (R.sub((R.eax >>> 0), 0x2, 32)) | 0; // 4d173e: sub eax, 2
        if (R.zf) { pc = 0x4d174e; continue; } // 4d1741: je 0x4d174e
        pc = 0x4d1743; continue;
      case 0x4d1743:
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 4d1743: dec eax
        if (!R.zf) { pc = 0x4d1754; continue; } // 4d1744: jne 0x4d1754
        pc = 0x4d1746; continue;
      case 0x4d1746:
        R.st[0] = R.st[0] * 7.5; // 4d1746: fmul qword ptr [0x968eb0]
        pc = 0x4d1754; continue; // 4d174c: jmp 0x4d1754
      case 0x4d174e:
        R.st[0] = R.st[0] * 4.0; // 4d174e: fmul qword ptr [0x968938]
        pc = 0x4d1754; continue;
      case 0x4d1754:
        R.eax = (((R.m.u16(((R.ecx + 0x69) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d1754: movsx eax, word ptr [ecx + 0x69]
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.eax >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.eax = (Number(BigInt.asIntN(32, p))) | 0; } // 4d1758: imul eax, eax
        R.ecx = (((R.m.u16(((R.ebp + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d175b: movsx ecx, word ptr [ebp + 0x80]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4d1762: lea eax, [eax + eax*4]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4d1765: lea eax, [eax + eax*4]
        R.eax = (R.add((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 4d1768: add eax, ecx
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.eax >>> 0)); // 4d176a: mov dword ptr [esp + 0x34], eax
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 4d176e: fild dword ptr [esp + 0x34]
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 4d1772: fxch st(1)
        R.st[0] = R.st[0] * 1000.0; // 4d1774: fmul qword ptr [0x968908]
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 4d177a: fdivp st(1)
        pc = 0x4d17fc; continue; // 4d177c: jmp 0x4d17fc
      case 0x4d177e:
        R.ecx = (R.m.u32(((R.ebp + 0x53) | 0) >>> 0)) | 0; // 4d177e: mov ecx, dword ptr [ebp + 0x53]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 4d1781: test ecx, ecx
        if (R.zf) { pc = 0x4d17f6; continue; } // 4d1783: je 0x4d17f6
        pc = 0x4d1785; continue;
      case 0x4d1785:
        R.edx = (((R.m.u8(((R.ecx + 0x7e) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d1785: movsx edx, byte ptr [ecx + 0x7e]
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.edx >>> 0)); // 4d1789: mov dword ptr [esp + 0x34], edx
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 4d178d: fild dword ptr [esp + 0x34]
        R.fcom(R.st[0], 1.0); // 4d1791: fcom qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1797: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d1799: test ah, 1
        if (!R.zf) { pc = 0x4d17ab; continue; } // 4d179c: jne 0x4d17ab
        pc = 0x4d179e; continue;
      case 0x4d179e:
        R.fcom(R.st[0], 3.0); // 4d179e: fcom qword ptr [0x968930]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d17a4: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d17a6: test ah, 0x41
        if (!R.zf) { pc = 0x4d17b3; continue; } // 4d17a9: jne 0x4d17b3
        pc = 0x4d17ab; continue;
      case 0x4d17ab:
        R.fpop(); // 4d17ab: fstp st(0)
        R.fpush(3.0); // 4d17ad: fld qword ptr [0x968930]
        pc = 0x4d17b3; continue;
      case 0x4d17b3:
        R.eax = (((R.m.u8(((R.ebp + 0x64) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d17b3: movsx eax, byte ptr [ebp + 0x64]
        R.eax = (R.sub((R.eax >>> 0), 0x2, 32)) | 0; // 4d17b7: sub eax, 2
        if (R.zf) { pc = 0x4d17c7; continue; } // 4d17ba: je 0x4d17c7
        pc = 0x4d17bc; continue;
      case 0x4d17bc:
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 4d17bc: dec eax
        if (!R.zf) { pc = 0x4d17c9; continue; } // 4d17bd: jne 0x4d17c9
        pc = 0x4d17bf; continue;
      case 0x4d17bf:
        R.st[0] = R.st[0] * 7.5; // 4d17bf: fmul qword ptr [0x968eb0]
        pc = 0x4d17c9; continue; // 4d17c5: jmp 0x4d17c9
      case 0x4d17c7:
        R.st[0] = R.st[0] + R.st[0]; // 4d17c7: fadd st(0), st(0)
        pc = 0x4d17c9; continue;
      case 0x4d17c9:
        R.eax = (((R.m.u8(((R.ecx + 0x85) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d17c9: movsx eax, byte ptr [ecx + 0x85]
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.eax >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.eax = (Number(BigInt.asIntN(32, p))) | 0; } // 4d17d0: imul eax, eax
        R.ecx = (((R.m.u16(((R.ebp + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d17d3: movsx ecx, word ptr [ebp + 0x80]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4d17da: lea eax, [eax + eax*4]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4d17dd: lea eax, [eax + eax*4]
        R.eax = (R.add((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 4d17e0: add eax, ecx
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.eax >>> 0)); // 4d17e2: mov dword ptr [esp + 0x34], eax
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 4d17e6: fild dword ptr [esp + 0x34]
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 4d17ea: fxch st(1)
        R.st[0] = R.st[0] * 1000.0; // 4d17ec: fmul qword ptr [0x968908]
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 4d17f2: fdivp st(1)
        pc = 0x4d17fc; continue; // 4d17f4: jmp 0x4d17fc
      case 0x4d17f6:
        R.fpush(1.0); // 4d17f6: fld qword ptr [0x967890]
        pc = 0x4d17fc; continue;
      case 0x4d17fc:
        R.st[0] = 20.0 - R.st[0]; // 4d17fc: fsubr qword ptr [0x968ea8]
        R.fpush(R.st[0]); // 4d1802: fld st(0)
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 4d1804: fmulp st(1)
        R.st[0] = R.st[0] * 0.2; // 4d1806: fmul qword ptr [0x968918]
        R.st[0] = R.st[0] * 0.016666666666666666; // 4d180c: fmul qword ptr [0x968958]
        R.st[0] = 1.0 - R.st[0]; // 4d1812: fsubr qword ptr [0x967890]
        R.fcom(R.st[0], 0.1); // 4d1818: fcom qword ptr [0x967880]
        R.m.wf64(((R.esp + 0x64) | 0) >>> 0, R.st[0]); // 4d181e: fst qword ptr [esp + 0x64]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1822: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d1824: test ah, 1
        if (R.zf) { pc = 0x4d183d; continue; } // 4d1827: je 0x4d183d
        pc = 0x4d1829; continue;
      case 0x4d1829:
        R.fpop(); // 4d1829: fstp st(0)
        R.m.w32(((R.esp + 0x64) | 0) >>> 0, 0x9999999a); // 4d182b: mov dword ptr [esp + 0x64], 0x9999999a
        R.m.w32(((R.esp + 0x68) | 0) >>> 0, 0x3fb99999); // 4d1833: mov dword ptr [esp + 0x68], 0x3fb99999
        pc = 0x4d185a; continue; // 4d183b: jmp 0x4d185a
      case 0x4d183d:
        R.fcom(R.st[0], 1.1); R.fpop(); // 4d183d: fcomp qword ptr [0x9689c0]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1843: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d1845: test ah, 0x41
        if (!R.zf) { pc = 0x4d185a; continue; } // 4d1848: jne 0x4d185a
        pc = 0x4d184a; continue;
      case 0x4d184a:
        R.m.w32(((R.esp + 0x64) | 0) >>> 0, 0x9999999a); // 4d184a: mov dword ptr [esp + 0x64], 0x9999999a
        R.m.w32(((R.esp + 0x68) | 0) >>> 0, 0x3ff19999); // 4d1852: mov dword ptr [esp + 0x68], 0x3ff19999
        pc = 0x4d185a; continue;
      case 0x4d185a:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x18) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d185a: mov al, byte ptr [esi + 0x18]
        R.sub(((R.eax >>> 0) & 0xff), 0x1c, 8); // 4d185d: cmp al, 0x1c
        R.m.w8(((R.esp + 0x10) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 4d185f: mov byte ptr [esp + 0x10], al
        if (R.cLE) { pc = 0x4d188e; continue; } // 4d1863: jle 0x4d188e
        pc = 0x4d1865; continue;
      case 0x4d1865:
        R.edx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 4d1865: movsx edx, al
        R.edx = (R.sub((R.edx >>> 0), 0x1c, 32)) | 0; // 4d1868: sub edx, 0x1c
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.edx >>> 0)); // 4d186b: mov dword ptr [esp + 0x34], edx
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 4d186f: fild dword ptr [esp + 0x34]
        R.st[0] = R.st[0] * 0.1; // 4d1873: fmul qword ptr [0x967880]
        R.st[0] = 1.0 - R.st[0]; // 4d1879: fsubr qword ptr [0x967890]
        R.fpush(2.0); // 4d187f: fld qword ptr [0x968950]
        R.call(0x945ff0, { n: 0, thisEcx: false, calleeClean: false, float: true }); // 4d1885: call 0x945ff0
        R.m.wf64(((R.esp + 0x74) | 0) >>> 0, R.st[0]); R.fpop(); // 4d188a: fstp qword ptr [esp + 0x74]
        pc = 0x4d188e; continue;
      case 0x4d188e:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edi + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d188e: mov al, byte ptr [edi + 0x4f]
        R.ebx = ((R.ebx & 0xffff0000) | (((((R.m.u8(((R.edi + 0x3d) | 0) >>> 0)) << 24 >> 24)) & 0xffff) << 0)) | 0; // 4d1891: movsx bx, byte ptr [edi + 0x3d]
        R.eax = ((R.eax & 0xffffff00) | (((R.shr(((R.eax >>> 0) & 0xff), 0x4, 8)) & 0xff) << 0)) | 0; // 4d1896: shr al, 4
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 4d1899: movsx eax, al
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 4d189c: dec eax
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.ebx >>> 0)); // 4d189d: mov dword ptr [esp + 0x24], ebx
        R.sub((R.eax >>> 0), 0x6, 32); // 4d18a1: cmp eax, 6
        if (!R.cBE) { pc = 0x4d1932; continue; } // 4d18a4: ja 0x4d1932
        pc = 0x4d18aa; continue;
      case 0x4d18aa:
        pc = [0x4d18b1, 0x4d18e3, 0x4d18fc, 0x4d18ca, 0x4d18e3, 0x4d1915, 0x4d1929][R.eax >>> 0]; continue; // 4d18aa: jmp dword ptr [eax*4 + 0x4d4258]
      case 0x4d18b1:
        R.ecx = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d18b1: movsx ecx, bx
        R.eax = (0x4b) | 0; // 4d18b4: mov eax, 0x4b
        R.edx = (0x0) | 0; // 4d18b9: mov edx, 0
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 4d18be: sub eax, ecx
        R.edx = ((R.edx & 0xffffff00) | (((R.sf ? 1 : 0) & 0xff) << 0)) | 0; // 4d18c0: sets dl
        R.edx = (R.incdec((R.edx >>> 0), -1, 32)) | 0; // 4d18c3: dec edx
        R.edx = (R.logic((R.edx >>> 0) & (R.eax >>> 0), 32)) | 0; // 4d18c4: and edx, eax
        R.esi = ((R.edx >>> 0)) | 0; // 4d18c6: mov esi, edx
        pc = 0x4d1934; continue; // 4d18c8: jmp 0x4d1934
      case 0x4d18ca:
        R.ecx = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d18ca: movsx ecx, bx
        R.eax = (0x19) | 0; // 4d18cd: mov eax, 0x19
        R.edx = (0x0) | 0; // 4d18d2: mov edx, 0
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 4d18d7: sub eax, ecx
        R.edx = ((R.edx & 0xffffff00) | (((R.sf ? 1 : 0) & 0xff) << 0)) | 0; // 4d18d9: sets dl
        R.edx = (R.incdec((R.edx >>> 0), -1, 32)) | 0; // 4d18dc: dec edx
        R.edx = (R.logic((R.edx >>> 0) & (R.eax >>> 0), 32)) | 0; // 4d18dd: and edx, eax
        R.esi = ((R.edx >>> 0)) | 0; // 4d18df: mov esi, edx
        pc = 0x4d1934; continue; // 4d18e1: jmp 0x4d1934
      case 0x4d18e3:
        R.ecx = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d18e3: movsx ecx, bx
        R.eax = (0x32) | 0; // 4d18e6: mov eax, 0x32
        R.edx = (0x0) | 0; // 4d18eb: mov edx, 0
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 4d18f0: sub eax, ecx
        R.edx = ((R.edx & 0xffffff00) | (((R.sf ? 1 : 0) & 0xff) << 0)) | 0; // 4d18f2: sets dl
        R.edx = (R.incdec((R.edx >>> 0), -1, 32)) | 0; // 4d18f5: dec edx
        R.edx = (R.logic((R.edx >>> 0) & (R.eax >>> 0), 32)) | 0; // 4d18f6: and edx, eax
        R.esi = ((R.edx >>> 0)) | 0; // 4d18f8: mov esi, edx
        pc = 0x4d1934; continue; // 4d18fa: jmp 0x4d1934
      case 0x4d18fc:
        R.ecx = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d18fc: movsx ecx, bx
        R.eax = (0x28) | 0; // 4d18ff: mov eax, 0x28
        R.edx = (0x0) | 0; // 4d1904: mov edx, 0
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 4d1909: sub eax, ecx
        R.edx = ((R.edx & 0xffffff00) | (((R.sf ? 1 : 0) & 0xff) << 0)) | 0; // 4d190b: sets dl
        R.edx = (R.incdec((R.edx >>> 0), -1, 32)) | 0; // 4d190e: dec edx
        R.edx = (R.logic((R.edx >>> 0) & (R.eax >>> 0), 32)) | 0; // 4d190f: and edx, eax
        R.esi = ((R.edx >>> 0)) | 0; // 4d1911: mov esi, edx
        pc = 0x4d1934; continue; // 4d1913: jmp 0x4d1934
      case 0x4d1915:
        R.eax = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d1915: movsx eax, bx
        R.eax = (R.neg((R.eax >>> 0), 32)) | 0; // 4d1918: neg eax
        R.ecx = (0x0) | 0; // 4d191a: mov ecx, 0
        R.ecx = ((R.ecx & 0xffffff00) | (((R.sf ? 1 : 0) & 0xff) << 0)) | 0; // 4d191f: sets cl
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 4d1922: dec ecx
        R.ecx = (R.logic((R.ecx >>> 0) & (R.eax >>> 0), 32)) | 0; // 4d1923: and ecx, eax
        R.esi = ((R.ecx >>> 0)) | 0; // 4d1925: mov esi, ecx
        pc = 0x4d1934; continue; // 4d1927: jmp 0x4d1934
      case 0x4d1929:
        R.ebx = (0xffffff9c) | 0; // 4d1929: mov ebx, 0xffffff9c
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.ebx >>> 0)); // 4d192e: mov dword ptr [esp + 0x24], ebx
        pc = 0x4d1932; continue;
      case 0x4d1932:
        R.esi = (R.logic((R.esi >>> 0) ^ (R.esi >>> 0), 32)) | 0; // 4d1932: xor esi, esi
        pc = 0x4d1934; continue;
      case 0x4d1934:
        R.edx = (R.m.u32(((R.esp + 0x98) | 0) >>> 0)) | 0; // 4d1934: mov edx, dword ptr [esp + 0x98]
        R.ecx = (R.m.u32(((0xad9c6c) | 0) >>> 0)) | 0; // 4d193b: mov ecx, dword ptr [0xad9c6c]
        R.push(0x1); // 4d1941: push 1
        R.push((R.edx >>> 0)); // 4d1943: push edx
        R.call(0x418f60, { n: 2, thisEcx: true, calleeClean: true }); // 4d1944: call 0x418f60
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 4d1949: test al, al
        if (R.zf) { pc = 0x4d19c6; continue; } // 4d194b: je 0x4d19c6
        pc = 0x4d194d; continue;
      case 0x4d194d:
        R.push((R.ebp >>> 0)); // 4d194d: push ebp
        R.call(0x53ca90, { n: 1, thisEcx: false, calleeClean: false }); // 4d194e: call 0x53ca90
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 4d1953: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d1956: test eax, eax
        if (!R.zf) { pc = 0x4d1968; continue; } // 4d1958: jne 0x4d1968
        pc = 0x4d195a; continue;
      case 0x4d195a:
        R.esi = (R.logic((R.esi >>> 0) ^ (R.esi >>> 0), 32)) | 0; // 4d195a: xor esi, esi
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, 0xffffff9c); // 4d195c: mov dword ptr [esp + 0x24], 0xffffff9c
        R.ebx = ((R.ebx & 0xffffff00) | (((R.logic(((R.ebx >>> 0) & 0xff) ^ ((R.ebx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 4d1964: xor bl, bl
        pc = 0x4d19cd; continue; // 4d1966: jmp 0x4d19cd
      case 0x4d1968:
        R.push((R.ebp >>> 0)); // 4d1968: push ebp
        R.call(0x53ca90, { n: 1, thisEcx: false, calleeClean: false }); // 4d1969: call 0x53ca90
        R.ecx = (R.m.u32(((R.eax + 0x69) | 0) >>> 0)) | 0; // 4d196e: mov ecx, dword ptr [eax + 0x69]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 4d1971: add esp, 4
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 4d1974: test ecx, ecx
        if (R.zf) { pc = 0x4d19c0; continue; } // 4d1976: je 0x4d19c0
        pc = 0x4d1978; continue;
      case 0x4d1978:
        R.push((R.ebp >>> 0)); // 4d1978: push ebp
        R.esi = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d1979: movsx esi, bx
        R.call(0x53ca90, { n: 1, thisEcx: false, calleeClean: false }); // 4d197c: call 0x53ca90
        R.eax = (R.m.u32(((R.eax + 0x69) | 0) >>> 0)) | 0; // 4d1981: mov eax, dword ptr [eax + 0x69]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 4d1984: add esp, 4
        R.eax = (((R.m.u8(((R.eax + 0x14) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d1987: movsx eax, byte ptr [eax + 0x14]
        R.ecx = ((R.eax >>> 0)) | 0; // 4d198b: mov ecx, eax
        R.ecx = (R.neg((R.ecx >>> 0), 32)) | 0; // 4d198d: neg ecx
        R.ecx = (R.shl((R.ecx >>> 0), 0x2, 32)) | 0; // 4d198f: shl ecx, 2
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 4d1992: sub ecx, eax
        R.sub((R.esi >>> 0), (R.ecx >>> 0), 32); // 4d1994: cmp esi, ecx
        if (!R.cL) { pc = 0x4d19a2; continue; } // 4d1996: jge 0x4d19a2
        pc = 0x4d1998; continue;
      case 0x4d1998:
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.esi >>> 0)); // 4d1998: mov dword ptr [esp + 0x24], esi
        R.esi = (R.logic((R.esi >>> 0) ^ (R.esi >>> 0), 32)) | 0; // 4d199c: xor esi, esi
        R.ebx = ((R.ebx & 0xffffff00) | (((R.logic(((R.ebx >>> 0) & 0xff) ^ ((R.ebx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 4d199e: xor bl, bl
        pc = 0x4d19cd; continue; // 4d19a0: jmp 0x4d19cd
      case 0x4d19a2:
        R.push((R.ebp >>> 0)); // 4d19a2: push ebp
        R.call(0x53ca90, { n: 1, thisEcx: false, calleeClean: false }); // 4d19a3: call 0x53ca90
        R.edx = (R.m.u32(((R.eax + 0x69) | 0) >>> 0)) | 0; // 4d19a8: mov edx, dword ptr [eax + 0x69]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 4d19ab: add esp, 4
        R.eax = ((R.eax & 0xffff0000) | (((((R.m.u8(((R.edx + 0x14) | 0) >>> 0)) << 24 >> 24)) & 0xffff) << 0)) | 0; // 4d19ae: movsx ax, byte ptr [edx + 0x14]
        R.ecx = ((R.eax >>> 0)) | 0; // 4d19b3: mov ecx, eax
        R.ecx = (R.neg((R.ecx >>> 0), 32)) | 0; // 4d19b5: neg ecx
        R.ecx = (R.shl((R.ecx >>> 0), 0x2, 32)) | 0; // 4d19b7: shl ecx, 2
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 4d19ba: sub ecx, eax
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.ecx >>> 0)); // 4d19bc: mov dword ptr [esp + 0x24], ecx
        pc = 0x4d19c0; continue;
      case 0x4d19c0:
        R.esi = (R.logic((R.esi >>> 0) ^ (R.esi >>> 0), 32)) | 0; // 4d19c0: xor esi, esi
        R.ebx = ((R.ebx & 0xffffff00) | (((R.logic(((R.ebx >>> 0) & 0xff) ^ ((R.ebx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 4d19c2: xor bl, bl
        pc = 0x4d19cd; continue; // 4d19c4: jmp 0x4d19cd
      case 0x4d19c6:
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.esp + 0xa0) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d19c6: mov bl, byte ptr [esp + 0xa0]
        pc = 0x4d19cd; continue;
      case 0x4d19cd:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edi + 0x44) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d19cd: mov al, byte ptr [edi + 0x44]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 4d19d0: test al, al
        if (R.cLE) { pc = 0x4d19e7; continue; } // 4d19d2: jle 0x4d19e7
        pc = 0x4d19d4; continue;
      case 0x4d19d4:
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 4d19d4: movsx eax, al
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.eax >>> 0)); // 4d19d7: mov dword ptr [esp + 0x34], eax
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 4d19db: fild dword ptr [esp + 0x34]
        R.st[0] = R.st[0] * 0.0033333333333333335; // 4d19df: fmul qword ptr [0x968e60]
        pc = 0x4d19f8; continue; // 4d19e5: jmp 0x4d19f8
      case 0x4d19e7:
        R.ecx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 4d19e7: movsx ecx, al
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.ecx >>> 0)); // 4d19ea: mov dword ptr [esp + 0x34], ecx
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 4d19ee: fild dword ptr [esp + 0x34]
        R.st[0] = R.st[0] * 0.007462686567164179; // 4d19f2: fmul qword ptr [0x969090]
        pc = 0x4d19f8; continue;
      case 0x4d19f8:
        R.st[0] = R.st[0] + 1.0; // 4d19f8: fadd qword ptr [0x967890]
        R.eax = (R.m.u32(((R.edi + 0x45) | 0) >>> 0)) | 0; // 4d19fe: mov eax, dword ptr [edi + 0x45]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d1a01: test eax, eax
        if (!R.zf) { pc = 0x4d1a0d; continue; } // 4d1a03: jne 0x4d1a0d
        pc = 0x4d1a05; continue;
      case 0x4d1a05:
        R.st[0] = R.st[0] * 1.2; // 4d1a05: fmul qword ptr [0x968978]
        pc = 0x4d1a13; continue; // 4d1a0b: jmp 0x4d1a13
      case 0x4d1a0d:
        R.st[0] = R.st[0] * 0.8333333333333334; // 4d1a0d: fmul qword ptr [0x969088]
        pc = 0x4d1a13; continue;
      case 0x4d1a13:
        R.edi = (R.m.u32(((R.esp + 0x98) | 0) >>> 0)) | 0; // 4d1a13: mov edi, dword ptr [esp + 0x98]
        R.m.wf64(((R.esp + 0x84) | 0) >>> 0, R.st[0]); R.fpop(); // 4d1a1a: fstp qword ptr [esp + 0x84]
        R.ecx = (R.m.u32(((R.edi + 0x61) | 0) >>> 0)) | 0; // 4d1a21: mov ecx, dword ptr [edi + 0x61]
        R.eax = (((R.m.u16(((R.ecx + 0xb) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d1a24: movsx eax, word ptr [ecx + 0xb]
        R.edx = R.eax < 0 ? -1 : 0; // 4d1a28: cdq 
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 4d1a29: sub eax, edx
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.ecx + 0x7) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 4d1a2b: mov dx, word ptr [ecx + 7]
        { const p = BigInt(((((R.edx >>> 0) & 0xffff)) << 16 >> 16)) * BigInt(25); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.edx = ((R.edx & 0xffff0000) | (((Number(BigInt.asIntN(32, p))) & 0xffff) << 0)) | 0; } // 4d1a2f: imul dx, dx, 0x19
        R.eax = (R.sar((R.eax >>> 0), 0x1, 32)) | 0; // 4d1a33: sar eax, 1
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 4d1a35: add eax, edx
        R.push((R.eax >>> 0)); // 4d1a37: push eax
        R.eax = (R.m.u32(((R.ebp + 0xcf) | 0) >>> 0)) | 0; // 4d1a38: mov eax, dword ptr [ebp + 0xcf]
        R.push(0x1); // 4d1a3e: push 1
        R.push((R.ebp >>> 0)); // 4d1a40: push ebp
        R.push((R.edi >>> 0)); // 4d1a41: push edi
        R.push((R.eax >>> 0)); // 4d1a42: push eax
        R.call(0x6e86d0, { n: 5, thisEcx: true, calleeClean: false }); // 4d1a43: call 0x6e86d0
        R.ecx = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 4d1a48: mov ecx, dword ptr [esp + 0x40]
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 4d1a4c: add esp, 0x14
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.eax >>> 0)); // 4d1a4f: mov dword ptr [esp + 0x20], eax
        R.push(0x0); // 4d1a53: push 0
        R.push((R.eax >>> 0)); // 4d1a55: push eax
        R.push(0x0); // 4d1a56: push 0
        R.push((R.ebp >>> 0)); // 4d1a58: push ebp
        R.push((R.edi >>> 0)); // 4d1a59: push edi
        R.call(0x4d0c60, { n: 5, thisEcx: false, calleeClean: true }); // 4d1a5a: call 0x4d0c60
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d1a5f: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.eax >>> 0)); // 4d1a61: mov dword ptr [esp + 0x14], eax
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 4d1a65: mov dword ptr [esp + 0x1c], eax
        if (R.zf) { pc = 0x4d424c; continue; } // 4d1a69: je 0x4d424c
        pc = 0x4d1a6f; continue;
      case 0x4d1a6f:
        R.edi = (R.m.u32(((R.esp + 0x9c) | 0) >>> 0)) | 0; // 4d1a6f: mov edi, dword ptr [esp + 0x9c]
        R.logic(((R.ebx >>> 0) & 0xff) & ((R.ebx >>> 0) & 0xff), 8); // 4d1a76: test bl, bl
        if (R.zf) { pc = 0x4d1b80; continue; } // 4d1a78: je 0x4d1b80
        pc = 0x4d1a7e; continue;
      case 0x4d1a7e:
        R.push(0x0); // 4d1a7e: push 0
        R.push(0x0); // 4d1a80: push 0
        R.push(0x1); // 4d1a82: push 1
        R.push(0x0); // 4d1a84: push 0
        R.push((R.ebp >>> 0)); // 4d1a86: push ebp
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 4d1a87: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 4d1a8c: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d1a8f: test eax, eax
        if (!R.zf) { pc = 0x4d1b80; continue; } // 4d1a91: jne 0x4d1b80
        pc = 0x4d1a97; continue;
      case 0x4d1a97:
        R.ebx = (R.m.u32(((R.esp + 0x98) | 0) >>> 0)) | 0; // 4d1a97: mov ebx, dword ptr [esp + 0x98]
        R.push((R.eax >>> 0)); // 4d1a9e: push eax
        R.push((R.ebx >>> 0)); // 4d1a9f: push ebx
        R.call(0x544520, { n: 2, thisEcx: false, calleeClean: false }); // 4d1aa0: call 0x544520
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 4d1aa5: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d1aa8: test eax, eax
        if (!R.zf) { pc = 0x4d1b80; continue; } // 4d1aaa: jne 0x4d1b80
        pc = 0x4d1ab0; continue;
      case 0x4d1ab0:
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d1ab0: mov ecx, dword ptr [esp + 0x18]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d1ab4: mov al, byte ptr [ecx + 0x4f]
        R.ecx = ((R.ecx & 0xffffff00) | (((((R.eax >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 4d1ab7: mov cl, al
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d1ab9: and cl, 0xf0
        R.sub(((R.ecx >>> 0) & 0xff), 0x70, 8); // 4d1abc: cmp cl, 0x70
        if (R.zf) { pc = 0x4d1b80; continue; } // 4d1abf: je 0x4d1b80
        pc = 0x4d1ac5; continue;
      case 0x4d1ac5:
        R.sub(((R.ecx >>> 0) & 0xff), 0x80, 8); // 4d1ac5: cmp cl, 0x80
        if (R.zf) { pc = 0x4d1b80; continue; } // 4d1ac8: je 0x4d1b80
        pc = 0x4d1ace; continue;
      case 0x4d1ace:
        R.eax = ((R.eax & 0xffffff00) | (((R.shr(((R.eax >>> 0) & 0xff), 0x4, 8)) & 0xff) << 0)) | 0; // 4d1ace: shr al, 4
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 4d1ad1: movsx eax, al
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 4d1ad4: dec eax
        R.sub((R.eax >>> 0), 0x4, 32); // 4d1ad5: cmp eax, 4
        if (!R.cBE) { pc = 0x4d1af9; continue; } // 4d1ad8: ja 0x4d1af9
        pc = 0x4d1ada; continue;
      case 0x4d1ada:
        pc = [0x4d1af9, 0x4d1ae1, 0x4d1af1, 0x4d1ae9, 0x4d1ae9][R.eax >>> 0]; continue; // 4d1ada: jmp dword ptr [eax*4 + 0x4d4274]
      case 0x4d1ae1:
        R.fpush(6.0); // 4d1ae1: fld dword ptr [0x969084]
        pc = 0x4d1aff; continue; // 4d1ae7: jmp 0x4d1aff
      case 0x4d1ae9:
        R.fpush(3.5); // 4d1ae9: fld dword ptr [0x969080]
        pc = 0x4d1aff; continue; // 4d1aef: jmp 0x4d1aff
      case 0x4d1af1:
        R.fpush(5.5); // 4d1af1: fld dword ptr [0x96907c]
        pc = 0x4d1aff; continue; // 4d1af7: jmp 0x4d1aff
      case 0x4d1af9:
        R.fpush(7.5); // 4d1af9: fld dword ptr [0x969078]
        pc = 0x4d1aff; continue;
      case 0x4d1aff:
        R.edx = (R.logic((R.edx >>> 0) ^ (R.edx >>> 0), 32)) | 0; // 4d1aff: xor edx, edx
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 4d1b01: xor eax, eax
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.ebx + 0x40) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 4d1b03: mov dx, word ptr [ebx + 0x40]
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 4d1b07: mov ax, word ptr [0xae2c92]
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 4d1b0d: sub eax, edx
        R.edx = (((R.m.u16(((R.ebx + 0x3e) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d1b0f: movsx edx, word ptr [ebx + 0x3e]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 4d1b13: lea ecx, [eax + eax*8]
        R.eax = (((R.eax + R.ecx * 8) | 0)) | 0; // 4d1b16: lea eax, [eax + ecx*8]
        R.ecx = (((R.m.u16(((0xae2c90) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d1b19: movsx ecx, word ptr [0xae2c90]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4d1b20: lea eax, [eax + eax*4]
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 4d1b23: sub eax, edx
        R.eax = (R.add((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 4d1b25: add eax, ecx
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 4d1b27: mov dword ptr [esp + 0x28], eax
        if (R.sf) { pc = 0x4d1b43; continue; } // 4d1b2b: js 0x4d1b43
        pc = 0x4d1b2d; continue;
      case 0x4d1b2d:
        R.sub((R.eax >>> 0), 0x16d, 32); // 4d1b2d: cmp eax, 0x16d
        if (R.cLE) { pc = 0x4d1b3e; continue; } // 4d1b32: jle 0x4d1b3e
        pc = 0x4d1b34; continue;
      case 0x4d1b34:
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0x16d); // 4d1b34: mov dword ptr [esp + 0x28], 0x16d
        pc = 0x4d1b4b; continue; // 4d1b3c: jmp 0x4d1b4b
      case 0x4d1b3e:
        R.sub((R.eax >>> 0), 0x79, 32); // 4d1b3e: cmp eax, 0x79
        if (!R.cLE) { pc = 0x4d1b4b; continue; } // 4d1b41: jg 0x4d1b4b
        pc = 0x4d1b43; continue;
      case 0x4d1b43:
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0x79); // 4d1b43: mov dword ptr [esp + 0x28], 0x79
        pc = 0x4d1b4b; continue;
      case 0x4d1b4b:
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 4d1b4b: fild dword ptr [esp + 0x28]
        R.fpush(R.st[1]); // 4d1b4f: fld st(1)
        R.st[0] = R.st[0] - 1.0; // 4d1b51: fsub qword ptr [0x967890]
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 4d1b57: test edi, edi
        R.st[0] = 365.0 / R.st[0]; // 4d1b59: fdivr qword ptr [0x969070]
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 4d1b5f: fdivp st(1)
        R.st[0] = R.st[1] - R.st[0]; // 4d1b61: fsubr st(1)
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d1b63: fstp qword ptr [esp + 0x4c]
        R.fpop(); // 4d1b67: fstp st(0)
        if (R.zf) { pc = 0x4d1b80; continue; } // 4d1b69: je 0x4d1b80
        pc = 0x4d1b6b; continue;
      case 0x4d1b6b:
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d1b6b: fld qword ptr [esp + 0x4c]
        R.fcom(R.st[0], 2.0); R.fpop(); // 4d1b6f: fcomp qword ptr [0x968950]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1b75: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d1b77: test ah, 0x41
        if (!R.zf) { pc = 0x4d1b80; continue; } // 4d1b7a: jne 0x4d1b80
        pc = 0x4d1b7c; continue;
      case 0x4d1b7c:
        R.m.w8(((R.edi + 0x1) | 0) >>> 0, R.logic(R.m.u8(((R.edi + 0x1) | 0) >>> 0) | 0x1, 8)); // 4d1b7c: or byte ptr [edi + 1], 1
        pc = 0x4d1b80; continue;
      case 0x4d1b80:
        R.ebx = (R.m.u32(((R.esp + 0x24) | 0) >>> 0)) | 0; // 4d1b80: mov ebx, dword ptr [esp + 0x24]
        R.eax = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d1b84: movsx eax, si
        R.edx = R.eax < 0 ? -1 : 0; // 4d1b87: cdq 
        R.ecx = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d1b88: movsx ecx, bx
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 4d1b8b: sub eax, edx
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.ecx >>> 0)); // 4d1b8d: mov dword ptr [esp + 0x2c], ecx
        R.eax = (R.sar((R.eax >>> 0), 0x1, 32)) | 0; // 4d1b91: sar eax, 1
        R.sub(((R.ebx >>> 0) & 0xffff), 0x32, 16); // 4d1b93: cmp bx, 0x32
        R.esi = (((R.eax + R.ecx) | 0)) | 0; // 4d1b97: lea esi, [eax + ecx]
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.esi >>> 0)); // 4d1b9a: mov dword ptr [esp + 0x34], esi
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 4d1b9e: fild dword ptr [esp + 0x34]
        R.st[0] = R.st[0] * 0.01167; // 4d1ba2: fmul qword ptr [0x969068]
        R.st[0] = R.st[0] + 1.4165; // 4d1ba8: fadd qword ptr [0x969060]
        R.m.wf64(((R.esp + 0x5c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d1bae: fstp qword ptr [esp + 0x5c]
        if (R.cL) { pc = 0x4d1bfb; continue; } // 4d1bb2: jl 0x4d1bfb
        pc = 0x4d1bb4; continue;
      case 0x4d1bb4:
        R.push(0x0); // 4d1bb4: push 0
        R.push(0x0); // 4d1bb6: push 0
        R.push(0x1); // 4d1bb8: push 1
        R.push(0x0); // 4d1bba: push 0
        R.push((R.ebp >>> 0)); // 4d1bbc: push ebp
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 4d1bbd: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 4d1bc2: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d1bc5: test eax, eax
        if (!R.zf) { pc = 0x4d1bfb; continue; } // 4d1bc7: jne 0x4d1bfb
        pc = 0x4d1bc9; continue;
      case 0x4d1bc9:
        R.ecx = ((R.esi >>> 0)) | 0; // 4d1bc9: mov ecx, esi
        R.eax = (0x51eb851f) | 0; // 4d1bcb: mov eax, 0x51eb851f
        { const p = BigInt((((R.esi >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 4d1bd0: imul ecx, esi
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 4d1bd3: imul ecx
        R.edx = (R.sar((R.edx >>> 0), 0x4, 32)) | 0; // 4d1bd5: sar edx, 4
        R.eax = ((R.edx >>> 0)) | 0; // 4d1bd8: mov eax, edx
        R.eax = (R.shr((R.eax >>> 0), 0x1f, 32)) | 0; // 4d1bda: shr eax, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 4d1bdd: add edx, eax
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.edx >>> 0)); // 4d1bdf: mov dword ptr [esp + 0x34], edx
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 4d1be3: fild dword ptr [esp + 0x34]
        R.st[0] = R.st[0] * 0.006; // 4d1be7: fmul qword ptr [0x969058]
        R.st[0] = R.st[0] + 0.7; // 4d1bed: fadd qword ptr [0x968e40]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x5c) | 0)); // 4d1bf3: fmul qword ptr [esp + 0x5c]
        R.m.wf64(((R.esp + 0x5c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d1bf7: fstp qword ptr [esp + 0x5c]
        pc = 0x4d1bfb; continue;
      case 0x4d1bfb:
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 4d1bfb: test edi, edi
        if (R.zf) { pc = 0x4d1c15; continue; } // 4d1bfd: je 0x4d1c15
        pc = 0x4d1bff; continue;
      case 0x4d1bff:
        R.sub(((R.ebx >>> 0) & 0xffff), 0x3c, 16); // 4d1bff: cmp bx, 0x3c
        if (R.cLE) { pc = 0x4d1c0b; continue; } // 4d1c03: jle 0x4d1c0b
        pc = 0x4d1c05; continue;
      case 0x4d1c05:
        R.m.w8(((R.edi + 0x1) | 0) >>> 0, R.logic(R.m.u8(((R.edi + 0x1) | 0) >>> 0) | 0x2, 8)); // 4d1c05: or byte ptr [edi + 1], 2
        pc = 0x4d1c15; continue; // 4d1c09: jmp 0x4d1c15
      case 0x4d1c0b:
        R.sub(((R.ebx >>> 0) & 0xffff), 0x14, 16); // 4d1c0b: cmp bx, 0x14
        if (R.cLE) { pc = 0x4d1c15; continue; } // 4d1c0f: jle 0x4d1c15
        pc = 0x4d1c11; continue;
      case 0x4d1c11:
        R.m.w8(((R.edi + 0x1) | 0) >>> 0, R.logic(R.m.u8(((R.edi + 0x1) | 0) >>> 0) | 0x4, 8)); // 4d1c11: or byte ptr [edi + 1], 4
        pc = 0x4d1c15; continue;
      case 0x4d1c15:
        R.ecx = (R.m.u32(((0xae2a38) | 0) >>> 0)) | 0; // 4d1c15: mov ecx, dword ptr [0xae2a38]
        R.push((R.ebp >>> 0)); // 4d1c1b: push ebp
        R.call(0x5a0590, { n: 1, thisEcx: true, calleeClean: true }); // 4d1c1c: call 0x5a0590
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d1c21: test eax, eax
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.eax >>> 0)); // 4d1c23: mov dword ptr [esp + 0x34], eax
        if (!R.zf) { pc = 0x4d1c31; continue; } // 4d1c27: jne 0x4d1c31
        pc = 0x4d1c29; continue;
      case 0x4d1c29:
        R.fpush(0.0); // 4d1c29: fld qword ptr [0x9689a0]
        pc = 0x4d1c33; continue; // 4d1c2f: jmp 0x4d1c33
      case 0x4d1c31:
        R.fpush(R.i64(((R.eax) | 0))); // 4d1c31: fild qword ptr [eax]
        pc = 0x4d1c33; continue;
      case 0x4d1c33:
        R.ecx = (((R.m.u16(((R.ebp + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d1c33: movsx ecx, word ptr [ebp + 0x80]
        R.m.wf64(((R.esp + 0x7c) | 0) >>> 0, R.st[0]); // 4d1c3a: fst qword ptr [esp + 0x7c]
        R.eax = (0x10624dd3) | 0; // 4d1c3e: mov eax, 0x10624dd3
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 4d1c43: imul ecx
        R.edx = (R.sar((R.edx >>> 0), 0x5, 32)) | 0; // 4d1c45: sar edx, 5
        R.ecx = ((R.edx >>> 0)) | 0; // 4d1c48: mov ecx, edx
        R.ecx = (R.shr((R.ecx >>> 0), 0x1f, 32)) | 0; // 4d1c4a: shr ecx, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 4d1c4d: add edx, ecx
        R.fcom(R.st[0], R.f64(((R.edx * 8 + 0x9a7f48) | 0))); // 4d1c4f: fcom qword ptr [edx*8 + 0x9a7f48]
        R.edx = (((R.edx * 8 + 0x9a7f48) | 0)) | 0; // 4d1c56: lea edx, [edx*8 + 0x9a7f48]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1c5d: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d1c5f: test ah, 1
        if (R.zf) { pc = 0x4d1cbc; continue; } // 4d1c62: je 0x4d1cbc
        pc = 0x4d1c64; continue;
      case 0x4d1c64:
        R.st[0] = R.st[0] - R.f64(((R.edx) | 0)); // 4d1c64: fsub qword ptr [edx]
        R.st[0] = R.st[0] / R.f64(((R.edx) | 0)); // 4d1c66: fdiv qword ptr [edx]
        R.fpush(R.f64(((R.esp + 0x7c) | 0))); // 4d1c68: fld qword ptr [esp + 0x7c]
        R.st[0] = R.st[0] * 1.25e-06; // 4d1c6c: fmul qword ptr [0x969050]
        R.fpush(0.0); // 4d1c72: fld qword ptr [0x9689a0]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d1c78: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1c7a: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d1c7c: test ah, 0x41
        if (!R.zf) { pc = 0x4d1c97; continue; } // 4d1c7f: jne 0x4d1c97
        pc = 0x4d1c81; continue;
      case 0x4d1c81:
        R.fpop(); // 4d1c81: fstp st(0)
        R.fpush(0.0); // 4d1c83: fld qword ptr [0x9689a0]
        R.fpush(R.st[0]); // 4d1c89: fld st(0)
        R.st[2] = R.st[2] + R.st[0]; R.fpop(); // 4d1c8b: faddp st(2)
        R.st[0] = R.st[0] + 1.0; // 4d1c8d: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 4d1c93: fdivp st(1)
        pc = 0x4d1cbe; continue; // 4d1c95: jmp 0x4d1cbe
      case 0x4d1c97:
        R.fpush(10.0); // 4d1c97: fld qword ptr [0x9688b0]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d1c9d: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1c9f: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d1ca1: test ah, 1
        if (R.zf) { pc = 0x4d1cae; continue; } // 4d1ca4: je 0x4d1cae
        pc = 0x4d1ca6; continue;
      case 0x4d1ca6:
        R.fpop(); // 4d1ca6: fstp st(0)
        R.fpush(10.0); // 4d1ca8: fld qword ptr [0x9688b0]
        pc = 0x4d1cae; continue;
      case 0x4d1cae:
        R.fpush(R.st[0]); // 4d1cae: fld st(0)
        R.st[2] = R.st[2] + R.st[0]; R.fpop(); // 4d1cb0: faddp st(2)
        R.st[0] = R.st[0] + 1.0; // 4d1cb2: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 4d1cb8: fdivp st(1)
        pc = 0x4d1cbe; continue; // 4d1cba: jmp 0x4d1cbe
      case 0x4d1cbc:
        R.st[0] = R.st[0] / R.f64(((R.edx) | 0)); // 4d1cbc: fdiv qword ptr [edx]
        pc = 0x4d1cbe; continue;
      case 0x4d1cbe:
        R.edx = (R.m.u32(((R.esp + 0x98) | 0) >>> 0)) | 0; // 4d1cbe: mov edx, dword ptr [esp + 0x98]
        R.fpush(R.m.s32(((R.esp + 0x2c) | 0) >>> 0)); // 4d1cc5: fild dword ptr [esp + 0x2c]
        R.eax = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 4d1cc9: mov eax, dword ptr [edx]
        R.edx = (R.m.u32(((0xae2d0c) | 0) >>> 0)) | 0; // 4d1ccb: mov edx, dword ptr [0xae2d0c]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 4d1cd1: lea ecx, [eax + eax*4]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 4d1cd4: shl ecx, 4
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 4d1cd7: sub ecx, eax
        R.m.wf64(((R.esp + 0x6c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d1cd9: fstp qword ptr [esp + 0x6c]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + R.edx + 0xb) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d1cdd: mov al, byte ptr [ecx + edx + 0xb]
        R.eax = (R.logic((R.eax >>> 0) & 0xf, 32)) | 0; // 4d1ce1: and eax, 0xf
        R.ecx = ((R.eax >>> 0)) | 0; // 4d1ce4: mov ecx, eax
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 4d1ce6: imul ecx, eax
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.ecx >>> 0)); // 4d1ce9: mov dword ptr [esp + 0x2c], ecx
        R.fpush(R.m.s32(((R.esp + 0x2c) | 0) >>> 0)); // 4d1ced: fild dword ptr [esp + 0x2c]
        R.st[0] = R.st[0] * 0.05; // 4d1cf1: fmul qword ptr [0x967888]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 4d1cf7: faddp st(1)
        R.fpush(R.f64(((R.esp + 0x6c) | 0))); // 4d1cf9: fld qword ptr [esp + 0x6c]
        R.st[0] = R.st[0] * 0.002; // 4d1cfd: fmul qword ptr [0x969048]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 4d1d03: faddp st(1)
        R.fcom(R.st[0], 1.0); // 4d1d05: fcom qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1d0b: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d1d0d: test ah, 0x41
        if (!R.zf) { pc = 0x4d1d20; continue; } // 4d1d10: jne 0x4d1d20
        pc = 0x4d1d12; continue;
      case 0x4d1d12:
        R.st[0] = R.st[0] * 0.25; // 4d1d12: fmul qword ptr [0x9689e0]
        R.st[0] = R.st[0] + 0.75; // 4d1d18: fadd qword ptr [0x969040]
        pc = 0x4d1d2c; continue; // 4d1d1e: jmp 0x4d1d2c
      case 0x4d1d20:
        R.st[0] = R.st[0] * 0.2125; // 4d1d20: fmul qword ptr [0x969038]
        R.st[0] = R.st[0] + 0.7875; // 4d1d26: fadd qword ptr [0x969030]
        pc = 0x4d1d2c; continue;
      case 0x4d1d2c:
        R.m.wf64(((R.esp + 0x38) | 0) >>> 0, R.st[0]); R.fpop(); // 4d1d2c: fstp qword ptr [esp + 0x38]
        R.fpush(R.f64(((R.esp + 0x6c) | 0))); // 4d1d30: fld qword ptr [esp + 0x6c]
        R.st[0] = R.st[0] * 0.0025; // 4d1d34: fmul qword ptr [0x969028]
        R.st[0] = R.st[0] + 0.5; // 4d1d3a: fadd qword ptr [0x968968]
        R.fcom(R.st[0], R.f64(((R.esp + 0x38) | 0))); // 4d1d40: fcom qword ptr [esp + 0x38]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1d44: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d1d46: test ah, 0x41
        if (!R.zf) { pc = 0x4d1d51; continue; } // 4d1d49: jne 0x4d1d51
        pc = 0x4d1d4b; continue;
      case 0x4d1d4b:
        R.m.wf64(((R.esp + 0x38) | 0) >>> 0, R.st[0]); R.fpop(); // 4d1d4b: fstp qword ptr [esp + 0x38]
        pc = 0x4d1d74; continue; // 4d1d4f: jmp 0x4d1d74
      case 0x4d1d51:
        R.fpop(); // 4d1d51: fstp st(0)
        R.fpush(2.5); // 4d1d53: fld qword ptr [0x968e18]
        R.fcom(R.st[0], R.f64(((R.esp + 0x38) | 0))); R.fpop(); // 4d1d59: fcomp qword ptr [esp + 0x38]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1d5d: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d1d5f: test ah, 1
        if (R.zf) { pc = 0x4d1d74; continue; } // 4d1d62: je 0x4d1d74
        pc = 0x4d1d64; continue;
      case 0x4d1d64:
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, 0x0); // 4d1d64: mov dword ptr [esp + 0x38], 0
        R.m.w32(((R.esp + 0x3c) | 0) >>> 0, 0x40040000); // 4d1d6c: mov dword ptr [esp + 0x3c], 0x40040000
        pc = 0x4d1d74; continue;
      case 0x4d1d74:
        R.ebx = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d1d74: mov ebx, dword ptr [esp + 0x94]
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 4d1d7b: test ebx, ebx
        if (R.zf) { pc = 0x4d2002; continue; } // 4d1d7d: je 0x4d2002
        pc = 0x4d1d83; continue;
      case 0x4d1d83:
        R.esi = (R.m.u32(((R.esp + 0x24) | 0) >>> 0)) | 0; // 4d1d83: mov esi, dword ptr [esp + 0x24]
        R.sub(((R.esi >>> 0) & 0xffff), 0x14, 16); // 4d1d87: cmp si, 0x14
        if (R.cLE) { pc = 0x4d1da9; continue; } // 4d1d8b: jle 0x4d1da9
        pc = 0x4d1d8d; continue;
      case 0x4d1d8d:
        R.edx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d1d8d: mov edx, dword ptr [esp + 0x18]
        R.eax = (R.m.u32(((R.edx + 0x45) | 0) >>> 0)) | 0; // 4d1d91: mov eax, dword ptr [edx + 0x45]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d1d94: test eax, eax
        if (!R.zf) { pc = 0x4d1da9; continue; } // 4d1d96: jne 0x4d1da9
        pc = 0x4d1d98; continue;
      case 0x4d1d98:
        R.fpush(R.f64(((R.esp + 0x6c) | 0))); // 4d1d98: fld qword ptr [esp + 0x6c]
        R.st[0] = R.st[0] * 1.5; // 4d1d9c: fmul qword ptr [0x968940]
        R.ftol(); // 4d1da2: call 0x945640
        R.esi = ((R.eax >>> 0)) | 0; // 4d1da7: mov esi, eax
        pc = 0x4d1da9; continue;
      case 0x4d1da9:
        R.eax = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 4d1da9: mov eax, dword ptr [ebx]
        R.ecx = (R.m.u32(((0x9d0118) | 0) >>> 0)) | 0; // 4d1dab: mov ecx, dword ptr [0x9d0118]
        R.edx = (R.m.u32(((0x9d011c) | 0) >>> 0)) | 0; // 4d1db1: mov edx, dword ptr [0x9d011c]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 4d1db7: cmp eax, ecx
        if (R.zf) { pc = 0x4d1dbf; continue; } // 4d1db9: je 0x4d1dbf
        pc = 0x4d1dbb; continue;
      case 0x4d1dbb:
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 4d1dbb: cmp eax, edx
        if (!R.zf) { pc = 0x4d1dd2; continue; } // 4d1dbd: jne 0x4d1dd2
        pc = 0x4d1dbf; continue;
      case 0x4d1dbf:
        R.eax = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 4d1dbf: mov eax, dword ptr [ebp]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 4d1dc2: cmp eax, ecx
        if (R.zf) { pc = 0x4d1fb5; continue; } // 4d1dc4: je 0x4d1fb5
        pc = 0x4d1dca; continue;
      case 0x4d1dca:
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 4d1dca: cmp eax, edx
        if (R.zf) { pc = 0x4d1fb5; continue; } // 4d1dcc: je 0x4d1fb5
        pc = 0x4d1dd2; continue;
      case 0x4d1dd2:
        R.push((R.ebp >>> 0)); // 4d1dd2: push ebp
        R.push((R.ebx >>> 0)); // 4d1dd3: push ebx
        R.call(0x4b02e0, { n: 2, thisEcx: false, calleeClean: false }); // 4d1dd4: call 0x4b02e0
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 4d1dd9: add esp, 8
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 4d1ddc: test al, al
        if (R.zf) { pc = 0x4d1e88; continue; } // 4d1dde: je 0x4d1e88
        pc = 0x4d1de4; continue;
      case 0x4d1de4:
        R.ecx = (R.m.u32(((R.ebx + 0x69) | 0) >>> 0)) | 0; // 4d1de4: mov ecx, dword ptr [ebx + 0x69]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 4d1de7: test ecx, ecx
        if (R.zf) { pc = 0x4d1e30; continue; } // 4d1de9: je 0x4d1e30
        pc = 0x4d1deb; continue;
      case 0x4d1deb:
        R.eax = (R.m.u32(((R.ebp + 0x69) | 0) >>> 0)) | 0; // 4d1deb: mov eax, dword ptr [ebp + 0x69]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d1dee: test eax, eax
        if (R.zf) { pc = 0x4d1e30; continue; } // 4d1df0: je 0x4d1e30
        pc = 0x4d1df2; continue;
      case 0x4d1df2:
        R.ecx = (R.m.u32(((R.ecx + 0x38) | 0) >>> 0)) | 0; // 4d1df2: mov ecx, dword ptr [ecx + 0x38]
        R.edx = (R.m.u32(((R.eax + 0x38) | 0) >>> 0)) | 0; // 4d1df5: mov edx, dword ptr [eax + 0x38]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 4d1df8: cmp ecx, edx
        if (!R.zf) { pc = 0x4d1e30; continue; } // 4d1dfa: jne 0x4d1e30
        pc = 0x4d1dfc; continue;
      case 0x4d1dfc:
        R.edx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d1dfc: movsx edx, si
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.edx >>> 0)); // 4d1dff: mov dword ptr [esp + 0x2c], edx
        R.fpush(R.m.s32(((R.esp + 0x2c) | 0) >>> 0)); // 4d1e03: fild dword ptr [esp + 0x2c]
        R.st[0] = R.st[0] * 0.03333333333333333; // 4d1e07: fmul qword ptr [0x969020]
        R.st[0] = R.st[0] + 2.0; // 4d1e0d: fadd qword ptr [0x968950]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); // 4d1e13: fst qword ptr [esp + 0x44]
        R.fpush(2.0); // 4d1e17: fld qword ptr [0x968950]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d1e1d: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1e1f: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d1e21: test ah, 0x41
        if (!R.zf) { pc = 0x4d1e66; continue; } // 4d1e24: jne 0x4d1e66
        pc = 0x4d1e26; continue;
      case 0x4d1e26:
        R.fpop(); // 4d1e26: fstp st(0)
        R.fpush(2.0); // 4d1e28: fld qword ptr [0x968950]
        pc = 0x4d1e62; continue; // 4d1e2e: jmp 0x4d1e62
      case 0x4d1e30:
        R.eax = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d1e30: movsx eax, si
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.eax >>> 0)); // 4d1e33: mov dword ptr [esp + 0x2c], eax
        R.fpush(R.m.s32(((R.esp + 0x2c) | 0) >>> 0)); // 4d1e37: fild dword ptr [esp + 0x2c]
        R.st[0] = R.st[0] * 0.02; // 4d1e3b: fmul qword ptr [0x968a98]
        R.st[0] = R.st[0] + 1.6; // 4d1e41: fadd qword ptr [0x969018]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); // 4d1e47: fst qword ptr [esp + 0x44]
        R.fpush(1.3); // 4d1e4b: fld qword ptr [0x968de8]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d1e51: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1e53: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d1e55: test ah, 0x41
        if (!R.zf) { pc = 0x4d1e66; continue; } // 4d1e58: jne 0x4d1e66
        pc = 0x4d1e5a; continue;
      case 0x4d1e5a:
        R.fpop(); // 4d1e5a: fstp st(0)
        R.fpush(1.3); // 4d1e5c: fld qword ptr [0x968de8]
        pc = 0x4d1e62; continue;
      case 0x4d1e62:
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); // 4d1e62: fst qword ptr [esp + 0x44]
        pc = 0x4d1e66; continue;
      case 0x4d1e66:
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 4d1e66: test edi, edi
        if (R.zf) { pc = 0x4d2006; continue; } // 4d1e68: je 0x4d2006
        pc = 0x4d1e6e; continue;
      case 0x4d1e6e:
        R.fcom(R.st[0], 1.3); // 4d1e6e: fcom qword ptr [0x968de8]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1e74: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d1e76: test ah, 1
        if (!R.zf) { pc = 0x4d2006; continue; } // 4d1e79: jne 0x4d2006
        pc = 0x4d1e7f; continue;
      case 0x4d1e7f:
        R.m.w8(((R.edi + 0x1) | 0) >>> 0, R.logic(R.m.u8(((R.edi + 0x1) | 0) >>> 0) | 0x8, 8)); // 4d1e7f: or byte ptr [edi + 1], 8
        pc = 0x4d2006; continue; // 4d1e83: jmp 0x4d2006
      case 0x4d1e88:
        R.sub((R.ebx >>> 0), R.m.u32(((R.ebp + 0xb3) | 0) >>> 0), 32); // 4d1e88: cmp ebx, dword ptr [ebp + 0xb3]
        if (R.zf) { pc = 0x4d1f24; continue; } // 4d1e8e: je 0x4d1f24
        pc = 0x4d1e94; continue;
      case 0x4d1e94:
        R.sub((R.ebx >>> 0), R.m.u32(((R.ebp + 0xb7) | 0) >>> 0), 32); // 4d1e94: cmp ebx, dword ptr [ebp + 0xb7]
        if (R.zf) { pc = 0x4d1f24; continue; } // 4d1e9a: je 0x4d1f24
        pc = 0x4d1ea0; continue;
      case 0x4d1ea0:
        R.sub((R.ebx >>> 0), R.m.u32(((R.ebp + 0xbb) | 0) >>> 0), 32); // 4d1ea0: cmp ebx, dword ptr [ebp + 0xbb]
        if (R.zf) { pc = 0x4d1f24; continue; } // 4d1ea6: je 0x4d1f24
        pc = 0x4d1ea8; continue;
      case 0x4d1ea8:
        R.eax = (R.m.u32(((R.ebx + 0x57) | 0) >>> 0)) | 0; // 4d1ea8: mov eax, dword ptr [ebx + 0x57]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d1eab: test eax, eax
        if (R.zf) { pc = 0x4d2002; continue; } // 4d1ead: je 0x4d2002
        pc = 0x4d1eb3; continue;
      case 0x4d1eb3:
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 4d1eb3: mov ecx, dword ptr [eax]
        R.edx = (R.m.u32(((0x9cf764) | 0) >>> 0)) | 0; // 4d1eb5: mov edx, dword ptr [0x9cf764]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 4d1ebb: cmp ecx, edx
        if (R.zf) { pc = 0x4d2002; continue; } // 4d1ebd: je 0x4d2002
        pc = 0x4d1ec3; continue;
      case 0x4d1ec3:
        R.sub((R.eax >>> 0), R.m.u32(((R.ebp + 0x57) | 0) >>> 0), 32); // 4d1ec3: cmp eax, dword ptr [ebp + 0x57]
        if (!R.zf) { pc = 0x4d2002; continue; } // 4d1ec6: jne 0x4d2002
        pc = 0x4d1ecc; continue;
      case 0x4d1ecc:
        R.edx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d1ecc: movsx edx, si
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.edx >>> 0)); // 4d1ecf: mov dword ptr [esp + 0x2c], edx
        R.fpush(R.m.s32(((R.esp + 0x2c) | 0) >>> 0)); // 4d1ed3: fild dword ptr [esp + 0x2c]
        R.st[0] = R.st[0] * 0.005; // 4d1ed7: fmul qword ptr [0x968ef0]
        R.st[0] = R.st[0] + 1.0; // 4d1edd: fadd qword ptr [0x967890]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); // 4d1ee3: fst qword ptr [esp + 0x44]
        R.fpush(1.0); // 4d1ee7: fld qword ptr [0x967890]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d1eed: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1eef: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d1ef1: test ah, 0x41
        if (!R.zf) { pc = 0x4d1f02; continue; } // 4d1ef4: jne 0x4d1f02
        pc = 0x4d1ef6; continue;
      case 0x4d1ef6:
        R.fpop(); // 4d1ef6: fstp st(0)
        R.fpush(1.0); // 4d1ef8: fld qword ptr [0x967890]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); // 4d1efe: fst qword ptr [esp + 0x44]
        pc = 0x4d1f02; continue;
      case 0x4d1f02:
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 4d1f02: test edi, edi
        if (R.zf) { pc = 0x4d2006; continue; } // 4d1f04: je 0x4d2006
        pc = 0x4d1f0a; continue;
      case 0x4d1f0a:
        R.fcom(R.st[0], 1.3); // 4d1f0a: fcom qword ptr [0x968de8]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1f10: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d1f12: test ah, 0x41
        if (!R.zf) { pc = 0x4d2006; continue; } // 4d1f15: jne 0x4d2006
        pc = 0x4d1f1b; continue;
      case 0x4d1f1b:
        R.m.w8(((R.edi + 0x1) | 0) >>> 0, R.logic(R.m.u8(((R.edi + 0x1) | 0) >>> 0) | 0x10, 8)); // 4d1f1b: or byte ptr [edi + 1], 0x10
        pc = 0x4d2006; continue; // 4d1f1f: jmp 0x4d2006
      case 0x4d1f24:
        R.ecx = (R.m.u32(((R.ebx + 0x69) | 0) >>> 0)) | 0; // 4d1f24: mov ecx, dword ptr [ebx + 0x69]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 4d1f27: test ecx, ecx
        if (R.zf) { pc = 0x4d1f68; continue; } // 4d1f29: je 0x4d1f68
        pc = 0x4d1f2b; continue;
      case 0x4d1f2b:
        R.eax = (R.m.u32(((R.ebp + 0x69) | 0) >>> 0)) | 0; // 4d1f2b: mov eax, dword ptr [ebp + 0x69]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d1f2e: test eax, eax
        if (R.zf) { pc = 0x4d1f68; continue; } // 4d1f30: je 0x4d1f68
        pc = 0x4d1f32; continue;
      case 0x4d1f32:
        R.ecx = (R.m.u32(((R.ecx + 0x38) | 0) >>> 0)) | 0; // 4d1f32: mov ecx, dword ptr [ecx + 0x38]
        R.edx = (R.m.u32(((R.eax + 0x38) | 0) >>> 0)) | 0; // 4d1f35: mov edx, dword ptr [eax + 0x38]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 4d1f38: cmp ecx, edx
        if (!R.zf) { pc = 0x4d1f68; continue; } // 4d1f3a: jne 0x4d1f68
        pc = 0x4d1f3c; continue;
      case 0x4d1f3c:
        R.edx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d1f3c: movsx edx, si
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.edx >>> 0)); // 4d1f3f: mov dword ptr [esp + 0x2c], edx
        R.fpush(R.m.s32(((R.esp + 0x2c) | 0) >>> 0)); // 4d1f43: fild dword ptr [esp + 0x2c]
        R.st[0] = R.st[0] * 0.02; // 4d1f47: fmul qword ptr [0x968a98]
        R.st[0] = R.st[0] + 1.6; // 4d1f4d: fadd qword ptr [0x969018]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); // 4d1f53: fst qword ptr [esp + 0x44]
        R.fpush(1.3); // 4d1f57: fld qword ptr [0x968de8]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d1f5d: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1f5f: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d1f61: test ah, 0x41
        if (!R.zf) { pc = 0x4d1f9e; continue; } // 4d1f64: jne 0x4d1f9e
        pc = 0x4d1f66; continue;
      case 0x4d1f66:
        pc = 0x4d1f92; continue; // 4d1f66: jmp 0x4d1f92
      case 0x4d1f68:
        R.eax = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d1f68: movsx eax, si
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.eax >>> 0)); // 4d1f6b: mov dword ptr [esp + 0x2c], eax
        R.fpush(R.m.s32(((R.esp + 0x2c) | 0) >>> 0)); // 4d1f6f: fild dword ptr [esp + 0x2c]
        R.st[0] = R.st[0] * 0.01; // 4d1f73: fmul qword ptr [0x967898]
        R.st[0] = R.st[0] + 1.3; // 4d1f79: fadd qword ptr [0x968de8]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); // 4d1f7f: fst qword ptr [esp + 0x44]
        R.fpush(1.3); // 4d1f83: fld qword ptr [0x968de8]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d1f89: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1f8b: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d1f8d: test ah, 0x41
        if (!R.zf) { pc = 0x4d1f9e; continue; } // 4d1f90: jne 0x4d1f9e
        pc = 0x4d1f92; continue;
      case 0x4d1f92:
        R.fpop(); // 4d1f92: fstp st(0)
        R.fpush(1.3); // 4d1f94: fld qword ptr [0x968de8]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); // 4d1f9a: fst qword ptr [esp + 0x44]
        pc = 0x4d1f9e; continue;
      case 0x4d1f9e:
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 4d1f9e: test edi, edi
        if (R.zf) { pc = 0x4d2006; continue; } // 4d1fa0: je 0x4d2006
        pc = 0x4d1fa2; continue;
      case 0x4d1fa2:
        R.fcom(R.st[0], 1.3); // 4d1fa2: fcom qword ptr [0x968de8]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1fa8: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d1faa: test ah, 1
        if (!R.zf) { pc = 0x4d2006; continue; } // 4d1fad: jne 0x4d2006
        pc = 0x4d1faf; continue;
      case 0x4d1faf:
        R.m.w8(((R.edi + 0x1) | 0) >>> 0, R.logic(R.m.u8(((R.edi + 0x1) | 0) >>> 0) | 0x8, 8)); // 4d1faf: or byte ptr [edi + 1], 8
        pc = 0x4d2006; continue; // 4d1fb3: jmp 0x4d2006
      case 0x4d1fb5:
        R.ecx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d1fb5: movsx ecx, si
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.ecx >>> 0)); // 4d1fb8: mov dword ptr [esp + 0x2c], ecx
        R.fpush(R.m.s32(((R.esp + 0x2c) | 0) >>> 0)); // 4d1fbc: fild dword ptr [esp + 0x2c]
        R.st[0] = R.st[0] * 0.04; // 4d1fc0: fmul qword ptr [0x968a90]
        R.st[0] = R.st[0] + 2.3; // 4d1fc6: fadd qword ptr [0x969010]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); // 4d1fcc: fst qword ptr [esp + 0x44]
        R.fpush(2.3); // 4d1fd0: fld qword ptr [0x969010]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d1fd6: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1fd8: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d1fda: test ah, 0x41
        if (!R.zf) { pc = 0x4d1feb; continue; } // 4d1fdd: jne 0x4d1feb
        pc = 0x4d1fdf; continue;
      case 0x4d1fdf:
        R.fpop(); // 4d1fdf: fstp st(0)
        R.fpush(2.3); // 4d1fe1: fld qword ptr [0x969010]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); // 4d1fe7: fst qword ptr [esp + 0x44]
        pc = 0x4d1feb; continue;
      case 0x4d1feb:
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 4d1feb: test edi, edi
        if (R.zf) { pc = 0x4d2006; continue; } // 4d1fed: je 0x4d2006
        pc = 0x4d1fef; continue;
      case 0x4d1fef:
        R.fcom(R.st[0], 1.3); // 4d1fef: fcom qword ptr [0x968de8]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1ff5: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d1ff7: test ah, 1
        if (!R.zf) { pc = 0x4d2006; continue; } // 4d1ffa: jne 0x4d2006
        pc = 0x4d1ffc; continue;
      case 0x4d1ffc:
        R.m.w8(((R.edi + 0x1) | 0) >>> 0, R.logic(R.m.u8(((R.edi + 0x1) | 0) >>> 0) | 0x8, 8)); // 4d1ffc: or byte ptr [edi + 1], 8
        pc = 0x4d2006; continue; // 4d2000: jmp 0x4d2006
      case 0x4d2002:
        R.fpush(R.f64(((R.esp + 0x44) | 0))); // 4d2002: fld qword ptr [esp + 0x44]
        pc = 0x4d2006; continue;
      case 0x4d2006:
        R.ecx = (((R.m.u16(((R.ebp + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d2006: movsx ecx, word ptr [ebp + 0x80]
        R.eax = (0x51eb851f) | 0; // 4d200d: mov eax, 0x51eb851f
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 4d2012: imul ecx
        R.edx = (R.sar((R.edx >>> 0), 0x4, 32)) | 0; // 4d2014: sar edx, 4
        R.eax = ((R.edx >>> 0)) | 0; // 4d2017: mov eax, edx
        R.eax = (R.shr((R.eax >>> 0), 0x1f, 32)) | 0; // 4d2019: shr eax, 0x1f
        R.eax = (((R.edx + R.eax + 0x1) | 0)) | 0; // 4d201c: lea eax, [edx + eax + 1]
        R.eax = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d2020: movsx eax, ax
        R.ecx = ((R.eax >>> 0)) | 0; // 4d2023: mov ecx, eax
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 4d2025: mov dword ptr [esp + 0x28], eax
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 4d2029: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 4d202c: add ecx, eax
        R.eax = (0x66666667) | 0; // 4d202e: mov eax, 0x66666667
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 4d2033: imul ecx
        R.edx = (R.sar((R.edx >>> 0), 0x3, 32)) | 0; // 4d2035: sar edx, 3
        R.ecx = ((R.edx >>> 0)) | 0; // 4d2038: mov ecx, edx
        R.ecx = (R.shr((R.ecx >>> 0), 0x1f, 32)) | 0; // 4d203a: shr ecx, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 4d203d: add edx, ecx
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 4d203f: test edi, edi
        if (R.zf) { pc = 0x4d205b; continue; } // 4d2041: je 0x4d205b
        pc = 0x4d2043; continue;
      case 0x4d2043:
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d2043: mov eax, dword ptr [esp + 0x18]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d2047: mov cl, byte ptr [eax + 0x4f]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d204a: and cl, 0xf0
        R.sub(((R.ecx >>> 0) & 0xff), 0x50, 8); // 4d204d: cmp cl, 0x50
        if (!R.zf) { pc = 0x4d205b; continue; } // 4d2050: jne 0x4d205b
        pc = 0x4d2052; continue;
      case 0x4d2052:
        R.m.w8(((R.edi + 0x1) | 0) >>> 0, R.logic(R.m.u8(((R.edi + 0x1) | 0) >>> 0) | 0x20, 8)); // 4d2052: or byte ptr [edi + 1], 0x20
        pc = 0x4d2124; continue; // 4d2056: jmp 0x4d2124
      case 0x4d205b:
        R.sub(R.m.u16(((R.esp + 0x20) | 0) >>> 0), ((R.edx >>> 0) & 0xffff), 16); // 4d205b: cmp word ptr [esp + 0x20], dx
        if (R.cLE) { pc = 0x4d2124; continue; } // 4d2060: jle 0x4d2124
        pc = 0x4d2066; continue;
      case 0x4d2066:
        R.eax = (R.m.u32(((R.esp + 0x98) | 0) >>> 0)) | 0; // 4d2066: mov eax, dword ptr [esp + 0x98]
        R.sub(R.m.u8(((R.eax + 0x18) | 0) >>> 0), 0x19, 8); // 4d206d: cmp byte ptr [eax + 0x18], 0x19
        if (!R.cL) { pc = 0x4d2124; continue; } // 4d2071: jge 0x4d2124
        pc = 0x4d2077; continue;
      case 0x4d2077:
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d2077: mov ecx, dword ptr [esp + 0x18]
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.ecx + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d207b: mov bl, byte ptr [ecx + 0x4f]
        R.eax = ((R.eax & 0xffffff00) | (((((R.ebx >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 4d207e: mov al, bl
        R.eax = ((R.eax & 0xffffff00) | (((R.shr(((R.eax >>> 0) & 0xff), 0x4, 8)) & 0xff) << 0)) | 0; // 4d2080: shr al, 4
        R.sub(((R.eax >>> 0) & 0xff), 0x7, 8); // 4d2083: cmp al, 7
        if (!R.cL) { pc = 0x4d2124; continue; } // 4d2085: jge 0x4d2124
        pc = 0x4d208b; continue;
      case 0x4d208b:
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 4d208b: test edi, edi
        if (R.zf) { pc = 0x4d20a2; continue; } // 4d208d: je 0x4d20a2
        pc = 0x4d208f; continue;
      case 0x4d208f:
        R.ecx = ((R.ecx & 0xffffff00) | (((((R.ebx >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 4d208f: mov cl, bl
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d2091: and cl, 0xf0
        R.sub(((R.ecx >>> 0) & 0xff), 0x60, 8); // 4d2094: cmp cl, 0x60
        if (!R.zf) { pc = 0x4d20a2; continue; } // 4d2097: jne 0x4d20a2
        pc = 0x4d2099; continue;
      case 0x4d2099:
        R.m.w8(((R.edi + 0x1) | 0) >>> 0, R.logic(R.m.u8(((R.edi + 0x1) | 0) >>> 0) | 0x20, 8)); // 4d2099: or byte ptr [edi + 1], 0x20
        pc = 0x4d2124; continue; // 4d209d: jmp 0x4d2124
      case 0x4d20a2:
        R.eax = (((R.m.u16(((R.esp + 0x20) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d20a2: movsx eax, word ptr [esp + 0x20]
        R.edx = (((((R.edx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d20a7: movsx edx, dx
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 4d20aa: sub eax, edx
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.eax >>> 0)); // 4d20ac: mov dword ptr [esp + 0x2c], eax
        R.fpush(R.m.s32(((R.esp + 0x2c) | 0) >>> 0)); // 4d20b0: fild dword ptr [esp + 0x2c]
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 4d20b4: fild dword ptr [esp + 0x28]
        R.st[0] = R.st[0] * 0.005; // 4d20b8: fmul qword ptr [0x968ef0]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 4d20be: fmulp st(1)
        R.ftol(); // 4d20c0: call 0x945640
        R.ecx = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d20c5: movsx ecx, ax
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.ecx >>> 0)); // 4d20c8: mov dword ptr [esp + 0x2c], ecx
        R.fpush(R.m.s32(((R.esp + 0x2c) | 0) >>> 0)); // 4d20cc: fild dword ptr [esp + 0x2c]
        R.st[0] = R.st[0] * 0.04; // 4d20d0: fmul qword ptr [0x968a90]
        R.st[0] = R.st[0] + 1.0; // 4d20d6: fadd qword ptr [0x967890]
        R.fcom(R.st[0], 1.0); // 4d20dc: fcom qword ptr [0x967890]
        R.m.wf64(((R.esp + 0x54) | 0) >>> 0, R.st[0]); // 4d20e2: fst qword ptr [esp + 0x54]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d20e6: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d20e8: test ah, 1
        if (R.zf) { pc = 0x4d20f9; continue; } // 4d20eb: je 0x4d20f9
        pc = 0x4d20ed; continue;
      case 0x4d20ed:
        R.fpop(); // 4d20ed: fstp st(0)
        R.fpush(1.0); // 4d20ef: fld qword ptr [0x967890]
        R.m.wf64(((R.esp + 0x54) | 0) >>> 0, R.st[0]); // 4d20f5: fst qword ptr [esp + 0x54]
        pc = 0x4d20f9; continue;
      case 0x4d20f9:
        R.ebx = ((R.ebx & 0xffffff00) | (((R.logic(((R.ebx >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d20f9: and bl, 0xf0
        R.sub(((R.ebx >>> 0) & 0xff), 0x40, 8); // 4d20fc: cmp bl, 0x40
        if (!R.zf) { pc = 0x4d210b; continue; } // 4d20ff: jne 0x4d210b
        pc = 0x4d2101; continue;
      case 0x4d2101:
        R.fpush(R.f64(((R.esp + 0x5c) | 0))); // 4d2101: fld qword ptr [esp + 0x5c]
        R.st[0] = R.st[0] * R.st[1]; // 4d2105: fmul st(1)
        R.m.wf64(((R.esp + 0x5c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2107: fstp qword ptr [esp + 0x5c]
        pc = 0x4d210b; continue;
      case 0x4d210b:
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 4d210b: test edi, edi
        if (R.zf) { pc = 0x4d2122; continue; } // 4d210d: je 0x4d2122
        pc = 0x4d210f; continue;
      case 0x4d210f:
        R.fcom(R.st[0], 1.6); R.fpop(); // 4d210f: fcomp qword ptr [0x969018]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2115: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d2117: test ah, 0x41
        if (!R.zf) { pc = 0x4d2124; continue; } // 4d211a: jne 0x4d2124
        pc = 0x4d211c; continue;
      case 0x4d211c:
        R.m.w8(((R.edi + 0x1) | 0) >>> 0, R.logic(R.m.u8(((R.edi + 0x1) | 0) >>> 0) | 0x20, 8)); // 4d211c: or byte ptr [edi + 1], 0x20
        pc = 0x4d2124; continue; // 4d2120: jmp 0x4d2124
      case 0x4d2122:
        R.fpop(); // 4d2122: fstp st(0)
        pc = 0x4d2124; continue;
      case 0x4d2124:
        R.fpush(R.st[0]); // 4d2124: fld st(0)
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 4d2126: fmulp st(1)
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x4c) | 0)); // 4d2128: fmul qword ptr [esp + 0x4c]
        R.fpush(4.25); // 4d212c: fld qword ptr [0x969008]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d2132: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2134: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d2136: test ah, 0x41
        if (!R.zf) { pc = 0x4d2145; continue; } // 4d2139: jne 0x4d2145
        pc = 0x4d213b; continue;
      case 0x4d213b:
        R.fpop(); // 4d213b: fstp st(0)
        R.fpush(4.25); // 4d213d: fld qword ptr [0x969008]
        pc = 0x4d215c; continue; // 4d2143: jmp 0x4d215c
      case 0x4d2145:
        R.fpush(10.0); // 4d2145: fld qword ptr [0x9688b0]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d214b: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d214d: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d214f: test ah, 1
        if (R.zf) { pc = 0x4d215c; continue; } // 4d2152: je 0x4d215c
        pc = 0x4d2154; continue;
      case 0x4d2154:
        R.fpop(); // 4d2154: fstp st(0)
        R.fpush(10.0); // 4d2156: fld qword ptr [0x9688b0]
        pc = 0x4d215c; continue;
      case 0x4d215c:
        R.fpush(R.f64(((R.esp + 0x38) | 0))); // 4d215c: fld qword ptr [esp + 0x38]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x5c) | 0)); // 4d2160: fmul qword ptr [esp + 0x5c]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x84) | 0)); // 4d2164: fmul qword ptr [esp + 0x84]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x54) | 0)); // 4d216b: fmul qword ptr [esp + 0x54]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x44) | 0)); // 4d216f: fmul qword ptr [esp + 0x44]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x4c) | 0)); // 4d2173: fmul qword ptr [esp + 0x4c]
        R.m.wf64(((R.esp + 0x5c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2177: fstp qword ptr [esp + 0x5c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x5c) | 0))); // 4d217b: fcom qword ptr [esp + 0x5c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d217f: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d2181: test ah, 1
        if (R.zf) { pc = 0x4d218c; continue; } // 4d2184: je 0x4d218c
        pc = 0x4d2186; continue;
      case 0x4d2186:
        R.m.wf64(((R.esp + 0x5c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2186: fstp qword ptr [esp + 0x5c]
        pc = 0x4d219e; continue; // 4d218a: jmp 0x4d219e
      case 0x4d218c:
        R.edx = (R.m.u32(((R.esp + 0x5c) | 0) >>> 0)) | 0; // 4d218c: mov edx, dword ptr [esp + 0x5c]
        R.eax = (R.m.u32(((R.esp + 0x60) | 0) >>> 0)) | 0; // 4d2190: mov eax, dword ptr [esp + 0x60]
        R.fpop(); // 4d2194: fstp st(0)
        R.m.w32(((R.esp + 0x5c) | 0) >>> 0, (R.edx >>> 0)); // 4d2196: mov dword ptr [esp + 0x5c], edx
        R.m.w32(((R.esp + 0x60) | 0) >>> 0, (R.eax >>> 0)); // 4d219a: mov dword ptr [esp + 0x60], eax
        pc = 0x4d219e; continue;
      case 0x4d219e:
        R.fpush(R.f64(((R.esp + 0x38) | 0))); // 4d219e: fld qword ptr [esp + 0x38]
        R.st[0] = R.st[0] * 6.0; // 4d21a2: fmul qword ptr [0x969000]
        R.fpush(R.f64(((R.esp + 0x5c) | 0))); // 4d21a8: fld qword ptr [esp + 0x5c]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d21ac: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d21ae: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d21b0: test ah, 0x41
        if (!R.zf) { pc = 0x4d21bb; continue; } // 4d21b3: jne 0x4d21bb
        pc = 0x4d21b5; continue;
      case 0x4d21b5:
        R.m.wf64(((R.esp + 0x5c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d21b5: fstp qword ptr [esp + 0x5c]
        pc = 0x4d21bd; continue; // 4d21b9: jmp 0x4d21bd
      case 0x4d21bb:
        R.fpop(); // 4d21bb: fstp st(0)
        pc = 0x4d21bd; continue;
      case 0x4d21bd:
        R.ecx = (R.m.u32(((R.esp + 0x98) | 0) >>> 0)) | 0; // 4d21bd: mov ecx, dword ptr [esp + 0x98]
        R.eax = (R.m.u32(((R.ecx + 0x61) | 0) >>> 0)) | 0; // 4d21c4: mov eax, dword ptr [ecx + 0x61]
        R.edx = (((R.m.u16(((R.eax + 0xb) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d21c7: movsx edx, word ptr [eax + 0xb]
        R.ecx = (((R.m.u16(((R.eax + 0x9) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d21cb: movsx ecx, word ptr [eax + 9]
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.edx >>> 0)); // 4d21cf: mov dword ptr [esp + 0x2c], edx
        R.fpush(R.m.s32(((R.esp + 0x2c) | 0) >>> 0)); // 4d21d3: fild dword ptr [esp + 0x2c]
        R.edx = (((R.m.u16(((R.eax + 0xd) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d21d7: movsx edx, word ptr [eax + 0xd]
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.ecx >>> 0)); // 4d21db: mov dword ptr [esp + 0x2c], ecx
        R.fpush(R.m.s32(((R.esp + 0x2c) | 0) >>> 0)); // 4d21df: fild dword ptr [esp + 0x2c]
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.edx >>> 0)); // 4d21e3: mov dword ptr [esp + 0x2c], edx
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 4d21e7: faddp st(1)
        R.st[0] = R.st[0] * 0.3; // 4d21e9: fmul qword ptr [0x968e80]
        R.fpush(R.m.s32(((R.esp + 0x2c) | 0) >>> 0)); // 4d21ef: fild dword ptr [esp + 0x2c]
        R.st[0] = R.st[0] * 0.4; // 4d21f3: fmul qword ptr [0x968e00]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 4d21f9: faddp st(1)
        R.ftol(); // 4d21fb: call 0x945640
        R.ecx = (((R.m.u16(((R.ebp + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d2200: movsx ecx, word ptr [ebp + 0x80]
        R.eax = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d2207: movsx eax, ax
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.eax >>> 0)); // 4d220a: mov dword ptr [esp + 0x2c], eax
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.ecx >>> 0)); // 4d220e: mov dword ptr [esp + 0x38], ecx
        R.eax = (((R.ecx + R.eax + -0xfa0) | 0)) | 0; // 4d2212: lea eax, [ecx + eax - 0xfa0]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4d2219: lea eax, [eax + eax*4]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4d221c: lea eax, [eax + eax*4]
        R.eax = (((R.eax + R.eax * 8) | 0)) | 0; // 4d221f: lea eax, [eax + eax*8]
        R.sub((R.eax >>> 0), 0x249f0, 32); // 4d2222: cmp eax, 0x249f0
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 4d2227: mov dword ptr [esp + 0x28], eax
        if (!R.cL) { pc = 0x4d2237; continue; } // 4d222b: jge 0x4d2237
        pc = 0x4d222d; continue;
      case 0x4d222d:
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0x249f0); // 4d222d: mov dword ptr [esp + 0x28], 0x249f0
        pc = 0x4d2246; continue; // 4d2235: jmp 0x4d2246
      case 0x4d2237:
        R.sub((R.eax >>> 0), 0x1e8480, 32); // 4d2237: cmp eax, 0x1e8480
        if (R.cLE) { pc = 0x4d2246; continue; } // 4d223c: jle 0x4d2246
        pc = 0x4d223e; continue;
      case 0x4d223e:
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0x1e8480); // 4d223e: mov dword ptr [esp + 0x28], 0x1e8480
        pc = 0x4d2246; continue;
      case 0x4d2246:
        R.fpush(R.f64(((R.esp + 0x6c) | 0))); // 4d2246: fld qword ptr [esp + 0x6c]
        R.st[0] = R.st[0] * 0.5; // 4d224a: fmul qword ptr [0x968968]
        R.st[0] = R.st[0] + 50.0; // 4d2250: fadd qword ptr [0x968ff8]
        R.fpush(R.m.s32(((R.esp + 0x2c) | 0) >>> 0)); // 4d2256: fild dword ptr [esp + 0x2c]
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d225a: fild dword ptr [esp + 0x38]
        R.st[0] = R.st[0] * 1.2; // 4d225e: fmul qword ptr [0x968978]
        R.st[0] = R.st[0] - 2000.0; // 4d2264: fsub qword ptr [0x9688f8]
        R.st[0] = R.st[1] - R.st[0]; // 4d226a: fsubr st(1)
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 4d226c: fxch st(1)
        R.st[0] = R.st[0] * 5e-08; // 4d226e: fmul qword ptr [0x968ff0]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 4d2274: fmulp st(1)
        R.st[0] = R.st[0] + 1.0; // 4d2276: fadd qword ptr [0x967890]
        R.st[0] = R.st[0] * R.st[1]; // 4d227c: fmul st(1)
        R.st[0] = R.st[0] + 100.0; // 4d227e: fadd qword ptr [0x9688a8]
        R.st[0] = R.st[0] - R.st[1]; // 4d2284: fsub st(1)
        R.st[0] = R.st[0] * 0.01; // 4d2286: fmul qword ptr [0x967898]
        R.m.wf64(((R.esp + 0x2c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d228c: fstp qword ptr [esp + 0x2c]
        R.fpop(); // 4d2290: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x2c) | 0))); // 4d2292: fld qword ptr [esp + 0x2c]
        R.fcom(R.st[0], 1.0); R.fpop(); // 4d2296: fcomp qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d229c: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d229e: test ah, 0x41
        if (!R.zf) { pc = 0x4d22b6; continue; } // 4d22a1: jne 0x4d22b6
        pc = 0x4d22a3; continue;
      case 0x4d22a3:
        R.fpush(R.f64(((R.esp + 0x2c) | 0))); // 4d22a3: fld qword ptr [esp + 0x2c]
        R.fpush(5.0); // 4d22a7: fld qword ptr [0x9688a0]
        R.call(0x945ff0, { n: 0, thisEcx: false, calleeClean: false, float: true }); // 4d22ad: call 0x945ff0
        R.m.wf64(((R.esp + 0x2c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d22b2: fstp qword ptr [esp + 0x2c]
        pc = 0x4d22b6; continue;
      case 0x4d22b6:
        R.fpush(1.0); // 4d22b6: fld qword ptr [0x967890]
        R.fcom(R.st[0], R.f64(((R.esp + 0x2c) | 0))); R.fpop(); // 4d22bc: fcomp qword ptr [esp + 0x2c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d22c0: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d22c2: test ah, 0x41
        if (!R.zf) { pc = 0x4d22d9; continue; } // 4d22c5: jne 0x4d22d9
        pc = 0x4d22c7; continue;
      case 0x4d22c7:
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, 0x0); // 4d22c7: mov dword ptr [esp + 0x2c], 0
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, 0x3ff00000); // 4d22cf: mov dword ptr [esp + 0x30], 0x3ff00000
        pc = 0x4d22fa; continue; // 4d22d7: jmp 0x4d22fa
      case 0x4d22d9:
        R.fpush(3.0); // 4d22d9: fld qword ptr [0x968930]
        R.fcom(R.st[0], R.f64(((R.esp + 0x2c) | 0))); R.fpop(); // 4d22df: fcomp qword ptr [esp + 0x2c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d22e3: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d22e5: test ah, 1
        if (R.zf) { pc = 0x4d22fa; continue; } // 4d22e8: je 0x4d22fa
        pc = 0x4d22ea; continue;
      case 0x4d22ea:
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, 0x0); // 4d22ea: mov dword ptr [esp + 0x2c], 0
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, 0x40080000); // 4d22f2: mov dword ptr [esp + 0x30], 0x40080000
        pc = 0x4d22fa; continue;
      case 0x4d22fa:
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 4d22fa: fild dword ptr [esp + 0x28]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x5c) | 0)); // 4d22fe: fmul qword ptr [esp + 0x5c]
        R.ftol(); // 4d2302: call 0x945640
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2307: fild dword ptr [esp + 0x14]
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.eax >>> 0)); // 4d230b: mov dword ptr [esp + 0x38], eax
        R.m.wf64(((R.esp + 0x54) | 0) >>> 0, R.st[0]); // 4d230f: fst qword ptr [esp + 0x54]
        R.fpush(R.st[0]); // 4d2313: fld st(0)
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x5c) | 0)); // 4d2315: fmul qword ptr [esp + 0x5c]
        R.st[0] = R.st[0] - R.st[1]; // 4d2319: fsub st(1)
        R.ftol(); // 4d231b: call 0x945640
        R.fpop(); // 4d2320: fstp st(0)
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 4d2322: mov dword ptr [esp + 0x28], eax
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 4d2326: fild dword ptr [esp + 0x28]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d232a: test eax, eax
        if (!R.cL) { pc = 0x4d2373; continue; } // 4d232c: jge 0x4d2373
        pc = 0x4d232e; continue;
      case 0x4d232e:
        R.fpush(R.f64(((R.esp + 0x54) | 0))); // 4d232e: fld qword ptr [esp + 0x54]
        R.st[0] = R.st[0] * -0.4; // 4d2332: fmul qword ptr [0x968fe8]
        R.m.wf64(((R.esp + 0x84) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2338: fstp qword ptr [esp + 0x84]
        R.fcom(R.st[0], R.f64(((R.esp + 0x84) | 0))); // 4d233f: fcom qword ptr [esp + 0x84]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2346: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d2348: test ah, 0x41
        if (R.zf) { pc = 0x4d2356; continue; } // 4d234b: je 0x4d2356
        pc = 0x4d234d; continue;
      case 0x4d234d:
        R.fpop(); // 4d234d: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x84) | 0))); // 4d234f: fld qword ptr [esp + 0x84]
        pc = 0x4d2356; continue;
      case 0x4d2356:
        R.ftol(); // 4d2356: call 0x945640
        R.esi = ((R.eax >>> 0)) | 0; // 4d235b: mov esi, eax
        R.sub((R.esi >>> 0), 0xffd23940, 32); // 4d235d: cmp esi, 0xffd23940
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.esi >>> 0)); // 4d2363: mov dword ptr [esp + 0x28], esi
        if (!R.cL) { pc = 0x4d23d8; continue; } // 4d2367: jge 0x4d23d8
        pc = 0x4d2369; continue;
      case 0x4d2369:
        R.esi = (0xffd23940) | 0; // 4d2369: mov esi, 0xffd23940
        pc = 0x4d2410; continue; // 4d236e: jmp 0x4d2410
      case 0x4d2373:
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x4c) | 0)); // 4d2373: fmul qword ptr [esp + 0x4c]
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2377: fild dword ptr [esp + 0x38]
        R.m.wf64(((R.esp + 0x84) | 0) >>> 0, R.st[0]); R.fpop(); // 4d237b: fstp qword ptr [esp + 0x84]
        R.fcom(R.st[0], R.f64(((R.esp + 0x84) | 0))); // 4d2382: fcom qword ptr [esp + 0x84]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2389: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d238b: test ah, 1
        if (!R.zf) { pc = 0x4d2399; continue; } // 4d238e: jne 0x4d2399
        pc = 0x4d2390; continue;
      case 0x4d2390:
        R.fpop(); // 4d2390: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x84) | 0))); // 4d2392: fld qword ptr [esp + 0x84]
        pc = 0x4d2399; continue;
      case 0x4d2399:
        R.ftol(); // 4d2399: call 0x945640
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d239e: fld qword ptr [esp + 0x4c]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x4c) | 0)); // 4d23a2: fmul qword ptr [esp + 0x4c]
        R.fpush(25.0); // 4d23a6: fld qword ptr [0x968890]
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 4d23ac: mov dword ptr [esp + 0x28], eax
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d23b0: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d23b2: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d23b4: test ah, 1
        if (R.zf) { pc = 0x4d23c1; continue; } // 4d23b7: je 0x4d23c1
        pc = 0x4d23b9; continue;
      case 0x4d23b9:
        R.fpop(); // 4d23b9: fstp st(0)
        R.fpush(25.0); // 4d23bb: fld qword ptr [0x968890]
        pc = 0x4d23c1; continue;
      case 0x4d23c1:
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x64) | 0)); // 4d23c1: fmul qword ptr [esp + 0x64]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x74) | 0)); // 4d23c5: fmul qword ptr [esp + 0x74]
        R.st[0] = R.st[0] * R.m.s32(((R.esp + 0x28) | 0) >>> 0); // 4d23c9: fimul dword ptr [esp + 0x28]
        R.ftol(); // 4d23cd: call 0x945640
        R.esi = ((R.eax >>> 0)) | 0; // 4d23d2: mov esi, eax
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.esi >>> 0)); // 4d23d4: mov dword ptr [esp + 0x28], esi
        pc = 0x4d23d8; continue;
      case 0x4d23d8:
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 4d23d8: test esi, esi
        if (R.cLE) { pc = 0x4d2403; continue; } // 4d23da: jle 0x4d2403
        pc = 0x4d23dc; continue;
      case 0x4d23dc:
        R.eax = (R.m.u32(((R.esp + 0x98) | 0) >>> 0)) | 0; // 4d23dc: mov eax, dword ptr [esp + 0x98]
        R.push(0x0); // 4d23e3: push 0
        R.push((R.eax >>> 0)); // 4d23e5: push eax
        R.call(0x544520, { n: 2, thisEcx: false, calleeClean: false }); // 4d23e6: call 0x544520
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 4d23eb: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d23ee: test eax, eax
        if (R.zf) { pc = 0x4d2403; continue; } // 4d23f0: je 0x4d2403
        pc = 0x4d23f2; continue;
      case 0x4d23f2:
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 4d23f2: fild dword ptr [esp + 0x28]
        R.st[0] = R.st[0] * 0.5; // 4d23f6: fmul qword ptr [0x968968]
        R.ftol(); // 4d23fc: call 0x945640
        R.esi = ((R.eax >>> 0)) | 0; // 4d2401: mov esi, eax
        pc = 0x4d2403; continue;
      case 0x4d2403:
        R.sub((R.esi >>> 0), 0x2faf080, 32); // 4d2403: cmp esi, 0x2faf080
        if (R.cLE) { pc = 0x4d2410; continue; } // 4d2409: jle 0x4d2410
        pc = 0x4d240b; continue;
      case 0x4d240b:
        R.esi = (0x2faf080) | 0; // 4d240b: mov esi, 0x2faf080
        pc = 0x4d2410; continue;
      case 0x4d2410:
        R.fpush(R.f64(((R.esp + 0x2c) | 0))); // 4d2410: fld qword ptr [esp + 0x2c]
        R.fcom(R.st[0], 1.0); R.fpop(); // 4d2414: fcomp qword ptr [0x967890]
        R.ebx = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 4d241a: mov ebx, dword ptr [esp + 0x14]
        R.ebx = (R.add((R.ebx >>> 0), (R.esi >>> 0), 32)) | 0; // 4d241e: add ebx, esi
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.ebx >>> 0)); // 4d2420: mov dword ptr [esp + 0x14], ebx
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2424: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d2426: test ah, 0x41
        if (!R.zf) { pc = 0x4d2499; continue; } // 4d2429: jne 0x4d2499
        pc = 0x4d242b; continue;
      case 0x4d242b:
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d242b: fild dword ptr [esp + 0x14]
        R.fpush(R.st[0]); // 4d242f: fld st(0)
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x2c) | 0)); // 4d2431: fmul qword ptr [esp + 0x2c]
        R.st[0] = R.st[0] - R.st[1]; // 4d2435: fsub st(1)
        R.ftol(); // 4d2437: call 0x945640
        R.sub((R.eax >>> 0), 0x4c4b40, 32); // 4d243c: cmp eax, 0x4c4b40
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 4d2441: mov dword ptr [esp + 0x28], eax
        R.fpop(); // 4d2445: fstp st(0)
        if (R.cLE) { pc = 0x4d2462; continue; } // 4d2447: jle 0x4d2462
        pc = 0x4d2449; continue;
      case 0x4d2449:
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 4d2449: fild dword ptr [esp + 0x28]
        R.st[0] = R.st[0] * 0.625; // 4d244d: fmul qword ptr [0x968fe0]
        R.st[0] = R.st[0] + 1875000.0; // 4d2453: fadd qword ptr [0x968fd8]
        R.ftol(); // 4d2459: call 0x945640
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 4d245e: mov dword ptr [esp + 0x28], eax
        pc = 0x4d2462; continue;
      case 0x4d2462:
        R.sub((R.eax >>> 0), 0x989680, 32); // 4d2462: cmp eax, 0x989680
        if (R.cLE) { pc = 0x4d2482; continue; } // 4d2467: jle 0x4d2482
        pc = 0x4d2469; continue;
      case 0x4d2469:
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 4d2469: fild dword ptr [esp + 0x28]
        R.st[0] = R.st[0] * 0.125; // 4d246d: fmul qword ptr [0x968fd0]
        R.st[0] = R.st[0] + 8750000.0; // 4d2473: fadd qword ptr [0x968fc8]
        R.ftol(); // 4d2479: call 0x945640
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 4d247e: mov dword ptr [esp + 0x28], eax
        pc = 0x4d2482; continue;
      case 0x4d2482:
        R.fpush(R.f64(((R.esp + 0x64) | 0))); // 4d2482: fld qword ptr [esp + 0x64]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x74) | 0)); // 4d2486: fmul qword ptr [esp + 0x74]
        R.st[0] = R.st[0] * R.m.s32(((R.esp + 0x28) | 0) >>> 0); // 4d248a: fimul dword ptr [esp + 0x28]
        R.ftol(); // 4d248e: call 0x945640
        R.ebx = (R.add((R.ebx >>> 0), (R.eax >>> 0), 32)) | 0; // 4d2493: add ebx, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.ebx >>> 0)); // 4d2495: mov dword ptr [esp + 0x14], ebx
        pc = 0x4d2499; continue;
      case 0x4d2499:
        R.sub((R.ebx >>> 0), 0x3e8, 32); // 4d2499: cmp ebx, 0x3e8
        if (!R.cL) { pc = 0x4d24aa; continue; } // 4d249f: jge 0x4d24aa
        pc = 0x4d24a1; continue;
      case 0x4d24a1:
        R.ebx = (0x3e8) | 0; // 4d24a1: mov ebx, 0x3e8
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.ebx >>> 0)); // 4d24a6: mov dword ptr [esp + 0x14], ebx
        pc = 0x4d24aa; continue;
      case 0x4d24aa:
        R.esi = (R.m.u32(((R.esp + 0x98) | 0) >>> 0)) | 0; // 4d24aa: mov esi, dword ptr [esp + 0x98]
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 4d24b1: mov ecx, dword ptr [0xde1f54]
        R.push(0x0); // 4d24b7: push 0
        R.push((R.ebp >>> 0)); // 4d24b9: push ebp
        R.push((R.esi >>> 0)); // 4d24ba: push esi
        R.call(0x8c7560, { n: 3, thisEcx: true, calleeClean: true }); // 4d24bb: call 0x8c7560
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d24c0: test eax, eax
        if (R.zf) { pc = 0x4d24d5; continue; } // 4d24c2: je 0x4d24d5
        pc = 0x4d24c4; continue;
      case 0x4d24c4:
        R.eax = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 4d24c4: mov eax, dword ptr [esp + 0x1c]
        R.sub((R.ebx >>> 0), (R.eax >>> 0), 32); // 4d24c8: cmp ebx, eax
        if (R.cL) { pc = 0x4d2585; continue; } // 4d24ca: jl 0x4d2585
        pc = 0x4d24d0; continue;
      case 0x4d24d0:
        pc = 0x4d257f; continue; // 4d24d0: jmp 0x4d257f
      case 0x4d24d5:
        R.push(0x0); // 4d24d5: push 0
        R.push((R.esi >>> 0)); // 4d24d7: push esi
        R.call(0x544520, { n: 2, thisEcx: false, calleeClean: false }); // 4d24d8: call 0x544520
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 4d24dd: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d24e0: test eax, eax
        if (R.zf) { pc = 0x4d250f; continue; } // 4d24e2: je 0x4d250f
        pc = 0x4d24e4; continue;
      case 0x4d24e4:
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 4d24e4: test edi, edi
        if (R.zf) { pc = 0x4d24f3; continue; } // 4d24e6: je 0x4d24f3
        pc = 0x4d24e8; continue;
      case 0x4d24e8:
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.edi) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 4d24e8: mov cx, word ptr [edi]
        R.ecx = ((R.ecx & 0xffff0000) | (((R.logic(((R.ecx >>> 0) & 0xffff) & 0x800, 16)) & 0xffff) << 0)) | 0; // 4d24eb: and cx, 0x800
        R.m.w16(((R.edi) | 0) >>> 0, ((R.ecx >>> 0) & 0xffff)); // 4d24f0: mov word ptr [edi], cx
        pc = 0x4d24f3; continue;
      case 0x4d24f3:
        R.fpush(R.m.s32(((R.esi + 0x52) | 0) >>> 0)); // 4d24f3: fild dword ptr [esi + 0x52]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x44) | 0)); // 4d24f6: fmul qword ptr [esp + 0x44]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d24fa: fild dword ptr [esp + 0x14]
        R.m.wf64(((R.esp + 0x54) | 0) >>> 0, R.st[0]); R.fpop(); // 4d24fe: fstp qword ptr [esp + 0x54]
        R.fcom(R.st[0], R.f64(((R.esp + 0x54) | 0))); // 4d2502: fcom qword ptr [esp + 0x54]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2506: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d2508: test ah, 1
        if (!R.zf) { pc = 0x4d257a; continue; } // 4d250b: jne 0x4d257a
        pc = 0x4d250d; continue;
      case 0x4d250d:
        pc = 0x4d2574; continue; // 4d250d: jmp 0x4d2574
      case 0x4d250f:
        R.eax = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 4d250f: mov eax, dword ptr [esi + 0x39]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d2512: test eax, eax
        if (R.zf) { pc = 0x4d2585; continue; } // 4d2514: je 0x4d2585
        pc = 0x4d2516; continue;
      case 0x4d2516:
        R.edx = (((R.esp + 0x40) | 0)) | 0; // 4d2516: lea edx, [esp + 0x40]
        R.push(0x1); // 4d251a: push 1
        R.push((R.edx >>> 0)); // 4d251c: push edx
        R.push((R.eax >>> 0)); // 4d251d: push eax
        R.call(0x540a50, { n: 3, thisEcx: false, calleeClean: false }); // 4d251e: call 0x540a50
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 4d2523: add esp, 0xc
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d2526: test eax, eax
        if (R.zf) { pc = 0x4d2585; continue; } // 4d2528: je 0x4d2585
        pc = 0x4d252a; continue;
      case 0x4d252a:
        R.eax = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 4d252a: mov eax, dword ptr [esp + 0x40]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d252e: test eax, eax
        if (!R.zf) { pc = 0x4d2585; continue; } // 4d2530: jne 0x4d2585
        pc = 0x4d2532; continue;
      case 0x4d2532:
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d2532: mov eax, dword ptr [esp + 0x18]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d2536: mov al, byte ptr [eax + 0x4f]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d2539: and al, 0xf0
        R.sub(((R.eax >>> 0) & 0xff), 0x10, 8); // 4d253b: cmp al, 0x10
        if (R.zf) { pc = 0x4d2585; continue; } // 4d253d: je 0x4d2585
        pc = 0x4d253f; continue;
      case 0x4d253f:
        R.sub(((R.eax >>> 0) & 0xff), 0x50, 8); // 4d253f: cmp al, 0x50
        if (R.zf) { pc = 0x4d2585; continue; } // 4d2541: je 0x4d2585
        pc = 0x4d2543; continue;
      case 0x4d2543:
        R.sub(((R.eax >>> 0) & 0xff), 0x20, 8); // 4d2543: cmp al, 0x20
        if (R.zf) { pc = 0x4d2585; continue; } // 4d2545: je 0x4d2585
        pc = 0x4d2547; continue;
      case 0x4d2547:
        R.sub(((R.eax >>> 0) & 0xff), 0x30, 8); // 4d2547: cmp al, 0x30
        if (R.zf) { pc = 0x4d2585; continue; } // 4d2549: je 0x4d2585
        pc = 0x4d254b; continue;
      case 0x4d254b:
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 4d254b: test edi, edi
        if (R.zf) { pc = 0x4d255a; continue; } // 4d254d: je 0x4d255a
        pc = 0x4d254f; continue;
      case 0x4d254f:
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.edi) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 4d254f: mov cx, word ptr [edi]
        R.ecx = ((R.ecx & 0xffff0000) | (((R.logic(((R.ecx >>> 0) & 0xffff) & 0x800, 16)) & 0xffff) << 0)) | 0; // 4d2552: and cx, 0x800
        R.m.w16(((R.edi) | 0) >>> 0, ((R.ecx >>> 0) & 0xffff)); // 4d2557: mov word ptr [edi], cx
        pc = 0x4d255a; continue;
      case 0x4d255a:
        R.fpush(R.m.s32(((R.esi + 0x52) | 0) >>> 0)); // 4d255a: fild dword ptr [esi + 0x52]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x44) | 0)); // 4d255d: fmul qword ptr [esp + 0x44]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2561: fild dword ptr [esp + 0x14]
        R.m.wf64(((R.esp + 0x54) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2565: fstp qword ptr [esp + 0x54]
        R.fcom(R.st[0], R.f64(((R.esp + 0x54) | 0))); // 4d2569: fcom qword ptr [esp + 0x54]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d256d: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d256f: test ah, 1
        if (!R.zf) { pc = 0x4d257a; continue; } // 4d2572: jne 0x4d257a
        pc = 0x4d2574; continue;
      case 0x4d2574:
        R.fpop(); // 4d2574: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x54) | 0))); // 4d2576: fld qword ptr [esp + 0x54]
        pc = 0x4d257a; continue;
      case 0x4d257a:
        R.ftol(); // 4d257a: call 0x945640
        pc = 0x4d257f; continue;
      case 0x4d257f:
        R.ebx = ((R.eax >>> 0)) | 0; // 4d257f: mov ebx, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.ebx >>> 0)); // 4d2581: mov dword ptr [esp + 0x14], ebx
        pc = 0x4d2585; continue;
      case 0x4d2585:
        R.push(0x0); // 4d2585: push 0
        R.push(0x0); // 4d2587: push 0
        R.push(0x1); // 4d2589: push 1
        R.push(0x0); // 4d258b: push 0
        R.push((R.ebp >>> 0)); // 4d258d: push ebp
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 4d258e: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 4d2593: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d2596: test eax, eax
        if (!R.zf) { pc = 0x4d261f; continue; } // 4d2598: jne 0x4d261f
        pc = 0x4d259e; continue;
      case 0x4d259e:
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 4d259e: test edi, edi
        if (R.zf) { pc = 0x4d261f; continue; } // 4d25a0: je 0x4d261f
        pc = 0x4d25a2; continue;
      case 0x4d25a2:
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.edi) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 4d25a2: mov dx, word ptr [edi]
        R.edx = (R.logic((R.edx >>> 0) & 0x800, 32)) | 0; // 4d25a5: and edx, 0x800
        R.logic(((R.edx >>> 0) & 0xffff) & ((R.edx >>> 0) & 0xffff), 16); // 4d25ab: test dx, dx
        if (R.zf) { pc = 0x4d261f; continue; } // 4d25ae: je 0x4d261f
        pc = 0x4d25b0; continue;
      case 0x4d25b0:
        R.sub(R.m.u16(((R.ebp + 0x80) | 0) >>> 0), 0x109a, 16); // 4d25b0: cmp word ptr [ebp + 0x80], 0x109a
        if (R.cLE) { pc = 0x4d261f; continue; } // 4d25b9: jle 0x4d261f
        pc = 0x4d25bb; continue;
      case 0x4d25bb:
        R.sub(R.m.u8(((R.esi + 0x18) | 0) >>> 0), 0x12, 8); // 4d25bb: cmp byte ptr [esi + 0x18], 0x12
        if (R.cLE) { pc = 0x4d261f; continue; } // 4d25bf: jle 0x4d261f
        pc = 0x4d25c1; continue;
      case 0x4d25c1:
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d25c1: mov eax, dword ptr [esp + 0x18]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d25c5: mov cl, byte ptr [eax + 0x4f]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d25c8: and cl, 0xf0
        R.sub(((R.ecx >>> 0) & 0xff), 0x70, 8); // 4d25cb: cmp cl, 0x70
        if (R.zf) { pc = 0x4d261f; continue; } // 4d25ce: je 0x4d261f
        pc = 0x4d25d0; continue;
      case 0x4d25d0:
        R.edi = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 4d25d0: mov edi, dword ptr [esp + 0x34]
        R.ecx = ((R.edi >>> 0)) | 0; // 4d25d4: mov ecx, edi
        R.call(0x5986b0, { n: 0, thisEcx: true, calleeClean: false }); // 4d25d6: call 0x5986b0
        R.sub(((R.eax >>> 0) & 0xff), 0xff, 8); // 4d25db: cmp al, 0xff
        if (R.zf) { pc = 0x4d261f; continue; } // 4d25dd: je 0x4d261f
        pc = 0x4d25df; continue;
      case 0x4d25df:
        R.ecx = ((R.edi >>> 0)) | 0; // 4d25df: mov ecx, edi
        R.call(0x5986b0, { n: 0, thisEcx: true, calleeClean: false }); // 4d25e1: call 0x5986b0
        R.sub(((R.eax >>> 0) & 0xff), 0xfe, 8); // 4d25e6: cmp al, 0xfe
        if (R.zf) { pc = 0x4d261f; continue; } // 4d25e8: je 0x4d261f
        pc = 0x4d25ea; continue;
      case 0x4d25ea:
        R.eax = (((R.m.u16(((R.ebp + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d25ea: movsx eax, word ptr [ebp + 0x80]
        R.eax = (R.add((R.eax >>> 0), 0x61a8, 32)) | 0; // 4d25f1: add eax, 0x61a8
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4d25f6: lea eax, [eax + eax*4]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 4d25f9: lea edx, [eax + eax*4]
        R.edx = (R.shl((R.edx >>> 0), 0x2, 32)) | 0; // 4d25fc: shl edx, 2
        R.sub((R.ebx >>> 0), (R.edx >>> 0), 32); // 4d25ff: cmp ebx, edx
        if (!R.cL) { pc = 0x4d261f; continue; } // 4d2601: jge 0x4d261f
        pc = 0x4d2603; continue;
      case 0x4d2603:
        R.eax = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 4d2603: mov eax, dword ptr [esi + 0x39]
        R.eax = (((R.m.u16(((R.eax + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d2606: movsx eax, word ptr [eax + 0x80]
        R.eax = (R.add((R.eax >>> 0), 0x61a8, 32)) | 0; // 4d260d: add eax, 0x61a8
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4d2612: lea eax, [eax + eax*4]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 4d2615: lea ecx, [eax + eax*4]
        R.ecx = (R.shl((R.ecx >>> 0), 0x2, 32)) | 0; // 4d2618: shl ecx, 2
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.ecx >>> 0)); // 4d261b: mov dword ptr [esp + 0x14], ecx
        pc = 0x4d261f; continue;
      case 0x4d261f:
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 4d261f: mov ecx, dword ptr [esp + 0x1c]
        R.edx = (((R.ecx + 0x4c4b40) | 0)) | 0; // 4d2623: lea edx, [ecx + 0x4c4b40]
        R.ecx = (((R.ecx + R.ecx * 2) | 0)) | 0; // 4d2629: lea ecx, [ecx + ecx*2]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 4d262c: cmp ecx, edx
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.ecx >>> 0)); // 4d262e: mov dword ptr [esp + 0x28], ecx
        if (!R.cLE) { pc = 0x4d2638; continue; } // 4d2632: jg 0x4d2638
        pc = 0x4d2634; continue;
      case 0x4d2634:
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.edx >>> 0)); // 4d2634: mov dword ptr [esp + 0x28], edx
        pc = 0x4d2638; continue;
      case 0x4d2638:
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2638: fild dword ptr [esp + 0x14]
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 4d263c: fild dword ptr [esp + 0x28]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x44) | 0)); // 4d2640: fmul qword ptr [esp + 0x44]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x4c) | 0)); // 4d2644: fmul qword ptr [esp + 0x4c]
        R.fpush(R.st[1]); // 4d2648: fld st(1)
        R.fcom(R.st[0], R.st[1]); R.fpop(); R.fpop(); // 4d264a: fcompp 
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d264c: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d264e: test ah, 1
        if (!R.zf) { pc = 0x4d266d; continue; } // 4d2651: jne 0x4d266d
        pc = 0x4d2653; continue;
      case 0x4d2653:
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 4d2653: cmp ecx, edx
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.ecx >>> 0)); // 4d2655: mov dword ptr [esp + 0x28], ecx
        R.fpop(); // 4d2659: fstp st(0)
        if (!R.cLE) { pc = 0x4d2661; continue; } // 4d265b: jg 0x4d2661
        pc = 0x4d265d; continue;
      case 0x4d265d:
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.edx >>> 0)); // 4d265d: mov dword ptr [esp + 0x28], edx
        pc = 0x4d2661; continue;
      case 0x4d2661:
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 4d2661: fild dword ptr [esp + 0x28]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x44) | 0)); // 4d2665: fmul qword ptr [esp + 0x44]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x4c) | 0)); // 4d2669: fmul qword ptr [esp + 0x4c]
        pc = 0x4d266d; continue;
      case 0x4d266d:
        R.ftol(); // 4d266d: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d2672: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 4d2674: mov eax, dword ptr [esp + 0x1c]
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 4d2678: cmp edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d267a: mov dword ptr [esp + 0x14], edi
        if (R.cLE) { pc = 0x4d27e7; continue; } // 4d267e: jle 0x4d27e7
        pc = 0x4d2684; continue;
      case 0x4d2684:
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d2684: mov ecx, dword ptr [esp + 0x18]
        R.eax = (R.m.u32(((R.ecx + 0x45) | 0) >>> 0)) | 0; // 4d2688: mov eax, dword ptr [ecx + 0x45]
        R.logic(((R.eax >>> 0) & 0xff) & 0x6b, 8); // 4d268b: test al, 0x6b
        if (!R.zf) { pc = 0x4d2698; continue; } // 4d268d: jne 0x4d2698
        pc = 0x4d268f; continue;
      case 0x4d268f:
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d268f: test ah, 1
        if (R.zf) { pc = 0x4d27e7; continue; } // 4d2692: je 0x4d27e7
        pc = 0x4d2698; continue;
      case 0x4d2698:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 4d2698: xor eax, eax
        R.edx = (R.logic((R.edx >>> 0) ^ (R.edx >>> 0), 32)) | 0; // 4d269a: xor edx, edx
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.ecx + 0x2f) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 4d269c: mov ax, word ptr [ecx + 0x2f]
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 4d26a0: mov dx, word ptr [0xae2c92]
        R.ecx = (((R.m.u16(((R.ecx + 0x2d) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d26a7: movsx ecx, word ptr [ecx + 0x2d]
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 4d26ab: sub eax, edx
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 4d26ad: lea edx, [eax + eax*8]
        R.eax = (((R.eax + R.edx * 8) | 0)) | 0; // 4d26b0: lea eax, [eax + edx*8]
        R.edx = (((R.m.u16(((0xae2c90) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d26b3: movsx edx, word ptr [0xae2c90]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4d26ba: lea eax, [eax + eax*4]
        R.eax = (R.add((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 4d26bd: add eax, ecx
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 4d26bf: sub eax, edx
        R.sub((R.eax >>> 0), 0x16d, 32); // 4d26c1: cmp eax, 0x16d
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 4d26c6: mov dword ptr [esp + 0x28], eax
        if (R.cL) { pc = 0x4d26d2; continue; } // 4d26ca: jl 0x4d26d2
        pc = 0x4d26cc; continue;
      case 0x4d26cc:
        R.esi = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 4d26cc: mov esi, dword ptr [esp + 0x1c]
        pc = 0x4d26e7; continue; // 4d26d0: jmp 0x4d26e7
      case 0x4d26d2:
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 4d26d2: fild dword ptr [esp + 0x28]
        R.st[0] = R.st[0] * 0.0027397260273972603; // 4d26d6: fmul qword ptr [0x968e10]
        R.st[0] = R.st[0] * R.m.s32(((R.esp + 0x1c) | 0) >>> 0); // 4d26dc: fimul dword ptr [esp + 0x1c]
        R.ftol(); // 4d26e0: call 0x945640
        R.esi = ((R.eax >>> 0)) | 0; // 4d26e5: mov esi, eax
        pc = 0x4d26e7; continue;
      case 0x4d26e7:
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 4d26e7: fild dword ptr [esp + 0x28]
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.esi >>> 0)); // 4d26eb: mov dword ptr [esp + 0x2c], esi
        R.st[0] = R.st[0] * 0.0027; // 4d26ef: fmul qword ptr [0x968fc0]
        R.st[0] = R.st[0] - 0.485; // 4d26f5: fsub qword ptr [0x968fb8]
        R.fpush(0.0); // 4d26fb: fld qword ptr [0x9689a0]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d2701: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2703: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d2705: test ah, 0x41
        if (!R.zf) { pc = 0x4d2714; continue; } // 4d2708: jne 0x4d2714
        pc = 0x4d270a; continue;
      case 0x4d270a:
        R.fpop(); // 4d270a: fstp st(0)
        R.fpush(0.0); // 4d270c: fld qword ptr [0x9689a0]
        pc = 0x4d272b; continue; // 4d2712: jmp 0x4d272b
      case 0x4d2714:
        R.fpush(1.0); // 4d2714: fld qword ptr [0x967890]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d271a: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d271c: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d271e: test ah, 1
        if (R.zf) { pc = 0x4d272b; continue; } // 4d2721: je 0x4d272b
        pc = 0x4d2723; continue;
      case 0x4d2723:
        R.fpop(); // 4d2723: fstp st(0)
        R.fpush(1.0); // 4d2725: fld qword ptr [0x967890]
        pc = 0x4d272b; continue;
      case 0x4d272b:
        R.fpush(R.m.s32(((R.esp + 0x2c) | 0) >>> 0)); // 4d272b: fild dword ptr [esp + 0x2c]
        R.m.wf64(((R.esp + 0x84) | 0) >>> 0, R.st[0]); R.fpop(); // 4d272f: fstp qword ptr [esp + 0x84]
        R.fpush(1.0); // 4d2736: fld qword ptr [0x967890]
        R.st[0] = R.st[0] - R.st[1]; // 4d273c: fsub st(1)
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x84) | 0)); // 4d273e: fmul qword ptr [esp + 0x84]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2745: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * R.st[2]; // 4d2749: fmul st(2)
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 4d274b: faddp st(1)
        R.ftol(); // 4d274d: call 0x945640
        R.fpop(); // 4d2752: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x7c) | 0))); // 4d2754: fld qword ptr [esp + 0x7c]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x44) | 0)); // 4d2758: fmul qword ptr [esp + 0x44]
        R.ecx = ((R.eax >>> 0)) | 0; // 4d275c: mov ecx, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.ecx >>> 0)); // 4d275e: mov dword ptr [esp + 0x14], ecx
        R.st[0] = R.st[0] + R.st[0]; // 4d2762: fadd st(0), st(0)
        R.fpush(1.0); // 4d2764: fld qword ptr [0x967890]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d276a: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d276c: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d276e: test ah, 0x41
        if (!R.zf) { pc = 0x4d277b; continue; } // 4d2771: jne 0x4d277b
        pc = 0x4d2773; continue;
      case 0x4d2773:
        R.fpop(); // 4d2773: fstp st(0)
        R.fpush(1.0); // 4d2775: fld qword ptr [0x967890]
        pc = 0x4d277b; continue;
      case 0x4d277b:
        R.esi = (R.add((R.esi >>> 0), (R.ecx >>> 0), 32)) | 0; // 4d277b: add esi, ecx
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.esi >>> 0)); // 4d277d: mov dword ptr [esp + 0x38], esi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2781: fild dword ptr [esp + 0x38]
        R.st[1] = R.st[0] / R.st[1]; R.fpop(); // 4d2785: fdivrp st(1)
        R.fpush(1.0); // 4d2787: fld qword ptr [0x967890]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d278d: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d278f: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d2791: test ah, 0x41
        if (!R.zf) { pc = 0x4d27a0; continue; } // 4d2794: jne 0x4d27a0
        pc = 0x4d2796; continue;
      case 0x4d2796:
        R.fpop(); // 4d2796: fstp st(0)
        R.fpush(1.0); // 4d2798: fld qword ptr [0x967890]
        pc = 0x4d27b7; continue; // 4d279e: jmp 0x4d27b7
      case 0x4d27a0:
        R.fpush(3.0); // 4d27a0: fld qword ptr [0x968930]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d27a6: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d27a8: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d27aa: test ah, 1
        if (R.zf) { pc = 0x4d27b7; continue; } // 4d27ad: je 0x4d27b7
        pc = 0x4d27af; continue;
      case 0x4d27af:
        R.fpop(); // 4d27af: fstp st(0)
        R.fpush(3.0); // 4d27b1: fld qword ptr [0x968930]
        pc = 0x4d27b7; continue;
      case 0x4d27b7:
        R.st[0] = R.st[0] * 0.375; // 4d27b7: fmul qword ptr [0x968fb0]
        R.st[0] = 1.375 - R.st[0]; // 4d27bd: fsubr qword ptr [0x968fa8]
        R.fpush(1.0); // 4d27c3: fld qword ptr [0x967890]
        R.st[0] = R.st[0] - R.st[1]; // 4d27c9: fsub st(1)
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x84) | 0)); // 4d27cb: fmul qword ptr [esp + 0x84]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d27d2: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * R.st[2]; // 4d27d6: fmul st(2)
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 4d27d8: faddp st(1)
        R.ftol(); // 4d27da: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d27df: mov edi, eax
        R.fpop(); // 4d27e1: fstp st(0)
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d27e3: mov dword ptr [esp + 0x14], edi
        pc = 0x4d27e7; continue;
      case 0x4d27e7:
        R.eax = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 4d27e7: mov eax, dword ptr [0xde1f54]
        R.edx = (R.m.u32(((R.esp + 0x98) | 0) >>> 0)) | 0; // 4d27ec: mov edx, dword ptr [esp + 0x98]
        R.push(0x1); // 4d27f3: push 1
        R.push(0x0); // 4d27f5: push 0
        R.ecx = (R.m.u32(((R.eax + 0x856) | 0) >>> 0)) | 0; // 4d27f7: mov ecx, dword ptr [eax + 0x856]
        R.push((R.edx >>> 0)); // 4d27fd: push edx
        R.push((R.ebp >>> 0)); // 4d27fe: push ebp
        R.call(0x849ce0, { n: 4, thisEcx: true, calleeClean: true }); // 4d27ff: call 0x849ce0
        R.esi = ((R.eax >>> 0)) | 0; // 4d2804: mov esi, eax
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.ebp + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 4d2806: mov ax, word ptr [ebp + 0x80]
        R.sub(((R.eax >>> 0) & 0xffff), 0xfa0, 16); // 4d280d: cmp ax, 0xfa0
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.esi >>> 0)); // 4d2811: mov dword ptr [esp + 0x2c], esi
        if (R.cLE) { pc = 0x4d3826; continue; } // 4d2815: jle 0x4d3826
        pc = 0x4d281b; continue;
      case 0x4d281b:
        R.edx = (R.m.u32(((R.ebp + 0x53) | 0) >>> 0)) | 0; // 4d281b: mov edx, dword ptr [ebp + 0x53]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 4d281e: test edx, edx
        if (R.zf) { pc = 0x4d3826; continue; } // 4d2820: je 0x4d3826
        pc = 0x4d2826; continue;
      case 0x4d2826:
        R.ecx = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 4d2826: mov ecx, dword ptr [edx]
        R.ebx = (R.m.u32(((0x9cf2e4) | 0) >>> 0)) | 0; // 4d2828: mov ebx, dword ptr [0x9cf2e4]
        R.sub((R.ecx >>> 0), (R.ebx >>> 0), 32); // 4d282e: cmp ecx, ebx
        if (R.zf) { pc = 0x4d287e; continue; } // 4d2830: je 0x4d287e
        pc = 0x4d2832; continue;
      case 0x4d2832:
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf360) | 0) >>> 0), 32); // 4d2832: cmp ecx, dword ptr [0x9cf360]
        if (R.zf) { pc = 0x4d287e; continue; } // 4d2838: je 0x4d287e
        pc = 0x4d283a; continue;
      case 0x4d283a:
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf488) | 0) >>> 0), 32); // 4d283a: cmp ecx, dword ptr [0x9cf488]
        if (R.zf) { pc = 0x4d287e; continue; } // 4d2840: je 0x4d287e
        pc = 0x4d2842; continue;
      case 0x4d2842:
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf300) | 0) >>> 0), 32); // 4d2842: cmp ecx, dword ptr [0x9cf300]
        if (R.zf) { pc = 0x4d287e; continue; } // 4d2848: je 0x4d287e
        pc = 0x4d284a; continue;
      case 0x4d284a:
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf314) | 0) >>> 0), 32); // 4d284a: cmp ecx, dword ptr [0x9cf314]
        if (R.zf) { pc = 0x4d287e; continue; } // 4d2850: je 0x4d287e
        pc = 0x4d2852; continue;
      case 0x4d2852:
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf45c) | 0) >>> 0), 32); // 4d2852: cmp ecx, dword ptr [0x9cf45c]
        if (R.zf) { pc = 0x4d287e; continue; } // 4d2858: je 0x4d287e
        pc = 0x4d285a; continue;
      case 0x4d285a:
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf4f8) | 0) >>> 0), 32); // 4d285a: cmp ecx, dword ptr [0x9cf4f8]
        if (R.zf) { pc = 0x4d287e; continue; } // 4d2860: je 0x4d287e
        pc = 0x4d2862; continue;
      case 0x4d2862:
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf36c) | 0) >>> 0), 32); // 4d2862: cmp ecx, dword ptr [0x9cf36c]
        if (R.zf) { pc = 0x4d287e; continue; } // 4d2868: je 0x4d287e
        pc = 0x4d286a; continue;
      case 0x4d286a:
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf338) | 0) >>> 0), 32); // 4d286a: cmp ecx, dword ptr [0x9cf338]
        if (R.zf) { pc = 0x4d287e; continue; } // 4d2870: je 0x4d287e
        pc = 0x4d2872; continue;
      case 0x4d2872:
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf434) | 0) >>> 0), 32); // 4d2872: cmp ecx, dword ptr [0x9cf434]
        if (!R.zf) { pc = 0x4d3826; continue; } // 4d2878: jne 0x4d3826
        pc = 0x4d287e; continue;
      case 0x4d287e:
        R.sub(R.m.u8(((R.edx + 0x85) | 0) >>> 0), 0xc, 8); // 4d287e: cmp byte ptr [edx + 0x85], 0xc
        if (!R.cLE) { pc = 0x4d2891; continue; } // 4d2885: jg 0x4d2891
        pc = 0x4d2887; continue;
      case 0x4d2887:
        R.sub(((R.eax >>> 0) & 0xffff), 0x1b58, 16); // 4d2887: cmp ax, 0x1b58
        if (R.cL) { pc = 0x4d3826; continue; } // 4d288b: jl 0x4d3826
        pc = 0x4d2891; continue;
      case 0x4d2891:
        R.ebx = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 4d2891: mov ebx, dword ptr [esp + 0x34]
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 4d2895: test ebx, ebx
        if (R.zf) { pc = 0x4d3826; continue; } // 4d2897: je 0x4d3826
        pc = 0x4d289d; continue;
      case 0x4d289d:
        R.ecx = ((R.ebx >>> 0)) | 0; // 4d289d: mov ecx, ebx
        R.call(0x5986b0, { n: 0, thisEcx: true, calleeClean: false }); // 4d289f: call 0x5986b0
        R.sub(((R.eax >>> 0) & 0xff), 0xff, 8); // 4d28a4: cmp al, 0xff
        if (R.zf) { pc = 0x4d3826; continue; } // 4d28a6: je 0x4d3826
        pc = 0x4d28ac; continue;
      case 0x4d28ac:
        R.ecx = ((R.ebx >>> 0)) | 0; // 4d28ac: mov ecx, ebx
        R.call(0x5986b0, { n: 0, thisEcx: true, calleeClean: false }); // 4d28ae: call 0x5986b0
        R.sub(((R.eax >>> 0) & 0xff), 0xfe, 8); // 4d28b3: cmp al, 0xfe
        if (R.zf) { pc = 0x4d3826; continue; } // 4d28b5: je 0x4d3826
        pc = 0x4d28bb; continue;
      case 0x4d28bb:
        R.ebx = (R.m.u32(((R.esp + 0x98) | 0) >>> 0)) | 0; // 4d28bb: mov ebx, dword ptr [esp + 0x98]
        R.push(0x0); // 4d28c2: push 0
        R.push((R.ebx >>> 0)); // 4d28c4: push ebx
        R.call(0x5444a0, { n: 2, thisEcx: false, calleeClean: false }); // 4d28c5: call 0x5444a0
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 4d28ca: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d28cd: test eax, eax
        if (!R.zf) { pc = 0x4d3826; continue; } // 4d28cf: jne 0x4d3826
        pc = 0x4d28d5; continue;
      case 0x4d28d5:
        R.push((R.eax >>> 0)); // 4d28d5: push eax
        R.push((R.ebx >>> 0)); // 4d28d6: push ebx
        R.call(0x544600, { n: 2, thisEcx: false, calleeClean: false }); // 4d28d7: call 0x544600
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 4d28dc: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d28df: test eax, eax
        if (!R.zf) { pc = 0x4d3826; continue; } // 4d28e1: jne 0x4d3826
        pc = 0x4d28e7; continue;
      case 0x4d28e7:
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 4d28e7: test esi, esi
        if (R.zf) { pc = 0x4d28f4; continue; } // 4d28e9: je 0x4d28f4
        pc = 0x4d28eb; continue;
      case 0x4d28eb:
        R.eax = (R.m.u32(((R.esi + 0xf) | 0) >>> 0)) | 0; // 4d28eb: mov eax, dword ptr [esi + 0xf]
        R.ecx = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 4d28ee: mov ecx, dword ptr [ebx]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 4d28f0: cmp eax, ecx
        if (R.zf) { pc = 0x4d290b; continue; } // 4d28f2: je 0x4d290b
        pc = 0x4d28f4; continue;
      case 0x4d28f4:
        R.sub(R.m.u8(((R.ebx + 0x6d) | 0) >>> 0), 0x2, 8); // 4d28f4: cmp byte ptr [ebx + 0x6d], 2
        if (!R.zf) { pc = 0x4d313a; continue; } // 4d28f8: jne 0x4d313a
        pc = 0x4d28fe; continue;
      case 0x4d28fe:
        R.sub(R.m.u32(((R.ebp + 0x1db) | 0) >>> 0), 0xffffffff, 32); // 4d28fe: cmp dword ptr [ebp + 0x1db], -1
        if (R.cLE) { pc = 0x4d313a; continue; } // 4d2905: jle 0x4d313a
        pc = 0x4d290b; continue;
      case 0x4d290b:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esp + 0x10) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d290b: mov cl, byte ptr [esp + 0x10]
        R.ebx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d290f: mov ebx, dword ptr [esp + 0x18]
        R.sub(((R.ecx >>> 0) & 0xff), 0x19, 8); // 4d2913: cmp cl, 0x19
        if (!R.cL) { pc = 0x4d29b4; continue; } // 4d2916: jge 0x4d29b4
        pc = 0x4d291c; continue;
      case 0x4d291c:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebx + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d291c: mov al, byte ptr [ebx + 0x4f]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d291f: and al, 0xf0
        R.sub(((R.eax >>> 0) & 0xff), 0x70, 8); // 4d2921: cmp al, 0x70
        if (R.zf) { pc = 0x4d29b4; continue; } // 4d2923: je 0x4d29b4
        pc = 0x4d2929; continue;
      case 0x4d2929:
        R.sub(((R.eax >>> 0) & 0xff), 0x60, 8); // 4d2929: cmp al, 0x60
        if (R.zf) { pc = 0x4d29b4; continue; } // 4d292b: je 0x4d29b4
        pc = 0x4d2931; continue;
      case 0x4d2931:
        R.eax = (((R.m.u16(((R.esp + 0x20) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d2931: movsx eax, word ptr [esp + 0x20]
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 4d2936: mov dword ptr [esp + 0x28], eax
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4d293a: lea eax, [eax + eax*4]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 4d293d: lea edx, [eax + eax*4]
        R.eax = (((R.m.u16(((R.ebp + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d2940: movsx eax, word ptr [ebp + 0x80]
        R.edx = (R.shl((R.edx >>> 0), 0x1, 32)) | 0; // 4d2947: shl edx, 1
        R.sub((R.edx >>> 0), (R.eax >>> 0), 32); // 4d2949: cmp edx, eax
        if (R.cLE) { pc = 0x4d29b4; continue; } // 4d294b: jle 0x4d29b4
        pc = 0x4d294d; continue;
      case 0x4d294d:
        R.eax = (((R.m.u8(((R.ebx + 0x44) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d294d: movsx eax, byte ptr [ebx + 0x44]
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 4d2951: fild dword ptr [esp + 0x28]
        R.edx = R.eax < 0 ? -1 : 0; // 4d2955: cdq 
        R.edx = (R.logic((R.edx >>> 0) & 0x3, 32)) | 0; // 4d2956: and edx, 3
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 4d2959: add eax, edx
        R.edx = (0x7d) | 0; // 4d295b: mov edx, 0x7d
        R.eax = (R.sar((R.eax >>> 0), 0x2, 32)) | 0; // 4d2960: sar eax, 2
        R.edx = (R.sub((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 4d2963: sub edx, eax
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edx >>> 0)); // 4d2965: mov dword ptr [esp + 0x38], edx
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2969: fild dword ptr [esp + 0x38]
        R.eax = (((((R.ecx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 4d296d: movsx eax, cl
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 4d2970: fdivp st(1)
        R.eax = (R.sub((R.eax >>> 0), 0x14, 32)) | 0; // 4d2972: sub eax, 0x14
        R.edx = R.eax < 0 ? -1 : 0; // 4d2975: cdq 
        R.eax = (R.logic((R.eax >>> 0) ^ (R.edx >>> 0), 32)) | 0; // 4d2976: xor eax, edx
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 4d2978: sub eax, edx
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt(1333333); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.eax = (Number(BigInt.asIntN(32, p))) | 0; } // 4d297a: imul eax, eax, 0x145855
        R.st[0] = R.st[0] * R.m.s32(((R.esp + 0x14) | 0) >>> 0); // 4d2980: fimul dword ptr [esp + 0x14]
        R.edi = (R.sub((R.edi >>> 0), (R.eax >>> 0), 32)) | 0; // 4d2984: sub edi, eax
        R.edi = (R.add((R.edi >>> 0), 0x4c4b40, 32)) | 0; // 4d2986: add edi, 0x4c4b40
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d298c: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2990: fild dword ptr [esp + 0x38]
        R.m.wf64(((R.esp + 0x6c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2994: fstp qword ptr [esp + 0x6c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x6c) | 0))); // 4d2998: fcom qword ptr [esp + 0x6c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d299c: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d299e: test ah, 1
        if (!R.zf) { pc = 0x4d29a9; continue; } // 4d29a1: jne 0x4d29a9
        pc = 0x4d29a3; continue;
      case 0x4d29a3:
        R.fpop(); // 4d29a3: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x6c) | 0))); // 4d29a5: fld qword ptr [esp + 0x6c]
        pc = 0x4d29a9; continue;
      case 0x4d29a9:
        R.ftol(); // 4d29a9: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d29ae: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d29b0: mov dword ptr [esp + 0x14], edi
        pc = 0x4d29b4; continue;
      case 0x4d29b4:
        R.sub(R.m.u16(((R.ebp + 0x80) | 0) >>> 0), 0x1a5e, 16); // 4d29b4: cmp word ptr [ebp + 0x80], 0x1a5e
        if (!R.cLE) { pc = 0x4d2cf5; continue; } // 4d29bd: jg 0x4d2cf5
        pc = 0x4d29c3; continue;
      case 0x4d29c3:
        R.esi = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d29c3: mov esi, dword ptr [ebp + 0x57]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 4d29c6: test esi, esi
        if (R.zf) { pc = 0x4d29d5; continue; } // 4d29c8: je 0x4d29d5
        pc = 0x4d29ca; continue;
      case 0x4d29ca:
        R.sub(R.m.u16(((R.esi + 0x69) | 0) >>> 0), 0xf, 16); // 4d29ca: cmp word ptr [esi + 0x69], 0xf
        if (!R.cLE) { pc = 0x4d2cf5; continue; } // 4d29cf: jg 0x4d2cf5
        pc = 0x4d29d5; continue;
      case 0x4d29d5:
        R.eax = (R.m.u32(((R.ebx + 0x45) | 0) >>> 0)) | 0; // 4d29d5: mov eax, dword ptr [ebx + 0x45]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d29d8: test eax, eax
        if (R.zf) { pc = 0x4d2b43; continue; } // 4d29da: je 0x4d2b43
        pc = 0x4d29e0; continue;
      case 0x4d29e0:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.ebx + 0x44) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d29e0: mov cl, byte ptr [ebx + 0x44]
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 4d29e3: test cl, cl
        if (!R.cLE) { pc = 0x4d2b43; continue; } // 4d29e5: jg 0x4d2b43
        pc = 0x4d29eb; continue;
      case 0x4d29eb:
        R.logic((R.eax >>> 0) & 0x101, 32); // 4d29eb: test eax, 0x101
        if (R.zf) { pc = 0x4d3886; continue; } // 4d29f0: je 0x4d3886
        pc = 0x4d29f6; continue;
      case 0x4d29f6:
        R.eax = (R.m.u32(((0xae2c94) | 0) >>> 0)) | 0; // 4d29f6: mov eax, dword ptr [0xae2c94]
        R.ecx = (R.m.u32(((0xae2c90) | 0) >>> 0)) | 0; // 4d29fb: mov ecx, dword ptr [0xae2c90]
        R.push((R.eax >>> 0)); // 4d2a01: push eax
        R.push((R.ecx >>> 0)); // 4d2a02: push ecx
        R.ecx = (((R.ebx + 0x2d) | 0)) | 0; // 4d2a03: lea ecx, [ebx + 0x2d]
        R.call(0x54cdb0, { n: 2, thisEcx: true, calleeClean: true }); // 4d2a06: call 0x54cdb0
        R.sub((R.eax >>> 0), 0x1a9, 32); // 4d2a0b: cmp eax, 0x1a9
        if (R.cLE) { pc = 0x4d3886; continue; } // 4d2a10: jle 0x4d3886
        pc = 0x4d2a16; continue;
      case 0x4d2a16:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebx + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d2a16: mov al, byte ptr [ebx + 0x4f]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d2a19: and al, 0xf0
        R.sub(((R.eax >>> 0) & 0xff), 0x10, 8); // 4d2a1b: cmp al, 0x10
        if (!R.zf) { pc = 0x4d2aaf; continue; } // 4d2a1d: jne 0x4d2aaf
        pc = 0x4d2a23; continue;
      case 0x4d2a23:
        R.edi = (R.add((R.edi >>> 0), 0x5b8d8, 32)) | 0; // 4d2a23: add edi, 0x5b8d8
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d2a29: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2a2d: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2a31: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.25; // 4d2a35: fmul qword ptr [0x968928]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2a3b: fstp qword ptr [esp + 0x44]
        R.fcom(R.st[0], R.f64(((R.esp + 0x44) | 0))); // 4d2a3f: fcom qword ptr [esp + 0x44]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2a43: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d2a45: test ah, 1
        if (!R.zf) { pc = 0x4d2a50; continue; } // 4d2a48: jne 0x4d2a50
        pc = 0x4d2a4a; continue;
      case 0x4d2a4a:
        R.fpop(); // 4d2a4a: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x44) | 0))); // 4d2a4c: fld qword ptr [esp + 0x44]
        pc = 0x4d2a50; continue;
      case 0x4d2a50:
        R.ftol(); // 4d2a50: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d2a55: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d2a57: mov eax, dword ptr [esp + 0x94]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d2a5e: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d2a60: mov dword ptr [esp + 0x14], edi
        if (R.zf) { pc = 0x4d3886; continue; } // 4d2a64: je 0x4d3886
        pc = 0x4d2a6a; continue;
      case 0x4d2a6a:
        R.edx = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d2a6a: mov edx, dword ptr [ebp + 0x57]
        R.ecx = (R.m.u32(((R.eax + 0x57) | 0) >>> 0)) | 0; // 4d2a6d: mov ecx, dword ptr [eax + 0x57]
        R.sub((R.edx >>> 0), (R.ecx >>> 0), 32); // 4d2a70: cmp edx, ecx
        if (!R.zf) { pc = 0x4d3886; continue; } // 4d2a72: jne 0x4d3886
        pc = 0x4d2a78; continue;
      case 0x4d2a78:
        R.edi = (R.add((R.edi >>> 0), 0xc350, 32)) | 0; // 4d2a78: add edi, 0xc350
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d2a7e: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2a82: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2a86: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.05; // 4d2a8a: fmul qword ptr [0x9689b8]
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2a90: fstp qword ptr [esp + 0x4c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x4c) | 0))); // 4d2a94: fcom qword ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2a98: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d2a9a: test ah, 1
        if (!R.zf) { pc = 0x4d2aa5; continue; } // 4d2a9d: jne 0x4d2aa5
        pc = 0x4d2a9f; continue;
      case 0x4d2a9f:
        R.fpop(); // 4d2a9f: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d2aa1: fld qword ptr [esp + 0x4c]
        pc = 0x4d2aa5; continue;
      case 0x4d2aa5:
        R.ftol(); // 4d2aa5: call 0x945640
        pc = 0x4d3880; continue; // 4d2aaa: jmp 0x4d3880
      case 0x4d2aaf:
        R.sub(((R.eax >>> 0) & 0xff), 0x20, 8); // 4d2aaf: cmp al, 0x20
        if (!R.zf) { pc = 0x4d3886; continue; } // 4d2ab1: jne 0x4d3886
        pc = 0x4d2ab7; continue;
      case 0x4d2ab7:
        R.edi = (R.add((R.edi >>> 0), 0x30d40, 32)) | 0; // 4d2ab7: add edi, 0x30d40
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d2abd: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2ac1: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2ac5: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.2; // 4d2ac9: fmul qword ptr [0x968978]
        R.m.wf64(((R.esp + 0x6c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2acf: fstp qword ptr [esp + 0x6c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x6c) | 0))); // 4d2ad3: fcom qword ptr [esp + 0x6c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2ad7: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d2ad9: test ah, 1
        if (!R.zf) { pc = 0x4d2ae4; continue; } // 4d2adc: jne 0x4d2ae4
        pc = 0x4d2ade; continue;
      case 0x4d2ade:
        R.fpop(); // 4d2ade: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x6c) | 0))); // 4d2ae0: fld qword ptr [esp + 0x6c]
        pc = 0x4d2ae4; continue;
      case 0x4d2ae4:
        R.ftol(); // 4d2ae4: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d2ae9: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d2aeb: mov eax, dword ptr [esp + 0x94]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d2af2: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d2af4: mov dword ptr [esp + 0x14], edi
        if (R.zf) { pc = 0x4d3886; continue; } // 4d2af8: je 0x4d3886
        pc = 0x4d2afe; continue;
      case 0x4d2afe:
        R.ecx = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d2afe: mov ecx, dword ptr [ebp + 0x57]
        R.edx = (R.m.u32(((R.eax + 0x57) | 0) >>> 0)) | 0; // 4d2b01: mov edx, dword ptr [eax + 0x57]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 4d2b04: cmp ecx, edx
        if (!R.zf) { pc = 0x4d3886; continue; } // 4d2b06: jne 0x4d3886
        pc = 0x4d2b0c; continue;
      case 0x4d2b0c:
        R.edi = (R.add((R.edi >>> 0), 0x927c, 32)) | 0; // 4d2b0c: add edi, 0x927c
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d2b12: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2b16: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2b1a: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.025; // 4d2b1e: fmul qword ptr [0x968fa0]
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2b24: fstp qword ptr [esp + 0x4c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x4c) | 0))); // 4d2b28: fcom qword ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2b2c: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d2b2e: test ah, 1
        if (!R.zf) { pc = 0x4d2b39; continue; } // 4d2b31: jne 0x4d2b39
        pc = 0x4d2b33; continue;
      case 0x4d2b33:
        R.fpop(); // 4d2b33: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d2b35: fld qword ptr [esp + 0x4c]
        pc = 0x4d2b39; continue;
      case 0x4d2b39:
        R.ftol(); // 4d2b39: call 0x945640
        pc = 0x4d3880; continue; // 4d2b3e: jmp 0x4d3880
      case 0x4d2b43:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebx + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d2b43: mov al, byte ptr [ebx + 0x4f]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d2b46: and al, 0xf0
        R.sub(((R.eax >>> 0) & 0xff), 0x10, 8); // 4d2b48: cmp al, 0x10
        if (!R.zf) { pc = 0x4d2bd7; continue; } // 4d2b4a: jne 0x4d2bd7
        pc = 0x4d2b50; continue;
      case 0x4d2b50:
        R.edi = (R.add((R.edi >>> 0), 0xb71b0, 32)) | 0; // 4d2b50: add edi, 0xb71b0
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d2b56: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2b5a: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2b5e: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.75; // 4d2b62: fmul qword ptr [0x968f98]
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2b68: fstp qword ptr [esp + 0x4c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x4c) | 0))); // 4d2b6c: fcom qword ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2b70: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d2b72: test ah, 1
        if (!R.zf) { pc = 0x4d2b7d; continue; } // 4d2b75: jne 0x4d2b7d
        pc = 0x4d2b77; continue;
      case 0x4d2b77:
        R.fpop(); // 4d2b77: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d2b79: fld qword ptr [esp + 0x4c]
        pc = 0x4d2b7d; continue;
      case 0x4d2b7d:
        R.ftol(); // 4d2b7d: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d2b82: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d2b84: mov eax, dword ptr [esp + 0x94]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d2b8b: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d2b8d: mov dword ptr [esp + 0x14], edi
        if (R.zf) { pc = 0x4d3886; continue; } // 4d2b91: je 0x4d3886
        pc = 0x4d2b97; continue;
      case 0x4d2b97:
        R.sub((R.esi >>> 0), R.m.u32(((R.eax + 0x57) | 0) >>> 0), 32); // 4d2b97: cmp esi, dword ptr [eax + 0x57]
        if (!R.zf) { pc = 0x4d3886; continue; } // 4d2b9a: jne 0x4d3886
        pc = 0x4d2ba0; continue;
      case 0x4d2ba0:
        R.edi = (R.add((R.edi >>> 0), 0x186a0, 32)) | 0; // 4d2ba0: add edi, 0x186a0
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d2ba6: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2baa: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2bae: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.1; // 4d2bb2: fmul qword ptr [0x9689c0]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2bb8: fstp qword ptr [esp + 0x44]
        R.fcom(R.st[0], R.f64(((R.esp + 0x44) | 0))); // 4d2bbc: fcom qword ptr [esp + 0x44]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2bc0: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d2bc2: test ah, 1
        if (!R.zf) { pc = 0x4d2bcd; continue; } // 4d2bc5: jne 0x4d2bcd
        pc = 0x4d2bc7; continue;
      case 0x4d2bc7:
        R.fpop(); // 4d2bc7: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x44) | 0))); // 4d2bc9: fld qword ptr [esp + 0x44]
        pc = 0x4d2bcd; continue;
      case 0x4d2bcd:
        R.ftol(); // 4d2bcd: call 0x945640
        pc = 0x4d3880; continue; // 4d2bd2: jmp 0x4d3880
      case 0x4d2bd7:
        R.sub(((R.eax >>> 0) & 0xff), 0x20, 8); // 4d2bd7: cmp al, 0x20
        if (!R.zf) { pc = 0x4d2c66; continue; } // 4d2bd9: jne 0x4d2c66
        pc = 0x4d2bdf; continue;
      case 0x4d2bdf:
        R.edi = (R.add((R.edi >>> 0), 0x61a80, 32)) | 0; // 4d2bdf: add edi, 0x61a80
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d2be5: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2be9: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2bed: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.4; // 4d2bf1: fmul qword ptr [0x968dc0]
        R.m.wf64(((R.esp + 0x6c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2bf7: fstp qword ptr [esp + 0x6c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x6c) | 0))); // 4d2bfb: fcom qword ptr [esp + 0x6c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2bff: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d2c01: test ah, 1
        if (!R.zf) { pc = 0x4d2c0c; continue; } // 4d2c04: jne 0x4d2c0c
        pc = 0x4d2c06; continue;
      case 0x4d2c06:
        R.fpop(); // 4d2c06: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x6c) | 0))); // 4d2c08: fld qword ptr [esp + 0x6c]
        pc = 0x4d2c0c; continue;
      case 0x4d2c0c:
        R.ftol(); // 4d2c0c: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d2c11: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d2c13: mov eax, dword ptr [esp + 0x94]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d2c1a: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d2c1c: mov dword ptr [esp + 0x14], edi
        if (R.zf) { pc = 0x4d3886; continue; } // 4d2c20: je 0x4d3886
        pc = 0x4d2c26; continue;
      case 0x4d2c26:
        R.sub((R.esi >>> 0), R.m.u32(((R.eax + 0x57) | 0) >>> 0), 32); // 4d2c26: cmp esi, dword ptr [eax + 0x57]
        if (!R.zf) { pc = 0x4d3886; continue; } // 4d2c29: jne 0x4d3886
        pc = 0x4d2c2f; continue;
      case 0x4d2c2f:
        R.edi = (R.add((R.edi >>> 0), 0x124f8, 32)) | 0; // 4d2c2f: add edi, 0x124f8
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d2c35: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2c39: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2c3d: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.075; // 4d2c41: fmul qword ptr [0x968f90]
        R.m.wf64(((R.esp + 0x6c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2c47: fstp qword ptr [esp + 0x6c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x6c) | 0))); // 4d2c4b: fcom qword ptr [esp + 0x6c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2c4f: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d2c51: test ah, 1
        if (!R.zf) { pc = 0x4d2c5c; continue; } // 4d2c54: jne 0x4d2c5c
        pc = 0x4d2c56; continue;
      case 0x4d2c56:
        R.fpop(); // 4d2c56: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x6c) | 0))); // 4d2c58: fld qword ptr [esp + 0x6c]
        pc = 0x4d2c5c; continue;
      case 0x4d2c5c:
        R.ftol(); // 4d2c5c: call 0x945640
        pc = 0x4d3880; continue; // 4d2c61: jmp 0x4d3880
      case 0x4d2c66:
        R.sub(((R.eax >>> 0) & 0xff), 0x30, 8); // 4d2c66: cmp al, 0x30
        if (!R.zf) { pc = 0x4d3886; continue; } // 4d2c68: jne 0x4d3886
        pc = 0x4d2c6e; continue;
      case 0x4d2c6e:
        R.edi = (R.add((R.edi >>> 0), 0x249f0, 32)) | 0; // 4d2c6e: add edi, 0x249f0
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d2c74: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2c78: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2c7c: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.15; // 4d2c80: fmul qword ptr [0x968980]
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2c86: fstp qword ptr [esp + 0x4c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x4c) | 0))); // 4d2c8a: fcom qword ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2c8e: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d2c90: test ah, 1
        if (!R.zf) { pc = 0x4d2c9b; continue; } // 4d2c93: jne 0x4d2c9b
        pc = 0x4d2c95; continue;
      case 0x4d2c95:
        R.fpop(); // 4d2c95: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d2c97: fld qword ptr [esp + 0x4c]
        pc = 0x4d2c9b; continue;
      case 0x4d2c9b:
        R.ftol(); // 4d2c9b: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d2ca0: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d2ca2: mov eax, dword ptr [esp + 0x94]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d2ca9: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d2cab: mov dword ptr [esp + 0x14], edi
        if (R.zf) { pc = 0x4d3886; continue; } // 4d2caf: je 0x4d3886
        pc = 0x4d2cb5; continue;
      case 0x4d2cb5:
        R.sub((R.esi >>> 0), R.m.u32(((R.eax + 0x57) | 0) >>> 0), 32); // 4d2cb5: cmp esi, dword ptr [eax + 0x57]
        if (!R.zf) { pc = 0x4d3886; continue; } // 4d2cb8: jne 0x4d3886
        pc = 0x4d2cbe; continue;
      case 0x4d2cbe:
        R.edi = (R.add((R.edi >>> 0), 0x61a8, 32)) | 0; // 4d2cbe: add edi, 0x61a8
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d2cc4: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2cc8: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2ccc: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.025; // 4d2cd0: fmul qword ptr [0x968fa0]
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2cd6: fstp qword ptr [esp + 0x4c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x4c) | 0))); // 4d2cda: fcom qword ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2cde: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d2ce0: test ah, 1
        if (!R.zf) { pc = 0x4d2ceb; continue; } // 4d2ce3: jne 0x4d2ceb
        pc = 0x4d2ce5; continue;
      case 0x4d2ce5:
        R.fpop(); // 4d2ce5: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d2ce7: fld qword ptr [esp + 0x4c]
        pc = 0x4d2ceb; continue;
      case 0x4d2ceb:
        R.ftol(); // 4d2ceb: call 0x945640
        pc = 0x4d3880; continue; // 4d2cf0: jmp 0x4d3880
      case 0x4d2cf5:
        R.eax = (R.m.u32(((R.ebx + 0x45) | 0) >>> 0)) | 0; // 4d2cf5: mov eax, dword ptr [ebx + 0x45]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d2cf8: test eax, eax
        if (R.zf) { pc = 0x4d2fdc; continue; } // 4d2cfa: je 0x4d2fdc
        pc = 0x4d2d00; continue;
      case 0x4d2d00:
        R.sub(R.m.u8(((R.ebx + 0x44) | 0) >>> 0), 0xce, 8); // 4d2d00: cmp byte ptr [ebx + 0x44], 0xce
        if (!R.cLE) { pc = 0x4d2fdc; continue; } // 4d2d04: jg 0x4d2fdc
        pc = 0x4d2d0a; continue;
      case 0x4d2d0a:
        R.logic((R.eax >>> 0) & 0x101, 32); // 4d2d0a: test eax, 0x101
        if (R.zf) { pc = 0x4d2eaa; continue; } // 4d2d0f: je 0x4d2eaa
        pc = 0x4d2d15; continue;
      case 0x4d2d15:
        R.edx = (R.m.u32(((0xae2c94) | 0) >>> 0)) | 0; // 4d2d15: mov edx, dword ptr [0xae2c94]
        R.eax = (R.m.u32(((0xae2c90) | 0) >>> 0)) | 0; // 4d2d1b: mov eax, dword ptr [0xae2c90]
        R.push((R.edx >>> 0)); // 4d2d20: push edx
        R.push((R.eax >>> 0)); // 4d2d21: push eax
        R.ecx = (((R.ebx + 0x2d) | 0)) | 0; // 4d2d22: lea ecx, [ebx + 0x2d]
        R.call(0x54cdb0, { n: 2, thisEcx: true, calleeClean: true }); // 4d2d25: call 0x54cdb0
        R.sub((R.eax >>> 0), 0x1a9, 32); // 4d2d2a: cmp eax, 0x1a9
        if (R.cLE) { pc = 0x4d2eaa; continue; } // 4d2d2f: jle 0x4d2eaa
        pc = 0x4d2d35; continue;
      case 0x4d2d35:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebx + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d2d35: mov al, byte ptr [ebx + 0x4f]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d2d38: and al, 0xf0
        R.sub(((R.eax >>> 0) & 0xff), 0x10, 8); // 4d2d3a: cmp al, 0x10
        if (!R.zf) { pc = 0x4d2d82; continue; } // 4d2d3c: jne 0x4d2d82
        pc = 0x4d2d3e; continue;
      case 0x4d2d3e:
        R.eax = (((R.edi + 0x2625a0) | 0)) | 0; // 4d2d3e: lea eax, [edi + 0x2625a0]
        R.edi = (R.add((R.edi >>> 0), (R.edi >>> 0), 32)) | 0; // 4d2d44: add edi, edi
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 4d2d46: cmp eax, edi
        if (!R.cL) { pc = 0x4d2d4c; continue; } // 4d2d48: jge 0x4d2d4c
        pc = 0x4d2d4a; continue;
      case 0x4d2d4a:
        R.edi = ((R.eax >>> 0)) | 0; // 4d2d4a: mov edi, eax
        pc = 0x4d2d4c; continue;
      case 0x4d2d4c:
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d2d4c: mov eax, dword ptr [esp + 0x94]
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d2d53: mov dword ptr [esp + 0x14], edi
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d2d57: test eax, eax
        if (R.zf) { pc = 0x4d3886; continue; } // 4d2d59: je 0x4d3886
        pc = 0x4d2d5f; continue;
      case 0x4d2d5f:
        R.ecx = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d2d5f: mov ecx, dword ptr [ebp + 0x57]
        R.edx = (R.m.u32(((R.eax + 0x57) | 0) >>> 0)) | 0; // 4d2d62: mov edx, dword ptr [eax + 0x57]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 4d2d65: cmp ecx, edx
        if (!R.zf) { pc = 0x4d3886; continue; } // 4d2d67: jne 0x4d3886
        pc = 0x4d2d6d; continue;
      case 0x4d2d6d:
        R.eax = (((R.edi + 0xf4240) | 0)) | 0; // 4d2d6d: lea eax, [edi + 0xf4240]
        R.edi = (R.add((R.edi >>> 0), (R.edi >>> 0), 32)) | 0; // 4d2d73: add edi, edi
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 4d2d75: cmp eax, edi
        if (R.cL) { pc = 0x4d3880; continue; } // 4d2d77: jl 0x4d3880
        pc = 0x4d2d7d; continue;
      case 0x4d2d7d:
        pc = 0x4d3882; continue; // 4d2d7d: jmp 0x4d3882
      case 0x4d2d82:
        R.sub(((R.eax >>> 0) & 0xff), 0x20, 8); // 4d2d82: cmp al, 0x20
        if (!R.zf) { pc = 0x4d2e16; continue; } // 4d2d84: jne 0x4d2e16
        pc = 0x4d2d8a; continue;
      case 0x4d2d8a:
        R.edi = (R.add((R.edi >>> 0), 0x16e360, 32)) | 0; // 4d2d8a: add edi, 0x16e360
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d2d90: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2d94: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2d98: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.5; // 4d2d9c: fmul qword ptr [0x968940]
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2da2: fstp qword ptr [esp + 0x4c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x4c) | 0))); // 4d2da6: fcom qword ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2daa: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d2dac: test ah, 1
        if (!R.zf) { pc = 0x4d2db7; continue; } // 4d2daf: jne 0x4d2db7
        pc = 0x4d2db1; continue;
      case 0x4d2db1:
        R.fpop(); // 4d2db1: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d2db3: fld qword ptr [esp + 0x4c]
        pc = 0x4d2db7; continue;
      case 0x4d2db7:
        R.ftol(); // 4d2db7: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d2dbc: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d2dbe: mov eax, dword ptr [esp + 0x94]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d2dc5: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d2dc7: mov dword ptr [esp + 0x14], edi
        if (R.zf) { pc = 0x4d3886; continue; } // 4d2dcb: je 0x4d3886
        pc = 0x4d2dd1; continue;
      case 0x4d2dd1:
        R.edx = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d2dd1: mov edx, dword ptr [ebp + 0x57]
        R.ecx = (R.m.u32(((R.eax + 0x57) | 0) >>> 0)) | 0; // 4d2dd4: mov ecx, dword ptr [eax + 0x57]
        R.sub((R.edx >>> 0), (R.ecx >>> 0), 32); // 4d2dd7: cmp edx, ecx
        if (!R.zf) { pc = 0x4d3886; continue; } // 4d2dd9: jne 0x4d3886
        pc = 0x4d2ddf; continue;
      case 0x4d2ddf:
        R.edi = (R.add((R.edi >>> 0), 0xb71b0, 32)) | 0; // 4d2ddf: add edi, 0xb71b0
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d2de5: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2de9: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2ded: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.75; // 4d2df1: fmul qword ptr [0x968f98]
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2df7: fstp qword ptr [esp + 0x4c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x4c) | 0))); // 4d2dfb: fcom qword ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2dff: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d2e01: test ah, 1
        if (!R.zf) { pc = 0x4d2e0c; continue; } // 4d2e04: jne 0x4d2e0c
        pc = 0x4d2e06; continue;
      case 0x4d2e06:
        R.fpop(); // 4d2e06: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d2e08: fld qword ptr [esp + 0x4c]
        pc = 0x4d2e0c; continue;
      case 0x4d2e0c:
        R.ftol(); // 4d2e0c: call 0x945640
        pc = 0x4d3880; continue; // 4d2e11: jmp 0x4d3880
      case 0x4d2e16:
        R.sub(((R.eax >>> 0) & 0xff), 0x30, 8); // 4d2e16: cmp al, 0x30
        if (!R.zf) { pc = 0x4d3886; continue; } // 4d2e18: jne 0x4d3886
        pc = 0x4d2e1e; continue;
      case 0x4d2e1e:
        R.edi = (R.add((R.edi >>> 0), 0xf4240, 32)) | 0; // 4d2e1e: add edi, 0xf4240
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d2e24: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2e28: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2e2c: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.25; // 4d2e30: fmul qword ptr [0x968928]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2e36: fstp qword ptr [esp + 0x44]
        R.fcom(R.st[0], R.f64(((R.esp + 0x44) | 0))); // 4d2e3a: fcom qword ptr [esp + 0x44]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2e3e: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d2e40: test ah, 1
        if (!R.zf) { pc = 0x4d2e4b; continue; } // 4d2e43: jne 0x4d2e4b
        pc = 0x4d2e45; continue;
      case 0x4d2e45:
        R.fpop(); // 4d2e45: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x44) | 0))); // 4d2e47: fld qword ptr [esp + 0x44]
        pc = 0x4d2e4b; continue;
      case 0x4d2e4b:
        R.ftol(); // 4d2e4b: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d2e50: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d2e52: mov eax, dword ptr [esp + 0x94]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d2e59: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d2e5b: mov dword ptr [esp + 0x14], edi
        if (R.zf) { pc = 0x4d3886; continue; } // 4d2e5f: je 0x4d3886
        pc = 0x4d2e65; continue;
      case 0x4d2e65:
        R.ecx = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d2e65: mov ecx, dword ptr [ebp + 0x57]
        R.edx = (R.m.u32(((R.eax + 0x57) | 0) >>> 0)) | 0; // 4d2e68: mov edx, dword ptr [eax + 0x57]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 4d2e6b: cmp ecx, edx
        if (!R.zf) { pc = 0x4d3886; continue; } // 4d2e6d: jne 0x4d3886
        pc = 0x4d2e73; continue;
      case 0x4d2e73:
        R.edi = (R.add((R.edi >>> 0), 0x61a80, 32)) | 0; // 4d2e73: add edi, 0x61a80
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d2e79: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2e7d: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2e81: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.25; // 4d2e85: fmul qword ptr [0x968928]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2e8b: fstp qword ptr [esp + 0x44]
        R.fcom(R.st[0], R.f64(((R.esp + 0x44) | 0))); // 4d2e8f: fcom qword ptr [esp + 0x44]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2e93: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d2e95: test ah, 1
        if (!R.zf) { pc = 0x4d2ea0; continue; } // 4d2e98: jne 0x4d2ea0
        pc = 0x4d2e9a; continue;
      case 0x4d2e9a:
        R.fpop(); // 4d2e9a: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x44) | 0))); // 4d2e9c: fld qword ptr [esp + 0x44]
        pc = 0x4d2ea0; continue;
      case 0x4d2ea0:
        R.ftol(); // 4d2ea0: call 0x945640
        pc = 0x4d3880; continue; // 4d2ea5: jmp 0x4d3880
      case 0x4d2eaa:
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d2eaa: mov eax, dword ptr [esp + 0x94]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d2eb1: test eax, eax
        if (R.zf) { pc = 0x4d3886; continue; } // 4d2eb3: je 0x4d3886
        pc = 0x4d2eb9; continue;
      case 0x4d2eb9:
        R.edx = (R.m.u32(((0xae2c94) | 0) >>> 0)) | 0; // 4d2eb9: mov edx, dword ptr [0xae2c94]
        R.eax = (R.m.u32(((0xae2c90) | 0) >>> 0)) | 0; // 4d2ebf: mov eax, dword ptr [0xae2c90]
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d2ec4: mov ecx, dword ptr [esp + 0x18]
        R.push((R.edx >>> 0)); // 4d2ec8: push edx
        R.push((R.eax >>> 0)); // 4d2ec9: push eax
        R.ecx = (R.add((R.ecx >>> 0), 0x2d, 32)) | 0; // 4d2eca: add ecx, 0x2d
        R.call(0x54cdb0, { n: 2, thisEcx: true, calleeClean: true }); // 4d2ecd: call 0x54cdb0
        R.sub((R.eax >>> 0), 0xe1, 32); // 4d2ed2: cmp eax, 0xe1
        if (R.cLE) { pc = 0x4d3886; continue; } // 4d2ed7: jle 0x4d3886
        pc = 0x4d2edd; continue;
      case 0x4d2edd:
        R.edx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d2edd: mov edx, dword ptr [esp + 0x18]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edx + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d2ee1: mov al, byte ptr [edx + 0x4f]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d2ee4: and al, 0xf0
        R.sub(((R.eax >>> 0) & 0xff), 0x70, 8); // 4d2ee6: cmp al, 0x70
        if (R.zf) { pc = 0x4d3886; continue; } // 4d2ee8: je 0x4d3886
        pc = 0x4d2eee; continue;
      case 0x4d2eee:
        R.ecx = (R.m.u32(((R.esp + 0x98) | 0) >>> 0)) | 0; // 4d2eee: mov ecx, dword ptr [esp + 0x98]
        R.sub(R.m.u8(((R.ecx + 0x5b) | 0) >>> 0), 0x5, 8); // 4d2ef5: cmp byte ptr [ecx + 0x5b], 5
        if (R.cLE) { pc = 0x4d3886; continue; } // 4d2ef9: jle 0x4d3886
        pc = 0x4d2eff; continue;
      case 0x4d2eff:
        R.edx = ((R.ecx >>> 0)) | 0; // 4d2eff: mov edx, ecx
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edx + 0x59) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d2f01: mov al, byte ptr [edx + 0x59]
        R.sub(((R.eax >>> 0) & 0xff), 0x5, 8); // 4d2f04: cmp al, 5
        if (R.cLE) { pc = 0x4d3886; continue; } // 4d2f06: jle 0x4d3886
        pc = 0x4d2f0c; continue;
      case 0x4d2f0c:
        R.ecx = (R.m.u32(((R.ecx + 0x61) | 0) >>> 0)) | 0; // 4d2f0c: mov ecx, dword ptr [ecx + 0x61]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 4d2f0f: test ecx, ecx
        if (R.zf) { pc = 0x4d3886; continue; } // 4d2f11: je 0x4d3886
        pc = 0x4d2f17; continue;
      case 0x4d2f17:
        R.sub(R.m.u16(((R.ecx + 0xb) | 0) >>> 0), 0x186a, 16); // 4d2f17: cmp word ptr [ecx + 0xb], 0x186a
        if (R.cLE) { pc = 0x4d3886; continue; } // 4d2f1d: jle 0x4d3886
        pc = 0x4d2f23; continue;
      case 0x4d2f23:
        R.edx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d2f23: mov edx, dword ptr [esp + 0x18]
        R.eax = ((R.eax & 0xffffff00) | (((R.neg(((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 4d2f27: neg al
        R.sub(R.m.u8(((R.edx + 0x3d) | 0) >>> 0), ((R.eax >>> 0) & 0xff), 8); // 4d2f29: cmp byte ptr [edx + 0x3d], al
        if (R.cLE) { pc = 0x4d3886; continue; } // 4d2f2c: jle 0x4d3886
        pc = 0x4d2f32; continue;
      case 0x4d2f32:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x10) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d2f32: mov al, byte ptr [esp + 0x10]
        R.sub(((R.eax >>> 0) & 0xff), 0x16, 8); // 4d2f36: cmp al, 0x16
        if (R.cLE) { pc = 0x4d3886; continue; } // 4d2f38: jle 0x4d3886
        pc = 0x4d2f3e; continue;
      case 0x4d2f3e:
        R.sub(((R.eax >>> 0) & 0xff), 0x1f, 8); // 4d2f3e: cmp al, 0x1f
        if (!R.cL) { pc = 0x4d3886; continue; } // 4d2f40: jge 0x4d3886
        pc = 0x4d2f46; continue;
      case 0x4d2f46:
        R.edi = (R.add((R.edi >>> 0), 0xf4240, 32)) | 0; // 4d2f46: add edi, 0xf4240
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d2f4c: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2f50: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2f54: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.25; // 4d2f58: fmul qword ptr [0x968928]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2f5e: fstp qword ptr [esp + 0x44]
        R.fcom(R.st[0], R.f64(((R.esp + 0x44) | 0))); // 4d2f62: fcom qword ptr [esp + 0x44]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2f66: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d2f68: test ah, 1
        if (!R.zf) { pc = 0x4d2f73; continue; } // 4d2f6b: jne 0x4d2f73
        pc = 0x4d2f6d; continue;
      case 0x4d2f6d:
        R.fpop(); // 4d2f6d: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x44) | 0))); // 4d2f6f: fld qword ptr [esp + 0x44]
        pc = 0x4d2f73; continue;
      case 0x4d2f73:
        R.ftol(); // 4d2f73: call 0x945640
        R.ecx = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d2f78: mov ecx, dword ptr [esp + 0x94]
        R.edi = ((R.eax >>> 0)) | 0; // 4d2f7f: mov edi, eax
        R.eax = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d2f81: mov eax, dword ptr [ebp + 0x57]
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d2f84: mov dword ptr [esp + 0x14], edi
        R.sub((R.eax >>> 0), R.m.u32(((R.ecx + 0x57) | 0) >>> 0), 32); // 4d2f88: cmp eax, dword ptr [ecx + 0x57]
        if (!R.zf) { pc = 0x4d3886; continue; } // 4d2f8b: jne 0x4d3886
        pc = 0x4d2f91; continue;
      case 0x4d2f91:
        R.edx = ((R.ecx >>> 0)) | 0; // 4d2f91: mov edx, ecx
        R.push((R.edx >>> 0)); // 4d2f93: push edx
        R.push((R.ebp >>> 0)); // 4d2f94: push ebp
        R.call(0x4b02e0, { n: 2, thisEcx: false, calleeClean: false }); // 4d2f95: call 0x4b02e0
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 4d2f9a: add esp, 8
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 4d2f9d: test al, al
        if (R.zf) { pc = 0x4d3886; continue; } // 4d2f9f: je 0x4d3886
        pc = 0x4d2fa5; continue;
      case 0x4d2fa5:
        R.edi = (R.add((R.edi >>> 0), 0x61a80, 32)) | 0; // 4d2fa5: add edi, 0x61a80
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d2fab: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2faf: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2fb3: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.25; // 4d2fb7: fmul qword ptr [0x968928]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2fbd: fstp qword ptr [esp + 0x44]
        R.fcom(R.st[0], R.f64(((R.esp + 0x44) | 0))); // 4d2fc1: fcom qword ptr [esp + 0x44]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2fc5: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d2fc7: test ah, 1
        if (!R.zf) { pc = 0x4d2fd2; continue; } // 4d2fca: jne 0x4d2fd2
        pc = 0x4d2fcc; continue;
      case 0x4d2fcc:
        R.fpop(); // 4d2fcc: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x44) | 0))); // 4d2fce: fld qword ptr [esp + 0x44]
        pc = 0x4d2fd2; continue;
      case 0x4d2fd2:
        R.ftol(); // 4d2fd2: call 0x945640
        pc = 0x4d3880; continue; // 4d2fd7: jmp 0x4d3880
      case 0x4d2fdc:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebx + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d2fdc: mov al, byte ptr [ebx + 0x4f]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d2fdf: and al, 0xf0
        R.sub(((R.eax >>> 0) & 0xff), 0x10, 8); // 4d2fe1: cmp al, 0x10
        if (!R.zf) { pc = 0x4d302a; continue; } // 4d2fe3: jne 0x4d302a
        pc = 0x4d2fe5; continue;
      case 0x4d2fe5:
        R.eax = (((R.edi + 0x4c4b40) | 0)) | 0; // 4d2fe5: lea eax, [edi + 0x4c4b40]
        R.edi = (((R.edi + R.edi * 4) | 0)) | 0; // 4d2feb: lea edi, [edi + edi*4]
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 4d2fee: cmp eax, edi
        if (!R.cL) { pc = 0x4d2ff4; continue; } // 4d2ff0: jge 0x4d2ff4
        pc = 0x4d2ff2; continue;
      case 0x4d2ff2:
        R.edi = ((R.eax >>> 0)) | 0; // 4d2ff2: mov edi, eax
        pc = 0x4d2ff4; continue;
      case 0x4d2ff4:
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d2ff4: mov eax, dword ptr [esp + 0x94]
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d2ffb: mov dword ptr [esp + 0x14], edi
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d2fff: test eax, eax
        if (R.zf) { pc = 0x4d3886; continue; } // 4d3001: je 0x4d3886
        pc = 0x4d3007; continue;
      case 0x4d3007:
        R.ecx = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d3007: mov ecx, dword ptr [ebp + 0x57]
        R.edx = (R.m.u32(((R.eax + 0x57) | 0) >>> 0)) | 0; // 4d300a: mov edx, dword ptr [eax + 0x57]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 4d300d: cmp ecx, edx
        if (!R.zf) { pc = 0x4d3886; continue; } // 4d300f: jne 0x4d3886
        pc = 0x4d3015; continue;
      case 0x4d3015:
        R.eax = (((R.edi + 0xf4240) | 0)) | 0; // 4d3015: lea eax, [edi + 0xf4240]
        R.edi = (R.add((R.edi >>> 0), (R.edi >>> 0), 32)) | 0; // 4d301b: add edi, edi
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 4d301d: cmp eax, edi
        if (R.cL) { pc = 0x4d3880; continue; } // 4d301f: jl 0x4d3880
        pc = 0x4d3025; continue;
      case 0x4d3025:
        pc = 0x4d3882; continue; // 4d3025: jmp 0x4d3882
      case 0x4d302a:
        R.sub(((R.eax >>> 0) & 0xff), 0x20, 8); // 4d302a: cmp al, 0x20
        if (!R.zf) { pc = 0x4d30c7; continue; } // 4d302c: jne 0x4d30c7
        pc = 0x4d3032; continue;
      case 0x4d3032:
        R.edi = (R.add((R.edi >>> 0), 0x2625a0, 32)) | 0; // 4d3032: add edi, 0x2625a0
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d3038: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d303c: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d3040: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 2.5; // 4d3044: fmul qword ptr [0x968e18]
        R.m.wf64(((R.esp + 0x84) | 0) >>> 0, R.st[0]); R.fpop(); // 4d304a: fstp qword ptr [esp + 0x84]
        R.fcom(R.st[0], R.f64(((R.esp + 0x84) | 0))); // 4d3051: fcom qword ptr [esp + 0x84]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d3058: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d305a: test ah, 1
        if (!R.zf) { pc = 0x4d3068; continue; } // 4d305d: jne 0x4d3068
        pc = 0x4d305f; continue;
      case 0x4d305f:
        R.fpop(); // 4d305f: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x84) | 0))); // 4d3061: fld qword ptr [esp + 0x84]
        pc = 0x4d3068; continue;
      case 0x4d3068:
        R.ftol(); // 4d3068: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d306d: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d306f: mov eax, dword ptr [esp + 0x94]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d3076: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d3078: mov dword ptr [esp + 0x14], edi
        if (R.zf) { pc = 0x4d3886; continue; } // 4d307c: je 0x4d3886
        pc = 0x4d3082; continue;
      case 0x4d3082:
        R.edx = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d3082: mov edx, dword ptr [ebp + 0x57]
        R.ecx = (R.m.u32(((R.eax + 0x57) | 0) >>> 0)) | 0; // 4d3085: mov ecx, dword ptr [eax + 0x57]
        R.sub((R.edx >>> 0), (R.ecx >>> 0), 32); // 4d3088: cmp edx, ecx
        if (!R.zf) { pc = 0x4d3886; continue; } // 4d308a: jne 0x4d3886
        pc = 0x4d3090; continue;
      case 0x4d3090:
        R.edi = (R.add((R.edi >>> 0), 0xb71b0, 32)) | 0; // 4d3090: add edi, 0xb71b0
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d3096: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d309a: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d309e: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.75; // 4d30a2: fmul qword ptr [0x968f98]
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d30a8: fstp qword ptr [esp + 0x4c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x4c) | 0))); // 4d30ac: fcom qword ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d30b0: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d30b2: test ah, 1
        if (!R.zf) { pc = 0x4d30bd; continue; } // 4d30b5: jne 0x4d30bd
        pc = 0x4d30b7; continue;
      case 0x4d30b7:
        R.fpop(); // 4d30b7: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d30b9: fld qword ptr [esp + 0x4c]
        pc = 0x4d30bd; continue;
      case 0x4d30bd:
        R.ftol(); // 4d30bd: call 0x945640
        pc = 0x4d3880; continue; // 4d30c2: jmp 0x4d3880
      case 0x4d30c7:
        R.sub(((R.eax >>> 0) & 0xff), 0x30, 8); // 4d30c7: cmp al, 0x30
        if (!R.zf) { pc = 0x4d3886; continue; } // 4d30c9: jne 0x4d3886
        pc = 0x4d30cf; continue;
      case 0x4d30cf:
        R.eax = (((R.edi + 0x16e360) | 0)) | 0; // 4d30cf: lea eax, [edi + 0x16e360]
        R.edi = (R.add((R.edi >>> 0), (R.edi >>> 0), 32)) | 0; // 4d30d5: add edi, edi
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 4d30d7: cmp eax, edi
        if (!R.cL) { pc = 0x4d30dd; continue; } // 4d30d9: jge 0x4d30dd
        pc = 0x4d30db; continue;
      case 0x4d30db:
        R.edi = ((R.eax >>> 0)) | 0; // 4d30db: mov edi, eax
        pc = 0x4d30dd; continue;
      case 0x4d30dd:
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d30dd: mov eax, dword ptr [esp + 0x94]
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d30e4: mov dword ptr [esp + 0x14], edi
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d30e8: test eax, eax
        if (R.zf) { pc = 0x4d3886; continue; } // 4d30ea: je 0x4d3886
        pc = 0x4d30f0; continue;
      case 0x4d30f0:
        R.ecx = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d30f0: mov ecx, dword ptr [esp + 0x94]
        R.eax = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d30f7: mov eax, dword ptr [ebp + 0x57]
        R.sub((R.eax >>> 0), R.m.u32(((R.ecx + 0x57) | 0) >>> 0), 32); // 4d30fa: cmp eax, dword ptr [ecx + 0x57]
        if (!R.zf) { pc = 0x4d3886; continue; } // 4d30fd: jne 0x4d3886
        pc = 0x4d3103; continue;
      case 0x4d3103:
        R.edi = (R.add((R.edi >>> 0), 0x61a80, 32)) | 0; // 4d3103: add edi, 0x61a80
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d3109: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d310d: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d3111: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.4; // 4d3115: fmul qword ptr [0x968dc0]
        R.m.wf64(((R.esp + 0x6c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d311b: fstp qword ptr [esp + 0x6c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x6c) | 0))); // 4d311f: fcom qword ptr [esp + 0x6c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d3123: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d3125: test ah, 1
        if (!R.zf) { pc = 0x4d3130; continue; } // 4d3128: jne 0x4d3130
        pc = 0x4d312a; continue;
      case 0x4d312a:
        R.fpop(); // 4d312a: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x6c) | 0))); // 4d312c: fld qword ptr [esp + 0x6c]
        pc = 0x4d3130; continue;
      case 0x4d3130:
        R.ftol(); // 4d3130: call 0x945640
        pc = 0x4d3880; continue; // 4d3135: jmp 0x4d3880
      case 0x4d313a:
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 4d313a: test esi, esi
        if (R.zf) { pc = 0x4d382a; continue; } // 4d313c: je 0x4d382a
        pc = 0x4d3142; continue;
      case 0x4d3142:
        R.sub(R.m.u32(((R.esi + 0xf) | 0) >>> 0), 0xffffffff, 32); // 4d3142: cmp dword ptr [esi + 0xf], -1
        if (!R.zf) { pc = 0x4d3886; continue; } // 4d3146: jne 0x4d3886
        pc = 0x4d314c; continue;
      case 0x4d314c:
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.esp + 0x10) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d314c: mov bl, byte ptr [esp + 0x10]
        R.sub(((R.ebx >>> 0) & 0xff), 0x16, 8); // 4d3150: cmp bl, 0x16
        if (!R.cL) { pc = 0x4d31f5; continue; } // 4d3153: jge 0x4d31f5
        pc = 0x4d3159; continue;
      case 0x4d3159:
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d3159: mov ecx, dword ptr [esp + 0x18]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d315d: mov al, byte ptr [ecx + 0x4f]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d3160: and al, 0xf0
        R.sub(((R.eax >>> 0) & 0xff), 0x70, 8); // 4d3162: cmp al, 0x70
        if (R.zf) { pc = 0x4d31f5; continue; } // 4d3164: je 0x4d31f5
        pc = 0x4d316a; continue;
      case 0x4d316a:
        R.sub(((R.eax >>> 0) & 0xff), 0x60, 8); // 4d316a: cmp al, 0x60
        if (R.zf) { pc = 0x4d31f5; continue; } // 4d316c: je 0x4d31f5
        pc = 0x4d3172; continue;
      case 0x4d3172:
        R.eax = (((R.m.u16(((R.esp + 0x20) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d3172: movsx eax, word ptr [esp + 0x20]
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 4d3177: mov dword ptr [esp + 0x28], eax
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4d317b: lea eax, [eax + eax*4]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 4d317e: lea edx, [eax + eax*4]
        R.eax = (((R.m.u16(((R.ebp + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d3181: movsx eax, word ptr [ebp + 0x80]
        R.edx = (R.shl((R.edx >>> 0), 0x1, 32)) | 0; // 4d3188: shl edx, 1
        R.sub((R.edx >>> 0), (R.eax >>> 0), 32); // 4d318a: cmp edx, eax
        if (R.cLE) { pc = 0x4d31f5; continue; } // 4d318c: jle 0x4d31f5
        pc = 0x4d318e; continue;
      case 0x4d318e:
        R.eax = (((R.m.u8(((R.ecx + 0x44) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d318e: movsx eax, byte ptr [ecx + 0x44]
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 4d3192: fild dword ptr [esp + 0x28]
        R.edx = R.eax < 0 ? -1 : 0; // 4d3196: cdq 
        R.edx = (R.logic((R.edx >>> 0) & 0x3, 32)) | 0; // 4d3197: and edx, 3
        R.ecx = (0x7d) | 0; // 4d319a: mov ecx, 0x7d
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 4d319f: add eax, edx
        R.eax = (R.sar((R.eax >>> 0), 0x2, 32)) | 0; // 4d31a1: sar eax, 2
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 4d31a4: sub ecx, eax
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.ecx >>> 0)); // 4d31a6: mov dword ptr [esp + 0x38], ecx
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d31aa: fild dword ptr [esp + 0x38]
        R.eax = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 4d31ae: movsx eax, bl
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 4d31b1: fdivp st(1)
        R.eax = (R.sub((R.eax >>> 0), 0x14, 32)) | 0; // 4d31b3: sub eax, 0x14
        R.edx = R.eax < 0 ? -1 : 0; // 4d31b6: cdq 
        R.eax = (R.logic((R.eax >>> 0) ^ (R.edx >>> 0), 32)) | 0; // 4d31b7: xor eax, edx
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 4d31b9: sub eax, edx
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt(1333333); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.eax = (Number(BigInt.asIntN(32, p))) | 0; } // 4d31bb: imul eax, eax, 0x145855
        R.st[0] = R.st[0] * R.m.s32(((R.esp + 0x14) | 0) >>> 0); // 4d31c1: fimul dword ptr [esp + 0x14]
        R.edi = (R.sub((R.edi >>> 0), (R.eax >>> 0), 32)) | 0; // 4d31c5: sub edi, eax
        R.edi = (R.add((R.edi >>> 0), 0x4c4b40, 32)) | 0; // 4d31c7: add edi, 0x4c4b40
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d31cd: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d31d1: fild dword ptr [esp + 0x38]
        R.m.wf64(((R.esp + 0x6c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d31d5: fstp qword ptr [esp + 0x6c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x6c) | 0))); // 4d31d9: fcom qword ptr [esp + 0x6c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d31dd: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d31df: test ah, 1
        if (!R.zf) { pc = 0x4d31ea; continue; } // 4d31e2: jne 0x4d31ea
        pc = 0x4d31e4; continue;
      case 0x4d31e4:
        R.fpop(); // 4d31e4: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x6c) | 0))); // 4d31e6: fld qword ptr [esp + 0x6c]
        pc = 0x4d31ea; continue;
      case 0x4d31ea:
        R.ftol(); // 4d31ea: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d31ef: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d31f1: mov dword ptr [esp + 0x14], edi
        pc = 0x4d31f5; continue;
      case 0x4d31f5:
        R.sub(R.m.u16(((R.ebp + 0x80) | 0) >>> 0), 0x1a5e, 16); // 4d31f5: cmp word ptr [ebp + 0x80], 0x1a5e
        if (!R.cLE) { pc = 0x4d336b; continue; } // 4d31fe: jg 0x4d336b
        pc = 0x4d3204; continue;
      case 0x4d3204:
        R.esi = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d3204: mov esi, dword ptr [ebp + 0x57]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 4d3207: test esi, esi
        if (R.zf) { pc = 0x4d3216; continue; } // 4d3209: je 0x4d3216
        pc = 0x4d320b; continue;
      case 0x4d320b:
        R.sub(R.m.u16(((R.esi + 0x69) | 0) >>> 0), 0xf, 16); // 4d320b: cmp word ptr [esi + 0x69], 0xf
        if (!R.cLE) { pc = 0x4d336b; continue; } // 4d3210: jg 0x4d336b
        pc = 0x4d3216; continue;
      case 0x4d3216:
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d3216: mov ecx, dword ptr [esp + 0x18]
        R.eax = (R.m.u32(((R.ecx + 0x45) | 0) >>> 0)) | 0; // 4d321a: mov eax, dword ptr [ecx + 0x45]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d321d: test eax, eax
        if (R.zf) { pc = 0x4d322c; continue; } // 4d321f: je 0x4d322c
        pc = 0x4d3221; continue;
      case 0x4d3221:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + 0x44) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d3221: mov al, byte ptr [ecx + 0x44]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 4d3224: test al, al
        if (R.cLE) { pc = 0x4d3886; continue; } // 4d3226: jle 0x4d3886
        pc = 0x4d322c; continue;
      case 0x4d322c:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d322c: mov al, byte ptr [ecx + 0x4f]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d322f: and al, 0xf0
        R.sub(((R.eax >>> 0) & 0xff), 0x10, 8); // 4d3231: cmp al, 0x10
        if (!R.zf) { pc = 0x4d32c2; continue; } // 4d3233: jne 0x4d32c2
        pc = 0x4d3239; continue;
      case 0x4d3239:
        R.edi = (R.add((R.edi >>> 0), 0x3d090, 32)) | 0; // 4d3239: add edi, 0x3d090
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d323f: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3243: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d3247: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.25; // 4d324b: fmul qword ptr [0x968928]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); R.fpop(); // 4d3251: fstp qword ptr [esp + 0x44]
        R.fcom(R.st[0], R.f64(((R.esp + 0x44) | 0))); // 4d3255: fcom qword ptr [esp + 0x44]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d3259: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d325b: test ah, 1
        if (!R.zf) { pc = 0x4d3266; continue; } // 4d325e: jne 0x4d3266
        pc = 0x4d3260; continue;
      case 0x4d3260:
        R.fpop(); // 4d3260: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x44) | 0))); // 4d3262: fld qword ptr [esp + 0x44]
        pc = 0x4d3266; continue;
      case 0x4d3266:
        R.ftol(); // 4d3266: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d326b: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d326d: mov eax, dword ptr [esp + 0x94]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d3274: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d3276: mov dword ptr [esp + 0x14], edi
        if (R.zf) { pc = 0x4d3886; continue; } // 4d327a: je 0x4d3886
        pc = 0x4d3280; continue;
      case 0x4d3280:
        R.edx = ((R.eax >>> 0)) | 0; // 4d3280: mov edx, eax
        R.sub((R.esi >>> 0), R.m.u32(((R.edx + 0x57) | 0) >>> 0), 32); // 4d3282: cmp esi, dword ptr [edx + 0x57]
        if (!R.zf) { pc = 0x4d3886; continue; } // 4d3285: jne 0x4d3886
        pc = 0x4d328b; continue;
      case 0x4d328b:
        R.edi = (R.add((R.edi >>> 0), 0xc350, 32)) | 0; // 4d328b: add edi, 0xc350
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d3291: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3295: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d3299: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.05; // 4d329d: fmul qword ptr [0x9689b8]
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d32a3: fstp qword ptr [esp + 0x4c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x4c) | 0))); // 4d32a7: fcom qword ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d32ab: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d32ad: test ah, 1
        if (!R.zf) { pc = 0x4d32b8; continue; } // 4d32b0: jne 0x4d32b8
        pc = 0x4d32b2; continue;
      case 0x4d32b2:
        R.fpop(); // 4d32b2: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d32b4: fld qword ptr [esp + 0x4c]
        pc = 0x4d32b8; continue;
      case 0x4d32b8:
        R.ftol(); // 4d32b8: call 0x945640
        pc = 0x4d3880; continue; // 4d32bd: jmp 0x4d3880
      case 0x4d32c2:
        R.sub(((R.eax >>> 0) & 0xff), 0x20, 8); // 4d32c2: cmp al, 0x20
        if (R.zf) { pc = 0x4d32e4; continue; } // 4d32c4: je 0x4d32e4
        pc = 0x4d32c6; continue;
      case 0x4d32c6:
        R.eax = (R.m.u32(((R.esp + 0x98) | 0) >>> 0)) | 0; // 4d32c6: mov eax, dword ptr [esp + 0x98]
        R.ecx = (((R.m.u8(((R.ecx + 0x3d) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d32cd: movsx ecx, byte ptr [ecx + 0x3d]
        R.edx = (((R.m.u8(((R.eax + 0x59) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d32d1: movsx edx, byte ptr [eax + 0x59]
        R.eax = (0x28) | 0; // 4d32d5: mov eax, 0x28
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 4d32da: sub eax, edx
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 4d32dc: cmp ecx, eax
        if (R.cLE) { pc = 0x4d3886; continue; } // 4d32de: jle 0x4d3886
        pc = 0x4d32e4; continue;
      case 0x4d32e4:
        R.edi = (R.add((R.edi >>> 0), 0x186a0, 32)) | 0; // 4d32e4: add edi, 0x186a0
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d32ea: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d32ee: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d32f2: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.1; // 4d32f6: fmul qword ptr [0x9689c0]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); R.fpop(); // 4d32fc: fstp qword ptr [esp + 0x44]
        R.fcom(R.st[0], R.f64(((R.esp + 0x44) | 0))); // 4d3300: fcom qword ptr [esp + 0x44]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d3304: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d3306: test ah, 1
        if (!R.zf) { pc = 0x4d3311; continue; } // 4d3309: jne 0x4d3311
        pc = 0x4d330b; continue;
      case 0x4d330b:
        R.fpop(); // 4d330b: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x44) | 0))); // 4d330d: fld qword ptr [esp + 0x44]
        pc = 0x4d3311; continue;
      case 0x4d3311:
        R.ftol(); // 4d3311: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d3316: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d3318: mov eax, dword ptr [esp + 0x94]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d331f: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d3321: mov dword ptr [esp + 0x14], edi
        if (R.zf) { pc = 0x4d3886; continue; } // 4d3325: je 0x4d3886
        pc = 0x4d332b; continue;
      case 0x4d332b:
        R.sub((R.esi >>> 0), R.m.u32(((R.eax + 0x57) | 0) >>> 0), 32); // 4d332b: cmp esi, dword ptr [eax + 0x57]
        if (!R.zf) { pc = 0x4d3886; continue; } // 4d332e: jne 0x4d3886
        pc = 0x4d3334; continue;
      case 0x4d3334:
        R.edi = (R.add((R.edi >>> 0), 0x61a8, 32)) | 0; // 4d3334: add edi, 0x61a8
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d333a: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d333e: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d3342: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.025; // 4d3346: fmul qword ptr [0x968fa0]
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d334c: fstp qword ptr [esp + 0x4c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x4c) | 0))); // 4d3350: fcom qword ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d3354: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d3356: test ah, 1
        if (!R.zf) { pc = 0x4d3361; continue; } // 4d3359: jne 0x4d3361
        pc = 0x4d335b; continue;
      case 0x4d335b:
        R.fpop(); // 4d335b: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d335d: fld qword ptr [esp + 0x4c]
        pc = 0x4d3361; continue;
      case 0x4d3361:
        R.ftol(); // 4d3361: call 0x945640
        pc = 0x4d3880; continue; // 4d3366: jmp 0x4d3880
      case 0x4d336b:
        R.esi = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d336b: mov esi, dword ptr [esp + 0x18]
        R.eax = (R.m.u32(((R.esi + 0x45) | 0) >>> 0)) | 0; // 4d336f: mov eax, dword ptr [esi + 0x45]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d3372: test eax, eax
        if (R.zf) { pc = 0x4d368d; continue; } // 4d3374: je 0x4d368d
        pc = 0x4d337a; continue;
      case 0x4d337a:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esi + 0x44) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d337a: mov cl, byte ptr [esi + 0x44]
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 4d337d: test cl, cl
        if (!R.cLE) { pc = 0x4d368d; continue; } // 4d337f: jg 0x4d368d
        pc = 0x4d3385; continue;
      case 0x4d3385:
        R.logic((R.eax >>> 0) & 0x101, 32); // 4d3385: test eax, 0x101
        if (R.zf) { pc = 0x4d3571; continue; } // 4d338a: je 0x4d3571
        pc = 0x4d3390; continue;
      case 0x4d3390:
        R.edx = (R.m.u32(((0xae2c94) | 0) >>> 0)) | 0; // 4d3390: mov edx, dword ptr [0xae2c94]
        R.eax = (R.m.u32(((0xae2c90) | 0) >>> 0)) | 0; // 4d3396: mov eax, dword ptr [0xae2c90]
        R.push((R.edx >>> 0)); // 4d339b: push edx
        R.push((R.eax >>> 0)); // 4d339c: push eax
        R.ecx = (((R.esi + 0x2d) | 0)) | 0; // 4d339d: lea ecx, [esi + 0x2d]
        R.call(0x54cdb0, { n: 2, thisEcx: true, calleeClean: true }); // 4d33a0: call 0x54cdb0
        R.sub((R.eax >>> 0), 0x1a9, 32); // 4d33a5: cmp eax, 0x1a9
        if (R.cLE) { pc = 0x4d3571; continue; } // 4d33aa: jle 0x4d3571
        pc = 0x4d33b0; continue;
      case 0x4d33b0:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d33b0: mov al, byte ptr [esi + 0x4f]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d33b3: and al, 0xf0
        R.sub(((R.eax >>> 0) & 0xff), 0x10, 8); // 4d33b5: cmp al, 0x10
        if (!R.zf) { pc = 0x4d3449; continue; } // 4d33b7: jne 0x4d3449
        pc = 0x4d33bd; continue;
      case 0x4d33bd:
        R.edi = (R.add((R.edi >>> 0), 0x7a120, 32)) | 0; // 4d33bd: add edi, 0x7a120
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d33c3: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d33c7: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d33cb: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.25; // 4d33cf: fmul qword ptr [0x968928]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); R.fpop(); // 4d33d5: fstp qword ptr [esp + 0x44]
        R.fcom(R.st[0], R.f64(((R.esp + 0x44) | 0))); // 4d33d9: fcom qword ptr [esp + 0x44]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d33dd: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d33df: test ah, 1
        if (!R.zf) { pc = 0x4d33ea; continue; } // 4d33e2: jne 0x4d33ea
        pc = 0x4d33e4; continue;
      case 0x4d33e4:
        R.fpop(); // 4d33e4: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x44) | 0))); // 4d33e6: fld qword ptr [esp + 0x44]
        pc = 0x4d33ea; continue;
      case 0x4d33ea:
        R.ftol(); // 4d33ea: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d33ef: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d33f1: mov eax, dword ptr [esp + 0x94]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d33f8: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d33fa: mov dword ptr [esp + 0x14], edi
        if (R.zf) { pc = 0x4d3886; continue; } // 4d33fe: je 0x4d3886
        pc = 0x4d3404; continue;
      case 0x4d3404:
        R.ecx = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d3404: mov ecx, dword ptr [ebp + 0x57]
        R.edx = (R.m.u32(((R.eax + 0x57) | 0) >>> 0)) | 0; // 4d3407: mov edx, dword ptr [eax + 0x57]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 4d340a: cmp ecx, edx
        if (!R.zf) { pc = 0x4d3886; continue; } // 4d340c: jne 0x4d3886
        pc = 0x4d3412; continue;
      case 0x4d3412:
        R.edi = (R.add((R.edi >>> 0), 0x3d090, 32)) | 0; // 4d3412: add edi, 0x3d090
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d3418: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d341c: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d3420: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.1; // 4d3424: fmul qword ptr [0x9689c0]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); R.fpop(); // 4d342a: fstp qword ptr [esp + 0x44]
        R.fcom(R.st[0], R.f64(((R.esp + 0x44) | 0))); // 4d342e: fcom qword ptr [esp + 0x44]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d3432: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d3434: test ah, 1
        if (!R.zf) { pc = 0x4d343f; continue; } // 4d3437: jne 0x4d343f
        pc = 0x4d3439; continue;
      case 0x4d3439:
        R.fpop(); // 4d3439: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x44) | 0))); // 4d343b: fld qword ptr [esp + 0x44]
        pc = 0x4d343f; continue;
      case 0x4d343f:
        R.ftol(); // 4d343f: call 0x945640
        pc = 0x4d3880; continue; // 4d3444: jmp 0x4d3880
      case 0x4d3449:
        R.sub(((R.eax >>> 0) & 0xff), 0x20, 8); // 4d3449: cmp al, 0x20
        if (!R.zf) { pc = 0x4d34dd; continue; } // 4d344b: jne 0x4d34dd
        pc = 0x4d3451; continue;
      case 0x4d3451:
        R.edi = (R.add((R.edi >>> 0), 0xf4240, 32)) | 0; // 4d3451: add edi, 0xf4240
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d3457: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d345b: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d345f: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.2; // 4d3463: fmul qword ptr [0x968978]
        R.m.wf64(((R.esp + 0x6c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d3469: fstp qword ptr [esp + 0x6c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x6c) | 0))); // 4d346d: fcom qword ptr [esp + 0x6c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d3471: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d3473: test ah, 1
        if (!R.zf) { pc = 0x4d347e; continue; } // 4d3476: jne 0x4d347e
        pc = 0x4d3478; continue;
      case 0x4d3478:
        R.fpop(); // 4d3478: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x6c) | 0))); // 4d347a: fld qword ptr [esp + 0x6c]
        pc = 0x4d347e; continue;
      case 0x4d347e:
        R.ftol(); // 4d347e: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d3483: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d3485: mov eax, dword ptr [esp + 0x94]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d348c: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d348e: mov dword ptr [esp + 0x14], edi
        if (R.zf) { pc = 0x4d3886; continue; } // 4d3492: je 0x4d3886
        pc = 0x4d3498; continue;
      case 0x4d3498:
        R.edx = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d3498: mov edx, dword ptr [ebp + 0x57]
        R.ecx = (R.m.u32(((R.eax + 0x57) | 0) >>> 0)) | 0; // 4d349b: mov ecx, dword ptr [eax + 0x57]
        R.sub((R.edx >>> 0), (R.ecx >>> 0), 32); // 4d349e: cmp edx, ecx
        if (!R.zf) { pc = 0x4d3886; continue; } // 4d34a0: jne 0x4d3886
        pc = 0x4d34a6; continue;
      case 0x4d34a6:
        R.edi = (R.add((R.edi >>> 0), 0x30d40, 32)) | 0; // 4d34a6: add edi, 0x30d40
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d34ac: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d34b0: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d34b4: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.05; // 4d34b8: fmul qword ptr [0x9689b8]
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d34be: fstp qword ptr [esp + 0x4c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x4c) | 0))); // 4d34c2: fcom qword ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d34c6: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d34c8: test ah, 1
        if (!R.zf) { pc = 0x4d34d3; continue; } // 4d34cb: jne 0x4d34d3
        pc = 0x4d34cd; continue;
      case 0x4d34cd:
        R.fpop(); // 4d34cd: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d34cf: fld qword ptr [esp + 0x4c]
        pc = 0x4d34d3; continue;
      case 0x4d34d3:
        R.ftol(); // 4d34d3: call 0x945640
        pc = 0x4d3880; continue; // 4d34d8: jmp 0x4d3880
      case 0x4d34dd:
        R.sub(((R.eax >>> 0) & 0xff), 0x30, 8); // 4d34dd: cmp al, 0x30
        if (!R.zf) { pc = 0x4d3886; continue; } // 4d34df: jne 0x4d3886
        pc = 0x4d34e5; continue;
      case 0x4d34e5:
        R.edi = (R.add((R.edi >>> 0), 0xb71b0, 32)) | 0; // 4d34e5: add edi, 0xb71b0
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d34eb: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d34ef: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d34f3: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.15; // 4d34f7: fmul qword ptr [0x968980]
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d34fd: fstp qword ptr [esp + 0x4c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x4c) | 0))); // 4d3501: fcom qword ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d3505: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d3507: test ah, 1
        if (!R.zf) { pc = 0x4d3512; continue; } // 4d350a: jne 0x4d3512
        pc = 0x4d350c; continue;
      case 0x4d350c:
        R.fpop(); // 4d350c: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d350e: fld qword ptr [esp + 0x4c]
        pc = 0x4d3512; continue;
      case 0x4d3512:
        R.ftol(); // 4d3512: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d3517: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d3519: mov eax, dword ptr [esp + 0x94]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d3520: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d3522: mov dword ptr [esp + 0x14], edi
        if (R.zf) { pc = 0x4d3886; continue; } // 4d3526: je 0x4d3886
        pc = 0x4d352c; continue;
      case 0x4d352c:
        R.ecx = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d352c: mov ecx, dword ptr [ebp + 0x57]
        R.edx = (R.m.u32(((R.eax + 0x57) | 0) >>> 0)) | 0; // 4d352f: mov edx, dword ptr [eax + 0x57]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 4d3532: cmp ecx, edx
        if (!R.zf) { pc = 0x4d3886; continue; } // 4d3534: jne 0x4d3886
        pc = 0x4d353a; continue;
      case 0x4d353a:
        R.edi = (R.add((R.edi >>> 0), 0x249f0, 32)) | 0; // 4d353a: add edi, 0x249f0
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d3540: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3544: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d3548: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.02; // 4d354c: fmul qword ptr [0x968f88]
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d3552: fstp qword ptr [esp + 0x4c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x4c) | 0))); // 4d3556: fcom qword ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d355a: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d355c: test ah, 1
        if (!R.zf) { pc = 0x4d3567; continue; } // 4d355f: jne 0x4d3567
        pc = 0x4d3561; continue;
      case 0x4d3561:
        R.fpop(); // 4d3561: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d3563: fld qword ptr [esp + 0x4c]
        pc = 0x4d3567; continue;
      case 0x4d3567:
        R.ftol(); // 4d3567: call 0x945640
        pc = 0x4d3880; continue; // 4d356c: jmp 0x4d3880
      case 0x4d3571:
        R.edx = (R.m.u32(((0xae2c94) | 0) >>> 0)) | 0; // 4d3571: mov edx, dword ptr [0xae2c94]
        R.eax = (R.m.u32(((0xae2c90) | 0) >>> 0)) | 0; // 4d3577: mov eax, dword ptr [0xae2c90]
        R.push((R.edx >>> 0)); // 4d357c: push edx
        R.push((R.eax >>> 0)); // 4d357d: push eax
        R.ecx = (((R.esi + 0x2d) | 0)) | 0; // 4d357e: lea ecx, [esi + 0x2d]
        R.call(0x54cdb0, { n: 2, thisEcx: true, calleeClean: true }); // 4d3581: call 0x54cdb0
        R.sub((R.eax >>> 0), 0xe1, 32); // 4d3586: cmp eax, 0xe1
        if (R.cLE) { pc = 0x4d3886; continue; } // 4d358b: jle 0x4d3886
        pc = 0x4d3591; continue;
      case 0x4d3591:
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d3591: mov ecx, dword ptr [esp + 0x18]
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.ecx + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d3595: mov dl, byte ptr [ecx + 0x4f]
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d3598: and dl, 0xf0
        R.sub(((R.edx >>> 0) & 0xff), 0x70, 8); // 4d359b: cmp dl, 0x70
        if (R.zf) { pc = 0x4d3886; continue; } // 4d359e: je 0x4d3886
        pc = 0x4d35a4; continue;
      case 0x4d35a4:
        R.eax = (R.m.u32(((R.esp + 0x98) | 0) >>> 0)) | 0; // 4d35a4: mov eax, dword ptr [esp + 0x98]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + 0x59) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d35ab: mov cl, byte ptr [eax + 0x59]
        R.eax = (((R.m.u8(((R.eax + 0x5b) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d35ae: movsx eax, byte ptr [eax + 0x5b]
        R.edx = (((((R.ecx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 4d35b2: movsx edx, cl
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 4d35b5: add eax, edx
        R.sub((R.eax >>> 0), 0xa, 32); // 4d35b7: cmp eax, 0xa
        if (R.cLE) { pc = 0x4d3886; continue; } // 4d35ba: jle 0x4d3886
        pc = 0x4d35c0; continue;
      case 0x4d35c0:
        R.eax = (R.m.u32(((R.esp + 0x98) | 0) >>> 0)) | 0; // 4d35c0: mov eax, dword ptr [esp + 0x98]
        R.eax = (R.m.u32(((R.eax + 0x61) | 0) >>> 0)) | 0; // 4d35c7: mov eax, dword ptr [eax + 0x61]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d35ca: test eax, eax
        if (R.zf) { pc = 0x4d3886; continue; } // 4d35cc: je 0x4d3886
        pc = 0x4d35d2; continue;
      case 0x4d35d2:
        R.sub(R.m.u16(((R.eax + 0xb) | 0) >>> 0), 0x1482, 16); // 4d35d2: cmp word ptr [eax + 0xb], 0x1482
        if (R.cLE) { pc = 0x4d3886; continue; } // 4d35d8: jle 0x4d3886
        pc = 0x4d35de; continue;
      case 0x4d35de:
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d35de: mov eax, dword ptr [esp + 0x18]
        R.edx = ((R.edx & 0xffffff00) | (((0xa) & 0xff) << 0)) | 0; // 4d35e2: mov dl, 0xa
        R.edx = ((R.edx & 0xffffff00) | (((R.sub(((R.edx >>> 0) & 0xff), ((R.ecx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 4d35e4: sub dl, cl
        R.sub(R.m.u8(((R.eax + 0x3d) | 0) >>> 0), ((R.edx >>> 0) & 0xff), 8); // 4d35e6: cmp byte ptr [eax + 0x3d], dl
        if (R.cLE) { pc = 0x4d3886; continue; } // 4d35e9: jle 0x4d3886
        pc = 0x4d35ef; continue;
      case 0x4d35ef:
        R.sub(((R.ebx >>> 0) & 0xff), 0x16, 8); // 4d35ef: cmp bl, 0x16
        if (R.cLE) { pc = 0x4d3886; continue; } // 4d35f2: jle 0x4d3886
        pc = 0x4d35f8; continue;
      case 0x4d35f8:
        R.sub(((R.ebx >>> 0) & 0xff), 0x1f, 8); // 4d35f8: cmp bl, 0x1f
        if (!R.cL) { pc = 0x4d3886; continue; } // 4d35fb: jge 0x4d3886
        pc = 0x4d3601; continue;
      case 0x4d3601:
        R.edi = (R.add((R.edi >>> 0), 0xb71b0, 32)) | 0; // 4d3601: add edi, 0xb71b0
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d3607: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d360b: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d360f: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.15; // 4d3613: fmul qword ptr [0x968980]
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d3619: fstp qword ptr [esp + 0x4c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x4c) | 0))); // 4d361d: fcom qword ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d3621: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d3623: test ah, 1
        if (!R.zf) { pc = 0x4d362e; continue; } // 4d3626: jne 0x4d362e
        pc = 0x4d3628; continue;
      case 0x4d3628:
        R.fpop(); // 4d3628: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d362a: fld qword ptr [esp + 0x4c]
        pc = 0x4d362e; continue;
      case 0x4d362e:
        R.ftol(); // 4d362e: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d3633: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d3635: mov eax, dword ptr [esp + 0x94]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d363c: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d363e: mov dword ptr [esp + 0x14], edi
        if (R.zf) { pc = 0x4d3886; continue; } // 4d3642: je 0x4d3886
        pc = 0x4d3648; continue;
      case 0x4d3648:
        R.ecx = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d3648: mov ecx, dword ptr [ebp + 0x57]
        R.edx = ((R.eax >>> 0)) | 0; // 4d364b: mov edx, eax
        R.sub((R.ecx >>> 0), R.m.u32(((R.edx + 0x57) | 0) >>> 0), 32); // 4d364d: cmp ecx, dword ptr [edx + 0x57]
        if (!R.zf) { pc = 0x4d3886; continue; } // 4d3650: jne 0x4d3886
        pc = 0x4d3656; continue;
      case 0x4d3656:
        R.edi = (R.add((R.edi >>> 0), 0x249f0, 32)) | 0; // 4d3656: add edi, 0x249f0
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d365c: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3660: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d3664: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.02; // 4d3668: fmul qword ptr [0x968f88]
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d366e: fstp qword ptr [esp + 0x4c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x4c) | 0))); // 4d3672: fcom qword ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d3676: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d3678: test ah, 1
        if (!R.zf) { pc = 0x4d3683; continue; } // 4d367b: jne 0x4d3683
        pc = 0x4d367d; continue;
      case 0x4d367d:
        R.fpop(); // 4d367d: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d367f: fld qword ptr [esp + 0x4c]
        pc = 0x4d3683; continue;
      case 0x4d3683:
        R.ftol(); // 4d3683: call 0x945640
        pc = 0x4d3880; continue; // 4d3688: jmp 0x4d3880
      case 0x4d368d:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d368d: mov al, byte ptr [esi + 0x4f]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d3690: and al, 0xf0
        R.sub(((R.eax >>> 0) & 0xff), 0x10, 8); // 4d3692: cmp al, 0x10
        if (!R.zf) { pc = 0x4d36fc; continue; } // 4d3694: jne 0x4d36fc
        pc = 0x4d3696; continue;
      case 0x4d3696:
        R.eax = (((R.edi + 0x1e8480) | 0)) | 0; // 4d3696: lea eax, [edi + 0x1e8480]
        R.edi = (R.add((R.edi >>> 0), (R.edi >>> 0), 32)) | 0; // 4d369c: add edi, edi
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 4d369e: cmp eax, edi
        if (!R.cL) { pc = 0x4d36a4; continue; } // 4d36a0: jge 0x4d36a4
        pc = 0x4d36a2; continue;
      case 0x4d36a2:
        R.edi = ((R.eax >>> 0)) | 0; // 4d36a2: mov edi, eax
        pc = 0x4d36a4; continue;
      case 0x4d36a4:
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d36a4: mov eax, dword ptr [esp + 0x94]
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d36ab: mov dword ptr [esp + 0x14], edi
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d36af: test eax, eax
        if (R.zf) { pc = 0x4d3886; continue; } // 4d36b1: je 0x4d3886
        pc = 0x4d36b7; continue;
      case 0x4d36b7:
        R.ecx = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d36b7: mov ecx, dword ptr [ebp + 0x57]
        R.edx = (R.m.u32(((R.eax + 0x57) | 0) >>> 0)) | 0; // 4d36ba: mov edx, dword ptr [eax + 0x57]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 4d36bd: cmp ecx, edx
        if (!R.zf) { pc = 0x4d3886; continue; } // 4d36bf: jne 0x4d3886
        pc = 0x4d36c5; continue;
      case 0x4d36c5:
        R.edi = (R.add((R.edi >>> 0), 0x186a0, 32)) | 0; // 4d36c5: add edi, 0x186a0
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d36cb: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d36cf: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d36d3: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.1; // 4d36d7: fmul qword ptr [0x9689c0]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); R.fpop(); // 4d36dd: fstp qword ptr [esp + 0x44]
        R.fcom(R.st[0], R.f64(((R.esp + 0x44) | 0))); // 4d36e1: fcom qword ptr [esp + 0x44]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d36e5: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d36e7: test ah, 1
        if (!R.zf) { pc = 0x4d36f2; continue; } // 4d36ea: jne 0x4d36f2
        pc = 0x4d36ec; continue;
      case 0x4d36ec:
        R.fpop(); // 4d36ec: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x44) | 0))); // 4d36ee: fld qword ptr [esp + 0x44]
        pc = 0x4d36f2; continue;
      case 0x4d36f2:
        R.ftol(); // 4d36f2: call 0x945640
        pc = 0x4d3880; continue; // 4d36f7: jmp 0x4d3880
      case 0x4d36fc:
        R.sub(((R.eax >>> 0) & 0xff), 0x20, 8); // 4d36fc: cmp al, 0x20
        if (!R.zf) { pc = 0x4d3790; continue; } // 4d36fe: jne 0x4d3790
        pc = 0x4d3704; continue;
      case 0x4d3704:
        R.edi = (R.add((R.edi >>> 0), 0x16e360, 32)) | 0; // 4d3704: add edi, 0x16e360
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d370a: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d370e: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d3712: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.5; // 4d3716: fmul qword ptr [0x968940]
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d371c: fstp qword ptr [esp + 0x4c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x4c) | 0))); // 4d3720: fcom qword ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d3724: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d3726: test ah, 1
        if (!R.zf) { pc = 0x4d3731; continue; } // 4d3729: jne 0x4d3731
        pc = 0x4d372b; continue;
      case 0x4d372b:
        R.fpop(); // 4d372b: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d372d: fld qword ptr [esp + 0x4c]
        pc = 0x4d3731; continue;
      case 0x4d3731:
        R.ftol(); // 4d3731: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d3736: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d3738: mov eax, dword ptr [esp + 0x94]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d373f: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d3741: mov dword ptr [esp + 0x14], edi
        if (R.zf) { pc = 0x4d3886; continue; } // 4d3745: je 0x4d3886
        pc = 0x4d374b; continue;
      case 0x4d374b:
        R.edx = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d374b: mov edx, dword ptr [ebp + 0x57]
        R.ecx = (R.m.u32(((R.eax + 0x57) | 0) >>> 0)) | 0; // 4d374e: mov ecx, dword ptr [eax + 0x57]
        R.sub((R.edx >>> 0), (R.ecx >>> 0), 32); // 4d3751: cmp edx, ecx
        if (!R.zf) { pc = 0x4d3886; continue; } // 4d3753: jne 0x4d3886
        pc = 0x4d3759; continue;
      case 0x4d3759:
        R.edi = (R.add((R.edi >>> 0), 0x124f8, 32)) | 0; // 4d3759: add edi, 0x124f8
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d375f: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3763: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d3767: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.075; // 4d376b: fmul qword ptr [0x968f90]
        R.m.wf64(((R.esp + 0x6c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d3771: fstp qword ptr [esp + 0x6c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x6c) | 0))); // 4d3775: fcom qword ptr [esp + 0x6c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d3779: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d377b: test ah, 1
        if (!R.zf) { pc = 0x4d3786; continue; } // 4d377e: jne 0x4d3786
        pc = 0x4d3780; continue;
      case 0x4d3780:
        R.fpop(); // 4d3780: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x6c) | 0))); // 4d3782: fld qword ptr [esp + 0x6c]
        pc = 0x4d3786; continue;
      case 0x4d3786:
        R.ftol(); // 4d3786: call 0x945640
        pc = 0x4d3880; continue; // 4d378b: jmp 0x4d3880
      case 0x4d3790:
        R.sub(((R.eax >>> 0) & 0xff), 0x30, 8); // 4d3790: cmp al, 0x30
        if (!R.zf) { pc = 0x4d3886; continue; } // 4d3792: jne 0x4d3886
        pc = 0x4d3798; continue;
      case 0x4d3798:
        R.edi = (R.add((R.edi >>> 0), 0xf4240, 32)) | 0; // 4d3798: add edi, 0xf4240
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d379e: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d37a2: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d37a6: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.5; // 4d37aa: fmul qword ptr [0x968940]
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d37b0: fstp qword ptr [esp + 0x4c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x4c) | 0))); // 4d37b4: fcom qword ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d37b8: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d37ba: test ah, 1
        if (!R.zf) { pc = 0x4d37c5; continue; } // 4d37bd: jne 0x4d37c5
        pc = 0x4d37bf; continue;
      case 0x4d37bf:
        R.fpop(); // 4d37bf: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d37c1: fld qword ptr [esp + 0x4c]
        pc = 0x4d37c5; continue;
      case 0x4d37c5:
        R.ftol(); // 4d37c5: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d37ca: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d37cc: mov eax, dword ptr [esp + 0x94]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d37d3: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d37d5: mov dword ptr [esp + 0x14], edi
        if (R.zf) { pc = 0x4d3886; continue; } // 4d37d9: je 0x4d3886
        pc = 0x4d37df; continue;
      case 0x4d37df:
        R.ecx = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d37df: mov ecx, dword ptr [esp + 0x94]
        R.eax = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d37e6: mov eax, dword ptr [ebp + 0x57]
        R.sub((R.eax >>> 0), R.m.u32(((R.ecx + 0x57) | 0) >>> 0), 32); // 4d37e9: cmp eax, dword ptr [ecx + 0x57]
        if (!R.zf) { pc = 0x4d3886; continue; } // 4d37ec: jne 0x4d3886
        pc = 0x4d37f2; continue;
      case 0x4d37f2:
        R.edi = (R.add((R.edi >>> 0), 0x4e20, 32)) | 0; // 4d37f2: add edi, 0x4e20
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d37f8: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d37fc: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d3800: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.02; // 4d3804: fmul qword ptr [0x968f88]
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d380a: fstp qword ptr [esp + 0x4c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x4c) | 0))); // 4d380e: fcom qword ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d3812: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d3814: test ah, 1
        if (!R.zf) { pc = 0x4d381f; continue; } // 4d3817: jne 0x4d381f
        pc = 0x4d3819; continue;
      case 0x4d3819:
        R.fpop(); // 4d3819: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d381b: fld qword ptr [esp + 0x4c]
        pc = 0x4d381f; continue;
      case 0x4d381f:
        R.ftol(); // 4d381f: call 0x945640
        pc = 0x4d3880; continue; // 4d3824: jmp 0x4d3880
      case 0x4d3826:
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 4d3826: test esi, esi
        if (!R.zf) { pc = 0x4d3886; continue; } // 4d3828: jne 0x4d3886
        pc = 0x4d382a; continue;
      case 0x4d382a:
        R.sub((R.edi >>> 0), R.m.u32(((R.esp + 0x1c) | 0) >>> 0), 32); // 4d382a: cmp edi, dword ptr [esp + 0x1c]
        if (R.cLE) { pc = 0x4d3886; continue; } // 4d382e: jle 0x4d3886
        pc = 0x4d3830; continue;
      case 0x4d3830:
        R.sub(R.m.u16(((R.esp + 0x24) | 0) >>> 0), 0x3c, 16); // 4d3830: cmp word ptr [esp + 0x24], 0x3c
        if (!R.cL) { pc = 0x4d3855; continue; } // 4d3836: jge 0x4d3855
        pc = 0x4d3838; continue;
      case 0x4d3838:
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 4d3838: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 0.67; // 4d383c: fmul qword ptr [0x968f80]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d3842: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.33; // 4d3846: fmul qword ptr [0x968f78]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 4d384c: faddp st(1)
        R.ftol(); // 4d384e: call 0x945640
        pc = 0x4d3880; continue; // 4d3853: jmp 0x4d3880
      case 0x4d3855:
        R.fpush(R.f64(((R.esp + 0x6c) | 0))); // 4d3855: fld qword ptr [esp + 0x6c]
        R.st[0] = R.st[0] * 0.01; // 4d3859: fmul qword ptr [0x967898]
        R.st[0] = 1.27 - R.st[0]; // 4d385f: fsubr qword ptr [0x968f70]
        R.fpush(1.0); // 4d3865: fld qword ptr [0x967890]
        R.st[0] = R.st[0] - R.st[1]; // 4d386b: fsub st(1)
        R.st[0] = R.st[0] * R.m.s32(((R.esp + 0x14) | 0) >>> 0); // 4d386d: fimul dword ptr [esp + 0x14]
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 4d3871: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * R.st[2]; // 4d3875: fmul st(2)
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 4d3877: faddp st(1)
        R.ftol(); // 4d3879: call 0x945640
        R.fpop(); // 4d387e: fstp st(0)
        pc = 0x4d3880; continue;
      case 0x4d3880:
        R.edi = ((R.eax >>> 0)) | 0; // 4d3880: mov edi, eax
        pc = 0x4d3882; continue;
      case 0x4d3882:
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d3882: mov dword ptr [esp + 0x14], edi
        pc = 0x4d3886; continue;
      case 0x4d3886:
        R.sub(R.m.u8(((R.esp + 0x10) | 0) >>> 0), 0x18, 8); // 4d3886: cmp byte ptr [esp + 0x10], 0x18
        if (!R.cL) { pc = 0x4d402e; continue; } // 4d388b: jge 0x4d402e
        pc = 0x4d3891; continue;
      case 0x4d3891:
        R.eax = (R.m.u32(((R.esp + 0xa4) | 0) >>> 0)) | 0; // 4d3891: mov eax, dword ptr [esp + 0xa4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d3898: test eax, eax
        if (R.zf) { pc = 0x4d402e; continue; } // 4d389a: je 0x4d402e
        pc = 0x4d38a0; continue;
      case 0x4d38a0:
        R.esi = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 4d38a0: mov esi, dword ptr [esp + 0x20]
        R.sub(((R.esi >>> 0) & 0xffff), 0x6e, 16); // 4d38a4: cmp si, 0x6e
        if (R.cLE) { pc = 0x4d402e; continue; } // 4d38a8: jle 0x4d402e
        pc = 0x4d38ae; continue;
      case 0x4d38ae:
        R.edx = (R.m.u32(((R.esp + 0x90) | 0) >>> 0)) | 0; // 4d38ae: mov edx, dword ptr [esp + 0x90]
        R.eax = (R.m.u32(((R.edx + 0x53) | 0) >>> 0)) | 0; // 4d38b5: mov eax, dword ptr [edx + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d38b8: test eax, eax
        if (R.zf) { pc = 0x4d402e; continue; } // 4d38ba: je 0x4d402e
        pc = 0x4d38c0; continue;
      case 0x4d38c0:
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d38c0: mov eax, dword ptr [esp + 0x18]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d38c4: mov cl, byte ptr [eax + 0x4f]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d38c7: and cl, 0xf0
        R.sub(((R.ecx >>> 0) & 0xff), 0x70, 8); // 4d38ca: cmp cl, 0x70
        if (R.zf) { pc = 0x4d402e; continue; } // 4d38cd: je 0x4d402e
        pc = 0x4d38d3; continue;
      case 0x4d38d3:
        R.ebp = (R.m.u32(((R.esp + 0x98) | 0) >>> 0)) | 0; // 4d38d3: mov ebp, dword ptr [esp + 0x98]
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, 0x0); // 4d38da: mov dword ptr [esp + 0x34], 0
        R.eax = (R.m.u32(((R.ebp + 0x61) | 0) >>> 0)) | 0; // 4d38e2: mov eax, dword ptr [ebp + 0x61]
        R.sub(R.m.u8(((R.eax + 0xf) | 0) >>> 0), 0x14, 8); // 4d38e5: cmp byte ptr [eax + 0xf], 0x14
        if (R.zf) { pc = 0x4d3ba5; continue; } // 4d38e9: je 0x4d3ba5
        pc = 0x4d38ef; continue;
      case 0x4d38ef:
        R.edx = (((R.m.u8(((R.esp + 0x10) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d38ef: movsx edx, byte ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edx >>> 0)); // 4d38f4: mov dword ptr [esp + 0x38], edx
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.eax + 0x36) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d38f8: mov bl, byte ptr [eax + 0x36]
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d38fb: fild dword ptr [esp + 0x38]
        R.ecx = (((R.m.u8(((R.eax + 0x3c) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d38ff: movsx ecx, byte ptr [eax + 0x3c]
        R.st[0] = R.st[0] * 0.07; // 4d3903: fmul qword ptr [0x968f68]
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x1b) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d3909: mov dl, byte ptr [eax + 0x1b]
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.ecx >>> 0)); // 4d390c: mov dword ptr [esp + 0x38], ecx
        R.ebx = ((R.ebx & 0xffffff00) | (((R.add(((R.ebx >>> 0) & 0xff), ((R.edx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 4d3910: add bl, dl
        R.st[0] = 2.6 - R.st[0]; // 4d3912: fsubr qword ptr [0x968f60]
        R.edx = (((R.m.u8(((R.eax + 0x3d) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d3918: movsx edx, byte ptr [eax + 0x3d]
        R.m.wf64(((R.esp + 0x7c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d391c: fstp qword ptr [esp + 0x7c]
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3920: fild dword ptr [esp + 0x38]
        R.ecx = (((R.m.u8(((R.eax + 0x3f) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d3924: movsx ecx, byte ptr [eax + 0x3f]
        R.st[0] = R.st[0] * 1.2; // 4d3928: fmul qword ptr [0x968978]
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edx >>> 0)); // 4d392e: mov dword ptr [esp + 0x38], edx
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3932: fild dword ptr [esp + 0x38]
        R.edx = (((R.m.u8(((R.eax + 0x44) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d3936: movsx edx, byte ptr [eax + 0x44]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 4d393a: faddp st(1)
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.ecx >>> 0)); // 4d393c: mov dword ptr [esp + 0x38], ecx
        R.eax = (((R.m.u8(((R.eax + 0x2e) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d3940: movsx eax, byte ptr [eax + 0x2e]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x7c) | 0)); // 4d3944: fmul qword ptr [esp + 0x7c]
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3948: fild dword ptr [esp + 0x38]
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edx >>> 0)); // 4d394c: mov dword ptr [esp + 0x38], edx
        R.st[0] = R.st[0] * 0.8; // 4d3950: fmul qword ptr [0x9689b0]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 4d3956: faddp st(1)
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3958: fild dword ptr [esp + 0x38]
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.eax >>> 0)); // 4d395c: mov dword ptr [esp + 0x38], eax
        R.st[0] = R.st[0] * 1.2; // 4d3960: fmul qword ptr [0x968978]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 4d3966: faddp st(1)
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3968: fild dword ptr [esp + 0x38]
        R.st[0] = R.st[0] * 0.75; // 4d396c: fmul qword ptr [0x969040]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 4d3972: faddp st(1)
        R.ftol(); // 4d3974: call 0x945640
        R.push(0xb); // 4d3979: push 0xb
        R.push((R.ebp >>> 0)); // 4d397b: push ebp
        R.m.w8(((R.esp + 0x1b) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 4d397c: mov byte ptr [esp + 0x1b], al
        R.call(0x5431e0, { n: 2, thisEcx: false, calleeClean: false }); // 4d3980: call 0x5431e0
        R.ecx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 4d3985: movsx ecx, al
        R.m.w32(((R.esp + 0x40) | 0) >>> 0, (R.ecx >>> 0)); // 4d3988: mov dword ptr [esp + 0x40], ecx
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 4d398c: add esp, 8
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d398f: fild dword ptr [esp + 0x38]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x7c) | 0)); // 4d3993: fmul qword ptr [esp + 0x7c]
        R.ftol(); // 4d3997: call 0x945640
        R.sub(((R.eax >>> 0) & 0xff), 0x14, 8); // 4d399c: cmp al, 0x14
        R.m.w8(((R.esp + 0x11) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 4d399e: mov byte ptr [esp + 0x11], al
        if (R.cL) { pc = 0x4d39a9; continue; } // 4d39a2: jl 0x4d39a9
        pc = 0x4d39a4; continue;
      case 0x4d39a4:
        R.m.w8(((R.esp + 0x11) | 0) >>> 0, 0x14); // 4d39a4: mov byte ptr [esp + 0x11], 0x14
        pc = 0x4d39a9; continue;
      case 0x4d39a9:
        R.push(0xc); // 4d39a9: push 0xc
        R.push((R.ebp >>> 0)); // 4d39ab: push ebp
        R.call(0x5431e0, { n: 2, thisEcx: false, calleeClean: false }); // 4d39ac: call 0x5431e0
        R.edx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 4d39b1: movsx edx, al
        R.m.w32(((R.esp + 0x40) | 0) >>> 0, (R.edx >>> 0)); // 4d39b4: mov dword ptr [esp + 0x40], edx
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 4d39b8: add esp, 8
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d39bb: fild dword ptr [esp + 0x38]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x7c) | 0)); // 4d39bf: fmul qword ptr [esp + 0x7c]
        R.ftol(); // 4d39c3: call 0x945640
        R.sub(((R.eax >>> 0) & 0xff), 0x14, 8); // 4d39c8: cmp al, 0x14
        if (!R.cL) { pc = 0x4d39d2; continue; } // 4d39ca: jge 0x4d39d2
        pc = 0x4d39cc; continue;
      case 0x4d39cc:
        R.m.w8(((R.esp + 0x12) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 4d39cc: mov byte ptr [esp + 0x12], al
        pc = 0x4d39db; continue; // 4d39d0: jmp 0x4d39db
      case 0x4d39d2:
        R.m.w8(((R.esp + 0x12) | 0) >>> 0, 0x14); // 4d39d2: mov byte ptr [esp + 0x12], 0x14
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x12) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d39d7: mov al, byte ptr [esp + 0x12]
        pc = 0x4d39db; continue;
      case 0x4d39db:
        R.sub(((R.ebx >>> 0) & 0xff), 0x28, 8); // 4d39db: cmp bl, 0x28
        if (!R.zf) { pc = 0x4d3a5a; continue; } // 4d39de: jne 0x4d3a5a
        pc = 0x4d39e0; continue;
      case 0x4d39e0:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esp + 0x13) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d39e0: mov cl, byte ptr [esp + 0x13]
        R.sub(((R.ecx >>> 0) & 0xff), 0x55, 8); // 4d39e4: cmp cl, 0x55
        if (R.cLE) { pc = 0x4d39f2; continue; } // 4d39e7: jle 0x4d39f2
        pc = 0x4d39e9; continue;
      case 0x4d39e9:
        R.ecx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 4d39e9: mov ecx, dword ptr [esp + 0x20]
        R.esi = (((R.ecx + 0xf) | 0)) | 0; // 4d39ed: lea esi, [ecx + 0xf]
        pc = 0x4d3a28; continue; // 4d39f0: jmp 0x4d3a28
      case 0x4d39f2:
        R.sub(((R.ecx >>> 0) & 0xff), 0x4b, 8); // 4d39f2: cmp cl, 0x4b
        if (R.cLE) { pc = 0x4d3a00; continue; } // 4d39f5: jle 0x4d3a00
        pc = 0x4d39f7; continue;
      case 0x4d39f7:
        R.edx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 4d39f7: mov edx, dword ptr [esp + 0x20]
        R.esi = (((R.edx + 0xa) | 0)) | 0; // 4d39fb: lea esi, [edx + 0xa]
        pc = 0x4d3a28; continue; // 4d39fe: jmp 0x4d3a28
      case 0x4d3a00:
        R.sub(((R.ecx >>> 0) & 0xff), 0x41, 8); // 4d3a00: cmp cl, 0x41
        if (R.cLE) { pc = 0x4d3a0e; continue; } // 4d3a03: jle 0x4d3a0e
        pc = 0x4d3a05; continue;
      case 0x4d3a05:
        R.ecx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 4d3a05: mov ecx, dword ptr [esp + 0x20]
        R.esi = (((R.ecx + 0x8) | 0)) | 0; // 4d3a09: lea esi, [ecx + 8]
        pc = 0x4d3a28; continue; // 4d3a0c: jmp 0x4d3a28
      case 0x4d3a0e:
        R.sub(((R.ecx >>> 0) & 0xff), 0x32, 8); // 4d3a0e: cmp cl, 0x32
        if (R.cLE) { pc = 0x4d3a1c; continue; } // 4d3a11: jle 0x4d3a1c
        pc = 0x4d3a13; continue;
      case 0x4d3a13:
        R.edx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 4d3a13: mov edx, dword ptr [esp + 0x20]
        R.esi = (((R.edx + 0x5) | 0)) | 0; // 4d3a17: lea esi, [edx + 5]
        pc = 0x4d3a28; continue; // 4d3a1a: jmp 0x4d3a28
      case 0x4d3a1c:
        R.sub(((R.ecx >>> 0) & 0xff), 0x23, 8); // 4d3a1c: cmp cl, 0x23
        if (R.cLE) { pc = 0x4d3a28; continue; } // 4d3a1f: jle 0x4d3a28
        pc = 0x4d3a21; continue;
      case 0x4d3a21:
        R.ecx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 4d3a21: mov ecx, dword ptr [esp + 0x20]
        R.esi = (((R.ecx + 0x3) | 0)) | 0; // 4d3a25: lea esi, [ecx + 3]
        pc = 0x4d3a28; continue;
      case 0x4d3a28:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esp + 0x11) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d3a28: mov cl, byte ptr [esp + 0x11]
        R.sub(((R.ecx >>> 0) & 0xff), 0xf, 8); // 4d3a2c: cmp cl, 0xf
        if (R.cLE) { pc = 0x4d3a3f; continue; } // 4d3a2f: jle 0x4d3a3f
        pc = 0x4d3a31; continue;
      case 0x4d3a31:
        R.edx = ((R.edx & 0xffff0000) | (((((((R.ecx >>> 0) & 0xff)) << 24 >> 24)) & 0xffff) << 0)) | 0; // 4d3a31: movsx dx, cl
        R.ecx = (((R.edx + -0xd) | 0)) | 0; // 4d3a35: lea ecx, [edx - 0xd]
        R.edx = ((R.ecx >>> 0)) | 0; // 4d3a38: mov edx, ecx
        { const p = BigInt((((R.ecx >>> 0)) | 0)) * BigInt((((R.edx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.edx = (Number(BigInt.asIntN(32, p))) | 0; } // 4d3a3a: imul edx, ecx
        R.esi = (R.add((R.esi >>> 0), (R.edx >>> 0), 32)) | 0; // 4d3a3d: add esi, edx
        pc = 0x4d3a3f; continue;
      case 0x4d3a3f:
        R.sub(((R.eax >>> 0) & 0xff), 0xf, 8); // 4d3a3f: cmp al, 0xf
        if (R.cLE) { pc = 0x4d3ba5; continue; } // 4d3a41: jle 0x4d3ba5
        pc = 0x4d3a47; continue;
      case 0x4d3a47:
        R.eax = ((R.eax & 0xffff0000) | (((((((R.eax >>> 0) & 0xff)) << 24 >> 24)) & 0xffff) << 0)) | 0; // 4d3a47: movsx ax, al
        R.eax = (R.add((R.eax >>> 0), 0xfffffff2, 32)) | 0; // 4d3a4b: add eax, -0xe
        R.ecx = ((R.eax >>> 0)) | 0; // 4d3a4e: mov ecx, eax
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 4d3a50: imul ecx, eax
        R.esi = (R.add((R.esi >>> 0), (R.ecx >>> 0), 32)) | 0; // 4d3a53: add esi, ecx
        pc = 0x4d3ba5; continue; // 4d3a55: jmp 0x4d3ba5
      case 0x4d3a5a:
        R.sub(((R.ebx >>> 0) & 0xff), 0x22, 8); // 4d3a5a: cmp bl, 0x22
        if (R.cLE) { pc = 0x4d3ae3; continue; } // 4d3a5d: jle 0x4d3ae3
        pc = 0x4d3a63; continue;
      case 0x4d3a63:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esp + 0x13) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d3a63: mov cl, byte ptr [esp + 0x13]
        R.sub(((R.ecx >>> 0) & 0xff), 0x4b, 8); // 4d3a67: cmp cl, 0x4b
        if (R.cLE) { pc = 0x4d3a75; continue; } // 4d3a6a: jle 0x4d3a75
        pc = 0x4d3a6c; continue;
      case 0x4d3a6c:
        R.edx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 4d3a6c: mov edx, dword ptr [esp + 0x20]
        R.esi = (((R.edx + 0x8) | 0)) | 0; // 4d3a70: lea esi, [edx + 8]
        pc = 0x4d3a9d; continue; // 4d3a73: jmp 0x4d3a9d
      case 0x4d3a75:
        R.sub(((R.ecx >>> 0) & 0xff), 0x41, 8); // 4d3a75: cmp cl, 0x41
        if (R.cLE) { pc = 0x4d3a83; continue; } // 4d3a78: jle 0x4d3a83
        pc = 0x4d3a7a; continue;
      case 0x4d3a7a:
        R.ecx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 4d3a7a: mov ecx, dword ptr [esp + 0x20]
        R.esi = (((R.ecx + 0x5) | 0)) | 0; // 4d3a7e: lea esi, [ecx + 5]
        pc = 0x4d3a9d; continue; // 4d3a81: jmp 0x4d3a9d
      case 0x4d3a83:
        R.sub(((R.ecx >>> 0) & 0xff), 0x32, 8); // 4d3a83: cmp cl, 0x32
        if (R.cLE) { pc = 0x4d3a91; continue; } // 4d3a86: jle 0x4d3a91
        pc = 0x4d3a88; continue;
      case 0x4d3a88:
        R.edx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 4d3a88: mov edx, dword ptr [esp + 0x20]
        R.esi = (((R.edx + 0x3) | 0)) | 0; // 4d3a8c: lea esi, [edx + 3]
        pc = 0x4d3a9d; continue; // 4d3a8f: jmp 0x4d3a9d
      case 0x4d3a91:
        R.sub(((R.ecx >>> 0) & 0xff), 0x23, 8); // 4d3a91: cmp cl, 0x23
        if (R.cLE) { pc = 0x4d3a9d; continue; } // 4d3a94: jle 0x4d3a9d
        pc = 0x4d3a96; continue;
      case 0x4d3a96:
        R.ecx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 4d3a96: mov ecx, dword ptr [esp + 0x20]
        R.esi = (((R.ecx + 0x1) | 0)) | 0; // 4d3a9a: lea esi, [ecx + 1]
        pc = 0x4d3a9d; continue;
      case 0x4d3a9d:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esp + 0x11) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d3a9d: mov cl, byte ptr [esp + 0x11]
        R.sub(((R.ecx >>> 0) & 0xff), 0xf, 8); // 4d3aa1: cmp cl, 0xf
        if (R.cLE) { pc = 0x4d3ab4; continue; } // 4d3aa4: jle 0x4d3ab4
        pc = 0x4d3aa6; continue;
      case 0x4d3aa6:
        R.edx = ((R.edx & 0xffff0000) | (((((((R.ecx >>> 0) & 0xff)) << 24 >> 24)) & 0xffff) << 0)) | 0; // 4d3aa6: movsx dx, cl
        R.ecx = (((R.edx + -0xf) | 0)) | 0; // 4d3aaa: lea ecx, [edx - 0xf]
        R.edx = ((R.ecx >>> 0)) | 0; // 4d3aad: mov edx, ecx
        { const p = BigInt((((R.ecx >>> 0)) | 0)) * BigInt((((R.edx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.edx = (Number(BigInt.asIntN(32, p))) | 0; } // 4d3aaf: imul edx, ecx
        R.esi = (R.add((R.esi >>> 0), (R.edx >>> 0), 32)) | 0; // 4d3ab2: add esi, edx
        pc = 0x4d3ab4; continue;
      case 0x4d3ab4:
        R.sub(((R.eax >>> 0) & 0xff), 0xf, 8); // 4d3ab4: cmp al, 0xf
        if (R.cLE) { pc = 0x4d3ba5; continue; } // 4d3ab6: jle 0x4d3ba5
        pc = 0x4d3abc; continue;
      case 0x4d3abc:
        R.eax = (((R.m.u8(((R.esp + 0x12) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d3abc: movsx eax, byte ptr [esp + 0x12]
        R.eax = (R.add((R.eax >>> 0), 0xfffffff1, 32)) | 0; // 4d3ac1: add eax, -0xf
        R.ecx = ((R.eax >>> 0)) | 0; // 4d3ac4: mov ecx, eax
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 4d3ac6: imul ecx, eax
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.ecx >>> 0)); // 4d3ac9: mov dword ptr [esp + 0x38], ecx
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3acd: fild dword ptr [esp + 0x38]
        R.st[0] = R.st[0] * 0.8; // 4d3ad1: fmul qword ptr [0x9689b0]
        R.ftol(); // 4d3ad7: call 0x945640
        R.esi = (R.add((R.esi >>> 0), (R.eax >>> 0), 32)) | 0; // 4d3adc: add esi, eax
        pc = 0x4d3ba5; continue; // 4d3ade: jmp 0x4d3ba5
      case 0x4d3ae3:
        R.sub(((R.ebx >>> 0) & 0xff), 0x19, 8); // 4d3ae3: cmp bl, 0x19
        if (R.cLE) { pc = 0x4d3b7b; continue; } // 4d3ae6: jle 0x4d3b7b
        pc = 0x4d3aec; continue;
      case 0x4d3aec:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esp + 0x13) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d3aec: mov cl, byte ptr [esp + 0x13]
        R.sub(((R.ecx >>> 0) & 0xff), 0x4b, 8); // 4d3af0: cmp cl, 0x4b
        if (R.cLE) { pc = 0x4d3afe; continue; } // 4d3af3: jle 0x4d3afe
        pc = 0x4d3af5; continue;
      case 0x4d3af5:
        R.edx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 4d3af5: mov edx, dword ptr [esp + 0x20]
        R.esi = (((R.edx + 0x5) | 0)) | 0; // 4d3af9: lea esi, [edx + 5]
        pc = 0x4d3b26; continue; // 4d3afc: jmp 0x4d3b26
      case 0x4d3afe:
        R.sub(((R.ecx >>> 0) & 0xff), 0x41, 8); // 4d3afe: cmp cl, 0x41
        if (R.cLE) { pc = 0x4d3b0c; continue; } // 4d3b01: jle 0x4d3b0c
        pc = 0x4d3b03; continue;
      case 0x4d3b03:
        R.ecx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 4d3b03: mov ecx, dword ptr [esp + 0x20]
        R.esi = (((R.ecx + 0x3) | 0)) | 0; // 4d3b07: lea esi, [ecx + 3]
        pc = 0x4d3b26; continue; // 4d3b0a: jmp 0x4d3b26
      case 0x4d3b0c:
        R.sub(((R.ecx >>> 0) & 0xff), 0x32, 8); // 4d3b0c: cmp cl, 0x32
        if (R.cLE) { pc = 0x4d3b1a; continue; } // 4d3b0f: jle 0x4d3b1a
        pc = 0x4d3b11; continue;
      case 0x4d3b11:
        R.edx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 4d3b11: mov edx, dword ptr [esp + 0x20]
        R.esi = (((R.edx + 0x1) | 0)) | 0; // 4d3b15: lea esi, [edx + 1]
        pc = 0x4d3b26; continue; // 4d3b18: jmp 0x4d3b26
      case 0x4d3b1a:
        R.sub(((R.ecx >>> 0) & 0xff), 0x23, 8); // 4d3b1a: cmp cl, 0x23
        if (!R.cL) { pc = 0x4d3b26; continue; } // 4d3b1d: jge 0x4d3b26
        pc = 0x4d3b1f; continue;
      case 0x4d3b1f:
        R.ecx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 4d3b1f: mov ecx, dword ptr [esp + 0x20]
        R.esi = (((R.ecx + -0x3) | 0)) | 0; // 4d3b23: lea esi, [ecx - 3]
        pc = 0x4d3b26; continue;
      case 0x4d3b26:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esp + 0x11) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d3b26: mov cl, byte ptr [esp + 0x11]
        R.sub(((R.ecx >>> 0) & 0xff), 0xf, 8); // 4d3b2a: cmp cl, 0xf
        if (R.cLE) { pc = 0x4d3b53; continue; } // 4d3b2d: jle 0x4d3b53
        pc = 0x4d3b2f; continue;
      case 0x4d3b2f:
        R.eax = (((((R.ecx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 4d3b2f: movsx eax, cl
        R.eax = (R.add((R.eax >>> 0), 0xfffffff1, 32)) | 0; // 4d3b32: add eax, -0xf
        R.edx = ((R.eax >>> 0)) | 0; // 4d3b35: mov edx, eax
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.edx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.edx = (Number(BigInt.asIntN(32, p))) | 0; } // 4d3b37: imul edx, eax
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edx >>> 0)); // 4d3b3a: mov dword ptr [esp + 0x38], edx
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3b3e: fild dword ptr [esp + 0x38]
        R.st[0] = R.st[0] * 0.8; // 4d3b42: fmul qword ptr [0x9689b0]
        R.ftol(); // 4d3b48: call 0x945640
        R.esi = (R.add((R.esi >>> 0), (R.eax >>> 0), 32)) | 0; // 4d3b4d: add esi, eax
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x12) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d3b4f: mov al, byte ptr [esp + 0x12]
        pc = 0x4d3b53; continue;
      case 0x4d3b53:
        R.sub(((R.eax >>> 0) & 0xff), 0xf, 8); // 4d3b53: cmp al, 0xf
        if (R.cLE) { pc = 0x4d3ba5; continue; } // 4d3b55: jle 0x4d3ba5
        pc = 0x4d3b57; continue;
      case 0x4d3b57:
        R.eax = (((R.m.u8(((R.esp + 0x12) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d3b57: movsx eax, byte ptr [esp + 0x12]
        R.eax = (R.add((R.eax >>> 0), 0xfffffff1, 32)) | 0; // 4d3b5c: add eax, -0xf
        R.ecx = ((R.eax >>> 0)) | 0; // 4d3b5f: mov ecx, eax
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 4d3b61: imul ecx, eax
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.ecx >>> 0)); // 4d3b64: mov dword ptr [esp + 0x38], ecx
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3b68: fild dword ptr [esp + 0x38]
        R.st[0] = R.st[0] * 0.5; // 4d3b6c: fmul qword ptr [0x968968]
        R.ftol(); // 4d3b72: call 0x945640
        R.esi = (R.add((R.esi >>> 0), (R.eax >>> 0), 32)) | 0; // 4d3b77: add esi, eax
        pc = 0x4d3ba5; continue; // 4d3b79: jmp 0x4d3ba5
      case 0x4d3b7b:
        R.sub(((R.ebx >>> 0) & 0xff), 0xf, 8); // 4d3b7b: cmp bl, 0xf
        if (!R.cL) { pc = 0x4d3ba5; continue; } // 4d3b7e: jge 0x4d3ba5
        pc = 0x4d3b80; continue;
      case 0x4d3b80:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x13) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d3b80: mov al, byte ptr [esp + 0x13]
        R.sub(((R.eax >>> 0) & 0xff), 0x32, 8); // 4d3b84: cmp al, 0x32
        if (R.cLE) { pc = 0x4d3b91; continue; } // 4d3b86: jle 0x4d3b91
        pc = 0x4d3b88; continue;
      case 0x4d3b88:
        R.edx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 4d3b88: mov edx, dword ptr [esp + 0x20]
        R.esi = (((R.edx + -0x5) | 0)) | 0; // 4d3b8c: lea esi, [edx - 5]
        pc = 0x4d3ba5; continue; // 4d3b8f: jmp 0x4d3ba5
      case 0x4d3b91:
        R.sub(((R.eax >>> 0) & 0xff), 0x23, 8); // 4d3b91: cmp al, 0x23
        if (R.cLE) { pc = 0x4d3b9e; continue; } // 4d3b93: jle 0x4d3b9e
        pc = 0x4d3b95; continue;
      case 0x4d3b95:
        R.eax = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 4d3b95: mov eax, dword ptr [esp + 0x20]
        R.esi = (((R.eax + -0x8) | 0)) | 0; // 4d3b99: lea esi, [eax - 8]
        pc = 0x4d3ba5; continue; // 4d3b9c: jmp 0x4d3ba5
      case 0x4d3b9e:
        R.ecx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 4d3b9e: mov ecx, dword ptr [esp + 0x20]
        R.esi = (((R.ecx + -0xa) | 0)) | 0; // 4d3ba2: lea esi, [ecx - 0xa]
        pc = 0x4d3ba5; continue;
      case 0x4d3ba5:
        R.eax = (R.m.u32(((R.esp + 0x2c) | 0) >>> 0)) | 0; // 4d3ba5: mov eax, dword ptr [esp + 0x2c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d3ba9: test eax, eax
        if (R.zf) { pc = 0x4d3bda; continue; } // 4d3bab: je 0x4d3bda
        pc = 0x4d3bad; continue;
      case 0x4d3bad:
        R.edx = (R.m.u32(((R.eax + 0xf) | 0) >>> 0)) | 0; // 4d3bad: mov edx, dword ptr [eax + 0xf]
        R.eax = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 4d3bb0: mov eax, dword ptr [ebp]
        R.sub((R.edx >>> 0), (R.eax >>> 0), 32); // 4d3bb3: cmp edx, eax
        if (!R.zf) { pc = 0x4d3bda; continue; } // 4d3bb5: jne 0x4d3bda
        pc = 0x4d3bb7; continue;
      case 0x4d3bb7:
        R.ebx = (R.m.u32(((R.esp + 0x90) | 0) >>> 0)) | 0; // 4d3bb7: mov ebx, dword ptr [esp + 0x90]
        R.eax = (0x10624dd3) | 0; // 4d3bbe: mov eax, 0x10624dd3
        R.ecx = (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d3bc3: movsx ecx, word ptr [ebx + 0x80]
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 4d3bca: imul ecx
        R.edx = (R.sar((R.edx >>> 0), 0x6, 32)) | 0; // 4d3bcc: sar edx, 6
        R.eax = ((R.edx >>> 0)) | 0; // 4d3bcf: mov eax, edx
        R.eax = (R.shr((R.eax >>> 0), 0x1f, 32)) | 0; // 4d3bd1: shr eax, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 4d3bd4: add edx, eax
        R.esi = (R.add((R.esi >>> 0), (R.edx >>> 0), 32)) | 0; // 4d3bd6: add esi, edx
        pc = 0x4d3be1; continue; // 4d3bd8: jmp 0x4d3be1
      case 0x4d3bda:
        R.ebx = (R.m.u32(((R.esp + 0x90) | 0) >>> 0)) | 0; // 4d3bda: mov ebx, dword ptr [esp + 0x90]
        pc = 0x4d3be1; continue;
      case 0x4d3be1:
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d3be1: mov ecx, dword ptr [esp + 0x18]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d3be5: mov al, byte ptr [ecx + 0x4f]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d3be8: and al, 0xf0
        R.sub(((R.eax >>> 0) & 0xff), 0x10, 8); // 4d3bea: cmp al, 0x10
        if (!R.zf) { pc = 0x4d3c25; continue; } // 4d3bec: jne 0x4d3c25
        pc = 0x4d3bee; continue;
      case 0x4d3bee:
        R.sub(R.m.u8(((R.ebp + 0x18) | 0) >>> 0), 0x13, 8); // 4d3bee: cmp byte ptr [ebp + 0x18], 0x13
        if (!R.cL) { pc = 0x4d3d6b; continue; } // 4d3bf2: jge 0x4d3d6b
        pc = 0x4d3bf8; continue;
      case 0x4d3bf8:
        R.ecx = (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d3bf8: movsx ecx, word ptr [ebx + 0x80]
        R.eax = (0x10624dd3) | 0; // 4d3bff: mov eax, 0x10624dd3
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 4d3c04: imul ecx
        R.edx = (R.sar((R.edx >>> 0), 0x5, 32)) | 0; // 4d3c06: sar edx, 5
        R.eax = ((R.edx >>> 0)) | 0; // 4d3c09: mov eax, edx
        R.eax = (R.shr((R.eax >>> 0), 0x1f, 32)) | 0; // 4d3c0b: shr eax, 0x1f
        R.ecx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d3c0e: movsx ecx, si
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 4d3c11: add edx, eax
        R.edx = (R.add((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 4d3c13: add edx, ecx
        R.sub((R.edx >>> 0), 0x79, 32); // 4d3c15: cmp edx, 0x79
        if (!R.cL) { pc = 0x4d3d6b; continue; } // 4d3c18: jge 0x4d3d6b
        pc = 0x4d3c1e; continue;
      case 0x4d3c1e:
        R.esi = (0x79) | 0; // 4d3c1e: mov esi, 0x79
        pc = 0x4d3c5b; continue; // 4d3c23: jmp 0x4d3c5b
      case 0x4d3c25:
        R.sub(((R.eax >>> 0) & 0xff), 0x20, 8); // 4d3c25: cmp al, 0x20
        if (R.zf) { pc = 0x4d3d61; continue; } // 4d3c27: je 0x4d3d61
        pc = 0x4d3c2d; continue;
      case 0x4d3c2d:
        R.sub(((R.eax >>> 0) & 0xff), 0x30, 8); // 4d3c2d: cmp al, 0x30
        if (R.zf) { pc = 0x4d3d61; continue; } // 4d3c2f: je 0x4d3d61
        pc = 0x4d3c35; continue;
      case 0x4d3c35:
        R.sub(R.m.u8(((R.ebp + 0x18) | 0) >>> 0), 0x13, 8); // 4d3c35: cmp byte ptr [ebp + 0x18], 0x13
        if (!R.cL) { pc = 0x4d3c5b; continue; } // 4d3c39: jge 0x4d3c5b
        pc = 0x4d3c3b; continue;
      case 0x4d3c3b:
        R.sub(((R.eax >>> 0) & 0xff), 0x40, 8); // 4d3c3b: cmp al, 0x40
        if (!R.zf) { pc = 0x4d3c5b; continue; } // 4d3c3d: jne 0x4d3c5b
        pc = 0x4d3c3f; continue;
      case 0x4d3c3f:
        R.ecx = (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d3c3f: movsx ecx, word ptr [ebx + 0x80]
        R.eax = (0xc3a13de7) | 0; // 4d3c46: mov eax, 0xc3a13de7
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 4d3c4b: imul ecx
        R.edx = (R.add((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 4d3c4d: add edx, ecx
        R.edx = (R.sar((R.edx >>> 0), 0x9, 32)) | 0; // 4d3c4f: sar edx, 9
        R.ecx = ((R.edx >>> 0)) | 0; // 4d3c52: mov ecx, edx
        R.ecx = (R.shr((R.ecx >>> 0), 0x1f, 32)) | 0; // 4d3c54: shr ecx, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 4d3c57: add edx, ecx
        pc = 0x4d3c59; continue;
      case 0x4d3c59:
        R.esi = (R.add((R.esi >>> 0), (R.edx >>> 0), 32)) | 0; // 4d3c59: add esi, edx
        pc = 0x4d3c5b; continue;
      case 0x4d3c5b:
        R.sub(R.m.u8(((R.ebp + 0x18) | 0) >>> 0), 0x14, 8); // 4d3c5b: cmp byte ptr [ebp + 0x18], 0x14
        if (R.cLE) { pc = 0x4d3c85; continue; } // 4d3c5f: jle 0x4d3c85
        pc = 0x4d3c61; continue;
      case 0x4d3c61:
        R.edx = (R.m.u32(((R.ebp + 0x61) | 0) >>> 0)) | 0; // 4d3c61: mov edx, dword ptr [ebp + 0x61]
        R.sub(R.m.u16(((R.edx + 0x5) | 0) >>> 0), 0x2d, 16); // 4d3c64: cmp word ptr [edx + 5], 0x2d
        if (!R.cL) { pc = 0x4d3c85; continue; } // 4d3c69: jge 0x4d3c85
        pc = 0x4d3c6b; continue;
      case 0x4d3c6b:
        R.ecx = (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d3c6b: movsx ecx, word ptr [ebx + 0x80]
        R.eax = (0xef9db22d) | 0; // 4d3c72: mov eax, 0xef9db22d
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 4d3c77: imul ecx
        R.edx = (R.sar((R.edx >>> 0), 0x6, 32)) | 0; // 4d3c79: sar edx, 6
        R.eax = ((R.edx >>> 0)) | 0; // 4d3c7c: mov eax, edx
        R.eax = (R.shr((R.eax >>> 0), 0x1f, 32)) | 0; // 4d3c7e: shr eax, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 4d3c81: add edx, eax
        R.esi = (R.add((R.esi >>> 0), (R.edx >>> 0), 32)) | 0; // 4d3c83: add esi, edx
        pc = 0x4d3c85; continue;
      case 0x4d3c85:
        R.sub(R.m.u16(((R.esp + 0x20) | 0) >>> 0), 0x78, 16); // 4d3c85: cmp word ptr [esp + 0x20], 0x78
        if (R.cLE) { pc = 0x4d3c9c; continue; } // 4d3c8b: jle 0x4d3c9c
        pc = 0x4d3c8d; continue;
      case 0x4d3c8d:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebx + 0x7f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d3c8d: mov al, byte ptr [ebx + 0x7f]
        R.sub(((R.eax >>> 0) & 0xff), 0xa, 8); // 4d3c90: cmp al, 0xa
        if (R.cLE) { pc = 0x4d3c9c; continue; } // 4d3c92: jle 0x4d3c9c
        pc = 0x4d3c94; continue;
      case 0x4d3c94:
        R.ecx = ((R.ecx & 0xffff0000) | (((((((R.eax >>> 0) & 0xff)) << 24 >> 24)) & 0xffff) << 0)) | 0; // 4d3c94: movsx cx, al
        R.esi = (((R.esi + R.ecx + -0xa) | 0)) | 0; // 4d3c98: lea esi, [esi + ecx - 0xa]
        pc = 0x4d3c9c; continue;
      case 0x4d3c9c:
        R.eax = (R.m.u32(((R.ebx + 0xcf) | 0) >>> 0)) | 0; // 4d3c9c: mov eax, dword ptr [ebx + 0xcf]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d3ca2: test eax, eax
        if (R.zf) { pc = 0x4d3d17; continue; } // 4d3ca4: je 0x4d3d17
        pc = 0x4d3ca6; continue;
      case 0x4d3ca6:
        R.ecx = (R.m.u32(((R.eax + 0x69) | 0) >>> 0)) | 0; // 4d3ca6: mov ecx, dword ptr [eax + 0x69]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 4d3ca9: test ecx, ecx
        if (R.zf) { pc = 0x4d3d17; continue; } // 4d3cab: je 0x4d3d17
        pc = 0x4d3cad; continue;
      case 0x4d3cad:
        R.push(0x0); // 4d3cad: push 0
        R.push(0x0); // 4d3caf: push 0
        R.push(0x1); // 4d3cb1: push 1
        R.push(0x1); // 4d3cb3: push 1
        R.push((R.ebx >>> 0)); // 4d3cb5: push ebx
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 4d3cb6: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 4d3cbb: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d3cbe: test eax, eax
        if (!R.zf) { pc = 0x4d3cd4; continue; } // 4d3cc0: jne 0x4d3cd4
        pc = 0x4d3cc2; continue;
      case 0x4d3cc2:
        R.edx = (R.m.u32(((R.ebx + 0xcf) | 0) >>> 0)) | 0; // 4d3cc2: mov edx, dword ptr [ebx + 0xcf]
        R.eax = (R.m.u32(((R.edx + 0x69) | 0) >>> 0)) | 0; // 4d3cc8: mov eax, dword ptr [edx + 0x69]
        R.ecx = ((R.ecx & 0xffff0000) | (((((R.m.u8(((R.eax + 0x22) | 0) >>> 0)) << 24 >> 24)) & 0xffff) << 0)) | 0; // 4d3ccb: movsx cx, byte ptr [eax + 0x22]
        R.esi = (((R.esi + R.ecx + -0xa) | 0)) | 0; // 4d3cd0: lea esi, [esi + ecx - 0xa]
        pc = 0x4d3cd4; continue;
      case 0x4d3cd4:
        R.edx = (R.m.u32(((R.ebx + 0xcf) | 0) >>> 0)) | 0; // 4d3cd4: mov edx, dword ptr [ebx + 0xcf]
        R.eax = (R.m.u32(((R.edx + 0x42) | 0) >>> 0)) | 0; // 4d3cda: mov eax, dword ptr [edx + 0x42]
        R.push((R.eax >>> 0)); // 4d3cdd: push eax
        R.ecx = (R.m.u32(((R.edx + 0x3e) | 0) >>> 0)) | 0; // 4d3cde: mov ecx, dword ptr [edx + 0x3e]
        R.push((R.ecx >>> 0)); // 4d3ce1: push ecx
        R.ecx = (((R.ebp + 0x3e) | 0)) | 0; // 4d3ce2: lea ecx, [ebp + 0x3e]
        R.call(0x456740, { n: 2, thisEcx: true, calleeClean: true }); // 4d3ce5: call 0x456740
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d3cea: test eax, eax
        if (R.zf) { pc = 0x4d3d17; continue; } // 4d3cec: je 0x4d3d17
        pc = 0x4d3cee; continue;
      case 0x4d3cee:
        R.edx = (R.m.u32(((R.ebp + 0x61) | 0) >>> 0)) | 0; // 4d3cee: mov edx, dword ptr [ebp + 0x61]
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.edx + 0x7) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 4d3cf1: mov ax, word ptr [edx + 7]
        R.sub(((R.esi >>> 0) & 0xffff), ((R.eax >>> 0) & 0xffff), 16); // 4d3cf5: cmp si, ax
        if (!R.cL) { pc = 0x4d3d17; continue; } // 4d3cf8: jge 0x4d3d17
        pc = 0x4d3cfa; continue;
      case 0x4d3cfa:
        R.ecx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d3cfa: movsx ecx, si
        R.edx = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d3cfd: movsx edx, ax
        R.edx = (R.sub((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 4d3d00: sub edx, ecx
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edx >>> 0)); // 4d3d02: mov dword ptr [esp + 0x38], edx
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3d06: fild dword ptr [esp + 0x38]
        R.st[0] = R.st[0] * 0.5; // 4d3d0a: fmul qword ptr [0x968968]
        R.ftol(); // 4d3d10: call 0x945640
        R.esi = (R.add((R.esi >>> 0), (R.eax >>> 0), 32)) | 0; // 4d3d15: add esi, eax
        pc = 0x4d3d17; continue;
      case 0x4d3d17:
        R.sub(((R.esi >>> 0) & 0xffff), 0x78, 16); // 4d3d17: cmp si, 0x78
        if (R.cLE) { pc = 0x4d402e; continue; } // 4d3d1b: jle 0x4d402e
        pc = 0x4d3d21; continue;
      case 0x4d3d21:
        R.ebp = (R.m.u32(((R.esp + 0x90) | 0) >>> 0)) | 0; // 4d3d21: mov ebp, dword ptr [esp + 0x90]
        R.ebx = ((R.ebx & 0xffff0000) | (((R.m.u16(((R.ebp + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 4d3d28: mov bx, word ptr [ebp + 0x80]
        R.eax = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d3d2f: movsx eax, bx
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.eax >>> 0)); // 4d3d32: mov dword ptr [esp + 0x38], eax
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3d36: fild dword ptr [esp + 0x38]
        R.fpush(R.st[0]); // 4d3d3a: fld st(0)
        R.st[0] = R.st[0] * 0.0167; // 4d3d3c: fmul qword ptr [0x968f58]
        R.st[0] = R.st[0] + 100.0; // 4d3d42: fadd qword ptr [0x9688a8]
        R.fpush(150.0); // 4d3d48: fld qword ptr [0x968f50]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d3d4e: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d3d50: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d3d52: test ah, 0x41
        if (!R.zf) { pc = 0x4d3d88; continue; } // 4d3d55: jne 0x4d3d88
        pc = 0x4d3d57; continue;
      case 0x4d3d57:
        R.fpop(); // 4d3d57: fstp st(0)
        R.fpush(150.0); // 4d3d59: fld qword ptr [0x968f50]
        pc = 0x4d3d9f; continue; // 4d3d5f: jmp 0x4d3d9f
      case 0x4d3d61:
        R.sub(R.m.u8(((R.ebp + 0x18) | 0) >>> 0), 0x13, 8); // 4d3d61: cmp byte ptr [ebp + 0x18], 0x13
        if (!R.cL) { pc = 0x4d3c3f; continue; } // 4d3d65: jge 0x4d3c3f
        pc = 0x4d3d6b; continue;
      case 0x4d3d6b:
        R.ecx = (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d3d6b: movsx ecx, word ptr [ebx + 0x80]
        R.eax = (0x10624dd3) | 0; // 4d3d72: mov eax, 0x10624dd3
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 4d3d77: imul ecx
        R.edx = (R.sar((R.edx >>> 0), 0x5, 32)) | 0; // 4d3d79: sar edx, 5
        R.eax = ((R.edx >>> 0)) | 0; // 4d3d7c: mov eax, edx
        R.eax = (R.shr((R.eax >>> 0), 0x1f, 32)) | 0; // 4d3d7e: shr eax, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 4d3d81: add edx, eax
        pc = 0x4d3c59; continue; // 4d3d83: jmp 0x4d3c59
      case 0x4d3d88:
        R.fpush(220.0); // 4d3d88: fld qword ptr [0x968f48]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d3d8e: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d3d90: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d3d92: test ah, 1
        if (R.zf) { pc = 0x4d3d9f; continue; } // 4d3d95: je 0x4d3d9f
        pc = 0x4d3d97; continue;
      case 0x4d3d97:
        R.fpop(); // 4d3d97: fstp st(0)
        R.fpush(220.0); // 4d3d99: fld qword ptr [0x968f48]
        pc = 0x4d3d9f; continue;
      case 0x4d3d9f:
        R.ftol(); // 4d3d9f: call 0x945640
        R.sub(((R.esi >>> 0) & 0xffff), ((R.eax >>> 0) & 0xffff), 16); // 4d3da4: cmp si, ax
        if (R.cL) { pc = 0x4d3dab; continue; } // 4d3da7: jl 0x4d3dab
        pc = 0x4d3da9; continue;
      case 0x4d3da9:
        R.esi = ((R.eax >>> 0)) | 0; // 4d3da9: mov esi, eax
        pc = 0x4d3dab; continue;
      case 0x4d3dab:
        R.sub(((R.esi >>> 0) & 0xffff), 0x96, 16); // 4d3dab: cmp si, 0x96
        if (R.cLE) { pc = 0x4d3e11; continue; } // 4d3db0: jle 0x4d3e11
        pc = 0x4d3db2; continue;
      case 0x4d3db2:
        R.eax = (R.m.u32(((R.esp + 0x2c) | 0) >>> 0)) | 0; // 4d3db2: mov eax, dword ptr [esp + 0x2c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d3db6: test eax, eax
        if (R.zf) { pc = 0x4d3e11; continue; } // 4d3db8: je 0x4d3e11
        pc = 0x4d3dba; continue;
      case 0x4d3dba:
        R.sub(((R.ebx >>> 0) & 0xffff), 0x9c4, 16); // 4d3dba: cmp bx, 0x9c4
        if (R.cL) { pc = 0x4d3e11; continue; } // 4d3dbf: jl 0x4d3e11
        pc = 0x4d3dc1; continue;
      case 0x4d3dc1:
        R.ecx = (R.m.u32(((R.ebp + 0x53) | 0) >>> 0)) | 0; // 4d3dc1: mov ecx, dword ptr [ebp + 0x53]
        R.sub(R.m.u8(((R.ecx + 0x85) | 0) >>> 0), 0xa, 8); // 4d3dc4: cmp byte ptr [ecx + 0x85], 0xa
        if (R.cLE) { pc = 0x4d3e11; continue; } // 4d3dcb: jle 0x4d3e11
        pc = 0x4d3dcd; continue;
      case 0x4d3dcd:
        R.edx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d3dcd: movsx edx, si
        R.eax = (((R.edx * 4 + -0x258) | 0)) | 0; // 4d3dd0: lea eax, [edx*4 - 0x258]
        R.sub((R.eax >>> 0), 0xc8, 32); // 4d3dd7: cmp eax, 0xc8
        if (R.cL) { pc = 0x4d3de3; continue; } // 4d3ddc: jl 0x4d3de3
        pc = 0x4d3dde; continue;
      case 0x4d3dde:
        R.eax = (0xc8) | 0; // 4d3dde: mov eax, 0xc8
        pc = 0x4d3de3; continue;
      case 0x4d3de3:
        R.eax = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d3de3: movsx eax, ax
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.eax >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.eax = (Number(BigInt.asIntN(32, p))) | 0; } // 4d3de6: imul eax, eax
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4d3de9: lea eax, [eax + eax*4]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4d3dec: lea eax, [eax + eax*4]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4d3def: lea eax, [eax + eax*4]
        R.eax = (R.shl((R.eax >>> 0), 0x1, 32)) | 0; // 4d3df2: shl eax, 1
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.eax >>> 0)); // 4d3df4: mov dword ptr [esp + 0x38], eax
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3df8: fild dword ptr [esp + 0x38]
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 4d3dfc: fxch st(1)
        R.st[0] = R.st[0] * 0.00016666666666666666; // 4d3dfe: fmul qword ptr [0x968f40]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 4d3e04: fmulp st(1)
        R.ftol(); // 4d3e06: call 0x945640
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.eax >>> 0)); // 4d3e0b: mov dword ptr [esp + 0x34], eax
        pc = 0x4d3e13; continue; // 4d3e0f: jmp 0x4d3e13
      case 0x4d3e11:
        R.fpop(); // 4d3e11: fstp st(0)
        pc = 0x4d3e13; continue;
      case 0x4d3e13:
        R.eax = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d3e13: movsx eax, si
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.eax >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.eax = (Number(BigInt.asIntN(32, p))) | 0; } // 4d3e16: imul eax, eax
        R.eax = (R.sub((R.eax >>> 0), 0x3840, 32)) | 0; // 4d3e19: sub eax, 0x3840
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4d3e1e: lea eax, [eax + eax*4]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4d3e21: lea eax, [eax + eax*4]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 4d3e24: lea ecx, [eax + eax*4]
        R.ecx = (R.shl((R.ecx >>> 0), 0x1, 32)) | 0; // 4d3e27: shl ecx, 1
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.ecx >>> 0)); // 4d3e29: mov dword ptr [esp + 0x38], ecx
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3e2d: fild dword ptr [esp + 0x38]
        R.st[0] = R.st[0] * 0.6153846153846154; // 4d3e31: fmul qword ptr [0x968f38]
        R.st[0] = R.st[0] + R.m.s32(((R.esp + 0x34) | 0) >>> 0); // 4d3e37: fiadd dword ptr [esp + 0x34]
        R.ftol(); // 4d3e3b: call 0x945640
        R.edx = (R.m.u32(((R.esp + 0x90) | 0) >>> 0)) | 0; // 4d3e40: mov edx, dword ptr [esp + 0x90]
        R.ebp = ((R.eax >>> 0)) | 0; // 4d3e47: mov ebp, eax
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.ebp >>> 0)); // 4d3e49: mov dword ptr [esp + 0x20], ebp
        R.ecx = ((R.edx >>> 0)) | 0; // 4d3e4d: mov ecx, edx
        R.eax = (R.m.u32(((R.edx + 0x53) | 0) >>> 0)) | 0; // 4d3e4f: mov eax, dword ptr [edx + 0x53]
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.eax + 0x85) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d3e52: mov bl, byte ptr [eax + 0x85]
        R.sub(((R.ebx >>> 0) & 0xff), 0xd, 8); // 4d3e58: cmp bl, 0xd
        if (R.cL) { pc = 0x4d3e67; continue; } // 4d3e5b: jl 0x4d3e67
        pc = 0x4d3e5d; continue;
      case 0x4d3e5d:
        R.sub(R.m.u8(((R.ecx + 0x64) | 0) >>> 0), 0x3, 8); // 4d3e5d: cmp byte ptr [ecx + 0x64], 3
        if (!R.zf) { pc = 0x4d3ee8; continue; } // 4d3e61: jne 0x4d3ee8
        pc = 0x4d3e67; continue;
      case 0x4d3e67:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.ecx + 0x64) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d3e67: mov dl, byte ptr [ecx + 0x64]
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.ecx + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 4d3e6a: mov ax, word ptr [ecx + 0x80]
        R.sub(((R.edx >>> 0) & 0xff), 0x3, 8); // 4d3e71: cmp dl, 3
        if (!R.zf) { pc = 0x4d3e92; continue; } // 4d3e74: jne 0x4d3e92
        pc = 0x4d3e76; continue;
      case 0x4d3e76:
        R.sub(((R.eax >>> 0) & 0xffff), 0x1482, 16); // 4d3e76: cmp ax, 0x1482
        if (!R.cL) { pc = 0x4d3e92; continue; } // 4d3e7a: jge 0x4d3e92
        pc = 0x4d3e7c; continue;
      case 0x4d3e7c:
        R.ecx = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d3e7c: movsx ecx, ax
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.ecx >>> 0)); // 4d3e7f: mov dword ptr [esp + 0x38], ecx
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3e83: fild dword ptr [esp + 0x38]
        R.st[0] = R.st[0] * 0.75; // 4d3e87: fmul qword ptr [0x969040]
        R.ftol(); // 4d3e8d: call 0x945640
        pc = 0x4d3e92; continue;
      case 0x4d3e92:
        R.sub(((R.ebx >>> 0) & 0xff), 0x5, 8); // 4d3e92: cmp bl, 5
        if (!R.cL) { pc = 0x4d3ec2; continue; } // 4d3e95: jge 0x4d3ec2
        pc = 0x4d3e97; continue;
      case 0x4d3e97:
        R.sub(((R.eax >>> 0) & 0xffff), 0xfa0, 16); // 4d3e97: cmp ax, 0xfa0
        if (R.cLE) { pc = 0x4d3ec2; continue; } // 4d3e9b: jle 0x4d3ec2
        pc = 0x4d3e9d; continue;
      case 0x4d3e9d:
        R.edx = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d3e9d: movsx edx, ax
        R.edx = (R.sub((R.edx >>> 0), 0xfa0, 32)) | 0; // 4d3ea0: sub edx, 0xfa0
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edx >>> 0)); // 4d3ea6: mov dword ptr [esp + 0x38], edx
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3eaa: fild dword ptr [esp + 0x38]
        R.st[0] = R.st[0] * -0.2; // 4d3eae: fmul qword ptr [0x968f30]
        R.ftol(); // 4d3eb4: call 0x945640
        R.ecx = (0xfa0) | 0; // 4d3eb9: mov ecx, 0xfa0
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 4d3ebe: sub ecx, eax
        R.eax = ((R.ecx >>> 0)) | 0; // 4d3ec0: mov eax, ecx
        pc = 0x4d3ec2; continue;
      case 0x4d3ec2:
        R.sub(((R.eax >>> 0) & 0xffff), 0x1482, 16); // 4d3ec2: cmp ax, 0x1482
        if (!R.cL) { pc = 0x4d3ee8; continue; } // 4d3ec6: jge 0x4d3ee8
        pc = 0x4d3ec8; continue;
      case 0x4d3ec8:
        R.edx = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d3ec8: movsx edx, ax
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edx >>> 0)); // 4d3ecb: mov dword ptr [esp + 0x38], edx
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3ecf: fild dword ptr [esp + 0x38]
        R.st[0] = R.st[0] * 0.00019047619047619048; // 4d3ed3: fmul qword ptr [0x968f28]
        R.st[0] = R.st[0] * R.m.s32(((R.esp + 0x20) | 0) >>> 0); // 4d3ed9: fimul dword ptr [esp + 0x20]
        R.ftol(); // 4d3edd: call 0x945640
        R.ebp = ((R.eax >>> 0)) | 0; // 4d3ee2: mov ebp, eax
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.ebp >>> 0)); // 4d3ee4: mov dword ptr [esp + 0x20], ebp
        pc = 0x4d3ee8; continue;
      case 0x4d3ee8:
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d3ee8: mov eax, dword ptr [esp + 0x18]
        R.esi = (R.m.u32(((R.eax + 0x45) | 0) >>> 0)) | 0; // 4d3eec: mov esi, dword ptr [eax + 0x45]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 4d3eef: test esi, esi
        if (R.zf) { pc = 0x4d3f8c; continue; } // 4d3ef1: je 0x4d3f8c
        pc = 0x4d3ef7; continue;
      case 0x4d3ef7:
        R.ebx = ((R.eax >>> 0)) | 0; // 4d3ef7: mov ebx, eax
        R.sub(R.m.u8(((R.ebx + 0x44) | 0) >>> 0), 0xce, 8); // 4d3ef9: cmp byte ptr [ebx + 0x44], 0xce
        if (!R.cL) { pc = 0x4d3f14; continue; } // 4d3efd: jge 0x4d3f14
        pc = 0x4d3eff; continue;
      case 0x4d3eff:
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 4d3eff: fild dword ptr [esp + 0x20]
        R.st[0] = R.st[0] * 0.75; // 4d3f03: fmul qword ptr [0x969040]
        R.ftol(); // 4d3f09: call 0x945640
        R.ebp = ((R.eax >>> 0)) | 0; // 4d3f0e: mov ebp, eax
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.ebp >>> 0)); // 4d3f10: mov dword ptr [esp + 0x20], ebp
        pc = 0x4d3f14; continue;
      case 0x4d3f14:
        R.logic((R.esi >>> 0) & 0x800000, 32); // 4d3f14: test esi, 0x800000
        if (R.zf) { pc = 0x4d3f31; continue; } // 4d3f1a: je 0x4d3f31
        pc = 0x4d3f1c; continue;
      case 0x4d3f1c:
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 4d3f1c: fild dword ptr [esp + 0x20]
        R.st[0] = R.st[0] * 0.8; // 4d3f20: fmul qword ptr [0x9689b0]
        R.ftol(); // 4d3f26: call 0x945640
        R.ebp = ((R.eax >>> 0)) | 0; // 4d3f2b: mov ebp, eax
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.ebp >>> 0)); // 4d3f2d: mov dword ptr [esp + 0x20], ebp
        pc = 0x4d3f31; continue;
      case 0x4d3f31:
        R.ecx = ((R.ebx >>> 0)) | 0; // 4d3f31: mov ecx, ebx
        R.call(0x8676f0, { n: 0, thisEcx: true, calleeClean: false }); // 4d3f33: call 0x8676f0
        R.logic(((R.eax >>> 0) & 0xff) & 0x8, 8); // 4d3f38: test al, 8
        if (R.zf) { pc = 0x4d3f51; continue; } // 4d3f3a: je 0x4d3f51
        pc = 0x4d3f3c; continue;
      case 0x4d3f3c:
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 4d3f3c: fild dword ptr [esp + 0x20]
        R.st[0] = R.st[0] * 0.95; // 4d3f40: fmul qword ptr [0x9689d0]
        R.ftol(); // 4d3f46: call 0x945640
        R.ebp = ((R.eax >>> 0)) | 0; // 4d3f4b: mov ebp, eax
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.ebp >>> 0)); // 4d3f4d: mov dword ptr [esp + 0x20], ebp
        pc = 0x4d3f51; continue;
      case 0x4d3f51:
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d3f51: mov ecx, dword ptr [esp + 0x18]
        R.ebx = (R.m.u32(((R.ecx + 0x45) | 0) >>> 0)) | 0; // 4d3f55: mov ebx, dword ptr [ecx + 0x45]
        R.logic(((R.ebx >>> 0) & 0xff) & 0x1, 8); // 4d3f58: test bl, 1
        if (R.zf) { pc = 0x4d3f72; continue; } // 4d3f5b: je 0x4d3f72
        pc = 0x4d3f5d; continue;
      case 0x4d3f5d:
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 4d3f5d: fild dword ptr [esp + 0x20]
        R.st[0] = R.st[0] * 0.9; // 4d3f61: fmul qword ptr [0x9689d8]
        R.ftol(); // 4d3f67: call 0x945640
        R.ebp = ((R.eax >>> 0)) | 0; // 4d3f6c: mov ebp, eax
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.ebp >>> 0)); // 4d3f6e: mov dword ptr [esp + 0x20], ebp
        pc = 0x4d3f72; continue;
      case 0x4d3f72:
        R.logic(((R.ebx >>> 0) & 0xff) & 0x40, 8); // 4d3f72: test bl, 0x40
        if (R.zf) { pc = 0x4d3f8c; continue; } // 4d3f75: je 0x4d3f8c
        pc = 0x4d3f77; continue;
      case 0x4d3f77:
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 4d3f77: fild dword ptr [esp + 0x20]
        R.st[0] = R.st[0] * 0.9; // 4d3f7b: fmul qword ptr [0x9689d8]
        R.ftol(); // 4d3f81: call 0x945640
        R.ebp = ((R.eax >>> 0)) | 0; // 4d3f86: mov ebp, eax
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.ebp >>> 0)); // 4d3f88: mov dword ptr [esp + 0x20], ebp
        pc = 0x4d3f8c; continue;
      case 0x4d3f8c:
        R.ecx = (R.m.u32(((R.esp + 0x98) | 0) >>> 0)) | 0; // 4d3f8c: mov ecx, dword ptr [esp + 0x98]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + 0x59) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d3f93: mov al, byte ptr [ecx + 0x59]
        R.sub(((R.eax >>> 0) & 0xff), 0x6, 8); // 4d3f96: cmp al, 6
        if (!R.cL) { pc = 0x4d3ff5; continue; } // 4d3f98: jge 0x4d3ff5
        pc = 0x4d3f9a; continue;
      case 0x4d3f9a:
        R.sub(R.m.u8(((R.ecx + 0x5b) | 0) >>> 0), 0xa, 8); // 4d3f9a: cmp byte ptr [ecx + 0x5b], 0xa
        if (!R.cL) { pc = 0x4d3ff5; continue; } // 4d3f9e: jge 0x4d3ff5
        pc = 0x4d3fa0; continue;
      case 0x4d3fa0:
        R.edx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d3fa0: mov edx, dword ptr [esp + 0x18]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edx + 0x44) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d3fa4: mov al, byte ptr [edx + 0x44]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 4d3fa7: test al, al
        if (!R.cL) { pc = 0x4d3fc0; continue; } // 4d3fa9: jge 0x4d3fc0
        pc = 0x4d3fab; continue;
      case 0x4d3fab:
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 4d3fab: fild dword ptr [esp + 0x20]
        R.st[0] = R.st[0] * 0.9; // 4d3faf: fmul qword ptr [0x9689d8]
        R.ftol(); // 4d3fb5: call 0x945640
        R.ebp = ((R.eax >>> 0)) | 0; // 4d3fba: mov ebp, eax
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.ebp >>> 0)); // 4d3fbc: mov dword ptr [esp + 0x20], ebp
        pc = 0x4d3fc0; continue;
      case 0x4d3fc0:
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d3fc0: mov eax, dword ptr [esp + 0x94]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d3fc7: test eax, eax
        if (R.zf) { pc = 0x4d4015; continue; } // 4d3fc9: je 0x4d4015
        pc = 0x4d3fcb; continue;
      case 0x4d3fcb:
        R.ecx = (R.m.u32(((R.esp + 0x90) | 0) >>> 0)) | 0; // 4d3fcb: mov ecx, dword ptr [esp + 0x90]
        R.eax = (((R.m.u16(((R.eax + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d3fd2: movsx eax, word ptr [eax + 0x80]
        R.edx = (((R.m.u16(((R.ecx + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d3fd9: movsx edx, word ptr [ecx + 0x80]
        R.eax = (R.sub((R.eax >>> 0), 0x2ee, 32)) | 0; // 4d3fe0: sub eax, 0x2ee
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 4d3fe5: cmp eax, edx
        if (R.cLE) { pc = 0x4d4015; continue; } // 4d3fe7: jle 0x4d4015
        pc = 0x4d3fe9; continue;
      case 0x4d3fe9:
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 4d3fe9: fild dword ptr [esp + 0x20]
        R.st[0] = R.st[0] * 0.9; // 4d3fed: fmul qword ptr [0x9689d8]
        pc = 0x4d400e; continue; // 4d3ff3: jmp 0x4d400e
      case 0x4d3ff5:
        R.sub(((R.eax >>> 0) & 0xff), 0xf, 8); // 4d3ff5: cmp al, 0xf
        if (R.cLE) { pc = 0x4d4015; continue; } // 4d3ff7: jle 0x4d4015
        pc = 0x4d3ff9; continue;
      case 0x4d3ff9:
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d3ff9: mov eax, dword ptr [esp + 0x18]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + 0x44) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d3ffd: mov cl, byte ptr [eax + 0x44]
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 4d4000: test cl, cl
        if (R.cL) { pc = 0x4d4015; continue; } // 4d4002: jl 0x4d4015
        pc = 0x4d4004; continue;
      case 0x4d4004:
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 4d4004: fild dword ptr [esp + 0x20]
        R.st[0] = R.st[0] * 1.1; // 4d4008: fmul qword ptr [0x9689c0]
        pc = 0x4d400e; continue;
      case 0x4d400e:
        R.ftol(); // 4d400e: call 0x945640
        R.ebp = ((R.eax >>> 0)) | 0; // 4d4013: mov ebp, eax
        pc = 0x4d4015; continue;
      case 0x4d4015:
        R.sub((R.edi >>> 0), (R.ebp >>> 0), 32); // 4d4015: cmp edi, ebp
        if (!R.cL) { pc = 0x4d402e; continue; } // 4d4017: jge 0x4d402e
        pc = 0x4d4019; continue;
      case 0x4d4019:
        R.eax = (R.m.u32(((R.esp + 0x9c) | 0) >>> 0)) | 0; // 4d4019: mov eax, dword ptr [esp + 0x9c]
        R.edi = ((R.ebp >>> 0)) | 0; // 4d4020: mov edi, ebp
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d4022: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d4024: mov dword ptr [esp + 0x14], edi
        if (R.zf) { pc = 0x4d402e; continue; } // 4d4028: je 0x4d402e
        pc = 0x4d402a; continue;
      case 0x4d402a:
        R.m.w8(((R.eax + 0x1) | 0) >>> 0, R.logic(R.m.u8(((R.eax + 0x1) | 0) >>> 0) | 0x20, 8)); // 4d402a: or byte ptr [eax + 1], 0x20
        pc = 0x4d402e; continue;
      case 0x4d402e:
        R.ecx = (R.m.u32(((R.esp + 0x98) | 0) >>> 0)) | 0; // 4d402e: mov ecx, dword ptr [esp + 0x98]
        R.edx = (R.m.u32(((R.ecx + 0x61) | 0) >>> 0)) | 0; // 4d4035: mov edx, dword ptr [ecx + 0x61]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edx + 0xf) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d4038: mov al, byte ptr [edx + 0xf]
        R.sub(((R.eax >>> 0) & 0xff), 0x14, 8); // 4d403b: cmp al, 0x14
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x10) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d403d: mov al, byte ptr [esp + 0x10]
        if (!R.zf) { pc = 0x4d4045; continue; } // 4d4041: jne 0x4d4045
        pc = 0x4d4043; continue;
      case 0x4d4043:
        R.eax = ((R.eax & 0xffffff00) | (((R.add(((R.eax >>> 0) & 0xff), 0xfd, 8)) & 0xff) << 0)) | 0; // 4d4043: add al, 0xfd
        pc = 0x4d4045; continue;
      case 0x4d4045:
        R.sub(((R.eax >>> 0) & 0xff), 0x1c, 8); // 4d4045: cmp al, 0x1c
        if (R.cLE) { pc = 0x4d4155; continue; } // 4d4047: jle 0x4d4155
        pc = 0x4d404d; continue;
      case 0x4d404d:
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 4d404d: movsx eax, al
        R.eax = (R.add((R.eax >>> 0), 0xffffffe3, 32)) | 0; // 4d4050: add eax, -0x1d
        R.sub((R.eax >>> 0), 0x10, 32); // 4d4053: cmp eax, 0x10
        if (!R.cBE) { pc = 0x4d4155; continue; } // 4d4056: ja 0x4d4155
        pc = 0x4d405c; continue;
      case 0x4d405c:
        pc = [0x4d4063, 0x4d4080, 0x4d409d, 0x4d40ba, 0x4d40d7, 0x4d40ed, 0x4d4103, 0x4d4119, 0x4d412f, 0x4d4145, 0x4d4145, 0x4d4145, 0x4d4145, 0x4d4145, 0x4d4145, 0x4d4145, 0x4d4145][R.eax >>> 0]; continue; // 4d405c: jmp dword ptr [eax*4 + 0x4d4288]
      case 0x4d4063:
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 4d4063: mov ecx, dword ptr [esp + 0x1c]
        R.eax = (((R.ecx + 0x4c4b40) | 0)) | 0; // 4d4067: lea eax, [ecx + 0x4c4b40]
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 4d406d: cmp edi, eax
        if (R.cL) { pc = 0x4d4159; continue; } // 4d406f: jl 0x4d4159
        pc = 0x4d4075; continue;
      case 0x4d4075:
        R.edi = ((R.eax >>> 0)) | 0; // 4d4075: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d4077: mov dword ptr [esp + 0x14], edi
        pc = 0x4d4159; continue; // 4d407b: jmp 0x4d4159
      case 0x4d4080:
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 4d4080: mov ecx, dword ptr [esp + 0x1c]
        R.eax = (((R.ecx + 0x3d0900) | 0)) | 0; // 4d4084: lea eax, [ecx + 0x3d0900]
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 4d408a: cmp edi, eax
        if (R.cL) { pc = 0x4d4159; continue; } // 4d408c: jl 0x4d4159
        pc = 0x4d4092; continue;
      case 0x4d4092:
        R.edi = ((R.eax >>> 0)) | 0; // 4d4092: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d4094: mov dword ptr [esp + 0x14], edi
        pc = 0x4d4159; continue; // 4d4098: jmp 0x4d4159
      case 0x4d409d:
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 4d409d: mov ecx, dword ptr [esp + 0x1c]
        R.eax = (((R.ecx + 0x319750) | 0)) | 0; // 4d40a1: lea eax, [ecx + 0x319750]
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 4d40a7: cmp edi, eax
        if (R.cL) { pc = 0x4d4159; continue; } // 4d40a9: jl 0x4d4159
        pc = 0x4d40af; continue;
      case 0x4d40af:
        R.edi = ((R.eax >>> 0)) | 0; // 4d40af: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d40b1: mov dword ptr [esp + 0x14], edi
        pc = 0x4d4159; continue; // 4d40b5: jmp 0x4d4159
      case 0x4d40ba:
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 4d40ba: mov ecx, dword ptr [esp + 0x1c]
        R.eax = (((R.ecx + 0x2625a0) | 0)) | 0; // 4d40be: lea eax, [ecx + 0x2625a0]
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 4d40c4: cmp edi, eax
        if (R.cL) { pc = 0x4d4159; continue; } // 4d40c6: jl 0x4d4159
        pc = 0x4d40cc; continue;
      case 0x4d40cc:
        R.edi = ((R.eax >>> 0)) | 0; // 4d40cc: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d40ce: mov dword ptr [esp + 0x14], edi
        pc = 0x4d4159; continue; // 4d40d2: jmp 0x4d4159
      case 0x4d40d7:
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 4d40d7: mov ecx, dword ptr [esp + 0x1c]
        R.eax = (((R.ecx + 0x1ab3f0) | 0)) | 0; // 4d40db: lea eax, [ecx + 0x1ab3f0]
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 4d40e1: cmp edi, eax
        if (R.cL) { pc = 0x4d4159; continue; } // 4d40e3: jl 0x4d4159
        pc = 0x4d40e5; continue;
      case 0x4d40e5:
        R.edi = ((R.eax >>> 0)) | 0; // 4d40e5: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d40e7: mov dword ptr [esp + 0x14], edi
        pc = 0x4d4159; continue; // 4d40eb: jmp 0x4d4159
      case 0x4d40ed:
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 4d40ed: mov ecx, dword ptr [esp + 0x1c]
        R.eax = (((R.ecx + 0xf4240) | 0)) | 0; // 4d40f1: lea eax, [ecx + 0xf4240]
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 4d40f7: cmp edi, eax
        if (R.cL) { pc = 0x4d4159; continue; } // 4d40f9: jl 0x4d4159
        pc = 0x4d40fb; continue;
      case 0x4d40fb:
        R.edi = ((R.eax >>> 0)) | 0; // 4d40fb: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d40fd: mov dword ptr [esp + 0x14], edi
        pc = 0x4d4159; continue; // 4d4101: jmp 0x4d4159
      case 0x4d4103:
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 4d4103: mov ecx, dword ptr [esp + 0x1c]
        R.eax = (((R.ecx + 0x7a120) | 0)) | 0; // 4d4107: lea eax, [ecx + 0x7a120]
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 4d410d: cmp edi, eax
        if (R.cL) { pc = 0x4d4159; continue; } // 4d410f: jl 0x4d4159
        pc = 0x4d4111; continue;
      case 0x4d4111:
        R.edi = ((R.eax >>> 0)) | 0; // 4d4111: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d4113: mov dword ptr [esp + 0x14], edi
        pc = 0x4d4159; continue; // 4d4117: jmp 0x4d4159
      case 0x4d4119:
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 4d4119: mov ecx, dword ptr [esp + 0x1c]
        R.eax = (((R.ecx + 0x30d40) | 0)) | 0; // 4d411d: lea eax, [ecx + 0x30d40]
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 4d4123: cmp edi, eax
        if (R.cL) { pc = 0x4d4159; continue; } // 4d4125: jl 0x4d4159
        pc = 0x4d4127; continue;
      case 0x4d4127:
        R.edi = ((R.eax >>> 0)) | 0; // 4d4127: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d4129: mov dword ptr [esp + 0x14], edi
        pc = 0x4d4159; continue; // 4d412d: jmp 0x4d4159
      case 0x4d412f:
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 4d412f: mov ecx, dword ptr [esp + 0x1c]
        R.eax = (((R.ecx + 0x186a0) | 0)) | 0; // 4d4133: lea eax, [ecx + 0x186a0]
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 4d4139: cmp edi, eax
        if (R.cL) { pc = 0x4d4159; continue; } // 4d413b: jl 0x4d4159
        pc = 0x4d413d; continue;
      case 0x4d413d:
        R.edi = ((R.eax >>> 0)) | 0; // 4d413d: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d413f: mov dword ptr [esp + 0x14], edi
        pc = 0x4d4159; continue; // 4d4143: jmp 0x4d4159
      case 0x4d4145:
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 4d4145: mov ecx, dword ptr [esp + 0x1c]
        R.sub((R.edi >>> 0), (R.ecx >>> 0), 32); // 4d4149: cmp edi, ecx
        if (R.cL) { pc = 0x4d4159; continue; } // 4d414b: jl 0x4d4159
        pc = 0x4d414d; continue;
      case 0x4d414d:
        R.edi = ((R.ecx >>> 0)) | 0; // 4d414d: mov edi, ecx
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d414f: mov dword ptr [esp + 0x14], edi
        pc = 0x4d4159; continue; // 4d4153: jmp 0x4d4159
      case 0x4d4155:
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 4d4155: mov ecx, dword ptr [esp + 0x1c]
        pc = 0x4d4159; continue;
      case 0x4d4159:
        R.eax = (R.m.u32(((R.esp + 0x90) | 0) >>> 0)) | 0; // 4d4159: mov eax, dword ptr [esp + 0x90]
        R.eax = (R.m.u32(((R.eax + 0x53) | 0) >>> 0)) | 0; // 4d4160: mov eax, dword ptr [eax + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d4163: test eax, eax
        if (R.zf) { pc = 0x4d422a; continue; } // 4d4165: je 0x4d422a
        pc = 0x4d416b; continue;
      case 0x4d416b:
        R.edx = (R.m.u32(((0x9cf434) | 0) >>> 0)) | 0; // 4d416b: mov edx, dword ptr [0x9cf434]
        R.esi = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 4d4171: mov esi, dword ptr [eax]
        R.sub((R.esi >>> 0), (R.edx >>> 0), 32); // 4d4173: cmp esi, edx
        if (!R.zf) { pc = 0x4d41ed; continue; } // 4d4175: jne 0x4d41ed
        pc = 0x4d4177; continue;
      case 0x4d4177:
        R.sub((R.edi >>> 0), (R.ecx >>> 0), 32); // 4d4177: cmp edi, ecx
        if (R.cLE) { pc = 0x4d422a; continue; } // 4d4179: jle 0x4d422a
        pc = 0x4d417f; continue;
      case 0x4d417f:
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 4d417f: fild dword ptr [esp + 0x1c]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d4183: fild dword ptr [esp + 0x14]
        R.sub((R.edi >>> 0), 0x5b8d80, 32); // 4d4187: cmp edi, 0x5b8d80
        if (!R.cL) { pc = 0x4d41c7; continue; } // 4d418d: jge 0x4d41c7
        pc = 0x4d418f; continue;
      case 0x4d418f:
        R.fpush(R.st[0]); // 4d418f: fld st(0)
        R.st[0] = R.st[0] * 1.6666666666666668e-07; // 4d4191: fmul qword ptr [0x968e88]
        R.st[0] = R.st[0] * 0.6; // 4d4197: fmul qword ptr [0x968e48]
        R.st[0] = R.st[0] + 0.3; // 4d419d: fadd qword ptr [0x968e80]
        R.st[0] = R.st[0] * R.st[1]; // 4d41a3: fmul st(1)
        R.m.wf64(((R.esp + 0x84) | 0) >>> 0, R.st[0]); R.fpop(); // 4d41a5: fstp qword ptr [esp + 0x84]
        R.fpop(); // 4d41ac: fstp st(0)
        R.fcom(R.st[0], R.f64(((R.esp + 0x84) | 0))); // 4d41ae: fcom qword ptr [esp + 0x84]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d41b5: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d41b7: test ah, 0x41
        if (R.zf) { pc = 0x4d4223; continue; } // 4d41ba: je 0x4d4223
        pc = 0x4d41bc; continue;
      case 0x4d41bc:
        R.fpop(); // 4d41bc: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x84) | 0))); // 4d41be: fld qword ptr [esp + 0x84]
        pc = 0x4d4223; continue; // 4d41c5: jmp 0x4d4223
      case 0x4d41c7:
        R.st[0] = R.st[0] * 0.9; // 4d41c7: fmul qword ptr [0x9689d8]
        R.m.wf64(((R.esp + 0x84) | 0) >>> 0, R.st[0]); R.fpop(); // 4d41cd: fstp qword ptr [esp + 0x84]
        R.fcom(R.st[0], R.f64(((R.esp + 0x84) | 0))); // 4d41d4: fcom qword ptr [esp + 0x84]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d41db: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d41dd: test ah, 0x41
        if (R.zf) { pc = 0x4d4223; continue; } // 4d41e0: je 0x4d4223
        pc = 0x4d41e2; continue;
      case 0x4d41e2:
        R.fpop(); // 4d41e2: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x84) | 0))); // 4d41e4: fld qword ptr [esp + 0x84]
        pc = 0x4d4223; continue; // 4d41eb: jmp 0x4d4223
      case 0x4d41ed:
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d41ed: test eax, eax
        if (R.zf) { pc = 0x4d422a; continue; } // 4d41ef: je 0x4d422a
        pc = 0x4d41f1; continue;
      case 0x4d41f1:
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 4d41f1: mov eax, dword ptr [eax]
        R.edx = (R.m.u32(((0x9cf484) | 0) >>> 0)) | 0; // 4d41f3: mov edx, dword ptr [0x9cf484]
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 4d41f9: cmp eax, edx
        if (!R.zf) { pc = 0x4d422a; continue; } // 4d41fb: jne 0x4d422a
        pc = 0x4d41fd; continue;
      case 0x4d41fd:
        R.sub((R.edi >>> 0), (R.ecx >>> 0), 32); // 4d41fd: cmp edi, ecx
        if (R.cLE) { pc = 0x4d422a; continue; } // 4d41ff: jle 0x4d422a
        pc = 0x4d4201; continue;
      case 0x4d4201:
        R.sub((R.edi >>> 0), 0xc350, 32); // 4d4201: cmp edi, 0xc350
        if (R.cLE) { pc = 0x4d422a; continue; } // 4d4207: jle 0x4d422a
        pc = 0x4d4209; continue;
      case 0x4d4209:
        R.edi = (R.add((R.edi >>> 0), 0xffff3cb0, 32)) | 0; // 4d4209: add edi, 0xffff3cb0
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d420f: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d4213: fild dword ptr [esp + 0x38]
        R.st[0] = R.st[0] * 0.15; // 4d4217: fmul qword ptr [0x968f20]
        R.st[0] = R.st[0] + 50000.0; // 4d421d: fadd qword ptr [0x968880]
        pc = 0x4d4223; continue;
      case 0x4d4223:
        R.ftol(); // 4d4223: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d4228: mov edi, eax
        pc = 0x4d422a; continue;
      case 0x4d422a:
        R.esi = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d422a: mov esi, dword ptr [esp + 0x18]
        R.ecx = ((R.esi >>> 0)) | 0; // 4d422e: mov ecx, esi
        R.call(0x867b50, { n: 0, thisEcx: true, calleeClean: false }); // 4d4230: call 0x867b50
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d4235: test eax, eax
        if (R.zf) { pc = 0x4d4240; continue; } // 4d4237: je 0x4d4240
        pc = 0x4d4239; continue;
      case 0x4d4239:
        R.eax = (R.m.u32(((R.esi + 0x21) | 0) >>> 0)) | 0; // 4d4239: mov eax, dword ptr [esi + 0x21]
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 4d423c: cmp edi, eax
        if (!R.cL) { pc = 0x4d424e; continue; } // 4d423e: jge 0x4d424e
        pc = 0x4d4240; continue;
      case 0x4d4240:
        R.eax = ((R.edi >>> 0)) | 0; // 4d4240: mov eax, edi
        R.edi = (R.pop()) | 0; // 4d4242: pop edi
        R.esi = (R.pop()) | 0; // 4d4243: pop esi
        R.ebp = (R.pop()) | 0; // 4d4244: pop ebp
        R.ebx = (R.pop()) | 0; // 4d4245: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x7c, 32)) | 0; // 4d4246: add esp, 0x7c
        return R.ret(6); // 4d4249: ret 0x18
      case 0x4d424c:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 4d424c: xor eax, eax
        pc = 0x4d424e; continue;
      case 0x4d424e:
        R.edi = (R.pop()) | 0; // 4d424e: pop edi
        R.esi = (R.pop()) | 0; // 4d424f: pop esi
        R.ebp = (R.pop()) | 0; // 4d4250: pop ebp
        R.ebx = (R.pop()) | 0; // 4d4251: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x7c, 32)) | 0; // 4d4252: add esp, 0x7c
        return R.ret(6); // 4d4255: ret 0x18
      default: throw new Error(`f_4d1600: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
