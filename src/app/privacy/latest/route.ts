import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/api';

export async function GET() {
  try {
    const resp = await fetch(`${API_BASE_URL}/legal/latest-versions`, { cache: 'no-store' });
    if (!resp.ok) throw new Error('fetch latest failed');
    const data = await resp.json();
    const version = data?.privacy || 'v0.3';
    return NextResponse.redirect(new URL(`/privacy/${version}`, process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3030'), 302);
  } catch {
    return NextResponse.redirect(new URL(`/privacy/v0.3`, process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3030'), 302);
  }
}

