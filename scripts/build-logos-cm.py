#!/usr/bin/env python3
"""Logoer til CM 01/02-databaserne (world.json og world-original.json) – skrives som "named" i public/data/logos.json.

CM-klubber har ingen Transfermarkt-id, så spillet matcher logoer på klubnavn (src/ui/logos.ts). Dette script laver
matchet på forhånd og mere grundigt end i browseren:
  1) hele luukhopman/football-logos (alle sæsoner, nyeste først) – land for land, fuzzy på navnet
  2) TheSportsDB for klubber uden for pakken (Sydamerika, Mexico, Asien, MLS, Australien …), søgt på klubnavnet
Eksisterende "named"-poster bevares. Kør: python3 scripts/build-logos-cm.py [--sportsdb]
"""
import difflib, json, re, subprocess, sys, time, unicodedata, urllib.parse, urllib.request

REPO = "luukhopman/football-logos"
CDN = f"https://cdn.jsdelivr.net/gh/{REPO}@master/"
COUNTRY = {"Holland": "Netherlands", "Turkey": "Türkiye"}
# tokens uden betydning for et navnematch
STOP = set("fc cf ac sc cp sv vfl vfb bsc fk if bk sk rc cd ud ssc as ssd club clube futebol calcio football the de do da "
           "afc rcd hnk nk sl kv kfc krc rsc tsv spvgg pfc fsv sd ca cs us ss ks gks bv ik ifk aik sk fotball fodbold "
           "boldklub boldklubben futbol royal real".split())
ALIAS = {"internazionale": "inter milan", "sporting clube de portugal": "sporting cp", "borussia m'gladbach": "borussia monchengladbach",
         "olympiakos piraeus": "olympiacos", "aris salonika": "aris thessaloniki", "iraklis salonika": "iraklis", "pas giannena": "pas giannina",
         "girondins de bordeaux": "g. bordeaux", "aalborg boldspilklub": "aalborg bk", "aarhus gymnastik forening": "aarhus gf",
         "esbjerg forenede boldklubber": "esbjerg fb", "red bull salzburg": "red bull salzburg", "dinamo moscow": "dynamo moscow",
         "fc lucerne": "fc luzern", "bsc young boys bern": "bsc young boys", "wisla kraków": "wisla krakow"}


# forkerte navnematch (en anden klub med lignende navn) – findes ikke i pakken
DENY = {"Polonia Warszawa", "NK Zagreb", "FC Aarhus", "Vitória Futebol Clube", "FC Torpedo-ZiL Moscow", "Malatyaspor", "Gaziantepspor"}


def norm(s: str) -> str:
    s = s.lower().replace("ø", "o").replace("æ", "ae").replace("å", "a").replace("ß", "ss").replace("&", " and ")
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r"[.'’\-/()]", " ", s)
    return " ".join(w for w in s.split() if w not in STOP and not re.fullmatch(r"(18|19|20)\d\d", w)).strip()


def tree():
    out = subprocess.run(["gh", "api", f"repos/{REPO}/git/trees/HEAD?recursive=1", "--jq", ".tree[].path"], capture_output=True, text=True, check=True).stdout
    paths = [p for p in out.splitlines() if p.endswith(".png")]
    rank = lambda p: "9999" if p.startswith("logos/") else (re.search(r"history/(\d{4})", p) or [None, "0"])[1]
    return sorted(paths, key=rank, reverse=True)


# spillets eget navnematch (src/ui/logos.ts) – klubber, der allerede har et logo, røres ikke
_RT_STOP = set("fc cf ac sc cp sv vfl vfb bsc fk if bk sk rc cd ud ssc as ssd club clube futebol calcio football sporting de do da the".split())
_RT_ALIAS = {"kobenhavn": "copenhagen", "munchen": "munich", "wien": "vienna", "praha": "prague", "milano": "milan", "genova": "genoa",
             "moskva": "moscow", "beograd": "belgrade", "bucuresti": "bucharest"}


def rt_norm(s: str) -> str:
    s = s.lower().replace("ø", "o").replace("æ", "ae").replace("å", "a").replace("ß", "ss")
    s = "".join(c for c in unicodedata.normalize("NFD", s) if not unicodedata.combining(c))
    s = re.sub(r"[.'’\-/]", " ", s)
    return " ".join(_RT_ALIAS.get(w, w) for w in s.split() if w and w not in _RT_STOP and not re.fullmatch(r"(18|19|20)\d\d", w)).strip()


def runtime_has(logos, name, short):
    keys = [(rt_norm(p.split("/")[-1][:-4]), p) for p in logos["logos"].values()]
    idx = {k for k, _ in keys if k}
    n, sh = rt_norm(name), rt_norm(short)
    if n in idx or sh in idx:
        return True
    for q in (sh, n):
        if len(q) >= 4 and len([1 for k, _ in keys if k == q or k.endswith(" " + q)]) == 1:
            return True
    return False


_SDB_STOP = set("fc cf ac sc cd ca club clube de do da del la el y the futebol futbol football esporte sport sporting e associacao atletico deportivo".split())


