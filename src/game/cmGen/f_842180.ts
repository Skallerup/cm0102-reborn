// 0x842180 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 600c90=3, 68d080=0t, 68d0d0=2tc, 7f7490=2tc, 946464=5
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_842180(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x842180;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x842180:
        R.esp = (R.sub((R.esp >>> 0), 0x14, 32)) | 0; // 842180: sub esp, 0x14
        R.push((R.ebx >>> 0)); // 842183: push ebx
        R.push((R.ebp >>> 0)); // 842184: push ebp
        R.ebp = ((R.ecx >>> 0)) | 0; // 842185: mov ebp, ecx
        R.push((R.esi >>> 0)); // 842187: push esi
        R.ecx = (R.m.u32(((R.esp + 0x28) | 0) >>> 0)) | 0; // 842188: mov ecx, dword ptr [esp + 0x28]
        R.push((R.edi >>> 0)); // 84218c: push edi
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 84218d: test ecx, ecx
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ebp >>> 0)); // 84218f: mov dword ptr [esp + 0x10], ebp
        if (R.zf) { pc = 0x84219a; continue; } // 842193: je 0x84219a
        pc = 0x842195; continue;
      case 0x842195:
        R.call(0x68d080, { n: 0, thisEcx: true, calleeClean: false }); // 842195: call 0x68d080
        pc = 0x84219a; continue;
      case 0x84219a:
        R.edi = (R.m.u32(((R.esp + 0x28) | 0) >>> 0)) | 0; // 84219a: mov edi, dword ptr [esp + 0x28]
        R.ebx = (R.logic((R.ebx >>> 0) ^ (R.ebx >>> 0), 32)) | 0; // 84219e: xor ebx, ebx
        pc = 0x8421a0; continue;
      case 0x8421a0:
        R.sub(R.m.u8(((R.esp + 0x34) | 0) >>> 0), 0x3, 8); // 8421a0: cmp byte ptr [esp + 0x34], 3
        if (R.zf) { pc = 0x842226; continue; } // 8421a5: je 0x842226
        pc = 0x8421a7; continue;
      case 0x8421a7:
        R.eax = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 8421a7: mov eax, dword ptr [0xae2364]
        R.ecx = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8421ac: movsx ecx, bx
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 8421af: sub eax, ecx
        R.ecx = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 8421b1: mov ecx, dword ptr [0xae23bc]
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 8421b7: dec eax
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 8421b8: lea edx, [eax + eax*4]
        R.eax = (((R.eax + R.edx * 2) | 0)) | 0; // 8421bb: lea eax, [eax + edx*2]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 8421be: lea eax, [eax + eax*4]
        R.esi = (((R.ecx + R.eax * 2) | 0)) | 0; // 8421c1: lea esi, [ecx + eax*2]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + R.eax * 2 + 0x5f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8421c4: mov al, byte ptr [ecx + eax*2 + 0x5f]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 8421c8: test al, al
        if (R.zf) { pc = 0x84221b; continue; } // 8421ca: je 0x84221b
        pc = 0x8421cc; continue;
      case 0x8421cc:
        R.eax = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 8421cc: mov eax, dword ptr [esi + 0x39]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8421cf: test eax, eax
        if (R.zf) { pc = 0x84221b; continue; } // 8421d1: je 0x84221b
        pc = 0x8421d3; continue;
      case 0x8421d3:
        R.push(0x1); // 8421d3: push 1
        R.push(0x0); // 8421d5: push 0
        R.push((R.eax >>> 0)); // 8421d7: push eax
        R.call(0x600c90, { n: 3, thisEcx: false, calleeClean: false }); // 8421d8: call 0x600c90
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 8421dd: add esp, 0xc
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8421e0: test eax, eax
        if (R.zf) { pc = 0x8421eb; continue; } // 8421e2: je 0x8421eb
        pc = 0x8421e4; continue;
      case 0x8421e4:
        R.sub(R.m.u8(((R.esp + 0x34) | 0) >>> 0), 0x2, 8); // 8421e4: cmp byte ptr [esp + 0x34], 2
        if (R.zf) { pc = 0x84221b; continue; } // 8421e9: je 0x84221b
        pc = 0x8421eb; continue;
      case 0x8421eb:
        R.ecx = (R.m.u32(((0xb74448) | 0) >>> 0)) | 0; // 8421eb: mov ecx, dword ptr [0xb74448]
        R.push((R.esi >>> 0)); // 8421f1: push esi
        R.push((R.edi >>> 0)); // 8421f2: push edi
        R.call(0x7f7490, { n: 2, thisEcx: true, calleeClean: true }); // 8421f3: call 0x7f7490
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8421f8: test eax, eax
        if (R.zf) { pc = 0x84221b; continue; } // 8421fa: je 0x84221b
        pc = 0x8421fc; continue;
      case 0x8421fc:
        R.edx = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 8421fc: mov edx, dword ptr [edi]
        R.push(0x8); // 8421fe: push 8
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.edx >>> 0)); // 842200: mov dword ptr [esp + 0x18], edx
        R.eax = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 842204: mov eax, dword ptr [esi + 0x39]
        R.edx = (((R.esp + 0x18) | 0)) | 0; // 842207: lea edx, [esp + 0x18]
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 84220b: mov ecx, dword ptr [eax]
        R.push((R.edx >>> 0)); // 84220d: push edx
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.ecx >>> 0)); // 84220e: mov dword ptr [esp + 0x20], ecx
        R.ecx = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 842212: mov ecx, dword ptr [esp + 0x34]
        R.call(0x68d0d0, { n: 2, thisEcx: true, calleeClean: true }); // 842216: call 0x68d0d0
        pc = 0x84221b; continue;
      case 0x84221b:
        R.ebx = (R.incdec((R.ebx >>> 0), 1, 32)) | 0; // 84221b: inc ebx
        R.sub(((R.ebx >>> 0) & 0xffff), 0x10, 16); // 84221c: cmp bx, 0x10
        if (R.cL) { pc = 0x8421a0; continue; } // 842220: jl 0x8421a0
        pc = 0x842226; continue;
      case 0x842226:
        R.eax = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 842226: mov eax, dword ptr [esp + 0x38]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84222a: test eax, eax
        if (!R.zf) { pc = 0x842313; continue; } // 84222c: jne 0x842313
        pc = 0x842232; continue;
      case 0x842232:
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 842232: mov eax, dword ptr [edi]
        R.ecx = (R.m.u32(((R.ebp + 0x10) | 0) >>> 0)) | 0; // 842234: mov ecx, dword ptr [ebp + 0x10]
        R.edx = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 842237: mov edx, dword ptr [ebp]
        R.push(0x757ea0); // 84223a: push 0x757ea0
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.eax >>> 0)); // 84223f: mov dword ptr [esp + 0x20], eax
        R.push(0x8); // 842243: push 8
        R.push((R.ecx >>> 0)); // 842245: push ecx
        R.eax = (((R.esp + 0x28) | 0)) | 0; // 842246: lea eax, [esp + 0x28]
        R.push((R.edx >>> 0)); // 84224a: push edx
        R.push((R.eax >>> 0)); // 84224b: push eax
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, 0xffffffff); // 84224c: mov dword ptr [esp + 0x34], 0xffffffff
        R.call(0x946464, { n: 5, thisEcx: false, calleeClean: false }); // 842254: call 0x946464
        R.esi = ((R.eax >>> 0)) | 0; // 842259: mov esi, eax
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 84225b: add esp, 0x14
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 84225e: test esi, esi
        if (R.zf) { pc = 0x842313; continue; } // 842260: je 0x842313
        pc = 0x842266; continue;
      case 0x842266:
        R.eax = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 842266: mov eax, dword ptr [ebp]
        R.ecx = (R.m.u32(((R.ebp + 0x10) | 0) >>> 0)) | 0; // 842269: mov ecx, dword ptr [ebp + 0x10]
        R.sub((R.esi >>> 0), (R.eax >>> 0), 32); // 84226c: cmp esi, eax
        R.edx = (((R.eax + R.ecx * 8 + -0x8) | 0)) | 0; // 84226e: lea edx, [eax + ecx*8 - 8]
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.edx >>> 0)); // 842272: mov dword ptr [esp + 0x34], edx
        if (R.cBE) { pc = 0x84228d; continue; } // 842276: jbe 0x84228d
        pc = 0x842278; continue;
      case 0x842278:
        R.ecx = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 842278: mov ecx, dword ptr [edi]
        pc = 0x84227a; continue;
      case 0x84227a:
        R.edx = (R.m.u32(((R.esi + -0x8) | 0) >>> 0)) | 0; // 84227a: mov edx, dword ptr [esi - 8]
        R.esi = (R.sub((R.esi >>> 0), 0x8, 32)) | 0; // 84227d: sub esi, 8
        R.sub((R.edx >>> 0), (R.ecx >>> 0), 32); // 842280: cmp edx, ecx
        if (!R.zf) { pc = 0x84228a; continue; } // 842282: jne 0x84228a
        pc = 0x842284; continue;
      case 0x842284:
        R.sub((R.esi >>> 0), (R.eax >>> 0), 32); // 842284: cmp esi, eax
        if (!R.cBE) { pc = 0x84227a; continue; } // 842286: ja 0x84227a
        pc = 0x842288; continue;
      case 0x842288:
        pc = 0x84228d; continue; // 842288: jmp 0x84228d
      case 0x84228a:
        R.esi = (R.add((R.esi >>> 0), 0x8, 32)) | 0; // 84228a: add esi, 8
        pc = 0x84228d; continue;
      case 0x84228d:
        R.ebx = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 84228d: mov ebx, dword ptr [edi]
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 84228f: mov eax, dword ptr [esi]
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 842291: cmp eax, ebx
        if (!R.zf) { pc = 0x842313; continue; } // 842293: jne 0x842313
        pc = 0x842295; continue;
      case 0x842295:
        pc = 0x84229b; continue; // 842295: jmp 0x84229b
      case 0x842297:
        R.ebp = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 842297: mov ebp, dword ptr [esp + 0x10]
        pc = 0x84229b; continue;
      case 0x84229b:
        R.edi = (R.m.u32(((R.esi + 0x4) | 0) >>> 0)) | 0; // 84229b: mov edi, dword ptr [esi + 4]
        R.ecx = (R.m.u32(((R.ebp + 0xdc) | 0) >>> 0)) | 0; // 84229e: mov ecx, dword ptr [ebp + 0xdc]
        R.eax = (((R.edi + R.edi * 8) | 0)) | 0; // 8422a4: lea eax, [edi + edi*8]
        R.edx = (R.m.u32(((R.eax + R.ecx) | 0) >>> 0)) | 0; // 8422a7: mov edx, dword ptr [eax + ecx]
        R.ebp = (((R.eax + R.ecx) | 0)) | 0; // 8422aa: lea ebp, [eax + ecx]
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8422ad: xor eax, eax
        R.ecx = (((R.edx + 0xf) | 0)) | 0; // 8422af: lea ecx, [edx + 0xf]
        pc = 0x8422b2; continue;
      case 0x8422b2:
        R.sub(R.m.u32(((R.ecx) | 0) >>> 0), (R.ebx >>> 0), 32); // 8422b2: cmp dword ptr [ecx], ebx
        if (R.zf) { pc = 0x8422f2; continue; } // 8422b4: je 0x8422f2
        pc = 0x8422b6; continue;
      case 0x8422b6:
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 8422b6: inc eax
        R.ecx = (R.add((R.ecx >>> 0), 0x25, 32)) | 0; // 8422b7: add ecx, 0x25
        R.sub((R.eax >>> 0), 0x28, 32); // 8422ba: cmp eax, 0x28
        if (R.cL) { pc = 0x8422b2; continue; } // 8422bd: jl 0x8422b2
        pc = 0x8422bf; continue;
      case 0x8422bf:
        R.edx = (R.m.u32(((R.edx + 0x7) | 0) >>> 0)) | 0; // 8422bf: mov edx, dword ptr [edx + 7]
        pc = 0x8422c2; continue;
      case 0x8422c2:
        R.eax = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 8422c2: mov eax, dword ptr [esp + 0x30]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8422c6: test eax, eax
        if (!R.zf) { pc = 0x8422d0; continue; } // 8422c8: jne 0x8422d0
        pc = 0x8422ca; continue;
      case 0x8422ca:
        R.sub(R.m.u8(((R.ebp + 0x8) | 0) >>> 0), 0x64, 8); // 8422ca: cmp byte ptr [ebp + 8], 0x64
        if (!R.cf) { pc = 0x8422fd; continue; } // 8422ce: jae 0x8422fd
        pc = 0x8422d0; continue;
      case 0x8422d0:
        R.ebx = (R.m.u32(((R.esp + 0x28) | 0) >>> 0)) | 0; // 8422d0: mov ebx, dword ptr [esp + 0x28]
        R.sub((R.edx >>> 0), R.m.u32(((R.ebx + 0x52) | 0) >>> 0), 32); // 8422d4: cmp edx, dword ptr [ebx + 0x52]
        if (R.cLE) { pc = 0x842301; continue; } // 8422d7: jle 0x842301
        pc = 0x8422d9; continue;
      case 0x8422d9:
        R.eax = (R.m.u32(((R.ebx + 0x39) | 0) >>> 0)) | 0; // 8422d9: mov eax, dword ptr [ebx + 0x39]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8422dc: test eax, eax
        if (R.zf) { pc = 0x8422e4; continue; } // 8422de: je 0x8422e4
        pc = 0x8422e0; continue;
      case 0x8422e0:
        R.sub(R.m.u32(((R.eax) | 0) >>> 0), (R.edi >>> 0), 32); // 8422e0: cmp dword ptr [eax], edi
        if (R.zf) { pc = 0x842301; continue; } // 8422e2: je 0x842301
        pc = 0x8422e4; continue;
      case 0x8422e4:
        R.ecx = (R.m.u32(((R.esp + 0x2c) | 0) >>> 0)) | 0; // 8422e4: mov ecx, dword ptr [esp + 0x2c]
        R.push(0x8); // 8422e8: push 8
        R.push((R.esi >>> 0)); // 8422ea: push esi
        R.call(0x68d0d0, { n: 2, thisEcx: true, calleeClean: true }); // 8422eb: call 0x68d0d0
        pc = 0x842301; continue; // 8422f0: jmp 0x842301
      case 0x8422f2:
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 8422f2: lea ecx, [eax + eax*8]
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8422f5: add edx, eax
        R.edx = (R.m.u32(((R.edx + R.ecx * 4 + 0x7) | 0) >>> 0)) | 0; // 8422f7: mov edx, dword ptr [edx + ecx*4 + 7]
        pc = 0x8422c2; continue; // 8422fb: jmp 0x8422c2
      case 0x8422fd:
        R.ebx = (R.m.u32(((R.esp + 0x28) | 0) >>> 0)) | 0; // 8422fd: mov ebx, dword ptr [esp + 0x28]
        pc = 0x842301; continue;
      case 0x842301:
        R.sub((R.esi >>> 0), R.m.u32(((R.esp + 0x34) | 0) >>> 0), 32); // 842301: cmp esi, dword ptr [esp + 0x34]
        if (R.zf) { pc = 0x842313; continue; } // 842305: je 0x842313
        pc = 0x842307; continue;
      case 0x842307:
        R.ebx = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 842307: mov ebx, dword ptr [ebx]
        R.eax = (R.m.u32(((R.esi + 0x8) | 0) >>> 0)) | 0; // 842309: mov eax, dword ptr [esi + 8]
        R.esi = (R.add((R.esi >>> 0), 0x8, 32)) | 0; // 84230c: add esi, 8
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 84230f: cmp eax, ebx
        if (R.zf) { pc = 0x842297; continue; } // 842311: je 0x842297
        pc = 0x842313; continue;
      case 0x842313:
        R.edi = (R.pop()) | 0; // 842313: pop edi
        R.esi = (R.pop()) | 0; // 842314: pop esi
        R.ebp = (R.pop()) | 0; // 842315: pop ebp
        R.ebx = (R.pop()) | 0; // 842316: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 842317: add esp, 0x14
        return R.ret(5); // 84231a: ret 0x14
      default: throw new Error(`f_842180: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
