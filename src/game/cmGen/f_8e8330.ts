// 0x8e8330 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 598800=5tc, 5a0590=1tc
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_8e8330(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x8e8330;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x8e8330:
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 8e8330: mov eax, dword ptr [esp + 4]
        R.push((R.ebx >>> 0)); // 8e8334: push ebx
        R.push((R.ebp >>> 0)); // 8e8335: push ebp
        R.push((R.esi >>> 0)); // 8e8336: push esi
        R.eax = (R.m.u32(((R.eax + 0x61) | 0) >>> 0)) | 0; // 8e8337: mov eax, dword ptr [eax + 0x61]
        R.push((R.edi >>> 0)); // 8e833a: push edi
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e833b: test eax, eax
        R.edi = ((R.ecx >>> 0)) | 0; // 8e833d: mov edi, ecx
        if (R.zf) { pc = 0x8e8495; continue; } // 8e833f: je 0x8e8495
        pc = 0x8e8345; continue;
      case 0x8e8345:
        R.ecx = (((R.m.u16(((R.eax + 0x7) | 0) >>> 0)) << 16 >> 16)) | 0; // 8e8345: movsx ecx, word ptr [eax + 7]
        R.edx = (((R.m.u16(((R.eax + 0x5) | 0) >>> 0)) << 16 >> 16)) | 0; // 8e8349: movsx edx, word ptr [eax + 5]
        R.ecx = (R.sub((R.ecx >>> 0), (R.edx >>> 0), 32)) | 0; // 8e834d: sub ecx, edx
        R.sub((R.ecx >>> 0), 0x19, 32); // 8e834f: cmp ecx, 0x19
        if (R.cL) { pc = 0x8e8495; continue; } // 8e8352: jl 0x8e8495
        pc = 0x8e8358; continue;
      case 0x8e8358:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edi + 0x3f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e8358: mov al, byte ptr [edi + 0x3f]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 8e835b: test al, al
        if (!R.zf) { pc = 0x8e8495; continue; } // 8e835d: jne 0x8e8495
        pc = 0x8e8363; continue;
      case 0x8e8363:
        R.eax = (R.m.u32(((R.edi + 0x3a) | 0) >>> 0)) | 0; // 8e8363: mov eax, dword ptr [edi + 0x3a]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e8366: test eax, eax
        if (!R.zf) { pc = 0x8e8495; continue; } // 8e8368: jne 0x8e8495
        pc = 0x8e836e; continue;
      case 0x8e836e:
        R.eax = (R.m.u32(((R.edi + 0x35) | 0) >>> 0)) | 0; // 8e836e: mov eax, dword ptr [edi + 0x35]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e8371: test eax, eax
        if (!R.zf) { pc = 0x8e8495; continue; } // 8e8373: jne 0x8e8495
        pc = 0x8e8379; continue;
      case 0x8e8379:
        R.ebx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 8e8379: mov ebx, dword ptr [esp + 0x1c]
        R.ecx = (R.m.u32(((0xae2a38) | 0) >>> 0)) | 0; // 8e837d: mov ecx, dword ptr [0xae2a38]
        R.push((R.ebx >>> 0)); // 8e8383: push ebx
        R.call(0x5a0590, { n: 1, thisEcx: true, calleeClean: true }); // 8e8384: call 0x5a0590
        R.esi = (R.m.u32(((R.edi + 0x1b) | 0) >>> 0)) | 0; // 8e8389: mov esi, dword ptr [edi + 0x1b]
        R.push(0x0); // 8e838c: push 0
        R.push(0x1); // 8e838e: push 1
        R.push(0x0); // 8e8390: push 0
        R.push(0x0); // 8e8392: push 0
        R.push(0x0); // 8e8394: push 0
        R.ecx = ((R.eax >>> 0)) | 0; // 8e8396: mov ecx, eax
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.esi >>> 0)); // 8e8398: mov dword ptr [esp + 0x30], esi
        R.call(0x598800, { n: 5, thisEcx: true, calleeClean: true }); // 8e839c: call 0x598800
        R.ebp = ((R.eax >>> 0)) | 0; // 8e83a1: mov ebp, eax
        R.eax = (((R.esi + R.esi) | 0)) | 0; // 8e83a3: lea eax, [esi + esi]
        R.ecx = ((R.edx >>> 0)) | 0; // 8e83a6: mov ecx, edx
        R.edx = R.eax < 0 ? -1 : 0; // 8e83a8: cdq 
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 8e83a9: cmp ecx, edx
        if (!R.cLE) { pc = 0x8e8495; continue; } // 8e83ab: jg 0x8e8495
        pc = 0x8e83b1; continue;
      case 0x8e83b1:
        if (R.cL) { pc = 0x8e83bb; continue; } // 8e83b1: jl 0x8e83bb
        pc = 0x8e83b3; continue;
      case 0x8e83b3:
        R.sub((R.ebp >>> 0), (R.eax >>> 0), 32); // 8e83b3: cmp ebp, eax
        if (!R.cBE) { pc = 0x8e8495; continue; } // 8e83b5: ja 0x8e8495
        pc = 0x8e83bb; continue;
      case 0x8e83bb:
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8e83bb: mov cx, word ptr [ebx + 0x80]
        R.esi = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 8e83c2: mov esi, dword ptr [esp + 0x14]
        R.sub(((R.ecx >>> 0) & 0xffff), 0xf, 16); // 8e83c6: cmp cx, 0xf
        if (!R.cL) { pc = 0x8e840b; continue; } // 8e83ca: jge 0x8e840b
        pc = 0x8e83cc; continue;
      case 0x8e83cc:
        R.eax = (R.m.u32(((R.esi + 0x61) | 0) >>> 0)) | 0; // 8e83cc: mov eax, dword ptr [esi + 0x61]
        R.edx = (((R.m.u16(((R.eax + 0xb) | 0) >>> 0)) << 16 >> 16)) | 0; // 8e83cf: movsx edx, word ptr [eax + 0xb]
        R.eax = (0x10624dd3) | 0; // 8e83d3: mov eax, 0x10624dd3
        { const p = BigInt(R.eax | 0) * BigInt((((R.edx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 8e83d8: imul edx
        R.edx = (R.sar((R.edx >>> 0), 0x5, 32)) | 0; // 8e83da: sar edx, 5
        R.eax = ((R.edx >>> 0)) | 0; // 8e83dd: mov eax, edx
        R.eax = (R.shr((R.eax >>> 0), 0x1f, 32)) | 0; // 8e83df: shr eax, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8e83e2: add edx, eax
        R.eax = (((((R.ecx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8e83e4: movsx eax, cx
        R.edx = (R.sub((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8e83e7: sub edx, eax
        R.sub((R.edx >>> 0), 0x2, 32); // 8e83e9: cmp edx, 2
        if (R.cLE) { pc = 0x8e840b; continue; } // 8e83ec: jle 0x8e840b
        pc = 0x8e83ee; continue;
      case 0x8e83ee:
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 8e83ee: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 0.8; // 8e83f2: fmul qword ptr [0x9689b0]
        R.ftol(); // 8e83f8: call 0x945640
        R.m.w32(((R.edi + 0x1b) | 0) >>> 0, (R.eax >>> 0)); // 8e83fd: mov dword ptr [edi + 0x1b], eax
        R.m.w8(((R.edi + 0x3f) | 0) >>> 0, 0x14); // 8e8400: mov byte ptr [edi + 0x3f], 0x14
        R.edi = (R.pop()) | 0; // 8e8404: pop edi
        R.esi = (R.pop()) | 0; // 8e8405: pop esi
        R.ebp = (R.pop()) | 0; // 8e8406: pop ebp
        R.ebx = (R.pop()) | 0; // 8e8407: pop ebx
        return R.ret(3); // 8e8408: ret 0xc
      case 0x8e840b:
        R.eax = (R.m.u32(((R.esi + 0x1a) | 0) >>> 0)) | 0; // 8e840b: mov eax, dword ptr [esi + 0x1a]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e840e: test eax, eax
        if (R.zf) { pc = 0x8e844d; continue; } // 8e8410: je 0x8e844d
        pc = 0x8e8412; continue;
      case 0x8e8412:
        R.sub(R.m.u16(((R.eax + 0x8e) | 0) >>> 0), 0x1388, 16); // 8e8412: cmp word ptr [eax + 0x8e], 0x1388
        if (R.cLE) { pc = 0x8e844d; continue; } // 8e841b: jle 0x8e844d
        pc = 0x8e841d; continue;
      case 0x8e841d:
        R.eax = (R.m.u32(((R.esi + 0x61) | 0) >>> 0)) | 0; // 8e841d: mov eax, dword ptr [esi + 0x61]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e8420: test eax, eax
        if (R.zf) { pc = 0x8e844d; continue; } // 8e8422: je 0x8e844d
        pc = 0x8e8424; continue;
      case 0x8e8424:
        R.sub(R.m.u16(((R.eax + 0xb) | 0) >>> 0), 0x109a, 16); // 8e8424: cmp word ptr [eax + 0xb], 0x109a
        if (R.cLE) { pc = 0x8e844d; continue; } // 8e842a: jle 0x8e844d
        pc = 0x8e842c; continue;
      case 0x8e842c:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x22) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e842c: mov al, byte ptr [esi + 0x22]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 8e842f: test al, al
        if (!R.zf) { pc = 0x8e844d; continue; } // 8e8431: jne 0x8e844d
        pc = 0x8e8433; continue;
      case 0x8e8433:
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 8e8433: fild dword ptr [esp + 0x1c]
        R.fpush(R.st[0]); // 8e8437: fld st(0)
        R.st[0] = R.st[0] * 0.3; // 8e8439: fmul qword ptr [0x968e80]
        R.ftol(); // 8e843f: call 0x945640
        R.m.w32(((R.edi + 0x3a) | 0) >>> 0, (R.eax >>> 0)); // 8e8444: mov dword ptr [edi + 0x3a], eax
        R.m.w8(((R.edi + 0x3e) | 0) >>> 0, 0xa); // 8e8447: mov byte ptr [edi + 0x3e], 0xa
        pc = 0x8e8487; continue; // 8e844b: jmp 0x8e8487
      case 0x8e844d:
        R.edx = (R.m.u32(((R.esi + 0x61) | 0) >>> 0)) | 0; // 8e844d: mov edx, dword ptr [esi + 0x61]
        R.eax = (0x10624dd3) | 0; // 8e8450: mov eax, 0x10624dd3
        R.ecx = (((((R.ecx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8e8455: movsx ecx, cx
        R.edx = (((R.m.u16(((R.edx + 0xb) | 0) >>> 0)) << 16 >> 16)) | 0; // 8e8458: movsx edx, word ptr [edx + 0xb]
        { const p = BigInt(R.eax | 0) * BigInt((((R.edx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 8e845c: imul edx
        R.edx = (R.sar((R.edx >>> 0), 0x5, 32)) | 0; // 8e845e: sar edx, 5
        R.eax = ((R.edx >>> 0)) | 0; // 8e8461: mov eax, edx
        R.eax = (R.shr((R.eax >>> 0), 0x1f, 32)) | 0; // 8e8463: shr eax, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8e8466: add edx, eax
        R.edx = (R.sub((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 8e8468: sub edx, ecx
        R.sub((R.edx >>> 0), 0xfffffffd, 32); // 8e846a: cmp edx, -3
        if (!R.cL) { pc = 0x8e8495; continue; } // 8e846d: jge 0x8e8495
        pc = 0x8e846f; continue;
      case 0x8e846f:
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 8e846f: fild dword ptr [esp + 0x1c]
        R.fpush(R.st[0]); // 8e8473: fld st(0)
        R.st[0] = R.st[0] * 0.3; // 8e8475: fmul qword ptr [0x968e80]
        R.ftol(); // 8e847b: call 0x945640
        R.m.w32(((R.edi + 0x35) | 0) >>> 0, (R.eax >>> 0)); // 8e8480: mov dword ptr [edi + 0x35], eax
        R.m.w8(((R.edi + 0x39) | 0) >>> 0, 0x14); // 8e8483: mov byte ptr [edi + 0x39], 0x14
        pc = 0x8e8487; continue;
      case 0x8e8487:
        R.st[0] = R.st[0] * 0.8; // 8e8487: fmul qword ptr [0x9689b0]
        R.ftol(); // 8e848d: call 0x945640
        R.m.w32(((R.edi + 0x1b) | 0) >>> 0, (R.eax >>> 0)); // 8e8492: mov dword ptr [edi + 0x1b], eax
        pc = 0x8e8495; continue;
      case 0x8e8495:
        R.edi = (R.pop()) | 0; // 8e8495: pop edi
        R.esi = (R.pop()) | 0; // 8e8496: pop esi
        R.ebp = (R.pop()) | 0; // 8e8497: pop ebp
        R.ebx = (R.pop()) | 0; // 8e8498: pop ebx
        return R.ret(3); // 8e8499: ret 0xc
      default: throw new Error(`f_8e8330: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
