// Fællesskabets hub: forslag, Hall of Fame (delte karrierer), CM-legender, databaserettelser, feed, baggrundspakker
// og credits. Bruges både i spillet (Community-siden) og som offentlig side (?community=1, ?hall=ID).
import { useEffect, useState } from 'react';
import { ATTRS as ATTR_KEYS } from '../game/attributes';
import { LEGENDS } from '../game/legends';
import { getProfile } from '../online/rank';
import {
  commentHall, createSkin, getHall, hubAvailable, hubConfig, legendCounts, listCredits, listEdits, listHall, listSkins, myFeed,
  rememberLegend, starHall, submitSkin, shrinkBackground, uploadSkinImage, voteEdit,
  type Credit, type DbEdit, type FeedRow, type HallComment, type HallRow, type HallSummary, type SkinPack,
} from '../online/hub';
import { dateFmt, getLang, t } from '../i18n';
import { bgPack, setBgPack } from './backgrounds';
import { CommunityBoard, ProfileGate } from './Community';
import { Modal, Panel, Tabs } from './components';

export type HubTab = 'suggestions' | 'hall' | 'legends' | 'database' | 'feed' | 'skins' | 'credits';
const TABS: HubTab[] = ['suggestions', 'hall', 'legends', 'database', 'feed', 'skins', 'credits'];
const errText = (e: string) => (t(`hub.err.${e}`) === `hub.err.${e}` ? t('hub.err.error') : t(`hub.err.${e}`));
const when = (iso: string) => dateFmt(iso.slice(0, 10));

export function CommunityHub({ initialTab = 'suggestions', hallId, suggestionId, defaultName, onLegend }: {
  initialTab?: HubTab; hallId?: number; suggestionId?: number; defaultName?: string;
  /** i spillet: åbn legenden i det aktuelle spil (kun med den originale database) */
  onLegend?: (id: number) => void;
}) {
  const [tab, setTab] = useState<HubTab>(hallId ? 'hall' : initialTab);
  const [, setTick] = useState(0);
  if (!hubAvailable()) return <div className="empty">{t('rank.offline')}</div>;
  return (
    <div className="hub">
      <div className="hub-tabs"><Tabs tabs={TABS.map((k) => [k, t(`hub.tab.${k}`)] as [string, string])} value={tab} onChange={(v) => setTab(v as HubTab)} /></div>
      {tab !== 'suggestions' && tab !== 'credits' && !getProfile() && <ProfileGate defaultName={defaultName} onDone={() => setTick((x) => x + 1)} />}
      {tab === 'suggestions' && <CommunityBoard initialId={suggestionId} defaultName={defaultName} />}
      {tab === 'hall' && <HallTab openId={hallId} />}
      {tab === 'legends' && <LegendsTab onLegend={onLegend} />}
      {tab === 'database' && <DatabaseTab />}
      {tab === 'feed' && <FeedTab />}
      {tab === 'skins' && <SkinsTab />}
      {tab === 'credits' && <CreditsTab />}
    </div>
  );
}

// ---------- Hall of Fame ----------

function HallTab({ openId }: { openId?: number }) {
  const [sort, setSort] = useState<'new' | 'top'>('new');
  const [rows, setRows] = useState<HallRow[] | null>(null);
  const [open, setOpen] = useState<number | null>(openId ?? null);
  useEffect(() => { setRows(null); void listHall(sort).then((r) => setRows(r?.rows ?? [])); }, [sort]);
  return (
    <>
      <p className="muted" style={{ marginTop: 0 }}>{t('hub.hall.intro')}</p>
      <Tabs tabs={[['new', t('hub.hall.new')], ['top', t('hub.hall.top')]]} value={sort} onChange={(v) => setSort(v as 'new' | 'top')} />
      {!rows ? <div className="muted">{t('common.loading')}</div> : rows.length === 0 ? <div className="empty">{t('hub.hall.empty')}</div> : (
        <div className="hub-cards">
          {rows.map((r) => (
            <button key={r.id} className="hub-card" onClick={() => setOpen(r.id)}>
              <b>{r.title}</b>
              <span>{r.manager} · {r.club}{r.league ? ` · ${r.league}` : ''}</span>
              <small>{t('hub.hall.meta', { seasons: r.seasons, trophies: r.trophies })} · ⭐ {r.stars} · 💬 {r.comments} · {when(r.created)}</small>
            </button>
          ))}
        </div>
      )}
      {open !== null && <HallModal id={open} onClose={() => setOpen(null)} />}
    </>
  );
}

