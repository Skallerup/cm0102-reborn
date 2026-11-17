#!/usr/bin/env python3
"""Oraklets hukommelsesbilleder dag for dag (eller pr. uge) en hel sæson frem – til scripts/cm-day-lockstep.ts.

    python3 -I scripts/oracle-day-snaps.py [--seed 1] [--database 3.9.60] [--from 2001-07-14] [--to 2002-06-30] [--every 1]
                                           [--out ~/cm0102-engine/oracle/daysnap/s1-3.9.60-e1] [--par 2]
    (kør via node scripts/measure.mjs --oracle -- python3 -I scripts/oracle-day-snaps.py …, uden for sandkassen)

Binæren er sporbinæren ~/cm0102-engine/.bosman-ct/build/cm0102_recomp (Bosman 0.6.1 + sn_trace.c), kørt af
~/cm0102-engine/tools/ct/run_season_ct.py (samme trin som oraklet: nyt spil, England, "Test Smoke", Arsenal, ferie; databasestørrelse
som oraklet). sn_trace.c dumper hele hukommelsen (.data 0x967000–0xde7000 + bunken + stakken) lige FØR CONTRACT_MANAGER::daily_update
0x4c7ac0(dato, 2, 1) på RECOMP_SNAP_DAYS (højst 64 dage pr. kørsel – derfor flere kørsler à 63 dage; frøet er fast, så kørslerne er ens).
post-billedet og rand/kald-loggen springes over: der oprettes en MAPPE med deres filnavne, så fopen fejler.
Lager (~1,5 GB for en sæson pr. dag): nøglebillede pr. 7. dag `k-<iso>.zst` (zstd -3, ~14 MB) og de andre dage `p-<iso>.zst` =
zstd --patch-from mod ugens nøglebillede (~1–3 MB). index.json beskriver filerne. Indlæsning: scripts/oracle-days.ts.
"""
import datetime as dt
import hashlib
import json
import os
import shutil
import subprocess
import sys
import threading
import time

E = os.path.expanduser("~/cm0102-engine")
PROGRAM = os.path.join(E, ".bosman-ct/build/cm0102_recomp")
RUNNER = os.path.join(E, "tools/ct/run_season_ct.py")
RUNS = os.path.join(E, "oracle/runs")
ZSTD = shutil.which("zstd") or "/opt/homebrew/bin/zstd"
GAME_START = dt.date(2001, 7, 14)
CHUNK = 63


def arg(name, default):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else default


def doy(d):
    return (d - dt.date(d.year, 1, 1)).days


