// Originalens træning (CM 01/02 training_screens.cpp, cmTraining.ts) i det moderne udseende: ti skemapladser (Overview, No Training, General, Fitness …), en spiller
// står på ét skema ad gangen, Edit (fem områder × None/Light/Medium/Intensive), Coaches (træner × område) og Ok/Cancel – ændringerne gælder først ved Ok.
import { useState } from 'react';
import { act } from '../../game/actions';
import { ageOn } from '../../game/dates';
import { squad } from '../../game/state';
import { CM_AREAS, CM_INTENSITIES, CM_SCHED_SLOTS, clubCoaches, newHumanSchedules, playerSlot } from '../../game/cmTraining';
import type { CmSchedule, CoachArea, Player } from '../../game/types';
import { t } from '../../i18n';
import { Modal, Panel, PlayerLink, Tabs, posStr } from '../components';
import { askConfirm } from '../confirm';
import { useGame, useNav, useRouteState } from '../core';
import { Head } from './common';
import { posGroup } from './Training';
import { schedName } from './TrainingCm';
import { originalTag } from './SquadClassic';

const copy = (x: CmSchedule[]) => x.map((s) => ({ ...s, lv: [...s.lv] }));

function EditSchedule({ s, onClose, onOk }: { s: CmSchedule; onClose: () => void; onOk: (s: CmSchedule) => void }) {
  const [lv, setLv] = useState([...s.lv]);
  const [nm, setNm] = useState(s.t === 7 ? '' : schedName(s));
  const ok = () => {
    const renamed = nm.trim() !== schedName(s);
    onOk({ ...s, lv, t: s.t === 7 || renamed ? 8 : s.t, n: s.t === 7 || renamed ? nm.trim().slice(0, 11) : s.n });
  };
  return (
    <Modal title={s.t === 7 ? t('cl.ts.t7') : schedName(s)} onClose={onClose}>
      <div className="col">
        <label className="row" style={{ gap: 8 }}><span style={{ minWidth: 110 }}>{t('cl.ts.name')}</span><input maxLength={11} value={nm} onChange={(e) => setNm(e.target.value)} /></label>
        {CM_AREAS.map((a, k) => (
          <div key={a} className="row" style={{ gap: 6, alignItems: 'center' }}>
            <span style={{ minWidth: 110 }}>{t(`cl.coach.${a}`)}</span>
            {CM_INTENSITIES.map((v) => <button key={v} className={`small ${lv[k] === v ? 'primary' : ''}`} onClick={() => setLv((x) => x.map((y, i) => (i === k ? v : y)))}>{t(`cl.ts.i${v}`)}</button>)}
          </div>
        ))}
        <div className="row" style={{ justifyContent: 'flex-end' }}><button onClick={onClose}>{t('common.cancel')}</button><button className="primary" onClick={ok}>{t('common.ok')}</button></div>
      </div>
    </Modal>
  );
}

function CoachesDialog({ ids, areas, onClose, onOk }: { ids: number[]; areas: Record<number, CoachArea[] | undefined>; onClose: () => void; onOk: (a: Record<number, CoachArea[] | undefined>) => void }) {
  const g = useGame()!;
  const [sel, setSel] = useState(() => Object.fromEntries(ids.map((id) => [id, areas[id] ?? [...CM_AREAS]])) as Record<number, CoachArea[]>);
  const toggle = (id: number, a: CoachArea) => setSel((x) => ({ ...x, [id]: x[id].includes(a) ? x[id].filter((y) => y !== a) : [...x[id], a] }));
  const staff = ids.map((id) => g.staff[id]).filter(Boolean);
  return (
    <Modal title={t('cl.tn.coaches')} onClose={onClose} wide>
      <div className="col">
        {staff.map((c) => (
          <div key={c.id} className="row" style={{ gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ minWidth: 170 }}>{c.first} {c.last}</span>
            {CM_AREAS.map((a) => <button key={a} className={`small ${sel[c.id].includes(a) ? 'primary' : ''}`} onClick={() => toggle(c.id, a)}>{t(`cl.coach.${a}`)}</button>)}
          </div>
        ))}
        {!staff.length && <div className="muted">{t('common.none')}</div>}
        <div className="row" style={{ justifyContent: 'flex-end' }}><button onClick={onClose}>{t('common.cancel')}</button>
          <button className="primary" onClick={() => onOk(Object.fromEntries(ids.map((id) => [id, sel[id]?.length === CM_AREAS.length ? undefined : sel[id]])))}>{t('common.ok')}</button></div>
      </div>
    </Modal>
  );
}

