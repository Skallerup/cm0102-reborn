// Startsiden som CM 01/02's hovedmenu: blå sidebjælke, rød titelbjælke, felter i et gitter over et baggrundsfoto og
// Back/Next nederst. Nyt spil er en guide i trin (manager → ligaer → hold) som originalens opsætning.
// De sjældnere skærme (online, draft, editor) vises i rammen med deres egne knapper.
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Lang } from '../game/types';
import { CURRENCIES, LANGS, compName, dateFmt, getCurrency, getLang, natName, setCurrency, setLang, t, type Currency } from '../i18n';
import { CHALLENGES, challengeClub } from '../game/challenges';
import { createGame, type WorldData } from '../game/newgame';
import { importSave } from '../game/save';
import { notify } from '../game/state';
import { changeCount, type CustomDb } from '../game/dbEdit';
import { track } from '../analytics';
import { notifyNewCareer } from '../online/notify';
import { AccountBar } from './Login';
import { Flag } from './components';
import { OnlineMenu } from './Online';
import { DraftCreate } from './Draft';
import { Editor } from './Editor';
import { listDbs, loadCustomWorld } from './customDb';
import { loadOriginalWorld, loadWorld, withCommunityEdits } from './world';
import { GROUP_KEY, NAV_CLOSED_DEFAULT } from './Shell';
import { getTheme, setTheme } from './theme';
import { APP_VERSION } from './changelogData';
import { LANG_NATION, NewGame, useSaveRows } from './Start';
import './startClassic.css';

type View = 'menu' | 'new' | 'quick' | 'load' | 'challenges' | 'settings' | 'account' | 'online' | 'newOnline' | 'newDraft' | 'editor';
type Db = 'modern' | 'original' | `custom:${string}`;
type Mode = 'authentic' | 'extended';

const PHOTOS = ['goalpost1', 'goalpost2', 'goalpost3', 'scramble1', 'scramble2', 'scramble3'];
const photo = PHOTOS[Math.floor(Math.random() * PHOTOS.length)];
const store = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* ignorer */ } };
const read = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };

/** Rammen: sidebjælke, titel, indhold og Back/Next */
function Frame({ title, step, onBack, onNext, nextLabel, nextOff, onHome, children }: {
  title: string; step?: string; onBack?: () => void; onNext?: () => void; nextLabel?: string; nextOff?: boolean; onHome?: () => void; children: ReactNode;
}) {
  return (
    <div className="cs" style={{ '--cs-photo': `url(${import.meta.env.BASE_URL}bg/${photo}.jpg)` } as React.CSSProperties}>
      <aside className="cs-side">
        <div className="cs-sbox cs-ver">{t('cs.version')}<br />{APP_VERSION}</div>
        <div className="cs-arrows">
          <button aria-label={t('common.back')} disabled={!onBack} onClick={onBack}>◀</button>
          <button aria-label={t('cs.next')} disabled={!onNext || nextOff} onClick={onNext}>▶</button>
        </div>
        {onHome && <button className="cs-sbox cs-sbtn" onClick={onHome}>{t('cs.home')}</button>}
      </aside>
      <main className="cs-main">
        <header className="cs-title"><h1>{title}</h1>{step && <span className="cs-step">{step}</span>}</header>
        <div className="cs-body">{children}</div>
        <footer className="cs-backnext">
          <button disabled={!onBack} onClick={onBack}>{t('common.back')}</button>
          <button className="cs-next" disabled={!onNext || nextOff} onClick={onNext}>{nextLabel ?? t('cs.next')}</button>
        </footer>
      </main>
    </div>
  );
}

