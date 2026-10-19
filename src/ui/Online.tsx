import { useEffect, useMemo, useState } from 'react';
import type { WorldData } from '../game/newgame';
import type { GameState } from '../game/types';
import { t } from '../i18n';
import {
  downloadSnapshot, fetchRoom, forgetRoom, joinOnlineGame, openSession, savedRooms, session, type RoomInfo,
} from '../online/client';
import { Modal, Panel } from './components';
import { gs, hasGame } from '../game/state';
import { act } from '../game/actions';
import { useNav } from './core';
import { focusNews } from './inboxFocus';
import { notifyUser } from './notify';
import { loadWorld } from './world';

/** Startmenuens online-del: opret, deltag eller genoptag */
export function OnlineMenu({ onBack, onCreate, setBusy, initialCode }: { onBack: () => void; onCreate: () => void; setBusy: (s: string) => void; initialCode?: string }) {
  const [code, setCode] = useState(initialCode ?? '');
  const [joining, setJoining] = useState<string | null>(initialCode ? initialCode.toUpperCase() : null);
  const [err, setErr] = useState('');
  const [rooms, setRooms] = useState(savedRooms);
  if (location.hostname.endsWith('github.io')) {
    return (
      <Panel title={t('mp.title')} right={<button className="small" onClick={onBack}>{t('common.back')}</button>}>
        <p>{t('mp.useVercel')}</p>
        <a className="link" href={`https://cm0102-reborn.vercel.app/${initialCode ? `?room=${initialCode}` : ''}`}>https://cm0102-reborn.vercel.app</a>
      </Panel>
    );
  }
  if (joining) return <JoinRoom code={joining} onBack={() => setJoining(null)} setBusy={setBusy} />;
  return (
    <Panel title={t('mp.title')} right={<button className="small" onClick={onBack}>{t('common.back')}</button>}>
      <div className="col">
        <p className="muted">{t('mp.explain')}</p>
        <button className="primary" onClick={onCreate}>{t('mp.create')}</button>
        <div className="row">
          <input placeholder={t('mp.codePlaceholder')} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={5} style={{ width: 120, textTransform: 'uppercase' }} />
          <button disabled={code.length < 5} onClick={() => setJoining(code)}>{t('mp.join')}</button>
        </div>
        {rooms.length > 0 && (
          <>
            <h4 className="accent">{t('mp.myGames')}</h4>
            {rooms.map((r) => (
              <div key={r.code} className="choice">
                <div className="grow" onClick={async () => {
                  setBusy(t('mp.connecting'));
                  try { await openSession(r); } catch (e) { setErr(String((e as Error).message)); }
                  setBusy('');
                }}>
                  <b>{r.code}</b> <span className="muted">— {r.name}</span>
                </div>
                <button className="small danger" onClick={() => { if (!confirm(t('mp.forgetConfirm', { code: r.code }))) return; forgetRoom(r.code); setRooms(savedRooms()); setErr(''); }}>{t('common.delete')}</button>
              </div>
            ))}
          </>
        )}
        {err && <div className="bad">{t(`mp.err.${err}`) !== `mp.err.${err}` ? t(`mp.err.${err}`) : err}</div>}
      </div>
    </Panel>
  );
}

