// 0x804540 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 7af600=1tc
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x804540, 0x804548, 0x804569, 0x804570, 0x804577]);
const CH = new Uint8Array([0, 0, 0, 0, 0]);
function f_804540_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 804540
        R.push((R.ebx >>> 0)); // 804540: push ebx
        R.push((R.esi >>> 0)); // 804541: push esi
        R.esi = ((R.ecx >>> 0)) | 0; // 804542: mov esi, ecx
        R.ebx = ((R.ebx & 0xffffff00) | (((R.logic(((R.ebx >>> 0) & 0xff) ^ ((R.ebx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 804544: xor bl, bl
        R.ecx = ((R.ecx & 0xffffff00) | (((0x1) & 0xff) << 0)) | 0; // 804546: mov cl, 1
        pc = 1; continue;
      case 1: // 804548
        R.edx = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 804548: movsx edx, bl
        R.eax = (((R.edx * 8) | 0)) | 0; // 80454b: lea eax, [edx*8]
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 804552: sub eax, edx
        R.eax = (((R.eax + R.eax * 2) | 0)) | 0; // 804554: lea eax, [eax + eax*2]
        R.edx = (((R.edx + R.eax * 2) | 0)) | 0; // 804557: lea edx, [edx + eax*2]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 80455a: shl edx, 4
        R.eax = (((R.edx + R.esi + 0x1) | 0)) | 0; // 80455d: lea eax, [edx + esi + 1]
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.edx + R.esi + 0xb) | 0) >>> 0)) & 0xff) << 0)) | 0; // 804561: mov dl, byte ptr [edx + esi + 0xb]
        R.sub(((R.edx >>> 0) & 0xff), ((R.ecx >>> 0) & 0xff), 8); // 804565: cmp dl, cl
        if (R.zf) { pc = 4; continue; } // 804567: je 0x804577
        pc = 2; continue;
      case 2: // 804569
        R.ebx = ((R.ebx & 0xffffff00) | (((R.incdec(((R.ebx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 804569: inc bl
        R.sub(((R.ebx >>> 0) & 0xff), 0xa, 8); // 80456b: cmp bl, 0xa
        if (R.cL) { pc = 1; continue; } // 80456e: jl 0x804548
        pc = 3; continue;
      case 3: // 804570
        R.esi = (R.pop()) | 0; // 804570: pop esi
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 804571: xor eax, eax
        R.ebx = (R.pop()) | 0; // 804573: pop ebx
        R.rv = R.ret(1); return -1; // 804574: ret 4
      case 4: // 804577
        R.ecx = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 804577: mov ecx, dword ptr [esp + 0xc]
        R.push((R.ecx >>> 0)); // 80457b: push ecx
        R.ecx = ((R.eax >>> 0)) | 0; // 80457c: mov ecx, eax
        R.call(0x7af600, { n: 1, thisEcx: true, calleeClean: true }); // 80457e: call 0x7af600
        R.esi = (R.pop()) | 0; // 804583: pop esi
        R.ebx = (R.pop()) | 0; // 804584: pop ebx
        R.rv = R.ret(1); return -1; // 804585: ret 4
      default: return pc;
    }
  }
}
export function f_804540(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 5) throw new Error(`f_804540: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_804540_0(R, pc); break;
      default: throw new Error(`f_804540: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_804540: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_804540.shared = true;
