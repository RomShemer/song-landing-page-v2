import { dayKey, dayScore } from './_lib/days.js';
import { normalizeEvent, visitorHash } from './_lib/events.js';
import { clientIp, fail, json, methodNotAllowed, noStore, readJson } from './_lib/http.js';
import { bumpFields, claim, expire, zadd } from './_lib/kv.js';
import { TRACK_LIMIT, allow } from './_lib/ratelimit.js';

export const config = { runtime: 'edge' };

const DAILY_TTL = 2 * 365 * 86400;

export default async function handler(request) {
  if (request.method !== 'POST') return methodNotAllowed(['POST']);

  const ip = clientIp(request);
  if (!(await allow('track', ip, TRACK_LIMIT))) {
    // Silent to the page: a throttled visitor should not see an error.
    return json({ ok: true, throttled: true }, { headers: noStore });
  }

  const event = normalizeEvent(await readJson(request, 4096));
  if (!event) return fail(400, 'unknown event', noStore);

  if (event.dedupe) {
    const visitor = await visitorHash(ip, request.headers.get('user-agent'));
    const first = await claim(`dedupe:${event.dedupe}:${visitor}`, event.ttl);
    if (!first) return json({ ok: true, deduped: true }, { headers: noStore });
  }

  const day = dayKey();
  const dailyKey = `stats:daily:${day}`;
  await bumpFields(['stats:totals', dailyKey], event.fields);
  await Promise.all([expire(dailyKey, DAILY_TTL), zadd('stats:days', dayScore(day), day)]);

  return json({ ok: true }, { headers: noStore });
}
