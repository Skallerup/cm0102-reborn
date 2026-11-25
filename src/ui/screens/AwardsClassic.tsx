// CM 01/02's Awards-skærm (award_screens.cpp i cm0102.exe 3.9.68: award_screens_open_award_screen 0x414c20, award_screen_draw 0x414cf0,
// årets pris 0x4156a0, holdpriserne 0x415f60) – den originale database (og CM-databaser) i ægte tilstand. Skærmen åbnes med én pris
// (AWARD_MANAGER 0x414a60: et indlæst lands pris med det staff_comp-id) og viser dens lands priser; titlen følger den valgte pris (0x414d52):
// en pris med turnering → "{competition} Awards" (turneringens korte navn), ellers landets "{nationality} Awards", ellers "International Awards".
// Nations ▸ <land> ▸ Awards findes kun for lande med et NationAwards-objekt (0x75f891: 0x414340) og åbner landets første pris; en turnerings
// Awards (0x490171: 0x414ac0) den første pris for turneringen. En pris uden vindere viser "No awards have been made." (0x41555f).
// Spillets vindere kommer fra cmAwards.ts (`g.cmAw.won`), de tidligere år fra databasens staff_comp_history.dat.
// *Estimeret*: opstillingen af rækkerne (ingen skærmbilleder af originalens skærm) og at den seneste Team of the Week vises.
import { awardsStart, cmAwardHistory, cmAwardName, cmAwardShort, cmAwardWins, cmCompShort, INTL_AWARDS, NATION_AWARDS, natIdx, type CmAwDef } from '../../game/cmAwards';
import type { GameState } from '../../game/types';
import { compName as compTitle, getLang, natName, t } from '../../i18n';
import { CxDrop, CxLink, titleColors } from '../classic';
import { useGame, useNav, useRouteState } from '../core';
import { DEMONYM } from '../demonyms';
import { Head } from './common';

const MONTHS = (m: number) => { try { return new Date(Date.UTC(2001, m - 1, 15)).toLocaleDateString(t('cl.locale'), { month: 'long', timeZone: 'UTC' }); } catch { return String(m); } };
/** månedens kalenderår i sæsonen y (MONTH_AWARD-vinduet fra-måned..til-måned, 0–11) */
const calYear = (d: CmAwDef | undefined, y: number, m: number) => { const [a, b] = d?.months ?? [7, 4]; return a > b && m - 1 < a ? y + 1 : y; };
const yr = (s: number) => `${s}/${String((s + 1) % 100).padStart(2, '0')}`;

/** landets nationalitetsord (nation.dat +87) – på andre sprog landets navn */
export function nationalityOf(g: GameState, nation: string): string {
  const n = g.nations[natIdx(g, nation)];
  return getLang() === 'en' ? n?.adj ?? DEMONYM[nation] ?? nation : natName(nation);
}

/** "20 May 2002" */
const longDate = (iso: string) => { try { return new Date(iso.slice(0, 10) + 'T12:00:00Z').toLocaleDateString(t('cl.locale'), { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }); } catch { return iso; } };
/** bane-rækkens højde (andel fra toppen): angribere øverst, målmand nederst */
const ROW_Y = (mask: number) => (mask === 1 ? 94 : mask & 2 ? 84 : mask & 0x40 ? 17 : mask & 0x20 ? 33 : mask & 0x10 ? 49 : mask & 0x8 && !(mask & 4) ? 62 : 75);

