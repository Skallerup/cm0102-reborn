// 0x8423f0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 5a8f60=0, 5cc7d0=0, 5e8290=9, 600a50=13, 90d130=0, 944c9f=0, 944cff=5t, 944e46=1, 945333=0, 945667=2t, 946464=5
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x8423f0, 0x842406, 0x842419, 0x842486, 0x84248d, 0x842496, 0x8424aa, 0x842517, 0x84251e, 0x842532, 0x84253c, 0x842544, 0x84254c, 0x84256d, 0x84257b, 0x842594, 0x842601, 0x842605, 0x842613, 0x84262e, 0x84269b, 0x84269f, 0x84270e, 0x842733]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 5, 6, 6]);
function f_8423f0_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 8423f0
        R.esp = (R.sub((R.esp >>> 0), 0x208, 32)) | 0; // 8423f0: sub esp, 0x208
        R.push((R.ebx >>> 0)); // 8423f6: push ebx
        R.push((R.ebp >>> 0)); // 8423f7: push ebp
        R.push((R.esi >>> 0)); // 8423f8: push esi
        R.esi = ((R.ecx >>> 0)) | 0; // 8423f9: mov esi, ecx
        R.ebp = (R.logic((R.ebp >>> 0) ^ (R.ebp >>> 0), 32)) | 0; // 8423fb: xor ebp, ebp
        R.push((R.edi >>> 0)); // 8423fd: push edi
        R.sub(R.m.u32(((R.esi) | 0) >>> 0), (R.ebp >>> 0), 32); // 8423fe: cmp dword ptr [esi], ebp
        if (!R.zf) { pc = 4; continue; } // 842400: jne 0x84248d
        pc = 1; continue;
      case 1: // 842406
        R.push(0x320); // 842406: push 0x320
        R.call(0x944e46, { n: 1, thisEcx: false, calleeClean: false }); // 84240b: call 0x944e46
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 842410: add esp, 4
        R.sub((R.eax >>> 0), (R.ebp >>> 0), 32); // 842413: cmp eax, ebp
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 842415: mov dword ptr [esi], eax
        if (!R.zf) { pc = 3; continue; } // 842417: jne 0x842486
        pc = 2; continue;
      case 2: // 842419
        R.eax = (((R.esp + 0x18) | 0)) | 0; // 842419: lea eax, [esp + 0x18]
        R.ecx = (((R.esp + 0x118) | 0)) | 0; // 84241d: lea ecx, [esp + 0x118]
        R.push((R.eax >>> 0)); // 842424: push eax
        R.push((R.ecx >>> 0)); // 842425: push ecx
        R.push((R.ebp >>> 0)); // 842426: push ebp
        R.push((R.ebp >>> 0)); // 842427: push ebp
        R.push(0xa825a4); // 842428: push 0xa825a4
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 84242d: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 842432: add esp, 0x14
        R.edx = (((R.esp + 0x18) | 0)) | 0; // 842435: lea edx, [esp + 0x18]
        R.eax = (((R.esp + 0x118) | 0)) | 0; // 842439: lea eax, [esp + 0x118]
        R.push(0x1594); // 842440: push 0x1594
        R.push((R.edx >>> 0)); // 842445: push edx
        R.push((R.eax >>> 0)); // 842446: push eax
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 842447: call 0x90d130
        R.push((R.eax >>> 0)); // 84244c: push eax
        R.push(0x9870e8); // 84244d: push 0x9870e8
        R.push(0xae24d0); // 842452: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 842457: call 0x944c9f
        R.push((R.ebp >>> 0)); // 84245c: push ebp
        R.push(0xae24d0); // 84245d: push 0xae24d0
        R.push(0x9870e0); // 842462: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 842467: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 84246c: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, (R.ebp >>> 0)); // 84246f: mov dword ptr [0xb67a34], ebp
        R.call(0x5cc7d0, { n: 0, thisEcx: false, calleeClean: false }); // 842475: call 0x5cc7d0
        R.call(0x5a8f60, { n: 0, thisEcx: false, calleeClean: false }); // 84247a: call 0x5a8f60
        R.push(0xffffffff); // 84247f: push -1
        throw new Error('C++-undtagelse (0x945934)'); // 842481: call 0x945934
        pc = 3; continue;
      case 3: // 842486
        R.m.w32(((R.esi + 0x8) | 0) >>> 0, 0x64); // 842486: mov dword ptr [esi + 8], 0x64
        pc = 4; continue;
      case 4: // 84248d
        R.sub(R.m.u32(((R.esi + 0x4) | 0) >>> 0), (R.ebp >>> 0), 32); // 84248d: cmp dword ptr [esi + 4], ebp
        if (!R.zf) { pc = 8; continue; } // 842490: jne 0x84251e
        pc = 5; continue;
      default: return pc;
    }
  }
}
function f_8423f0_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 5: // 842496
        R.push(0x320); // 842496: push 0x320
        R.call(0x944e46, { n: 1, thisEcx: false, calleeClean: false }); // 84249b: call 0x944e46
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 8424a0: add esp, 4
        R.sub((R.eax >>> 0), (R.ebp >>> 0), 32); // 8424a3: cmp eax, ebp
        R.m.w32(((R.esi + 0x4) | 0) >>> 0, (R.eax >>> 0)); // 8424a5: mov dword ptr [esi + 4], eax
        if (!R.zf) { pc = 7; continue; } // 8424a8: jne 0x842517
        pc = 6; continue;
      case 6: // 8424aa
        R.ecx = (((R.esp + 0x118) | 0)) | 0; // 8424aa: lea ecx, [esp + 0x118]
        R.edx = (((R.esp + 0x18) | 0)) | 0; // 8424b1: lea edx, [esp + 0x18]
        R.push((R.ecx >>> 0)); // 8424b5: push ecx
        R.push((R.edx >>> 0)); // 8424b6: push edx
        R.push((R.ebp >>> 0)); // 8424b7: push ebp
        R.push((R.ebp >>> 0)); // 8424b8: push ebp
        R.push(0xa825a4); // 8424b9: push 0xa825a4
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 8424be: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8424c3: add esp, 0x14
        R.eax = (((R.esp + 0x118) | 0)) | 0; // 8424c6: lea eax, [esp + 0x118]
        R.ecx = (((R.esp + 0x18) | 0)) | 0; // 8424cd: lea ecx, [esp + 0x18]
        R.push(0x159d); // 8424d1: push 0x159d
        R.push((R.eax >>> 0)); // 8424d6: push eax
        R.push((R.ecx >>> 0)); // 8424d7: push ecx
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 8424d8: call 0x90d130
        R.push((R.eax >>> 0)); // 8424dd: push eax
        R.push(0x9870e8); // 8424de: push 0x9870e8
        R.push(0xae24d0); // 8424e3: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 8424e8: call 0x944c9f
        R.push((R.ebp >>> 0)); // 8424ed: push ebp
        R.push(0xae24d0); // 8424ee: push 0xae24d0
        R.push(0x9870e0); // 8424f3: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 8424f8: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 8424fd: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, (R.ebp >>> 0)); // 842500: mov dword ptr [0xb67a34], ebp
        R.call(0x5cc7d0, { n: 0, thisEcx: false, calleeClean: false }); // 842506: call 0x5cc7d0
        R.call(0x5a8f60, { n: 0, thisEcx: false, calleeClean: false }); // 84250b: call 0x5a8f60
        R.push(0xffffffff); // 842510: push -1
        throw new Error('C++-undtagelse (0x945934)'); // 842512: call 0x945934
        pc = 7; continue;
      case 7: // 842517
        R.m.w32(((R.esi + 0xc) | 0) >>> 0, 0x64); // 842517: mov dword ptr [esi + 0xc], 0x64
        pc = 8; continue;
      case 8: // 84251e
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 84251e: mov eax, dword ptr [esi]
        R.edi = (R.m.u32(((R.esp + 0x220) | 0) >>> 0)) | 0; // 842520: mov edi, dword ptr [esp + 0x220]
        R.ebx = (R.m.u32(((R.esp + 0x21c) | 0) >>> 0)) | 0; // 842527: mov ebx, dword ptr [esp + 0x21c]
        R.sub((R.eax >>> 0), (R.ebp >>> 0), 32); // 84252e: cmp eax, ebp
        if (R.zf) { pc = 13; continue; } // 842530: je 0x84256d
        pc = 9; continue;
      case 9: // 842532
        R.edx = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 842532: mov edx, dword ptr [ebx]
        R.sub((R.edi >>> 0), (R.ebp >>> 0), 32); // 842534: cmp edi, ebp
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edx >>> 0)); // 842536: mov dword ptr [esp + 0x10], edx
        if (R.zf) { pc = 11; continue; } // 84253a: je 0x842544
        pc = 10; continue;
      case 10: // 84253c
        R.ecx = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 84253c: mov ecx, dword ptr [edi]
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.ecx >>> 0)); // 84253e: mov dword ptr [esp + 0x14], ecx
        pc = 12; continue; // 842542: jmp 0x84254c
      default: return pc;
    }
  }
}
function f_8423f0_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 11: // 842544
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, 0xffffffff); // 842544: mov dword ptr [esp + 0x14], 0xffffffff
        pc = 12; continue;
      case 12: // 84254c
        R.edx = (R.m.u32(((R.esi + 0x10) | 0) >>> 0)) | 0; // 84254c: mov edx, dword ptr [esi + 0x10]
        R.push(0x757ea0); // 84254f: push 0x757ea0
        R.push(0x8); // 842554: push 8
        R.push((R.edx >>> 0)); // 842556: push edx
        R.push((R.eax >>> 0)); // 842557: push eax
        R.eax = (((R.esp + 0x20) | 0)) | 0; // 842558: lea eax, [esp + 0x20]
        R.push((R.eax >>> 0)); // 84255c: push eax
        R.call(0x946464, { n: 5, thisEcx: false, calleeClean: false }); // 84255d: call 0x946464
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 842562: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 842565: test eax, eax
        if (!R.zf) { pc = 23; continue; } // 842567: jne 0x842733
        pc = 13; continue;
      case 13: // 84256d
        R.eax = (R.m.u32(((R.esi + 0x8) | 0) >>> 0)) | 0; // 84256d: mov eax, dword ptr [esi + 8]
        R.ecx = (R.m.u32(((R.esi + 0x10) | 0) >>> 0)) | 0; // 842570: mov ecx, dword ptr [esi + 0x10]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 842573: cmp eax, ecx
        if (!R.zf) { pc = 17; continue; } // 842575: jne 0x842605
        pc = 14; continue;
      case 14: // 84257b
        R.edx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 84257b: mov edx, dword ptr [esi]
        R.ecx = (((R.eax * 8 + 0x320) | 0)) | 0; // 84257d: lea ecx, [eax*8 + 0x320]
        R.push((R.ecx >>> 0)); // 842584: push ecx
        R.push((R.edx >>> 0)); // 842585: push edx
        R.call(0x945667, { n: 2, thisEcx: true, calleeClean: false }); // 842586: call 0x945667
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 84258b: add esp, 8
        R.sub((R.eax >>> 0), (R.ebp >>> 0), 32); // 84258e: cmp eax, ebp
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 842590: mov dword ptr [esi], eax
        if (!R.zf) { pc = 16; continue; } // 842592: jne 0x842601
        pc = 15; continue;
      default: return pc;
    }
  }
}
function f_8423f0_3(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 15: // 842594
        R.eax = (((R.esp + 0x118) | 0)) | 0; // 842594: lea eax, [esp + 0x118]
        R.ecx = (((R.esp + 0x18) | 0)) | 0; // 84259b: lea ecx, [esp + 0x18]
        R.push((R.eax >>> 0)); // 84259f: push eax
        R.push((R.ecx >>> 0)); // 8425a0: push ecx
        R.push((R.ebp >>> 0)); // 8425a1: push ebp
        R.push((R.ebp >>> 0)); // 8425a2: push ebp
        R.push(0xa825a4); // 8425a3: push 0xa825a4
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 8425a8: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8425ad: add esp, 0x14
        R.edx = (((R.esp + 0x118) | 0)) | 0; // 8425b0: lea edx, [esp + 0x118]
        R.eax = (((R.esp + 0x18) | 0)) | 0; // 8425b7: lea eax, [esp + 0x18]
        R.push(0x15b5); // 8425bb: push 0x15b5
        R.push((R.edx >>> 0)); // 8425c0: push edx
        R.push((R.eax >>> 0)); // 8425c1: push eax
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 8425c2: call 0x90d130
        R.push((R.eax >>> 0)); // 8425c7: push eax
        R.push(0x9870e8); // 8425c8: push 0x9870e8
        R.push(0xae24d0); // 8425cd: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 8425d2: call 0x944c9f
        R.push((R.ebp >>> 0)); // 8425d7: push ebp
        R.push(0xae24d0); // 8425d8: push 0xae24d0
        R.push(0x9870e0); // 8425dd: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 8425e2: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 8425e7: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, (R.ebp >>> 0)); // 8425ea: mov dword ptr [0xb67a34], ebp
        R.call(0x5cc7d0, { n: 0, thisEcx: false, calleeClean: false }); // 8425f0: call 0x5cc7d0
        R.call(0x5a8f60, { n: 0, thisEcx: false, calleeClean: false }); // 8425f5: call 0x5a8f60
        R.push(0xffffffff); // 8425fa: push -1
        throw new Error('C++-undtagelse (0x945934)'); // 8425fc: call 0x945934
        pc = 16; continue;
      case 16: // 842601
        R.m.w32(((R.esi + 0x8) | 0) >>> 0, R.add(R.m.u32(((R.esi + 0x8) | 0) >>> 0), 0x64, 32)); // 842601: add dword ptr [esi + 8], 0x64
        pc = 17; continue;
      case 17: // 842605
        R.eax = (R.m.u32(((R.esi + 0xc) | 0) >>> 0)) | 0; // 842605: mov eax, dword ptr [esi + 0xc]
        R.ecx = (R.m.u32(((R.esi + 0x14) | 0) >>> 0)) | 0; // 842608: mov ecx, dword ptr [esi + 0x14]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 84260b: cmp eax, ecx
        if (!R.zf) { pc = 21; continue; } // 84260d: jne 0x84269f
        pc = 18; continue;
      case 18: // 842613
        R.edx = (R.m.u32(((R.esi + 0x4) | 0) >>> 0)) | 0; // 842613: mov edx, dword ptr [esi + 4]
        R.ecx = (((R.eax * 8 + 0x320) | 0)) | 0; // 842616: lea ecx, [eax*8 + 0x320]
        R.push((R.ecx >>> 0)); // 84261d: push ecx
        R.push((R.edx >>> 0)); // 84261e: push edx
        R.call(0x945667, { n: 2, thisEcx: true, calleeClean: false }); // 84261f: call 0x945667
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 842624: add esp, 8
        R.sub((R.eax >>> 0), (R.ebp >>> 0), 32); // 842627: cmp eax, ebp
        R.m.w32(((R.esi + 0x4) | 0) >>> 0, (R.eax >>> 0)); // 842629: mov dword ptr [esi + 4], eax
        if (!R.zf) { pc = 20; continue; } // 84262c: jne 0x84269b
        pc = 19; continue;
      default: return pc;
    }
  }
}
function f_8423f0_4(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 19: // 84262e
        R.eax = (((R.esp + 0x118) | 0)) | 0; // 84262e: lea eax, [esp + 0x118]
        R.ecx = (((R.esp + 0x18) | 0)) | 0; // 842635: lea ecx, [esp + 0x18]
        R.push((R.eax >>> 0)); // 842639: push eax
        R.push((R.ecx >>> 0)); // 84263a: push ecx
        R.push((R.ebp >>> 0)); // 84263b: push ebp
        R.push((R.ebp >>> 0)); // 84263c: push ebp
        R.push(0xa825a4); // 84263d: push 0xa825a4
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 842642: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 842647: add esp, 0x14
        R.edx = (((R.esp + 0x118) | 0)) | 0; // 84264a: lea edx, [esp + 0x118]
        R.eax = (((R.esp + 0x18) | 0)) | 0; // 842651: lea eax, [esp + 0x18]
        R.push(0x15be); // 842655: push 0x15be
        R.push((R.edx >>> 0)); // 84265a: push edx
        R.push((R.eax >>> 0)); // 84265b: push eax
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 84265c: call 0x90d130
        R.push((R.eax >>> 0)); // 842661: push eax
        R.push(0x9870e8); // 842662: push 0x9870e8
        R.push(0xae24d0); // 842667: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 84266c: call 0x944c9f
        R.push((R.ebp >>> 0)); // 842671: push ebp
        R.push(0xae24d0); // 842672: push 0xae24d0
        R.push(0x9870e0); // 842677: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 84267c: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 842681: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, (R.ebp >>> 0)); // 842684: mov dword ptr [0xb67a34], ebp
        R.call(0x5cc7d0, { n: 0, thisEcx: false, calleeClean: false }); // 84268a: call 0x5cc7d0
        R.call(0x5a8f60, { n: 0, thisEcx: false, calleeClean: false }); // 84268f: call 0x5a8f60
        R.push(0xffffffff); // 842694: push -1
        throw new Error('C++-undtagelse (0x945934)'); // 842696: call 0x945934
        pc = 20; continue;
      case 20: // 84269b
        R.m.w32(((R.esi + 0xc) | 0) >>> 0, R.add(R.m.u32(((R.esi + 0xc) | 0) >>> 0), 0x64, 32)); // 84269b: add dword ptr [esi + 0xc], 0x64
        pc = 21; continue;
      default: return pc;
    }
  }
}
function f_8423f0_5(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 21: // 84269f
        R.ecx = (R.m.u32(((R.esi + 0x10) | 0) >>> 0)) | 0; // 84269f: mov ecx, dword ptr [esi + 0x10]
        R.edx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8426a2: mov edx, dword ptr [esi]
        R.eax = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 8426a4: mov eax, dword ptr [ebx]
        R.push(0x757ea0); // 8426a6: push 0x757ea0
        R.m.w32(((R.edx + R.ecx * 8) | 0) >>> 0, (R.eax >>> 0)); // 8426ab: mov dword ptr [edx + ecx*8], eax
        R.ecx = (R.m.u32(((R.esi + 0x10) | 0) >>> 0)) | 0; // 8426ae: mov ecx, dword ptr [esi + 0x10]
        R.edx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8426b1: mov edx, dword ptr [esi]
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 8426b3: mov eax, dword ptr [edi]
        R.push(0x8); // 8426b5: push 8
        R.m.w32(((R.edx + R.ecx * 8 + 0x4) | 0) >>> 0, (R.eax >>> 0)); // 8426b7: mov dword ptr [edx + ecx*8 + 4], eax
        R.edx = (R.m.u32(((R.esi + 0x10) | 0) >>> 0)) | 0; // 8426bb: mov edx, dword ptr [esi + 0x10]
        R.ecx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8426be: mov ecx, dword ptr [esi]
        R.edx = (R.incdec((R.edx >>> 0), 1, 32)) | 0; // 8426c0: inc edx
        R.eax = ((R.edx >>> 0)) | 0; // 8426c1: mov eax, edx
        R.m.w32(((R.esi + 0x10) | 0) >>> 0, (R.edx >>> 0)); // 8426c3: mov dword ptr [esi + 0x10], edx
        R.push((R.eax >>> 0)); // 8426c6: push eax
        R.push((R.ecx >>> 0)); // 8426c7: push ecx
        R.call(0x945333, { n: 0, thisEcx: false, calleeClean: false }); // 8426c8: call 0x945333
        R.edx = (R.m.u32(((R.esi + 0x14) | 0) >>> 0)) | 0; // 8426cd: mov edx, dword ptr [esi + 0x14]
        R.eax = (R.m.u32(((R.esi + 0x4) | 0) >>> 0)) | 0; // 8426d0: mov eax, dword ptr [esi + 4]
        R.ecx = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 8426d3: mov ecx, dword ptr [ebx]
        R.push(0x844740); // 8426d5: push 0x844740
        R.m.w32(((R.eax + R.edx * 8) | 0) >>> 0, (R.ecx >>> 0)); // 8426da: mov dword ptr [eax + edx*8], ecx
        R.edx = (R.m.u32(((R.esi + 0x14) | 0) >>> 0)) | 0; // 8426dd: mov edx, dword ptr [esi + 0x14]
        R.eax = (R.m.u32(((R.esi + 0x4) | 0) >>> 0)) | 0; // 8426e0: mov eax, dword ptr [esi + 4]
        R.ecx = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 8426e3: mov ecx, dword ptr [edi]
        R.push(0x8); // 8426e5: push 8
        R.m.w32(((R.eax + R.edx * 8 + 0x4) | 0) >>> 0, (R.ecx >>> 0)); // 8426e7: mov dword ptr [eax + edx*8 + 4], ecx
        R.eax = (R.m.u32(((R.esi + 0x14) | 0) >>> 0)) | 0; // 8426eb: mov eax, dword ptr [esi + 0x14]
        R.edx = (R.m.u32(((R.esi + 0x4) | 0) >>> 0)) | 0; // 8426ee: mov edx, dword ptr [esi + 4]
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 8426f1: inc eax
        R.push((R.eax >>> 0)); // 8426f2: push eax
        R.push((R.edx >>> 0)); // 8426f3: push edx
        R.m.w32(((R.esi + 0x14) | 0) >>> 0, (R.eax >>> 0)); // 8426f4: mov dword ptr [esi + 0x14], eax
        R.call(0x945333, { n: 0, thisEcx: false, calleeClean: false }); // 8426f7: call 0x945333
        R.push((R.ebp >>> 0)); // 8426fc: push ebp
        R.push((R.ebp >>> 0)); // 8426fd: push ebp
        R.push(0x1); // 8426fe: push 1
        R.push((R.ebp >>> 0)); // 842700: push ebp
        R.push((R.edi >>> 0)); // 842701: push edi
        R.call(0x600a50, { n: 13, thisEcx: false, calleeClean: false }); // 842702: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x34, 32)) | 0; // 842707: add esp, 0x34
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84270a: test eax, eax
        if (!R.zf) { pc = 23; continue; } // 84270c: jne 0x842733
        pc = 22; continue;
      default: return pc;
    }
  }
}
function f_8423f0_6(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 22: // 84270e
        R.eax = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 84270e: mov eax, dword ptr [ebx]
        R.edx = (R.m.u32(((0xae2d0c) | 0) >>> 0)) | 0; // 842710: mov edx, dword ptr [0xae2d0c]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 842716: lea ecx, [eax + eax*4]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 842719: shl ecx, 4
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 84271c: sub ecx, eax
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + R.edx + 0xb) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84271e: mov al, byte ptr [ecx + edx + 0xb]
        R.ecx = (((R.ecx + R.edx + 0xb) | 0)) | 0; // 842722: lea ecx, [ecx + edx + 0xb]
        R.edx = ((R.edx & 0xffffff00) | (((((R.eax >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 842726: mov dl, al
        R.edx = ((R.edx & 0xffffff00) | (((R.incdec(((R.edx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 842728: inc dl
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 84272a: xor dl, al
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) & 0xf, 8)) & 0xff) << 0)) | 0; // 84272c: and dl, 0xf
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 84272f: xor dl, al
        R.m.w8(((R.ecx) | 0) >>> 0, ((R.edx >>> 0) & 0xff)); // 842731: mov byte ptr [ecx], dl
        pc = 23; continue;
      case 23: // 842733
        R.edi = (R.pop()) | 0; // 842733: pop edi
        R.esi = (R.pop()) | 0; // 842734: pop esi
        R.ebp = (R.pop()) | 0; // 842735: pop ebp
        R.ebx = (R.pop()) | 0; // 842736: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x208, 32)) | 0; // 842737: add esp, 0x208
        R.rv = R.ret(2); return -1; // 84273d: ret 8
      default: return pc;
    }
  }
}
export function f_8423f0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 24) throw new Error(`f_8423f0: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_8423f0_0(R, pc); break;
      case 1: np = f_8423f0_1(R, pc); break;
      case 2: np = f_8423f0_2(R, pc); break;
      case 3: np = f_8423f0_3(R, pc); break;
      case 4: np = f_8423f0_4(R, pc); break;
      case 5: np = f_8423f0_5(R, pc); break;
      case 6: np = f_8423f0_6(R, pc); break;
      default: throw new Error(`f_8423f0: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_8423f0: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_8423f0.shared = true;
