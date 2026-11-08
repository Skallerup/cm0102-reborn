// "Send mit spil til udvikleren": en kopi af den åbne karriere uploades (frivilligt, også uden konto), så udvikleren kan
// åbne den i admin-preview og se præcis det, spilleren ser. Det gemte spil ændres ikke.
import { useState } from 'react';
import { t } from '../i18n';
import { getAccount, sendGameToDeveloper } from '../online/account';
import { rankingAvailable } from '../online/rank';
import { gs, hasGame, previewInfo } from '../game/state';

export function SendToDev({ compact }: { compact?: boolean }) {
  const [open, setOpen] = useState(!compact);
  const [note, setNote] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error' | 'limit'>('idle');
  // kun på det rigtige site, med et singleplayer-spil åbent (fællesspil ligger allerede på serveren)
  if (!rankingAvailable() || !hasGame() || gs().humans?.length || previewInfo()) return null;
  if (state === 'sent') return <div className="good">{t('sendDev.sent')}</div>;
  if (!open) return <button className="small" onClick={() => setOpen(true)}>📨 {t('sendDev.send')}</button>;
  const send = async () => {
    setState('sending');
    try { await sendGameToDeveloper(note.trim(), email.trim() || undefined); setState('sent'); }
    catch (e) { setState(/limit/.test(String((e as Error).message)) ? 'limit' : 'error'); }
  };
  return (
    <div className="col send-dev">
      <div className="muted">{t('sendDev.hint')}</div>
      <textarea rows={3} maxLength={1000} value={note} placeholder={t('sendDev.notePh')} onChange={(e) => setNote(e.target.value)} />
      {!getAccount() && <input type="email" maxLength={200} value={email} placeholder={t('sendDev.emailPh')} onChange={(e) => setEmail(e.target.value)} />}
      <button className="primary" disabled={state === 'sending'} onClick={() => void send()}>{state === 'sending' ? t('sendDev.sending') : `📨 ${t('sendDev.send')}`}</button>
      {state === 'error' && <div className="bad">{t('sendDev.error')}</div>}
      {state === 'limit' && <div className="bad">{t('sendDev.limit')}</div>}
    </div>
  );
}
