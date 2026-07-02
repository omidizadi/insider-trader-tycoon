import { RuleCard } from '../types';

/**
 * 120 tiered rule cards for the Trading Bot — rogue-like deck builder.
 *
 * 6 tiers with decreasing drop rates:
 *   🟫 T0 Basic     (30) — simple buy/sell/hold triggers. 40% drop rate.
 *   🟩 T1 Uncommon  (25) — slightly more complex triggers. 25% drop rate.
 *   🟦 T2 Rare      (20) — complex triggers + small chart effects. 15% drop rate.
 *   🟪 T3 Epic      (18) — chart modifications + random events. 10% drop rate.
 *   🟧 T4 Legendary (15) — powerful multi-effects. 7% drop rate.
 *   🔴 T5 Mythic    (12) — absolutely broken mechanics. 3% drop rate.
 *
 * ponytail: ceiling — conditions are evaluated by id in botEngine.ts with
 * hardcoded checks. Card effects (chart mods/events) handled in cardEffects.ts.
 */

// Tier drop-rate weights for card offers.
export const TIER_WEIGHTS: Record<number, number> = {
  0: 40,  // Basic
  1: 25,  // Uncommon
  2: 15,  // Rare
  3: 10,  // Epic
  4: 7,   // Legendary
  5: 3,   // Mythic
};

