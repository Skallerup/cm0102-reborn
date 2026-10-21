// Draft-liga: oprettelse, tilmelding, lobby, keepers og selve draften (live, 60 sekunder pr. valg).
// Når draften er færdig, bygges sæsonen, og spillet fortsætter i den almindelige brugerflade (med færre menupunkter).
import { RoomChat } from './RoomChat';
import { useEffect, useMemo, useState } from 'react';
import { ATTRS, GROUPS, naturalRole, positionString } from '../game/attributes';
import { ageOn } from '../game/dates';
import {
  BENCH, BENCH_PLACE, CREST_SHAPES, DEFAULT_SETTINGS, KEEPER_SECONDS, MAX_TEAMS, PICK_SECONDS, REPLACE_DAYS, STARTERS,
  aiTeam, allKeepers, autoPick, canPlayRole, clubIdOf, crestSvg, draftPool, picksPerTeam, placesFor, replacementsFor, slotForPick, teamPicks,
  type DraftPick, type DraftTeam,
} from '../game/draft';
import { act } from '../game/actions';
import { forgetLast } from '../game/save';
import { gs, hasGame, notify, setGame, squad } from '../game/state';
import { FORMATIONS, formationSlots } from '../game/tactics';
import type { DraftSettings, Player, Role } from '../game/types';
import { leagueRows } from '../game/competitions';
import { dateFmt, t } from '../i18n';
import { closeSession, createDraftLeague, joinDraftLeague, session, type RoomInfo } from '../online/client';
import { askConfirm } from './confirm';
import { Panel } from './components';
import { Head } from './screens/common';
import { loadWorld } from './world';
import type { WorldData } from '../game/newgame';

const ROLES: Role[] = ['GK', 'CB', 'FB', 'DM', 'CM', 'WM', 'AM', 'W', 'ST'];
const slotLabel = (formation: string, place: number) => {
  if (place === BENCH_PLACE) return t('dr.bench');
  const s = formationSlots(formation)[place];
  return s ? (s.pos === 'GK' ? 'GK' : `${s.pos} ${s.side}`) : '?';
};
/** Spillerens evne på en skala 1-100 (CA er 1-200) */
const rating = (p: Player) => Math.round(p.ca / 2);
const pname = (p?: Player) => (p ? `${p.first ? p.first[0] + '. ' : ''}${p.last}` : '–');

/** Simpelt klublogo (SVG) */
export function DraftCrestImg({ shape, colors, short, size = 28 }: { shape: number; colors: [string, string]; short: string; size?: number }) {
  const src = useMemo(() => `data:image/svg+xml;utf8,${encodeURIComponent(crestSvg(shape, colors[0], colors[1], short))}`, [shape, colors, short]);
  return <img className="crest" src={src} alt="" width={size} height={size} style={{ width: size, height: size }} />;
}

function useTick(ms: number, on = true) {
  const [, set] = useState(0);
  useEffect(() => {
    if (!on) return;
    const h = setInterval(() => set((x) => x + 1), ms);
    return () => clearInterval(h);
  }, [ms, on]);
}

function usePool(seed: number | undefined): { pool: Player[]; byId: Record<number, Player>; world: WorldData | null } {
  const [world, setWorld] = useState<WorldData | null>(null);
  useEffect(() => { loadWorld().then(setWorld); }, []);
  return useMemo(() => {
    if (!world || seed === undefined) return { pool: [], byId: {}, world };
    const pool = draftPool(world, seed, world.season);
    return { pool, byId: Object.fromEntries(pool.map((p) => [p.id, p])), world };
  }, [world, seed]);
}

// ---------- klubbens identitet ----------

const COLOR_PRESETS = ['#c8102e', '#003399', '#00843d', '#111111', '#ffd200', '#5c2d91', '#6cabdd', '#f68b1f', '#ffffff', '#7a263a'];

