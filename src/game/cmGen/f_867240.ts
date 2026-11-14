// 0x867240 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4cf5a0=1c, 4d9460=2c, 549d60=2, 866f60=0t, 867240=1tc, 8c5450=2tc
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_867240(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x867240;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x867240:
        R.push((R.esi >>> 0)); // 867240: push esi
        R.esi = ((R.ecx >>> 0)) | 0; // 867241: mov esi, ecx
        R.push((R.edi >>> 0)); // 867243: push edi
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 867244: mov eax, dword ptr [esi]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 867246: lea ecx, [eax + eax*4]
        R.eax = (((R.eax + R.ecx * 2) | 0)) | 0; // 867249: lea eax, [eax + ecx*2]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 86724c: lea edx, [eax + eax*4]
        R.eax = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 86724f: mov eax, dword ptr [0xae23bc]
        R.ecx = (((R.eax + R.edx * 2) | 0)) | 0; // 867254: lea ecx, [eax + edx*2]
        R.push((R.ecx >>> 0)); // 867257: push ecx
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 867258: mov ecx, dword ptr [0xae1050]
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 86725e: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 867263: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 867265: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x86728f; continue; } // 86726a: je 0x86728f
        pc = 0x86726c; continue;
      case 0x86726c:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x35) | 0) >>> 0)) & 0xff) << 0)) | 0; // 86726c: mov dl, byte ptr [eax + 0x35]
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) & 0x3f, 8)) & 0xff) << 0)) | 0; // 86726f: and dl, 0x3f
        R.sub(((R.edx >>> 0) & 0xff), 0x5, 8); // 867272: cmp dl, 5
        if (R.zf) { pc = 0x86728f; continue; } // 867275: je 0x86728f
        pc = 0x867277; continue;
      case 0x867277:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 867277: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 86727a: mov edx, dword ptr [0xae23b4]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 867280: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 867283: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 867286: add ecx, eax
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 867288: add edx, eax
        R.ecx = (((R.edx + R.ecx * 4) | 0)) | 0; // 86728a: lea ecx, [edx + ecx*4]
        pc = 0x867291; continue; // 86728d: jmp 0x867291
      case 0x86728f:
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 86728f: xor ecx, ecx
        pc = 0x867291; continue;
      case 0x867291:
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 867291: mov eax, dword ptr [esi]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 867293: test ecx, ecx
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 867295: lea edx, [eax + eax*4]
        R.eax = (((R.eax + R.edx * 2) | 0)) | 0; // 867298: lea eax, [eax + edx*2]
        R.edx = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 86729b: mov edx, dword ptr [0xae23bc]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 8672a1: lea eax, [eax + eax*4]
        R.edi = (((R.edx + R.eax * 2) | 0)) | 0; // 8672a4: lea edi, [edx + eax*2]
        if (R.zf) { pc = 0x8674d2; continue; } // 8672a7: je 0x8674d2
        pc = 0x8672ad; continue;
      case 0x8672ad:
        R.eax = (R.m.u32(((R.edi + 0x61) | 0) >>> 0)) | 0; // 8672ad: mov eax, dword ptr [edi + 0x61]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8672b0: test eax, eax
        if (R.zf) { pc = 0x8674d2; continue; } // 8672b2: je 0x8674d2
        pc = 0x8672b8; continue;
      case 0x8672b8:
        R.eax = (R.m.u32(((R.esi + 0x4) | 0) >>> 0)) | 0; // 8672b8: mov eax, dword ptr [esi + 4]
        R.edx = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 8672bb: mov edx, dword ptr [ecx]
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 8672bd: cmp eax, edx
        if (!R.zf) { pc = 0x8674d2; continue; } // 8672bf: jne 0x8674d2
        pc = 0x8672c5; continue;
      case 0x8672c5:
        R.logic(R.m.u8(((R.esi + 0x4e) | 0) >>> 0) & 0x8, 8); // 8672c5: test byte ptr [esi + 0x4e], 8
        if (R.zf) { pc = 0x8674d2; continue; } // 8672c9: je 0x8674d2
        pc = 0x8672cf; continue;
      case 0x8672cf:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x49) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8672cf: mov al, byte ptr [esi + 0x49]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 8672d2: test al, al
        if (!R.zf) { pc = 0x8674d2; continue; } // 8672d4: jne 0x8674d2
        pc = 0x8672da; continue;
      case 0x8672da:
        R.ecx = ((R.esi >>> 0)) | 0; // 8672da: mov ecx, esi
        R.call(0x866f60, { n: 0, thisEcx: true, calleeClean: false }); // 8672dc: call 0x866f60
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8672e1: test eax, eax
        if (!R.zf) { pc = 0x8674d2; continue; } // 8672e3: jne 0x8674d2
        pc = 0x8672e9; continue;
      case 0x8672e9:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esi + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8672e9: mov cl, byte ptr [esi + 0x4f]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 8672ec: and cl, 0xf0
        R.sub(((R.ecx >>> 0) & 0xff), 0x70, 8); // 8672ef: cmp cl, 0x70
        if (R.zf) { pc = 0x8674d2; continue; } // 8672f2: je 0x8674d2
        pc = 0x8672f8; continue;
      case 0x8672f8:
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 8672f8: mov ecx, dword ptr [0xde1f54]
        R.push((R.eax >>> 0)); // 8672fe: push eax
        R.push((R.edi >>> 0)); // 8672ff: push edi
        R.call(0x8c5450, { n: 2, thisEcx: true, calleeClean: true }); // 867300: call 0x8c5450
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 867305: test eax, eax
        if (!R.zf) { pc = 0x8674d2; continue; } // 867307: jne 0x8674d2
        pc = 0x86730d; continue;
      case 0x86730d:
        R.edx = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 86730d: mov edx, dword ptr [esp + 0xc]
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 867311: mov ecx, dword ptr [0xae1050]
        R.push((R.edx >>> 0)); // 867317: push edx
        R.push((R.esi >>> 0)); // 867318: push esi
        R.call(0x4d9460, { n: 2, thisEcx: false, calleeClean: true }); // 867319: call 0x4d9460
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x4e) | 0) >>> 0)) & 0xff) << 0)) | 0; // 86731e: mov al, byte ptr [esi + 0x4e]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf7, 8)) & 0xff) << 0)) | 0; // 867321: and al, 0xf7
        R.m.w8(((R.esi + 0x4e) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 867323: mov byte ptr [esi + 0x4e], al
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edi + 0x5b) | 0) >>> 0)) & 0xff) << 0)) | 0; // 867326: mov al, byte ptr [edi + 0x5b]
        R.eax = ((R.eax & 0xffffff00) | (((R.add(((R.eax >>> 0) & 0xff), R.m.u8(((R.edi + 0x59) | 0) >>> 0), 8)) & 0xff) << 0)) | 0; // 867329: add al, byte ptr [edi + 0x59]
        R.eax = ((R.eax & 0xffffff00) | (((R.add(((R.eax >>> 0) & 0xff), 0x5, 8)) & 0xff) << 0)) | 0; // 86732c: add al, 5
        R.m.w8(((R.esi + 0x44) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 86732e: mov byte ptr [esi + 0x44], al
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x3e) | 0) >>> 0)) & 0xff) << 0)) | 0; // 867331: mov al, byte ptr [esi + 0x3e]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 867334: test al, al
        if (R.cBE) { pc = 0x86733c; continue; } // 867336: jbe 0x86733c
        pc = 0x867338; continue;
      case 0x867338:
        R.m.w8(((R.esi + 0x3e) | 0) >>> 0, 0x0); // 867338: mov byte ptr [esi + 0x3e], 0
        pc = 0x86733c; continue;
      case 0x86733c:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esi + 0x3d) | 0) >>> 0)) & 0xff) << 0)) | 0; // 86733c: mov cl, byte ptr [esi + 0x3d]
        R.eax = ((R.eax & 0xffffff00) | (((0xf) & 0xff) << 0)) | 0; // 86733f: mov al, 0xf
        R.sub(((R.ecx >>> 0) & 0xff), ((R.eax >>> 0) & 0xff), 8); // 867341: cmp cl, al
        if (!R.cL) { pc = 0x867348; continue; } // 867343: jge 0x867348
        pc = 0x867345; continue;
      case 0x867345:
        R.m.w8(((R.esi + 0x3d) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 867345: mov byte ptr [esi + 0x3d], al
        pc = 0x867348; continue;
      case 0x867348:
        R.eax = (R.m.u32(((R.esi + 0x45) | 0) >>> 0)) | 0; // 867348: mov eax, dword ptr [esi + 0x45]
        R.logic(((R.eax >>> 0) & 0xff) & 0x10, 8); // 86734b: test al, 0x10
        if (R.zf) { pc = 0x86737e; continue; } // 86734d: je 0x86737e
        pc = 0x86734f; continue;
      case 0x86734f:
        R.ecx = ((R.eax >>> 0)) | 0; // 86734f: mov ecx, eax
        R.push((R.eax >>> 0)); // 867351: push eax
        R.ecx = (R.logic((R.ecx >>> 0) & 0xffffffef, 32)) | 0; // 867352: and ecx, 0xffffffef
        R.m.w32(((R.esi + 0x45) | 0) >>> 0, (R.ecx >>> 0)); // 867355: mov dword ptr [esi + 0x45], ecx
        R.ecx = ((R.esi >>> 0)) | 0; // 867358: mov ecx, esi
        R.call(0x867240, { n: 1, thisEcx: true, calleeClean: true }); // 86735a: call 0x867240
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 86735f: mov eax, dword ptr [esi]
        R.ecx = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 867361: mov ecx, dword ptr [0xae23bc]
        R.push(0x10); // 867367: push 0x10
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 867369: lea edx, [eax + eax*4]
        R.eax = (((R.eax + R.edx * 2) | 0)) | 0; // 86736c: lea eax, [eax + edx*2]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 86736f: lea eax, [eax + eax*4]
        R.edx = (((R.ecx + R.eax * 2) | 0)) | 0; // 867372: lea edx, [ecx + eax*2]
        R.push((R.edx >>> 0)); // 867375: push edx
        R.call(0x549d60, { n: 2, thisEcx: false, calleeClean: false }); // 867376: call 0x549d60
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 86737b: add esp, 8
        pc = 0x86737e; continue;
      case 0x86737e:
        R.eax = (R.m.u32(((R.esi + 0x45) | 0) >>> 0)) | 0; // 86737e: mov eax, dword ptr [esi + 0x45]
        R.logic(((R.eax >>> 0) & 0xff) & 0x1, 8); // 867381: test al, 1
        if (R.zf) { pc = 0x8673b4; continue; } // 867383: je 0x8673b4
        pc = 0x867385; continue;
      case 0x867385:
        R.ecx = ((R.eax >>> 0)) | 0; // 867385: mov ecx, eax
        R.push((R.eax >>> 0)); // 867387: push eax
        R.ecx = (R.logic((R.ecx >>> 0) & 0xfffffffe, 32)) | 0; // 867388: and ecx, 0xfffffffe
        R.m.w32(((R.esi + 0x45) | 0) >>> 0, (R.ecx >>> 0)); // 86738b: mov dword ptr [esi + 0x45], ecx
        R.ecx = ((R.esi >>> 0)) | 0; // 86738e: mov ecx, esi
        R.call(0x867240, { n: 1, thisEcx: true, calleeClean: true }); // 867390: call 0x867240
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 867395: mov eax, dword ptr [esi]
        R.ecx = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 867397: mov ecx, dword ptr [0xae23bc]
        R.push(0x1); // 86739d: push 1
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 86739f: lea edx, [eax + eax*4]
        R.eax = (((R.eax + R.edx * 2) | 0)) | 0; // 8673a2: lea eax, [eax + edx*2]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 8673a5: lea eax, [eax + eax*4]
        R.edx = (((R.ecx + R.eax * 2) | 0)) | 0; // 8673a8: lea edx, [ecx + eax*2]
        R.push((R.edx >>> 0)); // 8673ab: push edx
        R.call(0x549d60, { n: 2, thisEcx: false, calleeClean: false }); // 8673ac: call 0x549d60
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 8673b1: add esp, 8
        pc = 0x8673b4; continue;
      case 0x8673b4:
        R.eax = (R.m.u32(((R.esi + 0x45) | 0) >>> 0)) | 0; // 8673b4: mov eax, dword ptr [esi + 0x45]
        R.logic(((R.eax >>> 0) & 0xff) & 0x4, 8); // 8673b7: test al, 4
        if (R.zf) { pc = 0x8673ea; continue; } // 8673b9: je 0x8673ea
        pc = 0x8673bb; continue;
      case 0x8673bb:
        R.ecx = ((R.eax >>> 0)) | 0; // 8673bb: mov ecx, eax
        R.push((R.eax >>> 0)); // 8673bd: push eax
        R.ecx = (R.logic((R.ecx >>> 0) & 0xfffffffb, 32)) | 0; // 8673be: and ecx, 0xfffffffb
        R.m.w32(((R.esi + 0x45) | 0) >>> 0, (R.ecx >>> 0)); // 8673c1: mov dword ptr [esi + 0x45], ecx
        R.ecx = ((R.esi >>> 0)) | 0; // 8673c4: mov ecx, esi
        R.call(0x867240, { n: 1, thisEcx: true, calleeClean: true }); // 8673c6: call 0x867240
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8673cb: mov eax, dword ptr [esi]
        R.ecx = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 8673cd: mov ecx, dword ptr [0xae23bc]
        R.push(0x4); // 8673d3: push 4
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 8673d5: lea edx, [eax + eax*4]
        R.eax = (((R.eax + R.edx * 2) | 0)) | 0; // 8673d8: lea eax, [eax + edx*2]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 8673db: lea eax, [eax + eax*4]
        R.edx = (((R.ecx + R.eax * 2) | 0)) | 0; // 8673de: lea edx, [ecx + eax*2]
        R.push((R.edx >>> 0)); // 8673e1: push edx
        R.call(0x549d60, { n: 2, thisEcx: false, calleeClean: false }); // 8673e2: call 0x549d60
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 8673e7: add esp, 8
        pc = 0x8673ea; continue;
      case 0x8673ea:
        R.eax = (R.m.u32(((R.esi + 0x45) | 0) >>> 0)) | 0; // 8673ea: mov eax, dword ptr [esi + 0x45]
        R.logic(((R.eax >>> 0) & 0xff) & 0x8, 8); // 8673ed: test al, 8
        if (R.zf) { pc = 0x867420; continue; } // 8673ef: je 0x867420
        pc = 0x8673f1; continue;
      case 0x8673f1:
        R.ecx = ((R.eax >>> 0)) | 0; // 8673f1: mov ecx, eax
        R.push((R.eax >>> 0)); // 8673f3: push eax
        R.ecx = (R.logic((R.ecx >>> 0) & 0xfffffff7, 32)) | 0; // 8673f4: and ecx, 0xfffffff7
        R.m.w32(((R.esi + 0x45) | 0) >>> 0, (R.ecx >>> 0)); // 8673f7: mov dword ptr [esi + 0x45], ecx
        R.ecx = ((R.esi >>> 0)) | 0; // 8673fa: mov ecx, esi
        R.call(0x867240, { n: 1, thisEcx: true, calleeClean: true }); // 8673fc: call 0x867240
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 867401: mov eax, dword ptr [esi]
        R.ecx = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 867403: mov ecx, dword ptr [0xae23bc]
        R.push(0x8); // 867409: push 8
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 86740b: lea edx, [eax + eax*4]
        R.eax = (((R.eax + R.edx * 2) | 0)) | 0; // 86740e: lea eax, [eax + edx*2]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 867411: lea eax, [eax + eax*4]
        R.edx = (((R.ecx + R.eax * 2) | 0)) | 0; // 867414: lea edx, [ecx + eax*2]
        R.push((R.edx >>> 0)); // 867417: push edx
        R.call(0x549d60, { n: 2, thisEcx: false, calleeClean: false }); // 867418: call 0x549d60
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 86741d: add esp, 8
        pc = 0x867420; continue;
      case 0x867420:
        R.eax = (R.m.u32(((R.esi + 0x45) | 0) >>> 0)) | 0; // 867420: mov eax, dword ptr [esi + 0x45]
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 867423: test ah, 1
        if (R.zf) { pc = 0x86745a; continue; } // 867426: je 0x86745a
        pc = 0x867428; continue;
      case 0x867428:
        R.ecx = ((R.eax >>> 0)) | 0; // 867428: mov ecx, eax
        R.push((R.eax >>> 0)); // 86742a: push eax
        R.ecx = ((R.ecx & 0xffff00ff) | (((R.logic(((R.ecx >>> 8) & 0xff) & 0xfe, 8)) & 0xff) << 8)) | 0; // 86742b: and ch, 0xfe
        R.m.w32(((R.esi + 0x45) | 0) >>> 0, (R.ecx >>> 0)); // 86742e: mov dword ptr [esi + 0x45], ecx
        R.ecx = ((R.esi >>> 0)) | 0; // 867431: mov ecx, esi
        R.call(0x867240, { n: 1, thisEcx: true, calleeClean: true }); // 867433: call 0x867240
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 867438: mov eax, dword ptr [esi]
        R.ecx = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 86743a: mov ecx, dword ptr [0xae23bc]
        R.push(0x100); // 867440: push 0x100
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 867445: lea edx, [eax + eax*4]
        R.eax = (((R.eax + R.edx * 2) | 0)) | 0; // 867448: lea eax, [eax + edx*2]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 86744b: lea eax, [eax + eax*4]
        R.edx = (((R.ecx + R.eax * 2) | 0)) | 0; // 86744e: lea edx, [ecx + eax*2]
        R.push((R.edx >>> 0)); // 867451: push edx
        R.call(0x549d60, { n: 2, thisEcx: false, calleeClean: false }); // 867452: call 0x549d60
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 867457: add esp, 8
        pc = 0x86745a; continue;
      case 0x86745a:
        R.eax = (R.m.u32(((R.esi + 0x45) | 0) >>> 0)) | 0; // 86745a: mov eax, dword ptr [esi + 0x45]
        R.logic(((R.eax >>> 0) & 0xff) & 0x80, 8); // 86745d: test al, 0x80
        if (R.zf) { pc = 0x867493; continue; } // 86745f: je 0x867493
        pc = 0x867461; continue;
      case 0x867461:
        R.ecx = ((R.eax >>> 0)) | 0; // 867461: mov ecx, eax
        R.push((R.eax >>> 0)); // 867463: push eax
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0x7f, 8)) & 0xff) << 0)) | 0; // 867464: and cl, 0x7f
        R.m.w32(((R.esi + 0x45) | 0) >>> 0, (R.ecx >>> 0)); // 867467: mov dword ptr [esi + 0x45], ecx
        R.ecx = ((R.esi >>> 0)) | 0; // 86746a: mov ecx, esi
        R.call(0x867240, { n: 1, thisEcx: true, calleeClean: true }); // 86746c: call 0x867240
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 867471: mov eax, dword ptr [esi]
        R.ecx = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 867473: mov ecx, dword ptr [0xae23bc]
        R.push(0x80); // 867479: push 0x80
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 86747e: lea edx, [eax + eax*4]
        R.eax = (((R.eax + R.edx * 2) | 0)) | 0; // 867481: lea eax, [eax + edx*2]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 867484: lea eax, [eax + eax*4]
        R.edx = (((R.ecx + R.eax * 2) | 0)) | 0; // 867487: lea edx, [ecx + eax*2]
        R.push((R.edx >>> 0)); // 86748a: push edx
        R.call(0x549d60, { n: 2, thisEcx: false, calleeClean: false }); // 86748b: call 0x549d60
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 867490: add esp, 8
        pc = 0x867493; continue;
      case 0x867493:
        R.eax = (R.m.u32(((R.esi + 0x45) | 0) >>> 0)) | 0; // 867493: mov eax, dword ptr [esi + 0x45]
        R.logic((R.eax >>> 0) & 0x10000, 32); // 867496: test eax, 0x10000
        if (R.zf) { pc = 0x8674d2; continue; } // 86749b: je 0x8674d2
        pc = 0x86749d; continue;
      case 0x86749d:
        R.ecx = ((R.eax >>> 0)) | 0; // 86749d: mov ecx, eax
        R.push((R.eax >>> 0)); // 86749f: push eax
        R.ecx = (R.logic((R.ecx >>> 0) & 0xfffeffff, 32)) | 0; // 8674a0: and ecx, 0xfffeffff
        R.m.w32(((R.esi + 0x45) | 0) >>> 0, (R.ecx >>> 0)); // 8674a6: mov dword ptr [esi + 0x45], ecx
        R.ecx = ((R.esi >>> 0)) | 0; // 8674a9: mov ecx, esi
        R.call(0x867240, { n: 1, thisEcx: true, calleeClean: true }); // 8674ab: call 0x867240
        R.esi = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8674b0: mov esi, dword ptr [esi]
        R.ecx = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 8674b2: mov ecx, dword ptr [0xae23bc]
        R.push(0x10000); // 8674b8: push 0x10000
        R.edx = (((R.esi + R.esi * 4) | 0)) | 0; // 8674bd: lea edx, [esi + esi*4]
        R.eax = (((R.esi + R.edx * 2) | 0)) | 0; // 8674c0: lea eax, [esi + edx*2]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 8674c3: lea eax, [eax + eax*4]
        R.edx = (((R.ecx + R.eax * 2) | 0)) | 0; // 8674c6: lea edx, [ecx + eax*2]
        R.push((R.edx >>> 0)); // 8674c9: push edx
        R.call(0x549d60, { n: 2, thisEcx: false, calleeClean: false }); // 8674ca: call 0x549d60
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 8674cf: add esp, 8
        pc = 0x8674d2; continue;
      case 0x8674d2:
        R.edi = (R.pop()) | 0; // 8674d2: pop edi
        R.esi = (R.pop()) | 0; // 8674d3: pop esi
        return R.ret(1); // 8674d4: ret 4
      default: throw new Error(`f_867240: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
