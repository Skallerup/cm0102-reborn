// Originalens spejdere (CM 01/02: Scout #1–#7) i det moderne udseende: Assign Scout → Club / Next Opposition / Youth Players / Nation / Region, Recall Scout og
// spejderens resultatliste. Reglerne ligger i game/cmScoutAsg.ts (de samme som det klassiske tema bruger).
import { useState } from 'react';
import { act } from '../../game/actions';
import { cmScoutLogic } from '../../game/cmPlayerData';
import { cmAsgOf, cmAsgOn } from '../../game/cmScoutAsg';
import type { ScoutAssignment, Staff } from '../../game/types';
import { money, natName, t } from '../../i18n';
import { Panel, PlayerLink, ClubLink, posStr, Stars } from '../components';
import { askConfirm } from '../confirm';
import { useGame } from '../core';
import { cmRegionName } from '../cmScoutAsgNews';
import { age } from '../components';

type Kind = 'club' | 'nextOpp' | 'youth' | 'nation' | 'region';

function ScoutPanel({ scout, n }: { scout?: Staff; n: number }) {
  const g = useGame()!;
  const [kind, setKind] = useState<Kind>('nation');
  const [nat, setNat] = useState(g.clubs[g.userClub]?.nation ?? 0);
  const [club, setClub] = useState(0);
  const [region, setRegion] = useState(1);
  if (!scout) return <Panel title={t('cl.tr.scoutN', { n })}><div className="muted">{t('cl.sc.none', { n })}</div></Panel>;
  const cm = cmScoutLogic(g);
  const name = `${scout.first} ${scout.last}`.trim();
  const short = cm && scout.first ? `${scout.first.charAt(0)}.${scout.last}` : name;
  const a = scout.assignment;
  const targetName = (x: ScoutAssignment): string => x.kind === 'nation' ? natName(g.nations[x.target as number]?.name)
    : x.kind === 'club' ? g.clubs[x.target as number]?.name ?? '' : x.kind === 'region' ? (cm ? cmRegionName(Number(x.target)) : t(`region.${x.target}`))
    : x.kind === 'nextOpp' ? t('cl.sc.nextOpp') : x.kind === 'youth' ? t('cl.sc.youth') : '';
  const cmTab = cm ? cmAsgOf(g, scout)?.tab : undefined;
  const players = cmTab && (!a || cmAsgOn(cmAsgOf(g, scout))) ? cmTab.map((r) => g.players[r.pid]).filter(Boolean)
    : !a ? (cm ? [...(scout.watch ?? []), ...(scout.scoutList ?? [])].map((id) => g.players[id]).filter(Boolean) : []) : a.kind === 'player' ? [g.players[a.target as number]].filter(Boolean) : (a.found ?? []).map((id) => g.players[id]).filter(Boolean);
  const recMap = cmTab ? new Map(cmTab.map((r) => [r.pid, Math.max(r.ab, r.pt)])) : undefined;
  const clubs = Object.values(g.clubs).filter((c) => !g.leagues[c.league]?.hidden && c.id !== g.userClub);
  const nationIds = [...new Set(clubs.map((c) => c.nation))].filter((x) => g.nations[x]).sort((x, y) => natName(g.nations[x].name).localeCompare(natName(g.nations[y].name), t('cl.locale')));
  const nationOf = [...new Set([...nationIds, ...g.nations.map((_, i) => i).filter((i) => (g.cmNationBoard?.[i]?.[1] ?? 0) > 8)])].sort((x, y) => natName(g.nations[x].name).localeCompare(natName(g.nations[y].name), t('cl.locale')));
  const assign = async (x: Omit<ScoutAssignment, 'since' | 'found'>) => {
    // CM 01/02: Nation/Region/Youth Players/Next Opposition sættes straks (kun Club spørger)
    if (cm && x.kind !== 'club') { act({ t: 'scout', staffId: scout.id, assignment: { ...x, since: g.date, found: [] } }); return; }
    const q = cm && x.kind === 'club' ? t('cm.sc.clubQ', { club: g.clubs[x.target as number]?.short || g.clubs[x.target as number]?.name || '' }) : t('cl.sc.assignQ', { scout: name, target: targetName(x as ScoutAssignment) });
    if (!(await askConfirm(q, { title: cm ? t('cm.sc.assignTitle') : t('cl.sc.assignTitle'), colored: true }))) return;
    act({ t: 'scout', staffId: scout.id, assignment: { ...x, since: g.date, found: [] } });
  };
  const target = kind === 'club' ? club : kind === 'nation' ? nat : kind === 'region' ? region : 0;
  const clubOpts = clubs.filter((c) => c.nation === nat).sort((x, y) => y.rep - x.rep);
  const desc = a ? (cm && a.kind === 'youth' ? t('cm.sc.asgYouth', { scout: short }) : cm && a.kind === 'nextOpp' ? t('cm.sc.asgNext', { scout: short })
    : t('cl.sc.assigned', { scout: short, target: targetName(a) })) : t('cl.sc.notAssigned', { scout: name });
  return (
    <Panel title={t('cl.tr.scoutN', { n })} className="flush">
      <div className="row" style={{ padding: 10, gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <b className="grow">{desc}</b>
        {cm && a ? <button className="danger" onClick={() => act({ t: 'scout', staffId: scout.id, assignment: null })}>{t('cm.sc.recall')}</button> : <>
          <select value={kind} onChange={(e) => setKind(e.target.value as Kind)}>
            {(['club', 'nextOpp', 'youth', 'nation', 'region'] as Kind[]).map((k) => <option key={k} value={k}>{t(k === 'nextOpp' ? 'cl.sc.nextOpp' : k === 'youth' ? 'cl.sc.youth' : `cl.sc.${k}`)}</option>)}
          </select>
          {(kind === 'nation' || kind === 'club') && <select value={nat} onChange={(e) => { setNat(Number(e.target.value)); setClub(0); }}>{(kind === 'club' ? nationIds : nationOf).map((x) => <option key={x} value={x}>{natName(g.nations[x].name)}</option>)}</select>}
          {kind === 'club' && <select value={club} onChange={(e) => setClub(Number(e.target.value))}><option value={0}>-</option>{clubOpts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>}
          {kind === 'region' && <select value={region} onChange={(e) => setRegion(Number(e.target.value))}>{Array.from({ length: 14 }, (_, i) => i + 1).map((r) => <option key={r} value={r}>{cmRegionName(r)}</option>)}</select>}
          <button className="primary" disabled={kind === 'club' && !club} onClick={() => void assign({ kind, target } as Omit<ScoutAssignment, 'since' | 'found'>)}>{t('cl.sc.assign')}</button>
        </>}
      </div>
      {players.length > 0 && (
        <table className="grid">
          <thead><tr><th>{t('col.name')}</th><th>{t('col.club')}</th><th>{t('col.pos')}</th><th className="num">{t('col.age')}</th><th className="num">{t('col.value')}</th>{cm && <th>Rec</th>}</tr></thead>
          <tbody>
            {players.slice(0, 60).map((p) => (
              <tr key={p.id}><td><PlayerLink p={p} /></td><td>{p.club ? <ClubLink id={p.club} /> : t('common.free')}</td><td>{posStr(p)}</td><td className="num">{age(p)}</td><td className="num">{money(p.value)}</td>
                {cm && <td>{recMap?.has(p.id) ? <Stars range={[recMap.get(p.id)! / 2, recMap.get(p.id)! / 2]} /> : ''}</td>}</tr>
            ))}
          </tbody>
        </table>
      )}
    </Panel>
  );
}

/** Spejderne i et originalt spil: én boks pr. spejder (Scout #1–#7) */
export function OrigScouting() {
  const g = useGame()!;
  const scouts = Object.values(g.staff).filter((s) => s.club === g.userClub && s.role === 'scout');
  return <div className="col">{Array.from({ length: Math.max(1, Math.min(7, scouts.length)) }, (_, i) => <ScoutPanel key={i} scout={scouts[i]} n={i + 1} />)}</div>;
}
