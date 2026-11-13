// Landsholdsfodbold: den aktuelle slutrunde (grupper og knockout), seneste landskampe og tidligere vindere.
import { useGame } from '../core';
import { dateFmt, natName, t } from '../../i18n';
import { Flag, Panel, Tabs } from '../components';
import { useRouteState } from '../core';
import { fifaRanking, nationPool, nationSquad, u21Squad, type IntlTournament, type PastFinal } from '../../game/international';
import { useState } from 'react';
import { act } from '../../game/actions';
import { ClubLink, PlayerLink } from '../components';
import { useNav } from '../core';
import { compName } from '../../i18n';
import { naturalRole } from '../../game/attributes';
import { ageOn } from '../../game/dates';
import type { Player } from '../../game/types';
import { gs } from '../../game/state';
import type { JSX } from 'react';
import { isRetro } from '../theme';
import { Head } from './common';
import { ClassicSub, CxDrop, CxLink, clubRoute, type Item } from '../classic';
import { ClassicClubSquad } from './SquadClassic';

export function International({ nation }: { nation?: number }) {
  const g = useGame()!;
  const { nav } = useNav();
  const [tab, setTab] = useRouteState('itab', 'tournament');
  // et bestemt land: landsholdets side (efter alle hooks, så hook-rækkefølgen er den samme)
  if (nation !== undefined && g.nations[nation]) return <NationTeam key={nation} n={nation} />;
  if (isRetro()) return <ClassicInternational tab={tab} setTab={setTab} />;
  const st = g.intl;
  const N = (n: number) => <span className="row" style={{ gap: 6, display: 'inline-flex' }}><Flag name={g.nations[n]?.name} />{natName(g.nations[n]?.name)}</span>;
  const tour = st?.tournament;
  return (
    <div>
      <h2>{t('intl.title')}</h2>
      {g.manager.nationalOffer !== undefined && (
        <div className="insight good row">
          <span className="grow">{t('intl.offerText', { nation: natName(g.nations[g.manager.nationalOffer]?.name) })}</span>
          <button className="primary" onClick={() => act({ t: 'nationalOffer', accept: true })}>{t('intl.accept')}</button>
          <button onClick={() => act({ t: 'nationalOffer', accept: false })}>{t('intl.decline')}</button>
        </div>
      )}
      {g.manager.national && (
        <Panel title={t('intl.myTeam', { nation: natName(g.nations[g.manager.national.nation]?.name) })} right={<button className="small danger" onClick={() => act({ t: 'resignNational' })}>{t('intl.resign')}</button>}>
          <div className="muted" style={{ marginBottom: 6 }}>{t('intl.myRecord', { since: dateFmt(g.manager.national.since), played: g.manager.national.played, won: g.manager.national.won })}</div>
          <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>{nationSquad(g.manager.national.nation).map((p) => <PlayerLink key={p.id} p={p} />)}</div>
        </Panel>
      )}
      <Tabs tabs={[['tournament', t('intl.tab.tournament')], ['results', t('intl.tab.results')], ['fifa', t('intl.tab.fifa')], ['history', t('intl.tab.history')]]} value={tab} onChange={setTab} />
      {tab === 'fifa' && (
        <Panel className="flush"><table className="grid"><thead><tr><th className="num">#</th><th>{t('col.nat')}</th><th className="num">{t('intl.points')}</th></tr></thead>
          <tbody>{fifaRanking().slice(0, 100).map((r, i) => <tr key={r.n} className="clickable" onClick={() => nav({ name: 'international', id: r.n })}><td className="num">{i + 1}</td><td>{N(r.n)}</td><td className="num">{r.pts}</td></tr>)}</tbody></table></Panel>
      )}
      {tab === 'tournament' && (!tour ? <Panel><div className="muted">{t('intl.none')}</div></Panel> : <Tournament t={tour} N={N} />)}
      {tab === 'results' && (
        <Panel className="flush">
          {!st?.results.length ? <div className="muted" style={{ padding: 12 }}>{t('intl.noResults')}</div> : (
            <table className="grid"><tbody>{st.results.slice(0, 60).map((r, i) => (
              <tr key={i}><td className="muted">{dateFmt(r.date)}</td><td>{N(r.home)}</td><td className="num"><b>{r.hg}-{r.ag}</b></td><td>{N(r.away)}</td><td className="muted">{t(`intl.kind.${r.kind}`)}{r.stage ? ` · ${t(`stage.${r.stage}`)}` : ''}</td></tr>
            ))}</tbody></table>
          )}
        </Panel>
      )}
      {tab === 'history' && (
        <Panel className="flush">
          {!st?.history.length && !st?.past?.length ? <div className="muted" style={{ padding: 12 }}>{t('intl.noHistory')}</div> : (
            <table className="grid"><tbody>
              {st!.history.map((h, i) => (
                <tr key={`h${i}`}><td>{h.year}</td><td>{t(`intl.name.${h.name}`)}</td><td>🏆 {N(h.winner)}</td><td className="muted">{t('intl.runnerUp')}: {N(h.runnerUp)}</td></tr>
              ))}
              {/* slutrunder før spillets start (originalens database) */}
              {(st!.past ?? []).map((h, i) => (
                <tr key={`p${i}`}><td>{h.y}</td><td>{t(`intl.name.${h.c}`)}</td><td>🏆 {natName(h.w)}</td><td className="muted">{h.r ? `${t('intl.runnerUp')}: ${natName(h.r)}` : ''}{h.h ? ` · ${natName(h.h)}` : ''}</td></tr>
              ))}
            </tbody></table>
          )}
        </Panel>
      )}
    </div>
  );
}

