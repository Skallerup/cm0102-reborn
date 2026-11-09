// Fælles skabelon for de statiske SEO-sider (rent HTML uden JavaScript – læses af søgemaskiner og AI-crawlere).
// Bruges af scripts/build-seo.ts (guiderne) og scripts/seo/db.ts (spiller-, klub-, liga- og landesiderne).

export const SITE = 'https://cm0102reborn.com';
export const TODAY = new Date().toISOString().slice(0, 10);

/** Titler ud over ~65 tegn skæres af i Google: drop " | CM Reborn" og derefter en sæson i parentes */
export function fitTitle(t: string): string {
  if (t.length > 65) t = t.replace(/ \| CM Reborn$/, '');
  if (t.length > 65) t = t.replace(/ \(\d{4}\/\d{2}\)/, '');
  if (t.length > 65) t = t.replace(/ & Attributes$/, '');
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

export const CTA = `<p class="cta"><a class="btn" href="/">▶ Play free in your browser</a> <span>No download · no ads · works on any device</span></p>`;

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

export const CSS = `:root{--bg:#070b16;--s:#0f1730;--l:#22305a;--t:#e8ecf6;--m:#9aa6c4;--a:#ffd23f;--b:#3b82f6;--g:#22c55e;--o:#f59e0b;--r:#ef4444}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--t);font:16px/1.6 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
a{color:#8fb8ff}header,main,footer{max-width:1040px;margin:0 auto;padding:0 16px}
header{display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center;padding-top:16px;padding-bottom:10px;border-bottom:1px solid var(--l)}
header .logo{font-weight:900;color:var(--t);text-decoration:none;font-size:20px;margin-right:auto}header nav a{font-size:14px;color:var(--m);text-decoration:none;margin-right:12px}
.crumbs{font-size:13px;color:var(--m);margin-top:14px}.crumbs a{color:var(--m)}
h1{font-size:clamp(26px,4vw,36px);line-height:1.2;margin:16px 0 10px}h2{margin-top:34px;font-size:23px}h3{font-size:18px;margin-top:22px}
.lead{font-size:18px;color:#cdd5ea}.cta{margin:22px 0;display:flex;flex-wrap:wrap;gap:10px;align-items:center}.cta span{color:var(--m);font-size:14px}
.btn{background:var(--a);color:#1b1400;font-weight:800;text-decoration:none;padding:12px 20px;border-radius:10px}
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
footer{margin-top:50px;padding-top:18px;padding-bottom:40px;border-top:1px solid var(--l);color:var(--m);font-size:14px}`;

/** fælles stylesheet (public/seo.css, skrevet af build-seo.ts) – versionen skifter, når CSS'en ændres */
const CSS_VER = (() => { let h = 0; for (const ch of CSS) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h.toString(36); })();

export function render(p: Page): string {
  const url = `${SITE}/${p.slug}`;
  const crumbs: Crumb[] = [{ name: 'CM Reborn', url: '/' }, ...(p.crumbs ?? []), { name: p.h1, url: `/${p.slug}` }];
  const modified = p.modified ?? TODAY;
  const image = p.image ?? `${SITE}/og.jpg`;
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
<link rel="stylesheet" href="/seo.css?v=${CSS_VER}" />
</head>
<body>
<header><a class="logo" href="/">CM Reborn</a><nav>${nav.map(([h, l]) => `<a href="${h}">${esc(l)}</a>`).join('')}</nav></header>
<main>
${crumbs.length > 2 ? `<nav class="crumbs" aria-label="Breadcrumb">${crumbs.slice(0, -1).map((c) => `<a href="${c.url}">${esc(c.name)}</a>`).join(' › ')}</nav>` : ''}
<h1>${esc(p.h1)}</h1>${!p.noArticle && !p.noindex ? `<p class="note">Updated ${new Date(`${modified}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}</p>` : ''}
${p.body}
${p.faq ? `<h2>${p.lang && p.lang !== 'en' ? 'FAQ' : 'Frequently asked questions'}</h2>${p.faq.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('')}` : ''}
${p.cta ?? CTA}
</main>
<footer><p>${p.footer ?? `CM Reborn is an independent, free fan project inspired by Championship Manager 01/02. It is not affiliated with Sports Interactive, SEGA or Eidos. Player data from the original CM 01/02 database (patch 3.9.68).`}</p><p>${nav.map(([h, l]) => `<a href="${h}">${esc(l)}</a>`).join(' · ')}</p><p class="note">${FOOT_GUIDES.map(([h, l]) => `<a href="${h}">${esc(l)}</a>`).join(' · ')}</p></footer>
${p.script ? `<script>${p.script}</script>` : ''}
</body>
</html>
`;
}
