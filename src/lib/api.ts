import { Lead, WorkerState } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export async function fetchLeads(status?: string): Promise<Lead[]> {
  const url = status ? `${API_BASE}/leads/?status=${status}` : `${API_BASE}/leads/`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch leads: ${res.statusText}`);
  }
  const data = await res.json();
  return data.leads || [];
}

export async function fetchWorkerStatus(): Promise<{ worker: WorkerState; server_time: string }> {
  const res = await fetch(`${API_BASE}/worker/status/`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch worker status: ${res.statusText}`);
  }
  return await res.json();
}

export async function toggleWorkerPause(is_paused?: boolean): Promise<{ is_paused: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/worker/toggle-pause/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(is_paused !== undefined ? { is_paused } : {})
  });
  if (!res.ok) {
    throw new Error(`Failed to toggle queue pause: ${res.statusText}`);
  }
  return await res.json();
}

export async function toggleAutoDaily(): Promise<{ auto_generate_daily: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/worker/toggle-auto-daily/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    throw new Error(`Failed to toggle auto daily: ${res.statusText}`);
  }
  return await res.json();
}

export async function generateBatch(count: number = 30, include_rollover: boolean = true): Promise<{ leads: Lead[]; message: string }> {
  const res = await fetch(`${API_BASE}/queue/generate/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count, include_rollover })
  });
  if (!res.ok) {
    throw new Error(`Failed to generate batch: ${res.statusText}`);
  }
  return await res.json();
}

export async function rolloverQueue(count: number = 30): Promise<{ leads: Lead[]; message: string }> {
  const res = await fetch(`${API_BASE}/queue/rollover/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count })
  });
  if (!res.ok) {
    throw new Error(`Failed to rollover queue: ${res.statusText}`);
  }
  return await res.json();
}

export async function processQueueNow(): Promise<{ dispatched_count: number; worker: WorkerState }> {
  const res = await fetch(`${API_BASE}/queue/process-now/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    throw new Error(`Failed to process queue: ${res.statusText}`);
  }
  return await res.json();
}

export async function sendLeadNow(id: number): Promise<{ success: boolean; lead: Lead }> {
  const res = await fetch(`${API_BASE}/leads/${id}/send-now/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    throw new Error(`Failed to dispatch lead ${id}: ${res.statusText}`);
  }
  return await res.json();
}

export async function resetQueue(): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/queue/reset/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    throw new Error(`Failed to reset queue: ${res.statusText}`);
  }
  return await res.json();
}
