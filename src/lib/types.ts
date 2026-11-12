export interface PassiveViolation {
  sentence: string;
  passive_phrase: string;
  rule: string;
  suggestion: string;
}

export type LeadStatus = 'queued' | 'pending_contact' | 'sent' | 'failed';

export interface Lead {
  id: number;
  batch_id: string;
  company_name: string;
  company_domain: string;
  source: 'standard' | 'product_hunt';
  contact_name: string;
  contact_title: string;
  contact_email: string;
  contact_email_source: '' | 'website' | 'enrichment';
  contact_verified: boolean;
  country: 'US' | 'UK' | 'CA' | 'AU' | 'IE' | 'NZ';
  doc_url: string;
  documentation_snippet: string;
  passive_voice_violations: PassiveViolation[];
  audit_hook: string;
  subject: string;
  body: string;
  status: LeadStatus;
  scheduled_send_time: string | null;
  contact_resolution_attempted_at: string | null;
  sent_at: string | null;
  error_message: string | null;
  retry_count: number;
  is_rollover: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkerState {
  id: number;
  is_paused: boolean;
  auto_generate_daily: boolean;
  daily_sent_count: number;
  daily_limit: number;
  remaining_today: number;
  last_reset_date: string;
  last_poll_time: string | null;
  last_run_status: string;
  next_dispatch_time: string | null;
  queued_count: number;
  sent_count: number;
  failed_count: number;
  unsent_count: number;
  updated_at: string;
}
