// Alle ændringer en manager kan lave, som serialiserbare handlinger.
// Singleplayer: anvendes direkte. Online: anvendes lokalt med det samme (optimistisk) og sendes
// til serveren, hvor den manager der simulerer næste træk, afspiller dem i rækkefølge.
import { acceptJob, applyForJob, requestBudget, requestProject } from './board';
import { activate, emptySlot, withHuman } from './humans';
import { takeOverClub } from './newgame';
import { initKnowledge } from './scouting';
import { fireStaff, hireStaff } from './staff';
import { interact, talkToPlayer, teamTalk, type TalkKind } from './personality';
import { chooseSponsor } from './finance';
import { applyPress, type Tone } from './press';
import { addNews, gs, notify } from './state';
import {
  acceptCounter, loanOut, makeBid, negotiate, releasePlayer, renewContract, respondToOffer, setListPrice, startPreContract, toggleListed,
} from './transfers';
import type { ScoutAssignment, Tactic, TransferOffer } from './types';

export type Action =
  | { t: 'tactic'; tactic: Tactic }
  | { t: 'savedTactics'; list: Tactic[] }
  | { t: 'training'; pid: number; key: string }
  | { t: 'trainingAll'; key: string }
  | { t: 'listed'; pid: number; price?: number | null }
  | { t: 'notes'; pid: number; text: string }
  | { t: 'release'; pid: number }
  | { t: 'loanOut'; pid: number; club: number; share: number; fee: number }
  | { t: 'bid'; pid: number; fee: number; loan: boolean }
  | { t: 'preContract'; pid: number }
  | { t: 'shortlist'; pid: number; on: boolean }
  | { t: 'scout'; staffId: number; assignment: ScoutAssignment | null }
  | { t: 'negotiate'; pid: number; wage: number; years: number }
  | { t: 'renew'; pid: number; wage: number; years: number }
  | { t: 'respond'; pid: number; buyer: number; action: 'accept' | 'reject' | 'counter'; counter?: number }
  | { t: 'acceptCounter'; pid: number }
  | { t: 'withdraw'; pid: number }
  | { t: 'hireStaff'; id: number }
  | { t: 'fireStaff'; id: number }
  | { t: 'budget'; kind: 'transfer' | 'wage' }
  | { t: 'project'; kind: 'stadium' | 'training' | 'youth' }
  | { t: 'talk'; pid: number; choice: 'promise' | 'list' | 'refuse' }
  | { t: 'interact'; pid: number; kind: TalkKind }
  | { t: 'teamTalk'; kind: 'praise' | 'criticise' | 'demand' | 'calm' }
  | { t: 'sponsor'; kind: 'safe' | 'bonus' | 'ambitious' }
  | { t: 'ticket'; price: number }
  | { t: 'read'; ids: number[] | 'all' }
  | { t: 'acceptJob'; club: number }
  | { t: 'applyJob'; club: number }
  | { t: 'declineJob'; club: number }
  | { t: 'join'; name: string; club: number; nation: number }
  | { t: 'press'; answers: { topic: string; tone: Tone }[]; headline?: string; body?: string };

const ACTIVE: TransferOffer['status'][] = ['pending', 'negotiating', 'countered'];

/** Find det aktive tilbud hvor den aktive manager er køber */
function myOffer(pid: number): TransferOffer | undefined {
  const g = gs();
  return g.offers.slice().reverse().find((o) => o.player === pid && o.buyer === g.userClub && ACTIVE.includes(o.status));
}

