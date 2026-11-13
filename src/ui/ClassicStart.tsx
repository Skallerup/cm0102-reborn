// Nyt spil i det klassiske udseende – originalens startmenu og forløb (CM 01/02 Bosman Edition):
// startmenu → Select League(s) → Enter Name → Select Nationality → Select Team → klubbens trup (Take Control) → Please Confirm → indlæsning.
// Skallen er spillets egen (.shell.cx: .cx-side med datoboks/pile/.cx-sbtn, .cx-title/.cx-subtitle, .cx-foot med Back/Next og .cx-running) – ikke en kopi.
// Efter Select League(s) bygges en midlertidig verden i en Web Worker (createGameAsync med preview, ligger i game/state.ts som inSetup()): den bygges
// mens man skriver navn og vælger nationalitet. Select Team viser så klubbens ÆGTE skærme (Shell/SquadClassic/ClassicHead – samme trup, Inj-mærker,
// udtagelsesfelter, faner og General Info) med knappen Take Control. "Yes" bygger det rigtige spil med den valgte klub og manager (samme frø, så alt er ens).
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CURRENCIES, LANGS, compName, dateFmt, getCurrency, getLang, natName, setCurrency, setLang, t, type Currency } from '../i18n';
import type { Lang } from '../game/types';
import type { WorldData } from '../game/newgame';
import { previewClub } from '../game/newgame';
import { deleteSave, importSave, listSaves, loadGame, storeSave, type SaveMeta } from '../game/save';
import { cloudSaves, deleteCloudSave, downloadCloudSave, type CloudSave } from '../online/account';
import { notifyNewCareer } from '../online/notify';
import { gs, inSetup, notify, setGame } from '../game/state';
import { track } from '../analytics';
import { askConfirm } from './confirm';
import { AccountBar, useAccount } from './Login';
import { GROUP_KEY, NAV_CLOSED_DEFAULT, Shell } from './Shell';
import { NavProvider } from './core';
import { SetupCtx, SetupSide, type SetupApi } from './setupCtx';
import { compAbbr } from './classic';
import { regionOfNation, type UiRegion } from './classicOptions';
import { DEMONYM } from './demonyms';
import { listDbs } from './customDb';
import { changeCount, type CustomDb } from '../game/dbEdit';
import { setTheme, getTheme, modernOn, setStartSkin } from './theme';
import { ORIGINAL_VERSIONS, type OriginalVersion } from './world';
import { createGameAsync, loadStartWorld, LANG_NATION, ORIG_LANG_NATION, readDb, readVer, writeDb, writeVer, type Db } from './startGame';

type Step = 'menu' | 'db' | 'leagues' | 'name' | 'nation' | 'team' | 'club' | 'confirm' | 'restore' | 'delete' | 'settings' | 'opts' | 'extras' | 'account';
export type LegacyView = 'online' | 'challenges' | 'editor' | 'draft';

/** Baggrundsbillederne fra originalens Pictures-mappe (public/original-bg) – som i skærmbillederne af originalens startskærme */
const BG: Record<Step, string> = {
  menu: '324855', db: '324855', leagues: 'holywell03', name: '324855', nation: '214525', team: 'boro3', club: '407618', confirm: '259396',
  restore: '349416', delete: '349416', settings: '324855', opts: '324855', extras: '324855', account: '324855',
};

const REGION_CODE: Record<UiRegion, string> = { europe: 'EUR', southAmerica: 'SAM', northAmerica: 'NAM', asia: 'ASI', oceania: 'OCE', africa: 'AFR' };
const REGION_ORDER: UiRegion[] = ['europe', 'southAmerica', 'northAmerica', 'asia', 'oceania', 'africa'];

interface ClubRow { id: number; short: string; name: string; nation: number; code: string; league: string; div: string }
interface NatRow { i: number; label: string; region: string; regionKey: UiRegion }
interface Prep { clubs: ClubRow[]; nations: NatRow[] }

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Adjektivet ("Danish") på engelsk, ellers landets navn på spillets sprog */
const adjective = (name: string) => (getLang() === 'en' ? DEMONYM[name] ?? name : natName(name));

