// Klublogoer hentes ved kørsel fra luukhopman/football-logos via jsDelivr (ikke bundlet i projektet)
let base = '';
let map: Record<string, string> = {};
let loaded: Promise<void> | null = null;

export function loadLogos(): Promise<void> {
  if (!loaded) {
    loaded = fetch(`${import.meta.env.BASE_URL}data/logos.json`)
      .then((r) => (r.ok ? r.json() : { base: '', logos: {} }))
      .then((d: { base: string; logos: Record<string, string> }) => { base = d.base; map = d.logos; })
      .catch(() => { /* uden logoer */ });
  }
  return loaded;
}

export function logoUrl(clubId: number): string | null {
  const p = map[clubId];
  return p ? base + p.split('/').map(encodeURIComponent).join('/') : null;
}
