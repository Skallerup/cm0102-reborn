// (hastighed, 28/11) 0x842e10 (kontraktmanagerens tilbud, f_842e10.ts): løkken over de 0x28 pladser à 0x25 byte 0x843063–0x8436de – de
// pladser, løkkens første prøver afviser (+0x24 bit 0, +0 ≠ 0xb, +0x17 ≠ −1, +1 = 0 eller (+1 & [esp+0xc0]) ≠ +1 → 0x8436cf), springes over i
// TS i stedet for instruktion for instruktion (og frem og tilbage mellem f_842e10's stykker). Samme registre, flag og stakceller, som når de
// oversatte instruktioner forlader 0x8436cf: eax = tælleren, esi = næste plads, [esp+0x30] = tælleren, [esp+0x34] = −1, edi/ecx fra den sidste
// plads, der nåede 0x843096, og flagene fra `cmp eax, 0x28`. Den første plads, der ikke afvises, kører de oversatte instruktioner som før.
// Ejerens spil marts 2004: løkken var ~15 % af de oversatte instruktioner. CM_GEN_FAST=0: som oversat.
import { TRACE, type X86 } from './x86';

/** PC_HOOK ved 0x843063: 0 = fortsæt i de oversatte instruktioner (pladsen ved esi), 1 = løkken er slut (videre ved 0x8436e4) */
export function skip842e10Slots(R: X86): number {
  if (TRACE.on) return 0;
  const m = R.m, esp = R.esp >>> 0;
  let esi = R.esi >>> 0, eax = R.eax | 0, c = 0, n = 0;
  for (;;) {
    if (m.u8((esi + 0x24) >>> 0) & 1) { /* 84306e */ }
    else if (m.u8(esi) !== 0xb) { /* 843076 */ }
    else if ((m.u32((esi + 0x17) >>> 0) >>> 0) !== 0xffffffff) { /* 84307f */ }
    else {
      const ax = m.u16((esi + 1) >>> 0) & 0xffff;
      if (ax !== 0) {                                                          // 84308d: test ax, ax
        const edi = m.u32((esp + 0xc0) >>> 0) | 0;                           // 843096: mov edi, [esp + 0xc0]
        const ecx = (((eax & 0xffff0000) | ax) & edi) | 0;                   // 84309d/84309f: mov ecx, eax / and ecx, edi
        if ((ecx & 0xffff) === ax) break;                                    // 8430a1: cmp cx, ax / jne → pladsen bruges
        R.edi = edi; R.ecx = ecx;
      }
    }
    // afvist: 843066 [esp+0x34] = −1; 8436cf–8436de
    m.w32((esp + 0x34) >>> 0, 0xffffffff);
    c = (m.u32((esp + 0x30) >>> 0) + 1) | 0;
    esi = (esi + 0x25) >>> 0;
    m.w32((esp + 0x30) >>> 0, c >>> 0);
    eax = c; n++;
    if (!(c < 0x28)) break;
  }
  if (n === 0) return 0;
  R.esi = esi | 0; R.eax = eax;
  R.sub(c >>> 0, 0x28, 32);                                                  // 8436d7: cmp eax, 0x28 (sætter alle fire flag)
  return c < 0x28 ? 0 : 1;
}
