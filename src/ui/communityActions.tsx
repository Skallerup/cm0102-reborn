// Fællesskabet i selve spillet: del karrieren i Hall of Fame og foreslå rettelser til CM-databasen.
import { useState } from 'react';
import { ATTRS } from '../game/attributes';
import { cmDatabase } from '../game/newgame';
import type { GameState, Player } from '../game/types';
import { compName, t } from '../i18n';
import { proposeEdit, shareCareer, hubAvailable, type HallSummary } from '../online/hub';
import { getProfile } from '../online/rank';
import { Modal, Panel, posStr } from './components';
import { useGame } from './core';
import { ProfileGate } from './Community';

/** Hvilken CM-database spillet bruger (rettelser og karrierer knyttes til den) */
export const dbOf = cmDatabase;

/** Karrierens hovedlinjer: sæsoner, trofæer og de spillere, der har betydet mest */
export function careerSummary(g: GameState): HallSummary {
  const clubs = new Set([...g.manager.history.map((h) => h.club), g.userClub].filter(Boolean));
  const tally = new Map<number, { apps: number; goals: number; club: number }>();
  for (const p of Object.values(g.players)) {
    let apps = 0, goals = 0, club = 0;
    for (const h of p.history ?? []) if (clubs.has(h.club)) { apps += h.apps; goals += h.goals; club = h.club; }
    if (clubs.has(p.club)) { apps += p.stats.apps + p.stats.subs; goals += p.stats.goals; club = p.club; }
    if (apps) tally.set(p.id, { apps, goals, club });
  }
  const players = [...tally.entries()].sort((a, b) => b[1].apps + b[1].goals * 3 - (a[1].apps + a[1].goals * 3)).slice(0, 10).map(([id, x]) => {
    const p = g.players[id] as Player;
    return { name: `${p.first} ${p.last}`.trim(), pos: posStr(p), apps: x.apps, goals: x.goals, club: g.clubs[x.club]?.short ?? '' };
  });
  const history = g.manager.history.map((h) => ({ season: h.season, club: g.clubs[h.club]?.name ?? '?', league: compName(g.leagues[h.league]?.name) ?? h.league, pos: h.pos }));
  const trophies = g.manager.trophies.filter((x) => !/month/i.test(x.comp)).map((x) => ({ season: x.season, comp: compName(x.comp), club: g.clubs[x.club]?.name ?? '' }));
  return {
    manager: g.manager.name, nation: g.nations[g.manager.nation]?.name, db: dbOf(g) ?? 'modern', startSeason: history[0]?.season ?? g.season, season: g.season,
    history, trophies, players, rep: Math.round(g.manager.rep), seasons: history.length,
  };
}

/** "Del karrieren i Hall of Fame" (på profilsiden) */
export function ShareCareerPanel() {
  const g = useGame()!;
  const club = g.clubs[g.userClub];
  const [title, setTitle] = useState(`${g.manager.name} – ${club?.name ?? ''}`.trim());
  const [msg, setMsg] = useState<{ text: string; id?: number; bad?: boolean } | null>(null);
  const [, setTick] = useState(0);
  if (!hubAvailable()) return null;
  const share = async () => {
    const s = careerSummary(g);
    const r = await shareCareer({ career: g.id, title, club: club?.name ?? s.history.at(-1)?.club ?? '', league: s.history.at(-1)?.league ?? '', db: s.db, seasons: s.seasons, trophies: s.trophies.length, summary: s });
    setMsg('error' in r ? { text: t(`hub.err.${r.error}`) === `hub.err.${r.error}` ? t('hub.err.error') : t(`hub.err.${r.error}`), bad: true } : { text: t('hub.share.done'), id: r.id });
  };
  return (
    <Panel title={t('hub.share.title')}>
      <p className="muted" style={{ marginTop: 0 }}>{t('hub.share.text')}</p>
      {!getProfile() ? <ProfileGate defaultName={g.manager.name} onDone={() => setTick((x) => x + 1)} /> : (
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <input className="grow" maxLength={80} value={title} onChange={(e) => setTitle(e.target.value)} />
          <button className="primary" disabled={!title.trim()} onClick={share}>{t('hub.share.btn')}</button>
        </div>
      )}
      {msg && <div className={`insight ${msg.bad ? 'warn' : 'good'}`} style={{ marginTop: 8 }}>{msg.text}{msg.id && <> · <a href={`/?hall=${msg.id}`} target="_blank" rel="noreferrer">{t('hub.share.open')}</a></>}</div>}
    </Panel>
  );
}

