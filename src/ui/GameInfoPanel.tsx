// "Om dette spil": database og udgave, spiltilstand, kampmotor, klub, dato og enhed (ui/gameInfo.ts) – samme oplysninger, som sendes med
// i fejlrapporter og forslag. Knappen kopierer dem, så de kan sættes ind i en besked.
import { useState } from 'react';
import { t } from '../i18n';
import { gameInfo, gameInfoMeta } from './gameInfo';

export function GameInfoTable({ route }: { route?: string }) {
  const rows = gameInfo(route);
  const [copied, setCopied] = useState(false);
  return (
    <div className="col game-info">
      <table className="kv" style={{ fontSize: 12.5, width: '100%' }}>
        <tbody>{rows.map((r) => <tr key={r.k}><td className="muted" style={{ paddingRight: 10, whiteSpace: 'nowrap', verticalAlign: 'top' }}>{r.k}</td><td style={{ wordBreak: 'break-word' }}>{r.v}</td></tr>)}</tbody>
      </table>
      <div className="row" style={{ justifyContent: 'flex-end' }}>
        <button className="small" onClick={() => { void navigator.clipboard?.writeText(gameInfoMeta(route).split(' | ').join('\n')); setCopied(true); }}>{copied ? t('rank.copied') : t('info.copy')}</button>
      </div>
    </div>
  );
}
