// CM 01/02: klubbens Transfers-skærm, visningerne Staff In / Staff Out (club_screens.cpp 0x4542f0) – historikposter for ikke-spillere (type 5).
// Vi gemmer de seneste skift pr. stabsperson (Staff.moves); managerskift (cmBoardGame.ts) bogføres ikke endnu.
import type { Staff } from './types';
import { gs } from './state';

/** Bogfør et stabsskifte (kaldes før s.club ændres). fee = kompensation/frikøb i spillets valuta */
export function recordStaffMove(s: Staff, to: number, fee = 0): void {
  const g = gs();
  if (s.club === to) return;
  (s.moves ??= []).push({ season: g.season, date: g.date, from: s.club, to, fee });
  if (s.moves.length > 10) s.moves.shift();
}