function Tournament({ t: tour, N }: { t: IntlTournament; N: (n: number) => JSX.Element }) {
  const rows = (grp: number[]) => grp.map((n) => tour.table[n]).sort((a, b) => b.pts - a.pts || b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf);
  return (
    <div className="col">
      <Panel title={`${t(`intl.name.${tour.name}`)} ${tour.year}${tour.winner !== undefined ? ` – 🏆 ${natName(gs().nations[tour.winner]?.name)}` : ''}`}>
        <div className="grid-choices" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {tour.groups.map((grp, i) => (
            <div key={i}>
              <b>{t('intl.group', { g: String.fromCharCode(65 + i) })}</b>
              <table className="grid"><thead><tr><th /><th className="num">K</th><th className="num">+/-</th><th className="num">P</th></tr></thead>
                <tbody>{rows(grp).map((r) => <tr key={r.n}><td>{N(r.n)}</td><td className="num">{r.p}</td><td className="num">{r.gf}-{r.ga}</td><td className="num"><b>{r.pts}</b></td></tr>)}</tbody></table>
            </div>
          ))}
        </div>
      </Panel>
      {tour.ko.length > 0 && (
        <Panel title={t('intl.knockout')} className="flush">
          <table className="grid"><tbody>{tour.ko.map((k, i) => (
            <tr key={i}><td className="muted">{t(`stage.${k.stage}`)}</td><td>{N(k.a)}</td><td className="num"><b>{k.hg !== undefined ? `${k.hg}-${k.ag}${k.pens ? ` (${t('intl.pens')})` : ''}` : '–'}</b></td><td>{N(k.b)}</td></tr>
          ))}</tbody></table>
        </Panel>
      )}
    </div>
  );
}


