'use client';

import { useState } from 'react';
import Link from 'next/link';
import TermsModal from '@/components/TermsModal';
import Button from '@/components/Button';
import Toast from '@/components/Toast';
import { API_BASE_URL } from '@/lib/api';

export default function RegisterEmailStartPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<'default'|'success'|'error'>('default');
  const [termsOpen, setTermsOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) { setToastVariant('error'); setToastMsg('請先閱讀並同意條款/隱私'); setToastOpen(true); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setToastVariant('error'); setToastMsg('請輸入有效的電子郵件'); setToastOpen(true); return; }
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE_URL}/auth/register-email/start`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json?.message || '啟動註冊失敗');
      setToastVariant('success'); setToastMsg('已寄出驗證信，請至信箱點擊連結'); setToastOpen(true);
      if (json?.link) setDevLink(json.link);
    } catch (e: unknown) {
      const message = e instanceof Error && e.message ? e.message : '啟動註冊失敗';
      setToastVariant('error'); setToastMsg(message); setToastOpen(true);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-full bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-6">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">建立新帳戶</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            已有帳戶？{' '}<Link className="font-medium text-blue-600 hover:text-blue-500" href="/login">前往登入</Link>
          </p>
        </div>
        <form onSubmit={onSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">信箱 <span className="text-red-500">*</span></label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
              required
            />
          </div>
          <div className="text-sm text-gray-600">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={termsAccepted} onChange={(e) => { if (e.target.checked) setTermsOpen(true); else setTermsAccepted(false); }} className="h-4 w-4" />
              我已閱讀並同意 <button type="button" className="text-blue-600 hover:text-blue-500 underline" onClick={() => setTermsOpen(true)}>服務條款與隱私權</button>
            </label>
          </div>
          <Button type="submit" disabled={loading} className="w-full">{loading ? '寄送中…' : '寄送驗證信'}</Button>
          <div className="text-center text-xs text-gray-500">或</div>
          <a href={`${API_BASE_URL}/auth/google`} className="w-full inline-flex justify-center items-center gap-2 border border-gray-300 rounded-md py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C32.651,6.053,28.513,4,24,4C12.955,4,4,12.955,4,24 s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,13,24,13c3.059,0,5.842,1.154,7.961,3.039 l5.657-5.657C32.651,6.053,28.513,4,24,4C16.316,4,9.843,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c4.438,0,8.497-1.64,11.634-4.329l-5.374-4.531C28.226,36.459,26.189,37,24,37 c-5.202,0-9.623-3.317-11.287-7.946l-6.5,5.02C9.695,39.556,16.327,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.793,2.238-2.231,4.166-4.097,5.583 c0.001-0.001,0.002-0.001,0.003-0.002l5.374,4.531C34.288,39.205,44,32,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            使用 Google 註冊
          </a>
          {devLink && (
            <p className="text-xs text-gray-500 mt-2">
              開發模式：未設定郵件服務，請點此連結完成驗證：{' '}
              <a className="text-orange-600 hover:text-orange-700 break-all" href={devLink}>{devLink}</a>
            </p>
          )}
        </form>
        <Toast open={toastOpen} message={toastMsg} variant={toastVariant} onClose={() => setToastOpen(false)} />
        <TermsModal open={termsOpen} onClose={() => { setTermsOpen(false); }} onAccept={() => { setTermsOpen(false); setTermsAccepted(true); }} />
      </div>
    </div>
  );
}
