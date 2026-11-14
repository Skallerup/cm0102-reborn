// 0x544380 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x544380, 0x5443d4, 0x5443e3, 0x5443f0, 0x5443fa, 0x544402]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0]);
function f_544380_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 544380
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 544380: mov eax, dword ptr [esp + 4]
        R.edx = (((R.m.u8(((R.esp + 0x8) | 0) >>> 0)) << 24 >> 24)) | 0; // 544384: movsx edx, byte ptr [esp + 8]
        R.ecx = (((R.m.u16(((R.eax + 0x5) | 0) >>> 0)) << 16 >> 16)) | 0; // 544389: movsx ecx, word ptr [eax + 5]
        R.m.w32(((R.esp + 0x4) | 0) >>> 0, (R.ecx >>> 0)); // 54438d: mov dword ptr [esp + 4], ecx
        R.m.w32(((R.esp + 0x8) | 0) >>> 0, (R.edx >>> 0)); // 544391: mov dword ptr [esp + 8], edx
        R.fpush(R.m.s32(((R.esp + 0x4) | 0) >>> 0)); // 544395: fild dword ptr [esp + 4]
        R.fpush(R.m.s32(((R.esp + 0x8) | 0) >>> 0)); // 544399: fild dword ptr [esp + 8]
        R.st[0] = R.st[0] + R.st[0]; // 54439d: fadd st(0), st(0)
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 54439f: faddp st(1)
        R.st[0] = R.st[0] * 0.05; // 5443a1: fmul qword ptr [0x967888]
        R.st[0] = R.st[0] + 10.0; // 5443a7: fadd qword ptr [0x9688b0]
        R.fpush(R.st[0]); // 5443ad: fld st(0)
        R.st[0] = R.st[0] * R.st[1]; // 5443af: fmul st(1)
        R.st[0] = R.st[0] * 0.1; // 5443b1: fmul qword ptr [0x967880]
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 5443b7: fxch st(1)
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 5443b9: faddp st(1)
        R.st[0] = R.st[0] * 0.3333333333333333; // 5443bb: fmul qword ptr [0x968a80]
        R.st[0] = R.st[0] + 0.5; // 5443c1: fadd qword ptr [0x968968]
        R.fcom(R.st[0], 1.0); // 5443c7: fcom qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 5443cd: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 5443cf: test ah, 0x41
        if (!R.zf) { pc = 2; continue; } // 5443d2: jne 0x5443e3
        pc = 1; continue;
      case 1: // 5443d4
        R.fpush(R.st[0]); // 5443d4: fld st(0)
        R.fcom(R.st[0], 20.0); R.fpop(); // 5443d6: fcomp qword ptr [0x968ea8]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 5443dc: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 5443de: test ah, 1
        if (R.zf) { pc = 4; continue; } // 5443e1: je 0x5443fa
        pc = 2; continue;
      case 2: // 5443e3
        R.fcom(R.st[0], 1.0); // 5443e3: fcom qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 5443e9: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 5443eb: test ah, 0x41
        if (R.zf) { pc = 5; continue; } // 5443ee: je 0x544402
        pc = 3; continue;
      case 3: // 5443f0
        R.fpop(); // 5443f0: fstp st(0)
        R.fpush(1.0); // 5443f2: fld qword ptr [0x967890]
        pc = 5; continue; // 5443f8: jmp 0x544402
      case 4: // 5443fa
        R.fpop(); // 5443fa: fstp st(0)
        R.fpush(20.0); // 5443fc: fld qword ptr [0x968ea8]
        pc = 5; continue;
      case 5: // 544402
        R.ftol(); R.rv = R.ret(0); return -1; // 544402: jmp 0x945640
      default: return pc;
    }
  }
}
export function f_544380(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 6) throw new Error(`f_544380: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_544380_0(R, pc); break;
      default: throw new Error(`f_544380: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_544380: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_544380.shared = true;
