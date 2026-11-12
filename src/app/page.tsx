'use client';

import { useState, useEffect, useCallback } from 'react';
import { Lead, WorkerState } from '@/lib/types';
import {
  fetchLeads,
  fetchWorkerStatus,
  sendLeadNow,
  generateBatch,
  generateProductHuntBatch,
} from '@/lib/api';
import StatsOverview from '@/components/StatsOverview';
import QueueControls from '@/components/QueueControls';
import QueueTable from '@/components/QueueTable';
import AuditPreviewModal from '@/components/AuditPreviewModal';

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [worker, setWorker] = useState<WorkerState | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [serverOnline, setServerOnline] = useState<boolean>(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [leadsData, workerData] = await Promise.all([
        fetchLeads(),
        fetchWorkerStatus()
      ]);
      setLeads(leadsData);
      setWorker(workerData.worker);
      setServerOnline(true);
      setConnectionError(null);
    } catch (err) {
      console.error('Error polling pitch engine data:', err);
      setServerOnline(false);
      setConnectionError(
        err instanceof Error ? err.message : 'Could not connect to the Django API.'
      );
    }
  }, []);

  useEffect(() => {
    loadData();
    // Auto-poll status and queue every 5 seconds for real-time reactivity
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleSendNow = async (id: number) => {
    try {
      const res = await sendLeadNow(id);
      if (res.success) {
        alert('Email dispatched silently via SMTP!');
      } else {
        alert(`SMTP dispatch error: ${res.lead?.error_message || 'Failed'}`);
      }
      loadData();
    } catch (err: unknown) {
      alert(`Error sending pitch: ${(err as Error).message}`);
    }
  };

  const handleGenerateBatch = async () => {
    try {
      await generateBatch(30);
      loadData();
    } catch (err: unknown) {
      alert(`Error generating batch: ${(err as Error).message}`);
    }
  };

  const handleGenerateProductHuntBatch = async () => {
    try {
      const result = await generateProductHuntBatch(30, 72);
      alert(result.message);
      loadData();
    } catch (err: unknown) {
      alert(`Product Hunt discovery failed: ${(err as Error).message}`);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans selection:bg-blue-500 selection:text-white">
      <div className="max-w-7xl mx-auto">
        {/* Navigation / Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-black text-lg">
                TW
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  Technical Writing Cold Pitch Engine
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Django + Next.js
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automated 20-Minute Background Interval Queue • Google Style Guide Passive Voice Auditor • Silent SMTP
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Backend connection pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono">
              <span
                className={`w-2 h-2 rounded-full ${
                  serverOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span className="text-slate-300">
                {serverOnline ? 'Django SMTP API: Connected' : 'Django API: Disconnected'}
              </span>
            </div>

            {/* Region Scope Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400">
              <span className="text-slate-300 font-semibold">Targets:</span>
              <span>US, UK, CA, AU, IE, NZ</span>
            </div>
          </div>
        </header>

        {connectionError && (
          <div role="alert" className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {connectionError}
          </div>
        )}

        {/* 1. Stats Overview Bar (Daily Cap, Domain Health, Counters) */}
        <StatsOverview worker={worker} />

        {/* 2. Queue Controls (Instant Pause Button, Batch Generator, Poll Now) */}
        <QueueControls worker={worker} onRefresh={loadData} />

        {/* 3. Color-Coded Leads Queue Table */}
        <QueueTable
          leads={leads}
          onPreview={setSelectedLead}
          onSendNow={handleSendNow}
          onGenerate={handleGenerateBatch}
          onGenerateProductHunt={handleGenerateProductHuntBatch}
        />

        {/* 4. Google Style Guide Audit & Email Inspection Modal */}
        <AuditPreviewModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onSendNow={handleSendNow}
        />
      </div>
    </main>
  );
}