/** Anvend en handling for den aktive manager. Returnerer et resultat til UI'et. */
export function applyAction(a: Action): unknown {
  const g = gs();
  const club = g.clubs[g.userClub];
  switch (a.t) {
    case 'tactic': g.tactic = a.tactic; return 'ok';
    case 'savedTactics': g.savedTactics = a.list; return 'ok';
    case 'training': { const p = g.players[a.pid]; if (p?.club === g.userClub) p.training = a.key; return 'ok'; }
    case 'trainingAll': for (const p of Object.values(g.players)) if (p.club === g.userClub && g.userClub) p.training = a.key; return 'ok';
    case 'listed':
      if (g.players[a.pid]?.club !== g.userClub) return 'error';
      if (a.price === undefined) toggleListed(a.pid);
      else setListPrice(a.pid, a.price);
      return 'ok';
    case 'notes': { const p = g.players[a.pid]; if (p) p.notes = a.text; return 'ok'; }
    case 'release': releasePlayer(a.pid); return 'ok';
    case 'loanOut': return loanOut(a.pid, a.club, a.share, a.fee);
    case 'bid': return makeBid(a.pid, a.fee, a.loan);
    case 'preContract': return startPreContract(a.pid);
    case 'shortlist':
      g.shortlist = g.shortlist.filter((x) => x !== a.pid);
      if (a.on) g.shortlist.push(a.pid);
      return 'ok';
    case 'scout': { const s = g.staff[a.staffId]; if (s && s.club === g.userClub) s.assignment = a.assignment; return 'ok'; }
    case 'negotiate': { const o = myOffer(a.pid); return o ? negotiate(o.id, a.wage, a.years) : 'refused'; }
    case 'renew': return renewContract(a.pid, a.wage, a.years);
    case 'respond': {
      const o = g.offers.slice().reverse().find((x) => x.player === a.pid && x.buyer === a.buyer && x.seller === g.userClub && x.status === 'pending');
      if (o) respondToOffer(o.id, a.action, a.counter);
      return 'ok';
    }
    case 'acceptCounter': { const o = myOffer(a.pid); return o ? acceptCounter(o.id) : 'error'; }
    case 'withdraw': { const o = myOffer(a.pid); if (o) o.status = 'withdrawn'; return 'ok'; }
    case 'hireStaff': return hireStaff(a.id);
    case 'fireStaff': return fireStaff(a.id);
    case 'budget': return requestBudget(a.kind);
    case 'project': return requestProject(a.kind);
    case 'talk': return talkToPlayer(a.pid, a.choice);
    case 'interact': return interact(a.pid, a.kind);
    case 'teamTalk': return teamTalk(a.kind);
    case 'sponsor': return chooseSponsor(a.kind);
    case 'ticket': if (club) club.ticketPrice = Math.max(1, Math.round(a.price * 100) / 100); return 'ok';
    case 'read':
      for (const n of g.news) if (a.ids === 'all' || a.ids.includes(n.id)) n.read = true;
      return 'ok';
    case 'acceptJob': if (g.jobOffers.includes(a.club) && g.clubs[a.club]?.manager === 0) acceptJob(a.club); return 'ok';
    case 'applyJob': return applyForJob(a.club);
    case 'declineJob': g.jobOffers = g.jobOffers.filter((x) => x !== a.club); return 'ok';
    case 'join': return 'ok'; // håndteres af applyActionAs
    case 'press': return applyPress(a.answers, a.headline, a.body);
  }
}

/** Anvend en handling som en bestemt menneskelig manager (bruges når et træk afvikles) */
export function applyActionAs(pid: string, a: Action): unknown {
  const g = gs();
  if (a.t === 'join') {
    if (!g.humans || g.humans.some((h) => h.pid === pid)) return 'exists';
    const club = g.clubs[a.club];
    if (!club || club.manager === -1) return 'taken';
    g.humans.push(emptySlot(pid, a.name, a.nation));
    return withHuman(pid, () => {
      takeOverClub(club);
      initKnowledge();
      addNews({ cat: 'general', key: 'news.welcome', params: { manager: a.name, club: club.name } });
      addNews({ cat: 'general', key: 'mp.joined', params: { manager: a.name, club: club.name } }, { all: true });
      return 'ok';
    });
  }
  if (!g.humans?.some((h) => h.pid === pid)) return 'unknown';
  return withHuman(pid, () => applyAction(a));
}

// ---------- dispatch fra UI ----------

type Sink = (a: Action) => void;
let sink: Sink | null = null;

/** Online-laget registrerer her, hvor handlinger skal sendes hen */
export function setActionSink(s: Sink | null) {
  sink = s;
}

/** Brug denne fra UI'et i stedet for at ændre spiltilstanden direkte */
export function act<T = unknown>(a: Action): T {
  const g = gs();
  if (g.humans && g.active) activate(g.active, g);
  const r = applyAction(a) as T;
  sink?.(a);
  notify();
  return r;
}
