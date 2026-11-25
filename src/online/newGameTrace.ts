// Markøren for "nyt spil under oprettelse" (localStorage) + spor til fejlmeldingen (22/11): hvilket trin, tid pr. trin, om siden blev skjult/forladt,
// og enhedens hukommelse – så NewGameInterrupted (dræbt af browseren) kan skelnes fra NewGameAbandoned (spilleren genindlæste/forlod siden).
// Ingen motor-imports (forsiden og errors.ts bruger modulet).
const CREATING = 'cm0102.creating';
const TRACE = 'cm0102.creating.trace';

export interface NewGameTrace {
  t0: number;
  size: string;
  /** [trin, starttidspunkt, seneste frac] */
  steps: [string, number, number][];
  /** tidspunkter, siden blev skjult (visibilitychange → hidden) */
  hidden: number[];
  /** ms siden var skjult i alt (afsluttede perioder) */
  hiddenMs: number;
  /** pagehide/beforeunload nåede at køre (tidspunkt) – 0 = nej */
  leave: number;
  persisted: boolean;
  mem: number | null;
  cores: number | null;
  standalone: boolean;
  iab: boolean;
  /** (24/11) den midlertidige verden til Select Team (preview) eller det rigtige spil */
  kind?: 'preview' | 'game';
  /** (24/11) vores egne programmatiske genindlæsninger undervejs: årsag (+ ' blocked', når den blev spærret) */
  self?: string[];
}

const get = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const set = (k: string, v: string | null) => { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch { /* ingen lagring */ } };

let cur: NewGameTrace | null = null;
let lastWrite = 0;
let hiddenAt = 0;
let off: (() => void) | null = null;

const save = () => { if (cur) { lastWrite = Date.now(); set(TRACE, JSON.stringify(cur)); } };

function env(): Pick<NewGameTrace, 'mem' | 'cores' | 'standalone' | 'iab'> {
  const n = (typeof navigator === 'undefined' ? {} : navigator) as { deviceMemory?: number; hardwareConcurrency?: number; userAgent?: string; standalone?: boolean };
  let standalone = n.standalone === true;
  try { standalone = standalone || (typeof window !== 'undefined' && !!window.matchMedia?.('(display-mode: standalone)').matches); } catch { /* ignorér */ }
  return { mem: n.deviceMemory ?? null, cores: n.hardwareConcurrency ?? null, standalone, iab: /FBAN|FBAV|FB_IAB|Instagram|; wv\)|Messenger|TikTok|Snapchat|MicroMessenger|GSA\//i.test(n.userAgent ?? '') };
}

/** et nyt spil begynder (on) eller er færdigt/fejlet (off) */
export function markNewGame(on: boolean, size = '', kind?: 'preview' | 'game'): void {
  off?.(); off = null;
  if (!on) { cur = null; set(CREATING, null); set(TRACE, null); creatingChanged(); return; }
  const now = Date.now();
  cur = { t0: now, size, steps: [], hidden: [], hiddenMs: 0, leave: 0, persisted: false, ...env(), ...(kind ? { kind } : {}) };
  hiddenAt = 0;
  set(CREATING, String(now)); save();
  creatingChanged();
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  const vis = () => {
    if (!cur) return;
    if (document.visibilityState === 'hidden') { hiddenAt = Date.now(); cur.hidden.push(hiddenAt); }
    else if (hiddenAt) { cur.hiddenMs += Date.now() - hiddenAt; hiddenAt = 0; }
    save();
  };
  const leave = (e: Event) => { if (cur) { cur.leave = cur.leave || Date.now(); cur.persisted = !!(e as PageTransitionEvent).persisted; save(); } };
  document.addEventListener('visibilitychange', vis);
  window.addEventListener('pagehide', leave);
  window.addEventListener('beforeunload', leave);
  off = () => { document.removeEventListener('visibilitychange', vis); window.removeEventListener('pagehide', leave); window.removeEventListener('beforeunload', leave); };
}

