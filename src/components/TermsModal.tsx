'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { X, ChevronRight } from 'lucide-react';
import MarkdownArticle from '@/components/legal/MarkdownArticle';
import { API_BASE_URL } from '@/lib/api';

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
  // 後端最新版本內容
  const [loading, setLoading] = useState(false);
  const [termsMd, setTermsMd] = useState<string | null>(null);
  const [termsHtml, setTermsHtml] = useState<string | null>(null);
  const [termsVersion, setTermsVersion] = useState<string | null>(null);
  const [termsEffective, setTermsEffective] = useState<string | null>(null);
  const [termsHeading, setTermsHeading] = useState<string | null>(null);
  const [privacyMd, setPrivacyMd] = useState<string | null>(null);
  const [privacyHtml, setPrivacyHtml] = useState<string | null>(null);
  const [privacyVersion, setPrivacyVersion] = useState<string | null>(null);
  const [privacyEffective, setPrivacyEffective] = useState<string | null>(null);
  const [privacyHeading, setPrivacyHeading] = useState<string | null>(null);

  // 去除內容中的第一個 H1，避免與上方標題重複
  const stripTopHeadingMd = (md?: string | null) => {
    if (!md) return md ?? undefined;
    // 移除 Markdown 型式的第一個 H1（ATX 風格）
    let out = md.replace(/^#\s+.*\n+/m, '');
    // 移除 Setext 風格的 H1（第一行 + ====
    out = out.replace(/^([^\n]+)\n=+\n+/, '');
    return out;
  };
  const stripTopHeadingHtml = (html?: string | null) => {
    if (!html) return html ?? undefined;
    return html.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '');
  };
  
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
      // 載入後端最新的條款/隱私內容
      (async () => {
        try {
          setLoading(true);
          const metaResp = await fetch(`${API_BASE_URL}/legal/latest-versions`, { cache: 'no-store' });
          if (metaResp.ok) {
            const meta = await metaResp.json();
            if (meta?.terms) {
              setTermsVersion(meta.terms);
              setTermsEffective(meta?.termsEffectiveDate || null);
              try {
                const d = await fetch(`${API_BASE_URL}/legal/doc/terms/${meta.terms}`, { cache: 'no-store' }).then(r => r.ok ? r.json() : null);
                const md = d?.contentMd ?? null;
                setTermsMd(md);
                setTermsHtml(d?.contentHtml ?? null);
                if (md) {
                  const m = md.match(/^#\s+(.+)$/m);
                  if (m) {
                    const raw = m[1].trim();
                    const text = raw.replace(/[*_`]/g, '').replace(/<[^>]+>/g, '');
                    setTermsHeading(text);
                  }
                }
              } catch {}
            }
            if (meta?.privacy) {
              setPrivacyVersion(meta.privacy);
              setPrivacyEffective(meta?.privacyEffectiveDate || null);
              try {
                const d = await fetch(`${API_BASE_URL}/legal/doc/privacy/${meta.privacy}`, { cache: 'no-store' }).then(r => r.ok ? r.json() : null);
                const md = d?.contentMd ?? null;
                setPrivacyMd(md);
                setPrivacyHtml(d?.contentHtml ?? null);
                if (md) {
                  const m = md.match(/^#\s+(.+)$/m);
                  if (m) {
                    const raw = m[1].trim();
                    const text = raw.replace(/[*_`]/g, '').replace(/<[^>]+>/g, '');
                    setPrivacyHeading(text);
                  }
                }
              } catch {}
            }
          }
        } finally {
          setLoading(false);
        }
      })();
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
              <div className="flex items-end gap-3 flex-wrap mb-1">
                <h2 className="text-2xl font-semibold text-gray-900">{termsHeading || '使用者條款（Terms of Service）'}</h2>
                {termsVersion && (
                  <span className="text-xs text-gray-600 pb-0.5">版本：{termsVersion}</span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">最後更新日期：{termsEffective ? new Date(termsEffective).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</p>
              {loading && !termsMd && !termsHtml ? (
                <p className="text-sm text-gray-500">正在載入最新條款內容…</p>
              ) : (
                <MarkdownArticle
                  content={stripTopHeadingMd(termsMd)}
                  html={termsMd ? undefined : stripTopHeadingHtml(termsHtml)}
                  suppressTopHeading
                />
              )}
              <div className="text-center py-4 text-sm text-gray-500 border-t border-gray-100 mt-4 pt-4">
                如需查看完整條款，請訪問 <Link href="/terms/latest" className="text-orange-600 hover:text-orange-700">服務條款頁面</Link>
              </div>
            </div>
            ) : (
              <div className="prose prose-sm max-w-none text-gray-700">
                <div className="flex items-end gap-3 flex-wrap mb-1">
                  <h2 className="text-2xl font-semibold text-gray-900">{privacyHeading || '隱私權政策（Privacy Policy）'}</h2>
                  {privacyVersion && (
                    <span className="text-xs text-gray-600 pb-0.5">版本：{privacyVersion}</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-4">最後更新日期：{privacyEffective ? new Date(privacyEffective).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</p>
                {loading && !privacyMd && !privacyHtml ? (
                  <p className="text-sm text-gray-500">正在載入最新隱私內容…</p>
                ) : (
                  <MarkdownArticle
                    content={stripTopHeadingMd(privacyMd)}
                    html={privacyMd ? undefined : stripTopHeadingHtml(privacyHtml)}
                    suppressTopHeading
                  />
                )}
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
 
