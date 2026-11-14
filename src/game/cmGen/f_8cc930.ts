// 0x8cc930 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 68d1b0=0t, 8e7a70=4tc
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_8cc930(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x8cc930;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x8cc930:
        R.push((R.ecx >>> 0)); // 8cc930: push ecx
        R.push((R.ebx >>> 0)); // 8cc931: push ebx
        R.ebx = ((R.ecx >>> 0)) | 0; // 8cc932: mov ebx, ecx
        R.ecx = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 8cc934: mov ecx, dword ptr [esp + 0xc]
        R.push((R.ebp >>> 0)); // 8cc938: push ebp
        R.edx = (R.m.u32(((R.ebx + 0x86e) | 0) >>> 0)) | 0; // 8cc939: mov edx, dword ptr [ebx + 0x86e]
        R.push((R.esi >>> 0)); // 8cc93f: push esi
        R.esi = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 8cc940: mov esi, dword ptr [ecx]
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8cc942: xor eax, eax
        R.ebp = (R.logic((R.ebp >>> 0) | 0xffffffff, 32)) | 0; // 8cc944: or ebp, 0xffffffff
        R.push((R.edi >>> 0)); // 8cc947: push edi
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.edx + R.esi * 8 + 0x1) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8cc948: mov cl, byte ptr [edx + esi*8 + 1]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 8cc94c: mov dword ptr [esp + 0x10], eax
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 8cc950: test cl, cl
        if (R.zf) { pc = 0x8cc970; continue; } // 8cc952: je 0x8cc970
        pc = 0x8cc954; continue;
      case 0x8cc954:
        R.edx = (R.m.u32(((R.ebx + 0x4) | 0) >>> 0)) | 0; // 8cc954: mov edx, dword ptr [ebx + 4]
        R.sub((R.edx >>> 0), (R.eax >>> 0), 32); // 8cc957: cmp edx, eax
        if (R.cLE) { pc = 0x8cc970; continue; } // 8cc959: jle 0x8cc970
        pc = 0x8cc95b; continue;
      case 0x8cc95b:
        R.ecx = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 8cc95b: mov ecx, dword ptr [ebx]
        pc = 0x8cc95d; continue;
      case 0x8cc95d:
        R.edi = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 8cc95d: mov edi, dword ptr [ecx]
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 8cc95f: test edi, edi
        if (R.zf) { pc = 0x8cc968; continue; } // 8cc961: je 0x8cc968
        pc = 0x8cc963; continue;
      case 0x8cc963:
        R.sub(R.m.u32(((R.edi + 0xc) | 0) >>> 0), (R.esi >>> 0), 32); // 8cc963: cmp dword ptr [edi + 0xc], esi
        if (R.zf) { pc = 0x8cc97a; continue; } // 8cc966: je 0x8cc97a
        pc = 0x8cc968; continue;
      case 0x8cc968:
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 8cc968: inc eax
        R.ecx = (R.add((R.ecx >>> 0), 0x4, 32)) | 0; // 8cc969: add ecx, 4
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 8cc96c: cmp eax, edx
        if (R.cL) { pc = 0x8cc95d; continue; } // 8cc96e: jl 0x8cc95d
        pc = 0x8cc970; continue;
      case 0x8cc970:
        R.edi = (R.pop()) | 0; // 8cc970: pop edi
        R.esi = (R.pop()) | 0; // 8cc971: pop esi
        R.ebp = (R.pop()) | 0; // 8cc972: pop ebp
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8cc973: xor eax, eax
        R.ebx = (R.pop()) | 0; // 8cc975: pop ebx
        R.ecx = (R.pop()) | 0; // 8cc976: pop ecx
        return R.ret(2); // 8cc977: ret 8
      case 0x8cc97a:
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 8cc97a: mov eax, dword ptr [edi]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cc97c: test eax, eax
        if (R.zf) { pc = 0x8cc9e1; continue; } // 8cc97e: je 0x8cc9e1
        pc = 0x8cc980; continue;
      case 0x8cc980:
        R.ecx = (R.m.u32(((R.eax + 0x2) | 0) >>> 0)) | 0; // 8cc980: mov ecx, dword ptr [eax + 2]
        R.m.w32(((R.eax + 0xa) | 0) >>> 0, (R.ecx >>> 0)); // 8cc983: mov dword ptr [eax + 0xa], ecx
        R.ecx = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 8cc986: mov ecx, dword ptr [edi]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8cc988: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cc98d: test eax, eax
        if (R.zf) { pc = 0x8cc9d5; continue; } // 8cc98f: je 0x8cc9d5
        pc = 0x8cc991; continue;
      case 0x8cc991:
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8cc991: mov edx, dword ptr [eax]
        R.eax = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 8cc993: mov eax, dword ptr [ebx]
        R.esi = (R.m.u32(((R.eax + R.edx * 4) | 0) >>> 0)) | 0; // 8cc995: mov esi, dword ptr [eax + edx*4]
        R.edx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 8cc998: mov edx, dword ptr [esp + 0x1c]
        R.ecx = (R.m.u32(((R.esi + 0x8) | 0) >>> 0)) | 0; // 8cc99c: mov ecx, dword ptr [esi + 8]
        R.eax = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 8cc99f: mov eax, dword ptr [edx]
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 8cc9a1: cmp ecx, eax
        if (R.zf) { pc = 0x8cc9ab; continue; } // 8cc9a3: je 0x8cc9ab
        pc = 0x8cc9a5; continue;
      case 0x8cc9a5:
        R.sub(R.m.u8(((R.esi + 0x2d) | 0) >>> 0), 0x1, 8); // 8cc9a5: cmp byte ptr [esi + 0x2d], 1
        if (!R.zf) { pc = 0x8cc9ca; continue; } // 8cc9a9: jne 0x8cc9ca
        pc = 0x8cc9ab; continue;
      case 0x8cc9ab:
        R.sub(R.m.u8(((R.esi + 0x2c) | 0) >>> 0), 0x2, 8); // 8cc9ab: cmp byte ptr [esi + 0x2c], 2
        if (!R.zf) { pc = 0x8cc9ca; continue; } // 8cc9af: jne 0x8cc9ca
        pc = 0x8cc9b1; continue;
      case 0x8cc9b1:
        R.push(0x1); // 8cc9b1: push 1
        R.push(0x0); // 8cc9b3: push 0
        R.push(0x0); // 8cc9b5: push 0
        R.push(0x0); // 8cc9b7: push 0
        R.ecx = ((R.esi >>> 0)) | 0; // 8cc9b9: mov ecx, esi
        R.call(0x8e7a70, { n: 4, thisEcx: true, calleeClean: true }); // 8cc9bb: call 0x8e7a70
        R.sub((R.eax >>> 0), (R.ebp >>> 0), 32); // 8cc9c0: cmp eax, ebp
        if (R.cLE) { pc = 0x8cc9ca; continue; } // 8cc9c2: jle 0x8cc9ca
        pc = 0x8cc9c4; continue;
      case 0x8cc9c4:
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.esi >>> 0)); // 8cc9c4: mov dword ptr [esp + 0x10], esi
        R.ebp = ((R.eax >>> 0)) | 0; // 8cc9c8: mov ebp, eax
        pc = 0x8cc9ca; continue;
      case 0x8cc9ca:
        R.ecx = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 8cc9ca: mov ecx, dword ptr [edi]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 8cc9cc: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8cc9d1: test eax, eax
        if (!R.zf) { pc = 0x8cc991; continue; } // 8cc9d3: jne 0x8cc991
        pc = 0x8cc9d5; continue;
      case 0x8cc9d5:
        R.eax = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 8cc9d5: mov eax, dword ptr [esp + 0x10]
        R.edi = (R.pop()) | 0; // 8cc9d9: pop edi
        R.esi = (R.pop()) | 0; // 8cc9da: pop esi
        R.ebp = (R.pop()) | 0; // 8cc9db: pop ebp
        R.ebx = (R.pop()) | 0; // 8cc9dc: pop ebx
        R.ecx = (R.pop()) | 0; // 8cc9dd: pop ecx
        return R.ret(2); // 8cc9de: ret 8
      case 0x8cc9e1:
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 8cc9e1: mov ecx, dword ptr [esp + 0x1c]
        R.eax = (R.m.u32(((R.edi + 0x8) | 0) >>> 0)) | 0; // 8cc9e5: mov eax, dword ptr [edi + 8]
        R.sub((R.eax >>> 0), R.m.u32(((R.ecx) | 0) >>> 0), 32); // 8cc9e8: cmp eax, dword ptr [ecx]
        if (R.zf) { pc = 0x8cc9f6; continue; } // 8cc9ea: je 0x8cc9f6
        pc = 0x8cc9ec; continue;
      case 0x8cc9ec:
        R.sub(R.m.u8(((R.edi + 0x2d) | 0) >>> 0), 0x1, 8); // 8cc9ec: cmp byte ptr [edi + 0x2d], 1
        if (!R.zf) { pc = 0x8cc970; continue; } // 8cc9f0: jne 0x8cc970
        pc = 0x8cc9f6; continue;
      case 0x8cc9f6:
        R.sub(R.m.u8(((R.edi + 0x2c) | 0) >>> 0), 0x2, 8); // 8cc9f6: cmp byte ptr [edi + 0x2c], 2
        if (!R.zf) { pc = 0x8cc970; continue; } // 8cc9fa: jne 0x8cc970
        pc = 0x8cca00; continue;
      case 0x8cca00:
        R.eax = ((R.edi >>> 0)) | 0; // 8cca00: mov eax, edi
        R.edi = (R.pop()) | 0; // 8cca02: pop edi
        R.esi = (R.pop()) | 0; // 8cca03: pop esi
        R.ebp = (R.pop()) | 0; // 8cca04: pop ebp
        R.ebx = (R.pop()) | 0; // 8cca05: pop ebx
        R.ecx = (R.pop()) | 0; // 8cca06: pop ecx
        return R.ret(2); // 8cca07: ret 8
      default: throw new Error(`f_8cc930: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
