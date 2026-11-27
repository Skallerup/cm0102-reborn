// (hastighed 27/11) Autogemmets bytes fra dagens arbejder (ui/dayWorker.ts): efter en kørsel serialiserer og gzipper arbejderen selv spillet
// (samme bytes som hovedtrådens serializeBytes) og overfører dem; hovedtråden skriver dem kun til lageret. Før stod hovedtråden 1–2,5 s med
// JSON-teksten og komprimeringen ved hvert autogem på Maximum.
// Bytes bruges kun, når hovedtrådens spil med sikkerhed er det, arbejderen gemte: samme objekt, og ingen notify() siden kørslens kald af
// sealWorkerSave() (Shell's run/__cm.advance – efter de notify'er, der kun tegner skærmen igen). Ellers gemmer hovedtråden selv, som før.
import { getVersion, gs, hasGame } from './state';
import type { GzBytes } from './snapshot';
import type { GameState } from './types';

type Offer = { g: GameState; bytes: Promise<GzBytes | null>; sealed: number | null };
let offer: Offer | null = null;
/** hvor længe et gem højst venter på arbejderens bytes (ellers serialiserer hovedtråden selv) */
const WAIT_MS = 30_000;

/** kørslens spil er lagt ind (setGame) – arbejderens bytes for det kommer senere */
export function offerWorkerSave(g: GameState, bytes: Promise<GzBytes | null>): void {
  offer = { g, bytes, sealed: null };
}

/** kørslen er færdig, og skærmen har fået sine notify'er: fra nu af gør en ny notify() (en ændring) bytes ubrugelige */
export function sealWorkerSave(): void {
  if (offer && offer.sealed === null && hasGame() && gs() === offer.g) offer.sealed = getVersion();
}

export function dropWorkerSave(): void { offer = null; }

const fresh = (o: Offer, g: GameState) => o.sealed !== null && hasGame() && gs() === g && o.g === g && getVersion() === o.sealed;

/** arbejderens bytes for `g`, hvis de stadig svarer til spillet (venter på dem, hvis de er undervejs) – ellers null (gem selv) */
export async function takeWorkerSave(g: GameState): Promise<GzBytes | null> {
  const o = offer;
  if (!o) return null;
  if (!fresh(o, g)) { if (o.sealed !== null || o.g !== g) offer = null; return null; }
  let timer: ReturnType<typeof setTimeout> | undefined;
  const parts = await Promise.race([o.bytes, new Promise<null>((r) => { timer = setTimeout(() => r(null), WAIT_MS); })]).catch(() => null);
  clearTimeout(timer);
  if (offer === o) offer = null;
  return parts && fresh(o, g) ? parts : null;
}
