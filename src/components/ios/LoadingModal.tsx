'use client';

import { FC } from 'react';

interface LoadingModalProps {
  open: boolean;
  message?: string;
}

const LoadingModal: FC<LoadingModalProps> = ({ 
  open, 
  message = '讀取中...' 
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景模糊層 */}
      <div className="absolute inset-0 bg-transparent backdrop-blur-md"></div>

      {/* Modal 內容 */}
      <div className="relative z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-lg rounded-2xl w-48 h-48 shadow-2xl">
        {/* Spinner 動畫 */}
        <svg 
          className="animate-spin h-10 w-10 text-blue-600"
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          ></circle>
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p className="mt-4 text-gray-700 font-medium text-center">{message}</p>
      </div>
    </div>
  );
};

export default LoadingModal;
