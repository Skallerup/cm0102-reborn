import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { DraftJoin } from './Draft';
import { askConfirm } from './confirm';
import type { GameState } from '../game/types';
import { compName, dateFmt, t, natName } from '../i18n';
import {
  activePlayers, allReady, downloadSnapshot, fetchRoom, forgetRoom, joinOnlineGame, openSession, savedRooms, session, skippedMatches, type RoomInfo, type RoomPlayer,
} from '../online/client';
import { Panel } from './components';
import { gs, hasGame, setGame } from '../game/state';
import { act } from '../game/actions';
import { useNav } from './core';
import { focusNews } from './inboxFocus';
import { notifyUser } from './notify';
import { modernOn } from './modernFlag';
import { titleColors, useClassicDialog } from './classic';
import { closeSession } from '../online/client';
import { forgetLast } from '../game/save';

/** Startmenuens online-del: opret, deltag eller genoptag */
export function OnlineMenu({ onBack, onCreate, onCreateDraft, setBusy, initialCode }: { onBack: () => void; onCreate: () => void; onCreateDraft: () => void; setBusy: (s: string) => void; initialCode?: string }) {
  const [code, setCode] = useState(initialCode ?? '');
  const [joining, setJoining] = useState<string | null>(initialCode ? initialCode.toUpperCase() : null);
  const [err, setErr] = useState('');
  const [rooms, setRooms] = useState(savedRooms);
  if (location.hostname.endsWith('github.io')) {
    return (
      <Panel title={t('mp.title')} right={<button className="small" onClick={onBack}>{t('common.back')}</button>}>
        <p>{t('mp.useVercel')}</p>
        <a className="link" href={`https://cm0102reborn.com/${initialCode ? `?room=${initialCode}` : ''}`}>https://cm0102reborn.com</a>
      </Panel>
    );
  }
  if (joining) return <JoinRoom code={joining} onBack={() => setJoining(null)} setBusy={setBusy} />;
  return (
    <Panel title={t('mp.title')} right={<button className="small" onClick={onBack}>{t('common.back')}</button>}>
      <div className="col">
        <p className="muted">{t('mp.explain')}</p>
        <button className="primary" onClick={onCreate}>{t('mp.create')}</button>
        {modernOn() && <button className="draft-cta" onClick={onCreateDraft}><b>🃏 {t('dr.create')}</b><span>{t('dr.createShort')}</span></button>}
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
                <button className="small danger" onClick={async () => { if (!(await askConfirm(t('mp.forgetConfirm', { code: r.code }), { danger: true }))) return; forgetRoom(r.code); setRooms(savedRooms()); setErr(''); }}>{t('common.delete')}</button>
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
  const [err, setErr] = useState('');
  const [name, setName] = useState('');
  const [league, setLeague] = useState('');
  const [club, setClub] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetchRoom(code);
        setRoom(r);
        if (r.draft) return;
        if (!r.snapshot) { setErr('not-ready'); return; }
        const { state: s } = await downloadSnapshot(r.snapshot); // (før hentede siden også hele 2026/27-databasen – ubrugt, og den hang indlæsningen)
        setState(s);
        const firstLeague = Object.keys(s.comps).find((id) => s.comps[id].type === 'league');
        if (firstLeague) setLeague(firstLeague);
      } catch (e) {
        setErr(String((e as Error).message));
      }
    })();
  }, [code]);

  const taken = useMemo(() => new Set(room?.players.map((p) => p.club) ?? []), [room]);
  // draft-liga: man opretter sin egen klub i stedet for at vælge en
  if (room?.draft && !err) return <DraftJoin code={code} room={room} onBack={onBack} setBusy={setBusy} />;
  if (err) return <Panel title={`${t('mp.join')} ${code}`} right={<button className="small" onClick={onBack}>{t('common.back')}</button>}><div className="bad">{t(`mp.err.${err}`) !== `mp.err.${err}` ? t(`mp.err.${err}`) : err}</div></Panel>;
  if (!room || !state) return <Panel title={`${t('mp.join')} ${code}`}><div className="muted">{t('mp.connecting')}</div></Panel>;
  const leagues = Object.values(state.comps).filter((c) => c.type === 'league');
  const clubs = (state.comps[league]?.clubs ?? []).map((id) => state.clubs[id]).filter(Boolean).sort((a, b) => a.short.localeCompare(b.short));
  const canJoin = name.trim() && club && !taken.has(club);
  return (
    <Panel title={`${t('mp.join')} ${code}`} right={<button className="small" onClick={onBack}>{t('common.back')}</button>}>
      <div className="col">
        <div className="muted">{t('mp.players')}: {room.players.map((p) => `${p.name} (${state.clubs[p.club]?.short ?? '?'})`).join(', ')}</div>
        <label>{t('start.managerName')} <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('start.managerPlaceholder')} autoFocus style={{ marginLeft: 8 }} /></label>
        <select value={league} onChange={(e) => { setLeague(e.target.value); setClub(0); }}>
          {leagues.map((l) => <option key={l.id} value={l.id}>{natName(state.nations[l.nation]?.name)} – {compName(l.name)}</option>)}
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

