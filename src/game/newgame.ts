// Opret et nyt spil ud fra world.json
import { initialTransferList } from './transfers';
import { startScoreSeason } from './rating';
import { naturalRole } from './attributes';
import { europeanQualifiers, setupChampionsLeague, setupCup, setupLeague, setupUefaCup } from './competitions';
import { ageOn } from './dates';
import {
  caFromValue, makePlayer, makeStaff, randomDob, randomName, valueFromCA, wageFor, type SubPos,
} from './data/generate';
import { rulesFor, LEAGUE_RULES } from './leagues';
import { Rng, hash, rng } from './rng';
import { setEconomy } from './econ';
import { addNews, addPlayer, ensureNumbers, gs, rebuildIndexes, setAutoNumbers, setGame, squad } from './state';
import { asOwner } from './humans';
import { initReleaseClauses } from './clauses';
import { refreshShortlists, windowLastDay, windowOpen } from './transfers';
import { autoSelect, newTactic, FORMATIONS } from './tactics';
import type { Club, GameState, Lang, Player, Role, Staff, StaffRole } from './types';
import type { CMWorld } from './data/cm0102';
import { setBoardExpectation } from './board';
import { fairTicketPrice, transferBudgetFor } from './finance';
import { initKnowledge } from './scouting';
import { CHALLENGES } from './challenges';
import { monthlyDevelopment, recordDevelopment } from './training';

export interface WorldData {
  version: number;
  source: string;
  season: number;
  nations: { name: string; code: string }[];
  /** `hidden`: klubber uden for de spilbare ligaer (originalens ikke-spilbare lande) – ligaen spilles aldrig */
  leagues: { id: string; name: string; nation: number; tier: number; hidden?: boolean }[];
  clubs: [number, string, string, number, string, string, number, string][];
  playerFields: string[];
  players: (string | number)[][];
  names: Record<string, [string[], string[]]>;
  /** databaseeditoren: saldo ved start og klubber med selvvalgt omdømme (intet loft for 2. række) */
  clubBalance?: Record<number, number>;
  clubRepEdited?: number[];
}

export interface NewGameOptions {
  managerName: string;
  managerNation: number;
  clubId: number;
  activeNations: number[];
  lang: Lang;
  masking: boolean;
  seed: number;
  challenge?: string;
  /** Online: frist pr. træk i timer (0 = ingen) */
  deadlineHours?: number;
}

/** Indtægtsniveau i den originale database (kalibreret med scripts/econ-run.ts: løn ≈ 60 % af omsætningen) */
export let ORIGINAL_INCOME = 0.55;
export const setOriginalIncome = (v: number) => { ORIGINAL_INCOME = v; };

/** pund → spillets interne euro (samme kurs som valutavisningen i i18n) */
const GBP = 0.86;

const PALETTE = ['#c8102e', '#003399', '#ffffff', '#111111', '#ffd200', '#00843d', '#6cabdd', '#7a263a', '#f68b1f', '#5c2d91', '#0057b8', '#e30613'];

export const START_DATE = (season: number) => `${season}-07-01`;

/** Hvilken CM-database et spil bruger ('original' = 3.9.68 fra 2001, 'cm' = 2026/27); null = den moderne database */
export function cmDatabase(g: GameState): 'cm' | 'original' | null {
  if (g.dbKind !== 'cm0102') return null;
  const start = g.dbYear ?? g.seasonHistory?.[0]?.season ?? g.season;
  return start < 2020 ? 'original' : 'cm';
}

