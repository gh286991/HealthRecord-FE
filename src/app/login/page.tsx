'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LoginData } from '@/lib/api';
import { useLoginMutation } from '@/lib/authApi';
import { useDispatch } from 'react-redux';
import { setToken, setUser } from '@/lib/authSlice';
import Button from '@/components/Button';
import Toast from '@/components/Toast';

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginData>({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const [login] = useLoginMutation();
  const dispatch = useDispatch();
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<'default'|'success'|'error'>('default');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (error) {
      setError('');
    }
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(formData).unwrap();
      dispatch(setToken(response.accessToken));
      if (response.user) dispatch(setUser(response.user));
      setToastVariant('success');
      setToastMsg('登入成功');
      setToastOpen(true);
      setTimeout(() => router.push('/dashboard'), 400);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err && 
        typeof err.response === 'object' && err.response !== null &&
        'data' in err.response && typeof err.response.data === 'object' &&
        err.response.data !== null && 'message' in err.response.data &&
        typeof err.response.data.message === 'string'
        ? err.response.data.message
        : '登入失敗，請檢查用戶名和密碼';
      setError(errorMessage);
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
          登入您的帳戶
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          或{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            建立新帳戶
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                用戶名
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密碼
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
            </div>

            <div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? '登入中...' : '登入'}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">測試帳戶</span>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-4 rounded">
              <p className="font-medium">您可以使用以下測試資料：</p>
              <p>用戶名：john_doe</p>
              <p>密碼：password123</p>
              <p className="text-xs mt-2 text-gray-500">
                （如果您還沒有帳戶，請先註冊）
              </p>
            </div>
          </div>
        </div>
      </div>
      <Toast open={toastOpen} message={toastMsg} variant={toastVariant} onClose={() => setToastOpen(false)} />
    </div>
  );
} 