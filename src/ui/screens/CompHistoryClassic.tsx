// "FA Premier League History" (CM 01/02): Winners · Records · Attendances · Results øverst og Sequences · Teams · Players
// nederst. Winners = vinder/nummer to pr. år (menneskets klub i gult). Records viser det bedste for alle tider (eller kun den
// igangværende sæson, "Current"); de øvrige faner viser én rekord pr. sæson, valgt under View. Tallene kommer fra
// game/compHistory.ts (de afsluttede sæsoner gemmes ved sæsonskiftet i `g.compRecs`).
import { compSeasonRec, initialName, type CompSeasonRec } from '../../game/compHistory';
import type { Competition } from '../../game/types';
import { compName, t } from '../../i18n';
import { ClassicSub, CxDrop, classicDate } from '../classic';
import { useGame, useRouteState } from '../core';
import { Tabs } from '../components';
import { Head } from './common';

type Tab = 'winners' | 'records' | 'attendances' | 'results' | 'sequences' | 'teams' | 'players';
const TOP: Tab[] = ['winners', 'records', 'attendances', 'results'];
const BOTTOM: Tab[] = ['sequences', 'teams', 'players'];
type Key = keyof CompSeasonRec;
const STATS: Partial<Record<Tab, Key[]>> = {
  attendances: ['hiAtt', 'loAtt', 'avgAtt'],
  results: ['bigWin', 'hiScore'],
  sequences: ['won', 'lost', 'unbeaten', 'winless'],
  teams: ['pts', 'gf', 'ga', 'disc'],
  players: ['top', 'matchGoals', 'assists', 'rating', 'mom', 'pdisc', 'young', 'old'],
};
/** rækkefølgen i Records (originalen): vinder-tælleren først, derefter holdene, tilskuerne, kampene, serierne og spillerne */
const RECORDS: Key[] = ['pts', 'gf', 'ga', 'disc', 'hiAtt', 'loAtt', 'avgAtt', 'bigWin', 'hiScore', 'won', 'lost', 'unbeaten', 'winless', 'top', 'matchGoals', 'assists', 'rating', 'mom', 'pdisc', 'young', 'old'];
/** hvilken værdi der er "bedst" for alle tider: [score, lavest er bedst] */
const SCORE: Record<Key, [(r: never) => number, boolean]> = {
  pts: [(r: { n: number }) => r.n, false], gf: [(r: { n: number }) => r.n, false], ga: [(r: { n: number }) => r.n, false],
  disc: [(r: { y: number; r: number }) => r.y + r.r * 3, false],
  hiAtt: [(r: { att: number }) => r.att, false], loAtt: [(r: { att: number }) => r.att, true], avgAtt: [(r: { n: number }) => r.n, false],
  bigWin: [(r: { hg: number; ag: number }) => Math.abs(r.hg - r.ag) * 100 + Math.max(r.hg, r.ag), false],
  hiScore: [(r: { hg: number; ag: number }) => r.hg + r.ag, false],
  won: [(r: { n: number }) => r.n, false], lost: [(r: { n: number }) => r.n, false], unbeaten: [(r: { n: number }) => r.n, false], winless: [(r: { n: number }) => r.n, false],
  top: [(r: { n: number }) => r.n, false], matchGoals: [(r: { n: number }) => r.n, false], assists: [(r: { n: number }) => r.n, false],
  rating: [(r: { n: number }) => r.n, false], mom: [(r: { n: number }) => r.n, false],
  pdisc: [(r: { y: number; r: number }) => r.y + r.r * 3, false],
  young: [(r: { n: number }) => r.n, true], old: [(r: { n: number }) => r.n, false],
} as never;

