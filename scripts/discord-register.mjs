// Registrér botten's kommandoer hos Discord (kør én gang, og igen når kommandoerne ændres):
//   DISCORD_APP_ID=... DISCORD_BOT_TOKEN=... node scripts/discord-register.mjs
// Sæt derefter "Interactions Endpoint URL" i Discord Developer Portal til https://cm0102reborn.com/api/discord
// og DISCORD_PUBLIC_KEY på Vercel.
const app = process.env.DISCORD_APP_ID, token = process.env.DISCORD_BOT_TOKEN;
if (!app || !token) { console.error('Sæt DISCORD_APP_ID og DISCORD_BOT_TOKEN'); process.exit(1); }
const commands = [
  { name: 'top', description: 'Karriere-ranglisten i CM Reborn' },
  { name: 'hall', description: 'De seneste karrierer i Hall of Fame' },
  { name: 'player', description: 'Slå en spiller op i 2026/27-databasen', options: [{ type: 3, name: 'name', description: 'Spillerens navn', required: true }] },
];
const r = await fetch(`https://discord.com/api/v10/applications/${app}/commands`, { method: 'PUT', headers: { authorization: `Bot ${token}`, 'content-type': 'application/json' }, body: JSON.stringify(commands) });
console.log(r.status, await r.text());
