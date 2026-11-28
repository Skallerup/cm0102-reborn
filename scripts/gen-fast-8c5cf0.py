# Laver src/game/cmGen/fast_8c5cf0.ts af den oversatte src/game/cmGen/f_8c5cf0.ts (hastighed, 28/11): alle stykker i ét switch, og
# tilbudsløkken 0x8c5d23–0x8c5d34 (case 4–6) i TS. Kør igen, hvis f_8c5cf0.ts genereres igen:  python3 scripts/gen-fast-8c5cf0.py
import re, os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(root, 'src/game/cmGen/f_8c5cf0.ts')).read()
cases = {}
for m in re.finditer(r"      case (\d+): // ([0-9a-f]+)\n(.*?)(?=      case \d+: //|      default: return pc;)", src, re.S):
    n = int(m.group(1))
    body = '\n'.join(l for l in m.group(3).split('\n') if 'TRACE.on' not in l)
    cases[n] = (m.group(2), body)
assert sorted(cases) == list(range(42)), sorted(cases)
# løkken, som oversætteren skrev den (kontrol: ændrer den sig, skal TS-løkken nedenfor ses efter)
assert 'cmp dword ptr [ecx + 0xc], edi' in cases[5][1] and 'inc edx' in cases[6][1] and 'add eax, 4' in cases[6][1] and 'jl 0x8c5d23' in cases[6][1]
assert 'mov ecx, dword ptr [eax]' in cases[4][1] and 'je 0x8c5d40' in cases[5][1] and 'test ecx, ecx' in cases[4][1]
out = []
for n in range(42):
    adr, body = cases[n]
    if n == 4:
        out.append(f"""      case 4: {{ // {adr} – (hastighed) løkken 0x8c5d23–0x8c5d34 i TS: samme registre og flag, som når de oversatte instruktioner forlader den
        const m = R.m, cnt = R.esi | 0, id = R.edi >>> 0;
        let a = R.eax >>> 0, i = R.edx | 0, e = R.ecx | 0;
        for (;;) {{
          e = m.u32(a) | 0;                                                    // mov ecx, [eax]
          if (e !== 0 && (m.u32((e + 0xc) >>> 0) >>> 0) === id) {{               // test ecx, ecx / cmp [ecx + 0xc], edi / je 0x8c5d40
            R.logic(e >>> 0, 32); R.eax = a | 0; R.ecx = e; R.edx = i; R.sub(m.u32((e + 0xc) >>> 0), id, 32); pc = 8; break;
          }}
          i = (i + 1) | 0; a = (a + 4) >>> 0;                                  // inc edx / add eax, 4
          if (!(i < cnt)) {{ R.eax = a | 0; R.ecx = e; R.edx = i; R.sub(i >>> 0, cnt >>> 0, 32); pc = 7; break; }}   // cmp edx, esi / jl
        }}
        continue;
      }}""")
        continue
    if n in (5, 6):
        continue
    out.append(f"      case {n}: // {adr}\n{body.rstrip()}".replace("R.rv = R.ret(3); return -1;", "R.rv = R.ret(3); return R.rv;"))
hdr = '''// (hastighed, 28/11) get_offers_for_player 0x8c5cf0 – de oversatte instruktioner fra f_8c5cf0.ts i ét stykke, og løkken over TRANSFER_MANAGER's
// tilbud (0x8c5d23–0x8c5d34: første tilbud med +0xc = personen) i TS i stedet for instruktion for instruktion. Samme registre, flag, stak og
// hukommelse som f_8c5cf0 (løkken skriver intet; den efterlader eax/ecx/edx og flagene fra den sidste cmp som de oversatte instruktioner).
// Ejerens spil marts 2004 (~600 tilbud): løkken var ~1/5 af dagen (f_8cca10 → 0x8c5cf0 for spillere med et aftalt skifte). CM_GEN_FAST=0: f_8c5cf0.
// Genereret af scripts/gen-fast-8c5cf0.py af f_8c5cf0.ts – ret ikke i hånden.
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE } from './x86';
import { f_8c5cf0 } from './f_8c5cf0';

export function fast_8c5cf0(c: CmCtx, ecx: number, args: number[]): number {
  if (TRACE.on) return f_8c5cf0(c, ecx, args);
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    switch (pc) {
'''
ftr = '''      default: throw new Error(`fast_8c5cf0: ukendt spring nr. ${pc}`);
    }
  }
}
'''
open(os.path.join(root, 'src/game/cmGen/fast_8c5cf0.ts'), 'w').write(hdr + '\n'.join(out) + '\n' + ftr)
