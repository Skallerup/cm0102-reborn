import './classic.css';
// Klassisk tema: skærmopbygning som i de klassiske manager-spil fra omkring 2001.
// Hver skærm hører til en "hub" med titelbjælke (i klubbens farver), en række faner øverst og
// en række under-knapper nederst over den brede Tilbage/Frem-bjælke. Venstre-kolonnen er fast.
//
// Shell'en ejer pladserne (slots) til faner og under-knapper; Head og Tabs fylder dem via portaler,
// så de enkelte skærme ikke skal kende til layoutet.
import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { gs } from '../game/state';
import type { GameState, Staff } from '../game/types';
import { compName, natName, t } from '../i18n';
import { useNav, type Route, type ScreenName } from './core';
import { Crest } from './components';

// ---------- pladser (slots) som Shell stiller til rådighed ----------

export interface ClassicSlots { tabs: HTMLElement | null; sub: HTMLElement | null; setTabs: (el: HTMLElement | null) => void }
export const ClassicSlotCtx = createContext<ClassicSlots | null>(null);
/** null = ikke klassisk tema */
export function useClassicSlots() { return useContext(ClassicSlotCtx); }

// ---------- Next-knappen nederst kan overtages af skærmen (fx "Continue" ved slutfløjt, som i CM 01/02) ----------

let nextAction: { label: string; run: () => void } | null = null;
const nextSubs = new Set<() => void>();
const emitNext = () => nextSubs.forEach((f) => f());
/** Skærmen lægger sin egen handling på Next-knappen, så længe `label` er sat */
export function useClassicNext(label: string | null, run: () => void) {
  const ref = useRef(run);
  ref.current = run;
  useEffect(() => {
    if (!label) return;
    const a = { label, run: () => ref.current() };
    nextAction = a;
    emitNext();
    return () => { if (nextAction === a) { nextAction = null; emitNext(); } };
  }, [label]);
}
/** Shell: den aktuelle overtagelse af Next-knappen (null = almindelig Frem) */
export function useClassicNextAction() {
  return useSyncExternalStore((f) => { nextSubs.add(f); return () => { nextSubs.delete(f); }; }, () => nextAction);
}

/** Hvem der har taget hovedfanerækken (den første Tabs på skærmen) – pr. slot-element */
const tabOwner = new WeakMap<HTMLElement, string>();
/**
 * Klassisk tema: skal denne Tabs fylde hovedfanerækken? Den første Tabs på skærmen tager pladsen,
 * når skærmens hub ikke selv har faner. Returnerer slot-elementet eller null.
 */
export function useClaimTabSlot(id: string): HTMLElement | null {
  const slots = useClassicSlots();
  const el = slots?.tabs ?? null;
  if (el && !tabOwner.has(el)) tabOwner.set(el, id);
  useEffect(() => () => { if (el && tabOwner.get(el) === id) tabOwner.delete(el); }, [el, id]);
  return el && tabOwner.get(el) === id ? el : null;
}

// ---------- hubs ----------

export type Item = { key: string; label: string; route?: Route; on?: boolean; disabled?: boolean; onClick?: () => void };
interface Hub {
  /** Titeltekst; undefined = skærmens egen titel */
  title?: (g: GameState, route: Route, screenTitle: ReactNode) => ReactNode;
  /** Hvilken klubs farver titelbjælken har (uden: ens egen klub; undefined fra funktionen = neutral, hvid bjælke) */
  club?: (g: GameState, route: Route) => number | undefined;
  tabs?: ScreenName[];
  sub?: (ScreenName | 'lastMatch' | 'division')[];
  /** ingen hub-faner på denne rute (fx én stabspersons profil) */
  plain?: (route: Route) => boolean;
  /** egne farver i titelbjælken (fx et landshold) – går forud for klubbens */
  colors?: (g: GameState, route: Route) => { bg: string; fg: string } | undefined;
}

