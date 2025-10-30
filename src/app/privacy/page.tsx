export default async function PrivacyPage() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://devhealthjapi.zeabur.app';
  let latestVersion: string | null = null;
  let effectiveDate: string | null = null;
  try {
    const resp = await fetch(`${API_BASE_URL}/legal/latest-versions`, { cache: 'no-store' });
    if (resp.ok) {
      const data = await resp.json();
      latestVersion = data?.privacy ?? null;
      effectiveDate = data?.privacyEffectiveDate ?? null;
    }
  } catch {}
  const formattedDate = effectiveDate ? new Date(effectiveDate).toLocaleDateString('zh-TW') : undefined;
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">隱私權政策</h1>
        <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
          {latestVersion && (
            <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
              版本：{latestVersion}
            </span>
          )}
          <p>最後更新日期：{formattedDate ?? '—'}</p>
        </div>
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>重要提醒：</strong>本政策為基礎範本，建議在正式上線前請專業律師審閱，以確保完全符合台灣個人資料保護法及相關法規要求。
          </p>
        </div>
      </div>

      <div className="prose prose-sm max-w-none space-y-6 text-gray-700">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. 簡介</h2>
          <p>
            YoungFit（以下簡稱「本服務」）是由個人開發者提供的健康記錄管理系統。我們非常重視您的隱私權，本隱私權政策說明我們如何收集、使用、儲存和保護您的個人資料。
          </p>
          <p>
            使用本服務即表示您同意本隱私權政策的內容。如果您不同意本政策，請勿使用本服務。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. 資料收集類型</h2>
          <p>我們會收集以下類型的資料：</p>
          <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">2.1 註冊資訊</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>用戶名稱</li>
            <li>電子郵件地址</li>
            <li>密碼（經加密處理）</li>
            <li>個人資料（如姓名、性別、生日等，選填）</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">2.2 健康數據（敏感資料）</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>飲食記錄（餐點、營養成分、照片）</li>
            <li>健身記錄（運動類型、強度、時間）</li>
            <li>身體記錄（身高、體重、健康指標）</li>
            <li>健康目標和偏好設定</li>
          </ul>
          <p className="mt-2">
            <strong>特別說明：</strong>健康數據屬於個人資料保護法規定的敏感資料，我們會採取特別嚴格的保護措施。
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">2.3 使用資料</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>使用習慣和行為數據（透過 Cookie 和本地儲存）</li>
            <li>設備資訊（瀏覽器類型、作業系統）</li>
            <li>IP 位址（用於安全防護）</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. 資料使用目的</h2>
          <p>我們使用您的資料用於以下目的：</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>提供和改善本服務的功能</li>
            <li>個人化您的使用體驗</li>
            <li>分析和統計使用情況（匿名化處理）</li>
            <li>保障服務安全，防止詐欺和濫用</li>
            <li>發送重要服務通知（如帳號安全、服務變更）</li>
            <li>回應您的詢問和提供客戶服務</li>
          </ul>
          <p className="mt-4">
            <strong>我們不會：</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>將您的個人資料出售給第三方</li>
            <li>將您的健康數據用於廣告或行銷目的</li>
            <li>未經您同意將資料提供給第三方（除法律要求外）</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. 資料儲存與安全</h2>
          <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">4.1 儲存地點</h3>
          <p>您的資料儲存於我們使用的雲端服務提供商的伺服器上，主要位於台灣或您使用服務時所在的區域。</p>

          <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">4.2 安全措施</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>使用 HTTPS 加密傳輸所有資料</li>
            <li>密碼經 bcrypt 加密處理，無法還原</li>
            <li>資料庫存取控制和安全防護</li>
            <li>定期安全檢查和更新</li>
            <li>備份機制確保資料不遺失</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">4.3 資料保留期限</h3>
          <p>我們會保留您的資料直到您刪除帳號或要求刪除資料為止。刪除帳號後，我們會於 30 天內從活躍資料庫中移除您的資料，部分資料可能會在備份中保留一段時間以符合法律要求。</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. 資料分享與第三方服務</h2>
          <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">5.1 第三方服務</h3>
          <p>本服務可能使用以下第三方服務：</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>雲端服務提供商（用於資料儲存）</li>
            <li>身份驗證服務（如 Google OAuth）</li>
            <li>支付處理服務（如適用，用於訂閱付款）</li>
          </ul>
          <p className="mt-2">
            這些服務提供商僅根據我們的指示處理資料，不會將您的資料用於其他目的。
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">5.2 法律要求</h3>
          <p>
            在法律要求、法院命令或政府機關依法要求的情況下，我們可能需要提供您的資料。我們會盡可能通知您此類要求（在法律允許的範圍內）。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. 您的權利</h2>
          <p>根據台灣個人資料保護法，您享有以下權利：</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>查詢權：</strong>您可以要求我們提供您的個人資料副本</li>
            <li><strong>更正權：</strong>您可以更正不完整的資料</li>
            <li><strong>刪除權：</strong>您可以要求刪除您的資料</li>
            <li><strong>撤回同意權：</strong>您可以隨時撤回您對資料處理的同意</li>
            <li><strong>資料攜帶權：</strong>您可以要求以可攜格式匯出您的資料</li>
          </ul>
          <p className="mt-4">
            如需行使上述權利，請透過 <a href="mailto:service@youngfit.app" className="text-orange-600 hover:text-orange-700">service@youngfit.app</a> 聯絡我們。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Cookie 與追蹤技術</h2>
          <p>
            我們使用 Cookie 和類似技術來提供、改善和個人化我們的服務。詳細資訊請參閱我們的
            <a href="/cookies" className="text-orange-600 hover:text-orange-700"> Cookie 政策</a>。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. 兒童隱私保護</h2>
          <p>
            本服務主要提供給 18 歲以上的成年人使用。如果您未滿 18 歲，請在父母或監護人同意下使用本服務。
            我們不會明知而收集未滿 18 歲兒童的個人資料。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. 政策變更</h2>
          <p>
            我們可能會不定期更新本隱私權政策。重大變更時，我們會透過電子郵件或服務內通知您。
            持續使用本服務即表示您接受更新後的政策。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. 免責聲明</h2>
          <p className="font-semibold text-red-600">
            <strong>重要：本服務僅提供健康記錄管理功能，不提供醫療診斷、治療建議或醫療諮詢。</strong>
          </p>
          <p>
            本服務中的任何資訊、數據分析或建議都不應取代專業醫療建議。在做出任何健康相關決定前，請務必諮詢合格的醫療專業人員。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. 聯絡我們</h2>
          <p>如對本隱私權政策有任何疑問或意見，請透過以下方式聯絡我們：</p>
          <ul className="list-none pl-0 space-y-2">
            <li>電子郵件：<a href="mailto:service@youngfit.app" className="text-orange-600 hover:text-orange-700">service@youngfit.app</a></li>
            <li>意見回饋頁面：<a href="/feedback" className="text-orange-600 hover:text-orange-700">/feedback</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
