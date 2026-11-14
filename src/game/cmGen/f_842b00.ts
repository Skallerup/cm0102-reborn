// 0x842b00 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 68d020=0t, 68d040=0t, 68d1b0=0t, 842180=5tc, 944c94=1, 944cf1=1
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x842b00, 0x842b3a, 0x842b45, 0x842b47, 0x842b69, 0x842b75, 0x842b80, 0x842b9a, 0x842ba1, 0x842bad, 0x842bb5, 0x842bb8, 0x842bbe, 0x842bc2, 0x842bd2, 0x842bd6, 0x842be6]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2]);
function f_842b00_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 842b00
        R.push(0xffffffff); // 842b00: push -1
        R.push(0x9624db); // 842b02: push 0x9624db
        R.eax = (0) | 0; // 842b07: mov eax, dword ptr fs:[0]
        R.push((R.eax >>> 0)); // 842b0d: push eax
        /* fs */ // 842b0e: mov dword ptr fs:[0], esp
        R.esp = (R.sub((R.esp >>> 0), 0x8, 32)) | 0; // 842b15: sub esp, 8
        R.push((R.ebx >>> 0)); // 842b18: push ebx
        R.push((R.ebp >>> 0)); // 842b19: push ebp
        R.push((R.esi >>> 0)); // 842b1a: push esi
        R.push((R.edi >>> 0)); // 842b1b: push edi
        R.esi = ((R.ecx >>> 0)) | 0; // 842b1c: mov esi, ecx
        R.push(0xe); // 842b1e: push 0xe
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.esi >>> 0)); // 842b20: mov dword ptr [esp + 0x14], esi
        R.call(0x944cf1, { n: 1, thisEcx: false, calleeClean: false }); // 842b24: call 0x944cf1
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 842b29: add esp, 4
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.eax >>> 0)); // 842b2c: mov dword ptr [esp + 0x14], eax
        R.ebx = (R.logic((R.ebx >>> 0) ^ (R.ebx >>> 0), 32)) | 0; // 842b30: xor ebx, ebx
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 842b32: cmp eax, ebx
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.ebx >>> 0)); // 842b34: mov dword ptr [esp + 0x20], ebx
        if (R.zf) { pc = 2; continue; } // 842b38: je 0x842b45
        pc = 1; continue;
      case 1: // 842b3a
        R.ecx = ((R.eax >>> 0)) | 0; // 842b3a: mov ecx, eax
        R.call(0x68d020, { n: 0, thisEcx: true, calleeClean: false }); // 842b3c: call 0x68d020
        R.edi = ((R.eax >>> 0)) | 0; // 842b41: mov edi, eax
        pc = 3; continue; // 842b43: jmp 0x842b47
      case 2: // 842b45
        R.edi = (R.logic((R.edi >>> 0) ^ (R.edi >>> 0), 32)) | 0; // 842b45: xor edi, edi
        pc = 3; continue;
      case 3: // 842b47
        R.ebp = (R.m.u32(((R.esp + 0x28) | 0) >>> 0)) | 0; // 842b47: mov ebp, dword ptr [esp + 0x28]
        R.push((R.ebx >>> 0)); // 842b4b: push ebx
        R.push(0x3); // 842b4c: push 3
        R.push(0x1); // 842b4e: push 1
        R.push((R.edi >>> 0)); // 842b50: push edi
        R.push((R.ebp >>> 0)); // 842b51: push ebp
        R.ecx = ((R.esi >>> 0)) | 0; // 842b52: mov ecx, esi
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, 0xffffffff); // 842b54: mov dword ptr [esp + 0x34], 0xffffffff
        R.call(0x842180, { n: 5, thisEcx: true, calleeClean: true }); // 842b5c: call 0x842180
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.edi) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 842b61: mov ax, word ptr [edi]
        R.sub(((R.eax >>> 0) & 0xffff), ((R.ebx >>> 0) & 0xffff), 16); // 842b64: cmp ax, bx
        if (R.zf) { pc = 14; continue; } // 842b67: je 0x842bd2
        pc = 4; continue;
      case 4: // 842b69
        R.ecx = (R.m.u32(((R.edi + 0x2) | 0) >>> 0)) | 0; // 842b69: mov ecx, dword ptr [edi + 2]
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.ebx >>> 0)); // 842b6c: mov dword ptr [esp + 0x28], ebx
        R.m.w32(((R.edi + 0xa) | 0) >>> 0, (R.ecx >>> 0)); // 842b70: mov dword ptr [edi + 0xa], ecx
        if (R.cLE) { pc = 14; continue; } // 842b73: jle 0x842bd2
        pc = 5; continue;
      case 5: // 842b75
        R.ecx = ((R.edi >>> 0)) | 0; // 842b75: mov ecx, edi
        R.call(0x68d1b0, { n: 0, thisEcx: true, calleeClean: false }); // 842b77: call 0x68d1b0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 842b7c: test eax, eax
        if (R.zf) { pc = 13; continue; } // 842b7e: je 0x842bc2
        pc = 6; continue;
      default: return pc;
    }
  }
}
function f_842b00_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 6: // 842b80
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 842b80: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((R.esi + 0xdc) | 0) >>> 0)) | 0; // 842b83: mov edx, dword ptr [esi + 0xdc]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esp + 0x2c) | 0) >>> 0)) & 0xff) << 0)) | 0; // 842b89: mov cl, byte ptr [esp + 0x2c]
        R.eax = (((R.eax + R.eax * 8) | 0)) | 0; // 842b8d: lea eax, [eax + eax*8]
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 842b90: add eax, edx
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 842b92: test cl, cl
        R.m.w8(((R.eax + 0x8) | 0) >>> 0, 0x64); // 842b94: mov byte ptr [eax + 8], 0x64
        if (R.zf) { pc = 13; continue; } // 842b98: je 0x842bc2
        pc = 7; continue;
      case 7: // 842b9a
        R.edx = (R.logic((R.edx >>> 0) ^ (R.edx >>> 0), 32)) | 0; // 842b9a: xor edx, edx
        R.esi = (0x28) | 0; // 842b9c: mov esi, 0x28
        pc = 8; continue;
      case 8: // 842ba1
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 842ba1: mov ecx, dword ptr [eax]
        R.ecx = (R.add((R.ecx >>> 0), (R.edx >>> 0), 32)) | 0; // 842ba3: add ecx, edx
        R.ebx = (R.m.u32(((R.ecx + 0xf) | 0) >>> 0)) | 0; // 842ba5: mov ebx, dword ptr [ecx + 0xf]
        R.sub((R.ebx >>> 0), R.m.u32(((R.ebp) | 0) >>> 0), 32); // 842ba8: cmp ebx, dword ptr [ebp]
        if (!R.zf) { pc = 11; continue; } // 842bab: jne 0x842bb8
        pc = 9; continue;
      case 9: // 842bad
        R.ebx = (R.logic((R.ebx >>> 0) | 0xffffffff, 32)) | 0; // 842bad: or ebx, 0xffffffff
        R.sub(R.m.u32(((R.ecx + 0x17) | 0) >>> 0), (R.ebx >>> 0), 32); // 842bb0: cmp dword ptr [ecx + 0x17], ebx
        if (R.cLE) { pc = 11; continue; } // 842bb3: jle 0x842bb8
        pc = 10; continue;
      case 10: // 842bb5
        R.m.w32(((R.ecx + 0x17) | 0) >>> 0, (R.ebx >>> 0)); // 842bb5: mov dword ptr [ecx + 0x17], ebx
        pc = 11; continue;
      case 11: // 842bb8
        R.edx = (R.add((R.edx >>> 0), 0x25, 32)) | 0; // 842bb8: add edx, 0x25
        R.esi = (R.incdec((R.esi >>> 0), -1, 32)) | 0; // 842bbb: dec esi
        if (!R.zf) { pc = 8; continue; } // 842bbc: jne 0x842ba1
        pc = 12; continue;
      case 12: // 842bbe
        R.esi = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 842bbe: mov esi, dword ptr [esp + 0x10]
        pc = 13; continue;
      case 13: // 842bc2
        R.eax = (R.m.u32(((R.esp + 0x28) | 0) >>> 0)) | 0; // 842bc2: mov eax, dword ptr [esp + 0x28]
        R.edx = (((R.m.u16(((R.edi) | 0) >>> 0)) << 16 >> 16)) | 0; // 842bc6: movsx edx, word ptr [edi]
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 842bc9: inc eax
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 842bca: cmp eax, edx
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 842bcc: mov dword ptr [esp + 0x28], eax
        if (R.cL) { pc = 5; continue; } // 842bd0: jl 0x842b75
        pc = 14; continue;
      case 14: // 842bd2
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 842bd2: test edi, edi
        if (R.zf) { pc = 16; continue; } // 842bd4: je 0x842be6
        pc = 15; continue;
      case 15: // 842bd6
        R.ecx = ((R.edi >>> 0)) | 0; // 842bd6: mov ecx, edi
        R.call(0x68d040, { n: 0, thisEcx: true, calleeClean: false }); // 842bd8: call 0x68d040
        R.push((R.edi >>> 0)); // 842bdd: push edi
        R.call(0x944c94, { n: 1, thisEcx: false, calleeClean: false }); // 842bde: call 0x944c94
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 842be3: add esp, 4
        pc = 16; continue;
      default: return pc;
    }
  }
}
function f_842b00_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 16: // 842be6
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 842be6: mov ecx, dword ptr [esp + 0x18]
        R.edi = (R.pop()) | 0; // 842bea: pop edi
        R.esi = (R.pop()) | 0; // 842beb: pop esi
        R.ebp = (R.pop()) | 0; // 842bec: pop ebp
        R.ebx = (R.pop()) | 0; // 842bed: pop ebx
        /* fs */ // 842bee: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 842bf5: add esp, 0x14
        R.rv = R.ret(2); return -1; // 842bf8: ret 8
      default: return pc;
    }
  }
}
export function f_842b00(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 17) throw new Error(`f_842b00: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_842b00_0(R, pc); break;
      case 1: np = f_842b00_1(R, pc); break;
      case 2: np = f_842b00_2(R, pc); break;
      default: throw new Error(`f_842b00: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_842b00: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_842b00.shared = true;
