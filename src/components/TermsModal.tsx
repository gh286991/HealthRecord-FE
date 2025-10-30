'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { X, ChevronRight } from 'lucide-react';

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export default function TermsModal({ open, onClose, onAccept }: TermsModalProps) {
  // 流程狀態：terms -> privacy -> done
  const [currentStep, setCurrentStep] = useState<'terms' | 'privacy'>('terms');
  const [termsRead, setTermsRead] = useState(false);
  const [privacyRead, setPrivacyRead] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);

  // 檢查是否滾動到底部
  const checkScrollBottom = () => {
    if (!scrollRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50; // 允許 50px 的誤差
    setIsScrolledToBottom(isAtBottom);
  };

  // 當切換步驟時，重置滾動
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
      setIsScrolledToBottom(false);
    }
  }, [currentStep]);

  // 監聽滾動事件
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement || !open) return;

    scrollElement.addEventListener('scroll', checkScrollBottom);
    // 初始檢查
    checkScrollBottom();

    return () => {
      scrollElement.removeEventListener('scroll', checkScrollBottom);
    };
  }, [currentStep, open]);

  // 重置狀態當 Modal 開啟
  useEffect(() => {
    if (open) {
      setCurrentStep('terms');
      setTermsRead(false);
      setPrivacyRead(false);
      setIsScrolledToBottom(false);
    }
  }, [open]);

  // 處理「下一步」按鈕
  const handleNext = () => {
    if (currentStep === 'terms') {
      if (isScrolledToBottom) {
        setTermsRead(true);
        setCurrentStep('privacy');
      }
    }
  };

  // 處理「確認」按鈕
  const handleConfirm = () => {
    if (currentStep === 'privacy' && isScrolledToBottom) {
      setPrivacyRead(true);
      onAccept();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal 內容 */}
      <div className="relative w-[min(95vw,600px)] max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* 標題列 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                termsRead ? 'bg-green-100 text-green-700' : 
                currentStep === 'terms' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                服務條款 {termsRead && '✓'}
              </div>
              <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                privacyRead ? 'bg-green-100 text-green-700' : 
                currentStep === 'privacy' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                隱私權政策 {privacyRead && '✓'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="關閉"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 滾動內容區域 */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-6 py-4"
          >
            {currentStep === 'terms' ? (
            <div className="prose prose-sm max-w-none text-gray-700">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">服務條款</h2>
              <p className="text-sm text-gray-600 mb-6">最後更新日期：2024年12月</p>
              
              <section className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">1. 接受條款</h3>
                <p className="mb-4">
                  歡迎使用 YoungFit（以下簡稱「本服務」）。本服務是由個人開發者提供的健康記錄管理系統。
                  當您註冊帳號、使用本服務或進行付費訂閱時，即表示您已閱讀、理解並同意接受本服務條款的所有內容。
                </p>
              </section>

              <section className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">2. 服務說明</h3>
                <p className="mb-4">
                  YoungFit 提供個人健康記錄管理功能，包括飲食、健身、身體指標記錄與分析。
                  本服務目前主要服務台灣地區用戶。
                </p>
              </section>

              <section className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">3. 付費服務與訂閱</h3>
                <p className="mb-2">本服務提供以下訂閱方案：</p>
                <ul className="list-disc pl-6 space-y-1 mb-4">
                  <li><strong>免費方案：</strong>提供基本功能</li>
                  <li><strong>月費/年費方案：</strong>提供完整功能，自動續約</li>
                </ul>
                <p className="mb-2">
                  <strong>自動續約：</strong>訂閱將自動續約，除非您在計費日期前至少 24 小時取消。
                </p>
                <p className="mb-4">
                  <strong>退款政策：</strong>根據台灣消費者保護法，您享有七天鑑賞期，可申請全額退款。
                </p>
              </section>

              <section className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">4. 免責聲明</h3>
                <p className="font-semibold text-red-600 mb-4">
                  <strong>重要：本服務僅提供健康記錄管理工具，不提供醫療診斷、治療建議或醫療諮詢。</strong>
                  在做出任何健康相關決定前，請務必諮詢合格的醫療專業人員。
                </p>
              </section>

              <section className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">5. 其他條款</h3>
                <p className="mb-4">
                  本條款與隱私權政策構成您與我們之間關於使用本服務的完整協議。
                  如本條款的任何條款被認定為無效或不可執行，其餘條款仍應有效。
                </p>
                <p className="mb-4">
                  如因本條款產生爭議，雙方同意以台灣台北地方法院為第一審管轄法院。
                </p>
              </section>

              <div className="text-center py-4 text-sm text-gray-500 border-t border-gray-100 mt-4 pt-4">
                如需查看完整條款，請訪問 <Link href="/terms/latest" className="text-orange-600 hover:text-orange-700">服務條款頁面</Link>
              </div>
            </div>
            ) : (
              <div className="prose prose-sm max-w-none text-gray-700">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">隱私權政策</h2>
                <p className="text-sm text-gray-600 mb-6">最後更新日期：2024年12月</p>
              
              <section className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">1. 資料收集類型</h3>
                <p className="mb-2">我們會收集以下類型的資料：</p>
                <ul className="list-disc pl-6 space-y-1 mb-4">
                  <li>註冊資訊（用戶名、電子郵件、密碼）</li>
                  <li>健康數據（飲食記錄、健身記錄、身體指標）</li>
                  <li>使用資料（透過 Cookie 和本地儲存）</li>
                </ul>
                <p className="text-red-600 font-semibold">
                  <strong>特別說明：</strong>健康數據屬於敏感資料，我們會採取特別嚴格的保護措施。
                </p>
              </section>

              <section className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">2. 資料使用目的</h3>
                <p className="mb-2">我們使用您的資料用於：</p>
                <ul className="list-disc pl-6 space-y-1 mb-4">
                  <li>提供和改善本服務的功能</li>
                  <li>個人化您的使用體驗</li>
                  <li>保障服務安全，防止詐欺和濫用</li>
                </ul>
                <p className="font-semibold">我們不會將您的個人資料出售給第三方。</p>
              </section>

              <section className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">3. 資料安全</h3>
                <p className="mb-4">
                  我們使用 HTTPS 加密傳輸所有資料，密碼經加密處理，並實施資料庫存取控制和安全防護措施。
                </p>
              </section>

              <section className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">4. 您的權利</h3>
                <p className="mb-2">根據台灣個人資料保護法，您享有以下權利：</p>
                <ul className="list-disc pl-6 space-y-1 mb-4">
                  <li>查詢權：要求提供個人資料副本</li>
                  <li>更正權：更正不完整的資料</li>
                  <li>刪除權：要求刪除資料</li>
                  <li>撤回同意權：隨時撤回對資料處理的同意</li>
                </ul>
                <p>如需行使上述權利，請透過 service@youngfit.app 聯絡我們。</p>
              </section>

                <div className="text-center py-4 text-sm text-gray-500 border-t border-gray-100 mt-4 pt-4">
                  如需查看完整政策，請訪問 <Link href="/privacy/latest" className="text-orange-600 hover:text-orange-700">隱私權政策頁面</Link>
                </div>
              </div>
            )}
          </div>

          {/* 滾動提示 - 固定在滾動區域底部 */}
          {!isScrolledToBottom && (
            <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/95 to-transparent py-3 px-6 pointer-events-none">
              <div className="text-center">
                <p className="text-sm text-gray-500">請繼續往下捲動閱讀完整內容</p>
                <div className="animate-bounce mt-1 text-gray-400">↓</div>
              </div>
            </div>
          )}
        </div>

        {/* 底部按鈕列 */}
        <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            {currentStep === 'terms' ? (
              <button
                onClick={handleNext}
                disabled={!isScrolledToBottom}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  isScrolledToBottom
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                下一步：隱私權政策
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleConfirm}
                disabled={!isScrolledToBottom}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  isScrolledToBottom
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                我已閱讀並同意
              </button>
            )}
          </div>
          {!isScrolledToBottom && (
            <p className="text-xs text-gray-400 text-center mt-2">
              請滾動至底部以確認您已閱讀完整{currentStep === 'terms' ? '服務條款' : '隱私權政策'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
