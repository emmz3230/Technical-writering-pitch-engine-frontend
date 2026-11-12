import { Lead, WorkerState } from './types';

const LOCAL_API_BASE = 'http://127.0.0.1:8000/api';

function getApiBase(): string {
  const configuredBase = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, '');
  if (configuredBase) {
    return configuredBase;
  }

  const localHosts = ['localhost', '127.0.0.1', '::1'];
  if (typeof window === 'undefined' || localHosts.includes(window.location.hostname)) {
    return LOCAL_API_BASE;
  }

  throw new Error(
    'NEXT_PUBLIC_API_URL is not configured. Set it to your Django API URL, including /api.'
  );
}

async function fetchApi(path: string, init?: RequestInit): Promise<Response> {
  const url = `${getApiBase()}${path}`;
  try {
    return await fetch(url, init);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Could not reach the Django API at ${url}. Check that the backend is running, ` +
        'the API URL is correct, and the backend allows this frontend origin over HTTPS/CORS.'
      );
    }
    throw error;
  }
}

export async function fetchLeads(status?: string): Promise<Lead[]> {
  const path = status ? `/leads/?status=${encodeURIComponent(status)}` : '/leads/';
  const res = await fetchApi(path, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch leads: ${res.statusText}`);
  }
  const data = await res.json();
  return data.leads || [];
}

export async function fetchWorkerStatus(): Promise<{ worker: WorkerState; server_time: string }> {
  const res = await fetchApi('/worker/status/', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch worker status: ${res.statusText}`);
  }
  return await res.json();
}

export async function toggleWorkerPause(is_paused?: boolean): Promise<{ is_paused: boolean; message: string }> {
  const res = await fetchApi('/worker/toggle-pause/', {
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
  const res = await fetchApi('/worker/toggle-auto-daily/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    throw new Error(`Failed to toggle auto daily: ${res.statusText}`);
  }
  return await res.json();
}

export async function generateBatch(count: number = 30, include_rollover: boolean = true): Promise<{ leads: Lead[]; message: string }> {
  const res = await fetchApi('/queue/generate/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count, include_rollover })
  });
  if (!res.ok) {
    throw new Error(`Failed to generate batch: ${res.statusText}`);
  }
  return await res.json();
}

export async function generateProductHuntBatch(
  count: number = 30,
  lookback_hours: number = 72
): Promise<{ leads: Lead[]; message: string }> {
  const res = await fetchApi('/queue/generate/product-hunt/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count, lookback_hours })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || `Failed to discover Product Hunt leads: ${res.statusText}`);
  }
  return await res.json();
}

export async function rolloverQueue(count: number = 30): Promise<{ leads: Lead[]; message: string }> {
  const res = await fetchApi('/queue/rollover/', {
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
  const res = await fetchApi('/queue/process-now/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    throw new Error(`Failed to process queue: ${res.statusText}`);
  }
  return await res.json();
}

export async function sendLeadNow(id: number): Promise<{ success: boolean; lead: Lead }> {
  const res = await fetchApi(`/leads/${id}/send-now/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    throw new Error(`Failed to dispatch lead ${id}: ${res.statusText}`);
  }
  return await res.json();
}

export async function resetQueue(): Promise<{ success: boolean; message: string }> {
  const res = await fetchApi('/queue/reset/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    throw new Error(`Failed to reset queue: ${res.statusText}`);
  }
  return await res.json();
}