/** Klassisk: "Simulating next turn …" som originalens fremdriftsbjælke i foden (som Continue Game) – teksten, mens alle er klar og trækket simuleres */
export function onlineSimLabel(): string | null {
  const s = session();
  if (!s?.room || activePlayers(s.room).length <= 1) return null;
  if (s.status === 'error' || !(s.status === 'processing' || !!s.room.processing || allReady(s.room))) return null;
  const host = s.room.players.find((p) => p.pid === s.room!.host);
  return s.status === 'processing' ? t('mp.simYou') : s.room.processing ? t('mp.simOther', { name: host?.name ?? '' }) : t('mp.simWaitHost', { name: host?.name ?? '' });
}

export function OnlineControls({ cx }: { cx?: boolean }) {
  const s = session();
  // simuleringsvisningen kan skjules – den kommer igen ved næste træk
  const [simHidden, setSimHidden] = useState(false);
  const turnKey = s?.room ? `${s.room.version}` : '';
  useEffect(() => { setSimHidden(false); }, [turnKey]);
  const { nav, route } = useNav();
  const unread = hasGame() ? gs().news.filter((n) => !n.read).length : 0;
  // (beregnes før det tidlige return, så hooket altid kaldes)
  const waitingForMe = !!s?.room && s.inGame && !s.me?.pending && activePlayers(s.room).length > 1 && !s.me?.ready && activePlayers(s.room).every((p) => p.ready || p.pid === s.creds.pid);
  useEffect(() => {
    blinkTitle(waitingForMe);
    if (waitingForMe) notifyUser(t('mp.othersWaitingShort'), t('mp.allWaitingBanner'), 'turn');
    return () => blinkTitle(false);
  }, [waitingForMe]);
  if (!s || !s.room) return null;
  // tilmeldt, men endnu ikke med i spillet: intet at trykke Klar til (trækket venter ikke på os)
  if (!s.inGame) return <span data-testid="online-note" className={cx ? 'cx-online-note' : 'muted nowrap'}>{t('mp.pendingStatus')}</span>;
  const me = s.me;
  const active = activePlayers(s.room);
  // alene i rummet (evt. med AI-managere): knappen fungerer som Fortsæt
  const solo = active.length <= 1;
  const waiting = active.filter((p) => !p.ready).map((p) => (p.pid === s.creds.pid ? t('mp.you') : p.name));
  // alle de andre er klar – nu venter de kun på mig
  const othersWaiting = !solo && !me?.ready && active.every((p) => p.ready || p.pid === s.creds.pid);
  // min kamp i dag, som endnu ikke er spillet (ikke når en anden menneskelig manager har hjemmekampen)
  const myMatch = (() => {
    if (!hasGame() || !s.inGame) return 0;
    const g = gs();
    const f = g.pendingFixture ? g.fixtures[g.pendingFixture] : undefined;
    if (!f || f.result || skippedMatches.has(f.id)) return 0;
    return f.id;
  })();
  // mens man spiller sin kamp, styres alt inde på kampskærmen – ingen "Til kampen"/Klar i topbjælken
  const onMyMatch = !!myMatch && route.name === 'match' && (route as { id?: number }).id === myMatch;
  return (
    <>
      {(() => {
        const dl = s.deadline();
        if (!dl || !waiting.length || s.room.processing) return null;
        const left = dl - Date.now();
        const h = Math.floor(left / 3_600_000), m = Math.max(0, Math.floor((left % 3_600_000) / 60_000));
        return <span className={cx ? 'cx-online-note' : 'muted nowrap'} title={t('mp.deadlineTip')}>{cx ? '' : '⏱ '}{left > 0 ? t('mp.deadlineLeft', { h, m }) : t('mp.deadlinePassed')}</span>;
      })()}
      {!me && s.inGame && <span className="bad nowrap">{t('mp.youWereRemoved')}</span>}
      {othersWaiting && !onMyMatch && !cx && <div className="waiting-banner" role="alert">⏳ {t('mp.allWaitingBanner')}</div>}
      {!cx && !solo && !simHidden && s.status !== 'error' && (s.status === 'processing' || !!s.room.processing || allReady(s.room)) && <SimOverlay onHide={() => setSimHidden(true)} />}
      {!onMyMatch && <>{(() => {
        const others = active.filter((p) => !p.ready && p.pid !== s.creds.pid).map((p) => p.name);
        // klassisk: originalens "Waiting for other players..." (exe'ens streng) når man selv er klar, ellers hvem de andre venter på
        const note = othersWaiting ? t('mp.othersWaitingShort') : s.status === 'processing' ? t('mp.processing') : s.room.processing ? t('mp.otherProcessing') : solo ? '' : cx ? (me?.ready ? t('mp.cxWaitOthers') : others.length ? t('mp.waitingFor', { names: others.join(', ') }) : '') : waiting.length ? t('mp.waitingFor', { names: waiting.join(', ') }) : t('mp.allReady');
        return <span data-testid="online-note" className={cx ? 'cx-online-note' : othersWaiting ? 'waiting-me nowrap' : 'muted nowrap'}>{note}</span>;
      })()}
      <button data-testid="online-continue" className={cx ? `cx-sbtn cx-continue continue ${me?.ready ? 'on' : ''}` : `${me?.ready ? 'unready' : 'continue primary'} ${othersWaiting ? 'nudge' : ''}`} title={me?.ready && !solo ? t('mp.cxUnreadyHint') : othersWaiting ? t('mp.othersWaiting') : undefined} disabled={s.status !== 'idle' || !!s.room.processing} onClick={() => {
        // kampdag: spil først din kamp (eller tag et hurtigt resultat på kampskærmen)
        if (!me?.ready && myMatch) { nav({ name: 'match', id: myMatch }); return; }
        // som i enkeltspiller: læs først de ulæste beskeder én ad gangen (ældste først), før man melder klar
        if (!me?.ready && hasGame()) {
          const next = gs().news.filter((n) => !n.read).pop();
          if (next) { act({ t: 'read', ids: [next.id] }); focusNews(next.id); if (route.name !== 'inbox') nav({ name: 'inbox' }); return; }
        }
        void s.setReady(!me?.ready);
      }}>
        {!me?.ready && myMatch ? t('top.toTheMatch') : solo ? (me?.ready ? t('mp.processingShort') : cx ? t('cl.continue') : t('mp.continueSolo')) : cx ? (me?.ready ? t('mp.isReady') : t('cl.continue')) : me?.ready ? t('mp.notReady') : t('mp.ready')}
        {!cx && !me?.ready && unread > 0 && <span className="cont-badge">{unread}</span>}
      </button>
      </>}
    </>
  );
}

