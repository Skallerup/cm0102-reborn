// Kampens/rundens navn som originalen: 0x4bfa30(turnering, etape = fixture +0x32, runde = fixture +0x30, form, buf, n) med 0x4b4850(id) for
// etapen og runden (data/cmRoundNames.ts – exe'ens tabel). Ingen importer fra motoren: bruges både af spillet og af nyhedsvisningen.
import { CM_COMP_SHORT, CM_ROUND_NAMES } from './data/cmRoundNames';

/** 0x4b4850(buf, 100, id, 0): etapens/rundens navn ('' for id'er uden navn) */
export const cmRoundText = (id: number): string => CM_ROUND_NAMES[id] ?? '';

/** turneringens korte navn (club_comp.dat +0x38) ud fra det lange (+4); turneringer uden kort navn i club_comp.dat: det lange */
export const cmCompShort = (long: string): string => CM_COMP_SHORT[long] ?? long;

/** 0x4bfa30 – form 1: det lange turneringsnavn (+4), form 2 (og 3): det korte (+0x38); `label` oversætter turneringsnavnet til visningen.
 *  "German Regional" med etapen 0x453/0x456 (North/South) → turneringerne [0x9cf55c]/[0x9cf560] (0x60efd0: "German Regional Division
 *  North"/"South") uden etape. Med turnering: etape og runde ≠ 0 → "{turnering} {etape} {runde}", kun etape → "{turnering} {etape}", kun
 *  runde → "{turnering} {runde}", ellers turneringens navn; uden turnering: "{etape} {runde}" / etapen / runden. (Sproget 8, [0x9eb2dc],
 *  har sin egen rækkefølge – spillet kører på engelsk = 0.) */
export function cmFixtureName(comp: string | undefined, stage: number, round: number, form: 1 | 2, label: (s: string) => string = (s) => s): string {
  if (comp === 'German Regional' && (stage === 0x453 || stage === 0x456)) {
    comp = stage === 0x453 ? 'German Regional Division North' : 'German Regional Division South';
    stage = 0;
  }
  const st = cmRoundText(stage), rd = cmRoundText(round);
  if (comp === undefined) return stage && round ? `${st} ${rd}` : stage ? st : round ? rd : '';
  const name = label(form === 1 ? comp : cmCompShort(comp));
  if (stage && round) return `${name} ${st} ${rd}`;
  if (stage) return `${name} ${st}`;
  if (round) return `${name} ${rd}`;
  return name;
}

/** 0x77c087/0x77c0ca: nyhedsteksterne skriver "Friendly"/"Reserve" med lille forbogstav (strcmp på hele navnet) */
export const cmFixtureNameInText = (s: string): string => (s === 'Friendly' ? 'friendly' : s === 'Reserve' ? 'reserve' : s);
