export const dynamic = 'force-static';

import Link from 'next/link';
import { SearchX, Compass, Heart, Dumbbell } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-orange-50 text-orange-600 animate-bounce">
          <SearchX className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-3xl sm:text-4xl font-bold text-gray-900">哎呀，這頁面找不到</h1>
        <p className="mt-3 text-sm sm:text-base text-gray-600">
          路線似乎走偏了，不如回到首頁，繼續為更好的自己前進。
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-4 py-2.5 text-white hover:bg-orange-600 transition-colors"
          >
            返回首頁
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-gray-800 hover:bg-gray-50"
          >
            前往儀表板
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-gray-700">
          <div className="rounded-lg bg-white border border-gray-200 p-4">
            <div className="inline-flex items-center gap-2 text-gray-900">
              <Dumbbell className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">持續一點點</span>
            </div>
            <p className="mt-1 text-xs text-gray-600">今天也比昨天更接近目標。</p>
          </div>
          <div className="rounded-lg bg-white border border-gray-200 p-4">
            <div className="inline-flex items-center gap-2 text-gray-900">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">給自己鼓勵</span>
            </div>
            <p className="mt-1 text-xs text-gray-600">休息也是進步的一部分。</p>
          </div>
          <div className="rounded-lg bg-white border border-gray-200 p-4">
            <div className="inline-flex items-center gap-2 text-gray-900">
              <Compass className="h-4 w-4 text-cyan-600" />
              <span className="text-sm font-medium">調整方向</span>
            </div>
            <p className="mt-1 text-xs text-gray-600">回到首頁，重新規劃一下吧。</p>
          </div>
          <div className="rounded-lg bg-white border border-gray-200 p-4">
            <div className="inline-flex items-center gap-2 text-gray-900">
              <SearchX className="h-4 w-4 text-gray-700" />
              <span className="text-sm font-medium">需要協助？</span>
            </div>
            <p className="mt-1 text-xs text-gray-600">到 意見回饋 告訴我們問題。</p>
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          錯誤代碼：404 Not Found
        </div>
      </div>
    </div>
  );
}

