import { describe, expect, it } from 'vitest';

import {
  calculateEndTime,
  calculateWorkHours,
  formatMinutesToDisplay,
  minutesToTimeString,
  timeToMinutes,
} from './calculate-hours';

describe('timeToMinutes', () => {
  it('should convert valid time string to minutes', () => {
    expect(timeToMinutes('08:00')).toBe(480);
    expect(timeToMinutes('12:30')).toBe(750);
    expect(timeToMinutes('00:00')).toBe(0);
    expect(timeToMinutes('23:59')).toBe(1439);
  });

  it('should return null for invalid time strings', () => {
    expect(timeToMinutes('')).toBeNull();
    expect(timeToMinutes('8:00')).toBeNull(); // missing leading zero
    expect(timeToMinutes('08:0')).toBeNull(); // incomplete
    expect(timeToMinutes('25:00')).toBeNull(); // invalid hour
    expect(timeToMinutes('12:60')).toBeNull(); // invalid minutes
    expect(timeToMinutes('abc')).toBeNull();
    expect(timeToMinutes('12:ab')).toBeNull();
  });

  it('should handle edge cases', () => {
    expect(timeToMinutes('00:01')).toBe(1);
    expect(timeToMinutes('23:00')).toBe(1380);
  });
});

describe('minutesToTimeString', () => {
  it('should convert minutes to HH:MM format', () => {
    expect(minutesToTimeString(480)).toBe('08:00');
    expect(minutesToTimeString(750)).toBe('12:30');
    expect(minutesToTimeString(0)).toBe('00:00');
    expect(minutesToTimeString(1439)).toBe('23:59');
  });

  it('should handle values over 24 hours by wrapping', () => {
    expect(minutesToTimeString(1440)).toBe('00:00'); // 24:00 wraps to 00:00
    expect(minutesToTimeString(1500)).toBe('01:00'); // 25:00 wraps to 01:00
  });
});

describe('formatMinutesToDisplay', () => {
  it('should format minutes to readable format', () => {
    expect(formatMinutesToDisplay(480)).toBe('8h');
    expect(formatMinutesToDisplay(510)).toBe('8h 30min');
    expect(formatMinutesToDisplay(30)).toBe('30min');
    expect(formatMinutesToDisplay(0)).toBe('0min');
  });

  it('should handle negative values by using absolute value', () => {
    expect(formatMinutesToDisplay(-60)).toBe('1h');
    expect(formatMinutesToDisplay(-90)).toBe('1h 30min');
  });

  it('should format edge cases correctly', () => {
    expect(formatMinutesToDisplay(1)).toBe('1min');
    expect(formatMinutesToDisplay(60)).toBe('1h');
    expect(formatMinutesToDisplay(61)).toBe('1h 1min');
  });
});

