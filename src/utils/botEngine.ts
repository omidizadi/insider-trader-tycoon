import { RuleCard, NewsHeadline, TradePosition, NewsMagnitude, Combo } from '../types';
import { detectCombos, getComboRelaxation } from './combos';

/**
 * The Trading Bot rule engine — combo-aware edition.
 *
 * Each tick the bot looks at the equipped rule cards and decides: buy, sell, or hold.
 * The bot buys/sells the ENTIRE position every time (per the game spec).
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
  recentNews: NewsHeadline[];  // most recent first
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
  const { price, priceHistory, position, cash, startCash, recentNews, tickIndex, totalTicks, allTimeHigh, allTimeLow, cardsFiredThisRound } = ctx;
  const lastNews = recentNews[0];
  const prevNews = recentNews[1];
  const prevPrevNews = recentNews[2];
  const recent = priceHistory.slice(-6);
  const cur = price;
  const prev = recent[recent.length - 2] ?? cur;
  const prevPrev = recent[recent.length - 3] ?? prev;
  const dropPct = prev > 0 ? (cur - prev) / prev : 0;
  const spikePct = prev > 0 ? (cur - prev) / prev : 0;
  const isAtAllTimeHigh = cur >= allTimeHigh && allTimeHigh > 0;
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
  const twoPositiveInRow = lastNews && prevNews && (lastNews.magnitude === 'positive' || lastNews.magnitude === 'very_positive') && (prevNews.magnitude === 'positive' || prevNews.magnitude === 'very_positive');
  const twoNegativeInRow = lastNews && prevNews && (lastNews.magnitude === 'negative' || lastNews.magnitude === 'very_negative') && (prevNews.magnitude === 'negative' || prevNews.magnitude === 'very_negative');
  const threePositiveInRow = twoPositiveInRow && prevPrevNews && (prevPrevNews.magnitude === 'positive' || prevPrevNews.magnitude === 'very_positive');
  const lastWasPositive = lastNews && (lastNews.magnitude === 'positive' || lastNews.magnitude === 'very_positive');
  const lastWasNegative = lastNews && (lastNews.magnitude === 'negative' || lastNews.magnitude === 'very_negative');
  const lastWasVeryPositive = lastNews && lastNews.magnitude === 'very_positive';
  const lastWasVeryNegative = lastNews && lastNews.magnitude === 'very_negative';
  const lastWasNeutral = lastNews && lastNews.magnitude === 'neutral';
  const prevWasPositive = prevNews && (prevNews.magnitude === 'positive' || prevNews.magnitude === 'very_positive');
  const prevWasNegative = prevNews && (prevNews.magnitude === 'negative' || prevNews.magnitude === 'very_negative');
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
  // Up ticks: relaxed from 3 to 2 with combo bonus.
  const upTicks = relaxed ? 2 : 3;

  switch (rule.id) {
    // ===== 🔴 DIP CARDS (16) =====
    case 'c001': return dropPct <= dipThreshold;                       // Dip Buyer
    case 'c002': return !!position && cur < position.avgBuyPrice;      // Double Down
    case 'c003': return dropPct <= -0.04 && isFlat2;                   // Whale Wake (big drop + was flat)
    case 'c004': return isAtAllTimeLow && cur > prev;                  // Bounce Believer
    case 'c005': return !!lastWasVeryNegative;                         // Fear Buyer
    case 'c006': return !!lastWasPositive && !!prevWasNegative;        // Streak Breaker (bad streak ended)
    case 'c007': return isNearLow && isFlat;                           // Valley Hunter
    case 'c008': return downTwoInARow && !!lastWasNeutral;             // Contrarian Entry
    case 'c009': return downThreeInARow && !!position;                 // Dip Seller
    case 'c010': return !!position && posLossPct >= 0.08;              // Falling Knife
    case 'c011': return !!position && cur < position.avgBuyPrice;      // Panic Exit
    case 'c012': return !!position && !!lastWasVeryNegative;           // Bad News Dump
    case 'c013': return !!position && posLossPct > 0 && posLossPct < 0.03;  // Dip Holder
    case 'c014': return !!position && posProfit < 0;                   // Recovery Wait
    case 'c015': return !!position && !!lastWasNegative;               // Fearless
    case 'c016': return !!position && cur < position.avgBuyPrice && cash > 0; // Averaging Down

    // ===== 🟢 SURGE CARDS (16) =====
    case 'c017': return isAt5TickHigh;                                 // Peak Chaser
    case 'c018': return relaxed ? upTwoInARow : upThreeInARow;         // Momentum Entry
    case 'c019': return spikePct >= surgeThreshold;                    // Rocket Fuel
    case 'c020': return upThreeInARow && !isFlat;                      // Smooth Operator
    case 'c021': return !!lastWasPositive;                             // Good Vibes Buyer
    case 'c022': return relaxed ? upTwoInARow : upThreeInARow;         // Trend Surfer
    case 'c023': return isNearHigh && recent.length >= 3 && cur > Math.max(...recent.slice(0, -1)); // Breakout Buyer
    case 'c024': return !!twoPositiveInRow;                            // News Momentum
    case 'c025': return !!position && posProfitPct >= 0.10;            // Profit Taker
    case 'c026': return isNearHigh && isFlat;                          // Peak Seller
    case 'c027': return spikePct >= 0.06;                              // Spike Exit
    case 'c028': return !!threePositiveInRow;                          // Triple Top
    case 'c029': return upThreeInARow;                                 // Trend Rider
    case 'c030': return !!position && posProfit > 0 && upTwoInARow;    // Momentum Hold
    case 'c031': return !!position && posProfit > 0 && !!lastWasPositive; // Winner's Hold
    case 'c032': return !!position && posProfit > 0;                   // Let It Ride

    // ===== 📰 NEWS CARDS (16) =====
    case 'c033': return !!twoPositiveInRow;                            // Positive Parrot
    case 'c034': return !!twoNegativeInRow;                            // Negative Nelly
    case 'c035': return relaxed ? !!lastWasPositive : !!lastWasVeryPositive; // Headline Bull
    case 'c036': return relaxed ? !!lastWasNegative : !!lastWasVeryNegative; // Headline Bear
    case 'c037': return !!lastWasNeutral;                              // Rumor Mill
    case 'c038': return !!lastWasNeutral && !!position;                // News Hold
    case 'c039': return !!lastWasPositive && !!position;               // Streak Rider
    case 'c040': return !!lastWasNegative && !!position;               // Doom Hold
    case 'c041': return tickIndex <= 2 && !!lastWasPositive;           // First News
    case 'c042': return !!lastNews && !!position;                      // News Exit
    case 'c043': return !!lastWasNegative;                             // Contrarian News
    case 'c044': return !!lastWasVeryPositive && !!position;           // Top Caller
    case 'c045': return !!lastWasPositive;                             // Good News Greed
    case 'c046': return !!lastWasNegative;                             // Bad News Panic
    case 'c047': return !!lastWasPositive && !!prevWasNegative;        // News Flip Entry
    case 'c048': return !!lastWasNegative && !!prevWasPositive;        // News Flip Exit

    // ===== 📊 PATTERN CARDS (16) =====
    case 'c049': return recent.length >= flatTicks && isFlat;           // Flatline Buyer
    case 'c050': return recent.length >= 4 && !isFlat && prev < cur && isFlat2; // Breakout Entry (was flat, now moving)
    case 'c051': return isChoppy && !!position;                        // Choppy Exit
    case 'c052': return !isFlat && isChoppy && !!position;             // After Storm
    case 'c053': return upThreeInARow && !!position;                   // Smooth Hold
    case 'c054': return isChoppy && !!position;                        // Volatility Hold
    case 'c055': return recent.length >= 3 && prev < prevPrev && cur < prev; // Double Dip Buyer
    case 'c056': return isNearLow && cur < prev && recent.length >= 3; // Breakdown Seller
    case 'c057': return isNearHigh && isFlat && !!position;            // Resistance Seller
    case 'c058': return isNearLow && cur > prev && recent.length >= 2; // Support Buyer
    case 'c059': return (upThreeInARow || downThreeInARow) && !!position; // Trend Continuation
    case 'c060': return !isNearLow && !isNearHigh && cur > prev;       // Range Trader (middle, trending up)
    case 'c061': return !isNearLow && !isNearHigh && cur < prev;       // Range Exit (middle, trending down)
    case 'c062': return recent.length >= flatTicks && isFlat;           // Calm Before Storm
    case 'c063': return recent.length >= flatTicks && isFlat;           // Stationary Signal
    case 'c064': return recent.length >= 3 && spikePct >= surgeThreshold && prev > prevPrev; // Spike Seller

    // ===== 💰 POSITION CARDS (14) =====
    case 'c065': return cash > 0;                                      // All In
    case 'c066': return !position && cash > 0;                         // No Position Entry
    case 'c067': return !!position && posProfit > 0;                   // Paper Hands
    case 'c068': return !!position && posProfit < 0;                   // Diamond Hands
    case 'c069': return !!position && posProfit < 0;                   // Cut The Loss
    case 'c070': return !!position && posLossPct >= 0.08;              // Safety Net
    case 'c071': return !!position && posLossPct > 0 && posLossPct < 0.05; // Bag Holder
    case 'c072': return !!position && posProfitPct >= 0.20;            // Greedy Exit
    case 'c073': return cashRatio > 0.50;                              // Cash Guard
    case 'c074': return roundProfit > 0 && !!position;                 // Profit Lock
    case 'c075': return !!position && posProfit > 0 && upTwoInARow;    // Position Momentum
    case 'c076': return !!position && tickIndex > 0;                   // Quick Flip
    case 'c077': return !position && cash > 0 && tickIndex > 0;        // Re-Entry
    case 'c078': return !!position && posProfitPct >= 0.15;            // Scaled Exit

    // ===== ⏰ TIMER CARDS (12) =====
    case 'c079': return isEarly && cash > 0;                           // Early Bird
    case 'c080': return isLate && !!position;                          // Late Exit
    case 'c081': return isEarly;                                       // First In Last Out (hold early)
    case 'c082': return tickIndex < 3;                                 // Patience
    case 'c083': return isLate && !!position;                          // Clock Watcher
    case 'c084': return tickIndex <= 1 && cash > 0;                    // Impulse
    case 'c085': return isMiddle && cash > 0;                          // Mid-Round Entry
    case 'c086': return isMiddle && !!position;                        // Mid-Round Exit
    case 'c087': return tickIndex >= totalTicks - 2 && !!position;     // Last Minute
    case 'c088': return tickIndex < 3;                                 // Slow Start
    case 'c089': return roundProgress >= 0.50 && cash > 0;             // Second Wind
    case 'c090': return tickIndex >= 3 && !!position;                  // Timer Hold

    // ===== ⚡ WILD CARDS (10) =====
    case 'c091': return cash > 0;                                      // YOLO
    case 'c092': return endsInLucky && cash > 0;                       // Lucky Number
    case 'c093': return endsInUnlucky && !!position;                   // Unlucky Exit
    case 'c094': return !!position;                                    // Moon Shot (always hold)
    case 'c095': return dropPct < -0.02 || !!lastWasNegative;          // Panic Button
    case 'c096': return downThreeInARow && cash > 0;                   // Gambler's Fallacy
    case 'c097': return upThreeInARow && cash > 0;                     // Hot Hand
    case 'c098': return !!lastWasNegative || dropPct < -0.01;          // Chicken Little
    case 'c099': return true;                                          // Zen Master (always hold)
    case 'c100': return cardsFiredThisRound >= 2 && !!position;        // Combo Master

    default: return false;
  }
}

/**
 * Resolve the bot's action for this tick given the equipped rules.
 *
 * Priority: hard overrides (buy/sell/hold) fire first in card order.
 * If multiple hard overrides fire, the first one wins.
 * If no hard override fires, hold.
 *
 * Combo-aware: when cards are part of active combos, their trigger
 * thresholds are relaxed (easier to fire).
 */
export function resolveBotAction(rules: RuleCard[], ctx: BotContext): { action: BotAction; firedRule: RuleCard | null } {
  // Detect active combos.
  const activeCombos = detectCombos(rules);

  // Hard overrides in order.
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
      return { action: rule.action, firedRule: rule };
    }
  }

  return { action: 'hold', firedRule: null };
}
