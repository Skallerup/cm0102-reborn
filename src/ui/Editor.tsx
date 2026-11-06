// Database-editoren (startmenuen): ret spillere og klubber i den originale eller den moderne database, opret nye
// spillere og start et nyt spil med "Min database". Ændringerne gemmes som en diff (game/dbEdit.ts).
import { useEffect, useMemo, useState } from 'react';
import { ATTRS, GROUPS, A } from '../game/attributes';
import type { CMRatings, CMWorld } from '../game/data/cm0102';
import { changeCount, emptyDb, NEW_ID0, POS_KEYS, SIDE_KEYS, type ClubEdit, type CustomDb, type DbBase, type NewPlayer, type PlayerEdit } from '../game/dbEdit';
import type { WorldData } from '../game/newgame';
import { natName, t } from '../i18n';
import { askConfirm } from './confirm';
import { Panel, Tabs } from './components';
import { Select } from './select';
import { baseWorld, deleteDb, exportDb, importDb, listDbs, saveDb } from './customDb';

export function Editor({ onBack, onPlay }: { onBack: () => void; onPlay: (id: string) => void }) {
  const [dbs, setDbs] = useState<CustomDb[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [base, setBase] = useState<DbBase>('original');
  const [err, setErr] = useState('');
  const refresh = () => listDbs().then(setDbs);
  useEffect(() => { void refresh(); }, []);
  const cur = dbs?.find((d) => d.id === open);
  if (cur) return <DbEditor key={cur.id} db={cur} onClose={() => { setOpen(null); void refresh(); }} onPlay={() => onPlay(cur.id)} />;

  const create = async () => {
    const db = emptyDb(name.trim() || t('ed.untitled'), base);
    await saveDb(db);
    setName('');
    await refresh();
    setOpen(db.id);
  };
  const remove = async (d: CustomDb) => {
    if (!(await askConfirm(t('ed.confirmDelete', { name: d.name }), { danger: true }))) return;
    await deleteDb(d.id);
    await refresh();
  };
  const doImport = async (f: File | undefined) => {
    if (!f) return;
    setErr('');
    const db = await importDb(f);
    if (!db) setErr(t('ed.importFailed'));
    await refresh();
  };
  return (
    <Panel title={t('ed.title')} right={<button className="small" onClick={onBack}>{t('common.back')}</button>}>
      <div className="col">
        <div className="muted">{t('ed.intro')}</div>
        <div className="row">
          <input className="grow" placeholder={t('ed.newName')} value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
          <select value={base} onChange={(e) => setBase(e.target.value as DbBase)} aria-label={t('ed.base')}>
            <option value="original">{t('db.original')}</option>
            <option value="modern">{t('db.modern')}</option>
          </select>
          <button className="primary" onClick={() => void create()}>{t('ed.create')}</button>
        </div>
        {!dbs && <div className="muted">{t('start.loading')}</div>}
        {dbs?.length === 0 && <div className="muted">{t('ed.none')}</div>}
        {dbs?.map((d) => (
          <div key={d.id} className="choice">
            <div className="grow" onClick={() => setOpen(d.id)}>
              <b>{d.name}</b> <span className="muted">— {d.base === 'original' ? t('db.original') : t('db.modern')}</span>
              <div className="muted">{t('ed.changes', { n: changeCount(d) })} · {t('start.savedAt')} {new Date(d.updated).toLocaleString()}</div>
            </div>
            <button className="small" onClick={() => onPlay(d.id)}>{t('ed.play')}</button>
            <button className="small" onClick={() => exportDb(d)}>{t('ed.export')}</button>
            <button className="small danger" onClick={() => void remove(d)}>{t('common.delete')}</button>
          </div>
        ))}
        <div className="row">
          <button className="small" onClick={() => document.getElementById('db-import')?.click()}>{t('ed.import')}</button>
          <input id="db-import" type="file" accept=".json,.cmdb" style={{ display: 'none' }} onChange={(e) => { void doImport(e.target.files?.[0]); e.target.value = ''; }} />
          {err && <span className="bad">{err}</span>}
        </div>
      </div>
    </Panel>
  );
}

// ---------- én database ----------

type Sel = { kind: 'player'; id: number } | { kind: 'club'; id: number } | null;
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Spillerens værdier efter ændringerne (grunddatabasen + diff) */
interface Eff { first: string; last: string; dob: string; nation: number; club: number; foot: 'L' | 'R' | 'B'; ca: number; pa: number; attrs: number[]; pos: number[]; side: number[]; contract: string; number: number }

function DbEditor({ db: initial, onClose, onPlay }: { db: CustomDb; onClose: () => void; onPlay: () => void }) {
  const [db, setDb] = useState(initial);
  const [w, setW] = useState<(WorldData & Partial<CMWorld>) | null>(null);
  const [tab, setTab] = useState<'players' | 'clubs' | 'changes'>('players');
  const [q, setQ] = useState('');
  const [clubFilter, setClubFilter] = useState(0);
  const [sel, setSel] = useState<Sel>(null);
  const [msg, setMsg] = useState('');
  useEffect(() => { void baseWorld(db).then((x) => setW(x as WorldData & Partial<CMWorld>)); }, [db.base]);

  const idx = useMemo(() => {
    if (!w) return null;
    const F = Object.fromEntries(w.playerFields.map((f, i) => [f, i]));
    const clubOpts = [{ value: 0, label: t('ed.freeAgent') }, ...w.clubs.map((c) => ({ value: c[0], label: c[1], flag: w.nations[c[3]]?.name }))
      .sort((a, b) => a.label.localeCompare(b.label))];
    const nationOpts = w.nations.map((n, i) => ({ value: i, label: natName(n.name), flag: n.name })).sort((a, b) => a.label.localeCompare(b.label));
    return { F, rows: new Map(w.players.map((p) => [p[F.id] as number, p])), clubs: new Map(w.clubs.map((c) => [c[0], c])), clubOpts, nationOpts };
  }, [w]);

  const persist = async (next: CustomDb, note?: string) => {
    setDb(next);
    await saveDb(next);
    if (note) { setMsg(note); setTimeout(() => setMsg(''), 2500); }
  };

  if (!w || !idx) return <Panel title={db.name}><div className="muted">{t('start.loadingDb')}</div></Panel>;
  const { F, rows, clubs, clubOpts, nationOpts } = idx;
  const start = `${w.season}-07-01`;
  const age = (dob: string) => { const a = Number(start.slice(0, 4)) - Number(dob.slice(0, 4)); return start.slice(5) < dob.slice(5) ? a - 1 : a; };

  const baseEff = (id: number): Eff | null => {
    const r = rows.get(id);
    if (!r) return null;
    const rt: CMRatings | undefined = w.ratings?.[id];
    return {
      first: String(r[F.first] ?? ''), last: String(r[F.last] ?? ''), dob: String(r[F.dob] ?? ''), nation: Number(r[F.nation]), club: Number(r[F.club]) || 0,
      foot: (r[F.foot] as Eff['foot']) || 'R', ca: rt?.ca ?? 100, pa: rt?.paRaw ?? rt?.pa ?? 100, attrs: rt?.attrs.slice() ?? new Array(ATTRS.length).fill(0),
      pos: rt?.pos.slice() ?? [1, 1, 1, 1, 15, 1, 1, 1], side: rt?.side.slice() ?? [1, 20, 1], contract: String(r[F.contract] ?? ''), number: Number(r[F.number] ?? 0),
    };
  };
  const merge = (b: Eff, e: PlayerEdit): Eff => {
    const attrs = b.attrs.slice();
    for (const [i, v] of Object.entries(e.attrs ?? {})) attrs[Number(i)] = v;
    return { ...b, ...Object.fromEntries(Object.entries(e).filter(([k]) => k !== 'attrs')), attrs } as Eff;
  };
  const added = (id: number) => db.added.find((a) => a.id === id);
  const eff = (id: number): Eff | null => {
    const a = added(id);
    if (a) return merge({ first: '', last: '', dob: a.dob, nation: a.nation, club: a.club, foot: 'R', ca: a.ca, pa: a.pa, attrs: new Array(ATTRS.length).fill(0), pos: [1, 1, 1, 1, 15, 1, 1, 1], side: [1, 20, 1], contract: '', number: 0 }, a);
    const b = baseEff(id);
    return b && (db.players[id] ? merge(b, db.players[id]) : b);
  };
  const clubName = (id: number) => (id ? String(db.clubs[id]?.name ?? clubs.get(id)?.[1] ?? '?') : t('ed.freeAgent'));

  // søgning: navn (mindst 2 tegn) og/eller klub
  const results = (() => {
    const nq = norm(q.trim());
    if (tab === 'players') {
      if (nq.length < 2 && !clubFilter) return [];
      const ids = [...db.added.map((a) => a.id), ...rows.keys()];
      const out: number[] = [];
      for (const id of ids) {
        const e = eff(id);
        if (!e) continue;
        if (clubFilter && e.club !== clubFilter) continue;
        if (nq.length >= 2 && !norm(`${e.first} ${e.last}`).includes(nq)) continue;
        out.push(id);
        if (out.length >= 150) break;
      }
      return out;
    }
    if (tab === 'clubs') {
      if (nq.length < 2) return [];
      return w.clubs.filter((c) => norm(`${clubName(c[0])} ${c[2]}`).includes(nq)).slice(0, 100).map((c) => c[0]);
    }
    return [];
  })();


  const newPlayer = async () => {
    const id = Math.max(NEW_ID0, ...db.added.map((a) => a.id)) + 1;
    const p: NewPlayer = { id, first: t('ed.newFirst'), last: t('ed.newLast'), dob: `${w.season - 18}-01-01`, nation: w.clubs.find((c) => c[0] === clubFilter)?.[3] ?? 0, club: clubFilter, ca: 80, pa: 150 };
    await persist({ ...db, added: [...db.added, p] });
    setSel({ kind: 'player', id });
  };

  const savePlayer = async (id: number, e: Eff) => {
    const a = added(id);
    if (a) {
      const next: NewPlayer = { ...a, ...e, id, attrs: Object.fromEntries(e.attrs.map((v, i) => [i, v]).filter(([, v]) => v > 0)) };
      await persist({ ...db, added: db.added.map((x) => (x.id === id ? next : x)) }, t('ed.saved'));
      return;
    }
    const b = baseEff(id)!;
    const d: PlayerEdit = {};
    for (const k of ['first', 'last', 'dob', 'nation', 'club', 'foot', 'ca', 'pa', 'contract', 'number'] as const) if (e[k] !== b[k]) (d as Record<string, unknown>)[k] = e[k];
    const attrs: Record<number, number> = {};
    e.attrs.forEach((v, i) => { if (v !== b.attrs[i] && v > 0) attrs[i] = v; });
    if (Object.keys(attrs).length) d.attrs = attrs;
    if (e.pos.some((v, i) => v !== b.pos[i])) d.pos = e.pos;
    if (e.side.some((v, i) => v !== b.side[i])) d.side = e.side;
    const players = { ...db.players };
    if (Object.keys(d).length) players[id] = d; else delete players[id];
    await persist({ ...db, players }, t('ed.saved'));
  };
  const revertPlayer = async (id: number) => {
    const players = { ...db.players };
    delete players[id];
    await persist({ ...db, players, added: db.added.filter((a) => a.id !== id) });
    if (sel?.id === id) setSel(null);
  };
  const saveClub = async (id: number, e: ClubEdit) => {
    const c = clubs.get(id)!;
    const d: ClubEdit = Object.fromEntries(Object.entries(e).filter(([, v]) => v !== undefined)) as ClubEdit;
    if (d.name === c[1]) delete d.name;
    if (d.short === c[2]) delete d.short;
    if (d.stadium === c[5]) delete d.stadium;
    if (d.seats === c[6]) delete d.seats;
    if (d.rep === w.clubRep?.[id]) delete d.rep;
    const bc = w.clubColors?.[id];
    if (d.colors && bc && d.colors[0] === bc[0] && d.colors[1] === bc[1]) delete d.colors;
    const next = { ...db.clubs };
    if (Object.keys(d).length) next[id] = d; else delete next[id];
    await persist({ ...db, clubs: next }, t('ed.saved'));
  };
  const revertClub = async (id: number) => {
    const next = { ...db.clubs };
    delete next[id];
    await persist({ ...db, clubs: next });
  };

  const rename = async () => {
    const n = prompt(t('ed.rename'), db.name);
    if (n && n.trim()) await persist({ ...db, name: n.trim().slice(0, 60) });
  };

  const editing = sel?.kind === 'player' ? eff(sel.id) : null;
  return (
    <Panel title={<span>{db.name} <button className="small" onClick={() => void rename()} title={t('ed.rename')}>✎</button></span>} right={
      <div className="row">
        {msg && <span className="good">{msg}</span>}
        <button className="small" onClick={() => exportDb(db)}>{t('ed.export')}</button>
        <button className="small primary" onClick={onPlay}>{t('ed.play')}</button>
        <button className="small" onClick={onClose}>{t('common.back')}</button>
      </div>
    }>
      <div className="col">
        <div className="muted">{db.base === 'original' ? t('db.original') : t('db.modern')} · {t('ed.changes', { n: changeCount(db) })}</div>
        <Tabs tabs={[['players', t('ed.players')], ['clubs', t('ed.clubs')], ['changes', t('ed.changesTab')]]} value={tab} onChange={(v) => { setTab(v as typeof tab); setSel(null); }} />
        {tab !== 'changes' && !sel && (
          <div className="row">
            <input className="grow" autoFocus placeholder={tab === 'players' ? t('ed.searchPlayer') : t('ed.searchClub')} value={q} onChange={(e) => setQ(e.target.value)} />
            {tab === 'players' && <Select value={clubFilter} onChange={setClubFilter} options={[{ value: 0, label: t('ed.anyClub') }, ...clubOpts.slice(1)]} width={220} />}
            {tab === 'players' && <button className="small" onClick={() => void newPlayer()}>+ {t('ed.newPlayer')}</button>}
          </div>
        )}
        {tab === 'players' && !sel && results.length > 0 && (
          <div className="ed-scroll"><table className="grid"><thead><tr><th>{t('ed.name')}</th><th>{t('ed.club')}</th><th className="num">{t('ed.age')}</th><th>{t('ed.pos')}</th><th className="num">CA</th><th className="num">PA</th></tr></thead>
            <tbody>{results.map((id) => { const e = eff(id)!; const changed = !!db.players[id] || !!added(id); return (
              <tr key={id} className="clickable" onClick={() => setSel({ kind: 'player', id })}>
                <td>{changed && <span className="accent">● </span>}{e.first} {e.last}</td><td>{clubName(e.club)}</td><td className="num">{age(e.dob)}</td>
                <td>{String(rows.get(id)?.[F.pos] ?? '')}</td><td className="num">{e.ca}</td><td className="num">{e.pa < 0 ? `${e.pa}` : e.pa}</td>
              </tr>); })}</tbody></table></div>
        )}
        {tab === 'players' && !sel && q.trim().length >= 2 && results.length === 0 && <div className="muted">{t('ed.noHits')}</div>}
        {tab === 'clubs' && !sel && results.length > 0 && (
          <table className="grid"><thead><tr><th>{t('ed.name')}</th><th>{t('ed.nation')}</th><th>{t('ed.stadium')}</th></tr></thead>
            <tbody>{results.map((id) => { const c = clubs.get(id)!; return (
              <tr key={id} className="clickable" onClick={() => setSel({ kind: 'club', id })}>
                <td>{db.clubs[id] && <span className="accent">● </span>}{clubName(id)}</td><td>{natName(w.nations[c[3]]?.name)}</td><td>{db.clubs[id]?.stadium ?? c[5]}</td>
              </tr>); })}</tbody></table>
        )}
        {sel?.kind === 'player' && editing && (
          <PlayerForm key={sel.id} value={editing} isNew={!!added(sel.id)} clubOpts={clubOpts} nationOpts={nationOpts} season={w.season}
            onSave={(e) => void savePlayer(sel.id, e)} onRevert={() => void revertPlayer(sel.id)} onClose={() => setSel(null)} />
        )}
        {sel?.kind === 'club' && clubs.get(sel.id) && (
          <ClubForm key={sel.id} value={{
            name: clubName(sel.id), short: String(db.clubs[sel.id]?.short ?? clubs.get(sel.id)![2]), stadium: String(db.clubs[sel.id]?.stadium ?? clubs.get(sel.id)![5]),
            seats: Number(db.clubs[sel.id]?.seats ?? clubs.get(sel.id)![6]), rep: db.clubs[sel.id]?.rep ?? w.clubRep?.[sel.id] ?? 30,
            colors: db.clubs[sel.id]?.colors ?? w.clubColors?.[sel.id] ?? ['#ffffff', '#000000'], balance: db.clubs[sel.id]?.balance,
          }} onSave={(e) => void saveClub(sel.id, e)} onRevert={() => void revertClub(sel.id)} onClose={() => setSel(null)} />
        )}
        {tab === 'changes' && (
          <div className="col">
            {changeCount(db) === 0 && <div className="muted">{t('ed.noChanges')}</div>}
            {[...db.added.map((a) => a.id), ...Object.keys(db.players).map(Number)].map((id) => { const e = eff(id); return e && (
              <div key={`p${id}`} className="choice">
                <div className="grow" onClick={() => { setTab('players'); setSel({ kind: 'player', id }); }}>
                  <b>{e.first} {e.last}</b> <span className="muted">— {added(id) ? t('ed.added') : t('ed.edited')} · {clubName(e.club)}</span>
                </div>
                <button className="small danger" onClick={() => void revertPlayer(id)}>{added(id) ? t('common.delete') : t('ed.revert')}</button>
              </div>); })}
            {Object.keys(db.clubs).map(Number).filter((id) => clubs.has(id)).map((id) => (
              <div key={`c${id}`} className="choice">
                <div className="grow" onClick={() => { setTab('clubs'); setSel({ kind: 'club', id }); }}><b>{clubName(id)}</b> <span className="muted">— {t('ed.clubEdited')}</span></div>
                <button className="small danger" onClick={() => void revertClub(id)}>{t('ed.revert')}</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Panel>
  );
}

// ---------- formularer ----------

const num = (s: string, lo: number, hi: number) => Math.max(lo, Math.min(hi, Math.round(Number(s) || 0)));

function PlayerForm({ value, isNew, clubOpts, nationOpts, season, onSave, onRevert, onClose }: {
  value: Eff; isNew: boolean; clubOpts: { value: number; label: string; flag?: string }[]; nationOpts: { value: number; label: string; flag?: string }[]; season: number;
  onSave: (e: Eff) => void; onRevert: () => void; onClose: () => void;
}) {
  const [e, setE] = useState<Eff>(value);
  const up = (p: Partial<Eff>) => setE((x) => ({ ...x, ...p }));
  const paMode = e.pa === -1 || e.pa === -2 ? String(e.pa) : 'fixed';
  const attr = (i: number) => (
    <label key={i} className="ed-attr">
      <span>{t(`attr.${ATTRS[i]}`)}</span>
      <input type="number" min={1} max={20} value={e.attrs[i] || ''} placeholder="–" onChange={(ev) => { const a = e.attrs.slice(); a[i] = ev.target.value === '' ? 0 : num(ev.target.value, 1, 20); up({ attrs: a }); }} />
    </label>
  );
  return (
    <div className="col ed-form">
      <div className="row">
        <b className="grow">{e.first} {e.last}</b>
        <button className="small primary" onClick={() => onSave(e)}>{t('ed.save')}</button>
        <button className="small danger" onClick={onRevert}>{isNew ? t('common.delete') : t('ed.revert')}</button>
        <button className="small" onClick={onClose}>{t('common.close')}</button>
      </div>
      <h4>{t('ed.personal')}</h4>
      <div className="ed-grid">
        <label><span>{t('ed.first')}</span><input value={e.first} maxLength={60} onChange={(ev) => up({ first: ev.target.value })} /></label>
        <label><span>{t('ed.last')}</span><input value={e.last} maxLength={60} onChange={(ev) => up({ last: ev.target.value })} /></label>
        <label><span>{t('ed.dob')}</span><input type="date" value={e.dob} min={`${season - 45}-01-01`} max={`${season - 14}-12-31`} onChange={(ev) => ev.target.value && up({ dob: ev.target.value })} /></label>
        <label><span>{t('ed.nation')}</span><Select value={e.nation} onChange={(v) => up({ nation: v })} options={nationOpts} /></label>
        <label><span>{t('ed.club')}</span><Select value={e.club} onChange={(v) => up({ club: v })} options={clubOpts} /></label>
        <label><span>{t('ed.foot')}</span>
          <select value={e.foot} onChange={(ev) => up({ foot: ev.target.value as Eff['foot'] })}>
            <option value="R">{t('ed.footR')}</option><option value="L">{t('ed.footL')}</option><option value="B">{t('ed.footB')}</option>
          </select></label>
        <label><span>{t('ed.contract')}</span><input type="date" value={e.contract} onChange={(ev) => up({ contract: ev.target.value })} /></label>
        <label><span>{t('ed.number')}</span><input type="number" min={0} max={99} value={e.number || ''} placeholder="–" onChange={(ev) => up({ number: num(ev.target.value, 0, 99) })} /></label>
      </div>
      <h4>{t('ed.ability')}</h4>
      <div className="ed-grid">
        <label><span>{t('ed.ca')} (1-200)</span><input type="number" min={1} max={200} value={e.ca} onChange={(ev) => up({ ca: num(ev.target.value, 1, 200) })} /></label>
        <label><span>{t('ed.pa')}</span>
          <select value={paMode} onChange={(ev) => up({ pa: ev.target.value === 'fixed' ? Math.max(e.ca, 150) : Number(ev.target.value) })}>
            <option value="fixed">{t('ed.paFixed')}</option><option value="-1">{t('ed.paRandom1')}</option><option value="-2">{t('ed.paRandom2')}</option>
          </select></label>
        {paMode === 'fixed' && <label><span>PA (1-200)</span><input type="number" min={1} max={200} value={e.pa} onChange={(ev) => up({ pa: num(ev.target.value, 1, 200) })} /></label>}
      </div>
      <h4>{t('ed.positions')}</h4>
      <div className="ed-grid ed-pos">
        {POS_KEYS.map((k, i) => (
          <label key={k}><span>{t(`ed.p.${k}`)}</span><input type="number" min={1} max={20} value={e.pos[i]} onChange={(ev) => { const p = e.pos.slice(); p[i] = num(ev.target.value, 1, 20); up({ pos: p }); }} /></label>
        ))}
        {SIDE_KEYS.map((k, i) => (
          <label key={k}><span>{t(`ed.s.${k}`)}</span><input type="number" min={1} max={20} value={e.side[i]} onChange={(ev) => { const s = e.side.slice(); s[i] = num(ev.target.value, 1, 20); up({ side: s }); }} /></label>
        ))}
      </div>
      <div className="muted">{t('ed.attrHint')}</div>
      {(Object.keys(GROUPS) as (keyof typeof GROUPS)[]).map((g) => (
        <div key={g}>
          <h4>{t(`group.${g}`)}</h4>
          <div className="ed-grid ed-attrs">{GROUPS[g].map((k) => attr(A[k]))}</div>
        </div>
      ))}
      <div className="row"><span className="grow" /><button className="primary" onClick={() => onSave(e)}>{t('ed.save')}</button></div>
    </div>
  );
}

function ClubForm({ value, onSave, onRevert, onClose }: { value: Required<Omit<ClubEdit, 'balance'>> & { balance?: number }; onSave: (e: ClubEdit) => void; onRevert: () => void; onClose: () => void }) {
  const [e, setE] = useState(value);
  const up = (p: Partial<typeof e>) => setE((x) => ({ ...x, ...p }));
  return (
    <div className="col ed-form">
      <div className="row">
        <b className="grow">{e.name}</b>
        <button className="small primary" onClick={() => onSave(e)}>{t('ed.save')}</button>
        <button className="small danger" onClick={onRevert}>{t('ed.revert')}</button>
        <button className="small" onClick={onClose}>{t('common.close')}</button>
      </div>
      <div className="ed-grid">
        <label><span>{t('ed.name')}</span><input value={e.name} maxLength={60} onChange={(ev) => up({ name: ev.target.value })} /></label>
        <label><span>{t('ed.short')}</span><input value={e.short} maxLength={30} onChange={(ev) => up({ short: ev.target.value })} /></label>
        <label><span>{t('ed.stadium')}</span><input value={e.stadium} maxLength={60} onChange={(ev) => up({ stadium: ev.target.value })} /></label>
        <label><span>{t('ed.seats')}</span><input type="number" min={500} max={120000} value={e.seats} onChange={(ev) => up({ seats: num(ev.target.value, 500, 120_000) })} /></label>
        <label><span>{t('ed.rep')} (1-98)</span><input type="number" min={1} max={98} value={e.rep} onChange={(ev) => up({ rep: num(ev.target.value, 1, 98) })} /></label>
        <label><span>{t('ed.colors')}</span><span className="row">
          <input type="color" value={e.colors[0]} onChange={(ev) => up({ colors: [ev.target.value, e.colors[1]] })} />
          <input type="color" value={e.colors[1]} onChange={(ev) => up({ colors: [e.colors[0], ev.target.value] })} />
        </span></label>
        <label><span>{t('ed.balance')}</span><input type="number" step={100000} value={e.balance ?? ''} placeholder={t('ed.auto')} onChange={(ev) => up({ balance: ev.target.value === '' ? undefined : Math.round(Number(ev.target.value)) })} /></label>
      </div>
    </div>
  );
}

