
import { A } from '../../game/attributes';
import { gs, squad } from '../../game/state';
import { interestedClubs } from '../../game/transfers';
import { EyeIcon } from '../icons';
import type { Player } from '../../game/types';
import { avgRating } from '../../game/season';
import { money, t, dateFmt } from '../../i18n';
import { Bar, Modal, Nat, Panel, PlayerLink, Table, Tabs, age, posStr, type Col } from '../components';
import { cliques } from '../../game/will';
import { useGame, useNav, useRouteState } from '../core';
import { useState } from 'react';
import { act } from '../../game/actions';
import { Head } from './common';

export function statusTags(p: Player, userClub: number) {
  return (
    <>
      {p.injury && <span className="tag bad" title={t(`injury.${p.injury.key}`)}>{t('tag.inj')} {p.injury.days}d</span>}
      {p.banned > 0 && <span className="tag bad">{t('tag.ban')} {p.banned}</span>}
      {p.listed && <span className="tag warn">{t('tag.listed')}{p.listPrice ? ` ${money(p.listPrice)}` : ''}</span>}
      {p.loan && <span className="tag">{p.loan.from === userClub ? t('tag.loanOut') : t('tag.loan')}</span>}
      {p.contract?.futureClub && <span className="tag warn">{t('tag.leaving')}</span>}
      {(p.unhappy ?? 0) > 60 && <span className="tag bad">{t('tag.unhappy')}</span>}
      {p.wantsAway && <span className="tag bad">{t('tag.wantsAway')}</span>}
      {p.demand && <span className="tag warn" title={t('tag.demandHint', { wage: money(p.demand.wage) })}>{t('tag.demand')}</span>}
      {p.club === userClub && !!userClub && <InterestTag p={p} />}
    </>
  );
}

/** Øje-ikon med antal klubber, der holder øje med en af ens egne spillere */
function InterestTag({ p }: { p: Player }) {
  const g = gs();
  const list = interestedClubs(p);
  if (!list.length) return null;
  const names = list.map((i) => g.clubs[i.club]?.name).filter(Boolean).join(', ');
  return <span className="tag interest" title={t('tag.interestHint', { clubs: names })}><EyeIcon /> {list.length}</span>;
}

export function SquadTable({ players, view, userClub }: { players: Player[]; view: string; userClub: number }) {
  const { nav } = useNav();
  const base: Col<Player>[] = [
    { key: 'pos', label: t('col.pos'), render: (p) => posStr(p), sort: (p) => -p.pos.indexOf(Math.max(...p.pos)) },
    { key: 'name', label: t('col.name'), render: (p) => <><PlayerLink p={p} />{statusTags(p, userClub)}</>, sort: (p) => p.last },
    { key: 'age', label: t('col.age'), render: (p) => age(p), sort: (p) => age(p), className: 'num' },
    { key: 'nat', label: t('col.nat'), render: (p) => <Nat n={p.nation} />, sort: (p) => p.nation },
  ];
  let cols: Col<Player>[];
  if (view === 'attrs') {
    const keys: [string, number][] = [['cro', A.crossing], ['dri', A.dribbling], ['fin', A.finishing], ['hea', A.heading], ['mar', A.marking], ['otb', A.offTheBall], ['pas', A.passing], ['tck', A.tackling], ['tec', A.technique], ['cre', A.creativity], ['dec', A.decisions], ['pos', A.positioning], ['pac', A.pace], ['sta', A.stamina], ['str', A.strength], ['han', A.handling], ['ref', A.reflexes]];
    cols = [...base, ...keys.map(([k, i]) => ({
      key: `a${i}`, label: t(`short.${k}`), className: 'num', title: t(`attr.${['crossing','dribbling','finishing','heading','marking','offTheBall','passing','tackling','technique','creativity','decisions','positioning','pace','stamina','strength','handling','reflexes'][keys.findIndex((x) => x[1] === i)]}`),
      render: (p: Player) => { const v = Math.round(p.attrs[i]); return <span className={`attr ${v >= 16 ? 'a-top' : v >= 13 ? 'a-good' : v >= 9 ? 'a-mid' : v >= 5 ? 'a-low' : 'a-bad'}`}>{v}</span>; },
      sort: (p: Player) => p.attrs[i],
    }))];
  } else if (view === 'contracts') {
    cols = [...base,
      { key: 'value', label: t('col.value'), render: (p) => money(p.value), sort: (p) => p.value, className: 'num' },
      { key: 'wage', label: t('col.wage'), render: (p) => money(p.contract?.wage ?? 0), sort: (p) => p.contract?.wage ?? 0, className: 'num' },
      { key: 'exp', label: t('col.expires'), render: (p) => (p.contract ? dateFmt(p.contract.expires) : '-'), sort: (p) => p.contract?.expires ?? '' },
      { key: 'joined', label: t('col.joined'), render: (p) => (p.joined ? dateFmt(p.joined) : '-'), sort: (p) => p.joined ?? '' },
    ];
  } else {
    cols = [...base,
      { key: 'cond', label: t('col.cond'), render: (p) => <><Bar value={p.condition} /> <span className="muted">{Math.round(p.condition)}%</span></>, sort: (p) => p.condition },
      { key: 'mor', label: t('col.morale'), render: (p) => t(`morale.${p.morale >= 16 ? 'superb' : p.morale >= 13 ? 'good' : p.morale >= 9 ? 'okay' : 'poor'}`), sort: (p) => p.morale },
      { key: 'apps', label: t('col.apps'), render: (p) => `${p.stats.apps}${p.stats.subs ? ` (${p.stats.subs})` : ''}`, sort: (p) => p.stats.apps + p.stats.subs, className: 'num' },
      { key: 'gls', label: t('col.goals'), render: (p) => p.stats.goals, sort: (p) => p.stats.goals, className: 'num' },
      { key: 'ast', label: t('col.assists'), render: (p) => p.stats.assists, sort: (p) => p.stats.assists, className: 'num' },
      { key: 'av', label: t('col.avr'), render: (p) => (p.stats.ratingCount ? avgRating(p).toFixed(2) : '-'), sort: (p) => avgRating(p), className: 'num' },
      { key: 'form', label: t('col.form'), render: (p) => p.form.map((r) => r.toFixed(1)).join(' '), sort: (p) => (p.form.length ? p.form.reduce((s, x) => s + x, 0) / p.form.length : 0) },
      { key: 'value', label: t('col.value'), render: (p) => money(p.value), sort: (p) => p.value, className: 'num' },
    ];
  }
  return <Table rows={players} cols={cols} rowKey={(p) => p.id} onRow={(p) => nav({ name: 'player', id: p.id })} initialSort="pos" initialDir={1} rowClass={(p) => (p.injury ? 'injured' : '')} />;
}

