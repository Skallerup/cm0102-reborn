import { useState } from 'react';
import { askConfirm } from './confirm';
import { t } from '../i18n';
import { activePlayers, session } from '../online/client';
import { Panel } from './components';
import { gs, hasGame } from '../game/state';

/**
 * Multiplayer-sektionen i Game Options (Alle indstillinger): invitationskode og -link, spillerne med status og værtens kontrolpanel
 * (fjern spillere, tving trækket igennem). Her og kun her ligger fællesspillets punkter – ikke i rullemenuen eller topbjælken.
 */
export function MultiplayerPanel() {
  const s = session();
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  if (!s?.room) return null;
  const room = s.room;
  const link = `${location.origin}${location.pathname}?room=${s.creds.code}`;
  const clubs = hasGame() ? gs().clubs : {};
  // kun managere i spillet kan mangle at trykke Klar (nye spillere kommer med ved næste træk)
  const notReady = activePlayers(room).filter((p) => !p.ready);
  const host = s.isHost && room.players.length > 1;
  const run = async (f: () => Promise<void>) => { setBusy(true); setErr(''); try { await f(); } catch (e) { setErr(String((e as Error).message)); } setBusy(false); };
  return (
    <Panel title={t('mp.title')}>
      <div className="col" data-testid="mp-section">
        {!room.draft && <>
          <div className="muted">{t('mp.inviteText')}</div>
          <div className="invite-code" data-testid="mp-code">{s.creds.code}</div>
          <input readOnly value={link} onFocus={(e) => e.target.select()} style={{ width: '100%' }} />
          <div className="row">
            {'share' in navigator && <button onClick={() => { void navigator.share({ title: 'CM Reborn', text: t('mp.shareText', { code: s.creds.code }), url: link }).catch(() => {}); }}>{t('mp.share')}</button>}
            <button className="primary" onClick={async () => { try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { prompt(t('mp.inviteLink'), link); } }}>{copied ? t('mp.copied') : t('mp.copyLink')}</button>
          </div>
        </>}
        <h4 className="accent">{t('mp.players')}</h4>
        <table className="grid" data-testid="mp-players">
          <tbody>
            {room.players.map((p) => (
              <tr key={p.pid} className={p.pid === s.creds.pid ? 'me' : ''}>
                <td>{p.name}{p.pid === room.host ? ` (${t('mp.host')})` : ''}{p.online === false ? <span className="muted"> ({t('mp.offline')})</span> : null}</td>
                <td>{clubs[p.club]?.short ?? ''}</td>
                <td>{p.pending ? <span className="tag">{t('mp.pendingStatus')}</span> : p.ready ? <span className="tag good">{t('mp.isReady')}</span> : <span className="tag warn">{t('mp.notReadyYet')}</span>}</td>
                {host && <td>{p.pid !== room.host && <button className="small danger" disabled={busy} onClick={async () => { if (await askConfirm(t('mp.kickConfirm', { name: p.name }))) void run(() => s.kick(p.pid)); }}>{t('mp.kick')}</button>}</td>}
              </tr>
            ))}
          </tbody>
        </table>
        {host && <>
          <h4 className="accent">{t('mp.hostTitle')}</h4>
          <div className="muted">{t('mp.kickHint')}</div>
          <div className="row">
            <button className="primary" disabled={busy || notReady.length === 0} title={t('mp.forceHint')} onClick={async () => { if (await askConfirm(t('mp.forceConfirm', { names: notReady.map((p) => p.name).join(', ') }))) void run(() => s.forceContinue()); }}>{t('mp.force')}</button>
          </div>
        </>}
        {err && <div className="insight bad">{err}</div>}
      </div>
    </Panel>
  );
}
