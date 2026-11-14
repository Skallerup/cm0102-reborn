// 0x8e8ed0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 40a7d0=2tc, 417c10=2tc, 54a110=0t, 54c8e0=2tc, 54cdb0=2tc, 8e8c40=2c
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_8e8ed0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x8e8ed0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x8e8ed0:
        R.push(0xffffffff); // 8e8ed0: push -1
        R.push(0x964a20); // 8e8ed2: push 0x964a20
        R.eax = (0) | 0; // 8e8ed7: mov eax, dword ptr fs:[0]
        R.push((R.eax >>> 0)); // 8e8edd: push eax
        /* fs */ // 8e8ede: mov dword ptr fs:[0], esp
        R.esp = (R.sub((R.esp >>> 0), 0x20, 32)) | 0; // 8e8ee5: sub esp, 0x20
        R.push((R.ebx >>> 0)); // 8e8ee8: push ebx
        R.push((R.esi >>> 0)); // 8e8ee9: push esi
        R.esi = ((R.ecx >>> 0)) | 0; // 8e8eea: mov esi, ecx
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 8e8eec: lea ecx, [esp + 0x10]
        R.call(0x54a110, { n: 0, thisEcx: true, calleeClean: false }); // 8e8ef0: call 0x54a110
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x8) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e8ef5: mov al, byte ptr [esi + 8]
        R.ebx = ((R.ebx & 0xffffff00) | (((R.logic(((R.ebx >>> 0) & 0xff) ^ ((R.ebx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 8e8ef8: xor bl, bl
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 8e8efa: test al, al
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, 0x0); // 8e8efc: mov dword ptr [esp + 0x30], 0
        if (R.cLE) { pc = 0x8e8f32; continue; } // 8e8f04: jle 0x8e8f32
        pc = 0x8e8f06; continue;
      case 0x8e8f06:
        R.ecx = (R.m.u32(((R.esi + 0x4) | 0) >>> 0)) | 0; // 8e8f06: mov ecx, dword ptr [esi + 4]
        R.eax = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 8e8f09: movsx eax, bl
        R.eax = (((R.eax + R.eax * 2) | 0)) | 0; // 8e8f0c: lea eax, [eax + eax*2]
        R.edx = (((R.ecx + R.eax * 4) | 0)) | 0; // 8e8f0f: lea edx, [ecx + eax*4]
        R.ecx = ((R.esi >>> 0)) | 0; // 8e8f12: mov ecx, esi
        R.push((R.edx >>> 0)); // 8e8f14: push edx
        R.push(0xae2c90); // 8e8f15: push 0xae2c90
        R.call(0x8e8c40, { n: 2, thisEcx: false, calleeClean: true }); // 8e8f1a: call 0x8e8c40
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e8f1f: test eax, eax
        if (!R.zf) { pc = 0x8e8fa9; continue; } // 8e8f21: jne 0x8e8fa9
        pc = 0x8e8f27; continue;
      case 0x8e8f27:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x8) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8e8f27: mov al, byte ptr [esi + 8]
        R.ebx = ((R.ebx & 0xffffff00) | (((R.incdec(((R.ebx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 8e8f2a: inc bl
        R.sub(((R.ebx >>> 0) & 0xff), ((R.eax >>> 0) & 0xff), 8); // 8e8f2c: cmp bl, al
        if (R.cL) { pc = 0x8e8f06; continue; } // 8e8f2e: jl 0x8e8f06
        pc = 0x8e8f30; continue;
      case 0x8e8f30:
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 8e8f30: test al, al
        pc = 0x8e8f32; continue;
      case 0x8e8f32:
        if (!R.zf) { pc = 0x8e9061; continue; } // 8e8f32: jne 0x8e9061
        pc = 0x8e8f38; continue;
      case 0x8e8f38:
        R.eax = (((R.esp + 0x8) | 0)) | 0; // 8e8f38: lea eax, [esp + 8]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e8f3c: test eax, eax
        if (!R.zf) { pc = 0x8e9061; continue; } // 8e8f3e: jne 0x8e9061
        pc = 0x8e8f44; continue;
      case 0x8e8f44:
        R.eax = (R.m.u32(((R.esp + 0x8) | 0) >>> 0)) | 0; // 8e8f44: mov eax, dword ptr [esp + 8]
        pc = 0x8e8f48; continue;
      case 0x8e8f48:
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e8f48: test eax, eax
        if (R.zf) { pc = 0x8e9061; continue; } // 8e8f4a: je 0x8e9061
        pc = 0x8e8f50; continue;
      case 0x8e8f50:
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8e8f50: mov cx, word ptr [0xae2c92]
        R.esi = (((R.eax + 0x6) | 0)) | 0; // 8e8f57: lea esi, [eax + 6]
        R.m.w16(((R.esp + 0x8) | 0) >>> 0, ((R.ecx >>> 0) & 0xffff)); // 8e8f5a: mov word ptr [esp + 8], cx
        R.edx = (R.m.u32(((R.esp + 0x8) | 0) >>> 0)) | 0; // 8e8f5f: mov edx, dword ptr [esp + 8]
        R.push((R.edi >>> 0)); // 8e8f63: push edi
        R.eax = (((R.esp + 0x1c) | 0)) | 0; // 8e8f64: lea eax, [esp + 0x1c]
        R.push((R.edx >>> 0)); // 8e8f68: push edx
        R.push((R.eax >>> 0)); // 8e8f69: push eax
        R.ecx = ((R.esi >>> 0)) | 0; // 8e8f6a: mov ecx, esi
        R.call(0x40a7d0, { n: 2, thisEcx: true, calleeClean: true }); // 8e8f6c: call 0x40a7d0
        R.ecx = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 8e8f71: mov ecx, dword ptr [eax + 4]
        R.edi = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 8e8f74: mov edi, dword ptr [eax]
        R.edx = (((R.esp + 0x24) | 0)) | 0; // 8e8f76: lea edx, [esp + 0x24]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 8e8f7a: mov dword ptr [esp + 0x10], ecx
        R.push(0x1); // 8e8f7e: push 1
        R.push((R.edx >>> 0)); // 8e8f80: push edx
        R.ecx = (0xae2c90) | 0; // 8e8f81: mov ecx, 0xae2c90
        R.m.w8(((R.esp + 0x3c) | 0) >>> 0, 0x1); // 8e8f86: mov byte ptr [esp + 0x3c], 1
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 8e8f8b: mov dword ptr [esp + 0x14], edi
        R.call(0x54c8e0, { n: 2, thisEcx: true, calleeClean: true }); // 8e8f8f: call 0x54c8e0
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.eax + 0x2) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8e8f94: mov cx, word ptr [eax + 2]
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.esp + 0xe) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8e8f98: mov dx, word ptr [esp + 0xe]
        R.sub(((R.edx >>> 0) & 0xffff), ((R.ecx >>> 0) & 0xffff), 16); // 8e8f9d: cmp dx, cx
        if (R.cBE) { pc = 0x8e8fbf; continue; } // 8e8fa0: jbe 0x8e8fbf
        pc = 0x8e8fa2; continue;
      case 0x8e8fa2:
        R.eax = (0x1) | 0; // 8e8fa2: mov eax, 1
        pc = 0x8e8fcf; continue; // 8e8fa7: jmp 0x8e8fcf
      case 0x8e8fa9:
        R.eax = (((R.esp + 0x8) | 0)) | 0; // 8e8fa9: lea eax, [esp + 8]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e8fad: test eax, eax
        if (R.zf) { pc = 0x8e8f44; continue; } // 8e8faf: je 0x8e8f44
        pc = 0x8e8fb1; continue;
      case 0x8e8fb1:
        R.edx = (R.m.u32(((R.esi + 0x4) | 0) >>> 0)) | 0; // 8e8fb1: mov edx, dword ptr [esi + 4]
        R.eax = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 8e8fb4: movsx eax, bl
        R.ecx = (((R.eax + R.eax * 2) | 0)) | 0; // 8e8fb7: lea ecx, [eax + eax*2]
        R.eax = (((R.edx + R.ecx * 4) | 0)) | 0; // 8e8fba: lea eax, [edx + ecx*4]
        pc = 0x8e8f48; continue; // 8e8fbd: jmp 0x8e8f48
      case 0x8e8fbf:
        if (!R.cf) { pc = 0x8e8fc5; continue; } // 8e8fbf: jae 0x8e8fc5
        pc = 0x8e8fc1; continue;
      case 0x8e8fc1:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8e8fc1: xor eax, eax
        pc = 0x8e8fcf; continue; // 8e8fc3: jmp 0x8e8fcf
      case 0x8e8fc5:
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 8e8fc5: xor ecx, ecx
        R.sub(((R.edi >>> 0) & 0xffff), R.m.u16(((R.eax) | 0) >>> 0), 16); // 8e8fc7: cmp di, word ptr [eax]
        R.ecx = ((R.ecx & 0xffffff00) | (((!R.cLE ? 1 : 0) & 0xff) << 0)) | 0; // 8e8fca: setg cl
        R.eax = ((R.ecx >>> 0)) | 0; // 8e8fcd: mov eax, ecx
        pc = 0x8e8fcf; continue;
      case 0x8e8fcf:
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8e8fcf: test eax, eax
        R.m.w8(((R.esp + 0x34) | 0) >>> 0, 0x0); // 8e8fd1: mov byte ptr [esp + 0x34], 0
        R.edi = (R.pop()) | 0; // 8e8fd6: pop edi
        if (R.zf) { pc = 0x8e9003; continue; } // 8e8fd7: je 0x8e9003
        pc = 0x8e8fd9; continue;
      case 0x8e8fd9:
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8e8fd9: mov dx, word ptr [0xae2c92]
        R.ecx = (((R.esp + 0x20) | 0)) | 0; // 8e8fe0: lea ecx, [esp + 0x20]
        R.m.w16(((R.esp + 0x8) | 0) >>> 0, ((R.edx >>> 0) & 0xffff)); // 8e8fe4: mov word ptr [esp + 8], dx
        R.eax = (R.m.u32(((R.esp + 0x8) | 0) >>> 0)) | 0; // 8e8fe9: mov eax, dword ptr [esp + 8]
        R.push((R.eax >>> 0)); // 8e8fed: push eax
        R.push((R.ecx >>> 0)); // 8e8fee: push ecx
        R.ecx = ((R.esi >>> 0)) | 0; // 8e8fef: mov ecx, esi
        R.call(0x40a7d0, { n: 2, thisEcx: true, calleeClean: true }); // 8e8ff1: call 0x40a7d0
        R.edx = (((R.esp + 0x18) | 0)) | 0; // 8e8ff6: lea edx, [esp + 0x18]
        R.push((R.eax >>> 0)); // 8e8ffa: push eax
        R.m.w8(((R.esp + 0x34) | 0) >>> 0, 0x2); // 8e8ffb: mov byte ptr [esp + 0x34], 2
        R.push((R.edx >>> 0)); // 8e9000: push edx
        pc = 0x8e902b; continue; // 8e9001: jmp 0x8e902b
      case 0x8e9003:
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8e9003: mov ax, word ptr [0xae2c92]
        R.edx = (((R.esp + 0x20) | 0)) | 0; // 8e9009: lea edx, [esp + 0x20]
        R.m.w16(((R.esp + 0x8) | 0) >>> 0, ((R.eax >>> 0) & 0xffff)); // 8e900d: mov word ptr [esp + 8], ax
        R.ecx = (R.m.u32(((R.esp + 0x8) | 0) >>> 0)) | 0; // 8e9012: mov ecx, dword ptr [esp + 8]
        R.ecx = (R.incdec((R.ecx >>> 0), 1, 32)) | 0; // 8e9016: inc ecx
        R.push((R.ecx >>> 0)); // 8e9017: push ecx
        R.push((R.edx >>> 0)); // 8e9018: push edx
        R.ecx = ((R.esi >>> 0)) | 0; // 8e9019: mov ecx, esi
        R.call(0x40a7d0, { n: 2, thisEcx: true, calleeClean: true }); // 8e901b: call 0x40a7d0
        R.push((R.eax >>> 0)); // 8e9020: push eax
        R.eax = (((R.esp + 0x1c) | 0)) | 0; // 8e9021: lea eax, [esp + 0x1c]
        R.m.w8(((R.esp + 0x34) | 0) >>> 0, 0x3); // 8e9025: mov byte ptr [esp + 0x34], 3
        R.push((R.eax >>> 0)); // 8e902a: push eax
        pc = 0x8e902b; continue;
      case 0x8e902b:
        R.ecx = (((R.esp + 0x18) | 0)) | 0; // 8e902b: lea ecx, [esp + 0x18]
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 8e902f: call 0x417c10
        R.ecx = (R.m.u32(((0xae2c94) | 0) >>> 0)) | 0; // 8e9034: mov ecx, dword ptr [0xae2c94]
        R.edx = (R.m.u32(((0xae2c90) | 0) >>> 0)) | 0; // 8e903a: mov edx, dword ptr [0xae2c90]
        R.push((R.ecx >>> 0)); // 8e9040: push ecx
        R.push((R.edx >>> 0)); // 8e9041: push edx
        R.ecx = (((R.esp + 0x18) | 0)) | 0; // 8e9042: lea ecx, [esp + 0x18]
        R.m.w8(((R.esp + 0x38) | 0) >>> 0, 0x0); // 8e9046: mov byte ptr [esp + 0x38], 0
        R.call(0x54cdb0, { n: 2, thisEcx: true, calleeClean: true }); // 8e904b: call 0x54cdb0
        R.esi = (R.pop()) | 0; // 8e9050: pop esi
        R.ebx = (R.pop()) | 0; // 8e9051: pop ebx
        R.ecx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 8e9052: mov ecx, dword ptr [esp + 0x20]
        /* fs */ // 8e9056: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x2c, 32)) | 0; // 8e905d: add esp, 0x2c
        return R.ret(0); // 8e9060: ret 
      case 0x8e9061:
        R.ecx = (R.m.u32(((R.esp + 0x28) | 0) >>> 0)) | 0; // 8e9061: mov ecx, dword ptr [esp + 0x28]
        R.esi = (R.pop()) | 0; // 8e9065: pop esi
        R.eax = ((R.eax & 0xffff0000) | (((0x16d) & 0xffff) << 0)) | 0; // 8e9066: mov ax, 0x16d
        R.ebx = (R.pop()) | 0; // 8e906a: pop ebx
        /* fs */ // 8e906b: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x2c, 32)) | 0; // 8e9072: add esp, 0x2c
        return R.ret(0); // 8e9075: ret 
      default: throw new Error(`f_8e8ed0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
