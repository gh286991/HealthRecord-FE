'use client';

import { useMemo, useState, Suspense } from 'react';
import { Info } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/Button';
import Toast from '@/components/Toast';
import { useLoginMutation } from '@/lib/authApi';
import { useLazyLatestVersionsQuery, useCreateAgreementMutation } from '@/lib/legalApi';
import { API_BASE_URL } from '@/lib/api';
import { useDispatch } from 'react-redux';
import { setToken, setUser } from '@/lib/authSlice';

function RegisterDetailsContent() {
  const params = useSearchParams();
  const token = useMemo(() => params.get('token') || '', [params]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [tagHelp, setTagHelp] = useState<string | null>(null);
  const [showPwHelp, setShowPwHelp] = useState(false);
  const [pwTouched, setPwTouched] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState<string>('');
  const [birthday, setBirthday] = useState('');
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [activityLevel, setActivityLevel] = useState<string>('');
  const [goal, setGoal] = useState<string>('');
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<'default'|'success'|'error'>('default');
  const [login] = useLoginMutation();
  const [triggerLatest] = useLazyLatestVersionsQuery();
  const [createAgreement] = useCreateAgreementMutation();
  const dispatch = useDispatch();
  const router = useRouter();

  const pwRules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    digit: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const pwValid = pwRules.length && pwRules.upper && pwRules.lower && pwRules.digit && pwRules.special;
  const pwMatch = password === confirmPassword && confirmPassword.length > 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { setToastVariant('error'); setToastMsg('驗證連結無效'); setToastOpen(true); return; }
    if (username.trim().length < 3) { setToastVariant('error'); setToastMsg('用戶名至少 3 個字'); setToastOpen(true); return; }
    if (!pwValid) { setPwTouched(true); setToastVariant('error'); setToastMsg('密碼需含大小寫、數字、特殊符號且至少 8 碼'); setToastOpen(true); return; }
    if (!pwMatch) { setToastVariant('error'); setToastMsg('兩次輸入的密碼不一致'); setToastOpen(true); return; }
    setLoading(true);
    try {
      type RegisterCompletePayload = {
        token: string;
        username: string;
        password: string;
        name?: string;
        bio?: string;
        gender?: string;
        birthday?: string;
        height?: number;
        weight?: number;
        activityLevel?: string;
        goal?: string;
        showPaymentMethod?: boolean;
      };
      const payload: RegisterCompletePayload = { token, username, password };
      if (name.trim()) payload.name = name.trim();
      if (bio.trim()) payload.bio = bio.trim();
      if (gender) payload.gender = gender;
      if (birthday) payload.birthday = birthday;
      if (height) payload.height = Number(height);
      if (weight) payload.weight = Number(weight);
      if (activityLevel) payload.activityLevel = activityLevel;
      if (goal) payload.goal = goal;
      payload.showPaymentMethod = showPaymentMethod;
      const resp = await fetch(`${API_BASE_URL}/auth/register-email/complete`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json?.message || '註冊失敗');
      // 註冊完成後自動登入
      const loginResp = await login({ username, password }).unwrap();
      dispatch(setToken(loginResp.accessToken));
      if (loginResp.user) dispatch(setUser(loginResp.user));
      // 同意紀錄
      try {
        const latest = await triggerLatest().unwrap();
        let userIdFromToken: string | undefined;
        try {
          const [, payloadB64] = (loginResp?.accessToken || '').split('.');
          if (payloadB64) {
            const json = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
            userIdFromToken = String(json?.sub || json?.userId || json?._id || '');
          }
        } catch {}
        const uid = loginResp?.user?.userId || userIdFromToken;
        if (uid) {
          await Promise.allSettled([
            createAgreement({ userId: uid, doc: 'terms', version: latest?.terms }).unwrap(),
            createAgreement({ userId: uid, doc: 'privacy', version: latest?.privacy }).unwrap(),
          ]);
        }
      } catch {}
      setToastVariant('success'); setToastMsg('註冊成功'); setToastOpen(true);
      setTimeout(() => router.push('/profile'), 300);
    } catch (e: unknown) {
      const message = e instanceof Error && e.message ? e.message : '註冊失敗';
      setToastVariant('error'); setToastMsg(message); setToastOpen(true);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-full bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-6">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">完成資料</h2>
          <p className="mt-2 text-center text-sm text-gray-600">請建立用戶名與密碼，並補充基本資料</p>
        </div>
        <form onSubmit={submit} className="bg-white p-6 rounded-lg shadow space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">用戶名 <span className="text-red-500">*</span></label>
            <input id="username" value={username} onChange={e=>setUsername(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400" required />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">密碼 <span className="text-red-500">*</span></label>
              <div className="relative">
                <button
                  type="button"
                  aria-label="密碼規則說明"
                  onMouseEnter={() => setShowPwHelp(true)}
                  onMouseLeave={() => setShowPwHelp(false)}
                  onFocus={() => setShowPwHelp(true)}
                  onBlur={() => setShowPwHelp(false)}
                  onClick={() => setShowPwHelp(v => !v)}
                  className="inline-flex items-center justify-center h-5 w-5 rounded-full text-gray-500 hover:text-gray-700 border border-gray-300"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
                {showPwHelp && (
                  <div className="absolute z-20 mt-2 w-64 -left-2 sm:left-auto sm:-right-2 rounded-lg border border-gray-200 bg-white p-3 shadow-md">
                    <p className="text-xs text-gray-600 mb-2">密碼需符合以下條件：</p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] ${pwRules.length ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>8 碼</span>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] ${pwRules.upper ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>大寫</span>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] ${pwRules.lower ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>小寫</span>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] ${pwRules.digit ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>數字</span>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] ${pwRules.special ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>符號</span>
                    </div>
                    <p className="mt-2 text-[11px] text-gray-500">手機可點按此圖示顯示/隱藏說明。</p>
                  </div>
                )}
              </div>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e=>setPassword(e.target.value)}
                onBlur={() => setPwTouched(true)}
                className={`mt-1 block w-full pr-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 ${pwTouched && !pwValid ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                required
              />
              <button type="button" onClick={()=>setShowPw(v=>!v)} className="absolute inset-y-0 right-0 mt-1 mr-2 px-2 text-gray-500 hover:text-gray-700" aria-label="顯示/隱藏密碼">
                {showPw ? '隱藏' : '顯示'}
              </button>
            </div>
            {/* 強度條與條件徽章 */}
            <div className="mt-2 space-y-2">
              <div className="h-1.5 w-full rounded bg-gray-200 overflow-hidden">
                {(() => {
                  const score = [pwRules.length, pwRules.upper, pwRules.lower, pwRules.digit, pwRules.special].filter(Boolean).length;
                  const width = (score / 5) * 100;
                  const color = score <= 2 ? 'bg-red-500' : score === 3 ? 'bg-yellow-500' : score === 4 ? 'bg-emerald-500' : 'bg-green-600';
                  return <div className={`${color} h-full transition-all`} style={{ width: `${width}%` }} />;
                })()}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span
                  title="至少 8 個字元"
                  aria-label="至少 8 個字元"
                  onClick={() => { setTagHelp('至少 8 個字元'); setTimeout(()=>setTagHelp(null), 2500); }}
                  className={`px-2 py-0.5 rounded-full text-[11px] cursor-help ${pwRules.length ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}
                >8 碼</span>
                <span
                  title="至少一個大寫字母 A-Z"
                  aria-label="至少一個大寫字母 A-Z"
                  onClick={() => { setTagHelp('至少一個大寫字母 A-Z'); setTimeout(()=>setTagHelp(null), 2500); }}
                  className={`px-2 py-0.5 rounded-full text-[11px] cursor-help ${pwRules.upper ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}
                >大寫</span>
                <span
                  title="至少一個小寫字母 a-z"
                  aria-label="至少一個小寫字母 a-z"
                  onClick={() => { setTagHelp('至少一個小寫字母 a-z'); setTimeout(()=>setTagHelp(null), 2500); }}
                  className={`px-2 py-0.5 rounded-full text-[11px] cursor-help ${pwRules.lower ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}
                >小寫</span>
                <span
                  title="至少一個數字 0-9"
                  aria-label="至少一個數字 0-9"
                  onClick={() => { setTagHelp('至少一個數字 0-9'); setTimeout(()=>setTagHelp(null), 2500); }}
                  className={`px-2 py-0.5 rounded-full text-[11px] cursor-help ${pwRules.digit ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}
                >數字</span>
                <span
                  title="至少一個特殊符號（例如 !@#$% 等）"
                  aria-label="至少一個特殊符號（例如 !@#$% 等）"
                  onClick={() => { setTagHelp('至少一個特殊符號（例如 !@#$% 等）'); setTimeout(()=>setTagHelp(null), 2500); }}
                  className={`px-2 py-0.5 rounded-full text-[11px] cursor-help ${pwRules.special ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}
                >符號</span>
              </div>
              {tagHelp && (
                <p className="text-[11px] text-gray-500">{tagHelp}</p>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">確認密碼 <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                id="confirm"
                type={showPw2 ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e=>setConfirmPassword(e.target.value)}
                className={`mt-1 block w-full pr-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 ${confirmPassword && !pwMatch ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                required
              />
              <button type="button" onClick={()=>setShowPw2(v=>!v)} className="absolute inset-y-0 right-0 mt-1 mr-2 px-2 text-gray-500 hover:text-gray-700" aria-label="顯示/隱藏密碼">
                {showPw2 ? '隱藏' : '顯示'}
              </button>
            </div>
            {confirmPassword && !pwMatch && (
              <p className="mt-1 text-xs text-red-600">兩次輸入的密碼不一致</p>
            )}
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">姓名（可選）</label>
            <input id="name" value={name} onChange={e=>setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400" />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">個人簡介（可選）</label>
            <textarea id="bio" rows={3} value={bio} onChange={e=>setBio(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">性別</label>
              <select id="gender" value={gender} onChange={e=>setGender(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900">
                <option value="">不指定</option>
                <option value="male">男性</option>
                <option value="female">女性</option>
                <option value="other">其他</option>
              </select>
            </div>
            <div>
              <label htmlFor="birthday" className="block text-sm font-medium text-gray-700">生日</label>
              <input id="birthday" type="date" value={birthday} onChange={e=>setBirthday(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="height" className="block text-sm font-medium text-gray-700">身高（公分）</label>
              <input id="height" inputMode="decimal" value={height} onChange={e=>setHeight(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400" />
            </div>
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700">體重（公斤）</label>
              <input id="weight" inputMode="decimal" value={weight} onChange={e=>setWeight(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="activity" className="block text-sm font-medium text-gray-700">活動量</label>
              <select id="activity" value={activityLevel} onChange={e=>setActivityLevel(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900">
                <option value="">未設定</option>
                <option value="sedentary">久坐</option>
                <option value="lightly_active">輕度活躍</option>
                <option value="moderately_active">中度活躍</option>
                <option value="very_active">非常活躍</option>
                <option value="extra_active">極度活躍</option>
              </select>
            </div>
            <div>
              <label htmlFor="goal" className="block text-sm font-medium text-gray-700">目標</label>
              <select id="goal" value={goal} onChange={e=>setGoal(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900">
                <option value="">未設定</option>
                <option value="weight_loss">減重</option>
                <option value="maintain">維持</option>
                <option value="muscle_gain">增肌</option>
              </select>
            </div>
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={showPaymentMethod} onChange={e=>setShowPaymentMethod(e.target.checked)} className="h-4 w-4" />
            飲食記錄顯示付款方式欄位
          </label>
          <Button type="submit" disabled={loading} className="w-full">{loading ? '送出中…' : '完成註冊'}</Button>
        </form>
        <Toast open={toastOpen} message={toastMsg} variant={toastVariant} onClose={() => setToastOpen(false)} />
      </div>
    </div>
  );
}

export default function RegisterDetailsPage() {
  return (
    <Suspense fallback={<div className="min-h-full flex items-center justify-center"><p className="text-gray-600">載入中…</p></div>}>
      <RegisterDetailsContent />
    </Suspense>
  );
}
