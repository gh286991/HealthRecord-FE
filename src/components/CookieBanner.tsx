'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/lib/store';
import { useCreateAgreementMutation, useLazyLatestVersionsQuery } from '@/lib/legalApi';
import { tokenUtils } from '@/lib/api';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const user = useSelector((s: RootState) => s.auth.user);
  const [triggerLatest] = useLazyLatestVersionsQuery();
  const [createAgreement] = useCreateAgreementMutation();

  useEffect(() => {
    // 檢查用戶是否已經做出選擇
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) setIsVisible(true);
  }, []);

  const recordCookieConsent = async () => {
    // 準備 userId 或 visitorId
    let userId = user?.userId;
    if (tokenUtils.isLoggedIn() && !userId) {
      try {
        const token = localStorage.getItem('token') || '';
        const [, payloadB64] = token.split('.');
        if (payloadB64) {
          const json = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
          userId = String(json?.sub || json?.userId || json?._id || '');
        }
      } catch {}
    }
    let visitorId: string | undefined = undefined;
    if (!userId) {
      visitorId = localStorage.getItem('visitorId') || '';
      if (!visitorId) {
        // 產生簡單 UUIDv4（無外部依賴）
        visitorId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 0xf) >> 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
        localStorage.setItem('visitorId', visitorId);
      }
    }
    if (!userId && !visitorId) return;
    try {
      const latest = await triggerLatest().unwrap().catch(() => undefined);
      const version = latest?.cookies;
      await createAgreement({ userId, visitorId, doc: 'cookies', ...(version ? { version } : {}) }).unwrap();
    } catch {}
  };

  const handleAccept = async () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    // 非阻塞地記錄
    recordCookieConsent();
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-700">
              我們使用 Cookie 來提供更好的使用體驗、記住您的偏好設定，並協助改善服務。
              繼續使用本服務即表示您同意我們使用 Cookie。
              {' '}
              <Link href="/cookies" className="text-orange-600 hover:text-orange-700 underline">
                了解更多
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleAccept}
              className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
            >
              接受
            </button>
            <button
              onClick={handleDecline}
              className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
            >
              拒絕
            </button>
            <button
              onClick={handleDecline}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="關閉"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
