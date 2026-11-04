// Fælles: post en besked i fællesskabets Discord-kanal via en webhook (DISCORD_WEBHOOK_URL).
// Uden webhooken gør den ingenting. Filen ligger i api/_lib, så Vercel ikke laver en funktion af den.
export async function postDiscord(content: string, embed?: { title: string; description?: string; url?: string; color?: number }) {
  const hook = process.env.DISCORD_WEBHOOK_URL;
  if (!hook) return;
  try {
    await fetch(hook, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ content: content.slice(0, 1900), allowed_mentions: { parse: [] }, ...(embed ? { embeds: [{ color: 0xffcf3f, ...embed, description: embed.description?.slice(0, 1800) }] } : {}) }),
    });
  } catch { /* Discord nede – spillet skal ikke vente på det */ }
}

export const SITE = process.env.SITE_URL ?? 'https://cm0102reborn.com';
