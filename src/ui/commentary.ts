import type { CommentaryLine } from '../game/types';
import { getLang, has, t } from '../i18n';
import { originalReport, originalText } from './matchTexts';

/** Oversæt en kommentarlinje. Der findes flere varianter pr. nøgle (c.goal.1, c.goal.2 ...). */
export function commentaryText(l: CommentaryLine, ctx: { home: string; away: string; score?: string; ref?: string }, idx: number): string {
  // engelsk og dansk: originalens egne linjer fra CM 01/02 (ui/matchTexts.ts), når der findes en passende
  const orig = originalText(l, { ...ctx, lang: getLang() }, idx);
  if (orig) return orig;
  const variants: string[] = [];
  for (let i = 1; i <= 6; i++) {
    const k = `c.${l.k}.${i}`;
    if (has(k)) variants.push(k);
    else break;
  }
  const key = variants.length ? variants[(idx * 7 + l.m) % variants.length] : `c.${l.k}`;
  return t(key, { a: l.a, b: l.b, home: ctx.home, away: ctx.away, score: ctx.score, team: l.t === 0 ? ctx.home : l.t === 1 ? ctx.away : '' });
}

/** Kampreferatet efter slutfløjt (klassisk Match Report): originalens rapportlinjer i datid, ellers kommentaren */
export function reportLines(l: CommentaryLine, ctx: { home: string; away: string; score?: string; ref?: string }, idx: number): string[] {
  return originalReport(l, { ...ctx, lang: getLang() }, idx) ?? [commentaryText(l, ctx, idx)];
}
