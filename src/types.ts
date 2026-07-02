export interface Company {
  id: string;
  ticker: string;
  name: string;
  summary: string;
  category: 'Tech' | 'Meme' | 'Crypto' | 'Food' | 'Space' | 'Green';
  basePrice: number;
  volatility: number; // 0.1 (low) to 0.9 (insane crypto style)
  trend: number;      // -0.2 to +0.3 (general drift direction)
  icon: string;       // emoji associated
}

export interface TradePosition {
  ticker: string;
  shares: number;       // total shares owned
  avgBuyPrice: number;  // average buy price
  investedCash: number; // total cash put in this stock
}

export interface Run {
  id: string;
  date: string;
  finalCash: number;
  highestCash: number;
  companiesTradedCount: number;
  roundsPlayed: number;
  unlockedTitle: string;
}

export const START_CASH = 1000;

export interface GameSettings {
  soundEnabled: boolean;
  hapticEnabled: boolean;
}

export interface GameRecord {
  highestCashEver: number;
  highestCashRunId: string | null;
  highestCashDate: string | null;
  longestRunRounds: number;
  longestRunId: string | null;
  longestRunDate: string | null;
}

// Trigger tag: what market condition fires this card.
export type TriggerTag = 'dip' | 'surge' | 'pattern' | 'position' | 'timing' | 'wild';

// Role tag: what the card does when triggered.
export type RoleTag = 'entry' | 'exit' | 'hold';

// Card tier: 0=Basic, 1=Uncommon, 2=Rare, 3=Epic, 4=Legendary, 5=Mythic
export type CardTier = 0 | 1 | 2 | 3 | 4 | 5;

// What kind of effect a card has beyond the basic trade action.
export type CardEffectType = 'trade' | 'chart_modify' | 'event' | 'passive' | 'hybrid';

// A non-trade effect a card can trigger (chart mods, events, passive buffs).
export interface CardEffect {
  // The kind of effect.
  kind:
    | 'shift_price'        // shift next tick's price by a percentage
    | 'add_ticks'          // add N ticks to the round
    | 'remove_ticks'       // remove N ticks from the round
    | 'volatility_mult'    // multiply chart volatility for the rest of the round
    | 'guarantee_green'    // next N ticks are guaranteed green
    | 'guarantee_red'      // next N ticks are guaranteed red
    | 'flash_crash'        // random crash + recovery event
    | 'whale_pump'         // random pump event
    | 'circuit_breaker'    // halt trading on big moves
    | 'black_swan'         // impossible random move
    | 'price_floor'        // set a floor price can't drop below
    | 'price_ceiling'      // set a ceiling price can't rise above
    | 'squeeze'            // short squeeze on red streaks
    | 'dead_cat_bounce'    // bounce after biggest drop
    | 'reveal_future'      // reveal future tick prices
    | 'hide_chart'         // hide chart for N ticks
    | 'double_or_nothing'  // coin flip on profit sells
    | 'chaos_monkey'       // random price shifts every N ticks
    | 'safety_net'         // refill cash if it drops too low
    | 'insurance'          // cap position loss
    | 'mirror'             // each tick does opposite of previous
    | 'gravity_well'       // pull price toward round average
    | 'momentum_engine'    // green streaks compound
    | 'panic_spiral'       // red streaks compound
    | 'phoenix'            // revive from $0
    | 'midas_buy'          // buys gain instant %
    | 'oracle'             // see entire chart before round
    | 'market_maker'       // spread bonus on trades
    | 'compound_interest'  // profitable sells boost next buy
    | 'revenge_trade'      // loss boosts next buy
    | 'plot_armor'         // reduce worst tick
    | 'directors_cut'      // add/remove ticks manually
    | 'cheat_code'         // starting cash multiplier
    | 'glitch_rewind'      // rewind price 2 ticks
    | 'double_exposure'    // trades execute twice
    | 'vampire'            // drain profit to permanent bonus
    | 'gambler'            // coin flip starting cash
    | 'elastic_band'       // snap to moving average
    | 'blood_moon'         // last ticks moves doubled
    | 'golden_hour'        // first ticks moves halved
    | 'puppet_master'      // manual override
    | 'time_lord_supreme'  // add ticks on -50% return
    | 'infinity_stone'     // position floor
    | 'alchemist'          // cap losses per trade
    | 'paradox_engine'     // card fires add ticks
    | 'void_walker'        // remove worst ticks
    | 'second_chance'      // replay round on fail
    | 'chaos_theory'       // random moves each tick
    | 'architect'          // design first ticks
    | 'singularity'        // instant win on high return
    | 'hodl_king'          // hold bonus
    | 'final_card'         // fires all basic conditions
    | 'paper_shredder'     // lose cash, boost next sell
    | 'tax_collector'      // tax profits, stabilize chart
    | 'sugar_rush'         // fee-free trades
    | 'quantum_trade'      // buy+sell simultaneously
    | 'margin_call'        // force sell, boost next buy
    | 'insider_tip'        // reveal final tick price
    | 'speed_run'          // remove ticks
    | 'time_lord'          // add ticks
    | 'whale_buy'          // whale buys with you
    | 'lucky_bounce'       // guaranteed green after dip buy
    | 'jinx'               // guaranteed red after sell
    | 'flash_sale'         // random brief drop
    | 'bear_spray'         // extra drop on loss sell
    | 'bull_whisper'       // add tick on buy
    | 'time_warp'          // remove tick on sell
    | 'volatility_pump'    // increase volatility
    | 'stability_anchor'   // decrease volatility
    | 'price_whisperer'    // shift price on buy
    | 'mirror_mirror'      // opposite of previous tick
    | 'crystal_ball'       // see next 3 ticks
    | 'fog_of_war'         // hide chart 3 ticks
    | 'safety_net_cash'    // refill cash
    | 'midas_touch'        // buys gain instant %
    | 'scaled_exit_boost'  // boost scaled exit
    | 'momentum_lock'      // lock momentum
    | 'reversal_boost'     // boost reversal
    | 'support_boost'      // boost support bounce
    | 'resistance_boost'   // boost resistance reject
    | 'volatility_boost'   // boost volatility rider
    | 'calm_boost'         // boost calm before storm
    | 'spike_boost'        // boost spike chaser
    | 'bag_holder_boost'   // boost bag holder
    | 'scalper_boost'      // boost scalper
    | 'contrarian_boost'   // boost contrarian
    | 'trend_surfer_boost' // boost trend surfer
    | 'cash_guard_boost'   // boost cash guard
    | 'second_wind_boost'  // boost second wind
    | 'patience_boost'     // boost patience
    | 're_entry_boost'     // boost re-entry
    | 'lucky_7_boost'      // boost lucky 7
    | 'unlucky_4_boost'    // boost unlucky 4
    | 'round_tripper_boost'// boost round tripper
    | 'smooth_op_boost'    // boost smooth operator
    | 'blood_bath_boost'   // boost blood bath
    | 'green_streak_boost' // boost green streak
    | 'cut_losses_boost'   // boost cut losses
    | 'moonshot_boost';    // boost moonshot hold
  // Magnitude of the effect (percentage, count, etc. — interpretation depends on kind).
  magnitude: number;
  // Human-readable description of what the effect does.
  description: string;
}

