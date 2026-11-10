import { LookPicker, ShotPreview, initialLook } from './LookPicker';
import { setTheme } from './theme';
import { LangMenu } from './LangMenu';
import { track } from '../analytics';
import { useEffect, useMemo, useState } from 'react';
import { DraftCreate } from './Draft';
import { askConfirm } from './confirm';
import { Select } from './select';
import { CHALLENGES, challengeClub } from '../game/challenges';
import { createGame, type WorldData } from '../game/newgame';
import { setupBots, type BotScope } from '../game/bots';
import { enableMultiplayer } from '../game/humans';
import { deleteSave, importSave, listSaves, loadGame, storeSave, type SaveMeta } from '../game/save';
import { cloudSaves, deleteCloudSave, downloadCloudSave, type CloudSave } from '../online/account';
import { AccountBar, useAccount } from './Login';
import { gs, notify } from '../game/state';
import type { Lang } from '../game/types';
import { compName, CURRENCIES, dateFmt, getCurrency, getLang, setCurrency, setLang, t, type Currency, natName } from '../i18n';
import { Flag, Panel } from './components';
import { OnlineMenu } from './Online';
import { createOnlineGame } from '../online/client';
import { notifyNewCareer } from '../online/notify';
import { loadOriginalWorld, loadWorld, ORIGINAL_VERSIONS, withCommunityEdits, type OriginalVersion } from './world';
import { GROUP_KEY, NAV_CLOSED_DEFAULT } from './Shell';
import { Editor } from './Editor';
import { listDbs, loadCustomWorld } from './customDb';
import { changeCount, type CustomDb } from '../game/dbEdit';

type View = 'menu' | 'new' | 'load' | 'challenges' | 'online' | 'newOnline' | 'newDraft' | 'editor';

/** AI-managere (bots) i almindelige spil er midlertidigt slået fra (ejerens ønske 2026-11-07) – draft-ligaen har sine egne */
const BOTS_ENABLED = false;

export function Start({ onLang, onHome }: { onLang: (l: Lang) => void; onHome?: () => void }) {
  const roomParam = new URLSearchParams(location.search).get('room') ?? undefined;
  const [view, setView] = useState<View>(roomParam ? 'online' : new URLSearchParams(location.search).get('newdraft') ? 'newDraft' : 'menu');
  const [challenge, setChallenge] = useState<string | undefined>();
  const [draftFrom, setDraftFrom] = useState<View>('menu'); // hvor man kom fra til draft-opret (tilbage-knap)
  const [playDb, setPlayDb] = useState<string | undefined>(); // "Spil" fra editoren: start med den database
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');
  const lang = getLang();

  const doImport = async (file: File | undefined) => {
    if (!file) return;
    setBusy(t('start.loading'));
    const ok = await importSave(file);
    setBusy('');
    if (!ok) setErr(t('start.importFailed'));
  };

  return (
    <div className={`start ${view === 'menu' ? 'start-menu' : ''}`}>
      <div className="start-aurora" aria-hidden><i /><i /><i /></div>
      {onHome && view === 'menu' && <button className="small start-home" onClick={onHome}>{t('start.toLanding')}</button>}
      <div className="start-box">
        <div className="logo">
          {view === 'menu' && <div className="start-pill"><span className="start-live" />{t('start.pill')}</div>}
          <h1>CM <span>Reborn</span></h1>
          <p>{t('start.subtitle')}</p>
        </div>
        {view === 'menu' && (
          <div className="menu-btns">
            <button className="start-cta" onClick={() => { setChallenge(undefined); setView('new'); }}>{t('start.new')} <span>→</span></button>
            <div className="start-cards">
              <button className="start-card" onClick={() => setView('load')}><b>💾 {t('start.load')}</b><span>{t('start.loadDesc')}</span></button>
              <button className="start-card" onClick={() => setView('online')}><b>🌐 {t('mp.title')}</b><span>{t('start.onlineDesc')}</span></button>
              <button className="start-card" onClick={() => setView('challenges')}><b>🏆 {t('start.challenges')}</b><span>{t('start.challengesDesc')}</span></button>
              <button className="start-card" onClick={() => setView('editor')}><b>🛠 {t('ed.title')}</b><span>{t('ed.menuDesc')}</span></button>
            </div>
            <AccountBar />
            <div className="start-foot">
              <button className="start-ghost" onClick={() => document.getElementById('import-file')?.click()}>{t('start.import')}</button>
              <input id="import-file" type="file" accept=".cm0102,.json,.gz" style={{ display: 'none' }} onChange={(e) => doImport(e.target.files?.[0])} />
              <LangMenu up value={lang} onChange={(k) => { setLang(k); onLang(k); }} />
              <select className="start-cur" aria-label={t('opt.currency')} defaultValue={getCurrency()} onChange={(e) => { setCurrency(e.target.value as Currency); onLang(getLang()); }}>
                {CURRENCIES.map((c) => <option key={c} value={c}>{t(`cur.${c}`)}</option>)}
              </select>
            </div>
            {err && <div className="bad center">{err}</div>}
          </div>
        )}
        {view === 'load' && <LoadList onBack={() => setView('menu')} setBusy={setBusy} />}
        {view === 'challenges' && (
          <Panel title={t('start.challenges')} right={<button className="small" onClick={() => setView('menu')}>{t('common.back')}</button>}>
            <div className="col">
              {CHALLENGES.map((c) => (
                <div key={c.id} className="choice" onClick={() => { setChallenge(c.id); setView('new'); }}>
                  <div className="grow">
                    <b className="accent">{t(`challenge.${c.id}.title`)}</b>
                    <div className="muted">{t(`challenge.${c.id}.desc`)}</div>
                  </div>
                  <span className="tag">{t('start.seasons', { n: c.seasons })}</span>
                </div>
              ))}
            </div>
          </Panel>
        )}
        {view === 'editor' && <Editor onBack={() => setView('menu')} onPlay={(id) => { setChallenge(undefined); setPlayDb(id); setView('new'); }} />}
        {view === 'new' && <NewGame challenge={challenge} initialDb={playDb} onBack={() => { setPlayDb(undefined); setView('menu'); }} setBusy={setBusy} onDraft={() => { setDraftFrom('new'); setView('newDraft'); }} />}
        {view === 'online' && <OnlineMenu onBack={() => { history.replaceState(null, '', location.pathname); setView('menu'); }} onCreate={() => setView('newOnline')} onCreateDraft={() => { setDraftFrom('online'); setView('newDraft'); }} setBusy={setBusy} initialCode={roomParam} />}
        {view === 'newDraft' && <DraftCreate onBack={() => setView(draftFrom)} setBusy={setBusy} />}
        {view === 'newOnline' && <NewGame online onBack={() => setView('online')} setBusy={setBusy} />}
        <div className="footer-note">{t('start.footer')}</div>
      </div>
      {busy && <div className="progress"><div>{busy}</div></div>}
    </div>
  );
}

