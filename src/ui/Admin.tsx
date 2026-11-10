// Admin interface (developer only): ?admin=1. Requires the ADMIN_TOKEN set on the server, kept in this browser.
// English on purpose. Tabs: overview, new careers, applications ("join the project"), managers, rankings, multiplayer rooms,
// community moderation, mail and errors. Data comes from api/admin.ts and api/community.ts.
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { SgStatus, Suggestion } from '../online/community';
import { Panel } from './components';
import { openPreview } from '../game/save';
import { getTheme, setTheme } from './theme';

const KEY = 'cm0102.admin';
const STATUSES: SgStatus[] = ['new', 'considering', 'planned', 'progress', 'released', 'rejected'];
const APP_STATUSES = ['new', 'contacted', 'accepted', 'rejected'] as const;
const token = () => localStorage.getItem(KEY) ?? '';

async function adminGet<T>(q: string): Promise<T | null> {
  try { const r = await fetch(`/api/admin?${q}`, { headers: { 'x-admin-token': token() } }); return r.ok ? await r.json() : null; } catch { return null; }
}
async function adminPost(op: string, data: Record<string, unknown>): Promise<{ ok?: boolean; error?: unknown }> {
  try {
    const r = await fetch('/api/admin', { method: 'POST', headers: { 'content-type': 'application/json', 'x-admin-token': token() }, body: JSON.stringify({ op, ...data }) });
    return r.ok ? r.json() : { error: (await r.json().catch(() => ({}))).error ?? r.status };
  } catch (e) { return { error: String(e) }; }
}
async function hubGet<T>(q: string): Promise<T | null> {
  try { const r = await fetch(`/api/hub?${q}`, { headers: { 'x-admin-token': token() } }); return r.ok ? await r.json() : null; } catch { return null; }
}
async function hubPost(op: string, data: Record<string, unknown>): Promise<{ ok?: boolean; error?: unknown }> {
  try {
    const r = await fetch('/api/hub', { method: 'POST', headers: { 'content-type': 'application/json', 'x-admin-token': token() }, body: JSON.stringify({ op, ...data }) });
    return r.ok ? r.json() : { error: (await r.json().catch(() => ({}))).error ?? r.status };
  } catch (e) { return { error: String(e) }; }
}
async function communityCall(op: string, data: Record<string, unknown>) {
  const r = await fetch('/api/community', { method: 'POST', headers: { 'content-type': 'application/json', 'x-admin-token': token() }, body: JSON.stringify({ op: `admin:${op}`, admin: token(), ...data }) });
  return r.ok ? r.json() : { error: (await r.json()).error ?? r.status };
}
async function communityGet<T>(q: string): Promise<T | null> {
  const r = await fetch(`/api/community?${q}`, { headers: { 'x-admin-token': token() } });
  return r.ok ? r.json() : null;
}

