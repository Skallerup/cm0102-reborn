#!/usr/bin/env bash
# Hent kildefilerne (CM 01/02-databaser og baggrundspakken) fra GitHub-release'n "data-sources"
# og pak dem ud, så build-scripts kan finde dem. Zip-filerne ligger ikke i git for at holde repo'et let.
#
#   .data-update/October 2026 Data Update/   → npm run data:cm (standarddatabasen 2026/27)
#   .orig-db/Original-3.9.68-Database/       → den originale 01/02-database (world-original.json)
#   .orig-db/Original-3.9.65-Database-Swedish_fixed/
#   .sources/Sunday League Pack 800x600/      → baggrundsbilleder (.RGN), allerede konverteret til public/bg
set -euo pipefail
cd "$(dirname "$0")/.."
BASE=https://github.com/Skallerup/cm0102-reborn/releases/download/data-sources
mkdir -p .sources
fetch() {
  local name=$1 dest=$2
  [ -f ".sources/$name" ] || curl -fL -sS -o ".sources/$name" "$BASE/$name"
  mkdir -p "$dest" && unzip -oq ".sources/$name" -d "$dest"
  echo "✓ $name → $dest"
}
fetch october-2026-data-update.zip .data-update
fetch original-3.9.68-database.zip .orig-db
fetch original-3.9.65-database-swedish-fixed.zip .orig-db
fetch sunday-league-pack-800x600.zip .sources
