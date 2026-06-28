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

export interface GameSettings {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  startCash: number;
  chartSpeed: 'normal' | 'fast';
}

export type GamePhase = 'menu' | 'discovery' | 'trading' | 'round_complete' | 'game_over';

export interface GameSessionState {
  cash: number;
  currentCompany: Company;
  chartPoints: number[]; // the price history ticks
  position: TradePosition | null;
  phase: GamePhase;
  roundNumber: number;
  companiesTradedCount: number;
  highestCashInSession: number;
  lastRoundProfit: number; // positive or negative
}
