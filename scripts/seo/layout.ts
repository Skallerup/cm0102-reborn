// Fælles skabelon for de statiske SEO-sider (rent HTML uden JavaScript – læses af søgemaskiner og AI-crawlere).
// Bruges af scripts/build-seo.ts (guiderne) og scripts/seo/db.ts (spiller-, klub-, liga- og landesiderne).
// CSS'en ligger inline i hver side (≈3 KB): ingen ekstra blokerende forespørgsel før første tegning – de fleste
// besøg fra søgemaskinerne er førstegangsbesøg uden cache.

import { KOFI_URL } from '../../src/online/kofi';

export const SITE = 'https://cm0102reborn.com';

/** Støtte-linjen i sidefoden (budskabet fra sb.msg i spillet): sprog → [tekst, linktekst] */
export const SUPPORT_LINE: Record<string, [string, string]> = {
  en: ['CM Reborn is free and always will be. Donations pay for servers and further development.', 'Support on Ko-fi'],
  da: ['CM Reborn er gratis og bliver ved med at være det. Donationer betaler servere og videreudvikling.', 'Støt på Ko-fi'],
  sv: ['CM Reborn är gratis och förblir det. Donationer betalar servrar och vidareutveckling.', 'Stöd på Ko-fi'],
  nb: ['CM Reborn er gratis og forblir det. Donasjoner betaler servere og videreutvikling.', 'Støtt på Ko-fi'],
  de: ['CM Reborn ist kostenlos und bleibt es. Spenden bezahlen die Server und die Weiterentwicklung.', 'Auf Ko-fi unterstützen'],
  es: ['CM Reborn es gratis y seguirá siéndolo. Las donaciones pagan los servidores y el desarrollo futuro.', 'Apoyar en Ko-fi'],
  fr: ['CM Reborn est gratuit et le restera. Les dons financent les serveurs et le développement futur.', 'Soutenir sur Ko-fi'],
  it: ['CM Reborn è gratuito e lo resterà. Le donazioni pagano i server e lo sviluppo futuro.', 'Sostieni su Ko-fi'],
  pt: ['O CM Reborn é gratuito e sempre será. As doações pagam os servidores e o desenvolvimento futuro.', 'Apoie no Ko-fi'],
  tr: ['CM Reborn ücretsizdir ve öyle kalacak. Bağışlar sunucuları ve oyunun geliştirilmesini karşılar.', "Ko-fi'de destekle"],
};
/** Sidefodens støttelinje som HTML (sprogkode som Page.lang, fx 'pt-BR') */
export function supportHtml(lang?: string): string {
  const [txt, link] = SUPPORT_LINE[(lang ?? 'en').slice(0, 2)] ?? SUPPORT_LINE.en;
  return `<p class="support">♥ ${esc(txt)} <a href="${KOFI_URL}" rel="noopener" target="_blank">${esc(link)}</a></p>`;
}
export const TODAY = new Date().toISOString().slice(0, 10);

