'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { tokenUtils, UserProfile, UpdateUserData, ActivityLevel, Goal } from '@/lib/api';
import { useGetProfileQuery, useUpdateProfileMutation } from '@/lib/authApi';
import Button from '@/components/Button';
import Toast from '@/components/Toast';
import ProfileTabs from '@/components/profile/ProfileTabs';
import AddBodyRecordForm from '@/components/profile/AddBodyRecordForm';
import BodyRecordHistory from '@/components/profile/BodyRecordHistory';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<UpdateUserData>>({});
  const router = useRouter();
  const { data, isFetching, refetch } = useGetProfileQuery();
  const [updateProfile] = useUpdateProfileMutation();
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<'default'|'success'|'error'>('default');
  const [activeTab, setActiveTab] = useState(0);

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
        height: data.height || undefined,
        weight: data.weight || undefined,
        activityLevel: data.activityLevel || undefined,
        goal: data.goal || undefined,
      });
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // 處理數字類型的欄位
    if (name === 'height' || name === 'weight') {
      const numValue = value === '' ? undefined : Number(value);
      setFormData(prev => ({
        ...prev,
        [name]: numValue,
      }));
    } else if (name === 'gender') {
      setFormData(prev => ({
        ...prev,
        gender: value as 'male' | 'female' | 'other' | undefined,
      }));
    } else if (name === 'activityLevel') {
      setFormData(prev => ({
        ...prev,
        activityLevel: value as ActivityLevel | undefined,
      }));
    } else if (name === 'goal') {
      setFormData(prev => ({
        ...prev,
        goal: value as Goal | undefined,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);

    try {
      // 準備要送出的資料，移除值為 undefined 和空字串的欄位
      const submitData: Partial<UpdateUserData> = {};
      
      // 手動處理每個欄位，確保類型安全
      if (formData.name !== undefined && formData.name !== '') {
        submitData.name = formData.name;
      }
      if (formData.bio !== undefined && formData.bio !== '') {
        submitData.bio = formData.bio;
      }
      if (formData.gender !== undefined) {
        submitData.gender = formData.gender;
      }
      if (formData.birthday !== undefined && formData.birthday !== '') {
        submitData.birthday = formData.birthday;
      }
      if (formData.height !== undefined) {
        submitData.height = formData.height;
      }
      if (formData.weight !== undefined) {
        submitData.weight = formData.weight;
      }
      if (formData.activityLevel !== undefined) {
        submitData.activityLevel = formData.activityLevel;
      }
      if (formData.goal !== undefined) {
        submitData.goal = formData.goal;
      }

      const updatedProfile = await updateProfile(submitData).unwrap();
      setProfile(updatedProfile);
      setEditing(false);

      setToastVariant('success');
      setToastMsg('個人資料已更新');
      setToastOpen(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err && 
        typeof err.response === 'object' && err.response !== null &&
        'data' in err.response && typeof err.response.data === 'object' &&
        err.response.data !== null && 'message' in err.response.data &&
        typeof err.response.data.message === 'string'
        ? err.response.data.message
        : '更新失敗，請稍後再試';
      setToastVariant('error');
      setToastMsg(errorMessage);
      setToastOpen(true);
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

  const getActivityLevelText = (level?: ActivityLevel) => {
    switch (level) {
      case ActivityLevel.SEDENTARY: return '久坐 (很少或沒有運動)';
      case ActivityLevel.LIGHTLY_ACTIVE: return '輕度活躍 (每週輕度運動 1-3 天)';
      case ActivityLevel.MODERATELY_ACTIVE: return '中度活躍 (每週中度運動 3-5 天)';
      case ActivityLevel.VERY_ACTIVE: return '非常活躍 (每週高強度運動 6-7 天)';
      case ActivityLevel.EXTRA_ACTIVE: return '極度活躍 (高強度運動 & 體力勞動或每天訓練兩次)';
      default: return '未設定';
    }
  };

  const getGoalText = (goal?: Goal) => {
    switch (goal) {
      case Goal.WEIGHT_LOSS: return '減重';
      case Goal.MAINTAIN: return '維持';
      case Goal.MUSCLE_GAIN: return '增肌';
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

  const tabs = [
    {
      name: '個人檔案',
      content: (
        <>
          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 基本資訊 */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">基本資訊</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      用戶名
                    </label>
                    <input
                      type="text"
                      value={profile.username}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* 身體測量 */}
              <div className="space-y-6 mt-8">
                <h2 className="text-xl font-semibold text-gray-900">身體測量與目標</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">
                      身高 (公分)
                    </label>
                    <input
                      id="height"
                      name="height"
                      type="number"
                      value={formData.height || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700 mb-2">
                      活動量
                    </label>
                    <select
                      id="activityLevel"
                      name="activityLevel"
                      value={formData.activityLevel || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    >
                      <option value="">請選擇</option>
                      <option value={ActivityLevel.SEDENTARY}>久坐 (很少或沒有運動)</option>
                      <option value={ActivityLevel.LIGHTLY_ACTIVE}>輕度活躍 (每週輕度運動 1-3 天)</option>
                      <option value={ActivityLevel.MODERATELY_ACTIVE}>中度活躍 (每週中度運動 3-5 天)</option>
                      <option value={ActivityLevel.VERY_ACTIVE}>非常活躍 (每週高強度運動 6-7 天)</option>
                      <option value={ActivityLevel.EXTRA_ACTIVE}>極度活躍 (高強度運動 & 體力勞動或每天訓練兩次)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-2">
                      目標
                    </label>
                    <select
                      id="goal"
                      name="goal"
                      value={formData.goal || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    >
                      <option value="">請選擇</option>
                      <option value={Goal.WEIGHT_LOSS}>減重</option>
                      <option value={Goal.MAINTAIN}>維持</option>
                      <option value={Goal.MUSCLE_GAIN}>增肌</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setEditing(false);
                    // 重置表單數據到 profile 的原始數據
                    setFormData({
                      name: profile.name || '',
                      bio: profile.bio || '',
                      gender: profile.gender,
                      birthday: profile.birthday || '',
                      height: profile.height || undefined,
                      weight: profile.weight || undefined,
                      activityLevel: profile.activityLevel || undefined,
                      goal: profile.goal || undefined,
                    });
                  }}
                >
                  取消
                </Button>
                <Button type="submit" disabled={updateLoading}>
                  {updateLoading ? '更新中...' : '儲存'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {/* 基本資訊 */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">基本資訊</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">用戶名</span>
                    <span className="text-gray-900">{profile.username}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">信箱</span>
                    <span className="text-gray-900">{profile.email}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">姓名</span>
                    <span className="text-gray-900">{profile.name || '未設定'}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">性別</span>
                    <span className="text-gray-900">{getGenderText(profile.gender)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">生日</span>
                    <span className="text-gray-900">{formatDate(profile.birthday)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">註冊時間</span>
                    <span className="text-gray-900">{formatDate(profile.createdAt)}</span>
                  </div>

                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-700">個人簡介</span>
                    <p className="text-gray-900 whitespace-pre-wrap mt-2">
                      {profile.bio || '未設定'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 身體測量 */}
              <div className="space-y-6 mt-8">
                <h2 className="text-xl font-semibold text-gray-900">身體測量與目標</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">身高</span>
                    <span className="text-gray-900">{profile.height ? `${profile.height} 公分` : '未設定'}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">體重</span>
                    <span className="text-gray-900">{profile.weight ? `${profile.weight} 公斤` : '未設定'}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">活動量</span>
                    <span className="text-gray-900">{getActivityLevelText(profile.activityLevel)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">目標</span>
                    <span className="text-gray-900">{getGoalText(profile.goal)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ),
    },
    {
      name: '身體記錄',
      content: (
        <div className="space-y-6">
          <AddBodyRecordForm />
          <BodyRecordHistory />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <ProfileTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
          {activeTab === 0 && !editing && (
            <Button onClick={() => setEditing(true)}>編輯資料</Button>
          )}
        </div>
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {tabs[activeTab].content}
          </div>
        </div>
      </div>
      <Toast open={toastOpen} message={toastMsg} variant={toastVariant} onClose={() => setToastOpen(false)} />
    </div>
  );
}