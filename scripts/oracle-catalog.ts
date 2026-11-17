// Katalog over originalens kørsler (Bosman headless-orakel): ~/cm0102-engine/oracle/{runs,out}.
//   npx tsx scripts/oracle-catalog.ts             skriver ~/cm0102-engine/oracle/CATALOG.md og viser en kort oversigt
//   npx tsx scripts/oracle-catalog.ts --json      katalog som JSON på stdout (skriver intet)
//   npx tsx scripts/oracle-catalog.ts --stdout    markdown på stdout (skriver intet)
//   npx tsx scripts/oracle-catalog.ts <ord>       som standard, men viser kun kørsler/filer hvor navn/målinger/note matcher
// Udledes af filerne selv uden at læse de store: stderr.txt (små), .log (1 linje), settings.txt, de første bytes af sporfiler, filnavne og
// størrelser. Starter aldrig binæren og rører ikke ~/Library/Application Support/cm0102.
// Frø: står kun i mappenavnet (seedN-…) – ellers er det run_season.py's standard 1 (kørslen er ikke mærket; "?" hvis kørslen ikke er
// run_season-lignende). Dato-interval: stderr's "date D/ÅÅÅÅ" (dag i året fra 0) første/sidste efter spilstart.
import { closeSync, existsSync, openSync, readFileSync, readSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const ENGINE = process.env.CM_ENGINE ?? join(homedir(), 'cm0102-engine');
const ORACLE = join(ENGINE, 'oracle');
const RUNS = join(ORACLE, 'runs'), OUT = join(ORACLE, 'out');
const args = process.argv.slice(2);
const flag = (f: string) => args.includes(f);
const filter = args.filter((a) => !a.startsWith('--')).join(' ').toLowerCase();

const head = (f: string, n = 400): string => { const fd = openSync(f, 'r'); try { const b = Buffer.alloc(n); const k = readSync(fd, b, 0, n, 0); return b.toString('latin1', 0, k); } finally { closeSync(fd); } };
const sizeOf = (p: string): number => {
  const s = statSync(p);
  if (!s.isDirectory()) return s.size;
  let t = 0;
  for (const e of readdirSync(p)) { try { t += sizeOf(join(p, e)); } catch { /* væk */ } }
  return t;
};
const mb = (b: number) => (b >= 1e9 ? `${(b / 1e9).toFixed(1)} GB` : b >= 1e6 ? `${Math.round(b / 1e6)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`);

/** hvad en fil i files/ (originalens brugermappe) indeholder af målinger */
const FILE_MEASURES: [RegExp, string][] = [
  [/^match_stats_matches\.tmp$/, 'holdstatistik pr. kamp (skud, hjørner, frispark …)'],
  [/^fixtures_\d{4}\.tmp$/, 'kampprogram + resultater (mål/kamp)'],
  [/^samesave\.sav$/, 'gemt spil (økonomi finance.dat, stab, spillere, kontrakter)'],
  [/^player stats history\.tmp$/, 'spillerstatistik pr. sæson'],
  [/^staff history\.tmp$/, 'stab/manager-historik (jobskift)'],
  [/^injury_history\.tmp$/, 'skadeshistorik'],
  [/^ban_history\.tmp$/, 'karantæner'],
  [/^(human|computer) events\d\.tmp$/, 'begivenheder (transfers/nyheder)'],
  [/^club (league )?history\.tmp$/, 'klubhistorik (ligaplaceringer)'],
  [/^club cup history\.tmp$/, 'klubhistorik (pokaler)'],
  [/^(club|comp) records history\.tmp$/, 'klub-/turneringsrekorder'],
  [/_\d+\.tmp$/, 'turneringsfiler (tabeller/runder)'],
  [/^past_(team|year)_awards\.tmp$/, 'priser'],
  [/^(uefa|conmebol)_seeding\.tmp$/, 'seedning (Europa/Sydamerika)'],
  [/^club_dates\.tmp$/, 'klubdatoer'],
  [/^hall_of_fame\.bin$/, 'hall of fame'],
];
/** hvad en sporfil (<navn>[-suffiks].txt) indeholder – efter suffiks og navnets bogstavpræfiks (RECOMP_*_TRACE i run_season.py) */
const TRACE_BY_SUFFIX: Record<string, string> = {
  aimode: 'AI-tilstand 0x6df460 (indgange pr. kald)', ticks: 'kampmotorens tik', pick: 'udtagelse (PICK_TRACE)', sq: 'trupdata (SQ_TRACE)',
  mv: 'bevægelser/transfers (MV)', ps: 'spillerstatistik (PS_TRACE)', calls: 'funktionskald (jsonl)', snap: 'før/efter-dumps',
};
const TRACE_BY_STEM: [RegExp, string][] = [
  [/^ct\d/, 'kontrakter (CT_TRACE)'], [/^dv\d/, 'udvikling (DV_TRACE)'], [/^fit\d/, 'kondition/skader (FIT_TRACE)'], [/^crowd\d/, 'tilskuere (CROWD_TRACE)'],
  [/^ps\d|^psq\d/, 'spillerstatistik/trup (PS/SQ_TRACE)'], [/^sq\d/, 'trupdata (SQ_TRACE)'], [/^pd\d/, 'spillerdata (PD_TRACE)'], [/^pick\d/, 'udtagelse (PICK_TRACE)'],
  [/^(trace|ls|cup|tshot|tfoul|toff|md|pen|aimode)\d*/, 'kampmotor-spor (MATCH_TRACE)'], [/^mv\d/, 'bevægelser (MV)'], [/^subs\d/, 'udskiftninger'],
];
const FIRST_TAG: Record<string, string> = { cf: 'kontrakt/kamp-linjer', S: 'spillerdata', B: 'kampspor', F: 'kampspor', SA: 'spillerdata', MV: 'kampspor (MV)', M: 'kampspor', D: 'AI-tilstand' };

interface Run {
  name: string; seed: string; database?: string; days?: string; script?: string; settings?: Record<string, string>;
  from?: string; to?: string; exit?: string; seconds?: number; finished?: string; bytes: number; mtime: string; dir: boolean;
  fileCount?: number; measures: string[]; artifacts: { file: string; bytes: number; kind?: string }[]; mentions?: string[]; stderr?: string;
}
interface OutFile { file: string; bytes: number; keys?: string[]; matches?: number; note?: string }

const dayToIso = (day: number, year: number) => new Date(Date.UTC(year, 0, 1 + day)).toISOString().slice(0, 10);

// ---- noter: hvor nævnes en kørsel
const noteLines: { f: string; i: number; t: string }[] = [];
const noteDir = join(ENGINE, 'notes');
function readNotes(dir: string) {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) readNotes(p);
    else if (e.name.endsWith('.md')) readFileSync(p, 'utf8').split('\n').forEach((t, i) => { if (/oracle\/runs|runs\/|kørsel|run /i.test(t) || /`[a-z]+\d+`/.test(t)) noteLines.push({ f: p.slice(ENGINE.length + 1), i: i + 1, t }); });
  }
}
readNotes(noteDir);
const mentions = (name: string): string[] => {
  if (name.length < 3) return [];
  const re = new RegExp(`(^|[^A-Za-z0-9_-])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^A-Za-z0-9_]|$)`);
  return noteLines.filter((l) => re.test(l.t)).slice(0, 2).map((l) => `${l.f}:${l.i}`);
};

