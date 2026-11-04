import { useEffect, useRef, useState } from 'react';
import type { Lang } from '../game/types';
import { LANGS } from '../i18n';

const FLAG: Record<Lang, string> = { da: 'dk', en: 'gb', es: 'es', fr: 'fr', de: 'de', it: 'it', pt: 'br', tr: 'tr' };
const flag = (l: Lang) => <img className="lm-flag" src={`https://flagcdn.com/${FLAG[l]}.svg`} alt="" width="20" height="14" />;

/** Sprogvælger som dropdown med flag (forside, draft-side og startside) */
export function LangMenu({ value, onChange, up }: { value: Lang; onChange: (l: Lang) => void; up?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const out = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', out);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', out); document.removeEventListener('keydown', esc); };
  }, [open]);
  const cur = LANGS.find(([k]) => k === value) ?? LANGS[0];
  return (
    <div className={`lm ${open ? 'open' : ''} ${up ? 'up' : ''}`} ref={ref}>
      <button type="button" className="lm-btn" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)}>
        {flag(cur[0])}<span className="lm-short">{cur[1]}</span>
        <svg className="lm-caret" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open && (
        <ul className="lm-list" role="listbox">
          {LANGS.map(([k, short, full]) => (
            <li key={k} role="option" aria-selected={k === value}>
              <button type="button" className={k === value ? 'on' : ''} onClick={() => { setOpen(false); if (k !== value) onChange(k); }}>
                {flag(k)}<span className="lm-full">{full}</span><span className="lm-code">{short}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
