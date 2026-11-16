// CM 01/02's rygtenyhed 0xfbc – teksten 0x755860 (overskrift 0x756e51–0x756fb0, brødtekst 0x755ab0–0x756b01) bygget af nyhedens pladser
// (game/cmRumours.ts). Varianterne (plads 5): 0 "linked with" (0x756669), 1 "Newspaper reports" (0x75623f), 2 agenten (0x755ba6),
// 0x24 "has revealed" (0x755f08). Rivalerne (klubberne efter den første) står i et afsnit efter, og svaret (plads 7) til sidst (0x75694b):
// modtageren er klubbens manager → "You have …", ellers "<klub> manager <navn> confirmed/denied …" (No Comment kun for manageren selv).
import type { NewsItem } from '../game/types';
import { gs } from '../game/state';
import { money, natName, t } from '../i18n';

const clubName = (id: number) => gs().clubs[id]?.name ?? '';
const clubShort = (id: number) => gs().clubs[id]?.short ?? '';

function parts(n: NewsItem) {
  const p = n.params;
  const clubs = String(p.clubs ?? '').split('|').map(Number).filter((x) => x > 0);
  return { p, clubs, cur: Number(p.cur) || 0, v: Number(p.v) || 0, amt: Number(p.amt) || 0, player: String(p.player ?? '') };
}

/** overskriften (0x756e51) */
export function cmRumTitle(n: NewsItem): string {
  const { p, clubs, player } = parts(n);
  const h = String(p.h ?? 'rumour');
  return t(`cm.rum.h.${h}`, { player, club: clubShort(clubs[0] ?? 0) });
}

/** brødteksten */
export function cmRumBody(n: NewsItem): string {
  const g = gs();
  const { p, clubs, cur, v, amt, player } = parts(n);
  if (!clubs.length) return '';
  const club = clubName(clubs[0]), from = cur ? clubName(cur) : '';
  const fee = money(amt);
  const local = !!p.local, mn = Number(p.mn ?? -1);
  const nation = mn >= 0 ? natName(g.nations[mn]?.name) : '';
  const nationality = mn >= 0 ? g.nations[mn]?.adj ?? nation : '';
  const ptype = t(`role.${String(p.ptype ?? 'CM')}`).toLowerCase();
  const rv = clubs.slice(1).map(clubName);
  const [a, b, c, d] = rv;
  const k = rv.length;
  const out: string[] = [];
  const base = { player, club, from, fee, nation, nationality, ptype, a, b, c, d };
  if (v === 1) {
    // 0x75623f: beløb → "in a … deal" (lokal) / "The Danish media"; ingen klub → "… signing <player>"; intet beløb → "on a free transfer"
    if (!cur) out.push(t(local ? 'cm.rum.n.none' : 'cm.rum.n.noneIn', base));
    else if (amt) out.push(t(local ? 'cm.rum.n.fee' : 'cm.rum.n.feeMedia', base));
    else out.push(t(local ? 'cm.rum.n.free' : 'cm.rum.n.freeIn', base));
    if (k) out.push(t(`cm.rum.n.r${Math.min(k, 4)}`, base));
  } else if (v === 0) {
    out.push(t(!cur ? 'cm.rum.l.none' : amt ? 'cm.rum.l.fee' : 'cm.rum.l.free', base));
    if (k) out.push(t(`cm.rum.l.r${Math.min(k, 4)}`, base));
  } else if (v === 0x24) {
    out.push(t(!cur ? 'cm.rum.r.none' : amt ? 'cm.rum.r.fee' : 'cm.rum.r.free', base));
    if (k) out.push(t(`cm.rum.r.r${Math.min(k, 4)}`, base));
  } else {
    out.push(t(!cur ? 'cm.rum.a.none' : amt ? 'cm.rum.a.fee' : 'cm.rum.a.free', base));
    if (k === 1) out.push(t(local ? 'cm.rum.a.r1' : 'cm.rum.a.r1n', { ...base, an: /^[AEIOU]/i.test(nationality) ? 'an' : 'a' }));
    else if (k) out.push(t(`cm.rum.a.r${Math.min(k, 4)}`, base));
  }
  // svaret (plads 7)
  const ans = Number(p.ans) || 0;
  if (ans && cur) {
    if (p.own) {
      if (ans === 3) out.push(t('cm.rum.y.noComment'));
      else if (ans === 2) out.push(t(p.listed ? 'cm.rum.y.confirm' : amt ? 'cm.rum.y.confirmFee' : 'cm.rum.y.confirmFree', base));
      else out.push(t(p.listed ? 'cm.rum.y.denyMore' : 'cm.rum.y.deny', base));
    } else if (ans === 1 || ans === 2) {
      const m = g.clubs[cur]?.manager;
      const s = m !== undefined && m >= 0 ? g.staff[m] : undefined;
      if (s) out.push(t(ans === 2 ? 'cm.rum.o.confirm' : 'cm.rum.o.deny', { ...base, club: clubShort(cur), manager: `${s.first} ${s.last}`.trim() }));
    }
  }
  return out.join('\n\n');
}