// ---- kørsler: mapper (run_season) og løse filer med samme grundnavn
const entries = existsSync(RUNS) ? readdirSync(RUNS, { withFileTypes: true }) : [];
const groups = new Map<string, { dir?: string; files: string[] }>();
const baseOf = (n: string) => n.replace(/\.(txt|log|jsonl)$/, '').replace(/-(aimode|ticks|pick|sq|mv|ps|calls|snap)$/, '');
for (const e of entries) {
  const n = baseOf(e.name);
  const g = groups.get(n) ?? { files: [] };
  if (e.isDirectory() && !/\.(txt|log)$/.test(e.name) && baseOf(e.name) === e.name) g.dir = e.name; else g.files.push(e.name);
  groups.set(n, g);
}

const runs: Run[] = [];
for (const [name, g] of [...groups].sort((a, b) => a[0].localeCompare(b[0], 'en', { numeric: true }))) {
  if (g.files.length && !g.dir && g.files.every((f) => /^cm0102_recomp/.test(f))) continue;   // kun en binær
  const r: Run = { name, seed: '?', bytes: 0, mtime: '', dir: !!g.dir, measures: [], artifacts: [] };
  const mset = new Set<string>();
  let latest = 0;
  const addArt = (file: string, kind?: string) => { const p = join(RUNS, file); const s = statSync(p); latest = Math.max(latest, s.mtimeMs); r.bytes += sizeOf(p); r.artifacts.push({ file, bytes: sizeOf(p), kind }); };
  for (const f of g.files) {
    const p = join(RUNS, f);
    if (/^cm0102_recomp/.test(f)) continue;
    if (f.endsWith('.log') && statSync(p).size < 4000) {
      const t = readFileSync(p, 'utf8').trim();
      const m = /kode (\S+) efter (\d+) s/.exec(t);
      if (m) { r.exit = m[1]; r.seconds = +m[2]; }
      addArt(f, 'log'); continue;
    }
    const suffix = /-(aimode|ticks|pick|sq|mv|ps|calls|snap)\.(txt|jsonl)$/.exec(f)?.[1];
    let kind = suffix ? TRACE_BY_SUFFIX[suffix] : TRACE_BY_STEM.find(([re]) => re.test(name))?.[1];
    if (!kind && f.endsWith('.txt')) { const tag = /^([A-Za-z]+\d?)[ \t]/.exec(head(p, 40))?.[1]; kind = tag ? `spor (første linje «${tag}»${FIRST_TAG[tag] ? ' – ' + FIRST_TAG[tag] : ''})` : 'spor'; }
    addArt(f, kind);
    if (kind) mset.add(kind);
  }
  if (g.dir) {
    const d = join(RUNS, g.dir);
    r.bytes += sizeOf(d); latest = Math.max(latest, statSync(d).mtimeMs);
    r.artifacts.push({ file: `${g.dir}/`, bytes: sizeOf(d), kind: 'kørselsmappe' });
    const fdir = existsSync(join(d, 'files')) ? join(d, 'files') : existsSync(join(d, 'user')) ? join(d, 'user') : '';
    if (fdir) {
      const fl = readdirSync(fdir);
      r.fileCount = fl.length;
      // alle kørsler har originalens standardfiler (historik, turneringer …) – kun de, der siger noget om kørslen, tælles som målinger
      const ms = fl.find((f) => f === 'match_stats_matches.tmp');
      if (ms && statSync(join(fdir, ms)).size > 100_000) mset.add(FILE_MEASURES[0][1]);
      if (fl.some((f) => /^fixtures_\d{4}\.tmp$/.test(f) && statSync(join(fdir, f)).size > 100_000)) mset.add(FILE_MEASURES[1][1]);
      if (fl.includes('samesave.sav')) mset.add(FILE_MEASURES[2][1]);
    }
    const sp = join(d, 'user', 'settings.txt');
    if (existsSync(sp)) {
      r.settings = {};
      for (const l of readFileSync(sp, 'utf8').split('\n')) { const m = /^(\w+)\s*=\s*(\S+)/.exec(l); if (m && ['display', 'database', 'changing_rules', 'faster_days'].includes(m[1])) r.settings[m[1]] = m[2]; }
      r.database = r.settings.database;
    }
    const ep = join(d, 'stderr.txt');
    if (existsSync(ep) && statSync(ep).size < 30e6) {
      r.stderr = ep.slice(ENGINE.length + 1);
      const t = readFileSync(ep, 'latin1');
      // dato-interval: "date D/ÅÅÅÅ" efter spilstart (0/2001 = før spillet)
      const ds = [...t.matchAll(/date (\d+)\/(\d{4})/g)].map((m) => [+m[1], +m[2]] as const).filter(([d0, y]) => !(d0 === 0 && y === 2001));
      if (ds.length) { const iso = ds.map(([d0, y]) => dayToIso(d0, y)).sort(); r.from = iso[0]; r.to = iso[iso.length - 1]; }
      const sv = /saved .*? after (\d+) game days/.exec(t); if (sv) r.days = sv[1];
      const fin = [...t.matchAll(/game date (\d+)\/(\d{4}) at a human turn/g)].pop(); if (fin) r.finished = dayToIso(+fin[1], +fin[2]);
      // manuskriptet: de skrevne tekster + antal trin (varianter adskiller sig i land/klub/klik)
      const sc = [...t.matchAll(/recomp: script (?:\d+ )?(click|type|key|wait) ?([^\n]*)/g)].map((m) => `${m[1]} ${m[2].trim()}`);
      const typed = [...t.matchAll(/script \d+ type ([^\n]*)/g)].map((m) => m[1].trim());
      r.script = `${sc.filter((s) => s.startsWith('click')).length} klik${typed.length ? `, skrevet «${typed.join(' ')}»` : ''}${/Go on Holiday|0x6b2d80/.test(t) ? ', ferie' : ''}`;
    }
    if (!r.exit) {
      const lp = join(RUNS, name + '.log');
      if (existsSync(lp)) { const m = /kode (\S+) efter (\d+) s/.exec(readFileSync(lp, 'utf8')); if (m) { r.exit = m[1]; r.seconds = +m[2]; } }
    }
    const sm = /^seed(\d+)/.exec(name);
    r.seed = sm ? sm[1] : existsSync(ep) ? '1*' : '?';
    const dm = /d(\d+)-(\d\.\d\.\d+)$/.exec(name); if (dm) { r.days ??= dm[1]; r.database ??= dm[2]; }
  }
  r.measures = [...mset];
  r.mtime = new Date(latest).toISOString().slice(0, 10);
  r.mentions = mentions(name);
  runs.push(r);
}