function HallModal({ id, onClose }: { id: number; onClose: () => void }) {
  const [d, setD] = useState<{ entry: HallRow & { summary: HallSummary | null }; comments: HallComment[]; starred: boolean } | null | 'missing'>(null);
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');
  const load = () => void getHall(id).then((r) => setD(r ?? 'missing'));
  useEffect(load, [id]);
  const url = `${location.origin}/?hall=${id}`;
  if (d === 'missing') return <Modal title={t('hub.tab.hall')} onClose={onClose}><div className="empty">{t('hub.hall.missing')}</div></Modal>;
  const s = d?.entry.summary;
  return (
    <Modal title={d ? d.entry.title : t('common.loading')} onClose={onClose} wide>
      {d && (
        <div className="col">
          <div className="row" style={{ flexWrap: 'wrap' }}>
            <span className="grow muted">{d.entry.manager} · {d.entry.club} · {t('hub.hall.meta', { seasons: d.entry.seasons, trophies: d.entry.trophies })}{s?.db ? ` · ${t(s.db === 'original' ? 'hub.db.original' : 'hub.db.cm')}` : ''}</span>
            <button className={`small ${d.starred ? 'primary' : ''}`} onClick={async () => { const r = await starHall(id, !d.starred); if ('error' in r) setMsg(errText(r.error)); else load(); }}>⭐ {d.entry.stars} {t(d.starred ? 'hub.hall.starred' : 'hub.hall.star')}</button>
            <button className="small" onClick={() => { void navigator.clipboard?.writeText(url); setMsg(t('hub.copied')); }}>🔗 {t('hub.copyLink')}</button>
          </div>
          {msg && <div className="insight">{msg}</div>}
          {s && (
            <div className="cols">
              <Panel title={t('hub.hall.history')} className="flush">
                <table className="grid"><tbody>{s.history.slice().reverse().map((h, i) => <tr key={i}><td>{h.season}/{String((h.season + 1) % 100).padStart(2, '0')}</td><td>{h.club}</td><td className="muted">{h.league}</td><td className="num">{h.pos ? `${h.pos}.` : ''}</td></tr>)}</tbody></table>
              </Panel>
              <div className="col">
                <Panel title={t('hub.hall.trophies')}>{s.trophies.length ? <div className="row" style={{ flexWrap: 'wrap' }}>{s.trophies.slice().reverse().map((x, i) => <span key={i} className="tag good">🏆 {x.comp} {x.season}/{String((x.season + 1) % 100).padStart(2, '0')}</span>)}</div> : <span className="muted">{t('common.none')}</span>}</Panel>
                <Panel title={t('hub.hall.players')} className="flush">
                  <table className="grid"><tbody>{s.players.map((p, i) => <tr key={i}><td>{p.name}</td><td className="muted">{p.pos}</td><td className="num">{p.apps} {t('hub.apps')}</td><td className="num">{p.goals} {t('hub.goals')}</td></tr>)}</tbody></table>
                </Panel>
              </div>
            </div>
          )}
          <Panel title={`${t('hub.comments')} (${d.comments.length})`}>
            {d.comments.map((c, i) => <div key={i} className="hub-comment"><b>{c.name}</b> <span className="muted">{when(c.at)}</span><div>{c.text}</div></div>)}
            {getProfile() && (
              <div className="row" style={{ marginTop: 8 }}>
                <input className="grow" maxLength={800} value={text} onChange={(e) => setText(e.target.value)} placeholder={t('hub.commentPh')} />
                <button className="primary small" disabled={!text.trim()} onClick={async () => { const r = await commentHall(id, text); if ('error' in r) setMsg(errText(r.error)); else { setText(''); load(); } }}>{t('hub.send')}</button>
              </div>
            )}
          </Panel>
        </div>
      )}
    </Modal>
  );
}

// ---------- legender ----------

