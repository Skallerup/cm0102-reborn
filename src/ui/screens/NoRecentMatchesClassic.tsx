// Last Match uden spillede kampe (CM 01/02): "No Recent Matches" og en bred Ok-knap i foden (Shell)
import { t } from '../../i18n';
import { ClassicHead } from '../classic';
import { useGame } from '../core';

export function NoRecentMatchesClassic({ club, res }: { club?: number; res?: boolean } = {}) {
  const g = useGame()!;
  // res: reserveholdets Last Match (0x4671e0 → 0x467a13 "No recent reserve matches have been played.")
  const name = g.clubs[club ?? g.userClub]?.name ?? '';
  return (
    <div className="cx-norecent">
      <ClassicHead title={res ? t('cl.res.full', { club: name }) : name} menu={false} />
      <div className="cx-subtitle cx-orig-band">{t('cl.noRecent.title')}</div>
      <div className="cx-norecent-body">{t(res ? 'cl.res.noRecent' : 'cl.noRecent.text')}</div>
    </div>
  );
}
