# Bidrag til CM Reborn

CM Reborn er et fanprojekt for alle, der har spillet Championship Manager 01/02. Alle slags bidrag er velkomne –
kode, data, design, test og oversættelse. *(English below.)*

## Kom i gang

```bash
git clone https://github.com/Skallerup/cm0102-reborn.git
cd cm0102-reborn
npm install
npm run dev     # http://localhost:5173/cm0102-reborn/
npm test        # skal være grøn, før du laver en pull request
```

Online-delene (ranglister, fællesskab, multiplayer) kræver en server: `vercel dev --listen 3000`.

## Hvad kan jeg lave?

- **Nemme opgaver:** se issues med mærket [`good first issue`](https://github.com/Skallerup/cm0102-reborn/issues?q=is%3Aopen+label%3A%22good+first+issue%22).
- **Data:** ret navne, evner og klubfarver direkte i spillet (spillerprofil → *Foreslå rettelse*). Fællesskabet
  stemmer, og godkendte rettelser kommer med i alle nye spil – du behøver ikke kunne kode.
- **Baggrunde:** lav en baggrundspakke af dine egne fotos (Fællesskab → Baggrunde).
- **Oversættelse:** teksterne ligger i `src/i18n/da.ts` og `src/i18n/en.ts`.
- **Fejl og idéer:** brug Fællesskab → Forslag i spillet, eller opret et issue.

## Retningslinjer

- Spilmotoren (`src/game/`) er ren TypeScript uden UI og skal være deterministisk (multiplayer afhænger af det).
- Skriv kode som den omkringliggende: samme navngivning, korte danske kommentarer der forklarer *hvorfor*.
- Ingen kode, grafik eller tekst fra det originale spil eller andre kommercielle spil.
- Små pull requests med en kort beskrivelse er nemmest at gennemgå.

Vil du være en fast del af holdet? Skriv via formularen på [cm0102reborn.com](https://cm0102reborn.com/#join).

---

## Contributing (English)

Everyone who played CM 01/02 is welcome to help – code, data, design, testing and translation.
Run `npm install`, `npm run dev` and `npm test` as above. Easy tasks are labelled `good first issue`.
Data fixes can be proposed inside the game (player profile → *Propose a fix*) and are voted on by the community.
Please do not add code, graphics or text from the original game or other commercial games.
Want to join the team? Use the form at [cm0102reborn.com](https://cm0102reborn.com/#join).
