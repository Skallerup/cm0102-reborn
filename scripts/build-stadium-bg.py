#!/usr/bin/env python3
"""Stadionbaggrunde på kampdage (klassisk tema), som [STADIUMS] i CM 01/02's pics.cfg.

Kilde: Naydav's CM0102 1280x800 Background Image Pack (https://github.com/naydav/CM0102-Pictures, credit i Credits).
Pakkens pics.cfg knytter billeder (.RGN, 1280x800 RGB565) til stadionnavne fra 2025-databasen. Vi matcher hver
klubs stadion i begge vores databaser og konverterer de billeder, der bruges, til JPEG i public/stadiums/.

Match: 1) navnet (uden accenter), 2) stadion-id'et i filnavnet (`__s__12`) mod den moderne databases stadium.dat,
3) den originale database: samme klub i den moderne database (omdøbte stadioner, fx Walkers Stadium → King Power).

Kør: python3 scripts/build-stadium-bg.py <moderne Data-mappe> <original Data-mappe>
     (fx .data-update/"October 2026 Data Update" og .orig-db/Original-3.9.68-Database efter npm run data:fetch)
Skriver public/data/stadium-bg.json: { stadionnavn: [billednavn, …] } (billederne ligger i public/stadiums/<navn>.webp).
"""
import concurrent.futures, json, os, re, struct, sys, unicodedata, urllib.request

import numpy as np
from PIL import Image

RAW = "https://raw.githubusercontent.com/naydav/CM0102-Pictures/main/"
OUT = "public/stadiums"
W, H = 1280, 800


def norm(s: str) -> str:
    s = unicodedata.normalize("NFKD", s.replace("ø", "o").replace("Ø", "O").replace("æ", "ae").replace("ß", "ss"))
    s = "".join(c for c in s if not unicodedata.combining(c)).lower()
    s = re.sub(r"^the\s+", "", s)
    return re.sub(r"[^a-z0-9]+", "", s)


def stadium_dat(path):
    b = open(path, "rb").read()
    out = {}
    for o in range(0, len(b) - 77, 78):
        out[struct.unpack_from("<i", b, o)[0]] = b[o + 4:o + 55].split(b"\0")[0].decode("latin-1").strip()
    return out


def club_stadiums(path):
    """klub-id → stadion-id (club.dat: stadion på byte 105, som i src/game/data/cm0102.ts)"""
    b = open(path, "rb").read()
    out = {}
    for o in range(0, len(b) - 580, 581):
        out[struct.unpack_from("<i", b, o)[0]] = struct.unpack_from("<i", b, o + 105)[0]
    return out


def pack_stadiums():
    raw = urllib.request.urlopen(RAW + "pics.cfg", timeout=60).read().decode("latin-1")
    sec, st = None, {}
    for line in raw.splitlines():
        line = line.strip()
        if line.startswith("["):
            sec = line
        elif sec == "[STADIUMS]" and ":" in line and not line.startswith("#"):
            k, v = line.split(":", 1)
            st[k.strip()] = [x.strip() for x in v.split(",") if x.strip()]
    return st


def convert(path):
    name = os.path.splitext(os.path.basename(path))[0].lower()
    dest = f"{OUT}/{name}.webp"
    if not os.path.exists(dest):
        b = urllib.request.urlopen(RAW + urllib.request.quote(path), timeout=120).read()
        w, h = struct.unpack_from("<2i", b, 0)
        a = np.frombuffer(b[48:48 + w * h * 2], dtype="<u2").reshape(h, w)
        rgb = np.dstack([((a >> 11) & 31) * 255 // 31, ((a >> 5) & 63) * 255 // 63, (a & 31) * 255 // 31]).astype("uint8")
        Image.fromarray(rgb).resize((1024, 640), Image.LANCZOS).save(dest, "WEBP", quality=68, method=6)
    return name


def main():
    modern_dir, orig_dir = sys.argv[1], sys.argv[2]
    pack = pack_stadiums()
    by_name = {norm(k): v for k, v in pack.items()}
    by_id = {}
    for files in pack.values():
        for f in files:
            m = re.search(r"__s__(\d+)", f)
            if m:
                by_id.setdefault(int(m.group(1)), files)

    m_st, m_cl = stadium_dat(f"{modern_dir}/stadium.dat"), club_stadiums(f"{modern_dir}/club.dat")
    o_st, o_cl = stadium_dat(f"{orig_dir}/stadium.dat"), club_stadiums(f"{orig_dir}/club.dat")

    def modern_files(sid):
        return by_name.get(norm(m_st.get(sid, ""))) or by_id.get(sid)

    want = {}  # stadionnavn (som i vores data) → pakkens filer
    for cid, sid in m_cl.items():
        n = m_st.get(sid)
        if n and (f := modern_files(sid)):
            want[n] = f
    for cid, sid in o_cl.items():
        n = o_st.get(sid)
        if not n or n in want:
            continue
        f = by_name.get(norm(n)) or (modern_files(m_cl[cid]) if cid in m_cl else None)
        if f:
            want[n] = f

    os.makedirs(OUT, exist_ok=True)
    files = sorted({f for fs in want.values() for f in fs})
    print(f"{len(want)} stadioner, {len(files)} billeder", file=sys.stderr)
    with concurrent.futures.ThreadPoolExecutor(8) as ex:
        names = dict(zip(files, ex.map(convert, files)))
    out = {n: [names[f] for f in fs] for n, fs in sorted(want.items())}
    with open("public/data/stadium-bg.json", "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, separators=(",", ":"))


if __name__ == "__main__":
    main()
