// Kører scripts/news-links-audit.ts (kun med NEWS_AUDIT=1; vitest giver Vite-miljøet):
//   NEWS_AUDIT=1 node scripts/test.mjs run --dir tests tests/newsLinksAudit.test.ts --force   (AUDIT_CLUB, AUDIT_TO, WORLD kan sættes)
import { it, vi } from 'vitest';
vi.hoisted(() => { (globalThis as { window?: unknown }).window ??= { addEventListener() {}, removeEventListener() {}, location: { search: '', hostname: 'localhost', href: '' }, matchMedia: () => ({ matches: false, addEventListener() {} }) }; });
it.skipIf(!process.env.NEWS_AUDIT)('nyhedslinks-revision', { timeout: 1_800_000 }, async () => { await import('../scripts/news-links-audit'); });
