// Landskampens resultat som klikbart link til kampskærmen (rute `intlday`, samme kampskærm som en ligakamp) – bruges af alle landskampslister
import type { IntlResult, IntlTournament } from '../../game/international';
import { intlMatchKey } from '../../game/international';
import { gs } from '../../game/state';
import { useNav } from '../core';

export function IntlScore({ r, sep = ' - ' }: { r: IntlResult; sep?: string }) {
  const { nav } = useNav();
  return <span className="cx-link link" role="link" data-testid="intl-score" onClick={(e) => { e.stopPropagation(); nav({ name: 'intlday', id: intlMatchKey(r) }); }}>{r.hg}{sep}{r.ag}</span>;
}

/** slutrundens knockout-kamp (IntlTie): resultatet åbner landskampen, når den findes blandt resultaterne */
export function IntlKoScore({ tour, k, text }: { tour: IntlTournament; k: { a: number; b: number; stage: string }; text: string }) {
  const r = (gs().intl?.results ?? []).find((x) => x.kind === tour.name && x.stage === k.stage && x.date.startsWith(String(tour.year)) && ((x.home === k.a && x.away === k.b) || (x.home === k.b && x.away === k.a)));
  const { nav } = useNav();
  if (!r) return <>{text}</>;
  return <span className="cx-link link" role="link" data-testid="intl-score" onClick={(e) => { e.stopPropagation(); nav({ name: 'intlday', id: intlMatchKey(r) }); }}>{text}</span>;
}
