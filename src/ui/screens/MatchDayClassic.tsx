// Kampdag i klassisk tema: dagens kampe pr. turnering (som originalens "Evening Fixtures"), én turnering ad gangen.
// Continue Game i venstre kolonne fører videre til ens egen kamp.
import type { Fixture, GameState } from '../../game/types';
import { compName, natName, t } from '../../i18n';
import { intlDayResults } from '../../game/international';
import { authentic } from '../../game/rules';
import { useGame, useNav, useRouteState } from '../core';
import { CxLink, clubRoute, compAbbr } from '../classic';
import { Head } from './common';
import { stageLabel } from './Fixtures';
import { ordinal } from './Competitions';
import { leagueRows, sortTable } from '../../game/competitions';

/** Dagens turneringer på kampdagsskærmen: kun ens eget lands, de europæiske og dem, klubben er med i (ens egen først) */
export function matchDayComps(g: GameState, id: number): { comps: string[]; today: Fixture[]; mine?: Fixture } {
  const mine = g.fixtures[id];
  const date = mine?.date ?? g.date;
  const myNation = g.clubs[g.userClub]?.nation;
  const today = Object.values(g.fixtures).filter((f) => f.date === date && (f.home === g.userClub || f.away === g.userClub || g.comps[f.comp]?.nation === myNation || g.comps[f.comp]?.nation === -1 || g.comps[f.comp]?.clubs.includes(g.userClub)));
  const comps = [...new Set(today.map((f) => f.comp))].sort((a, b) => Number(b === mine?.comp) - Number(a === mine?.comp) || (compName(g.comps[a]?.name) ?? '').localeCompare(compName(g.comps[b]?.name) ?? ''));
  return { comps, today, mine };
}

export function MatchDay({ id }: { id: number }) {
  const g = useGame()!;
  const { nav } = useNav();
  const { comps, today, mine } = matchDayComps(g, id);
  const date = mine?.date ?? g.date;
  const [i, setI] = useRouteState('mdi', 0);
  const cid = comps[Math.min(i, comps.length - 1)];
  // Continue Game fortsætter spillet (ejeren 13/11) – « » bladrer mellem turneringerne
  const comp = g.comps[cid];
  const list = today.filter((f) => f.comp === cid).sort((a, b) => Number(isMine(b)) - Number(isMine(a)) || (g.clubs[a.home]?.name ?? '').localeCompare(g.clubs[b.home]?.name ?? ''));
  function isMine(f: Fixture) { return f.home === g.userClub || f.away === g.userClub; }
  const stages = [...new Set(list.map((f) => stageLabel(f)))];
  // efter kampene (CM 01/02 "Evening Results"): ligaens forkortelse ved hver klub i en ligakamp, ellers landet
  // alle kampe spilles på samme tid: før ens egen kamp er spillet, vises de andre resultater ikke
  const before = !!g.pendingFixture && mine?.id === g.pendingFixture && !mine.result;
  const played = !before && list.length > 0 && list.every((f) => f.result);
  const abbr = (lg?: string) => (lg ? compAbbr(compName(g.comps[lg]?.name) ?? '').slice(0, 3) : '');
  // ligakampe: placeringen i tabellen (CM 01/02: "4th" · "1st"); pokalkampe: ligaens forkortelse, internationale: landet
  const pos = comp?.type === 'league' ? new Map(leagueRows(comp).map((r, k) => [r.club, k + 1])) : null;
  // europæisk gruppespil/ligafase (CM 01/02 "Phase 1 Group G"): placeringen i gruppen/tabellen
  const groupPos = (f: Fixture, club: number) => {
    const rows = f.stage === 'LP' ? comp?.table : f.stage?.startsWith('G') ? comp?.groups?.[f.stage.slice(1)] : undefined;
    if (!rows?.length) return undefined;
    const k = sortTable(rows.slice()).findIndex((r) => r.club === club);
    return k >= 0 ? ordinal(k + 1) : undefined;
  };
  const code = (club: number, f?: Fixture) => (pos ? (pos.has(club) ? ordinal(pos.get(club)!) : '') : (f && groupPos(f, club)) ?? (comp?.nation !== -1 ? abbr(g.clubs[club]?.league) : g.nations[g.clubs[club]?.nation]?.code ?? ''));
  /** a = videre på udebanemål, p = videre efter straffespark (står ved vinderen) */
  const mark = (f: Fixture, side: 0 | 1) => {
    const r = f.result;
    if (!r) return '';
    if (r.pens) return (r.pens[side] > r.pens[1 - side]) ? 'p' : '';
    if (f.leg === 2 && f.tieId !== undefined) {
      const tie = comp?.ties.find((x) => x.id === f.tieId);
      const first = tie ? g.fixtures[tie.fx[0]] : undefined;
      if (first?.result && first.id !== f.id) {
        const club = side === 0 ? f.home : f.away;
        const tot = (c: number) => [first, f].reduce((s, x) => s + (x.home === c ? x.result!.hg : x.result!.ag), 0);
        const away = (c: number) => [first, f].reduce((s, x) => s + (x.away === c ? x.result!.ag : 0), 0);
        const other = side === 0 ? f.away : f.home;
        if (tot(club) === tot(other) && away(club) > away(other)) return 'a';
      }
    }
    return '';
  };
  const name = (club: number) => <span className={club === g.userClub ? 'me' : ''}>{g.clubs[club] ? <CxLink to={clubRoute(club)}>{g.clubs[club].name}</CxLink> : '?'}</span>;
  // weekendkampe spilles om eftermiddagen, resten om aftenen (CM 01/02: "Afternoon Result" / "Evening Fixtures")
  const wd = new Date(`${date}T12:00:00`).getDay();
  const title = t(`cl.md.${played ? 'res' : 'fix'}${list.length === 1 ? '1' : 'N'}`, { when: t(wd === 0 || wd === 6 ? 'cl.md.afternoon' : 'cl.md.evening') });
  return (
    <div>
      <Head title={compName(comp?.name) ?? t('nav.fixtures')} />
      <div className="cx-subtitle">{title}</div>
      {/* CM 01/02: Competition under overskriften til højre (vores ‹‹ ›› bladrer mellem dagens turneringer) */}
      <div className="cx-md-tools">
        {comps.length > 1 && <>
          <button className="cx-greybtn" disabled={i <= 0} onClick={() => setI(i - 1)}>‹‹</button>
          <span className="cx-md-count">{t('cl.md.count', { n: Math.min(i, comps.length - 1) + 1, of: comps.length })}</span>
          <button className="cx-greybtn" disabled={i >= comps.length - 1} onClick={() => setI(i + 1)}>››</button>
        </>}
        <span className="grow" />
        {comp && <button className="cx-greybtn" onClick={() => nav({ name: 'competitions', id: cid })}>{t('cl.md.competition')}</button>}
      </div>
      <div className="cx-md-panel">{stages.map((st) => (
        <div key={st} className="cx-md">
          {comp?.type !== 'league' && <div className="cx-md-stage">{st}</div>}
          {list.filter((f) => stageLabel(f) === st).map((f) => (
            <div key={f.id} className={`cx-md-row ${isMine(f) ? 'mine' : ''}`}>
              <span className="cx-md-code">{code(f.home, f)}</span>
              <span className="cx-md-home">{name(f.home)}</span>
              {f.result && !before ? <span className="cx-md-res cx-link" role="link" onClick={() => nav({ name: 'report', id: f.id })}><span className="cx-md-mark">{mark(f, 0)}</span>{f.result.hg}:{f.result.ag}<span className="cx-md-mark">{mark(f, 1)}</span></span> : <span className="cx-md-v">v</span>}
              <span className="cx-md-away">{name(f.away)}</span>
              <span className="cx-md-code">{code(f.away, f)}</span>
            </div>
          ))}
        </div>
      ))}</div>
      {g.pendingFixture && !played && !authentic() && <div className="cx-md-hint">{t('cl.md.hint')}</div>}
    </div>
  );
}

