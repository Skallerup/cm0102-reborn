// Forsiden for nye besøgende: hero med animation, rigtige screenshots, features, rangliste og FAQ.
import { LangMenu } from './LangMenu';
import { ConsentLink } from './ConsentBanner';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Lang } from '../game/types';
import { LOCALE, getLang, setLang, t } from '../i18n';
import { setTheme } from './theme';
import { fetchBoard, rankingAvailable, type RankRow } from '../online/rank';
import { withAiManagers } from './aiManagers';
import './landing.css';
import { shot } from './shots';

const img = shot;

/** Elementer glider ind, når de kommer i syne */
export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.lp .reveal');
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }, { threshold: 0.15 });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
}

/** Tal der tæller op, når de kommer i syne */
export function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setV(to); return; }
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / 1400);
        setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);
  return <span ref={ref}>{v.toLocaleString(LOCALE[getLang()])}{suffix}</span>;
}

/** Skærmbillede i en browserramme der vipper let efter musen */
const JOIN_ROLES = ['developer', 'designer', 'data', 'testing', 'translation', 'community', 'other'] as const;

/** "Vil du være med?" – ansøgninger gemmes via api/admin.ts og læses i admin-interfacet (?admin=1) */
function JoinForm() {
  const [f, setF] = useState({ name: '', email: '', role: 'developer', message: '', website: '' });
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [err, setErr] = useState('');
  const live = rankingAvailable();
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const send = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setState('sending'); setErr('');
    try {
      const r = await fetch('/api/admin', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ op: 'apply', ...f, lang: getLang() }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setState('error'); setErr(t(`land.join.err.${j.error === 'email' || j.error === 'limit' || j.error === 'missing' ? j.error : 'other'}`)); return; }
      setState('sent');
    } catch { setState('error'); setErr(t('land.join.err.other')); }
  };
  return (
    <section id="join" className="lp-section lp-wrap lp-join">
      <div className="lp-join-text reveal">
        <span className="lp-kicker">{t('land.join.kicker')}</span>
        <h2>{t('land.join.title')}</h2>
        <p>{t('land.join.text')}</p>
        <ul>{[1, 2, 3].map((n) => <li key={n}>{t(`land.join.b${n}`)}</li>)}</ul>
      </div>
      <div className="lp-join-box reveal">
        {state === 'sent' ? (
          <div className="lp-join-done"><b>✓ {t('land.join.thanks')}</b><p>{t('land.join.thanksText')}</p></div>
        ) : !live ? (
          <div className="lp-join-done"><p>{t('land.join.offline')}</p><a className="lp-cta" href="https://cm0102reborn.com/#join">{t('land.join.goLive')} <span aria-hidden="true">→</span></a></div>
        ) : (
          <form onSubmit={send}>
            <label>{t('land.join.name')}<input required maxLength={80} value={f.name} onChange={set('name')} autoComplete="name" /></label>
            <label>{t('land.join.email')}<input required type="email" maxLength={120} value={f.email} onChange={set('email')} autoComplete="email" /></label>
            <label>{t('land.join.role')}
              <select value={f.role} onChange={set('role')}>{JOIN_ROLES.map((r) => <option key={r} value={r}>{t(`land.join.role.${r}`)}</option>)}</select>
            </label>
            <label>{t('land.join.message')}<textarea required minLength={10} maxLength={3000} rows={5} value={f.message} onChange={set('message')} placeholder={t('land.join.placeholder')} /></label>
            {/* honeypot – skjult for mennesker */}
            <input className="lp-hp" tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} aria-hidden="true" />
            {err && <div className="lp-join-err">{err}</div>}
            <button className="lp-cta" type="submit" disabled={state === 'sending'}>{state === 'sending' ? t('land.join.sending') : t('land.join.send')} <span aria-hidden="true">→</span></button>
            <small className="lp-join-privacy">{t('land.join.privacy')}</small>
          </form>
        )}
      </div>
    </section>
  );
}

const LOOK_SCREENS = ['squad', 'player', 'table'] as const;

