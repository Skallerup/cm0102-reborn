// Fælles Redis-forbindelse for alle serverfunktioner.
//
// Staging (Vercel Preview, fx staging.cm0102reborn.com) deler databasen med produktionen, men alle nøgler får
// præfikset "stg:", så staging aldrig kan læse eller overskrive rigtige data. Produktionen bruger nøglerne som før.
import { Redis } from '@upstash/redis';

/** Kører vi på staging/preview? (Vercel sætter VERCEL_ENV=preview for alle ikke-produktions-udgivelser) */
export const IS_STAGING = process.env.VERCEL_ENV === 'preview';
const PREFIX = IS_STAGING ? 'stg:' : '';

/** Kommandoer, hvor alle tekst-argumenter er nøgler */
const ALL_KEYS = new Set(['del', 'exists', 'mget', 'unlink', 'touch', 'sinter', 'sunion', 'sdiff']);

/** Pak en Redis-klient ind, så hver nøgle får et præfiks (kun når præfikset ikke er tomt) */
export function withPrefix(r: Redis, prefix: string): Redis {
  if (!prefix) return r;
  const p = (k: unknown) => (typeof k === 'string' ? prefix + k : k);
  const strip = (k: unknown) => (typeof k === 'string' && k.startsWith(prefix) ? k.slice(prefix.length) : k);
  return new Proxy(r, {
    get(target, prop, receiver) {
      const v = Reflect.get(target, prop, receiver);
      if (typeof v !== 'function' || typeof prop !== 'string') return v;
      if (prop === 'pipeline' || prop === 'multi' || prop === 'eval' || prop === 'evalsha' || prop === 'keys' || prop === 'flushdb' || prop === 'flushall') {
        // bruges ikke i projektet – fejl højlydt i stedet for at ramme produktionens nøgler
        return () => { throw new Error(`redis.${prop} understøttes ikke med nøglepræfiks`); };
      }
      return (...args: unknown[]) => {
        if (ALL_KEYS.has(prop)) return v.apply(target, args.map(p));
        if (prop === 'zunionstore' || prop === 'zinterstore') {
          const [dest, n, keys, ...rest] = args;
          return v.apply(target, [p(dest), n, Array.isArray(keys) ? keys.map(p) : p(keys), ...rest]);
        }
        if (prop === 'scan') {
          const [cursor, opts] = args as [unknown, { match?: string } | undefined];
          const o = { ...(opts ?? {}), match: prefix + (opts?.match ?? '*') };
          return (v.apply(target, [cursor, o]) as Promise<[string | number, string[]]>).then(([c, keys]) => [c, keys.map((k) => strip(k) as string)]);
        }
        return v.apply(target, [p(args[0]), ...args.slice(1)]);
      };
    },
  });
}

/** Ny Redis-klient ud fra KV_REST_API_URL/TOKEN (med staging-præfiks på preview) */
export function makeRedis(): Redis {
  return withPrefix(new Redis({ url: process.env.KV_REST_API_URL!, token: process.env.KV_REST_API_TOKEN! }), PREFIX);
}
