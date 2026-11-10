#!/usr/bin/env python3
"""Baggrunde pr. skærm i det klassiske tema (som CM 01/02's pics.cfg: [CLUBS], [COMPS], [NATIONS], [TRAINING], [BOARDROOM], [TRANSFER]).

Kilde: Naydav's CM0102 1280x800 Background Image Pack (https://github.com/naydav/CM0102-Pictures, credit i Credits) – kun mappen naydav/
(origin/ er SI's egne billeder, russtas/ spillerportrætter). Navnene matches mod klubberne og ligaerne i begge vores databaser.
Klubber: ét billede pr. klub i de spilbare ligaer (rækker ≤ 2), helst et foto ("common"). Turneringer: op til tre. Lande: ét.
Kør: python3 scripts/build-screen-bg.py  → public/screens/*.jpg + public/data/screen-bg.json
"""
import concurrent.futures, json, os, re, struct, sys, unicodedata, urllib.parse, urllib.request

import numpy as np
from PIL import Image

RAW = "https://raw.githubusercontent.com/naydav/CM0102-Pictures/main/"
OUT = "public/screens"
ROOT = os.path.join(os.path.dirname(__file__), "..")


def norm(s):
    s = unicodedata.normalize("NFKD", s.replace("ø", "o").replace("Ø", "O").replace("æ", "ae").replace("ß", "ss"))
    s = "".join(c for c in s if not unicodedata.combining(c)).lower()
    s = re.sub(r"^the\s+", "", s)
    return re.sub(r"[^a-z0-9]+", "", s)


def sections():
    raw = urllib.request.urlopen(RAW + "pics.cfg", timeout=60).read().decode("latin-1")
    out, sec = {}, None
    for line in raw.splitlines():
        line = line.strip()
        if line.startswith("["):
            sec = line.strip("[]"); out[sec] = {}
        elif sec and ":" in line and not line.startswith("#"):
            k, v = line.split(":", 1)
            files = [x.strip().strip("{}") for x in v.split(",") if x.strip().strip("{}").startswith("naydav/")]
            if files: out[sec][k.strip()] = files
    return out


def convert(path):
    name = os.path.splitext(os.path.basename(path))[0].lower()
    dest = f"{OUT}/{name}.jpg"
    if not os.path.exists(dest):
        b = urllib.request.urlopen(RAW + urllib.parse.quote(path), timeout=180).read()
        w, h = struct.unpack_from("<2i", b, 0)
        a = np.frombuffer(b[48:48 + w * h * 2], dtype="<u2").reshape(h, w)
        rgb = np.dstack([((a >> 11) & 31) * 255 // 31, ((a >> 5) & 63) * 255 // 63, (a & 31) * 255 // 31]).astype("uint8")
        Image.fromarray(rgb).resize((1024, 640), Image.LANCZOS).save(dest, quality=72, optimize=True, progressive=True)
        print(name, file=sys.stderr, flush=True)
    return name


# gængse klubord, der ikke skiller klubber ad ("Aberdeen FC" = "Aberdeen", "AZ Alkmaar" ~ "AZ")
TOKENS = {"fc", "afc", "cf", "sc", "ac", "as", "bk", "fk", "if", "sk", "club", "cd", "ud", "rc", "sv", "vfb", "vfl", "tsg", "ssc", "ss", "us", "calcio", "football", "futbol", "clube", "sport", "sporting", "boldklub", "boldspilklub", "ff", "kv", "krc", "rsc", "kaa", "1", "the"}


def loose(s):
    s = unicodedata.normalize("NFKD", s); s = "".join(c for c in s if not unicodedata.combining(c)).lower()
    return "".join(w for w in re.split(r"[^a-z0-9]+", s) if w and w not in TOKENS)


def ours():
    clubs, comps, nations = {}, set(), set()
    for f in ("world.json", "world-original.json"):
        w = json.load(open(os.path.join(ROOT, "public", "data", f)))
        tiers = {l["id"]: l["tier"] for l in w["leagues"]}
        for c in w["clubs"]:
            if tiers.get(c[4], 9) <= 2: clubs[c[1]] = c[2]
        for l in w["leagues"]:
            comps.add(l["name"])
        for n in w["nations"]: nations.add(n["name"] if isinstance(n, dict) else n)
    return clubs, comps, nations


def prefer(files, n):
    # fotos ("common-N") før strukturer (fabric/leather/…)
    return sorted(files, key=lambda f: (0 if "common" in f else 1, f))[:n]


def main():
    sec = sections()
    clubs, comps, nations = ours()
    want = {"clubs": {}, "comps": {}, "nations": {}}
    cl = {norm(k): v for k, v in sec.get("CLUBS", {}).items()}
    cl2 = {}
    for k, v in sec.get("CLUBS", {}).items(): cl2.setdefault(loose(k), v)
    for c, short in clubs.items():
        f = cl.get(norm(c)) or cl.get(norm(short)) or cl2.get(loose(c)) or cl2.get(loose(short))
        if f: want["clubs"][c] = prefer(f, 1)
    # turneringer: alle pakkens (vores ligaer og pokaler hedder som pakkens CM-navne); lande: dem vi har
    for k, v in sec.get("COMPS", {}).items(): want["comps"][k] = prefer(v, 3)
    na = {norm(k): v for k, v in sec.get("NATIONS", {}).items()}
    for n in nations:
        f = na.get(norm(n))
        if f: want["nations"][n] = prefer(f, 1)
    for s in ("TRAINING", "BOARDROOM", "TRANSFER"):
        want[s.lower()] = {"Misc": sec.get(s, {}).get("Misc", [])}
    os.makedirs(OUT, exist_ok=True)
    files = sorted({f for g in want.values() for fs in g.values() for f in fs})
    print(f"{len(want['clubs'])} klubber, {len(want['comps'])} turneringer, {len(want['nations'])} lande, {len(files)} billeder", file=sys.stderr)
    with concurrent.futures.ThreadPoolExecutor(8) as ex:
        names = dict(zip(files, ex.map(convert, files)))
    out = {g: ({k: [names[f] for f in fs] for k, fs in sorted(v.items())} if g in ("clubs", "comps", "nations") else [names[f] for f in v.get("Misc", [])]) for g, v in want.items()}
    json.dump(out, open(os.path.join(ROOT, "public", "data", "screen-bg.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("færdig", file=sys.stderr)


if __name__ == "__main__":
    main()
