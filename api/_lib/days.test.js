import { describe, expect, it } from 'vitest';
import { dayKey, dayRange, dayScore } from './days.js';

describe('dayKey', () => {
  it('uses the Israel day, not the UTC one', () => {
    // 22:30 UTC on 24 July is already 01:30 on the 25th in Jerusalem.
    expect(dayKey(Date.UTC(2026, 6, 24, 22, 30))).toBe('2026-07-25');
    expect(dayKey(Date.UTC(2026, 6, 24, 20, 30))).toBe('2026-07-24');
  });

  it('handles the winter offset too', () => {
    expect(dayKey(Date.UTC(2026, 0, 10, 22, 30))).toBe('2026-01-11');
    expect(dayKey(Date.UTC(2026, 0, 10, 21, 30))).toBe('2026-01-10');
  });
});

describe('dayRange', () => {
  it('returns the requested count, oldest first, ending on the given day', () => {
    expect(dayRange(3, '2026-07-25')).toEqual(['2026-07-23', '2026-07-24', '2026-07-25']);
  });

  it('crosses a month and a year boundary', () => {
    expect(dayRange(3, '2026-03-01')).toEqual(['2026-02-27', '2026-02-28', '2026-03-01']);
    expect(dayRange(2, '2027-01-01')).toEqual(['2026-12-31', '2027-01-01']);
  });

  it('does not skip or repeat a day across the spring DST change', () => {
    // Israel moves the clock forward on 27 March 2026.
    const days = dayRange(5, '2026-03-29');
    expect(days).toEqual([
      '2026-03-25',
      '2026-03-26',
      '2026-03-27',
      '2026-03-28',
      '2026-03-29',
    ]);
    expect(new Set(days).size).toBe(5);
  });

  it('produces 90 distinct days for the widest dashboard range', () => {
    const days = dayRange(90, '2026-07-25');
    expect(days).toHaveLength(90);
    expect(new Set(days).size).toBe(90);
  });
});

describe('dayScore', () => {
  it('sorts chronologically as a number', () => {
    expect(dayScore('2026-07-25')).toBe(20260725);
    expect(dayScore('2026-07-09')).toBeLessThan(dayScore('2026-07-10'));
  });
});
