// Originalens venskabskampe (CM 01/02: Fixtures → Arrange ▾ Home Friendly / Away Friendly / Tour, Cancel) i det moderne udseende. Reglerne ligger i
// game/cmFriendlyOffers.ts; kampene og tilbuddene står i spillets kampprogram.
import { useState } from 'react';
import { act } from '../../game/actions';
import { cmFriendlyOn, cmNationFrOf } from '../../game/cmFriendly';
import { cmFrDateStatus, cmFrInviteKind, cmFrTourNations, frDn, frIso } from '../../game/cmFriendlyOffers';
import { fixturesOn } from '../../game/state';
import { dateFmt, natName, t } from '../../i18n';
import { Panel } from '../components';
import { useGame } from '../core';
import { cmFrCancelRow, cmFrCancellable, cmFrFixtureRows, friendlyInvite } from './FriendlyClassic';

const DAYS = 120;

function DatePicker({ tour, onBack, onDone }: { tour: boolean; onBack: () => void; onDone: (dates: string[]) => void }) {
  const g = useGame()!;
  const club = g.userClub;
  const today = frDn(g.date);
  const [chosen, setChosen] = useState<number[]>([]);
  const rows = [];
  for (let i = 0; i < DAYS; i++) {
    const d = today + i;
    const iso = frIso(d);
    const fx = fixturesOn(iso).map((id) => g.fixtures[id]).find((f) => f && (f.home === club || f.away === club));
    const st = fx ? null : cmFrDateStatus(g, club, d, chosen, tour);
    if (!fx && !st) continue;
    const click = st && st.s === 1 ? () => setChosen(tour ? (chosen.length >= 10 ? chosen : [...chosen, d].sort((a, b) => a - b)) : [d]) : st && st.s === 4 ? () => setChosen(chosen.filter((x) => x !== d)) : undefined;
    const label = fx ? `${fx.home === club ? t('cl.fx.h') : t('cl.fx.a')} ${g.clubs[fx.home === club ? fx.away : fx.home]?.short ?? '?'}`
      : st!.s === 1 ? t('cl.fr.avail') : st!.s === 4 ? t('cl.fr.selected') : st!.s === 5 && st!.m ? t('cl.fx.q', { club: g.clubs[st!.m.home === club ? st!.m.away : st!.m.home]?.short ?? '?' }) : st!.s === 6 ? t('cl.fx.tba') : t('cl.fr.unavail');
    rows.push(<tr key={iso} className={click ? 'clickable' : ''} onClick={click} style={{ opacity: click || chosen.includes(d) ? 1 : 0.55 }}>
      <td>{dateFmt(iso)}</td><td className={st?.s === 4 ? 'good' : ''}>{label}</td></tr>);
  }
  return (
    <Panel title={tour ? t('cl.fr.selDates') : t('cl.fr.selDate')} className="flush">
      <div style={{ maxHeight: 360, overflowY: 'auto' }}><table className="grid"><tbody>{rows}</tbody></table></div>
      <div className="row" style={{ padding: 10, justifyContent: 'flex-end', gap: 8 }}>
        <button onClick={onBack}>{tour ? t('common.back') : t('common.cancel')}</button>
        <button className="primary" disabled={!chosen.length} onClick={() => onDone(chosen.map(frIso))}>{t('top.next')}</button>
      </div>
    </Panel>
  );
}

function TourNations({ onBack, onPick }: { onBack: () => void; onPick: (n: number) => void }) {
  const g = useGame()!;
  const [only, setOnly] = useState(true);
  const list = cmFrTourNations(g, (n) => cmNationFrOf(g)[n]).filter((x) => !only || x.ok);
  return (
    <Panel title={t('cl.fr.selNation')}>
      <div className="col">
        <div className="row" style={{ gap: 6 }}>
          <button className={`small ${only ? 'primary' : ''}`} onClick={() => setOnly(true)}>{t('cl.fr.availOnly')}</button>
          <button className={`small ${!only ? 'primary' : ''}`} onClick={() => setOnly(false)}>{t('cl.fr.allNations')}</button>
        </div>
        <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
          {list.map((x) => <button key={x.nation} className="small" disabled={!x.ok} onClick={() => onPick(x.nation)}>{natName(g.nations[x.nation]?.name)}</button>)}
          {!list.length && <span className="muted">{t('common.none')}</span>}
        </div>
        <div className="row" style={{ justifyContent: 'flex-end' }}><button onClick={onBack}>{t('common.cancel')}</button></div>
      </div>
    </Panel>
  );
}

