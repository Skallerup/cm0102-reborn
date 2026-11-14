// CM 01/02's træningsskærm (cm0102.exe 3.9.68, training_screens.cpp 0x8b5930) for den originale database i ægte tilstand.
//
// Titlen "{klub} Training" (0xa8d16c), ti faner "%s (%d)" (0xa8d164) = menneskets ti skemapladser (0x8b3d40: Overview, No Training, General,
// Fitness, Shooting, Skill, Tactics, Gk, Unused, Unused) – fem øverst og fem nederst, værktøjslinjen Schedule ▾ (Load/Save/Save As/Delete + de
// gemte skemaer "%d. %s", grå på Overview), View ▾ (General; Attributes: Physical/Mental/Goalkeeping/Defensive/Attacking – tabellerne
// 0xa8d08c…0xa8d0c8), Coaches (på Overview) / Edit (på et skema, grå på No Training), Filter ▾ (positioner og sider), spillertabellen (Inf, Name,
// Position, Age, Form, Morale, Cond., Value) med skemaet som blå knap, og Cancel/Ok i bundbjælken ("Changes have been made to the training.
// Cancel all changes ?"). Edit = 0x8b97e0: navnet og de fem områder × None/Light/Medium/Intensive (0/10/25/50). Coaches = 0x8ba920: assistenten
// og trænerne × de fem områder (0/1 – 0x8b2880 regner dem om til trænerværdier). Ændringerne gælder først ved Ok (training_edit_session.cpp).
import { useMemo, useState, type HTMLAttributes } from 'react';
import { act } from '../../game/actions';
import { ageOn } from '../../game/dates';
import { squad } from '../../game/state';
import { A } from '../../game/attributes';
import { CM_AREAS, CM_INTENSITIES, CM_SCHED_SLOTS, clubCoaches, newHumanSchedules, playerSlot, scheduleNameKey } from '../../game/cmTraining';
import type { CmSchedule, CoachArea, Player } from '../../game/types';
import { money, t } from '../../i18n';
import { ClassicFoot, ClassicSub, CxDrop, useClassicDialog, type DropItem } from '../classic';
import { Tabs, posStr } from '../components';
import { useGame, useNav, useRouteState } from '../core';
import { askConfirm, askNotice, askText } from '../confirm';
import { Head } from './common';
import { CxTable, type CxCol } from './CxTable';
import { posGroup } from './Training';
import { Tag, originalTag } from './SquadClassic';

// ------------------------------------------------------------------ gemte skemaer (.tsh)

/** originalen skriver skemaerne som .tsh-filer (0x8b53d0: header 0x6a bytes, +4..+8, navnet 12 bytes, +0x15, +0x16, +0x18 17 bytes) i spillets
 *  mappe; i browseren ligger de i localStorage (*estimeret* – kun niveauerne, navnet og typen; positionstræningen er ikke porteret) */
type TshFile = { t: number; n: string; lv: number[] };
const TSH_KEY = 'cm0102.tsh';
function tshFiles(): Record<string, TshFile> {
  try { const v = JSON.parse(localStorage.getItem(TSH_KEY) ?? '{}'); return v && typeof v === 'object' ? v : {}; } catch { return {}; }
}
function tshWrite(files: Record<string, TshFile>): boolean {
  try { localStorage.setItem(TSH_KEY, JSON.stringify(files)); return true; } catch { return false; }
}

// ------------------------------------------------------------------ View ▾: originalens egenskabstabeller (id → vores egenskab)

/** 0x5428a0's egenskabs-id'er (1 Acceleration … 31 Work Rate); "Set Pieces" = den bedste af frispark/hjørner/straffe (*estimeret*) */
const ATTR_ID: Record<number, string> = {
  1: 'acceleration', 2: 'aggression', 3: 'agility', 4: 'anticipation', 5: 'balance', 6: 'bravery', 7: 'creativity', 8: 'crossing', 9: 'decisions',
  10: 'determination', 11: 'dribbling', 12: 'finishing', 13: 'flair', 14: 'handling', 15: 'heading', 16: 'influence', 17: 'jumping', 18: 'longShots',
  19: 'marking', 20: 'offTheBall', 21: 'pace', 22: 'passing', 23: 'positioning', 24: 'reflexes', 25: 'setPieces', 26: 'stamina', 27: 'strength',
  28: 'tackling', 29: 'teamwork', 30: 'technique', 31: 'workRate',
};
/** 0xa8d08c (Physical), 0xa8d0bc (Mental – sic: Reflexes står i tabellen), 0xa8d098 (Goalkeeping), 0xa8d0a4 (Defensive), 0xa8d0b0 (Attacking);
 *  0x8b784f sorterer kolonnerne efter navn */