export function createGame(world: WorldData, o: NewGameOptions): GameState {
  const season = world.season;
  const date = START_DATE(season);
  const seed = o.seed >>> 0;
  rng.state = seed || 1;
  const names: Record<number, [string[], string[]]> = {};
  for (const [k, v] of Object.entries(world.names)) names[Number(k)] = v;

  const g: GameState = {
    version: 1,
    id: `save-${Date.now().toString(36)}`,
    seed,
    rng: rng.state,
    date,
    season,
    lang: o.lang,
    userClub: o.clubId,
    manager: { name: o.managerName, nation: o.managerNation, rep: 40, history: [], trophies: [], sacked: 0 },
    board: { confidence: 60, expectation: 'mid', expectedPos: 10, warnings: 0 },
    options: { masking: o.masking, autosave: true, matchSpeed: 650, fullCommentary: true, rules: world.source.startsWith('Championship Manager 01/02') ? 'classic' : 'modern' },
    activeNations: o.activeNations.slice(),
    nations: world.nations,
    leagueOrder: world.leagues.map((l) => l.id),
    leagues: Object.fromEntries(world.leagues.map((l) => [l.id, { name: l.name, nation: l.nation, tier: l.tier, ...(l.hidden ? { hidden: true } : {}) }])),
    players: {},
    clubs: {},
    staff: {},
    comps: {},
    fixtures: {},
    news: [],
    knowledge: {},
    shortlist: [],
    offers: [],
    tactic: null,
    savedTactics: [],
    reports: {},
    seasonHistory: [],
    challenge: null,
    names,
    nextId: { player: 10_000_000, staff: 1, news: 1, fixture: 1, offer: 1, tie: 1 },
    pendingFixture: null,
    dayDone: false,
    vacancies: [],
    jobOffers: [],
  };
  const cm = (world as Partial<CMWorld>).kind === 'cm0102' ? (world as CMWorld) : null;
  if (cm) { g.dbKind = 'cm0102'; g.dbYear = season; g.customRules = cm.rules as GameState['customRules']; if (cm.officials?.length) g.officials = cm.officials; }
  // den originale 01/02-database spilles i 2001-priser (econ.ts); ligaernes niveau måles, når trupperne er klar
  if (cm && season < 2020) g.econ = { k: 0.5, leagues: {} };
  setGame(g);

  const leagueById = new Map(world.leagues.map((l) => [l.id, l]));

  // Klubber
  for (const [id, name, short, nation, league, stadium, seats] of world.clubs) {
    const h = hash(id);
    g.clubs[id] = {
      id, name, short, nation, league, stadium: stadium || `${short} Stadium`, seats: seats || 5000,
      rep: 30, balance: 0, transferBudget: 0, wageBudget: 0, youth: 10, facilities: 10,
      colors: [PALETTE[h % PALETTE.length], PALETTE[(h >>> 8) % PALETTE.length]],
      manager: 0, tactic: null,
      finance: emptyFinance(),
      history: [],
      ticketPrice: 25,
    };
    if (g.clubs[id].colors[0] === g.clubs[id].colors[1]) g.clubs[id].colors[1] = g.clubs[id].colors[0] === '#ffffff' ? '#111111' : '#ffffff';
  }

  // Spillere (trøjenumrene uddeles samlet, når trupperne er fyldt op)
  setAutoNumbers(false);
  const F = Object.fromEntries(world.playerFields.map((f, i) => [f, i]));
  // originalens ugentlige lønninger (£, staff.dat 78) – kun den originale database bruger dem (2001-økonomien)
  const dbWage = new Map<number, number>();
  if (g.econ && F.wage !== undefined) for (const r of world.players) if ((r[F.wage] as number) > 0) dbWage.set(r[F.id] as number, Math.round((r[F.wage] as number) / GBP));
  for (const r of world.players) {
    const club = r[F.club] as number;
    if (club && !g.clubs[club]) continue;
    const dob = r[F.dob] as string;
    const age = ageOn(dob, date);
    const value = r[F.value] as number;
    const league = club ? g.clubs[club].league : '';
    const wealth = league ? rulesFor(league, 20).wealth : 0.5;
    const p = makePlayer({
      id: r[F.id] as number, first: r[F.first] as string, last: r[F.last] as string, dob, nation: r[F.nation] as number,
      club, sub: r[F.pos] as SubPos, foot: r[F.foot] as Player['foot'], height: r[F.height] as number,
      ca: cm?.ratings[r[F.id] as number]?.ca ?? caFromValue(value, age), value, caps: r[F.caps] as number, intGoals: r[F.intGoals] as number,
      stats: { apps: r[F.apps] as number, minutes: r[F.minutes] as number, goals: r[F.goals] as number, assists: r[F.assists] as number, yellows: r[F.yellows] as number, reds: r[F.reds] as number },
      contractEnd: (r[F.contract] as string) || undefined, date, seed, wealth,
    });
    // CM 01/02: originalens evner, potentiale og positioner
    const rt = cm?.ratings[p.id];
    if (rt) {
      // evner originalen ikke har sat (0) beholder rolleprofilen fra position og CA
      // tilfældigt potentiale som i CM 01/02: PA -2 = 150-200, -1 = 100-150 – trukket på ny i hvert nyt spil
      // (Cherno Samba, Quaresma, Cassano …); ellers databasens PA
      const rolled = rt.paRaw === -2 ? 150 + (hash(seed, p.id, 77) % 51) : rt.paRaw === -1 ? 100 + (hash(seed, p.id, 77) % 51) : rt.pa;
      p.ca = rt.ca; p.pa = Math.max(rt.ca, rolled); p.attrs = rt.attrs.map((v, i) => (v > 0 ? v : p.attrs[i])); p.pos = rt.pos.slice(); p.side = rt.side.slice();
    }
    if (!value) p.value = valueFromCA(p.ca, p.pa, age);
    // CM 01/02: trøjenummeret fra databasen (dubletter og manglende numre ordnes efter, at trupperne er fyldt op)
    if (F.number !== undefined && (r[F.number] as number) > 0) p.number = r[F.number] as number;
    addPlayer(p);
  }

  // Fyld trupper op
  const leagueLevel = new Map<string, number>();
  for (const l of world.leagues) {
    const cas: number[] = [];
    for (const c of Object.values(g.clubs)) {
      if (c.league !== l.id) continue;
      const sq = squad(c.id);
      if (sq.length >= 12) cas.push(median(sq.map((p) => p.ca)));
    }
    leagueLevel.set(l.id, cas.length ? median(cas) : l.tier === 2 ? 85 : 95);
  }
  for (const c of Object.values(g.clubs)) {
    // skjulte klubber (spiller ingen kampe) beholder databasens trup
    if (g.leagues[c.league]?.hidden) continue;
    const sq = squad(c.id);
    const lvl = sq.length >= 12 ? median(sq.map((p) => p.ca)) : (leagueLevel.get(c.league) ?? 90) - 4;
    fillSquad(c, sq, lvl, date, seed);
  }
  // trøjenumre: alle i hver trup får et unikt nummer
  for (const c of Object.values(g.clubs)) ensureNumbers(c.id);
  setAutoNumbers(true);

  // 2001-priser: pengeniveauet pr. liga = forholdet mellem klubbernes trupværdier (top 20) i 2001-priser og i
  // nutidens priser – så TV-penge, sponsorer, præmier og billetpriser passer til spillerværdierne i hver liga
  if (g.econ) {
    const top = (vals: number[]) => vals.sort((a, b) => b - a).slice(0, 20).reduce((x, v) => x + v, 0);
    const per: Record<string, number[]> = {};
    for (const c of Object.values(g.clubs)) {
      const sq = squad(c.id);
      if (sq.length < 11) continue;
      const wealth = rulesFor(c.league, 20).wealth;
      // med originalens lønninger: forholdet mellem klubbens rigtige lønsum i 2001 og den lønsum, nutidens
      // formel ville give – så indtægterne passer til de lønninger, originalen faktisk betaler
      const paid = sq.filter((p) => dbWage.has(p.id));
      if (paid.length >= 11) {
        const real = paid.reduce((x, p) => x + dbWage.get(p.id)!, 0);
        setEconomy(null);
        const now = paid.reduce((x, p) => x + wageFor(valueFromCA(p.ca, p.pa, ageOn(p.dob, date)), wealth), 0);
        setEconomy(g.econ);
        (per[c.league] ??= []).push(real / Math.max(1, now));
        continue;
      }
      const old = top(sq.map((p) => p.value));
      setEconomy(null);
      const now = top(sq.map((p) => valueFromCA(p.ca, p.pa, ageOn(p.dob, date))));
      setEconomy(g.econ);
      (per[c.league] ??= []).push(old / Math.max(1, now));
    }
    const med = (xs: number[]) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)];
    for (const [l, xs] of Object.entries(per)) g.econ.leagues[l] = Math.round(med(xs) * 1000) / 1000;
    const tops = world.leagues.filter((l) => l.tier === 1 && g.econ!.leagues[l.id]).map((l) => g.econ!.leagues[l.id]);
    if (tops.length) g.econ.k = Math.round(med(tops) * 1000) / 1000;
    // indtægterne i forhold til lønningerne (originalens lønninger er sat ud fra databasen, se econ.ts)
    g.econ.income = ORIGINAL_INCOME;
    // nye kontrakter: lønformlen kalibreret til originalens egne lønninger (median af rigtig løn / formel)
    if (dbWage.size) {
      setEconomy(g.econ);
      // log(løn) = a[liga] + b·log(værdi): fælles hældning b (inden for ligaerne), niveau a pr. liga
      // [log værdi, klubomdømme, log løn] pr. liga; hældningerne b og c findes inden for ligaerne (mindste kvadrater)
      const pts: Record<string, [number, number, number][]> = {};
      for (const c of Object.values(g.clubs)) for (const p of squad(c.id)) {
        if (dbWage.has(p.id) && p.ca >= 80 && p.value > 0) (pts[c.league] ??= []).push([Math.log(Math.max(20_000, p.value)), cm?.clubRep[c.id] ?? c.rep, Math.log(dbWage.get(p.id)!)]);
      }
      let s11 = 0, s12 = 0, s22 = 0, s1y = 0, s2y = 0;
      const ok = Object.keys(pts).filter((l) => pts[l].length >= 15);
      for (const l of ok) {
        const xs = pts[l], n = xs.length;
        const m = [0, 1, 2].map((k) => xs.reduce((a, v) => a + v[k], 0) / n);
        for (const v of xs) {
          const x1 = v[0] - m[0], x2 = v[1] - m[1], y = v[2] - m[2];
          s11 += x1 * x1; s12 += x1 * x2; s22 += x2 * x2; s1y += x1 * y; s2y += x2 * y;
        }
      }
      const det = s11 * s22 - s12 * s12;
      if (ok.length && det > 0) {
        const b = Math.round(((s1y * s22 - s2y * s12) / det) * 1000) / 1000;
        const cr = Math.round(((s2y * s11 - s1y * s12) / det) * 10000) / 10000;
        const a: Record<string, number> = {}, rep: Record<string, number> = {};
        // niveauet rammer ligaens samlede lønsum (ikke snittet af logaritmerne, der ville ramme stjernerne for lavt)
        for (const l of ok) {
          const xs = pts[l];
          a[l] = Math.round(Math.log(xs.reduce((s2, v) => s2 + Math.exp(v[2]), 0) / xs.reduce((s2, v) => s2 + Math.exp(b * v[0] + cr * v[1]), 0)) * 1000) / 1000;
          rep[l] = Math.round(xs.reduce((s2, v) => s2 + v[1], 0) / xs.length);
        }
        const firsts = world.leagues.filter((l) => l.tier === 1 && a[l.id] !== undefined).map((l) => a[l.id]);
        g.econ.wageFit = { b, c: cr, a, rep, a0: firsts.length ? med(firsts) : med(Object.values(a)) };
      }
    }
    setEconomy(g.econ);
  }

  // Reputation og økonomi
  for (const c of Object.values(g.clubs)) {
    const sq = squad(c.id);
    const values = sq.map((p) => p.value).sort((a, b) => b - a).slice(0, 20);
    const sv = values.reduce((s, v) => s + v, 0);
    c.rep = cm?.clubRep[c.id] ?? Math.round(Math.max(5, Math.min(98, (Math.log10(Math.max(sv, 1e6)) - 6) * 30)));
    const lg = leagueById.get(c.league);
    if (lg?.tier === 2 && !world.clubRepEdited?.includes(c.id)) c.rep = Math.min(c.rep, 62);
    if (cm?.clubColors[c.id]) c.colors = cm.clubColors[c.id];
    const wealth = rulesFor(c.league, 20).wealth;
    for (const p of sq) if (p.contract) p.contract.wage = dbWage.get(p.id) ?? wageFor(p.value, wealth, c.league, c.rep);
    const wages = sq.reduce((s, p) => s + (p.contract?.wage ?? 0), 0);
    c.wageBudget = Math.round((wages * 1.08) / 1000) * 1000;
    c.balance = Math.round((sv * 0.12 + wages * 30) / 100_000) * 100_000;
    // databaseeditoren kan sætte klubbens saldo ved start
    const bal = world.clubBalance?.[c.id];
    if (bal !== undefined) c.balance = bal;
    c.transferBudget = transferBudgetFor(sv, wealth, c.balance);
    c.youth = clampInt(4 + c.rep / 7 + (hash(c.id, 3) % 5) - 2, 1, 20);
    c.facilities = clampInt(3 + c.rep / 6 + (hash(c.id, 4) % 5) - 2, 1, 20);
    // originalens saldo og træningsanlæg (club.dat 101/127)
    const fin = cm?.clubFinance?.[c.id];
    if (fin && g.econ) {
      if (world.clubBalance?.[c.id] === undefined) c.balance = Math.round(fin[0] / GBP / 10_000) * 10_000;
      if (fin[2] > 0) c.facilities = clampInt(fin[2], 1, 20);
      c.transferBudget = transferBudgetFor(sv, wealth, c.balance);
    }
    c.ticketPrice = fairTicketPrice(c.rep, c.league);
    if (!c.seats || c.seats < 1000) c.seats = Math.round(2000 + c.rep * c.rep * 6);
  }

  // Staff
  for (const c of Object.values(g.clubs)) createClubStaff(c, world, seed, date);
  for (let i = 0; i < 160; i++) {
    const r = new Rng(hash(seed, 5000 + i));
    const nation = rng.pick(o.activeNations.length ? o.activeNations : [0]);
    const [first, last] = randomName(names, nation, r);
    const role: StaffRole = (['coach', 'coach', 'scout', 'physio', 'assistant', 'manager'] as StaffRole[])[i % 6];
    const s = makeStaff({ id: g.nextId.staff++, first, last, nation, club: 0, role, level: r.int(15, 70), date, seed });
    g.staff[s.id] = s;
  }

  // Turneringer for aktive nationer
  setupSeasonComps(season, {});

  // Brugerens klub
  const club = g.clubs[o.clubId];
  takeOverClub(club);
  initKnowledge();
  monthlyDevelopment();
  if (o.challenge) {
    const ch = CHALLENGES.find((c) => c.id === o.challenge);
    if (ch) {
      g.challenge = { id: ch.id, deadlineSeason: season + ch.seasons - 1, club: o.clubId };
      ch.setup?.(g, o.clubId);
    }
  }
  initReleaseClauses();
  refreshShortlists();
  startScoreSeason();
  addNews({ cat: 'general', key: 'news.welcome', params: { manager: o.managerName, club: club.name } });
  g.manager.onboard = {};
  if (windowOpen()) addNews({ cat: 'transfer', key: 'window.opened', params: { date: windowLastDay() ?? g.date } });
  addNews({ cat: 'finance', key: 'sponsor.offers', params: {} });
  rebuildIndexes();
  initialTransferList();
  return g;
}

