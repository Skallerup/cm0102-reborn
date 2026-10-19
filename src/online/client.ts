// Online multiplayer – klientsiden.
//
// Flow pr. træk:
//  1. Alle managere laver ændringer. Hver ændring er en Action, der anvendes lokalt og sendes til serveren.
//  2. Man trykker "Klar". Når alle er klar, tager én klient låsen.
//  3. Den klient tager det uberørte øjebliksbillede, afspiller alle handlinger i rækkefølge,
//     simulerer frem til efter næste kampdag (mpAdvance) og uploader et nyt øjebliksbillede.
//  4. De andre opdager den nye version, henter den og genanvender egne handlinger der ikke nåede med.
import { upload } from '@vercel/blob/client';
import { applyActionAs, setActionSink, type Action } from '../game/actions';
import { activate, enableMultiplayer, withHuman } from '../game/humans';
import { setupBots, type BotScope } from '../game/bots';
import { createGame, type NewGameOptions, type WorldData } from '../game/newgame';
import { rng } from '../game/rng';
import { mpAdvance } from '../game/sim';
import { deserializeState, serializeState } from '../game/snapshot';
import { addNews, gs, notify, setGame } from '../game/state';
import { rememberLast } from '../game/save';
import type { GameState } from '../game/types';

export interface RoomInfo {
  code: string;
  host: string;
  status: 'setup' | 'playing';
  version: number;
  snapshot: string;
  date: string;
  lastApplied: number;
  actionCount: number;
  settings: { nations?: number[]; seed?: number; masking?: boolean; deadlineHours?: number };
  processing: string | null;
  lastTurn: string;
  players: { pid: string; name: string; club: number; ready: boolean; joined: string; auto?: boolean }[];
  chat?: RoomChat[];
}

export interface RoomChat {
  id: number;
  from: string;
  name: string;
  to: string;
  text: string;
  at: string;
}

export interface Credentials {
  code: string;
  pid: string;
  token: string;
  name: string;
}

const API = '/api/mp';
const STORE = 'cm0102.online';

// ---------- gemte rum ----------

export function savedRooms(): Credentials[] {
  try { return JSON.parse(localStorage.getItem(STORE) ?? '[]') as Credentials[]; } catch { return []; }
}

function rememberRoom(c: Credentials) {
  const list = savedRooms().filter((x) => x.code !== c.code);
  list.unshift(c);
  try { localStorage.setItem(STORE, JSON.stringify(list.slice(0, 10))); } catch { /* ignore */ }
}

export function forgetRoom(code: string) {
  try { localStorage.setItem(STORE, JSON.stringify(savedRooms().filter((x) => x.code !== code))); } catch { /* ignore */ }
}

// ---------- HTTP ----------

