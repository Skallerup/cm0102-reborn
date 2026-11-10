# Læser originalens gemte spil (CM 01/02 .sav) og sammenligner spillernes udvikling mellem to saves.
# Formatet: 12 bytes hoved (4, 22, antal), så pr. fil 268 bytes (offset u32, ukomprimeret størrelse u32, navn[260]);
# indholdet er RLE: byte > 0x80 = (byte & 0x7F) gentagelser af næste byte, ellers en literal (også 0x80).
# player.dat = 70 bytes (id, +4 nummer, +5 CA, +7 PA); staff.dat = 110 bytes (+18 fødselsår, +57 klub, +97 spillerreference).
# Kør: python3 scripts/orig-save-dev.py "<A.sav>" "<B.sav>" [år for A]

import struct,sys
def index(d):
    a,b,n=struct.unpack_from('<3I',d,0); out={}
    for i in range(n):
        o=12+i*268; off,size=struct.unpack_from('<2I',d,o)
        out[d[o+8:o+268].split(b'\0')[0].decode('latin1')]=(off,size)
    return out
def unrle(d,off,size):
    out=bytearray(); i=off
    while len(out)<size:
        b=d[i]
        if b>0x80: out+=bytes([d[i+1]])*(b&0x7f); i+=2
        else: out.append(b); i+=1
    return bytes(out[:size]), i
def extract(path,name):
    d=open(path,'rb').read(); ix=index(d); off,size=ix[name]; return unrle(d,off,size)[0]
def load(path):
    d=open(path,'rb').read(); ix=index(d)
    P,_=unrle(d,*ix['player.dat']); S,_=unrle(d,*ix['staff.dat'])
    pl={}
    for i in range(len(P)//70):
        o=i*70; pid,=struct.unpack_from('<i',P,o); ca,pa=struct.unpack_from('<hh',P,o+5); pl[pid]=(ca,pa)
    n=len(S)//110
    ref=97  # spillerreferencen i personposten (110 bytes) – bekræftet: Zidane 190/198, Verón, Raúl
    out={}
    for k in range(n):
        o=k*110; sid,=struct.unpack_from('<i',S,o); pr,=struct.unpack_from('<i',S,o+ref)
        if pr not in pl: continue
        day,year=struct.unpack_from('<hh',S,o+16); yob,=struct.unpack_from('<h',S,o+24)
        club,=struct.unpack_from('<i',S,o+57)
        y=year if 1900<year<2100 else yob
        out[sid]=dict(yob=y,club=club,ca=pl[pr][0],pa=pl[pr][1],pid=pr,first=struct.unpack_from('<i',S,o+4)[0],last=struct.unpack_from('<i',S,o+8)[0])
    return out, ref
if __name__ == '__main__':
    import statistics as st
    A,_=load(sys.argv[1]); B,_=load(sys.argv[2]); yA=int(sys.argv[3]) if len(sys.argv)>3 else 2001
    def band(a):
        return '<=18' if a<=18 else '19-20' if a<=20 else '21-23' if a<=23 else '24-28' if a<=28 else '29-31' if a<=31 else '32+'
    same={k:(A[k],B[k]) for k in A if k in B and A[k]['yob']==B[k]['yob'] and A[k]['first']==B[k]['first'] and A[k]['last']==B[k]['last']}
    gone=[k for k in A if k not in same]; new=[k for k in B if k not in same]
    print('A',len(A),'B',len(B),'same',len(same),'gone/reborn',len(gone),'new',len(new))
    def cnt(D,lo): return sum(1 for v in D.values() if v['ca']>=lo)
    print('CA150+ A',cnt(A,150),'B',cnt(B,150),' CA130+',cnt(A,130),cnt(B,130),' CA100+',cnt(A,100),cnt(B,100))
    print('free A',sum(1 for v in A.values() if v['club']<0),'B',sum(1 for v in B.values() if v['club']<0))
    rows={}
    for k,(a,b) in same.items():
        if a['ca']<100 or a['pa']<=0: continue
        age=yA-a['yob']; gap=max(1,a['pa']-a['ca'])
        rows.setdefault(band(age),[]).append((b['ca']-a['ca'], (b['ca']-a['ca'])/gap if a['pa']-a['ca']>=10 else None))
    for k in ['<=18','19-20','21-23','24-28','29-31','32+']:
        xs=rows.get(k,[]); 
        if not xs: continue
        d=sorted(x for x,_ in xs); f=sorted(y for _,y in xs if y is not None)
        print(f'age {k:6} n {len(xs):5} dCA median {st.median(d):5.1f} p10 {d[len(d)//10]:4} p90 {d[len(d)*9//10]:4}  share-of-gap median {st.median(f) if f else 0:.2f}')
    # young with PA>=150
    yg=[(b['ca']-a['ca'],a['pa']-a['ca']) for a,b in same.values() if yA-a['yob']<=20 and a['pa']>=150 and a['ca']>0]
    if yg: print('young PA150+ n',len(yg),'dCA median',st.median(x for x,_ in yg),'gap median',st.median(g for _,g in yg))
    nb=[B[k] for k in new]
    if nb:
        import collections
        print('new: ages',sorted(collections.Counter(yA+1-v['yob'] for v in nb).items())[:15])
        print('new: PA>=150',sum(1 for v in nb if v['pa']>=150),'CA median',st.median(v['ca'] for v in nb),'PA median',st.median(v['pa'] for v in nb))
