// 0x4d42d0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4cf5f0=2tc, 4d1600=6tc, 544520=2, 5e8290=9, 600a50=5, 867b50=0t, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_4d42d0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x4d42d0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x4d42d0:
        R.esp = (R.sub((R.esp >>> 0), 0x200, 32)) | 0; // 4d42d0: sub esp, 0x200
        R.push((R.ebx >>> 0)); // 4d42d6: push ebx
        R.push((R.ebp >>> 0)); // 4d42d7: push ebp
        R.ebp = (R.m.u32(((R.esp + 0x214) | 0) >>> 0)) | 0; // 4d42d8: mov ebp, dword ptr [esp + 0x214]
        R.push((R.esi >>> 0)); // 4d42df: push esi
        R.push((R.edi >>> 0)); // 4d42e0: push edi
        R.edi = ((R.ecx >>> 0)) | 0; // 4d42e1: mov edi, ecx
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 4d42e3: test ebp, ebp
        if (!R.zf) { pc = 0x4d42eb; continue; } // 4d42e5: jne 0x4d42eb
        pc = 0x4d42e7; continue;
      case 0x4d42e7:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 4d42e7: xor eax, eax
        pc = 0x4d4323; continue; // 4d42e9: jmp 0x4d4323
      case 0x4d42eb:
        R.eax = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 4d42eb: mov eax, dword ptr [ebp]
        R.ecx = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 4d42ee: mov ecx, dword ptr [0xae2364]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 4d42f4: cmp eax, ecx
        if (R.cL) { pc = 0x4d42fc; continue; } // 4d42f6: jl 0x4d42fc
        pc = 0x4d42f8; continue;
      case 0x4d42f8:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 4d42f8: xor eax, eax
        pc = 0x4d4323; continue; // 4d42fa: jmp 0x4d4323
      case 0x4d42fc:
        R.edx = (R.m.u32(((0xae2d0c) | 0) >>> 0)) | 0; // 4d42fc: mov edx, dword ptr [0xae2d0c]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 4d4302: lea ecx, [eax + eax*4]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 4d4305: shl ecx, 4
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 4d4308: sub ecx, eax
        R.eax = (R.m.u32(((R.ecx + R.edx) | 0) >>> 0)) | 0; // 4d430a: mov eax, dword ptr [ecx + edx]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d430d: test eax, eax
        if (!R.cL) { pc = 0x4d4315; continue; } // 4d430f: jge 0x4d4315
        pc = 0x4d4311; continue;
      case 0x4d4311:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 4d4311: xor eax, eax
        pc = 0x4d4323; continue; // 4d4313: jmp 0x4d4323
      case 0x4d4315:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 4d4315: mov ecx, dword ptr [0xae1050]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4d431b: lea eax, [eax + eax*4]
        R.eax = (R.shl((R.eax >>> 0), 0x4, 32)) | 0; // 4d431e: shl eax, 4
        R.eax = (R.add((R.eax >>> 0), R.m.u32(((R.ecx) | 0) >>> 0), 32)) | 0; // 4d4321: add eax, dword ptr [ecx]
        pc = 0x4d4323; continue;
      case 0x4d4323:
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d4323: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 4d4325: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x4d4344; continue; } // 4d432a: je 0x4d4344
        pc = 0x4d432c; continue;
      case 0x4d432c:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 4d432c: mov eax, dword ptr [eax + 4]
        R.ecx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 4d432f: mov ecx, dword ptr [0xae23b4]
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 4d4335: lea edx, [eax + eax*8]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 4d4338: shl edx, 4
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 4d433b: add edx, eax
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 4d433d: add ecx, eax
        R.esi = (((R.ecx + R.edx * 4) | 0)) | 0; // 4d433f: lea esi, [ecx + edx*4]
        pc = 0x4d4346; continue; // 4d4342: jmp 0x4d4346
      case 0x4d4344:
        R.esi = (R.logic((R.esi >>> 0) ^ (R.esi >>> 0), 32)) | 0; // 4d4344: xor esi, esi
        pc = 0x4d4346; continue;
      case 0x4d4346:
        R.push(0x0); // 4d4346: push 0
        R.push(0x0); // 4d4348: push 0
        R.push(0x1); // 4d434a: push 1
        R.push(0x0); // 4d434c: push 0
        R.push((R.esi >>> 0)); // 4d434e: push esi
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 4d434f: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 4d4354: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d4357: test eax, eax
        if (!R.zf) { pc = 0x4d43ce; continue; } // 4d4359: jne 0x4d43ce
        pc = 0x4d435b; continue;
      case 0x4d435b:
        R.edx = (((R.esp + 0x10) | 0)) | 0; // 4d435b: lea edx, [esp + 0x10]
        R.eax = (((R.esp + 0x110) | 0)) | 0; // 4d435f: lea eax, [esp + 0x110]
        R.push((R.edx >>> 0)); // 4d4366: push edx
        R.push((R.eax >>> 0)); // 4d4367: push eax
        R.push(0x0); // 4d4368: push 0
        R.push(0x0); // 4d436a: push 0
        R.push(0x9a8190); // 4d436c: push 0x9a8190
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 4d4371: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 4d4376: add esp, 0x14
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 4d4379: lea ecx, [esp + 0x10]
        R.edx = (((R.esp + 0x110) | 0)) | 0; // 4d437d: lea edx, [esp + 0x110]
        R.push(0x1f28); // 4d4384: push 0x1f28
        R.push((R.ecx >>> 0)); // 4d4389: push ecx
        R.push((R.edx >>> 0)); // 4d438a: push edx
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 4d438b: call 0x90d130
        R.push((R.eax >>> 0)); // 4d4390: push eax
        R.push(0x9870e8); // 4d4391: push 0x9870e8
        R.push(0xae24d0); // 4d4396: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 4d439b: call 0x944c9f
        R.push(0x0); // 4d43a0: push 0
        R.push(0xae24d0); // 4d43a2: push 0xae24d0
        R.push(0x9870e0); // 4d43a7: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 4d43ac: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 4d43b1: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 4d43b4: mov dword ptr [0xb67a34], 0
        R.eax = (R.m.u32(((R.ebp + 0x52) | 0) >>> 0)) | 0; // 4d43be: mov eax, dword ptr [ebp + 0x52]
        R.edi = (R.pop()) | 0; // 4d43c1: pop edi
        R.esi = (R.pop()) | 0; // 4d43c2: pop esi
        R.ebp = (R.pop()) | 0; // 4d43c3: pop ebp
        R.ebx = (R.pop()) | 0; // 4d43c4: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 4d43c5: add esp, 0x200
        return R.ret(3); // 4d43cb: ret 0xc
      case 0x4d43ce:
        R.push((R.esi >>> 0)); // 4d43ce: push esi
        R.push((R.ebp >>> 0)); // 4d43cf: push ebp
        R.ecx = ((R.edi >>> 0)) | 0; // 4d43d0: mov ecx, edi
        R.call(0x4cf5f0, { n: 2, thisEcx: true, calleeClean: true }); // 4d43d2: call 0x4cf5f0
        R.esi = ((R.eax >>> 0)) | 0; // 4d43d7: mov esi, eax
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 4d43d9: test esi, esi
        if (R.zf) { pc = 0x4d44c5; continue; } // 4d43db: je 0x4d44c5
        pc = 0x4d43e1; continue;
      case 0x4d43e1:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x35) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d43e1: mov al, byte ptr [esi + 0x35]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x3f, 8)) & 0xff) << 0)) | 0; // 4d43e4: and al, 0x3f
        R.sub(((R.eax >>> 0) & 0xff), 0x2, 8); // 4d43e6: cmp al, 2
        if (!R.zf) { pc = 0x4d44c5; continue; } // 4d43e8: jne 0x4d44c5
        pc = 0x4d43ee; continue;
      case 0x4d43ee:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x49) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d43ee: mov al, byte ptr [esi + 0x49]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 4d43f1: test al, al
        if (!R.zf) { pc = 0x4d44c5; continue; } // 4d43f3: jne 0x4d44c5
        pc = 0x4d43f9; continue;
      case 0x4d43f9:
        R.ebx = (R.m.u32(((R.ebp + 0x52) | 0) >>> 0)) | 0; // 4d43f9: mov ebx, dword ptr [ebp + 0x52]
        R.ecx = ((R.esi >>> 0)) | 0; // 4d43fc: mov ecx, esi
        R.call(0x867b50, { n: 0, thisEcx: true, calleeClean: false }); // 4d43fe: call 0x867b50
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d4403: test eax, eax
        if (R.zf) { pc = 0x4d4410; continue; } // 4d4405: je 0x4d4410
        pc = 0x4d4407; continue;
      case 0x4d4407:
        R.eax = (R.m.u32(((R.esi + 0x21) | 0) >>> 0)) | 0; // 4d4407: mov eax, dword ptr [esi + 0x21]
        R.sub((R.ebx >>> 0), (R.eax >>> 0), 32); // 4d440a: cmp ebx, eax
        if (R.cL) { pc = 0x4d4410; continue; } // 4d440c: jl 0x4d4410
        pc = 0x4d440e; continue;
      case 0x4d440e:
        R.ebx = ((R.eax >>> 0)) | 0; // 4d440e: mov ebx, eax
        pc = 0x4d4410; continue;
      case 0x4d4410:
        R.ecx = (R.m.u32(((R.esp + 0x218) | 0) >>> 0)) | 0; // 4d4410: mov ecx, dword ptr [esp + 0x218]
        R.edx = (R.m.u32(((R.esp + 0x214) | 0) >>> 0)) | 0; // 4d4417: mov edx, dword ptr [esp + 0x214]
        R.push(0x1); // 4d441e: push 1
        R.push(0x1); // 4d4420: push 1
        R.push(0x0); // 4d4422: push 0
        R.push((R.ebp >>> 0)); // 4d4424: push ebp
        R.push((R.ecx >>> 0)); // 4d4425: push ecx
        R.push((R.edx >>> 0)); // 4d4426: push edx
        R.ecx = ((R.edi >>> 0)) | 0; // 4d4427: mov ecx, edi
        R.call(0x4d1600, { n: 6, thisEcx: true, calleeClean: true }); // 4d4429: call 0x4d1600
        R.edi = ((R.eax >>> 0)) | 0; // 4d442e: mov edi, eax
        R.sub((R.edi >>> 0), (R.ebx >>> 0), 32); // 4d4430: cmp edi, ebx
        if (!R.cLE) { pc = 0x4d4436; continue; } // 4d4432: jg 0x4d4436
        pc = 0x4d4434; continue;
      case 0x4d4434:
        R.edi = ((R.ebx >>> 0)) | 0; // 4d4434: mov edi, ebx
        pc = 0x4d4436; continue;
      case 0x4d4436:
        R.ecx = ((R.esi >>> 0)) | 0; // 4d4436: mov ecx, esi
        R.call(0x867b50, { n: 0, thisEcx: true, calleeClean: false }); // 4d4438: call 0x867b50
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d443d: test eax, eax
        if (R.zf) { pc = 0x4d444a; continue; } // 4d443f: je 0x4d444a
        pc = 0x4d4441; continue;
      case 0x4d4441:
        R.eax = (R.m.u32(((R.esi + 0x21) | 0) >>> 0)) | 0; // 4d4441: mov eax, dword ptr [esi + 0x21]
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 4d4444: cmp edi, eax
        if (R.cL) { pc = 0x4d444a; continue; } // 4d4446: jl 0x4d444a
        pc = 0x4d4448; continue;
      case 0x4d4448:
        R.edi = ((R.eax >>> 0)) | 0; // 4d4448: mov edi, eax
        pc = 0x4d444a; continue;
      case 0x4d444a:
        R.push(0x0); // 4d444a: push 0
        R.push((R.ebp >>> 0)); // 4d444c: push ebp
        R.call(0x544520, { n: 2, thisEcx: false, calleeClean: false }); // 4d444d: call 0x544520
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 4d4452: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d4455: test eax, eax
        if (R.zf) { pc = 0x4d4468; continue; } // 4d4457: je 0x4d4468
        pc = 0x4d4459; continue;
      case 0x4d4459:
        R.edi = (R.pop()) | 0; // 4d4459: pop edi
        R.esi = (R.pop()) | 0; // 4d445a: pop esi
        R.eax = ((R.ebx >>> 0)) | 0; // 4d445b: mov eax, ebx
        R.ebp = (R.pop()) | 0; // 4d445d: pop ebp
        R.ebx = (R.pop()) | 0; // 4d445e: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 4d445f: add esp, 0x200
        return R.ret(3); // 4d4465: ret 0xc
      case 0x4d4468:
        R.logic(R.m.u8(((R.esi + 0x4e) | 0) >>> 0) & 0x4, 8); // 4d4468: test byte ptr [esi + 0x4e], 4
        if (!R.zf) { pc = 0x4d447d; continue; } // 4d446c: jne 0x4d447d
        pc = 0x4d446e; continue;
      case 0x4d446e:
        R.edi = (R.pop()) | 0; // 4d446e: pop edi
        R.esi = (R.pop()) | 0; // 4d446f: pop esi
        R.eax = ((R.ebx >>> 0)) | 0; // 4d4470: mov eax, ebx
        R.ebp = (R.pop()) | 0; // 4d4472: pop ebp
        R.ebx = (R.pop()) | 0; // 4d4473: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 4d4474: add esp, 0x200
        return R.ret(3); // 4d447a: ret 0xc
      case 0x4d447d:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d447d: mov al, byte ptr [esi + 0x4f]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d4480: and al, 0xf0
        R.sub(((R.eax >>> 0) & 0xff), 0x10, 8); // 4d4482: cmp al, 0x10
        if (R.zf) { pc = 0x4d44b6; continue; } // 4d4484: je 0x4d44b6
        pc = 0x4d4486; continue;
      case 0x4d4486:
        R.sub(((R.eax >>> 0) & 0xff), 0x50, 8); // 4d4486: cmp al, 0x50
        if (R.zf) { pc = 0x4d44b6; continue; } // 4d4488: je 0x4d44b6
        pc = 0x4d448a; continue;
      case 0x4d448a:
        R.sub(((R.eax >>> 0) & 0xff), 0x20, 8); // 4d448a: cmp al, 0x20
        if (R.zf) { pc = 0x4d44a1; continue; } // 4d448c: je 0x4d44a1
        pc = 0x4d448e; continue;
      case 0x4d448e:
        R.sub(((R.eax >>> 0) & 0xff), 0x30, 8); // 4d448e: cmp al, 0x30
        if (R.zf) { pc = 0x4d44a1; continue; } // 4d4490: je 0x4d44a1
        pc = 0x4d4492; continue;
      case 0x4d4492:
        R.edi = (R.pop()) | 0; // 4d4492: pop edi
        R.esi = (R.pop()) | 0; // 4d4493: pop esi
        R.eax = ((R.ebx >>> 0)) | 0; // 4d4494: mov eax, ebx
        R.ebp = (R.pop()) | 0; // 4d4496: pop ebp
        R.ebx = (R.pop()) | 0; // 4d4497: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 4d4498: add esp, 0x200
        return R.ret(3); // 4d449e: ret 0xc
      case 0x4d44a1:
        R.eax = (((R.edi + R.ebx) | 0)) | 0; // 4d44a1: lea eax, [edi + ebx]
        R.edi = (R.pop()) | 0; // 4d44a4: pop edi
        R.edx = R.eax < 0 ? -1 : 0; // 4d44a5: cdq 
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 4d44a6: sub eax, edx
        R.esi = (R.pop()) | 0; // 4d44a8: pop esi
        R.ebp = (R.pop()) | 0; // 4d44a9: pop ebp
        R.ebx = (R.pop()) | 0; // 4d44aa: pop ebx
        R.eax = (R.sar((R.eax >>> 0), 0x1, 32)) | 0; // 4d44ab: sar eax, 1
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 4d44ad: add esp, 0x200
        return R.ret(3); // 4d44b3: ret 0xc
      case 0x4d44b6:
        R.eax = ((R.edi >>> 0)) | 0; // 4d44b6: mov eax, edi
        R.edi = (R.pop()) | 0; // 4d44b8: pop edi
        R.esi = (R.pop()) | 0; // 4d44b9: pop esi
        R.ebp = (R.pop()) | 0; // 4d44ba: pop ebp
        R.ebx = (R.pop()) | 0; // 4d44bb: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 4d44bc: add esp, 0x200
        return R.ret(3); // 4d44c2: ret 0xc
      case 0x4d44c5:
        R.edi = (R.pop()) | 0; // 4d44c5: pop edi
        R.esi = (R.pop()) | 0; // 4d44c6: pop esi
        R.ebp = (R.pop()) | 0; // 4d44c7: pop ebp
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 4d44c8: xor eax, eax
        R.ebx = (R.pop()) | 0; // 4d44ca: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 4d44cb: add esp, 0x200
        return R.ret(3); // 4d44d1: ret 0xc
      default: throw new Error(`f_4d42d0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
