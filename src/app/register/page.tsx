'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RegisterData } from '@/lib/api';
import { useRegisterMutation, useLoginMutation } from '@/lib/authApi';
import Button from '@/components/Button';
import Toast from '@/components/Toast';
import { API_BASE_URL } from '@/lib/api';
import { useDispatch } from 'react-redux';
import { setToken, setUser } from '@/lib/authSlice';

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
  const dispatch = useDispatch();
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<'default'|'success'|'error'>('default');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value || undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setToastVariant('success');
      setToastMsg('註冊成功，已自動登入');
      setToastOpen(true);
      setTimeout(() => router.push('/profile'), 400);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err && 
        typeof err.response === 'object' && err.response !== null &&
        'data' in err.response && typeof err.response.data === 'object' &&
        err.response.data !== null && 'message' in err.response.data &&
        typeof err.response.data.message === 'string'
        ? err.response.data.message
        : '註冊失敗，請稍後再試';
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
          <form className="space-y-6" onSubmit={handleSubmit}>

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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">密碼至少需要 6 個字符</p>
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

            <div>
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
              <a
                href={`${API_BASE_URL}/auth/google`}
                className="w-full inline-flex justify-center items-center gap-2 border border-gray-300 rounded-md py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C32.651,6.053,28.513,4,24,4C12.955,4,4,12.955,4,24 s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,13,24,13c3.059,0,5.842,1.154,7.961,3.039 l5.657-5.657C32.651,6.053,28.513,4,24,4C16.316,4,9.843,8.337,6.306,14.691z"/>
                  <path fill="#4CAF50" d="M24,44c4.438,0,8.497-1.64,11.634-4.329l-5.374-4.531C28.226,36.459,26.189,37,24,37 c-5.202,0-9.623-3.317-11.287-7.946l-6.5,5.02C9.695,39.556,16.327,44,24,44z"/>
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.793,2.238-2.231,4.166-4.097,5.583 c0.001-0.001,0.002-0.001,0.003-0.002l5.374,4.531C34.288,39.205,44,32,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                </svg>
                使用 Google 註冊
              </a>
            </div>
          </div>
        </div>
      </div>
      <Toast open={toastOpen} message={toastMsg} variant={toastVariant} onClose={() => setToastOpen(false)} />
    </div>
  );
} 