async function post<T>(op: string, body: Record<string, unknown>): Promise<T> {
  const r = await fetch(`${API}?op=${op}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error ?? `http ${r.status}`);
  return data as T;
}

export async function fetchRoom(code: string): Promise<RoomInfo> {
  const r = await fetch(`${API}?code=${encodeURIComponent(code.toUpperCase())}`, { cache: 'no-store' });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error ?? `http ${r.status}`);
  return data as RoomInfo;
}

export async function downloadSnapshot(url: string): Promise<{ blob: Blob; state: GameState }> {
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) throw new Error(`snapshot ${r.status}`);
  const blob = await r.blob();
  return { blob, state: await deserializeState(blob) };
}

async function uploadSnapshot(c: Credentials, version: number, blob: Blob): Promise<string> {
  const res = await upload(`rooms/${c.code}/v${version}.json.gz`, blob, {
    access: 'public',
    handleUploadUrl: `${API}?op=upload`,
    clientPayload: JSON.stringify({ code: c.code, pid: c.pid, token: c.token }),
    contentType: 'application/gzip',
    multipart: blob.size > 4 * 1024 * 1024,
  });
  return res.url;
}

// ---------- session ----------

type Listener = () => void;

export class OnlineSession {
  creds: Credentials;
  room: RoomInfo | null = null;
  version = 0;
  /** Uberørt kopi af det seneste øjebliksbillede (bruges når vi selv skal simulere) */
  private pristine: Blob | null = null;
  /** Egne handlinger der endnu ikke er sendt */
  private outbox: Action[] = [];
  /** Egne handlinger sendt til serveren, men ikke indarbejdet i et øjebliksbillede: [serverIdx, action] */
  private sent: [number, Action][] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private busy = false;
  status: 'idle' | 'loading' | 'processing' | 'error' = 'idle';
  error = '';
  lastTurn: { days: number; reason: string } | null = null;
  private listeners = new Set<Listener>();

  constructor(creds: Credentials) {
    this.creds = creds;
  }

  on(l: Listener) {
    this.listeners.add(l);
    return () => { this.listeners.delete(l); };
  }

  private emit() {
    for (const l of this.listeners) l();
    notify();
  }

  get me() {
    return this.room?.players.find((p) => p.pid === this.creds.pid);
  }

  /** Er jeg med i spillets øjebliksbillede endnu? (nye spillere kommer med ved næste træk) */
  get inGame(): boolean {
    try { return !!gs().humans?.some((h) => h.pid === this.creds.pid); } catch { return false; }
  }

  async start() {
    setActionSink((a) => this.enqueue(a));
    await this.refresh(true);
    this.pollTimer = setInterval(() => { void this.refresh(false); }, 3500);
  }

  stop() {
    if (this.pollTimer) clearInterval(this.pollTimer);
    if (this.flushTimer) clearTimeout(this.flushTimer);
    setActionSink(null);
  }

  // ----- handlinger -----

  private enqueue(a: Action) {
    // samlede taktikændringer: kun den sidste behøver at blive sendt
    if (a.t === 'tactic') this.outbox = this.outbox.filter((x) => x.t !== 'tactic');
    this.outbox.push(a);
    if (this.flushTimer) clearTimeout(this.flushTimer);
    this.flushTimer = setTimeout(() => { void this.flush(); }, 700);
  }

  async flush() {
    if (!this.outbox.length) return;
    const batch = this.outbox;
    this.outbox = [];
    try {
      const { last } = await post<{ last: number }>('actions', { ...this.creds, actions: batch });
      batch.forEach((a, i) => this.sent.push([last - batch.length + i + 1, a]));
      if (this.room) {
        const me = this.room.players.find((p) => p.pid === this.creds.pid);
        if (me) me.ready = false;
      }
      this.emit();
    } catch (e) {
      this.outbox = [...batch, ...this.outbox];
      this.error = String((e as Error).message);
      this.emit();
    }
  }

  // ----- beskeder til andre mennesker -----

  async sendChat(to: string, text: string) {
    const rec = await post<RoomChat>('chat', { ...this.creds, to, text });
    if (this.room) this.room.chat = [...(this.room.chat ?? []), rec];
    this.emit();
  }

  /** Ulæste beskeder fra andre mennesker (husket pr. rum i denne browser) */
  chatSeen(): number {
    try { return Number(localStorage.getItem(`cm0102.chatSeen.${this.creds.code}`) ?? 0); } catch { return 0; }
  }

  markChatSeen() {
    const last = this.room?.chat?.at(-1)?.id ?? 0;
    try { localStorage.setItem(`cm0102.chatSeen.${this.creds.code}`, String(last)); } catch { /* ignorer */ }
    this.emit();
  }

  unreadChat(): number {
    const seen = this.chatSeen();
    return (this.room?.chat ?? []).filter((m) => m.id > seen && m.from !== this.creds.pid && (m.to === 'all' || m.to === this.creds.pid)).length;
  }

  // ----- klar / synkronisering -----

  /** Er jeg værten (den der startede spillet)? */
  get isHost(): boolean {
    return !!this.room && this.room.host === this.creds.pid;
  }

  /** Værten: tving trækket igennem uden at vente på de andre */
  async forceContinue() {
    await this.flush();
    this.room = await post<RoomInfo>('force', { ...this.creds });
    this.emit();
    await this.maybeProcess();
  }

  /** Værten: fjern en spiller fra spillet – klubben får en AI-manager */
  async kick(target: string) {
    await this.flush();
    this.room = await post<RoomInfo>('kick', { ...this.creds, target });
    this.emit();
    await this.maybeProcess();
  }

  async setReady(ready: boolean) {
    await this.flush();
    this.room = await post<RoomInfo>('ready', { ...this.creds, ready });
    this.emit();
    if (ready) await this.maybeProcess();
  }

  async refresh(force: boolean) {
    if (this.busy) return;
    try {
      const room = await fetchRoom(this.creds.code);
      this.room = room;
      if (room.version > this.version || (force && room.snapshot)) {
        await this.loadVersion(room);
      }
      this.emit();
      await this.maybeProcess();
    } catch (e) {
      this.error = String((e as Error).message);
      this.emit();
    }
  }

  private async loadVersion(room: RoomInfo) {
    if (!room.snapshot) return;
    this.status = 'loading';
    this.emit();
    const { blob, state } = await downloadSnapshot(room.snapshot);
    this.pristine = blob;
    this.version = room.version;
    setGame(state);
    if (state.humans?.some((h) => h.pid === this.creds.pid)) activate(this.creds.pid, state);
    // genanvend egne handlinger der ikke nåede med i dette træk
    const applied = state.lastActionIdx ?? 0;
    this.sent = this.sent.filter(([idx]) => idx > applied);
    if (state.humans?.some((h) => h.pid === this.creds.pid)) {
      for (const [, a] of this.sent) applyActionAs(this.creds.pid, a);
      for (const a of this.outbox) applyActionAs(this.creds.pid, a);
    }
    this.status = 'idle';
    this.emit();
  }

  /** Hvornår udløber trækkets frist (ms siden epoch), eller null hvis rummet ikke har en frist */
  deadline(): number | null {
    const h = this.room?.settings?.deadlineHours;
    if (!h || !this.room?.lastTurn) return null;
    return Date.parse(this.room.lastTurn) + h * 3_600_000;
  }

  private async maybeProcess() {
    const room = this.room;
    if (!room || this.busy || room.processing) return;
    // fristen er udløbet: gør de manglende klar (deres assistent tager over i trækket)
    const dl = this.deadline();
    if (dl && Date.now() >= dl && room.players.some((p) => !p.ready)) {
      try { this.room = await post<RoomInfo>('autoready', { ...this.creds }); this.emit(); } catch { return; }
    }
    if (!room.players.length || !room.players.every((p) => p.ready)) return;
    if (room.version !== this.version) return;
    // Den første spiller (efter pid) prøver først; de andre venter lidt, så ikke alle forsøger samtidig
    const order = room.players.map((p) => p.pid).sort();
    const delay = Math.max(0, order.indexOf(this.creds.pid)) * 4000;
    if (delay) {
      await new Promise((r) => setTimeout(r, delay));
      try { this.room = await fetchRoom(this.creds.code); } catch { return; }
      if (this.room.processing || this.room.version !== this.version || !this.room.players.every((p) => p.ready)) return;
    }
    await this.process();
  }

  /** Tag låsen og simulér næste træk */
  private async process() {
    if (this.busy || !this.pristine) return;
    this.busy = true;
    let locked = false;
    try {
      const res = await post<{ ok: boolean; actions: { idx: number; pid: string; a: Action }[] }>('lock', { ...this.creds, version: this.version });
      locked = res.ok;
      this.status = 'processing';
      this.emit();
      await new Promise((r) => setTimeout(r, 30));
      const state = await deserializeState(this.pristine);
      setGame(state);
      let last = state.lastActionIdx ?? 0;
      for (const { idx, pid, a } of res.actions) {
        if (idx <= last) continue;
        applyActionAs(pid, a);
        last = idx;
      }
      state.lastActionIdx = last;
      // spillere der ikke nåede at trykke Klar: deres assistent styrer trækket
      const auto = new Set((this.room?.players ?? []).filter((p) => p.auto).map((p) => p.pid));
      for (const h of state.humans ?? []) if (auto.has(h.pid)) h.autopilot = true;
      // hvis nogen stadig ikke er med i spillet (fx deres join fejlede), springes de over
      this.lastTurn = mpAdvance();
      for (const h of state.humans ?? []) if (h.autopilot) { h.autopilot = false; withHuman(h.pid, () => addNews({ cat: 'general', key: 'mp.autopilot', params: { days: this.lastTurn?.days ?? 0 } })); }
      state.rng = rng.state;
      const blob = await serializeState(state);
      const url = await uploadSnapshot(this.creds, this.version + 1, blob);
      this.room = await post<RoomInfo>('commit', { ...this.creds, version: this.version + 1, url, lastApplied: last, date: state.date });
      locked = false;
      this.pristine = blob;
      this.version += 1;
      if (state.humans?.some((h) => h.pid === this.creds.pid)) activate(this.creds.pid, state);
      this.sent = this.sent.filter(([idx]) => idx > last);
      for (const [, a] of this.sent) applyActionAs(this.creds.pid, a);
      this.status = 'idle';
    } catch (e) {
      const msg = String((e as Error).message);
      if (msg !== 'locked' && msg !== 'not-ready' && msg !== 'version') { this.status = 'error'; this.error = msg; }
      else this.status = 'idle';
      if (locked) { try { await post('unlock', { ...this.creds }); } catch { /* ignore */ } }
      // gendan vores egen visning
      if (this.pristine) await this.loadVersion({ ...(this.room as RoomInfo), version: this.version });
    } finally {
      this.busy = false;
      this.emit();
    }
  }
}

let current: OnlineSession | null = null;

export function session(): OnlineSession | null {
  return current;
}

export async function openSession(c: Credentials): Promise<OnlineSession> {
  current?.stop();
  rememberRoom(c);
  rememberLast({ kind: 'online', code: c.code });
  current = new OnlineSession(c);
  await current.start();
  return current;
}

export function closeSession() {
  current?.stop();
  current = null;
}

// ---------- opret / deltag ----------

/** Opret et nyt online spil: værten opretter verden lokalt og uploader første version */
export async function createOnlineGame(world: WorldData, o: NewGameOptions, bots?: { count: number; scope: BotScope }): Promise<OnlineSession> {
  const created = await post<{ code: string; pid: string; token: string }>('create', {
    name: o.managerName, club: o.clubId, settings: { nations: o.activeNations, seed: o.seed, masking: o.masking, deadlineHours: o.deadlineHours ?? 0 },
  });
  const creds: Credentials = { code: created.code, pid: created.pid, token: created.token, name: o.managerName };
  createGame(world, o);
  enableMultiplayer(creds.pid, o.managerName);
  if (bots?.count) setupBots(bots.count, bots.scope);
  const state = gs();
  state.lastActionIdx = 0;
  const blob = await serializeState(state);
  const url = await uploadSnapshot(creds, 1, blob);
  await post('commit', { ...creds, version: 1, url, lastApplied: 0, date: state.date });
  return openSession(creds);
}

export async function joinOnlineGame(code: string, name: string, club: number, nation: number): Promise<OnlineSession> {
  const j = await post<{ code: string; pid: string; token: string }>('join', { code, name, club, nation });
  return openSession({ code: j.code, pid: j.pid, token: j.token, name });
}
