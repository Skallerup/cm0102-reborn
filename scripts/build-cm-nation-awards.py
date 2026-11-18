#!/usr/bin/env python3
"""build-cm-nation-awards.py [out.json]

Landenes priser (award/*_awards.cpp i cm0102.exe 3.9.68) til src/game/data/cmNationAwards.json – læst direkte af exe'ens kode
(kræver ~/cm0102-engine: cm0102.exe, tools/cmdis.py, .bosman-repo's functions.txt og key_ids_table.c, samt capstone).

AWARD_MANAGER 0x4135b0 laver et NationAwards-objekt pr. land, kun når landet er indlæst (nation +0x11c ≠ 0). For hvert land læses
  vtbl[0] init:   konstruktørerne YEAR_AWARD 0x92fe80, TEAM_AWARD 0x8af520, MONTH_AWARD 0x766e10 (navn = staff_comp-nøglen, omdømmetal a3/a4,
                  turnering, spiller/manager, layout/måneder),
  vtbl[1] daily:  Date-tjekkene 0x549f70(dag, måned 0–11, år, ugedag) og kaldene under hvert,
  vtbl[3] måned:  on_month_change (månedens manager 0x86f950 + 0x7671c0, månedens spiller 0x767150 / 0x768130 + 0x7671c0),
  vtbl[4] uge:    hvilke priser der er Team of the Week (0x769c70).
Prisernes antal uden nation +0x11c & 4 (England 26, Italien 25 – de ekstra divisioner findes ikke i spillet) skæres til.
"""
import json, os, re, struct, sys, bisect

ENG = os.path.expanduser('~/cm0102-engine')
sys.path.insert(0, os.path.join(ENG, 'tools'))
from cmdis import rd, d, secs  # noqa: E402
import capstone  # noqa: E402

FUN = os.path.join(ENG, '.bosman-repo/tools/recomp/functions.txt')
KEYS = os.path.join(ENG, '.bosman-repo/src/cm3/key_ids_table.c')
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '../src/game/data/cmNationAwards.json')

fs = sorted(int(l.split()[0], 16) for l in open(FUN) if l.strip() and not l.startswith('#'))
fend = lambda a: fs[bisect.bisect_right(fs, a)]
md = capstone.Cs(capstone.CS_ARCH_X86, capstone.CS_MODE_32)


def off(a):
    for va, sz, ro in secs:
        if va <= a < va + sz:
            return a - va + ro
    raise ValueError(hex(a))


# nøgle-globalerne → navn (key_ids_table.c: globalerne og kæderne af navne)
src = open(KEYS).read()
globs = [int(m, 16) for m in re.findall(r'\{(0x[0-9a-f]+),', src.split('g_key_id_globals[KEY_ID_COUNT] = {')[1].split('};')[0])]
KEY = {}   # global → navnene i kæden (første lige navn i databasen vinder)
for m in re.finditer(r'(g_key_\w+_chain)\[\] = \{(.*?)\};', src, re.S):
    for e in re.finditer(r'\{(0x[0-9a-f]+), (-?\d+), (-?\d+), (-?\d+)\}', m.group(2)):
        o = off(int(e.group(1), 16))
        name = d[o:d.index(b'\0', o)].decode('latin1')
        for i in (int(e.group(2)), int(e.group(3))):
            if i >= 0:
                if name not in KEY.setdefault(globs[i], []):
                    KEY[globs[i]].append(name)

# landets nøgle → konstruktør (AWARD_MANAGER 0x4135b0) og klassens vtabel
NATIONS = [
    ('Argentina', 0x96748c), ('Belgium', 0x967bfc), ('Brazil', 0x968824), ('Denmark', 0x96984c), ('England', 0x969f38),
    ('Finland', 0x96a748), ('France', 0x96ae34), ('Germany', 0x96b3b8), ('Holland', 0x96ba74), ('Republic Of Ireland', 0x96c17c),
    ('Italy', 0x96c958), ('Japan', 0x96cce8), ('Norway', 0x96dfd0), ('Portugal', 0x96e9ac), ('Scotland', 0x96f824), ('Spain', 0x96fdd8),
    ('Sweden', 0x970354), ('United States', 0x970830), ('Poland', 0x96e608), ('Greece', 0x96b770), ('Croatia', 0x969380),
    ('Australia', 0x96781c), ('Northern Ireland', 0x96df88), ('Turkey', 0x970748), ('Russia', 0x96f32c), ('Wales', 0x970a88),
    ('South Korea', 0x96cfd8),
]
LIMIT = {'England': 26, 'Italy': 25}
R32 = ['eax', 'ebx', 'ecx', 'edx', 'esi', 'edi', 'ebp']