/** Landsholdenes farver (trøje, tekst) til titelbjælken – som klubberne; øvrige lande får en neutral bjælke */
const NATION_COLORS: Record<string, [string, string]> = {
  England: ['#ffffff', '#c8102e'], Scotland: ['#0b2a6f', '#ffffff'], Wales: ['#c8102e', '#ffffff'], 'Northern Ireland': ['#007a3d', '#ffffff'],
  'Republic of Ireland': ['#169b62', '#ffffff'], Denmark: ['#c8102e', '#ffffff'], Sweden: ['#fecc00', '#005293'], Norway: ['#ba0c2f', '#ffffff'],
  Finland: ['#ffffff', '#002f6c'], Iceland: ['#02529c', '#ffffff'], Germany: ['#ffffff', '#000000'], France: ['#0055a4', '#ffffff'],
  Italy: ['#0066b3', '#ffffff'], Spain: ['#c60b1e', '#ffc400'], Portugal: ['#a6192e', '#ffffff'], Holland: ['#ff6600', '#ffffff'],
  Netherlands: ['#ff6600', '#ffffff'], Belgium: ['#e30613', '#ffffff'], Switzerland: ['#d52b1e', '#ffffff'], Austria: ['#ed2939', '#ffffff'],
  Poland: ['#ffffff', '#dc143c'], 'Czech Republic': ['#d7141a', '#ffffff'], Croatia: ['#ff0000', '#ffffff'], Serbia: ['#c6363c', '#ffffff'],
  Yugoslavia: ['#0c4076', '#ffffff'], Russia: ['#ffffff', '#0039a6'], Ukraine: ['#ffd700', '#0057b7'], Turkey: ['#e30a17', '#ffffff'],
  Greece: ['#0d5eaf', '#ffffff'], Romania: ['#fcd116', '#002b7f'], Bulgaria: ['#ffffff', '#00966e'], Hungary: ['#ce2939', '#ffffff'],
  Brazil: ['#ffdf00', '#009c3b'], Argentina: ['#75aadb', '#ffffff'], Uruguay: ['#5cbfeb', '#000000'], Colombia: ['#fcd116', '#003893'],
  Chile: ['#d52b1e', '#ffffff'], Paraguay: ['#d52b1e', '#ffffff'], Peru: ['#ffffff', '#d91023'], Mexico: ['#006847', '#ffffff'],
  USA: ['#ffffff', '#002868'], 'United States': ['#ffffff', '#002868'], Canada: ['#d80621', '#ffffff'], Japan: ['#000555', '#ffffff'],
  'South Korea': ['#c60c30', '#ffffff'], 'Korea Republic': ['#c60c30', '#ffffff'], China: ['#de2910', '#ffde00'], Australia: ['#ffcd00', '#00843d'],
  Nigeria: ['#008751', '#ffffff'], Cameroon: ['#007a5e', '#fcd116'], Senegal: ['#ffffff', '#00853f'], Ghana: ['#ffffff', '#000000'],
  'Ivory Coast': ['#f77f00', '#ffffff'], "Côte d'Ivoire": ['#f77f00', '#ffffff'], Morocco: ['#c1272d', '#ffffff'], Tunisia: ['#e70013', '#ffffff'],
  Egypt: ['#ce1126', '#ffffff'], 'South Africa': ['#ffb612', '#007a4d'], 'Saudi Arabia': ['#ffffff', '#006c35'], Iran: ['#ffffff', '#da0000'],
};
export function nationColors(name: string | undefined): { bg: string; fg: string } | undefined {
  const c = name ? NATION_COLORS[name] : undefined;
  return c ? { bg: c[0], fg: c[1] } : undefined;
}

const clubName = (g: GameState) => g.clubs[g.userClub]?.name ?? '';

// ---------- klikbare navne (klubber, nationer, turneringer, stab) ----------

/** Ruten til en klub: ens egen klub åbner truppen, andre klubber deres side */
export const clubRoute = (id: number): Route => (id === gs().userClub ? { name: 'squad' } : { name: 'club', id });
/** Ruten til en nation: landsholdets side (truppen, resultater og landets liga – som i CM 01/02) */
export function nationRoute(nation: number): Route {
  return { name: 'international', id: nation };
}
/** Ruten til en stabsperson: ens eget staff eller ansættelsen (ledig eller i en anden klub) */
export function staffRoute(s: Staff): Route {
  return { name: 'staff', id: s.id };
}

