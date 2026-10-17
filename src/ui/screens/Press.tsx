import { useEffect, useState } from 'react';
import { act } from '../../game/actions';
import { tonesFor, type PressTopic, type Tone } from '../../game/press';
import { sortTable } from '../../game/competitions';
import { aiCall, aiText, setAiText } from '../../ai/client';
import { t } from '../../i18n';
import { Panel } from '../components';
import { useGame, useNav } from '../core';
import { useAiAvailable } from '../ai';
import { Head } from './common';

/** Skabelonspørgsmål (bruges uden AI og mens AI-spørgsmålene hentes) */
export function templateQuestion(tp: PressTopic): string {
  const p = tp.params;
  const variant = tp.kind === 'result' ? `.${p.res}` : tp.kind === 'formerClub' ? `.${p.sacked}` : tp.kind === 'form' ? `.${p.streak}` : tp.kind === 'opponent' ? `.${p.fav}` : '';
  return t(`press.q.${tp.kind}${variant}`, p);
}

/** Opfundne journalister og medier (ingen rigtige personer eller redaktioner) */
const JOURNALISTS = { da: ['Mette Kjær, Boldposten', 'Jonas Bach, Sportsavisen Dag', 'Sofie Lund, Radio Bold', 'Kasper Holm, Kampbladet', 'Line Vestergaard, Fodbold Live'], en: ['Tom Hughes, The Touchline', 'Sarah Cole, Matchday Radio', 'Danny Price, The Terrace', 'Rachel Ford, Pitchside TV', 'Mark Ellis, The Football Post'] };

