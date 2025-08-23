'use client';

import React from 'react';

type AppBackBarProps = {
  onBack: () => void;
  label?: string;
  className?: string;
  showLabel?: boolean; // 是否顯示文字標籤（預設僅圖示）
};

export default function AppBackBar({ onBack, label = '返回', className, showLabel = false }: AppBackBarProps) {
  return (
    <div className={`fixed top-3 left-4 z-30 ${className ?? ''}`}>
      <button
        type="button"
        onClick={onBack}
        className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-white/90 backdrop-blur border border-gray-200 shadow-md text-gray-700 hover:bg-white active:scale-95 transition"
        aria-label={label}
     >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {showLabel ? (
          <span className="ml-1 text-xs">{label}</span>
        ) : (
          <span className="sr-only">{label}</span>
        )}
      </button>
    </div>
  );
}


