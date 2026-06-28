import React, { useState, useEffect } from 'react';
import { Run, GameSettings } from './types';
import MainMenu from './components/MainMenu';
import ActiveGame from './components/ActiveGame';
import { playSound } from './utils/audio';
import { Sparkles, Coins, Gamepad2, Laptop, Smartphone } from 'lucide-react';

const RUNS_STORAGE_KEY = 'cointrader_runs_v2';
const SETTINGS_STORAGE_KEY = 'cointrader_settings';

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  hapticEnabled: true,
  startCash: 1000,
  chartSpeed: 'normal'
};

export default function App() {
  const [currentView, setCurrentView] = useState<'menu' | 'game'>('menu');
  
  // Previous runs history state
  const [runs, setRuns] = useState<Run[]>([]);
  
  // Game custom settings state
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const storedRuns = localStorage.getItem(RUNS_STORAGE_KEY);
      if (storedRuns) {
        setRuns(JSON.parse(storedRuns));
      }
      
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings), startCash: 1000 });
      } else {
        setSettings({ ...DEFAULT_SETTINGS, startCash: 1000 });
      }
    } catch (e) {
      console.error('Failed to load local storage:', e);
    }
  }, []);

  // Save settings helper
  const handleUpdateSettings = (newSettings: GameSettings) => {
    const updated = { ...newSettings, startCash: 1000 };
    setSettings(updated);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to set settings:', e);
    }
  };

  // Clear run logs helper
  const handleClearHistory = () => {
    setRuns([]);
    try {
      localStorage.removeItem(RUNS_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear runs:', e);
    }
  };

  // Start new gameplay session
  const handleStartGame = () => {
    setCurrentView('game');
  };

  // Session complete (ran out of Cash/finished successfully)
  const handleFinishGame = (finalCash: number, companiesTraded: number, roundsPlayed: number) => {
    // Determine funny unlocked rank title based on balance
    let unlockedTitle = '🐹 Apprentice';
    if (finalCash >= 10000) {
      unlockedTitle = '👑 Giga Whale';
    } else if (finalCash >= 5000) {
      unlockedTitle = '💎 Pro Trader';
    } else if (finalCash >= 2500) {
      unlockedTitle = '🦁 Boba Baron';
    } else if (finalCash >= 1000) {
      unlockedTitle = '🥑 Avocado Tycoon';
    } else if (finalCash > 0) {
      unlockedTitle = '🍕 Pizza Earn';
    } else {
      unlockedTitle = '💀 Busted';
    }

    const newRun: Run = {
      id: `run_${Date.now()}`,
      date: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      finalCash,
      highestCash: finalCash, // simplified tracking
      companiesTradedCount: companiesTraded,
      roundsPlayed: Math.max(0, roundsPlayed - 1),
      unlockedTitle
    };

    const updatedRuns = [newRun, ...runs];
    setRuns(updatedRuns);
    try {
      localStorage.setItem(RUNS_STORAGE_KEY, JSON.stringify(updatedRuns));
    } catch (e) {
      console.error('Failed to save run record:', e);
    }

    setCurrentView('menu');
  };

  const handleExitToMenu = () => {
    setCurrentView('menu');
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 flex items-center justify-center p-2 sm:p-4 md:p-6 relative font-sans select-none overflow-y-auto">
      
      {/* Sidebar background labels for the cool Artistic Flair desktop aesthetics */}
      <div className="fixed left-8 top-1/2 -translate-y-1/2 hidden xl:block space-y-12 select-none pointer-events-none">
        <div className="transform -rotate-12">
          <p className="font-extrabold text-5xl text-rose-950/10 tracking-tighter leading-none mb-1 font-sans">INSIDER</p>
          <p className="font-extrabold text-6xl text-slate-950/25 tracking-tighter leading-none font-sans">TRADER</p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-4 opacity-70">
            <div className="w-12 h-12 bg-white rounded-full border-2 border-slate-800 flex items-center justify-center shadow-[4px_4px_0_0_#1e293b] text-xl">🤫</div>
            <p className="font-black text-slate-800 text-xs tracking-widest">CONFIDENTIAL</p>
          </div>
          <div className="flex items-center gap-4 opacity-75">
            <div className="w-12 h-12 bg-white rounded-full border-2 border-slate-800 flex items-center justify-center shadow-[4px_4px_0_0_#1e293b] text-xl">📈</div>
            <p className="font-black text-slate-800 text-xs tracking-widest">LEAK DEALS</p>
          </div>
          <div className="flex items-center gap-4 opacity-75">
            <div className="w-12 h-12 bg-white rounded-full border-2 border-slate-800 flex items-center justify-center shadow-[4px_4px_0_0_#1e293b] text-xl">💼</div>
            <p className="font-black text-slate-800 text-xs tracking-widest">PORTFOLIOS</p>
          </div>
        </div>
      </div>

      {/* Main Responsive Dashboard Container */}
      <div className="w-full max-w-xl min-h-[92vh] md:min-h-[80vh] bg-white rounded-[32px] shadow-[8px_8px_0_0_#1e293b,0_16px_48px_-16px_rgba(0,0,0,0.15)] relative overflow-hidden flex flex-col border-4 border-slate-800 z-10 transition-all">
        
        {/* Main Content inside the dashboard layout */}
        <div className="flex-1 flex flex-col justify-between overflow-hidden bg-white shrink-0 p-3 sm:p-6">
          <div className="flex-1 flex flex-col overflow-y-auto scrollbar-thin px-1 pb-2">
            {currentView === 'menu' ? (
              <MainMenu
                onStartGame={handleStartGame}
                runs={runs}
                onClearHistory={handleClearHistory}
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
              />
            ) : (
              <ActiveGame
                settings={settings}
                runsCount={runs.length}
                onFinishGame={handleFinishGame}
                onExitToMenu={handleExitToMenu}
              />
            )}
          </div>
        </div>
        
      </div>

    </div>
  );
}
