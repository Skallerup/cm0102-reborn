// Game Options-skærmene fra CM 01/02: Manager Status (managerne i spillet, klub og status) og Selected League(s) (landene,
// spillet simulerer – "Selected" – og resten i baggrunden), med Use Real Players og Attribute Masking øverst.
import { useEffect, useState, type ReactNode } from 'react';
import { act } from '../../game/actions';
import { addableNations } from '../../game/sim';
import { askConfirm } from '../confirm';
import type { GameState } from '../../game/types';
import { fetchBoard, type Board, type RankRow } from '../../online/rank';
import { ordinal } from './Competitions';
import { compName, natName, t } from '../../i18n';
import { CxDrop, CxLink, clubRoute } from '../classic';
import { useGame } from '../core';
import { gs } from '../../game/state';
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
  const addable = new Set(g.humans?.length || g.draft ? [] : addableNations());
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
            <span>{natName(g.nations[n]?.name)}</span><span className="st">{t(sel ? 'cl.sl.selected' : 'cl.sl.background')}</span><span className="lw">{sel && lowest ? compName(lowest[1].name) : addable.has(n) ? <button className="cx-sl-add" onClick={() => void addNation(n)}>{t('lg.add')}</button> : ''}</span>
          </div>
        );
      })}</div>
    </div>
  );
}

/** Gør et baggrundsland spilbart midt i et spil (bekræftes – kan ikke fortrydes) */
export async function addNation(n: number) {
  const g = gs();
  const name = natName(g.nations[n]?.name);
  if (!(await askConfirm(t('lg.addQ', { nation: name }), { ok: t('lg.add') }))) return;
  // ligaerne startes og de kampe, der allerede skulle være spillet, simuleres – kan tage et øjeblik
  await new Promise((r) => setTimeout(r, 30));
  act({ t: 'addNation', nation: n });
}

/** Hall of Fame (CM 01/02): managerne i rækkefølge med klub og point (lilla). Vores udgave er fællesskabets rangliste; uden net
 *  vises din egen karriere. "Min karriere" (pointene sæson for sæson) ligger under View. */
export function ClassicHallOfFame({ fallback }: { fallback: ReactNode }) {
  const [board, setBoard] = useState<Board | 'mine'>('career');
  const [data, setData] = useState<{ rows: RankRow[]; me: { rank: number; points: number } | null } | null | 'none'>(null);
  useEffect(() => { if (board === 'mine') return; let ok = true; setData(null); void fetchBoard(board).then((d) => { if (ok) setData(d ?? 'none'); }); return () => { ok = false; }; }, [board]);
  const BOARDS: Board[] = ['career', 'season', 'month'];
  const titles: Record<string, string> = { career: t('cl.hof.career'), season: t('cl.hof.season'), month: t('cl.hof.month'), mine: t('cl.hof.mine') };
  return (
    <div>
      <Head title={t('cl.go.hall')} />
      <div className="cx-subtitle">{titles[board]}</div>
      <div className="cx-tools"><CxDrop label={t('cl.sq.view')} items={[...BOARDS, 'mine' as const].map((b) => ({ key: b, label: titles[b], checked: board === b, onClick: () => setBoard(b) }))} /></div>
      {board === 'mine' || data === 'none' ? <div className="cx-hof-fb">{fallback}</div> : (
        <div className="cx-tbl-wrap cx-hof">
          <table className="cx-tbl">
            <tbody>{(data?.rows ?? []).map((r, i) => (
              <tr key={r.id} className={data && typeof data === 'object' && data.me?.rank === i + 1 ? 'me' : ''}>
                <td className="btn-col"><span className="cx-lg-pos">{ordinal(i + 1)}</span></td>
                <td>{r.name}</td><td className="c-yel">{r.club}</td><td className="c-val">{r.points.toLocaleString(t('cl.locale'))}</td>
              </tr>
            ))}</tbody>
          </table>
          {data === null && <div className="cx-empty">{t('common.loading')}</div>}
          {data && typeof data === 'object' && data.me && data.me.rank > data.rows.length && <div className="cx-hof-me">{t('cl.hof.you', { rank: ordinal(data.me.rank), pts: data.me.points.toLocaleString(t('cl.locale')) })}</div>}
        </div>
      )}
    </div>
  );
}
