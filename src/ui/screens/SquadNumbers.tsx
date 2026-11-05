// Squad Numbers (som i CM 01/02): hver spiller har et fast trøjenummer i klubben. Vælg et nyt nummer – har en
// holdkammerat det i forvejen, bytter de to numre.
import { act } from '../../game/actions';
import type { Player } from '../../game/types';
import { t } from '../../i18n';
import { PlayerLink, posStr } from '../components';

export function SquadNumbers({ players, classic = false }: { players: Player[]; classic?: boolean }) {
  const byNum = new Map(players.filter((p) => p.number).map((p) => [p.number!, p]));
  const list = players.slice().sort((a, b) => (a.number ?? 100) - (b.number ?? 100) || a.last.localeCompare(b.last));
  return (
    <div className={classic ? 'cx-numbers' : 'panel squad-numbers'}>
      <p className={classic ? 'cx-numbers-hint' : 'muted'}>{t('sqn.hint')}</p>
      <table className={classic ? 'cx-table' : 'table'}>
        <thead><tr><th className="num">#</th><th>{t('col.pos')}</th><th>{t('col.name')}</th><th>{t('sqn.change')}</th></tr></thead>
        <tbody>
          {list.map((p) => (
            <tr key={p.id}>
              <td className="num"><b className="sqn-num">{p.number ?? '–'}</b></td>
              <td>{posStr(p)}</td>
              <td><PlayerLink p={p} /></td>
              <td>
                <select aria-label={t('sqn.change')} value={p.number ?? ''} onChange={(e) => act({ t: 'squadNumber', pid: p.id, n: Number(e.target.value) })}>
                  {Array.from({ length: 99 }, (_, i) => i + 1).map((n) => {
                    const o = byNum.get(n);
                    return <option key={n} value={n}>{n}{o && o.id !== p.id ? ` – ${o.last} (${t('sqn.swap')})` : ''}</option>;
                  })}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
