import { describe, expect, it } from 'vitest';
import { en } from '../src/i18n/en';
import { da } from '../src/i18n/da';

describe('nyhedernes brødtekster', () => {
  it('de almindeligste nyheder har en brødtekst på engelsk og dansk', () => {
    for (const k of ['match.won', 'match.drew', 'match.lost', 'news.injury', 'news.recovered', 'news.managerSacked', 'news.managerHired', 'news.jobOffer', 'award.monthPlayer', 'recb.news.att', 'board.requestNo', 'transfer.bidRejected']) {
      expect(en[`${k}.body` as keyof typeof en], k).toBeTruthy();
      expect(da[`${k}.body` as keyof typeof da], k).toBeTruthy();
    }
  });
});