/** Et navn man kan klikke på i klassisk stil (beholder tekstens farve, lyser op ved hover) */
export function CxLink({ to, children, title }: { to: Route; children: ReactNode; title?: string }) {
  const { nav } = useNav();
  return (
    <span className="cx-link" role="link" tabIndex={0} title={title}
      onClick={(e) => { e.stopPropagation(); nav(to); }} onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); nav(to); } }}>{children}</span>
  );
}

/** Klubnavne adskilt af komma – hver af dem klikbar */
export function ClubList({ ids, empty, suffix }: { ids: number[]; empty: ReactNode; suffix?: (id: number, i: number) => ReactNode }) {
  const g = gs();
  const list = ids.filter((id) => g.clubs[id]);
  if (!list.length) return <>{empty}</>;
  return <>{list.map((id, i) => <span key={`${id}-${i}`}>{i > 0 && ', '}<CxLink to={clubRoute(id)}>{g.clubs[id].name}</CxLink>{suffix?.(id, i)}</span>)}</>;
}
const mgrName = (g: GameState) => g.manager?.name ?? '';
const own = (g: GameState) => g.userClub || undefined;

const CLUB_TABS: ScreenName[] = ['squad', 'transfers', 'assistant', 'fixtures', 'club'];
const CLUB_SUB: Hub['sub'] = ['tactics', 'training', 'lastMatch', 'division', 'finance'];
const OFFICE_TABS: ScreenName[] = ['finance', 'board', 'staff', 'scouting'];
const OFFICE_SUB: Hub['sub'] = ['squad', 'tactics', 'training', 'division'];
const MGR_TABS: ScreenName[] = ['profile', 'history', 'awards', 'jobs', 'ranking'];
const MGR_SUB: Hub['sub'] = ['community', 'support', 'managers'];

const HUBS: Partial<Record<ScreenName, Hub>> = {
  squad: { title: clubName, club: own, tabs: CLUB_TABS, sub: CLUB_SUB },
  transfers: { title: () => t('cl.tr.title'), club: own },
  assistant: { title: (g) => `${clubName(g)} – ${t('cl.nextMatch')}`, club: own, tabs: CLUB_TABS, sub: CLUB_SUB },
  fixtures: { title: (g) => `${clubName(g)} ${t('nav.fixtures')}`, club: own, tabs: CLUB_TABS, sub: CLUB_SUB },
  club: {
    title: (g, r) => g.clubs[Number(r.id ?? g.userClub)]?.name ?? '',
    club: (g, r) => Number(r.id ?? g.userClub) || undefined,
    tabs: CLUB_TABS, sub: CLUB_SUB,
  },
  tactics: { title: (g) => `${clubName(g)} ${t('nav.tactics')}`, club: own, tabs: CLUB_TABS, sub: CLUB_SUB },
  // træning og transfersøgning har deres egne faner og under-knapper (som i originalen)
  training: { title: (g) => `${g.clubs[g.userClub]?.short ?? clubName(g)} ${t('nav.training')}`, club: own },
  report: { club: own, tabs: CLUB_TABS, sub: CLUB_SUB },
  finance: { title: (g) => `${clubName(g)} ${t('nav.finance')}`, club: own, tabs: OFFICE_TABS, sub: OFFICE_SUB },
  board: { title: clubName, club: own },
  // en enkelt stabsperson (route.id): hans navn i hans klubs farver, uden kontorets faner
  staff: { title: (g, r, st) => (r.id !== undefined ? st : `${clubName(g)} ${t('nav.staff')}`), club: (g, r) => (r.id !== undefined ? g.staff[Number(r.id)]?.club || undefined : own(g)), tabs: OFFICE_TABS, sub: OFFICE_SUB, plain: (r) => r.id !== undefined },
  scouting: { title: (g) => `${clubName(g)} ${t('nav.scouting')}`, club: own, tabs: OFFICE_TABS, sub: OFFICE_SUB },
  profile: { title: mgrName, tabs: MGR_TABS, sub: MGR_SUB },
  // et landshold (route.id = nationen): landets navn i landsholdets farver – fanerne er skærmens egne
  international: {
    title: (g, r, st) => (r.id !== undefined ? natName(g.nations[Number(r.id)]?.name) : st),
    club: () => undefined,
    // uden land: turneringernes gyldne bjælke (som "FIFA World Cup History" i originalen)
    colors: (g, r) => (r.id !== undefined ? nationColors(g.nations[Number(r.id)]?.name) : { bg: '#d6b24c', fg: '#ffffff' }),
  },
  history: { title: mgrName, tabs: MGR_TABS, sub: MGR_SUB },
  awards: { title: mgrName, tabs: MGR_TABS, sub: MGR_SUB },
  jobs: { title: mgrName, tabs: MGR_TABS, sub: MGR_SUB },
  ranking: { title: mgrName, tabs: MGR_TABS, sub: MGR_SUB },
  community: { tabs: MGR_TABS, sub: MGR_SUB },
  support: { tabs: MGR_TABS, sub: MGR_SUB },
  managers: { tabs: MGR_TABS, sub: MGR_SUB },
  player: {
    // spillerens klub i titlen kan klikkes (som i originalen)
    title: (g, r, st) => { const p = g.players[Number(r.id)]; return p ? <>{p.first} {p.last}{p.club && g.clubs[p.club] ? <> (<CxLink to={clubRoute(p.club)}>{g.clubs[p.club].name}</CxLink>)</> : null}</> : st; },
    club: (g, r) => g.players[Number(r.id)]?.club || undefined,
  },
  // konkurrencer, kampe, indstillinger, hjælp: skærmens egen titel og egne faner
};