export function OrigTraining() {
  const g = useGame()!;
  const { back } = useNav();
  const cid = g.userClub;
  const players = squad(cid).filter((p) => !p.virtual);
  const coaches = clubCoaches(g, cid);
  const init = () => ({
    sched: copy(g.clubs[cid].cmSched ?? newHumanSchedules()),
    slot: Object.fromEntries(players.map((p) => [p.id, playerSlot(g, p)])) as Record<number, number>,
    areas: Object.fromEntries(coaches.map((c) => [c.id, c.coachAreas ? [...c.coachAreas] : undefined])) as Record<number, CoachArea[] | undefined>,
  });
  const [d, setD] = useState(init);
  const [changed, setChanged] = useState(false);
  const [tabS, setTab] = useRouteState('ctab', '0');
  const tab = Math.max(0, Math.min(CM_SCHED_SLOTS - 1, Number(tabS) || 0));
  const [pos, setPos] = useRouteState('cpos', '');
  const [dlg, setDlg] = useState<null | 'edit' | 'coaches'>(null);
  const cur = d.sched[tab];
  const upd = (f: (x: typeof d) => typeof d) => { setD((x) => f(x)); setChanged(true); };
  const count = (k: number) => players.filter((p) => d.slot[p.id] === k).length;
  const label = (k: number) => { const s = d.sched[k]; return s.t < 0 || s.t === 7 ? schedName(s) : `${schedName(s)} (${count(k)})`; };
  const rows = players.filter((p) => (tab === 0 || d.slot[p.id] === tab) && (!pos || posGroup(p) === pos)).sort((a, b) => b.ca - a.ca);
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
  const slots = d.sched.map((s, k) => ({ k, s })).filter(({ k, s }) => k > 0 && s.t !== 7);
  return (
    <div>
      <Head title={t('nav.training')}>
        {tab === 0 ? <button onClick={() => setDlg('coaches')}>{t('cl.tn.coaches')}</button> : <button disabled={cur.t === 0} onClick={() => setDlg('edit')}>{t('cl.ts.edit')}</button>}
        <select value={pos} onChange={(e) => setPos(e.target.value)} aria-label={t('cl.ts.filter')}>
          {([['', 'fAll'], ['gk', 'fGk'], ['def', 'fDef'], ['mid', 'fMid'], ['att', 'fAtt']] as const).map(([k, l]) => <option key={k} value={k}>{t(`cl.ts.${l}`)}</option>)}
        </select>
      </Head>
      <Tabs tabs={Array.from({ length: CM_SCHED_SLOTS }, (_, k) => [String(k), label(k)] as [string, string])} value={String(tab)} onChange={(k) => setTab(k)} />
      <Panel className="flush">
        <table className="grid">
          <thead><tr><th>{t('cl.tn.inf')}</th><th>{t('cl.ts.name')}</th><th>{t('cl.ts.position')}</th><th className="num">{t('col.age')}</th><th className="num">{t('col.cond')}</th><th>{t('nav.training')}</th></tr></thead>
          <tbody>
            {rows.map((p: Player) => {
              const o = originalTag(p);
              return (
                <tr key={p.id}>
                  <td>{o && <span className="tag" title={o.title}>{t(`cl.tag.${o.k}`)}</span>}</td>
                  <td><PlayerLink p={p} /></td><td>{posStr(p)}</td><td className="num">{ageOn(p.dob, g.date)}</td><td className="num">{p.injury ? t('tag.inj') : `${Math.round(p.condition)}%`}</td>
                  <td><select value={d.slot[p.id] ?? 1} onChange={(e) => upd((x) => ({ ...x, slot: { ...x.slot, [p.id]: Number(e.target.value) } }))}>
                    {slots.map(({ k, s }) => <option key={k} value={k}>{schedName(s)}</option>)}
                  </select></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>
      <div className="row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
        <button onClick={() => void cancel()}>{t('common.cancel')}</button>
        <button className="primary" onClick={ok}>{t('common.ok')}</button>
      </div>
      {dlg === 'edit' && <EditSchedule s={cur} onClose={() => setDlg(null)}
        onOk={(s) => { upd((x) => { const sched = copy(x.sched); sched[tab] = s; return { ...x, sched }; }); setDlg(null); }} />}
      {dlg === 'coaches' && <CoachesDialog ids={coaches.map((c) => c.id)} areas={d.areas} onClose={() => setDlg(null)} onOk={(areas) => { upd((x) => ({ ...x, areas })); setDlg(null); }} />}
    </div>
  );
}
