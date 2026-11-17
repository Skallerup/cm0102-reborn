// Admin-adgang: ejerens ADMIN_TOKEN eller CLAUDE_ADMIN_TOKEN (Claudes egen nøgle til at svare på forslag m.m. – kan tilbagekaldes for sig).
export const isAdminToken = (t: unknown): boolean =>
  typeof t === 'string' && t.length > 0 && [process.env.ADMIN_TOKEN, process.env.CLAUDE_ADMIN_TOKEN].some((k) => !!k && k === t);
