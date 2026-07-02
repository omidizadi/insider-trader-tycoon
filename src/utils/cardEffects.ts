import { RuleCard, ActiveCardEffect, CardEffect } from '../types';

/**
 * Card Effects Engine — processes non-trade card effects (chart mods, events, passives).
 *
 * This is separate from botEngine.ts (which handles buy/sell/hold decisions).
 * Here we handle: price modifications, tick addition/removal, random events,
 * passive buffs, and chart modifications.
 *
 * ponytail: ceiling — this is a naive effect processor, not a real event system.
 * Effects are processed in order with hardcoded handlers. Good enough for casual play.
 */

export interface EffectContext {
  tickIndex: number;
  totalTicks: number;
  chartPoints: number[];
  cash: number;
  startCash: number;
  position: { avgBuyPrice: number; investedCash: number; shares: number } | null;
  roundScript: { prices: number[]; historyLength: number } | null;
  activeEffects: ActiveCardEffect[];
}

export interface EffectResult {
  // Modified next-tick price (if a price modification occurred).
  modifiedNextPrice: number | null;
  // Ticks to add (positive) or remove (negative) from the round.
  tickDelta: number;
  // Cash modification (e.g., paper shredder loses cash, phoenix revives).
  cashDelta: number;
  // New active effects to add.
  newEffects: ActiveCardEffect[];
  // Effects to remove (by cardId).
  removeEffectCardIds: string[];
  // Event banner text to show the player (if any).
  eventBanner: string | null;
  // Whether to force-sell the position (e.g., margin call, insurance).
  forceSell: boolean;
  // Whether to force-buy (e.g., quantum trade).
  forceBuy: boolean;
}

/**
 * Initialize active effects for a round based on the player's equipped cards.
 * Passive and chart_modify effects are activated at round start.
 */
export function initRoundEffects(equippedCards: RuleCard[]): ActiveCardEffect[] {
  const effects: ActiveCardEffect[] = [];
  for (const card of equippedCards) {
    if (!card.effect) continue;
    if (card.effectType === 'passive' || card.effectType === 'chart_modify' || card.effectType === 'event') {
      effects.push({
        cardId: card.id,
        kind: card.effect.kind,
        magnitude: card.effect.magnitude,
        remainingTicks: -1, // permanent for the round
      });
    }
  }
  return effects;
}

/**
 * Process a fired card's effect (for hybrid/event cards that trigger on actions).
 * Called when a card fires during the bot's action resolution.
 */
