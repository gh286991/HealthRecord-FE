'use client';

import { useState, useEffect } from 'react';

export default function LocalModeNotice() {
  const [recordCount, setRecordCount] = useState(0);
  const [showNotice, setShowNotice] = useState(true);

  useEffect(() => {
    const updateCount = () => {
      const data = localStorage.getItem('nutrition-records');
      if (data) {
        try {
          const records = JSON.parse(data);
          setRecordCount(records.length);
        } catch (error) {
          console.error('Error parsing local nutrition records:', error);
          setRecordCount(0);
        }
      } else {
        setRecordCount(0);
      }
    };
    
    updateCount();
    
    // 監聽 storage 事件以即時更新計數
    window.addEventListener('storage', updateCount);
    
    // 設定定時器定期檢查（以防本地更新未觸發 storage 事件）
    const interval = setInterval(updateCount, 1000);
    
    return () => {
      window.removeEventListener('storage', updateCount);
      clearInterval(interval);
    };
  }, []);

  if (!showNotice) return null;

  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-amber-800">
            本地模式提醒
          </h3>
          <div className="mt-2 text-sm text-amber-700">
            <p>
              🔧 目前 API 服務器的飲食紀錄端點尚未實現，應用程式正在本地模式下運行。
              您的數據將暫時保存在瀏覽器的本地存儲中。
            </p>
            {recordCount > 0 && (
              <p className="mt-2">
                📱 您已有 {recordCount} 筆本地紀錄。
                當 API 完全實現後，您可以手動遷移這些數據。
              </p>
            )}
          </div>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={() => setShowNotice(false)}
              className="inline-flex bg-amber-50 rounded-md p-1.5 text-amber-500 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-amber-50 focus:ring-amber-600"
            >
              <span className="sr-only">關閉</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 