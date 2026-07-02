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
    cardIds: ['t005', 't013', 't015'],   // Dip Buyer, Momentum, Profit Target
    requiredIds: ['t005', 't015'],         // Need at least entry + exit
    bonusDescription: 'Dip entry fires at -2% instead of -3%',
  },
  {
    id: 'momentum_train',
    name: 'Momentum Train',
    description: 'Buy the uptrend, hold it, sell the reversal. All aboard!',
    emoji: '🚂',
    cardIds: ['t010', 't112', 't011'],     // Trend Rider, Trend Surfer, Red Alert
    requiredIds: ['t010', 't011'],
    bonusDescription: 'Entry fires at 2 up-ticks instead of 3',
  },
  {
    id: 'contrarian',
    name: 'Contrarian',
    description: 'Buy when others sell, sell when others buy. Be the hero.',
    emoji: '🤡',
    cardIds: ['t111', 't122', 't104'],     // Contrarian, Blood Bath, Support Bounce
    requiredIds: ['t111', 't104'],
    bonusDescription: 'Entry fires on any dip (relaxed threshold)',
  },
  {
    id: 'scalper',
    name: 'Scalper',
    description: 'Buy early, sell quick. In and out before anyone notices.',
    emoji: '⚡',
    cardIds: ['t017', 't110', 't009'],     // Early Bird, Scalper, Quick Exit
    requiredIds: ['t017', 't009'],
    bonusDescription: 'Quick exit fires at any profit (no minimum)',
  },
  {
    id: 'safe_haven',
    name: 'Safe Haven',
    description: 'Cautious entry, protected hold, timed exit. Safety first.',
    emoji: '🛡️',
    cardIds: ['t113', 't007', 't016'],     // Cash Guard, Diamond Hands, Last Call
    requiredIds: ['t113', 't016'],
    bonusDescription: 'Exit fires 10% earlier in the round',
  },
  {
    id: 'yolo_moon',
    name: 'YOLO Moon',
    description: 'All in. Hold forever. Moon or bust. No in-between.',
    emoji: '🌙',
    cardIds: ['t018', 't125'],             // All In, Moonshot Hold
    requiredIds: ['t018', 't125'],
    bonusDescription: 'All-in buys with 110% effective cash (bonus shares)',
  },
  {
    id: 'volatility_play',
    name: 'Volatility Play',
    description: 'Buy the calm, sell the chaos. Profit from the explosion.',
    emoji: '💥',
    cardIds: ['t107', 't012', 't106'],     // Calm Before Storm, Flat Entry, Volatility Rider
    requiredIds: ['t107', 't106'],
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

    // Dip & Rip: entry dip threshold relaxes from -3% to -2%
    if (combo.id === 'dip_and_rip' && card.id === 't005') {
      return { relaxed: true, bonusDescription: combo.bonusDescription };
    }
    // Momentum Train: entry fires at 2 up-ticks instead of 3
    if (combo.id === 'momentum_train' && card.id === 't010') {
      return { relaxed: true, bonusDescription: combo.bonusDescription };
    }
    // Contrarian: entry fires on any dip
    if (combo.id === 'contrarian' && card.id === 't111') {
      return { relaxed: true, bonusDescription: combo.bonusDescription };
    }
    // Volatility Play: flat detection at 2 ticks instead of 3
    if (combo.id === 'volatility_play' && (card.id === 't107' || card.id === 't012')) {
      return { relaxed: true, bonusDescription: combo.bonusDescription };
    }
  }
  return { relaxed: false, bonusDescription: '' };
}
