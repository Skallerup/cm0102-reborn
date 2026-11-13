// Bestyrelsen: tillid og forventning samlet ét sted – plus ønsker man kan stille (budget, byggeri og fire andre).
import { useState } from 'react';
import { act } from '../../game/actions';
import { FA_REQUESTS, MEET_BOARD, boardAskInfo, boardStatementCodes, faAvailable, meetBoardAvailable } from '../../game/board';
import { CAMP_DESTS, campCost, campWindows, type CampDest } from '../../game/camp';
import type { BoardAsk } from '../../game/types';
import { dateFmt, money, t } from '../../i18n';
import { Bar, Panel } from '../components';
import { gs } from '../../game/state';
import { useGame, useNav, useRouteState } from '../core';
import { isRetro } from '../theme';
import { Info } from '../help';
import { Head } from './common';
import { authentic } from '../../game/rules';
import { useClassicDialog, ClassicFoot } from '../classic';
import { cmBoardOn, cmBoardScreenText } from '../../game/cmBoardGame';

const ASKS: BoardAsk[] = ['lowerExp', 'confidenceVote', 'youthDrive'];

export function BoardScreen() {
  return isRetro() ? <ClassicBoard /> : <ModernBoard />;
}

function ModernBoard() {
  const g = useGame()!;
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
        <MoneyPanel />
      </div>
      <CampPanel />
      <BoardAsks />
    </div>
  );
}

function MoneyPanel() {
  const { nav } = useNav();
  return (
    <Panel title={t('ba.money')}>
      <p className="muted" style={{ marginTop: 0 }}>{t('ba.moneyHint')}</p>
      <div className="row">
        <button onClick={() => nav({ name: 'finance', tab: 'overview' })}>{t('ba.toBudget')}</button>
        <button onClick={() => nav({ name: 'finance', tab: 'facilities' })}>{t('ba.toProjects')}</button>
      </div>
    </Panel>
  );
}

/** Ønsker til bestyrelsen (lavere forventninger, tillidsafstemning, ungdomssatsning) */
function BoardAsks() {
  if (authentic()) return null; // ægte CM 01/02: ikke i originalen
  const [answer, setAnswer] = useState<Partial<Record<BoardAsk, string>>>({});
  return (
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
  );
}

/** Bestyrelsens udtalelse i klassisk stil (CM 01/02): præstation, forventning, advarsler, økonomi og fansene */
function boardStatement(): string[] {
  const g = gs();
  // den originale database i ægte tilstand: originalens Board Confidence-tekst 0x6b2080/0x690d80 (afsnittene som linjer)
  const orig = cmBoardScreenText(g);
  if (orig !== null) return orig.split('\n\n');
  const club = g.clubs[g.userClub];
  const c = boardStatementCodes();
  const out = [t(`cl.ba.conf.${c.lvl}`, { club: club?.name ?? '' })];
  out.push(t('cl.ba.expect', { exp: t(`exp.${g.board.expectation}`), pos: g.board.expectedPos }));
  if (g.board.warnings) out.push(t('cl.ba.warnings', { n: g.board.warnings }));
  out.push(t(`cl.ba.fin.${c.fin}`), t(`cl.ba.fans.${c.fans}`));
  return out;
}

/** Klassisk tema (som CM 01/02): Board Confidence med knapperne Board Request og FA Request */
function ClassicBoard() {
  const [view, setView] = useRouteState<'confidence' | 'request' | 'fa'>('bview', 'confidence');
  return (
    <div>
      <Head title={gs().clubs[gs().userClub]?.name ?? t('nav.board')} />
      {view === 'confidence' && (
        <>
          <div className="cx-subtitle">{t('cl.ba.confidence')}</div>
          <div className="cx-tools cx-tools-inline">
            <button className="cx-greybtn wide" onClick={() => setView('request')}>{t('cl.ba.request')}</button>
            <button className="cx-greybtn wide" onClick={() => setView('fa')}>{t('cl.ba.fa')}</button>
          </div>
          <div className="cx-statement">{boardStatement().map((x) => <p key={x}>{x}</p>)}</div>
        </>
      )}
      {/* CM 01/02 (0x4253f0): ét punkt ad gangen; med originalens bestyrelse kommer svaret som nyhed (0x1786), og skærmen lukker */}
      {view === 'request' && <MeetPanel key="b" single quiet={cmBoardOn(gs())} title={t('cl.mb.title')} intro={t('cl.mb.intro')} kinds={MEET_BOARD} avail={meetBoardAvailable} label={(k) => t(`cl.mb.${k}`)}
        send={(k) => act<string>({ t: 'meetBoard', kind: k })} onClose={() => setView('confidence')} />}
      {view === 'fa' && <MeetPanel key="f" single quiet={authentic()} title={t('cl.fa.title')} intro={t('cl.fa.intro')} kinds={FA_REQUESTS} avail={faAvailable} label={(k) => t(`cl.fa.${k}`)}
        send={(k) => act<string>({ t: 'faRequest', kind: k })} onClose={() => setView('confidence')} />}
    </div>
  );
}

