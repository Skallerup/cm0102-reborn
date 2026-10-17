// Fanstemning og bestyrelsesmøder. Fansenes humør (0-100) påvirker tilskuertallet og
// bestyrelsens tillid; det reagerer på resultater, billetpriser, stjernesalg og pressemøder.
import { daysBetween } from './dates';
import { fairTicketPrice } from './finance';
import { isHumanClub } from './humans';
import { addNews, gs } from './state';
import type { Club } from './types';

export const fanMood = (c: Club | undefined) => c?.fanMood ?? 60;

export function bumpFans(clubId: number, d: number, why?: string) {
  const g = gs();
  const c = g.clubs[clubId];
  if (!c || !isHumanClub(clubId)) return;
  c.fanMood = Math.max(0, Math.min(100, fanMood(c) + d));
  if (why) (c.fanEvents ??= []).push({ d: g.date, k: why, v: Math.round(d) });
  if (c.fanEvents && c.fanEvents.length > 12) c.fanEvents.splice(0, c.fanEvents.length - 12);
}

/** Tilskuerfaktor: glade fans fylder stadion, sure fans bliver hjemme (0,92-1,06) */
export function fanAttendance(c: Club): number {
  return isHumanClub(c.id) ? 0.92 + (fanMood(c) / 100) * 0.14 : 1;
}

/** Efter en kamp for en menneskestyret klub */
export function fansAfterMatch(clubId: number, scored: number, conceded: number, myStrength: number, oppStrength: number, derby: boolean) {
  const diff = scored - conceded;
  const favourite = myStrength - oppStrength;
  let d = diff > 0 ? 2.5 + (favourite < -8 ? 2 : 0) : diff === 0 ? (favourite > 8 ? -1.5 : 0.5) : -2.5 - (favourite > 8 ? 2 : 0);
  if (diff <= -3) d -= 2;
  if (diff >= 3) d += 1;
  if (derby) d *= 1.8;
  bumpFans(clubId, d, diff > 0 ? (derby ? 'derbyWin' : 'win') : diff < 0 ? (derby ? 'derbyLoss' : diff <= -3 ? 'thrashed' : 'loss') : 'draw');
}

/** Månedligt: billetpriser og langsom tilbagevenden mod normalen */
export function fansMonthly() {
  const g = gs();
  for (const c of Object.values(g.clubs)) {
    if (!isHumanClub(c.id)) continue;
    const ratio = c.ticketPrice / fairTicketPrice(c.rep, c.league);
    if (ratio > 1.25) bumpFans(c.id, -2.5, 'tickets');
    else if (ratio < 0.9) bumpFans(c.id, 1, 'cheapTickets');
    c.fanMood = fanMood(c) + (60 - fanMood(c)) * 0.06;
  }
}

/** Bestyrelsesmøde hvert kvartal (sep, dec, mar) – teksten skrives af AI når man åbner beskeden */
export function boardMeeting() {
  const g = gs();
  const club = g.clubs[g.userClub];
  if (!club) return;
  const m = Number(g.date.slice(5, 7));
  if (![9, 12, 3].includes(m)) return;
  const comp = g.comps[club.league];
  const row = comp?.table.slice().sort((a, b) => b.pts - a.pts || b.gf - b.ga - (a.gf - a.ga)).findIndex((r) => r.club === club.id);
  addNews({ cat: 'board', key: 'board.meeting', params: { conf: Math.round(g.board.confidence), pos: row !== undefined && row >= 0 ? row + 1 : '-', expected: g.board.expectedPos, fans: Math.round(fanMood(club)), balance: Math.round(club.balance) } });
}

/** Hvor længe siden fans sidst reagerede på noget bestemt (til fanforum) */
export function recentFanEvents(c: Club, days = 45) {
  const g = gs();
  return (c.fanEvents ?? []).filter((e) => daysBetween(e.d, g.date) <= days);
}
