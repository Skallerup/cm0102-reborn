// 0x844300 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 5e8290=9, 600a50=5, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x844300, 0x844321, 0x844329, 0x844334, 0x84433b, 0x844343, 0x84434c, 0x844354, 0x84435d, 0x844365, 0x84436e, 0x844376, 0x84437e, 0x844387, 0x84438c, 0x844395, 0x84439a, 0x84439f, 0x8443a8, 0x8443ad, 0x8443b6, 0x8443bb, 0x8443c0, 0x8443c9, 0x8443d2, 0x8443de, 0x8443e7, 0x8443f0, 0x8443fc, 0x8443ff, 0x844407, 0x84440a, 0x844412, 0x84441e, 0x844427, 0x844433, 0x84443a, 0x844442, 0x844446, 0x84444b, 0x844464, 0x84446b, 0x844479, 0x844485, 0x8444e8]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3]);
function f_844300_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 844300
        R.esp = (R.sub((R.esp >>> 0), 0x200, 32)) | 0; // 844300: sub esp, 0x200
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.esp + 0x208) | 0) >>> 0)) & 0xff) << 0)) | 0; // 844306: mov dl, byte ptr [esp + 0x208]
        R.ecx = (0xf) | 0; // 84430d: mov ecx, 0xf
        R.push((R.esi >>> 0)); // 844312: push esi
        R.esi = (R.m.u32(((R.esp + 0x208) | 0) >>> 0)) | 0; // 844313: mov esi, dword ptr [esp + 0x208]
        R.eax = (R.m.u32(((R.esi + 0x61) | 0) >>> 0)) | 0; // 84431a: mov eax, dword ptr [esi + 0x61]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84431d: test eax, eax
        if (!R.zf) { pc = 2; continue; } // 84431f: jne 0x844329
        pc = 1; continue;
      case 1: // 844321
        R.sub(((R.edx >>> 0) & 0xff), ((R.ecx >>> 0) & 0xff), 8); // 844321: cmp dl, cl
        if (!R.zf) { pc = 44; continue; } // 844323: jne 0x8444e8
        pc = 2; continue;
      case 2: // 844329
        R.edx = (((((R.edx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 844329: movsx edx, dl
        R.sub((R.edx >>> 0), (R.ecx >>> 0), 32); // 84432c: cmp edx, ecx
        if (!R.cBE) { pc = 43; continue; } // 84432e: ja 0x844485
        pc = 3; continue;
      case 3: // 844334
        pc = [4, 5, 7, 11, 9, 12, 14, 16, 17, 19, 21, 22, 25, 28, 33, 35][R.edx >>> 0] ?? -2; continue; // 844334: jmp dword ptr [edx*4 + 0x8444f4]
      case 4: // 84433b
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0xf) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84433b: mov dl, byte ptr [eax + 0xf]
        pc = 31; continue; // 84433e: jmp 0x84440a
      case 5: // 844343
        R.sub(R.m.u8(((R.eax + 0x10) | 0) >>> 0), ((R.ecx >>> 0) & 0xff), 8); // 844343: cmp byte ptr [eax + 0x10], cl
        if (R.cL) { pc = 44; continue; } // 844346: jl 0x8444e8
        pc = 6; continue;
      case 6: // 84434c
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x19) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84434c: mov dl, byte ptr [eax + 0x19]
        pc = 31; continue; // 84434f: jmp 0x84440a
      case 7: // 844354
        R.sub(R.m.u8(((R.eax + 0x11) | 0) >>> 0), ((R.ecx >>> 0) & 0xff), 8); // 844354: cmp byte ptr [eax + 0x11], cl
        if (R.cL) { pc = 44; continue; } // 844357: jl 0x8444e8
        pc = 8; continue;
      case 8: // 84435d
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x18) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84435d: mov dl, byte ptr [eax + 0x18]
        pc = 31; continue; // 844360: jmp 0x84440a
      case 9: // 844365
        R.sub(R.m.u8(((R.eax + 0x11) | 0) >>> 0), ((R.ecx >>> 0) & 0xff), 8); // 844365: cmp byte ptr [eax + 0x11], cl
        if (R.cL) { pc = 44; continue; } // 844368: jl 0x8444e8
        pc = 10; continue;
      case 10: // 84436e
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x19) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84436e: mov dl, byte ptr [eax + 0x19]
        pc = 31; continue; // 844371: jmp 0x84440a
      case 11: // 844376
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x11) | 0) >>> 0)) & 0xff) << 0)) | 0; // 844376: mov dl, byte ptr [eax + 0x11]
        pc = 29; continue; // 844379: jmp 0x8443ff
      case 12: // 84437e
        R.sub(R.m.u8(((R.eax + 0x16) | 0) >>> 0), ((R.ecx >>> 0) & 0xff), 8); // 84437e: cmp byte ptr [eax + 0x16], cl
        if (R.cL) { pc = 44; continue; } // 844381: jl 0x8444e8
        pc = 13; continue;
      case 13: // 844387
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x18) | 0) >>> 0)) & 0xff) << 0)) | 0; // 844387: mov dl, byte ptr [eax + 0x18]
        pc = 31; continue; // 84438a: jmp 0x84440a
      case 14: // 84438c
        R.sub(R.m.u8(((R.eax + 0x12) | 0) >>> 0), ((R.ecx >>> 0) & 0xff), 8); // 84438c: cmp byte ptr [eax + 0x12], cl
        if (R.cL) { pc = 44; continue; } // 84438f: jl 0x8444e8
        pc = 15; continue;
      default: return pc;
    }
  }
}
function f_844300_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 15: // 844395
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x19) | 0) >>> 0)) & 0xff) << 0)) | 0; // 844395: mov dl, byte ptr [eax + 0x19]
        pc = 31; continue; // 844398: jmp 0x84440a
      case 16: // 84439a
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x16) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84439a: mov dl, byte ptr [eax + 0x16]
        pc = 29; continue; // 84439d: jmp 0x8443ff
      case 17: // 84439f
        R.sub(R.m.u8(((R.eax + 0x13) | 0) >>> 0), ((R.ecx >>> 0) & 0xff), 8); // 84439f: cmp byte ptr [eax + 0x13], cl
        if (R.cL) { pc = 44; continue; } // 8443a2: jl 0x8444e8
        pc = 18; continue;
      case 18: // 8443a8
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x18) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8443a8: mov dl, byte ptr [eax + 0x18]
        pc = 31; continue; // 8443ab: jmp 0x84440a
      case 19: // 8443ad
        R.sub(R.m.u8(((R.eax + 0x13) | 0) >>> 0), ((R.ecx >>> 0) & 0xff), 8); // 8443ad: cmp byte ptr [eax + 0x13], cl
        if (R.cL) { pc = 44; continue; } // 8443b0: jl 0x8444e8
        pc = 20; continue;
      case 20: // 8443b6
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x19) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8443b6: mov dl, byte ptr [eax + 0x19]
        pc = 31; continue; // 8443b9: jmp 0x84440a
      case 21: // 8443bb
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x13) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8443bb: mov dl, byte ptr [eax + 0x13]
        pc = 29; continue; // 8443be: jmp 0x8443ff
      case 22: // 8443c0
        R.sub(R.m.u8(((R.eax + 0x14) | 0) >>> 0), ((R.ecx >>> 0) & 0xff), 8); // 8443c0: cmp byte ptr [eax + 0x14], cl
        if (R.cL) { pc = 44; continue; } // 8443c3: jl 0x8444e8
        pc = 23; continue;
      case 23: // 8443c9
        R.sub(R.m.u8(((R.eax + 0x18) | 0) >>> 0), ((R.ecx >>> 0) & 0xff), 8); // 8443c9: cmp byte ptr [eax + 0x18], cl
        if (R.cL) { pc = 44; continue; } // 8443cc: jl 0x8444e8
        pc = 24; continue;
      case 24: // 8443d2
        R.eax = ((R.eax & 0xffffff00) | (((0x1) & 0xff) << 0)) | 0; // 8443d2: mov al, 1
        R.esi = (R.pop()) | 0; // 8443d4: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 8443d5: add esp, 0x200
        R.rv = R.ret(2); return -1; // 8443db: ret 8
      case 25: // 8443de
        R.sub(R.m.u8(((R.eax + 0x14) | 0) >>> 0), ((R.ecx >>> 0) & 0xff), 8); // 8443de: cmp byte ptr [eax + 0x14], cl
        if (R.cL) { pc = 44; continue; } // 8443e1: jl 0x8444e8
        pc = 26; continue;
      case 26: // 8443e7
        R.sub(R.m.u8(((R.eax + 0x19) | 0) >>> 0), ((R.ecx >>> 0) & 0xff), 8); // 8443e7: cmp byte ptr [eax + 0x19], cl
        if (R.cL) { pc = 44; continue; } // 8443ea: jl 0x8444e8
        pc = 27; continue;
      case 27: // 8443f0
        R.eax = ((R.eax & 0xffffff00) | (((0x1) & 0xff) << 0)) | 0; // 8443f0: mov al, 1
        R.esi = (R.pop()) | 0; // 8443f2: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 8443f3: add esp, 0x200
        R.rv = R.ret(2); return -1; // 8443f9: ret 8
      case 28: // 8443fc
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x14) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8443fc: mov dl, byte ptr [eax + 0x14]
        pc = 29; continue;
      case 29: // 8443ff
        R.sub(((R.edx >>> 0) & 0xff), ((R.ecx >>> 0) & 0xff), 8); // 8443ff: cmp dl, cl
        if (R.cL) { pc = 44; continue; } // 844401: jl 0x8444e8
        pc = 30; continue;
      case 30: // 844407
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x17) | 0) >>> 0)) & 0xff) << 0)) | 0; // 844407: mov dl, byte ptr [eax + 0x17]
        pc = 31; continue;
      default: return pc;
    }
  }
}
function f_844300_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 31: // 84440a
        R.sub(((R.edx >>> 0) & 0xff), ((R.ecx >>> 0) & 0xff), 8); // 84440a: cmp dl, cl
        if (R.cL) { pc = 44; continue; } // 84440c: jl 0x8444e8
        pc = 32; continue;
      case 32: // 844412
        R.eax = ((R.eax & 0xffffff00) | (((0x1) & 0xff) << 0)) | 0; // 844412: mov al, 1
        R.esi = (R.pop()) | 0; // 844414: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 844415: add esp, 0x200
        R.rv = R.ret(2); return -1; // 84441b: ret 8
      case 33: // 84441e
        R.sub(R.m.u8(((R.eax + 0x15) | 0) >>> 0), ((R.ecx >>> 0) & 0xff), 8); // 84441e: cmp byte ptr [eax + 0x15], cl
        if (R.cL) { pc = 44; continue; } // 844421: jl 0x8444e8
        pc = 34; continue;
      case 34: // 844427
        R.eax = ((R.eax & 0xffffff00) | (((0x1) & 0xff) << 0)) | 0; // 844427: mov al, 1
        R.esi = (R.pop()) | 0; // 844429: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 84442a: add esp, 0x200
        R.rv = R.ret(2); return -1; // 844430: ret 8
      case 35: // 844433
        R.eax = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 844433: mov eax, dword ptr [esi + 0x39]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 844436: test eax, eax
        if (R.zf) { pc = 40; continue; } // 844438: je 0x844464
        pc = 36; continue;
      case 36: // 84443a
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.esi + 0x3d) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84443a: mov dl, byte ptr [esi + 0x3d]
        R.sub(((R.edx >>> 0) & 0xff), 0xb, 8); // 84443d: cmp dl, 0xb
        if (R.zf) { pc = 39; continue; } // 844440: je 0x84444b
        pc = 37; continue;
      case 37: // 844442
        R.sub(((R.edx >>> 0) & 0xff), ((R.ecx >>> 0) & 0xff), 8); // 844442: cmp dl, cl
        if (R.zf) { pc = 39; continue; } // 844444: je 0x84444b
        pc = 38; continue;
      case 38: // 844446
        R.sub(((R.edx >>> 0) & 0xff), 0xd, 8); // 844446: cmp dl, 0xd
        if (!R.zf) { pc = 40; continue; } // 844449: jne 0x844464
        pc = 39; continue;
      case 39: // 84444b
        R.push(0x0); // 84444b: push 0
        R.push(0x0); // 84444d: push 0
        R.push(0x1); // 84444f: push 1
        R.push(0x0); // 844451: push 0
        R.push((R.eax >>> 0)); // 844453: push eax
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 844454: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 844459: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84445c: test eax, eax
        if (!R.zf) { pc = 44; continue; } // 84445e: jne 0x8444e8
        pc = 40; continue;
      case 40: // 844464
        R.eax = (R.m.u32(((R.esi + 0x69) | 0) >>> 0)) | 0; // 844464: mov eax, dword ptr [esi + 0x69]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 844467: test eax, eax
        if (R.zf) { pc = 44; continue; } // 844469: je 0x8444e8
        pc = 41; continue;
      case 41: // 84446b
        R.eax = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 84446b: mov eax, dword ptr [0xae2364]
        R.ecx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 844470: mov ecx, dword ptr [esi]
        R.eax = (R.add((R.eax >>> 0), 0xfffffff0, 32)) | 0; // 844472: add eax, -0x10
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 844475: cmp ecx, eax
        if (!R.cL) { pc = 44; continue; } // 844477: jge 0x8444e8
        pc = 42; continue;
      default: return pc;
    }
  }
}
function f_844300_3(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 42: // 844479
        R.eax = ((R.eax & 0xffffff00) | (((0x1) & 0xff) << 0)) | 0; // 844479: mov al, 1
        R.esi = (R.pop()) | 0; // 84447b: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 84447c: add esp, 0x200
        R.rv = R.ret(2); return -1; // 844482: ret 8
      case 43: // 844485
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
        pc = 44; continue;
      case 44: // 8444e8
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 8444e8: xor al, al
        R.esi = (R.pop()) | 0; // 8444ea: pop esi
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 8444eb: add esp, 0x200
        R.rv = R.ret(2); return -1; // 8444f1: ret 8
      default: return pc;
    }
  }
}
export function f_844300(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 45) throw new Error(`f_844300: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_844300_0(R, pc); break;
      case 1: np = f_844300_1(R, pc); break;
      case 2: np = f_844300_2(R, pc); break;
      case 3: np = f_844300_3(R, pc); break;
      default: throw new Error(`f_844300: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_844300: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_844300.shared = true;
