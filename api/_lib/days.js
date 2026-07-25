// Analytics days are Israel days, so a play at 01:00 local counts for that
// night and not for the day before.
export const TIME_ZONE = 'Asia/Jerusalem';

const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** 'YYYY-MM-DD' for the Israel day containing this instant. */
export function dayKey(at = Date.now()) {
  return formatter.format(new Date(at));
}

/** Sortable integer for the day zset: 2026-07-25 -> 20260725. */
export function dayScore(key) {
  return Number(key.replaceAll('-', ''));
}

/** The `count` day keys ending with `endKey`, oldest first. */
export function dayRange(count, endKey = dayKey()) {
  const [y, m, d] = endKey.split('-').map(Number);
  // Anchored at noon UTC so a DST shift cannot move the calendar date.
  const anchor = Date.UTC(y, m - 1, d, 12);
  const out = [];
  for (let i = count - 1; i >= 0; i--) out.push(dayKey(anchor - i * 86400000));
  return out;
}
