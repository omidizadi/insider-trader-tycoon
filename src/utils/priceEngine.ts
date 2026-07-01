import { Company, RoundScript } from '../types';

/**
 * Deterministic price pre-generation for a round.
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
 * tick prices, using a seeded PRNG so the chart preview is identical to the
 * actual trading round.
 */
export function generateRoundScript(
  company: Company,
  roundNumber: number,
  historyLength: number,
  totalTicks: number,
): RoundScript {
  const seed = hashSeed(company.id + ':' + roundNumber);
  const rng = mulberry32(seed);

  const prices: number[] = [];
  let curPrice = company.basePrice;

  // Generate the 8-point initial history.
  for (let i = 0; i < historyLength; i++) {
    const rand = rng();
    const change = curPrice * (rand * company.volatility * 0.4 - company.volatility * 0.18 + company.trend * 0.2);
    curPrice = Math.max(1, Number((curPrice + change).toFixed(2)));
    prices.push(curPrice);
  }

  // Generate the trading ticks.
  for (let tick = 1; tick <= totalTicks; tick++) {
    const rand = rng();
    const change = curPrice * (rand * company.volatility * 0.12 - company.volatility * 0.06 + company.trend * 0.04);
    curPrice = Math.max(1, Number((curPrice + change).toFixed(2)));
    prices.push(curPrice);
  }

  return { prices, historyLength };
}