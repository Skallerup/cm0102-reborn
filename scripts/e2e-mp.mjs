// Ende-til-ende-test af online multiplayer med tre browserkontekster (vært + to gæster) mod den rigtige serverkode (api/mp.ts).
// Starter selv Vite (dev) med en middleware, der kører api/mp.ts lokalt; Redis er en in-memory-erstatning (scripts/mp-test/fakeRedis.mjs)
// og øjebliksbillederne gemmes i hukommelsen i stedet for Vercel Blob (VITE_MP_FAKE_BLOB) – ingen rigtige data røres.
//
// Forløb: værten opretter rummet (moderne database, Danmark) → gæst B tilmelder sig via ?room=KODE før første træk (må ikke blokere) →
// værten spiller første træk → B er med → gæst C tilmelder sig midt i spillet → flere træk med Ready fra alle, mindst én kampdag,
// B og værten genindlæser siden undervejs (genoptages – ingen ny manager), en "død" spiller (tilmeldt via API, trykker aldrig Ready)
// springes over med værtens Tving igennem og fjernes med Fjern. Fejler ved sidefejl, dubletter eller et træk, der hænger.
// Kør: npm run e2e:mp   (PORT=<n> for en anden port, HEADED=1 for synlige vinduer, SHOTS=1 for skærmbilleder i e2e-shots/)
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const PORT = Number(process.env.PORT) || 5197;
const BASE = `http://localhost:${PORT}/cm0102-reborn/`;
const OUT = 'e2e-shots';
const TURN_MS = 180_000;
mkdirSync(OUT, { recursive: true });

process.env.VITE_MP_FAKE_BLOB = '1';
// sikkerhed: serverkoden må aldrig få rigtige Redis-nøgler i denne test
delete process.env.KV_REST_API_URL; delete process.env.KV_REST_API_TOKEN; delete process.env.BLOB_READ_WRITE_TOKEN;

const { createServer } = await import('vite');
const blobs = new Map();
const readBody = (req) => new Promise((res, rej) => { const parts = []; req.on('data', (c) => parts.push(c)); req.on('end', () => res(Buffer.concat(parts))); req.on('error', rej); });
let apiCalls = 0;
const server = await createServer({
  configFile: fileURLToPath(new URL('../vite.config.ts', import.meta.url)),
  server: { port: PORT, strictPort: true },
  resolve: { alias: { '@upstash/redis': fileURLToPath(new URL('./mp-test/fakeRedis.mjs', import.meta.url)) } },
  logLevel: 'warn',
  plugins: [{
    name: 'mp-api-local',
    configureServer(srv) {
      srv.middlewares.use(async (req, res, next) => {
        try {
          const url = req.url ?? '';
          if (url.startsWith('/__mpblob/put')) {
            const path = new URL(url, 'http://x').searchParams.get('path');
            blobs.set(path, await readBody(req));
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify({ url: `http://localhost:${PORT}/__mpblob/fake.blob.vercel-storage.com/${path}` }));
            return;
          }
          if (url.startsWith('/__mpblob/fake.blob.vercel-storage.com/')) {
            const b = blobs.get(decodeURIComponent(url.slice('/__mpblob/fake.blob.vercel-storage.com/'.length).split('?')[0]));
            if (!b) { res.statusCode = 404; res.end('missing'); return; }
            res.setHeader('content-type', 'application/gzip');
            res.end(b);
            return;
          }
          if (url.startsWith('/api/mp')) {
            apiCalls++;
            const mod = await srv.ssrLoadModule('/api/mp.ts');
            const body = req.method === 'POST' ? await readBody(req) : undefined;
            const r = await (req.method === 'POST' ? mod.POST : mod.GET)(new Request(`http://localhost:${PORT}${url}`, { method: req.method, headers: { 'content-type': 'application/json' }, body }));
            res.statusCode = r.status;
            r.headers.forEach((v, k) => res.setHeader(k, v));
            res.end(Buffer.from(await r.arrayBuffer()));
            return;
          }
        } catch (e) {
          console.error('mp-api fejl', e);
          res.statusCode = 500; res.end(JSON.stringify({ error: String(e?.message ?? e) }));
          return;
        }
        next();
      });
    },
  }],
});
await server.listen();

