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

// News magnitude: 5 buckets from very negative to very positive.
export type NewsMagnitude = 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';

export const MAGNITUDE_META: Record<NewsMagnitude, { label: string; emoji: string; color: string; chipColor: string; sign: number }> = {
  very_negative: { label: 'Very Negative', emoji: '🩸', color: 'text-rose-600', chipColor: 'bg-rose-100 text-rose-700 border-rose-400', sign: -1 },
  negative:      { label: 'Negative',      emoji: '📉', color: 'text-rose-500', chipColor: 'bg-rose-50 text-rose-600 border-rose-300', sign: -1 },
  neutral:       { label: 'Neutral',       emoji: '➡️', color: 'text-slate-500', chipColor: 'bg-slate-100 text-slate-600 border-slate-300', sign: 0 },
  positive:      { label: 'Positive',      emoji: '📈', color: 'text-emerald-500', chipColor: 'bg-emerald-50 text-emerald-600 border-emerald-300', sign: 1 },
  very_positive: { label: 'Very Positive', emoji: '🚀', color: 'text-emerald-600', chipColor: 'bg-emerald-100 text-emerald-700 border-emerald-400', sign: 1 },
};

// A single breaking news headline shown in the trading log.
// Note: `sentiment` is kept for compatibility with the legacy headline generator
// in utils/headlines.ts (which still uses 3-bucket sentiment internally).
export interface NewsHeadline {
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  magnitude: NewsMagnitude;
  impactPercent: number; // signed fractional move, e.g. +0.30 or -0.25
  source: string;
}

// Trigger tag: what market condition fires this card.
export type TriggerTag = 'dip' | 'surge' | 'news+' | 'news-' | 'news' | 'pattern' | 'position' | 'timing' | 'wild';

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
  category: 'dip' | 'surge' | 'news' | 'pattern' | 'position' | 'timing' | 'wild';
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
  newsSeen: NewsHeadline[];// all news headlines shown during the round
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

/** Price + news event for a single trading tick. */
export interface PriceEvent {
  news: NewsHeadline | null;
  newsId?: string;
}

/** Pre-generated round script: deterministic price series + news events. */
export interface RoundScript {
  prices: number[];
  newsEvents: (PriceEvent | null)[];
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
  // Pre-generated round script (deterministic price + news series).
  roundScript: RoundScript | null;
  // Preview script for stock_select phase (separate from roundScript so preview can be generated earlier).
  previewScript: RoundScript | null;
}
