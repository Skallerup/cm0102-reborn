// 0x598800 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4ca300=2tc, 4cf5a0=1c, 4cf5f0=2tc, 5444a0=2, 5afde0=1c, 5b02f0=1tc, 600a50=5, 8ccb80=2tc, 9452ca=1t, 945e80=4c
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x598800, 0x59884c, 0x598857, 0x59885d, 0x598868, 0x598877, 0x598887, 0x59888d, 0x598891, 0x598899, 0x59889f, 0x5988af, 0x5988cc, 0x5988e5, 0x5988f6, 0x5988fa, 0x598906, 0x59890e, 0x598912, 0x598916, 0x59891e, 0x598926, 0x598929, 0x59892d, 0x598935, 0x59893a, 0x598942, 0x598946, 0x598954, 0x59899b, 0x5989a8, 0x5989b0, 0x5989c3, 0x5989c5, 0x5989c9, 0x5989d3, 0x5989e3, 0x5989e9, 0x5989ed, 0x5989f1, 0x5989fa, 0x598a13, 0x598a18, 0x598a2b, 0x598a59, 0x598a6b, 0x598a6d, 0x598a85, 0x598aa9, 0x598ab6, 0x598ad4, 0x598ade, 0x598ae6, 0x598aef, 0x598af3, 0x598b02, 0x598b13, 0x598b1d, 0x598b24, 0x598b31, 0x598b3d, 0x598b3f, 0x598b4a, 0x598b56, 0x598b58, 0x598ba1, 0x598bac, 0x598bba, 0x598bd9, 0x598be0, 0x598bff, 0x598c06, 0x598c0c, 0x598c2b, 0x598c33, 0x598c3d, 0x598c4c, 0x598c51, 0x598c58, 0x598c71, 0x598c78, 0x598c94, 0x598cae, 0x598cf1, 0x598d09, 0x598d1f, 0x598d54, 0x598d5a, 0x598d5e, 0x598d66, 0x598d6e, 0x598d72, 0x598d8d, 0x598da9, 0x598dc3, 0x598dd8, 0x598de3, 0x598dfe, 0x598e17, 0x598e41, 0x598e4b, 0x598e67, 0x598e71, 0x598e7d, 0x598e85, 0x598e89, 0x598e91, 0x598e99, 0x598ea1, 0x598ea9, 0x598eb1, 0x598eb9, 0x598ec1, 0x598ec9, 0x598ed1, 0x598ee2, 0x598ef3, 0x598f04, 0x598f06, 0x598f1b, 0x598f3d, 0x598f3f, 0x598f43, 0x598f49, 0x598f4f, 0x598f60, 0x598f62, 0x598f66, 0x598f6c, 0x598f72, 0x598fa9, 0x598fab, 0x598fb5, 0x598fe3, 0x598ff6, 0x59900c, 0x599024, 0x599043, 0x59904b, 0x599052, 0x59906f, 0x59907c, 0x599084, 0x59909b, 0x59909d, 0x5990b0, 0x5990b8, 0x5990c4, 0x5990cc, 0x5990d4, 0x5990dc, 0x5990e4, 0x5990ec, 0x5990f4, 0x5990fc, 0x599104, 0x599109, 0x599111, 0x59911b, 0x59912b, 0x59912d, 0x599131, 0x599141, 0x599149, 0x59915e, 0x599160, 0x599164, 0x59916b, 0x59917b, 0x59917d, 0x599181, 0x599191, 0x599199, 0x5991ae, 0x5991b0, 0x5991b4, 0x5991b9, 0x5991bf, 0x5991c7, 0x5991d0, 0x5991db, 0x5991dd, 0x5991e3, 0x599214, 0x599216, 0x599224, 0x599228, 0x599239, 0x599256, 0x59925e, 0x599269, 0x59929a, 0x59929c, 0x5992a0, 0x5992a8, 0x5992aa, 0x5992b2, 0x5992b9, 0x5992c0, 0x5992cb, 0x5992d9, 0x5992e4, 0x5992e9, 0x5992eb, 0x5992ef, 0x5992f3, 0x5992f7, 0x5992f9, 0x5992fd, 0x599301, 0x59930d, 0x59931d, 0x599329, 0x599335, 0x599341, 0x59934d, 0x599359, 0x599365, 0x599371, 0x59937d, 0x599389, 0x599395, 0x59939d, 0x5993a5, 0x5993a7, 0x5993b3, 0x5993d3, 0x5993db, 0x5993e3, 0x5993eb, 0x5993f7, 0x5993ff, 0x599401, 0x59940d, 0x599430, 0x599434, 0x599436, 0x59943e, 0x599461, 0x599474, 0x599476, 0x59947e, 0x599499, 0x59949f, 0x5994a8, 0x5994b4, 0x5994c0, 0x5994cd, 0x5994da, 0x5994f3, 0x59950d, 0x599525, 0x599528, 0x59952b, 0x599536, 0x59953f, 0x59954c, 0x599566, 0x599585, 0x599589, 0x5995a8, 0x5995b3, 0x5995bc, 0x5995c9, 0x5995e0, 0x5995fd, 0x599606, 0x599618, 0x59961f, 0x59962b, 0x599651, 0x59965b, 0x599668, 0x599670, 0x599687, 0x59968e, 0x5996b3, 0x5996bd, 0x5996ca, 0x5996d2, 0x5996e9, 0x5996f4, 0x5996f6, 0x5996fb, 0x599707, 0x599712, 0x599738, 0x599742, 0x59974f, 0x599759, 0x59975d, 0x59976e, 0x599773, 0x59977a, 0x59977c, 0x599780, 0x5997a8, 0x5997aa, 0x5997b2, 0x5997c6, 0x5997c8, 0x5997cc, 0x5997d0, 0x5997d8, 0x5997de, 0x5997ec]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 10, 10, 10, 11, 11, 11, 11, 11, 11, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 25, 25, 25, 25, 25, 25, 25, 25, 25, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 27, 27, 27, 27, 27, 27, 27, 27, 28, 28, 28, 28, 28, 28, 28, 28, 28, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 31, 31, 31, 31, 31, 31]);
function f_598800_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 598800
        R.esp = (R.sub((R.esp >>> 0), 0x38, 32)) | 0; // 598800: sub esp, 0x38
        R.eax = (R.m.u32(((R.ecx + 0x8) | 0) >>> 0)) | 0; // 598803: mov eax, dword ptr [ecx + 8]
        R.push((R.ebx >>> 0)); // 598806: push ebx
        R.ebx = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 598807: mov ebx, dword ptr [ecx]
        R.push((R.ebp >>> 0)); // 598809: push ebp
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 59880a: lea edx, [eax + eax*8]
        R.push((R.esi >>> 0)); // 59880d: push esi
        R.esi = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 59880e: mov esi, dword ptr [0xae23b4]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 598814: mov dword ptr [esp + 0x10], ecx
        R.ecx = (R.m.u32(((R.ecx + 0x4) | 0) >>> 0)) | 0; // 598818: mov ecx, dword ptr [ecx + 4]
        R.esi = (R.add((R.esi >>> 0), (R.eax >>> 0), 32)) | 0; // 59881b: add esi, eax
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 59881d: shl edx, 4
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 598820: add edx, eax
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.ecx >>> 0)); // 598822: mov dword ptr [esp + 0x38], ecx
        R.ecx = (R.m.u32(((R.esp + 0x4c) | 0) >>> 0)) | 0; // 598826: mov ecx, dword ptr [esp + 0x4c]
        R.push((R.edi >>> 0)); // 59882a: push edi
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 59882b: xor eax, eax
        R.edi = (((R.esi + R.edx * 4) | 0)) | 0; // 59882d: lea edi, [esi + edx*4]
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 598830: cmp ecx, eax
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.edi >>> 0)); // 598832: mov dword ptr [esp + 0x10], edi
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 598836: mov dword ptr [esp + 0x1c], eax
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.eax >>> 0)); // 59883a: mov dword ptr [esp + 0x18], eax
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.eax >>> 0)); // 59883e: mov dword ptr [esp + 0x24], eax
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.eax >>> 0)); // 598842: mov dword ptr [esp + 0x30], eax
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.ebx >>> 0)); // 598846: mov dword ptr [esp + 0x38], ebx
        if (R.zf) { pc = 8; continue; } // 59884a: je 0x598891
        pc = 1; continue;
      case 1: // 59884c
        R.edi = (R.add((R.edi >>> 0), 0xd7, 32)) | 0; // 59884c: add edi, 0xd7
        R.ebp = (0x32) | 0; // 598852: mov ebp, 0x32
        pc = 2; continue;
      case 2: // 598857
        R.esi = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 598857: mov esi, dword ptr [edi]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 598859: test esi, esi
        if (R.zf) { pc = 6; continue; } // 59885b: je 0x598887
        pc = 3; continue;
      case 3: // 59885d
        R.edx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 59885d: mov edx, dword ptr [esi]
        R.eax = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 59885f: mov eax, dword ptr [0xae2364]
        R.sub((R.edx >>> 0), (R.eax >>> 0), 32); // 598864: cmp edx, eax
        if (!R.cL) { pc = 6; continue; } // 598866: jge 0x598887
        pc = 4; continue;
      case 4: // 598868
        R.push(0x0); // 598868: push 0
        R.push((R.esi >>> 0)); // 59886a: push esi
        R.call(0x5444a0, { n: 2, thisEcx: false, calleeClean: false }); // 59886b: call 0x5444a0
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 598870: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 598873: test eax, eax
        if (R.zf) { pc = 6; continue; } // 598875: je 0x598887
        pc = 5; continue;
      case 5: // 598877
        R.eax = (R.m.u32(((R.esi + 0x52) | 0) >>> 0)) | 0; // 598877: mov eax, dword ptr [esi + 0x52]
        R.edx = R.eax < 0 ? -1 : 0; // 59887a: cdq 
        R.ebx = (R.add((R.ebx >>> 0), (R.eax >>> 0), 32)) | 0; // 59887b: add ebx, eax
        R.eax = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 59887d: mov eax, dword ptr [esp + 0x3c]
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32, R.cf ? 1 : 0)) | 0; // 598881: adc eax, edx
        R.m.w32(((R.esp + 0x3c) | 0) >>> 0, (R.eax >>> 0)); // 598883: mov dword ptr [esp + 0x3c], eax
        pc = 6; continue;
      default: return pc;
    }
  }
}
function f_598800_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 6: // 598887
        R.edi = (R.add((R.edi >>> 0), 0x4, 32)) | 0; // 598887: add edi, 4
        R.ebp = (R.incdec((R.ebp >>> 0), -1, 32)) | 0; // 59888a: dec ebp
        if (!R.zf) { pc = 2; continue; } // 59888b: jne 0x598857
        pc = 7; continue;
      case 7: // 59888d
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.ebx >>> 0)); // 59888d: mov dword ptr [esp + 0x38], ebx
        pc = 8; continue;
      case 8: // 598891
        R.eax = (R.m.u32(((R.esp + 0x54) | 0) >>> 0)) | 0; // 598891: mov eax, dword ptr [esp + 0x54]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 598895: test eax, eax
        if (R.zf) { pc = 10; continue; } // 598897: je 0x59889f
        pc = 9; continue;
      case 9: // 598899
        R.m.w32(((R.eax) | 0) >>> 0, 0x0); // 598899: mov dword ptr [eax], 0
        pc = 10; continue;
      case 10: // 59889f
        R.eax = (R.m.u32(((R.esp + 0x5c) | 0) >>> 0)) | 0; // 59889f: mov eax, dword ptr [esp + 0x5c]
        R.edi = (R.m.u32(((R.esp + 0x4c) | 0) >>> 0)) | 0; // 5988a3: mov edi, dword ptr [esp + 0x4c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5988a7: test eax, eax
        if (R.zf) { pc = 53; continue; } // 5988a9: je 0x598aef
        pc = 11; continue;
      case 11: // 5988af
        R.ebp = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 5988af: mov ebp, dword ptr [esp + 0x10]
        R.push(0x0); // 5988b3: push 0
        R.push(0x0); // 5988b5: push 0
        R.push(0x1); // 5988b7: push 1
        R.push(0x1); // 5988b9: push 1
        R.push((R.ebp >>> 0)); // 5988bb: push ebp
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 5988bc: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 5988c1: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5988c4: test eax, eax
        if (R.zf) { pc = 54; continue; } // 5988c6: je 0x598af3
        pc = 12; continue;
      case 12: // 5988cc
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 5988cc: mov ecx, dword ptr [0xde1f54]
        R.eax = (((R.esp + 0x24) | 0)) | 0; // 5988d2: lea eax, [esp + 0x24]
        R.push((R.eax >>> 0)); // 5988d6: push eax
        R.push((R.ebp >>> 0)); // 5988d7: push ebp
        R.call(0x8ccb80, { n: 2, thisEcx: true, calleeClean: true }); // 5988d8: call 0x8ccb80
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 5988dd: test al, al
        if (R.cLE) { pc = 36; continue; } // 5988df: jle 0x5989e3
        pc = 13; continue;
      case 13: // 5988e5
        R.edx = (R.m.u32(((R.esp + 0x24) | 0) >>> 0)) | 0; // 5988e5: mov edx, dword ptr [esp + 0x24]
        R.ebp = (R.logic((R.ebp >>> 0) ^ (R.ebp >>> 0), 32)) | 0; // 5988e9: xor ebp, ebp
        R.ecx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 5988eb: movsx ecx, al
        R.esi = (R.logic((R.esi >>> 0) ^ (R.esi >>> 0), 32)) | 0; // 5988ee: xor esi, esi
        R.m.w32(((R.esp + 0x50) | 0) >>> 0, (R.ecx >>> 0)); // 5988f0: mov dword ptr [esp + 0x50], ecx
        pc = 15; continue; // 5988f4: jmp 0x5988fa
      case 14: // 5988f6
        R.edi = (R.m.u32(((R.esp + 0x4c) | 0) >>> 0)) | 0; // 5988f6: mov edi, dword ptr [esp + 0x4c]
        pc = 15; continue;
      case 15: // 5988fa
        R.eax = (R.m.u32(((R.esi + R.edx + 0x10) | 0) >>> 0)) | 0; // 5988fa: mov eax, dword ptr [esi + edx + 0x10]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5988fe: test eax, eax
        if (R.zf) { pc = 33; continue; } // 598900: je 0x5989c5
        pc = 16; continue;
      default: return pc;
    }
  }
}
function f_598800_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 16: // 598906
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + R.edx + 0x19) | 0) >>> 0)) & 0xff) << 0)) | 0; // 598906: mov al, byte ptr [esi + edx + 0x19]
        R.sub(((R.eax >>> 0) & 0xff), 0x3, 8); // 59890a: cmp al, 3
        if (R.zf) { pc = 20; continue; } // 59890c: je 0x59891e
        pc = 17; continue;
      case 17: // 59890e
        R.sub(((R.eax >>> 0) & 0xff), 0x4, 8); // 59890e: cmp al, 4
        if (R.zf) { pc = 20; continue; } // 598910: je 0x59891e
        pc = 18; continue;
      case 18: // 598912
        R.sub(((R.eax >>> 0) & 0xff), 0x6, 8); // 598912: cmp al, 6
        if (R.zf) { pc = 20; continue; } // 598914: je 0x59891e
        pc = 19; continue;
      case 19: // 598916
        R.sub(((R.eax >>> 0) & 0xff), 0x5, 8); // 598916: cmp al, 5
        if (!R.zf) { pc = 31; continue; } // 598918: jne 0x5989b0
        pc = 20; continue;
      case 20: // 59891e
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 59891e: xor ecx, ecx
        R.edi = (R.logic((R.edi >>> 0) ^ (R.edi >>> 0), 32)) | 0; // 598920: xor edi, edi
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 598922: test esi, esi
        if (R.cLE) { pc = 27; continue; } // 598924: jle 0x598946
        pc = 21; continue;
      case 21: // 598926
        R.eax = (((R.edx + 0x8) | 0)) | 0; // 598926: lea eax, [edx + 8]
        pc = 22; continue;
      case 22: // 598929
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 598929: test edi, edi
        if (!R.zf) { pc = 28; continue; } // 59892b: jne 0x598954
        pc = 23; continue;
      case 23: // 59892d
        R.ebx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 59892d: mov ebx, dword ptr [eax]
        R.sub((R.ebx >>> 0), R.m.u32(((R.esi + R.edx + 0x8) | 0) >>> 0), 32); // 59892f: cmp ebx, dword ptr [esi + edx + 8]
        if (!R.zf) { pc = 25; continue; } // 598933: jne 0x59893a
        pc = 24; continue;
      case 24: // 598935
        R.edi = (0x1) | 0; // 598935: mov edi, 1
        pc = 25; continue;
      case 25: // 59893a
        R.ecx = (R.incdec((R.ecx >>> 0), 1, 32)) | 0; // 59893a: inc ecx
        R.eax = (R.add((R.eax >>> 0), 0x1b, 32)) | 0; // 59893b: add eax, 0x1b
        R.sub((R.ecx >>> 0), (R.ebp >>> 0), 32); // 59893e: cmp ecx, ebp
        if (R.cL) { pc = 22; continue; } // 598940: jl 0x598929
        pc = 26; continue;
      case 26: // 598942
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 598942: test edi, edi
        if (!R.zf) { pc = 28; continue; } // 598944: jne 0x598954
        pc = 27; continue;
      case 27: // 598946
        R.eax = (R.m.u32(((R.esi + R.edx + 0x14) | 0) >>> 0)) | 0; // 598946: mov eax, dword ptr [esi + edx + 0x14]
        R.edi = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 59894a: mov edi, dword ptr [esp + 0x1c]
        R.edi = (R.sub((R.edi >>> 0), (R.eax >>> 0), 32)) | 0; // 59894e: sub edi, eax
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edi >>> 0)); // 598950: mov dword ptr [esp + 0x1c], edi
        pc = 28; continue;
      default: return pc;
    }
  }
}
function f_598800_3(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 28: // 598954
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 598954: mov eax, dword ptr [esp + 0x14]
        R.ebx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 598958: mov ebx, dword ptr [0xae23b4]
        R.eax = (R.m.u32(((R.eax + 0x8) | 0) >>> 0)) | 0; // 59895e: mov eax, dword ptr [eax + 8]
        R.ebx = (R.add((R.ebx >>> 0), (R.eax >>> 0), 32)) | 0; // 598961: add ebx, eax
        R.edi = (((R.eax + R.eax * 8) | 0)) | 0; // 598963: lea edi, [eax + eax*8]
        R.edi = (R.shl((R.edi >>> 0), 0x4, 32)) | 0; // 598966: shl edi, 4
        R.edi = (R.add((R.edi >>> 0), (R.eax >>> 0), 32)) | 0; // 598969: add edi, eax
        R.eax = (((R.ebx + R.edi * 4) | 0)) | 0; // 59896b: lea eax, [ebx + edi*4]
        R.push((R.eax >>> 0)); // 59896e: push eax
        R.eax = (((R.ecx + R.ecx * 2) | 0)) | 0; // 59896f: lea eax, [ecx + ecx*2]
        R.ecx = (((R.edx + R.eax * 8) | 0)) | 0; // 598972: lea ecx, [edx + eax*8]
        R.eax = (R.m.u32(((R.eax + R.ecx + 0x8) | 0) >>> 0)) | 0; // 598975: mov eax, dword ptr [eax + ecx + 8]
        R.ecx = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 598979: mov ecx, dword ptr [0xae23bc]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 59897f: lea edx, [eax + eax*4]
        R.eax = (((R.eax + R.edx * 2) | 0)) | 0; // 598982: lea eax, [eax + edx*2]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 598985: lea eax, [eax + eax*4]
        R.edx = (((R.ecx + R.eax * 2) | 0)) | 0; // 598988: lea edx, [ecx + eax*2]
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 59898b: mov ecx, dword ptr [0xae1050]
        R.push((R.edx >>> 0)); // 598991: push edx
        R.call(0x4cf5f0, { n: 2, thisEcx: true, calleeClean: true }); // 598992: call 0x4cf5f0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 598997: test eax, eax
        if (R.zf) { pc = 30; continue; } // 598999: je 0x5989a8
        pc = 29; continue;
      case 29: // 59899b
        R.eax = (R.m.u32(((R.eax + 0xc) | 0) >>> 0)) | 0; // 59899b: mov eax, dword ptr [eax + 0xc]
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 59899e: mov ecx, dword ptr [esp + 0x18]
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 5989a2: sub ecx, eax
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.ecx >>> 0)); // 5989a4: mov dword ptr [esp + 0x18], ecx
        pc = 30; continue;
      case 30: // 5989a8
        R.edx = (R.m.u32(((R.esp + 0x24) | 0) >>> 0)) | 0; // 5989a8: mov edx, dword ptr [esp + 0x24]
        R.ebx = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 5989ac: mov ebx, dword ptr [esp + 0x38]
        pc = 31; continue;
      case 31: // 5989b0
        R.eax = (R.m.u32(((R.esp + 0x50) | 0) >>> 0)) | 0; // 5989b0: mov eax, dword ptr [esp + 0x50]
        R.ebp = (R.incdec((R.ebp >>> 0), 1, 32)) | 0; // 5989b4: inc ebp
        R.esi = (R.add((R.esi >>> 0), 0x1b, 32)) | 0; // 5989b5: add esi, 0x1b
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 5989b8: dec eax
        R.m.w32(((R.esp + 0x50) | 0) >>> 0, (R.eax >>> 0)); // 5989b9: mov dword ptr [esp + 0x50], eax
        if (!R.zf) { pc = 14; continue; } // 5989bd: jne 0x5988f6
        pc = 32; continue;
      case 32: // 5989c3
        pc = 37; continue; // 5989c3: jmp 0x5989e9
      case 33: // 5989c5
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 5989c5: test edi, edi
        if (R.zf) { pc = 35; continue; } // 5989c7: je 0x5989d3
        pc = 34; continue;
      case 34: // 5989c9
        R.ecx = (R.m.u32(((R.esi + R.edx + 0x8) | 0) >>> 0)) | 0; // 5989c9: mov ecx, dword ptr [esi + edx + 8]
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 5989cd: mov eax, dword ptr [edi]
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 5989cf: cmp ecx, eax
        if (R.zf) { pc = 31; continue; } // 5989d1: je 0x5989b0
        pc = 35; continue;
      case 35: // 5989d3
        R.eax = (R.m.u32(((R.esi + R.edx + 0x14) | 0) >>> 0)) | 0; // 5989d3: mov eax, dword ptr [esi + edx + 0x14]
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 5989d7: mov ecx, dword ptr [esp + 0x1c]
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 5989db: add ecx, eax
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ecx >>> 0)); // 5989dd: mov dword ptr [esp + 0x1c], ecx
        pc = 31; continue; // 5989e1: jmp 0x5989b0
      default: return pc;
    }
  }
}
function f_598800_4(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 36: // 5989e3
        R.edx = (R.m.u32(((R.esp + 0x24) | 0) >>> 0)) | 0; // 5989e3: mov edx, dword ptr [esp + 0x24]
        pc = 38; continue; // 5989e7: jmp 0x5989ed
      case 37: // 5989e9
        R.ebp = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 5989e9: mov ebp, dword ptr [esp + 0x10]
        pc = 38; continue;
      case 38: // 5989ed
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 5989ed: test edx, edx
        if (R.zf) { pc = 40; continue; } // 5989ef: je 0x5989fa
        pc = 39; continue;
      case 39: // 5989f1
        R.push((R.edx >>> 0)); // 5989f1: push edx
        R.call(0x9452ca, { n: 1, thisEcx: true, calleeClean: false }); // 5989f2: call 0x9452ca
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 5989f7: add esp, 4
        pc = 40; continue;
      case 40: // 5989fa
        R.ecx = (((R.esp + 0x30) | 0)) | 0; // 5989fa: lea ecx, [esp + 0x30]
        R.push((R.ecx >>> 0)); // 5989fe: push ecx
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 5989ff: mov ecx, dword ptr [0xae1050]
        R.push((R.ebp >>> 0)); // 598a05: push ebp
        R.call(0x4ca300, { n: 2, thisEcx: true, calleeClean: true }); // 598a06: call 0x4ca300
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 598a0b: test al, al
        if (R.cLE) { pc = 51; continue; } // 598a0d: jle 0x598ade
        pc = 41; continue;
      case 41: // 598a13
        R.edi = (R.logic((R.edi >>> 0) ^ (R.edi >>> 0), 32)) | 0; // 598a13: xor edi, edi
        R.ebp = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 598a15: movsx ebp, al
        pc = 42; continue;
      case 42: // 598a18
        R.edx = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 598a18: mov edx, dword ptr [esp + 0x30]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edi + R.edx + 0x50) | 0) >>> 0)) & 0xff) << 0)) | 0; // 598a1c: mov al, byte ptr [edi + edx + 0x50]
        R.esi = (((R.edi + R.edx) | 0)) | 0; // 598a20: lea esi, [edi + edx]
        R.sub(((R.eax >>> 0) & 0xff), 0x4, 8); // 598a23: cmp al, 4
        if (R.zf) { pc = 50; continue; } // 598a25: je 0x598ad4
        pc = 43; continue;
      case 43: // 598a2b
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 598a2b: mov eax, dword ptr [esi]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 598a2d: lea ecx, [eax + eax*4]
        R.eax = (((R.eax + R.ecx * 2) | 0)) | 0; // 598a30: lea eax, [eax + ecx*2]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 598a33: lea edx, [eax + eax*4]
        R.eax = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 598a36: mov eax, dword ptr [0xae23bc]
        R.ecx = (((R.eax + R.edx * 2) | 0)) | 0; // 598a3b: lea ecx, [eax + edx*2]
        R.push((R.ecx >>> 0)); // 598a3e: push ecx
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 598a3f: mov ecx, dword ptr [0xae1050]
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 598a45: call 0x4cf5a0
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 598a4a: mov edx, dword ptr [0xae23b4]
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 598a50: mov dword ptr [0xae1080], eax
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 598a55: test eax, eax
        if (R.zf) { pc = 45; continue; } // 598a57: je 0x598a6b
        pc = 44; continue;
      case 44: // 598a59
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 598a59: mov eax, dword ptr [eax + 4]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 598a5c: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 598a5f: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 598a62: add ecx, eax
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 598a64: add eax, edx
        R.ecx = (((R.eax + R.ecx * 4) | 0)) | 0; // 598a66: lea ecx, [eax + ecx*4]
        pc = 46; continue; // 598a69: jmp 0x598a6d
      default: return pc;
    }
  }
}
function f_598800_5(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 45: // 598a6b
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 598a6b: xor ecx, ecx
        pc = 46; continue;
      case 46: // 598a6d
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 598a6d: mov eax, dword ptr [esp + 0x14]
        R.eax = (R.m.u32(((R.eax + 0x8) | 0) >>> 0)) | 0; // 598a71: mov eax, dword ptr [eax + 8]
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 598a74: add edx, eax
        R.ebx = (((R.eax + R.eax * 8) | 0)) | 0; // 598a76: lea ebx, [eax + eax*8]
        R.ebx = (R.shl((R.ebx >>> 0), 0x4, 32)) | 0; // 598a79: shl ebx, 4
        R.ebx = (R.add((R.ebx >>> 0), (R.eax >>> 0), 32)) | 0; // 598a7c: add ebx, eax
        R.eax = (((R.edx + R.ebx * 4) | 0)) | 0; // 598a7e: lea eax, [edx + ebx*4]
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 598a81: cmp ecx, eax
        if (!R.zf) { pc = 49; continue; } // 598a83: jne 0x598ab6
        pc = 47; continue;
      case 47: // 598a85
        R.push((R.eax >>> 0)); // 598a85: push eax
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 598a86: mov eax, dword ptr [esi]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 598a88: lea ecx, [eax + eax*4]
        R.eax = (((R.eax + R.ecx * 2) | 0)) | 0; // 598a8b: lea eax, [eax + ecx*2]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 598a8e: lea edx, [eax + eax*4]
        R.eax = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 598a91: mov eax, dword ptr [0xae23bc]
        R.ecx = (((R.eax + R.edx * 2) | 0)) | 0; // 598a96: lea ecx, [eax + edx*2]
        R.push((R.ecx >>> 0)); // 598a99: push ecx
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 598a9a: mov ecx, dword ptr [0xae1050]
        R.call(0x4cf5f0, { n: 2, thisEcx: true, calleeClean: true }); // 598aa0: call 0x4cf5f0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 598aa5: test eax, eax
        if (R.zf) { pc = 49; continue; } // 598aa7: je 0x598ab6
        pc = 48; continue;
      case 48: // 598aa9
        R.edx = (R.m.u32(((R.eax + 0xc) | 0) >>> 0)) | 0; // 598aa9: mov edx, dword ptr [eax + 0xc]
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 598aac: mov eax, dword ptr [esp + 0x18]
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 598ab0: sub eax, edx
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.eax >>> 0)); // 598ab2: mov dword ptr [esp + 0x18], eax
        pc = 49; continue;
      case 49: // 598ab6
        R.eax = (R.m.u32(((R.esi + 0xc) | 0) >>> 0)) | 0; // 598ab6: mov eax, dword ptr [esi + 0xc]
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 598ab9: mov ecx, dword ptr [esp + 0x18]
        R.ebx = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 598abd: mov ebx, dword ptr [esp + 0x38]
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 598ac1: add ecx, eax
        R.eax = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 598ac3: mov eax, dword ptr [esp + 0x1c]
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.ecx >>> 0)); // 598ac7: mov dword ptr [esp + 0x18], ecx
        R.ecx = (R.m.u32(((R.esi + 0x8) | 0) >>> 0)) | 0; // 598acb: mov ecx, dword ptr [esi + 8]
        R.eax = (R.add((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 598ace: add eax, ecx
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 598ad0: mov dword ptr [esp + 0x1c], eax
        pc = 50; continue;
      case 50: // 598ad4
        R.edi = (R.add((R.edi >>> 0), 0x6f, 32)) | 0; // 598ad4: add edi, 0x6f
        R.ebp = (R.incdec((R.ebp >>> 0), -1, 32)) | 0; // 598ad7: dec ebp
        if (!R.zf) { pc = 42; continue; } // 598ad8: jne 0x598a18
        pc = 51; continue;
      case 51: // 598ade
        R.eax = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 598ade: mov eax, dword ptr [esp + 0x30]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 598ae2: test eax, eax
        if (R.zf) { pc = 53; continue; } // 598ae4: je 0x598aef
        pc = 52; continue;
      case 52: // 598ae6
        R.push((R.eax >>> 0)); // 598ae6: push eax
        R.call(0x9452ca, { n: 1, thisEcx: true, calleeClean: false }); // 598ae7: call 0x9452ca
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 598aec: add esp, 4
        pc = 53; continue;
      default: return pc;
    }
  }
}
function f_598800_6(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 53: // 598aef
        R.ebp = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 598aef: mov ebp, dword ptr [esp + 0x10]
        pc = 54; continue;
      case 54: // 598af3
        R.eax = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 598af3: mov eax, dword ptr [ebp + 0x57]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 598af6: test eax, eax
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.eax >>> 0)); // 598af8: mov dword ptr [esp + 0x2c], eax
        if (R.zf) { pc = 305; continue; } // 598afc: je 0x5997ec
        pc = 55; continue;
      case 55: // 598b02
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 598b02: mov edx, dword ptr [eax]
        R.eax = (R.m.u32(((0xadadfc) | 0) >>> 0)) | 0; // 598b04: mov eax, dword ptr [0xadadfc]
        R.sub(R.m.u32(((R.eax + R.edx * 4) | 0) >>> 0), 0x0, 32); // 598b09: cmp dword ptr [eax + edx*4], 0
        if (R.zf) { pc = 305; continue; } // 598b0d: je 0x5997ec
        pc = 56; continue;
      case 56: // 598b13
        R.ecx = (R.m.u32(((R.ebp + 0xbf) | 0) >>> 0)) | 0; // 598b13: mov ecx, dword ptr [ebp + 0xbf]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 598b19: test ecx, ecx
        if (R.zf) { pc = 60; continue; } // 598b1b: je 0x598b3d
        pc = 57; continue;
      case 57: // 598b1d
        R.eax = (R.m.u32(((R.ecx + 0x69) | 0) >>> 0)) | 0; // 598b1d: mov eax, dword ptr [ecx + 0x69]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 598b20: test eax, eax
        if (R.zf) { pc = 60; continue; } // 598b22: je 0x598b3d
        pc = 58; continue;
      case 58: // 598b24
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0xf) | 0) >>> 0)) & 0xff) << 0)) | 0; // 598b24: mov al, byte ptr [eax + 0xf]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.ecx + 0x57) | 0) >>> 0)) & 0xff) << 0)) | 0; // 598b27: mov cl, byte ptr [ecx + 0x57]
        R.eax = ((R.eax & 0xffffff00) | (((R.add(((R.eax >>> 0) & 0xff), 0x6, 8)) & 0xff) << 0)) | 0; // 598b2a: add al, 6
        R.sub(((R.ecx >>> 0) & 0xff), 0xf, 8); // 598b2c: cmp cl, 0xf
        if (R.cLE) { pc = 61; continue; } // 598b2f: jle 0x598b3f
        pc = 59; continue;
      case 59: // 598b31
        R.ebp = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 598b31: mov ebp, dword ptr [esp + 0x10]
        R.edx = ((R.edx & 0xffffff00) | (((0xf) & 0xff) << 0)) | 0; // 598b35: mov dl, 0xf
        R.edx = ((R.edx & 0xffffff00) | (((R.sub(((R.edx >>> 0) & 0xff), ((R.ecx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 598b37: sub dl, cl
        R.eax = ((R.eax & 0xffffff00) | (((R.add(((R.eax >>> 0) & 0xff), ((R.edx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 598b39: add al, dl
        pc = 61; continue; // 598b3b: jmp 0x598b3f
      case 60: // 598b3d
        R.eax = ((R.eax & 0xffffff00) | (((0x10) & 0xff) << 0)) | 0; // 598b3d: mov al, 0x10
        pc = 61; continue;
      case 61: // 598b3f
        R.ecx = (R.m.u32(((R.ebp + 0x53) | 0) >>> 0)) | 0; // 598b3f: mov ecx, dword ptr [ebp + 0x53]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 598b42: test ecx, ecx
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.ecx >>> 0)); // 598b44: mov dword ptr [esp + 0x28], ecx
        if (R.zf) { pc = 64; continue; } // 598b48: je 0x598b58
        pc = 62; continue;
      case 62: // 598b4a
        R.ecx = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 598b4a: mov ecx, dword ptr [ecx]
        R.edx = (R.m.u32(((0x9cf314) | 0) >>> 0)) | 0; // 598b4c: mov edx, dword ptr [0x9cf314]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 598b52: cmp ecx, edx
        if (!R.zf) { pc = 64; continue; } // 598b54: jne 0x598b58
        pc = 63; continue;
      case 63: // 598b56
        R.eax = ((R.eax & 0xffffff00) | (((R.add(((R.eax >>> 0) & 0xff), 0x5, 8)) & 0xff) << 0)) | 0; // 598b56: add al, 5
        pc = 64; continue;
      default: return pc;
    }
  }
}
function f_598800_7(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 64: // 598b58
        R.edi = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 598b58: mov edi, dword ptr [esp + 0x18]
        R.esi = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 598b5c: movsx esi, al
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 598b5f: mov eax, dword ptr [esp + 0x14]
        R.m.w32(((R.esp + 0x50) | 0) >>> 0, (R.esi >>> 0)); // 598b63: mov dword ptr [esp + 0x50], esi
        R.fpush(R.m.s32(((R.esp + 0x50) | 0) >>> 0)); // 598b67: fild dword ptr [esp + 0x50]
        R.edx = (R.m.u32(((R.eax + 0xc) | 0) >>> 0)) | 0; // 598b6b: mov edx, dword ptr [eax + 0xc]
        R.edx = (R.add((R.edx >>> 0), (R.edi >>> 0), 32)) | 0; // 598b6e: add edx, edi
        R.m.wf64(((R.esp + 0x40) | 0) >>> 0, R.st[0]); // 598b70: fst qword ptr [esp + 0x40]
        R.m.w32(((R.esp + 0x50) | 0) >>> 0, (R.edx >>> 0)); // 598b74: mov dword ptr [esp + 0x50], edx
        R.fpush(R.m.s32(((R.esp + 0x50) | 0) >>> 0)); // 598b78: fild dword ptr [esp + 0x50]
        R.fpush(R.m.s32(((R.eax + 0x1c) | 0) >>> 0)); // 598b7c: fild dword ptr [eax + 0x1c]
        R.st[0] = R.st[0] * 0.6666666666666666; // 598b7f: fmul qword ptr [0x96a670]
        R.st[1] = R.st[1] - R.st[0]; R.fpop(); // 598b85: fsubp st(1)
        R.st[0] = R.st[0] * R.st[1]; // 598b87: fmul st(1)
        R.ftol(); // 598b89: call 0x945640
        R.edi = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 598b8e: mov edi, dword ptr [esp + 0x3c]
        R.ebx = (R.sub((R.ebx >>> 0), (R.eax >>> 0), 32)) | 0; // 598b92: sub ebx, eax
        R.eax = (R.m.u32(((R.ebp + 0x69) | 0) >>> 0)) | 0; // 598b94: mov eax, dword ptr [ebp + 0x69]
        R.edi = (R.sub((R.edi >>> 0), (R.edx >>> 0), 32, R.cf ? 1 : 0)) | 0; // 598b97: sbb edi, edx
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 598b99: test eax, eax
        if (R.zf) { pc = 75; continue; } // 598b9b: je 0x598c3d
        pc = 65; continue;
      case 65: // 598ba1
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.ebp + 0x6d) | 0) >>> 0)) & 0xff) << 0)) | 0; // 598ba1: mov cl, byte ptr [ebp + 0x6d]
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 598ba4: test cl, cl
        if (R.zf) { pc = 74; continue; } // 598ba6: je 0x598c33
        pc = 66; continue;
      case 66: // 598bac
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.ebp + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 598bac: mov cx, word ptr [ebp + 0x80]
        R.sub(((R.ecx >>> 0) & 0xffff), 0x1676, 16); // 598bb3: cmp cx, 0x1676
        if (R.cLE) { pc = 68; continue; } // 598bb8: jle 0x598bd9
        pc = 67; continue;
      case 67: // 598bba
        R.eax = (R.m.u32(((R.eax + 0x3c) | 0) >>> 0)) | 0; // 598bba: mov eax, dword ptr [eax + 0x3c]
        { const p = BigInt((((R.esi >>> 0)) | 0)) * BigInt((((R.eax >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.eax = (Number(BigInt.asIntN(32, p))) | 0; } // 598bbd: imul eax, esi
        R.m.w32(((R.esp + 0x50) | 0) >>> 0, (R.eax >>> 0)); // 598bc0: mov dword ptr [esp + 0x50], eax
        R.fpush(R.m.s32(((R.esp + 0x50) | 0) >>> 0)); // 598bc4: fild dword ptr [esp + 0x50]
        R.st[0] = R.st[0] * -1.25; // 598bc8: fmul qword ptr [0x96a5c8]
        R.ftol(); // 598bce: call 0x945640
        R.ebx = (R.add((R.ebx >>> 0), (R.eax >>> 0), 32)) | 0; // 598bd3: add ebx, eax
        R.edi = (R.add((R.edi >>> 0), (R.edx >>> 0), 32, R.cf ? 1 : 0)) | 0; // 598bd5: adc edi, edx
        pc = 77; continue; // 598bd7: jmp 0x598c51
      case 68: // 598bd9
        R.sub(((R.ecx >>> 0) & 0xffff), 0x109a, 16); // 598bd9: cmp cx, 0x109a
        if (R.cLE) { pc = 70; continue; } // 598bde: jle 0x598bff
        pc = 69; continue;
      case 69: // 598be0
        R.ecx = (R.m.u32(((R.eax + 0x3c) | 0) >>> 0)) | 0; // 598be0: mov ecx, dword ptr [eax + 0x3c]
        { const p = BigInt((((R.esi >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 598be3: imul ecx, esi
        R.m.w32(((R.esp + 0x50) | 0) >>> 0, (R.ecx >>> 0)); // 598be6: mov dword ptr [esp + 0x50], ecx
        R.fpush(R.m.s32(((R.esp + 0x50) | 0) >>> 0)); // 598bea: fild dword ptr [esp + 0x50]
        R.st[0] = R.st[0] * -1.15; // 598bee: fmul qword ptr [0x96a668]
        R.ftol(); // 598bf4: call 0x945640
        R.ebx = (R.add((R.ebx >>> 0), (R.eax >>> 0), 32)) | 0; // 598bf9: add ebx, eax
        R.edi = (R.add((R.edi >>> 0), (R.edx >>> 0), 32, R.cf ? 1 : 0)) | 0; // 598bfb: adc edi, edx
        pc = 77; continue; // 598bfd: jmp 0x598c51
      default: return pc;
    }
  }
}
function f_598800_8(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 70: // 598bff
        R.sub(((R.ecx >>> 0) & 0xffff), 0x4e2, 16); // 598bff: cmp cx, 0x4e2
        if (R.cLE) { pc = 73; continue; } // 598c04: jle 0x598c2b
        pc = 71; continue;
      case 71: // 598c06
        R.sub(R.m.u8(((R.ebp + 0x64) | 0) >>> 0), 0x1, 8); // 598c06: cmp byte ptr [ebp + 0x64], 1
        if (!R.zf) { pc = 73; continue; } // 598c0a: jne 0x598c2b
        pc = 72; continue;
      case 72: // 598c0c
        R.edx = (R.m.u32(((R.eax + 0x3c) | 0) >>> 0)) | 0; // 598c0c: mov edx, dword ptr [eax + 0x3c]
        { const p = BigInt((((R.esi >>> 0)) | 0)) * BigInt((((R.edx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.edx = (Number(BigInt.asIntN(32, p))) | 0; } // 598c0f: imul edx, esi
        R.m.w32(((R.esp + 0x50) | 0) >>> 0, (R.edx >>> 0)); // 598c12: mov dword ptr [esp + 0x50], edx
        R.fpush(R.m.s32(((R.esp + 0x50) | 0) >>> 0)); // 598c16: fild dword ptr [esp + 0x50]
        R.st[0] = R.st[0] * -1.05; // 598c1a: fmul qword ptr [0x96a660]
        R.ftol(); // 598c20: call 0x945640
        R.ebx = (R.add((R.ebx >>> 0), (R.eax >>> 0), 32)) | 0; // 598c25: add ebx, eax
        R.edi = (R.add((R.edi >>> 0), (R.edx >>> 0), 32, R.cf ? 1 : 0)) | 0; // 598c27: adc edi, edx
        pc = 77; continue; // 598c29: jmp 0x598c51
      case 73: // 598c2b
        R.eax = (R.m.u32(((R.eax + 0x3c) | 0) >>> 0)) | 0; // 598c2b: mov eax, dword ptr [eax + 0x3c]
        { const p = BigInt((((R.esi >>> 0)) | 0)) * BigInt((((R.eax >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.eax = (Number(BigInt.asIntN(32, p))) | 0; } // 598c2e: imul eax, esi
        pc = 76; continue; // 598c31: jmp 0x598c4c
      case 74: // 598c33
        R.eax = (R.m.u32(((R.eax + 0x3c) | 0) >>> 0)) | 0; // 598c33: mov eax, dword ptr [eax + 0x3c]
        { const p = BigInt((((R.esi >>> 0)) | 0)) * BigInt((((R.eax >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.eax = (Number(BigInt.asIntN(32, p))) | 0; } // 598c36: imul eax, esi
        R.eax = (R.shl((R.eax >>> 0), 0x1, 32)) | 0; // 598c39: shl eax, 1
        pc = 76; continue; // 598c3b: jmp 0x598c4c
      case 75: // 598c3d
        R.eax = (((R.esi + R.esi * 2) | 0)) | 0; // 598c3d: lea eax, [esi + esi*2]
        R.eax = (((R.esi + R.eax * 8) | 0)) | 0; // 598c40: lea eax, [esi + eax*8]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 598c43: lea eax, [eax + eax*4]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 598c46: lea eax, [eax + eax*4]
        R.eax = (R.shl((R.eax >>> 0), 0x2, 32)) | 0; // 598c49: shl eax, 2
        pc = 76; continue;
      case 76: // 598c4c
        R.edx = R.eax < 0 ? -1 : 0; // 598c4c: cdq 
        R.ebx = (R.sub((R.ebx >>> 0), (R.eax >>> 0), 32)) | 0; // 598c4d: sub ebx, eax
        R.edi = (R.sub((R.edi >>> 0), (R.edx >>> 0), 32, R.cf ? 1 : 0)) | 0; // 598c4f: sbb edi, edx
        pc = 77; continue;
      case 77: // 598c51
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebp + 0x7f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 598c51: mov al, byte ptr [ebp + 0x7f]
        R.sub(((R.eax >>> 0) & 0xff), 0x6, 8); // 598c54: cmp al, 6
        if (!R.cL) { pc = 79; continue; } // 598c56: jge 0x598c71
        pc = 78; continue;
      case 78: // 598c58
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 598c58: movsx eax, al
        { const p = BigInt((((R.esi >>> 0)) | 0)) * BigInt((((R.eax >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.eax = (Number(BigInt.asIntN(32, p))) | 0; } // 598c5b: imul eax, esi
        R.ecx = (((R.eax + R.eax * 2) | 0)) | 0; // 598c5e: lea ecx, [eax + eax*2]
        R.edx = (((R.eax + R.ecx * 8) | 0)) | 0; // 598c61: lea edx, [eax + ecx*8]
        R.edx = (R.shl((R.edx >>> 0), 0x3, 32)) | 0; // 598c64: shl edx, 3
        R.m.w32(((R.esp + 0x50) | 0) >>> 0, (R.edx >>> 0)); // 598c67: mov dword ptr [esp + 0x50], edx
        R.fpush(R.m.s32(((R.esp + 0x50) | 0) >>> 0)); // 598c6b: fild dword ptr [esp + 0x50]
        pc = 82; continue; // 598c6f: jmp 0x598cae
      case 79: // 598c71
        R.sub(((R.eax >>> 0) & 0xff), 0x10, 8); // 598c71: cmp al, 0x10
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 598c73: movsx eax, al
        if (!R.cL) { pc = 81; continue; } // 598c76: jge 0x598c94
        pc = 80; continue;
      default: return pc;
    }
  }
}
function f_598800_9(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 80: // 598c78
        R.eax = (R.sub((R.eax >>> 0), 0x2, 32)) | 0; // 598c78: sub eax, 2
        { const p = BigInt((((R.esi >>> 0)) | 0)) * BigInt((((R.eax >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.eax = (Number(BigInt.asIntN(32, p))) | 0; } // 598c7b: imul eax, esi
        R.ecx = (((R.eax + R.eax * 2) | 0)) | 0; // 598c7e: lea ecx, [eax + eax*2]
        R.eax = (((R.eax + R.ecx * 8) | 0)) | 0; // 598c81: lea eax, [eax + ecx*8]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 598c84: lea edx, [eax + eax*4]
        R.edx = (R.shl((R.edx >>> 0), 0x2, 32)) | 0; // 598c87: shl edx, 2
        R.m.w32(((R.esp + 0x50) | 0) >>> 0, (R.edx >>> 0)); // 598c8a: mov dword ptr [esp + 0x50], edx
        R.fpush(R.m.s32(((R.esp + 0x50) | 0) >>> 0)); // 598c8e: fild dword ptr [esp + 0x50]
        pc = 82; continue; // 598c92: jmp 0x598cae
      case 81: // 598c94
        R.eax = (R.sub((R.eax >>> 0), 0xc, 32)) | 0; // 598c94: sub eax, 0xc
        { const p = BigInt((((R.esi >>> 0)) | 0)) * BigInt((((R.eax >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.eax = (Number(BigInt.asIntN(32, p))) | 0; } // 598c97: imul eax, esi
        R.ecx = (((R.eax + R.eax * 2) | 0)) | 0; // 598c9a: lea ecx, [eax + eax*2]
        R.eax = (((R.eax + R.ecx * 8) | 0)) | 0; // 598c9d: lea eax, [eax + ecx*8]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 598ca0: lea edx, [eax + eax*4]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 598ca3: shl edx, 4
        R.m.w32(((R.esp + 0x50) | 0) >>> 0, (R.edx >>> 0)); // 598ca6: mov dword ptr [esp + 0x50], edx
        R.fpush(R.m.s32(((R.esp + 0x50) | 0) >>> 0)); // 598caa: fild dword ptr [esp + 0x50]
        pc = 82; continue;
      case 82: // 598cae
        R.st[0] = R.st[0] * 0.25; // 598cae: fmul qword ptr [0x9689e0]
        R.ftol(); // 598cb4: call 0x945640
        R.ebp = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 598cb9: mov ebp, dword ptr [esp + 0x10]
        R.edx = R.eax < 0 ? -1 : 0; // 598cbd: cdq 
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.ebp + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 598cbe: mov cx, word ptr [ebp + 0x80]
        R.ebx = (R.sub((R.ebx >>> 0), (R.eax >>> 0), 32)) | 0; // 598cc5: sub ebx, eax
        R.edi = (R.sub((R.edi >>> 0), (R.edx >>> 0), 32, R.cf ? 1 : 0)) | 0; // 598cc7: sbb edi, edx
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.ecx >>> 0)); // 598cc9: mov dword ptr [esp + 0x34], ecx
        R.m.w32(((R.esp + 0x3c) | 0) >>> 0, (R.edi >>> 0)); // 598ccd: mov dword ptr [esp + 0x3c], edi
        R.edi = (((((R.ecx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 598cd1: movsx edi, cx
        R.eax = ((R.edi >>> 0)) | 0; // 598cd4: mov eax, edi
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.edi >>> 0)); // 598cd6: mov dword ptr [esp + 0x18], edi
        { const p = BigInt((((R.esi >>> 0)) | 0)) * BigInt((((R.eax >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.eax = (Number(BigInt.asIntN(32, p))) | 0; } // 598cda: imul eax, esi
        R.esi = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 598cdd: mov esi, dword ptr [esp + 0x3c]
        R.edx = R.eax < 0 ? -1 : 0; // 598ce1: cdq 
        R.ebx = (R.sub((R.ebx >>> 0), (R.eax >>> 0), 32)) | 0; // 598ce2: sub ebx, eax
        R.esi = (R.sub((R.esi >>> 0), (R.edx >>> 0), 32, R.cf ? 1 : 0)) | 0; // 598ce4: sbb esi, edx
        R.sub(((R.ecx >>> 0) & 0xffff), 0xfa0, 16); // 598ce6: cmp cx, 0xfa0
        R.m.w32(((R.esp + 0x3c) | 0) >>> 0, (R.esi >>> 0)); // 598ceb: mov dword ptr [esp + 0x3c], esi
        if (!R.cL) { pc = 84; continue; } // 598cef: jge 0x598d09
        pc = 83; continue;
      case 83: // 598cf1
        R.eax = (R.m.u32(((R.ebp + 0x73) | 0) >>> 0)) | 0; // 598cf1: mov eax, dword ptr [ebp + 0x73]
        { const p = BigInt((((R.edi >>> 0)) | 0)) * BigInt((((R.eax >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.eax = (Number(BigInt.asIntN(32, p))) | 0; } // 598cf4: imul eax, edi
        R.m.w32(((R.esp + 0x50) | 0) >>> 0, (R.eax >>> 0)); // 598cf7: mov dword ptr [esp + 0x50], eax
        R.fpush(R.m.s32(((R.esp + 0x50) | 0) >>> 0)); // 598cfb: fild dword ptr [esp + 0x50]
        R.st[0] = R.st[0] * R.st[1]; // 598cff: fmul st(1)
        R.st[0] = R.st[0] * 0.0005; // 598d01: fmul qword ptr [0x96a658]
        pc = 85; continue; // 598d07: jmp 0x598d1f
      case 84: // 598d09
        R.ecx = (R.m.u32(((R.ebp + 0x73) | 0) >>> 0)) | 0; // 598d09: mov ecx, dword ptr [ebp + 0x73]
        { const p = BigInt((((R.edi >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 598d0c: imul ecx, edi
        R.m.w32(((R.esp + 0x50) | 0) >>> 0, (R.ecx >>> 0)); // 598d0f: mov dword ptr [esp + 0x50], ecx
        R.fpush(R.m.s32(((R.esp + 0x50) | 0) >>> 0)); // 598d13: fild dword ptr [esp + 0x50]
        R.st[0] = R.st[0] * R.st[1]; // 598d17: fmul st(1)
        R.st[0] = R.st[0] * 0.001; // 598d19: fmul qword ptr [0x96a350]
        pc = 85; continue;
      default: return pc;
    }
  }
}
function f_598800_10(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 85: // 598d1f
        R.ftol(); // 598d1f: call 0x945640
        R.ebx = (R.add((R.ebx >>> 0), (R.eax >>> 0), 32)) | 0; // 598d24: add ebx, eax
        R.eax = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 598d26: mov eax, dword ptr [esp + 0x3c]
        R.esi = (R.m.u32(((0x9cf2e4) | 0) >>> 0)) | 0; // 598d2a: mov esi, dword ptr [0x9cf2e4]
        R.ebp = (R.m.u32(((0x9cf360) | 0) >>> 0)) | 0; // 598d30: mov ebp, dword ptr [0x9cf360]
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32, R.cf ? 1 : 0)) | 0; // 598d36: adc eax, edx
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.ebx >>> 0)); // 598d38: mov dword ptr [esp + 0x38], ebx
        R.ebx = (R.m.u32(((0x9cf300) | 0) >>> 0)) | 0; // 598d3c: mov ebx, dword ptr [0x9cf300]
        R.m.w32(((R.esp + 0x3c) | 0) >>> 0, (R.eax >>> 0)); // 598d42: mov dword ptr [esp + 0x3c], eax
        R.eax = (R.m.u32(((R.esp + 0x28) | 0) >>> 0)) | 0; // 598d46: mov eax, dword ptr [esp + 0x28]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 598d4a: test eax, eax
        R.fpop(); // 598d4c: fstp st(0)
        if (R.zf) { pc = 95; continue; } // 598d4e: je 0x598dd8
        pc = 86; continue;
      case 86: // 598d54
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 598d54: mov eax, dword ptr [eax]
        R.sub((R.eax >>> 0), (R.esi >>> 0), 32); // 598d56: cmp eax, esi
        if (R.zf) { pc = 93; continue; } // 598d58: je 0x598da9
        pc = 87; continue;
      case 87: // 598d5a
        R.sub((R.eax >>> 0), (R.ebp >>> 0), 32); // 598d5a: cmp eax, ebp
        if (R.zf) { pc = 93; continue; } // 598d5c: je 0x598da9
        pc = 88; continue;
      case 88: // 598d5e
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf488) | 0) >>> 0), 32); // 598d5e: cmp eax, dword ptr [0x9cf488]
        if (R.zf) { pc = 93; continue; } // 598d64: je 0x598da9
        pc = 89; continue;
      case 89: // 598d66
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf314) | 0) >>> 0), 32); // 598d66: cmp eax, dword ptr [0x9cf314]
        if (R.zf) { pc = 92; continue; } // 598d6c: je 0x598d8d
        pc = 90; continue;
      case 90: // 598d6e
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 598d6e: cmp eax, ebx
        if (R.zf) { pc = 92; continue; } // 598d70: je 0x598d8d
        pc = 91; continue;
      case 91: // 598d72
        R.edx = (R.m.u32(((R.esp + 0x2c) | 0) >>> 0)) | 0; // 598d72: mov edx, dword ptr [esp + 0x2c]
        R.eax = (((R.m.u16(((R.edx + 0x69) | 0) >>> 0)) << 16 >> 16)) | 0; // 598d76: movsx eax, word ptr [edx + 0x69]
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.eax >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.eax = (Number(BigInt.asIntN(32, p))) | 0; } // 598d7a: imul eax, eax
        R.ecx = (((R.eax + R.eax * 2) | 0)) | 0; // 598d7d: lea ecx, [eax + eax*2]
        R.eax = (((R.eax + R.ecx * 8) | 0)) | 0; // 598d80: lea eax, [eax + ecx*8]
        R.eax = (((R.eax + R.eax * 2) | 0)) | 0; // 598d83: lea eax, [eax + eax*2]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 598d86: lea eax, [eax + eax*4]
        R.eax = (R.shl((R.eax >>> 0), 0x1, 32)) | 0; // 598d89: shl eax, 1
        pc = 94; continue; // 598d8b: jmp 0x598dc3
      case 92: // 598d8d
        R.edx = (R.m.u32(((R.esp + 0x2c) | 0) >>> 0)) | 0; // 598d8d: mov edx, dword ptr [esp + 0x2c]
        R.eax = (((R.m.u16(((R.edx + 0x69) | 0) >>> 0)) << 16 >> 16)) | 0; // 598d91: movsx eax, word ptr [edx + 0x69]
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.eax >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.eax = (Number(BigInt.asIntN(32, p))) | 0; } // 598d95: imul eax, eax
        R.ecx = (((R.eax + R.eax * 2) | 0)) | 0; // 598d98: lea ecx, [eax + eax*2]
        R.eax = (((R.eax + R.ecx * 8) | 0)) | 0; // 598d9b: lea eax, [eax + ecx*8]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 598d9e: lea eax, [eax + eax*4]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 598da1: lea eax, [eax + eax*4]
        R.eax = (R.shl((R.eax >>> 0), 0x2, 32)) | 0; // 598da4: shl eax, 2
        pc = 94; continue; // 598da7: jmp 0x598dc3
      default: return pc;
    }
  }
}
function f_598800_11(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 93: // 598da9
        R.edx = (R.m.u32(((R.esp + 0x2c) | 0) >>> 0)) | 0; // 598da9: mov edx, dword ptr [esp + 0x2c]
        R.eax = (((R.m.u16(((R.edx + 0x69) | 0) >>> 0)) << 16 >> 16)) | 0; // 598dad: movsx eax, word ptr [edx + 0x69]
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.eax >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.eax = (Number(BigInt.asIntN(32, p))) | 0; } // 598db1: imul eax, eax
        R.ecx = (((R.eax + R.eax * 2) | 0)) | 0; // 598db4: lea ecx, [eax + eax*2]
        R.eax = (((R.eax + R.ecx * 8) | 0)) | 0; // 598db7: lea eax, [eax + ecx*8]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 598dba: lea eax, [eax + eax*4]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 598dbd: lea eax, [eax + eax*4]
        R.eax = (R.shl((R.eax >>> 0), 0x3, 32)) | 0; // 598dc0: shl eax, 3
        pc = 94; continue;
      case 94: // 598dc3
        R.ecx = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 598dc3: mov ecx, dword ptr [esp + 0x38]
        R.edx = R.eax < 0 ? -1 : 0; // 598dc7: cdq 
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 598dc8: add ecx, eax
        R.eax = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 598dca: mov eax, dword ptr [esp + 0x3c]
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32, R.cf ? 1 : 0)) | 0; // 598dce: adc eax, edx
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.ecx >>> 0)); // 598dd0: mov dword ptr [esp + 0x38], ecx
        R.m.w32(((R.esp + 0x3c) | 0) >>> 0, (R.eax >>> 0)); // 598dd4: mov dword ptr [esp + 0x3c], eax
        pc = 95; continue;
      case 95: // 598dd8
        R.edx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 598dd8: mov edx, dword ptr [esp + 0x10]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edx + 0x6d) | 0) >>> 0)) & 0xff) << 0)) | 0; // 598ddc: mov al, byte ptr [edx + 0x6d]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 598ddf: test al, al
        if (R.zf) { pc = 97; continue; } // 598de1: je 0x598dfe
        pc = 96; continue;
      case 96: // 598de3
        R.eax = ((R.edi >>> 0)) | 0; // 598de3: mov eax, edi
        { const p = BigInt((((R.edi >>> 0)) | 0)) * BigInt((((R.eax >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.eax = (Number(BigInt.asIntN(32, p))) | 0; } // 598de5: imul eax, edi
        R.m.w32(((R.esp + 0x50) | 0) >>> 0, (R.eax >>> 0)); // 598de8: mov dword ptr [esp + 0x50], eax
        R.fpush(R.m.s32(((R.esp + 0x50) | 0) >>> 0)); // 598dec: fild dword ptr [esp + 0x50]
        R.fpush(R.st[0]); // 598df0: fld st(0)
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x40) | 0)); // 598df2: fmul qword ptr [esp + 0x40]
        R.st[0] = R.st[0] * 0.001; // 598df6: fmul qword ptr [0x96a350]
        pc = 98; continue; // 598dfc: jmp 0x598e17
      case 97: // 598dfe
        R.ecx = ((R.edi >>> 0)) | 0; // 598dfe: mov ecx, edi
        { const p = BigInt((((R.edi >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 598e00: imul ecx, edi
        R.m.w32(((R.esp + 0x50) | 0) >>> 0, (R.ecx >>> 0)); // 598e03: mov dword ptr [esp + 0x50], ecx
        R.fpush(R.m.s32(((R.esp + 0x50) | 0) >>> 0)); // 598e07: fild dword ptr [esp + 0x50]
        R.fpush(R.st[0]); // 598e0b: fld st(0)
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x40) | 0)); // 598e0d: fmul qword ptr [esp + 0x40]
        R.st[0] = R.st[0] * 0.0005; // 598e11: fmul qword ptr [0x96a658]
        pc = 98; continue;
      case 98: // 598e17
        R.ftol(); // 598e17: call 0x945640
        R.ecx = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 598e1c: mov ecx, dword ptr [esp + 0x38]
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 598e20: add ecx, eax
        R.eax = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 598e22: mov eax, dword ptr [esp + 0x3c]
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32, R.cf ? 1 : 0)) | 0; // 598e26: adc eax, edx
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.ecx >>> 0)); // 598e28: mov dword ptr [esp + 0x38], ecx
        R.m.w32(((R.esp + 0x3c) | 0) >>> 0, (R.eax >>> 0)); // 598e2c: mov dword ptr [esp + 0x3c], eax
        R.eax = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 598e30: mov eax, dword ptr [esp + 0x10]
        R.sub(R.m.u32(((R.eax + 0x1db) | 0) >>> 0), 0xffffffff, 32); // 598e34: cmp dword ptr [eax + 0x1db], -1
        if (R.zf) { pc = 119; continue; } // 598e3b: je 0x598f1b
        pc = 99; continue;
      case 99: // 598e41
        R.sub(R.m.u8(((R.eax + 0x64) | 0) >>> 0), 0x1, 8); // 598e41: cmp byte ptr [eax + 0x64], 1
        if (!R.zf) { pc = 119; continue; } // 598e45: jne 0x598f1b
        pc = 100; continue;
      default: return pc;
    }
  }
}
function f_598800_12(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 100: // 598e4b
        R.ecx = (R.m.u32(((R.esp + 0x28) | 0) >>> 0)) | 0; // 598e4b: mov ecx, dword ptr [esp + 0x28]
        R.edx = (((R.edi + R.edi * 2) | 0)) | 0; // 598e4f: lea edx, [edi + edi*2]
        R.eax = (((R.edi + R.edx * 8) | 0)) | 0; // 598e52: lea eax, [edi + edx*8]
        R.eax = (((R.eax + R.eax * 2) | 0)) | 0; // 598e55: lea eax, [eax + eax*2]
        R.eax = (R.shl((R.eax >>> 0), 0x2, 32)) | 0; // 598e58: shl eax, 2
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 598e5b: test ecx, ecx
        R.m.w32(((R.esp + 0x50) | 0) >>> 0, (R.eax >>> 0)); // 598e5d: mov dword ptr [esp + 0x50], eax
        if (R.zf) { pc = 117; continue; } // 598e61: je 0x598f04
        pc = 101; continue;
      case 101: // 598e67
        R.ecx = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 598e67: mov ecx, dword ptr [ecx]
        R.sub((R.ecx >>> 0), (R.esi >>> 0), 32); // 598e69: cmp ecx, esi
        if (R.zf) { pc = 118; continue; } // 598e6b: je 0x598f06
        pc = 102; continue;
      case 102: // 598e71
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf314) | 0) >>> 0), 32); // 598e71: cmp ecx, dword ptr [0x9cf314]
        if (R.zf) { pc = 118; continue; } // 598e77: je 0x598f06
        pc = 103; continue;
      case 103: // 598e7d
        R.sub((R.ecx >>> 0), (R.ebp >>> 0), 32); // 598e7d: cmp ecx, ebp
        if (R.zf) { pc = 118; continue; } // 598e7f: je 0x598f06
        pc = 104; continue;
      case 104: // 598e85
        R.sub((R.ecx >>> 0), (R.ebx >>> 0), 32); // 598e85: cmp ecx, ebx
        if (R.zf) { pc = 118; continue; } // 598e87: je 0x598f06
        pc = 105; continue;
      case 105: // 598e89
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf45c) | 0) >>> 0), 32); // 598e89: cmp ecx, dword ptr [0x9cf45c]
        if (R.zf) { pc = 118; continue; } // 598e8f: je 0x598f06
        pc = 106; continue;
      case 106: // 598e91
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf488) | 0) >>> 0), 32); // 598e91: cmp ecx, dword ptr [0x9cf488]
        if (R.zf) { pc = 118; continue; } // 598e97: je 0x598f06
        pc = 107; continue;
      case 107: // 598e99
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf338) | 0) >>> 0), 32); // 598e99: cmp ecx, dword ptr [0x9cf338]
        if (R.zf) { pc = 116; continue; } // 598e9f: je 0x598ef3
        pc = 108; continue;
      case 108: // 598ea1
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf4a8) | 0) >>> 0), 32); // 598ea1: cmp ecx, dword ptr [0x9cf4a8]
        if (R.zf) { pc = 116; continue; } // 598ea7: je 0x598ef3
        pc = 109; continue;
      case 109: // 598ea9
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf244) | 0) >>> 0), 32); // 598ea9: cmp ecx, dword ptr [0x9cf244]
        if (R.zf) { pc = 116; continue; } // 598eaf: je 0x598ef3
        pc = 110; continue;
      case 110: // 598eb1
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf434) | 0) >>> 0), 32); // 598eb1: cmp ecx, dword ptr [0x9cf434]
        if (R.zf) { pc = 116; continue; } // 598eb7: je 0x598ef3
        pc = 111; continue;
      case 111: // 598eb9
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf4dc) | 0) >>> 0), 32); // 598eb9: cmp ecx, dword ptr [0x9cf4dc]
        if (R.zf) { pc = 116; continue; } // 598ebf: je 0x598ef3
        pc = 112; continue;
      case 112: // 598ec1
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf2c0) | 0) >>> 0), 32); // 598ec1: cmp ecx, dword ptr [0x9cf2c0]
        if (R.zf) { pc = 115; continue; } // 598ec7: je 0x598ee2
        pc = 113; continue;
      default: return pc;
    }
  }
}
function f_598800_13(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 113: // 598ec9
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf408) | 0) >>> 0), 32); // 598ec9: cmp ecx, dword ptr [0x9cf408]
        if (R.zf) { pc = 115; continue; } // 598ecf: je 0x598ee2
        pc = 114; continue;
      case 114: // 598ed1
        R.fpush(R.m.s32(((R.esp + 0x50) | 0) >>> 0)); // 598ed1: fild dword ptr [esp + 0x50]
        R.st[0] = R.st[0] * 0.5; // 598ed5: fmul qword ptr [0x968968]
        R.ftol(); // 598edb: call 0x945640
        pc = 118; continue; // 598ee0: jmp 0x598f06
      case 115: // 598ee2
        R.fpush(R.m.s32(((R.esp + 0x50) | 0) >>> 0)); // 598ee2: fild dword ptr [esp + 0x50]
        R.st[0] = R.st[0] * 0.35; // 598ee6: fmul qword ptr [0x969510]
        R.ftol(); // 598eec: call 0x945640
        pc = 118; continue; // 598ef1: jmp 0x598f06
      case 116: // 598ef3
        R.fpush(R.m.s32(((R.esp + 0x50) | 0) >>> 0)); // 598ef3: fild dword ptr [esp + 0x50]
        R.st[0] = R.st[0] * 0.65; // 598ef7: fmul qword ptr [0x96a5d0]
        R.ftol(); // 598efd: call 0x945640
        pc = 118; continue; // 598f02: jmp 0x598f06
      case 117: // 598f04
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 598f04: xor eax, eax
        pc = 118; continue;
      case 118: // 598f06
        R.ecx = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 598f06: mov ecx, dword ptr [esp + 0x38]
        R.edx = R.eax < 0 ? -1 : 0; // 598f0a: cdq 
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 598f0b: add ecx, eax
        R.eax = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 598f0d: mov eax, dword ptr [esp + 0x3c]
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32, R.cf ? 1 : 0)) | 0; // 598f11: adc eax, edx
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.ecx >>> 0)); // 598f13: mov dword ptr [esp + 0x38], ecx
        R.m.w32(((R.esp + 0x3c) | 0) >>> 0, (R.eax >>> 0)); // 598f17: mov dword ptr [esp + 0x3c], eax
        pc = 119; continue;
      case 119: // 598f1b
        R.edx = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 598f1b: mov edx, dword ptr [esp + 0x14]
        R.eax = (R.m.u32(((R.edx + 0x110) | 0) >>> 0)) | 0; // 598f1f: mov eax, dword ptr [edx + 0x110]
        R.edi = (R.m.u32(((R.edx + 0x118) | 0) >>> 0)) | 0; // 598f25: mov edi, dword ptr [edx + 0x118]
        R.ecx = (R.m.u32(((R.edx + 0x114) | 0) >>> 0)) | 0; // 598f2b: mov ecx, dword ptr [edx + 0x114]
        R.esi = (R.m.u32(((R.edx + 0x11c) | 0) >>> 0)) | 0; // 598f31: mov esi, dword ptr [edx + 0x11c]
        R.eax = (R.sub((R.eax >>> 0), (R.edi >>> 0), 32)) | 0; // 598f37: sub eax, edi
        R.ecx = (R.sub((R.ecx >>> 0), (R.esi >>> 0), 32, R.cf ? 1 : 0)) | 0; // 598f39: sbb ecx, esi
        if (R.sf) { pc = 123; continue; } // 598f3b: js 0x598f49
        pc = 120; continue;
      case 120: // 598f3d
        if (!R.cLE) { pc = 122; continue; } // 598f3d: jg 0x598f43
        pc = 121; continue;
      case 121: // 598f3f
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 598f3f: test eax, eax
        if (R.cBE) { pc = 123; continue; } // 598f41: jbe 0x598f49
        pc = 122; continue;
      case 122: // 598f43
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.ecx >>> 0)); // 598f43: mov dword ptr [esp + 0x44], ecx
        pc = 124; continue; // 598f47: jmp 0x598f4f
      case 123: // 598f49
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 598f49: xor eax, eax
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.eax >>> 0)); // 598f4b: mov dword ptr [esp + 0x44], eax
        pc = 124; continue;
      default: return pc;
    }
  }
}
function f_598800_14(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 124: // 598f4f
        R.edx = R.eax < 0 ? -1 : 0; // 598f4f: cdq 
        R.eax = (R.sub((R.eax >>> 0), 0x7a1200, 32)) | 0; // 598f50: sub eax, 0x7a1200
        R.ecx = (0x0) | 0; // 598f55: mov ecx, 0
        R.edx = (R.sub((R.edx >>> 0), (R.ecx >>> 0), 32, R.cf ? 1 : 0)) | 0; // 598f5a: sbb edx, ecx
        R.sub((R.edx >>> 0), (R.ecx >>> 0), 32); // 598f5c: cmp edx, ecx
        if (!R.cLE) { pc = 128; continue; } // 598f5e: jg 0x598f6c
        pc = 125; continue;
      case 125: // 598f60
        if (R.cL) { pc = 127; continue; } // 598f60: jl 0x598f66
        pc = 126; continue;
      case 126: // 598f62
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 598f62: cmp eax, ecx
        if (!R.cf) { pc = 128; continue; } // 598f64: jae 0x598f6c
        pc = 127; continue;
      case 127: // 598f66
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.ecx >>> 0)); // 598f66: mov dword ptr [esp + 0x44], ecx
        pc = 129; continue; // 598f6a: jmp 0x598f72
      case 128: // 598f6c
        R.ecx = ((R.eax >>> 0)) | 0; // 598f6c: mov ecx, eax
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.edx >>> 0)); // 598f6e: mov dword ptr [esp + 0x44], edx
        pc = 129; continue;
      case 129: // 598f72
        R.eax = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 598f72: mov eax, dword ptr [esp + 0x1c]
        R.edx = (R.logic((R.edx >>> 0) ^ (R.edx >>> 0), 32)) | 0; // 598f76: xor edx, edx
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 598f78: test eax, eax
        R.edx = ((R.edx & 0xffffff00) | (((R.cLE ? 1 : 0) & 0xff) << 0)) | 0; // 598f7a: setle dl
        R.edx = (R.incdec((R.edx >>> 0), -1, 32)) | 0; // 598f7d: dec edx
        R.eax = (R.logic((R.eax >>> 0) & (R.edx >>> 0), 32)) | 0; // 598f7e: and eax, edx
        R.edx = R.eax < 0 ? -1 : 0; // 598f80: cdq 
        R.ebp = ((R.eax >>> 0)) | 0; // 598f81: mov ebp, eax
        R.eax = ((R.ecx >>> 0)) | 0; // 598f83: mov eax, ecx
        R.ebx = ((R.edx >>> 0)) | 0; // 598f85: mov ebx, edx
        R.ecx = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 598f87: mov ecx, dword ptr [esp + 0x38]
        R.edx = R.eax < 0 ? -1 : 0; // 598f8b: cdq 
        R.ebp = (R.add((R.ebp >>> 0), (R.eax >>> 0), 32)) | 0; // 598f8c: add ebp, eax
        R.eax = ((R.ebp >>> 0)) | 0; // 598f8e: mov eax, ebp
        R.ebx = (R.add((R.ebx >>> 0), (R.edx >>> 0), 32, R.cf ? 1 : 0)) | 0; // 598f90: adc ebx, edx
        R.edx = R.eax < 0 ? -1 : 0; // 598f92: cdq 
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 598f93: sub ecx, eax
        R.eax = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 598f95: mov eax, dword ptr [esp + 0x3c]
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32, R.cf ? 1 : 0)) | 0; // 598f99: sbb eax, edx
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.ecx >>> 0)); // 598f9b: mov dword ptr [esp + 0x38], ecx
        R.m.w32(((R.esp + 0x3c) | 0) >>> 0, (R.eax >>> 0)); // 598f9f: mov dword ptr [esp + 0x3c], eax
        if (R.sf) { pc = 183; continue; } // 598fa3: js 0x599214
        pc = 130; continue;
      case 130: // 598fa9
        if (!R.cLE) { pc = 132; continue; } // 598fa9: jg 0x598fb5
        pc = 131; continue;
      case 131: // 598fab
        R.eax = ((R.ecx >>> 0)) | 0; // 598fab: mov eax, ecx
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 598fad: test eax, eax
        if (R.cBE) { pc = 183; continue; } // 598faf: jbe 0x599214
        pc = 132; continue;
      default: return pc;
    }
  }
}
function f_598800_15(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 132: // 598fb5
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 598fb5: mov eax, dword ptr [esp + 0x14]
        R.esi = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 598fb9: mov esi, dword ptr [eax]
        R.edi = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 598fbb: mov edi, dword ptr [eax + 4]
        R.m.w32(((R.esp + 0x40) | 0) >>> 0, (R.esi >>> 0)); // 598fbe: mov dword ptr [esp + 0x40], esi
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.edi >>> 0)); // 598fc2: mov dword ptr [esp + 0x44], edi
        R.fpush(R.i64(((R.esp + 0x40) | 0))); // 598fc6: fild qword ptr [esp + 0x40]
        R.st[0] = R.st[0] * 0.1; // 598fca: fmul qword ptr [0x967880]
        R.m.wf64(((R.esp + 0x1c) | 0) >>> 0, R.st[0]); R.fpop(); // 598fd0: fstp qword ptr [esp + 0x1c]
        R.fpush(R.i64(((R.esp + 0x38) | 0))); // 598fd4: fild qword ptr [esp + 0x38]
        R.fcom(R.st[0], R.f64(((R.esp + 0x1c) | 0))); R.fpop(); // 598fd8: fcomp qword ptr [esp + 0x1c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 598fdc: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 598fde: test ah, 1
        if (R.zf) { pc = 136; continue; } // 598fe1: je 0x599024
        pc = 133; continue;
      case 133: // 598fe3
        R.fpop(); // 598fe3: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x1c) | 0))); // 598fe5: fld qword ptr [esp + 0x1c]
        R.fcom(R.st[0], 2500000.0); R.fpop(); // 598fe9: fcomp qword ptr [0x96a650]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 598fef: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 598ff1: test ah, 1
        if (R.zf) { pc = 135; continue; } // 598ff4: je 0x59900c
        pc = 134; continue;
      case 134: // 598ff6
        R.fpush(R.f64(((R.esp + 0x1c) | 0))); // 598ff6: fld qword ptr [esp + 0x1c]
        R.ftol(); // 598ffa: call 0x945640
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.eax >>> 0)); // 598fff: mov dword ptr [esp + 0x38], eax
        R.m.w32(((R.esp + 0x3c) | 0) >>> 0, (R.edx >>> 0)); // 599003: mov dword ptr [esp + 0x3c], edx
        pc = 184; continue; // 599007: jmp 0x599216
      case 135: // 59900c
        R.fpush(2500000.0); // 59900c: fld qword ptr [0x96a650]
        R.ftol(); // 599012: call 0x945640
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.eax >>> 0)); // 599017: mov dword ptr [esp + 0x38], eax
        R.m.w32(((R.esp + 0x3c) | 0) >>> 0, (R.edx >>> 0)); // 59901b: mov dword ptr [esp + 0x3c], edx
        pc = 184; continue; // 59901f: jmp 0x599216
      case 136: // 599024
        R.st[0] = R.st[0] * 0.5; // 599024: fmul qword ptr [0x968968]
        R.ftol(); // 59902a: call 0x945640
        R.ecx = ((R.eax >>> 0)) | 0; // 59902f: mov ecx, eax
        R.eax = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 599031: mov eax, dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x5c) | 0) >>> 0, (R.ecx >>> 0)); // 599035: mov dword ptr [esp + 0x5c], ecx
        R.eax = (R.m.u32(((R.eax + 0xcf) | 0) >>> 0)) | 0; // 599039: mov eax, dword ptr [eax + 0xcf]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 59903f: test eax, eax
        if (R.zf) { pc = 144; continue; } // 599041: je 0x59909d
        pc = 137; continue;
      case 137: // 599043
        R.sub(R.m.u16(((R.esp + 0x34) | 0) >>> 0), 0x0, 16); // 599043: cmp word ptr [esp + 0x34], 0
        if (R.zf) { pc = 144; continue; } // 599049: je 0x59909d
        pc = 138; continue;
      case 138: // 59904b
        R.eax = (R.m.u32(((R.eax + 0x69) | 0) >>> 0)) | 0; // 59904b: mov eax, dword ptr [eax + 0x69]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 59904e: test eax, eax
        if (R.zf) { pc = 144; continue; } // 599050: je 0x59909d
        pc = 139; continue;
      default: return pc;
    }
  }
}
function f_598800_16(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 139: // 599052
        R.edx = (((R.m.u16(((R.eax + 0xa) | 0) >>> 0)) << 16 >> 16)) | 0; // 599052: movsx edx, word ptr [eax + 0xa]
        R.m.w32(((R.esp + 0x50) | 0) >>> 0, (R.edx >>> 0)); // 599056: mov dword ptr [esp + 0x50], edx
        R.fpush(R.m.s32(((R.esp + 0x50) | 0) >>> 0)); // 59905a: fild dword ptr [esp + 0x50]
        R.st[0] = R.st[0] / R.m.s32(((R.esp + 0x18) | 0) >>> 0); // 59905e: fidiv dword ptr [esp + 0x18]
        R.fcom(R.st[0], 1.0); // 599062: fcom qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 599068: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 59906a: test ah, 1
        if (R.zf) { pc = 143; continue; } // 59906d: je 0x59909b
        pc = 140; continue;
      case 140: // 59906f
        R.fcom(R.st[0], 0.5); // 59906f: fcom qword ptr [0x968968]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 599075: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 599077: test ah, 1
        if (R.zf) { pc = 142; continue; } // 59907a: je 0x599084
        pc = 141; continue;
      case 141: // 59907c
        R.fpop(); // 59907c: fstp st(0)
        R.fpush(0.5); // 59907e: fld dword ptr [0x968f18]
        pc = 142; continue;
      case 142: // 599084
        R.fpush(R.m.s32(((R.esp + 0x5c) | 0) >>> 0)); // 599084: fild dword ptr [esp + 0x5c]
        R.st[0] = R.st[0] * R.st[1]; // 599088: fmul st(1)
        R.st[0] = R.st[0] * R.st[1]; // 59908a: fmul st(1)
        R.ftol(); // 59908c: call 0x945640
        R.ecx = ((R.eax >>> 0)) | 0; // 599091: mov ecx, eax
        R.fpop(); // 599093: fstp st(0)
        R.m.w32(((R.esp + 0x5c) | 0) >>> 0, (R.ecx >>> 0)); // 599095: mov dword ptr [esp + 0x5c], ecx
        pc = 144; continue; // 599099: jmp 0x59909d
      case 143: // 59909b
        R.fpop(); // 59909b: fstp st(0)
        pc = 144; continue;
      case 144: // 59909d
        R.eax = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 59909d: mov eax, dword ptr [esp + 0x10]
        R.m.w8(((R.esp + 0x50) | 0) >>> 0, 0x0); // 5990a1: mov byte ptr [esp + 0x50], 0
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x82) | 0) >>> 0)) & 0xff) << 0)) | 0; // 5990a6: mov dl, byte ptr [eax + 0x82]
        R.logic(((R.edx >>> 0) & 0xff) & ((R.edx >>> 0) & 0xff), 8); // 5990ac: test dl, dl
        if (!R.zf) { pc = 155; continue; } // 5990ae: jne 0x599104
        pc = 145; continue;
      case 145: // 5990b0
        R.eax = (R.m.u32(((R.esp + 0x28) | 0) >>> 0)) | 0; // 5990b0: mov eax, dword ptr [esp + 0x28]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5990b4: test eax, eax
        if (R.zf) { pc = 155; continue; } // 5990b6: je 0x599104
        pc = 146; continue;
      case 146: // 5990b8
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 5990b8: mov eax, dword ptr [eax]
        R.edx = (R.m.u32(((0x9cf4a8) | 0) >>> 0)) | 0; // 5990ba: mov edx, dword ptr [0x9cf4a8]
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 5990c0: cmp eax, edx
        if (R.zf) { pc = 155; continue; } // 5990c2: je 0x599104
        pc = 147; continue;
      case 147: // 5990c4
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf408) | 0) >>> 0), 32); // 5990c4: cmp eax, dword ptr [0x9cf408]
        if (R.zf) { pc = 155; continue; } // 5990ca: je 0x599104
        pc = 148; continue;
      case 148: // 5990cc
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf4f8) | 0) >>> 0), 32); // 5990cc: cmp eax, dword ptr [0x9cf4f8]
        if (R.zf) { pc = 155; continue; } // 5990d2: je 0x599104
        pc = 149; continue;
      default: return pc;
    }
  }
}
function f_598800_17(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 149: // 5990d4
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf434) | 0) >>> 0), 32); // 5990d4: cmp eax, dword ptr [0x9cf434]
        if (R.zf) { pc = 155; continue; } // 5990da: je 0x599104
        pc = 150; continue;
      case 150: // 5990dc
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf2c0) | 0) >>> 0), 32); // 5990dc: cmp eax, dword ptr [0x9cf2c0]
        if (R.zf) { pc = 155; continue; } // 5990e2: je 0x599104
        pc = 151; continue;
      case 151: // 5990e4
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf2fc) | 0) >>> 0), 32); // 5990e4: cmp eax, dword ptr [0x9cf2fc]
        if (R.zf) { pc = 155; continue; } // 5990ea: je 0x599104
        pc = 152; continue;
      case 152: // 5990ec
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf45c) | 0) >>> 0), 32); // 5990ec: cmp eax, dword ptr [0x9cf45c]
        if (R.zf) { pc = 155; continue; } // 5990f2: je 0x599104
        pc = 153; continue;
      case 153: // 5990f4
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf4dc) | 0) >>> 0), 32); // 5990f4: cmp eax, dword ptr [0x9cf4dc]
        if (R.zf) { pc = 155; continue; } // 5990fa: je 0x599104
        pc = 154; continue;
      case 154: // 5990fc
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf314) | 0) >>> 0), 32); // 5990fc: cmp eax, dword ptr [0x9cf314]
        if (!R.zf) { pc = 156; continue; } // 599102: jne 0x599109
        pc = 155; continue;
      case 155: // 599104
        R.m.w8(((R.esp + 0x50) | 0) >>> 0, 0x1); // 599104: mov byte ptr [esp + 0x50], 1
        pc = 156; continue;
      case 156: // 599109
        R.eax = (R.m.u32(((R.esp + 0x28) | 0) >>> 0)) | 0; // 599109: mov eax, dword ptr [esp + 0x28]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 59910d: test eax, eax
        if (R.zf) { pc = 167; continue; } // 59910f: je 0x59916b
        pc = 157; continue;
      case 157: // 599111
        R.edx = (R.m.u32(((0x9cf314) | 0) >>> 0)) | 0; // 599111: mov edx, dword ptr [0x9cf314]
        R.sub(R.m.u32(((R.eax) | 0) >>> 0), (R.edx >>> 0), 32); // 599117: cmp dword ptr [eax], edx
        if (R.zf) { pc = 167; continue; } // 599119: je 0x59916b
        pc = 158; continue;
      case 158: // 59911b
        R.eax = ((R.ecx >>> 0)) | 0; // 59911b: mov eax, ecx
        R.esi = (R.sub((R.esi >>> 0), 0x989680, 32)) | 0; // 59911d: sub esi, 0x989680
        R.edx = R.eax < 0 ? -1 : 0; // 599123: cdq 
        R.edi = (R.sub((R.edi >>> 0), 0x0, 32, R.cf ? 1 : 0)) | 0; // 599124: sbb edi, 0
        R.sub((R.edx >>> 0), (R.edi >>> 0), 32); // 599127: cmp edx, edi
        if (!R.cLE) { pc = 162; continue; } // 599129: jg 0x599141
        pc = 159; continue;
      case 159: // 59912b
        if (R.cL) { pc = 161; continue; } // 59912b: jl 0x599131
        pc = 160; continue;
      case 160: // 59912d
        R.sub((R.eax >>> 0), (R.esi >>> 0), 32); // 59912d: cmp eax, esi
        if (!R.cf) { pc = 162; continue; } // 59912f: jae 0x599141
        pc = 161; continue;
      case 161: // 599131
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 599131: mov eax, dword ptr [esp + 0x14]
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 599135: mov ecx, dword ptr [eax]
        R.ecx = (R.sub((R.ecx >>> 0), 0x989680, 32)) | 0; // 599137: sub ecx, 0x989680
        R.m.w32(((R.esp + 0x5c) | 0) >>> 0, (R.ecx >>> 0)); // 59913d: mov dword ptr [esp + 0x5c], ecx
        pc = 162; continue;
      default: return pc;
    }
  }
}
function f_598800_18(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 162: // 599141
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x50) | 0) >>> 0)) & 0xff) << 0)) | 0; // 599141: mov al, byte ptr [esp + 0x50]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 599145: test al, al
        if (R.zf) { pc = 177; continue; } // 599147: je 0x5991bf
        pc = 163; continue;
      case 163: // 599149
        R.edi = (0x2625a00) | 0; // 599149: mov edi, 0x2625a00
        R.eax = ((R.ecx >>> 0)) | 0; // 59914e: mov eax, ecx
        R.edi = (R.sub((R.edi >>> 0), (R.ebp >>> 0), 32)) | 0; // 599150: sub edi, ebp
        R.esi = (0x0) | 0; // 599152: mov esi, 0
        R.edx = R.eax < 0 ? -1 : 0; // 599157: cdq 
        R.esi = (R.sub((R.esi >>> 0), (R.ebx >>> 0), 32, R.cf ? 1 : 0)) | 0; // 599158: sbb esi, ebx
        R.sub((R.edx >>> 0), (R.esi >>> 0), 32); // 59915a: cmp edx, esi
        if (R.cL) { pc = 177; continue; } // 59915c: jl 0x5991bf
        pc = 164; continue;
      case 164: // 59915e
        if (!R.cLE) { pc = 166; continue; } // 59915e: jg 0x599164
        pc = 165; continue;
      case 165: // 599160
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 599160: cmp eax, edi
        if (R.cBE) { pc = 177; continue; } // 599162: jbe 0x5991bf
        pc = 166; continue;
      case 166: // 599164
        R.ecx = (0x2625a00) | 0; // 599164: mov ecx, 0x2625a00
        pc = 176; continue; // 599169: jmp 0x5991b9
      case 167: // 59916b
        R.eax = ((R.ecx >>> 0)) | 0; // 59916b: mov eax, ecx
        R.esi = (R.sub((R.esi >>> 0), 0xe4e1c0, 32)) | 0; // 59916d: sub esi, 0xe4e1c0
        R.edx = R.eax < 0 ? -1 : 0; // 599173: cdq 
        R.edi = (R.sub((R.edi >>> 0), 0x0, 32, R.cf ? 1 : 0)) | 0; // 599174: sbb edi, 0
        R.sub((R.edx >>> 0), (R.edi >>> 0), 32); // 599177: cmp edx, edi
        if (!R.cLE) { pc = 171; continue; } // 599179: jg 0x599191
        pc = 168; continue;
      case 168: // 59917b
        if (R.cL) { pc = 170; continue; } // 59917b: jl 0x599181
        pc = 169; continue;
      case 169: // 59917d
        R.sub((R.eax >>> 0), (R.esi >>> 0), 32); // 59917d: cmp eax, esi
        if (!R.cf) { pc = 171; continue; } // 59917f: jae 0x599191
        pc = 170; continue;
      case 170: // 599181
        R.ecx = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 599181: mov ecx, dword ptr [esp + 0x14]
        R.ecx = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 599185: mov ecx, dword ptr [ecx]
        R.ecx = (R.sub((R.ecx >>> 0), 0xe4e1c0, 32)) | 0; // 599187: sub ecx, 0xe4e1c0
        R.m.w32(((R.esp + 0x5c) | 0) >>> 0, (R.ecx >>> 0)); // 59918d: mov dword ptr [esp + 0x5c], ecx
        pc = 171; continue;
      case 171: // 599191
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x50) | 0) >>> 0)) & 0xff) << 0)) | 0; // 599191: mov al, byte ptr [esp + 0x50]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 599195: test al, al
        if (R.zf) { pc = 177; continue; } // 599197: je 0x5991bf
        pc = 172; continue;
      default: return pc;
    }
  }
}
function f_598800_19(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 172: // 599199
        R.edi = (0x2160ec0) | 0; // 599199: mov edi, 0x2160ec0
        R.eax = ((R.ecx >>> 0)) | 0; // 59919e: mov eax, ecx
        R.edi = (R.sub((R.edi >>> 0), (R.ebp >>> 0), 32)) | 0; // 5991a0: sub edi, ebp
        R.esi = (0x0) | 0; // 5991a2: mov esi, 0
        R.edx = R.eax < 0 ? -1 : 0; // 5991a7: cdq 
        R.esi = (R.sub((R.esi >>> 0), (R.ebx >>> 0), 32, R.cf ? 1 : 0)) | 0; // 5991a8: sbb esi, ebx
        R.sub((R.edx >>> 0), (R.esi >>> 0), 32); // 5991aa: cmp edx, esi
        if (R.cL) { pc = 177; continue; } // 5991ac: jl 0x5991bf
        pc = 173; continue;
      case 173: // 5991ae
        if (!R.cLE) { pc = 175; continue; } // 5991ae: jg 0x5991b4
        pc = 174; continue;
      case 174: // 5991b0
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 5991b0: cmp eax, edi
        if (R.cBE) { pc = 177; continue; } // 5991b2: jbe 0x5991bf
        pc = 175; continue;
      case 175: // 5991b4
        R.ecx = (0x2160ec0) | 0; // 5991b4: mov ecx, 0x2160ec0
        pc = 176; continue;
      case 176: // 5991b9
        R.ecx = (R.sub((R.ecx >>> 0), (R.ebp >>> 0), 32)) | 0; // 5991b9: sub ecx, ebp
        R.m.w32(((R.esp + 0x5c) | 0) >>> 0, (R.ecx >>> 0)); // 5991bb: mov dword ptr [esp + 0x5c], ecx
        pc = 177; continue;
      case 177: // 5991bf
        R.sub((R.ecx >>> 0), 0xc350, 32); // 5991bf: cmp ecx, 0xc350
        if (!R.cL) { pc = 179; continue; } // 5991c5: jge 0x5991d0
        pc = 178; continue;
      case 178: // 5991c7
        R.ecx = (0xc350) | 0; // 5991c7: mov ecx, 0xc350
        R.m.w32(((R.esp + 0x5c) | 0) >>> 0, (R.ecx >>> 0)); // 5991cc: mov dword ptr [esp + 0x5c], ecx
        pc = 179; continue;
      case 179: // 5991d0
        R.eax = ((R.ecx >>> 0)) | 0; // 5991d0: mov eax, ecx
        R.ecx = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 5991d2: mov ecx, dword ptr [esp + 0x3c]
        R.edx = R.eax < 0 ? -1 : 0; // 5991d6: cdq 
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 5991d7: cmp ecx, edx
        if (R.cL) { pc = 184; continue; } // 5991d9: jl 0x599216
        pc = 180; continue;
      case 180: // 5991db
        if (!R.cLE) { pc = 182; continue; } // 5991db: jg 0x5991e3
        pc = 181; continue;
      case 181: // 5991dd
        R.sub(R.m.u32(((R.esp + 0x38) | 0) >>> 0), (R.eax >>> 0), 32); // 5991dd: cmp dword ptr [esp + 0x38], eax
        if (R.cBE) { pc = 184; continue; } // 5991e1: jbe 0x599216
        pc = 182; continue;
      case 182: // 5991e3
        R.ecx = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 5991e3: mov ecx, dword ptr [esp + 0x38]
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 5991e7: sub ecx, eax
        R.eax = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 5991e9: mov eax, dword ptr [esp + 0x3c]
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32, R.cf ? 1 : 0)) | 0; // 5991ed: sbb eax, edx
        R.m.w32(((R.esp + 0x40) | 0) >>> 0, (R.ecx >>> 0)); // 5991ef: mov dword ptr [esp + 0x40], ecx
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.eax >>> 0)); // 5991f3: mov dword ptr [esp + 0x44], eax
        R.fpush(R.i64(((R.esp + 0x40) | 0))); // 5991f7: fild qword ptr [esp + 0x40]
        R.st[0] = R.st[0] * 0.1; // 5991fb: fmul qword ptr [0x967880]
        R.st[0] = R.st[0] + R.m.s32(((R.esp + 0x5c) | 0) >>> 0); // 599201: fiadd dword ptr [esp + 0x5c]
        R.ftol(); // 599205: call 0x945640
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.eax >>> 0)); // 59920a: mov dword ptr [esp + 0x38], eax
        R.m.w32(((R.esp + 0x3c) | 0) >>> 0, (R.edx >>> 0)); // 59920e: mov dword ptr [esp + 0x3c], edx
        pc = 184; continue; // 599212: jmp 0x599216
      default: return pc;
    }
  }
}
function f_598800_20(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 183: // 599214
        R.fpop(); // 599214: fstp st(0)
        pc = 184; continue;
      case 184: // 599216
        R.ecx = (R.m.u32(((0xb67a44) | 0) >>> 0)) | 0; // 599216: mov ecx, dword ptr [0xb67a44]
        R.ebx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 59921c: mov ebx, dword ptr [esp + 0x10]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 599220: test ecx, ecx
        if (R.zf) { pc = 188; continue; } // 599222: je 0x599256
        pc = 185; continue;
      case 185: // 599224
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 599224: test ebx, ebx
        if (!R.zf) { pc = 187; continue; } // 599226: jne 0x599239
        pc = 186; continue;
      case 186: // 599228
        R.ebp = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 599228: mov ebp, dword ptr [esp + 0x38]
        R.edi = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 59922c: mov edi, dword ptr [esp + 0x3c]
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 599230: xor eax, eax
        R.edx = R.eax < 0 ? -1 : 0; // 599232: cdq 
        R.ebp = (R.add((R.ebp >>> 0), (R.eax >>> 0), 32)) | 0; // 599233: add ebp, eax
        R.edi = (R.add((R.edi >>> 0), (R.edx >>> 0), 32, R.cf ? 1 : 0)) | 0; // 599235: adc edi, edx
        pc = 189; continue; // 599237: jmp 0x59925e
      case 187: // 599239
        R.eax = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 599239: mov eax, dword ptr [ebx]
        R.ecx = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 59923b: mov ecx, dword ptr [ecx]
        R.ebp = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 59923d: mov ebp, dword ptr [esp + 0x38]
        R.edi = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 599241: mov edi, dword ptr [esp + 0x3c]
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 599245: lea edx, [eax + eax*8]
        R.eax = (((R.eax + R.edx * 8) | 0)) | 0; // 599248: lea eax, [eax + edx*8]
        R.eax = (R.m.u32(((R.eax + R.ecx + 0x28) | 0) >>> 0)) | 0; // 59924b: mov eax, dword ptr [eax + ecx + 0x28]
        R.edx = R.eax < 0 ? -1 : 0; // 59924f: cdq 
        R.ebp = (R.add((R.ebp >>> 0), (R.eax >>> 0), 32)) | 0; // 599250: add ebp, eax
        R.edi = (R.add((R.edi >>> 0), (R.edx >>> 0), 32, R.cf ? 1 : 0)) | 0; // 599252: adc edi, edx
        pc = 189; continue; // 599254: jmp 0x59925e
      case 188: // 599256
        R.ebp = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 599256: mov ebp, dword ptr [esp + 0x38]
        R.edi = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 59925a: mov edi, dword ptr [esp + 0x3c]
        pc = 189; continue;
      case 189: // 59925e
        R.esi = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 59925e: mov esi, dword ptr [esp + 0x34]
        R.sub(((R.esi >>> 0) & 0xffff), 0x1388, 16); // 599262: cmp si, 0x1388
        if (R.cLE) { pc = 197; continue; } // 599267: jle 0x5992b9
        pc = 190; continue;
      case 190: // 599269
        R.fpush(R.m.s32(((R.esp + 0x18) | 0) >>> 0)); // 599269: fild dword ptr [esp + 0x18]
        R.edx = (R.m.u32(((R.esp + 0x2c) | 0) >>> 0)) | 0; // 59926d: mov edx, dword ptr [esp + 0x2c]
        R.eax = (((R.m.u16(((R.edx + 0x69) | 0) >>> 0)) << 16 >> 16)) | 0; // 599271: movsx eax, word ptr [edx + 0x69]
        R.st[0] = R.st[0] * 200.0; // 599275: fmul qword ptr [0x96a648]
        R.m.w32(((R.esp + 0x50) | 0) >>> 0, (R.eax >>> 0)); // 59927b: mov dword ptr [esp + 0x50], eax
        R.st[0] = R.st[0] - 1000000.0; // 59927f: fsub qword ptr [0x9688d8]
        R.fpush(R.m.s32(((R.esp + 0x50) | 0) >>> 0)); // 599285: fild dword ptr [esp + 0x50]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 599289: fmulp st(1)
        R.st[0] = R.st[0] * 0.058823529411764705; // 59928b: fmul qword ptr [0x96a640]
        R.ftol(); // 599291: call 0x945640
        R.sub((R.edi >>> 0), (R.edx >>> 0), 32); // 599296: cmp edi, edx
        if (!R.cLE) { pc = 197; continue; } // 599298: jg 0x5992b9
        pc = 191; continue;
      case 191: // 59929a
        if (R.cL) { pc = 193; continue; } // 59929a: jl 0x5992a0
        pc = 192; continue;
      default: return pc;
    }
  }
}
function f_598800_21(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 192: // 59929c
        R.sub((R.ebp >>> 0), (R.eax >>> 0), 32); // 59929c: cmp ebp, eax
        if (!R.cf) { pc = 197; continue; } // 59929e: jae 0x5992b9
        pc = 193; continue;
      case 193: // 5992a0
        R.edi = ((R.edx >>> 0)) | 0; // 5992a0: mov edi, edx
        R.ebp = ((R.eax >>> 0)) | 0; // 5992a2: mov ebp, eax
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 5992a4: test edi, edi
        if (!R.cLE) { pc = 197; continue; } // 5992a6: jg 0x5992b9
        pc = 194; continue;
      case 194: // 5992a8
        if (R.cL) { pc = 196; continue; } // 5992a8: jl 0x5992b2
        pc = 195; continue;
      case 195: // 5992aa
        R.sub((R.ebp >>> 0), 0xc350, 32); // 5992aa: cmp ebp, 0xc350
        if (!R.cf) { pc = 197; continue; } // 5992b0: jae 0x5992b9
        pc = 196; continue;
      case 196: // 5992b2
        R.ebp = (0xc350) | 0; // 5992b2: mov ebp, 0xc350
        R.edi = (R.logic((R.edi >>> 0) ^ (R.edi >>> 0), 32)) | 0; // 5992b7: xor edi, edi
        pc = 197; continue;
      case 197: // 5992b9
        R.sub(((R.esi >>> 0) & 0xffff), 0xdac, 16); // 5992b9: cmp si, 0xdac
        if (!R.cL) { pc = 205; continue; } // 5992be: jge 0x5992f3
        pc = 198; continue;
      case 198: // 5992c0
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebx + 0x64) | 0) >>> 0)) & 0xff) << 0)) | 0; // 5992c0: mov al, byte ptr [ebx + 0x64]
        R.sub(((R.eax >>> 0) & 0xff), 0x1, 8); // 5992c3: cmp al, 1
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 5992c5: mov eax, dword ptr [esp + 0x18]
        if (!R.zf) { pc = 200; continue; } // 5992c9: jne 0x5992d9
        pc = 199; continue;
      case 199: // 5992cb
        R.ecx = (((R.eax + R.eax * 2) | 0)) | 0; // 5992cb: lea ecx, [eax + eax*2]
        R.eax = (((R.eax + R.ecx * 8) | 0)) | 0; // 5992ce: lea eax, [eax + ecx*8]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 5992d1: lea eax, [eax + eax*4]
        R.eax = (R.shl((R.eax >>> 0), 0x2, 32)) | 0; // 5992d4: shl eax, 2
        pc = 201; continue; // 5992d7: jmp 0x5992e4
      case 200: // 5992d9
        R.edx = (((R.eax + R.eax * 2) | 0)) | 0; // 5992d9: lea edx, [eax + eax*2]
        R.eax = (((R.eax + R.edx * 8) | 0)) | 0; // 5992dc: lea eax, [eax + edx*8]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 5992df: lea eax, [eax + eax*4]
        R.eax = (R.shl((R.eax >>> 0), 0x1, 32)) | 0; // 5992e2: shl eax, 1
        pc = 201; continue;
      case 201: // 5992e4
        R.edx = R.eax < 0 ? -1 : 0; // 5992e4: cdq 
        R.sub((R.edi >>> 0), (R.edx >>> 0), 32); // 5992e5: cmp edi, edx
        if (R.cL) { pc = 205; continue; } // 5992e7: jl 0x5992f3
        pc = 202; continue;
      case 202: // 5992e9
        if (!R.cLE) { pc = 204; continue; } // 5992e9: jg 0x5992ef
        pc = 203; continue;
      case 203: // 5992eb
        R.sub((R.ebp >>> 0), (R.eax >>> 0), 32); // 5992eb: cmp ebp, eax
        if (R.cBE) { pc = 205; continue; } // 5992ed: jbe 0x5992f3
        pc = 204; continue;
      case 204: // 5992ef
        R.ebp = ((R.eax >>> 0)) | 0; // 5992ef: mov ebp, eax
        R.edi = ((R.edx >>> 0)) | 0; // 5992f1: mov edi, edx
        pc = 205; continue;
      default: return pc;
    }
  }
}
function f_598800_22(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 205: // 5992f3
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 5992f3: test edi, edi
        if (!R.cLE) { pc = 209; continue; } // 5992f5: jg 0x599301
        pc = 206; continue;
      case 206: // 5992f7
        if (R.cL) { pc = 208; continue; } // 5992f7: jl 0x5992fd
        pc = 207; continue;
      case 207: // 5992f9
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 5992f9: test ebp, ebp
        if (!R.cf) { pc = 209; continue; } // 5992fb: jae 0x599301
        pc = 208; continue;
      case 208: // 5992fd
        R.ebp = (R.logic((R.ebp >>> 0) ^ (R.ebp >>> 0), 32)) | 0; // 5992fd: xor ebp, ebp
        R.edi = (R.logic((R.edi >>> 0) ^ (R.edi >>> 0), 32)) | 0; // 5992ff: xor edi, edi
        pc = 209; continue;
      case 209: // 599301
        R.eax = (R.m.u32(((R.esp + 0x28) | 0) >>> 0)) | 0; // 599301: mov eax, dword ptr [esp + 0x28]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 599305: test eax, eax
        if (R.zf) { pc = 244; continue; } // 599307: je 0x5994a8
        pc = 210; continue;
      case 210: // 59930d
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 59930d: mov eax, dword ptr [eax]
        R.ecx = (R.m.u32(((0x9cf4a8) | 0) >>> 0)) | 0; // 59930f: mov ecx, dword ptr [0x9cf4a8]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 599315: cmp eax, ecx
        if (R.zf) { pc = 238; continue; } // 599317: je 0x599461
        pc = 211; continue;
      case 211: // 59931d
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf408) | 0) >>> 0), 32); // 59931d: cmp eax, dword ptr [0x9cf408]
        if (R.zf) { pc = 238; continue; } // 599323: je 0x599461
        pc = 212; continue;
      case 212: // 599329
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf2c0) | 0) >>> 0), 32); // 599329: cmp eax, dword ptr [0x9cf2c0]
        if (R.zf) { pc = 238; continue; } // 59932f: je 0x599461
        pc = 213; continue;
      case 213: // 599335
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf510) | 0) >>> 0), 32); // 599335: cmp eax, dword ptr [0x9cf510]
        if (R.zf) { pc = 238; continue; } // 59933b: je 0x599461
        pc = 214; continue;
      case 214: // 599341
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf4f8) | 0) >>> 0), 32); // 599341: cmp eax, dword ptr [0x9cf4f8]
        if (R.zf) { pc = 238; continue; } // 599347: je 0x599461
        pc = 215; continue;
      case 215: // 59934d
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf2fc) | 0) >>> 0), 32); // 59934d: cmp eax, dword ptr [0x9cf2fc]
        if (R.zf) { pc = 238; continue; } // 599353: je 0x599461
        pc = 216; continue;
      case 216: // 599359
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf2dc) | 0) >>> 0), 32); // 599359: cmp eax, dword ptr [0x9cf2dc]
        if (R.zf) { pc = 238; continue; } // 59935f: je 0x599461
        pc = 217; continue;
      case 217: // 599365
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf3e4) | 0) >>> 0), 32); // 599365: cmp eax, dword ptr [0x9cf3e4]
        if (R.zf) { pc = 238; continue; } // 59936b: je 0x599461
        pc = 218; continue;
      case 218: // 599371
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf218) | 0) >>> 0), 32); // 599371: cmp eax, dword ptr [0x9cf218]
        if (R.zf) { pc = 238; continue; } // 599377: je 0x599461
        pc = 219; continue;
      default: return pc;
    }
  }
}
function f_598800_23(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 219: // 59937d
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf244) | 0) >>> 0), 32); // 59937d: cmp eax, dword ptr [0x9cf244]
        if (R.zf) { pc = 234; continue; } // 599383: je 0x599430
        pc = 220; continue;
      case 220: // 599389
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf434) | 0) >>> 0), 32); // 599389: cmp eax, dword ptr [0x9cf434]
        if (R.zf) { pc = 234; continue; } // 59938f: je 0x599430
        pc = 221; continue;
      case 221: // 599395
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf260) | 0) >>> 0), 32); // 599395: cmp eax, dword ptr [0x9cf260]
        if (!R.zf) { pc = 226; continue; } // 59939b: jne 0x5993d3
        pc = 222; continue;
      case 222: // 59939d
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 59939d: test edi, edi
        if (R.cL) { pc = 244; continue; } // 59939f: jl 0x5994a8
        pc = 223; continue;
      case 223: // 5993a5
        if (!R.cLE) { pc = 225; continue; } // 5993a5: jg 0x5993b3
        pc = 224; continue;
      case 224: // 5993a7
        R.sub((R.ebp >>> 0), 0x2625a0, 32); // 5993a7: cmp ebp, 0x2625a0
        if (R.cBE) { pc = 244; continue; } // 5993ad: jbe 0x5994a8
        pc = 225; continue;
      case 225: // 5993b3
        R.ebp = (R.sub((R.ebp >>> 0), 0x2625a0, 32)) | 0; // 5993b3: sub ebp, 0x2625a0
        R.edi = (R.sub((R.edi >>> 0), 0x0, 32, R.cf ? 1 : 0)) | 0; // 5993b9: sbb edi, 0
        R.m.w32(((R.esp + 0x40) | 0) >>> 0, (R.ebp >>> 0)); // 5993bc: mov dword ptr [esp + 0x40], ebp
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.edi >>> 0)); // 5993c0: mov dword ptr [esp + 0x44], edi
        R.fpush(R.i64(((R.esp + 0x40) | 0))); // 5993c4: fild qword ptr [esp + 0x40]
        R.st[0] = R.st[0] * 0.25; // 5993c8: fmul qword ptr [0x9689e0]
        pc = 242; continue; // 5993ce: jmp 0x599499
      case 226: // 5993d3
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf314) | 0) >>> 0), 32); // 5993d3: cmp eax, dword ptr [0x9cf314]
        if (R.zf) { pc = 230; continue; } // 5993d9: je 0x5993f7
        pc = 227; continue;
      case 227: // 5993db
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf300) | 0) >>> 0), 32); // 5993db: cmp eax, dword ptr [0x9cf300]
        if (R.zf) { pc = 230; continue; } // 5993e1: je 0x5993f7
        pc = 228; continue;
      case 228: // 5993e3
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf45c) | 0) >>> 0), 32); // 5993e3: cmp eax, dword ptr [0x9cf45c]
        if (R.zf) { pc = 230; continue; } // 5993e9: je 0x5993f7
        pc = 229; continue;
      case 229: // 5993eb
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf338) | 0) >>> 0), 32); // 5993eb: cmp eax, dword ptr [0x9cf338]
        if (!R.zf) { pc = 244; continue; } // 5993f1: jne 0x5994a8
        pc = 230; continue;
      case 230: // 5993f7
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 5993f7: test edi, edi
        if (R.cL) { pc = 244; continue; } // 5993f9: jl 0x5994a8
        pc = 231; continue;
      case 231: // 5993ff
        if (!R.cLE) { pc = 233; continue; } // 5993ff: jg 0x59940d
        pc = 232; continue;
      case 232: // 599401
        R.sub((R.ebp >>> 0), 0x10b0760, 32); // 599401: cmp ebp, 0x10b0760
        if (R.cBE) { pc = 244; continue; } // 599407: jbe 0x5994a8
        pc = 233; continue;
      default: return pc;
    }
  }
}
function f_598800_24(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 233: // 59940d
        R.ebp = (R.sub((R.ebp >>> 0), 0x10b0760, 32)) | 0; // 59940d: sub ebp, 0x10b0760
        R.edi = (R.sub((R.edi >>> 0), 0x0, 32, R.cf ? 1 : 0)) | 0; // 599413: sbb edi, 0
        R.m.w32(((R.esp + 0x40) | 0) >>> 0, (R.ebp >>> 0)); // 599416: mov dword ptr [esp + 0x40], ebp
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.edi >>> 0)); // 59941a: mov dword ptr [esp + 0x44], edi
        R.fpush(R.i64(((R.esp + 0x40) | 0))); // 59941e: fild qword ptr [esp + 0x40]
        R.st[0] = R.st[0] * 0.25; // 599422: fmul qword ptr [0x9689e0]
        R.st[0] = R.st[0] + 17500000.0; // 599428: fadd qword ptr [0x96a638]
        pc = 243; continue; // 59942e: jmp 0x59949f
      case 234: // 599430
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 599430: test edi, edi
        if (R.cL) { pc = 244; continue; } // 599432: jl 0x5994a8
        pc = 235; continue;
      case 235: // 599434
        if (!R.cLE) { pc = 237; continue; } // 599434: jg 0x59943e
        pc = 236; continue;
      case 236: // 599436
        R.sub((R.ebp >>> 0), 0xe4e1c0, 32); // 599436: cmp ebp, 0xe4e1c0
        if (R.cBE) { pc = 244; continue; } // 59943c: jbe 0x5994a8
        pc = 237; continue;
      case 237: // 59943e
        R.ebp = (R.sub((R.ebp >>> 0), 0xe4e1c0, 32)) | 0; // 59943e: sub ebp, 0xe4e1c0
        R.edi = (R.sub((R.edi >>> 0), 0x0, 32, R.cf ? 1 : 0)) | 0; // 599444: sbb edi, 0
        R.m.w32(((R.esp + 0x40) | 0) >>> 0, (R.ebp >>> 0)); // 599447: mov dword ptr [esp + 0x40], ebp
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.edi >>> 0)); // 59944b: mov dword ptr [esp + 0x44], edi
        R.fpush(R.i64(((R.esp + 0x40) | 0))); // 59944f: fild qword ptr [esp + 0x40]
        R.st[0] = R.st[0] * 0.25; // 599453: fmul qword ptr [0x9689e0]
        R.st[0] = R.st[0] + 15000000.0; // 599459: fadd qword ptr [0x96a630]
        pc = 243; continue; // 59945f: jmp 0x59949f
      case 238: // 599461
        R.push(0x0); // 599461: push 0
        R.push(0x2); // 599463: push 2
        R.push((R.edi >>> 0)); // 599465: push edi
        R.push((R.ebp >>> 0)); // 599466: push ebp
        R.call(0x945e80, { n: 4, thisEcx: false, calleeClean: true }); // 599467: call 0x945e80
        R.edi = ((R.edx >>> 0)) | 0; // 59946c: mov edi, edx
        R.ebp = ((R.eax >>> 0)) | 0; // 59946e: mov ebp, eax
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 599470: test edi, edi
        if (R.cL) { pc = 244; continue; } // 599472: jl 0x5994a8
        pc = 239; continue;
      case 239: // 599474
        if (!R.cLE) { pc = 241; continue; } // 599474: jg 0x59947e
        pc = 240; continue;
      case 240: // 599476
        R.sub((R.ebp >>> 0), 0x2625a0, 32); // 599476: cmp ebp, 0x2625a0
        if (R.cBE) { pc = 244; continue; } // 59947c: jbe 0x5994a8
        pc = 241; continue;
      case 241: // 59947e
        R.ebp = (R.sub((R.ebp >>> 0), 0x2625a0, 32)) | 0; // 59947e: sub ebp, 0x2625a0
        R.edi = (R.sub((R.edi >>> 0), 0x0, 32, R.cf ? 1 : 0)) | 0; // 599484: sbb edi, 0
        R.m.w32(((R.esp + 0x40) | 0) >>> 0, (R.ebp >>> 0)); // 599487: mov dword ptr [esp + 0x40], ebp
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.edi >>> 0)); // 59948b: mov dword ptr [esp + 0x44], edi
        R.fpush(R.i64(((R.esp + 0x40) | 0))); // 59948f: fild qword ptr [esp + 0x40]
        R.st[0] = R.st[0] * 0.1; // 599493: fmul qword ptr [0x967880]
        pc = 242; continue;
      case 242: // 599499
        R.st[0] = R.st[0] + 2500000.0; // 599499: fadd qword ptr [0x96a650]
        pc = 243; continue;
      default: return pc;
    }
  }
}
function f_598800_25(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 243: // 59949f
        R.ftol(); // 59949f: call 0x945640
        R.ebp = ((R.eax >>> 0)) | 0; // 5994a4: mov ebp, eax
        R.edi = ((R.edx >>> 0)) | 0; // 5994a6: mov edi, edx
        pc = 244; continue;
      case 244: // 5994a8
        R.eax = (R.m.u32(((R.esp + 0x4c) | 0) >>> 0)) | 0; // 5994a8: mov eax, dword ptr [esp + 0x4c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5994ac: test eax, eax
        if (R.zf) { pc = 304; continue; } // 5994ae: je 0x5997de
        pc = 245; continue;
      case 245: // 5994b4
        R.eax = (R.m.u32(((R.esp + 0x58) | 0) >>> 0)) | 0; // 5994b4: mov eax, dword ptr [esp + 0x58]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5994b8: test eax, eax
        if (R.zf) { pc = 304; continue; } // 5994ba: je 0x5997de
        pc = 246; continue;
      case 246: // 5994c0
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((0x9cc270) | 0) >>> 0)) & 0xff) << 0)) | 0; // 5994c0: mov al, byte ptr [0x9cc270]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 5994c5: test al, al
        if (R.zf) { pc = 304; continue; } // 5994c7: je 0x5997de
        pc = 247; continue;
      case 247: // 5994cd
        R.eax = (R.m.u32(((0xae2a60) | 0) >>> 0)) | 0; // 5994cd: mov eax, dword ptr [0xae2a60]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5994d2: test eax, eax
        if (R.zf) { pc = 304; continue; } // 5994d4: je 0x5997de
        pc = 248; continue;
      case 248: // 5994da
        R.push(0x0); // 5994da: push 0
        R.push(0x0); // 5994dc: push 0
        R.push(0x1); // 5994de: push 1
        R.push(0x0); // 5994e0: push 0
        R.push((R.ebx >>> 0)); // 5994e2: push ebx
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 5994e3: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 5994e8: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5994eb: test eax, eax
        if (R.zf) { pc = 304; continue; } // 5994ed: je 0x5997de
        pc = 249; continue;
      case 249: // 5994f3
        R.eax = (R.m.u32(((R.ebx + 0xcf) | 0) >>> 0)) | 0; // 5994f3: mov eax, dword ptr [ebx + 0xcf]
        R.ecx = (R.m.u32(((0xae2a60) | 0) >>> 0)) | 0; // 5994f9: mov ecx, dword ptr [0xae2a60]
        R.push((R.eax >>> 0)); // 5994ff: push eax
        R.call(0x5afde0, { n: 1, thisEcx: false, calleeClean: true }); // 599500: call 0x5afde0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 599505: test eax, eax
        if (R.zf) { pc = 304; continue; } // 599507: je 0x5997de
        pc = 250; continue;
      case 250: // 59950d
        R.ecx = (R.m.u32(((R.esp + 0x4c) | 0) >>> 0)) | 0; // 59950d: mov ecx, dword ptr [esp + 0x4c]
        R.push((R.ecx >>> 0)); // 599511: push ecx
        R.ecx = ((R.eax >>> 0)) | 0; // 599512: mov ecx, eax
        R.call(0x5b02f0, { n: 1, thisEcx: true, calleeClean: true }); // 599514: call 0x5b02f0
        R.ebx = ((R.ebx & 0xffffff00) | (((((R.eax >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 599519: mov bl, al
        R.eax = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 59951b: movsx eax, bl
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 59951e: dec eax
        if (R.zf) { pc = 260; continue; } // 59951f: je 0x5995a8
        pc = 251; continue;
      case 251: // 599525
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 599525: dec eax
        if (R.zf) { pc = 259; continue; } // 599526: je 0x599589
        pc = 252; continue;
      default: return pc;
    }
  }
}
function f_598800_26(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 252: // 599528
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 599528: dec eax
        if (R.zf) { pc = 258; continue; } // 599529: je 0x599585
        pc = 253; continue;
      case 253: // 59952b
        R.ecx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 59952b: mov ecx, dword ptr [esp + 0x10]
        R.eax = (R.m.u32(((R.ecx + 0x53) | 0) >>> 0)) | 0; // 59952f: mov eax, dword ptr [ecx + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 599532: test eax, eax
        if (R.zf) { pc = 257; continue; } // 599534: je 0x599566
        pc = 254; continue;
      case 254: // 599536
        R.sub(R.m.u8(((R.eax + 0x85) | 0) >>> 0), 0x9, 8); // 599536: cmp byte ptr [eax + 0x85], 9
        if (!R.cL) { pc = 257; continue; } // 59953d: jge 0x599566
        pc = 255; continue;
      case 255: // 59953f
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.ecx + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 59953f: mov ax, word ptr [ecx + 0x80]
        R.sub(((R.eax >>> 0) & 0xffff), 0x109a, 16); // 599546: cmp ax, 0x109a
        if (!R.cL) { pc = 257; continue; } // 59954a: jge 0x599566
        pc = 256; continue;
      case 256: // 59954c
        R.edx = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 59954c: movsx edx, ax
        R.m.w32(((R.esp + 0x50) | 0) >>> 0, (R.edx >>> 0)); // 59954f: mov dword ptr [esp + 0x50], edx
        R.fpush(R.m.s32(((R.esp + 0x50) | 0) >>> 0)); // 599553: fild dword ptr [esp + 0x50]
        R.fpush(R.st[0]); // 599557: fld st(0)
        R.st[0] = R.st[0] * R.st[1]; // 599559: fmul st(1)
        R.st[0] = R.st[0] * 0.005; // 59955b: fmul qword ptr [0x968ef0]
        pc = 265; continue; // 599561: jmp 0x5995fd
      case 257: // 599566
        R.eax = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 599566: mov eax, dword ptr [esp + 0x10]
        R.ecx = (((R.m.u16(((R.eax + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 59956a: movsx ecx, word ptr [eax + 0x80]
        R.m.w32(((R.esp + 0x50) | 0) >>> 0, (R.ecx >>> 0)); // 599571: mov dword ptr [esp + 0x50], ecx
        R.fpush(R.m.s32(((R.esp + 0x50) | 0) >>> 0)); // 599575: fild dword ptr [esp + 0x50]
        R.fpush(R.st[0]); // 599579: fld st(0)
        R.st[0] = R.st[0] * R.st[1]; // 59957b: fmul st(1)
        R.st[0] = R.st[0] * 0.01; // 59957d: fmul qword ptr [0x967898]
        pc = 265; continue; // 599583: jmp 0x5995fd
      case 258: // 599585
        R.esi = ((R.ebp >>> 0)) | 0; // 599585: mov esi, ebp
        pc = 266; continue; // 599587: jmp 0x599606
      case 259: // 599589
        R.edx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 599589: mov edx, dword ptr [esp + 0x10]
        R.eax = (((R.m.u16(((R.edx + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 59958d: movsx eax, word ptr [edx + 0x80]
        R.m.w32(((R.esp + 0x50) | 0) >>> 0, (R.eax >>> 0)); // 599594: mov dword ptr [esp + 0x50], eax
        R.fpush(R.m.s32(((R.esp + 0x50) | 0) >>> 0)); // 599598: fild dword ptr [esp + 0x50]
        R.fpush(R.st[0]); // 59959c: fld st(0)
        R.st[0] = R.st[0] * R.st[1]; // 59959e: fmul st(1)
        R.st[0] = R.st[0] * 0.04; // 5995a0: fmul qword ptr [0x968a90]
        pc = 265; continue; // 5995a6: jmp 0x5995fd
      case 260: // 5995a8
        R.ecx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 5995a8: mov ecx, dword ptr [esp + 0x10]
        R.eax = (R.m.u32(((R.ecx + 0x53) | 0) >>> 0)) | 0; // 5995ac: mov eax, dword ptr [ecx + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5995af: test eax, eax
        if (R.zf) { pc = 264; continue; } // 5995b1: je 0x5995e0
        pc = 261; continue;
      case 261: // 5995b3
        R.sub(R.m.u8(((R.eax + 0x85) | 0) >>> 0), 0x9, 8); // 5995b3: cmp byte ptr [eax + 0x85], 9
        if (!R.cL) { pc = 264; continue; } // 5995ba: jge 0x5995e0
        pc = 262; continue;
      default: return pc;
    }
  }
}
function f_598800_27(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 262: // 5995bc
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.ecx + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 5995bc: mov ax, word ptr [ecx + 0x80]
        R.sub(((R.eax >>> 0) & 0xffff), 0x109a, 16); // 5995c3: cmp ax, 0x109a
        if (!R.cL) { pc = 264; continue; } // 5995c7: jge 0x5995e0
        pc = 263; continue;
      case 263: // 5995c9
        R.ecx = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 5995c9: movsx ecx, ax
        R.m.w32(((R.esp + 0x50) | 0) >>> 0, (R.ecx >>> 0)); // 5995cc: mov dword ptr [esp + 0x50], ecx
        R.fpush(R.m.s32(((R.esp + 0x50) | 0) >>> 0)); // 5995d0: fild dword ptr [esp + 0x50]
        R.fpush(R.st[0]); // 5995d4: fld st(0)
        R.st[0] = R.st[0] * R.st[1]; // 5995d6: fmul st(1)
        R.st[0] = R.st[0] * 0.01; // 5995d8: fmul qword ptr [0x967898]
        pc = 265; continue; // 5995de: jmp 0x5995fd
      case 264: // 5995e0
        R.edx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 5995e0: mov edx, dword ptr [esp + 0x10]
        R.eax = (((R.m.u16(((R.edx + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 5995e4: movsx eax, word ptr [edx + 0x80]
        R.m.w32(((R.esp + 0x50) | 0) >>> 0, (R.eax >>> 0)); // 5995eb: mov dword ptr [esp + 0x50], eax
        R.fpush(R.m.s32(((R.esp + 0x50) | 0) >>> 0)); // 5995ef: fild dword ptr [esp + 0x50]
        R.fpush(R.st[0]); // 5995f3: fld st(0)
        R.st[0] = R.st[0] * R.st[1]; // 5995f5: fmul st(1)
        R.st[0] = R.st[0] * 0.02; // 5995f7: fmul qword ptr [0x968a98]
        pc = 265; continue;
      case 265: // 5995fd
        R.ftol(); // 5995fd: call 0x945640
        R.fpop(); // 599602: fstp st(0)
        R.esi = ((R.eax >>> 0)) | 0; // 599604: mov esi, eax
        pc = 266; continue;
      case 266: // 599606
        R.edx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 599606: mov edx, dword ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x50) | 0) >>> 0, (R.esi >>> 0)); // 59960a: mov dword ptr [esp + 0x50], esi
        R.eax = (R.m.u32(((R.edx + 0xcf) | 0) >>> 0)) | 0; // 59960e: mov eax, dword ptr [edx + 0xcf]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 599614: test eax, eax
        if (R.zf) { pc = 274; continue; } // 599616: je 0x599687
        pc = 267; continue;
      case 267: // 599618
        R.eax = (R.m.u32(((R.eax + 0x69) | 0) >>> 0)) | 0; // 599618: mov eax, dword ptr [eax + 0x69]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 59961b: test eax, eax
        if (R.zf) { pc = 274; continue; } // 59961d: je 0x599687
        pc = 268; continue;
      case 268: // 59961f
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.edx + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 59961f: mov cx, word ptr [edx + 0x80]
        R.logic(((R.ecx >>> 0) & 0xffff) & ((R.ecx >>> 0) & 0xffff), 16); // 599626: test cx, cx
        if (R.zf) { pc = 274; continue; } // 599629: je 0x599687
        pc = 269; continue;
      case 269: // 59962b
        R.edx = (((R.m.u16(((R.eax + 0xa) | 0) >>> 0)) << 16 >> 16)) | 0; // 59962b: movsx edx, word ptr [eax + 0xa]
        R.eax = (((((R.ecx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 59962f: movsx eax, cx
        R.m.w32(((R.esp + 0x5c) | 0) >>> 0, (R.edx >>> 0)); // 599632: mov dword ptr [esp + 0x5c], edx
        R.fpush(R.m.s32(((R.esp + 0x5c) | 0) >>> 0)); // 599636: fild dword ptr [esp + 0x5c]
        R.m.w32(((R.esp + 0x5c) | 0) >>> 0, (R.eax >>> 0)); // 59963a: mov dword ptr [esp + 0x5c], eax
        R.fpush(R.m.s32(((R.esp + 0x5c) | 0) >>> 0)); // 59963e: fild dword ptr [esp + 0x5c]
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 599642: fdivp st(1)
        R.fcom(R.st[0], 1.0); // 599644: fcom qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 59964a: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 59964c: test ah, 0x41
        if (!R.zf) { pc = 271; continue; } // 59964f: jne 0x59965b
        pc = 270; continue;
      default: return pc;
    }
  }
}
function f_598800_28(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 270: // 599651
        R.fpop(); // 599651: fstp st(0)
        R.fpush(1.0); // 599653: fld qword ptr [0x967890]
        pc = 273; continue; // 599659: jmp 0x599670
      case 271: // 59965b
        R.fcom(R.st[0], 0.1); // 59965b: fcom qword ptr [0x967880]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 599661: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 599663: test ah, 1
        if (R.zf) { pc = 273; continue; } // 599666: je 0x599670
        pc = 272; continue;
      case 272: // 599668
        R.fpop(); // 599668: fstp st(0)
        R.fpush(0.1); // 59966a: fld qword ptr [0x967880]
        pc = 273; continue;
      case 273: // 599670
        R.fpush(R.m.s32(((R.esp + 0x50) | 0) >>> 0)); // 599670: fild dword ptr [esp + 0x50]
        R.st[0] = R.st[0] * R.st[1]; // 599674: fmul st(1)
        R.ftol(); // 599676: call 0x945640
        R.edx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 59967b: mov edx, dword ptr [esp + 0x10]
        R.esi = ((R.eax >>> 0)) | 0; // 59967f: mov esi, eax
        R.fpop(); // 599681: fstp st(0)
        R.m.w32(((R.esp + 0x50) | 0) >>> 0, (R.esi >>> 0)); // 599683: mov dword ptr [esp + 0x50], esi
        pc = 274; continue;
      case 274: // 599687
        R.eax = (R.m.u32(((R.edx + 0x57) | 0) >>> 0)) | 0; // 599687: mov eax, dword ptr [edx + 0x57]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 59968a: test eax, eax
        if (R.zf) { pc = 280; continue; } // 59968c: je 0x5996e9
        pc = 275; continue;
      case 275: // 59968e
        R.ecx = (R.m.u32(((R.edx + 0x53) | 0) >>> 0)) | 0; // 59968e: mov ecx, dword ptr [edx + 0x53]
        R.edx = (((R.m.u8(((R.ecx + 0x85) | 0) >>> 0)) << 24 >> 24)) | 0; // 599691: movsx edx, byte ptr [ecx + 0x85]
        R.m.w32(((R.esp + 0x5c) | 0) >>> 0, (R.edx >>> 0)); // 599698: mov dword ptr [esp + 0x5c], edx
        R.fpush(R.m.s32(((R.esp + 0x5c) | 0) >>> 0)); // 59969c: fild dword ptr [esp + 0x5c]
        R.st[0] = R.st[0] * 0.05; // 5996a0: fmul qword ptr [0x967888]
        R.fcom(R.st[0], 0.25); // 5996a6: fcom qword ptr [0x9689e0]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 5996ac: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 5996ae: test ah, 1
        if (R.zf) { pc = 277; continue; } // 5996b1: je 0x5996bd
        pc = 276; continue;
      case 276: // 5996b3
        R.fpop(); // 5996b3: fstp st(0)
        R.fpush(0.25); // 5996b5: fld qword ptr [0x9689e0]
        pc = 279; continue; // 5996bb: jmp 0x5996d2
      case 277: // 5996bd
        R.fcom(R.st[0], 1.0); // 5996bd: fcom qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 5996c3: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 5996c5: test ah, 0x41
        if (!R.zf) { pc = 279; continue; } // 5996c8: jne 0x5996d2
        pc = 278; continue;
      case 278: // 5996ca
        R.fpop(); // 5996ca: fstp st(0)
        R.fpush(1.0); // 5996cc: fld qword ptr [0x967890]
        pc = 279; continue;
      default: return pc;
    }
  }
}
function f_598800_29(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 279: // 5996d2
        R.fpush(R.m.s32(((R.esp + 0x50) | 0) >>> 0)); // 5996d2: fild dword ptr [esp + 0x50]
        R.st[0] = R.st[0] * R.st[1]; // 5996d6: fmul st(1)
        R.ftol(); // 5996d8: call 0x945640
        R.edx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 5996dd: mov edx, dword ptr [esp + 0x10]
        R.esi = ((R.eax >>> 0)) | 0; // 5996e1: mov esi, eax
        R.fpop(); // 5996e3: fstp st(0)
        R.m.w32(((R.esp + 0x50) | 0) >>> 0, (R.esi >>> 0)); // 5996e5: mov dword ptr [esp + 0x50], esi
        pc = 280; continue;
      case 280: // 5996e9
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 5996e9: mov eax, dword ptr [esp + 0x14]
        R.ecx = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 5996ed: mov ecx, dword ptr [eax + 4]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 5996f0: test ecx, ecx
        if (!R.cLE) { pc = 291; continue; } // 5996f2: jg 0x59976e
        pc = 281; continue;
      case 281: // 5996f4
        if (R.cL) { pc = 283; continue; } // 5996f4: jl 0x5996fb
        pc = 282; continue;
      case 282: // 5996f6
        R.sub(R.m.u32(((R.eax) | 0) >>> 0), 0x0, 32); // 5996f6: cmp dword ptr [eax], 0
        if (!R.cf) { pc = 291; continue; } // 5996f9: jae 0x59976e
        pc = 283; continue;
      case 283: // 5996fb
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.edx + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 5996fb: mov cx, word ptr [edx + 0x80]
        R.logic(((R.ecx >>> 0) & 0xffff) & ((R.ecx >>> 0) & 0xffff), 16); // 599702: test cx, cx
        if (R.zf) { pc = 291; continue; } // 599705: je 0x59976e
        pc = 284; continue;
      case 284: // 599707
        R.eax = (R.m.u32(((R.esp + 0x4c) | 0) >>> 0)) | 0; // 599707: mov eax, dword ptr [esp + 0x4c]
        R.eax = (R.m.u32(((R.eax + 0x61) | 0) >>> 0)) | 0; // 59970b: mov eax, dword ptr [eax + 0x61]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 59970e: test eax, eax
        if (R.zf) { pc = 289; continue; } // 599710: je 0x599759
        pc = 285; continue;
      case 285: // 599712
        R.edx = (((R.m.u16(((R.eax + 0xb) | 0) >>> 0)) << 16 >> 16)) | 0; // 599712: movsx edx, word ptr [eax + 0xb]
        R.eax = (((((R.ecx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 599716: movsx eax, cx
        R.m.w32(((R.esp + 0x4c) | 0) >>> 0, (R.edx >>> 0)); // 599719: mov dword ptr [esp + 0x4c], edx
        R.fpush(R.m.s32(((R.esp + 0x4c) | 0) >>> 0)); // 59971d: fild dword ptr [esp + 0x4c]
        R.m.w32(((R.esp + 0x4c) | 0) >>> 0, (R.eax >>> 0)); // 599721: mov dword ptr [esp + 0x4c], eax
        R.fpush(R.m.s32(((R.esp + 0x4c) | 0) >>> 0)); // 599725: fild dword ptr [esp + 0x4c]
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 599729: fdivp st(1)
        R.fcom(R.st[0], 0.15); // 59972b: fcom qword ptr [0x968f20]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 599731: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 599733: test ah, 1
        if (R.zf) { pc = 287; continue; } // 599736: je 0x599742
        pc = 286; continue;
      case 286: // 599738
        R.fpop(); // 599738: fstp st(0)
        R.fpush(0.15); // 59973a: fld qword ptr [0x968f20]
        pc = 290; continue; // 599740: jmp 0x59975d
      case 287: // 599742
        R.fcom(R.st[0], 0.85); // 599742: fcom qword ptr [0x969520]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 599748: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 59974a: test ah, 0x41
        if (!R.zf) { pc = 290; continue; } // 59974d: jne 0x59975d
        pc = 288; continue;
      case 288: // 59974f
        R.fpop(); // 59974f: fstp st(0)
        R.fpush(0.85); // 599751: fld qword ptr [0x969520]
        pc = 290; continue; // 599757: jmp 0x59975d
      default: return pc;
    }
  }
}
function f_598800_30(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 289: // 599759
        R.fpush(R.m.s32(((R.esp + 0x50) | 0) >>> 0)); // 599759: fild dword ptr [esp + 0x50]
        pc = 290; continue;
      case 290: // 59975d
        R.st[0] = R.st[0] * 0.65; // 59975d: fmul qword ptr [0x96a5d0]
        R.ftol(); // 599763: call 0x945640
        R.esi = ((R.eax >>> 0)) | 0; // 599768: mov esi, eax
        R.m.w32(((R.esp + 0x50) | 0) >>> 0, (R.esi >>> 0)); // 59976a: mov dword ptr [esp + 0x50], esi
        pc = 291; continue;
      case 291: // 59976e
        R.sub(((R.ebx >>> 0) & 0xff), 0x3, 8); // 59976e: cmp bl, 3
        if (R.zf) { pc = 304; continue; } // 599771: je 0x5997de
        pc = 292; continue;
      case 292: // 599773
        R.eax = ((R.esi >>> 0)) | 0; // 599773: mov eax, esi
        R.edx = R.eax < 0 ? -1 : 0; // 599775: cdq 
        R.sub((R.edi >>> 0), (R.edx >>> 0), 32); // 599776: cmp edi, edx
        if (R.cL) { pc = 304; continue; } // 599778: jl 0x5997de
        pc = 293; continue;
      case 293: // 59977a
        if (!R.cLE) { pc = 295; continue; } // 59977a: jg 0x599780
        pc = 294; continue;
      case 294: // 59977c
        R.sub((R.ebp >>> 0), (R.eax >>> 0), 32); // 59977c: cmp ebp, eax
        if (R.cBE) { pc = 304; continue; } // 59977e: jbe 0x5997de
        pc = 295; continue;
      case 295: // 599780
        R.ebp = (R.sub((R.ebp >>> 0), (R.eax >>> 0), 32)) | 0; // 599780: sub ebp, eax
        R.edi = (R.sub((R.edi >>> 0), (R.edx >>> 0), 32, R.cf ? 1 : 0)) | 0; // 599782: sbb edi, edx
        R.m.w32(((R.esp + 0x40) | 0) >>> 0, (R.ebp >>> 0)); // 599784: mov dword ptr [esp + 0x40], ebp
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.edi >>> 0)); // 599788: mov dword ptr [esp + 0x44], edi
        R.fpush(R.i64(((R.esp + 0x40) | 0))); // 59978c: fild qword ptr [esp + 0x40]
        R.st[0] = R.st[0] * -0.125; // 599790: fmul qword ptr [0x96a628]
        R.ftol(); // 599796: call 0x945640
        R.esi = (R.sub((R.esi >>> 0), (R.eax >>> 0), 32)) | 0; // 59979b: sub esi, eax
        R.eax = ((R.esi >>> 0)) | 0; // 59979d: mov eax, esi
        R.edx = R.eax < 0 ? -1 : 0; // 59979f: cdq 
        R.edi = ((R.edx >>> 0)) | 0; // 5997a0: mov edi, edx
        R.ebp = ((R.eax >>> 0)) | 0; // 5997a2: mov ebp, eax
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 5997a4: test edi, edi
        if (R.cL) { pc = 302; continue; } // 5997a6: jl 0x5997d0
        pc = 296; continue;
      case 296: // 5997a8
        if (!R.cLE) { pc = 298; continue; } // 5997a8: jg 0x5997b2
        pc = 297; continue;
      case 297: // 5997aa
        R.sub((R.ebp >>> 0), 0x1e848, 32); // 5997aa: cmp ebp, 0x1e848
        if (R.cBE) { pc = 302; continue; } // 5997b0: jbe 0x5997d0
        pc = 298; continue;
      case 298: // 5997b2
        R.fpush(R.m.s32(((R.esp + 0x50) | 0) >>> 0)); // 5997b2: fild dword ptr [esp + 0x50]
        R.st[0] = R.st[0] * 1.75; // 5997b6: fmul qword ptr [0x968f98]
        R.ftol(); // 5997bc: call 0x945640
        R.edx = R.eax < 0 ? -1 : 0; // 5997c1: cdq 
        R.sub((R.edi >>> 0), (R.edx >>> 0), 32); // 5997c2: cmp edi, edx
        if (R.cL) { pc = 302; continue; } // 5997c4: jl 0x5997d0
        pc = 299; continue;
      case 299: // 5997c6
        if (!R.cLE) { pc = 301; continue; } // 5997c6: jg 0x5997cc
        pc = 300; continue;
      default: return pc;
    }
  }
}
function f_598800_31(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 300: // 5997c8
        R.sub((R.ebp >>> 0), (R.eax >>> 0), 32); // 5997c8: cmp ebp, eax
        if (R.cBE) { pc = 302; continue; } // 5997ca: jbe 0x5997d0
        pc = 301; continue;
      case 301: // 5997cc
        R.ebp = ((R.eax >>> 0)) | 0; // 5997cc: mov ebp, eax
        R.edi = ((R.edx >>> 0)) | 0; // 5997ce: mov edi, edx
        pc = 302; continue;
      case 302: // 5997d0
        R.eax = (R.m.u32(((R.esp + 0x54) | 0) >>> 0)) | 0; // 5997d0: mov eax, dword ptr [esp + 0x54]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5997d4: test eax, eax
        if (R.zf) { pc = 304; continue; } // 5997d6: je 0x5997de
        pc = 303; continue;
      case 303: // 5997d8
        R.m.w32(((R.eax) | 0) >>> 0, 0x1); // 5997d8: mov dword ptr [eax], 1
        pc = 304; continue;
      case 304: // 5997de
        R.edx = ((R.edi >>> 0)) | 0; // 5997de: mov edx, edi
        R.edi = (R.pop()) | 0; // 5997e0: pop edi
        R.eax = ((R.ebp >>> 0)) | 0; // 5997e1: mov eax, ebp
        R.esi = (R.pop()) | 0; // 5997e3: pop esi
        R.ebp = (R.pop()) | 0; // 5997e4: pop ebp
        R.ebx = (R.pop()) | 0; // 5997e5: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x38, 32)) | 0; // 5997e6: add esp, 0x38
        R.rv = R.ret(5); return -1; // 5997e9: ret 0x14
      case 305: // 5997ec
        R.edx = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 5997ec: mov edx, dword ptr [esp + 0x3c]
        R.edi = (R.pop()) | 0; // 5997f0: pop edi
        R.esi = (R.pop()) | 0; // 5997f1: pop esi
        R.eax = ((R.ebx >>> 0)) | 0; // 5997f2: mov eax, ebx
        R.ebp = (R.pop()) | 0; // 5997f4: pop ebp
        R.ebx = (R.pop()) | 0; // 5997f5: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x38, 32)) | 0; // 5997f6: add esp, 0x38
        R.rv = R.ret(5); return -1; // 5997f9: ret 0x14
      default: return pc;
    }
  }
}
export function f_598800(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 306) throw new Error(`f_598800: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_598800_0(R, pc); break;
      case 1: np = f_598800_1(R, pc); break;
      case 2: np = f_598800_2(R, pc); break;
      case 3: np = f_598800_3(R, pc); break;
      case 4: np = f_598800_4(R, pc); break;
      case 5: np = f_598800_5(R, pc); break;
      case 6: np = f_598800_6(R, pc); break;
      case 7: np = f_598800_7(R, pc); break;
      case 8: np = f_598800_8(R, pc); break;
      case 9: np = f_598800_9(R, pc); break;
      case 10: np = f_598800_10(R, pc); break;
      case 11: np = f_598800_11(R, pc); break;
      case 12: np = f_598800_12(R, pc); break;
      case 13: np = f_598800_13(R, pc); break;
      case 14: np = f_598800_14(R, pc); break;
      case 15: np = f_598800_15(R, pc); break;
      case 16: np = f_598800_16(R, pc); break;
      case 17: np = f_598800_17(R, pc); break;
      case 18: np = f_598800_18(R, pc); break;
      case 19: np = f_598800_19(R, pc); break;
      case 20: np = f_598800_20(R, pc); break;
      case 21: np = f_598800_21(R, pc); break;
      case 22: np = f_598800_22(R, pc); break;
      case 23: np = f_598800_23(R, pc); break;
      case 24: np = f_598800_24(R, pc); break;
      case 25: np = f_598800_25(R, pc); break;
      case 26: np = f_598800_26(R, pc); break;
      case 27: np = f_598800_27(R, pc); break;
      case 28: np = f_598800_28(R, pc); break;
      case 29: np = f_598800_29(R, pc); break;
      case 30: np = f_598800_30(R, pc); break;
      case 31: np = f_598800_31(R, pc); break;
      default: throw new Error(`f_598800: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_598800: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_598800.shared = true;
