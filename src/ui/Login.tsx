import { useEffect, useState } from 'react';
import { getLang, t } from '../i18n';
import { countPrompt, loginEnabled, getAccount, logout, newsStatus, requestLogin, setNews, verifyLogin, type Account } from '../online/account';
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
          <NewsToggle />
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

/** Opdateringsmails til/fra for den, der er logget ind */
function NewsToggle() {
  const [on, setOn] = useState<boolean | null>(null);
  useEffect(() => { void newsStatus().then(setOn); }, []);
  if (on === null) return null;
  return <label className="row acc-news"><input type="checkbox" checked={on} onChange={async (e) => { const v = e.target.checked; setOn(v); try { await setNews(v, getLang()); } catch { setOn(!v); } }} />{t('news.toggle')}</label>;
}

// ---------- spørgsmålet efter første sæson: konto (skygemte spil) og evt. opdateringsmails ----------

const PROMPT_KEY = 'cm0102.newsPrompt';
/** 'yes' | 'no' | 'later:<sæsoner>' – spørg igen efter næste sæson ved "Ikke nu" */
function promptState(): string { try { return localStorage.getItem(PROMPT_KEY) ?? ''; } catch { return 'no'; } }
function setPromptState(v: string) { try { localStorage.setItem(PROMPT_KEY, v); } catch { /* privat vindue */ } }

/** Skal spørgsmålet vises nu? (seasons = afsluttede sæsoner i karrieren) */
export function useNewsPrompt(seasons: number, online: boolean): [boolean, () => void] {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (online || seasons < 1) return;
    const st = promptState();
    if (st === 'yes' || st === 'no' || (st.startsWith('later:') && seasons <= Number(st.slice(6)))) return;
    let dead = false;
    void loginEnabled().then(async (on) => {
      if (!on || dead) return;
      // allerede logget ind og tilmeldt: intet at spørge om
      if (getAccount() && (await newsStatus())) { setPromptState('yes'); return; }
      if (!dead) { setShow(true); countPrompt('asked'); }
    });
    return () => { dead = true; };
  }, [seasons, online]);
  return [show, () => setShow(false)];
}

export function NewsPrompt({ seasons, onClose }: { seasons: number; onClose: () => void }) {
  const acct = useAccount();
  const [email, setEmail] = useState('');
  const [news, setNewsOn] = useState(false);
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'ask' | 'code' | 'done'>('ask');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const answer = (a: 'later' | 'no') => { setPromptState(a === 'no' ? 'no' : `later:${seasons}`); countPrompt(a); onClose(); };
  const finish = async () => {
    if (news) await setNews(true, getLang()).catch(() => {});
    setPromptState('yes'); countPrompt('yes'); setStep('done');
  };
  const yes = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setErr('');
    if (acct) { setBusy(true); await finish(); setBusy(false); return; }
    setBusy(true);
    try { await requestLogin(email.trim(), getLang()); setStep('code'); } catch (x) { setErr(errText(x)); }
    setBusy(false);
  };
  const verify = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try { await verifyLogin({ email: email.trim(), code }); await finish(); } catch (x) { setErr(errText(x)); }
    setBusy(false);
  };
  return (
    <Modal title={t(acct ? 'news.titleAcct' : 'news.title')} onClose={() => answer('later')}>
      {step === 'done' ? (
        <div className="col acc-form">
          <div className="insight good">{t(acct && !email ? 'news.doneNews' : 'news.done')}</div>
          <button className="primary" onClick={onClose}>{t('common.ok')}</button>
        </div>
      ) : step === 'ask' ? (
        <form className="col acc-form" onSubmit={yes}>
          <p style={{ margin: 0 }}>{t(acct ? 'news.introAcct' : 'news.intro')}</p>
          {!acct && <ul className="news-perks"><li>{t('news.perk1')}</li><li>{t('news.perk2')}</li><li>{t('news.perk3')}</li></ul>}
          {!acct && <input type="email" required autoComplete="email" placeholder={t('acc.email')} value={email} onChange={(e) => setEmail(e.target.value)} />}
          <label className="row news-consent"><input type="checkbox" checked={news} onChange={(e) => setNewsOn(e.target.checked)} /><span>{t('news.consent')}</span></label>
          {err && <div className="insight bad">{err}</div>}
          <button className="primary" type="submit" disabled={busy || (!acct && !email.includes('@')) || (!!acct && !news)}>{t('news.yes')}</button>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <button type="button" className="link-btn" onClick={() => answer('later')}>{t('news.later')}</button>
            <button type="button" className="link-btn" onClick={() => answer('no')}>{t('news.no')}</button>
          </div>
          <p className="muted small" style={{ margin: 0 }}>{t('news.privacy')}</p>
        </form>
      ) : (
        <form className="col acc-form" onSubmit={verify}>
          <p style={{ margin: 0 }}>{t('acc.sent', { email: email.trim() })}</p>
          <input className="acc-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} autoFocus placeholder="123456" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} />
          {err && <div className="insight bad">{err}</div>}
          <button className="primary" type="submit" disabled={busy || code.length !== 6}>{t('acc.verify')}</button>
          <button type="button" className="link-btn" onClick={() => { setStep('ask'); setCode(''); setErr(''); }}>{t('acc.other')}</button>
        </form>
      )}
    </Modal>
  );
}
