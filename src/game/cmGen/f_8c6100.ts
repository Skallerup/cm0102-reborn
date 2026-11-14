// 0x8c6100 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4cf5a0=1c, 68d0d0=2tc
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_8c6100(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x8c6100;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x8c6100:
        R.push((R.ecx >>> 0)); // 8c6100: push ecx
        R.push((R.ebp >>> 0)); // 8c6101: push ebp
        R.push((R.esi >>> 0)); // 8c6102: push esi
        R.esi = ((R.ecx >>> 0)) | 0; // 8c6103: mov esi, ecx
        R.ebp = (R.logic((R.ebp >>> 0) ^ (R.ebp >>> 0), 32)) | 0; // 8c6105: xor ebp, ebp
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8c6107: xor eax, eax
        R.ecx = (R.m.u32(((R.esi + 0x4) | 0) >>> 0)) | 0; // 8c6109: mov ecx, dword ptr [esi + 4]
        R.m.w32(((R.esp + 0x8) | 0) >>> 0, (R.eax >>> 0)); // 8c610c: mov dword ptr [esp + 8], eax
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 8c6110: test ecx, ecx
        if (R.cLE) { pc = 0x8c61d8; continue; } // 8c6112: jle 0x8c61d8
        pc = 0x8c6118; continue;
      case 0x8c6118:
        R.push((R.ebx >>> 0)); // 8c6118: push ebx
        R.ebx = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 8c6119: mov ebx, dword ptr [esp + 0x14]
        R.push((R.edi >>> 0)); // 8c611d: push edi
        R.edi = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 8c611e: mov edi, dword ptr [esp + 0x1c]
        pc = 0x8c6122; continue;
      case 0x8c6122:
        R.ecx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8c6122: mov ecx, dword ptr [esi]
        R.ecx = (R.m.u32(((R.ecx + R.eax * 4) | 0) >>> 0)) | 0; // 8c6124: mov ecx, dword ptr [ecx + eax*4]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 8c6127: test ecx, ecx
        if (R.zf) { pc = 0x8c61ba; continue; } // 8c6129: je 0x8c61ba
        pc = 0x8c612f; continue;
      case 0x8c612f:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + 0x2c) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8c612f: mov al, byte ptr [ecx + 0x2c]
        R.sub(((R.eax >>> 0) & 0xff), 0x2, 8); // 8c6132: cmp al, 2
        if (R.zf) { pc = 0x8c614a; continue; } // 8c6134: je 0x8c614a
        pc = 0x8c6136; continue;
      case 0x8c6136:
        R.sub(((R.eax >>> 0) & 0xff), 0x3, 8); // 8c6136: cmp al, 3
        if (R.zf) { pc = 0x8c614a; continue; } // 8c6138: je 0x8c614a
        pc = 0x8c613a; continue;
      case 0x8c613a:
        R.sub(((R.eax >>> 0) & 0xff), 0x14, 8); // 8c613a: cmp al, 0x14
        if (R.zf) { pc = 0x8c614a; continue; } // 8c613c: je 0x8c614a
        pc = 0x8c613e; continue;
      case 0x8c613e:
        R.sub(((R.eax >>> 0) & 0xff), 0xf, 8); // 8c613e: cmp al, 0xf
        if (R.zf) { pc = 0x8c614e; continue; } // 8c6140: je 0x8c614e
        pc = 0x8c6142; continue;
      case 0x8c6142:
        R.sub(((R.eax >>> 0) & 0xff), 0x10, 8); // 8c6142: cmp al, 0x10
        if (R.zf) { pc = 0x8c614a; continue; } // 8c6144: je 0x8c614a
        pc = 0x8c6146; continue;
      case 0x8c6146:
        R.sub(((R.eax >>> 0) & 0xff), 0x4, 8); // 8c6146: cmp al, 4
        if (!R.zf) { pc = 0x8c6154; continue; } // 8c6148: jne 0x8c6154
        pc = 0x8c614a; continue;
      case 0x8c614a:
        R.sub(((R.eax >>> 0) & 0xff), 0xf, 8); // 8c614a: cmp al, 0xf
        if (!R.zf) { pc = 0x8c61ba; continue; } // 8c614c: jne 0x8c61ba
        pc = 0x8c614e; continue;
      case 0x8c614e:
        R.sub(R.m.u8(((R.ecx + 0x2e) | 0) >>> 0), 0x3, 8); // 8c614e: cmp byte ptr [ecx + 0x2e], 3
        if (!R.cf) { pc = 0x8c61ba; continue; } // 8c6152: jae 0x8c61ba
        pc = 0x8c6154; continue;
      case 0x8c6154:
        R.eax = (R.m.u32(((R.ecx + 0xc) | 0) >>> 0)) | 0; // 8c6154: mov eax, dword ptr [ecx + 0xc]
        R.ecx = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 8c6157: mov ecx, dword ptr [0xae23bc]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 8c615d: lea edx, [eax + eax*4]
        R.eax = (((R.eax + R.edx * 2) | 0)) | 0; // 8c6160: lea eax, [eax + edx*2]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 8c6163: lea eax, [eax + eax*4]
        R.edx = (((R.ecx + R.eax * 2) | 0)) | 0; // 8c6166: lea edx, [ecx + eax*2]
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8c6169: mov ecx, dword ptr [0xae1050]
        R.push((R.edx >>> 0)); // 8c616f: push edx
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 8c6170: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c6175: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 8c6177: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x8c61a1; continue; } // 8c617c: je 0x8c61a1
        pc = 0x8c617e; continue;
      case 0x8c617e:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + 0x35) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8c617e: mov cl, byte ptr [eax + 0x35]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0x3f, 8)) & 0xff) << 0)) | 0; // 8c6181: and cl, 0x3f
        R.sub(((R.ecx >>> 0) & 0xff), 0x5, 8); // 8c6184: cmp cl, 5
        if (R.zf) { pc = 0x8c61a1; continue; } // 8c6187: je 0x8c61a1
        pc = 0x8c6189; continue;
      case 0x8c6189:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 8c6189: mov eax, dword ptr [eax + 4]
        R.ecx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 8c618c: mov ecx, dword ptr [0xae23b4]
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 8c6192: lea edx, [eax + eax*8]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 8c6195: shl edx, 4
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8c6198: add edx, eax
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 8c619a: add ecx, eax
        R.eax = (((R.ecx + R.edx * 4) | 0)) | 0; // 8c619c: lea eax, [ecx + edx*4]
        pc = 0x8c61a3; continue; // 8c619f: jmp 0x8c61a3
      case 0x8c61a1:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8c61a1: xor eax, eax
        pc = 0x8c61a3; continue;
      case 0x8c61a3:
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 8c61a3: cmp eax, ebx
        if (!R.zf) { pc = 0x8c61ba; continue; } // 8c61a5: jne 0x8c61ba
        pc = 0x8c61a7; continue;
      case 0x8c61a7:
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 8c61a7: test edi, edi
        if (R.zf) { pc = 0x8c61b9; continue; } // 8c61a9: je 0x8c61b9
        pc = 0x8c61ab; continue;
      case 0x8c61ab:
        R.edx = (((R.esp + 0x10) | 0)) | 0; // 8c61ab: lea edx, [esp + 0x10]
        R.push(0x4); // 8c61af: push 4
        R.push((R.edx >>> 0)); // 8c61b1: push edx
        R.ecx = ((R.edi >>> 0)) | 0; // 8c61b2: mov ecx, edi
        R.call(0x68d0d0, { n: 2, thisEcx: true, calleeClean: true }); // 8c61b4: call 0x68d0d0
        pc = 0x8c61b9; continue;
      case 0x8c61b9:
        R.ebp = (R.incdec((R.ebp >>> 0), 1, 32)) | 0; // 8c61b9: inc ebp
        pc = 0x8c61ba; continue;
      case 0x8c61ba:
        R.eax = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 8c61ba: mov eax, dword ptr [esp + 0x10]
        R.ecx = (R.m.u32(((R.esi + 0x4) | 0) >>> 0)) | 0; // 8c61be: mov ecx, dword ptr [esi + 4]
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 8c61c1: inc eax
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 8c61c2: cmp eax, ecx
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 8c61c4: mov dword ptr [esp + 0x10], eax
        if (R.cL) { pc = 0x8c6122; continue; } // 8c61c8: jl 0x8c6122
        pc = 0x8c61ce; continue;
      case 0x8c61ce:
        R.edi = (R.pop()) | 0; // 8c61ce: pop edi
        R.ebx = (R.pop()) | 0; // 8c61cf: pop ebx
        R.eax = ((R.ebp >>> 0)) | 0; // 8c61d0: mov eax, ebp
        R.esi = (R.pop()) | 0; // 8c61d2: pop esi
        R.ebp = (R.pop()) | 0; // 8c61d3: pop ebp
        R.ecx = (R.pop()) | 0; // 8c61d4: pop ecx
        return R.ret(2); // 8c61d5: ret 8
      case 0x8c61d8:
        R.eax = ((R.ebp >>> 0)) | 0; // 8c61d8: mov eax, ebp
        R.esi = (R.pop()) | 0; // 8c61da: pop esi
        R.ebp = (R.pop()) | 0; // 8c61db: pop ebp
        R.ecx = (R.pop()) | 0; // 8c61dc: pop ecx
        return R.ret(2); // 8c61dd: ret 8
      default: throw new Error(`f_8c6100: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
