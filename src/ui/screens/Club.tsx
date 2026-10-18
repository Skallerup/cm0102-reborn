import { useEffect, useState } from 'react';
import { humanManager } from '../../game/humans';
import { act } from '../../game/actions';
import { Info } from '../help';
import { squadStrength } from '../../game/board';
import { recentFanEvents } from '../../game/fans';
import { gs, squad } from '../../game/state';
import { clubStrategy } from '../../game/strategy';
import type { Club, Staff } from '../../game/types';
import { dateFmt, money, t } from '../../i18n';
import { aiCall, aiText, ensureAiText } from '../../ai/client';
import { useAiAvailable } from '../ai';
import { Bar, ClubLink, Crest, MgrChip, Panel } from '../components';
import { useGame, useNav } from '../core';
import { Head } from './common';
import { SquadTable } from './Squad';

export function ClubScreen({ id }: { id?: number }) {
  const g = useGame()!;
  const { nav } = useNav();
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
            <span>{t('club.manager')}</span><span>{c.manager === -1 ? <>{humanManager(c.id)?.name ?? '?'}<MgrChip clubId={c.id} /></> : manager ? `${manager.first} ${manager.last}` : t('club.vacant')}</span>
            <span>{t('club.stadium')}</span><span>{c.stadium} ({c.seats.toLocaleString()})</span>
            <span>{t('club.rep')}<Info topic="rep" /></span><span><Bar value={c.rep} /> {c.rep}</span>
            <span>{t('club.strength')}</span><span>{squadStrength(cid).toFixed(0)}</span>
            {c.manager !== -1 && <><span>{t('club.strategy')}</span><span title={t(`strategy.${clubStrategy(c)}.hint`)}>{t(`strategy.${clubStrategy(c)}`)}</span></>}
            <span>{t('club.youth')}</span><span><Bar value={c.youth} max={20} /></span>
            {c.id === g.userClub && <><span>{t('club.youthPreview')}</span><span>{g.board.youthPreview?.season === g.season
              ? <><span className={`tag ${({ golden: 'good', good: 'good', average: '', poor: 'warn' } as const)[g.board.youthPreview.verdict]}`}>{t(`youth.verdict.${g.board.youthPreview.verdict}`)}</span>{g.board.youthPreview.standout ? <span className="muted"> · {t('youth.standout', { pos: g.board.youthPreview.standout })}</span> : null}{g.board.youthPreview.wonderkid ? <span className="tag good">{t('youth.wonderkid')}</span> : null}</>
              : <span className="muted">{t('club.youthPreviewNone')}</span>}</span></>}
            <span>{t('club.facilities')}</span><span><Bar value={c.facilities} max={20} /></span>
            {(mine || !g.options.masking) && <><span>{t('top.balance')}</span><span>{money(c.balance)}</span></>}
          </div>
          {mine && (
            <div className="row" style={{ marginTop: 10, gap: 8, flexWrap: 'wrap' }}>
              <button className="small" onClick={() => nav({ name: 'finance', tab: 'facilities' })}>{t('fac.goFacilities')}</button>
              <button className="small" onClick={() => nav({ name: 'finance', tab: 'stadium' })}>{t('fac.goAttendance')}</button>
            </div>
          )}
          {!mine && c.manager === 0 && <VacancyBox clubId={c.id} />}
          {!mine && c.manager === -1 && (() => {
            const h = g.humans?.find((x) => x.pid !== g.active && x.userClub === c.id);
            return h ? (
              <div className="insight row" style={{ marginTop: 10 }}>
                <span className="grow">{t(h.bot ? 'chat.clubAi' : 'chat.clubHuman', { name: h.name })}</span>
                <button className="primary small" onClick={() => nav({ name: 'managers', id: h.pid })}>{t('chat.writeTo', { name: h.name.split(' ')[0] })}</button>
              </div>
            ) : null;
          })()}
        </Panel>
        {mine && (
          <Panel title={t('club.board')}>
            <div className="kv">
              <span>{t('club.expectation')}<Info topic="board" /></span><span className="accent">{t(`exp.${g.board.expectation}`)}</span>
              <span>{t('club.confidence')}<Info topic="board" /></span><span><Bar value={g.board.confidence} /> {Math.round(g.board.confidence)}%</span>
              <span>{t('club.warnings')}</span><span>{g.board.warnings}</span>
              <span>{t('club.managerRep')}<Info topic="managerRep" /></span><span><Bar value={g.manager.rep} /> {Math.round(g.manager.rep)}</span>
            </div>
            <p className="muted">{t(`conf.${g.board.confidence >= 75 ? 'delighted' : g.board.confidence >= 55 ? 'pleased' : g.board.confidence >= 35 ? 'concerned' : 'danger'}`)}</p>
          </Panel>
        )}
        {mine && <FansPanel club={c} />}
        {!mine && manager && <ManagerCard m={manager} />}
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

/** AI-trænerens profil: stil, karriere, trofæer og indbyrdes opgør mod manageren */
function ManagerCard({ m }: { m: Staff }) {
  const g = useGame()!;
  const rec = g.manager.rivals?.[m.id];
  return (
    <Panel title={t('mgr.title', { name: `${m.first} ${m.last}` })}>
      <div className="kv">
        <span>{t('club.rep')}</span><span><Bar value={m.rep} /> {Math.round(m.rep)}</span>
        {m.style && <><span>{t('mgr.style')}</span><span>{m.style.formation} · {t(`ment.${m.style.mentality}`)}</span></>}
        <span>{t('mgr.tactics')}</span><span><Bar value={m.attrs.tactics} max={20} /></span>
        <span>{t('mgr.trophies')}</span><span>{m.trophies ?? 0}</span>
        {m.form !== undefined && <><span>{t('mgr.form')}</span><span className={m.form > 0 ? 'good' : m.form < 0 ? 'bad' : ''}>{t(m.form > 0 ? 'mgr.formOver' : m.form < 0 ? 'mgr.formUnder' : 'mgr.formOn', { n: Math.abs(m.form) })}</span></>}
        {rec && <><span>{t('mgr.h2h')}</span><span className="accent">{t('mgr.record', { w: rec[0], d: rec[1], l: rec[2] })}</span></>}
      </div>
      {(m.career?.length ?? 0) > 0 && (
        <table className="grid" style={{ marginTop: 8 }}>
          <tbody>
            {m.career!.slice().reverse().map((c, i) => (
              <tr key={i}><td><ClubLink id={c.club} /></td><td className="muted">{dateFmt(c.from)} – {c.to ? dateFmt(c.to) : t('mgr.now')}</td><td className="muted">{c.why ? t(`mgr.why.${c.why}`) : ''}</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </Panel>
  );
}

/** Fansenes humør og fanforum (AI-skrevne indlæg, ellers skabeloner) */
function FansPanel({ club }: { club: Club }) {
  const g = useGame()!;
  const ai = useAiAvailable();
  const mood = Math.round(club.fanMood ?? 60);
  const events = recentFanEvents(club);
  const week = `${g.date.slice(0, 4)}-${Math.floor(Number(g.date.slice(5, 7)) * 4.35 + Number(g.date.slice(8, 10)) / 7)}`;
  const key = `fans:${club.id}:${week}`;
  const [posts, setPosts] = useState<{ user: string; text: string }[] | null>(() => { try { return JSON.parse(aiText(key) ?? 'null'); } catch { return null; } });
  useEffect(() => {
    if (!ai || aiText(key)) return;
    const comp = g.comps[club.league];
    const row = comp?.table.find((r) => r.club === club.id);
    ensureAiText(key, async () => {
      const r = await aiCall<{ posts: { user: string; text: string }[] }>('fans', {
        club: club.name, mood, recentEvents: events.map((e) => t(`fan.ev.${e.k}`)), form: row?.form, points: row?.pts, played: row?.p,
        ticketPrice: money(club.ticketPrice), manager: g.manager.name,
      });
      return r?.posts?.length ? JSON.stringify(r.posts) : null;
    }).then((v) => { if (v) { try { setPosts(JSON.parse(v)); } catch { /* ignorer */ } } });
  }, [ai, key]); // eslint-disable-line react-hooks/exhaustive-deps
  const moodKey = mood >= 75 ? 'euphoric' : mood >= 58 ? 'happy' : mood >= 42 ? 'restless' : 'angry';
  const shown = posts ?? [{ user: 'Fan1904', text: t(`fan.tpl.${moodKey}.1`) }, { user: 'TribuneTina', text: t(`fan.tpl.${moodKey}.2`) }];
  return (
    <Panel title={t('fans.title')}>
      <div className="kv">
        <span>{t('fans.mood')}<Info topic="fans" /></span><span><Bar value={mood} /> {t(`fans.mood.${moodKey}`)}</span>
      </div>
      {events.length > 0 && <div className="muted" style={{ fontSize: 12, margin: '6px 0' }}>{events.slice(-4).map((e) => `${t(`fan.ev.${e.k}`)} (${e.v > 0 ? '+' : ''}${e.v})`).join(' · ')}</div>}
      <div className="col" style={{ gap: 6, marginTop: 6 }}>
        {shown.map((p, i) => <div key={i} className="forum-post"><b>{p.user}</b> {p.text}</div>)}
      </div>
      <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>{t('fans.effect')}</div>
    </Panel>
  );
}

/** Ledig managerstilling: søg jobbet direkte fra klubbens side (eller tag imod et tilbud) */
function VacancyBox({ clubId }: { clubId: number }) {
  const g = useGame()!;
  const c = g.clubs[clubId];
  const [res, setRes] = useState<'no' | null>(null);
  const offered = g.jobOffers.includes(clubId);
  const me = g.clubs[g.userClub];
  const chance = offered ? 'sure' : g.manager.rep + 10 >= c.rep ? 'good' : g.manager.rep + 25 >= c.rep ? 'fair' : 'low';
  const go = () => {
    if (me && !confirm(t('vac.leaveConfirm', { club: c.name, current: me.name }))) return;
    if (offered) { act({ t: 'acceptJob', club: clubId }); return; }
    const ok = act<boolean>({ t: 'applyJob', club: clubId });
    if (!ok) setRes('no');
  };
  return (
    <div className="insight" style={{ marginTop: 12 }}>
      <b>{t('vac.title')}</b>
      <div className="muted" style={{ margin: '4px 0 8px' }}>{offered ? t('vac.offered') : t(`vac.chance.${chance}`, { rep: Math.round(g.manager.rep), clubRep: c.rep })}</div>
      {res === 'no' ? <div className="bad">{t('vac.rejected')}</div>
        : <button className="primary" onClick={go}>{offered ? t('vac.accept') : t('vac.apply')}</button>}
    </div>
  );
}