export function processFiredCardEffect(
  card: RuleCard,
  ctx: EffectContext,
): EffectResult {
  const result: EffectResult = {
    modifiedNextPrice: null,
    tickDelta: 0,
    cashDelta: 0,
    newEffects: [],
    removeEffectCardIds: [],
    eventBanner: null,
    forceSell: false,
    forceBuy: false,
  };

  if (!card.effect) return result;

  switch (card.effect.kind) {
    case 'price_whisperer':
      // Next tick +1% after buy
      result.modifiedNextPrice = applyPriceShift(ctx, card.effect.magnitude / 100);
      result.eventBanner = `🔮 Price Whisperer: next tick +${card.effect.magnitude}%`;
      break;

    case 'bear_spray':
      // Extra -2% on loss sell
      if (ctx.position && ctx.chartPoints.length > 0) {
        const cur = ctx.chartPoints[ctx.chartPoints.length - 1];
        if (cur < ctx.position.avgBuyPrice) {
          result.modifiedNextPrice = applyPriceShift(ctx, -card.effect.magnitude / 100);
          result.eventBanner = `🐻 Bear Spray: extra -${card.effect.magnitude}% on chart`;
        }
      }
      break;

    case 'bull_whisper':
      // +1 tick on buy
      result.tickDelta = card.effect.magnitude;
      result.eventBanner = `🐂 Bull Whisper: +${card.effect.magnitude} tick(s)`;
      break;

    case 'time_warp':
      // -1 tick on sell
      result.tickDelta = -card.effect.magnitude;
      result.eventBanner = `⏳ Time Warp: -${card.effect.magnitude} tick(s)`;
      break;

    case 'lucky_bounce':
      // Guaranteed green after dip buy
      result.newEffects.push({
        cardId: card.id,
        kind: 'guarantee_green',
        magnitude: 1,
        remainingTicks: 1,
      });
      result.eventBanner = `🍀 Lucky Bounce: next tick guaranteed green`;
      break;

    case 'jinx':
      // 2 red ticks after sell
      result.newEffects.push({
        cardId: card.id,
        kind: 'guarantee_red',
        magnitude: card.effect.magnitude,
        remainingTicks: card.effect.magnitude,
      });
      result.eventBanner = `💀 Jinx: next ${card.effect.magnitude} ticks guaranteed red`;
      break;

    case 'whale_buy':
      // +3% next tick after buy
      result.modifiedNextPrice = applyPriceShift(ctx, card.effect.magnitude / 100);
      result.eventBanner = `🐋 Whale Buy: +${card.effect.magnitude}% next tick`;
      break;

    case 'paper_shredder':
      // Lose 10% cash, 2x next sell
      result.cashDelta = -ctx.cash * (card.effect.magnitude / 100);
      result.newEffects.push({
        cardId: card.id,
        kind: 'double_or_nothing', // reuse as "2x next sell" flag
        magnitude: 2,
        remainingTicks: 1,
      });
      result.eventBanner = `📄 Paper Shredder: -${card.effect.magnitude}% cash, 2x next sell`;
      break;

    case 'double_or_nothing':
      // Coin flip on profit sell
      if (ctx.position && ctx.chartPoints.length > 0) {
        const cur = ctx.chartPoints[ctx.chartPoints.length - 1];
        const posValue = ctx.position.shares * cur;
        const profit = posValue - ctx.position.investedCash;
        if (profit > 0) {
          const won = Math.random() < 0.5;
          if (won) {
            result.cashDelta = profit; // double the profit
            result.eventBanner = `🎲 Double or Nothing: WON! +${profit.toFixed(2)}`;
          } else {
            result.forceSell = true; // lose it all (sell at current price, no profit kept)
            result.eventBanner = `🎲 Double or Nothing: LOST it all`;
          }
        }
      }
      break;

    case 'tax_collector':
      // Tax 20% profit, stabilize chart (reduce volatility)
      result.newEffects.push({
        cardId: card.id,
        kind: 'stability_anchor',
        magnitude: 20,
        remainingTicks: -1,
      });
      result.eventBanner = `💰 Tax Collector: 20% tax, chart stabilized`;
      break;

    case 'margin_call':
      // Force sell at -15%, 2x next buy
      if (ctx.position && ctx.chartPoints.length > 0) {
        const cur = ctx.chartPoints[ctx.chartPoints.length - 1];
        const posValue = ctx.position.shares * cur;
        const lossPct = (ctx.position.investedCash - posValue) / ctx.position.investedCash;
        if (lossPct >= card.effect.magnitude / 100) {
          result.forceSell = true;
          result.newEffects.push({
            cardId: card.id,
            kind: 'revenge_trade',
            magnitude: 200, // 2x = 200%
            remainingTicks: 1,
          });
          result.eventBanner = `📞 Margin Call: force sold at -${card.effect.magnitude}%, 2x next buy`;
        }
      }
      break;

    case 'revenge_trade':
      // +15% buy cash after loss
      result.newEffects.push({
        cardId: card.id,
        kind: 'revenge_trade',
        magnitude: 100 + card.effect.magnitude, // 115% = 1.15x
        remainingTicks: 1,
      });
      break;

    case 'vampire':
      // Drain 5% profit to permanent bonus (simplified: just add cash)
      if (ctx.position && ctx.chartPoints.length > 0) {
        const cur = ctx.chartPoints[ctx.chartPoints.length - 1];
        const posValue = ctx.position.shares * cur;
        const profit = posValue - ctx.position.investedCash;
        if (profit > 0) {
          result.cashDelta = profit * (card.effect.magnitude / 100);
          result.eventBanner = `🧛 Vampire: drained ${card.effect.magnitude}% profit`;
        }
      }
      break;

    case 'puppet_master':
      // Manual override — handled in UI, not here
      result.eventBanner = `🎭 Puppet Master: override available`;
      break;

    case 'architect':
      // Design first 3 ticks — handled in UI
      result.eventBanner = `🏗️ Architect: design first 3 ticks`;
      break;

    case 'directors_cut':
      // Add/remove ticks — handled in UI
      result.eventBanner = `🎬 Director's Cut: add/remove ticks available`;
      break;

    case 'time_lord_supreme':
      // +5 ticks at -50% return
      {
        const totalMoney = ctx.cash + (ctx.position ? ctx.position.shares * (ctx.chartPoints[ctx.chartPoints.length - 1] ?? 0) : 0);
        const returnPct = ctx.startCash > 0 ? (totalMoney - ctx.startCash) / ctx.startCash : 0;
        if (returnPct <= -0.5) {
          result.tickDelta = card.effect.magnitude;
          result.eventBanner = `👑 Time Lord Supreme: +${card.effect.magnitude} ticks (return at -50%)`;
          result.removeEffectCardIds.push(card.id); // one-time
        }
      }
      break;

    case 'paradox_engine':
      // +1 tick per card fire
      result.tickDelta = card.effect.magnitude;
      result.eventBanner = `♾️ Paradox Engine: +${card.effect.magnitude} tick`;
      break;

    case 'singularity':
      // Instant win at 100% return — handled in round eval, but show banner
      {
        const totalMoney = ctx.cash + (ctx.position ? ctx.position.shares * (ctx.chartPoints[ctx.chartPoints.length - 1] ?? 0) : 0);
        const returnPct = ctx.startCash > 0 ? (totalMoney - ctx.startCash) / ctx.startCash : 0;
        if (returnPct >= 1.0) {
          result.eventBanner = `🌌 Singularity: return >100%, instant victory!`;
        }
      }
      break;

    case 'second_chance':
      // Replay round on fail — handled in round eval
      result.eventBanner = `🔄 Second Chance: will replay if goal fails`;
      break;

    case 'void_walker':
      // Remove worst 2 ticks — handled in round eval
      result.eventBanner = `🕳️ Void Walker: worst 2 ticks will be erased`;
      break;

    case 'final_card':
      // Fires all basic conditions — handled in botEngine
      result.eventBanner = `🃏 The Final Card: all basic conditions active`;
      break;

    default:
      // Other effects (flash_crash, whale_pump, etc.) are random events
      // processed in processTickEffects, not here.
      break;
  }

  return result;
}

