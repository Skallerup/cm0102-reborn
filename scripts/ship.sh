#!/bin/bash
# Udgiver agenters arbejde på main (= live). Se CLAUDE.md "Udgivelse af en agents arbejde".
#   Ét punkt:     scripts/ship.sh <gren|commit> "<ændringslog da>" "<ændringslog en>" [--new-game] [--log "<linje til RELEASE_LOG>"] [--no-e2e]
#   Flere punkter (ét typetjek, én testrunde, én e2e, ét push):
#                 scripts/ship.sh --item <gren|commit> "<da>" "<en>" [--new-game] [--log "<linje>"] --item … [--no-e2e]
#                 scripts/ship.sh --file punkter.json [--no-e2e]     (JSON: [{"ref": "…", "da": "…", "en": "…", "newGame": true, "log": "…"}, …])
#   --new-game/--log gælder punktet foran. Hvert punkt får sin egen ændringslogslinje og RELEASE_LOG-linje (i den givne rækkefølge).
# SHIP_DRY=1: alt undtagen push og oprydning.
# Tests (28/11): standard det hurtige værn `scripts/test.mjs fast` (faste vagter K3/K5/ændringslog/i18nAll/worldBuild/envDeterminism/låsetrin +
#   testfiler, der direkte importerer/nævner de ændrede filer; de tunge går til CI, der kører hele pakken efter push – tjek `gh run list -w ci.yml`).
#   --full-tests (eller SHIP_TIER=full): som før – alle `vitest related` for de ændrede src-filer.
# e2e: kun når noget, browseren kører, er ændret (src/, public/, index.html, vite.config.ts, package-lock.json, scripts/e2e.mjs), og den kører
#   samtidig med testene. --no-e2e: aldrig, --e2e: altid.
# Trin: cherry-pick (alle punkter; konflikt → meld punktet, nulstil main, intet push) → ændringslog i dagens version (ny version pr. dag)
#       + RELEASE_LOG → tsc → berørte tests (scripts/test.mjs: resultat-cachen) + K3/K5/ændringslog → én e2e (klassisk, original motor)
#       → commit → push → live-tjek → ryd worktree'erne. Stopper ved første fejl uden at pushe.
set -euo pipefail
export PATH="$HOME/.local/share/node/bin:$PATH"
cd "$(git rev-parse --show-toplevel)"
REFS=(); DAS=(); ENS=(); NGS=(); LOGS=(); E2E=auto; TIER=${SHIP_TIER:-fast}
add_item(){ REFS+=("$1"); DAS+=("$2"); ENS+=("$3"); NGS+=(0); LOGS+=(""); }
last(){ echo $(( ${#REFS[@]} - 1 )); }
if [ $# -gt 0 ] && [ "$1" != --item ] && [ "$1" != --file ]; then
  [ $# -ge 3 ] || { echo "brug: scripts/ship.sh <gren|commit> \"<da>\" \"<en>\" [--new-game] [--log …] [--no-e2e]  ·  --item …  ·  --file …"; exit 2; }
  add_item "$1" "$2" "$3"; shift 3
fi
while [ $# -gt 0 ]; do
  case "$1" in
    --item) [ $# -ge 4 ] || { echo "✗ --item kræver <gren|commit> \"<da>\" \"<en>\""; exit 2; }; add_item "$2" "$3" "$4"; shift 3;;
    --file) [ -f "${2:-}" ] || { echo "✗ --file: ${2:-} findes ikke"; exit 2; }
      PARSED=$(node -e '
        for (const x of JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"))) {
          for (const k of ["ref", "da", "en"]) if (!x[k]) throw new Error("punkt uden " + k + ": " + JSON.stringify(x));
          const c = (s) => String(s ?? "").replace(/[\t\n]/g, " ");
          console.log([c(x.ref), c(x.da), c(x.en), x.newGame ? 1 : 0, c(x.log)].join("\t"));
        }' "$2") || { echo "✗ --file: ugyldig JSON"; exit 2; }
      while IFS=$'\t' read -r r d e n l; do add_item "$r" "$d" "$e"; NGS[$(last)]=$n; LOGS[$(last)]=$l; done <<<"$PARSED"
      shift;;
    --new-game) [ ${#REFS[@]} -gt 0 ] || { echo "✗ --new-game før et punkt"; exit 2; }; NGS[$(last)]=1;;
    --log) [ ${#REFS[@]} -gt 0 ] || { echo "✗ --log før et punkt"; exit 2; }; LOGS[$(last)]=$2; shift;;
    --no-e2e) E2E=0;;
    --e2e) E2E=1;;
    --full-tests) TIER=full;;
    *) echo "ukendt flag $1"; exit 2;;
  esac; shift
done
N=${#REFS[@]}
[ $N -gt 0 ] || { echo "✗ ingen punkter"; exit 2; }
fail(){ echo "✗ $*"; echo "  (intet er pushet – main lokalt står efter cherry-pick; ret op eller 'git reset --hard origin/main')"; exit 1; }
[ "${SHIP_PARSE_ONLY:-0}" = 1 ] && { for i in "${!REFS[@]}"; do printf '%s|%s|%s|%s|%s\n' "${REFS[$i]}" "${DAS[$i]}" "${ENS[$i]}" "${NGS[$i]}" "${LOGS[$i]}"; done; echo "e2e=$E2E tier=$TIER"; exit 0; }   # kun til test af argumenterne

[ "$(git branch --show-current)" = main ] || { echo "✗ ikke på main"; exit 1; }
[ -z "$(git status --porcelain --untracked-files=no)" ] || { echo "✗ main har ikke-committede ændringer"; exit 1; }
git pull -q --ff-only
START=$(git rev-parse HEAD)

# 1) cherry-pick af alle punkter (gren: alle commits siden forgreningen; ellers én commit)
for i in "${!REFS[@]}"; do
  REF=${REFS[$i]}
  if git show-ref -q --verify "refs/heads/$REF"; then RANGE="$(git merge-base HEAD "$REF")..$REF"; else RANGE="$REF^..$REF"; fi
  B=$(git rev-parse HEAD)
  if ! git cherry-pick -x $RANGE >/dev/null 2>&1; then
    git cherry-pick --abort 2>/dev/null || true
    git reset -q --hard "$START"
    echo "✗ konflikt ved cherry-pick af punkt $((i + 1))/$N ($REF: $RANGE) – flet i hånden; main er sat tilbage til ${START:0:8}, intet er pushet"; exit 1
  fi
  echo "✓ cherry-pick $((i + 1))/$N $REF: $(git rev-list --count "$B"..HEAD) commit(s)"
done
CHANGED=$(git diff --name-only "$START"..HEAD)
echo "✓ cherry-pick: $(git rev-list --count "$START"..HEAD) commit(s), $(echo "$CHANGED" | wc -l | tr -d ' ') filer"

# 2) ændringslog + version + RELEASE_LOG
ITEMS=$(for i in "${!REFS[@]}"; do printf '%s\t%s\t%s\t%s\n' "${NGS[$i]}" "${DAS[$i]}" "${ENS[$i]}" "${LOGS[$i]}"; done)
VER=$(ITEMS="$ITEMS" node --input-type=module -e '
import fs from "node:fs";
const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Copenhagen" });
const p = "src/ui/changelogData.ts"; let s = fs.readFileSync(p, "utf8");
const j = (x) => JSON.stringify(x);
const items = process.env.ITEMS.split("\n").filter(Boolean).map((l) => {
  let [ng, da, en] = l.split("\t");
  if (ng === "1") { da = "⚠ Kræver et nyt spil: " + da; en = "⚠ Requires a new game: " + en; }
  return `      { da: ${j(da)}, en: ${j(en)} },\n`;
}).join("");
const m = s.match(/export const CHANGELOG: ChangelogEntry\[\] = \[\n  \{\n    version: \x27([\d.]+)\x27,\n    date: \x27([\d-]+)\x27,[\s\S]*?items: \[\n/);
if (!m) throw new Error("ændringsloggens top ikke fundet");
let ver = m[1];
if (m[2] === today) {
  s = s.replace(m[0], m[0] + items);
} else {
  const [a, b] = ver.split(".").map(Number); ver = `${a}.${b + 1}.0`;
  const entry = `  {\n    version: \x27${ver}\x27,\n    date: \x27${today}\x27,\n    title: { da: \x27Mere af det originale CM 01/02\x27, en: \x27More of the original CM 01/02\x27 },\n    items: [\n${items}    ],\n  },\n`;
  s = s.replace("export const CHANGELOG: ChangelogEntry[] = [\n", "export const CHANGELOG: ChangelogEntry[] = [\n" + entry);
  for (const f of ["package.json", "package-lock.json"]) {
    const t = fs.readFileSync(f, "utf8"); const old = JSON.parse(t).version;
    fs.writeFileSync(f, t.split(`"version": "${old}"`).join(`"version": "${ver}"`));
  }
}
fs.writeFileSync(p, s);
console.log(ver + " " + today);
')
read -r VERSION TODAY <<<"$VER"
# RELEASE_LOG: én linje pr. punkt (--log, ellers den danske linje), øverst, i punkternes rækkefølge
printf '%s\n' "$ITEMS" | python3 -c '
import sys; d,v=sys.argv[1:]; p="docs/RELEASE_LOG.md"; s=open(p).read()
lines=[l.rstrip("\n").split("\t") for l in sys.stdin if l.strip()]
new="".join(f"\n- {d} – Skudt live (v{v}): {(x[3] if len(x)>3 and x[3] else x[1])}" for x in lines)
i=s.index("\n- "); s=s[:i]+new+s[i:]; open(p,"w").write(s)
' "$TODAY" "$VERSION"
echo "✓ ændringslog v$VERSION ($N punkt(er))"

# 3) typetjek, tests og e2e (e2e i baggrunden samtidig med testene)
T0=$SECONDS; tm(){ echo "$(( SECONDS - ${1:-$T0} )) s"; }
if [ "$E2E" = auto ]; then
  if echo "$CHANGED" | grep -qE '^(src/|public/|index\.html$|vite\.config\.ts$|package-lock\.json$|scripts/e2e\.mjs$)'; then E2E=1; else E2E=0; echo "· e2e springes over (ingen ændring i src/, public/ o.l.)"; fi
fi
npx tsc --noEmit -p tsconfig.app.json || fail "tsc"
echo "✓ tsc ($(tm))"
E2E_PID=
if [ $E2E = 1 ]; then
  T_E2E=$SECONDS
  ( E2E_ENGINE=original PORT=5760 node scripts/e2e.mjs klassisk >/tmp/ship-e2e.$$ 2>&1; echo "rc=$? sek=$(( SECONDS - T_E2E ))" >>/tmp/ship-e2e.$$ ) &
  E2E_PID=$!
fi
T_TEST=$SECONDS
SRC=$(echo "$CHANGED" | grep -E '^src/.*\.tsx?$' || true)
TESTS=$(echo "$CHANGED" | grep -E '^tests/.*\.test\.tsx?$' || true)
testfail(){ tail -40 /tmp/ship-vitest.$$; [ -n "$E2E_PID" ] && { kill $E2E_PID 2>/dev/null; pkill -f "vite --port 5760" 2>/dev/null; }; fail "$1"; }
if [ "$TIER" = full ]; then
  node scripts/test.mjs run --testTimeout=120000 --dir tests tests/changelog.test.ts tests/textParity.test.ts tests/estimateBudget.test.ts $TESTS >/tmp/ship-vitest.$$ 2>&1 || testfail "faste tests/ændrede testfiler"
  if [ -n "$SRC" ]; then node scripts/test.mjs related --testTimeout=120000 --dir tests $SRC >>/tmp/ship-vitest.$$ 2>&1 || testfail "berørte tests"; fi
else
  # alle ændrede filer (også data, scripts, tests); ændringsloggen/versionen er med via vagterne
  node scripts/test.mjs fast --testTimeout=120000 --dir tests $CHANGED >/tmp/ship-vitest.$$ 2>&1 || testfail "hurtigt værn (scripts/test.mjs fast)"
fi
grep -E "Tests +[0-9]|test-cache:|test fast:" /tmp/ship-vitest.$$ | sed 's/^/  /' | cut -c1-400; rm -f /tmp/ship-vitest.$$
echo "✓ tests ($TIER, $(tm $T_TEST))"

# 4) e2e (startet ovenfor)
if [ -n "$E2E_PID" ]; then
  wait $E2E_PID || true
  grep -q "Alle ende-til-ende-tests bestået" /tmp/ship-e2e.$$ || { grep -E "✗" /tmp/ship-e2e.$$ | head; tail -5 /tmp/ship-e2e.$$; fail "e2e"; }
  echo "✓ e2e ($(sed -n 's/^rc=.* sek=//p' /tmp/ship-e2e.$$) s)"; rm -f /tmp/ship-e2e.$$
fi
echo "✓ tjek i alt $(tm)"

# 5) commit + push
git add src/ui/changelogData.ts package.json package-lock.json docs/RELEASE_LOG.md
git commit -q -m "v$VERSION: ændringslog og udgivelseslog

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
if [ "${SHIP_DRY:-0}" = 1 ]; then echo "(SHIP_DRY: ikke pushet)"; exit 0; fi
git push -q origin main || fail "push"
SHA=$(git rev-parse HEAD); echo "✓ pushet: ${SHA:0:8} (v$VERSION)"
# live = /build.json på cm0102reborn.com viser denne commit (eller en nyere, der indeholder den); Vercel kan være op til ~30 min om at bygge
LIVE=0
for i in $(seq 1 ${SHIP_LIVE_TRIES:-60}); do
  L=$(curl -s --max-time 10 https://cm0102reborn.com/build.json | sed -n 's/.*"sha":"\([0-9a-f]*\)".*/\1/p')
  if [ -n "$L" ] && git merge-base --is-ancestor "$SHA" "$L" 2>/dev/null; then LIVE=1; break; fi
  sleep 30
done
[ $LIVE = 1 ] && echo "✓ live: ${SHA:0:8} (v$VERSION)" || echo "⚠ pushet, men endnu ikke live efter $(( ${SHIP_LIVE_TRIES:-60} / 2 )) min (Vercel bygger stadig?)"

# 6) ryd worktree'erne for grenene
for REF in "${REFS[@]}"; do
  if git show-ref -q --verify "refs/heads/$REF"; then
    WT=$(git worktree list --porcelain | awk -v b="refs/heads/$REF" '/^worktree /{w=$2} $0=="branch "b{print w}')
    [ -n "$WT" ] && git worktree remove --force --force "$WT" 2>/dev/null && echo "✓ worktree fjernet ($REF)"
    git branch -D -q "$REF" 2>/dev/null || true
  fi
done
