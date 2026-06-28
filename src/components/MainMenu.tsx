import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, History, Settings, Trash2, Volume2, VolumeX, Coins, Calendar, X, HelpCircle, Trophy, BarChart3, PiggyBank } from 'lucide-react';
import { Run, GameSettings } from '../types';
import { playSound } from '../utils/audio';

interface MainMenuProps {
  onStartGame: () => void;
  runs: Run[];
  onClearHistory: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
}

export default function MainMenu({
  onStartGame,
  runs,
  onClearHistory,
  settings,
  onUpdateSettings,
}: MainMenuProps) {
  const [activeTab, setActiveTab] = useState<'main' | 'history' | 'settings'>('main');

  const handleStart = () => {
    if (settings.soundEnabled) playSound('click');
    onStartGame();
  };

  const handleToggleSound = () => {
    const updated = { ...settings, soundEnabled: !settings.soundEnabled };
    onUpdateSettings(updated);
    if (updated.soundEnabled) {
      playSound('click');
    }
  };

  const handleToggleHaptic = () => {
    const updated = { ...settings, hapticEnabled: !settings.hapticEnabled };
    onUpdateSettings(updated);
    if (settings.soundEnabled) playSound('click');
  };

  const handleStartCashChange = (amount: number) => {
    onUpdateSettings({ ...settings, startCash: amount });
    if (settings.soundEnabled) playSound('click');
  };

  // Find high score
  const highScore = runs.reduce((max, run) => (run.finalCash > max ? run.finalCash : max), 0);

  return (
    <div className="flex flex-col items-center justify-center min-h-full w-full max-w-2xl mx-auto p-1 sm:p-2 select-none">
      
      {/* Brand Header */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="text-center my-4 pr-1"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-[24px] bg-yellow-100 border-2 border-slate-800 shadow-[4px_4px_0_0_#1e293b] transform rotate-3 mb-2 relative group">
          <span className="text-3xl animate-bounce">🤫</span>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
            className="absolute -inset-1 border border-dashed border-slate-400 rounded-[24px] pointer-events-none"
          />
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800 drop-shadow-sm font-sans uppercase">
          INSIDER <span className="text-rose-500">TRADER</span> <span className="text-emerald-500">TYCOON</span>
        </h1>
        <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
          🤫 CONFIDENTIAL INTEL LEAKS ONLY 🤫
        </p>
      </motion.div>

      {/* Main Container */}
      <div id="main_menu_container" className="w-full bg-white rounded-[40px] border-4 border-slate-800 shadow-[8px_8px_0_0_#1e293b] overflow-hidden min-h-[420px] flex flex-col justify-between">
        
        {/* Tab Navigation header */}
        <div className="flex border-b-2 border-slate-800 bg-slate-50 font-mono text-xs">
          <button
            id="tab_play"
            onClick={() => { if (settings.soundEnabled) playSound('click'); setActiveTab('main'); }}
            className={`flex-1 py-3 text-center border-r-2 border-slate-800 font-bold transition-all ${
              activeTab === 'main' ? 'bg-yellow-50 text-slate-800' : 'bg-slate-50 text-slate-400 hover:text-slate-800'
            }`}
          >
            PLAY
          </button>
          <button
            id="tab_history"
            onClick={() => { if (settings.soundEnabled) playSound('click'); setActiveTab('history'); }}
            className={`flex-1 py-3 text-center border-r-2 border-slate-800 font-bold transition-all ${
              activeTab === 'history' ? 'bg-yellow-50 text-slate-800' : 'bg-slate-50 text-slate-400 hover:text-slate-800'
            }`}
          >
            RUNS ({runs.length})
          </button>
          <button
            id="tab_settings"
            onClick={() => { if (settings.soundEnabled) playSound('click'); setActiveTab('settings'); }}
            className={`flex-1 py-3 text-center font-bold transition-all ${
              activeTab === 'settings' ? 'bg-yellow-50 text-slate-800' : 'bg-slate-50 text-slate-400 hover:text-slate-800'
            }`}
          >
            SETTINGS
          </button>
        </div>

        {/* Dynamic Tab Body */}
        <div className="p-5 flex-1 flex flex-col justify-center min-h-[300px]">
          <AnimatePresence mode="wait">
            {activeTab === 'main' && (
              <motion.div
                key="main"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="w-full flex flex-col justify-between h-full space-y-4"
              >
                {/* Visual Rank/Status */}
                <div className="bg-slate-50 border-2 border-slate-800 rounded-[24px] p-4 text-center">
                  <span className="text-[10px] bg-slate-800 text-white font-mono font-bold px-3 py-0.5 rounded-full uppercase tracking-widest">
                    HIGH SCORE CHAMP
                  </span>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span className="text-3xl font-black text-slate-800 tracking-tighter tabular-nums">
                      ${highScore.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Turn your starting ${settings.startCash} into a massive fortune!
                  </p>
                </div>

                {/* Rules / Tip Callout */}
                <div className="text-xs bg-yellow-50 rounded-[24px] p-4 border-2 border-slate-800 shadow-[3px_3px_0_0_#1e293b] flex gap-2.5 items-start text-slate-600">
                  <span className="text-xl shrink-0">🤫</span>
                  <div className="text-left">
                    <span className="font-extrabold block text-slate-800 mb-0.5 text-xs">INSIDER MANUAL</span>
                    Listen in on confidential market news leaks. Click <strong>Trade</strong>, then decide to <strong>Buy</strong>, <strong>Hold</strong> or <strong>Sell</strong> before the public finds out! Costs 1 Key per action.
                  </div>
                </div>

                {/* Big Coin Master-style Double Layered Action Button */}
                <div className="relative group w-full pt-1.5 pb-2">
                  <div className="absolute inset-0 bg-emerald-600 rounded-[24px] translate-y-1.5" />
                  <button
                    id="btn_start_game"
                    onClick={handleStart}
                    className="relative w-full bg-emerald-400 hover:bg-emerald-350 border-2 border-slate-800 text-white font-black text-base py-3.5 rounded-[24px] flex items-center justify-center gap-2.5 transition-transform active:translate-y-1.5 cursor-pointer select-none"
                  >
                    <Play className="w-5 h-5 fill-white text-white" />
                    ENTER ACTIVE PIPELINE
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="w-full flex flex-col space-y-3"
              >
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-slate-700 font-mono text-xs tracking-wider uppercase">PREVIOUS RUNS HISTORY</h3>
                  {runs.length > 0 && (
                    <button
                      id="btn_clear_history"
                      onClick={() => {
                        if (confirm('Clear all your trading runs?')) {
                          onClearHistory();
                          if (settings.soundEnabled) playSound('click');
                        }
                      }}
                      className="text-slate-400 hover:text-red-500 font-extrabold uppercase tracking-wider text-[10px] flex items-center gap-1 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear
                    </button>
                  )}
                </div>

                {runs.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-[24px] bg-slate-50/50 flex flex-col items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wide">No runs recorded.</p>
                    <p className="text-[10px] text-slate-400 mt-1 px-4 leading-normal">Start play simulator sessions to keep tracking final cash balances!</p>
                  </div>
                ) : (
                  <div className="max-h-[190px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {runs.map((run) => (
                      <div
                        key={run.id}
                        className="bg-slate-50 border-2 border-slate-800 rounded-2xl p-3 flex justify-between items-center text-xs"
                      >
                        <div>
                          <p className="font-extrabold text-slate-800 font-mono text-sm">${run.finalCash.toLocaleString()}</p>
                          <p className="text-[9px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                            <Calendar className="w-2.5 h-2.5" />
                            {run.date}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="bg-slate-800 text-white font-mono text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {run.unlockedTitle?.replace(/🍎|🐕|🐈|🦁|👑|💀|🐹|🥑/g, '') || 'Novice'}
                          </span>
                          <p className="text-[9px] text-slate-400 mt-1 leading-none">
                            {run.companiesTradedCount} Trades • {run.roundsPlayed} Rds
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="w-full flex flex-col space-y-3"
              >
                {/* Audio Setup */}
                <div className="flex justify-between items-center p-3 bg-slate-50 border-2 border-slate-800 rounded-2xl">
                  <div>
                    <p className="font-black text-xs text-slate-800 uppercase tracking-widest">SFX RETRO SYNTH</p>
                    <p className="text-[10px] text-slate-450 leading-normal">Live synthetic feedback</p>
                  </div>
                  <button
                    id="btn_toggle_sound"
                    onClick={handleToggleSound}
                    className={`p-2 rounded-xl border-2 border-slate-800 shadow-[2px_2px_0px_#1e293b] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all text-slate-800 ${
                      settings.soundEnabled ? 'bg-yellow-105 bg-yellow-300' : 'bg-slate-100'
                    }`}
                  >
                    {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                </div>



                {/* Speeds */}
                <div className="flex justify-between items-center p-3 bg-slate-50 border-2 border-slate-800 rounded-2xl">
                  <div>
                    <p className="font-black text-xs text-slate-800 uppercase tracking-widest">DRIFT TICK RATE</p>
                    <p className="text-[10px] text-slate-450 leading-normal">Horizontal chart advances</p>
                  </div>
                  <div className="flex gap-1.5">
                    {(['normal', 'fast'] as const).map((spd) => (
                      <button
                        key={spd}
                        id={`btn_speed_${spd}`}
                        onClick={() => {
                          onUpdateSettings({ ...settings, chartSpeed: spd });
                          if (settings.soundEnabled) playSound('click');
                        }}
                        className={`px-2 py-1 text-[10px] font-mono font-black uppercase rounded-lg border-2 border-slate-800 shadow-[1px_1px_0_0_#1e293b] active:translate-y-0.5 transition-all ${
                          settings.chartSpeed === spd
                            ? 'bg-yellow-400 text-slate-800'
                            : 'bg-white text-slate-500'
                        }`}
                      >
                        {spd}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info badge */}
        <div className="bg-slate-800 p-2 text-center text-[9px] text-slate-300 font-mono flex items-center justify-center gap-1 border-t border-slate-800 uppercase tracking-wider">
          <span>COIN TRADER POCKET EDITION</span>
          <span>•</span>
          <span>NO RISK</span>
        </div>
      </div>
      
    </div>
  );
}