export function setupSeasonComps(season: number, prevTables: Record<string, number[]>, cupWinners: Record<number, number> = {}) {
  const g = gs();
  const active = new Set(g.activeNations);
  const byLeague = new Map<string, number[]>();
  for (const c of Object.values(g.clubs)) {
    if (!byLeague.has(c.league)) byLeague.set(c.league, []);
    byLeague.get(c.league)!.push(c.id);
  }
  const leaguesMeta = new Map(Object.entries(g.leagues).filter(([id]) => byLeague.has(id)));
  for (const [id, m] of leaguesMeta) {
    if (!active.has(m.nation) || m.hidden) continue;
    setupLeague(id, m.name, m.nation, m.tier, byLeague.get(id)!, season);
  }
  for (const nation of active) {
    const leagues = [...leaguesMeta.entries()].filter(([, m]) => m.nation === nation && !m.hidden).map(([id]) => id);
    const cupName = leagues.map((l) => LEAGUE_RULES[l]?.cup).find(Boolean);
    const clubs = leagues.flatMap((l) => byLeague.get(l) ?? []);
    if (clubs.length >= 8) setupCup(nation, cupName ?? `${g.nations[nation].name} Cup`, clubs, season);
  }
  const { cl, uefa, conf } = europeanQualifiers(prevTables, cupWinners);
  // "[klub] qualify for [turnering]"
  for (const [ids, name] of [[cl, 'Champions League'], [uefa, season >= 2009 ? 'Europa League' : 'UEFA Cup'], [conf, 'Conference League']] as const) {
    for (const c of ids) asOwner(c, () => addNews({ cat: 'match', key: 'comp.qualified', params: { club: g.clubs[c]?.name ?? '', comp: name }, link: { kind: 'club', id: c } }));
  }
  setupChampionsLeague(cl, season);
  setupUefaCup(uefa, season);
  // Conference League: ligafase med kun 6 runder
  setupUefaCup(conf, season, 'UECL', 'Conference League', 6);
}