/** Foreslå en rettelse til en spiller eller en klub i CM-databasen */
export function ProposeEditModal({ kind, id, onClose }: { kind: 'player' | 'club'; id: number; onClose: () => void }) {
  const g = useGame()!;
  const db = dbOf(g);
  const p = kind === 'player' ? g.players[id] : undefined;
  const c = kind === 'club' ? g.clubs[id] : undefined;
  const fields = kind === 'player' ? ['first', 'last', 'attr'] : ['name', 'short', 'color'];
  const [field, setField] = useState(fields[0]);
  const [attr, setAttr] = useState(0);
  const [value, setValue] = useState('');
  const [reason, setReason] = useState('');
  const [msg, setMsg] = useState<{ text: string; bad?: boolean } | null>(null);
  const [, setTick] = useState(0);
  const old = field === 'first' ? p?.first ?? '' : field === 'last' ? p?.last ?? '' : field === 'attr' ? String(Math.round(p?.attrs[attr] ?? 0))
    : field === 'name' ? c?.name ?? '' : field === 'short' ? c?.short ?? '' : (c?.colors ?? []).join(',');
  const send = async () => {
    const v = field === 'attr' ? `${attr}:${value}` : value.trim();
    const r = await proposeEdit({ db: db!, kind, target: id, targetName: p ? `${p.first} ${p.last}`.trim() : c?.name ?? '', field, old: field === 'attr' ? `${attr}:${old}` : old, value: v, reason });
    setMsg('error' in r ? { text: t(`hub.err.${r.error}`) === `hub.err.${r.error}` ? t('hub.err.error') : t(`hub.err.${r.error}`), bad: true } : { text: t('hub.edit.sent') });
  };
  return (
    <Modal title={t('hub.edit.title', { name: p ? `${p.first} ${p.last}`.trim() : c?.name ?? '' })} onClose={onClose}>
      {!db ? <div className="muted">{t('hub.edit.onlyCm')}</div> : !hubAvailable() ? <div className="muted">{t('rank.offline')}</div> : !getProfile() ? <ProfileGate defaultName={g.manager.name} onDone={() => setTick((x) => x + 1)} /> : msg && !msg.bad ? <div className="insight good">{msg.text}</div> : (
        <div className="col">
          <p className="muted" style={{ marginTop: 0 }}>{t('hub.edit.intro')}</p>
          <label className="col">{t('hub.edit.field')}
            <select value={field} onChange={(e) => { setField(e.target.value); setValue(''); }}>{fields.map((f) => <option key={f} value={f}>{t(`hub.field.${f}`)}</option>)}</select>
          </label>
          {field === 'attr' && (
            <label className="col">{t('hub.field.attr')}
              <select value={attr} onChange={(e) => setAttr(Number(e.target.value))}>{ATTRS.slice(0, 36).map((k, i) => <option key={k} value={i}>{t(`attr.${k}`)}</option>)}</select>
            </label>
          )}
          <div className="muted">{t('hub.edit.now')}: <b>{old || '–'}</b></div>
          <label className="col">{t('hub.edit.new')}
            {field === 'attr' ? <input type="number" min={1} max={20} value={value} onChange={(e) => setValue(e.target.value)} />
              : <input maxLength={60} value={value} placeholder={field === 'color' ? '#c8102e,#ffffff' : ''} onChange={(e) => setValue(e.target.value)} />}
          </label>
          <label className="col">{t('hub.edit.reason')}<textarea rows={3} maxLength={600} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t('hub.edit.reasonPh')} /></label>
          {msg?.bad && <div className="bad">{msg.text}</div>}
          <button className="primary" disabled={!value.trim() || reason.trim().length < 5} onClick={send}>{t('hub.edit.send')}</button>
        </div>
      )}
    </Modal>
  );
}

