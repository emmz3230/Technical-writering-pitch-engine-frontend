'use client';

import { Lead } from '@/lib/types';
import LiveCountdown from './LiveCountdown';

interface LeadRowProps {
  lead: Lead;
  onPreview: (lead: Lead) => void;
  onSendNow: (id: number) => void;
}

export default function LeadRow({ lead, onPreview, onSendNow }: LeadRowProps) {
  // Color-coded styling per specification:
  // Blue for 'Queued'
  // Green for 'Sent successfully'
  // Red for 'Failed'
  const getRowClasses = () => {
    switch (lead.status) {
      case 'queued':
        return 'bg-blue-950/20 hover:bg-blue-950/30 border-l-4 border-l-blue-500 border-b border-b-slate-800/80';
      case 'sent':
        return 'bg-emerald-950/20 hover:bg-emerald-950/30 border-l-4 border-l-emerald-500 border-b border-b-slate-800/80';
      case 'failed':
        return 'bg-rose-950/20 hover:bg-rose-950/30 border-l-4 border-l-rose-500 border-b border-b-slate-800/80';
      default:
        return 'bg-slate-900/60 hover:bg-slate-800/60 border-b border-slate-800';
    }
  };

  const getStatusBadge = () => {
    switch (lead.status) {
      case 'queued':
        return (
          <div className="flex flex-col gap-1 items-start">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Queued
              </span>
              {lead.is_rollover && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30" title={`Rolled over from unsent run (Retry #${lead.retry_count})`}>
                  Retry #{lead.retry_count}
                </span>
              )}
            </div>
            <LiveCountdown targetDate={lead.scheduled_send_time} />
          </div>
        );
      case 'sent':
        return (
          <div className="flex flex-col gap-0.5 items-start">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Sent Successfully
            </span>
            <span className="text-[11px] font-mono text-emerald-400/80">
              {lead.sent_at ? new Date(lead.sent_at).toLocaleTimeString() : 'Dispatched'}
            </span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex w-full min-w-0 flex-col gap-0.5 items-start">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40">
              <svg className="w-3 h-3 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Failed
            </span>
            <span className="block w-full whitespace-normal break-words text-[11px] leading-4 text-rose-400" title={lead.error_message || 'SMTP delivery error'}>
              {lead.error_message || 'SMTP Connection Error'}
            </span>
          </div>
        );
    }
  };

  const getCountryBadge = (c: string) => {
    return (
      <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-slate-800 text-slate-300 border border-slate-700">
        {c}
      </span>
    );
  };

  return (
    <tr className={`transition-colors duration-150 ${getRowClasses()}`}>
      {/* 1. Status & Live Timer */}
      <td className="w-[190px] max-w-[190px] overflow-hidden px-4 py-3.5">
        <div className="w-full min-w-0 overflow-hidden">
          {getStatusBadge()}
        </div>
      </td>

      {/* 2. Target Company & Region */}
      <td className="w-[250px] max-w-[250px] overflow-hidden px-4 py-3.5">
        <div className="flex min-w-0 items-center gap-2">
          {getCountryBadge(lead.country)}
          <div className="min-w-0">
            <div className="font-semibold text-sm text-white flex items-center gap-1.5">
              <span className="truncate">{lead.company_name}</span>
            </div>
            <div className="flex min-w-0 items-center gap-1 text-xs text-slate-400">
              <span className="min-w-0 truncate">{lead.contact_name || 'Technical Writer Lead'}</span>
              <span className="shrink-0">•</span>
              <span
                className={`block min-w-0 truncate font-mono ${lead.contact_email ? 'text-slate-400' : 'text-amber-400'}`}
                title={lead.contact_email || 'A verified contact email is required before sending.'}
              >
                {lead.contact_email || 'Email required'}
              </span>
            </div>
          </div>
        </div>
      </td>

      {/* 3. Documentation URL & Passive Voice Snippet */}
      <td className="w-[230px] max-w-[230px] overflow-hidden px-4 py-3.5">
        <div className="space-y-1">
          <a
            href={lead.doc_url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-400 hover:underline flex items-center gap-1 truncate"
          >
            <span className="truncate">{lead.doc_url.replace(/^https?:\/\//, '')}</span>
            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          {lead.documentation_snippet && (
            <p className="text-xs text-slate-400 italic line-clamp-1">
              &ldquo;{lead.documentation_snippet}&rdquo;
            </p>
          )}
        </div>
      </td>

      {/* 4. Google Style Guide Hook Pill */}
      <td className="w-[150px] max-w-[150px] overflow-hidden px-4 py-3.5">
        <button
          onClick={() => onPreview(lead)}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition"
        >
          <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Audit & Pitch</span>
        </button>
      </td>

      {/* 5. Scheduled Send Time */}
      <td className="w-[160px] max-w-[160px] overflow-hidden px-4 py-3.5 whitespace-nowrap text-xs font-mono text-slate-300">
        <div>{new Date(lead.scheduled_send_time).toLocaleDateString()}</div>
        <div className="text-slate-500 font-semibold">{new Date(lead.scheduled_send_time).toLocaleTimeString()}</div>
      </td>

      {/* 6. Instant Action */}
      <td className="w-[100px] max-w-[100px] overflow-hidden px-4 py-3.5 whitespace-nowrap text-right">
        {lead.status === 'queued' ? (
          <button
            onClick={() => onSendNow(lead.id)}
            className="p-1.5 rounded-lg text-xs text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/40 transition"
            title="Dispatch this email right now via SMTP"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        ) : (
          <span className="text-[11px] text-slate-600">—</span>
        )}
      </td>
    </tr>
  );
}
