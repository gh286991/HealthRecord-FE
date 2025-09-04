'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { tokenUtils } from '@/lib/api';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(tokenUtils.isLoggedIn());
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(16,185,129,0.1), transparent 70%)' }}></div>
        <div className="relative z-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl leading-tight">
            <span className="block">健康生活</span>
            <span className="block text-gradient bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              從今天開始
            </span>
          </h1>
          <p className="mt-8 max-w-3xl mx-auto text-xl text-gray-600 leading-relaxed">
            輕鬆管理您的健康！精準計算每日熱量需求，追蹤飲食、記錄運動，並透過個人化數據分析，助您達成健康目標。
          </p>
        </div>

        {/* Feature Cards */}
        <div className="mt-24">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {/* 飲食紀錄 */}
            <div className="bg-white/80 backdrop-blur-sm overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3">
              <div className="p-10">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl flex items-center justify-center">
                      <span className="text-2xl">🍎</span>
                    </div>
                  </div>
                  <div className="ml-6">
                    <h3 className="text-2xl font-semibold text-gray-900">飲食日記</h3>
                  </div>
                </div>
                <div className="mt-8">
                  <p className="text-gray-600 leading-relaxed">
                    輕鬆記錄每一餐，根據您的個人數據精準計算卡路里攝取，並分析營養成分。
                  </p>
                  <div className="mt-6 flex items-center text-sm text-green-600">
                    <span className="font-medium">📸 拍照記錄</span>
                    <span className="mx-2">•</span>
                    <span className="font-medium">📊 營養分析</span>
                    <span className="mx-2">•</span>
                    <span className="font-medium">🔥 熱量計算</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 運動追蹤 */}
            <div className="bg-white/80 backdrop-blur-sm overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3">
              <div className="p-10">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center">
                      <span className="text-2xl">🏋️</span>
                    </div>
                  </div>
                  <div className="ml-6">
                    <h3 className="text-2xl font-semibold text-gray-900">運動追蹤</h3>
                  </div>
                </div>
                <div className="mt-8">
                  <p className="text-gray-600 leading-relaxed">
                    記錄多種運動類型，包含有氧與重訓，追蹤您的運動表現與體能變化。
                  </p>
                  <div className="mt-6 flex items-center text-sm text-blue-600">
                    <span className="font-medium">💪 多種運動</span>
                    <span className="mx-2">•</span>
                    <span className="font-medium">🏃 有氧追蹤</span>
                    <span className="mx-2">•</span>
                    <span className="font-medium">📈 表現分析</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 個人健康數據 */}
            <div className="bg-white/80 backdrop-blur-sm overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3">
              <div className="p-10">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center">
                      <span className="text-2xl">📊</span>
                    </div>
                  </div>
                  <div className="ml-6">
                    <h3 className="text-2xl font-semibold text-gray-900">個人健康數據</h3>
                  </div>
                </div>
                <div className="mt-8">
                  <p className="text-gray-600 leading-relaxed">
                    管理您的身高、體重、活動量等關鍵指標，這些數據將用於精準的熱量與運動建議。
                  </p>
                  <div className="mt-6 flex items-center text-sm text-purple-600">
                    <span className="font-medium">📏 身高體重</span>
                    <span className="mx-2">•</span>
                    <span className="font-medium">🏃 活動量</span>
                    <span className="mx-2">•</span>
                    <span className="font-medium">📈 數據整合</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          {isLoggedIn ? (
            <div className="space-y-8">
              <h2 className="text-4xl font-bold text-gray-900">歡迎回來！</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                繼續你的健康旅程，記錄今天的飲食和運動吧！
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  href="/profile"
                  className="inline-flex items-center px-10 py-5 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  我的資料
                </Link>
                <Link
                  href="/nutrition"
                  className="inline-flex items-center px-10 py-5 border border-gray-300 text-lg font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  新增紀錄
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <h2 className="text-4xl font-bold text-gray-900">開始你的健康之旅</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                加入我們，與朋友一起建立健康的生活習慣，每天進步一點點！
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  href="/register"
                  className="inline-flex items-center px-10 py-5 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  立即註冊
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center px-10 py-5 border border-gray-300 text-lg font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  立即登入
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Benefits Section */}
        <div className="mt-28">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-gray-900 mb-5">為什麼選擇我們？</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              簡單易用的界面，強大的功能，讓健康管理變得輕鬆愉快
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">簡單易用</h3>
              <p className="text-gray-600">直觀的操作界面，幾秒鐘就能完成記錄</p>
            </div>

            <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">數據分析</h3>
              <p className="text-gray-600">詳細的圖表分析，清楚看見進步軌跡</p>
            </div>

            <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🏆</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">成就系統</h3>
              <p className="text-gray-600">完成目標獲得徽章，讓堅持更有成就感</p>
            </div>

            <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">❤️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">社群支持</h3>
              <p className="text-gray-600">與志同道合的朋友一起努力，互相激勵</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
