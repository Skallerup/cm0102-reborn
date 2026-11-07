// Next Match i klassisk tema som i CM 01/02: kampens data som en liste (dato, stadion, regler, sidste opgør, vejr, bane,
// dommer, klubnyt), << Date / Date >> blader i kampprogrammet, Past Meetings viser de tidligere opgør.
import { useState } from 'react';
import { benchSize, maxSubs } from '../../game/rules';
import type { Fixture } from '../../game/types';
import { pitchFor, refereeFor, weatherFor } from '../../game/weather';
import { compName, t } from '../../i18n';
import { useGame, useNav } from '../core';
import { classicDate } from '../classic';

export function ClassicNextMatch({ onAssistant }: { onAssistant?: () => void }) {
  const g = useGame()!;
  const { nav } = useNav();
  const me = g.userClub;
  const upcoming = Object.values(g.fixtures).filter((f) => !f.result && (f.home === me || f.away === me)).sort((a, b) => a.date.localeCompare(b.date));
  const [i, setI] = useState(0);
  const [past, setPast] = useState(false);
  const f: Fixture | undefined = upcoming[Math.min(i, upcoming.length - 1)];
  const tools = (
    <div className="cx-tools">
      <button className="cx-greybtn" disabled={i <= 0} onClick={() => setI(i - 1)}>{t('cl.nm.prev')}</button>
      <button className="cx-greybtn" disabled={i >= upcoming.length - 1} onClick={() => setI(i + 1)}>{t('cl.nm.next')}</button>
      <span className="grow" />
      {onAssistant && <button className="cx-greybtn" onClick={onAssistant}>{t('cl.nm.assistant')}</button>}
      <button className={`cx-greybtn ${past ? 'on' : ''}`} disabled={!f} onClick={() => setPast(!past)}>{t('cl.nm.past')}</button>
    </div>
  );
  if (!f) return <>{tools}<div className="cx-empty">{t('as.noMatch')}</div></>;
  const home = f.home === me;
  const opp = home ? f.away : f.home;
  const club = (id: number) => g.clubs[id];
  const meetings = Object.values(g.fixtures).filter((x) => x.result && ((x.home === me && x.away === opp) || (x.home === opp && x.away === me))).sort((a, b) => b.date.localeCompare(a.date));
  const score = (x: Fixture) => `${club(x.home)?.short} ${x.result!.hg}-${x.result!.ag} ${club(x.away)?.short}, ${compName(g.comps[x.comp]?.name)} ${classicDate(x.date)[1]}`;
  const d = new Date(`${f.date}T12:00:00`);
  const today = f.date === g.date;
  const ven = club(f.home);
  const w = weatherFor(f);
  // klubnyt: skadede og karantæneramte i ens egen trup
  const news = Object.values(g.players).filter((p) => p.club === me && (p.injury || p.banned > 0)).map((p) => t(p.injury ? 'cl.nm.injured' : 'cl.nm.suspended', { name: `${p.first} ${p.last}`.trim() }));
  const rows: [string, string | string[]][] = [
    [t('cl.nm.date'), `${d.toLocaleDateString(t('cl.locale'), { weekday: 'long', day: 'numeric', month: 'long' })}${today ? ` (${t('cl.nm.today')})` : ''}`],
    [t('cl.nm.venue'), ven ? `${ven.stadium ?? ''}, ${ven.short}` : '-'],
    [t('cl.nm.rules'), [t('cl.nm.noRestr'), t('cl.nm.subs', { named: benchSize(), used: maxSubs() })]],
    [t('cl.nm.last'), meetings[0] ? score(meetings[0]) : t('common.none')],
    [t('cl.nm.weather'), t(`wx.${w}`)],
    [t('cl.nm.pitch'), t(`pitch.${pitchFor(f, w)}`)],
    [t('cl.nm.referee'), refereeFor(f).name],
    [t('cl.nm.news', { club: club(me)?.short ?? '' }), news.length ? news.slice(0, 4) : t('common.none')],
  ];
  return (
    <>
      {tools}
      <div className="cx-subtitle">{club(opp)?.name} ({t(home ? 'cl.nm.home' : 'cl.nm.away')})</div>
      <div className="cx-nm">
        <div className="cx-nm-comp"><span className="cx-link" role="link" onClick={() => nav({ name: 'competitions', id: f.comp })}>{compName(g.comps[f.comp]?.name)}</span></div>
        {past ? (
          <div className="cx-nm-list">{meetings.length ? meetings.slice(0, 12).map((x) => <div key={x.id} className="cx-nm-row"><span /><span className="v">{score(x)}</span></div>) : <div className="cx-empty">{t('common.none')}</div>}</div>
        ) : (
          <div className="cx-nm-list">{rows.map(([l, v]) => (Array.isArray(v) ? v : [v]).map((x, k) => <div key={`${l}${k}`} className="cx-nm-row"><span>{k === 0 ? l : ''}</span><span className="v">{x}</span></div>))}</div>
        )}
      </div>
    </>
  );
}
