#!/usr/bin/env python3
"""Bestyrelsens tillidstekst 0x690d80 (build_board_confidence_text, 504 blade) som data: tabellen og teksterne fra bilag A i
~/cm0102-engine/notes/board/notes-D-expect.md (udtrukket af exe'en med et symbolsk gennemløb af hele funktionen).

Kør: python3 scripts/build-board-texts.py [notes-D-expect.md] → src/game/data/cmBoardTexts.json
  S[i]      tekst Si (i = 1…289), "{club}" = klubbens navn, "{n}" = løbets længde (%d)
  t60[W+2][LB][CB] = [S for løbstype 1…5]   (dage ≥ 60)
  t30[W+2][CB]     = [S for løbstype 1…5]   (30–59 dage)
  t0[W+2]          = S                       (< 30 dage)
"""
import json, os, re, sys

SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser('~/cm0102-engine/notes/board/notes-D-expect.md')
ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), '..'))
md = open(SRC, encoding='utf-8').read()
annex = md[md.index('## Bilag A'):]

S = [''] * 290
for m in re.finditer(r'^- S(\d+) `0x[0-9a-f]+`: (.*)$', annex, re.M):
    txt = m.group(2).replace('\\n', '\n')
    txt = re.sub(r'\{\}<%s[^>]*>\{\}', '{club}', txt)
    txt = re.sub(r'<%d[^>]*>', '{n}', txt)
    if '<%' in txt: raise SystemExit(f'S{m.group(1)}: ukendt pladsholder: {txt}')
    S[int(m.group(1))] = txt
assert all(S[1:]), [i for i in range(1, 290) if not S[i]]

t60 = [[[None] * 7 for _ in range(7)] for _ in range(5)]
t30 = [[None] * 7 for _ in range(5)]
t0 = [None] * 5
num = lambda s: int(s[1:])
for m in re.finditer(r'^\| (>=60|30-59|<30) \| (-?\d) \| (\*|\d) \| (\*|\d) \| (S\d+)(?:\(n\))? \| (S\d+)(?:\(n\))? \| (S\d+)(?:\(n\))? \| (S\d+)(?:\(n\))? \| (S\d+)(?:\(n\))? \|$', annex, re.M):
    days, w, lb, cb = m.group(1), int(m.group(2)) + 2, m.group(3), m.group(4)
    row = [num(m.group(k)) for k in range(5, 10)]
    if days == '>=60': t60[w][int(lb)][int(cb)] = row
    elif days == '30-59': t30[w][int(cb)] = row
    else:
        assert len(set(row)) == 1; t0[w] = row[0]
assert all(c for w in t60 for lb in w for c in lb) and all(c for w in t30 for c in w) and all(t0)

dst = os.path.join(ROOT, 'src/game/data/cmBoardTexts.json')
json.dump({'S': S, 't60': t60, 't30': t30, 't0': t0}, open(dst, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('289 tekster, 504 blade →', dst)
