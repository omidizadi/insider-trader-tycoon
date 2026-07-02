import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Coins, Check, Sparkles, TrendingUp, TrendingDown,
  Bot, Target, Skull, Play
} from 'lucide-react';
import {
  Company, GameSessionState, GameSettings, TradePosition, START_CASH,
  RuleCard, RoundEvalContext, RoundScript, ActiveCardEffect
} from '../types';
import { getRandomCompany } from '../companies';
import { playSound } from '../utils/audio';
import { pickRuleChoices, pickCardOffer, pickSwapOffer, TIER_WEIGHTS } from '../data/rules';
import { getRound } from '../data/rounds';
import { resolveBotAction, BotContext } from '../utils/botEngine';
import { generateRoundScript } from '../utils/priceEngine';
import { detectCombos, getComboProgress, isComboComplete } from '../utils/combos';
import { initRoundEffects, processFiredCardEffect, processTickEffects, tickDownEffects, hasActionEffect } from '../utils/cardEffects';

interface ActiveGameProps {
  settings: GameSettings;
  runsCount: number;
  onFinishGame: (finalCash: number, highestCash: number, companiesTraded: number, roundsPlayed: number) => void;
  onExitGame: (finalCash: number, highestCash: number, companiesTraded: number, roundsPlayed: number) => void;
}

// Number of ticks per trading round. The bot acts once per tick.
const TICKS_PER_ROUND = 12;
// Maximum cards the player can own in their persistent deck.
const MAX_DECK_SIZE = 5;
// Number of cards offered each acquisition/swap phase.
const CARD_OFFER_SIZE = 3;
// Number of initial history points.
const HISTORY_LENGTH = 8;

// Tier display config: label, border color, glow color, rarity %.
const TIER_CONFIG: Record<number, { label: string; border: string; glow: string; rarity: string }> = {
  0: { label: 'Basic', border: 'border-amber-700', glow: 'shadow-amber-200', rarity: '40%' },
  1: { label: 'Uncommon', border: 'border-emerald-600', glow: 'shadow-emerald-200', rarity: '25%' },
  2: { label: 'Rare', border: 'border-sky-600', glow: 'shadow-sky-200', rarity: '15%' },
  3: { label: 'Epic', border: 'border-violet-600', glow: 'shadow-violet-200', rarity: '10%' },
  4: { label: 'Legendary', border: 'border-orange-500', glow: 'shadow-orange-200', rarity: '7%' },
  5: { label: 'Mythic', border: 'border-rose-500', glow: 'shadow-rose-200', rarity: '3%' },
};