/** Klubberne i et land – "Invite Club" (Please Confirm "Invite … for a friendly match on … ?") */
function Opponents({ nation, onDone }: { nation: number; onDone: () => void }) {
  const g = useGame()!;
  const [nat, setNat] = useState(nation);
  const nations = [...new Set(Object.values(g.clubs).map((c) => c.nation))].sort((a, b) => natName(g.nations[a]?.name).localeCompare(natName(g.nations[b]?.name)));
  const clubs = Object.values(g.clubs).filter((c) => c.nation === nat && c.id !== g.userClub).sort((a, b) => a.short.localeCompare(b.short));
  return (
    <Panel title={t('cl.fr.arrTourOf', { nation: natName(g.nations[nat]?.name) })} className="flush">
      <div className="row" style={{ padding: 10, gap: 8 }}>
        <select value={nat} onChange={(e) => setNat(Number(e.target.value))}>{nations.map((n) => <option key={n} value={n}>{natName(g.nations[n]?.name)}</option>)}</select>
        <div className="grow" />
        <button onClick={onDone}>{t('common.back')}</button>
      </div>
      <div style={{ maxHeight: 340, overflowY: 'auto' }}>
        <table className="grid"><tbody>
          {clubs.map((c) => (
            <tr key={c.id}><td>{c.short}</td><td className="muted">{g.nations[c.nation]?.code}</td>
              <td style={{ textAlign: 'right' }}><button className="small primary" disabled={!cmFrInviteKind(g, c.id)} onClick={() => void friendlyInvite(g, c.id)}>{t('cl.fr.inviteClub')}</button></td></tr>
          ))}
        </tbody></table>
      </div>
    </Panel>
  );
}

/** Venskabskampe for mennesket i et originalt spil: Arrange ▾ og Cancel */
export function OrigFriendlies() {
  const g = useGame()!;
  const [step, setStep] = useState<'' | 'home' | 'away' | 'nations' | 'tourdates' | 'clubs'>('');
  const [nat, setNat] = useState(-1);
  if (!cmFriendlyOn(g)) return null;
  const myNation = g.clubs[g.userClub]?.nation ?? 0;
  const pending = cmFrFixtureRows(g, g.userClub);
  const fr = Object.values(g.fixtures).filter((f) => (f.home === g.userClub || f.away === g.userClub) && cmFrCancellable(g, f.id)).sort((a, b) => a.date.localeCompare(b.date));
  if (step === 'home' || step === 'away') return <DatePicker tour={false} onBack={() => setStep('')} onDone={(ds) => { if (act<string>({ t: 'cmFrArrange', date: ds[0], home: step === 'home' }) === 'ok') { setNat(myNation); setStep('clubs'); } }} />;
  if (step === 'nations') return <TourNations onBack={() => setStep('')} onPick={(n) => { setNat(n); setStep('tourdates'); }} />;
  if (step === 'tourdates') return <DatePicker tour onBack={() => setStep('nations')} onDone={(ds) => { if (act<string>({ t: 'cmFrTour', nation: nat, dates: ds }) === 'ok') setStep('clubs'); }} />;
  if (step === 'clubs') return <Opponents nation={nat} onDone={() => setStep('')} />;
  return (
    <Panel title={t('fr.title')}>
      <div className="col">
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          <span className="muted">{t('cl.fx.arrangeMenu')}</span>
          <button onClick={() => setStep('home')}>{t('cl.fx.homeFr')}</button>
          <button onClick={() => setStep('away')}>{t('cl.fx.awayFr')}</button>
          <button onClick={() => setStep('nations')}>{t('cl.fx.tourM')}</button>
          {pending.length > 0 && <button className="primary" onClick={() => { setNat(myNation); setStep('clubs'); }}>{t('cl.fr.inviteClub')}</button>}
        </div>
        {(pending.length > 0 || fr.length > 0) && (
          <table className="grid"><tbody>
            {fr.map((f) => <tr key={f.id}><td>{dateFmt(f.date)}</td><td>{f.home === g.userClub ? t('cl.fx.h') : t('cl.fx.a')} {g.clubs[f.home === g.userClub ? f.away : f.home]?.short}</td><td className="muted">{t('cl.fx.friendly')}</td>
              <td style={{ textAlign: 'right' }}><button className="small danger" onClick={() => void cmFrCancelRow(g, { kind: 'fixture', date: f.date, opp: f.home === g.userClub ? f.away : f.home, fid: f.id })}>{t('cl.fx.cancel')}</button></td></tr>)}
            {pending.map((r) => <tr key={r.key}><td>{dateFmt(r.date)}</td><td>{r.label}</td><td className="muted">{r.comp}</td>
              <td style={{ textAlign: 'right' }}><button className="small danger" onClick={() => void cmFrCancelRow(g, { kind: r.kind, date: r.date, opp: r.opp, tour: r.tour })}>{t('cl.fx.cancel')}</button></td></tr>)}
          </tbody></table>
        )}
      </div>
    </Panel>
  );
}
