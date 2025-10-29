"use client";

import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '@/lib/api';

// Shared header prep: attach JWT token when available
export const attachAuthHeader = (headers: Headers) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
};

// BaseQuery that only attaches Authorization header
export const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    attachAuthHeader(headers);
    return headers;
  },
});

// BaseQuery that also defaults to JSON content-type (safe for non-FormData)
export const jsonBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    attachAuthHeader(headers);
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    return headers;
  },
});

