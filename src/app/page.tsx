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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 sm:text-6xl md:text-7xl">
            <span className="block">健康生活</span>
            <span className="block text-gradient bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              從今天開始
            </span>
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-600 leading-relaxed">
            記錄你的飲食、追蹤健身進度，與朋友一起建立健康習慣。讓每一天都成為更好自己的開始。
          </p>
        </div>

        {/* Feature Cards */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* 飲食紀錄 */}
            <div className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="p-8">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-6">
                    <h3 className="text-2xl font-bold text-gray-900">飲食日記</h3>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-gray-600 leading-relaxed">
                    輕鬆記錄每一餐，追蹤卡路里攝取，分析營養成分。拍照上傳，讓健康飲食變得簡單有趣。
                  </p>
                  <div className="mt-4 flex items-center text-sm text-green-600">
                    <span className="font-medium">📸 拍照記錄</span>
                    <span className="mx-2">•</span>
                    <span className="font-medium">📊 營養分析</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 健身紀錄 */}
            <div className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="p-8">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-6">
                    <h3 className="text-2xl font-bold text-gray-900">運動追蹤</h3>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-gray-600 leading-relaxed">
                    記錄運動類型、時間和強度，追蹤體重變化，建立個人化的健身計劃和目標。
                  </p>
                  <div className="mt-4 flex items-center text-sm text-blue-600">
                    <span className="font-medium">💪 多種運動</span>
                    <span className="mx-2">•</span>
                    <span className="font-medium">🎯 目標設定</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 社交功能 */}
            <div className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="p-8">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-6">
                    <h3 className="text-2xl font-bold text-gray-900">朋友圈</h3>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-gray-600 leading-relaxed">
                    與朋友分享健康成果，互相鼓勵打氣，一起挑戰健康目標，讓健康生活更有動力。
                  </p>
                  <div className="mt-4 flex items-center text-sm text-purple-600">
                    <span className="font-medium">👥 好友互動</span>
                    <span className="mx-2">•</span>
                    <span className="font-medium">🏆 群組挑戰</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          {isLoggedIn ? (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">歡迎回來！</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                繼續你的健康旅程，記錄今天的飲食和運動吧！
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/profile"
                  className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  我的資料
                </Link>
                <Link
                  href="/nutrition"
                  className="inline-flex items-center px-8 py-4 border border-gray-300 text-lg font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  新增紀錄
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">開始你的健康之旅</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                加入我們，與朋友一起建立健康的生活習慣，每天進步一點點！
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  立即註冊
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center px-8 py-4 border border-gray-300 text-lg font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  立即登入
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Benefits Section */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">為什麼選擇我們？</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              簡單易用的界面，強大的功能，讓健康管理變得輕鬆愉快
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">簡單易用</h3>
              <p className="text-gray-600">直觀的操作界面，幾秒鐘就能完成記錄</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">數據分析</h3>
              <p className="text-gray-600">詳細的圖表分析，清楚看見進步軌跡</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">成就系統</h3>
              <p className="text-gray-600">完成目標獲得徽章，讓堅持更有成就感</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">❤️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">社群支持</h3>
              <p className="text-gray-600">與志同道合的朋友一起努力，互相激勵</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
