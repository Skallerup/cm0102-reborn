#!/usr/bin/env python3
"""Originalens kamplyde (ejerens …/match_sounds: 135 wav-filer fra CM 01/02's Sounds-mappe) → public/sounds/*.m4a (AAC, mono, 40 kbit/s).
Udelader de 10 lyde, originalen aldrig spiller, og intro-lydene. Kør derefter scripts/build-match-texts.py (knytter lyden til linjerne).
Kræver macOS (afconvert)."""
import json, os, subprocess, sys
BASE = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser('~/Documents/Craft Anything/cm-01-02-bosman-edition/app/match_sounds')
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'sounds')
os.makedirs(OUT, exist_ok=True)
d = json.load(open(os.path.join(BASE, 'match_sounds.json')))
for s in d['sounds']:
    f = s['file']
    if s['main_category'] == 'Bruges ikke af originalen' or f.startswith('intro'): continue
    dst = os.path.join(OUT, f[:-4].lower() + '.m4a')
    if not os.path.exists(dst): subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '40000', '-c', '1', os.path.join(BASE, 'lyde', f), dst], check=True)
print(len(os.listdir(OUT)), 'lyde')
