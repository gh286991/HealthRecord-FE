'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGetUserProfileQuery, useUpdateUserProfileMutation } from '@/store/api/healthApi';
import { useAppDispatch, useIsAuthenticated } from '@/store/hooks';
import { addNotification, setUser } from '@/store/slices/uiSlice';
import type { UpdateUserData } from '@/types';

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<UpdateUserData>({});
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useIsAuthenticated();

  // RTK Query hooks
  const { 
    data: profile, 
    isLoading: loading, 
    error: profileError, 
    refetch 
  } = useGetUserProfileQuery(undefined, {
    skip: !isAuthenticated
  });
  
  const [updateProfile, { isLoading: updateLoading }] = useUpdateUserProfileMutation();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
        gender: profile.gender,
        birthday: profile.birthday || '',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value || undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      
      // 更新 Redux 中的用戶資料
      dispatch(setUser(updatedProfile));
      
      setEditing(false);
      setSuccess('個人資料更新成功！');
      
      dispatch(addNotification({
        type: 'success',
        message: '✅ 個人資料更新成功！',
      }));
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'message' in err && typeof err.message === 'string'
        ? err.message
        : '更新失敗，請稍後再試';
      setError(errorMessage);
      
      dispatch(addNotification({
        type: 'error',
        message: `❌ ${errorMessage}`,
      }));
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (profileError || !profile) {
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
                      自我介紹
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      value={formData.bio || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="介紹一下自己..."
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {updateLoading ? '更新中...' : '儲存'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">用戶名</label>
                    <p className="text-lg">{profile.username}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">信箱</label>
                    <p className="text-lg">{profile.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">姓名</label>
                    <p className="text-lg">{profile.name || '未設定'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">性別</label>
                    <p className="text-lg">{getGenderText(profile.gender)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">生日</label>
                    <p className="text-lg">{formatDate(profile.birthday)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">註冊時間</label>
                    <p className="text-lg">{formatDate(profile.createdAt)}</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">自我介紹</label>
                    <p className="text-lg whitespace-pre-wrap bg-gray-50 p-4 rounded-md">
                      {profile.bio || '尚未填寫自我介紹'}
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