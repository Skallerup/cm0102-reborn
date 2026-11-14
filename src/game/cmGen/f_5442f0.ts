// 0x5442f0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x5442f0, 0x54434a, 0x544359, 0x544366, 0x544370, 0x544378]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0]);
function f_5442f0_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 5442f0
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 5442f0: mov eax, dword ptr [esp + 4]
        R.edx = (((R.m.u8(((R.esp + 0x8) | 0) >>> 0)) << 24 >> 24)) | 0; // 5442f4: movsx edx, byte ptr [esp + 8]
        R.ecx = (((R.m.u16(((R.eax + 0x5) | 0) >>> 0)) << 16 >> 16)) | 0; // 5442f9: movsx ecx, word ptr [eax + 5]
        R.m.w32(((R.esp + 0x4) | 0) >>> 0, (R.ecx >>> 0)); // 5442fd: mov dword ptr [esp + 4], ecx
        R.m.w32(((R.esp + 0x8) | 0) >>> 0, (R.edx >>> 0)); // 544301: mov dword ptr [esp + 8], edx
        R.fpush(R.m.s32(((R.esp + 0x4) | 0) >>> 0)); // 544305: fild dword ptr [esp + 4]
        R.st[0] = R.st[0] * 0.1; // 544309: fmul qword ptr [0x967880]
        R.fpush(R.m.s32(((R.esp + 0x8) | 0) >>> 0)); // 54430f: fild dword ptr [esp + 8]
        R.st[0] = R.st[0] + R.st[0]; // 544313: fadd st(0), st(0)
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 544315: faddp st(1)
        R.st[0] = R.st[0] * 0.05; // 544317: fmul qword ptr [0x967888]
        R.st[0] = R.st[0] + 10.0; // 54431d: fadd qword ptr [0x9688b0]
        R.fpush(R.st[0]); // 544323: fld st(0)
        R.st[0] = R.st[0] * R.st[1]; // 544325: fmul st(1)
        R.st[0] = R.st[0] * 0.1; // 544327: fmul qword ptr [0x967880]
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 54432d: fxch st(1)
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 54432f: faddp st(1)
        R.st[0] = R.st[0] * 0.3333333333333333; // 544331: fmul qword ptr [0x968a80]
        R.st[0] = R.st[0] + 0.5; // 544337: fadd qword ptr [0x968968]
        R.fcom(R.st[0], 1.0); // 54433d: fcom qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 544343: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 544345: test ah, 0x41
        if (!R.zf) { pc = 2; continue; } // 544348: jne 0x544359
        pc = 1; continue;
      case 1: // 54434a
        R.fpush(R.st[0]); // 54434a: fld st(0)
        R.fcom(R.st[0], 20.0); R.fpop(); // 54434c: fcomp qword ptr [0x968ea8]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 544352: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 544354: test ah, 1
        if (R.zf) { pc = 4; continue; } // 544357: je 0x544370
        pc = 2; continue;
      case 2: // 544359
        R.fcom(R.st[0], 1.0); // 544359: fcom qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 54435f: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 544361: test ah, 0x41
        if (R.zf) { pc = 5; continue; } // 544364: je 0x544378
        pc = 3; continue;
      case 3: // 544366
        R.fpop(); // 544366: fstp st(0)
        R.fpush(1.0); // 544368: fld qword ptr [0x967890]
        pc = 5; continue; // 54436e: jmp 0x544378
      case 4: // 544370
        R.fpop(); // 544370: fstp st(0)
        R.fpush(20.0); // 544372: fld qword ptr [0x968ea8]
        pc = 5; continue;
      case 5: // 544378
        R.ftol(); R.rv = R.ret(0); return -1; // 544378: jmp 0x945640
      default: return pc;
    }
  }
}
export function f_5442f0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 6) throw new Error(`f_5442f0: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_5442f0_0(R, pc); break;
      default: throw new Error(`f_5442f0: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_5442f0: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_5442f0.shared = true;