const when = (iso?: string) => (iso ? new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '–');
const ago = (iso?: string) => {
  if (!iso) return '–';
  const m = Math.round((Date.now() - Date.parse(iso)) / 60_000);
  return m < 60 ? `${m} min ago` : m < 60 * 48 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} days ago`;
};

interface Overview {
  accounts?: number; online?: number; newCareers?: { total: number; today: number; yesterday: number }; managers: number; careers: number; seasons: number; seasonsThisMonth: number; rooms: number; activeRooms: number;
  ai: { today: number; yesterday: number; cap: number }; suggestions: number;
  applications: { total: number; new: number }; top: { career: string; points: number; name: string; club: string; league: string }[];
  config: { email: boolean };
}
interface Application { id: number; name: string; email: string; role: string; message: string; lang: string; created: string; status: string; note?: string }
interface ManagerRow { pid: string; name: string; created: string; updated: string; careers: number; best: number; seasons: number }
interface NewCareer { save?: SaveRow; at: string; manager: string; club: string; league: string; nation: string; challenge: string; mode?: string; bots: number; db: string; lang: string; theme?: string; vid?: string; seen?: number; country?: string; start?: string; prog?: { date: string; club: string; pos: number; at: number } }
interface SaveRow { source: 'account' | 'support'; id: string; manager: string; club: string; date: string; saved: string; url: string; size: number; device?: string; email?: string; note?: string; vid?: string; lang?: string; theme?: string; mode?: string; ver?: string }
/** Åbn en spillers gemte spil i preview (intet gemmes eller sendes – se previewInfo i game/state.ts) */
type OpenSave = (s: SaveRow, theme?: string) => Promise<void>;
interface RoomRow { code: string; status: string; created: string; lastTurn: string; date: string; version: number; mode: string; players: string[] }
interface RankRow { member: string; points: number; name: string; club: string; league: string; season: string; pid: string }

type Tab = 'overview' | 'starts' | 'saves' | 'applications' | 'managers' | 'rankings' | 'rooms' | 'community' | 'hall' | 'edits' | 'skins' | 'credits' | 'mail' | 'errors';
const TABS: [Tab, string][] = [['overview', 'Overview'], ['starts', 'New careers'], ['saves', 'Saves'], ['applications', 'Applications'], ['managers', 'Managers'], ['rankings', 'Rankings'], ['rooms', 'Multiplayer'], ['community', 'Suggestions'], ['hall', 'Hall of Fame'], ['edits', 'Database edits'], ['skins', 'Skins'], ['credits', 'Credits'], ['mail', 'E-mail'], ['errors', 'Errors']];

export function AdminPage({ onClose }: { onClose: () => void }) {
  const [tok, setTok] = useState(token);
  const [authed, setAuthed] = useState<boolean | null>(token() ? null : false);
  const [tab, setTab] = useState<Tab>('overview');
  const [overview, setOverview] = useState<Overview | null>(null);
  const [msg, setMsg] = useState('');
  const openSave: OpenSave = async (s, theme) => {
    setMsg(`Opening ${s.manager} (${s.club}) …`);
    try {
      const r = await fetch(s.url, { cache: 'no-store' });
      if (!r.ok) throw new Error(`download ${r.status}`);
      // spillerens udseende, hvis vi kender det (så man ser det samme som spilleren)
      const th = theme ?? s.theme;
      if (th === 'classic') setTheme('retro');
      else if (th === 'modern' && getTheme() === 'retro') setTheme('club');
      await openPreview(await r.blob(), `${s.manager} · ${s.club} · ${s.date}`, th);
      try { sessionStorage.setItem('cm0102.play', '1'); } catch { /* ignorer */ }
      onClose();
    } catch (e) { setMsg(`Could not open the save: ${String((e as Error).message)}`); }
  };
  const refresh = async () => {
    const o = await adminGet<Overview>('op=overview');
    setAuthed(!!o);
    setOverview(o);
  };
  useEffect(() => { if (token()) void refresh(); }, []);

  if (!authed) {
    return (
      <div className="pub"><div className="pub-box adm-login">
        <h1>CM Reborn admin</h1>
        <p className="muted">Sign in with the ADMIN_TOKEN configured on the server.</p>
        {authed === null ? <div className="muted">Checking…</div> : (
          <form className="row" onSubmit={(e) => { e.preventDefault(); localStorage.setItem(KEY, tok); setAuthed(null); void refresh(); }}>
            <input type="password" placeholder="ADMIN_TOKEN" value={tok} onChange={(e) => setTok(e.target.value)} autoFocus />
            <button className="primary" type="submit">Sign in</button>
          </form>
        )}
        {authed === false && token() && <div className="bad" style={{ marginTop: 8 }}>The token was not accepted.</div>}
        <button className="small" style={{ marginTop: 12 }} onClick={onClose}>← Back to the game</button>
      </div></div>
    );
  }
  const badge = (t: Tab) => (t === 'applications' && overview?.applications.new ? <span className="badge">{overview.applications.new}</span> : null);
  return (
    <div className="pub adm"><div className="pub-box" style={{ width: 'min(1280px, 100%)' }}>
      <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0 }}>CM Reborn admin</h1>
        <div className="row">
          <button className="small" onClick={() => void refresh()}>↻ Refresh</button>
          <button className="small" onClick={() => { localStorage.removeItem(KEY); setTok(''); setAuthed(false); }}>Sign out</button>
          <button className="small" onClick={onClose}>← Game</button>
        </div>
      </div>
      <div className="tabs adm-tabs">
        {TABS.map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => { setTab(k); setMsg(''); }}>{l}{badge(k)}</button>)}
      </div>
      {msg && <div className="insight">{msg}</div>}
      {tab === 'overview' && <OverviewTab o={overview} go={setTab} onChange={() => void refresh()} setMsg={setMsg} />}
      {tab === 'starts' && <NewCareersTab open={openSave} />}
      {tab === 'saves' && <SavesTab open={openSave} setMsg={setMsg} />}
      {tab === 'applications' && <ApplicationsTab onChange={refresh} setMsg={setMsg} />}
      {tab === 'managers' && <ManagersTab />}
      {tab === 'rankings' && <RankingsTab setMsg={setMsg} />}
      {tab === 'rooms' && <RoomsTab />}
      {tab === 'community' && <CommunityTab setMsg={setMsg} />}
      {tab === 'hall' && <HallAdmin setMsg={setMsg} />}
      {tab === 'edits' && <EditsAdmin setMsg={setMsg} />}
      {tab === 'skins' && <SkinsAdmin setMsg={setMsg} />}
      {tab === 'credits' && <CreditsAdmin setMsg={setMsg} />}
      {tab === 'mail' && <MailTab setMsg={setMsg} />}
      {tab === 'errors' && <ErrorsTab setMsg={setMsg} />}
    </div></div>
  );
}

function Stat({ label, value, sub, onClick }: { label: string; value: ReactNode; sub?: ReactNode; onClick?: () => void }) {
  return <div className={`adm-stat ${onClick ? 'clickable' : ''}`} onClick={onClick}><span>{label}</span><b>{value}</b>{sub && <small>{sub}</small>}</div>;
}

function OverviewTab({ o, go, onChange, setMsg }: { o: Overview | null; go: (t: Tab) => void; onChange?: () => void; setMsg?: (s: string) => void }) {
  if (!o) return <div className="muted">Loading…</div>;
  const pct = o.ai.cap ? Math.round((o.ai.today / o.ai.cap) * 100) : 0;
  return (
    <>
      <div className="adm-stats">
        <Stat label="Online now" value={o.online ?? 0} sub="browsers with the game open (last 5 min)" onClick={() => go('starts')} />
        <Stat label="New careers today" value={o.newCareers?.today ?? 0} sub={`yesterday ${o.newCareers?.yesterday ?? 0} · ${o.newCareers?.total ?? 0} in total`} onClick={() => go('starts')} />
        <Stat label="Applications" value={o.applications.total} sub={o.applications.new ? `${o.applications.new} new` : 'none new'} onClick={() => go('applications')} />
        <Stat label="Accounts (cloud saves)" value={o.accounts ?? 0} sub="signed in with email" />
        <Stat label="Manager profiles" value={o.managers} sub={`${o.careers} careers on the board`} onClick={() => go('managers')} />
        <Stat label="Seasons submitted" value={o.seasons} sub={`${o.seasonsThisMonth} this month`} onClick={() => go('rankings')} />
        <Stat label="Multiplayer rooms" value={o.rooms} sub={`${o.activeRooms} active in the last 7 days`} onClick={() => go('rooms')} />
        <Stat label="AI calls today" value={o.ai.today} sub={`${pct}% of the daily cap (${o.ai.cap}) · yesterday ${o.ai.yesterday}`} />
        <Stat label="Community suggestions" value={o.suggestions} onClick={() => go('community')} />
        <Stat label="E-mail notifications" value={o.config.email ? 'On' : 'Off'} sub={o.config.email ? 'New applications are e-mailed' : 'Set RESEND_API_KEY + NOTIFY_EMAIL'} />
      </div>
      <Panel title="Top careers">
        {o.top.length === 0 ? <div className="muted">No careers yet.</div> : (
          <table className="grid"><thead><tr><th>#</th><th>Manager</th><th>Club</th><th>League</th><th className="num">Points</th><th /></tr></thead>
            <tbody>{o.top.map((r, i) => <tr key={r.career}><td>{i + 1}</td><td>{r.name}</td><td>{r.club}</td><td className="muted">{r.league}</td><td className="num">{r.points}</td>
              <td><button className="small danger" title="Remove from all rankings (career, season, month, league) – later seasons won't count" onClick={async () => {
                if (!confirm(`Remove ${r.name}'s career (${r.club}, ${r.points} points) from all rankings?`)) return;
                const res = await adminPost('unrank', { career: r.career }); setMsg?.(res.error ? `Error: ${String(res.error)}` : 'Removed from the rankings ✓'); onChange?.();
              }}>✕</button></td></tr>)}</tbody></table>
        )}
      </Panel>
    </>
  );
}

