// Game Options-skærmene fra CM 01/02: Manager Status (managerne i spillet, klub og status) og Selected League(s) (landene,
// spillet simulerer – "Selected" – og resten i baggrunden), med Use Real Players og Attribute Masking øverst.
import type { GameState } from '../../game/types';
import { compName, natName, t } from '../../i18n';
import { CxLink, clubRoute } from '../classic';
import { useGame } from '../core';
import { Head } from './common';

export function ClassicManagerStatus() {
  const g = useGame()! as GameState;
  // alle menneskelige managere (fællesspil) – ellers kun én selv
  const rows = g.humans?.length
    ? g.humans.filter((h) => !h.bot).map((h) => ({ name: h.name, club: h.pid === g.active ? g.userClub : h.userClub, me: h.pid === g.active }))
    : [{ name: g.manager.name, club: g.userClub, me: true }];
  const status = (club: number) => t(!club ? 'cl.ms2.unemployed' : g.manager.holiday ? 'cl.ms2.holiday' : 'cl.ms2.playing');
  return (
    <div>
      <Head title={t('cl.nc.title')} />
      <div className="cx-subtitle">{t('cl.go.status')}</div>
      <div className="cx-chist-tbl cx-mstat">{rows.map((r, i) => (
        <div key={i} className="cx-chist-row three"><span className={r.me ? 'c-yel' : ''}>{r.name}</span><span>{r.club ? <CxLink to={clubRoute(r.club)}>{g.clubs[r.club]?.short}</CxLink> : '-'}</span><span className="dim">{status(r.club)}</span></div>
      ))}</div>
    </div>
  );
}

export function ClassicSelectedLeagues() {
  const g = useGame()! as GameState;
  const nations = [...new Set(Object.values(g.leagues).filter((l) => !l.hidden).map((l) => l.nation))].filter((n) => g.nations[n])
    .sort((a, b) => natName(g.nations[a]?.name).localeCompare(natName(g.nations[b]?.name)));
  const own = g.clubs[g.userClub]?.nation;
  const yes = (on: boolean) => <span className={`cx-opt ${on ? 'on' : ''}`}>{t(on ? 'common.yes' : 'common.no')}</span>;
  return (
    <div>
      <Head title={t('cl.nc.title')} />
      <div className="cx-subtitle">{t('cl.sl.title')}</div>
      <div className="cx-sl-top"><span>{t('cl.sl.real')}</span>{yes(true)}<span>{t('cl.sl.masking')}</span>{yes(!!g.options.masking)}</div>
      <div className="cx-chist-tbl cx-sl">{nations.map((n) => {
        const sel = Object.values(g.comps).some((c) => c.nation === n && c.type === 'league');
        const lowest = Object.entries(g.leagues).filter(([id, l]) => l.nation === n && !l.hidden && g.comps[id]).sort((a, b) => b[1].tier - a[1].tier)[0];
        return (
          <div key={n} className={`cx-sl-row ${n === own ? 'lg-own' : ''} ${sel ? 'lg-sel' : ''}`}>
            <span>{natName(g.nations[n]?.name)}</span><span className="st">{t(sel ? 'cl.sl.selected' : 'cl.sl.background')}</span><span className="lw">{sel && lowest ? compName(lowest[1].name) : ''}</span>
          </div>
        );
      })}</div>
    </div>
  );
}