export const RULE_CARDS: RuleCard[] = [
  // ===== 🟫 TIER 0 — BASIC (30) =====
  { id: 't001', title: 'First Blood', description: "Buy on any red tick. Everyone starts somewhere.", emoji: '🩸', action: 'buy', category: 'dip', triggerTag: 'dip', roleTag: 'entry', synergyTags: ['surge'], tier: 0, effectType: 'trade' },
  { id: 't002', title: 'Green Light', description: "Buy on any green tick. Go when it's green.", emoji: '🟢', action: 'buy', category: 'surge', triggerTag: 'surge', roleTag: 'entry', synergyTags: ['pattern'], tier: 0, effectType: 'trade' },
  { id: 't003', title: 'Paper Hands', description: 'Sell at any profit. A win is a win, no shame.', emoji: '📄', action: 'sell', category: 'position', triggerTag: 'position', roleTag: 'exit', synergyTags: ['dip'], tier: 0, effectType: 'trade' },
  { id: 't004', title: 'Panic Sell', description: 'Sell on any loss. Get out before it gets worse.', emoji: '😱', action: 'sell', category: 'position', triggerTag: 'position', roleTag: 'exit', synergyTags: ['dip'], tier: 0, effectType: 'trade' },
  { id: 't005', title: 'Dip Buyer', description: 'Buy when price drops 3%+ in one tick.', emoji: '🛒', action: 'buy', category: 'dip', triggerTag: 'dip', roleTag: 'entry', synergyTags: ['surge'], tier: 0, effectType: 'trade' },
  { id: 't006', title: 'Peak Seller', description: 'Sell when price rises 3%+ in one tick.', emoji: '🪜', action: 'sell', category: 'surge', triggerTag: 'surge', roleTag: 'exit', synergyTags: ['pattern'], tier: 0, effectType: 'trade' },
  { id: 't007', title: 'Diamond Hands', description: 'Never sell at a loss. Hold until profit appears.', emoji: '💎', action: 'hold', category: 'position', triggerTag: 'position', roleTag: 'hold', synergyTags: ['surge'], tier: 0, effectType: 'trade' },
  { id: 't008', title: 'Cash Ready', description: 'Buy on the first tick if you have cash.', emoji: '💵', action: 'buy', category: 'timing', triggerTag: 'timing', roleTag: 'entry', synergyTags: ['position'], tier: 0, effectType: 'trade' },
  { id: 't009', title: 'Quick Exit', description: 'Sell on any tick after buying. In and out.', emoji: '🏃', action: 'sell', category: 'position', triggerTag: 'position', roleTag: 'exit', synergyTags: ['timing'], tier: 0, effectType: 'trade' },
  { id: 't010', title: 'Trend Rider', description: 'Buy after 2 consecutive green ticks.', emoji: '📈', action: 'buy', category: 'surge', triggerTag: 'surge', roleTag: 'entry', synergyTags: ['pattern'], tier: 0, effectType: 'trade' },
  { id: 't011', title: 'Red Alert', description: 'Sell after 2 consecutive red ticks.', emoji: '🚨', action: 'sell', category: 'dip', triggerTag: 'dip', roleTag: 'exit', synergyTags: ['position'], tier: 0, effectType: 'trade' },
  { id: 't012', title: 'Flat Entry', description: 'Buy when price barely moves for 2+ ticks.', emoji: '🧊', action: 'buy', category: 'pattern', triggerTag: 'pattern', roleTag: 'entry', synergyTags: ['surge'], tier: 0, effectType: 'trade' },
  { id: 't013', title: 'Momentum', description: 'Buy after 3 consecutive green ticks.', emoji: '🚀', action: 'buy', category: 'surge', triggerTag: 'surge', roleTag: 'entry', synergyTags: ['pattern'], tier: 0, effectType: 'trade' },
  { id: 't014', title: 'Stop Loss', description: 'Sell if position drops 5%+ from entry.', emoji: '🛑', action: 'sell', category: 'position', triggerTag: 'position', roleTag: 'exit', synergyTags: ['dip'], tier: 0, effectType: 'trade' },
  { id: 't015', title: 'Profit Target', description: 'Sell when position is up 5%+.', emoji: '🎯', action: 'sell', category: 'position', triggerTag: 'position', roleTag: 'exit', synergyTags: ['surge'], tier: 0, effectType: 'trade' },
  { id: 't016', title: 'Last Call', description: 'Sell in the final 3 ticks of the round.', emoji: '⏰', action: 'sell', category: 'timing', triggerTag: 'timing', roleTag: 'exit', synergyTags: ['position'], tier: 0, effectType: 'trade' },
  { id: 't017', title: 'Early Bird', description: 'Buy in the first 3 ticks of the round.', emoji: '🐦', action: 'buy', category: 'timing', triggerTag: 'timing', roleTag: 'entry', synergyTags: ['position'], tier: 0, effectType: 'trade' },
  { id: 't018', title: 'All In', description: 'Buy with everything you have. Every time.', emoji: '🎰', action: 'buy', category: 'position', triggerTag: 'position', roleTag: 'entry', synergyTags: ['wild'], tier: 0, effectType: 'trade', positionSize: 1.0 },
  { id: 't019', title: 'Hold Forever', description: 'Hold through everything. Zen mode.', emoji: '🧘', action: 'hold', category: 'wild', triggerTag: 'wild', roleTag: 'hold', synergyTags: [], tier: 0, effectType: 'trade' },
  { id: 't020', title: 'Red Dip Buy', description: 'Buy when price drops 2%+ in one tick.', emoji: '📉', action: 'buy', category: 'dip', triggerTag: 'dip', roleTag: 'entry', synergyTags: ['surge'], tier: 0, effectType: 'trade' },
  { id: 't021', title: 'Green Spike Sell', description: 'Sell when price spikes 2%+ in one tick.', emoji: '📈', action: 'sell', category: 'surge', triggerTag: 'surge', roleTag: 'exit', synergyTags: ['dip'], tier: 0, effectType: 'trade' },
  { id: 't022', title: 'Double Down', description: 'Buy more when price is below your entry.', emoji: '⬇️', action: 'buy', category: 'dip', triggerTag: 'dip', roleTag: 'entry', synergyTags: ['position'], tier: 0, effectType: 'trade', positionSize: 0.3 },
  { id: 't023', title: 'Break Even', description: 'Sell when price returns to your entry price.', emoji: '⚖️', action: 'sell', category: 'position', triggerTag: 'position', roleTag: 'exit', synergyTags: ['timing'], tier: 0, effectType: 'trade' },
  { id: 't024', title: 'Mid Round', description: 'Buy at the halfway point of the round.', emoji: '🕐', action: 'buy', category: 'timing', triggerTag: 'timing', roleTag: 'entry', synergyTags: ['pattern'], tier: 0, effectType: 'trade' },
  { id: 't025', title: 'Final Push', description: 'Buy in the last third of the round.', emoji: '🏁', action: 'buy', category: 'timing', triggerTag: 'timing', roleTag: 'entry', synergyTags: ['surge'], tier: 0, effectType: 'trade' },
  { id: 't026', title: 'Steady Hand', description: 'Hold when price is within 1% of entry.', emoji: '✋', action: 'hold', category: 'position', triggerTag: 'position', roleTag: 'hold', synergyTags: ['pattern'], tier: 0, effectType: 'trade' },
  { id: 't027', title: 'Red Hold', description: 'Hold when price is down but above 3% loss.', emoji: '🔴', action: 'hold', category: 'dip', triggerTag: 'dip', roleTag: 'hold', synergyTags: ['surge'], tier: 0, effectType: 'trade' },
  { id: 't028', title: 'Green Hold', description: 'Hold when price is up but below 5% gain.', emoji: '🟢', action: 'hold', category: 'surge', triggerTag: 'surge', roleTag: 'hold', synergyTags: ['position'], tier: 0, effectType: 'trade' },
  { id: 't029', title: 'Bounce Buyer', description: 'Buy when price drops then rises in the same window.', emoji: '🎾', action: 'buy', category: 'dip', triggerTag: 'dip', roleTag: 'entry', synergyTags: ['pattern'], tier: 0, effectType: 'trade' },
  { id: 't030', title: 'Slider', description: 'Sell when price slides 3 ticks in a row.', emoji: '🛝', action: 'sell', category: 'dip', triggerTag: 'dip', roleTag: 'exit', synergyTags: ['position'], tier: 0, effectType: 'trade' },

  // ===== � TIER 1 — UNCOMMON (25) =====
  { id: 't101', title: 'Whale Watcher', description: "Buy after a big drop (5%+), assuming a whale dumped and it'll bounce.", emoji: '🐋', action: 'buy', category: 'dip', triggerTag: 'dip', roleTag: 'entry', synergyTags: ['pattern'], tier: 1, effectType: 'trade' },
  { id: 't102', title: 'Greedy Exit', description: 'Only sell at 15%+ profit. Hold out for the big slice.', emoji: '🍕', action: 'sell', category: 'position', triggerTag: 'position', roleTag: 'exit', synergyTags: ['surge'], tier: 1, effectType: 'trade' },
  { id: 't103', title: 'Reversal Rider', description: 'Buy when price bounces after 2 red ticks. The tide turns.', emoji: '🌊', action: 'buy', category: 'dip', triggerTag: 'dip', roleTag: 'entry', synergyTags: ['pattern'], tier: 1, effectType: 'trade' },
  { id: 't104', title: 'Support Bounce', description: 'Buy when price touches a recent low and bounces.', emoji: '🏗️', action: 'buy', category: 'pattern', triggerTag: 'pattern', roleTag: 'entry', synergyTags: ['dip'], tier: 1, effectType: 'trade' },
  { id: 't105', title: 'Resistance Reject', description: 'Sell when price stalls at a recent high.', emoji: '🧱', action: 'sell', category: 'pattern', triggerTag: 'pattern', roleTag: 'exit', synergyTags: ['surge'], tier: 1, effectType: 'trade' },
  { id: 't106', title: 'Volatility Rider', description: 'Buy when price is swinging wildly. Thrill seeker.', emoji: '🎢', action: 'buy', category: 'pattern', triggerTag: 'pattern', roleTag: 'entry', synergyTags: ['surge'], tier: 1, effectType: 'trade' },
  { id: 't107', title: 'Calm Before Storm', description: "Buy when price is dead flat for 3+ ticks. Something's coming.", emoji: '🧨', action: 'buy', category: 'pattern', triggerTag: 'pattern', roleTag: 'entry', synergyTags: ['surge'], tier: 1, effectType: 'trade' },
  { id: 't108', title: 'Spike Chaser', description: 'Buy after the biggest single-tick spike of the round.', emoji: '🏔️', action: 'buy', category: 'surge', triggerTag: 'surge', roleTag: 'entry', synergyTags: ['pattern'], tier: 1, effectType: 'trade' },
  { id: 't109', title: 'Bag Holder', description: 'Hold through losses up to 8%. They probably come back.', emoji: '🎒', action: 'hold', category: 'position', triggerTag: 'position', roleTag: 'hold', synergyTags: ['dip'], tier: 1, effectType: 'trade' },
  { id: 't110', title: 'Scalper', description: 'Buy and sell within 2 ticks. Quick in, quick out.', emoji: '⚡', action: 'sell', category: 'timing', triggerTag: 'timing', roleTag: 'exit', synergyTags: ['position'], tier: 1, effectType: 'trade' },
  { id: 't111', title: 'Contrarian', description: 'Buy when everyone would sell (3%+ drop). Be the hero.', emoji: '🤡', action: 'buy', category: 'dip', triggerTag: 'dip', roleTag: 'entry', synergyTags: ['surge'], tier: 1, effectType: 'trade', positionSize: 0.7 },
  { id: 't112', title: 'Trend Surfer', description: 'Buy on smooth uptrends (3+ green, no big swings).', emoji: '🏄', action: 'buy', category: 'surge', triggerTag: 'surge', roleTag: 'entry', synergyTags: ['pattern'], tier: 1, effectType: 'trade' },
  { id: 't113', title: 'Cash Guard', description: 'Only buy if you have more than half your starting cash.', emoji: '🐷', action: 'buy', category: 'position', triggerTag: 'position', roleTag: 'entry', synergyTags: ['timing'], tier: 1, effectType: 'trade', positionSize: 0.3 },
  { id: 't114', title: 'Second Wind', description: 'Buy in the second half of the round. Late game hero.', emoji: '💨', action: 'buy', category: 'timing', triggerTag: 'timing', roleTag: 'entry', synergyTags: ['surge'], tier: 1, effectType: 'trade' },
  { id: 't115', title: 'Scaled Exit', description: 'Sell when profit hits 10%. Sweet spot.', emoji: '⚖️', action: 'sell', category: 'position', triggerTag: 'position', roleTag: 'exit', synergyTags: ['surge'], tier: 1, effectType: 'trade' },
  { id: 't116', title: 'Patience', description: 'Hold for the first 3 ticks. Let the dust settle.', emoji: '🙏', action: 'hold', category: 'timing', triggerTag: 'timing', roleTag: 'hold', synergyTags: ['pattern'], tier: 1, effectType: 'trade' },
  { id: 't117', title: 'Re-Entry', description: 'Buy right after selling. Second chance, better entry.', emoji: '♻️', action: 'buy', category: 'position', triggerTag: 'position', roleTag: 'entry', synergyTags: ['timing'], tier: 1, effectType: 'trade' },
  { id: 't118', title: 'Lucky 7', description: 'Buy when the price ends in 7. Numerology is real.', emoji: '🍀', action: 'buy', category: 'wild', triggerTag: 'wild', roleTag: 'entry', synergyTags: [], tier: 1, effectType: 'trade' },
  { id: 't119', title: 'Unlucky 4', description: 'Sell when the price ends in 4. Bad juju.', emoji: '🔮', action: 'sell', category: 'wild', triggerTag: 'wild', roleTag: 'exit', synergyTags: [], tier: 1, effectType: 'trade' },
  { id: 't120', title: 'Round Tripper', description: 'Buy early, hold, sell late. The classic round trip.', emoji: '🎫', action: 'hold', category: 'timing', triggerTag: 'timing', roleTag: 'hold', synergyTags: ['surge'], tier: 1, effectType: 'trade' },
  { id: 't121', title: 'Smooth Operator', description: 'Buy on smooth uptrends with no drops.', emoji: '🎷', action: 'buy', category: 'surge', triggerTag: 'surge', roleTag: 'entry', synergyTags: ['pattern'], tier: 1, effectType: 'trade' },
  { id: 't122', title: 'Blood Bath', description: 'Buy on the biggest single-tick drop of the round.', emoji: '🦈', action: 'buy', category: 'dip', triggerTag: 'dip', roleTag: 'entry', synergyTags: ['surge'], tier: 1, effectType: 'trade', positionSize: 0.8 },
  { id: 't123', title: 'Green Streak', description: 'Buy after 2 green ticks with 1%+ spikes each.', emoji: '🦜', action: 'buy', category: 'surge', triggerTag: 'surge', roleTag: 'entry', synergyTags: ['pattern'], tier: 1, effectType: 'trade' },
  { id: 't124', title: 'Cut Losses', description: 'Sell at any loss. No questions asked.', emoji: '🩹', action: 'sell', category: 'position', triggerTag: 'position', roleTag: 'exit', synergyTags: ['dip'], tier: 1, effectType: 'trade' },
  { id: 't125', title: 'Moonshot Hold', description: 'Hold forever. Moon or bust. No in-between.', emoji: '🌙', action: 'hold', category: 'wild', triggerTag: 'wild', roleTag: 'hold', synergyTags: ['position'], tier: 1, effectType: 'trade' },

  // ===== 🟦 TIER 2 — RARE (20) =====
  { id: 't201', title: 'Price Whisperer', description: "When you buy, the next tick's price shifts +1%. You spoke it into existence.", emoji: '🔮', action: 'buy', category: 'wild', triggerTag: 'wild', roleTag: 'entry', synergyTags: ['surge'], tier: 2, effectType: 'hybrid', effect: { kind: 'price_whisperer', magnitude: 1, description: 'Next tick +1% after buy' } },
  { id: 't202', title: 'Bear Spray', description: 'When you sell at a loss, the price drops an extra 2% on the chart. Misery loves company.', emoji: '🐻', action: 'sell', category: 'dip', triggerTag: 'dip', roleTag: 'exit', synergyTags: ['position'], tier: 2, effectType: 'hybrid', effect: { kind: 'bear_spray', magnitude: 2, description: 'Extra -2% on loss sell' } },
  { id: 't203', title: 'Bull Whisper', description: 'When you buy, add 1 extra tick to the round. More time = more chances.', emoji: '🐂', action: 'buy', category: 'timing', triggerTag: 'timing', roleTag: 'entry', synergyTags: ['position'], tier: 2, effectType: 'hybrid', effect: { kind: 'bull_whisper', magnitude: 1, description: '+1 tick on buy' } },
  { id: 't204', title: 'Time Warp', description: 'When you sell, remove 1 tick from the round. Skip to the end.', emoji: '⏳', action: 'sell', category: 'timing', triggerTag: 'timing', roleTag: 'exit', synergyTags: ['position'], tier: 2, effectType: 'hybrid', effect: { kind: 'time_warp', magnitude: 1, description: '-1 tick on sell' } },
  { id: 't205', title: 'Volatility Pump', description: 'When this card fires, the chart gets 20% more volatile for the rest of the round.', emoji: '💥', action: 'hold', category: 'pattern', triggerTag: 'pattern', roleTag: 'hold', synergyTags: ['surge'], tier: 2, effectType: 'chart_modify', effect: { kind: 'volatility_pump', magnitude: 20, description: '+20% volatility' } },
  { id: 't206', title: 'Stability Anchor', description: 'When this card fires, the chart gets 20% less volatile for the rest of the round.', emoji: '⚓', action: 'hold', category: 'pattern', triggerTag: 'pattern', roleTag: 'hold', synergyTags: ['dip'], tier: 2, effectType: 'chart_modify', effect: { kind: 'stability_anchor', magnitude: 20, description: '-20% volatility' } },
  { id: 't207', title: 'Lucky Bounce', description: 'When you buy on a dip, the next tick is guaranteed to be green. Trust the bounce.', emoji: '🍀', action: 'buy', category: 'dip', triggerTag: 'dip', roleTag: 'entry', synergyTags: ['surge'], tier: 2, effectType: 'hybrid', effect: { kind: 'lucky_bounce', magnitude: 1, description: 'Guaranteed green after dip buy' } },
  { id: 't208', title: 'Curse of the Jinx', description: 'When you sell, the next 2 ticks are guaranteed red. You cursed it.', emoji: '💀', action: 'sell', category: 'wild', triggerTag: 'wild', roleTag: 'exit', synergyTags: ['dip'], tier: 2, effectType: 'hybrid', effect: { kind: 'jinx', magnitude: 2, description: '2 red ticks after sell' } },
  { id: 't209', title: 'Flash Sale', description: 'Price randomly drops 5% for 1 tick, then recovers. Buy the glitch.', emoji: '⚡', action: 'buy', category: 'wild', triggerTag: 'wild', roleTag: 'entry', synergyTags: ['dip'], tier: 2, effectType: 'event', effect: { kind: 'flash_sale', magnitude: 5, description: 'Random -5% flash drop' } },
  { id: 't210', title: 'Whale Buy', description: 'When you buy, a "whale" buys too — price jumps 3% on the next tick.', emoji: '🐋', action: 'buy', category: 'surge', triggerTag: 'surge', roleTag: 'entry', synergyTags: ['pattern'], tier: 2, effectType: 'hybrid', effect: { kind: 'whale_buy', magnitude: 3, description: '+3% next tick after buy' } },
  { id: 't211', title: 'Paper Shredder', description: 'Destroy 10% of your cash. But gain a 2x multiplier on your next sell. Gamble.', emoji: '📄', action: 'hold', category: 'wild', triggerTag: 'wild', roleTag: 'hold', synergyTags: ['position'], tier: 2, effectType: 'hybrid', effect: { kind: 'paper_shredder', magnitude: 10, description: 'Lose 10% cash, 2x next sell' } },
  { id: 't212', title: 'Insurance Policy', description: 'If your position drops 10%+, auto-sell at exactly -10%. No worse.', emoji: '🛡️', action: 'sell', category: 'position', triggerTag: 'position', roleTag: 'exit', synergyTags: ['dip'], tier: 2, effectType: 'passive', effect: { kind: 'insurance', magnitude: 10, description: 'Cap loss at -10%' } },
  { id: 't213', title: 'Mirror Mirror', description: 'Whatever the chart did last tick, it does the opposite this tick.', emoji: '🪞', action: 'hold', category: 'pattern', triggerTag: 'pattern', roleTag: 'hold', synergyTags: ['wild'], tier: 2, effectType: 'chart_modify', effect: { kind: 'mirror_mirror', magnitude: 1, description: 'Invert each tick' } },
  { id: 't214', title: 'Sugar Rush', description: 'All your buy/sell actions cost 0 fees this round. (If fees are ever added.)', emoji: '🍬', action: 'hold', category: 'wild', triggerTag: 'wild', roleTag: 'hold', synergyTags: ['position'], tier: 2, effectType: 'passive', effect: { kind: 'sugar_rush', magnitude: 0, description: 'Fee-free trades' } },
  { id: 't215', title: 'Fog of War', description: 'Hide the chart for 3 ticks. You trade blind. Risky but fun.', emoji: '🌫️', action: 'hold', category: 'wild', triggerTag: 'wild', roleTag: 'hold', synergyTags: ['pattern'], tier: 2, effectType: 'chart_modify', effect: { kind: 'fog_of_war', magnitude: 3, description: 'Hide chart 3 ticks' } },
  { id: 't216', title: 'Crystal Ball', description: 'See the next 3 ticks of the chart before they happen.', emoji: '🔮', action: 'hold', category: 'wild', triggerTag: 'wild', roleTag: 'hold', synergyTags: ['timing'], tier: 2, effectType: 'passive', effect: { kind: 'crystal_ball', magnitude: 3, description: 'Reveal next 3 ticks' } },
  { id: 't217', title: 'Double or Nothing', description: 'When you sell at a profit, flip a coin: double the profit or lose it all.', emoji: '🎲', action: 'sell', category: 'wild', triggerTag: 'wild', roleTag: 'exit', synergyTags: ['position'], tier: 2, effectType: 'hybrid', effect: { kind: 'double_or_nothing', magnitude: 2, description: 'Coin flip on profit sell' } },
  { id: 't218', title: 'Tax Collector', description: 'When you sell at a profit, lose 20% of the gain. But the chart gets more predictable.', emoji: '💰', action: 'sell', category: 'position', triggerTag: 'position', roleTag: 'exit', synergyTags: ['timing'], tier: 2, effectType: 'hybrid', effect: { kind: 'tax_collector', magnitude: 20, description: 'Tax 20% profit, stabilize chart' } },
  { id: 't219', title: 'Chaos Monkey', description: 'Every 3 ticks, randomly shift the price ±3%. Embrace chaos.', emoji: '🐒', action: 'hold', category: 'wild', triggerTag: 'wild', roleTag: 'hold', synergyTags: ['pattern'], tier: 2, effectType: 'chart_modify', effect: { kind: 'chaos_monkey', magnitude: 3, description: '±3% every 3 ticks' } },
  { id: 't220', title: 'Safety Net', description: 'If you go below 50% of starting cash, auto-refill to 50%. One-time use.', emoji: '🪂', action: 'hold', category: 'position', triggerTag: 'position', roleTag: 'hold', synergyTags: ['dip'], tier: 2, effectType: 'passive', effect: { kind: 'safety_net_cash', magnitude: 50, description: 'Refill to 50% if broke' } },

  // ===== � TIER 3 — EPIC (18) =====
  { id: 't301', title: 'Flash Crash', description: 'Randomly triggers: price crashes 15% in one tick, then recovers over 2 ticks. Buy the dip if you dare.', emoji: '💥', action: 'buy', category: 'wild', triggerTag: 'wild', roleTag: 'entry', synergyTags: ['dip'], tier: 3, effectType: 'event', effect: { kind: 'flash_crash', magnitude: 15, description: 'Random 15% crash + recovery' } },
  { id: 't302', title: 'Whale Pump', description: "Randomly triggers: price pumps 15% in one tick. If you're holding, you're rich.", emoji: '🐳', action: 'hold', category: 'wild', triggerTag: 'wild', roleTag: 'hold', synergyTags: ['surge'], tier: 3, effectType: 'event', effect: { kind: 'whale_pump', magnitude: 15, description: 'Random 15% pump' } },
  { id: 't303', title: 'Circuit Breaker', description: 'When price moves 8%+ in one tick, trading halts for 1 tick. No actions. The market needs a breather.', emoji: '🔌', action: 'hold', category: 'pattern', triggerTag: 'pattern', roleTag: 'hold', synergyTags: ['position'], tier: 3, effectType: 'event', effect: { kind: 'circuit_breaker', magnitude: 8, description: 'Halt on 8%+ moves' } },
  { id: 't304', title: 'Black Swan', description: 'Once per round, the price makes an impossible 20% move in a random direction. Chaos incarnate.', emoji: '🦢', action: 'hold', category: 'wild', triggerTag: 'wild', roleTag: 'hold', synergyTags: ['pattern'], tier: 3, effectType: 'event', effect: { kind: 'black_swan', magnitude: 20, description: 'Random 20% move once/round' } },
  { id: 't305', title: 'Time Lord', description: 'Add 3 extra ticks to the round. More time to cook.', emoji: '⏰', action: 'hold', category: 'timing', triggerTag: 'timing', roleTag: 'hold', synergyTags: ['position'], tier: 3, effectType: 'chart_modify', effect: { kind: 'time_lord', magnitude: 3, description: '+3 ticks to round' } },
  { id: 't306', title: 'Speed Run', description: 'Remove 3 ticks from the round. Blink and you will miss it.', emoji: '⚡', action: 'hold', category: 'timing', triggerTag: 'timing', roleTag: 'hold', synergyTags: ['position'], tier: 3, effectType: 'chart_modify', effect: { kind: 'speed_run', magnitude: 3, description: '-3 ticks from round' } },
  { id: 't307', title: 'Price Floor', description: "Set a floor: price cannot drop below 85% of current price for the rest of the round.", emoji: '🏗️', action: 'hold', category: 'pattern', triggerTag: 'pattern', roleTag: 'hold', synergyTags: ['dip'], tier: 3, effectType: 'chart_modify', effect: { kind: 'price_floor', magnitude: 85, description: 'Floor at 85% of current' } },
  { id: 't308', title: 'Price Ceiling', description: 'Set a ceiling: price cannot rise above 115% of current price for the rest of the round.', emoji: '🧱', action: 'hold', category: 'pattern', triggerTag: 'pattern', roleTag: 'hold', synergyTags: ['surge'], tier: 3, effectType: 'chart_modify', effect: { kind: 'price_ceiling', magnitude: 115, description: 'Ceiling at 115% of current' } },
  { id: 't309', title: 'Squeeze Play', description: 'When 3+ red ticks in a row, trigger a short squeeze: price pumps 10%. Bears get wrecked.', emoji: '🫧', action: 'buy', category: 'surge', triggerTag: 'surge', roleTag: 'entry', synergyTags: ['dip'], tier: 3, effectType: 'event', effect: { kind: 'squeeze', magnitude: 10, description: '10% pump on 3+ red streak' } },
  { id: 't310', title: 'Dead Cat Bounce', description: 'After the biggest drop of the round, price bounces 5% on the next tick. Then resumes falling.', emoji: '🐱', action: 'buy', category: 'dip', triggerTag: 'dip', roleTag: 'entry', synergyTags: ['pattern'], tier: 3, effectType: 'event', effect: { kind: 'dead_cat_bounce', magnitude: 5, description: '5% bounce after biggest drop' } },
  { id: 't311', title: 'Insider Tip', description: 'Once per round, reveal the exact price at tick 12. Use this knowledge wisely.', emoji: '📱', action: 'hold', category: 'wild', triggerTag: 'wild', roleTag: 'hold', synergyTags: ['timing'], tier: 3, effectType: 'passive', effect: { kind: 'insider_tip', magnitude: 12, description: 'Reveal final tick price' } },
  { id: 't312', title: 'Margin Call', description: 'If your position is down 15%+, force sell. But gain 2x cash on your next buy.', emoji: '📞', action: 'sell', category: 'position', triggerTag: 'position', roleTag: 'exit', synergyTags: ['dip'], tier: 3, effectType: 'hybrid', effect: { kind: 'margin_call', magnitude: 15, description: 'Force sell at -15%, 2x next buy' } },
  { id: 't313', title: 'Quantum Trade', description: 'Buy and sell simultaneously. You get the average of both outcomes. Schrödinger\'s trade.', emoji: '⚛️', action: 'buy', category: 'wild', triggerTag: 'wild', roleTag: 'entry', synergyTags: ['position'], tier: 3, effectType: 'hybrid', effect: { kind: 'quantum_trade', magnitude: 1, description: 'Buy+sell simultaneously' } },
  { id: 't314', title: 'Gravity Well', description: "Price is pulled toward the round's average price by 2% each tick. Mean reversion.", emoji: '🕳️', action: 'hold', category: 'pattern', triggerTag: 'pattern', roleTag: 'hold', synergyTags: ['dip'], tier: 3, effectType: 'chart_modify', effect: { kind: 'gravity_well', magnitude: 2, description: 'Pull 2% toward average' } },
  { id: 't315', title: 'Momentum Engine', description: 'Each consecutive green tick adds +0.5% to the next tick\'s move. Streaks compound.', emoji: '🚂', action: 'hold', category: 'surge', triggerTag: 'surge', roleTag: 'hold', synergyTags: ['pattern'], tier: 3, effectType: 'chart_modify', effect: { kind: 'momentum_engine', magnitude: 0.5, description: 'Green streaks compound' } },
  { id: 't316', title: 'Panic Spiral', description: 'Each consecutive red tick adds -0.5% to the next tick\'s drop. Fear feeds on itself.', emoji: '🌀', action: 'hold', category: 'dip', triggerTag: 'dip', roleTag: 'hold', synergyTags: ['pattern'], tier: 3, effectType: 'chart_modify', effect: { kind: 'panic_spiral', magnitude: 0.5, description: 'Red streaks compound' } },
  { id: 't317', title: 'Phoenix', description: 'If you hit $0 cash, revive with $100. Rise from the ashes. Once per run.', emoji: '🔥', action: 'hold', category: 'position', triggerTag: 'position', roleTag: 'hold', synergyTags: ['wild'], tier: 3, effectType: 'passive', effect: { kind: 'phoenix', magnitude: 100, description: 'Revive with $100 once' } },
  { id: 't318', title: 'Midas Touch', description: 'Everything you buy next gains +5% instantly. Gold hands.', emoji: '👆', action: 'buy', category: 'position', triggerTag: 'position', roleTag: 'entry', synergyTags: ['surge'], tier: 3, effectType: 'passive', effect: { kind: 'midas_touch', magnitude: 5, description: 'Buys gain +5% instantly' } },

  // ===== 🟧 TIER 4 — LEGENDARY (15) =====
  { id: 't401', title: 'The Oracle', description: 'See the ENTIRE price chart before the round starts. Full information.', emoji: '👁️', action: 'hold', category: 'wild', triggerTag: 'wild', roleTag: 'hold', synergyTags: ['timing'], tier: 4, effectType: 'passive', effect: { kind: 'oracle', magnitude: 1, description: 'See entire chart pre-round' } },
  { id: 't402', title: 'Market Maker', description: 'Every tick, you get a 1% spread bonus on buys (buy lower) and sells (sell higher).', emoji: '🏛️', action: 'hold', category: 'position', triggerTag: 'position', roleTag: 'hold', synergyTags: ['surge'], tier: 4, effectType: 'passive', effect: { kind: 'market_maker', magnitude: 1, description: '1% spread bonus on trades' } },
  { id: 't403', title: 'Compound Interest', description: 'Every profitable sell increases your next buy\'s effective cash by 10%. Snowball.', emoji: '📈', action: 'sell', category: 'position', triggerTag: 'position', roleTag: 'exit', synergyTags: ['surge'], tier: 4, effectType: 'passive', effect: { kind: 'compound_interest', magnitude: 10, description: '+10% buy cash after profit sell' } },
  { id: 't404', title: 'Revenge Trade', description: 'After a loss, your next buy gets +15% effective cash. Rage money.', emoji: '😤', action: 'buy', category: 'position', triggerTag: 'position', roleTag: 'entry', synergyTags: ['dip'], tier: 4, effectType: 'hybrid', effect: { kind: 'revenge_trade', magnitude: 15, description: '+15% buy cash after loss' } },
  { id: 't405', title: 'Plot Armor', description: 'The worst single tick in the round is reduced by 50%. You are the protagonist.', emoji: '🛡️', action: 'hold', category: 'wild', triggerTag: 'wild', roleTag: 'hold', synergyTags: ['dip'], tier: 4, effectType: 'passive', effect: { kind: 'plot_armor', magnitude: 50, description: 'Worst tick reduced 50%' } },
  { id: 't406', title: "Director's Cut", description: 'Choose to add or remove up to 2 ticks from the round (once, at any time).', emoji: '🎬', action: 'hold', category: 'timing', triggerTag: 'timing', roleTag: 'hold', synergyTags: ['position'], tier: 4, effectType: 'hybrid', effect: { kind: 'directors_cut', magnitude: 2, description: 'Add/remove 2 ticks once' } },
  { id: 't407', title: 'Cheat Code', description: '↑↑↓↓←→←→BA: Your starting cash for this round is 1.5x.', emoji: '🎮', action: 'hold', category: 'wild', triggerTag: 'wild', roleTag: 'hold', synergyTags: ['position'], tier: 4, effectType: 'passive', effect: { kind: 'cheat_code', magnitude: 1.5, description: '1.5x starting cash' } },
  { id: 't408', title: 'Glitch in the Matrix', description: 'Price randomly rewinds 2 ticks. You see history repeat.', emoji: '🟢', action: 'hold', category: 'wild', triggerTag: 'wild', roleTag: 'hold', synergyTags: ['pattern'], tier: 4, effectType: 'event', effect: { kind: 'glitch_rewind', magnitude: 2, description: 'Rewind price 2 ticks' } },
  { id: 't409', title: 'Double Exposure', description: 'Every trade you make happens twice. Buy = buy 2x. Sell = sell 2x.', emoji: '📸', action: 'hold', category: 'position', triggerTag: 'position', roleTag: 'hold', synergyTags: ['surge'], tier: 4, effectType: 'passive', effect: { kind: 'double_exposure', magnitude: 2, description: 'Trades execute twice' } },
  { id: 't410', title: 'Vampire', description: 'When you sell at a profit, drain 5% of the gain and add it as a permanent cash bonus for future rounds.', emoji: '🧛', action: 'sell', category: 'position', triggerTag: 'position', roleTag: 'exit', synergyTags: ['surge'], tier: 4, effectType: 'hybrid', effect: { kind: 'vampire', magnitude: 5, description: 'Drain 5% profit to permanent bonus' } },
  { id: 't411', title: 'The Gambler', description: 'Round starts with a coin flip: heads = 2x starting cash, tails = 0.5x starting cash.', emoji: '🎰', action: 'hold', category: 'wild', triggerTag: 'wild', roleTag: 'hold', synergyTags: ['position'], tier: 4, effectType: 'event', effect: { kind: 'gambler', magnitude: 2, description: 'Coin flip starting cash' } },
  { id: 't412', title: 'Elastic Band', description: 'Price always snaps back to the 20-tick moving average within 3 ticks. Predictable.', emoji: '🔄', action: 'hold', category: 'pattern', triggerTag: 'pattern', roleTag: 'hold', synergyTags: ['dip'], tier: 4, effectType: 'chart_modify', effect: { kind: 'elastic_band', magnitude: 20, description: 'Snap to moving average' } },
  { id: 't413', title: 'Blood Moon', description: 'During the last 3 ticks, all price movements are doubled. Volatility explosion.', emoji: '🌕', action: 'hold', category: 'timing', triggerTag: 'timing', roleTag: 'hold', synergyTags: ['surge'], tier: 4, effectType: 'chart_modify', effect: { kind: 'blood_moon', magnitude: 2, description: 'Last 3 ticks moves doubled' } },
  { id: 't414', title: 'Golden Hour', description: 'During the first 3 ticks, all price movements are halved. Calm entry window.', emoji: '✨', action: 'hold', category: 'timing', triggerTag: 'timing', roleTag: 'hold', synergyTags: ['dip'], tier: 4, effectType: 'chart_modify', effect: { kind: 'golden_hour', magnitude: 0.5, description: 'First 3 ticks moves halved' } },
  { id: 't415', title: 'Puppet Master', description: 'Once per round, override the bot\'s action. You choose: buy, sell, or hold.', emoji: '🎭', action: 'hold', category: 'wild', triggerTag: 'wild', roleTag: 'hold', synergyTags: ['position'], tier: 4, effectType: 'hybrid', effect: { kind: 'puppet_master', magnitude: 1, description: 'Manual override once/round' } },

  // ===== 🔴 TIER 5 — MYTHIC (12) =====
  { id: 't501', title: 'Time Lord Supreme', description: 'When your return hits -50%, add 5 ticks to the round. Desperation extension.', emoji: '👑', action: 'hold', category: 'wild', triggerTag: 'wild', roleTag: 'hold', synergyTags: ['timing'], tier: 5, effectType: 'event', effect: { kind: 'time_lord_supreme', magnitude: 5, description: '+5 ticks at -50% return' } },
  { id: 't502', title: 'Infinity Stone', description: 'Your position can never go below 90% of entry. Absolute floor.', emoji: '💎', action: 'hold', category: 'position', triggerTag: 'position', roleTag: 'hold', synergyTags: ['dip'], tier: 5, effectType: 'passive', effect: { kind: 'infinity_stone', magnitude: 90, description: 'Position floor at 90%' } },
  { id: 't503', title: 'Midas', description: 'Every buy you make this round instantly gains 3%. Free money.', emoji: '🥇', action: 'buy', category: 'position', triggerTag: 'position', roleTag: 'entry', synergyTags: ['surge'], tier: 5, effectType: 'passive', effect: { kind: 'midas_buy', magnitude: 3, description: 'Buys gain +3% instantly' }, positionSize: 0.8 },
  { id: 't504', title: 'The Alchemist', description: 'Convert any loss into a smaller loss (max -2% per trade). Alchemy.', emoji: '⚗️', action: 'sell', category: 'position', triggerTag: 'position', roleTag: 'exit', synergyTags: ['dip'], tier: 5, effectType: 'passive', effect: { kind: 'alchemist', magnitude: 2, description: 'Cap losses at -2% per trade' } },
  { id: 't505', title: 'Paradox Engine', description: 'Every time a card fires, add 1 tick to the round. More triggers = more time.', emoji: '♾️', action: 'hold', category: 'wild', triggerTag: 'wild', roleTag: 'hold', synergyTags: ['timing'], tier: 5, effectType: 'event', effect: { kind: 'paradox_engine', magnitude: 1, description: '+1 tick per card fire' } },
  { id: 't506', title: 'Void Walker', description: 'Remove the worst 2 ticks from the round\'s history. Erase bad luck.', emoji: '🕳️', action: 'hold', category: 'wild', triggerTag: 'wild', roleTag: 'hold', synergyTags: ['dip'], tier: 5, effectType: 'event', effect: { kind: 'void_walker', magnitude: 2, description: 'Remove worst 2 ticks' } },
  { id: 't507', title: 'Second Chance', description: 'If the round\'s goal would fail, rewind to tick 0 and replay with the same chart. Once per run.', emoji: '🔄', action: 'hold', category: 'wild', triggerTag: 'wild', roleTag: 'hold', synergyTags: ['timing'], tier: 5, effectType: 'event', effect: { kind: 'second_chance', magnitude: 1, description: 'Replay round on fail, once/run' } },
  { id: 't508', title: 'Chaos Theory', description: 'Every tick, there\'s a 10% chance the price makes a completely random 10% move. Butterfly effect.', emoji: '🦋', action: 'hold', category: 'wild', triggerTag: 'wild', roleTag: 'hold', synergyTags: ['pattern'], tier: 5, effectType: 'chart_modify', effect: { kind: 'chaos_theory', magnitude: 10, description: '10% chance random 10% move' } },
  { id: 't509', title: 'The Architect', description: 'Design the first 3 ticks of the chart. Set them to any values you want.', emoji: '🏗️', action: 'hold', category: 'timing', triggerTag: 'timing', roleTag: 'hold', synergyTags: ['pattern'], tier: 5, effectType: 'hybrid', effect: { kind: 'architect', magnitude: 3, description: 'Design first 3 ticks' } },
  { id: 't510', title: 'Singularity', description: 'If your return exceeds 100%, the round immediately ends in victory. Instant win condition.', emoji: '🌌', action: 'hold', category: 'wild', triggerTag: 'wild', roleTag: 'hold', synergyTags: ['surge'], tier: 5, effectType: 'event', effect: { kind: 'singularity', magnitude: 100, description: 'Instant win at 100% return' } },
  { id: 't511', title: 'HODL King', description: 'Hold cards get 3x effectiveness. If you hold through 5+ ticks, gain a 20% cash bonus.', emoji: '👑', action: 'hold', category: 'position', triggerTag: 'position', roleTag: 'hold', synergyTags: ['surge'], tier: 5, effectType: 'passive', effect: { kind: 'hodl_king', magnitude: 20, description: '3x hold, 20% bonus at 5+ holds' } },
  { id: 't512', title: 'The Final Card', description: 'This card has no effect... until it\'s your only card. Then it does EVERYTHING. Fires all Basic card conditions at once.', emoji: '🃏', action: 'hold', category: 'wild', triggerTag: 'wild', roleTag: 'hold', synergyTags: ['dip', 'surge', 'pattern', 'position', 'timing'], tier: 5, effectType: 'hybrid', effect: { kind: 'final_card', magnitude: 1, description: 'Fires all basic conditions if only card' } },
];

