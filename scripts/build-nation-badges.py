#!/usr/bin/env python3
"""Landsholdenes logoer fra TheSportsDB (gratis testnøgle "123") → public/data/logos.json["nations"] (nationsnavn → url).
Brug: python3 scripts/build-nation-badges.py   (henter kun dem, der mangler; ~2 s pr. opslag pga. API'ets grænse)"""
import json, os, time, urllib.parse, urllib.request
DELAY = float(os.environ.get('DELAY', '2.1'))

ROOT = os.path.join(os.path.dirname(__file__), '..')
OUT = os.path.join(ROOT, 'public', 'data', 'logos.json')
# databasens navne → TheSportsDB's
ALIAS = {'The Congo': 'Congo', 'The Gambia': 'Gambia', 'The Philippines': 'Philippines', 'FYR of Macedonia': 'North Macedonia', 'Democratic Republic of Congo': 'DR Congo', 'Cape Verde Islands': 'Cape Verde', 'Brunei Darussalam': 'Brunei', 'Surinam': 'Suriname', 'Swaziland': 'Eswatini', 'eSwatini': 'Eswatini', 'Timor': 'East Timor', 'São Tomé & Principe': 'Sao Tome and Principe', 'Trinidad & Tobago': 'Trinidad and Tobago', 'Antigua & Barbuda': 'Antigua and Barbuda', 'St Kitts & Nevis': 'Saint Kitts and Nevis', 'St Vincent & The Grenadines': 'Saint Vincent and the Grenadines', 'Holland': 'Netherlands', 'Republic of Ireland': 'Ireland', 'Korea Republic': 'South Korea', 'Korea DPR': 'North Korea',
         'China PR': 'China', 'United States': 'USA', 'U.S.A.': 'USA', 'Korea, South': 'South Korea', 'Korea, North': 'North Korea', 'Hongkong': 'Hong Kong', 'Curacao': 'Curaçao', 'Timor-Leste': 'East Timor', 'St. Lucia': 'Saint Lucia', 'St. Kitts & Nevis': 'Saint Kitts and Nevis', 'C.I.S.': 'Russia', 'Czech Republic': 'Czechia',
         "Côte d'Ivoire": 'Ivory Coast', 'Cote d\'Ivoire': 'Ivory Coast', 'Bosnia-Herzegovina': 'Bosnia and Herzegovina', 'FYR Macedonia': 'North Macedonia',
         'Macedonia': 'North Macedonia', 'Serbia and Montenegro': 'Serbia', 'Yugoslavia': 'Serbia', 'Congo DR': 'DR Congo', 'Türkiye': 'Turkey'}

def names():
    out = set()
    for f in ('world.json', 'world-original.json', 'world-modern.json'):
        p = os.path.join(ROOT, 'public', 'data', f)
        if os.path.exists(p):
            for n in json.load(open(p))['nations']: out.add(n['name'] if isinstance(n, dict) else n)
    return sorted(out)

def lookup(name):
    # databasens navn og aliaset (fx "Czech Republic" / "Czechia")
    for cand in dict.fromkeys([ALIAS.get(name, name), name, name.replace('&', 'and').replace('St ', 'Saint ')]):
        with urllib.request.urlopen(f'https://www.thesportsdb.com/api/v1/json/123/searchteams.php?t={urllib.parse.quote(cand)}', timeout=20) as r:
            teams = json.load(r).get('teams') or []
        for t in teams:
            if t.get('strSport') == 'Soccer' and t.get('strGender') == 'Male' and t.get('strTeam', '').lower() == cand.lower() and t.get('strBadge'):
                return t['strBadge'] + '/small'
        time.sleep(DELAY)
    return None

d = json.load(open(OUT))
nat = d.setdefault('nations', {})
todo = [n for n in names() if n not in nat]
print(f'{len(todo)} nationer at slå op')
for i, n in enumerate(todo):
    for attempt in range(3):
        try:
            u = lookup(n); break
        except Exception as e:
            u = None; time.sleep(10)
    if u: nat[n] = u
    print(f'{i + 1}/{len(todo)} {n}: {"ok" if u else "-"}', flush=True)
    if (i + 1) % 10 == 0: json.dump(d, open(OUT, 'w'), ensure_ascii=False, separators=(',', ':'))
    time.sleep(DELAY)
json.dump(d, open(OUT, 'w'), ensure_ascii=False, separators=(',', ':'))
print(f'{len(nat)} logoer i alt')
