#!/bin/bash
# Én seriel udgivelseskø (27/11): læg punkter i kø med `scripts/shipq.sh add <ref> "<da>" "<en>" "<log>" [--new-game]`.
# `scripts/shipq.sh run` (én ad gangen – en lås forhindrer to) tager alle ventende punkter og udgiver dem samlet med ship.sh --file;
# fejler pakken (konflikt/test), prøves punkterne ét for ét, og de, der fejler, flyttes til failed/ med loggen. Kører til køen er tom.
# Kø-mappe: ~/.cache/cm-shipq (pending/*.json, failed/*.json, done/*.json, log/). Status: `scripts/shipq.sh status`.
set -u
Q="${SHIPQ_DIR:-$HOME/.cache/cm-shipq}"; mkdir -p "$Q/pending" "$Q/failed" "$Q/done" "$Q/log"
ROOT="${SHIPQ_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
cmd="${1:-status}"; shift || true

case "$cmd" in
  add)
    [ $# -ge 4 ] || { echo "brug: shipq.sh add <ref> <da> <en> <log> [--new-game]"; exit 2; }
    id="$(date +%s)-$RANDOM"
    python3 - "$Q/pending/$id.json" "$@" <<'PY'
import json,sys
out,ref,da,en,log=sys.argv[1:6]; ng=len(sys.argv)>6 and sys.argv[6]=='--new-game'
json.dump({"ref":ref,"da":da,"en":en,"log":log,"newGame":ng},open(out,'w'),ensure_ascii=False)
PY
    echo "i kø: $id ($1)"; exit 0;;
  status)
    for d in pending failed done; do echo "$d: $(ls "$Q/$d" | wc -l | tr -d ' ')"; done
    for f in "$Q"/pending/*.json "$Q"/failed/*.json; do [ -f "$f" ] && echo "  $(basename "$(dirname "$f")")/$(basename "$f"): $(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))['ref'])" "$f")"; done
    [ -d "$Q/lock" ] && echo "kører (pid $(cat "$Q/lock/pid" 2>/dev/null))"; exit 0;;
  run) ;;
  *) echo "ukendt: $cmd"; exit 2;;
esac

# lås (mkdir er atomisk); en død lås ryddes
if ! mkdir "$Q/lock" 2>/dev/null; then
  p=$(cat "$Q/lock/pid" 2>/dev/null); if [ -n "$p" ] && kill -0 "$p" 2>/dev/null; then echo "kører allerede (pid $p)"; exit 0; fi
  rm -rf "$Q/lock"; mkdir "$Q/lock" || exit 1
fi
echo $$ > "$Q/lock/pid"; trap 'rm -rf "$Q/lock"' EXIT

ship() { # $@ = json-filer → ship.sh --file; returnerer ship.sh's kode
  local list="$Q/log/batch-$(date +%s).json"
  python3 - "$list" "$@" <<'PY'
import json,sys
json.dump([json.load(open(f)) for f in sys.argv[2:]],open(sys.argv[1],'w'),ensure_ascii=False,indent=1)
PY
  local log="$Q/log/ship-$(date +%Y%m%d-%H%M%S).log"
  # samme lås som de gamle batch-scripts, så to udgivelser aldrig kører samtidig
  until mkdir /private/tmp/cm-ship.lock 2>/dev/null; do sleep 30; done
  (cd "$ROOT" && export PATH="$HOME/.local/share/node/bin:$PATH" && git fetch -q && git reset -q --hard origin/main \
    && for r in $(python3 -c "import json,sys;print(' '.join(x['ref'] for x in json.load(open(sys.argv[1]))))" "$list"); do
         wt="$ROOT/.claude/worktrees/${r#worktree-}"; [ -d "$wt" ] && { git -C "$wt" rebase -q origin/main 2>/dev/null || git -C "$wt" rebase --abort 2>/dev/null; }; done
    nice -n 20 bash scripts/ship.sh --file "$list") > "$log" 2>&1
  local rc=$?; rmdir /private/tmp/cm-ship.lock 2>/dev/null
  echo "$log"; grep -n "✗\|✓ pushet\|✓ live\|konflikt\| FAIL " "$log" | head -8 | cut -c1-200
  return $rc
}

while :; do
  files=( $(ls "$Q"/pending/*.json 2>/dev/null | sort) ); [ ${#files[@]} -gt 0 ] || break
  echo "== pakke med ${#files[@]} punkt(er)"
  if ship "${files[@]}"; then mv "${files[@]}" "$Q/done/"; continue; fi
  if [ ${#files[@]} -eq 1 ]; then mv "${files[0]}" "$Q/failed/"; continue; fi
  echo "== pakken fejlede – prøver ét ad gangen"
  for f in "${files[@]}"; do
    if ship "$f"; then mv "$f" "$Q/done/"; else mv "$f" "$Q/failed/"; fi
  done
done
echo "== køen er tom"; bash "$0" status