/** Et lands landshold: de udtagne spillere, landets resultater og vej til landets liga */
function NationTeam({ n }: { n: number }) {
  if (isRetro()) return <ClassicNationTeam n={n} />;
  const g = useGame()!;
  const { nav } = useNav();
  const squad = nationSquad(n);
  const results = (g.intl?.results ?? []).filter((r) => r.home === n || r.away === n).slice(0, 12);
  const top = g.leagueOrder.find((l) => g.leagues[l]?.nation === n && g.comps[l]);
  const coach = g.manager.national?.nation === n ? g.manager.name : '';
  const info = g.intl?.info?.[n];
  const rank = fifaRanking().findIndex((r) => r.n === n) + 1 || '–';
  const titles = Object.entries(info?.titles ?? {}).map(([k, v]) => `${v}× ${k}`).join(', ');
  const pos = ['GK', 'DEF', 'MID', 'ATT'];
  const grp = (p: Player) => { const r = naturalRole(p); return r === 'GK' ? 0 : ['CB', 'FB'].includes(r) ? 1 : ['DM', 'CM', 'WM', 'AM'].includes(r) ? 2 : 3; };
  return (
    <div>
      <h2 className="row" style={{ gap: 10 }}><Flag name={g.nations[n]?.name} />{natName(g.nations[n]?.name)}</h2>
      <div className="row" style={{ marginBottom: 8, gap: 8 }}>
        {top && <button className="small" onClick={() => nav({ name: 'competitions', id: top })}>{compName(g.leagues[top]?.name)}</button>}
        <button className="small" onClick={() => nav({ name: 'nation', id: n, tab: 'managers' })}>{t('intl.nationInfo')}</button>
        <button className="small" onClick={() => nav({ name: 'international' })}>{t('intl.title')}</button>
        {coach && <span className="tag">{t('intl.yourTeam')}</span>}
      </div>
      <div className="muted" style={{ marginBottom: 8 }}>
        {t('intl.coach')}: <b>{coach || info?.coach || t('intl.unknownCoach')}</b>
        {info?.stadium ? ` · ${t('intl.stadium')}: ${info.stadium}${info.cap ? ` (${info.cap.toLocaleString()})` : ''}` : ''}
        {` · FIFA #${rank}`}
        {titles ? ` · ${titles}` : ''}
      </div>
      {coach && <SquadPicker n={n} />}
      <Panel title={t('intl.squad', { n: squad.length })} className="flush">
        {!squad.length ? <div className="muted" style={{ padding: 12 }}>{t('intl.noSquad')}</div> : (
          <table className="grid"><thead><tr><th>{t('col.pos')}</th><th>{t('col.name')}</th><th>{t('col.club')}</th><th className="num">{t('col.age')}</th><th className="num">{t('intl.caps')}</th><th className="num">{t('intl.goals')}</th></tr></thead>
            <tbody>{squad.slice().sort((a, b) => grp(a) - grp(b) || b.ca - a.ca).map((p) => (
              <tr key={p.id}><td className="muted">{pos[grp(p)]}</td><td><PlayerLink p={p} /></td><td>{p.club ? <ClubLink id={p.club} /> : '–'}</td><td className="num">{ageOn(p.dob, g.date)}</td><td className="num">{p.caps}</td><td className="num">{p.intGoals}</td></tr>
            ))}</tbody></table>
        )}
      </Panel>
      {results.length > 0 && (
        <Panel title={t('intl.tab.results')} className="flush">
          <table className="grid"><tbody>{results.map((r, i) => (
            <tr key={i}><td className="muted">{dateFmt(r.date)}</td><td>{natName(g.nations[r.home]?.name)}</td><td className="num"><b>{r.hg}-{r.ag}</b></td><td>{natName(g.nations[r.away]?.name)}</td><td className="muted">{t(`intl.kind.${r.kind}`)}</td></tr>
          ))}</tbody></table>
        </Panel>
      )}
    </div>
  );
}

/** Landstræneren udtager selv truppen: 20-24 spillere (CM 01/02) */
function SquadPicker({ n }: { n: number }) {
  const g = useGame()!;
  const cur = new Set(g.manager.national?.picks ?? nationSquad(n).map((p) => p.id));
  const [sel, setSel] = useState<Set<number>>(cur);
  const [msg, setMsg] = useState('');
  const toggle = (id: number) => setSel((s) => { const x = new Set(s); if (x.has(id)) x.delete(id); else x.add(id); return x; });
  return (
    <Panel title={t('intl.pickTitle', { n: sel.size })} right={<button className="small primary" disabled={sel.size < 20 || sel.size > 24} onClick={() => setMsg(t(act<string>({ t: 'nationalSquad', pids: [...sel] })))}>{t('intl.pickSave')}</button>}>
      <div className="muted" style={{ marginBottom: 6 }}>{msg || t('intl.pickHint')}</div>
      <div className="grid-choices" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))' }}>
        {nationPool(n).map((p) => (
          <label key={p.id} className={`choice ${sel.has(p.id) ? 'on' : ''}`}>
            <input type="checkbox" checked={sel.has(p.id)} onChange={() => toggle(p.id)} />
            {p.first} {p.last} <span className="muted" style={{ marginLeft: 'auto' }}>{naturalRole(p)} · {g.clubs[p.club]?.short ?? '–'}</span>
          </label>
        ))}
      </div>
    </Panel>
  );
}