/** Når alle er klar: en simuleringsvisning for alle spillere, indtil det nye træk er klar */
function SimOverlay({ onHide }: { onHide: () => void }) {
  const s = session();
  if (!s?.room) return null;
  const host = s.room.players.find((p) => p.pid === s.room!.host);
  const g = hasGame() ? gs() : null;
  const club = g?.userClub;
  const next = g && club ? Object.values(g.fixtures).filter((f) => !f.result && (f.home === club || f.away === club)).sort((a, b) => a.date.localeCompare(b.date))[0] : undefined;
  const opp = next && g ? g.clubs[next.home === club ? next.away : next.home] : undefined;
  const stage = s.status === 'processing' ? t('mp.simYou') : s.room.processing ? t('mp.simOther', { name: host?.name ?? '' }) : t('mp.simWaitHost', { name: host?.name ?? '' });
  return (
    <div className="sim-overlay" role="status">
      <div className="sim-card">
        <div className="sim-ball">⚽</div>
        <h2>{t('mp.simTitle')}</h2>
        <div className="muted">{stage}</div>
        {next && opp && g && <div className="sim-next">{t('mp.simUntil', { date: dateFmt(next.date), opp: opp.name })}</div>}
        <div className="sim-bar"><span /></div>
        <div className="sim-players">
          {activePlayers(s.room).map((p) => <span key={p.pid} className="tag good">✓ {p.name}{g?.clubs[p.club] ? ` · ${g.clubs[p.club].short}` : ''}</span>)}
        </div>
        <button className="small" onClick={onHide}>{t('mp.simHide')}</button>
      </div>
    </div>
  );
}


