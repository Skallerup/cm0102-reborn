// Nye funktioner kan lægges bag en dato. Brug: if (betaFeature('2026-11-01')) …
export function betaFeature(publicFrom: string): boolean {
  return new Date().toISOString().slice(0, 10) >= publicFrom;
}
