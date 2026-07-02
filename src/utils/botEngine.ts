import { RuleCard, TradePosition, Combo } from '../types';
import { detectCombos, getComboRelaxation } from './combos';

/**
 * The Trading Bot rule engine — tiered card edition with default behavior.
 *
 * Each tick the bot looks at the equipped rule cards and decides: buy, sell, or hold.
 * The bot buys/sells the ENTIRE position every time (per the game spec).
 *
 * NEW: If no card triggers, the bot uses a built-in default strategy so that
 * even 1 card is playable. Cards override/supplement the default.
 *
 * ponytail: ceiling — this is a naive priority resolver, not a real rule DSL.
 * Rules are evaluated by id with hardcoded condition checks. Good enough for casual play.
 */

export interface BotContext {
  price: number;
  priceHistory: number[];      // recent prices (most recent last)
  position: TradePosition | null;
  cash: number;
  startCash: number;           // round start bankroll
  tickIndex: number;            // 0-based tick within the round
  totalTicks: number;           // total ticks in the round
  allTimeHigh: number;          // highest price seen this round
  allTimeLow: number;           // lowest price seen this round
  cardsFiredThisRound: number;  // how many cards have fired so far this round
}

export type BotAction = 'buy' | 'sell' | 'hold';

// Check whether a single rule's condition is satisfied given the bot context.
// `relaxed` = true when a combo bonus is active for this card.
function isConditionMet(rule: RuleCard, ctx: BotContext, relaxed: boolean): boolean {
  const { price, priceHistory, position, cash, startCash, tickIndex, totalTicks, allTimeHigh, allTimeLow, cardsFiredThisRound } = ctx;
  const recent = priceHistory.slice(-6);
  const cur = price;
  const prev = recent[recent.length - 2] ?? cur;
  const prevPrev = recent[recent.length - 3] ?? prev;
  const dropPct = prev > 0 ? (cur - prev) / prev : 0;
  const spikePct = prev > 0 ? (cur - prev) / prev : 0;
  const isAtAllTimeLow = cur <= allTimeLow && allTimeLow > 0;
  const recentLow = Math.min(...recent);
  const recentHigh = Math.max(...recent);
  const isNearLow = cur <= recentLow * 1.05;
  const isNearHigh = cur >= recentHigh * 0.95;
  const isAt5TickHigh = recent.length >= 5 && cur >= Math.max(...recent.slice(-5));
  const upThreeInARow = recent.length >= 3 && prev > prevPrev && cur > prev;
  const upTwoInARow = recent.length >= 2 && cur > prev;
  const downThreeInARow = recent.length >= 3 && prev < prevPrev && cur < prev;
  const downTwoInARow = recent.length >= 2 && cur < prev;
  const isFlat = recent.length >= 3 && Math.max(...recent) - Math.min(...recent) < recent[recent.length - 1] * 0.01;
  const isFlat2 = recent.length >= 2 && Math.max(...recent.slice(-2)) - Math.min(...recent.slice(-2)) < recent[recent.length - 1] * 0.01;
  const isChoppy = recent.length >= 4 && (recent[recent.length - 1] - recent[recent.length - 3]) * (recent[recent.length - 2] - recent[recent.length - 4]) < 0;
  const roundProgress = totalTicks > 0 ? tickIndex / totalTicks : 0;
  const isEarly = roundProgress < 0.25;
  const isLate = roundProgress > 0.75;
  const isMiddle = roundProgress >= 0.33 && roundProgress <= 0.66;

  const posProfit = position ? (position.shares * cur) - position.investedCash : 0;
  const posProfitPct = position && position.investedCash > 0 ? posProfit / position.investedCash : 0;
  const posLossPct = posProfitPct < 0 ? -posProfitPct : 0;
  const roundProfit = (position ? position.shares * cur : 0) + cash - startCash;
  const cashRatio = startCash > 0 ? cash / startCash : 0;
  const luckyDigit = 7;
  const unluckyDigit = 4;
  const endsInLucky = Math.floor(cur * 100) % 10 === luckyDigit;
  const endsInUnlucky = Math.floor(cur * 100) % 10 === unluckyDigit;

  // Dip threshold: relaxed from -5% to -3% with combo bonus.
  const dipThreshold = relaxed ? -0.03 : -0.05;
  // Surge threshold: relaxed from 4% to 3% with combo bonus.
  const surgeThreshold = relaxed ? 0.03 : 0.04;
  // Flat ticks: relaxed from 3 to 2 with combo bonus.
  const flatTicks = relaxed ? 2 : 3;

  switch (rule.id) {
    // ===== 🟫 TIER 0 — BASIC (30) =====
    case 't001': return dropPct < 0;                                    // First Blood: buy on any red tick
    case 't002': return spikePct > 0;                                   // Green Light: buy on any green tick
    case 't003': return !!position && posProfit > 0;                    // Paper Hands: sell at any profit
    case 't004': return !!position && posProfit < 0;                    // Panic Sell: sell on any loss
    case 't005': return dropPct <= -0.03;                               // Dip Buyer: 3%+ drop
    case 't006': return spikePct >= 0.03;                               // Peak Seller: 3%+ spike
    case 't007': return !!position && posProfit < 0;                    // Diamond Hands: never sell at loss
    case 't008': return tickIndex <= 1 && cash > 0;                     // Cash Ready: buy on first tick
    case 't009': return !!position && tickIndex > 0;                    // Quick Exit: sell any tick after buying
    case 't010': return upTwoInARow && cash > 0;                        // Trend Rider: 2 green ticks
    case 't011': return downTwoInARow && !!position;                    // Red Alert: 2 red ticks
    case 't012': return isFlat2 && cash > 0;                            // Flat Entry: flat 2+ ticks
    case 't013': return upThreeInARow && cash > 0;                      // Momentum: 3 green ticks
    case 't014': return !!position && posLossPct >= 0.05;               // Stop Loss: 5%+ loss
    case 't015': return !!position && posProfitPct >= 0.05;             // Profit Target: 5%+ profit
    case 't016': return isLate && !!position;                           // Last Call: final 3 ticks
    case 't017': return isEarly && cash > 0;                            // Early Bird: first 3 ticks
    case 't018': return cash > 0;                                       // All In: buy with everything
    case 't019': return true;                                           // Hold Forever: always hold
    case 't020': return dropPct <= -0.02 && cash > 0;                   // Red Dip Buy: 2%+ drop
    case 't021': return spikePct >= 0.02 && !!position;                 // Green Spike Sell: 2%+ spike
    case 't022': return !!position && cur < position.avgBuyPrice && cash > 0; // Double Down
    case 't023': return !!position && Math.abs(cur - position.avgBuyPrice) / position.avgBuyPrice < 0.01; // Break Even
    case 't024': return isMiddle && cash > 0;                           // Mid Round: halfway
    case 't025': return isLate && cash > 0;                             // Final Push: last third
    case 't026': return !!position && Math.abs(posProfitPct) < 0.01;    // Steady Hand: within 1%
    case 't027': return !!position && posLossPct > 0 && posLossPct < 0.03; // Red Hold
    case 't028': return !!position && posProfitPct > 0 && posProfitPct < 0.05; // Green Hold
    case 't029': return downTwoInARow && cur > prev && cash > 0;        // Bounce Buyer: dip then rise
    case 't030': return downThreeInARow && !!position;                  // Slider: 3 red ticks

    // ===== 🟩 TIER 1 — UNCOMMON (25) =====
    case 't101': return dropPct <= -0.05 && cash > 0;                   // Whale Watcher: 5%+ drop
    case 't102': return !!position && posProfitPct >= 0.15;             // Greedy Exit: 15%+ profit
    case 't103': return downTwoInARow && cur > prev && cash > 0;        // Reversal Rider
    case 't104': return isNearLow && cur > prev && cash > 0;            // Support Bounce
    case 't105': return isNearHigh && isFlat && !!position;             // Resistance Reject
    case 't106': return isChoppy && cash > 0;                           // Volatility Rider
    case 't107': return recent.length >= flatTicks && isFlat && cash > 0; // Calm Before Storm
    case 't108': return spikePct >= surgeThreshold && cash > 0;         // Spike Chaser
    case 't109': return !!position && posLossPct > 0 && posLossPct < 0.08; // Bag Holder
    case 't110': return !!position && tickIndex > 0 && tickIndex <= 2;  // Scalper: sell within 2 ticks
    case 't111': return dropPct <= -0.03 && cash > 0;                   // Contrarian
    case 't112': return upThreeInARow && !isChoppy && cash > 0;         // Trend Surfer
    case 't113': return cashRatio > 0.50;                               // Cash Guard
    case 't114': return roundProgress >= 0.50 && cash > 0;              // Second Wind
    case 't115': return !!position && posProfitPct >= 0.10;             // Scaled Exit: 10% profit
    case 't116': return tickIndex < 3;                                  // Patience: hold first 3
    case 't117': return !position && cash > 0 && tickIndex > 0;         // Re-Entry
    case 't118': return endsInLucky && cash > 0;                        // Lucky 7
    case 't119': return endsInUnlucky && !!position;                    // Unlucky 4
    case 't120': return isEarly && cash > 0;                            // Round Tripper (buy early)
    case 't121': return upThreeInARow && !isChoppy && cash > 0;         // Smooth Operator
    case 't122': return dropPct <= -0.06 && cash > 0;                   // Blood Bath
    case 't123': return upTwoInARow && spikePct >= 0.01 && cash > 0;    // Green Streak
    case 't124': return !!position && posProfit < 0;                    // Cut Losses
    case 't125': return !!position;                                     // Moonshot Hold

    // ===== 🟦 TIER 2 — RARE (20) =====
    // Trade triggers for hybrid cards (effects handled in cardEffects.ts)
    case 't201': return cash > 0;                                       // Price Whisperer: buy (effect: +1% next)
    case 't202': return !!position && posProfit < 0;                    // Bear Spray: sell at loss (effect: -2%)
    case 't203': return cash > 0;                                       // Bull Whisper: buy (effect: +1 tick)
    case 't204': return !!position;                                     // Time Warp: sell (effect: -1 tick)
    case 't205': return true;                                           // Volatility Pump: hold (effect: +20% vol)
    case 't206': return true;                                           // Stability Anchor: hold (effect: -20% vol)
    case 't207': return dropPct <= -0.02 && cash > 0;                   // Lucky Bounce: dip buy (effect: green)
    case 't208': return !!position;                                     // Jinx: sell (effect: 2 red)
    case 't209': return cash > 0;                                       // Flash Sale: buy (effect: random drop)
    case 't210': return cash > 0;                                       // Whale Buy: buy (effect: +3%)
    case 't211': return true;                                           // Paper Shredder: hold (effect: -10% cash)
    case 't212': return !!position && posLossPct >= 0.10;               // Insurance: sell at -10%
    case 't213': return true;                                           // Mirror Mirror: hold (effect: invert)
    case 't214': return true;                                           // Sugar Rush: hold (passive)
    case 't215': return true;                                           // Fog of War: hold (effect: hide)
    case 't216': return true;                                           // Crystal Ball: hold (passive)
    case 't217': return !!position && posProfit > 0;                    // Double or Nothing: profit sell
    case 't218': return !!position && posProfit > 0;                    // Tax Collector: profit sell
    case 't219': return true;                                           // Chaos Monkey: hold (effect: ±3%)
    case 't220': return true;                                           // Safety Net: hold (passive)

    // ===== 🟪 TIER 3 — EPIC (18) =====
    case 't301': return cash > 0 && Math.random() < 0.1;                // Flash Crash: random buy
    case 't302': return !!position && Math.random() < 0.1;              // Whale Pump: random hold
    case 't303': return spikePct >= 0.08 || dropPct <= -0.08;           // Circuit Breaker: 8%+ move
    case 't304': return Math.random() < 0.05;                           // Black Swan: random
    case 't305': return true;                                           // Time Lord: hold (effect: +3 ticks)
    case 't306': return true;                                           // Speed Run: hold (effect: -3 ticks)
    case 't307': return true;                                           // Price Floor: hold (passive)
    case 't308': return true;                                           // Price Ceiling: hold (passive)
    case 't309': return downThreeInARow && cash > 0;                    // Squeeze Play: 3+ red
    case 't310': return dropPct <= -0.05 && cash > 0;                   // Dead Cat Bounce
    case 't311': return true;                                           // Insider Tip: hold (passive)
    case 't312': return !!position && posLossPct >= 0.15;               // Margin Call: -15%+
    case 't313': return cash > 0;                                       // Quantum Trade: buy
    case 't314': return true;                                           // Gravity Well: hold (passive)
    case 't315': return true;                                           // Momentum Engine: hold (passive)
    case 't316': return true;                                           // Panic Spiral: hold (passive)
    case 't317': return cash <= 0;                                      // Phoenix: revive at $0
    case 't318': return cash > 0;                                       // Midas Touch: buy (passive +5%)

    // ===== 🟧 TIER 4 — LEGENDARY (15) =====
    case 't401': return true;                                           // The Oracle: hold (passive)
    case 't402': return true;                                           // Market Maker: hold (passive)
    case 't403': return !!position && posProfit > 0;                    // Compound Interest: profit sell
    case 't404': return cash > 0;                                       // Revenge Trade: buy after loss
    case 't405': return true;                                           // Plot Armor: hold (passive)
    case 't406': return true;                                           // Director's Cut: hold (manual)
    case 't407': return true;                                           // Cheat Code: hold (passive)
    case 't408': return true;                                           // Glitch in the Matrix: hold (event)
    case 't409': return true;                                           // Double Exposure: hold (passive)
    case 't410': return !!position && posProfit > 0;                    // Vampire: profit sell
    case 't411': return true;                                           // The Gambler: hold (event)
    case 't412': return true;                                           // Elastic Band: hold (passive)
    case 't413': return true;                                           // Blood Moon: hold (passive)
    case 't414': return true;                                           // Golden Hour: hold (passive)
    case 't415': return true;                                           // Puppet Master: hold (manual)

    // ===== 🔴 TIER 5 — MYTHIC (12) =====
    case 't501': return true;                                           // Time Lord Supreme: hold (event)
    case 't502': return true;                                           // Infinity Stone: hold (passive)
    case 't503': return cash > 0;                                       // Midas: buy (passive +3%)
    case 't504': return !!position && posProfit < 0;                    // Alchemist: sell at loss (cap -2%)
    case 't505': return true;                                           // Paradox Engine: hold (event)
    case 't506': return true;                                           // Void Walker: hold (event)
    case 't507': return true;                                           // Second Chance: hold (event)
    case 't508': return true;                                           // Chaos Theory: hold (passive)
    case 't509': return true;                                           // The Architect: hold (manual)
    case 't510': return true;                                           // Singularity: hold (event)
    case 't511': return true;                                           // HODL King: hold (passive)
    case 't512': return cardsFiredThisRound >= 0;                       // The Final Card: fires all basics

    default: return false;
  }
}