describe('calculateWorkHours', () => {
  it('should calculate full day work hours correctly', () => {
    // 08:00-12:00 (4h) + 13:00-17:00 (4h) = 8h
    const result = calculateWorkHours('08:00', '12:00', '13:00', '17:00');

    expect(result).not.toBeNull();
    expect(result?.totalMinutes).toBe(480);
    expect(result?.totalFormatted).toBe('8h');
    expect(result?.status).toBe('exact');
    expect(result?.remainingMinutes).toBe(0);
  });

  it('should return under status when below 8 hours', () => {
    // 09:00-12:00 (3h) + 13:00-17:00 (4h) = 7h
    const result = calculateWorkHours('09:00', '12:00', '13:00', '17:00');

    expect(result).not.toBeNull();
    expect(result?.totalMinutes).toBe(420);
    expect(result?.totalFormatted).toBe('7h');
    expect(result?.status).toBe('under');
    expect(result?.remainingMinutes).toBe(60);
    expect(result?.remainingFormatted).toBe('1h');
  });

  it('should return over status when above 8 hours', () => {
    // 08:00-12:00 (4h) + 13:00-18:00 (5h) = 9h
    const result = calculateWorkHours('08:00', '12:00', '13:00', '18:00');

    expect(result).not.toBeNull();
    expect(result?.totalMinutes).toBe(540);
    expect(result?.totalFormatted).toBe('9h');
    expect(result?.status).toBe('over');
    expect(result?.remainingMinutes).toBe(60);
    expect(result?.remainingFormatted).toBe('1h');
  });

  it('should calculate only morning period when afternoon is incomplete', () => {
    // 08:00-12:00 (4h) only
    const result = calculateWorkHours('08:00', '12:00', '', '');

    expect(result).not.toBeNull();
    expect(result?.totalMinutes).toBe(240);
    expect(result?.totalFormatted).toBe('4h');
    expect(result?.status).toBe('under');
  });

  it('should calculate only afternoon period when morning is incomplete', () => {
    // 13:00-17:00 (4h) only
    const result = calculateWorkHours('', '', '13:00', '17:00');

    expect(result).not.toBeNull();
    expect(result?.totalMinutes).toBe(240);
    expect(result?.totalFormatted).toBe('4h');
    expect(result?.status).toBe('under');
  });

  it('should return null when no complete period exists', () => {
    expect(calculateWorkHours('08:00', '', '', '')).toBeNull();
    expect(calculateWorkHours('', '12:00', '', '')).toBeNull();
    expect(calculateWorkHours('', '', '13:00', '')).toBeNull();
    expect(calculateWorkHours('', '', '', '17:00')).toBeNull();
    expect(calculateWorkHours('', '', '', '')).toBeNull();
  });

  it('should handle minutes correctly', () => {
    // 08:30-12:00 (3h30) + 13:00-17:30 (4h30) = 8h
    const result = calculateWorkHours('08:30', '12:00', '13:00', '17:30');

    expect(result).not.toBeNull();
    expect(result?.totalMinutes).toBe(480);
    expect(result?.totalFormatted).toBe('8h');
    expect(result?.status).toBe('exact');
  });

  it('should handle partial hour remaining', () => {
    // 09:15-12:00 (2h45) + 13:00-17:00 (4h) = 6h45
    const result = calculateWorkHours('09:15', '12:00', '13:00', '17:00');

    expect(result).not.toBeNull();
    expect(result?.totalMinutes).toBe(405);
    expect(result?.totalFormatted).toBe('6h 45min');
    expect(result?.status).toBe('under');
    expect(result?.remainingMinutes).toBe(75);
    expect(result?.remainingFormatted).toBe('1h 15min');
  });
});

describe('calculateEndTime', () => {
  it('should calculate end time with default 1h lunch break', () => {
    // 08:00 + 8h work + 1h lunch = 17:00
    expect(calculateEndTime('08:00', '', '', '')).toBe('17:00');
    expect(calculateEndTime('09:00', '', '', '')).toBe('18:00');
    expect(calculateEndTime('07:30', '', '', '')).toBe('16:30');
  });

  it('should calculate end time with custom lunch break', () => {
    // 08:00-12:00, 13:30-? → 1h30 lunch → 08:00 + 8h + 1h30 = 17:30
    expect(calculateEndTime('08:00', '12:00', '13:30', '')).toBe('17:30');

    // 09:00-12:00, 14:00-? → 2h lunch → 09:00 + 8h + 2h = 19:00
    expect(calculateEndTime('09:00', '12:00', '14:00', '')).toBe('19:00');
  });

  it('should use default lunch when only exit1 is provided', () => {
    // 08:00-12:00 without return → uses 1h default
    expect(calculateEndTime('08:00', '12:00', '', '')).toBe('17:00');
  });

  it('should return null when no entry time is provided', () => {
    expect(calculateEndTime('', '', '', '')).toBeNull();
    expect(calculateEndTime('', '12:00', '', '')).toBeNull();
    expect(calculateEndTime('', '', '13:00', '')).toBeNull();
  });

  it('should handle edge cases', () => {
    // Early start
    expect(calculateEndTime('06:00', '', '', '')).toBe('15:00');

    // Late start (wraps to next day in display but shows correct time)
    expect(calculateEndTime('15:00', '', '', '')).toBe('00:00'); // 15 + 8 + 1 = 24:00 → 00:00
  });
});
