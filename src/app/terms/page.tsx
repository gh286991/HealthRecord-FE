import Link from "next/link";

export default async function TermsPage() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://devhealthjapi.zeabur.app';
  let latestVersion: string | null = null;
  let effectiveDate: string | null = null;
  try {
    const resp = await fetch(`${API_BASE_URL}/legal/latest-versions`, { cache: 'no-store' });
    if (resp.ok) {
      const data = await resp.json();
      latestVersion = data?.terms ?? null;
      effectiveDate = data?.termsEffectiveDate ?? null;
    }
  } catch {}
  const formattedDate = effectiveDate ? new Date(effectiveDate).toLocaleDateString('zh-TW') : undefined;
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">服務條款</h1>
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
            <strong>重要提醒：</strong>本條款為基礎範本，建議在正式上線前請專業律師審閱，以確保完全符合台灣消費者保護法及相關法規要求。
          </p>
        </div>
      </div>

      <div className="prose prose-sm max-w-none space-y-6 text-gray-700">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. 接受條款</h2>
          <p>
            歡迎使用 YoungFit（以下簡稱「本服務」）。本服務是由個人開發者提供的健康記錄管理系統。
            當您註冊帳號、使用本服務或進行付費訂閱時，即表示您已閱讀、理解並同意接受本服務條款（以下簡稱「本條款」）的所有內容。
          </p>
          <p>
            如果您不同意本條款的任何內容，請勿使用本服務。我們保留隨時修改本條款的權利，修改後的條款將於網站上公告後生效。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. 服務說明</h2>
          <div className="ml-4">
            <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">2.1 服務內容</h3>
            <div className="ml-4">
              <p>YoungFit 提供以下功能：</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>個人健康記錄管理（飲食、健身、身體指標）</li>
                <li>營養和運動數據分析</li>
                <li>個人化健康目標設定與追蹤</li>
                <li>AI 輔助分析功能（如適用）</li>
                <li>跨裝置同步（PWA 功能）</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">2.2 服務範圍</h3>
            <div className="ml-4">
              <p>
                本服務目前主要服務台灣地區用戶。我們保留在任何時候修改、暫停或終止服務的權利，但會盡可能提前通知用戶。
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. 帳號註冊與使用</h2>
          <div className="ml-4">
            <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">3.1 註冊資格</h3>
            <div className="ml-4">
              <ul className="list-disc pl-6 space-y-1">
                <li>您必須年滿 18 歲，或經父母或監護人同意</li>
                <li>您必須提供真實、準確的資訊</li>
                <li>您不得將帳號轉讓給他人</li>
                <li>您有責任維護帳號資訊的安全和保密</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">3.2 帳號責任</h3>
            <div className="ml-4">
              <p>您對使用帳號進行的所有活動負責。如發現未經授權使用您的帳號，請立即通知我們。</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. 付費服務與訂閱</h2>
          <div className="ml-4">
            <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">4.1 訂閱方案</h3>
            <div className="ml-4">
              <p>本服務提供以下訂閱方案（實際方案以網站顯示為準）：</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li><strong>免費方案：</strong>提供基本功能</li>
                <li><strong>月費方案：</strong>提供完整功能，按月計費並自動續約</li>
                <li><strong>年費方案：</strong>提供完整功能，按年計費並自動續約</li>
                <li><strong>贊助方案：</strong>一次性付款支持開發</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">4.2 付款方式</h3>
            <div className="ml-4">
              <p>
                我們支援信用卡、金融卡及其他第三方支付服務（如藍新金流、綠界科技等）。
                付款資訊由第三方支付服務商處理，我們不會儲存您的完整信用卡資訊。
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">4.3 自動續約</h3>
            <div className="ml-4">
              <p>
                <strong>月費和年費訂閱會自動續約。</strong>訂閱將在每個計費週期結束時自動續約，
                除非您在計費日期前至少 24 小時取消訂閱。
              </p>
              <p>
                您可以在帳號設定中隨時取消自動續約。取消後，您仍可使用已付費期間的服務，
                但到期後不會自動續約。
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">4.4 價格變更</h3>
            <div className="ml-4">
              <p>
                我們保留隨時調整訂閱價格的權利。現有訂閱用戶的價格變更將在下次續約時生效，
                我們會提前至少 30 天通知您。
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. 退款政策</h2>
          <div className="ml-4">
            <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">5.1 七天鑑賞期</h3>
            <div className="ml-4">
              <p>
                根據台灣消費者保護法，您享有 <strong>七天鑑賞期</strong>。
                自訂閱生效日起 7 天內，您可以申請全額退款，無需說明理由。
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">5.2 退款申請</h3>
            <div className="ml-4">
              <ul className="list-disc pl-6 space-y-1">
                <li>透過 <a href="mailto:service@youngfit.app" className="text-orange-600 hover:text-orange-700">service@youngfit.app</a> 發送退款申請</li>
                <li>請提供訂閱資訊（訂單編號或付款證明）</li>
                <li>我們會在收到申請後 7 個工作天內處理退款</li>
                <li>退款將退回到原付款方式</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">5.3 取消訂閱</h3>
            <div className="ml-4">
              <p>
                您可以隨時在帳號設定中取消訂閱。取消後不會立即停止服務，
                您可以使用已付費期間的服務直到計費週期結束。
              </p>
              <p>
                <strong>取消步驟：</strong>
              </p>
              <ol className="list-decimal pl-6 space-y-1 mt-2">
                <li>登入您的帳號</li>
                <li>前往「帳號設定」或「訂閱管理」</li>
                <li>點擊「取消訂閱」或「停止自動續約」</li>
                <li>確認取消操作</li>
              </ol>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">5.4 特殊情況</h3>
            <div className="ml-4">
              <p>以下情況可能不適用全額退款：</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>超過 7 天鑑賞期</li>
                <li>因違反服務條款而被終止服務（不退費）</li>
                <li>技術問題已妥善解決（依情況部分退費）</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. 使用規範</h2>
          <div className="ml-4">
            <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">6.1 允許行為</h3>
            <div className="ml-4">
              <p>您可以使用本服務進行：</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>個人健康記錄管理</li>
                <li>合理範圍內的資料備份和匯出</li>
                <li>分享您的使用心得（如適用）</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">6.2 禁止行為</h3>
            <div className="ml-4">
              <p>您不得：</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>嘗試破解、逆向工程或干擾服務的正常運作</li>
                <li>使用自動化工具大量存取服務（除非經我們同意）</li>
                <li>上傳惡意軟體、病毒或有害程式碼</li>
                <li>侵犯他人的智慧財產權或隱私權</li>
                <li>使用服務從事非法活動</li>
                <li>未經授權存取他人的帳號或資料</li>
                <li>進行任何可能損害服務或他人權益的行為</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. 智慧財產權</h2>
          <div className="ml-4">
            <p>
              本服務的所有內容，包括但不限於文字、圖形、標誌、圖標、軟體、程式碼、資料庫設計等，
              均為我們或授權方的智慧財產，受台灣和國際智慧財產權法保護。
            </p>
            <p>
              您僅獲得使用本服務的權利，不得複製、修改、散布、出售或租賃本服務的任何部分。
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. 免責聲明</h2>
          <div className="ml-4">
            <p className="font-semibold text-red-600">
              <strong>重要：本服務僅提供健康記錄管理工具，不提供醫療診斷、治療建議或醫療諮詢。</strong>
            </p>
            <p>我們不保證：</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>服務將永久不間斷、無錯誤地運作</li>
              <li>服務的結果完全準確或符合您的期望</li>
              <li>服務適合所有用途</li>
              <li>第三方服務的可用性和正確性</li>
            </ul>
            <p>
              在任何情況下，我們不對因使用或無法使用本服務而產生的任何直接、間接、偶然、特殊或後續損害負責，
              包括但不限於資料遺失、利潤損失、業務中斷等。
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. 服務變更與終止</h2>
          <div className="ml-4">
            <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">9.1 服務變更</h3>
            <div className="ml-4">
              <p>
                我們保留隨時修改、暫停或終止部分或全部服務的權利。重大變更時，我們會提前通知用戶。
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">9.2 帳號終止</h3>
            <div className="ml-4">
              <p>以下情況我們可能終止您的帳號：</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>您違反本服務條款</li>
                <li>您長時間未使用帳號（如超過 2 年）</li>
                <li>法律要求或法院命令</li>
              </ul>
              <p>
                帳號終止後，您將無法存取帳號和其中的資料。我們會在合理範圍內協助您匯出資料。
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">9.3 用戶終止</h3>
            <div className="ml-4">
              <p>
                您可以隨時在帳號設定中要求刪除帳號。刪除後，您的資料將在 30 天內從活躍資料庫中移除。
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. 隱私權</h2>
          <div className="ml-4">
            <p>
              我們如何處理您的個人資料，請參閱我們的
              <Link href="/privacy" className="text-orange-600 hover:text-orange-700"> 隱私權政策</Link>。
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. 爭議處理與法律適用</h2>
          <div className="ml-4">
            <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">11.1 爭議解決</h3>
            <div className="ml-4">
              <p>
                如因本條款或服務使用產生爭議，雙方應本於誠信原則協商解決。
                如無法協商解決，應依台灣相關法律處理。
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">11.2 管轄法院</h3>
            <div className="ml-4">
              <p>因本條款產生之訴訟，雙方同意以台灣台北地方法院為第一審管轄法院。</p>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">11.3 法律適用</h3>
            <div className="ml-4">
              <p>本條款之解釋與適用，均依中華民國法律。</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. 其他條款</h2>
          <div className="ml-4">
            <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">12.1 完整協議</h3>
            <div className="ml-4">
              <p>
                本條款與隱私權政策構成您與我們之間關於使用本服務的完整協議。
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">12.2 條款可分性</h3>
            <div className="ml-4">
              <p>
                如本條款的任何條款被認定為無效或不可執行，其餘條款仍應有效。
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">12.3 權利放棄</h3>
            <div className="ml-4">
              <p>
                我們未執行本條款的任何權利不構成對該權利的放棄。
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">13. 聯絡我們</h2>
          <div className="ml-4">
            <p>如對本服務條款有任何疑問，請透過以下方式聯絡我們：</p>
            <ul className="list-none pl-0 space-y-2 mt-2">
              <li>電子郵件：<a href="mailto:service@youngfit.app" className="text-orange-600 hover:text-orange-700">service@youngfit.app</a></li>
              <li>意見回饋頁面：<Link href="/feedback" className="text-orange-600 hover:text-orange-700">/feedback</Link></li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
