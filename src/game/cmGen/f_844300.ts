// 0x844300 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 5e8290=9, 600a50=5, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_844300(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x844300;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x844300:
        R.esp = (R.sub((R.esp >>> 0), 0x200, 32)) | 0; // 844300: sub esp, 0x200
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.esp + 0x208) | 0) >>> 0)) & 0xff) << 0)) | 0; // 844306: mov dl, byte ptr [esp + 0x208]
        R.ecx = (0xf) | 0; // 84430d: mov ecx, 0xf
        R.push((R.esi >>> 0)); // 844312: push esi
        R.esi = (R.m.u32(((R.esp + 0x208) | 0) >>> 0)) | 0; // 844313: mov esi, dword ptr [esp + 0x208]
        R.eax = (R.m.u32(((R.esi + 0x61) | 0) >>> 0)) | 0; // 84431a: mov eax, dword ptr [esi + 0x61]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84431d: test eax, eax
        if (!R.zf) { pc = 0x844329; continue; } // 84431f: jne 0x844329
        pc = 0x844321; continue;
      case 0x844321:
        R.sub(((R.edx >>> 0) & 0xff), ((R.ecx >>> 0) & 0xff), 8); // 844321: cmp dl, cl
        if (!R.zf) { pc = 0x8444e8; continue; } // 844323: jne 0x8444e8
        pc = 0x844329; continue;
      case 0x844329:
        R.edx = (((((R.edx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 844329: movsx edx, dl
        R.sub((R.edx >>> 0), (R.ecx >>> 0), 32); // 84432c: cmp edx, ecx
        if (!R.cBE) { pc = 0x844485; continue; } // 84432e: ja 0x844485
        pc = 0x844334; continue;
      case 0x844334:
        pc = [0x84433b, 0x844343, 0x844354, 0x844376, 0x844365, 0x84437e, 0x84438c, 0x84439a, 0x84439f, 0x8443ad, 0x8443bb, 0x8443c0, 0x8443de, 0x8443fc, 0x84441e, 0x844433][R.edx >>> 0]; continue; // 844334: jmp dword ptr [edx*4 + 0x8444f4]
      case 0x84433b:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0xf) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84433b: mov dl, byte ptr [eax + 0xf]
        pc = 0x84440a; continue; // 84433e: jmp 0x84440a
      case 0x844343:
        R.sub(R.m.u8(((R.eax + 0x10) | 0) >>> 0), ((R.ecx >>> 0) & 0xff), 8); // 844343: cmp byte ptr [eax + 0x10], cl
        if (R.cL) { pc = 0x8444e8; continue; } // 844346: jl 0x8444e8
        pc = 0x84434c; continue;
      case 0x84434c:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x19) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84434c: mov dl, byte ptr [eax + 0x19]
        pc = 0x84440a; continue; // 84434f: jmp 0x84440a
      case 0x844354:
        R.sub(R.m.u8(((R.eax + 0x11) | 0) >>> 0), ((R.ecx >>> 0) & 0xff), 8); // 844354: cmp byte ptr [eax + 0x11], cl
        if (R.cL) { pc = 0x8444e8; continue; } // 844357: jl 0x8444e8
        pc = 0x84435d; continue;
      case 0x84435d:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x18) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84435d: mov dl, byte ptr [eax + 0x18]
        pc = 0x84440a; continue; // 844360: jmp 0x84440a
      case 0x844365:
        R.sub(R.m.u8(((R.eax + 0x11) | 0) >>> 0), ((R.ecx >>> 0) & 0xff), 8); // 844365: cmp byte ptr [eax + 0x11], cl
        if (R.cL) { pc = 0x8444e8; continue; } // 844368: jl 0x8444e8
        pc = 0x84436e; continue;
      case 0x84436e:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x19) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84436e: mov dl, byte ptr [eax + 0x19]
        pc = 0x84440a; continue; // 844371: jmp 0x84440a
      case 0x844376:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x11) | 0) >>> 0)) & 0xff) << 0)) | 0; // 844376: mov dl, byte ptr [eax + 0x11]
        pc = 0x8443ff; continue; // 844379: jmp 0x8443ff
      case 0x84437e:
        R.sub(R.m.u8(((R.eax + 0x16) | 0) >>> 0), ((R.ecx >>> 0) & 0xff), 8); // 84437e: cmp byte ptr [eax + 0x16], cl
        if (R.cL) { pc = 0x8444e8; continue; } // 844381: jl 0x8444e8
        pc = 0x844387; continue;
      case 0x844387:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x18) | 0) >>> 0)) & 0xff) << 0)) | 0; // 844387: mov dl, byte ptr [eax + 0x18]
        pc = 0x84440a; continue; // 84438a: jmp 0x84440a
      case 0x84438c:
        R.sub(R.m.u8(((R.eax + 0x12) | 0) >>> 0), ((R.ecx >>> 0) & 0xff), 8); // 84438c: cmp byte ptr [eax + 0x12], cl
        if (R.cL) { pc = 0x8444e8; continue; } // 84438f: jl 0x8444e8
        pc = 0x844395; continue;
      case 0x844395:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x19) | 0) >>> 0)) & 0xff) << 0)) | 0; // 844395: mov dl, byte ptr [eax + 0x19]
        pc = 0x84440a; continue; // 844398: jmp 0x84440a
      case 0x84439a:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x16) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84439a: mov dl, byte ptr [eax + 0x16]
        pc = 0x8443ff; continue; // 84439d: jmp 0x8443ff
      case 0x84439f:
        R.sub(R.m.u8(((R.eax + 0x13) | 0) >>> 0), ((R.ecx >>> 0) & 0xff), 8); // 84439f: cmp byte ptr [eax + 0x13], cl
        if (R.cL) { pc = 0x8444e8; continue; } // 8443a2: jl 0x8444e8
        pc = 0x8443a8; continue;
      case 0x8443a8:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x18) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8443a8: mov dl, byte ptr [eax + 0x18]
        pc = 0x84440a; continue; // 8443ab: jmp 0x84440a
      case 0x8443ad:
        R.sub(R.m.u8(((R.eax + 0x13) | 0) >>> 0), ((R.ecx >>> 0) & 0xff), 8); // 8443ad: cmp byte ptr [eax + 0x13], cl
        if (R.cL) { pc = 0x8444e8; continue; } // 8443b0: jl 0x8444e8
        pc = 0x8443b6; continue;
      case 0x8443b6:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x19) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8443b6: mov dl, byte ptr [eax + 0x19]
        pc = 0x84440a; continue; // 8443b9: jmp 0x84440a
      case 0x8443bb:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x13) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8443bb: mov dl, byte ptr [eax + 0x13]
        pc = 0x8443ff; continue; // 8443be: jmp 0x8443ff
      case 0x8443c0:
        R.sub(R.m.u8(((R.eax + 0x14) | 0) >>> 0), ((R.ecx >>> 0) & 0xff), 8); // 8443c0: cmp byte ptr [eax + 0x14], cl
        if (R.cL) { pc = 0x8444e8; continue; } // 8443c3: jl 0x8444e8
        pc = 0x8443c9; continue;
      case 0x8443c9:
        R.sub(R.m.u8(((R.eax + 0x18) | 0) >>> 0), ((R.ecx >>> 0) & 0xff), 8); // 8443c9: cmp byte ptr [eax + 0x18], cl
        if (R.cL) { pc = 0x8444e8; continue; } // 8443cc: jl 0x8444e8
        pc = 0x8443d2; continue;
      case 0x8443d2:
        R.eax = ((R.eax & 0xffffff00) | (((0x1) & 0xff) << 0)) | 0; // 8443d2: mov al, 1
        R.esi = (R.pop()) | 0; // 8443d4: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 8443d5: add esp, 0x200
        return R.ret(2); // 8443db: ret 8
      case 0x8443de:
        R.sub(R.m.u8(((R.eax + 0x14) | 0) >>> 0), ((R.ecx >>> 0) & 0xff), 8); // 8443de: cmp byte ptr [eax + 0x14], cl
        if (R.cL) { pc = 0x8444e8; continue; } // 8443e1: jl 0x8444e8
        pc = 0x8443e7; continue;
      case 0x8443e7:
        R.sub(R.m.u8(((R.eax + 0x19) | 0) >>> 0), ((R.ecx >>> 0) & 0xff), 8); // 8443e7: cmp byte ptr [eax + 0x19], cl
        if (R.cL) { pc = 0x8444e8; continue; } // 8443ea: jl 0x8444e8
        pc = 0x8443f0; continue;
      case 0x8443f0:
        R.eax = ((R.eax & 0xffffff00) | (((0x1) & 0xff) << 0)) | 0; // 8443f0: mov al, 1
        R.esi = (R.pop()) | 0; // 8443f2: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 8443f3: add esp, 0x200
        return R.ret(2); // 8443f9: ret 8
      case 0x8443fc:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x14) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8443fc: mov dl, byte ptr [eax + 0x14]
        pc = 0x8443ff; continue;
      case 0x8443ff:
        R.sub(((R.edx >>> 0) & 0xff), ((R.ecx >>> 0) & 0xff), 8); // 8443ff: cmp dl, cl
        if (R.cL) { pc = 0x8444e8; continue; } // 844401: jl 0x8444e8
        pc = 0x844407; continue;
      case 0x844407:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x17) | 0) >>> 0)) & 0xff) << 0)) | 0; // 844407: mov dl, byte ptr [eax + 0x17]
        pc = 0x84440a; continue;
      case 0x84440a:
        R.sub(((R.edx >>> 0) & 0xff), ((R.ecx >>> 0) & 0xff), 8); // 84440a: cmp dl, cl
        if (R.cL) { pc = 0x8444e8; continue; } // 84440c: jl 0x8444e8
        pc = 0x844412; continue;
      case 0x844412:
        R.eax = ((R.eax & 0xffffff00) | (((0x1) & 0xff) << 0)) | 0; // 844412: mov al, 1
        R.esi = (R.pop()) | 0; // 844414: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 844415: add esp, 0x200
        return R.ret(2); // 84441b: ret 8
      case 0x84441e:
        R.sub(R.m.u8(((R.eax + 0x15) | 0) >>> 0), ((R.ecx >>> 0) & 0xff), 8); // 84441e: cmp byte ptr [eax + 0x15], cl
        if (R.cL) { pc = 0x8444e8; continue; } // 844421: jl 0x8444e8
        pc = 0x844427; continue;
      case 0x844427:
        R.eax = ((R.eax & 0xffffff00) | (((0x1) & 0xff) << 0)) | 0; // 844427: mov al, 1
        R.esi = (R.pop()) | 0; // 844429: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 84442a: add esp, 0x200
        return R.ret(2); // 844430: ret 8
      case 0x844433:
        R.eax = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 844433: mov eax, dword ptr [esi + 0x39]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 844436: test eax, eax
        if (R.zf) { pc = 0x844464; continue; } // 844438: je 0x844464
        pc = 0x84443a; continue;
      case 0x84443a:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.esi + 0x3d) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84443a: mov dl, byte ptr [esi + 0x3d]
        R.sub(((R.edx >>> 0) & 0xff), 0xb, 8); // 84443d: cmp dl, 0xb
        if (R.zf) { pc = 0x84444b; continue; } // 844440: je 0x84444b
        pc = 0x844442; continue;
      case 0x844442:
        R.sub(((R.edx >>> 0) & 0xff), ((R.ecx >>> 0) & 0xff), 8); // 844442: cmp dl, cl
        if (R.zf) { pc = 0x84444b; continue; } // 844444: je 0x84444b
        pc = 0x844446; continue;
      case 0x844446:
        R.sub(((R.edx >>> 0) & 0xff), 0xd, 8); // 844446: cmp dl, 0xd
        if (!R.zf) { pc = 0x844464; continue; } // 844449: jne 0x844464
        pc = 0x84444b; continue;
      case 0x84444b:
        R.push(0x0); // 84444b: push 0
        R.push(0x0); // 84444d: push 0
        R.push(0x1); // 84444f: push 1
        R.push(0x0); // 844451: push 0
        R.push((R.eax >>> 0)); // 844453: push eax
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 844454: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 844459: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84445c: test eax, eax
        if (!R.zf) { pc = 0x8444e8; continue; } // 84445e: jne 0x8444e8
        pc = 0x844464; continue;
      case 0x844464:
        R.eax = (R.m.u32(((R.esi + 0x69) | 0) >>> 0)) | 0; // 844464: mov eax, dword ptr [esi + 0x69]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 844467: test eax, eax
        if (R.zf) { pc = 0x8444e8; continue; } // 844469: je 0x8444e8
        pc = 0x84446b; continue;
      case 0x84446b:
        R.eax = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 84446b: mov eax, dword ptr [0xae2364]
        R.ecx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 844470: mov ecx, dword ptr [esi]
        R.eax = (R.add((R.eax >>> 0), 0xfffffff0, 32)) | 0; // 844472: add eax, -0x10
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 844475: cmp ecx, eax
        if (!R.cL) { pc = 0x8444e8; continue; } // 844477: jge 0x8444e8
        pc = 0x844479; continue;
      case 0x844479:
        R.eax = ((R.eax & 0xffffff00) | (((0x1) & 0xff) << 0)) | 0; // 844479: mov al, 1
        R.esi = (R.pop()) | 0; // 84447b: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 84447c: add esp, 0x200
        return R.ret(2); // 844482: ret 8
      case 0x844485:
        R.ecx = (((R.esp + 0x4) | 0)) | 0; // 844485: lea ecx, [esp + 4]
        R.edx = (((R.esp + 0x104) | 0)) | 0; // 844489: lea edx, [esp + 0x104]
        R.push((R.ecx >>> 0)); // 844490: push ecx
        R.push((R.edx >>> 0)); // 844491: push edx
        R.push(0x0); // 844492: push 0
        R.push(0x0); // 844494: push 0
        R.push(0xa825a4); // 844496: push 0xa825a4
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 84449b: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8444a0: add esp, 0x14
        R.eax = (((R.esp + 0x4) | 0)) | 0; // 8444a3: lea eax, [esp + 4]
        R.ecx = (((R.esp + 0x104) | 0)) | 0; // 8444a7: lea ecx, [esp + 0x104]
        R.push(0x1c3f); // 8444ae: push 0x1c3f
        R.push((R.eax >>> 0)); // 8444b3: push eax
        R.push((R.ecx >>> 0)); // 8444b4: push ecx
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 8444b5: call 0x90d130
        R.push((R.eax >>> 0)); // 8444ba: push eax
        R.push(0x9870e8); // 8444bb: push 0x9870e8
        R.push(0xae24d0); // 8444c0: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 8444c5: call 0x944c9f
        R.push(0x0); // 8444ca: push 0
        R.push(0xae24d0); // 8444cc: push 0xae24d0
        R.push(0x9870e0); // 8444d1: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 8444d6: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 8444db: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 8444de: mov dword ptr [0xb67a34], 0
        pc = 0x8444e8; continue;
      case 0x8444e8:
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 8444e8: xor al, al
        R.esi = (R.pop()) | 0; // 8444ea: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 8444eb: add esp, 0x200
        return R.ret(2); // 8444f1: ret 8
      default: throw new Error(`f_844300: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