/** Team of the Week/Year: den grønne bane med de elleve (pladserne 0–10) som cirkler i klubbens farver med trøjenummer og efternavn under */
function AwPitch({ g, team }: { g: GameState; team: [number, number, number][] }) {
  const xi = team.slice(0, 11).map(([pid, club, mask], i) => ({ pid, club, mask, i, y: ROW_Y(mask) }));
  const rows = new Map<number, typeof xi>();
  for (const e of xi) rows.set(e.y, [...(rows.get(e.y) ?? []), e]);
  const side = (m: number) => (m & 0x800 ? 2 : m & 0x80 ? 0 : 1);
  return (
    <div className="cx-aw-pitch">
      <div className="cx-aw-lines"><i className="b1" /><i className="b2" /><i className="b3" /><i className="b4" /><i className="mid" /><i className="circ" /></div>
      {[...rows.entries()].flatMap(([y, es]) => es.slice().sort((a, b) => side(a.mask) - side(b.mask) || a.i - b.i).map((e, k, arr) => {
        const p = g.players[e.pid];
        if (!p) return null;
        const col = titleColors(e.club);
        return (
          <div key={e.i} className="cx-aw-pl" style={{ left: `${arr.length === 1 ? 50 : 12 + (76 * k) / (arr.length - 1)}%`, top: `${y}%` }}>
            <span className="cx-aw-dot" style={{ background: col.bg, color: col.fg }}>{p.number ?? ''}</span>
            <span className="cx-aw-pn">{p.last}</span>
          </div>
        );
      }))}
    </div>
  );
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
  const [nation] = useRouteState<string | null>('awGroup', start.nation);
  const defs: { id: number; def?: CmAwDef }[] = nation === null ? INTL_AWARDS.map((id) => ({ id })) : (NATION_AWARDS[nation] ?? []).filter((d) => d.id >= 0).map((d) => ({ id: d.id, def: d }));
  const [sel, setSel] = useRouteState<number>('awSel', start.id);
  const cur = defs.find((d) => d.id === sel) ?? defs[0];
  const wins = cur ? cmAwardWins(g, cur.id) : [];
  const past = cur ? cmAwardHistory(cur.id, g) : [];
  const kind = cur?.def?.kind;
  const [teamIdx, setTeamIdx] = useRouteState<number>('awTeam', 0);
  // 0x414d52: turneringen (+9) → "{competition} Awards", landets pris → "{nationality} Awards", ellers "International Awards"
  const compName = cur?.def?.comp ? cur.def.comp.find((n) => Object.values(g.comps).some((c) => c.name.toLowerCase() === n.toLowerCase())) ?? cur.def.comp[0] : undefined;
  const compGame = compName ? Object.values(g.comps).find((c) => c.name.toLowerCase() === compName.toLowerCase()) : undefined;
  const title = nation === null ? t('cmaw.title.intl') : compName ? t('cmaw.title.comp', { comp: (compGame ? compTitle(compGame.name) : cmCompShort(compName)) }) : t('cmaw.title.nation', { nation: nationalityOf(g, nation) });
  // CM 01/02's View-menu: kun prisens egne priser (landets/turneringens), den valgte med et flueben
  const sameGroup = (d: { def?: CmAwDef }) => (d.def?.comp ?? []).join('|') === (cur?.def?.comp ?? []).join('|');
  const views = defs.filter(sameGroup).map((d) => ({ key: String(d.id), label: cmAwardShort(d.id), checked: d.id === cur?.id, onClick: () => { setSel(d.id); setTeamIdx(0); } }));
  const team = kind === 'team' || kind === 'week' ? wins[Math.min(teamIdx, Math.max(0, wins.length - 1))] : undefined;
  const nothing = !wins.length && !past.length;
  return (
    <div className="cx-chist cx-awards">
      <Head title={title} />
      <div className="cx-tools">
        <CxDrop label={t('cmaw.view')} items={views} fixed />
        {team && wins.length > 1 && <CxDrop label={t('cmaw.season')} items={wins.map((w, i) => ({ key: String(i), label: kind === 'week' ? w.d : yr(w.y), checked: w === team, onClick: () => setTeamIdx(i) }))} fixed />}
      </div>
      {cur && <div className="cx-subtitle cx-aw-band">{cmAwardName(cur.id)}</div>}
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
        <div className="cx-aw-split">
          <div className="cx-aw-left">
            <div className="cx-aw-period">{kind === 'week' ? t('cmaw.week', { date: longDate(team.d) }) : yr(team.y)}</div>
            <div className="cx-aw-list">
              {(team.team ?? []).map(([pid, club], i) => {
                const p = pid ? g.players[pid] : undefined;
                return (
                  <div key={i} className={`cx-aw-row${i >= 11 ? ' sub' : ''}`}>
                    <span className="cx-aw-no">{p?.number ?? ''}</span>
                    {p ? <Who g={g} id={pid} club={club} name={`${p.first} ${p.last}`.trim()} /> : <span />}
                    {p ? <Club g={g} id={club} /> : <span />}
                  </div>
                );
              })}
            </div>
          </div>
          <AwPitch g={g} team={team.team ?? []} />
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
    </div>
  );
}
