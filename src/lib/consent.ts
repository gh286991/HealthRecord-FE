"use client";

// Consent utilities to centralize non-essential storage/feature gating

export const isCookieAccepted = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('cookieConsent') === 'accepted';
};

// Keys that are always allowed (strictly necessary):
const ESSENTIAL_KEYS = new Set([
  'token',
  'cookieConsent',
  'cookieConsentDate',
]);

// Key prefixes treated as essential (e.g., critical drafts)
const ESSENTIAL_PREFIXES = [
  'workout_draft_',
];

const isEssentialKey = (key: string) =>
  ESSENTIAL_KEYS.has(key) || ESSENTIAL_PREFIXES.some((p) => key.startsWith(p));

export const getItem = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  if (isEssentialKey(key) || isCookieAccepted()) {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  return null;
};

export const setItem = (key: string, value: string) => {
  if (typeof window === 'undefined') return;
  if (isEssentialKey(key) || isCookieAccepted()) {
    try { localStorage.setItem(key, value); } catch {}
  }
};

export const removeItem = (key: string) => {
  if (typeof window === 'undefined') return;
  if (isEssentialKey(key) || isCookieAccepted()) {
    try { localStorage.removeItem(key); } catch {}
  }
};
