// 0x7c6830 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4cf5f0=2tc, 946464=5
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_7c6830(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x7c6830;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x7c6830:
        R.esp = (R.sub((R.esp >>> 0), 0x8, 32)) | 0; // 7c6830: sub esp, 8
        R.push((R.ebx >>> 0)); // 7c6833: push ebx
        R.push((R.esi >>> 0)); // 7c6834: push esi
        R.esi = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 7c6835: mov esi, dword ptr [esp + 0x14]
        R.push((R.edi >>> 0)); // 7c6839: push edi
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 7c683a: test esi, esi
        R.ebx = ((R.ecx >>> 0)) | 0; // 7c683c: mov ebx, ecx
        if (R.zf) { pc = 0x7c6868; continue; } // 7c683e: je 0x7c6868
        pc = 0x7c6840; continue;
      case 0x7c6840:
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 7c6840: mov eax, dword ptr [esi]
        R.ecx = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 7c6842: mov ecx, dword ptr [0xae2364]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 7c6848: cmp eax, ecx
        if (R.cL) { pc = 0x7c6868; continue; } // 7c684a: jl 0x7c6868
        pc = 0x7c684c; continue;
      case 0x7c684c:
        R.ecx = (R.m.u32(((R.esi + 0x1a) | 0) >>> 0)) | 0; // 7c684c: mov ecx, dword ptr [esi + 0x1a]
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.esp + 0x20) | 0) >>> 0)) & 0xff) << 0)) | 0; // 7c684f: mov bl, byte ptr [esp + 0x20]
        R.edi = (R.pop()) | 0; // 7c6853: pop edi
        R.esi = (R.pop()) | 0; // 7c6854: pop esi
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.ecx + 0x77) | 0) >>> 0)) & 0xff) << 0)) | 0; // 7c6855: mov dl, byte ptr [ecx + 0x77]
        R.sub(((R.edx >>> 0) & 0xff), ((R.ebx >>> 0) & 0xff), 8); // 7c6858: cmp dl, bl
        R.ebx = (R.pop()) | 0; // 7c685a: pop ebx
        R.eax = ((R.eax & 0xffffff00) | (((!R.zf ? 1 : 0) & 0xff) << 0)) | 0; // 7c685b: setne al
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 7c685e: dec eax
        R.eax = (R.logic((R.eax >>> 0) & 0xa, 32)) | 0; // 7c685f: and eax, 0xa
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 7c6862: add esp, 8
        return R.eax; // 7c6865: ret 0x10
      case 0x7c6868:
        R.eax = (R.m.u32(((R.esp + 0x24) | 0) >>> 0)) | 0; // 7c6868: mov eax, dword ptr [esp + 0x24]
        R.edi = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 7c686c: mov edi, dword ptr [esp + 0x1c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 7c6870: test eax, eax
        if (R.zf) { pc = 0x7c68a6; continue; } // 7c6872: je 0x7c68a6
        pc = 0x7c6874; continue;
      case 0x7c6874:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 7c6874: mov ecx, dword ptr [0xae1050]
        R.push((R.edi >>> 0)); // 7c687a: push edi
        R.push((R.esi >>> 0)); // 7c687b: push esi
        R.call(0x4cf5f0, { n: 2, thisEcx: true, calleeClean: true }); // 7c687c: call 0x4cf5f0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 7c6881: test eax, eax
        if (R.zf) { pc = 0x7c68a6; continue; } // 7c6883: je 0x7c68a6
        pc = 0x7c6885; continue;
      case 0x7c6885:
        R.ecx = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 7c6885: mov ecx, dword ptr [esi + 0x39]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 7c6888: test ecx, ecx
        if (R.zf) { pc = 0x7c68a6; continue; } // 7c688a: je 0x7c68a6
        pc = 0x7c688c; continue;
      case 0x7c688c:
        R.edx = (R.m.u32(((R.edi + 0x53) | 0) >>> 0)) | 0; // 7c688c: mov edx, dword ptr [edi + 0x53]
        R.push((R.ebp >>> 0)); // 7c688f: push ebp
        R.ebp = (R.m.u32(((R.ecx + 0x53) | 0) >>> 0)) | 0; // 7c6890: mov ebp, dword ptr [ecx + 0x53]
        R.sub((R.edx >>> 0), (R.ebp >>> 0), 32); // 7c6893: cmp edx, ebp
        R.ebp = (R.pop()) | 0; // 7c6895: pop ebp
        if (!R.zf) { pc = 0x7c68a6; continue; } // 7c6896: jne 0x7c68a6
        pc = 0x7c6898; continue;
      case 0x7c6898:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 7c6898: mov al, byte ptr [eax + 0x4f]
        R.edi = (R.pop()) | 0; // 7c689b: pop edi
        R.esi = (R.pop()) | 0; // 7c689c: pop esi
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf, 8)) & 0xff) << 0)) | 0; // 7c689d: and al, 0xf
        R.ebx = (R.pop()) | 0; // 7c689f: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 7c68a0: add esp, 8
        return R.eax; // 7c68a3: ret 0x10
      case 0x7c68a6:
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 7c68a6: test edi, edi
        if (R.zf) { pc = 0x7c68c8; continue; } // 7c68a8: je 0x7c68c8
        pc = 0x7c68aa; continue;
      case 0x7c68aa:
        R.edi = (R.m.u32(((R.edi + 0x53) | 0) >>> 0)) | 0; // 7c68aa: mov edi, dword ptr [edi + 0x53]
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 7c68ad: test edi, edi
        if (R.zf) { pc = 0x7c68c8; continue; } // 7c68af: je 0x7c68c8
        pc = 0x7c68b1; continue;
      case 0x7c68b1:
        R.eax = (R.m.u32(((R.esi + 0x1a) | 0) >>> 0)) | 0; // 7c68b1: mov eax, dword ptr [esi + 0x1a]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.edi + 0x77) | 0) >>> 0)) & 0xff) << 0)) | 0; // 7c68b4: mov cl, byte ptr [edi + 0x77]
        R.sub(R.m.u8(((R.eax + 0x77) | 0) >>> 0), ((R.ecx >>> 0) & 0xff), 8); // 7c68b7: cmp byte ptr [eax + 0x77], cl
        if (R.zf) { pc = 0x7c6925; continue; } // 7c68ba: je 0x7c6925
        pc = 0x7c68bc; continue;
      case 0x7c68bc:
        R.eax = (R.m.u32(((R.esi + 0x1e) | 0) >>> 0)) | 0; // 7c68bc: mov eax, dword ptr [esi + 0x1e]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 7c68bf: test eax, eax
        if (R.zf) { pc = 0x7c68c8; continue; } // 7c68c1: je 0x7c68c8
        pc = 0x7c68c3; continue;
      case 0x7c68c3:
        R.sub(R.m.u8(((R.eax + 0x77) | 0) >>> 0), ((R.ecx >>> 0) & 0xff), 8); // 7c68c3: cmp byte ptr [eax + 0x77], cl
        if (R.zf) { pc = 0x7c6925; continue; } // 7c68c6: je 0x7c6925
        pc = 0x7c68c8; continue;
      case 0x7c68c8:
        R.edx = (R.m.u32(((R.esi + 0x1a) | 0) >>> 0)) | 0; // 7c68c8: mov edx, dword ptr [esi + 0x1a]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esp + 0x20) | 0) >>> 0)) & 0xff) << 0)) | 0; // 7c68cb: mov cl, byte ptr [esp + 0x20]
        R.sub(R.m.u8(((R.edx + 0x77) | 0) >>> 0), ((R.ecx >>> 0) & 0xff), 8); // 7c68cf: cmp byte ptr [edx + 0x77], cl
        if (R.zf) { pc = 0x7c6925; continue; } // 7c68d2: je 0x7c6925
        pc = 0x7c68d4; continue;
      case 0x7c68d4:
        R.eax = (R.m.u32(((R.esi + 0x1e) | 0) >>> 0)) | 0; // 7c68d4: mov eax, dword ptr [esi + 0x1e]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 7c68d7: test eax, eax
        if (R.zf) { pc = 0x7c68e0; continue; } // 7c68d9: je 0x7c68e0
        pc = 0x7c68db; continue;
      case 0x7c68db:
        R.sub(R.m.u8(((R.eax + 0x77) | 0) >>> 0), ((R.ecx >>> 0) & 0xff), 8); // 7c68db: cmp byte ptr [eax + 0x77], cl
        if (R.zf) { pc = 0x7c6925; continue; } // 7c68de: je 0x7c6925
        pc = 0x7c68e0; continue;
      case 0x7c68e0:
        R.eax = (R.m.u32(((R.ebx + 0x3c) | 0) >>> 0)) | 0; // 7c68e0: mov eax, dword ptr [ebx + 0x3c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 7c68e3: test eax, eax
        if (!R.zf) { pc = 0x7c68f2; continue; } // 7c68e5: jne 0x7c68f2
        pc = 0x7c68e7; continue;
      case 0x7c68e7:
        R.edi = (R.pop()) | 0; // 7c68e7: pop edi
        R.esi = (R.pop()) | 0; // 7c68e8: pop esi
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 7c68e9: xor al, al
        R.ebx = (R.pop()) | 0; // 7c68eb: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 7c68ec: add esp, 8
        return R.eax; // 7c68ef: ret 0x10
      case 0x7c68f2:
        R.edx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 7c68f2: mov edx, dword ptr [esi]
        R.m.w8(((R.esp + 0x10) | 0) >>> 0, ((R.ecx >>> 0) & 0xff)); // 7c68f4: mov byte ptr [esp + 0x10], cl
        R.ecx = (R.m.u32(((R.ebx + 0x44) | 0) >>> 0)) | 0; // 7c68f8: mov ecx, dword ptr [ebx + 0x44]
        R.push(0x7c6d40); // 7c68fb: push 0x7c6d40
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edx >>> 0)); // 7c6900: mov dword ptr [esp + 0x10], edx
        R.push(0x6); // 7c6904: push 6
        R.push((R.ecx >>> 0)); // 7c6906: push ecx
        R.edx = (((R.esp + 0x18) | 0)) | 0; // 7c6907: lea edx, [esp + 0x18]
        R.push((R.eax >>> 0)); // 7c690b: push eax
        R.push((R.edx >>> 0)); // 7c690c: push edx
        R.call(0x946464, { n: 5, thisEcx: false, calleeClean: false }); // 7c690d: call 0x946464
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 7c6912: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 7c6915: test eax, eax
        if (R.zf) { pc = 0x7c68e7; continue; } // 7c6917: je 0x7c68e7
        pc = 0x7c6919; continue;
      case 0x7c6919:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x5) | 0) >>> 0)) & 0xff) << 0)) | 0; // 7c6919: mov al, byte ptr [eax + 5]
        R.edi = (R.pop()) | 0; // 7c691c: pop edi
        R.esi = (R.pop()) | 0; // 7c691d: pop esi
        R.ebx = (R.pop()) | 0; // 7c691e: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 7c691f: add esp, 8
        return R.eax; // 7c6922: ret 0x10
      case 0x7c6925:
        R.edi = (R.pop()) | 0; // 7c6925: pop edi
        R.esi = (R.pop()) | 0; // 7c6926: pop esi
        R.eax = ((R.eax & 0xffffff00) | (((0xa) & 0xff) << 0)) | 0; // 7c6927: mov al, 0xa
        R.ebx = (R.pop()) | 0; // 7c6929: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 7c692a: add esp, 8
        return R.eax; // 7c692d: ret 0x10
      default: throw new Error(`f_7c6830: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
