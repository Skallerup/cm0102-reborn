// 0x53d980 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4cf5a0=1c, 53d740=2, 549f70=4tc
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_53d980(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x53d980;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x53d980:
        R.eax = (R.m.u32(((R.esp + 0x8) | 0) >>> 0)) | 0; // 53d980: mov eax, dword ptr [esp + 8]
        R.esp = (R.sub((R.esp >>> 0), 0x10, 32)) | 0; // 53d984: sub esp, 0x10
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 53d987: test eax, eax
        R.push((R.ebx >>> 0)); // 53d989: push ebx
        R.push((R.ebp >>> 0)); // 53d98a: push ebp
        R.push((R.esi >>> 0)); // 53d98b: push esi
        R.push((R.edi >>> 0)); // 53d98c: push edi
        if (!R.zf) { pc = 0x53d99c; continue; } // 53d98d: jne 0x53d99c
        pc = 0x53d98f; continue;
      case 0x53d98f:
        R.edi = (R.pop()) | 0; // 53d98f: pop edi
        R.esi = (R.pop()) | 0; // 53d990: pop esi
        R.ebp = (R.pop()) | 0; // 53d991: pop ebp
        R.eax = (0x1) | 0; // 53d992: mov eax, 1
        R.ebx = (R.pop()) | 0; // 53d997: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 53d998: add esp, 0x10
        return R.ret(0); // 53d99b: ret 
      case 0x53d99c:
        R.ecx = (R.m.u32(((R.esp + 0x24) | 0) >>> 0)) | 0; // 53d99c: mov ecx, dword ptr [esp + 0x24]
        R.ebp = (R.m.u32(((R.ecx + 0x1a) | 0) >>> 0)) | 0; // 53d9a0: mov ebp, dword ptr [ecx + 0x1a]
        R.sub((R.ebp >>> 0), (R.eax >>> 0), 32); // 53d9a3: cmp ebp, eax
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.ebp >>> 0)); // 53d9a5: mov dword ptr [esp + 0x28], ebp
        if (R.zf) { pc = 0x53db2a; continue; } // 53d9a9: je 0x53db2a
        pc = 0x53d9af; continue;
      case 0x53d9af:
        R.esi = (R.m.u32(((R.ecx + 0x1e) | 0) >>> 0)) | 0; // 53d9af: mov esi, dword ptr [ecx + 0x1e]
        R.sub((R.esi >>> 0), (R.eax >>> 0), 32); // 53d9b2: cmp esi, eax
        if (R.zf) { pc = 0x53db2a; continue; } // 53d9b4: je 0x53db2a
        pc = 0x53d9ba; continue;
      case 0x53d9ba:
        R.ecx = (R.m.u32(((R.esp + 0x2c) | 0) >>> 0)) | 0; // 53d9ba: mov ecx, dword ptr [esp + 0x2c]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 53d9be: test ecx, ecx
        if (!R.zf) { pc = 0x53d9cf; continue; } // 53d9c0: jne 0x53d9cf
        pc = 0x53d9c2; continue;
      case 0x53d9c2:
        R.edi = (R.pop()) | 0; // 53d9c2: pop edi
        R.esi = (R.pop()) | 0; // 53d9c3: pop esi
        R.ebp = (R.pop()) | 0; // 53d9c4: pop ebp
        R.eax = (0x1) | 0; // 53d9c5: mov eax, 1
        R.ebx = (R.pop()) | 0; // 53d9ca: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 53d9cb: add esp, 0x10
        return R.ret(0); // 53d9ce: ret 
      case 0x53d9cf:
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 53d9cf: mov eax, dword ptr [eax]
        R.edx = (R.m.u32(((0x9cf2e4) | 0) >>> 0)) | 0; // 53d9d1: mov edx, dword ptr [0x9cf2e4]
        R.edi = (R.m.u32(((0x9cf45c) | 0) >>> 0)) | 0; // 53d9d7: mov edi, dword ptr [0x9cf45c]
        R.ebx = (R.m.u32(((0x9cf510) | 0) >>> 0)) | 0; // 53d9dd: mov ebx, dword ptr [0x9cf510]
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 53d9e3: cmp eax, edx
        if (R.zf) { pc = 0x53d9ff; continue; } // 53d9e5: je 0x53d9ff
        pc = 0x53d9e7; continue;
      case 0x53d9e7:
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 53d9e7: cmp eax, edi
        if (R.zf) { pc = 0x53d9ff; continue; } // 53d9e9: je 0x53d9ff
        pc = 0x53d9eb; continue;
      case 0x53d9eb:
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 53d9eb: cmp eax, ebx
        if (R.zf) { pc = 0x53d9ff; continue; } // 53d9ed: je 0x53d9ff
        pc = 0x53d9ef; continue;
      case 0x53d9ef:
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf3e4) | 0) >>> 0), 32); // 53d9ef: cmp eax, dword ptr [0x9cf3e4]
        if (R.zf) { pc = 0x53d9ff; continue; } // 53d9f5: je 0x53d9ff
        pc = 0x53d9f7; continue;
      case 0x53d9f7:
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf2dc) | 0) >>> 0), 32); // 53d9f7: cmp eax, dword ptr [0x9cf2dc]
        if (!R.zf) { pc = 0x53da6a; continue; } // 53d9fd: jne 0x53da6a
        pc = 0x53d9ff; continue;
      case 0x53d9ff:
        R.ecx = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 53d9ff: mov ecx, dword ptr [ebp]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 53da02: cmp ecx, edx
        if (R.zf) { pc = 0x53db2a; continue; } // 53da04: je 0x53db2a
        pc = 0x53da0a; continue;
      case 0x53da0a:
        R.sub((R.ecx >>> 0), (R.edi >>> 0), 32); // 53da0a: cmp ecx, edi
        if (R.zf) { pc = 0x53db2a; continue; } // 53da0c: je 0x53db2a
        pc = 0x53da12; continue;
      case 0x53da12:
        R.sub((R.ecx >>> 0), (R.ebx >>> 0), 32); // 53da12: cmp ecx, ebx
        if (R.zf) { pc = 0x53db2a; continue; } // 53da14: je 0x53db2a
        pc = 0x53da1a; continue;
      case 0x53da1a:
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf2dc) | 0) >>> 0), 32); // 53da1a: cmp ecx, dword ptr [0x9cf2dc]
        if (R.zf) { pc = 0x53db2a; continue; } // 53da20: je 0x53db2a
        pc = 0x53da26; continue;
      case 0x53da26:
        R.ebp = (R.m.u32(((0x9cf3e4) | 0) >>> 0)) | 0; // 53da26: mov ebp, dword ptr [0x9cf3e4]
        R.sub((R.ecx >>> 0), (R.ebp >>> 0), 32); // 53da2c: cmp ecx, ebp
        if (R.zf) { pc = 0x53db2a; continue; } // 53da2e: je 0x53db2a
        pc = 0x53da34; continue;
      case 0x53da34:
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 53da34: test esi, esi
        if (R.zf) { pc = 0x53da66; continue; } // 53da36: je 0x53da66
        pc = 0x53da38; continue;
      case 0x53da38:
        R.ecx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 53da38: mov ecx, dword ptr [esi]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 53da3a: cmp ecx, edx
        if (R.zf) { pc = 0x53db2a; continue; } // 53da3c: je 0x53db2a
        pc = 0x53da42; continue;
      case 0x53da42:
        R.sub((R.ecx >>> 0), (R.edi >>> 0), 32); // 53da42: cmp ecx, edi
        if (R.zf) { pc = 0x53db2a; continue; } // 53da44: je 0x53db2a
        pc = 0x53da4a; continue;
      case 0x53da4a:
        R.sub((R.ecx >>> 0), (R.ebx >>> 0), 32); // 53da4a: cmp ecx, ebx
        if (R.zf) { pc = 0x53db2a; continue; } // 53da4c: je 0x53db2a
        pc = 0x53da52; continue;
      case 0x53da52:
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf2dc) | 0) >>> 0), 32); // 53da52: cmp ecx, dword ptr [0x9cf2dc]
        if (R.zf) { pc = 0x53db2a; continue; } // 53da58: je 0x53db2a
        pc = 0x53da5e; continue;
      case 0x53da5e:
        R.sub((R.ecx >>> 0), (R.ebp >>> 0), 32); // 53da5e: cmp ecx, ebp
        if (R.zf) { pc = 0x53db2a; continue; } // 53da60: je 0x53db2a
        pc = 0x53da66; continue;
      case 0x53da66:
        R.ebp = (R.m.u32(((R.esp + 0x28) | 0) >>> 0)) | 0; // 53da66: mov ebp, dword ptr [esp + 0x28]
        pc = 0x53da6a; continue;
      case 0x53da6a:
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 53da6a: test ebp, ebp
        if (R.zf) { pc = 0x53da95; continue; } // 53da6c: je 0x53da95
        pc = 0x53da6e; continue;
      case 0x53da6e:
        R.edx = (R.m.u32(((0x9cf224) | 0) >>> 0)) | 0; // 53da6e: mov edx, dword ptr [0x9cf224]
        R.esi = (R.m.u32(((0x9cf3f4) | 0) >>> 0)) | 0; // 53da74: mov esi, dword ptr [0x9cf3f4]
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 53da7a: cmp eax, edx
        if (R.zf) { pc = 0x53da82; continue; } // 53da7c: je 0x53da82
        pc = 0x53da7e; continue;
      case 0x53da7e:
        R.sub((R.eax >>> 0), (R.esi >>> 0), 32); // 53da7e: cmp eax, esi
        if (!R.zf) { pc = 0x53da95; continue; } // 53da80: jne 0x53da95
        pc = 0x53da82; continue;
      case 0x53da82:
        R.ecx = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 53da82: mov ecx, dword ptr [ebp]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 53da85: cmp ecx, edx
        if (R.zf) { pc = 0x53db2a; continue; } // 53da87: je 0x53db2a
        pc = 0x53da8d; continue;
      case 0x53da8d:
        R.sub((R.ecx >>> 0), (R.esi >>> 0), 32); // 53da8d: cmp ecx, esi
        if (R.zf) { pc = 0x53db2a; continue; } // 53da8f: je 0x53db2a
        pc = 0x53da95; continue;
      case 0x53da95:
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf360) | 0) >>> 0), 32); // 53da95: cmp eax, dword ptr [0x9cf360]
        if (!R.zf) { pc = 0x53daae; continue; } // 53da9b: jne 0x53daae
        pc = 0x53da9d; continue;
      case 0x53da9d:
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 53da9d: test ebp, ebp
        if (R.zf) { pc = 0x53daae; continue; } // 53da9f: je 0x53daae
        pc = 0x53daa1; continue;
      case 0x53daa1:
        R.ecx = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 53daa1: mov ecx, dword ptr [ebp]
        R.edx = (R.m.u32(((0x9cf4f0) | 0) >>> 0)) | 0; // 53daa4: mov edx, dword ptr [0x9cf4f0]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 53daaa: cmp ecx, edx
        if (R.zf) { pc = 0x53db2a; continue; } // 53daac: je 0x53db2a
        pc = 0x53daae; continue;
      case 0x53daae:
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf434) | 0) >>> 0), 32); // 53daae: cmp eax, dword ptr [0x9cf434]
        if (!R.zf) { pc = 0x53db1d; continue; } // 53dab4: jne 0x53db1d
        pc = 0x53dab6; continue;
      case 0x53dab6:
        R.edx = (R.m.u32(((R.esp + 0x24) | 0) >>> 0)) | 0; // 53dab6: mov edx, dword ptr [esp + 0x24]
        R.push(0x0); // 53daba: push 0
        R.push((R.edx >>> 0)); // 53dabc: push edx
        R.call(0x53d740, { n: 2, thisEcx: false, calleeClean: false }); // 53dabd: call 0x53d740
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 53dac2: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 53dac5: test eax, eax
        if (!R.zf) { pc = 0x53db1d; continue; } // 53dac7: jne 0x53db1d
        pc = 0x53dac9; continue;
      case 0x53dac9:
        R.eax = (R.m.u32(((R.esp + 0x24) | 0) >>> 0)) | 0; // 53dac9: mov eax, dword ptr [esp + 0x24]
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 53dacd: mov ecx, dword ptr [0xae1050]
        R.push((R.eax >>> 0)); // 53dad3: push eax
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 53dad4: call 0x4cf5a0
        R.esi = ((R.eax >>> 0)) | 0; // 53dad9: mov esi, eax
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 53dadb: test esi, esi
        if (R.zf) { pc = 0x53db1d; continue; } // 53dadd: je 0x53db1d
        pc = 0x53dadf; continue;
      case 0x53dadf:
        R.push(0xffffffff); // 53dadf: push -1
        R.push(0x7ce); // 53dae1: push 0x7ce
        R.push(0x0); // 53dae6: push 0
        R.push(0x1); // 53dae8: push 1
        R.ecx = (((R.esp + 0x28) | 0)) | 0; // 53daea: lea ecx, [esp + 0x28]
        R.call(0x549f70, { n: 4, thisEcx: true, calleeClean: true }); // 53daee: call 0x549f70
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 53daf3: mov ecx, dword ptr [eax]
        R.edx = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 53daf5: mov edx, dword ptr [eax + 4]
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.esi + 0x27) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 53daf8: mov ax, word ptr [esi + 0x27]
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, (R.ecx >>> 0)); // 53dafc: mov dword ptr [esp + 0x10], ecx
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edx >>> 0)); // 53db00: mov dword ptr [esp + 0x14], edx
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.esp + 0x12) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 53db04: mov dx, word ptr [esp + 0x12]
        R.sub(((R.edx >>> 0) & 0xffff), ((R.eax >>> 0) & 0xffff), 16); // 53db09: cmp dx, ax
        if (!R.cBE) { pc = 0x53db2a; continue; } // 53db0c: ja 0x53db2a
        pc = 0x53db0e; continue;
      case 0x53db0e:
        if (R.cf) { pc = 0x53db1d; continue; } // 53db0e: jb 0x53db1d
        pc = 0x53db10; continue;
      case 0x53db10:
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53db10: xor eax, eax
        R.sub(((R.ecx >>> 0) & 0xffff), R.m.u16(((R.esi + 0x25) | 0) >>> 0), 16); // 53db12: cmp cx, word ptr [esi + 0x25]
        R.eax = ((R.eax & 0xffffff00) | (((!R.cLE ? 1 : 0) & 0xff) << 0)) | 0; // 53db16: setg al
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 53db19: test eax, eax
        if (!R.zf) { pc = 0x53db2a; continue; } // 53db1b: jne 0x53db2a
        pc = 0x53db1d; continue;
      case 0x53db1d:
        R.edi = (R.pop()) | 0; // 53db1d: pop edi
        R.esi = (R.pop()) | 0; // 53db1e: pop esi
        R.ebp = (R.pop()) | 0; // 53db1f: pop ebp
        R.eax = (0x1) | 0; // 53db20: mov eax, 1
        R.ebx = (R.pop()) | 0; // 53db25: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 53db26: add esp, 0x10
        return R.ret(0); // 53db29: ret 
      case 0x53db2a:
        R.edi = (R.pop()) | 0; // 53db2a: pop edi
        R.esi = (R.pop()) | 0; // 53db2b: pop esi
        R.ebp = (R.pop()) | 0; // 53db2c: pop ebp
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53db2d: xor eax, eax
        R.ebx = (R.pop()) | 0; // 53db2f: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 53db30: add esp, 0x10
        return R.ret(0); // 53db33: ret 
      default: throw new Error(`f_53d980: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
