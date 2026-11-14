// 0x53c590 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4cf5a0=1c, 4cf6d0=1c, 540a50=3, 542740=1, 5e8290=9, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_53c590(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x53c590;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x53c590:
        R.esp = (R.sub((R.esp >>> 0), 0x20c, 32)) | 0; // 53c590: sub esp, 0x20c
        R.push((R.edi >>> 0)); // 53c596: push edi
        R.edi = (R.m.u32(((R.esp + 0x214) | 0) >>> 0)) | 0; // 53c597: mov edi, dword ptr [esp + 0x214]
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 53c59e: test edi, edi
        R.m.w8(((R.esp + 0x7) | 0) >>> 0, 0x0); // 53c5a0: mov byte ptr [esp + 7], 0
        if (!R.zf) { pc = 0x53c60d; continue; } // 53c5a5: jne 0x53c60d
        pc = 0x53c5a7; continue;
      case 0x53c5a7:
        R.eax = (((R.esp + 0x10) | 0)) | 0; // 53c5a7: lea eax, [esp + 0x10]
        R.ecx = (((R.esp + 0x110) | 0)) | 0; // 53c5ab: lea ecx, [esp + 0x110]
        R.push((R.eax >>> 0)); // 53c5b2: push eax
        R.push((R.ecx >>> 0)); // 53c5b3: push ecx
        R.push((R.edi >>> 0)); // 53c5b4: push edi
        R.push((R.edi >>> 0)); // 53c5b5: push edi
        R.push(0x9b5ac8); // 53c5b6: push 0x9b5ac8
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 53c5bb: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 53c5c0: add esp, 0x14
        R.edx = (((R.esp + 0x10) | 0)) | 0; // 53c5c3: lea edx, [esp + 0x10]
        R.eax = (((R.esp + 0x110) | 0)) | 0; // 53c5c7: lea eax, [esp + 0x110]
        R.push(0x382e); // 53c5ce: push 0x382e
        R.push((R.edx >>> 0)); // 53c5d3: push edx
        R.push((R.eax >>> 0)); // 53c5d4: push eax
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 53c5d5: call 0x90d130
        R.push((R.eax >>> 0)); // 53c5da: push eax
        R.push(0x9870e8); // 53c5db: push 0x9870e8
        R.push(0xae24d0); // 53c5e0: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 53c5e5: call 0x944c9f
        R.push((R.edi >>> 0)); // 53c5ea: push edi
        R.push(0xae24d0); // 53c5eb: push 0xae24d0
        R.push(0x9870e0); // 53c5f0: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 53c5f5: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 53c5fa: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, (R.edi >>> 0)); // 53c5fd: mov dword ptr [0xb67a34], edi
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 53c603: xor al, al
        R.edi = (R.pop()) | 0; // 53c605: pop edi
        R.esp = (R.add((R.esp >>> 0), 0x20c, 32)) | 0; // 53c606: add esp, 0x20c
        return R.ret(0); // 53c60c: ret 
      case 0x53c60d:
        R.push((R.ebx >>> 0)); // 53c60d: push ebx
        R.push((R.ebp >>> 0)); // 53c60e: push ebp
        R.push((R.esi >>> 0)); // 53c60f: push esi
        R.ecx = (((R.esp + 0x18) | 0)) | 0; // 53c610: lea ecx, [esp + 0x18]
        R.push(0x1); // 53c614: push 1
        R.push((R.ecx >>> 0)); // 53c616: push ecx
        R.push((R.edi >>> 0)); // 53c617: push edi
        R.call(0x540a50, { n: 3, thisEcx: false, calleeClean: false }); // 53c618: call 0x540a50
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 53c61d: add esp, 0xc
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.eax >>> 0)); // 53c620: mov dword ptr [esp + 0x14], eax
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 53c624: test eax, eax
        if (R.zf) { pc = 0x53c770; continue; } // 53c626: je 0x53c770
        pc = 0x53c62c; continue;
      case 0x53c62c:
        R.sub(R.m.u8(((R.esp + 0x224) | 0) >>> 0), 0x2, 8); // 53c62c: cmp byte ptr [esp + 0x224], 2
        if (!R.zf) { pc = 0x53c642; continue; } // 53c634: jne 0x53c642
        pc = 0x53c636; continue;
      case 0x53c636:
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 53c636: mov ecx, dword ptr [esp + 0x18]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 53c63a: test ecx, ecx
        if (!R.zf) { pc = 0x53c6df; continue; } // 53c63c: jne 0x53c6df
        pc = 0x53c642; continue;
      case 0x53c642:
        R.edi = (R.add((R.edi >>> 0), 0xd7, 32)) | 0; // 53c642: add edi, 0xd7
        R.ebp = (0x32) | 0; // 53c648: mov ebp, 0x32
        pc = 0x53c64d; continue;
      case 0x53c64d:
        R.esi = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 53c64d: mov esi, dword ptr [edi]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 53c64f: test esi, esi
        if (R.zf) { pc = 0x53c6bf; continue; } // 53c651: je 0x53c6bf
        pc = 0x53c653; continue;
      case 0x53c653:
        R.edx = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 53c653: mov edx, dword ptr [0xae2364]
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 53c659: mov eax, dword ptr [esi]
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 53c65b: cmp eax, edx
        if (!R.cL) { pc = 0x53c6bf; continue; } // 53c65d: jge 0x53c6bf
        pc = 0x53c65f; continue;
      case 0x53c65f:
        R.eax = (R.m.u32(((R.esp + 0x228) | 0) >>> 0)) | 0; // 53c65f: mov eax, dword ptr [esp + 0x228]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 53c666: test eax, eax
        if (R.zf) { pc = 0x53c6bb; continue; } // 53c668: je 0x53c6bb
        pc = 0x53c66a; continue;
      case 0x53c66a:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 53c66a: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 53c670: push esi
        R.call(0x4cf6d0, { n: 1, thisEcx: false, calleeClean: true }); // 53c671: call 0x4cf6d0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 53c676: test eax, eax
        if (R.zf) { pc = 0x53c6bb; continue; } // 53c678: je 0x53c6bb
        pc = 0x53c67a; continue;
      case 0x53c67a:
        R.ebx = (R.m.u32(((R.esp + 0x220) | 0) >>> 0)) | 0; // 53c67a: mov ebx, dword ptr [esp + 0x220]
        R.eax = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 53c681: mov eax, dword ptr [esi + 0x39]
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 53c684: cmp eax, ebx
        if (R.zf) { pc = 0x53c6bb; continue; } // 53c686: je 0x53c6bb
        pc = 0x53c688; continue;
      case 0x53c688:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 53c688: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 53c68e: push esi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 53c68f: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 53c694: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 53c696: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x53c6b5; continue; } // 53c69b: je 0x53c6b5
        pc = 0x53c69d; continue;
      case 0x53c69d:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 53c69d: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 53c6a0: mov edx, dword ptr [0xae23b4]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 53c6a6: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 53c6a9: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 53c6ac: add ecx, eax
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 53c6ae: add edx, eax
        R.eax = (((R.edx + R.ecx * 4) | 0)) | 0; // 53c6b0: lea eax, [edx + ecx*4]
        pc = 0x53c6b7; continue; // 53c6b3: jmp 0x53c6b7
      case 0x53c6b5:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53c6b5: xor eax, eax
        pc = 0x53c6b7; continue;
      case 0x53c6b7:
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 53c6b7: cmp eax, ebx
        if (R.zf) { pc = 0x53c6bf; continue; } // 53c6b9: je 0x53c6bf
        pc = 0x53c6bb; continue;
      case 0x53c6bb:
        R.m.w8(((R.esp + 0x13) | 0) >>> 0, R.incdec(R.m.u8(((R.esp + 0x13) | 0) >>> 0), 1, 8)); // 53c6bb: inc byte ptr [esp + 0x13]
        pc = 0x53c6bf; continue;
      case 0x53c6bf:
        R.edi = (R.add((R.edi >>> 0), 0x4, 32)) | 0; // 53c6bf: add edi, 4
        R.ebp = (R.incdec((R.ebp >>> 0), -1, 32)) | 0; // 53c6c2: dec ebp
        if (!R.zf) { pc = 0x53c64d; continue; } // 53c6c3: jne 0x53c64d
        pc = 0x53c6c5; continue;
      case 0x53c6c5:
        R.sub(R.m.u8(((R.esp + 0x224) | 0) >>> 0), 0x1, 8); // 53c6c5: cmp byte ptr [esp + 0x224], 1
        if (!R.zf) { pc = 0x53c6db; continue; } // 53c6cd: jne 0x53c6db
        pc = 0x53c6cf; continue;
      case 0x53c6cf:
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 53c6cf: mov eax, dword ptr [esp + 0x18]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 53c6d3: test eax, eax
        if (R.zf) { pc = 0x53c8b5; continue; } // 53c6d5: je 0x53c8b5
        pc = 0x53c6db; continue;
      case 0x53c6db:
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 53c6db: mov eax, dword ptr [esp + 0x14]
        pc = 0x53c6df; continue;
      case 0x53c6df:
        R.edi = (((R.eax + 0xd7) | 0)) | 0; // 53c6df: lea edi, [eax + 0xd7]
        R.ebp = (0x32) | 0; // 53c6e5: mov ebp, 0x32
        pc = 0x53c6ea; continue;
      case 0x53c6ea:
        R.esi = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 53c6ea: mov esi, dword ptr [edi]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 53c6ec: test esi, esi
        if (R.zf) { pc = 0x53c75b; continue; } // 53c6ee: je 0x53c75b
        pc = 0x53c6f0; continue;
      case 0x53c6f0:
        R.eax = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 53c6f0: mov eax, dword ptr [0xae2364]
        R.ecx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 53c6f5: mov ecx, dword ptr [esi]
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 53c6f7: cmp ecx, eax
        if (!R.cL) { pc = 0x53c75b; continue; } // 53c6f9: jge 0x53c75b
        pc = 0x53c6fb; continue;
      case 0x53c6fb:
        R.eax = (R.m.u32(((R.esp + 0x228) | 0) >>> 0)) | 0; // 53c6fb: mov eax, dword ptr [esp + 0x228]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 53c702: test eax, eax
        if (R.zf) { pc = 0x53c757; continue; } // 53c704: je 0x53c757
        pc = 0x53c706; continue;
      case 0x53c706:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 53c706: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 53c70c: push esi
        R.call(0x4cf6d0, { n: 1, thisEcx: false, calleeClean: true }); // 53c70d: call 0x4cf6d0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 53c712: test eax, eax
        if (R.zf) { pc = 0x53c757; continue; } // 53c714: je 0x53c757
        pc = 0x53c716; continue;
      case 0x53c716:
        R.ebx = (R.m.u32(((R.esp + 0x220) | 0) >>> 0)) | 0; // 53c716: mov ebx, dword ptr [esp + 0x220]
        R.eax = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 53c71d: mov eax, dword ptr [esi + 0x39]
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 53c720: cmp eax, ebx
        if (R.zf) { pc = 0x53c757; continue; } // 53c722: je 0x53c757
        pc = 0x53c724; continue;
      case 0x53c724:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 53c724: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 53c72a: push esi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 53c72b: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 53c730: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 53c732: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x53c751; continue; } // 53c737: je 0x53c751
        pc = 0x53c739; continue;
      case 0x53c739:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 53c739: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 53c73c: mov edx, dword ptr [0xae23b4]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 53c742: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 53c745: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 53c748: add ecx, eax
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 53c74a: add edx, eax
        R.eax = (((R.edx + R.ecx * 4) | 0)) | 0; // 53c74c: lea eax, [edx + ecx*4]
        pc = 0x53c753; continue; // 53c74f: jmp 0x53c753
      case 0x53c751:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53c751: xor eax, eax
        pc = 0x53c753; continue;
      case 0x53c753:
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 53c753: cmp eax, ebx
        if (R.zf) { pc = 0x53c75b; continue; } // 53c755: je 0x53c75b
        pc = 0x53c757; continue;
      case 0x53c757:
        R.m.w8(((R.esp + 0x13) | 0) >>> 0, R.incdec(R.m.u8(((R.esp + 0x13) | 0) >>> 0), 1, 8)); // 53c757: inc byte ptr [esp + 0x13]
        pc = 0x53c75b; continue;
      case 0x53c75b:
        R.edi = (R.add((R.edi >>> 0), 0x4, 32)) | 0; // 53c75b: add edi, 4
        R.ebp = (R.incdec((R.ebp >>> 0), -1, 32)) | 0; // 53c75e: dec ebp
        if (!R.zf) { pc = 0x53c6ea; continue; } // 53c75f: jne 0x53c6ea
        pc = 0x53c761; continue;
      case 0x53c761:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x13) | 0) >>> 0)) & 0xff) << 0)) | 0; // 53c761: mov al, byte ptr [esp + 0x13]
        R.esi = (R.pop()) | 0; // 53c765: pop esi
        R.ebp = (R.pop()) | 0; // 53c766: pop ebp
        R.ebx = (R.pop()) | 0; // 53c767: pop ebx
        R.edi = (R.pop()) | 0; // 53c768: pop edi
        R.esp = (R.add((R.esp >>> 0), 0x20c, 32)) | 0; // 53c769: add esp, 0x20c
        return R.ret(0); // 53c76f: ret 
      case 0x53c770:
        R.push((R.edi >>> 0)); // 53c770: push edi
        R.call(0x542740, { n: 1, thisEcx: false, calleeClean: false }); // 53c771: call 0x542740
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 53c776: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 53c779: test eax, eax
        if (R.zf) { pc = 0x53c832; continue; } // 53c77b: je 0x53c832
        pc = 0x53c781; continue;
      case 0x53c781:
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.esp + 0x224) | 0) >>> 0)) & 0xff) << 0)) | 0; // 53c781: mov bl, byte ptr [esp + 0x224]
        R.edi = (R.add((R.edi >>> 0), 0xd7, 32)) | 0; // 53c788: add edi, 0xd7
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, 0x32); // 53c78e: mov dword ptr [esp + 0x14], 0x32
        pc = 0x53c796; continue;
      case 0x53c796:
        R.esi = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 53c796: mov esi, dword ptr [edi]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 53c798: test esi, esi
        if (R.zf) { pc = 0x53c811; continue; } // 53c79a: je 0x53c811
        pc = 0x53c79c; continue;
      case 0x53c79c:
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 53c79c: mov eax, dword ptr [esi]
        R.ecx = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 53c79e: mov ecx, dword ptr [0xae2364]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 53c7a4: cmp eax, ecx
        if (!R.cL) { pc = 0x53c811; continue; } // 53c7a6: jge 0x53c811
        pc = 0x53c7a8; continue;
      case 0x53c7a8:
        R.logic(((R.ebx >>> 0) & 0xff) & ((R.ebx >>> 0) & 0xff), 8); // 53c7a8: test bl, bl
        if (R.zf) { pc = 0x53c7b1; continue; } // 53c7aa: je 0x53c7b1
        pc = 0x53c7ac; continue;
      case 0x53c7ac:
        R.logic(R.m.u8(((R.esi + 0x5e) | 0) >>> 0) & ((R.ebx >>> 0) & 0xff), 8); // 53c7ac: test byte ptr [esi + 0x5e], bl
        if (R.zf) { pc = 0x53c811; continue; } // 53c7af: je 0x53c811
        pc = 0x53c7b1; continue;
      case 0x53c7b1:
        R.eax = (R.m.u32(((R.esp + 0x228) | 0) >>> 0)) | 0; // 53c7b1: mov eax, dword ptr [esp + 0x228]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 53c7b8: test eax, eax
        if (R.zf) { pc = 0x53c80d; continue; } // 53c7ba: je 0x53c80d
        pc = 0x53c7bc; continue;
      case 0x53c7bc:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 53c7bc: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 53c7c2: push esi
        R.call(0x4cf6d0, { n: 1, thisEcx: false, calleeClean: true }); // 53c7c3: call 0x4cf6d0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 53c7c8: test eax, eax
        if (R.zf) { pc = 0x53c80d; continue; } // 53c7ca: je 0x53c80d
        pc = 0x53c7cc; continue;
      case 0x53c7cc:
        R.ebp = (R.m.u32(((R.esp + 0x220) | 0) >>> 0)) | 0; // 53c7cc: mov ebp, dword ptr [esp + 0x220]
        R.eax = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 53c7d3: mov eax, dword ptr [esi + 0x39]
        R.sub((R.eax >>> 0), (R.ebp >>> 0), 32); // 53c7d6: cmp eax, ebp
        if (R.zf) { pc = 0x53c80d; continue; } // 53c7d8: je 0x53c80d
        pc = 0x53c7da; continue;
      case 0x53c7da:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 53c7da: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 53c7e0: push esi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 53c7e1: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 53c7e6: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 53c7e8: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x53c807; continue; } // 53c7ed: je 0x53c807
        pc = 0x53c7ef; continue;
      case 0x53c7ef:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 53c7ef: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 53c7f2: mov edx, dword ptr [0xae23b4]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 53c7f8: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 53c7fb: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 53c7fe: add ecx, eax
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 53c800: add edx, eax
        R.eax = (((R.edx + R.ecx * 4) | 0)) | 0; // 53c802: lea eax, [edx + ecx*4]
        pc = 0x53c809; continue; // 53c805: jmp 0x53c809
      case 0x53c807:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53c807: xor eax, eax
        pc = 0x53c809; continue;
      case 0x53c809:
        R.sub((R.eax >>> 0), (R.ebp >>> 0), 32); // 53c809: cmp eax, ebp
        if (R.zf) { pc = 0x53c811; continue; } // 53c80b: je 0x53c811
        pc = 0x53c80d; continue;
      case 0x53c80d:
        R.m.w8(((R.esp + 0x13) | 0) >>> 0, R.incdec(R.m.u8(((R.esp + 0x13) | 0) >>> 0), 1, 8)); // 53c80d: inc byte ptr [esp + 0x13]
        pc = 0x53c811; continue;
      case 0x53c811:
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 53c811: mov eax, dword ptr [esp + 0x14]
        R.edi = (R.add((R.edi >>> 0), 0x4, 32)) | 0; // 53c815: add edi, 4
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 53c818: dec eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.eax >>> 0)); // 53c819: mov dword ptr [esp + 0x14], eax
        if (!R.zf) { pc = 0x53c796; continue; } // 53c81d: jne 0x53c796
        pc = 0x53c823; continue;
      case 0x53c823:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x13) | 0) >>> 0)) & 0xff) << 0)) | 0; // 53c823: mov al, byte ptr [esp + 0x13]
        R.esi = (R.pop()) | 0; // 53c827: pop esi
        R.ebp = (R.pop()) | 0; // 53c828: pop ebp
        R.ebx = (R.pop()) | 0; // 53c829: pop ebx
        R.edi = (R.pop()) | 0; // 53c82a: pop edi
        R.esp = (R.add((R.esp >>> 0), 0x20c, 32)) | 0; // 53c82b: add esp, 0x20c
        return R.ret(0); // 53c831: ret 
      case 0x53c832:
        R.edi = (R.add((R.edi >>> 0), 0xd7, 32)) | 0; // 53c832: add edi, 0xd7
        R.ebp = (0x32) | 0; // 53c838: mov ebp, 0x32
        pc = 0x53c83d; continue;
      case 0x53c83d:
        R.esi = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 53c83d: mov esi, dword ptr [edi]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 53c83f: test esi, esi
        if (R.zf) { pc = 0x53c8af; continue; } // 53c841: je 0x53c8af
        pc = 0x53c843; continue;
      case 0x53c843:
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 53c843: mov eax, dword ptr [esi]
        R.ecx = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 53c845: mov ecx, dword ptr [0xae2364]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 53c84b: cmp eax, ecx
        if (!R.cL) { pc = 0x53c8af; continue; } // 53c84d: jge 0x53c8af
        pc = 0x53c84f; continue;
      case 0x53c84f:
        R.eax = (R.m.u32(((R.esp + 0x228) | 0) >>> 0)) | 0; // 53c84f: mov eax, dword ptr [esp + 0x228]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 53c856: test eax, eax
        if (R.zf) { pc = 0x53c8ab; continue; } // 53c858: je 0x53c8ab
        pc = 0x53c85a; continue;
      case 0x53c85a:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 53c85a: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 53c860: push esi
        R.call(0x4cf6d0, { n: 1, thisEcx: false, calleeClean: true }); // 53c861: call 0x4cf6d0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 53c866: test eax, eax
        if (R.zf) { pc = 0x53c8ab; continue; } // 53c868: je 0x53c8ab
        pc = 0x53c86a; continue;
      case 0x53c86a:
        R.ebx = (R.m.u32(((R.esp + 0x220) | 0) >>> 0)) | 0; // 53c86a: mov ebx, dword ptr [esp + 0x220]
        R.eax = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 53c871: mov eax, dword ptr [esi + 0x39]
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 53c874: cmp eax, ebx
        if (R.zf) { pc = 0x53c8ab; continue; } // 53c876: je 0x53c8ab
        pc = 0x53c878; continue;
      case 0x53c878:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 53c878: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 53c87e: push esi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 53c87f: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 53c884: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 53c886: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x53c8a5; continue; } // 53c88b: je 0x53c8a5
        pc = 0x53c88d; continue;
      case 0x53c88d:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 53c88d: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 53c890: mov edx, dword ptr [0xae23b4]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 53c896: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 53c899: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 53c89c: add ecx, eax
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 53c89e: add edx, eax
        R.eax = (((R.edx + R.ecx * 4) | 0)) | 0; // 53c8a0: lea eax, [edx + ecx*4]
        pc = 0x53c8a7; continue; // 53c8a3: jmp 0x53c8a7
      case 0x53c8a5:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53c8a5: xor eax, eax
        pc = 0x53c8a7; continue;
      case 0x53c8a7:
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 53c8a7: cmp eax, ebx
        if (R.zf) { pc = 0x53c8af; continue; } // 53c8a9: je 0x53c8af
        pc = 0x53c8ab; continue;
      case 0x53c8ab:
        R.m.w8(((R.esp + 0x13) | 0) >>> 0, R.incdec(R.m.u8(((R.esp + 0x13) | 0) >>> 0), 1, 8)); // 53c8ab: inc byte ptr [esp + 0x13]
        pc = 0x53c8af; continue;
      case 0x53c8af:
        R.edi = (R.add((R.edi >>> 0), 0x4, 32)) | 0; // 53c8af: add edi, 4
        R.ebp = (R.incdec((R.ebp >>> 0), -1, 32)) | 0; // 53c8b2: dec ebp
        if (!R.zf) { pc = 0x53c83d; continue; } // 53c8b3: jne 0x53c83d
        pc = 0x53c8b5; continue;
      case 0x53c8b5:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x13) | 0) >>> 0)) & 0xff) << 0)) | 0; // 53c8b5: mov al, byte ptr [esp + 0x13]
        R.esi = (R.pop()) | 0; // 53c8b9: pop esi
        R.ebp = (R.pop()) | 0; // 53c8ba: pop ebp
        R.ebx = (R.pop()) | 0; // 53c8bb: pop ebx
        R.edi = (R.pop()) | 0; // 53c8bc: pop edi
        R.esp = (R.add((R.esp >>> 0), 0x20c, 32)) | 0; // 53c8bd: add esp, 0x20c
        return R.ret(0); // 53c8c3: ret 
      default: throw new Error(`f_53c590: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
