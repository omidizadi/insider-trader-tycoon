import { Company, RoundScript, NewsHeadline, PriceEvent } from '../types';
import { getHeadlinesForCompany } from './headlines';
import { getDifficultyFactor, getNewsImpactMultiplier } from './difficulty';

/**
 * Deterministic price + news pre-generation for a round.
 *
 * Uses a seeded PRNG (mulberry32) so the chart preview matches the actual
 * trading round exactly. The seed is derived from company.id + roundNumber
 * so the same company+round always produces the same price series.
 *
 * ponytail: ceiling — mulberry32 is not cryptographic, but more than enough
 * for a casual game.
 */

// Simple seeded 32-bit PRNG (mulberry32)
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Hash a string to a 32-bit integer.
function hashSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  return hash;
}

/**
 * Generate the complete round script: initial 8-point history + all trading
 * tick prices + news events, using a seeded PRNG so the chart preview is
 * identical to the actual trading round.
 *
 * ponytail: ceiling — news is picked using the seeded RNG from the headline
 * pool. During actual trading the engine will re-generate from the same seed,
 * so preview and play match exactly.
 */
export function generateRoundScript(
  company: Company,
  roundNumber: number,
  historyLength: number,
  totalTicks: number,
): RoundScript {
  const seed = hashSeed(company.id + ':' + roundNumber);
  const rng = mulberry32(seed);
  const difficultyFactor = getDifficultyFactor(0); // rough approximation for preview

  // Pre-fetch the full headline pool for this company.
  const headlinePool = getHeadlinesForCompany(company);
  const usedIndices = new Set<number>();

  const prices: number[] = [];
  const newsEvents: (PriceEvent | null)[] = [];

  let curPrice = company.basePrice;

  // Generate the 8-point initial history.
  for (let i = 0; i < historyLength; i++) {
    const rand = rng();
    const change = curPrice * (rand * company.volatility * 0.4 - company.volatility * 0.18 + company.trend * 0.2);
    curPrice = Math.max(1, Number((curPrice + change).toFixed(2)));
    prices.push(curPrice);
  }

  // Generate the trading ticks (1-based tickIndex, odd ticks get news).
  for (let tick = 1; tick <= totalTicks; tick++) {
    let news: NewsHeadline | null = null;
    let newsId: string | undefined;

    if (tick % 2 === 1 && headlinePool.length > 0) {
      // Pick a headline deterministically using the seeded RNG.
      const available: number[] = [];
      for (let idx = 0; idx < headlinePool.length; idx++) {
        if (!usedIndices.has(idx)) available.push(idx);
      }
      // If all used, reset (shouldn't happen with 500+ headlines).
      const pool = available.length > 0 ? available : headlinePool.map((_, i) => i);
      const pickIdx = Math.floor(rng() * pool.length);
      const realIdx = pool[pickIdx];
      news = headlinePool[realIdx];
      newsId = `${company.id}_${realIdx}`;
      usedIndices.add(realIdx);
    }

    // Calculate the next price (same logic as generateNextPrice in ActiveGame).
    let change: number;
    if (news) {
      const mult = getNewsImpactMultiplier(news.sentiment, difficultyFactor);
      const totalImpact = news.impactPercent * mult;
      const target = Math.max(1, curPrice * (1 + totalImpact));
      change = (target - curPrice) * 0.4;
    } else {
      const rand = rng();
      change = curPrice * (rand * company.volatility * 0.12 - company.volatility * 0.06 + company.trend * 0.04);
    }
    curPrice = Math.max(1, Number((curPrice + change).toFixed(2)));
    prices.push(curPrice);

    newsEvents.push(news ? { news, newsId } : null);
  }

  return { prices, newsEvents, historyLength };
}