/** "To udseender": de samme skærme i det moderne og det klassiske CM 01/02-tema – og start spillet i det valgte */
function Looks({ onPlay, onOpen }: { onPlay: () => void; onOpen: (src: string, alt: string) => void }) {
  const [look, setLook] = useState<'modern' | 'classic'>('classic');
  const [screen, setScreen] = useState<(typeof LOOK_SCREENS)[number]>('squad');
  const play = (l: 'modern' | 'classic') => { setTheme(l === 'classic' ? 'retro' : 'club'); onPlay(); };
  return (
    <section id="looks" className="lp-section lp-wrap lp-looks">
      <span className="lp-kicker reveal">{t('land.looks.kicker')}</span>
      <h2 className="reveal">{t('land.looks.title')}</h2>
      <p className="lp-sub reveal">{t('land.looks.sub')}</p>
      <div className="lp-looks-bar reveal">
        <div className="lp-looks-toggle" role="tablist">
          {(['modern', 'classic'] as const).map((l) => (
            <button key={l} role="tab" aria-selected={look === l} className={look === l ? 'on' : ''} onClick={() => setLook(l)}>{t(`land.looks.${l}`)}</button>
          ))}
        </div>
        <div className="lp-looks-screens">
          {LOOK_SCREENS.map((s) => <button key={s} className={screen === s ? 'on' : ''} onClick={() => setScreen(s)}>{t(`land.looks.s.${s}`)}</button>)}
        </div>
      </div>
      <div className="lp-looks-visual reveal">
        <Frame src={img(`${look}-${screen}`)} alt={`${t(`land.looks.${look}`)} – ${t(`land.looks.s.${screen}`)}`} onOpen={onOpen} />
      </div>
      <div className="lp-looks-cards reveal">
        {(['modern', 'classic'] as const).map((l) => (
          <div key={l} className={`lp-looks-card ${look === l ? 'on' : ''}`} onMouseEnter={() => setLook(l)}>
            <h3>{t(`land.looks.${l}`)}</h3>
            <p>{t(`land.looks.${l}.text`)}</p>
            <button className={l === 'classic' ? 'lp-cta' : 'lp-ghost'} onClick={() => play(l)}>{t(`land.looks.play.${l}`)} <span aria-hidden="true">→</span></button>
          </div>
        ))}
      </div>
      <p className="lp-looks-note reveal">{t('land.looks.note')}</p>
    </section>
  );
}

