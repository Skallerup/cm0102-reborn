#!/usr/bin/env python3
"""Originalens vejrdata (Weather 0x9226c0–0x923b60, weather.cpp) → src/game/data/cmWeather.json.

  * regions: weather.cfg (spillets Data-mappe, 3.9.68-patchens udgave) – 44 klimaområder med fire perioder (Weather::read_region 0x922c40 /
    read_region_period 0x922d20, 0x13 bytes: startdag (word), 5 W-, 5 P- og 7 H-tærskler). Rækkefølgen = regionsindekset (city +0x34).
  * versions[<udgave>][klub-id] = [byens id, regionsindekset, stadionets kapacitet +0x3c, overdækket +0x4c, undersoil heating +0x4d] –
    0x923010's kæde for en kamp på hjemmeholdets stadion: stadium +0x38 byen, ellers klubbens nation (+0x53) → hovedstaden (+0x7a);
    regionen = byens +0x34, hvis 0 ≤ indeks < antal, ellers byens nation (+0x1f) → hovedstadens +0x34, ellers region 0.
    Klubberne = dem i den tilsvarende world-fil (public/data/world-original*.json).

Kør: python3 scripts/build-cm-weather.py   (kræver .orig-db/ og Bosman-appen i /Applications)
"""
import json, struct, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP = '/Applications/CM 01-02 Bosman Edition.app/Contents/Resources/game'
CFG = os.path.join(APP, 'Data', 'weather.cfg')
VERSIONS = {
    '3.9.60': (os.path.join(ROOT, '.orig-db', 'Original-3.9.60-Database-Swedish_fixed'), 'world-original.json'),
    '3.9.65': (os.path.join(APP, 'Data-3.9.65'), 'world-original-3965.json'),
    '3.9.68': (os.path.join(ROOT, '.orig-db', 'Original-3.9.68-Database'), 'world-original-3968.json'),
}


def regions():
    lines = [l.strip() for l in open(CFG, encoding='latin1') if l.strip() and not l.strip().startswith('#')]
    n = int(lines[0]); out = []; i = 1
    for _ in range(n):
        m = re.match(r'(-?\d+)\s+(.*)', lines[i]); i += 1
        per = []
        for _ in range(4):
            m2 = re.match(r'\w+:\s*(.*)', lines[i]); i += 1
            v = [int(x.strip().lstrip('WPH')) for x in m2.group(1).split(',')]
            assert len(v) == 18, lines[i - 1]
            per.append(v)
        out.append([int(m.group(1)), m.group(2).strip(), per])
    assert [r[0] for r in out] == list(range(n))
    return out


def version(src, world, nreg):
    rd = lambda f: open(os.path.join(src, f), 'rb').read()
    city, stad, club, nat = rd('city.dat'), rd('stadium.dat'), rd('club.dat'), rd('nation.dat')
    cities = {}
    for o in range(0, len(city) - 55, 56):
        cid = struct.unpack_from('<i', city, o)[0]
        cities[cid] = (struct.unpack_from('<i', city, o + 0x1f)[0], struct.unpack_from('<i', city, o + 0x34)[0])
    capital = {}
    for o in range(0, len(nat) - 289, 290):
        capital[struct.unpack_from('<i', nat, o)[0]] = struct.unpack_from('<i', nat, o + 0x7a)[0]
    stadia = {}
    for o in range(0, len(stad) - 77, 78):
        stadia[struct.unpack_from('<i', stad, o)[0]] = (struct.unpack_from('<i', stad, o + 0x38)[0], struct.unpack_from('<i', stad, o + 0x3c)[0],
                                                       struct.unpack_from('<b', stad, o + 0x4c)[0], struct.unpack_from('<b', stad, o + 0x4d)[0])
    clubs = {}
    for o in range(0, len(club) - 580, 581):
        clubs[struct.unpack_from('<i', club, o)[0]] = (struct.unpack_from('<i', club, o + 0x53)[0], struct.unpack_from('<i', club, o + 0x69)[0])
    valid = lambda r: 0 <= r < nreg
    w = json.load(open(os.path.join(ROOT, 'public', 'data', world)))
    out = {}
    for row in w['clubs']:
        cid = row[0]
        if cid not in clubs: continue
        nation, sid = clubs[cid]
        st = stadia.get(sid)
        c = st[0] if st and st[0] in cities else -1
        if c < 0: c = capital.get(nation, -1) if capital.get(nation, -1) in cities else -1
        if c < 0: continue                                   # ingen by: 0x923010 giver vindstille, tørt og 2-båndets temperatur
        r = cities[c][1]
        if not valid(r):
            cap = capital.get(cities[c][0], -1)
            r = cities[cap][1] if cap in cities and valid(cities[cap][1]) else 0
        out[cid] = [c, r, st[1] if st else 0, st[2] if st else 0, st[3] if st else 0]
    return out


def main():
    reg = regions()
    data = {'regions': reg, 'versions': {}}
    for v, (src, world) in VERSIONS.items():
        data['versions'][v] = version(src, world, len(reg))
        print(v, len(data['versions'][v]), 'klubber', file=sys.stderr)
    dst = os.path.join(ROOT, 'src', 'game', 'data', 'cmWeather.json')
    json.dump(data, open(dst, 'w'), separators=(',', ':'))
    print(dst, os.path.getsize(dst), 'bytes', file=sys.stderr)


if __name__ == '__main__':
    main()
