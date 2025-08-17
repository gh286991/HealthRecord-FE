'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { tokenUtils, UserProfile, UpdateUserData } from '@/lib/api';
import { useGetProfileQuery, useUpdateProfileMutation } from '@/lib/authApi';
import { useDispatch } from 'react-redux';
import { logout } from '@/lib/authSlice';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<UpdateUserData>({});
  const router = useRouter();
  const { data, isFetching, refetch } = useGetProfileQuery();
  const [updateProfile] = useUpdateProfileMutation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!tokenUtils.isLoggedIn()) {
      router.push('/login');
      return;
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    if (data) {
      setProfile(data);
      setFormData({
        name: data.name || '',
        bio: data.bio || '',
        gender: data.gender,
        birthday: data.birthday || '',
      });
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value || undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    setError('');
    setSuccess('');

    try {
      // 過濾掉空字串的欄位
      const submitData: UpdateUserData = {};
      if (formData.name?.trim()) submitData.name = formData.name;
      if (formData.bio?.trim()) submitData.bio = formData.bio;
      if (formData.gender) submitData.gender = formData.gender;
      if (formData.birthday) submitData.birthday = formData.birthday;

      const updatedProfile = await updateProfile(submitData).unwrap();
      setProfile(updatedProfile);
      setEditing(false);
      setSuccess('個人資料更新成功！');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err && 
        typeof err.response === 'object' && err.response !== null &&
        'data' in err.response && typeof err.response.data === 'object' &&
        err.response.data !== null && 'message' in err.response.data &&
        typeof err.response.data.message === 'string'
        ? err.response.data.message
        : '更新失敗，請稍後再試';
      setError(errorMessage);
    } finally {
      setUpdateLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '未設定';
    return new Date(dateString).toLocaleDateString('zh-TW');
  };

  const getGenderText = (gender?: string) => {
    switch (gender) {
      case 'male': return '男性';
      case 'female': return '女性';
      case 'other': return '其他';
      default: return '未設定';
    }
  };

  if (loading || isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">無法載入用戶資料</p>
          <button
            onClick={() => refetch()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            重試
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">個人資料</h1>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  編輯資料
                </button>
              )}
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
                {success}
              </div>
            )}

            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      用戶名
                    </label>
                    <input
                      type="text"
                      value={profile.username}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">用戶名無法修改</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      信箱
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">信箱無法修改</p>
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      姓名
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                      性別
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">請選擇</option>
                      <option value="male">男性</option>
                      <option value="female">女性</option>
                      <option value="other">其他</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 mb-2">
                      生日
                    </label>
                    <input
                      id="birthday"
                      name="birthday"
                      type="date"
                      value={formData.birthday || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                      個人簡介
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      value={formData.bio || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setError('');
                      setSuccess('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {updateLoading ? '更新中...' : '儲存'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      用戶名
                    </label>
                    <p className="text-gray-900">{profile.username}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      信箱
                    </label>
                    <p className="text-gray-900">{profile.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      姓名
                    </label>
                    <p className="text-gray-900">{profile.name || '未設定'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      性別
                    </label>
                    <p className="text-gray-900">{getGenderText(profile.gender)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      生日
                    </label>
                    <p className="text-gray-900">{formatDate(profile.birthday)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      註冊時間
                    </label>
                    <p className="text-gray-900">{formatDate(profile.createdAt)}</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      個人簡介
                    </label>
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {profile.bio || '未設定'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 