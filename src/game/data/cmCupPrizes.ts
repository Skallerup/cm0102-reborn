// GENERERET af ~/cm0102-engine/tools/sched/gen_cup_prizes.py – ret ikke i hånden.
// Cup::pay_round_prize_money 0x522240: rundepostens +0x60/+0x64 (vinderens/taberens præmie; −1 = andel af puljen) og puljen cup +0x28
// (klassens konstruktør; spilstarten 0x830520 – puljen fyldes aldrig op igen).
export interface CmCupPrize { fund: number; prize: [number, number][]; years?: Record<number, [number, number][]> }
export const CM_CUP_PRIZES: Record<string, CmCupPrize> = {
  ENG: { fund: 2000000, prize: [[10000,0],[20000,0],[20000,0],[30000,0],[50000,0],[75000,0],[150000,0],[400000,0],[2000000,1000000]] }, // EngFaCup (+0x28 sat 0x56f134)
  ENG_LC: { fund: 1000000, prize: [[-1,0],[-1,0],[-1,0],[-1,0],[-1,0],[-1,0],[-1,0]] }, // EngCcCup (+0x28 sat 0x56c384)
  ENG_CS: { fund: 300000, prize: [[0,0]] }, // EngCharity (+0x28 sat 0x56d452)
  SCO: { fund: 1000000, prize: [[3000,0],[-1,0],[6000,0],[10000,0],[20000,0],[70000,0],[150000,0]] }, // ScoFaCup (+0x28 sat 0x7ed3e2)
  GER: { fund: 1000000, prize: [[-1,0],[-1,0],[-1,0],[-1,0],[-1,0],[-1,0]] }, // GerCup (+0x28 sat 0x5d8cf2)
  FRA: { fund: 1000000, prize: [[0,0],[0,0],[0,0],[0,0],[0,0],[0,100000],[0,200000],[0,400000],[1000000,800000]] }, // FraCup (+0x28 sat 0x5ba202)
  SPA: { fund: 1000000, prize: [[-1,0],[-1,0],[-1,0],[-1,0],[-1,0],[-1,0],[-1,0]] }, // SpaCup (+0x28 sat 0x84d036)
  POR: { fund: 800000, prize: [[-1,0],[-1,0],[-1,0],[-1,0],[-1,0],[-1,0],[-1,0],[-1,0]] }, // PorCup (+0x28 sat 0x7cda4a)
  BEL: { fund: 800000, prize: [[0,0],[0,0],[0,0],[-1,0],[-1,0],[-1,0],[-1,0],[-1,0]] }, // BelFaCup (+0x28 sat 0x41d122)
  TUR: { fund: 600000, prize: [[-1,0],[-1,0],[-1,0],[0,3000],[-1,0],[-1,0],[-1,0]] }, // TurCup (+0x28 sat 0x8fc482)
  RUS: { fund: 800000, prize: [[-1,0],[-1,0],[-1,0],[-1,0],[-1,0],[-1,0]] }, // RusCup (+0x28 sat 0x7e9300)
  NOR: { fund: 800000, prize: [[-1,0],[-1,0],[-1,0],[-1,0],[-1,0],[-1,0],[-1,0]] }, // NorCup (+0x28 sat 0x78f0f2)
  SWE: { fund: 800000, prize: [[-1,0],[-1,0],[-1,0],[-1,0],[-1,0],[-1,0]] }, // SweCup (+0x28 sat 0x88ccb1)
  DEN: { fund: 800000, prize: [[-1,0],[-1,0],[-1,0],[-1,0],[-1,0],[-1,0],[-1,0],[-1,0]] }, // DenCup (+0x28 sat 0x550a7a)
  CRO: { fund: 100000, prize: [[-1,0],[-1,0],[-1,0],[-1,0],[-1,0],[-1,0]] }, // CroCup (+0x28 sat 0x517552)
  POL: { fund: 600000, prize: [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[500000,0]] }, // PolCup (+0x28 sat 0x7c7e52)
  KOR: { fund: 200000, prize: [[-1,0],[-1,0],[-1,0],[-1,0],[-1,0]] }, // KorFaCup (+0x28 sat 0x66a52a)
  JAP: { fund: 7000000, prize: [[-1,0],[-1,0],[-1,0],[-1,0],[-1,0],[-1,0],[-1,0]] }, // JapEmpCup (+0x28 sat 0x661e02)
  BRA: { fund: 500000, prize: [[-1,0],[-1,0],[-1,0],[-1,0],[-1,0],[-1,0],[1000000,800000]] }, // BraCup (+0x28 sat 0x427509)
  USA: { fund: 1000000, prize: [[-1,0],[-1,0],[-1,0],[-1,0],[-1,0]] }, // UsaOpenCup (+0x28 sat 0x90af7a)
};
