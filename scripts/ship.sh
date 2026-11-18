#!/bin/bash
# Udgiver en agents arbejde på main (= live). Se CLAUDE.md "Udgivelse af en agents arbejde".
#   scripts/ship.sh <gren|commit> "<ændringslog da>" "<ændringslog en>" [--new-game] [--no-e2e] [--log "<linje til RELEASE_LOG>"]
# SHIP_DRY=1: alt undtagen push og oprydning.
# Trin: cherry-pick → ændringslog i dagens version (ny version pr. dag) + RELEASE_LOG → tsc → berørte tests + K3/K5/ændringslog
#       → én e2e (klassisk, original motor) → commit → push → ryd worktree'en. Stopper ved første fejl uden at pushe.
set -euo pipefail
export PATH="$HOME/.local/share/node/bin:$PATH"
cd "$(git rev-parse --show-toplevel)"
REF=${1:?gren eller commit}; DA=${2:?dansk linje}; EN=${3:?engelsk linje}; shift 3
NEWGAME=0; E2E=1; LOG=""
while [ $# -gt 0 ]; do case "$1" in --new-game) NEWGAME=1;; --no-e2e) E2E=0;; --log) LOG=$2; shift;; *) echo "ukendt flag $1"; exit 2;; esac; shift; done
fail(){ echo "✗ $*"; echo "  (intet er pushet – main lokalt står efter cherry-pick; ret op eller 'git reset --hard origin/main')"; exit 1; }

[ "$(git branch --show-current)" = main ] || { echo "✗ ikke på main"; exit 1; }
[ -z "$(git status --porcelain --untracked-files=no)" ] || { echo "✗ main har ikke-committede ændringer"; exit 1; }
git pull -q --ff-only
START=$(git rev-parse HEAD)

# 1) cherry-pick (gren: alle commits siden forgreningen; ellers én commit)
if git show-ref -q --verify "refs/heads/$REF"; then RANGE="$(git merge-base HEAD "$REF")..$REF"; else RANGE="$REF^..$REF"; fi
git cherry-pick -x $RANGE >/dev/null 2>&1 || { git cherry-pick --abort 2>/dev/null || true; echo "✗ konflikt ved cherry-pick af $RANGE – flet i hånden"; exit 1; }
CHANGED=$(git diff --name-only "$START"..HEAD)
echo "✓ cherry-pick: $(git rev-list --count "$START"..HEAD) commit(s), $(echo "$CHANGED" | wc -l | tr -d ' ') filer"

# 2) ændringslog + version + RELEASE_LOG
VER=$(DA="$DA" EN="$EN" NEWGAME=$NEWGAME node --input-type=module -e '
import fs from "node:fs";
const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Copenhagen" });
const p = "src/ui/changelogData.ts"; let s = fs.readFileSync(p, "utf8");
const j = (x) => JSON.stringify(x);
let da = process.env.DA, en = process.env.EN;
if (process.env.NEWGAME === "1") { da = "⚠ Kræver et nyt spil: " + da; en = "⚠ Requires a new game: " + en; }
const item = `      { da: ${j(da)}, en: ${j(en)} },\n`;
const m = s.match(/export const CHANGELOG: ChangelogEntry\[\] = \[\n  \{\n    version: \x27([\d.]+)\x27,\n    date: \x27([\d-]+)\x27,[\s\S]*?items: \[\n/);
if (!m) throw new Error("ændringsloggens top ikke fundet");
let ver = m[1];
if (m[2] === today) {
  s = s.replace(m[0], m[0] + item);
} else {
  const [a, b] = ver.split(".").map(Number); ver = `${a}.${b + 1}.0`;
  const entry = `  {\n    version: \x27${ver}\x27,\n    date: \x27${today}\x27,\n    title: { da: \x27Mere af det originale CM 01/02\x27, en: \x27More of the original CM 01/02\x27 },\n    items: [\n${item}    ],\n  },\n`;
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
[ -n "$LOG" ] || LOG=$DA
python3 - "$TODAY" "$VERSION" "$LOG" <<'PY'
import sys; d,v,l=sys.argv[1:]; p='docs/RELEASE_LOG.md'; s=open(p).read()
i=s.index('\n- '); s=s[:i]+f'\n- {d} – Skudt live (v{v}): {l}'+s[i:]; open(p,'w').write(s)
PY
echo "✓ ændringslog v$VERSION"

# 3) typetjek og tests
npx tsc --noEmit -p tsconfig.app.json || fail "tsc"
echo "✓ tsc"
SRC=$(echo "$CHANGED" | grep -E '^src/.*\.tsx?$' || true)
TESTS=$(echo "$CHANGED" | grep -E '^tests/.*\.test\.ts$' || true)
npx vitest run --testTimeout=120000 --dir tests tests/changelog.test.ts tests/textParity.test.ts tests/estimateBudget.test.ts $TESTS >/tmp/ship-vitest.$$ 2>&1 || { tail -40 /tmp/ship-vitest.$$; fail "faste tests/ændrede testfiler"; }
if [ -n "$SRC" ]; then npx vitest related --run --testTimeout=120000 --dir tests $SRC >>/tmp/ship-vitest.$$ 2>&1 || { tail -40 /tmp/ship-vitest.$$; fail "berørte tests"; }; fi
grep -E "Tests +[0-9]" /tmp/ship-vitest.$$ | sed 's/^/  /'; rm -f /tmp/ship-vitest.$$
echo "✓ tests"

# 4) én e2e
if [ $E2E = 1 ]; then
  E2E_ENGINE=original PORT=5760 node scripts/e2e.mjs klassisk >/tmp/ship-e2e.$$ 2>&1 || { grep -E "✗" /tmp/ship-e2e.$$ | head; fail "e2e"; }
  grep -q "Alle ende-til-ende-tests bestået" /tmp/ship-e2e.$$ || { tail -20 /tmp/ship-e2e.$$; fail "e2e"; }
  rm -f /tmp/ship-e2e.$$; echo "✓ e2e"
fi

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

# 6) ryd worktree'en for grenen
if git show-ref -q --verify "refs/heads/$REF"; then
  WT=$(git worktree list --porcelain | awk -v b="refs/heads/$REF" '/^worktree /{w=$2} $0=="branch "b{print w}')
  [ -n "$WT" ] && git worktree remove --force --force "$WT" 2>/dev/null && echo "✓ worktree fjernet"
  git branch -D -q "$REF" 2>/dev/null || true
fi
