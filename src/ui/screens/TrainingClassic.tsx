// Træning i klassisk tema: faner pr. træningsskema med antal spillere (Overview · Rest · General · Fitness · Shooting,
// resten nederst), en værktøjslinje og spillertabellen med skemaet som blå knap forrest (klik = skift skema).
import { CoachesPanel } from './TransferStatusClassic';
import { useState } from 'react';
import { act } from '../../game/actions';
import { ageOn } from '../../game/dates';
import { squad } from '../../game/state';
import { authentic } from '../../game/rules';
import { SCHEDULES, trainingAdvice } from '../../game/training';
import type { Player } from '../../game/types';
import { money, t } from '../../i18n';
import { ClassicSub, CxDrop, type DropItem } from '../classic';
import { Tabs, posStr } from '../components';
import { useGame, useNav, useRouteState } from '../core';
import { Head } from './common';
import { CxTable, type CxCol } from './CxTable';
import { posGroup } from './Training';

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
  const orig = authentic();
  // valgte spillere (klik på rækken, til berøringsskærme): næste klik på en træningsfane flytter dem dertil – ellers kan de trækkes over på fanen
  const [sel, setSel] = useState<number[]>([]);
  const all = squad(g.userClub);
  const count = (k: string) => all.filter((p) => p.training === k).length;
  const lbl = (k: string) => `${t(`train.${k}`)} (${count(k)})`;
  const players = all.filter((p) => (tab === 'overview' || p.training === tab) && (!grp || (grp === 'advice' ? trainingAdvice(p).key !== p.training : posGroup(p) === grp)));
  const followAll = () => { for (const p of all) { const a = trainingAdvice(p); if (a.key !== p.training) act({ t: 'training', pid: p.id, key: a.key }); } };
  const move = (key: string, ids: number[]) => {
    if (!SCHEDULES.some((s) => s.key === key)) return;
    for (const id of ids) if (g.players[id]?.club === g.userClub) act({ t: 'training', pid: id, key });
    setSel([]);
  };
  const onTab = (k: string) => { if (sel.length && k !== 'overview') move(k, sel); else { setSel([]); setTab(k); } };
  const onDropTab = (k: string, data: string) => { const id = Number(data); if (id) move(k, sel.includes(id) ? sel : [id]); };
  const schedMenu = (p: Player): DropItem[] => SCHEDULES.map((s) => ({ key: s.key, label: t(`train.${s.key}`), checked: p.training === s.key, onClick: () => act({ t: 'training', pid: p.id, key: s.key }) }));

  const cols: CxCol<Player>[] = [
    { key: 'inf', label: t('cl.tn.inf'), render: (p) => {
      // ægte CM 01/02: assistentens træningsråd ("Adv") findes ikke i originalen
      if (orig) return null;
      const a = trainingAdvice(p);
      if (a.key === p.training) return null;
      const why = t(a.reason, { attrs: a.attrs.map((x) => t(`attr.${x}`)).join(` ${t('common.and')} `) });
      return <button className="cx-inf" title={`${t('adv.col')}: ${t(`train.${a.key}`)} – ${why}`} onClick={() => act({ t: 'training', pid: p.id, key: a.key })}>{t('cl.tn.adv')}</button>;
    }, sort: (p) => (trainingAdvice(p).key === p.training ? 0 : 1) },
    { key: 'name', label: t('col.name'), cls: 'c-name', render: (p) => <span className="link" onClick={() => nav({ name: 'player', id: p.id })}>{p.last}{p.first ? `, ${p.first}` : ''}</span>, sort: (p) => `${p.last} ${p.first}` },
    { key: 'pos', label: t('col.pos'), cls: 'c-cyan', render: (p) => posStr(p), sort: (p) => -p.pos.indexOf(Math.max(...p.pos)) },
    { key: 'age', label: t('col.age'), cls: 'c-num c-yel', render: (p) => ageOn(p.dob, g.date), sort: (p) => ageOn(p.dob, g.date) },
    // CM 01/02: formen som de seneste fem karakterer ("7-7-5-8-6"), moral som farvet ord, kondition i grøn % ("Inj" ved skade)
    { key: 'form', label: t('col.form'), cls: 'c-num c-yel', render: (p) => (p.form.length ? p.form.slice(-5).map((x) => Math.round(x)).join('-') : '-'), sort: formAvg },
    { key: 'mor', label: t('col.morale'), cls: 'c-num', render: (p) => <span className={`cx-mor m${p.morale >= 16 ? 4 : p.morale >= 13 ? 3 : p.morale >= 9 ? 2 : 1}`}>{moraleShort(p.morale)}</span>, sort: (p) => p.morale },
    { key: 'cond', label: t('col.cond'), cls: 'c-num', render: (p) => (p.injury ? <span className="cx-mor m1">{t('tag.inj')}</span> : <span className={p.condition >= 90 ? 'c-good' : 'cx-mor m2'}>{Math.round(p.condition)}%</span>), sort: (p) => p.condition },
    { key: 'val', label: t('col.value'), cls: 'c-val', render: (p) => money(p.value), sort: (p) => p.value },
  ];

  return (
    <div>
      <Head title={t('nav.training')}>
        {!orig && <button className="cx-greybtn" onClick={followAll}>{t('adv.followAll')}</button>}
        <CxDrop label={t('cl.tn.setAll')} items={SCHEDULES.map((s) => ({ key: s.key, label: t(`train.${s.key}`), onClick: () => act({ t: 'trainingAll', key: s.key }) }))} />
        <span className="grow" />
        <button className="cx-greybtn" onClick={() => setCoaches(true)}>{t('cl.tn.coaches')}</button>
        <CxDrop label={t('cl.sq.filter')} align="right" items={['', 'gk', 'def', 'mid', 'att', ...(orig ? [] : ['advice'])].map((k) => ({ key: k || 'all', label: k === 'advice' ? t('train.f.advice') : t(`train.f.${k || 'all'}`), checked: grp === k, onClick: () => setGrp(k) }))} />
      </Head>
      <Tabs tabs={[['overview', t('cl.tn.overview')], ...TOP.map((k) => [k, lbl(k)] as [string, string])]} value={tab} onChange={onTab} onDropTab={onDropTab} />
      <ClassicSub items={BOTTOM.map((k) => ({ key: k, label: lbl(k), on: tab === k, onClick: () => onTab(k), onDrop: (d: string) => onDropTab(k, d) }))} />
      {sel.length > 0 && !authentic() && <div className="cx-tn-hint">{t('cl.tn.moveHint', { n: sel.length })}</div>}
      <CxTable rows={players} cols={cols} rowKey={(p) => p.id} initialSort="pos"
        rowAttrs={(p) => ({ draggable: true, className: sel.includes(p.id) ? 'cx-tn-sel' : undefined,
          // dragstart ændrer ikke DOM'en (Chrome afbryder ellers trækket) – kun dataene
          onDragStart: (e) => { e.dataTransfer.setData('text/plain', String(p.id)); e.dataTransfer.effectAllowed = 'move'; },
          onClick: (e) => { if ((e.target as HTMLElement).closest('button, .link, a')) return; setSel((x) => (x.includes(p.id) ? x.filter((i) => i !== p.id) : [...x, p.id])); } })}
        btn={(p) => <CxDrop className="cx-sel" caret={false} fixed label={t(`train.${p.training}`)} items={schedMenu(p)} btn={{ className: 'cx-rowbtn' }} />} />
      {coaches && <CoachesPanel onClose={() => setCoaches(false)} />}
    </div>
  );
}
