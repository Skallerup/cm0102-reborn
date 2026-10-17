import { squad } from '../../game/state';
import { Info } from '../help';
import { act } from '../../game/actions';
import { SCHEDULES } from '../../game/training';
import { ageOn } from '../../game/dates';
import { t } from '../../i18n';
import { Bar, Panel, PlayerLink, Stars, posStr } from '../components';
import { useGame } from '../core';
import { Head } from './common';
import { scoutStars } from '../../game/scouting';
import { coachingInfo, trainingAdvice } from '../../game/training';
import { Arrow, totalDelta } from '../dev';

export function Training() {
  const g = useGame()!;
  const players = squad(g.userClub).sort((a, b) => b.pos.indexOf(20) - a.pos.indexOf(20));
  const coaches = Object.values(g.staff).filter((s) => s.club === g.userClub && (s.role === 'coach' || s.role === 'assistant'));
  const avg = coaches.length ? coaches.reduce((s, c) => s + c.attrs.coaching, 0) / coaches.length : 0;
  const club = g.clubs[g.userClub];
  const ci = coachingInfo(g.userClub);
  const setAll = (key: string) => act({ t: 'trainingAll', key });
  return (
    <div>
      <Head title={<>{t('nav.training')}<Info topic="development" /></>}>
        <button className="primary" onClick={() => { for (const p of players) { const a = trainingAdvice(p); if (a.key !== p.training) act({ t: 'training', pid: p.id, key: a.key }); } }}>{t('adv.followAll')}</button>
        <select value="" onChange={(e) => e.target.value && setAll(e.target.value)}>
          <option value="">{t('train.setAll')}</option>
          {SCHEDULES.map((s) => <option key={s.key} value={s.key}>{t(`train.${s.key}`)}</option>)}
        </select>
      </Head>
      <div className="cols">
        <Panel title={t('train.quality')}>
          <div className="kv">
            <span>{t('train.coaches')}</span><span>{coaches.length}</span>
            <span>{t('train.avgCoaching')}</span><span><Bar value={avg} max={20} /> {avg.toFixed(1)}</span>
            <span>{t('club.facilities')}</span><span><Bar value={club.facilities} max={20} /> {club.facilities}</span>
            <span>{t('train.effect')}</span><span className={ci.factor >= 1 ? 'good' : 'bad'}><b>{ci.factor >= 1 ? '+' : ''}{Math.round((ci.factor - 1) * 100)}%</b> {t('train.effectVs')}</span>
            <span>{t('staff.discipline')}</span><span><Bar value={ci.discipline * 20} max={20} /> <span className="muted">{t('train.disciplineHint')}</span></span>
            <span>{t('staff.motivating')}</span><span><Bar value={ci.motivating * 20} max={20} /> <span className="muted">{t('train.motivatingHint')}</span></span>
          </div>
          <table className="grid" style={{ marginTop: 10 }}>
            <tbody>
              {coaches.sort((a, b) => b.attrs.coaching - a.attrs.coaching).map((c) => (
                <tr key={c.id}><td>{c.first} {c.last}</td><td className="muted">{t(`role.staff.${c.role}`)}</td><td className="num"><span className={`attr ${c.attrs.coaching >= 16 ? 'a-top' : c.attrs.coaching >= 13 ? 'a-good' : c.attrs.coaching >= 9 ? 'a-mid' : 'a-low'}`}>{c.attrs.coaching}</span></td></tr>
              ))}
            </tbody>
          </table>
          <p className="muted">{t('train.explain')}</p>
        </Panel>
        <Panel title={t('train.schedules')}>
          <div className="kv">
            {SCHEDULES.map((s) => [<span key={s.key}>{t(`train.${s.key}`)}</span>, <span key={s.key + 'd'} className="muted">{Object.keys(s.focus).slice(0, 4).map((k) => t(`attr.${k}`)).join(', ') || t('train.restDesc')}</span>])}
          </div>
        </Panel>
      </div>
      <Panel title={t('nav.squad')} className="flush">
        <div className="table-wrap">
          <table className="grid">
            <thead><tr><th>{t('col.pos')}</th><th>{t('col.name')}</th><th className="num">{t('col.age')}</th><th>{t('player.potential')}</th><th>{t('col.cond')}</th><th>{t('dev.col3m')}</th><th>{t('nav.training')}</th><th>{t('adv.col')}</th></tr></thead>
            <tbody>
              {players.map((p) => (
                <tr key={p.id}>
                  <td>{posStr(p)}</td>
                  <td><PlayerLink p={p} /></td>
                  <td className="num">{ageOn(p.dob, g.date)}</td>
                  <td><Stars range={scoutStars(p).potential} /></td>
                  <td><Bar value={p.condition} /></td>
                  <td>{p.dev && p.dev.length > 1 ? <Arrow d={totalDelta(p, 3)} /> : <span className="muted">–</span>}</td>
                  <td>
                    <select value={p.training} onChange={(e) => act({ t: 'training', pid: p.id, key: e.target.value })}>
                      {SCHEDULES.map((s) => <option key={s.key} value={s.key}>{t(`train.${s.key}`)}</option>)}
                    </select>
                  </td>
                  <td>{(() => {
                    const a = trainingAdvice(p);
                    const why = t(a.reason, { attrs: a.attrs.map((x) => t(`attr.${x}`)).join(` ${t('common.and')} `) });
                    return a.key === p.training
                      ? <span className="tag good" title={why}>✓ {t(`train.${a.key}`)}</span>
                      : <span title={why}><span className="tag warn">{t(`train.${a.key}`)}</span> <button className="small" onClick={() => act({ t: 'training', pid: p.id, key: a.key })}>{t('adv.use')}</button></span>;
                  })()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
