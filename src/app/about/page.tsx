import Link from "next/link";
import { BRAND_NAME, TAGLINE, SUPPORT_EMAIL } from "@/config/brand";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">關於我們</h1>
        <p className="mt-2 text-sm text-gray-600">{BRAND_NAME} - {TAGLINE}</p>
      </div>

      <div className="prose prose-sm max-w-none space-y-6 text-gray-700">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">我們的使命</h2>
          <p>
            {BRAND_NAME} 致力於提供一個簡單、直觀且有效的健康記錄管理平台，
            幫助您追蹤飲食、運動和健康數據，建立更好的生活習慣。
          </p>
          <p>
            我們相信，透過持續的記錄和追蹤，每個人都能夠更了解自己的身體狀況，
            做出更健康的選擇，達到理想的健康目標。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">我們的服務</h2>
          <p>{BRAND_NAME} 提供以下核心功能：</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>飲食記錄：</strong>詳細記錄每餐的營養成分，追蹤每日攝取量</li>
            <li><strong>健身記錄：</strong>記錄運動類型和強度，追蹤訓練進度</li>
            <li><strong>身體指標：</strong>記錄身高、體重等健康數據</li>
            <li><strong>數據分析：</strong>提供營養和運動數據的分析與洞察</li>
            <li><strong>AI 輔助：</strong>智能分析飲食照片，提供營養建議（如適用）</li>
            <li><strong>跨裝置同步：</strong>透過 PWA 技術，在任何裝置上都能使用</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">開發背景</h2>
          <p>
            {BRAND_NAME} 是由個人開發者基於對健康管理的熱忱而開發的專案。
            我們使用現代化的技術棧，包括 Next.js、NestJS、MongoDB 等，
            確保服務的穩定性和可擴展性。
          </p>
          <p>
            作為一個正在成長的專案，我們持續改進功能和使用體驗，
            您的反饋對我們來說非常寶貴。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">我們的承諾</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>隱私保護：</strong>您的個人資料和健康數據都受到嚴格保護，我們絕不會將其出售給第三方</li>
            <li><strong>資料安全：</strong>使用加密技術和最佳實踐，確保您的資料安全</li>
            <li><strong>持續改進：</strong>根據用戶反饋持續優化功能和體驗</li>
            <li><strong>透明度：</strong>清楚說明我們如何處理您的資料和使用服務</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">重要聲明</h2>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="font-semibold text-red-800 mb-2">
              ⚠️ 醫療免責聲明
            </p>
            <p className="text-red-700 text-sm">
              {BRAND_NAME} 僅提供健康記錄管理工具，不提供醫療診斷、治療建議或醫療諮詢。
              本服務中的任何資訊、數據分析或建議都不應取代專業醫療建議。
              在做出任何健康相關決定前，請務必諮詢合格的醫療專業人員。
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">聯絡我們</h2>
          <p>我們非常重視您的意見和建議。如有任何問題，歡迎與我們聯絡：</p>
          <ul className="list-none pl-0 space-y-3 mt-4">
            <li>
              <strong className="text-gray-900">電子郵件：</strong>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-orange-600 hover:text-orange-700 ml-2">
                {SUPPORT_EMAIL}
              </a>
            </li>
            <li>
              <strong className="text-gray-900">意見回饋：</strong>
              <Link href="/feedback" className="text-orange-600 hover:text-orange-700 ml-2">
                前往意見回饋頁面
              </Link>
            </li>
          </ul>
          <p className="mt-4 text-sm text-gray-600">
            我們會盡快回覆您的來信，通常會在 3-5 個工作天內回覆。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">相關資訊</h2>
          <ul className="list-none pl-0 space-y-2">
            <li>
              <Link href="/privacy" className="text-orange-600 hover:text-orange-700">
                → 隱私權政策
              </Link>
            </li>
            <li>
              <Link href={`${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://devhealthjapi.zeabur.app'}/terms/latest`} className="text-orange-600 hover:text-orange-700">
                → 服務條款
              </Link>
            </li>
            <li>
              <Link href="/cookies" className="text-orange-600 hover:text-orange-700">
                → Cookie 政策
              </Link>
            </li>
          </ul>
        </section>

        <section className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} {BRAND_NAME} · {TAGLINE}
          </p>
        </section>
      </div>
    </div>
  );
}
