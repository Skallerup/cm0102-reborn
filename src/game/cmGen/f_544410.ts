// 0x544410 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x544410, 0x544464, 0x544473, 0x544480, 0x54448a, 0x544492]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0]);
function f_544410_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 544410
        R.eax = (R.m.u32(((R.esp + 0x4) | 0) >>> 0)) | 0; // 544410: mov eax, dword ptr [esp + 4]
        R.edx = (((R.m.u8(((R.esp + 0x8) | 0) >>> 0)) << 24 >> 24)) | 0; // 544414: movsx edx, byte ptr [esp + 8]
        R.ecx = (((R.m.u16(((R.eax + 0x4) | 0) >>> 0)) << 16 >> 16)) | 0; // 544419: movsx ecx, word ptr [eax + 4]
        R.m.w32(((R.esp + 0x4) | 0) >>> 0, (R.ecx >>> 0)); // 54441d: mov dword ptr [esp + 4], ecx
        R.m.w32(((R.esp + 0x8) | 0) >>> 0, (R.edx >>> 0)); // 544421: mov dword ptr [esp + 8], edx
        R.fpush(R.m.s32(((R.esp + 0x4) | 0) >>> 0)); // 544425: fild dword ptr [esp + 4]
        R.fpush(R.m.s32(((R.esp + 0x8) | 0) >>> 0)); // 544429: fild dword ptr [esp + 8]
        R.st[0] = R.st[0] + R.st[0]; // 54442d: fadd st(0), st(0)
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 54442f: faddp st(1)
        R.st[0] = R.st[0] * 0.05; // 544431: fmul qword ptr [0x967888]
        R.st[0] = R.st[0] + 10.0; // 544437: fadd qword ptr [0x9688b0]
        R.fpush(R.st[0]); // 54443d: fld st(0)
        R.st[0] = R.st[0] * R.st[1]; // 54443f: fmul st(1)
        R.st[0] = R.st[0] * 0.1; // 544441: fmul qword ptr [0x967880]
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 544447: fxch st(1)
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 544449: faddp st(1)
        R.st[0] = R.st[0] * 0.3333333333333333; // 54444b: fmul qword ptr [0x968a80]
        R.st[0] = R.st[0] + 0.5; // 544451: fadd qword ptr [0x968968]
        R.fcom(R.st[0], 1.0); // 544457: fcom qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 54445d: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 54445f: test ah, 0x41
        if (!R.zf) { pc = 2; continue; } // 544462: jne 0x544473
        pc = 1; continue;
      case 1: // 544464
        R.fpush(R.st[0]); // 544464: fld st(0)
        R.fcom(R.st[0], 20.0); R.fpop(); // 544466: fcomp qword ptr [0x968ea8]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 54446c: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 54446e: test ah, 1
        if (R.zf) { pc = 4; continue; } // 544471: je 0x54448a
        pc = 2; continue;
      case 2: // 544473
        R.fcom(R.st[0], 1.0); // 544473: fcom qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 544479: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 54447b: test ah, 0x41
        if (R.zf) { pc = 5; continue; } // 54447e: je 0x544492
        pc = 3; continue;
      case 3: // 544480
        R.fpop(); // 544480: fstp st(0)
        R.fpush(1.0); // 544482: fld qword ptr [0x967890]
        pc = 5; continue; // 544488: jmp 0x544492
      case 4: // 54448a
        R.fpop(); // 54448a: fstp st(0)
        R.fpush(20.0); // 54448c: fld qword ptr [0x968ea8]
        pc = 5; continue;
      case 5: // 544492
        R.ftol(); R.rv = R.eax; return -1; // 544492: jmp 0x945640
      default: return pc;
    }
  }
}
export function f_544410(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 6) throw new Error(`f_544410: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_544410_0(R, pc); break;
      default: throw new Error(`f_544410: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_544410: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_544410.shared = false;