export function ClassicCompHistory({ comp }: { comp: Competition }) {
  const g = useGame()!;
  const [tab, setTab] = useRouteState<Tab>('chtab', 'winners');
  const [stat, setStat] = useRouteState<string>('chstat', '');
  const [view, setView] = useRouteState<'all' | 'cur'>('chview', 'all');
  const short = (id: number) => g.clubs[id]?.short ?? '?';
  const yr = (s: number) => `${s}/${String((s + 1) % 100).padStart(2, '0')}`;
  const d = (iso: string) => classicDate(iso)[1];
  const mine = (id?: number) => !!id && id === g.userClub;

  // sæsonerne: den igangværende (regnet nu) og de gemte, nyeste først
  const cur = compSeasonRec(comp, g);
  const stored = Object.entries(g.compRecs?.[comp.id] ?? {}).map(([s, r]) => [Number(s), r] as [number, CompSeasonRec]).sort((a, b) => b[0] - a[0]);
  const seasons: [number, CompSeasonRec][] = [...(Object.keys(cur).length ? [[g.season, cur] as [number, CompSeasonRec]] : []), ...stored];

  const val = (k: Key, r: CompSeasonRec): string => {
    switch (k) {
      case 'pts': case 'gf': case 'ga': case 'avgAtt': { const x = r[k]; return x ? `${x.n} - ${short(x.club)}` : '-'; }
      case 'disc': return r.disc ? `${short(r.disc.club)} - ${r.disc.y} ${t('cl.chh.yellow')} / ${r.disc.r} ${t('cl.chh.red')}` : '-';
      case 'hiAtt': case 'loAtt': { const x = r[k]; return x ? `${x.att} - ${short(x.home)} v ${short(x.away)} ${d(x.date)}` : '-'; }
      case 'bigWin': case 'hiScore': { const x = r[k]; return x ? `${x.hg}-${x.ag} - ${short(x.home)} v ${short(x.away)} ${d(x.date)}` : '-'; }
      case 'won': case 'lost': case 'unbeaten': case 'winless': { const x = r[k]; return x ? `${x.n} - ${short(x.club)} ${d(x.from)} to ${d(x.to)}` : '-'; }
      case 'top': case 'mom': case 'rating': { const x = r[k]; return x ? `${x.name} (${short(x.club)}) - ${k === 'rating' ? x.n.toFixed(2) : x.n}` : '-'; }
      case 'assists': return r.assists ? `${r.assists.n} - ${r.assists.name} (${short(r.assists.club)})` : '-';
      case 'matchGoals': { const x = r.matchGoals; return x ? `${x.n} - ${initialName(x.name)} (${short(x.club)}) v ${short(x.opp)} (${x.away ? 'A' : 'H'}) ${d(x.date)}` : '-'; }
      case 'pdisc': { const x = r.pdisc; return x ? `${x.name} (${short(x.club)}) - ${x.y} ${t('cl.chh.yellow')} / ${x.r} ${t('cl.chh.red')}` : '-'; }
      case 'young': case 'old': { const x = r[k]; return x ? `${x.name} (${short(x.club)}) - ${x.n}` : '-'; }
    }
    return '-';
  };

  // Winners: pr. år (sæson + 1, som i originalen) – de afsluttede sæsoner og en afgjort igangværende
  const winners = (): { year: number; w: number; ru?: number }[] => {
    const out = g.seasonHistory.flatMap((s) => s.comps.filter((c) => c.id === comp.id && c.winner).map((c) => ({ year: s.season + 1, w: c.winner, ru: c.runnerUp })));
    if (comp.finished && comp.winner && !out.some((x) => x.year === g.season + 1)) {
      const fin = comp.ties.find((x) => x.stage === 'F');
      const ru = comp.type === 'league' ? comp.table.slice().sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf)[1]?.club : fin ? (fin.a === comp.winner ? fin.b : fin.a) : undefined;
      out.push({ year: g.season + 1, w: comp.winner, ru });
    }
    return out.sort((a, b) => b.year - a.year);
  };

  // Records, All Time: det bedste på tværs af sæsonerne; Current: kun den igangværende
  const best = (k: Key): string => {
    const [score, lowest] = SCORE[k] as [(x: unknown) => number, boolean];
    let b: [number, unknown] | undefined;
    for (const [s, r] of seasons) { const x = r[k]; if (x !== undefined && (!b || (lowest ? score(x) < score(b[1]) : score(x) > score(b[1])))) b = [s, x]; }
    if (!b) return '-';
    const text = val(k, { [k]: b[1] } as CompSeasonRec);
    return text === '-' ? text : `${text} ${yr(b[0])}`;
  };
  const timesWinner = (): string => {
    const n = new Map<number, number>();
    for (const x of winners()) n.set(x.w, (n.get(x.w) ?? 0) + 1);
    const top = [...n].sort((a, b) => b[1] - a[1])[0];
    return top ? `${short(top[0])} - ${top[1]}` : '-';
  };

  const group = STATS[tab];
  const k = (group?.includes(stat as Key) ? stat : group?.[0] ?? '') as Key;
  const viewItems = tab === 'records'
    ? [{ key: 'all', label: t('cl.chh.allTime'), checked: view === 'all', onClick: () => setView('all') }, { key: 'cur', label: t('cl.chh.current'), checked: view === 'cur', onClick: () => setView('cur') }]
    : group ? group.map((x) => ({ key: x, label: t(`cl.chh.s.${x}`), checked: x === k, onClick: () => setStat(x) })) : [];
  const name = compName(comp.name) ?? comp.name;
  return (
    <div className="cx-chist cx-chist-comp">
      <Head title={t('cl.chh.title', { comp: name })} />
      <Tabs tabs={TOP.map((x) => [x, t(`cl.chh.t.${x}`)] as [string, string])} value={TOP.includes(tab) ? tab : ''} onChange={(v) => setTab(v as Tab)} />
      {tab !== 'winners' && <div className="cx-tools"><CxDrop label={t('cl.sq.view')} items={viewItems} /></div>}
      {tab === 'winners' && (
        <div className="cx-chist-tbl cx-chist-win">
          <div className="cx-chist-wh"><span /><span>{t('cl.chh.winners')}</span><span>{t('cl.chh.runnersUp')}</span></div>
          {winners().map((x) => (
            <div key={x.year} className="cx-chist-row win">
              <span className="cx-chist-btn">{x.year}</span>
              <span className={mine(x.w) ? 'me' : ''}>{short(x.w)}</span>
              <span className={mine(x.ru) ? 'me' : ''}>{x.ru ? short(x.ru) : ''}</span>
            </div>
          ))}
          {!winners().length && <div className="cx-empty">{t('cl.chh.noWinners')}</div>}
        </div>
      )}
      {tab === 'records' && <>
        <div className="cx-subtitle small">{t(view === 'all' ? 'cl.chh.allTime' : 'cl.chh.current')}</div>
        <div className="cx-chist-tbl">
          {view === 'all' && <div className="cx-chist-row"><span>{t('cl.chh.s.times')}</span><span className="v">{timesWinner()}</span></div>}
          {RECORDS.map((x) => <div key={x} className="cx-chist-row"><span>{t(`cl.chh.s.${x}`)}</span><span className="v">{view === 'all' ? best(x) : val(x, cur)}</span></div>)}
        </div>
      </>}
      {group && <>
        <div className="cx-subtitle small">{t(`cl.chh.s.${k}`)}</div>
        <div className="cx-chist-tbl">
          {seasons.map(([s, r]) => <div key={s} className="cx-chist-row date"><span className="cx-chist-btn">{yr(s)}</span><span className="v">{val(k, r)}</span></div>)}
          {!seasons.length && <div className="cx-empty">{t('cl.chh.none')}</div>}
        </div>
      </>}
      <ClassicSub items={BOTTOM.map((x) => ({ key: x, label: t(`cl.chh.t.${x}`), on: tab === x, onClick: () => setTab(x) }))} />
    </div>
  );
}
