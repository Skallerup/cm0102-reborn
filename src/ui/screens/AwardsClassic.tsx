// CM 01/02's Awards-skærm (award_screens.cpp i cm0102.exe 3.9.68: award_screens_open_award_screen 0x414c20, award_screen_draw 0x414cf0,
// årets pris 0x4156a0, holdpriserne 0x415f60) – kun den originale database i ægte tilstand. Titlen er "{nationality} Awards" (landets priser),
// "{competition} Awards" eller "International Awards" (0x414d68/0x414dbc/0x414df1); en pris uden vindere viser "No awards have been made."
// (0x41555f). Spillets vindere kommer fra cmAwards.ts (`g.cmAw.won`), de tidligere år fra databasens staff_comp_history.dat.
// *Estimeret*: opstillingen af rækkerne (ingen skærmbilleder af originalens skærm) og at den seneste Team of the Week vises.
import { cmAwardHistory, cmAwardName, cmAwardWins, ENGLAND_AWARDS, INTL_AWARDS, TEAM_SLOTS, type CmAwDef } from '../../game/cmAwards';
import type { GameState } from '../../game/types';
import { t } from '../../i18n';
import { CxDrop, CxLink } from '../classic';
import { useGame, useRouteState } from '../core';
import { Head } from './common';

const MONTHS = (m: number) => { try { return new Date(Date.UTC(2001, m - 1, 15)).toLocaleDateString(t('cl.locale'), { month: 'long', timeZone: 'UTC' }); } catch { return String(m); } };
const SLOT_LABEL: Record<number, string> = { 1: 'GK', 0x804: 'DR', 0x84: 'DL', 0x204: 'DC', 0x210: 'MC', 0x810: 'MR', 0x90: 'ML', 0x240: 'FC', 0x40: 'F', 4: 'D' };
const yr = (s: number) => `${s}/${String((s + 1) % 100).padStart(2, '0')}`;

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
  const [scope, setScope] = useRouteState<'nation' | 'intl'>('awScope', 'nation');
  const defs: { id: number; def?: CmAwDef }[] = scope === 'intl' ? INTL_AWARDS.map((id) => ({ id })) : ENGLAND_AWARDS.filter((d) => d.id >= 0).map((d) => ({ id: d.id, def: d }));
  const [sel, setSel] = useRouteState<number>('awId', defs[0]?.id ?? -1);
  const cur = defs.find((d) => d.id === sel) ?? defs[0];
  const wins = cur ? cmAwardWins(g, cur.id) : [];
  const past = cur ? cmAwardHistory(cur.id, g) : [];
  const kind = cur?.def?.kind;
  const [teamIdx, setTeamIdx] = useRouteState<number>('awTeam', 0);
  const title = scope === 'intl' ? t('cmaw.title.intl') : t('cmaw.title.nation', { nation: 'English' });
  const views = [
    ...defs.map((d) => ({ key: String(d.id), label: cmAwardName(d.id), checked: d.id === cur?.id, onClick: () => { setSel(d.id); setTeamIdx(0); } })),
    { key: 'sep', sep: true as const },
    { key: 'nation', label: t('cmaw.title.nation', { nation: 'English' }), checked: scope === 'nation', onClick: () => { setScope('nation'); setSel(ENGLAND_AWARDS[0].id); } },
    { key: 'intl', label: t('cmaw.title.intl'), checked: scope === 'intl', onClick: () => { setScope('intl'); setSel(INTL_AWARDS[0]); } },
  ];
  const team = kind === 'team' || kind === 'week' ? wins[Math.min(teamIdx, Math.max(0, wins.length - 1))] : undefined;
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
              <span className="cx-chist-btn">{MONTHS(w.m ?? 1)} {w.m && w.m >= 7 ? w.y : w.y + 1}</span>
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
              <span className="cx-chist-btn">{i >= 11 ? `${t('cmaw.subs')} ${SLOT_LABEL[mask] ?? ''}` : SLOT_LABEL[mask] ?? TEAM_SLOTS[i]}</span>
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
              <span className="cx-chist-btn">{scope === 'intl' ? y : yr(y - 1)}</span>
              {[0, 1, 2].map((k) => <span key={k}>{places[k] ?? ''}</span>)}
            </div>
          ))}
        </div>
      </>}
      {scope === 'intl' && <div className="cx-empty small">{t('cmaw.notPorted')}</div>}
    </div>
  );
}
