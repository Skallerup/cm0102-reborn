// Kører scripts/news-bodies.ts (kun med NEWS_BODIES=1; vitest giver Vite-miljøet): spiller et forløb og viser nyhedstyperne uden brødtekst.
//   NEWS_BODIES=1 [MODE=authentic] [DAYS=180] [WORLD=…] [CLUB=…] node scripts/test.mjs run --dir tests tests/newsBodiesAudit.test.ts --force
import { it, vi } from 'vitest';
vi.hoisted(() => { (globalThis as { window?: unknown }).window ??= { addEventListener() {}, removeEventListener() {}, location: { search: '', hostname: 'localhost', href: '' }, matchMedia: () => ({ matches: false, addEventListener() {} }) }; });
it.skipIf(!process.env.NEWS_BODIES)('nyheder uden brødtekst', { timeout: 1_800_000 }, async () => { await import('../scripts/news-bodies'); });
