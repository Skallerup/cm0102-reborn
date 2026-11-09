
import { isOriginal2001 } from '../../game/rules2001';
import { FirstDay } from '../FirstDay';
import { useEffect, useRef, useState } from 'react';
import { onFocusNews, takeFocus } from '../inboxFocus';
import { squadNumbersDue } from '../../game/squadNumbers';
import { euroDue } from '../../game/euroSquad';
import { ClassicEuroSquad } from './EuroSquad';
import { ClassicSquadNumbers } from './SquadNumbers';
import { act } from '../../game/actions';
import { useHotkeys } from '../hotkeys';
import { dateFmt, money, t } from '../../i18n';
import { Empty, Modal, Panel } from '../components';
import { notify } from '../../game/state';
import { useGame, useRouteState } from '../core';
import { Head, NewsBody, NewsDeals, NewsTitle, newsBody, newsTitle, useOpenLink } from './common';
import { AiArticle } from '../aiArticle';
import { NewsIcon } from '../icons';
import type { NewsCategory, NewsItem } from '../../game/types';
import { isRetro } from '../theme';
import { Tabs } from '../components';
import { ClassicSub, cxShortDate } from '../classic';
import { IncomingBidPanel, JobOfferPanel } from './TransferStatusClassic';

/** Klassisk tema: nyhedsfiltre som faner (øverst) og under-knapper (nederst) */
const CX_TOP = ['all', 'messages', 'competitions', 'injuries'] as const;
const CX_SUB = ['contracts', 'transfers', 'jobs', 'records'] as const;
type CxGroup = typeof CX_TOP[number] | typeof CX_SUB[number];
const CX_CATS: Record<Exclude<CxGroup, 'all'>, NewsCategory[]> = {
  messages: ['board', 'scout', 'youth', 'general'], competitions: ['match'], injuries: ['injury'],
  contracts: ['contract'], transfers: ['transfer'], jobs: ['job'], records: ['award'],
};
const cxDate = cxShortDate;

/** Kategorier, der kan dæmpes (bestyrelse, job, kontrakter og transfers kræver ofte svar – transfers styres af transferfilteret) */
const MUTABLE: NewsCategory[] = ['match', 'injury', 'scout', 'award', 'youth', 'finance', 'general'];

const CATS: (NewsCategory | 'all')[] = ['all', 'match', 'transfer', 'contract', 'injury', 'board', 'scout', 'award', 'youth', 'job', 'general'];

