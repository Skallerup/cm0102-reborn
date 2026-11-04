// Rettelser af klubnavne i CM-databaserne: October 2026-opdateringen staver danske klubber med svenske/
// engelske bogstaver ("Bröndby IF", "FC Nordsjaelland") og bruger det engelske "FC Copenhagen".
// Bruges både når databasen bygges og når et gemt spil indlæses.

/** Forkert navn → [rigtigt navn, rigtigt kort navn (udeladt = uændret)] */
export const CLUB_NAME_FIXES: Record<string, [string, string?]> = {
  'FC Copenhagen': ['FC København', 'FC København'],
  'Bröndby IF': ['Brøndby IF'],
  'FC Nordsjaelland': ['FC Nordsjælland'],
  'SönderjyskE Fodbold': ['SønderjyskE Fodbold'],
  'HB Köge': ['HB Køge'],
  'Hilleröd Fodbold': ['Hillerød Fodbold'],
  'Naestved Boldklub': ['Næstved Boldklub'],
};

/** Ret navnet på en klub (navn + kort navn) – returnerer true hvis noget blev ændret */
export function fixClubName(c: { name: string; short: string }): boolean {
  const fix = CLUB_NAME_FIXES[c.name];
  if (!fix) return false;
  if (fix[1]) c.short = fix[1];
  c.name = fix[0];
  return true;
}
