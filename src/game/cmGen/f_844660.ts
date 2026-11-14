// 0x844660 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4cf5a0=1c, 843e10=4tc
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_844660(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x844660;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x844660:
        R.esp = (R.sub((R.esp >>> 0), 0x8, 32)) | 0; // 844660: sub esp, 8
        R.push((R.ebx >>> 0)); // 844663: push ebx
        R.ebx = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 844664: mov ebx, dword ptr [esp + 0x14]
        R.push((R.ebp >>> 0)); // 844668: push ebp
        R.ebp = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 844669: mov ebp, dword ptr [esp + 0x14]
        R.push((R.esi >>> 0)); // 84466d: push esi
        R.push((R.edi >>> 0)); // 84466e: push edi
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.ecx >>> 0)); // 84466f: mov dword ptr [esp + 0x14], ecx
        R.edi = (R.logic((R.edi >>> 0) ^ (R.edi >>> 0), 32)) | 0; // 844673: xor edi, edi
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, 0x28); // 844675: mov dword ptr [esp + 0x10], 0x28
        pc = 0x84467d; continue;
      case 0x84467d:
        R.eax = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 84467d: mov eax, dword ptr [ebx]
        R.ecx = (R.m.u32(((0xae2364) | 0) >>> 0)) | 0; // 84467f: mov ecx, dword ptr [0xae2364]
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 844685: dec ecx
        R.edx = (R.m.u32(((R.edi + R.eax + 0xf) | 0) >>> 0)) | 0; // 844686: mov edx, dword ptr [edi + eax + 0xf]
        R.eax = (((R.edi + R.eax + 0xf) | 0)) | 0; // 84468a: lea eax, [edi + eax + 0xf]
        R.sub((R.edx >>> 0), (R.ecx >>> 0), 32); // 84468e: cmp edx, ecx
        if (R.cLE) { pc = 0x844698; continue; } // 844690: jle 0x844698
        pc = 0x844692; continue;
      case 0x844692:
        R.m.w32(((R.eax) | 0) >>> 0, 0xffffffff); // 844692: mov dword ptr [eax], 0xffffffff
        pc = 0x844698; continue;
      case 0x844698:
        R.edx = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 844698: mov edx, dword ptr [ebx]
        R.eax = (R.m.u32(((R.edi + R.edx + 0xf) | 0) >>> 0)) | 0; // 84469a: mov eax, dword ptr [edi + edx + 0xf]
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 84469e: cmp eax, -1
        if (R.cLE) { pc = 0x84471b; continue; } // 8446a1: jle 0x84471b
        pc = 0x8446a3; continue;
      case 0x8446a3:
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 8446a3: lea ecx, [eax + eax*4]
        R.eax = (((R.eax + R.ecx * 2) | 0)) | 0; // 8446a6: lea eax, [eax + ecx*2]
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8446a9: mov ecx, dword ptr [0xae1050]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 8446af: lea edx, [eax + eax*4]
        R.eax = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 8446b2: mov eax, dword ptr [0xae23bc]
        R.esi = (((R.eax + R.edx * 2) | 0)) | 0; // 8446b7: lea esi, [eax + edx*2]
        R.push((R.esi >>> 0)); // 8446ba: push esi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 8446bb: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8446c0: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 8446c2: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x8446ec; continue; } // 8446c7: je 0x8446ec
        pc = 0x8446c9; continue;
      case 0x8446c9:
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + 0x35) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8446c9: mov cl, byte ptr [eax + 0x35]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0x3f, 8)) & 0xff) << 0)) | 0; // 8446cc: and cl, 0x3f
        R.sub(((R.ecx >>> 0) & 0xff), 0x5, 8); // 8446cf: cmp cl, 5
        if (R.zf) { pc = 0x8446ec; continue; } // 8446d2: je 0x8446ec
        pc = 0x8446d4; continue;
      case 0x8446d4:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 8446d4: mov eax, dword ptr [eax + 4]
        R.ecx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 8446d7: mov ecx, dword ptr [0xae23b4]
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 8446dd: lea edx, [eax + eax*8]
        R.edx = (R.shl((R.edx >>> 0), 0x4, 32)) | 0; // 8446e0: shl edx, 4
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8446e3: add edx, eax
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 8446e5: add ecx, eax
        R.eax = (((R.ecx + R.edx * 4) | 0)) | 0; // 8446e7: lea eax, [ecx + edx*4]
        pc = 0x8446ee; continue; // 8446ea: jmp 0x8446ee
      case 0x8446ec:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 8446ec: xor eax, eax
        pc = 0x8446ee; continue;
      case 0x8446ee:
        R.sub((R.eax >>> 0), (R.ebp >>> 0), 32); // 8446ee: cmp eax, ebp
        if (R.zf) { pc = 0x84471b; continue; } // 8446f0: je 0x84471b
        pc = 0x8446f2; continue;
      case 0x8446f2:
        R.sub(R.m.u32(((R.esi + 0x39) | 0) >>> 0), (R.ebp >>> 0), 32); // 8446f2: cmp dword ptr [esi + 0x39], ebp
        if (R.zf) { pc = 0x84471b; continue; } // 8446f5: je 0x84471b
        pc = 0x8446f7; continue;
      case 0x8446f7:
        R.edx = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 8446f7: mov edx, dword ptr [ebx]
        R.ecx = (R.m.u32(((R.edi + R.edx + 0x17) | 0) >>> 0)) | 0; // 8446f9: mov ecx, dword ptr [edi + edx + 0x17]
        R.eax = (((R.edi + R.edx) | 0)) | 0; // 8446fd: lea eax, [edi + edx]
        R.sub((R.ecx >>> 0), 0xffffffff, 32); // 844700: cmp ecx, -1
        if (!R.zf) { pc = 0x84471b; continue; } // 844703: jne 0x84471b
        pc = 0x844705; continue;
      case 0x844705:
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax) | 0) >>> 0)) & 0xff) << 0)) | 0; // 844705: mov dl, byte ptr [eax]
        R.ecx = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 844707: mov ecx, dword ptr [esp + 0x14]
        R.sub(((R.edx >>> 0) & 0xff), 0xb, 8); // 84470b: cmp dl, 0xb
        R.eax = ((R.eax & 0xffffff00) | (((!R.zf ? 1 : 0) & 0xff) << 0)) | 0; // 84470e: setne al
        R.push((R.eax >>> 0)); // 844711: push eax
        R.push(0x3); // 844712: push 3
        R.push((R.ebp >>> 0)); // 844714: push ebp
        R.push((R.esi >>> 0)); // 844715: push esi
        R.call(0x843e10, { n: 4, thisEcx: true, calleeClean: true }); // 844716: call 0x843e10
        pc = 0x84471b; continue;
      case 0x84471b:
        R.eax = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 84471b: mov eax, dword ptr [esp + 0x10]
        R.edi = (R.add((R.edi >>> 0), 0x25, 32)) | 0; // 84471f: add edi, 0x25
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 844722: dec eax
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 844723: mov dword ptr [esp + 0x10], eax
        if (!R.zf) { pc = 0x84467d; continue; } // 844727: jne 0x84467d
        pc = 0x84472d; continue;
      case 0x84472d:
        R.edi = (R.pop()) | 0; // 84472d: pop edi
        R.esi = (R.pop()) | 0; // 84472e: pop esi
        R.ebp = (R.pop()) | 0; // 84472f: pop ebp
        R.ebx = (R.pop()) | 0; // 844730: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 844731: add esp, 8
        return R.ret(2); // 844734: ret 8
      default: throw new Error(`f_844660: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