const VIEW_IDS: Record<string, number[]> = {
  phys: [1, 3, 5, 15, 17, 21, 26, 27, 30],
  ment: [2, 4, 6, 9, 10, 16, 24, 29, 31],
  gk: [1, 3, 14, 17, 21, 22, 23, 24, 27],
  def: [1, 15, 17, 19, 21, 23, 26, 27, 28],
  att: [7, 8, 11, 13, 20, 22, 25, 12, 18],
};
const attrLabel = (k: string) => (k === 'setPieces' ? t('cl.fl.setPieces') : t(`attr.${k}`));
const attrVal = (p: Player, k: string) => Math.round(k === 'setPieces' ? Math.max(p.attrs[A.freeKicks], p.attrs[A.corners], p.attrs[A.penalties]) : p.attrs[A[k as keyof typeof A]]);

const moraleShort = (m: number) => t(`morale.${m >= 16 ? 'superb' : m >= 13 ? 'good' : m >= 9 ? 'okay' : 'poor'}`);
const formAvg = (p: Player) => (p.form.length ? p.form.slice(-5).reduce((s, x) => s + x, 0) / Math.min(5, p.form.length) : 0);
/** side: +0x17 højre (side[2]), +0x18 venstre (side[0]), +0x19 midten (side[1]) – "sidet" ved 15+ (*estimeret*) */
const SIDE_OK: Record<string, (p: Player) => boolean> = { '': () => true, L: (p) => p.side[0] >= 15, C: (p) => p.side[1] >= 15, R: (p) => p.side[2] >= 15 };

export const schedName = (s: CmSchedule) => { const k = scheduleNameKey(s); return k.key ? t(k.key) : k.name ?? ''; };
const copy = (x: CmSchedule[]) => x.map((s) => ({ ...s, lv: [...s.lv] }));