/** Landsholdet i klassisk stil – som en klubs trup i CM 01/02: titelbjælke i landets farver, faner og truppen i to kolonner */
function ClassicNationTeam({ n }: { n: number }) {
  const g = useGame()!;
  const { nav } = useNav();
  const [tab, setTab] = useRouteState<'squad' | 'u21' | 'results' | 'fifa' | 'info'>(`ntt:${n}`, 'squad');
  const squad = nationSquad(n);
  const coach = g.manager.national?.nation === n ? g.manager.name : '';
  const info = g.intl?.info?.[n];
  const results = (g.intl?.results ?? []).filter((r) => r.home === n || r.away === n).slice(0, 30);
  const ranking = fifaRanking();
  const rank = ranking.findIndex((r) => r.n === n) + 1;
  const top = g.leagueOrder.find((l) => g.leagues[l]?.nation === n && g.comps[l]);
  const sub: Item[] = [
    { key: 'info', label: t('intl.nationInfo'), onClick: () => nav({ name: 'nation', id: n, tab: 'managers' }) },
    { key: 'league', label: top ? compName(g.leagues[top]?.name) : t('nav.competitions'), disabled: !top, onClick: () => top && nav({ name: 'competitions', id: top }) },
    { key: 'intl', label: t('intl.title'), onClick: () => nav({ name: 'international' }) },
  ];
  const Nn = ({ id }: { id: number }) => <span className={id === n ? 'cx-cup-team me' : ''}><CxLink to={{ name: 'international', id }}>{natName(g.nations[id]?.name)}</CxLink></span>;
  return (
    <div>
      <Head title={natName(g.nations[n]?.name)} />
      <Tabs tabs={[['squad', t('cl.nt.squad')], ['u21', t('cl.nt.u21')], ['results', t('intl.tab.results')], ['fifa', t('intl.tab.fifa')], ['info', t('cl.nt.info')]]} value={tab} onChange={(v) => setTab(v as typeof tab)} />
      {tab === 'u21' && (u21Squad(n).length ? <ClassicClubSquad cid={0} players={u21Squad(n)} /> : <div className="cx-empty">{t('intl.noSquad')}</div>)}
      {tab === 'squad' && (
        <>
          <div className="cx-subtitle">{t('cl.nt.squadTitle', { n: squad.length })}</div>
          {coach && <SquadPicker n={n} />}
          {!squad.length ? <div className="cx-empty">{t('intl.noSquad')}</div> : <ClassicClubSquad cid={0} players={squad} />}
        </>
      )}
      {tab === 'results' && (
        <>
          <div className="cx-subtitle">{t('intl.tab.results')}</div>
          {!results.length ? <div className="cx-empty">{t('intl.noResults')}</div> : (
            <table className="grid"><tbody>{results.map((r, i) => (
              <tr key={i}><td className="muted">{dateFmt(r.date)}</td><td><Nn id={r.home} /></td><td className="num"><b>{r.hg} - {r.ag}</b></td><td><Nn id={r.away} /></td><td className="muted">{t(`intl.kind.${r.kind}`)}</td></tr>
            ))}</tbody></table>
          )}
        </>
      )}
      {tab === 'fifa' && (
        <>
          <div className="cx-subtitle">{t('intl.tab.fifa')}</div>
          <table className="grid"><thead><tr><th className="num">#</th><th>{t('col.nat')}</th><th className="num">{t('intl.points')}</th></tr></thead>
            <tbody>{ranking.slice(0, 100).map((r, i) => <tr key={r.n}><td className="num">{i + 1}</td><td><Nn id={r.n} /></td><td className="num">{r.pts}</td></tr>)}</tbody></table>
        </>
      )}
      {tab === 'info' && (
        <>
          <div className="cx-subtitle">{t('cl.nt.info')}</div>
          <table className="grid"><tbody>
            <tr><td>{t('intl.coach')}</td><td><b>{coach || info?.coach || t('intl.unknownCoach')}</b></td></tr>
            {info?.stadium ? <tr><td>{t('intl.stadium')}</td><td>{info.stadium}{info.cap ? ` (${info.cap.toLocaleString()})` : ''}</td></tr> : null}
            <tr><td>{t('intl.tab.fifa')}</td><td>{rank ? `#${rank} (${ranking[rank - 1].pts})` : '–'}</td></tr>
            {Object.entries(info?.titles ?? {}).map(([k, v]) => <tr key={k}><td>{k}</td><td>{v}</td></tr>)}
            <tr><td>{t('cl.nt.mostCaps')}</td><td>{(() => { const p = [...squad].sort((a, b) => b.caps - a.caps)[0]; return p ? <><CxLink to={{ name: 'player', id: p.id }}>{p.first} {p.last}</CxLink> ({p.caps})</> : '–'; })()}</td></tr>
            <tr><td>{t('cl.nt.clubs')}</td><td>{[...new Set(squad.map((p) => p.club).filter(Boolean))].slice(0, 12).map((c, i) => <span key={c}>{i ? ', ' : ''}<CxLink to={clubRoute(c)}>{g.clubs[c]?.short}</CxLink></span>)}</td></tr>
          </tbody></table>
        </>
      )}
      <ClassicSub items={sub} />
    </div>
  );
}