function JoinRoom({ code, onBack, setBusy }: { code: string; onBack: () => void; setBusy: (s: string) => void }) {
  const [room, setRoom] = useState<RoomInfo | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [world, setWorld] = useState<WorldData | null>(null);
  const [err, setErr] = useState('');
  const [name, setName] = useState('');
  const [league, setLeague] = useState('');
  const [club, setClub] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetchRoom(code);
        setRoom(r);
        if (!r.snapshot) { setErr('not-ready'); return; }
        const [{ state: s }, w] = await Promise.all([downloadSnapshot(r.snapshot), loadWorld()]);
        setState(s);
        setWorld(w);
        const firstLeague = Object.keys(s.comps).find((id) => s.comps[id].type === 'league');
        if (firstLeague) setLeague(firstLeague);
      } catch (e) {
        setErr(String((e as Error).message));
      }
    })();
  }, [code]);

  const taken = useMemo(() => new Set(room?.players.map((p) => p.club) ?? []), [room]);
  if (err) return <Panel title={`${t('mp.join')} ${code}`} right={<button className="small" onClick={onBack}>{t('common.back')}</button>}><div className="bad">{t(`mp.err.${err}`) !== `mp.err.${err}` ? t(`mp.err.${err}`) : err}</div></Panel>;
  if (!room || !state || !world) return <Panel title={`${t('mp.join')} ${code}`}><div className="muted">{t('mp.connecting')}</div></Panel>;
  const leagues = Object.values(state.comps).filter((c) => c.type === 'league');
  const clubs = (state.comps[league]?.clubs ?? []).map((id) => state.clubs[id]).filter(Boolean).sort((a, b) => a.short.localeCompare(b.short));
  const canJoin = name.trim() && club && !taken.has(club);
  return (
    <Panel title={`${t('mp.join')} ${code}`} right={<button className="small" onClick={onBack}>{t('common.back')}</button>}>
      <div className="col">
        <div className="muted">{t('mp.players')}: {room.players.map((p) => `${p.name} (${state.clubs[p.club]?.short ?? '?'})`).join(', ')}</div>
        <label>{t('start.managerName')} <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('start.managerPlaceholder')} autoFocus style={{ marginLeft: 8 }} /></label>
        <select value={league} onChange={(e) => { setLeague(e.target.value); setClub(0); }}>
          {leagues.map((l) => <option key={l.id} value={l.id}>{state.nations[l.nation]?.name} – {l.name}</option>)}
        </select>
        <div className="grid-choices">
          {clubs.map((c) => (
            <div key={c.id} className={`choice ${club === c.id ? 'on' : ''}`} style={taken.has(c.id) ? { opacity: 0.4, pointerEvents: 'none' } : undefined} onClick={() => setClub(c.id)}>
              {c.short}{taken.has(c.id) && <span className="tag">{t('mp.taken')}</span>}
            </div>
          ))}
        </div>
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button className="primary" disabled={!canJoin} onClick={async () => {
            setBusy(t('mp.connecting'));
            try { await joinOnlineGame(code, name.trim(), club, state.clubs[club].nation); } catch (e) { setErr(String((e as Error).message)); }
            setBusy('');
          }}>{t('mp.joinBtn')}</button>
        </div>
      </div>
    </Panel>
  );
}

/** Topbar-kontroller i online-spil */
let titleTimer: ReturnType<typeof setInterval> | null = null;
let titleBase = '';
/** Fanens titel skifter, så man også kan se det, når man er i en anden fane */
function blinkTitle(on: boolean) {
  if (on && !titleTimer) {
    titleBase = document.title;
    let flip = false;
    titleTimer = setInterval(() => { flip = !flip; document.title = flip ? `⏳ ${t('mp.othersWaitingShort')}` : titleBase; }, 1000);
  } else if (!on && titleTimer) {
    clearInterval(titleTimer);
    titleTimer = null;
    document.title = titleBase || document.title;
  }
}

export function OnlineControls() {
  const s = session();
  const [copied, setCopied] = useState(false);
  const [hostOpen, setHostOpen] = useState(false);
  const { nav, route } = useNav();
  const unread = hasGame() ? gs().news.filter((n) => !n.read).length : 0;
  // (beregnes før det tidlige return, så hooket altid kaldes)
  const waitingForMe = !!s?.room && s.room.players.length > 1 && !s.me?.ready && s.room.players.every((p) => p.ready || p.pid === s.creds.pid);
  useEffect(() => {
    blinkTitle(waitingForMe);
    if (waitingForMe) notifyUser(t('mp.othersWaitingShort'), t('mp.allWaitingBanner'), 'turn');
    return () => blinkTitle(false);
  }, [waitingForMe]);
  if (!s || !s.room) return null;
  const me = s.me;
  // alene i rummet (evt. med AI-managere): knappen fungerer som Fortsæt
  const solo = s.room.players.length === 1;
  const waiting = s.room.players.filter((p) => !p.ready).map((p) => (p.pid === s.creds.pid ? t('mp.you') : p.name));
  // alle de andre er klar – nu venter de kun på mig
  const othersWaiting = !solo && !me?.ready && s.room.players.every((p) => p.ready || p.pid === s.creds.pid);
  const link = `${location.origin}${location.pathname}?room=${s.creds.code}`;
  return (
    <>
      <button className="small" title={link} onClick={async () => { try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { prompt(t('mp.inviteLink'), link); } }}>
        {copied ? t('mp.copied') : `${t('mp.invite')} · ${s.creds.code}`}
      </button>
      {(() => {
        const dl = s.deadline();
        if (!dl || !waiting.length || s.room.processing) return null;
        const left = dl - Date.now();
        const h = Math.floor(left / 3_600_000), m = Math.max(0, Math.floor((left % 3_600_000) / 60_000));
        return <span className="muted nowrap" title={t('mp.deadlineTip')}>⏱ {left > 0 ? t('mp.deadlineLeft', { h, m }) : t('mp.deadlinePassed')}</span>;
      })()}
      {s.isHost && s.room.players.length > 1 && <button className="small" title={t('mp.hostTitle')} onClick={() => setHostOpen(true)}>👑 {t('mp.host')}</button>}
      {hostOpen && <HostModal onClose={() => setHostOpen(false)} />}
      {!me && s.inGame && <span className="bad nowrap">{t('mp.youWereRemoved')}</span>}
      {othersWaiting && <div className="waiting-banner" role="alert">⏳ {t('mp.allWaitingBanner')}</div>}
      <span className={othersWaiting ? 'waiting-me nowrap' : 'muted nowrap'}>
        {othersWaiting ? t('mp.othersWaitingShort') : s.status === 'processing' ? t('mp.processing') : s.room.processing ? t('mp.otherProcessing') : solo ? '' : waiting.length ? t('mp.waitingFor', { names: waiting.join(', ') }) : t('mp.allReady')}
      </span>
      <button className={`${me?.ready ? 'unready' : 'continue primary'} ${othersWaiting ? 'nudge' : ''}`} title={othersWaiting ? t('mp.othersWaiting') : undefined} disabled={s.status !== 'idle' || !!s.room.processing} onClick={() => {
        // som i enkeltspiller: læs først de ulæste beskeder én ad gangen (ældste først), før man melder klar
        if (!me?.ready && hasGame()) {
          const next = gs().news.filter((n) => !n.read).pop();
          if (next) { act({ t: 'read', ids: [next.id] }); focusNews(next.id); if (route.name !== 'inbox') nav({ name: 'inbox' }); return; }
        }
        void s.setReady(!me?.ready);
      }}>
        {solo ? (me?.ready ? t('mp.processingShort') : t('mp.continueSolo')) : me?.ready ? t('mp.notReady') : t('mp.ready')}
        {!me?.ready && unread > 0 && <span className="cont-badge">{unread}</span>}
      </button>
    </>
  );
}

