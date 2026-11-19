// Kampen i en baggrundsfane (CM Reborn, Game Options): browsere drosler timere i skjulte faner. Med tilvalget slået til tæller vi forløbet
// vægur-tid og spiller de manglende ticks, så kampen står samme sted som uden fanebytte. Motorens skridt ændres ikke – kun hvor mange
// ticks der køres pr. interval-kald; hvert tick er det samme `advance(n)` som ved normalt tempo (samme rækkefølge, samme frø).

/** hvor mange ticks der er forfaldne siden `last` (ms pr. tick), og det nye referencetidspunkt (afrundet til hele ticks) */
export function dueTicks(now: number, last: number, ms: number): { n: number; last: number } {
  const n = Math.max(0, Math.floor((now - last) / ms));
  return { n, last: last + n * ms };
}

/** et loft, så en lang fravær (laptop i dvale) ikke fryser siden */
export const MAX_CATCHUP_TICKS = 20000;

/**
 * Kører de forfaldne ticks. `tick()` spiller ét tick; `stopped()` melder, at kampen skal stå stille (halvleg, dialog, højdepunkt, mål-blink,
 * slutfløjt) – så stopper indhentningen, og det resterende tidsrum glemmes (som når man ser med: pausen tæller ikke).
 * Returnerer det nye referencetidspunkt.
 */
export function runCatchUp(now: number, last: number, ms: number, tick: () => void, stopped: () => boolean): number {
  const d = dueTicks(now, last, ms);
  let ran = 0;
  while (ran < Math.min(d.n, MAX_CATCHUP_TICKS) && !stopped()) { tick(); ran++; }
  return stopped() ? now : d.last;
}
