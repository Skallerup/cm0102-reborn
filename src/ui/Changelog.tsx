// Version og changelog: lille knap nederst i menuen, der viser hvad der er nyt.
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { dateFmt, getLang, t } from '../i18n';
import { APP_VERSION, CHANGELOG } from './changelogData';
import { Modal } from './components';
import { KOFI_URL } from '../online/kofi';

const SEEN = 'cm0102.seenVersion';

export function seenVersion(): string {
  try { return localStorage.getItem(SEEN) ?? ''; } catch { return ''; }
}

const SEEN_EVENT = 'cm0102:seenVersion';
/** Ændringsloggen er set: gem versionen og giv besked til alle røde prikker (Game Options-knappen og punktet "Hvad er nyt") */
export function markChangelogSeen() {
  try { localStorage.setItem(SEEN, APP_VERSION); } catch { /* ignorer */ }
  try { window.dispatchEvent(new Event(SEEN_EVENT)); } catch { /* ignorer */ }
}
/** Er der en nyere version i ændringsloggen, end spilleren har set? (opdateres, når loggen åbnes) */
export function useChangelogFresh(): boolean {
  const [seen, setSeen] = useState(seenVersion);
  useEffect(() => {
    const f = () => setSeen(seenVersion());
    window.addEventListener(SEEN_EVENT, f);
    return () => window.removeEventListener(SEEN_EVENT, f);
  }, []);
  return seen !== APP_VERSION;
}

export function VersionButton() {
  const [open, setOpen] = useState(false);
  const fresh = useChangelogFresh();
  const show = () => {
    setOpen(true);
    markChangelogSeen();
  };
  return (
    <>
      <button className="nav-version" onClick={(e) => { e.stopPropagation(); show(); }} title={t('changelog.title')}>
        <span>v{APP_VERSION}</span>
        <span className="muted">· {t('changelog.short')}</span>
        {fresh && <span className="tag good">{t('changelog.new')}</span>}
      </button>
      {/* vinduet tegnes uden for menuen, så menuens knapstil ikke rammer det */}
      {open && createPortal(<ChangelogModal onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}

export function ChangelogModal({ onClose }: { onClose: () => void }) {
  const lang = getLang() === 'da' ? 'da' : 'en';
  return (
    <Modal title={t('changelog.title')} onClose={onClose}>
      <div className="changelog">
        {CHANGELOG.map((e, i) => (
          <section key={e.version} className="cl-entry">
            <header>
              <span className={`cl-version ${i === 0 ? 'latest' : ''}`}>v{e.version}</span>
              <b>{e.title[lang]}</b>
              <span className="muted cl-date">{dateFmt(e.date)}</span>
            </header>
            <ul>{e.items.map((it, k) => <li key={k}>{it[lang]}</li>)}</ul>
          </section>
        ))}
        <p className="cl-donate muted">♥ {t('sb.msg')} <a href={KOFI_URL} target="_blank" rel="noopener noreferrer">{t('sb.btn')}</a></p>
      </div>
    </Modal>
  );
}