export function CmTraining() {
  const g = useGame()!;
  const { nav, back } = useNav();
  const cid = g.userClub;
  const players = squad(cid).filter((p) => !p.virtual);
  const coaches = clubCoaches(g, cid);
  // redigeringen (training_edit_session.cpp): en kopi, der først skrives ved Ok
  const init = () => ({
    sched: copy(g.clubs[cid].cmSched ?? newHumanSchedules()),
    slot: Object.fromEntries(players.map((p) => [p.id, playerSlot(g, p)])) as Record<number, number>,
    areas: Object.fromEntries(coaches.map((c) => [c.id, c.coachAreas ? [...c.coachAreas] : undefined])) as Record<number, CoachArea[] | undefined>,
    unsaved: [] as number[],
  });
  const [d, setD] = useState(init);
  const [changed, setChanged] = useState(false);
  const [tabS, setTab] = useRouteState('ctab', '0');
  const tab = Math.max(0, Math.min(CM_SCHED_SLOTS - 1, Number(tabS) || 0));
  const [view, setView] = useRouteState('cview', 'gen');
  const [pos, setPos] = useRouteState('cpos', '');
  const [side, setSide] = useRouteState('cside', '');
  const [dlg, setDlg] = useState<null | 'edit' | 'coaches' | 'load' | 'delete'>(null);
  const [, bump] = useState(0);
  const cur = d.sched[tab];
  const upd = (f: (x: typeof d) => typeof d) => { setD((x) => f(x)); setChanged(true); };

  const count = (k: number) => players.filter((p) => d.slot[p.id] === k).length;
  const label = (k: number) => {
    const s = d.sched[k];
    return s.t < 0 || s.t === 7 ? schedName(s) : `${schedName(s)} (${count(k)})`;
  };
  const move = (k: number, data: string) => {
    const id = Number(data);
    if (k > 0 && id && d.slot[id] !== undefined) upd((x) => ({ ...x, slot: { ...x.slot, [id]: k } }));
  };
  const rows = players.filter((p) => (tab === 0 || d.slot[p.id] === tab) && (!pos || posGroup(p) === pos) && SIDE_OK[side](p));

  // ---------------------------------------------------------------- Schedule ▾ (0x8b5f9c …)
  const files = tshFiles();
  const names = Object.keys(files).sort((a, b) => a.localeCompare(b));
  const loadFile = async (file: string) => {
    const f = files[file];
    if (!f) { await askNotice(t('cl.ts.notLoaded', { file }), { head: t('cl.ts.unableLoad') }); return; }
    if (d.unsaved.includes(tab) && !(await askConfirm(t('cl.ts.notSaved', { name: schedName(cur) }), { title: t('cl.ts.notSavedHead') }))) return;
    upd((x) => {
      const sched = copy(x.sched);
      sched[tab] = { t: f.t >= 0 && f.t <= 8 ? f.t : 8, n: String(f.n ?? '').slice(0, 11), lv: [0, 1, 2, 3, 4].map((i) => ((CM_INTENSITIES as readonly number[]).includes(f.lv?.[i]) ? f.lv[i] : 0)), f: file };
      return { ...x, sched, unsaved: x.unsaved.filter((k) => k !== tab) };
    });
  };
  const saveTo = (file: string) => {
    const all = tshFiles();
    all[file] = { t: cur.t, n: cur.n, lv: [...cur.lv] };
    if (!tshWrite(all)) { void askNotice(t('cl.ts.saveHead')); return; }
    upd((x) => { const sched = copy(x.sched); sched[tab] = { ...sched[tab], f: file }; return { ...x, sched, unsaved: x.unsaved.filter((k) => k !== tab) }; });
    bump((n) => n + 1);
  };
  const saveAs = async () => {
    const v = await askText(t('cl.ts.enterFile'), cur.f ?? schedName(cur), { head: t('cl.ts.saveHead') });
    if (v) saveTo(v.replace(/\.tsh$/i, '').slice(0, 40));
  };
  const schedMenu: DropItem[] = [
    { key: 'load', label: t('cl.ts.load'), onClick: () => setDlg('load') },
    { key: 'save', label: t('cl.ts.save'), disabled: !cur.f, onClick: () => cur.f && saveTo(cur.f) },
    { key: 'saveAs', label: t('cl.ts.saveAs'), disabled: cur.t === 7, onClick: () => void saveAs() },
    { key: 'delete', label: t('cl.ts.delete'), disabled: !names.length, onClick: () => setDlg('delete') },
    ...(names.length ? [{ key: 'sep', sep: true as const }] : []),
    ...names.map((n, i) => ({ key: `f${n}`, label: `${i + 1}. ${n}`, onClick: () => void loadFile(n) })),
  ];

  // ---------------------------------------------------------------- View ▾ og Filter ▾
  const viewMenu: DropItem[] = [
    { key: 'gen', label: t('cl.ts.vGeneral'), checked: view === 'gen', onClick: () => setView('gen') },
    { key: 'h', head: t('cl.ts.vAttr') },
    ...(['phys', 'ment', 'gk', 'def', 'att'] as const).map((k) => ({ key: k, label: t(`cl.ts.v${k === 'phys' ? 'Phys' : k === 'ment' ? 'Ment' : k === 'gk' ? 'Gk' : k === 'def' ? 'Def' : 'Att'}`), checked: view === k, onClick: () => setView(k) })),
  ];
  const filterMenu: DropItem[] = [
    ...([['', 'fAll'], ['gk', 'fGk'], ['def', 'fDef'], ['mid', 'fMid'], ['att', 'fAtt']] as const).map(([k, l]) => ({ key: `p${k}`, label: t(`cl.ts.${l}`), checked: pos === k, onClick: () => setPos(k) })),
    { key: 's', sep: true },
    ...([['', 'sAll'], ['L', 'sL'], ['C', 'sC'], ['R', 'sR']] as const).map(([k, l]) => ({ key: `s${k}`, label: t(`cl.ts.${l}`), checked: side === k, onClick: () => setSide(k) })),
  ];

  const name: CxCol<Player> = { key: 'name', label: t('cl.ts.name'), cls: 'c-name', render: (p) => <span className="link" onClick={() => nav({ name: 'player', id: p.id })}>{p.last}{p.first ? `, ${p.first}` : ''}</span>, sort: (p) => `${p.last} ${p.first}` };
  const inf: CxCol<Player> = { key: 'inf', label: t('cl.tn.inf'), render: (p) => <Tag p={p} tag={originalTag(p)} /> };
  const value: CxCol<Player> = { key: 'val', label: t('col.value'), cls: 'c-val', render: (p) => money(p.value), sort: (p) => p.value };
  const cols: CxCol<Player>[] = view === 'gen' ? [inf, name,
    { key: 'pos', label: t('cl.ts.position'), cls: 'c-cyan', render: (p) => posStr(p), sort: (p) => -p.pos.indexOf(Math.max(...p.pos)) },
    { key: 'age', label: t('col.age'), cls: 'c-num c-yel', render: (p) => ageOn(p.dob, g.date), sort: (p) => ageOn(p.dob, g.date) },
    { key: 'form', label: t('col.form'), cls: 'c-num c-yel', render: (p) => (p.form.length ? p.form.slice(-5).map((x) => Math.round(x)).join('-') : '-'), sort: formAvg },
    { key: 'mor', label: t('col.morale'), cls: 'c-num', render: (p) => <span className={`cx-mor m${p.morale >= 16 ? 4 : p.morale >= 13 ? 3 : p.morale >= 9 ? 2 : 1}`}>{moraleShort(p.morale)}</span>, sort: (p) => p.morale },
    { key: 'cond', label: t('col.cond'), cls: 'c-num', render: (p) => (p.injury ? <span className="cx-mor m1">{t('tag.inj')}</span> : <span className={p.condition >= 90 ? 'c-good' : 'cx-mor m2'}>{Math.round(p.condition)}%</span>), sort: (p) => p.condition },
    value]
    : [inf, name, ...(VIEW_IDS[view] ?? VIEW_IDS.phys).map((id) => ATTR_ID[id]).sort((a, b) => attrLabel(a).localeCompare(attrLabel(b)))
      .map((k): CxCol<Player> => ({ key: k, label: attrLabel(k).slice(0, 3), title: attrLabel(k), cls: 'c-num', render: (p) => attrVal(p, k), sort: (p) => attrVal(p, k) })), value];

  const rowMenu = (p: Player): DropItem[] => d.sched.map((s, k) => ({ k, s })).filter(({ k, s }) => k > 0 && s.t !== 7)
    .map(({ k, s }) => ({ key: String(k), label: schedName(s), checked: d.slot[p.id] === k, onClick: () => move(k, String(p.id)) }));

  const cancel = async () => {
    if (changed && !(await askConfirm(t('cl.ts.changes'), { title: t('cl.ts.changesHead') }))) return;
    setD(init()); setChanged(false); back();
  };
  const ok = () => {
    act({ t: 'cmTraining', sched: d.sched, assign: Object.entries(d.slot).map(([id, s]) => [Number(id), s]),
      coaches: coaches.map((c): [number, CoachArea[] | null] => { const a = d.areas[c.id]; return [c.id, a && a.length < CM_AREAS.length ? a : null]; }) });
    setChanged(false);
    back();
  };

  const tabs = (from: number) => Array.from({ length: 5 }, (_, i) => from + i);
  return (
    <div className="cx-tn cx-mt">
      <Head title={t('nav.training')}>
        <CxDrop label={t('cl.ts.schedule')} items={schedMenu} btn={{ disabled: tab === 0, className: 'cx-ts-sched' }} />
        <CxDrop label={t('cl.ts.view')} items={viewMenu} />
        <span className="grow" />
        {tab === 0
          ? <button className="cx-greybtn cx-ts-coaches" onClick={() => setDlg('coaches')}>{t('cl.tn.coaches')}</button>
          : <button className="cx-greybtn cx-ts-edit" disabled={cur.t === 0} onClick={() => setDlg('edit')}>{t('cl.ts.edit')}</button>}
        <CxDrop label={t('cl.ts.filter')} align="right" items={filterMenu} />
      </Head>
      <Tabs tabs={tabs(0).map((k) => [String(k), label(k)] as [string, string])} value={String(tab)} onChange={(k) => setTab(k)} onDropTab={(k, data) => move(Number(k), data)} />
      <ClassicSub items={tabs(5).map((k) => ({ key: String(k), label: label(k), on: tab === k, onClick: () => setTab(String(k)), onDrop: (data: string) => move(k, data) }))} />
      <CxTable rows={rows} cols={cols} rowKey={(p) => p.id} initialSort={view === 'gen' ? 'pos' : undefined}
        rowAttrs={(p) => ({ draggable: true, 'data-pid': p.id, onDragStart: (e) => { e.dataTransfer.setData('text/plain', String(p.id)); e.dataTransfer.effectAllowed = 'move'; } } as HTMLAttributes<HTMLTableRowElement>)}
        btn={(p) => <CxDrop className="cx-sel cx-ts-row" caret={false} fixed label={schedName(d.sched[d.slot[p.id] ?? 1])} items={rowMenu(p)} btn={{ className: 'cx-rowbtn' }} />} />
      <ClassicFoot cols="3fr 1fr">
        <button className="cx-ts-cancel" onClick={() => void cancel()}>{t('common.cancel')}</button>
        <button className="primary cx-ts-ok" onClick={ok}>{t('common.ok')}</button>
      </ClassicFoot>
      {dlg === 'edit' && <EditSchedule s={cur} onClose={() => setDlg(null)}
        onOk={(s) => { upd((x) => { const sched = copy(x.sched); sched[tab] = s; return { ...x, sched, unsaved: x.unsaved.includes(tab) ? x.unsaved : [...x.unsaved, tab] }; }); setDlg(null); }} />}
      {dlg === 'coaches' && <CoachesDialog ids={coaches.map((c) => c.id)} areas={d.areas} onClose={() => setDlg(null)}
        onOk={(areas) => { upd((x) => ({ ...x, areas })); setDlg(null); }} />}
      {(dlg === 'load' || dlg === 'delete') && <FileDialog head={t(dlg === 'load' ? 'cl.ts.loadHead' : 'cl.ts.deleteHead')} names={names} onClose={() => setDlg(null)}
        onPick={async (n) => {
          setDlg(null);
          if (dlg === 'load') { await loadFile(n); return; }
          if (!(await askConfirm(t('cl.ts.deleteQ', { file: n }), { title: t('cl.ts.deleteHead'), danger: true }))) return;
          const all = tshFiles(); delete all[n]; tshWrite(all); bump((x) => x + 1);
        }} />}
    </div>
  );
}

