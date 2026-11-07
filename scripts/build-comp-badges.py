#!/usr/bin/env python3
"""Turneringernes logoer fra TheSportsDB (testnøgle "123", ~1 opslag pr. 6 s) → public/data/logos.json["comps"] (vores nøgle → url).
Nøglen er turneringens rigtige navn, som spillet viser det på engelsk med den moderne database (se src/i18n/comps.ts), eller
'CL'/'UEFA'/'UECL' for de europæiske. Kør igen for at hente dem, der mangler."""
import json, os, time, urllib.request
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'logos.json')
IDS = {'Premier League': 4328, 'Championship': 4329, 'League One': 4396, 'League Two': 4397, 'FA Cup': 4482, 'League Cup': 4570,
       'LaLiga': 4335, 'LaLiga 2': 4400, 'Copa del Rey': 4483, 'Bundesliga': 4331, '2. Bundesliga': 4399, 'DFB-Pokal': 4485,
       'Serie A': 4332, 'Serie B': 4394, 'Coppa Italia': 4506, 'Ligue 1': 4334, 'Ligue 2': 4401, 'Coupe de France': 4484,
       'Eredivisie': 4337, 'Liga Portugal': 4344, 'Scottish Premiership': 4330, 'Superligaen': 4340, 'Pro League': 4338,
       'Süper Lig': 4339, 'CL': 4480, 'UEFA': 4481, 'UECL': 5071, 'wc': 4429, 'euro': 4502, 'Eliteserien': 4358, 'Allsvenskan': 4347,
       'Super League': 4675, 'Bundesliga (AUT)': 4621, 'Super League Greece': 4336, 'MLS': 4346}
d = json.load(open(OUT)); comps = d.setdefault('comps', {})
for k, i in IDS.items():
    if k in comps: continue
    for attempt in range(4):
        try:
            with urllib.request.urlopen(f'https://www.thesportsdb.com/api/v1/json/123/lookupleague.php?id={i}', timeout=20) as r:
                l = (json.load(r).get('leagues') or [None])[0]
            if l and l.get('strBadge'): comps[k] = l['strBadge'] + '/small'
            break
        except Exception:
            time.sleep(30)
    print(k, 'ok' if k in comps else '-', flush=True)
    json.dump(d, open(OUT, 'w'), ensure_ascii=False, separators=(',', ':'))
    time.sleep(6)
print(len(comps), 'turneringslogoer')
