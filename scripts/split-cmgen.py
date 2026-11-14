#!/usr/bin/env python3
"""Deler de mekanisk oversatte funktioner i src/game/cmGen/f_*.ts op i små stykker, så V8 optimerer dem (14/11-2026).

x86ts.py skriver hver funktion som ÉN `for (;;) switch (pc)` med en case pr. blok. De store (0x83f3a0: 414 blokke, 0x840d80: 261) er over V8's
grænse for optimering (bytekode > 60 KB) og kører fortolket – ~85 µs pr. 0x840d80. Omskrivningen her er rent mekanisk og ændrer ingen
instruktion: blokkene får tætte numre (0, 1, 2 … i adresseorden, så switchen bliver en springtabel), og de deles i stykker à højst LINES linjer,
hver sin funktion `(R, pc) => næste pc` (−1 = retur; værdien i R.rv). Funktionen selv er en lille løkke, der kalder stykket for pc. Alle spring
(`pc = 0x…`, springtabellerne `pc = [0x…][R.eax >>> 0]` og PC_HOOK's adresse) oversættes til numre; TRACE får adressen (AD[pc]).

Funktionen får `f_X.shared = true`, når den bruger ret N (delt processortilstand – cmShortlistGame.ts ensureCmp læste det før af teksten).
Kontrol: scripts/cm-sl-bench.ts før/efter giver samme sha1 for pladser/par/bud/skifter.

Kør efter hver ny generering (gen_all.py):   python3 scripts/split-cmgen.py [filer …]   (uden filer: alle; allerede delte springes over;
SPLIT_LINES = stykkernes størrelse, standard 60)
"""
import re, sys, glob, os

LINES = int(os.environ.get('SPLIT_LINES', '60'))
MARK = '// (delt af scripts/split-cmgen.py)'