// A rule card the player equips to program the trading bot.
export interface RuleCard {
  id: string;
  title: string;
  description: string;
  emoji: string;
  // Action the bot takes when this rule fires.
  action: 'buy' | 'sell' | 'hold';
  // Category for display grouping.
  category: 'dip' | 'surge' | 'pattern' | 'position' | 'timing' | 'wild';
  // Trigger tag: what market condition activates this card.
  triggerTag: TriggerTag;
  // Role tag: entry (buy), exit (sell), or hold.
  roleTag: RoleTag;
  // Synergy tags: what other trigger tags this card combos with.
  synergyTags: TriggerTag[];
  // If this card is part of a named combo, the combo id.
  comboId?: string;
  // Card tier: 0=Basic ... 5=Mythic. Higher = rarer + more powerful.
  tier: CardTier;
  // What kind of effect this card has beyond the basic trade action.
  effectType: CardEffectType;
  // Optional non-trade effect (chart mods, events, passive buffs).
  effect?: CardEffect;
  // Fraction of cash to invest on buy (0-1). Default 0.5. 1.0 = all in.
  // Ignored for sell/hold cards (sells always liquidate the full position).
  positionSize?: number;
}

// A named combo: a set of cards that work together for a bonus.
export interface Combo {
  id: string;
  name: string;
  description: string;
  emoji: string;
  // Card IDs that form this combo.
  cardIds: string[];
  // Which card IDs are needed for the combo to be "complete".
  requiredIds: string[];
  // The bonus applied when the combo is active: relax the entry card's threshold.
  bonusDescription: string;
}

export interface RoundEvalContext {
  startCash: number;       // bankroll at the start of the round
  endCash: number;         // bankroll at the end of the round (after final sell)
  peakCash: number;        // highest bankroll reached during the round
  roundProfit: number;     // endCash - startCash
  returnPercent: number;   // (endCash - startCash) / startCash * 100
  biggestSingleTradeProfit: number; // largest profit from a single sell within the round
  tradesCount: number;     // number of completed buy+sell cycles in the round
}

export interface RoundGoal {
  id: number;
  title: string;
  goal: string;
  description: string;
  isBoss: boolean;
  emoji: string;
  // Evaluator: returns true if the goal is met given the round context.
  evaluate: (ctx: RoundEvalContext) => boolean;
}

export type GamePhase = 'menu' | 'round_intro' | 'stock_select' | 'rule_select' | 'trading' | 'round_complete' | 'game_over';

/** Pre-generated round script: deterministic price series. */
export interface RoundScript {
  prices: number[];
  historyLength: number;
}

export interface GameSessionState {
  cash: number;
  roundStartCash: number;     // bankroll at the start of the current round (for goal eval)
  currentCompany: Company | null;
  selectedRules: RuleCard[];   // rules the player equipped for this round
  // Persistent deck: cards the player owns across rounds (roguelike acquisition).
  persistentCards: RuleCard[];
  chartPoints: number[];       // price history ticks
  position: TradePosition | null;
  phase: GamePhase;
  roundNumber: number;
  companiesTradedCount: number;
  highestCashInSession: number;
  lastRoundProfit: number;
  lastRoundEvalContext: RoundEvalContext | null;
  lastRoundPassed: boolean;
  // Pre-generated round script (deterministic price series).
  roundScript: RoundScript | null;
  // Preview script for stock_select phase (separate from roundScript so preview can be generated earlier).
  previewScript: RoundScript | null;
  // Active card effects for the current round (chart mods, events, etc.).
  activeEffects: ActiveCardEffect[];
  // Total ticks for the current round (can be modified by card effects).
  totalTicks: number;
  // Whether the player has used their one-time swap this round.
  swapUsedThisRound: boolean;
}

// A runtime-active card effect (chart mod, event, passive) for the current round.
export interface ActiveCardEffect {
  cardId: string;
  kind: CardEffect['kind'];
  magnitude: number;
  // Remaining ticks the effect is active (-1 = permanent for the round).
  remainingTicks: number;
  // Optional source data for the effect (e.g., floor price, target price).
  data?: number;
}
