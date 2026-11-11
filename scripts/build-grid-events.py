#!/usr/bin/env python3
"""Begivenhedstabellen til gittermotorens kommentar (src/game/engine/grid/eventTable.ts) fra originalens Data/events_eng.cfg.

Brug: python3 scripts/build-grid-events.py <sti til events_eng.cfg>
Felterne som i hukommelsen (match_events_read_config 0x6d9e50, ~/cm0102-engine/notes/commentary-ids.md §1): Priority (+0),
Follow-on (+2), report count (+4), No rollback (+7) og varianternes vægte omregnet som ved filslut (0x6daaac):
eff_k = floor(10·max(w) / w_k). Kun tal – teksterne ligger i src/ui/data/matchTexts.json (scripts/build-match-texts.py).
"""
import re, sys
src = sys.argv[1]
ev = {}
cur = None
name = None
for line in open(src, encoding='latin-1'):
    line = line.rstrip('\r\n')
    m = re.match(r'#\s*(EVENT_\w+)', line)
    if m: name = m.group(1); continue
    if line.startswith('='):
        f = [int(x) for x in line[1:].split(',')]
        cur = {'n': f[0], 'prio': f[1], 'follow': f[3], 'report': f[5], 'norb': f[8], 'w': [], 'name': name}
        ev[f[0]] = cur
    elif line.startswith('>') and cur is not None:
        cur['w'].append(int(line[1:].split(',')[0]))
N = max(ev) + 1
assert N == 677, N
rows = []
for n in range(N):
    e = ev[n]
    w = [x or 1 for x in e['w']] or [1]
    mx = max(w)
    eff = [10 * mx // x for x in w]
    rows.append(f"  [{e['prio']}, {e['follow']}, {e['report']}, {e['norb']}, [{','.join(map(str, eff))}]], // {n}")
out = '''// Originalens begivenhedstabel (Match_Events, 0xb68788 + 18·(id − 8000)) – GENERERET af scripts/build-grid-events.py fra Data/events_eng.cfg.
// Pr. begivenhed 0…676: [Priority, Follow-on, report count, No rollback, varianternes effektive vægte (eff = floor(10·max/w), 0x6daaac)].
// Ret ikke i hånden.
export type EventRow = [number, number, number, number, number[]];
export const EVENT_TABLE: EventRow[] = [
''' + '\n'.join(rows) + '\n];\n' + '''/** begivenhedernes navne uden EVENT_ (nøglerne i src/ui/data/matchTexts.json) */
export const EVENT_NAMES: string[] = [''' + ','.join('"%s"' % (ev[n]['name'][6:] if ev[n]['name'] else '') for n in range(N)) + '];\n'
open('src/game/engine/grid/eventTable.ts', 'w').write(out)
print('ok', N)
