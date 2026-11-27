// CM 01/02: "Team Selection" før menneskets kamp – match_screens_draw_team_selection 0x7260f0 og dens fragmenter 0x726570–0x727450 (cm0102.exe
// 3.9.68, læst 27/11-2026). For de 11 og de navngivne udskiftere (0x7261cf: plads < 11 + turneringens +0x4d & 0xf) samles spillerne pr. grund; den
// FØRSTE grund med spillere vises i en besked ("Team Selection", 0xa17b64), og kampen starter ikke (0x726678 → 0x727c02). Rækkefølgen:
//   1 landsholdet 0x7757d0              0xa17a4c/0xa17a9c (ikke porteret: vores landsholdsophold er ikke originalens dato – onIntlDuty)
//   2 udlejet (lejekontrakt, kontraktklubben er klubben)  0xa179c8/0xa17a10 (findes ikke: udlejede er ikke i menneskets trup)
//   3 ikke til rådighed: skadetype 0x4d–0x51 (0x62ed70)  0xa17970/0xa1799c
//   4 0x8cf5e0 ≠ 0 (cmEligibility.ts) – kun spillerne med SAMME kode som den første (0x726294)  0xa17358–0xa1793c
//   5 udelukket 0x55d270                 0xa17300/0xa17328
//   6 skadet 0x62c400                    0xa17278/0xa172b8
//   7 arbejdstilladelse 0x8c7560(…, 0) – ikke i reserve- og venskabskampe (0x7263ab/0x7263be)  0xa171d4/0xa17224
// Navnene: "<1> and <2>" (0xa17b40), "<liste>, <spiller>" (0xa17af4), sidste "<liste>, and <spiller>" (0xa17b18).
// CM Reborn: spillere i reserverne (Player.reserves) melder vi som "in-eligible" (kode 2, 0xa175e0) – samme plads som koderne.
import type { Fixture, GameState, Player } from './types';
import { cmIneligible } from './cmEligibility';
import { cmNeedsPermit, cmPermitOn } from './cmPermit';
import { euroRegistered } from './euroSquad';
import { cmLogic } from './cmPlayerData';
/** cmReserveMatches.ts RSV_COMP (reserveturneringen [0x9cf684]) */
const RSV_COMP = 'RSV';

export type SelKey = 'unav' | 'cup' | 'res' | 'unreg' | 'awol' | 'loanC' | 'loanM' | 'ban' | 'inj' | 'wp';
/** 0x8cf5e0's koder → beskedens nøgle (0x726b75–0x726d7f); 3–7 (prøvespiller, anden klub, fristerne) giver vores regler ikke */
const CODE_KEY: Record<number, SelKey> = { 1: 'cup', 2: 'res', 8: 'unreg', 9: 'awol', 0xa: 'loanC', 0xb: 'loanM' };

/** skadetype 0x4d–0x51 (0x62ed70): "currently unavailable for selection" */
const unavailable = (p: Player) => /^cm(7[7-9]|8[01])$/.test(p.injury?.key ?? '');

/** Den første grund til, at holdet ikke kan spille kampen, og spillerne med den (null = holdet er klar) */
export function teamSelectionProblem(g: GameState, club: number, f: Fixture | undefined, ids: number[]): { key: SelKey; ids: number[] } | null {
  const ps = ids.map((id) => g.players[id]).filter((p): p is Player => !!p && p.club === club);
  const groups = new Map<SelKey, number[]>();
  const add = (k: SelKey, p: Player) => { const a = groups.get(k); if (a) a.push(p.id); else groups.set(k, [p.id]); };
  let code = 0;
  const orig = cmLogic(g) && !!f;
  // uden originalens logik: kun den tilmeldte trup i europæiske kampe (European Squad)
  const reg = !orig && f && g.comps[f.comp]?.type === 'continental' ? euroRegistered(club) : null;
  const permit = orig && cmPermitOn(g) && !!g.comps[f!.comp] && f!.comp !== RSV_COMP;
  for (const p of ps) {
    if (unavailable(p)) add('unav', p);
    const c = orig ? cmIneligible(g, p, f!) : 0;
    if (c && CODE_KEY[c] && (!code || c === code)) { code = c; add(CODE_KEY[c], p); }
    else if (!c && p.reserves) add('res', p);
    else if (!c && reg && !reg.has(p.id)) add('unreg', p);
    if (p.banned > 0) add('ban', p);
    if (p.injury && !unavailable(p) && p.injury.key !== 'awol') add('inj', p);
    if (permit && cmNeedsPermit(g, p, club, false)) add('wp', p);
  }
  const order: SelKey[] = ['unav', code ? CODE_KEY[code] : 'res', 'res', 'unreg', 'ban', 'inj', 'wp'];
  for (const k of order) { const a = groups.get(k); if (a?.length) return { key: k, ids: a }; }
  return null;
}
