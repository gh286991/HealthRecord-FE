'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export default function IOSAlertModal({
  open,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations();
  const defaultTitle = title || t('common.confirm');
  const defaultMessage = message || t('common.confirm');
  const defaultConfirmText = confirmText || t('common.ok');
  const defaultCancelText = cancelText || t('common.cancel');
  
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onCancel} />
      <div className="relative w-[min(92vw,420px)] rounded-3xl bg-white shadow-[0_24px_80px_rgba(0,0,0,.18)] p-6 text-center">
        <div className="text-base font-semibold text-gray-900 mb-2">{defaultTitle}</div>
        <div className="text-sm text-gray-600 mb-5 leading-relaxed whitespace-pre-line">
          {defaultMessage}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium active:scale-95 transition"
            onClick={onCancel}
          >
            {defaultCancelText}
          </button>
          <button
            type="button"
            className="py-2.5 rounded-xl bg-[#0A84FF] hover:bg-[#0a7aeb] text-white font-semibold active:scale-95 transition"
            onClick={onConfirm}
          >
            {defaultConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
}