// ---- out/: færdige udtræk
const outs: OutFile[] = [];
function scanOut(dir: string, rel = '') {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { scanOut(p, `${rel}${e.name}/`); continue; }
    const o: OutFile = { file: rel + e.name, bytes: statSync(p).size };
    if (e.name.endsWith('.json')) {
      if (o.bytes < 2e6) { try { const j = JSON.parse(readFileSync(p, 'utf8')) as Record<string, unknown>; o.keys = Object.keys(j).slice(0, 12); if (Array.isArray(j.matches)) o.matches = j.matches.length; } catch { /* ikke json-objekt */ } }
      else { const h = head(p, 6000); o.keys = [...new Set([...h.matchAll(/"([A-Za-z_][\w]*)":/g)].map((m) => m[1]))].slice(0, 12); const m = /"matches"/.test(h); if (m) o.note = 'indeholder kampe'; }
    }
    outs.push(o);
  }
}
scanOut(OUT);
const finDays = outs.filter((o) => /^fin\/d\d+\.json$/.test(o.file)).map((o) => +/d(\d+)/.exec(o.file)![1]).sort((a, b) => a - b);

// ---- uddata
const match = (...s: (string | undefined)[]) => !filter || s.join(' ').toLowerCase().includes(filter);
const fr = runs.filter((r) => match(r.name, r.measures.join(' '), r.script, r.database, r.mentions?.join(' ')));
const fo = outs.filter((o) => match(o.file, o.keys?.join(' '), o.note));

