"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { tokenUtils } from "@/lib/api";
import {
  Utensils,
  Dumbbell,
  Activity as ActivityIcon,
  ChevronDown,
  ArrowRight,
  Target,
  Calendar,
  HeartPulse,
  Timer,
  Plus,
  Sparkles,
} from "lucide-react";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(tokenUtils.isLoggedIn());
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="relative h-64 sm:h-80 lg:h-[420px] rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&auto=format&fit=crop&w=1600&h=900"
            alt="新鮮食材與健康飲食的擺盤"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
            <div className="max-w-3xl text-white">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                AI 自動化分析
              </div>
              <h1 className="mt-1 sm:mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">輕鬆記錄飲食與運動，專注真正的變化</h1>
              <p className="mt-2 hidden sm:block text-sm sm:text-base text-white/90">簡潔流程、關鍵指標與一致體驗，幫助你穩定地前進。</p>
              <div className="mt-3 flex">
                {isLoggedIn ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm sm:text-base text-white hover:bg-emerald-700 transition-colors"
                    >
                      前往儀表板
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm sm:text-base text-white hover:bg-emerald-700 transition-colors"
                    >
                      立即開始
                    </Link>
                  </>
                )}
              </div>
            </div>
            {/* Scroll cue */}
            <a
              href="#how-it-works"
              aria-label="捲動到使用方式"
              className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 text-white text-xs sm:text-sm hover:text-white transition-colors rounded-full bg-black/35 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-0 px-2.5 py-1"
            >
              <ChevronDown className="h-4 w-4 animate-bounce" />
              瞭解如何開始
            </a>
          </div>
        </div>
      
        {/* Features */}
        <div className="mt-12 sm:mt-20 grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* 飲食紀錄 */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Utensils className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">飲食日記</h3>
                <p className="mt-1 text-sm text-gray-600">
                  記錄每一餐與營養素，掌握每日熱量與攝取比例。
                </p>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1">相片上傳</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1">營養分析</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1">熱量計算</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1">AI 自動分析</span>
                </div>
              </div>
            </div>
            <div className="mt-4 sm:mt-5 relative h-28 sm:h-36 md:h-40 rounded-lg overflow-hidden border border-gray-100">
              <Image
                src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&auto=format&fit=crop&w=1200&h=600"
                alt="健康餐盤與新鮮食材（AI 分析支援）"
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* 運動追蹤 */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">運動追蹤</h3>
                <p className="mt-1 text-sm text-gray-600">
                  支援有氧與重訓，追蹤表現與進度，讓訓練更有方向。
                </p>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1">多種運動</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1">有氧記錄</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1">表現趨勢</span>
                </div>
              </div>
            </div>
            <div className="mt-4 sm:mt-5 relative h-28 sm:h-36 md:h-40 rounded-lg overflow-hidden border border-gray-100">
              <Image
                src="https://images.unsplash.com/photo-1554344728-77cf90d9ed26?q=80&auto=format&fit=crop&w=1200&h=600"
                alt="健身與有氧訓練場景"
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* 個人健康數據 */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <ActivityIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">個人健康數據</h3>
                <p className="mt-1 text-sm text-gray-600">
                  以實用的指標呈現變化，專注長期追蹤而非短期波動。
                </p>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1">體重/體脂</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1">週期視圖</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1">關鍵指標</span>
                </div>
              </div>
            </div>
            <div className="mt-4 sm:mt-5 relative h-28 sm:h-36 md:h-40 rounded-lg overflow-hidden border border-gray-100">
              <Image
                src="https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&auto=format&fit=crop&w=1200&h=600"
                alt="健康與體態追蹤實拍"
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* How it works */}
        <div id="how-it-works" className="mt-10 sm:mt-16">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">如何開始</h2>
          <p className="mt-1 text-sm text-gray-600">三步驟完成：先記錄，再追蹤，持續達標。</p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {/* Step 1 */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 font-medium">1</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">記錄</div>
                  <div className="mt-1 text-xs text-gray-600">拍照上傳或快速輸入飲食/運動，約 10 秒完成。</div>
                  <div className="mt-2">
                    <Link href="/nutrition" className="inline-flex items-center text-emerald-700 hover:text-emerald-800 text-xs font-medium">
                      前往新增飲食
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            {/* Step 2 */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-medium">2</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">追蹤</div>
                  <div className="mt-1 text-xs text-gray-600">在儀表板查看熱量、營養與訓練趨勢。</div>
                  <div className="mt-2">
                    <Link href="/dashboard" className="inline-flex items-center text-blue-700 hover:text-blue-800 text-xs font-medium">
                      打開儀表板
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            {/* Step 3 */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-600 font-medium">3</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">達標</div>
                  <div className="mt-1 text-xs text-gray-600">規劃訓練課表與營養目標，持續優化節奏。</div>
                  <div className="mt-2">
                    <Link href="/schedule" className="inline-flex items-center text-purple-700 hover:text-purple-800 text-xs font-medium">
                      安排訓練課表
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product preview */}
        <div className="mt-12 sm:mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">產品預覽</h2>
            <p className="mt-2 text-gray-600">看看記錄與訓練的實際畫面，快速了解重點功能。</p>
          </div>
          <div className="mt-5 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="relative rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="absolute inset-0">
                <Image
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&auto=format&fit=crop&w=1200&h=900"
                  alt="飲食記錄預覽"
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="relative p-4 bg-gradient-to-t from-black/50 via-black/20 to-transparent">
                <div className="text-white text-sm font-medium">飲食記錄預覽</div>
                <div className="mt-1 text-white/90 text-xs">快速新增餐點、查看營養素與熱量</div>
              </div>
            </div>
            <div className="relative rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="absolute inset-0">
                <Image
                  src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&auto=format&fit=crop&w=1200&h=900"
                  alt="訓練追蹤預覽"
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="relative p-4 bg-gradient-to-t from-black/50 via-black/20 to-transparent">
                <div className="text-white text-sm font-medium">訓練追蹤預覽</div>
                <div className="mt-1 text-white/90 text-xs">選擇運動、開始計時、追蹤表現</div>
              </div>
            </div>
          </div>
        </div>
        {/* Pro features */}
        <div className="mt-16 sm:mt-24">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">專業功能</h2>
            <p className="mt-2 text-gray-600">以實用與效率為核心，從記錄到分析都更順手。</p>
          </div>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 text-gray-900">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                  <Target className="h-4 w-4" />
                </span>
                <div className="text-sm font-medium">營養目標</div>
              </div>
              <div className="mt-1 text-xs text-gray-600">設定熱量與宏量分配</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 text-gray-900">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                  <Calendar className="h-4 w-4" />
                </span>
                <div className="text-sm font-medium">訓練計畫</div>
              </div>
              <div className="mt-1 text-xs text-gray-600">週期化與課表管理</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 text-gray-900">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-purple-50 text-purple-600">
                  <HeartPulse className="h-4 w-4" />
                </span>
                <div className="text-sm font-medium">身體指標</div>
              </div>
              <div className="mt-1 text-xs text-gray-600">體重/體脂與週期視圖</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 text-gray-900">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-orange-50 text-orange-600">
                  <Timer className="h-4 w-4" />
                </span>
                <div className="text-sm font-medium">訓練計時</div>
              </div>
              <div className="mt-1 text-xs text-gray-600">訓練/休息一鍵切換</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 text-gray-900">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-cyan-50 text-cyan-600">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div className="text-sm font-medium">AI 自動分析</div>
              </div>
              <div className="mt-1 text-xs text-gray-600">上傳後即時解析營養與訓練數據</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 text-gray-900">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 text-gray-700">
                  <Plus className="h-4 w-4" />
                </span>
                <div className="text-sm font-medium">快速記錄</div>
              </div>
              <div className="mt-1 text-xs text-gray-600">相片上傳與便捷輸入</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
