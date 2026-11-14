// 0x844780 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 417c10=2tc, 4b02e0=2, 4cf5f0=2tc, 53b900=1, 53d980=3, 53dba0=4, 5407e0=3, 5409b0=1, 547810=2, 547840=2, 547d30=2, 547d60=2, 597db0=1tc, 5986b0=0t, 5a0590=1tc, 7c6830=4tc, 85e410=0t, 864550=6cf, 8cca10=2tc
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';
import { ROT } from './x86';

const RO_8468b8_1u = [0x0, 0x0, 0x0, 0x4, 0x1, 0x2, 0x2, 0x3, 0x3, 0x4, 0x4, 0x1, 0x2, 0x2, 0x8b, 0xff, 0xfb, 0x5a, 0x84, 0x0, 0xfb, 0x5a, 0x84, 0x0, 0xfb, 0x5a, 0x84, 0x0, 0xf3, 0x5a, 0x84, 0x0, 0x3, 0x5b, 0x84, 0x0, 0xb, 0x5b, 0x84, 0x0, 0xb, 0x5b, 0x84, 0x0, 0xb, 0x5b, 0x84, 0x0, 0xb, 0x5b, 0x84, 0x0, 0x13, 0x5b, 0x84, 0x0, 0xf3, 0x5a, 0x84, 0x0, 0x3, 0x5b, 0x84, 0x0, 0xb, 0x5b, 0x84, 0x0, 0xb, 0x5b, 0x84, 0x0, 0xc3, 0x5f, 0x84, 0x0, 0xb0, 0x5f, 0x84, 0x0, 0xdb, 0x5f, 0x84, 0x0, 0x8a, 0x5f, 0x84, 0x0, 0x64, 0x5f, 0x84, 0x0, 0x90, 0x90, 0x90, 0x90, 0x90, 0x90, 0x90, 0x90, 0x90, 0x90, 0x90, 0x90, 0x55, 0x8b, 0xec, 0x83, 0xe4, 0xf8, 0x6a, 0xff, 0x68, 0x68, 0x25, 0x96, 0x0, 0x64, 0xa1, 0x0, 0x0, 0x0, 0x0, 0x50, 0x64, 0x89, 0x25, 0x0, 0x0, 0x0, 0x0, 0x81, 0xec, 0xe4, 0x0, 0x0, 0x0, 0x53, 0x89, 0x4c, 0x24, 0x1c, 0x56, 0x33, 0xdb, 0x57, 0x8d, 0x8c, 0x24, 0x98, 0x0, 0x0, 0x0, 0x88, 0x5c, 0x24, 0x57, 0x89, 0x9c, 0x24, 0x80, 0x0, 0x0, 0x0, 0x89, 0x5c, 0x24, 0x78, 0xe8, 0xab, 0x37, 0xd0, 0xff, 0x8d, 0x8c, 0x24, 0x90, 0x0, 0x0, 0x0, 0x89, 0x9c, 0x24, 0xf8, 0x0, 0x0, 0x0, 0xe8, 0x98, 0x37, 0xd0, 0xff, 0x8b, 0x45, 0x1c, 0xc6, 0x84, 0x24, 0xf8, 0x0, 0x0, 0x0, 0x1, 0x3b, 0xc3, 0x89, 0x9c, 0x24, 0x84, 0x0, 0x0, 0x0, 0xc7, 0x84, 0x24, 0x88, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf0, 0x3f, 0x74, 0x2, 0x89, 0x18, 0x8b, 0x75, 0x8, 0x39, 0x5e, 0x61, 0xf, 0x84, 0xc9, 0x2, 0x0, 0x0, 0x8b, 0x45, 0xc, 0x39, 0x58, 0x53, 0xf, 0x84, 0xbd, 0x2, 0x0, 0x0, 0x39, 0x5e, 0x1a, 0xf, 0x84];