/** kaldes ved hvert fremskridt fra arbejderen (trinskift gemmes straks, ellers højst hvert 2. sekund) */
export function noteNewGameStep(step: string, frac: number): void {
  if (!cur) return;
  const last = cur.steps[cur.steps.length - 1];
  if (!last || last[0] !== step) { cur.steps.push([step, Date.now(), frac]); save(); return; }
  last[2] = frac;
  if (Date.now() - lastWrite > 2000) save();
}

/** (25/11) opdaterings-toasten (ui/UpdateToast.tsx) skjules, mens et nyt spil oprettes, og vises igen bagefter */
function creatingChanged() { try { window.dispatchEvent(new Event('cm-creating')); } catch { /* ingen window */ } }

/** et nyt spil oprettes i denne side lige nu (markøren cm0102.creating er sat af denne side) */
export function creatingNewGame(): boolean { return !!cur; }

/** (24/11) Før enhver programmatisk genindlæsning: årsagen skrives i sporet (NewGameInterrupted/-Abandoned viser den). Mens et nyt spil oprettes,
 *  spærres en automatisk genindlæsning (false = genindlæs ikke – kalderen melder fejlen); en genindlæsning, spilleren selv har bedt om, tillades. */
export function allowSelfReload(reason: string, user = false): boolean {
  if (!cur) return true;
  const ok = user;
  (cur.self ??= []).push(ok ? reason : `${reason} blocked`);
  save();
  return ok;
}

export interface InterruptInfo { abandoned: boolean; text: string }

const sec = (ms: number) => Math.round(ms / 1000);

/** læser (og rydder) markøren ved sidens start; null = ingen afbrudt oprettelse (eller ældre end 15 min) */
export function readInterrupted(now = Date.now(), dbSize = ''): InterruptInfo | null {
  const at = Number(get(CREATING)) || 0;
  const raw = get(TRACE);
  set(CREATING, null); set(TRACE, null);
  if (!at || now - at >= 15 * 60_000) return null;
  let tr: NewGameTrace | null = null;
  try { tr = raw ? JSON.parse(raw) as NewGameTrace : null; } catch { /* ingen spor */ }
  let nav = '?';
  try { nav = (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined)?.type ?? '?'; } catch { /* ignorér */ }
  const abandoned = !!tr && tr.leave > 0;
  const parts = [`database ${tr?.size || dbSize || '?'}`];
  if (tr?.kind) parts.push(tr.kind === 'preview' ? 'select-team world' : 'game');
  if (tr) {
    const st = tr.steps;
    const last = st[st.length - 1];
    parts.push(last ? `step ${last[0]} ${Math.round(last[2] * 100)}% at ${sec(last[1] - tr.t0)} s` : 'step none');
    if (st.length) parts.push(`times ${st.map((s, i) => `${s[0]} ${sec((st[i + 1]?.[1] ?? (tr!.leave || s[1])) - s[1])}s`).join(' > ')}`);
    parts.push(tr.hidden.length ? `hidden ${tr.hidden.length}x first at ${sec(tr.hidden[0] - tr.t0)} s, ${sec(tr.hiddenMs)} s total` : 'hidden 0 s before');
    if (tr.self?.length) parts.push(`selfReload ${tr.self.join(' + ')}`);
    parts.push(tr.leave ? `pagehide yes at ${sec(tr.leave - tr.t0)} s${tr.persisted ? ' persisted' : ''}` : 'pagehide no');
    parts.push(`mem ${tr.mem ?? '?'}`, `cores ${tr.cores ?? '?'}`, `standalone ${tr.standalone ? 'yes' : 'no'}`, `iab ${tr.iab ? 'yes' : 'no'}`);
  } else parts.push('no trace');
  parts.push(`nav ${nav}`);
  const head = abandoned ? 'NewGameAbandoned' : 'NewGameInterrupted';
  return { abandoned, text: `${head}: the page was ${abandoned ? 'left' : 'reloaded'} ${sec(now - at)} s into creating a new game (${parts.join(', ')})` };
}
