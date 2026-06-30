import { RuleCard, NewsHeadline, TradePosition, NewsMagnitude } from '../types';

/**
 * The Trading Bot rule engine.
 *
 * Each tick the bot looks at the equipped rule cards and decides: buy, sell, or hold.
 * The bot buys/sells the ENTIRE position every time (per the game spec).
 *
 * ponytail: ceiling — this is a naive priority resolver, not a real rule DSL.
 * Rules are evaluated by id with hardcoded condition checks. Good enough for casual play.
 * Upgrade path: a real condition evaluator per card (data-driven).
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
}

export type BotAction = 'buy' | 'sell' | 'hold';

// Check whether a single rule's condition is satisfied given the bot context.
function isConditionMet(rule: RuleCard, ctx: BotContext): boolean {
  const { price, priceHistory, position, cash, startCash, recentNews, tickIndex, totalTicks, allTimeHigh, allTimeLow } = ctx;
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
  const downThreeInARow = recent.length >= 3 && prev < prevPrev && cur < prev;
  const isFlat = recent.length >= 3 && Math.max(...recent) - Math.min(...recent) < recent[recent.length - 1] * 0.01;
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
  const lastTwoSameMood = lastNews && prevNews && lastNews.magnitude === prevNews.magnitude && lastNews.magnitude !== 'neutral';
  const twoPositiveInRow = lastNews && prevNews && (lastNews.magnitude === 'positive' || lastNews.magnitude === 'very_positive') && (prevNews.magnitude === 'positive' || prevNews.magnitude === 'very_positive');
  const twoNegativeInRow = lastNews && prevNews && (lastNews.magnitude === 'negative' || lastNews.magnitude === 'very_negative') && (prevNews.magnitude === 'negative' || prevNews.magnitude === 'very_negative');
  const threePositiveInRow = twoPositiveInRow && prevPrevNews && (prevPrevNews.magnitude === 'positive' || prevPrevNews.magnitude === 'very_positive');
  const lastWasPositive = lastNews && (lastNews.magnitude === 'positive' || lastNews.magnitude === 'very_positive');
  const lastWasNegative = lastNews && (lastNews.magnitude === 'negative' || lastNews.magnitude === 'very_negative');
  const lastWasVeryPositive = lastNews && lastNews.magnitude === 'very_positive';
  const lastWasVeryNegative = lastNews && lastNews.magnitude === 'very_negative';
  const lastWasNeutral = lastNews && lastNews.magnitude === 'neutral';
  const anyNegative = recentNews.some(n => n.magnitude === 'negative' || n.magnitude === 'very_negative');
  const anyPositive = recentNews.some(n => n.magnitude === 'positive' || n.magnitude === 'very_positive');
  const prevWasPositive = prevNews && (prevNews.magnitude === 'positive' || prevNews.magnitude === 'very_positive');
  const luckyDigit = 7;
  const endsInLucky = Math.floor(cur * 100) % 10 === luckyDigit;

  switch (rule.id) {
    // PRICE (1-20)
    case 'r001': return !(isAtAllTimeHigh); // never buy at ATH → condition: NOT at ATH
    case 'r002': return dropPct <= -0.05;
    case 'r003': return spikePct >= 0.05;
    case 'r004': return isNearLow;
    case 'r005': return !isAt5TickHigh;
    case 'r006': return position ? cur < position.avgBuyPrice : false;
    case 'r007': return position ? cur < position.avgBuyPrice : false;
    case 'r008': return isAt5TickHigh;
    case 'r009': return isFlat;
    case 'r010': return isNearHigh && isFlat;
    case 'r011': return upThreeInARow;
    case 'r012': return downThreeInARow;
    case 'r013': return dropPct <= -0.04;
    case 'r014': return spikePct >= 0.04;
    case 'r015': return spikePct >= 0.06;
    case 'r016': return !isNearLow && !isNearHigh;
    case 'r017': return Math.floor(cur) !== cur; // crossed a round number (decimal present near round)
    case 'r018': return isAtAllTimeLow && cur > prev;
    case 'r019': return downThreeInARow && !upThreeInARow;
    case 'r020': return !isNearLow && !isNearHigh && !isFlat;

    // NEWS / SENTIMENT (21-45)
    case 'r021': return !!lastWasVeryPositive;
    case 'r022': return !!lastWasVeryNegative;
    case 'r023': return !!twoPositiveInRow;
    case 'r024': return !!twoNegativeInRow;
    case 'r025': return !!lastNews; // contrarian: act on any news (direction handled by action override)
    case 'r026': return !!lastNews;
    case 'r027': return !!lastWasNeutral;
    case 'r028': return !!lastWasNeutral;
    case 'r029': return !!lastNews;
    case 'r030': return !!threePositiveInRow;
    case 'r031': return !!lastWasVeryNegative;
    case 'r032': return !!lastWasVeryPositive;
    case 'r033': return !!lastNews;
    case 'r034': return !!lastWasNegative;
    case 'r035': return !!lastWasVeryPositive || !!lastWasVeryNegative;
    case 'r036': return !!lastWasPositive;
    case 'r037': return !!lastWasNegative;
    case 'r038': return !!lastWasNegative && !lastWasVeryNegative && prevWasPositive;
    case 'r039': return !!lastWasPositive;
    case 'r040': return tickIndex === 0 && !!lastNews;
    case 'r041': return !!lastNews;
    case 'r042': return !!lastWasPositive;
    case 'r043': return !!lastWasNegative;
    case 'r044': return !!lastWasPositive && !prevWasPositive;
    case 'r045': return !!lastTwoSameMood;

    // POSITION / RISK (46-65)
    case 'r046': return cash > 0;
    case 'r047': return !!position && tickIndex > 2;
    case 'r048': return !!position && posProfit < 0;
    case 'r049': return !!position && posProfit > 0;
    case 'r050': return !!position && posProfit >= 15;
    case 'r051': return !!position && posProfit >= 5;
    case 'r052': return !position && cash > 0;
    case 'r053': return !!position;
    case 'r054': return !!position && posProfit < 0;
    case 'r055': return !!position && posProfit > 0;
    case 'r056': return !!position && posLossPct >= 0.08;
    case 'r057': return !!position && posProfit >= 20;
    case 'r058': return !!position && posLossPct < 0.05;
    case 'r059': return !!position && tickIndex > 0;
    case 'r060': return !!position;
    case 'r061': return cashRatio > 0.25;
    case 'r062': return cashRatio < 0.25;
    case 'r063': return roundProfit > 0;
    case 'r064': return roundProfit > 0;
    case 'r065': return cash > 0;

    // MOMENTUM (66-80)
    case 'r066': return upThreeInARow;
    case 'r067': return downThreeInARow;
    case 'r068': return isFlat && recent.length >= 3;
    case 'r069': return isFlat;
    case 'r070': return spikePct >= 0.04;
    case 'r071': return upThreeInARow;
    case 'r072': return downThreeInARow;
    case 'r073': return isFlat;
    case 'r074': return spikePct >= 0.04 && prevPrev > 0 && (cur - prevPrev) / prevPrev >= 0.04;
    case 'r075': return dropPct <= -0.04 && prevPrev > 0 && (cur - prevPrev) / prevPrev <= -0.04;
    case 'r076': return isChoppy;
    case 'r077': return upThreeInARow && isFlat === false;
    case 'r078': return isChoppy;
    case 'r079': return isNearHigh && isFlat;
    case 'r080': return isNearLow && isFlat;

    // TIME (81-90)
    case 'r081': return isEarly;
    case 'r082': return isLate;
    case 'r083': return isMiddle;
    case 'r084': return isEarly;
    case 'r085': return tickIndex < 3;
    case 'r086': return tickIndex <= 1;
    case 'r087': return isLate;
    case 'r088': return tickIndex < 3;
    case 'r089': return isLate;
    case 'r090': return tickIndex % 2 === 0;

    // WILD (91-100)
    case 'r091': return Math.random() < 0.5;
    case 'r092': return endsInLucky;
    case 'r093': return Math.floor(cur * 100) % 10 === 4; // "unlucky" 4
    case 'r094': return Math.random() < 0.5;
    case 'r095': return !!lastNews;
    case 'r096': return Math.random() < 0.4;
    case 'r097': return upThreeInARow;
    case 'r098': return true; // always hold
    case 'r099': return dropPct < -0.02 || !!lastWasNegative;
    case 'r100': return true; // always hold

    default: return false;
  }
}

/**
 * Resolve the bot's action for this tick given the equipped rules.
 *
 * Priority: hard overrides (buy/sell/hold) fire first in card order.
 * If multiple hard overrides fire, the first one wins.
 * If no hard override fires, 'auto' cards vote: net positive → buy, net negative → sell, else hold.
 *
 * ponytail: ceiling — first-wins priority is simple but can produce surprising behavior
 * when many cards fire. Upgrade path: weighted voting across all firing cards.
 */
