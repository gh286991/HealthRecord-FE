'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RegisterData } from '@/lib/api';
import { useRegisterMutation } from '@/lib/authApi';
import Button from '@/components/Button';
import Toast from '@/components/Toast';

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
      setToastVariant('success');
      setToastMsg('註冊成功！請前往登入');
      setToastOpen(true);
      setTimeout(() => router.push('/login'), 600);
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? '註冊中...' : '註冊'}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <Toast open={toastOpen} message={toastMsg} variant={toastVariant} onClose={() => setToastOpen(false)} />
    </div>
  );
} 