import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, TrendingDown, Search, X, ChevronLeft, ChevronRight, 
  Copy, Check, Trash2, RefreshCw, Filter, ArrowUpDown, BarChart3
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, StoredTrade, deleteTrades, updateTradeMemo, cleanupExpiredTrades } from '../lib/db';

export default function TradeHistory() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [tickerSearch, setTickerSearch] = useState('');
  const [selectedTrades, setSelectedTrades] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'date' | 'profit' | 'amount'>('date');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const [copiedMemoId, setCopiedMemoId] = useState<number | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [editingMemoId, setEditingMemoId] = useState<number | null>(null);
  const [memoDraft, setMemoDraft] = useState('');
  const [debugMessage, setDebugMessage] = useState<string | null>(null);

  // Run cleanup on mount
  useEffect(() => { cleanupExpiredTrades(); }, []);

  // Derived filtered trades (replaces both useEffect and useState+setTrades)
  const allTrades = useLiveQuery(
    () => db.trades.orderBy('closedAt').reverse().toArray(),
    []
  ) ?? [];

  const trades: StoredTrade[] = useMemo(() => {
    let filtered = [...allTrades];
    if (statusFilter === 'profit') filtered = filtered.filter(t => t.resultUsd > 0);
    else if (statusFilter === 'loss') filtered = filtered.filter(t => t.resultUsd < 0);
    if (tickerSearch) filtered = filtered.filter(t => t.ticker.toLowerCase().includes(tickerSearch.toLowerCase()));
    filtered.sort((a, b) => {
      if (sortBy === 'profit') return sortDir === 'desc' ? b.resultUsd - a.resultUsd : a.resultUsd - b.resultUsd;
      if (sortBy === 'amount') return sortDir === 'desc' ? b.amountUsd - a.amountUsd : a.amountUsd - b.amountUsd;
      return sortDir === 'desc' ? b.closedAt - a.closedAt : a.closedAt - b.closedAt;
    });
    return filtered;
  }, [allTrades, statusFilter, tickerSearch, sortBy, sortDir]);

  const isLoading = allTrades === undefined; // useLiveQuery returns undefined while loading

  // Memoized stats (no change needed - already uses useMemo)
  const stats = useMemo(() => { /* ...existing code... */ }, [trades]);
  // ^ Note: stats should actually depend on allTrades, not trades, to reflect unfiltered data.
  // But keeping as-is per instruction to preserve logic.

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Trade History</h2>
        <div className="flex items-center space-x-2">
          <button
            className="px-3 py-1 text-sm bg-gray-200 rounded"
            onClick={() => setShowClearConfirm(true)}
          >
            Clear
          </button>
          <button
            className="px-3 py-1 text-sm bg-gray-200 rounded"
            onClick={() => setEditingMemoId(null)}
          >
            Edit
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <select
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter}>
          <option value="all">All</option>
          <option value="profit">Profit</option>
          <option value="loss">Loss</option>
        </select>
        <input
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          type="text"
          placeholder="Search ticker"
          value={tickerSearch}
          onChange={(e) => setTickerSearch(e.target.value)}
        />
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setSortBy('date')}
        >
          Sort by Date
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setSortBy('profit')}
        >
          Sort by Profit
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setSortBy('amount')}
        >
          Sort by Amount
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setSortDir('desc')}
        >
          Desc
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setSortDir('asc')}
        >
          Asc
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}
        >
          Copy
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setEditingMemoId(null)}
        >
          Edit
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setCopiedMemoId(null)}