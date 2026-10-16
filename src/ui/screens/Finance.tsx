import { act } from '../../game/actions';
import { currentWageBill, estimateGate, fairTicketPrice } from '../../game/finance';
import { projectOffer } from '../../game/board';
import type { ProjectKind } from '../../game/types';
import { dateFmt, money, t } from '../../i18n';
import { Bar, MoneyInput, Panel } from '../components';
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
            <button onClick={() => act({ t: 'budget', kind: 'transfer' })}>{t('fin.askTransfer')}</button>
            <button onClick={() => act({ t: 'budget', kind: 'wage' })}>{t('fin.askWage')}</button>
          </div>
        </Panel>
      </div>
      <div className="cols">
        <TicketPanel />
        <ProjectsPanel />
      </div>
    </div>
  );
}

function TicketPanel() {
  const g = useGame()!;
  const c = g.clubs[g.userClub];
  const fair = fairTicketPrice(c.rep, c.league);
  const now = estimateGate(c, c.ticketPrice);
  const options = [0.6, 0.8, 1, 1.15, 1.3, 1.6].map((f) => Math.max(1, Math.round(fair * f)));
  if (!options.includes(c.ticketPrice)) options.push(c.ticketPrice);
  options.sort((a, b) => a - b);
  const rows = options.map((price) => ({ price, ...estimateGate(c, price) }));
  const best = rows.reduce((a, b) => (b.income > a.income ? b : a));
  return (
    <Panel title={t('ticket.title')}>
      <div className="col">
        <label className="row">{t('fin.ticket')}:
          <MoneyInput value={c.ticketPrice} min={1} width={90} onChange={(v) => act({ t: 'ticket', price: v })} />
        </label>
        <div className="kv">
          <span>{t('ticket.fair')}</span><span>{money(fair)}</span>
          <span>{t('ticket.expected')}</span><span>{now.attendance.toLocaleString()} / {c.seats.toLocaleString()} ({Math.round(now.fill * 100)}%)</span>
          <span>{t('ticket.incomeMatch')}</span><span><b>{money(now.income)}</b></span>
          <span>{t('ticket.incomeSeason')}</span><span>{money(now.income * 19)}</span>
        </div>
        <table className="grid">
          <thead><tr><th>{t('fin.ticket')}</th><th className="num">{t('ticket.att')}</th><th className="num">{t('ticket.fill')}</th><th className="num">{t('ticket.incomeMatch')}</th><th></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.price} className={`clickable ${r.price === c.ticketPrice ? 'me' : ''}`} onClick={() => act({ t: 'ticket', price: r.price })}>
                <td>{money(r.price)}</td>
                <td className="num">{r.attendance.toLocaleString()}</td>
                <td className="num">{Math.round(r.fill * 100)}%</td>
                <td className="num">{money(r.income)}</td>
                <td>{r === best && <span className="tag good">{t('ticket.best')}</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="insight">{t('ticket.help')}</div>
      </div>
    </Panel>
  );
}

function ProjectsPanel() {
  const g = useGame()!;
  const c = g.clubs[g.userClub];
  const kinds: ProjectKind[] = ['stadium', 'training', 'youth'];
  const current: Record<ProjectKind, string> = {
    stadium: `${c.seats.toLocaleString()} ${t('proj.seats')}`,
    training: `${c.facilities}/20`,
    youth: `${c.youth}/20`,
  };
  return (
    <Panel title={t('proj.title')}>
      <div className="col">
        {kinds.map((k) => {
          const running = c.projects?.find((p) => p.kind === k);
          const offer = projectOffer(k);
          return (
            <div key={k} className="insight">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <b>{t(`proj.${k}`)}</b>
                <span className="muted">{t('proj.now')}: {current[k]}</span>
              </div>
              <div className="muted" style={{ margin: '4px 0 8px' }}>{t(`proj.${k}.effect`)}</div>
              {running ? (
                <div><span className="tag warn">{t('proj.building')}</span> {t('proj.ready', { date: dateFmt(running.done) })} · +{running.amount.toLocaleString()}{k === 'stadium' ? ` ${t('proj.seats')}` : ''}</div>
              ) : offer ? (
                <div className="row">
                  <span>+{offer.amount.toLocaleString()}{k === 'stadium' ? ` ${t('proj.seats')}` : ` ${t('proj.levels')}`} · {money(offer.cost)} · {t('proj.months', { n: offer.months })}</span>
                  <button className="small primary" disabled={c.balance < offer.cost} onClick={() => act({ t: 'project', kind: k })}>{t('proj.request')}</button>
                  {c.balance < offer.cost && <span className="muted">{t('proj.cantAfford')}</span>}
                </div>
              ) : <span className="muted">{t('proj.max')}</span>}
            </div>
          );
        })}
        <div className="muted">{t('proj.hint')}</div>
      </div>
    </Panel>
  );
}
