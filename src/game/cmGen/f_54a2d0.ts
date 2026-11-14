// 0x54a2d0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 417c10=2tc, 54c8e0=2tc
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_54a2d0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x54a2d0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x54a2d0:
        R.eax = (0) | 0; // 54a2d0: mov eax, dword ptr fs:[0]
        R.push(0xffffffff); // 54a2d6: push -1
        R.push(0x957a40); // 54a2d8: push 0x957a40
        R.push((R.eax >>> 0)); // 54a2dd: push eax
        /* fs */ // 54a2de: mov dword ptr fs:[0], esp
        R.esp = (R.sub((R.esp >>> 0), 0x20, 32)) | 0; // 54a2e5: sub esp, 0x20
        R.eax = (0x51eb851f) | 0; // 54a2e8: mov eax, 0x51eb851f
        R.push((R.esi >>> 0)); // 54a2ed: push esi
        R.push((R.edi >>> 0)); // 54a2ee: push edi
        R.edi = (R.logic((R.edi >>> 0) ^ (R.edi >>> 0), 32)) | 0; // 54a2ef: xor edi, edi
        R.edi = ((R.edi & 0xffff0000) | (((R.m.u16(((R.ecx + 0x2) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 54a2f1: mov di, word ptr [ecx + 2]
        R.edi = (R.sub((R.edi >>> 0), 0x640, 32)) | 0; // 54a2f5: sub edi, 0x640
        { const p = BigInt(R.eax | 0) * BigInt((((R.edi >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 54a2fb: imul edi
        R.esi = ((R.edx >>> 0)) | 0; // 54a2fd: mov esi, edx
        R.edx = (((R.edi + R.edi * 8) | 0)) | 0; // 54a2ff: lea edx, [edi + edi*8]
        R.esi = (R.sar((R.esi >>> 0), 0x7, 32)) | 0; // 54a302: sar esi, 7
        R.eax = ((R.esi >>> 0)) | 0; // 54a305: mov eax, esi
        R.eax = (R.shr((R.eax >>> 0), 0x1f, 32)) | 0; // 54a307: shr eax, 0x1f
        R.esi = (R.add((R.esi >>> 0), (R.eax >>> 0), 32)) | 0; // 54a30a: add esi, eax
        R.eax = (((R.edi + R.edx * 8) | 0)) | 0; // 54a30c: lea eax, [edi + edx*8]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 54a30f: lea eax, [eax + eax*4]
        R.esi = (R.add((R.esi >>> 0), (R.eax >>> 0), 32)) | 0; // 54a312: add esi, eax
        R.eax = (0x51eb851f) | 0; // 54a314: mov eax, 0x51eb851f
        { const p = BigInt(R.eax | 0) * BigInt((((R.edi >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 54a319: imul edi
        R.edx = (R.sar((R.edx >>> 0), 0x5, 32)) | 0; // 54a31b: sar edx, 5
        R.eax = ((R.edx >>> 0)) | 0; // 54a31e: mov eax, edx
        R.eax = (R.shr((R.eax >>> 0), 0x1f, 32)) | 0; // 54a320: shr eax, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 54a323: add edx, eax
        R.eax = ((R.edi >>> 0)) | 0; // 54a325: mov eax, edi
        R.esi = (R.sub((R.esi >>> 0), (R.edx >>> 0), 32)) | 0; // 54a327: sub esi, edx
        R.edx = R.eax < 0 ? -1 : 0; // 54a329: cdq 
        R.edx = (R.logic((R.edx >>> 0) & 0x3, 32)) | 0; // 54a32a: and edx, 3
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 54a32d: add eax, edx
        R.edx = (((R.m.u16(((R.ecx) | 0) >>> 0)) << 16 >> 16)) | 0; // 54a32f: movsx edx, word ptr [ecx]
        R.eax = (R.sar((R.eax >>> 0), 0x2, 32)) | 0; // 54a332: sar eax, 2
        R.esi = (R.add((R.esi >>> 0), (R.eax >>> 0), 32)) | 0; // 54a335: add esi, eax
        R.esi = (R.add((R.esi >>> 0), (R.edx >>> 0), 32)) | 0; // 54a337: add esi, edx
        R.edx = (R.m.u32(((R.ecx + 0x4) | 0) >>> 0)) | 0; // 54a339: mov edx, dword ptr [ecx + 4]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 54a33c: test edx, edx
        R.eax = ((R.esi >>> 0)) | 0; // 54a33e: mov eax, esi
        if (R.zf) { pc = 0x54a343; continue; } // 54a340: je 0x54a343
        pc = 0x54a342; continue;
      case 0x54a342:
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 54a342: dec eax
        pc = 0x54a343; continue;
      case 0x54a343:
        R.edx = R.eax < 0 ? -1 : 0; // 54a343: cdq 
        R.esi = (0x7) | 0; // 54a344: mov esi, 7
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.esi >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 54a349: idiv esi
        R.esi = ((R.edx >>> 0)) | 0; // 54a34b: mov esi, edx
        R.logic(((R.esi >>> 0) & 0xffff) & ((R.esi >>> 0) & 0xffff), 16); // 54a34d: test si, si
        if (R.cLE) { pc = 0x54a355; continue; } // 54a350: jle 0x54a355
        pc = 0x54a352; continue;
      case 0x54a352:
        R.esi = (R.incdec((R.esi >>> 0), -1, 32)) | 0; // 54a352: dec esi
        pc = 0x54a35c; continue; // 54a353: jmp 0x54a35c
      case 0x54a355:
        if (!R.zf) { pc = 0x54a35c; continue; } // 54a355: jne 0x54a35c
        pc = 0x54a357; continue;
      case 0x54a357:
        R.esi = (0x6) | 0; // 54a357: mov esi, 6
        pc = 0x54a35c; continue;
      case 0x54a35c:
        R.edi = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 54a35c: mov edi, dword ptr [esp + 0x3c]
        R.eax = (((R.esp + 0x8) | 0)) | 0; // 54a360: lea eax, [esp + 8]
        R.push((R.ecx >>> 0)); // 54a364: push ecx
        R.push((R.eax >>> 0)); // 54a365: push eax
        R.ecx = ((R.edi >>> 0)) | 0; // 54a366: mov ecx, edi
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 54a368: call 0x417c10
        R.eax = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 54a36d: mov eax, dword ptr [esp + 0x38]
        R.sub(((R.esi >>> 0) & 0xffff), ((R.eax >>> 0) & 0xffff), 16); // 54a371: cmp si, ax
        if (R.zf) { pc = 0x54a3ce; continue; } // 54a374: je 0x54a3ce
        pc = 0x54a376; continue;
      case 0x54a376:
        R.esi = (R.sub((R.esi >>> 0), (R.eax >>> 0), 32)) | 0; // 54a376: sub esi, eax
        R.logic(((R.esi >>> 0) & 0xffff) & ((R.esi >>> 0) & 0xffff), 16); // 54a378: test si, si
        if (!R.cL) { pc = 0x54a3a3; continue; } // 54a37b: jge 0x54a3a3
        pc = 0x54a37d; continue;
      case 0x54a37d:
        R.sub(((R.esi >>> 0) & 0xffff), 0xfffd, 16); // 54a37d: cmp si, -3
        if (!R.cL) { pc = 0x54a386; continue; } // 54a381: jge 0x54a386
        pc = 0x54a383; continue;
      case 0x54a383:
        R.esi = (R.add((R.esi >>> 0), 0x7, 32)) | 0; // 54a383: add esi, 7
        pc = 0x54a386; continue;
      case 0x54a386:
        R.ecx = (((R.esp + 0x8) | 0)) | 0; // 54a386: lea ecx, [esp + 8]
        R.push((R.esi >>> 0)); // 54a38a: push esi
        R.push((R.ecx >>> 0)); // 54a38b: push ecx
        R.ecx = ((R.edi >>> 0)) | 0; // 54a38c: mov ecx, edi
        R.call(0x54c8e0, { n: 2, thisEcx: true, calleeClean: true }); // 54a38e: call 0x54c8e0
        R.edx = (((R.esp + 0x10) | 0)) | 0; // 54a393: lea edx, [esp + 0x10]
        R.push((R.eax >>> 0)); // 54a397: push eax
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, 0x0); // 54a398: mov dword ptr [esp + 0x34], 0
        R.push((R.edx >>> 0)); // 54a3a0: push edx
        pc = 0x54a3c7; continue; // 54a3a1: jmp 0x54a3c7
      case 0x54a3a3:
        R.sub(((R.esi >>> 0) & 0xffff), 0x3, 16); // 54a3a3: cmp si, 3
        if (R.cLE) { pc = 0x54a3ac; continue; } // 54a3a7: jle 0x54a3ac
        pc = 0x54a3a9; continue;
      case 0x54a3a9:
        R.esi = (R.sub((R.esi >>> 0), 0x7, 32)) | 0; // 54a3a9: sub esi, 7
        pc = 0x54a3ac; continue;
      case 0x54a3ac:
        R.eax = (((R.esp + 0x18) | 0)) | 0; // 54a3ac: lea eax, [esp + 0x18]
        R.push((R.esi >>> 0)); // 54a3b0: push esi
        R.push((R.eax >>> 0)); // 54a3b1: push eax
        R.ecx = ((R.edi >>> 0)) | 0; // 54a3b2: mov ecx, edi
        R.call(0x54c8e0, { n: 2, thisEcx: true, calleeClean: true }); // 54a3b4: call 0x54c8e0
        R.ecx = (((R.esp + 0x20) | 0)) | 0; // 54a3b9: lea ecx, [esp + 0x20]
        R.push((R.eax >>> 0)); // 54a3bd: push eax
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, 0x1); // 54a3be: mov dword ptr [esp + 0x34], 1
        R.push((R.ecx >>> 0)); // 54a3c6: push ecx
        pc = 0x54a3c7; continue;
      case 0x54a3c7:
        R.ecx = ((R.edi >>> 0)) | 0; // 54a3c7: mov ecx, edi
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 54a3c9: call 0x417c10
        pc = 0x54a3ce; continue;
      case 0x54a3ce:
        R.ecx = (R.m.u32(((R.esp + 0x28) | 0) >>> 0)) | 0; // 54a3ce: mov ecx, dword ptr [esp + 0x28]
        R.edi = (R.pop()) | 0; // 54a3d2: pop edi
        R.esi = (R.pop()) | 0; // 54a3d3: pop esi
        /* fs */ // 54a3d4: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x2c, 32)) | 0; // 54a3db: add esp, 0x2c
        return R.ret(2); // 54a3de: ret 8
      default: throw new Error(`f_54a2d0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
