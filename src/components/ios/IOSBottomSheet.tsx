'use client';

import { useEffect, useRef } from 'react';

interface IOSBottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  headerContent?: React.ReactNode;
  cancelText?: string;
  confirmText?: string;
  onConfirm?: () => void;
  className?: string;
}

export default function IOSBottomSheet({
  open,
  onClose,
  children,
  title,
  headerContent,
  cancelText = '取消',
  confirmText = '完成',
  onConfirm,
  className = ''
}: IOSBottomSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className={`relative bg-white w-full rounded-t-3xl shadow-xl ${className}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button onClick={onClose} className="text-[#007AFF] font-medium text-lg">
            {cancelText}
          </button>
          <div className="flex-1 min-w-0 text-center">
            {headerContent ? (
              <div className="mx-auto max-w-[85%] text-base sm:text-lg font-semibold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                {headerContent}
              </div>
            ) : (
              <div className="text-base sm:text-lg font-semibold text-gray-900">{title}</div>
            )}
          </div>
          <button
            onClick={() => {
              if (onConfirm) onConfirm();
              else onClose();
            }}
            className="text-[#007AFF] font-medium text-lg"
          >
            {confirmText}
          </button>
        </div>

        {children}

        <div className="flex justify-center pb-4">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>
      </div>
    </div>
  );
}