function TeamEditor({ team, onChange, formation = true }: { team: Partial<DraftTeam>; onChange: (t: Partial<DraftTeam>) => void; formation?: boolean }) {
  const colors = team.colors ?? ['#c8102e', '#ffffff'];
  return (
    <div className="dr-editor">
      <div className="dr-crest-preview"><DraftCrestImg shape={team.crest ?? 0} colors={colors} short={team.short || '?'} size={72} /></div>
      <div className="col" style={{ gap: 8, flex: 1 }}>
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <label className="prof-field" style={{ flex: 2, minWidth: 180 }}>{t('dr.clubName')}<input value={team.name ?? ''} maxLength={28} onChange={(e) => onChange({ ...team, name: e.target.value })} placeholder="Northern Lights FC" /></label>
          <label className="prof-field" style={{ width: 90 }}>{t('dr.short')}<input value={team.short ?? ''} maxLength={3} onChange={(e) => onChange({ ...team, short: e.target.value.toUpperCase() })} placeholder="NLF" /></label>
          {formation && (
            <label className="prof-field" style={{ width: 150 }}>{t('dr.formation')}
              <select value={team.formation ?? '4-4-2'} onChange={(e) => onChange({ ...team, formation: e.target.value })}>{FORMATIONS.map((f) => <option key={f}>{f}</option>)}</select>
            </label>
          )}
        </div>
        <div className="row" style={{ flexWrap: 'wrap', gap: 14 }}>
          {[0, 1].map((i) => (
            <div key={i} className="dr-colors">
              <span className="muted">{t(i === 0 ? 'dr.color1' : 'dr.color2')}</span>
              {COLOR_PRESETS.map((c) => <button key={c} className={`dr-swatch ${colors[i] === c ? 'on' : ''}`} style={{ background: c }} onClick={() => { const n: [string, string] = [...colors] as [string, string]; n[i] = c; onChange({ ...team, colors: n }); }} aria-label={c} />)}
              <input type="color" value={colors[i]} onChange={(e) => { const n: [string, string] = [...colors] as [string, string]; n[i] = e.target.value; onChange({ ...team, colors: n }); }} />
            </div>
          ))}
        </div>
        <div className="row" style={{ gap: 6 }}>
          <span className="muted">{t('dr.crest')}</span>
          {Array.from({ length: CREST_SHAPES }, (_, i) => (
            <button key={i} className={`dr-shape ${team.crest === i ? 'on' : ''}`} onClick={() => onChange({ ...team, crest: i })}><DraftCrestImg shape={i} colors={colors} short={team.short || '?'} size={30} /></button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsEditor({ value, onChange, deadline, onDeadline, disabled }: { value: DraftSettings; onChange: (s: DraftSettings) => void; deadline: number; onDeadline: (h: number) => void; disabled?: boolean }) {
  return (
    <div className="dr-settings">
      <label className="prof-field">{t('dr.rounds')}
        <select disabled={disabled} value={value.rounds} onChange={(e) => onChange({ ...value, rounds: Number(e.target.value) })}>
          {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{t('dr.roundsN', { n })}</option>)}
        </select>
      </label>
      <label className="prof-field">{t('dr.playoff')}
        <select disabled={disabled} value={value.playoff} onChange={(e) => onChange({ ...value, playoff: e.target.value as DraftSettings['playoff'] })}>
          {(['none', 'final', 'semis'] as const).map((k) => <option key={k} value={k}>{t(`dr.po.${k}`)}</option>)}
        </select>
      </label>
      <label className="prof-field">{t('dr.keepers')}
        <select disabled={disabled} value={value.keepers} onChange={(e) => onChange({ ...value, keepers: Number(e.target.value) })}>
          {[0, 1, 2, 3].map((n) => <option key={n} value={n}>{n === 0 ? t('dr.keepersNone') : t('dr.keepersN', { n })}</option>)}
        </select>
      </label>
      <label className="prof-field">{t('dr.injuries')}
        <select disabled={disabled} value={value.injuries ? '1' : '0'} onChange={(e) => onChange({ ...value, injuries: e.target.value === '1' })}>
          <option value="1">{t('dr.injuriesShort')}</option><option value="0">{t('dr.injuriesOff')}</option>
        </select>
      </label>
      <label className="prof-field">{t('dr.deadline')}
        <select disabled={disabled} value={deadline} onChange={(e) => onDeadline(Number(e.target.value))}>
          {[0, 12, 24, 48].map((h) => <option key={h} value={h}>{h ? t('dr.hours', { n: h }) : t('dr.noDeadline')}</option>)}
        </select>
      </label>
    </div>
  );
}

// ---------- opret / deltag ----------

export function DraftCreate({ onBack, setBusy }: { onBack: () => void; setBusy: (s: string) => void }) {
  const [name, setName] = useState('');
  const [team, setTeam] = useState<Partial<DraftTeam>>({ name: '', short: '', colors: ['#c8102e', '#ffffff'], crest: 0, formation: '4-3-3' });
  const [settings, setSettings] = useState<DraftSettings>(DEFAULT_SETTINGS);
  const [deadline, setDeadline] = useState(0);
  const [ai, setAi] = useState(3);
  const [err, setErr] = useState('');
  const ok = name.trim().length >= 2 && (team.name ?? '').trim().length >= 2 && (team.short ?? '').trim().length >= 2;
  return (
    <Panel title={t('dr.create')} right={<button className="small" onClick={onBack}>{t('common.back')}</button>}>
      <div className="col">
        <p className="muted" style={{ marginTop: 0 }}>{t('dr.createIntro')}</p>
        <label className="prof-field">{t('start.managerName')}<input value={name} maxLength={30} onChange={(e) => setName(e.target.value)} placeholder={t('start.managerPlaceholder')} /></label>
        <h4 style={{ margin: '6px 0 0' }}>{t('dr.yourClub')}</h4>
        <TeamEditor team={team} onChange={setTeam} />
        <h4 style={{ margin: '6px 0 0' }}>{t('dr.settings')}</h4>
        <SettingsEditor value={settings} onChange={setSettings} deadline={deadline} onDeadline={setDeadline} />
        <label className="prof-field" style={{ maxWidth: 260 }}>{t('dr.aiTeams')}
          <select value={ai} onChange={(e) => setAi(Number(e.target.value))}>{Array.from({ length: 16 }, (_, i) => <option key={i} value={i}>{i}</option>)}</select>
        </label>
        <div className="muted" style={{ fontSize: 12.5 }}>{t('dr.aiHint')}</div>
        {err && <div className="insight bad">{err}</div>}
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button className="primary" disabled={!ok} onClick={async () => {
            setBusy(t('mp.connecting'));
            try {
              const s = await createDraftLeague(name.trim(), team, settings, deadline);
              const used = [team.name ?? ''];
              for (let i = 0; i < ai; i++) {
                const a = aiTeam(i + 2, used);
                used.push(a.name);
                await s.draftAddAI(a);
              }
            } catch (e) { setErr(String((e as Error).message)); }
            setBusy('');
          }}>{t('dr.createBtn')}</button>
        </div>
      </div>
    </Panel>
  );
}

export function DraftJoin({ code, room, onBack, setBusy }: { code: string; room: RoomInfo; onBack: () => void; setBusy: (s: string) => void }) {
  const [name, setName] = useState('');
  const [team, setTeam] = useState<Partial<DraftTeam>>({ name: '', short: '', colors: ['#003399', '#ffffff'], crest: 2, formation: '4-4-2' });
  const [err, setErr] = useState('');
  const d = room.draft!;
  const ok = name.trim().length >= 2 && (team.name ?? '').trim().length >= 2 && (team.short ?? '').trim().length >= 2;
  return (
    <Panel title={`${t('dr.join')} ${code}`} right={<button className="small" onClick={onBack}>{t('common.back')}</button>}>
      {d.phase !== 'lobby' ? <div className="insight warn">{t('dr.err.started')}</div> : (
        <div className="col">
          <div className="row" style={{ flexWrap: 'wrap', gap: 10 }}>
            {d.teams.map((x) => <span key={x.slot} className="row" style={{ gap: 4 }}><DraftCrestImg shape={x.crest} colors={x.colors} short={x.short} size={20} />{x.name}</span>)}
          </div>
          <label className="prof-field">{t('start.managerName')}<input value={name} maxLength={30} onChange={(e) => setName(e.target.value)} placeholder={t('start.managerPlaceholder')} autoFocus /></label>
          <h4 style={{ margin: '6px 0 0' }}>{t('dr.yourClub')}</h4>
          <TeamEditor team={team} onChange={setTeam} />
          {err && <div className="insight bad">{t(`dr.err.${err}`) !== `dr.err.${err}` ? t(`dr.err.${err}`) : err}</div>}
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button className="primary" disabled={!ok} onClick={async () => {
              setBusy(t('mp.connecting'));
              try { await joinDraftLeague(code, name.trim(), team); } catch (e) { setErr(String((e as Error).message)); }
              setBusy('');
            }}>{t('mp.joinBtn')}</button>
          </div>
        </div>
      )}
    </Panel>
  );
}

// ---------- draft-rummet ----------

export function DraftRoom() {
  const s = session();
  const room = s?.room;
  const d = room?.draft;
  useTick(500, !!d && (d.phase === 'draft' || d.phase === 'keepers'));
  const { pool, byId, world } = usePool(room?.settings.seed);
  const [msg, setMsg] = useState('');
  if (!s || !room || !d) return <div className="start"><div className="empty">{t('mp.connecting')}</div></div>;
  const leave = async () => {
    if (!(await askConfirm(t('mp.leaveConfirm')))) return;
    closeSession(); forgetLast();
    if (hasGame()) setGame(null); else notify();
  };
  const settings = room.settings.draft ?? DEFAULT_SETTINGS;
  const last = hasGame() ? gs().draft?.history.at(-1) : undefined;
  return (
    <div className="draft-page">
      <div className="draft-top">
        <div>
          <h1>{t('dr.title')} <span className="muted">· {t('dr.seasonN', { n: d.season })}</span></h1>
          <div className="muted">{t('dr.code')}: <b>{room.code}</b> · {t(`dr.phase.${d.phase}`)}</div>
        </div>
        <div className="row">
          {d.phase === 'lobby' && <button className="small" onClick={() => { void navigator.clipboard?.writeText(`${location.origin}${location.pathname}?room=${room.code}`); setMsg(t('mp.copied')); }}>{t('mp.copyLink')}</button>}
          <button className="small" onClick={leave}>{t('nav.quit')}</button>
        </div>
      </div>
      {last && d.phase !== 'lobby' && hasGame() && (
        <div className="insight good">{t('dr.lastChampion', { n: last.season, club: gs().clubs[last.champion]?.name ?? '?' })}{last.playoffWinner ? ` · ${t('dr.lastPlayoff', { club: gs().clubs[last.playoffWinner]?.name ?? '?' })}` : ''}</div>
      )}
      {msg && <div className="insight">{msg}</div>}
      {s.error && <div className="insight bad">{s.error}</div>}
      {d.phase === 'lobby' && <Lobby settings={settings} />}
      {d.phase === 'lobby' && pool.length > 0 && <LobbyPool pool={pool} byId={byId} year={world?.season ?? 2025} />}
      {d.phase === 'keepers' && <Keepers settings={settings} />}
      {d.phase === 'draft' && (pool.length ? <LiveDraft pool={pool} byId={byId} settings={settings} year={world?.season ?? 2025} /> : <div className="empty">{t('start.loading')}</div>)}
      {(d.phase === 'done' || d.phase === 'playing') && <DraftFinished byId={byId} />}
      <RoomChat />
    </div>
  );
}

function Lobby({ settings }: { settings: DraftSettings }) {
  const s = session()!;
  const room = s.room!;
  const d = room.draft!;
  const mine = s.myDraftTeam;
  const [team, setTeam] = useState<Partial<DraftTeam>>(mine ?? {});
  const [saved, setSaved] = useState(true);
  const host = s.isHost;
  return (
    <div className="cols">
      <Panel title={t('dr.teams', { n: d.teams.length, max: MAX_TEAMS })}>
        <table className="grid">
          <tbody>
            {d.teams.map((x) => (
              <tr key={x.slot} className={x.pid === s.creds.pid ? 'me' : ''}>
                <td style={{ width: 36 }}><DraftCrestImg shape={x.crest} colors={x.colors} short={x.short} size={26} /></td>
                <td><b>{x.name}</b> <span className="muted">{x.short}</span></td>
                <td>{x.ai ? <span className="tag">AI</span> : x.manager}{x.pid === room.host && <span className="tag good" style={{ marginLeft: 6 }}>{t('dr.host')}</span>}</td>
                <td className="muted">{x.formation}</td>
                <td>{host && x.ai && <button className="small" onClick={() => s.draftRemoveAI(x.slot)}>×</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {host && (
          <div className="row" style={{ marginTop: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <button className="small" disabled={d.teams.length >= MAX_TEAMS} onClick={() => { const a = aiTeam(d.teams.length + 1, d.teams.map((x) => x.name)); void s.draftAddAI(a); }}>+ {t('dr.addAI')}</button>
            <button className="primary" disabled={d.teams.length < 2} onClick={async () => { if (await askConfirm(t('dr.startConfirm', { n: d.teams.length }))) await s.draftStart(); }}>{t('dr.start')}</button>
          </div>
        )}
        {!host && <p className="muted">{t('dr.waitHost')}</p>}
        <p className="muted" style={{ fontSize: 12.5, marginBottom: 0 }}>{t('dr.lobbyHint')}</p>
      </Panel>
      <div className="col" style={{ gap: 14 }}>
        {mine && (
          <Panel title={t('dr.yourClub')}>
            <TeamEditor team={team} onChange={(x) => { setTeam(x); setSaved(false); }} />
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="primary small" disabled={saved} onClick={async () => { await s.draftTeam(team); setSaved(true); }}>{t('prof.save')}</button>
            </div>
          </Panel>
        )}
        <Panel title={t('dr.settings')}>
          <SettingsEditor value={settings} disabled={!host} onChange={(x) => s.draftSettings(x)} deadline={room.settings.deadlineHours ?? 0} onDeadline={(h) => s.draftSettings(settings, h)} />
          <ul className="muted dr-rules">
            <li>{t('dr.rule.pool')}</li>
            <li>{t('dr.rule.snake', { s: PICK_SECONDS })}</li>
            <li>{t('dr.rule.squad', { st: STARTERS, b: BENCH })}</li>
            <li>{t('dr.rule.season')}</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}

/** Før draften: gennemse puljen og byg din ønskeliste */
function LobbyPool({ pool, byId, year }: { pool: Player[]; byId: Record<number, Player>; year: number }) {
  const s = session()!;
  const mine = s.myDraftTeam;
  const [sel, setSel] = useState<number | null>(null);
  const selP = sel ? byId[sel] : null;
  return (
    <>
      <div className="insight">{t('dr.prepHint')}</div>
      <div className="dr-grid">
        <PoolPanel pool={pool} byId={byId} taken={new Set()} mine={mine} picks={[]} sel={sel} onSel={setSel} year={year} title={t('dr.pool', { n: pool.length })} />
        <div className="col" style={{ gap: 14 }}>
          {selP && <PlayerPanel p={selP} mine={mine} onClose={() => setSel(null)} />}
          {mine && <WishPanel mine={mine} taken={new Set()} byId={byId} />}
        </div>
      </div>
    </>
  );
}

/** Draften er slut: dit hold på banen, og videre til sæsonen, når den er bygget */
const SEEN = (code: string) => `cm0102.draftSeen.${code}`;
export function draftSeen(code: string, season: number): boolean {
  try { return Number(localStorage.getItem(SEEN(code)) ?? 0) >= season; } catch { return true; }
}
function DraftFinished({ byId }: { byId: Record<number, Player> }) {
  const s = session()!;
  const d = s.room!.draft!;
  const mine = s.myDraftTeam;
  const ready = d.phase === 'playing' && hasGame();
  return (
    <div className="dr-finished">
      <Panel title={`🏁 ${t('dr.finishedTitle')}`}>
        <p style={{ marginTop: 0 }}>{t(ready ? 'dr.finishedText' : 'dr.building')}</p>
        {mine && Object.keys(byId).length > 0 && <TeamPitch team={mine} picks={d.picks} byId={byId} />}
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
          <button className="primary" disabled={!ready} onClick={() => { try { localStorage.setItem(SEEN(s.creds.code), String(d.season)); } catch { /* ignorér */ } notify(); }}>
            {ready ? t('dr.toTeam') : <><span className="ai-spinner" /> {t('dr.buildingShort')}</>}
          </button>
        </div>
      </Panel>
    </div>
  );
}

function Countdown({ until }: { until: number }) {
  const s = session()!;
  const left = Math.max(0, Math.ceil((until - s.serverNow()) / 1000));
  return <span className={`dr-clock ${left <= 10 ? 'warn' : ''}`}>{left}s</span>;
}

function Keepers({ settings }: { settings: DraftSettings }) {
  const s = session()!;
  const d = s.room!.draft!;
  const mine = s.myDraftTeam;
  const [sel, setSel] = useState<number[]>(mine?.keep.map((k) => k.player) ?? []);
  if (!hasGame() || !mine) return <div className="empty">{t('start.loading')}</div>;
  const g = gs();
  const club = clubIdOf(mine.slot);
  const tac = g.userClub === club ? g.tactic : null;
  const placeOf = (id: number) => { const i = tac?.lineup.indexOf(id) ?? -1; return i >= 0 ? i : BENCH_PLACE; };
  const players = squad(club).sort((a, b) => b.ca - a.ca);
  const done = mine.keepReady;
  return (
    <div className="cols">
      <Panel title={t('dr.keepTitle', { n: settings.keepers })} right={<Countdown until={d.keepStart + KEEPER_SECONDS * 1000} />}>
        <p className="muted" style={{ marginTop: 0 }}>{t('dr.keepHint', { n: settings.keepers })}</p>
        <table className="grid">
          <tbody>
            {players.map((p) => (
              <tr key={p.id} className={sel.includes(p.id) ? 'me' : ''}>
                <td><input type="checkbox" disabled={done || (!sel.includes(p.id) && sel.length >= settings.keepers)} checked={sel.includes(p.id)} onChange={() => setSel(sel.includes(p.id) ? sel.filter((x) => x !== p.id) : [...sel, p.id])} /></td>
                <td className="muted">{slotLabel(mine.formation, placeOf(p.id))}</td>
                <td>{p.first} {p.last}</td>
                <td className="muted">{positionString(p)}</td>
                <td className="num"><b>{rating(p)}</b></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 10 }}>
          <button className="primary" disabled={done || sel.length !== settings.keepers} onClick={() => s.draftTeam({ keep: sel.map((id) => ({ slot: mine.slot, player: id, place: placeOf(id) })), keepReady: true })}>{done ? t('dr.keepDone') : t('dr.keepConfirm')}</button>
        </div>
      </Panel>
      <Panel title={t('dr.teamsReady')}>
        {d.teams.map((x) => (
          <div key={x.slot} className="row" style={{ padding: '4px 0' }}>
            <DraftCrestImg shape={x.crest} colors={x.colors} short={x.short} size={20} /><span className="grow">{x.name}</span>
            {x.ai ? <span className="tag">AI</span> : x.keepReady ? <span className="tag good">{t('mp.isReady')}</span> : <span className="tag warn">{t('mp.notReadyYet')}</span>}
          </div>
        ))}
        <p className="muted" style={{ fontSize: 12.5 }}>{t('dr.keepAuto')}</p>
      </Panel>
    </div>
  );
}

/** Puljen: filtre og liste (bruges både i lobbyen og under draften) */
function PoolPanel({ pool, byId, taken, mine, picks, sel, onSel, year, title }: {
  pool: Player[]; byId: Record<number, Player>; taken: Set<number>; mine?: DraftTeam; picks: DraftPick[]; sel: number | null; onSel: (id: number) => void; year: number; title: string;
}) {
  const s = session()!;
  const [role, setRole] = useState<Role | ''>('');
  const [q, setQ] = useState('');
  const [fitOnly, setFitOnly] = useState(false);
  const [wishOnly, setWishOnly] = useState(false);
  const list = pool.filter((p) => !taken.has(p.id))
    .filter((p) => !role || canPlayRole(p, role))
    .filter((p) => !q || `${p.first} ${p.last}`.toLowerCase().includes(q.toLowerCase()))
    .filter((p) => !wishOnly || !!mine?.wish.includes(p.id))
    .filter((p) => !fitOnly || !mine || placesFor(mine, picks, p, byId).length > 0)
    .slice(0, 200);
  return (
    <Panel title={title} className="flush">
      <div className="row dr-filters">
        <select value={role} onChange={(e) => setRole(e.target.value as Role | '')}>
          <option value="">{t('tr.anyPos')}</option>
          {ROLES.map((r) => <option key={r} value={r}>{t(`role.${r}`)}</option>)}
        </select>
        <input placeholder={t('dr.search')} value={q} onChange={(e) => setQ(e.target.value)} style={{ flex: 1, minWidth: 120 }} />
        {mine && <label className="row"><input type="checkbox" checked={fitOnly} onChange={(e) => setFitOnly(e.target.checked)} />{t('dr.fitOnly')}</label>}
        {mine && <label className="row"><input type="checkbox" checked={wishOnly} onChange={(e) => setWishOnly(e.target.checked)} />★ {t('dr.wish')}</label>}
      </div>
      <div className="table-wrap" style={{ maxHeight: 560, overflowY: 'auto' }}>
        <table className="grid">
          <thead><tr><th></th><th>{t('col.pos')}</th><th>{t('col.name')}</th><th className="num">{t('col.age')}</th><th>{t('col.nat')}</th><th className="num">{t('dr.rating')}</th></tr></thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className={`clickable ${sel === p.id ? 'me' : ''}`} onClick={() => onSel(p.id)}>
                <td onClick={(e) => { e.stopPropagation(); if (mine) void s.draftTeam({ wish: toggled(mine.wish, p.id) }); }} title={t('dr.wish')} className="dr-star">{mine?.wish.includes(p.id) ? '★' : '☆'}</td>
                <td className="muted">{positionString(p)}</td>
                <td>{p.first} <b>{p.last}</b></td>
                <td className="num">{ageOn(p.dob, `${year}-08-01`)}</td>
                <td className="muted">{gsNation(p.nation)}</td>
                <td className="num"><b>{rating(p)}</b></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

const toggled = (list: number[], id: number) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

/** Spillerkortet: attributter, ønskeliste og (når det er min tur) valg af plads */
function PlayerPanel({ p, mine, onClose, places, onPick, busy }: { p: Player; mine?: DraftTeam; onClose: () => void; places?: number[]; onPick?: (place: number) => void; busy?: boolean }) {
  const s = session()!;
  const [place, setPlace] = useState<number | null>(null);
  useEffect(() => setPlace(null), [p.id]);
  return (
    <Panel title={`${p.first} ${p.last}`} right={<button className="small" onClick={onClose}>×</button>}>
      <div className="muted" style={{ marginBottom: 6 }}>{positionString(p)} · {t('dr.rating')} {rating(p)} · {t(`foot.${p.foot}`)}</div>
      <AttrGrid p={p} />
      <div className="row" style={{ marginTop: 10, flexWrap: 'wrap' }}>
        {mine && <button className="small" onClick={() => s.draftTeam({ wish: toggled(mine.wish, p.id) })}>{mine.wish.includes(p.id) ? t('dr.unwish') : t('dr.addWish')}</button>}
        {onPick && places && (places.length ? (
          <>
            <span className="grow" />
            <select value={place ?? places[0]} onChange={(e) => setPlace(Number(e.target.value))}>
              {places.map((pl) => <option key={pl} value={pl}>{slotLabel(mine!.formation, pl)}</option>)}
            </select>
            <button className="primary" disabled={busy} onClick={() => onPick(place ?? places[0])}>{t('dr.pickBtn')}</button>
          </>
        ) : <div className="insight warn" style={{ flexBasis: '100%' }}>{t('dr.noPlace')}</div>)}
      </div>
      {onPick && places && places.length > 0 && <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>{t('dr.clickPitch')}</div>}
    </Panel>
  );
}

function WishPanel({ mine, taken, byId }: { mine: DraftTeam; taken: Set<number>; byId: Record<number, Player> }) {
  const s = session()!;
  const list = mine.wish.filter((id) => !taken.has(id));
  return (
    <Panel title={t('dr.wishlist', { n: list.length })}>
      {list.length === 0 ? <div className="muted">{t('dr.wishEmpty')}</div> : (
        <ol className="dr-wish">
          {list.map((id, i) => (
            <li key={id}>
              <span className="grow">{pname(byId[id])} <span className="muted">{byId[id] ? `${positionString(byId[id])} · ${rating(byId[id])}` : ''}</span></span>
              <button className="small" disabled={i === 0} onClick={() => { const w = list.slice(); [w[i - 1], w[i]] = [w[i], w[i - 1]]; void s.draftTeam({ wish: w }); }}>↑</button>
              <button className="small" onClick={() => s.draftTeam({ wish: mine.wish.filter((x) => x !== id) })}>×</button>
            </li>
          ))}
        </ol>
      )}
      <div className="muted" style={{ fontSize: 12 }}>{t('dr.wishHint')}</div>
    </Panel>
  );
}

function LiveDraft({ pool, byId, settings, year }: { pool: Player[]; byId: Record<number, Player>; settings: DraftSettings; year: number }) {
  const s = session()!;
  const room = s.room!;
  const d = room.draft!;
  const mine = s.myDraftTeam;
  const [sel, setSel] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const n = d.picks.length;
  const keepers = d.season > 1 ? settings.keepers : 0;
  const total = d.order.length * picksPerTeam(keepers);
  const curSlot = slotForPick(d.order, Math.min(n, total - 1));
  const cur = d.teams.find((x) => x.slot === curSlot)!;
  const myTurn = !!mine && cur?.slot === mine.slot && n < total;
  const reserved = allKeepers(d.teams);
  const taken = new Set([...d.picks.map((p) => p.player), ...reserved]);

  // blink i fanen, når det er min tur
  useEffect(() => {
    if (!myTurn) return;
    const base = document.title;
    let flip = false;
    const h = setInterval(() => { flip = !flip; document.title = flip ? `⏰ ${t('dr.yourTurn')}` : base; }, 900);
    try { navigator.vibrate?.(200); } catch { /* ignorér */ }
    return () => { clearInterval(h); document.title = base; };
  }, [myTurn, n]);

  const suggestion = myTurn && mine ? autoPick(mine, d.picks, pool, reserved) : null;
  const selP = sel ? byId[sel] : null;
  const selPlaces = selP && mine && !taken.has(selP.id) ? placesFor(mine, d.picks, selP, byId) : [];
  const pick = async (player: number, pl: number) => {
    setBusy(true); setErr('');
    try { await s.draftPick(player, pl); setSel(null); } catch (e) { setErr(t(`dr.err.${(e as Error).message}`)); }
    setBusy(false);
  };

  return (
    <>
      <div className={`dr-status ${myTurn ? 'mine' : ''}`}>
        <div className="row" style={{ gap: 10 }}>
          <DraftCrestImg shape={cur.crest} colors={cur.colors} short={cur.short} size={40} />
          <div>
            <div className="muted">{t('dr.pickOf', { n: Math.min(n + 1, total), total, round: Math.floor(Math.min(n, total - 1) / d.order.length) + 1 })}</div>
            <b style={{ fontSize: 18 }}>{myTurn ? t('dr.yourTurn') : t('dr.picking', { club: cur.name })}</b>
            {cur.ai && <span className="tag" style={{ marginLeft: 6 }}>AI</span>}
          </div>
        </div>
        <Countdown until={d.pickStart + PICK_SECONDS * 1000} />
      </div>
      {suggestion && byId[suggestion.player] && (
        <div className="insight good row" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <span>💡 {t('dr.assistantPre')} <a className="link" onClick={() => setSel(suggestion.player)}><b>{`${byId[suggestion.player].first} ${byId[suggestion.player].last}`.trim()}</b></a> <span className="muted">({positionString(byId[suggestion.player])} · {rating(byId[suggestion.player])})</span> {t('dr.assistantTo', { place: slotLabel(mine!.formation, suggestion.place) })}</span>
          <button className="small primary" disabled={busy} onClick={() => pick(suggestion.player, suggestion.place)}>{t('dr.takeSuggestion')}</button>
        </div>
      )}
      {err && <div className="insight bad">{err}</div>}
      <div className="dr-grid">
        <PoolPanel pool={pool} byId={byId} taken={taken} mine={mine} picks={d.picks} sel={sel} onSel={setSel} year={year} title={t('dr.pool', { n: pool.length - taken.size })} />
        <div className="col" style={{ gap: 14 }}>
          {selP && <PlayerPanel p={selP} mine={mine} onClose={() => setSel(null)} places={myTurn ? selPlaces : undefined} onPick={myTurn ? (pl) => pick(selP.id, pl) : undefined} busy={busy} />}
          {mine && (
            <Panel title={`${mine.name} · ${mine.formation}`}>
              <TeamPitch team={mine} picks={d.picks} byId={byId} highlight={myTurn ? selPlaces : []} onPlace={myTurn && selP ? (pl) => pick(selP.id, pl) : undefined} />
            </Panel>
          )}
          {mine && <WishPanel mine={mine} taken={taken} byId={byId} />}
        </div>
      </div>
      <DraftBoard byId={byId} keepers={keepers} />
    </>
  );
}

function DraftBoard({ byId, keepers }: { byId: Record<number, Player>; keepers: number }) {
  const d = session()!.room!.draft!;
  const n = d.picks.length;
  return (
    <Panel title={t('dr.board')} className="flush">
      <div className="table-wrap">
        <table className="grid dr-board">
          <thead><tr><th>#</th>{d.order.map((slot) => { const x = d.teams.find((y) => y.slot === slot)!; return <th key={slot}><span className="row" style={{ gap: 4 }}><DraftCrestImg shape={x.crest} colors={x.colors} short={x.short} size={16} />{x.short}</span></th>; })}</tr></thead>
          <tbody>
            {Array.from({ length: picksPerTeam(keepers) }, (_, r) => (
              <tr key={r}>
                <td className="muted">{r + 1}</td>
                {d.order.map((slot, i) => {
                  const idx = r * d.order.length + (r % 2 === 0 ? i : d.order.length - 1 - i);
                  const pk = d.picks[idx];
                  return <td key={slot} className={idx === n ? 'dr-now' : ''}>{pk ? <span title={slotLabel(d.teams.find((y) => y.slot === slot)!.formation, pk.place)}>{pname(byId[pk.player])}{pk.auto ? <span className="muted"> ·A</span> : ''}</span> : ''}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/** Landekode uden et indlæst spil (puljen har kun nationens indeks) */
let nationNames: string[] = [];
loadWorld().then((w) => { nationNames = w.nations.map((n) => n.code); }).catch(() => {});
const gsNation = (i: number) => nationNames[i] ?? '';

/** Holdet på banen i formationen (som på taktiksiden) + bænken. Pladser spilleren passer til lyser op */
function TeamPitch({ team, picks, byId, highlight = [], onPlace }: { team: DraftTeam; picks: DraftPick[]; byId: Record<number, Player>; highlight?: number[]; onPlace?: (place: number) => void }) {
  const mine = teamPicks(team, picks);
  const at = (place: number) => mine.find((p) => p.place === place);
  const bench = mine.filter((p) => p.place === BENCH_PLACE);
  const slots = formationSlots(team.formation);
  return (
    <div className="dr-pitch-wrap">
      <div className="dr-pitch">
        <div className="dr-pitch-lines" />
        {slots.map((slot, i) => {
          const pk = at(i);
          const p = pk ? byId[pk.player] : undefined;
          const hi = !pk && highlight.includes(i);
          return (
            <div key={i} className={`dr-spot ${p ? 'on' : ''} ${hi ? 'hi' : ''} ${hi && onPlace ? 'clickable' : ''}`}
              style={{ left: `${6 + slot.y * 0.88}%`, top: `${94 - slot.x * 0.88}%` }}
              onClick={() => hi && onPlace?.(i)}>
              <span className="dr-dot" style={p ? { background: team.colors[0], color: team.colors[1], borderColor: team.colors[1] } : undefined}>{p ? rating(p) : slotLabel(team.formation, i)}</span>
              <span className="dr-spot-name">{p ? p.last : ''}</span>
            </div>
          );
        })}
      </div>
      <div className="dr-slot-h">{t('dr.bench')} ({bench.length}/{BENCH})</div>
      <div className="dr-bench">
        {Array.from({ length: BENCH }, (_, i) => {
          const p = bench[i] ? byId[bench[i].player] : undefined;
          const hi = !p && i === bench.length && highlight.includes(BENCH_PLACE);
          return <div key={i} className={`dr-bench-spot ${p ? 'on' : ''} ${hi ? 'hi clickable' : ''}`} onClick={() => hi && onPlace?.(BENCH_PLACE)}>{p ? <><b>{p.last}</b><span className="muted">{positionString(p)} · {rating(p)}</span></> : <span className="muted">{t('dr.sub')}</span>}</div>;
        })}
      </div>
      {!bench.some((p) => byId[p.player] && naturalRole(byId[p.player]) === 'GK') && <div className="muted" style={{ fontSize: 12 }}>{t('dr.needGK')}</div>}
    </div>
  );
}

function AttrGrid({ p }: { p: Player }) {
  const groups = naturalRole(p) === 'GK' ? (['goalkeeping', 'mental', 'physical'] as const) : (['technical', 'mental', 'physical'] as const);
  return (
    <div className="dr-attrs">
      {groups.map((gname) => (
        <div key={gname}>
          <div className="dr-attr-h">{t(`group.${gname}`)}</div>
          {GROUPS[gname].map((k) => {
            const v = Math.round(p.attrs[ATTRS.indexOf(k)]);
            return <div key={k} className="dr-attr"><span>{t(`attr.${k}`)}</span><b className={v >= 16 ? 'good' : v <= 8 ? 'bad' : ''}>{v}</b></div>;
          })}
        </div>
      ))}
    </div>
  );
}

// ---------- i spillet: ligaen, historik og skadeserstatning ----------

export function DraftLeagueScreen() {
  const g = gs();
  const d = g.draft;
  const [repl, setRepl] = useState<Record<number, number>>({});
  if (!d) return null;
  const lg = g.comps.DL;
  const rows = lg ? leagueRows(lg) : [];
  const injured = squad(g.userClub).filter((p) => (p.injury?.days ?? 0) >= REPLACE_DAYS);
  const allTime = Object.values(d.allTime).sort((a, b) => b.titles - a.titles || b.pts - a.pts);
  const po = g.comps.DLPO;
  return (
    <div>
      <Head title={`${t('dr.title')} · ${t('dr.seasonN', { n: d.season })}`} />
      <div className="cols">
        <Panel title={t('dr.table')} className="flush">
          <table className="grid">
            <thead><tr><th>#</th><th>{t('col.club')}</th><th className="num">{t('tbl.p')}</th><th className="num">{t('tbl.w')}</th><th className="num">{t('tbl.d')}</th><th className="num">{t('tbl.l')}</th><th className="num">{t('tbl.gd')}</th><th className="num">{t('tbl.pts')}</th></tr></thead>
            <tbody>
              {rows.map((r, i) => {
                const c = g.clubs[r.club];
                return (
                  <tr key={r.club} className={r.club === g.userClub ? 'me' : ''}>
                    <td>{i + 1}</td>
                    <td><span className="row" style={{ gap: 6 }}>{c && <DraftCrestImg shape={c.crest ?? 0} colors={c.colors} short={c.short} size={18} />}{c?.name}</span></td>
                    <td className="num">{r.p}</td><td className="num">{r.w}</td><td className="num">{r.d}</td><td className="num">{r.l}</td><td className="num">{r.gf - r.ga}</td><td className="num"><b>{r.pts}</b></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>
        <div className="col" style={{ gap: 14 }}>
          <Panel title={t('dr.format')}>
            <div className="kv">
              <span>{t('dr.rounds')}</span><span>{t('dr.roundsN', { n: d.settings.rounds })}</span>
              <span>{t('dr.playoff')}</span><span>{t(`dr.po.${d.settings.playoff}`)}</span>
              <span>{t('dr.keepers')}</span><span>{d.settings.keepers || t('dr.keepersNone')}</span>
              <span>{t('dr.injuries')}</span><span>{d.settings.injuries ? t('dr.injuriesShort') : t('dr.injuriesOff')}</span>
            </div>
            {po && (
              <div style={{ marginTop: 10 }}>
                <b>{t('dr.playoffTitle')}</b>
                {po.ties.map((tie) => <div key={tie.id} className="row" style={{ gap: 6 }}><span className="tag">{tie.stage}</span>{g.clubs[tie.a]?.name} – {g.clubs[tie.b]?.name}{tie.winner ? <b>→ {g.clubs[tie.winner]?.short}</b> : null}</div>)}
              </div>
            )}
          </Panel>
          <Panel title={t('dr.injuryTitle')}>
            {injured.length === 0 ? <div className="muted">{t('dr.injuryNone', { n: REPLACE_DAYS })}</div> : injured.map((p) => {
              const opts = replacementsFor(p).slice(0, 12);
              return (
                <div key={p.id} className="row" style={{ flexWrap: 'wrap', padding: '4px 0' }}>
                  <span className="grow">{p.first} {p.last} <span className="bad">({p.injury!.days} {t('common.days')})</span></span>
                  <select value={repl[p.id] ?? ''} onChange={(e) => setRepl({ ...repl, [p.id]: Number(e.target.value) })}>
                    <option value="">{t('dr.pickReplacement')}</option>
                    {opts.map((x) => <option key={x.id} value={x.id}>{x.first} {x.last} · {positionString(x)} · {rating(x)}</option>)}
                  </select>
                  <button className="small primary" disabled={!repl[p.id]} onClick={async () => { if (await askConfirm(t('dr.replaceConfirm', { out: p.last, inn: g.players[repl[p.id]]?.last ?? '' }))) act({ t: 'draftReplace', out: p.id, inn: repl[p.id] }); }}>{t('dr.replace')}</button>
                </div>
              );
            })}
            <p className="muted" style={{ fontSize: 12.5, marginBottom: 0 }}>{t('dr.injuryHint', { n: REPLACE_DAYS })}</p>
          </Panel>
        </div>
      </div>
      <div className="cols">
        <Panel title={t('dr.history')} className="flush">
          {d.history.length === 0 ? <div className="muted" style={{ padding: 12 }}>{t('dr.historyEmpty')}</div> : (
            <table className="grid">
              <thead><tr><th>{t('dr.season')}</th><th>{t('dr.champion')}</th><th>{t('dr.playoffWinner')}</th><th>{t('dr.topScorer')}</th></tr></thead>
              <tbody>
                {d.history.slice().reverse().map((h) => (
                  <tr key={h.season}>
                    <td>{h.season}</td><td><b>🏆 {g.clubs[h.champion]?.name ?? '?'}</b></td>
                    <td>{h.playoffWinner ? g.clubs[h.playoffWinner]?.name : '–'}</td>
                    <td>{h.topScorer ? `${h.topScorer.name} (${h.topScorer.goals})` : '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
        <Panel title={t('dr.allTime')} className="flush">
          {allTime.length === 0 ? <div className="muted" style={{ padding: 12 }}>{t('dr.historyEmpty')}</div> : (
            <table className="grid">
              <thead><tr><th>{t('col.club')}</th><th className="num">🏆</th><th className="num">{t('tbl.p')}</th><th className="num">{t('tbl.w')}</th><th className="num">{t('tbl.gd')}</th><th className="num">{t('tbl.pts')}</th></tr></thead>
              <tbody>
                {allTime.map((a) => (
                  <tr key={a.club} className={a.club === g.userClub ? 'me' : ''}>
                    <td>{g.clubs[a.club]?.name ?? '?'}</td><td className="num">{a.titles}</td><td className="num">{a.p}</td><td className="num">{a.w}</td><td className="num">{a.gf - a.ga}</td><td className="num"><b>{a.pts}</b></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      </div>
      <p className="muted" style={{ fontSize: 12.5 }}>{t('dr.seasonEndHint', { date: dateFmt(Object.values(g.fixtures).reduce((m, f) => (f.date > m ? f.date : m), g.date)) })}</p>
    </div>
  );
}
