// Moderne udseende er slået fra for nu: spillet bruger det klassiske CM 01/02-udseende (og ægte CM 01/02-tilstand).
// Koden til det moderne udseende ligger uændret. Egen indgang uden for forsiden (ikke omtalt der): åbn /?modern=1 – det huskes i localStorage
// cm0102.modern (/?modern=0 slår det fra igen). Så kan et moderne spil startes og gamle moderne gemte spil åbnes. MODERN_ENABLED = true slår det til for alle.
// Ingen imports her, så både spilmotoren (gamle gemte spil) og forsiden kan læse flaget uden at trække andet med.
export const MODERN_ENABLED = false;
// Et gammelt gemt spil i udvidet tilstand åbnes, som det blev gemt (moderne udseende + udvidet) – sat af setGame i state.ts.
// Nye spil er stadig kun originale/klassiske.
let savedModern = false;
export function setSavedModern(on: boolean) { savedModern = on; }
export function savedModernOn(): boolean { return savedModern; }
export function modernOn(): boolean {
  if (MODERN_ENABLED || savedModern) return true;
  try {
    const q = new URLSearchParams(location.search).get('modern');
    if (q === '1') localStorage.setItem('cm0102.modern', '1');
    else if (q === '0') localStorage.removeItem('cm0102.modern');
    return localStorage.getItem('cm0102.modern') === '1';
  } catch { return false; }
}
