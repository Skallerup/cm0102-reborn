// 0x868210 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 417c10=2tc, 53ab90=2, 54a110=0t, 54cc30=3tc
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_868210(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x868210;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x868210:
        R.push(0xffffffff); // 868210: push -1
        R.push(0x962b08); // 868212: push 0x962b08
        R.eax = (0) | 0; // 868217: mov eax, dword ptr fs:[0]
        R.push((R.eax >>> 0)); // 86821d: push eax
        /* fs */ // 86821e: mov dword ptr fs:[0], esp
        R.esp = (R.sub((R.esp >>> 0), 0x18, 32)) | 0; // 868225: sub esp, 0x18
        R.push((R.ebp >>> 0)); // 868228: push ebp
        R.push((R.esi >>> 0)); // 868229: push esi
        R.push((R.edi >>> 0)); // 86822a: push edi
        R.edi = ((R.ecx >>> 0)) | 0; // 86822b: mov edi, ecx
        R.ecx = (((R.esp + 0xc) | 0)) | 0; // 86822d: lea ecx, [esp + 0xc]
        R.call(0x54a110, { n: 0, thisEcx: true, calleeClean: false }); // 868231: call 0x54a110
        R.ebp = (R.m.u32(((R.esp + 0x38) | 0) >>> 0)) | 0; // 868236: mov ebp, dword ptr [esp + 0x38]
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, 0x0); // 86823a: mov dword ptr [esp + 0x2c], 0
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 868242: test ebp, ebp
        if (R.zf) { pc = 0x86824d; continue; } // 868244: je 0x86824d
        pc = 0x868246; continue;
      case 0x868246:
        R.m.w32(((R.ebp) | 0) >>> 0, 0x0); // 868246: mov dword ptr [ebp], 0
        pc = 0x86824d; continue;
      case 0x86824d:
        R.sub(R.m.u8(((0xae233c) | 0) >>> 0), 0x1, 8); // 86824d: cmp byte ptr [0xae233c], 1
        if (R.zf) { pc = 0x86826f; continue; } // 868254: je 0x86826f
        pc = 0x868256; continue;
      case 0x868256:
        R.edi = (R.pop()) | 0; // 868256: pop edi
        R.esi = (R.pop()) | 0; // 868257: pop esi
        R.eax = (0x1) | 0; // 868258: mov eax, 1
        R.ebp = (R.pop()) | 0; // 86825d: pop ebp
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 86825e: mov ecx, dword ptr [esp + 0x18]
        /* fs */ // 868262: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 868269: add esp, 0x24
        return R.eax; // 86826c: ret 0xc
      case 0x86826f:
        R.ecx = (R.m.u32(((0xae2330) | 0) >>> 0)) | 0; // 86826f: mov ecx, dword ptr [0xae2330]
        R.eax = (R.m.u32(((0xae2334) | 0) >>> 0)) | 0; // 868275: mov eax, dword ptr [0xae2334]
        R.esi = (((R.edi + 0x25) | 0)) | 0; // 86827a: lea esi, [edi + 0x25]
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.ecx >>> 0)); // 86827d: mov dword ptr [esp + 0x14], ecx
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.esp + 0x16) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 868281: mov dx, word ptr [esp + 0x16]
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.eax >>> 0)); // 868286: mov dword ptr [esp + 0x18], eax
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.esi + 0x2) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 86828a: mov ax, word ptr [esi + 2]
        R.sub(((R.edx >>> 0) & 0xffff), ((R.eax >>> 0) & 0xffff), 16); // 86828e: cmp dx, ax
        if (!R.cBE) { pc = 0x8682a1; continue; } // 868291: ja 0x8682a1
        pc = 0x868293; continue;
      case 0x868293:
        if (R.cf) { pc = 0x8682ba; continue; } // 868293: jb 0x8682ba
        pc = 0x868295; continue;
      case 0x868295:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 868295: xor eax, eax
        R.sub(((R.ecx >>> 0) & 0xffff), R.m.u16(((R.esi) | 0) >>> 0), 16); // 868297: cmp cx, word ptr [esi]
        R.eax = ((R.eax & 0xffffff00) | (((!R.cLE ? 1 : 0) & 0xff) << 0)) | 0; // 86829a: setg al
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 86829d: test eax, eax
        if (R.zf) { pc = 0x8682ba; continue; } // 86829f: je 0x8682ba
        pc = 0x8682a1; continue;
      case 0x8682a1:
        R.edi = (R.pop()) | 0; // 8682a1: pop edi
        R.esi = (R.pop()) | 0; // 8682a2: pop esi
        R.eax = (0x1) | 0; // 8682a3: mov eax, 1
        R.ebp = (R.pop()) | 0; // 8682a8: pop ebp
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 8682a9: mov ecx, dword ptr [esp + 0x18]
        /* fs */ // 8682ad: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 8682b4: add esp, 0x24
        return R.eax; // 8682b7: ret 0xc
      case 0x8682ba:
        R.ecx = (R.m.u32(((R.esi + 0x4) | 0) >>> 0)) | 0; // 8682ba: mov ecx, dword ptr [esi + 4]
        R.edx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8682bd: mov edx, dword ptr [esi]
        R.push((R.ebx >>> 0)); // 8682bf: push ebx
        R.push((R.ecx >>> 0)); // 8682c0: push ecx
        R.eax = (((R.esp + 0x1c) | 0)) | 0; // 8682c1: lea eax, [esp + 0x1c]
        R.push((R.edx >>> 0)); // 8682c5: push edx
        R.push((R.eax >>> 0)); // 8682c6: push eax
        R.ecx = (0xae2c90) | 0; // 8682c7: mov ecx, 0xae2c90
        R.call(0x54cc30, { n: 3, thisEcx: true, calleeClean: true }); // 8682cc: call 0x54cc30
        R.ecx = (((R.esp + 0x20) | 0)) | 0; // 8682d1: lea ecx, [esp + 0x20]
        R.push((R.eax >>> 0)); // 8682d5: push eax
        R.push((R.ecx >>> 0)); // 8682d6: push ecx
        R.ecx = (((R.esp + 0x18) | 0)) | 0; // 8682d7: lea ecx, [esp + 0x18]
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 8682db: call 0x417c10
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 8682e0: mov eax, dword ptr [edi]
        R.ecx = (R.m.u32(((0xae23bc) | 0) >>> 0)) | 0; // 8682e2: mov ecx, dword ptr [0xae23bc]
        R.push((R.esi >>> 0)); // 8682e8: push esi
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 8682e9: lea edx, [eax + eax*4]
        R.eax = (((R.eax + R.edx * 2) | 0)) | 0; // 8682ec: lea eax, [eax + edx*2]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 8682ef: lea eax, [eax + eax*4]
        R.edx = (((R.ecx + R.eax * 2) | 0)) | 0; // 8682f2: lea edx, [ecx + eax*2]
        R.push((R.edx >>> 0)); // 8682f5: push edx
        R.call(0x53ab90, { n: 2, thisEcx: false, calleeClean: false }); // 8682f6: call 0x53ab90
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 8682fb: add esp, 8
        R.sub(((R.eax >>> 0) & 0xff), 0x1c, 8); // 8682fe: cmp al, 0x1c
        R.eax = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 868300: mov eax, dword ptr [esp + 0x40]
        R.ebx = ((R.ebx & 0xffffff00) | (((R.cL ? 1 : 0) & 0xff) << 0)) | 0; // 868304: setl bl
        R.ebx = (R.add((R.ebx >>> 0), 0x2, 32)) | 0; // 868307: add ebx, 2
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 86830a: test eax, eax
        if (R.zf) { pc = 0x868310; continue; } // 86830c: je 0x868310
        pc = 0x86830e; continue;
      case 0x86830e:
        R.m.w8(((R.eax) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 86830e: mov byte ptr [eax], bl
        pc = 0x868310; continue;
      case 0x868310:
        R.eax = (R.m.u32(((R.esi + 0x4) | 0) >>> 0)) | 0; // 868310: mov eax, dword ptr [esi + 4]
        R.ecx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 868313: mov ecx, dword ptr [esi]
        R.push((R.eax >>> 0)); // 868315: push eax
        R.edx = (((R.esp + 0x24) | 0)) | 0; // 868316: lea edx, [esp + 0x24]
        R.push((R.ecx >>> 0)); // 86831a: push ecx
        R.push((R.edx >>> 0)); // 86831b: push edx
        R.ecx = (0xae2c90) | 0; // 86831c: mov ecx, 0xae2c90
        R.call(0x54cc30, { n: 3, thisEcx: true, calleeClean: true }); // 868321: call 0x54cc30
        R.push((R.eax >>> 0)); // 868326: push eax
        R.eax = (((R.esp + 0x1c) | 0)) | 0; // 868327: lea eax, [esp + 0x1c]
        R.push((R.eax >>> 0)); // 86832b: push eax
        R.ecx = (((R.esp + 0x18) | 0)) | 0; // 86832c: lea ecx, [esp + 0x18]
        R.call(0x417c10, { n: 2, thisEcx: true, calleeClean: true }); // 868330: call 0x417c10
        R.eax = (R.m.u32(((R.esp + 0x12) | 0) >>> 0)) | 0; // 868335: mov eax, dword ptr [esp + 0x12]
        R.ecx = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 868339: movsx ecx, bl
        R.eax = (R.logic((R.eax >>> 0) & 0xffff, 32)) | 0; // 86833c: and eax, 0xffff
        R.ebx = (R.pop()) | 0; // 868341: pop ebx
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 868342: cmp eax, ecx
        if (!R.cL) { pc = 0x86835f; continue; } // 868344: jge 0x86835f
        pc = 0x868346; continue;
      case 0x868346:
        R.edi = (R.pop()) | 0; // 868346: pop edi
        R.esi = (R.pop()) | 0; // 868347: pop esi
        R.eax = (0x1) | 0; // 868348: mov eax, 1
        R.ebp = (R.pop()) | 0; // 86834d: pop ebp
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 86834e: mov ecx, dword ptr [esp + 0x18]
        /* fs */ // 868352: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 868359: add esp, 0x24
        return R.eax; // 86835c: ret 0xc
      case 0x86835f:
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 86835f: test ebp, ebp
        if (R.zf) { pc = 0x868376; continue; } // 868361: je 0x868376
        pc = 0x868363; continue;
      case 0x868363:
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 868363: cmp eax, ecx
        if (!R.zf) { pc = 0x868376; continue; } // 868365: jne 0x868376
        pc = 0x868367; continue;
      case 0x868367:
        R.sub(R.m.u16(((R.esp + 0xc) | 0) >>> 0), 0x0, 16); // 868367: cmp word ptr [esp + 0xc], 0
        if (!R.zf) { pc = 0x868376; continue; } // 86836d: jne 0x868376
        pc = 0x86836f; continue;
      case 0x86836f:
        R.m.w32(((R.ebp) | 0) >>> 0, 0x1); // 86836f: mov dword ptr [ebp], 1
        pc = 0x868376; continue;
      case 0x868376:
        R.ecx = (R.m.u32(((R.esp + 0x24) | 0) >>> 0)) | 0; // 868376: mov ecx, dword ptr [esp + 0x24]
        R.edi = (R.pop()) | 0; // 86837a: pop edi
        R.esi = (R.pop()) | 0; // 86837b: pop esi
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 86837c: xor eax, eax
        R.ebp = (R.pop()) | 0; // 86837e: pop ebp
        /* fs */ // 86837f: mov dword ptr fs:[0], ecx
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 868386: add esp, 0x24
        return R.eax; // 868389: ret 0xc
      default: throw new Error(`f_868210: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
