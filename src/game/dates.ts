// Datoer gemmes som ISO-strenge 'YYYY-MM-DD' og regnes i UTC.

export function toDate(iso: string): Date {
  return new Date(iso + 'T00:00:00Z');
}

export function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(isoDate: string, n: number): string {
  const d = toDate(isoDate);
  d.setUTCDate(d.getUTCDate() + n);
  return iso(d);
}

export function daysBetween(a: string, b: string): number {
  return Math.round((toDate(b).getTime() - toDate(a).getTime()) / 86400000);
}

export function weekday(isoDate: string): number {
  return toDate(isoDate).getUTCDay(); // 0 = søndag
}

export function ymd(y: number, m: number, d: number): string {
  return iso(new Date(Date.UTC(y, m - 1, d)));
}

/** n'te ugedag (0=søn) i måned (1-12). n=-1 = sidste */
export function nthWeekday(y: number, m: number, wd: number, n: number): string {
  if (n > 0) {
    const first = new Date(Date.UTC(y, m - 1, 1));
    const offset = (wd - first.getUTCDay() + 7) % 7;
    return ymd(y, m, 1 + offset + (n - 1) * 7);
  }
  const last = new Date(Date.UTC(y, m, 0));
  const offset = (last.getUTCDay() - wd + 7) % 7;
  return ymd(y, m, last.getUTCDate() - offset);
}

export function ageOn(dob: string, date: string): number {
  // direkte på ISO-strengene (kaldes for alle spillere hver dag – Date-objekter er for dyre)
  const age = Number(date.slice(0, 4)) - Number(dob.slice(0, 4));
  return date.slice(5, 10) < dob.slice(5, 10) ? age - 1 : age;
}

export function month(isoDate: string): number {
  return Number(isoDate.slice(5, 7));
}

export function day(isoDate: string): number {
  return Number(isoDate.slice(8, 10));
}

export function year(isoDate: string): number {
  return Number(isoDate.slice(0, 4));
}

/** Sæson (startår) for en dato: juli-juni */
export function seasonOf(isoDate: string): number {
  const y = year(isoDate);
  return month(isoDate) >= 7 ? y : y - 1;
}
