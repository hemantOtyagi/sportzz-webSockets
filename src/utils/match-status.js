import { MATCH_STATUS } from '../validation/matches.js';

// Returns a valid Date, or null for null/undefined/unparseable input.
// (Checking null explicitly matters: new Date(null) is 1970-01-01, not invalid.)
const toValidDate = (value) => {
  if (value == null) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Derives a match's status from its schedule.
 * - endTime is optional: without one, a started match stays live.
 * - Returns null when a provided date is invalid, so callers can leave
 *   the stored status untouched.
 */
export function getMatchStatus(startTime, endTime, now = new Date()) {
  const start = toValidDate(startTime);
  if (!start) return null;

  const end = toValidDate(endTime);
  if (endTime != null && !end) return null;

  if (now < start) return MATCH_STATUS.SCHEDULED;
  if (end && now >= end) return MATCH_STATUS.FINISHED;
  return MATCH_STATUS.LIVE;
}

/**
 * Persists a status change only when the derived status differs from the
 * stored one. Returns the resulting status and does not mutate `match`.
 */
export async function syncMatchStatus(match, updateStatus, now = new Date()) {
  const nextStatus = getMatchStatus(match.startTime, match.endTime, now);

  if (!nextStatus || nextStatus === match.status) {
    return match.status;
  }

  await updateStatus(nextStatus);
  return nextStatus;
}