/** Slutrundens kampdag (CM 01/02 "FIFA World Cup – Afternoon Result"): dagens resultater pr. gruppe/runde med placeringen i gruppen */
export function IntlDay() {
  const g = useGame()!;
  const { nav } = useNav();
  const all = intlDayResults(g.date);
  const kinds = [...new Set(all.map((x) => x.r.kind))];
  const [i, setI] = useRouteState('idi', 0);
  const kind = kinds[Math.min(i, kinds.length - 1)];
  const list = all.filter((x) => x.r.kind === kind);
  const wd = new Date(`${g.date}T12:00:00`).getDay();
  const title = t(`cl.md.res${list.length === 1 ? '1' : 'N'}`, { when: t(wd === 0 || wd === 6 ? 'cl.md.afternoon' : 'cl.md.evening') });
  const label = (x: (typeof list)[number]) => (x.group !== undefined ? t('cl.md.group', { g: String.fromCharCode(65 + x.group) }) : t(`stage.${x.r.stage}`));
  const stages = [...new Set(list.map(label))];
  const nat = (n: number) => <span className="cx-link" role="link" onClick={() => nav({ name: 'international', id: n })}>{natName(g.nations[n]?.name) ?? '?'}</span>;
  return (
    <div>
      <Head title={kind ? t(`intl.name.${kind}`) : ''} />
      <div className="cx-subtitle">{title}</div>
      <div className="cx-md-tools">
        {kinds.length > 1 && <>
          <button className="cx-greybtn" disabled={i <= 0} onClick={() => setI(i - 1)}>‹‹</button>
          <span className="cx-md-count">{t('cl.md.count', { n: Math.min(i, kinds.length - 1) + 1, of: kinds.length })}</span>
          <button className="cx-greybtn" disabled={i >= kinds.length - 1} onClick={() => setI(i + 1)}>››</button>
        </>}
        <span className="grow" /><button className="cx-greybtn" onClick={() => nav({ name: 'international' })}>{t('cl.md.competition')}</button>
      </div>
      <div className="cx-md-panel">{stages.map((st) => (
        <div key={st} className="cx-md">
          <div className="cx-md-stage">{st}</div>
          {list.filter((x) => label(x) === st).map((x, k) => (
            <div key={k} className="cx-md-row">
              <span className="cx-md-code">{x.pos ? ordinal(x.pos[0]) : g.nations[x.r.home]?.code ?? ''}</span>
              <span className="cx-md-home">{nat(x.r.home)}</span>
              <span className="cx-md-res">{x.r.hg}:{x.r.ag}</span>
              <span className="cx-md-away">{nat(x.r.away)}</span>
              <span className="cx-md-code">{x.pos ? ordinal(x.pos[1]) : g.nations[x.r.away]?.code ?? ''}</span>
            </div>
          ))}
        </div>
      ))}</div>
    </div>
  );
}
