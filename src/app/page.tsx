'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { tokenUtils } from '@/lib/api';
import { ArrowRight, BarChart, BookOpen, Dumbbell, Users, Target, CalendarCheck, Sparkles } from 'lucide-react';

const FeatureCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-5">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{children}</p>
  </div>
);

const HowItWorksStep = ({ number, title, children }: { number: string, title: string, children: React.ReactNode }) => (
  <div className="flex">
    <div className="flex flex-col items-center mr-6">
      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
        {number}
      </div>
      <div className="w-px h-full bg-gray-200"></div>
    </div>
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-600">{children}</p>
    </div>
  </div>
);

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(tokenUtils.isLoggedIn());
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Hero Section */}
      <main className="relative pt-24 pb-28 text-center overflow-hidden bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900">
            你的健康，你的故事。
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-600">
            不僅是個人紀錄，更是與夥伴一同成長的旅程。加入挑戰、分享進步，讓健康不再是一個人堅持。
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <Link
              href={isLoggedIn ? '/nutrition' : '/register'}
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
            >
              {isLoggedIn ? '開始今日挑戰' : '免費加入'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <p className="text-sm text-gray-500">已有超過 10,000 名使用者在此共同進步</p>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">一個為你而生的健康社群</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">從個人化訓練到團隊合作，我們提供你所需的一切。</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard icon={<Target size={24} />} title="智慧課表">
              無論目標是增肌或減脂，我們為你打造專屬課表，讓訓練更科學、更有效。
            </FeatureCard>
            <FeatureCard icon={<Users size={24} />} title="團隊挑戰">
              與朋友組隊，共同完成目標。互相激勵，讓汗水變得更有趣。
            </FeatureCard>
            <FeatureCard icon={<Sparkles size={24} />} title="社群分享">
              在我們的社群中分享你的成果與心得，從他人的經驗中獲得靈感。
            </FeatureCard>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">只需四步，開啟你的蛻變之旅</h2>
          </div>
          <div className="flex flex-col gap-8">
            <HowItWorksStep number="1" title="設定你的目標">
              告訴我們你的期望，無論是體重、體態還是運動表現，我們將為你指明方向。
            </HowItWorksStep>
            <HowItWorksStep number="2" title="遵循個人化計畫">
              取得你的專屬飲食建議與訓練課表，每天的任務都一目了然。
            </HowItWorksStep>
            <HowItWorksStep number="3" title="追蹤並分析進度">
              輕鬆記錄你的數據，透過直觀的圖表看見自己的每一步成長。
            </HowItWorksStep>
            <HowItWorksStep number="4" title="分享與慶祝成就">
              與社群分享你的喜悅，完成挑戰並獲得徽章，激勵自己和他人不斷前行。
            </HowItWorksStep>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 mx-auto">
            <Users size={32} />
          </div>
          <p className="text-2xl font-medium text-gray-900">
            “HealthProJ 徹底改變了我對健身的看法。和團隊一起訓練，我不再感到孤單，也更有動力堅持下去。”
          </p>
          <footer className="mt-6">
            <p className="font-semibold text-gray-800">陳先生</p>
            <p className="text-gray-500">台北</p>
          </footer>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight">準備好迎接更健康的自己了嗎？</h2>
          <p className="mt-4 text-lg text-blue-100">立即加入 HealthProJ，與數萬名使用者一起，開始你的健康新篇章。</p>
          <div className="mt-8">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-blue-600 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-lg"
            >
              免費註冊，即刻開始
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-800 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; {new Date().getFullYear()} HealthProJ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