def _toks(s: str):
    s = "".join(c for c in unicodedata.normalize("NFKD", s.lower()) if not unicodedata.combining(c))
    return [w for w in re.split(r"[^a-z0-9]+", s) if w and w not in _SDB_STOP and not w.isdigit()]


def sdb_ok(ours: str, theirs: str) -> bool:
    """TheSportsDB-holdets navn skal passe til vores (alle ord genfindes) – og aldrig et kvindehold.
    Omdøbte klubber (fx Akademisk Boldklub → AB Gladsaxe) afvises her og må lægges ind i hånden."""
    if re.search(r"\bwomen\b|femenin|ladies", theirs.lower()):
        return False
    a, b = _toks(ours), _toks(theirs)
    return all(any(w == x or (len(w) >= 4 and len(x) >= 4 and (difflib.SequenceMatcher(None, w, x).ratio() >= 0.8 or x.startswith(w) or w.startswith(x))) for x in a) for w in b)


def score(a: str, b: str) -> float:
    if not a or not b:
        return 0
    if a == b:
        return 1
    r = difflib.SequenceMatcher(None, a, b).ratio()
    ta, tb = set(a.split()), set(b.split())
    if ta and tb and (ta <= tb or tb <= ta):
        r = max(r, 0.86)
    return r


def main():
    use_sdb = "--sportsdb" in sys.argv
    logos = json.load(open("public/data/logos.json", encoding="utf-8"))
    named = logos.get("named", {})
    paths = tree()
    by_country = {}
    for p in paths:
        m = re.search(r"/([^/]+?) - [^/]+/([^/]+)\.png$", p)
        if m:
            by_country.setdefault(m.group(1), []).append((norm(m.group(2)), p))
    existing = set()
    for p in list(logos["logos"].values()):
        existing.add(norm(p.split("/")[-1][:-4]))
    report, todo = [], []
    seen = set()
    for f in ["public/data/world.json", "public/data/world-original.json"]:
        w = json.load(open(f, encoding="utf-8"))
        tier = {l["id"]: l.get("tier", 9) for l in w["leagues"]}
        for cid, name, short, nation, league, *_ in sorted(w["clubs"], key=lambda c: tier.get(c[4], 9)):
            if name in named or name in seen or runtime_has(logos, name, short):
                continue
            seen.add(name)
            country = w["nations"][nation]["name"]
            cands = [norm(ALIAS.get(name.lower(), name)), norm(short)]
            pool = by_country.get(COUNTRY.get(country, country))
            if pool is None:
                todo.append((name, short, country))
                continue
            best, bs = None, 0.0
            for key, p in pool:
                s = max(score(c, key) for c in cands)
                if s > bs:
                    best, bs = p, s
            if bs >= 0.8 and name not in DENY:
                named[name] = CDN + "/".join(urllib.parse.quote(x) for x in best.split("/"))
                report.append(f"{bs:.2f}  {country:12} {name:40} → {best.split('/')[-1]}")
            else:
                todo.append((name, short, country))
    print("\n".join(sorted(report)), file=sys.stderr)
    print(f"pakken: {len(report)} nye", file=sys.stderr)
    if use_sdb:
        # gemmer løbende i en cache (navn → url eller "" = ikke fundet), så en afbrudt kørsel kan fortsætte
        cache_file = ".sources/sportsdb-cache.json"
        try:
            cache = json.load(open(cache_file, encoding="utf-8"))
        except (FileNotFoundError, ValueError):
            cache = {}
        hits = 0
        for n, (name, short, country) in enumerate(todo):
            if name not in cache:
                cache[name] = ""
                want = {"United States": "USA", "Holland": "Netherlands"}.get(country, country)
                for q in dict.fromkeys([short, name]):
                    d = None
                    for attempt in range(4):
                        try:
                            u = "https://www.thesportsdb.com/api/v1/json/123/searchteams.php?t=" + urllib.parse.quote(q)
                            d = json.load(urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "cm0102reborn"}), timeout=20))
                            break
                        except Exception:
                            time.sleep(20)
                    time.sleep(2.1)
                    ts = [t for t in ((d or {}).get("teams") or []) if t.get("strSport") == "Soccer" and t.get("strCountry") == want and t.get("strBadge") and sdb_ok(name, t["strTeam"])]
                    if ts:
                        cache[name] = ts[0]["strBadge"] + "/small"
                        print(f"sdb   {country:12} {name:40} → {ts[0]['strTeam']}", file=sys.stderr, flush=True)
                        break
                if n % 10 == 0:
                    json.dump(cache, open(cache_file, "w", encoding="utf-8"), ensure_ascii=False)
            if cache[name]:
                named[name] = cache[name]
                hits += 1
        json.dump(cache, open(cache_file, "w", encoding="utf-8"), ensure_ascii=False)
        print(f"TheSportsDB: {hits} af {len(todo)}", file=sys.stderr)
    logos["named"] = dict(sorted(named.items()))
    json.dump(logos, open("public/data/logos.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))


if __name__ == "__main__":
    main()