export function StartClassic({ onLang, onHome }: { onLang: (l: Lang) => void; onHome?: () => void }) {
  const roomParam = new URLSearchParams(location.search).get('room') ?? undefined;
  const [view, setView] = useState<View>(roomParam ? 'online' : new URLSearchParams(location.search).get('newdraft') ? 'newDraft' : 'menu');
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');
  const [challenge, setChallenge] = useState<string | undefined>();
  const [draftFrom, setDraftFrom] = useState<View>('menu');
  const [mine, setMine] = useState<CustomDb[]>([]);
  const [db, setDbRaw] = useState<Db>(() => { const v = read('cm0102.db'); return v === 'original' || v?.startsWith('custom:') ? v as Db : 'modern'; });
  const [mode, setModeRaw] = useState<Mode>(() => (read('cm0102.mode') === 'authentic' && getTheme() === 'retro' ? 'authentic' : 'extended'));
  const [classic, setClassic] = useState(() => getTheme() === 'retro');
  const [masking, setMasking] = useState(true);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9));
  const [, force] = useState(0);
  useEffect(() => { void listDbs().then((all) => {
    setMine(all);
    // en database fra editoren, der ikke findes længere: tilbage til standard
    if (db.startsWith('custom:') && !all.some((d) => `custom:${d.id}` === db)) setDb('modern');
  }); }, [view]); // eslint-disable-line react-hooks/exhaustive-deps

  const setDb = (d: Db) => { setDbRaw(d); store('cm0102.db', d); };
  const setMode = (m: Mode) => { setModeRaw(m); store('cm0102.mode', m); if (m === 'authentic') setLook(true); };
  // Ægte CM 01/02 findes kun i det klassiske udseende
  const setLook = (c: boolean) => { setClassic(c); setTheme(c ? 'retro' : getTheme() === 'retro' ? 'club' : getTheme()); if (!c) { setModeRaw('extended'); store('cm0102.mode', 'extended'); } };
  const dbs: Db[] = ['modern', 'original', ...mine.map((d) => `custom:${d.id}` as Db)];
  const custom = mine.find((d) => `custom:${d.id}` === db);
  const menu = () => { setErr(''); setView('menu'); };

  const doImport = async (file: File | undefined) => {
    if (!file) return;
    setBusy(t('start.loading'));
    const ok = await importSave(file);
    setBusy('');
    if (!ok) setErr(t('start.importFailed'));
  };

  let body: ReactNode;
  if (view === 'new' || view === 'quick') {
    body = <Wizard key={`${view}-${challenge ?? ''}-${db}`} db={db} mode={classic ? mode : 'extended'} classic={classic} masking={masking} seed={seed} challenge={challenge} quick={view === 'quick'}
      onBack={() => { setChallenge(undefined); setView(challenge ? 'challenges' : 'menu'); }} setBusy={setBusy} onHome={onHome} />;
  } else if (view === 'menu') {
    const dbBig = db === 'original' ? '2001/02' : db === 'modern' ? '2026/27' : custom?.name ?? '';
    const dbSmall = db === 'original' ? t('cs.dbData', { v: '3.9.68' }) : db === 'modern' ? t('cs.dbData', { v: 'CM 2026/27' }) : custom ? t('db.customHint', { base: custom.base === 'original' ? t('db.original') : t('db.modern'), n: changeCount(custom) }) : '';
    body = (
      <Frame title="CM Reborn" onHome={onHome} onNext={() => setView('new')}>
        <div className="cs-grid">
          <button className="cs-cell cs-info" title={t('db.title')} onClick={() => setDb(dbs[(dbs.indexOf(db) + 1) % dbs.length])}>
            <b className="cs-yel">{dbBig}</b><small>{dbSmall}</small>
          </button>
          <div className="cs-cell cs-info">
            <span>{t('mode.title')}</span>
            <button className="cs-val" onClick={() => setMode(mode === 'authentic' && classic ? 'extended' : 'authentic')}>{t(classic && mode === 'authentic' ? 'mode.authentic' : 'mode.extended')}</button>
          </div>
          <button className="cs-cell" onClick={() => { setChallenge(undefined); setView('new'); }}>{t('start.new')}</button>
          <button className="cs-cell" onClick={() => { setChallenge(undefined); setView('quick'); }}>{t('cs.quick')}</button>
          <button className="cs-cell" onClick={() => setView('load')}>{t('start.load')}</button>
          <button className="cs-cell" onClick={() => document.getElementById('cs-import')?.click()}>{t('start.import')}</button>
          <button className="cs-cell" onClick={() => setView('online')}>{t('mp.title')}</button>
          <button className="cs-cell" onClick={() => setView('settings')}>{t('cs.settings')}</button>
          <button className="cs-cell" onClick={() => setView('challenges')}>{t('start.challenges')}</button>
          <button className="cs-cell" onClick={() => setView('editor')}>{t('ed.title')}</button>
          <button className="cs-cell" onClick={() => { setDraftFrom('menu'); setView('newDraft'); }}>{t('db.draft')}</button>
          <button className="cs-cell" onClick={() => setView('account')}>{t('cs.account')}</button>
        </div>
        <input id="cs-import" type="file" accept=".cm0102,.json,.gz" style={{ display: 'none' }} onChange={(e) => void doImport(e.target.files?.[0])} />
        {err && <div className="cs-err">{err}</div>}
      </Frame>
    );
  } else if (view === 'settings') {
    body = (
      <Frame title={t('cs.settings')} onHome={onHome} onBack={menu}>
        <div className="cs-grid">
          <div className="cs-cell cs-info"><span>{t('start.look')}</span><button className="cs-val" onClick={() => setLook(!classic)}>{t(classic ? 'cs.lookClassic' : 'cs.lookModern')}</button><small>{t('start.lookNote')}</small></div>
          <div className="cs-cell cs-info"><span>{t('mode.title')}</span><button className="cs-val" onClick={() => setMode(mode === 'authentic' && classic ? 'extended' : 'authentic')}>{t(classic && mode === 'authentic' ? 'mode.authentic' : 'mode.extended')}</button><small>{t(classic && mode === 'authentic' ? 'mode.authenticHint' : 'mode.extendedHint')}</small></div>
          <label className="cs-cell cs-info"><span>{t('opt.language')}</span>
            <select className="cs-val" value={getLang()} onChange={(e) => { setLang(e.target.value as Lang); onLang(e.target.value as Lang); force((x) => x + 1); }}>
              {LANGS.map(([k, , full]) => <option key={k} value={k}>{full}</option>)}
            </select>
          </label>
          <label className="cs-cell cs-info"><span>{t('opt.currency')}</span>
            <select className="cs-val" defaultValue={getCurrency()} onChange={(e) => { setCurrency(e.target.value as Currency); onLang(getLang()); }}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{t(`cur.${c}`)}</option>)}
            </select>
          </label>
          <div className="cs-cell cs-info"><span>{t('start.masking')}</span><button className="cs-val" onClick={() => setMasking(!masking)}>{t(masking ? 'cs.on' : 'cs.off')}</button><small>{t('start.maskingHint')}</small></div>
          <label className="cs-cell cs-info"><span>{t('start.seed')}</span><input className="cs-val" type="number" value={seed} onChange={(e) => setSeed(Number(e.target.value) || 0)} /><small>{t('start.seedHint')}</small></label>
        </div>
      </Frame>
    );
  } else if (view === 'load') {
    body = <Frame title={t('start.load')} onHome={onHome} onBack={menu}><LoadTable setBusy={setBusy} /></Frame>;
  } else if (view === 'challenges') {
    body = (
      <Frame title={t('start.challenges')} onHome={onHome} onBack={menu}>
        <div className="cs-grid cs-list">
          {CHALLENGES.map((c) => (
            <button key={c.id} className="cs-cell cs-row" onClick={() => { setChallenge(c.id); setView('new'); }}>
              <b className="cs-yel">{t(`challenge.${c.id}.title`)}</b><small>{t(`challenge.${c.id}.desc`)}</small><em>{t('start.seasons', { n: c.seasons })}</em>
            </button>
          ))}
        </div>
      </Frame>
    );
  } else if (view === 'account') {
    body = <Frame title={t('cs.account')} onHome={onHome} onBack={menu}><div className="cs-legacy"><AccountBar /></div></Frame>;
  } else {
    // online, draft og editor: de eksisterende skærme i rammen (de har selv Tilbage)
    const title = view === 'editor' ? t('ed.title') : view === 'newDraft' ? t('db.draft') : t('mp.title');
    const back = view === 'newOnline' ? () => setView('online') : view === 'newDraft' ? () => setView(draftFrom) : () => { history.replaceState(null, '', location.pathname); menu(); };
    body = (
      <Frame title={title} onHome={onHome} onBack={back}>
        <div className="cs-legacy">
          {view === 'editor' && <Editor onBack={menu} onPlay={(id) => { setDb(`custom:${id}`); setChallenge(undefined); setView('new'); }} />}
          {view === 'online' && <OnlineMenu onBack={back} onCreate={() => setView('newOnline')} onCreateDraft={() => { setDraftFrom('online'); setView('newDraft'); }} setBusy={setBusy} initialCode={roomParam} />}
          {view === 'newDraft' && <DraftCreate onBack={back} setBusy={setBusy} />}
          {view === 'newOnline' && <NewGame online onBack={back} setBusy={setBusy} />}
        </div>
      </Frame>
    );
  }
  return <>{body}{busy && <div className="progress"><div>{busy}</div></div>}</>;
}

