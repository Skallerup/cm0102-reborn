// 0x53c190 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 417c10=2tc, 53b4f0=1, 5e8290=9, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_53c190(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x53c190;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x53c190:
        R.esp = (R.sub((R.esp >>> 0), 0x208, 32)) | 0; // 53c190: sub esp, 0x208
        R.push((R.ebx >>> 0)); // 53c196: push ebx
        R.push((R.ebp >>> 0)); // 53c197: push ebp
        R.push((R.esi >>> 0)); // 53c198: push esi
        R.esi = (R.m.u32(((R.esp + 0x218) | 0) >>> 0)) | 0; // 53c199: mov esi, dword ptr [esp + 0x218]
        R.ebx = (R.logic((R.ebx >>> 0) ^ (R.ebx >>> 0), 32)) | 0; // 53c1a0: xor ebx, ebx
        R.push((R.edi >>> 0)); // 53c1a2: push edi
        R.sub((R.esi >>> 0), (R.ebx >>> 0), 32); // 53c1a3: cmp esi, ebx
        if (R.zf) { pc = 0x53c20e; continue; } // 53c1a5: je 0x53c20e
        pc = 0x53c1a7; continue;
      case 0x53c1a7:
        R.edi = (R.m.u32(((R.esp + 0x220) | 0) >>> 0)) | 0; // 53c1a7: mov edi, dword ptr [esp + 0x220]
        R.sub((R.edi >>> 0), (R.ebx >>> 0), 32); // 53c1ae: cmp edi, ebx
        if (!R.zf) { pc = 0x53c21b; continue; } // 53c1b0: jne 0x53c21b
        pc = 0x53c1b2; continue;
      case 0x53c1b2:
        R.eax = (((R.esp + 0x18) | 0)) | 0; // 53c1b2: lea eax, [esp + 0x18]
        R.ecx = (((R.esp + 0x118) | 0)) | 0; // 53c1b6: lea ecx, [esp + 0x118]
        R.push((R.eax >>> 0)); // 53c1bd: push eax
        R.push((R.ecx >>> 0)); // 53c1be: push ecx
        R.push((R.ebx >>> 0)); // 53c1bf: push ebx
        R.push((R.ebx >>> 0)); // 53c1c0: push ebx
        R.push(0x9b5ac8); // 53c1c1: push 0x9b5ac8
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 53c1c6: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 53c1cb: add esp, 0x14
        R.edx = (((R.esp + 0x18) | 0)) | 0; // 53c1ce: lea edx, [esp + 0x18]
        R.eax = (((R.esp + 0x118) | 0)) | 0; // 53c1d2: lea eax, [esp + 0x118]
        R.push(0x36ea); // 53c1d9: push 0x36ea
        R.push((R.edx >>> 0)); // 53c1de: push edx
        R.push((R.eax >>> 0)); // 53c1df: push eax
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 53c1e0: call 0x90d130
        R.push((R.eax >>> 0)); // 53c1e5: push eax
        R.push(0x9870e8); // 53c1e6: push 0x9870e8
        R.push(0xae24d0); // 53c1eb: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 53c1f0: call 0x944c9f
        R.push((R.ebx >>> 0)); // 53c1f5: push ebx
        R.push(0xae24d0); // 53c1f6: push 0xae24d0
        R.push(0x9870e0); // 53c1fb: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 53c200: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 53c205: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, (R.ebx >>> 0)); // 53c208: mov dword ptr [0xb67a34], ebx
        pc = 0x53c20e; continue;
      case 0x53c20e:
        R.edi = (R.pop()) | 0; // 53c20e: pop edi
        R.esi = (R.pop()) | 0; // 53c20f: pop esi
        R.ebp = (R.pop()) | 0; // 53c210: pop ebp
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53c211: xor eax, eax
        R.ebx = (R.pop()) | 0; // 53c213: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x208, 32)) | 0; // 53c214: add esp, 0x208
        return R.ret(0); // 53c21a: ret 
      case 0x53c21b:
        R.eax = (R.m.u32(((R.esp + 0x224) | 0) >>> 0)) | 0; // 53c21b: mov eax, dword ptr [esp + 0x224]
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 53c222: cmp eax, ebx
        if (R.zf) { pc = 0x53c255; continue; } // 53c224: je 0x53c255
        pc = 0x53c226; continue;
      case 0x53c226:
        R.ecx = (R.m.u32(((0xae2350) | 0) >>> 0)) | 0; // 53c226: mov ecx, dword ptr [0xae2350]
        R.push((R.eax >>> 0)); // 53c22c: push eax
        R.edx = (((R.ecx + R.ecx) | 0)) | 0; // 53c22d: lea edx, [ecx + ecx]
        R.ecx = (R.m.u32(((0xae235c) | 0) >>> 0)) | 0; // 53c230: mov ecx, dword ptr [0xae235c]
        R.ecx = (R.sub((R.ecx >>> 0), (R.edx >>> 0), 32)) | 0; // 53c236: sub ecx, edx
        R.edx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 53c238: mov edx, dword ptr [esi]
        R.sub((R.edx >>> 0), (R.ecx >>> 0), 32); // 53c23a: cmp edx, ecx
        if (R.cL) { pc = 0x53c248; continue; } // 53c23c: jl 0x53c248
        pc = 0x53c23e; continue;
      case 0x53c23e:
        R.edx = (((R.esp + 0x14) | 0)) | 0; // 53c23e: lea edx, [esp + 0x14]
        R.ecx = (((R.edi + 0x29) | 0)) | 0; // 53c242: lea ecx, [edi + 0x29]
        R.push((R.edx >>> 0)); // 53c245: push edx
        pc = 0x53c250; continue; // 53c246: jmp 0x53c250
      case 0x53c248:
        R.eax = (((R.esp + 0x14) | 0)) | 0; // 53c248: lea eax, [esp + 0x14]
        R.ecx = (((R.edi + 0x3e) | 0)) | 0; // 53c24c: lea ecx, [edi + 0x3e]
        R.push((R.eax >>> 0)); // 53c24f: push eax
        pc = 0x53c250; continue;
      case 0x53c250:
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 53c250: call 0x417c10
        pc = 0x53c255; continue;
      case 0x53c255:
        R.edx = (R.m.u32(((0xae2350) | 0) >>> 0)) | 0; // 53c255: mov edx, dword ptr [0xae2350]
        R.ecx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 53c25b: mov ecx, dword ptr [esi]
        R.eax = (((R.edx + R.edx) | 0)) | 0; // 53c25d: lea eax, [edx + edx]
        R.edx = (R.m.u32(((0xae235c) | 0) >>> 0)) | 0; // 53c260: mov edx, dword ptr [0xae235c]
        R.edx = (R.sub((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 53c266: sub edx, eax
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 53c268: cmp ecx, edx
        if (R.cL) { pc = 0x53c271; continue; } // 53c26a: jl 0x53c271
        pc = 0x53c26c; continue;
      case 0x53c26c:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edi + 0x28) | 0) >>> 0)) & 0xff) << 0)) | 0; // 53c26c: mov al, byte ptr [edi + 0x28]
        pc = 0x53c274; continue; // 53c26f: jmp 0x53c274
      case 0x53c271:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edi + 0x3d) | 0) >>> 0)) & 0xff) << 0)) | 0; // 53c271: mov al, byte ptr [edi + 0x3d]
        pc = 0x53c274; continue;
      case 0x53c274:
        R.sub(R.m.u32(((R.esp + 0x22c) | 0) >>> 0), (R.ebx >>> 0), 32); // 53c274: cmp dword ptr [esp + 0x22c], ebx
        if (R.zf) { pc = 0x53c293; continue; } // 53c27b: je 0x53c293
        pc = 0x53c27d; continue;
      case 0x53c27d:
        R.sub(((R.eax >>> 0) & 0xff), 0xb, 8); // 53c27d: cmp al, 0xb
        if (R.zf) { pc = 0x53c28d; continue; } // 53c27f: je 0x53c28d
        pc = 0x53c281; continue;
      case 0x53c281:
        R.sub(((R.eax >>> 0) & 0xff), 0xc, 8); // 53c281: cmp al, 0xc
        if (R.zf) { pc = 0x53c28d; continue; } // 53c283: je 0x53c28d
        pc = 0x53c285; continue;
      case 0x53c285:
        R.sub(((R.eax >>> 0) & 0xff), 0xd, 8); // 53c285: cmp al, 0xd
        if (R.zf) { pc = 0x53c28d; continue; } // 53c287: je 0x53c28d
        pc = 0x53c289; continue;
      case 0x53c289:
        R.sub(((R.eax >>> 0) & 0xff), 0xf, 8); // 53c289: cmp al, 0xf
        if (!R.zf) { pc = 0x53c291; continue; } // 53c28b: jne 0x53c291
        pc = 0x53c28d; continue;
      case 0x53c28d:
        R.eax = ((R.eax & 0xffffff00) | (((0xb) & 0xff) << 0)) | 0; // 53c28d: mov al, 0xb
        pc = 0x53c293; continue; // 53c28f: jmp 0x53c293
      case 0x53c291:
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 53c291: xor al, al
        pc = 0x53c293; continue;
      case 0x53c293:
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 53c293: movsx eax, al
        R.sub((R.eax >>> 0), 0xf, 32); // 53c296: cmp eax, 0xf
        if (!R.cBE) { pc = 0x53c20e; continue; } // 53c299: ja 0x53c20e
        pc = 0x53c29f; continue;
      case 0x53c29f:
        pc = [0x53c507, 0x53c2a6, 0x53c2bd, 0x53c2bd, 0x53c2bd, 0x53c2f4, 0x53c352, 0x53c352, 0x53c369, 0x53c3a0, 0x53c3d7, 0x53c40e, 0x53c430, 0x53c464, 0x53c20e, 0x53c4a3][R.eax >>> 0]; continue; // 53c29f: jmp dword ptr [eax*4 + 0x53c54c]
      case 0x53c2a6:
        R.sub(R.m.u32(((R.esi + 0xbf) | 0) >>> 0), (R.edi >>> 0), 32); // 53c2a6: cmp dword ptr [esi + 0xbf], edi
        if (!R.zf) { pc = 0x53c20e; continue; } // 53c2ac: jne 0x53c20e
        pc = 0x53c2b2; continue;
      case 0x53c2b2:
        R.m.w32(((R.esi + 0xbf) | 0) >>> 0, (R.ebx >>> 0)); // 53c2b2: mov dword ptr [esi + 0xbf], ebx
        pc = 0x53c507; continue; // 53c2b8: jmp 0x53c507
      case 0x53c2bd:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53c2bd: xor eax, eax
        R.ecx = (((R.esi + 0xc3) | 0)) | 0; // 53c2bf: lea ecx, [esi + 0xc3]
        pc = 0x53c2c5; continue;
      case 0x53c2c5:
        R.sub(R.m.u32(((R.ecx) | 0) >>> 0), (R.edi >>> 0), 32); // 53c2c5: cmp dword ptr [ecx], edi
        if (R.zf) { pc = 0x53c2df; continue; } // 53c2c7: je 0x53c2df
        pc = 0x53c2c9; continue;
      case 0x53c2c9:
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 53c2c9: inc eax
        R.ecx = (R.add((R.ecx >>> 0), 0x4, 32)) | 0; // 53c2ca: add ecx, 4
        R.sub((R.eax >>> 0), 0x3, 32); // 53c2cd: cmp eax, 3
        if (R.cL) { pc = 0x53c2c5; continue; } // 53c2d0: jl 0x53c2c5
        pc = 0x53c2d2; continue;
      case 0x53c2d2:
        R.edi = (R.pop()) | 0; // 53c2d2: pop edi
        R.esi = (R.pop()) | 0; // 53c2d3: pop esi
        R.ebp = (R.pop()) | 0; // 53c2d4: pop ebp
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53c2d5: xor eax, eax
        R.ebx = (R.pop()) | 0; // 53c2d7: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x208, 32)) | 0; // 53c2d8: add esp, 0x208
        return R.ret(0); // 53c2de: ret 
      case 0x53c2df:
        R.sub((R.eax >>> 0), 0x3, 32); // 53c2df: cmp eax, 3
        if (!R.cL) { pc = 0x53c20e; continue; } // 53c2e2: jge 0x53c20e
        pc = 0x53c2e8; continue;
      case 0x53c2e8:
        R.m.w32(((R.esi + R.eax * 4 + 0xc3) | 0) >>> 0, (R.ebx >>> 0)); // 53c2e8: mov dword ptr [esi + eax*4 + 0xc3], ebx
        pc = 0x53c507; continue; // 53c2ef: jmp 0x53c507
      case 0x53c2f4:
        R.sub(R.m.u32(((R.esi + 0xcf) | 0) >>> 0), (R.edi >>> 0), 32); // 53c2f4: cmp dword ptr [esi + 0xcf], edi
        if (!R.zf) { pc = 0x53c20e; continue; } // 53c2fa: jne 0x53c20e
        pc = 0x53c300; continue;
      case 0x53c300:
        R.m.w32(((R.esi + 0xcf) | 0) >>> 0, (R.ebx >>> 0)); // 53c300: mov dword ptr [esi + 0xcf], ebx
        R.eax = (R.m.u32(((0xae2350) | 0) >>> 0)) | 0; // 53c306: mov eax, dword ptr [0xae2350]
        R.edx = (((R.eax + R.eax) | 0)) | 0; // 53c30b: lea edx, [eax + eax]
        R.eax = (R.m.u32(((0xae235c) | 0) >>> 0)) | 0; // 53c30e: mov eax, dword ptr [0xae235c]
        R.ebp = ((R.eax >>> 0)) | 0; // 53c313: mov ebp, eax
        R.ebp = (R.sub((R.ebp >>> 0), (R.edx >>> 0), 32)) | 0; // 53c315: sub ebp, edx
        R.sub((R.ecx >>> 0), (R.ebp >>> 0), 32); // 53c317: cmp ecx, ebp
        if (R.cL) { pc = 0x53c507; continue; } // 53c319: jl 0x53c507
        pc = 0x53c31f; continue;
      case 0x53c31f:
        R.eax = (R.sub((R.eax >>> 0), R.m.u32(((0xae2350) | 0) >>> 0), 32)) | 0; // 53c31f: sub eax, dword ptr [0xae2350]
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 53c325: cmp ecx, eax
        if (!R.cL) { pc = 0x53c507; continue; } // 53c327: jge 0x53c507
        pc = 0x53c32d; continue;
      case 0x53c32d:
        R.eax = (R.m.u32(((R.esi + 0x53) | 0) >>> 0)) | 0; // 53c32d: mov eax, dword ptr [esi + 0x53]
        R.push((R.eax >>> 0)); // 53c330: push eax
        R.call(0x53b4f0, { n: 1, thisEcx: false, calleeClean: false }); // 53c331: call 0x53b4f0
        R.ecx = (R.m.u32(((R.eax + 0xcf) | 0) >>> 0)) | 0; // 53c336: mov ecx, dword ptr [eax + 0xcf]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 53c33c: add esp, 4
        R.sub((R.ecx >>> 0), (R.edi >>> 0), 32); // 53c33f: cmp ecx, edi
        if (!R.zf) { pc = 0x53c507; continue; } // 53c341: jne 0x53c507
        pc = 0x53c347; continue;
      case 0x53c347:
        R.m.w32(((R.eax + 0xcf) | 0) >>> 0, (R.ebx >>> 0)); // 53c347: mov dword ptr [eax + 0xcf], ebx
        pc = 0x53c507; continue; // 53c34d: jmp 0x53c507
      case 0x53c352:
        R.sub(R.m.u32(((R.esi + 0xd3) | 0) >>> 0), (R.edi >>> 0), 32); // 53c352: cmp dword ptr [esi + 0xd3], edi
        if (!R.zf) { pc = 0x53c20e; continue; } // 53c358: jne 0x53c20e
        pc = 0x53c35e; continue;
      case 0x53c35e:
        R.m.w32(((R.esi + 0xd3) | 0) >>> 0, (R.ebx >>> 0)); // 53c35e: mov dword ptr [esi + 0xd3], ebx
        pc = 0x53c507; continue; // 53c364: jmp 0x53c507
      case 0x53c369:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53c369: xor eax, eax
        R.ecx = (((R.esi + 0x19f) | 0)) | 0; // 53c36b: lea ecx, [esi + 0x19f]
        pc = 0x53c371; continue;
      case 0x53c371:
        R.sub(R.m.u32(((R.ecx) | 0) >>> 0), (R.edi >>> 0), 32); // 53c371: cmp dword ptr [ecx], edi
        if (R.zf) { pc = 0x53c38b; continue; } // 53c373: je 0x53c38b
        pc = 0x53c375; continue;
      case 0x53c375:
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 53c375: inc eax
        R.ecx = (R.add((R.ecx >>> 0), 0x4, 32)) | 0; // 53c376: add ecx, 4
        R.sub((R.eax >>> 0), 0x5, 32); // 53c379: cmp eax, 5
        if (R.cL) { pc = 0x53c371; continue; } // 53c37c: jl 0x53c371
        pc = 0x53c37e; continue;
      case 0x53c37e:
        R.edi = (R.pop()) | 0; // 53c37e: pop edi
        R.esi = (R.pop()) | 0; // 53c37f: pop esi
        R.ebp = (R.pop()) | 0; // 53c380: pop ebp
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53c381: xor eax, eax
        R.ebx = (R.pop()) | 0; // 53c383: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x208, 32)) | 0; // 53c384: add esp, 0x208
        return R.ret(0); // 53c38a: ret 
      case 0x53c38b:
        R.sub((R.eax >>> 0), 0x5, 32); // 53c38b: cmp eax, 5
        if (!R.cL) { pc = 0x53c20e; continue; } // 53c38e: jge 0x53c20e
        pc = 0x53c394; continue;
      case 0x53c394:
        R.m.w32(((R.esi + R.eax * 4 + 0x19f) | 0) >>> 0, (R.ebx >>> 0)); // 53c394: mov dword ptr [esi + eax*4 + 0x19f], ebx
        pc = 0x53c507; continue; // 53c39b: jmp 0x53c507
      case 0x53c3a0:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53c3a0: xor eax, eax
        R.ecx = (((R.esi + 0x1b3) | 0)) | 0; // 53c3a2: lea ecx, [esi + 0x1b3]
        pc = 0x53c3a8; continue;
      case 0x53c3a8:
        R.sub(R.m.u32(((R.ecx) | 0) >>> 0), (R.edi >>> 0), 32); // 53c3a8: cmp dword ptr [ecx], edi
        if (R.zf) { pc = 0x53c3c2; continue; } // 53c3aa: je 0x53c3c2
        pc = 0x53c3ac; continue;
      case 0x53c3ac:
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 53c3ac: inc eax
        R.ecx = (R.add((R.ecx >>> 0), 0x4, 32)) | 0; // 53c3ad: add ecx, 4
        R.sub((R.eax >>> 0), 0x7, 32); // 53c3b0: cmp eax, 7
        if (R.cL) { pc = 0x53c3a8; continue; } // 53c3b3: jl 0x53c3a8
        pc = 0x53c3b5; continue;
      case 0x53c3b5:
        R.edi = (R.pop()) | 0; // 53c3b5: pop edi
        R.esi = (R.pop()) | 0; // 53c3b6: pop esi
        R.ebp = (R.pop()) | 0; // 53c3b7: pop ebp
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53c3b8: xor eax, eax
        R.ebx = (R.pop()) | 0; // 53c3ba: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x208, 32)) | 0; // 53c3bb: add esp, 0x208
        return R.ret(0); // 53c3c1: ret 
      case 0x53c3c2:
        R.sub((R.eax >>> 0), 0x7, 32); // 53c3c2: cmp eax, 7
        if (!R.cL) { pc = 0x53c20e; continue; } // 53c3c5: jge 0x53c20e
        pc = 0x53c3cb; continue;
      case 0x53c3cb:
        R.m.w32(((R.esi + R.eax * 4 + 0x1b3) | 0) >>> 0, (R.ebx >>> 0)); // 53c3cb: mov dword ptr [esi + eax*4 + 0x1b3], ebx
        pc = 0x53c507; continue; // 53c3d2: jmp 0x53c507
      case 0x53c3d7:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53c3d7: xor eax, eax
        R.ecx = (((R.esi + 0x1cf) | 0)) | 0; // 53c3d9: lea ecx, [esi + 0x1cf]
        pc = 0x53c3df; continue;
      case 0x53c3df:
        R.sub(R.m.u32(((R.ecx) | 0) >>> 0), (R.edi >>> 0), 32); // 53c3df: cmp dword ptr [ecx], edi
        if (R.zf) { pc = 0x53c3f9; continue; } // 53c3e1: je 0x53c3f9
        pc = 0x53c3e3; continue;
      case 0x53c3e3:
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 53c3e3: inc eax
        R.ecx = (R.add((R.ecx >>> 0), 0x4, 32)) | 0; // 53c3e4: add ecx, 4
        R.sub((R.eax >>> 0), 0x3, 32); // 53c3e7: cmp eax, 3
        if (R.cL) { pc = 0x53c3df; continue; } // 53c3ea: jl 0x53c3df
        pc = 0x53c3ec; continue;
      case 0x53c3ec:
        R.edi = (R.pop()) | 0; // 53c3ec: pop edi
        R.esi = (R.pop()) | 0; // 53c3ed: pop esi
        R.ebp = (R.pop()) | 0; // 53c3ee: pop ebp
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53c3ef: xor eax, eax
        R.ebx = (R.pop()) | 0; // 53c3f1: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x208, 32)) | 0; // 53c3f2: add esp, 0x208
        return R.ret(0); // 53c3f8: ret 
      case 0x53c3f9:
        R.sub((R.eax >>> 0), 0x3, 32); // 53c3f9: cmp eax, 3
        if (!R.cL) { pc = 0x53c20e; continue; } // 53c3fc: jge 0x53c20e
        pc = 0x53c402; continue;
      case 0x53c402:
        R.m.w32(((R.esi + R.eax * 4 + 0x1cf) | 0) >>> 0, (R.ebx >>> 0)); // 53c402: mov dword ptr [esi + eax*4 + 0x1cf], ebx
        pc = 0x53c507; continue; // 53c409: jmp 0x53c507
      case 0x53c40e:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53c40e: xor eax, eax
        R.ecx = (((R.esi + 0xd7) | 0)) | 0; // 53c410: lea ecx, [esi + 0xd7]
        pc = 0x53c416; continue;
      case 0x53c416:
        R.sub(R.m.u32(((R.ecx) | 0) >>> 0), (R.edi >>> 0), 32); // 53c416: cmp dword ptr [ecx], edi
        if (R.zf) { pc = 0x53c498; continue; } // 53c418: je 0x53c498
        pc = 0x53c41a; continue;
      case 0x53c41a:
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 53c41a: inc eax
        R.ecx = (R.add((R.ecx >>> 0), 0x4, 32)) | 0; // 53c41b: add ecx, 4
        R.sub((R.eax >>> 0), 0x32, 32); // 53c41e: cmp eax, 0x32
        if (R.cL) { pc = 0x53c416; continue; } // 53c421: jl 0x53c416
        pc = 0x53c423; continue;
      case 0x53c423:
        R.edi = (R.pop()) | 0; // 53c423: pop edi
        R.esi = (R.pop()) | 0; // 53c424: pop esi
        R.ebp = (R.pop()) | 0; // 53c425: pop ebp
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53c426: xor eax, eax
        R.ebx = (R.pop()) | 0; // 53c428: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x208, 32)) | 0; // 53c429: add esp, 0x208
        return R.ret(0); // 53c42f: ret 
      case 0x53c430:
        R.sub(R.m.u32(((R.esi + 0xcf) | 0) >>> 0), (R.edi >>> 0), 32); // 53c430: cmp dword ptr [esi + 0xcf], edi
        if (!R.zf) { pc = 0x53c20e; continue; } // 53c436: jne 0x53c20e
        pc = 0x53c43c; continue;
      case 0x53c43c:
        R.m.w32(((R.esi + 0xcf) | 0) >>> 0, (R.ebx >>> 0)); // 53c43c: mov dword ptr [esi + 0xcf], ebx
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53c442: xor eax, eax
        R.ecx = (((R.esi + 0xd7) | 0)) | 0; // 53c444: lea ecx, [esi + 0xd7]
        pc = 0x53c44a; continue;
      case 0x53c44a:
        R.sub(R.m.u32(((R.ecx) | 0) >>> 0), (R.edi >>> 0), 32); // 53c44a: cmp dword ptr [ecx], edi
        if (R.zf) { pc = 0x53c498; continue; } // 53c44c: je 0x53c498
        pc = 0x53c44e; continue;
      case 0x53c44e:
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 53c44e: inc eax
        R.ecx = (R.add((R.ecx >>> 0), 0x4, 32)) | 0; // 53c44f: add ecx, 4
        R.sub((R.eax >>> 0), 0x32, 32); // 53c452: cmp eax, 0x32
        if (R.cL) { pc = 0x53c44a; continue; } // 53c455: jl 0x53c44a
        pc = 0x53c457; continue;
      case 0x53c457:
        R.edi = (R.pop()) | 0; // 53c457: pop edi
        R.esi = (R.pop()) | 0; // 53c458: pop esi
        R.ebp = (R.pop()) | 0; // 53c459: pop ebp
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53c45a: xor eax, eax
        R.ebx = (R.pop()) | 0; // 53c45c: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x208, 32)) | 0; // 53c45d: add esp, 0x208
        return R.ret(0); // 53c463: ret 
      case 0x53c464:
        R.sub(R.m.u32(((R.esi + 0xd3) | 0) >>> 0), (R.edi >>> 0), 32); // 53c464: cmp dword ptr [esi + 0xd3], edi
        if (!R.zf) { pc = 0x53c20e; continue; } // 53c46a: jne 0x53c20e
        pc = 0x53c470; continue;
      case 0x53c470:
        R.m.w32(((R.esi + 0xd3) | 0) >>> 0, (R.ebx >>> 0)); // 53c470: mov dword ptr [esi + 0xd3], ebx
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53c476: xor eax, eax
        R.ecx = (((R.esi + 0xd7) | 0)) | 0; // 53c478: lea ecx, [esi + 0xd7]
        pc = 0x53c47e; continue;
      case 0x53c47e:
        R.sub(R.m.u32(((R.ecx) | 0) >>> 0), (R.edi >>> 0), 32); // 53c47e: cmp dword ptr [ecx], edi
        if (R.zf) { pc = 0x53c498; continue; } // 53c480: je 0x53c498
        pc = 0x53c482; continue;
      case 0x53c482:
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 53c482: inc eax
        R.ecx = (R.add((R.ecx >>> 0), 0x4, 32)) | 0; // 53c483: add ecx, 4
        R.sub((R.eax >>> 0), 0x32, 32); // 53c486: cmp eax, 0x32
        if (R.cL) { pc = 0x53c47e; continue; } // 53c489: jl 0x53c47e
        pc = 0x53c48b; continue;
      case 0x53c48b:
        R.edi = (R.pop()) | 0; // 53c48b: pop edi
        R.esi = (R.pop()) | 0; // 53c48c: pop esi
        R.ebp = (R.pop()) | 0; // 53c48d: pop ebp
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53c48e: xor eax, eax
        R.ebx = (R.pop()) | 0; // 53c490: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x208, 32)) | 0; // 53c491: add esp, 0x208
        return R.ret(0); // 53c497: ret 
      case 0x53c498:
        R.sub((R.eax >>> 0), 0x32, 32); // 53c498: cmp eax, 0x32
        if (!R.cL) { pc = 0x53c20e; continue; } // 53c49b: jge 0x53c20e
        pc = 0x53c4a1; continue;
      case 0x53c4a1:
        pc = 0x53c500; continue; // 53c4a1: jmp 0x53c500
      case 0x53c4a3:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53c4a3: xor eax, eax
        R.ecx = (((R.esi + 0x19f) | 0)) | 0; // 53c4a5: lea ecx, [esi + 0x19f]
        pc = 0x53c4ab; continue;
      case 0x53c4ab:
        R.sub(R.m.u32(((R.ecx) | 0) >>> 0), (R.edi >>> 0), 32); // 53c4ab: cmp dword ptr [ecx], edi
        if (R.zf) { pc = 0x53c4c5; continue; } // 53c4ad: je 0x53c4c5
        pc = 0x53c4af; continue;
      case 0x53c4af:
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 53c4af: inc eax
        R.ecx = (R.add((R.ecx >>> 0), 0x4, 32)) | 0; // 53c4b0: add ecx, 4
        R.sub((R.eax >>> 0), 0x5, 32); // 53c4b3: cmp eax, 5
        if (R.cL) { pc = 0x53c4ab; continue; } // 53c4b6: jl 0x53c4ab
        pc = 0x53c4b8; continue;
      case 0x53c4b8:
        R.edi = (R.pop()) | 0; // 53c4b8: pop edi
        R.esi = (R.pop()) | 0; // 53c4b9: pop esi
        R.ebp = (R.pop()) | 0; // 53c4ba: pop ebp
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53c4bb: xor eax, eax
        R.ebx = (R.pop()) | 0; // 53c4bd: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x208, 32)) | 0; // 53c4be: add esp, 0x208
        return R.ret(0); // 53c4c4: ret 
      case 0x53c4c5:
        R.sub((R.eax >>> 0), 0x5, 32); // 53c4c5: cmp eax, 5
        if (!R.cL) { pc = 0x53c20e; continue; } // 53c4c8: jge 0x53c20e
        pc = 0x53c4ce; continue;
      case 0x53c4ce:
        R.m.w32(((R.esi + R.eax * 4 + 0x19f) | 0) >>> 0, (R.ebx >>> 0)); // 53c4ce: mov dword ptr [esi + eax*4 + 0x19f], ebx
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53c4d5: xor eax, eax
        R.ecx = (((R.esi + 0xd7) | 0)) | 0; // 53c4d7: lea ecx, [esi + 0xd7]
        pc = 0x53c4dd; continue;
      case 0x53c4dd:
        R.sub(R.m.u32(((R.ecx) | 0) >>> 0), (R.edi >>> 0), 32); // 53c4dd: cmp dword ptr [ecx], edi
        if (R.zf) { pc = 0x53c4f7; continue; } // 53c4df: je 0x53c4f7
        pc = 0x53c4e1; continue;
      case 0x53c4e1:
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 53c4e1: inc eax
        R.ecx = (R.add((R.ecx >>> 0), 0x4, 32)) | 0; // 53c4e2: add ecx, 4
        R.sub((R.eax >>> 0), 0x32, 32); // 53c4e5: cmp eax, 0x32
        if (R.cL) { pc = 0x53c4dd; continue; } // 53c4e8: jl 0x53c4dd
        pc = 0x53c4ea; continue;
      case 0x53c4ea:
        R.edi = (R.pop()) | 0; // 53c4ea: pop edi
        R.esi = (R.pop()) | 0; // 53c4eb: pop esi
        R.ebp = (R.pop()) | 0; // 53c4ec: pop ebp
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53c4ed: xor eax, eax
        R.ebx = (R.pop()) | 0; // 53c4ef: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x208, 32)) | 0; // 53c4f0: add esp, 0x208
        return R.ret(0); // 53c4f6: ret 
      case 0x53c4f7:
        R.sub((R.eax >>> 0), 0x32, 32); // 53c4f7: cmp eax, 0x32
        if (!R.cL) { pc = 0x53c20e; continue; } // 53c4fa: jge 0x53c20e
        pc = 0x53c500; continue;
      case 0x53c500:
        R.m.w32(((R.esi + R.eax * 4 + 0xd7) | 0) >>> 0, (R.ebx >>> 0)); // 53c500: mov dword ptr [esi + eax*4 + 0xd7], ebx
        pc = 0x53c507; continue;
      case 0x53c507:
        R.sub(R.m.u32(((R.esp + 0x228) | 0) >>> 0), (R.ebx >>> 0), 32); // 53c507: cmp dword ptr [esp + 0x228], ebx
        if (R.zf) { pc = 0x53c53c; continue; } // 53c50e: je 0x53c53c
        pc = 0x53c510; continue;
      case 0x53c510:
        R.ecx = (R.m.u32(((0xae2350) | 0) >>> 0)) | 0; // 53c510: mov ecx, dword ptr [0xae2350]
        R.eax = (R.m.u32(((0xae235c) | 0) >>> 0)) | 0; // 53c516: mov eax, dword ptr [0xae235c]
        R.edx = (((R.ecx + R.ecx) | 0)) | 0; // 53c51b: lea edx, [ecx + ecx]
        R.ecx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 53c51e: mov ecx, dword ptr [esi]
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 53c520: sub eax, edx
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 53c522: cmp ecx, eax
        if (R.cL) { pc = 0x53c539; continue; } // 53c524: jl 0x53c539
        pc = 0x53c526; continue;
      case 0x53c526:
        R.m.w32(((R.edi + 0x24) | 0) >>> 0, (R.ebx >>> 0)); // 53c526: mov dword ptr [edi + 0x24], ebx
        R.edi = (R.pop()) | 0; // 53c529: pop edi
        R.esi = (R.pop()) | 0; // 53c52a: pop esi
        R.ebp = (R.pop()) | 0; // 53c52b: pop ebp
        R.eax = (0x1) | 0; // 53c52c: mov eax, 1
        R.ebx = (R.pop()) | 0; // 53c531: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x208, 32)) | 0; // 53c532: add esp, 0x208
        return R.ret(0); // 53c538: ret 
      case 0x53c539:
        R.m.w32(((R.edi + 0x39) | 0) >>> 0, (R.ebx >>> 0)); // 53c539: mov dword ptr [edi + 0x39], ebx
        pc = 0x53c53c; continue;
      case 0x53c53c:
        R.edi = (R.pop()) | 0; // 53c53c: pop edi
        R.esi = (R.pop()) | 0; // 53c53d: pop esi
        R.ebp = (R.pop()) | 0; // 53c53e: pop ebp
        R.eax = (0x1) | 0; // 53c53f: mov eax, 1
        R.ebx = (R.pop()) | 0; // 53c544: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x208, 32)) | 0; // 53c545: add esp, 0x208
        return R.ret(0); // 53c54b: ret 
      default: throw new Error(`f_53c190: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
