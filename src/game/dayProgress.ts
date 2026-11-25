// Fremdriftsmeldinger fra en dags beregning (Continue Game): sættes kun af ui/dayWorker.ts. Rører hverken spillet eller tilfældighederne –
// kaldene står mellem dagens faser og ændrer ikke rækkefølgen (2001-fingeraftrykket er uændret).
export type DayPhase = 'daily' | 'transfers' | 'contracts' | 'finance' | 'market' | 'news' | 'matches';
export const DAY_PROGRESS: { cb?: (frac: number, phase: DayPhase, i?: number, n?: number) => void } = {};
/** frac = brøkdelen af dagen (0..1), phase = hvad der sker (tekst: cl.run.ph.<phase>), i/n = tæller (kampe) */
export const dayProg = (frac: number, phase: DayPhase, i?: number, n?: number): void => { DAY_PROGRESS.cb?.(frac, phase, i, n); };
