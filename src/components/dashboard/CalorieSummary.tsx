
import Card from '@/components/Card';
import React, { useState } from 'react';
import Link from 'next/link';

interface CalorieSummaryProps {
  tdee: number;
  consumed: number;
  bmr: number;
  activityLevel: string;
  activityMultiplier: number;
}

const activityLevelMap: Record<string, string> = {
  sedentary: '久坐',
  lightly_active: '輕度活躍',
  moderately_active: '中度活躍',
  very_active: '非常活躍',
  extra_active: '極度活躍',
};

const CalorieSummary: React.FC<CalorieSummaryProps> = ({ tdee, consumed, bmr, activityLevel, activityMultiplier }) => {
  const [detailsVisible, setDetailsVisible] = useState(false);

  if (tdee <= 0) {
    return (
      <Card className="p-6 text-center">
        <h2 className="text-base font-medium text-gray-700 mb-4">計算您的每日熱量目標</h2>
        <p className="text-sm text-gray-600 mb-6">
          請先到「個人資料」頁面填寫身高、體重、生日、性別與活動等級，以便我們為您計算每日建議攝取熱量。
        </p>
        <Link href="/profile">
          <a className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
            前往個人資料
          </a>
        </Link>
      </Card>
    );
  }

  const percentage = (consumed / tdee) * 100;
  const remaining = tdee - consumed;

  return (
    <Card className="overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-base font-medium text-gray-700">今日熱量</h2>
        <button onClick={() => setDetailsVisible(!detailsVisible)} className="p-1 text-gray-400 hover:text-blue-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      <div className="p-6 space-y-4">
        <div className="relative w-full h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-blue-500"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-500">已攝取</p>
            <p className="text-2xl font-bold text-green-600">{Math.round(consumed)}</p>
            <p className="text-xs text-gray-400">大卡</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">剩餘</p>
            <p className="text-2xl font-bold text-gray-800">{Math.round(remaining)}</p>
            <p className="text-xs text-gray-400">大卡</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">目標</p>
            <p className="text-2xl font-bold text-gray-500">{Math.round(tdee)}</p>
            <p className="text-xs text-gray-400">大卡</p>
          </div>
        </div>
        {detailsVisible && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 space-y-2">
            <h3 className="font-bold text-base mb-2">每日熱量目標 (TDEE) 如何計算？</h3>
            <div className="flex justify-between">
              <span>基礎代謝率 (BMR)</span>
              <span className="font-mono">{Math.round(bmr)} kcal</span>
            </div>
            <div className="flex justify-between">
              <span>活動等級 ({activityLevelMap[activityLevel] || activityLevel})</span>
              <span className="font-mono">x {activityMultiplier}</span>
            </div>
            <hr className="border-blue-200" />
            <div className="flex justify-between font-bold">
              <span>總熱量消耗 (TDEE)</span>
              <span className="font-mono">{Math.round(tdee)} kcal</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CalorieSummary;
