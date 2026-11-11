'use client';

import { useState } from 'react';
import { WorkerState } from '@/lib/types';
import { toggleWorkerPause, generateBatch, rolloverQueue, processQueueNow, resetQueue, toggleAutoDaily } from '@/lib/api';

interface QueueControlsProps {
  worker: WorkerState | null;
  onRefresh: () => void;
}

export default function QueueControls({ worker, onRefresh }: QueueControlsProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const isPaused = worker?.is_paused ?? false;
  const isAutoDaily = worker?.auto_generate_daily ?? true;
  const unsentCount = worker?.unsent_count ?? 0;

  const handleTogglePause = async () => {
    try {
      setLoadingAction('pause');
      await toggleWorkerPause(!isPaused);
      onRefresh();
    } catch (err: unknown) {
      alert(`Error toggling queue: ${(err as Error).message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleToggleAutoDaily = async () => {
    try {
      setLoadingAction('auto-daily');
      await toggleAutoDaily();
      onRefresh();
    } catch (err: unknown) {
      alert(`Error toggling auto-daily: ${(err as Error).message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleGenerate30 = async () => {
    try {
      setLoadingAction('generate');
      const res = await generateBatch(30, true);
      alert(res.message);
      onRefresh();
    } catch (err: unknown) {
      alert(`Error generating batch: ${(err as Error).message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRolloverUnsent = async () => {
    try {
      setLoadingAction('rollover');
      const res = await rolloverQueue(30);
      alert(res.message);
      onRefresh();
    } catch (err: unknown) {
      alert(`Error rolling over leads: ${(err as Error).message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleProcessNow = async () => {
    try {
      setLoadingAction('process');
      const res = await processQueueNow();
      alert(`Processed queue! ${res.dispatched_count} email(s) dispatched silently via SMTP.`);
      onRefresh();
    } catch (err: unknown) {
      alert(`Error processing queue: ${(err as Error).message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to clear all leads in the database?')) return;
    try {
      setLoadingAction('reset');
      await resetQueue();
      onRefresh();
    } catch (err: unknown) {
      alert(`Error resetting queue: ${(err as Error).message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 mb-6 shadow-lg backdrop-blur flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Instant Pause/Resume Queue Button */}
        <button
          onClick={handleTogglePause}
          disabled={loadingAction !== null}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 shadow-md ${
            isPaused
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
              : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30'
          } ${loadingAction === 'pause' ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isPaused ? (
            <>
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>Resume Queue</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
              <span>Pause Queue</span>
            </>
          )}
        </button>

        {/* Generate Batch of 30 Leads (Endless Catalog + Rollover) */}
        <button
          onClick={handleGenerate30}
          disabled={loadingAction !== null}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-lg shadow-md shadow-blue-900/20 transition-all duration-200 disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>{loadingAction === 'generate' ? 'Preparing 30 Leads...' : 'Generate 30 Leads (Auto-Rollover)'}</span>
        </button>

        {/* Rollover Unsent Leads Button */}
        {unsentCount > 0 && (
          <button
            onClick={handleRolloverUnsent}
            disabled={loadingAction !== null}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm rounded-lg shadow-md shadow-purple-900/20 transition-all duration-200 disabled:opacity-50"
            title="Reschedule previous unsent and failed leads into the active queue with 20-minute spacing"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Resend Unsent ({unsentCount})</span>
          </button>
        )}

        {/* Auto-Daily Toggle Button */}
        <button
          onClick={handleToggleAutoDaily}
          disabled={loadingAction !== null}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition ${
            isAutoDaily
              ? 'bg-indigo-950/60 text-indigo-300 border-indigo-700/60 hover:bg-indigo-900/60'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
          }`}
          title="When enabled, the server automatically generates 30 leads every day on midnight rollover"
        >
          <span className={`w-2 h-2 rounded-full ${isAutoDaily ? 'bg-indigo-400 animate-pulse' : 'bg-slate-500'}`} />
          <span>Daily 24h Auto-Run: {isAutoDaily ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        {/* Force Poll / Process Due */}
        <button
          onClick={handleProcessNow}
          disabled={loadingAction !== null}
          title="Manually trigger the 60s background poller right now"
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg border border-slate-700 transition"
        >
          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Poll Now</span>
        </button>

        {/* Refresh UI */}
        <button
          onClick={onRefresh}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
          title="Refresh Queue Table"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        {/* Clear/Reset */}
        <button
          onClick={handleReset}
          disabled={loadingAction !== null}
          className="p-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition"
          title="Reset All Leads in DB"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
