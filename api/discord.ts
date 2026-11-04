// Discord-bot (interaktioner): /top, /hall og /player <navn>. Discord sender kommandoerne hertil og kræver,
// at hver forespørgsel er signeret med appens offentlige nøgle (DISCORD_PUBLIC_KEY, Ed25519).
// Kommandoerne registreres én gang med scripts/discord-register.mjs.
import { Redis } from '@upstash/redis';
import { SITE } from './_lib/discord';

const redis = new Redis({ url: process.env.KV_REST_API_URL!, token: process.env.KV_REST_API_TOKEN! });
const reply = (content: string) => new Response(JSON.stringify({ type: 4, data: { content: content.slice(0, 1990), allowed_mentions: { parse: [] } } }), { headers: { 'content-type': 'application/json' } });
const hex = (h: string) => Uint8Array.from(h.match(/.{1,2}/g) ?? [], (b) => parseInt(b, 16));

async function verified(req: Request, raw: string): Promise<boolean> {
  const key = process.env.DISCORD_PUBLIC_KEY, sig = req.headers.get('x-signature-ed25519'), ts = req.headers.get('x-signature-timestamp');
  if (!key || !sig || !ts) return false;
  try {
    const k = await crypto.subtle.importKey('raw', hex(key), { name: 'Ed25519' }, false, ['verify']);
    return await crypto.subtle.verify('Ed25519', k, hex(sig), new TextEncoder().encode(ts + raw));
  } catch { return false; }
}

// spillerdatabasen (2026/27) caches i funktionens hukommelse mellem kald
type World = { playerFields: string[]; players: unknown[][]; clubs: [number, string, string, number, ...unknown[]][]; nations: { name: string }[]; ratings: Record<number, { ca: number; pa: number }> };
let world: Promise<World> | null = null;
const loadWorld = () => (world ??= fetch(`${SITE}/data/world.json`).then((r) => r.json() as Promise<World>));

export async function POST(request: Request) {
  const raw = await request.text();
  if (!(await verified(request, raw))) return new Response('invalid signature', { status: 401 });
  const body = JSON.parse(raw) as { type: number; data?: { name: string; options?: { name: string; value: string }[] } };
  if (body.type === 1) return new Response(JSON.stringify({ type: 1 }), { headers: { 'content-type': 'application/json' } }); // PING
  const cmd = body.data?.name;

  if (cmd === 'top') {
    const raw2 = (await redis.zrange<string[]>('lb:career', 0, 4, { rev: true, withScores: true })) ?? [];
    const lines: string[] = [];
    for (let i = 0; i + 1 < raw2.length; i += 2) {
      const c = await redis.hgetall<Record<string, string>>(`career:${raw2[i]}`);
      lines.push(`**${i / 2 + 1}.** ${c?.name ?? '?'} – ${c?.club ?? ''} · ${raw2[i + 1]} p`);
    }
    return reply(lines.length ? `🏆 **Karriere-ranglisten**\n${lines.join('\n')}\n${SITE}` : 'Ranglisten er tom endnu.');
  }
  if (cmd === 'hall') {
    const ids = (await redis.zrange<string[]>('hall:new', 0, 4, { rev: true })) ?? [];
    const rows = await Promise.all(ids.map((id) => redis.hmget<Record<string, string>>(`hall:${id}`, 'title', 'manager', 'club', 'stars')));
    const lines = rows.map((r, i) => (r ? `• **${r.title}** – ${r.manager} (${r.club}) ⭐ ${r.stars ?? 0} · ${SITE}/?hall=${ids[i]}` : '')).filter(Boolean);
    return reply(lines.length ? `📜 **Seneste karrierer i Hall of Fame**\n${lines.join('\n')}` : 'Ingen delte karrierer endnu.');
  }
  if (cmd === 'player') {
    const q = String(body.data?.options?.find((o) => o.name === 'name')?.value ?? '').trim().toLowerCase();
    if (q.length < 3) return reply('Skriv mindst 3 bogstaver af navnet.');
    const w = await loadWorld();
    const F = Object.fromEntries(w.playerFields.map((f, i) => [f, i]));
    const clubs = new Map(w.clubs.map((c) => [c[0], c[1]]));
    const hits = w.players.filter((p) => `${p[F.first]} ${p[F.last]}`.toLowerCase().includes(q)).slice(0, 5);
    if (!hits.length) return reply(`Ingen spillere fundet for "${q}".`);
    const stars = (v: number) => '★'.repeat(Math.max(1, Math.min(5, Math.round(v / 40)))) ;
    return reply(hits.map((p) => {
      const r = w.ratings[p[F.id] as number];
      const age = new Date().getFullYear() - Number(String(p[F.dob]).slice(0, 4));
      return `**${`${p[F.first]} ${p[F.last]}`.trim()}** · ${p[F.pos]} · ${age} år · ${w.nations[p[F.nation] as number]?.name ?? ''} · ${clubs.get(p[F.club] as number) ?? 'Uden klub'}${r ? ` · evne ${stars(r.ca)} potentiale ${stars(r.pa)}` : ''}`;
    }).join('\n'));
  }
  return reply('Ukendt kommando.');
}
