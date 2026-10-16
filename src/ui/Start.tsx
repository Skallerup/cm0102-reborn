import { useEffect, useMemo, useState } from 'react';
import { CHALLENGES } from '../game/challenges';
import { createGame, type WorldData } from '../game/newgame';
import { deleteSave, importSave, listSaves, loadGame, type SaveMeta } from '../game/save';
import { notify } from '../game/state';
import type { Lang } from '../game/types';
import { dateFmt, getLang, setLang, t } from '../i18n';
import { Panel } from './components';
import { loadWorld } from './world';

type View = 'menu' | 'new' | 'load' | 'challenges';

export function Start({ onLang }: { onLang: (l: Lang) => void }) {
  const [view, setView] = useState<View>('menu');
  const [challenge, setChallenge] = useState<string | undefined>();
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
    <div className="start">
      <div className="start-box">
        <div className="logo">
          <h1>Championship Manager <span>01/02</span></h1>
          <p>{t('start.subtitle')}</p>
        </div>
        {view === 'menu' && (
          <div className="menu-btns">
            <button className="primary" onClick={() => { setChallenge(undefined); setView('new'); }}>{t('start.new')}</button>
            <button onClick={() => setView('load')}>{t('start.load')}</button>
            <button onClick={() => setView('challenges')}>{t('start.challenges')}</button>
            <label className="row" style={{ justifyContent: 'center' }}>
              <button onClick={() => document.getElementById('import-file')?.click()}>{t('start.import')}</button>
              <input id="import-file" type="file" accept=".cm0102,.json,.gz" style={{ display: 'none' }} onChange={(e) => doImport(e.target.files?.[0])} />
            </label>
            <div className="row" style={{ justifyContent: 'center' }}>
              <button className={lang === 'da' ? 'primary' : ''} onClick={() => { setLang('da'); onLang('da'); }}>Dansk</button>
              <button className={lang === 'en' ? 'primary' : ''} onClick={() => { setLang('en'); onLang('en'); }}>English</button>
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
        {view === 'new' && <NewGame challenge={challenge} onBack={() => setView('menu')} setBusy={setBusy} />}
        <div className="footer-note">{t('start.footer')}</div>
      </div>
      {busy && <div className="progress"><div>{busy}</div></div>}
    </div>
  );
}

function LoadList({ onBack, setBusy }: { onBack: () => void; setBusy: (s: string) => void }) {
  const [saves, setSaves] = useState<SaveMeta[] | null>(null);
  useEffect(() => { listSaves().then(setSaves); }, []);
  return (
    <Panel title={t('start.load')} right={<button className="small" onClick={onBack}>{t('common.back')}</button>}>
      {!saves && <div className="muted">{t('start.loading')}</div>}
      {saves && saves.length === 0 && <div className="muted">{t('start.noSaves')}</div>}
      <div className="col">
        {saves?.map((s) => (
          <div key={s.id} className="choice">
            <div className="grow" onClick={async () => { setBusy(t('start.loading')); await loadGame(s.id); setBusy(''); }}>
              <b>{s.club}</b> <span className="muted">— {s.manager}</span>
              <div className="muted">{dateFmt(s.date)} · {t('start.savedAt')} {new Date(s.saved).toLocaleString()}</div>
            </div>
            <button className="small danger" onClick={async () => { if (confirm(t('start.confirmDelete'))) { await deleteSave(s.id); setSaves(await listSaves()); } }}>{t('common.delete')}</button>
          </div>
        ))}
      </div>
    </Panel>
  );
}

const DEFAULT_NATIONS = ['Denmark', 'England'];

function NewGame({ challenge, onBack, setBusy }: { challenge?: string; onBack: () => void; setBusy: (s: string) => void }) {
  const [world, setWorld] = useState<WorldData | null>(null);
  const [err, setErr] = useState('');
  const ch = CHALLENGES.find((c) => c.id === challenge);
  const [name, setName] = useState('');
  const [active, setActive] = useState<Set<number>>(new Set());
  const [league, setLeague] = useState('');
  const [club, setClub] = useState<number>(ch?.club ?? 0);
  const [masking, setMasking] = useState(true);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9));

  useEffect(() => {
    loadWorld().then((w) => {
      setWorld(w);
      const names = ch ? ch.nations : DEFAULT_NATIONS;
      const ids = names.map((n) => w.nations.findIndex((x) => x.name === n)).filter((i) => i >= 0);
      setActive(new Set(ids));
      const first = w.leagues.find((l) => l.nation === ids[0]);
      if (first) setLeague(first.id);
    }).catch((e) => setErr(String(e)));
  }, [ch]);

  const leagueNations = useMemo(() => {
    if (!world) return [];
    const ns = [...new Set(world.leagues.map((l) => l.nation))];
    return ns.sort((a, b) => world.nations[a].name.localeCompare(world.nations[b].name));
  }, [world]);

  if (err) return <Panel title={t('start.new')}><div className="bad">{err}</div></Panel>;
  if (!world) return <Panel title={t('start.new')}><div className="muted">{t('start.loadingDb')}</div></Panel>;

  const leagues = world.leagues.filter((l) => active.has(l.nation));
  const clubs = world.clubs.filter((c) => c[4] === league).sort((a, b) => a[2].localeCompare(b[2]));
  const clubNation = world.clubs.find((c) => c[0] === club)?.[3];
  const canStart = name.trim().length > 0 && club > 0 && clubNation !== undefined && active.has(clubNation);

  const start = () => {
    setBusy(t('start.creating'));
    setTimeout(() => {
      createGame(world, {
        managerName: name.trim(), managerNation: clubNation ?? 0, clubId: club, activeNations: [...active],
        lang: getLang(), masking, seed, challenge,
      });
      notify();
      setBusy('');
    }, 30);
  };

  return (
    <div>
      <Panel title={ch ? t(`challenge.${ch.id}.title`) : t('start.new')} right={<button className="small" onClick={onBack}>{t('common.back')}</button>}>
        <div className="col">
          {ch && <div className="insight good">{t(`challenge.${ch.id}.desc`)}</div>}
          <label>{t('start.managerName')}
            <input style={{ marginLeft: 8, width: 220 }} value={name} onChange={(e) => setName(e.target.value)} placeholder={t('start.managerPlaceholder')} autoFocus />
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
                  if (s.has(n)) s.delete(n); else s.add(n);
                  setActive(s);
                }} />
                {world.nations[n].name}
                <span className="muted" style={{ marginLeft: 'auto' }}>{world.leagues.filter((l) => l.nation === n).length}</span>
              </label>
            ))}
          </div>
          <div className="muted" style={{ marginTop: 6 }}>{t('start.perfHint')}</div>
        </Panel>
      )}
      {!ch && (
        <Panel title={t('start.pickClub')}>
          <div className="row" style={{ marginBottom: 8 }}>
            <select value={league} onChange={(e) => { setLeague(e.target.value); setClub(0); }}>
              {leagues.map((l) => <option key={l.id} value={l.id}>{world.nations[l.nation].name} – {l.name}</option>)}
            </select>
          </div>
          <div className="grid-choices">
            {clubs.map((c) => (
              <div key={c[0]} className={`choice ${club === c[0] ? 'on' : ''}`} onClick={() => setClub(c[0])}>{c[2]}</div>
            ))}
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
        <button className="primary" disabled={!canStart} onClick={start}>{t('start.begin')}</button>
      </div>
      <div className="muted" style={{ marginTop: 8 }}>{t('start.dataNote', { src: world.source })}</div>
    </div>
  );
}
