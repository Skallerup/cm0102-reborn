// 0x544820 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 540a50=3
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_544820(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x544820;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x544820:
        R.push((R.esi >>> 0)); // 544820: push esi
        R.esi = (R.m.u32(((R.esp + 0x8) | 0) >>> 0)) | 0; // 544821: mov esi, dword ptr [esp + 8]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 544825: test esi, esi
        R.push((R.edi >>> 0)); // 544827: push edi
        if (R.zf) { pc = 0x5448b2; continue; } // 544828: je 0x5448b2
        pc = 0x54482e; continue;
      case 0x54482e:
        R.edi = (R.m.u32(((R.esi + 0x53) | 0) >>> 0)) | 0; // 54482e: mov edi, dword ptr [esi + 0x53]
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 544831: test edi, edi
        if (R.zf) { pc = 0x5448b2; continue; } // 544833: je 0x5448b2
        pc = 0x544835; continue;
      case 0x544835:
        R.edx = (R.m.u32(((0xae2350) | 0) >>> 0)) | 0; // 544835: mov edx, dword ptr [0xae2350]
        R.ecx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 54483b: mov ecx, dword ptr [esi]
        R.push((R.ebx >>> 0)); // 54483d: push ebx
        R.push((R.ebp >>> 0)); // 54483e: push ebp
        R.eax = (((R.edx + R.edx) | 0)) | 0; // 54483f: lea eax, [edx + edx]
        R.ebx = ((R.eax >>> 0)) | 0; // 544842: mov ebx, eax
        R.eax = (R.m.u32(((0xae235c) | 0) >>> 0)) | 0; // 544844: mov eax, dword ptr [0xae235c]
        R.ebp = ((R.eax >>> 0)) | 0; // 544849: mov ebp, eax
        R.ebp = (R.sub((R.ebp >>> 0), (R.ebx >>> 0), 32)) | 0; // 54484b: sub ebp, ebx
        R.sub((R.ecx >>> 0), (R.ebp >>> 0), 32); // 54484d: cmp ecx, ebp
        R.ebp = (R.pop()) | 0; // 54484f: pop ebp
        R.ebx = (R.pop()) | 0; // 544850: pop ebx
        if (R.cL) { pc = 0x54486a; continue; } // 544851: jl 0x54486a
        pc = 0x544853; continue;
      case 0x544853:
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 544853: sub eax, edx
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 544855: cmp ecx, eax
        if (!R.cL) { pc = 0x5448b2; continue; } // 544857: jge 0x5448b2
        pc = 0x544859; continue;
      case 0x544859:
        R.sub(R.m.u32(((R.edi + 0x88) | 0) >>> 0), 0x96, 32); // 544859: cmp dword ptr [edi + 0x88], 0x96
        if (R.cLE) { pc = 0x5448b2; continue; } // 544863: jle 0x5448b2
        pc = 0x544865; continue;
      case 0x544865:
        R.edi = (R.pop()) | 0; // 544865: pop edi
        R.eax = ((R.eax & 0xffffff00) | (((0x1) & 0xff) << 0)) | 0; // 544866: mov al, 1
        R.esi = (R.pop()) | 0; // 544868: pop esi
        return R.eax; // 544869: ret 
      case 0x54486a:
        R.eax = (R.m.u32(((R.esi + 0x57) | 0) >>> 0)) | 0; // 54486a: mov eax, dword ptr [esi + 0x57]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 54486d: test eax, eax
        if (R.zf) { pc = 0x5448b2; continue; } // 54486f: je 0x5448b2
        pc = 0x544871; continue;
      case 0x544871:
        R.ecx = (((R.esp + 0xc) | 0)) | 0; // 544871: lea ecx, [esp + 0xc]
        R.push(0x1); // 544875: push 1
        R.push((R.ecx >>> 0)); // 544877: push ecx
        R.push((R.esi >>> 0)); // 544878: push esi
        R.call(0x540a50, { n: 3, thisEcx: false, calleeClean: false }); // 544879: call 0x540a50
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 54487e: add esp, 0xc
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 544881: test eax, eax
        if (R.zf) { pc = 0x54488d; continue; } // 544883: je 0x54488d
        pc = 0x544885; continue;
      case 0x544885:
        R.eax = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 544885: mov eax, dword ptr [esp + 0xc]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 544889: test eax, eax
        if (R.zf) { pc = 0x5448b2; continue; } // 54488b: je 0x5448b2
        pc = 0x54488d; continue;
      case 0x54488d:
        R.eax = (R.m.u32(((0xadadfc) | 0) >>> 0)) | 0; // 54488d: mov eax, dword ptr [0xadadfc]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 544892: test eax, eax
        if (R.zf) { pc = 0x5448b2; continue; } // 544894: je 0x5448b2
        pc = 0x544896; continue;
      case 0x544896:
        R.edx = (R.m.u32(((R.esi + 0x57) | 0) >>> 0)) | 0; // 544896: mov edx, dword ptr [esi + 0x57]
        R.ecx = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 544899: mov ecx, dword ptr [edx]
        R.sub(R.m.u32(((R.eax + R.ecx * 4) | 0) >>> 0), 0x0, 32); // 54489b: cmp dword ptr [eax + ecx*4], 0
        if (R.zf) { pc = 0x5448b2; continue; } // 54489f: je 0x5448b2
        pc = 0x5448a1; continue;
      case 0x5448a1:
        R.edx = (R.m.u32(((R.esi + 0x53) | 0) >>> 0)) | 0; // 5448a1: mov edx, dword ptr [esi + 0x53]
        R.logic(R.m.u8(((R.edx + 0x11c) | 0) >>> 0) & 0x2, 8); // 5448a4: test byte ptr [edx + 0x11c], 2
        if (R.zf) { pc = 0x5448b2; continue; } // 5448ab: je 0x5448b2
        pc = 0x5448ad; continue;
      case 0x5448ad:
        R.edi = (R.pop()) | 0; // 5448ad: pop edi
        R.eax = ((R.eax & 0xffffff00) | (((0x1) & 0xff) << 0)) | 0; // 5448ae: mov al, 1
        R.esi = (R.pop()) | 0; // 5448b0: pop esi
        return R.eax; // 5448b1: ret 
      case 0x5448b2:
        R.edi = (R.pop()) | 0; // 5448b2: pop edi
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 5448b3: xor al, al
        R.esi = (R.pop()) | 0; // 5448b5: pop esi
        return R.eax; // 5448b6: ret 
      default: throw new Error(`f_544820: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
