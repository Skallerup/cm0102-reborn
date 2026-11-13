# Bestyrelse og managerjob i originalen (oraklets gemte spil) – til sammenligning med vores spil (scripts/cm-board-season.ts).
# Læser databasen (start: club.dat +0xcf = managerens staff-id, staff.dat 157 bytes med navneindeks +4/+8/+0xc) og et gemt spil fra
# ~/cm0102-engine/oracle (samesave.sav: club.dat 0x245 bytes med +0xcf = hukommelsens staff-indeks, staff.dat 110 bytes, man_conf.dat =
# MANAGER_MANAGER's bestyrelsesposter 0x49 bytes pr. klub i [0xae23b4]-rækkefølge) og skriver JSON:
#   { clubs: { <database-klub-id>: { name, start, end, conf: [bestyrelsespostens felter] } }, changed: [...] }
# Klubber og personer matches på navn (det gemte spils id'er er hukommelsens rækkefølge).
# Kør: python3 scripts/cm-board-oracle.py <Data-mappe> <samesave.sav> <ud.json>
import json, struct, sys, os

sys.path.insert(0, os.path.dirname(__file__))
exec(open(os.path.join(os.path.dirname(__file__), 'orig-save-dev.py')).read().split('if __name__')[0])

def names(T):
    return lambda i: (T[i * 60:i * 60 + 51].split(b'\0')[0].decode('latin1') if 0 <= i and i * 60 < len(T) else '')

def person(fn, ln, cn, f, l, c):
    return cn(c) or (fn(f) + ' ' + ln(l)).strip()

def db_start(data):
    rd = lambda n: open(os.path.join(data, n), 'rb').read()
    S = rd('staff.dat'); C = rd('club.dat')
    fn, ln, cn = names(rd('first_names.dat')), names(rd('second_names.dat')), names(rd('common_names.dat'))
    # staff.dat i databasen: fire tabeller – personerne er de første (157 bytes); index.dat giver antallet
    I = rd('index.dat'); n0, n1 = struct.unpack_from('<2i', I, 0)
    cnt = None
    for k in range((len(I) - 8) // 0x43):
        o = 8 + k * 0x43; nm = I[o:o + 51].split(b'\0')[0].decode('latin1').lower()
        tab, c, off = struct.unpack_from('<3i', I, o + 0x33)
        if nm == 'staff.dat' and off == 0: cnt = c
    who = {}
    for k in range(cnt or len(S) // 157):
        o = k * 157
        sid, f, l, c = struct.unpack_from('<4i', S, o)
        who[sid] = person(fn, ln, cn, f, l, c)
    out = {}
    for k in range(len(C) // 581):
        o = k * 581
        cid, = struct.unpack_from('<i', C, o); m, = struct.unpack_from('<i', C, o + 0xcf)
        nm = C[o + 4:o + 55].split(b'\0')[0].decode('latin1')
        out.setdefault(nm, []).append((cid, who.get(m, '') if m >= 0 else ''))
    return out                                                               # navn → [(databasens id, manager)] (gemte spil nummererer om)

def save_end(sav):
    S = extract(sav, 'staff.dat'); C = extract(sav, 'club.dat'); M = extract(sav, 'man_conf.dat')
    fn, ln, cn = names(extract(sav, 'first_names.dat')), names(extract(sav, 'second_names.dat')), names(extract(sav, 'common_names.dat'))
    who = {}
    for k in range(len(S) // 110):
        o = k * 110
        sid, f, l, c = struct.unpack_from('<4i', S, o)
        who[sid] = person(fn, ln, cn, f, l, c)
    out = {}
    nclub = len(C) // 581
    for k in range(nclub):
        o = k * 581
        cid, = struct.unpack_from('<i', C, o); m, = struct.unpack_from('<i', C, o + 0xcf)
        # man_conf.dat: hovedet (4 bytes antal?) og så posterne – se notes/board-jobs.md for felterne
        out[cid] = dict(name=C[o + 4:o + 55].split(b'\0')[0].decode('latin1'), end=who.get(m, '') if m >= 0 else '', row=k)
    return out, M, nclub

if __name__ == '__main__':
    data, sav, dst = sys.argv[1:4]
    st = db_start(data); en, M, nclub = save_end(sav)
    clubs = {}; changed = []
    for cid, e in en.items():
        cand = st.get(e['name'], [])
        if len(cand) != 1: continue                                          # tvetydigt navn
        dbid, start = cand[0]
        clubs[dbid] = dict(name=e['name'], start=start, end=e['end'], row=e['row'])
        if start != e['end']: changed.append(dbid)
    json.dump(dict(clubs=clubs, changed=changed, manConfSize=len(M), clubs_in_memory=nclub), open(dst, 'w'), ensure_ascii=False, indent=0)
    print(len(clubs), 'klubber,', len(changed), 'med anden manager end i databasen')