export function Inbox() {
  const g = useGame()!;
  const [cat, setCat] = useRouteState<NewsCategory | 'all'>('cat', 'all');
  const classic = isRetro();
  const [grp, setGrp] = useRouteState<CxGroup>('grp', 'all');
  // altid den ældste uåbnede besked først (listen er sorteret nyeste øverst)
  const oldestUnread = () => g.news.filter((n) => !n.read).pop()?.id;
  const [sel, setSel] = useRouteState<number | null>('sel', () => takeFocus() ?? oldestUnread() ?? g.news[0]?.id ?? null);
  const open = useOpenLink();
  const list = g.news.filter((n) => (classic && grp !== 'all' ? CX_CATS[grp].includes(n.cat) && (cat === 'all' || n.cat === cat)
    : cat === 'all' ? !n.muted : n.cat === cat));
  const [settings, setSettings] = useState(false);
  const [respond, setRespond] = useState<number | null>(null);
  const [jobOpen, setJobOpen] = useState<number | null>(null);
  const [sqnOpen, setSqnOpen] = useState(false);
  const [eurOpen, setEurOpen] = useState(false);
  const item = g.news.find((n) => n.id === sel);
  if (item && !item.read) queueMicrotask(() => act({ t: 'read', ids: [item.id] }));
  const listRef = useRef<HTMLDivElement>(null);
  // klassisk "Filter :" (CM 01/02): fritekst i overskrifterne
  const [q, setQ] = useState('');
  const qn = q.trim().toLowerCase();
  const shown = (qn ? list.filter((n) => newsTitle(n).toLowerCase().includes(qn)) : list).slice(0, 200);
  // Fortsæt-knappen: vis den næste ulæste besked
  useEffect(() => {
    const show = (id: number) => {
      setCat('all');
      setGrp('all');
      setSel(id);
      requestAnimationFrame(() => listRef.current?.querySelector(`[data-id="${id}"]`)?.scrollIntoView({ block: 'nearest' }));
    };
    const f = takeFocus() ?? oldestUnread();
    if (f !== undefined && f !== null) show(f);
    return onFocusNews((id) => { takeFocus(); show(id); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const move = (dir: number) => {
    if (!shown.length) return;
    const i = shown.findIndex((n) => n.id === sel);
    const next = shown[Math.max(0, Math.min(shown.length - 1, i < 0 ? 0 : i + dir))];
    setSel(next.id);
    requestAnimationFrame(() => listRef.current?.querySelector(`[data-id="${next.id}"]`)?.scrollIntoView({ block: 'nearest' }));
  };
  useHotkeys((e) => {
    if (e.key === 'ArrowDown' || e.key === 'j') { move(1); return true; }
    if (e.key === 'ArrowUp' || e.key === 'k') { move(-1); return true; }
    if (e.key === 'Enter' && item?.link) { open(item); return true; }
    if (e.key === 'ArrowRight') { nextUnread(); return true; }
  });
  function nextUnread() {
    const next = shown.filter((n) => !n.read && n.id !== sel).pop();
    if (next) { setSel(next.id); requestAnimationFrame(() => listRef.current?.querySelector(`[data-id="${next.id}"]`)?.scrollIntoView({ block: 'nearest' })); }
  }
  const hasUnread = shown.some((n) => !n.read && n.id !== sel);
  // et bud på egen spiller, der stadig venter på svar (CM 01/02: knappen Respond)
  const pendingBid = item?.link?.kind === 'offer' ? g.offers.find((o) => o.id === Number(item.link!.id) && o.status === 'pending' && o.seller === g.userClub) : undefined;
  const respondOffer = respond !== null ? g.offers.find((o) => o.id === respond && o.status === 'pending') : undefined;
  // et jobtilbud, der venter på svar (CM 01/02: Respond i nyheden)
  const jobOffer = item?.link?.kind === 'club' && g.jobOffers.includes(Number(item.link.id)) ? Number(item.link.id) : undefined;

  if (classic) {
    if (jobOpen !== null && g.jobOffers.includes(jobOpen)) return <div><Head title={g.manager.name} /><JobOfferPanel cid={jobOpen} onClose={() => setJobOpen(null)} /></div>;
    // Squad Numbers (CM 01/02): Respond på "… squad numbers to be decided" åbner listen
    if (sqnOpen && squadNumbersDue(g.userClub)) return <div><Head title={t('sqn.titleClub', { club: g.clubs[g.userClub]?.short ?? '' })} /><ClassicSquadNumbers onClose={() => setSqnOpen(false)} /></div>;
    // European Squad (CM 01/02): Respond på "… to register players for next phase"
    if (eurOpen && euroDue(g.userClub)) return <div><Head title={t('eur.titleClub', { club: g.clubs[g.userClub]?.short ?? '' })} /><ClassicEuroSquad onClose={() => setEurOpen(false)} /></div>;
    if (respondOffer) return <div><Head title={g.clubs[g.userClub]?.short ?? ''} /><IncomingBidPanel offer={respondOffer} onClose={() => setRespond(null)} /></div>;
    const pick = (k: CxGroup) => { setGrp(k); setCat('all'); const first = g.news.find((n) => k === 'all' ? !n.muted : CX_CATS[k].includes(n.cat)); setSel(first?.id ?? null); };
    return (
      <div className="cx-inbox">
        <Head title={t('cl.news', { name: g.manager.name })}>
          <Tabs tabs={CX_TOP.map((k) => [k, t(`cl.tab.${k}`)] as [string, string])} value={(CX_TOP as readonly string[]).includes(grp) ? grp : ''} onChange={(v) => pick(v as CxGroup)} />
        </Head>
        <ClassicSub items={CX_SUB.map((k) => ({ key: k, label: t(`cl.tab.${k}`), on: grp === k, onClick: () => pick(k) }))} />
        {settings && <NewsSettings onClose={() => setSettings(false)} />}
        <div className="cx-nlist" ref={listRef}>
          {list.length === 0 && <div className="cx-nempty">{t('inbox.empty')}</div>}
          {shown.map((n) => (
            <div key={n.id} data-id={n.id} className={`cx-nrow ${sel === n.id ? 'on' : ''} ${n.read ? '' : 'unread'}`} onClick={() => setSel(n.id)}>
              <span className="cx-ndate">{cxDate(n.date)}</span>
              <span className="cx-ntitle">{newsTitle(n)}</span>
            </div>
          ))}
        </div>
        <div className="cx-nbar">
          {/* CM 01/02: "Respond" på et bud, der venter på svar – ellers kun "Filter :" og Next Unread */}
          {pendingBid && <button className="cx-grey cx-respond" onClick={() => setRespond(pendingBid.id)}>{t('cl.bid.respond')}</button>}
          {item?.key === 'sqn.request' && squadNumbersDue(g.userClub) && <button className="cx-grey cx-respond" onClick={() => setSqnOpen(true)}>{t('cl.bid.respond')}</button>}
          {item?.key === 'eur.request' && euroDue(g.userClub) && <button className="cx-grey cx-respond" onClick={() => setEurOpen(true)}>{t('cl.bid.respond')}</button>}
          {jobOffer !== undefined && <button className="cx-grey cx-respond" onClick={() => setJobOpen(jobOffer)}>{t('cl.bid.respond')}</button>}
          <span className="cx-grow" />
          <label className="cx-nfilter">{t('cl.filter')} :
            <input value={q} onChange={(e) => setQ(e.target.value)} spellCheck={false} />
          </label>
          <button className="cx-grey" disabled={!hasUnread} onClick={nextUnread}>{t('cl.nextUnread')}</button>
        </div>
        {item ? (
          <div className="cx-nmsg">
            {/* overskriften åbner det, nyheden handler om (originalen har ingen knap her) */}
            <h3 className="cx-nhead">{item.link ? <span className="cx-link" role="link" onClick={() => open(item)}><NewsTitle n={item} /></span> : <NewsTitle n={item} />}</h3>
            {newsBody(item) && <p className="cx-nbody"><NewsBody n={item} /></p>}
            <NewsDeals n={item} />
            <WarRaise item={item} />
            <AppealBox item={item} />
            <AiArticle item={item} />
          </div>
        ) : <div className="cx-nmsg"><div className="cx-nempty">{t('inbox.select')}</div></div>}
      </div>
    );
  }

  return (
    <div>
      <Head title={t('nav.inbox')}>
        <select value={cat} onChange={(e) => setCat(e.target.value as NewsCategory | 'all')}>
          {CATS.map((c) => <option key={c} value={c}>{t(`cat.${c}`)}</option>)}
        </select>
        <span className="muted kbd-hint">{t('inbox.keys')}</span>
        <button className="small" onClick={() => act({ t: 'read', ids: 'all' })}>{t('inbox.markRead')}</button>
        <button className="small" onClick={() => setSettings(true)}>⚙ {t('inbox.settings')}</button>
      </Head>
      {settings && <NewsSettings onClose={() => setSettings(false)} />}
      <FirstDay />
      <div className="cols2">
        <Panel title={t('inbox.messages')} className="flush">
          {list.length === 0 && <Empty text={t('inbox.empty')} />}
          <div style={{ maxHeight: '70vh', overflowY: 'auto' }} ref={listRef}>
            {shown.map((n) => (
              <div key={n.id} data-id={n.id} className={`news-item ${n.read ? '' : 'unread'} ${n.key.startsWith('window.') ? 'news-window' : ''}`} onClick={() => setSel(n.id)} style={sel === n.id ? { background: 'var(--rowhover)' } : undefined}>
                <NewsIcon newsKey={n.key} cat={n.cat} />
                <span className="date">{dateFmt(n.date)}</span>
                <span className="title">{newsTitle(n)}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title={item ? dateFmt(item.date, true) : ''}>
          {item ? (
            <div className="col">
              <h3 style={{ color: 'var(--accent)', display: 'flex', gap: 10, alignItems: 'center' }} className="news-head"><NewsIcon newsKey={item.key} cat={item.cat} /><span><NewsTitle n={item} /></span></h3>
              {newsBody(item) && <p style={{ lineHeight: 1.5, whiteSpace: 'pre-line' }}><NewsBody n={item} /></p>}
              <NewsDeals n={item} />
              <WarRaise item={item} />
              <AppealBox item={item} />
              <AiArticle item={item} />
              {item.link && <div><button onClick={() => open(item)}>{t('inbox.open')}</button></div>}
            </div>
          ) : <Empty text={t('inbox.select')} />}
        </Panel>
      </div>
    </div>
  );
}

/** Budkrig: hæv dit bud én gang – blindt – før afsløringen */
function WarRaise({ item }: { item: NewsItem }) {
  const g = useGame()!;
  const [amount, setAmount] = useState(0);
  const [res, setRes] = useState('');
  let cur = 0, raised = false, wage = false, max = 0, send: ((v: number) => string) | null = null;
  if (item.key === 'war.started' || item.key === 'war.startedWage') {
    const o = g.offers.find((x) => x.id === Number(item.params.oid));
    if (!o || o.buyer !== g.userClub || o.status !== 'pending' || !(o.auction || o.war)) return null;
    wage = !!o.signing;
    cur = wage ? o.signing!.wage : o.fee;
    raised = !!o.raised;
    max = wage ? Math.round(cur * 1.6) : Math.min(g.clubs[g.userClub].transferBudget, Math.round(cur * 1.6));
    send = (v) => act<string>({ t: 'raiseBid', offer: o.id, amount: v });
  } else if (item.key === 'war.staffStarted') {
    const b = g.staffBids?.find((x) => x.staff === Number(item.params.sid) && x.club === g.userClub);
    if (!b || !b.war) return null;
    wage = true;
    cur = b.wage ?? 0;
    raised = !!b.raised;
    max = Math.round(cur * 1.6);
    send = (v) => act<string>({ t: 'raiseStaff', staff: b.staff, wage: v });
  } else return null;
  const step = wage ? 50 : 50_000;
  const v = Math.min(max, Math.max(amount || cur, cur));
  return (
    <div className="war-box">
      <div className="war-title">⚔️ {t('war.boxTitle')}</div>
      <div>{t(wage ? 'war.boxCurWage' : 'war.boxCur', { amount: money(cur) })}</div>
      {raised ? <div className="muted">{t('war.boxRaised')}</div> : max > cur ? (
        <>
          <label>{t('war.boxNew')}: <b className="accent">{money(v)}</b>{wage ? ` / ${t('common.week')}` : ''} (+{Math.round(((v - cur) / Math.max(1, cur)) * 100)}%)
            <input type="range" min={cur} max={max} step={step} value={v} onChange={(e) => setAmount(Number(e.target.value))} style={{ width: '100%' }} />
          </label>
          <div className="row">
            <button className="primary" disabled={v <= cur || !send} onClick={() => setRes(send!(v))}>{t('war.boxRaise')}</button>
            <span className="muted">{t('war.boxOnce')}</span>
          </div>
        </>
      ) : <div className="muted">{t('war.boxNoRoom')}</div>}
      {res && res !== 'ok' && <div className="bad">{t(`war.err.${res}`) !== `war.err.${res}` ? t(`war.err.${res}`) : t(res)}</div>}
    </div>
  );
}

/** Hvilke og hvor mange nyheder man får – direkte fra indbakken */
function NewsSettings({ onClose }: { onClose: () => void }) {
  const g = useGame()!;
  const muted = new Set(g.options.mutedNews ?? []);
  const toggle = (c: NewsCategory) => {
    const on = !muted.has(c);
    g.options.mutedNews = on ? [...muted, c] : [...muted].filter((x) => x !== c);
    // også de beskeder, der allerede ligger i indbakken
    for (const n of g.news) if (n.cat === c) { n.muted = on || undefined; if (on) n.read = true; }
    notify();
  };
  return (
    <Modal title={t('inbox.settings')} onClose={onClose}>
      <div className="col news-settings">
        <label className="row">{t('opt.news')}
          <select value={g.options.newsScope ?? 'league'} onChange={(e) => { g.options.newsScope = e.target.value as 'nation'; notify(); }}>
            {(['league', 'nation', 'world'] as const).map((m) => <option key={m} value={m}>{t(`opt.news.${m}`)}</option>)}
          </select>
        </label>
        <label className="row">{t('opt.transferNews')}
          <select value={g.options.transferNews ?? 'big'} onChange={(e) => { g.options.transferNews = e.target.value as 'big'; notify(); }}>
            {(['own', 'big', 'all'] as const).map((m) => <option key={m} value={m}>{t(`opt.transferNews.${m}`)}</option>)}
          </select>
        </label>
        <div>
          <b>{t('inbox.categories')}</b>
          <div className="muted" style={{ fontSize: 12.5, margin: '2px 0 8px' }}>{t('inbox.mutedHint')}</div>
          <div className="news-cats">
            {MUTABLE.map((c) => (
              <label key={c} className={`choice ${muted.has(c) ? '' : 'on'}`}>
                <input type="checkbox" checked={!muted.has(c)} onChange={() => toggle(c)} />{t(`cat.${c}`)}
              </label>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

/** CM 01/02 (kun den originale database): anke et rødt kort fra nyheden om karantænen */
function AppealBox({ item }: { item: NewsItem }) {
  const g = useGame()!;
  const [res, setRes] = useState('');
  if (item.key !== 'ban.red' || !isOriginal2001()) return null;
  const p = g.players[Number(item.params.pid)];
  if (!p || p.club !== g.userClub) return null;
  if (res) return <div className="insight">{t(`ban.appeal.${res}.short`)}</div>;
  if (p.appealed || p.banned <= 0) return null;
  return <div className="row" style={{ marginTop: 8 }}><button className="small" onClick={() => setRes(act<string>({ t: 'appealBan', pid: p.id }))}>{t('ban.appeal')}</button><span className="muted">{t('ban.appealHint')}</span></div>;
}
