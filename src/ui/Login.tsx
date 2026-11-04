import { useEffect, useState } from 'react';
import { getLang, t } from '../i18n';
import { loginEnabled, getAccount, logout, requestLogin, verifyLogin, type Account } from '../online/account';
import { cloudState, type CloudState } from '../online/cloudSync';
import { Modal } from './components';

/** Den aktuelle konto (opdateres ved login/logout i alle komponenter) */
export function useAccount(): Account | null {
  const [a, setA] = useState(getAccount);
  useEffect(() => {
    const on = () => setA(getAccount());
    window.addEventListener('cm-account', on);
    return () => window.removeEventListener('cm-account', on);
  }, []);
  return a;
}

export function useCloudState(): CloudState {
  const [s, setS] = useState(cloudState);
  useEffect(() => {
    const on = () => setS(cloudState());
    window.addEventListener('cm-cloud', on);
    return () => window.removeEventListener('cm-cloud', on);
  }, []);
  return s;
}

const errText = (e: unknown) => {
  const m = (e as Error)?.message;
  return t(['email', 'limit', 'mail', 'code', 'expired'].includes(m) ? `acc.err.${m}` : 'acc.err.other');
};

/** Login med e-mail: først sendes et link + en kode, derefter kan koden skrives her (fx i den installerede app) */
export function LoginModal({ onClose, onDone }: { onClose: () => void; onDone?: () => void }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const send = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try { await requestLogin(email.trim(), getLang()); setStep('code'); } catch (x) { setErr(errText(x)); }
    setBusy(false);
  };
  const verify = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try { await verifyLogin({ email: email.trim(), code }); onDone?.(); onClose(); } catch (x) { setErr(errText(x)); }
    setBusy(false);
  };
  return (
    <Modal title={t('acc.loginTitle')} onClose={onClose}>
      {step === 'email' ? (
        <form className="col acc-form" onSubmit={send}>
          <p className="muted" style={{ margin: 0 }}>{t('acc.intro')}</p>
          <input type="email" required autoFocus autoComplete="email" placeholder={t('acc.email')} value={email} onChange={(e) => setEmail(e.target.value)} />
          {err && <div className="insight bad">{err}</div>}
          <button className="primary" type="submit" disabled={busy || !email.includes('@')}>{busy ? t('acc.sending') : t('acc.send')}</button>
        </form>
      ) : (
        <form className="col acc-form" onSubmit={verify}>
          <p style={{ margin: 0 }}>{t('acc.sent', { email: email.trim() })}</p>
          <input className="acc-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} autoFocus placeholder="123456" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} />
          {err && <div className="insight bad">{err}</div>}
          <button className="primary" type="submit" disabled={busy || code.length !== 6}>{t('acc.verify')}</button>
          <button type="button" className="link-btn" onClick={() => { setStep('email'); setCode(''); setErr(''); }}>{t('acc.other')}</button>
        </form>
      )}
    </Modal>
  );
}

/** Lille konto-linje: "Log ind og gem i skyen" eller "Logget ind som … · Log ud" */
export function AccountBar() {
  const acct = useAccount();
  const [open, setOpen] = useState(false);
  const [on, setOn] = useState(false);
  useEffect(() => { void loginEnabled().then(setOn); }, []);
  if (!on && !acct) return null;
  return (
    <div className="acc-bar">
      {acct ? (
        <>
          <span>☁ {t('acc.loggedIn', { email: acct.email })}</span>
          <button className="link-btn" onClick={() => void logout()}>{t('acc.logout')}</button>
        </>
      ) : (
        <button className="acc-cta" onClick={() => setOpen(true)}>{t('acc.cta')}</button>
      )}
      {open && <LoginModal onClose={() => setOpen(false)} />}
    </div>
  );
}

/** Login via linket i mailen (?login=TOKEN): log ind og fjern token fra adresselinjen */
export function useLoginLink(onMessage: (msg: string) => void) {
  useEffect(() => {
    const token = new URLSearchParams(location.search).get('login');
    if (!token) return;
    const q = new URLSearchParams(location.search);
    q.delete('login');
    history.replaceState(null, '', `${location.pathname}${q.size ? `?${q}` : ''}`);
    verifyLogin({ token }).then(() => onMessage(t('acc.welcome')), (e) => onMessage(errText(e)));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** Status for seneste upload til skyen (vises ved "Gem spil") */
export function CloudStatus() {
  const acct = useAccount();
  const s = useCloudState();
  if (!acct || s === 'idle') return null;
  return <div className={s === 'error' ? 'bad' : 'muted'}>☁ {t(s === 'saving' ? 'acc.cloudSaving' : s === 'saved' ? 'acc.cloudSaved' : 'acc.cloudError')}</div>;
}
