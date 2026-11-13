// Moderne udseende er slået fra for nu: spillet bruger det klassiske CM 01/02-udseende (og ægte CM 01/02-tilstand).
// Koden til det moderne udseende ligger uændret; sæt MODERN_ENABLED til true (eller i DEV: localStorage cm0102.modern = 1) for at slå det til igen.
// Ingen imports her, så både spilmotoren (gamle gemte spil) og forsiden kan læse flaget uden at trække andet med.
export const MODERN_ENABLED = false;
export function modernOn(): boolean {
  if (MODERN_ENABLED) return true;
  try { return !!import.meta.env?.DEV && localStorage.getItem('cm0102.modern') === '1'; } catch { return false; }
}