def main():
    seed = int(arg("--seed", "1"))
    db = arg("--database", "3.9.60")
    d0 = dt.date.fromisoformat(arg("--from", "2001-07-14"))
    d1 = dt.date.fromisoformat(arg("--to", "2002-06-30"))
    every = int(arg("--every", "1"))
    par = int(arg("--par", "2"))
    out = os.path.abspath(os.path.expanduser(arg("--out", os.path.join(E, f"oracle/daysnap/s{seed}-{db}-e{every}"))))
    dates = []
    d = d0
    while d <= d1:
        dates.append(d)
        d += dt.timedelta(days=every)
    os.makedirs(out, exist_ok=True)
    # nøglebillede: hver 7. billede (ved --every ≥ 7 er alle nøglebilleder)
    key_of = {}
    for i, x in enumerate(dates):
        key_of[x] = x if every >= 7 or i % 7 == 0 else key_of[dates[i - 1]]
    chunks = [dates[i:i + CHUNK] for i in range(0, len(dates), CHUNK)]
    tag = f"ds{seed}-{db}-e{every}"
    index = {}
    idx_path = os.path.join(out, "index.json")
    if os.path.exists(idx_path):
        index = {s["iso"]: s for s in json.load(open(idx_path))["snaps"]}
    lock = threading.Lock()

    def run_chunk(ci, ch):
        todo = [x for x in ch if x.isoformat() not in index]
        if not todo:
            print(f"kørsel {ci}: alle {len(ch)} billeder findes", flush=True)
            return 0
        raw = os.path.join(out, f"raw-{ci}")
        shutil.rmtree(raw, ignore_errors=True)
        os.makedirs(raw)
        for x in ch:
            os.makedirs(os.path.join(raw, f"post-{doy(x)}-{x.year}.bin"))
            os.makedirs(os.path.join(raw, f"log-{doy(x)}-{x.year}.txt"))
        run = os.path.join(RUNS, f"{tag}-{ci}")
        days = (ch[-1] - GAME_START).days + 4
        env = dict(os.environ, RECOMP_SNAP=raw, RECOMP_SNAP_DAYS=",".join(f"{doy(x)}:{x.year}" for x in ch))
        t0 = time.time()
        p = subprocess.Popen([sys.executable, "-I", RUNNER, "--seed", str(seed), "--days", str(days), "--database", db,
                              "--run", run, "--program", PROGRAM], env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        pend = list(ch)

        def ready(x, done):
            f = os.path.join(raw, f"pre-{doy(x)}-{x.year}.bin")
            if not os.path.exists(f):
                return None
            j = ch.index(x)
            if done or any(os.path.exists(os.path.join(raw, f"pre-{doy(y)}-{y.year}.bin")) for y in ch[j + 1:]):
                return f
            return None

        def compress(x, f):
            k = key_of[x]
            iso = x.isoformat()
            if k == x:
                dst = os.path.join(out, f"k-{iso}.zst")
                subprocess.run([ZSTD, "-q", "-f", "-3", "-T2", f, "-o", dst], check=True)
                os.rename(f, os.path.join(raw, f"key-{iso}.bin"))
                ent = {"iso": iso, "kind": "k", "file": os.path.basename(dst)}
            else:
                kraw = os.path.join(raw, f"key-{k.isoformat()}.bin")
                dst = os.path.join(out, f"p-{iso}.zst")
                subprocess.run([ZSTD, "-q", "-f", "-3", f"--patch-from={kraw}", f, "-o", dst], check=True)
                os.remove(f)
                ent = {"iso": iso, "kind": "p", "file": os.path.basename(dst), "key": k.isoformat()}
            ent["bytes"] = os.path.getsize(dst)
            with lock:
                index[iso] = ent

        while pend:
            done = p.poll() is not None
            x = pend[0]
            f = ready(x, done)
            if f:
                compress(x, f)
                pend.pop(0)
                # nøglebilleder, hvis uge er færdig, slettes
                for kf in os.listdir(raw):
                    if kf.startswith("key-"):
                        kd = dt.date.fromisoformat(kf[4:14])
                        if all(key_of[y] != kd for y in pend):
                            os.remove(os.path.join(raw, kf))
                continue
            if done:
                break
            time.sleep(1)
        outp = p.communicate()[0]
        print(f"kørsel {ci} ({ch[0]} → {ch[-1]}): {outp.strip()} – {len(ch) - len(pend)} billeder, {time.time() - t0:.0f} s", flush=True)
        if pend:
            print(f"  MANGLER {len(pend)}: {pend[0]} …", flush=True)
        if ci == len(chunks) - 1 and os.path.isdir(os.path.join(run, "files")):
            shutil.copytree(os.path.join(run, "files"), os.path.join(out, "files"), dirs_exist_ok=True)
            shutil.copyfile(os.path.join(run, "stderr.txt"), os.path.join(out, "stderr-last.txt"))
        shutil.rmtree(run, ignore_errors=True)
        shutil.rmtree(raw, ignore_errors=True)
        return 1 if pend else 0

    threads, res = [], []
    sem = threading.Semaphore(par)

    def worker(ci, ch):
        with sem:
            res.append(run_chunk(ci, ch))

    for ci, ch in enumerate(chunks):
        t = threading.Thread(target=worker, args=(ci, ch))
        t.start()
        threads.append(t)
    for t in threads:
        t.join()
    sha = hashlib.sha256(open(PROGRAM, "rb").read()).hexdigest()
    snaps = sorted(index.values(), key=lambda s: s["iso"])
    json.dump({"seed": seed, "database": db, "club": "Arsenal", "every": every, "program": PROGRAM, "program_sha256": sha,
               "taken": "pre 0x4c7ac0(dato, 2, 1)", "snaps": snaps}, open(idx_path, "w"), indent=1)
    # sæsonens kampe fra SAMME kørsel (frø 1 i en anden binær/kørsel – fx out/season-s1a.json – er et andet spil): extract.py på den sidste
    # kørsels filer; navnene fra rt-id'erne (extract.py giver ingen navne, når fixtures_2002.tmp også har næste sæsons hold)
    files = os.path.join(out, "files")
    if os.path.isdir(files):
        sj = os.path.join(out, "season.json")
        subprocess.run([sys.executable, "-I", os.path.join(E, "oracle/tools/extract.py"), files, os.path.join(E, "oracle/game/Data-3.9.60"), sj], check=True,
                       stdout=subprocess.DEVNULL)
        a = json.load(open(sj))
        nm = {}
        for m in json.load(open(os.path.join(E, "oracle/out/season-s1a.json")))["matches"]:
            nm[m["home"]], nm[m["away"]] = m["home_name"], m["away_name"]
        a["matches"] = [m for m in a["matches"] if (m["year"], m["day"]) <= (d1.year, doy(d1))]
        for m in a["matches"]:
            m["home_name"], m["away_name"] = m["home_name"] or nm.get(m["home"]), m["away_name"] or nm.get(m["away"])
        json.dump(a, open(sj, "w"), indent=1, ensure_ascii=False)
    tot = sum(s["bytes"] for s in snaps)
    print(f"{len(snaps)} billeder i {out} ({tot / 1e6:.0f} MB)")
    return 1 if any(res) else 0


if __name__ == "__main__":
    sys.exit(main())