// ---------- klassisk (CM 01/02): titelbjælke, faner og tabeller med grå kolonneknapper og blå rækkeknapper ----------

const INTL_TABS = ['tournament', 'qual', 'results', 'fifa', 'history'] as const;

/** Et land i en klassisk tabel: klikbart, ens eget landshold i gult */
function CxNat({ n, cls = 'c-name' }: { n: number | undefined; cls?: string }) {
  const g = useGame()!;
  if (n === undefined || !g.nations[n]) return <span>–</span>;
  const mine = g.manager.national?.nation === n || g.clubs[g.userClub]?.nation === n;
  return <span className={`${cls} ${mine && cls === 'c-name' ? 'c-yel' : ''}`}><CxLink to={{ name: 'international', id: n }}>{natName(g.nations[n].name)}</CxLink></span>;
}
/** Et landenavn fra historikken (originalens tekst) – klikbart, hvis landet findes */
function CxNatName({ name, cls = 'c-name' }: { name: string; cls?: string }) {
  const g = useGame()!;
  const i = g.nations.findIndex((x) => x.name === name);
  return i >= 0 ? <CxNat n={i} cls={cls} /> : <span className={cls}>{natName(name)}</span>;
}

function ClassicInternational({ tab, setTab }: { tab: string; setTab: (v: string) => void }) {
  const g = useGame()!;
  const st = g.intl;
  const tour = st?.tournament;
  const cur = (INTL_TABS as readonly string[]).includes(tab) ? tab : 'tournament';
  return (
    <div>
      <Head title={t('intl.title')} />
      <Tabs tabs={INTL_TABS.map((k) => [k, t(`intl.tab.${k}`)] as [string, string])} value={cur} onChange={setTab} />
      {g.manager.nationalOffer !== undefined && (
        <div className="cx-tools cx-tools-inline">
          <span className="c-yel">{t('intl.offerText', { nation: natName(g.nations[g.manager.nationalOffer]?.name) })}</span>
          <button onClick={() => act({ t: 'nationalOffer', accept: true })}>{t('intl.accept')}</button>
          <button onClick={() => act({ t: 'nationalOffer', accept: false })}>{t('intl.decline')}</button>
        </div>
      )}
      {g.manager.national && (
        <div className="cx-tools cx-tools-inline">
          <span>{t('intl.myTeam', { nation: natName(g.nations[g.manager.national.nation]?.name) })} – {t('intl.myRecord', { since: dateFmt(g.manager.national.since), played: g.manager.national.played, won: g.manager.national.won })}</span>
          <button onClick={() => act({ t: 'resignNational' })}>{t('intl.resign')}</button>
        </div>
      )}
      {cur === 'tournament' && (() => {
        // VM/EM og de kontinentale slutrunder (Copa América, Afrikamesterskabet, Asian Cup) – den nyeste først
        const all = [tour, ...(st?.cont ?? [])].filter((x): x is IntlTournament => !!x).sort((a, b) => Number(a.stage === 'done') - Number(b.stage === 'done') || b.year - a.year);
        return all.length ? all.map((x) => <CxTournament key={`${x.name}${x.year}`} tour={x} />) : <div className="cx-empty">{t('intl.none')}</div>;
      })()}
      {cur === 'qual' && <CxQual />}
      {cur === 'results' && <CxResults results={st?.results ?? []} />}
      {cur === 'fifa' && <CxFifa />}
      {cur === 'history' && <CxHistory />}
    </div>
  );
}