export function PressScreen() {
  const g = useGame()!;
  const { back } = useNav();
  const pc = g.press;
  const ai = useAiAvailable();
  const [answers, setAnswers] = useState<Record<string, { tone: Tone; text?: string }>>({});
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [done, setDone] = useState<{ headline: string; body: string } | null>(null);
  const key = pc ? `press:${pc.fixture}:${pc.phase}` : '';
  const [questions, setQuestions] = useState<Record<string, { text: string }>>(() => {
    try { return JSON.parse(aiText(key) ?? '{}'); } catch { return {}; }
  });

  useEffect(() => {
    if (!pc || !ai || Object.keys(questions).length) return;
    const me = g.clubs[g.userClub];
    const comp = g.comps[me?.league ?? ''];
    const pos = comp ? sortTable(comp.table.slice()).findIndex((r) => r.club === g.userClub) + 1 : 0;
    aiCall<{ questions: { id: string; text: string }[] }>('press', {
      manager: g.manager.name, club: me?.name, league: comp?.name, position: pos || undefined, opponent: g.clubs[pc.opp]?.name,
      phase: pc.phase === 'pre' ? 'før kampen' : 'efter kampen',
      topics: pc.topics.map((tp) => ({ id: tp.id, kind: tp.kind, facts: tp.params, example: templateQuestion(tp) })),
    }).then((r) => {
      if (!r?.questions?.length) return;
      const map = Object.fromEntries(r.questions.filter((q) => pc.topics.some((tp) => tp.id === q.id)).map((q) => [q.id, { text: q.text }]));
      setQuestions(map);
      setAiText(key, JSON.stringify(map));
    });
  }, [ai, key]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!pc && !done) {
    return <div><Head title={t('press.title')} /><div className="empty">{t('press.none')}</div></div>;
  }

  const finish = async (all?: Tone) => {
    if (!pc) return;
    const list = pc.topics.map((tp) => ({ topic: tp.id, tone: all ?? answers[tp.id]?.tone ?? 'deflect' }));
    setBusy('finish');
    let report: { headline: string; body: string } | null = null;
    if (!all) {
      report = await aiCall<{ headline: string; body: string }>('pressReport', {
        manager: g.manager.name, club: g.clubs[g.userClub]?.name, opponent: g.clubs[pc.opp]?.name, phase: pc.phase,
        qa: pc.topics.map((tp) => ({ question: questions[tp.id]?.text ?? templateQuestion(tp), answer: answers[tp.id]?.text ?? t(`press.tone.${answers[tp.id]?.tone ?? 'deflect'}`), tone: answers[tp.id]?.tone })),
      }, 12_000);
    }
    act({ t: 'press', answers: list, headline: report?.headline, body: report?.body });
    setBusy(null);
    setDone(report ?? { headline: t(all ? 'press.sentAssistant' : 'press.reportPlain', { opp: g.clubs[pc.opp]?.name ?? '' }), body: '' });
  };

  const freeAnswer = async (tp: PressTopic) => {
    const text = (draft[tp.id] ?? '').trim().slice(0, 400);
    if (!text) return;
    setBusy(tp.id);
    const allowed = tonesFor(tp.kind);
    const r = await aiCall<{ tone: string }>('pressAnswer', { question: questions[tp.id]?.text ?? templateQuestion(tp), answer: text, allowed, meaning: Object.fromEntries(allowed.map((x) => [x, t(`press.tone.${x}.hint`)])) });
    setBusy(null);
    const tone = (allowed.includes(r?.tone as Tone) ? r!.tone : 'calm') as Tone;
    setAnswers({ ...answers, [tp.id]: { tone, text } });
  };

  if (done) {
    return (
      <div>
        <Head title={t('press.title')} />
        <Panel title={t('press.headlines')}>
          <h3 style={{ marginTop: 0 }}>{done.headline}</h3>
          {done.body && <p style={{ lineHeight: 1.55 }}>{done.body}</p>}
          <button className="primary" onClick={back}>{t('common.back')}</button>
        </Panel>
      </div>
    );
  }

  const journalists = JOURNALISTS[g.lang === 'en' ? 'en' : 'da'];
  const allAnswered = pc!.topics.every((tp) => answers[tp.id]);
  return (
    <div>
      <Head title={t(pc!.phase === 'pre' ? 'press.titlePre' : 'press.titlePost', { opp: g.clubs[pc!.opp]?.name ?? '' })} />
      <div className="muted" style={{ marginBottom: 12 }}>{t('press.intro')}</div>
      {pc!.topics.map((tp, i) => {
        const q = questions[tp.id];
        const a = answers[tp.id];
        return (
          <Panel key={tp.id} title={journalists[(pc!.fixture + i) % journalists.length]}>
            <p style={{ fontSize: 15, lineHeight: 1.5, marginTop: 0 }}>“{q?.text ?? templateQuestion(tp)}”</p>
            <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
              {tonesFor(tp.kind).map((tone) => (
                <button key={tone} className={a?.tone === tone && !a.text ? 'primary' : ''} title={t(`press.tone.${tone}.hint`)} onClick={() => setAnswers({ ...answers, [tp.id]: { tone } })}>
                  {t(`press.tone.${tone}`)}
                </button>
              ))}
            </div>
            {ai && (
              <div className="row" style={{ marginTop: 8 }}>
                <input style={{ flex: 1 }} maxLength={400} placeholder={t('press.freePlaceholder')} value={draft[tp.id] ?? ''} onChange={(e) => setDraft({ ...draft, [tp.id]: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter') freeAnswer(tp); }} />
                <button disabled={busy === tp.id || !(draft[tp.id] ?? '').trim()} onClick={() => freeAnswer(tp)}>{busy === tp.id ? '…' : t('press.answer')}</button>
              </div>
            )}
            {a && <div className="muted" style={{ marginTop: 6 }}>{a.text ? t('press.interpreted', { tone: t(`press.tone.${a.tone}`) }) : t(`press.tone.${a.tone}.hint`)}</div>}
          </Panel>
        );
      })}
      <div className="row" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
        <button onClick={() => finish('deflect')} disabled={!!busy}>{t('press.sendAssistant')}</button>
        <button className="primary" disabled={!allAnswered || !!busy} onClick={() => finish()}>{busy === 'finish' ? t('press.writing') : t('press.finish')}</button>
      </div>
    </div>
  );
}
