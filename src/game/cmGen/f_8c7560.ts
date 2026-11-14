// 0x8c7560 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4cf5a0=1c, 53d740=2, 5e8290=9, 90d130=0, 944c9f=0, 944cff=5t, 946464=5
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_8c7560(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x8c7560;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x8c7560:
        R.eax = (R.m.u32(((R.esp + 0x8) | 0) >>> 0)) | 0; // 8c7560: mov eax, dword ptr [esp + 8]
        R.esp = (R.sub((R.esp >>> 0), 0x210, 32)) | 0; // 8c7564: sub esp, 0x210
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c756a: test eax, eax
        R.push((R.esi >>> 0)); // 8c756c: push esi
        R.push((R.edi >>> 0)); // 8c756d: push edi
        R.edi = ((R.ecx >>> 0)) | 0; // 8c756e: mov edi, ecx
        if (R.zf) { pc = 0x8c75e0; continue; } // 8c7570: je 0x8c75e0
        pc = 0x8c7572; continue;
      case 0x8c7572:
        R.eax = (R.m.u32(((R.eax + 0x53) | 0) >>> 0)) | 0; // 8c7572: mov eax, dword ptr [eax + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c7575: test eax, eax
        if (R.zf) { pc = 0x8c75e0; continue; } // 8c7577: je 0x8c75e0
        pc = 0x8c7579; continue;
      case 0x8c7579:
        R.esi = (R.m.u32(((R.esp + 0x21c) | 0) >>> 0)) | 0; // 8c7579: mov esi, dword ptr [esp + 0x21c]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8c7580: test esi, esi
        if (!R.zf) { pc = 0x8c75ed; continue; } // 8c7582: jne 0x8c75ed
        pc = 0x8c7584; continue;
      case 0x8c7584:
        R.eax = (((R.esp + 0x18) | 0)) | 0; // 8c7584: lea eax, [esp + 0x18]
        R.ecx = (((R.esp + 0x118) | 0)) | 0; // 8c7588: lea ecx, [esp + 0x118]
        R.push((R.eax >>> 0)); // 8c758f: push eax
        R.push((R.ecx >>> 0)); // 8c7590: push ecx
        R.push((R.esi >>> 0)); // 8c7591: push esi
        R.push((R.esi >>> 0)); // 8c7592: push esi
        R.push(0xa8d514); // 8c7593: push 0xa8d514
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 8c7598: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8c759d: add esp, 0x14
        R.edx = (((R.esp + 0x18) | 0)) | 0; // 8c75a0: lea edx, [esp + 0x18]
        R.eax = (((R.esp + 0x118) | 0)) | 0; // 8c75a4: lea eax, [esp + 0x118]
        R.push(0x1c23); // 8c75ab: push 0x1c23
        R.push((R.edx >>> 0)); // 8c75b0: push edx
        R.push((R.eax >>> 0)); // 8c75b1: push eax
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 8c75b2: call 0x90d130
        R.push((R.eax >>> 0)); // 8c75b7: push eax
        R.push(0x9870e8); // 8c75b8: push 0x9870e8
        R.push(0xae24d0); // 8c75bd: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 8c75c2: call 0x944c9f
        R.push((R.esi >>> 0)); // 8c75c7: push esi
        R.push(0xae24d0); // 8c75c8: push 0xae24d0
        R.push(0x9870e0); // 8c75cd: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 8c75d2: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 8c75d7: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, (R.esi >>> 0)); // 8c75da: mov dword ptr [0xb67a34], esi
        pc = 0x8c75e0; continue;
      case 0x8c75e0:
        R.edi = (R.pop()) | 0; // 8c75e0: pop edi
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8c75e1: xor eax, eax
        R.esi = (R.pop()) | 0; // 8c75e3: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x210, 32)) | 0; // 8c75e4: add esp, 0x210
        return R.eax; // 8c75ea: ret 0xc
      case 0x8c75ed:
        R.sub(R.m.u8(((R.eax + 0x76) | 0) >>> 0), 0xe, 8); // 8c75ed: cmp byte ptr [eax + 0x76], 0xe
        if (!R.zf) { pc = 0x8c75e0; continue; } // 8c75f1: jne 0x8c75e0
        pc = 0x8c75f3; continue;
      case 0x8c75f3:
        R.push(0x0); // 8c75f3: push 0
        R.push((R.esi >>> 0)); // 8c75f5: push esi
        R.call(0x53d740, { n: 2, thisEcx: false, calleeClean: false }); // 8c75f6: call 0x53d740
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 8c75fb: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c75fe: test eax, eax
        if (!R.zf) { pc = 0x8c75e0; continue; } // 8c7600: jne 0x8c75e0
        pc = 0x8c7602; continue;
      case 0x8c7602:
        R.eax = (R.m.u32(((R.esp + 0x224) | 0) >>> 0)) | 0; // 8c7602: mov eax, dword ptr [esp + 0x224]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c7609: test eax, eax
        if (R.zf) { pc = 0x8c761d; continue; } // 8c760b: je 0x8c761d
        pc = 0x8c760d; continue;
      case 0x8c760d:
        R.edi = (R.pop()) | 0; // 8c760d: pop edi
        R.eax = (0x1) | 0; // 8c760e: mov eax, 1
        R.esi = (R.pop()) | 0; // 8c7613: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x210, 32)) | 0; // 8c7614: add esp, 0x210
        return R.eax; // 8c761a: ret 0xc
      case 0x8c761d:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8c761d: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 8c7623: push esi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 8c7624: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c7629: test eax, eax
        if (R.zf) { pc = 0x8c767e; continue; } // 8c762b: je 0x8c767e
        pc = 0x8c762d; continue;
      case 0x8c762d:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + 0x35) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8c762d: mov cl, byte ptr [eax + 0x35]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0x3f, 8)) & 0xff) << 0)) | 0; // 8c7630: and cl, 0x3f
        R.sub(((R.ecx >>> 0) & 0xff), 0x2, 8); // 8c7633: cmp cl, 2
        if (!R.zf) { pc = 0x8c767e; continue; } // 8c7636: jne 0x8c767e
        pc = 0x8c7638; continue;
      case 0x8c7638:
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8c7638: mov eax, dword ptr [esi]
        R.ecx = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 8c763a: mov ecx, dword ptr [0xae2364]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 8c7640: cmp eax, ecx
        if (!R.cL) { pc = 0x8c767e; continue; } // 8c7642: jge 0x8c767e
        pc = 0x8c7644; continue;
      case 0x8c7644:
        R.edx = (R.m.u32(((R.edi + 0x86e) | 0) >>> 0)) | 0; // 8c7644: mov edx, dword ptr [edi + 0x86e]
        R.logic(R.m.u8(((R.edx + R.eax * 8) | 0) >>> 0) & 0x20, 8); // 8c764a: test byte ptr [edx + eax*8], 0x20
        if (R.zf) { pc = 0x8c767e; continue; } // 8c764e: je 0x8c767e
        pc = 0x8c7650; continue;
      case 0x8c7650:
        R.ecx = (R.m.u32(((R.edi + 0x93a) | 0) >>> 0)) | 0; // 8c7650: mov ecx, dword ptr [edi + 0x93a]
        R.m.w32(((R.esp + 0x8) | 0) >>> 0, (R.eax >>> 0)); // 8c7656: mov dword ptr [esp + 8], eax
        R.eax = (R.m.u32(((R.edi + 0x93e) | 0) >>> 0)) | 0; // 8c765a: mov eax, dword ptr [edi + 0x93e]
        R.push(0x8e55c0); // 8c7660: push 0x8e55c0
        R.push(0xe); // 8c7665: push 0xe
        R.push((R.eax >>> 0)); // 8c7667: push eax
        R.edx = (((R.esp + 0x14) | 0)) | 0; // 8c7668: lea edx, [esp + 0x14]
        R.push((R.ecx >>> 0)); // 8c766c: push ecx
        R.push((R.edx >>> 0)); // 8c766d: push edx
        R.call(0x946464, { n: 5, thisEcx: false, calleeClean: false }); // 8c766e: call 0x946464
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8c7673: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8c7676: test eax, eax
        if (!R.zf) { pc = 0x8c75e0; continue; } // 8c7678: jne 0x8c75e0
        pc = 0x8c767e; continue;
      case 0x8c767e:
        R.edi = (R.pop()) | 0; // 8c767e: pop edi
        R.eax = (0x1) | 0; // 8c767f: mov eax, 1
        R.esi = (R.pop()) | 0; // 8c7684: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x210, 32)) | 0; // 8c7685: add esp, 0x210
        return R.eax; // 8c768b: ret 0xc
      default: throw new Error(`f_8c7560: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
