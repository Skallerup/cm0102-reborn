// 0x843800 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 456740=2tc, 4cf5a0=1c, 4d0c60=5c, 4d1600=6tc, 4d42d0=3tc, 5407e0=0, 5a0590=1tc, 5b7d20=1, 600a50=5, 62ed70=1tc, 840d80=6tc, 8423f0=2tc, 843e10=4tc, 846920=6tcf, 84b180=3c, 8c7560=3tc, 8ce990=4tc, 946464=5
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_843800(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x843800;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x843800:
        R.esp = (R.sub((R.esp >>> 0), 0x20, 32)) | 0; // 843800: sub esp, 0x20
        R.push((R.ebx >>> 0)); // 843803: push ebx
        R.push((R.ebp >>> 0)); // 843804: push ebp
        R.ebp = (R.m.u32(((R.esp + 0x2c) | 0) >>> 0)) | 0; // 843805: mov ebp, dword ptr [esp + 0x2c]
        R.push((R.esi >>> 0)); // 843809: push esi
        R.ebx = ((R.ecx >>> 0)) | 0; // 84380a: mov ebx, ecx
        R.push((R.edi >>> 0)); // 84380c: push edi
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 84380d: mov ecx, dword ptr [0xae1050]
        R.push((R.ebp >>> 0)); // 843813: push ebp
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.ebx >>> 0)); // 843814: mov dword ptr [esp + 0x24], ebx
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 843818: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84381d: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 84381f: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x843842; continue; } // 843824: je 0x843842
        pc = 0x843826; continue;
      case 0x843826:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 843826: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 843829: mov edx, dword ptr [0xae23b4]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 84382f: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 843832: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 843835: add ecx, eax
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 843837: add edx, eax
        R.eax = (((R.edx + R.ecx * 4) | 0)) | 0; // 843839: lea eax, [edx + ecx*4]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.eax >>> 0)); // 84383c: mov dword ptr [esp + 0x10], eax
        pc = 0x84384a; continue; // 843840: jmp 0x84384a
      case 0x843842:
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, 0x0); // 843842: mov dword ptr [esp + 0x10], 0
        pc = 0x84384a; continue;
      case 0x84384a:
        R.edi = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 84384a: mov edi, dword ptr [esp + 0x38]
        R.ecx = (R.m.u32(((R.ebx + 0xdc) | 0) >>> 0)) | 0; // 84384e: mov ecx, dword ptr [ebx + 0xdc]
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 843854: mov eax, dword ptr [edi]
        R.esi = (((R.eax + R.eax * 8) | 0)) | 0; // 843856: lea esi, [eax + eax*8]
        R.esi = (R.add((R.esi >>> 0), (R.ecx >>> 0), 32)) | 0; // 843859: add esi, ecx
        R.ecx = (R.m.u32(((R.ebp + 0x61) | 0) >>> 0)) | 0; // 84385b: mov ecx, dword ptr [ebp + 0x61]
        R.push((R.ecx >>> 0)); // 84385e: push ecx
        R.call(0x5b7d20, { n: 1, thisEcx: false, calleeClean: false }); // 84385f: call 0x5b7d20
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 843864: add esp, 4
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.eax >>> 0)); // 843867: mov dword ptr [esp + 0x18], eax
        R.logic(((R.eax >>> 0) & 0xff) & 0x2, 8); // 84386b: test al, 2
        if (R.zf) { pc = 0x843875; continue; } // 84386d: je 0x843875
        pc = 0x84386f; continue;
      case 0x84386f:
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) | 0x4, 8)) & 0xff) << 0)) | 0; // 84386f: or al, 4
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.eax >>> 0)); // 843871: mov dword ptr [esp + 0x18], eax
        pc = 0x843875; continue;
      case 0x843875:
        R.logic(((R.eax >>> 0) & 0xff) & 0x8, 8); // 843875: test al, 8
        if (R.zf) { pc = 0x84387f; continue; } // 843877: je 0x84387f
        pc = 0x843879; continue;
      case 0x843879:
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) | 0x10, 8)) & 0xff) << 0)) | 0; // 843879: or al, 0x10
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.eax >>> 0)); // 84387b: mov dword ptr [esp + 0x18], eax
        pc = 0x84387f; continue;
      case 0x84387f:
        R.logic(((R.eax >>> 0) & 0xff) & 0x20, 8); // 84387f: test al, 0x20
        if (R.zf) { pc = 0x843889; continue; } // 843881: je 0x843889
        pc = 0x843883; continue;
      case 0x843883:
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) | 0x10, 8)) & 0xff) << 0)) | 0; // 843883: or al, 0x10
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.eax >>> 0)); // 843885: mov dword ptr [esp + 0x18], eax
        pc = 0x843889; continue;
      case 0x843889:
        R.logic(((R.eax >>> 0) & 0xff) & 0x80, 8); // 843889: test al, 0x80
        if (R.zf) { pc = 0x843894; continue; } // 84388b: je 0x843894
        pc = 0x84388d; continue;
      case 0x84388d:
        R.eax = ((R.eax & 0xffff00ff) | (((R.logic(((R.eax >>> 8) & 0xff) | 0x1, 8)) & 0xff) << 8)) | 0; // 84388d: or ah, 1
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.eax >>> 0)); // 843890: mov dword ptr [esp + 0x18], eax
        pc = 0x843894; continue;
      case 0x843894:
        R.edx = ((R.eax >>> 0)) | 0; // 843894: mov edx, eax
        R.edx = (R.logic((R.edx >>> 0) & 0x800, 32)) | 0; // 843896: and edx, 0x800
        R.logic(((R.edx >>> 0) & 0xffff) & ((R.edx >>> 0) & 0xffff), 16); // 84389c: test dx, dx
        if (R.zf) { pc = 0x8438a8; continue; } // 84389f: je 0x8438a8
        pc = 0x8438a1; continue;
      case 0x8438a1:
        R.eax = ((R.eax & 0xffff00ff) | (((R.logic(((R.eax >>> 8) & 0xff) | 0x4, 8)) & 0xff) << 8)) | 0; // 8438a1: or ah, 4
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.eax >>> 0)); // 8438a4: mov dword ptr [esp + 0x18], eax
        pc = 0x8438a8; continue;
      case 0x8438a8:
        R.sub(R.m.u8(((R.esi + 0x4) | 0) >>> 0), 0x1, 8); // 8438a8: cmp byte ptr [esi + 4], 1
        if (!R.zf) { pc = 0x843dbe; continue; } // 8438ac: jne 0x843dbe
        pc = 0x8438b2; continue;
      case 0x8438b2:
        R.sub(R.m.u8(((R.esi + 0x8) | 0) >>> 0), 0x64, 8); // 8438b2: cmp byte ptr [esi + 8], 0x64
        if (!R.cf) { pc = 0x843dbe; continue; } // 8438b6: jae 0x843dbe
        pc = 0x8438bc; continue;
      case 0x8438bc:
        R.eax = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 8438bc: mov eax, dword ptr [ebx]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8438be: test eax, eax
        if (R.zf) { pc = 0x843909; continue; } // 8438c0: je 0x843909
        pc = 0x8438c2; continue;
      case 0x8438c2:
        R.ecx = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 8438c2: mov ecx, dword ptr [ebp]
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 8438c5: test edi, edi
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.ecx >>> 0)); // 8438c7: mov dword ptr [esp + 0x28], ecx
        if (R.zf) { pc = 0x8438d5; continue; } // 8438cb: je 0x8438d5
        pc = 0x8438cd; continue;
      case 0x8438cd:
        R.edx = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 8438cd: mov edx, dword ptr [edi]
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.edx >>> 0)); // 8438cf: mov dword ptr [esp + 0x2c], edx
        pc = 0x8438dd; continue; // 8438d3: jmp 0x8438dd
      case 0x8438d5:
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, 0xffffffff); // 8438d5: mov dword ptr [esp + 0x2c], 0xffffffff
        pc = 0x8438dd; continue;
      case 0x8438dd:
        R.ecx = (R.m.u32(((R.ebx + 0x10) | 0) >>> 0)) | 0; // 8438dd: mov ecx, dword ptr [ebx + 0x10]
        R.push(0x757ea0); // 8438e0: push 0x757ea0
        R.push(0x8); // 8438e5: push 8
        R.push((R.ecx >>> 0)); // 8438e7: push ecx
        R.edx = (((R.esp + 0x34) | 0)) | 0; // 8438e8: lea edx, [esp + 0x34]
        R.push((R.eax >>> 0)); // 8438ec: push eax
        R.push((R.edx >>> 0)); // 8438ed: push edx
        R.call(0x946464, { n: 5, thisEcx: false, calleeClean: false }); // 8438ee: call 0x946464
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8438f3: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8438f6: test eax, eax
        if (R.zf) { pc = 0x843909; continue; } // 8438f8: je 0x843909
        pc = 0x8438fa; continue;
      case 0x8438fa:
        R.edi = (R.pop()) | 0; // 8438fa: pop edi
        R.esi = (R.pop()) | 0; // 8438fb: pop esi
        R.ebp = (R.pop()) | 0; // 8438fc: pop ebp
        R.eax = (0x1) | 0; // 8438fd: mov eax, 1
        R.ebx = (R.pop()) | 0; // 843902: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x20, 32)) | 0; // 843903: add esp, 0x20
        return R.ret(4); // 843906: ret 0x10
      case 0x843909:
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 843909: mov ecx, dword ptr [0xae1050]
        R.push((R.ebp >>> 0)); // 84390f: push ebp
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 843910: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 843915: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 843917: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x843936; continue; } // 84391c: je 0x843936
        pc = 0x84391e; continue;
      case 0x84391e:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 84391e: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 843921: mov edx, dword ptr [0xae23b4]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 843927: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 84392a: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 84392d: add ecx, eax
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 84392f: add edx, eax
        R.eax = (((R.edx + R.ecx * 4) | 0)) | 0; // 843931: lea eax, [edx + ecx*4]
        pc = 0x843938; continue; // 843934: jmp 0x843938
      case 0x843936:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 843936: xor eax, eax
        pc = 0x843938; continue;
      case 0x843938:
        R.push((R.edi >>> 0)); // 843938: push edi
        R.push((R.eax >>> 0)); // 843939: push eax
        R.push((R.ebp >>> 0)); // 84393a: push ebp
        R.ecx = ((R.ebx >>> 0)) | 0; // 84393b: mov ecx, ebx
        R.call(0x84b180, { n: 3, thisEcx: false, calleeClean: true }); // 84393d: call 0x84b180
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 843942: test al, al
        if (R.zf) { pc = 0x843dbe; continue; } // 843944: je 0x843dbe
        pc = 0x84394a; continue;
      case 0x84394a:
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 84394a: mov ecx, dword ptr [0xde1f54]
        R.push(0x1); // 843950: push 1
        R.push(0x0); // 843952: push 0
        R.push((R.edi >>> 0)); // 843954: push edi
        R.push((R.ebp >>> 0)); // 843955: push ebp
        R.call(0x8ce990, { n: 4, thisEcx: true, calleeClean: true }); // 843956: call 0x8ce990
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84395b: test eax, eax
        if (R.zf) { pc = 0x843dbe; continue; } // 84395d: je 0x843dbe
        pc = 0x843963; continue;
      case 0x843963:
        R.ebp = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 843963: mov ebp, dword ptr [esi]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, 0x0); // 843965: mov dword ptr [esp + 0x24], 0
        pc = 0x84396d; continue;
      case 0x84396d:
        R.logic(R.m.u8(((R.ebp + 0x24) | 0) >>> 0) & 0x1, 8); // 84396d: test byte ptr [ebp + 0x24], 1
        if (!R.zf) { pc = 0x843da9; continue; } // 843971: jne 0x843da9
        pc = 0x843977; continue;
      case 0x843977:
        R.sub(R.m.u8(((R.ebp) | 0) >>> 0), 0xb, 8); // 843977: cmp byte ptr [ebp], 0xb
        if (!R.zf) { pc = 0x843da9; continue; } // 84397b: jne 0x843da9
        pc = 0x843981; continue;
      case 0x843981:
        R.sub(R.m.u32(((R.ebp + 0x17) | 0) >>> 0), 0xffffffff, 32); // 843981: cmp dword ptr [ebp + 0x17], -1
        if (!R.zf) { pc = 0x843da9; continue; } // 843985: jne 0x843da9
        pc = 0x84398b; continue;
      case 0x84398b:
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.ebp + 0x1) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 84398b: mov ax, word ptr [ebp + 1]
        R.esi = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 84398f: mov esi, dword ptr [esp + 0x18]
        R.ecx = ((R.eax >>> 0)) | 0; // 843993: mov ecx, eax
        R.ecx = (R.logic((R.ecx >>> 0) & (R.esi >>> 0), 32)) | 0; // 843995: and ecx, esi
        R.sub(((R.ecx >>> 0) & 0xffff), ((R.eax >>> 0) & 0xffff), 16); // 843997: cmp cx, ax
        if (!R.zf) { pc = 0x843da9; continue; } // 84399a: jne 0x843da9
        pc = 0x8439a0; continue;
      case 0x8439a0:
        R.eax = (R.m.u32(((R.ebp + 0xf) | 0) >>> 0)) | 0; // 8439a0: mov eax, dword ptr [ebp + 0xf]
        R.ecx = (R.m.u32(((R.ebp + 0x13) | 0) >>> 0)) | 0; // 8439a3: mov ecx, dword ptr [ebp + 0x13]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 8439a6: cmp eax, ecx
        if (!R.zf) { pc = 0x8439b3; continue; } // 8439a8: jne 0x8439b3
        pc = 0x8439aa; continue;
      case 0x8439aa:
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 8439aa: cmp eax, -1
        if (!R.zf) { pc = 0x843da9; continue; } // 8439ad: jne 0x843da9
        pc = 0x8439b3; continue;
      case 0x8439b3:
        R.edx = (R.m.u32(((R.ebp + 0x1f) | 0) >>> 0)) | 0; // 8439b3: mov edx, dword ptr [ebp + 0x1f]
        R.eax = (R.m.u32(((R.ebp + 0x1b) | 0) >>> 0)) | 0; // 8439b6: mov eax, dword ptr [ebp + 0x1b]
        R.push((R.edx >>> 0)); // 8439b9: push edx
        R.push((R.eax >>> 0)); // 8439ba: push eax
        R.ecx = (0xae2c90) | 0; // 8439bb: mov ecx, 0xae2c90
        R.call(0x456740, { n: 2, thisEcx: true, calleeClean: true }); // 8439c0: call 0x456740
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8439c5: test eax, eax
        if (R.zf) { pc = 0x843da9; continue; } // 8439c7: je 0x843da9
        pc = 0x8439cd; continue;
      case 0x8439cd:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebp + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8439cd: mov al, byte ptr [ebp + 0x24]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x1e, 8)) & 0xff) << 0)) | 0; // 8439d0: and al, 0x1e
        R.sub(((R.eax >>> 0) & 0xff), 0xa, 8); // 8439d2: cmp al, 0xa
        if (!R.zf) { pc = 0x843a3f; continue; } // 8439d4: jne 0x843a3f
        pc = 0x8439d6; continue;
      case 0x8439d6:
        R.ecx = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 8439d6: mov ecx, dword ptr [esp + 0x34]
        R.sub(R.m.u8(((R.ecx + 0x18) | 0) >>> 0), 0x18, 8); // 8439da: cmp byte ptr [ecx + 0x18], 0x18
        if (!R.cLE) { pc = 0x843da9; continue; } // 8439de: jg 0x843da9
        pc = 0x8439e4; continue;
      case 0x8439e4:
        R.sub(((R.eax >>> 0) & 0xff), ((R.eax >>> 0) & 0xff), 8); // 8439e4: cmp al, al
        if (!R.zf) { pc = 0x843a3f; continue; } // 8439e6: jne 0x843a3f
        pc = 0x8439e8; continue;
      case 0x8439e8:
        R.edx = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 8439e8: mov edx, dword ptr [esp + 0x34]
        R.ecx = (R.m.u32(((R.edi + 0x53) | 0) >>> 0)) | 0; // 8439ec: mov ecx, dword ptr [edi + 0x53]
        R.sub((R.ecx >>> 0), R.m.u32(((R.edx + 0x1a) | 0) >>> 0), 32); // 8439ef: cmp ecx, dword ptr [edx + 0x1a]
        if (R.zf) { pc = 0x843a43; continue; } // 8439f2: je 0x843a43
        pc = 0x8439f4; continue;
      case 0x8439f4:
        R.eax = (R.m.u32(((R.edx + 0x39) | 0) >>> 0)) | 0; // 8439f4: mov eax, dword ptr [edx + 0x39]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8439f7: test eax, eax
        if (R.zf) { pc = 0x843a00; continue; } // 8439f9: je 0x843a00
        pc = 0x8439fb; continue;
      case 0x8439fb:
        R.sub(R.m.u32(((R.eax + 0x53) | 0) >>> 0), (R.ecx >>> 0), 32); // 8439fb: cmp dword ptr [eax + 0x53], ecx
        if (R.zf) { pc = 0x843a43; continue; } // 8439fe: je 0x843a43
        pc = 0x843a00; continue;
      case 0x843a00:
        R.edx = (R.m.u32(((R.edx + 0x61) | 0) >>> 0)) | 0; // 843a00: mov edx, dword ptr [edx + 0x61]
        R.sub(R.m.u16(((R.edx + 0xb) | 0) >>> 0), 0x1388, 16); // 843a03: cmp word ptr [edx + 0xb], 0x1388
        if (R.cL) { pc = 0x843da9; continue; } // 843a09: jl 0x843da9
        pc = 0x843a0f; continue;
      case 0x843a0f:
        R.eax = (R.m.u32(((R.edi + 0xcf) | 0) >>> 0)) | 0; // 843a0f: mov eax, dword ptr [edi + 0xcf]
        R.ecx = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 843a15: mov ecx, dword ptr [esp + 0x34]
        R.push(0x0); // 843a19: push 0
        R.push((R.eax >>> 0)); // 843a1b: push eax
        R.push((R.ecx >>> 0)); // 843a1c: push ecx
        R.call(0x5407e0, { n: 0, thisEcx: false, calleeClean: false }); // 843a1d: call 0x5407e0
        R.push(0x3e8); // 843a22: push 0x3e8
        R.esi = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 843a27: movsx esi, ax
        R.eax = R.c.rand(R.m.s32(R.esp >>> 0)) | 0; // 843a2a: call 0x90cfc0
        R.eax = (R.add((R.eax >>> 0), 0x1f4, 32)) | 0; // 843a2f: add eax, 0x1f4
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 843a34: add esp, 0x10
        R.sub((R.esi >>> 0), (R.eax >>> 0), 32); // 843a37: cmp esi, eax
        if (R.cL) { pc = 0x843da9; continue; } // 843a39: jl 0x843da9
        pc = 0x843a3f; continue;
      case 0x843a3f:
        R.edx = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 843a3f: mov edx, dword ptr [esp + 0x34]
        pc = 0x843a43; continue;
      case 0x843a43:
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 843a43: mov ecx, dword ptr [0xde1f54]
        R.push(0x1); // 843a49: push 1
        R.push((R.edi >>> 0)); // 843a4b: push edi
        R.push((R.edx >>> 0)); // 843a4c: push edx
        R.call(0x8c7560, { n: 3, thisEcx: true, calleeClean: true }); // 843a4d: call 0x8c7560
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 843a52: test eax, eax
        if (R.zf) { pc = 0x843a6b; continue; } // 843a54: je 0x843a6b
        pc = 0x843a56; continue;
      case 0x843a56:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebp + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 843a56: mov al, byte ptr [ebp + 0x24]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x1e, 8)) & 0xff) << 0)) | 0; // 843a59: and al, 0x1e
        R.sub(((R.eax >>> 0) & 0xff), 0x2, 8); // 843a5b: cmp al, 2
        if (R.zf) { pc = 0x843a6b; continue; } // 843a5d: je 0x843a6b
        pc = 0x843a5f; continue;
      case 0x843a5f:
        R.sub(((R.eax >>> 0) & 0xff), 0x4, 8); // 843a5f: cmp al, 4
        if (R.zf) { pc = 0x843a6b; continue; } // 843a61: je 0x843a6b
        pc = 0x843a63; continue;
      case 0x843a63:
        R.sub(((R.eax >>> 0) & 0xff), 0x6, 8); // 843a63: cmp al, 6
        if (!R.zf) { pc = 0x843da9; continue; } // 843a65: jne 0x843da9
        pc = 0x843a6b; continue;
      case 0x843a6b:
        R.eax = (R.m.u32(((R.ebp + 0xf) | 0) >>> 0)) | 0; // 843a6b: mov eax, dword ptr [ebp + 0xf]
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 843a6e: cmp eax, -1
        if (R.zf) { pc = 0x843bf3; continue; } // 843a71: je 0x843bf3
        pc = 0x843a77; continue;
      case 0x843a77:
        R.ecx = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 843a77: mov ecx, dword ptr [0xae23bc]
        R.esi = (R.m.u32(((R.ebp + 0x3) | 0) >>> 0)) | 0; // 843a7d: mov esi, dword ptr [ebp + 3]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 843a80: lea edx, [eax + eax*4]
        R.push(0x1); // 843a83: push 1
        R.push((R.esi >>> 0)); // 843a85: push esi
        R.eax = (((R.eax + R.edx * 2) | 0)) | 0; // 843a86: lea eax, [eax + edx*2]
        R.edx = (((R.esp + 0x1c) | 0)) | 0; // 843a89: lea edx, [esp + 0x1c]
        R.push((R.edx >>> 0)); // 843a8d: push edx
        R.push((R.ebp >>> 0)); // 843a8e: push ebp
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 843a8f: lea eax, [eax + eax*4]
        R.ebx = (((R.ecx + R.eax * 2) | 0)) | 0; // 843a92: lea ebx, [ecx + eax*2]
        R.ecx = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 843a95: mov ecx, dword ptr [esp + 0x30]
        R.push((R.ebx >>> 0)); // 843a99: push ebx
        R.push((R.edi >>> 0)); // 843a9a: push edi
        R.call(0x840d80, { n: 6, thisEcx: true, calleeClean: true }); // 843a9b: call 0x840d80
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 843aa0: mov ecx, dword ptr [0xae1050]
        R.push((R.ebx >>> 0)); // 843aa6: push ebx
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.eax >>> 0)); // 843aa7: mov dword ptr [esp + 0x2c], eax
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 843aab: call 0x4cf5a0
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 843ab0: test eax, eax
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 843ab2: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 0x843ad7; continue; } // 843ab7: je 0x843ad7
        pc = 0x843ab9; continue;
      case 0x843ab9:
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 843ab9: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 843abc: mov edx, dword ptr [0xae23b4]
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 843ac2: add edx, eax
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 843ac4: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 843ac7: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 843aca: add ecx, eax
        R.edi = (((R.edx + R.ecx * 4) | 0)) | 0; // 843acc: lea edi, [edx + ecx*4]
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 843acf: test edi, edi
        if (!R.zf) { pc = 0x843adb; continue; } // 843ad1: jne 0x843adb
        pc = 0x843ad3; continue;
      case 0x843ad3:
        R.edi = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 843ad3: mov edi, dword ptr [esp + 0x38]
        pc = 0x843ad7; continue;
      case 0x843ad7:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 843ad7: xor eax, eax
        pc = 0x843b20; continue; // 843ad9: jmp 0x843b20
      case 0x843adb:
        R.push(0x0); // 843adb: push 0
        R.push(0x0); // 843add: push 0
        R.push(0x1); // 843adf: push 1
        R.push(0x0); // 843ae1: push 0
        R.push((R.edi >>> 0)); // 843ae3: push edi
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 843ae4: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 843ae9: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 843aec: test eax, eax
        if (R.zf) { pc = 0x843b04; continue; } // 843aee: je 0x843b04
        pc = 0x843af0; continue;
      case 0x843af0:
        R.eax = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 843af0: mov eax, dword ptr [esp + 0x38]
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 843af4: mov ecx, dword ptr [0xae1050]
        R.push((R.ebx >>> 0)); // 843afa: push ebx
        R.push((R.eax >>> 0)); // 843afb: push eax
        R.push((R.edi >>> 0)); // 843afc: push edi
        R.call(0x4d42d0, { n: 3, thisEcx: true, calleeClean: true }); // 843afd: call 0x4d42d0
        pc = 0x843b1c; continue; // 843b02: jmp 0x843b1c
      case 0x843b04:
        R.ecx = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 843b04: mov ecx, dword ptr [esp + 0x38]
        R.push(0x1); // 843b08: push 1
        R.push(0x1); // 843b0a: push 1
        R.push(0x0); // 843b0c: push 0
        R.push((R.ebx >>> 0)); // 843b0e: push ebx
        R.push((R.ecx >>> 0)); // 843b0f: push ecx
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 843b10: mov ecx, dword ptr [0xae1050]
        R.push((R.edi >>> 0)); // 843b16: push edi
        R.call(0x4d1600, { n: 6, thisEcx: true, calleeClean: true }); // 843b17: call 0x4d1600
        pc = 0x843b1c; continue;
      case 0x843b1c:
        R.edi = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 843b1c: mov edi, dword ptr [esp + 0x38]
        pc = 0x843b20; continue;
      case 0x843b20:
        R.ecx = (((R.m.u16(((R.edi + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 843b20: movsx ecx, word ptr [edi + 0x80]
        R.edx = (R.m.u32(((R.esp + 0x28) | 0) >>> 0)) | 0; // 843b27: mov edx, dword ptr [esp + 0x28]
        { const p = BigInt((((R.ecx >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 843b2b: imul ecx, ecx
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 843b2e: sub eax, edx
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 843b30: mov dword ptr [esp + 0x28], eax
        R.eax = (0x66666667) | 0; // 843b34: mov eax, 0x66666667
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 843b39: imul ecx
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 843b3b: fild dword ptr [esp + 0x28]
        R.edx = (R.sar((R.edx >>> 0), 0x2, 32)) | 0; // 843b3f: sar edx, 2
        R.eax = ((R.edx >>> 0)) | 0; // 843b42: mov eax, edx
        R.eax = (R.shr((R.eax >>> 0), 0x1f, 32)) | 0; // 843b44: shr eax, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 843b47: add edx, eax
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.edx >>> 0)); // 843b49: mov dword ptr [esp + 0x28], edx
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 843b4d: fild dword ptr [esp + 0x28]
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 843b51: fdivp st(1)
        R.st[0] = 1.0 - R.st[0]; // 843b53: fsubr qword ptr [0x967890]
        R.fpush(0.01); // 843b59: fld qword ptr [0x967898]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 843b5f: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 843b61: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 843b63: test ah, 0x41
        if (!R.zf) { pc = 0x843b72; continue; } // 843b66: jne 0x843b72
        pc = 0x843b68; continue;
      case 0x843b68:
        R.fpop(); // 843b68: fstp st(0)
        R.fpush(0.01); // 843b6a: fld qword ptr [0x967898]
        pc = 0x843ba4; continue; // 843b70: jmp 0x843ba4
      case 0x843b72:
        R.fpush(3.0); // 843b72: fld qword ptr [0x968930]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 843b78: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 843b7a: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 843b7c: test ah, 1
        if (R.zf) { pc = 0x843b8b; continue; } // 843b7f: je 0x843b8b
        pc = 0x843b81; continue;
      case 0x843b81:
        R.fpop(); // 843b81: fstp st(0)
        R.fpush(3.0); // 843b83: fld qword ptr [0x968930]
        pc = 0x843b98; continue; // 843b89: jmp 0x843b98
      case 0x843b8b:
        R.fcom(R.st[0], 1.0); // 843b8b: fcom qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 843b91: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 843b93: test ah, 0x41
        if (!R.zf) { pc = 0x843ba4; continue; } // 843b96: jne 0x843ba4
        pc = 0x843b98; continue;
      case 0x843b98:
        R.st[0] = R.st[0] * 0.3333333333333333; // 843b98: fmul qword ptr [0x968a80]
        R.st[0] = R.st[0] + 0.67; // 843b9e: fadd qword ptr [0x968f80]
        pc = 0x843ba4; continue;
      case 0x843ba4:
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 843ba4: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * R.st[1]; // 843ba8: fmul st(1)
        R.ftol(); // 843baa: call 0x945640
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.eax >>> 0)); // 843baf: mov dword ptr [esp + 0x14], eax
        R.ecx = (R.m.u32(((R.ebp + 0x3) | 0) >>> 0)) | 0; // 843bb3: mov ecx, dword ptr [ebp + 3]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 843bb6: cmp eax, ecx
        R.fpop(); // 843bb8: fstp st(0)
        if (!R.cL) { pc = 0x843da9; continue; } // 843bba: jge 0x843da9
        pc = 0x843bc0; continue;
      case 0x843bc0:
        R.sub((R.eax >>> 0), (R.esi >>> 0), 32); // 843bc0: cmp eax, esi
        if (!R.cLE) { pc = 0x843bc8; continue; } // 843bc2: jg 0x843bc8
        pc = 0x843bc4; continue;
      case 0x843bc4:
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.esi >>> 0)); // 843bc4: mov dword ptr [esp + 0x14], esi
        pc = 0x843bc8; continue;
      case 0x843bc8:
        R.ecx = (R.m.u32(((0xb63d28) | 0) >>> 0)) | 0; // 843bc8: mov ecx, dword ptr [0xb63d28]
        R.push((R.ebx >>> 0)); // 843bce: push ebx
        R.call(0x62ed70, { n: 1, thisEcx: true, calleeClean: true }); // 843bcf: call 0x62ed70
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 843bd4: test eax, eax
        if (R.zf) { pc = 0x843bfc; continue; } // 843bd6: je 0x843bfc
        pc = 0x843bd8; continue;
      case 0x843bd8:
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.eax + 0x2c) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 843bd8: mov ax, word ptr [eax + 0x2c]
        R.sub(((R.eax >>> 0) & 0xffff), 0xf, 16); // 843bdc: cmp ax, 0xf
        if (R.cLE) { pc = 0x843bfc; continue; } // 843be0: jle 0x843bfc
        pc = 0x843be2; continue;
      case 0x843be2:
        R.eax = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 843be2: movsx eax, ax
        R.eax = (R.add((R.eax >>> 0), 0xfffffff1, 32)) | 0; // 843be5: add eax, -0xf
        R.ecx = ((R.eax >>> 0)) | 0; // 843be8: mov ecx, eax
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 843bea: imul ecx, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, R.sub(R.m.u32(((R.esp + 0x14) | 0) >>> 0), (R.ecx >>> 0), 32)); // 843bed: sub dword ptr [esp + 0x14], ecx
        pc = 0x843bfc; continue; // 843bf1: jmp 0x843bfc
      case 0x843bf3:
        R.esi = (R.m.u32(((R.ebp + 0x3) | 0) >>> 0)) | 0; // 843bf3: mov esi, dword ptr [ebp + 3]
        R.ebx = (R.logic((R.ebx >>> 0) ^ (R.ebx >>> 0), 32)) | 0; // 843bf6: xor ebx, ebx
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.esi >>> 0)); // 843bf8: mov dword ptr [esp + 0x14], esi
        pc = 0x843bfc; continue;
      case 0x843bfc:
        R.eax = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 843bfc: mov eax, dword ptr [esp + 0x34]
        R.ecx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 843c00: mov ecx, dword ptr [esp + 0x20]
        R.push(0x0); // 843c04: push 0
        R.edx = (((R.esp + 0x20) | 0)) | 0; // 843c06: lea edx, [esp + 0x20]
        R.push((R.esi >>> 0)); // 843c0a: push esi
        R.push((R.edx >>> 0)); // 843c0b: push edx
        R.push((R.ebp >>> 0)); // 843c0c: push ebp
        R.push((R.eax >>> 0)); // 843c0d: push eax
        R.push((R.edi >>> 0)); // 843c0e: push edi
        R.call(0x840d80, { n: 6, thisEcx: true, calleeClean: true }); // 843c0f: call 0x840d80
        R.esi = ((R.eax >>> 0)) | 0; // 843c14: mov esi, eax
        R.eax = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 843c16: mov eax, dword ptr [esp + 0x10]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 843c1a: test eax, eax
        if (R.zf) { pc = 0x843caf; continue; } // 843c1c: je 0x843caf
        pc = 0x843c22; continue;
      case 0x843c22:
        R.ecx = ((R.eax >>> 0)) | 0; // 843c22: mov ecx, eax
        R.push((R.ecx >>> 0)); // 843c24: push ecx
        R.ecx = (R.m.u32(((0xae2a38) | 0) >>> 0)) | 0; // 843c25: mov ecx, dword ptr [0xae2a38]
        R.call(0x5a0590, { n: 1, thisEcx: true, calleeClean: true }); // 843c2b: call 0x5a0590
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 843c30: test eax, eax
        if (R.zf) { pc = 0x843caf; continue; } // 843c32: je 0x843caf
        pc = 0x843c34; continue;
      case 0x843c34:
        R.edx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 843c34: mov edx, dword ptr [esp + 0x10]
        R.ecx = (R.m.u32(((0xae2a38) | 0) >>> 0)) | 0; // 843c38: mov ecx, dword ptr [0xae2a38]
        R.push((R.edx >>> 0)); // 843c3e: push edx
        R.call(0x5a0590, { n: 1, thisEcx: true, calleeClean: true }); // 843c3f: call 0x5a0590
        R.sub(R.m.u8(((R.eax + 0x165) | 0) >>> 0), 0x1, 8); // 843c44: cmp byte ptr [eax + 0x165], 1
        if (!R.zf) { pc = 0x843caf; continue; } // 843c4b: jne 0x843caf
        pc = 0x843c4d; continue;
      case 0x843c4d:
        R.eax = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 843c4d: mov eax, dword ptr [esp + 0x10]
        R.push(0x0); // 843c51: push 0
        R.push(0x0); // 843c53: push 0
        R.push(0x1); // 843c55: push 1
        R.push(0x0); // 843c57: push 0
        R.push((R.eax >>> 0)); // 843c59: push eax
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 843c5a: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 843c5f: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 843c62: test eax, eax
        if (R.zf) { pc = 0x843ca2; continue; } // 843c64: je 0x843ca2
        pc = 0x843c66; continue;
      case 0x843c66:
        R.ecx = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 843c66: mov ecx, dword ptr [esp + 0x10]
        R.edx = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 843c6a: mov edx, dword ptr [esp + 0x34]
        R.push(0x0); // 843c6e: push 0
        R.push(0xffffffff); // 843c70: push -1
        R.push(0x0); // 843c72: push 0
        R.push((R.ecx >>> 0)); // 843c74: push ecx
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 843c75: mov ecx, dword ptr [0xae1050]
        R.push((R.edx >>> 0)); // 843c7b: push edx
        R.call(0x4d0c60, { n: 5, thisEcx: false, calleeClean: true }); // 843c7c: call 0x4d0c60
        R.sub((R.esi >>> 0), (R.eax >>> 0), 32); // 843c81: cmp esi, eax
        if (R.cL) { pc = 0x843caf; continue; } // 843c83: jl 0x843caf
        pc = 0x843c85; continue;
      case 0x843c85:
        R.eax = (R.m.u32(((R.esp + 0x10) | 0) >>> 0)) | 0; // 843c85: mov eax, dword ptr [esp + 0x10]
        R.ecx = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 843c89: mov ecx, dword ptr [esp + 0x34]
        R.push(0x0); // 843c8d: push 0
        R.push(0xffffffff); // 843c8f: push -1
        R.push(0x0); // 843c91: push 0
        R.push((R.eax >>> 0)); // 843c93: push eax
        R.push((R.ecx >>> 0)); // 843c94: push ecx
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 843c95: mov ecx, dword ptr [0xae1050]
        R.call(0x4d0c60, { n: 5, thisEcx: false, calleeClean: true }); // 843c9b: call 0x4d0c60
        pc = 0x843cad; continue; // 843ca0: jmp 0x843cad
      case 0x843ca2:
        R.edx = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 843ca2: mov edx, dword ptr [esp + 0x34]
        R.eax = (R.m.u32(((R.edx + 0x52) | 0) >>> 0)) | 0; // 843ca6: mov eax, dword ptr [edx + 0x52]
        R.sub((R.esi >>> 0), (R.eax >>> 0), 32); // 843ca9: cmp esi, eax
        if (R.cL) { pc = 0x843caf; continue; } // 843cab: jl 0x843caf
        pc = 0x843cad; continue;
      case 0x843cad:
        R.esi = ((R.eax >>> 0)) | 0; // 843cad: mov esi, eax
        pc = 0x843caf; continue;
      case 0x843caf:
        R.ecx = (((R.m.u16(((R.edi + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 843caf: movsx ecx, word ptr [edi + 0x80]
        R.eax = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 843cb6: mov eax, dword ptr [esp + 0x3c]
        { const p = BigInt((((R.ecx >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 843cba: imul ecx, ecx
        R.eax = (R.sub((R.eax >>> 0), (R.esi >>> 0), 32)) | 0; // 843cbd: sub eax, esi
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 843cbf: mov dword ptr [esp + 0x28], eax
        R.eax = (0x66666667) | 0; // 843cc3: mov eax, 0x66666667
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 843cc8: imul ecx
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 843cca: fild dword ptr [esp + 0x28]
        R.edx = (R.sar((R.edx >>> 0), 0x2, 32)) | 0; // 843cce: sar edx, 2
        R.ecx = ((R.edx >>> 0)) | 0; // 843cd1: mov ecx, edx
        R.ecx = (R.shr((R.ecx >>> 0), 0x1f, 32)) | 0; // 843cd3: shr ecx, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 843cd6: add edx, ecx
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.edx >>> 0)); // 843cd8: mov dword ptr [esp + 0x28], edx
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 843cdc: fild dword ptr [esp + 0x28]
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 843ce0: fdivp st(1)
        R.st[0] = 1.0 - R.st[0]; // 843ce2: fsubr qword ptr [0x967890]
        R.fpush(0.01); // 843ce8: fld qword ptr [0x967898]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 843cee: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 843cf0: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 843cf2: test ah, 0x41
        if (!R.zf) { pc = 0x843d01; continue; } // 843cf5: jne 0x843d01
        pc = 0x843cf7; continue;
      case 0x843cf7:
        R.fpop(); // 843cf7: fstp st(0)
        R.fpush(0.01); // 843cf9: fld qword ptr [0x967898]
        pc = 0x843d33; continue; // 843cff: jmp 0x843d33
      case 0x843d01:
        R.fpush(3.0); // 843d01: fld qword ptr [0x968930]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 843d07: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 843d09: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 843d0b: test ah, 1
        if (R.zf) { pc = 0x843d1a; continue; } // 843d0e: je 0x843d1a
        pc = 0x843d10; continue;
      case 0x843d10:
        R.fpop(); // 843d10: fstp st(0)
        R.fpush(3.0); // 843d12: fld qword ptr [0x968930]
        pc = 0x843d27; continue; // 843d18: jmp 0x843d27
      case 0x843d1a:
        R.fcom(R.st[0], 1.0); // 843d1a: fcom qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 843d20: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 843d22: test ah, 0x41
        if (!R.zf) { pc = 0x843d33; continue; } // 843d25: jne 0x843d33
        pc = 0x843d27; continue;
      case 0x843d27:
        R.st[0] = R.st[0] * 0.3333333333333333; // 843d27: fmul qword ptr [0x968a80]
        R.st[0] = R.st[0] + 0.67; // 843d2d: fadd qword ptr [0x968f80]
        pc = 0x843d33; continue;
      case 0x843d33:
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 843d33: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * R.st[1]; // 843d37: fmul st(1)
        R.ftol(); // 843d39: call 0x945640
        R.edx = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 843d3e: mov edx, dword ptr [esp + 0x34]
        R.ecx = (R.m.u32(((0xb63d28) | 0) >>> 0)) | 0; // 843d42: mov ecx, dword ptr [0xb63d28]
        R.push((R.edx >>> 0)); // 843d48: push edx
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.eax >>> 0)); // 843d49: mov dword ptr [esp + 0x20], eax
        R.fpop(); // 843d4d: fstp st(0)
        R.call(0x62ed70, { n: 1, thisEcx: true, calleeClean: true }); // 843d4f: call 0x62ed70
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 843d54: test eax, eax
        if (R.zf) { pc = 0x843d71; continue; } // 843d56: je 0x843d71
        pc = 0x843d58; continue;
      case 0x843d58:
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.eax + 0x2c) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 843d58: mov ax, word ptr [eax + 0x2c]
        R.sub(((R.eax >>> 0) & 0xffff), 0xf, 16); // 843d5c: cmp ax, 0xf
        if (R.cLE) { pc = 0x843d71; continue; } // 843d60: jle 0x843d71
        pc = 0x843d62; continue;
      case 0x843d62:
        R.eax = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 843d62: movsx eax, ax
        R.eax = (R.add((R.eax >>> 0), 0xfffffff1, 32)) | 0; // 843d65: add eax, -0xf
        R.ecx = ((R.eax >>> 0)) | 0; // 843d68: mov ecx, eax
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 843d6a: imul ecx, eax
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, R.sub(R.m.u32(((R.esp + 0x1c) | 0) >>> 0), (R.ecx >>> 0), 32)); // 843d6d: sub dword ptr [esp + 0x1c], ecx
        pc = 0x843d71; continue;
      case 0x843d71:
        R.edx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 843d71: mov edx, dword ptr [esp + 0x1c]
        R.eax = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 843d75: mov eax, dword ptr [esp + 0x14]
        R.sub((R.edx >>> 0), (R.eax >>> 0), 32); // 843d79: cmp edx, eax
        if (R.cL) { pc = 0x843da9; continue; } // 843d7b: jl 0x843da9
        pc = 0x843d7d; continue;
      case 0x843d7d:
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebp + 0x24) | 0) >>> 0)) & 0xff) << 0)) | 0; // 843d7d: mov al, byte ptr [ebp + 0x24]
        R.ecx = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 843d80: mov ecx, dword ptr [esp + 0x34]
        R.esi = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 843d84: mov esi, dword ptr [esp + 0x20]
        R.push(0x0); // 843d88: push 0
        R.eax = ((R.eax & 0xffffff00) | (((R.shr(((R.eax >>> 0) & 0xff), 0x1, 8)) & 0xff) << 0)) | 0; // 843d8a: shr al, 1
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf, 8)) & 0xff) << 0)) | 0; // 843d8c: and al, 0xf
        R.push((R.eax >>> 0)); // 843d8e: push eax
        R.push(0x0); // 843d8f: push 0
        R.push(0x1); // 843d91: push 1
        R.push((R.edi >>> 0)); // 843d93: push edi
        R.push((R.ecx >>> 0)); // 843d94: push ecx
        R.ecx = ((R.esi >>> 0)) | 0; // 843d95: mov ecx, esi
        R.call(0x846920, { n: 6, thisEcx: true, calleeClean: true, float: true }); // 843d97: call 0x846920
        R.fcom(R.st[0], 2.75); R.fpop(); // 843d9c: fcomp qword ptr [0x9690a8]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 843da2: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 843da4: test ah, 1
        if (R.zf) { pc = 0x843dca; continue; } // 843da7: je 0x843dca
        pc = 0x843da9; continue;
      case 0x843da9:
        R.eax = (R.m.u32(((R.esp + 0x24) | 0) >>> 0)) | 0; // 843da9: mov eax, dword ptr [esp + 0x24]
        R.ebp = (R.add((R.ebp >>> 0), 0x25, 32)) | 0; // 843dad: add ebp, 0x25
        R.eax = (R.incdec((R.eax >>> 0), 1, 32)) | 0; // 843db0: inc eax
        R.sub((R.eax >>> 0), 0x28, 32); // 843db1: cmp eax, 0x28
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.eax >>> 0)); // 843db4: mov dword ptr [esp + 0x24], eax
        if (R.cL) { pc = 0x84396d; continue; } // 843db8: jl 0x84396d
        pc = 0x843dbe; continue;
      case 0x843dbe:
        R.edi = (R.pop()) | 0; // 843dbe: pop edi
        R.esi = (R.pop()) | 0; // 843dbf: pop esi
        R.ebp = (R.pop()) | 0; // 843dc0: pop ebp
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 843dc1: xor eax, eax
        R.ebx = (R.pop()) | 0; // 843dc3: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x20, 32)) | 0; // 843dc4: add esp, 0x20
        return R.ret(4); // 843dc7: ret 0x10
      case 0x843dca:
        R.eax = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 843dca: mov eax, dword ptr [esp + 0x40]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 843dce: test eax, eax
        if (R.zf) { pc = 0x843df9; continue; } // 843dd0: je 0x843df9
        pc = 0x843dd2; continue;
      case 0x843dd2:
        R.edx = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 843dd2: mov edx, dword ptr [esp + 0x34]
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 843dd6: test ebx, ebx
        R.eax = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 843dd8: mov eax, dword ptr [edx]
        R.m.w32(((R.ebp + 0xf) | 0) >>> 0, (R.eax >>> 0)); // 843dda: mov dword ptr [ebp + 0xf], eax
        if (R.zf) { pc = 0x843dec; continue; } // 843ddd: je 0x843dec
        pc = 0x843ddf; continue;
      case 0x843ddf:
        R.push(0x0); // 843ddf: push 0
        R.push(0x3); // 843de1: push 3
        R.push((R.edi >>> 0)); // 843de3: push edi
        R.push((R.ebx >>> 0)); // 843de4: push ebx
        R.ecx = ((R.esi >>> 0)) | 0; // 843de5: mov ecx, esi
        R.call(0x843e10, { n: 4, thisEcx: true, calleeClean: true }); // 843de7: call 0x843e10
        pc = 0x843dec; continue;
      case 0x843dec:
        R.ecx = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 843dec: mov ecx, dword ptr [esp + 0x34]
        R.push((R.edi >>> 0)); // 843df0: push edi
        R.push((R.ecx >>> 0)); // 843df1: push ecx
        R.ecx = ((R.esi >>> 0)) | 0; // 843df2: mov ecx, esi
        R.call(0x8423f0, { n: 2, thisEcx: true, calleeClean: true }); // 843df4: call 0x8423f0
        pc = 0x843df9; continue;
      case 0x843df9:
        R.edi = (R.pop()) | 0; // 843df9: pop edi
        R.esi = (R.pop()) | 0; // 843dfa: pop esi
        R.ebp = (R.pop()) | 0; // 843dfb: pop ebp
        R.eax = (0x1) | 0; // 843dfc: mov eax, 1
        R.ebx = (R.pop()) | 0; // 843e01: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x20, 32)) | 0; // 843e02: add esp, 0x20
        return R.ret(4); // 843e05: ret 0x10
      default: throw new Error(`f_843800: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