export function takeOverClub(club: Club) {
  const g = gs();
  const old = g.staff[club.manager];
  if (old) {
    old.club = 0;
  }
  club.manager = -1;
  g.userClub = club.id;
  const sq = squad(club.id);
  // vælg formationen der passer bedst til truppen
  let best = newTactic('4-4-2');
  let bestScore = -1;
  for (const f of FORMATIONS) {
    const t = autoSelect(newTactic(f), sq, false);
    const score = t.lineup.reduce((s, id) => s + (g.players[id]?.ca ?? 0), 0);
    if (score > bestScore + 5) { bestScore = score; best = t; }
  }
  g.tactic = best;
  for (const p of sq) recordDevelopment(p);
  g.board = { confidence: 65, expectation: 'mid', expectedPos: 10, warnings: 0 };
  setBoardExpectation();
}

function createClubStaff(c: Club, world: WorldData, seed: number, date: string) {
  const g = gs();
  const r = new Rng(hash(seed, c.id, 99));
  const coach = world.clubs.find((x) => x[0] === c.id)?.[7] ?? '';
  const mk = (role: StaffRole, level: number) => {
    let first: string, last: string;
    if (role === 'manager' && coach) {
      const parts = coach.split(' ');
      first = parts.length > 1 ? parts[0] : '';
      last = parts.length > 1 ? parts.slice(1).join(' ') : parts[0];
    } else {
      [first, last] = randomName(g.names, c.nation, r);
    }
    const s = makeStaff({ id: g.nextId.staff++, first, last, nation: c.nation, club: c.id, role, level, date, seed });
    g.staff[s.id] = s;
    return s;
  };
  const lvl = c.rep;
  const m = mk('manager', lvl + r.int(-5, 5));
  c.manager = m.id;
  mk('assistant', lvl - 5);
  const coaches = 2 + Math.floor(c.rep / 25);
  for (let i = 0; i < coaches; i++) mk('coach', lvl - 8 + r.int(-6, 6));
  mk('physio', lvl - 5);
  if (c.rep > 55) mk('physio', lvl - 10);
  const scouts = 1 + Math.floor(c.rep / 30);
  for (let i = 0; i < scouts; i++) mk('scout', lvl - 8 + r.int(-6, 6));
}

