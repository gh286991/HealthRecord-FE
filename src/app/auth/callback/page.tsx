"use client";

import { useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setToken } from '@/lib/authSlice';

function AuthCallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
  const dispatch = useDispatch();

  const isNew = useMemo(() => params.get('new') === '1', [params]);
  const token = useMemo(() => params.get('token'), [params]);

  useEffect(() => {
    if (!token) {
      router.replace('/login');
      return;
    }
    try {
      localStorage.setItem('token', token);
      dispatch(setToken(token));
      router.replace(isNew ? '/profile' : '/dashboard');
    } catch (error: unknown) {
      console.error('Error setting token:', error);
      router.replace('/login');
    }
  }, [token, isNew, router, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">正在登入中，請稍候…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">載入中…</p>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
