import Link from "next/link";
import { Mail, Github, Globe, Twitter } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div>
            <div className="text-sm font-semibold text-gray-900">產品</div>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li><Link href="/dashboard" className="hover:text-gray-900">儀表板</Link></li>
              <li><Link href="/nutrition" className="hover:text-gray-900">飲食紀錄</Link></li>
              <li><Link href="/workout" className="hover:text-gray-900">健身紀錄</Link></li>
              <li><Link href="/schedule" className="hover:text-gray-900">課表安排</Link></li>
              <li><Link href="/profile" className="hover:text-gray-900">個人資料</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold text-gray-900">資源</div>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li><Link href="/login" className="hover:text-gray-900">登入</Link></li>
              <li><Link href="/register" className="hover:text-gray-900">建立帳號</Link></li>
              <li><a href="#how-it-works" className="hover:text-gray-900">如何開始</a></li>
              <li><a href="#" className="pointer-events-none text-gray-400" aria-disabled>常見問題（即將推出）</a></li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold text-gray-900">公司</div>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-gray-900">關於我們</a></li>
              <li><a href="#" className="hover:text-gray-900">更新日誌</a></li>
              <li><a href="#" className="hover:text-gray-900">聯絡我們</a></li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold text-gray-900">法務</div>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-gray-900">隱私權政策</a></li>
              <li><a href="#" className="hover:text-gray-900">服務條款</a></li>
              <li><a href="#" className="hover:text-gray-900">Cookie 政策</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">© {year} 健康管理系統 · Health Pro</div>
          <div className="flex items-center gap-4 text-gray-600">
            <a href="mailto:hello@example.com" aria-label="Email" className="hover:text-gray-900"><Mail className="h-5 w-5"/></a>
            <a href="#" aria-label="Website" className="hover:text-gray-900"><Globe className="h-5 w-5"/></a>
            <a href="#" aria-label="GitHub" className="hover:text-gray-900"><Github className="h-5 w-5"/></a>
            <a href="#" aria-label="Twitter" className="hover:text-gray-900"><Twitter className="h-5 w-5"/></a>
          </div>
        </div>
      </div>
    </footer>
  );
}

