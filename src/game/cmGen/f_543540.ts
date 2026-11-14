// 0x543540 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 5442f0=2, 544380=2, 5e8290=9, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_543540(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x543540;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x543540:
        R.edx = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 543540: mov edx, dword ptr [esp + 4]
        R.esp = (R.sub((R.esp >>> 0), 0x204, 32)) | 0; // 543544: sub esp, 0x204
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 54354a: test edx, edx
        if (R.zf) { pc = 0x543a26; continue; } // 54354c: je 0x543a26
        pc = 0x543552; continue;
      case 0x543552:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esp + 0x210) | 0) >>> 0)) & 0xff) << 0)) | 0; // 543552: mov cl, byte ptr [esp + 0x210]
        R.sub(((R.ecx >>> 0) & 0xff), 0x1, 8); // 543559: cmp cl, 1
        if (R.cL) { pc = 0x543a26; continue; } // 54355c: jl 0x543a26
        pc = 0x543562; continue;
      case 0x543562:
        R.sub(((R.ecx >>> 0) & 0xff), 0x1f, 8); // 543562: cmp cl, 0x1f
        if (!R.cLE) { pc = 0x543a26; continue; } // 543565: jg 0x543a26
        pc = 0x54356b; continue;
      case 0x54356b:
        R.eax = (R.m.u32(((R.esp + 0x20c) | 0) >>> 0)) | 0; // 54356b: mov eax, dword ptr [esp + 0x20c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 543572: test eax, eax
        if (!R.zf) { pc = 0x5435aa; continue; } // 543574: jne 0x5435aa
        pc = 0x543576; continue;
      case 0x543576:
        R.eax = (((R.esp + 0x4) | 0)) | 0; // 543576: lea eax, [esp + 4]
        R.ecx = (((R.esp + 0x104) | 0)) | 0; // 54357a: lea ecx, [esp + 0x104]
        R.push((R.eax >>> 0)); // 543581: push eax
        R.push((R.ecx >>> 0)); // 543582: push ecx
        R.push(0x0); // 543583: push 0
        R.push(0x0); // 543585: push 0
        R.push(0x9b5ac8); // 543587: push 0x9b5ac8
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 54358c: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 543591: add esp, 0x14
        R.edx = (((R.esp + 0x4) | 0)) | 0; // 543594: lea edx, [esp + 4]
        R.eax = (((R.esp + 0x104) | 0)) | 0; // 543598: lea eax, [esp + 0x104]
        R.push(0x4903); // 54359f: push 0x4903
        R.push((R.edx >>> 0)); // 5435a4: push edx
        pc = 0x543a55; continue; // 5435a5: jmp 0x543a55
      case 0x5435aa:
        R.ecx = (((((R.ecx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 5435aa: movsx ecx, cl
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 5435ad: dec ecx
        R.sub((R.ecx >>> 0), 0x1e, 32); // 5435ae: cmp ecx, 0x1e
        if (!R.cBE) { pc = 0x5439f4; continue; } // 5435b1: ja 0x5439f4
        pc = 0x5435b7; continue;
      case 0x5435b7:
        pc = [0x5435be, 0x54365b, 0x543665, 0x54366f, 0x5436c7, 0x5436d1, 0x5436db, 0x543722, 0x5435c8, 0x54376c, 0x543776, 0x54396c, 0x5437c0, 0x5437ca, 0x543814, 0x543833, 0x54383d, 0x5439d6, 0x543847, 0x543891, 0x5438db, 0x5438e5, 0x543904, 0x543923, 0x543962, 0x54399a, 0x5439a4, 0x5439ae, 0x5439c2, 0x5439cc, 0x5439ea][R.ecx >>> 0]; continue; // 5435b7: jmp dword ptr [ecx*4 + 0x543a94]
      case 0x5435be:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x1b) | 0) >>> 0)) & 0xff) << 0)) | 0; // 5435be: mov al, byte ptr [eax + 0x1b]
        R.esp = (R.add((R.esp >>> 0), 0x204, 32)) | 0; // 5435c1: add esp, 0x204
        return R.ret(0); // 5435c7: ret 
      case 0x5435c8:
        R.ecx = (((R.m.u8(((R.eax + 0x24) | 0) >>> 0)) << 24 >> 24)) | 0; // 5435c8: movsx ecx, byte ptr [eax + 0x24]
        R.edx = (((R.m.u16(((R.eax + 0x5) | 0) >>> 0)) << 16 >> 16)) | 0; // 5435cc: movsx edx, word ptr [eax + 5]
        R.m.w32(((R.esp) | 0) >>> 0, (R.ecx >>> 0)); // 5435d0: mov dword ptr [esp], ecx
        R.fpush(R.m.s32(((R.esp) | 0) >>> 0)); // 5435d4: fild dword ptr [esp]
        R.m.w32(((R.esp) | 0) >>> 0, (R.edx >>> 0)); // 5435d8: mov dword ptr [esp], edx
        R.st[0] = R.st[0] + R.st[0]; // 5435dc: fadd st(0), st(0)
        R.fpush(R.m.s32(((R.esp) | 0) >>> 0)); // 5435de: fild dword ptr [esp]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 5435e2: faddp st(1)
        R.st[0] = R.st[0] * 0.05; // 5435e4: fmul qword ptr [0x967888]
        R.st[0] = R.st[0] + 10.0; // 5435ea: fadd qword ptr [0x9688b0]
        R.fpush(R.st[0]); // 5435f0: fld st(0)
        R.st[0] = R.st[0] * R.st[1]; // 5435f2: fmul st(1)
        R.st[0] = R.st[0] * 0.1; // 5435f4: fmul qword ptr [0x967880]
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 5435fa: fxch st(1)
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 5435fc: faddp st(1)
        R.st[0] = R.st[0] * 0.3333333333333333; // 5435fe: fmul qword ptr [0x968a80]
        R.st[0] = R.st[0] + 0.5; // 543604: fadd qword ptr [0x968968]
        R.fcom(R.st[0], 1.0); // 54360a: fcom qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 543610: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 543612: test ah, 0x41
        if (!R.zf) { pc = 0x543626; continue; } // 543615: jne 0x543626
        pc = 0x543617; continue;
      case 0x543617:
        R.fpush(R.st[0]); // 543617: fld st(0)
        R.fcom(R.st[0], 20.0); R.fpop(); // 543619: fcomp qword ptr [0x968ea8]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 54361f: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 543621: test ah, 1
        if (R.zf) { pc = 0x543647; continue; } // 543624: je 0x543647
        pc = 0x543626; continue;
      case 0x543626:
        R.fcom(R.st[0], 1.0); // 543626: fcom qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 54362c: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 54362e: test ah, 0x41
        if (R.zf) { pc = 0x54364f; continue; } // 543631: je 0x54364f
        pc = 0x543633; continue;
      case 0x543633:
        R.fpop(); // 543633: fstp st(0)
        R.fpush(1.0); // 543635: fld qword ptr [0x967890]
        R.ftol(); // 54363b: call 0x945640
        R.esp = (R.add((R.esp >>> 0), 0x204, 32)) | 0; // 543640: add esp, 0x204
        return R.ret(0); // 543646: ret 
      case 0x543647:
        R.fpop(); // 543647: fstp st(0)
        R.fpush(20.0); // 543649: fld qword ptr [0x968ea8]
        pc = 0x54364f; continue;
      case 0x54364f:
        R.ftol(); // 54364f: call 0x945640
        R.esp = (R.add((R.esp >>> 0), 0x204, 32)) | 0; // 543654: add esp, 0x204
        return R.ret(0); // 54365a: ret 
      case 0x54365b:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x1c) | 0) >>> 0)) & 0xff) << 0)) | 0; // 54365b: mov al, byte ptr [eax + 0x1c]
        R.esp = (R.add((R.esp >>> 0), 0x204, 32)) | 0; // 54365e: add esp, 0x204
        return R.ret(0); // 543664: ret 
      case 0x543665:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x1d) | 0) >>> 0)) & 0xff) << 0)) | 0; // 543665: mov al, byte ptr [eax + 0x1d]
        R.esp = (R.add((R.esp >>> 0), 0x204, 32)) | 0; // 543668: add esp, 0x204
        return R.ret(0); // 54366e: ret 
      case 0x54366f:
        R.ecx = (((R.m.u8(((R.eax + 0x1e) | 0) >>> 0)) << 24 >> 24)) | 0; // 54366f: movsx ecx, byte ptr [eax + 0x1e]
        R.edx = (((R.m.u16(((R.eax + 0x5) | 0) >>> 0)) << 16 >> 16)) | 0; // 543673: movsx edx, word ptr [eax + 5]
        R.m.w32(((R.esp) | 0) >>> 0, (R.ecx >>> 0)); // 543677: mov dword ptr [esp], ecx
        R.fpush(R.m.s32(((R.esp) | 0) >>> 0)); // 54367b: fild dword ptr [esp]
        R.m.w32(((R.esp) | 0) >>> 0, (R.edx >>> 0)); // 54367f: mov dword ptr [esp], edx
        R.st[0] = R.st[0] + R.st[0]; // 543683: fadd st(0), st(0)
        R.fpush(R.m.s32(((R.esp) | 0) >>> 0)); // 543685: fild dword ptr [esp]
        pc = 0x543689; continue;
      case 0x543689:
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 543689: faddp st(1)
        R.st[0] = R.st[0] * 0.05; // 54368b: fmul qword ptr [0x967888]
        R.st[0] = R.st[0] + 10.0; // 543691: fadd qword ptr [0x9688b0]
        R.fpush(R.st[0]); // 543697: fld st(0)
        R.st[0] = R.st[0] * R.st[1]; // 543699: fmul st(1)
        R.st[0] = R.st[0] * 0.1; // 54369b: fmul qword ptr [0x967880]
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 5436a1: fxch st(1)
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 5436a3: faddp st(1)
        R.st[0] = R.st[0] * 0.3333333333333333; // 5436a5: fmul qword ptr [0x968a80]
        R.st[0] = R.st[0] + 0.5; // 5436ab: fadd qword ptr [0x968968]
        R.fcom(R.st[0], 1.0); // 5436b1: fcom qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 5436b7: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 5436b9: test ah, 0x41
        if (!R.zf) { pc = 0x543626; continue; } // 5436bc: jne 0x543626
        pc = 0x5436c2; continue;
      case 0x5436c2:
        pc = 0x543617; continue; // 5436c2: jmp 0x543617
      case 0x5436c7:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x1f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 5436c7: mov al, byte ptr [eax + 0x1f]
        R.esp = (R.add((R.esp >>> 0), 0x204, 32)) | 0; // 5436ca: add esp, 0x204
        return R.ret(0); // 5436d0: ret 
      case 0x5436d1:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x20) | 0) >>> 0)) & 0xff) << 0)) | 0; // 5436d1: mov al, byte ptr [eax + 0x20]
        R.esp = (R.add((R.esp >>> 0), 0x204, 32)) | 0; // 5436d4: add esp, 0x204
        return R.ret(0); // 5436da: ret 
      case 0x5436db:
        R.sub(R.m.u8(((R.eax + 0xf) | 0) >>> 0), 0x14, 8); // 5436db: cmp byte ptr [eax + 0xf], 0x14
        if (!R.zf) { pc = 0x543703; continue; } // 5436df: jne 0x543703
        pc = 0x5436e1; continue;
      case 0x5436e1:
        R.ecx = (((R.m.u16(((R.eax + 0x5) | 0) >>> 0)) << 16 >> 16)) | 0; // 5436e1: movsx ecx, word ptr [eax + 5]
        R.edx = (((R.m.u8(((R.eax + 0x43) | 0) >>> 0)) << 24 >> 24)) | 0; // 5436e5: movsx edx, byte ptr [eax + 0x43]
        R.m.w32(((R.esp) | 0) >>> 0, (R.ecx >>> 0)); // 5436e9: mov dword ptr [esp], ecx
        R.fpush(R.m.s32(((R.esp) | 0) >>> 0)); // 5436ed: fild dword ptr [esp]
        R.m.w32(((R.esp) | 0) >>> 0, (R.edx >>> 0)); // 5436f1: mov dword ptr [esp], edx
        R.st[0] = R.st[0] * 0.1; // 5436f5: fmul qword ptr [0x967880]
        R.fpush(R.m.s32(((R.esp) | 0) >>> 0)); // 5436fb: fild dword ptr [esp]
        R.st[0] = R.st[0] + R.st[0]; // 5436ff: fadd st(0), st(0)
        pc = 0x543689; continue; // 543701: jmp 0x543689
      case 0x543703:
        R.ecx = (((R.m.u8(((R.eax + 0x43) | 0) >>> 0)) << 24 >> 24)) | 0; // 543703: movsx ecx, byte ptr [eax + 0x43]
        R.edx = (((R.m.u16(((R.eax + 0x5) | 0) >>> 0)) << 16 >> 16)) | 0; // 543707: movsx edx, word ptr [eax + 5]
        R.m.w32(((R.esp) | 0) >>> 0, (R.ecx >>> 0)); // 54370b: mov dword ptr [esp], ecx
        R.fpush(R.m.s32(((R.esp) | 0) >>> 0)); // 54370f: fild dword ptr [esp]
        R.m.w32(((R.esp) | 0) >>> 0, (R.edx >>> 0)); // 543713: mov dword ptr [esp], edx
        R.st[0] = R.st[0] + R.st[0]; // 543717: fadd st(0), st(0)
        R.fpush(R.m.s32(((R.esp) | 0) >>> 0)); // 543719: fild dword ptr [esp]
        pc = 0x543689; continue; // 54371d: jmp 0x543689
      case 0x543722:
        R.sub(R.m.u8(((R.eax + 0xf) | 0) >>> 0), 0x14, 8); // 543722: cmp byte ptr [eax + 0xf], 0x14
        if (!R.zf) { pc = 0x54374d; continue; } // 543726: jne 0x54374d
        pc = 0x543728; continue;
      case 0x543728:
        R.ecx = (((R.m.u16(((R.eax + 0x5) | 0) >>> 0)) << 16 >> 16)) | 0; // 543728: movsx ecx, word ptr [eax + 5]
        R.edx = (((R.m.u8(((R.eax + 0x23) | 0) >>> 0)) << 24 >> 24)) | 0; // 54372c: movsx edx, byte ptr [eax + 0x23]
        R.m.w32(((R.esp) | 0) >>> 0, (R.ecx >>> 0)); // 543730: mov dword ptr [esp], ecx
        R.fpush(R.m.s32(((R.esp) | 0) >>> 0)); // 543734: fild dword ptr [esp]
        R.m.w32(((R.esp) | 0) >>> 0, (R.edx >>> 0)); // 543738: mov dword ptr [esp], edx
        R.st[0] = R.st[0] * 0.1; // 54373c: fmul qword ptr [0x967880]
        R.fpush(R.m.s32(((R.esp) | 0) >>> 0)); // 543742: fild dword ptr [esp]
        R.st[0] = R.st[0] + R.st[0]; // 543746: fadd st(0), st(0)
        pc = 0x543689; continue; // 543748: jmp 0x543689
      case 0x54374d:
        R.ecx = (((R.m.u8(((R.eax + 0x23) | 0) >>> 0)) << 24 >> 24)) | 0; // 54374d: movsx ecx, byte ptr [eax + 0x23]
        R.edx = (((R.m.u16(((R.eax + 0x5) | 0) >>> 0)) << 16 >> 16)) | 0; // 543751: movsx edx, word ptr [eax + 5]
        R.m.w32(((R.esp) | 0) >>> 0, (R.ecx >>> 0)); // 543755: mov dword ptr [esp], ecx
        R.fpush(R.m.s32(((R.esp) | 0) >>> 0)); // 543759: fild dword ptr [esp]
        R.m.w32(((R.esp) | 0) >>> 0, (R.edx >>> 0)); // 54375d: mov dword ptr [esp], edx
        R.st[0] = R.st[0] + R.st[0]; // 543761: fadd st(0), st(0)
        R.fpush(R.m.s32(((R.esp) | 0) >>> 0)); // 543763: fild dword ptr [esp]
        pc = 0x543689; continue; // 543767: jmp 0x543689
      case 0x54376c:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edx + 0x58) | 0) >>> 0)) & 0xff) << 0)) | 0; // 54376c: mov al, byte ptr [edx + 0x58]
        R.esp = (R.add((R.esp >>> 0), 0x204, 32)) | 0; // 54376f: add esp, 0x204
        return R.ret(0); // 543775: ret 
      case 0x543776:
        R.sub(R.m.u8(((R.eax + 0xf) | 0) >>> 0), 0x14, 8); // 543776: cmp byte ptr [eax + 0xf], 0x14
        if (!R.zf) { pc = 0x5437a1; continue; } // 54377a: jne 0x5437a1
        pc = 0x54377c; continue;
      case 0x54377c:
        R.ecx = (((R.m.u16(((R.eax + 0x5) | 0) >>> 0)) << 16 >> 16)) | 0; // 54377c: movsx ecx, word ptr [eax + 5]
        R.edx = (((R.m.u8(((R.eax + 0x26) | 0) >>> 0)) << 24 >> 24)) | 0; // 543780: movsx edx, byte ptr [eax + 0x26]
        R.m.w32(((R.esp) | 0) >>> 0, (R.ecx >>> 0)); // 543784: mov dword ptr [esp], ecx
        R.fpush(R.m.s32(((R.esp) | 0) >>> 0)); // 543788: fild dword ptr [esp]
        R.m.w32(((R.esp) | 0) >>> 0, (R.edx >>> 0)); // 54378c: mov dword ptr [esp], edx
        R.st[0] = R.st[0] * 0.1; // 543790: fmul qword ptr [0x967880]
        R.fpush(R.m.s32(((R.esp) | 0) >>> 0)); // 543796: fild dword ptr [esp]
        R.st[0] = R.st[0] + R.st[0]; // 54379a: fadd st(0), st(0)
        pc = 0x543689; continue; // 54379c: jmp 0x543689
      case 0x5437a1:
        R.ecx = (((R.m.u8(((R.eax + 0x26) | 0) >>> 0)) << 24 >> 24)) | 0; // 5437a1: movsx ecx, byte ptr [eax + 0x26]
        R.edx = (((R.m.u16(((R.eax + 0x5) | 0) >>> 0)) << 16 >> 16)) | 0; // 5437a5: movsx edx, word ptr [eax + 5]
        R.m.w32(((R.esp) | 0) >>> 0, (R.ecx >>> 0)); // 5437a9: mov dword ptr [esp], ecx
        R.fpush(R.m.s32(((R.esp) | 0) >>> 0)); // 5437ad: fild dword ptr [esp]
        R.m.w32(((R.esp) | 0) >>> 0, (R.edx >>> 0)); // 5437b1: mov dword ptr [esp], edx
        R.st[0] = R.st[0] + R.st[0]; // 5437b5: fadd st(0), st(0)
        R.fpush(R.m.s32(((R.esp) | 0) >>> 0)); // 5437b7: fild dword ptr [esp]
        pc = 0x543689; continue; // 5437bb: jmp 0x543689
      case 0x5437c0:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x28) | 0) >>> 0)) & 0xff) << 0)) | 0; // 5437c0: mov al, byte ptr [eax + 0x28]
        R.esp = (R.add((R.esp >>> 0), 0x204, 32)) | 0; // 5437c3: add esp, 0x204
        return R.ret(0); // 5437c9: ret 
      case 0x5437ca:
        R.sub(R.m.u8(((R.eax + 0xf) | 0) >>> 0), 0xf, 8); // 5437ca: cmp byte ptr [eax + 0xf], 0xf
        if (!R.cL) { pc = 0x5437f5; continue; } // 5437ce: jge 0x5437f5
        pc = 0x5437d0; continue;
      case 0x5437d0:
        R.ecx = (((R.m.u16(((R.eax + 0x5) | 0) >>> 0)) << 16 >> 16)) | 0; // 5437d0: movsx ecx, word ptr [eax + 5]
        R.edx = (((R.m.u8(((R.eax + 0x2a) | 0) >>> 0)) << 24 >> 24)) | 0; // 5437d4: movsx edx, byte ptr [eax + 0x2a]
        R.m.w32(((R.esp) | 0) >>> 0, (R.ecx >>> 0)); // 5437d8: mov dword ptr [esp], ecx
        R.fpush(R.m.s32(((R.esp) | 0) >>> 0)); // 5437dc: fild dword ptr [esp]
        R.m.w32(((R.esp) | 0) >>> 0, (R.edx >>> 0)); // 5437e0: mov dword ptr [esp], edx
        R.st[0] = R.st[0] * 0.1; // 5437e4: fmul qword ptr [0x967880]
        R.fpush(R.m.s32(((R.esp) | 0) >>> 0)); // 5437ea: fild dword ptr [esp]
        R.st[0] = R.st[0] + R.st[0]; // 5437ee: fadd st(0), st(0)
        pc = 0x543689; continue; // 5437f0: jmp 0x543689
      case 0x5437f5:
        R.ecx = (((R.m.u8(((R.eax + 0x2a) | 0) >>> 0)) << 24 >> 24)) | 0; // 5437f5: movsx ecx, byte ptr [eax + 0x2a]
        R.edx = (((R.m.u16(((R.eax + 0x5) | 0) >>> 0)) << 16 >> 16)) | 0; // 5437f9: movsx edx, word ptr [eax + 5]
        R.m.w32(((R.esp) | 0) >>> 0, (R.ecx >>> 0)); // 5437fd: mov dword ptr [esp], ecx
        R.fpush(R.m.s32(((R.esp) | 0) >>> 0)); // 543801: fild dword ptr [esp]
        R.m.w32(((R.esp) | 0) >>> 0, (R.edx >>> 0)); // 543805: mov dword ptr [esp], edx
        R.st[0] = R.st[0] + R.st[0]; // 543809: fadd st(0), st(0)
        R.fpush(R.m.s32(((R.esp) | 0) >>> 0)); // 54380b: fild dword ptr [esp]
        pc = 0x543689; continue; // 54380f: jmp 0x543689
      case 0x543814:
        R.ecx = (((R.m.u8(((R.eax + 0x2b) | 0) >>> 0)) << 24 >> 24)) | 0; // 543814: movsx ecx, byte ptr [eax + 0x2b]
        R.edx = (((R.m.u16(((R.eax + 0x5) | 0) >>> 0)) << 16 >> 16)) | 0; // 543818: movsx edx, word ptr [eax + 5]
        R.m.w32(((R.esp) | 0) >>> 0, (R.ecx >>> 0)); // 54381c: mov dword ptr [esp], ecx
        R.fpush(R.m.s32(((R.esp) | 0) >>> 0)); // 543820: fild dword ptr [esp]
        R.m.w32(((R.esp) | 0) >>> 0, (R.edx >>> 0)); // 543824: mov dword ptr [esp], edx
        R.st[0] = R.st[0] + R.st[0]; // 543828: fadd st(0), st(0)
        R.fpush(R.m.s32(((R.esp) | 0) >>> 0)); // 54382a: fild dword ptr [esp]
        pc = 0x543689; continue; // 54382e: jmp 0x543689
      case 0x543833:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x2f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 543833: mov al, byte ptr [eax + 0x2f]
        R.esp = (R.add((R.esp >>> 0), 0x204, 32)) | 0; // 543836: add esp, 0x204
        return R.ret(0); // 54383c: ret 
      case 0x54383d:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x2e) | 0) >>> 0)) & 0xff) << 0)) | 0; // 54383d: mov al, byte ptr [eax + 0x2e]
        R.esp = (R.add((R.esp >>> 0), 0x204, 32)) | 0; // 543840: add esp, 0x204
        return R.ret(0); // 543846: ret 
      case 0x543847:
        R.sub(R.m.u8(((R.eax + 0xf) | 0) >>> 0), 0x14, 8); // 543847: cmp byte ptr [eax + 0xf], 0x14
        if (!R.zf) { pc = 0x543872; continue; } // 54384b: jne 0x543872
        pc = 0x54384d; continue;
      case 0x54384d:
        R.ecx = (((R.m.u16(((R.eax + 0x5) | 0) >>> 0)) << 16 >> 16)) | 0; // 54384d: movsx ecx, word ptr [eax + 5]
        R.edx = (((R.m.u8(((R.eax + 0x32) | 0) >>> 0)) << 24 >> 24)) | 0; // 543851: movsx edx, byte ptr [eax + 0x32]
        R.m.w32(((R.esp) | 0) >>> 0, (R.ecx >>> 0)); // 543855: mov dword ptr [esp], ecx
        R.fpush(R.m.s32(((R.esp) | 0) >>> 0)); // 543859: fild dword ptr [esp]
        R.m.w32(((R.esp) | 0) >>> 0, (R.edx >>> 0)); // 54385d: mov dword ptr [esp], edx
        R.st[0] = R.st[0] * 0.1; // 543861: fmul qword ptr [0x967880]
        R.fpush(R.m.s32(((R.esp) | 0) >>> 0)); // 543867: fild dword ptr [esp]
        R.st[0] = R.st[0] + R.st[0]; // 54386b: fadd st(0), st(0)
        pc = 0x543689; continue; // 54386d: jmp 0x543689
      case 0x543872:
        R.ecx = (((R.m.u8(((R.eax + 0x32) | 0) >>> 0)) << 24 >> 24)) | 0; // 543872: movsx ecx, byte ptr [eax + 0x32]
        R.edx = (((R.m.u16(((R.eax + 0x5) | 0) >>> 0)) << 16 >> 16)) | 0; // 543876: movsx edx, word ptr [eax + 5]
        R.m.w32(((R.esp) | 0) >>> 0, (R.ecx >>> 0)); // 54387a: mov dword ptr [esp], ecx
        R.fpush(R.m.s32(((R.esp) | 0) >>> 0)); // 54387e: fild dword ptr [esp]
        R.m.w32(((R.esp) | 0) >>> 0, (R.edx >>> 0)); // 543882: mov dword ptr [esp], edx
        R.st[0] = R.st[0] + R.st[0]; // 543886: fadd st(0), st(0)
        R.fpush(R.m.s32(((R.esp) | 0) >>> 0)); // 543888: fild dword ptr [esp]
        pc = 0x543689; continue; // 54388c: jmp 0x543689
      case 0x543891:
        R.sub(R.m.u8(((R.eax + 0xf) | 0) >>> 0), 0x14, 8); // 543891: cmp byte ptr [eax + 0xf], 0x14
        if (!R.zf) { pc = 0x5438bc; continue; } // 543895: jne 0x5438bc
        pc = 0x543897; continue;
      case 0x543897:
        R.ecx = (((R.m.u16(((R.eax + 0x5) | 0) >>> 0)) << 16 >> 16)) | 0; // 543897: movsx ecx, word ptr [eax + 5]
        R.edx = (((R.m.u8(((R.eax + 0x33) | 0) >>> 0)) << 24 >> 24)) | 0; // 54389b: movsx edx, byte ptr [eax + 0x33]
        R.m.w32(((R.esp) | 0) >>> 0, (R.ecx >>> 0)); // 54389f: mov dword ptr [esp], ecx
        R.fpush(R.m.s32(((R.esp) | 0) >>> 0)); // 5438a3: fild dword ptr [esp]
        R.m.w32(((R.esp) | 0) >>> 0, (R.edx >>> 0)); // 5438a7: mov dword ptr [esp], edx
        R.st[0] = R.st[0] * 0.1; // 5438ab: fmul qword ptr [0x967880]
        R.fpush(R.m.s32(((R.esp) | 0) >>> 0)); // 5438b1: fild dword ptr [esp]
        R.st[0] = R.st[0] + R.st[0]; // 5438b5: fadd st(0), st(0)
        pc = 0x543689; continue; // 5438b7: jmp 0x543689
      case 0x5438bc:
        R.ecx = (((R.m.u8(((R.eax + 0x33) | 0) >>> 0)) << 24 >> 24)) | 0; // 5438bc: movsx ecx, byte ptr [eax + 0x33]
        R.edx = (((R.m.u16(((R.eax + 0x5) | 0) >>> 0)) << 16 >> 16)) | 0; // 5438c0: movsx edx, word ptr [eax + 5]
        R.m.w32(((R.esp) | 0) >>> 0, (R.ecx >>> 0)); // 5438c4: mov dword ptr [esp], ecx
        R.fpush(R.m.s32(((R.esp) | 0) >>> 0)); // 5438c8: fild dword ptr [esp]
        R.m.w32(((R.esp) | 0) >>> 0, (R.edx >>> 0)); // 5438cc: mov dword ptr [esp], edx
        R.st[0] = R.st[0] + R.st[0]; // 5438d0: fadd st(0), st(0)
        R.fpush(R.m.s32(((R.esp) | 0) >>> 0)); // 5438d2: fild dword ptr [esp]
        pc = 0x543689; continue; // 5438d6: jmp 0x543689
      case 0x5438db:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x36) | 0) >>> 0)) & 0xff) << 0)) | 0; // 5438db: mov al, byte ptr [eax + 0x36]
        R.esp = (R.add((R.esp >>> 0), 0x204, 32)) | 0; // 5438de: add esp, 0x204
        return R.ret(0); // 5438e4: ret 
      case 0x5438e5:
        R.ecx = (((R.m.u8(((R.eax + 0x37) | 0) >>> 0)) << 24 >> 24)) | 0; // 5438e5: movsx ecx, byte ptr [eax + 0x37]
        R.edx = (((R.m.u16(((R.eax + 0x5) | 0) >>> 0)) << 16 >> 16)) | 0; // 5438e9: movsx edx, word ptr [eax + 5]
        R.m.w32(((R.esp) | 0) >>> 0, (R.ecx >>> 0)); // 5438ed: mov dword ptr [esp], ecx
        R.fpush(R.m.s32(((R.esp) | 0) >>> 0)); // 5438f1: fild dword ptr [esp]
        R.m.w32(((R.esp) | 0) >>> 0, (R.edx >>> 0)); // 5438f5: mov dword ptr [esp], edx
        R.st[0] = R.st[0] + R.st[0]; // 5438f9: fadd st(0), st(0)
        R.fpush(R.m.s32(((R.esp) | 0) >>> 0)); // 5438fb: fild dword ptr [esp]
        pc = 0x543689; continue; // 5438ff: jmp 0x543689
      case 0x543904:
        R.ecx = (((R.m.u8(((R.eax + 0x39) | 0) >>> 0)) << 24 >> 24)) | 0; // 543904: movsx ecx, byte ptr [eax + 0x39]
        R.edx = (((R.m.u16(((R.eax + 0x5) | 0) >>> 0)) << 16 >> 16)) | 0; // 543908: movsx edx, word ptr [eax + 5]
        R.m.w32(((R.esp) | 0) >>> 0, (R.ecx >>> 0)); // 54390c: mov dword ptr [esp], ecx
        R.fpush(R.m.s32(((R.esp) | 0) >>> 0)); // 543910: fild dword ptr [esp]
        R.m.w32(((R.esp) | 0) >>> 0, (R.edx >>> 0)); // 543914: mov dword ptr [esp], edx
        R.st[0] = R.st[0] + R.st[0]; // 543918: fadd st(0), st(0)
        R.fpush(R.m.s32(((R.esp) | 0) >>> 0)); // 54391a: fild dword ptr [esp]
        pc = 0x543689; continue; // 54391e: jmp 0x543689
      case 0x543923:
        R.sub(R.m.u8(((R.eax + 0xf) | 0) >>> 0), 0xf, 8); // 543923: cmp byte ptr [eax + 0xf], 0xf
        if (!R.cL) { pc = 0x54394e; continue; } // 543927: jge 0x54394e
        pc = 0x543929; continue;
      case 0x543929:
        R.ecx = (((R.m.u16(((R.eax + 0x5) | 0) >>> 0)) << 16 >> 16)) | 0; // 543929: movsx ecx, word ptr [eax + 5]
        R.edx = (((R.m.u8(((R.eax + 0x3a) | 0) >>> 0)) << 24 >> 24)) | 0; // 54392d: movsx edx, byte ptr [eax + 0x3a]
        R.m.w32(((R.esp) | 0) >>> 0, (R.ecx >>> 0)); // 543931: mov dword ptr [esp], ecx
        R.fpush(R.m.s32(((R.esp) | 0) >>> 0)); // 543935: fild dword ptr [esp]
        R.m.w32(((R.esp) | 0) >>> 0, (R.edx >>> 0)); // 543939: mov dword ptr [esp], edx
        R.st[0] = R.st[0] * 0.1; // 54393d: fmul qword ptr [0x967880]
        R.fpush(R.m.s32(((R.esp) | 0) >>> 0)); // 543943: fild dword ptr [esp]
        R.st[0] = R.st[0] + R.st[0]; // 543947: fadd st(0), st(0)
        pc = 0x543689; continue; // 543949: jmp 0x543689
      case 0x54394e:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + 0x3a) | 0) >>> 0)) & 0xff) << 0)) | 0; // 54394e: mov cl, byte ptr [eax + 0x3a]
        R.push((R.ecx >>> 0)); // 543951: push ecx
        R.push((R.eax >>> 0)); // 543952: push eax
        R.call(0x544380, { n: 2, thisEcx: false, calleeClean: false }); // 543953: call 0x544380
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 543958: add esp, 8
        R.esp = (R.add((R.esp >>> 0), 0x204, 32)) | 0; // 54395b: add esp, 0x204
        return R.ret(0); // 543961: ret 
      case 0x543962:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x29) | 0) >>> 0)) & 0xff) << 0)) | 0; // 543962: mov al, byte ptr [eax + 0x29]
        R.esp = (R.add((R.esp >>> 0), 0x204, 32)) | 0; // 543965: add esp, 0x204
        return R.ret(0); // 54396b: ret 
      case 0x54396c:
        R.sub(R.m.u8(((R.eax + 0xf) | 0) >>> 0), 0x14, 8); // 54396c: cmp byte ptr [eax + 0xf], 0x14
        if (!R.zf) { pc = 0x543986; continue; } // 543970: jne 0x543986
        pc = 0x543972; continue;
      case 0x543972:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x27) | 0) >>> 0)) & 0xff) << 0)) | 0; // 543972: mov dl, byte ptr [eax + 0x27]
        R.push((R.edx >>> 0)); // 543975: push edx
        R.push((R.eax >>> 0)); // 543976: push eax
        R.call(0x5442f0, { n: 2, thisEcx: false, calleeClean: false }); // 543977: call 0x5442f0
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 54397c: add esp, 8
        R.esp = (R.add((R.esp >>> 0), 0x204, 32)) | 0; // 54397f: add esp, 0x204
        return R.ret(0); // 543985: ret 
      case 0x543986:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + 0x27) | 0) >>> 0)) & 0xff) << 0)) | 0; // 543986: mov cl, byte ptr [eax + 0x27]
        R.push((R.ecx >>> 0)); // 543989: push ecx
        R.push((R.eax >>> 0)); // 54398a: push eax
        R.call(0x544380, { n: 2, thisEcx: false, calleeClean: false }); // 54398b: call 0x544380
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 543990: add esp, 8
        R.esp = (R.add((R.esp >>> 0), 0x204, 32)) | 0; // 543993: add esp, 0x204
        return R.ret(0); // 543999: ret 
      case 0x54399a:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x3c) | 0) >>> 0)) & 0xff) << 0)) | 0; // 54399a: mov al, byte ptr [eax + 0x3c]
        R.esp = (R.add((R.esp >>> 0), 0x204, 32)) | 0; // 54399d: add esp, 0x204
        return R.ret(0); // 5439a3: ret 
      case 0x5439a4:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x3d) | 0) >>> 0)) & 0xff) << 0)) | 0; // 5439a4: mov al, byte ptr [eax + 0x3d]
        R.esp = (R.add((R.esp >>> 0), 0x204, 32)) | 0; // 5439a7: add esp, 0x204
        return R.ret(0); // 5439ad: ret 
      case 0x5439ae:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x3e) | 0) >>> 0)) & 0xff) << 0)) | 0; // 5439ae: mov dl, byte ptr [eax + 0x3e]
        R.push((R.edx >>> 0)); // 5439b1: push edx
        R.push((R.eax >>> 0)); // 5439b2: push eax
        R.call(0x544380, { n: 2, thisEcx: false, calleeClean: false }); // 5439b3: call 0x544380
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 5439b8: add esp, 8
        R.esp = (R.add((R.esp >>> 0), 0x204, 32)) | 0; // 5439bb: add esp, 0x204
        return R.ret(0); // 5439c1: ret 
      case 0x5439c2:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x3f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 5439c2: mov al, byte ptr [eax + 0x3f]
        R.esp = (R.add((R.esp >>> 0), 0x204, 32)) | 0; // 5439c5: add esp, 0x204
        return R.ret(0); // 5439cb: ret 
      case 0x5439cc:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x40) | 0) >>> 0)) & 0xff) << 0)) | 0; // 5439cc: mov al, byte ptr [eax + 0x40]
        R.esp = (R.add((R.esp >>> 0), 0x204, 32)) | 0; // 5439cf: add esp, 0x204
        return R.ret(0); // 5439d5: ret 
      case 0x5439d6:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + 0x31) | 0) >>> 0)) & 0xff) << 0)) | 0; // 5439d6: mov cl, byte ptr [eax + 0x31]
        R.push((R.ecx >>> 0)); // 5439d9: push ecx
        R.push((R.eax >>> 0)); // 5439da: push eax
        R.call(0x544380, { n: 2, thisEcx: false, calleeClean: false }); // 5439db: call 0x544380
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 5439e0: add esp, 8
        R.esp = (R.add((R.esp >>> 0), 0x204, 32)) | 0; // 5439e3: add esp, 0x204
        return R.ret(0); // 5439e9: ret 
      case 0x5439ea:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x44) | 0) >>> 0)) & 0xff) << 0)) | 0; // 5439ea: mov al, byte ptr [eax + 0x44]
        R.esp = (R.add((R.esp >>> 0), 0x204, 32)) | 0; // 5439ed: add esp, 0x204
        return R.ret(0); // 5439f3: ret 
      case 0x5439f4:
        R.edx = (((R.esp + 0x104) | 0)) | 0; // 5439f4: lea edx, [esp + 0x104]
        R.eax = (((R.esp + 0x4) | 0)) | 0; // 5439fb: lea eax, [esp + 4]
        R.push((R.edx >>> 0)); // 5439ff: push edx
        R.push((R.eax >>> 0)); // 543a00: push eax
        R.push(0x0); // 543a01: push 0
        R.push(0x0); // 543a03: push 0
        R.push(0x9b5ac8); // 543a05: push 0x9b5ac8
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 543a0a: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 543a0f: add esp, 0x14
        R.ecx = (((R.esp + 0x104) | 0)) | 0; // 543a12: lea ecx, [esp + 0x104]
        R.edx = (((R.esp + 0x4) | 0)) | 0; // 543a19: lea edx, [esp + 4]
        R.push(0x4981); // 543a1d: push 0x4981
        R.push((R.ecx >>> 0)); // 543a22: push ecx
        R.push((R.edx >>> 0)); // 543a23: push edx
        pc = 0x543a56; continue; // 543a24: jmp 0x543a56
      case 0x543a26:
        R.eax = (((R.esp + 0x104) | 0)) | 0; // 543a26: lea eax, [esp + 0x104]
        R.ecx = (((R.esp + 0x4) | 0)) | 0; // 543a2d: lea ecx, [esp + 4]
        R.push((R.eax >>> 0)); // 543a31: push eax
        R.push((R.ecx >>> 0)); // 543a32: push ecx
        R.push(0x0); // 543a33: push 0
        R.push(0x0); // 543a35: push 0
        R.push(0x9b5ac8); // 543a37: push 0x9b5ac8
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 543a3c: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 543a41: add esp, 0x14
        R.edx = (((R.esp + 0x104) | 0)) | 0; // 543a44: lea edx, [esp + 0x104]
        R.eax = (((R.esp + 0x4) | 0)) | 0; // 543a4b: lea eax, [esp + 4]
        R.push(0x48fc); // 543a4f: push 0x48fc
        R.push((R.edx >>> 0)); // 543a54: push edx
        pc = 0x543a55; continue;
      case 0x543a55:
        R.push((R.eax >>> 0)); // 543a55: push eax
        pc = 0x543a56; continue;
      case 0x543a56:
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 543a56: call 0x90d130
        R.push((R.eax >>> 0)); // 543a5b: push eax
        R.push(0x9870e8); // 543a5c: push 0x9870e8
        R.push(0xae24d0); // 543a61: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 543a66: call 0x944c9f
        R.push(0x0); // 543a6b: push 0
        R.push(0xae24d0); // 543a6d: push 0xae24d0
        R.push(0x9870e0); // 543a72: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 543a77: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 543a7c: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 543a7f: mov dword ptr [0xb67a34], 0
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) | 0xff, 8)) & 0xff) << 0)) | 0; // 543a89: or al, 0xff
        R.esp = (R.add((R.esp >>> 0), 0x204, 32)) | 0; // 543a8b: add esp, 0x204
        return R.ret(0); // 543a91: ret 
      default: throw new Error(`f_543540: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