/** Klubberne (kun SELECTED-lande – BACKGROUND-lande kan ikke styres) og nationaliteterne – selve "Player Initialisation" (trin 3) */
function makePrep(world: WorldData, playable: Set<number>): Prep {
  const lg = new Map(world.leagues.map((l) => [l.id, l]));
  const eng = world.nations.findIndex((n) => n.name === 'England');
  const divOf = (id: string) => {
    const l = lg.get(id);
    if (!l) return '';
    // som i originalens Select Team: England = PL, D1, D2, D3 (øvrige lande: forkortelsen af ligaens navn)
    return l.nation === eng && l.tier >= 1 && l.tier <= 4 ? ['PL', 'D1', 'D2', 'D3'][l.tier - 1] : compAbbr(compName(l.name));
  };
  const clubs: ClubRow[] = world.clubs
    .filter((c) => playable.has(c[3]) && lg.get(c[4]) && !lg.get(c[4])!.hidden)
    .map((c) => ({ id: c[0], short: c[2], name: c[1], nation: c[3], code: world.nations[c[3]]?.code ?? '', league: c[4], div: divOf(c[4]) }))
    .sort((a, b) => a.short.localeCompare(b.short));
  const natIds = new Set<number>([...world.clubs.map((c) => c[3]), ...world.leagues.map((l) => l.nation)]);
  const nations = [...natIds].filter((i) => world.nations[i]).map((i) => {
    const key = regionOfNation(world.nations[i].name);
    return { i, label: adjective(world.nations[i].name), region: REGION_CODE[key], regionKey: key };
  }).sort((a, b) => a.label.localeCompare(b.label));
  return { clubs, nations };
}

interface Prog { label: string; frac: number; auto?: boolean; step?: string }

function Frame({ step, version, title, sub, children, onBack, onNext, backLabel, nextLabel, nextDisabled, prog, hist, onHist, onRestart, onExit, className }: {
  step: Step; version: string; title: ReactNode; sub?: ReactNode; children: ReactNode;
  onBack?: () => void; onNext?: () => void; backLabel?: string; nextLabel?: string; nextDisabled?: boolean; prog: Prog | null;
  hist: { back: boolean; fwd: boolean }; onHist: (d: -1 | 1) => void; onRestart: () => void; onExit?: () => void; className?: string;
}) {
  const pct = prog ? Math.max(0, Math.min(100, Math.round(prog.frac * 100))) : 0;
  // baggrunden som i spillet: --cx-photo på :root (Shell sætter den samme variabel), og hovedfladen .cx-orig lader fotoet stå alene
  useEffect(() => { document.documentElement.style.setProperty('--cx-photo', `url("${import.meta.env.BASE_URL}original-bg/${BG[step]}.webp")`); }, [step]);
  return (
    <div className={`shell cx cxs cxs-${step} ${prog ? 'cx-busy' : ''} ${className ?? ''}`} data-cxs={step}>
      <SetupSide version={version} canBack={hist.back} canFwd={hist.fwd} onBack={() => onHist(-1)} onFwd={() => onHist(1)} onRestart={onRestart} onExit={onExit} atMenu={step === 'menu'} busy={!!prog} />
      <main className="main cx-main cx-orig cxs-main">
        <div className="cx-head">
          <div className="cx-title cxs-red"><h2 data-step-title>{title}</h2></div>
        </div>
        {sub && <div className="cx-subtitle">{sub}</div>}
        <div className="cxs-body">{children}</div>
      </main>
      <footer className="cx-foot">
        {prog ? (
          <div className="cx-running" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={prog.label}>
            <span className="cx-run-l">{prog.label}</span>
            <span className="cx-run-bar"><i style={{ width: `${pct}%` }}>{pct >= 10 && <b>{pct}%</b>}</i></span>
          </div>
        ) : (
          <div className="cx-backnext">
            <button className="cx-back" onClick={onBack} disabled={!onBack}>{backLabel ?? t('cxs.back')}</button>
            <button className="cx-next" onClick={onNext} disabled={!onNext || nextDisabled}>{nextLabel ?? t('cxs.next')}</button>
          </div>
        )}
      </footer>
    </div>
  );
}

