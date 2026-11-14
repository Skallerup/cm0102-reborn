// 0x84aeb0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x84aeb0, 0x84aeca, 0x84aed7, 0x84aee2, 0x84aee9, 0x84aeef, 0x84aef1]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 0]);
function f_84aeb0_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 84aeb0
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 84aeb0: mov eax, dword ptr [esp + 4]
        R.push((R.esi >>> 0)); // 84aeb4: push esi
        R.esi = (R.m.u32(((R.ecx + 0xdc) | 0) >>> 0)) | 0; // 84aeb5: mov esi, dword ptr [ecx + 0xdc]
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 84aebb: mov eax, dword ptr [eax]
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 84aebd: lea edx, [eax + eax*8]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edx + R.esi + 0x4) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84aec0: mov al, byte ptr [edx + esi + 4]
        R.edx = (R.add((R.edx >>> 0), (R.esi >>> 0), 32)) | 0; // 84aec4: add edx, esi
        R.sub(((R.eax >>> 0) & 0xff), 0x1, 8); // 84aec6: cmp al, 1
        if (!R.zf) { pc = 6; continue; } // 84aec8: jne 0x84aef1
        pc = 1; continue;
      case 1: // 84aeca
        R.esi = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 84aeca: mov esi, dword ptr [esp + 0xc]
        R.push((R.ebp >>> 0)); // 84aece: push ebp
        R.push((R.edi >>> 0)); // 84aecf: push edi
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 84aed0: xor ecx, ecx
        R.edi = (0x28) | 0; // 84aed2: mov edi, 0x28
        pc = 2; continue;
      case 2: // 84aed7
        R.eax = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 84aed7: mov eax, dword ptr [edx]
        R.eax = (R.add((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 84aed9: add eax, ecx
        R.ebp = (R.m.u32(((R.eax + 0xf) | 0) >>> 0)) | 0; // 84aedb: mov ebp, dword ptr [eax + 0xf]
        R.sub((R.ebp >>> 0), R.m.u32(((R.esi) | 0) >>> 0), 32); // 84aede: cmp ebp, dword ptr [esi]
        if (!R.zf) { pc = 4; continue; } // 84aee0: jne 0x84aee9
        pc = 3; continue;
      case 3: // 84aee2
        R.m.w32(((R.eax + 0x17) | 0) >>> 0, 0xffffffff); // 84aee2: mov dword ptr [eax + 0x17], 0xffffffff
        pc = 4; continue;
      case 4: // 84aee9
        R.ecx = (R.add((R.ecx >>> 0), 0x25, 32)) | 0; // 84aee9: add ecx, 0x25
        R.edi = (R.incdec((R.edi >>> 0), -1, 32)) | 0; // 84aeec: dec edi
        if (!R.zf) { pc = 2; continue; } // 84aeed: jne 0x84aed7
        pc = 5; continue;
      case 5: // 84aeef
        R.edi = (R.pop()) | 0; // 84aeef: pop edi
        R.ebp = (R.pop()) | 0; // 84aef0: pop ebp
        pc = 6; continue;
      case 6: // 84aef1
        R.esi = (R.pop()) | 0; // 84aef1: pop esi
        R.rv = R.ret(2); return -1; // 84aef2: ret 8
      default: return pc;
    }
  }
}
export function f_84aeb0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 7) throw new Error(`f_84aeb0: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_84aeb0_0(R, pc); break;
      default: throw new Error(`f_84aeb0: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_84aeb0: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_84aeb0.shared = true;
