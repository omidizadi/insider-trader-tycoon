import type { Run, GameRecord } from '../types';

const RECORDS_STORAGE_KEY = 'cointrader_records_v1';

const DEFAULT_RECORDS: GameRecord = {
  highestCashEver: 0,
  highestCashRunId: null,
  highestCashDate: null,
  longestRunRounds: 0,
  longestRunId: null,
  longestRunDate: null,
};

export function loadRecords(): GameRecord {
  try {
    const raw = localStorage.getItem(RECORDS_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_RECORDS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load records:', e);
  }
  return { ...DEFAULT_RECORDS };
}

/**
 * Update all-time records after a completed run.
 * Returns the updated GameRecord (also persists to localStorage).
 */
export function updateRecordsAfterRun(run: Run): GameRecord {
  const current = loadRecords();
  const updated = { ...current };

  // Highest bankroll ever
  if (run.highestCash > current.highestCashEver) {
    updated.highestCashEver = run.highestCash;
    updated.highestCashRunId = run.id;
    updated.highestCashDate = run.date;
  }

  // Longest run (most rounds survived)
  if (run.roundsPlayed > current.longestRunRounds) {
    updated.longestRunRounds = run.roundsPlayed;
    updated.longestRunId = run.id;
    updated.longestRunDate = run.date;
  }

  try {
    localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save records:', e);
  }

  return updated;
}
