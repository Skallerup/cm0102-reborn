// 0x5431e0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 543540=3, 5e8290=9, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x5431e0, 0x5431ee, 0x5431fa, 0x5431ff, 0x543214]);
const CH = new Uint8Array([0, 0, 0, 0, 0]);
function f_5431e0_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 5431e0
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 5431e0: mov eax, dword ptr [esp + 4]
        R.esp = (R.sub((R.esp >>> 0), 0x200, 32)) | 0; // 5431e4: sub esp, 0x200
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 5431ea: test eax, eax
        if (R.zf) { pc = 4; continue; } // 5431ec: je 0x543214
        pc = 1; continue;
      case 1: // 5431ee
        R.edx = (R.m.u32(((R.esp + 0x208) | 0) >>> 0)) | 0; // 5431ee: mov edx, dword ptr [esp + 0x208]
        R.sub(((R.edx >>> 0) & 0xff), 0x1, 8); // 5431f5: cmp dl, 1
        if (R.cL) { pc = 4; continue; } // 5431f8: jl 0x543214
        pc = 2; continue;
      case 2: // 5431fa
        R.sub(((R.edx >>> 0) & 0xff), 0x1f, 8); // 5431fa: cmp dl, 0x1f
        if (!R.cLE) { pc = 4; continue; } // 5431fd: jg 0x543214
        pc = 3; continue;
      case 3: // 5431ff
        R.ecx = (R.m.u32(((R.eax + 0x61) | 0) >>> 0)) | 0; // 5431ff: mov ecx, dword ptr [eax + 0x61]
        R.push((R.edx >>> 0)); // 543202: push edx
        R.push((R.ecx >>> 0)); // 543203: push ecx
        R.push((R.eax >>> 0)); // 543204: push eax
        R.call(0x543540, { n: 3, thisEcx: false, calleeClean: false }); // 543205: call 0x543540
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 54320a: add esp, 0xc
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 54320d: add esp, 0x200
        R.rv = R.ret(0); return -1; // 543213: ret 
      case 4: // 543214
        R.eax = (((R.esp) | 0)) | 0; // 543214: lea eax, [esp]
        R.ecx = (((R.esp + 0x100) | 0)) | 0; // 543218: lea ecx, [esp + 0x100]
        R.push((R.eax >>> 0)); // 54321f: push eax
        R.push((R.ecx >>> 0)); // 543220: push ecx
        R.push(0x0); // 543221: push 0
        R.push(0x0); // 543223: push 0
        R.push(0x9b5ac8); // 543225: push 0x9b5ac8
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 54322a: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 54322f: add esp, 0x14
        R.edx = (((R.esp) | 0)) | 0; // 543232: lea edx, [esp]
        R.eax = (((R.esp + 0x100) | 0)) | 0; // 543236: lea eax, [esp + 0x100]
        R.push(0x4816); // 54323d: push 0x4816
        R.push((R.edx >>> 0)); // 543242: push edx
        R.push((R.eax >>> 0)); // 543243: push eax
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 543244: call 0x90d130
        R.push((R.eax >>> 0)); // 543249: push eax
        R.push(0x9870e8); // 54324a: push 0x9870e8
        R.push(0xae24d0); // 54324f: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 543254: call 0x944c9f
        R.push(0x0); // 543259: push 0
        R.push(0xae24d0); // 54325b: push 0xae24d0
        R.push(0x9870e0); // 543260: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 543265: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 54326a: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 54326d: mov dword ptr [0xb67a34], 0
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) | 0xff, 8)) & 0xff) << 0)) | 0; // 543277: or al, 0xff
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 543279: add esp, 0x200
        R.rv = R.ret(0); return -1; // 54327f: ret 
      default: return pc;
    }
  }
}
export function f_5431e0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 5) throw new Error(`f_5431e0: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_5431e0_0(R, pc); break;
      default: throw new Error(`f_5431e0: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_5431e0: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_5431e0.shared = true;
