#!/bin/bash
# Vercels "Ignored Build Step" (vercel.json → ignoreCommand): exit 0 = spring buildet over, exit 1 = byg.
# Springer kun over, når ALLE ændrede filer mellem sidste udgivne commit og denne er uden betydning for sitet
# (docs, tests, noter, agentfiler, CI, målescripts). Konservativt: alt ukendt, manglende SHA eller git-fejl → byg.
# Lokal test: VERCEL_GIT_PREVIOUS_SHA=<a> VERCEL_GIT_COMMIT_SHA=<b> bash scripts/vercel-ignore.sh; echo $?
PREV="${VERCEL_GIT_PREVIOUS_SHA:-}"
CUR="${VERCEL_GIT_COMMIT_SHA:-HEAD}"
[ -z "$PREV" ] && { echo "ingen forrige SHA → byg"; exit 1; }
if ! git cat-file -e "$PREV^{commit}" 2>/dev/null; then git fetch --quiet --depth=100 origin "$PREV" 2>/dev/null || true; fi
FILES=$(git diff --name-only "$PREV" "$CUR" 2>/dev/null) || { echo "git diff fejlede → byg"; exit 1; }
[ -z "$FILES" ] && { echo "tomt diff → byg"; exit 1; }
while IFS= read -r f; do
  case "$f" in
    docs/*|tests/*|.claude/*|.github/*|NOTES.md|README.md|CLAUDE.md|CONTRIBUTING.md|LICENSE) ;;
    scripts/ship.sh|scripts/vercel-ignore.sh|scripts/measure.mjs|scripts/test.mjs|scripts/e2e*.mjs|scripts/mp-test/*|scripts/oracle-*|scripts/cm-day-lockstep.ts|scripts/soak.ts|scripts/grid-*.ts|scripts/where.ts) ;;
    *) echo "påvirker sitet: $f → byg"; exit 1 ;;
  esac
done <<<"$FILES"
echo "kun filer uden betydning for sitet → spring over"
exit 0
