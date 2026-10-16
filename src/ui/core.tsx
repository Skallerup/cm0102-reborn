import { createContext, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react';
import { getVersion, gs, hasGame, subscribe } from '../game/state';
import type { GameState } from '../game/types';

/** Re-render når spiltilstanden ændres */
export function useGame(): GameState | null {
  useSyncExternalStore(subscribe, getVersion);
  return hasGame() ? gs() : null;
}

export type ScreenName =
  | 'inbox' | 'squad' | 'player' | 'tactics' | 'training' | 'fixtures' | 'competitions' | 'transfers' | 'scouting'
  | 'staff' | 'finance' | 'club' | 'assistant' | 'match' | 'report' | 'history' | 'jobs' | 'options' | 'benchmark' | 'compare';

export interface Route {
  name: ScreenName;
  id?: number | string;
  tab?: string;
  /** Skærmens egen tilstand (faneblade, filtre, sortering) – huskes når man går tilbage */
  state?: Record<string, unknown>;
  scroll?: number;
}

// Scroll-containeren registreres af Shell, så scroll-position kan gemmes pr. skærm
let scrollEl: HTMLElement | null = null;
export function setScrollElement(el: HTMLElement | null) {
  scrollEl = el;
}

interface NavCtx {
  route: Route;
  nav: (r: Route) => void;
  back: () => void;
  canBack: boolean;
}

const Ctx = createContext<NavCtx>({ route: { name: 'inbox' }, nav: () => {}, back: () => {}, canBack: false });

export function NavProvider({ children, initial }: { children: ReactNode; initial?: Route }) {
  const [stack, setStack] = useState<Route[]>([initial ?? { name: 'inbox' }]);
  const value = useMemo<NavCtx>(() => ({
    route: stack[stack.length - 1],
    nav: (r) => setStack((s) => {
      const top = s[s.length - 1];
      if (top.name === r.name && top.id === r.id && top.tab === r.tab) return s;
      top.scroll = scrollEl?.scrollTop ?? 0;
      return [...s.slice(-30), { ...r }];
    }),
    back: () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
    canBack: stack.length > 1,
  }), [stack]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useNav() {
  return useContext(Ctx);
}

/**
 * Som useState, men værdien gemmes på den aktuelle rute. Går man videre til en anden skærm og
 * tilbage igen, står faneblade, filtre og valg præcis som de var.
 */
export function useRouteState<T>(key: string, init: T | (() => T)): [T, (v: T) => void] {
  const { route } = useNav();
  const [, force] = useState(0);
  if (!route.state) route.state = {};
  if (!(key in route.state)) route.state[key] = typeof init === 'function' ? (init as () => T)() : init;
  const value = route.state[key] as T;
  const set = (v: T) => {
    route.state![key] = v;
    force((x) => x + 1);
  };
  return [value, set];
}