export function Frame({ src, alt, className = '', onOpen }: { src: string; alt: string; className?: string; onOpen?: (src: string, alt: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--rx', `${(-y * 6).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${(x * 8).toFixed(2)}deg`);
  };
  const leave = () => { ref.current?.style.removeProperty('--rx'); ref.current?.style.removeProperty('--ry'); };
  return (
    <div ref={ref} className={`lp-frame ${className}`} onMouseMove={move} onMouseLeave={leave} onClick={() => onOpen?.(src, alt)} role={onOpen ? 'button' : undefined} tabIndex={onOpen ? 0 : undefined} onKeyDown={(e) => { if (e.key === 'Enter') onOpen?.(src, alt); }}>
      <div className="lp-frame-bar"><i /><i /><i /><span>CM Reborn</span></div>
      <img src={src} alt={alt} loading="lazy" decoding="async" />
    </div>
  );
}

const TICKER = ['tick1', 'tick2', 'tick3', 'tick4', 'tick5', 'tick6', 'tick7', 'tick8'];
const FEATURES: [string, string][] = [
  ['⚽', 'engine'], ['🌍', 'players'], ['🔎', 'scouting'], ['🎙️', 'press'], ['💸', 'transfers'],
  ['🧠', 'ai'], ['💾', 'authentic'], ['🤝', 'online'], ['📱', 'mobile'],
];
const SHOWCASE: { key: string; imgs: string[] }[] = [
  { key: 'matchday', imgs: ['report', 'match-stats'] },
  { key: 'tactics', imgs: ['tactics', 'match'] },
  { key: 'people', imgs: ['player', 'press'] },
  { key: 'career', imgs: ['table', 'club'] },
  { key: 'classic', imgs: ['classic-squad', 'classic-player'] },
];

export function Landing({ onPlay, onLang, onDraft }: { onPlay: () => void; onLang: (l: Lang) => void; onDraft?: () => void }) {
  useReveal();
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const [top, setTop] = useState<(RankRow & { ai?: boolean })[] | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const lang = getLang();
  useEffect(() => {
    document.title = t('land.docTitle');
    // de rigtige managere blandet med tydeligt mærkede AI-managere, så listen ikke står tom
    if (rankingAvailable()) fetchBoard('career').then((d) => setTop(withAiManagers(d?.rows ?? [], 8)));
    else setTop(withAiManagers([], 8));
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [lang]);
  useEffect(() => {
    if (!lightbox) return;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [lightbox]);
  const switchLang = (l: Lang) => { setLang(l); onLang(l); };
  const open = (src: string, alt: string) => setLightbox({ src, alt });
  // billeder over målet indlæses undervejs og skubber det ned – ret efter, til sektionen står under menuen
  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth' });
    let tries = 0;
    const fix = () => {
      const top = el.getBoundingClientRect().top;
      if (Math.abs(top - 84) > 12 && tries++ < 4) { el.scrollIntoView({ behavior: tries > 2 ? 'instant' : 'smooth' }); setTimeout(fix, 700); }
    };
    setTimeout(fix, 900);
  };
  const Cta = ({ big, children }: { big?: boolean; children?: ReactNode }) => (
    <button className={`lp-cta ${big ? 'big' : ''}`} onClick={onPlay}>{children ?? t('land.play')} <span aria-hidden="true">→</span></button>
  );

  return (
    <div className="lp">
      <div className="lp-aurora" aria-hidden="true"><i /><i /><i /></div>
      <header className={`lp-nav ${scrolled ? 'solid' : ''}`}>
        <div className="lp-wrap lp-nav-in">
          <div className="lp-brand"><img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" width="28" height="28" /> <b>CM</b> <span>Reborn</span></div>
          <nav className="lp-links">
            <a onClick={() => go('features')}>{t('land.nav.features')}</a>
            <a className="opt2" onClick={() => go('screens')}>{t('land.nav.screens')}</a>
            <a className="opt2" onClick={() => go('looks')}>{t('land.nav.looks')}</a>
            <a className="opt1" onClick={() => go('ranking')}>{t('land.nav.ranking')}</a>
            <a href="?community=1">{t('land.nav.community')}</a>
            <a onClick={() => go('join')}>{t('land.nav.join')}</a>
            <a className="opt1" onClick={() => go('faq')}>{t('land.nav.faq')}</a>
            {onDraft && <a onClick={onDraft}>Draft</a>}
          </nav>
          <div className="lp-nav-right">
            <LangMenu value={lang} onChange={switchLang} />
            <button className="lp-cta small" onClick={onPlay}>{t('land.playShort')}</button>
          </div>
        </div>
      </header>

      <section className="lp-hero">
        <div className="lp-wrap lp-hero-in">
          <div className="lp-hero-text">
            <div className="lp-pill reveal"><span className="lp-live" /> {t('land.pill')}</div>
            <h1 className="reveal">{t('land.h1a')} <span className="lp-grad">{t('land.h1b')}</span></h1>
            <p className="lp-lead reveal">{t('land.lead')}</p>
            <div className="lp-hero-ctas reveal">
              <Cta big />
              <button className="lp-ghost" onClick={() => go('screens')}>{t('land.seeScreens')}</button>
            </div>
            <ul className="lp-checks reveal">
              {['free', 'nodl', 'lang', 'save'].map((k) => <li key={k}>✓ {t(`land.check.${k}`)}</li>)}
            </ul>
          </div>
          <div className="lp-hero-visual reveal">
            {/* det klassiske CM 01/02-tema (2001/02-databasen) bag det moderne kamprapport-billede */}
            <Frame src={img('classic-table')} alt={t('land.alt.classic')} className="lp-hero-classic" onOpen={open} />
            <Frame src={img('report')} alt={t('land.alt.report')} className="lp-hero-main" onOpen={open} />
            <div className="lp-phone"><img src={img('mobile')} alt={t('land.alt.mobile')} loading="lazy" /></div>
            <div className="lp-float goal">⚽ {t('land.floatGoal')}</div>
            <div className="lp-float bid">💸 {t('land.floatBid')}</div>
          </div>
        </div>
      </section>

      <div className="lp-ticker" aria-hidden="true">
        <div className="lp-ticker-track">
          {[...TICKER, ...TICKER].map((k, i) => <span key={i}>{t(`land.${k}`)}</span>)}
        </div>
      </div>

      <section className="lp-stats lp-wrap">
        {[[40000, '+', 'players'], [1375, '', 'clubs'], [81, '', 'leagues'], [240, '', 'moments']].map(([n, s, k]) => (
          <div key={k as string} className="lp-stat reveal"><b><Counter to={n as number} suffix={s as string} /></b><span>{t(`land.stat.${k}`)}</span></div>
        ))}
      </section>

      {onDraft && (
        <section className="lp-section lp-wrap">
          <div className="lp-promo reveal">
            <div>
              <div className="lp-pill"><span className="lp-live" /> {t('land.promoPill')}</div>
              <h2>{t('land.promoTitle')}</h2>
              <p>{t('land.promoText')}</p>
              <button className="lp-cta" onClick={onDraft}>{t('land.promoCta')} <span aria-hidden="true">→</span></button>
            </div>
            <Frame src={img('draft-live')} alt={t('dl.shot.live')} onOpen={open} />
          </div>
        </section>
      )}

      <section id="features" className="lp-section lp-wrap">
        <h2 className="reveal">{t('land.featuresTitle')}</h2>
        <p className="lp-sub reveal">{t('land.featuresSub')}</p>
        <div className="lp-grid">
          {FEATURES.map(([icon, k], i) => (
            <div key={k} className="lp-card reveal" style={{ transitionDelay: `${(i % 3) * 80}ms` }}>
              <div className="lp-card-icon">{icon}</div>
              <h3>{t(`land.f.${k}.title`)}</h3>
              <p>{t(`land.f.${k}.text`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="screens" className="lp-section lp-wrap">
        <h2 className="reveal">{t('land.screensTitle')}</h2>
        <p className="lp-sub reveal">{t('land.screensSub')}</p>
        {SHOWCASE.map((s, i) => (
          <div key={s.key} className={`lp-show ${i % 2 ? 'flip' : ''}`}>
            <div className="lp-show-text reveal">
              <span className="lp-kicker">{t(`land.s.${s.key}.kicker`)}</span>
              <h3>{t(`land.s.${s.key}.title`)}</h3>
              <p>{t(`land.s.${s.key}.text`)}</p>
              <ul>{[1, 2, 3].map((n) => <li key={n}>{t(`land.s.${s.key}.b${n}`)}</li>)}</ul>
            </div>
            <div className="lp-show-visual reveal">
              <Frame src={img(s.imgs[0])} alt={t(`land.s.${s.key}.title`)} onOpen={open} />
              <Frame src={img(s.imgs[1])} alt={t(`land.s.${s.key}.title`)} className="lp-second" onOpen={open} />
            </div>
          </div>
        ))}
      </section>

      <Looks onPlay={onPlay} onOpen={open} />

      <section id="ranking" className="lp-section lp-wrap lp-rank">
        <div className="lp-rank-text reveal">
          <span className="lp-kicker">{t('land.rankKicker')}</span>
          <h2>{t('land.rankTitle')}</h2>
          <p>{t('land.rankText')}</p>
          <Cta>{t('land.rankCta')}</Cta>
        </div>
        <div className="lp-rank-board reveal">
          <div className="lp-rank-head">🏆 {t('land.rankBoard')}</div>
          {top && top.length > 0 ? top.map((r, i) => (
            <div key={r.id} className={`lp-rank-row ${r.ai ? 'ai' : ''}`}><b>{i + 1}</b><span><span className="lp-rank-name">{r.name}{r.ai && <i className="lp-ai" title={t('land.rankAiHint')}>AI</i>}</span><small>{r.club} · {r.league}</small></span><em>{r.points}</em></div>
          )) : (
            <div className="lp-rank-empty">{t('land.rankEmpty')}</div>
          )}
          {top?.some((r) => r.ai) && <div className="lp-rank-note">{t('land.rankAiNote')}</div>}
        </div>
      </section>

      <section className="lp-section lp-wrap">
        <h2 className="reveal">{t('land.stepsTitle')}</h2>
        <div className="lp-steps">
          {[1, 2, 3].map((n) => (
            <div key={n} className="lp-step reveal" style={{ transitionDelay: `${n * 90}ms` }}>
              <span>{n}</span><h3>{t(`land.step${n}.title`)}</h3><p>{t(`land.step${n}.text`)}</p>
            </div>
          ))}
        </div>
      </section>

      <JoinForm />

      <section id="faq" className="lp-section lp-wrap lp-faq">
        <h2 className="reveal">{t('land.faqTitle')}</h2>
        {[1, 7, 8, 2, 3, 4, 5, 6].map((n) => (
          <details key={n} className="reveal">
            <summary>{t(`land.q${n}`)}</summary>
            <p>{t(`land.a${n}`)}</p>
          </details>
        ))}
      </section>

      <section className="lp-final">
        <div className="lp-wrap reveal">
          <h2>{t('land.finalTitle')}</h2>
          <p>{t('land.finalText')}</p>
          <Cta big />
        </div>
      </section>

      <div className="lp-support lp-wrap">
        <span>💛 {t('land.supportLine')}</span>
        <a className="link" href="?community=1">{t('land.community')}</a>
      </div>
      <footer className="lp-footer lp-wrap">
        <div>© {new Date().getFullYear()} CM Reborn · {t('land.footerData')}</div>
        <div className="lp-disclaimer">{t('land.disclaimer')}</div>
        <nav className="lp-footer-links">
          <a href="/cm-01-02/">{t('land.foot.db')}</a>
          <a href="/2026-27/">{t('land.foot.db26')}</a>
          <a href="/cm-01-02-guides/">{t('land.foot.guides')}</a>
          <a href="/faq/">{t('land.nav.faq')}</a>
        </nav>
        <div><ConsentLink /></div>
      </footer>

      {lightbox && (
        <div className="lp-lightbox" onClick={() => setLightbox(null)} role="dialog" aria-label={lightbox.alt}>
          <img src={lightbox.src} alt={lightbox.alt} />
          <button className="lp-close" aria-label={t('common.close')}>×</button>
        </div>
      )}
    </div>
  );
}
