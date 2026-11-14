// 0x4196a0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 68d1b0=0t, 68d1f0=1tc
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x4196a0, 0x4196ad, 0x4196b4, 0x4196bf, 0x4196c6, 0x4196ca, 0x4196d0, 0x4196df, 0x4196e8, 0x4196f1, 0x4196fb, 0x419701, 0x419709]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1]);
function f_4196a0_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 4196a0
        R.push((R.ebp >>> 0)); // 4196a0: push ebp
        R.ebp = (R.m.u32(((R.esp + 0x8) | 0) >>> 0)) | 0; // 4196a1: mov ebp, dword ptr [esp + 8]
        R.push((R.esi >>> 0)); // 4196a5: push esi
        R.push((R.edi >>> 0)); // 4196a6: push edi
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 4196a7: test ebp, ebp
        R.edi = ((R.ecx >>> 0)) | 0; // 4196a9: mov edi, ecx
        if (R.zf) { pc = 12; continue; } // 4196ab: je 0x419709
        pc = 1; continue;
      case 1: // 4196ad
        R.eax = (R.m.u32(((R.edi + 0xc) | 0) >>> 0)) | 0; // 4196ad: mov eax, dword ptr [edi + 0xc]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4196b0: test eax, eax
        if (R.zf) { pc = 12; continue; } // 4196b2: je 0x419709
        pc = 2; continue;
      case 2: // 4196b4
        R.ecx = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 4196b4: mov ecx, dword ptr [ebp]
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 4196b7: add ecx, eax
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4196b9: mov al, byte ptr [ecx]
        R.logic(((R.eax >>> 0) & 0xff) & 0x1, 8); // 4196bb: test al, 1
        if (R.zf) { pc = 12; continue; } // 4196bd: je 0x419709
        pc = 3; continue;
      case 3: // 4196bf
        R.edx = ((R.edx & 0xffffff00) | (((((R.eax >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 4196bf: mov dl, al
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) | 0x1, 8)) & 0xff) << 0)) | 0; // 4196c1: or dl, 1
        if (R.zf) { pc = 5; continue; } // 4196c4: je 0x4196ca
        pc = 4; continue;
      case 4: // 4196c6
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) ^ 0x1, 8)) & 0xff) << 0)) | 0; // 4196c6: xor al, 1
        R.m.w8(((R.ecx) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 4196c8: mov byte ptr [ecx], al
        pc = 5; continue;
      case 5: // 4196ca
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 4196ca: mov eax, dword ptr [edi]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4196cc: test eax, eax
        if (R.zf) { pc = 12; continue; } // 4196ce: je 0x419709
        pc = 6; continue;
      case 6: // 4196d0
        R.ecx = (R.m.u32(((R.eax + 0x2) | 0) >>> 0)) | 0; // 4196d0: mov ecx, dword ptr [eax + 2]
        R.esi = (R.logic((R.esi >>> 0) ^ (R.esi >>> 0), 32)) | 0; // 4196d3: xor esi, esi
        R.m.w32(((R.eax + 0xa) | 0) >>> 0, (R.ecx >>> 0)); // 4196d5: mov dword ptr [eax + 0xa], ecx
        R.ecx = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 4196d8: mov ecx, dword ptr [edi]
        R.sub(R.m.u16(((R.ecx) | 0) >>> 0), ((R.esi >>> 0) & 0xffff), 16); // 4196da: cmp word ptr [ecx], si
        if (R.cLE) { pc = 12; continue; } // 4196dd: jle 0x419709
        pc = 7; continue;
      case 7: // 4196df
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 4196df: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4196e4: test eax, eax
        if (R.zf) { pc = 12; continue; } // 4196e6: je 0x419709
        pc = 8; continue;
      case 8: // 4196e8
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 4196e8: mov edx, dword ptr [eax]
        R.ecx = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 4196ea: mov ecx, dword ptr [ebp]
        R.sub((R.edx >>> 0), (R.ecx >>> 0), 32); // 4196ed: cmp edx, ecx
        if (R.zf) { pc = 11; continue; } // 4196ef: je 0x419701
        pc = 9; continue;
      default: return pc;
    }
  }
}
function f_4196a0_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 9: // 4196f1
        R.ecx = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 4196f1: mov ecx, dword ptr [edi]
        R.esi = (R.incdec((R.esi >>> 0), 1, 32)) | 0; // 4196f3: inc esi
        R.eax = (((R.m.u16(((R.ecx) | 0) >>> 0)) << 16 >> 16)) | 0; // 4196f4: movsx eax, word ptr [ecx]
        R.sub((R.esi >>> 0), (R.eax >>> 0), 32); // 4196f7: cmp esi, eax
        if (R.cL) { pc = 7; continue; } // 4196f9: jl 0x4196df
        pc = 10; continue;
      case 10: // 4196fb
        R.edi = (R.pop()) | 0; // 4196fb: pop edi
        R.esi = (R.pop()) | 0; // 4196fc: pop esi
        R.ebp = (R.pop()) | 0; // 4196fd: pop ebp
        R.rv = R.ret(1); return -1; // 4196fe: ret 4
      case 11: // 419701
        R.ecx = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 419701: mov ecx, dword ptr [edi]
        R.push((R.eax >>> 0)); // 419703: push eax
        R.call(0x68d1f0, { n: 1, thisEcx: true, calleeClean: true }); // 419704: call 0x68d1f0
        pc = 12; continue;
      case 12: // 419709
        R.edi = (R.pop()) | 0; // 419709: pop edi
        R.esi = (R.pop()) | 0; // 41970a: pop esi
        R.ebp = (R.pop()) | 0; // 41970b: pop ebp
        R.rv = R.ret(1); return -1; // 41970c: ret 4
      default: return pc;
    }
  }
}
export function f_4196a0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 13) throw new Error(`f_4196a0: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_4196a0_0(R, pc); break;
      case 1: np = f_4196a0_1(R, pc); break;
      default: throw new Error(`f_4196a0: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_4196a0: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_4196a0.shared = true;
