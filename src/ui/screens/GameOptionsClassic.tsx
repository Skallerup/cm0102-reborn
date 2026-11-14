// Game Options-skærmene fra CM 01/02: Manager Status (managerne i spillet, klub og status) og Selected League(s) (landene,
// spillet simulerer – "Selected" – og resten i baggrunden), med Use Real Players og Attribute Masking øverst.
import { useEffect, useState, type ReactNode } from 'react';
import { act } from '../../game/actions';
import { authentic } from '../../game/rules';
import { addableNations } from '../../game/sim';
import { askConfirm } from '../confirm';
import type { GameState } from '../../game/types';
import { fetchBoard, type Board, type RankRow } from '../../online/rank';
import { ordinal } from './Competitions';
import { compName, dateFmt, natName, t } from '../../i18n';
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
  // CM 01/02: Yes/No som tekstvalg med gul ramme om det valgte
  const yn = (on: boolean) => <><span className={`cx-sl-cell ${on ? 'on' : ''}`}>{t('common.yes')}</span><span className={`cx-sl-cell ${!on ? 'on' : ''}`}>{t('common.no')}</span></>;
  return (
    <div>
      <Head title={t('cl.nc.title')} />
      <div className="cx-subtitle">{t('cl.sl.title')}</div>
      <div className="cx-sl-top"><span>{t('cl.sl.real')}</span>{yn(true)}<span>{t('cl.sl.masking')}</span>{yn(!!g.options.masking)}</div>
      {/* som originalens Select League(s): SELECTED = ligaerne spilles, ellers kun spillerne i baggrunden (ingen kampe).
          Et land kan gøres spilbart undervejs (klik SELECTED) – men ikke fravælges igen */}
      <div className="cx-chist-tbl cx-sl">{nations.map((n) => {
        const sel = Object.values(g.comps).some((c) => c.nation === n && c.type === 'league');
        const leagues = Object.entries(g.leagues).filter(([, l]) => l.nation === n && !l.hidden);
        const lowest = (sel ? leagues.filter(([id]) => g.comps[id]) : leagues).sort((a, b) => b[1].tier - a[1].tier)[0];
        const canAdd = !sel && addable.has(n);
        return (
          <div key={n} className={`cx-sl-row ${n === own ? 'lg-own' : ''} ${sel ? 'lg-sel' : ''}`}>
            <span className="nm">{natName(g.nations[n]?.name)}</span>
            <button className={`cx-sl-cell ${sel ? 'on' : ''}`} disabled={!canAdd} title={canAdd ? t('lg.add') : undefined} onClick={() => canAdd && void addNation(n)}>{t('cl.sl.selected')}</button>
            <span className={`cx-sl-cell ${!sel ? 'on' : ''}`}>{t('cl.sl.background')}</span>
            <span className={`cx-sl-cell lw ${sel ? 'on' : ''}`}>{lowest ? compName(lowest[1].name) : ''}</span>
          </div>
        );
      })}</div>
      {/* ægte CM 01/02 har ingen forklaringstekst på Selected League(s) */}
      {(!authentic() || !!g.humans?.length) && <div className="cx-tac-hint">{t(g.humans?.length ? 'lg.mpOff' : 'cl.sl.hint')}</div>}
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
  if (authentic()) return <OriginalHallOfFame />;
  return <ReborHallOfFame fallback={fallback} />;
}

/** Originalens Hall of Fame (hall_of_fame.cpp, 0x5ef0b0–0x5f10c0): 28 tabeller (0 = "January - December", 1-27 = ligaerne, sorteret efter navn)
 *  med op til 100 poster – managerens navn, "Klub/Nation", score og dato. Originalen gemmer menneskets score i hall_of_fame.bin på tværs af spil;
 *  vi har ingen fil, så tabellerne fyldes af denne karrieres sæsoner (scoren er *estimeret*: placering + trofæer). */
const HOF_LEAGUES: [string, string[]][] = [
  ['Korean', ['south korea', 'korea republic', 'korea']], ['Welsh', ['wales']], ['United States', ['united states', 'usa']], ['Turkish', ['turkey']],
  ['Swedish', ['sweden']], ['Spanish', ['spain']], ['Scottish', ['scotland']], ['Russian', ['russia']], ['Portuguese', ['portugal']], ['Polish', ['poland']],
  ['Norwegian', ['norway']], ['Northern Irish', ['northern ireland']], ['Japanese', ['japan']], ['Italian', ['italy']], ['Irish', ['republic of ireland', 'ireland', 'eire']],
  ['Dutch', ['holland', 'netherlands']], ['Greek', ['greece']], ['German', ['germany']], ['French', ['france']], ['Finnish', ['finland']], ['English', ['england']],
  ['Danish', ['denmark']], ['Croatian', ['croatia']], ['Brazilian', ['brazil']], ['Belgian', ['belgium']], ['Australian', ['australia']], ['Argentinian', ['argentina']],
];
function OriginalHallOfFame() {
  const g = useGame()! as GameState;
  const [table, setTable] = useState(0); // 0 = January - December, ellers 1 + indeks i HOF_LEAGUES
  const order = HOF_LEAGUES.map((l, i) => ({ i, name: `${l[0]} League` })).sort((a, b) => a.name.localeCompare(b.name));
  const rows = g.manager.history.map((h) => {
    const c = g.clubs[h.club];
    const nat = g.nations[c?.nation ?? -1]?.name ?? '';
    const lg = HOF_LEAGUES.findIndex((l) => l[1].includes(nat.toLowerCase()));
    const tro = g.manager.trophies.filter((x) => x.season === h.season).length;
    return { key: h.season, lg, club: c?.short ?? '', nat, score: Math.max(0, 21 - h.pos) * 10 + tro * 50, date: `${h.season + 1}-06-30` };
  }).filter((r) => table === 0 || r.lg === table - 1).sort((a, b) => b.score - a.score || a.key - b.key).slice(0, 100);
  const title = table === 0 ? t('cl.hof.janDec') : `${HOF_LEAGUES[table - 1][0]} League`;
  return (
    <div>
      <Head title={t('cl.go.hall')} />
      <div className="cx-subtitle">{title}</div>
      <div className="cx-tools"><CxDrop label={t('cl.sq.view')} items={[{ key: 'jd', label: t('cl.hof.janDecShort'), checked: table === 0, onClick: () => setTable(0) }, ...order.map((o) => ({ key: o.name, label: o.name, checked: table === o.i + 1, onClick: () => setTable(o.i + 1) }))]} /></div>
      <div className="cx-tbl-wrap cx-listpanel cx-hof cx-hof-orig">
        <table className="cx-tbl">
          <tbody>{rows.map((r, i) => (
            <tr key={r.key}>
              <td className="btn-col"><span className="cx-lg-pos">{ordinal(i + 1)}</span></td>
              <td className="c-yel">{g.manager.name}</td><td>{r.club ? `${r.club}/${natName(r.nat)}` : t('cl.hof.noClub')}</td>
              <td className="c-val">{r.score.toLocaleString(t('cl.locale'))}</td><td>{dateFmt(r.date)}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

function ReborHallOfFame({ fallback }: { fallback: ReactNode }) {
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
        <div className="cx-tbl-wrap cx-listpanel cx-hof">
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
