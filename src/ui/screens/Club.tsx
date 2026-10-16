import { squadStrength } from '../../game/board';
import { gs, squad } from '../../game/state';
import { money, t } from '../../i18n';
import { Bar, Crest, Panel } from '../components';
import { useGame } from '../core';
import { Head } from './common';
import { SquadTable } from './Squad';

export function ClubScreen({ id }: { id?: number }) {
  const g = useGame()!;
  const cid = id ?? g.userClub;
  const c = g.clubs[cid];
  if (!c) return <Head title="?" />;
  const mine = cid === g.userClub;
  const manager = g.staff[c.manager];
  const players = squad(cid);
  return (
    <div>
      <Head title={<><Crest id={c.id} size={40} /> {c.name}</>} />
      <div className="cols">
        <Panel title={t('club.info')}>
          <div className="kv">
            <span>{t('col.comp')}</span><span>{g.leagues[c.league]?.name ?? c.league}</span>
            <span>{t('col.nat')}</span><span>{g.nations[c.nation]?.name}</span>
            <span>{t('club.manager')}</span><span>{c.manager === -1 ? g.manager.name : manager ? `${manager.first} ${manager.last}` : t('club.vacant')}</span>
            <span>{t('club.stadium')}</span><span>{c.stadium} ({c.seats.toLocaleString()})</span>
            <span>{t('club.rep')}</span><span><Bar value={c.rep} /> {c.rep}</span>
            <span>{t('club.strength')}</span><span>{squadStrength(cid).toFixed(0)}</span>
            <span>{t('club.youth')}</span><span><Bar value={c.youth} max={20} /></span>
            <span>{t('club.facilities')}</span><span><Bar value={c.facilities} max={20} /></span>
            {(mine || !g.options.masking) && <><span>{t('top.balance')}</span><span>{money(c.balance)}</span></>}
          </div>
        </Panel>
        {mine && (
          <Panel title={t('club.board')}>
            <div className="kv">
              <span>{t('club.expectation')}</span><span className="accent">{t(`exp.${g.board.expectation}`)}</span>
              <span>{t('club.confidence')}</span><span><Bar value={g.board.confidence} /> {Math.round(g.board.confidence)}%</span>
              <span>{t('club.warnings')}</span><span>{g.board.warnings}</span>
              <span>{t('club.managerRep')}</span><span><Bar value={g.manager.rep} /> {Math.round(g.manager.rep)}</span>
            </div>
            <p className="muted">{t(`conf.${g.board.confidence >= 75 ? 'delighted' : g.board.confidence >= 55 ? 'pleased' : g.board.confidence >= 35 ? 'concerned' : 'danger'}`)}</p>
          </Panel>
        )}
        <Panel title={t('club.history')}>
          {c.history.length === 0 ? <div className="muted">{t('comp.noHistory')}</div> : (
            <table className="grid">
              <tbody>{c.history.slice().reverse().map((h) => <tr key={h.season}><td>{h.season}/{String(h.season + 1).slice(2)}</td><td>{gs().leagues[h.league]?.name ?? h.league}</td><td className="num">{h.pos}.</td><td className="num">{h.pts} p</td></tr>)}</tbody>
            </table>
          )}
        </Panel>
      </div>
      {!mine && <SquadTable players={players} view="general" userClub={g.userClub} />}
    </div>
  );
}
