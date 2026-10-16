import { requestBudget } from '../../game/board';
import { currentWageBill } from '../../game/finance';
import { notify } from '../../game/state';
import { fromCur, money, t, toCur } from '../../i18n';
import { Bar, Panel } from '../components';
import { useGame } from '../core';
import { Head } from './common';

export function Finance() {
  const g = useGame()!;
  const c = g.clubs[g.userClub];
  const bill = currentWageBill(c.id);
  const staffBill = Object.values(g.staff).filter((s) => s.club === c.id).reduce((s, x) => s + x.wage, 0);
  const f = c.finance;
  const income = f.gate + f.tv + f.prize + f.sponsor + f.merch + f.transfersIn;
  const expense = f.wages + f.transfersOut + f.other;
  return (
    <div>
      <Head title={t('nav.finance')} />
      <div className="cols">
        <Panel title={t('fin.overview')}>
          <div className="kv">
            <span>{t('top.balance')}</span><span className={c.balance < 0 ? 'bad' : 'good'}><b>{money(c.balance)}</b></span>
            <span>{t('top.budget')}</span><span>{money(c.transferBudget)}</span>
            <span>{t('fin.wageBudget')}</span><span>{money(c.wageBudget)} / {t('common.week')}</span>
            <span>{t('fin.wageBill')}</span><span><Bar value={bill} max={c.wageBudget} tone={bill > c.wageBudget ? 'bad' : 'good'} /> {money(bill)} + {money(staffBill)} {t('fin.staff')}</span>
            <span>{t('fin.ticket')}</span><span>{money(c.ticketPrice)}</span>
            <span>{t('club.stadium')}</span><span>{c.stadium} ({c.seats.toLocaleString()})</span>
          </div>
        </Panel>
        <Panel title={t('fin.season')}>
          <div className="kv">
            <span>{t('fin.gate')}</span><span>{money(f.gate)}</span>
            <span>{t('fin.tv')}</span><span>{money(f.tv)}</span>
            <span>{t('fin.prize')}</span><span>{money(f.prize)}</span>
            <span>{t('fin.sponsor')}</span><span>{money(f.sponsor)}</span>
            <span>{t('fin.merch')}</span><span>{money(f.merch)}</span>
            <span>{t('fin.sales')}</span><span>{money(f.transfersIn)}</span>
            <span><b>{t('fin.income')}</b></span><span><b className="good">{money(income)}</b></span>
            <span>{t('fin.wages')}</span><span>{money(f.wages)}</span>
            <span>{t('fin.purchases')}</span><span>{money(f.transfersOut)}</span>
            <span>{t('fin.other')}</span><span>{money(f.other)}</span>
            <span><b>{t('fin.expense')}</b></span><span><b className="bad">{money(expense)}</b></span>
          </div>
        </Panel>
        <Panel title={t('fin.board')}>
          <div className="col">
            <div className="muted">{t('fin.requestHint')}</div>
            <button onClick={() => { requestBudget('transfer'); notify(); }}>{t('fin.askTransfer')}</button>
            <button onClick={() => { requestBudget('wage'); notify(); }}>{t('fin.askWage')}</button>
            <label>{t('fin.ticket')}: <input type="number" min={1} value={toCur(c.ticketPrice)} onChange={(e) => { c.ticketPrice = Math.max(1, fromCur(Number(e.target.value))); notify(); }} style={{ width: 70 }} /></label>
          </div>
        </Panel>
      </div>
    </div>
  );
}
