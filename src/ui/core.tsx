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
      return [...s.slice(-30), r];
    }),
    back: () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
    canBack: stack.length > 1,
  }), [stack]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useNav() {
  return useContext(Ctx);
}