if (flag('--json')) {
  console.log(JSON.stringify({ generated: new Date().toISOString().slice(0, 10), root: ORACLE, runs: fr, out: fo }, null, 1));
  process.exit(0);
}

const L: string[] = [];
L.push('# Katalog over orakelkørsler', '');
L.push(`Genereret af \`npx tsx scripts/oracle-catalog.ts\` (cm0102-repoet) ${new Date().toISOString().slice(0, 10)} – ret ikke i hånden, kør scriptet igen. \`--json\` giver samme data maskinlæsbart.`, '');
L.push(`${fr.length} kørsler i \`oracle/runs/\` (${mb(fr.reduce((s, r) => s + r.bytes, 0))}), ${fo.length} udtræk i \`oracle/out/\`. Frø står kun i mappenavnet (\`seedN-…\`); resten er kørt med run_season.py's standard (frø 1, database 3.9.60, Arsenal på ferie, 330 dage), og scriptvarianten ses af «script»-kolonnen. Dato = spildatoer i stderr.txt (efter spilstart).`, '');
const kinds = new Map<string, number>();
for (const r of fr) for (const m of r.measures) kinds.set(m, (kinds.get(m) ?? 0) + 1);
L.push('## Målinger → kørsler', '');
for (const [k, n] of [...kinds].sort((a, b) => b[1] - a[1])) L.push(`- **${k}** (${n}): ${fr.filter((r) => r.measures.includes(k)).slice(0, 14).map((r) => r.name).join(', ')}${n > 14 ? ' …' : ''}`);
if (finDays.length) L.push('', `- **klubøkonomi pr. dag** (\`out/fin/d<dag>.json\`, frø 1, 3.9.60): dag ${finDays.join(', ')}`);
L.push('', '## Kørsler', '', '| kørsel | frø | database | dato-interval | sidst set | kode/tid | script | målinger | størrelse | nævnt i |', '|---|---|---|---|---|---|---|---|---|---|');
for (const r of fr) {
  L.push(`| \`${r.name}\` | ${r.seed} | ${r.database ?? ''} | ${r.from ? `${r.from} → ${r.to}` : ''}${r.days ? ` (${r.days} dage)` : ''} | ${r.finished ?? ''} | ${r.exit ?? ''}${r.seconds ? ` / ${r.seconds} s` : ''} | ${r.script ?? ''} | ${r.measures.map((m) => m.replace(/\|/g, '/')).join('; ')} | ${mb(r.bytes)} | ${r.mentions?.join(', ') ?? ''} |`);
}
L.push('', '## Udtræk (`oracle/out/`)', '', '| fil | størrelse | indhold |', '|---|---|---|');
for (const o of fo) L.push(`| \`${o.file}\` | ${mb(o.bytes)} | ${[o.keys?.length ? 'nøgler: ' + o.keys.join(', ') : '', o.matches ? `${o.matches} kampe` : '', o.note ?? ''].filter(Boolean).join(' · ')} |`);
L.push('');
const md = L.join('\n');

if (flag('--stdout')) { console.log(md); process.exit(0); }
if (!filter) writeFileSync(join(ORACLE, 'CATALOG.md'), md);
console.log(`${fr.length} kørsler (${mb(fr.reduce((s, r) => s + r.bytes, 0))}), ${fo.length} udtræk${filter ? ` (filter «${filter}»)` : ` → ${join(ORACLE, 'CATALOG.md')}`}`);
for (const [k, n] of [...kinds].sort((a, b) => b[1] - a[1]).slice(0, 12)) console.log(`  ${String(n).padStart(3)} × ${k}`);
if (filter) for (const r of fr.slice(0, 30)) console.log(`  ${r.name.padEnd(22)} frø ${r.seed.slice(0, 1)} ${r.database ?? ''} ${r.from ?? ''}→${r.to ?? ''} ${mb(r.bytes)} ${r.measures.join('; ')}`);
