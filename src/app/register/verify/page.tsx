'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';

function Content() {
  const params = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => params.get('token') || '', [params]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (!token) { setError('驗證連結無效'); return; }
        const resp = await fetch(`${API_BASE_URL}/auth/register-email/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
        if (!resp.ok) throw new Error('驗證失敗');
        router.replace(`/register/details?token=${encodeURIComponent(token)}`);
      } catch (e: unknown) {
        const message = e instanceof Error && e.message ? e.message : '驗證失敗，請重新申請';
        setError(message);
      }
    })();
  }, [token, router]);

  return (
    <div className="min-h-full flex items-center justify-center">
      <div className="text-center text-gray-700">
        {error ? <p>{error}</p> : <p>驗證中，請稍候…</p>}
      </div>
    </div>
  );
}

export default function RegisterVerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-full flex items-center justify-center"><p className="text-gray-600">載入中…</p></div>}>
      <Content />
    </Suspense>
  );
}

