// "FA Premier League → Player Stats" (CM 01/02): View-menuen med de 17 statistikarter (0x7c1b20's arter 1–16 og 0x11 Average Rating – rækkefølgen
// efter skærmbilledet), Filter til højre, den valgte art som gul overskrift og en liste: spiller, klub (gul) og værdien i en lilla kasse.
// Tallene er ligaens PlayerStats-post (kategori 2, cmPlayerData.ts statValue/statCell); spil uden posten (ældre/udvidede spil) bruger ligatællerne.
import { statCell, statValue, ST } from '../../game/cmPlayerData';
import { squad } from '../../game/state';
import type { Competition, GameState, Player } from '../../game/types';
import { t } from '../../i18n';
import { CxDrop, CxLink } from '../classic';
import { useGame, useRouteState } from '../core';
import { posGroup } from './Training';

/** menuens rækkefølge → artens nummer (0x7c2150) */
export const PS_KINDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17] as const;
const KEY: Record<number, string> = { 1: 'apps', 2: 'goals', 3: 'conceded', 4: 'pens', 5: 'assists', 6: 'teamGoals', 7: 'teamConceded', 8: 'won', 9: 'lost', 10: 'yellow', 11: 'red', 12: 'mom', 13: 'pass', 14: 'tackles', 15: 'dribbles', 16: 'sot', 17: 'avg' };
export const psLabel = (k: number) => t(k === 1 ? 'cl.sq.apps' : k === 2 ? 'cl.sq.goals' : k === 5 ? 'cl.sq.assists' : `cl.ps.${KEY[k]}`);

/** ligaens post: PlayerStats kategori 2, ellers bygget af ligatællerne (kun kampe, mål, assists, kampens spiller, karakter, kort) */
function entry(p: Player): number[] | undefined {
  const e = p.cmStats?.[2];
  if (e) return e;
  const s = p.stats;
  if (!s.lgApps) return undefined;
  const a = new Array(22).fill(0);
  a[ST.apps] = s.lgApps; a[ST.goals] = s.lgGoals; a[ST.b6] = s.lgAssists ?? 0; a[ST.mom] = s.lgMom ?? 0;
  a[ST.rating] = Math.round(s.lgRatingSum ?? 0); a[ST.b11] = s.yellows; a[ST.b12] = s.reds;
  return a;
}

export function ClassicPlayerStats({ comp }: { comp: Competition }) {
  const g: GameState = useGame()!;
  const [kind, setKind] = useRouteState<number>('psKind', 17);
  const [pos, setPos] = useRouteState<string>('psPos', 'all');
  const maxPlayed = Math.max(1, ...comp.table.map((r) => r.p));
  const rows = comp.clubs.flatMap((c) => squad(c)).filter((p) => pos === 'all' || posGroup(p) === pos).map((p) => {
    const e = entry(p);
    return { p, e, v: e ? statValue(e, kind, 0) : 0 };
  }).filter((r) => r.e && r.v > 0 && (kind < 13 || (r.e[ST.apps] & 0xff) >= Math.max(1, Math.round(maxPlayed * 0.25))))
    .sort((a, b) => b.v - a.v || a.p.last.localeCompare(b.p.last)).slice(0, 100);
  return (
    <div className="cx-ps-wrap">
      <div className="cx-tools">
        <CxDrop label={t('cl.sq.view')} items={PS_KINDS.map((k) => ({ key: String(k), label: psLabel(k), checked: k === kind, onClick: () => setKind(k) }))} fixed />
        <CxDrop className="cx-ps-filter" label={t('cl.sq.filter')} align="right" fixed items={['all', 'gk', 'def', 'mid', 'att'].map((k) => ({ key: k, label: t(k === 'all' ? 'cl.sq.fo.allPos' : `cl.sq.fo.${k}`), checked: pos === k, onClick: () => setPos(k) }))} />
      </div>
      <div className="cx-ps">
        <div className="cx-ps-head">{psLabel(kind)}</div>
        {rows.length === 0 && <div className="cx-empty">{t('common.none')}</div>}
        {rows.map(({ p, e }) => (
          <div key={p.id} className="cx-ps-row">
            <span className={`nm${p.club === g.userClub ? ' me' : ''}`}><CxLink to={{ name: 'player', id: p.id }}>{`${p.first} ${p.last}`.trim()}</CxLink></span>
            <span className="cl"><CxLink to={{ name: 'club', id: p.club }}>{g.clubs[p.club]?.short ?? g.clubs[p.club]?.name ?? ''}</CxLink></span>
            <span className="val">{statCell(e, kind)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
