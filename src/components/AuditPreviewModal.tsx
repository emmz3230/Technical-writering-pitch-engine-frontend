'use client';

import { Lead } from '@/lib/types';

interface AuditPreviewModalProps {
  lead: Lead | null;
  onClose: () => void;
  onSendNow?: (id: number) => void;
}

export default function AuditPreviewModal({ lead, onClose, onSendNow }: AuditPreviewModalProps) {
  if (!lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded font-mono text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {lead.country}
            </span>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {lead.company_name}
                <span className="text-xs font-normal text-slate-400">({lead.contact_name || 'Tech Docs Team'})</span>
              </h3>
              <p className="text-xs text-slate-400">{lead.contact_email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Documentation Source */}
          <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Audited Documentation Page
              </span>
              <a
                href={lead.doc_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Visit Source Docs</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
            <p className="text-xs font-mono text-slate-300 break-all bg-slate-900/60 p-2 rounded border border-slate-800/80 mb-2">
              {lead.doc_url}
            </p>
            {lead.documentation_snippet && (
              <div className="text-xs text-slate-300 italic bg-slate-900/40 p-2.5 rounded border-l-2 border-amber-500">
                &ldquo;{lead.documentation_snippet}&rdquo;
              </div>
            )}
          </div>

          {/* Google Style Guide Passive Voice Violation */}
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="p-1 rounded bg-amber-500/20 text-amber-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </span>
              <h4 className="text-sm font-semibold text-amber-400">
                Google Developer Documentation Style Guide Audit
              </h4>
            </div>

            {lead.passive_voice_violations && lead.passive_voice_violations.length > 0 ? (
              <div className="space-y-3">
                {lead.passive_voice_violations.map((violation, idx) => (
                  <div key={idx} className="bg-slate-900/80 p-3 rounded-lg border border-amber-500/20 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Flagged Passive Construct:</span>
                      <span className="px-2 py-0.5 rounded font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {violation.passive_phrase}
                      </span>
                    </div>
                    <p className="text-slate-300 font-sans">
                      <span className="text-slate-500 font-semibold">Context: </span>
                      &ldquo;{violation.sentence}&rdquo;
                    </p>
                    <div className="mt-1 pt-1 border-t border-slate-800 text-emerald-400 flex items-start gap-1.5">
                      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{violation.suggestion}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Style guide audit completed with synthetic sample context.</p>
            )}
          </div>

          {/* Compiled Cold Pitch Email */}
          <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Compiled Cold Pitch (Direct SMTP Body)
              </span>
              <span className="text-[11px] text-emerald-400 font-mono">Silent SMTP Automation</span>
            </div>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 mb-2">
              <span className="text-xs text-slate-400 font-semibold">Subject: </span>
              <span className="text-xs font-semibold text-white">{lead.subject}</span>
            </div>

            <pre className="bg-slate-900 p-4 rounded-lg border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
              {lead.body}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="text-xs text-slate-400">
            Status: <span className="font-semibold uppercase text-slate-200">{lead.status}</span> • Scheduled:{' '}
            <span className="font-mono">{new Date(lead.scheduled_send_time).toLocaleTimeString()}</span>
          </div>

          <div className="flex items-center gap-3">
            {lead.status === 'queued' && onSendNow && (
              <button
                onClick={() => {
                  onSendNow(lead.id);
                  onClose();
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition shadow-md"
              >
                Send Now via SMTP
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
