#!/usr/bin/env python3
"""Originalens kommentarlinjer (CM 01/02 events_eng.cfg/events_dan.cfg via ejerens match_texts.json) → src/ui/data/matchTexts.json.
Brug: python3 scripts/build-match-texts.py [sti til match_texts.json]
Format: { "GOAL_ONE": [[vægt, engelsk, dansk, {de, es, fr, it, pt, tr}?], ...], ... } – kun kamplinjerne (ikke rapportlinjerne).
Oversættelserne til de øvrige sprog ligger i scripts/match-texts-i18n/<sprog>.json ({ begivenhed: [linje pr. variant] }) og dækker
de begivenheder, spillet bruger (scripts/match-text-events.json). Nye begivenheder i ui/matchTexts.ts skal oversættes dertil."""
import json, os, sys

SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Documents/Craft Anything/cm-01-02-bosman-edition/app/match_texts/match_texts.json')
OUT = os.path.join(os.path.dirname(__file__), '..', 'src', 'ui', 'data', 'matchTexts.json')

d = json.load(open(SRC))
out = {}
for e in d['events']:
    name = e['name'].removeprefix('EVENT_')
    da = e.get('danish') or []
    rows = []
    for i, v in enumerate(e['variants']):
        en = v['game'].strip()
        dk = (da[i]['game'].strip() if i < len(da) and da[i].get('game') else '') or en
        if en:
            rows.append([v.get('weight', 1) or 1, en, dk])
    if rows:
        out[name] = rows
I18N = os.path.join(os.path.dirname(__file__), 'match-texts-i18n')
for f in sorted(os.listdir(I18N)):
    lang = f.removesuffix('.json')
    tr = json.load(open(os.path.join(I18N, f)))
    for ev, lines in tr.items():
        rows = out.get(ev, [])
        assert len(lines) == len(rows), (lang, ev)
        for r, line in zip(rows, lines):
            if len(r) < 4: r.append({})
            r[3][lang] = line
json.dump(out, open(OUT, 'w'), ensure_ascii=False, separators=(',', ':'))
print(f'{len(out)} begivenheder, {sum(len(r) for r in out.values())} varianter → {os.path.relpath(OUT)} ({os.path.getsize(OUT) // 1024} KB)')