export function ClassicStart({ onLang, onHome, onGo, onLook }: { onLang: (l: Lang) => void; onHome?: () => void; onGo: (v: LegacyView) => void; onLook: () => void }) {
  // originalen er ægte CM 01/02 med den klassiske DOM – temaet sættes, så resten af spillet (og e2e) ser det klassiske udseende
  useEffect(() => { if (getTheme() !== 'retro') setTheme('retro'); }, []);
  // spillets klassiske skin (:root[data-skin='retro']) gælder også før der er et spil – startskærmene bruger spillets egne knapper og lister
  useEffect(() => { setStartSkin(true); return () => setStartSkin(false); }, []);
  const [hist, setHist] = useState<{ stack: Step[]; i: number }>({ stack: ['menu'], i: 0 });
  const step = hist.stack[hist.i];
  const go = (s: Step) => setHist((h) => ({ stack: [...h.stack.slice(0, h.i + 1), s], i: h.i + 1 }));
  const back = () => setHist((h) => (h.i > 0 ? { ...h, i: h.i - 1 } : h));
  const onHist = (d: -1 | 1) => setHist((h) => (h.i + d >= 0 && h.i + d < h.stack.length ? { ...h, i: h.i + d } : h));
  const reset = () => { discard(); setHist({ stack: ['menu'], i: 0 }); };

  const [db, setDbState] = useState<Db>(readDb);
  const [ver, setVerState] = useState<OriginalVersion>(readVer);
  const [mine, setMine] = useState<CustomDb[]>([]);
  useEffect(() => { void listDbs().then(setMine).catch(() => {}); }, []);
  const [world, setWorld] = useState<WorldData | null>(null);
  const [wanted, setWanted] = useState(false);
  const [err, setErr] = useState('');
  const [prog, setProg] = useState<Prog | null>(null);
  // Select League(s): SELECTED = spilbart (første valgte = hovedland), BACKGROUND = landet spilles i baggrunden, men kan ikke styres; ingen af dem = ikke med
  const [sel, setSel] = useState<number[]>([]);
  const [bgn, setBgn] = useState<number[]>([]);
  const [masking, setMasking] = useState(true);
  const [prep, setPrep] = useState<Prep | null>(null);
  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');
  const [nat, setNat] = useState(-1);
  const [region, setRegion] = useState('all');
  const [team, setTeam] = useState(0);
  const quick = useRef(false);
  const file = useRef<HTMLInputElement>(null);
  const hasHist = { back: hist.i > 0, fwd: hist.i < hist.stack.length - 1 };

  // den midlertidige verden til Select Team: bygges i baggrunden, så snart ligaerne er valgt (se øverst). Samme frø bruges til det rigtige spil.
  const seed = useRef(Math.floor(Math.random() * 1e9));
  const build = useRef<{ sig: string; ctl: AbortController } | null>(null);
  const [bp, setBp] = useState<{ sig: string; frac: number; done: boolean } | null>(null);
  const [waitTeam, setWaitTeam] = useState(false);
  const discard = () => {
    build.current?.ctl.abort(); build.current = null; setBp(null); setWaitTeam(false);
    if (inSetup()) setGame(null);
  };
  // forlader man forløbet (Exit/forsiden/spillet starter), forsvinder den midlertidige verden med
  useEffect(() => () => { build.current?.ctl.abort(); if (inSetup()) setGame(null); }, []);

  // fremdriftsbjælken uden målt fremdrift (databasen hentes, et gemt spil åbnes): går mod ~90 % og springer til 100, når det er klaret
  useEffect(() => {
    if (!prog?.auto) return;
    const id = setInterval(() => setProg((p) => (p && p.auto ? { ...p, frac: p.frac + (0.92 - p.frac) * 0.1 } : p)), 160);
    return () => clearInterval(id);
  }, [prog?.auto]);

  const setDb = (d: Db, v: OriginalVersion = ver) => {
    discard();
    setDbState(d); setVerState(v); writeDb(d); writeVer(v);
    setWorld(null); setPrep(null); setSel([]); setBgn([]); setTeam(0); setNat(-1);
  };
  const dbOpts = useMemo(() => [
    ...ORIGINAL_VERSIONS.map((v) => ({ db: 'original' as Db, ver: v, big: '2001/02', small: t('cxs.dataN', { v }), hint: t(`db.ver.${v.replace(/\./g, '')}`), tag: v === '3.9.60' ? t('db.ver.default') : '' })),
    { db: 'modern' as Db, ver, big: '2026/27', small: t('cxs.dataModern'), hint: t('db.modernHint'), tag: '' },
    ...mine.map((d) => ({ db: `custom:${d.id}` as Db, ver, big: d.name, small: t('db.customHint', { base: d.base === 'original' ? t('db.original') : t('db.modern'), n: changeCount(d) }), hint: '', tag: '' })),
  ], [mine, ver]);
  const curOpt = dbOpts.find((o) => o.db === db && (db !== 'original' || o.ver === ver)) ?? dbOpts[0];
  const versionLabel = db === 'original' ? ver : db === 'modern' ? '2026/27' : t('cxs.custom');

  // databasen hentes, når man vælger Start New Game (trin 2 viser listen, så snart den er klar)
  useEffect(() => {
    if (!wanted) return;
    let ok = true;
    setErr(''); setWorld(null);
    setProg({ label: t('cxs.loadingDb'), frac: 0.05, auto: true });
    loadStartWorld(db, ver).then((w) => {
      if (!ok) return;
      if (!w) { setDb('modern'); return; }
      setWorld(w); setProg(null);
    }).catch((e) => { if (ok) { setErr(String(e)); setProg(null); } });
    return () => { ok = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wanted, db, ver]);

  // forvalg af land, når databasen er klar (sprogets eget land; ellers England)
  useEffect(() => {
    if (!world) return;
    const own = (db === 'original' ? ORIG_LANG_NATION : LANG_NATION)[getLang()];
    const name = world.leagues.some((l) => !l.hidden && world.nations[l.nation]?.name === own) ? own : 'England';
    const ids = world.nations.findIndex((x) => x.name === name);
    setSel(ids >= 0 ? [ids] : []); setBgn([]); setPrep(null); setTeam(0); setNat(-1);
    if (quick.current) {
      quick.current = false;
      void leaguesDone(world, ids >= 0 ? [ids] : [], [], ids);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [world]);

  const startNew = () => { quick.current = false; setWanted(true); go('leagues'); };
  const quickStart = () => { quick.current = true; setWanted(true); };

  const leagueNations = useMemo(() => {
    if (!world) return [];
    const ns = [...new Set(world.leagues.filter((l) => !l.hidden).map((l) => l.nation))].filter((n) => world.nations[n]);
    return ns.sort((a, b) => natName(world.nations[a].name).localeCompare(natName(world.nations[b].name)));
  }, [world]);

  // den originale database: spillets hovedland (startdatoen) er det først valgte land; fravælges det, bliver det alfabetisk første hovedland
  const dropFromSel = (list: number[], n: number) => {
    const rest = list.filter((x) => x !== n);
    if (db === 'original' && world && list[0] === n && rest.length) {
      const main = [...rest].sort((a, b) => (world.nations[a].name < world.nations[b].name ? -1 : 1))[0];
      return [main, ...rest.filter((x) => x !== main)];
    }
    return rest;
  };
  const clickSelected = (n: number) => {
    if (sel.includes(n)) setSel(dropFromSel(sel, n)); else { setSel([...sel, n]); setBgn(bgn.filter((x) => x !== n)); }
    setPrep(null);
  };
  const clickBackground = (n: number) => {
    if (bgn.includes(n)) setBgn(bgn.filter((x) => x !== n)); else { setBgn([...bgn, n]); setSel(dropFromSel(sel, n)); }
    setPrep(null);
  };
  const selectAll = () => { setSel([...sel, ...leagueNations.filter((n) => !sel.includes(n))]); setBgn([]); setPrep(null); };

  /** Ligaerne er valgt: nationalitets-/klublisterne og den midlertidige verden til Select Team (bygges, mens man skriver navn) */
  async function leaguesDone(w: WorldData, selected: number[], background: number[], natDefault: number) {
    const p = makePrep(w, new Set(selected));
    setPrep(p);
    if (!p.clubs.length) return;
    setNat((cur) => (cur >= 0 && p.nations.some((x) => x.i === cur) ? cur : natDefault >= 0 && p.nations.some((x) => x.i === natDefault) ? natDefault : selected[0] ?? p.nations[0]?.i ?? -1));
    const sig = `${db}|${ver}|${selected.join()}|${background.join()}|${masking}`;
    if (build.current?.sig !== sig) {
      discard();
      const ctl = new AbortController();
      build.current = { sig, ctl };
      setBp({ sig, frac: 0.02, done: false });
      const opts = { managerName: 'Manager', managerNation: selected[0], clubId: p.clubs[0].id, activeNations: [...selected, ...background], lang: getLang(), masking, seed: seed.current, mode: 'authentic' as const, preview: true };
      createGameAsync(w, opts, (pr) => setBp((cur) => (cur && cur.sig === sig ? { ...cur, frac: pr.frac } : cur)), ctl.signal).then(() => {
        if (build.current?.ctl !== ctl || ctl.signal.aborted) return;
        setBp({ sig, frac: 1, done: true });
      }).catch((e) => { if (build.current?.ctl === ctl) { setErr(String((e as Error).message ?? e)); setBp(null); build.current = null; } });
    }
    go('name');
  }
  const leaguesNext = () => { if (world && sel.length) void leaguesDone(world, sel, bgn, sel[0]); };

  // Select Nationality → Select Team: venter på den midlertidige verden (fremdriftsbjælken viser "Player Initialisation")
  const buildReady = !!bp && bp.done && inSetup();
  const toTeam = () => { if (buildReady) go('team'); else setWaitTeam(true); };
  useEffect(() => { if (waitTeam && buildReady) { setWaitTeam(false); go('team'); } /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [waitTeam, buildReady]);
  const shownProg: Prog | null = prog ?? (waitTeam && bp && !bp.done ? { label: t('cxs.playerInit'), frac: bp.frac } : null);

  const club = prep?.clubs.find((c) => c.id === team);
  const managerName = `${first.trim()} ${second.trim()}`.trim();
  // fremad-pilen kan føre til klubbens side uden valgt klub – så tilbage
  useEffect(() => { if ((step === 'club' || step === 'confirm') && (!club || !world || !buildReady)) back(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [step, club, world, buildReady]);

  const pickClub = (id: number) => { previewClub(gs(), id); setTeam(id); notify(); go('club'); };

  const launch = async () => {
    if (!world || !club) return;
    setErr('');
    setProg({ label: t('cxs.initGame'), frac: 0.02 });
    const opts = { managerName, managerNation: nat >= 0 ? nat : club.nation, clubId: club.id, activeNations: [...sel, ...bgn], lang: getLang(), masking, seed: seed.current, mode: 'authentic' as const };
    // nyt spil: nulstil sidemenuen, så "Holdet" er foldet ud fra start (resten huskes derefter)
    try { localStorage.setItem(GROUP_KEY, JSON.stringify(NAV_CLOSED_DEFAULT)); } catch { /* ignorer */ }
    track('start_game', { mode: 'single', db: db.startsWith('custom:') ? 'custom' : db, challenge: false, lang: opts.lang, flow: 'classic' });
    await delay(30);
    try {
      await createGameAsync(world, opts, (p) => setProg({ label: t('cxs.initGame'), frac: p.frac, step: p.step }));
      notify();
      const lg = world.leagues.find((l) => l.id === club.league);
      notifyNewCareer({ manager: opts.managerName, club: club.short, league: lg?.name, nation: natName(world.nations[club.nation]?.name), bots: 0, db: db.startsWith('custom:') ? 'custom' : db, lang: opts.lang });
    } catch (e) { setProg(null); setErr(String((e as Error).message ?? e)); }
  };

  // ---------- gemte spil ----------
  const acct = useAccount();
  type Row = { id: string; club: string; manager: string; date: string; saved: string; local?: SaveMeta; cloud?: CloudSave };
  const [rows, setRows] = useState<Row[] | null>(null);
  const refresh = async () => {
    const [local, cloud] = await Promise.all([listSaves(), cloudSaves().catch(() => [] as CloudSave[])]);
    const m = new Map<string, Row>();
    for (const s of local) m.set(s.id, { ...s, local: s });
    for (const c of cloud) {
      const r = m.get(c.id);
      if (!r) m.set(c.id, { id: c.id, club: c.club, manager: c.manager, date: c.date, saved: c.saved, cloud: c });
      else { r.cloud = c; if (c.saved > r.saved) Object.assign(r, { club: c.club, manager: c.manager, date: c.date, saved: c.saved }); }
    }
    setRows([...m.values()].sort((a, b) => b.saved.localeCompare(a.saved)));
  };
  useEffect(() => { if (step === 'restore' || step === 'delete') void refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [step, acct?.sid]);
  const openSave = async (r: Row) => {
    setProg({ label: t('cxs.loadingSave'), frac: 0.05, auto: true }); setErr('');
    try {
      if (r.cloud && (!r.local || r.cloud.saved > r.local.saved)) {
        const blob = await downloadCloudSave(r.cloud);
        await storeSave({ id: r.id, club: r.cloud.club, manager: r.cloud.manager, date: r.cloud.date, saved: r.cloud.saved }, blob);
      }
      if (!(await loadGame(r.id))) setErr(t('start.importFailed'));
    } catch { setErr(t('acc.err.other')); }
    setProg(null);
  };
  const removeSave = async (r: Row) => {
    if (!(await askConfirm(t('start.confirmDelete'), { danger: true }))) return;
    if (r.local) await deleteSave(r.id);
    if (r.cloud) await deleteCloudSave(r.id).catch(() => {});
    await refresh();
  };
  const doImport = async (f: File | undefined) => {
    if (!f) return;
    setProg({ label: t('cxs.loadingSave'), frac: 0.05, auto: true });
    const ok = await importSave(f);
    setProg(null);
    if (!ok) setErr(t('start.importFailed'));
  };

  const F = (p: { on?: boolean; dim?: boolean; className?: string; onClick?: () => void; children: ReactNode; testid?: string }) => (
    <button type="button" className={`cxs-field ${p.className ?? ''} ${p.dim ? 'dim' : ''}`} onClick={p.onClick} disabled={p.dim} data-field={p.testid}>{p.children}</button>
  );
  const common = { step, version: versionLabel, prog: shownProg, hist: hasHist, onHist, onRestart: reset, onExit: onHome };
  const note = err && <div className="cxs-err" role="alert">{err}</div>;

  // ---------- trin: startmenuen (289) ----------
  if (step === 'menu') {
    return (
      <Frame {...common} title={t('cxs.title')}>
        <div className="cxs-grid">
          <F testid="database" className="cxs-db" onClick={() => go('db')}><b className="gold">{curOpt.big}</b><small>{curOpt.small}</small></F>
          {/* originalens "Changing rules"-felt er tomt for nu: samme mørke boks, intet indhold og ingen funktion */}
          <div className="cxs-field static" data-field="rules" aria-hidden />
          <F testid="new" onClick={startNew}>{t('cxs.startNew')}</F>
          <F testid="quick" onClick={quickStart}>{t('cxs.quick')}</F>
          <F testid="restore" onClick={() => go('restore')}>{t('cxs.restore')}</F>
          <F testid="delete" onClick={() => go('delete')}>{t('cxs.delete')}</F>
          <F testid="network" onClick={() => onGo('online')}>{t('cxs.network')}</F>
          <F testid="settings" onClick={() => go('settings')}>{t('cxs.settings')}</F>
          <F testid="opts" onClick={() => go('opts')}>{t('cxs.rebornOpts')}</F>
          <F testid="extras" onClick={() => go('extras')}>{t('cxs.extras')}</F>
        </div>
        {note}
      </Frame>
    );
  }

  // ---------- databasevalget: det øverste venstre felt i startmenuen ----------
  if (step === 'db') {
    return (
      <Frame {...common} title={t('cxs.title')} sub={t('cxs.dbTitle')} onBack={back}>
        <div className="cxs-grid db">
          {dbOpts.map((o) => {
            const on = o.db === db && (db !== 'original' || o.ver === ver);
            return (
              <F key={`${o.db}-${o.ver}`} testid={`db-${o.db === 'original' ? o.ver : o.db}`} className={on ? 'on' : ''} onClick={() => { setDb(o.db, o.ver); back(); }}>
                <b className="gold">{o.big}</b><small>{o.small}{o.tag ? ` · ${o.tag}` : ''}</small>{o.hint && <span className="hint">{o.hint}</span>}
              </F>
            );
          })}
        </div>
      </Frame>
    );
  }

  // ---------- Select League(s) (290/291) ----------
  if (step === 'leagues') {
    const yn = (on: boolean, set: (v: boolean) => void, noOff?: boolean) => (
      <>
        <button className={`cx-sl-cell ${on ? 'on' : ''}`} onClick={() => set(true)}>{t('common.yes')}</button>
        <button className={`cx-sl-cell ${!on ? 'on' : ''}`} disabled={noOff} title={noOff ? t('cxs.realOnly') : undefined} onClick={() => set(false)}>{t('common.no')}</button>
      </>
    );
    return (
      <Frame {...common} title={t('cxs.title')} sub={t('cxs.selectLeagues')} onBack={back} onNext={leaguesNext} nextDisabled={!world || !sel.length}>
        <div className="cxs-lg-top cx-sl-top" data-cxs-lgtop>
          <span>{t('cl.sl.real')}</span>{yn(true, () => {}, true)}
          <span className="gap">{t('cl.sl.masking')}</span>{yn(masking, setMasking)}
          <span className="grow" />
          <button className="cxs-btn small" onClick={selectAll} disabled={!world}>{t('cxs.selectAll')}</button>
          <button className="cxs-btn small" onClick={() => { setSel([]); setBgn([]); setPrep(null); }} disabled={!world}>{t('cxs.deselectAll')}</button>
        </div>
        <div className="cxs-list leagues cx-sl">
          {world && leagueNations.map((n) => {
            const isSel = sel.includes(n), isBg = bgn.includes(n);
            const ls = world.leagues.filter((l) => l.nation === n && !l.hidden).sort((a, b) => b.tier - a.tier);
            return (
              <div key={n} className={`cx-sl-row cxs-lrow ${isSel ? 'lg-sel' : ''}`} data-nation={world.nations[n].name} data-state={isSel ? 'selected' : isBg ? 'background' : 'off'}>
                <span className="nm" onClick={() => clickSelected(n)}>{natName(world.nations[n].name)}</span>
                <button className={`cx-sl-cell ${isSel ? 'on' : ''}`} data-sl="selected" onClick={() => clickSelected(n)}>{t('cl.sl.selected')}</button>
                <button className={`cx-sl-cell ${isBg ? 'on' : ''}`} data-sl="background" onClick={() => clickBackground(n)}>{t('cl.sl.background')}</button>
                {/* laveste spilbare division for et SELECTED land (som i originalen) */}
                <span className={`cx-sl-cell lw ${isSel ? 'on' : ''}`}>{isSel && ls.length > 2 ? compName(ls[0].name) : ''}</span>
              </div>
            );
          })}
          {!world && !err && <div className="cxs-wait">{t('cxs.loadingDb')}</div>}
        </div>
        {note}
      </Frame>
    );
  }

  // ---------- Enter Name (293) ----------
  if (step === 'name') {
    const ok = first.trim() && second.trim();
    const submit = () => { if (ok) go('nation'); };
    return (
      <Frame {...common} title={t('cxs.title')} sub={t('cxs.enterName')} onBack={reset} backLabel={t('cxs.cancel')} onNext={submit} nextDisabled={!ok}>
        <div className="cxs-form">
          <label className="cxs-frow"><span>{t('cxs.firstName')}</span><i>:</i><input autoFocus maxLength={24} value={first} onChange={(e) => setFirst(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') document.getElementById('cxs-second')?.focus(); }} data-name="first" /></label>
          <label className="cxs-frow"><span>{t('cxs.secondName')}</span><i>:</i><input id="cxs-second" maxLength={24} value={second} onChange={(e) => setSecond(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') submit(); }} data-name="second" /></label>
        </div>
      </Frame>
    );
  }

  // ---------- Select Nationality (294) ----------
  if (step === 'nation') {
    const list = (prep?.nations ?? []).filter((n) => region === 'all' || n.regionKey === region);
    return (
      <Frame {...common} title={t('cxs.title')} sub={t('cxs.selectNat')} onBack={back} onNext={toTeam} nextDisabled={nat < 0}>
        <div className="cxs-filter">
          <select aria-label={t('cxs.filter')} value={region} onChange={(e) => setRegion(e.target.value)} data-filter>
            <option value="all">{t('cxs.filter')}</option>
            {REGION_ORDER.map((r) => <option key={r} value={r}>{REGION_CODE[r]} – {t(`cl.region.${r}`)}</option>)}
          </select>
        </div>
        <div className="cxs-list nations">
          {list.map((n) => (
            <div key={n.i} className={`cxs-it ${nat === n.i ? 'sel' : ''}`} role="button" tabIndex={0} data-nat={n.label} onClick={() => setNat(n.i)} onDoubleClick={() => { setNat(n.i); toTeam(); }}>
              <span className="n">{n.label}</span><span className="code">{n.region}</span>
            </div>
          ))}
        </div>
      </Frame>
    );
  }

  // ---------- Select Team (295) ----------
  if (step === 'team') {
    return (
      <Frame {...common} title={t('cxs.title')} sub={t('cxs.selectTeam')} onBack={back}>
        <div className="cxs-list teams" data-teams>
          {(prep?.clubs ?? []).map((c) => (
            <div key={c.id} className={`cxs-it ${team === c.id ? 'sel' : ''}`} role="button" tabIndex={0} data-club={c.short} onClick={() => pickClub(c.id)}>
              <span className="n">{c.short}</span><span className="code">{c.code}</span><span className="extra">{c.div}</span>
            </div>
          ))}
        </div>
      </Frame>
    );
  }

  // ---------- klubbens trup med Take Control (296) ----------
  // Spillets egen skal (Shell) med klubbens ægte skærme: SquadClassic, faner, Inj-mærker, udtagelsesfelter, spillerprofiler, General Info …
  // Sidebjælken er startforløbets (Version, pile, Restart Game), og titelbjælkens Action-knap er Take Control (ClassicHead).
  if (step === 'club' && club && world && buildReady) {
    const api: SetupApi = { version: versionLabel, takeControl: () => go('confirm'), leave: back, restart: reset, hist: hasHist, onHist };
    return (
      <SetupCtx.Provider value={api}>
        <NavProvider key={`club-${club.id}`} initial={{ name: 'squad' }}>
          <Shell />
        </NavProvider>
      </SetupCtx.Provider>
    );
  }

  // ---------- Please Confirm (297/298) ----------
  if (step === 'confirm' && club) {
    return (
      <Frame {...common} title={managerName} sub={t('cxs.confirm')} onBack={() => go('team')} backLabel={t('common.no')} onNext={() => void launch()} nextLabel={t('common.yes')}>
        <div className="cxs-msg" data-confirm>{t('cxs.takeQ', { club: club.name })}</div>
        {note}
      </Frame>
    );
  }

  // ---------- Restore / Delete Saved Game ----------
  if (step === 'restore' || step === 'delete') {
    const del = step === 'delete';
    return (
      <Frame {...common} title={t('cxs.title')} sub={t(del ? 'cxs.delete' : 'cxs.restore')} onBack={back}>
        <div className="cxs-list saves" data-saves>
          {!rows && <div className="cxs-wait">{t('start.loading')}</div>}
          {rows && !rows.length && <div className="cxs-wait">{t('start.noSaves')}</div>}
          {rows?.map((s) => (
            <div key={s.id} className="cxs-it save" role="button" tabIndex={0} onClick={() => void (del ? removeSave(s) : openSave(s))}>
              <span className="n">{s.local?.name ?? s.club} <em>– {s.local?.name ? `${s.club}, ` : ""}{s.manager}</em></span>
              <span className="extra">{dateFmt(s.date)}{s.cloud ? ' ☁' : ''}</span>
            </div>
          ))}
        </div>
        {note}
      </Frame>
    );
  }

  // ---------- Game Settings ----------
  if (step === 'settings') {
    return (
      <Frame {...common} title={t('cxs.title')} sub={t('cxs.settings')} onBack={back}>
        <div className="cxs-grid rows3">
          <label className="cxs-field"><span>{t('opt.language')}</span>
            <select value={getLang()} onChange={(e) => { setLang(e.target.value as Lang); onLang(e.target.value as Lang); }}>{LANGS.map(([k, , full]) => <option key={k} value={k}>{full}</option>)}</select>
          </label>
          <label className="cxs-field"><span>{t('opt.currency')}</span>
            <select value={getCurrency()} onChange={(e) => { setCurrency(e.target.value as Currency); onLang(getLang()); }}>{CURRENCIES.map((c) => <option key={c} value={c}>{t(`cur.${c}`)}</option>)}</select>
          </label>
          {modernOn() && <label className="cxs-field"><span>{t('cxs.look')}</span>
            <select value="classic" data-look onChange={(e) => { if (e.target.value === 'modern') { setTheme('club'); onLook(); } }}>
              <option value="classic">{t('land.looks.classic')}</option><option value="modern">{t('land.looks.modern')}</option>
            </select>
          </label>}
        </div>
      </Frame>
    );
  }

  // ---------- CM Reborn Options ----------
  if (step === 'opts') {
    return (
      <Frame {...common} title={t('cxs.title')} sub={t('cxs.rebornOpts')} onBack={back}>
        <div className="cxs-grid rows2">
          <F testid="challenges" onClick={() => onGo('challenges')}>{t('start.challenges')}</F>
          <F testid="draft" onClick={() => onGo('draft')}>{t('db.draft')}</F>
          <F testid="editor" onClick={() => onGo('editor')}>{t('ed.title')}</F>
          <F testid="account" onClick={() => go('account')}>{t('cxs.account')}</F>
        </div>
      </Frame>
    );
  }
  if (step === 'account') {
    return (
      <Frame {...common} title={t('cxs.title')} sub={t('cxs.account')} onBack={back}>
        <div className="cxs-embed"><AccountBar /></div>
      </Frame>
    );
  }

  // ---------- Extras ----------
  if (step !== 'extras') return null;
  return (
    <Frame {...common} title={t('cxs.title')} sub={t('cxs.extras')} onBack={back}>
      <div className="cxs-grid rows2">
        <F testid="import" onClick={() => file.current?.click()}>{t('start.import')}</F>
        <F testid="home" dim={!onHome} onClick={onHome}>{t('start.toLanding')}</F>
      </div>
      <input ref={file} type="file" accept=".cm0102,.json,.gz" style={{ display: 'none' }} onChange={(e) => void doImport(e.target.files?.[0])} />
      {note}
    </Frame>
  );
}
