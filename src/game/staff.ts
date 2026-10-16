// Staff: ansæt, fyr og køb fri fra andre klubber
import { addNews, gs } from './state';
import type { Staff, StaffRole } from './types';

export const STAFF_LIMITS: Record<StaffRole, number> = { manager: 0, assistant: 1, coach: 7, physio: 3, scout: 6 };

export function staffCount(role: StaffRole): number {
  const g = gs();
  return Object.values(g.staff).filter((s) => s.club === g.userClub && s.role === role).length;
}

/** Kompensation for at købe en ansat fri: ca. et halvt års løn, mere for gode folk */
export function poachFee(s: Staff): number {
  return Math.round((s.wage * 26 * (1 + s.rep / 100)) / 1000) * 1000;
}

export type HireResult = 'ok' | 'limit' | 'refused' | 'money';

/** Vil den ansatte skifte? Folk forlader sjældent en klub med højere omdømme */
export function willJoin(s: Staff): boolean {
  const g = gs();
  const mine = g.clubs[g.userClub];
  const theirs = g.clubs[s.club];
  if (!mine) return false;
  if (!theirs) return true;
  return theirs.rep <= mine.rep + 5;
}

export function hireStaff(id: number): HireResult {
  const g = gs();
  const s = g.staff[id];
  const club = g.clubs[g.userClub];
  if (!s || !club || s.club === club.id) return 'refused';
  if (staffCount(s.role) >= STAFF_LIMITS[s.role]) return 'limit';
  const poached = s.club > 0;
  if (poached) {
    if (!willJoin(s)) return 'refused';
    const fee = poachFee(s);
    if (club.balance < fee) return 'money';
    club.balance -= fee;
    club.finance.other += fee;
    const old = g.clubs[s.club];
    if (old) { old.balance += fee; old.finance.other -= fee; }
    addNews({ cat: 'general', key: 'staff.poached', params: { name: `${s.first} ${s.last}`, club: old?.name ?? '', fee } });
  } else {
    addNews({ cat: 'general', key: 'staff.hired', params: { name: `${s.first} ${s.last}`, role: s.role } });
  }
  s.club = club.id;
  s.assignment = null;
  s.wage = Math.round(s.wage * (poached ? 1.1 : 1));
  s.expires = `${Number(g.date.slice(0, 4)) + 2}-06-30`;
  return 'ok';
}

/** Fyr: kompensation = 12 ugers løn */
export function fireStaff(id: number): number {
  const g = gs();
  const s = g.staff[id];
  const club = g.clubs[g.userClub];
  if (!s || !club || s.club !== club.id) return 0;
  const pay = s.wage * 12;
  club.balance -= pay;
  club.finance.other += pay;
  s.club = 0;
  s.assignment = null;
  return pay;
}
