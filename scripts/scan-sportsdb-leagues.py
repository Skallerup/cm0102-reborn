#!/usr/bin/env python3
"""Henter TheSportsDB's fodboldligaer (navn, alternative navne, land, logo) for et interval af id'er → scripts/sportsdb-leagues.json.
Testnøglen tillader ~10 opslag i minuttet, så det tager tid; kan afbrydes og genoptages (gemte id'er springes over).
Brug: python3 scripts/scan-sportsdb-leagues.py [fra] [til]"""
import json, os, sys, time, urllib.request
OUT = os.path.join(os.path.dirname(__file__), 'sportsdb-leagues.json')
lo, hi = (int(sys.argv[1]), int(sys.argv[2])) if len(sys.argv) > 2 else (4328, 4720)
d = json.load(open(OUT)) if os.path.exists(OUT) else {}
for i in range(lo, hi + 1):
    if str(i) in d: continue
    for attempt in range(5):
        try:
            with urllib.request.urlopen(f'https://www.thesportsdb.com/api/v1/json/123/lookupleague.php?id={i}', timeout=20) as r:
                l = (json.load(r).get('leagues') or [None])[0]
            break
        except Exception:
            l = 'retry'; time.sleep(30)
    if l == 'retry': continue
    d[str(i)] = {'name': l['strLeague'], 'alt': l.get('strLeagueAlternate') or '', 'country': l.get('strCountry') or '', 'badge': (l.get('strBadge') or '')} if l and l.get('strSport') == 'Soccer' else None
    if l and l.get('strSport') == 'Soccer': print(i, l['strLeague'], flush=True)
    json.dump(d, open(OUT, 'w'), ensure_ascii=False, indent=0)
    time.sleep(6)
print('færdig', sum(1 for v in d.values() if v))