/** 0x8b97e0: " Name" og de fem områder × None/Light/Medium/Intensive (det valgte gult); et Unused-skema starter uden navn (0x8b9a26), og et
 *  redigeret navn/Unused bliver et eget skema (type 8, 0x8ba6ff – hvornår præcis er *estimeret*). New Position/New Side (positionstræningen
 *  0x8b9fd9–0x8ba330) er ikke porteret. */
function EditSchedule({ s, onClose, onOk }: { s: CmSchedule; onClose: () => void; onOk: (s: CmSchedule) => void }) {
  useClassicDialog();
  const [lv, setLv] = useState([...s.lv]);
  const [nm, setNm] = useState(s.t === 7 ? '' : schedName(s));
  const ok = () => {
    const renamed = nm.trim() !== schedName(s);
    onOk({ ...s, lv, t: s.t === 7 || renamed ? 8 : s.t, n: s.t === 7 || renamed ? nm.trim().slice(0, 11) : s.n });
  };
  return (
    <div className="cx-tidlg cx-ts-dlg" role="dialog">
      <div className="cx-tidlg-head">{s.t === 7 ? t('cl.ts.t7') : schedName(s)}</div>
      <div className="cx-tidlg-grid">
        <div className="cx-tidlg-row">
          <span className="cx-tidlg-lbl">{t('cl.ts.name')}</span>
          <input className="cx-ts-name" maxLength={11} value={nm} onChange={(e) => setNm(e.target.value)} style={{ gridColumn: '2 / span 4' }} />
        </div>
        {CM_AREAS.map((a, k) => (
          <div key={a} className="cx-tidlg-row">
            <span className="cx-tidlg-lbl">{t(`cl.coach.${a}`)}</span>
            {CM_INTENSITIES.map((v) => <button key={v} className={`cx-tich ${lv[k] === v ? 'on' : ''}`} data-area={k} data-lv={v}
              onClick={() => setLv((x) => x.map((y, i) => (i === k ? v : y)))}>{t(`cl.ts.i${v}`)}</button>)}
          </div>
        ))}
      </div>
      <div className="cx-ts-buttons cx-tidlg-foot"><button onClick={onClose}>{t('common.cancel')}</button><button className="primary cx-ts-editok" onClick={ok}>{t('common.ok')}</button></div>
    </div>
  );
}