export function resolveBotAction(rules: RuleCard[], ctx: BotContext): { action: BotAction; firedRule: RuleCard | null } {
  // 1. Hard overrides in order.
  for (const rule of rules) {
    if (rule.action === 'auto') continue;
    if (isConditionMet(rule, ctx)) {
      // Guard: can't buy with no cash, can't sell with no position.
      if (rule.action === 'buy' && ctx.cash < 1) continue;
      if (rule.action === 'sell' && !ctx.position) continue;
      return { action: rule.action, firedRule: rule };
    }
  }

  // 2. Auto cards vote.
  let score = 0;
  let firedAuto: RuleCard | null = null;
  for (const rule of rules) {
    if (rule.action !== 'auto') continue;
    if (isConditionMet(rule, ctx)) {
      // Heuristic: the card's category hints at direction.
      // news/sentiment/streak/price/momentum 'auto' cards lean toward acting on the last news direction.
      firedAuto = firedAuto ?? rule;
      const lastNews = ctx.recentNews[0];
      if (lastNews) {
        const sign = lastNews.magnitude === 'very_positive' || lastNews.magnitude === 'positive' ? 1 :
                     lastNews.magnitude === 'very_negative' || lastNews.magnitude === 'negative' ? -1 : 0;
        score += sign;
      } else {
        // No news yet: lean toward buying if we have cash and no position, else hold.
        if (!ctx.position && ctx.cash > 0) score += 1;
      }
    }
  }

  if (score > 0 && ctx.cash >= 1) return { action: 'buy', firedRule: firedAuto };
  if (score < 0 && ctx.position) return { action: 'sell', firedRule: firedAuto };
  return { action: 'hold', firedRule: null };
}