/** Kort fanetekst i klassisk stil */
const LABEL: Partial<Record<string, string>> = {
  assistant: 'cl.nextMatch', club: 'cl.finInfo', lastMatch: 'cl.lastMatch', division: 'cl.division',
};
const label = (k: string) => t(LABEL[k] ?? `nav.${k}`);

/** Fanerne på en anden klubs side → klubsidens visninger */
const VIEWED: Record<string, string> = { squad: 'squad', transfers: 'transfers', assistant: 'next', fixtures: 'fixtures', club: 'info', finance: 'finances' };

/** Den seneste spillede kamp for en klub (til "Sidste kamp") */
function lastMatchId(g: GameState, club: number): number | undefined {
  let best: { id: number; date: string } | undefined;
  for (const f of Object.values(g.fixtures)) {
    if (!f.result || (f.home !== club && f.away !== club) || !g.reports[f.id]) continue;
    if (!best || f.date > best.date) best = { id: f.id, date: f.date };
  }
  return best?.id;
}

function itemsFor(keys: Hub['sub'] | ScreenName[] | undefined, g: GameState, route: Route, allowed: (k: ScreenName) => boolean): Item[] {
  if (!keys) return [];
  // en anden klubs side: fanerne (trup, transfers, næste kamp, kampprogram, økonomi & info) og under-knapperne
  // (sidste kamp, division, økonomi) viser den klub – ikke ens egen. Taktik og træning findes kun for ens egen klub.
  const viewed = route.name === 'club' && route.id && Number(route.id) !== g.userClub ? Number(route.id) : 0;
  const out: Item[] = [];
  for (const k of keys) {
    if (viewed && (k === 'tactics' || k === 'training')) continue;
    if (viewed && k in VIEWED) {
      const cview = VIEWED[k];
      const cur = (route.state?.cview as string | undefined) ?? 'squad';
      const group = (x: string) => (x === 'finances' || x === 'income' || x === 'expenditure' ? 'finances' : x === 'stats' ? 'info' : x);
      // økonomien kan kun ses for andre klubber uden attribut-maskering (som på selve skærmen)
      const hidden = k === 'finance' && g.options.masking;
      out.push({ key: k, label: label(k), route: hidden ? undefined : { name: 'club', id: viewed, state: { cview } }, disabled: hidden, on: group(cur) === cview });
      continue;
    }
    if (k === 'lastMatch') {
      const id = lastMatchId(g, viewed || g.userClub);
      out.push({ key: k, label: label(k), route: id ? { name: 'report', id } : undefined, disabled: !id, on: route.name === 'report' });
    } else if (k === 'division') {
      const lg = g.clubs[viewed || g.userClub]?.league;
      out.push({ key: k, label: label(k), route: { name: 'competitions', id: lg }, disabled: !lg });
    } else {
      if (!allowed(k)) continue;
      // "Generel info" er kun aktiv for ens egen klub (andre klubber har ingen hub-fane)
      const on = route.name === k && (k !== 'club' || !route.id || Number(route.id) === g.userClub);
      out.push({ key: k, label: label(k), route: { name: k }, on });
    }
  }
  return out;
}

