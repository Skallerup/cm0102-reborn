"""Landsholdsdata til den originale database (fra ejerens Bosman-projekt: national_teams/national_teams.json, udtrukket af
egen kopi af CM 01/02 3.9.68). Skriver scripts/national-original.json, som build-cm-data.mts lægger ind i world-original.json.
Kør: python3 scripts/build-national.py [sti til national_teams.json]"""
import json, sys
src = sys.argv[1] if len(sys.argv) > 1 else '/Users/martinskallerup/Documents/Craft Anything/cm-01-02-bosman-edition/app/national_teams/national_teams.json'
d = json.load(open(src))
nations = {}
for n in d['nations']:
    coach = next((s['name'] for s in n.get('staff', []) if s.get('job') == 'Manager'), '')
    st = n.get('national_stadium') or {}
    nations[n['name']] = {'stadium': st.get('name', ''), 'cap': st.get('capacity', 0) or 0, 'fifa': round(n.get('fifa_coefficient') or 0, 1),
                          'coach': coach, 'rep': n.get('national_team_reputation') or 0, 'titles': n.get('titles') or {}}
names = {'FIFA World Cup': 'wc', 'European Football Championship': 'euro', 'Copa America': 'copa', 'African Cup of Nations': 'afcon', 'Asian Cup': 'asian', 'Confederations Cup': 'confed', 'Olympic Games': 'olympic', 'Oceania Nations Cup': 'ofc', 'Asian Games Football Tournament': 'asiangames'}
history = [{'c': names[h['competition']], 'y': h['year'], 'w': h['winner'], 'r': h.get('runner_up') or '', 't': h.get('third') or '', 'h': h.get('host') or ''} for h in d['history'] if h['competition'] in names]
json.dump({'nations': nations, 'history': sorted(history, key=lambda x: -x['y'])}, open('scripts/national-original.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print(len(nations), 'nationer,', len(history), 'slutrunder')