/**
 * Default bot behavior when no card triggers.
 * Ensures the bot is playable even with 0 or 1 card.
 *
 * Strategy:
 * - Early round (< 25%): Hold (wait for setup)
 * - Mid round (25-75%): Buy on 2%+ dip if no position; sell at 3%+ profit if holding
 * - Late round (> 75%): Sell if holding; hold if cash
 */
function getDefaultAction(ctx: BotContext): BotAction {
  const { tickIndex, totalTicks, position, cash, price, priceHistory } = ctx;
  const roundProgress = totalTicks > 0 ? tickIndex / totalTicks : 0;
  const recent = priceHistory.slice(-6);
  const prev = recent[recent.length - 2] ?? price;
  const dropPct = prev > 0 ? (price - prev) / prev : 0;

  // Early round: wait
  if (roundProgress < 0.25) {
    return 'hold';
  }

  // Late round: sell if holding
  if (roundProgress > 0.75) {
    if (position) return 'sell';
    return 'hold';
  }

  // Mid round: basic strategy
  if (!position && cash > 0 && dropPct <= -0.02) {
    return 'buy';
  }
  if (position) {
    const posProfitPct = position.investedCash > 0
      ? (position.shares * price - position.investedCash) / position.investedCash
      : 0;
    if (posProfitPct >= 0.03) return 'sell';
  }

  return 'hold';
}