/** Værten: se hvem der er klar, tving trækket igennem eller fjern spillere, der er gået offline */
function HostModal({ onClose }: { onClose: () => void }) {
  const s = session();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  if (!s?.room) return null;
  const clubs = hasGame() ? gs().clubs : {};
  const notReady = s.room.players.filter((p) => !p.ready);
  const run = async (f: () => Promise<void>) => { setBusy(true); setErr(''); try { await f(); } catch (e) { setErr(String((e as Error).message)); } setBusy(false); };
  return (
    <Modal title={t('mp.hostTitle')} onClose={onClose}>
      <div className="col">
        <table className="grid">
          <tbody>
            {s.room.players.map((p) => (
              <tr key={p.pid}>
                <td>{p.name}{p.pid === s.room!.host ? ' 👑' : ''}</td>
                <td>{clubs[p.club]?.short ?? ''}</td>
                <td>{p.ready ? <span className="tag good">{t('mp.isReady')}</span> : <span className="tag warn">{t('mp.notReadyYet')}</span>}</td>
                <td>{p.pid !== s.room!.host && <button className="small danger" disabled={busy} onClick={() => { if (confirm(t('mp.kickConfirm', { name: p.name }))) void run(() => s.kick(p.pid)); }}>{t('mp.kick')}</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="muted" style={{ fontSize: 12 }}>{t('mp.kickHint')}</div>
        {err && <div className="insight bad">{err}</div>}
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button onClick={onClose}>{t('common.cancel')}</button>
          <button className="primary" disabled={busy || notReady.length === 0} title={t('mp.forceHint')} onClick={() => { if (confirm(t('mp.forceConfirm', { names: notReady.map((p) => p.name).join(', ') }))) void run(async () => { await s.forceContinue(); onClose(); }); }}>{t('mp.force')}</button>
        </div>
      </div>
    </Modal>
  );
}

/** Vises når man har tilmeldt sig, men endnu ikke er med i spillet */
export function Lobby() {
  const s = session();
  if (!s?.room) return null;
  return (
    <Panel title={t('mp.lobby')}>
      <div className="col">
        <p>{t('mp.lobbyText')}</p>
        <OnlinePlayers />
      </div>
    </Panel>
  );
}

export function OnlinePlayers() {
  const s = session();
  if (!s?.room) return null;
  const clubs = hasGame() ? gs().clubs : {};
  return (
    <table className="grid">
      <tbody>
        {s.room.players.map((p) => (
          <tr key={p.pid} className={p.pid === s.creds.pid ? 'me' : ''}>
            <td>{p.name}</td>
            <td>{clubs[p.club]?.short ?? p.club}</td>
            <td>{p.ready ? <span className="tag good">{t('mp.isReady')}</span> : <span className="tag warn">{t('mp.notReadyYet')}</span>}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