// ---------- tilgængelige skærme (sættes af Shell) ----------

let allowedFn: (k: ScreenName) => boolean = () => true;
export function setClassicAllowed(f: (k: ScreenName) => boolean) { allowedFn = f; }

// ---------- knapperækker ----------

export function ButtonRow({ items, className }: { items: Item[]; className: string }) {
  const { nav } = useNav();
  return (
    <div className={className}>
      {items.map((it) => (
        <button key={it.key} className={it.on ? 'on' : ''} disabled={it.disabled}
          onClick={() => { if (it.onClick) it.onClick(); else if (it.route) nav(it.route); }}>{it.label}</button>
      ))}
    </div>
  );
}

/** Udfyld under-knap-rækken (portal til Shell'ens slot) */
export function ClassicSub({ items }: { items: Item[] }) {
  const slots = useClassicSlots();
  if (!slots?.sub || !items.length) return null;
  return createPortal(<ButtonRow items={items} className="cx-subrow" />, slots.sub);
}

// ---------- titelbjælken ----------

function hexRgb(h: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(h ?? '');
  if (!m) return [255, 255, 255];
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const luma = ([r, g, b]: [number, number, number]) => (0.299 * r + 0.587 * g + 0.114 * b) / 255;
const dist = (a: [number, number, number], b: [number, number, number]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/** Titelbjælkens farver: klubbens 1. farve som flade, 2. farve som tekst (som i originalen) */
export function titleColors(clubId: number | undefined): { bg: string; fg: string; neutral: boolean } {
  const c = clubId ? gs().clubs[clubId] : undefined;
  if (!c) return { bg: '#f4f6fb', fg: '#0b1a5c', neutral: true };
  const a = hexRgb(c.colors[0]), b = hexRgb(c.colors[1] ?? '#ffffff');
  // som i CM 01/02: klubbens 2. farve er altid teksten (Barcelona: rød på blå) – kun næsten ens farver giver hvid/mørk
  const readable = dist(a, b) > 60;
  const fg = readable ? c.colors[1] : luma(a) > 0.6 ? '#0b1a5c' : '#ffffff';
  return { bg: c.colors[0], fg, neutral: false };
}

/** Pop op-menuen bag ▸-knappen i titelbjælken: alle skærme, grupperet */
const MENU: [string, ScreenName[]][] = [
  ['nav.inbox', ['inbox']],
  ['navg.team', ['squad', 'tactics', 'training', 'assistant']],
  ['navg.matches', ['fixtures', 'competitions', 'international']],
  ['navg.market', ['transfers', 'scouting']],
  ['navg.club', ['club', 'board', 'finance', 'staff']],
  ['navg.manager', ['profile', 'ranking', 'awards', 'history', 'jobs']],
  ['navg.community', ['community', 'support', 'help']],
];

/** ▸-menuen: på klubskærme klubberne i klubbens liga (som i CM 01/02) og landet; ellers – eller via "Alle skærme" – alle skærme */
function TitleMenu({ clubId }: { clubId?: number }) {
  const [open, setOpen] = useState(false);
  const [all, setAll] = useState(false);
  const { nav } = useNav();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);
  const g = gs();
  const club = clubId ? g.clubs[clubId] : undefined;
  const rivals = club?.league ? Object.values(g.clubs).filter((c) => c.league === club.league).sort((a, b) => a.short.localeCompare(b.short, t('cl.locale'))) : [];
  const go = (r: Route) => { setOpen(false); nav(r); };
  return (
    <div className="cx-menu" ref={ref}>
      <button className="cx-menu-btn" aria-label={t('cl.menu')} title={t('cl.menu')} onClick={() => { setAll(false); setOpen(!open); }}>▸</button>
      {open && (rivals.length && !all ? (
        <div className="cx-menu-pop cx-menu-clubs" role="menu">
          {rivals.map((c) => (
            <button key={c.id} role="menuitem" className={c.id === clubId ? 'on' : ''} onClick={() => go(c.id === g.userClub ? { name: 'squad' } : { name: 'club', id: c.id })}>{c.short}</button>
          ))}
          <div className="cx-drop-sep" />
          <button role="menuitem" onClick={() => go({ name: 'competitions', id: club!.league })}>{compName(g.leagues[club!.league]?.name)}</button>
          <button role="menuitem" onClick={() => go({ name: 'nation', id: club!.nation })}>{natName(g.nations[club!.nation]?.name)}</button>
          <div className="cx-drop-sep" />
          <button role="menuitem" onClick={() => setAll(true)}>{t('cl.menu.all')}</button>
        </div>
      ) : (
        <div className="cx-menu-pop" role="menu">
          {MENU.map(([gr, ks]) => {
            const shown = ks.filter((k) => allowedFn(k));
            if (!shown.length) return null;
            return (
              <div key={gr} className="cx-menu-group">
                <div className="cx-menu-head">{t(gr)}</div>
                {shown.map((k) => <button key={k} role="menuitem" onClick={() => go({ name: k })}>{t(`nav.${k}`)}</button>)}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/**
 * Skærmhovedet i klassisk stil: titelbjælke, hub-faner og en værktøjslinje med skærmens egne kontroller.
 * Har hubben ingen faner, fylder skærmens egne faner (Tabs i Head) hovedfanerækken.
 */
export function ClassicHead({ title, children, action }: { title: ReactNode; children?: ReactNode; action?: ReactNode }) {
  const { route } = useNav();
  const slots = useClassicSlots();
  const g = gs();
  const hub = HUBS[route.name];
  const text = hub?.title ? hub.title(g, route, title) : title;
  // klubbens farvetema: skærme uden egen klub (nyheder, manager, hjælp …) bruger ens egen klubs farver
  const own2 = hub?.colors?.(g, route);
  const col = own2 ? { ...own2, neutral: false } : titleColors(hub?.club ? hub.club(g, route) : g.userClub || undefined);
  // klubbens logo i titelbjælken (kun på klubbens egne skærme)
  const logoClub = hub?.club ? hub.club(g, route) : undefined;
  const plain = hub?.plain?.(route);
  const tabs = plain ? [] : itemsFor(hub?.tabs, g, route, allowedFn);
  const sub = plain ? [] : itemsFor(hub?.sub, g, route, allowedFn);
  const promote = !tabs.length;
  // stil hovedfanerækken til rådighed for skærmens egne faner (kun når hubben ikke har sine egne)
  const setTabs = slots?.setTabs;
  // stabil ref-callback: ellers kaldes den ved hver render (null → element) og giver en render-løkke
  const slotRef = useCallback((el: HTMLDivElement | null) => { setTabs?.(promote ? el : null); }, [setTabs, promote]);
  return (
    <div className="cx-head">
      <div className={`cx-title ${col.neutral ? 'neutral' : ''}`} style={{ background: col.bg, color: col.fg }}>
        <TitleMenu clubId={hub?.club ? hub.club(g, route) : undefined} />
        {logoClub ? <span className="cx-title-logo"><Crest id={logoClub} size={44} /></span> : null}
        <h2>{text}</h2>
        {action && <div className="cx-action">{action}</div>}
      </div>
      {tabs.length ? <ButtonRow items={tabs} className="cx-tabrow" /> : <div className="cx-tabslot" ref={slotRef} />}
      {children && <div className="cx-tools">{children}</div>}
      <ClassicSub items={sub} />
    </div>
  );
}


// ---------- datofeltet i venstre-kolonnen ----------

/** "Lørdag" / "15.8.01" */
export function classicDate(iso: string): [string, string] {
  const d = new Date(`${iso}T12:00:00`);
  const day = d.toLocaleDateString(t('cl.locale'), { weekday: 'long' });
  return [day.charAt(0).toUpperCase() + day.slice(1), `${d.getDate()}.${d.getMonth() + 1}.${String(d.getFullYear()).slice(2)}`];
}

// ---------- rullemenu i klassisk stil (View, Sort By, Filter, Action …) ----------

export type DropItem =
  | { key: string; label: ReactNode; onClick: () => void; checked?: boolean; disabled?: boolean; title?: string; danger?: boolean }
  | { key: string; head: string }
  | { key: string; sep: true }
  /** undermenu (▸) – åbnes ved siden af, når man peger på den (som Competitions-menuen i CM 01/02) */
  | { key: string; label: ReactNode; sub: DropItem[] };

/** Knap med ▾ og en pop op-liste; lukker ved klik udenfor eller Escape */
export function CxDrop({ label, items, align = 'left', className = '', btn, caret = true, fixed = false }: {
  label: ReactNode; items: DropItem[]; align?: 'left' | 'right'; className?: string;
  /** ekstra egenskaber til knappen (fx draggable og drop-hændelser) */
  btn?: ButtonHTMLAttributes<HTMLButtonElement> & { 'data-pid'?: number };
  caret?: boolean;
  /** listen placeres fast på skærmen ud for knappen (når knappen sidder i en kolonne, der kan rulle) */
  fixed?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false);
  const [pos, setPos] = useState<CSSProperties | undefined>();
  // åbne undermenuer: nøgle og placering pr. niveau
  const [path, setPath] = useState<{ key: string; style: CSSProperties }[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const toggle = () => {
    // åbn opad, når knappen sidder langt nede på skærmen
    const r = ref.current?.getBoundingClientRect();
    setUp(!!r && r.bottom > window.innerHeight * 0.58);
    if (fixed && r) {
      const narrow = window.innerWidth < 760;
      setPos(narrow
        ? { position: 'fixed', top: r.bottom + 2, left: Math.max(4, Math.min(r.left, window.innerWidth - 220)) }
        : r.bottom > window.innerHeight * 0.58 ? { position: 'fixed', left: r.right + 4, bottom: window.innerHeight - r.bottom, top: 'auto' } : { position: 'fixed', left: r.right + 4, top: r.top });
    }
    setPath([]);
    setOpen(!open);
  };
  const openSub = (depth: number, key: string, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    const low = r.top > window.innerHeight * 0.55;
    const style: CSSProperties = { position: 'fixed', left: Math.min(r.right, window.innerWidth - 220), ...(low ? { bottom: window.innerHeight - r.bottom, top: 'auto' } : { top: r.top }) };
    setPath((p) => [...p.slice(0, depth), { key, style }]);
  };
  const list = (its: DropItem[], depth: number): ReactNode => its.map((it) => 'head' in it ? <div key={it.key} className="cx-menu-head">{it.head}</div>
    : 'sep' in it ? <div key={it.key} className="cx-drop-sep" />
    : 'sub' in it ? (
      <div key={it.key} className="cx-drop-subwrap">
        <button role="menuitem" aria-haspopup="menu" className={`cx-drop-subbtn ${path[depth]?.key === it.key ? 'on' : ''}`}
          onMouseEnter={(e) => openSub(depth, it.key, e.currentTarget)} onClick={(e) => openSub(depth, it.key, e.currentTarget)}>
          <span className="cx-drop-check" />{it.label}<span className="cx-drop-arrow">▸</span>
        </button>
        {path[depth]?.key === it.key && <div className="cx-drop-pop cx-drop-sub" role="menu" style={path[depth].style}>{list(it.sub, depth + 1)}</div>}
      </div>
    )
    : <button key={it.key} role="menuitemcheckbox" aria-checked={!!it.checked} className={`${it.checked ? 'on' : ''} ${it.danger ? 'danger' : ''}`} disabled={it.disabled} title={it.title}
        onMouseEnter={() => setPath((p) => p.slice(0, depth))}
        onClick={() => { setOpen(false); it.onClick(); }}><span className="cx-drop-check">{it.checked ? '✓' : ''}</span>{it.label}</button>);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [open]);
  return (
    <div className={`cx-drop ${className}`} ref={ref}>
      <button {...btn} className={`cx-drop-btn ${btn?.className ?? ''}`} aria-haspopup="menu" aria-expanded={open} onClick={toggle}>
        <span>{label}</span>{caret && <span className="cx-drop-caret">▾</span>}
      </button>
      {open && (
        <div className={`cx-drop-pop ${align} ${up && !fixed ? 'up' : ''}`} role="menu" style={fixed ? pos : undefined}>
          {list(items, 0)}
        </div>
      )}
    </div>
  );
}