def walk(a):
    """kaldene i en funktion med argumenterne: nøgler (navne), tal, prisernes pladser ('aw', n) og YEAR_RATINGS (+0xc/+0x10)"""
    reg, pushes, out = {'ecx': ('THIS',)}, [], []
    for i in md.disasm(rd(a, fend(a) - a), a):
        m, op = i.mnemonic, i.op_str
        ops = [o.strip() for o in op.split(',')] if op else []

        def val(o):
            if o in reg:
                return reg[o]
            if re.fullmatch(r'-?0x[0-9a-f]+|-?\d+', o):
                v = int(o, 0)
                return v - (1 << 32) if v >= 1 << 31 else v
            mm = re.fullmatch(r'(?:dword|word|byte) ptr \[(0x[0-9a-f]+)\]', o)
            if mm:
                g = int(mm.group(1), 16)
                return ('K', KEY[g]) if g in KEY else ('G', g)
            mm = re.fullmatch(r'(?:dword|word|byte) ptr \[(e[a-z]{2})(?: \+ (0x[0-9a-f]+|\d+))?\]', o)
            if mm:
                b = reg.get(mm.group(1))
                o2 = int(mm.group(2) or '0', 0)
                if b == ('AW',):
                    return ('aw', o2 // 4)
                if b == ('G', 0xad9c60):
                    return ('YR', o2)
                if mm.group(1) in ('esi', 'ebp', 'ecx', 'edx', 'eax') and o2 == 4 and b in (None, ('THIS',)):
                    return ('AW',)
                return ('?', o)
            return ('?', o)

        if m in ('mov', 'movsx', 'movzx') and ops[0] in R32:
            reg[ops[0]] = val(ops[1])
        elif m == 'push':
            pushes.append(val(ops[0]))
        elif m == 'xor' and ops[0] == ops[1]:
            reg[ops[0]] = 0
        elif m == 'or' and ops[1] == '0xffffffff':
            reg[ops[0]] = -1
        elif m == 'inc' and isinstance(reg.get(ops[0]), int):
            reg[ops[0]] = reg[ops[0]] + 1
        elif m == 'call':
            out.append((i.address, int(op, 16) if op.startswith('0x') else op, list(reversed(pushes)), reg.get('ecx')))
            pushes = []
            for r in ('eax', 'ecx', 'edx'):
                reg.pop(r, None)
        elif m == 'cmp' and len(ops) == 2 and ops[0] == 'eax':
            v = val(ops[1])
            out.append((i.address, 'cmp', v, None))
        elif m == 'mov' and ops[1] == 'eax' and re.fullmatch(r'dword ptr \[e(?:[abcd]x|si|di|bp)(?: \+ (?:0x[0-9a-f]+|\d+))?\]', ops[0]):
            mm = re.search(r'\+ (0x[0-9a-f]+|\d+)', ops[0])
            out.append((i.address, 'store', int(mm.group(1), 0) if mm else 0, None))
        elif m == 'test' and '0x11c' in op:
            out.append((i.address, 'flag4', None, None))
        elif m == 'ret':
            break
    return out


def norm(v):
    if isinstance(v, tuple):
        if v[0] == 'K':
            return v[1][0] if len(v[1]) == 1 else v[1]
        if v[0] == 'aw':
            return v[1]
    return v


def slot(v):
    assert isinstance(v, tuple) and v[0] == 'aw', v
    return v[1]


res = {}
for nation, vt in NATIONS:
    e = struct.unpack('<6I', rd(vt, 24))
    # konstruktørkaldet efterfulgt af gemningen i pladsen (mov [AW + 4·i], eax); Norges kopibeskyttelse laver priser, der straks slettes
    # (vtbl[0](1)) – de gemmes ikke og tæller ikke med
    slots, pend = {}, None
    for ad, fn, a, _ in walk(e[0]):
        if fn == 'store':
            if pend is not None:
                slots[a // 4] = pend
            pend = None
            continue
        if fn in ('cmp', 'flag4'):
            continue
        pend = None
        if fn not in (0x92fe80, 0x8af520, 0x766e10):
            continue
        if not (isinstance(a[2], tuple) and a[2][0] == 'K'):
            continue
        if fn == 0x92fe80:     # YEAR_AWARD(nation, idx, key, a3, a4, comp, a7, shortlist, visValue, load, spiller)
            pend = {'k': 'Y', 'n': norm(a[2]), 'r': [a[3], a[4]], 'c': norm(a[5]), 'p': a[10], 'v': a[8]}
        elif fn == 0x8af520:    # TEAM_AWARD(nation, idx, key, a3, a4, comp, a7, layout, load, 1)
            pend = {'k': 'T', 'n': norm(a[2]), 'r': [a[3], a[4]], 'c': norm(a[5]), 'l': a[7]}
        elif fn == 0x766e10:    # MONTH_AWARD(nation, idx, key, a3, a4, comp, fra måned, år, til måned, år, load, spiller)
            pend = {'k': 'M', 'n': norm(a[2]), 'r': [a[3], a[4]], 'c': norm(a[5]), 'm': [a[6], a[8]], 'p': a[11]}
    n = LIMIT.get(nation, len(slots))
    assert sorted(slots)[:n] == list(range(n)), (nation, sorted(slots))
    aw = [slots[i] for i in range(n)]
    ok = lambda s: isinstance(s, int) and 0 <= s < n
    days, cur = [], None
    for _, fn, a, this in walk(e[1]):
        if fn == 0x549f70:
            cur = [a[0], a[1], a[3], []]
            days.append(cur)
        elif fn == 0x768cf0:    # (comp, dato, pris, maxAlder, posmaske, art, nationalitet=, klubland=, nationalitet≠, begge=)
            if ok(norm(a[2])):
                cur[3].append(['P', norm(a[0]), slot(a[2]), a[3], a[4], a[5]] + [norm(x) for x in a[6:10]])
        elif fn == 0x7698f0:    # (comp, pris)
            if ok(norm(a[1])):
                cur[3].append(['T', norm(a[0]), slot(a[1])])
        elif fn == 0x768940:    # (dato, pris, comp)
            if ok(norm(a[1])):
                cur[3].append(['MY', norm(a[2]), slot(a[1])])
        elif fn == 0x769380:    # (dato, pris, klubland=, nationalitet=, nationalitet≠, begge=, maxAlder, posmaske, art)
            if ok(norm(a[1])):
                cur[3].append(['N', slot(a[1])] + [norm(x) for x in a[2:6]] + [a[6], a[7], a[8]])
        elif fn == 0x7683c0:    # (dato, pris, YEAR_RATINGS, nationalitet=, klubland=, nationalitet≠, begge=, division=, mode, maxAlder)
            if ok(norm(a[1])):
                yr = a[2]
                assert isinstance(yr, tuple) and yr[0] == 'YR', yr
                cur[3].append(['R', slot(a[1]), yr[1]] + [norm(x) for x in a[3:8]] + [a[8], a[9]])
        elif fn in (0x768310, 0x669340, 0x7672e0, 0x769c70):
            pass
        elif isinstance(fn, int):
            raise SystemExit(f'{nation}: ukendt kald {fn:#x} i daily')
    mon, pending = [], None
    if e[3] != 0x5a53c0:
        for _, fn, a, this in walk(e[3]):
            if fn == 0x86f950:
                pending = ('MM', norm(a[0]))
            elif fn == 0x768130:
                pending = ('MB', norm(a[0]), a[1])
            elif fn == 0x7671c0:
                s = slot(this)
                if ok(s):
                    mon.append([pending[0], pending[1], s] + list(pending[2:]))
                pending = None
            elif fn == 0x767150:
                s = slot(this)
                if ok(s):
                    mon.append(['MP', s, a[1]])
    wk = []
    if e[4] not in (0x583470, 0x48cea0):
        for _, fn, a, _ in walk(e[4]):
            if fn == 'flag4':
                break
            if fn == 'cmp' and isinstance(a, tuple) and a[0] == 'aw':
                if ok(a[1]):
                    wk.append(a[1])
        if not wk:   # 0x90f060 (Australien/Wales): esi = [edx] → kun den første
            wk = [0]
    # vtbl[2] record_match_ratings: 0x5a96b0 = kun ligakampe (0x4b0700), 0x7683a0 = alle landets kampe (MONTH_RATINGS kun med månedspriser)
    res[nation] = {'aw': aw, 'days': days, 'mon': mon, 'wk': wk, 'ml': 1 if e[2] == 0x5a96b0 else 0}

# turneringernes korte navn (club_comp.dat +0x38) – Awards-skærmens titel "{}<%s - competition>{} Awards" (0x414d67) bruger det
cc = open(os.path.expanduser('~/cm0102/.orig-db/Original-3.9.68-Database/club_comp.dat'), 'rb').read()
short = {}
for k in range(len(cc) // 107):
    r = cc[k * 107:(k + 1) * 107]
    short[r[4:0x37].split(b'\0')[0].decode('latin1').lower()] = r[0x38:0x52].split(b'\0')[0].decode('latin1')
used = set()
for v in res.values():
    for x in v['aw']:
        if x['c'] != -1:
            used.update(x['c'] if isinstance(x['c'], list) else [x['c']])
out = {'nations': res, 'short': {c: short[c.lower()] for c in sorted(used) if c.lower() in short}}
json.dump(out, open(OUT, 'w'), ensure_ascii=False, separators=(',', ':'))
print('ok', len(res), 'lande,', sum(len(v['aw']) for v in res.values()), 'priser')
