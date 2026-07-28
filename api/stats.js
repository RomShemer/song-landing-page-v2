import { isAdmin } from './_lib/auth.js';
import { dayRange } from './_lib/days.js';
import { fail, forMethod, isRead, json, methodNotAllowed, noStore } from './_lib/http.js';
import { fromFlat, hgetallNumeric, pipeline } from './_lib/kv.js';

export const config = { runtime: 'edge' };

const RANGES = [7, 30, 90];

// Zero-filled so the charts and the table always have every column, and a quiet
// day reads as a real zero rather than a gap.
const DAILY_FIELDS = [
  'page_view',
  'page_view:full',
  'page_view:listen_only',
  'play_audio',
  'listen_seconds',
  'download_wav',
  'download_mp3',
  'download_pdf',
  'download_photos',
];

// Counters stay flat — the dashboard reads `totals['accordion_open:pr']` — with
// the listen buckets also gathered into the object the duration chart wants.
function withBuckets(flat) {
  const listen_buckets = {};
  for (const [field, value] of Object.entries(flat)) {
    if (field.startsWith('listen_buckets:')) listen_buckets[field.slice(15)] = value;
  }
  return { ...flat, listen_buckets };
}

export default async function handler(request) {
  if (!isRead(request)) return methodNotAllowed(['GET', 'HEAD']);
  if (!(await isAdmin(request))) return fail(401, 'unauthorized', noStore);

  const asked = Number(new URL(request.url).searchParams.get('days'));
  const days = RANGES.includes(asked) ? asked : 30;

  const keys = dayRange(days);
  const [totals, daily] = await Promise.all([
    hgetallNumeric('stats:totals'),
    pipeline(keys.map((day) => ['HGETALL', `stats:daily:${day}`])),
  ]);

  const series = keys.map((date, i) => {
    const row = fromFlat(daily[i]);
    const filled = { date };
    for (const field of DAILY_FIELDS) filled[field] = row[field] || 0;
    return { ...row, ...filled };
  });

  return forMethod(request, json({ days, totals: withBuckets(totals), series }, { headers: noStore }));
}