/**
 * Process tick-level effects: random events, chart modifications, passive buffs.
 * Called each tick before the bot decides its action.
 */
export function processTickEffects(ctx: EffectContext): EffectResult {
  const result: EffectResult = {
    modifiedNextPrice: null,
    tickDelta: 0,
    cashDelta: 0,
    newEffects: [],
    removeEffectCardIds: [],
    eventBanner: null,
    forceSell: false,
    forceBuy: false,
  };

  for (const effect of ctx.activeEffects) {
    switch (effect.kind) {
      case 'guarantee_green':
        // Force next tick to be green
        result.modifiedNextPrice = applyPriceShift(ctx, 0.02); // +2%
        result.eventBanner = `🍀 Guaranteed green tick`;
        break;

      case 'guarantee_red':
        // Force next tick to be red
        result.modifiedNextPrice = applyPriceShift(ctx, -0.02); // -2%
        result.eventBanner = `💀 Guaranteed red tick`;
        break;

      case 'chaos_monkey':
        // Every 3 ticks, random ±3% shift
        if (ctx.tickIndex > 0 && ctx.tickIndex % 3 === 0) {
          const direction = Math.random() < 0.5 ? -1 : 1;
          result.modifiedNextPrice = applyPriceShift(ctx, direction * effect.magnitude / 100);
          result.eventBanner = `🐒 Chaos Monkey: ${direction > 0 ? '+' : '-'}${effect.magnitude}% shift`;
        }
        break;

      case 'chaos_theory':
        // 10% chance of random 10% move each tick
        if (Math.random() < 0.1) {
          const direction = Math.random() < 0.5 ? -1 : 1;
          result.modifiedNextPrice = applyPriceShift(ctx, direction * effect.magnitude / 100);
          result.eventBanner = `🦋 Chaos Theory: random ${direction > 0 ? '+' : '-'}${effect.magnitude}% move`;
        }
        break;

      case 'flash_crash':
        // Random 15% crash (low probability per tick)
        if (Math.random() < 0.08) {
          result.modifiedNextPrice = applyPriceShift(ctx, -effect.magnitude / 100);
          result.eventBanner = `💥 Flash Crash: -${effect.magnitude}%!`;
          result.removeEffectCardIds.push(effect.cardId); // one-time
        }
        break;

      case 'whale_pump':
        // Random 15% pump (low probability per tick)
        if (Math.random() < 0.08) {
          result.modifiedNextPrice = applyPriceShift(ctx, effect.magnitude / 100);
          result.eventBanner = `🐳 Whale Pump: +${effect.magnitude}%!`;
          result.removeEffectCardIds.push(effect.cardId); // one-time
        }
        break;

      case 'black_swan':
        // Once per round, 20% random move
        if (Math.random() < 0.05) {
          const direction = Math.random() < 0.5 ? -1 : 1;
          result.modifiedNextPrice = applyPriceShift(ctx, direction * effect.magnitude / 100);
          result.eventBanner = `🦢 Black Swan: ${direction > 0 ? '+' : '-'}${effect.magnitude}% impossible move!`;
          result.removeEffectCardIds.push(effect.cardId); // one-time
        }
        break;

      case 'flash_sale':
        // Random 5% drop for 1 tick
        if (Math.random() < 0.1) {
          result.modifiedNextPrice = applyPriceShift(ctx, -effect.magnitude / 100);
          result.eventBanner = `⚡ Flash Sale: -${effect.magnitude}% glitch`;
          result.removeEffectCardIds.push(effect.cardId); // one-time
        }
        break;

      case 'glitch_rewind':
        // Randomly rewind 2 ticks
        if (Math.random() < 0.1 && ctx.chartPoints.length >= 2) {
          const rewindPrice = ctx.chartPoints[ctx.chartPoints.length - 3] ?? ctx.chartPoints[0];
          result.modifiedNextPrice = rewindPrice;
          result.eventBanner = `🟢 Glitch in the Matrix: price rewound 2 ticks`;
          result.removeEffectCardIds.push(effect.cardId); // one-time
        }
        break;

      case 'safety_net_cash':
        // Refill to 50% if below
        if (ctx.cash < ctx.startCash * (effect.magnitude / 100)) {
          result.cashDelta = ctx.startCash * (effect.magnitude / 100) - ctx.cash;
          result.eventBanner = `🪂 Safety Net: refilled to ${effect.magnitude}% of start`;
          result.removeEffectCardIds.push(effect.cardId); // one-time
        }
        break;

      case 'phoenix':
        // Revive with $100 if at $0
        if (ctx.cash <= 0) {
          result.cashDelta = effect.magnitude;
          result.eventBanner = `🔥 Phoenix: revived with $${effect.magnitude}!`;
          result.removeEffectCardIds.push(effect.cardId); // one-time
        }
        break;

      case 'insurance':
        // Auto-sell at -10% (force sell, handled by bot guard too)
        if (ctx.position && ctx.chartPoints.length > 0) {
          const cur = ctx.chartPoints[ctx.chartPoints.length - 1];
          const lossPct = (ctx.position.avgBuyPrice - cur) / ctx.position.avgBuyPrice;
          if (lossPct >= effect.magnitude / 100) {
            result.forceSell = true;
            result.eventBanner = `🛡️ Insurance: auto-sold at -${effect.magnitude}%`;
          }
        }
        break;

      case 'infinity_stone':
        // Position can't drop below 90% of entry — clamp price
        if (ctx.position && ctx.chartPoints.length > 0) {
          const floor = ctx.position.avgBuyPrice * (effect.magnitude / 100);
          const cur = ctx.chartPoints[ctx.chartPoints.length - 1];
          if (cur < floor && result.modifiedNextPrice === null) {
            result.modifiedNextPrice = floor;
          }
        }
        break;

      case 'price_floor':
        // Price can't drop below X% of when card was activated
        if (ctx.chartPoints.length > 0) {
          const floorPrice = (effect.data ?? ctx.chartPoints[0]) * (effect.magnitude / 100);
          const cur = ctx.chartPoints[ctx.chartPoints.length - 1];
          if (cur < floorPrice && result.modifiedNextPrice === null) {
            result.modifiedNextPrice = floorPrice;
          }
        }
        break;

      case 'price_ceiling':
        // Price can't rise above X% of when card was activated
        if (ctx.chartPoints.length > 0) {
          const ceilingPrice = (effect.data ?? ctx.chartPoints[0]) * (effect.magnitude / 100);
          const cur = ctx.chartPoints[ctx.chartPoints.length - 1];
          if (cur > ceilingPrice && result.modifiedNextPrice === null) {
            result.modifiedNextPrice = ceilingPrice;
          }
        }
        break;

      case 'gravity_well':
        // Pull price 2% toward round average
        if (ctx.chartPoints.length > 2) {
          const avg = ctx.chartPoints.reduce((a, b) => a + b, 0) / ctx.chartPoints.length;
          const cur = ctx.chartPoints[ctx.chartPoints.length - 1];
          const shift = (avg - cur) * (effect.magnitude / 100);
          result.modifiedNextPrice = Math.max(1, Number((cur + shift).toFixed(2)));
        }
        break;

      case 'momentum_engine':
        // Green streaks compound +0.5%
        if (ctx.chartPoints.length >= 2) {
          const prev = ctx.chartPoints[ctx.chartPoints.length - 2];
          const cur = ctx.chartPoints[ctx.chartPoints.length - 1];
          if (cur > prev) {
            // Count consecutive green
            let streak = 0;
            for (let i = ctx.chartPoints.length - 1; i > 0; i--) {
              if (ctx.chartPoints[i] > ctx.chartPoints[i - 1]) streak++;
              else break;
            }
            const bonus = streak * (effect.magnitude / 100);
            result.modifiedNextPrice = applyPriceShift(ctx, bonus);
          }
        }
        break;

      case 'panic_spiral':
        // Red streaks compound -0.5%
        if (ctx.chartPoints.length >= 2) {
          const prev = ctx.chartPoints[ctx.chartPoints.length - 2];
          const cur = ctx.chartPoints[ctx.chartPoints.length - 1];
          if (cur < prev) {
            let streak = 0;
            for (let i = ctx.chartPoints.length - 1; i > 0; i--) {
              if (ctx.chartPoints[i] < ctx.chartPoints[i - 1]) streak++;
              else break;
            }
            const drop = streak * (effect.magnitude / 100);
            result.modifiedNextPrice = applyPriceShift(ctx, -drop);
          }
        }
        break;

      case 'mirror_mirror':
        // Invert each tick's direction
        if (ctx.chartPoints.length >= 2) {
          const prev = ctx.chartPoints[ctx.chartPoints.length - 2];
          const cur = ctx.chartPoints[ctx.chartPoints.length - 1];
          const move = cur - prev;
          result.modifiedNextPrice = Math.max(1, Number((cur - move).toFixed(2)));
        }
        break;

      case 'blood_moon':
        // Last 3 ticks: moves doubled
        if (ctx.tickIndex >= ctx.totalTicks - 3 && ctx.chartPoints.length >= 2) {
          const prev = ctx.chartPoints[ctx.chartPoints.length - 2];
          const cur = ctx.chartPoints[ctx.chartPoints.length - 1];
          const move = cur - prev;
          result.modifiedNextPrice = Math.max(1, Number((cur + move * (effect.magnitude - 1)).toFixed(2)));
        }
        break;

      case 'golden_hour':
        // First 3 ticks: moves halved
        if (ctx.tickIndex < 3 && ctx.chartPoints.length >= 2) {
          const prev = ctx.chartPoints[ctx.chartPoints.length - 2];
          const cur = ctx.chartPoints[ctx.chartPoints.length - 1];
          const move = cur - prev;
          result.modifiedNextPrice = Math.max(1, Number((cur - move * (1 - effect.magnitude)).toFixed(2)));
        }
        break;

      case 'elastic_band':
        // Snap to 20-tick moving average within 3 ticks
        if (ctx.chartPoints.length >= 3 && ctx.tickIndex % 3 === 0) {
          const windowSize = Math.min(20, ctx.chartPoints.length);
          const ma = ctx.chartPoints.slice(-windowSize).reduce((a, b) => a + b, 0) / windowSize;
          const cur = ctx.chartPoints[ctx.chartPoints.length - 1];
          const shift = (ma - cur) * 0.3; // 30% toward MA
          result.modifiedNextPrice = Math.max(1, Number((cur + shift).toFixed(2)));
        }
        break;

      case 'squeeze':
        // Short squeeze on 3+ red streak: +10%
        if (ctx.chartPoints.length >= 3) {
          let redStreak = 0;
          for (let i = ctx.chartPoints.length - 1; i > 0; i--) {
            if (ctx.chartPoints[i] < ctx.chartPoints[i - 1]) redStreak++;
            else break;
          }
          if (redStreak >= 3) {
            result.modifiedNextPrice = applyPriceShift(ctx, effect.magnitude / 100);
            result.eventBanner = `🫧 Squeeze Play: +${effect.magnitude}% short squeeze!`;
            result.removeEffectCardIds.push(effect.cardId); // one-time
          }
        }
        break;

      case 'dead_cat_bounce':
        // Bounce 5% after biggest drop — simplified: random trigger
        if (Math.random() < 0.1) {
          result.modifiedNextPrice = applyPriceShift(ctx, effect.magnitude / 100);
          result.eventBanner = `🐱 Dead Cat Bounce: +${effect.magnitude}%`;
          result.removeEffectCardIds.push(effect.cardId); // one-time
        }
        break;

      case 'circuit_breaker':
        // Halt on 8%+ move — handled by skipping tick (simplified: just show banner)
        if (ctx.chartPoints.length >= 2) {
          const prev = ctx.chartPoints[ctx.chartPoints.length - 2];
          const cur = ctx.chartPoints[ctx.chartPoints.length - 1];
          const movePct = Math.abs((cur - prev) / prev);
          if (movePct >= effect.magnitude / 100) {
            result.eventBanner = `🔌 Circuit Breaker: halt on ${effect.magnitude}%+ move`;
            // Simplified: no actual halt, just notification
          }
        }
        break;

      // === One-time round-start effects (fire on tick 1, then removed) ===
      case 'cheat_code':
        if (ctx.tickIndex <= 1) {
          result.cashDelta = ctx.startCash * (effect.magnitude - 1);
          result.eventBanner = `🎮 Cheat Code: starting cash x${effect.magnitude}!`;
          result.removeEffectCardIds.push(effect.cardId);
        }
        break;

      case 'gambler':
        if (ctx.tickIndex <= 1) {
          const won = Math.random() < 0.5;
          if (won) {
            result.cashDelta = ctx.startCash;
            result.eventBanner = `🎰 Gambler: WON! 2x starting cash!`;
          } else {
            result.cashDelta = -ctx.startCash * 0.5;
            result.eventBanner = `🎰 Gambler: LOST! Half your cash gone...`;
          }
          result.removeEffectCardIds.push(effect.cardId);
        }
        break;

      case 'time_lord':
        if (ctx.tickIndex <= 1) {
          result.tickDelta = effect.magnitude;
          result.eventBanner = `⏰ Time Lord: +${effect.magnitude} ticks to round!`;
          result.removeEffectCardIds.push(effect.cardId);
        }
        break;

      case 'speed_run':
        if (ctx.tickIndex <= 1) {
          result.tickDelta = -effect.magnitude;
          result.eventBanner = `⚡ Speed Run: -${effect.magnitude} ticks!`;
          result.removeEffectCardIds.push(effect.cardId);
        }
        break;

      // === Ongoing chart modifications ===
      case 'volatility_pump':
        if (ctx.chartPoints.length >= 2) {
          const noise = (Math.random() - 0.5) * (effect.magnitude / 250);
          result.modifiedNextPrice = applyPriceShift(ctx, noise);
        }
        break;

      case 'stability_anchor':
        if (ctx.chartPoints.length >= 3) {
          const avg3 = ctx.chartPoints.slice(-3).reduce((a, b) => a + b, 0) / 3;
          const curPrice = ctx.chartPoints[ctx.chartPoints.length - 1];
          const shift = (avg3 - curPrice) * (effect.magnitude / 100) * 0.3;
          result.modifiedNextPrice = Math.max(1, Number((curPrice + shift).toFixed(2)));
        }
        break;

      // Effects handled at trade-time in ActiveGame.tsx or round-eval
      case 'midas_touch':
      case 'midas_buy':
      case 'market_maker':
      case 'double_exposure':
      case 'alchemist':
      case 'compound_interest':
      case 'hodl_king':
      case 'plot_armor':
      case 'insider_tip':
      case 'crystal_ball':
      case 'fog_of_war':
      case 'sugar_rush':
      case 'quantum_trade':
      case 'time_lord_supreme':
      case 'paradox_engine':
      case 'void_walker':
      case 'second_chance':
      case 'singularity':
      case 'reveal_future':
      case 'hide_chart':
        break;

      default:
        break;
    }
  }

  return result;
}

/**
 * Apply a percentage shift to the next price.
 * Helper for effects that modify the chart.
 */
function applyPriceShift(ctx: EffectContext, shiftPct: number): number | null {
  if (ctx.chartPoints.length === 0) return null;
  const cur = ctx.chartPoints[ctx.chartPoints.length - 1];
  return Math.max(1, Number((cur * (1 + shiftPct)).toFixed(2)));
}

/**
 * Decrement remaining ticks for all active effects and remove expired ones.
 */
export function tickDownEffects(effects: ActiveCardEffect[]): ActiveCardEffect[] {
  return effects
    .map(e => ({
      ...e,
      remainingTicks: e.remainingTicks > 0 ? e.remainingTicks - 1 : e.remainingTicks,
    }))
    .filter(e => e.remainingTicks !== 0);
}

/**
 * Check if a card has a non-trade effect that should fire on action.
 */
export function hasActionEffect(card: RuleCard): boolean {
  return card.effectType === 'hybrid' || card.effectType === 'event';
}

/**
 * Get all passive/chart_modify effects from equipped cards (for round init).
 */
export function getPassiveEffects(cards: RuleCard[]): ActiveCardEffect[] {
  return initRoundEffects(cards);
}
