// 0x84b6f0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 867d30=0t, 868210=3tc, 8d0780=3c, 8d0a70=1c
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';
import { ROT } from './x86';

const RO_84b8a0_1u = [0x0, 0x1, 0x1, 0x2, 0x2, 0x3, 0x3, 0x4, 0x4, 0x5, 0x5, 0x5, 0x5, 0x5, 0x5, 0x90, 0x8b, 0x44, 0x24, 0x4, 0x81, 0xec, 0xf4, 0x1, 0x0, 0x0, 0x85, 0xc0, 0x75, 0x7, 0x81, 0xc4, 0xf4, 0x1, 0x0, 0x0, 0xc3, 0x53, 0x56, 0x6a, 0x1, 0x8d, 0x4c, 0x24, 0xc, 0x68, 0xf4, 0x1, 0x0, 0x0, 0x51, 0x50, 0xe8, 0xc7, 0x22, 0xcf, 0xff, 0x8b, 0xb4, 0x24, 0x14, 0x2, 0x0, 0x0, 0x83, 0xc4, 0x10, 0x8d, 0x44, 0x24, 0x8, 0x8a, 0x10, 0x8a, 0x1e, 0x8a, 0xca, 0x3a, 0xd3, 0x75, 0x2e, 0x84, 0xc9, 0x74, 0x16, 0x8a, 0x50, 0x1, 0x8a, 0x5e, 0x1, 0x8a, 0xca, 0x3a, 0xd3, 0x75, 0x1e, 0x83, 0xc0, 0x2, 0x83, 0xc6, 0x2, 0x84, 0xc9, 0x75, 0xdc, 0x33, 0xc0, 0x33, 0xc9, 0x85, 0xc0, 0xf, 0x94, 0xc1, 0x5e, 0x8b, 0xc1, 0x5b, 0x81, 0xc4, 0xf4, 0x1, 0x0, 0x0, 0xc3, 0x1b, 0xc0, 0x5e, 0x83, 0xd8, 0xff, 0x33, 0xc9, 0x85, 0xc0, 0xf, 0x94, 0xc1, 0x8b, 0xc1, 0x5b, 0x81, 0xc4, 0xf4, 0x1, 0x0, 0x0, 0xc3, 0x90, 0x90, 0x90, 0x90, 0x90, 0x90, 0x90, 0x90, 0x90, 0x90, 0x81, 0xec, 0xfc, 0x4, 0x0, 0x0, 0xa1, 0x18, 0x71, 0xdd, 0x0, 0x53, 0x55, 0x56, 0x57, 0x8b, 0xe9, 0x33, 0xff, 0x89, 0x6c, 0x24, 0x14, 0x85, 0xc0, 0x89, 0x7c, 0x24, 0x1c, 0xf, 0x85, 0xec, 0x0, 0x0, 0x0, 0x8d, 0x84, 0x24, 0x2c, 0x2, 0x0, 0x0, 0x50, 0x68, 0xc8, 0x0, 0x0, 0x0, 0xff, 0x15, 0xf8, 0x70, 0x96, 0x0, 0x85, 0xc0, 0xf, 0x84, 0x91, 0x0, 0x0, 0x0, 0x8a, 0x84, 0x24, 0x2c, 0x2, 0x0, 0x0, 0x32, 0xdb, 0x84, 0xc0, 0xf, 0x84, 0x80, 0x0, 0x0, 0x0, 0x8d, 0xb4, 0x24, 0x2c, 0x2, 0x0, 0x0, 0x56, 0xff, 0x15, 0x0, 0x71, 0x96, 0x0, 0x83, 0xf8, 0x5];

