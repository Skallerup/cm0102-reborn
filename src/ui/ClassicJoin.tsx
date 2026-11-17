// Tilmelding til et fællesspil i det klassiske udseende: samme trin som nyt spil (Enter Name → Select Nationality → Select Team → Please Confirm),
// men låst til rummets verden (ligaerne værten har valgt) – klubber, der allerede er taget, er markeret "Taken" og kan ikke vælges.
// Selve tilmeldingen er det eksisterende kald (joinOnlineGame); lobby/venteskærmen er uændret.
import { useEffect, useMemo, useState } from 'react';
import { compName, getLang, natName, t } from '../i18n';
import type { GameState } from '../game/types';
import { downloadSnapshot, fetchRoom, joinOnlineGame, type RoomInfo } from '../online/client';
import { track } from '../analytics';
import { DraftJoin } from './Draft';
import { setTheme, getTheme, setStartSkin } from './theme';
import { compAbbr } from './classic';
import { DEMONYM } from './demonyms';
import { Frame, REGION_CODE, REGION_ORDER, type Prog, type Step } from './ClassicStart';
import { regionOfNation } from './classicOptions';

const adjective = (name: string) => (getLang() === 'en' ? DEMONYM[name] ?? name : natName(name));

export function ClassicJoin({ code, onBack, onHome, setBusy }: { code: string; onBack: () => void; onHome?: () => void; setBusy: (s: string) => void }) {
  useEffect(() => { if (getTheme() !== 'retro') setTheme('retro'); }, []);
  useEffect(() => { setStartSkin(true); return () => setStartSkin(false); }, []);
  const [hist, setHist] = useState<{ stack: Step[]; i: number }>({ stack: ['name'], i: 0 });
  const step = hist.stack[hist.i];
  const go = (s: Step) => setHist((h) => ({ stack: [...h.stack.slice(0, h.i + 1), s], i: h.i + 1 }));
  const back = () => setHist((h) => (h.i > 0 ? { ...h, i: h.i - 1 } : h));
  const onHist = (d: -1 | 1) => setHist((h) => (h.i + d >= 0 && h.i + d < h.stack.length ? { ...h, i: h.i + d } : h));

  const [room, setRoom] = useState<RoomInfo | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [err, setErr] = useState('');
  const [prog, setProg] = useState<Prog | null>({ label: t('mp.connecting'), frac: 0.3 });
  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');
  const [nat, setNat] = useState(-1);
  const [region, setRegion] = useState('all');
  const [club, setClub] = useState(0);

  useEffect(() => {
    let ok = true;
    (async () => {
      try {
        const r = await fetchRoom(code);
        if (!ok) return;
        setRoom(r);
        if (r.draft) { setProg(null); return; }
        if (!r.snapshot) { setErr('not-ready'); setProg(null); return; }
        const { state: s } = await downloadSnapshot(r.snapshot);
        if (!ok) return;
        setState(s);
      } catch (e) { if (ok) setErr(String((e as Error).message)); }
      if (ok) setProg(null);
    })();
    return () => { ok = false; };
  }, [code]);

  const taken = useMemo(() => new Set(room?.players.map((p) => p.club) ?? []), [room]);
  const prep = useMemo(() => {
    if (!state) return null;
    const leagues = Object.values(state.comps).filter((c) => c.type === 'league');
    const eng = state.nations.findIndex((n) => n.name === 'England');
    const clubs = leagues.flatMap((l) => (l.clubs ?? []).map((id) => state.clubs[id]).filter(Boolean).map((c) => ({
      id: c.id, short: c.short, name: c.name, nation: c.nation, code: state.nations[c.nation]?.code ?? '',
      div: l.nation === eng && l.tier >= 1 && l.tier <= 4 ? ['PL', 'D1', 'D2', 'D3'][l.tier - 1] : compAbbr(compName(l.name)),
    }))).sort((a, b) => a.short.localeCompare(b.short));
    // nationaliteten er managerens egen (alle lande som i nyt spil) – den filtrerer ikke klubberne, som altid er rummets
    const natIds = new Set<number>([...Object.values(state.clubs).map((c) => c.nation), ...Object.values(state.comps).filter((c) => c.type === 'league').map((l) => l.nation)]);
    const nations = [...natIds].filter((i) => state.nations[i]).map((i) => {
      const key = regionOfNation(state.nations[i].name);
      return { i, label: adjective(state.nations[i].name), region: REGION_CODE[key], regionKey: key };
    }).sort((a, b) => a.label.localeCompare(b.label));
    return { clubs, nations };
  }, [state]);

  const sel = prep?.clubs.find((c) => c.id === club);
  const managerName = `${first.trim()} ${second.trim()}`.trim();
  const common = { step, version: state ? (state.econ ? '2001/02' : '2026/27') : `${t('mp.join')} ${code}`, prog, hist: { back: hist.i > 0, fwd: hist.i < hist.stack.length - 1 }, onHist, onRestart: onBack, onExit: onHome };
  const errText = err && (t(`mp.err.${err}`) !== `mp.err.${err}` ? t(`mp.err.${err}`) : err);
  const note = errText && <div className="cxs-err" role="alert">{errText}</div>;

  // draft-liga: man opretter sin egen klub (egen skærm)
  if (room?.draft && !err) return <div className="start cxl"><div className="start-box"><DraftJoin code={code} room={room} onBack={onBack} setBusy={setBusy} /></div></div>;
  if (err && !state) return <Frame {...common} step="name" title={t('cxs.title')} sub={`${t('mp.join')} ${code}`} onBack={onBack} backLabel={t('common.back')}>{note}</Frame>;
  if (!state || !prep) return <Frame {...common} step="name" title={t('cxs.title')} sub={`${t('mp.join')} ${code}`}><div className="cxs-wait">{t('mp.connecting')}</div></Frame>;

  const launch = async () => {
    if (!sel) return;
    setErr('');
    setProg({ label: t('mp.connecting'), frac: 0.4 });
    track('start_game', { mode: 'online_join', flow: 'classic' });
    try { await joinOnlineGame(code, managerName, sel.id, nat >= 0 ? nat : sel.nation); } catch (e) { setErr(String((e as Error).message)); }
    setProg(null);
  };

  if (step === 'nation') {
    return (
      <Frame {...common} title={t('cxs.title')} sub={t('cxs.selectNat')} onBack={back} onNext={() => go('team')} nextDisabled={nat < 0}>
        <div className="cxs-filter">
          <select aria-label={t('cxs.filter')} value={region} onChange={(e) => setRegion(e.target.value)} data-filter>
            <option value="all">{t('cxs.filter')}</option>
            {REGION_ORDER.map((r) => <option key={r} value={r}>{REGION_CODE[r]} – {t(`cl.region.${r}`)}</option>)}
          </select>
        </div>
        <div className="cxs-list nations">
          {prep.nations.filter((n) => region === 'all' || n.regionKey === region).map((n) => (
            <div key={n.i} className={`cxs-it ${nat === n.i ? 'sel' : ''}`} role="button" tabIndex={0} data-nat={n.label} onClick={() => setNat(n.i)} onDoubleClick={() => { setNat(n.i); go('team'); }}>
              <span className="n">{n.label}</span><span className="code">{n.region}</span>
            </div>
          ))}
        </div>
      </Frame>
    );
  }
  if (step === 'team') {
    return (
      <Frame {...common} title={t('cxs.title')} sub={`${t('cxs.selectTeam')} · ${t('mp.players')}: ${room!.players.map((p) => `${p.name} (${state.clubs[p.club]?.short ?? '?'})`).join(', ')}`} onBack={back}>
        <div className="cxs-list teams" data-teams>
          {prep.clubs.map((c) => {
            const tk = taken.has(c.id);
            return (
              <div key={c.id} className={`cxs-it ${club === c.id ? 'sel' : ''} ${tk ? 'taken' : ''}`} role="button" tabIndex={tk ? -1 : 0} aria-disabled={tk} data-club={c.short} data-taken={tk ? '1' : undefined}
                onClick={() => { if (tk) return; setClub(c.id); go('confirm'); }}>
                <span className="n">{c.short}{tk && <span className="cxs-taken">{t('mp.taken')}</span>}</span><span className="code">{c.code}</span><span className="extra">{c.div}</span>
              </div>
            );
          })}
        </div>
      </Frame>
    );
  }
  if (step === 'confirm' && sel) {
    return (
      <Frame {...common} title={managerName} sub={t('cxs.confirm')} onBack={() => go('team')} backLabel={t('common.no')} onNext={() => void launch()} nextLabel={t('mp.joinBtn')}>
        <div className="cxs-msg" data-confirm>{t('cxs.takeQ', { club: sel.name })}</div>
        {note}
      </Frame>
    );
  }
  // Enter Name
  const ok = first.trim() && second.trim();
  const submit = () => { if (ok) go('nation'); };
  return (
    <Frame {...common} step="name" title={t('cxs.title')} sub={`${t('cxs.enterName')} · ${t('mp.join')} ${code}`} onBack={onBack} backLabel={t('cxs.cancel')} onNext={submit} nextDisabled={!ok}>
      <div className="cxs-form">
        <label className="cxs-frow"><span>{t('cxs.firstName')}</span><i>:</i><input autoFocus maxLength={24} value={first} onChange={(e) => setFirst(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') document.getElementById('cxs-second')?.focus(); }} data-name="first" /></label>
        <label className="cxs-frow"><span>{t('cxs.secondName')}</span><i>:</i><input id="cxs-second" maxLength={24} value={second} onChange={(e) => setSecond(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') submit(); }} data-name="second" /></label>
      </div>
    </Frame>
  );
}
