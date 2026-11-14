// Originalens forkørsel ved nyt spil (0x5cc850, kaldt fra create_game): fra databasens dato (1/1 i startåret) til spillets start [0xdd6ec8]
// (England: 14/7-2001 – cmCalendar.ts) kører spillet sine daglige systemer uden menneskets indgreb. Afkodet helt i
// ~/cm0102-engine/notes/calendar-prerun.md; rækkefølgen pr. dag:
//   for tidspunkt 0..2:  MATCH_DAY 0x6b3c10/0x6b4360 (dagens kampe) · FIXTURE_MANAGER 0x5aaf00 · Staff_Records 0x86dda0 ·
//                        turneringerne vtbl+0x14(dato, 0) · CONTRACT_MANAGER::daily_update 0x4c7ac0(dato, tidspunkt, 1)
//   ved tidspunkt 2 også: alderen 0x53ab90 · vejret 0x922ee0 · Discipline 0x556240 · Injury 0x62b7b0 · UefaSeeding 0x9035a0(1) ·
//                        AWARD_MANAGER 0x413540 · turneringerne vtbl+0x14(dato, 1) · 0x5aaf00 · HostCountry 0x5fa850 · sæsonpassagen 0x5d5ae0 ·
//                        landskoefficienterne 0x5d5f20 · NationalTeams 0x76b100 · FinanceTable 0x59b9c0 · OfficialsManager 0x79bf40 ·
//                        MANAGER_MANAGER 0x68f9c0 · Stadium 0x85b820
//   så Club_Records 0x448e30, dagskiftet og [0x9b5980]-nyheden 0x58a890.
// Efter løkken: [0xae2cfc] = 2, Shortlist_Manager 0x83a1b0 (trupplanen – newgame.ts cmSquadPlanStart), player_setup.cfg 0x7a30c0 og
// Injury::init_squad_fitness 0x62a920 (cmFitnessGame.ts).
// IKKE i forkørslen (0x5cc850's kald, kontrolleret): 0x5ce2d0 (den daglige staffopdatering: moral, staffState, kontrakt +0x44/+0x45, udvikling,
// sprog), 0x5ce0b0, game_update_squad_relationships 0x5d6d10 (forholdene), 0x5cccd0's planlægger og træningens ugetæller – derfor ændrer
// forkørslen hverken moralen (sub_535a80: 10), forholdene (databasens) eller udviklingen; staffState stiger kun af ferie-/skadedagene
// (0x62c680/0x62d250 i Injury 0x62b7b0).
//
// Trinnet 'matches' er koblet af cmPrerunMatches.ts (Oceaniens VM-kvalifikation, Copa América, Intertoto, CL's 1. kvalifikationsrunde).
// Modulet kører trinene i originalens rækkefølge; de porterede systemer melder sig med registerPrerun (konditionsmodulet: 'injury'). De andre
// porteringer (kontrakterne 0x4c7ac0, økonomien 0x59b9c0, managerne 0x68f9c0 …) kan koble sig på samme sted – et trin uden port gør intet.
// Kun den originale database i ægte tilstand.
import type { GameState } from './types';

/** forkørslens trin (pr. dag, i originalens rækkefølge) */
export type PrerunStage =
  | 'matches' | 'fixtures' | 'staffRecords' | 'comps0' | 'contract'                         // pr. tidspunkt 0..2
  | 'ageing' | 'weather' | 'discipline' | 'injury' | 'uefaSeeding' | 'awards' | 'comps1' | 'fixtures2' | 'hostCountry'
  | 'seasonPass' | 'coefficients' | 'nationalTeams' | 'finance' | 'officials' | 'managers' | 'stadium'   // kun tidspunkt 2
  | 'clubRecords';                                                                            // efter tidspunkterne
const SLOT_STAGES: PrerunStage[] = ['matches', 'fixtures', 'staffRecords', 'comps0', 'contract'];
const LATE_STAGES: PrerunStage[] = ['ageing', 'weather', 'discipline', 'injury', 'uefaSeeding', 'awards', 'comps1', 'fixtures2', 'hostCountry',
  'seasonPass', 'coefficients', 'nationalTeams', 'finance', 'officials', 'managers', 'stadium'];

/** et trin: (spillet, dagnummer (dage siden 1/1-1970), ISO-datoen, tidspunktet 0..2) */
export type PrerunStep = (g: GameState, day: number, iso: string, slot: number) => void;
const steps = new Map<PrerunStage, PrerunStep[]>();

/** et porteret system melder sig til et trin (flere på samme trin kører i tilmeldingsrækkefølge) */
export function registerPrerun(stage: PrerunStage, step: PrerunStep): void {
  const a = steps.get(stage) ?? [];
  if (!a.includes(step)) a.push(step);
  steps.set(stage, a);
}

const isoOf = (day: number) => new Date(day * 86400000).toISOString().slice(0, 10);
const run = (stage: PrerunStage, g: GameState, day: number, iso: string, slot: number) => { for (const f of steps.get(stage) ?? []) f(g, day, iso, slot); };

/** 0x5cc850's løkke over dagene [from, to) (dagnumre) – g.date står på spillets startdato hele vejen (originalens [0xae2c90] er forkørslens dato:
 *  trinene får den som argument) */
export function runPrerun(g: GameState, from: number, to: number): void {
  for (let d = from; d < to; d++) {
    const iso = isoOf(d);
    for (let slot = 0; slot <= 2; slot++) {
      for (const s of SLOT_STAGES) run(s, g, d, iso, slot);
      if (slot === 2) for (const s of LATE_STAGES) run(s, g, d, iso, slot);
    }
    run('clubRecords', g, d, iso, 2);
  }
}
