# Læser originalens klubøkonomi (finance.dat, 0x167 bytes pr. klub) af et gemt spil (CM 01/02 .sav – samme format som orig-save-dev.py)
# og skriver den som JSON. Posten (Finance, cm0102.exe 3.9.68 – se ~/cm0102-engine/notes/finance.md):
#   +0 saldo (i64), +8 klubbens indeks, +0xc ugentlig lønsum, +0x10 højeste løn, +0x14 lønloftet, +0x18 sæsonkortholdere,
#   +0x20 sidste måned, +0x70 denne måned, +0xc0 sidste sæson, +0x110 denne sæson (blokke à 0x50 bytes),
#   +0x160 sæsonkortandelen (float), +0x164 sæsonkortugen, +0x165 stadionets tilstand, +0x166.
# Blokken: +0 Players Bought (i64), +8 Players Sold (i64), +0x10 Other (udgift), +0x14 Interest (udgift), +0x18 League Fines,
#   +0x1c Ground Maintenance, +0x20 Wages, +0x24 Dividends, +0x28 Bonuses, +0x2c Signing On Fees, +0x30 Gate Receipts, +0x34 Other (indtægt),
#   +0x38 Prize Money, +0x3c Season Tickets, +0x40 Interest (indtægt), +0x44 Investments, +0x48 TV Revenue, +0x4c Merchandising.
# Kør: python3 scripts/orig-finance.py <save.sav> <out.json> [klubnavn …]
import json, struct, sys

def index(d):
    a, b, n = struct.unpack_from('<3I', d, 0); out = {}
    for i in range(n):
        o = 12 + i * 268; off, size = struct.unpack_from('<2I', d, o)
        out[d[o + 8:o + 268].split(b'\0')[0].decode('latin1')] = (off, size)
    return out

def unrle(d, off, size):
    out = bytearray(); i = off
    while len(out) < size:
        b = d[i]
        if b > 0x80: out += bytes([d[i + 1]]) * (b & 0x7f); i += 2
        else: out.append(b); i += 1
    return bytes(out[:size])

KEYS = ['bought', 'sold', 'otherOut', 'interestOut', 'fines', 'maintenance', 'wages', 'dividends', 'bonuses', 'signOn',
        'gate', 'otherIn', 'prize', 'seasonTickets', 'interestIn', 'investments', 'tv', 'merch']

def block(F, o):
    r = {'bought': struct.unpack_from('<q', F, o)[0], 'sold': struct.unpack_from('<q', F, o + 8)[0]}
    for k, name in enumerate(KEYS[2:]): r[name] = struct.unpack_from('<i', F, o + 0x10 + 4 * k)[0]
    return r

def clubs(d, ix):
    # club.dat i det gemte spil = databasens format (581 bytes): +0 id, +4 navn (51), +56 kort navn (26)
    C = unrle(d, *ix['club.dat']); n = len(C) // 581; out = []
    for k in range(n):
        o = k * 581
        out.append((struct.unpack_from('<i', C, o)[0], C[o + 4:o + 55].split(b'\0')[0].decode('latin1')))
    return out

def main(path, outp, names):
    d = open(path, 'rb').read(); ix = index(d)
    F = unrle(d, *ix['finance.dat']); cl = clubs(d, ix)
    recs = []
    for k in range(len(F) // 0x167):
        o = k * 0x167
        ci = struct.unpack_from('<i', F, o + 8)[0]
        cid, nm = cl[ci] if 0 <= ci < len(cl) else (None, '?')
        if names and nm not in names: continue
        recs.append({
            'index': ci, 'id': cid, 'name': nm,
            'balance': struct.unpack_from('<q', F, o)[0],
            'wageBill': struct.unpack_from('<i', F, o + 0xc)[0], 'topWage': struct.unpack_from('<i', F, o + 0x10)[0],
            'maxWage': struct.unpack_from('<i', F, o + 0x14)[0], 'stHolders': struct.unpack_from('<i', F, o + 0x18)[0],
            'x1c': struct.unpack_from('<i', F, o + 0x1c)[0],
            'lastMonth': block(F, o + 0x20), 'thisMonth': block(F, o + 0x70), 'lastYear': block(F, o + 0xc0), 'thisYear': block(F, o + 0x110),
            'stShare': struct.unpack_from('<f', F, o + 0x160)[0], 'stWeek': F[o + 0x164], 'x165': F[o + 0x165], 'x166': F[o + 0x166],
        })
    json.dump(recs, open(outp, 'w'), indent=1)
    print(len(recs), 'klubber →', outp)

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], set(sys.argv[3:]))
