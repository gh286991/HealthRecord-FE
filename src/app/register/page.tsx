'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RegisterData } from '@/lib/api';
import { useRegisterMutation, useLoginMutation } from '@/lib/authApi';
import { useLazyLatestVersionsQuery, useCreateAgreementMutation } from '@/lib/legalApi';
import Button from '@/components/Button';
import Toast from '@/components/Toast';
import TermsModal from '@/components/TermsModal';
import { API_BASE_URL } from '@/lib/api';
import { useDispatch } from 'react-redux';
import { setToken, setUser } from '@/lib/authSlice';
import { extractErrorMessage } from '@/lib/errorMessage';

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    name: '',
    bio: '',
    gender: undefined,
    birthday: '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [registerUser] = useRegisterMutation();
  const [login] = useLoginMutation();
  const [triggerLatest] = useLazyLatestVersionsQuery();
  const [createAgreement] = useCreateAgreementMutation();
  const dispatch = useDispatch();
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<'default'|'success'|'error'>('default');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'oauth-google' | null>(null);
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    terms?: string;
  }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement & HTMLTextAreaElement & HTMLSelectElement;
    // 保持受控元件：input/textarea 一律使用字串，select 可為空字串表示未選擇
    const nextValue = type === 'select-one' ? value : value;
    setFormData(prev => ({
      ...prev,
      [name]: nextValue,
    }));
    // 清除該字段的錯誤訊息
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };
  // 點擊第三方註冊：先要求閱讀條款
  const handleThirdPartyRegister = () => {
    setPendingAction('oauth-google');
    setTermsModalOpen(true);
  };

  // 失焦即時驗證，讓使用者在未提交前就能看到提示
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const trimmed = value.trim();
    const fieldErrors: typeof errors = {};
    if (name === 'username') {
      if (!trimmed) fieldErrors.username = '請輸入用戶名';
      else if (trimmed.length < 3) fieldErrors.username = '用戶名至少需要 3 個字符';
    }
    if (name === 'email') {
      if (!trimmed) fieldErrors.email = '請輸入電子郵件';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) fieldErrors.email = '請輸入有效的電子郵件地址';
    }
    if (name === 'password') {
      if (!value) fieldErrors.password = '請輸入密碼';
      else if (value.length < 6) fieldErrors.password = '密碼至少需要 6 個字符';
    }
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...fieldErrors }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 驗證表單
    const newErrors: typeof errors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = '請輸入用戶名';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = '用戶名至少需要 3 個字符';
    }

    if (!formData.email.trim()) {
      newErrors.email = '請輸入電子郵件';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = '請輸入有效的電子郵件地址';
    }

    if (!formData.password) {
      newErrors.password = '請輸入密碼';
    } else if (formData.password.length < 6) {
      newErrors.password = '密碼至少需要 6 個字符';
    }

    if (!termsAccepted) {
      newErrors.terms = '請閱讀並同意服務條款和隱私權政策';
    }

    // 如果有錯誤，設置錯誤狀態並顯示提示
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // 找到第一個錯誤並顯示 Toast
      const firstError = Object.values(newErrors)[0];
      if (firstError) {
        setToastVariant('error');
        setToastMsg(firstError);
        setToastOpen(true);
      }
      // 滾動到第一個錯誤字段
      const firstErrorField = Object.keys(newErrors)[0];
      setTimeout(() => {
        const element = document.getElementById(firstErrorField);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }, 100);
      return;
    }

    // 清除所有錯誤
    setErrors({});

    setLoading(true);

    try {
      // 過濾掉空字串的可選欄位
      const submitData: RegisterData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      };

      if (formData.name?.trim()) submitData.name = formData.name;
      if (formData.bio?.trim()) submitData.bio = formData.bio;
      if (formData.gender) submitData.gender = formData.gender;
      if (formData.birthday) submitData.birthday = formData.birthday;

      await registerUser(submitData).unwrap();
      // 註冊成功後自動登入，並導向個人資料頁
      const loginResp = await login({ username: submitData.username, password: submitData.password }).unwrap();
      dispatch(setToken(loginResp.accessToken));
      if (loginResp.user) dispatch(setUser(loginResp.user));
      // 紀錄使用者對最新條款/隱私的同意（使用 RTK Query）
      setToastVariant('success');
      setToastMsg('註冊成功，已自動登入');
      setToastOpen(true);
      // 使用 RTK Query 同步寫入，同意紀錄完成後再導頁，避免請求被中止
      try {
        const latest = await triggerLatest().unwrap();
        // 取得 userId：優先用回應的 user.userId；沒有就從 accessToken 解析 sub
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
      setTimeout(() => router.push('/profile'), 200);
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err, '註冊失敗，請稍後再試');
      setToastVariant('error');
      setToastMsg(errorMessage);
      setToastOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          建立新帳戶
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          或{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            登入現有帳戶
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                用戶名 *
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.username}
                  aria-describedby={errors.username ? 'username-error' : undefined}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                    errors.username ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.username && (
                <p id="username-error" className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                信箱 *
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                    errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密碼 *
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : 'password-hint'}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                    errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.password ? (
                <p id="password-error" className="mt-1 text-sm text-red-600">{errors.password}</p>
              ) : (
                <p id="password-hint" className="mt-1 text-sm text-gray-500">密碼至少需要 6 個字符</p>
              )}
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                姓名
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                性別
              </label>
              <div className="mt-1">
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender || ''}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="">請選擇</option>
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                  <option value="other">其他</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="birthday" className="block text-sm font-medium text-gray-700">
                生日
              </label>
              <div className="mt-1">
                <input
                  id="birthday"
                  name="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                個人簡介
              </label>
              <div className="mt-1">
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    checked={termsAccepted}
                    onChange={(e) => {
                      if (e.target.checked && !termsAccepted) {
                        // 勾選時開啟 Modal，而不是直接同意
                        setTermsModalOpen(true);
                      } else if (!e.target.checked) {
                        setTermsAccepted(false);
                        // 清除錯誤
                        if (errors.terms) {
                          setErrors(prev => ({ ...prev, terms: undefined }));
                        }
                      }
                    }}
                    className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                      errors.terms ? 'border-red-300' : ''
                    }`}
                  />
                </div>
                <div className="ml-3 text-sm flex-1">
                  <label htmlFor="terms" className={`cursor-pointer ${errors.terms ? 'text-red-600' : 'text-gray-700'}`}>
                    我已閱讀並同意
                    {' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setTermsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-500 underline"
                    >
                      《服務條款》和《隱私權政策》
                    </button>
                    {' '}*
                  </label>
                  {errors.terms && (
                    <p className="mt-1 text-sm text-red-600">{errors.terms}</p>
                  )}
                </div>
              </div>

              {/* 按鈕不再因未勾選條款而禁用，讓使用者可提交以看到錯誤提示 */}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? '註冊中...' : '註冊'}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">或使用第三方註冊</span>
              </div>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={handleThirdPartyRegister}
                className="w-full inline-flex justify-center items-center gap-2 border border-gray-300 rounded-md py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C32.651,6.053,28.513,4,24,4C16.316,4,9.843,8.337,6.306,14.691z"/>
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,13,24,13c3.059,0,5.842,1.154,7.961,3.039 l5.657-5.657C32.651,6.053,28.513,4,24,4C16.316,4,9.843,8.337,6.306,14.691z"/>
                  <path fill="#4CAF50" d="M24,44c4.438,0,8.497-1.64,11.634-4.329l-5.374-4.531C28.226,36.459,26.189,37,24,37 c-5.202,0-9.623-3.317-11.287-7.946l-6.5,5.02C9.695,39.556,16.327,44,24,44z"/>
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.793,2.238-2.231,4.166-4.097,5.583 c0.001-0.001,0.002-0.001,0.003-0.002l5.374,4.531C34.288,39.205,44,32,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                </svg>
                使用 Google 註冊
              </button>
            </div>
          </div>
        </div>
      </div>
      <Toast open={toastOpen} message={toastMsg} variant={toastVariant} onClose={() => setToastOpen(false)} />
      <TermsModal
        open={termsModalOpen}
        onClose={() => {
          setTermsModalOpen(false);
          setPendingAction(null);
        }}
        onAccept={() => {
          setTermsModalOpen(false);
          if (pendingAction === 'oauth-google') {
            setPendingAction(null);
            // 條款閱讀完成後才導向第三方
            if (typeof window !== 'undefined') {
              window.location.href = `${API_BASE_URL}/auth/google`;
            }
          } else {
            // 一般註冊流程：勾選同意
            setTermsAccepted(true);
          }
        }}
      />
    </div>
  );
} 
