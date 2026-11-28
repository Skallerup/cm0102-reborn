// Recall From Loan / Terminate Loan Deal (CM 01/02: dialogen 0x8fbcc0 og "Yes" 0x8fc0e0) – fælles for det klassiske og det moderne tema
import type { Player } from '../game/types';
import { gs } from '../game/state';
import { act as dispatch } from '../game/actions';
import { recallRule } from '../game/transfers';
import { t } from '../i18n';
import { askConfirm, askNotice } from './confirm';

/** 0x8d0530 nej → "Cannot recall …" (0xaa15a0) / "Cannot terminate …'s loan" (0xaa15d4) med beskeden; ellers spørgsmålet ("Recall … from loan
 *  at …?" 0xaa1610 / "Terminate …'s loan contract at …?" 0xaa166c – klubben er lejeklubben) og, ved ja, boksen "… recalled from loan" /
 *  "…'s loan terminated" med "… will return to <moderklubben> tomorrow." (0xaa1744) */
export async function askEndLoan(p: Player, terminate: boolean): Promise<boolean> {
  const g = gs();
  const player = `${p.first} ${p.last}`.trim();
  const parent = p.loan ? g.clubs[p.loan.from]?.name ?? '' : '';
  const r = recallRule(p.id);
  if (!r.ok) { await askNotice(r.msg ? t(r.msg.key, r.msg.params) : '', { head: t(terminate ? 'cl.loanr.terminateHead' : 'cl.loanr.recallHead', { player }) }); return false; }
  const club = g.clubs[p.club]?.name ?? '';
  if (!(await askConfirm(t(terminate ? 'loan.terminateQ' : 'loan.recallQ', { player, club }), { head: t(terminate ? 'loan.terminateQHead' : 'loan.recallQHead', { player }) }))) return false;
  const res = dispatch<string>({ t: terminate ? 'terminateLoan' : 'recallLoan', pid: p.id });
  if (res !== 'loan.recalled' && res !== 'loan.terminated') return false;
  await askNotice(t('loan.returnTomorrow', { player, club: parent }), { head: t(res, { player }) });
  return true;
}
