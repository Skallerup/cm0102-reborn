// 0x53dba0 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 5e8290=9, 6005e0=2c, 600740=2tc, 90d130=0, 944c9f=0, 944cff=5t
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';

export function f_53dba0(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0x53dba0;
  for (;;) {
    if (TRACE.on) TRACE.f!(pc, R);
    switch (pc) {
      case 0x53dba0:
        R.esp = (R.sub((R.esp >>> 0), 0x200, 32)) | 0; // 53dba0: sub esp, 0x200
        R.push((R.ebx >>> 0)); // 53dba6: push ebx
        R.push((R.ebp >>> 0)); // 53dba7: push ebp
        R.push((R.esi >>> 0)); // 53dba8: push esi
        R.push((R.edi >>> 0)); // 53dba9: push edi
        R.edi = (R.m.u32(((R.esp + 0x214) | 0) >>> 0)) | 0; // 53dbaa: mov edi, dword ptr [esp + 0x214]
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 53dbb1: test edi, edi
        if (R.zf) { pc = 0x53e0a5; continue; } // 53dbb3: je 0x53e0a5
        pc = 0x53dbb9; continue;
      case 0x53dbb9:
        R.ebx = (R.m.u32(((R.esp + 0x218) | 0) >>> 0)) | 0; // 53dbb9: mov ebx, dword ptr [esp + 0x218]
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 53dbc0: test ebx, ebx
        if (R.zf) { pc = 0x53e0a5; continue; } // 53dbc2: je 0x53e0a5
        pc = 0x53dbc8; continue;
      case 0x53dbc8:
        R.sub(R.m.u16(((R.esp + 0x21c) | 0) >>> 0), 0x69, 16); // 53dbc8: cmp word ptr [esp + 0x21c], 0x69
        if (R.cL) { pc = 0x53e0a5; continue; } // 53dbd1: jl 0x53e0a5
        pc = 0x53dbd7; continue;
      case 0x53dbd7:
        R.ecx = (R.m.u32(((0xb63c98) | 0) >>> 0)) | 0; // 53dbd7: mov ecx, dword ptr [0xb63c98]
        R.ebp = (R.m.u32(((R.edi + 0x4) | 0) >>> 0)) | 0; // 53dbdd: mov ebp, dword ptr [edi + 4]
        R.esi = (R.m.u32(((R.edi + 0x8) | 0) >>> 0)) | 0; // 53dbe0: mov esi, dword ptr [edi + 8]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 53dbe3: test ecx, ecx
        if (R.zf) { pc = 0x53dc05; continue; } // 53dbe5: je 0x53dc05
        pc = 0x53dbe7; continue;
      case 0x53dbe7:
        R.push(0x0); // 53dbe7: push 0
        R.push((R.edi >>> 0)); // 53dbe9: push edi
        R.call(0x600740, { n: 2, thisEcx: true, calleeClean: true }); // 53dbea: call 0x600740
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 53dbef: test eax, eax
        if (R.zf) { pc = 0x53dc05; continue; } // 53dbf1: je 0x53dc05
        pc = 0x53dbf3; continue;
      case 0x53dbf3:
        R.ecx = (R.m.u32(((0xb63c98) | 0) >>> 0)) | 0; // 53dbf3: mov ecx, dword ptr [0xb63c98]
        R.push(0x0); // 53dbf9: push 0
        R.push((R.edi >>> 0)); // 53dbfb: push edi
        R.call(0x6005e0, { n: 2, thisEcx: false, calleeClean: true }); // 53dbfc: call 0x6005e0
        R.edx = ((R.eax >>> 0)) | 0; // 53dc01: mov edx, eax
        pc = 0x53dc08; continue; // 53dc03: jmp 0x53dc08
      case 0x53dc05:
        R.edx = (R.m.u32(((R.edi + 0xc) | 0) >>> 0)) | 0; // 53dc05: mov edx, dword ptr [edi + 0xc]
        pc = 0x53dc08; continue;
      case 0x53dc08:
        R.eax = (R.m.u32(((R.esp + 0x220) | 0) >>> 0)) | 0; // 53dc08: mov eax, dword ptr [esp + 0x220]
        R.m.w8(((R.ebx) | 0) >>> 0, 0x0); // 53dc0f: mov byte ptr [ebx], 0
        R.eax = (R.logic((R.eax >>> 0) & 0xff, 32)) | 0; // 53dc12: and eax, 0xff
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 53dc17: dec eax
        R.sub((R.eax >>> 0), 0x6, 32); // 53dc18: cmp eax, 6
        if (!R.cBE) { pc = 0x53e073; continue; } // 53dc1b: ja 0x53e073
        pc = 0x53dc21; continue;
      case 0x53dc21:
        pc = [0x53dc28, 0x53dc8c, 0x53dd38, 0x53ddf2, 0x53de9c, 0x53dfc5, 0x53df32][R.eax >>> 0]; continue; // 53dc21: jmp dword ptr [eax*4 + 0x53e118]
      case 0x53dc28:
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 53dc28: test edx, edx
        if (R.zf) { pc = 0x53dc3a; continue; } // 53dc2a: je 0x53dc3a
        pc = 0x53dc2c; continue;
      case 0x53dc2c:
        R.edi = ((R.edx >>> 0)) | 0; // 53dc2c: mov edi, edx
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 53dc2e: or ecx, 0xffffffff
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53dc31: xor eax, eax
        R.str('repne scasb'); // 53dc33: repne scasb al, byte ptr es:[edi]
        R.ecx = (~(R.ecx >>> 0)) | 0; // 53dc35: not ecx
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 53dc37: dec ecx
        if (!R.zf) { pc = 0x53dc9e; continue; } // 53dc38: jne 0x53dc9e
        pc = 0x53dc3a; continue;
      case 0x53dc3a:
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 53dc3a: test ebp, ebp
        if (R.zf) { pc = 0x53df58; continue; } // 53dc3c: je 0x53df58
        pc = 0x53dc42; continue;
      case 0x53dc42:
        R.edi = ((R.ebp >>> 0)) | 0; // 53dc42: mov edi, ebp
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 53dc44: or ecx, 0xffffffff
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53dc47: xor eax, eax
        R.str('repne scasb'); // 53dc49: repne scasb al, byte ptr es:[edi]
        R.ecx = (~(R.ecx >>> 0)) | 0; // 53dc4b: not ecx
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 53dc4d: dec ecx
        if (R.zf) { pc = 0x53df58; continue; } // 53dc4e: je 0x53df58
        pc = 0x53dc54; continue;
      case 0x53dc54:
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 53dc54: test esi, esi
        if (R.zf) { pc = 0x53df6e; continue; } // 53dc56: je 0x53df6e
        pc = 0x53dc5c; continue;
      case 0x53dc5c:
        R.edi = ((R.esi >>> 0)) | 0; // 53dc5c: mov edi, esi
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 53dc5e: or ecx, 0xffffffff
        R.str('repne scasb'); // 53dc61: repne scasb al, byte ptr es:[edi]
        R.ecx = (~(R.ecx >>> 0)) | 0; // 53dc63: not ecx
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 53dc65: dec ecx
        if (R.zf) { pc = 0x53df58; continue; } // 53dc66: je 0x53df58
        pc = 0x53dc6c; continue;
      case 0x53dc6c:
        R.push((R.esi >>> 0)); // 53dc6c: push esi
        R.push((R.ebp >>> 0)); // 53dc6d: push ebp
        R.push(0x98f0b8); // 53dc6e: push 0x98f0b8
        R.push((R.ebx >>> 0)); // 53dc73: push ebx
        R.call(0x944c9f, { n: 4, thisEcx: false, calleeClean: false }); // 53dc74: call 0x944c9f
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 53dc79: add esp, 0x10
        R.eax = (0x1) | 0; // 53dc7c: mov eax, 1
        R.edi = (R.pop()) | 0; // 53dc81: pop edi
        R.esi = (R.pop()) | 0; // 53dc82: pop esi
        R.ebp = (R.pop()) | 0; // 53dc83: pop ebp
        R.ebx = (R.pop()) | 0; // 53dc84: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53dc85: add esp, 0x200
        return R.eax; // 53dc8b: ret 
      case 0x53dc8c:
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 53dc8c: test edx, edx
        if (R.zf) { pc = 0x53dccd; continue; } // 53dc8e: je 0x53dccd
        pc = 0x53dc90; continue;
      case 0x53dc90:
        R.edi = ((R.edx >>> 0)) | 0; // 53dc90: mov edi, edx
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 53dc92: or ecx, 0xffffffff
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53dc95: xor eax, eax
        R.str('repne scasb'); // 53dc97: repne scasb al, byte ptr es:[edi]
        R.ecx = (~(R.ecx >>> 0)) | 0; // 53dc99: not ecx
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 53dc9b: dec ecx
        if (R.zf) { pc = 0x53dccd; continue; } // 53dc9c: je 0x53dccd
        pc = 0x53dc9e; continue;
      case 0x53dc9e:
        R.edi = ((R.edx >>> 0)) | 0; // 53dc9e: mov edi, edx
        pc = 0x53dca0; continue;
      case 0x53dca0:
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 53dca0: or ecx, 0xffffffff
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53dca3: xor eax, eax
        R.str('repne scasb'); // 53dca5: repne scasb al, byte ptr es:[edi]
        R.ecx = (~(R.ecx >>> 0)) | 0; // 53dca7: not ecx
        R.edi = (R.sub((R.edi >>> 0), (R.ecx >>> 0), 32)) | 0; // 53dca9: sub edi, ecx
        R.eax = (0x1) | 0; // 53dcab: mov eax, 1
        R.edx = ((R.ecx >>> 0)) | 0; // 53dcb0: mov edx, ecx
        R.esi = ((R.edi >>> 0)) | 0; // 53dcb2: mov esi, edi
        R.edi = ((R.ebx >>> 0)) | 0; // 53dcb4: mov edi, ebx
        R.ecx = (R.shr((R.ecx >>> 0), 0x2, 32)) | 0; // 53dcb6: shr ecx, 2
        R.str('rep movsd'); // 53dcb9: rep movsd dword ptr es:[edi], dword ptr [esi]
        R.ecx = ((R.edx >>> 0)) | 0; // 53dcbb: mov ecx, edx
        R.ecx = (R.logic((R.ecx >>> 0) & 0x3, 32)) | 0; // 53dcbd: and ecx, 3
        R.str('rep movsb'); // 53dcc0: rep movsb byte ptr es:[edi], byte ptr [esi]
        R.edi = (R.pop()) | 0; // 53dcc2: pop edi
        R.esi = (R.pop()) | 0; // 53dcc3: pop esi
        R.ebp = (R.pop()) | 0; // 53dcc4: pop ebp
        R.ebx = (R.pop()) | 0; // 53dcc5: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53dcc6: add esp, 0x200
        return R.eax; // 53dccc: ret 
      case 0x53dccd:
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 53dccd: test ebp, ebp
        if (R.zf) { pc = 0x53dd17; continue; } // 53dccf: je 0x53dd17
        pc = 0x53dcd1; continue;
      case 0x53dcd1:
        R.edi = ((R.ebp >>> 0)) | 0; // 53dcd1: mov edi, ebp
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 53dcd3: or ecx, 0xffffffff
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53dcd6: xor eax, eax
        R.str('repne scasb'); // 53dcd8: repne scasb al, byte ptr es:[edi]
        R.ecx = (~(R.ecx >>> 0)) | 0; // 53dcda: not ecx
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 53dcdc: dec ecx
        if (R.zf) { pc = 0x53dd17; continue; } // 53dcdd: je 0x53dd17
        pc = 0x53dcdf; continue;
      case 0x53dcdf:
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 53dcdf: test esi, esi
        if (R.zf) { pc = 0x53df84; continue; } // 53dce1: je 0x53df84
        pc = 0x53dce7; continue;
      case 0x53dce7:
        R.edi = ((R.esi >>> 0)) | 0; // 53dce7: mov edi, esi
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 53dce9: or ecx, 0xffffffff
        R.str('repne scasb'); // 53dcec: repne scasb al, byte ptr es:[edi]
        R.ecx = (~(R.ecx >>> 0)) | 0; // 53dcee: not ecx
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 53dcf0: dec ecx
        if (R.zf) { pc = 0x53dd17; continue; } // 53dcf1: je 0x53dd17
        pc = 0x53dcf3; continue;
      case 0x53dcf3:
        R.eax = (((R.m.u8(((R.ebp) | 0) >>> 0)) << 24 >> 24)) | 0; // 53dcf3: movsx eax, byte ptr [ebp]
        R.push((R.esi >>> 0)); // 53dcf7: push esi
        R.push((R.eax >>> 0)); // 53dcf8: push eax
        R.push(0x9b7410); // 53dcf9: push 0x9b7410
        R.push((R.ebx >>> 0)); // 53dcfe: push ebx
        R.call(0x944c9f, { n: 4, thisEcx: false, calleeClean: false }); // 53dcff: call 0x944c9f
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 53dd04: add esp, 0x10
        R.eax = (0x1) | 0; // 53dd07: mov eax, 1
        R.edi = (R.pop()) | 0; // 53dd0c: pop edi
        R.esi = (R.pop()) | 0; // 53dd0d: pop esi
        R.ebp = (R.pop()) | 0; // 53dd0e: pop ebp
        R.ebx = (R.pop()) | 0; // 53dd0f: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53dd10: add esp, 0x200
        return R.eax; // 53dd16: ret 
      case 0x53dd17:
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 53dd17: test esi, esi
        if (R.zf) { pc = 0x53df84; continue; } // 53dd19: je 0x53df84
        pc = 0x53dd1f; continue;
      case 0x53dd1f:
        R.edi = ((R.esi >>> 0)) | 0; // 53dd1f: mov edi, esi
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 53dd21: or ecx, 0xffffffff
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53dd24: xor eax, eax
        R.str('repne scasb'); // 53dd26: repne scasb al, byte ptr es:[edi]
        R.ecx = (~(R.ecx >>> 0)) | 0; // 53dd28: not ecx
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 53dd2a: dec ecx
        if (R.zf) { pc = 0x53df84; continue; } // 53dd2b: je 0x53df84
        pc = 0x53dd31; continue;
      case 0x53dd31:
        R.edi = ((R.esi >>> 0)) | 0; // 53dd31: mov edi, esi
        pc = 0x53dca0; continue; // 53dd33: jmp 0x53dca0
      case 0x53dd38:
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 53dd38: test edx, edx
        if (R.zf) { pc = 0x53dd4e; continue; } // 53dd3a: je 0x53dd4e
        pc = 0x53dd3c; continue;
      case 0x53dd3c:
        R.edi = ((R.edx >>> 0)) | 0; // 53dd3c: mov edi, edx
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 53dd3e: or ecx, 0xffffffff
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53dd41: xor eax, eax
        R.str('repne scasb'); // 53dd43: repne scasb al, byte ptr es:[edi]
        R.ecx = (~(R.ecx >>> 0)) | 0; // 53dd45: not ecx
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 53dd47: dec ecx
        if (R.zf) { pc = 0x53dd4e; continue; } // 53dd48: je 0x53dd4e
        pc = 0x53dd4a; continue;
      case 0x53dd4a:
        R.edi = ((R.edx >>> 0)) | 0; // 53dd4a: mov edi, edx
        pc = 0x53ddc5; continue; // 53dd4c: jmp 0x53ddc5
      case 0x53dd4e:
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 53dd4e: test ebp, ebp
        if (R.zf) { pc = 0x53dd90; continue; } // 53dd50: je 0x53dd90
        pc = 0x53dd52; continue;
      case 0x53dd52:
        R.edi = ((R.ebp >>> 0)) | 0; // 53dd52: mov edi, ebp
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 53dd54: or ecx, 0xffffffff
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53dd57: xor eax, eax
        R.str('repne scasb'); // 53dd59: repne scasb al, byte ptr es:[edi]
        R.ecx = (~(R.ecx >>> 0)) | 0; // 53dd5b: not ecx
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 53dd5d: dec ecx
        if (R.zf) { pc = 0x53dd90; continue; } // 53dd5e: je 0x53dd90
        pc = 0x53dd60; continue;
      case 0x53dd60:
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 53dd60: test esi, esi
        if (R.zf) { pc = 0x53dda9; continue; } // 53dd62: je 0x53dda9
        pc = 0x53dd64; continue;
      case 0x53dd64:
        R.edi = ((R.esi >>> 0)) | 0; // 53dd64: mov edi, esi
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 53dd66: or ecx, 0xffffffff
        R.str('repne scasb'); // 53dd69: repne scasb al, byte ptr es:[edi]
        R.ecx = (~(R.ecx >>> 0)) | 0; // 53dd6b: not ecx
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 53dd6d: dec ecx
        if (R.zf) { pc = 0x53dd90; continue; } // 53dd6e: je 0x53dd90
        pc = 0x53dd70; continue;
      case 0x53dd70:
        R.push((R.ebp >>> 0)); // 53dd70: push ebp
        R.push((R.esi >>> 0)); // 53dd71: push esi
        R.push(0x98f6ac); // 53dd72: push 0x98f6ac
        R.push((R.ebx >>> 0)); // 53dd77: push ebx
        R.call(0x944c9f, { n: 4, thisEcx: false, calleeClean: false }); // 53dd78: call 0x944c9f
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 53dd7d: add esp, 0x10
        R.eax = (0x1) | 0; // 53dd80: mov eax, 1
        R.edi = (R.pop()) | 0; // 53dd85: pop edi
        R.esi = (R.pop()) | 0; // 53dd86: pop esi
        R.ebp = (R.pop()) | 0; // 53dd87: pop ebp
        R.ebx = (R.pop()) | 0; // 53dd88: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53dd89: add esp, 0x200
        return R.eax; // 53dd8f: ret 
      case 0x53dd90:
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 53dd90: test esi, esi
        if (R.zf) { pc = 0x53dda9; continue; } // 53dd92: je 0x53dda9
        pc = 0x53dd94; continue;
      case 0x53dd94:
        R.edi = ((R.esi >>> 0)) | 0; // 53dd94: mov edi, esi
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 53dd96: or ecx, 0xffffffff
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53dd99: xor eax, eax
        R.str('repne scasb'); // 53dd9b: repne scasb al, byte ptr es:[edi]
        R.ecx = (~(R.ecx >>> 0)) | 0; // 53dd9d: not ecx
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 53dd9f: dec ecx
        if (R.zf) { pc = 0x53dda9; continue; } // 53dda0: je 0x53dda9
        pc = 0x53dda2; continue;
      case 0x53dda2:
        R.edi = ((R.esi >>> 0)) | 0; // 53dda2: mov edi, esi
        pc = 0x53df98; continue; // 53dda4: jmp 0x53df98
      case 0x53dda9:
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 53dda9: test ebp, ebp
        if (R.zf) { pc = 0x53dfb5; continue; } // 53ddab: je 0x53dfb5
        pc = 0x53ddb1; continue;
      case 0x53ddb1:
        R.edi = ((R.ebp >>> 0)) | 0; // 53ddb1: mov edi, ebp
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 53ddb3: or ecx, 0xffffffff
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53ddb6: xor eax, eax
        R.str('repne scasb'); // 53ddb8: repne scasb al, byte ptr es:[edi]
        R.ecx = (~(R.ecx >>> 0)) | 0; // 53ddba: not ecx
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 53ddbc: dec ecx
        if (R.zf) { pc = 0x53dfb5; continue; } // 53ddbd: je 0x53dfb5
        pc = 0x53ddc3; continue;
      case 0x53ddc3:
        R.edi = ((R.ebp >>> 0)) | 0; // 53ddc3: mov edi, ebp
        pc = 0x53ddc5; continue;
      case 0x53ddc5:
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 53ddc5: or ecx, 0xffffffff
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53ddc8: xor eax, eax
        R.str('repne scasb'); // 53ddca: repne scasb al, byte ptr es:[edi]
        R.ecx = (~(R.ecx >>> 0)) | 0; // 53ddcc: not ecx
        R.edi = (R.sub((R.edi >>> 0), (R.ecx >>> 0), 32)) | 0; // 53ddce: sub edi, ecx
        R.eax = (0x1) | 0; // 53ddd0: mov eax, 1
        R.edx = ((R.ecx >>> 0)) | 0; // 53ddd5: mov edx, ecx
        R.esi = ((R.edi >>> 0)) | 0; // 53ddd7: mov esi, edi
        R.edi = ((R.ebx >>> 0)) | 0; // 53ddd9: mov edi, ebx
        R.ecx = (R.shr((R.ecx >>> 0), 0x2, 32)) | 0; // 53dddb: shr ecx, 2
        R.str('rep movsd'); // 53ddde: rep movsd dword ptr es:[edi], dword ptr [esi]
        R.ecx = ((R.edx >>> 0)) | 0; // 53dde0: mov ecx, edx
        R.ecx = (R.logic((R.ecx >>> 0) & 0x3, 32)) | 0; // 53dde2: and ecx, 3
        R.str('rep movsb'); // 53dde5: rep movsb byte ptr es:[edi], byte ptr [esi]
        R.edi = (R.pop()) | 0; // 53dde7: pop edi
        R.esi = (R.pop()) | 0; // 53dde8: pop esi
        R.ebp = (R.pop()) | 0; // 53dde9: pop ebp
        R.ebx = (R.pop()) | 0; // 53ddea: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53ddeb: add esp, 0x200
        return R.eax; // 53ddf1: ret 
      case 0x53ddf2:
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 53ddf2: test edx, edx
        if (R.zf) { pc = 0x53de0b; continue; } // 53ddf4: je 0x53de0b
        pc = 0x53ddf6; continue;
      case 0x53ddf6:
        R.edi = ((R.edx >>> 0)) | 0; // 53ddf6: mov edi, edx
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 53ddf8: or ecx, 0xffffffff
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53ddfb: xor eax, eax
        R.str('repne scasb'); // 53ddfd: repne scasb al, byte ptr es:[edi]
        R.ecx = (~(R.ecx >>> 0)) | 0; // 53ddff: not ecx
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 53de01: dec ecx
        if (R.zf) { pc = 0x53de0b; continue; } // 53de02: je 0x53de0b
        pc = 0x53de04; continue;
      case 0x53de04:
        R.edi = ((R.edx >>> 0)) | 0; // 53de04: mov edi, edx
        pc = 0x53df98; continue; // 53de06: jmp 0x53df98
      case 0x53de0b:
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 53de0b: test ebp, ebp
        if (R.zf) { pc = 0x53de55; continue; } // 53de0d: je 0x53de55
        pc = 0x53de0f; continue;
      case 0x53de0f:
        R.edi = ((R.ebp >>> 0)) | 0; // 53de0f: mov edi, ebp
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 53de11: or ecx, 0xffffffff
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53de14: xor eax, eax
        R.str('repne scasb'); // 53de16: repne scasb al, byte ptr es:[edi]
        R.ecx = (~(R.ecx >>> 0)) | 0; // 53de18: not ecx
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 53de1a: dec ecx
        if (R.zf) { pc = 0x53de55; continue; } // 53de1b: je 0x53de55
        pc = 0x53de1d; continue;
      case 0x53de1d:
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 53de1d: test esi, esi
        if (R.zf) { pc = 0x53df84; continue; } // 53de1f: je 0x53df84
        pc = 0x53de25; continue;
      case 0x53de25:
        R.edi = ((R.esi >>> 0)) | 0; // 53de25: mov edi, esi
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 53de27: or ecx, 0xffffffff
        R.str('repne scasb'); // 53de2a: repne scasb al, byte ptr es:[edi]
        R.ecx = (~(R.ecx >>> 0)) | 0; // 53de2c: not ecx
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 53de2e: dec ecx
        if (R.zf) { pc = 0x53de55; continue; } // 53de2f: je 0x53de55
        pc = 0x53de31; continue;
      case 0x53de31:
        R.ecx = (((R.m.u8(((R.ebp) | 0) >>> 0)) << 24 >> 24)) | 0; // 53de31: movsx ecx, byte ptr [ebp]
        R.push((R.ecx >>> 0)); // 53de35: push ecx
        R.push((R.esi >>> 0)); // 53de36: push esi
        R.push(0x9b7408); // 53de37: push 0x9b7408
        R.push((R.ebx >>> 0)); // 53de3c: push ebx
        R.call(0x944c9f, { n: 4, thisEcx: false, calleeClean: false }); // 53de3d: call 0x944c9f
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 53de42: add esp, 0x10
        R.eax = (0x1) | 0; // 53de45: mov eax, 1
        R.edi = (R.pop()) | 0; // 53de4a: pop edi
        R.esi = (R.pop()) | 0; // 53de4b: pop esi
        R.ebp = (R.pop()) | 0; // 53de4c: pop ebp
        R.ebx = (R.pop()) | 0; // 53de4d: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53de4e: add esp, 0x200
        return R.eax; // 53de54: ret 
      case 0x53de55:
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 53de55: test esi, esi
        if (R.zf) { pc = 0x53df84; continue; } // 53de57: je 0x53df84
        pc = 0x53de5d; continue;
      case 0x53de5d:
        R.edi = ((R.esi >>> 0)) | 0; // 53de5d: mov edi, esi
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 53de5f: or ecx, 0xffffffff
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53de62: xor eax, eax
        R.str('repne scasb'); // 53de64: repne scasb al, byte ptr es:[edi]
        R.ecx = (~(R.ecx >>> 0)) | 0; // 53de66: not ecx
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 53de68: dec ecx
        if (R.zf) { pc = 0x53df84; continue; } // 53de69: je 0x53df84
        pc = 0x53de6f; continue;
      case 0x53de6f:
        R.edi = ((R.esi >>> 0)) | 0; // 53de6f: mov edi, esi
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 53de71: or ecx, 0xffffffff
        R.str('repne scasb'); // 53de74: repne scasb al, byte ptr es:[edi]
        R.ecx = (~(R.ecx >>> 0)) | 0; // 53de76: not ecx
        R.edi = (R.sub((R.edi >>> 0), (R.ecx >>> 0), 32)) | 0; // 53de78: sub edi, ecx
        R.eax = (0x1) | 0; // 53de7a: mov eax, 1
        R.edx = ((R.ecx >>> 0)) | 0; // 53de7f: mov edx, ecx
        R.esi = ((R.edi >>> 0)) | 0; // 53de81: mov esi, edi
        R.edi = ((R.ebx >>> 0)) | 0; // 53de83: mov edi, ebx
        R.ecx = (R.shr((R.ecx >>> 0), 0x2, 32)) | 0; // 53de85: shr ecx, 2
        R.str('rep movsd'); // 53de88: rep movsd dword ptr es:[edi], dword ptr [esi]
        R.ecx = ((R.edx >>> 0)) | 0; // 53de8a: mov ecx, edx
        R.ecx = (R.logic((R.ecx >>> 0) & 0x3, 32)) | 0; // 53de8c: and ecx, 3
        R.str('rep movsb'); // 53de8f: rep movsb byte ptr es:[edi], byte ptr [esi]
        R.edi = (R.pop()) | 0; // 53de91: pop edi
        R.esi = (R.pop()) | 0; // 53de92: pop esi
        R.ebp = (R.pop()) | 0; // 53de93: pop ebp
        R.ebx = (R.pop()) | 0; // 53de94: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53de95: add esp, 0x200
        return R.eax; // 53de9b: ret 
      case 0x53de9c:
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 53de9c: test edx, edx
        if (R.zf) { pc = 0x53deb2; continue; } // 53de9e: je 0x53deb2
        pc = 0x53dea0; continue;
      case 0x53dea0:
        R.edi = ((R.edx >>> 0)) | 0; // 53dea0: mov edi, edx
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 53dea2: or ecx, 0xffffffff
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53dea5: xor eax, eax
        R.str('repne scasb'); // 53dea7: repne scasb al, byte ptr es:[edi]
        R.ecx = (~(R.ecx >>> 0)) | 0; // 53dea9: not ecx
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 53deab: dec ecx
        if (R.zf) { pc = 0x53deb2; continue; } // 53deac: je 0x53deb2
        pc = 0x53deae; continue;
      case 0x53deae:
        R.edi = ((R.edx >>> 0)) | 0; // 53deae: mov edi, edx
        pc = 0x53df05; continue; // 53deb0: jmp 0x53df05
      case 0x53deb2:
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 53deb2: test esi, esi
        if (R.zf) { pc = 0x53def1; continue; } // 53deb4: je 0x53def1
        pc = 0x53deb6; continue;
      case 0x53deb6:
        R.edi = ((R.esi >>> 0)) | 0; // 53deb6: mov edi, esi
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 53deb8: or ecx, 0xffffffff
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53debb: xor eax, eax
        R.str('repne scasb'); // 53debd: repne scasb al, byte ptr es:[edi]
        R.ecx = (~(R.ecx >>> 0)) | 0; // 53debf: not ecx
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 53dec1: dec ecx
        if (R.zf) { pc = 0x53def1; continue; } // 53dec2: je 0x53def1
        pc = 0x53dec4; continue;
      case 0x53dec4:
        R.edi = ((R.esi >>> 0)) | 0; // 53dec4: mov edi, esi
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 53dec6: or ecx, 0xffffffff
        R.str('repne scasb'); // 53dec9: repne scasb al, byte ptr es:[edi]
        R.ecx = (~(R.ecx >>> 0)) | 0; // 53decb: not ecx
        R.edi = (R.sub((R.edi >>> 0), (R.ecx >>> 0), 32)) | 0; // 53decd: sub edi, ecx
        R.eax = ((R.ecx >>> 0)) | 0; // 53decf: mov eax, ecx
        R.esi = ((R.edi >>> 0)) | 0; // 53ded1: mov esi, edi
        R.edi = ((R.ebx >>> 0)) | 0; // 53ded3: mov edi, ebx
        R.ecx = (R.shr((R.ecx >>> 0), 0x2, 32)) | 0; // 53ded5: shr ecx, 2
        R.str('rep movsd'); // 53ded8: rep movsd dword ptr es:[edi], dword ptr [esi]
        R.ecx = ((R.eax >>> 0)) | 0; // 53deda: mov ecx, eax
        R.eax = (0x1) | 0; // 53dedc: mov eax, 1
        R.ecx = (R.logic((R.ecx >>> 0) & 0x3, 32)) | 0; // 53dee1: and ecx, 3
        R.str('rep movsb'); // 53dee4: rep movsb byte ptr es:[edi], byte ptr [esi]
        R.edi = (R.pop()) | 0; // 53dee6: pop edi
        R.esi = (R.pop()) | 0; // 53dee7: pop esi
        R.ebp = (R.pop()) | 0; // 53dee8: pop ebp
        R.ebx = (R.pop()) | 0; // 53dee9: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53deea: add esp, 0x200
        return R.eax; // 53def0: ret 
      case 0x53def1:
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 53def1: test ebp, ebp
        if (R.zf) { pc = 0x53df22; continue; } // 53def3: je 0x53df22
        pc = 0x53def5; continue;
      case 0x53def5:
        R.edi = ((R.ebp >>> 0)) | 0; // 53def5: mov edi, ebp
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 53def7: or ecx, 0xffffffff
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53defa: xor eax, eax
        R.str('repne scasb'); // 53defc: repne scasb al, byte ptr es:[edi]
        R.ecx = (~(R.ecx >>> 0)) | 0; // 53defe: not ecx
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 53df00: dec ecx
        if (R.zf) { pc = 0x53df22; continue; } // 53df01: je 0x53df22
        pc = 0x53df03; continue;
      case 0x53df03:
        R.edi = ((R.ebp >>> 0)) | 0; // 53df03: mov edi, ebp
        pc = 0x53df05; continue;
      case 0x53df05:
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 53df05: or ecx, 0xffffffff
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53df08: xor eax, eax
        R.str('repne scasb'); // 53df0a: repne scasb al, byte ptr es:[edi]
        R.ecx = (~(R.ecx >>> 0)) | 0; // 53df0c: not ecx
        R.edi = (R.sub((R.edi >>> 0), (R.ecx >>> 0), 32)) | 0; // 53df0e: sub edi, ecx
        R.edx = ((R.ecx >>> 0)) | 0; // 53df10: mov edx, ecx
        R.esi = ((R.edi >>> 0)) | 0; // 53df12: mov esi, edi
        R.edi = ((R.ebx >>> 0)) | 0; // 53df14: mov edi, ebx
        R.ecx = (R.shr((R.ecx >>> 0), 0x2, 32)) | 0; // 53df16: shr ecx, 2
        R.str('rep movsd'); // 53df19: rep movsd dword ptr es:[edi], dword ptr [esi]
        R.ecx = ((R.edx >>> 0)) | 0; // 53df1b: mov ecx, edx
        R.ecx = (R.logic((R.ecx >>> 0) & 0x3, 32)) | 0; // 53df1d: and ecx, 3
        R.str('rep movsb'); // 53df20: rep movsb byte ptr es:[edi], byte ptr [esi]
        pc = 0x53df22; continue;
      case 0x53df22:
        R.edi = (R.pop()) | 0; // 53df22: pop edi
        R.esi = (R.pop()) | 0; // 53df23: pop esi
        R.ebp = (R.pop()) | 0; // 53df24: pop ebp
        R.eax = (0x1) | 0; // 53df25: mov eax, 1
        R.ebx = (R.pop()) | 0; // 53df2a: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53df2b: add esp, 0x200
        return R.eax; // 53df31: ret 
      case 0x53df32:
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 53df32: test ebp, ebp
        if (R.zf) { pc = 0x53df58; continue; } // 53df34: je 0x53df58
        pc = 0x53df36; continue;
      case 0x53df36:
        R.edi = ((R.ebp >>> 0)) | 0; // 53df36: mov edi, ebp
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 53df38: or ecx, 0xffffffff
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53df3b: xor eax, eax
        R.str('repne scasb'); // 53df3d: repne scasb al, byte ptr es:[edi]
        R.ecx = (~(R.ecx >>> 0)) | 0; // 53df3f: not ecx
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 53df41: dec ecx
        if (R.zf) { pc = 0x53df58; continue; } // 53df42: je 0x53df58
        pc = 0x53df44; continue;
      case 0x53df44:
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 53df44: test esi, esi
        if (R.zf) { pc = 0x53df6e; continue; } // 53df46: je 0x53df6e
        pc = 0x53df48; continue;
      case 0x53df48:
        R.edi = ((R.esi >>> 0)) | 0; // 53df48: mov edi, esi
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 53df4a: or ecx, 0xffffffff
        R.str('repne scasb'); // 53df4d: repne scasb al, byte ptr es:[edi]
        R.ecx = (~(R.ecx >>> 0)) | 0; // 53df4f: not ecx
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 53df51: dec ecx
        if (!R.zf) { pc = 0x53dc6c; continue; } // 53df52: jne 0x53dc6c
        pc = 0x53df58; continue;
      case 0x53df58:
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 53df58: test esi, esi
        if (R.zf) { pc = 0x53df6e; continue; } // 53df5a: je 0x53df6e
        pc = 0x53df5c; continue;
      case 0x53df5c:
        R.edi = ((R.esi >>> 0)) | 0; // 53df5c: mov edi, esi
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 53df5e: or ecx, 0xffffffff
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53df61: xor eax, eax
        R.str('repne scasb'); // 53df63: repne scasb al, byte ptr es:[edi]
        R.ecx = (~(R.ecx >>> 0)) | 0; // 53df65: not ecx
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 53df67: dec ecx
        if (R.zf) { pc = 0x53df6e; continue; } // 53df68: je 0x53df6e
        pc = 0x53df6a; continue;
      case 0x53df6a:
        R.edi = ((R.esi >>> 0)) | 0; // 53df6a: mov edi, esi
        pc = 0x53df98; continue; // 53df6c: jmp 0x53df98
      case 0x53df6e:
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 53df6e: test edx, edx
        if (R.zf) { pc = 0x53df84; continue; } // 53df70: je 0x53df84
        pc = 0x53df72; continue;
      case 0x53df72:
        R.edi = ((R.edx >>> 0)) | 0; // 53df72: mov edi, edx
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 53df74: or ecx, 0xffffffff
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53df77: xor eax, eax
        R.str('repne scasb'); // 53df79: repne scasb al, byte ptr es:[edi]
        R.ecx = (~(R.ecx >>> 0)) | 0; // 53df7b: not ecx
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 53df7d: dec ecx
        if (!R.zf) { pc = 0x53dc9e; continue; } // 53df7e: jne 0x53dc9e
        pc = 0x53df84; continue;
      case 0x53df84:
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 53df84: test ebp, ebp
        if (R.zf) { pc = 0x53dfb5; continue; } // 53df86: je 0x53dfb5
        pc = 0x53df88; continue;
      case 0x53df88:
        R.edi = ((R.ebp >>> 0)) | 0; // 53df88: mov edi, ebp
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 53df8a: or ecx, 0xffffffff
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53df8d: xor eax, eax
        R.str('repne scasb'); // 53df8f: repne scasb al, byte ptr es:[edi]
        R.ecx = (~(R.ecx >>> 0)) | 0; // 53df91: not ecx
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 53df93: dec ecx
        if (R.zf) { pc = 0x53dfb5; continue; } // 53df94: je 0x53dfb5
        pc = 0x53df96; continue;
      case 0x53df96:
        R.edi = ((R.ebp >>> 0)) | 0; // 53df96: mov edi, ebp
        pc = 0x53df98; continue;
      case 0x53df98:
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 53df98: or ecx, 0xffffffff
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53df9b: xor eax, eax
        R.str('repne scasb'); // 53df9d: repne scasb al, byte ptr es:[edi]
        R.ecx = (~(R.ecx >>> 0)) | 0; // 53df9f: not ecx
        R.edi = (R.sub((R.edi >>> 0), (R.ecx >>> 0), 32)) | 0; // 53dfa1: sub edi, ecx
        R.eax = ((R.ecx >>> 0)) | 0; // 53dfa3: mov eax, ecx
        R.esi = ((R.edi >>> 0)) | 0; // 53dfa5: mov esi, edi
        R.edi = ((R.ebx >>> 0)) | 0; // 53dfa7: mov edi, ebx
        R.ecx = (R.shr((R.ecx >>> 0), 0x2, 32)) | 0; // 53dfa9: shr ecx, 2
        R.str('rep movsd'); // 53dfac: rep movsd dword ptr es:[edi], dword ptr [esi]
        R.ecx = ((R.eax >>> 0)) | 0; // 53dfae: mov ecx, eax
        R.ecx = (R.logic((R.ecx >>> 0) & 0x3, 32)) | 0; // 53dfb0: and ecx, 3
        R.str('rep movsb'); // 53dfb3: rep movsb byte ptr es:[edi], byte ptr [esi]
        pc = 0x53dfb5; continue;
      case 0x53dfb5:
        R.edi = (R.pop()) | 0; // 53dfb5: pop edi
        R.esi = (R.pop()) | 0; // 53dfb6: pop esi
        R.ebp = (R.pop()) | 0; // 53dfb7: pop ebp
        R.eax = (0x1) | 0; // 53dfb8: mov eax, 1
        R.ebx = (R.pop()) | 0; // 53dfbd: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53dfbe: add esp, 0x200
        return R.eax; // 53dfc4: ret 
      case 0x53dfc5:
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 53dfc5: test edx, edx
        if (R.zf) { pc = 0x53dfdd; continue; } // 53dfc7: je 0x53dfdd
        pc = 0x53dfc9; continue;
      case 0x53dfc9:
        R.edi = ((R.edx >>> 0)) | 0; // 53dfc9: mov edi, edx
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 53dfcb: or ecx, 0xffffffff
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53dfce: xor eax, eax
        R.str('repne scasb'); // 53dfd0: repne scasb al, byte ptr es:[edi]
        R.ecx = (~(R.ecx >>> 0)) | 0; // 53dfd2: not ecx
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 53dfd4: dec ecx
        if (R.zf) { pc = 0x53dfdd; continue; } // 53dfd5: je 0x53dfdd
        pc = 0x53dfd7; continue;
      case 0x53dfd7:
        R.ecx = (((R.m.u8(((R.edx) | 0) >>> 0)) << 24 >> 24)) | 0; // 53dfd7: movsx ecx, byte ptr [edx]
        R.push((R.ecx >>> 0)); // 53dfda: push ecx
        pc = 0x53e055; continue; // 53dfdb: jmp 0x53e055
      case 0x53dfdd:
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 53dfdd: test ebp, ebp
        if (R.zf) { pc = 0x53e026; continue; } // 53dfdf: je 0x53e026
        pc = 0x53dfe1; continue;
      case 0x53dfe1:
        R.edi = ((R.ebp >>> 0)) | 0; // 53dfe1: mov edi, ebp
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 53dfe3: or ecx, 0xffffffff
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53dfe6: xor eax, eax
        R.str('repne scasb'); // 53dfe8: repne scasb al, byte ptr es:[edi]
        R.ecx = (~(R.ecx >>> 0)) | 0; // 53dfea: not ecx
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 53dfec: dec ecx
        if (R.zf) { pc = 0x53e026; continue; } // 53dfed: je 0x53e026
        pc = 0x53dfef; continue;
      case 0x53dfef:
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 53dfef: test esi, esi
        if (R.zf) { pc = 0x53e03e; continue; } // 53dff1: je 0x53e03e
        pc = 0x53dff3; continue;
      case 0x53dff3:
        R.edi = ((R.esi >>> 0)) | 0; // 53dff3: mov edi, esi
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 53dff5: or ecx, 0xffffffff
        R.str('repne scasb'); // 53dff8: repne scasb al, byte ptr es:[edi]
        R.ecx = (~(R.ecx >>> 0)) | 0; // 53dffa: not ecx
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 53dffc: dec ecx
        if (R.zf) { pc = 0x53e026; continue; } // 53dffd: je 0x53e026
        pc = 0x53dfff; continue;
      case 0x53dfff:
        R.edx = (((R.m.u8(((R.esi) | 0) >>> 0)) << 24 >> 24)) | 0; // 53dfff: movsx edx, byte ptr [esi]
        R.eax = (((R.m.u8(((R.ebp) | 0) >>> 0)) << 24 >> 24)) | 0; // 53e002: movsx eax, byte ptr [ebp]
        R.push((R.edx >>> 0)); // 53e006: push edx
        R.push((R.eax >>> 0)); // 53e007: push eax
        R.push(0x9b7400); // 53e008: push 0x9b7400
        R.push((R.ebx >>> 0)); // 53e00d: push ebx
        R.call(0x944c9f, { n: 4, thisEcx: false, calleeClean: false }); // 53e00e: call 0x944c9f
        R.esp = (R.add((R.esp >>> 0), 0x10, 32)) | 0; // 53e013: add esp, 0x10
        R.eax = (0x1) | 0; // 53e016: mov eax, 1
        R.edi = (R.pop()) | 0; // 53e01b: pop edi
        R.esi = (R.pop()) | 0; // 53e01c: pop esi
        R.ebp = (R.pop()) | 0; // 53e01d: pop ebp
        R.ebx = (R.pop()) | 0; // 53e01e: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53e01f: add esp, 0x200
        return R.eax; // 53e025: ret 
      case 0x53e026:
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 53e026: test esi, esi
        if (R.zf) { pc = 0x53e03e; continue; } // 53e028: je 0x53e03e
        pc = 0x53e02a; continue;
      case 0x53e02a:
        R.edi = ((R.esi >>> 0)) | 0; // 53e02a: mov edi, esi
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 53e02c: or ecx, 0xffffffff
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53e02f: xor eax, eax
        R.str('repne scasb'); // 53e031: repne scasb al, byte ptr es:[edi]
        R.ecx = (~(R.ecx >>> 0)) | 0; // 53e033: not ecx
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 53e035: dec ecx
        if (R.zf) { pc = 0x53e03e; continue; } // 53e036: je 0x53e03e
        pc = 0x53e038; continue;
      case 0x53e038:
        R.ecx = (((R.m.u8(((R.esi) | 0) >>> 0)) << 24 >> 24)) | 0; // 53e038: movsx ecx, byte ptr [esi]
        R.push((R.ecx >>> 0)); // 53e03b: push ecx
        pc = 0x53e055; continue; // 53e03c: jmp 0x53e055
      case 0x53e03e:
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 53e03e: test ebp, ebp
        if (R.zf) { pc = 0x53e063; continue; } // 53e040: je 0x53e063
        pc = 0x53e042; continue;
      case 0x53e042:
        R.edi = ((R.ebp >>> 0)) | 0; // 53e042: mov edi, ebp
        R.ecx = (R.logic((R.ecx >>> 0) | 0xffffffff, 32)) | 0; // 53e044: or ecx, 0xffffffff
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53e047: xor eax, eax
        R.str('repne scasb'); // 53e049: repne scasb al, byte ptr es:[edi]
        R.ecx = (~(R.ecx >>> 0)) | 0; // 53e04b: not ecx
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 53e04d: dec ecx
        if (R.zf) { pc = 0x53e063; continue; } // 53e04e: je 0x53e063
        pc = 0x53e050; continue;
      case 0x53e050:
        R.edx = (((R.m.u8(((R.ebp) | 0) >>> 0)) << 24 >> 24)) | 0; // 53e050: movsx edx, byte ptr [ebp]
        R.push((R.edx >>> 0)); // 53e054: push edx
        pc = 0x53e055; continue;
      case 0x53e055:
        R.push(0x99ec1c); // 53e055: push 0x99ec1c
        R.push((R.ebx >>> 0)); // 53e05a: push ebx
        R.call(0x944c9f, { n: 3, thisEcx: false, calleeClean: false }); // 53e05b: call 0x944c9f
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 53e060: add esp, 0xc
        pc = 0x53e063; continue;
      case 0x53e063:
        R.edi = (R.pop()) | 0; // 53e063: pop edi
        R.esi = (R.pop()) | 0; // 53e064: pop esi
        R.ebp = (R.pop()) | 0; // 53e065: pop ebp
        R.eax = (0x1) | 0; // 53e066: mov eax, 1
        R.ebx = (R.pop()) | 0; // 53e06b: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53e06c: add esp, 0x200
        return R.eax; // 53e072: ret 
      case 0x53e073:
        R.eax = (((R.esp + 0x10) | 0)) | 0; // 53e073: lea eax, [esp + 0x10]
        R.ecx = (((R.esp + 0x110) | 0)) | 0; // 53e077: lea ecx, [esp + 0x110]
        R.push((R.eax >>> 0)); // 53e07e: push eax
        R.push((R.ecx >>> 0)); // 53e07f: push ecx
        R.push(0x0); // 53e080: push 0
        R.push(0x0); // 53e082: push 0
        R.push(0x9b5ac8); // 53e084: push 0x9b5ac8
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 53e089: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 53e08e: add esp, 0x14
        R.edx = (((R.esp + 0x10) | 0)) | 0; // 53e091: lea edx, [esp + 0x10]
        R.eax = (((R.esp + 0x110) | 0)) | 0; // 53e095: lea eax, [esp + 0x110]
        R.push(0x3cb9); // 53e09c: push 0x3cb9
        R.push((R.edx >>> 0)); // 53e0a1: push edx
        R.push((R.eax >>> 0)); // 53e0a2: push eax
        pc = 0x53e0d5; continue; // 53e0a3: jmp 0x53e0d5
      case 0x53e0a5:
        R.ecx = (((R.esp + 0x110) | 0)) | 0; // 53e0a5: lea ecx, [esp + 0x110]
        R.edx = (((R.esp + 0x10) | 0)) | 0; // 53e0ac: lea edx, [esp + 0x10]
        R.push((R.ecx >>> 0)); // 53e0b0: push ecx
        R.push((R.edx >>> 0)); // 53e0b1: push edx
        R.push(0x0); // 53e0b2: push 0
        R.push(0x0); // 53e0b4: push 0
        R.push(0x9b5ac8); // 53e0b6: push 0x9b5ac8
        R.call(0x944cff, { n: 5, thisEcx: true, calleeClean: false }); // 53e0bb: call 0x944cff
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 53e0c0: add esp, 0x14
        R.eax = (((R.esp + 0x110) | 0)) | 0; // 53e0c3: lea eax, [esp + 0x110]
        R.ecx = (((R.esp + 0x10) | 0)) | 0; // 53e0ca: lea ecx, [esp + 0x10]
        R.push(0x3c3e); // 53e0ce: push 0x3c3e
        R.push((R.eax >>> 0)); // 53e0d3: push eax
        R.push((R.ecx >>> 0)); // 53e0d4: push ecx
        pc = 0x53e0d5; continue;
      case 0x53e0d5:
        R.call(0x90d130, { n: 0, thisEcx: false, calleeClean: false }); // 53e0d5: call 0x90d130
        R.push((R.eax >>> 0)); // 53e0da: push eax
        R.push(0x9870e8); // 53e0db: push 0x9870e8
        R.push(0xae24d0); // 53e0e0: push 0xae24d0
        R.call(0x944c9f, { n: 0, thisEcx: false, calleeClean: false }); // 53e0e5: call 0x944c9f
        R.push(0x0); // 53e0ea: push 0
        R.push(0xae24d0); // 53e0ec: push 0xae24d0
        R.push(0x9870e0); // 53e0f1: push 0x9870e0
        R.call(0x5e8290, { n: 9, thisEcx: false, calleeClean: false }); // 53e0f6: call 0x5e8290
        R.esp = (R.add((R.esp >>> 0), 0x24, 32)) | 0; // 53e0fb: add esp, 0x24
        R.m.w32(((0xb67a34) | 0) >>> 0, 0x0); // 53e0fe: mov dword ptr [0xb67a34], 0
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 53e108: xor eax, eax
        R.edi = (R.pop()) | 0; // 53e10a: pop edi
        R.esi = (R.pop()) | 0; // 53e10b: pop esi
        R.ebp = (R.pop()) | 0; // 53e10c: pop ebp
        R.ebx = (R.pop()) | 0; // 53e10d: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x200, 32)) | 0; // 53e10e: add esp, 0x200
        return R.eax; // 53e114: ret 
      default: throw new Error(`f_53dba0: ukendt adresse ${pc.toString(16)}`);
    }
  }
}