export function f_844780(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x844780;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x844780:
        R.push((R.ebp >>> 0)); // 844780: push ebp
        R.ebp = ((R.esp >>> 0)) | 0; // 844781: mov ebp, esp
        R.esp = (R.logic((R.esp >>> 0) & 0xfffffff8, 32)) | 0; // 844783: and esp, 0xfffffff8
        R.push(0xffffffff); // 844786: push -1
        R.push(0x96253b); // 844788: push 0x96253b
        R.eax = (0) | 0; // 84478d: mov eax, dword ptr fs:[0]
        R.push((R.eax >>> 0)); // 844793: push eax
        /* fs */ // 844794: mov dword ptr fs:[0], esp
        R.esp = (R.sub((R.esp >>> 0), 0x2d4, 32)) | 0; // 84479b: sub esp, 0x2d4
        R.eax = (R.m.u32(((R.ebp + 0x18) | 0) >>> 0)) | 0; // 8447a1: mov eax, dword ptr [ebp + 0x18]
        R.push((R.ebx >>> 0)); // 8447a4: push ebx
        R.ebx = (R.logic((R.ebx >>> 0) ^ (R.ebx >>> 0), 32)) | 0; // 8447a5: xor ebx, ebx
        R.push((R.esi >>> 0)); // 8447a7: push esi
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 8447a8: cmp eax, ebx
        R.push((R.edi >>> 0)); // 8447aa: push edi
        R.m.w32(((R.esp + 0x90) | 0) >>> 0, (R.ecx >>> 0)); // 8447ab: mov dword ptr [esp + 0x90], ecx
        R.m.w8(((R.esp + 0x47) | 0) >>> 0, 0x0); // 8447b2: mov byte ptr [esp + 0x47], 0
        R.m.w32(((R.esp + 0x78) | 0) >>> 0, (R.ebx >>> 0)); // 8447b7: mov dword ptr [esp + 0x78], ebx
        R.m.w32(((R.esp + 0x70) | 0) >>> 0, (R.ebx >>> 0)); // 8447bb: mov dword ptr [esp + 0x70], ebx
        R.m.w32(((R.esp + 0x7c) | 0) >>> 0, (R.ebx >>> 0)); // 8447bf: mov dword ptr [esp + 0x7c], ebx
        R.m.w32(((R.esp + 0x80) | 0) >>> 0, 0x3ff00000); // 8447c3: mov dword ptr [esp + 0x80], 0x3ff00000
        if (R.zf) { pc = 0x8447d2; continue; } // 8447ce: je 0x8447d2
        pc = 0x8447d0; continue;
      case 0x8447d0:
        R.m.w32(((R.eax) | 0) >>> 0, (R.ebx >>> 0)); // 8447d0: mov dword ptr [eax], ebx
        pc = 0x8447d2; continue;
      case 0x8447d2:
        R.edi = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 8447d2: mov edi, dword ptr [ebp + 8]
        R.sub(R.m.u32(((R.edi + 0x69) | 0) >>> 0), (R.ebx >>> 0), 32); // 8447d5: cmp dword ptr [edi + 0x69], ebx
        if (R.zf) { pc = 0x8467f1; continue; } // 8447d8: je 0x8467f1
        pc = 0x8447de; continue;
      case 0x8447de:
        R.eax = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 8447de: mov eax, dword ptr [ebp + 0xc]
        R.sub(R.m.u32(((R.eax + 0x53) | 0) >>> 0), (R.ebx >>> 0), 32); // 8447e1: cmp dword ptr [eax + 0x53], ebx
        if (R.zf) { pc = 0x8467f1; continue; } // 8447e4: je 0x8467f1
        pc = 0x8447ea; continue;
      case 0x8447ea:
        R.sub(R.m.u32(((R.edi + 0x1a) | 0) >>> 0), (R.ebx >>> 0), 32); // 8447ea: cmp dword ptr [edi + 0x1a], ebx
        if (R.zf) { pc = 0x8467f1; continue; } // 8447ed: je 0x8467f1
        pc = 0x8447f3; continue;
      case 0x8447f3:
        R.sub((R.edi >>> 0), (R.ebx >>> 0), 32); // 8447f3: cmp edi, ebx
        if (R.zf) { pc = 0x8448fb; continue; } // 8447f5: je 0x8448fb
        pc = 0x8447fb; continue;
      case 0x8447fb:
        R.push(0x1); // 8447fb: push 1
        R.ecx = (((R.esp + 0xf0) | 0)) | 0; // 8447fd: lea ecx, [esp + 0xf0]
        R.push(0x1f4); // 844804: push 0x1f4
        R.push((R.ecx >>> 0)); // 844809: push ecx
        R.push((R.edi >>> 0)); // 84480a: push edi
        R.call(0x53dba0, { n: 4, thisEcx: false, calleeClean: false }); // 84480b: call 0x53dba0
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 844810: add esp, 0x10
        R.esi = (0xa82620) | 0; // 844813: mov esi, 0xa82620
        R.eax = (((R.esp + 0xec) | 0)) | 0; // 844818: lea eax, [esp + 0xec]
        pc = 0x84481f; continue;
      case 0x84481f:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84481f: mov dl, byte ptr [eax]
        R.ecx = ((R.ecx & 0xffffff00) | (((((R.edx >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 844821: mov cl, dl
        R.sub(((R.edx >>> 0) & 0xff), R.m.u8(((R.esi) | 0) >>> 0), 8); // 844823: cmp dl, byte ptr [esi]
        if (!R.zf) { pc = 0x844843; continue; } // 844825: jne 0x844843
        pc = 0x844827; continue;
      case 0x844827:
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 844827: test cl, cl
        if (R.zf) { pc = 0x84483f; continue; } // 844829: je 0x84483f
        pc = 0x84482b; continue;
      case 0x84482b:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x1) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84482b: mov dl, byte ptr [eax + 1]
        R.ecx = ((R.ecx & 0xffffff00) | (((((R.edx >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 84482e: mov cl, dl
        R.sub(((R.edx >>> 0) & 0xff), R.m.u8(((R.esi + 0x1) | 0) >>> 0), 8); // 844830: cmp dl, byte ptr [esi + 1]
        if (!R.zf) { pc = 0x844843; continue; } // 844833: jne 0x844843
        pc = 0x844835; continue;
      case 0x844835:
        R.eax = (R.add((R.eax >>> 0), 0x2, 32)) | 0; // 844835: add eax, 2
        R.esi = (R.add((R.esi >>> 0), 0x2, 32)) | 0; // 844838: add esi, 2
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 84483b: test cl, cl
        if (!R.zf) { pc = 0x84481f; continue; } // 84483d: jne 0x84481f
        pc = 0x84483f; continue;
      case 0x84483f:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 84483f: xor eax, eax
        pc = 0x844848; continue; // 844841: jmp 0x844848
      case 0x844843:
        R.eax = (R.sub((R.eax >>> 0), (R.eax >>> 0), 32, R.cf ? 1 : 0)) | 0; // 844843: sbb eax, eax
        R.eax = (R.sub((R.eax >>> 0), 0xffffffff, 32, R.cf ? 1 : 0)) | 0; // 844845: sbb eax, -1
        pc = 0x844848; continue;
      case 0x844848:
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 844848: cmp eax, ebx
        if (R.zf) { pc = 0x8448f2; continue; } // 84484a: je 0x8448f2
        pc = 0x844850; continue;
      case 0x844850:
        R.push(0x1); // 844850: push 1
        R.eax = (((R.esp + 0xf0) | 0)) | 0; // 844852: lea eax, [esp + 0xf0]
        R.push(0x1f4); // 844859: push 0x1f4
        R.push((R.eax >>> 0)); // 84485e: push eax
        R.push((R.edi >>> 0)); // 84485f: push edi
        R.call(0x53dba0, { n: 4, thisEcx: false, calleeClean: false }); // 844860: call 0x53dba0
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 844865: add esp, 0x10
        R.esi = (0xa82614) | 0; // 844868: mov esi, 0xa82614
        R.eax = (((R.esp + 0xec) | 0)) | 0; // 84486d: lea eax, [esp + 0xec]
        pc = 0x844874; continue;
      case 0x844874:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax) | 0) >>> 0)) & 0xff) << 0)) | 0; // 844874: mov dl, byte ptr [eax]
        R.ecx = ((R.ecx & 0xffffff00) | (((((R.edx >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 844876: mov cl, dl
        R.sub(((R.edx >>> 0) & 0xff), R.m.u8(((R.esi) | 0) >>> 0), 8); // 844878: cmp dl, byte ptr [esi]
        if (!R.zf) { pc = 0x844898; continue; } // 84487a: jne 0x844898
        pc = 0x84487c; continue;
      case 0x84487c:
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 84487c: test cl, cl
        if (R.zf) { pc = 0x844894; continue; } // 84487e: je 0x844894
        pc = 0x844880; continue;
      case 0x844880:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x1) | 0) >>> 0)) & 0xff) << 0)) | 0; // 844880: mov dl, byte ptr [eax + 1]
        R.ecx = ((R.ecx & 0xffffff00) | (((((R.edx >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 844883: mov cl, dl
        R.sub(((R.edx >>> 0) & 0xff), R.m.u8(((R.esi + 0x1) | 0) >>> 0), 8); // 844885: cmp dl, byte ptr [esi + 1]
        if (!R.zf) { pc = 0x844898; continue; } // 844888: jne 0x844898
        pc = 0x84488a; continue;
      case 0x84488a:
        R.eax = (R.add((R.eax >>> 0), 0x2, 32)) | 0; // 84488a: add eax, 2
        R.esi = (R.add((R.esi >>> 0), 0x2, 32)) | 0; // 84488d: add esi, 2
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 844890: test cl, cl
        if (!R.zf) { pc = 0x844874; continue; } // 844892: jne 0x844874
        pc = 0x844894; continue;
      case 0x844894:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 844894: xor eax, eax
        pc = 0x84489d; continue; // 844896: jmp 0x84489d
      case 0x844898:
        R.eax = (R.sub((R.eax >>> 0), (R.eax >>> 0), 32, R.cf ? 1 : 0)) | 0; // 844898: sbb eax, eax
        R.eax = (R.sub((R.eax >>> 0), 0xffffffff, 32, R.cf ? 1 : 0)) | 0; // 84489a: sbb eax, -1
        pc = 0x84489d; continue;
      case 0x84489d:
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 84489d: cmp eax, ebx
        if (R.zf) { pc = 0x8448f2; continue; } // 84489f: je 0x8448f2
        pc = 0x8448a1; continue;
      case 0x8448a1:
        R.push(0x1); // 8448a1: push 1
        R.eax = (((R.esp + 0xf0) | 0)) | 0; // 8448a3: lea eax, [esp + 0xf0]
        R.push(0x1f4); // 8448aa: push 0x1f4
        R.push((R.eax >>> 0)); // 8448af: push eax
        R.push((R.edi >>> 0)); // 8448b0: push edi
        R.call(0x53dba0, { n: 4, thisEcx: false, calleeClean: false }); // 8448b1: call 0x53dba0
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 8448b6: add esp, 0x10
        R.esi = (0xa82604) | 0; // 8448b9: mov esi, 0xa82604
        R.eax = (((R.esp + 0xec) | 0)) | 0; // 8448be: lea eax, [esp + 0xec]
        pc = 0x8448c5; continue;
      case 0x8448c5:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8448c5: mov dl, byte ptr [eax]
        R.ecx = ((R.ecx & 0xffffff00) | (((((R.edx >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 8448c7: mov cl, dl
        R.sub(((R.edx >>> 0) & 0xff), R.m.u8(((R.esi) | 0) >>> 0), 8); // 8448c9: cmp dl, byte ptr [esi]
        if (!R.zf) { pc = 0x8448e9; continue; } // 8448cb: jne 0x8448e9
        pc = 0x8448cd; continue;
      case 0x8448cd:
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 8448cd: test cl, cl
        if (R.zf) { pc = 0x8448e5; continue; } // 8448cf: je 0x8448e5
        pc = 0x8448d1; continue;
      case 0x8448d1:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x1) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8448d1: mov dl, byte ptr [eax + 1]
        R.ecx = ((R.ecx & 0xffffff00) | (((((R.edx >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 8448d4: mov cl, dl
        R.sub(((R.edx >>> 0) & 0xff), R.m.u8(((R.esi + 0x1) | 0) >>> 0), 8); // 8448d6: cmp dl, byte ptr [esi + 1]
        if (!R.zf) { pc = 0x8448e9; continue; } // 8448d9: jne 0x8448e9
        pc = 0x8448db; continue;
      case 0x8448db:
        R.eax = (R.add((R.eax >>> 0), 0x2, 32)) | 0; // 8448db: add eax, 2
        R.esi = (R.add((R.esi >>> 0), 0x2, 32)) | 0; // 8448de: add esi, 2
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 8448e1: test cl, cl
        if (!R.zf) { pc = 0x8448c5; continue; } // 8448e3: jne 0x8448c5
        pc = 0x8448e5; continue;
      case 0x8448e5:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8448e5: xor eax, eax
        pc = 0x8448ee; continue; // 8448e7: jmp 0x8448ee
      case 0x8448e9:
        R.eax = (R.sub((R.eax >>> 0), (R.eax >>> 0), 32, R.cf ? 1 : 0)) | 0; // 8448e9: sbb eax, eax
        R.eax = (R.sub((R.eax >>> 0), 0xffffffff, 32, R.cf ? 1 : 0)) | 0; // 8448eb: sbb eax, -1
        pc = 0x8448ee; continue;
      case 0x8448ee:
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 8448ee: cmp eax, ebx
        if (!R.zf) { pc = 0x8448fb; continue; } // 8448f0: jne 0x8448fb
        pc = 0x8448f2; continue;
      case 0x8448f2:
        R.sub(R.m.u32(((R.edi + 0x39) | 0) >>> 0), (R.ebx >>> 0), 32); // 8448f2: cmp dword ptr [edi + 0x39], ebx
        if (!R.zf) { pc = 0x8467f1; continue; } // 8448f5: jne 0x8467f1
        pc = 0x8448fb; continue;
      case 0x8448fb:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.edi + 0x3d) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8448fb: mov cl, byte ptr [edi + 0x3d]
        R.sub(((R.ecx >>> 0) & 0xff), 0x11, 8); // 8448fe: cmp cl, 0x11
        if (R.zf) { pc = 0x8467f1; continue; } // 844901: je 0x8467f1
        pc = 0x844907; continue;
      case 0x844907:
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.edi + 0x28) | 0) >>> 0)) & 0xff) << 0)) | 0; // 844907: mov bl, byte ptr [edi + 0x28]
        R.sub(((R.ebx >>> 0) & 0xff), 0x11, 8); // 84490a: cmp bl, 0x11
        if (R.zf) { pc = 0x8467f1; continue; } // 84490d: je 0x8467f1
        pc = 0x844913; continue;
      case 0x844913:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebp + 0x14) | 0) >>> 0)) & 0xff) << 0)) | 0; // 844913: mov al, byte ptr [ebp + 0x14]
        R.sub(((R.eax >>> 0) & 0xff), 0x5, 8); // 844916: cmp al, 5
        if (R.zf) { pc = 0x84492d; continue; } // 844918: je 0x84492d
        pc = 0x84491a; continue;
      case 0x84491a:
        R.edx = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 84491a: mov edx, dword ptr [0xae2364]
        R.esi = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 844920: mov esi, dword ptr [edi]
        R.edx = (R.add((R.edx >>> 0), 0xfffffff0, 32)) | 0; // 844922: add edx, -0x10
        R.sub((R.esi >>> 0), (R.edx >>> 0), 32); // 844925: cmp esi, edx
        if (!R.cL) { pc = 0x8467f1; continue; } // 844927: jge 0x8467f1
        pc = 0x84492d; continue;
      case 0x84492d:
        R.edx = (R.m.u32(((R.edi + 0x24) | 0) >>> 0)) | 0; // 84492d: mov edx, dword ptr [edi + 0x24]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 844930: test edx, edx
        if (R.zf) { pc = 0x84493d; continue; } // 844932: je 0x84493d
        pc = 0x844934; continue;
      case 0x844934:
        R.sub(((R.ebx >>> 0) & 0xff), 0x5, 8); // 844934: cmp bl, 5
        if (R.zf) { pc = 0x8467f1; continue; } // 844937: je 0x8467f1
        pc = 0x84493d; continue;
      case 0x84493d:
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 84493d: test al, al
        if (R.zf) { pc = 0x8449e6; continue; } // 84493f: je 0x8449e6
        pc = 0x844945; continue;
      case 0x844945:
        R.sub(((R.eax >>> 0) & 0xff), 0x5, 8); // 844945: cmp al, 5
        if (R.zf) { pc = 0x84497d; continue; } // 844947: je 0x84497d
        pc = 0x844949; continue;
      case 0x844949:
        R.sub(((R.ecx >>> 0) & 0xff), 0x5, 8); // 844949: cmp cl, 5
        if (R.zf) { pc = 0x84495d; continue; } // 84494c: je 0x84495d
        pc = 0x84494e; continue;
      case 0x84494e:
        R.sub(((R.ecx >>> 0) & 0xff), 0xc, 8); // 84494e: cmp cl, 0xc
        if (R.zf) { pc = 0x84495d; continue; } // 844951: je 0x84495d
        pc = 0x844953; continue;
      case 0x844953:
        R.sub(((R.ebx >>> 0) & 0xff), 0x5, 8); // 844953: cmp bl, 5
        if (R.zf) { pc = 0x84495d; continue; } // 844956: je 0x84495d
        pc = 0x844958; continue;
      case 0x844958:
        R.sub(((R.ebx >>> 0) & 0xff), 0xc, 8); // 844958: cmp bl, 0xc
        if (!R.zf) { pc = 0x84497d; continue; } // 84495b: jne 0x84497d
        pc = 0x84495d; continue;
      case 0x84495d:
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 84495d: mov eax, dword ptr [ebp + 8]
        R.eax = (R.m.u32(((R.eax + 0x69) | 0) >>> 0)) | 0; // 844960: mov eax, dword ptr [eax + 0x69]
        R.sub(R.m.u16(((R.eax + 0xa) | 0) >>> 0), 0x109a, 16); // 844963: cmp word ptr [eax + 0xa], 0x109a
        if (!R.cLE) { pc = 0x8467f1; continue; } // 844969: jg 0x8467f1
        pc = 0x84496f; continue;
      case 0x84496f:
        R.sub(R.m.u16(((R.eax + 0x4) | 0) >>> 0), 0x64, 16); // 84496f: cmp word ptr [eax + 4], 0x64
        if (!R.cLE) { pc = 0x8467f1; continue; } // 844974: jg 0x8467f1
        pc = 0x84497a; continue;
      case 0x84497a:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebp + 0x14) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84497a: mov al, byte ptr [ebp + 0x14]
        pc = 0x84497d; continue;
      case 0x84497d:
        R.sub(((R.eax >>> 0) & 0xff), 0xa, 8); // 84497d: cmp al, 0xa
        if (!R.zf) { pc = 0x84498d; continue; } // 84497f: jne 0x84498d
        pc = 0x844981; continue;
      case 0x844981:
        R.sub(((R.ecx >>> 0) & 0xff), ((R.eax >>> 0) & 0xff), 8); // 844981: cmp cl, al
        if (R.zf) { pc = 0x84498d; continue; } // 844983: je 0x84498d
        pc = 0x844985; continue;
      case 0x844985:
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 844985: test cl, cl
        if (!R.zf) { pc = 0x8467f1; continue; } // 844987: jne 0x8467f1
        pc = 0x84498d; continue;
      case 0x84498d:
        R.sub(((R.ebx >>> 0) & 0xff), 0x5, 8); // 84498d: cmp bl, 5
        if (!R.zf) { pc = 0x84499a; continue; } // 844990: jne 0x84499a
        pc = 0x844992; continue;
      case 0x844992:
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 844992: test edx, edx
        if (!R.zf) { pc = 0x8467f1; continue; } // 844994: jne 0x8467f1
        pc = 0x84499a; continue;
      case 0x84499a:
        R.sub(((R.eax >>> 0) & 0xff), 0xf, 8); // 84499a: cmp al, 0xf
        if (R.zf) { pc = 0x8449c8; continue; } // 84499c: je 0x8449c8
        pc = 0x84499e; continue;
      case 0x84499e:
        R.sub(((R.eax >>> 0) & 0xff), 0xc, 8); // 84499e: cmp al, 0xc
        if (R.zf) { pc = 0x8449c8; continue; } // 8449a0: je 0x8449c8
        pc = 0x8449a2; continue;
      case 0x8449a2:
        R.sub(((R.eax >>> 0) & 0xff), 0x5, 8); // 8449a2: cmp al, 5
        if (R.zf) { pc = 0x8449c8; continue; } // 8449a4: je 0x8449c8
        pc = 0x8449a6; continue;
      case 0x8449a6:
        R.esi = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 8449a6: mov esi, dword ptr [ebp + 8]
        R.edx = (R.m.u32(((R.esi + 0x61) | 0) >>> 0)) | 0; // 8449a9: mov edx, dword ptr [esi + 0x61]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 8449ac: test edx, edx
        if (R.zf) { pc = 0x8449d0; continue; } // 8449ae: je 0x8449d0
        pc = 0x8449b0; continue;
      case 0x8449b0:
        R.sub(((R.ecx >>> 0) & 0xff), 0xb, 8); // 8449b0: cmp cl, 0xb
        if (!R.zf) { pc = 0x8449d0; continue; } // 8449b3: jne 0x8449d0
        pc = 0x8449b5; continue;
      case 0x8449b5:
        R.eax = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 8449b5: mov eax, dword ptr [esi + 0x39]
        R.edi = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 8449b8: mov edi, dword ptr [ebp + 0xc]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8449bb: test eax, eax
        if (R.zf) { pc = 0x8449d5; continue; } // 8449bd: je 0x8449d5
        pc = 0x8449bf; continue;
      case 0x8449bf:
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 8449bf: cmp edi, eax
        if (R.zf) { pc = 0x8449d5; continue; } // 8449c1: je 0x8449d5
        pc = 0x8449c3; continue;
      case 0x8449c3:
        pc = 0x8467f1; continue; // 8449c3: jmp 0x8467f1
      case 0x8449c8:
        R.edi = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 8449c8: mov edi, dword ptr [ebp + 0xc]
        R.esi = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 8449cb: mov esi, dword ptr [ebp + 8]
        pc = 0x8449d8; continue; // 8449ce: jmp 0x8449d8
      case 0x8449d0:
        R.edi = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 8449d0: mov edi, dword ptr [ebp + 0xc]
        pc = 0x8449d8; continue; // 8449d3: jmp 0x8449d8
      case 0x8449d5:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebp + 0x14) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8449d5: mov al, byte ptr [ebp + 0x14]
        pc = 0x8449d8; continue;
      case 0x8449d8:
        R.sub(((R.eax >>> 0) & 0xff), 0xa, 8); // 8449d8: cmp al, 0xa
        if (R.zf) { pc = 0x8449ec; continue; } // 8449da: je 0x8449ec
        pc = 0x8449dc; continue;
      case 0x8449dc:
        R.sub(((R.ecx >>> 0) & 0xff), 0xa, 8); // 8449dc: cmp cl, 0xa
        if (!R.zf) { pc = 0x8449ec; continue; } // 8449df: jne 0x8449ec
        pc = 0x8449e1; continue;
      case 0x8449e1:
        pc = 0x8467f1; continue; // 8449e1: jmp 0x8467f1
      case 0x8449e6:
        R.edi = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 8449e6: mov edi, dword ptr [ebp + 0xc]
        R.esi = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 8449e9: mov esi, dword ptr [ebp + 8]
        pc = 0x8449ec; continue;
      case 0x8449ec:
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 8449ec: test edi, edi
        if (R.zf) { pc = 0x844a87; continue; } // 8449ee: je 0x844a87
        pc = 0x8449f4; continue;
      case 0x8449f4:
        R.sub(((R.eax >>> 0) & 0xff), 0x5, 8); // 8449f4: cmp al, 5
        if (R.zf) { pc = 0x844a4e; continue; } // 8449f6: je 0x844a4e
        pc = 0x8449f8; continue;
      case 0x8449f8:
        R.sub(((R.ecx >>> 0) & 0xff), 0x5, 8); // 8449f8: cmp cl, 5
        if (R.zf) { pc = 0x844a0c; continue; } // 8449fb: je 0x844a0c
        pc = 0x8449fd; continue;
      case 0x8449fd:
        R.sub(((R.ecx >>> 0) & 0xff), 0xc, 8); // 8449fd: cmp cl, 0xc
        if (R.zf) { pc = 0x844a0c; continue; } // 844a00: je 0x844a0c
        pc = 0x844a02; continue;
      case 0x844a02:
        R.sub(((R.ebx >>> 0) & 0xff), 0x5, 8); // 844a02: cmp bl, 5
        if (R.zf) { pc = 0x844a0c; continue; } // 844a05: je 0x844a0c
        pc = 0x844a07; continue;
      case 0x844a07:
        R.sub(((R.ebx >>> 0) & 0xff), 0xc, 8); // 844a07: cmp bl, 0xc
        if (!R.zf) { pc = 0x844a4e; continue; } // 844a0a: jne 0x844a4e
        pc = 0x844a0c; continue;
      case 0x844a0c:
        R.eax = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 844a0c: mov eax, dword ptr [esi + 0x39]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 844a0f: test eax, eax
        if (R.zf) { pc = 0x844a4b; continue; } // 844a11: je 0x844a4b
        pc = 0x844a13; continue;
      case 0x844a13:
        R.edx = (R.m.u32(((R.edi + 0x57) | 0) >>> 0)) | 0; // 844a13: mov edx, dword ptr [edi + 0x57]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 844a16: test edx, edx
        if (R.zf) { pc = 0x844a2f; continue; } // 844a18: je 0x844a2f
        pc = 0x844a1a; continue;
      case 0x844a1a:
        R.ecx = (R.m.u32(((R.eax + 0x57) | 0) >>> 0)) | 0; // 844a1a: mov ecx, dword ptr [eax + 0x57]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 844a1d: test ecx, ecx
        if (R.zf) { pc = 0x844a2f; continue; } // 844a1f: je 0x844a2f
        pc = 0x844a21; continue;
      case 0x844a21:
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.ecx + 0x69) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 844a21: mov cx, word ptr [ecx + 0x69]
        R.sub(((R.ecx >>> 0) & 0xffff), R.m.u16(((R.edx + 0x69) | 0) >>> 0), 16); // 844a25: cmp cx, word ptr [edx + 0x69]
        if (!R.cL) { pc = 0x8467f1; continue; } // 844a29: jge 0x8467f1
        pc = 0x844a2f; continue;
      case 0x844a2f:
        R.edx = (((R.m.u16(((R.edi + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 844a2f: movsx edx, word ptr [edi + 0x80]
        R.eax = (((R.m.u16(((R.eax + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 844a36: movsx eax, word ptr [eax + 0x80]
        R.edx = (R.sub((R.edx >>> 0), 0x2ee, 32)) | 0; // 844a3d: sub edx, 0x2ee
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 844a43: cmp eax, edx
        if (!R.cLE) { pc = 0x8467f1; continue; } // 844a45: jg 0x8467f1
        pc = 0x844a4b; continue;
      case 0x844a4b:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebp + 0x14) | 0) >>> 0)) & 0xff) << 0)) | 0; // 844a4b: mov al, byte ptr [ebp + 0x14]
        pc = 0x844a4e; continue;
      case 0x844a4e:
        R.sub(R.m.u16(((R.edi + 0x80) | 0) >>> 0), 0xabe, 16); // 844a4e: cmp word ptr [edi + 0x80], 0xabe
        if (!R.cL) { pc = 0x844a87; continue; } // 844a57: jge 0x844a87
        pc = 0x844a59; continue;
      case 0x844a59:
        R.eax = (R.m.u32(((R.edi + 0x53) | 0) >>> 0)) | 0; // 844a59: mov eax, dword ptr [edi + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 844a5c: test eax, eax
        if (R.zf) { pc = 0x844a84; continue; } // 844a5e: je 0x844a84
        pc = 0x844a60; continue;
      case 0x844a60:
        R.ecx = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 844a60: mov ecx, dword ptr [esi + 0x39]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 844a63: test ecx, ecx
        if (R.zf) { pc = 0x844a70; continue; } // 844a65: je 0x844a70
        pc = 0x844a67; continue;
      case 0x844a67:
        R.sub(R.m.u32(((R.ecx + 0x53) | 0) >>> 0), (R.eax >>> 0), 32); // 844a67: cmp dword ptr [ecx + 0x53], eax
        if (R.zf) { pc = 0x8467f1; continue; } // 844a6a: je 0x8467f1
        pc = 0x844a70; continue;
      case 0x844a70:
        R.push(0x1); // 844a70: push 1
        R.push((R.eax >>> 0)); // 844a72: push eax
        R.push((R.esi >>> 0)); // 844a73: push esi
        R.call(0x53d980, { n: 3, thisEcx: false, calleeClean: false }); // 844a74: call 0x53d980
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 844a79: add esp, 0xc
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 844a7c: test eax, eax
        if (!R.zf) { pc = 0x8467f1; continue; } // 844a7e: jne 0x8467f1
        pc = 0x844a84; continue;
      case 0x844a84:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebp + 0x14) | 0) >>> 0)) & 0xff) << 0)) | 0; // 844a84: mov al, byte ptr [ebp + 0x14]
        pc = 0x844a87; continue;
      case 0x844a87:
        R.sub(((R.eax >>> 0) & 0xff), 0x5, 8); // 844a87: cmp al, 5
        R.m.w32(((R.esp + 0x74) | 0) >>> 0, 0x3f800000); // 844a89: mov dword ptr [esp + 0x74], 0x3f800000
        if (R.zf) { pc = 0x844a97; continue; } // 844a91: je 0x844a97
        pc = 0x844a93; continue;
      case 0x844a93:
        R.sub(((R.eax >>> 0) & 0xff), 0xc, 8); // 844a93: cmp al, 0xc
        if (!R.zf) { pc = 0x844a9f; continue; } // 844a95: jne 0x844a9f
        pc = 0x844a97; continue;
      case 0x844a97:
        R.m.w32(((R.esp + 0x74) | 0) >>> 0, 0x0); // 844a97: mov dword ptr [esp + 0x74], 0
        pc = 0x844a9f; continue;
      case 0x844a9f:
        R.ecx = (((R.m.u8(((R.esi + 0x57) | 0) >>> 0)) << 24 >> 24)) | 0; // 844a9f: movsx ecx, byte ptr [esi + 0x57]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ecx >>> 0)); // 844aa3: mov dword ptr [esp + 0x1c], ecx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 844aa7: fild dword ptr [esp + 0x1c]
        R.edx = (((R.m.u8(((R.esi + 0x5b) | 0) >>> 0)) << 24 >> 24)) | 0; // 844aab: movsx edx, byte ptr [esi + 0x5b]
        R.fpush(R.st[0]); // 844aaf: fld st(0)
        R.st[0] = R.st[0] * 0.025; // 844ab1: fmul qword ptr [0x967878]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 844ab7: mov dword ptr [esp + 0x1c], edx
        R.st[0] = 1.4 - R.st[0]; // 844abb: fsubr qword ptr [0x968dc0]
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 844ac1: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 0.025; // 844ac5: fmul qword ptr [0x967878]
        R.st[1] = R.st[1] - R.st[0]; R.fpop(); // 844acb: fsubp st(1)
        R.m.wf32(((R.esp + 0x88) | 0) >>> 0, R.st[0]); R.fpop(); // 844acd: fstp dword ptr [esp + 0x88]
        R.fpush(R.st[0]); // 844ad4: fld st(0)
        R.st[0] = R.st[0] * 0.02; // 844ad6: fmul qword ptr [0x968a98]
        R.st[0] = R.st[0] + 0.8; // 844adc: fadd qword ptr [0x9689b0]
        R.m.wf32(((R.esp + 0x84) | 0) >>> 0, R.st[0]); R.fpop(); // 844ae2: fstp dword ptr [esp + 0x84]
        R.st[0] = R.st[0] * 0.05; // 844ae9: fmul qword ptr [0x967888]
        R.st[0] = R.st[0] + 0.5; // 844aef: fadd qword ptr [0x968968]
        R.m.wf32(((R.esp + 0x60) | 0) >>> 0, R.st[0]); // 844af5: fst dword ptr [esp + 0x60]
        R.st[0] = R.st[0] + R.f32(((R.esp + 0x84) | 0)); // 844af9: fadd dword ptr [esp + 0x84]
        R.st[0] = R.st[0] + R.f32(((R.esp + 0x88) | 0)); // 844b00: fadd dword ptr [esp + 0x88]
        R.st[0] = R.st[0] + R.f32(((R.esp + 0x74) | 0)); // 844b07: fadd dword ptr [esp + 0x74]
        R.st[0] = R.st[0] + 1.0; // 844b0b: fadd dword ptr [0x968e70]
        R.m.wf32(((R.esp + 0x8c) | 0) >>> 0, R.st[0]); // 844b11: fst dword ptr [esp + 0x8c]
        R.fcom(R.st[0], 0.0); R.fpop(); // 844b18: fcomp qword ptr [0x9689a0]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 844b1e: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 844b20: test ah, 0x41
        if (R.zf) { pc = 0x844b30; continue; } // 844b23: je 0x844b30
        pc = 0x844b25; continue;
      case 0x844b25:
        R.m.w32(((R.esp + 0x8c) | 0) >>> 0, 0x3f000000); // 844b25: mov dword ptr [esp + 0x8c], 0x3f000000
        pc = 0x844b30; continue;
      case 0x844b30:
        R.ebx = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 844b30: mov ebx, dword ptr [esi + 0x39]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x3d) | 0) >>> 0)) & 0xff) << 0)) | 0; // 844b33: mov al, byte ptr [esi + 0x3d]
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 844b36: test ebx, ebx
        R.m.w32(((R.esp + 0x48) | 0) >>> 0, (R.ebx >>> 0)); // 844b38: mov dword ptr [esp + 0x48], ebx
        R.m.w8(((R.esp + 0x13) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 844b3c: mov byte ptr [esp + 0x13], al
        if (R.zf) { pc = 0x844b4f; continue; } // 844b40: je 0x844b4f
        pc = 0x844b42; continue;
      case 0x844b42:
        R.push((R.edi >>> 0)); // 844b42: push edi
        R.call(0x53b900, { n: 1, thisEcx: false, calleeClean: false }); // 844b43: call 0x53b900
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 844b48: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 844b4b: test eax, eax
        if (R.zf) { pc = 0x844b67; continue; } // 844b4d: je 0x844b67
        pc = 0x844b4f; continue;
      case 0x844b4f:
        R.ecx = (R.m.u32(((R.esi + 0x24) | 0) >>> 0)) | 0; // 844b4f: mov ecx, dword ptr [esi + 0x24]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 844b52: test ecx, ecx
        if (R.zf) { pc = 0x844b67; continue; } // 844b54: je 0x844b67
        pc = 0x844b56; continue;
      case 0x844b56:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x28) | 0) >>> 0)) & 0xff) << 0)) | 0; // 844b56: mov al, byte ptr [esi + 0x28]
        R.sub(((R.eax >>> 0) & 0xff), 0xb, 8); // 844b59: cmp al, 0xb
        if (R.zf) { pc = 0x844b67; continue; } // 844b5b: je 0x844b67
        pc = 0x844b5d; continue;
      case 0x844b5d:
        R.ebx = ((R.ecx >>> 0)) | 0; // 844b5d: mov ebx, ecx
        R.m.w8(((R.esp + 0x13) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 844b5f: mov byte ptr [esp + 0x13], al
        R.m.w32(((R.esp + 0x48) | 0) >>> 0, (R.ebx >>> 0)); // 844b63: mov dword ptr [esp + 0x48], ebx
        pc = 0x844b67; continue;
      case 0x844b67:
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 844b67: test ebx, ebx
        if (R.zf) { pc = 0x844b8f; continue; } // 844b69: je 0x844b8f
        pc = 0x844b6b; continue;
      case 0x844b6b:
        R.eax = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 844b6b: mov eax, dword ptr [ebx + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 844b6e: test eax, eax
        if (!R.zf) { pc = 0x844b8f; continue; } // 844b70: jne 0x844b8f
        pc = 0x844b72; continue;
      case 0x844b72:
        R.fpush(3.5); // 844b72: fld qword ptr [0x968e38]
        R.ecx = (R.m.u32(((R.esp + 0x2e0) | 0) >>> 0)) | 0; // 844b78: mov ecx, dword ptr [esp + 0x2e0]
        /* fs */ // 844b7f: mov dword ptr fs:[0], ecx
        R.edi = (R.pop()) | 0; // 844b86: pop edi
        R.esi = (R.pop()) | 0; // 844b87: pop esi
        R.ebx = (R.pop()) | 0; // 844b88: pop ebx
        R.esp = ((R.ebp >>> 0)) | 0; // 844b89: mov esp, ebp
        R.ebp = (R.pop()) | 0; // 844b8b: pop ebp
        return R.st[0]; // 844b8c: ret 0x14
      case 0x844b8f:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 844b8f: mov ecx, dword ptr [0xae1050]
        R.push((R.ebx >>> 0)); // 844b95: push ebx
        R.push((R.esi >>> 0)); // 844b96: push esi
        R.call(0x4cf5f0, { n: 2, thisEcx: true, calleeClean: true }); // 844b97: call 0x4cf5f0
        R.sub((R.edi >>> 0), (R.ebx >>> 0), 32); // 844b9c: cmp edi, ebx
        R.m.w32(((R.esp + 0x58) | 0) >>> 0, (R.eax >>> 0)); // 844b9e: mov dword ptr [esp + 0x58], eax
        if (R.zf) { pc = 0x844d24; continue; } // 844ba2: je 0x844d24
        pc = 0x844ba8; continue;
      case 0x844ba8:
        R.esi = ((R.eax >>> 0)) | 0; // 844ba8: mov esi, eax
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 844baa: test esi, esi
        if (R.zf) { pc = 0x844bd4; continue; } // 844bac: je 0x844bd4
        pc = 0x844bae; continue;
      case 0x844bae:
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 844bae: test ebx, ebx
        if (R.zf) { pc = 0x844bd4; continue; } // 844bb0: je 0x844bd4
        pc = 0x844bb2; continue;
      case 0x844bb2:
        R.ecx = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 844bb2: mov ecx, dword ptr [ebx + 0x53]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 844bb5: test ecx, ecx
        if (R.zf) { pc = 0x844bd4; continue; } // 844bb7: je 0x844bd4
        pc = 0x844bb9; continue;
      case 0x844bb9:
        R.eax = (R.m.u32(((R.edi + 0x53) | 0) >>> 0)) | 0; // 844bb9: mov eax, dword ptr [edi + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 844bbc: test eax, eax
        if (R.zf) { pc = 0x844bd4; continue; } // 844bbe: je 0x844bd4
        pc = 0x844bc0; continue;
      case 0x844bc0:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x77) | 0) >>> 0)) & 0xff) << 0)) | 0; // 844bc0: mov dl, byte ptr [eax + 0x77]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + 0x77) | 0) >>> 0)) & 0xff) << 0)) | 0; // 844bc3: mov al, byte ptr [ecx + 0x77]
        R.sub(((R.edx >>> 0) & 0xff), ((R.eax >>> 0) & 0xff), 8); // 844bc6: cmp dl, al
        if (!R.zf) { pc = 0x844bd4; continue; } // 844bc8: jne 0x844bd4
        pc = 0x844bca; continue;
      case 0x844bca:
        R.logic(R.m.u8(((R.esi + 0x45) | 0) >>> 0) & 0x20, 8); // 844bca: test byte ptr [esi + 0x45], 0x20
        if (!R.zf) { pc = 0x8467f1; continue; } // 844bce: jne 0x8467f1
        pc = 0x844bd4; continue;
      case 0x844bd4:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebp + 0x14) | 0) >>> 0)) & 0xff) << 0)) | 0; // 844bd4: mov al, byte ptr [ebp + 0x14]
        R.sub(((R.eax >>> 0) & 0xff), 0x5, 8); // 844bd7: cmp al, 5
        if (R.zf) { pc = 0x844bf1; continue; } // 844bd9: je 0x844bf1
        pc = 0x844bdb; continue;
      case 0x844bdb:
        R.sub(((R.eax >>> 0) & 0xff), 0xc, 8); // 844bdb: cmp al, 0xc
        if (R.zf) { pc = 0x844bf1; continue; } // 844bdd: je 0x844bf1
        pc = 0x844bdf; continue;
      case 0x844bdf:
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, 0x0); // 844bdf: mov dword ptr [esp + 0x14], 0
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, 0x3ff80000); // 844be7: mov dword ptr [esp + 0x18], 0x3ff80000
        pc = 0x844c01; continue; // 844bef: jmp 0x844c01
      case 0x844bf1:
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, 0x0); // 844bf1: mov dword ptr [esp + 0x14], 0
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, 0x40020000); // 844bf9: mov dword ptr [esp + 0x18], 0x40020000
        pc = 0x844c01; continue;
      case 0x844c01:
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 844c01: test ebx, ebx
        if (!R.zf) { pc = 0x844d34; continue; } // 844c03: jne 0x844d34
        pc = 0x844c09; continue;
      case 0x844c09:
        R.edi = (R.m.u32(((0xdd6ec8) | 0) >>> 0)) | 0; // 844c09: mov edi, dword ptr [0xdd6ec8]
        R.eax = (R.m.u32(((0xdd6ecc) | 0) >>> 0)) | 0; // 844c0f: mov eax, dword ptr [0xdd6ecc]
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 844c14: mov cx, word ptr [0xae2c92]
        R.edx = ((R.edi >>> 0)) | 0; // 844c1b: mov edx, edi
        R.m.w32(((R.esp + 0x64) | 0) >>> 0, (R.edx >>> 0)); // 844c1d: mov dword ptr [esp + 0x64], edx
        R.m.w32(((R.esp + 0x68) | 0) >>> 0, (R.eax >>> 0)); // 844c21: mov dword ptr [esp + 0x68], eax
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.esp + 0x66) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 844c25: mov ax, word ptr [esp + 0x66]
        R.sub(((R.eax >>> 0) & 0xffff), ((R.ecx >>> 0) & 0xffff), 16); // 844c2a: cmp ax, cx
        if (!R.cBE) { pc = 0x844d34; continue; } // 844c2d: ja 0x844d34
        pc = 0x844c33; continue;
      case 0x844c33:
        if (R.cf) { pc = 0x844c49; continue; } // 844c33: jb 0x844c49
        pc = 0x844c35; continue;
      case 0x844c35:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 844c35: xor eax, eax
        R.sub(((R.edx >>> 0) & 0xffff), R.m.u16(((0xae2c90) | 0) >>> 0), 16); // 844c37: cmp dx, word ptr [0xae2c90]
        R.eax = ((R.eax & 0xffffff00) | (((!R.cLE ? 1 : 0) & 0xff) << 0)) | 0; // 844c3e: setg al
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 844c41: test eax, eax
        if (!R.zf) { pc = 0x844d34; continue; } // 844c43: jne 0x844d34
        pc = 0x844c49; continue;
      case 0x844c49:
        R.edx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 844c49: mov edx, dword ptr [ebp + 8]
        R.esi = ((R.esi & 0xffff0000) | (((R.m.u16(((0xdd6eca) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 844c4c: mov si, word ptr [0xdd6eca]
        R.eax = (R.m.u32(((R.edx + 0x3e) | 0) >>> 0)) | 0; // 844c53: mov eax, dword ptr [edx + 0x3e]
        R.m.w32(((R.esp + 0x64) | 0) >>> 0, (R.eax >>> 0)); // 844c56: mov dword ptr [esp + 0x64], eax
        R.eax = (R.m.u32(((R.edx + 0x42) | 0) >>> 0)) | 0; // 844c5a: mov eax, dword ptr [edx + 0x42]
        R.m.w32(((R.esp + 0x68) | 0) >>> 0, (R.eax >>> 0)); // 844c5d: mov dword ptr [esp + 0x68], eax
        R.eax = (R.m.u32(((R.edx + 0x3e) | 0) >>> 0)) | 0; // 844c61: mov eax, dword ptr [edx + 0x3e]
        R.edx = (R.m.u32(((R.edx + 0x42) | 0) >>> 0)) | 0; // 844c64: mov edx, dword ptr [edx + 0x42]
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.eax >>> 0)); // 844c67: mov dword ptr [esp + 0x34], eax
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edx >>> 0)); // 844c6b: mov dword ptr [esp + 0x38], edx
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.esp + 0x36) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 844c6f: mov dx, word ptr [esp + 0x36]
        R.sub(((R.edx >>> 0) & 0xffff), ((R.esi >>> 0) & 0xffff), 16); // 844c74: cmp dx, si
        if (R.cf) { pc = 0x844c89; continue; } // 844c77: jb 0x844c89
        pc = 0x844c79; continue;
      case 0x844c79:
        if (!R.cBE) { pc = 0x844ca6; continue; } // 844c79: ja 0x844ca6
        pc = 0x844c7b; continue;
      case 0x844c7b:
        R.edx = (R.logic((R.edx >>> 0) ^ (R.edx >>> 0), 32)) | 0; // 844c7b: xor edx, edx
        R.sub(((R.eax >>> 0) & 0xffff), ((R.edi >>> 0) & 0xffff), 16); // 844c7d: cmp ax, di
        R.edx = ((R.edx & 0xffffff00) | (((R.cL ? 1 : 0) & 0xff) << 0)) | 0; // 844c80: setl dl
        R.eax = ((R.edx >>> 0)) | 0; // 844c83: mov eax, edx
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 844c85: test eax, eax
        if (R.zf) { pc = 0x844ca6; continue; } // 844c87: je 0x844ca6
        pc = 0x844c89; continue;
      case 0x844c89:
        R.eax = (((R.esp + 0x94) | 0)) | 0; // 844c89: lea eax, [esp + 0x94]
        R.push(0xdd6ec8); // 844c90: push 0xdd6ec8
        R.push((R.eax >>> 0)); // 844c95: push eax
        R.ecx = (((R.esp + 0x6c) | 0)) | 0; // 844c96: lea ecx, [esp + 0x6c]
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 844c9a: call 0x417c10
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 844c9f: mov cx, word ptr [0xae2c92]
        pc = 0x844ca6; continue;
      case 0x844ca6:
        R.edx = (R.m.u32(((R.esp + 0x66) | 0) >>> 0)) | 0; // 844ca6: mov edx, dword ptr [esp + 0x66]
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 844caa: xor eax, eax
        R.edx = (R.logic((R.edx >>> 0) & 0xffff, 32)) | 0; // 844cac: and edx, 0xffff
        R.eax = ((R.eax & 0xffff0000) | (((((R.ecx >>> 0) & 0xffff)) & 0xffff) << 0)) | 0; // 844cb2: mov ax, cx
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 844cb5: sub eax, edx
        R.edx = (((R.m.u16(((R.esp + 0x64) | 0) >>> 0)) << 16 >> 16)) | 0; // 844cb7: movsx edx, word ptr [esp + 0x64]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 844cbc: lea ecx, [eax + eax*8]
        R.eax = (((R.eax + R.ecx * 8) | 0)) | 0; // 844cbf: lea eax, [eax + ecx*8]
        R.ecx = (((R.m.u16(((0xae2c90) | 0) >>> 0)) << 16 >> 16)) | 0; // 844cc2: movsx ecx, word ptr [0xae2c90]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 844cc9: lea eax, [eax + eax*4]
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 844ccc: sub eax, edx
        R.eax = (R.add((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 844cce: add eax, ecx
        R.sub((R.eax >>> 0), 0x1f4, 32); // 844cd0: cmp eax, 0x1f4
        if (R.cLE) { pc = 0x844cdc; continue; } // 844cd5: jle 0x844cdc
        pc = 0x844cd7; continue;
      case 0x844cd7:
        R.eax = (0x1f4) | 0; // 844cd7: mov eax, 0x1f4
        pc = 0x844cdc; continue;
      case 0x844cdc:
        R.edx = ((R.eax >>> 0)) | 0; // 844cdc: mov edx, eax
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.edx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.edx = (Number(BigInt.asIntN(32, p))) | 0; } // 844cde: imul edx, eax
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 844ce1: mov eax, dword ptr [ebp + 8]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 844ce4: mov dword ptr [esp + 0x1c], edx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 844ce8: fild dword ptr [esp + 0x1c]
        R.ecx = (R.m.u32(((R.eax + 0x69) | 0) >>> 0)) | 0; // 844cec: mov ecx, dword ptr [eax + 0x69]
        R.edx = (((R.m.u16(((R.ecx + 0xa) | 0) >>> 0)) << 16 >> 16)) | 0; // 844cef: movsx edx, word ptr [ecx + 0xa]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 844cf3: mov dword ptr [esp + 0x1c], edx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 844cf7: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] + 900.0; // 844cfb: fadd qword ptr [0x96f958]
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 844d01: fdivp st(1)
        R.fpush(12.0); // 844d03: fld qword ptr [0x96d6a0]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 844d09: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 844d0b: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 844d0d: test ah, 1
        if (R.zf) { pc = 0x844d1a; continue; } // 844d10: je 0x844d1a
        pc = 0x844d12; continue;
      case 0x844d12:
        R.fpop(); // 844d12: fstp st(0)
        R.fpush(12.0); // 844d14: fld qword ptr [0x96d6a0]
        pc = 0x844d1a; continue;
      case 0x844d1a:
        R.st[0] = R.st[0] + R.f64(((R.esp + 0x14) | 0)); // 844d1a: fadd qword ptr [esp + 0x14]
        R.m.wf64(((R.esp + 0x14) | 0) >>> 0, R.st[0]); R.fpop(); // 844d1e: fstp qword ptr [esp + 0x14]
        pc = 0x844d34; continue; // 844d22: jmp 0x844d34
      case 0x844d24:
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, 0x0); // 844d24: mov dword ptr [esp + 0x14], 0
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, 0x400c0000); // 844d2c: mov dword ptr [esp + 0x18], 0x400c0000
        pc = 0x844d34; continue;
      case 0x844d34:
        R.eax = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 844d34: mov eax, dword ptr [ebp + 0xc]
        R.ecx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 844d37: mov ecx, dword ptr [ebp + 8]
        R.push((R.eax >>> 0)); // 844d3a: push eax
        R.push((R.ecx >>> 0)); // 844d3b: push ecx
        R.call(0x547d30, { n: 2, thisEcx: false, calleeClean: false }); // 844d3c: call 0x547d30
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 844d41: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 844d44: test eax, eax
        if (R.zf) { pc = 0x844d65; continue; } // 844d46: je 0x844d65
        pc = 0x844d48; continue;
      case 0x844d48:
        R.fpush(R.f64(((R.esp + 0x14) | 0))); // 844d48: fld qword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.33; // 844d4c: fmul qword ptr [0x968f78]
        R.esi = (R.m.u32(((R.ebp + 0x18) | 0) >>> 0)) | 0; // 844d52: mov esi, dword ptr [ebp + 0x18]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 844d55: test esi, esi
        R.m.wf64(((R.esp + 0x14) | 0) >>> 0, R.st[0]); R.fpop(); // 844d57: fstp qword ptr [esp + 0x14]
        if (R.zf) { pc = 0x844d68; continue; } // 844d5b: je 0x844d68
        pc = 0x844d5d; continue;
      case 0x844d5d:
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 844d5d: mov eax, dword ptr [esi]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) | 0x2, 8)) & 0xff) << 0)) | 0; // 844d5f: or al, 2
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 844d61: mov dword ptr [esi], eax
        pc = 0x844d68; continue; // 844d63: jmp 0x844d68
      case 0x844d65:
        R.esi = (R.m.u32(((R.ebp + 0x18) | 0) >>> 0)) | 0; // 844d65: mov esi, dword ptr [ebp + 0x18]
        pc = 0x844d68; continue;
      case 0x844d68:
        R.edi = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 844d68: mov edi, dword ptr [ebp + 8]
        R.push((R.ebx >>> 0)); // 844d6b: push ebx
        R.push((R.edi >>> 0)); // 844d6c: push edi
        R.call(0x547d30, { n: 2, thisEcx: false, calleeClean: false }); // 844d6d: call 0x547d30
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 844d72: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 844d75: test eax, eax
        if (R.zf) { pc = 0x844d8d; continue; } // 844d77: je 0x844d8d
        pc = 0x844d79; continue;
      case 0x844d79:
        R.fpush(R.f64(((R.esp + 0x14) | 0))); // 844d79: fld qword ptr [esp + 0x14]
        R.st[0] = R.st[0] + R.st[0]; // 844d7d: fadd st(0), st(0)
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 844d7f: test esi, esi
        R.m.wf64(((R.esp + 0x14) | 0) >>> 0, R.st[0]); R.fpop(); // 844d81: fstp qword ptr [esp + 0x14]
        if (R.zf) { pc = 0x844d8d; continue; } // 844d85: je 0x844d8d
        pc = 0x844d87; continue;
      case 0x844d87:
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 844d87: mov eax, dword ptr [esi]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) | 0x4, 8)) & 0xff) << 0)) | 0; // 844d89: or al, 4
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 844d8b: mov dword ptr [esi], eax
        pc = 0x844d8d; continue;
      case 0x844d8d:
        R.push((R.ebx >>> 0)); // 844d8d: push ebx
        R.push((R.edi >>> 0)); // 844d8e: push edi
        R.call(0x547d60, { n: 2, thisEcx: false, calleeClean: false }); // 844d8f: call 0x547d60
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 844d94: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 844d97: test eax, eax
        if (R.zf) { pc = 0x844de0; continue; } // 844d99: je 0x844de0
        pc = 0x844d9b; continue;
      case 0x844d9b:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebx + 0x64) | 0) >>> 0)) & 0xff) << 0)) | 0; // 844d9b: mov al, byte ptr [ebx + 0x64]
        R.edi = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 844d9e: mov edi, dword ptr [ebp + 0xc]
        R.sub(((R.eax >>> 0) & 0xff), 0x1, 8); // 844da1: cmp al, 1
        if (R.zf) { pc = 0x844db7; continue; } // 844da3: je 0x844db7
        pc = 0x844da5; continue;
      case 0x844da5:
        R.sub(R.m.u8(((R.edi + 0x64) | 0) >>> 0), 0x1, 8); // 844da5: cmp byte ptr [edi + 0x64], 1
        if (!R.zf) { pc = 0x844db7; continue; } // 844da9: jne 0x844db7
        pc = 0x844dab; continue;
      case 0x844dab:
        R.fpush(R.f64(((R.esp + 0x14) | 0))); // 844dab: fld qword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.85; // 844daf: fmul qword ptr [0x969520]
        pc = 0x844dc1; continue; // 844db5: jmp 0x844dc1
      case 0x844db7:
        R.fpush(R.f64(((R.esp + 0x14) | 0))); // 844db7: fld qword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.5; // 844dbb: fmul qword ptr [0x968968]
        pc = 0x844dc1; continue;
      case 0x844dc1:
        R.m.wf64(((R.esp + 0x14) | 0) >>> 0, R.st[0]); R.fpop(); // 844dc1: fstp qword ptr [esp + 0x14]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 844dc5: test esi, esi
        if (R.zf) { pc = 0x844de3; continue; } // 844dc7: je 0x844de3
        pc = 0x844dc9; continue;
      case 0x844dc9:
        R.eax = (R.m.u32(((R.esp + 0x58) | 0) >>> 0)) | 0; // 844dc9: mov eax, dword ptr [esp + 0x58]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 844dcd: test eax, eax
        if (R.zf) { pc = 0x844de3; continue; } // 844dcf: je 0x844de3
        pc = 0x844dd1; continue;
      case 0x844dd1:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + 0x49) | 0) >>> 0)) & 0xff) << 0)) | 0; // 844dd1: mov cl, byte ptr [eax + 0x49]
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 844dd4: test cl, cl
        if (!R.zf) { pc = 0x844de3; continue; } // 844dd6: jne 0x844de3
        pc = 0x844dd8; continue;
      case 0x844dd8:
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 844dd8: mov eax, dword ptr [esi]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) | 0x8, 8)) & 0xff) << 0)) | 0; // 844dda: or al, 8
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 844ddc: mov dword ptr [esi], eax
        pc = 0x844de3; continue; // 844dde: jmp 0x844de3
      case 0x844de0:
        R.edi = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 844de0: mov edi, dword ptr [ebp + 0xc]
        pc = 0x844de3; continue;
      case 0x844de3:
        R.edx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 844de3: mov edx, dword ptr [ebp + 8]
        R.push((R.edi >>> 0)); // 844de6: push edi
        R.push((R.edx >>> 0)); // 844de7: push edx
        R.call(0x547d60, { n: 2, thisEcx: false, calleeClean: false }); // 844de8: call 0x547d60
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 844ded: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 844df0: test eax, eax
        if (R.zf) { pc = 0x844e0e; continue; } // 844df2: je 0x844e0e
        pc = 0x844df4; continue;
      case 0x844df4:
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 844df4: test esi, esi
        if (R.zf) { pc = 0x844dfe; continue; } // 844df6: je 0x844dfe
        pc = 0x844df8; continue;
      case 0x844df8:
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 844df8: mov eax, dword ptr [esi]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) | 0x10, 8)) & 0xff) << 0)) | 0; // 844dfa: or al, 0x10
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 844dfc: mov dword ptr [esi], eax
        pc = 0x844dfe; continue;
      case 0x844dfe:
        R.fpush(R.f64(((R.esp + 0x14) | 0))); // 844dfe: fld qword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 3.0; // 844e02: fmul qword ptr [0x968930]
        R.m.wf64(((R.esp + 0x14) | 0) >>> 0, R.st[0]); // 844e08: fst qword ptr [esp + 0x14]
        pc = 0x844e12; continue; // 844e0c: jmp 0x844e12
      case 0x844e0e:
        R.fpush(R.f64(((R.esp + 0x14) | 0))); // 844e0e: fld qword ptr [esp + 0x14]
        pc = 0x844e12; continue;
      case 0x844e12:
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 844e12: test ebx, ebx
        if (R.zf) { pc = 0x844fca; continue; } // 844e14: je 0x844fca
        pc = 0x844e1a; continue;
      case 0x844e1a:
        R.sub((R.ebx >>> 0), (R.edi >>> 0), 32); // 844e1a: cmp ebx, edi
        if (R.zf) { pc = 0x844f81; continue; } // 844e1c: je 0x844f81
        pc = 0x844e22; continue;
      case 0x844e22:
        R.sub((R.edi >>> 0), R.m.u32(((R.ebx + 0xb3) | 0) >>> 0), 32); // 844e22: cmp edi, dword ptr [ebx + 0xb3]
        if (R.zf) { pc = 0x844e52; continue; } // 844e28: je 0x844e52
        pc = 0x844e2a; continue;
      case 0x844e2a:
        R.sub((R.edi >>> 0), R.m.u32(((R.ebx + 0xb7) | 0) >>> 0), 32); // 844e2a: cmp edi, dword ptr [ebx + 0xb7]
        if (R.zf) { pc = 0x844e52; continue; } // 844e30: je 0x844e52
        pc = 0x844e32; continue;
      case 0x844e32:
        R.sub((R.edi >>> 0), R.m.u32(((R.ebx + 0xbb) | 0) >>> 0), 32); // 844e32: cmp edi, dword ptr [ebx + 0xbb]
        if (R.zf) { pc = 0x844e52; continue; } // 844e38: je 0x844e52
        pc = 0x844e3a; continue;
      case 0x844e3a:
        R.push((R.ebx >>> 0)); // 844e3a: push ebx
        R.push((R.edi >>> 0)); // 844e3b: push edi
        R.fpop(); // 844e3c: fstp st(0)
        R.call(0x4b02e0, { n: 2, thisEcx: false, calleeClean: false }); // 844e3e: call 0x4b02e0
        R.fpush(R.f64(((R.esp + 0x1c) | 0))); // 844e43: fld qword ptr [esp + 0x1c]
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 844e47: add esp, 8
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 844e4a: test al, al
        if (R.zf) { pc = 0x844f81; continue; } // 844e4c: je 0x844f81
        pc = 0x844e52; continue;
      case 0x844e52:
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 844e52: mov eax, dword ptr [edi]
        R.ecx = (R.m.u32(((0x9d0118) | 0) >>> 0)) | 0; // 844e54: mov ecx, dword ptr [0x9d0118]
        R.edx = (R.m.u32(((0x9d011c) | 0) >>> 0)) | 0; // 844e5a: mov edx, dword ptr [0x9d011c]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 844e60: cmp eax, ecx
        if (R.zf) { pc = 0x844e68; continue; } // 844e62: je 0x844e68
        pc = 0x844e64; continue;
      case 0x844e64:
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 844e64: cmp eax, edx
        if (!R.zf) { pc = 0x844e7a; continue; } // 844e66: jne 0x844e7a
        pc = 0x844e68; continue;
      case 0x844e68:
        R.eax = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 844e68: mov eax, dword ptr [ebx]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 844e6a: cmp eax, ecx
        if (R.zf) { pc = 0x844f3d; continue; } // 844e6c: je 0x844f3d
        pc = 0x844e72; continue;
      case 0x844e72:
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 844e72: cmp eax, edx
        if (R.zf) { pc = 0x844f3d; continue; } // 844e74: je 0x844f3d
        pc = 0x844e7a; continue;
      case 0x844e7a:
        R.eax = (R.m.u32(((R.edi + 0x53) | 0) >>> 0)) | 0; // 844e7a: mov eax, dword ptr [edi + 0x53]
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 844e7d: mov ecx, dword ptr [eax]
        R.eax = (R.m.u32(((0x9cf360) | 0) >>> 0)) | 0; // 844e7f: mov eax, dword ptr [0x9cf360]
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 844e84: cmp ecx, eax
        if (!R.zf) { pc = 0x844ea8; continue; } // 844e86: jne 0x844ea8
        pc = 0x844e88; continue;
      case 0x844e88:
        R.edx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 844e88: mov edx, dword ptr [ebp + 8]
        R.eax = (((R.m.u8(((R.edx + 0x59) | 0) >>> 0)) << 24 >> 24)) | 0; // 844e8b: movsx eax, byte ptr [edx + 0x59]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 844e8f: mov dword ptr [esp + 0x1c], eax
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 844e93: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 0.016666666666666666; // 844e97: fmul qword ptr [0x968958]
        R.st[0] = 1.0 - R.st[0]; // 844e9d: fsubr qword ptr [0x967890]
        pc = 0x844f58; continue; // 844ea3: jmp 0x844f58
      case 0x844ea8:
        R.sub((R.edi >>> 0), R.m.u32(((R.ebx + 0xb3) | 0) >>> 0), 32); // 844ea8: cmp edi, dword ptr [ebx + 0xb3]
        if (R.zf) { pc = 0x844ec0; continue; } // 844eae: je 0x844ec0
        pc = 0x844eb0; continue;
      case 0x844eb0:
        R.sub((R.edi >>> 0), R.m.u32(((R.ebx + 0xb7) | 0) >>> 0), 32); // 844eb0: cmp edi, dword ptr [ebx + 0xb7]
        if (R.zf) { pc = 0x844ec0; continue; } // 844eb6: je 0x844ec0
        pc = 0x844eb8; continue;
      case 0x844eb8:
        R.sub((R.edi >>> 0), R.m.u32(((R.ebx + 0xbb) | 0) >>> 0), 32); // 844eb8: cmp edi, dword ptr [ebx + 0xbb]
        if (!R.zf) { pc = 0x844f20; continue; } // 844ebe: jne 0x844f20
        pc = 0x844ec0; continue;
      case 0x844ec0:
        R.ecx = (R.m.u32(((R.edi + 0x57) | 0) >>> 0)) | 0; // 844ec0: mov ecx, dword ptr [edi + 0x57]
        R.eax = (R.m.u32(((R.ebx + 0x57) | 0) >>> 0)) | 0; // 844ec3: mov eax, dword ptr [ebx + 0x57]
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 844ec6: cmp ecx, eax
        if (!R.zf) { pc = 0x844f20; continue; } // 844ec8: jne 0x844f20
        pc = 0x844eca; continue;
      case 0x844eca:
        R.edx = (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 844eca: movsx edx, word ptr [ebx + 0x80]
        R.eax = (((R.m.u16(((R.edi + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 844ed1: movsx eax, word ptr [edi + 0x80]
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 844ed8: sub eax, edx
        R.edx = R.eax < 0 ? -1 : 0; // 844eda: cdq 
        R.eax = (R.logic((R.eax >>> 0) ^ (R.edx >>> 0), 32)) | 0; // 844edb: xor eax, edx
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 844edd: sub eax, edx
        R.sub((R.eax >>> 0), 0x4e2, 32); // 844edf: cmp eax, 0x4e2
        if (!R.cL) { pc = 0x844f03; continue; } // 844ee4: jge 0x844f03
        pc = 0x844ee6; continue;
      case 0x844ee6:
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 844ee6: mov eax, dword ptr [ebp + 8]
        R.ecx = (((R.m.u8(((R.eax + 0x59) | 0) >>> 0)) << 24 >> 24)) | 0; // 844ee9: movsx ecx, byte ptr [eax + 0x59]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ecx >>> 0)); // 844eed: mov dword ptr [esp + 0x1c], ecx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 844ef1: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 0.025; // 844ef5: fmul qword ptr [0x967878]
        R.st[0] = 0.75 - R.st[0]; // 844efb: fsubr qword ptr [0x969040]
        pc = 0x844f58; continue; // 844f01: jmp 0x844f58
      case 0x844f03:
        R.edx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 844f03: mov edx, dword ptr [ebp + 8]
        R.eax = (((R.m.u8(((R.edx + 0x59) | 0) >>> 0)) << 24 >> 24)) | 0; // 844f06: movsx eax, byte ptr [edx + 0x59]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 844f0a: mov dword ptr [esp + 0x1c], eax
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 844f0e: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 0.016666666666666666; // 844f12: fmul qword ptr [0x968958]
        R.st[0] = 0.8 - R.st[0]; // 844f18: fsubr qword ptr [0x9689b0]
        pc = 0x844f58; continue; // 844f1e: jmp 0x844f58
      case 0x844f20:
        R.ecx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 844f20: mov ecx, dword ptr [ebp + 8]
        R.edx = (((R.m.u8(((R.ecx + 0x59) | 0) >>> 0)) << 24 >> 24)) | 0; // 844f23: movsx edx, byte ptr [ecx + 0x59]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 844f27: mov dword ptr [esp + 0x1c], edx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 844f2b: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 0.025; // 844f2f: fmul qword ptr [0x967878]
        R.st[0] = 0.85 - R.st[0]; // 844f35: fsubr qword ptr [0x969520]
        pc = 0x844f58; continue; // 844f3b: jmp 0x844f58
      case 0x844f3d:
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 844f3d: mov eax, dword ptr [ebp + 8]
        R.ecx = (((R.m.u8(((R.eax + 0x59) | 0) >>> 0)) << 24 >> 24)) | 0; // 844f40: movsx ecx, byte ptr [eax + 0x59]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ecx >>> 0)); // 844f44: mov dword ptr [esp + 0x1c], ecx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 844f48: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 0.025; // 844f4c: fmul qword ptr [0x967878]
        R.st[0] = 0.5 - R.st[0]; // 844f52: fsubr qword ptr [0x968968]
        pc = 0x844f58; continue;
      case 0x844f58:
        R.fpush(R.st[0]); // 844f58: fld st(0)
        R.st[2] = R.st[2] * R.st[0]; R.fpop(); // 844f5a: fmulp st(2)
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 844f5c: fxch st(1)
        R.m.wf64(((R.esp + 0x14) | 0) >>> 0, R.st[0]); // 844f5e: fst qword ptr [esp + 0x14]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 844f62: test esi, esi
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 844f64: fxch st(1)
        if (R.zf) { pc = 0x845119; continue; } // 844f66: je 0x845119
        pc = 0x844f6c; continue;
      case 0x844f6c:
        R.fcom(R.st[0], 0.7); R.fpop(); // 844f6c: fcomp qword ptr [0x968e40]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 844f72: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 844f74: test ah, 1
        if (R.zf) { pc = 0x844fca; continue; } // 844f77: je 0x844fca
        pc = 0x844f79; continue;
      case 0x844f79:
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 844f79: mov eax, dword ptr [esi]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) | 0x20, 8)) & 0xff) << 0)) | 0; // 844f7b: or al, 0x20
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 844f7d: mov dword ptr [esi], eax
        pc = 0x844fca; continue; // 844f7f: jmp 0x844fca
      case 0x844f81:
        R.edx = (R.m.u32(((R.edi + 0x53) | 0) >>> 0)) | 0; // 844f81: mov edx, dword ptr [edi + 0x53]
        R.ecx = (R.m.u32(((0x9cf2ac) | 0) >>> 0)) | 0; // 844f84: mov ecx, dword ptr [0x9cf2ac]
        R.eax = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 844f8a: mov eax, dword ptr [edx]
        R.edx = (R.m.u32(((0x9cf51c) | 0) >>> 0)) | 0; // 844f8c: mov edx, dword ptr [0x9cf51c]
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 844f92: cmp eax, edx
        if (!R.zf) { pc = 0x8450db; continue; } // 844f94: jne 0x8450db
        pc = 0x844f9a; continue;
      case 0x844f9a:
        R.edi = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 844f9a: mov edi, dword ptr [ebx + 0x53]
        R.sub(R.m.u32(((R.edi) | 0) >>> 0), (R.ecx >>> 0), 32); // 844f9d: cmp dword ptr [edi], ecx
        if (!R.zf) { pc = 0x8450d8; continue; } // 844f9f: jne 0x8450d8
        pc = 0x844fa5; continue;
      case 0x844fa5:
        R.edi = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 844fa5: mov edi, dword ptr [ebp + 8]
        R.edi = (R.m.u32(((R.edi + 0x1a) | 0) >>> 0)) | 0; // 844fa8: mov edi, dword ptr [edi + 0x1a]
        R.sub(R.m.u32(((R.edi) | 0) >>> 0), (R.ecx >>> 0), 32); // 844fab: cmp dword ptr [edi], ecx
        if (!R.zf) { pc = 0x8450d8; continue; } // 844fad: jne 0x8450d8
        pc = 0x844fb3; continue;
      case 0x844fb3:
        R.st[0] = R.st[0] * 0.05; // 844fb3: fmul qword ptr [0x967888]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 844fb9: test esi, esi
        R.m.wf64(((R.esp + 0x14) | 0) >>> 0, R.st[0]); // 844fbb: fst qword ptr [esp + 0x14]
        if (R.zf) { pc = 0x844fc7; continue; } // 844fbf: je 0x844fc7
        pc = 0x844fc1; continue;
      case 0x844fc1:
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 844fc1: mov eax, dword ptr [esi]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) | 0x2, 8)) & 0xff) << 0)) | 0; // 844fc3: or al, 2
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 844fc5: mov dword ptr [esi], eax
        pc = 0x844fc7; continue;
      case 0x844fc7:
        R.edi = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 844fc7: mov edi, dword ptr [ebp + 0xc]
        pc = 0x844fca; continue;
      case 0x844fca:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.ebp + 0x14) | 0) >>> 0)) & 0xff) << 0)) | 0; // 844fca: mov cl, byte ptr [ebp + 0x14]
        R.sub(((R.ecx >>> 0) & 0xff), 0x5, 8); // 844fcd: cmp cl, 5
        if (R.zf) { pc = 0x845040; continue; } // 844fd0: je 0x845040
        pc = 0x844fd2; continue;
      case 0x844fd2:
        R.sub(((R.ecx >>> 0) & 0xff), 0xc, 8); // 844fd2: cmp cl, 0xc
        if (R.zf) { pc = 0x845040; continue; } // 844fd5: je 0x845040
        pc = 0x844fd7; continue;
      case 0x844fd7:
        R.ecx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 844fd7: mov ecx, dword ptr [ebp + 8]
        R.edx = (R.m.u32(((R.edi + 0xcf) | 0) >>> 0)) | 0; // 844fda: mov edx, dword ptr [edi + 0xcf]
        R.push((R.ecx >>> 0)); // 844fe0: push ecx
        R.push((R.edx >>> 0)); // 844fe1: push edx
        R.fpop(); // 844fe2: fstp st(0)
        R.call(0x547810, { n: 2, thisEcx: false, calleeClean: false }); // 844fe4: call 0x547810
        R.fpush(R.f64(((R.esp + 0x1c) | 0))); // 844fe9: fld qword ptr [esp + 0x1c]
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 844fed: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 844ff0: test eax, eax
        if (R.zf) { pc = 0x845004; continue; } // 844ff2: je 0x845004
        pc = 0x844ff4; continue;
      case 0x844ff4:
        R.st[0] = R.st[0] + R.st[0]; // 844ff4: fadd st(0), st(0)
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 844ff6: test esi, esi
        R.m.wf64(((R.esp + 0x14) | 0) >>> 0, R.st[0]); // 844ff8: fst qword ptr [esp + 0x14]
        if (R.zf) { pc = 0x845004; continue; } // 844ffc: je 0x845004
        pc = 0x844ffe; continue;
      case 0x844ffe:
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 844ffe: mov eax, dword ptr [esi]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) | 0x40, 8)) & 0xff) << 0)) | 0; // 845000: or al, 0x40
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 845002: mov dword ptr [esi], eax
        pc = 0x845004; continue;
      case 0x845004:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.ebp + 0x14) | 0) >>> 0)) & 0xff) << 0)) | 0; // 845004: mov cl, byte ptr [ebp + 0x14]
        R.sub(((R.ecx >>> 0) & 0xff), 0xc, 8); // 845007: cmp cl, 0xc
        if (R.zf) { pc = 0x845040; continue; } // 84500a: je 0x845040
        pc = 0x84500c; continue;
      case 0x84500c:
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 84500c: mov eax, dword ptr [ebp + 8]
        R.ecx = (R.m.u32(((R.edi + 0xcf) | 0) >>> 0)) | 0; // 84500f: mov ecx, dword ptr [edi + 0xcf]
        R.push((R.eax >>> 0)); // 845015: push eax
        R.push((R.ecx >>> 0)); // 845016: push ecx
        R.fpop(); // 845017: fstp st(0)
        R.call(0x547840, { n: 2, thisEcx: false, calleeClean: false }); // 845019: call 0x547840
        R.fpush(R.f64(((R.esp + 0x1c) | 0))); // 84501e: fld qword ptr [esp + 0x1c]
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 845022: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 845025: test eax, eax
        if (R.zf) { pc = 0x84503d; continue; } // 845027: je 0x84503d
        pc = 0x845029; continue;
      case 0x845029:
        R.st[0] = R.st[0] * 0.33; // 845029: fmul qword ptr [0x968f78]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 84502f: test esi, esi
        R.m.wf64(((R.esp + 0x14) | 0) >>> 0, R.st[0]); // 845031: fst qword ptr [esp + 0x14]
        if (R.zf) { pc = 0x84503d; continue; } // 845035: je 0x84503d
        pc = 0x845037; continue;
      case 0x845037:
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 845037: mov eax, dword ptr [esi]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) | 0x80, 8)) & 0xff) << 0)) | 0; // 845039: or al, 0x80
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 84503b: mov dword ptr [esi], eax
        pc = 0x84503d; continue;
      case 0x84503d:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.ebp + 0x14) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84503d: mov cl, byte ptr [ebp + 0x14]
        pc = 0x845040; continue;
      case 0x845040:
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 845040: test ebx, ebx
        if (R.zf) { pc = 0x8450a5; continue; } // 845042: je 0x8450a5
        pc = 0x845044; continue;
      case 0x845044:
        R.edx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 845044: mov edx, dword ptr [ebp + 8]
        R.eax = (R.m.u32(((R.ebx + 0xcf) | 0) >>> 0)) | 0; // 845047: mov eax, dword ptr [ebx + 0xcf]
        R.push((R.edx >>> 0)); // 84504d: push edx
        R.push((R.eax >>> 0)); // 84504e: push eax
        R.fpop(); // 84504f: fstp st(0)
        R.call(0x547840, { n: 2, thisEcx: false, calleeClean: false }); // 845051: call 0x547840
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 845056: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 845059: test eax, eax
        if (R.zf) { pc = 0x845072; continue; } // 84505b: je 0x845072
        pc = 0x84505d; continue;
      case 0x84505d:
        R.fpush(R.f64(((R.esp + 0x14) | 0))); // 84505d: fld qword ptr [esp + 0x14]
        R.st[0] = R.st[0] + R.st[0]; // 845061: fadd st(0), st(0)
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 845063: test esi, esi
        R.m.wf64(((R.esp + 0x14) | 0) >>> 0, R.st[0]); R.fpop(); // 845065: fstp qword ptr [esp + 0x14]
        if (R.zf) { pc = 0x845072; continue; } // 845069: je 0x845072
        pc = 0x84506b; continue;
      case 0x84506b:
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 84506b: mov eax, dword ptr [esi]
        R.eax = ((R.eax & 0xffff00ff) | (((R.logic(((R.eax >>> 8) & 0xff) | 0x1, 8)) & 0xff) << 8)) | 0; // 84506d: or ah, 1
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 845070: mov dword ptr [esi], eax
        pc = 0x845072; continue;
      case 0x845072:
        R.ecx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 845072: mov ecx, dword ptr [ebp + 8]
        R.edx = (R.m.u32(((R.ebx + 0xcf) | 0) >>> 0)) | 0; // 845075: mov edx, dword ptr [ebx + 0xcf]
        R.push((R.ecx >>> 0)); // 84507b: push ecx
        R.push((R.edx >>> 0)); // 84507c: push edx
        R.call(0x547810, { n: 2, thisEcx: false, calleeClean: false }); // 84507d: call 0x547810
        R.fpush(R.f64(((R.esp + 0x1c) | 0))); // 845082: fld qword ptr [esp + 0x1c]
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 845086: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 845089: test eax, eax
        if (R.zf) { pc = 0x8450a2; continue; } // 84508b: je 0x8450a2
        pc = 0x84508d; continue;
      case 0x84508d:
        R.st[0] = R.st[0] * 0.5; // 84508d: fmul qword ptr [0x968968]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 845093: test esi, esi
        R.m.wf64(((R.esp + 0x14) | 0) >>> 0, R.st[0]); // 845095: fst qword ptr [esp + 0x14]
        if (R.zf) { pc = 0x8450a2; continue; } // 845099: je 0x8450a2
        pc = 0x84509b; continue;
      case 0x84509b:
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 84509b: mov eax, dword ptr [esi]
        R.eax = ((R.eax & 0xffff00ff) | (((R.logic(((R.eax >>> 8) & 0xff) | 0x2, 8)) & 0xff) << 8)) | 0; // 84509d: or ah, 2
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 8450a0: mov dword ptr [esi], eax
        pc = 0x8450a2; continue;
      case 0x8450a2:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.ebp + 0x14) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8450a2: mov cl, byte ptr [ebp + 0x14]
        pc = 0x8450a5; continue;
      case 0x8450a5:
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 8450a5: mov eax, dword ptr [ebp + 8]
        R.edx = (R.m.u32(((R.eax + 0x61) | 0) >>> 0)) | 0; // 8450a8: mov edx, dword ptr [eax + 0x61]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 8450ab: test edx, edx
        if (R.zf) { pc = 0x845127; continue; } // 8450ad: je 0x845127
        pc = 0x8450af; continue;
      case 0x8450af:
        R.ecx = ((R.eax >>> 0)) | 0; // 8450af: mov ecx, eax
        R.push(0x0); // 8450b1: push 0
        R.push((R.ecx >>> 0)); // 8450b3: push ecx
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 8450b4: mov ecx, dword ptr [0xde1f54]
        R.fpop(); // 8450ba: fstp st(0)
        R.call(0x8cca10, { n: 2, thisEcx: true, calleeClean: true }); // 8450bc: call 0x8cca10
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8450c1: test eax, eax
        if (R.zf) { pc = 0x845120; continue; } // 8450c3: je 0x845120
        pc = 0x8450c5; continue;
      case 0x8450c5:
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8450c5: test esi, esi
        if (R.zf) { pc = 0x8467f1; continue; } // 8450c7: je 0x8467f1
        pc = 0x8450cd; continue;
      case 0x8450cd:
        R.m.w32(((R.esi) | 0) >>> 0, R.logic(R.m.u32(((R.esi) | 0) >>> 0) | 0x10000000, 32)); // 8450cd: or dword ptr [esi], 0x10000000
        pc = 0x8467f1; continue; // 8450d3: jmp 0x8467f1
      case 0x8450d8:
        R.edi = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 8450d8: mov edi, dword ptr [ebp + 0xc]
        pc = 0x8450db; continue;
      case 0x8450db:
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 8450db: cmp eax, ecx
        if (!R.zf) { pc = 0x844fca; continue; } // 8450dd: jne 0x844fca
        pc = 0x8450e3; continue;
      case 0x8450e3:
        R.eax = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 8450e3: mov eax, dword ptr [ebx + 0x53]
        R.sub(R.m.u32(((R.eax) | 0) >>> 0), (R.edx >>> 0), 32); // 8450e6: cmp dword ptr [eax], edx
        if (!R.zf) { pc = 0x844fca; continue; } // 8450e8: jne 0x844fca
        pc = 0x8450ee; continue;
      case 0x8450ee:
        R.ecx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 8450ee: mov ecx, dword ptr [ebp + 8]
        R.eax = (R.m.u32(((R.ecx + 0x1a) | 0) >>> 0)) | 0; // 8450f1: mov eax, dword ptr [ecx + 0x1a]
        R.sub(R.m.u32(((R.eax) | 0) >>> 0), (R.edx >>> 0), 32); // 8450f4: cmp dword ptr [eax], edx
        if (!R.zf) { pc = 0x844fca; continue; } // 8450f6: jne 0x844fca
        pc = 0x8450fc; continue;
      case 0x8450fc:
        R.st[0] = R.st[0] * 0.1; // 8450fc: fmul qword ptr [0x967880]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 845102: test esi, esi
        R.m.wf64(((R.esp + 0x14) | 0) >>> 0, R.st[0]); // 845104: fst qword ptr [esp + 0x14]
        if (R.zf) { pc = 0x844fca; continue; } // 845108: je 0x844fca
        pc = 0x84510e; continue;
      case 0x84510e:
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 84510e: mov eax, dword ptr [esi]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) | 0x2, 8)) & 0xff) << 0)) | 0; // 845110: or al, 2
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 845112: mov dword ptr [esi], eax
        pc = 0x844fca; continue; // 845114: jmp 0x844fca
      case 0x845119:
        R.fpop(); // 845119: fstp st(0)
        pc = 0x844fca; continue; // 84511b: jmp 0x844fca
      case 0x845120:
        R.fpush(R.f64(((R.esp + 0x14) | 0))); // 845120: fld qword ptr [esp + 0x14]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.ebp + 0x14) | 0) >>> 0)) & 0xff) << 0)) | 0; // 845124: mov cl, byte ptr [ebp + 0x14]
        pc = 0x845127; continue;
      case 0x845127:
        R.eax = (R.m.u32(((R.esp + 0x58) | 0) >>> 0)) | 0; // 845127: mov eax, dword ptr [esp + 0x58]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84512b: test eax, eax
        if (!R.zf) { pc = 0x845142; continue; } // 84512d: jne 0x845142
        pc = 0x84512f; continue;
      case 0x84512f:
        R.sub((R.edi >>> 0), (R.ebx >>> 0), 32); // 84512f: cmp edi, ebx
        if (!R.zf) { pc = 0x8451d2; continue; } // 845131: jne 0x8451d2
        pc = 0x845137; continue;
      case 0x845137:
        R.edx = ((R.edx & 0xffffff00) | (((((R.ecx >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 845137: mov dl, cl
        R.m.w8(((R.esp + 0x13) | 0) >>> 0, ((R.edx >>> 0) & 0xff)); // 845139: mov byte ptr [esp + 0x13], dl
        pc = 0x8451c8; continue; // 84513d: jmp 0x8451c8
      case 0x845142:
        R.edx = (((R.m.u8(((R.eax + 0x44) | 0) >>> 0)) << 24 >> 24)) | 0; // 845142: movsx edx, byte ptr [eax + 0x44]
        R.sub((R.edi >>> 0), (R.ebx >>> 0), 32); // 845146: cmp edi, ebx
        if (!R.zf) { pc = 0x84516a; continue; } // 845148: jne 0x84516a
        pc = 0x84514a; continue;
      case 0x84514a:
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 84514a: mov dword ptr [esp + 0x1c], edx
        R.m.w8(((R.esp + 0x13) | 0) >>> 0, ((R.ecx >>> 0) & 0xff)); // 84514e: mov byte ptr [esp + 0x13], cl
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 845152: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 0.0025; // 845156: fmul qword ptr [0x969028]
        R.st[0] = R.st[0] + 1.0; // 84515c: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 845162: fmulp st(1)
        R.m.wf64(((R.esp + 0x14) | 0) >>> 0, R.st[0]); // 845164: fst qword ptr [esp + 0x14]
        pc = 0x8451c4; continue; // 845168: jmp 0x8451c4
      case 0x84516a:
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 84516a: mov dword ptr [esp + 0x1c], edx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 84516e: fild dword ptr [esp + 0x1c]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 845172: test esi, esi
        R.st[0] = R.st[0] * 0.0025; // 845174: fmul qword ptr [0x969028]
        R.st[0] = 1.0 - R.st[0]; // 84517a: fsubr qword ptr [0x967890]
        R.fpush(R.st[0]); // 845180: fld st(0)
        R.st[2] = R.st[2] * R.st[0]; R.fpop(); // 845182: fmulp st(2)
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 845184: fxch st(1)
        R.m.wf64(((R.esp + 0x14) | 0) >>> 0, R.st[0]); // 845186: fst qword ptr [esp + 0x14]
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 84518a: fxch st(1)
        if (R.zf) { pc = 0x8451c2; continue; } // 84518c: je 0x8451c2
        pc = 0x84518e; continue;
      case 0x84518e:
        R.logic(R.m.u8(((R.eax + 0x4e) | 0) >>> 0) & 0x8, 8); // 84518e: test byte ptr [eax + 0x4e], 8
        if (!R.zf) { pc = 0x8451c2; continue; } // 845192: jne 0x8451c2
        pc = 0x845194; continue;
      case 0x845194:
        R.fcom(R.st[0], 1.5); // 845194: fcom qword ptr [0x968940]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84519a: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 84519c: test ah, 0x41
        if (!R.zf) { pc = 0x8451ac; continue; } // 84519f: jne 0x8451ac
        pc = 0x8451a1; continue;
      case 0x8451a1:
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8451a1: mov eax, dword ptr [esi]
        R.eax = ((R.eax & 0xffff00ff) | (((R.logic(((R.eax >>> 8) & 0xff) | 0x4, 8)) & 0xff) << 8)) | 0; // 8451a3: or ah, 4
        R.fpop(); // 8451a6: fstp st(0)
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 8451a8: mov dword ptr [esi], eax
        pc = 0x8451c4; continue; // 8451aa: jmp 0x8451c4
      case 0x8451ac:
        R.fcom(R.st[0], 0.5); R.fpop(); // 8451ac: fcomp qword ptr [0x968968]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8451b2: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8451b4: test ah, 1
        if (R.zf) { pc = 0x8451c4; continue; } // 8451b7: je 0x8451c4
        pc = 0x8451b9; continue;
      case 0x8451b9:
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8451b9: mov eax, dword ptr [esi]
        R.eax = ((R.eax & 0xffff00ff) | (((R.logic(((R.eax >>> 8) & 0xff) | 0x8, 8)) & 0xff) << 8)) | 0; // 8451bb: or ah, 8
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 8451be: mov dword ptr [esi], eax
        pc = 0x8451c4; continue; // 8451c0: jmp 0x8451c4
      case 0x8451c2:
        R.fpop(); // 8451c2: fstp st(0)
        pc = 0x8451c4; continue;
      case 0x8451c4:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.esp + 0x13) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8451c4: mov dl, byte ptr [esp + 0x13]
        pc = 0x8451c8; continue;
      case 0x8451c8:
        R.sub((R.edi >>> 0), (R.ebx >>> 0), 32); // 8451c8: cmp edi, ebx
        if (R.zf) { pc = 0x845bd4; continue; } // 8451ca: je 0x845bd4
        pc = 0x8451d0; continue;
      case 0x8451d0:
        pc = 0x8451d6; continue; // 8451d0: jmp 0x8451d6
      case 0x8451d2:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.esp + 0x13) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8451d2: mov dl, byte ptr [esp + 0x13]
        pc = 0x8451d6; continue;
      case 0x8451d6:
        R.eax = (((((R.edx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 8451d6: movsx eax, dl
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 8451d9: dec eax
        R.sub((R.eax >>> 0), 0xf, 32); // 8451da: cmp eax, 0xf
        if (!R.cBE) { pc = 0x845307; continue; } // 8451dd: ja 0x845307
        pc = 0x8451e3; continue;
      case 0x8451e3:
        pc = [0x8451ea, 0x845259, 0x845259, 0x845259, 0x8451f5, 0x845274, 0x8452c3, 0x845296, 0x8452d9, 0x8452d9, 0x845307, 0x8451f5, 0x845274, 0x8452c3, 0x845296, 0x84521e][R.eax >>> 0]; continue; // 8451e3: jmp dword ptr [eax*4 + 0x846810]
      case 0x8451ea:
        R.st[0] = R.st[0] * 0.01; // 8451ea: fmul qword ptr [0x967898]
        pc = 0x84531a; continue; // 8451f0: jmp 0x84531a
      case 0x8451f5:
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 8451f5: test ebx, ebx
        if (R.zf) { pc = 0x845213; continue; } // 8451f7: je 0x845213
        pc = 0x8451f9; continue;
      case 0x8451f9:
        R.st[0] = R.st[0] * 0.45; // 8451f9: fmul qword ptr [0x96a6a8]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8451ff: test esi, esi
        if (R.zf) { pc = 0x84531a; continue; } // 845201: je 0x84531a
        pc = 0x845207; continue;
      case 0x845207:
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 845207: mov eax, dword ptr [esi]
        R.eax = (R.logic((R.eax >>> 0) | 0x4000000, 32)) | 0; // 845209: or eax, 0x4000000
        pc = 0x845318; continue; // 84520e: jmp 0x845318
      case 0x845213:
        R.st[0] = R.st[0] * 0.65; // 845213: fmul qword ptr [0x96a5d0]
        pc = 0x84531a; continue; // 845219: jmp 0x84531a
      case 0x84521e:
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 84521e: mov eax, dword ptr [ebp + 8]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x57) | 0) >>> 0)) & 0xff) << 0)) | 0; // 845221: mov al, byte ptr [eax + 0x57]
        R.sub(((R.eax >>> 0) & 0xff), 0x1, 8); // 845224: cmp al, 1
        if (R.cLE) { pc = 0x845240; continue; } // 845226: jle 0x845240
        pc = 0x845228; continue;
      case 0x845228:
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 845228: movsx eax, al
        R.m.w32(((R.esp + 0x4c) | 0) >>> 0, (R.eax >>> 0)); // 84522b: mov dword ptr [esp + 0x4c], eax
        R.fpush(R.m.s32(((R.esp + 0x4c) | 0) >>> 0)); // 84522f: fild dword ptr [esp + 0x4c]
        R.st[0] = 10.0 / R.st[0]; // 845233: fdivr qword ptr [0x9688b0]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 845239: fmulp st(1)
        pc = 0x84531a; continue; // 84523b: jmp 0x84531a
      case 0x845240:
        R.m.w32(((R.esp + 0x4c) | 0) >>> 0, 0x1); // 845240: mov dword ptr [esp + 0x4c], 1
        R.fpush(R.m.s32(((R.esp + 0x4c) | 0) >>> 0)); // 845248: fild dword ptr [esp + 0x4c]
        R.st[0] = 10.0 / R.st[0]; // 84524c: fdivr qword ptr [0x9688b0]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 845252: fmulp st(1)
        pc = 0x84531a; continue; // 845254: jmp 0x84531a
      case 0x845259:
        R.sub(((R.ecx >>> 0) & 0xff), 0x5, 8); // 845259: cmp cl, 5
        if (!R.zf) { pc = 0x8451ea; continue; } // 84525c: jne 0x8451ea
        pc = 0x84525e; continue;
      case 0x84525e:
        R.sub(R.m.u16(((R.edi + 0x80) | 0) >>> 0), 0x1770, 16); // 84525e: cmp word ptr [edi + 0x80], 0x1770
        if (R.cL) { pc = 0x8451ea; continue; } // 845267: jl 0x8451ea
        pc = 0x845269; continue;
      case 0x845269:
        R.st[0] = R.st[0] * 0.5; // 845269: fmul qword ptr [0x968968]
        pc = 0x84531a; continue; // 84526f: jmp 0x84531a
      case 0x845274:
        R.st[0] = R.st[0] * 1.5; // 845274: fmul qword ptr [0x968940]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 84527a: test esi, esi
        if (R.zf) { pc = 0x84531a; continue; } // 84527c: je 0x84531a
        pc = 0x845282; continue;
      case 0x845282:
        R.sub(((R.ecx >>> 0) & 0xff), 0x5, 8); // 845282: cmp cl, 5
        if (R.zf) { pc = 0x845311; continue; } // 845285: je 0x845311
        pc = 0x84528b; continue;
      case 0x84528b:
        R.sub(((R.ecx >>> 0) & 0xff), 0xc, 8); // 84528b: cmp cl, 0xc
        if (!R.zf) { pc = 0x84531a; continue; } // 84528e: jne 0x84531a
        pc = 0x845294; continue;
      case 0x845294:
        pc = 0x845311; continue; // 845294: jmp 0x845311
      case 0x845296:
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 845296: mov eax, dword ptr [ebp + 8]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 845299: test esi, esi
        R.eax = (((R.m.u8(((R.eax + 0x57) | 0) >>> 0)) << 24 >> 24)) | 0; // 84529b: movsx eax, byte ptr [eax + 0x57]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 84529f: mov dword ptr [esp + 0x1c], eax
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 8452a3: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 0.05; // 8452a7: fmul qword ptr [0x967888]
        R.st[0] = R.st[0] + 0.8; // 8452ad: fadd qword ptr [0x9689b0]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 8452b3: fmulp st(1)
        if (R.zf) { pc = 0x84531a; continue; } // 8452b5: je 0x84531a
        pc = 0x8452b7; continue;
      case 0x8452b7:
        R.sub(((R.ecx >>> 0) & 0xff), 0x5, 8); // 8452b7: cmp cl, 5
        if (R.zf) { pc = 0x845311; continue; } // 8452ba: je 0x845311
        pc = 0x8452bc; continue;
      case 0x8452bc:
        R.sub(((R.ecx >>> 0) & 0xff), 0xc, 8); // 8452bc: cmp cl, 0xc
        if (!R.zf) { pc = 0x84531a; continue; } // 8452bf: jne 0x84531a
        pc = 0x8452c1; continue;
      case 0x8452c1:
        pc = 0x845311; continue; // 8452c1: jmp 0x845311
      case 0x8452c3:
        R.st[0] = R.st[0] * 2.2; // 8452c3: fmul qword ptr [0x96d7d0]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8452c9: test esi, esi
        if (R.zf) { pc = 0x84531a; continue; } // 8452cb: je 0x84531a
        pc = 0x8452cd; continue;
      case 0x8452cd:
        R.sub(((R.ecx >>> 0) & 0xff), 0x5, 8); // 8452cd: cmp cl, 5
        if (R.zf) { pc = 0x845311; continue; } // 8452d0: je 0x845311
        pc = 0x8452d2; continue;
      case 0x8452d2:
        R.sub(((R.ecx >>> 0) & 0xff), 0xc, 8); // 8452d2: cmp cl, 0xc
        if (!R.zf) { pc = 0x84531a; continue; } // 8452d5: jne 0x84531a
        pc = 0x8452d7; continue;
      case 0x8452d7:
        pc = 0x845311; continue; // 8452d7: jmp 0x845311
      case 0x8452d9:
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8452d9: test esi, esi
        if (R.zf) { pc = 0x84531a; continue; } // 8452db: je 0x84531a
        pc = 0x8452dd; continue;
      case 0x8452dd:
        R.sub(((R.ecx >>> 0) & 0xff), 0x5, 8); // 8452dd: cmp cl, 5
        if (R.zf) { pc = 0x845311; continue; } // 8452e0: je 0x845311
        pc = 0x8452e2; continue;
      case 0x8452e2:
        R.sub(((R.ecx >>> 0) & 0xff), 0xc, 8); // 8452e2: cmp cl, 0xc
        if (R.zf) { pc = 0x845311; continue; } // 8452e5: je 0x845311
        pc = 0x8452e7; continue;
      case 0x8452e7:
        R.sub(((R.ecx >>> 0) & 0xff), 0x6, 8); // 8452e7: cmp cl, 6
        if (R.zf) { pc = 0x845311; continue; } // 8452ea: je 0x845311
        pc = 0x8452ec; continue;
      case 0x8452ec:
        R.sub(((R.ecx >>> 0) & 0xff), 0xd, 8); // 8452ec: cmp cl, 0xd
        if (R.zf) { pc = 0x845311; continue; } // 8452ef: je 0x845311
        pc = 0x8452f1; continue;
      case 0x8452f1:
        R.sub(((R.ecx >>> 0) & 0xff), 0xe, 8); // 8452f1: cmp cl, 0xe
        if (R.zf) { pc = 0x845311; continue; } // 8452f4: je 0x845311
        pc = 0x8452f6; continue;
      case 0x8452f6:
        R.sub(((R.ecx >>> 0) & 0xff), 0xf, 8); // 8452f6: cmp cl, 0xf
        if (R.zf) { pc = 0x845311; continue; } // 8452f9: je 0x845311
        pc = 0x8452fb; continue;
      case 0x8452fb:
        R.sub(((R.ecx >>> 0) & 0xff), 0x7, 8); // 8452fb: cmp cl, 7
        if (R.zf) { pc = 0x845311; continue; } // 8452fe: je 0x845311
        pc = 0x845300; continue;
      case 0x845300:
        R.sub(((R.ecx >>> 0) & 0xff), 0x8, 8); // 845300: cmp cl, 8
        if (!R.zf) { pc = 0x84531a; continue; } // 845303: jne 0x84531a
        pc = 0x845305; continue;
      case 0x845305:
        pc = 0x845311; continue; // 845305: jmp 0x845311
      case 0x845307:
        R.st[0] = R.st[0] * 10.0; // 845307: fmul qword ptr [0x9688b0]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 84530d: test esi, esi
        if (R.zf) { pc = 0x84531a; continue; } // 84530f: je 0x84531a
        pc = 0x845311; continue;
      case 0x845311:
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 845311: mov eax, dword ptr [esi]
        R.eax = (R.logic((R.eax >>> 0) | 0x8000000, 32)) | 0; // 845313: or eax, 0x8000000
        pc = 0x845318; continue;
      case 0x845318:
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 845318: mov dword ptr [esi], eax
        pc = 0x84531a; continue;
      case 0x84531a:
        R.eax = (((((R.ecx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 84531a: movsx eax, cl
        R.sub((R.eax >>> 0), 0xf, 32); // 84531d: cmp eax, 0xf
        R.m.w32(((R.esp + 0x5c) | 0) >>> 0, (R.eax >>> 0)); // 845320: mov dword ptr [esp + 0x5c], eax
        if (!R.cBE) { pc = 0x8453b7; continue; } // 845324: ja 0x8453b7
        pc = 0x84532a; continue;
      case 0x84532a:
        pc = [0x8467ef, 0x845331, 0x84533c, 0x84533c, 0x84533c, 0x845347, 0x845367, 0x84537d, 0x84537d, 0x845385, 0x845385, 0x8453b7, 0x845347, 0x845367, 0x84537d, 0x84537d][R.eax >>> 0]; continue; // 84532a: jmp dword ptr [eax*4 + 0x846850]
      case 0x845331:
        R.st[0] = R.st[0] * 10.0; // 845331: fmul qword ptr [0x9688b0]
        pc = 0x8453d5; continue; // 845337: jmp 0x8453d5
      case 0x84533c:
        R.st[0] = R.st[0] * 1.1764705882352942; // 84533c: fmul qword ptr [0x96f950]
        pc = 0x8453d5; continue; // 845342: jmp 0x8453d5
      case 0x845347:
        R.st[0] = R.st[0] * 2.2222222222222223; // 845347: fmul qword ptr [0x96f948]
        R.sub(((R.edx >>> 0) & 0xff), 0x5, 8); // 84534d: cmp dl, 5
        R.m.wf64(((R.esp + 0x14) | 0) >>> 0, R.st[0]); R.fpop(); // 845350: fstp qword ptr [esp + 0x14]
        if (R.zf) { pc = 0x84535b; continue; } // 845354: je 0x84535b
        pc = 0x845356; continue;
      case 0x845356:
        R.sub(((R.edx >>> 0) & 0xff), 0xc, 8); // 845356: cmp dl, 0xc
        if (!R.zf) { pc = 0x8453d9; continue; } // 845359: jne 0x8453d9
        pc = 0x84535b; continue;
      case 0x84535b:
        R.fpush(R.f64(((R.esp + 0x14) | 0))); // 84535b: fld qword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.5; // 84535f: fmul qword ptr [0x968940]
        pc = 0x8453d5; continue; // 845365: jmp 0x8453d5
      case 0x845367:
        R.st[0] = R.st[0] * 0.5; // 845367: fmul qword ptr [0x968968]
        pc = 0x84536d; continue;
      case 0x84536d:
        R.m.wf64(((R.esp + 0x14) | 0) >>> 0, R.st[0]); R.fpop(); // 84536d: fstp qword ptr [esp + 0x14]
        pc = 0x845371; continue;
      case 0x845371:
        R.sub(((R.edx >>> 0) & 0xff), 0x5, 8); // 845371: cmp dl, 5
        if (R.zf) { pc = 0x8453cb; continue; } // 845374: je 0x8453cb
        pc = 0x845376; continue;
      case 0x845376:
        R.sub(((R.edx >>> 0) & 0xff), 0xc, 8); // 845376: cmp dl, 0xc
        if (!R.zf) { pc = 0x8453d9; continue; } // 845379: jne 0x8453d9
        pc = 0x84537b; continue;
      case 0x84537b:
        pc = 0x8453cb; continue; // 84537b: jmp 0x8453cb
      case 0x84537d:
        R.st[0] = R.st[0] * 0.4; // 84537d: fmul qword ptr [0x968e00]
        pc = 0x84536d; continue; // 845383: jmp 0x84536d
      case 0x845385:
        R.sub(((R.edx >>> 0) & 0xff), 0x9, 8); // 845385: cmp dl, 9
        if (R.zf) { pc = 0x845397; continue; } // 845388: je 0x845397
        pc = 0x84538a; continue;
      case 0x84538a:
        R.sub(((R.edx >>> 0) & 0xff), 0xa, 8); // 84538a: cmp dl, 0xa
        if (R.zf) { pc = 0x845397; continue; } // 84538d: je 0x845397
        pc = 0x84538f; continue;
      case 0x84538f:
        R.st[0] = R.st[0] * 0.25; // 84538f: fmul qword ptr [0x9689e0]
        pc = 0x84539d; continue; // 845395: jmp 0x84539d
      case 0x845397:
        R.st[0] = R.st[0] * 0.4; // 845397: fmul qword ptr [0x968e00]
        pc = 0x84539d; continue;
      case 0x84539d:
        R.ecx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 84539d: mov ecx, dword ptr [ebp + 8]
        R.m.wf64(((R.esp + 0x14) | 0) >>> 0, R.st[0]); R.fpop(); // 8453a0: fstp qword ptr [esp + 0x14]
        R.eax = (R.m.u32(((R.ecx + 0x61) | 0) >>> 0)) | 0; // 8453a4: mov eax, dword ptr [ecx + 0x61]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8453a7: test eax, eax
        if (R.zf) { pc = 0x845371; continue; } // 8453a9: je 0x845371
        pc = 0x8453ab; continue;
      case 0x8453ab:
        R.fpush(R.f64(((R.esp + 0x14) | 0))); // 8453ab: fld qword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.25; // 8453af: fmul qword ptr [0x9689e0]
        pc = 0x84536d; continue; // 8453b5: jmp 0x84536d
      case 0x8453b7:
        R.st[0] = R.st[0] * 0.1; // 8453b7: fmul qword ptr [0x967880]
        R.sub(((R.edx >>> 0) & 0xff), 0x5, 8); // 8453bd: cmp dl, 5
        R.m.wf64(((R.esp + 0x14) | 0) >>> 0, R.st[0]); R.fpop(); // 8453c0: fstp qword ptr [esp + 0x14]
        if (R.zf) { pc = 0x8453cb; continue; } // 8453c4: je 0x8453cb
        pc = 0x8453c6; continue;
      case 0x8453c6:
        R.sub(((R.edx >>> 0) & 0xff), 0xc, 8); // 8453c6: cmp dl, 0xc
        if (!R.zf) { pc = 0x8453d9; continue; } // 8453c9: jne 0x8453d9
        pc = 0x8453cb; continue;
      case 0x8453cb:
        R.fpush(R.f64(((R.esp + 0x14) | 0))); // 8453cb: fld qword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.4; // 8453cf: fmul qword ptr [0x968e00]
        pc = 0x8453d5; continue;
      case 0x8453d5:
        R.m.wf64(((R.esp + 0x14) | 0) >>> 0, R.st[0]); R.fpop(); // 8453d5: fstp qword ptr [esp + 0x14]
        pc = 0x8453d9; continue;
      case 0x8453d9:
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 8453d9: test ebx, ebx
        if (R.zf) { pc = 0x84543c; continue; } // 8453db: je 0x84543c
        pc = 0x8453dd; continue;
      case 0x8453dd:
        R.sub(((R.edx >>> 0) & 0xff), 0x5, 8); // 8453dd: cmp dl, 5
        if (R.zf) { pc = 0x8453e7; continue; } // 8453e0: je 0x8453e7
        pc = 0x8453e2; continue;
      case 0x8453e2:
        R.sub(((R.edx >>> 0) & 0xff), 0xc, 8); // 8453e2: cmp dl, 0xc
        if (!R.zf) { pc = 0x84543c; continue; } // 8453e5: jne 0x84543c
        pc = 0x8453e7; continue;
      case 0x8453e7:
        R.ecx = (R.m.u32(((0xb67a44) | 0) >>> 0)) | 0; // 8453e7: mov ecx, dword ptr [0xb67a44]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 8453ed: test ecx, ecx
        if (R.zf) { pc = 0x84543c; continue; } // 8453ef: je 0x84543c
        pc = 0x8453f1; continue;
      case 0x8453f1:
        R.eax = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 8453f1: mov eax, dword ptr [ebx]
        R.ecx = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 8453f3: mov ecx, dword ptr [ecx]
        R.esi = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 8453f5: mov esi, dword ptr [ebp + 8]
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 8453f8: lea edx, [eax + eax*8]
        R.eax = (((R.eax + R.edx * 8) | 0)) | 0; // 8453fb: lea eax, [eax + edx*8]
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.eax + R.ecx + 0x8) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8453fe: mov dx, word ptr [eax + ecx + 8]
        R.eax = (R.add((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 845403: add eax, ecx
        R.edx = (((((R.edx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 845405: movsx edx, dx
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.eax + 0x6) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 845408: mov cx, word ptr [eax + 6]
        R.eax = (((R.m.u8(((R.esi + 0x59) | 0) >>> 0)) << 24 >> 24)) | 0; // 84540c: movsx eax, byte ptr [esi + 0x59]
        R.esi = (((R.m.u8(((R.esi + 0x58) | 0) >>> 0)) << 24 >> 24)) | 0; // 845410: movsx esi, byte ptr [esi + 0x58]
        R.eax = (R.add((R.eax >>> 0), (R.esi >>> 0), 32)) | 0; // 845414: add eax, esi
        R.ecx = (((((R.ecx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 845416: movsx ecx, cx
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 845419: lea eax, [eax + eax*4]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 84541c: lea eax, [eax + eax*4]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 84541f: lea eax, [eax + eax*4]
        R.eax = (((R.edx + R.eax * 4) | 0)) | 0; // 845422: lea eax, [edx + eax*4]
        R.eax = (R.add((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 845425: add eax, ecx
        R.sub((R.eax >>> 0), 0x1f40, 32); // 845427: cmp eax, 0x1f40
        if (!R.cL) { pc = 0x84543c; continue; } // 84542c: jge 0x84543c
        pc = 0x84542e; continue;
      case 0x84542e:
        R.fpush(R.f64(((R.esp + 0x14) | 0))); // 84542e: fld qword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.4; // 845432: fmul qword ptr [0x968dc0]
        R.m.wf64(((R.esp + 0x14) | 0) >>> 0, R.st[0]); R.fpop(); // 845438: fstp qword ptr [esp + 0x14]
        pc = 0x84543c; continue;
      case 0x84543c:
        R.edx = (R.m.u32(((R.edi + 0x53) | 0) >>> 0)) | 0; // 84543c: mov edx, dword ptr [edi + 0x53]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edx + 0x7e) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84543f: mov al, byte ptr [edx + 0x7e]
        R.sub(((R.eax >>> 0) & 0xff), 0x1, 8); // 845442: cmp al, 1
        if (R.cL) { pc = 0x84544a; continue; } // 845444: jl 0x84544a
        pc = 0x845446; continue;
      case 0x845446:
        R.sub(((R.eax >>> 0) & 0xff), 0x3, 8); // 845446: cmp al, 3
        if (R.cLE) { pc = 0x84544c; continue; } // 845448: jle 0x84544c
        pc = 0x84544a; continue;
      case 0x84544a:
        R.eax = ((R.eax & 0xffffff00) | (((0x3) & 0xff) << 0)) | 0; // 84544a: mov al, 3
        pc = 0x84544c; continue;
      case 0x84544c:
        { const p = ((R.eax << 24) >> 24) * ((((R.eax >>> 0) & 0xff)) << 24 >> 24); R.eax = ((R.eax & 0xffff0000) | (p & 0xffff)) | 0; R.cf = R.of = ((p << 24) >> 24) !== p; } // 84544c: imul al
        R.m.w8(((R.esp + 0x47) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 84544e: mov byte ptr [esp + 0x47], al
        R.eax = (R.m.u32(((R.edi + 0x69) | 0) >>> 0)) | 0; // 845452: mov eax, dword ptr [edi + 0x69]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 845455: test eax, eax
        if (R.zf) { pc = 0x8454dd; continue; } // 845457: je 0x8454dd
        pc = 0x84545d; continue;
      case 0x84545d:
        R.eax = (R.m.u32(((R.eax + 0x38) | 0) >>> 0)) | 0; // 84545d: mov eax, dword ptr [eax + 0x38]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 845460: test eax, eax
        if (R.zf) { pc = 0x8454dd; continue; } // 845462: je 0x8454dd
        pc = 0x845464; continue;
      case 0x845464:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x33) | 0) >>> 0)) & 0xff) << 0)) | 0; // 845464: mov al, byte ptr [eax + 0x33]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 845467: test al, al
        if (!R.zf) { pc = 0x845481; continue; } // 845469: jne 0x845481
        pc = 0x84546b; continue;
      case 0x84546b:
        R.eax = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 84546b: mov eax, dword ptr [ebp + 0xc]
        R.edi = ((R.edi & 0xffff0000) | (((R.m.u16(((R.eax + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 84546e: mov di, word ptr [eax + 0x80]
        R.esi = (((((R.edi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 845475: movsx esi, di
        R.eax = ((R.esi >>> 0)) | 0; // 845478: mov eax, esi
        R.edx = R.eax < 0 ? -1 : 0; // 84547a: cdq 
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 84547b: sub eax, edx
        R.eax = (R.sar((R.eax >>> 0), 0x1, 32)) | 0; // 84547d: sar eax, 1
        pc = 0x8454fd; continue; // 84547f: jmp 0x8454fd
      case 0x845481:
        R.ebx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 845481: mov ebx, dword ptr [ebp + 0xc]
        R.ecx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 845484: movsx ecx, al
        R.edi = ((R.edi & 0xffff0000) | (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 845487: mov di, word ptr [ebx + 0x80]
        R.eax = (0x88888889) | 0; // 84548e: mov eax, 0x88888889
        R.esi = (((((R.edi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 845493: movsx esi, di
        { const p = BigInt((((R.esi >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 845496: imul ecx, esi
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 845499: imul ecx
        R.edx = (R.add((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 84549b: add edx, ecx
        R.m.w32(((R.esp + 0x40) | 0) >>> 0, (R.esi >>> 0)); // 84549d: mov dword ptr [esp + 0x40], esi
        R.fpush(R.m.s32(((R.esp + 0x40) | 0) >>> 0)); // 8454a1: fild dword ptr [esp + 0x40]
        R.edx = (R.sar((R.edx >>> 0), 0x3, 32)) | 0; // 8454a5: sar edx, 3
        R.ecx = ((R.edx >>> 0)) | 0; // 8454a8: mov ecx, edx
        R.st[0] = R.st[0] * 0.2857142857142857; // 8454aa: fmul qword ptr [0x96d5e0]
        R.ecx = (R.shr((R.ecx >>> 0), 0x1f, 32)) | 0; // 8454b0: shr ecx, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 8454b3: add edx, ecx
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 8454b5: mov dword ptr [esp + 0x1c], edx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 8454b9: fild dword ptr [esp + 0x1c]
        R.m.wf64(((R.esp + 0x34) | 0) >>> 0, R.st[0]); R.fpop(); // 8454bd: fstp qword ptr [esp + 0x34]
        R.fcom(R.st[0], R.f64(((R.esp + 0x34) | 0))); // 8454c1: fcom qword ptr [esp + 0x34]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8454c5: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 8454c7: test ah, 0x41
        if (R.zf) { pc = 0x8454d2; continue; } // 8454ca: je 0x8454d2
        pc = 0x8454cc; continue;
      case 0x8454cc:
        R.fpop(); // 8454cc: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x34) | 0))); // 8454ce: fld qword ptr [esp + 0x34]
        pc = 0x8454d2; continue;
      case 0x8454d2:
        R.ftol(); // 8454d2: call 0x945640
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.eax >>> 0)); // 8454d7: mov dword ptr [esp + 0x30], eax
        pc = 0x845504; continue; // 8454db: jmp 0x845504
      case 0x8454dd:
        R.edx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 8454dd: mov edx, dword ptr [ebp + 0xc]
        R.edi = ((R.edi & 0xffff0000) | (((R.m.u16(((R.edx + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8454e0: mov di, word ptr [edx + 0x80]
        R.esi = (((((R.edi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8454e7: movsx esi, di
        R.m.w32(((R.esp + 0x40) | 0) >>> 0, (R.esi >>> 0)); // 8454ea: mov dword ptr [esp + 0x40], esi
        R.fpush(R.m.s32(((R.esp + 0x40) | 0) >>> 0)); // 8454ee: fild dword ptr [esp + 0x40]
        R.st[0] = R.st[0] * 0.2857142857142857; // 8454f2: fmul qword ptr [0x96d5e0]
        R.ftol(); // 8454f8: call 0x945640
        pc = 0x8454fd; continue;
      case 0x8454fd:
        R.ebx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 8454fd: mov ebx, dword ptr [ebp + 0xc]
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.eax >>> 0)); // 845500: mov dword ptr [esp + 0x30], eax
        pc = 0x845504; continue;
      case 0x845504:
        R.eax = (R.m.u32(((R.ebx + 0x57) | 0) >>> 0)) | 0; // 845504: mov eax, dword ptr [ebx + 0x57]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 845507: test eax, eax
        if (R.zf) { pc = 0x84556e; continue; } // 845509: je 0x84556e
        pc = 0x84550b; continue;
      case 0x84550b:
        R.sub(((R.edi >>> 0) & 0xffff), 0x1d4c, 16); // 84550b: cmp di, 0x1d4c
        if (R.cL) { pc = 0x84553b; continue; } // 845510: jl 0x84553b
        pc = 0x845512; continue;
      case 0x845512:
        R.sub(R.m.u32(((R.ebx + 0x73) | 0) >>> 0), 0x88b8, 32); // 845512: cmp dword ptr [ebx + 0x73], 0x88b8
        if (R.cLE) { pc = 0x84553b; continue; } // 845519: jle 0x84553b
        pc = 0x84551b; continue;
      case 0x84551b:
        R.eax = (((R.m.u16(((R.eax + 0x69) | 0) >>> 0)) << 16 >> 16)) | 0; // 84551b: movsx eax, word ptr [eax + 0x69]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 84551f: lea eax, [eax + eax*4]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 845522: lea eax, [eax + eax*4]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 845525: lea eax, [eax + eax*4]
        R.eax = (R.shl((R.eax >>> 0), 0x2, 32)) | 0; // 845528: shl eax, 2
        R.sub((R.eax >>> 0), (R.esi >>> 0), 32); // 84552b: cmp eax, esi
        if (R.cLE) { pc = 0x845535; continue; } // 84552d: jle 0x845535
        pc = 0x84552f; continue;
      case 0x84552f:
        R.m.w32(((R.esp + 0x40) | 0) >>> 0, (R.eax >>> 0)); // 84552f: mov dword ptr [esp + 0x40], eax
        pc = 0x845572; continue; // 845533: jmp 0x845572
      case 0x845535:
        R.m.w32(((R.esp + 0x40) | 0) >>> 0, (R.esi >>> 0)); // 845535: mov dword ptr [esp + 0x40], esi
        pc = 0x845572; continue; // 845539: jmp 0x845572
      case 0x84553b:
        R.ecx = (((R.m.u16(((R.eax + 0x69) | 0) >>> 0)) << 16 >> 16)) | 0; // 84553b: movsx ecx, word ptr [eax + 0x69]
        R.eax = (((R.ecx + R.ecx * 4) | 0)) | 0; // 84553f: lea eax, [ecx + ecx*4]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 845542: lea eax, [eax + eax*4]
        R.edi = (((R.eax + R.eax * 4) | 0)) | 0; // 845545: lea edi, [eax + eax*4]
        R.eax = ((R.esi >>> 0)) | 0; // 845548: mov eax, esi
        R.edx = R.eax < 0 ? -1 : 0; // 84554a: cdq 
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 84554b: sub eax, edx
        R.eax = (R.sar((R.eax >>> 0), 0x1, 32)) | 0; // 84554d: sar eax, 1
        R.edx = (((R.eax + R.edi * 2) | 0)) | 0; // 84554f: lea edx, [eax + edi*2]
        R.eax = (((R.ecx + R.ecx * 4) | 0)) | 0; // 845552: lea eax, [ecx + ecx*4]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 845555: lea eax, [eax + eax*4]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 845558: lea eax, [eax + eax*4]
        R.eax = (R.shl((R.eax >>> 0), 0x2, 32)) | 0; // 84555b: shl eax, 2
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 84555e: cmp eax, edx
        if (R.cLE) { pc = 0x845568; continue; } // 845560: jle 0x845568
        pc = 0x845562; continue;
      case 0x845562:
        R.m.w32(((R.esp + 0x40) | 0) >>> 0, (R.eax >>> 0)); // 845562: mov dword ptr [esp + 0x40], eax
        pc = 0x845572; continue; // 845566: jmp 0x845572
      case 0x845568:
        R.m.w32(((R.esp + 0x40) | 0) >>> 0, (R.edx >>> 0)); // 845568: mov dword ptr [esp + 0x40], edx
        pc = 0x845572; continue; // 84556c: jmp 0x845572
      case 0x84556e:
        R.m.w32(((R.esp + 0x40) | 0) >>> 0, (R.edi >>> 0)); // 84556e: mov dword ptr [esp + 0x40], edi
        pc = 0x845572; continue;
      case 0x845572:
        R.eax = (R.m.u32(((R.ebx + 0x1db) | 0) >>> 0)) | 0; // 845572: mov eax, dword ptr [ebx + 0x1db]
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 845578: cmp eax, -1
        if (!R.cLE) { pc = 0x845590; continue; } // 84557b: jg 0x845590
        pc = 0x84557d; continue;
      case 0x84557d:
        R.eax = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 84557d: mov eax, dword ptr [ebx]
        R.ecx = (R.m.u32(((0xae2d14) | 0) >>> 0)) | 0; // 84557f: mov ecx, dword ptr [0xae2d14]
        R.eax = (((R.eax + R.eax * 2) | 0)) | 0; // 845585: lea eax, [eax + eax*2]
        R.eax = (R.m.u32(((R.ecx + R.eax * 2) | 0) >>> 0)) | 0; // 845588: mov eax, dword ptr [ecx + eax*2]
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 84558b: cmp eax, -1
        if (R.cLE) { pc = 0x8455b9; continue; } // 84558e: jle 0x8455b9
        pc = 0x845590; continue;
      case 0x845590:
        R.ecx = (((R.eax + R.eax * 2) | 0)) | 0; // 845590: lea ecx, [eax + eax*2]
        R.ecx = (((R.ecx + R.ecx * 8) | 0)) | 0; // 845593: lea ecx, [ecx + ecx*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x2, 32)) | 0; // 845596: shl ecx, 2
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 845599: sub ecx, eax
        R.eax = (R.m.u32(((0xae23d0) | 0) >>> 0)) | 0; // 84559b: mov eax, dword ptr [0xae23d0]
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 8455a0: add ecx, eax
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 8455a2: test ecx, ecx
        R.m.w32(((R.esp + 0x78) | 0) >>> 0, (R.ecx >>> 0)); // 8455a4: mov dword ptr [esp + 0x78], ecx
        if (R.zf) { pc = 0x8455b9; continue; } // 8455a8: je 0x8455b9
        pc = 0x8455aa; continue;
      case 0x8455aa:
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.ecx + 0x69) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8455aa: mov cx, word ptr [ecx + 0x69]
        { const p = BigInt(((((R.ecx >>> 0) & 0xffff)) << 16 >> 16)) * BigInt(600); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = ((R.ecx & 0xffff0000) | (((Number(BigInt.asIntN(32, p))) & 0xffff) << 0)) | 0; } // 8455ae: imul cx, cx, 0x258
        R.m.w32(((R.esp + 0x4c) | 0) >>> 0, (R.ecx >>> 0)); // 8455b3: mov dword ptr [esp + 0x4c], ecx
        pc = 0x8455ea; continue; // 8455b7: jmp 0x8455ea
      case 0x8455b9:
        R.edx = (((R.m.u16(((R.esp + 0x40) | 0) >>> 0)) << 16 >> 16)) | 0; // 8455b9: movsx edx, word ptr [esp + 0x40]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 8455be: mov dword ptr [esp + 0x1c], edx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 8455c2: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 0.8; // 8455c6: fmul qword ptr [0x9689b0]
        R.fcom(R.st[0], 7000.0); // 8455cc: fcom qword ptr [0x96d470]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8455d2: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8455d4: test ah, 1
        if (!R.zf) { pc = 0x8455e1; continue; } // 8455d7: jne 0x8455e1
        pc = 0x8455d9; continue;
      case 0x8455d9:
        R.fpop(); // 8455d9: fstp st(0)
        R.fpush(7000.0); // 8455db: fld qword ptr [0x96d470]
        pc = 0x8455e1; continue;
      case 0x8455e1:
        R.ftol(); // 8455e1: call 0x945640
        R.m.w32(((R.esp + 0x4c) | 0) >>> 0, (R.eax >>> 0)); // 8455e6: mov dword ptr [esp + 0x4c], eax
        pc = 0x8455ea; continue;
      case 0x8455ea:
        R.eax = (R.m.u32(((R.ebx + 0xcf) | 0) >>> 0)) | 0; // 8455ea: mov eax, dword ptr [ebx + 0xcf]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8455f0: test eax, eax
        if (!R.zf) { pc = 0x8455fb; continue; } // 8455f2: jne 0x8455fb
        pc = 0x8455f4; continue;
      case 0x8455f4:
        R.edi = (R.logic((R.edi >>> 0) ^ (R.edi >>> 0), 32)) | 0; // 8455f4: xor edi, edi
        pc = 0x84571e; continue; // 8455f6: jmp 0x84571e
      case 0x8455fb:
        R.ecx = (R.m.u32(((R.eax + 0x69) | 0) >>> 0)) | 0; // 8455fb: mov ecx, dword ptr [eax + 0x69]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 8455fe: test ecx, ecx
        if (!R.zf) { pc = 0x845609; continue; } // 845600: jne 0x845609
        pc = 0x845602; continue;
      case 0x845602:
        R.edi = (R.logic((R.edi >>> 0) ^ (R.edi >>> 0), 32)) | 0; // 845602: xor edi, edi
        pc = 0x84571e; continue; // 845604: jmp 0x84571e
      case 0x845609:
        R.ecx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 845609: mov ecx, dword ptr [ebp + 8]
        R.push(0x1); // 84560c: push 1
        R.push((R.ecx >>> 0)); // 84560e: push ecx
        R.push((R.eax >>> 0)); // 84560f: push eax
        R.call(0x5407e0, { n: 3, thisEcx: false, calleeClean: false }); // 845610: call 0x5407e0
        R.ecx = (R.m.u32(((0xb67a44) | 0) >>> 0)) | 0; // 845615: mov ecx, dword ptr [0xb67a44]
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 84561b: add esp, 0xc
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 84561e: test ecx, ecx
        R.edi = ((R.eax >>> 0)) | 0; // 845620: mov edi, eax
        if (R.zf) { pc = 0x84571e; continue; } // 845622: je 0x84571e
        pc = 0x845628; continue;
      case 0x845628:
        R.sub(R.m.u8(((R.ebp + 0x14) | 0) >>> 0), 0x5, 8); // 845628: cmp byte ptr [ebp + 0x14], 5
        if (R.zf) { pc = 0x84571e; continue; } // 84562c: je 0x84571e
        pc = 0x845632; continue;
      case 0x845632:
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 845632: test ebx, ebx
        if (!R.zf) { pc = 0x84563c; continue; } // 845634: jne 0x84563c
        pc = 0x845636; continue;
      case 0x845636:
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 845636: xor ecx, ecx
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 845638: xor eax, eax
        pc = 0x845650; continue; // 84563a: jmp 0x845650
      case 0x84563c:
        R.eax = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 84563c: mov eax, dword ptr [ebx]
        R.ecx = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 84563e: mov ecx, dword ptr [ecx]
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 845640: lea edx, [eax + eax*8]
        R.eax = (((R.eax + R.edx * 8) | 0)) | 0; // 845643: lea eax, [eax + edx*8]
        R.eax = (R.add((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 845646: add eax, ecx
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.eax + 0x6) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 845648: mov cx, word ptr [eax + 6]
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.eax + 0x8) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 84564c: mov ax, word ptr [eax + 8]
        pc = 0x845650; continue;
      case 0x845650:
        R.edx = (((((R.ecx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 845650: movsx edx, cx
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 845653: mov dword ptr [esp + 0x1c], edx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 845657: fild dword ptr [esp + 0x1c]
        R.eax = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 84565b: movsx eax, ax
        R.st[0] = R.st[0] * 0.67; // 84565e: fmul qword ptr [0x968f80]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 845664: mov dword ptr [esp + 0x1c], eax
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 845668: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 0.33; // 84566c: fmul qword ptr [0x968f78]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 845672: faddp st(1)
        R.ftol(); // 845674: call 0x945640
        R.sub(((R.eax >>> 0) & 0xffff), 0x1388, 16); // 845679: cmp ax, 0x1388
        if (!R.cL) { pc = 0x8456cc; continue; } // 84567d: jge 0x8456cc
        pc = 0x84567f; continue;
      case 0x84567f:
        R.ecx = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 84567f: movsx ecx, ax
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ecx >>> 0)); // 845682: mov dword ptr [esp + 0x1c], ecx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 845686: fild dword ptr [esp + 0x1c]
        R.edx = (((((R.edi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 84568a: movsx edx, di
        R.st[0] = R.st[0] * 0.0008; // 84568d: fmul qword ptr [0x96a618]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 845693: mov dword ptr [esp + 0x1c], edx
        R.st[0] = 5.0 - R.st[0]; // 845697: fsubr qword ptr [0x9688a0]
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 84569d: fild dword ptr [esp + 0x1c]
        R.fpush(R.st[0]); // 8456a1: fld st(0)
        R.st[0] = R.st[0] / R.st[2]; // 8456a3: fdiv st(2)
        R.m.wf64(((R.esp + 0x34) | 0) >>> 0, R.st[0]); R.fpop(); // 8456a5: fstp qword ptr [esp + 0x34]
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 8456a9: fxch st(1)
        R.st[0] = R.st[0] * 1000.0; // 8456ab: fmul qword ptr [0x968908]
        R.st[0] = R.st[1] - R.st[0]; // 8456b1: fsubr st(1)
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 8456b3: fxch st(1)
        R.fpop(); // 8456b5: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x34) | 0))); // 8456b7: fld qword ptr [esp + 0x34]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 8456bb: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8456bd: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 8456bf: test ah, 0x41
        if (!R.zf) { pc = 0x845717; continue; } // 8456c2: jne 0x845717
        pc = 0x8456c4; continue;
      case 0x8456c4:
        R.fpop(); // 8456c4: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x34) | 0))); // 8456c6: fld qword ptr [esp + 0x34]
        pc = 0x845717; continue; // 8456ca: jmp 0x845717
      case 0x8456cc:
        R.eax = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8456cc: movsx eax, ax
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 8456cf: mov dword ptr [esp + 0x1c], eax
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 8456d3: fild dword ptr [esp + 0x1c]
        R.ecx = (((((R.edi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8456d7: movsx ecx, di
        R.st[0] = R.st[0] * 0.0001; // 8456da: fmul qword ptr [0x96a5c0]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ecx >>> 0)); // 8456e0: mov dword ptr [esp + 0x1c], ecx
        R.st[0] = R.st[0] + 0.5; // 8456e4: fadd qword ptr [0x968968]
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 8456ea: fild dword ptr [esp + 0x1c]
        R.fpush(R.st[0]); // 8456ee: fld st(0)
        R.st[0] = R.st[0] * R.st[2]; // 8456f0: fmul st(2)
        R.m.wf64(((R.esp + 0x34) | 0) >>> 0, R.st[0]); R.fpop(); // 8456f2: fstp qword ptr [esp + 0x34]
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 8456f6: fxch st(1)
        R.st[0] = R.st[0] * 1000.0; // 8456f8: fmul qword ptr [0x968908]
        R.st[0] = R.st[0] + R.st[1]; // 8456fe: fadd st(1)
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 845700: fxch st(1)
        R.fpop(); // 845702: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x34) | 0))); // 845704: fld qword ptr [esp + 0x34]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 845708: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84570a: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 84570c: test ah, 1
        if (R.zf) { pc = 0x845717; continue; } // 84570f: je 0x845717
        pc = 0x845711; continue;
      case 0x845711:
        R.fpop(); // 845711: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x34) | 0))); // 845713: fld qword ptr [esp + 0x34]
        pc = 0x845717; continue;
      case 0x845717:
        R.ftol(); // 845717: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 84571c: mov edi, eax
        pc = 0x84571e; continue;
      case 0x84571e:
        R.esi = ((R.esi & 0xffff0000) | (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 84571e: mov si, word ptr [ebx + 0x80]
        R.push((R.ebx >>> 0)); // 845725: push ebx
        R.call(0x53b900, { n: 1, thisEcx: false, calleeClean: false }); // 845726: call 0x53b900
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 84572b: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84572e: test eax, eax
        if (!R.zf) { pc = 0x8457da; continue; } // 845730: jne 0x8457da
        pc = 0x845736; continue;
      case 0x845736:
        R.ecx = (R.m.u32(((0xae2a38) | 0) >>> 0)) | 0; // 845736: mov ecx, dword ptr [0xae2a38]
        R.push((R.ebx >>> 0)); // 84573c: push ebx
        R.call(0x5a0590, { n: 1, thisEcx: true, calleeClean: true }); // 84573d: call 0x5a0590
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 845742: test eax, eax
        if (R.zf) { pc = 0x8457da; continue; } // 845744: je 0x8457da
        pc = 0x84574a; continue;
      case 0x84574a:
        R.ecx = ((R.eax >>> 0)) | 0; // 84574a: mov ecx, eax
        R.call(0x5986b0, { n: 0, thisEcx: true, calleeClean: false }); // 84574c: call 0x5986b0
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 845751: movsx eax, al
        R.eax = (R.add((R.eax >>> 0), 0x2, 32)) | 0; // 845754: add eax, 2
        R.sub((R.eax >>> 0), 0x4, 32); // 845757: cmp eax, 4
        if (!R.cBE) { pc = 0x8457da; continue; } // 84575a: ja 0x8457da
        pc = 0x84575c; continue;
      case 0x84575c:
        pc = [0x8457c2, 0x8457af, 0x8457da, 0x845789, 0x845763][R.eax >>> 0]; continue; // 84575c: jmp dword ptr [eax*4 + 0x846890]
      case 0x845763:
        R.edx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 845763: movsx edx, si
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 845766: mov dword ptr [esp + 0x1c], edx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 84576a: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 1.5; // 84576e: fmul qword ptr [0x968940]
        R.ftol(); // 845774: call 0x945640
        R.esi = ((R.eax >>> 0)) | 0; // 845779: mov esi, eax
        R.sub(((R.esi >>> 0) & 0xffff), 0x1676, 16); // 84577b: cmp si, 0x1676
        if (!R.cL) { pc = 0x8457da; continue; } // 845780: jge 0x8457da
        pc = 0x845782; continue;
      case 0x845782:
        R.esi = (0x1676) | 0; // 845782: mov esi, 0x1676
        pc = 0x8457da; continue; // 845787: jmp 0x8457da
      case 0x845789:
        R.eax = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 845789: movsx eax, si
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 84578c: mov dword ptr [esp + 0x1c], eax
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 845790: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 1.25; // 845794: fmul qword ptr [0x968928]
        R.ftol(); // 84579a: call 0x945640
        R.esi = ((R.eax >>> 0)) | 0; // 84579f: mov esi, eax
        R.sub(((R.esi >>> 0) & 0xffff), 0x109a, 16); // 8457a1: cmp si, 0x109a
        if (!R.cL) { pc = 0x8457da; continue; } // 8457a6: jge 0x8457da
        pc = 0x8457a8; continue;
      case 0x8457a8:
        R.esi = (0x109a) | 0; // 8457a8: mov esi, 0x109a
        pc = 0x8457da; continue; // 8457ad: jmp 0x8457da
      case 0x8457af:
        R.ecx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8457af: movsx ecx, si
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ecx >>> 0)); // 8457b2: mov dword ptr [esp + 0x1c], ecx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 8457b6: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 0.85; // 8457ba: fmul qword ptr [0x969520]
        pc = 0x8457d3; continue; // 8457c0: jmp 0x8457d3
      case 0x8457c2:
        R.edx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8457c2: movsx edx, si
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 8457c5: mov dword ptr [esp + 0x1c], edx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 8457c9: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 0.7; // 8457cd: fmul qword ptr [0x968e40]
        pc = 0x8457d3; continue;
      case 0x8457d3:
        R.ftol(); // 8457d3: call 0x945640
        R.esi = ((R.eax >>> 0)) | 0; // 8457d8: mov esi, eax
        pc = 0x8457da; continue;
      case 0x8457da:
        R.push((R.ebx >>> 0)); // 8457da: push ebx
        R.call(0x53b900, { n: 1, thisEcx: false, calleeClean: false }); // 8457db: call 0x53b900
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8457e0: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8457e3: test eax, eax
        if (R.zf) { pc = 0x845807; continue; } // 8457e5: je 0x845807
        pc = 0x8457e7; continue;
      case 0x8457e7:
        R.push((R.ebx >>> 0)); // 8457e7: push ebx
        R.call(0x5409b0, { n: 1, thisEcx: false, calleeClean: false }); // 8457e8: call 0x5409b0
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8457ed: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8457f0: test eax, eax
        if (!R.zf) { pc = 0x845807; continue; } // 8457f2: jne 0x845807
        pc = 0x8457f4; continue;
      case 0x8457f4:
        R.eax = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8457f4: movsx eax, si
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 8457f7: mov dword ptr [esp + 0x1c], eax
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 8457fb: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 1.45; // 8457ff: fmul qword ptr [0x96f940]
        pc = 0x84583f; continue; // 845805: jmp 0x84583f
      case 0x845807:
        R.eax = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 845807: mov eax, dword ptr [ebx]
        R.edx = (R.m.u32(((R.esp + 0x90) | 0) >>> 0)) | 0; // 845809: mov edx, dword ptr [esp + 0x90]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 845810: lea ecx, [eax + eax*8]
        R.eax = (R.m.u32(((R.edx + 0xdc) | 0) >>> 0)) | 0; // 845813: mov eax, dword ptr [edx + 0xdc]
        R.edx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 845819: movsx edx, si
        R.ecx = (((R.m.u16(((R.ecx + R.eax + 0x5) | 0) >>> 0)) << 16 >> 16)) | 0; // 84581c: movsx ecx, word ptr [ecx + eax + 5]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ecx >>> 0)); // 845821: mov dword ptr [esp + 0x1c], ecx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 845825: fild dword ptr [esp + 0x1c]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 845829: mov dword ptr [esp + 0x1c], edx
        R.st[0] = R.st[0] * 0.4; // 84582d: fmul qword ptr [0x968e00]
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 845833: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 0.6; // 845837: fmul qword ptr [0x968e48]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 84583d: faddp st(1)
        pc = 0x84583f; continue;
      case 0x84583f:
        R.ftol(); // 84583f: call 0x945640
        R.ecx = (((R.m.u16(((R.esp + 0x4c) | 0) >>> 0)) << 16 >> 16)) | 0; // 845844: movsx ecx, word ptr [esp + 0x4c]
        R.edx = (((R.m.u16(((R.esp + 0x40) | 0) >>> 0)) << 16 >> 16)) | 0; // 845849: movsx edx, word ptr [esp + 0x40]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ecx >>> 0)); // 84584e: mov dword ptr [esp + 0x1c], ecx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 845852: fild dword ptr [esp + 0x1c]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 845856: mov dword ptr [esp + 0x1c], edx
        R.ecx = (((((R.edi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 84585a: movsx ecx, di
        R.st[0] = R.st[0] * R.f32(((R.esp + 0x60) | 0)); // 84585d: fmul dword ptr [esp + 0x60]
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 845861: fild dword ptr [esp + 0x1c]
        R.edx = (((R.m.u16(((R.esp + 0x30) | 0) >>> 0)) << 16 >> 16)) | 0; // 845865: movsx edx, word ptr [esp + 0x30]
        R.st[0] = R.st[0] * R.f32(((R.esp + 0x84) | 0)); // 84586a: fmul dword ptr [esp + 0x84]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ecx >>> 0)); // 845871: mov dword ptr [esp + 0x1c], ecx
        R.eax = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 845875: movsx eax, ax
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 845878: faddp st(1)
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 84587a: fild dword ptr [esp + 0x1c]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 84587e: mov dword ptr [esp + 0x1c], edx
        R.st[0] = R.st[0] * R.f32(((R.esp + 0x74) | 0)); // 845882: fmul dword ptr [esp + 0x74]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 845886: faddp st(1)
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 845888: fild dword ptr [esp + 0x1c]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 84588c: mov dword ptr [esp + 0x1c], eax
        R.st[0] = R.st[0] * R.f32(((R.esp + 0x88) | 0)); // 845890: fmul dword ptr [esp + 0x88]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 845897: faddp st(1)
        R.st[0] = R.st[0] + R.m.s32(((R.esp + 0x1c) | 0) >>> 0); // 845899: fiadd dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] / R.f32(((R.esp + 0x8c) | 0)); // 84589d: fdiv dword ptr [esp + 0x8c]
        R.ftol(); // 8458a4: call 0x945640
        R.push((R.ebx >>> 0)); // 8458a9: push ebx
        R.esi = ((R.eax >>> 0)) | 0; // 8458aa: mov esi, eax
        R.call(0x53b900, { n: 1, thisEcx: false, calleeClean: false }); // 8458ac: call 0x53b900
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8458b1: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8458b4: test eax, eax
        if (R.zf) { pc = 0x8458db; continue; } // 8458b6: je 0x8458db
        pc = 0x8458b8; continue;
      case 0x8458b8:
        R.edx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 8458b8: mov edx, dword ptr [ebp + 8]
        R.ecx = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 8458bb: mov ecx, dword ptr [ebx + 0x53]
        R.sub((R.ecx >>> 0), R.m.u32(((R.edx + 0x1a) | 0) >>> 0), 32); // 8458be: cmp ecx, dword ptr [edx + 0x1a]
        if (!R.zf) { pc = 0x8458db; continue; } // 8458c1: jne 0x8458db
        pc = 0x8458c3; continue;
      case 0x8458c3:
        R.eax = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8458c3: movsx eax, si
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 8458c6: mov dword ptr [esp + 0x1c], eax
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 8458ca: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 1.45; // 8458ce: fmul qword ptr [0x96f940]
        R.ftol(); // 8458d4: call 0x945640
        R.esi = ((R.eax >>> 0)) | 0; // 8458d9: mov esi, eax
        pc = 0x8458db; continue;
      case 0x8458db:
        R.push((R.ebx >>> 0)); // 8458db: push ebx
        R.call(0x53b900, { n: 1, thisEcx: false, calleeClean: false }); // 8458dc: call 0x53b900
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8458e1: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8458e4: test eax, eax
        if (!R.zf) { pc = 0x845936; continue; } // 8458e6: jne 0x845936
        pc = 0x8458e8; continue;
      case 0x8458e8:
        R.ecx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 8458e8: mov ecx, dword ptr [ebp + 0xc]
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.ecx + 0x64) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8458eb: mov bl, byte ptr [ecx + 0x64]
        R.sub(((R.ebx >>> 0) & 0xff), 0x1, 8); // 8458ee: cmp bl, 1
        if (R.zf) { pc = 0x845936; continue; } // 8458f1: je 0x845936
        pc = 0x8458f3; continue;
      case 0x8458f3:
        R.edi = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 8458f3: mov edi, dword ptr [ebp + 8]
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 8458f6: xor ecx, ecx
        R.eax = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8458f8: movsx eax, si
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.edi + 0x22) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8458fb: mov cl, byte ptr [edi + 0x22]
        { const p = BigInt((((R.ecx >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 8458fe: imul ecx, ecx
        R.ecx = (R.add((R.ecx >>> 0), 0x190, 32)) | 0; // 845901: add ecx, 0x190
        R.edx = (((R.ecx + R.ecx * 4) | 0)) | 0; // 845907: lea edx, [ecx + ecx*4]
        R.ecx = ((R.eax >>> 0)) | 0; // 84590a: mov ecx, eax
        R.ecx = (R.sub((R.ecx >>> 0), (R.edx >>> 0), 32)) | 0; // 84590c: sub ecx, edx
        R.edx = R.eax < 0 ? -1 : 0; // 84590e: cdq 
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 84590f: sub eax, edx
        R.eax = (R.sar((R.eax >>> 0), 0x1, 32)) | 0; // 845911: sar eax, 1
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 845913: cmp eax, ecx
        R.esi = ((R.eax >>> 0)) | 0; // 845915: mov esi, eax
        if (R.cL) { pc = 0x84591b; continue; } // 845917: jl 0x84591b
        pc = 0x845919; continue;
      case 0x845919:
        R.esi = ((R.ecx >>> 0)) | 0; // 845919: mov esi, ecx
        pc = 0x84591b; continue;
      case 0x84591b:
        R.sub(((R.ebx >>> 0) & 0xff), 0x3, 8); // 84591b: cmp bl, 3
        if (!R.zf) { pc = 0x845939; continue; } // 84591e: jne 0x845939
        pc = 0x845920; continue;
      case 0x845920:
        R.eax = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 845920: movsx eax, si
        R.esi = (((R.eax + -0x7d0) | 0)) | 0; // 845923: lea esi, [eax - 0x7d0]
        R.edx = R.eax < 0 ? -1 : 0; // 845929: cdq 
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 84592a: sub eax, edx
        R.eax = (R.sar((R.eax >>> 0), 0x1, 32)) | 0; // 84592c: sar eax, 1
        R.sub((R.eax >>> 0), (R.esi >>> 0), 32); // 84592e: cmp eax, esi
        if (!R.cL) { pc = 0x845939; continue; } // 845930: jge 0x845939
        pc = 0x845932; continue;
      case 0x845932:
        R.esi = ((R.eax >>> 0)) | 0; // 845932: mov esi, eax
        pc = 0x845939; continue; // 845934: jmp 0x845939
      case 0x845936:
        R.edi = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 845936: mov edi, dword ptr [ebp + 8]
        pc = 0x845939; continue;
      case 0x845939:
        R.eax = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 845939: movsx eax, si
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 84593c: mov dword ptr [esp + 0x1c], eax
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 845940: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 1.5; // 845944: fmul qword ptr [0x968940]
        R.st[0] = R.st[0] - 5000.0; // 84594a: fsub qword ptr [0x9688e8]
        R.ftol(); // 845950: call 0x945640
        R.esi = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 845955: mov esi, dword ptr [ebp + 0xc]
        R.ecx = ((R.eax >>> 0)) | 0; // 845958: mov ecx, eax
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.ecx >>> 0)); // 84595a: mov dword ptr [esp + 0x34], ecx
        R.eax = (R.m.u32(((R.esi + 0x53) | 0) >>> 0)) | 0; // 84595e: mov eax, dword ptr [esi + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 845961: test eax, eax
        if (R.zf) { pc = 0x845a18; continue; } // 845963: je 0x845a18
        pc = 0x845969; continue;
      case 0x845969:
        R.ecx = (((((R.ecx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 845969: movsx ecx, cx
        R.ecx = (R.add((R.ecx >>> 0), 0x1388, 32)) | 0; // 84596c: add ecx, 0x1388
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ecx >>> 0)); // 845972: mov dword ptr [esp + 0x1c], ecx
        R.ecx = (R.m.u32(((R.edi + 0x61) | 0) >>> 0)) | 0; // 845976: mov ecx, dword ptr [edi + 0x61]
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 845979: fild dword ptr [esp + 0x1c]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 84597d: test ecx, ecx
        R.fpush(R.st[0]); // 84597f: fld st(0)
        R.st[0] = R.st[0] * 6.666666666666667e-05; // 845981: fmul qword ptr [0x968d78]
        R.st[0] = R.st[0] * R.st[1]; // 845987: fmul st(1)
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 845989: fstp qword ptr [esp + 0x4c]
        R.fpop(); // 84598d: fstp st(0)
        if (R.zf) { pc = 0x8459b1; continue; } // 84598f: je 0x8459b1
        pc = 0x845991; continue;
      case 0x845991:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x77) | 0) >>> 0)) & 0xff) << 0)) | 0; // 845991: mov dl, byte ptr [eax + 0x77]
        R.ecx = (R.m.u32(((0xb74350) | 0) >>> 0)) | 0; // 845994: mov ecx, dword ptr [0xb74350]
        R.push(0x1); // 84599a: push 1
        R.push((R.edx >>> 0)); // 84599c: push edx
        R.push((R.esi >>> 0)); // 84599d: push esi
        R.push((R.edi >>> 0)); // 84599e: push edi
        R.call(0x7c6830, { n: 4, thisEcx: true, calleeClean: true }); // 84599f: call 0x7c6830
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 8459a4: movsx eax, al
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 8459a7: mov dword ptr [esp + 0x1c], eax
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 8459ab: fild dword ptr [esp + 0x1c]
        pc = 0x8459b7; continue; // 8459af: jmp 0x8459b7
      case 0x8459b1:
        R.fpush(10.0); // 8459b1: fld qword ptr [0x9688b0]
        pc = 0x8459b7; continue;
      case 0x8459b7:
        R.fpush(R.st[0]); // 8459b7: fld st(0)
        R.st[0] = R.st[0] * 0.1; // 8459b9: fmul qword ptr [0x967880]
        R.m.wf64(((R.esp + 0x24) | 0) >>> 0, R.st[0]); R.fpop(); // 8459bf: fstp qword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 200.0; // 8459c3: fmul qword ptr [0x96a648]
        R.st[0] = 12000.0 - R.st[0]; // 8459c9: fsubr qword ptr [0x96f938]
        R.st[0] = R.f64(((R.esp + 0x4c) | 0)) / R.st[0]; // 8459cf: fdivr qword ptr [esp + 0x4c]
        R.fpush(R.f64(((R.esp + 0x24) | 0))); // 8459d3: fld qword ptr [esp + 0x24]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 8459d7: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8459d9: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 8459db: test ah, 0x41
        if (!R.zf) { pc = 0x8459e6; continue; } // 8459de: jne 0x8459e6
        pc = 0x8459e0; continue;
      case 0x8459e0:
        R.fpop(); // 8459e0: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x24) | 0))); // 8459e2: fld qword ptr [esp + 0x24]
        pc = 0x8459e6; continue;
      case 0x8459e6:
        R.st[0] = R.st[0] + 0.2; // 8459e6: fadd qword ptr [0x968918]
        R.ecx = (R.m.u32(((R.ebp + 0x18) | 0) >>> 0)) | 0; // 8459ec: mov ecx, dword ptr [ebp + 0x18]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 8459ef: test ecx, ecx
        R.m.wf64(((R.esp + 0x24) | 0) >>> 0, R.st[0]); // 8459f1: fst qword ptr [esp + 0x24]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x14) | 0)); // 8459f5: fmul qword ptr [esp + 0x14]
        R.m.wf64(((R.esp + 0x14) | 0) >>> 0, R.st[0]); // 8459f9: fst qword ptr [esp + 0x14]
        if (R.zf) { pc = 0x845a1c; continue; } // 8459fd: je 0x845a1c
        pc = 0x8459ff; continue;
      case 0x8459ff:
        R.fpush(R.f64(((R.esp + 0x24) | 0))); // 8459ff: fld qword ptr [esp + 0x24]
        R.fcom(R.st[0], 0.6); R.fpop(); // 845a03: fcomp qword ptr [0x968e48]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 845a09: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 845a0b: test ah, 1
        if (R.zf) { pc = 0x845a1c; continue; } // 845a0e: je 0x845a1c
        pc = 0x845a10; continue;
      case 0x845a10:
        R.m.w32(((R.ecx) | 0) >>> 0, R.logic(R.m.u32(((R.ecx) | 0) >>> 0) | 0x10000, 32)); // 845a10: or dword ptr [ecx], 0x10000
        pc = 0x845a1c; continue; // 845a16: jmp 0x845a1c
      case 0x845a18:
        R.fpush(R.f64(((R.esp + 0x14) | 0))); // 845a18: fld qword ptr [esp + 0x14]
        pc = 0x845a1c; continue;
      case 0x845a1c:
        R.ebx = (R.m.u32(((R.esp + 0x48) | 0) >>> 0)) | 0; // 845a1c: mov ebx, dword ptr [esp + 0x48]
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 845a20: test ebx, ebx
        if (R.zf) { pc = 0x845a53; continue; } // 845a22: je 0x845a53
        pc = 0x845a24; continue;
      case 0x845a24:
        R.eax = (R.m.u32(((R.esi + 0x53) | 0) >>> 0)) | 0; // 845a24: mov eax, dword ptr [esi + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 845a27: test eax, eax
        if (R.zf) { pc = 0x845a45; continue; } // 845a29: je 0x845a45
        pc = 0x845a2b; continue;
      case 0x845a2b:
        R.push(0x1); // 845a2b: push 1
        R.push((R.eax >>> 0)); // 845a2d: push eax
        R.push((R.edi >>> 0)); // 845a2e: push edi
        R.fpop(); // 845a2f: fstp st(0)
        R.call(0x53d980, { n: 3, thisEcx: false, calleeClean: false }); // 845a31: call 0x53d980
        R.fpush(R.f64(((R.esp + 0x20) | 0))); // 845a36: fld qword ptr [esp + 0x20]
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 845a3a: add esp, 0xc
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 845a3d: test eax, eax
        if (R.zf) { pc = 0x845b1d; continue; } // 845a3f: je 0x845b1d
        pc = 0x845a45; continue;
      case 0x845a45:
        R.ecx = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 845a45: mov ecx, dword ptr [ebx + 0x53]
        R.eax = (R.m.u32(((R.esi + 0x53) | 0) >>> 0)) | 0; // 845a48: mov eax, dword ptr [esi + 0x53]
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 845a4b: cmp ecx, eax
        if (R.zf) { pc = 0x845b1d; continue; } // 845a4d: je 0x845b1d
        pc = 0x845a53; continue;
      case 0x845a53:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebp + 0x14) | 0) >>> 0)) & 0xff) << 0)) | 0; // 845a53: mov al, byte ptr [ebp + 0x14]
        R.sub(((R.eax >>> 0) & 0xff), 0x5, 8); // 845a56: cmp al, 5
        if (R.zf) { pc = 0x845ae0; continue; } // 845a58: je 0x845ae0
        pc = 0x845a5e; continue;
      case 0x845a5e:
        R.sub(((R.eax >>> 0) & 0xff), 0xc, 8); // 845a5e: cmp al, 0xc
        if (R.zf) { pc = 0x845ae0; continue; } // 845a60: je 0x845ae0
        pc = 0x845a62; continue;
      case 0x845a62:
        R.eax = (R.m.u32(((R.esi + 0xcf) | 0) >>> 0)) | 0; // 845a62: mov eax, dword ptr [esi + 0xcf]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 845a68: test eax, eax
        if (R.zf) { pc = 0x845ae0; continue; } // 845a6a: je 0x845ae0
        pc = 0x845a6c; continue;
      case 0x845a6c:
        R.eax = (R.m.u32(((R.eax + 0x1a) | 0) >>> 0)) | 0; // 845a6c: mov eax, dword ptr [eax + 0x1a]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 845a6f: test eax, eax
        if (R.zf) { pc = 0x845ae0; continue; } // 845a71: je 0x845ae0
        pc = 0x845a73; continue;
      case 0x845a73:
        R.push(0x1); // 845a73: push 1
        R.push((R.eax >>> 0)); // 845a75: push eax
        R.push((R.edi >>> 0)); // 845a76: push edi
        R.fpop(); // 845a77: fstp st(0)
        R.call(0x53d980, { n: 3, thisEcx: false, calleeClean: false }); // 845a79: call 0x53d980
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 845a7e: add esp, 0xc
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 845a81: test eax, eax
        if (!R.zf) { pc = 0x845adc; continue; } // 845a83: jne 0x845adc
        pc = 0x845a85; continue;
      case 0x845a85:
        R.edx = (R.m.u32(((R.esp + 0x5c) | 0) >>> 0)) | 0; // 845a85: mov edx, dword ptr [esp + 0x5c]
        R.eax = (((R.edx + -0x2) | 0)) | 0; // 845a89: lea eax, [edx - 2]
        R.sub((R.eax >>> 0), 0xd, 32); // 845a8c: cmp eax, 0xd
        if (!R.cBE) { pc = 0x845ad0; continue; } // 845a8f: ja 0x845ad0
        pc = 0x845a91; continue;
      case 0x845a91:
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 845a91: xor ecx, ecx
        R.ecx = ((R.ecx & 0xffffff00) | (((ROT(RO_8468b8_1u, 0x8468b8, 1, ((R.eax + 0x8468b8) | 0))) & 0xff) << 0)) | 0; // 845a93: mov cl, byte ptr [eax + 0x8468b8]
        pc = [0x845aa0, 0x845aac, 0x845ab8, 0x845ac4, 0x845ad0][R.ecx >>> 0]; continue; // 845a99: jmp dword ptr [ecx*4 + 0x8468a4]
      case 0x845aa0:
        R.fpush(R.f64(((R.esp + 0x14) | 0))); // 845aa0: fld qword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.85; // 845aa4: fmul qword ptr [0x969520]
        pc = 0x845b19; continue; // 845aaa: jmp 0x845b19
      case 0x845aac:
        R.fpush(R.f64(((R.esp + 0x14) | 0))); // 845aac: fld qword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.75; // 845ab0: fmul qword ptr [0x969040]
        pc = 0x845b19; continue; // 845ab6: jmp 0x845b19
      case 0x845ab8:
        R.fpush(R.f64(((R.esp + 0x14) | 0))); // 845ab8: fld qword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.65; // 845abc: fmul qword ptr [0x96a5d0]
        pc = 0x845b19; continue; // 845ac2: jmp 0x845b19
      case 0x845ac4:
        R.fpush(R.f64(((R.esp + 0x14) | 0))); // 845ac4: fld qword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.5; // 845ac8: fmul qword ptr [0x968968]
        pc = 0x845b19; continue; // 845ace: jmp 0x845b19
      case 0x845ad0:
        R.fpush(R.f64(((R.esp + 0x14) | 0))); // 845ad0: fld qword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.01; // 845ad4: fmul qword ptr [0x967898]
        pc = 0x845b19; continue; // 845ada: jmp 0x845b19
      case 0x845adc:
        R.fpush(R.f64(((R.esp + 0x14) | 0))); // 845adc: fld qword ptr [esp + 0x14]
        pc = 0x845ae0; continue;
      case 0x845ae0:
        R.edx = (R.m.u32(((R.esp + 0x5c) | 0) >>> 0)) | 0; // 845ae0: mov edx, dword ptr [esp + 0x5c]
        R.eax = (((R.edx + -0x2) | 0)) | 0; // 845ae4: lea eax, [edx - 2]
        R.sub((R.eax >>> 0), 0xd, 32); // 845ae7: cmp eax, 0xd
        if (!R.cBE) { pc = 0x845b13; continue; } // 845aea: ja 0x845b13
        pc = 0x845aec; continue;
      case 0x845aec:
        pc = [0x845afb, 0x845afb, 0x845afb, 0x845af3, 0x845b03, 0x845b0b, 0x845b0b, 0x845b0b, 0x845b0b, 0x845b13, 0x845af3, 0x845b03, 0x845b0b, 0x845b0b][R.eax >>> 0]; continue; // 845aec: jmp dword ptr [eax*4 + 0x8468c8]
      case 0x845af3:
        R.st[0] = R.st[0] * 0.3; // 845af3: fmul qword ptr [0x968e80]
        pc = 0x845b19; continue; // 845af9: jmp 0x845b19
      case 0x845afb:
        R.st[0] = R.st[0] * 0.25; // 845afb: fmul qword ptr [0x9689e0]
        pc = 0x845b19; continue; // 845b01: jmp 0x845b19
      case 0x845b03:
        R.st[0] = R.st[0] * 0.225; // 845b03: fmul qword ptr [0x96d6d8]
        pc = 0x845b19; continue; // 845b09: jmp 0x845b19
      case 0x845b0b:
        R.st[0] = R.st[0] * 0.2; // 845b0b: fmul qword ptr [0x968918]
        pc = 0x845b19; continue; // 845b11: jmp 0x845b19
      case 0x845b13:
        R.st[0] = R.st[0] * 0.001; // 845b13: fmul qword ptr [0x96a350]
        pc = 0x845b19; continue;
      case 0x845b19:
        R.m.wf64(((R.esp + 0x14) | 0) >>> 0, R.st[0]); // 845b19: fst qword ptr [esp + 0x14]
        pc = 0x845b1d; continue;
      case 0x845b1d:
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 845b1d: test ebx, ebx
        if (!R.zf) { pc = 0x845b30; continue; } // 845b1f: jne 0x845b30
        pc = 0x845b21; continue;
      case 0x845b21:
        R.st[0] = R.st[0] * 2.5; // 845b21: fmul qword ptr [0x968e18]
        R.m.wf64(((R.esp + 0x14) | 0) >>> 0, R.st[0]); // 845b27: fst qword ptr [esp + 0x14]
        pc = 0x845bd8; continue; // 845b2b: jmp 0x845bd8
      case 0x845b30:
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.edi + 0x40) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 845b30: mov cx, word ptr [edi + 0x40]
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 845b34: xor eax, eax
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 845b36: mov ax, word ptr [0xae2c92]
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.edi + 0x3e) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 845b3c: mov dx, word ptr [edi + 0x3e]
        R.ecx = (R.logic((R.ecx >>> 0) & 0xffff, 32)) | 0; // 845b40: and ecx, 0xffff
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 845b46: sub eax, ecx
        R.esi = (((R.m.u8(((R.edi + 0x59) | 0) >>> 0)) << 24 >> 24)) | 0; // 845b48: movsx esi, byte ptr [edi + 0x59]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 845b4c: lea ecx, [eax + eax*8]
        R.edx = (((((R.edx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 845b4f: movsx edx, dx
        R.eax = (((R.eax + R.ecx * 8) | 0)) | 0; // 845b52: lea eax, [eax + ecx*8]
        R.ecx = (((R.m.u16(((0xae2c90) | 0) >>> 0)) << 16 >> 16)) | 0; // 845b55: movsx ecx, word ptr [0xae2c90]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 845b5c: lea eax, [eax + eax*4]
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 845b5f: sub eax, edx
        R.eax = (R.add((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 845b61: add eax, ecx
        R.ecx = (((R.esi + 0x8) | 0)) | 0; // 845b63: lea ecx, [esi + 8]
        R.edx = ((R.ecx >>> 0)) | 0; // 845b66: mov edx, ecx
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 845b68: shl edx, 4
        R.edx = (R.sub((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 845b6b: sub edx, ecx
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 845b6d: cmp eax, edx
        if (R.cL) { pc = 0x8467ef; continue; } // 845b6f: jl 0x8467ef
        pc = 0x845b75; continue;
      case 0x845b75:
        R.ecx = ((R.eax >>> 0)) | 0; // 845b75: mov ecx, eax
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 845b77: imul ecx, eax
        R.eax = (0x66666667) | 0; // 845b7a: mov eax, 0x66666667
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 845b7f: imul ecx
        R.edx = (R.sar((R.edx >>> 0), 0x3, 32)) | 0; // 845b81: sar edx, 3
        R.eax = ((R.edx >>> 0)) | 0; // 845b84: mov eax, edx
        R.ecx = (((R.esi + 0x6) | 0)) | 0; // 845b86: lea ecx, [esi + 6]
        R.eax = (R.shr((R.eax >>> 0), 0x1f, 32)) | 0; // 845b89: shr eax, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 845b8c: add edx, eax
        R.sub((R.ecx >>> 0), 0x1, 32); // 845b8e: cmp ecx, 1
        R.eax = ((R.edx >>> 0)) | 0; // 845b91: mov eax, edx
        if (!R.cL) { pc = 0x845b9a; continue; } // 845b93: jge 0x845b9a
        pc = 0x845b95; continue;
      case 0x845b95:
        R.ecx = (0x1) | 0; // 845b95: mov ecx, 1
        pc = 0x845b9a; continue;
      case 0x845b9a:
        R.edx = R.eax < 0 ? -1 : 0; // 845b9a: cdq 
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.ecx >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 845b9b: idiv ecx
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 845b9d: test eax, eax
        R.m.w32(((R.esp + 0x4c) | 0) >>> 0, (R.eax >>> 0)); // 845b9f: mov dword ptr [esp + 0x4c], eax
        if (R.cL) { pc = 0x8467ef; continue; } // 845ba3: jl 0x8467ef
        pc = 0x845ba9; continue;
      case 0x845ba9:
        R.sub((R.eax >>> 0), 0x190, 32); // 845ba9: cmp eax, 0x190
        if (R.cLE) { pc = 0x845bba; continue; } // 845bae: jle 0x845bba
        pc = 0x845bb0; continue;
      case 0x845bb0:
        R.m.w32(((R.esp + 0x4c) | 0) >>> 0, 0x190); // 845bb0: mov dword ptr [esp + 0x4c], 0x190
        pc = 0x845bc2; continue; // 845bb8: jmp 0x845bc2
      case 0x845bba:
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 845bba: test eax, eax
        if (R.zf) { pc = 0x8467ef; continue; } // 845bbc: je 0x8467ef
        pc = 0x845bc2; continue;
      case 0x845bc2:
        R.fpush(R.m.s32(((R.esp + 0x4c) | 0) >>> 0)); // 845bc2: fild dword ptr [esp + 0x4c]
        R.ebx = (R.m.u32(((R.esp + 0x48) | 0) >>> 0)) | 0; // 845bc6: mov ebx, dword ptr [esp + 0x48]
        R.st[0] = R.st[0] * 0.0025; // 845bca: fmul qword ptr [0x969028]
        R.m.wf64(((R.esp + 0x7c) | 0) >>> 0, R.st[0]); R.fpop(); // 845bd0: fstp qword ptr [esp + 0x7c]
        pc = 0x845bd4; continue;
      case 0x845bd4:
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 845bd4: test ebx, ebx
        if (!R.zf) { pc = 0x845c35; continue; } // 845bd6: jne 0x845c35
        pc = 0x845bd8; continue;
      case 0x845bd8:
        R.ecx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 845bd8: mov ecx, dword ptr [ebp + 8]
        R.edx = (R.m.u32(((R.ecx + 0x1a) | 0) >>> 0)) | 0; // 845bdb: mov edx, dword ptr [ecx + 0x1a]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edx + 0x7e) | 0) >>> 0)) & 0xff) << 0)) | 0; // 845bde: mov al, byte ptr [edx + 0x7e]
        R.sub(((R.eax >>> 0) & 0xff), 0x1, 8); // 845be1: cmp al, 1
        if (R.cL) { pc = 0x845be9; continue; } // 845be3: jl 0x845be9
        pc = 0x845be5; continue;
      case 0x845be5:
        R.sub(((R.eax >>> 0) & 0xff), 0x3, 8); // 845be5: cmp al, 3
        if (R.cLE) { pc = 0x845beb; continue; } // 845be7: jle 0x845beb
        pc = 0x845be9; continue;
      case 0x845be9:
        R.eax = ((R.eax & 0xffffff00) | (((0x3) & 0xff) << 0)) | 0; // 845be9: mov al, 3
        pc = 0x845beb; continue;
      case 0x845beb:
        { const p = ((R.eax << 24) >> 24) * ((((R.eax >>> 0) & 0xff)) << 24 >> 24); R.eax = ((R.eax & 0xffff0000) | (p & 0xffff)) | 0; R.cf = R.of = ((p << 24) >> 24) !== p; } // 845beb: imul al
        R.m.w8(((R.esp + 0x46) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 845bed: mov byte ptr [esp + 0x46], al
        R.eax = (R.m.u32(((R.ecx + 0x69) | 0) >>> 0)) | 0; // 845bf1: mov eax, dword ptr [ecx + 0x69]
        R.ecx = (((R.m.u16(((R.eax + 0xc) | 0) >>> 0)) << 16 >> 16)) | 0; // 845bf4: movsx ecx, word ptr [eax + 0xc]
        R.edx = (((R.m.u16(((R.eax + 0xa) | 0) >>> 0)) << 16 >> 16)) | 0; // 845bf8: movsx edx, word ptr [eax + 0xa]
        R.eax = (((R.m.u16(((R.eax + 0x8) | 0) >>> 0)) << 16 >> 16)) | 0; // 845bfc: movsx eax, word ptr [eax + 8]
        R.ecx = (R.add((R.ecx >>> 0), (R.edx >>> 0), 32)) | 0; // 845c00: add ecx, edx
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 845c02: add ecx, eax
        R.eax = (0x55555556) | 0; // 845c04: mov eax, 0x55555556
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 845c09: imul ecx
        R.ecx = ((R.edx >>> 0)) | 0; // 845c0b: mov ecx, edx
        R.ecx = (R.shr((R.ecx >>> 0), 0x1f, 32)) | 0; // 845c0d: shr ecx, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 845c10: add edx, ecx
        R.edx = (((((R.edx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 845c12: movsx edx, dx
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 845c15: mov dword ptr [esp + 0x1c], edx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 845c19: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 1.5; // 845c1d: fmul qword ptr [0x968940]
        R.st[0] = R.st[0] - 5000.0; // 845c23: fsub qword ptr [0x9688e8]
        R.ftol(); // 845c29: call 0x945640
        R.esi = ((R.eax >>> 0)) | 0; // 845c2e: mov esi, eax
        pc = 0x8461d4; continue; // 845c30: jmp 0x8461d4
      case 0x845c35:
        R.edi = (R.m.u32(((R.esp + 0x48) | 0) >>> 0)) | 0; // 845c35: mov edi, dword ptr [esp + 0x48]
        R.fpop(); // 845c39: fstp st(0)
        R.eax = (R.m.u32(((R.edi + 0x53) | 0) >>> 0)) | 0; // 845c3b: mov eax, dword ptr [edi + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 845c3e: test eax, eax
        if (R.zf) { pc = 0x845c4d; continue; } // 845c40: je 0x845c4d
        pc = 0x845c42; continue;
      case 0x845c42:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x7e) | 0) >>> 0)) & 0xff) << 0)) | 0; // 845c42: mov al, byte ptr [eax + 0x7e]
        R.sub(((R.eax >>> 0) & 0xff), 0x1, 8); // 845c45: cmp al, 1
        if (R.cL) { pc = 0x845c4d; continue; } // 845c47: jl 0x845c4d
        pc = 0x845c49; continue;
      case 0x845c49:
        R.sub(((R.eax >>> 0) & 0xff), 0x3, 8); // 845c49: cmp al, 3
        if (R.cLE) { pc = 0x845c4f; continue; } // 845c4b: jle 0x845c4f
        pc = 0x845c4d; continue;
      case 0x845c4d:
        R.eax = ((R.eax & 0xffffff00) | (((0x3) & 0xff) << 0)) | 0; // 845c4d: mov al, 3
        pc = 0x845c4f; continue;
      case 0x845c4f:
        { const p = ((R.eax << 24) >> 24) * ((((R.eax >>> 0) & 0xff)) << 24 >> 24); R.eax = ((R.eax & 0xffff0000) | (p & 0xffff)) | 0; R.cf = R.of = ((p << 24) >> 24) !== p; } // 845c4f: imul al
        R.m.w8(((R.esp + 0x46) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 845c51: mov byte ptr [esp + 0x46], al
        R.eax = (R.m.u32(((R.edi + 0x69) | 0) >>> 0)) | 0; // 845c55: mov eax, dword ptr [edi + 0x69]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 845c58: test eax, eax
        if (R.zf) { pc = 0x845cc7; continue; } // 845c5a: je 0x845cc7
        pc = 0x845c5c; continue;
      case 0x845c5c:
        R.eax = (R.m.u32(((R.eax + 0x38) | 0) >>> 0)) | 0; // 845c5c: mov eax, dword ptr [eax + 0x38]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 845c5f: test eax, eax
        if (R.zf) { pc = 0x845cc7; continue; } // 845c61: je 0x845cc7
        pc = 0x845c63; continue;
      case 0x845c63:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x33) | 0) >>> 0)) & 0xff) << 0)) | 0; // 845c63: mov al, byte ptr [eax + 0x33]
        R.ebx = ((R.ebx & 0xffff0000) | (((R.m.u16(((R.edi + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 845c66: mov bx, word ptr [edi + 0x80]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 845c6d: test al, al
        R.m.w32(((R.esp + 0x5c) | 0) >>> 0, (R.ebx >>> 0)); // 845c6f: mov dword ptr [esp + 0x5c], ebx
        R.esi = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 845c73: movsx esi, bx
        if (!R.zf) { pc = 0x845c81; continue; } // 845c76: jne 0x845c81
        pc = 0x845c78; continue;
      case 0x845c78:
        R.eax = ((R.esi >>> 0)) | 0; // 845c78: mov eax, esi
        R.edx = R.eax < 0 ? -1 : 0; // 845c7a: cdq 
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 845c7b: sub eax, edx
        R.eax = (R.sar((R.eax >>> 0), 0x1, 32)) | 0; // 845c7d: sar eax, 1
        pc = 0x845ce8; continue; // 845c7f: jmp 0x845ce8
      case 0x845c81:
        R.ecx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 845c81: movsx ecx, al
        { const p = BigInt((((R.esi >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 845c84: imul ecx, esi
        R.eax = (0x88888889) | 0; // 845c87: mov eax, 0x88888889
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.esi >>> 0)); // 845c8c: mov dword ptr [esp + 0x30], esi
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 845c90: imul ecx
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 845c92: fild dword ptr [esp + 0x30]
        R.st[0] = R.st[0] * 0.2857142857142857; // 845c96: fmul qword ptr [0x96d5e0]
        R.edx = (R.add((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 845c9c: add edx, ecx
        R.edx = (R.sar((R.edx >>> 0), 0x3, 32)) | 0; // 845c9e: sar edx, 3
        R.eax = ((R.edx >>> 0)) | 0; // 845ca1: mov eax, edx
        R.eax = (R.shr((R.eax >>> 0), 0x1f, 32)) | 0; // 845ca3: shr eax, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 845ca6: add edx, eax
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 845ca8: mov dword ptr [esp + 0x1c], edx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 845cac: fild dword ptr [esp + 0x1c]
        R.m.wf64(((R.esp + 0x24) | 0) >>> 0, R.st[0]); R.fpop(); // 845cb0: fstp qword ptr [esp + 0x24]
        R.fcom(R.st[0], R.f64(((R.esp + 0x24) | 0))); // 845cb4: fcom qword ptr [esp + 0x24]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 845cb8: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 845cba: test ah, 0x41
        if (R.zf) { pc = 0x845ce3; continue; } // 845cbd: je 0x845ce3
        pc = 0x845cbf; continue;
      case 0x845cbf:
        R.fpop(); // 845cbf: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x24) | 0))); // 845cc1: fld qword ptr [esp + 0x24]
        pc = 0x845ce3; continue; // 845cc5: jmp 0x845ce3
      case 0x845cc7:
        R.ebx = ((R.ebx & 0xffff0000) | (((R.m.u16(((R.edi + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 845cc7: mov bx, word ptr [edi + 0x80]
        R.esi = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 845cce: movsx esi, bx
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.esi >>> 0)); // 845cd1: mov dword ptr [esp + 0x30], esi
        R.m.w32(((R.esp + 0x5c) | 0) >>> 0, (R.ebx >>> 0)); // 845cd5: mov dword ptr [esp + 0x5c], ebx
        R.fpush(R.m.s32(((R.esp + 0x30) | 0) >>> 0)); // 845cd9: fild dword ptr [esp + 0x30]
        R.st[0] = R.st[0] * 0.2857142857142857; // 845cdd: fmul qword ptr [0x96d5e0]
        pc = 0x845ce3; continue;
      case 0x845ce3:
        R.ftol(); // 845ce3: call 0x945640
        pc = 0x845ce8; continue;
      case 0x845ce8:
        R.m.w32(((R.esp + 0x4c) | 0) >>> 0, (R.eax >>> 0)); // 845ce8: mov dword ptr [esp + 0x4c], eax
        R.eax = (R.m.u32(((R.edi + 0x57) | 0) >>> 0)) | 0; // 845cec: mov eax, dword ptr [edi + 0x57]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 845cef: test eax, eax
        if (R.zf) { pc = 0x845d58; continue; } // 845cf1: je 0x845d58
        pc = 0x845cf3; continue;
      case 0x845cf3:
        R.sub(((R.ebx >>> 0) & 0xffff), 0x1d4c, 16); // 845cf3: cmp bx, 0x1d4c
        if (R.cL) { pc = 0x845d23; continue; } // 845cf8: jl 0x845d23
        pc = 0x845cfa; continue;
      case 0x845cfa:
        R.sub(R.m.u32(((R.edi + 0x73) | 0) >>> 0), 0x88b8, 32); // 845cfa: cmp dword ptr [edi + 0x73], 0x88b8
        if (R.cLE) { pc = 0x845d23; continue; } // 845d01: jle 0x845d23
        pc = 0x845d03; continue;
      case 0x845d03:
        R.eax = (((R.m.u16(((R.eax + 0x69) | 0) >>> 0)) << 16 >> 16)) | 0; // 845d03: movsx eax, word ptr [eax + 0x69]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 845d07: lea eax, [eax + eax*4]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 845d0a: lea eax, [eax + eax*4]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 845d0d: lea eax, [eax + eax*4]
        R.eax = (R.shl((R.eax >>> 0), 0x2, 32)) | 0; // 845d10: shl eax, 2
        R.sub((R.eax >>> 0), (R.esi >>> 0), 32); // 845d13: cmp eax, esi
        if (R.cLE) { pc = 0x845d1d; continue; } // 845d15: jle 0x845d1d
        pc = 0x845d17; continue;
      case 0x845d17:
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.eax >>> 0)); // 845d17: mov dword ptr [esp + 0x30], eax
        pc = 0x845d5c; continue; // 845d1b: jmp 0x845d5c
      case 0x845d1d:
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.esi >>> 0)); // 845d1d: mov dword ptr [esp + 0x30], esi
        pc = 0x845d5c; continue; // 845d21: jmp 0x845d5c
      case 0x845d23:
        R.ecx = (((R.m.u16(((R.eax + 0x69) | 0) >>> 0)) << 16 >> 16)) | 0; // 845d23: movsx ecx, word ptr [eax + 0x69]
        R.eax = ((R.esi >>> 0)) | 0; // 845d27: mov eax, esi
        R.edx = R.eax < 0 ? -1 : 0; // 845d29: cdq 
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 845d2a: sub eax, edx
        R.edx = ((R.eax >>> 0)) | 0; // 845d2c: mov edx, eax
        R.eax = (((R.ecx + R.ecx * 4) | 0)) | 0; // 845d2e: lea eax, [ecx + ecx*4]
        R.edx = (R.sar((R.edx >>> 0), 0x1, 32)) | 0; // 845d31: sar edx, 1
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 845d33: lea eax, [eax + eax*4]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 845d36: lea eax, [eax + eax*4]
        R.edx = (((R.edx + R.eax * 2) | 0)) | 0; // 845d39: lea edx, [edx + eax*2]
        R.eax = (((R.ecx + R.ecx * 4) | 0)) | 0; // 845d3c: lea eax, [ecx + ecx*4]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 845d3f: lea eax, [eax + eax*4]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 845d42: lea eax, [eax + eax*4]
        R.eax = (R.shl((R.eax >>> 0), 0x2, 32)) | 0; // 845d45: shl eax, 2
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 845d48: cmp eax, edx
        if (R.cLE) { pc = 0x845d52; continue; } // 845d4a: jle 0x845d52
        pc = 0x845d4c; continue;
      case 0x845d4c:
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.eax >>> 0)); // 845d4c: mov dword ptr [esp + 0x30], eax
        pc = 0x845d5c; continue; // 845d50: jmp 0x845d5c
      case 0x845d52:
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.edx >>> 0)); // 845d52: mov dword ptr [esp + 0x30], edx
        pc = 0x845d5c; continue; // 845d56: jmp 0x845d5c
      case 0x845d58:
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.ebx >>> 0)); // 845d58: mov dword ptr [esp + 0x30], ebx
        pc = 0x845d5c; continue;
      case 0x845d5c:
        R.eax = (R.m.u32(((R.edi + 0x1db) | 0) >>> 0)) | 0; // 845d5c: mov eax, dword ptr [edi + 0x1db]
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 845d62: cmp eax, -1
        if (R.cLE) { pc = 0x845d76; continue; } // 845d65: jle 0x845d76
        pc = 0x845d67; continue;
      case 0x845d67:
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf6f8) | 0) >>> 0), 32); // 845d67: cmp eax, dword ptr [0x9cf6f8]
        if (!R.zf) { pc = 0x845d89; continue; } // 845d6d: jne 0x845d89
        pc = 0x845d6f; continue;
      case 0x845d6f:
        R.sub(((R.ebx >>> 0) & 0xffff), 0x1388, 16); // 845d6f: cmp bx, 0x1388
        if (R.cL) { pc = 0x845d89; continue; } // 845d74: jl 0x845d89
        pc = 0x845d76; continue;
      case 0x845d76:
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 845d76: mov eax, dword ptr [edi]
        R.edx = (R.m.u32(((0xae2d14) | 0) >>> 0)) | 0; // 845d78: mov edx, dword ptr [0xae2d14]
        R.ecx = (((R.eax + R.eax * 2) | 0)) | 0; // 845d7e: lea ecx, [eax + eax*2]
        R.eax = (R.m.u32(((R.edx + R.ecx * 2) | 0) >>> 0)) | 0; // 845d81: mov eax, dword ptr [edx + ecx*2]
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 845d84: cmp eax, -1
        if (R.cLE) { pc = 0x845db2; continue; } // 845d87: jle 0x845db2
        pc = 0x845d89; continue;
      case 0x845d89:
        R.ecx = (((R.eax + R.eax * 2) | 0)) | 0; // 845d89: lea ecx, [eax + eax*2]
        R.ecx = (((R.ecx + R.ecx * 8) | 0)) | 0; // 845d8c: lea ecx, [ecx + ecx*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x2, 32)) | 0; // 845d8f: shl ecx, 2
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 845d92: sub ecx, eax
        R.eax = (R.m.u32(((0xae23d0) | 0) >>> 0)) | 0; // 845d94: mov eax, dword ptr [0xae23d0]
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 845d99: add ecx, eax
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 845d9b: test ecx, ecx
        R.m.w32(((R.esp + 0x70) | 0) >>> 0, (R.ecx >>> 0)); // 845d9d: mov dword ptr [esp + 0x70], ecx
        if (R.zf) { pc = 0x845db2; continue; } // 845da1: je 0x845db2
        pc = 0x845da3; continue;
      case 0x845da3:
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.ecx + 0x69) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 845da3: mov cx, word ptr [ecx + 0x69]
        { const p = BigInt(((((R.ecx >>> 0) & 0xffff)) << 16 >> 16)) * BigInt(600); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = ((R.ecx & 0xffff0000) | (((Number(BigInt.asIntN(32, p))) & 0xffff) << 0)) | 0; } // 845da7: imul cx, cx, 0x258
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ecx >>> 0)); // 845dac: mov dword ptr [esp + 0x1c], ecx
        pc = 0x845de3; continue; // 845db0: jmp 0x845de3
      case 0x845db2:
        R.eax = (((R.m.u16(((R.esp + 0x30) | 0) >>> 0)) << 16 >> 16)) | 0; // 845db2: movsx eax, word ptr [esp + 0x30]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 845db7: mov dword ptr [esp + 0x1c], eax
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 845dbb: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 0.8; // 845dbf: fmul qword ptr [0x9689b0]
        R.fcom(R.st[0], 7000.0); // 845dc5: fcom qword ptr [0x96d470]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 845dcb: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 845dcd: test ah, 1
        if (!R.zf) { pc = 0x845dda; continue; } // 845dd0: jne 0x845dda
        pc = 0x845dd2; continue;
      case 0x845dd2:
        R.fpop(); // 845dd2: fstp st(0)
        R.fpush(7000.0); // 845dd4: fld qword ptr [0x96d470]
        pc = 0x845dda; continue;
      case 0x845dda:
        R.ftol(); // 845dda: call 0x945640
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 845ddf: mov dword ptr [esp + 0x1c], eax
        pc = 0x845de3; continue;
      case 0x845de3:
        R.eax = (R.m.u32(((R.edi + 0xcf) | 0) >>> 0)) | 0; // 845de3: mov eax, dword ptr [edi + 0xcf]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 845de9: test eax, eax
        if (!R.zf) { pc = 0x845e05; continue; } // 845deb: jne 0x845e05
        pc = 0x845ded; continue;
      case 0x845ded:
        R.ecx = (((R.m.u16(((R.esp + 0x30) | 0) >>> 0)) << 16 >> 16)) | 0; // 845ded: movsx ecx, word ptr [esp + 0x30]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.ecx >>> 0)); // 845df2: mov dword ptr [esp + 0x24], ecx
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 845df6: fild dword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 0.75; // 845dfa: fmul qword ptr [0x969040]
        pc = 0x845f1b; continue; // 845e00: jmp 0x845f1b
      case 0x845e05:
        R.eax = (R.m.u32(((R.eax + 0x69) | 0) >>> 0)) | 0; // 845e05: mov eax, dword ptr [eax + 0x69]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 845e08: test eax, eax
        if (!R.zf) { pc = 0x845e24; continue; } // 845e0a: jne 0x845e24
        pc = 0x845e0c; continue;
      case 0x845e0c:
        R.edx = (((R.m.u16(((R.esp + 0x30) | 0) >>> 0)) << 16 >> 16)) | 0; // 845e0c: movsx edx, word ptr [esp + 0x30]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.edx >>> 0)); // 845e11: mov dword ptr [esp + 0x24], edx
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 845e15: fild dword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 0.75; // 845e19: fmul qword ptr [0x969040]
        pc = 0x845f1b; continue; // 845e1f: jmp 0x845f1b
      case 0x845e24:
        R.ecx = (R.m.u32(((0xb67a44) | 0) >>> 0)) | 0; // 845e24: mov ecx, dword ptr [0xb67a44]
        R.ebx = ((R.ebx & 0xffff0000) | (((R.m.u16(((R.eax + 0xa) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 845e2a: mov bx, word ptr [eax + 0xa]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 845e2e: test ecx, ecx
        if (R.zf) { pc = 0x845f22; continue; } // 845e30: je 0x845f22
        pc = 0x845e36; continue;
      case 0x845e36:
        R.sub(R.m.u8(((R.ebp + 0x14) | 0) >>> 0), 0x5, 8); // 845e36: cmp byte ptr [ebp + 0x14], 5
        if (R.zf) { pc = 0x845f22; continue; } // 845e3a: je 0x845f22
        pc = 0x845e40; continue;
      case 0x845e40:
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 845e40: mov eax, dword ptr [edi]
        R.ecx = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 845e42: mov ecx, dword ptr [ecx]
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 845e44: lea edx, [eax + eax*8]
        R.eax = (((R.eax + R.edx * 8) | 0)) | 0; // 845e47: lea eax, [eax + edx*8]
        R.eax = (R.add((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 845e4a: add eax, ecx
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.eax + 0x6) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 845e4c: mov cx, word ptr [eax + 6]
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.eax + 0x8) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 845e50: mov ax, word ptr [eax + 8]
        R.edx = (((((R.ecx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 845e54: movsx edx, cx
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.edx >>> 0)); // 845e57: mov dword ptr [esp + 0x24], edx
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 845e5b: fild dword ptr [esp + 0x24]
        R.eax = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 845e5f: movsx eax, ax
        R.st[0] = R.st[0] * 0.67; // 845e62: fmul qword ptr [0x968f80]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.eax >>> 0)); // 845e68: mov dword ptr [esp + 0x24], eax
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 845e6c: fild dword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 0.33; // 845e70: fmul qword ptr [0x968f78]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 845e76: faddp st(1)
        R.ftol(); // 845e78: call 0x945640
        R.sub(((R.eax >>> 0) & 0xffff), 0x1388, 16); // 845e7d: cmp ax, 0x1388
        if (!R.cL) { pc = 0x845ed0; continue; } // 845e81: jge 0x845ed0
        pc = 0x845e83; continue;
      case 0x845e83:
        R.ecx = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 845e83: movsx ecx, ax
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.ecx >>> 0)); // 845e86: mov dword ptr [esp + 0x24], ecx
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 845e8a: fild dword ptr [esp + 0x24]
        R.edx = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 845e8e: movsx edx, bx
        R.st[0] = R.st[0] * 0.0008; // 845e91: fmul qword ptr [0x96a618]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.edx >>> 0)); // 845e97: mov dword ptr [esp + 0x24], edx
        R.st[0] = 5.0 - R.st[0]; // 845e9b: fsubr qword ptr [0x9688a0]
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 845ea1: fild dword ptr [esp + 0x24]
        R.fpush(R.st[0]); // 845ea5: fld st(0)
        R.st[0] = R.st[0] / R.st[2]; // 845ea7: fdiv st(2)
        R.m.wf64(((R.esp + 0x24) | 0) >>> 0, R.st[0]); R.fpop(); // 845ea9: fstp qword ptr [esp + 0x24]
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 845ead: fxch st(1)
        R.st[0] = R.st[0] * 1000.0; // 845eaf: fmul qword ptr [0x968908]
        R.st[0] = R.st[1] - R.st[0]; // 845eb5: fsubr st(1)
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 845eb7: fxch st(1)
        R.fpop(); // 845eb9: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x24) | 0))); // 845ebb: fld qword ptr [esp + 0x24]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 845ebf: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 845ec1: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 845ec3: test ah, 0x41
        if (!R.zf) { pc = 0x845f1b; continue; } // 845ec6: jne 0x845f1b
        pc = 0x845ec8; continue;
      case 0x845ec8:
        R.fpop(); // 845ec8: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x24) | 0))); // 845eca: fld qword ptr [esp + 0x24]
        pc = 0x845f1b; continue; // 845ece: jmp 0x845f1b
      case 0x845ed0:
        R.eax = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 845ed0: movsx eax, ax
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.eax >>> 0)); // 845ed3: mov dword ptr [esp + 0x24], eax
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 845ed7: fild dword ptr [esp + 0x24]
        R.ecx = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 845edb: movsx ecx, bx
        R.st[0] = R.st[0] * 0.0001; // 845ede: fmul qword ptr [0x96a5c0]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.ecx >>> 0)); // 845ee4: mov dword ptr [esp + 0x24], ecx
        R.st[0] = R.st[0] + 0.5; // 845ee8: fadd qword ptr [0x968968]
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 845eee: fild dword ptr [esp + 0x24]
        R.fpush(R.st[0]); // 845ef2: fld st(0)
        R.st[0] = R.st[0] * R.st[2]; // 845ef4: fmul st(2)
        R.m.wf64(((R.esp + 0x24) | 0) >>> 0, R.st[0]); R.fpop(); // 845ef6: fstp qword ptr [esp + 0x24]
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 845efa: fxch st(1)
        R.st[0] = R.st[0] * 1000.0; // 845efc: fmul qword ptr [0x968908]
        R.st[0] = R.st[0] + R.st[1]; // 845f02: fadd st(1)
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 845f04: fxch st(1)
        R.fpop(); // 845f06: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x24) | 0))); // 845f08: fld qword ptr [esp + 0x24]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 845f0c: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 845f0e: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 845f10: test ah, 1
        if (R.zf) { pc = 0x845f1b; continue; } // 845f13: je 0x845f1b
        pc = 0x845f15; continue;
      case 0x845f15:
        R.fpop(); // 845f15: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x24) | 0))); // 845f17: fld qword ptr [esp + 0x24]
        pc = 0x845f1b; continue;
      case 0x845f1b:
        R.ftol(); // 845f1b: call 0x945640
        R.ebx = ((R.eax >>> 0)) | 0; // 845f20: mov ebx, eax
        pc = 0x845f22; continue;
      case 0x845f22:
        R.esi = (R.m.u32(((R.esp + 0x5c) | 0) >>> 0)) | 0; // 845f22: mov esi, dword ptr [esp + 0x5c]
        R.push((R.edi >>> 0)); // 845f26: push edi
        R.call(0x53b900, { n: 1, thisEcx: false, calleeClean: false }); // 845f27: call 0x53b900
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 845f2c: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 845f2f: test eax, eax
        if (!R.zf) { pc = 0x845fdb; continue; } // 845f31: jne 0x845fdb
        pc = 0x845f37; continue;
      case 0x845f37:
        R.ecx = (R.m.u32(((0xae2a38) | 0) >>> 0)) | 0; // 845f37: mov ecx, dword ptr [0xae2a38]
        R.push((R.edi >>> 0)); // 845f3d: push edi
        R.call(0x5a0590, { n: 1, thisEcx: true, calleeClean: true }); // 845f3e: call 0x5a0590
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 845f43: test eax, eax
        if (R.zf) { pc = 0x845fdb; continue; } // 845f45: je 0x845fdb
        pc = 0x845f4b; continue;
      case 0x845f4b:
        R.ecx = ((R.eax >>> 0)) | 0; // 845f4b: mov ecx, eax
        R.call(0x5986b0, { n: 0, thisEcx: true, calleeClean: false }); // 845f4d: call 0x5986b0
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 845f52: movsx eax, al
        R.eax = (R.add((R.eax >>> 0), 0x2, 32)) | 0; // 845f55: add eax, 2
        R.sub((R.eax >>> 0), 0x4, 32); // 845f58: cmp eax, 4
        if (!R.cBE) { pc = 0x845fdb; continue; } // 845f5b: ja 0x845fdb
        pc = 0x845f5d; continue;
      case 0x845f5d:
        pc = [0x845fc3, 0x845fb0, 0x845fdb, 0x845f8a, 0x845f64][R.eax >>> 0]; continue; // 845f5d: jmp dword ptr [eax*4 + 0x846900]
      case 0x845f64:
        R.edx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 845f64: movsx edx, si
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.edx >>> 0)); // 845f67: mov dword ptr [esp + 0x24], edx
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 845f6b: fild dword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 1.5; // 845f6f: fmul qword ptr [0x968940]
        R.ftol(); // 845f75: call 0x945640
        R.esi = ((R.eax >>> 0)) | 0; // 845f7a: mov esi, eax
        R.sub(((R.esi >>> 0) & 0xffff), 0x1676, 16); // 845f7c: cmp si, 0x1676
        if (!R.cL) { pc = 0x845fdb; continue; } // 845f81: jge 0x845fdb
        pc = 0x845f83; continue;
      case 0x845f83:
        R.esi = (0x1676) | 0; // 845f83: mov esi, 0x1676
        pc = 0x845fdb; continue; // 845f88: jmp 0x845fdb
      case 0x845f8a:
        R.eax = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 845f8a: movsx eax, si
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.eax >>> 0)); // 845f8d: mov dword ptr [esp + 0x24], eax
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 845f91: fild dword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 1.25; // 845f95: fmul qword ptr [0x968928]
        R.ftol(); // 845f9b: call 0x945640
        R.esi = ((R.eax >>> 0)) | 0; // 845fa0: mov esi, eax
        R.sub(((R.esi >>> 0) & 0xffff), 0x128e, 16); // 845fa2: cmp si, 0x128e
        if (!R.cL) { pc = 0x845fdb; continue; } // 845fa7: jge 0x845fdb
        pc = 0x845fa9; continue;
      case 0x845fa9:
        R.esi = (0x128e) | 0; // 845fa9: mov esi, 0x128e
        pc = 0x845fdb; continue; // 845fae: jmp 0x845fdb
      case 0x845fb0:
        R.ecx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 845fb0: movsx ecx, si
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.ecx >>> 0)); // 845fb3: mov dword ptr [esp + 0x24], ecx
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 845fb7: fild dword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 0.9; // 845fbb: fmul qword ptr [0x9689d8]
        pc = 0x845fd4; continue; // 845fc1: jmp 0x845fd4
      case 0x845fc3:
        R.edx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 845fc3: movsx edx, si
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.edx >>> 0)); // 845fc6: mov dword ptr [esp + 0x24], edx
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 845fca: fild dword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 0.75; // 845fce: fmul qword ptr [0x969040]
        pc = 0x845fd4; continue;
      case 0x845fd4:
        R.ftol(); // 845fd4: call 0x945640
        R.esi = ((R.eax >>> 0)) | 0; // 845fd9: mov esi, eax
        pc = 0x845fdb; continue;
      case 0x845fdb:
        R.push((R.edi >>> 0)); // 845fdb: push edi
        R.call(0x53b900, { n: 1, thisEcx: false, calleeClean: false }); // 845fdc: call 0x53b900
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 845fe1: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 845fe4: test eax, eax
        if (R.zf) { pc = 0x846008; continue; } // 845fe6: je 0x846008
        pc = 0x845fe8; continue;
      case 0x845fe8:
        R.push((R.edi >>> 0)); // 845fe8: push edi
        R.call(0x5409b0, { n: 1, thisEcx: false, calleeClean: false }); // 845fe9: call 0x5409b0
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 845fee: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 845ff1: test eax, eax
        if (!R.zf) { pc = 0x846008; continue; } // 845ff3: jne 0x846008
        pc = 0x845ff5; continue;
      case 0x845ff5:
        R.eax = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 845ff5: movsx eax, si
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.eax >>> 0)); // 845ff8: mov dword ptr [esp + 0x24], eax
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 845ffc: fild dword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 1.35; // 846000: fmul qword ptr [0x969588]
        pc = 0x846040; continue; // 846006: jmp 0x846040
      case 0x846008:
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 846008: mov eax, dword ptr [edi]
        R.edx = (R.m.u32(((R.esp + 0x90) | 0) >>> 0)) | 0; // 84600a: mov edx, dword ptr [esp + 0x90]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 846011: lea ecx, [eax + eax*8]
        R.eax = (R.m.u32(((R.edx + 0xdc) | 0) >>> 0)) | 0; // 846014: mov eax, dword ptr [edx + 0xdc]
        R.edx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 84601a: movsx edx, si
        R.ecx = (((R.m.u16(((R.ecx + R.eax + 0x5) | 0) >>> 0)) << 16 >> 16)) | 0; // 84601d: movsx ecx, word ptr [ecx + eax + 5]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.ecx >>> 0)); // 846022: mov dword ptr [esp + 0x24], ecx
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 846026: fild dword ptr [esp + 0x24]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.edx >>> 0)); // 84602a: mov dword ptr [esp + 0x24], edx
        R.st[0] = R.st[0] * 0.4; // 84602e: fmul qword ptr [0x968e00]
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 846034: fild dword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 0.6; // 846038: fmul qword ptr [0x968e48]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 84603e: faddp st(1)
        pc = 0x846040; continue;
      case 0x846040:
        R.ftol(); // 846040: call 0x945640
        R.ecx = (((R.m.u16(((R.esp + 0x1c) | 0) >>> 0)) << 16 >> 16)) | 0; // 846045: movsx ecx, word ptr [esp + 0x1c]
        R.edx = (((R.m.u16(((R.esp + 0x30) | 0) >>> 0)) << 16 >> 16)) | 0; // 84604a: movsx edx, word ptr [esp + 0x30]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.ecx >>> 0)); // 84604f: mov dword ptr [esp + 0x24], ecx
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 846053: fild dword ptr [esp + 0x24]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.edx >>> 0)); // 846057: mov dword ptr [esp + 0x24], edx
        R.ecx = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 84605b: movsx ecx, bx
        R.st[0] = R.st[0] * R.f32(((R.esp + 0x60) | 0)); // 84605e: fmul dword ptr [esp + 0x60]
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 846062: fild dword ptr [esp + 0x24]
        R.edx = (((R.m.u16(((R.esp + 0x4c) | 0) >>> 0)) << 16 >> 16)) | 0; // 846066: movsx edx, word ptr [esp + 0x4c]
        R.st[0] = R.st[0] * R.f32(((R.esp + 0x84) | 0)); // 84606b: fmul dword ptr [esp + 0x84]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.ecx >>> 0)); // 846072: mov dword ptr [esp + 0x24], ecx
        R.eax = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 846076: movsx eax, ax
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 846079: faddp st(1)
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 84607b: fild dword ptr [esp + 0x24]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.edx >>> 0)); // 84607f: mov dword ptr [esp + 0x24], edx
        R.st[0] = R.st[0] * R.f32(((R.esp + 0x74) | 0)); // 846083: fmul dword ptr [esp + 0x74]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 846087: faddp st(1)
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 846089: fild dword ptr [esp + 0x24]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.eax >>> 0)); // 84608d: mov dword ptr [esp + 0x24], eax
        R.st[0] = R.st[0] * R.f32(((R.esp + 0x88) | 0)); // 846091: fmul dword ptr [esp + 0x88]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 846098: faddp st(1)
        R.st[0] = R.st[0] + R.m.s32(((R.esp + 0x24) | 0) >>> 0); // 84609a: fiadd dword ptr [esp + 0x24]
        R.st[0] = R.st[0] / R.f32(((R.esp + 0x8c) | 0)); // 84609e: fdiv dword ptr [esp + 0x8c]
        R.ftol(); // 8460a5: call 0x945640
        R.push((R.edi >>> 0)); // 8460aa: push edi
        R.esi = ((R.eax >>> 0)) | 0; // 8460ab: mov esi, eax
        R.call(0x53b900, { n: 1, thisEcx: false, calleeClean: false }); // 8460ad: call 0x53b900
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8460b2: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8460b5: test eax, eax
        if (!R.zf) { pc = 0x846106; continue; } // 8460b7: jne 0x846106
        pc = 0x8460b9; continue;
      case 0x8460b9:
        R.ecx = (R.m.u32(((R.esp + 0x48) | 0) >>> 0)) | 0; // 8460b9: mov ecx, dword ptr [esp + 0x48]
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.ecx + 0x64) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8460bd: mov bl, byte ptr [ecx + 0x64]
        R.sub(((R.ebx >>> 0) & 0xff), 0x1, 8); // 8460c0: cmp bl, 1
        if (R.zf) { pc = 0x846106; continue; } // 8460c3: je 0x846106
        pc = 0x8460c5; continue;
      case 0x8460c5:
        R.edx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 8460c5: mov edx, dword ptr [ebp + 8]
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 8460c8: xor ecx, ecx
        R.eax = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8460ca: movsx eax, si
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.edx + 0x22) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8460cd: mov cl, byte ptr [edx + 0x22]
        { const p = BigInt((((R.ecx >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 8460d0: imul ecx, ecx
        R.ecx = (R.add((R.ecx >>> 0), 0x190, 32)) | 0; // 8460d3: add ecx, 0x190
        R.edx = (((R.ecx + R.ecx * 4) | 0)) | 0; // 8460d9: lea edx, [ecx + ecx*4]
        R.ecx = ((R.eax >>> 0)) | 0; // 8460dc: mov ecx, eax
        R.ecx = (R.sub((R.ecx >>> 0), (R.edx >>> 0), 32)) | 0; // 8460de: sub ecx, edx
        R.edx = R.eax < 0 ? -1 : 0; // 8460e0: cdq 
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 8460e1: sub eax, edx
        R.eax = (R.sar((R.eax >>> 0), 0x1, 32)) | 0; // 8460e3: sar eax, 1
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 8460e5: cmp eax, ecx
        R.esi = ((R.eax >>> 0)) | 0; // 8460e7: mov esi, eax
        if (R.cL) { pc = 0x8460ed; continue; } // 8460e9: jl 0x8460ed
        pc = 0x8460eb; continue;
      case 0x8460eb:
        R.esi = ((R.ecx >>> 0)) | 0; // 8460eb: mov esi, ecx
        pc = 0x8460ed; continue;
      case 0x8460ed:
        R.sub(((R.ebx >>> 0) & 0xff), 0x3, 8); // 8460ed: cmp bl, 3
        if (!R.zf) { pc = 0x846106; continue; } // 8460f0: jne 0x846106
        pc = 0x8460f2; continue;
      case 0x8460f2:
        R.eax = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8460f2: movsx eax, si
        R.esi = (((R.eax + -0x7d0) | 0)) | 0; // 8460f5: lea esi, [eax - 0x7d0]
        R.edx = R.eax < 0 ? -1 : 0; // 8460fb: cdq 
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 8460fc: sub eax, edx
        R.eax = (R.sar((R.eax >>> 0), 0x1, 32)) | 0; // 8460fe: sar eax, 1
        R.sub((R.eax >>> 0), (R.esi >>> 0), 32); // 846100: cmp eax, esi
        if (!R.cL) { pc = 0x846106; continue; } // 846102: jge 0x846106
        pc = 0x846104; continue;
      case 0x846104:
        R.esi = ((R.eax >>> 0)) | 0; // 846104: mov esi, eax
        pc = 0x846106; continue;
      case 0x846106:
        R.eax = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 846106: movsx eax, si
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.eax >>> 0)); // 846109: mov dword ptr [esp + 0x24], eax
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 84610d: fild dword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 1.5; // 846111: fmul qword ptr [0x968940]
        R.st[0] = R.st[0] - 5000.0; // 846117: fsub qword ptr [0x9688e8]
        R.ftol(); // 84611d: call 0x945640
        R.ecx = (R.m.u32(((R.esp + 0x48) | 0) >>> 0)) | 0; // 846122: mov ecx, dword ptr [esp + 0x48]
        R.esi = ((R.eax >>> 0)) | 0; // 846126: mov esi, eax
        R.eax = (R.m.u32(((R.ecx + 0x53) | 0) >>> 0)) | 0; // 846128: mov eax, dword ptr [ecx + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84612b: test eax, eax
        if (R.zf) { pc = 0x8461d0; continue; } // 84612d: je 0x8461d0
        pc = 0x846133; continue;
      case 0x846133:
        R.edi = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 846133: mov edi, dword ptr [ebp + 0xc]
        R.edx = ((R.ecx >>> 0)) | 0; // 846136: mov edx, ecx
        R.sub((R.edi >>> 0), (R.edx >>> 0), 32); // 846138: cmp edi, edx
        if (R.zf) { pc = 0x84662a; continue; } // 84613a: je 0x84662a
        pc = 0x846140; continue;
      case 0x846140:
        R.ecx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 846140: movsx ecx, si
        R.ecx = (R.add((R.ecx >>> 0), 0x1388, 32)) | 0; // 846143: add ecx, 0x1388
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.ecx >>> 0)); // 846149: mov dword ptr [esp + 0x24], ecx
        R.ecx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 84614d: mov ecx, dword ptr [ebp + 8]
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 846150: fild dword ptr [esp + 0x24]
        R.ebx = (R.m.u32(((R.ecx + 0x61) | 0) >>> 0)) | 0; // 846154: mov ebx, dword ptr [ecx + 0x61]
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 846157: test ebx, ebx
        R.fpush(R.st[0]); // 846159: fld st(0)
        R.st[0] = R.st[0] * 6.666666666666667e-05; // 84615b: fmul qword ptr [0x968d78]
        R.st[0] = R.st[0] * R.st[1]; // 846161: fmul st(1)
        R.m.wf64(((R.esp + 0x1c) | 0) >>> 0, R.st[0]); R.fpop(); // 846163: fstp qword ptr [esp + 0x1c]
        R.fpop(); // 846167: fstp st(0)
        if (R.zf) { pc = 0x84618b; continue; } // 846169: je 0x84618b
        pc = 0x84616b; continue;
      case 0x84616b:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x77) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84616b: mov al, byte ptr [eax + 0x77]
        R.push(0x1); // 84616e: push 1
        R.push((R.eax >>> 0)); // 846170: push eax
        R.push((R.edx >>> 0)); // 846171: push edx
        R.push((R.ecx >>> 0)); // 846172: push ecx
        R.ecx = (R.m.u32(((0xb74350) | 0) >>> 0)) | 0; // 846173: mov ecx, dword ptr [0xb74350]
        R.call(0x7c6830, { n: 4, thisEcx: true, calleeClean: true }); // 846179: call 0x7c6830
        R.ecx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 84617e: movsx ecx, al
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.ecx >>> 0)); // 846181: mov dword ptr [esp + 0x24], ecx
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 846185: fild dword ptr [esp + 0x24]
        pc = 0x846191; continue; // 846189: jmp 0x846191
      case 0x84618b:
        R.fpush(10.0); // 84618b: fld qword ptr [0x9688b0]
        pc = 0x846191; continue;
      case 0x846191:
        R.fpush(R.st[0]); // 846191: fld st(0)
        R.st[0] = R.st[0] * 0.1; // 846193: fmul qword ptr [0x967880]
        R.m.wf64(((R.esp + 0x24) | 0) >>> 0, R.st[0]); R.fpop(); // 846199: fstp qword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 200.0; // 84619d: fmul qword ptr [0x96a648]
        R.st[0] = 12000.0 - R.st[0]; // 8461a3: fsubr qword ptr [0x96f938]
        R.st[0] = R.f64(((R.esp + 0x1c) | 0)) / R.st[0]; // 8461a9: fdivr qword ptr [esp + 0x1c]
        R.fpush(R.f64(((R.esp + 0x24) | 0))); // 8461ad: fld qword ptr [esp + 0x24]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 8461b1: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8461b3: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 8461b5: test ah, 0x41
        if (!R.zf) { pc = 0x8461c0; continue; } // 8461b8: jne 0x8461c0
        pc = 0x8461ba; continue;
      case 0x8461ba:
        R.fpop(); // 8461ba: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x24) | 0))); // 8461bc: fld qword ptr [esp + 0x24]
        pc = 0x8461c0; continue;
      case 0x8461c0:
        R.st[0] = R.st[0] + 0.2; // 8461c0: fadd qword ptr [0x968918]
        R.st[0] = R.f64(((R.esp + 0x14) | 0)) / R.st[0]; // 8461c6: fdivr qword ptr [esp + 0x14]
        R.m.wf64(((R.esp + 0x14) | 0) >>> 0, R.st[0]); // 8461ca: fst qword ptr [esp + 0x14]
        pc = 0x8461d7; continue; // 8461ce: jmp 0x8461d7
      case 0x8461d0:
        R.fpush(R.f64(((R.esp + 0x14) | 0))); // 8461d0: fld qword ptr [esp + 0x14]
        pc = 0x8461d4; continue;
      case 0x8461d4:
        R.edi = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 8461d4: mov edi, dword ptr [ebp + 0xc]
        pc = 0x8461d7; continue;
      case 0x8461d7:
        R.eax = (R.m.u32(((R.esp + 0x48) | 0) >>> 0)) | 0; // 8461d7: mov eax, dword ptr [esp + 0x48]
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.esp + 0x13) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8461db: mov bl, byte ptr [esp + 0x13]
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 8461df: cmp edi, eax
        if (R.zf) { pc = 0x84662e; continue; } // 8461e1: je 0x84662e
        pc = 0x8461e7; continue;
      case 0x8461e7:
        R.eax = (R.m.u32(((R.edi + 0x57) | 0) >>> 0)) | 0; // 8461e7: mov eax, dword ptr [edi + 0x57]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8461ea: test eax, eax
        if (R.zf) { pc = 0x8461f9; continue; } // 8461ec: je 0x8461f9
        pc = 0x8461ee; continue;
      case 0x8461ee:
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8461ee: mov edx, dword ptr [eax]
        R.eax = (R.m.u32(((0x9cf764) | 0) >>> 0)) | 0; // 8461f0: mov eax, dword ptr [0x9cf764]
        R.sub((R.edx >>> 0), (R.eax >>> 0), 32); // 8461f5: cmp edx, eax
        if (!R.zf) { pc = 0x8461ff; continue; } // 8461f7: jne 0x8461ff
        pc = 0x8461f9; continue;
      case 0x8461f9:
        R.st[0] = R.st[0] * 0.1; // 8461f9: fmul qword ptr [0x967880]
        pc = 0x8461ff; continue;
      case 0x8461ff:
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 8461ff: mov eax, dword ptr [ebp + 8]
        R.eax = (R.m.u32(((R.eax + 0x69) | 0) >>> 0)) | 0; // 846202: mov eax, dword ptr [eax + 0x69]
        R.ecx = (((R.m.u16(((R.eax + 0xc) | 0) >>> 0)) << 16 >> 16)) | 0; // 846205: movsx ecx, word ptr [eax + 0xc]
        R.edx = (((R.m.u16(((R.eax + 0xa) | 0) >>> 0)) << 16 >> 16)) | 0; // 846209: movsx edx, word ptr [eax + 0xa]
        R.eax = (((R.m.u16(((R.eax + 0x8) | 0) >>> 0)) << 16 >> 16)) | 0; // 84620d: movsx eax, word ptr [eax + 8]
        R.ecx = (R.add((R.ecx >>> 0), (R.edx >>> 0), 32)) | 0; // 846211: add ecx, edx
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 846213: add ecx, eax
        R.eax = (0x55555556) | 0; // 846215: mov eax, 0x55555556
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 84621a: imul ecx
        R.eax = (((R.m.u16(((R.edi + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 84621c: movsx eax, word ptr [edi + 0x80]
        R.ecx = ((R.edx >>> 0)) | 0; // 846223: mov ecx, edx
        R.ecx = (R.shr((R.ecx >>> 0), 0x1f, 32)) | 0; // 846225: shr ecx, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 846228: add edx, ecx
        R.ecx = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 84622a: mov ecx, dword ptr [esp + 0x34]
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 84622e: sub eax, edx
        R.sub(((R.ecx >>> 0) & 0xffff), ((R.esi >>> 0) & 0xffff), 16); // 846230: cmp cx, si
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.eax >>> 0)); // 846233: mov dword ptr [esp + 0x24], eax
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 846237: fild dword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 0.000125; // 84623b: fmul qword ptr [0x96a6b8]
        R.st[0] = R.st[0] + 1.0; // 846241: fadd qword ptr [0x967890]
        R.m.wf64(((R.esp + 0x24) | 0) >>> 0, R.st[0]); R.fpop(); // 846247: fstp qword ptr [esp + 0x24]
        if (R.cLE) { pc = 0x84627f; continue; } // 84624b: jle 0x84627f
        pc = 0x84624d; continue;
      case 0x84624d:
        R.edx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 84624d: movsx edx, si
        R.eax = (((((R.ecx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 846250: movsx eax, cx
        R.ecx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 846253: mov ecx, dword ptr [ebp + 8]
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 846256: sub eax, edx
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.eax >>> 0)); // 846258: mov dword ptr [esp + 0x34], eax
        R.edx = (((R.m.u8(((R.ecx + 0x57) | 0) >>> 0)) << 24 >> 24)) | 0; // 84625c: movsx edx, byte ptr [ecx + 0x57]
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 846260: fild dword ptr [esp + 0x34]
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.edx >>> 0)); // 846264: mov dword ptr [esp + 0x34], edx
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 846268: fild dword ptr [esp + 0x34]
        R.st[0] = R.st[0] * 0.08771929824561403; // 84626c: fmul qword ptr [0x96f930]
        R.st[0] = R.st[0] + 0.75; // 846272: fadd qword ptr [0x969040]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 846278: fmulp st(1)
        pc = 0x84630f; continue; // 84627a: jmp 0x84630f
      case 0x84627f:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebp + 0x14) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84627f: mov al, byte ptr [ebp + 0x14]
        R.sub(((R.eax >>> 0) & 0xff), 0x5, 8); // 846282: cmp al, 5
        if (R.zf) { pc = 0x8462a2; continue; } // 846284: je 0x8462a2
        pc = 0x846286; continue;
      case 0x846286:
        R.sub(((R.eax >>> 0) & 0xff), 0xc, 8); // 846286: cmp al, 0xc
        if (R.zf) { pc = 0x8462a2; continue; } // 846288: je 0x8462a2
        pc = 0x84628a; continue;
      case 0x84628a:
        R.eax = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 84628a: movsx eax, si
        R.ecx = (((((R.ecx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 84628d: movsx ecx, cx
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 846290: sub ecx, eax
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.ecx >>> 0)); // 846292: mov dword ptr [esp + 0x34], ecx
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 846296: fild dword ptr [esp + 0x34]
        R.st[0] = R.st[0] * 1.5; // 84629a: fmul qword ptr [0x968940]
        pc = 0x84630f; continue; // 8462a0: jmp 0x84630f
      case 0x8462a2:
        R.fcom(R.st[0], 10.0); // 8462a2: fcom qword ptr [0x9688b0]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8462a8: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 8462aa: test ah, 0x41
        if (!R.zf) { pc = 0x8462ff; continue; } // 8462ad: jne 0x8462ff
        pc = 0x8462af; continue;
      case 0x8462af:
        R.fpush(R.st[0]); // 8462af: fld st(0)
        R.st[0] = R.st[0] * 0.01; // 8462b1: fmul qword ptr [0x967898]
        R.st[0] = 1.1 - R.st[0]; // 8462b7: fsubr qword ptr [0x9689c0]
        R.fpush(R.st[0]); // 8462bd: fld st(0)
        R.fcom(R.st[0], 0.1); R.fpop(); // 8462bf: fcomp qword ptr [0x967880]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8462c5: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8462c7: test ah, 1
        if (R.zf) { pc = 0x8462d6; continue; } // 8462ca: je 0x8462d6
        pc = 0x8462cc; continue;
      case 0x8462cc:
        R.fpop(); // 8462cc: fstp st(0)
        R.fpush(0.1); // 8462ce: fld qword ptr [0x967880]
        pc = 0x8462ed; continue; // 8462d4: jmp 0x8462ed
      case 0x8462d6:
        R.fpush(R.st[0]); // 8462d6: fld st(0)
        R.fcom(R.st[0], 1.0); R.fpop(); // 8462d8: fcomp qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8462de: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 8462e0: test ah, 0x41
        if (!R.zf) { pc = 0x8462ed; continue; } // 8462e3: jne 0x8462ed
        pc = 0x8462e5; continue;
      case 0x8462e5:
        R.fpop(); // 8462e5: fstp st(0)
        R.fpush(1.0); // 8462e7: fld qword ptr [0x967890]
        pc = 0x8462ed; continue;
      case 0x8462ed:
        R.edx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8462ed: movsx edx, si
        R.eax = (((((R.ecx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8462f0: movsx eax, cx
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 8462f3: sub eax, edx
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.eax >>> 0)); // 8462f5: mov dword ptr [esp + 0x34], eax
        R.st[0] = R.st[0] * R.m.s32(((R.esp + 0x34) | 0) >>> 0); // 8462f9: fimul dword ptr [esp + 0x34]
        pc = 0x84630f; continue; // 8462fd: jmp 0x84630f
      case 0x8462ff:
        R.edx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8462ff: movsx edx, si
        R.eax = (((((R.ecx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 846302: movsx eax, cx
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 846305: sub eax, edx
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.eax >>> 0)); // 846307: mov dword ptr [esp + 0x34], eax
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 84630b: fild dword ptr [esp + 0x34]
        pc = 0x84630f; continue;
      case 0x84630f:
        R.fcom(R.st[0], 0.0); // 84630f: fcom qword ptr [0x9689a0]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 846315: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 846317: test ah, 0x41
        if (!R.zf) { pc = 0x846386; continue; } // 84631a: jne 0x846386
        pc = 0x84631c; continue;
      case 0x84631c:
        R.fpush(R.f64(((R.esp + 0x7c) | 0))); // 84631c: fld qword ptr [esp + 0x7c]
        R.fcom(R.st[0], 1.0); R.fpop(); // 846320: fcomp qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 846326: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 846328: test ah, 1
        if (R.zf) { pc = 0x846386; continue; } // 84632b: je 0x846386
        pc = 0x84632d; continue;
      case 0x84632d:
        R.fpush(R.st[0]); // 84632d: fld st(0)
        R.st[0] = R.st[0] * 0.02; // 84632f: fmul qword ptr [0x968a98]
        R.fpush(100.0); // 846335: fld qword ptr [0x9688a8]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 84633b: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84633d: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 84633f: test ah, 1
        if (R.zf) { pc = 0x84634c; continue; } // 846342: je 0x84634c
        pc = 0x846344; continue;
      case 0x846344:
        R.fpop(); // 846344: fstp st(0)
        R.fpush(100.0); // 846346: fld qword ptr [0x9688a8]
        pc = 0x84634c; continue;
      case 0x84634c:
        R.fpush(150.0); // 84634c: fld qword ptr [0x968f50]
        R.st[0] = R.st[0] - R.st[1]; // 846352: fsub st(1)
        R.edx = (R.m.u32(((R.ebp + 0x18) | 0) >>> 0)) | 0; // 846354: mov edx, dword ptr [ebp + 0x18]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 846357: test edx, edx
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x7c) | 0)); // 846359: fmul qword ptr [esp + 0x7c]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 84635d: faddp st(1)
        R.st[0] = R.st[0] * 0.006666666666666667; // 84635f: fmul qword ptr [0x96d1d0]
        { const t = R.st[0]; R.st[0] = R.st[2]; R.st[2] = t; } // 846365: fxch st(2)
        R.st[0] = R.st[0] * R.st[2]; // 846367: fmul st(2)
        { const t = R.st[0]; R.st[0] = R.st[2]; R.st[2] = t; } // 846369: fxch st(2)
        if (R.zf) { pc = 0x846382; continue; } // 84636b: je 0x846382
        pc = 0x84636d; continue;
      case 0x84636d:
        R.fcom(R.st[0], 0.6); R.fpop(); // 84636d: fcomp qword ptr [0x968e48]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 846373: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 846375: test ah, 1
        if (R.zf) { pc = 0x846389; continue; } // 846378: je 0x846389
        pc = 0x84637a; continue;
      case 0x84637a:
        R.m.w32(((R.edx) | 0) >>> 0, R.logic(R.m.u32(((R.edx) | 0) >>> 0) | 0x100000, 32)); // 84637a: or dword ptr [edx], 0x100000
        pc = 0x846389; continue; // 846380: jmp 0x846389
      case 0x846382:
        R.fpop(); // 846382: fstp st(0)
        pc = 0x846389; continue; // 846384: jmp 0x846389
      case 0x846386:
        R.edx = (R.m.u32(((R.ebp + 0x18) | 0) >>> 0)) | 0; // 846386: mov edx, dword ptr [ebp + 0x18]
        pc = 0x846389; continue;
      case 0x846389:
        R.sub(((R.ebx >>> 0) & 0xff), 0x5, 8); // 846389: cmp bl, 5
        if (R.zf) { pc = 0x84640a; continue; } // 84638c: je 0x84640a
        pc = 0x84638e; continue;
      case 0x84638e:
        R.sub(((R.ebx >>> 0) & 0xff), 0xc, 8); // 84638e: cmp bl, 0xc
        if (R.zf) { pc = 0x84640a; continue; } // 846391: je 0x84640a
        pc = 0x846393; continue;
      case 0x846393:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.ebp + 0x14) | 0) >>> 0)) & 0xff) << 0)) | 0; // 846393: mov cl, byte ptr [ebp + 0x14]
        R.sub(((R.ecx >>> 0) & 0xff), 0x5, 8); // 846396: cmp cl, 5
        if (R.zf) { pc = 0x8463a0; continue; } // 846399: je 0x8463a0
        pc = 0x84639b; continue;
      case 0x84639b:
        R.sub(((R.ecx >>> 0) & 0xff), 0xc, 8); // 84639b: cmp cl, 0xc
        if (!R.zf) { pc = 0x84640d; continue; } // 84639e: jne 0x84640d
        pc = 0x8463a0; continue;
      case 0x8463a0:
        R.fcom(R.st[0], 0.0); // 8463a0: fcom qword ptr [0x9689a0]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8463a6: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8463a8: test ah, 1
        if (R.zf) { pc = 0x84640d; continue; } // 8463ab: je 0x84640d
        pc = 0x8463ad; continue;
      case 0x8463ad:
        R.sub(((R.ebx >>> 0) & 0xff), 0x8, 8); // 8463ad: cmp bl, 8
        if (R.zf) { pc = 0x8463e3; continue; } // 8463b0: je 0x8463e3
        pc = 0x8463b2; continue;
      case 0x8463b2:
        R.sub(((R.ebx >>> 0) & 0xff), 0xf, 8); // 8463b2: cmp bl, 0xf
        if (R.zf) { pc = 0x8463e3; continue; } // 8463b5: je 0x8463e3
        pc = 0x8463b7; continue;
      case 0x8463b7:
        R.sub(((R.ebx >>> 0) & 0xff), 0x6, 8); // 8463b7: cmp bl, 6
        if (R.zf) { pc = 0x8463e3; continue; } // 8463ba: je 0x8463e3
        pc = 0x8463bc; continue;
      case 0x8463bc:
        R.fpush(R.st[1]); // 8463bc: fld st(1)
        R.st[0] = R.st[0] * 0.1; // 8463be: fmul qword ptr [0x967880]
        R.st[0] = 1.0 - R.st[0]; // 8463c4: fsubr qword ptr [0x967890]
        R.fcom(R.st[0], 0.2); // 8463ca: fcom qword ptr [0x968918]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8463d0: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8463d2: test ah, 1
        if (R.zf) { pc = 0x8463df; continue; } // 8463d5: je 0x8463df
        pc = 0x8463d7; continue;
      case 0x8463d7:
        R.fpop(); // 8463d7: fstp st(0)
        R.fpush(0.2); // 8463d9: fld qword ptr [0x968918]
        pc = 0x8463df; continue;
      case 0x8463df:
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 8463df: fmulp st(1)
        pc = 0x84640d; continue; // 8463e1: jmp 0x84640d
      case 0x8463e3:
        R.fpush(R.st[1]); // 8463e3: fld st(1)
        R.st[0] = R.st[0] * 0.04; // 8463e5: fmul qword ptr [0x968a90]
        R.st[0] = 1.0 - R.st[0]; // 8463eb: fsubr qword ptr [0x967890]
        R.fcom(R.st[0], 0.4); // 8463f1: fcom qword ptr [0x968e00]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8463f7: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8463f9: test ah, 1
        if (R.zf) { pc = 0x846406; continue; } // 8463fc: je 0x846406
        pc = 0x8463fe; continue;
      case 0x8463fe:
        R.fpop(); // 8463fe: fstp st(0)
        R.fpush(0.4); // 846400: fld qword ptr [0x968e00]
        pc = 0x846406; continue;
      case 0x846406:
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 846406: fmulp st(1)
        pc = 0x84640d; continue; // 846408: jmp 0x84640d
      case 0x84640a:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.ebp + 0x14) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84640a: mov cl, byte ptr [ebp + 0x14]
        pc = 0x84640d; continue;
      case 0x84640d:
        R.st[0] = R.st[0] * 0.00022222222222222223; // 84640d: fmul qword ptr [0x96f928]
        R.st[0] = R.st[0] + 1.0; // 846413: fadd qword ptr [0x967890]
        R.m.wf64(((R.esp + 0x14) | 0) >>> 0, R.st[0]); // 846419: fst qword ptr [esp + 0x14]
        R.fcom(R.st[0], 0.001); R.fpop(); // 84641d: fcomp qword ptr [0x96a350]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 846423: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 846425: test ah, 1
        if (R.zf) { pc = 0x84643a; continue; } // 846428: je 0x84643a
        pc = 0x84642a; continue;
      case 0x84642a:
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, 0xd2f1a9fc); // 84642a: mov dword ptr [esp + 0x14], 0xd2f1a9fc
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, 0x3f50624d); // 846432: mov dword ptr [esp + 0x18], 0x3f50624d
        pc = 0x84643a; continue;
      case 0x84643a:
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x14) | 0)); // 84643a: fmul qword ptr [esp + 0x14]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 84643e: test edx, edx
        if (R.zf) { pc = 0x846504; continue; } // 846440: je 0x846504
        pc = 0x846446; continue;
      case 0x846446:
        R.fpush(R.f64(((R.esp + 0x14) | 0))); // 846446: fld qword ptr [esp + 0x14]
        R.fcom(R.st[0], 0.6); R.fpop(); // 84644a: fcomp qword ptr [0x968e48]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 846450: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 846452: test ah, 1
        if (R.zf) { pc = 0x8464b0; continue; } // 846455: je 0x8464b0
        pc = 0x846457; continue;
      case 0x846457:
        R.fpush(R.f32(((R.esp + 0x60) | 0))); // 846457: fld dword ptr [esp + 0x60]
        R.fcom(R.st[0], 1.2); R.fpop(); // 84645b: fcomp qword ptr [0x968978]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 846461: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 846463: test ah, 0x41
        if (!R.zf) { pc = 0x8464a7; continue; } // 846466: jne 0x8464a7
        pc = 0x846468; continue;
      case 0x846468:
        R.eax = (R.m.u32(((R.esp + 0x70) | 0) >>> 0)) | 0; // 846468: mov eax, dword ptr [esp + 0x70]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84646c: test eax, eax
        if (R.zf) { pc = 0x8464a7; continue; } // 84646e: je 0x8464a7
        pc = 0x846470; continue;
      case 0x846470:
        R.eax = (R.m.u32(((R.esp + 0x78) | 0) >>> 0)) | 0; // 846470: mov eax, dword ptr [esp + 0x78]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 846474: test eax, eax
        if (!R.zf) { pc = 0x8464a7; continue; } // 846476: jne 0x8464a7
        pc = 0x846478; continue;
      case 0x846478:
        R.fcom(R.st[0], 1.25); // 846478: fcom qword ptr [0x968928]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84647e: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 846480: test ah, 0x41
        if (!R.zf) { pc = 0x8464a7; continue; } // 846483: jne 0x8464a7
        pc = 0x846485; continue;
      case 0x846485:
        R.sub(((R.ebx >>> 0) & 0xff), 0x5, 8); // 846485: cmp bl, 5
        if (R.zf) { pc = 0x84648f; continue; } // 846488: je 0x84648f
        pc = 0x84648a; continue;
      case 0x84648a:
        R.sub(((R.ebx >>> 0) & 0xff), 0xc, 8); // 84648a: cmp bl, 0xc
        if (!R.zf) { pc = 0x8464a7; continue; } // 84648d: jne 0x8464a7
        pc = 0x84648f; continue;
      case 0x84648f:
        R.eax = (R.m.u32(((R.esp + 0x58) | 0) >>> 0)) | 0; // 84648f: mov eax, dword ptr [esp + 0x58]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 846493: test eax, eax
        if (R.zf) { pc = 0x84649e; continue; } // 846495: je 0x84649e
        pc = 0x846497; continue;
      case 0x846497:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + 0x49) | 0) >>> 0)) & 0xff) << 0)) | 0; // 846497: mov cl, byte ptr [eax + 0x49]
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 84649a: test cl, cl
        if (!R.zf) { pc = 0x8464a7; continue; } // 84649c: jne 0x8464a7
        pc = 0x84649e; continue;
      case 0x84649e:
        R.eax = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 84649e: mov eax, dword ptr [edx]
        R.eax = (R.logic((R.eax >>> 0) | 0x400000, 32)) | 0; // 8464a0: or eax, 0x400000
        pc = 0x846502; continue; // 8464a5: jmp 0x846502
      case 0x8464a7:
        R.eax = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 8464a7: mov eax, dword ptr [edx]
        R.eax = (R.logic((R.eax >>> 0) | 0x800000, 32)) | 0; // 8464a9: or eax, 0x800000
        pc = 0x846502; continue; // 8464ae: jmp 0x846502
      case 0x8464b0:
        R.fpush(R.f64(((R.esp + 0x14) | 0))); // 8464b0: fld qword ptr [esp + 0x14]
        R.fcom(R.st[0], 1.5); R.fpop(); // 8464b4: fcomp qword ptr [0x968940]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8464ba: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 8464bc: test ah, 0x41
        if (!R.zf) { pc = 0x846504; continue; } // 8464bf: jne 0x846504
        pc = 0x8464c1; continue;
      case 0x8464c1:
        R.fpush(R.f32(((R.esp + 0x60) | 0))); // 8464c1: fld dword ptr [esp + 0x60]
        R.fcom(R.st[0], 1.2); R.fpop(); // 8464c5: fcomp qword ptr [0x968978]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8464cb: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 8464cd: test ah, 0x41
        if (!R.zf) { pc = 0x846504; continue; } // 8464d0: jne 0x846504
        pc = 0x8464d2; continue;
      case 0x8464d2:
        R.eax = (R.m.u32(((R.esp + 0x70) | 0) >>> 0)) | 0; // 8464d2: mov eax, dword ptr [esp + 0x70]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8464d6: test eax, eax
        if (!R.zf) { pc = 0x846504; continue; } // 8464d8: jne 0x846504
        pc = 0x8464da; continue;
      case 0x8464da:
        R.eax = (R.m.u32(((R.esp + 0x78) | 0) >>> 0)) | 0; // 8464da: mov eax, dword ptr [esp + 0x78]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8464de: test eax, eax
        if (R.zf) { pc = 0x846504; continue; } // 8464e0: je 0x846504
        pc = 0x8464e2; continue;
      case 0x8464e2:
        R.sub(((R.ecx >>> 0) & 0xff), 0x5, 8); // 8464e2: cmp cl, 5
        if (R.zf) { pc = 0x8464ec; continue; } // 8464e5: je 0x8464ec
        pc = 0x8464e7; continue;
      case 0x8464e7:
        R.sub(((R.ecx >>> 0) & 0xff), 0xc, 8); // 8464e7: cmp cl, 0xc
        if (!R.zf) { pc = 0x846504; continue; } // 8464ea: jne 0x846504
        pc = 0x8464ec; continue;
      case 0x8464ec:
        R.eax = (R.m.u32(((R.esp + 0x58) | 0) >>> 0)) | 0; // 8464ec: mov eax, dword ptr [esp + 0x58]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8464f0: test eax, eax
        if (R.zf) { pc = 0x8464fb; continue; } // 8464f2: je 0x8464fb
        pc = 0x8464f4; continue;
      case 0x8464f4:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + 0x49) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8464f4: mov cl, byte ptr [eax + 0x49]
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 8464f7: test cl, cl
        if (!R.zf) { pc = 0x846504; continue; } // 8464f9: jne 0x846504
        pc = 0x8464fb; continue;
      case 0x8464fb:
        R.eax = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 8464fb: mov eax, dword ptr [edx]
        R.eax = (R.logic((R.eax >>> 0) | 0x200000, 32)) | 0; // 8464fd: or eax, 0x200000
        pc = 0x846502; continue;
      case 0x846502:
        R.m.w32(((R.edx) | 0) >>> 0, (R.eax >>> 0)); // 846502: mov dword ptr [edx], eax
        pc = 0x846504; continue;
      case 0x846504:
        R.ebx = (R.m.u32(((R.esp + 0x48) | 0) >>> 0)) | 0; // 846504: mov ebx, dword ptr [esp + 0x48]
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 846508: test ebx, ebx
        if (R.zf) { pc = 0x846605; continue; } // 84650a: je 0x846605
        pc = 0x846510; continue;
      case 0x846510:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x46) | 0) >>> 0)) & 0xff) << 0)) | 0; // 846510: mov al, byte ptr [esp + 0x46]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esp + 0x47) | 0) >>> 0)) & 0xff) << 0)) | 0; // 846514: mov cl, byte ptr [esp + 0x47]
        R.sub(((R.eax >>> 0) & 0xff), ((R.ecx >>> 0) & 0xff), 8); // 846518: cmp al, cl
        if (R.zf) { pc = 0x8465c2; continue; } // 84651a: je 0x8465c2
        pc = 0x846520; continue;
      case 0x846520:
        R.esi = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 846520: mov esi, dword ptr [esp + 0x30]
        R.sub(((R.esi >>> 0) & 0xffff), 0x1f4, 16); // 846524: cmp si, 0x1f4
        if (R.cLE) { pc = 0x846534; continue; } // 846529: jle 0x846534
        pc = 0x84652b; continue;
      case 0x84652b:
        R.esi = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 84652b: movsx esi, si
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.esi >>> 0)); // 84652e: mov dword ptr [esp + 0x1c], esi
        pc = 0x84653c; continue; // 846532: jmp 0x84653c
      case 0x846534:
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, 0x1f4); // 846534: mov dword ptr [esp + 0x1c], 0x1f4
        pc = 0x84653c; continue;
      case 0x84653c:
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 84653c: movsx eax, al
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.eax >>> 0)); // 84653f: mov dword ptr [esp + 0x34], eax
        R.eax = (((R.m.u16(((R.esp + 0x40) | 0) >>> 0)) << 16 >> 16)) | 0; // 846543: movsx eax, word ptr [esp + 0x40]
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 846548: fild dword ptr [esp + 0x34]
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.eax >>> 0)); // 84654c: mov dword ptr [esp + 0x34], eax
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 846550: fild dword ptr [esp + 0x34]
        R.ecx = (((((R.ecx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 846554: movsx ecx, cl
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 846557: fmulp st(1)
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 846559: fild dword ptr [esp + 0x1c]
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.ecx >>> 0)); // 84655d: mov dword ptr [esp + 0x34], ecx
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 846561: fild dword ptr [esp + 0x34]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 846565: fmulp st(1)
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 846567: fdivp st(1)
        R.fpush(0.01); // 846569: fld qword ptr [0x967898]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 84656f: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 846571: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 846573: test ah, 0x41
        if (!R.zf) { pc = 0x846582; continue; } // 846576: jne 0x846582
        pc = 0x846578; continue;
      case 0x846578:
        R.fpop(); // 846578: fstp st(0)
        R.fpush(0.01); // 84657a: fld qword ptr [0x967898]
        pc = 0x846599; continue; // 846580: jmp 0x846599
      case 0x846582:
        R.fpush(10.0); // 846582: fld qword ptr [0x9688b0]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 846588: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84658a: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 84658c: test ah, 1
        if (R.zf) { pc = 0x846599; continue; } // 84658f: je 0x846599
        pc = 0x846591; continue;
      case 0x846591:
        R.fpop(); // 846591: fstp st(0)
        R.fpush(10.0); // 846593: fld qword ptr [0x9688b0]
        pc = 0x846599; continue;
      case 0x846599:
        R.eax = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 846599: mov eax, dword ptr [ebx + 0x53]
        R.ecx = (R.m.u32(((R.edi + 0x53) | 0) >>> 0)) | 0; // 84659c: mov ecx, dword ptr [edi + 0x53]
        R.fpush(R.st[0]); // 84659f: fld st(0)
        R.ecx = (R.m.u32(((R.ecx + 0x71) | 0) >>> 0)) | 0; // 8465a1: mov ecx, dword ptr [ecx + 0x71]
        R.esi = (R.m.u32(((R.eax + 0x71) | 0) >>> 0)) | 0; // 8465a4: mov esi, dword ptr [eax + 0x71]
        R.sub((R.ecx >>> 0), (R.esi >>> 0), 32); // 8465a7: cmp ecx, esi
        R.st[2] = R.st[2] * R.st[0]; R.fpop(); // 8465a9: fmulp st(2)
        if (R.zf) { pc = 0x846603; continue; } // 8465ab: je 0x846603
        pc = 0x8465ad; continue;
      case 0x8465ad:
        R.fcom(R.st[0], 1.0); R.fpop(); // 8465ad: fcomp qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8465b3: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8465b5: test ah, 1
        if (R.zf) { pc = 0x846605; continue; } // 8465b8: je 0x846605
        pc = 0x8465ba; continue;
      case 0x8465ba:
        R.st[0] = R.st[0] * 0.2; // 8465ba: fmul qword ptr [0x968918]
        pc = 0x8465f7; continue; // 8465c0: jmp 0x8465f7
      case 0x8465c2:
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 8465c2: mov eax, dword ptr [ebp + 8]
        R.ecx = (R.m.u32(((R.eax + 0x1a) | 0) >>> 0)) | 0; // 8465c5: mov ecx, dword ptr [eax + 0x1a]
        R.eax = (R.m.u32(((R.ecx + 0x71) | 0) >>> 0)) | 0; // 8465c8: mov eax, dword ptr [ecx + 0x71]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8465cb: test eax, eax
        if (R.zf) { pc = 0x846605; continue; } // 8465cd: je 0x846605
        pc = 0x8465cf; continue;
      case 0x8465cf:
        R.ecx = (R.m.u32(((0x9cfa10) | 0) >>> 0)) | 0; // 8465cf: mov ecx, dword ptr [0x9cfa10]
        R.esi = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8465d5: mov esi, dword ptr [eax]
        R.sub((R.esi >>> 0), (R.ecx >>> 0), 32); // 8465d7: cmp esi, ecx
        if (!R.zf) { pc = 0x846605; continue; } // 8465d9: jne 0x846605
        pc = 0x8465db; continue;
      case 0x8465db:
        R.eax = (R.m.u32(((R.edi + 0x53) | 0) >>> 0)) | 0; // 8465db: mov eax, dword ptr [edi + 0x53]
        R.eax = (R.m.u32(((R.eax + 0x71) | 0) >>> 0)) | 0; // 8465de: mov eax, dword ptr [eax + 0x71]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8465e1: test eax, eax
        if (R.zf) { pc = 0x846605; continue; } // 8465e3: je 0x846605
        pc = 0x8465e5; continue;
      case 0x8465e5:
        R.sub(R.m.u32(((R.eax) | 0) >>> 0), (R.ecx >>> 0), 32); // 8465e5: cmp dword ptr [eax], ecx
        if (R.zf) { pc = 0x846605; continue; } // 8465e7: je 0x846605
        pc = 0x8465e9; continue;
      case 0x8465e9:
        R.ecx = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 8465e9: mov ecx, dword ptr [ebx + 0x53]
        R.sub((R.eax >>> 0), R.m.u32(((R.ecx + 0x71) | 0) >>> 0), 32); // 8465ec: cmp eax, dword ptr [ecx + 0x71]
        if (R.zf) { pc = 0x846605; continue; } // 8465ef: je 0x846605
        pc = 0x8465f1; continue;
      case 0x8465f1:
        R.st[0] = R.st[0] * 0.4; // 8465f1: fmul qword ptr [0x968e00]
        pc = 0x8465f7; continue;
      case 0x8465f7:
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 8465f7: test edx, edx
        if (R.zf) { pc = 0x846605; continue; } // 8465f9: je 0x846605
        pc = 0x8465fb; continue;
      case 0x8465fb:
        R.m.w32(((R.edx) | 0) >>> 0, R.logic(R.m.u32(((R.edx) | 0) >>> 0) | 0x2000000, 32)); // 8465fb: or dword ptr [edx], 0x2000000
        pc = 0x846605; continue; // 846601: jmp 0x846605
      case 0x846603:
        R.fpop(); // 846603: fstp st(0)
        pc = 0x846605; continue;
      case 0x846605:
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x24) | 0)); // 846605: fmul qword ptr [esp + 0x24]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 846609: test edx, edx
        R.m.wf64(((R.esp + 0x14) | 0) >>> 0, R.st[0]); // 84660b: fst qword ptr [esp + 0x14]
        if (R.zf) { pc = 0x84662e; continue; } // 84660f: je 0x84662e
        pc = 0x846611; continue;
      case 0x846611:
        R.fpush(R.f64(((R.esp + 0x24) | 0))); // 846611: fld qword ptr [esp + 0x24]
        R.fcom(R.st[0], 0.6); R.fpop(); // 846615: fcomp qword ptr [0x968e48]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84661b: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 84661d: test ah, 1
        if (R.zf) { pc = 0x84662e; continue; } // 846620: je 0x84662e
        pc = 0x846622; continue;
      case 0x846622:
        R.m.w32(((R.edx) | 0) >>> 0, R.logic(R.m.u32(((R.edx) | 0) >>> 0) | 0x800000, 32)); // 846622: or dword ptr [edx], 0x800000
        pc = 0x84662e; continue; // 846628: jmp 0x84662e
      case 0x84662a:
        R.fpush(R.f64(((R.esp + 0x14) | 0))); // 84662a: fld qword ptr [esp + 0x14]
        pc = 0x84662e; continue;
      case 0x84662e:
        R.eax = (R.m.u32(((R.ebp + 0x10) | 0) >>> 0)) | 0; // 84662e: mov eax, dword ptr [ebp + 0x10]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 846631: test eax, eax
        if (R.zf) { pc = 0x8467f7; continue; } // 846633: je 0x8467f7
        pc = 0x846639; continue;
      case 0x846639:
        R.fcom(R.st[0], 1.75); // 846639: fcom qword ptr [0x968f98]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84663f: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 846641: test ah, 1
        if (!R.zf) { pc = 0x8467f7; continue; } // 846644: jne 0x8467f7
        pc = 0x84664a; continue;
      case 0x84664a:
        R.ecx = (((R.esp + 0x9c) | 0)) | 0; // 84664a: lea ecx, [esp + 0x9c]
        R.fpop(); // 846651: fstp st(0)
        R.call(0x85e410, { n: 0, thisEcx: true, calleeClean: false }); // 846653: call 0x85e410
        R.ecx = (R.m.u32(((0xae2a38) | 0) >>> 0)) | 0; // 846658: mov ecx, dword ptr [0xae2a38]
        R.push((R.edi >>> 0)); // 84665e: push edi
        R.m.w32(((R.esp + 0x2ec) | 0) >>> 0, 0x0); // 84665f: mov dword ptr [esp + 0x2ec], 0
        R.call(0x5a0590, { n: 1, thisEcx: true, calleeClean: true }); // 84666a: call 0x5a0590
        R.esi = ((R.eax >>> 0)) | 0; // 84666f: mov esi, eax
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 846671: test esi, esi
        if (R.zf) { pc = 0x8467f1; continue; } // 846673: je 0x8467f1
        pc = 0x846679; continue;
      case 0x846679:
        R.ebx = (R.m.u32(((R.ebp + 0x14) | 0) >>> 0)) | 0; // 846679: mov ebx, dword ptr [ebp + 0x14]
        R.edx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 84667c: mov edx, dword ptr [ebp + 8]
        R.push(0x0); // 84667f: push 0
        R.push((R.ebx >>> 0)); // 846681: push ebx
        R.push(0xffffffff); // 846682: push -1
        R.push(0x0); // 846684: push 0
        R.push((R.edi >>> 0)); // 846686: push edi
        R.push((R.edx >>> 0)); // 846687: push edx
        R.ecx = (((R.esp + 0xb4) | 0)) | 0; // 846688: lea ecx, [esp + 0xb4]
        R.call(0x864550, { n: 6, thisEcx: false, calleeClean: true, float: true }); // 84668f: call 0x864550
        R.fpush(0.1); // 846694: fld qword ptr [0x967880]
        R.fcom(R.st[0], R.f64(((R.esp + 0x14) | 0))); R.fpop(); // 84669a: fcomp qword ptr [esp + 0x14]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84669e: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 8466a0: test ah, 0x41
        if (!R.zf) { pc = 0x8466ad; continue; } // 8466a3: jne 0x8466ad
        pc = 0x8466a5; continue;
      case 0x8466a5:
        R.fpush(0.1); // 8466a5: fld qword ptr [0x967880]
        pc = 0x8466b1; continue; // 8466ab: jmp 0x8466b1
      case 0x8466ad:
        R.fpush(R.f64(((R.esp + 0x14) | 0))); // 8466ad: fld qword ptr [esp + 0x14]
        pc = 0x8466b1; continue;
      case 0x8466b1:
        R.fpush(3.5); // 8466b1: fld qword ptr [0x968e38]
        R.st[0] = R.st[0] / R.st[1]; // 8466b7: fdiv st(1)
        R.m.wf64(((R.esp + 0x24) | 0) >>> 0, R.st[0]); R.fpop(); // 8466b9: fstp qword ptr [esp + 0x24]
        R.fpop(); // 8466bd: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x24) | 0))); // 8466bf: fld qword ptr [esp + 0x24]
        R.fcom(R.st[0], 0.9); R.fpop(); // 8466c3: fcomp qword ptr [0x9689d8]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8466c9: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8466cb: test ah, 1
        if (R.zf) { pc = 0x8466e0; continue; } // 8466ce: je 0x8466e0
        pc = 0x8466d0; continue;
      case 0x8466d0:
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, 0xcccccccd); // 8466d0: mov dword ptr [esp + 0x24], 0xcccccccd
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0x3feccccc); // 8466d8: mov dword ptr [esp + 0x28], 0x3feccccc
        pc = 0x8466e0; continue;
      case 0x8466e0:
        R.fpush(R.f64(((R.esp + 0x24) | 0))); // 8466e0: fld qword ptr [esp + 0x24]
        R.st[0] = R.st[0] * R.st[1]; // 8466e4: fmul st(1)
        R.push((R.ebx >>> 0)); // 8466e6: push ebx
        R.ecx = ((R.esi >>> 0)) | 0; // 8466e7: mov ecx, esi
        R.m.wf64(((R.esp + 0x80) | 0) >>> 0, R.st[0]); R.fpop(); // 8466e9: fstp qword ptr [esp + 0x80]
        R.fpop(); // 8466f0: fstp st(0)
        R.call(0x597db0, { n: 1, thisEcx: true, calleeClean: true }); // 8466f2: call 0x597db0
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.eax >>> 0)); // 8466f7: mov dword ptr [esp + 0x34], eax
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 8466fb: fild dword ptr [esp + 0x34]
        R.m.wf64(((R.esp + 0x64) | 0) >>> 0, R.st[0]); R.fpop(); // 8466ff: fstp qword ptr [esp + 0x64]
        R.fpush(R.f64(((R.esp + 0x7c) | 0))); // 846703: fld qword ptr [esp + 0x7c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x64) | 0))); R.fpop(); // 846707: fcomp qword ptr [esp + 0x64]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84670b: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 84670d: test ah, 0x41
        if (!R.zf) { pc = 0x846735; continue; } // 846710: jne 0x846735
        pc = 0x846712; continue;
      case 0x846712:
        R.fpush(R.f64(((R.esp + 0x7c) | 0))); // 846712: fld qword ptr [esp + 0x7c]
        R.fcom(R.st[0], 0.0); R.fpop(); // 846716: fcomp qword ptr [0x9689a0]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84671c: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 84671e: test ah, 0x41
        if (!R.zf) { pc = 0x846735; continue; } // 846721: jne 0x846735
        pc = 0x846723; continue;
      case 0x846723:
        R.fpush(R.f64(((R.esp + 0x64) | 0))); // 846723: fld qword ptr [esp + 0x64]
        R.st[0] = R.st[0] / R.f64(((R.esp + 0x7c) | 0)); // 846727: fdiv qword ptr [esp + 0x7c]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x14) | 0)); // 84672b: fmul qword ptr [esp + 0x14]
        R.fpush(R.f64(((R.esp + 0x64) | 0))); // 84672f: fld qword ptr [esp + 0x64]
        pc = 0x84673d; continue; // 846733: jmp 0x84673d
      case 0x846735:
        R.fpush(R.f64(((R.esp + 0x14) | 0))); // 846735: fld qword ptr [esp + 0x14]
        R.fpush(R.f64(((R.esp + 0x7c) | 0))); // 846739: fld qword ptr [esp + 0x7c]
        pc = 0x84673d; continue;
      case 0x84673d:
        R.eax = (R.m.u32(((R.esp + 0x58) | 0) >>> 0)) | 0; // 84673d: mov eax, dword ptr [esp + 0x58]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 846741: test eax, eax
        if (R.zf) { pc = 0x8467d6; continue; } // 846743: je 0x8467d6
        pc = 0x846749; continue;
      case 0x846749:
        R.fpush(R.m.s32(((R.eax + 0xc) | 0) >>> 0)); // 846749: fild dword ptr [eax + 0xc]
        R.fcom(R.st[0], 10.0); // 84674c: fcom qword ptr [0x9688b0]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 846752: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 846754: test ah, 1
        if (R.zf) { pc = 0x846761; continue; } // 846757: je 0x846761
        pc = 0x846759; continue;
      case 0x846759:
        R.fpop(); // 846759: fstp st(0)
        R.fpush(10.0); // 84675b: fld qword ptr [0x9688b0]
        pc = 0x846761; continue;
      case 0x846761:
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 846761: fxch st(1)
        R.st[0] = R.st[0] / R.st[1]; // 846763: fdiv st(1)
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 846765: fxch st(1)
        R.fpop(); // 846767: fstp st(0)
        R.fpush(0.1); // 846769: fld qword ptr [0x967880]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 84676f: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 846771: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 846773: test ah, 0x41
        if (R.zf) { pc = 0x8467d6; continue; } // 846776: je 0x8467d6
        pc = 0x846778; continue;
      case 0x846778:
        R.fpush(10.0); // 846778: fld qword ptr [0x9688b0]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 84677e: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 846780: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 846782: test ah, 1
        if (R.zf) { pc = 0x8467ac; continue; } // 846785: je 0x8467ac
        pc = 0x846787; continue;
      case 0x846787:
        R.fpop(); // 846787: fstp st(0)
        R.fpush(10.0); // 846789: fld qword ptr [0x9688b0]
        R.st[0] = R.st[0] / R.f64(((R.esp + 0x24) | 0)); // 84678f: fdiv qword ptr [esp + 0x24]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 846793: fmulp st(1)
        R.ecx = (R.m.u32(((R.esp + 0x2e0) | 0) >>> 0)) | 0; // 846795: mov ecx, dword ptr [esp + 0x2e0]
        /* fs */ // 84679c: mov dword ptr fs:[0], ecx
        R.edi = (R.pop()) | 0; // 8467a3: pop edi
        R.esi = (R.pop()) | 0; // 8467a4: pop esi
        R.ebx = (R.pop()) | 0; // 8467a5: pop ebx
        R.esp = ((R.ebp >>> 0)) | 0; // 8467a6: mov esp, ebp
        R.ebp = (R.pop()) | 0; // 8467a8: pop ebp
        return R.st[0]; // 8467a9: ret 0x14
      case 0x8467ac:
        R.fcom(R.st[0], 1.0); // 8467ac: fcom qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8467b2: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8467b4: test ah, 1
        if (!R.zf) { pc = 0x8467d6; continue; } // 8467b7: jne 0x8467d6
        pc = 0x8467b9; continue;
      case 0x8467b9:
        R.st[0] = R.st[0] / R.f64(((R.esp + 0x24) | 0)); // 8467b9: fdiv qword ptr [esp + 0x24]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 8467bd: fmulp st(1)
        R.ecx = (R.m.u32(((R.esp + 0x2e0) | 0) >>> 0)) | 0; // 8467bf: mov ecx, dword ptr [esp + 0x2e0]
        /* fs */ // 8467c6: mov dword ptr fs:[0], ecx
        R.edi = (R.pop()) | 0; // 8467cd: pop edi
        R.esi = (R.pop()) | 0; // 8467ce: pop esi
        R.ebx = (R.pop()) | 0; // 8467cf: pop ebx
        R.esp = ((R.ebp >>> 0)) | 0; // 8467d0: mov esp, ebp
        R.ebp = (R.pop()) | 0; // 8467d2: pop ebp
        return R.st[0]; // 8467d3: ret 0x14
      case 0x8467d6:
        R.fpop(); // 8467d6: fstp st(0)
        R.ecx = (R.m.u32(((R.esp + 0x2e0) | 0) >>> 0)) | 0; // 8467d8: mov ecx, dword ptr [esp + 0x2e0]
        /* fs */ // 8467df: mov dword ptr fs:[0], ecx
        R.edi = (R.pop()) | 0; // 8467e6: pop edi
        R.esi = (R.pop()) | 0; // 8467e7: pop esi
        R.ebx = (R.pop()) | 0; // 8467e8: pop ebx
        R.esp = ((R.ebp >>> 0)) | 0; // 8467e9: mov esp, ebp
        R.ebp = (R.pop()) | 0; // 8467eb: pop ebp
        return R.st[0]; // 8467ec: ret 0x14
      case 0x8467ef:
        R.fpop(); // 8467ef: fstp st(0)
        pc = 0x8467f1; continue;
      case 0x8467f1:
        R.fpush(0.0); // 8467f1: fld qword ptr [0x9689a0]
        pc = 0x8467f7; continue;
      case 0x8467f7:
        R.ecx = (R.m.u32(((R.esp + 0x2e0) | 0) >>> 0)) | 0; // 8467f7: mov ecx, dword ptr [esp + 0x2e0]
        R.edi = (R.pop()) | 0; // 8467fe: pop edi
        R.esi = (R.pop()) | 0; // 8467ff: pop esi
        /* fs */ // 846800: mov dword ptr fs:[0], ecx
        R.ebx = (R.pop()) | 0; // 846807: pop ebx
        R.esp = ((R.ebp >>> 0)) | 0; // 846808: mov esp, ebp
        R.ebp = (R.pop()) | 0; // 84680a: pop ebp
        return R.st[0]; // 84680b: ret 0x14
      default: throw new Error(`f_844780: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