export function Squad() {
  const g = useGame()!;
  const [view, setView] = useRouteState('view', 'general');
  const [meeting, setMeeting] = useState(false);
  const players = squad(g.userClub);
  const loanedOut = Object.values(g.players).filter((p) => p.loan?.from === g.userClub);
  return (
    <div>
      <Head title={`${t('nav.squad')} (${players.length})`}>
        <button onClick={() => setMeeting(true)}>🗣️ {t('team.meeting')}</button>
        <Tabs tabs={[['general', t('squad.general')], ['attrs', t('squad.attrs')], ['contracts', t('squad.contracts')]]} value={view} onChange={setView} />
      </Head>
      <SquadTable players={players} view={view} userClub={g.userClub} />
      <Cliques />
      {meeting && <TeamMeeting onClose={() => setMeeting(false)} />}
      {loanedOut.length > 0 && (
        <>
          <h3 style={{ margin: '12px 0 6px' }} className="accent">{t('squad.loanedOut')}</h3>
          <SquadTable players={loanedOut} view="general" userClub={g.userClub} />
        </>
      )}
    </div>
  );
}

/** Omklædningsrummet: grupperinger og deres ledere */
function Cliques() {
  const g = useGame()!;
  const list = cliques(g.userClub);
  if (!list.length) return null;
  return (
    <Panel title={t('clique.title')} className="flush" style={{ marginTop: 12 }}>
      <table className="grid">
        <tbody>
          {list.map((c, i) => {
            const leader = g.players[c.leader];
            return (
              <tr key={i}>
                <td>{t(`clique.${c.key}`, { nation: c.nation !== undefined ? g.nations[c.nation]?.name ?? '' : '' })}</td>
                <td className="num">{c.members.length}</td>
                <td>{t('clique.leader')}: <PlayerLink p={leader} /></td>
                <td style={{ minWidth: 140 }}><Bar value={c.mood} max={20} /></td>
                <td className={leader && (leader.wantsAway || leader.morale < 8) ? 'bad' : 'muted'}>{leader && (leader.wantsAway || leader.morale < 8) ? t('clique.unrest') : leader && leader.morale >= 15 ? t('clique.lifts') : t('clique.calm')}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Panel>
  );
}

function TeamMeeting({ onClose }: { onClose: () => void }) {
  const g = useGame()!;
  const [res, setRes] = useState<{ key: string; mood: string } | null>(null);
  const club = g.clubs[g.userClub];
  const form = g.comps[club.league]?.table.find((r) => r.club === club.id)?.form ?? '';
  const last = g.board.lastTeamTalk;
  const cooldown = last ? 14 - Math.round((Date.parse(g.date) - Date.parse(last)) / 86400000) : 0;
  const say = (kind: 'praise' | 'criticise' | 'demand' | 'calm') => setRes(act<{ key: string; mood: string }>({ t: 'teamTalk', kind }));
  return (
    <Modal title={t('team.meeting')} onClose={onClose}>
      <div className="col">
        <div className="kv"><span>{t('team.recent')}</span><span><b>{form.slice(-5) || '–'}</b></span></div>
        <div className="muted">{t('team.hint')}</div>
        <div className="col">
          {(['praise', 'calm', 'demand', 'criticise'] as const).map((k) => (
            <button key={k} disabled={cooldown > 0 || !!res} onClick={() => say(k)} style={{ textAlign: 'left' }}>{t(`team.${k}`)}</button>
          ))}
        </div>
        {cooldown > 0 && !res && <div className="muted">{t('team.cooldown', { n: cooldown })}</div>}
        {res && <div className={`insight ${res.mood}`}>{t(res.key)}</div>}
      </div>
    </Modal>
  );
}