/**
 * Resolve the bot's action for this tick given the equipped rules.
 *
 * Priority: equipped cards fire first (in order). If no card fires,
 * fall back to the default bot strategy.
 *
 * Combo-aware: when cards are part of active combos, their trigger
 * thresholds are relaxed (easier to fire).
 */
export function resolveBotAction(rules: RuleCard[], ctx: BotContext): { action: BotAction; firedRule: RuleCard | null; positionSize: number } {
  // Detect active combos.
  const activeCombos = detectCombos(rules);

  // Equipped cards in order.
  for (const rule of rules) {
    if (rule.action === 'hold' && ctx.tickIndex < 3) {
      // Hold cards in the first few ticks just mean "do nothing yet", skip.
      continue;
    }

    // Check if this card has a combo bonus.
    const { relaxed } = getComboRelaxation(rule, activeCombos);

    if (isConditionMet(rule, ctx, relaxed)) {
      // Guard: can't buy with no cash, can't sell with no position.
      if (rule.action === 'buy' && ctx.cash < 1) continue;
      if (rule.action === 'sell' && !ctx.position) continue;
      // positionSize: fraction of cash to invest (buys). Sells always liquidate full position.
      const size = rule.action === 'buy' ? (rule.positionSize ?? 0.5) : 1;
      return { action: rule.action, firedRule: rule, positionSize: size };
    }
  }

  // No card fired — use default bot behavior.
  const defaultAction = getDefaultAction(ctx);
  // Guard: can't buy with no cash, can't sell with no position.
  if (defaultAction === 'buy' && ctx.cash < 1) return { action: 'hold', firedRule: null, positionSize: 0 };
  if (defaultAction === 'sell' && !ctx.position) return { action: 'hold', firedRule: null, positionSize: 0 };
  // Default bot invests 50% on buys.
  const defaultSize = defaultAction === 'buy' ? 0.5 : 0;
  return { action: defaultAction, firedRule: null, positionSize: defaultSize };
}