/** Titler ud over ~65 tegn skæres af i Google: drop " | CM Reborn" og derefter en sæson i parentes */
export function fitTitle(t: string): string {
  // brandet er "CM 01/02 Reborn" ("CM Reborn" alene kolliderer med reborn-dukker i søgningerne) – når der er plads
  if (t.endsWith(' | CM Reborn') && t.length + 6 <= 65) t = t.replace(/ \| CM Reborn$/, ' | CM 01/02 Reborn');
  if (t.length > 65) t = t.replace(/ \| CM Reborn$/, '');
  if (t.length > 65) t = t.replace(/ \(\d{4}\/\d{2}\)/, '');
  if (t.length > 65) t = t.replace(/ & Attributes$/, '');
  // "– Clubs, Best Players & Wonderkids", "– Squad & Wonderkids", "– Free Agents & Bosman 2027": det sidste led kan undværes
  if (t.length > 65) t = t.replace(/ & [^&–|]+$/, '');
  if (t.length > 65) t = t.replace(/, Best Players$/, '');
  return t;
}
/** Beskrivelser ud over ~160 tegn skæres af: kort ved et ordskifte */
export function fitDesc(d: string): string {
  if (d.length <= 160) return d;
  const cut = d.slice(0, 157);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:–-]$/, '')}…`;
}
export const esc = (s: string | number) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** url-venligt navn: "Thierry Henry" → "thierry-henry", "Bröndby IF" → "brondby-if" */
export function slugify(s: string): string {
  return s.toLowerCase().replace(/ø/g, 'o').replace(/æ/g, 'ae').replace(/å/g, 'a').replace(/ß/g, 'ss').replace(/ł/g, 'l').replace(/đ/g, 'd').replace(/ı/g, 'i')
    .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'x';
}

/** guiderne i sidefoden på alle sider (interne links) */
export const FOOT_GUIDES: [string, string][] = [
  ['/cm-01-02-match-engine/', 'How the match engine works'],
  ['/cm-01-02-attributes-explained/', 'Attributes explained'],
  ['/cm-01-02-ca-pa-explained/', 'CA and PA'],
  ['/cm-01-02-database-versions/', '3.9.60 vs 3.9.68'],
  ['/cm-01-02-tactics/', 'Tactics'],
  ['/cm-01-02/managers/', 'Managers'],
  ['/changelog/', "What's new"],
  ['/about/', 'About'],
];
export const NAV: [string, string][] = [
  ['/play-cm-01-02-online/', 'Play online'],
  ['/cm-01-02/', 'CM 01/02 database'],
  ['/cm-01-02-wonderkids/', 'Wonderkids'],
  ['/cm-01-02-best-players/', 'Best players'],
  ['/cm-01-02-guides/', 'Guides'],
  ['/2026-27/', '2026/27 database'],
  ['/faq/', 'FAQ'],
];

/** et skærmbillede fra public/landing/<sprog>/ (med mål, så siden ikke springer) – også og:image, når siden sætter `image` */
export const shotFig = (dir: string, name: string, alt: string, w = 1600, h = 1000, cls = '') => `<figure class="shot ${cls}"><img src="/landing/${dir}/${name}.webp" width="${w}" height="${h}" alt="${esc(alt)}" loading="lazy" decoding="async" /><figcaption>${esc(alt)}</figcaption></figure>`;

export const PLAY = '/?play=1';
export const PLAY_LABEL: Record<string, string> = { en: 'Play free', da: 'Spil gratis', sv: 'Spela gratis', nb: 'Spill gratis', de: 'Gratis spielen', es: 'Juega gratis', fr: 'Jouer gratuitement', it: 'Gioca gratis', pt: 'Jogue grátis', tr: 'Ücretsiz oyna' };
export const CTA = `<p class="cta"><a class="btn" href="/?play=1">▶ Play free in your browser</a> <span>No download · no ads · works on any device</span></p>`;

export interface Crumb { name: string; url: string }
export interface Page {
  /** sti uden foranstillet skråstreg, med afsluttende: "cm-01-02/players/thierry-henry/" */
  slug: string;
  title: string;
  h1: string;
  description: string;
  /** ikke i søgemaskinerne (404, flyttede sider) */
  noindex?: boolean;
  /** flyttet: send videre hertil (meta refresh – Vercel-opsætningen røres ikke) */
  redirect?: string;
  body: string;
  /** brødkrummer mellem forsiden og siden selv */
  crumbs?: Crumb[];
  faq?: [string, string][];
  /** FAQPage-data (kun på guiderne – ikke tusindvis af databasesider) */
  faqSchema?: boolean;
  list?: { name: string; items: { name: string; url?: string }[] };
  /** ekstra JSON-LD-objekter */
  ld?: unknown[];
  image?: string;
  lang?: string;
  /** hreflang-alternativer: [sprog, sti] */
  alternates?: [string, string][];
  /** sidst ændret (sitemap + Article) */
  modified?: string;
  ogType?: string;
  /** uden Article-objektet i JSON-LD (databasesiderne – sparer plads) */
  noArticle?: boolean;
  /** egen navigation (fx på andre sprog) */
  nav?: [string, string][];
  cta?: string;
  footer?: string;
  /** lille script (fx søgefeltet på databasens forside) */
  script?: string;
}

export const CSS = `:root{--bg:#070b16;--s:#0f182d;--l:#222e4f;--t:#eef2ff;--m:#8e9cc2;--a:#ffcf3f;--c:#6cd2ff;--b:#3b82f6;--g:#3ddc97;--o:#f59e0b;--r:#ff5d6c}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(1200px 600px at 85% -10%,rgba(139,123,255,.16),transparent 60%),radial-gradient(900px 500px at -10% 110%,rgba(108,210,255,.10),transparent 60%),var(--bg);background-attachment:fixed;color:var(--t);font:16px/1.6 Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;-webkit-font-smoothing:antialiased}
a{color:var(--c)}header>*,main,footer{max-width:1040px}main,footer{margin:0 auto;padding:0 16px}
header{position:sticky;top:0;z-index:5;background:rgba(7,11,22,.78);backdrop-filter:blur(14px) saturate(1.4);border-bottom:1px solid var(--l)}
header .in{display:flex;flex-wrap:wrap;gap:8px 18px;align-items:center;max-width:1040px;margin:0 auto;padding:10px 16px}
header .logo{display:flex;align-items:center;gap:8px;font-weight:900;color:var(--t);text-decoration:none;font-size:17px;white-space:nowrap}header .logo img{border-radius:6px}header .logo span{color:var(--a);font-weight:700}
header nav{margin-right:auto;display:flex;flex-wrap:wrap;gap:2px 16px}header nav a{font-size:14px;font-weight:500;color:var(--m);text-decoration:none}header nav a:hover{color:var(--t)}
.crumbs{font-size:13px;color:var(--m);margin-top:14px}.crumbs a{color:var(--m)}
h1{font-size:clamp(26px,4vw,36px);line-height:1.2;margin:16px 0 10px}h2{margin-top:34px;font-size:23px}h3{font-size:18px;margin-top:22px}
.lead{font-size:18px;color:#cdd5ea}.cta{margin:22px 0;display:flex;flex-wrap:wrap;gap:10px;align-items:center}.cta span{color:var(--m);font-size:14px}
.btn{display:inline-block;background:linear-gradient(180deg,#ffe07a,#ffc21a);color:#1b1400;font-weight:800;text-decoration:none;padding:13px 26px;border-radius:999px;box-shadow:0 0 0 1px rgba(255,207,63,.5),0 12px 34px -10px rgba(255,196,30,.75)}.btn:hover{background:linear-gradient(180deg,#ffe78f,#ffc72e)}.btn.sm{padding:8px 16px;font-size:13px;white-space:nowrap}
.cta.end{margin:44px 0 10px;padding:22px 24px;border:1px solid var(--l);border-radius:16px;background:linear-gradient(120deg,rgba(255,207,63,.08),rgba(108,210,255,.07))}
@media(max-width:760px){header nav{display:none}header .btn{margin-left:auto}}
.tw{overflow-x:auto;border:1px solid var(--l);border-radius:10px;background:var(--s)}table{border-collapse:collapse;width:100%;font-size:14.5px}
th,td{padding:7px 10px;border-bottom:1px solid var(--l);text-align:left;white-space:nowrap}th{color:var(--m);font-weight:600}td.n,th.n{text-align:right}
.note{color:var(--m);font-size:14px}ul{padding-left:20px}li{margin:4px 0}abbr{text-decoration:underline dotted;cursor:help}
.kv{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:2px 18px;background:var(--s);border:1px solid var(--l);border-radius:10px;padding:12px 16px}
.kv div{display:flex;justify-content:space-between;gap:10px;border-bottom:1px solid var(--l);padding:5px 0}.kv dt{color:var(--m)}.kv dd{margin:0;font-weight:600;text-align:right}
.attrs{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px}
.attrs section{background:var(--s);border:1px solid var(--l);border-radius:10px;padding:10px 14px}.attrs h3{margin:0 0 6px;font-size:15px;color:var(--a)}
.attrs ul{list-style:none;margin:0;padding:0}.attrs li{display:flex;justify-content:space-between;margin:0;padding:2px 0;font-size:14.5px}
.v{font-weight:800;min-width:2ch;text-align:right}.v1{color:var(--r)}.v2{color:var(--o)}.v3{color:var(--t)}.v4{color:#86efac}.v5{color:var(--g)}.vx{color:var(--m);font-style:italic;font-weight:500}
.hero{display:flex;gap:18px;align-items:center;flex-wrap:wrap}.hero img.crest{width:84px;height:84px;object-fit:contain}
.photo{width:100%;max-height:340px;object-fit:cover;border-radius:12px;border:1px solid var(--l);margin:10px 0}
.tags{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}.tags a,.tags span{background:var(--s);border:1px solid var(--l);border-radius:999px;padding:3px 11px;font-size:13.5px;text-decoration:none;color:var(--t)}
.cols{columns:3 220px;column-gap:24px}.cols a{display:block;padding:2px 0;font-size:14.5px}
.sw{display:inline-block;width:12px;height:12px;border-radius:3px;border:1px solid #fff4;vertical-align:-1px;margin-left:3px}
#q{width:100%;max-width:520px;padding:12px 14px;font-size:16px;border-radius:10px;border:1px solid var(--l);background:var(--s);color:var(--t)}#res a{display:block;padding:4px 0}
footer{margin-top:50px;padding-top:18px;padding-bottom:40px;border-top:1px solid var(--l);color:var(--m);font-size:14px}footer a{color:var(--m)}footer a:hover{color:var(--t)}
.shot{margin:18px 0}.shot img{width:100%;height:auto;border-radius:12px;border:1px solid var(--l);background:var(--s)}.shot.phone img{max-width:300px;display:block;margin:0 auto}.shot figcaption{color:var(--m);font-size:13px;margin-top:6px;text-align:center}`;


export function render(p: Page): string {
  const url = `${SITE}/${p.slug}`;
  const crumbs: Crumb[] = [{ name: 'CM Reborn', url: '/' }, ...(p.crumbs ?? []), { name: p.h1, url: `/${p.slug}` }];
  const modified = p.modified ?? TODAY;
  const image = p.image ? (p.image.startsWith('http') ? p.image : SITE + p.image) : `${SITE}/og.jpg`;
  const ld: unknown[] = [
    { '@type': 'BreadcrumbList', itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: SITE + c.url })) },
    ...(p.noArticle ? [] : [{ '@type': 'Article', headline: p.h1.slice(0, 110), description: p.description, dateModified: modified, inLanguage: p.lang ?? 'en', mainEntityOfPage: url, image, author: { '@type': 'Organization', name: 'CM Reborn', url: `${SITE}/` }, publisher: { '@type': 'Organization', name: 'CM Reborn', logo: { '@type': 'ImageObject', url: `${SITE}/icon-512.png` } } }]),
    ...(p.ld ?? []),
  ];
  if (p.faq && p.faqSchema) ld.push({ '@type': 'FAQPage', mainEntity: p.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
  if (p.list) ld.push({ '@type': 'ItemList', name: p.list.name, itemListElement: p.list.items.map((n, i) => ({ '@type': 'ListItem', position: i + 1, name: n.name, ...(n.url ? { url: SITE + n.url } : {}) })) });
  const nav = p.nav ?? NAV;
  const alt = (p.alternates ?? []).map(([l, h]) => `<link rel="alternate" hreflang="${l}" href="${SITE}${h}" />`).join('\n');
  return `<!doctype html>
<html lang="${p.lang ?? 'en'}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(fitTitle(p.title))}</title>
<meta name="description" content="${esc(fitDesc(p.description))}" />
<link rel="canonical" href="${url}" />
${alt}
<meta name="robots" content="${p.noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large'}" />${p.redirect ? `\n<meta http-equiv="refresh" content="0; url=${p.redirect}" />` : ''}
<meta name="theme-color" content="#070b16" />
<meta property="og:type" content="${p.ogType ?? 'article'}" />
<meta property="og:site_name" content="CM Reborn" />
<meta property="og:title" content="${esc(p.title)}" />
<meta property="og:description" content="${esc(fitDesc(p.description))}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${image}" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="icon" type="image/svg+xml" href="/icon.svg" />
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': ld }).replace(/</g, '\\u003c')}</script>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800;900&display=swap" media="print" onload="this.media='all'" />
<style>${CSS}</style>
</head>
<body>
<header><div class="in"><a class="logo" href="/"><img src="/icon.svg" width="26" height="26" alt=""><b>CM</b> <span>Reborn</span></a><nav>${nav.map(([h, l]) => `<a href="${h}">${esc(l)}</a>`).join('')}</nav><a class="btn sm" href="${PLAY}">${PLAY_LABEL[(p.lang ?? 'en').slice(0, 2)] ?? PLAY_LABEL.en}</a></div></header>
<main>
${crumbs.length > 2 ? `<nav class="crumbs" aria-label="Breadcrumb">${crumbs.slice(0, -1).map((c) => `<a href="${c.url}">${esc(c.name)}</a>`).join(' › ')}</nav>` : ''}
<h1>${esc(p.h1)}</h1>${!p.noArticle && !p.noindex ? `<p class="note">Updated ${new Date(`${modified}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}</p>` : ''}
${p.body}
${p.faq ? `<h2>${p.lang && p.lang !== 'en' ? 'FAQ' : 'Frequently asked questions'}</h2>${p.faq.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('')}` : ''}
${(p.cta ?? CTA).replace('class="cta"', 'class="cta end"')}
</main>
<footer><p>${p.footer ?? `CM Reborn is an independent, free fan project based on Championship Manager 01/02 – with the original database, match engine and rules, ported to the browser. It is not affiliated with Sports Interactive, SEGA or Eidos. Player data from the original CM 01/02 database (patch 3.9.68).`}</p>${supportHtml(p.lang)}<p>${nav.map(([h, l]) => `<a href="${h}">${esc(l)}</a>`).join(' · ')}</p><p class="note">${FOOT_GUIDES.map(([h, l]) => `<a href="${h}">${esc(l)}</a>`).join(' · ')}</p></footer>
${p.script ? `<script>${p.script}</script>` : ''}
</body>
</html>
`;
}
