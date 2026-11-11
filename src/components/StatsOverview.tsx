'use client';

import { WorkerState } from '@/lib/types';

interface StatsOverviewProps {
  worker: WorkerState | null;
}

export default function StatsOverview({ worker }: StatsOverviewProps) {
  const dailySent = worker?.daily_sent_count ?? 0;
  const dailyLimit = worker?.daily_limit ?? 30;
  const remainingToday = worker?.remaining_today ?? 30;
  const unsentCount = worker?.unsent_count ?? 0;
  const percentage = Math.min(100, Math.round((dailySent / dailyLimit) * 100));

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* 1. Daily Pitch Cap & Domain Protection */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Domain Protection</span>
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Strict 30/Day Cap
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">{dailySent}</span>
          <span className="text-slate-400 text-sm font-medium">/ {dailyLimit} Sent Today</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-1.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentage > 85 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>{remainingToday} remaining today</span>
          <span>{percentage}% quota</span>
        </div>
      </div>

      {/* 2. Queued Status & Rollover Counter */}
      <div className="bg-slate-900/90 border border-blue-500/20 rounded-xl p-5 shadow-lg backdrop-blur">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Active Queue</span>
          {unsentCount > 0 ? (
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {unsentCount} Unsent Rollover
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
              20-min Spacing
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-extrabold text-blue-400 tracking-tight">
            {worker?.queued_count ?? 0}
          </span>
          <span className="text-slate-400 text-sm font-medium">Leads Scheduled</span>
        </div>
        <p className="text-xs text-slate-400 mt-2 truncate">
          {worker?.last_run_status || 'Worker standing by...'}
        </p>
      </div>

      {/* 3. Delivered Count */}
      <div className="bg-slate-900/90 border border-emerald-500/20 rounded-xl p-5 shadow-lg backdrop-blur">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Delivered</span>
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            Silent SMTP
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">
            {worker?.sent_count ?? 0}
          </span>
          <span className="text-slate-400 text-sm font-medium">Successful Pitches</span>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Failed/Unsent leads auto-retry next day
        </p>
      </div>

      {/* 4. Automated Daily Scheduler State */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Auto-Schedule Engine</span>
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {worker?.auto_generate_daily ? 'Daily Auto: ON' : 'Daily Auto: OFF'}
          </span>
        </div>
        <div className="flex items-center gap-3 my-2">
          <div
            className={`w-3.5 h-3.5 rounded-full ${
              worker?.is_paused ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-ping'
            }`}
          />
          <span
            className={`text-xl font-bold ${
              worker?.is_paused ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {worker?.is_paused ? 'PAUSED' : 'ACTIVE / RUNNING'}
          </span>
        </div>
        <p className="text-xs text-slate-400 truncate">
          Generates 30 leads daily • Endless catalog
        </p>
      </div>
    </div>
  );
}
