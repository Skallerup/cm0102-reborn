// Bestyrelsen: tillid og forventning samlet ét sted – plus ønsker man kan stille (budget, byggeri og fire andre).
import { useState } from 'react';
import { act } from '../../game/actions';
import { boardAskInfo } from '../../game/board';
import type { BoardAsk } from '../../game/types';
import { money, t } from '../../i18n';
import { Bar, Panel } from '../components';
import { useGame, useNav } from '../core';
import { Info } from '../help';
import { Head } from './common';

const ASKS: BoardAsk[] = ['lowerExp', 'confidenceVote', 'youthDrive', 'trainingCamp'];

export function BoardScreen() {
  const g = useGame()!;
  const { nav } = useNav();
  const [answer, setAnswer] = useState<Partial<Record<BoardAsk, string>>>({});
  const conf = Math.round(g.board.confidence);
  const tone = conf >= 60 ? 'good' : conf >= 35 ? 'warn' : 'bad';
  return (
    <div>
      <Head title={<>{t('nav.board')}<Info topic="board" /></>} />
      <div className="cols">
        <Panel title={t('ba.status')}>
          <div className="kv">
            <span>{t('ba.confidence')}</span><span><Bar value={conf} max={100} /> <b className={tone}>{conf}/100</b></span>
            <span>{t('club.expectation')}</span><span className="accent">{t(`exp.${g.board.expectation}`)} ({t('jobs.pos', { pos: g.board.expectedPos })})</span>
            <span>{t('ba.warnings')}</span><span className={g.board.warnings ? 'bad' : 'good'}>{g.board.warnings ? t('ba.warningsN', { n: g.board.warnings }) : t('ba.noWarnings')}</span>
          </div>
          <p className="muted">{t('ba.explain')}</p>
        </Panel>
        <Panel title={t('ba.money')}>
          <p className="muted" style={{ marginTop: 0 }}>{t('ba.moneyHint')}</p>
          <div className="row">
            <button onClick={() => nav({ name: 'finance', tab: 'overview' })}>{t('ba.toBudget')}</button>
            <button onClick={() => nav({ name: 'finance', tab: 'facilities' })}>{t('ba.toProjects')}</button>
          </div>
        </Panel>
      </div>
      <div className="ba-grid">
        {ASKS.map((k) => {
          const info = boardAskInfo(k);
          const res = answer[k];
          return (
            <Panel key={k} title={t(`ba.${k}`)}>
              <p className="ba-desc">{t(`ba.${k}.desc`)}</p>
              {info.cost !== undefined && <div className="kv"><span>{t('ba.cost')}</span><span><b>{money(info.cost)}</b></span></div>}
              {!info.blocked && (
                <>
                  <div className="row" style={{ gap: 4, margin: '8px 0' }}>
                    {info.pros.map((x) => <span key={x} className="tag good">{t(x)}</span>)}
                    {info.cons.map((x) => <span key={x} className="tag bad">{t(x)}</span>)}
                  </div>
                  <div className="row">
                    <button className="primary" disabled={!!res} onClick={() => setAnswer({ ...answer, [k]: act<string>({ t: 'boardAsk', kind: k }) })}>{t('ba.ask')}</button>
                    {!res && <span className={`tag ${info.likely === 'yes' ? 'good' : info.likely === 'maybe' ? 'warn' : 'bad'}`}>{t(`ba.likely.${info.likely}`)}</span>}
                  </div>
                </>
              )}
              {res && <div className={`insight ${res === 'yes' ? 'good' : 'bad'}`}>{t(res === 'yes' ? `ba.yes.${k}.short` : res === 'no' ? 'ba.no.short' : 'ba.blocked.generic')}</div>}
              {info.blocked && !res && <div className="muted">{t(info.blocked)}</div>}
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
