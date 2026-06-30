import { Combo, RuleCard, TriggerTag } from '../types';

/**
 * Named combos: when specific cards are equipped together, the entry card's
 * trigger condition is relaxed (easier to fire) and the player sees a fire emoji.
 *
 * ponytail: ceiling — combos are defined as static card-id sets with a text
 * bonus description. The actual relaxation is applied in botEngine via
 * getComboRelaxation(). No real combo "engine", just a lookup.
 */

export const COMBOS: Combo[] = [
  {
    id: 'dip_and_rip',
    name: 'Dip & Rip',
    description: 'Buy the dip, ride the wave, sell at the peak. The classic swing trade.',
    emoji: '🔥',
    cardIds: ['c002', 'c017', 'c024'],   // Dip Buyer, Momentum Entry, Profit Taker
    requiredIds: ['c002', 'c024'],         // Need at least entry + exit
    bonusDescription: 'Dip entry fires at -3% instead of -5%',
  },
  {
    id: 'news_flip',
    name: 'News Flip',
    description: 'Buy on good news, sell on bad news. Simple vibes-based alpha.',
    emoji: '📰',
    cardIds: ['c035', 'c048'],             // Headline Bull, Headline Bear
    requiredIds: ['c035', 'c048'],
    bonusDescription: 'Entry fires on any positive news (not just very positive)',
  },
  {
    id: 'momentum_train',
    name: 'Momentum Train',
    description: 'Buy the uptrend, hold it, sell the reversal. All aboard!',
    emoji: '🚂',
    cardIds: ['c020', 'c029', 'c026'],     // Trend Surfer, Trend Rider, Peak Seller
    requiredIds: ['c020', 'c026'],
    bonusDescription: 'Entry fires at 2 up-ticks instead of 3',
  },
  {
    id: 'contrarian',
    name: 'Contrarian',
    description: 'Buy when others sell, sell when others buy. Be the hero.',
    emoji: '🤡',
    cardIds: ['c006', 'c013', 'c058'],     // Fear Buyer, Contrarian Entry, Doom Hold
    requiredIds: ['c006', 'c058'],
    bonusDescription: 'Entry fires on any negative news (not just very negative)',
  },
  {
    id: 'scalper',
    name: 'Scalper',
    description: 'Buy early, sell quick. In and out before anyone notices.',
    emoji: '⚡',
    cardIds: ['c079', 'c076'],             // Early Bird, Quick Flip
    requiredIds: ['c079', 'c076'],
    bonusDescription: 'Quick flip fires at any profit (no minimum)',
  },
  {
    id: 'safe_haven',
    name: 'Safe Haven',
    description: 'Cautious entry, protected hold, timed exit. Safety first.',
    emoji: '🛡️',
    cardIds: ['c066', 'c067', 'c083'],     // Cash Guard, Diamond Hands, Clock Watcher
    requiredIds: ['c066', 'c083'],
    bonusDescription: 'Exit fires 10% earlier in the round',
  },
  {
    id: 'yolo_moon',
    name: 'YOLO Moon',
    description: 'All in. Hold forever. Moon or bust. No in-between.',
    emoji: '🌙',
    cardIds: ['c065', 'c094'],             // All In, Moon Shot
    requiredIds: ['c065', 'c094'],
    bonusDescription: 'All-in buys with 110% effective cash (bonus shares)',
  },
  {
    id: 'volatility_play',
    name: 'Volatility Play',
    description: 'Buy the calm, sell the chaos. Profit from the explosion.',
    emoji: '💥',
    cardIds: ['c062', 'c063', 'c052'],     // Calm Before Storm, Flatline Buyer, After Storm
    requiredIds: ['c062', 'c052'],
    bonusDescription: 'Flat detection fires at 2 flat ticks instead of 3',
  },
];

/**
 * Detect which combos are fully or partially active given the equipped cards.
 * Returns only combos where at least requiredIds are present.
 */
export function detectCombos(equippedCards: RuleCard[]): Combo[] {
  const equippedIds = new Set(equippedCards.map(c => c.id));
  return COMBOS.filter(combo => combo.requiredIds.every(id => equippedIds.has(id)));
}

/**
 * Check if a specific card is part of an active combo and return the combo.
 */
export function getCardCombo(cardId: string, activeCombos: Combo[]): Combo | null {
  return activeCombos.find(c => c.cardIds.includes(cardId)) ?? null;
}

/**
 * Get combo progress: how many required/total cards are equipped.
 * Returns { equipped, needed, missing } for display.
 */
export function getComboProgress(combo: Combo, equippedIds: Set<string>): { equipped: number; needed: number; missing: string[] } {
  const missing = combo.requiredIds.filter(id => !equippedIds.has(id));
  return {
    equipped: combo.requiredIds.length - missing.length,
    needed: combo.requiredIds.length,
    missing,
  };
}

/**
 * Check if a combo is fully complete (all cardIds present, not just required).
 */
export function isComboComplete(combo: Combo, equippedIds: Set<string>): boolean {
  return combo.cardIds.every(id => equippedIds.has(id));
}

/**
 * Combo bonus: for certain combos, return the trigger tag that gets relaxed.
 * Used by botEngine to lower thresholds when a combo is active.
 */
export function getComboRelaxation(
  card: RuleCard,
  activeCombos: Combo[],
): { relaxed: boolean; bonusDescription: string } {
  for (const combo of activeCombos) {
    if (!combo.cardIds.includes(card.id)) continue;

    // Dip & Rip: entry dip threshold relaxes from -5% to -3%
    if (combo.id === 'dip_and_rip' && card.id === 'c002') {
      return { relaxed: true, bonusDescription: combo.bonusDescription };
    }
    // News Flip: entry fires on any positive (not just very_positive)
    if (combo.id === 'news_flip' && card.id === 'c035') {
      return { relaxed: true, bonusDescription: combo.bonusDescription };
    }
    // Momentum Train: entry fires at 2 up-ticks instead of 3
    if (combo.id === 'momentum_train' && card.id === 'c020') {
      return { relaxed: true, bonusDescription: combo.bonusDescription };
    }
    // Contrarian: entry fires on any negative news
    if (combo.id === 'contrarian' && card.id === 'c006') {
      return { relaxed: true, bonusDescription: combo.bonusDescription };
    }
    // Volatility Play: flat detection at 2 ticks instead of 3
    if (combo.id === 'volatility_play' && (card.id === 'c062' || card.id === 'c063')) {
      return { relaxed: true, bonusDescription: combo.bonusDescription };
    }
  }
  return { relaxed: false, bonusDescription: '' };
}