function CxTournament({ tour }: { tour: IntlTournament }) {
  const rows = (grp: number[]) => grp.map((n) => tour.table[n]).sort((a, b) => b.pts - a.pts || b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf);
  return (
    <>
      <div className="cx-subtitle">{t(`intl.name.${tour.name}`)} {tour.year}{tour.winner !== undefined ? ` – ${natName(gs().nations[tour.winner]?.name)}` : ''}</div>
      <div className="cx-tbl-wrap cx-listpanel">
        <table className="cx-tbl"><thead><tr><th className="btn-col" /><th>{t('col.nat')}</th><th className="c-num">{t('cl.nt.pl')}</th><th className="c-num">{t('cl.nt.w')}</th><th className="c-num">{t('cl.nt.d')}</th><th className="c-num">{t('cl.nt.l')}</th><th className="c-num">{t('cl.nt.gf')}</th><th className="c-num">{t('cl.nt.ga')}</th><th className="c-num">{t('cl.nt.pts')}</th></tr></thead>
          <tbody>{tour.groups.map((grp, i) => rows(grp).map((r, j) => (
            <tr key={`${i}-${r.n}`}><td className="btn-col">{j === 0 ? <span className="cx-rowbtn narrow">{String.fromCharCode(65 + i)}</span> : null}</td><td><CxNat n={r.n} /></td>
              <td className="c-num">{r.p}</td><td className="c-num">{r.w}</td><td className="c-num">{r.d}</td><td className="c-num">{r.l}</td><td className="c-num">{r.gf}</td><td className="c-num">{r.ga}</td><td className="c-val">{r.pts}</td></tr>
          )))}</tbody></table>
      </div>
      {tour.ko.length > 0 && (
        <>
          <div className="cx-subtitle">{t('intl.knockout')}</div>
          <div className="cx-tbl-wrap cx-listpanel"><table className="cx-tbl"><tbody>{tour.ko.map((k, i) => (
            <tr key={i}><td className="btn-col"><span className="cx-rowbtn">{t(`stage.${k.stage}`)}</span></td><td style={{ textAlign: 'right' }}><CxNat n={k.a} /></td>
              <td className="c-val">{k.hg !== undefined ? `${k.hg} - ${k.ag}${k.pens ? ` (${t('intl.pens')})` : ''}` : 'v'}</td><td><CxNat n={k.b} /></td></tr>
          ))}</tbody></table></div>
        </>
      )}
    </>
  );
}

function CxResults({ results }: { results: import('../../game/international').IntlResult[] }) {
  if (!results.length) return <div className="cx-empty">{t('intl.noResults')}</div>;
  return (
    <div className="cx-tbl-wrap cx-listpanel"><table className="cx-tbl">
      <thead><tr><th className="btn-col" /><th style={{ textAlign: 'right' }}>{t('cl.nt.home')}</th><th className="c-num">{t('cl.nt.score')}</th><th>{t('cl.nt.away')}</th><th>{t('cl.nt.comp')}</th></tr></thead>
      <tbody>{results.slice(0, 60).map((r, i) => (
        <tr key={i}><td className="btn-col"><span className="cx-rowbtn">{dateFmt(r.date)}</span></td><td style={{ textAlign: 'right' }}><CxNat n={r.home} /></td>
          <td className="c-val">{r.hg} - {r.ag}</td><td><CxNat n={r.away} /></td><td className="c-cyan">{t(`intl.kind.${r.kind}`)}{r.stage ? ` · ${t(`stage.${r.stage}`)}` : ''}</td></tr>
      ))}</tbody>
    </table></div>
  );
}

function CxFifa() {
  const ranking = fifaRanking().slice(0, 100);
  return (
    <div className="cx-tbl-wrap cx-listpanel"><table className="cx-tbl">
      <thead><tr><th className="btn-col" /><th>{t('col.nat')}</th><th className="c-num">{t('intl.points')}</th></tr></thead>
      <tbody>{ranking.map((r, i) => (
        <tr key={r.n}><td className="btn-col"><span className="cx-rowbtn narrow">{i + 1}</span></td><td><CxNat n={r.n} /></td><td className="c-val">{r.pts}</td></tr>
      ))}</tbody>
    </table></div>
  );
}

