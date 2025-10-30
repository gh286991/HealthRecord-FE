import { API_BASE_URL } from '@/lib/api';

export type PwaEvent = 'install' | 'later' | 'dismiss';

export interface PwaStatusResponse {
  installed: boolean;
  nextPromptAt?: string | null;
}

function authHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  } as const;
}

export async function getPwaStatus(token: string): Promise<PwaStatusResponse> {
  const res = await fetch(`${API_BASE_URL}/pwa/status`, {
    method: 'GET',
    headers: authHeaders(token),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch PWA status');
  return res.json();
}

export async function postPwaEvent(token: string, event: PwaEvent): Promise<PwaStatusResponse> {
  const res = await fetch(`${API_BASE_URL}/pwa/event`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ event }),
  });
  if (!res.ok) throw new Error('Failed to post PWA event');
  return res.json();
}