function ApplicationsTab({ onChange, setMsg }: { onChange: () => void; setMsg: (s: string) => void }) {
  const [rows, setRows] = useState<Application[] | null>(null);
  const [sel, setSel] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [note, setNote] = useState('');
  const load = async () => setRows((await adminGet<{ rows: Application[] }>('op=applications'))?.rows ?? []);
  useEffect(() => { void load(); }, []);
  const cur = rows?.find((r) => r.id === sel) ?? null;
  useEffect(() => setNote(cur?.note ?? ''), [cur?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const shown = (rows ?? []).filter((r) => filter === 'all' || r.status === filter);
  const act = async (op: string, data: Record<string, unknown>, ok: string) => {
    const r = await adminPost(op, data);
    setMsg(r.error ? `Error: ${String(r.error)}` : ok);
    await load(); onChange();
  };
  if (!rows) return <div className="muted">Loading…</div>;
  return (
    <div className="cols">
      <Panel title={`Applications (${rows.length})`} right={
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>{APP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>} className="flush">
        {shown.length === 0 ? <div className="muted" style={{ padding: 12 }}>No applications{filter !== 'all' ? ` with status "${filter}"` : ''} yet.</div> : (
          <div className="table-wrap" style={{ maxHeight: 560, overflowY: 'auto' }}>
            <table className="grid"><thead><tr><th>Received</th><th>Name</th><th>Role</th><th>Status</th></tr></thead>
              <tbody>{shown.map((r) => (
                <tr key={r.id} className={`clickable ${sel === r.id ? 'me' : ''}`} onClick={() => setSel(r.id)}>
                  <td className="muted nowrap">{when(r.created)}</td><td>{r.status === 'new' ? <b>{r.name}</b> : r.name}</td><td>{r.role}</td>
                  <td><span className={`tag ${r.status === 'new' ? 'warn' : r.status === 'accepted' ? 'good' : r.status === 'rejected' ? 'bad' : ''}`}>{r.status}</span></td>
                </tr>
              ))}</tbody></table>
          </div>
        )}
      </Panel>
      <Panel title={cur ? `${cur.name} – ${cur.role}` : 'Select an application'}>
        {cur && (
          <div className="col">
            <div className="kv">
              <span>E-mail</span><span><a href={`mailto:${cur.email}?subject=${encodeURIComponent('CM Reborn – your application')}`}>{cur.email}</a></span>
              <span>Received</span><span>{when(cur.created)}</span>
              <span>Language</span><span>{cur.lang || '–'}</span>
            </div>
            <p style={{ whiteSpace: 'pre-line', margin: 0 }}>{cur.message}</p>
            <div className="row" style={{ flexWrap: 'wrap' }}>
              {APP_STATUSES.map((s) => <button key={s} className={`small ${cur.status === s ? 'primary' : ''}`} onClick={() => act('app-status', { id: cur.id, status: s }, `Marked as ${s} ✓`)}>{s}</button>)}
            </div>
            <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Private note (only visible here)" />
            <div className="row">
              <button className="small primary" onClick={() => act('app-status', { id: cur.id, note }, 'Note saved ✓')}>Save note</button>
              <a className="button small" href={`mailto:${cur.email}?subject=${encodeURIComponent('CM Reborn – your application')}`}>Reply by e-mail</a>
              <button className="small" onClick={async () => { const r = await hubPost('admin:credit', { key: `app${cur.id}`, name: cur.name, role: cur.role }); setMsg(r.error ? `Error: ${String(r.error)}` : `${cur.name} added to the credits ✓`); }}>Add to credits</button>
              <span className="grow" />
              <button className="small danger" onClick={() => { if (confirm(`Delete the application from ${cur.name}?`)) { setSel(null); void act('app-delete', { id: cur.id }, 'Deleted ✓'); } }}>Delete</button>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}

function ManagersTab() {
  const [rows, setRows] = useState<ManagerRow[] | null>(null);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<keyof ManagerRow>('created');
  const [sel, setSel] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ profile: Record<string, unknown>; careers: { career: string; name?: string; club?: string; league?: string; seasons?: string; points: number; updated?: string }[] } | null>(null);
  useEffect(() => { void adminGet<{ rows: ManagerRow[] }>('op=managers').then((r) => setRows(r?.rows ?? [])); }, []);
  useEffect(() => { setDetail(null); if (sel) void adminGet<typeof detail>(`op=manager&pid=${sel}`).then(setDetail); }, [sel]);
  const shown = useMemo(() => (rows ?? []).filter((r) => !q || r.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => { const x = a[sort], y = b[sort]; return typeof x === 'number' && typeof y === 'number' ? y - x : String(y ?? '').localeCompare(String(x ?? '')); }), [rows, q, sort]);
  if (!rows) return <div className="muted">Loading managers…</div>;
  const th = (k: keyof ManagerRow, l: string, num = false) => <th className={`clickable ${num ? 'num' : ''}`} onClick={() => setSort(k)}>{l}{sort === k ? ' ▾' : ''}</th>;
  const summary = detail?.profile.summary as Record<string, unknown> | null | undefined;
  return (
    <div className="cols">
      <Panel title={`Managers (${rows.length})`} right={<input placeholder="Search name…" value={q} onChange={(e) => setQ(e.target.value)} />} className="flush">
        <div className="table-wrap" style={{ maxHeight: 600, overflowY: 'auto' }}>
          <table className="grid"><thead><tr>{th('name', 'Name')}{th('created', 'Joined')}{th('careers', 'Careers', true)}{th('seasons', 'Seasons', true)}{th('best', 'Best', true)}</tr></thead>
            <tbody>{shown.map((r) => (
              <tr key={r.pid} className={`clickable ${sel === r.pid ? 'me' : ''}`} onClick={() => setSel(r.pid)}>
                <td>{r.name}</td><td className="muted nowrap">{r.created ? ago(r.created) : '–'}</td><td className="num">{r.careers}</td><td className="num">{r.seasons}</td><td className="num">{r.best}</td>
              </tr>
            ))}</tbody></table>
        </div>
      </Panel>
      <Panel title={detail ? String(detail.profile.name) : 'Select a manager'}>
        {sel && !detail && <div className="muted">Loading…</div>}
        {detail && (
          <div className="col">
            <div className="kv">
              <span>Profile id</span><span className="muted">{String(detail.profile.pid)}</span>
              <span>Joined</span><span>{when(detail.profile.created as string)}</span>
              <span>Last sync</span><span>{when(detail.profile.updated as string)}</span>
              {detail.profile.motto ? <><span>Motto</span><span>{String(detail.profile.motto)}</span></> : null}
              {summary?.club ? <><span>Current club</span><span>{String(summary.club)}</span></> : null}
              {Array.isArray(detail.profile.ach) ? <><span>Achievements</span><span>{(detail.profile.ach as unknown[]).length}</span></> : null}
            </div>
            <table className="grid"><thead><tr><th>Career</th><th>Club</th><th>League</th><th className="num">Seasons</th><th className="num">Points</th></tr></thead>
              <tbody>{detail.careers.map((c) => <tr key={c.career}><td className="muted">{c.career.slice(0, 14)}</td><td>{c.club}</td><td className="muted">{c.league}</td><td className="num">{c.seasons ?? 0}</td><td className="num">{c.points}</td></tr>)}</tbody></table>
          </div>
        )}
      </Panel>
    </div>
  );
}

function RankingsTab({ setMsg }: { setMsg: (s: string) => void }) {
  const [board, setBoard] = useState<'career' | 'season'>('career');
  const [rows, setRows] = useState<RankRow[] | null>(null);
  const load = async () => { setRows(null); setRows((await adminGet<{ rows: RankRow[] }>(`op=rankings&board=${board}`))?.rows ?? []); };
  useEffect(() => { void load(); }, [board]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Panel title="Global rankings (top 100)" right={
      <div className="tabs">{(['career', 'season'] as const).map((b) => <button key={b} className={board === b ? 'on' : ''} onClick={() => setBoard(b)}>{b === 'career' ? 'Career total' : 'Best season'}</button>)}</div>} className="flush">
      {!rows ? <div className="muted" style={{ padding: 12 }}>Loading…</div> : rows.length === 0 ? <div className="muted" style={{ padding: 12 }}>The board is empty.</div> : (
        <div className="table-wrap" style={{ maxHeight: 640, overflowY: 'auto' }}>
          <table className="grid"><thead><tr><th>#</th><th>Manager</th><th>Club</th><th>League</th>{board === 'season' && <th>Season</th>}<th className="num">Points</th>{board === 'career' && <th />}</tr></thead>
            <tbody>{rows.map((r, i) => (
              <tr key={r.member}><td>{i + 1}</td><td>{r.name}</td><td>{r.club}</td><td className="muted">{r.league}</td>{board === 'season' && <td>{r.season}</td>}<td className="num">{r.points}</td>
                {board === 'career' && <td><button className="small danger" title="Remove from the career board (e.g. a manipulated score)" onClick={async () => {
                  if (!confirm(`Remove ${r.name}'s career (${r.points} points) from all rankings?`)) return;
                  const res = await adminPost('unrank', { career: r.member }); setMsg(res.error ? `Error: ${String(res.error)}` : 'Removed from the board ✓'); void load();
                }}>Remove</button></td>}
              </tr>
            ))}</tbody></table>
        </div>
      )}
    </Panel>
  );
}

/** Flag-emoji ud fra landekoden (regional indicator symbols) og landets navn */
const flag = (cc: string) => cc.length === 2 ? String.fromCodePoint(...[...cc].map((c) => 0x1f1a5 + c.charCodeAt(0))) : '';
const countryName = (cc?: string) => { try { return cc ? new Intl.DisplayNames(['en'], { type: 'region' }).of(cc) ?? cc : ''; } catch { return cc ?? ''; } };

/** Hvor langt karrieren er nået: sæson nr., spildato, klub (hvis skiftet) og placering */
function progress(r: NewCareer) {
  const p = r.prog;
  if (!p) return <span className="muted">–</span>;
  // sæsonerne starter 1. juli
  const seasonOf = (d: string) => Number(d.slice(0, 4)) - (Number(d.slice(5, 7)) < 7 ? 1 : 0);
  const n = r.start ? seasonOf(p.date) - seasonOf(r.start) + 1 : 0;
  const d = new Date(`${p.date}T12:00:00Z`).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  return <>{n > 0 && <b>Season {n}</b>} <span className="muted">{d}{p.club && p.club !== r.club ? ` · ${p.club}` : ''}{p.pos ? ` · ${p.pos}.` : ''}</span></>;
}

/** Denne browsers anonyme besøgs-id (samme som spillet sender med en ny karriere, online/notify.ts) */
const myVid = () => { try { return localStorage.getItem('cm0102.visitor') ?? ''; } catch { return ''; } };

function NewCareersTab({ open }: { open: OpenSave }) {
  type Data = { rows: NewCareer[]; days: Record<string, number>; online?: number; now?: number };
  const [data, setData] = useState<Data | null>(null);
  useEffect(() => {
    const load = () => void adminGet<Data>('op=new-careers').then((r) => setData(r ?? { rows: [], days: {} }));
    load();
    // online-status opdateres løbende
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);
  const removeCareers = async (what: { vids?: string[]; at?: string; manager?: string }, label: string) => {
    if (!window.confirm(`Remove ${label} from New careers?`)) return;
    const r = await adminPost('nc-delete', what);
    if (r.error) window.alert(`Error: ${String(r.error)}`);
    else void adminGet<Data>('op=new-careers').then((x) => setData(x ?? { rows: [], days: {} }));
  };
  if (!data) return <div className="muted">Loading new careers…</div>;
  const days = Object.entries(data.days).reverse();
  const max = Math.max(1, ...days.map(([, n]) => n));
  return (
    <>
      <Panel title="New careers per day (last 14 days)">
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 90 }}>
          {days.map(([d, n]) => (
            <div key={d} title={`${d}: ${n}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <small className="muted">{n}</small>
              <div style={{ width: '100%', height: Math.round((n / max) * 60), minHeight: 2, background: 'var(--accent, #3b82f6)', borderRadius: 2 }} />
              <small className="muted">{d.slice(8)}</small>
            </div>
          ))}
        </div>
      </Panel>
      {(() => {
        // hvor kommer spillerne fra (landet ved spilstart, de seneste karrierer)
        const by = new Map<string, number>();
        for (const r of data.rows) if (r.country) by.set(r.country, (by.get(r.country) ?? 0) + 1);
        const top = [...by.entries()].sort((a, b) => b[1] - a[1]);
        return top.length ? (
          <Panel title={`Countries (${top.length})`}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {top.map(([cc, n]) => <span key={cc} className="tag" title={countryName(cc)}>{flag(cc)} {cc} <b>{n}</b></span>)}
            </div>
          </Panel>
        ) : null;
      })()}
      <Panel title={`Latest new careers (${data.rows.length})`} right={<span className="muted">● {data.online ?? 0} online now{' '}
        <button className="small" title="Removes every career started in this browser (same visitor id)" onClick={() => void removeCareers({ vids: [myVid()] }, 'all careers started in this browser')}>Remove my careers</button></span>} className="flush">
        {data.rows.length === 0 ? <div className="muted" style={{ padding: 12 }}>No careers started yet.</div> : (
          <div className="table-wrap" style={{ maxHeight: 640, overflowY: 'auto' }}>
            <table className="grid"><thead><tr><th>Started</th><th>Manager</th><th>Club</th><th>League</th><th>Mode</th><th className="num">AI</th><th>DB</th><th>Theme</th><th>Lang</th><th>Country</th><th>Progress</th><th>Status</th><th>Save</th><th /></tr></thead>
              <tbody>{data.rows.map((r, i) => (
                <tr key={i}><td className="muted nowrap" title={when(r.at)}>{ago(r.at)}</td><td>{r.manager}</td><td>{r.club}</td>
                  <td className="muted">{r.league}{r.nation ? ` (${r.nation})` : ''}</td><td className="muted">{r.mode === 'authentic' ? 'Original' : r.mode === 'extended' ? 'Extended' : ''}</td>
                  <td className="num">{r.bots || ''}</td><td className="muted">{r.db}</td>
                  <td className="muted">{r.theme === 'classic' ? 'Classic' : r.theme === 'modern' ? 'Modern' : '–'}</td><td className="muted">{r.lang}</td>
                  <td className="nowrap" title={countryName(r.country)}>{r.country ? <>{flag(r.country)} {r.country}</> : <span className="muted">–</span>}</td>
                  <td className="nowrap" title={r.prog ? `Game date ${r.prog.date} · updated ${ago(new Date(r.prog.at).toISOString())}` : ''}>{progress(r)}</td>
                  <td className="nowrap">{!r.vid ? <span className="muted">–</span> : r.seen && (data.now ?? Date.now()) - r.seen < 5 * 60_000
                    ? <span style={{ color: '#16a34a', fontWeight: 600 }}>● Online</span>
                    : <span className="muted" title={r.seen ? when(new Date(r.seen).toISOString()) : ''}>{r.seen ? `seen ${ago(new Date(r.seen).toISOString())}` : 'not seen'}</span>}</td>
                  <td className="nowrap">{r.save ? <button className="small" title={`${r.save.source === 'account' ? 'Cloud save' : 'Sent by the player'} · saved ${when(r.save.saved)}`} onClick={() => void open(r.save!, r.theme)}>👁 Open</button> : <span className="muted" title="Only careers with an account (cloud save) or sent with “Send my game to the developer” can be opened">–</span>}</td>
                  <td>{/* fjern: alle karrierer fra samme besøgende (eller kun rækken uden besøgs-id) */}
                    <button className="small" title={r.vid ? 'Remove every career from this visitor' : 'Remove this career'} onClick={() => void removeCareers(r.vid ? { vids: [r.vid] } : { at: r.at, manager: r.manager }, r.vid ? `all ${data.rows.filter((x) => x.vid === r.vid).length} career(s) from this visitor${r.vid === myVid() ? ' (this browser)' : ''}` : `${r.manager}'s career`)}>✕</button></td></tr>
              ))}</tbody></table>
          </div>
        )}
      </Panel>
    </>
  );
}

/** Spillernes gemte spil: skygemte (konti) og dem, der er sendt med "Send mit spil til udvikleren" – åbnes i preview */
function SavesTab({ open, setMsg }: { open: OpenSave; setMsg: (s: string) => void }) {
  const [rows, setRows] = useState<SaveRow[] | null>(null);
  const [src, setSrc] = useState<'all' | 'support' | 'account'>('all');
  const [q, setQ] = useState('');
  const load = () => void adminGet<{ saves: SaveRow[] }>('op=saves').then((r) => setRows(r?.saves ?? []));
  useEffect(load, []);
  if (!rows) return <div className="muted">Loading saves…</div>;
  const needle = q.trim().toLowerCase();
  const shown = rows.filter((r) => (src === 'all' || r.source === src) && (!needle || `${r.manager} ${r.club} ${r.email ?? ''} ${r.note ?? ''}`.toLowerCase().includes(needle)));
  const remove = async (r: SaveRow) => {
    if (!window.confirm(`Delete the game ${r.manager} sent?`)) return;
    const res = await adminPost('support-delete', { url: r.url });
    if (res.error) setMsg(`Error: ${String(res.error)}`); else load();
  };
  return (
    <Panel title={`Saves (${shown.length})`} className="flush" right={<span className="row">
      {(['all', 'support', 'account'] as const).map((k) => <button key={k} className={`small ${src === k ? 'primary' : ''}`} onClick={() => setSrc(k)}>{k === 'all' ? 'All' : k === 'support' ? 'Sent to you' : 'Cloud saves'}</button>)}
      <input placeholder="Search manager, club, e-mail, note" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 220 }} /></span>}>
      <p className="muted" style={{ padding: '0 12px' }}>Opens the player's game in preview: you can click around and even play on, but nothing is saved, and no rankings, progress or errors are sent.
        Only games from players with an account (cloud saves) or sent with “Send my game to the developer” are here – other games never leave the player's browser.</p>
      {shown.length === 0 ? <div className="muted" style={{ padding: 12 }}>No saves.</div> : (
        <div className="table-wrap" style={{ maxHeight: 640, overflowY: 'auto' }}>
          <table className="grid"><thead><tr><th>Saved</th><th>Source</th><th>Manager</th><th>Club</th><th>Game date</th><th>E-mail</th><th>Note</th><th>Look</th><th>Device</th><th className="num">MB</th><th /></tr></thead>
            <tbody>{shown.map((r) => (
              <tr key={r.url}><td className="muted nowrap" title={when(r.saved)}>{ago(r.saved)}</td>
                <td>{r.source === 'support' ? <b>Sent</b> : <span className="muted">Cloud</span>}</td><td>{r.manager}</td><td>{r.club}</td><td className="nowrap">{r.date}</td>
                <td className="muted">{r.email ?? '–'}</td><td style={{ maxWidth: 320, whiteSpace: 'pre-wrap' }}>{r.note || <span className="muted">–</span>}</td>
                <td className="muted">{r.theme === 'classic' ? 'Classic' : r.theme === 'modern' ? 'Modern' : '–'}{r.mode ? ` · ${r.mode === 'authentic' ? 'Original' : 'Extended'}` : ''}</td>
                <td className="muted">{r.device ?? ''}{r.ver ? ` · v${r.ver}` : ''}</td><td className="num">{(r.size / 1e6).toFixed(1)}</td>
                <td className="nowrap"><button className="small primary" onClick={() => void open(r)}>👁 Open</button>{' '}
                  {r.source === 'support' && <button className="small" title="Delete" onClick={() => void remove(r)}>✕</button>}</td></tr>
            ))}</tbody></table>
        </div>
      )}
    </Panel>
  );
}

function RoomsTab() {
  const [rows, setRows] = useState<RoomRow[] | null>(null);
  useEffect(() => { void adminGet<{ rows: RoomRow[] }>('op=rooms').then((r) => setRows(r?.rows ?? [])); }, []);
  if (!rows) return <div className="muted">Loading rooms…</div>;
  return (
    <Panel title={`Multiplayer rooms (${rows.length})`} className="flush">
      {rows.length === 0 ? <div className="muted" style={{ padding: 12 }}>No rooms.</div> : (
        <div className="table-wrap" style={{ maxHeight: 640, overflowY: 'auto' }}>
          <table className="grid"><thead><tr><th>Code</th><th>Mode</th><th>Status</th><th>Players</th><th>Game date</th><th className="num">Turns</th><th>Last turn</th><th>Created</th></tr></thead>
            <tbody>{rows.map((r) => (
              <tr key={r.code}><td><a href={`/?room=${r.code}`} target="_blank" rel="noreferrer">{r.code}</a></td><td>{r.mode}</td><td>{r.status}</td><td>{r.players.join(', ')}</td>
                <td className="muted">{r.date || '–'}</td><td className="num">{r.version}</td><td className="muted nowrap">{ago(r.lastTurn)}</td><td className="muted nowrap">{when(r.created)}</td></tr>
            ))}</tbody></table>
        </div>
      )}
    </Panel>
  );
}

function CommunityTab({ setMsg }: { setMsg: (s: string) => void }) {
  const [items, setItems] = useState<Suggestion[]>([]);
  const [sel, setSel] = useState<Suggestion | null>(null);
  const [reply, setReply] = useState('');
  const [mergeInto, setMergeInto] = useState('');
  const [released, setReleased] = useState('');
  const [poll, setPoll] = useState<number[]>([]);
  const [pollTitle, setPollTitle] = useState('What should we build next?');
  const [pollEnds, setPollEnds] = useState('');
  const [sus, setSus] = useState<{ id: number; ip: string; n: number }[]>([]);
  const load = async () => {
    setItems((await communityGet<{ items: Suggestion[] }>('list=new'))?.items ?? []);
    setSus((await communityGet<{ items: { id: number; ip: string; n: number }[] }>('suspicious=1'))?.items ?? []);
  };
  useEffect(() => { void load(); }, []);
  const done = (r: { error?: unknown }) => { setMsg(r.error ? `Error: ${String(r.error)}` : 'Saved ✓'); void load(); };
  return (
    <>
      <div className="cols">
        <Panel title={`Suggestions (${items.length})`} className="flush">
          <div className="table-wrap" style={{ maxHeight: 520, overflowY: 'auto' }}>
            <table className="grid"><tbody>
              {items.map((s) => (
                <tr key={s.id} className={`clickable ${sel?.id === s.id ? 'me' : ''}`} onClick={() => { setSel(s); setReply(s.reply ?? ''); setReleased(s.releasedIn ?? ''); }}>
                  <td><input type="checkbox" checked={poll.includes(s.id)} onClick={(e) => e.stopPropagation()} onChange={() => setPoll(poll.includes(s.id) ? poll.filter((x) => x !== s.id) : [...poll, s.id].slice(0, 5))} /></td>
                  <td>#{s.id}</td><td>{s.hidden ? '🙈 ' : ''}{s.title}</td><td className="num">▲ {s.votes}</td><td>{s.status}</td><td className="muted">{s.cat}</td>
                </tr>
              ))}
            </tbody></table>
          </div>
        </Panel>
        <Panel title={sel ? `#${sel.id} ${sel.title}` : 'Select a suggestion'}>
          {sel && (
            <div className="col">
              <p style={{ whiteSpace: 'pre-line', margin: 0 }}>{sel.body}</p>
              <div className="muted" style={{ fontSize: 12 }}>{sel.name} · {when(sel.created)} · {sel.lang}{sel.meta ? ` · ${sel.meta}` : ''}</div>
              <div className="row" style={{ flexWrap: 'wrap' }}>
                {STATUSES.map((st) => <button key={st} className={`small ${sel.status === st ? 'primary' : ''}`} onClick={async () => done(await communityCall('status', { id: sel.id, status: st, releasedIn: st === 'released' ? released : undefined }))}>{st}</button>)}
              </div>
              <label className="row">Released in version <input value={released} onChange={(e) => setReleased(e.target.value)} placeholder="0.11.0" style={{ width: 100 }} /></label>
              <textarea rows={3} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Official reply (shown at the top of the suggestion)" />
              <div className="row">
                <button className="primary small" onClick={async () => done(await communityCall('reply', { id: sel.id, text: reply }))}>Save reply</button>
                <button className="small" onClick={async () => done(await communityCall('comment', { id: sel.id, text: reply }))}>Post as comment</button>
                <button className="small danger" onClick={async () => done(await communityCall('hide', { id: sel.id, hidden: !sel.hidden }))}>{sel.hidden ? 'Show again' : 'Hide'}</button>
              </div>
              <div className="row">Merge into #<input value={mergeInto} onChange={(e) => setMergeInto(e.target.value)} style={{ width: 70 }} /><button className="small" onClick={async () => done(await communityCall('merge', { id: sel.id, into: Number(mergeInto) }))}>Merge</button></div>
            </div>
          )}
        </Panel>
      </div>
      <div className="cols">
        <Panel title="Monthly poll">
          <div className="muted">Tick 2–5 suggestions in the list ({poll.map((x) => `#${x}`).join(', ') || 'none selected'}).</div>
          <div className="row" style={{ marginTop: 8 }}>
            <input value={pollTitle} onChange={(e) => setPollTitle(e.target.value)} />
            <input type="date" value={pollEnds} onChange={(e) => setPollEnds(e.target.value)} />
            <button className="primary small" disabled={poll.length < 2} onClick={async () => done(await communityCall('poll', { candidates: poll, title: pollTitle, ends: pollEnds }))}>Start poll</button>
          </div>
        </Panel>
        <Panel title={`Suspicious votes (${sus.length})`}>
          {sus.length === 0 ? <div className="muted">Nothing suspicious.</div> : <table className="grid"><tbody>{sus.map((x, i) => <tr key={i}><td>#{x.id}</td><td>{x.ip}</td><td className="num">{x.n} votes</td></tr>)}</tbody></table>}
        </Panel>
      </div>
    </>
  );
}

// ---------- community hub (api/hub.ts) ----------

type HubRow = Record<string, unknown> & { id: number };

function HallAdmin({ setMsg }: { setMsg: (s: string) => void }) {
  const [rows, setRows] = useState<HubRow[] | null>(null);
  const load = async () => setRows((await hubGet<{ rows: HubRow[] }>('op=hall&sort=new'))?.rows ?? []);
  useEffect(() => { void load(); }, []);
  if (!rows) return <div className="muted">Loading…</div>;
  return (
    <Panel title={`Shared careers (${rows.length})`} className="flush">
      {rows.length === 0 ? <div className="muted" style={{ padding: 12 }}>No shared careers yet.</div> : (
        <table className="grid"><thead><tr><th>Title</th><th>Manager</th><th>Club</th><th className="num">Seasons</th><th className="num">⭐</th><th className="num">💬</th><th>Shared</th><th /></tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={r.id} className={r.hidden ? 'muted' : ''}><td><a href={`/?hall=${r.id}`} target="_blank" rel="noreferrer">{String(r.title)}</a>{r.hidden ? ' (hidden)' : ''}</td><td>{String(r.manager)}</td><td>{String(r.club)}</td>
              <td className="num">{String(r.seasons)}</td><td className="num">{String(r.stars ?? 0)}</td><td className="num">{String(r.comments ?? 0)}</td><td className="muted nowrap">{when(String(r.created))}</td>
              <td><button className="small danger" onClick={async () => { const x = await hubPost('admin:hall-hide', { id: r.id, hidden: !r.hidden }); setMsg(x.error ? `Error: ${String(x.error)}` : 'Saved ✓'); void load(); }}>{r.hidden ? 'Show' : 'Hide'}</button></td></tr>
          ))}</tbody></table>
      )}
    </Panel>
  );
}

function EditsAdmin({ setMsg }: { setMsg: (s: string) => void }) {
  const [status, setStatus] = useState<'open' | 'approved' | 'rejected'>('open');
  const [rows, setRows] = useState<HubRow[] | null>(null);
  const load = async () => { setRows(null); setRows((await hubGet<{ rows: HubRow[] }>(`op=edits&status=${status}`))?.rows ?? []); };
  useEffect(() => { void load(); }, [status]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = async (id: number, st: string) => { const r = await hubPost('admin:edit', { id, status: st }); setMsg(r.error ? `Error: ${String(r.error)}` : `Marked as ${st} ✓ – approved edits apply to new games`); void load(); };
  return (
    <Panel title="Community database edits" right={<div className="tabs">{(['open', 'approved', 'rejected'] as const).map((s) => <button key={s} className={status === s ? 'on' : ''} onClick={() => setStatus(s)}>{s}</button>)}</div>} className="flush">
      {!rows ? <div className="muted" style={{ padding: 12 }}>Loading…</div> : rows.length === 0 ? <div className="muted" style={{ padding: 12 }}>Nothing here.</div> : (
        <table className="grid"><thead><tr><th>Target</th><th>DB</th><th>Field</th><th>Old → new</th><th>Reason</th><th>By</th><th className="num">Votes</th><th /></tr></thead>
          <tbody>{rows.map((e) => (
            <tr key={e.id}><td><b>{String(e.targetName)}</b><div className="muted" style={{ fontSize: 12 }}>{String(e.kind)} #{String(e.target)}</div></td><td>{String(e.db)}</td><td>{String(e.field)}</td>
              <td>{String(e.old) || '–'} → <b>{String(e.value)}</b></td><td className="muted" style={{ maxWidth: 280 }}>{String(e.reason)}</td><td className="muted">{String(e.name)}</td><td className="num">{String(e.votes)}</td>
              <td className="nowrap">{status !== 'approved' && <button className="small primary" onClick={() => set(e.id, 'approved')}>Approve</button>} {status !== 'rejected' && <button className="small danger" onClick={() => set(e.id, 'rejected')}>Reject</button>} {status !== 'open' && <button className="small" onClick={() => set(e.id, 'open')}>Reopen</button>}</td></tr>
          ))}</tbody></table>
      )}
    </Panel>
  );
}

function SkinsAdmin({ setMsg }: { setMsg: (s: string) => void }) {
  const [pending, setPending] = useState<HubRow[] | null>(null);
  const [live, setLive] = useState<HubRow[]>([]);
  const load = async () => {
    setPending((await hubGet<{ rows: HubRow[] }>('op=skins&status=pending'))?.rows ?? []);
    setLive((await hubGet<{ rows: HubRow[] }>('op=skins'))?.rows ?? []);
  };
  useEffect(() => { void load(); }, []);
  const set = async (id: number, st: string) => { const r = await hubPost('admin:skin', { id, status: st }); setMsg(r.error ? `Error: ${String(r.error)}` : `Skin ${st} ✓`); void load(); };
  const card = (s: HubRow, actions: ReactNode) => (
    <div key={s.id} className="adm-skin">
      <div className="adm-skin-imgs">{(s.images as string[]).map((u) => <a key={u} href={u} target="_blank" rel="noreferrer"><img src={u} alt="" /></a>)}</div>
      <b>{String(s.title)}</b> <span className="muted">by {String(s.author)} · {(s.images as string[]).length} images · {when(String(s.created))}</span>
      {s.desc ? <p className="muted" style={{ margin: '4px 0' }}>{String(s.desc)}</p> : null}
      <div className="row" style={{ gap: 6, alignItems: 'center' }}><span className="muted">Club pack for:</span>
        <input defaultValue={String(s.club ?? '')} placeholder={`(none – e.g. "${String(s.title)}")`} style={{ width: 220 }} onBlur={async (e) => { if (e.target.value === String(s.club ?? '')) return; const r = await hubPost('admin:skin', { id: s.id, club: e.target.value }); setMsg(r.error ? `Error: ${String(r.error)}` : 'Club saved ✓'); void load(); }} />
        <span className="muted">shown on that club's screens and home matches for everyone</span></div>
      <div className="row">{actions}</div>
    </div>
  );
  if (!pending) return <div className="muted">Loading…</div>;
  return (
    <>
      <Panel title={`Waiting for review (${pending.length})`}>
        <p className="muted" style={{ marginTop: 0 }}>Only approve packs the author made themselves or that are freely licensed – no screenshots or artwork from the original game or other commercial games.</p>
        {pending.length === 0 ? <div className="muted">Nothing to review.</div> : pending.map((s) => card(s, <><button className="small primary" onClick={() => set(s.id, 'approved')}>Approve</button><button className="small danger" onClick={() => set(s.id, 'rejected')}>Reject</button></>))}
      </Panel>
      <Panel title={`Live packs (${live.length})`}>
        {live.length === 0 ? <div className="muted">No packs yet.</div> : live.map((s) => card(s, <button className="small danger" onClick={() => set(s.id, 'rejected')}>Take down</button>))}
      </Panel>
    </>
  );
}

function CreditsAdmin({ setMsg }: { setMsg: (s: string) => void }) {
  const [rows, setRows] = useState<{ id: string; name: string; role: string; link?: string; since?: string }[] | null>(null);
  const [f, setF] = useState({ name: '', role: '', link: '' });
  const load = async () => setRows((await hubGet<{ rows: { id: string; name: string; role: string; link?: string; since?: string }[] }>('op=credits'))?.rows ?? []);
  useEffect(() => { void load(); }, []);
  return (
    <Panel title="Credits – contributors shown on the community page">
      <form className="row" style={{ flexWrap: 'wrap', marginBottom: 10 }} onSubmit={async (e) => { e.preventDefault(); const r = await hubPost('admin:credit', f); setMsg(r.error ? `Error: ${String(r.error)}` : 'Added ✓'); setF({ name: '', role: '', link: '' }); void load(); }}>
        <input placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required />
        <input placeholder="Role (e.g. Data, Testing)" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} />
        <input placeholder="Link (optional)" value={f.link} onChange={(e) => setF({ ...f, link: e.target.value })} />
        <button className="primary small" type="submit">Add</button>
      </form>
      {!rows ? <div className="muted">Loading…</div> : rows.length === 0 ? <div className="muted">No contributors yet.</div> : (
        <table className="grid"><tbody>{rows.map((c) => <tr key={c.id}><td><b>{c.name}</b></td><td className="muted">{c.role}</td><td className="muted">{c.link}</td><td className="muted">{c.since}</td>
          <td><button className="small danger" onClick={async () => { await hubPost('admin:credit', { key: c.id, remove: true }); void load(); }}>Remove</button></td></tr>)}</tbody></table>
      )}
    </Panel>
  );
}

// ---------- opdateringsmails ----------

interface MailInfo { subs: { email: string; lang: string; at: string }[]; unsubs: { email: string; at: string }[]; prompt: Record<string, number>; sent: { at: string; subject: string; lang: string; sent: number; failed: number }[]; mail: boolean; testTo: string }

function MailTab({ setMsg }: { setMsg: (s: string) => void }) {
  const [info, setInfo] = useState<MailInfo | null>(null);
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [lang, setLang] = useState('');
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const load = async () => setInfo(await adminGet<MailInfo>('op=mail'));
  useEffect(() => { void load(); }, []);
  if (!info) return <div className="muted">Loading…</div>;
  const n = (k: string) => Number(info.prompt[k] ?? 0);
  const asked = n('asked');
  const pct = (k: string) => (asked ? ` (${Math.round((n(k) / asked) * 100)}%)` : '');
  const target = lang ? info.subs.filter((r) => r.lang === lang).length : info.subs.length;
  const langs = [...new Set(info.subs.map((r) => r.lang))].sort();
  const send = async (test: boolean) => {
    if (!test && !confirm(`Send "${subject}" to ${target} subscriber${target === 1 ? '' : 's'}${lang ? ` (${lang})` : ''}? This cannot be undone.`)) return;
    setBusy(true);
    const r = await adminPost('mail-send', { subject, text, lang, test }) as { sent?: number; failed?: number; error?: unknown };
    setBusy(false);
    setMsg(r.error ? `Error: ${String(r.error)}` : test ? `Test sent to ${info.testTo} ✓` : `Sent to ${r.sent} ✓${r.failed ? ` · ${r.failed} failed` : ''}`);
    void load();
  };
  const showPreview = async () => {
    const r = await adminPost('mail-preview', { subject, text, lang: lang || 'en' }) as { html?: string };
    setPreview(r.html ?? '');
  };
  return (
    <>
      <div className="adm-stats">
        <Stat label="Subscribers" value={info.subs.length} sub={langs.map((l) => `${l} ${info.subs.filter((r) => r.lang === l).length}`).join(' · ') || 'none yet'} />
        <Stat label="Asked in the game" value={asked} sub="after the first finished season" />
        <Stat label="Said yes" value={n('yes')} sub={`signed in${pct('yes')}`} />
        <Stat label="Not now / No" value={`${n('later')} / ${n('no')}`} sub={`${pct('later')} / ${pct('no')}`.replace(/^ \/ $/, '')} />
        <Stat label="Unsubscribed" value={info.unsubs.length} />
      </div>
      <div className="cols">
        <Panel title="Write an update">
          {!info.mail && <div className="insight bad">RESEND_API_KEY is not set – mails can't be sent.</div>}
          <div className="col">
            <input placeholder="Subject" maxLength={120} value={subject} onChange={(e) => setSubject(e.target.value)} />
            <textarea rows={12} placeholder={'Text. A blank line starts a new paragraph, lines starting with "- " become a list.'} value={text} onChange={(e) => setText(e.target.value)} />
            <label className="row">To <select value={lang} onChange={(e) => setLang(e.target.value)}><option value="">all languages</option>{langs.map((l) => <option key={l} value={l}>{l}</option>)}</select>
              <span className="muted">{target} recipient{target === 1 ? '' : 's'}</span></label>
            <div className="row">
              <button className="small" disabled={!subject.trim() || !text.trim()} onClick={() => void showPreview()}>Preview</button>
              <button className="small" disabled={busy || !subject.trim() || !text.trim() || !info.testTo} title={info.testTo ? `Sends only to ${info.testTo}` : 'Set NOTIFY_EMAIL'} onClick={() => void send(true)}>Send test to me</button>
              <button className="small primary" disabled={busy || !subject.trim() || !text.trim() || !target} onClick={() => void send(false)}>Send to {target}</button>
            </div>
            {preview && <iframe title="preview" srcDoc={preview} style={{ width: '100%', height: 480, border: '1px solid var(--line)', background: '#070b16' }} />}
          </div>
        </Panel>
        <Panel title={`Sent (${info.sent.length})`}>
          {info.sent.length === 0 ? <div className="muted">Nothing sent yet.</div> : (
            <table className="grid"><thead><tr><th>When</th><th>Subject</th><th>To</th><th className="num">Sent</th></tr></thead>
              <tbody>{info.sent.map((r, i) => <tr key={i}><td>{when(r.at)}</td><td>{r.subject}</td><td>{r.lang}</td><td className="num">{r.sent}{r.failed ? ` (${r.failed} failed)` : ''}</td></tr>)}</tbody></table>)}
        </Panel>
      </div>
      <div className="cols">
        <Panel title={`Subscribers (${info.subs.length})`}>
          {info.subs.length === 0 ? <div className="muted">Nobody yet.</div> : (
            <div className="table-wrap" style={{ maxHeight: 360, overflowY: 'auto' }}><table className="grid"><thead><tr><th>E-mail</th><th>Lang</th><th>Since</th></tr></thead>
              <tbody>{info.subs.map((r) => <tr key={r.email}><td>{r.email}</td><td>{r.lang}</td><td>{when(r.at)}</td></tr>)}</tbody></table></div>)}
        </Panel>
        <Panel title={`Unsubscribed (${info.unsubs.length})`}>
          {info.unsubs.length === 0 ? <div className="muted">Nobody.</div> : (
            <div className="table-wrap" style={{ maxHeight: 360, overflowY: 'auto' }}><table className="grid"><thead><tr><th>E-mail</th><th>When</th></tr></thead>
              <tbody>{info.unsubs.map((r) => <tr key={r.email}><td>{r.email}</td><td>{when(r.at)}</td></tr>)}</tbody></table></div>)}
        </Panel>
      </div>
    </>
  );
}

// ---------- fejl fra spillernes browsere ----------

interface ErrRow { id: string; msg: string; stack: string; count: number; first: string; last: string; ver: string; url: string; theme: string; lang: string; ua: string }

function ErrorsTab({ setMsg }: { setMsg: (s: string) => void }) {
  const [rows, setRows] = useState<ErrRow[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const load = async () => setRows((await adminGet<{ rows: ErrRow[] }>('op=errors'))?.rows ?? []);
  useEffect(() => { void load(); }, []);
  const del = async (data: Record<string, unknown>, ok: string) => { const r = await adminPost('error-delete', data); setMsg(r.error ? `Error: ${String(r.error)}` : ok); void load(); };
  if (!rows) return <div className="muted">Loading…</div>;
  return (
    <Panel title={`Errors in players' browsers (${rows.length})`} right={rows.length ? <button className="small danger" onClick={() => { if (confirm('Delete all errors?')) void del({ all: true }, 'All errors deleted ✓'); }}>Clear all</button> : undefined} className="flush">
      <p className="muted" style={{ margin: '8px 12px' }}>Grouped by message and code line, newest first. Sent automatically when the game crashes or an error is thrown (max 20 per page load). Mark one as fixed with ✓ once a fix is live.</p>
      {rows.length === 0 ? <div className="muted" style={{ padding: 12 }}>No errors reported. 🎉</div> : (
        <div className="table-wrap"><table className="grid"><thead><tr><th className="num">Count</th><th>Error</th><th>Version</th><th>Look</th><th>Last</th><th /></tr></thead>
          <tbody>{rows.map((r) => (<>
            <tr key={r.id} className="clickable" onClick={() => setOpen(open === r.id ? null : r.id)}>
              <td className="num"><b>{r.count}</b></td><td style={{ maxWidth: 560, wordBreak: 'break-word' }}>{r.msg}</td><td>{r.ver}</td><td className="muted">{r.theme} · {r.lang}</td><td>{when(r.last)}</td>
              <td><button className="small" title="Fixed – remove" onClick={(e) => { e.stopPropagation(); void del({ id: r.id }, 'Removed ✓'); }}>✓</button></td>
            </tr>
            {open === r.id && <tr key={`${r.id}-s`}><td colSpan={6}><div className="muted" style={{ fontSize: 12 }}>First {when(r.first)} · {r.url} · {r.ua}</div><pre style={{ whiteSpace: 'pre-wrap', fontSize: 11, maxHeight: 320, overflow: 'auto', margin: '6px 0' }}>{r.stack}</pre></td></tr>}
          </>))}</tbody></table></div>
      )}
    </Panel>
  );
}