function LegendsTab({ onLegend }: { onLegend?: (id: number) => void }) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [mine, setMine] = useState<string[]>([]);
  const load = () => void legendCounts(LEGENDS.map((l) => l.key)).then((r) => { setCounts(r?.counts ?? {}); setMine(r?.mine ?? []); });
  useEffect(load, []);
  const lang = getLang();
  return (
    <>
      <p className="muted" style={{ marginTop: 0 }}>{t('hub.legends.intro')}</p>
      <div className="hub-cards">
        {LEGENDS.map((l) => {
          const on = mine.includes(l.key);
          return (
            <div key={l.key} className="hub-card legend">
              <b>{l.name}</b>
              <span>{lang === 'da' ? l.da : (l as unknown as Record<string, string>)[lang] ?? l.en}</span>
              <div className="row" style={{ marginTop: 'auto' }}>
                <button className={`small ${on ? 'primary' : ''}`} disabled={!getProfile()} onClick={async () => { const r = await rememberLegend(l.key, !on); if (!('error' in r)) load(); }}>❤️ {t(on ? 'hub.legends.remembered' : 'hub.legends.remember')} · {counts[l.key] ?? 0}</button>
                {onLegend && <button className="small" onClick={() => onLegend(l.id)}>{t('hub.legends.open')}</button>}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ---------- databaserettelser ----------

function DatabaseTab() {
  const [status, setStatus] = useState<'open' | 'approved' | 'rejected'>('open');
  const [rows, setRows] = useState<DbEdit[] | null>(null);
  const [voted, setVoted] = useState<number[]>([]);
  const [msg, setMsg] = useState('');
  const load = () => { setRows(null); void listEdits(status).then((r) => { setRows(r?.rows ?? []); setVoted(r?.voted ?? []); }); };
  useEffect(load, [status]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <p className="muted" style={{ marginTop: 0 }}>{t('hub.db.intro')}</p>
      <Tabs tabs={[['open', t('hub.db.open')], ['approved', t('hub.db.approved')], ['rejected', t('hub.db.rejected')]]} value={status} onChange={(v) => setStatus(v as typeof status)} />
      {msg && <div className="insight">{msg}</div>}
      {!rows ? <div className="muted">{t('common.loading')}</div> : rows.length === 0 ? <div className="empty">{t('hub.db.empty')}</div> : (
        <Panel className="flush">
          <table className="grid">
            <thead><tr><th>{t('hub.db.what')}</th><th>{t('hub.db.change')}</th><th>{t('hub.db.why')}</th><th>{t('hub.db.by')}</th><th className="num">👍</th></tr></thead>
            <tbody>{rows.map((e) => {
              const on = voted.includes(e.id);
              return (
                <tr key={e.id}>
                  <td><b>{e.targetName}</b><div className="muted" style={{ fontSize: 12 }}>{t(e.db === 'original' ? 'hub.db.original' : 'hub.db.cm')}</div></td>
                  <td>{fieldLabel(e.field, e.value)}: <span className="muted">{shown(e.field, e.old) || '–'}</span> → <b>{shown(e.field, e.value)}</b></td>
                  <td className="muted">{e.reason}</td>
                  <td className="muted">{e.name}<div style={{ fontSize: 12 }}>{when(e.created)}</div></td>
                  <td className="num">{status === 'open'
                    ? <button className={`small ${on ? 'primary' : ''}`} disabled={!getProfile()} onClick={async () => { const r = await voteEdit(e.id, !on); if ('error' in r) setMsg(errText(r.error)); else load(); }}>👍 {e.votes}</button>
                    : e.votes}</td>
                </tr>
              );
            })}</tbody>
          </table>
        </Panel>
      )}
    </>
  );
}
/** "attr" gemmes som "index:værdi" */
function fieldLabel(field: string, value: string) {
  if (field === 'attr') { const k = ATTR_KEYS[Number(value.split(':')[0])]; return k ? t(`attr.${k}`) : field; }
  return t(`hub.field.${field}`);
}
const shown = (field: string, v: string) => (field === 'attr' ? v.split(':')[1] ?? v : v);

// ---------- feed ----------

function FeedTab() {
  const [d, setD] = useState<{ rows: FeedRow[]; following: { pid: string; name: string }[] } | null>(null);
  useEffect(() => { void myFeed().then((r) => setD(r ?? { rows: [], following: [] })); }, []);
  if (!getProfile()) return null;
  if (!d) return <div className="muted">{t('common.loading')}</div>;
  return (
    <div className="cols">
      <Panel title={t('hub.feed.title')}>
        {d.rows.length === 0 ? <div className="muted">{t(d.following.length ? 'hub.feed.empty' : 'hub.feed.noFollow')}</div> : d.rows.map((r, i) => (
          <div key={i} className="hub-feed-row">
            <span className="hub-feed-icon">{r.kind === 'hall' ? '🏆' : r.kind === 'edit' ? '✅' : '⚽'}</span>
            <div><a href={`?manager=${r.pid}`}><b>{r.name}</b></a> {t(`hub.feed.${r.kind}`)} {r.kind === 'hall' && r.id ? <a href={`?hall=${r.id}`}>{r.text}</a> : <span>{r.text}</span>}
              <div className="muted" style={{ fontSize: 12 }}>{when(r.at)}</div></div>
          </div>
        ))}
      </Panel>
      <Panel title={`${t('hub.feed.following')} (${d.following.length})`}>
        {d.following.length === 0 ? <div className="muted">{t('hub.feed.howTo')}</div> : d.following.map((f) => <div key={f.pid}><a href={`?manager=${f.pid}`}>{f.name}</a></div>)}
      </Panel>
    </div>
  );
}

// ---------- baggrundspakker ----------

function SkinsTab() {
  const [rows, setRows] = useState<SkinPack[] | null>(null);
  const [cur, setCur] = useState(bgPack()?.id ?? 0);
  const [making, setMaking] = useState(false);
  useEffect(() => { void listSkins().then((r) => setRows(r?.rows ?? [])); }, []);
  const use = (p: SkinPack | null) => { setBgPack(p ? { id: p.id, title: p.title, images: p.images } : null); setCur(p?.id ?? 0); };
  return (
    <>
      <p className="muted" style={{ marginTop: 0 }}>{t('hub.skins.intro')}</p>
      <div className="row" style={{ flexWrap: 'wrap' }}>
        <button className={`small ${cur === 0 ? 'primary' : ''}`} onClick={() => use(null)}>{t('hub.skins.default')}</button>
        {getProfile() && <button className="small" onClick={() => setMaking(true)}>＋ {t('hub.skins.create')}</button>}
      </div>
      {!rows ? <div className="muted">{t('common.loading')}</div> : rows.length === 0 ? <div className="empty">{t('hub.skins.empty')}</div> : (
        <div className="hub-cards">
          {rows.map((p) => (
            <div key={p.id} className={`hub-card skin ${cur === p.id ? 'on' : ''}`}>
              <div className="hub-skin-thumbs">{p.images.slice(0, 3).map((u) => <img key={u} src={u} alt="" loading="lazy" />)}</div>
              <b>{p.title}</b><span>{p.desc}</span><small>{t('hub.skins.by', { name: p.author, n: p.images.length })}</small>
              <button className={`small ${cur === p.id ? 'primary' : ''}`} onClick={() => use(p)}>{t(cur === p.id ? 'hub.skins.inUse' : 'hub.skins.use')}</button>
            </div>
          ))}
        </div>
      )}
      {making && <SkinMaker onClose={() => setMaking(false)} />}
    </>
  );
}

function SkinMaker({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [license, setLicense] = useState(false);
  const [id, setId] = useState<number | null>(null);
  const [urls, setUrls] = useState<string[]>([]);
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  const [done, setDone] = useState(false);
  const upload = async (files: FileList | null) => {
    if (!files || id === null) return;
    for (const f of [...files].slice(0, 24 - urls.length)) {
      setBusy(t('hub.skins.uploading', { name: f.name }));
      const data = await shrinkBackground(f).catch(() => '');
      if (!data) continue;
      const r = await uploadSkinImage(id, data);
      if ('error' in r) { setMsg(errText(r.error)); break; }
      setUrls((u) => [...u, r.url]);
    }
    setBusy('');
  };
  return (
    <Modal title={t('hub.skins.create')} onClose={onClose}>
      {done ? <div className="insight good">{t('hub.skins.sent')}</div> : id === null ? (
        <div className="col">
          <label className="col">{t('hub.skins.name')}<input maxLength={60} value={title} onChange={(e) => setTitle(e.target.value)} /></label>
          <label className="col">{t('hub.skins.desc')}<textarea rows={2} maxLength={400} value={desc} onChange={(e) => setDesc(e.target.value)} /></label>
          <label className="row"><input type="checkbox" checked={license} onChange={(e) => setLicense(e.target.checked)} />{t('hub.skins.license')}</label>
          {msg && <div className="bad">{msg}</div>}
          <button className="primary" disabled={!title.trim() || !license} onClick={async () => { const r = await createSkin(title, desc); if ('error' in r) setMsg(errText(r.error)); else setId(r.id); }}>{t('hub.skins.next')}</button>
        </div>
      ) : (
        <div className="col">
          <div className="muted">{t('hub.skins.addImages')}</div>
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => void upload(e.target.files)} />
          {busy && <div className="muted">{busy}</div>}
          {msg && <div className="bad">{msg}</div>}
          <div className="hub-skin-thumbs">{urls.map((u) => <img key={u} src={u} alt="" />)}</div>
          <button className="primary" disabled={urls.length < 3 || !!busy} onClick={async () => { const r = await submitSkin(id); if ('error' in r) setMsg(errText(r.error)); else setDone(true); }}>{t('hub.skins.submit', { n: urls.length })}</button>
        </div>
      )}
    </Modal>
  );
}

// ---------- credits ----------

const DATA_CREDITS: [string, string, string?][] = [
  ['Championship Manager 01/02', 'Sports Interactive / Eidos – the original game and the 3.9.68 database'],
  ['October 2026 Data Update', 'The CM 01/02 community – updated squads for 2026/27'],
  ['Sunday League Pack', 'The CM 01/02 community – background photos'],
  ['transfermarkt-datasets', 'dcaribou – open player data (CC0)', 'https://github.com/dcaribou/transfermarkt-datasets'],
  ['football-logos', 'luukhopman – club logos', 'https://github.com/luukhopman/football-logos'],
  ['TheSportsDB', 'club logos for English clubs missing from the pack', 'https://www.thesportsdb.com'],
];

function CreditsTab() {
  const [rows, setRows] = useState<Credit[] | null>(null);
  const [cfg, setCfg] = useState<{ discord: string | null; github: string } | null>(null);
  useEffect(() => { void listCredits().then((r) => setRows(r?.rows ?? [])); void hubConfig().then(setCfg); }, []);
  return (
    <div className="cols">
      <div className="col">
        <Panel title={t('hub.credits.people')}>
          <p className="muted" style={{ marginTop: 0 }}>{t('hub.credits.intro')}</p>
          {!rows ? <div className="muted">{t('common.loading')}</div> : rows.length === 0 ? <div className="muted">{t('hub.credits.none')}</div> : (
            <table className="grid"><tbody>{rows.map((c) => <tr key={c.id}><td><b>{c.link ? <a href={c.link} target="_blank" rel="noreferrer">{c.name}</a> : c.name}</b></td><td className="muted">{c.role}</td><td className="muted num">{c.since ? when(c.since) : ''}</td></tr>)}</tbody></table>
          )}
        </Panel>
        <Panel title={t('hub.credits.data')}>
          <table className="grid"><tbody>{DATA_CREDITS.map(([n, d, l]) => <tr key={n}><td><b>{l ? <a href={l} target="_blank" rel="noreferrer">{n}</a> : n}</b></td><td className="muted">{d}</td></tr>)}</tbody></table>
        </Panel>
      </div>
      <Panel title={t('hub.credits.join')}>
        <p style={{ marginTop: 0 }}>{t('hub.credits.joinText')}</p>
        <div className="col" style={{ alignItems: 'flex-start' }}>
          <a className="button primary" href="/#join">{t('hub.credits.apply')}</a>
          {cfg?.discord && <a className="button" href={cfg.discord} target="_blank" rel="noreferrer">💬 {t('hub.credits.discord')}</a>}
          {cfg?.github && <a className="button" href={`${cfg.github}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noreferrer">🛠 {t('hub.credits.contribute')}</a>}
          {cfg?.github && <a className="button" href={`${cfg.github}/issues?q=is%3Aopen+label%3A%22good+first+issue%22`} target="_blank" rel="noreferrer">🌱 {t('hub.credits.firstIssue')}</a>}
        </div>
      </Panel>
    </div>
  );
}
