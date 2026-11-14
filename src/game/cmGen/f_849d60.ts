// 0x849d60 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 53ca90=1, 5407e0=3, 7f7490=2tc
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_849d60(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x849d60;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x849d60:
        R.esp = (R.sub((R.esp >>> 0), 0x8, 32)) | 0; // 849d60: sub esp, 8
        R.push((R.ebx >>> 0)); // 849d63: push ebx
        R.push((R.ebp >>> 0)); // 849d64: push ebp
        R.push((R.esi >>> 0)); // 849d65: push esi
        R.esi = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 849d66: mov esi, dword ptr [esp + 0x1c]
        R.push((R.edi >>> 0)); // 849d6a: push edi
        R.push(0x0); // 849d6b: push 0
        R.push((R.esi >>> 0)); // 849d6d: push esi
        R.call(0x53ca90, { n: 1, thisEcx: false, calleeClean: false }); // 849d6e: call 0x53ca90
        R.ebp = (R.m.u32(((R.esp + 0x24) | 0) >>> 0)) | 0; // 849d73: mov ebp, dword ptr [esp + 0x24]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 849d77: add esp, 4
        R.push((R.eax >>> 0)); // 849d7a: push eax
        R.push((R.ebp >>> 0)); // 849d7b: push ebp
        R.call(0x5407e0, { n: 3, thisEcx: false, calleeClean: false }); // 849d7c: call 0x5407e0
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 849d81: add esp, 0xc
        R.sub(((R.eax >>> 0) & 0xffff), 0x1, 16); // 849d84: cmp ax, 1
        if (R.cLE) { pc = 0x849da3; continue; } // 849d88: jle 0x849da3
        pc = 0x849d8a; continue;
      case 0x849d8a:
        R.push(0x0); // 849d8a: push 0
        R.push((R.esi >>> 0)); // 849d8c: push esi
        R.call(0x53ca90, { n: 1, thisEcx: false, calleeClean: false }); // 849d8d: call 0x53ca90
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 849d92: add esp, 4
        R.push((R.eax >>> 0)); // 849d95: push eax
        R.push((R.ebp >>> 0)); // 849d96: push ebp
        R.call(0x5407e0, { n: 3, thisEcx: false, calleeClean: false }); // 849d97: call 0x5407e0
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 849d9c: add esp, 0xc
        R.ebx = ((R.eax >>> 0)) | 0; // 849d9f: mov ebx, eax
        pc = 0x849da8; continue; // 849da1: jmp 0x849da8
      case 0x849da3:
        R.ebx = (0x1) | 0; // 849da3: mov ebx, 1
        pc = 0x849da8; continue;
      case 0x849da8:
        R.edi = ((R.edi & 0xffff0000) | (((R.m.u16(((R.esi + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 849da8: mov di, word ptr [esi + 0x80]
        R.sub(((R.edi >>> 0) & 0xffff), 0x1, 16); // 849daf: cmp di, 1
        if (!R.cLE) { pc = 0x849dba; continue; } // 849db3: jg 0x849dba
        pc = 0x849db5; continue;
      case 0x849db5:
        R.edi = (0x1) | 0; // 849db5: mov edi, 1
        pc = 0x849dba; continue;
      case 0x849dba:
        R.push((R.esi >>> 0)); // 849dba: push esi
        R.call(0x53ca90, { n: 1, thisEcx: false, calleeClean: false }); // 849dbb: call 0x53ca90
        R.ecx = (R.m.u32(((0xb74448) | 0) >>> 0)) | 0; // 849dc0: mov ecx, dword ptr [0xb74448]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 849dc6: add esp, 4
        R.push((R.eax >>> 0)); // 849dc9: push eax
        R.push((R.ebp >>> 0)); // 849dca: push ebp
        R.call(0x7f7490, { n: 2, thisEcx: true, calleeClean: true }); // 849dcb: call 0x7f7490
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 849dd0: test eax, eax
        if (R.zf) { pc = 0x849e12; continue; } // 849dd2: je 0x849e12
        pc = 0x849dd4; continue;
      case 0x849dd4:
        R.eax = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 849dd4: movsx eax, bx
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.eax >>> 0)); // 849dd7: mov dword ptr [esp + 0x20], eax
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 849ddb: fild dword ptr [esp + 0x20]
        R.ecx = (((((R.edi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 849ddf: movsx ecx, di
        R.st[0] = R.st[0] * 1.5; // 849de2: fmul qword ptr [0x968940]
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.ecx >>> 0)); // 849de8: mov dword ptr [esp + 0x20], ecx
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 849dec: fild dword ptr [esp + 0x20]
        R.st[0] = R.st[0] * 0.75; // 849df0: fmul qword ptr [0x969040]
        R.m.wf64(((R.esp + 0x10) | 0) >>> 0, R.st[0]); R.fpop(); // 849df6: fstp qword ptr [esp + 0x10]
        R.fcom(R.st[0], R.f64(((R.esp + 0x10) | 0))); // 849dfa: fcom qword ptr [esp + 0x10]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 849dfe: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 849e00: test ah, 0x41
        if (R.zf) { pc = 0x849e0b; continue; } // 849e03: je 0x849e0b
        pc = 0x849e05; continue;
      case 0x849e05:
        R.fpop(); // 849e05: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x10) | 0))); // 849e07: fld qword ptr [esp + 0x10]
        pc = 0x849e0b; continue;
      case 0x849e0b:
        R.ftol(); // 849e0b: call 0x945640
        R.ebx = ((R.eax >>> 0)) | 0; // 849e10: mov ebx, eax
        pc = 0x849e12; continue;
      case 0x849e12:
        R.edx = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 849e12: movsx edx, bx
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.edx >>> 0)); // 849e15: mov dword ptr [esp + 0x20], edx
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.ebp + 0x18) | 0) >>> 0)) & 0xff) << 0)) | 0; // 849e19: mov cl, byte ptr [ebp + 0x18]
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 849e1c: fild dword ptr [esp + 0x20]
        R.eax = (((((R.edi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 849e20: movsx eax, di
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.eax >>> 0)); // 849e23: mov dword ptr [esp + 0x20], eax
        R.st[0] = R.st[0] / R.m.s32(((R.esp + 0x20) | 0) >>> 0); // 849e27: fidiv dword ptr [esp + 0x20]
        R.fpush(R.st[0]); // 849e2b: fld st(0)
        R.fcom(R.st[0], 0.1); R.fpop(); // 849e2d: fcomp qword ptr [0x967880]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 849e33: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 849e35: test ah, 1
        if (R.zf) { pc = 0x849e44; continue; } // 849e38: je 0x849e44
        pc = 0x849e3a; continue;
      case 0x849e3a:
        R.fpop(); // 849e3a: fstp st(0)
        R.fpush(0.1); // 849e3c: fld qword ptr [0x967880]
        pc = 0x849e5b; continue; // 849e42: jmp 0x849e5b
      case 0x849e44:
        R.fpush(R.st[0]); // 849e44: fld st(0)
        R.fcom(R.st[0], 2.0); R.fpop(); // 849e46: fcomp qword ptr [0x968950]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 849e4c: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 849e4e: test ah, 0x41
        if (!R.zf) { pc = 0x849e5b; continue; } // 849e51: jne 0x849e5b
        pc = 0x849e53; continue;
      case 0x849e53:
        R.fpop(); // 849e53: fstp st(0)
        R.fpush(2.0); // 849e55: fld qword ptr [0x968950]
        pc = 0x849e5b; continue;
      case 0x849e5b:
        R.m.wf32(((R.esp + 0x20) | 0) >>> 0, R.st[0]); // 849e5b: fst dword ptr [esp + 0x20]
        R.fcom(R.st[0], 1.5); R.fpop(); // 849e5f: fcomp qword ptr [0x968940]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 849e65: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 849e67: test ah, 0x41
        if (!R.zf) { pc = 0x849e78; continue; } // 849e6a: jne 0x849e78
        pc = 0x849e6c; continue;
      case 0x849e6c:
        R.edi = (R.pop()) | 0; // 849e6c: pop edi
        R.esi = (R.pop()) | 0; // 849e6d: pop esi
        R.ebp = (R.pop()) | 0; // 849e6e: pop ebp
        R.eax = ((R.eax & 0xffffff00) | (((0x1) & 0xff) << 0)) | 0; // 849e6f: mov al, 1
        R.ebx = (R.pop()) | 0; // 849e71: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 849e72: add esp, 8
        return R.ret(2); // 849e75: ret 8
      case 0x849e78:
        R.fpush(R.f32(((R.esp + 0x20) | 0))); // 849e78: fld dword ptr [esp + 0x20]
        R.fcom(R.st[0], 1.2); R.fpop(); // 849e7c: fcomp qword ptr [0x968978]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 849e82: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 849e84: test ah, 0x41
        if (!R.zf) { pc = 0x849e9c; continue; } // 849e87: jne 0x849e9c
        pc = 0x849e89; continue;
      case 0x849e89:
        R.sub(((R.edi >>> 0) & 0xffff), 0x2134, 16); // 849e89: cmp di, 0x2134
        if (!R.cL) { pc = 0x849e9c; continue; } // 849e8e: jge 0x849e9c
        pc = 0x849e90; continue;
      case 0x849e90:
        R.edi = (R.pop()) | 0; // 849e90: pop edi
        R.esi = (R.pop()) | 0; // 849e91: pop esi
        R.ebp = (R.pop()) | 0; // 849e92: pop ebp
        R.eax = ((R.eax & 0xffffff00) | (((0x2) & 0xff) << 0)) | 0; // 849e93: mov al, 2
        R.ebx = (R.pop()) | 0; // 849e95: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 849e96: add esp, 8
        return R.ret(2); // 849e99: ret 8
      case 0x849e9c:
        R.fpush(R.f32(((R.esp + 0x20) | 0))); // 849e9c: fld dword ptr [esp + 0x20]
        R.fcom(R.st[0], 1.2); R.fpop(); // 849ea0: fcomp qword ptr [0x968978]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 849ea6: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 849ea8: test ah, 0x41
        if (R.zf) { pc = 0x849eed; continue; } // 849eab: je 0x849eed
        pc = 0x849ead; continue;
      case 0x849ead:
        R.sub(((R.ebx >>> 0) & 0xffff), 0x1964, 16); // 849ead: cmp bx, 0x1964
        if (!R.cLE) { pc = 0x849eed; continue; } // 849eb2: jg 0x849eed
        pc = 0x849eb4; continue;
      case 0x849eb4:
        R.fpush(R.f32(((R.esp + 0x20) | 0))); // 849eb4: fld dword ptr [esp + 0x20]
        R.fcom(R.st[0], 0.6); R.fpop(); // 849eb8: fcomp qword ptr [0x968e48]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 849ebe: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 849ec0: test ah, 0x41
        if (!R.zf) { pc = 0x849ed6; continue; } // 849ec3: jne 0x849ed6
        pc = 0x849ec5; continue;
      case 0x849ec5:
        R.sub(((R.ecx >>> 0) & 0xff), 0x17, 8); // 849ec5: cmp cl, 0x17
        if (!R.cL) { pc = 0x849ed6; continue; } // 849ec8: jge 0x849ed6
        pc = 0x849eca; continue;
      case 0x849eca:
        R.edi = (R.pop()) | 0; // 849eca: pop edi
        R.esi = (R.pop()) | 0; // 849ecb: pop esi
        R.ebp = (R.pop()) | 0; // 849ecc: pop ebp
        R.eax = ((R.eax & 0xffffff00) | (((0x5) & 0xff) << 0)) | 0; // 849ecd: mov al, 5
        R.ebx = (R.pop()) | 0; // 849ecf: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 849ed0: add esp, 8
        return R.ret(2); // 849ed3: ret 8
      case 0x849ed6:
        R.sub(((R.ecx >>> 0) & 0xff), 0x18, 8); // 849ed6: cmp cl, 0x18
        R.edi = (R.pop()) | 0; // 849ed9: pop edi
        R.eax = ((R.eax & 0xffffff00) | (((!R.cL ? 1 : 0) & 0xff) << 0)) | 0; // 849eda: setge al
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 849edd: dec eax
        R.esi = (R.pop()) | 0; // 849ede: pop esi
        R.eax = (R.logic((R.eax >>> 0) & 0x2, 32)) | 0; // 849edf: and eax, 2
        R.ebp = (R.pop()) | 0; // 849ee2: pop ebp
        R.eax = (R.add((R.eax >>> 0), 0x4, 32)) | 0; // 849ee3: add eax, 4
        R.ebx = (R.pop()) | 0; // 849ee6: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 849ee7: add esp, 8
        return R.ret(2); // 849eea: ret 8
      case 0x849eed:
        R.edi = (R.pop()) | 0; // 849eed: pop edi
        R.esi = (R.pop()) | 0; // 849eee: pop esi
        R.ebp = (R.pop()) | 0; // 849eef: pop ebp
        R.eax = ((R.eax & 0xffffff00) | (((0x3) & 0xff) << 0)) | 0; // 849ef0: mov al, 3
        R.ebx = (R.pop()) | 0; // 849ef2: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 849ef3: add esp, 8
        return R.ret(2); // 849ef6: ret 8
      default: throw new Error(`f_849d60: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