export function getRuleById(id: string): RuleCard | undefined {
  return RULE_CARDS.find(r => r.id === id);
}

/**
 * Pick N cards for the player to choose from, weighted by tier rarity.
 * Lower tiers appear more frequently than higher tiers.
 * `exclude` ids are never picked (e.g., already-owned cards during acquisition).
 * `guarantee` ids are force-included (for backwards compatibility).
 *
 * ponytail: ceiling — weighted random by tier. Not a real gacha system.
 */
export function pickRuleChoices(count: number, exclude: string[] = [], guarantee: string[] = []): RuleCard[] {
  const guaranteed = RULE_CARDS.filter(r => guarantee.includes(r.id) && !exclude.includes(r.id));
  const remaining = count - guaranteed.length;
  const pool = RULE_CARDS.filter(r => !exclude.includes(r.id) && !guarantee.includes(r.id));

  // Build a weighted pool: each card appears TIER_WEIGHTS[tier] times.
  const weightedPool: RuleCard[] = [];
  for (const card of pool) {
    const weight = TIER_WEIGHTS[card.tier] ?? 1;
    for (let i = 0; i < weight; i++) weightedPool.push(card);
  }

  const fillers: RuleCard[] = [];
  const used = new Set<string>();
  for (let i = 0; i < remaining && weightedPool.length > 0; i++) {
    let attempts = 0;
    while (attempts < 50) {
      const idx = Math.floor(Math.random() * weightedPool.length);
      const card = weightedPool[idx];
      if (!used.has(card.id)) {
        used.add(card.id);
        fillers.push(card);
        break;
      }
      attempts++;
    }
  }

  return [...guaranteed, ...fillers].sort(() => Math.random() - 0.5);
}

/**
 * Offer cards for the gradual acquisition flow.
 * - `ownedCardIds`: cards the player already owns (excluded from offers).
 * - `count`: number of cards to offer (typically 3).
 * Returns tier-weighted random cards not already owned.
 */
export function pickCardOffer(count: number, ownedCardIds: string[] = []): RuleCard[] {
  return pickRuleChoices(count, ownedCardIds, []);
}

/**
 * Offer cards for the swap flow (after the player has 5 cards).
 * Same as pickCardOffer but semantically separate for clarity.
 */
export function pickSwapOffer(ownedCardIds: string[]): RuleCard[] {
  return pickCardOffer(3, ownedCardIds);
}
