#!/usr/bin/env python3
"""build-cm-awards.py <Data-mappe> <out.json>

Originalens priser (CM 01/02 staff_comp.dat, 101 bytes pr. pris, og staff_comp_history.dat, 58 bytes pr. vinder-år) til
src/game/data/cmAwards.json – kun til ægte tilstand med den originale database (cmAwards.ts / AwardsClassic.tsx).

staff_comp.dat (Bosman-projektets database.h `struct staff_comp`): +0 id, +4 navn[51], +0x38 kort navn[26], +0x53 verdensdel,
+0x57 land (−2 = ingen). staff_comp_history.dat: +0 id, +4 pris-id, +8 år (word), så tre placeringer à 16 bytes
(+0xa fornavn-id, +0xe efternavn-id, +0x12 kaldenavn-id?, +0x16 altid 0; −1 = ingen).
Navne: first_names/second_names/common_names.dat (60 bytes: navn[51], +0x33 id).
"""
import json, struct, sys, os

D = sys.argv[1]
OUT = sys.argv[2]


def cstr(b):
    return b.split(b'\0')[0].decode('latin1')


def names(fn):
    b = open(os.path.join(D, fn), 'rb').read()
    out = {}
    for i in range(len(b) // 60):
        r = b[i * 60:(i + 1) * 60]
        out[struct.unpack_from('<i', r, 0x33)[0]] = cstr(r[:51])
    return out


fst, snd, com = names('first_names.dat'), names('second_names.dat'), names('common_names.dat')

sb = open(os.path.join(D, 'staff_comp.dat'), 'rb').read()
awards = []
for i in range(len(sb) // 0x65):
    r = sb[i * 0x65:(i + 1) * 0x65]
    aid = struct.unpack_from('<i', r, 0)[0]
    cont, nat = struct.unpack_from('<ii', r, 0x53)
    awards.append([aid, cstr(r[4:0x37]), cstr(r[0x38:0x52]), cont, nat])

hb = open(os.path.join(D, 'staff_comp_history.dat'), 'rb').read()
hist = {}
for i in range(len(hb) // 0x3a):
    r = hb[i * 0x3a:(i + 1) * 0x3a]
    aid = struct.unpack_from('<i', r, 4)[0]
    if not 0 <= aid < len(awards):
        continue   # poster uden pris (id < 0) springes over
    year = struct.unpack_from('<H', r, 8)[0]
    places = []
    for k in range(3):
        f, s, c, club = struct.unpack_from('<iiii', r, 0xa + 16 * k)
        if f < 0 and s < 0 and c < 0:
            places.append(None)
            continue
        # fornavn + efternavn; mangler efternavnet (Gary Lineker, Eric Cantona …), bruges kaldenavnet, hvis det findes
        nm = ' '.join(x for x in (fst.get(f, ''), snd.get(s, '')) if x) if s in snd else (com.get(c) or fst.get(f, ''))
        places.append(nm)
    while places and places[-1] is None:
        places.pop()
    hist.setdefault(aid, []).append([year, places])
for v in hist.values():
    v.sort(key=lambda x: -x[0])

json.dump({'awards': awards, 'history': {str(k): v for k, v in sorted(hist.items())}}, open(OUT, 'w'), ensure_ascii=False, separators=(',', ':'))
print('ok', len(awards), 'priser,', sum(len(v) for v in hist.values()), 'år')
