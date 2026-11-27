// (27/11, "NewGameWorkerFailed: worker died: no message for 125 s … step done 97%" på en langsom pc – hele spilstarten 67 min) Hjerteslag fra
// spilstartens lange synkrone løkker: arbejderen (ui/newGameWorker.ts) sender en besked mindst hvert BEAT_MS, så hovedtrådens vagt (startGame.ts
// runPhases) kan skelne en død/hængt arbejder fra en langsom. Rører intet i spillet (kun Date.now – ingen talrække, ingen tilstand i GameState);
// uden en modtager (alt andet end spilstartens arbejder) koster et kald én sammenligning.
export const BEAT_MS = 5000;
let cb: (() => void) | null = null, every = BEAT_MS, last = 0;
/** modtageren (null = slået fra); `ms` = højst ét slag pr. ms (0 = hvert kald – scripts/newgame-gaps.ts) */
export function setBeat(f: (() => void) | null, ms = BEAT_MS): void { cb = f; every = ms; last = 0; }
/** en besked er sendt (fremdrift o.l.) – næste slag tidligst om BEAT_MS */
export function beatSent(): void { if (cb) last = Date.now(); }
export function beat(): void {
  if (!cb) return;
  const t = Date.now();
  if (t - last >= every) { last = t; cb(); }
}