type Row = { id: string; club: string; manager: string; date: string; saved: string; local?: SaveMeta; cloud?: CloudSave };

function LoadList({ onBack, setBusy }: { onBack: () => void; setBusy: (s: string) => void }) {
  const acct = useAccount();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState('');
  // lokale og gemte i skyen samlet pr. spil – den nyeste udgave åbnes
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
  useEffect(() => { void refresh(); }, [acct?.sid]);
  const open = async (r: Row) => {
    setBusy(t('start.loading')); setErr('');
    try {
      if (r.cloud && (!r.local || r.cloud.saved > r.local.saved)) {
        const blob = await downloadCloudSave(r.cloud);
        await storeSave({ id: r.id, club: r.cloud.club, manager: r.cloud.manager, date: r.cloud.date, saved: r.cloud.saved }, blob);
      }
      if (!(await loadGame(r.id))) setErr(t('start.importFailed'));
    } catch { setErr(t('acc.err.other')); }
    setBusy('');
  };
  const remove = async (r: Row) => {
    if (!(await askConfirm(t('start.confirmDelete'), { danger: true }))) return;
    if (r.local) await deleteSave(r.id);
    if (r.cloud) await deleteCloudSave(r.id).catch(() => {});
    await refresh();
  };
  return (
    <Panel title={t('start.load')} right={<button className="small" onClick={onBack}>{t('common.back')}</button>}>
      <AccountBar />
      {!rows && <div className="muted">{t('start.loading')}</div>}
      {rows && rows.length === 0 && <div className="muted">{t('start.noSaves')}</div>}
      {err && <div className="insight bad">{err}</div>}
      <div className="col">
        {rows?.map((s) => (
          <div key={s.id} className="choice">
            <div className="grow" onClick={() => void open(s)}>
              <b>{s.club}</b> <span className="muted">— {s.manager}</span>
              {s.cloud && <span className="acc-tag" title={s.cloud.device ? t('acc.fromDevice', { device: s.cloud.device }) : undefined}>☁ {s.local && s.cloud.saved > s.local.saved ? t('acc.cloudNewer') : t('acc.cloud')}</span>}
              {acct && !s.cloud && <span className="acc-tag dim">{t('acc.localOnly')}</span>}
              <div className="muted">{dateFmt(s.date)} · {t('start.savedAt')} {new Date(s.saved).toLocaleString()}{s.cloud?.device && s.cloud.saved >= (s.local?.saved ?? '') ? ` · ${t('acc.fromDevice', { device: s.cloud.device })}` : ''}</div>
            </div>
            <button className="small danger" onClick={() => void remove(s)}>{t('common.delete')}</button>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// sprogets eget land er valgt fra start (England, hvis landet ikke findes i databasen)
const LANG_NATION: Record<Lang, string> = { da: 'Denmark', en: 'England', es: 'Spain', fr: 'France', de: 'Germany', it: 'Italy', pt: 'Brazil', tr: 'Turkey', sv: 'Sweden', nb: 'Norway' };

function NewGame({ challenge, onBack, setBusy, online, onDraft, initialDb }: { challenge?: string; onBack: () => void; setBusy: (s: string) => void; online?: boolean; onDraft?: () => void; initialDb?: string }) {
  const [world, setWorld] = useState<WorldData | null>(null);
  const [err, setErr] = useState('');
  const ch = CHALLENGES.find((c) => c.id === challenge);
  const [name, setName] = useState('');
  const [active, setActive] = useState<Set<number>>(new Set());
  const [league, setLeague] = useState('');
  const [club, setClub] = useState<number>(0);
  // kun i udvikling: skærmbillede-scriptet vælger klub direkte (uden at klikke sig gennem ligalisten)
  useEffect(() => { if (import.meta.env.DEV && world) (window as unknown as { __cmClubId?: unknown }).__cmClubId = (n: string) => world.clubs.find((c) => c[1] === n)?.[0] ?? 0; }, [world]);
  useEffect(() => { if (import.meta.env.DEV && world) (window as unknown as { __cmPick?: unknown }).__cmPick = (id: number) => { const c = world.clubs.find((x) => x[0] === id); if (c) { setActive((a) => new Set([...a, c[3]])); setLeague(c[4]); setClub(id); } return !!c; }; }, [world]);
  const [masking, setMasking] = useState(true);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9));
  const [bots, setBots] = useState(0);
  const [deadline, setDeadline] = useState(24);
  const [botScope, setBotScope] = useState<BotScope>('league');
  // database: standard (CM 2026/27) eller den originale 01/02 (3.9.60)
  // 'custom:<id>' = en database fra editoren (ændringer oven på den originale eller den moderne)
  type Db = 'modern' | 'original' | `custom:${string}`;
  const [db, setDbState] = useState<Db>(() => {
    if (initialDb) return `custom:${initialDb}`;
    // standard = den originale 01/02 (ejerens ønske 9/11); et tidligere valg af 2026/27 eller en egen database huskes – udfordringer bruger 2026/27
    if (challenge) return 'modern';
    try { const v = localStorage.getItem('cm0102.db'); return v === 'modern' || v?.startsWith('custom:') ? v as Db : 'original'; } catch { return 'original'; }
  });
  const setDb = (d: Db) => { setDbState(d); setWorld(null); setClub(0); try { localStorage.setItem('cm0102.db', d); } catch { /* ignorer */ } };
  // den originale databases udgave (3.9.60 = standard)
  const [ver, setVerState] = useState<OriginalVersion>(() => { try { const v = localStorage.getItem('cm0102.dbver'); return (ORIGINAL_VERSIONS as readonly string[]).includes(v ?? '') ? v as OriginalVersion : '3.9.60'; } catch { return '3.9.60'; } });
  const setVer = (v: OriginalVersion) => { setVerState(v); setWorld(null); setClub(0); try { localStorage.setItem('cm0102.dbver', v); } catch { /* ignorer */ } };
  const [mine, setMine] = useState<CustomDb[]>([]);
  // nyt spil starter øverst ved databasevalget (før scrollede autofokus på navnefeltet forbi det – ejerens fejl 9/11)
  useEffect(() => { if (!ch) window.scrollTo(0, 0); }, []);
  const [mode, setModeRaw] = useState<'authentic' | 'extended'>(() => { try { return localStorage.getItem('cm0102.mode') === 'extended' ? 'extended' : 'authentic'; } catch { return 'authentic'; } });
  const setModeState = (m: 'authentic' | 'extended') => { setModeRaw(m); try { localStorage.setItem('cm0102.mode', m); } catch { /* ignorer */ } };
  useEffect(() => { if (!ch) void listDbs().then(setMine); }, [ch]);
  const customId = db.startsWith('custom:') ? db.slice(7) : '';
  const dbKind = customId ? 'custom' : db;

  useEffect(() => {
    const load = customId ? listDbs().then((all) => {
      const d = all.find((x) => x.id === customId);
      // databasen findes ikke længere (slettet): tilbage til standard
      if (!d) { setDb('modern'); return null; }
      return loadCustomWorld(customId).then((w) => withCommunityEdits(w, d.base === 'original' ? 'original' : 'cm'));
    // fællesskabets rettelser gælder 3.9.60 (de andre udgaver bruges præcis som originalen)
    }) : db === 'original' ? loadOriginalWorld(ver).then((w) => (ver === '3.9.60' ? withCommunityEdits(w, 'original') : w)) : loadWorld().then((w) => withCommunityEdits(w, 'cm'));
    load.then((w) => {
      if (!w) return;
      setWorld(w);
      const own = LANG_NATION[getLang()];
      const names = ch ? ch.nations : [w.leagues.some((l) => !l.hidden && w.nations[l.nation]?.name === own) ? own : 'England'];
      const ids = names.map((n) => w.nations.findIndex((x) => x.name === n)).filter((i) => i >= 0);
      setActive(new Set(ids));
      const first = w.leagues.filter((l) => l.nation === ids[0] && !l.hidden).sort((a, b) => a.tier - b.tier)[0];
      if (first) setLeague(first.id);
      // udfordringens klub findes ud fra navnet i databasen
      if (ch) { const cid = challengeClub(ch, w); setClub(cid); const lg = w.clubs.find((c) => c[0] === cid)?.[4]; if (lg) setLeague(lg); }
    }).catch((e) => setErr(String(e)));
  }, [ch, db, ver]);

  const leagueNations = useMemo(() => {
    if (!world) return [];
    const ns = [...new Set(world.leagues.filter((l) => !l.hidden).map((l) => l.nation))];
    return ns.sort((a, b) => natName(world.nations[a].name).localeCompare(natName(world.nations[b].name)));
  }, [world]);

  const dbPicker = !ch && (
    <Panel title={t('db.title')}>
      <div className="db-choice">
        <button className={`db-opt ${db === 'original' ? 'on' : ''}`} onClick={() => setDb('original')}>
          <b>{t('db.original')}</b><span>{t('db.originalHint')}</span>
        </button>
        <button className={`db-opt ${db === 'modern' ? 'on' : ''}`} onClick={() => setDb('modern')}>
          <b>{t('db.modern')}</b><span>{t('db.modernHint')}</span>
        </button>
        {db === 'original' && (
          <div className="db-ver" role="radiogroup" aria-label={t('db.ver.title')}>
            <div className="db-ver-h">{t('db.ver.title')}</div>
            {ORIGINAL_VERSIONS.map((v) => (
              <button key={v} role="radio" aria-checked={ver === v} className={`db-opt db-ver-opt ${ver === v ? 'on' : ''}`} onClick={() => setVer(v)}>
                <b>{v}{v === '3.9.60' ? ` · ${t('db.ver.default')}` : ''}</b><span>{t(`db.ver.${v.replace(/\./g, '')}`)}</span>
              </button>
            ))}
          </div>
        )}
        {mine.map((d) => (
          <button key={d.id} className={`db-opt ${db === `custom:${d.id}` ? 'on' : ''}`} onClick={() => setDb(`custom:${d.id}`)}>
            <b>🛠 {d.name}</b><span>{t('db.customHint', { base: d.base === 'original' ? t('db.original') : t('db.modern'), n: changeCount(d) })}</span>
          </button>
        ))}
        {onDraft && !online && (
          <button className="db-opt db-draft" onClick={onDraft}>
            <b>{t('db.draft')}</b><span>{t('db.draftHint')}</span>
          </button>
        )}
      </div>
    </Panel>
  );
  // standard: klassisk udseende + ægte CM 01/02 (isRetro() kræver et kørende spil – derfor temaet direkte)
  const [look, setLook] = useState<'modern' | 'classic'>(initialLook);
  const retro = look === 'classic';
  const lookPicker = <LookPicker value={look} onPick={setLook} />;
  // spiltilstand: ægte CM 01/02 (kun originalens funktioner) eller udvidet (alt det ekstra) – uafhængigt af databasen
  // Ægte CM 01/02 findes kun i det klassiske tema (vises altid, men er grå med det moderne udseende)
  const modePicker = !ch && (
    <Panel title={t('mode.title')}>
      <div className="db-choice">
        {/* ægte CM 01/02 kræver det klassiske udseende – valget skifter udseendet med */}
        <div role="button" tabIndex={0} className={`db-opt ${retro && mode === 'authentic' ? 'on' : ''}`} onClick={() => { setModeState('authentic'); if (!retro) { setTheme('retro'); setLook('classic'); } }}>
          {/* ingen skærmbilleder her: de viste udseendet (klassisk/moderne), men valget gælder kun funktionerne – ejerens fejlmelding 2026-11-10 */}
          <b>{t('mode.authentic')}</b><span>{t('mode.authenticHint')}</span>
        </div>
        <div role="button" tabIndex={0} className={`db-opt ${!retro || mode === 'extended' ? 'on' : ''}`} onClick={() => setModeState('extended')}>
          <b>{t('mode.extended')}</b><span>{t('mode.extendedHint')}</span>
        </div>
      </div>
    </Panel>
  );
  if (err) return <Panel title={t('start.new')}><div className="bad">{err}</div></Panel>;
  if (!world) return <div>{dbPicker}{lookPicker}{modePicker}<Panel title={t('start.new')}><div className="muted">{t('start.loadingDb')}</div></Panel></div>;

  const leagues = world.leagues.filter((l) => active.has(l.nation) && !l.hidden);
  // den valgte liga skal høre til et valgt land – ellers vises det første valgte lands liga
  const shownLeague = leagues.some((l) => l.id === league) ? league : leagues.slice().sort((a, b) => a.tier - b.tier)[0]?.id ?? '';
  const clubs = world.clubs.filter((c) => c[4] === shownLeague).sort((a, b) => a[2].localeCompare(b[2]));
  const clubNation = world.clubs.find((c) => c[0] === club)?.[3];
  const canStart = name.trim().length > 0 && club > 0 && clubNation !== undefined && active.has(clubNation);

  const start = () => {
    setBusy(online ? t('mp.creating') : t('start.creating'));
    const opts = {
      managerName: name.trim(), managerNation: clubNation ?? 0, clubId: club, activeNations: [...active],
      lang: getLang(), masking, seed, challenge, mode: retro ? mode : 'extended',
    };
    // nyt spil: nulstil sidemenuen, så "Holdet" er foldet ud fra start (resten huskes derefter)
    try { localStorage.setItem(GROUP_KEY, JSON.stringify(NAV_CLOSED_DEFAULT)); } catch { /* ignorer */ }
    track('start_game', { mode: online ? 'online' : bots > 0 ? 'local_ai' : 'single', db: dbKind, challenge: !!challenge, lang: opts.lang });
    setTimeout(async () => {
      if (online) {
        try { await createOnlineGame(world, { ...opts, deadlineHours: deadline }, { count: bots, scope: botScope }); } catch (e) { setErr(String((e as Error).message)); }
      } else {
        createGame(world, opts);
        if (bots > 0) {
          // lokalt spil mod AI-managere: samme multiplayer-regler, men du spiller dine kampe live
          enableMultiplayer('host', opts.managerName);
          gs().localMp = true;
          setupBots(bots, botScope);
        }
        notify();
        const c = world.clubs.find((x) => x[0] === club), lg = world.leagues.find((l) => l.id === c?.[4]);
        notifyNewCareer({
          manager: opts.managerName, club: c?.[2] ?? String(club), league: lg?.name, nation: natName(world.nations[clubNation ?? -1]?.name),
          challenge, bots, db: dbKind, lang: opts.lang,
        });
      }
      setBusy('');
    }, 30);
  };

  return (
    <div>
      {dbPicker}{lookPicker}{modePicker}
      <Panel title={ch ? t(`challenge.${ch.id}.title`) : online ? t('mp.create') : t('start.new')} right={<button className="small" onClick={onBack}>{t('common.back')}</button>}>
        <div className="col">
          {ch && <div className="insight good">{t(`challenge.${ch.id}.desc`)}</div>}
          <label>{t('start.managerName')}
            <input style={{ marginLeft: 8, width: 220 }} value={name} onChange={(e) => setName(e.target.value)} placeholder={t('start.managerPlaceholder')} autoFocus={!!ch} />
          </label>
        </div>
      </Panel>
      {!ch && (
        <Panel title={t('start.nations')} right={<span className="muted">{t('start.nationsHint')}</span>}>
          <div className="grid-choices">
            {leagueNations.map((n) => (
              <label key={n} className={`choice ${active.has(n) ? 'on' : ''}`}>
                <input type="checkbox" checked={active.has(n)} onChange={() => {
                  const s = new Set(active);
                  const adding = !s.has(n);
                  if (adding) s.add(n); else s.delete(n);
                  setActive(s);
                  // klubvalget følger med: et nyt land viser dets bedste liga; fjernes landet for den valgte liga, skiftes der
                  const top = (nat: number) => world.leagues.filter((l) => l.nation === nat && !l.hidden).sort((a, b) => a.tier - b.tier)[0];
                  const curNation = world.leagues.find((l) => l.id === league)?.nation;
                  const next = adding ? top(n) : curNation === n ? [...s].map(top).find(Boolean) : undefined;
                  if (next) { setLeague(next.id); setClub(0); } else if (!adding && curNation === n) { setLeague(''); setClub(0); }
                }} />
                <Flag name={world.nations[n].name} />{natName(world.nations[n].name)}
                <span className="muted" style={{ marginLeft: 'auto' }}>{world.leagues.filter((l) => l.nation === n && !l.hidden).length}</span>
              </label>
            ))}
          </div>
          <div className="muted" style={{ marginTop: 6 }}>{t('start.perfHint')}</div>
        </Panel>
      )}
      {!ch && (
        <Panel title={t('start.pickClub')}>
          <div className="row" style={{ marginBottom: 8 }}>
            <Select value={shownLeague} onChange={(v) => { setLeague(v); setClub(0); }} width={300}
              options={leagues.map((l) => ({ value: l.id, label: compName(l.name), group: natName(world.nations[l.nation].name) }))} />
          </div>
          <div className="grid-choices">
            {clubs.map((c) => (
              <div key={c[0]} className={`choice ${club === c[0] ? 'on' : ''}`} onClick={() => setClub(c[0])}>{c[2]}</div>
            ))}
          </div>
        </Panel>
      )}
      {BOTS_ENABLED && !ch && (
        <Panel title={t('bots.title')}>
          <div className="col">
            <div className="muted">{t(online ? 'bots.hintOnline' : 'bots.hint')}</div>
            <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
              {[0, 1, 2, 3, 5, 7].map((n) => <button key={n} className={`small ${bots === n ? 'primary' : ''}`} onClick={() => setBots(n)}>{n === 0 ? t('bots.none') : n}</button>)}
            </div>
            {bots > 0 && (
              <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
                {t('bots.where')}: {(['league', 'nation', 'world'] as const).map((s) => <button key={s} className={`small ${botScope === s ? 'primary' : ''}`} onClick={() => setBotScope(s)}>{t(`bots.scope.${s}`)}</button>)}
              </div>
            )}
          </div>
        </Panel>
      )}
      {online && (
        <Panel title={t('mp.deadlineTitle')}>
          <div className="col">
            <div className="muted">{t('mp.deadlineHint')}</div>
            <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
              {[0, 6, 12, 24, 48].map((h) => <button key={h} className={`small ${deadline === h ? 'primary' : ''}`} onClick={() => setDeadline(h)}>{h ? t('mp.hours', { n: h }) : t('mp.noDeadline')}</button>)}
            </div>
          </div>
        </Panel>
      )}
      <Panel title={t('start.options')}>
        <div className="col">
          <label className="row"><input type="checkbox" checked={masking} onChange={(e) => setMasking(e.target.checked)} /> {t('start.masking')}</label>
          <div className="muted">{t('start.maskingHint')}</div>
          <label className="row">{t('start.seed')} <input type="number" value={seed} onChange={(e) => setSeed(Number(e.target.value) || 0)} style={{ width: 140 }} /></label>
          <div className="muted">{t('start.seedHint')}</div>
        </div>
      </Panel>
      <div className="row" style={{ justifyContent: 'flex-end' }}>
        {!canStart && <span className="muted">{t('start.needNameClub')}</span>}
        <button className="primary" disabled={!canStart} onClick={start}>{online ? t('mp.createBtn') : t('start.begin')}</button>
      </div>
      <div className="muted" style={{ marginTop: 8 }}>{t((world as { kind?: string }).kind === 'cm0102' ? 'start.dataNoteCm' : 'start.dataNote', { src: world.source })}</div>
    </div>
  );
}