const api = async (op, body) => {
  const r = await fetch(`http://localhost:${PORT}/api/mp${op ? `?op=${op}` : ''}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json();
  if (!r.ok) throw new Error(`${op}: ${j.error}`);
  return j;
};
const getRoom = async (code) => (await fetch(`http://localhost:${PORT}/api/mp?code=${code}`)).json();

const browser = await chromium.launch({ headless: !process.env.HEADED });
const failures = [];
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

async function newPlayer(label) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.route(/\/api\/(account|community|notify|rank|hub)\b/, (r) => r.fulfill({ json: {} }));
  page.on('pageerror', (e) => failures.push(`${label}: sidefejl ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error' || process.env.E2E_CONSOLE) log(`[${label}] ${m.type()}: ${m.text().slice(0, 300)}`); });
  await page.addInitScript(() => {
    localStorage.setItem('cm0102.lang', 'en'); localStorage.setItem('cm-theme', 'retro'); localStorage.setItem('cm0102.db', 'modern');
    localStorage.setItem('cm0102.consent', 'denied'); sessionStorage.setItem('cm0102.play', '1');
  });
  return { label, ctx, page };
}
const mod = (p, file) => p.page.evaluate(async (f) => { await import(/* @vite-ignore */ `/cm0102-reborn/src/${f}`); }, file);
/** Sessionens tilstand set fra en side */
const state = (p) => p.page.evaluate(async () => {
  const c = await import(/* @vite-ignore */ '/cm0102-reborn/src/online/client.ts');
  const st = await import(/* @vite-ignore */ '/cm0102-reborn/src/game/state.ts');
  const s = c.session();
  const g = st.hasGame() ? st.gs() : null;
  return s ? { pid: s.creds.pid, code: s.creds.code, version: s.version, inGame: s.inGame, ready: !!s.me?.ready, pending: !!s.me?.pending, status: s.status, error: s.error, players: s.room?.players.length ?? 0, date: g?.date, pf: g?.pendingFixture ?? null } : null;
});

async function waitFor(p, pred, what, ms = TURN_MS) {
  const t0 = Date.now();
  let last;
  while (Date.now() - t0 < ms) {
    last = await state(p).catch(() => null);
    if (last && pred(last)) return last;
    await p.page.waitForTimeout(500);
  }
  const room = await getRoom(code).catch(() => null);
  log('rummet:', JSON.stringify(room && { version: room.version, processing: room.processing, lastApplied: room.lastApplied, actionCount: room.actionCount, players: room.players }));
  throw new Error(`${p.label}: ${what} skete ikke inden ${ms / 1000} s (sidst: ${JSON.stringify(last)})`);
}

/** Tryk Ready som en spiller: læs beskeder, lad assistenten tage dagens kamp, og klik på knappen i sidebjælken */
async function pressReady(p) {
  for (let i = 0; i < 30; i++) {
    const s = await state(p);
    if (s?.ready) return;
    await p.page.evaluate(async () => {
      const c = await import(/* @vite-ignore */ '/cm0102-reborn/src/online/client.ts');
      const st = await import(/* @vite-ignore */ '/cm0102-reborn/src/game/state.ts');
      const g = st.gs();
      for (const n of g.news) n.read = true;
      if (g.pendingFixture) c.skippedMatches.add(g.pendingFixture);
      st.notify();
    });
    const btn = p.page.locator('.cx-side [data-testid=online-continue]');
    if (await btn.isEnabled().catch(() => false)) await btn.click({ timeout: 3000 }).catch((e) => { if (i === 29) failures.push(`${p.label}: klik: ${e.message.split('\n').slice(0, 3).join(' ')}`); });
    await p.page.waitForTimeout(600);
  }
  await p.page.screenshot({ path: `${OUT}/mp-fejl-${p.label.replace(/\W+/g, '-')}.png` }).catch(() => {});
  throw new Error(`${p.label}: kunne ikke melde klar (${JSON.stringify(await state(p))})`);
}

async function step(name, fn) {
  const t0 = Date.now();
  try { await fn(); log(`✓ ${name} (${((Date.now() - t0) / 1000).toFixed(1)} s)`); }
  catch (e) { failures.push(`${name}: ${e.message}`); log(`✗ ${name}: ${e.message}`); throw e; }
}

const host = await newPlayer('vært');
const b = await newPlayer('gæst B');
const c = await newPlayer('gæst C');
let code = '';
let clubs = {};
try {
  await step('værten opretter rummet (Midtjylland, moderne database, Danmark)', async () => {
    await host.page.goto(BASE);
    await host.page.waitForFunction(() => !!window.__cm, null, { timeout: 60_000 });
    const r = await host.page.evaluate(async () => {
      const w = await import(/* @vite-ignore */ '/cm0102-reborn/src/ui/world.ts');
      const cl = await import(/* @vite-ignore */ '/cm0102-reborn/src/online/client.ts');
      const world = await w.loadWorld();
      const find = (name) => world.clubs.find((x) => x[2] === name || x[1] === name);
      const mid = find('Midtjylland'), bro = find('Brøndby'), fck = find('FC København');
      const s = await cl.createOnlineGame(world, { managerName: 'Host Manager', managerNation: mid[3], clubId: mid[0], activeNations: [mid[3]], lang: 'en', masking: true, seed: 12345, mode: 'authentic', deadlineHours: 0 });
      return { code: s.creds.code, clubs: { mid: mid[0], bro: bro[0], fck: fck[0] } };
    });
    code = r.code; clubs = r.clubs;
    await waitFor(host, (s) => s.inGame && s.version === 1, 'første version');
    log('rum', code, clubs);
  });

  const join = async (p, name, clubName) => {
    await p.page.goto(`${BASE}?room=${code}`);
    await p.page.waitForFunction(() => !!window.__cm, null, { timeout: 60_000 });
    // klassisk tilmelding (ClassicJoin): Enter Name → Select Nationality → Select Team → Please Confirm → Join the game
    const [first, second] = name.split(' ');
    await p.page.locator('[data-name=first]').fill(first, { timeout: 60_000 });
    await p.page.locator('[data-name=second]').fill(second);
    await p.page.locator('.cx-next').click();
    await p.page.locator('[data-cxs=nation] [data-nat]').first().click({ timeout: 60_000 });
    await p.page.locator('.cx-next').click();
    await p.page.locator(`[data-cxs=team] [data-club="${clubName}"]`).click({ timeout: 20_000 });
    await p.page.waitForSelector('[data-cxs=confirm]', { timeout: 10_000 });
    await p.page.locator('.cx-next').click();
    await waitFor(p, (s) => s.pid && s.players > 0 && s.version >= 1 && s.status === 'idle', 'tilmelding');
  };

  await step('gæst B tilmelder sig før første træk og venter i lobbyen (blokerer ikke)', async () => {
    await join(b, 'Guest B', 'Brøndby');
    const s = await state(b);
    if (s.inGame || !s.pending) throw new Error(`B burde være tilmeldt, men ikke med endnu: ${JSON.stringify(s)}`);
    await b.page.waitForSelector('[data-testid=online-lobby]', { timeout: 20_000 });
    const lobby = await b.page.locator('[data-testid=online-lobby]').innerText();
    if (!/Joins next turn/.test(lobby)) throw new Error(`lobbyen viser ikke "Joins next turn": ${lobby}`);
    if (process.env.SHOTS) await b.page.screenshot({ path: `${OUT}/mp-lobby.png` });
    // værten venter ikke på B
    await host.page.waitForTimeout(4000);
    const note = await host.page.locator('.cx-side [data-testid=online-note]').innerText().catch(() => '');
    if (/Guest B/.test(note)) throw new Error(`værten venter på gæsten i lobbyen: ${note}`);
  });

  await step('B genindlæser i lobbyen → samme manager (ingen dublet)', async () => {
    const before = await state(b);
    await b.page.reload();
    await waitFor(b, (s) => s.pid === before.pid, 'genoptagelse', 60_000);
    const room = await getRoom(code);
    if (room.players.length !== 2) throw new Error(`forventede 2 managere, fik ${room.players.map((x) => x.name).join(', ')}`);
  });

  await step('træk 1: kun værten trykker Ready → B kommer med', async () => {
    await pressReady(host);
    await waitFor(host, (s) => s.version === 2 && s.status === 'idle', 'træk 1 (vært)');
    await waitFor(b, (s) => s.version === 2 && s.inGame && !s.pending, 'B med i spillet');
  });

  await step('gæst C tilmelder sig midt i spillet', async () => {
    await join(c, 'Guest C', 'FC København');
    const s = await state(c);
    if (s.inGame) throw new Error('C er med før næste træk');
  });

  let ghost;
  await step('en "død" spiller tilmelder sig (via API) og lukker straks', async () => {
    // vælg en ledig klub fra værtens spil
    const free = await host.page.evaluate(async (taken) => {
      const st = await import(/* @vite-ignore */ '/cm0102-reborn/src/game/state.ts');
      const g = st.gs();
      const lg = Object.values(g.comps).find((x) => x.type === 'league' && x.clubs.includes(g.userClub));
      const id = lg.clubs.find((x) => !taken.includes(x));
      return { id, nation: g.clubs[id].nation };
    }, Object.values(clubs));
    ghost = await api('join', { code, name: 'Ghost', club: free.id, nation: free.nation });
  });

  await step('træk 2: vært og B trykker Ready (C og Ghost er nye og blokerer ikke)', async () => {
    await waitFor(b, (s) => s.version === 2 && s.inGame && !s.ready, 'version 2 hentet');
    await pressReady(b);
    await pressReady(host);
    await waitFor(host, (s) => s.version === 3 && s.status === 'idle', 'træk 2');
    await waitFor(c, (s) => s.version === 3 && s.inGame, 'C med i spillet');
  });

  await step('træk 3: Ghost er nu med og trykker aldrig Ready → værten tvinger igennem', async () => {
    for (const p of [b, c]) await waitFor(p, (s) => s.version === 3 && s.inGame && !s.ready, 'version 3 hentet');
    await pressReady(b); await pressReady(c); await pressReady(host);
    const room = await getRoom(code);
    const gh = room.players.find((x) => x.pid === ghost.pid);
    if (!gh || gh.pending || gh.ready) throw new Error(`Ghost burde blokere nu: ${JSON.stringify(gh)}`);
    const hn = await host.page.locator('.cx-side [data-testid=online-note]').innerText();
    if (!/Ghost/.test(hn) && !/Waiting/.test(hn)) throw new Error(`værtens note nævner ikke Ghost: ${hn}`);
    await host.page.evaluate(async () => { const cl = await import(/* @vite-ignore */ '/cm0102-reborn/src/online/client.ts'); await cl.session().forceContinue(); });
    await waitFor(host, (s) => s.version === 4 && s.status === 'idle', 'træk 3 (tvunget)');
  });

  await step('værten fjerner Ghost', async () => {
    await host.page.evaluate(async (pid) => { const cl = await import(/* @vite-ignore */ '/cm0102-reborn/src/online/client.ts'); await cl.session().kick(pid); }, ghost.pid);
    const room = await getRoom(code);
    if (room.players.some((x) => x.pid === ghost.pid)) throw new Error('Ghost er der stadig');
  });

  // flere træk, til mindst én kampdag er overstået (Midtjyllands første kamp har et resultat); genindlæsning undervejs
  let turn = 4;
  let matchDone = false;
  const players = [host, b, c];
  const firstMatch = await host.page.evaluate(async (club) => {
    const st = await import(/* @vite-ignore */ '/cm0102-reborn/src/game/state.ts');
    const g = st.gs();
    return Object.values(g.fixtures).filter((f) => (f.home === club || f.away === club) && g.comps[f.comp]?.type === 'league').map((f) => f.date).sort()[0];
  }, clubs.mid);
  log('Midtjyllands første ligakamp', firstMatch);
  let sawMatchday = false;
  for (let k = 0; k < 40 && !(matchDone && turn >= 7); k++) {
    const v = (await state(host)).version;
    await step(`træk ${turn}${k === 1 ? ' (B genindlæser efter Ready)' : ''}${k === 2 ? ' (værten genindlæser før Ready)' : ''}`, async () => {
      if (k === 2) { await host.page.goto(BASE); await waitFor(host, (s) => s.code === code && s.version === v && s.inGame, 'værten genoptager', 60_000); }
      // alle har hentet trækket (ellers er "klar" fra forrige træk stadig vist)
      for (const p of players) await waitFor(p, (s) => s.version === v && !s.ready && s.status === 'idle', `version ${v} hentet`);
      for (const p of players) if ((await state(p)).pf) sawMatchday = true;
      for (const p of players) await pressReady(p);
      if (k === 1) { await b.page.reload(); await waitFor(b, (s) => s.code === code && s.inGame, 'B genoptager', 60_000); }
      for (const p of players) await waitFor(p, (s) => s.version === v + 1 && s.status === 'idle', `version ${v + 1}`);
      const room = await getRoom(code);
      if (room.players.length !== 3) throw new Error(`managere: ${room.players.map((x) => x.name).join(', ')}`);
      if (room.processing) throw new Error('låsen er ikke frigivet');
    });
    matchDone = await host.page.evaluate(async (club) => {
      const st = await import(/* @vite-ignore */ '/cm0102-reborn/src/game/state.ts');
      const g = st.gs();
      return Object.values(g.fixtures).some((f) => f.result && (f.home === club || f.away === club) && f.comp && g.comps[f.comp]?.type === 'league');
    }, clubs.mid);
    log(`  dato ${(await state(host)).date}, ligakamp spillet: ${matchDone}`);
    turn++;
  }
  if (!matchDone) failures.push('ingen kampdag nået');
  if (!sawMatchday) failures.push('ingen manager havde en kamp at spille (pendingFixture) i et træk');
  // alle ser samme dato og version
  const st = await Promise.all(players.map(state));
  if (new Set(st.map((x) => `${x.version}|${x.date}`)).size !== 1) failures.push(`klienterne er ude af trit: ${JSON.stringify(st)}`);
  if (process.env.SHOTS) for (const p of players) await p.page.screenshot({ path: `${OUT}/mp-${p.label.replace(/\W+/g, '-')}.png` });
} catch (e) {
  if (!failures.length) failures.push(String(e?.message ?? e));
} finally {
  await browser.close();
  await server.close();
}
log(`API-kald: ${apiCalls}`);
if (failures.length) { console.error(`\n${failures.length} fejl:\n- ${failures.join('\n- ')}`); process.exit(1); }
console.log('\nOK – online multiplayer: ingen dødvande');
process.exit(0);
