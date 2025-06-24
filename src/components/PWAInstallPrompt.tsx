'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 檢查是否已安裝
    const checkIfInstalled = () => {
      if ('standalone' in window.navigator && window.navigator.standalone) {
        setIsInstalled(true);
        return true;
      }
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    if (checkIfInstalled()) return;

    // 監聽 beforeinstallprompt 事件
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // 檢查是否為iOS Safari
    const isIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };

    const isStandalone = () => {
      return 'standalone' in window.navigator && 
             'standalone' in window.navigator && 
             !!(window.navigator as { standalone?: boolean }).standalone;
    };

    // 如果是iOS且不是standalone模式，顯示iOS特定的安裝提示
    if (isIOS() && !isStandalone()) {
      const hasSeenPrompt = localStorage.getItem('ios-pwa-prompt-seen');
      if (!hasSeenPrompt) {
        setShowIOSPrompt(true);
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('用戶接受了安裝提示');
    } else {
      console.log('用戶拒絕了安裝提示');
    }
    
    setDeferredPrompt(null);
  };

  const handleIOSPromptClose = () => {
    setShowIOSPrompt(false);
    localStorage.setItem('ios-pwa-prompt-seen', 'true');
  };

  if (isInstalled) return null;

  return (
    <>
      {/* Android/Desktop 安裝提示 */}
      {deferredPrompt && (
        <div className="fixed bottom-4 left-4 right-4 bg-emerald-600 text-white p-4 rounded-lg shadow-lg z-50 md:left-auto md:right-4 md:max-w-sm">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-sm">安裝健康管理應用</h3>
              <p className="text-xs mt-1 opacity-90">
                安裝到主屏幕以獲得更好的體驗
              </p>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => setDeferredPrompt(null)}
                className="text-xs px-3 py-1 rounded border border-white/30 hover:bg-white/10"
              >
                稍後
              </button>
              <button
                onClick={handleInstallClick}
                className="text-xs px-3 py-1 rounded bg-white text-emerald-600 hover:bg-gray-100"
              >
                安裝
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Safari 安裝提示 */}
      {showIOSPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full p-6 rounded-t-2xl max-h-96">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                安裝健康管理應用
              </h3>
              <button
                onClick={handleIOSPromptClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                要將此應用安裝到您的主屏幕，請按照以下步驟操作：
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-blue-600">1</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">點擊 Safari 底部的</span>
                    <div className="inline-flex items-center justify-center w-6 h-6 border rounded">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                    <span className="text-sm">分享按鈕</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-blue-600">2</span>
                  </div>
                  <span className="text-sm">
                    在分享選單中找到並點擊「加到主畫面」
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-blue-600">3</span>
                  </div>
                  <span className="text-sm">
                    點擊右上角的「加入」按鈕完成安裝
                  </span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <button
                  onClick={handleIOSPromptClose}
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700"
                >
                  知道了
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstallPrompt; 