'use client';

import { useState } from 'react';
import { Lead } from '@/lib/types';
import LeadRow from './LeadRow';

interface QueueTableProps {
  leads: Lead[];
  onPreview: (lead: Lead) => void;
  onSendNow: (id: number) => void;
  onGenerate: () => void;
}

export default function QueueTable({ leads, onPreview, onSendNow, onGenerate }: QueueTableProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'queued' | 'sent' | 'failed' | 'rollover'>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const filteredLeads = leads.filter((lead) => {
    if (statusFilter === 'rollover') {
      if (!lead.is_rollover) return false;
    } else if (statusFilter !== 'all' && lead.status !== statusFilter) {
      return false;
    }

    if (countryFilter !== 'all' && lead.country !== countryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchCompany = lead.company_name.toLowerCase().includes(q);
      const matchEmail = lead.contact_email.toLowerCase().includes(q);
      const matchContact = lead.contact_name?.toLowerCase().includes(q);
      if (!matchCompany && !matchEmail && !matchContact) return false;
    }
    return true;
  });

  const queuedCount = leads.filter((l) => l.status === 'queued').length;
  const sentCount = leads.filter((l) => l.status === 'sent').length;
  const failedCount = leads.filter((l) => l.status === 'failed').length;
  const rolloverCount = leads.filter((l) => l.is_rollover).length;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl shadow-xl overflow-hidden backdrop-blur">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-950/40">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              statusFilter === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Leads ({leads.length})
          </button>
          <button
            onClick={() => setStatusFilter('queued')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              statusFilter === 'queued'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-blue-400 hover:text-blue-300'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            Queued ({queuedCount})
          </button>
          <button
            onClick={() => setStatusFilter('sent')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              statusFilter === 'sent'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-400 hover:text-emerald-300'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Sent ({sentCount})
          </button>
          <button
            onClick={() => setStatusFilter('failed')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              statusFilter === 'failed'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-rose-400 hover:text-rose-300'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            Failed ({failedCount})
          </button>
          {rolloverCount > 0 && (
            <button
              onClick={() => setStatusFilter('rollover')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                statusFilter === 'rollover'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-purple-400 hover:text-purple-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              Resent / Rollover ({rolloverCount})
            </button>
          )}
        </div>

        {/* Filter Controls: Country & Search */}
        <div className="flex items-center gap-3">
          {/* Country Filter */}
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
          >
            <option value="all">All Countries</option>
            <option value="US">🇺🇸 United States (US)</option>
            <option value="UK">🇬🇧 United Kingdom (UK)</option>
            <option value="CA">🇨🇦 Canada (CA)</option>
            <option value="AU">🇦🇺 Australia (AU)</option>
            <option value="IE">🇮🇪 Ireland (IE)</option>
            <option value="NZ">🇳🇿 New Zealand (NZ)</option>
          </select>

          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-white rounded-lg pl-8 pr-3 py-2 w-48 placeholder-slate-500 outline-none focus:border-blue-500"
            />
            <svg
              className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Table Grid */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] table-fixed text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
              <th className="w-[190px] px-4 py-3">Queue Status / Countdown</th>
              <th className="w-[250px] px-4 py-3">Company & Contact</th>
              <th className="w-[230px] px-4 py-3">Audited Docs URL & Excerpt</th>
              <th className="w-[150px] px-4 py-3">Google Style Guide Hook</th>
              <th className="w-[160px] px-4 py-3">Scheduled Dispatch</th>
              <th className="w-[100px] px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length > 0 ? (
              filteredLeads.map((lead) => (
                <LeadRow
                  key={lead.id}
                  lead={lead}
                  onPreview={onPreview}
                  onSendNow={onSendNow}
                />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-slate-400">
                  <div className="max-w-md mx-auto space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h4 className="text-base font-semibold text-white">No Leads in Selected View</h4>
                    <p className="text-xs text-slate-400">
                      The engine checks company team pages for a relevant decision-maker, verifies their business email through the configured enrichment provider, and audits actual documentation. It only queues verified contacts; batches may contain fewer than 30 leads.
                    </p>
                    <button
                      onClick={onGenerate}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md transition"
                    >
                      Find Prospects (Up to 30)
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-xs text-slate-400 flex items-center justify-between">
        <span>
          Showing {filteredLeads.length} of {leads.length} total pitches ({rolloverCount} rolled over)
        </span>
        <span className="font-mono text-[11px] text-slate-400">
          20-minute spacing • Max 30 pitches/day • Verified prospects only
        </span>
      </div>
    </div>
  );
}
