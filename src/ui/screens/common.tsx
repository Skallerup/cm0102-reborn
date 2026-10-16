import type { ReactNode } from 'react';
import { has, t } from '../../i18n';
import { useNav } from '../core';
import type { NewsItem } from '../../game/types';
import { gs } from '../../game/state';

export function Head({ title, children }: { title: ReactNode; children?: ReactNode }) {
  const { back, canBack } = useNav();
  return (
    <div className="screen-head">
      {canBack && <button className="back small" onClick={back}>‹ {t('common.back')}</button>}
      <h2>{title}</h2>
      <div className="grow" />
      {children}
    </div>
  );
}

export function newsParams(n: NewsItem): Record<string, string | number> {
  const p: Record<string, string | number> = { ...n.params };
  if (typeof p.injury === 'string') p.injury = t(`injury.${p.injury}`);
  if (typeof p.lane === 'string') p.lane = t(`lane.${p.lane}`);
  if (p.kind === 'transfer' || p.kind === 'wage') p.kind = t(`board.kind.${p.kind}`);
  if (typeof p.id === 'string' && n.key.startsWith('challenge.')) p.id = t(`challenge.${p.id}.title`);
  return p;
}

export function newsTitle(n: NewsItem) {
  return t(n.key, newsParams(n));
}

export function newsBody(n: NewsItem) {
  const k = `${n.key}.body`;
  return has(k) ? t(k, newsParams(n)) : '';
}

export function useOpenLink() {
  const { nav } = useNav();
  return (n: NewsItem) => {
    const l = n.link;
    if (!l) return;
    if (l.kind === 'player') nav({ name: 'player', id: l.id });
    else if (l.kind === 'club') nav({ name: gs().jobOffers.includes(Number(l.id)) ? 'jobs' : 'club', id: l.id });
    else if (l.kind === 'fixture') nav(gs().reports[Number(l.id)] ? { name: 'report', id: l.id } : { name: 'fixtures' });
    else if (l.kind === 'offer') nav({ name: 'transfers', tab: 'offers' });
    else if (l.kind === 'comp') nav({ name: 'competitions', id: l.id });
  };
}
