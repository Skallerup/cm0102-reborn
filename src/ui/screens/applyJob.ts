// CM 01/02 "Apply for Job" (klubskærmens knap 0x482a40, kode 0x65) → dialogen 0x6b19d0: "Please Confirm" / "Apply for the {klub} job ?"
// med No (1) og Yes (2); Yes = MANAGER_MANAGER::apply_for_job 0x69ca00 (svaret 0x1773 "… acknowledge/dismiss your job application" samme dag).
import type { GameState } from '../../game/types';
import { act } from '../../game/actions';
import { canApplyForJob } from '../../game/board';
import { natOfClub } from '../../game/cmVirtual';
import { t } from '../../i18n';
import { askConfirm } from '../confirm';

export { canApplyForJob };

/** klubbens fulde navn (club +4) – landsholdet: landets navn */
function jobName(g: GameState, cid: number): string {
  const n = natOfClub(cid);
  return n !== null ? g.nations[n]?.name ?? '' : g.clubs[cid]?.name ?? '';
}

export async function applyJobAsk(g: GameState, cid: number): Promise<void> {
  if (await askConfirm(t('cl.cl.applyQ', { club: jobName(g, cid) }), { head: t('cl.mt.confirm') })) act({ t: 'applyJob', club: cid });
}
