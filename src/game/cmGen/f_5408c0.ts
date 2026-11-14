// 0x5408c0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 53d980=3
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x5408c0, 0x5408ce, 0x5408d9, 0x5408de, 0x5408e3, 0x5408e7, 0x5408ee, 0x5408f8, 0x5408fd, 0x540907, 0x54090c, 0x54091c, 0x540921, 0x540928, 0x54093b, 0x540940, 0x54094f, 0x540956, 0x54095d, 0x540973, 0x540975]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2]);
function f_5408c0_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 5408c0
        R.push((R.esi >>> 0)); // 5408c0: push esi
        R.esi = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 5408c1: mov esi, dword ptr [esp + 0xc]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 5408c5: test esi, esi
        R.push((R.edi >>> 0)); // 5408c7: push edi
        if (R.zf) { pc = 19; continue; } // 5408c8: je 0x540973
        pc = 1; continue;
      case 1: // 5408ce
        R.edi = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 5408ce: mov edi, dword ptr [esp + 0xc]
        R.eax = (R.m.u32(((R.edi + 0x39) | 0) >>> 0)) | 0; // 5408d2: mov eax, dword ptr [edi + 0x39]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5408d5: test eax, eax
        if (R.zf) { pc = 8; continue; } // 5408d7: je 0x5408fd
        pc = 2; continue;
      case 2: // 5408d9
        R.sub((R.eax >>> 0), R.m.u32(((R.esi + 0x39) | 0) >>> 0), 32); // 5408d9: cmp eax, dword ptr [esi + 0x39]
        if (!R.zf) { pc = 4; continue; } // 5408dc: jne 0x5408e3
        pc = 3; continue;
      case 3: // 5408de
        R.edi = (R.pop()) | 0; // 5408de: pop edi
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 5408df: xor al, al
        R.esi = (R.pop()) | 0; // 5408e1: pop esi
        R.rv = R.ret(0); return -1; // 5408e2: ret 
      case 4: // 5408e3
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5408e3: test eax, eax
        if (R.zf) { pc = 8; continue; } // 5408e5: je 0x5408fd
        pc = 5; continue;
      case 5: // 5408e7
        R.ecx = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 5408e7: mov ecx, dword ptr [esi + 0x39]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 5408ea: test ecx, ecx
        if (R.zf) { pc = 8; continue; } // 5408ec: je 0x5408fd
        pc = 6; continue;
      case 6: // 5408ee
        R.eax = (R.m.u32(((R.eax + 0x53) | 0) >>> 0)) | 0; // 5408ee: mov eax, dword ptr [eax + 0x53]
        R.edx = (R.m.u32(((R.ecx + 0x53) | 0) >>> 0)) | 0; // 5408f1: mov edx, dword ptr [ecx + 0x53]
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 5408f4: cmp eax, edx
        if (!R.zf) { pc = 8; continue; } // 5408f6: jne 0x5408fd
        pc = 7; continue;
      case 7: // 5408f8
        R.edi = (R.pop()) | 0; // 5408f8: pop edi
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 5408f9: xor al, al
        R.esi = (R.pop()) | 0; // 5408fb: pop esi
        R.rv = R.ret(0); return -1; // 5408fc: ret 
      case 8: // 5408fd
        R.eax = (R.m.u32(((R.edi + 0x1a) | 0) >>> 0)) | 0; // 5408fd: mov eax, dword ptr [edi + 0x1a]
        R.ecx = (R.m.u32(((R.esi + 0x1a) | 0) >>> 0)) | 0; // 540900: mov ecx, dword ptr [esi + 0x1a]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 540903: cmp eax, ecx
        if (!R.zf) { pc = 10; continue; } // 540905: jne 0x54090c
        pc = 9; continue;
      case 9: // 540907
        R.edi = (R.pop()) | 0; // 540907: pop edi
        R.eax = ((R.eax & 0xffffff00) | (((0x2) & 0xff) << 0)) | 0; // 540908: mov al, 2
        R.esi = (R.pop()) | 0; // 54090a: pop esi
        R.rv = R.ret(0); return -1; // 54090b: ret 
      default: return pc;
    }
  }
}
function f_5408c0_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 10: // 54090c
        R.push(0x1); // 54090c: push 1
        R.push((R.eax >>> 0)); // 54090e: push eax
        R.push((R.esi >>> 0)); // 54090f: push esi
        R.call(0x53d980, { n: 3, thisEcx: false, calleeClean: false }); // 540910: call 0x53d980
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 540915: add esp, 0xc
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 540918: test eax, eax
        if (!R.zf) { pc = 12; continue; } // 54091a: jne 0x540921
        pc = 11; continue;
      case 11: // 54091c
        R.edi = (R.pop()) | 0; // 54091c: pop edi
        R.eax = ((R.eax & 0xffffff00) | (((0x2) & 0xff) << 0)) | 0; // 54091d: mov al, 2
        R.esi = (R.pop()) | 0; // 54091f: pop esi
        R.rv = R.ret(0); return -1; // 540920: ret 
      case 12: // 540921
        R.eax = (R.m.u32(((R.edi + 0x39) | 0) >>> 0)) | 0; // 540921: mov eax, dword ptr [edi + 0x39]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 540924: test eax, eax
        if (R.zf) { pc = 15; continue; } // 540926: je 0x540940
        pc = 13; continue;
      case 13: // 540928
        R.ecx = (R.m.u32(((R.eax + 0x53) | 0) >>> 0)) | 0; // 540928: mov ecx, dword ptr [eax + 0x53]
        R.push(0x1); // 54092b: push 1
        R.push((R.ecx >>> 0)); // 54092d: push ecx
        R.push((R.esi >>> 0)); // 54092e: push esi
        R.call(0x53d980, { n: 3, thisEcx: false, calleeClean: false }); // 54092f: call 0x53d980
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 540934: add esp, 0xc
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 540937: test eax, eax
        if (!R.zf) { pc = 15; continue; } // 540939: jne 0x540940
        pc = 14; continue;
      case 14: // 54093b
        R.edi = (R.pop()) | 0; // 54093b: pop edi
        R.eax = ((R.eax & 0xffffff00) | (((0x3) & 0xff) << 0)) | 0; // 54093c: mov al, 3
        R.esi = (R.pop()) | 0; // 54093e: pop esi
        R.rv = R.ret(0); return -1; // 54093f: ret 
      case 15: // 540940
        R.edx = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 540940: mov edx, dword ptr [0xae2364]
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 540946: mov eax, dword ptr [esi]
        R.edx = (R.add((R.edx >>> 0), 0xfffffff0, 32)) | 0; // 540948: add edx, -0x10
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 54094b: cmp eax, edx
        if (!R.cL) { pc = 19; continue; } // 54094d: jge 0x540973
        pc = 16; continue;
      case 16: // 54094f
        R.eax = (R.m.u32(((R.edi + 0x61) | 0) >>> 0)) | 0; // 54094f: mov eax, dword ptr [edi + 0x61]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 540952: test eax, eax
        if (R.zf) { pc = 19; continue; } // 540954: je 0x540973
        pc = 17; continue;
      case 17: // 540956
        R.esi = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 540956: mov esi, dword ptr [esi + 0x39]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 540959: test esi, esi
        if (R.zf) { pc = 19; continue; } // 54095b: je 0x540973
        pc = 18; continue;
      case 18: // 54095d
        R.eax = (((R.m.u16(((R.eax + 0x9) | 0) >>> 0)) << 16 >> 16)) | 0; // 54095d: movsx eax, word ptr [eax + 9]
        R.ecx = (((R.m.u16(((R.esi + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 540961: movsx ecx, word ptr [esi + 0x80]
        R.eax = (R.add((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 540968: add eax, ecx
        R.sub((R.eax >>> 0), 0x36b0, 32); // 54096a: cmp eax, 0x36b0
        R.eax = ((R.eax & 0xffffff00) | (((0x3) & 0xff) << 0)) | 0; // 54096f: mov al, 3
        if (!R.cL) { pc = 20; continue; } // 540971: jge 0x540975
        pc = 19; continue;
      default: return pc;
    }
  }
}
function f_5408c0_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 19: // 540973
        R.eax = ((R.eax & 0xffffff00) | (((0x4) & 0xff) << 0)) | 0; // 540973: mov al, 4
        pc = 20; continue;
      case 20: // 540975
        R.edi = (R.pop()) | 0; // 540975: pop edi
        R.esi = (R.pop()) | 0; // 540976: pop esi
        R.rv = R.ret(0); return -1; // 540977: ret 
      default: return pc;
    }
  }
}
export function f_5408c0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 21) throw new Error(`f_5408c0: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_5408c0_0(R, pc); break;
      case 1: np = f_5408c0_1(R, pc); break;
      case 2: np = f_5408c0_2(R, pc); break;
      default: throw new Error(`f_5408c0: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_5408c0: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_5408c0.shared = true;
