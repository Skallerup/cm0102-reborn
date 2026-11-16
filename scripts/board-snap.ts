// Skriver alle bestyrelsestekster på et sprog som JSON (til sammenligning før/efter en ændring): npx tsx scripts/board-snap.ts <sprog> <fil>
import * as fs from 'node:fs';
(globalThis as { window?: unknown }).window ??= { addEventListener() {}, removeEventListener() {}, location: { search: '', hostname: 'localhost', href: '' }, matchMedia: () => ({ matches: false, addEventListener() {} }) };
const lang = (process.argv[2] ?? 'en') as 'en';
const { ensureLang, setLang } = await import('../src/i18n');
const BT = await import('../src/game/cmBoardText');
const BG = await import('../src/game/cmBoardGame');
await ensureLang(lang);
setLang(lang);
const out: string[] = [];
for (const f of [0x400, 0x2, 0x85, 0x30, 0x308, 0x1, 0x401, 0x101, 0x402, 0x102, 0x4, 0x404, 0x104, 0x8, 0x408, 0x108, 0x40, 0x440, 0x140, 0x10, 0x410, 0x110, 0x20, 0x420, 0x120, 0x800, 0x7ff])
  for (const ne of [false, true]) for (const ap of [false, true]) out.push(BT.expectTitle(f), BT.expectBody('Vejle Boldklub', f, ne, ap));
out.push(BT.expectTitle(0, true), BT.confidenceTitle());
for (let req = 0; req <= 8; req++) { out.push(BT.requestTitle(req)); for (let code = 0; code < 14; code++) out.push(BT.requestReply('Vejle Boldklub', req, code)); out.push(BT.ultimatumConfirm('Vejle', req)); }
for (let type = 1; type <= 3; type += 2) for (let req = 1; req <= 4; req++) for (let sub = 1; sub <= 4; sub++) for (const res of [1, 2, 3, 4]) {
  out.push(BT.ultimatumTitle(type, req, res, 'Vejle'), BT.ultimatumBody(type, req, sub, 'Vejle Boldklub', 'Martin Skallerup', 'Vejle Stadion', true, true), BT.ultimatumBody(type, req, sub, 'Vejle Boldklub', 'Thomas Ibrahimovic', 'Vejle Stadion', false, false));
}
const base = { club: 'Vejle Boldklub', days: 100, wealth: 0, leagueBand: 3, confBand: 3, runType: 1, runLen: 3, arrogDays: 9999, conf: 5000, fans: 0 };
for (const days of [10, 40, 100]) for (const wealth of [-2, 0, 2]) for (const leagueBand of [0, 3, 6]) for (const confBand of [0, 3, 6]) for (const runType of [1, 3, 5])
  out.push(BT.confidenceText({ ...base, days, wealth, leagueBand, confBand, runType, runLen: 4 }));
for (const conf of [9600, 9000, 7000, 5000, 4000, 3600, 3000]) for (const fans of [-800, -600, 0, 1600]) for (const arrogDays of [10, 9999]) {
  out.push(BT.confidenceText({ ...base, conf, fans, arrogDays }), BT.confidenceText({ ...base, conf, fans, arrogDays, national: 'English' }));
}
out.push(BG.appointBody('Vejle', 'Martin Skallerup', 'AGF'), BG.appointBody('Vejle', 'Martin Skallerup', ''));
fs.writeFileSync(process.argv[3], JSON.stringify(out));
console.log(lang, out.length);
