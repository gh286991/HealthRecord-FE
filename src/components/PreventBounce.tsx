'use client';

import { useEffect } from 'react';

export default function PreventBounce() {
  useEffect(() => {
    // 只用 CSS 來防止橡皮筋效果，不阻止正常滾動
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overscrollBehavior = 'none';
    
    // 防止雙指縮放
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });

    // 清理函數
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      // 恢復原始樣式
      document.body.style.overscrollBehavior = '';
      document.documentElement.style.overscrollBehavior = '';
    };
  }, []);

  return null;
}