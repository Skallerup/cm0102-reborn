// Træning i klassisk tema: faner pr. træningsskema med antal spillere (Overview · Rest · General · Fitness · Shooting,
// resten nederst), en værktøjslinje og spillertabellen med skemaet som blå knap forrest (klik = skift skema).
import { useState } from 'react';
import { act } from '../../game/actions';
import { ageOn } from '../../game/dates';
import { squad } from '../../game/state';
import { SCHEDULES, trainingAdvice } from '../../game/training';
import type { Player } from '../../game/types';
import { money, t } from '../../i18n';
import { ClassicSub, CxDrop, type DropItem } from '../classic';
import { Modal, Tabs, posStr } from '../components';
import { useGame, useNav, useRouteState } from '../core';
import { Head } from './common';
import { CxTable, type CxCol } from './CxTable';
import { CoachingPanel, posGroup } from './Training';

const TOP = ['rest', 'general', 'fitness', 'shooting'];
const BOTTOM = ['ballcontrol', 'attacking', 'defending', 'setpieces', 'goalkeeping'];
const moraleShort = (m: number) => t(`morale.${m >= 16 ? 'superb' : m >= 13 ? 'good' : m >= 9 ? 'okay' : 'poor'}`);
const formAvg = (p: Player) => (p.form.length ? p.form.slice(-5).reduce((s, x) => s + x, 0) / Math.min(5, p.form.length) : 0);

export function ClassicTraining() {
  const g = useGame()!;
  const { nav } = useNav();
  const [tab, setTab] = useRouteState('ttab', 'overview');
  const [grp, setGrp] = useRouteState('tgrp', '');
  const [coaches, setCoaches] = useState(false);
  const all = squad(g.userClub);
  const count = (k: string) => all.filter((p) => p.training === k).length;
  const lbl = (k: string) => `${t(`train.${k}`)} (${count(k)})`;
  const players = all.filter((p) => (tab === 'overview' || p.training === tab) && (!grp || (grp === 'advice' ? trainingAdvice(p).key !== p.training : posGroup(p) === grp)));
  const followAll = () => { for (const p of all) { const a = trainingAdvice(p); if (a.key !== p.training) act({ t: 'training', pid: p.id, key: a.key }); } };
  const schedMenu = (p: Player): DropItem[] => SCHEDULES.map((s) => ({ key: s.key, label: t(`train.${s.key}`), checked: p.training === s.key, onClick: () => act({ t: 'training', pid: p.id, key: s.key }) }));

  const cols: CxCol<Player>[] = [
    { key: 'inf', label: t('cl.tn.inf'), render: (p) => {
      const a = trainingAdvice(p);
      if (a.key === p.training) return null;
      const why = t(a.reason, { attrs: a.attrs.map((x) => t(`attr.${x}`)).join(` ${t('common.and')} `) });
      return <button className="cx-inf" title={`${t('adv.col')}: ${t(`train.${a.key}`)} – ${why}`} onClick={() => act({ t: 'training', pid: p.id, key: a.key })}>{t('cl.tn.adv')}</button>;
    }, sort: (p) => (trainingAdvice(p).key === p.training ? 0 : 1) },
    { key: 'name', label: t('col.name'), cls: 'c-name', render: (p) => <span className="link" onClick={() => nav({ name: 'player', id: p.id })}>{p.last}{p.first ? `, ${p.first}` : ''}</span>, sort: (p) => `${p.last} ${p.first}` },
    { key: 'pos', label: t('col.pos'), cls: 'c-cyan', render: (p) => posStr(p), sort: (p) => -p.pos.indexOf(Math.max(...p.pos)) },
    { key: 'age', label: t('col.age'), cls: 'c-num c-yel', render: (p) => ageOn(p.dob, g.date), sort: (p) => ageOn(p.dob, g.date) },
    { key: 'form', label: t('col.form'), cls: 'c-num c-yel', render: (p) => (p.form.length ? formAvg(p).toFixed(1) : '-'), sort: formAvg },
    { key: 'mor', label: t('col.morale'), cls: 'c-num c-yel', render: (p) => moraleShort(p.morale), sort: (p) => p.morale },
    { key: 'cond', label: t('col.cond'), cls: 'c-cond', render: (p) => `${Math.round(p.condition)}%`, sort: (p) => p.condition },
    { key: 'val', label: t('col.value'), cls: 'c-val', render: (p) => money(p.value), sort: (p) => p.value },
  ];

  return (
    <div>
      <Head title={t('nav.training')}>
        <button className="cx-greybtn" onClick={followAll}>{t('adv.followAll')}</button>
        <CxDrop label={t('cl.tn.setAll')} items={SCHEDULES.map((s) => ({ key: s.key, label: t(`train.${s.key}`), onClick: () => act({ t: 'trainingAll', key: s.key }) }))} />
        <span className="grow" />
        <button className="cx-greybtn" onClick={() => setCoaches(true)}>{t('cl.tn.coaches')}</button>
        <CxDrop label={t('cl.sq.filter')} align="right" items={['', 'gk', 'def', 'mid', 'att', 'advice'].map((k) => ({ key: k || 'all', label: k === 'advice' ? t('train.f.advice') : t(`train.f.${k || 'all'}`), checked: grp === k, onClick: () => setGrp(k) }))} />
      </Head>
      <Tabs tabs={[['overview', t('cl.tn.overview')], ...TOP.map((k) => [k, lbl(k)] as [string, string])]} value={tab} onChange={setTab} />
      <ClassicSub items={BOTTOM.map((k) => ({ key: k, label: lbl(k), on: tab === k, onClick: () => setTab(k) }))} />
      <CxTable rows={players} cols={cols} rowKey={(p) => p.id} initialSort="pos"
        btn={(p) => <CxDrop className="cx-sel" caret={false} label={t(`train.${p.training}`)} items={schedMenu(p)} btn={{ className: 'cx-rowbtn' }} />} />
      {coaches && <Modal title={t('cl.tn.coaches')} onClose={() => setCoaches(false)} wide><CoachingPanel /></Modal>}
    </div>
  );
}
