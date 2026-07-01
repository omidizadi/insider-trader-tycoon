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
}
