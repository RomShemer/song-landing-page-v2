// Talks to Vercel KV / Upstash over their REST endpoint rather than through a
// client library: the same code then runs unchanged on the edge runtime, and
// the whole surface we need is nine commands.
//
// With no credentials in the environment the store falls back to an in-process
// map so `npm run dev` works offline. That copy dies with the process, which is
// the point — it must never look like durable storage.

const URL_ENV = ['KV_REST_API_URL', 'UPSTASH_REDIS_REST_URL'];
const TOKEN_ENV = ['KV_REST_API_TOKEN', 'UPSTASH_REDIS_REST_TOKEN'];

const pick = (names) => names.map((n) => process.env[n]).find(Boolean) || '';

export function kvConfigured() {
  return Boolean(pick(URL_ENV) && pick(TOKEN_ENV));
}

async function rest(body, path = '') {
  const res = await fetch(`${pick(URL_ENV).replace(/\/$/, '')}${path}`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${pick(TOKEN_ENV)}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`kv ${res.status} ${await res.text()}`);
  return res.json();
}

// ---------------------------------------------------------------- memory store

const mem = new Map();

function live(key) {
  const entry = mem.get(key);
  if (!entry) return null;
  if (entry.expires && entry.expires <= Date.now()) {
    mem.delete(key);
    return null;
  }
  return entry;
}

function slot(key, make) {
  const entry = live(key);
  if (entry) return entry;
  const fresh = { value: make(), expires: 0 };
  mem.set(key, fresh);
  return fresh;
}

function memCmd([name, ...args]) {
  const op = String(name).toUpperCase();
  const key = args[0];

  switch (op) {
    case 'GET':
      return live(key)?.value ?? null;

    case 'SET': {
      const rest = args.slice(2).map((a) => String(a).toUpperCase());
      if (rest.includes('NX') && live(key)) return null;
      const entry = { value: String(args[1]), expires: 0 };
      const ex = rest.indexOf('EX');
      if (ex !== -1) entry.expires = Date.now() + Number(args[2 + ex + 1]) * 1000;
      mem.set(key, entry);
      return 'OK';
    }

    case 'DEL':
      return args.filter((k) => mem.delete(k)).length;

    case 'INCRBY': {
      const entry = slot(key, () => '0');
      entry.value = String(Number(entry.value) + Number(args[1]));
      return Number(entry.value);
    }

    case 'HGETALL': {
      const hash = live(key)?.value;
      if (!hash) return [];
      return Object.entries(hash).flatMap(([f, v]) => [f, String(v)]);
    }

    case 'HINCRBY': {
      const entry = slot(key, () => ({}));
      const next = Number(entry.value[args[1]] || 0) + Number(args[2]);
      entry.value[args[1]] = next;
      return next;
    }

    case 'EXPIRE': {
      const entry = live(key);
      if (!entry) return 0;
      entry.expires = Date.now() + Number(args[1]) * 1000;
      return 1;
    }

    case 'ZADD': {
      const entry = slot(key, () => new Map());
      for (let i = 1; i < args.length; i += 2) {
        entry.value.set(String(args[i + 1]), Number(args[i]));
      }
      return 1;
    }

    case 'ZRANGE': {
      const entry = live(key)?.value;
      if (!entry) return [];
      const sorted = [...entry.entries()].sort((a, b) => a[1] - b[1]);
      const byScore = args.slice(3).map(String).some((a) => a.toUpperCase() === 'BYSCORE');
      if (!byScore) return sorted.map(([m]) => m);
      const [min, max] = [Number(args[1]), Number(args[2])];
      return sorted.filter(([, s]) => s >= min && s <= max).map(([m]) => m);
    }

    default:
      throw new Error(`kv memory fallback does not implement ${op}`);
  }
}

// -------------------------------------------------------------------- commands

async function run(command) {
  if (!kvConfigured()) return memCmd(command);
  const { result } = await rest(command);
  return result;
}

/** Runs commands in one round trip. Returns their results in order. */
export async function pipeline(commands) {
  if (!commands.length) return [];
  if (!kvConfigured()) return commands.map(memCmd);
  const out = await rest(commands, '/pipeline');
  return out.map((r) => r.result);
}

export const get = (key) => run(['GET', key]);
export const del = (...keys) => run(['DEL', ...keys]);
export const incrby = (key, by = 1) => run(['INCRBY', key, by]);
export const expire = (key, seconds) => run(['EXPIRE', key, seconds]);
export const zadd = (key, score, member) => run(['ZADD', key, score, member]);

export function set(key, value, { nx = false, ex = 0 } = {}) {
  const command = ['SET', key, value];
  if (ex) command.push('EX', ex);
  if (nx) command.push('NX');
  return run(command);
}

/** SET NX EX as a lock: true when this caller claimed the key. */
export async function claim(key, seconds) {
  return (await set(key, '1', { nx: true, ex: seconds })) !== null;
}

export function fromFlat(flat) {
  const out = {};
  const pairs = Array.isArray(flat) ? flat : Object.entries(flat || {}).flat();
  for (let i = 0; i < pairs.length; i += 2) out[pairs[i]] = Number(pairs[i + 1]) || 0;
  return out;
}

/** Numeric hash, `{}` when the key is missing. */
export async function hgetallNumeric(key) {
  return fromFlat(await run(['HGETALL', key]));
}

export const zrangeByScore = (key, min, max) =>
  run(['ZRANGE', key, min, max, 'BYSCORE']);

/** One round trip for many HINCRBY on the same day's counters. */
export function bumpFields(keys, fields) {
  const entries = Object.entries(fields).filter(([, by]) => by);
  if (!entries.length) return Promise.resolve([]);
  return pipeline(keys.flatMap((key) => entries.map(([f, by]) => ['HINCRBY', key, f, by])));
}

/** Test seam — the memory fallback is process-global. */
export function resetMemory() {
  mem.clear();
}