export function f_84b6f0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x84b6f0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x84b6f0:
        R.push((R.ebx >>> 0)); // 84b6f0: push ebx
        R.ebx = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 84b6f1: mov ebx, dword ptr [esp + 0x14]
        R.push((R.ebp >>> 0)); // 84b6f5: push ebp
        R.push((R.esi >>> 0)); // 84b6f6: push esi
        R.esi = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 84b6f7: mov esi, dword ptr [esp + 0x14]
        R.push((R.edi >>> 0)); // 84b6fb: push edi
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 84b6fc: test esi, esi
        R.m.w32(((R.ebx) | 0) >>> 0, 0x0); // 84b6fe: mov dword ptr [ebx], 0
        if (R.zf) { pc = 0x84b87a; continue; } // 84b704: je 0x84b87a
        pc = 0x84b70a; continue;
      case 0x84b70a:
        R.ebp = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 84b70a: mov ebp, dword ptr [esp + 0x14]
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 84b70e: test ebp, ebp
        if (R.zf) { pc = 0x84b87a; continue; } // 84b710: je 0x84b87a
        pc = 0x84b716; continue;
      case 0x84b716:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x49) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84b716: mov al, byte ptr [esi + 0x49]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 84b719: test al, al
        if (!R.zf) { pc = 0x84b87a; continue; } // 84b71b: jne 0x84b87a
        pc = 0x84b721; continue;
      case 0x84b721:
        R.edi = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 84b721: mov edi, dword ptr [esp + 0x1c]
        R.push(0x0); // 84b725: push 0
        R.push(0x0); // 84b727: push 0
        R.push((R.edi >>> 0)); // 84b729: push edi
        R.ecx = ((R.esi >>> 0)) | 0; // 84b72a: mov ecx, esi
        R.call(0x868210, { n: 3, thisEcx: true, calleeClean: true }); // 84b72c: call 0x868210
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84b731: test eax, eax
        if (!R.zf) { pc = 0x84b77d; continue; } // 84b733: jne 0x84b77d
        pc = 0x84b735; continue;
      case 0x84b735:
        R.push((R.eax >>> 0)); // 84b735: push eax
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 84b736: mov eax, dword ptr [esi]
        R.push((R.edi >>> 0)); // 84b738: push edi
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 84b739: lea ecx, [eax + eax*4]
        R.eax = (((R.eax + R.ecx * 2) | 0)) | 0; // 84b73c: lea eax, [eax + ecx*2]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 84b73f: lea edx, [eax + eax*4]
        R.eax = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 84b742: mov eax, dword ptr [0xae23bc]
        R.ecx = (((R.eax + R.edx * 2) | 0)) | 0; // 84b747: lea ecx, [eax + edx*2]
        R.push((R.ecx >>> 0)); // 84b74a: push ecx
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 84b74b: mov ecx, dword ptr [0xde1f54]
        R.call(0x8d0780, { n: 3, thisEcx: false, calleeClean: true }); // 84b751: call 0x8d0780
        R.m.w32(((R.ebx) | 0) >>> 0, (R.eax >>> 0)); // 84b756: mov dword ptr [ebx], eax
        R.esi = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 84b758: mov esi, dword ptr [esi]
        R.edx = (((R.esi + R.esi * 4) | 0)) | 0; // 84b75a: lea edx, [esi + esi*4]
        R.ecx = (((R.esi + R.edx * 2) | 0)) | 0; // 84b75d: lea ecx, [esi + edx*2]
        R.esi = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 84b760: mov esi, dword ptr [0xae23bc]
        R.edx = (R.logic((R.edx >>> 0) ^ (R.edx >>> 0), 32)) | 0; // 84b766: xor edx, edx
        R.ecx = (((R.ecx + R.ecx * 4) | 0)) | 0; // 84b768: lea ecx, [ecx + ecx*4]
        R.edi = (R.m.u32(((R.esi + R.ecx * 2 + 0x52) | 0) >>> 0)) | 0; // 84b76b: mov edi, dword ptr [esi + ecx*2 + 0x52]
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 84b76f: cmp eax, edi
        R.edi = (R.pop()) | 0; // 84b771: pop edi
        R.edx = ((R.edx & 0xffffff00) | (((R.cL ? 1 : 0) & 0xff) << 0)) | 0; // 84b772: setl dl
        R.esi = (R.pop()) | 0; // 84b775: pop esi
        R.ebp = (R.pop()) | 0; // 84b776: pop ebp
        R.eax = ((R.edx >>> 0)) | 0; // 84b777: mov eax, edx
        R.ebx = (R.pop()) | 0; // 84b779: pop ebx
        return R.ret(4); // 84b77a: ret 0x10
      case 0x84b77d:
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 84b77d: mov eax, dword ptr [esi]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 84b77f: lea ecx, [eax + eax*4]
        R.eax = (((R.eax + R.ecx * 2) | 0)) | 0; // 84b782: lea eax, [eax + ecx*2]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 84b785: lea edx, [eax + eax*4]
        R.eax = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 84b788: mov eax, dword ptr [0xae23bc]
        R.ecx = (((R.eax + R.edx * 2) | 0)) | 0; // 84b78d: lea ecx, [eax + edx*2]
        R.push((R.ecx >>> 0)); // 84b790: push ecx
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 84b791: mov ecx, dword ptr [0xde1f54]
        R.call(0x8d0a70, { n: 1, thisEcx: false, calleeClean: true }); // 84b797: call 0x8d0a70
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84b79c: test eax, eax
        if (R.zf) { pc = 0x84b871; continue; } // 84b79e: je 0x84b871
        pc = 0x84b7a4; continue;
      case 0x84b7a4:
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 84b7a4: mov eax, dword ptr [esi]
        R.ecx = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 84b7a6: mov ecx, dword ptr [0xae23bc]
        R.push(0x1); // 84b7ac: push 1
        R.push((R.edi >>> 0)); // 84b7ae: push edi
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 84b7af: lea edx, [eax + eax*4]
        R.eax = (((R.eax + R.edx * 2) | 0)) | 0; // 84b7b2: lea eax, [eax + edx*2]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 84b7b5: lea eax, [eax + eax*4]
        R.edx = (((R.ecx + R.eax * 2) | 0)) | 0; // 84b7b8: lea edx, [ecx + eax*2]
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 84b7bb: mov ecx, dword ptr [0xde1f54]
        R.push((R.edx >>> 0)); // 84b7c1: push edx
        R.call(0x8d0780, { n: 3, thisEcx: false, calleeClean: true }); // 84b7c2: call 0x8d0780
        R.m.w32(((R.ebx) | 0) >>> 0, (R.eax >>> 0)); // 84b7c7: mov dword ptr [ebx], eax
        R.ecx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 84b7c9: mov ecx, dword ptr [esi]
        R.edx = (((R.ecx + R.ecx * 4) | 0)) | 0; // 84b7cb: lea edx, [ecx + ecx*4]
        R.ecx = (((R.ecx + R.edx * 2) | 0)) | 0; // 84b7ce: lea ecx, [ecx + edx*2]
        R.edx = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 84b7d1: mov edx, dword ptr [0xae23bc]
        R.ecx = (((R.ecx + R.ecx * 4) | 0)) | 0; // 84b7d7: lea ecx, [ecx + ecx*4]
        R.sub((R.eax >>> 0), R.m.u32(((R.edx + R.ecx * 2 + 0x52) | 0) >>> 0), 32); // 84b7da: cmp eax, dword ptr [edx + ecx*2 + 0x52]
        if (!R.cLE) { pc = 0x84b871; continue; } // 84b7de: jg 0x84b871
        pc = 0x84b7e4; continue;
      case 0x84b7e4:
        R.ecx = ((R.esi >>> 0)) | 0; // 84b7e4: mov ecx, esi
        R.call(0x867d30, { n: 0, thisEcx: true, calleeClean: false }); // 84b7e6: call 0x867d30
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 84b7eb: movsx eax, al
        R.sub((R.eax >>> 0), 0xe, 32); // 84b7ee: cmp eax, 0xe
        if (!R.cBE) { pc = 0x84b871; continue; } // 84b7f1: ja 0x84b871
        pc = 0x84b7f3; continue;
      case 0x84b7f3:
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 84b7f3: xor ecx, ecx
        R.ecx = ((R.ecx & 0xffffff00) | (((ROT(RO_84b8a0_1u, 0x84b8a0, 1, ((R.eax + 0x84b8a0) | 0))) & 0xff) << 0)) | 0; // 84b7f5: mov cl, byte ptr [eax + 0x84b8a0]
        pc = [0x84b871, 0x84b802, 0x84b820, 0x84b83e, 0x84b85c, 0x84b87a][R.ecx >>> 0]; continue; // 84b7fb: jmp dword ptr [ecx*4 + 0x84b888]
      case 0x84b802:
        R.fpush(R.m.s32(((R.ebp + 0xb) | 0) >>> 0)); // 84b802: fild dword ptr [ebp + 0xb]
        R.fpush(R.m.s32(((R.ebp + 0x3) | 0) >>> 0)); // 84b805: fild dword ptr [ebp + 3]
        R.st[0] = R.st[0] * 0.5; // 84b808: fmul qword ptr [0x968968]
        R.fcom(R.st[0], R.st[1]); R.fpop(); R.fpop(); // 84b80e: fcompp 
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84b810: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 84b812: test ah, 0x41
        if (R.zf) { pc = 0x84b87a; continue; } // 84b815: je 0x84b87a
        pc = 0x84b817; continue;
      case 0x84b817:
        R.edi = (R.pop()) | 0; // 84b817: pop edi
        R.esi = (R.pop()) | 0; // 84b818: pop esi
        R.ebp = (R.pop()) | 0; // 84b819: pop ebp
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 84b81a: xor eax, eax
        R.ebx = (R.pop()) | 0; // 84b81c: pop ebx
        return R.ret(4); // 84b81d: ret 0x10
      case 0x84b820:
        R.fpush(R.m.s32(((R.ebp + 0xb) | 0) >>> 0)); // 84b820: fild dword ptr [ebp + 0xb]
        R.fpush(R.m.s32(((R.ebp + 0x3) | 0) >>> 0)); // 84b823: fild dword ptr [ebp + 3]
        R.st[0] = R.st[0] * 0.65; // 84b826: fmul qword ptr [0x96a5d0]
        R.fcom(R.st[0], R.st[1]); R.fpop(); R.fpop(); // 84b82c: fcompp 
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84b82e: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 84b830: test ah, 0x41
        if (R.zf) { pc = 0x84b87a; continue; } // 84b833: je 0x84b87a
        pc = 0x84b835; continue;
      case 0x84b835:
        R.edi = (R.pop()) | 0; // 84b835: pop edi
        R.esi = (R.pop()) | 0; // 84b836: pop esi
        R.ebp = (R.pop()) | 0; // 84b837: pop ebp
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 84b838: xor eax, eax
        R.ebx = (R.pop()) | 0; // 84b83a: pop ebx
        return R.ret(4); // 84b83b: ret 0x10
      case 0x84b83e:
        R.fpush(R.m.s32(((R.ebp + 0xb) | 0) >>> 0)); // 84b83e: fild dword ptr [ebp + 0xb]
        R.fpush(R.m.s32(((R.ebp + 0x3) | 0) >>> 0)); // 84b841: fild dword ptr [ebp + 3]
        R.st[0] = R.st[0] * 0.8; // 84b844: fmul qword ptr [0x9689b0]
        R.fcom(R.st[0], R.st[1]); R.fpop(); R.fpop(); // 84b84a: fcompp 
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84b84c: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 84b84e: test ah, 0x41
        if (R.zf) { pc = 0x84b87a; continue; } // 84b851: je 0x84b87a
        pc = 0x84b853; continue;
      case 0x84b853:
        R.edi = (R.pop()) | 0; // 84b853: pop edi
        R.esi = (R.pop()) | 0; // 84b854: pop esi
        R.ebp = (R.pop()) | 0; // 84b855: pop ebp
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 84b856: xor eax, eax
        R.ebx = (R.pop()) | 0; // 84b858: pop ebx
        return R.ret(4); // 84b859: ret 0x10
      case 0x84b85c:
        R.fpush(R.m.s32(((R.ebp + 0xb) | 0) >>> 0)); // 84b85c: fild dword ptr [ebp + 0xb]
        R.fpush(R.m.s32(((R.ebp + 0x3) | 0) >>> 0)); // 84b85f: fild dword ptr [ebp + 3]
        R.st[0] = R.st[0] * 0.9; // 84b862: fmul qword ptr [0x9689d8]
        R.fcom(R.st[0], R.st[1]); R.fpop(); R.fpop(); // 84b868: fcompp 
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84b86a: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 84b86c: test ah, 0x41
        if (R.zf) { pc = 0x84b87a; continue; } // 84b86f: je 0x84b87a
        pc = 0x84b871; continue;
      case 0x84b871:
        R.edi = (R.pop()) | 0; // 84b871: pop edi
        R.esi = (R.pop()) | 0; // 84b872: pop esi
        R.ebp = (R.pop()) | 0; // 84b873: pop ebp
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 84b874: xor eax, eax
        R.ebx = (R.pop()) | 0; // 84b876: pop ebx
        return R.ret(4); // 84b877: ret 0x10
      case 0x84b87a:
        R.edi = (R.pop()) | 0; // 84b87a: pop edi
        R.esi = (R.pop()) | 0; // 84b87b: pop esi
        R.ebp = (R.pop()) | 0; // 84b87c: pop ebp
        R.eax = (0x1) | 0; // 84b87d: mov eax, 1
        R.ebx = (R.pop()) | 0; // 84b882: pop ebx
        return R.ret(4); // 84b883: ret 0x10
      default: throw new Error(`f_84b6f0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
