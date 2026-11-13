#!/usr/bin/env python3
"""Turneringsnavnene, ejerens CM 01/02 (Bosman Edition) viser for den originale database: Seasons/names.tsv (sæson, klassefil, lang/kort
navn) og Seasons/rules.tsv (klassefil → land, liga/pokal, række). Bosman Edition giver hvert turneringsobjekt navnene for dets klassefil og
sæson (season_names.c) – fx "English Premier Division" (club_comp.dat) → "FA Premier League" i 2001/02.

Kør: python3 scripts/build-comp-names.py [Seasons-mappe] → src/i18n/data/cmCompNames.json
     {databasens navn: [[sæson, langt navn], …]} (kun når navnet skifter). Ligaerne matches på land + række (kun når rækken har én klassefil),
     landets pokal ("<land> Cup"/LEAGUE_RULES' navn) på den første pokal med klassefilen *_fa_cup eller <land>_cup.
"""
import csv, json, os, sys

SEASONS = sys.argv[1] if len(sys.argv) > 1 else '/Applications/CM 01-02 Bosman Edition.app/Contents/Resources/game/Seasons/'
ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), '..'))
rules = list(csv.DictReader(open(os.path.join(SEASONS, 'rules.tsv'), encoding='utf-8').readlines()[1:], delimiter='\t'))
names = list(csv.DictReader(open(os.path.join(SEASONS, 'names.tsv'), encoding='cp1252').readlines()[1:], delimiter='\t'))

# klassefil → sæson → langt navn (objekt n = 0)
by_file = {}
for r in names:
    if r['n'] != '0': continue
    by_file.setdefault(r['file'], {})[int(r['season'])] = r['long']

world = json.load(open(os.path.join(ROOT, 'public/data/world-original.json'), encoding='utf-8'))
nations = [n['name'] for n in world['nations']]

def files_for(nation, tier):
    fs = {r['comp_file'] for r in rules if r['nation'] == nation and r['tier'] == str(tier) and r['comp_file'] not in ('na', 'new')}
    return fs

out = {}
def put(db_name, f):
    seq = by_file.get(f)
    if not seq: return
    rows, last = [], None
    for s in sorted(seq):
        if seq[s] != last: rows.append([s, seq[s]]); last = seq[s]
    if rows and not (len(rows) == 1 and rows[0][1] == db_name): out[db_name] = rows

for lg in world['leagues']:
    if lg.get('hidden'): continue
    fs = files_for(nations[lg['nation']], lg['tier'])
    if len(fs) == 1: put(lg['name'], fs.pop())
# landenes pokaler: spillet kalder dem "<land> Cup"
for nation in sorted({nations[lg['nation']] for lg in world['leagues'] if not lg.get('hidden')}):
    cups = [r['comp_file'] for r in rules if r['nation'] == nation and r['tier'] == 'cup' and r['comp_file'] not in ('na', 'new')]
    main = next((f for f in cups if f.endswith('_fa_cup') or f.endswith('_cup') and not any(x in f for x in ('lge', 'league', 'cc_', 'chal', 'auto', 'super', 'trophy'))), None)
    if main: put(f'{nation} Cup', main)
for db_name, f in (('Champions League', 'european_cup'), ('UEFA Cup', 'uefa_cup'), ('Europa League', 'uefa_cup')):
    if f in by_file: put(db_name, f)

dst = os.path.join(ROOT, 'src/i18n/data/cmCompNames.json')
os.makedirs(os.path.dirname(dst), exist_ok=True)
json.dump(dict(sorted(out.items())), open(dst, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print(len(out), 'navne →', dst)