/** Restore Saved Game: tabellen med gemte spil (klik = åbn) */
function LoadTable({ setBusy }: { setBusy: (s: string) => void }) {
  const { acct, rows, err, open, remove } = useSaveRows(setBusy);
  return (
    <div className="cs-legacy cs-load">
      <AccountBar />
      {!rows && <div className="cs-muted">{t('start.loading')}</div>}
      {rows && rows.length === 0 && <div className="cs-muted">{t('start.noSaves')}</div>}
      {err && <div className="cs-err">{err}</div>}
      {rows && rows.length > 0 && (
        <table className="cs-table">
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} onClick={() => void open(s)}>
                <td><b>{s.club}</b> <span className="cs-muted">{s.manager}</span>
                  {s.cloud && <span className="acc-tag">☁ {s.local && s.cloud.saved > s.local.saved ? t('acc.cloudNewer') : t('acc.cloud')}</span>}
                  {acct && !s.cloud && <span className="acc-tag dim">{t('acc.localOnly')}</span>}</td>
                <td>{dateFmt(s.date)}</td>
                <td className="cs-muted">{new Date(s.saved).toLocaleString()}</td>
                <td><button className="cs-del" onClick={(e) => { e.stopPropagation(); void remove(s); }}>{t('common.delete')}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

type Step = 'manager' | 'leagues' | 'team';

/** Nyt spil i trin: manager → ligaer → hold (hurtigstart springer ligaerne over, en udfordring har sit eget hold) */
function Wizard({ db, mode, classic, masking, seed, challenge, quick, onBack, setBusy, onHome }: {
  db: Db; mode: Mode; classic: boolean; masking: boolean; seed: number; challenge?: string; quick: boolean; onBack: () => void; setBusy: (s: string) => void; onHome?: () => void;
}) {
  const ch = CHALLENGES.find((c) => c.id === challenge);
  const steps: Step[] = ch ? ['manager'] : quick ? ['manager', 'team'] : ['manager', 'leagues', 'team'];
  const [i, setI] = useState(0);
  const step = steps[i];
  const [world, setWorld] = useState<WorldData | null>(null);
  const [err, setErr] = useState('');
  const [name, setName] = useState('');
  const [active, setActive] = useState<Set<number>>(new Set());
  const [league, setLeague] = useState('');
  const [club, setClub] = useState(0);
  const [dbName, setDbName] = useState('');
  const customId = !ch && db.startsWith('custom:') ? db.slice(7) : '';
  const dbKind = customId ? 'custom' : ch ? 'modern' : db;

  useEffect(() => {
    const load = customId ? listDbs().then((all) => {
      const d = all.find((x) => x.id === customId);
      if (!d) throw new Error(t('start.importFailed'));
      setDbName(d.name);
      return loadCustomWorld(customId).then((w) => withCommunityEdits(w, d.base === 'original' ? 'original' : 'cm'));
    }) : (ch || db !== 'original' ? loadWorld() : loadOriginalWorld()).then((w) => withCommunityEdits(w, !ch && db === 'original' ? 'original' : 'cm'));
    load.then((w) => {
      setWorld(w);
      const own = LANG_NATION[getLang()];
      const names = ch ? ch.nations : [w.leagues.some((l) => !l.hidden && w.nations[l.nation]?.name === own) ? own : 'England'];
      const ids = names.map((n) => w.nations.findIndex((x) => x.name === n)).filter((x) => x >= 0);
      setActive(new Set(ids));
      const first = w.leagues.filter((l) => l.nation === ids[0] && !l.hidden).sort((a, b) => a.tier - b.tier)[0];
      if (first) setLeague(first.id);
      if (ch) { const cid = challengeClub(ch, w); setClub(cid); const lg = w.clubs.find((c) => c[0] === cid)?.[4]; if (lg) setLeague(lg); }
    }).catch((e) => setErr(String((e as Error).message ?? e)));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // kun i udvikling: skærmbillede-scriptet og e2e vælger klub direkte (og springer til sidste trin)
  useEffect(() => {
    if (!import.meta.env.DEV || !world) return;
    const w = window as unknown as { __cmClubId?: unknown; __cmPick?: unknown };
    w.__cmClubId = (n: string) => world.clubs.find((c) => c[1] === n)?.[0] ?? 0;
    w.__cmPick = (id: number) => { const c = world.clubs.find((x) => x[0] === id); if (c) { setActive((a) => new Set([...a, c[3]])); setLeague(c[4]); setClub(id); setI(steps.length - 1); } return !!c; };
  }, [world]); // eslint-disable-line react-hooks/exhaustive-deps

  const nations = useMemo(() => {
    if (!world) return [];
    const ns = [...new Set(world.leagues.filter((l) => !l.hidden).map((l) => l.nation))];
    return ns.sort((a, b) => natName(world.nations[a].name).localeCompare(natName(world.nations[b].name)));
  }, [world]);

  const title = ch ? t(`challenge.${ch.id}.title`) : t(step === 'manager' ? 'cs.manager' : step === 'leagues' ? 'cs.leagues' : 'cs.team');
  const stepLabel = steps.length > 1 ? t('cs.step', { n: i + 1, m: steps.length }) : undefined;
  if (err) return <Frame title={title} onHome={onHome} onBack={onBack}><div className="cs-err">{err}</div></Frame>;
  if (!world) return <Frame title={title} step={stepLabel} onHome={onHome} onBack={onBack}><div className="cs-cell cs-info cs-wait">{t('start.loadingDb')}</div></Frame>;

  const leagues = world.leagues.filter((l) => active.has(l.nation) && !l.hidden);
  const shownLeague = leagues.some((l) => l.id === league) ? league : leagues.slice().sort((a, b) => a.tier - b.tier)[0]?.id ?? '';
  const clubs = world.clubs.filter((c) => c[4] === shownLeague).sort((a, b) => a[2].localeCompare(b[2]));
  const clubNation = world.clubs.find((c) => c[0] === club)?.[3];
  const canStart = name.trim().length > 0 && club > 0 && clubNation !== undefined && active.has(clubNation);
  const last = i === steps.length - 1;
  const blocked = step === 'manager' ? !name.trim() : step === 'leagues' ? active.size === 0 : !canStart;

  const start = () => {
    setBusy(t('start.creating'));
    const opts = { managerName: name.trim(), managerNation: clubNation ?? 0, clubId: club, activeNations: [...active], lang: getLang(), masking, seed, challenge, mode };
    try { localStorage.setItem(GROUP_KEY, JSON.stringify(NAV_CLOSED_DEFAULT)); } catch { /* ignorer */ }
    track('start_game', { mode: 'single', db: dbKind, challenge: !!challenge, lang: opts.lang });
    setTimeout(() => {
      createGame(world, opts);
      notify();
      const c = world.clubs.find((x) => x[0] === club), lg = world.leagues.find((l) => l.id === c?.[4]);
      notifyNewCareer({ manager: opts.managerName, club: c?.[2] ?? String(club), league: lg?.name, nation: natName(world.nations[clubNation ?? -1]?.name), challenge, bots: 0, db: dbKind, lang: opts.lang });
      setBusy('');
    }, 30);
  };
  const next = () => { if (blocked) return; if (last) start(); else setI(i + 1); };
  const toggle = (n: number) => {
    const s = new Set(active);
    const adding = !s.has(n);
    if (adding) s.add(n); else s.delete(n);
    setActive(s);
    const top = (nat: number) => world.leagues.filter((l) => l.nation === nat && !l.hidden).sort((a, b) => a.tier - b.tier)[0];
    const cur = world.leagues.find((l) => l.id === league)?.nation;
    const nx = adding ? top(n) : cur === n ? [...s].map(top).find(Boolean) : undefined;
    if (nx) { setLeague(nx.id); setClub(0); } else if (!adding && cur === n) { setLeague(''); setClub(0); }
  };
  const dbLabel = customId ? `🛠 ${dbName}` : ch || db === 'modern' ? t('db.modern') : t('db.original');

  return (
    <Frame title={title} step={stepLabel} onHome={onHome} onBack={i > 0 ? () => setI(i - 1) : onBack} onNext={next} nextOff={blocked} nextLabel={last ? t('start.begin') : undefined}>
      {step === 'manager' && (
        <div className="cs-grid">
          <label className="cs-cell cs-info cs-wide">
            <span>{t('start.managerName')}</span>
            <input className="cs-name" value={name} maxLength={40} autoFocus placeholder={t('start.managerPlaceholder')} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') next(); }} />
          </label>
          {ch && <div className="cs-cell cs-info cs-wide"><small>{t(`challenge.${ch.id}.desc`)}</small></div>}
          <div className="cs-cell cs-info"><span>{t('db.title')}</span><b className="cs-yel">{dbLabel}</b></div>
          <div className="cs-cell cs-info"><span>{t('mode.title')}</span><b className="cs-yel">{t(mode === 'authentic' ? 'mode.authentic' : 'mode.extended')}</b></div>
          <div className="cs-cell cs-info"><span>{t('start.look')}</span><b className="cs-yel">{t(classic ? 'cs.lookClassic' : 'cs.lookModern')}</b></div>
          <div className="cs-cell cs-info"><span>{t('start.masking')}</span><b className="cs-yel">{t(masking ? 'cs.on' : 'cs.off')}</b></div>
        </div>
      )}
      {step === 'leagues' && (
        <>
          <p className="cs-hint">{t('cs.leaguesHint')} <b className="cs-yel">{t('cs.selected', { n: active.size })}</b></p>
          <div className="cs-picks">
            {nations.map((n) => (
              <button key={n} className={`cs-pick ${active.has(n) ? 'on' : ''}`} onClick={() => toggle(n)} aria-pressed={active.has(n)}>
                <span className="cs-tick">{active.has(n) ? '✓' : ''}</span><Flag name={world.nations[n].name} />{natName(world.nations[n].name)}
                <em>{world.leagues.filter((l) => l.nation === n && !l.hidden).length}</em>
              </button>
            ))}
          </div>
        </>
      )}
      {step === 'team' && (
        <>
          <div className="cs-bar">
            <select className="cs-val" value={shownLeague} onChange={(e) => { setLeague(e.target.value); setClub(0); }} aria-label={t('start.pickClub')}>
              {[...new Set(leagues.map((l) => l.nation))].map((n) => (
                <optgroup key={n} label={natName(world.nations[n].name)}>
                  {leagues.filter((l) => l.nation === n).sort((a, b) => a.tier - b.tier).map((l) => <option key={l.id} value={l.id}>{compName(l.name)}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="cs-picks">
            {clubs.map((c) => <button key={c[0]} className={`cs-pick ${club === c[0] ? 'on' : ''}`} onClick={() => setClub(c[0])} onDoubleClick={() => { setClub(c[0]); }}>{c[2]}</button>)}
          </div>
          {!canStart && <p className="cs-hint">{t('start.needNameClub')}</p>}
        </>
      )}
    </Frame>
  );
}
