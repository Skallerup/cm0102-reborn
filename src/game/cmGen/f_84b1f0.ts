// 0x84b1f0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 5b7d20=1, 84b230=3c
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x84b1f0, 0x84b1fb, 0x84b202, 0x84b221]);
const CH = new Uint8Array([0, 0, 0, 0]);
function f_84b1f0_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 84b1f0
        R.eax = (R.m.u32(((R.esp + 0x8) | 0) >>> 0)) | 0; // 84b1f0: mov eax, dword ptr [esp + 8]
        R.push((R.esi >>> 0)); // 84b1f4: push esi
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84b1f5: test eax, eax
        R.esi = ((R.ecx >>> 0)) | 0; // 84b1f7: mov esi, ecx
        if (R.zf) { pc = 3; continue; } // 84b1f9: je 0x84b221
        pc = 1; continue;
      case 1: // 84b1fb
        R.eax = (R.m.u32(((R.eax + 0x61) | 0) >>> 0)) | 0; // 84b1fb: mov eax, dword ptr [eax + 0x61]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84b1fe: test eax, eax
        if (R.zf) { pc = 3; continue; } // 84b200: je 0x84b221
        pc = 2; continue;
      case 2: // 84b202
        R.push((R.eax >>> 0)); // 84b202: push eax
        R.call(0x5b7d20, { n: 1, thisEcx: false, calleeClean: false }); // 84b203: call 0x5b7d20
        R.ecx = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 84b208: mov ecx, dword ptr [esp + 0x14]
        R.edx = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 84b20c: mov edx, dword ptr [esp + 0xc]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 84b210: add esp, 4
        R.push((R.ecx >>> 0)); // 84b213: push ecx
        R.push((R.eax >>> 0)); // 84b214: push eax
        R.push((R.edx >>> 0)); // 84b215: push edx
        R.ecx = ((R.esi >>> 0)) | 0; // 84b216: mov ecx, esi
        R.call(0x84b230, { n: 3, thisEcx: false, calleeClean: true }); // 84b218: call 0x84b230
        R.esi = (R.pop()) | 0; // 84b21d: pop esi
        R.rv = R.ret(3); return -1; // 84b21e: ret 0xc
      case 3: // 84b221
        R.eax = (R.logic((R.eax >>> 0) | 0xffffffff, 32)) | 0; // 84b221: or eax, 0xffffffff
        R.esi = (R.pop()) | 0; // 84b224: pop esi
        R.rv = R.ret(3); return -1; // 84b225: ret 0xc
      default: return pc;
    }
  }
}
export function f_84b1f0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 4) throw new Error(`f_84b1f0: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_84b1f0_0(R, pc); break;
      default: throw new Error(`f_84b1f0: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_84b1f0: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_84b1f0.shared = true;
