// "Støt projektet": månedens målbar (Ko-fi), knap til Ko-fi og heltelisten. Bruges på forsiden og i Game Options (Om projektet og støt).
// Importerer hverken motoren eller changelogData. Ko-fi er et almindeligt link (ingen widget/script – ingen CSP/SW-ændringer).
import { useEffect, useState } from 'react';
import { t } from '../i18n';
import { fetchKofi, KOFI_URL, type KofiStatus } from '../online/kofi';

export function SupportBox({ full }: { full?: boolean }) {
  const [s, setS] = useState<KofiStatus | null>(null);
  useEffect(() => { let on = true; void fetchKofi().then((r) => { if (on) setS(r); }); return () => { on = false; }; }, []);
  const raised = s?.raised ?? 0, goal = s?.goal ?? 150, pct = s?.percent ?? 0;
  const heroes = s?.heroes ?? [];
  return (
    <div className="sb">
      {full && <>
        <p><b>{t('sb.msg')}</b></p>
        <p>{t('sb.about')}</p>
        <p>{t('sb.cost')}</p>
      </>}
      <div className="sb-goal">
        <div className="sb-head"><b>{t('sb.goal')}</b><span>{s ? t('sb.raised', { n: Math.round(raised), goal }) : t('sb.goalOnly', { goal })}</span></div>
        <div className="sb-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}><i style={{ width: `${pct}%` }} /></div>
        {s && <small>{t('sb.percent', { pct })}</small>}
      </div>
      <a className="sb-btn" href={KOFI_URL} target="_blank" rel="noopener noreferrer">☕ {t('sb.btn')}</a>
      <small className="sb-free">{t('sb.free')}</small>
      {(heroes.length > 0 || !!s?.anonymous) && (
        <div className="sb-heroes">
          <b>{t('sb.heroes')}</b>
          <ul>
            {heroes.slice(0, full ? 30 : 12).map((h) => <li key={h.name}><span>{h.name}</span>{h.message && <em>“{h.message}”</em>}</li>)}
            {!!s?.anonymous && <li><span>{t('sb.anon')}</span>{s.anonymous > 1 && <em>×{s.anonymous}</em>}</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