/** Tidligere vindere som originalens "FIFA World Cup History": år som blå knapper, vinder, nr. 2, nr. 3 og værter i orange */
function CxHistory() {
  const g = useGame()!;
  const st = g.intl;
  const rows: PastFinal[] = [
    ...(st?.history ?? []).map((h) => ({ c: h.name, y: h.year, w: g.nations[h.winner]?.name ?? '', r: g.nations[h.runnerUp]?.name ?? '', h: '' })),
    ...(st?.past ?? []),
  ];
  const comps = [...new Set(rows.map((r) => r.c))];
  const [comp, setComp] = useRouteState('ihist', comps.includes('wc') ? 'wc' : comps[0] ?? 'wc');
  if (!rows.length) return <div className="cx-empty">{t('intl.noHistory')}</div>;
  const list = rows.filter((r) => r.c === comp).sort((a, b) => b.y - a.y);
  return (
    <>
      <div className="cx-tools cx-tools-inline">
        <CxDrop label={t(`intl.name.${comp}`)} items={comps.map((c) => ({ key: c, label: t(`intl.name.${c}`), checked: c === comp, onClick: () => setComp(c) }))} />
      </div>
      <div className="cx-subtitle">{t('cl.nt.history', { comp: t(`intl.name.${comp}`) })}</div>
      <div className="cx-tbl-wrap cx-listpanel"><table className="cx-tbl">
        <thead><tr><th className="btn-col" /><th>{t('cl.nt.winners')}</th><th>{t('intl.runnerUp')}</th><th>{t('cl.nt.third')}</th><th>{t('cl.nt.hosts')}</th></tr></thead>
        <tbody>{list.map((h, i) => (
          <tr key={`${h.y}-${i}`}><td className="btn-col"><span className="cx-rowbtn">{h.y}</span></td><td><CxNatName name={h.w} /></td><td><CxNatName name={h.r} /></td>
            <td>{h.t ? <CxNatName name={h.t} /> : null}</td><td>{h.h ? <CxNatName name={h.h} cls="c-pos" /> : null}</td></tr>
        ))}</tbody>
      </table></div>
    </>
  );
}

/** Kvalifikationen: grupperne med stilling (vindere og de bedste toere går videre) */
function CxQual() {
  const g = useGame()!;
  const q = g.intl?.qual;
  if (!q) return <div className="cx-empty">{t('intl.noQual')}</div>;
  const rows = (grp: number[]) => grp.map((n) => q.table[n]).sort((a, b) => b.pts - a.pts || b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf);
  return (
    <>
      <div className="cx-subtitle">{t(`intl.qual.start.${q.name}`, { year: q.year })}</div>
      <div className="cx-tbl-wrap cx-listpanel">
        <table className="cx-tbl"><thead><tr><th className="btn-col" /><th>{t('col.nat')}</th><th className="c-num">{t('cl.nt.pl')}</th><th className="c-num">{t('cl.nt.w')}</th><th className="c-num">{t('cl.nt.d')}</th><th className="c-num">{t('cl.nt.l')}</th><th className="c-num">{t('cl.nt.gf')}</th><th className="c-num">{t('cl.nt.ga')}</th><th className="c-num">{t('cl.nt.pts')}</th></tr></thead>
          <tbody>{q.groups.map((grp, i) => rows(grp).map((r, j) => (
            <tr key={`${i}-${r.n}`} className={q.qualified?.includes(r.n) ? '' : q.qualified ? 'dim' : ''}><td className="btn-col">{j === 0 ? <span className="cx-rowbtn narrow">{i + 1}</span> : null}</td><td><CxNat n={r.n} /></td>
              <td className="c-num">{r.p}</td><td className="c-num">{r.w}</td><td className="c-num">{r.d}</td><td className="c-num">{r.l}</td><td className="c-num">{r.gf}</td><td className="c-num">{r.ga}</td><td className="c-val">{r.pts}</td></tr>
          )))}</tbody></table>
      </div>
    </>
  );
}
