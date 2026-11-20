// Reserveholdets Last Match (0x4671e0) og "Reserves Latest" (0x723dd2) i det klassiske tema – bygget af det, reservekampene gemmer
// (g.cmRsv.last/day, cmReserveMatches.ts): menneskeklubbens seneste reservekamp (resultat, målscorere, Match Stats af den kompakte rapport)
// og den seneste spillede dags reservekampe for alle klubber. Uden en spillet kamp: "No recent reserve matches have been played."
import { useState } from 'react';
import { unpackReport } from '../../game/miniReport';
import type { Fixture } from '../../game/types';
import type { CmRsvResult } from '../../game/cmReserveMatches';
import { RSV_COMP } from '../../game/cmReserveMatches';
import { t } from '../../i18n';
import { ClassicSub, cxLongDate } from '../classic';
import { Tabs } from '../components';
import { useGame, useNav } from '../core';
import { CmScoreboard, CxMatchStats, CxScores, teamColors } from './Match';
import { NoRecentMatchesClassic } from './NoRecentMatchesClassic';

const asFixture = (r: CmRsvResult, date: string): Fixture => ({
  id: r.id, comp: RSV_COMP, date, home: r.h, away: r.a, round: 0,
  result: { hg: r.hg, ag: r.ag, scorers: r.s.map(([m, side, p, og]) => (og ? [m, side, p, 1] : [m, side, p]) as [number, number, number]) },
});

export function ReserveMatchClassic() {
  const g = useGame()!;
  const { nav } = useNav();
  const [tab, setTab] = useState<'overview' | 'stats' | 'scores'>('overview');
  const last = g.cmRsv?.last?.[g.userClub];
  if (!last) return <NoRecentMatchesClassic res />;
  const colors = teamColors(last.h, last.a, g.userClub);
  const rep = last.mini ? unpackReport(last.mini, last.id, last.h, last.a) : undefined;
  const day = g.cmRsv?.day;
  const rows = (day?.r ?? []).map((r) => asFixture(r, day!.d));
  const own = asFixture(last, last.d);
  const others = rows.filter((f) => f.id !== last.id);
  return (
    <div className="match-screen cx-rsv-match">
      <CmScoreboard home={last.h} away={last.a} hg={last.hg} ag={last.ag} colors={colors} classic minute={t('match.ft')} />
      <Tabs tabs={[['overview', t('match.overview')], ...(rep ? [['stats', t('cl.mt.stats')]] : [])] as [string, string][]} value={tab} onChange={(k) => setTab(k as typeof tab)} />
      {tab === 'overview' && (
        <div className="cx-mo">
          <div className="cx-subtitle small">{t('match.ft')}</div>
          <div className="cx-mo-meta"><span>{cxLongDate(last.d)}</span><span>{t('cl.res.comp')}</span></div>
          <div className="cx-mo-scorers">
            {[0, 1].map((side) => (
              <div key={side} className={side ? 'away' : ''}>
                {last.s.filter((e) => e[1] === side).map((e, i) => (
                  <div key={i} className={`cx-mo-goal ${e[3] ? 'og' : ''}`}>
                    <span><span className="cx-link" role="link" onClick={() => e[2] && nav({ name: 'player', id: e[2] })}>{g.players[e[2]]?.last ?? ''}</span>{e[3] ? ` ${t('cl.mt.og')}` : ''}</span><b>{e[0]}</b>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === 'stats' && rep && <CxMatchStats st={rep.stats} />}
      {tab === 'scores' && <CxScores own={{ f: own, scorers: own.result!.scorers.map(([m, s, p, og]) => [m, s, og ? undefined : p] as [number, number, number?]) }} others={others} minute={90} finished title={t('cl.res.latest')} />}
      <ClassicSub items={[['scores', t('cl.res.latest')]].map(([k, l]) => ({ key: k, label: l, on: tab === k, onClick: () => setTab(k as typeof tab) }))} />
    </div>
  );
}
