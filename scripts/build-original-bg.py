#!/usr/bin/env python3
"""Konverterer CM 01/02's originale baggrundsbilleder (Pictures/*.RGN + pics.cfg) til JPEG.
RGN: 0x30 bytes header (u32 bredde, u32 hoejde, u32 bytes), derefter RGB565 (lille-endian) raekkevis.
Brug: python3 scripts/build-original-bg.py [Pictures-mappe]
Skriver public/original-bg/<navn>.jpg og public/data/original-bg.json."""
import sys, os, struct, json, re
from PIL import Image

SRC = sys.argv[1] if len(sys.argv) > 1 else "/Applications/CM 01-02 Bosman Edition.app/Contents/Resources/game/Pictures"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public/original-bg")
os.makedirs(OUT, exist_ok=True)


def conv(path):
    d = open(path, "rb").read()
    w, h, n = struct.unpack_from("<3I", d, 0)
    px = d[0x30:0x30 + w * h * 2]
    assert len(px) == w * h * 2, path
    rgb = bytearray(w * h * 3)
    for i in range(w * h):
        v = px[2 * i] | (px[2 * i + 1] << 8)
        r, g, b = (v >> 11) & 31, (v >> 5) & 63, v & 31
        rgb[3 * i] = (r << 3) | (r >> 2)
        rgb[3 * i + 1] = (g << 2) | (g >> 4)
        rgb[3 * i + 2] = (b << 3) | (b >> 2)
    return Image.frombytes("RGB", (w, h), bytes(rgb))


files = {}
for f in sorted(os.listdir(SRC)):
    if f.lower().endswith(".rgn"):
        files[f.lower()[:-4]] = f
total = 0
for key, f in files.items():
    im = conv(os.path.join(SRC, f))
    p = os.path.join(OUT, key + ".jpg")
    im.save(p, "JPEG", quality=80, optimize=True, progressive=True)
    total += os.path.getsize(p)

cfg = {}
sec = None
for line in open(os.path.join(SRC, "pics.cfg"), encoding="latin-1"):
    line = line.strip()
    if not line or line.startswith("#"):
        continue
    m = re.match(r"\[(\w+)\]$", line)
    if m:
        sec = m.group(1)
        cfg[sec] = {}
        continue
    if sec and ":" in line:
        k, v = line.split(":", 1)
        cfg[sec][k.strip()] = [x.strip().lower().removesuffix(".rgn") for x in v.split(",") if x.strip()]

out = {"base": "/original-bg/", "ext": ".jpg", "files": sorted(files.keys()), "cfg": cfg}
json.dump(out, open(os.path.join(ROOT, "public/data/original-bg.json"), "w"), separators=(",", ":"))
print(len(files), "billeder,", round(total / 1e6, 2), "MB")
