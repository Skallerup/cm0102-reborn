// 0x84b580 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 600a50=5, 68d020=0t, 68d040=7t, 68d1b0=0t, 842180=5tc, 849ce0=4tc, 8c61e0=1tc
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x84b580, 0x84b5e1, 0x84b5e5, 0x84b614, 0x84b61c, 0x84b62b, 0x84b63f, 0x84b64c, 0x84b659, 0x84b67a, 0x84b67c, 0x84b682, 0x84b697, 0x84b6a7, 0x84b6ab, 0x84b6be]);
const CH = new Uint8Array([0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2]);
function f_84b580_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 84b580
        R.push(0xffffffff); // 84b580: push -1
        R.push(0x9625e8); // 84b582: push 0x9625e8
        R.eax = (0) | 0; // 84b587: mov eax, dword ptr fs:[0]
        R.push((R.eax >>> 0)); // 84b58d: push eax
        /* fs */ // 84b58e: mov dword ptr fs:[0], esp
        R.esp = (R.sub((R.esp >>> 0), 0x10, 32)) | 0; // 84b595: sub esp, 0x10
        R.push((R.ebx >>> 0)); // 84b598: push ebx
        R.push((R.ebp >>> 0)); // 84b599: push ebp
        R.ebx = ((R.ecx >>> 0)) | 0; // 84b59a: mov ebx, ecx
        R.push((R.esi >>> 0)); // 84b59c: push esi
        R.push((R.edi >>> 0)); // 84b59d: push edi
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 84b59e: lea ecx, [esp + 0x10]
        R.call(0x68d020, { n: 0, thisEcx: true, calleeClean: false }); // 84b5a2: call 0x68d020
        R.ecx = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 84b5a7: mov ecx, dword ptr [esp + 0x30]
        R.push(0x0); // 84b5ab: push 0
        R.push(0x1); // 84b5ad: push 1
        R.eax = (((R.esp + 0x18) | 0)) | 0; // 84b5af: lea eax, [esp + 0x18]
        R.push(0x0); // 84b5b3: push 0
        R.push((R.eax >>> 0)); // 84b5b5: push eax
        R.push((R.ecx >>> 0)); // 84b5b6: push ecx
        R.ecx = ((R.ebx >>> 0)) | 0; // 84b5b7: mov ecx, ebx
        R.m.w32(((R.esp + 0x3c) | 0) >>> 0, 0x0); // 84b5b9: mov dword ptr [esp + 0x3c], 0
        R.call(0x842180, { n: 5, thisEcx: true, calleeClean: true }); // 84b5c1: call 0x842180
        R.edx = (R.m.u32(((R.esp + 0x12) | 0) >>> 0)) | 0; // 84b5c6: mov edx, dword ptr [esp + 0x12]
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 84b5ca: lea ecx, [esp + 0x10]
        R.m.w32(((R.esp + 0x1a) | 0) >>> 0, (R.edx >>> 0)); // 84b5ce: mov dword ptr [esp + 0x1a], edx
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 84b5d2: call 0x68d1b0
        R.edi = ((R.eax >>> 0)) | 0; // 84b5d7: mov edi, eax
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 84b5d9: test edi, edi
        if (R.zf) { pc = 15; continue; } // 84b5db: je 0x84b6be
        pc = 1; continue;
      case 1: // 84b5e1
        R.ebp = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 84b5e1: mov ebp, dword ptr [esp + 0x30]
        pc = 2; continue;
      case 2: // 84b5e5
        R.eax = (R.m.u32(((R.edi + 0x4) | 0) >>> 0)) | 0; // 84b5e5: mov eax, dword ptr [edi + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 84b5e8: mov edx, dword ptr [0xae23b4]
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 84b5ee: add edx, eax
        R.push(0x0); // 84b5f0: push 0
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 84b5f2: lea ecx, [eax + eax*8]
        R.push(0x0); // 84b5f5: push 0
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 84b5f7: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 84b5fa: add ecx, eax
        R.push(0x1); // 84b5fc: push 1
        R.push(0x0); // 84b5fe: push 0
        R.esi = (((R.edx + R.ecx * 4) | 0)) | 0; // 84b600: lea esi, [edx + ecx*4]
        R.push((R.esi >>> 0)); // 84b603: push esi
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 84b604: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 84b609: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84b60c: test eax, eax
        if (!R.zf) { pc = 14; continue; } // 84b60e: jne 0x84b6ab
        pc = 3; continue;
      case 3: // 84b614
        R.ecx = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 84b614: mov ecx, dword ptr [esp + 0x38]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 84b618: test ecx, ecx
        if (R.zf) { pc = 10; continue; } // 84b61a: je 0x84b67c
        pc = 4; continue;
      default: return pc;
    }
  }
}
function f_84b580_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 4: // 84b61c
        R.eax = (R.m.u32(((R.ecx + 0x2) | 0) >>> 0)) | 0; // 84b61c: mov eax, dword ptr [ecx + 2]
        R.m.w32(((R.ecx + 0xa) | 0) >>> 0, (R.eax >>> 0)); // 84b61f: mov dword ptr [ecx + 0xa], eax
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 84b622: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84b627: test eax, eax
        if (R.zf) { pc = 8; continue; } // 84b629: je 0x84b659
        pc = 5; continue;
      case 5: // 84b62b
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 84b62b: mov ecx, dword ptr [eax]
        R.push((R.ecx >>> 0)); // 84b62d: push ecx
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 84b62e: mov ecx, dword ptr [0xde1f54]
        R.call(0x8c61e0, { n: 1, thisEcx: true, calleeClean: true }); // 84b634: call 0x8c61e0
        R.ebp = ((R.eax >>> 0)) | 0; // 84b639: mov ebp, eax
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 84b63b: test ebp, ebp
        if (R.zf) { pc = 7; continue; } // 84b63d: je 0x84b64c
        pc = 6; continue;
      case 6: // 84b63f
        R.edx = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 84b63f: mov edx, dword ptr [ebp]
        R.ecx = (R.m.u32(((R.edi + 0x4) | 0) >>> 0)) | 0; // 84b642: mov ecx, dword ptr [edi + 4]
        R.eax = (R.m.u32(((R.edx + 0x8) | 0) >>> 0)) | 0; // 84b645: mov eax, dword ptr [edx + 8]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 84b648: cmp eax, ecx
        if (R.zf) { pc = 14; continue; } // 84b64a: je 0x84b6ab
        pc = 7; continue;
      case 7: // 84b64c
        R.ecx = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 84b64c: mov ecx, dword ptr [esp + 0x38]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 84b650: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84b655: test eax, eax
        if (!R.zf) { pc = 5; continue; } // 84b657: jne 0x84b62b
        pc = 8; continue;
      case 8: // 84b659
        R.ecx = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 84b659: mov ecx, dword ptr [ebp]
        R.edx = (R.logic((R.edx >>> 0) ^ (R.edx >>> 0), 32)) | 0; // 84b65c: xor edx, edx
        R.push(0x0); // 84b65e: push 0
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + 0x11) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84b660: mov al, byte ptr [ecx + 0x11]
        R.ecx = ((R.ebx >>> 0)) | 0; // 84b663: mov ecx, ebx
        R.sub(((R.eax >>> 0) & 0xff), 0xb, 8); // 84b665: cmp al, 0xb
        R.eax = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 84b667: mov eax, dword ptr [esp + 0x34]
        R.edx = ((R.edx & 0xffffff00) | (((!R.zf ? 1 : 0) & 0xff) << 0)) | 0; // 84b66b: setne dl
        R.push((R.edx >>> 0)); // 84b66e: push edx
        R.push((R.eax >>> 0)); // 84b66f: push eax
        R.push((R.esi >>> 0)); // 84b670: push esi
        R.call(0x849ce0, { n: 4, thisEcx: true, calleeClean: true }); // 84b671: call 0x849ce0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84b676: test eax, eax
        if (R.zf) { pc = 15; continue; } // 84b678: je 0x84b6be
        pc = 9; continue;
      case 9: // 84b67a
        pc = 13; continue; // 84b67a: jmp 0x84b6a7
      case 10: // 84b67c
        R.sub((R.esi >>> 0), R.m.u32(((R.esp + 0x34) | 0) >>> 0), 32); // 84b67c: cmp esi, dword ptr [esp + 0x34]
        if (R.zf) { pc = 14; continue; } // 84b680: je 0x84b6ab
        pc = 11; continue;
      default: return pc;
    }
  }
}
function f_84b580_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 11: // 84b682
        R.edi = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 84b682: mov edi, dword ptr [esp + 0x30]
        R.push(0x0); // 84b686: push 0
        R.push(0x0); // 84b688: push 0
        R.push((R.edi >>> 0)); // 84b68a: push edi
        R.push((R.esi >>> 0)); // 84b68b: push esi
        R.ecx = ((R.ebx >>> 0)) | 0; // 84b68c: mov ecx, ebx
        R.call(0x849ce0, { n: 4, thisEcx: true, calleeClean: true }); // 84b68e: call 0x849ce0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84b693: test eax, eax
        if (!R.zf) { pc = 13; continue; } // 84b695: jne 0x84b6a7
        pc = 12; continue;
      case 12: // 84b697
        R.push((R.eax >>> 0)); // 84b697: push eax
        R.push(0x1); // 84b698: push 1
        R.push((R.edi >>> 0)); // 84b69a: push edi
        R.push((R.esi >>> 0)); // 84b69b: push esi
        R.ecx = ((R.ebx >>> 0)) | 0; // 84b69c: mov ecx, ebx
        R.call(0x849ce0, { n: 4, thisEcx: true, calleeClean: true }); // 84b69e: call 0x849ce0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84b6a3: test eax, eax
        if (R.zf) { pc = 15; continue; } // 84b6a5: je 0x84b6be
        pc = 13; continue;
      case 13: // 84b6a7
        R.m.w8(((R.eax + 0x24) | 0) >>> 0, R.logic(R.m.u8(((R.eax + 0x24) | 0) >>> 0) | 0x20, 8)); // 84b6a7: or byte ptr [eax + 0x24], 0x20
        pc = 14; continue;
      case 14: // 84b6ab
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 84b6ab: lea ecx, [esp + 0x10]
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 84b6af: call 0x68d1b0
        R.edi = ((R.eax >>> 0)) | 0; // 84b6b4: mov edi, eax
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 84b6b6: test edi, edi
        if (!R.zf) { pc = 2; continue; } // 84b6b8: jne 0x84b5e5
        pc = 15; continue;
      case 15: // 84b6be
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 84b6be: lea ecx, [esp + 0x10]
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0xffffffff); // 84b6c2: mov dword ptr [esp + 0x28], 0xffffffff
        R.call(0x68d040, { n: 7, thisEcx: true, calleeClean: false }); // 84b6ca: call 0x68d040
        R.ecx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 84b6cf: mov ecx, dword ptr [esp + 0x20]
        R.edi = (R.pop()) | 0; // 84b6d3: pop edi
        R.esi = (R.pop()) | 0; // 84b6d4: pop esi
        R.ebp = (R.pop()) | 0; // 84b6d5: pop ebp
        R.ebx = (R.pop()) | 0; // 84b6d6: pop ebx
        /* fs */ // 84b6d7: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x1c, 32)) | 0; // 84b6de: add esp, 0x1c
        R.rv = R.ret(3); return -1; // 84b6e1: ret 0xc
      default: return pc;
    }
  }
}
export function f_84b580(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 16) throw new Error(`f_84b580: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_84b580_0(R, pc); break;
      case 1: np = f_84b580_1(R, pc); break;
      case 2: np = f_84b580_2(R, pc); break;
      default: throw new Error(`f_84b580: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_84b580: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_84b580.shared = true;
