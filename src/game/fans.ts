// Fanstemning og bestyrelsesmøder. Fansenes humør (0-100) påvirker tilskuertallet og
// bestyrelsens tillid; det reagerer på resultater, billetpriser, stjernesalg og pressemøder.
import { ageOn, daysBetween } from './dates';
import { fairTicketPrice } from './finance';
import { asOwner, isHumanClub } from './humans';
import { addNews, gs, squad } from './state';
import type { Club, Player } from './types';

export const fanMood = (c: Club | undefined) => c?.fanMood ?? 60;

export function bumpFans(clubId: number, d: number, why?: string) {
  const g = gs();
  const c = g.clubs[clubId];
  if (!c || !isHumanClub(clubId)) return;
  c.fanMood = Math.max(0, Math.min(100, fanMood(c) + d));
  if (why) (c.fanEvents ??= []).push({ d: g.date, k: why, v: Math.round(d) });
  if (c.fanEvents && c.fanEvents.length > 12) c.fanEvents.splice(0, c.fanEvents.length - 12);
}

/**
 * Hvor stort et navn er en ny spiller for klubben? 0 = ingen særlig, 1 = god forstærkning, 2 = stjernekøb, 3 = sensation.
 * Kaldes efter at spilleren er skiftet til klubben.
 */
export function signingHype(p: Player, club: Club): 0 | 1 | 2 | 3 {
  const gap = p.rep - club.rep;
  const rank = squad(club.id).filter((x) => x.id !== p.id && x.ca > p.ca).length + 1; // nr. i truppen efter evne
  // et kendt navn tæller kun, hvis han også bliver en af de bedste i truppen
  let h: 0 | 1 | 2 | 3 = rank <= 2 && gap >= 20 ? 3 : (rank <= 3 && gap >= 8) || (rank <= 5 && gap >= 15) ? 2 : rank <= 6 && gap >= -3 ? 1 : 0;
  // veteraner på vej ned begejstrer mindre
  if (h > 0 && ageOn(p.dob, gs().date) >= 33) h = (h - 1) as 0 | 1 | 2;
  return h;
}

const HYPE_FANS = [0, 2.5, 6, 10];
const HYPE_BOARD = [0, 0.5, 2.5, 5];

/** Fans og bestyrelse reagerer på et nyt køb til en menneskestyret klub */
export function fansOnSigning(p: Player, club: Club, loan: boolean) {
  if (!isHumanClub(club.id)) return;
  let hype: number = signingHype(p, club);
  if (loan) hype = Math.max(0, hype - 1); // et lejemål er ikke helt det samme
  if (!hype) return;
  bumpFans(club.id, HYPE_FANS[hype], hype >= 2 ? 'starSigned' : 'goodSigning');
  asOwner(club.id, () => {
    const g = gs();
    g.board.confidence = Math.min(100, g.board.confidence + HYPE_BOARD[hype]);
    if (hype >= 2) addNews({ cat: 'general', key: `fans.signing${hype}`, params: { player: `${p.first} ${p.last}`.trim(), club: club.name }, link: { kind: 'player', id: p.id } });
  });
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
