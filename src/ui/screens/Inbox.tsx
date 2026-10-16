import { useState } from 'react';
import { act } from '../../game/actions';
import { dateFmt, t } from '../../i18n';
import { Empty, Panel } from '../components';
import { useGame } from '../core';
import { Head, newsBody, newsTitle, useOpenLink } from './common';
import type { NewsCategory } from '../../game/types';

const CATS: (NewsCategory | 'all')[] = ['all', 'match', 'transfer', 'contract', 'injury', 'board', 'scout', 'award', 'youth', 'job', 'general'];

export function Inbox() {
  const g = useGame()!;
  const [cat, setCat] = useState<NewsCategory | 'all'>('all');
  const [sel, setSel] = useState<number | null>(g.news[0]?.id ?? null);
  const open = useOpenLink();
  const list = g.news.filter((n) => cat === 'all' || n.cat === cat);
  const item = g.news.find((n) => n.id === sel);
  if (item && !item.read) queueMicrotask(() => act({ t: 'read', ids: [item.id] }));

  return (
    <div>
      <Head title={t('nav.inbox')}>
        <select value={cat} onChange={(e) => setCat(e.target.value as NewsCategory | 'all')}>
          {CATS.map((c) => <option key={c} value={c}>{t(`cat.${c}`)}</option>)}
        </select>
        <button className="small" onClick={() => act({ t: 'read', ids: 'all' })}>{t('inbox.markRead')}</button>
      </Head>
      <div className="cols2">
        <Panel title={t('inbox.messages')} className="flush">
          {list.length === 0 && <Empty text={t('inbox.empty')} />}
          <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {list.slice(0, 200).map((n) => (
              <div key={n.id} className={`news-item ${n.read ? '' : 'unread'}`} onClick={() => setSel(n.id)} style={sel === n.id ? { background: 'var(--rowhover)' } : undefined}>
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
              {item.link && <div><button onClick={() => open(item)}>{t('inbox.open')}</button></div>}
            </div>
          ) : <Empty text={t('inbox.select')} />}
        </Panel>
      </div>
    </div>
  );
}