/** 0x8ba920: assistenten og trænerne (højst seks pladser, 0x8b2880) × de fem områder (0 eller 1 pr. felt; nye trænere står på alle fem) */
function CoachesDialog({ ids, areas, onClose, onOk }: { ids: number[]; areas: Record<number, CoachArea[] | undefined>; onClose: () => void; onOk: (a: Record<number, CoachArea[] | undefined>) => void }) {
  const g = useGame()!;
  useClassicDialog();
  const [sel, setSel] = useState(() => Object.fromEntries(ids.map((id) => [id, areas[id] ?? [...CM_AREAS]])) as Record<number, CoachArea[]>);
  const toggle = (id: number, a: CoachArea) => setSel((x) => ({ ...x, [id]: x[id].includes(a) ? x[id].filter((y) => y !== a) : [...x[id], a] }));
  const staff = useMemo(() => ids.map((id) => g.staff[id]).filter(Boolean), [ids, g.staff]);
  return (
    <div className="cx-tidlg cx-coaches" role="dialog">
      <div className="cx-tidlg-head">{t('cl.tn.coaches')}</div>
      <div className="cx-coach-grid">
        {staff.map((c) => (
          <div key={c.id} className="cx-coach-row">
            <span className="cx-coach-name">{c.first} {c.last}</span>
            {CM_AREAS.map((a) => <button key={a} className={`cx-tich ${sel[c.id].includes(a) ? 'on' : ''}`} onClick={() => toggle(c.id, a)}>{t(`cl.coach.${a}`)}</button>)}
          </div>
        ))}
        {!staff.length && <div className="cx-empty">{t('common.none')}</div>}
      </div>
      <div className="cx-ts-buttons cx-tidlg-foot"><button onClick={onClose}>{t('common.cancel')}</button>
        <button className="primary" onClick={() => onOk(Object.fromEntries(ids.map((id) => [id, sel[id]?.length === CM_AREAS.length ? undefined : sel[id]])))}>{t('common.ok')}</button></div>
    </div>
  );
}

/** "Select File" (Load/Delete Training Schedule) */
function FileDialog({ head, names, onClose, onPick }: { head: string; names: string[]; onClose: () => void; onPick: (n: string) => void }) {
  useClassicDialog();
  return (
    <div className="cx-tidlg cx-ts-files" role="dialog">
      <div className="cx-tidlg-head">{head}</div>
      <div className="cx-tidlg-grid">
        <div className="cx-tidlg-lbl">{t('cl.ts.selectFile')}</div>
        {names.length ? names.map((n) => <button key={n} className="cx-tich cx-ts-file" onClick={() => onPick(n)}>{n}.tsh</button>)
          : <div className="cx-empty">{t('cl.ts.noFiles')}</div>}
      </div>
      <div className="cx-ts-buttons cx-tidlg-foot"><button onClick={onClose}>{t('common.cancel')}</button></div>
    </div>
  );
}