/** Klassisk dialog (som SaveGameClassic): titelbjælke, grå brødtekst, knapper i foden */
function CxDialog({ title, sub, onClose, foot, children, full }: { title: string; sub?: string; onClose?: () => void; foot: ReactNode; children: ReactNode; full?: boolean }) {
  useClassicDialog();
  const col = titleColors((hasGame() ? gs().userClub : 0) || undefined);
  return (
    <div className={`cx-dlg cx-online-dlg${full ? ' cx-full' : ''}`} role="dialog" onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="cx-title" style={{ background: col.bg, color: col.fg }}><h2>{title}</h2></div>
      {sub && <div className="cx-subtitle">{sub}</div>}
      <div className="cx-dlg-body">{children}</div>
      <div className="cx-ts-buttons cx-dlg-foot">{foot}</div>
    </div>
  );
}

export function ClassicInvite({ code, link, onClose }: { code: string; link: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <CxDialog title={t('mp.inviteTitle')} sub={t('mp.inviteText')} onClose={onClose} foot={<>
      <button onClick={onClose}>{t('common.close')}</button>
      {'share' in navigator && <button onClick={() => { void navigator.share({ title: 'CM Reborn', text: t('mp.shareText', { code }), url: link }).catch(() => {}); }}>{t('mp.share')}</button>}
      <button className="primary" onClick={async () => { try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { prompt(t('mp.inviteLink'), link); } }}>{copied ? t('mp.copied') : t('mp.copyLink')}</button>
    </>}>
      <div className="invite-code">{code}</div>
      <input className="cx-dlg-input" readOnly value={link} onFocus={(e) => e.target.select()} />
    </CxDialog>
  );
}

function statusText(p: RoomPlayer): string {
  return p.pending ? t('mp.pendingStatus') : p.ready ? t('mp.isReady') : t('mp.cxStatusWait');
}

/** Managerne i fællesspillet som originalens grå tabel (Manager · Club · Status) */
function ClassicPlayers({ kick, busy }: { kick?: (pid: string, name: string) => void; busy?: boolean }) {
  const s = session();
  if (!s?.room) return null;
  const clubs = hasGame() ? gs().clubs : {};
  return (
    <table className="cx-tbl cx-online-tbl" data-testid="online-players">
      <thead><tr><th>{t('mp.colManager')}</th><th>{t('mp.colClub')}</th><th>{t('mp.colStatus')}</th>{kick && <th className="btn-col" />}</tr></thead>
      <tbody>
        {s.room.players.map((p) => (
          <tr key={p.pid} className={p.pid === s.creds.pid ? 'me' : ''}>
            <td>{p.name}{p.pid === s.room!.host ? ` (${t('mp.host')})` : ''}{p.online === false ? ` (${t('mp.offline')})` : ''}</td>
            <td>{clubs[p.club]?.short ?? ''}</td>
            <td className={p.ready && !p.pending ? 'ok' : ''}>{statusText(p)}</td>
            {kick && <td>{p.pid !== s.room!.host && <button className="cx-greybtn" disabled={busy} onClick={() => kick(p.pid, p.name)}>{t('mp.kick')}</button>}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Klassisk: vises, når man har tilmeldt sig, men endnu ikke er med i spillet – en hel klassisk skærm (som en CM 01/02-dialog) */
export function ClassicLobby() {
  const s = session();
  const [inviteOpen, setInviteOpen] = useState(false);
  if (!s?.room) return null;
  const link = `${location.origin}${location.pathname}?room=${s.creds.code}`;
  const quit = async () => { if (await askConfirm(t('mp.leaveConfirm'), { head: t('cl.mt.confirm') })) { void closeSession(); forgetLast(); setGame(null); } };
  return (
    <>
      <CxDialog full title={`${t('mp.title')} – ${s.creds.code}`} sub={t('mp.lobbyText')} foot={<>
        <button onClick={() => void quit()}>{t('nav.quit')}</button>
        <button data-testid="invite" onClick={() => setInviteOpen(true)}>{t('mp.invite')} · {s.creds.code}</button>
      </>}>
        <div data-testid="online-lobby" style={{ width: '100%' }}><ClassicPlayers /></div>
        <div className="cx-online-note cx-lobby-note">{t('mp.cxWaitOthers')}</div>
      </CxDialog>
      {inviteOpen && <ClassicInvite code={s.creds.code} link={link} onClose={() => setInviteOpen(false)} />}
    </>
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
            <td>{p.pending ? <span className="tag">{t('mp.pendingStatus')}</span> : p.ready ? <span className="tag good">{t('mp.isReady')}</span> : <span className="tag warn">{t('mp.notReadyYet')}</span>}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