export default function ActiveGame({ settings, runsCount, onFinishGame, onExitGame }: ActiveGameProps) {
  const [gameState, setGameState] = useState<GameSessionState>(() => ({
    cash: START_CASH,
    roundStartCash: START_CASH,
    currentCompany: null,
    selectedRules: [],
    persistentCards: [],
    chartPoints: [],
    position: null,
    phase: 'round_intro',
    roundNumber: 1,
    companiesTradedCount: 0,
    highestCashInSession: START_CASH,
    lastRoundProfit: 0,
    lastRoundEvalContext: null,
    lastRoundPassed: false,
    roundScript: null,
    previewScript: null,
    activeEffects: [],
    totalTicks: TICKS_PER_ROUND,
    swapUsedThisRound: false,
  }));

  // Card offer for the acquisition/swap phase.
  const [cardOffer, setCardOffer] = useState<RuleCard[]>([]);
  // Trading log entries (bot actions only).
  const [actionLog, setActionLog] = useState<{ action: 'buy' | 'sell' | 'hold'; price: number; rule: RuleCard | null; tick: number; chartIndex: number }[]>([]);
  // Current tick within the round.
  const [tickIndex, setTickIndex] = useState(0);
  // All-time high/low this round.
  const [roundHigh, setRoundHigh] = useState(0);
  const [roundLow, setRoundLow] = useState(0);
  // Biggest single-trade profit this round.
  const [biggestTradeProfit, setBiggestTradeProfit] = useState(0);
  // Trades count this round.
  const [tradesCount, setTradesCount] = useState(0);
  // The most recent bot action highlight.
  const [lastBotAction, setLastBotAction] = useState<{ action: 'buy' | 'sell' | 'hold'; rule: RuleCard | null } | null>(null);
  // Guard so the round-end evaluation only runs once per round.
  const [roundEnded, setRoundEnded] = useState(false);
  // The stock currently being previewed in the stock picker.
  const [previewCompany, setPreviewCompany] = useState<Company | null>(null);
  // Shuffle charges remaining for the entire run (3 total).
  const [shuffleLeft, setShuffleLeft] = useState(3);
  // Event banner text (for card effect events like flash crash, whale pump).
  const [eventBanner, setEventBanner] = useState<string | null>(null);

  const playedCompanyIds = useRef<string[]>([]);

  // Refs to read latest values inside the interval without re-subscribing.
  const roundHighRef = useRef(roundHigh);
  const roundLowRef = useRef(roundLow);
  const biggestTradeProfitRef = useRef(biggestTradeProfit);
  const tradesCountRef = useRef(tradesCount);
  const actionLogRef = useRef(actionLog);
  const selectedRulesRef = useRef(gameState.selectedRules);
  const roundStartCashRef = useRef(gameState.roundStartCash);
  const currentRoundNumberRef = useRef(gameState.roundNumber);
  useEffect(() => { roundHighRef.current = roundHigh; }, [roundHigh]);
  useEffect(() => { roundLowRef.current = roundLow; }, [roundLow]);
  useEffect(() => { biggestTradeProfitRef.current = biggestTradeProfit; }, [biggestTradeProfit]);
  useEffect(() => { tradesCountRef.current = tradesCount; }, [tradesCount]);
  useEffect(() => { actionLogRef.current = actionLog; }, [actionLog]);
  useEffect(() => { selectedRulesRef.current = gameState.selectedRules; }, [gameState.selectedRules]);
  useEffect(() => { roundStartCashRef.current = gameState.roundStartCash; }, [gameState.roundStartCash]);
  useEffect(() => { currentRoundNumberRef.current = gameState.roundNumber; }, [gameState.roundNumber]);

  // Format money with K/M/B/T suffixes.
  const formatMoney = (value: number): string => {
    const abs = Math.abs(value);
    const sign = value < 0 ? '-' : '';
    if (abs >= 1_000_000_000_000) return `${sign}$${(abs / 1_000_000_000_000).toFixed(2)}T`;
    if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`;
    if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
    if (abs >= 10_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
    return `${sign}$${abs.toFixed(2)}`;
  };

  const currentRound = getRound(gameState.roundNumber);

  // ===== PHASE: round_intro → stock_select =====
  const handleStartRound = () => {
    if (settings.soundEnabled) playSound('click');
    const comp = getRandomCompany(playedCompanyIds.current);
    const script = generateRoundScript(comp, gameState.roundNumber, HISTORY_LENGTH, TICKS_PER_ROUND);
    setPreviewCompany(comp);
    setGameState(prev => ({ ...prev, phase: 'stock_select', previewScript: script }));
  };

  const handleSkipStock = () => {
    if (settings.soundEnabled) playSound('skip');
    const comp = getRandomCompany(playedCompanyIds.current);
    const script = generateRoundScript(comp, gameState.roundNumber, HISTORY_LENGTH, TICKS_PER_ROUND);
    setPreviewCompany(comp);
    setGameState(prev => ({ ...prev, previewScript: script }));
  };

  // ===== PHASE: stock_select → card_shop (acquisition/swap) =====
  const handlePickStock = () => {
    if (!previewCompany || !gameState.previewScript) return;
    if (settings.soundEnabled) playSound('click');
    const nextComp = previewCompany;
    playedCompanyIds.current.push(nextComp.id);
    const script = gameState.previewScript;

    setGameState(prev => ({
      ...prev,
      currentCompany: nextComp,
      chartPoints: script.prices.slice(0, script.historyLength),
      position: null,
      phase: 'card_shop',
      companiesTradedCount: prev.companiesTradedCount + 1,
      roundScript: script,
      swapUsedThisRound: false,
    }));

    // Generate card offer based on deck state.
    const ownedIds = gameState.persistentCards.map(c => c.id);
    setCardOffer(pickCardOffer(CARD_OFFER_SIZE, ownedIds));
    setRoundHigh(script.prices[script.historyLength - 1]);
    setRoundLow(script.prices[script.historyLength - 1]);
  };

  // Shuffle the card offer (costs 1 charge, 3 per run).
  const handleShuffleOffer = () => {
    if (shuffleLeft <= 0) return;
    if (settings.soundEnabled) playSound('click');
    setShuffleLeft(prev => prev - 1);
    const ownedIds = gameState.persistentCards.map(c => c.id);
    setCardOffer(pickCardOffer(CARD_OFFER_SIZE, ownedIds));
  };

  // Confirm acquisition: add selected new cards to deck, then proceed to trading.
  const handleConfirmAcquisition = (newCards: RuleCard[], removedCardIds: string[] = []) => {
    if (settings.soundEnabled) playSound('click');
    setGameState(prev => {
      const newDeck = [
        ...prev.persistentCards.filter(c => !removedCardIds.includes(c.id)),
        ...newCards,
      ];
      return {
        ...prev,
        persistentCards: newDeck,
        selectedRules: newDeck,
        phase: 'trading',
        activeEffects: initRoundEffects(newDeck),
        totalTicks: TICKS_PER_ROUND,
        swapUsedThisRound: removedCardIds.length > 0,
      };
    });
    setActionLog([]);
    setTickIndex(0);
    setBiggestTradeProfit(0);
    setTradesCount(0);
    setLastBotAction(null);
    setRoundEnded(false);
    setEventBanner(null);
  };

  // Confirm swap: remove marked cards, add selected new cards, then proceed.
  const handleConfirmSwap = (newCards: RuleCard[], removedCardIds: string[]) => {
    handleConfirmAcquisition(newCards, removedCardIds);
  };

  // Skip the card shop (keep current deck, go straight to trading).
  const handleSkipCardShop = () => {
    if (settings.soundEnabled) playSound('click');
    setGameState(prev => ({
      ...prev,
      selectedRules: prev.persistentCards,
      phase: 'trading',
      activeEffects: initRoundEffects(prev.persistentCards),
      totalTicks: TICKS_PER_ROUND,
    }));
    setActionLog([]);
    setTickIndex(0);
    setBiggestTradeProfit(0);
    setTradesCount(0);
    setLastBotAction(null);
    setRoundEnded(false);
    setEventBanner(null);
  };

  // ===== THE TRADING LOOP =====
  // Each tick: read from the pre-generated round script, resolve bot action, log.
  useEffect(() => {
    if (gameState.phase !== 'trading') return;
    if (roundEnded) return;

    const intervalId = setInterval(() => {
      // Advance one tick.
      setTickIndex(prevTick => {
        const nextTick = prevTick + 1;

        // Generate the next price point + maybe news + bot action.
        setGameState(prev => {
          if (!prev.currentCompany) return prev;
          const curPrice = prev.chartPoints[prev.chartPoints.length - 1] || prev.currentCompany.basePrice;

          // Read from the pre-generated round script.
          const script = prev.roundScript;
          if (!script) return prev;

          // Get the pre-generated price for this tick.
          let nextPrice = script.prices[script.historyLength + nextTick - 1] ?? curPrice;

          // Process tick-level card effects (chart mods, random events).
          const effectCtx = {
            tickIndex: nextTick,
            totalTicks: prev.totalTicks,
            chartPoints: prev.chartPoints,
            cash: prev.cash,
            startCash: prev.roundStartCash,
            position: prev.position,
            roundScript: script,
            activeEffects: prev.activeEffects,
          };
          const tickEffect = processTickEffects(effectCtx);
          if (tickEffect.modifiedNextPrice !== null) {
            nextPrice = tickEffect.modifiedNextPrice;
          }
          if (tickEffect.eventBanner) {
            setEventBanner(tickEffect.eventBanner);
          }
          // Apply cash delta from tick effects (e.g., safety net, phoenix).
          let cashAfterTick = prev.cash + tickEffect.cashDelta;

          const nextPoints = [...prev.chartPoints, nextPrice];

          setRoundHigh(h => Math.max(h, nextPrice));
          setRoundLow(l => (l === 0 ? nextPrice : Math.min(l, nextPrice)));

          // Build bot context.
          const botCtx: BotContext = {
            price: nextPrice,
            priceHistory: nextPoints.slice(-6),
            position: prev.position,
            cash: cashAfterTick,
            startCash: prev.roundStartCash,
            tickIndex: nextTick,
            totalTicks: prev.totalTicks,
            allTimeHigh: Math.max(roundHighRef.current, nextPrice),
            allTimeLow: roundLowRef.current === 0 ? nextPrice : Math.min(roundLowRef.current, nextPrice),
            cardsFiredThisRound: actionLogRef.current.filter(e => e.action !== 'hold').length,
          };

          const { action, firedRule, positionSize } = resolveBotAction(selectedRulesRef.current, botCtx);

          // Process fired card's effect (for hybrid/event cards).
          let tickDelta = tickEffect.tickDelta;
          let newEffects = [...tickEffect.newEffects];
          let removeEffectIds = [...tickEffect.removeEffectCardIds];
          let forceSell = tickEffect.forceSell;
          let cashDelta = tickEffect.cashDelta;
          if (firedRule && hasActionEffect(firedRule)) {
            const firedEffect = processFiredCardEffect(firedRule, effectCtx);
            if (firedEffect.modifiedNextPrice !== null) nextPrice = firedEffect.modifiedNextPrice;
            tickDelta += firedEffect.tickDelta;
            cashDelta += firedEffect.cashDelta;
            newEffects.push(...firedEffect.newEffects);
            removeEffectIds.push(...firedEffect.removeEffectCardIds);
            forceSell = forceSell || firedEffect.forceSell;
            if (firedEffect.eventBanner) setEventBanner(firedEffect.eventBanner);
          }

          // Update total ticks if a card modified it.
          const newTotalTicks = Math.max(1, prev.totalTicks + tickDelta);

          // ponytail: passive card effects that modify trade prices/quantities.
          const midasEffect = prev.activeEffects.find(e => e.kind === 'midas_touch' || e.kind === 'midas_buy');
          const marketMakerEffect = prev.activeEffects.find(e => e.kind === 'market_maker');
          const doubleExposureEffect = prev.activeEffects.find(e => e.kind === 'double_exposure');
          const alchemistEffect = prev.activeEffects.find(e => e.kind === 'alchemist');

          // Execute the action.
          if ((action === 'buy' || forceSell === false) && action === 'buy' && cashAfterTick >= 1) {
            // Apply buy-time passive effects.
            let buyPrice = nextPrice;
            if (marketMakerEffect) buyPrice *= (1 - marketMakerEffect.magnitude / 100);
            if (midasEffect) buyPrice *= (1 - midasEffect.magnitude / 100);
            let investFraction = positionSize;
            if (doubleExposureEffect) investFraction = Math.min(1, investFraction * doubleExposureEffect.magnitude);
            const investCash = Number((cashAfterTick * investFraction).toFixed(2));
            const remainingCash = Number((cashAfterTick - investCash).toFixed(2));
            const sharesBought = investCash / buyPrice;
            const updatedPosition: TradePosition = prev.position
              ? {
                  ticker: prev.currentCompany!.ticker,
                  shares: prev.position.shares + sharesBought,
                  investedCash: prev.position.investedCash + investCash,
                  avgBuyPrice: Number(((prev.position.investedCash + investCash) / (prev.position.shares + sharesBought)).toFixed(2)),
                }
              : { ticker: prev.currentCompany!.ticker, shares: sharesBought, investedCash: investCash, avgBuyPrice: buyPrice };
            setActionLog(prevLog => [...prevLog, { action: 'buy', price: nextPrice, rule: firedRule, tick: nextTick, chartIndex: nextPoints.length - 1 }]);
            setLastBotAction({ action: 'buy', rule: firedRule });
            if (settings.soundEnabled) playSound('buy');
            // Update active effects.
            const updatedEffects = tickDownEffects(
              newEffects.length > 0 || removeEffectIds.length > 0
                ? prev.activeEffects.filter(e => !removeEffectIds.includes(e.cardId)).concat(newEffects)
                : prev.activeEffects
            );
            return { ...prev, cash: remainingCash, position: updatedPosition, chartPoints: nextPoints, activeEffects: updatedEffects, totalTicks: newTotalTicks };
          } else if ((action === 'sell' || forceSell) && prev.position) {
            // Apply sell-time passive effects.
            let sellPrice = nextPrice;
            if (marketMakerEffect) sellPrice *= (1 + marketMakerEffect.magnitude / 100);
            if (alchemistEffect) {
              const minSellPrice = prev.position.avgBuyPrice * (1 - alchemistEffect.magnitude / 100);
              sellPrice = Math.max(sellPrice, minSellPrice);
            }
            const proceeds = prev.position.shares * sellPrice;
            const profit = proceeds - prev.position.investedCash;
            setBiggestTradeProfit(b => Math.max(b, profit));
            setTradesCount(c => c + 1);
            const nextCash = Number((cashAfterTick + proceeds + cashDelta).toFixed(2));
            const peak = Math.max(prev.highestCashInSession, nextCash);
            setActionLog(prevLog => [...prevLog, { action: 'sell', price: nextPrice, rule: firedRule, tick: nextTick, chartIndex: nextPoints.length - 1 }]);
            setLastBotAction({ action: 'sell', rule: firedRule });
            if (settings.soundEnabled) playSound(profit >= 0 ? 'win' : 'lose');
            const updatedEffects = tickDownEffects(
              newEffects.length > 0 || removeEffectIds.length > 0
                ? prev.activeEffects.filter(e => !removeEffectIds.includes(e.cardId)).concat(newEffects)
                : prev.activeEffects
            );
            return { ...prev, cash: nextCash, position: null, chartPoints: nextPoints, highestCashInSession: peak, activeEffects: updatedEffects, totalTicks: newTotalTicks };
          } else {
            setActionLog(prevLog => [...prevLog, { action: 'hold', price: nextPrice, rule: firedRule, tick: nextTick, chartIndex: nextPoints.length - 1 }]);
            setLastBotAction({ action: 'hold', rule: firedRule });
            const updatedEffects = tickDownEffects(
              newEffects.length > 0 || removeEffectIds.length > 0
                ? prev.activeEffects.filter(e => !removeEffectIds.includes(e.cardId)).concat(newEffects)
                : prev.activeEffects
            );
            return { ...prev, chartPoints: nextPoints, cash: cashAfterTick, activeEffects: updatedEffects, totalTicks: newTotalTicks };
          }
        });

        // End of round?
        if (nextTick >= (gameState.totalTicks || TICKS_PER_ROUND)) {
          clearInterval(intervalId);
          setRoundEnded(true);
          // Force-sell any open position at the final price, then evaluate.
          setTimeout(() => {
            setGameState(prev => {
              if (!prev.currentCompany) return prev;
              const finalPrice = prev.chartPoints[prev.chartPoints.length - 1] || prev.currentCompany.basePrice;
              let nextCash = prev.cash;
              if (prev.position) {
                const proceeds = prev.position.shares * finalPrice;
                const profit = proceeds - prev.position.investedCash;
                setBiggestTradeProfit(b => Math.max(b, profit));
                setTradesCount(c => c + 1);
                nextCash = Number((prev.cash + proceeds).toFixed(2));
                if (settings.soundEnabled) playSound(profit >= 0 ? 'win' : 'lose');
              }
              const peak = Math.max(prev.highestCashInSession, nextCash);
              const roundProfit = nextCash - prev.roundStartCash;
              const returnPercent = prev.roundStartCash > 0 ? (roundProfit / prev.roundStartCash) * 100 : 0;
              const evalCtx: RoundEvalContext = {
                startCash: prev.roundStartCash,
                endCash: nextCash,
                peakCash: peak,
                roundProfit,
                returnPercent,
                biggestSingleTradeProfit: biggestTradeProfitRef.current,
                tradesCount: tradesCountRef.current,
              };
              const round = getRound(prev.roundNumber);
              const passed = round.evaluate(evalCtx);
              return {
                ...prev,
                cash: nextCash,
                position: null,
                highestCashInSession: peak,
                lastRoundProfit: roundProfit,
                lastRoundEvalContext: evalCtx,
                lastRoundPassed: passed,
                phase: 'round_complete',
              };
            });
          }, 500);
        }

        return nextTick;
      });
    }, 700);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.phase, roundEnded]);

  // ===== PHASE: round_complete → next round or game over =====
  const handleNextRound = () => {
    if (settings.soundEnabled) playSound('click');

    // Did the player fail the round goal?
    if (!gameState.lastRoundPassed) {
      if (settings.soundEnabled) playSound('gameover');
      setGameState(prev => ({ ...prev, phase: 'game_over' }));
      return;
    }

    // Did they go broke?
    if (gameState.cash < 5) {
      if (settings.soundEnabled) playSound('gameover');
      setGameState(prev => ({ ...prev, phase: 'game_over' }));
      return;
    }

    // Advance to next round. Keep selectedRules so they pre-select in the next rule picker.
    setGameState(prev => ({
      ...prev,
      roundNumber: prev.roundNumber + 1,
      roundStartCash: prev.cash,
      currentCompany: null,
      chartPoints: [],
      position: null,
      phase: 'round_intro',
    }));
  };

  const handleDoneGameOver = () => {
    if (settings.soundEnabled) playSound('click');
    onFinishGame(gameState.cash, gameState.highestCashInSession, gameState.companiesTradedCount, gameState.roundNumber);
  };

  // ===== Derived render values =====
  const currentPrice = gameState.chartPoints.length > 0
    ? gameState.chartPoints[gameState.chartPoints.length - 1]
    : (gameState.currentCompany?.basePrice ?? 1);
  const positionValue = gameState.position ? gameState.position.shares * currentPrice : 0;
  const totalInvested = gameState.position ? gameState.position.investedCash : 0;
  const liveProfit = gameState.position ? positionValue - totalInvested : 0;
  const isProfit = liveProfit >= 0;
  const returnPercent = totalInvested > 0 ? (liveProfit / totalInvested) * 100 : 0;

  // Session-wide totals (cash + position vs. round start). These persist when
  // the bot sells and sits in cash, so the HUD never collapses to zero mid-round.
  const totalMoney = gameState.cash + positionValue;
  const sessionProfit = totalMoney - gameState.roundStartCash;
  const sessionReturnPercent = gameState.roundStartCash > 0 ? (sessionProfit / gameState.roundStartCash) * 100 : 0;
  const isSessionProfit = sessionProfit >= 0;
  // Holding color: black when flat in cash, green/red when holding a position.
  const holdingColor = gameState.position
    ? (isProfit ? 'text-emerald-600' : 'text-rose-600')
    : 'text-slate-800';

  // SVG chart path.
  const renderChartPath = () => {
    const points = gameState.chartPoints;
    if (points.length === 0) return { pathD: '', fillD: '', coords: [] as { x: number; y: number }[] };
    const width = 340;
    const height = 150;
    const padding = 20;
    const minVal = Math.min(...points) * 0.95;
    const maxVal = Math.max(...points) * 1.05;
    const valueRange = maxVal - minVal === 0 ? 1 : maxVal - minVal;
    const coords = points.map((p, idx) => {
      const x = padding + (idx / Math.max(1, points.length - 1)) * (width - padding * 2);
      const y = height - padding - ((p - minVal) / valueRange) * (height - padding * 2);
      return { x, y };
    });
    let pathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) pathD += ` L ${coords[i].x} ${coords[i].y}`;
    const fillD = `${pathD} L ${coords[coords.length - 1].x} ${height - padding} L ${coords[0].x} ${height - padding} Z`;
    return { pathD, fillD, coords };
  };
  const chartInfo = renderChartPath();
  const currentCoord = chartInfo.coords[chartInfo.coords.length - 1] || { x: 0, y: 0 };

  // Small chart for the round_complete / game_over summary pages.
  const renderMiniChart = (points: number[], width = 260, height = 70) => {
    if (points.length < 2) return { pathD: '', fillD: '', stroke: '#10b981' };
    const padding = 6;
    const minVal = Math.min(...points) * 0.97;
    const maxVal = Math.max(...points) * 1.03;
    const valueRange = maxVal - minVal === 0 ? 1 : maxVal - minVal;
    const coords = points.map((p, idx) => {
      const x = padding + (idx / Math.max(1, points.length - 1)) * (width - padding * 2);
      const y = height - padding - ((p - minVal) / valueRange) * (height - padding * 2);
      return { x, y };
    });
    let pathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) pathD += ` L ${coords[i].x} ${coords[i].y}`;
    const fillD = `${pathD} L ${coords[coords.length - 1].x} ${height - padding} L ${coords[0].x} ${height - padding} Z`;
    const first = points[0];
    const last = points[points.length - 1];
    const stroke = last >= first ? '#10b981' : '#f43f5e';
    return { pathD, fillD, stroke };
  };
  const miniChart = renderMiniChart(gameState.chartPoints);

  return (
    <div className="flex flex-col items-center h-full w-full max-w-2xl mx-auto p-1 sm:p-2 select-none">
      {/* Top Session HUD */}
      <div id="session_hud" className="w-full flex justify-between items-center mb-2.5 bg-slate-800 text-white rounded-[24px] p-3 border-2 border-slate-800 shadow-[4px_4px_0_0_#1e293b] shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-yellow-400 shrink-0" />
            <div className="text-left leading-none">
              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-300 block">BANKROLL</span>
              <span className="font-mono text-sm font-black text-yellow-300">💵 {formatMoney(gameState.cash)}</span>
            </div>
          </div>
          {gameState.position && (
            <div className="flex items-center gap-1 border-l border-slate-700 pl-3">
              <div className="text-left leading-none">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-300 block">POSITION</span>
                <span className={`font-mono text-xs font-black ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatMoney(positionValue)}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right leading-none border-r border-slate-700 pr-3">
            <span className="text-[9px] font-mono tracking-wider uppercase text-slate-300 block">ROUND</span>
            <span className="font-mono font-black text-xs text-slate-100">
              #{gameState.roundNumber} {currentRound.isBoss && '👹'}
            </span>
          </div>
          {gameState.phase === 'trading' && (
            <div className="text-right leading-none">
              <span className="text-[9px] font-mono tracking-wider uppercase text-slate-300 block">TICK</span>
              <span className="font-mono font-black text-xs text-yellow-400">{tickIndex}/{gameState.totalTicks || TICKS_PER_ROUND}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center w-full min-h-0">
        <AnimatePresence mode="wait">

          {/* ===== PHASE: ROUND INTRO ===== */}
          {gameState.phase === 'round_intro' && (
            <motion.div
              key="round_intro"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              className="w-full"
            >
              <div className={`w-full bg-white rounded-[32px] border-4 ${currentRound.isBoss ? 'border-rose-800' : 'border-slate-800'} shadow-[6px_6px_0_0_#1e293b] overflow-hidden p-6 text-center space-y-4`}>
                <div className="flex justify-center">
                  <div className={`w-16 h-16 ${currentRound.isBoss ? 'bg-rose-100' : 'bg-yellow-100'} rounded-2xl border-2 border-slate-800 flex items-center justify-center shadow-[3px_3px_0_0_#1e293b]`}>
                    <span className="text-3xl">{currentRound.emoji}</span>
                  </div>
                </div>
                <div>
                  <span className={`text-[9px] font-mono ${currentRound.isBoss ? 'bg-rose-600' : 'bg-slate-800'} text-white font-bold px-3 py-1 rounded-full uppercase tracking-widest`}>
                    {currentRound.isBoss ? '👹 BOSS ROUND' : `ROUND ${gameState.roundNumber}`}
                  </span>
                  <h2 className="text-2xl font-black mt-3 text-slate-800 font-sans tracking-tight uppercase">
                    {currentRound.title}
                  </h2>
                </div>
                <div className={`bg-slate-50 border-2 ${currentRound.isBoss ? 'border-rose-400' : 'border-slate-800'} rounded-[20px] p-4 space-y-2 shadow-[3px_3px_0_0_#1e293b]`}>
                  <div className="flex items-center justify-center gap-1.5">
                    <Target className="w-4 h-4 text-amber-500" />
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-500">GOAL</span>
                  </div>
                  <p className="text-lg font-black text-slate-800">{currentRound.goal}</p>
                  <p className="text-[11px] text-slate-500 leading-normal font-medium">{currentRound.description}</p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-200">
                  <p className="text-[10px] text-slate-600 font-mono">
                    Starting Bankroll: <strong className="text-slate-800 font-black">{formatMoney(gameState.cash)}</strong>
                  </p>
                </div>
                <div className="relative group w-full pt-1.5">
                  <div className={`absolute inset-0 ${currentRound.isBoss ? 'bg-rose-600' : 'bg-emerald-600'} rounded-[18px] translate-y-1.5`} />
                  <button
                    onClick={handleStartRound}
                    className={`relative w-full ${currentRound.isBoss ? 'bg-rose-400 hover:bg-rose-300' : 'bg-emerald-400 hover:bg-emerald-300'} border-2 border-slate-800 text-white font-black py-3 rounded-[18px] flex items-center justify-center gap-2 cursor-pointer text-xs transition-transform active:translate-y-1.5`}
                  >
                    <Bot className="w-4 h-4" />
                    PICK A STOCK ➔
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===== PHASE: STOCK SELECT ===== */}
          {gameState.phase === 'stock_select' && previewCompany && (
            <motion.div
              key="stock_select"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              className="w-full"
            >
              <div className="w-full bg-white rounded-[32px] border-4 border-slate-800 shadow-[6px_6px_0_0_#1e293b] overflow-hidden p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] bg-slate-800 text-white font-mono font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      📂 STOCK PICKER
                    </span>
                    <span className="text-[10px] font-bold font-mono text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                      {previewCompany.icon} {previewCompany.category}
                    </span>
                  </div>

                  <div className="text-center bg-yellow-50 rounded-[20px] p-4 border-2 border-dashed border-slate-300 relative">
                    <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-sm bg-yellow-400 border-2 border-slate-800 text-slate-800 font-black font-mono px-3 py-0.5 rounded-full shadow-[2px_2px_0_0_#1e293b]">
                      ${previewCompany.ticker}
                    </span>
                    <p className="text-2xl font-black mt-2 text-slate-800 font-sans tracking-tight leading-snug">
                      {previewCompany.name}
                    </p>
                    <div className="mt-1.5 font-mono text-[9px] uppercase font-bold px-2 py-0.5 rounded-lg border-2 border-slate-800 inline-block bg-white text-slate-700">
                      {previewCompany.volatility < 0.20 ? '💎 Solid Safe' :
                       previewCompany.volatility < 0.45 ? '⚡ Normal Swing' :
                       previewCompany.volatility < 0.70 ? '🚀 Highly Volatile' : '🔥 Speculative Chaos'}
                    </div>
                  </div>

                  <div className="bg-slate-50 border-2 border-slate-800 rounded-[20px] p-4 space-y-2 shadow-[3px_3px_0_0_#1e293b]">
                    <span className="text-[8px] font-mono font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                      📄 DOSSIER SUMMARY:
                    </span>
                    <p className="text-xs font-medium leading-normal text-slate-600 font-sans">
                      {previewCompany.summary}
                    </p>
                  </div>

                  {/* Chart Preview — shows the exact future price path */}
                  {gameState.previewScript && (() => {
                    const pts = gameState.previewScript.prices;
                    const previewW = 340, previewH = 140, previewPad = 16;
                    const minVal = Math.min(...pts) * 0.95;
                    const maxVal = Math.max(...pts) * 1.05;
                    const valueRange = maxVal - minVal === 0 ? 1 : maxVal - minVal;
                    const coords = pts.map((p, i) => ({
                      x: previewPad + (i / Math.max(1, pts.length - 1)) * (previewW - previewPad * 2),
                      y: previewH - previewPad - ((p - minVal) / valueRange) * (previewH - previewPad * 2),
                    }));
                    let pathD = `M ${coords[0].x} ${coords[0].y}`;
                    for (let i = 1; i < coords.length; i++) pathD += ` L ${coords[i].x} ${coords[i].y}`;
                    const fillD = `${pathD} L ${coords[coords.length - 1].x} ${previewH - previewPad} L ${coords[0].x} ${previewH - previewPad} Z`;
                    const first = pts[0], last = pts[pts.length - 1];
                    const chartStroke = last >= first ? '#10b981' : '#f43f5e';
                    const histLen = gameState.previewScript.historyLength;
                    return (
                      <div className="bg-slate-900 border-4 border-slate-800 rounded-[24px] p-2 relative shadow-inner">
                        <div className="flex items-center justify-between px-1 pb-1">
                          <span className="text-[8px] text-slate-400 font-mono tracking-widest uppercase font-bold">
                            📊 PRICE PREVIEW (exact future)
                          </span>
                          <span className={`text-[8px] font-mono font-bold ${chartStroke === '#10b981' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {last >= first ? '▲' : '▼'} {formatMoney(last)}
                          </span>
                        </div>
                        <svg viewBox={`0 0 ${previewW} ${previewH}`} className="w-full h-[120px] overflow-visible">
                          <defs>
                            <linearGradient id="previewGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={chartStroke} stopOpacity="0.35" />
                              <stop offset="100%" stopColor={chartStroke} stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path d={fillD} fill="url(#previewGrad)" />
                          <path d={pathD} fill="none" stroke={chartStroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          {/* History / trading divider line */}
                          {coords[histLen - 1] && (
                            <line x1={coords[histLen - 1].x} y1={previewPad} x2={coords[histLen - 1].x} y2={previewH - previewPad} stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
                          )}
                          {/* Start and end markers */}
                          <circle cx={coords[0].x} cy={coords[0].y} r="4" fill="#94a3b8" stroke="#fff" strokeWidth="1.5" />
                          <circle cx={coords[coords.length - 1].x} cy={coords[coords.length - 1].y} r="4" fill={chartStroke} stroke="#fff" strokeWidth="1.5" />
                        </svg>
                        <div className="flex justify-between px-1 pt-0.5">
                          <span className="text-[7px] text-slate-500 font-mono">Trend: {last >= first ? '📈 Growing' : '📉 Declining'}</span>
                          <span className="text-[7px] text-slate-500 font-mono">Range: {formatMoney(minVal)} — {formatMoney(maxVal)}</span>
                        </div>
                      </div>
                    );
                  })()}

                </div>

                {/* SKIP / CHOOSE buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="relative group w-full">
                    <div className="absolute inset-0 bg-rose-600 rounded-[18px] translate-y-1" />
                    <button
                      onClick={handleSkipStock}
                      className="relative w-full bg-rose-400 hover:bg-rose-300 border-2 border-slate-800 text-white font-black py-2.5 rounded-[18px] flex items-center justify-center gap-1 cursor-pointer text-xs active:translate-y-1 transition-transform"
                    >
                      ✕ SKIP
                    </button>
                  </div>
                  <div className="relative group w-full">
                    <div className="absolute inset-0 bg-emerald-600 rounded-[18px] translate-y-1" />
                    <button
                      onClick={handlePickStock}
                      className="relative w-full bg-emerald-400 hover:bg-emerald-300 border-2 border-slate-800 text-white font-black py-2.5 rounded-[18px] flex items-center justify-center gap-1 cursor-pointer text-xs active:translate-y-1 transition-transform"
                    >
                      ✓ CHOOSE
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => { if (confirm('End this run and save your score?')) onExitGame(gameState.cash, gameState.highestCashInSession, gameState.companiesTradedCount, gameState.roundNumber); }}
                  className="w-full text-center text-[10px] text-slate-400 hover:text-slate-600 hover:underline uppercase tracking-widest font-mono py-1 cursor-pointer"
                >
                  ◀ QUIT RUN
                </button>
              </div>
            </motion.div>
          )}

          {/* ===== PHASE: CARD SHOP (acquisition/swap) ===== */}
          {gameState.phase === 'card_shop' && gameState.currentCompany && (
            <CardShopPhase
              company={gameState.currentCompany}
              offer={cardOffer}
              deck={gameState.persistentCards}
              maxDeckSize={MAX_DECK_SIZE}
              onConfirmAcquire={handleConfirmAcquisition}
              onConfirmSwap={handleConfirmSwap}
              onSkip={handleSkipCardShop}
              shuffleLeft={shuffleLeft}
              onShuffle={handleShuffleOffer}
            />
          )}

          {/* ===== PHASE: TRADING ===== */}
          {gameState.phase === 'trading' && gameState.currentCompany && (
            <motion.div
              key="trading"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              className="w-full flex-1 flex flex-col"
            >
              <div className="w-full bg-white rounded-[32px] border-4 border-slate-800 shadow-[6px_6px_0_0_#1e293b] p-4 flex-1 flex flex-col space-y-3">
                {/* Stock header */}
                <div className="flex justify-between items-center bg-slate-50 px-3 py-2 border-2 border-slate-800 rounded-xl font-mono shadow-[2px_2px_0_0_#1e293b]">
                  <div className="text-left">
                    <span className="text-sm text-slate-700 font-bold uppercase block truncate max-w-[140px]">{gameState.currentCompany.name}</span>
                    <span className="text-sm bg-yellow-400 border border-slate-800 font-extrabold px-1.5 py-0.5 rounded">${gameState.currentCompany.ticker}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] text-slate-400 block uppercase font-bold">PRICE</span>
                    <span className="text-sm font-black text-rose-500 animate-pulse">${currentPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Equipped deck */}
                <div className="bg-slate-50 border-2 border-slate-800 rounded-xl p-2 shadow-[2px_2px_0_0_#1e293b]">
                  <span className="text-[8px] font-mono font-bold uppercase text-slate-400 tracking-wider block mb-1.5">🤖 BOT DECK ({gameState.persistentCards.length}/{MAX_DECK_SIZE}):</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {gameState.persistentCards.length === 0 && (
                      <span className="text-[9px] font-mono text-slate-400 italic">No cards — using default bot strategy</span>
                    )}
                    {gameState.persistentCards.map(r => {
                      const tierCfg = TIER_CONFIG[r.tier];
                      return (
                        <span key={r.id} className={`text-[9px] font-mono font-bold px-2 py-1 rounded-lg border-2 ${tierCfg.border} ${
                          lastBotAction?.rule?.id === r.id
                            ? 'bg-yellow-300 text-slate-800 animate-pulse'
                            : 'bg-white text-slate-600'
                        }`}>
                          {r.emoji} {r.title}
                          <span className="ml-1 text-[7px] opacity-60">T{r.tier}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Event banner (card effects) */}
                {eventBanner && (
                  <div className="border-2 border-violet-500 bg-violet-50 rounded-xl p-2 text-center font-mono text-xs font-black text-violet-700 shadow-[2px_2px_0_0_#1e293b] animate-pulse">
                    ⚡ {eventBanner}
                  </div>
                )}

                {/* Chart */}
                <div className="bg-slate-900 border-4 border-slate-800 rounded-[24px] p-2 relative h-[150px] flex flex-col justify-end overflow-hidden shadow-inner">
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 pointer-events-none">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[8px] text-slate-400 font-mono tracking-widest uppercase font-bold">BOT LIVE</span>
                  </div>
                  <svg className="w-full h-[130px] absolute bottom-2 left-0 overflow-visible">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d={chartInfo.fillD} fill="url(#chartGradient)" className="transition-all duration-300 ease-out" />
                    <path d={chartInfo.pathD} fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-300 ease-out" />
                    <circle cx={currentCoord.x} cy={currentCoord.y} r="6.5" fill="#10b981" stroke="#fff" strokeWidth="2.5" className="animate-pulse" />

                    {/* Buy/Sell transaction markers */}
                    {actionLog.filter(e => e.action === 'buy' || e.action === 'sell').map((entry, idx) => {
                      const coord = chartInfo.coords[entry.chartIndex];
                      if (!coord) return null;
                      const isBuy = entry.action === 'buy';
                      return (
                        <g key={`tx_${idx}`} className="animate-bounce">
                          <circle cx={coord.x} cy={coord.y} r="6.5" fill={isBuy ? '#10b981' : '#f43f5e'} stroke="#ffffff" strokeWidth="2.5" />
                          <circle cx={coord.x} cy={coord.y} r="2.5" fill="#ffffff" />
                          <text
                            x={coord.x}
                            y={coord.y - 12}
                            textAnchor="middle"
                            className="font-mono text-[9px] font-black fill-white select-none pointer-events-none"
                            style={{ paintOrder: 'stroke', stroke: '#0f172a', strokeWidth: '2.5px', strokeLinejoin: 'round' }}
                          >
                            {isBuy ? '▲ BUY' : '▼ SELL'}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Last bot action banner */}
                {lastBotAction && (
                  <div className={`border-2 border-slate-800 rounded-xl p-2 text-center font-mono text-xs font-black shadow-[2px_2px_0_0_#1e293b] ${
                    lastBotAction.action === 'buy' ? 'bg-emerald-50 text-emerald-700' :
                    lastBotAction.action === 'sell' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    🤖 BOT: {lastBotAction.action.toUpperCase()}
                    {lastBotAction.rule && <span className="opacity-70"> ({lastBotAction.rule.emoji} {lastBotAction.rule.title})</span>}
                  </div>
                )}

                {/* Position stats — always visible on the trading page.
                     Shows session-wide totals so the HUD never collapses to zero
                     when the bot sells and sits in cash. */}
                <div className="bg-slate-50 p-3 border-2 border-slate-800 rounded-[20px] shadow-[3px_3px_0_0_#1e293b]">
                  <div className="grid grid-cols-2 gap-3 items-center">
                    <div className="text-left">
                      <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider font-mono block mb-1">TOTAL MONEY</span>
                      <span className={`text-xl font-black tracking-tighter font-mono ${holdingColor}`}>
                        {formatMoney(totalMoney)}
                      </span>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider font-mono block mb-1">TOTAL RETURN</span>
                      <span className={`inline-flex items-center gap-1 font-black text-sm font-mono px-2 py-1 rounded-xl border-2 ${
                        isSessionProfit ? 'text-emerald-700 bg-emerald-50 border-emerald-400' : 'text-rose-700 bg-rose-50 border-rose-400'
                      }`}>
                        {isSessionProfit ? <TrendingUp className="w-3 h-3 shrink-0" /> : <TrendingDown className="w-3 h-3 shrink-0" />}
                        {isSessionProfit ? '+' : ''}{sessionReturnPercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  {gameState.position && (
                    <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between items-center text-[10px] text-slate-500 font-mono font-medium">
                      <div>
                        <span>Shares: </span>
                        <strong className="text-slate-700 font-bold">{gameState.position.shares.toFixed(4)}</strong>
                      </div>
                      <div className="text-right">
                        <span>Avg Entry: </span>
                        <strong className="text-slate-700 font-bold">${gameState.position.avgBuyPrice.toFixed(2)}</strong>
                        <span className="mx-1">•</span>
                        <span>Gain: </span>
                        <strong className={`font-black ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>{formatMoney(liveProfit)}</strong>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bot action history */}
                <div className="bg-slate-50 border-2 border-slate-800 rounded-[20px] shadow-[3px_3px_0_0_#1e293b] flex flex-col overflow-hidden">
                  <div className="px-2 py-1.5">
                    <span className="text-[8px] font-mono font-bold uppercase text-slate-400 tracking-wider">🤖 BOT ACTIONS</span>
                  </div>
                  <div className="px-2 pb-1.5 h-[18px] overflow-hidden whitespace-nowrap text-ellipsis">
                    {actionLog.length === 0 ? (
                      <p className="text-[10px] text-slate-400 font-mono">Waiting for the bot to start trading...</p>
                    ) : (() => {
                      const latest = actionLog[actionLog.length - 1];
                      return (
                        <p className={`text-[10px] font-mono font-bold truncate ${
                          latest.action === 'buy' ? 'text-emerald-700' :
                          latest.action === 'sell' ? 'text-rose-700' : 'text-slate-500'
                        }`}>
                          🤖 BOT {latest.action.toUpperCase()} @ ${latest.price.toFixed(2)}
                          {latest.rule && <span className="opacity-70"> · {latest.rule.emoji} {latest.rule.title}</span>}
                        </p>
                      );
                    })()}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden border border-slate-800">
                  <motion.div
                    className="bg-emerald-500 h-full rounded-full"
                    animate={{ width: `${(tickIndex / (gameState.totalTicks || TICKS_PER_ROUND)) * 100}%` }}
                    transition={{ ease: 'linear', duration: 0.5 }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* ===== PHASE: ROUND COMPLETE ===== */}
          {gameState.phase === 'round_complete' && gameState.lastRoundEvalContext && (
            <motion.div
              key="round_complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full flex-1 flex flex-col justify-center"
            >
              <div className={`w-full bg-white rounded-[32px] border-4 ${gameState.lastRoundPassed ? 'border-emerald-800' : 'border-rose-800'} shadow-[8px_8px_0_0_#1e293b] p-6 text-center space-y-4`}>
                <div className="flex justify-center">
                  <div className={`w-16 h-16 ${gameState.lastRoundPassed ? 'bg-emerald-100' : 'bg-rose-100'} rounded-2xl border-2 border-slate-800 flex items-center justify-center shadow-[3px_3px_0_0_#1e293b]`}>
                    {gameState.lastRoundPassed ? <Check className="w-8 h-8 text-emerald-600" /> : <Skull className="w-8 h-8 text-rose-600 animate-bounce" />}
                  </div>
                </div>
                <div>
                  <span className={`text-[9px] font-mono ${gameState.lastRoundPassed ? 'bg-emerald-600' : 'bg-rose-600'} text-white font-bold px-3 py-1 rounded-full uppercase tracking-widest`}>
                    {gameState.lastRoundPassed ? '✅ GOAL MET' : '❌ GOAL FAILED'}
                  </span>
                  <h3 className="text-xl font-black mt-3 text-slate-800 uppercase">
                    {gameState.lastRoundPassed ? 'ROUND CLEARED!' : 'ROUND FAILED'}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">Goal: {currentRound.goal}</p>
                </div>
                {/* Mini chart of this round's price action */}
                {gameState.chartPoints.length >= 2 && (
                  <div className="bg-slate-900 border-2 border-slate-800 rounded-[16px] p-1.5 shadow-[3px_3px_0_0_#1e293b]">
                    <div className="flex items-center justify-between px-1 pb-1">
                      <span className="text-[8px] text-slate-400 font-mono tracking-widest uppercase font-bold">{gameState.currentCompany?.ticker} · PRICE</span>
                      <span className={`text-[8px] font-mono font-bold ${miniChart.stroke === '#10b981' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {currentPrice >= gameState.chartPoints[0] ? '▲' : '▼'} {formatMoney(currentPrice)}
                      </span>
                    </div>
                    <svg viewBox="0 0 260 70" className="w-full h-[60px] overflow-visible">
                      <defs>
                        <linearGradient id="miniChartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={miniChart.stroke} stopOpacity="0.4" />
                          <stop offset="100%" stopColor={miniChart.stroke} stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path d={miniChart.fillD} fill="url(#miniChartGrad)" />
                      <path d={miniChart.pathD} fill="none" stroke={miniChart.stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
                <div className="bg-slate-50 border-2 border-slate-800 rounded-[20px] p-4 space-y-2.5 font-mono text-xs shadow-[3px_3px_0_0_#1e293b] text-left">
                  <div className="flex justify-between text-slate-500 font-bold">
                    <span>Start Bankroll:</span>
                    <span className="text-slate-800">{formatMoney(gameState.lastRoundEvalContext.startCash)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 font-bold">
                    <span>End Bankroll:</span>
                    <span className="text-slate-800">{formatMoney(gameState.lastRoundEvalContext.endCash)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 font-bold">
                    <span>Round Profit:</span>
                    <span className={gameState.lastRoundProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      {gameState.lastRoundProfit >= 0 ? '+' : ''}{formatMoney(gameState.lastRoundProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 font-bold">
                    <span>Return:</span>
                    <span className={gameState.lastRoundEvalContext.returnPercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      {gameState.lastRoundEvalContext.returnPercent >= 0 ? '+' : ''}{gameState.lastRoundEvalContext.returnPercent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="border-t-2 border-dashed border-slate-200 pt-2.5 flex justify-between text-slate-500 font-bold">
                    <span>Trades:</span>
                    <span className="text-slate-800">{gameState.lastRoundEvalContext.tradesCount}</span>
                  </div>
                </div>
                {gameState.lastRoundPassed ? (
                  <div className="relative group w-full pt-1.5">
                    <div className="absolute inset-0 bg-emerald-600 rounded-[18px] translate-y-1.5" />
                    <button
                      onClick={handleNextRound}
                      className="relative w-full bg-emerald-400 hover:bg-emerald-300 border-2 border-slate-800 text-white font-black py-3 rounded-[18px] flex items-center justify-center gap-2 cursor-pointer text-xs transition-transform active:translate-y-1.5"
                    >
                      NEXT ROUND ➔
                    </button>
                  </div>
                ) : (
                  <div className="relative group w-full pt-1.5">
                    <div className="absolute inset-0 bg-rose-600 rounded-[18px] translate-y-1.5" />
                    <button
                      onClick={handleDoneGameOver}
                      className="relative w-full bg-rose-400 hover:bg-rose-300 border-2 border-slate-800 text-white font-black py-3 rounded-[18px] flex items-center justify-center gap-2 cursor-pointer text-xs transition-transform active:translate-y-1.5"
                    >
                      <Skull className="w-4 h-4" /> RUN OVER
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ===== PHASE: GAME OVER ===== */}
          {gameState.phase === 'game_over' && (
            <motion.div
              key="game_over"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full flex-1 flex flex-col justify-center"
            >
              <div className="w-full bg-white rounded-[32px] border-4 border-slate-800 shadow-[8px_8px_0_0_#1e293b] p-6 text-center space-y-5">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-red-100 rounded-2xl border-2 border-slate-800 flex items-center justify-center shadow-[3px_3px_0_0_#1e293b]">
                    <Skull className="w-8 h-8 text-rose-500 animate-bounce" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-800 font-sans tracking-tight uppercase">RUN OVER!</h3>
                  <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                    {gameState.lastRoundPassed ? '⚡ THE GOAL WAS TOO HIGH ⚡' : '⚡ GOAL NOT MET ⚡'}
                  </p>
                </div>
                {/* Mini chart of the final round's price action */}
                {gameState.chartPoints.length >= 2 && (
                  <div className="bg-slate-900 border-2 border-slate-800 rounded-[16px] p-1.5 shadow-[3px_3px_0_0_#1e293b]">
                    <div className="flex items-center justify-between px-1 pb-1">
                      <span className="text-[8px] text-slate-400 font-mono tracking-widest uppercase font-bold">{gameState.currentCompany?.ticker} · FINAL ROUND</span>
                      <span className={`text-[8px] font-mono font-bold ${miniChart.stroke === '#10b981' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {currentPrice >= gameState.chartPoints[0] ? '▲' : '▼'} {formatMoney(currentPrice)}
                      </span>
                    </div>
                    <svg viewBox="0 0 260 70" className="w-full h-[60px] overflow-visible">
                      <path d={miniChart.fillD} fill="url(#miniChartGrad)" />
                      <path d={miniChart.pathD} fill="none" stroke={miniChart.stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
                <div className="bg-slate-50 border-2 border-slate-800 rounded-[20px] p-4 space-y-2.5 font-mono text-[11px] text-left shadow-[3px_3px_0_0_#1e293b]">
                  <div className="flex justify-between text-slate-500 font-bold">
                    <span>Rounds Cleared:</span>
                    <span className="text-slate-800">{gameState.roundNumber - 1}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 font-bold">
                    <span>Stocks Traded:</span>
                    <span className="text-slate-800">{gameState.companiesTradedCount}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 font-bold">
                    <span>Peak Bankroll:</span>
                    <span className="text-emerald-600">{formatMoney(gameState.highestCashInSession)}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2.5 flex justify-between items-center">
                    <span className="font-extrabold text-slate-800">Rank:</span>
                    <span className="bg-slate-800 text-yellow-300 font-black text-[8px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {gameState.highestCashInSession > 1000000 ? '👑 TYCOON' :
                       gameState.highestCashInSession > 100000 ? '🚀 WHALE' :
                       gameState.highestCashInSession > 10000 ? '🦁 PRO' : '🐹 ROOKIE'}
                    </span>
                  </div>
                </div>
                <div className="relative group w-full pt-1.5">
                  <div className="absolute inset-0 bg-yellow-600 rounded-[18px] translate-y-1.5" />
                  <button
                    onClick={handleDoneGameOver}
                    className="relative w-full bg-yellow-400 hover:bg-yellow-300 border-2 border-slate-800 text-slate-800 font-extrabold py-3 rounded-[18px] flex items-center justify-center gap-2 cursor-pointer text-xs transition-transform active:translate-y-1.5"
                  >
                    SUBMIT & EXIT
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

// ===== Card Shop Sub-component (acquisition/swap) =====
interface CardShopProps {
  company: Company;
  offer: RuleCard[];
  deck: RuleCard[];
  maxDeckSize: number;
  onConfirmAcquire: (newCards: RuleCard[], removedCardIds?: string[]) => void;
  onConfirmSwap: (newCards: RuleCard[], removedCardIds: string[]) => void;
  onSkip: () => void;
  shuffleLeft: number;
  onShuffle: () => void;
}

function CardShopPhase({ company, offer, deck, maxDeckSize, onConfirmAcquire, onConfirmSwap, onSkip, shuffleLeft, onShuffle }: CardShopProps) {
  const isAcquisition = deck.length < maxDeckSize;
  // Cards from the offer that the player has selected to add.
  const [selectedNew, setSelectedNew] = useState<string[]>([]);
  // Cards from the deck that the player has marked for removal (swap mode).
  const [selectedRemove, setSelectedRemove] = useState<string[]>([]);

  const volConfig = (() => {
    const v = company.volatility;
    if (v < 0.20) return '💎 Solid Safe';
    if (v < 0.45) return '⚡ Normal Swing';
    if (v < 0.70) return '🚀 Highly Volatile';
    return '🔥 Speculative Chaos';
  })();

  // Toggle a new card selection (from the offer).
  const toggleNew = (id: string) => {
    setSelectedNew(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      // Max picks: in acquisition mode, can't exceed remaining slots; in swap mode, can't exceed removed count.
      const maxPicks = isAcquisition
        ? maxDeckSize - (deck.length - selectedRemove.length)
        : selectedRemove.length;
      if (prev.length >= maxPicks) return prev;
      return [...prev, id];
    });
  };

  // Toggle a deck card for removal (swap mode only).
  const toggleRemove = (id: string) => {
    setSelectedRemove(prev => {
      if (prev.includes(id)) {
        // Removing from removal list — also drop any excess selected new cards.
        const newCap = prev.length - 1;
        setSelectedNew(n => n.slice(0, newCap));
        return prev.filter(x => x !== id);
      }
      return [...prev, id];
    });
  };

  const canConfirm = isAcquisition
    ? selectedNew.length > 0
    : selectedNew.length > 0 && selectedNew.length === selectedRemove.length;

  const handleConfirm = () => {
    const newCards = offer.filter(c => selectedNew.includes(c.id));
    if (isAcquisition) {
      onConfirmAcquire(newCards, selectedRemove);
    } else {
      onConfirmSwap(newCards, selectedRemove);
    }
  };

  // Computed card lists.
  const pickedCards = offer.filter(c => selectedNew.includes(c.id));
  const remainingOffer = offer.filter(c => !selectedNew.includes(c.id));
  const removedDeckCards = deck.filter(c => selectedRemove.includes(c.id));
  // Deck shown at top = existing kept cards + newly picked cards (fused together).
  const deckView = [
    ...deck.filter(c => !selectedRemove.includes(c.id)),
    ...pickedCards,
  ];

  return (
    <motion.div
      key="card_shop"
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -15 }}
      className="w-full flex-1 flex flex-col"
    >
      <div className="w-full bg-white rounded-[32px] border-4 border-slate-800 shadow-[6px_6px_0_0_#1e293b] p-4 flex-1 flex flex-col space-y-3">
        {/* Stock summary */}
        <div className="bg-yellow-50 rounded-[16px] p-2 border-2 border-dashed border-slate-300 text-center">
          <span className="text-sm bg-yellow-400 border border-slate-800 font-extrabold px-1.5 py-0.5 rounded font-mono">${company.ticker}</span>
          <span className="text-[9px] font-mono text-slate-500 ml-2">{volConfig} · ${company.basePrice.toFixed(2)}</span>
        </div>

        {/* Phase header */}
        <div className="text-center">
          <span className="text-[9px] bg-slate-800 text-white font-mono font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
            {isAcquisition ? `🎴 CARD SHOP — DECK ${deck.length}/${maxDeckSize}` : '🔄 SWAP SHOP — TRADE CARDS'}
          </span>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">
            {isAcquisition
              ? `Tap your deck cards to remove, tap offered to add. Pick at least one new card to deploy.`
              : 'Tap your cards to remove them, then tap offered cards to swap in.'}
          </p>
        </div>

        {/* YOUR DECK (top) — kept + newly picked cards fused together */}
        {deckView.length > 0 ? (
          <div className="bg-slate-50 border-2 border-slate-800 rounded-xl p-2 shadow-[2px_2px_0_0_#1e293b]">
            <span className="text-[8px] font-mono font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
              🤖 YOUR DECK ({deckView.length}/{maxDeckSize})
              {removedDeckCards.length > 0 && <span className="text-rose-500"> · -{removedDeckCards.length} in trash</span>}
              {pickedCards.length > 0 && <span className="text-emerald-600"> · {pickedCards.length} new</span>}
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {deckView.map(card => {
                const tierCfg = TIER_CONFIG[card.tier];
                const isNewPick = pickedCards.includes(card);
                return (
                  <button
                    key={card.id}
                    onClick={() => isNewPick ? toggleNew(card.id) : toggleRemove(card.id)}
                    className={`text-left p-1.5 rounded-lg border-2 transition-all cursor-pointer bg-white ${tierCfg.border} hover:bg-rose-50 hover:border-rose-400`}
                  >
                    <div className="flex items-start gap-1">
                      <span className="text-sm shrink-0">{card.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black text-slate-800 leading-tight truncate">{card.title}</p>
                        <p className="text-[7px] text-slate-500 leading-tight line-clamp-2">{card.description}</p>
                        <p className="text-[6px] font-mono text-slate-400">
                          T{card.tier}
                          <span className="text-rose-500 font-black"> · tap to remove</span>
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border-2 border-slate-800 rounded-xl p-2 shadow-[2px_2px_0_0_#1e293b]">
            <span className="text-[8px] font-mono font-bold uppercase text-slate-400 tracking-wider block mb-1.5">🤖 YOUR DECK (0/{maxDeckSize}):</span>
            <p className="text-[10px] text-slate-400 italic font-mono py-1">Empty deck — pick cards below to begin</p>
          </div>
        )}

        <div className="flex-1 flex flex-col min-h-0">
          <span className="text-[8px] font-mono font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
            🎴 OFFERED CARDS ({remainingOffer.length} left):
          </span>
          {remainingOffer.length === 0 ? (
            <p className="text-[10px] text-slate-400 italic font-mono py-2 text-center">All offered cards picked ✓</p>
          ) : (
          <div className="grid grid-cols-3 gap-1.5 flex-1 overflow-y-auto p-0.5">
            {remainingOffer.map(card => {
              const tierCfg = TIER_CONFIG[card.tier];
              const canSelect = isAcquisition
                ? selectedNew.length < (maxDeckSize - (deck.length - selectedRemove.length))
                : selectedNew.length < selectedRemove.length;
              return (
                <button
                  key={card.id}
                  disabled={!canSelect}
                  onClick={() => toggleNew(card.id)}
                  className={`text-left p-1.5 rounded-lg border-2 transition-all active:translate-y-0.5 ${
                    canSelect
                      ? `bg-white ${tierCfg.border} hover:bg-slate-50 cursor-pointer`
                      : 'bg-slate-100 border-slate-300 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1">
                      <span className="text-lg shrink-0">{card.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-slate-800 leading-tight truncate">{card.title}</p>
                        <p className="text-[6px] font-mono text-slate-400">T{card.tier} · {tierCfg.label}</p>
                      </div>
                    </div>
                    <p className="text-[8px] text-slate-500 leading-tight line-clamp-2">{card.description}</p>
                    <div className="flex flex-wrap gap-0.5">
                      <span className={`text-[6px] font-mono font-black px-1 py-0.5 rounded border uppercase ${
                        card.action === 'buy' ? 'bg-emerald-50 text-emerald-700 border-emerald-400' :
                        card.action === 'sell' ? 'bg-rose-50 text-rose-700 border-rose-400' :
                        'bg-slate-100 text-slate-600 border-slate-400'
                      }`}>
                        {card.action}
                      </span>
                      <span className="text-[6px] font-mono font-black px-1 py-0.5 rounded border bg-violet-50 text-violet-700 border-violet-300 uppercase">
                        {card.effectType}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          )}
        </div>

        {/* REMOVED DECK CARDS (trash) — visible any time, click to restore */}
        {removedDeckCards.length > 0 && (
          <div className="bg-slate-100 border-2 border-slate-400 border-dashed rounded-xl p-2">
            <span className="text-[8px] font-mono font-bold uppercase text-slate-500 tracking-wider block mb-1.5">
              🗑 TO BE REMOVED ({removedDeckCards.length}):
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {removedDeckCards.map(card => {
                const tierCfg = TIER_CONFIG[card.tier];
                return (
                  <button
                    key={card.id}
                    onClick={() => toggleRemove(card.id)}
                    className={`text-left p-1.5 rounded-lg border-2 transition-all active:translate-y-0.5 bg-slate-50 ${tierCfg.border} opacity-60 cursor-pointer hover:opacity-100`}
                  >
                    <div className="flex items-start gap-1">
                      <span className="text-sm shrink-0 grayscale">{card.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black text-slate-600 leading-tight truncate">{card.title}</p>
                        <p className="text-[6px] font-mono text-slate-500 font-black">🗑 tap to restore</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Shuffle + Confirm + Skip */}
        <div className="flex gap-2 pt-1">
          {/* Shuffle button */}
          <div className="relative group">
            <div className={`absolute inset-0 rounded-[18px] translate-y-1.5 ${shuffleLeft > 0 ? 'bg-violet-600' : 'bg-slate-300'}`} />
            <button
              disabled={shuffleLeft <= 0}
              onClick={onShuffle}
              className={`relative border-2 border-slate-800 font-black py-3 px-3 rounded-[18px] flex items-center justify-center gap-1 cursor-pointer text-xs transition-transform active:translate-y-1.5 ${
                shuffleLeft > 0
                  ? 'bg-violet-400 hover:bg-violet-300 text-white'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              🔀 ({shuffleLeft})
            </button>
          </div>

          {/* Confirm button */}
          <div className="relative group flex-1">
            <div className={`absolute inset-0 rounded-[18px] translate-y-1.5 ${canConfirm ? 'bg-emerald-600' : 'bg-slate-300'}`} />
            <button
              disabled={!canConfirm}
              onClick={handleConfirm}
              className={`relative w-full border-2 border-slate-800 font-black py-3 rounded-[18px] flex items-center justify-center gap-2 cursor-pointer text-xs transition-transform active:translate-y-1.5 ${
                canConfirm
                  ? 'bg-emerald-400 hover:bg-emerald-300 text-white'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Bot className="w-4 h-4" />
              {isAcquisition
                ? `ADD ${selectedNew.length} CARD${selectedNew.length !== 1 ? 'S' : ''} & DEPLOY 🚀`
                : `SWAP ${selectedNew.length} CARD${selectedNew.length !== 1 ? 'S' : ''} & DEPLOY 🚀`}
            </button>
          </div>

          {/* Skip button */}
          <div className="relative group">
            <div className="absolute inset-0 rounded-[18px] translate-y-1.5 bg-slate-600" />
            <button
              onClick={onSkip}
              className="relative border-2 border-slate-800 font-black py-3 px-3 rounded-[18px] flex items-center justify-center gap-1 cursor-pointer text-xs transition-transform active:translate-y-1.5 bg-slate-400 hover:bg-slate-300 text-white"
            >
              SKIP
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