const NEED: [SubPos, number][] = [['GK', 3], ['CB', 4], ['LB', 2], ['RB', 2], ['DM', 2], ['CM', 3], ['LW', 1], ['RW', 1], ['LM', 1], ['RM', 1], ['AM', 1], ['CF', 3]];
const ROLE_OF: Record<SubPos, Role> = { GK: 'GK', CB: 'CB', LB: 'FB', RB: 'FB', DM: 'DM', CM: 'CM', AM: 'AM', LM: 'WM', RM: 'WM', LW: 'W', RW: 'W', CF: 'ST', SS: 'ST' };

/** Generér spillere så truppen dækker alle positioner (bruges til 2. divisioner og tynde trupper) */
export function fillSquad(c: Club, sq: Player[], level: number, date: string, seed: number, min = 22) {
  const g = gs();
  const have = new Map<Role, number>();
  for (const p of sq) {
    const role = naturalRole(p);
    have.set(role, (have.get(role) ?? 0) + 1);
  }
  const r = new Rng(hash(seed, c.id, 1234));
  const needed: SubPos[] = [];
  const roleNeed = new Map<Role, number>();
  for (const [sub, n] of NEED) roleNeed.set(ROLE_OF[sub], (roleNeed.get(ROLE_OF[sub]) ?? 0) + n);
  for (const [sub, n] of NEED) {
    const role = ROLE_OF[sub];
    const count = have.get(role) ?? 0;
    const want = roleNeed.get(role)!;
    if (count < want) {
      const add = Math.min(n, want - count);
      for (let i = 0; i < add; i++) needed.push(sub);
      have.set(role, count + add);
    }
  }
  let total = sq.length + needed.length;
  while (total < min) { needed.push(r.pick(['CB', 'CM', 'CF', 'DM', 'LB', 'RW'] as SubPos[])); total++; }
  const wealth = rulesFor(c.league, 20).wealth;
  for (const sub of needed) {
    const nation = r.chance(0.9) ? c.nation : r.pick(Object.keys(g.names).map(Number));
    const [first, last] = randomName(g.names, nation, r);
    // Udfyldninger er opdigtede spillere. For at de ikke forveksles med rigtige stjerner (fx en
    // opfundet 3. målmand i en storklub med stjerne-CA) gøres de til unge reserve-/akademispillere
    // tydeligt under førsteholdet. Starterne kommer altid fra de rigtige spillere.
    const age = r.int(17, 23);
    const id = g.nextId.player++;
    const p = makePlayer({
      id, first, last, dob: randomDob(age, date, r), nation, club: c.id, sub, foot: r.chance(0.25) ? 'L' : 'R', height: 0,
      ca: Math.max(40, Math.round(level * 0.72) + r.int(-8, 12)), date, seed, wealth, regen: true,
    });
    addPlayer(p);
  }
}

function emptyFinance() {
  return { gate: 0, tv: 0, prize: 0, sponsor: 0, merch: 0, transfersIn: 0, transfersOut: 0, wages: 0, other: 0 };
}

export { emptyFinance };

function median(a: number[]) {
  const s = a.slice().sort((x, y) => x - y);
  return s[Math.floor(s.length / 2)] ?? 0;
}

function clampInt(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, Math.round(v)));
}

export type { Staff };