def split(path):
    src = open(path).read()
    if MARK in src:
        if '.shared = ' not in src:   # (ældre delte filer uden mærket)
            name = re.search(r'export function (f_[0-9a-f]+)\(', src).group(1)
            open(path, 'w').write(src.rstrip('\n') + f'\n{name}.shared = {"true" if "R.ret(" in src else "false"};\n')
        return False
    lines = src.split('\n')
    fi = next(i for i, l in enumerate(lines) if l.startswith('export function f_'))
    m = re.match(r'export function (f_[0-9a-f]+)\(c: CmCtx, ecx: number, args: number\[\]\): number \{$', lines[fi])
    assert m, path
    name = m.group(1)
    assert lines[fi + 1] == '  const R = enter(c, ecx, args);', path
    me = re.match(r'  let pc = (0x[0-9a-f]+);$', lines[fi + 2]); assert me, path
    assert lines[fi + 3] == '  for (;;) {' and lines[fi + 4] == '    if (TRACE.on) TRACE.f!(pc, R);' and lines[fi + 5] == '    switch (pc) {', path
    di = next(i for i in range(fi, len(lines)) if lines[i].startswith('      default: throw new Error('))
    assert lines[di + 1] == '    }' and lines[di + 2] == '  }' and lines[di + 3] == '}', path
    rest = lines[di + 4:]
    # blokkene
    blocks = []   # (adresse, [linjer])
    for l in lines[fi + 6:di]:
        mc = re.match(r'      case (0x[0-9a-f]+):$', l)
        if mc:
            blocks.append((int(mc.group(1), 16), []))
        else:
            assert blocks, (path, l)
            blocks[-1][1].append(l)
    idx = {a: i for i, (a, _) in enumerate(blocks)}
    assert len(idx) == len(blocks), path
    entry = int(me.group(1), 16)
    assert entry in idx, path
    # stykkerne
    chunks, cur, n = [], [], 0
    for i, (a, body) in enumerate(blocks):
        if cur and n + len(body) + 1 > LINES:
            chunks.append(cur); cur, n = [], 0
        cur.append(i); n += len(body) + 1
    if cur: chunks.append(cur)
    chunk_of = {}
    for k, ch in enumerate(chunks):
        for i in ch: chunk_of[i] = k

    def tgt(h):
        a = int(h, 16)
        return str(idx[a]) if a in idx else '-2'

    def conv(l):
        o = l
        l = re.sub(r'pc = (0x[0-9a-f]+); continue;', lambda mm: f'pc = {tgt(mm.group(1))}; continue;', l)
        l = re.sub(r'pc = \[([0-9a-fx, ]+)\]\[(R\.e[a-z]+ >>> 0)\]; continue;',
                   lambda mm: 'pc = [' + ', '.join(tgt(x.strip()) for x in mm.group(1).split(',')) + f'][{mm.group(2)}] ?? -2; continue;', l)
        l = l.replace('if (np) { pc = np; continue; }', 'if (np) { pc = IX.get(np) ?? -2; continue; }')
        l = re.sub(r'\breturn (R\.ret\([0-9]+\)|R\.st\[0\]|R\.eax);', r'R.rv = \1; return -1;', l)
        code = l.split('//')[0]
        # alt med pc skal være oversat
        for mm in re.finditer(r'\bpc\b', code):
            ok = re.search(r'pc = (-?[0-9]+|\[[-0-9, ]+\]\[R\.e[a-z]+ >>> 0\] \?\? -2|IX\.get\(np\) \?\? -2); continue;', code)
            assert ok, (path, o)
        assert not re.search(r'\breturn\b', code) or 'return -1;' in code, (path, o)
        return l

    out = lines[:fi]
    # importen: type X86
    for i, l in enumerate(out):
        if l.startswith("import { enter, TRACE"):
            out[i] = l.replace("import { enter, TRACE", "import { enter, TRACE, type X86", 1)
            break
    else:
        raise AssertionError(path + ': import')
    out.append(MARK)
    out.append(f'const AD = new Int32Array([{", ".join(hex(a) for a, _ in blocks)}]);')
    if any('IX.get(np)' in conv(l) for _, b in blocks for l in b):
        out.append('const IX = new Map<number, number>(Array.from(AD, (a, i) => [a, i]));')
    out.append(f'const CH = new Uint8Array([{", ".join(str(chunk_of[i]) for i in range(len(blocks)))}]);')
    for k, ch in enumerate(chunks):
        out.append(f'function {name}_{k}(R: X86, pc: number): number {{')
        out.append('  for (;;) {')
        out.append('    if (TRACE.on) TRACE.f!(AD[pc], R);')
        out.append('    switch (pc) {')
        for i in ch:
            a, body = blocks[i]
            out.append(f'      case {i}: // {a:x}')
            body = [conv(l) for l in body]
            out.extend(body)
            last = next((l.split('//')[0].strip() for l in reversed(body) if l.split('//')[0].strip()), '')
            if not (last.endswith('continue;') and last.startswith('pc =')) and not last.startswith('throw ') and not last.endswith('return -1;'):
                out.append(f'        pc = {i + 1}; continue; // (faldt igennem)')
        out.append('      default: return pc;')
        out.append('    }')
        out.append('  }')
        out.append('}')
    assert len(chunks) < 256
    out.append(lines[fi])
    out.append('  const R = enter(c, ecx, args);')
    out.append(f'  let pc = {idx[entry]};')
    out.append('  for (;;) {')
    out.append('    let np: number;')
    out.append(f'    if (pc < 0 || pc >= {len(blocks)}) throw new Error(`{name}: ukendt adresse (spring nr. ${{pc}})`);')
    out.append('    switch (CH[pc]) {')
    for k in range(len(chunks)):
        out.append(f'      case {k}: np = {name}_{k}(R, pc); break;')
    out.append(f'      default: throw new Error(`{name}: ukendt stykke`);')
    out.append('    }')
    out.append('    if (np === -1) return R.rv;')
    out.append(f'    if (CH[np] === CH[pc]) throw new Error(`{name}: ukendt adresse ${{AD[np].toString(16)}}`);')
    out.append('    pc = np;')
    out.append('  }')
    out.append('}')
    # delt processortilstand (ret N) – cmShortlistGame.ts' ensureCmp læste det før af funktionens tekst
    out.append(f'{name}.shared = {"true" if "R.ret(" in src else "false"};')
    out.extend(rest)
    open(path, 'w').write('\n'.join(out))
    return True

files = sys.argv[1:] or sorted(glob.glob(os.path.join(os.path.dirname(__file__), '..', 'src', 'game', 'cmGen', 'f_*.ts')))
n = sum(split(f) for f in files)
print(f'{n} af {len(files)} filer delt')