/** "Meet with Board" / "Meet with the Football Association": klik på et ønske for at vælge det (hvid tekst), Confirm sender */
function MeetPanel<K extends string>({ title, intro, kinds, avail, label, send, onClose, single, quiet }: {
  title: string; intro: string; kinds: K[]; avail: (k: K) => boolean; label: (k: K) => string; send: (k: K) => string; onClose: () => void;
  /** ét valg ad gangen (originalens Meet with Board); quiet: svaret kommer som nyhed – luk efter Confirm */
  single?: boolean; quiet?: boolean;
}) {
  useClassicDialog();
  const [sel, setSel] = useState<Set<K>>(new Set());
  const [answers, setAnswers] = useState<string[] | null>(null);
  const confirm = () => {
    const out = [...sel].map((k) => t(send(k)));
    if (quiet) onClose(); else setAnswers(out);
  };
  return (
    <div className="cx-tstatus">
      <div className="cx-subtitle">{title}</div>
      <div className="cx-ts-body">
        {answers ? answers.map((a, i) => <p key={i} className="cx-ts-intro">{a}</p>) : (
          <>
            <p className="cx-ts-intro">{intro}</p>
            {kinds.map((k) => {
              const ok = avail(k);
              return <button key={k} className={`cx-opt ${sel.has(k) ? 'on' : ''}`} disabled={!ok}
                onClick={() => setSel((s) => { const x = new Set(single ? [] : s); if (s.has(k)) x.delete(k); else x.add(k); return x; })}>{label(k)}</button>;
            })}
          </>
        )}
      </div>
      <ClassicFoot cols="3fr 1fr">
        <button onClick={onClose}>{answers ? t('common.back') : t('common.cancel')}</button>
        {!answers && <button className="primary" disabled={!sel.size} onClick={confirm}>{t('cl.mb.confirm')}</button>}
      </ClassicFoot>
    </div>
  );
}

const DESTS: CampDest[] = ['sun', 'alps', 'home', 'tour'];

/** Træningslejr: vælg en periode uden kampe og en destination – rapporten kommer, når holdet er hjemme */
function CampPanel() {
  if (authentic()) return null; // ægte CM 01/02: ikke i originalen
  const g = useGame()!;
  const c = g.clubs[g.userClub];
  const windows = campWindows();
  const [start, setStart] = useState(windows[0]?.start ?? '');
  const [msg, setMsg] = useState('');
  const camp = c.camp;
  const m = Number((start || g.date).slice(5, 7));
  const plan = (dest: CampDest) => {
    const r = act<string>({ t: 'camp', dest, start });
    setMsg(t(`camp.res.${r}`));
  };
  return (
    <Panel title={t('camp.title')}>
      {camp && camp.status !== 'done' ? (
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <span className={`tag ${camp.status === 'running' ? 'good' : 'warn'}`}>{t(`camp.status.${camp.status}`)}</span>
          <b>{t(`camp.dest.${camp.dest}`)}</b>
          <span className="muted">{dateFmt(camp.start)} – {dateFmt(camp.end)} · {money(camp.cost)}</span>
          {camp.status === 'planned' && <button className="small" onClick={() => { act({ t: 'campCancel' }); setMsg(''); }}>{t('camp.cancel')}</button>}
        </div>
      ) : (
        <>
          <p className="muted" style={{ marginTop: 0 }}>{t('camp.intro')}</p>
          {camp?.report && <div className="insight">{t('camp.lastReport', { dest: t(`camp.dest.${camp.dest}`), date: dateFmt(camp.end) })}</div>}
          {windows.length === 0 ? <div className="insight warn">{t('camp.noWindow')}</div> : (
            <>
              <div className="row" style={{ marginBottom: 10, flexWrap: 'wrap' }}>
                <b>{t('camp.period')}</b>
                <div className="seg">
                  {windows.map((w) => <button key={w.start} className={start === w.start ? 'on' : ''} onClick={() => setStart(w.start)}>{dateFmt(w.start)} – {dateFmt(w.end)}</button>)}
                </div>
                <span className="muted">{t('camp.gap', { n: windows.find((w) => w.start === start)?.gap ?? 0 })}</span>
              </div>
              <div className="camp-grid">
                {DESTS.map((d) => {
                  const fx = CAMP_DESTS[d];
                  const off = fx.summerOnly && !(m === 6 || m === 7 || m === 1);
                  return (
                    <div key={d} className={`camp-card ${off ? 'off' : ''}`}>
                      <b>{t(`camp.dest.${d}`)}</b>
                      <span className="muted">{t(`camp.desc.${d}`)}</span>
                      <div className="row" style={{ gap: 4 }}>
                        <span className="tag">{t('camp.fx.morale', { n: fx.morale })}</span>
                        <span className="tag">{t('camp.fx.cond', { n: (fx.cond > 0 ? '+' : '') + fx.cond })}</span>
                        <span className="tag good">{t('camp.fx.bond', { n: fx.bond })}</span>
                        {fx.phys ? <span className="tag good">{t('camp.fx.phys')}</span> : null}
                        {fx.income ? <span className="tag good">{t('camp.fx.income')}</span> : null}
                      </div>
                      <div className="row"><b>{money(campCost(c, d))}</b><button className="small primary" disabled={off || !start} onClick={() => plan(d)}>{t('camp.plan')}</button></div>
                      {off && <span className="muted" style={{ fontSize: 12 }}>{t('camp.summerOnly')}</span>}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
      {msg && <div className="muted" style={{ marginTop: 8 }}>{msg}</div>}
    </Panel>
  );
}
