// CM 01/02's Awards-skærm (award_screens.cpp i cm0102.exe 3.9.68: award_screens_open_award_screen 0x414c20, award_screen_draw 0x414cf0,
// årets pris 0x4156a0, holdpriserne 0x415f60) – den originale database (og CM-databaser) i ægte tilstand. Skærmen åbnes med én pris
// (AWARD_MANAGER 0x414a60: et indlæst lands pris med det staff_comp-id) og viser dens lands priser; titlen følger den valgte pris (0x414d52):
// en pris med turnering → "{competition} Awards" (turneringens korte navn), ellers landets "{nationality} Awards", ellers "International Awards".
// Nations ▸ <land> ▸ Awards findes kun for lande med et NationAwards-objekt (0x75f891: 0x414340) og åbner landets første pris; en turnerings
// Awards (0x490171: 0x414ac0) den første pris for turneringen. En pris uden vindere viser "No awards have been made." (0x41555f).
// Spillets vindere kommer fra cmAwards.ts (`g.cmAw.won`), de tidligere år fra databasens staff_comp_history.dat.
// *Estimeret*: opstillingen af rækkerne (ingen skærmbilleder af originalens skærm) og at den seneste Team of the Week vises.
import { awardsStart, cmAwardHistory, cmAwardName, cmAwardNations, cmAwardWins, cmCompShort, INTL_AWARDS, NATION_AWARDS, natIdx, teamSlots, type CmAwDef } from '../../game/cmAwards';
import type { GameState } from '../../game/types';
import { getLang, natName, t } from '../../i18n';
import { CxDrop, CxLink } from '../classic';
import { useGame, useNav, useRouteState } from '../core';
import { DEMONYM } from '../demonyms';
import { Head } from './common';

const MONTHS = (m: number) => { try { return new Date(Date.UTC(2001, m - 1, 15)).toLocaleDateString(t('cl.locale'), { month: 'long', timeZone: 'UTC' }); } catch { return String(m); } };
const SLOT_LABEL: Record<number, string> = { 1: 'GK', 2: 'SW', 0x804: 'DR', 0x84: 'DL', 0x808: 'WBR', 0x88: 'WBL', 0x204: 'DC', 0x208: 'DMC', 0x210: 'MC', 0x810: 'MR', 0x90: 'ML', 0x220: 'AMC', 0x240: 'FC', 0x840: 'FR', 0xc0: 'FL', 0x40: 'F', 4: 'D' };
/** månedens kalenderår i sæsonen y (MONTH_AWARD-vinduet fra-måned..til-måned, 0–11) */
const calYear = (d: CmAwDef | undefined, y: number, m: number) => { const [a, b] = d?.months ?? [7, 4]; return a > b && m - 1 < a ? y + 1 : y; };
const yr = (s: number) => `${s}/${String((s + 1) % 100).padStart(2, '0')}`;

/** landets nationalitetsord (nation.dat +87) – på andre sprog landets navn */
export function nationalityOf(g: GameState, nation: string): string {
  const n = g.nations[natIdx(g, nation)];
  return getLang() === 'en' ? n?.adj ?? DEMONYM[nation] ?? nation : natName(nation);
}

function Who({ g, id, mgr, club, name }: { g: GameState; id: number; mgr?: boolean; club: number; name: string }) {
  if (mgr || !g.players[id]) return <span className={club === g.userClub ? 'me' : ''}>{name}</span>;
  return <span className={club === g.userClub ? 'me' : ''}><CxLink to={{ name: 'player', id }}>{name}</CxLink></span>;
}
function Club({ g, id }: { g: GameState; id: number }) {
  const c = g.clubs[id];
  return c ? <span className={id === g.userClub ? 'me' : ''}><CxLink to={{ name: 'club', id }}>{c.short ?? c.name}</CxLink></span> : <span />;
}

