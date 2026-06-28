import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Coins, Check, AlertCircle, Sparkles, TrendingUp, TrendingDown, 
  HelpCircle, ChevronRight, CornerDownRight, Landmark, ArrowRight, RotateCcw,
  HandMetal, ShoppingCart, Star, Skull, HeartCrack, Volume2, Info, Newspaper, Clock
} from 'lucide-react';
import { Company, GameSessionState, GameSettings, TradePosition } from '../types';
import { getRandomCompany } from '../companies';
import { playSound } from '../utils/audio';
import { NewsHeadline, pickRandomHeadline } from '../utils/headlines';

interface ActiveGameProps {
  settings: GameSettings;
  runsCount: number;
  onFinishGame: (finalCash: number, companiesTraded: number, roundsPlayed: number) => void;
  onExitToMenu: () => void;
}

export default function ActiveGame({
  settings,
  runsCount,
  onFinishGame,
  onExitToMenu
}: ActiveGameProps) {
  
  // Initialize game session on first mount
  const [gameState, setGameState] = useState<GameSessionState>(() => {
    const startCompany = getRandomCompany([]);
    const initialPrice = startCompany.basePrice;
    
    // Generate some starter historical points for the chart
    const initialHistory: number[] = [];
    let curPrice = initialPrice;
    for (let i = 0; i < 10; i++) {
      // Simulate random walk
      const change = curPrice * (Math.random() * startCompany.volatility * 0.4 - startCompany.volatility * 0.18 + startCompany.trend * 0.2);
      curPrice = Math.max(1, Number((curPrice + change).toFixed(2)));
      initialHistory.push(curPrice);
    }

    return {
      cash: settings.startCash,
      currentCompany: startCompany,
      chartPoints: initialHistory,
      position: null,
      phase: 'discovery',
      roundNumber: 1,
      companiesTradedCount: 0,
      highestCashInSession: settings.startCash,
      lastRoundProfit: 0
    };
  });

  // Track historical company IDs to avoid duplicates
  const playedCompanyIds = useRef<string[]>([gameState.currentCompany.id]);

  // Persistent Off-market Gems and Session Access Actions (Keys)
  const [gems, setGems] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('cointrader_gems_v3');
      return stored ? parseInt(stored, 10) : 50;
    } catch {
      return 50;
    }
  });
  const [actionsRemaining, setActionsRemaining] = useState<number>(10);
  const [showRefillNeeded, setShowRefillNeeded] = useState<boolean>(false);
  const [freeBribeCooldown, setFreeBribeCooldown] = useState<number>(0);

  useEffect(() => {
    try {
      localStorage.setItem('cointrader_gems_v3', gems.toString());
    } catch (e) {
      console.error(e);
    }
  }, [gems]);

  useEffect(() => {
    if (freeBribeCooldown <= 0) return;
    const interval = setInterval(() => {
      setFreeBribeCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [freeBribeCooldown]);

  // News Headlines & Real-time Auto-Drift Game States
  const [tradingSubPhase, setTradingSubPhase] = useState<'idle' | 'auto_drift_init' | 'news_pending' | 'auto_drift_impact' | 'cooldown'>('idle');
  const [ticksRemaining, setTicksRemaining] = useState<number>(0);
  const [currentNews, setCurrentNews] = useState<NewsHeadline | null>(null);
  const [isNewsMinimized, setIsNewsMinimized] = useState<boolean>(false);
  const [showNewsPopup, setShowNewsPopup] = useState<boolean>(false);

  useEffect(() => {
    if (currentNews) {
      setIsNewsMinimized(false);
      setShowNewsPopup(false);
    }
  }, [currentNews]);
  const [cooldownTime, setCooldownTime] = useState<number>(0);
  const [usedNewsIds, setUsedNewsIds] = useState<Set<string>>(() => new Set());
  
  const [buyAmount, setBuyAmount] = useState<number>(100);
  const [sellAmount, setSellAmount] = useState<number>(100);
  const [isMaxToggled, setIsMaxToggled] = useState<boolean>(false);

  // Transaction markers state for the active round
  const [transactions, setTransactions] = useState<{ index: number; price: number; type: 'buy' | 'sell'; amount: number }[]>([]);

  // Active point index state to scan along the pre-generated chart points
  const [activePointIndex, setActivePointIndex] = useState<number>(() => gameState.chartPoints.length - 1);

  // Performance-optimized Refs for Real-time Game Ticker
  const currentCompanyRef = useRef(gameState.currentCompany);
  const usedNewsIdsRef = useRef(usedNewsIds);
  const currentNewsRef = useRef(currentNews);

  useEffect(() => {
    currentCompanyRef.current = gameState.currentCompany;
  }, [gameState.currentCompany]);

  useEffect(() => {
    usedNewsIdsRef.current = usedNewsIds;
  }, [usedNewsIds]);

  useEffect(() => {
    currentNewsRef.current = currentNews;
  }, [currentNews]);

  // Handle company skipping
  const handleSkipCompany = () => {
    if (settings.soundEnabled) playSound('skip');
    
    const nextComp = getRandomCompany(playedCompanyIds.current);
    playedCompanyIds.current.push(nextComp.id);

    // Generate price history for the next company
    const nextHistory: number[] = [];
    let curPrice = nextComp.basePrice;
    for (let i = 0; i < 10; i++) {
      const change = curPrice * (Math.random() * nextComp.volatility * 0.4 - nextComp.volatility * 0.18 + nextComp.trend * 0.2);
      curPrice = Math.max(1, Number((curPrice + change).toFixed(2)));
      nextHistory.push(curPrice);
    }

    setTradingSubPhase('idle');
    setTicksRemaining(0);
    setCurrentNews(null);
    setShowNewsPopup(false);
    setCooldownTime(0);
    setUsedNewsIds(new Set());
    setActivePointIndex(9);
    setTransactions([]);

    setGameState(prev => ({
      ...prev,
      currentCompany: nextComp,
      chartPoints: nextHistory,
      position: null,
      phase: 'discovery',
      roundNumber: prev.roundNumber + 1
    }));
  };

  // Convert Discovery to Active Trading
  const handleStartTrading = () => {
    if (settings.soundEnabled) playSound('click');
    setGameState(prev => ({
      ...prev,
      phase: 'trading',
      companiesTradedCount: prev.companiesTradedCount + 1
    }));
  };

  // Buy action (flexible chunk size)
  const handleBuyTransaction = (amount: number = 100) => {
    if (actionsRemaining <= 0) {
      setShowRefillNeeded(true);
      if (settings.soundEnabled) playSound('click');
      return;
    }

    const currentPriceTmp = gameState.chartPoints[activePointIndex];
    if (gameState.cash < amount || amount <= 0) return; // double check

    if (settings.soundEnabled) playSound('buy');

    // Deduct action key
    setActionsRemaining(prev => Math.max(0, prev - 1));

    // Add transaction marker for buying
    setTransactions(prev => [...prev, { index: activePointIndex, price: currentPriceTmp, type: 'buy', amount }]);

    // Calculate shares purchased for custom amount
    const sharesBought = amount / currentPriceTmp;

    setGameState(prev => {
      const prevPosition = prev.position;
      
      let updatedPosition: TradePosition;
      if (prevPosition) {
        const totalShares = prevPosition.shares + sharesBought;
        const totalInvested = prevPosition.investedCash + amount;
        updatedPosition = {
          ticker: prev.currentCompany.ticker,
          shares: totalShares,
          investedCash: totalInvested,
          avgBuyPrice: Number((totalInvested / totalShares).toFixed(2))
        };
      } else {
        updatedPosition = {
          ticker: prev.currentCompany.ticker,
          shares: sharesBought,
          investedCash: amount,
          avgBuyPrice: currentPriceTmp
        };
      }

      const nextPoints = [...prev.chartPoints];
      const nextCash = Number((prev.cash - amount).toFixed(2));

      // Check current subphase to determine point pre-generation!
      if (tradingSubPhase === 'idle') {
        // Pre-generate 5 points for auto_drift_init
        let curVal = currentPriceTmp;
        for (let i = 0; i < 5; i++) {
          const change = curVal * (Math.random() * prev.currentCompany.volatility * 0.12 - prev.currentCompany.volatility * 0.06 + prev.currentCompany.trend * 0.04);
          curVal = Math.max(1, Number((curVal + change).toFixed(2)));
          nextPoints.push(curVal);
        }
      } else if (tradingSubPhase === 'news_pending' && currentNews) {
        // Pre-generate 11 points (6 impact + 5 cooldown)
        let newsImpactMultiplier = 1.0;
        if (currentNews.sentiment === 'positive') {
          // Boosted positive news impact for massive, exciting rallies
          newsImpactMultiplier = 3.0 + Math.random() * 1.5;
        } else if (currentNews.sentiment === 'negative') {
          // Amplified downward drops for high-risk trading thrills
          newsImpactMultiplier = 2.5 + Math.random() * 1.5;
        } else {
          newsImpactMultiplier = 1.2 + Math.random() * 0.8;
        }
        const totalImpact = currentNews.impactPercent * newsImpactMultiplier;
        const targetPrice = Math.max(1, Number((currentPriceTmp * (1 + totalImpact)).toFixed(2)));
        
        let curVal = currentPriceTmp;
        
        // 6 steps for impact phase
        for (let i = 1; i <= 6; i++) {
          const ratio = i / 6;
          const baseInterp = currentPriceTmp + (targetPrice - currentPriceTmp) * ratio;
          const jitterFactor = (1 - ratio) * (Math.random() * prev.currentCompany.volatility * 0.3 - prev.currentCompany.volatility * 0.15);
          let stepVal = baseInterp * (1 + jitterFactor);
          stepVal = Math.max(1, Number(stepVal.toFixed(2)));
          nextPoints.push(stepVal);
          curVal = stepVal;
        }
        
        // 5 steps for cooldown phase
        for (let i = 0; i < 5; i++) {
          const change = curVal * (Math.random() * prev.currentCompany.volatility * 0.12 - prev.currentCompany.volatility * 0.06 + prev.currentCompany.trend * 0.04);
          curVal = Math.max(1, Number((curVal + change).toFixed(2)));
          nextPoints.push(curVal);
        }
      }

      const sessionPeak = Math.max(prev.highestCashInSession, nextCash + (updatedPosition.shares * currentPriceTmp));

      return {
        ...prev,
        cash: nextCash,
        position: updatedPosition,
        chartPoints: nextPoints,
        highestCashInSession: sessionPeak
      };
    });

    // Handle sub-phase transition!
    if (tradingSubPhase === 'idle') {
      setTicksRemaining(5);
      setTradingSubPhase('auto_drift_init');
    } else if (tradingSubPhase === 'news_pending') {
      setCurrentNews(null); // Clear active news
      setShowNewsPopup(false);
      setTicksRemaining(11);
      setTradingSubPhase('auto_drift_impact');
    }
  };

  // Sell action (flexible chunk size)
  const handlePartialSellTransaction = (amount: number) => {
    if (!gameState.position) return;
    if (actionsRemaining <= 0) {
      setShowRefillNeeded(true);
      if (settings.soundEnabled) playSound('click');
      return;
    }

    const currentPrice = gameState.chartPoints[activePointIndex];
    const maxShares = gameState.position.shares;
    const maxVal = maxShares * currentPrice;

    // Determine actual amount to sell (cannot exceed total position value)
    const actualAmount = Math.min(amount, maxVal);
    if (actualAmount <= 0) return;

    if (settings.soundEnabled) playSound('buy'); // Use buy sound or click

    // Deduct action key
    setActionsRemaining(prev => Math.max(0, prev - 1));

    // Add transaction marker for selling
    setTransactions(prev => [...prev, { index: activePointIndex, price: currentPrice, type: 'sell', amount: actualAmount }]);

    const sharesToSell = actualAmount / currentPrice;

    setGameState(prev => {
      if (!prev.position) return prev;
      
      const newShares = Math.max(0, prev.position.shares - sharesToSell);
      const nextCash = Number((prev.cash + actualAmount).toFixed(2));
      const sessionPeak = Math.max(prev.highestCashInSession, nextCash + (newShares * currentPrice));

      let nextPosition: TradePosition | null = null;
      if (newShares > 0.001) { // fractional share dust threshold
        const ratio = newShares / prev.position.shares;
        nextPosition = {
          ...prev.position,
          shares: newShares,
          investedCash: Number((prev.position.investedCash * ratio).toFixed(2))
        };
      }

      const nextPoints = [...prev.chartPoints];
      if (tradingSubPhase === 'news_pending' && currentNews) {
        // Pre-generate 11 points (6 impact + 5 cooldown)
        let newsImpactMultiplier = 1.0;
        if (currentNews.sentiment === 'positive') {
          newsImpactMultiplier = 3.0 + Math.random() * 1.5;
        } else if (currentNews.sentiment === 'negative') {
          newsImpactMultiplier = 2.5 + Math.random() * 1.5;
        } else {
          newsImpactMultiplier = 1.2 + Math.random() * 0.8;
        }
        const totalImpact = currentNews.impactPercent * newsImpactMultiplier;
        const targetPrice = Math.max(1, Number((currentPrice * (1 + totalImpact)).toFixed(2)));
        
        let curVal = currentPrice;
        
        // 6 steps for impact phase
        for (let i = 1; i <= 6; i++) {
          const ratio = i / 6;
          const baseInterp = currentPrice + (targetPrice - currentPrice) * ratio;
          const jitterFactor = (1 - ratio) * (Math.random() * prev.currentCompany.volatility * 0.3 - prev.currentCompany.volatility * 0.15);
          let stepVal = baseInterp * (1 + jitterFactor);
          stepVal = Math.max(1, Number(stepVal.toFixed(2)));
          nextPoints.push(stepVal);
          curVal = stepVal;
        }
        
        // 5 steps for cooldown phase
        for (let i = 0; i < 5; i++) {
          const change = curVal * (Math.random() * prev.currentCompany.volatility * 0.12 - prev.currentCompany.volatility * 0.06 + prev.currentCompany.trend * 0.04);
          curVal = Math.max(1, Number((curVal + change).toFixed(2)));
          nextPoints.push(curVal);
        }
      }

      return {
        ...prev,
        cash: nextCash,
        position: nextPosition,
        chartPoints: nextPoints,
        highestCashInSession: sessionPeak
      };
    });

    // Handle sub-phase transition!
    if (tradingSubPhase === 'news_pending') {
      setCurrentNews(null); // Clear active news
      setShowNewsPopup(false);
      setTicksRemaining(11);
      setTradingSubPhase('auto_drift_impact');
    }
  };

  // Skip transaction or Go back (if 0 position exists yet)
  const handleBackToDiscovery = () => {
    if (settings.soundEnabled) playSound('click');
    setGameState(prev => ({
      ...prev,
      phase: 'discovery'
    }));
  };

  // Hold Action (Advances subphase or advances drift)
  const handleHoldAction = () => {
    if (actionsRemaining <= 0) {
      setShowRefillNeeded(true);
      if (settings.soundEnabled) playSound('click');
      return;
    }

    if (settings.soundEnabled) playSound('click');

    // Deduct action key
    setActionsRemaining(prev => Math.max(0, prev - 1));

    if (tradingSubPhase === 'news_pending' && currentNews) {
      const currentPriceTmp = gameState.chartPoints[activePointIndex];

      // Pre-generate 11 points (6 impact + 5 cooldown)
      setGameState(prev => {
        let newsImpactMultiplier = 1.0;
        if (currentNews.sentiment === 'positive') {
          // Boosted positive news impact for massive, exciting rallies
          newsImpactMultiplier = 3.0 + Math.random() * 1.5;
        } else if (currentNews.sentiment === 'negative') {
          // Amplified downward drops for high-risk trading thrills
          newsImpactMultiplier = 2.5 + Math.random() * 1.5;
        } else {
          newsImpactMultiplier = 1.2 + Math.random() * 0.8;
        }
        const totalImpact = currentNews.impactPercent * newsImpactMultiplier;
        const targetPrice = Math.max(1, Number((currentPriceTmp * (1 + totalImpact)).toFixed(2)));
        
        const nextPoints = [...prev.chartPoints];
        let curVal = currentPriceTmp;
        
        // 6 steps for impact phase
        for (let i = 1; i <= 6; i++) {
          const ratio = i / 6;
          const baseInterp = currentPriceTmp + (targetPrice - currentPriceTmp) * ratio;
          const jitterFactor = (1 - ratio) * (Math.random() * prev.currentCompany.volatility * 0.3 - prev.currentCompany.volatility * 0.15);
          let stepVal = baseInterp * (1 + jitterFactor);
          stepVal = Math.max(1, Number(stepVal.toFixed(2)));
          nextPoints.push(stepVal);
          curVal = stepVal;
        }
        
        // 5 steps for cooldown phase
        for (let i = 0; i < 5; i++) {
          const change = curVal * (Math.random() * prev.currentCompany.volatility * 0.12 - prev.currentCompany.volatility * 0.06 + prev.currentCompany.trend * 0.04);
          curVal = Math.max(1, Number((curVal + change).toFixed(2)));
          nextPoints.push(curVal);
        }
        
        let currentVal = 0;
        if (prev.position) {
          currentVal = prev.position.shares * currentPriceTmp;
        }
        const sessionPeak = Math.max(prev.highestCashInSession, prev.cash + currentVal);

        return {
          ...prev,
          chartPoints: nextPoints,
          highestCashInSession: sessionPeak
        };
      });

      setCurrentNews(null); // Clear active news
      setShowNewsPopup(false);
      setTicksRemaining(11);
      setTradingSubPhase('auto_drift_impact');
    }
  };

  // Sell Action (Cash out and end the round)
  const handleSellTransaction = () => {
    if (!gameState.position) {
      if (settings.soundEnabled) playSound('click');
      setGameState(prev => ({
        ...prev,
        lastRoundProfit: 0,
        phase: 'round_complete'
      }));
      return;
    }
    
    const currentPrice = gameState.chartPoints[activePointIndex];
    const finalValue = gameState.position.shares * currentPrice;
    const profit = finalValue - gameState.position.investedCash;

    if (settings.soundEnabled) {
      if (profit >= 0) {
        playSound('win');
      } else {
        playSound('lose');
      }
    }

    if (profit > 0) {
      const gemReward = 5 + Math.floor(profit / 100);
      setGems(prev => prev + gemReward);
    }

    setGameState(prev => {
      const currentPriceTmp = prev.chartPoints[activePointIndex];
      const finalValueTmp = prev.position!.shares * currentPriceTmp;
      const roundProfit = finalValueTmp - prev.position!.investedCash;
      const nextCash = Number((prev.cash + finalValueTmp).toFixed(2));
      const sessionPeak = Math.max(prev.highestCashInSession, nextCash);

      return {
        ...prev,
        cash: nextCash,
        lastRoundProfit: roundProfit,
        phase: 'round_complete',
        highestCashInSession: sessionPeak
      };
    });
  };

  // Progress to next round (after completion)
  const handleNextRound = () => {
    if (settings.soundEnabled) playSound('click');

    // First check: did they go totally broke? (0 cash)
    if (gameState.cash < 5) {
      if (settings.soundEnabled) playSound('gameover');
      setGameState(prev => ({
        ...prev,
        phase: 'game_over'
      }));
      return;
    }

    const nextComp = getRandomCompany(playedCompanyIds.current);
    playedCompanyIds.current.push(nextComp.id);

    // Initial graph history for new company
    const nextHistory: number[] = [];
    let curPrice = nextComp.basePrice;
    for (let i = 0; i < 10; i++) {
      const change = curPrice * (Math.random() * nextComp.volatility * 0.4 - nextComp.volatility * 0.18 + nextComp.trend * 0.2);
      curPrice = Math.max(1, Number((curPrice + change).toFixed(2)));
      nextHistory.push(curPrice);
    }

    // Reset news/auto states
    setTradingSubPhase('idle');
    setTicksRemaining(0);
    setCurrentNews(null);
    setShowNewsPopup(false);
    setCooldownTime(0);
    setUsedNewsIds(new Set());
    setActivePointIndex(9);
    setTransactions([]);

    setGameState(prev => ({
      ...prev,
      currentCompany: nextComp,
      chartPoints: nextHistory,
      position: null,
      phase: 'discovery',
      roundNumber: prev.roundNumber + 1
    }));
  };

  // Game loop tick manager
  useEffect(() => {
    if (gameState.phase !== 'trading') return;

    let intervalId: NodeJS.Timeout | null = null;

    if (tradingSubPhase === 'auto_drift_init' || tradingSubPhase === 'auto_drift_impact') {
      // Fast ticking for auto-drifts (every 250ms)
      intervalId = setInterval(() => {
        setActivePointIndex(prevIdx => {
          const nextIdx = prevIdx + 1;
          
          setGameState(prev => {
            const currentPriceTmp = prev.chartPoints[nextIdx] || prev.chartPoints[prev.chartPoints.length - 1];
            let currentVal = 0;
            if (prev.position) {
              currentVal = prev.position.shares * currentPriceTmp;
            }
            const sessionPeak = Math.max(prev.highestCashInSession, prev.cash + currentVal);
            return {
              ...prev,
              highestCashInSession: sessionPeak
            };
          });

          return nextIdx;
        });

        setTicksRemaining(prev => {
          const nextTicks = prev - 1;
          if (nextTicks <= 0) {
            if (intervalId) clearInterval(intervalId);
            
            if (tradingSubPhase === 'auto_drift_init') {
              // Trigger news popup!
              const { headline, id } = pickRandomHeadline(currentCompanyRef.current, usedNewsIdsRef.current);
              setUsedNewsIds(prevSet => {
                const copy = new Set(prevSet);
                copy.add(id);
                return copy;
              });
              setCurrentNews(headline);
              setTradingSubPhase('news_pending');
              if (settings.soundEnabled) playSound('click');
            } else {
              // End of impact drift -> immediately trigger next news!
              const { headline, id } = pickRandomHeadline(currentCompanyRef.current, usedNewsIdsRef.current);
              setUsedNewsIds(prevSet => {
                const copy = new Set(prevSet);
                copy.add(id);
                return copy;
              });
              setCurrentNews(headline);
              setTradingSubPhase('news_pending');
              if (settings.soundEnabled) playSound('click');
            }
          }
          return nextTicks;
        });
      }, 250);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [gameState.phase, tradingSubPhase]);

  // Exit trigger to submit scoring
  const handleDoneGameOver = () => {
    if (settings.soundEnabled) playSound('click');
    onFinishGame(gameState.cash, gameState.companiesTradedCount, gameState.roundNumber);
  };

  // Values calculation for rendering
  const currentPrice = gameState.chartPoints[activePointIndex] || gameState.chartPoints[gameState.chartPoints.length - 1] || 1;
  const positionValue = gameState.position ? (gameState.position.shares * currentPrice) : 0;
  const totalEquity = gameState.cash + positionValue;
  const totalInvested = gameState.position ? gameState.position.investedCash : 0;
  const liveProfit = gameState.position ? (positionValue - totalInvested) : 0;
  const isProfit = liveProfit >= 0;
  const returnPercent = totalInvested > 0 ? (liveProfit / totalInvested) * 100 : 0;

  // Compute risk level indicator
  const getVolatilityConfig = (v: number) => {
    if (v < 0.20) return { label: '💎 Solid Safe', color: 'text-emerald-500 bg-emerald-50 border-emerald-300' };
    if (v < 0.45) return { label: '⚡ Normal Swing', color: 'text-blue-500 bg-blue-50 border-blue-300' };
    if (v < 0.70) return { label: '🚀 Highly Volatile', color: 'text-amber-500 bg-amber-50 border-amber-300' };
    return { label: '🔥 Speculative Chaos', color: 'text-red-500 bg-red-50 border-red-300 animate-pulse' };
  };

  const volConfig = getVolatilityConfig(gameState.currentCompany.volatility);

  // SVG Chart points calculation mapping path
  const renderChartPath = () => {
    const points = gameState.chartPoints;
    const width = 340;
    const height = 150;
    const padding = 20;

    const minVal = Math.min(...points) * 0.95;
    const maxVal = Math.max(...points) * 1.05;
    const valueRange = maxVal - minVal === 0 ? 1 : maxVal - minVal;

    const coords = points.map((p, idx) => {
      const x = padding + (idx / (points.length - 1)) * (width - padding * 2);
      const y = height - padding - ((p - minVal) / valueRange) * (height - padding * 2);
      return { x, y };
    });

    // Solid line (already passed / completed points)
    let pathD_passed = '';
    const endPassedIdx = Math.min(activePointIndex, coords.length - 1);
    if (coords.length > 0) {
      pathD_passed = `M ${coords[0].x} ${coords[0].y}`;
      for (let i = 1; i <= endPassedIdx; i++) {
        pathD_passed += ` L ${coords[i].x} ${coords[i].y}`;
      }
    }

    // Dashed line (future pre-generated points)
    let pathD_future = '';
    if (activePointIndex < coords.length - 1 && coords.length > 0) {
      pathD_future = `M ${coords[activePointIndex].x} ${coords[activePointIndex].y}`;
      for (let i = activePointIndex + 1; i < coords.length; i++) {
        pathD_future += ` L ${coords[i].x} ${coords[i].y}`;
      }
    }

    // Build area fill path for passed points only
    let fillD_passed = '';
    if (coords.length > 0) {
      fillD_passed = `${pathD_passed} L ${coords[endPassedIdx].x} ${height - padding} L ${coords[0].x} ${height - padding} Z`;
    }

    return { pathD_passed, pathD_future, fillD_passed, coords };
  };

  const chartInfo = renderChartPath();
  const currentCoord = chartInfo.coords[Math.min(activePointIndex, chartInfo.coords.length - 1)] || { x: 0, y: 0 };

  return (
    <div className="flex flex-col items-center h-full w-full max-w-2xl mx-auto p-1 sm:p-2 select-none">
      
      {/* Top Session HUD bar */}
      <div id="session_hud" className="w-full flex justify-between items-center mb-2.5 bg-slate-800 text-white rounded-[24px] p-3 border-2 border-slate-800 shadow-[4px_4px_0_0_#1e293b] shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-yellow-400 shrink-0" />
            <div className="text-left leading-none">
              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-300 block">AVAILABLE CASH</span>
              <span id="label_bankroll" className="font-mono text-sm font-black text-yellow-350">
                💵 ${gameState.cash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 border-l border-slate-700 pl-3">
            <div className="text-left leading-none">
              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-300 block">GEMS</span>
              <span className="font-mono text-xs font-black text-emerald-400">
                💎 {gems}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right leading-none border-r border-slate-700 pr-3">
            <span className="text-[9px] font-mono tracking-wider uppercase text-slate-300 block">KEYS LEFT</span>
            <div className="flex items-center gap-1.5 justify-end">
              <span className={`font-mono font-black text-xs ${actionsRemaining <= 2 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>
                🔑 {actionsRemaining}/10
              </span>
              <button
                onClick={() => {
                  if (settings.soundEnabled) playSound('click');
                  setShowRefillNeeded(true);
                }}
                className="bg-slate-700 hover:bg-slate-600 active:scale-95 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded border border-slate-600 cursor-pointer"
              >
                + REFILL
              </button>
            </div>
          </div>
          <div className="text-right leading-none">
            <span className="text-[9px] font-mono tracking-wider uppercase text-slate-300 block">LEVEL / ROUND</span>
            <span className="font-mono font-black text-xs text-slate-100">
              #{gameState.roundNumber} <span className="text-[9px] text-yellow-400">({gameState.currentCompany.ticker})</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center w-full min-h-0">
      <AnimatePresence mode="wait">
        
        {/* Phase 1: Discovery card */}
        {gameState.phase === 'discovery' && (
          <motion.div
            key="discovery"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            className="w-full"
          >
            {/* The Company Folder view */}
            <div className="w-full bg-white rounded-[32px] border-4 border-slate-800 shadow-[6px_6px_0_0_#1e293b] overflow-hidden p-5 flex flex-col justify-between space-y-4">
              
              <div className="space-y-3.5">
                {/* Visual Category Label */}
                <div className="flex justify-between items-center">
                  <span className="text-[9px] bg-slate-800 text-white font-mono font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    📂 DISCOVERY STAGE
                  </span>
                  
                  {/* Category Stamp */}
                  <span className="text-[10px] font-bold font-mono text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                    {gameState.currentCompany.icon} {gameState.currentCompany.category}
                  </span>
                </div>

                {/* Company Name, Ticker and Big Title */}
                <div className="text-center bg-yellow-50 rounded-[20px] p-4 border-2 border-dashed border-slate-350 relative">
                  <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-[10px] bg-yellow-400 border-2 border-slate-800 text-slate-800 font-black font-mono px-3 py-0.5 rounded-full shadow-[2px_2px_0_0_#1e293b]">
                    ${gameState.currentCompany.ticker}
                  </span>
                  <p className="text-lg font-black mt-2 text-slate-800 font-sans tracking-tight leading-snug">
                    {gameState.currentCompany.name}
                  </p>
                  <div className={`mt-1.5 font-mono text-[9px] uppercase font-bold px-2 py-0.5 rounded-lg border inline-block ${volConfig.color.replace('border-emerald-300', 'border-slate-800').replace('border-blue-300', 'border-slate-800').replace('border-amber-300', 'border-slate-800').replace('border-red-300', 'border-slate-800')}`}>
                    {volConfig.label}
                  </div>
                </div>

                {/* Company summary content */}
                <div className="bg-slate-50 border-2 border-slate-800 rounded-[20px] p-4 space-y-2 shadow-[3px_3px_0_0_#1e293b]">
                  <span className="text-[8px] font-mono font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                    <Info className="w-3 h-3 text-slate-400" />
                    DOSSIER SUMMARY:
                  </span>
                  <p className="text-xs font-medium leading-normal text-slate-600 font-sans">
                    {gameState.currentCompany.summary}
                  </p>
                </div>
              </div>

              {/* Action options */}
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative group w-full">
                    <div className="absolute inset-0 bg-slate-400 rounded-[18px] translate-y-1" />
                    <button
                      id="btn_skip_company"
                      onClick={handleSkipCompany}
                      className="relative w-full bg-slate-100 hover:bg-slate-200 border-2 border-slate-800 text-slate-700 font-black py-2.5 rounded-[18px] flex items-center justify-center gap-1 cursor-pointer text-xs active:translate-y-1 transition-transform"
                    >
                      PASS ➔
                    </button>
                  </div>

                  <div className="relative group w-full">
                    <div className="absolute inset-0 bg-emerald-600 rounded-[18px] translate-y-1" />
                    <button
                      id="btn_trade_company"
                      onClick={handleStartTrading}
                      className="relative w-full bg-emerald-400 hover:bg-emerald-350 border-2 border-slate-800 text-white font-black py-2.5 rounded-[18px] flex items-center justify-center gap-1 cursor-pointer text-xs active:translate-y-1 transition-transform"
                    >
                      TRADE 📈
                    </button>
                  </div>
                </div>

                <button
                  id="btn_abort_game"
                  onClick={() => {
                    if (confirm('Exit back to main menu? Your ongoing progress will be stored.')) {
                      onExitToMenu();
                    }
                  }}
                  className="w-full text-center text-[10px] text-slate-400 hover:text-slate-600 hover:underline uppercase tracking-widest font-mono py-1 cursor-pointer"
                >
                  ◀ BACK TO MAIN MAIN
                </button>
              </div>

            </div>
          </motion.div>
        )}

        {/* Phase 2: Active Trading view */}
        {gameState.phase === 'trading' && (
          <motion.div
            key="trading"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            className="w-full flex-1 flex flex-col justify-between"
          >
            <div className="w-full bg-white rounded-[32px] border-4 border-slate-800 shadow-[6px_6px_0_0_#1e293b] p-4 flex-1 flex flex-col justify-between space-y-3 relative">
              
              <div className={`flex-1 flex flex-col justify-between space-y-3 transition-opacity duration-300 ${
                tradingSubPhase === 'news_pending' && currentNews && showNewsPopup && !isNewsMinimized ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}>
              
              {/* Top row of rounded panel: Retreat button if subphase is idle */}
              <div className="flex justify-between items-center w-full">
                {tradingSubPhase === 'idle' ? (
                  <button
                    onClick={handleBackToDiscovery}
                    className="bg-slate-100 hover:bg-slate-200 border-2 border-slate-800 text-slate-700 font-black px-2.5 py-1 rounded-xl flex items-center gap-1 cursor-pointer text-[10px] active:translate-y-0.5 transition-all shadow-[2px_2px_0_0_#1e293b]"
                  >
                    ◀ RETREAT
                  </button>
                ) : (
                  <div className="w-2 h-2" />
                )}
                
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  {tradingSubPhase === 'idle' ? 'PRE-TRADE ANALYSIS' : 'LIVE PIPELINE'}
                </span>
              </div>

              {/* Trading Sub-HUD for stock details */}
              <div className="flex justify-between items-center bg-slate-50 px-3 py-2 border-2 border-slate-800 rounded-xl font-mono shadow-[2px_2px_0_0_#1e293b]">
                <div className="text-left">
                  <span className="text-[8px] text-slate-400 font-bold uppercase block truncate max-w-[130px]">{gameState.currentCompany.name}</span>
                  <span className="text-[10px] bg-yellow-400 border border-slate-800 font-extrabold px-1.5 py-0.2 rounded font-mono text-slate-800">
                    ${gameState.currentCompany.ticker}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[8px] text-slate-400 block uppercase font-bold">CURRENT PRICE</span>
                  <span className="text-sm font-black text-rose-500 animate-pulse">
                    ${currentPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* The Live Bouncing Chart */}
              <div className="bg-slate-900 border-4 border-slate-800 rounded-[24px] p-2 relative h-[170px] flex flex-col justify-end overflow-hidden shadow-inner select-none">
                
                {/* Horizontal reference lines */}
                <div className="absolute inset-0 flex flex-col justify-between py-6 opacity-10 pointer-events-none">
                  <div className="border-t border-dashed border-white w-full" />
                  <div className="border-t border-dashed border-white w-full" />
                  <div className="border-t border-dashed border-white w-full" />
                </div>

                {/* Live Floating ticker feedback text */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5 pointer-events-none">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <span className="text-[8px] text-slate-400 font-mono tracking-widest uppercase font-bold">CHIP CHART LINK</span>
                </div>

                {/* SVG Visual path */}
                <svg className="w-full h-[140px] absolute bottom-2 left-0 overflow-visible">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Shaded Area Fill below line */}
                  <path
                    d={chartInfo.fillD_passed}
                    fill="url(#chartGradient)"
                    className="transition-all duration-300 ease-out"
                  />

                  {/* Core Trace Line (Passed) */}
                  <path
                    d={chartInfo.pathD_passed}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-300 ease-out"
                  />

                  {/* Future Pre-generated Trace Line (Dashed) */}
                  {chartInfo.pathD_future && (
                    <path
                      d={chartInfo.pathD_future}
                      fill="none"
                      stroke="#475569"
                      strokeWidth="2.5"
                      strokeDasharray="4 4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="opacity-60 transition-all duration-300 ease-out"
                    />
                  )}

                  {/* Pulsing endpoint */}
                  <circle
                    cx={currentCoord.x}
                    cy={currentCoord.y}
                    r="6.5"
                    fill="#10b981"
                    stroke="#fff"
                    strokeWidth="2.5"
                    className="animate-pulse"
                  />

                  {/* Buy/Sell transaction markers */}
                  {transactions.map((tx, idx) => {
                    const coord = chartInfo.coords[tx.index];
                    if (!coord) return null;
                    const isBuy = tx.type === 'buy';
                    return (
                      <g key={`tx_${idx}`} className="animate-bounce">
                        <circle
                          cx={coord.x}
                          cy={coord.y}
                          r="6.5"
                          fill={isBuy ? '#10b981' : '#f43f5e'}
                          stroke="#ffffff"
                          strokeWidth="2.5"
                        />
                        <circle
                          cx={coord.x}
                          cy={coord.y}
                          r="2.5"
                          fill="#ffffff"
                        />
                        <text
                          x={coord.x}
                          y={coord.y - 12}
                          textAnchor="middle"
                          className="font-mono text-[9px] font-black fill-white select-none pointer-events-none"
                          style={{
                            paintOrder: 'stroke',
                            stroke: '#0f172a',
                            strokeWidth: '2.5px',
                            strokeLinejoin: 'round'
                          }}
                        >
                          {isBuy ? '▲ BUY' : '▼ SELL'}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Position stats log wrapper (Buy vs Value) */}
              {gameState.position && (
              <div className="bg-slate-50 p-4 border-2 border-slate-800 rounded-[24px] shadow-[4px_4px_0_0_#1e293b]">
                  <div className="flex flex-col space-y-3">
                    {/* Top primary row: large metrics */}
                    <div className="grid grid-cols-2 gap-3 items-center">
                      <div className="text-left">
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider font-mono block mb-1">CURRENT SHARE VALUE</span>
                        <span className={`text-2xl sm:text-3xl font-black tracking-tighter font-mono block ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
                          ${positionValue.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="text-right flex flex-col items-end">
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider font-mono block mb-1">TOTAL RETURN RATE</span>
                        <div className={`inline-flex items-center gap-1.5 font-black text-base sm:text-lg font-mono px-3 py-1 rounded-2xl border-2 ${
                          isProfit ? 'text-emerald-700 bg-emerald-50 border-emerald-400' : 'text-rose-700 bg-rose-50 border-rose-400'
                        }`}>
                          {isProfit ? <TrendingUp className="w-4 h-4 shrink-0" /> : <TrendingDown className="w-4 h-4 shrink-0" />}
                          <span>{isProfit ? '+' : ''}{returnPercent.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom sub-row: auxiliary info */}
                    <div className="border-t border-slate-200 pt-2.5 flex justify-between items-center text-[10px] text-slate-500 font-mono font-medium">
                      <div>
                        <span>Shares Owned: </span>
                        <strong className="text-slate-700 font-bold">{gameState.position.shares.toFixed(4)} Units</strong>
                      </div>
                      <div className="text-right">
                        <span>Avg Entry: </span>
                        <strong className="text-slate-700 font-bold">${gameState.position.avgBuyPrice.toFixed(2)}</strong>
                        <span className="mx-1">•</span>
                        <span>Gain: </span>
                        <strong className={`font-black ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isProfit ? '+' : ''}${liveProfit.toFixed(2)}
                        </strong>
                      </div>
                    </div>
                    </div>
                  </div>
              )}

              {/* Game interaction console panel */}
              <div className="space-y-3 pt-1">
                <AnimatePresence mode="wait">
                  {tradingSubPhase === 'idle' && (
                    // Default starting buttons
                    <motion.div
                      key="start-buttons"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-3 w-full"
                    >
                      <div className="text-[10px] text-slate-500 font-mono font-bold text-center tracking-wider block">
                        CHOOSE INITIAL BUY BLOCK CAPACITY:
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {/* BUY $100 */}
                        <button
                          disabled={gameState.cash < 100}
                          onClick={() => handleBuyTransaction(100)}
                          className={`border-2 border-slate-800 font-black py-2 rounded-xl flex flex-col items-center justify-center text-xs transition-transform select-none active:translate-y-0.5 shadow-[2px_2px_0_0_#1e293b] ${
                            gameState.cash >= 100
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-white cursor-pointer'
                              : 'bg-slate-100 text-slate-400 opacity-40 cursor-not-allowed'
                          }`}
                        >
                          <span className="text-[9px] font-mono opacity-80 uppercase tracking-widest">MINIMUM BLOCK</span>
                          <span className="font-extrabold text-[13px]">💵 BUY $100</span>
                        </button>

                        {/* BUY $200 */}
                        <button
                          disabled={gameState.cash < 200}
                          onClick={() => handleBuyTransaction(200)}
                          className={`border-2 border-slate-800 font-black py-2 rounded-xl flex flex-col items-center justify-center text-xs transition-transform select-none active:translate-y-0.5 shadow-[2px_2px_0_0_#1e293b] ${
                            gameState.cash >= 200
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-white cursor-pointer'
                              : 'bg-slate-100 text-slate-400 opacity-40 cursor-not-allowed'
                          }`}
                        >
                          <span className="text-[9px] font-mono opacity-80 uppercase tracking-widest">MID BLOCK</span>
                          <span className="font-extrabold text-[13px]">💵 BUY $200</span>
                        </button>

                        {/* BUY $500 */}
                        <button
                          disabled={gameState.cash < 500}
                          onClick={() => handleBuyTransaction(500)}
                          className={`border-2 border-slate-800 font-black py-2 rounded-xl flex flex-col items-center justify-center text-xs transition-transform select-none active:translate-y-0.5 shadow-[2px_2px_0_0_#1e293b] ${
                            gameState.cash >= 500
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-white cursor-pointer'
                              : 'bg-slate-100 text-slate-400 opacity-40 cursor-not-allowed'
                          }`}
                        >
                          <span className="text-[9px] font-mono opacity-80 uppercase tracking-widest">LARGE BLOCK</span>
                          <span className="font-extrabold text-[13px]">💵 BUY $500</span>
                        </button>

                        {/* BUY MAX */}
                        <button
                          disabled={gameState.cash <= 0}
                          onClick={() => handleBuyTransaction(gameState.cash)}
                          className={`border-2 border-slate-800 font-black py-2 rounded-xl flex flex-col items-center justify-center text-xs transition-transform select-none active:translate-y-0.5 shadow-[2px_2px_0_0_#1e293b] ${
                            gameState.cash > 0
                              ? 'bg-amber-550 hover:bg-amber-500 bg-amber-500 text-white cursor-pointer'
                              : 'bg-slate-100 text-slate-400 opacity-40 cursor-not-allowed'
                          }`}
                        >
                          <span className="text-[9px] font-mono opacity-80 uppercase tracking-widest font-extrabold">MAX LIQUIDITY</span>
                          <span className="font-extrabold text-[13px]">🚀 ALL IN (${Math.floor(gameState.cash)})</span>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {tradingSubPhase === 'auto_drift_init' && (
                    <motion.div
                      key="auto_drift_init"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-slate-50 border-2 border-slate-800 rounded-[20px] p-4 text-center space-y-3 shadow-[3px_3px_0_0_#1e293b]"
                    >
                      <div className="flex items-center justify-center gap-2 text-slate-700">
                        <span className="flex h-3 w-3 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-450 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </span>
                        <span className="font-mono text-xs font-black uppercase tracking-wider">
                          📊 SIMULATING MARKET DRIFT...
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal max-w-[240px] mx-auto font-sans font-medium">
                        The market is adjusting. Price movement is minimal before upcoming breaking news.
                      </p>
                      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden border border-slate-800">
                        <motion.div 
                          className="bg-blue-500 h-full rounded-full"
                          initial={{ width: "0%" }}
                          animate={{ width: `${((5 - ticksRemaining) / 5) * 100}%` }}
                          transition={{ ease: "linear", duration: 0.25 }}
                        />
                      </div>
                    </motion.div>
                  )}

                  {tradingSubPhase === 'auto_drift_impact' && (
                    <motion.div
                      key="auto_drift_impact"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-slate-50 border-2 border-slate-800 rounded-[20px] p-4 text-center space-y-3 shadow-[3px_3px_0_0_#1e293b]"
                    >
                      <div className="flex items-center justify-center gap-2">
                        {currentNewsRef.current?.sentiment === 'positive' && (
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border-2 border-emerald-300 text-[10px] font-mono font-black uppercase tracking-wider animate-bounce flex items-center gap-1">
                            🚀 BULLISH RALLY ACTIVE
                          </span>
                        )}
                        {currentNewsRef.current?.sentiment === 'negative' && (
                          <span className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-full border-2 border-rose-300 text-[10px] font-mono font-black uppercase tracking-wider animate-bounce flex items-center gap-1">
                            🔥 BEARISH SELL-OFF ACTIVE
                          </span>
                        )}
                        {currentNewsRef.current?.sentiment === 'neutral' && (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full border-2 border-slate-300 text-[10px] font-mono font-black uppercase tracking-wider animate-pulse flex items-center gap-1">
                            ➡️ NEUTRAL MARKET DRIFT
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal max-w-[240px] mx-auto font-sans font-medium">
                        Solving headline impact. Watch price changes react on the trace chart in real time!
                      </p>
                      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden border border-slate-800">
                        <motion.div 
                          className={`h-full rounded-full ${
                            currentNewsRef.current?.sentiment === 'positive' ? 'bg-emerald-500' :
                            currentNewsRef.current?.sentiment === 'negative' ? 'bg-rose-500' : 'bg-slate-500'
                          }`}
                          initial={{ width: "0%" }}
                          animate={{ width: `${((11 - ticksRemaining) / 11) * 100}%` }}
                          transition={{ ease: "linear", duration: 0.25 }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              </div>

              {tradingSubPhase === 'news_pending' && currentNews && showNewsPopup && !isNewsMinimized && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-3">
                  <motion.div
                    key="news_pending"
                    initial={{ opacity: 0, scale: 0.9, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -15 }}
                    className="w-full bg-slate-900 text-white border-4 border-slate-800 rounded-[24px] p-4 shadow-[4px_4px_0_0_#1e293b] space-y-3.5 relative"
                  >
                    {/* Header row with Red Breaking News Flash bar & Minimize button */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 flex justify-center items-center bg-red-600 px-3 py-1.5 rounded-lg border-2 border-slate-800 text-white font-black font-mono text-sm uppercase tracking-widest animate-pulse">
                        <span className="flex items-center gap-1.5">
                          <Newspaper className="w-4 h-4 shrink-0" />
                          Insider Tip
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (settings.soundEnabled) playSound('click');
                          setIsNewsMinimized(true);
                        }}
                        className="bg-slate-800 hover:bg-slate-750 active:scale-95 text-slate-300 hover:text-white border-2 border-slate-700 px-2.5 py-1 rounded-lg font-mono text-[9px] font-black uppercase flex items-center gap-1 cursor-pointer select-none transition-all shadow-[1px_1px_0_0_#1e293b]"
                        title="Minimize breaking news popup"
                      >
                        ➖ MINIMIZE
                      </button>
                    </div>

                    {/* Headline text */}
                    <div className="bg-slate-800/80 border-2 border-slate-700/60 rounded-xl p-3">
                      <p className="text-xs font-bold leading-normal font-sans tracking-tight text-yellow-100">
                        "{currentNews.text}"
                      </p>
                    </div>

                    {/* Current Stock Holdings Value and Returns display */}
                    <div className="bg-slate-800/50 border-2 border-slate-700/40 rounded-xl p-3 flex items-center justify-between text-xs font-mono">
                      <div className="flex flex-col text-left">
                        <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Holdings Value</span>
                        <span className="text-lg font-extrabold text-slate-100">
                          {gameState.position 
                            ? `$${positionValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : '$0.00'
                          }
                        </span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Return</span>
                        {gameState.position ? (
                          <span className={`inline-flex items-center gap-1 font-extrabold text-lg font-mono ${
                            liveProfit > 0 ? 'text-emerald-400' : liveProfit < 0 ? 'text-rose-400' : 'text-slate-400'
                          }`}>
                            {liveProfit > 0 ? <TrendingUp className="w-4 h-4 shrink-0" /> : liveProfit < 0 ? <TrendingDown className="w-4 h-4 shrink-0" /> : null}
                            {returnPercent !== 0 ? `${returnPercent.toFixed(1)}%` : '0.0%'}
                            <span className="text-xs opacity-75 ml-0.5">
                              ({liveProfit >= 0 ? '+' : ''}${liveProfit.toFixed(0)})
                            </span>
                          </span>
                        ) : (
                          <span className="text-sm font-extrabold text-slate-500">NO ACTIVE SHARES</span>
                        )}
                      </div>
                    </div>

                    {/* Controls Box: MAX Toggle + Adjustable Arrow Selectors */}
                    <div className="bg-slate-950/80 border-2 border-slate-800 rounded-2xl p-3 space-y-3">
                      
                      {/* MAX Toggle Selector Header */}
                      <div className="flex justify-end items-center pb-2 border-b border-slate-800">
                        <button
                          type="button"
                          onClick={() => {
                            if (settings.soundEnabled) playSound('click');
                            setIsMaxToggled(!isMaxToggled);
                          }}
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-mono font-black border transition-all cursor-pointer ${
                            isMaxToggled 
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.4)]' 
                              : 'bg-slate-850 text-slate-400 border-slate-700'
                          }`}
                        >
                          <span>MAX TRANSACTION:</span>
                          <span className="underline uppercase">{isMaxToggled ? 'ON' : 'OFF'}</span>
                        </button>
                      </div>

                      {/* Adjuster Rows — Buy & Sell side by side */}
                      <div className="grid grid-cols-2 gap-2.5">
                        
                        {/* BUY COLUMN */}
                        <div className="flex flex-col gap-1.5 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              disabled={isMaxToggled || buyAmount <= 100}
                              onClick={() => {
                                if (settings.soundEnabled) playSound('click');
                                setBuyAmount(prev => Math.max(100, prev - 100));
                              }}
                              className={`w-6 h-6 flex items-center justify-center rounded-lg border-2 border-slate-750 font-black text-[10px] select-none ${
                                isMaxToggled || buyAmount <= 100 
                                  ? 'bg-slate-850 text-slate-600 border-slate-800 opacity-40 cursor-not-allowed' 
                                  : 'bg-slate-800 hover:bg-slate-700 active:scale-95 text-white cursor-pointer'
                              }`}
                            >
                              ▼
                            </button>
                            
                            <span className="text-xs font-mono font-black text-emerald-400 w-20 text-center">
                              ${isMaxToggled ? Math.floor(gameState.cash).toLocaleString() : buyAmount}
                            </span>

                            <button
                              type="button"
                              disabled={isMaxToggled || buyAmount >= gameState.cash}
                              onClick={() => {
                                if (settings.soundEnabled) playSound('click');
                                setBuyAmount(prev => {
                                  const next = prev + 100;
                                  return Math.min(next, Math.floor(gameState.cash));
                                });
                              }}
                              className={`w-6 h-6 flex items-center justify-center rounded-lg border-2 border-slate-750 font-black text-[10px] select-none ${
                                isMaxToggled || buyAmount >= gameState.cash 
                                  ? 'bg-slate-850 text-slate-600 border-slate-800 opacity-40 cursor-not-allowed' 
                                  : 'bg-slate-800 hover:bg-slate-700 active:scale-95 text-white cursor-pointer'
                              }`}
                            >
                              ▲
                            </button>
                          </div>

                          <button
                            type="button"
                            disabled={gameState.cash < (isMaxToggled ? 1 : buyAmount)}
                            onClick={() => {
                              const finalBuy = isMaxToggled ? gameState.cash : buyAmount;
                              handleBuyTransaction(finalBuy);
                            }}
                            className={`w-full font-mono font-black text-xs py-2 rounded-xl flex items-center justify-center gap-1 transition-transform border-2 border-slate-800 shadow-[1px_1px_0_0_#1e293b] select-none active:translate-y-0.5 ${
                              gameState.cash >= (isMaxToggled ? 1 : buyAmount)
                                ? 'bg-emerald-500 hover:bg-emerald-450 text-white cursor-pointer'
                                : 'bg-slate-800 text-slate-500 border-slate-800 opacity-40 cursor-not-allowed'
                            }`}
                          >
                            Buy
                          </button>
                        </div>

                        {/* SELL COLUMN */}
                        <div className="flex flex-col gap-1.5 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              disabled={isMaxToggled || !gameState.position || sellAmount <= 100}
                              onClick={() => {
                                if (settings.soundEnabled) playSound('click');
                                setSellAmount(prev => Math.max(100, prev - 100));
                              }}
                              className={`w-6 h-6 flex items-center justify-center rounded-lg border-2 border-slate-750 font-black text-[10px] select-none ${
                                isMaxToggled || !gameState.position || sellAmount <= 100 
                                  ? 'bg-slate-850 text-slate-600 border-slate-800 opacity-40 cursor-not-allowed' 
                                  : 'bg-slate-800 hover:bg-slate-700 active:scale-95 text-white cursor-pointer'
                              }`}
                            >
                              ▼
                            </button>
                            
                            <span className="text-xs font-mono font-black text-rose-400 w-20 text-center">
                              ${isMaxToggled 
                                ? (gameState.position ? Math.floor(gameState.position.shares * currentPrice).toLocaleString() : 0) 
                                : sellAmount}
                            </span>

                            <button
                              type="button"
                              disabled={isMaxToggled || !gameState.position || sellAmount >= (gameState.position.shares * currentPrice)}
                              onClick={() => {
                                if (settings.soundEnabled) playSound('click');
                                const maxVal = gameState.position ? gameState.position.shares * currentPrice : 0;
                                setSellAmount(prev => {
                                  const next = prev + 100;
                                  return Math.min(next, Math.floor(maxVal));
                                });
                              }}
                              className={`w-6 h-6 flex items-center justify-center rounded-lg border-2 border-slate-750 font-black text-[10px] select-none ${
                                isMaxToggled || !gameState.position || sellAmount >= (gameState.position.shares * currentPrice) 
                                  ? 'bg-slate-850 text-slate-600 border-slate-800 opacity-40 cursor-not-allowed' 
                                  : 'bg-slate-800 hover:bg-slate-700 active:scale-95 text-white cursor-pointer'
                              }`}
                            >
                              ▲
                            </button>
                          </div>

                          <button
                            type="button"
                            disabled={!gameState.position}
                            onClick={() => {
                              const maxVal = gameState.position ? gameState.position.shares * currentPrice : 0;
                              const finalSell = isMaxToggled ? maxVal : sellAmount;
                              handlePartialSellTransaction(finalSell);
                            }}
                            className={`w-full font-mono font-black text-xs py-2 rounded-xl flex items-center justify-center gap-1 transition-transform border-2 border-slate-800 shadow-[1px_1px_0_0_#1e293b] select-none active:translate-y-0.5 ${
                              gameState.position
                                ? 'bg-rose-500 hover:bg-rose-450 text-white cursor-pointer'
                                : 'bg-slate-800 text-slate-500 border-slate-800 opacity-40 cursor-not-allowed'
                            }`}
                          >
                            Sell
                          </button>
                        </div>

                      </div>
                    </div>

                    {/* Footer Auxiliary Action Row */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      {/* HOLD Button */}
                      <button
                        type="button"
                        id="btn_news_hold"
                        onClick={handleHoldAction}
                        className="w-full bg-slate-800 hover:bg-slate-750 border-2 border-slate-700 text-slate-100 font-mono font-black py-2.5 rounded-xl flex items-center justify-center gap-1 cursor-pointer text-xs active:translate-y-0.5 transition-transform shadow-[2px_2px_0_0_#1e293b]"
                      >
                        ✊ HOLD POSITION
                      </button>

                      {/* CASH OUT / END TRADE Button */}
                      <button
                        type="button"
                        id="btn_news_sell_all"
                        onClick={handleSellTransaction}
                        className="w-full bg-amber-500 hover:bg-amber-450 text-slate-950 font-mono font-black text-xs py-2.5 border-2 border-slate-800 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-transform active:translate-y-0.5 shadow-[2px_2px_0_0_#1e293b]"
                      >
                        💵 {gameState.position ? 'CASH OUT' : 'END TRADE'}
                      </button>
                    </div>

                  </motion.div>
                </div>
              )}

            </div>

            {/* "Next" button to open breaking news popup */}
            {tradingSubPhase === 'news_pending' && currentNews && !showNewsPopup && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex justify-center w-full"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (settings.soundEnabled) playSound('click');
                    setShowNewsPopup(true);
                  }}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-black font-mono text-xs py-2.5 px-4 border-4 border-slate-800 rounded-2xl shadow-[4px_4px_0_0_#1e293b] flex items-center justify-between gap-2 cursor-pointer select-none animate-pulse active:translate-y-0.5 transition-transform"
                >
                  <span className="flex items-center gap-1.5 text-[11px] tracking-wide">
                    <Newspaper className="w-4 h-4 shrink-0 text-yellow-300" />
                    🚨 BREAKING NEWS INCOMING!
                  </span>
                  <span className="bg-slate-900 border-2 border-slate-800 text-yellow-300 text-[10px] font-black px-2.5 py-1 rounded-lg">
                    NEXT ➜
                  </span>
                </button>
              </motion.div>
            )}

            {/* Minimized Breaking News Bottom Indicator Row */}
            {tradingSubPhase === 'news_pending' && currentNews && showNewsPopup && isNewsMinimized && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex justify-center w-full"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (settings.soundEnabled) playSound('click');
                    setIsNewsMinimized(false);
                  }}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-black font-mono text-xs py-2.5 px-4 border-4 border-slate-800 rounded-2xl shadow-[4px_4px_0_0_#1e293b] flex items-center justify-between gap-2 cursor-pointer select-none animate-pulse active:translate-y-0.5 transition-transform"
                >
                  <span className="flex items-center gap-1.5 text-[11px] tracking-wide">
                    <Newspaper className="w-4 h-4 shrink-0 text-yellow-300" />
                    🚨 PENDING BREAKING NEWS ALERT!
                  </span>
                  <span className="bg-slate-900 border-2 border-slate-800 text-yellow-300 text-[10px] font-black px-2.5 py-1 rounded-lg">
                    EXPAND ➕
                  </span>
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Phase 3: Round results overview screen */}
        {gameState.phase === 'round_complete' && (
          <motion.div
            key="round_complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full flex-1 flex flex-col justify-center"
          >
            <div className="w-full bg-white rounded-[32px] border-4 border-slate-800 shadow-[8px_8px_0_0_#1e293b] p-6 text-center space-y-5">
              
              <div className="flex justify-center">
                {gameState.lastRoundProfit >= 0 ? (
                  <div className="w-14 h-14 bg-emerald-100 rounded-2xl border-2 border-slate-850 flex items-center justify-center relative shadow-[3px_3px_0_0_#1e293b]">
                    <Sparkles className="w-7 h-7 text-emerald-600 animate-spin" />
                  </div>
                ) : (
                  <div className="w-14 h-14 bg-rose-100 rounded-2xl border-2 border-slate-850 flex items-center justify-center relative shadow-[3px_3px_0_0_#1e293b]">
                    <Skull className="w-7 h-7 text-rose-600 animate-bounce" />
                  </div>
                )}
              </div>

              <div>
                <span className="text-[9px] font-mono bg-slate-100 text-slate-500 border border-slate-200 rounded-full px-3 py-1 font-extrabold uppercase">
                  LEVEL #{gameState.roundNumber} COMPLETED
                </span>
                <h3 className="text-xl font-black mt-3 text-slate-800 leading-tight uppercase font-sans">
                  {gameState.lastRoundProfit >= 0 ? 'LIQUIDITY CLAIMED!' : 'TRADE SETTLED'}
                </h3>
              </div>

              {/* Profit Metrics Box */}
              <div className="bg-slate-50 border-2 border-slate-800 rounded-[20px] p-4 space-y-2.5 font-mono text-xs shadow-[3px_3px_0_0_#1e293b]">
                <div className="flex justify-between text-[11px] text-slate-450 font-bold">
                  <span>Ticker Token</span>
                  <span className="font-extrabold text-slate-800">${gameState.currentCompany.ticker}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-450 font-bold">
                  <span>Settlement Quote</span>
                  <span className="font-extrabold text-slate-800">${currentPrice.toFixed(2)}</span>
                </div>
                <div className="border-t-2 border-dashed border-slate-200 pt-2.5 flex justify-between items-center">
                  <span className="text-[10px] font-extrabold text-slate-800 uppercase">ROUND GAIN:</span>
                  <span className={`text-sm font-black ${
                    gameState.lastRoundProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {gameState.lastRoundProfit >= 0 ? '+' : ''}${gameState.lastRoundProfit.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-200">
                <p className="text-[10px] text-slate-600 font-mono">
                  New Capital Balance: <strong className="text-slate-800 font-black">${gameState.cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                </p>
              </div>

              {gameState.lastRoundProfit > 0 && (
                <div className="bg-emerald-50 text-emerald-800 rounded-2xl p-3 border-2 border-emerald-300 flex items-center justify-between font-mono text-xs shadow-[2px_2px_0_0_#1e293b]">
                  <span className="font-extrabold flex items-center gap-1">💎 INTEL BONUS:</span>
                  <span className="font-black text-emerald-600">+{5 + Math.floor(gameState.lastRoundProfit / 100)} GEMS ACCRUED</span>
                </div>
              )}

              <div className="relative group w-full pt-1.5">
                <div className="absolute inset-0 bg-emerald-600 rounded-[18px] translate-y-1.5" />
                <button
                  id="btn_continue_next_round"
                  onClick={handleNextRound}
                  className="relative w-full bg-emerald-400 hover:bg-emerald-355 border-2 border-slate-800 text-white font-black py-3 rounded-[18px] flex items-center justify-center gap-1 cursor-pointer text-xs transition-transform active:translate-y-1.5"
                >
                  DISCOVER NEXT STOCK ➔
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Phase 4: Game Over screen */}
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
                <h3 className="text-2xl font-black text-slate-800 font-sans tracking-tight uppercase">GAME OVER!</h3>
                <p className="text-[9px] font-mono uppercase tracking-widest text-slate-450 font-bold">⚡ CAPITAL DEEP BUSTED ⚡</p>
              </div>

              {/* High score/Progress breakdown */}
              <div className="bg-slate-50 border-2 border-slate-800 rounded-[20px] p-4 space-y-2.5 font-mono text-[11px] text-left shadow-[3px_3px_0_0_#1e293b]">
                <div className="flex justify-between text-slate-500 font-bold">
                  <span>Rounds Played:</span>
                  <span className="font-extrabold text-slate-800">{gameState.roundNumber - 1}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-bold">
                  <span>Companies Traded:</span>
                  <span className="font-extrabold text-slate-800">{gameState.companiesTradedCount}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-bold">
                  <span>Peak Bankroll Achieved:</span>
                  <span className="font-extrabold text-emerald-600">${gameState.highestCashInSession.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="border-t border-slate-200 pt-2.5 flex justify-between items-center">
                  <span className="font-extrabold text-slate-800">Rank Level:</span>
                  <span className="bg-slate-850 bg-slate-800 text-yellow-300 font-black text-[8px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {gameState.highestCashInSession > 10000 ? '👑 GIGA WHALE' :
                     gameState.highestCashInSession > 5000 ? '🚀 PRO GRINDER' :
                     gameState.highestCashInSession > 2000 ? '🦁 BOBA BARON' : '🐹 PENNY BUSTED'}
                  </span>
                </div>
              </div>

              <div className="relative group w-full pt-1.5">
                <div className="absolute inset-0 bg-yellow-600 rounded-[18px] translate-y-1.5" />
                <button
                  id="btn_done_game_over"
                  onClick={handleDoneGameOver}
                  className="relative w-full bg-yellow-400 hover:bg-yellow-355  border-2 border-slate-800 text-slate-805 text-slate-800 font-extrabold py-3 rounded-[18px] flex items-center justify-center gap-1 cursor-pointer text-xs transition-transform active:translate-y-1.5"
                >
                  SUBMIT & EXIT TO MENU
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
      </div>

      {/* Refill / Exchange Confidential Modal Overlay */}
      <AnimatePresence>
        {showRefillNeeded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-white rounded-[32px] border-4 border-slate-800 shadow-[8px_8px_0_0_#1e293b] overflow-hidden p-5 space-y-4 text-left"
            >
              <div className="flex justify-between items-center pb-2 border-b-2 border-slate-100">
                <div className="flex items-center gap-1.5 text-left">
                  <span className="text-2xl">🤫</span>
                  <div className="text-left">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">CONFIDENTIAL REFILL ZONE</h3>
                    <p className="text-[9px] text-slate-400 font-mono uppercase tracking-widest leading-none mt-0.5">Off-market transactions</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (settings.soundEnabled) playSound('click');
                    setShowRefillNeeded(false);
                  }}
                  className="w-8 h-8 rounded-full border-2 border-slate-800 bg-slate-100 flex items-center justify-center text-xs font-black cursor-pointer shadow-[2px_2px_0_0_#1e293b] active:translate-x-0.5 active:translate-y-0.5 transition-transform"
                >
                  ✕
                </button>
              </div>

              {/* Stats Box */}
              <div className="grid grid-cols-2 gap-2 bg-slate-900 text-white rounded-2xl p-3 font-mono text-xs border-2 border-slate-800">
                <div className="text-left">
                  <p className="text-[8px] text-slate-400 uppercase font-bold mb-0.5">Access Keys</p>
                  <p className="font-black text-yellow-400">{actionsRemaining} / 10 Keys</p>
                </div>
                <div className="text-right border-l border-slate-800 pl-3">
                  <p className="text-[8px] text-slate-400 uppercase font-bold mb-0.5">Off-market Gems</p>
                  <p className="font-black text-emerald-400">💎 {gems} Gems</p>
                </div>
              </div>

              {/* Offers List */}
              <div className="space-y-3">
                
                {/* Offer 1: Gem to Actions */}
                <div className="bg-slate-50 border-2 border-slate-800 rounded-2xl p-3 flex justify-between items-center text-xs text-left">
                  <div className="text-left">
                    <h4 className="font-black text-slate-800 uppercase text-[11px]">Bribe for +10 Actions</h4>
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">Requires 15 Off-market Gems</p>
                  </div>
                  <button
                    disabled={gems < 15}
                    onClick={() => {
                      if (settings.soundEnabled) playSound('click');
                      setGems(prev => Math.max(0, prev - 15));
                      setActionsRemaining(prev => prev + 10);
                    }}
                    className={`font-black text-[10px] px-3 py-2 rounded-xl border-2 border-slate-850 shadow-[2px_2px_0_0_#1e293b] transition-transform active:translate-y-0.5 ${
                      gems >= 15 
                        ? 'bg-yellow-400 hover:bg-yellow-350 text-slate-800 cursor-pointer' 
                        : 'bg-slate-200 text-slate-400 border-slate-300 shadow-none cursor-not-allowed'
                    }`}
                  >
                    💎 15 GEMS
                  </button>
                </div>

                {/* Offer 2: Cash to Gems */}
                <div className="bg-slate-50 border-2 border-slate-800 rounded-2xl p-3 flex justify-between items-center text-xs text-left">
                  <div className="text-left">
                    <h4 className="font-black text-slate-800 uppercase text-[11px]">Launder Cash for +20 Gems</h4>
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">Trade standard cash reserve</p>
                  </div>
                  <button
                    disabled={gameState.cash < 300}
                    onClick={() => {
                      if (settings.soundEnabled) playSound('click');
                      setGems(prev => prev + 20);
                      setGameState(prev => ({
                        ...prev,
                        cash: Number(Math.max(0, prev.cash - 300).toFixed(2))
                      }));
                    }}
                    className={`font-black text-[10px] px-3 py-2 rounded-xl border-2 border-slate-850 shadow-[2px_2px_0_0_#1e293b] transition-transform active:translate-y-0.5 ${
                      gameState.cash >= 300 
                        ? 'bg-emerald-400 hover:bg-emerald-350 text-white cursor-pointer' 
                        : 'bg-slate-200 text-slate-400 border-slate-300 shadow-none cursor-not-allowed'
                    }`}
                  >
                    💵 $300 CASH
                  </button>
                </div>

                {/* Offer 3: Bribe Informant Cooldown (FREE Actions) */}
                <div className="bg-slate-50 border-2 border-slate-800 rounded-2xl p-3 flex justify-between items-center text-xs text-left">
                  <div className="text-left">
                    <h4 className="font-black text-slate-800 uppercase text-[11px]">Solicit Informant Contact</h4>
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5 font-medium leading-none">
                      {freeBribeCooldown > 0 
                        ? `Contact cooling down: ${freeBribeCooldown}s` 
                        : 'Free contact request (+5 Keys)'}
                    </p>
                  </div>
                  <button
                    disabled={freeBribeCooldown > 0}
                    onClick={() => {
                      if (settings.soundEnabled) playSound('click');
                      setActionsRemaining(prev => prev + 5);
                      setFreeBribeCooldown(30); // 30 second cooldown
                    }}
                    className={`font-black text-[10px] px-3 py-2 rounded-xl border-2 border-slate-850 shadow-[2px_2px_0_0_#1e293b] transition-transform active:translate-y-0.5 ${
                      freeBribeCooldown <= 0 
                        ? 'bg-rose-400 hover:bg-rose-350 text-white cursor-pointer' 
                        : 'bg-slate-200 text-slate-400 border-slate-300 shadow-none cursor-not-allowed'
                    }`}
                  >
                    {freeBribeCooldown > 0 ? 'COOLING...' : '🤫 FREE'}
                  </button>
                </div>

              </div>

              <div className="pt-2 text-[9px] text-slate-400 font-mono leading-normal text-center bg-slate-50 rounded-2xl p-2.5">
                🚨 WARNING: Federal regulators monitor transactions. Outrun the SEC by maintaining a healthy capital ratio. Let's make some serious bankroll!
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
