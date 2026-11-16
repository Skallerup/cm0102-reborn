// CM 01/02's karantænenyhed (0x5576e0) og FA'ens svar (0x6ac190) som tekst – cmDiscipline.ts lægger felterne i nyheden.
import { t } from '../i18n';
import { gs } from '../game/state';
import { DEMONYM } from './demonyms';
import type { NewsItem } from '../game/types';

/** "X has been banned for 3 English matches starting on the 2nd September 2001, after being sent off in Man Utd's 2-1 win over Arsenal."
 *  + "You have appealed …", når nyhedens felt 0 er sat */
export function cmBanBody(n: NewsItem): string {
  const P = n.params;
  const m = Number(P.m), f = Number(P.f), why = Number(P.why), gf = Number(P.gf), ga = Number(P.ga);
  const en = t('cl.locale').startsWith('en');
  const nat = gs().nations[Number(P.scn)];
  const scope = P.scn === 'EUR' ? t('cmban.sc.eur') : en ? (nat?.adj ?? DEMONYM[nat?.name ?? ''] ?? nat?.name ?? '') : (nat?.name ?? '');
  let txt: string;
  if (m === -1) txt = t('cmban.b.assault', { player: String(P.player), d: Number(P.d), home: String(P.home), away: String(P.away) });
  else {
    const ext = (f & 1) !== 0;
    const head = t(ext ? (m === 1 ? 'cmban.p.f1' : 'cmban.p.fN') : m === 1 ? 'cmban.p.1' : 'cmban.p.N', { player: String(P.player), m, scope });
    const start = !ext && P.st ? t('cmban.p.start', { date: cmLongDate(String(P.st)) }) : '';
    const res = t(gf > ga ? 'cmban.res.w' : gf === ga ? 'cmban.res.d' : 'cmban.res.l');
    const match = { clubs: t('cmban.poss', { club: String(P.club) }), score: `${Math.max(gf, ga)}-${Math.min(gf, ga)}`, res, opp: String(P.opp), n: Number(P.n) };
    const reason = why === 2 ? 'cmban.r.red' : why === 3 ? 'cmban.r.mis' : why === 0 ? 'cmban.r.pts' : why === 4 ? 'cmban.r.ys' : Number(P.n) === 1 ? 'cmban.r.y1' : 'cmban.r.yN';
    txt = `${head}${start} ${t(reason, match)}`;
  }
  return P.appealed ? `${txt}\n\n${t('cmban.appealed')}` : txt;
}

/** "10th November 1998" (originalens datoform i nyhederne) */
export function cmLongDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z');
  const day = d.getUTCDate(), en = t('cl.locale').startsWith('en');
  let mon: string;
  try { mon = d.toLocaleDateString(t('cl.locale'), { month: 'long', timeZone: 'UTC' }); } catch { mon = String(d.getUTCMonth() + 1); }
  const ord = en ? `${day}${day % 100 >= 11 && day % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][day % 10] ?? 'th'}` : `${day}.`;
  return `${ord} ${mon} ${d.getUTCFullYear()}`;
}

/** FA'ens svar (0x6ac190): afvist / ophævet / nedsat med kampe eller dage – to afsnit */
export function cmBanAnswerKeys(n: NewsItem): [string, string] {
  const D = Number(n.params.D), rm = Number(n.params.resM), rd = Number(n.params.resD);
  if (D === 0) return ['cmban.fab.dismiss', 'cmban.fab.fair'];
  if (rm !== -1) return ['cmban.fab.valid', rm === 1 ? 'cmban.fab.game1' : 'cmban.fab.gameN'];
  if (rd !== -1) return rd === 1 ? ['cmban.fab.grudging', 'cmban.fab.day1'] : ['cmban.fab.harsh', 'cmban.fab.dayN'];
  return ['cmban.fab.valid', 'cmban.fab.revoked'];
}
export function cmBanAnswerBody(n: NewsItem): string {
  const p: Record<string, string | number> = { ...n.params };
  cmBanParams(n, p);
  return cmBanAnswerKeys(n).map((k) => t(k, p)).join('\n\n');
}

/** overskriftens og svarets felter: længden (0x7e5780), "Keane's" og forbundets nationalitetsord */
export function cmBanParams(n: NewsItem, p: Record<string, string | number>) {
  const d = Number(p.d), w = Math.trunc(d / 7), mo = Math.trunc((d - 15) / 30) + 1;
  if (n.key === 'cmban.hD') p.len = d < 14 ? t(d === 1 ? 'cmban.len.d1' : 'cmban.len.d', { n: d }) : d < 43 ? t(w === 1 ? 'cmban.len.w1' : 'cmban.len.w', { n: w }) : t(mo === 1 ? 'cmban.len.m1' : 'cmban.len.m', { n: mo });
  if (typeof p.last === 'string') p.players = t('cmban.poss', { club: p.last });
  if (typeof n.params.nat === 'number') { const nn = gs().nations[n.params.nat]; p.nat = nn?.adj ?? DEMONYM[nn?.name ?? ''] ?? nn?.name ?? ''; }
  if (typeof p.resM === 'number') p.games = p.resM;
  if (typeof p.resD === 'number') p.days2 = p.resD;
}
