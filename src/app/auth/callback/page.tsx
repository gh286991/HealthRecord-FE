"use client";

import { useEffect, useMemo, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setToken } from '@/lib/authSlice';
import { API_BASE_URL } from '@/lib/api';
import { useCreateAgreementMutation, useLazyLatestVersionsQuery } from '@/lib/legalApi';

function AuthCallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
  const dispatch = useDispatch();
  const [triggerLatest] = useLazyLatestVersionsQuery();
  const [createAgreement] = useCreateAgreementMutation();

  const isNew = useMemo(() => params.get('new') === '1', [params]);
  const token = useMemo(() => params.get('token'), [params]);
  const needsLink = useMemo(() => params.get('link') === '1', [params]);
  const linkToken = useMemo(() => params.get('linkToken') || '', [params]);
  const email = useMemo(() => params.get('email') || '', [params]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (needsLink) return; // 交由下方 UI 處理
    if (!token) {
      router.replace('/login');
      return;
    }
    try {
      localStorage.setItem('token', token);
      dispatch(setToken(token));
      // 若已在未登入狀態接受 Cookie，登入後補記錄 userId 的 cookies 同意
      (async () => {
        try {
          const accepted = localStorage.getItem('cookieConsent') === 'accepted';
          if (accepted) {
            let userIdFromToken: string | undefined;
            try {
              const [, payloadB64] = (token || '').split('.');
              if (payloadB64) {
                const json = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
                userIdFromToken = String(json?.sub || json?.userId || json?._id || '');
              }
            } catch {}
            const uid = userIdFromToken;
            if (uid) {
              const latest = await triggerLatest().unwrap().catch(() => undefined);
              const version = latest?.cookies;
              await createAgreement({ userId: uid, doc: 'cookies', ...(version ? { version } : {}) }).unwrap();
            }
          }
        } catch {}
      })();
      router.replace(isNew ? '/profile' : '/dashboard');
    } catch (error: unknown) {
      console.error('Error setting token:', error);
      router.replace('/login');
    }
  }, [token, isNew, router, dispatch, needsLink, triggerLatest, createAgreement]);

  if (needsLink) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full border rounded-xl p-6 bg-white shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900 mb-2">發現相同信箱</h1>
          <p className="text-sm text-gray-700 mb-4">我們在系統中找到使用 {email || '此'} 信箱的帳號。是否確認這是你的帳號並綁定 Google 登入？</p>
          <div className="flex items-center gap-2 justify-end">
            <button
              className="px-3 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200"
              onClick={() => router.replace('/login')}
            >取消</button>
            <button
              disabled={submitting}
              className={`px-3 py-2 text-sm rounded-md ${submitting ? 'bg-gray-300 text-gray-500' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
              onClick={async () => {
                try {
                  setSubmitting(true);
                  const res = await fetch(`${API_BASE_URL}/auth/link-oauth`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ linkToken }),
                  });
                  const json = await res.json();
                  const at = json?.accessToken;
                  if (!at) throw new Error('Link failed');
                  localStorage.setItem('token', at);
                  dispatch(setToken(at));
                  router.replace('/dashboard');
                } catch (e) {
                  console.error(e);
                  router.replace('/login');
                } finally {
                  setSubmitting(false);
                }
              }}
            >{submitting ? '綁定中…' : '確認綁定'}</button>
          </div>
        </div>
      </div>
    );
  }

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
