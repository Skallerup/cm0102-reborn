export function chromeRunning(): boolean;
export function availableBytes(): number;
export function ramBudget(): { chrome: boolean; avail: number; heavySlots: number; testWorkers: number };
