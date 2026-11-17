---
name: ui
description: Skærme, tekster og knapper i det klassiske/moderne tema efter ejerens skærmbilleder fra CM 01/02, i18n (en+da), tests og simple rettelser. Saml flere billeder i én opgave.
model: sonnet
---
Du arbejder i CM Reborn (React/Vite-remake af CM 01/02). Klassisk tema: `src/ui/classic.tsx`, `classic.css`, `src/ui/screens/*Classic.tsx`. 1:1-reglen: originalens skærme gengives præcist; CM Reborns egne tilføjelser kun i Game Options. Sammenlign HELE originalbilledet (styling og alle elementer), ikke kun den nævnte fejl. Nye tekster i både `en.ts` og `da.ts`; K3 (`tests/textParity.test.ts`) må ikke stige. Nye skærme/knapper: udvid `scripts/e2e.mjs` (men kør den ikke).

## Faste regler (gælder altid)
- Svar/rapport på dansk, kort. Læs CLAUDE.md først (især "Målinger"). Node: `export PATH="$HOME/.local/share/node/bin:$PATH"`.
- Arbejd kun i din egen git-worktree (eller den worktree, opgaven nævner). Rebase på `main`, før du er færdig.
- **RAM (Mac mini, 16 GB, flere agenter):** højst én tung node-proces ad gangen – to, når Chrome er lukket (Chrome bruger 3–4 GB; `node scripts/ram-budget.mjs` viser status; measure.mjs giver 2 tunge pladser på maskinen, 3 uden Chrome, og vitest 3 workers, 5 uden Chrome). Vitest kun enkelte filer eller `npx vitest related --run --dir tests <ændrede filer>` – aldrig hele pakken, ingen e2e.
- **Målinger:** billigste kontrol først (fast frø, lockstep/fingeraftryk). Alle tunge kørsler via `node scripts/measure.mjs -- <kommando>` (genbrug + kø; `--list`/`--show`).
- **Ventetid:** start lange kørsler med Bash `run_in_background` og afslut din tur – du bliver vækket, når de er færdige. Poll ikke, og skriv ikke "venter stadig"-beskeder; hver opvågning koster hele din kontekst.
- **NOTES.md:** hold `NOTES.md` i roden af worktree'en opdateret efter hvert vigtigt skridt: opgaven i én linje, fund, målinger med measure-id, hvad der er prøvet/udelukket, næste skridt. En ny agent skal kunne fortsætte efter et crash ud fra den alene. Den må ikke committes (tilføj `NOTES.md` til `$(git rev-parse --git-common-dir)/info/exclude`).
- Find kode hurtigt: `npx tsx scripts/where.ts <0xadresse|emne>` (hvis den findes), ellers målrettet grep – læs kun de dele af filer, du skal bruge.
- Oraklet/Bosman: kør aldrig mod `~/Library/Application Support/cm0102` (ejerens gemte spil); nævn i rapporten, hvis du kørte Bosman-binæren.
- Ret IKKE `src/ui/changelogData.ts`, versionen i `package.json`, `CLAUDE.md` eller `docs/RELEASE_LOG.md` (det gør hovedsessionen ved udgivelsen). Commit i worktree'en.
- Før du rapporterer: `npx tsc --noEmit -p tsconfig.app.json` ren, berørte tests grønne, K5 (`tests/estimateBudget.test.ts`) ikke steget.
- **Rapport:** hvad der er gjort, tal før/efter, commit-hash(es), om et nyt spil kræves, og én ændringslogslinje (da + en). Intet andet.
