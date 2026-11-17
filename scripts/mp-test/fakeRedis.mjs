// In-memory erstatning for @upstash/redis – kun til `npm run e2e:mp` (scripts/e2e-mp.mjs aliaser pakken hertil).
// Efterligner Upstash' (de)serialisering: værdier gemmes som tekst, og læsning JSON-parser, hvor det kan lade sig gøre.
// Rører aldrig en rigtig database.
const db = (globalThis.__mpFakeRedis ??= new Map());

const ser = (v) => (typeof v === 'string' ? v : JSON.stringify(v));
const de = (v) => {
  if (v == null) return null;
  try { return JSON.parse(v); } catch { return v; }
};
const hash = (k) => { let h = db.get(k); if (!(h instanceof Map)) { h = new Map(); db.set(k, h); } return h; };
const list = (k) => { let l = db.get(k); if (!Array.isArray(l)) { l = []; db.set(k, l); } return l; };
const set_ = (k) => { let s = db.get(k); if (!(s instanceof Set)) { s = new Set(); db.set(k, s); } return s; };
const idx = (i, n) => (i < 0 ? n + i : i);

export class Redis {
  constructor() { /* ingen forbindelse */ }
  async hgetall(k) { const h = db.get(k); if (!(h instanceof Map) || !h.size) return null; return Object.fromEntries([...h].map(([f, v]) => [f, de(v)])); }
  async hget(k, f) { const h = db.get(k); return h instanceof Map ? de(h.get(f) ?? null) : null; }
  async hset(k, obj) { const h = hash(k); let n = 0; for (const [f, v] of Object.entries(obj)) { if (!h.has(f)) n++; h.set(f, ser(v)); } return n; }
  async hsetnx(k, f, v) { const h = hash(k); if (h.has(f)) return 0; h.set(f, ser(v)); return 1; }
  async hdel(k, ...fs) { const h = db.get(k); if (!(h instanceof Map)) return 0; let n = 0; for (const f of fs) if (h.delete(f)) n++; return n; }
  async expire() { return 1; }
  async get(k) { const v = db.get(k); return typeof v === 'string' ? de(v) : null; }
  async set(k, v, o = {}) { if (o.nx && db.has(k)) return null; db.set(k, ser(v)); if (o.ex) setTimeout(() => { if (db.get(k) === ser(v)) db.delete(k); }, o.ex * 1000).unref?.(); return 'OK'; }
  async del(...ks) { let n = 0; for (const k of ks) if (db.delete(k)) n++; return n; }
  async incr(k) { const n = Number(db.get(k) ?? 0) + 1; db.set(k, String(n)); return n; }
  async llen(k) { const l = db.get(k); return Array.isArray(l) ? l.length : 0; }
  async lrange(k, a, b) { const l = db.get(k); if (!Array.isArray(l)) return []; const n = l.length; return l.slice(Math.max(0, idx(a, n)), idx(b, n) + 1).map(de); }
  async rpush(k, ...vs) { const l = list(k); l.push(...vs.map(ser)); return l.length; }
  async ltrim(k, a, b) { const l = db.get(k); if (!Array.isArray(l)) return 'OK'; const n = l.length; db.set(k, l.slice(Math.max(0, idx(a, n)), idx(b, n) + 1)); return 'OK'; }
  async sadd(k, ...vs) { const s = set_(k); let n = 0; for (const v of vs) if (!s.has(ser(v))) { s.add(ser(v)); n++; } return n; }
  async sismember(k, v) { const s = db.get(k); return s instanceof Set && s.has(ser(v)) ? 1 : 0; }
}
