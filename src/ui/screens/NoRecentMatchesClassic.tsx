// Last Match uden spillede kampe (CM 01/02): "No Recent Matches" og en bred Ok-knap i foden (Shell)
import { t } from '../../i18n';
import { ClassicHead } from '../classic';
import { useGame } from '../core';

export function NoRecentMatchesClassic({ club }: { club?: number } = {}) {
  const g = useGame()!;
  return (
    <div className="cx-norecent">
      <ClassicHead title={g.clubs[club ?? g.userClub]?.name ?? ''} menu={false} />
      <div className="cx-subtitle cx-orig-band">{t('cl.noRecent.title')}</div>
      <div className="cx-norecent-body">{t('cl.noRecent.text')}</div>
    </div>
  );
}
