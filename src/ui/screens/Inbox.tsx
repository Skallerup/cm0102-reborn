
import { useRef } from 'react';
import { act } from '../../game/actions';
import { useHotkeys } from '../hotkeys';
import { dateFmt, t } from '../../i18n';
import { Empty, Panel } from '../components';
import { useGame, useRouteState } from '../core';
import { Head, newsBody, newsTitle, useOpenLink } from './common';
import { AiArticle } from '../aiArticle';
import type { NewsCategory } from '../../game/types';

const CATS: (NewsCategory | 'all')[] = ['all', 'match', 'transfer', 'contract', 'injury', 'board', 'scout', 'award', 'youth', 'job', 'general'];

export function Inbox() {
  const g = useGame()!;
  const [cat, setCat] = useRouteState<NewsCategory | 'all'>('cat', 'all');
  const [sel, setSel] = useRouteState<number | null>('sel', g.news[0]?.id ?? null);
  const open = useOpenLink();
  const list = g.news.filter((n) => cat === 'all' || n.cat === cat);
  const item = g.news.find((n) => n.id === sel);
  if (item && !item.read) queueMicrotask(() => act({ t: 'read', ids: [item.id] }));
  const listRef = useRef<HTMLDivElement>(null);
  const shown = list.slice(0, 200);
  const move = (dir: number) => {
    if (!shown.length) return;
    const i = shown.findIndex((n) => n.id === sel);
    const next = shown[Math.max(0, Math.min(shown.length - 1, i < 0 ? 0 : i + dir))];
    setSel(next.id);
    requestAnimationFrame(() => listRef.current?.querySelector(`[data-id="${next.id}"]`)?.scrollIntoView({ block: 'nearest' }));
  };
  useHotkeys((e) => {
    if (e.key === 'ArrowDown' || e.key === 'j') { move(1); return true; }
    if (e.key === 'ArrowUp' || e.key === 'k') { move(-1); return true; }
    if (e.key === 'Enter' && item?.link) { open(item); return true; }
    if (e.key === 'ArrowRight') {
      // næste ulæste
      const i = shown.findIndex((n) => n.id === sel);
      const next = shown.slice(i + 1).find((n) => !n.read) ?? shown.find((n) => !n.read);
      if (next) { setSel(next.id); requestAnimationFrame(() => listRef.current?.querySelector(`[data-id="${next.id}"]`)?.scrollIntoView({ block: 'nearest' })); }
      return true;
    }
  });

  return (
    <div>
      <Head title={t('nav.inbox')}>
        <select value={cat} onChange={(e) => setCat(e.target.value as NewsCategory | 'all')}>
          {CATS.map((c) => <option key={c} value={c}>{t(`cat.${c}`)}</option>)}
        </select>
        <span className="muted kbd-hint">{t('inbox.keys')}</span>
        <button className="small" onClick={() => act({ t: 'read', ids: 'all' })}>{t('inbox.markRead')}</button>
      </Head>
      <div className="cols2">
        <Panel title={t('inbox.messages')} className="flush">
          {list.length === 0 && <Empty text={t('inbox.empty')} />}
          <div style={{ maxHeight: '70vh', overflowY: 'auto' }} ref={listRef}>
            {shown.map((n) => (
              <div key={n.id} data-id={n.id} className={`news-item ${n.read ? '' : 'unread'}`} onClick={() => setSel(n.id)} style={sel === n.id ? { background: 'var(--rowhover)' } : undefined}>
                <span className={`cat cat-${n.cat}`} />
                <span className="date">{dateFmt(n.date)}</span>
                <span className="title">{newsTitle(n)}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title={item ? dateFmt(item.date, true) : ''}>
          {item ? (
            <div className="col">
              <h3 style={{ color: 'var(--accent)' }}>{newsTitle(item)}</h3>
              {newsBody(item) && <p style={{ lineHeight: 1.5 }}>{newsBody(item)}</p>}
              <AiArticle item={item} />
              {item.link && <div><button onClick={() => open(item)}>{t('inbox.open')}</button></div>}
            </div>
          ) : <Empty text={t('inbox.select')} />}
        </Panel>
      </div>
    </div>
  );
}
