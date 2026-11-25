// Menneskets managers ikke-spillerpost (staff +0x69) – delt af hukommelserne (cmWageGame/cmSlMem/cmValueGame) og bestyrelsens person
// (cmBoardGame.ts humanPerson). Omdømmet +8/+0xa/+0xc og +0x59 kommer fra ManagerProfile (cmRep/cmB59), resten er postens faste bytes.

/** menneskets managers ikke-spillerpost +0x00..+0x22 i oraklet (14/7-2001: CA 3, PA 151, omdømmet 4410/5282/4582, de 21 egenskaber fra +0x0e) */
export const HUMAN_NP = [183, 8, 0, 0, 3, 0, 151, 0, 58, 17, 162, 20, 230, 17, 1, 8, 246, 241, 4, 10, 9, 9, 2, 241, 10, 10, 11, 251, 3, 3, 246, 10, 3, 246, 4];

/** postens s16 +4 (CA) og +6 (PA) */
export const HUMAN_NP_CA = HUMAN_NP[4] | (HUMAN_NP[5] << 8), HUMAN_NP_PA = HUMAN_NP[6] | (HUMAN_NP[7] << 8);
/** postens s8 ved +off (egenskaberne +0x0e..+0x22; uden for posten 0) */
export const humanNpByte = (off: number): number => { const v = HUMAN_NP[off] ?? 0; return (v << 24) >> 24; };
