// (27/11, Android/Chrome 138: "NewGameInterrupted … step fitness 17% at 17 s" i 138 s – samme symptom som Firefox-fejlen 18a5ce10) Overdragelsen af
// spillet mellem to trins arbejdere (ui/newGameWorker.ts) gennem en MessageChannel. Afsenderen holder porten åben og lever, til modtageren har
// kvitteret ('ack' – hovedtråden afslutter den først, når modtageren melder 'received'); i ALLE browsere, ikke kun Gecko. Ligger modtageren ledig
// uden spillet i RESEND_MS (kun synlig, kørende tid: et timerslag med > 15 s mellemrum = frosset/drosslet fane tæller ikke), beder den afsenderen
// sende igen (højst MAX_RESENDS gange) – først derefter fejler den, i stedet for at vente for evigt. Beskeden kopieres (ingen Transferable), så
// afsenderen har alt til en gensendelse; modtageren tager kun den første.

/** modtagerens beskeder til afsenderen gennem kanalen */
export type HandoffCtl = { ctl: 'ack' } | { ctl: 'resend'; n: number };
export const RESEND_MS = 15000;
export const RESEND_TICK_MS = 2500;
export const MAX_RESENDS = 2;
const FROZEN_MS = 15000;

type PortLike = { postMessage(m: unknown, transfer?: Transferable[]): void; close(): void } & { onmessage: ((e: MessageEvent) => void) | null; onmessageerror: ((e: MessageEvent) => void) | null };

/** afsenderen: sender `payload` (kopi – kaster, hvis den strukturerede kopi fejler) og igen, når modtageren beder om det; porten lukkes ved
 *  modtagerens kvittering (hovedtråden afslutter arbejderen, når modtageren melder 'received' til den). `onResend` = sporet. */
export function serveHandoff<T>(port: PortLike, payload: T, onResend?: (n: number) => void, transfer?: Transferable[]): void {
  // `transfer` (iOS: afsenderen afsluttes alligevel straks – ingen gensendelse mulig) flyttes i stedet for at kopieres
  port.postMessage(payload, transfer ?? []);
  port.onmessage = (e) => {
    const c = e.data as HandoffCtl;
    if (c?.ctl === 'ack') { port.onmessage = null; port.close(); }
    else if (c?.ctl === 'resend') { onResend?.(c.n); port.postMessage(payload); }
  };
}

export interface ReceiveOpts { now?: () => number; resendMs?: number; tickMs?: number; maxResends?: number; onResend?: (n: number) => void }
/** modtageren: venter på afsenderens første besked, kvitterer og lukker porten; ledig for længe → beder om en gensendelse */
export function receiveHandoff<T>(port: PortLike, what: string, o: ReceiveOpts = {}): Promise<T> {
  const now = o.now ?? Date.now, resendMs = o.resendMs ?? RESEND_MS, tickMs = o.tickMs ?? RESEND_TICK_MS, maxResends = o.maxResends ?? MAX_RESENDS;
  return new Promise<T>((resolve, reject) => {
    let idle = 0, n = 0, last = now(), over = false;
    const end = () => { over = true; clearInterval(t); port.onmessage = null; port.onmessageerror = null; };
    const t = setInterval(() => {
      if (over) return;
      const tm = now(), dt = tm - last; last = tm;
      if (dt > FROZEN_MS) { idle = 0; return; }
      idle += dt;
      if (idle < resendMs) return;
      idle = 0;
      if (n >= maxResends) { end(); reject(new Error(`handoff lost: no game ${what} after ${n} resends`)); return; }
      n++; o.onResend?.(n);
      port.postMessage({ ctl: 'resend', n } satisfies HandoffCtl);
    }, tickMs);
    port.onmessage = (e) => {
      if (over) return;
      end();
      // porten lukkes ikke her: Gecko smider en besked væk, hvis porten lukkes lige efter afsendelsen (kvitteringen er kun en høflighed –
      // hovedtråden afslutter afsenderen på 'received')
      port.postMessage({ ctl: 'ack' } satisfies HandoffCtl);
      resolve(e.data as T);
    };
    port.onmessageerror = () => { if (over) return; end(); reject(new Error(`handoff messageerror ${what}`)); };
  });
}