export function AwardsClassic() {
  const g = useGame()!;
  const { route } = useNav();
  const [start] = useRouteState<{ nation: string | null; id: number }>('awStart', () => awardsStart(g, route.state));
  const [nation, setNation] = useRouteState<string | null>('awGroup', start.nation);
  const defs: { id: number; def?: CmAwDef }[] = nation === null ? INTL_AWARDS.map((id) => ({ id })) : (NATION_AWARDS[nation] ?? []).filter((d) => d.id >= 0).map((d) => ({ id: d.id, def: d }));
  const [sel, setSel] = useRouteState<number>('awSel', start.id);
  const cur = defs.find((d) => d.id === sel) ?? defs[0];
  const wins = cur ? cmAwardWins(g, cur.id) : [];
  const past = cur ? cmAwardHistory(cur.id, g) : [];
  const kind = cur?.def?.kind;
  const [teamIdx, setTeamIdx] = useRouteState<number>('awTeam', 0);
  // 0x414d52: turneringen (+9) → "{competition} Awards", landets pris → "{nationality} Awards", ellers "International Awards"
  const compName = cur?.def?.comp ? cur.def.comp.find((n) => Object.values(g.comps).some((c) => c.name.toLowerCase() === n.toLowerCase())) ?? cur.def.comp[0] : undefined;
  const title = nation === null ? t('cmaw.title.intl') : compName ? t('cmaw.title.comp', { comp: cmCompShort(compName) }) : t('cmaw.title.nation', { nation: nationalityOf(g, nation) });
  const groups = cmAwardNations(g);
  const views = [
    ...defs.map((d) => ({ key: String(d.id), label: cmAwardName(d.id), checked: d.id === cur?.id, onClick: () => { setSel(d.id); setTeamIdx(0); } })),
    { key: 'sep', sep: true as const },
    ...groups.map((n) => ({ key: `n:${n}`, label: t('cmaw.title.nation', { nation: nationalityOf(g, n) }), checked: nation === n, onClick: () => { setNation(n); setSel(NATION_AWARDS[n].find((d) => d.id >= 0)?.id ?? -1); setTeamIdx(0); } })),
    { key: 'intl', label: t('cmaw.title.intl'), checked: nation === null, onClick: () => { setNation(null); setSel(INTL_AWARDS[0]); setTeamIdx(0); } },
  ];
  const team = kind === 'team' || kind === 'week' ? wins[Math.min(teamIdx, Math.max(0, wins.length - 1))] : undefined;
  const slots = teamSlots(cur?.def?.layout);
  const nothing = !wins.length && !past.length;
  return (
    <div className="cx-chist cx-awards">
      <Head title={title} />
      <div className="cx-tools">
        <CxDrop label={t('cmaw.view')} items={views} fixed />
        {team && wins.length > 1 && <CxDrop label={t('cmaw.season')} items={wins.map((w, i) => ({ key: String(i), label: kind === 'week' ? w.d : yr(w.y), checked: w === team, onClick: () => setTeamIdx(i) }))} fixed />}
      </div>
      {cur && <div className="cx-subtitle small">{cmAwardName(cur.id)}</div>}
      {nothing && <div className="cx-empty">{t('cmaw.none')}</div>}
      {(kind === 'month' || kind === 'mgrMonth') && wins.length > 0 && (
        <div className="cx-chist-tbl cx-aw-tbl">
          <div className="cx-chist-wh"><span>{t('cmaw.month')}</span><span>{t('cmaw.winner')}</span><span>{t('cmaw.club')}</span></div>
          {wins.map((w, i) => (
            <div key={i} className="cx-chist-row">
              <span className="cx-chist-btn">{MONTHS(w.m ?? 1)} {calYear(cur?.def, w.y, w.m ?? 1)}</span>
              {w.w[0] ? <Who g={g} {...w.w[0]} /> : <span />}
              {w.w[0] ? <Club g={g} id={w.w[0].club} /> : <span />}
            </div>
          ))}
        </div>
      )}
      {(kind === 'year' || kind === 'mgrYear') && wins.length > 0 && (
        <div className="cx-chist-tbl cx-aw-tbl">
          <div className="cx-chist-wh"><span>{t('cmaw.season')}</span><span>{t('cmaw.winner')}</span><span>{t('cmaw.second')}</span><span>{t('cmaw.third')}</span></div>
          {wins.map((w, i) => (
            <div key={i} className="cx-chist-row">
              <span className="cx-chist-btn">{yr(w.y)}</span>
              {[0, 1, 2].map((k) => (w.w[k] ? <span key={k}><Who g={g} {...w.w[k]} /> (<Club g={g} id={w.w[k].club} />)</span> : <span key={k} />))}
            </div>
          ))}
        </div>
      )}
      {team && (
        <div className="cx-chist-tbl cx-aw-team">
          <div className="cx-chist-wh"><span>{kind === 'week' ? t('cmaw.week', { date: team.d }) : yr(team.y)}</span><span>{t('cmaw.winner')}</span><span>{t('cmaw.club')}</span></div>
          {(team.team ?? []).map(([pid, club, mask], i) => (
            <div key={i} className={`cx-chist-row${i === 11 ? ' cx-aw-subs' : ''}`}>
              <span className="cx-chist-btn">{i >= 11 ? `${t('cmaw.subs')} ${SLOT_LABEL[mask] ?? ''}` : SLOT_LABEL[mask] ?? slots[i]}</span>
              {pid ? <Who g={g} id={pid} club={club} name={`${g.players[pid]?.first ?? ''} ${g.players[pid]?.last ?? ''}`.trim()} /> : <span>-</span>}
              {pid ? <Club g={g} id={club} /> : <span />}
            </div>
          ))}
        </div>
      )}
      {past.length > 0 && <>
        <div className="cx-subtitle small">{t('cmaw.past')}</div>
        <div className="cx-chist-tbl cx-aw-tbl">
          {past.map(([y, places], i) => (
            <div key={i} className="cx-chist-row">
              <span className="cx-chist-btn">{nation === null ? y : yr(y - 1)}</span>
              {[0, 1, 2].map((k) => <span key={k}>{places[k] ?? ''}</span>)}
            </div>
          ))}
        </div>
      </>}
      {nation === null && <div className="cx-empty small">{t('cmaw.notPorted')}</div>}
    </div>
  );
}
