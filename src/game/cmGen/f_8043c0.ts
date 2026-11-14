// 0x8043c0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 7ae8a0=1tc, 7ae950=0t, 7f6cd0=2c
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_8043c0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x8043c0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x8043c0:
        R.push((R.ecx >>> 0)); // 8043c0: push ecx
        R.push((R.ebx >>> 0)); // 8043c1: push ebx
        R.push((R.esi >>> 0)); // 8043c2: push esi
        R.ebx = ((R.ebx & 0xffffff00) | (((R.logic(((R.ebx >>> 0) & 0xff) ^ ((R.ebx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 8043c3: xor bl, bl
        R.push((R.edi >>> 0)); // 8043c5: push edi
        R.m.w8(((R.esp + 0xc) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 8043c6: mov byte ptr [esp + 0xc], bl
        R.edi = (((R.ecx + 0x1b0e) | 0)) | 0; // 8043ca: lea edi, [ecx + 0x1b0e]
        pc = 0x8043d0; continue;
      case 0x8043d0:
        R.esi = (R.m.u32(((R.esp + 0xc) | 0) >>> 0)) | 0; // 8043d0: mov esi, dword ptr [esp + 0xc]
        R.ecx = (R.m.u32(((0xb74448) | 0) >>> 0)) | 0; // 8043d4: mov ecx, dword ptr [0xb74448]
        R.push(0x0); // 8043da: push 0
        R.push((R.esi >>> 0)); // 8043dc: push esi
        R.call(0x7f6cd0, { n: 2, thisEcx: false, calleeClean: true }); // 8043dd: call 0x7f6cd0
        R.sub(R.m.u8(((R.eax + 0xa) | 0) >>> 0), 0x4, 8); // 8043e2: cmp byte ptr [eax + 0xa], 4
        if (!R.zf) { pc = 0x804426; continue; } // 8043e6: jne 0x804426
        pc = 0x8043e8; continue;
      case 0x8043e8:
        R.ecx = (R.m.u32(((0xb74448) | 0) >>> 0)) | 0; // 8043e8: mov ecx, dword ptr [0xb74448]
        R.push(0x0); // 8043ee: push 0
        R.push((R.esi >>> 0)); // 8043f0: push esi
        R.call(0x7f6cd0, { n: 2, thisEcx: false, calleeClean: true }); // 8043f1: call 0x7f6cd0
        R.ecx = ((R.eax >>> 0)) | 0; // 8043f6: mov ecx, eax
        R.call(0x7ae950, { n: 0, thisEcx: true, calleeClean: false }); // 8043f8: call 0x7ae950
        R.push((R.eax >>> 0)); // 8043fd: push eax
        R.ecx = (((R.edi + -0x1b0d) | 0)) | 0; // 8043fe: lea ecx, [edi - 0x1b0d]
        R.call(0x7ae8a0, { n: 1, thisEcx: true, calleeClean: true }); // 804404: call 0x7ae8a0
        R.ecx = (R.m.u32(((0xb74448) | 0) >>> 0)) | 0; // 804409: mov ecx, dword ptr [0xb74448]
        R.push(0x0); // 80440f: push 0
        R.push((R.esi >>> 0)); // 804411: push esi
        R.call(0x7f6cd0, { n: 2, thisEcx: false, calleeClean: true }); // 804412: call 0x7f6cd0
        R.ecx = ((R.eax >>> 0)) | 0; // 804417: mov ecx, eax
        R.call(0x7ae950, { n: 0, thisEcx: true, calleeClean: false }); // 804419: call 0x7ae950
        R.push((R.eax >>> 0)); // 80441e: push eax
        R.ecx = ((R.edi >>> 0)) | 0; // 80441f: mov ecx, edi
        R.call(0x7ae8a0, { n: 1, thisEcx: true, calleeClean: true }); // 804421: call 0x7ae8a0
        pc = 0x804426; continue;
      case 0x804426:
        R.ebx = ((R.ebx & 0xffffff00) | (((R.incdec(((R.ebx >>> 0) & 0xff), 1, 8)) & 0xff) << 0)) | 0; // 804426: inc bl
        R.edi = (R.add((R.edi >>> 0), 0x2b0, 32)) | 0; // 804428: add edi, 0x2b0
        R.sub(((R.ebx >>> 0) & 0xff), 0xa, 8); // 80442e: cmp bl, 0xa
        R.m.w8(((R.esp + 0xc) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 804431: mov byte ptr [esp + 0xc], bl
        if (R.cL) { pc = 0x8043d0; continue; } // 804435: jl 0x8043d0
        pc = 0x804437; continue;
      case 0x804437:
        R.edi = (R.pop()) | 0; // 804437: pop edi
        R.esi = (R.pop()) | 0; // 804438: pop esi
        R.eax = (0x1) | 0; // 804439: mov eax, 1
        R.ebx = (R.pop()) | 0; // 80443e: pop ebx
        R.ecx = (R.pop()) | 0; // 80443f: pop ecx
        return R.ret(0); // 804440: ret 
      default: throw new Error(`f_8043c0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
