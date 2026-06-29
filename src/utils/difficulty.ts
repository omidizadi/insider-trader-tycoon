import type { NewsHeadline } from './headlines';

/**
 * Asymptotic difficulty factor ∈ [1.0, 2.0) based on player cash.
 * Grows quickly early, plateaus ~1.9 at high cash so the game stays playable.
 *
 *   cash $0      → 1.00  (baseline = current behavior)
 *   cash $2,500  → 1.33
 *   cash $5,000  → 1.50
 *   cash $10,000 → 1.67
 *   cash $20,000 → 1.80
 *   cash $50,000 → ~1.91
 */
export function getDifficultyFactor(cash: number): number {
  return 1.0 + 1.0 * (1 - 1 / (1 + Math.max(0, cash) / 5000));
}

/**
 * Minimum volatility floor for company selection.
 * At df=1.0 → 0 (no filter); at df=1.5 → 0.25; at df=2.0 → 0.5.
 */
export function getMinVolatility(df: number): number {
  return Math.max(0, (df - 1.0) * 0.5);
}

/**
 * Compute the news impact multiplier scaled by difficulty.
 * Replaces the 3× duplicated hardcoded blocks in ActiveGame.tsx.
 *
 * Base ranges (df=1.0):
 *   positive: 3.0 + rand*1.5  → [3.0, 4.5]
 *   negative: 2.5 + rand*1.5  → [2.5, 4.0]
 *   neutral:  1.2 + rand*0.8  → [1.2, 2.0]
 *
 * At higher difficulty the base scales up, making swings bigger (risk AND reward).
 */
export function getNewsImpactMultiplier(
  sentiment: NewsHeadline['sentiment'],
  df: number
): number {
  const r = Math.random();
  if (sentiment === 'positive') {
    return (3.0 * df) + r * 1.5;
  } else if (sentiment === 'negative') {
    return (2.5 * df) + r * 1.5;
  } else {
    return (1.2 * df) + r * 0.8;
  }
}
