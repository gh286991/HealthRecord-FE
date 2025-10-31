import Link from "next/link";
import { SUPPORT_EMAIL } from "@/config/brand";

export default function CookiesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Cookie 政策</h1>
        <p className="mt-2 text-sm text-gray-600">最後更新日期：2024年12月</p>
      </div>

      <div className="prose prose-sm max-w-none space-y-6 text-gray-700">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. 什麼是 Cookie？</h2>
          <p>
            Cookie 是網站存放在您的瀏覽器中的小型文字檔案。當您造訪網站時，網站會在您的裝置上儲存 Cookie，
            以便在您下次造訪時識別您的裝置，並記住您的偏好設定。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. 我們如何使用 Cookie？</h2>
          <p>我們使用 Cookie 來：</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>維持您的登入狀態</li>
            <li>記住您的偏好設定（如語言、主題等）</li>
            <li>提供個人化的使用體驗</li>
            <li>分析網站使用情況（匿名化）</li>
            <li>改善服務品質和安全性</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Cookie 類型</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">3.1 必要 Cookie</h3>
          <p>
            這些 Cookie 是網站正常運作所必需的，無法關閉。它們通常只會針對您的操作（如登入、設定偏好）而設定。
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>身份驗證 Cookie：</strong>維持您的登入狀態</li>
            <li><strong>安全性 Cookie：</strong>保護您的帳號安全</li>
            <li><strong>會話 Cookie：</strong>記住您在使用過程中的操作</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">3.2 功能性 Cookie</h3>
          <p>
            這些 Cookie 讓我們記住您的選擇和偏好，提供更個人化的體驗。
            如果您關閉這些 Cookie，部分功能可能無法正常運作。
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>偏好設定 Cookie：</strong>記住您的語言、主題等設定</li>
            <li><strong>本地儲存：</strong>使用 localStorage 儲存應用程式狀態</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">3.3 分析 Cookie（如適用）</h3>
          <p>
            這些 Cookie 幫助我們了解網站的使用情況，例如哪些頁面最受歡迎、用戶如何使用網站等。
            這些資料都是匿名化的，不會識別您的個人身份。
          </p>
          <p className="text-sm text-gray-600 mt-2">
            <em>注意：目前本服務可能尚未啟用第三方分析服務（如 Google Analytics），如有啟用將另行通知。</em>
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">3.4 行銷 Cookie（目前未使用）</h3>
          <p>
            本服務目前不使用行銷或廣告追蹤 Cookie。如未來使用，我們會另行通知並徵求您的同意。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. 第三方 Cookie</h2>
          <p>
            本服務可能使用以下第三方服務，它們可能會設置自己的 Cookie：
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>身份驗證服務：</strong>如 Google OAuth（用於第三方登入）</li>
            <li><strong>雲端服務：</strong>用於資料儲存和同步</li>
          </ul>
          <p className="mt-2">
            這些第三方服務有各自的隱私權政策。我們建議您查看這些政策，了解它們如何使用 Cookie。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. 如何管理 Cookie？</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">5.1 透過網站設定</h3>
          <p>
            當您首次造訪本網站時，會看到 Cookie 同意橫幅。您可以選擇接受或拒絕非必要 Cookie。
            您也可以在「帳號設定」中隨時調整 Cookie 偏好。
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">5.2 透過瀏覽器設定</h3>
          <p>您也可以透過瀏覽器設定來管理 Cookie：</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Chrome：</strong>設定 → 隱私權和安全性 → Cookie 和其他網站資料</li>
            <li><strong>Firefox：</strong>選項 → 隱私權與安全性 → Cookie 和網站資料</li>
            <li><strong>Safari：</strong>偏好設定 → 隱私權 → Cookie 和網站資料</li>
            <li><strong>Edge：</strong>設定 → Cookie 和網站權限</li>
          </ul>
          <p className="mt-2 text-yellow-700">
            <strong>注意：</strong>如果您關閉所有 Cookie，網站的部分功能可能無法正常運作，
            特別是登入和個人化功能。
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">5.3 刪除 Cookie</h3>
          <p>
            您可以隨時刪除已儲存的 Cookie。刪除後，您需要重新登入，並且一些偏好設定可能會重置。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Cookie 儲存期限</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>會話 Cookie：</strong>僅在瀏覽器關閉前有效</li>
            <li><strong>持久 Cookie：</strong>會保留一段時間（通常為 30 天至 1 年），或直到您手動刪除</li>
            <li><strong>身份驗證 Cookie：</strong>通常保留 7 至 30 天，視安全設定而定</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. 本地儲存（LocalStorage）</h2>
          <p>
            除了 Cookie 外，我們還使用瀏覽器的本地儲存（LocalStorage）來：
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>儲存應用程式狀態（如未儲存的草稿）</li>
            <li>記住您的偏好設定</li>
            <li>提供離線功能（PWA）</li>
            <li>暫存資料以提升效能</li>
          </ul>
          <p className="mt-2">
            本地儲存的資料僅存在於您的裝置上，不會傳送到我們的伺服器（除非您主動上傳資料）。
            您可以透過瀏覽器的開發者工具清除本地儲存。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. 政策變更</h2>
          <p>
            我們可能會不定期更新本 Cookie 政策。重大變更時，我們會透過網站公告或電子郵件通知您。
            持續使用本服務即表示您接受更新後的政策。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. 相關政策</h2>
          <p>
            有關我們如何處理您的個人資料，請參閱我們的
            <Link href="/privacy" className="text-orange-600 hover:text-orange-700"> 隱私權政策</Link>。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. 聯絡我們</h2>
          <p>如對本 Cookie 政策有任何疑問，請透過以下方式聯絡我們：</p>
          <ul className="list-none pl-0 space-y-2">
            <li>電子郵件：
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-orange-600 hover:text-orange-700">{SUPPORT_EMAIL}</a>
            </li>
            <li>意見回饋頁面：<Link href="/feedback" className="text-orange-600 hover:text-orange-700">/feedback</Link></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
