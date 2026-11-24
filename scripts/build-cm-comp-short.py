#!/usr/bin/env python3
"""build-cm-comp-short.py [out.json]

Turneringernes korte navn (club_comp.dat +0x38, 26 tegn) efter det lange (+4, 51 tegn) fra den originale 3.9.68-database til
src/game/data/cmCompShort.json – kun hvor de er forskellige. Bruges af bestyrelsens kampreaktion (0x6a69c0: {}<%s - Competition>{} = comp +0x38).
"""
import json, os, sys

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '..', 'src', 'game', 'data', 'cmCompShort.json')
cc = open(os.path.expanduser('~/cm0102/.orig-db/Original-3.9.68-Database/club_comp.dat'), 'rb').read()
out = {}
for k in range(len(cc) // 107):
    r = cc[k * 107:(k + 1) * 107]
    name = r[4:0x37].split(b'\0')[0].decode('latin1')
    short = r[0x38:0x52].split(b'\0')[0].decode('latin1')
    if name and short and short != name:
        out[name] = short
json.dump(dict(sorted(out.items())), open(OUT, 'w'), ensure_ascii=False, indent=0)
print('ok', len(out))
