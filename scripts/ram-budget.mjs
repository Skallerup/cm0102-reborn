#!/usr/bin/env node
// RAM-budgettet på Mac mini'en (16 GB, ejerens ønske 17/11): Chrome bruger 3–4 GB, så når Chrome er lukket, er der plads til mere.
//   node scripts/ram-budget.mjs        → status: Chrome tændt/lukket, ledig RAM, antal tunge pladser og vitest-workers
// Bruges af scripts/measure.mjs (antal tunge målinger ad gangen) og vite.config.ts (vitest-workers lokalt).
//   Chrome tændt:                       2 tunge målinger, 3 vitest-workers (som før)
//   Chrome lukket og ≥ 6 GB ledig:      3 tunge målinger, 5 vitest-workers
// MEASURE_SLOTS=n / CM_TEST_WORKERS=n overstyrer.
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

export function chromeRunning() {
  if (process.platform !== 'darwin') return false;
  try { execFileSync('pgrep', ['-x', 'Google Chrome'], { stdio: 'ignore' }); return true; } catch { return false; }
}

/** ledig RAM i bytes: frie + inaktive + spekulative sider (vm_stat – os.freemem() tæller kun de helt frie på macOS) */
export function availableBytes() {
  if (process.platform !== 'darwin') return os.freemem();
  try {
    const t = execFileSync('vm_stat', { encoding: 'utf8' });
    const size = Number(/page size of (\d+)/.exec(t)?.[1] ?? 16384);
    const pages = (k) => Number(new RegExp(`Pages ${k}:\\s+(\\d+)`).exec(t)?.[1] ?? 0);
    return (pages('free') + pages('inactive') + pages('speculative')) * size;
  } catch { return os.freemem(); }
}

export function ramBudget() {
  const chrome = chromeRunning();
  const avail = availableBytes();
  const roomy = !chrome && avail >= 6e9;
  return {
    chrome, avail,
    heavySlots: Number(process.env.MEASURE_SLOTS) || (roomy ? 3 : 2),
    testWorkers: Number(process.env.CM_TEST_WORKERS) || (roomy ? 5 : 3),
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const b = ramBudget();
  console.log(`Chrome ${b.chrome ? 'tændt' : 'lukket'} · ledig RAM ${(b.avail / 1e9).toFixed(1)} GB · tunge målinger ad gangen ${b.heavySlots} · vitest-workers ${b.testWorkers}`);
}
