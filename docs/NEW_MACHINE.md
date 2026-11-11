# Ny computer – sådan kommer Claude (og ejeren) i gang igen

Til Claude: følg trinene i rækkefølge, og spørg ejeren, før noget kører Bosman-appen (se [[bosman-app-gatekeeper]] i hukommelsen:
at starte binæren fra terminalen udløste Gatekeeper, og ejerens gemte spil gik tabt 11/11-2026).

## 1. Projektet (offentligt repo)
```
git clone https://github.com/Skallerup/cm0102-reborn.git ~/Documents/claude/cm0102
cd ~/Documents/claude/cm0102 && git checkout staging
npm ci && npm run data:fetch
```
Node 22 skal være installeret. Ligger den ikke i `~/.local/node`, så ignorér PATH-linjen i CLAUDE.md og brug den installerede.
GitHub: `gh auth login` og `gh auth refresh -s workflow` (workflow-filerne kræver det).

## 2. Motor-arbejdsmappen (PRIVAT repo – må aldrig gøres offentligt)
```
git clone https://github.com/Skallerup/cm0102-engine.git ~/cm0102-engine
```
Den rummer afkodningerne (`notes/`), værktøjerne (`tools/`), oraklets værktøjer og originalens sæsontal (`oracle/`) og Claudes
projekthukommelse (`claude-memory/`). Originalens exe, den rekompilerede C og ejerens gemte spil er IKKE i git.

## 3. Claudes hukommelse
Start `claude` én gang i projektmappen og afslut (så findes mappen), og kopiér derefter:
```
cp ~/cm0102-engine/claude-memory/*.md ~/.claude/projects/*-Documents-claude-cm0102/memory/
```
Når hukommelsen ændres, så kopiér den tilbage til `~/cm0102-engine/claude-memory/` og commit dér, så computerne er enige.

## 4. Genskab det, der ikke ligger i git (kun til motorporten)
1. Installér "CM 01-02 Bosman Edition" fra dmg'en i /Applications. **Ejeren** godkender den én gang: højreklik → Åbn → Åbn.
2. `pip3 install --user capstone`
3. `bash ~/cm0102-engine/tools/regen.sh` – kopierer `cm0102.exe` fra appen (tjekker sha256 for 3.9.68), kloner Bosmans værktøj
   til `~/cm0102-engine/.bosman-repo`, rekompilerer motorens funktioner til `out-match/`, `out-tactics/` og `hooks/<adr>.c`,
   kopierer de 40 `.pct`-filer og spilmappen til oraklet. Starter ikke spillet.
Oraklet (`~/cm0102-engine/oracle/README.md`) kører spillet headless – kun med ejerens viden, uden for sandkassen og altid med egen
`RECOMP_USER_DIR`/`HOME`, aldrig mod `~/Library/Application Support/cm0102`. Tag en kopi af den mappe først.

## 5. Fortsæt arbejdet
Samtalehistorikken følger ikke med. Start en ny samtale i projektmappen og skriv:
```
Fortsæt motorporten – læs "Næste skridt" i docs/ENGINE_PORT_PLAN.md
```
Tjek også `git log` (der arbejdes i flere sessioner) og CLAUDE.md's udgivelseslog.
